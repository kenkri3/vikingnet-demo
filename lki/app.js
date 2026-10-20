/*
  Leif Kølner Ingeniørfirma AS — app.js
  Forespørselen: utskriften fylles ut mens feltene fylles, og «Lag kvittering»
  lager et saksnummer i nettleseren. Ingenting sendes til en server og
  ingenting lagres etter at fanen lukkes. Knappen i kvitteringen åpner et
  e-postutkast i brukerens egen klient — det er brukeren som sender.
*/
(function () {
  'use strict';

  var skjema = document.getElementById('sak');
  if (!skjema) return;

  var MOTTAKER = 'post@lki.no';
  var TEGN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  var grid = document.getElementById('sak-grid');
  var kort = document.getElementById('sak-skjema');
  var utkast = document.getElementById('utskrift-utkast');
  var kvittering = document.getElementById('kvittering');
  var statusFelt = document.getElementById('utskrift-status');

  /* Feltene som vises i utskriften, i samme rekkefølge som på skjermen. */
  var felt = ['produktgruppe', 'bransje', 'navn', 'firma', 'epost', 'telefon', 'merknad'];

  /* Kvitteringen har egne mål for noen av feltene, fordi e-postfeltet heter
     noe annet i skjemaet. */
  var kvitteringsIder = {
    produktgruppe: 'k-produktgruppe',
    bransje: 'k-bransje',
    navn: 'k-navn',
    epost: 'k-epost-felt',
    telefon: 'k-telefon',
    merknad: 'k-merknad'
  };

  function verdi(navn) {
    var el = skjema.elements[navn];
    return el ? String(el.value || '').trim() : '';
  }

  function oppdater() {
    felt.forEach(function (navn) {
      var maal = document.getElementById('u-' + navn);
      if (maal) maal.textContent = verdi(navn);
    });
  }

  skjema.addEventListener('input', oppdater);
  skjema.addEventListener('change', oppdater);

  /* ---------- Validering ---------- */

  function settFeil(navn, melding) {
    var el = skjema.elements[navn];
    var meldingFelt = document.getElementById('feil-' + navn);
    if (meldingFelt) meldingFelt.textContent = melding || '';
    if (!el) return;
    if (melding) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function valider() {
    var forsteFeil = null;

    function sjekk(navn, melding) {
      if (melding && !forsteFeil) forsteFeil = skjema.elements[navn];
      settFeil(navn, melding);
    }

    var epost = verdi('epost');
    var epostOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(epost);

    sjekk('produktgruppe', verdi('produktgruppe') ? '' : 'Velg en produktgruppe.');
    sjekk('bransje', verdi('bransje') ? '' : 'Velg en bransje.');
    sjekk('navn', verdi('navn') ? '' : 'Skriv navnet ditt.');
    sjekk('epost', !epost ? 'Skriv e-postadressen din.' : (epostOk ? '' : 'Sjekk e-postadressen.'));

    return forsteFeil;
  }

  /* ---------- Kvittering ---------- */

  function toSiffer(tall) {
    return tall < 10 ? '0' + tall : String(tall);
  }

  function saksnummer() {
    var d = new Date();
    var kode = '';
    for (var i = 0; i < 3; i += 1) {
      kode += TEGN.charAt(Math.floor(Math.random() * TEGN.length));
    }
    return 'LKI-' + d.getFullYear() + toSiffer(d.getMonth() + 1) + toSiffer(d.getDate()) + '-' + kode;
  }

  function tidspunkt() {
    var naa = new Date();
    try {
      return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long', timeStyle: 'short' }).format(naa);
    } catch (feil) {
      return naa.toLocaleString('nb-NO');
    }
  }

  function lagEpost(ref, tid) {
    var linjer = [
      'Forespørsel ' + ref,
      'Registrert ' + tid,
      '',
      'Produktgruppe: ' + verdi('produktgruppe'),
      'Bransje: ' + verdi('bransje'),
      'Navn: ' + verdi('navn')
    ];

    if (verdi('firma')) linjer.push('Firma: ' + verdi('firma'));
    linjer.push('E-post: ' + verdi('epost'));
    if (verdi('telefon')) linjer.push('Telefon: ' + verdi('telefon'));
    if (verdi('merknad')) linjer.push('', 'Merknad:', verdi('merknad'));

    var emne = 'Forespørsel ' + ref + ' — ' + verdi('produktgruppe');
    var lenke = 'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(linjer.join('\n'));

    var knapp = document.getElementById('k-epost');
    if (knapp) knapp.setAttribute('href', lenke);
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();

    var feil = valider();
    if (feil) {
      feil.focus();
      return;
    }

    var ref = saksnummer();
    var tid = tidspunkt();

    Object.keys(kvitteringsIder).forEach(function (navn) {
      var maal = document.getElementById(kvitteringsIder[navn]);
      if (maal) maal.textContent = verdi(navn) || '—';
    });

    document.getElementById('k-ref').textContent = ref;
    document.getElementById('k-tid').textContent = 'Registrert ' + tid;

    lagEpost(ref, tid);

    grid.classList.add('er-sendt');
    kort.hidden = true;
    utkast.hidden = true;
    kvittering.hidden = false;
    if (statusFelt) statusFelt.textContent = 'Kvittering';

    document.getElementById('k-ref').focus();
  });

  var nyKnapp = document.getElementById('k-ny');
  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      grid.classList.remove('er-sendt');
      kvittering.hidden = true;
      utkast.hidden = false;
      kort.hidden = false;
      if (statusFelt) statusFelt.textContent = 'Utkast';
      oppdater();
      skjema.elements['produktgruppe'].focus();
    });
  }
})();
