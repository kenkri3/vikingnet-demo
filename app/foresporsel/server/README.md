# Server – Forespørsel og status

Node HTTP-server uten npm-avhengigheter. Den bruker `node:http` for HTTP og
`node:sqlite` for lagring, og serverer både API-et og frontendfilene i
`app/foresporsel`.

## Krav og start

- Node **24 eller nyere** (testet med Node 24.16). `node:sqlite` er innebygd.
  På Node 22.5–23.3 ligger modulen bak et flagg: bruk
  `node --experimental-sqlite server/server.mjs`.
- Ingen `npm install` nødvendig.

```bash
node server/server.mjs
# http://localhost:4180
```

Fra `package.json`:

```bash
npm start
```

### Miljøvariabler

| Variabel | Standard | Beskrivelse |
| --- | --- | --- |
| `PORT` | `4180` | Port serveren lytter på |
| `HOST` | `0.0.0.0` | Adresse serveren binder til |
| `DB_PATH` | `server/data.db` | Absolutt eller relativ sti til SQLite-filen |

Eksempler:

```bash
PORT=8080 node server/server.mjs
DB_PATH=/data/data.db node server/server.mjs
```

På Windows PowerShell:

```powershell
$env:PORT = "8080"
$env:DB_PATH = "C:\data\foresporsel.db"
node server/server.mjs
```

Databasemappen opprettes hvis den mangler. Ved oppstart skrives adresse, databasefil
og en påminnelse om at dette er en åpen demo.

## Endepunkter

| Metode | Sti | Beskrivelse |
| --- | --- | --- |
| `GET` | `/api/helse` | `{ok: true, modus: "server", tid}`. Brukes av frontend for modusvalg. |
| `GET` | `/api/requests` | Alle forespørsler, nyeste først: `{requests: [...]}` |
| `POST` | `/api/requests` | Opprett: `{tjeneste, dato, navn, telefon, epost, notat}` → `{ref, status, opprettet}` |
| `GET` | `/api/requests/:ref` | Én forespørsel: `{request}` |
| `PATCH` | `/api/requests/:ref` | Endre status: `{status}` → `{request}` |

Statusverdier: `mottatt`, `planlagt`, `utført`. Datoformat: `YYYY-MM-DD`.
Referansenummer er `FS-` pluss fire tegn, uten `0`, `1`, `I` og `O`.

Feil har formen `{feil: {melding, felt?}}` med HTTP 400, 404, 405, 413 eller 500.
CORS er åpent for `GET`, `POST` og `PATCH` fra alle opprinnelser. `OPTIONS` svarer 204.

### curl-eksempler

```bash
# Opprett
curl -i -X POST http://localhost:4180/api/requests \
  -H "Content-Type: application/json" \
  -d '{"tjeneste":"Befaring og tilbud","dato":"2026-11-05","navn":"Ola Nordmann","telefon":"900 00 000","epost":"ola@example.com","notat":"Ønsker befaring av bad."}'

# List alle
curl -i http://localhost:4180/api/requests

# Hent én
curl -i http://localhost:4180/api/requests/FS-3F7K

# Endre status
curl -i -X PATCH http://localhost:4180/api/requests/FS-3F7K \
  -H "Content-Type: application/json" \
  -d '{"status":"planlagt"}'
```

På Windows kan `curl.exe` brukes tilsvarende. I PowerShell er det enklest å legge
JSON-en i en variabel:

```powershell
$kropp = @{
  tjeneste = "Befaring og tilbud"
  dato = "2026-11-05"
  navn = "Ola Nordmann"
  telefon = "900 00 000"
  epost = "ola@example.com"
  notat = "Ønsker befaring av bad."
} | ConvertTo-Json

curl.exe -i -X POST http://localhost:4180/api/requests `
  -H "Content-Type: application/json" -d $kropp
```

### Validering

Serveren validerer på nytt, uavhengig av frontend:

- `tjeneste`: påkrevd, maks 80 tegn
- `dato`: gyldig `YYYY-MM-DD`, i dag eller senere (Europe/Oslo)
- `navn`: 2–80 tegn
- `telefon`: 8–15 siffer, tillater `+`, mellomrom, punktum, bindestrek og parenteser
- `epost`: enkel syntakssjekk, maks 120 tegn
- `notat`: 5–1000 tegn

## Database

SQLite-filen ligger som standard i `server/data.db` og er ignorert av git.

```sql
CREATE TABLE requests (
  ref        TEXT PRIMARY KEY,
  tjeneste   TEXT NOT NULL,
  dato       TEXT NOT NULL,
  navn       TEXT NOT NULL,
  telefon    TEXT NOT NULL,
  epost      TEXT NOT NULL,
  notat      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL CHECK (status IN ('mottatt', 'planlagt', 'utført')),
  opprettet  TEXT NOT NULL,
  oppdatert  TEXT NOT NULL,
  historikk  TEXT NOT NULL
);
```

`historikk` er en JSON-liste med `{status, tid}`. Hvert statusbytte legger til en rad.
Tidspunkter lagres som ISO 8601 i UTC og vises i Europe/Oslo i grensesnittet.

### Nullstille, sikkerhetskopiere og se innhold

```bash
# Nullstill (stopp serveren først)
rm server/data.db server/data.db-wal server/data.db-shm

# Backup
cp server/data.db backup-$(date +%F).db

# Se innhold med sqlite3, hvis det er installert
sqlite3 server/data.db "select ref, status, navn, opprettet from requests order by opprettet desc;"
```

## Deploy

### Railway

1. Lag et prosjekt fra repoet og sett **root directory** til `app/foresporsel`
   (eller behold repoets rot og bruk startkommandoen under).
2. Startkommando: `node server/server.mjs` eller `npm start`.
3. Legg til et volum, monter det for eksempel på `/data`, og sett `DB_PATH=/data/data.db`.
   Uten volum er databasen borte etter neste deploy.
4. `PORT` settes av Railway. Serveren lytter på `0.0.0.0`.
5. Helsekontroll: `/api/helse`.
6. Sett en egen `apiBase` i `config.js` bare hvis frontend serves fra en annen adresse.

### Firebase / Cloud Run

`server.mjs` kan kjøres i en Node-container. Eksempel på `Dockerfile`:

```dockerfile
FROM node:24-slim
WORKDIR /app
COPY . .
ENV PORT=8080
ENV DB_PATH=/data/data.db
EXPOSE 8080
CMD ["node", "server/server.mjs"]
```

Merk: SQLite i Cloud Run er bare varig så lenge containeren lever. For produksjon bør
du bruke Cloud SQL/Firestore eller en tjeneste med persistent disk. Firebase Hosting kan
brukes for frontend alene (lokal modus), eller med rewrite til Cloud Run:

```json
"rewrites": [{ "source": "/api/**", "run": { "serviceId": "foresporsel-api", "region": "europe-north1" } }]
```

## Sikkerhet og produksjon

Dette er en demo:

- Ingen autentisering. Alle kan lese, opprette og endre saker.
- CORS er åpent for alle opprinnelser.
- Ingen ratelimiting, CSRF-beskyttelse eller botvern.
- Ingen kryptering utover det HTTPS-terminering gir hos leverandøren.
- Fullstendige personopplysninger returneres av `GET /api/requests`.

Før produksjon: sett på innlogging for operatør, begrens CORS til kjente domener,
legg på ratelimiting, vurder `DELETE`/anonymisering, ta backup og dokumenter
behandlingen av personopplysninger.
