/*
  Arne Himling AS — interaksjon, alt client-side.
  Ingenting sendes eller lagres: skjemaet bygger en kvittering og en ferdig
  utfylt e-postlenke. Resten er meny og årstall i footeren.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  var reduserBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)');
  var smalSkjerm = window.matchMedia('(max-width: 960px)');

  /* ---------- Meny ---------- */

  var nav = document.getElementById('nav');
  var menyKnapp = document.querySelector('.menu-btn');

  function settMeny(apen) {
    if (!nav || !menyKnapp) return;
    nav.hidden = !apen;
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
  }

  if (nav && menyKnapp) {
    if (smalSkjerm.matches) nav.hidden = true;

    menyKnapp.addEventListener('click', function () {
      settMeny(menyKnapp.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (hendelse) {
      if (smalSkjerm.matches && hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && smalSkjerm.matches && !nav.hidden) {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    var vedBreddeendring = function (hendelse) {
      settMeny(!hendelse.matches);
    };

    if (typeof smalSkjerm.addEventListener === 'function') {
      smalSkjerm.addEventListener('change', vedBreddeendring);
    } else if (typeof smalSkjerm.addListener === 'function') {
      smalSkjerm.addListener(vedBreddeendring);
    }
  }

  /* ---------- Forespørsel med kvittering ---------- */

  var skjema = document.getElementById('foresporsel-skjema');
  var kvittering = document.getElementById('kvittering');

  if (skjema && kvittering) {
    var tjenesteFelt = document.getElementById('tjeneste');
    var romFelt = document.getElementById('rom');
    var navnFelt = document.getElementById('navn');
    var epostFelt = document.getElementById('epost');
    var telefonFelt = document.getElementById('telefon');
    var meldingFelt = document.getElementById('melding');
    var feilboks = document.getElementById('skjema-feil');
    var kvitteringListe = document.getElementById('kvittering-liste');
    var kvitteringRef = document.getElementById('kvittering-ref');
    var epostKnapp = document.getElementById('kvittering-epost');
    var nyKnapp = document.getElementById('kvittering-ny');
    var antall = 0;

    function visFeil(melding) {
      feilboks.textContent = melding;
      feilboks.hidden = false;
    }

    function skjulFeil() {
      feilboks.hidden = true;
      feilboks.textContent = '';
    }

    function tekst(felt) {
      return felt && felt.value ? felt.value.trim() : '';
    }

    function valgtTekst(felt) {
      if (!felt || !felt.value) return '';
      var valgt = felt.options[felt.selectedIndex];
      return valgt ? valgt.textContent.trim() : felt.value;
    }

    function lagReferanse() {
      var aar = new Date().getFullYear();
      antall += 1;
      var lopenummer = String(1040 + antall + Math.floor(Math.random() * 90)).slice(-4);
      return 'AH-' + aar + '-' + lopenummer;
    }

    function fyllKvittering(ref, rader) {
      while (kvitteringListe.firstChild) kvitteringListe.removeChild(kvitteringListe.firstChild);

      rader.forEach(function (rad) {
        var div = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = rad[0];
        dd.textContent = rad[1];
        div.appendChild(dt);
        div.appendChild(dd);
        kvitteringListe.appendChild(div);
      });

      kvitteringRef.textContent = ref;
    }

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      skjulFeil();

      if (!tjenesteFelt.value) {
        visFeil('Velg hvilken tjeneste forespørselen gjelder.');
        tjenesteFelt.focus();
        return;
      }

      if (!tekst(navnFelt)) {
        visFeil('Fyll inn navnet ditt, så vi vet hvem vi svarer.');
        navnFelt.focus();
        return;
      }

      var epost = tekst(epostFelt);
      if (!epost || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) {
        visFeil('Skriv en gyldig e-postadresse, for eksempel navn@firma.no.');
        epostFelt.focus();
        return;
      }

      var ref = lagReferanse();
      var rader = [
        ['Tjeneste', valgtTekst(tjenesteFelt)],
        ['Type rom', valgtTekst(romFelt) || 'Ikke oppgitt'],
        ['Navn', tekst(navnFelt)],
        ['E-post', epost]
      ];

      if (tekst(telefonFelt)) rader.push(['Telefon', tekst(telefonFelt)]);
      if (tekst(meldingFelt)) rader.push(['Om rommet', tekst(meldingFelt)]);

      fyllKvittering(ref, rader);

      var emne = 'Forespørsel ' + ref + ' — ' + valgtTekst(tjenesteFelt);
      var kropp = ['Referanse: ' + ref, ''].concat(
        rader.map(function (rad) {
          return rad[0] + ': ' + rad[1];
        })
      );
      kropp.push('', 'Sendt fra nettsiden til Arne Himling AS.');

      epostKnapp.href =
        'mailto:salg@himling.no?subject=' +
        encodeURIComponent(emne) +
        '&body=' +
        encodeURIComponent(kropp.join('\n'));

      skjema.hidden = true;
      kvittering.hidden = false;
      kvittering.focus({ preventScroll: true });
      kvittering.scrollIntoView({ behavior: reduserBevegelse.matches ? 'auto' : 'smooth', block: 'center' });
    });

    if (nyKnapp) {
      nyKnapp.addEventListener('click', function () {
        skjema.reset();
        skjulFeil();
        kvittering.hidden = true;
        skjema.hidden = false;
        tjenesteFelt.focus({ preventScroll: true });
      });
    }

    /* Tjenesteknappene i lista legger valget inn i skjemaet. */
    Array.prototype.forEach.call(document.querySelectorAll('[data-tjeneste]'), function (knapp) {
      knapp.addEventListener('click', function () {
        tjenesteFelt.value = knapp.getAttribute('data-tjeneste');
        skjulFeil();

        if (kvittering.hidden === false) {
          kvittering.hidden = true;
          skjema.hidden = false;
        }

        document.getElementById('foresporsel').scrollIntoView({
          behavior: reduserBevegelse.matches ? 'auto' : 'smooth',
          block: 'start'
        });

        window.setTimeout(function () {
          tjenesteFelt.focus({ preventScroll: true });
        }, 380);
      });
    });
  }

  /* ---------- Årstall i footer ---------- */

  var aarFelt = document.getElementById('aar');
  if (aarFelt) aarFelt.textContent = String(new Date().getFullYear());
})();
