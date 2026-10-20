/*
  MultiBO Entreprenør AS — app.js
  To ting brukeren kan gjøre, begge helt i nettleseren:
    1) filtrere referanseprosjektene på byggtype
    2) fylle ut en forespørsel, se den over som kvittering og sende den
       fra sin egen e-postklient (mailto). Ingenting sendes eller lagres her.
  I tillegg: mobilmeny og årstall i footer.
*/
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.classList.remove('is-open');
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      var open = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---------------- Årstall ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Filter: referanseprosjekter ---------------- */

  var grid = document.getElementById('prosjektgrid');
  var telleverk = document.getElementById('telleverk');
  var tomt = document.getElementById('tomt');

  if (grid && telleverk) {
    var kort = Array.prototype.slice.call(grid.querySelectorAll('.prosjekt'));
    var knapper = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
    var totalt = kort.length;

    function vis(filter) {
      var synlige = 0;
      kort.forEach(function (el) {
        var treff = filter === 'alle' || el.getAttribute('data-type') === filter;
        if (treff) {
          el.removeAttribute('hidden');
          synlige++;
        } else {
          el.setAttribute('hidden', '');
        }
      });

      telleverk.textContent =
        synlige === totalt
          ? 'Viser alle ' + totalt + ' prosjekter'
          : 'Viser ' + synlige + ' av ' + totalt + ' prosjekter';

      if (tomt) {
        if (synlige === 0) tomt.removeAttribute('hidden');
        else tomt.setAttribute('hidden', '');
      }

      knapper.forEach(function (knapp) {
        var valgt = knapp.getAttribute('data-filter') === filter;
        knapp.classList.toggle('is-valgt', valgt);
        knapp.setAttribute('aria-pressed', valgt ? 'true' : 'false');
      });
    }

    knapper.forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        vis(knapp.getAttribute('data-filter'));
      });
    });
  }

  /* ---------------- Forespørsel med kvittering ---------------- */

  var skjema = document.getElementById('foresporsel-skjema');
  var kvittering = document.getElementById('kvittering');
  var kvitteringListe = document.getElementById('kvittering-liste');
  var sendKnapp = document.getElementById('send-epost');
  var endreKnapp = document.getElementById('endre');
  var feil = document.getElementById('feil');
  var MOTTAKER = 'haakon@thorrud.no';

  var FELTER = [
    ['navn', 'Navn'],
    ['kontakt', 'Telefon eller e-post'],
    ['type', 'Gjelder'],
    ['sted', 'Sted'],
    ['melding', 'Om prosjektet']
  ];

  function visFeil(melding) {
    if (!feil) return;
    feil.textContent = melding;
    feil.removeAttribute('hidden');
  }

  function skjulFeil() {
    if (!feil) return;
    feil.setAttribute('hidden', '');
    feil.textContent = '';
  }

  function lagKvittering(verdier) {
    while (kvitteringListe.firstChild) kvitteringListe.removeChild(kvitteringListe.firstChild);

    FELTER.forEach(function (par) {
      var verdi = verdier[par[0]];
      if (!verdi) return;
      var rad = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = par[1];
      dd.textContent = verdi;
      rad.appendChild(dt);
      rad.appendChild(dd);
      kvitteringListe.appendChild(rad);
    });
  }

  function lagEpost(verdier) {
    var emne = 'Forespørsel fra multibo.no — ' + verdier.type;
    var linjer = ['Hei Håkon,', '', 'Jeg vil gjerne høre mer om et prosjekt:', ''];
    FELTER.forEach(function (par) {
      if (!verdier[par[0]]) return;
      linjer.push(par[1] + ': ' + verdier[par[0]]);
    });
    linjer.push('', 'Sendt fra nettsiden.');
    return (
      'mailto:' +
      MOTTAKER +
      '?subject=' +
      encodeURIComponent(emne) +
      '&body=' +
      encodeURIComponent(linjer.join('\n'))
    );
  }

  if (skjema && kvittering) {
    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      skjulFeil();

      var verdier = {};
      FELTER.forEach(function (par) {
        var felt = document.getElementById(par[0]);
        verdier[par[0]] = felt && felt.value ? felt.value.trim() : '';
      });

      if (!verdier.navn) {
        visFeil('Skriv inn navnet ditt, så vi vet hvem som spør.');
        document.getElementById('navn').focus();
        return;
      }

      if (!verdier.kontakt) {
        visFeil('Skriv inn telefonnummer eller e-post, så Håkon kan svare deg.');
        document.getElementById('kontakt').focus();
        return;
      }

      lagKvittering(verdier);
      if (sendKnapp) sendKnapp.setAttribute('href', lagEpost(verdier));

      skjema.setAttribute('hidden', '');
      kvittering.removeAttribute('hidden');
      kvittering.focus();
    });

    if (endreKnapp) {
      endreKnapp.addEventListener('click', function () {
        kvittering.setAttribute('hidden', '');
        skjema.removeAttribute('hidden');
        document.getElementById('navn').focus();
      });
    }
  }

})();
