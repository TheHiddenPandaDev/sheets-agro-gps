# Agro GPS for Google Sheets

Google Sheets add-on with three custom functions over the public Agro GPS plant protection product API (official registers of European countries):

| Formula | Returns |
|---|---|
| `=AGRO_PRODUCTO(registration, [country])` | name, status, holder, active substances, expiry, authorisation (one row per cell of a column) |
| `=AGRO_CONDICIONES(registration, [country], [crop])` | one row per authorised use: crop, target, dose, pre-harvest interval, maximum applications, interval, conditions |
| `=AGRO_BUSCAR(name, [country])` | registration number, name and authorisation of the products whose name matches |

Country defaults to `ES`. No account and no API key: it calls `https://api.agrogps.eu/api/public/phyto`. Answers are cached for 6 hours in the document cache. The product label always prevails.

## Develop

```
npm ci
npm test            # vitest
npm run test:coverage
npm run build       # writes dist/Code.gs and dist/appsscript.json
npm run push        # build + clasp push (needs .clasp.json, see .clasp.json.example)
```

`src/core.js` holds the logic and is tested in Node; `src/Code.js` binds it to Apps Script. Listing texts and the publishing checklist are in `marketplace/LISTING.md`.

Privacy: the add-on reads only the cells where its formulas are used and sends only the registration number, name and country to api.agrogps.eu. See https://agrogps.eu/en/privacy/#google-sheets-add-on.

MIT licence.
