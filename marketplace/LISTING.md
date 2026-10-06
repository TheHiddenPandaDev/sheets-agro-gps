# Google Workspace Marketplace listing

Everything the Marketplace SDK "Store listing" and "App configuration" pages ask for. Copy field by field.

## Fixed data

| Field | Value |
|---|---|
| App name | Agro GPS – Plant protection products of Europe |
| Developer name | The Hidden Panda |
| Developer website | https://agrogps.eu/en/ |
| Developer email / support email | soporte@agrogps.eu |
| Category | Business tools (alternative: Productivity) |
| Pricing | Free |
| Terms of service URL | https://agrogps.eu/en/legal/ |
| Privacy policy URL | https://agrogps.eu/en/privacy/#google-sheets-add-on |
| Support URL | https://agrogps.eu/en/ |
| Source code ("Report an issue") | https://github.com/TheHiddenPandaDev/sheets-agro-gps/issues |
| Integration | Sheets add-on (Editor add-on) |
| OAuth scopes | `https://www.googleapis.com/auth/script.external_request`, `https://www.googleapis.com/auth/spreadsheets.currentonly`, `https://www.googleapis.com/auth/script.container.ui` |
| Icons | `icon-32.png`, `icon-48.png`, `icon-96.png`, `icon-128.png` in this folder (512 also included) |
| Card banner (220×140) | To make: Agro GPS mark on green + "Plant protection products in your sheet" |
| Screenshots (1280×800, 1 to 5) | To capture after the test install: =AGRO_PRODUCTO filled for a column, =AGRO_CONDICIONES for a product, the sidebar |

## English

**Short description** (max 200 characters)

Authorised plant protection products from the official registers of Europe in Google Sheets: name, active substances, status, uses, doses and pre-harvest intervals by registration number.

**Detailed description**

Agro GPS brings the official plant protection product registers of European countries into Google Sheets with three formulas:

- =AGRO_PRODUCTO(registration, [country]): name, status, holder, active substances, expiry and whether it is authorised, in grace period or not authorised. Works on a whole column at once.
- =AGRO_CONDICIONES(registration, [country], [crop]): one row per authorised use with crop, target, dose, pre-harvest interval, maximum number of applications, minimum interval and the register's conditions (buffer zones and more).
- =AGRO_BUSCAR(name, [country]): registration numbers of the products whose name matches.

The country defaults to Spain; use ES, FR, DE, IT, PT, AT, BE, NL, PL and the other countries Agro GPS covers. The sidebar looks up a product and its uses without typing a formula.

Built for farm advisors, cooperatives, input dealers and farmers who keep their treatment plans in a spreadsheet. No account and no key needed. Answers are cached for 6 hours. The product label always prevails.

The add-on only reads the cells where you use its formulas and only sends the registration number, name and country you type to api.agrogps.eu.

## Español

**Descripción corta** (máx. 200 caracteres)

Fitosanitarios autorizados de los registros oficiales de Europa en Google Sheets: nombre, sustancias activas, estado, usos, dosis y plazos de seguridad por número de registro.

**Descripción detallada**

Agro GPS lleva a Google Sheets los registros oficiales de productos fitosanitarios de los países europeos con tres fórmulas:

- =AGRO_PRODUCTO(registro; [país]): nombre, estado, titular, sustancias activas, caducidad y si está autorizado, en plazo de agotamiento o no autorizado. Funciona sobre una columna entera.
- =AGRO_CONDICIONES(registro; [país]; [cultivo]): una fila por uso autorizado con cultivo, plaga, dosis, plazo de seguridad, número máximo de aplicaciones, intervalo mínimo y condiciones del registro (bandas de seguridad y demás).
- =AGRO_BUSCAR(nombre; [país]): números de registro de los productos cuyo nombre coincide.

Por defecto el país es España; vale ES, FR, DE, IT, PT, AT, BE, NL, PL y el resto de países que cubre Agro GPS. El panel lateral consulta un producto y sus usos sin escribir fórmulas.

Pensado para asesores, cooperativas, distribuidores y agricultores que llevan su plan de tratamientos en una hoja de cálculo. Sin cuenta y sin clave. Las respuestas se guardan 6 horas. Manda siempre la etiqueta del producto.

## Deutsch

**Kurzbeschreibung**

Zugelassene Pflanzenschutzmittel aus den amtlichen Registern Europas in Google Sheets: Name, Wirkstoffe, Status, Anwendungen, Aufwandmengen und Wartezeiten nach Zulassungsnummer.

**Beschreibung**

Drei Formeln: =AGRO_PRODUCTO(Zulassungsnummer; Land), =AGRO_CONDICIONES(Zulassungsnummer; Land; Kultur) mit einer Zeile je Anwendung (Kultur, Schaderreger, Aufwand, Wartezeit, maximale Anwendungen, Abstand, Auflagen) und =AGRO_BUSCAR(Name; Land). Für Berater, Genossenschaften, Landhandel und Betriebe. Ohne Konto und ohne Schlüssel. Es gilt immer die Gebrauchsanleitung.

## Français

**Description courte**

Produits phytosanitaires autorisés des registres officiels d'Europe dans Google Sheets : nom, substances actives, statut, usages, doses et délais avant récolte par numéro d'autorisation.

**Description**

Trois formules : =AGRO_PRODUCTO(numéro; pays), =AGRO_CONDICIONES(numéro; pays; culture) avec une ligne par usage (culture, cible, dose, délai avant récolte, applications maximales, intervalle, conditions) et =AGRO_BUSCAR(nom; pays). Pour les conseillers, coopératives, distributeurs et agriculteurs. Sans compte ni clé. L'étiquette du produit prévaut toujours.

## Publishing checklist (Dani)

1. Google Cloud: create (or reuse) a GCP project for the add-on, linked to the Apps Script project (Apps Script > Project settings > Google Cloud Platform project > Change project).
2. OAuth consent screen: External, app name "Agro GPS", support email soporte@agrogps.eu, app domain agrogps.eu, privacy policy URL above, the three scopes above. Publish the consent screen to "In production"; the scopes are not sensitive except external_request, which Google may review.
3. Enable "Google Workspace Marketplace SDK" in the project; fill "App configuration" (Sheets add-on, script ID, deployment version) and "Store listing" with this file.
4. In the Apps Script editor: Deploy > New deployment > Add-on, note the version, paste it in the Marketplace SDK.
5. Submit for review (visibility: Public). Publishing is public and Google reviews it; it can take several days.
