/*
  Tønsberg Vaskeri — interaksjon.

  Alt skjer i nettleseren: ingen backend, ingen innsamling, ingen sporing.
  Bestillingen blir liggende i skjemaet til kunden selv åpner den som e-post
  til ole@tonsbergvaskeri.no. Skjortekalkulatoren bruker deres egen publiserte
  sats: kr 45,- pr. stk.
*/

(function () {
  'use strict';

  // Uten denne klassen er alt innhold synlig, selv om JS feiler.
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------- meny */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.hasAttribute('hidden');
      if (open) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (event) {
      if (!event.target.closest('a')) return;
      if (!window.matchMedia('(max-width: 900px)').matches) return;
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* -------------------------------------------------------------- reveal */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var los = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(los, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(los, function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------- årstall */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------- skjortekalkulator */

  var SATS = 45; // kr pr. stk., deres egen sats
  var antallFelt = document.getElementById('skjorter');

  if (antallFelt) {
    var antallUt = document.querySelector('[data-kalk-antall]');
    var sumUt = document.querySelector('[data-kalk-sum]');
    var formater = function (tall) {
      return tall.toLocaleString('nb-NO').replace(/\u00a0/g, ' ');
    };

    var regn = function () {
      var antall = Math.round(Number(antallFelt.value));
      if (!isFinite(antall) || antall < 0) antall = 0;
      if (antall > 500) {
        antall = 500;
        antallFelt.value = '500';
      }
      if (antallUt) antallUt.textContent = String(antall);
      if (sumUt) sumUt.textContent = formater(antall * SATS);
    };

    antallFelt.addEventListener('input', regn);
    antallFelt.addEventListener('change', regn);
    regn();
  }

  /* ------------------------------------------------------------ bestilling */

  var skjema = document.querySelector('[data-bestilling]');
  if (!skjema) return;

  var steg = Array.prototype.slice.call(skjema.querySelectorAll('[data-steg]'));
  var knappNeste = skjema.querySelector('[data-neste]');
  var knappTilbake = skjema.querySelector('[data-tilbake]');
  var knappLagre = skjema.querySelector('[data-lagre]');
  var stegTeller = document.querySelector('[data-steg-nr]');
  var framdrift = Array.prototype.slice.call(document.querySelectorAll('.framdrift li'));
  var panel = document.querySelector('.skjema-panel');
  var kvittering = document.querySelector('[data-kvittering]');
  var kvRader = kvittering ? kvittering.querySelector('[data-kv-rader]') : null;
  var kvRef = kvittering ? kvittering.querySelector('[data-kv-ref]') : null;
  var kvSend = kvittering ? kvittering.querySelector('[data-kv-send]') : null;
  var aktivt = 1;

  var datoFelt = document.getElementById('dato');
  if (datoFelt) {
    var iDag = new Date();
    var iso = iDag.getFullYear() + '-' +
      String(iDag.getMonth() + 1).padStart(2, '0') + '-' +
      String(iDag.getDate()).padStart(2, '0');
    datoFelt.min = iso;
  }

  function hentFelt(id) {
    return document.getElementById(id);
  }

  function visFeil(beholder, melding) {
    var p = beholder.querySelector('[data-feil]');
    if (!p) return;
    if (melding) {
      p.textContent = melding;
      p.hidden = false;
    } else {
      p.textContent = '';
      p.hidden = true;
    }
  }

  function ryddFeil() {
    steg.forEach(function (el) {
      visFeil(el, '');
    });
  }

  function visSteg(n, flyttFokus) {
    aktivt = n;
    steg.forEach(function (el, i) {
      el.hidden = i + 1 !== n;
      el.setAttribute('tabindex', '-1');
    });

    framdrift.forEach(function (li) {
      var nr = Number(li.getAttribute('data-fram'));
      li.classList.toggle('er-her', nr === n);
      li.classList.toggle('er-klar', nr < n);
    });

    if (stegTeller) stegTeller.textContent = String(n);
    if (knappTilbake) knappTilbake.hidden = n === 1;
    if (knappNeste) knappNeste.hidden = n === 3;
    if (knappLagre) knappLagre.hidden = n !== 3;

    // Fokus bare når brukeren selv bytter steg — ellers ville siden åpnet
    // med en fokusramme rundt første steg.
    var aktivtSteg = steg[n - 1];
    if (flyttFokus && aktivtSteg) aktivtSteg.focus({ preventScroll: false });
  }

  function valgteVarer() {
    return Array.prototype.slice
      .call(skjema.querySelectorAll('input[name="vare"]:checked'))
      .map(function (el) { return el.value; });
  }

  function valider(n) {
    var beholder = steg[n - 1];
    if (!beholder) return true;

    if (n === 1 && valgteVarer().length === 0) {
      visFeil(beholder, 'Velg minst én ting som skal vaskes.');
      var forste = beholder.querySelector('input[name="vare"]');
      if (forste) forste.focus();
      return false;
    }

    if (n === 2) {
      var sted = hentFelt('poststed');
      var adresse = hentFelt('adresse');

      if (!sted || !sted.value) {
        visFeil(beholder, 'Velg hvor vi skal hente.');
        if (sted) sted.focus();
        return false;
      }

      if (!adresse || adresse.value.trim().length < 3) {
        visFeil(beholder, 'Fyll ut adressen vi skal hente på.');
        if (adresse) adresse.focus();
        return false;
      }

      if (datoFelt && datoFelt.value && datoFelt.min && datoFelt.value < datoFelt.min) {
        visFeil(beholder, 'Velg en dato som ikke er tilbake i tid.');
        datoFelt.focus();
        return false;
      }
    }

    if (n === 3) {
      var navn = hentFelt('navn');
      var telefon = hentFelt('telefon');
      var epost = hentFelt('epost');

      if (!navn || navn.value.trim().length < 2) {
        visFeil(beholder, 'Fyll ut navnet vi skal spørre etter.');
        if (navn) navn.focus();
        return false;
      }

      var harTlf = telefon && telefon.value.replace(/\D/g, '').length >= 5;
      var harEpost = epost && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim());

      if (!harTlf && !harEpost) {
        visFeil(beholder, 'Fyll ut telefon eller e-post, så vi kommer i kontakt.');
        if (telefon) telefon.focus();
        return false;
      }

      if (!harEpost && epost && epost.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) {
        visFeil(beholder, 'E-postadressen ser ikke helt riktig ut.');
        epost.focus();
        return false;
      }
    }

    visFeil(beholder, '');
    return true;
  }

  function lesDato() {
    if (!datoFelt || !datoFelt.value) return '';
    var deler = datoFelt.value.split('-');
    if (deler.length !== 3) return datoFelt.value;
    return deler[2] + '.' + deler[1] + '.' + deler[0];
  }

  function samle() {
    var rader = [];
    var leggTil = function (merke, verdi) {
      if (!verdi) return;
      rader.push({ merke: merke, verdi: verdi });
    };

    leggTil('Hva', valgteVarer().join(', '));

    var sted = hentFelt('poststed');
    leggTil('Hvor', sted ? sted.value : '');

    var adresse = hentFelt('adresse');
    leggTil('Adresse', adresse ? adresse.value.trim() : '');

    var kunde = skjema.querySelector('input[name="kunde"]:checked');
    leggTil('Kunde', kunde ? kunde.value : '');

    leggTil('Ønsket hentedag', lesDato());

    var navn = hentFelt('navn');
    leggTil('Navn', navn ? navn.value.trim() : '');

    var telefon = hentFelt('telefon');
    leggTil('Telefon', telefon ? telefon.value.trim() : '');

    var epost = hentFelt('epost');
    leggTil('E-post', epost ? epost.value.trim() : '');

    var merknad = hentFelt('merknad');
    leggTil('Merknad', merknad ? merknad.value.trim() : '');

    return rader;
  }

  function lagReferanse() {
    var d = new Date();
    var tall = String(Math.floor(Math.random() * 900) + 100);
    return 'TV-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' + tall;
  }

  function visKvittering() {
    var rader = samle();
    var ref = lagReferanse();

    if (kvRader) {
      kvRader.textContent = '';
      rader.forEach(function (rad) {
        var linje = document.createElement('div');
        linje.className = 'kv-rad';

        var merke = document.createElement('span');
        merke.className = 'kv-rad__k';
        merke.textContent = rad.merke;

        var verdi = document.createElement('span');
        verdi.className = 'kv-rad__v';
        verdi.textContent = rad.verdi;

        linje.appendChild(merke);
        linje.appendChild(verdi);
        kvRader.appendChild(linje);
      });
    }

    if (kvRef) kvRef.textContent = ref;

    if (kvSend) {
      var linjer = rader.map(function (rad) {
        return rad.merke + ': ' + rad.verdi;
      });
      linjer.push('');
      linjer.push('Bestillingen er fylt ut på tonsbergvaskeri.no (' + ref + ').');

      kvSend.setAttribute(
        'href',
        'mailto:ole@tonsbergvaskeri.no?subject=' +
        encodeURIComponent('Bestilling om henting (' + ref + ')') +
        '&body=' + encodeURIComponent(linjer.join('\n'))
      );
    }

    // Kvitteringen ligger i samme panel som skjemaet: panelet blir stående,
    // men toppen, framdriften og selve skjemaet viker for kvitteringen.
    if (panel) panel.classList.add('viser-kvittering');
    if (kvittering) {
      kvittering.hidden = false;
      kvittering.focus();
      if (kvittering.scrollIntoView) {
        kvittering.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  }

  if (knappNeste) {
    knappNeste.addEventListener('click', function () {
      if (!valider(aktivt)) return;
      if (aktivt < 3) visSteg(aktivt + 1, true);
    });
  }

  if (knappTilbake) {
    knappTilbake.addEventListener('click', function () {
      ryddFeil();
      if (aktivt > 1) visSteg(aktivt - 1, true);
    });
  }

  if (knappLagre) {
    knappLagre.addEventListener('click', function () {
      if (!valider(3)) return;
      visKvittering();
    });
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  var kvEndre = kvittering ? kvittering.querySelector('[data-kv-endre]') : null;
  if (kvEndre) {
    kvEndre.addEventListener('click', function () {
      if (kvittering) kvittering.hidden = true;
      if (panel) panel.classList.remove('viser-kvittering');
      visSteg(1, true);
    });
  }

  var kvNy = kvittering ? kvittering.querySelector('[data-kv-ny]') : null;
  if (kvNy) {
    kvNy.addEventListener('click', function () {
      skjema.reset();
      ryddFeil();
      if (kvittering) kvittering.hidden = true;
      if (panel) panel.classList.remove('viser-kvittering');
      visSteg(1, true);
    });
  }

  visSteg(1, false);
})();
