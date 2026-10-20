/*
  SmartDok – demoens interaksjon.
  Alt skjer i nettleseren: menyen, oppsummeringen som fylles ut mens du skriver,
  validering og kvitteringen til slutt. Ingen data forlater siden.
*/
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var knapp = document.getElementById('meny-knapp');
  var meny = document.getElementById('hovedmeny');

  function settMeny(aapen) {
    if (!knapp || !meny) return;
    knapp.setAttribute('aria-expanded', String(aapen));
    knapp.setAttribute('aria-label', aapen ? 'Lukk menyen' : 'Åpne menyen');
    meny.classList.toggle('er-aapen', aapen);
  }

  if (knapp && meny) {
    knapp.addEventListener('click', function () {
      settMeny(knapp.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && knapp.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        knapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(false);
    });
  }

  /* ---------- Skjema og kvittering ---------- */

  var skjema = document.getElementById('demof');
  var rutenett = document.querySelector('.demo__rutenett');
  var kvittering = document.getElementById('kvittering');
  var kvitteringTittel = document.getElementById('kvittering-tittel');
  var kvitteringListe = document.getElementById('kvittering-liste');
  var feilboks = document.getElementById('demof-feil');
  var oppsummering = document.getElementById('oppsum-liste');
  var tilbake = document.getElementById('kvittering-tilbake');
  var valgteModuler = [];

  var felt = ['navn', 'firma', 'epost', 'telefon', 'ansatte', 'rolle'];
  var etikett = {
    navn: 'Navn',
    firma: 'Firma',
    epost: 'E-post',
    telefon: 'Telefon',
    ansatte: 'Antall ansatte',
    rolle: 'Rolle',
    melding: 'Melding',
    moduler: 'Moduler'
  };

  function verdi(id) {
    var el = document.getElementById(id);
    return el ? el.value.replace(/\s+/g, ' ').trim() : '';
  }

  function settOppsummering() {
    if (!oppsummering) return;
    felt.forEach(function (navn) {
      var dd = oppsummering.querySelector('[data-felt="' + navn + '"]');
      if (dd) dd.textContent = verdi('f-' + navn) || '–';
    });
    var moduler = oppsummering.querySelector('[data-felt="moduler"]');
    if (moduler) {
      moduler.textContent = valgteModuler.length
        ? valgteModuler.join(', ')
        : '–';
    }
  }

  if (skjema) {
    skjema.addEventListener('input', settOppsummering);
    skjema.addEventListener('change', settOppsummering);

    Array.prototype.forEach.call(skjema.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        var paa = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', String(!paa));
        var modul = chip.getAttribute('data-modul') || '';
        if (paa) {
          valgteModuler = valgteModuler.filter(function (m) { return m !== modul; });
        } else if (valgteModuler.indexOf(modul) === -1) {
          valgteModuler.push(modul);
        }
        settOppsummering();
      });
    });

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      var mangler = [];
      var ugyldig = [];
      var forsteFeil = null;

      function sjekk(id, ord, gyldig, ordFeil) {
        var el = document.getElementById(id);
        if (!el) return;
        el.removeAttribute('aria-invalid');
        var v = el.value.trim();
        var ok = gyldig ? gyldig(v) : v.length >= 2;
        if (ok) return;
        el.setAttribute('aria-invalid', 'true');
        (v ? ugyldig : mangler).push(v ? (ordFeil || ord) : ord);
        if (!forsteFeil) forsteFeil = el;
      }

      sjekk('f-navn', 'navn');
      sjekk('f-firma', 'firma');
      sjekk('f-epost', 'e-postadresse', function (v) {
        return /^[^\s@]+@[^\s@]+\.[a-zæøåA-ZÆØÅ0-9]{2,}$/.test(v);
      }, 'e-postadressen');
      sjekk('f-telefon', 'telefonnummer', function (v) {
        return v.replace(/[^0-9]/g, '').length >= 8;
      }, 'telefonnummeret');

      if (mangler.length || ugyldig.length) {
        function ramse(ord) {
          return ord.join(', ').replace(/, ([^,]*)$/, ' og $1');
        }
        var melding = [];
        if (mangler.length) melding.push('Vi mangler ' + ramse(mangler) + '.');
        if (ugyldig.length) melding.push('Sjekk ' + ramse(ugyldig) + '.');
        feilboks.textContent = melding.join(' ');
        feilboks.hidden = false;
        if (forsteFeil) forsteFeil.focus();
        return;
      }

      feilboks.hidden = true;
      feilboks.textContent = '';
      visKvittering();
    });
  }

  function leggRad(liste, navn, innhold) {
    if (!innhold) return;
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    dt.textContent = navn;
    var dd = document.createElement('dd');
    dd.textContent = innhold;
    rad.appendChild(dt);
    rad.appendChild(dd);
    liste.appendChild(rad);
  }

  function visKvittering() {
    if (!kvittering || !kvitteringListe || !skjema) return;

    var navn = verdi('f-navn');
    var fornavn = navn.split(' ')[0];

    kvitteringTittel.textContent = fornavn ? 'Takk, ' + fornavn + '!' : 'Takk!';
    kvitteringListe.innerHTML = '';
    leggRad(kvitteringListe, etikett.navn, navn);
    leggRad(kvitteringListe, etikett.firma, verdi('f-firma'));
    leggRad(kvitteringListe, etikett.epost, verdi('f-epost'));
    leggRad(kvitteringListe, etikett.telefon, verdi('f-telefon'));
    leggRad(kvitteringListe, etikett.ansatte, verdi('f-ansatte'));
    leggRad(kvitteringListe, etikett.rolle, verdi('f-rolle'));
    leggRad(kvitteringListe, etikett.moduler, valgteModuler.join(', '));
    leggRad(kvitteringListe, etikett.melding, verdi('f-melding'));

    skjema.hidden = true;
    kvittering.hidden = false;
    if (rutenett) rutenett.classList.add('er-sendt');
    kvittering.focus();

    var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kvittering.scrollIntoView) {
      kvittering.scrollIntoView({ block: 'center', behavior: rolig ? 'auto' : 'smooth' });
    }
  }

  if (tilbake) {
    tilbake.addEventListener('click', function () {
      if (kvittering) kvittering.hidden = true;
      if (skjema) skjema.hidden = false;
      if (rutenett) rutenett.classList.remove('er-sendt');
      var forste = document.getElementById('f-navn');
      if (forste) forste.focus();
    });
  }
})();
