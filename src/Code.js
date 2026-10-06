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

if (typeof module !== 'undefined') {
  module.exports = {
    onOpen, onInstall, agroTry, agroDetectLocale, agroCache, agroWrapResponse, agroFetchParams, agroFetchOne,
    agroTransport, agroService, AGRO_PRODUCTO, AGRO_CONDICIONES, AGRO_BUSCAR, agroShowSidebar, agroSidebarModel,
    agroSidebarLookup, agroSidebarSearch,
  };
}
