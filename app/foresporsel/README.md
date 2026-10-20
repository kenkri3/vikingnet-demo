# Forespørsel og status

En liten, komplett bestillingsflyt for tjenestebedrifter:

1. Kunden velger tjeneste og dato, og sender en forespørsel.
2. Kunden får et referansenummer (for eksempel `FS-3F7K`) og en kvittering.
3. Kunden følger saken på statussiden: **mottatt → planlagt → utført**, med tidsstempler.
4. Operatøren ser alle saker på `admin.html` og flytter status med ett klikk.

Frontend er ren HTML, CSS og JavaScript uten avhengigheter, og virker på GitHub Pages.
Backend er en Node HTTP-server med `node:sqlite`, også uten npm-pakker. Den kan kjøres
lokalt eller deployes til for eksempel Railway.

> **Demo, ikke produksjon.** Operatørsiden har ingen innlogging, API-et er åpent og
> CORS er åpent. Ikke legg inn ekte personopplysninger før tilgangen er beskyttet.

## Kjøre med server

Krever Node 24 eller nyere (testet med Node 24.16). På Node 22.5–23.3 må serveren
startes med `node --experimental-sqlite server/server.mjs`, fordi `node:sqlite` fortsatt
lå bak et flagg der. Ingen `npm install` er nødvendig.

```bash
node server/server.mjs
```

Åpne <http://localhost:4180>. Serveren leverer både API-et og filene i denne mappen.
Databasen opprettes i `server/data.db` ved første start.

```bash
npm start                 # samme kommando via package.json
PORT=8080 node server/server.mjs
DB_PATH=/data/data.db node server/server.mjs
```

På Windows (PowerShell):

```powershell
$env:PORT = "4180"
node server/server.mjs
```

For å nullstille demoen: stopp serveren og slett `server/data.db` (og eventuelle
`data.db-wal` / `data.db-shm`). Filene er ignorert av git.

## Kjøre uten server (GitHub Pages)

Legg `app/foresporsel/` ut som en vanlig statisk mappe. `api.js` prøver først
`GET /api/helse`; når den ikke svarer, bytter den automatisk til **lokal modus** og
lagrer forespørsler i `localStorage` i nettleseren.

Det betyr:

- Alt virker: skjema, kvittering, statussjekk, adminliste, filtre og statusendring.
- Data ligger **bare i den nettleseren som sendte forespørselen**. En kunde som åpner
  referansenummeret på mobilen, finner det ikke. Admin ser bare saker fra sin egen nettleser.
- Tømming av nettleserdata sletter sakene.
- Lokal modus er derfor en demo- og prototypefunksjon, ikke en produksjonsløsning.

Vil du bruke GitHub Pages som frontend og et eksternt API, setter du `apiBase` i
`config.js` til API-adressen (for eksempel Railway) og `modus: "server"`. CORS er åpent.

## Filer

| Fil | Innhold |
| --- | --- |
| `index.html` | Kundeside: skjema, kvittering og statussjekk |
| `admin.html` | Operatørside: liste, filter og statusendring |
| `app.js` | All grensesnittlogikk for begge sider |
| `api.js` | Datalag med to adaptere (server og localStorage), validering og formatering |
| `styles.css` | Designsystenet |
| `config.js` | Kundenavn, farger, tjenester, kontakt og modus |
| `server/server.mjs` | API og statisk server med `node:sqlite` |
| `server/README.md` | Serverdrift, endepunkter, curl-eksempler og deploy |

## Tilpasse per kunde

Alt som normalt varierer, ligger i `config.js`:

- `kunde.navn`, `kunde.slagord`, `kunde.epost`, `kunde.telefon`
- `farger.*` – settes som CSS-variabler ved oppstart
- `tjenester` – **eksempeltjenester**; bytt navn, beskrivelse og varighet
- `svartid`, `tidssone`
- `modus` (`auto`, `server`, `lokal`), `apiBase`, `lokalNokkel`
- `personvern.tekst`, eventuelt `personvern.url`

Tjenestene er i utgangspunktet generiske med vilje og skal byttes før levering.
Det finnes ingen oppdiktede kunder eller saker i databasen. `favicon.svg` har en fast
grønn farge; bytt den sammen med `farger.aksent` hvis kunden har en annen profil.

### Ny kunde – sjekkliste

1. Kopier `app/foresporsel/` til kundens mappe eller repo.
2. Endre `config.js`: navn, slagord, kontakt, farger, tjenester og `lokalNokkel`.
3. Velg modus: `auto` for GitHub Pages, `server` når API-et skal brukes.
4. Kjør `node server/server.mjs` lokalt og test skjema, kvittering, statussjekk og admin.
5. Deploy frontend (GitHub Pages/Firebase Hosting) og eventuelt API (Railway).
6. Test at en ny forespørsel får referansenummer, at status kan endres, og at statussiden
   finner saken igjen på den adressen kunden faktisk bruker.

## API-kontrakt

Begge adaptere i `api.js` følger samme kontrakt.

| Metode | Sti | Kropp | Svar |
| --- | --- | --- | --- |
| `POST` | `/api/requests` | `{tjeneste, dato, navn, telefon, epost, notat}` | `{ref, status, opprettet}` (HTTP 201) |
| `GET` | `/api/requests` | – | `{requests: [...]}` |
| `GET` | `/api/requests/:ref` | – | `{request}` |
| `PATCH` | `/api/requests/:ref` | `{status}` | `{request}` |

`status` er `mottatt`, `planlagt` eller `utført`. `dato` er `YYYY-MM-DD`.
`ref` er `FS-` pluss fire tegn fra alfabetet uten tvetydige tegn (`0`, `1`, `I`, `O`).

En forespørsel returneres slik:

```json
{
  "ref": "FS-3F7K",
  "tjeneste": "Befaring og tilbud",
  "dato": "2026-11-05",
  "navn": "Ola Nordmann",
  "telefon": "900 00 000",
  "epost": "ola@example.com",
  "notat": "Ønsker befaring av bad.",
  "status": "mottatt",
  "opprettet": "2026-10-20T16:58:00.000Z",
  "oppdatert": "2026-10-20T16:58:00.000Z",
  "historikk": [{ "status": "mottatt", "tid": "2026-10-20T16:58:00.000Z" }]
}
```

Feil returneres med passende HTTP-status:

```json
{
  "feil": {
    "melding": "Skjemaet har noen feil. Sjekk feltene som er merket.",
    "felt": { "telefon": "Telefonnummeret må ha minst 8 siffer." }
  }
}
```

`GET /api/helse` er et internt hjelpeendepunkt som brukes for å velge modus.

## Lagring og personvern

- Ingen sporing, ingen informasjonskapsler, ingen tredjepartsressurser og ingen eksterne fonter.
- Serveren logger metode, sti, statuskode og tid – ikke innholdet i forespørslene.
- I servermodus ligger data i SQLite på serveren. Ta backup av `server/data.db` før oppgraderinger.
- API-et returnerer fulle personopplysninger til alle som kan nå det. Beskytt det før produksjon.

## Deploy

### Railway

1. Lag et Railway-prosjekt fra repoet. Sett **root directory** til `app/foresporsel`
   (eller bruk startkommandoen `node app/foresporsel/server/server.mjs` fra repoets rot).
2. Startkommando: `node server/server.mjs` (eller `npm start`).
3. Legg til et volum, for eksempel montert på `/data`, og sett `DB_PATH=/data/data.db`.
   Uten volum forsvinner databasen ved hver deploy.
4. Railway setter `PORT` selv; serveren lytter på `0.0.0.0`.
5. Helsekontroll: `/api/helse`.
6. Generer domene og sett `apiBase` i `config.js` hvis frontend ligger et annet sted.

### Firebase

- **Bare frontend:** Firebase Hosting kan publisere `app/foresporsel` som statisk side.
  Da brukes lokal modus, med begrensningene beskrevet over. Eksempel på `firebase.json`:

  ```json
  {
    "hosting": {
      "public": "app/foresporsel",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "server/**"]
    }
  }
  ```

- **Frontend + API:** kjør `server/server.mjs` som container på Cloud Run, og bruk en
  Hosting-rewrite til tjenesten (krever Blaze):

  ```json
  "rewrites": [{ "source": "/api/**", "run": { "serviceId": "foresporsel-api", "region": "europe-north1" } }]
  ```

  SQLite i en container er bare varig så lenge instansen lever. Til produksjon på Cloud Run
  bør du bruke Cloud SQL eller Firestore, eller kjøre API-et på en tjeneste med persistent volum
  (Railway, Fly.io eller en liten VM).

## Teste

```bash
curl -i -X POST http://localhost:4180/api/requests \
  -H "Content-Type: application/json" \
  -d '{"tjeneste":"Befaring og tilbud","dato":"2026-11-05","navn":"Ola Nordmann","telefon":"900 00 000","epost":"ola@example.com","notat":"Ønsker befaring av bad."}'

curl -i http://localhost:4180/api/requests
curl -i http://localhost:4180/api/requests/FS-3F7K
curl -i -X PATCH http://localhost:4180/api/requests/FS-3F7K \
  -H "Content-Type: application/json" -d '{"status":"planlagt"}'
```

Bytt `FS-3F7K` med referansenummeret du fikk. Se `server/README.md` for flere eksempler.

## Begrensninger

- Ingen innlogging, roller eller revisjonslogg utover statushistorikken.
- Ingen e-post eller SMS sendes. Kvitteringen vises bare på skjermen.
- Ingen ratelimiting eller botvern.
- Ingen samtidighetskontroll ved statusendring; siste skriving vinner.
- SQLite passer for én liten server, ikke for mange samtidige skrivinger.
- Ingen datamigreringer; skjemaet opprettes med `CREATE TABLE IF NOT EXISTS`.

Før produksjon bør følgende på plass: autentisering av operatør, tilgangskontroll på API,
ratelimiting, personvernvurdering, backup, e-postvarsling og en avklart databehandleravtale.
