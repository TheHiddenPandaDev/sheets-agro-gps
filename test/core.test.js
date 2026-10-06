import { describe, it, expect } from 'vitest';
import core from '../src/core.js';

const SHERPA = {
  registration_number: '25421', name: 'SHERPA 100 EW', holder: 'SBM', status: 'Vigente', expires_on: '2027-12-31',
  substances: [{ name: 'Cypermethrin', local_name: 'Cipermetrin', concentration: '10 %' }, { name: 'X' }],
  authorisation: { state: 'authorised', level: 'green' },
  uses: [
    { crop: 'Algodonero', crop_code: 'GOSHI', target: 'Pulgones', dose_min: 0.3, dose_max: 0, dose_unit: 'l/ha', safety_days: 14, conditions: 'SPe 3 10 m' },
    { crop: 'Trigo', crop_code: 'TRZAX', target: 'Pulgones', dose_min: 0.2, dose_max: 0.3, dose_unit: 'l/ha', safety_days: null, max_applications: 2, interval_days: 14 },
  ],
};

function response(status, body) {
  return { status, text: typeof body === 'string' ? body : JSON.stringify(body) };
}

function fakeTransport(handler) {
  const calls = [];
  return {
    calls,
    fetchAll(requests) {
      calls.push(requests);
      return requests.map(handler);
    },
  };
}

function memoryCache() {
  const store = {};
  return { store, get: (k) => store[k] || null, put: (k, v) => { store[k] = v; } };
}

describe('locale and normalisation', () => {
  it('falls back to English and keeps supported languages', () => {
    expect(core.agroLocale('de-AT')).toBe('de');
    expect(core.agroLocale('ja')).toBe('en');
    expect(core.agroLocale(null)).toBe('en');
    expect(core.agroT('es', 'authorised')).toBe('Autorizado');
    expect(core.agroT('es', 'unknownKey')).toBe('unknownKey');
  });

  it('every language has the same keys as English', () => {
    const keys = Object.keys(core.AGRO_MESSAGES.en).sort();
    for (const [code, strings] of Object.entries(core.AGRO_MESSAGES)) {
      expect(Object.keys(strings).sort(), code).toEqual(keys);
    }
  });

  it('normalises countries and registrations', () => {
    expect(core.agroNormalizeCountry('')).toBe('ES');
    expect(core.agroNormalizeCountry(' uk ')).toBe('GB');
    expect(core.agroNormalizeCountry('el')).toBe('GR');
    expect(core.agroNormalizeCountry('de')).toBe('DE');
    expect(core.agroNormalizeRegistration(25421)).toBe('25421');
    expect(() => core.agroNormalizeRegistration('  ')).toThrow(core.AgroError);
    expect(() => core.agroNormalizeRegistration('x'.repeat(41))).toThrow('errTooLong');
  });

  it('builds encoded URLs', () => {
    expect(core.agroProductUrl('024675-00', 'DE')).toBe('https://api.agrogps.eu/api/public/phyto/024675-00?country=DE');
    expect(core.agroProductUrl('2015/12 a', 'FR')).toContain('2015%2F12%20a');
    expect(core.agroSearchUrl('karate zeon', 'DE')).toBe('https://api.agrogps.eu/api/public/phyto/?q=karate%20zeon&country=DE');
    expect(core.agroSiteUrl('es')).toBe('https://agrogps.eu/');
    expect(core.agroSiteUrl('de')).toBe('https://agrogps.eu/de/');
  });
});

describe('response handling', () => {
  it('maps API errors to messages', () => {
    expect(core.agroErrorKeyFor(response(404, { code: 'FIT_404' }))).toBe('errNotFound');
    expect(core.agroErrorKeyFor(response(404, { code: 'FIT_405' }))).toBe('errNoRegister');
    expect(core.agroErrorKeyFor(response(429, 'slow down'))).toBe('errRateLimited');
    expect(core.agroErrorKeyFor(response(404, 'nope'))).toBe('errNotFound');
    expect(core.agroErrorKeyFor(response(400, {}))).toBe('errBadRequest');
    expect(core.agroErrorKeyFor(response(500, {}))).toBe('errUnavailable');
    expect(core.agroErrorKeyFor({ thrown: new Error('x') })).toBe('errUnavailable');
    expect(core.agroErrorKeyFor(null)).toBe('errUnavailable');
  });

  it('parses data or throws the right error', () => {
    expect(core.agroParse(response(200, { data: SHERPA })).name).toBe('SHERPA 100 EW');
    expect(() => core.agroParse(response(200, '{bad'))).toThrow('errUnavailable');
    expect(() => core.agroParse(response(200, {}))).toThrow('errUnavailable');
    expect(() => core.agroParse(response(404, { code: 'FIT_404' }))).toThrow('errNotFound');
  });
});

describe('service', () => {
  it('fetches missing products in one batch and caches them', () => {
    const transport = fakeTransport((req) => (req.url.includes('/25421') ? response(200, { data: SHERPA }) : response(404, { code: 'FIT_404' })));
    const cache = memoryCache();
    const service = core.agroCreateService({ transport, cache });

    const first = service.products(['25421', '999'], 'es');
    const second = service.products(['25421'], 'ES');

    expect(first[0].data.name).toBe('SHERPA 100 EW');
    expect(first[1].error).toBe('errNotFound');
    expect(second[0].data.name).toBe('SHERPA 100 EW');
    expect(transport.calls).toHaveLength(1);
    expect(transport.calls[0][0].headers['User-Agent']).toContain('agrogps-sheets');
    expect(Object.keys(cache.store)).toEqual(['agro1:p:ES:25421']);
  });

  it('ignores a corrupt cache entry and skips caching huge answers', () => {
    const big = { ...SHERPA, uses: [{ conditions: 'x'.repeat(core.AGRO_CACHE_MAX_CHARS) }] };
    const transport = fakeTransport(() => response(200, { data: big }));
    const cache = memoryCache();
    cache.store['agro1:p:ES:1'] = '{corrupt';
    const service = core.agroCreateService({ transport, cache });

    expect(service.product('1', 'ES').name).toBe('SHERPA 100 EW');
    expect(cache.store['agro1:p:ES:1']).toBe('{corrupt');
  });

  it('works without a cache and throws on product errors', () => {
    const service = core.agroCreateService({ transport: fakeTransport(() => response(404, { code: 'FIT_405' })) });
    expect(() => service.product('1', 'XX')).toThrow('errNoRegister');
  });

  it('searches by name with a minimum length', () => {
    const transport = fakeTransport(() => response(200, { data: { matches: [{ registration_number: '1', name: 'Karate' }] } }));
    const service = core.agroCreateService({ transport });
    expect(service.search('Karate', 'DE')).toHaveLength(1);
    expect(transport.calls[0][0].url).toContain('q=Karate&country=DE');
    expect(() => service.search('ka', 'DE')).toThrow('errShortSearch');
    expect(() => core.agroCreateService({ transport: fakeTransport(() => response(500, {})) }).search('abc')).toThrow('errUnavailable');
    expect(core.agroCreateService({ transport: fakeTransport(() => response(200, { data: {} })) }).search('abc')).toEqual([]);
  });
});

describe('rows', () => {
  it('formats a product row', () => {
    expect(core.agroProductRow('es', SHERPA)).toEqual([
      'SHERPA 100 EW', 'Vigente', 'SBM', 'Cipermetrin 10 %, X', '2027-12-31', 'Autorizado',
    ]);
    expect(core.agroProductRow('en', {})).toEqual(['', '', '', '', '', '']);
  });

  it('labels authorisation states', () => {
    expect(core.agroAuthorisationLabel('en', { state: 'grace', use_until: '2027-06-30' })).toBe('Grace period (2027-06-30)');
    expect(core.agroAuthorisationLabel('en', { state: 'grace' })).toBe('Grace period');
    expect(core.agroAuthorisationLabel('de', { state: 'withdrawn' })).toBe('Nicht zugelassen');
    expect(core.agroAuthorisationLabel('de', undefined)).toBe('');
  });

  it('formats doses', () => {
    expect(core.agroDose({ dose_min: 0.3, dose_max: 0, dose_unit: 'l/ha' })).toBe('0.3 l/ha');
    expect(core.agroDose({ dose_min: 0.2, dose_max: 0.3, dose_unit: 'l/ha' })).toBe('0.2–0.3 l/ha');
    expect(core.agroDose({ dose_min: 1, dose_max: 1 })).toBe('1');
    expect(core.agroDose({})).toBe('');
  });

  it('lists uses filtered by crop name or EPPO code', () => {
    expect(core.agroConditionRows('es', SHERPA, '')).toHaveLength(2);
    expect(core.agroConditionRows('es', SHERPA, 'trigo')).toEqual([['Trigo', 'Pulgones', '0.2–0.3 l/ha', '', 2, 14, '']]);
    expect(core.agroConditionRows('es', SHERPA, 'GOSHI')[0][0]).toBe('Algodonero');
    expect(core.agroConditionRows('es', SHERPA, 'maíz')).toEqual([['Sin usos autorizados', '', '', '', '', '', '']]);
    expect(core.agroMatchesCrop({}, '  ')).toBe(true);
    expect(core.agroConditionRows('es', {}, null)[0][0]).toBe('Sin usos autorizados');
  });

  it('lists search matches', () => {
    expect(core.agroSearchRows('en', [])).toEqual([['No results', '', '']]);
    expect(core.agroSearchRows('en', [{ registration_number: '1', name: 'A', status: 'Retirado' }, {}])).toEqual([
      ['1', 'A', 'Retirado'], ['', '', ''],
    ]);
  });
});

describe('formulas', () => {
  const service = core.agroCreateService({
    transport: fakeTransport((req) => (req.url.includes('/25421') ? response(200, { data: SHERPA }) : response(404, { code: 'FIT_404' }))),
  });

  it('flattens ranges', () => {
    expect(core.agroFlatten([['a'], ['b', 'c']])).toEqual(['a', 'b', 'c']);
    expect(core.agroFlatten(['a', ['b']])).toEqual(['a', 'b']);
    expect(core.agroFlatten('a')).toEqual(['a']);
  });

  it('fills one row per cell, keeping blanks and errors in place', () => {
    const rows = core.agroProductFormula(service, 'es', [['25421'], [''], ['999'], ['x'.repeat(41)]], 'ES');
    expect(rows[0][0]).toBe('SHERPA 100 EW');
    expect(rows[1]).toEqual(['', '', '', '', '', '']);
    expect(rows[2][0]).toContain('no hay ningún producto');
    expect(rows[3][0]).toContain('demasiado largo');
    expect(core.agroProductFormula(service, 'es', [[''], [null]], 'ES')).toHaveLength(2);
  });

  it('refuses more than the batch limit', () => {
    const many = Array.from({ length: core.AGRO_MAX_BATCH + 1 }, () => ['1']);
    expect(core.agroProductFormula(service, 'en', many, 'ES')[0][0]).toContain('at most 50');
  });

  it('returns uses or an error row', () => {
    expect(core.agroConditionsFormula(service, 'es', '25421', 'ES', 'trigo')).toHaveLength(1);
    expect(core.agroConditionsFormula(service, 'es', '999', 'ES', '')[0]).toHaveLength(core.AGRO_CONDITION_FIELDS.length);
    expect(core.agroConditionsFormula(service, 'es', '', 'ES', '')[0][0]).toContain('falta');
  });

  it('returns matches or an error row', () => {
    const searching = core.agroCreateService({ transport: fakeTransport(() => response(200, { data: { matches: [] } })) });
    expect(core.agroSearchFormula(searching, 'en', 'abc', 'DE')).toEqual([['No results', '', '']]);
    expect(core.agroSearchFormula(searching, 'en', 'a', 'DE')[0][0]).toContain('three letters');
    const broken = { search: () => { throw new Error('boom'); } };
    expect(core.agroSearchFormula(broken, 'en', 'abc', 'DE')[0][0]).toContain('not responding');
    const brokenProduct = { product: () => { throw new Error('boom'); } };
    expect(core.agroConditionsFormula(brokenProduct, 'en', '1', 'DE', '')[0][0]).toContain('not responding');
  });
});
