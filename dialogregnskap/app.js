/*
  Dialog Regnskap AS — interaksjon.

  To ting: mobilmeny og samtalegrunnlaget (tema → kontakt → notat med ferdig
  e-postutkast). Alt kjører i nettleseren. Ingenting sendes til en server og
  ingenting lagres.
*/

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Mobilmeny
     ------------------------------------------------------------------ */

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  var mobil = window.matchMedia('(max-width: 900px)');

  function settMeny(aapen) {
    if (!nav || !toggle) return;
    nav.hidden = !aapen;
    toggle.setAttribute('aria-expanded', aapen ? 'true' : 'false');
  }

  if (nav && toggle) {
    if (mobil.matches) settMeny(false);

    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });

    nav.addEventListener('click', function (hendelse) {
      if (mobil.matches && hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && mobil.matches && !nav.hidden) {
        settMeny(false);
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Samtalegrunnlaget
     ------------------------------------------------------------------ */

  var skjema = document.getElementById('samtale-skjema');

  if (skjema) {
    var stegEls = skjema.querySelectorAll('[data-steg]');
    var statusEl = document.getElementById('steg-status');
    var prikker = document.querySelectorAll('[data-prikk]');
    var nesteKnapp = document.getElementById('neste');
    var tilbakeKnapp = document.getElementById('tilbake');
    var chips = document.querySelectorAll('.chip[data-tema]');
    var epostLenke = document.getElementById('notat-send');
    var aktivtSteg = 1;
    var antallSteg = 3;

    var statusTekst = {
      1: 'Steg 1 av 3: hva vil du ta opp?',
      2: 'Steg 2 av 3: hvem skal vi snakke med?',
      3: 'Steg 3 av 3: notatet er klart'
    };

    function feltNavn(navn) {
      var el = skjema.elements[navn];
      return el ? String(el.value || '').trim() : '';
    }

    function valgteTemaer() {
      return Array.prototype.filter
        .call(chips, function (chip) {
          return chip.getAttribute('aria-pressed') === 'true';
        })
        .map(function (chip) {
          return chip.getAttribute('data-tema');
        });
    }

    function visFeil(navn, vis) {
      var el = skjema.querySelector('[data-feil="' + navn + '"]');
      if (el) el.hidden = !vis;
    }

    function visSteg(n) {
      aktivtSteg = n;

      Array.prototype.forEach.call(stegEls, function (stegEl) {
        stegEl.hidden = Number(stegEl.getAttribute('data-steg')) !== n;
      });

      if (statusEl) statusEl.textContent = statusTekst[n];
      if (nesteKnapp) nesteKnapp.hidden = n === antallSteg;
      if (tilbakeKnapp) tilbakeKnapp.hidden = n === 1;

      Array.prototype.forEach.call(prikker, function (prikk) {
        var nr = Number(prikk.getAttribute('data-prikk'));
        prikk.classList.toggle('er-aktiv', nr === n);
        prikk.classList.toggle('er-ferdig', nr < n);
      });

      if (n === antallSteg) lagNotat();
    }

    function validerSteg1() {
      var ok = valgteTemaer().length > 0;
      visFeil('tema', !ok);
      if (!ok && chips.length) chips[0].focus();
      return ok;
    }

    function validerSteg2() {
      var navnOk = feltNavn('navn').length >= 2;
      var epost = feltNavn('epost');
      var epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost);

      visFeil('navn', !navnOk);
      visFeil('epost', !epostOk);

      if (!navnOk) {
        skjema.elements.navn.focus();
        return false;
      }
      if (!epostOk) {
        skjema.elements.epost.focus();
        return false;
      }
      return true;
    }

    function lagEpost() {
      var tema = valgteTemaer().join(', ');
      var navn = feltNavn('navn');
      var bedrift = feltNavn('bedrift');
      var epost = feltNavn('epost');
      var telefon = feltNavn('telefon');

      var emne = 'Samtale: ' + tema + (bedrift ? ' — ' + bedrift : '');

      var linjer = [
        'Hei Dialog Regnskap,',
        '',
        'Jeg vil gjerne ta en uforpliktende samtale om: ' + tema + '.',
        '',
        'Navn: ' + navn
      ];
      if (bedrift) linjer.push('Bedrift: ' + bedrift);
      linjer.push('E-post: ' + epost);
      if (telefon) linjer.push('Telefon: ' + telefon);
      linjer.push('', 'Hilsen', navn);

      return (
        'mailto:sindre@dialogregnskap.no?subject=' +
        encodeURIComponent(emne) +
        '&body=' +
        encodeURIComponent(linjer.join('\r\n'))
      );
    }

    function lagNotat() {
      var tema = valgteTemaer();
      var bedrift = feltNavn('bedrift');
      var telefon = feltNavn('telefon');

      skjema.querySelector('#notat-tema').textContent = tema.length ? tema.join(', ') : 'Ikke valgt';
      skjema.querySelector('#notat-navn').textContent = feltNavn('navn') || 'Ikke oppgitt';
      skjema.querySelector('#notat-bedrift').textContent = bedrift || 'Ikke oppgitt';
      skjema.querySelector('#notat-epost').textContent = feltNavn('epost') || 'Ikke oppgitt';
      skjema.querySelector('#notat-telefon').textContent = telefon || 'Ikke oppgitt';

      if (epostLenke) epostLenke.href = lagEpost();
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        var valgt = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', valgt ? 'false' : 'true');
        if (!valgt) visFeil('tema', false);
      });
    });

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      if (aktivtSteg === 1 && validerSteg1()) {
        visSteg(2);
        skjema.elements.navn.focus();
      } else if (aktivtSteg === 2 && validerSteg2()) {
        visSteg(3);
      }
    });

    if (tilbakeKnapp) {
      tilbakeKnapp.addEventListener('click', function () {
        if (aktivtSteg > 1) {
          visSteg(aktivtSteg - 1);
          if (aktivtSteg === 2) skjema.elements.navn.focus();
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     3. Årstall i footeren
     ------------------------------------------------------------------ */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());
})();
