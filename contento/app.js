/*
  Contento — interaksjon uten backend.
  1) Mobilmeny  2) Årstall i footer  3) Booking av gratis introsamtale i tre steg.
  Alt ligger i nettleseren. Ingenting sendes: bekreftelsen ender i en mailto: til
  firmas egen adresse, slik en statisk side må gjøre det.
*/

(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne meny');
      }
    });
  }

  /* ---------- Årstall ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Booking ---------- */

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var paneler = form.querySelectorAll('[data-panel]');
  var prikker = document.querySelectorAll('[data-dot]');
  var knappNeste = form.querySelector('[data-next]');
  var knappTilbake = form.querySelector('[data-back]');
  var knappBekreft = form.querySelector('[data-submit]');
  var feilEl = document.getElementById('wizFeil');
  var statusEl = document.getElementById('wizStatus');
  var dagerEl = document.getElementById('days');
  var tiderEl = document.getElementById('slots');
  var navEl = form.querySelector('.wiz__nav');
  var mailtoEl = document.getElementById('mailtoBtn');
  var tittelEl = document.getElementById('doneTittel');

  var TIDER = ['09:00', '10:00', '11:00', '12:30', '14:00', '15:30'];
  var STEGNAVN = ['Tema', 'Dag og tid', 'Kontakt'];

  var dager = lagDager(10);
  var steg = 1;
  var valgtDag = -1;

  var fmtUkedag = new Intl.DateTimeFormat('nb-NO', { weekday: 'short' });
  var fmtDato = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' });
  var fmtLangDato = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

  /* De neste ti hverdagene, med start i morgen. */
  function lagDager(antall) {
    var liste = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (liste.length < antall) {
      var ukedag = d.getDay();
      if (ukedag !== 0 && ukedag !== 6) liste.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return liste;
  }

  function tegnDager() {
    var html = '';
    for (var i = 0; i < dager.length; i++) {
      html +=
        '<label class="day">' +
        '<input type="radio" name="dag" value="' + i + '"' + (i === valgtDag ? ' checked' : '') + '>' +
        '<span class="day__wd">' + fmtUkedag.format(dager[i]) + '</span>' +
        '<span class="day__d">' + fmtDato.format(dager[i]) + '</span>' +
        '</label>';
    }
    dagerEl.innerHTML = html;
  }

  /* Fire ledige tider per dag. Mønsteret er fast per dag, ikke tilfeldig. */
  function tegnTider() {
    if (valgtDag < 0) {
      tiderEl.innerHTML = '<p class="slots__hint">Velg en dag først, så vises de ledige tidene.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < TIDER.length; i++) {
      var opptatt = (valgtDag * 3 + i * 2) % 5 === 0;
      html +=
        '<label class="slot' + (opptatt ? ' is-opptatt' : '') + '">' +
        '<input type="radio" name="tid" value="' + TIDER[i] + '"' + (opptatt ? ' disabled' : '') + '>' +
        '<span>' + TIDER[i] + '</span>' +
        '</label>';
    }
    tiderEl.innerHTML = html;
  }

  /* Holder .is-on i takt med valgene, også der :has() ikke støttes. */
  function merkValg() {
    var valg = form.querySelectorAll('.choice, .day, .slot');
    for (var i = 0; i < valg.length; i++) {
      var input = valg[i].querySelector('input');
      valg[i].classList.toggle('is-on', !!(input && input.checked));
    }
  }

  function visFeil(melding) {
    feilEl.textContent = melding;
  }

  function skrivUt(navn, verdi) {
    var el = form.querySelector('[data-out="' + navn + '"]');
    if (el) el.textContent = verdi;
  }

  function visSteg(n, stille) {
    steg = n;

    for (var i = 0; i < paneler.length; i++) {
      var nr = Number(paneler[i].getAttribute('data-panel'));
      if (nr === n) paneler[i].removeAttribute('hidden');
      else paneler[i].setAttribute('hidden', '');
    }

    knappTilbake.hidden = n === 1 || n === 4;
    knappNeste.hidden = n >= 3;
    knappBekreft.hidden = n !== 3;
    if (navEl) navEl.hidden = n === 4;

    for (var j = 0; j < prikker.length; j++) {
      var d = Number(prikker[j].getAttribute('data-dot'));
      prikker[j].classList.toggle('is-active', d === n);
      prikker[j].classList.toggle('is-done', d < n);
    }

    feilEl.textContent = '';

    if (statusEl) {
      statusEl.textContent = n <= 3 ? 'Steg ' + n + ' av 3: ' + STEGNAVN[n - 1] : 'Avtalen er klar';
    }

    if (!stille) {
      var panel = n === 4 ? null : paneler[n - 1];
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus({ preventScroll: true });
      } else if (tittelEl) {
        tittelEl.setAttribute('tabindex', '-1');
        tittelEl.focus({ preventScroll: true });
      }
    }
  }

  function valgtTema() {
    return form.querySelector('input[name="tema"]:checked');
  }

  function valgtTid() {
    return form.querySelector('input[name="tid"]:checked');
  }

  dagerEl.addEventListener('change', function (event) {
    if (event.target.name !== 'dag') return;
    valgtDag = Number(event.target.value);
    tegnTider();
    merkValg();
  });

  form.addEventListener('change', merkValg);

  knappNeste.addEventListener('click', function () {
    if (steg === 1 && !valgtTema()) {
      visFeil('Velg et tema før du går videre.');
      return;
    }
    if (steg === 2) {
      if (valgtDag < 0) {
        visFeil('Velg en dag.');
        return;
      }
      if (!valgtTid()) {
        visFeil('Velg et tidspunkt.');
        return;
      }
    }
    visSteg(steg + 1);
  });

  knappTilbake.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var temaEl = valgtTema();
    var tidEl = valgtTid();

    if (!temaEl || valgtDag < 0 || !tidEl) {
      visSteg(!temaEl ? 1 : 2);
      visFeil('Du mangler å velge tema, dag eller tid.');
      return;
    }

    var navnEl = form.querySelector('input[name="navn"]');
    var epostEl = form.querySelector('input[name="epost"]');
    var telefonEl = form.querySelector('input[name="telefon"]');
    var notatEl = form.querySelector('textarea[name="notat"]');

    var navn = navnEl ? navnEl.value.trim() : '';
    var epost = epostEl ? epostEl.value.trim() : '';
    var telefon = telefonEl ? telefonEl.value.trim() : '';
    var notat = notatEl ? notatEl.value.trim() : '';

    if (navn.length < 2) {
      visFeil('Skriv inn navnet ditt.');
      if (navnEl) navnEl.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-ZæøåÆØÅ]{2,}$/.test(epost)) {
      visFeil('Skriv inn en gyldig e-postadresse.');
      if (epostEl) epostEl.focus();
      return;
    }

    var tema = temaEl.value;
    var tid = tidEl.value;
    var dagTekst = fmtLangDato.format(dager[valgtDag]);

    var linjer = [
      'Hei Lisbeth,',
      '',
      'Jeg ønsker en gratis introsamtale.',
      '',
      'Tema: ' + tema,
      'Dag: ' + dagTekst,
      'Klokken: ' + tid,
      'Navn: ' + navn,
      'E-post: ' + epost
    ];
    if (telefon) linjer.push('Telefon: ' + telefon);
    if (notat) {
      linjer.push('', 'Om situasjonen: ' + notat);
    }
    linjer.push('', 'Hilsen ' + navn);

    var mottaker = form.getAttribute('data-mailto') || 'lisbeth@contento.no';
    var emne = 'Introsamtale: ' + tema + ', ' + dagTekst + ' kl. ' + tid;

    mailtoEl.setAttribute(
      'href',
      'mailto:' + mottaker +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'))
    );

    skrivUt('tema', tema);
    skrivUt('dag', dagTekst);
    skrivUt('tid', tid);
    skrivUt('epost', epost);

    if (tittelEl) tittelEl.textContent = 'Takk, ' + navn.split(' ')[0] + '!';

    visSteg(4);
  });

  form.addEventListener('click', function (event) {
    var restart = event.target.closest ? event.target.closest('[data-restart]') : null;
    if (!restart) return;

    form.reset();
    valgtDag = -1;
    tegnDager();
    tegnTider();
    merkValg();
    mailtoEl.setAttribute('href', 'mailto:' + (form.getAttribute('data-mailto') || 'lisbeth@contento.no'));
    if (tittelEl) tittelEl.textContent = 'Avtalen er klar';
    visSteg(1);
  });

  tegnDager();
  tegnTider();
  merkValg();
  visSteg(1, true);
})();
