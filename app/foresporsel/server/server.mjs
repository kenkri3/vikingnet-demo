#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Forespørsel og status – API og statisk server
   ---------------------------------------------------------------------------
   Node 22.5+ (node:sqlite). Ingen npm-pakker.

   Kjør:
     node server/server.mjs
     PORT=4180 DB_PATH=./server/data.db node server/server.mjs

   Serveren leverer både API-et og frontendfilene fra app/foresporsel, slik at
   hele demoen kan kjøres på én adresse. /server/ er alltid blokkert.

   API:
     GET    /api/helse
     GET    /api/requests
     POST   /api/requests
     GET    /api/requests/:ref
     PATCH  /api/requests/:ref

   Dette er en demo: CORS er åpent, og API-et har ingen autentisering. Ikke
   legg inn ekte personopplysninger før tilgangen er beskyttet.
--------------------------------------------------------------------------- */

import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { readFile, stat } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";

const HER = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HER, "..");
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(HER, "data.db");
const PORT = Number.parseInt(process.env.PORT || "4180", 10);
const HOST = process.env.HOST || "0.0.0.0";

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`Ugyldig PORT: ${process.env.PORT}. Bruk et tall mellom 1 og 65535.`);
  process.exit(1);
}

const STATUS = ["mottatt", "planlagt", "utført"];
const STATUS_ETIKETT = { mottatt: "Mottatt", planlagt: "Planlagt", utført: "Utført" };
const REF_ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TIDSSONE = "Europe/Oslo";
const MAKS_KROPP = 64 * 1024;

mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 3000;
  CREATE TABLE IF NOT EXISTS requests (
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
  CREATE INDEX IF NOT EXISTS idx_requests_opprettet
    ON requests (opprettet DESC);
`);

const stmt = {
  alle: db.prepare("SELECT * FROM requests ORDER BY opprettet DESC, ref DESC"),
  en: db.prepare("SELECT * FROM requests WHERE ref = ?"),
  finnes: db.prepare("SELECT 1 AS ja FROM requests WHERE ref = ?"),
  settInn: db.prepare(`
    INSERT INTO requests
      (ref, tjeneste, dato, navn, telefon, epost, notat, status, opprettet, oppdatert, historikk)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  oppdater: db.prepare(
    "UPDATE requests SET status = ?, oppdatert = ?, historikk = ? WHERE ref = ?"
  )
};

/* --------------------------------------------------------------- hjelpere */

class HttpFeil extends Error {
  constructor(status, melding, felt) {
    super(melding);
    this.name = "HttpFeil";
    this.status = status;
    this.felt = felt || null;
  }
}

function tryggJson(tekst, reserve) {
  try {
    const verdi = JSON.parse(tekst);
    return verdi == null ? reserve : verdi;
  } catch {
    return reserve;
  }
}

function tilObjekt(rad) {
  return {
    ref: rad.ref,
    tjeneste: rad.tjeneste,
    dato: rad.dato,
    navn: rad.navn,
    telefon: rad.telefon,
    epost: rad.epost,
    notat: rad.notat,
    status: rad.status,
    opprettet: rad.opprettet,
    oppdatert: rad.oppdatert,
    historikk: tryggJson(rad.historikk, [])
  };
}

function normaliserRef(verdi) {
  return String(verdi == null ? "" : verdi).trim().toUpperCase().replace(/\s+/g, "");
}

function iDagOslo() {
  const deler = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIDSSONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const ut = {};
  for (const del of deler) ut[del.type] = del.value;
  return `${ut.year}-${ut.month}-${ut.day}`;
}

function erGyldigDato(dato) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dato)) return false;
  const d = new Date(`${dato}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dato;
}

function lagNyRef() {
  for (let forsok = 0; forsok < 50; forsok++) {
    let kode = "FS-";
    for (let i = 0; i < 4; i++) kode += REF_ALFABET[randomInt(REF_ALFABET.length)];
    if (!stmt.finnes.get(kode)) return kode;
  }
  throw new HttpFeil(500, "Kunne ikke lage et ledig referansenummer.");
}

function valider(data) {
  const felt = {};
  const tjeneste = String(data?.tjeneste ?? "").trim();
  const dato = String(data?.dato ?? "").trim();
  const navn = String(data?.navn ?? "").trim();
  const telefon = String(data?.telefon ?? "").trim();
  const epost = String(data?.epost ?? "").trim();
  const notat = String(data?.notat ?? "").trim();

  if (!tjeneste) felt.tjeneste = "Velg en tjeneste.";
  else if (tjeneste.length > 80) felt.tjeneste = "Tjenestenavnet er for langt.";

  if (!dato) {
    felt.dato = "Velg en ønsket dato.";
  } else if (!erGyldigDato(dato)) {
    felt.dato = "Oppgi en gyldig dato.";
  } else if (dato < iDagOslo()) {
    felt.dato = "Velg en dato i dag eller senere.";
  }

  if (!navn) felt.navn = "Oppgi navnet ditt.";
  else if (navn.length < 2) felt.navn = "Navnet må ha minst 2 tegn.";
  else if (navn.length > 80) felt.navn = "Navnet er for langt (maks 80 tegn).";

  if (!telefon) {
    felt.telefon = "Oppgi et telefonnummer.";
  } else if (!/^[+()\s.\-0-9]+$/.test(telefon)) {
    felt.telefon = "Bruk bare tall, mellomrom, + og parenteser.";
  } else {
    const siffer = telefon.replace(/\D/g, "").length;
    if (siffer < 8) felt.telefon = "Telefonnummeret må ha minst 8 siffer.";
    else if (siffer > 15) felt.telefon = "Telefonnummeret har for mange siffer.";
  }

  if (!epost) {
    felt.epost = "Oppgi en e-postadresse.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) {
    felt.epost = "Oppgi en gyldig e-postadresse.";
  } else if (epost.length > 120) {
    felt.epost = "E-postadressen er for lang.";
  }

  if (!notat) felt.notat = "Skriv en kort beskrivelse av oppgaven.";
  else if (notat.length < 5) felt.notat = "Beskrivelsen må ha minst 5 tegn.";
  else if (notat.length > 1000) felt.notat = "Beskrivelsen kan ha maks 1000 tegn.";

  return {
    felt,
    verdier: { tjeneste, dato, navn, telefon, epost, notat }
  };
}

function hentPost(ref) {
  const ren = normaliserRef(ref);
  const rad = stmt.en.get(ren);
  if (!rad) {
    throw new HttpFeil(
      404,
      `Fant ingen forespørsel med referansenummer ${ren}.`,
      { ref: "Fant ingen forespørsel med dette referansenummeret." }
    );
  }
  return tilObjekt(rad);
}

/* --------------------------------------------------------------- HTTP-svar */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

function sendJson(res, status, data, ekstra) {
  const kropp = JSON.stringify(data);
  res.writeHead(status, {
    ...CORS,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(kropp),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...ekstra
  });
  res.end(kropp);
}

function sendFeil(res, status, melding, felt) {
  const feil = { melding };
  if (felt) feil.felt = felt;
  sendJson(res, status, { feil });
}

function sendTekst(res, status, tekst) {
  const kropp = `${tekst}\n`;
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(kropp),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(kropp);
}

function metodeFeil(res, tillatte) {
  sendJson(
    res,
    405,
    { feil: { melding: "Metoden er ikke tillatt for dette endepunktet." } },
    { Allow: tillatte.join(", ") }
  );
}

async function lesKropp(req) {
  const deler = [];
  let storrelse = 0;
  for await (const del of req) {
    storrelse += del.length;
    if (storrelse > MAKS_KROPP) {
      throw new HttpFeil(413, "Forespørselen er for stor.");
    }
    deler.push(del);
  }
  if (!storrelse) return {};
  const tekst = Buffer.concat(deler).toString("utf8");
  let data;
  try {
    data = JSON.parse(tekst);
  } catch {
    throw new HttpFeil(400, "Ugyldig JSON i forespørselen.");
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpFeil(400, "Forespørselen må være et JSON-objekt.");
  }
  return data;
}

/* ------------------------------------------------------------------- API */

async function handleApi(req, res, url) {
  const sti = url.pathname.replace(/\/+$/, "") || "/";

  if (sti === "/api/helse") {
    if (req.method !== "GET") return metodeFeil(res, ["GET"]);
    return sendJson(res, 200, {
      ok: true,
      modus: "server",
      tid: new Date().toISOString()
    });
  }

  if (sti === "/api/requests") {
    if (req.method === "GET") {
      return sendJson(res, 200, { requests: stmt.alle.all().map(tilObjekt) });
    }

    if (req.method === "POST") {
      const data = await lesKropp(req);
      const sjekk = valider(data);
      if (Object.keys(sjekk.felt).length) {
        throw new HttpFeil(
          400,
          "Skjemaet har noen feil. Sjekk feltene som er merket.",
          sjekk.felt
        );
      }

      const naa = new Date().toISOString();
      const ref = lagNyRef();
      const historikk = [{ status: "mottatt", tid: naa }];
      const v = sjekk.verdier;

      stmt.settInn.run(
        ref, v.tjeneste, v.dato, v.navn, v.telefon, v.epost, v.notat,
        "mottatt", naa, naa, JSON.stringify(historikk)
      );

      return sendJson(res, 201, { ref, status: "mottatt", opprettet: naa });
    }

    return metodeFeil(res, ["GET", "POST"]);
  }

  const treff = sti.match(/^\/api\/requests\/([^/]+)$/);
  if (treff) {
    let ref;
    try {
      ref = decodeURIComponent(treff[1]);
    } catch {
      throw new HttpFeil(400, "Ugyldig referansenummer i adressen.");
    }

    if (req.method === "GET") {
      return sendJson(res, 200, { request: hentPost(ref) });
    }

    if (req.method === "PATCH") {
      const data = await lesKropp(req);
      const status = String(data?.status ?? "").trim();
      if (!STATUS.includes(status)) {
        throw new HttpFeil(
          400,
          "Status må være mottatt, planlagt eller utført.",
          { status: "Velg en gyldig status." }
        );
      }

      const post = hentPost(ref);
      if (post.status !== status) {
        const naa = new Date().toISOString();
        const historikk = Array.isArray(post.historikk) ? post.historikk : [];
        historikk.push({ status, tid: naa });
        stmt.oppdater.run(status, naa, JSON.stringify(historikk), post.ref);
        post.status = status;
        post.oppdatert = naa;
        post.historikk = historikk;
      }

      return sendJson(res, 200, { request: post });
    }

    return metodeFeil(res, ["GET", "PATCH"]);
  }

  throw new HttpFeil(404, "Ukjent API-endepunkt.");
}

/* ------------------------------------------------------------------ filer */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

async function serveStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendTekst(res, 405, "Metoden er ikke tillatt.");
  }

  let sti;
  try {
    sti = decodeURIComponent(url.pathname);
  } catch {
    return sendTekst(res, 400, "Ugyldig adresse.");
  }

  if (sti === "/") sti = "/index.html";

  // Backslash er et mappeskilletegn på Windows. En URL med %5C kan ellers
  // omgå blokkeringen av /server/ og peke på serverfiler.
  if (sti.includes("\\")) {
    return sendTekst(res, 404, "Fant ikke filen.");
  }

  // Windows og macOS er case-insensitive: sammenlign lower-case, ellers kan
  // /SERVER/data.db omgå blokkeringen av servermappen.
  const lav = sti.toLowerCase();
  if (
    lav === "/server" ||
    lav.startsWith("/server/") ||
    lav.startsWith("/.") ||
    lav.includes("/.") ||
    lav.endsWith(".db") ||
    lav.endsWith(".db-wal") ||
    lav.endsWith(".db-shm")
  ) {
    return sendTekst(res, 404, "Fant ikke filen.");
  }

  const full = path.resolve(APP_ROOT, `.${sti}`);
  if (full !== APP_ROOT && !full.startsWith(`${APP_ROOT}${path.sep}`)) {
    return sendTekst(res, 404, "Fant ikke filen.");
  }

  try {
    const info = await stat(full);
    if (!info.isFile()) throw new Error("ikke en fil");
    const data = await readFile(full);
    const type = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    });
    if (req.method === "HEAD") res.end();
    else res.end(data);
  } catch {
    sendTekst(res, 404, "Fant ikke filen.");
  }
}

/* ------------------------------------------------------------------ server */

const server = createServer(async (req, res) => {
  const start = performance.now();
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { ...CORS, "Content-Length": "0" });
      res.end();
      return;
    }

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (feil) {
    if (res.headersSent) {
      res.end();
    } else if (feil instanceof HttpFeil) {
      sendFeil(res, feil.status, feil.message, feil.felt);
    } else {
      console.error("Uventet feil:", feil);
      sendFeil(res, 500, "Uventet feil på serveren.");
    }
  } finally {
    const ms = Math.round(performance.now() - start);
    console.log(`${req.method} ${url.pathname} ${res.statusCode} ${ms} ms`);
  }
});

server.on("error", (feil) => {
  if (feil.code === "EADDRINUSE") {
    console.error(`Port ${PORT} er opptatt. Velg en annen med PORT=...`);
  } else {
    console.error("Serverfeil:", feil);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const visningsvert = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log("");
  console.log("  Forespørsel og status");
  console.log(`  http://${visningsvert}:${PORT}`);
  console.log(`  Database: ${DB_PATH}`);
  console.log("  API: GET/POST /api/requests, GET/PATCH /api/requests/:ref");
  console.log("  Demo uten innlogging. Ikke bruk ekte personopplysninger.");
  console.log("");
});

let lukker = false;
function stopp(signal) {
  if (lukker) return;
  lukker = true;
  console.log(`\nMottok ${signal}. Lukker serveren …`);
  server.close(() => {
    try {
      db.close();
    } catch {
      /* allerede lukket */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGINT", () => stopp("SIGINT"));
process.on("SIGTERM", () => stopp("SIGTERM"));
