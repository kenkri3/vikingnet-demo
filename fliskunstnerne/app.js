/*
  Fliskunstnerne AS — app.js

  Tre oppgaver, ingen avhengigheter og ingen backend:
  1. Mobilmenyen.
  2. Befaringsskjemaet: velg tjeneste, dag og tid, fyll inn kontaktinfo,
     få en kvittering med referanse. Kvitteringen ligger bare i fanen, og
     knappen i den åpner et e-postutkast i brukerens egen klient.
  3. Årstallet i footeren.

  Ingenting sendes til en server, og ingenting lagres etter at fanen lukkes.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apner = nav.hasAttribute('hidden');
      if (apner) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(apner));
    });
  }

  /* ---------- Årstall ---------- */

  var aar = document.querySelector('[data-year]');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---------- Befaring ---------- */

  var skjema = document.getElementById('befaring-skjema');
  if (!skjema) return;

  var MOTTAKER = 'bjornar@fliskunstnerne.no';
  var TIDER = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  var UKEDAG_KORT = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
  var UKEDAG_LANG = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  var MAANED = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli',
    'august', 'september', 'oktober', 'november', 'desember'];

  var dagerRamme = document.getElementById('dager');
  var tiderRamme = document.getElementById('tider');
  var feilFelt = document.getElementById('feil-melding');
  var innhold = document.getElementById('befaring-inn');
  var oppsum = document.querySelector('.fk-oppsum');
  var kvittering = document.getElementById('kvittering');
  var valgtDato = null;
  var valgtTid = null;

  var oTjeneste = document.getElementById('o-tjeneste');
  var oDag = document.getElementById('o-dag');
  var oTid = document.getElementById('o-tid');
  var oNavn = document.getElementById('o-navn');

  function toSiffer(tall) {
    return tall < 10 ? '0' + tall : String(tall);
  }

  function isoDato(dato) {
    return dato.getFullYear() + '-' + toSiffer(dato.getMonth() + 1) + '-' + toSiffer(dato.getDate());
  }

  function kortDato(dato) {
    return UKEDAG_KORT[dato.getDay()] + '. ' + dato.getDate() + '.';
  }

  function langDato(dato) {
    return UKEDAG_LANG[dato.getDay()] + ' ' + dato.getDate() + '. ' + MAANED[dato.getMonth()];
  }

  /* De ti neste hverdagene, med start i morgen. */
  function nesteHverdager() {
    var liste = [];
    var dato = new Date();
    dato.setHours(12, 0, 0, 0);
    var teller = 0;
    while (liste.length < 10 && teller < 40) {
      dato.setDate(dato.getDate() + 1);
      teller += 1;
      var dag = dato.getDay();
      if (dag === 0 || dag === 6) continue;
      liste.push(new Date(dato.getTime()));
    }
    return liste;
  }

  /* Opptatte timer er en fast funksjon av datoen, slik at demoen ser
     levende ut men oppfører seg likt hver gang. */
  function erOpptatt(datoStreng, indeks) {
    var sum = 0;
    for (var i = 0; i < datoStreng.length; i += 1) {
      sum = (sum * 31 + datoStreng.charCodeAt(i)) % 997;
    }
    return (sum + indeks * 37) % 8 < 2;
  }

  function valgtTjeneste() {
    var valgt = skjema.querySelector('input[name="tjeneste"]:checked');
    return valgt ? valgt.value : '';
  }

  function verdi(id) {
    var felt = document.getElementById(id);
    return felt ? String(felt.value || '').trim() : '';
  }

  /* ---------- Oppsummeringen ---------- */

  function oppdater() {
    oTjeneste.textContent = valgtTjeneste() || 'Ikke valgt';
    oDag.textContent = valgtDato ? langDato(valgtDato) : 'Ikke valgt';
    oTid.textContent = valgtTid || 'Ikke valgt';
    oNavn.textContent = verdi('navn') || 'Ikke fylt ut';
  }

  /* ---------- Dager og tider ---------- */

  function tegnDager() {
    var dager = nesteHverdager();
    dagerRamme.textContent = '';
    dager.forEach(function (dato) {
      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'fk-dag';
      knapp.setAttribute('aria-pressed', 'false');
      knapp.setAttribute('data-dato', isoDato(dato));
      knapp.innerHTML = '<span>' + kortDato(dato) + '</span><strong>' + dato.getDate() + '</strong>';
      knapp.addEventListener('click', function () {
        valgtDato = dato;
        valgtTid = null;
        Array.prototype.forEach.call(dagerRamme.children, function (annen) {
          annen.setAttribute('aria-pressed', String(annen === knapp));
        });
        tegnTider();
        oppdater();
        feilFelt.textContent = '';
      });
      dagerRamme.appendChild(knapp);
    });
  }

  function tegnTider() {
    tiderRamme.textContent = '';
    if (!valgtDato) {
      var hint = document.createElement('p');
      hint.className = 'fk-hjelp';
      hint.textContent = 'Velg en dag først.';
      tiderRamme.appendChild(hint);
      return;
    }
    var datoStreng = isoDato(valgtDato);
    TIDER.forEach(function (tid, indeks) {
      var opptatt = erOpptatt(datoStreng, indeks);
      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'fk-tid';
      knapp.setAttribute('aria-pressed', 'false');
      knapp.innerHTML = '<strong>' + tid + '</strong><span>' + (opptatt ? 'Opptatt' : 'Ledig') + '</span>';
      if (opptatt) {
        knapp.disabled = true;
      } else {
        knapp.addEventListener('click', function () {
          valgtTid = tid;
          Array.prototype.forEach.call(tiderRamme.children, function (annen) {
            if (annen.tagName === 'BUTTON') annen.setAttribute('aria-pressed', String(annen === knapp));
          });
          oppdater();
          feilFelt.textContent = '';
        });
      }
      tiderRamme.appendChild(knapp);
    });
  }

  /* ---------- Kvittering ---------- */

  function referanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 3; i += 1) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    var naa = new Date();
    return 'FB-' + naa.getFullYear() + toSiffer(naa.getMonth() + 1) +
      toSiffer(naa.getDate()) + '-' + kode;
  }

  function epostLenke(ref) {
    var linjer = [
      'Befaring ' + ref,
      '',
      'Tjeneste: ' + valgtTjeneste(),
      'Dag: ' + (valgtDato ? langDato(valgtDato) : ''),
      'Tid: ' + (valgtTid || ''),
      'Navn: ' + verdi('navn'),
      'Telefon: ' + verdi('telefon'),
      'E-post: ' + verdi('epost')
    ];
    if (verdi('adresse')) linjer.push('Adresse: ' + verdi('adresse'));
    if (verdi('merknad')) linjer.push('', 'Om badet:', verdi('merknad'));

    var emne = 'Befaring ' + ref + ' – ' + valgtTjeneste();
    return 'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(linjer.join('\n'));
  }

  function visKvittering() {
    var ref = referanse();
    document.getElementById('k-ref').textContent = ref;
    document.getElementById('k-tjeneste').textContent = valgtTjeneste();
    document.getElementById('k-tid').textContent = langDato(valgtDato) + ' kl. ' + valgtTid;
    document.getElementById('k-navn').textContent = verdi('navn');
    document.getElementById('k-kontakt').textContent =
      verdi('telefon') + (verdi('epost') ? ' · ' + verdi('epost') : '');
    document.getElementById('k-merknad').textContent = verdi('merknad') || 'Ingen merknad';
    document.getElementById('k-send').setAttribute('href', epostLenke(ref));

    skjema.hidden = true;
    if (oppsum) oppsum.hidden = true;
    kvittering.hidden = false;
    if (innhold) innhold.classList.add('fk-befaring__inn--lukket');
    kvittering.focus();
  }

  /* ---------- Skjemaet ---------- */

  function visFeil(melding, felt) {
    feilFelt.textContent = melding || '';
    if (felt && typeof felt.focus === 'function') felt.focus();
  }

  function valider() {
    if (!valgtDato) {
      visFeil('Velg hvilken dag befaringen skal være.', dagerRamme.querySelector('button'));
      return false;
    }
    if (!valgtTid) {
      visFeil('Velg et klokkeslett for befaringen.', tiderRamme.querySelector('button:not(:disabled)'));
      return false;
    }
    if (!verdi('navn')) {
      visFeil('Skriv navnet ditt, så vet vi hvem vi kommer til.', document.getElementById('navn'));
      return false;
    }
    var telefon = verdi('telefon').replace(/[^0-9]/g, '');
    if (telefon.length < 8) {
      visFeil('Skriv et telefonnummer vi kan nå deg på.', document.getElementById('telefon'));
      return false;
    }
    var epost = verdi('epost');
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(epost)) {
      visFeil('Sjekk e-postadressen – vi bruker den til å bekrefte avtalen.', document.getElementById('epost'));
      return false;
    }
    feilFelt.textContent = '';
    return true;
  }

  skjema.addEventListener('input', function (event) {
    if (event.target && event.target.name === 'navn') oppdater();
  });

  skjema.addEventListener('change', function (event) {
    if (event.target && event.target.name === 'tjeneste') oppdater();
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!valider()) return;
    visKvittering();
  });

  var nyKnapp = document.getElementById('k-ny');
  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      skjema.hidden = false;
      if (oppsum) oppsum.hidden = false;
      kvittering.hidden = true;
      if (innhold) innhold.classList.remove('fk-befaring__inn--lukket');
      valgtDato = null;
      valgtTid = null;
      skjema.reset();
      tegnTider();
      Array.prototype.forEach.call(dagerRamme.children, function (knapp) {
        knapp.setAttribute('aria-pressed', 'false');
      });
      oppdater();
      feilFelt.textContent = '';
      dagerRamme.querySelector('button').focus();
    });
  }

  tegnDager();
  tegnTider();
  oppdater();
})();
