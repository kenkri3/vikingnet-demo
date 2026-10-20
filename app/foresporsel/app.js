/* ---------------------------------------------------------------------------
   Forespørsel og status – all grensesnittlogikk
   ---------------------------------------------------------------------------
   Ingen avhengigheter. To sider bruker samme fil:
     body[data-side="kunde"]  – skjema, kvittering, statussjekk
     body[data-side="admin"]  – liste, filter, statusendring

   Brukerdata settes alltid inn med textContent, aldri innerHTML.
--------------------------------------------------------------------------- */

(function () {
  "use strict";

  var CFG = window.FS_CONFIG || {};
  var FS = window.FS;
  var api = FS.lagApi(CFG);
  var TIDSSONE = CFG.tidssone || "Europe/Oslo";
  var side = document.body.getAttribute("data-side");

  /* ------------------------------------------------------------- hjelpere */

  function $(velger, rot) {
    return (rot || document).querySelector(velger);
  }

  function $$(velger, rot) {
    return Array.prototype.slice.call((rot || document).querySelectorAll(velger));
  }

  function el(tag, klasse, tekst) {
    var node = document.createElement(tag);
    if (klasse) node.className = klasse;
    if (tekst !== undefined && tekst !== null) node.textContent = String(tekst);
    return node;
  }

  function settTekst(velger, tekst) {
    var node = $(velger);
    if (node) node.textContent = tekst;
  }

  function leggTilRad(dl, term, verdi, valg) {
    valg = valg || {};
    var rad = el("div");
    if (valg.nokkel) rad.setAttribute("data-nokkel", valg.nokkel);
    rad.appendChild(el("dt", "", term));
    var dd = el("dd");
    if (valg.lenke) {
      var lenke = el("a", "", verdi || "");
      lenke.href = valg.lenke;
      dd.appendChild(lenke);
    } else {
      dd.textContent = verdi === undefined || verdi === null || verdi === "" ? "–" : String(verdi);
    }
    if (valg.bevarLinjer) dd.className = "bevar-linjeskift";
    rad.appendChild(dd);
    dl.appendChild(rad);
    return rad;
  }

  function lagMerke(status) {
    var merke = el("span", "merke merke--" + status);
    merke.appendChild(el("span", "merke__prikk"));
    merke.appendChild(document.createTextNode(FS.STATUS_ETIKETT[status] || status));
    return merke;
  }

  function annonser(node, tekst) {
    if (!node) return;
    node.textContent = "";
    window.setTimeout(function () { node.textContent = tekst; }, 40);
  }

  /* ------------------------------------------------------ kundekonfigurasjon */

  function brukKonfigurasjon() {
    var kunde = CFG.kunde || {};
    var navn = kunde.navn || "Forespørsel og status";
    var slagord = kunde.slagord || "Bestilling og oppfølging";

    $$("[data-kunde-navn]").forEach(function (node) { node.textContent = navn; });
    $$("[data-kunde-slagord]").forEach(function (node) { node.textContent = slagord; });
    document.title = side === "admin" ? "Forespørsler – " + navn : navn + " – bestill og følg saken";

    if (kunde.svartid) settTekst("[data-kunde-svartid]", kunde.svartid);

    var farger = CFG.farger || {};
    var fargeKart = {
      bakgrunn: "--bakgrunn",
      flate: "--flate",
      tekst: "--tekst",
      tekstDempet: "--tekst-dempet",
      linje: "--linje",
      aksent: "--aksent",
      aksentMork: "--aksent-mork",
      aksentLys: "--aksent-lys"
    };
    Object.keys(fargeKart).forEach(function (nokkel) {
      if (farger[nokkel]) document.documentElement.style.setProperty(fargeKart[nokkel], farger[nokkel]);
    });
    if (farger.bakgrunn) {
      var tema = document.querySelector('meta[name="theme-color"]');
      if (tema) tema.setAttribute("content", farger.bakgrunn);
    }

    $$("[data-kontakt-epost]").forEach(function (lenke) {
      if (kunde.epost) {
        lenke.href = "mailto:" + kunde.epost;
        lenke.textContent = kunde.epost;
        lenke.hidden = false;
      } else {
        lenke.hidden = true;
      }
    });

    $$("[data-kontakt-telefon]").forEach(function (lenke) {
      if (kunde.telefon) {
        lenke.href = "tel:" + String(kunde.telefon).replace(/[^\d+]/g, "");
        lenke.textContent = kunde.telefon;
        lenke.hidden = false;
      } else {
        lenke.hidden = true;
      }
    });

    var personvern = CFG.personvern || {};
    if (personvern.tekst) {
      $$("[data-personvern-kort]").forEach(function (node) { node.textContent = personvern.tekst; });
      $$("[data-personvern-tekst]").forEach(function (node) {
        if (personvern.url) {
          var lenke = el("a", "", personvern.tekst);
          lenke.href = personvern.url;
          lenke.target = "_blank";
          lenke.rel = "noopener noreferrer";
          node.replaceWith(lenke);
        } else {
          node.textContent = personvern.tekst;
        }
      });
    }
  }

  function oppdaterDrift() {
    return api.init().then(function (modus) {
      $$("[data-drift]").forEach(function (node) {
        node.hidden = false;
        var tekst = $("[data-drift-tekst]", node);
        if (tekst) tekst.textContent = modus === "server" ? "Server" : "Lokal nettleser";
        node.setAttribute("data-modus", modus);
        node.setAttribute("title", modus === "server"
          ? "Forespørslene lagres i serverens database."
          : "Forespørslene lagres bare i denne nettleseren.");
      });

      var merknad = $("#lagringsmerknad");
      if (merknad) {
        merknad.textContent = modus === "server"
          ? "Forespørslene lagres i serverens database og er felles for alle som åpner siden."
          : "Forespørslene lagres bare i denne nettleseren. De deles ikke mellom enheter eller personer.";
      }

      var lagring = $("#admin-lagring");
      if (lagring) {
        lagring.textContent = modus === "server"
          ? "Servermodus: data ligger i serverens SQLite-database (server/data.db)."
          : "Lokal modus: data ligger i localStorage i denne nettleseren. Tømmer du nettleserdata, forsvinner sakene.";
      }

      return modus;
    }).catch(function () { return null; });
  }

  /* ------------------------------------------------------------------ kunde */

  function startKunde() {
    populerTjenester();
    oppdaterTeller();
    oppdaterTjenesteHjelp();

    var dato = $("#dato");
    if (dato) dato.min = FS.iDagISO(TIDSSONE);

    var skjema = $("#foresporsel-skjema");
    if (skjema) skjema.addEventListener("submit", sendForesporsel);

    $$("#foresporsel-skjema input, #foresporsel-skjema select, #foresporsel-skjema textarea").forEach(function (felt) {
      felt.addEventListener("input", function () { fjernFeltfeil(felt.name); });
      felt.addEventListener("change", function () { fjernFeltfeil(felt.name); });
    });

    var notat = $("#notat");
    if (notat) notat.addEventListener("input", oppdaterTeller);

    var tjeneste = $("#tjeneste");
    if (tjeneste) tjeneste.addEventListener("change", oppdaterTjenesteHjelp);

    var kopier = $("#kopier-ref");
    if (kopier) kopier.addEventListener("click", kopierReferanse);

    var ny = $("#ny-foresporsel");
    if (ny) {
      ny.addEventListener("click", function () {
        nullstillAlleFeil();
        settSkjemaMelding("");
        skjema.reset();
        oppdaterTeller();
        oppdaterTjenesteHjelp();
        history.replaceState(null, "", "#bestill");
        visVisning("skjema");
        var felt = $("#tjeneste");
        if (felt) felt.focus({ preventScroll: true });
      });
    }

    var statusSkjema = $("#status-skjema");
    if (statusSkjema) {
      statusSkjema.addEventListener("submit", function (hendelse) {
        hendelse.preventDefault();
        slaOppStatus($("#status-ref").value);
      });
    }

    var statusRef = $("#status-ref");
    if (statusRef) {
      statusRef.addEventListener("input", function () { fjernFeltfeil("ref"); });
      statusRef.addEventListener("keyup", function (hendelse) {
        if (hendelse.key === "Escape") {
          statusRef.value = "";
          fjernFeltfeil("ref");
        }
      });
    }

    $$("[data-nav-til]").forEach(function (lenke) {
      lenke.addEventListener("click", function (hendelse) {
        hendelse.preventDefault();
        var mal = lenke.getAttribute("data-nav-til");
        if (mal === "status") {
          history.replaceState(null, "", "#status");
          visVisning("status");
          if (statusRef) statusRef.focus({ preventScroll: true });
        } else {
          history.replaceState(null, "", "#bestill");
          visVisning("skjema");
        }
      });
    });

    window.addEventListener("hashchange", ruter);
    ruter();
  }

  function populerTjenester() {
    var select = $("#tjeneste");
    if (!select) return;
    (CFG.tjenester || []).forEach(function (tjeneste) {
      var valg = document.createElement("option");
      valg.value = tjeneste.navn;
      valg.textContent = tjeneste.navn;
      if (tjeneste.beskrivelse) valg.setAttribute("data-beskrivelse", tjeneste.beskrivelse);
      if (tjeneste.varighet) valg.setAttribute("data-varighet", tjeneste.varighet);
      select.appendChild(valg);
    });
  }

  function oppdaterTjenesteHjelp() {
    var select = $("#tjeneste");
    var hjelp = $("#hjelp-tjeneste");
    if (!select || !hjelp) return;
    var valgt = select.options[select.selectedIndex];
    if (valgt && valgt.value) {
      var deler = [];
      if (valgt.getAttribute("data-beskrivelse")) deler.push(valgt.getAttribute("data-beskrivelse"));
      if (valgt.getAttribute("data-varighet")) deler.push(valgt.getAttribute("data-varighet"));
      hjelp.textContent = deler.length
        ? deler.join(" · ")
        : "Velg det som passer best. Du kan beskrive mer nedenfor.";
    } else {
      hjelp.textContent = "Velg det som passer best. Du kan beskrive mer nedenfor.";
    }
  }

  function oppdaterTeller() {
    var notat = $("#notat");
    var teller = $("#notat-teller");
    if (!notat || !teller) return;
    teller.textContent = notat.value.length + " / 1000";
  }

  function settFeltfeil(navn, melding) {
    var beholder = $('[data-felt="' + navn + '"]');
    if (!beholder) return;
    beholder.classList.add("har-feil");
    var felt = beholder.querySelector("input, select, textarea");
    if (felt) felt.setAttribute("aria-invalid", "true");
    var feil = beholder.querySelector(".feil");
    if (feil) {
      feil.textContent = melding;
      feil.hidden = false;
    }
  }

  function fjernFeltfeil(navn) {
    var beholder = $('[data-felt="' + navn + '"]');
    if (!beholder) return;
    beholder.classList.remove("har-feil");
    var felt = beholder.querySelector("input, select, textarea");
    if (felt) felt.removeAttribute("aria-invalid");
    var feil = beholder.querySelector(".feil");
    if (feil) {
      feil.textContent = "";
      feil.hidden = true;
    }
  }

  function nullstillAlleFeil() {
    $$("[data-felt]").forEach(function (beholder) {
      beholder.classList.remove("har-feil");
      var felt = beholder.querySelector("input, select, textarea");
      if (felt) felt.removeAttribute("aria-invalid");
      var feil = beholder.querySelector(".feil");
      if (feil) {
        feil.textContent = "";
        feil.hidden = true;
      }
    });
  }

  function fokuserForsteFeil() {
    var forste = $("[data-felt].har-feil input, [data-felt].har-feil select, [data-felt].har-feil textarea");
    if (forste) forste.focus({ preventScroll: false });
  }

  function settSkjemaMelding(tekst, type) {
    var melding = $("#skjema-melding");
    if (!melding) return;
    melding.textContent = tekst || "";
    melding.className = "skjema-melding" + (type ? " skjema-melding--" + type : "");
  }

  function lesSkjema() {
    return {
      tjeneste: $("#tjeneste") ? $("#tjeneste").value : "",
      dato: $("#dato") ? $("#dato").value : "",
      navn: $("#navn") ? $("#navn").value : "",
      telefon: $("#telefon") ? $("#telefon").value : "",
      epost: $("#epost") ? $("#epost").value : "",
      notat: $("#notat") ? $("#notat").value : ""
    };
  }

  function sendForesporsel(hendelse) {
    hendelse.preventDefault();
    var knapp = $("#send");
    if (!knapp || knapp.getAttribute("aria-busy") === "true") return;

    nullstillAlleFeil();
    settSkjemaMelding("");

    var data = lesSkjema();
    var sjekk = FS.validerForesporsel(data, { tidssone: TIDSSONE });
    if (!sjekk.ok) {
      Object.keys(sjekk.felt).forEach(function (navn) { settFeltfeil(navn, sjekk.felt[navn]); });
      settSkjemaMelding("Sjekk feltene som er merket.", "feil");
      fokuserForsteFeil();
      return;
    }

    knapp.disabled = true;
    knapp.setAttribute("aria-busy", "true");
    var knappTekst = $(".knapp-tekst", knapp);
    if (knappTekst) knappTekst.textContent = "Sender …";

    api.opprett(sjekk.verdier).then(function (svar) {
      visKvittering(sjekk.verdier, svar);
      var skjema = $("#foresporsel-skjema");
      if (skjema) skjema.reset();
      oppdaterTeller();
      oppdaterTjenesteHjelp();
    }).catch(function (feil) {
      if (feil && feil.felt) {
        Object.keys(feil.felt).forEach(function (navn) { settFeltfeil(navn, feil.felt[navn]); });
        fokuserForsteFeil();
      }
      settSkjemaMelding((feil && feil.melding) || "Noe gikk galt. Prøv igjen om litt.", "feil");
    }).then(function () {
      knapp.disabled = false;
      knapp.removeAttribute("aria-busy");
      if (knappTekst) knappTekst.textContent = "Send forespørsel";
    });
  }

  function visKvittering(data, svar) {
    settTekst("#kvittering-ref", svar.ref);
    settTekst("#kvittering-tjeneste", data.tjeneste);
    settTekst("#kvittering-dato", FS.formaterDato(data.dato));
    settTekst("#kvittering-navn", data.navn);
    settTekst("#kvittering-kontakt", data.telefon + " · " + data.epost);
    settTekst("#kvittering-notat", data.notat);

    var status = svar.status || "mottatt";
    var merke = $("#kvittering-merke");
    if (merke) {
      merke.className = "merke merke--" + status;
      merke.textContent = FS.STATUS_ETIKETT[status] || status;
    }
    settTekst("#kvittering-tid", svar.opprettet
      ? "Sendt " + FS.formaterTidspunkt(svar.opprettet, TIDSSONE)
      : "");

    var lenke = $("#kvittering-status-lenke");
    if (lenke) lenke.href = "#status=" + encodeURIComponent(svar.ref);

    history.replaceState(null, "", "#kvittering");
    visVisning("kvittering");
    var tittel = $("#kvittering-tittel");
    if (tittel) tittel.focus({ preventScroll: true });
  }

  function kopierReferanse() {
    var knapp = $("#kopier-ref");
    var ref = $("#kvittering-ref") ? $("#kvittering-ref").textContent : "";
    if (!knapp || !ref) return;
    var opprinnelig = knapp.textContent;
    kopierTekst(ref).then(function (ok) {
      knapp.textContent = ok ? "Kopiert" : "Kunne ikke kopiere";
      window.setTimeout(function () { knapp.textContent = opprinnelig; }, 2000);
    });
  }

  function kopierTekst(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst).then(function () { return true; }).catch(function () {
        return fallbackKopier(tekst);
      });
    }
    return Promise.resolve(fallbackKopier(tekst));
  }

  function fallbackKopier(tekst) {
    try {
      var felt = document.createElement("textarea");
      felt.value = tekst;
      felt.setAttribute("readonly", "readonly");
      felt.style.position = "fixed";
      felt.style.opacity = "0";
      document.body.appendChild(felt);
      felt.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(felt);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* ---------------------------------------------------------------- status */

  function ruter() {
    var hash = location.hash.replace(/^#/, "");
    if (hash.indexOf("status") === 0) {
      visVisning("status");
      var treff = hash.match(/^status(?:=([^&]+))?/);
      if (treff && treff[1]) {
        var ref = decodeURIComponent(treff[1]);
        var felt = $("#status-ref");
        if (felt) felt.value = ref;
        slaOppStatus(ref, { stille: true });
      } else {
        var statusFelt = $("#status-ref");
        if (statusFelt) statusFelt.focus({ preventScroll: true });
      }
    } else {
      visVisning("skjema");
    }
  }

  function visVisning(navn) {
    $$("[data-visning]").forEach(function (seksjon) {
      seksjon.hidden = seksjon.getAttribute("data-visning") !== navn;
    });
    $$(".topp__nav [data-nav-til]").forEach(function (lenke) {
      if (lenke.getAttribute("data-nav-til") === navn) lenke.setAttribute("aria-current", "page");
      else lenke.removeAttribute("aria-current");
    });
    var tittel = $('[data-visning="' + navn + '"] h1');
    if (tittel) {
      if (!tittel.hasAttribute("tabindex")) tittel.setAttribute("tabindex", "-1");
      tittel.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }

  function slaOppStatus(raa, valg) {
    valg = valg || {};
    var ref = FS.normaliserRef(raa);
    var beholder = $("#status-resultat");
    var melding = $("#status-melding");
    var knapp = $("#status-knapp");
    if (!beholder) return;

    fjernFeltfeil("ref");
    if (melding) melding.textContent = "";

    if (!ref) {
      settFeltfeil("ref", "Skriv inn referansenummeret.");
      var felt = $("#status-ref");
      if (felt) felt.focus({ preventScroll: false });
      return;
    }

    if (knapp) {
      knapp.disabled = true;
      knapp.setAttribute("aria-busy", "true");
      knapp.textContent = "Sjekker …";
    }
    beholder.replaceChildren(el("p", "laster", "Henter status …"));

    api.hentEn(ref).then(function (svar) {
      visStatus(svar.request);
      history.replaceState(null, "", "#status=" + encodeURIComponent(ref));
    }).catch(function (feil) {
      if (feil && feil.status === 404) visIkkeFunnet(ref);
      else visStatusFeil((feil && feil.melding) || "Kunne ikke hente status akkurat nå. Prøv igjen om litt.");
    }).then(function () {
      if (knapp) {
        knapp.disabled = false;
        knapp.removeAttribute("aria-busy");
        knapp.textContent = "Sjekk status";
      }
    });
  }

  function visStatus(post) {
    var beholder = $("#status-resultat");
    if (!beholder) return;
    beholder.replaceChildren();

    var kort = el("div", "kort status-kort");
    var topp = el("div", "status-kort__topp");
    var venstre = el("div", "status-kort__ident");
    venstre.appendChild(el("p", "eyebrow", "Referanse " + post.ref));
    var navn = el("h2", "status-kort__navn", post.navn || "Forespørsel");
    navn.tabIndex = -1;
    venstre.appendChild(navn);
    topp.appendChild(venstre);
    topp.appendChild(lagMerke(post.status));
    kort.appendChild(topp);

    kort.appendChild(el("p", "status-forklaring", FS.STATUS_BESKRIVELSE[post.status] || ""));

    var dl = el("dl", "oppsummering oppsummering--kompakt");
    leggTilRad(dl, "Tjeneste", post.tjeneste);
    leggTilRad(dl, "Ønsket dato", FS.formaterDato(post.dato));
    leggTilRad(dl, "Sist oppdatert", FS.formaterTidspunkt(post.oppdatert, TIDSSONE));
    kort.appendChild(dl);

    var tidslinje = el("div", "tidslinje");
    tidslinje.appendChild(el("h3", "tidslinje__tittel", "Status"));
    tidslinje.appendChild(lagTidslinje(post));
    kort.appendChild(tidslinje);

    beholder.appendChild(kort);
    navn.focus({ preventScroll: true });
  }

  function lagTidslinje(post) {
    var liste = el("ol", "tidslinje__liste");
    var historikk = Array.isArray(post.historikk) ? post.historikk : [];
    var tider = {};
    historikk.forEach(function (hendelse) {
      // Siste gang statusen ble satt er mest relevant hvis en sak er rettet.
      if (hendelse && hendelse.status) tider[hendelse.status] = hendelse.tid;
    });

    var naaddIndeks = FS.STATUS.indexOf(post.status);

    FS.STATUS.forEach(function (status, indeks) {
      var naadd = indeks <= naaddIndeks;
      var aktiv = post.status === status;
      var hoppet = naadd && !aktiv && !tider[status];
      var punkt = el("li", "steg"
        + (naadd ? " steg--naadd" : " steg--venter")
        + (hoppet ? " steg--hoppet" : "")
        + (aktiv ? " steg--aktiv" : ""));
      punkt.appendChild(el("span", "steg__prikk"));
      var innhold = el("div", "steg__innhold");
      innhold.appendChild(el("p", "steg__navn", FS.STATUS_ETIKETT[status]));

      var tid;
      if (tider[status]) tid = FS.formaterTidspunkt(tider[status], TIDSSONE);
      else if (aktiv) tid = "Gjeldende status";
      else if (naadd) tid = "Ikke registrert";
      else tid = "Venter";
      innhold.appendChild(el("p", "steg__tid", tid));

      if (aktiv) innhold.appendChild(el("p", "steg__tekst", FS.STATUS_BESKRIVELSE[status]));
      punkt.appendChild(innhold);
      liste.appendChild(punkt);
    });

    return liste;
  }

  function visIkkeFunnet(ref) {
    var beholder = $("#status-resultat");
    if (!beholder) return;
    beholder.replaceChildren();

    var kort = el("div", "kort status-tom");
    kort.appendChild(lagStatusIkon("sporsmal"));
    kort.appendChild(el("h2", "", "Fant ingen forespørsel"));
    var tekst = el("p", "status-tom__tekst", "Vi fant ingen sak med referansenummeret «" + ref + "». Sjekk at det er skrevet riktig.");
    kort.appendChild(tekst);
    if (api.modusVerdi() === "lokal") {
      kort.appendChild(el("p", "finstilt", "Denne demoen lagrer forespørsler i nettleseren der de ble sendt. Nummeret virker derfor bare i samme nettleser."));
    }
    var knapp = el("button", "knapp knapp--sekundær", "Prøv igjen");
    knapp.type = "button";
    knapp.addEventListener("click", function () {
      var felt = $("#status-ref");
      if (felt) {
        felt.focus();
        felt.select();
      }
    });
    kort.appendChild(knapp);
    beholder.appendChild(kort);
    var overskrift = kort.querySelector("h2");
    if (overskrift) {
      overskrift.tabIndex = -1;
      overskrift.focus({ preventScroll: true });
    }
  }

  function visStatusFeil(melding) {
    var beholder = $("#status-resultat");
    if (!beholder) return;
    beholder.replaceChildren();

    var kort = el("div", "kort status-tom");
    kort.appendChild(lagStatusIkon("feil"));
    kort.appendChild(el("h2", "", "Kunne ikke hente status"));
    kort.appendChild(el("p", "status-tom__tekst", melding));
    var knapp = el("button", "knapp knapp--sekundær", "Prøv igjen");
    knapp.type = "button";
    knapp.addEventListener("click", function () {
      slaOppStatus($("#status-ref") ? $("#status-ref").value : "");
    });
    kort.appendChild(knapp);
    beholder.appendChild(kort);
  }

  function lagStatusIkon(type) {
    var ramme = el("span", "status-tom__ikon");
    ramme.setAttribute("aria-hidden", "true");
    if (type === "feil") {
      ramme.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="16.4" r="1" fill="currentColor"/></svg>';
    } else {
      ramme.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.5 11h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    }
    return ramme;
  }

  /* ------------------------------------------------------------------ admin */

  function startAdmin() {
    var saker = [];
    var filter = "alle";
    var laster = false;

    var liste = $("#saker");
    var feilBoks = $("#admin-feil");
    var oppdaterKnapp = $("#oppdater");
    var oppdaterTekst = oppdaterKnapp ? $(".knapp-tekst", oppdaterKnapp) : null;
    var melding = $("#admin-melding");
    var sistOppdatert = $("#sist-oppdatert");

    function visFeil(tekst) {
      if (!feilBoks) return;
      feilBoks.textContent = tekst;
      feilBoks.hidden = false;
    }

    function skjulFeil() {
      if (!feilBoks) return;
      feilBoks.hidden = true;
      feilBoks.textContent = "";
    }

    function last() {
      if (laster) return;
      laster = true;
      if (oppdaterKnapp) oppdaterKnapp.disabled = true;
      if (oppdaterTekst) oppdaterTekst.textContent = "Oppdaterer …";

      api.hentAlle().then(function (svar) {
        saker = svar.requests || [];
        skjulFeil();
        tegn();
        if (sistOppdatert) sistOppdatert.textContent = "Oppdatert " + FS.formaterKlokke(new Date());
        annonser(melding, saker.length + (saker.length === 1 ? " forespørsel." : " forespørsler."));
      }).catch(function (feil) {
        visFeil((feil && feil.melding) || "Kunne ikke hente forespørsler.");
        if (!saker.length && liste) {
          liste.replaceChildren(tomtElement("feil"));
        }
        if (sistOppdatert) sistOppdatert.textContent = "Ikke oppdatert";
      }).then(function () {
        laster = false;
        if (oppdaterKnapp) oppdaterKnapp.disabled = false;
        if (oppdaterTekst) oppdaterTekst.textContent = "Oppdater";
      });
    }

    function oppdaterTellinger() {
      var antall = { alle: saker.length, mottatt: 0, planlagt: 0, utført: 0 };
      saker.forEach(function (sak) {
        if (antall[sak.status] !== undefined) antall[sak.status] += 1;
      });
      $$("#filter .chip").forEach(function (chip) {
        var nokkel = chip.getAttribute("data-filter");
        var tall = $(".chip__tall", chip);
        if (tall) tall.textContent = antall[nokkel] || 0;
        chip.setAttribute("aria-pressed", String(nokkel === filter));
      });
    }

    function tegn() {
      if (!liste) return;
      oppdaterTellinger();
      var synlige = filter === "alle" ? saker : saker.filter(function (sak) { return sak.status === filter; });
      liste.replaceChildren();
      if (!synlige.length) {
        liste.appendChild(tomtElement(saker.length ? "filter" : "tomt"));
        return;
      }
      synlige.forEach(function (sak) { liste.appendChild(lagSak(sak)); });
    }

    function tomtElement(type) {
      var boks = el("li", "tom");
      var ikon = el("span", "tom__ikon");
      ikon.setAttribute("aria-hidden", "true");

      if (type === "filter") {
        ikon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        boks.appendChild(ikon);
        boks.appendChild(el("h2", "tom__tittel", "Ingen saker med status «" + (FS.STATUS_ETIKETT[filter] || filter) + "»"));
        boks.appendChild(el("p", "tom__tekst", "Bytt filter for å se de andre sakene."));
        var visAlle = el("button", "knapp knapp--sekundær", "Vis alle");
        visAlle.type = "button";
        visAlle.addEventListener("click", function () {
          filter = "alle";
          tegn();
          var chip = $('#filter [data-filter="alle"]');
          if (chip) chip.focus();
        });
        boks.appendChild(visAlle);
      } else if (type === "feil") {
        ikon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="16.4" r="1" fill="currentColor"/></svg>';
        boks.appendChild(ikon);
        boks.appendChild(el("h2", "tom__tittel", "Fikk ikke hentet forespørsler"));
        boks.appendChild(el("p", "tom__tekst", "Sjekk at serveren kjører, og trykk Oppdater."));
        var prov = el("button", "knapp knapp--sekundær", "Prøv igjen");
        prov.type = "button";
        prov.addEventListener("click", last);
        boks.appendChild(prov);
      } else {
        ikon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M7 4.5h10a2 2 0 0 1 2 2v13l-3-2-2 2-2-2-2 2-3-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9h6M9 12.5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
        boks.appendChild(ikon);
        boks.appendChild(el("h2", "tom__tittel", "Ingen forespørsler ennå"));
        boks.appendChild(el("p", "tom__tekst", "Når noen sender skjemaet på kundesiden, dukker saken opp her. Du kan gjerne sende en testforespørsel selv."));
        var lenke = el("a", "knapp knapp--sekundær", "Åpne kundesiden");
        lenke.href = "index.html";
        boks.appendChild(lenke);
      }
      return boks;
    }

    function lagSak(sak) {
      var li = el("li", "sak");
      li.setAttribute("data-ref", sak.ref);
      li.setAttribute("data-status", sak.status);

      var hode = el("div", "sak__hode");
      var ident = el("div", "sak__ident");
      ident.appendChild(el("span", "sak__ref", sak.ref));
      ident.appendChild(lagMerke(sak.status));
      ident.appendChild(el("span", "sak__alder", "Sendt " + FS.formaterKortTid(sak.opprettet, TIDSSONE)));
      hode.appendChild(ident);

      var statusvalg = el("div", "statusvalg");
      statusvalg.setAttribute("role", "group");
      statusvalg.setAttribute("aria-label", "Endre status for " + sak.ref);
      FS.STATUS.forEach(function (status) {
        var knapp = el("button", "statusvalg__knapp", FS.STATUS_ETIKETT[status]);
        knapp.type = "button";
        knapp.setAttribute("data-status", status);
        knapp.setAttribute("aria-pressed", String(sak.status === status));
        knapp.addEventListener("click", function () { endreStatus(sak, status, li, statusvalg); });
        statusvalg.appendChild(knapp);
      });
      hode.appendChild(statusvalg);
      li.appendChild(hode);

      var hoved = el("div", "sak__hoved");
      hoved.appendChild(el("h2", "sak__navn", sak.navn));
      var meta = el("p", "sak__meta");
      meta.appendChild(el("span", "sak__tjeneste", sak.tjeneste));
      meta.appendChild(el("span", "sak__skille", "·"));
      meta.appendChild(el("span", "", "Ønsket " + FS.formaterDatoKort(sak.dato)));
      hoved.appendChild(meta);
      li.appendChild(hoved);

      var detaljer = document.createElement("details");
      detaljer.className = "sak__detaljer";
      detaljer.appendChild(el("summary", "", "Se detaljer"));
      var dl = el("dl", "detaljer__liste");
      leggTilRad(dl, "Telefon", sak.telefon, { lenke: "tel:" + String(sak.telefon).replace(/[^\d+]/g, "") });
      leggTilRad(dl, "E-post", sak.epost, { lenke: "mailto:" + sak.epost });
      leggTilRad(dl, "Beskrivelse", sak.notat, { bevarLinjer: true });
      leggTilRad(dl, "Mottatt", FS.formaterTidspunkt(sak.opprettet, TIDSSONE));
      leggTilRad(dl, "Sist endret", FS.formaterTidspunkt(sak.oppdatert, TIDSSONE), { nokkel: "oppdatert" });
      detaljer.appendChild(dl);
      li.appendChild(detaljer);

      return li;
    }

    function oppdaterRad(li, sak) {
      li.setAttribute("data-status", sak.status);
      var gammeltMerke = $(".merke", li);
      if (gammeltMerke) gammeltMerke.replaceWith(lagMerke(sak.status));
      $$(".statusvalg__knapp", li).forEach(function (knapp) {
        knapp.setAttribute("aria-pressed", String(knapp.getAttribute("data-status") === sak.status));
      });
      var rad = $('[data-nokkel="oppdatert"] dd', li);
      if (rad) rad.textContent = FS.formaterTidspunkt(sak.oppdatert, TIDSSONE);
    }

    function endreStatus(sak, status, li, gruppe) {
      if (sak.status === status || gruppe.getAttribute("data-busy") === "1") return;
      var knapper = $$("button", gruppe);
      gruppe.setAttribute("data-busy", "1");
      knapper.forEach(function (knapp) { knapp.disabled = true; });
      var valgt = knapper.filter(function (knapp) { return knapp.getAttribute("data-status") === status; })[0];
      if (valgt) valgt.setAttribute("aria-busy", "true");
      skjulFeil();

      api.settStatus(sak.ref, status).then(function (svar) {
        var oppdatert = svar.request || {};
        Object.keys(oppdatert).forEach(function (nokkel) { sak[nokkel] = oppdatert[nokkel]; });
        oppdaterRad(li, sak);
        oppdaterTellinger();
        annonser(melding, sak.ref + " er satt til " + FS.STATUS_ETIKETT[status] + ".");
        if (filter !== "alle" && sak.status !== filter) {
          li.classList.add("sak--ut");
          window.setTimeout(function () {
            tegn();
            var chip = $('#filter [data-filter="' + filter + '"]');
            if (chip) chip.focus();
          }, 220);
        }
      }).catch(function (feil) {
        visFeil("Kunne ikke endre " + sak.ref + ": " + ((feil && feil.melding) || "ukjent feil."));
        oppdaterRad(li, sak);
      }).then(function () {
        gruppe.removeAttribute("data-busy");
        knapper.forEach(function (knapp) { knapp.disabled = false; });
        if (valgt) valgt.removeAttribute("aria-busy");
      });
    }

    var filterBoks = $("#filter");
    if (filterBoks) {
      filterBoks.addEventListener("click", function (hendelse) {
        var knapp = hendelse.target.closest("button[data-filter]");
        if (!knapp) return;
        filter = knapp.getAttribute("data-filter");
        tegn();
      });
    }

    if (oppdaterKnapp) oppdaterKnapp.addEventListener("click", last);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") last();
    });

    last();
  }

  /* ------------------------------------------------------------------ start */

  document.addEventListener("DOMContentLoaded", function () {
    brukKonfigurasjon();
    oppdaterDrift();
    if (side === "admin") startAdmin();
    else startKunde();
  });
})();
