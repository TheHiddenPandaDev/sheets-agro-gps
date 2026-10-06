import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import core from '../src/core.js';

const require = createRequire(import.meta.url);
Object.assign(globalThis, core, { SIDEBAR_HTML: '<p>sidebar</p>' });
const code = require('../src/Code.js');

const PRODUCT = { name: 'SHERPA 100 EW', status: 'Vigente', uses: [{ crop: 'Trigo', target: 'Pulgones', safety_days: 14 }] };

function httpResponse(status, body) {
  return { getResponseCode: () => status, getContentText: () => JSON.stringify(body) };
}

let ui;
let cacheStore;
let locale;

function install({ fetchAll, fetch } = {}) {
  ui = { menu: [], sidebar: null };
  cacheStore = {};
  locale = 'es_ES';
  const menu = { addItem: (label, fn) => { ui.menu.push([label, fn]); return menu; }, addToUi: vi.fn() };
  globalThis.SpreadsheetApp = {
    getUi: () => ({ createAddonMenu: () => menu, showSidebar: (html) => { ui.sidebar = html; } }),
    getActiveSpreadsheet: () => ({ getSpreadsheetLocale: () => 'de_DE' }),
  };
  globalThis.Session = { getActiveUserLocale: () => locale };
  globalThis.CacheService = {
    getDocumentCache: () => ({ get: (k) => cacheStore[k] || null, put: (k, v) => { cacheStore[k] = v; } }),
    getScriptCache: () => null,
  };
  globalThis.UrlFetchApp = {
    fetchAll: fetchAll || ((params) => params.map(() => httpResponse(200, { data: PRODUCT }))),
    fetch: fetch || (() => httpResponse(200, { data: PRODUCT })),
  };
  globalThis.HtmlService = {
    createHtmlOutput: (html) => ({ html, setTitle(t) { this.title = t; return this; } }),
  };
}

beforeEach(() => install());

describe('menu and sidebar', () => {
  it('adds the menu in the user language on open and install', () => {
    code.onInstall();
    expect(ui.menu).toEqual([['Abrir panel', 'agroShowSidebar']]);
  });

  it('shows the sidebar and builds its model', () => {
    code.agroShowSidebar();
    expect(ui.sidebar.title).toBe('Agro GPS');
    expect(code.agroSidebarModel()).toMatchObject({ locale: 'es', siteUrl: 'https://agrogps.eu/' });
  });

  it('falls back to the spreadsheet locale, then English', () => {
    locale = '';
    expect(code.agroDetectLocale()).toBe('de');
    globalThis.Session = { getActiveUserLocale: () => { throw new Error('no session'); } };
    globalThis.SpreadsheetApp.getActiveSpreadsheet = () => { throw new Error('no sheet'); };
    expect(code.agroDetectLocale()).toBe('en');
  });
});

describe('custom functions', () => {
  it('AGRO_PRODUCTO fills rows and caches answers', () => {
    expect(code.AGRO_PRODUCTO([['25421']], 'ES')[0][0]).toBe('SHERPA 100 EW');
    expect(Object.keys(cacheStore)).toEqual(['agro1:p:ES:25421']);
  });

  it('AGRO_CONDICIONES and AGRO_BUSCAR return rows', () => {
    expect(code.AGRO_CONDICIONES('25421', 'ES', 'trigo')[0][0]).toBe('Trigo');
    install({ fetchAll: (params) => params.map(() => httpResponse(200, { data: { matches: [{ registration_number: '1', name: 'Karate' }] } })) });
    expect(code.AGRO_BUSCAR('karate', 'DE')[0]).toEqual(['1', 'Karate', '']);
  });

  it('falls back to one-by-one fetches when fetchAll throws', () => {
    install({
      fetchAll: () => { throw new Error('quota'); },
      fetch: (url) => (url.includes('/2') ? httpResponse(200, { data: PRODUCT }) : (() => { throw new Error('dns'); })()),
    });
    const rows = code.AGRO_PRODUCTO([['2'], ['3']], 'ES');
    expect(rows[0][0]).toBe('SHERPA 100 EW');
    expect(rows[1][0]).toContain('no responde');
  });

  it('sidebar lookup and search report errors as text', () => {
    expect(code.agroSidebarLookup('25421', 'ES').uses[0][0]).toBe('Trigo');
    expect(code.agroSidebarLookup('', 'ES').error).toContain('falta');
    install({ fetchAll: (params) => params.map(() => httpResponse(200, { data: { matches: [] } })) });
    expect(code.agroSidebarSearch('abc', 'ES').matches[0][0]).toBe('Sin resultados');
    expect(code.agroSidebarSearch('a', 'ES').error).toContain('tres letras');
  });

  it('works when no cache service is available', () => {
    globalThis.CacheService = { getDocumentCache: () => { throw new Error('none'); } };
    expect(code.agroCache()).toBe(null);
    expect(code.AGRO_PRODUCTO('25421', 'ES')[0][0]).toBe('SHERPA 100 EW');
  });

  it('wraps fetch parameters', () => {
    expect(code.agroFetchParams({ url: 'u', headers: { a: 'b' } })).toEqual({
      url: 'u', method: 'get', headers: { a: 'b' }, muteHttpExceptions: true, followRedirects: true,
    });
    expect(code.agroTry(() => '', 'fallback')).toBe('fallback');
  });
});
