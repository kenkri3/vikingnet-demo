/*
  Banzha — bordbestilling i to steg.
  Alt skjer i nettleseren: ingenting lagres, og forespørselen går først ut når
  gjesten selv trykker send i e-postprogrammet sitt. GitHub Pages er statisk
  hosting, så mailto er den ærlige veien videre.
*/
(function () {
  'use strict';

  var heroSkjema = document.getElementById('heroBook');
  var skjema = document.getElementById('bookForm');
  if (!skjema) return;

  var panel1 = skjema.querySelector('[data-panel="1"]');
  var panel2 = skjema.querySelector('[data-panel="2"]');
  var prikk1 = document.querySelector('[data-prikk="1"]');
  var prikk2 = document.querySelector('[data-prikk="2"]');
  var status = document.getElementById('book-status');
  var feil1 = document.getElementById('feil-steg1');
  var feil2 = document.getElementById('feil-steg2');

  var gjester = document.getElementById('gjester');
  var anledning = document.getElementById('anledning');
  var dato = document.getElementById('dato');
  var tid = document.getElementById('tid');
  var navn = document.getElementById('navn');
  var telefon = document.getElementById('telefon');
  var epost = document.getElementById('epost');
  var melding = document.getElementById('melding');

  var sumGjester = document.getElementById('sum-gjester');
  var sumDato = document.getElementById('sum-dato');
  var sumTid = document.getElementById('sum-tid');
  var sumAnledning = document.getElementById('sum-anledning');

  var kvittering = document.getElementById('kvittering');
  var kvRef = document.getElementById('kv-ref');
  var kvSend = document.getElementById('kv-send');
  var kvNy = document.getElementById('kv-ny');

  var datoformat = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  function tilIso(dag) {
    var ar = dag.getFullYear();
    var maned = String(dag.getMonth() + 1).padStart(2, '0');
    var dagnummer = String(dag.getDate()).padStart(2, '0');
    return ar + '-' + maned + '-' + dagnummer;
  }

  function lesDato(verdi) {
    if (!verdi) return null;
    var deler = verdi.split('-');
    if (deler.length !== 3) return null;
    return new Date(Number(deler[0]), Number(deler[1]) - 1, Number(deler[2]));
  }

  function penDato(verdi) {
    var dag = lesDato(verdi);
    return dag ? datoformat.format(dag) : 'Ikke valgt';
  }

  function oppdaterSum() {
    sumGjester.textContent = gjester.value || 'Ikke valgt';
    sumDato.textContent = penDato(dato.value);
    sumTid.textContent = tid.value || 'Ikke valgt';
    sumAnledning.textContent = anledning.value;
  }

  function visFeil(element, tekst) {
    element.textContent = tekst;
    element.hidden = false;
  }

  function skjulFeil(element) {
    element.textContent = '';
    element.hidden = true;
  }

  function gaTilSteg(to) {
    var tilSteg2 = to === 2;
    panel1.hidden = tilSteg2;
    panel2.hidden = !tilSteg2;
    prikk1.classList.toggle('er-aktiv', !tilSteg2);
    prikk2.classList.toggle('er-aktiv', tilSteg2);
    status.textContent = tilSteg2
      ? 'Steg 2 av 2 · Hvem kommer?'
      : 'Steg 1 av 2 · Gjester og tid';
    var fokus = tilSteg2 ? navn : dato;
    if (fokus) fokus.focus({ preventScroll: true });
  }

  // Datoen kan ikke ligge før i dag.
  var idag = tilIso(new Date());
  dato.min = idag;

  [gjester, anledning, dato, tid].forEach(function (felt) {
    felt.addEventListener('change', oppdaterSum);
    felt.addEventListener('input', oppdaterSum);
  });

  document.getElementById('neste').addEventListener('click', function () {
    skjulFeil(feil1);
    if (!dato.value) {
      visFeil(feil1, 'Velg hvilken dag dere vil komme.');
      dato.focus();
      return;
    }
    if (dato.value < idag) {
      visFeil(feil1, 'Velg en dag fra og med i dag.');
      dato.focus();
      return;
    }
    if (!tid.value) {
      visFeil(feil1, 'Velg et tidspunkt for bordet.');
      tid.focus();
      return;
    }
    oppdaterSum();
    gaTilSteg(2);
  });

  document.getElementById('tilbake').addEventListener('click', function () {
    gaTilSteg(1);
  });

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    skjulFeil(feil2);

    if (!navn.value.trim()) {
      visFeil(feil2, 'Skriv navnet ditt.');
      navn.focus();
      return;
    }
    if (!telefon.value.trim()) {
      visFeil(feil2, 'Skriv et telefonnummer vi kan nå deg på.');
      telefon.focus();
      return;
    }
    if (!gyldigEpost(epost.value.trim())) {
      visFeil(feil2, 'Skriv en gyldig e-postadresse.');
      epost.focus();
      return;
    }

    var dag = penDato(dato.value);
    var referanse = 'BZ-' + dato.value.replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000));
    var emne = 'Bordbestilling – ' + dag + ' kl. ' + tid.value + ', ' + gjester.value;
    var linjer = [
      'Hei Banzha,',
      '',
      'Vi vil gjerne bestille bord:',
      'Gjester: ' + gjester.value,
      'Dato: ' + dag,
      'Tid: ' + tid.value,
      'Anledning: ' + anledning.value,
      '',
      'Navn: ' + navn.value.trim(),
      'Telefon: ' + telefon.value.trim(),
      'E-post: ' + epost.value.trim(),
      'Referanse: ' + referanse
    ];
    if (melding.value.trim()) {
      linjer.push('', 'Melding: ' + melding.value.trim());
    }
    linjer.push('', 'Sendt fra nettsiden til Banzha.');

    kvSend.href = 'mailto:booking@banzha.no?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(linjer.join('\n'));
    kvRef.textContent = referanse;
    document.getElementById('kv-gjester').textContent = gjester.value;
    document.getElementById('kv-dato').textContent = dag;
    document.getElementById('kv-tid').textContent = tid.value;
    document.getElementById('kv-anledning').textContent = anledning.value;

    skjema.hidden = true;
    kvittering.hidden = false;
    kvRef.focus && kvRef.setAttribute('tabindex', '-1');
    kvittering.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var knapp = kvSend;
    if (knapp && knapp.focus) knapp.focus({ preventScroll: true });
  });

  kvNy.addEventListener('click', function () {
    kvittering.hidden = true;
    skjema.hidden = false;
    skjema.reset();
    dato.min = idag;
    skjulFeil(feil1);
    skjulFeil(feil2);
    oppdaterSum();
    gaTilSteg(1);
    skjema.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Hero-kortet fyller ut bestillingsskjemaet og tar gjesten dit.
  if (heroSkjema) {
    heroSkjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      var heroGjester = document.getElementById('heroGjester');
      var heroDato = document.getElementById('heroDato');
      var heroTid = document.getElementById('heroTid');

      if (heroGjester && heroGjester.value) gjester.value = heroGjester.value;
      if (heroTid && heroTid.value) tid.value = heroTid.value;
      if (heroDato && heroDato.value) dato.value = heroDato.value;

      oppdaterSum();
      gaTilSteg(1);
      document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () {
        (dato.value ? tid : dato).focus({ preventScroll: true });
      }, 420);
    });
  }

  oppdaterSum();
})();
