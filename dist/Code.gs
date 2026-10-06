const AGRO_API_BASE = 'https://api.agrogps.eu';
const AGRO_SITE_URL = 'https://agrogps.eu';
const AGRO_USER_AGENT = 'agrogps-sheets/1.0.0';
const AGRO_CACHE_TTL_SECONDS = 21600;
const AGRO_CACHE_PREFIX = 'agro1:';
const AGRO_CACHE_MAX_CHARS = 90000;
const AGRO_DEFAULT_COUNTRY = 'ES';
const AGRO_MAX_REGISTRATION_LENGTH = 40;
const AGRO_MIN_SEARCH_LENGTH = 3;
const AGRO_MAX_BATCH = 50;
const AGRO_HTTP_OK_MIN = 200;
const AGRO_HTTP_OK_MAX = 299;
const AGRO_HTTP_NOT_FOUND = 404;
const AGRO_HTTP_TOO_MANY = 429;
const AGRO_HTTP_BAD_REQUEST = 400;

const AGRO_COUNTRY_ALIASES = { UK: 'GB', EL: 'GR' };

const AGRO_PRODUCT_FIELDS = ['name', 'status', 'holder', 'substances', 'expires_on', 'authorisation'];
const AGRO_CONDITION_FIELDS = ['crop', 'target', 'dose', 'safety_days', 'max_applications', 'interval_days', 'conditions'];

const AGRO_MESSAGES = {
  es: {
    menuOpen: 'Abrir panel',
    sidebarTitle: 'Agro GPS',
    intro: 'Consulta los fitosanitarios autorizados de los registros oficiales de Europa sin salir de tu hoja.',
    lookupTitle: 'Buscar un producto',
    registrationLabel: 'Número de registro',
    countryLabel: 'País del registro',
    lookupButton: 'Buscar',
    searchLabel: 'O busca por nombre',
    searchButton: 'Buscar por nombre',
    helpTitle: 'Fórmulas',
    helpProduct: '=AGRO_PRODUCTO(registro; país): nombre, estado, titular, sustancias activas, caducidad y autorización.',
    helpConditions: '=AGRO_CONDICIONES(registro; país; cultivo): una fila por uso autorizado con cultivo, plaga, dosis, plazo de seguridad, aplicaciones máximas, intervalo y condiciones.',
    helpSearch: '=AGRO_BUSCAR(nombre; país): productos cuyo nombre coincide.',
    helpNote: 'El país es opcional (ES, FR, DE, IT, PT…); por defecto ES. Los resultados se guardan 6 horas. Manda siempre la etiqueta del producto.',
    errEmpty: 'Agro GPS: falta el número de registro.',
    errTooLong: 'Agro GPS: número de registro demasiado largo.',
    errShortSearch: 'Agro GPS: escribe al menos tres letras.',
    errNotFound: 'Agro GPS: no hay ningún producto con ese número de registro.',
    errNoRegister: 'Agro GPS: todavía no tenemos el registro oficial de ese país.',
    errRateLimited: 'Agro GPS: demasiadas consultas seguidas; vuelve a intentarlo en un minuto.',
    errBadRequest: 'Agro GPS: consulta no válida.',
    errUnavailable: 'Agro GPS: el servicio no responde; vuelve a intentarlo.',
    errTooMany: 'Agro GPS: como mucho 50 filas por fórmula.',
    noUses: 'Sin usos autorizados',
    noMatches: 'Sin resultados',
    authorised: 'Autorizado',
    grace: 'En plazo de agotamiento',
    withdrawn: 'No autorizado',
    getApp: 'Lleva el cuaderno de campo con Agro GPS',
  },
  en: {
    menuOpen: 'Open sidebar',
    sidebarTitle: 'Agro GPS',
    intro: 'Look up authorised plant protection products from the official registers of Europe without leaving your sheet.',
    lookupTitle: 'Look up a product',
    registrationLabel: 'Registration number',
    countryLabel: 'Register country',
    lookupButton: 'Look up',
    searchLabel: 'Or search by name',
    searchButton: 'Search by name',
    helpTitle: 'Formulas',
    helpProduct: '=AGRO_PRODUCTO(registration, country): name, status, holder, active substances, expiry and authorisation.',
    helpConditions: '=AGRO_CONDICIONES(registration, country, crop): one row per authorised use with crop, target, dose, pre-harvest interval, maximum applications, interval and conditions.',
    helpSearch: '=AGRO_BUSCAR(name, country): products whose name matches.',
    helpNote: 'The country is optional (ES, FR, DE, IT, PT…); ES by default. Results are cached for 6 hours. The product label always prevails.',
    errEmpty: 'Agro GPS: registration number missing.',
    errTooLong: 'Agro GPS: registration number too long.',
    errShortSearch: 'Agro GPS: type at least three letters.',
    errNotFound: 'Agro GPS: no product with that registration number.',
    errNoRegister: 'Agro GPS: we do not have that country\'s official register yet.',
    errRateLimited: 'Agro GPS: too many lookups in a row; try again in a minute.',
    errBadRequest: 'Agro GPS: invalid lookup.',
    errUnavailable: 'Agro GPS: the service is not responding; try again.',
    errTooMany: 'Agro GPS: at most 50 rows per formula.',
    noUses: 'No authorised uses',
    noMatches: 'No results',
    authorised: 'Authorised',
    grace: 'Grace period',
    withdrawn: 'Not authorised',
    getApp: 'Keep your farm records with Agro GPS',
  },
  de: {
    menuOpen: 'Seitenleiste öffnen',
    sidebarTitle: 'Agro GPS',
    intro: 'Zugelassene Pflanzenschutzmittel aus den amtlichen Registern Europas direkt in deiner Tabelle.',
    lookupTitle: 'Mittel suchen',
    registrationLabel: 'Zulassungsnummer',
    countryLabel: 'Land des Registers',
    lookupButton: 'Suchen',
    searchLabel: 'Oder nach Namen suchen',
    searchButton: 'Nach Namen suchen',
    helpTitle: 'Formeln',
    helpProduct: '=AGRO_PRODUCTO(Zulassungsnummer; Land): Name, Status, Inhaber, Wirkstoffe, Ablauf und Zulassung.',
    helpConditions: '=AGRO_CONDICIONES(Zulassungsnummer; Land; Kultur): eine Zeile je zugelassener Anwendung mit Kultur, Schaderreger, Aufwand, Wartezeit, maximalen Anwendungen, Abstand und Auflagen.',
    helpSearch: '=AGRO_BUSCAR(Name; Land): Mittel, deren Name passt.',
    helpNote: 'Das Land ist optional (DE, AT, FR, IT…); Standard ist ES. Ergebnisse werden 6 Stunden gespeichert. Es gilt immer die Gebrauchsanleitung.',
    errEmpty: 'Agro GPS: Zulassungsnummer fehlt.',
    errTooLong: 'Agro GPS: Zulassungsnummer zu lang.',
    errShortSearch: 'Agro GPS: mindestens drei Buchstaben eingeben.',
    errNotFound: 'Agro GPS: kein Mittel mit dieser Zulassungsnummer.',
    errNoRegister: 'Agro GPS: das amtliche Register dieses Landes haben wir noch nicht.',
    errRateLimited: 'Agro GPS: zu viele Abfragen hintereinander; in einer Minute erneut versuchen.',
    errBadRequest: 'Agro GPS: ungültige Abfrage.',
    errUnavailable: 'Agro GPS: der Dienst antwortet nicht; bitte erneut versuchen.',
    errTooMany: 'Agro GPS: höchstens 50 Zeilen pro Formel.',
    noUses: 'Keine zugelassenen Anwendungen',
    noMatches: 'Keine Treffer',
    authorised: 'Zugelassen',
    grace: 'In der Aufbrauchfrist',
    withdrawn: 'Nicht zugelassen',
    getApp: 'Schlagkartei mit Agro GPS führen',
  },
  fr: {
    menuOpen: 'Ouvrir le panneau',
    sidebarTitle: 'Agro GPS',
    intro: 'Consulte les produits phytosanitaires autorisés des registres officiels d\'Europe sans quitter ta feuille.',
    lookupTitle: 'Chercher un produit',
    registrationLabel: 'Numéro d\'autorisation',
    countryLabel: 'Pays du registre',
    lookupButton: 'Chercher',
    searchLabel: 'Ou chercher par nom',
    searchButton: 'Chercher par nom',
    helpTitle: 'Formules',
    helpProduct: '=AGRO_PRODUCTO(numéro; pays) : nom, statut, détenteur, substances actives, échéance et autorisation.',
    helpConditions: '=AGRO_CONDICIONES(numéro; pays; culture) : une ligne par usage autorisé avec culture, cible, dose, délai avant récolte, applications maximales, intervalle et conditions.',
    helpSearch: '=AGRO_BUSCAR(nom; pays) : produits dont le nom correspond.',
    helpNote: 'Le pays est facultatif (FR, BE, ES, IT…) ; ES par défaut. Les résultats sont gardés 6 heures. L\'étiquette du produit prévaut toujours.',
    errEmpty: 'Agro GPS : numéro d\'autorisation manquant.',
    errTooLong: 'Agro GPS : numéro d\'autorisation trop long.',
    errShortSearch: 'Agro GPS : tape au moins trois lettres.',
    errNotFound: 'Agro GPS : aucun produit avec ce numéro.',
    errNoRegister: 'Agro GPS : nous n\'avons pas encore le registre officiel de ce pays.',
    errRateLimited: 'Agro GPS : trop de recherches d\'affilée ; réessaie dans une minute.',
    errBadRequest: 'Agro GPS : recherche non valide.',
    errUnavailable: 'Agro GPS : le service ne répond pas ; réessaie.',
    errTooMany: 'Agro GPS : 50 lignes maximum par formule.',
    noUses: 'Aucun usage autorisé',
    noMatches: 'Aucun résultat',
    authorised: 'Autorisé',
    grace: 'Délai de grâce',
    withdrawn: 'Non autorisé',
    getApp: 'Tiens ton registre avec Agro GPS',
  },
  it: {
    menuOpen: 'Apri il pannello',
    sidebarTitle: 'Agro GPS',
    intro: 'Consulta i prodotti fitosanitari autorizzati dei registri ufficiali europei senza uscire dal foglio.',
    lookupTitle: 'Cerca un prodotto',
    registrationLabel: 'Numero di registrazione',
    countryLabel: 'Paese del registro',
    lookupButton: 'Cerca',
    searchLabel: 'Oppure cerca per nome',
    searchButton: 'Cerca per nome',
    helpTitle: 'Formule',
    helpProduct: '=AGRO_PRODUCTO(registrazione; paese): nome, stato, titolare, sostanze attive, scadenza e autorizzazione.',
    helpConditions: '=AGRO_CONDICIONES(registrazione; paese; coltura): una riga per impiego autorizzato con coltura, avversità, dose, intervallo di sicurezza, applicazioni massime, intervallo e condizioni.',
    helpSearch: '=AGRO_BUSCAR(nome; paese): prodotti il cui nome corrisponde.',
    helpNote: 'Il paese è facoltativo (IT, ES, FR, DE…); ES di default. I risultati restano in memoria 6 ore. Prevale sempre l\'etichetta.',
    errEmpty: 'Agro GPS: manca il numero di registrazione.',
    errTooLong: 'Agro GPS: numero di registrazione troppo lungo.',
    errShortSearch: 'Agro GPS: scrivi almeno tre lettere.',
    errNotFound: 'Agro GPS: nessun prodotto con quel numero di registrazione.',
    errNoRegister: 'Agro GPS: non abbiamo ancora il registro ufficiale di quel paese.',
    errRateLimited: 'Agro GPS: troppe ricerche di fila; riprova tra un minuto.',
    errBadRequest: 'Agro GPS: ricerca non valida.',
    errUnavailable: 'Agro GPS: il servizio non risponde; riprova.',
    errTooMany: 'Agro GPS: al massimo 50 righe per formula.',
    noUses: 'Nessun impiego autorizzato',
    noMatches: 'Nessun risultato',
    authorised: 'Autorizzato',
    grace: 'In periodo di smaltimento',
    withdrawn: 'Non autorizzato',
    getApp: 'Tieni il quaderno di campagna con Agro GPS',
  },
  pt: {
    menuOpen: 'Abrir painel',
    sidebarTitle: 'Agro GPS',
    intro: 'Consulta os produtos fitofarmacêuticos autorizados dos registos oficiais da Europa sem sair da folha.',
    lookupTitle: 'Procurar um produto',
    registrationLabel: 'Número de autorização',
    countryLabel: 'País do registo',
    lookupButton: 'Procurar',
    searchLabel: 'Ou procura pelo nome',
    searchButton: 'Procurar pelo nome',
    helpTitle: 'Fórmulas',
    helpProduct: '=AGRO_PRODUCTO(registo; país): nome, estado, titular, substâncias ativas, validade e autorização.',
    helpConditions: '=AGRO_CONDICIONES(registo; país; cultura): uma linha por uso autorizado com cultura, inimigo, dose, intervalo de segurança, aplicações máximas, intervalo e condições.',
    helpSearch: '=AGRO_BUSCAR(nome; país): produtos cujo nome coincide.',
    helpNote: 'O país é opcional (PT, ES, FR…); ES por defeito. Os resultados ficam guardados 6 horas. Prevalece sempre o rótulo.',
    errEmpty: 'Agro GPS: falta o número de autorização.',
    errTooLong: 'Agro GPS: número de autorização demasiado longo.',
    errShortSearch: 'Agro GPS: escreve pelo menos três letras.',
    errNotFound: 'Agro GPS: nenhum produto com esse número.',
    errNoRegister: 'Agro GPS: ainda não temos o registo oficial desse país.',
    errRateLimited: 'Agro GPS: demasiadas consultas seguidas; tenta de novo dentro de um minuto.',
    errBadRequest: 'Agro GPS: consulta inválida.',
    errUnavailable: 'Agro GPS: o serviço não responde; tenta de novo.',
    errTooMany: 'Agro GPS: no máximo 50 linhas por fórmula.',
    noUses: 'Sem usos autorizados',
    noMatches: 'Sem resultados',
    authorised: 'Autorizado',
    grace: 'Em período de escoamento',
    withdrawn: 'Não autorizado',
    getApp: 'Leva o caderno de campo com o Agro GPS',
  },
  pl: {
    menuOpen: 'Otwórz panel',
    sidebarTitle: 'Agro GPS',
    intro: 'Sprawdzaj dopuszczone środki ochrony roślin z oficjalnych rejestrów Europy bez wychodzenia z arkusza.',
    lookupTitle: 'Szukaj środka',
    registrationLabel: 'Numer zezwolenia',
    countryLabel: 'Kraj rejestru',
    lookupButton: 'Szukaj',
    searchLabel: 'Albo szukaj po nazwie',
    searchButton: 'Szukaj po nazwie',
    helpTitle: 'Formuły',
    helpProduct: '=AGRO_PRODUCTO(numer; kraj): nazwa, status, posiadacz, substancje czynne, ważność i zezwolenie.',
    helpConditions: '=AGRO_CONDICIONES(numer; kraj; uprawa): jeden wiersz na dopuszczone zastosowanie z uprawą, agrofagiem, dawką, okresem karencji, maksymalną liczbą zabiegów, odstępem i warunkami.',
    helpSearch: '=AGRO_BUSCAR(nazwa; kraj): środki o pasującej nazwie.',
    helpNote: 'Kraj jest opcjonalny (PL, DE, ES…); domyślnie ES. Wyniki są pamiętane 6 godzin. Zawsze obowiązuje etykieta.',
    errEmpty: 'Agro GPS: brak numeru zezwolenia.',
    errTooLong: 'Agro GPS: numer zezwolenia jest za długi.',
    errShortSearch: 'Agro GPS: wpisz co najmniej trzy litery.',
    errNotFound: 'Agro GPS: brak środka o tym numerze.',
    errNoRegister: 'Agro GPS: nie mamy jeszcze oficjalnego rejestru tego kraju.',
    errRateLimited: 'Agro GPS: za dużo zapytań naraz; spróbuj za minutę.',
    errBadRequest: 'Agro GPS: nieprawidłowe zapytanie.',
    errUnavailable: 'Agro GPS: usługa nie odpowiada; spróbuj ponownie.',
    errTooMany: 'Agro GPS: najwyżej 50 wierszy na formułę.',
    noUses: 'Brak dopuszczonych zastosowań',
    noMatches: 'Brak wyników',
    authorised: 'Dopuszczony',
    grace: 'Okres wyprzedaży',
    withdrawn: 'Niedopuszczony',
    getApp: 'Prowadź ewidencję zabiegów w Agro GPS',
  },
  nl: {
    menuOpen: 'Zijbalk openen',
    sidebarTitle: 'Agro GPS',
    intro: 'Zoek toegelaten gewasbeschermingsmiddelen uit de officiële registers van Europa op, zonder je sheet te verlaten.',
    lookupTitle: 'Middel zoeken',
    registrationLabel: 'Toelatingsnummer',
    countryLabel: 'Land van het register',
    lookupButton: 'Zoeken',
    searchLabel: 'Of zoek op naam',
    searchButton: 'Zoeken op naam',
    helpTitle: 'Formules',
    helpProduct: '=AGRO_PRODUCTO(nummer; land): naam, status, houder, werkzame stoffen, vervaldatum en toelating.',
    helpConditions: '=AGRO_CONDICIONES(nummer; land; gewas): één rij per toegelaten toepassing met gewas, doel, dosering, veiligheidstermijn, maximaal aantal toepassingen, interval en voorschriften.',
    helpSearch: '=AGRO_BUSCAR(naam; land): middelen waarvan de naam overeenkomt.',
    helpNote: 'Het land is optioneel (NL, BE, DE…); standaard ES. Resultaten worden 6 uur bewaard. Het etiket gaat altijd voor.',
    errEmpty: 'Agro GPS: toelatingsnummer ontbreekt.',
    errTooLong: 'Agro GPS: toelatingsnummer te lang.',
    errShortSearch: 'Agro GPS: typ minstens drie letters.',
    errNotFound: 'Agro GPS: geen middel met dat toelatingsnummer.',
    errNoRegister: 'Agro GPS: het officiële register van dat land hebben we nog niet.',
    errRateLimited: 'Agro GPS: te veel opvragingen achter elkaar; probeer het over een minuut opnieuw.',
    errBadRequest: 'Agro GPS: ongeldige opvraging.',
    errUnavailable: 'Agro GPS: de dienst reageert niet; probeer opnieuw.',
    errTooMany: 'Agro GPS: maximaal 50 rijen per formule.',
    noUses: 'Geen toegelaten toepassingen',
    noMatches: 'Geen resultaten',
    authorised: 'Toegelaten',
    grace: 'Opgebruiktermijn',
    withdrawn: 'Niet toegelaten',
    getApp: 'Houd je teeltregistratie bij met Agro GPS',
  },
};

class AgroError extends Error {
  constructor(key) {
    super(key);
    this.name = 'AgroError';
    this.key = key;
  }
}

function agroLocale(raw) {
  const code = String(raw || '').toLowerCase().slice(0, 2);
  return Object.prototype.hasOwnProperty.call(AGRO_MESSAGES, code) ? code : 'en';
}

function agroStrings(locale) {
  return AGRO_MESSAGES[agroLocale(locale)];
}

function agroT(locale, key) {
  return agroStrings(locale)[key] || AGRO_MESSAGES.en[key] || key;
}

function agroNormalizeCountry(raw) {
  const code = String(raw == null ? '' : raw).trim().toUpperCase();
  if (!code) return AGRO_DEFAULT_COUNTRY;
  return AGRO_COUNTRY_ALIASES[code] || code;
}

function agroNormalizeRegistration(raw) {
  const value = String(raw == null ? '' : raw).trim();
  if (!value) throw new AgroError('errEmpty');
  if (value.length > AGRO_MAX_REGISTRATION_LENGTH) throw new AgroError('errTooLong');
  return value;
}

function agroProductUrl(registration, country) {
  return AGRO_API_BASE + '/api/public/phyto/' + encodeURIComponent(registration) +
    '?country=' + encodeURIComponent(country);
}

function agroSearchUrl(term, country) {
  return AGRO_API_BASE + '/api/public/phyto/?q=' + encodeURIComponent(term) +
    '&country=' + encodeURIComponent(country);
}

function agroRequest(url) {
  return { url: url, headers: { 'User-Agent': AGRO_USER_AGENT, Accept: 'application/json' } };
}

function agroErrorKeyFor(response) {
  if (!response || response.thrown) return 'errUnavailable';
  let code = '';
  try {
    code = JSON.parse(response.text || '{}').code || '';
  } catch (e) {
    code = '';
  }
  if (code === 'FIT_404') return 'errNotFound';
  if (code === 'FIT_405') return 'errNoRegister';
  if (response.status === AGRO_HTTP_TOO_MANY) return 'errRateLimited';
  if (response.status === AGRO_HTTP_NOT_FOUND) return 'errNotFound';
  if (response.status === AGRO_HTTP_BAD_REQUEST) return 'errBadRequest';
  return 'errUnavailable';
}

function agroParse(response) {
  if (response && !response.thrown && response.status >= AGRO_HTTP_OK_MIN && response.status <= AGRO_HTTP_OK_MAX) {
    try {
      const body = JSON.parse(response.text);
      if (body && body.data) return body.data;
    } catch (e) {
      throw new AgroError('errUnavailable');
    }
  }
  throw new AgroError(agroErrorKeyFor(response));
}

function agroCreateService(deps) {
  const transport = deps.transport;
  const cache = deps.cache || null;

  function cacheGet(key) {
    if (!cache) return null;
    const hit = cache.get(AGRO_CACHE_PREFIX + key);
    if (!hit) return null;
    try {
      return JSON.parse(hit);
    } catch (e) {
      return null;
    }
  }

  function cachePut(key, value) {
    if (!cache) return;
    const text = JSON.stringify(value);
    if (text.length > AGRO_CACHE_MAX_CHARS) return;
    cache.put(AGRO_CACHE_PREFIX + key, text, AGRO_CACHE_TTL_SECONDS);
  }

  function fetchMany(keys, urlFor) {
    const out = new Array(keys.length);
    const missing = [];
    keys.forEach(function (key, i) {
      const cached = cacheGet(key);
      if (cached) out[i] = { data: cached };
      else missing.push(i);
    });
    if (missing.length) {
      const responses = transport.fetchAll(missing.map(function (i) { return agroRequest(urlFor(keys[i])); }));
      missing.forEach(function (i, n) {
        try {
          const data = agroParse(responses[n]);
          cachePut(keys[i], data);
          out[i] = { data: data };
        } catch (e) {
          out[i] = { error: e.key || 'errUnavailable' };
        }
      });
    }
    return out;
  }

  return {
    products: function (registrations, country) {
      const c = agroNormalizeCountry(country);
      return fetchMany(registrations.map(function (r) { return 'p:' + c + ':' + r; }), function (key) {
        return agroProductUrl(key.slice(c.length + 3), c);
      });
    },
    product: function (registration, country) {
      const result = this.products([agroNormalizeRegistration(registration)], country)[0];
      if (result.error) throw new AgroError(result.error);
      return result.data;
    },
    search: function (term, country) {
      const text = String(term == null ? '' : term).trim();
      if (text.length < AGRO_MIN_SEARCH_LENGTH) throw new AgroError('errShortSearch');
      const c = agroNormalizeCountry(country);
      const result = fetchMany(['s:' + c + ':' + text.toLowerCase()], function () { return agroSearchUrl(text, c); })[0];
      if (result.error) throw new AgroError(result.error);
      return result.data.matches || [];
    },
  };
}

function agroAuthorisationLabel(locale, authorisation) {
  const state = authorisation && authorisation.state;
  if (state === 'authorised') return agroT(locale, 'authorised');
  if (state === 'grace') {
    const until = authorisation.use_until ? ' (' + authorisation.use_until + ')' : '';
    return agroT(locale, 'grace') + until;
  }
  if (state) return agroT(locale, 'withdrawn');
  return '';
}

function agroSubstances(product) {
  return (product.substances || []).map(function (s) {
    const name = s.local_name || s.name || '';
    return s.concentration ? name + ' ' + s.concentration : name;
  }).join(', ');
}

function agroProductRow(locale, product) {
  return [
    product.name || '',
    product.status || '',
    product.holder || '',
    agroSubstances(product),
    product.expires_on || '',
    agroAuthorisationLabel(locale, product.authorisation),
  ];
}

function agroDose(use) {
  const unit = use.dose_unit ? ' ' + use.dose_unit : '';
  if (use.dose_min && use.dose_max && use.dose_max !== use.dose_min) return use.dose_min + '–' + use.dose_max + unit;
  const value = use.dose_min || use.dose_max;
  return value ? value + unit : '';
}

function agroMatchesCrop(use, crop) {
  if (!crop) return true;
  const wanted = String(crop).trim().toLowerCase();
  if (!wanted) return true;
  return String(use.crop || '').toLowerCase().indexOf(wanted) >= 0 ||
    String(use.crop_code || '').toLowerCase() === wanted;
}

function agroConditionRows(locale, product, crop) {
  const rows = (product.uses || []).filter(function (use) { return agroMatchesCrop(use, crop); }).map(function (use) {
    return [
      use.crop || '',
      use.target || '',
      agroDose(use),
      use.safety_days == null ? '' : use.safety_days,
      use.max_applications == null ? '' : use.max_applications,
      use.interval_days == null ? '' : use.interval_days,
      use.conditions || '',
    ];
  });
  if (!rows.length) return [[agroT(locale, 'noUses'), '', '', '', '', '', '']];
  return rows;
}

function agroSearchRows(locale, matches) {
  if (!matches.length) return [[agroT(locale, 'noMatches'), '', '']];
  return matches.map(function (m) {
    return [m.registration_number || '', m.name || '', agroAuthorisationLabel(locale, m.authorisation) || m.status || ''];
  });
}

function agroFlatten(input) {
  if (Array.isArray(input)) {
    const out = [];
    input.forEach(function (row) {
      if (Array.isArray(row)) row.forEach(function (cell) { out.push(cell); });
      else out.push(row);
    });
    return out;
  }
  return [input];
}

function agroErrorRow(locale, key, width) {
  const row = [agroT(locale, key)];
  for (let i = 1; i < width; i += 1) row.push('');
  return row;
}

function agroProductFormula(service, locale, registrations, country) {
  const cells = agroFlatten(registrations);
  if (cells.length > AGRO_MAX_BATCH) return [agroErrorRow(locale, 'errTooMany', AGRO_PRODUCT_FIELDS.length)];
  const normalized = [];
  const rows = cells.map(function (cell) {
    if (cell === '' || cell == null) return null;
    try {
      normalized.push(agroNormalizeRegistration(cell));
      return { index: normalized.length - 1 };
    } catch (e) {
      return { error: e.key };
    }
  });
  const results = normalized.length ? service.products(normalized, country) : [];
  return rows.map(function (row) {
    if (row === null) return AGRO_PRODUCT_FIELDS.map(function () { return ''; });
    if (row.error) return agroErrorRow(locale, row.error, AGRO_PRODUCT_FIELDS.length);
    const result = results[row.index];
    if (result.error) return agroErrorRow(locale, result.error, AGRO_PRODUCT_FIELDS.length);
    return agroProductRow(locale, result.data);
  });
}

function agroConditionsFormula(service, locale, registration, country, crop) {
  try {
    return agroConditionRows(locale, service.product(registration, country), crop);
  } catch (e) {
    return [agroErrorRow(locale, e.key || 'errUnavailable', AGRO_CONDITION_FIELDS.length)];
  }
}

function agroSearchFormula(service, locale, term, country) {
  try {
    return agroSearchRows(locale, service.search(term, country));
  } catch (e) {
    return [agroErrorRow(locale, e.key || 'errUnavailable', 3)];
  }
}

function agroSiteUrl(locale) {
  const code = agroLocale(locale);
  return code === 'es' ? AGRO_SITE_URL + '/' : AGRO_SITE_URL + '/' + code + '/';
}

const AGRO_SIDEBAR_TITLE = 'Agro GPS';

function onOpen() {
  const strings = agroStrings(agroDetectLocale());
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem(strings.menuOpen, 'agroShowSidebar')
    .addToUi();
}

function onInstall() {
  onOpen();
}

function agroTry(read, fallback) {
  try {
    return read() || fallback;
  } catch (e) {
    return fallback;
  }
}

function agroDetectLocale() {
  const userLocale = agroTry(function () { return Session.getActiveUserLocale(); }, '');
  if (userLocale) return agroLocale(userLocale);
  return agroLocale(agroTry(function () { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale(); }, 'en'));
}

function agroCache() {
  return agroTry(function () { return CacheService.getDocumentCache() || CacheService.getScriptCache(); }, null);
}

function agroWrapResponse(response) {
  return { status: response.getResponseCode(), text: response.getContentText() };
}

function agroFetchParams(request) {
  return { url: request.url, method: 'get', headers: request.headers, muteHttpExceptions: true, followRedirects: true };
}

function agroFetchOne(params) {
  try {
    return agroWrapResponse(UrlFetchApp.fetch(params.url, params));
  } catch (e) {
    return { thrown: e };
  }
}

function agroTransport() {
  return {
    fetchAll: function (requests) {
      const params = requests.map(agroFetchParams);
      try {
        return UrlFetchApp.fetchAll(params).map(agroWrapResponse);
      } catch (e) {
        return params.map(agroFetchOne);
      }
    },
  };
}

function agroService() {
  return agroCreateService({ transport: agroTransport(), cache: agroCache() });
}

/**
 * Plant protection product: name, status, holder, active substances, expiry and authorisation.
 * @param {string} registration Registration number, or a column of them.
 * @param {string} country Optional register country (ES, FR, DE, IT, PT…); ES by default.
 * @return One row per product.
 * @customfunction
 */
function AGRO_PRODUCTO(registration, country) {
  return agroProductFormula(agroService(), agroDetectLocale(), registration, country);
}

/**
 * Authorised uses of a product: crop, target, dose, pre-harvest interval, maximum applications, interval and conditions.
 * @param {string} registration Registration number.
 * @param {string} country Optional register country; ES by default.
 * @param {string} crop Optional crop name or EPPO code to filter the uses.
 * @return One row per authorised use.
 * @customfunction
 */
function AGRO_CONDICIONES(registration, country, crop) {
  return agroConditionsFormula(agroService(), agroDetectLocale(), registration, country, crop);
}

/**
 * Products whose name matches: registration number, name and authorisation.
 * @param {string} name At least three letters of the product name.
 * @param {string} country Optional register country; ES by default.
 * @return One row per product.
 * @customfunction
 */
function AGRO_BUSCAR(name, country) {
  return agroSearchFormula(agroService(), agroDetectLocale(), name, country);
}

function agroShowSidebar() {
  const html = HtmlService.createHtmlOutput(SIDEBAR_HTML).setTitle(AGRO_SIDEBAR_TITLE);
  SpreadsheetApp.getUi().showSidebar(html);
}

function agroSidebarModel() {
  const locale = agroDetectLocale();
  return { locale: locale, strings: agroStrings(locale), siteUrl: agroSiteUrl(locale) };
}

function agroSidebarLookup(registration, country) {
  const locale = agroDetectLocale();
  try {
    const product = agroService().product(registration, country);
    return { product: agroProductRow(locale, product), uses: agroConditionRows(locale, product, '') };
  } catch (e) {
    return { error: agroT(locale, e.key || 'errUnavailable') };
  }
}

function agroSidebarSearch(term, country) {
  const locale = agroDetectLocale();
  try {
    return { matches: agroSearchRows(locale, agroService().search(term, country)) };
  } catch (e) {
    return { error: agroT(locale, e.key || 'errUnavailable') };
  }
}

const SIDEBAR_HTML = "<!DOCTYPE html>\n<html>\n<head>\n<base target=\"_top\">\n<style>\n  body { font-family: Arial, sans-serif; font-size: 13px; color: #1f2a1f; margin: 12px; }\n  h1 { font-size: 16px; color: #2f6b2f; margin: 0 0 8px; }\n  h2 { font-size: 13px; margin: 16px 0 6px; }\n  label { display: block; margin: 8px 0 2px; font-weight: bold; }\n  input { width: 100%; box-sizing: border-box; padding: 6px; border: 1px solid #b9c7b9; border-radius: 4px; }\n  button { margin-top: 8px; padding: 6px 12px; background: #2f6b2f; color: #fff; border: 0; border-radius: 4px; cursor: pointer; }\n  button.secondary { background: #e8efe8; color: #1f2a1f; }\n  .error { color: #a12a1a; margin-top: 8px; }\n  .card { border: 1px solid #dfe7df; border-radius: 6px; padding: 8px; margin-top: 8px; }\n  .muted { color: #5b6b5b; font-size: 12px; }\n  ul { padding-left: 16px; }\n  li { margin-bottom: 4px; }\n  a { color: #2f6b2f; }\n</style>\n</head>\n<body>\n<h1 id=\"title\"></h1>\n<p id=\"intro\" class=\"muted\"></p>\n<h2 id=\"lookupTitle\"></h2>\n<label id=\"registrationLabel\" for=\"registration\"></label>\n<input id=\"registration\" autocomplete=\"off\">\n<label id=\"countryLabel\" for=\"country\"></label>\n<input id=\"country\" value=\"ES\" maxlength=\"2\">\n<button id=\"lookup\"></button>\n<label id=\"searchLabel\" for=\"term\"></label>\n<input id=\"term\" autocomplete=\"off\">\n<button id=\"search\" class=\"secondary\"></button>\n<div id=\"result\"></div>\n<h2 id=\"helpTitle\"></h2>\n<ul>\n  <li id=\"helpProduct\"></li>\n  <li id=\"helpConditions\"></li>\n  <li id=\"helpSearch\"></li>\n</ul>\n<p id=\"helpNote\" class=\"muted\"></p>\n<p><a id=\"site\" target=\"_blank\" rel=\"noopener\"></a></p>\n<script>\n  var S = {};\n  function text(id, value) { document.getElementById(id).textContent = value; }\n  function el(tag, value, cls) {\n    var node = document.createElement(tag);\n    if (value !== undefined) node.textContent = value;\n    if (cls) node.className = cls;\n    return node;\n  }\n  function render(model) {\n    S = model.strings;\n    ['intro', 'lookupTitle', 'registrationLabel', 'countryLabel', 'searchLabel', 'helpTitle', 'helpProduct',\n      'helpConditions', 'helpSearch', 'helpNote'].forEach(function (id) { text(id, S[id]); });\n    text('title', S.sidebarTitle);\n    text('lookup', S.lookupButton);\n    text('search', S.searchButton);\n    var site = document.getElementById('site');\n    site.href = model.siteUrl;\n    site.textContent = S.getApp;\n  }\n  function showError(message) {\n    var box = document.getElementById('result');\n    box.innerHTML = '';\n    box.appendChild(el('p', message, 'error'));\n  }\n  function showProduct(data) {\n    if (data.error) return showError(data.error);\n    var box = document.getElementById('result');\n    box.innerHTML = '';\n    var card = el('div', undefined, 'card');\n    card.appendChild(el('strong', data.product[0]));\n    card.appendChild(el('div', [data.product[5], data.product[1]].filter(Boolean).join(' · '), 'muted'));\n    card.appendChild(el('div', data.product[3]));\n    var list = el('ul');\n    data.uses.slice(0, 30).forEach(function (u) {\n      list.appendChild(el('li', [u[0], u[1], u[2], u[3] === '' ? '' : u[3] + ' d'].filter(Boolean).join(' · ')));\n    });\n    card.appendChild(list);\n    box.appendChild(card);\n  }\n  function showMatches(data) {\n    if (data.error) return showError(data.error);\n    var box = document.getElementById('result');\n    box.innerHTML = '';\n    var list = el('ul');\n    data.matches.forEach(function (m) { list.appendChild(el('li', m.filter(Boolean).join(' · '))); });\n    box.appendChild(list);\n  }\n  document.getElementById('lookup').addEventListener('click', function () {\n    google.script.run.withSuccessHandler(showProduct).withFailureHandler(function (e) { showError(e.message); })\n      .agroSidebarLookup(document.getElementById('registration').value, document.getElementById('country').value);\n  });\n  document.getElementById('search').addEventListener('click', function () {\n    google.script.run.withSuccessHandler(showMatches).withFailureHandler(function (e) { showError(e.message); })\n      .agroSidebarSearch(document.getElementById('term').value, document.getElementById('country').value);\n  });\n  google.script.run.withSuccessHandler(render).agroSidebarModel();\n</script>\n</body>\n</html>\n";
