/* ---------------------------------------------------------------------------
   Forespørsel og status – datalag
   ---------------------------------------------------------------------------
   To adaptere med samme kontrakt:

     POST   /api/requests        {tjeneste, dato, navn, telefon, epost, notat}
                                 -> {ref, status, opprettet}
     GET    /api/requests        -> {requests: [...]}
     GET    /api/requests/:ref   -> {request}
     PATCH  /api/requests/:ref   {status} -> {request}

   "server" bruker fetch mot API-et. "lokal" bruker localStorage og er ment for
   GitHub Pages og andre statiske demoer. Begge validerer like strengt og
   returnerer samme former, også ved feil: {feil: {melding, felt}}.

   Ingen avhengigheter. Klassiske skript, ingen moduler, slik at siden også
   kan åpnes direkte fra fil.
--------------------------------------------------------------------------- */

window.FS = (function () {
  "use strict";

  var STATUS = ["mottatt", "planlagt", "utført"];
  var STATUS_ETIKETT = { mottatt: "Mottatt", planlagt: "Planlagt", utført: "Utført" };
  var STATUS_BESKRIVELSE = {
    mottatt: "Vi har fått forespørselen og går gjennom den.",
    planlagt: "Tidspunktet er satt. Vi tar kontakt hvis vi trenger mer informasjon.",
    utført: "Oppdraget er utført. Ta kontakt hvis noe ikke ble som forventet."
  };

  function ApiFeil(melding, status, felt) {
    this.name = "ApiFeil";
    this.message = melding;
    this.melding = melding;
    this.status = typeof status === "number" ? status : 0;
    this.felt = felt || null;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiFeil);
  }
  ApiFeil.prototype = Object.create(Error.prototype);
  ApiFeil.prototype.constructor = ApiFeil;

  /* ---------------------------------------------------------------- datoer */

  function iDagISO(tidssone) {
    var sone = tidssone || "Europe/Oslo";
    try {
      var deler = new Intl.DateTimeFormat("en-GB", {
        timeZone: sone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      var ut = {};
      deler.forEach(function (del) { ut[del.type] = del.value; });
      return ut.year + "-" + ut.month + "-" + ut.day;
    } catch (e) {
      var d = new Date();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var dag = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + dag;
    }
  }

  function erGyldigDato(dato) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dato)) return false;
    var d = new Date(dato + "T12:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dato;
  }

  function formaterDato(dato) {
    if (!dato || !erGyldigDato(dato)) return dato || "";
    var d = new Date(dato + "T12:00:00");
    try {
      return new Intl.DateTimeFormat("nb-NO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      }).format(d);
    } catch (e) {
      return dato;
    }
  }

  function formaterDatoKort(dato) {
    if (!dato || !erGyldigDato(dato)) return dato || "";
    var d = new Date(dato + "T12:00:00");
    try {
      return new Intl.DateTimeFormat("nb-NO", {
        day: "numeric", month: "short", year: "numeric"
      }).format(d);
    } catch (e) {
      return dato;
    }
  }

  function formaterTidspunkt(iso, tidssone) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var sone = tidssone || "Europe/Oslo";
    try {
      var dag = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric", month: "long", year: "numeric", timeZone: sone
      }).format(d);
      var klokke = new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit", minute: "2-digit", timeZone: sone
      }).format(d);
      return dag + " kl. " + klokke;
    } catch (e) {
      return d.toLocaleString("nb-NO");
    }
  }

  function formaterKortTid(iso, tidssone) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var sone = tidssone || "Europe/Oslo";
    try {
      var dag = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric", month: "short", timeZone: sone
      }).format(d);
      var klokke = new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit", minute: "2-digit", timeZone: sone
      }).format(d);
      return dag + " " + klokke;
    } catch (e) {
      return d.toLocaleString("nb-NO");
    }
  }

  function formaterKlokke(dato) {
    var d = dato instanceof Date ? dato : new Date(dato);
    if (isNaN(d.getTime())) return "";
    try {
      return new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit", minute: "2-digit"
      }).format(d);
    } catch (e) {
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
  }

  /* ------------------------------------------------------------ validering */

  function normaliserRef(verdi) {
    return String(verdi == null ? "" : verdi).trim().toUpperCase().replace(/\s+/g, "");
  }

  function validerForesporsel(data, valg) {
    var felt = {};
    var tjeneste = String((data && data.tjeneste) || "").trim();
    var dato = String((data && data.dato) || "").trim();
    var navn = String((data && data.navn) || "").trim();
    var telefon = String((data && data.telefon) || "").trim();
    var epost = String((data && data.epost) || "").trim();
    var notat = String((data && data.notat) || "").trim();
    var tidssone = (valg && valg.tidssone) || "Europe/Oslo";

    if (!tjeneste) felt.tjeneste = "Velg en tjeneste.";
    else if (tjeneste.length > 80) felt.tjeneste = "Tjenestenavnet er for langt.";

    if (!dato) {
      felt.dato = "Velg en ønsket dato.";
    } else if (!erGyldigDato(dato)) {
      felt.dato = "Oppgi en gyldig dato.";
    } else if (dato < iDagISO(tidssone)) {
      felt.dato = "Velg en dato i dag eller senere.";
    }

    if (!navn) {
      felt.navn = "Oppgi navnet ditt.";
    } else if (navn.length < 2) {
      felt.navn = "Navnet må ha minst 2 tegn.";
    } else if (navn.length > 80) {
      felt.navn = "Navnet er for langt (maks 80 tegn).";
    }

    if (!telefon) {
      felt.telefon = "Oppgi et telefonnummer.";
    } else if (!/^[+()\s.\-0-9]+$/.test(telefon)) {
      felt.telefon = "Bruk bare tall, mellomrom, + og parenteser.";
    } else {
      var siffer = telefon.replace(/\D/g, "").length;
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

    if (!notat) {
      felt.notat = "Skriv en kort beskrivelse av oppgaven.";
    } else if (notat.length < 5) {
      felt.notat = "Beskrivelsen må ha minst 5 tegn.";
    } else if (notat.length > 1000) {
      felt.notat = "Beskrivelsen kan ha maks 1000 tegn.";
    }

    return {
      ok: Object.keys(felt).length === 0,
      felt: felt,
      verdier: {
        tjeneste: tjeneste,
        dato: dato,
        navn: navn,
        telefon: telefon,
        epost: epost,
        notat: notat
      }
    };
  }

  /* ------------------------------------------------------ lokal lagring */

  function lagRef(unike) {
    var alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (var forsok = 0; forsok < 50; forsok++) {
      var kode = "FS-";
      for (var i = 0; i < 4; i++) {
        kode += alfabet.charAt(Math.floor(Math.random() * alfabet.length));
      }
      if (!unike.has(kode)) return kode;
    }
    throw new ApiFeil("Kunne ikke lage et ledig referansenummer. Prøv igjen.", 500);
  }

  function lagLokalApi(config) {
    var nokkel = (config.lokalNokkel || "foresporsel") + ":v1";
    var tidssone = config.tidssone || "Europe/Oslo";

    function les() {
      var ra;
      try {
        ra = window.localStorage.getItem(nokkel);
      } catch (e) {
        throw new ApiFeil("Nettleseren tillater ikke lokal lagring. Prøv en annen nettleser, eller bruk servermodus.", 0);
      }
      if (!ra) return [];
      try {
        var data = JSON.parse(ra);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        if (window.console && console.warn) console.warn("Kunne ikke lese lokal lagring, starter med tom liste.");
        return [];
      }
    }

    function skriv(liste) {
      try {
        window.localStorage.setItem(nokkel, JSON.stringify(liste));
      } catch (e) {
        throw new ApiFeil("Kunne ikke lagre forespørselen i denne nettleseren. Lagringsplassen kan være full.", 0);
      }
    }

    function finn(ref) {
      var ren = normaliserRef(ref);
      var liste = les();
      for (var i = 0; i < liste.length; i++) {
        if (normaliserRef(liste[i].ref) === ren) return { liste: liste, post: liste[i], indeks: i };
      }
      return { liste: liste, post: null, indeks: -1 };
    }

    return {
      modus: "lokal",

      opprett: function (data) {
        var sjekk = validerForesporsel(data, { tidssone: tidssone });
        if (!sjekk.ok) {
          throw new ApiFeil("Skjemaet har noen feil. Sjekk feltene som er merket.", 400, sjekk.felt);
        }
        var liste = les();
        var unike = new Set(liste.map(function (post) { return normaliserRef(post.ref); }));
        var naa = new Date().toISOString();
        var post = {
          ref: lagRef(unike),
          tjeneste: sjekk.verdier.tjeneste,
          dato: sjekk.verdier.dato,
          navn: sjekk.verdier.navn,
          telefon: sjekk.verdier.telefon,
          epost: sjekk.verdier.epost,
          notat: sjekk.verdier.notat,
          status: "mottatt",
          opprettet: naa,
          oppdatert: naa,
          historikk: [{ status: "mottatt", tid: naa }]
        };
        liste.push(post);
        skriv(liste);
        return { ref: post.ref, status: post.status, opprettet: post.opprettet };
      },

      hentAlle: function () {
        var liste = les().slice().sort(function (a, b) {
          return String(b.opprettet).localeCompare(String(a.opprettet));
        });
        return { requests: liste };
      },

      hentEn: function (ref) {
        var treff = finn(ref);
        if (!treff.post) {
          throw new ApiFeil("Fant ingen forespørsel med referansenummer " + normaliserRef(ref) + ".", 404, { ref: "Fant ingen forespørsel med dette referansenummeret." });
        }
        return { request: treff.post };
      },

      settStatus: function (ref, status) {
        status = String(status == null ? "" : status).trim();
        if (STATUS.indexOf(status) === -1) {
          throw new ApiFeil("Ukjent status.", 400, { status: "Status må være mottatt, planlagt eller utført." });
        }
        var treff = finn(ref);
        if (!treff.post) {
          throw new ApiFeil("Fant ingen forespørsel med referansenummer " + normaliserRef(ref) + ".", 404, { ref: "Fant ingen forespørsel med dette referansenummeret." });
        }
        if (treff.post.status !== status) {
          var naa = new Date().toISOString();
          treff.post.status = status;
          treff.post.oppdatert = naa;
          if (!Array.isArray(treff.post.historikk)) treff.post.historikk = [];
          treff.post.historikk.push({ status: status, tid: naa });
          treff.liste[treff.indeks] = treff.post;
          skriv(treff.liste);
        }
        return { request: treff.post };
      }
    };
  }

  /* --------------------------------------------------------- server-API */

  function lagServerApi(config) {
    var base = String(config.apiBase || "").replace(/\/+$/, "");

    function kall(sti, valg) {
      valg = valg || {};
      var kontroller = new AbortController();
      var timer = setTimeout(function () { kontroller.abort(); }, 12000);
      var init = {
        method: valg.method || "GET",
        headers: { Accept: "application/json" },
        signal: kontroller.signal,
        cache: "no-store"
      };
      if (valg.body !== undefined) {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(valg.body);
      }
      return fetch(base + sti, init)
        .then(function (svar) {
          return svar.text().then(function (tekst) {
            var data = null;
            try { data = tekst ? JSON.parse(tekst) : null; } catch (e) { data = null; }
            if (!svar.ok) {
              var feil = data && data.feil;
              throw new ApiFeil(
                (feil && feil.melding) || "Serveren svarte med en feil (HTTP " + svar.status + ").",
                svar.status,
                (feil && feil.felt) || null
              );
            }
            if (!data) throw new ApiFeil("Serveren svarte med ugyldig data.", 502);
            return data;
          });
        })
        .catch(function (feil) {
          if (feil instanceof ApiFeil) throw feil;
          if (feil && feil.name === "AbortError") {
            throw new ApiFeil("Serveren svarte ikke i tide. Prøv igjen.", 0);
          }
          throw new ApiFeil("Får ikke kontakt med serveren. Sjekk nettverket og prøv igjen.", 0);
        })
        .finally(function () { clearTimeout(timer); });
    }

    return {
      modus: "server",

      opprett: function (data) {
        return kall("/api/requests", { method: "POST", body: data }).then(function (svar) {
          if (!svar.ref) throw new ApiFeil("Serveren returnerte ikke et referansenummer.", 502);
          return svar;
        });
      },

      hentAlle: function () {
        return kall("/api/requests").then(function (svar) {
          if (!svar || !Array.isArray(svar.requests)) {
            throw new ApiFeil("Serveren returnerte en uventet svarliste.", 502);
          }
          return svar;
        });
      },

      hentEn: function (ref) {
        return kall("/api/requests/" + encodeURIComponent(normaliserRef(ref))).then(function (svar) {
          if (!svar || !svar.request) throw new ApiFeil("Serveren returnerte ingen forespørsel.", 502);
          return svar;
        });
      },

      settStatus: function (ref, status) {
        return kall("/api/requests/" + encodeURIComponent(normaliserRef(ref)), {
          method: "PATCH",
          body: { status: status }
        }).then(function (svar) {
          if (!svar || !svar.request) throw new ApiFeil("Serveren returnerte ingen forespørsel.", 502);
          return svar;
        });
      }
    };
  }

  /* ------------------------------------------------------------- modus */

  function velgModus(config) {
    if (config.modus === "lokal") return Promise.resolve("lokal");
    if (config.modus === "server") return Promise.resolve("server");
    // Er apiBase satt, er API-et bevisst valgt. Da skal vi ikke falle tilbake
    // til lokal lagring bare fordi et helsesjekk-timeout inntreffer.
    if (config.apiBase) return Promise.resolve("server");

    var base = String(config.apiBase || "").replace(/\/+$/, "");
    var kontroller = new AbortController();
    var timer = setTimeout(function () { kontroller.abort(); }, 1800);

    return fetch(base + "/api/helse", {
      headers: { Accept: "application/json" },
      signal: kontroller.signal,
      cache: "no-store"
    })
      .then(function (svar) {
        if (!svar.ok) return "lokal";
        return svar.json().then(function (data) {
          return data && data.ok === true ? "server" : "lokal";
        });
      })
      .catch(function (feil) {
        // Et timeout kan bety at API-et er tregt, ikke at det mangler. Velg
        // server og la selve forespørselen vise eventuell feil. Nettverksfeil
        // (for eksempel file:// eller offline) faller tilbake til lokal.
        if (feil && feil.name === "AbortError") return "server";
        return "lokal";
      })
      .finally(function () { clearTimeout(timer); });
  }

  function lagApi(config) {
    var indre = null;
    var modus = null;
    var klarPromise = null;

    function klar() {
      if (!klarPromise) {
        klarPromise = velgModus(config).then(function (valgt) {
          modus = valgt;
          indre = valgt === "server" ? lagServerApi(config) : lagLokalApi(config);
          return indre;
        });
      }
      return klarPromise;
    }

    return {
      init: function () { return klar().then(function () { return modus; }); },
      modusVerdi: function () { return modus; },
      opprett: function (data) { return klar().then(function (a) { return a.opprett(data); }); },
      hentAlle: function () { return klar().then(function (a) { return a.hentAlle(); }); },
      hentEn: function (ref) { return klar().then(function (a) { return a.hentEn(ref); }); },
      settStatus: function (ref, status) { return klar().then(function (a) { return a.settStatus(ref, status); }); }
    };
  }

  return {
    STATUS: STATUS,
    STATUS_ETIKETT: STATUS_ETIKETT,
    STATUS_BESKRIVELSE: STATUS_BESKRIVELSE,
    ApiFeil: ApiFeil,
    lagApi: lagApi,
    validerForesporsel: validerForesporsel,
    normaliserRef: normaliserRef,
    iDagISO: iDagISO,
    formaterDato: formaterDato,
    formaterDatoKort: formaterDatoKort,
    formaterTidspunkt: formaterTidspunkt,
    formaterKortTid: formaterKortTid,
    formaterKlokke: formaterKlokke
  };
})();
