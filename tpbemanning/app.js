/*
  TettPå! Bemanning — interaksjon.
  To ting: mobilmeny, og bestillingsflyten i tre steg med kvittering.
  Alt kjører klient-side; ingenting samles inn og ingenting sendes herfra.
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

    var varMobil = mobil.matches;
    mobil.addEventListener('change', function (hendelse) {
      if (hendelse.matches !== varMobil) {
        varMobil = hendelse.matches;
        settMeny(!hendelse.matches);
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Bestill en prat — tre steg, sammendrag og kvittering
     ------------------------------------------------------------------ */

  var form = document.getElementById('bp');
  var bestill = document.getElementById('bestill');
  if (!form || !bestill) return;

  var stegEls = form.querySelectorAll('[data-steg]');
  var punkter = bestill.querySelectorAll('[data-punkt]');
  var rolleKnapper = bestill.querySelectorAll('[data-rolle]');
  var omrade = document.getElementById('bp-omrade');
  var navn = document.getElementById('bp-navn');
  var telefon = document.getElementById('bp-tel');
  var epost = document.getElementById('bp-epost');
  var melding = document.getElementById('bp-melding');
  var sammendrag = document.getElementById('bp-sammendrag');
  var sendLenke = document.getElementById('bp-send');
  var kvittering = document.getElementById('bp-kvittering');
  var kvitteringListe = document.getElementById('bp-kvittering-liste');
  var kvitteringTittel = document.getElementById('bp-kvittering-tittel');
  var igjenLenke = document.getElementById('bp-igjen');
  var nullstill = document.getElementById('bp-nullstill');

  var rolleNavn = {
    oppdragsgiver: 'Oppdragsgiver',
    arbeidssoker: 'Arbeidssøker'
  };

  var aktivtSteg = 1;
  var valgtRolle = '';

  function feilmelding(steg, vis) {
    var el = bestill.querySelector('[data-feil="' + steg + '"]');
    if (el) el.hidden = !vis;
  }

  function visSteg(n, flyttFokus) {
    aktivtSteg = n;

    Array.prototype.forEach.call(stegEls, function (el) {
      el.hidden = Number(el.getAttribute('data-steg')) !== n;
    });

    Array.prototype.forEach.call(punkter, function (punkt) {
      var nr = Number(punkt.getAttribute('data-punkt'));
      punkt.classList.toggle('is-naa', nr === n);
      punkt.classList.toggle('is-ferdig', nr < n);
    });

    feilmelding(1, false);
    feilmelding(2, false);

    if (!flyttFokus) return;

    if (n === 1) {
      var første = bestill.querySelector('[data-rolle]');
      if (første) første.focus();
    } else if (n === 2) {
      if (navn) navn.focus();
    } else {
      if (sendLenke) sendLenke.focus();
    }
  }

  function gyldig(n) {
    if (n === 1) return Boolean(valgtRolle) && Boolean(omrade.value);
    if (n === 2) {
      var navnOk = navn.value.trim().length >= 2;
      var tall = telefon.value.replace(/[^0-9]/g, '').length;
      var epostOk = /.+@.+\..+/.test(epost.value.trim());
      return navnOk && (tall >= 5 || epostOk);
    }
    return true;
  }

  function rader() {
    var liste = [];
    if (valgtRolle) liste.push(['Rolle', rolleNavn[valgtRolle]]);
    if (omrade.value) liste.push(['Fagområde', omrade.value]);
    if (navn.value.trim()) liste.push(['Navn', navn.value.trim()]);
    if (telefon.value.trim()) liste.push(['Telefon', telefon.value.trim()]);
    if (epost.value.trim()) liste.push(['E-post', epost.value.trim()]);
    if (melding.value.trim()) liste.push(['Om behovet', melding.value.trim()]);
    return liste;
  }

  function fyllSammendrag(beholder) {
    beholder.textContent = '';
    rader().forEach(function (rad) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      beholder.appendChild(dt);
      beholder.appendChild(dd);
    });
  }

  function epostAdresse() {
    var emne = 'Forespørsel fra nettsiden';
    if (omrade.value) emne += ' – ' + omrade.value;
    var kropp = rader().map(function (rad) {
      return rad[0] + ': ' + rad[1];
    });
    return 'mailto:post@tpbemanning.no'
      + '?subject=' + encodeURIComponent(emne)
      + '&body=' + encodeURIComponent(kropp.join('\n'));
  }

  function gaaVidere() {
    if (!gyldig(aktivtSteg)) {
      feilmelding(aktivtSteg, true);
      return;
    }

    if (aktivtSteg === 1) {
      visSteg(2, true);
      return;
    }

    if (aktivtSteg === 2) {
      fyllSammendrag(sammendrag);
      sendLenke.href = epostAdresse();
      visSteg(3, true);
    }
  }

  Array.prototype.forEach.call(rolleKnapper, function (knapp) {
    knapp.addEventListener('click', function () {
      valgtRolle = knapp.getAttribute('data-rolle');
      Array.prototype.forEach.call(rolleKnapper, function (annen) {
        annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
      });
      feilmelding(1, false);
    });
  });

  Array.prototype.forEach.call(bestill.querySelectorAll('[data-neste]'), function (knapp) {
    knapp.addEventListener('click', gaaVidere);
  });

  Array.prototype.forEach.call(bestill.querySelectorAll('[data-forrige]'), function (knapp) {
    knapp.addEventListener('click', function () {
      if (aktivtSteg > 1) visSteg(aktivtSteg - 1, true);
    });
  });

  form.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    gaaVidere();
  });

  sendLenke.addEventListener('click', function () {
    fyllSammendrag(kvitteringListe);
    igjenLenke.href = sendLenke.href;
    form.hidden = true;
    kvittering.hidden = false;
    kvitteringTittel.setAttribute('tabindex', '-1');
    kvitteringTittel.focus();
  });

  if (nullstill) {
    nullstill.addEventListener('click', function () {
      form.reset();
      valgtRolle = '';
      Array.prototype.forEach.call(rolleKnapper, function (knapp) {
        knapp.setAttribute('aria-pressed', 'false');
      });
      kvittering.hidden = true;
      form.hidden = false;
      visSteg(1, true);
    });
  }

  visSteg(1, false);
})();
