/* ---------------------------------------------------------------------------
   Forespørsel og status – kundekonfigurasjon
   ---------------------------------------------------------------------------
   Dette er den eneste filen som normalt må endres per kunde. Alt nedenfor er
   eksempelverdier: bytt navn, kontaktinfo, farger og tjenester før levering.
   Filen har ingen hemmeligheter og kan ligge åpent på GitHub Pages.

   modus:
     "auto"   – bruker server hvis /api/helse svarer, ellers lokal lagring.
                Er apiBase satt, antas server uten forhåndssjekk.
     "server" – krever API (sett apiBase hvis API-et ligger på en annen adresse).
     "lokal"  – alltid localStorage, også når en server er tilgjengelig.
--------------------------------------------------------------------------- */

window.FS_CONFIG = {
  kunde: {
    navn: "Forespørsel og status",
    slagord: "Bestilling og oppfølging",

    // Eksempelkontakt. Bytt til kundens faktiske adresse og nummer.
    // example.com er reservert for eksempler og kan ikke leveres til.
    epost: "post@example.com",
    telefon: "",
    adresse: "",
    orgNr: ""
  },

  // Fargene settes som CSS-variabler ved oppstart. Bruk hex.
  farger: {
    bakgrunn: "#f4f6f2",
    flate: "#ffffff",
    tekst: "#15211d",
    tekstDempet: "#5a6a64",
    linje: "#dde4df",
    aksent: "#126553",
    aksentMork: "#0c493c",
    aksentLys: "#e6f1ec"
  },

  /* Eksempeltjenester – generiske med vilje. Bytt til kundens egne tjenester,
     beskrivelser og varigheter. id brukes ikke i API-et, bare i skjemaet. */
  tjenester: [
    {
      id: "befaring",
      navn: "Befaring og tilbud",
      beskrivelse: "Vi ser på oppgaven og gir et skriftlig tilbud.",
      varighet: "ca. 45 min"
    },
    {
      id: "montering",
      navn: "Montering",
      beskrivelse: "Montering av møbler, utstyr eller ferdige leveranser.",
      varighet: "ca. 2 timer"
    },
    {
      id: "service",
      navn: "Service og vedlikehold",
      beskrivelse: "Ettersyn, feilsøking eller utbedring av det du har.",
      varighet: "ca. 1 time"
    },
    {
      id: "levering",
      navn: "Levering og oppsett",
      beskrivelse: "Vi leverer, bærer inn og setter opp på avtalt sted.",
      varighet: "ca. 1 time"
    }
  ],

  svartid: "Vi svarer normalt innen én virkedag.",
  tidssone: "Europe/Oslo",

  modus: "auto",

  /* Tom streng = samme adresse som siden. Ved separat API (for eksempel
     Railway) setter du den offentlige API-adressen her, uten skråstrek til slutt. */
  apiBase: "",

  // Nøkkel for lokal lagring. Bruk en egen verdi per kunde/installasjon.
  lokalNokkel: "foresporsel",

  personvern: {
    tekst: "Opplysningene brukes bare til å behandle forespørselen. Ingen sporing, ingen informasjonskapsler og ingen deling med tredjepart.",
    url: ""
  }
};
