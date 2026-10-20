/* BTA Elektro AS — interaksjon.
   Alt skjer i nettleseren. Forespørselen forlater ikke siden før brukeren
   selv trykker «Send forespørselen på e-post» i sin egen e-postklient. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- Mobilmeny ---------- */
  var navToggle = $('#navToggle');
  var nav = $('#siteNav');
  var mobil = window.matchMedia('(max-width: 900px)');

  function settMeny(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    nav.hidden = !open;
  }

  if (navToggle && nav) {
    settMeny(!mobil.matches);

    navToggle.addEventListener('click', function () {
      settMeny(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });

    var vedEndretBredde = function () {
      if (!mobil.matches) settMeny(true);
    };

    if (typeof mobil.addEventListener === 'function') {
      mobil.addEventListener('change', vedEndretBredde);
    } else if (typeof mobil.addListener === 'function') {
      mobil.addListener(vedEndretBredde);
    }
  }

  /* ---------- Årstall ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Mottak: forespørsel i tre steg ---------- */
  var form = $('#mottakForm');
  if (!form) return;

  var steg = {
    1: $('#steg1'),
    2: $('#steg2'),
    3: $('#steg3')
  };
  var statusEl = $('#mottakStatus');
  var barEl = $('#mottakBar');
  var feilEl = $('#steg1Feil');
  var kvListe = $('#kvListe');
  var kvRef = $('#kvRef');
  var kvSend = $('#kvSend');
  var steg3Tittel = $('#steg3Tittel');

  var STATUS = {
    1: 'Steg 1 av 3 · Hva gjelder det?',
    2: 'Steg 2 av 3 · Når passer det, og hvem er du?',
    3: 'Steg 3 av 3 · Kvittering'
  };

  function visSteg(n, flyttFokus) {
    [1, 2, 3].forEach(function (i) {
      if (steg[i]) steg[i].hidden = i !== n;
    });
    if (statusEl) statusEl.textContent = STATUS[n];
    if (barEl) barEl.style.width = (n / 3) * 100 + '%';

    if (!flyttFokus) return;
    if (n === 3 && steg3Tittel) {
      steg3Tittel.focus();
    } else {
      var felt = steg[n] ? steg[n].querySelector('input, textarea, button') : null;
      if (felt) felt.focus();
    }
  }

  function valgtType() {
    var radio = form.querySelector('input[name="type"]:checked');
    return radio ? radio.value : '';
  }

  function valgtNaar() {
    var radio = form.querySelector('input[name="naar"]:checked');
    return radio ? radio.value : 'Formiddag';
  }

  function verdi(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function toSiffer(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function lagReferanse() {
    var d = new Date();
    var tall = Math.floor(100 + Math.random() * 900);
    return 'BTA-' + d.getFullYear() + toSiffer(d.getMonth() + 1) + toSiffer(d.getDate()) + '-' + tall;
  }

  function leggRad(term, tekst) {
    if (!tekst) return;
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = tekst;
    rad.appendChild(dt);
    rad.appendChild(dd);
    kvListe.appendChild(rad);
  }

  function byggKvittering(data) {
    if (!kvListe) return;
    kvListe.textContent = '';
    leggRad('Gjelder', data.type);
    leggRad('Når', data.naar);
    leggRad('Navn', data.navn);
    leggRad('Telefon', data.telefon);
    leggRad('Sted', data.sted);
    leggRad('Merknad', data.merknad);

    if (kvRef) kvRef.textContent = data.ref;

    if (kvSend) {
      var emne = 'Forespørsel om befaring – ' + data.type;
      var kropp = [
        'Hei,',
        '',
        'jeg ønsker befaring.',
        '',
        'Gjelder: ' + data.type,
        'Når: ' + data.naar,
        'Navn: ' + data.navn,
        'Telefon: ' + data.telefon,
        data.sted ? 'Adresse eller sted: ' + data.sted : '',
        data.merknad ? 'Merknad: ' + data.merknad : '',
        '',
        'Referanse: ' + data.ref
      ].filter(function (linje) { return linje !== ''; }).join('\n');

      kvSend.setAttribute('href', 'mailto:post@bta.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp));
    }
  }

  /* Neste: steg 1 → 2 */
  var nesteKnapp = form.querySelector('[data-neste]');
  if (nesteKnapp) {
    nesteKnapp.addEventListener('click', function () {
      if (!valgtType()) {
        if (feilEl) feilEl.hidden = false;
        var radio = form.querySelector('input[name="type"]');
        if (radio) radio.focus();
        return;
      }
      if (feilEl) feilEl.hidden = true;
      visSteg(2, true);
    });
  }

  form.addEventListener('change', function (event) {
    if (event.target && event.target.name === 'type' && feilEl) feilEl.hidden = true;
  });

  /* Tilbake */
  $$('[data-tilbake]', form).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      visSteg(Number(knapp.getAttribute('data-tilbake')), true);
    });
  });

  /* Steg 2 → kvittering */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!valgtType()) {
      visSteg(1, true);
      return;
    }

    if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

    var data = {
      type: valgtType(),
      naar: valgtNaar(),
      navn: verdi('navn'),
      telefon: verdi('telefon'),
      sted: verdi('sted'),
      merknad: verdi('merknad'),
      ref: lagReferanse()
    };

    byggKvittering(data);
    visSteg(3, true);
  });

  /* Ny forespørsel */
  var resetKnapp = $('#kvReset');
  if (resetKnapp) {
    resetKnapp.addEventListener('click', function () {
      form.reset();
      if (kvListe) kvListe.textContent = '';
      if (feilEl) feilEl.hidden = true;
      visSteg(1, true);
    });
  }
})();
