/*
  Analysys Mason â€” interaksjon uten backend.
  1) Mobilmeny  2) Ã…rstall  3) Booking i tre trinn med kvittering.
  Alt skjer i nettleseren. Kvitteringen ender i et mailto-utkast til
  oslo@analysysmason.com, slik en statisk side mÃ¥ gjÃ¸re det.
*/

(function () {
  'use strict';

  /* ---------- Marker at JS kjÃ¸rer (styrer reveal-animasjonen) ---------- */

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Ã…pne meny');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ã…pne meny');
      }
    });
  }

  /* ---------- Ã…rstall ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Reveal: kort inntoning ved lasting ----------
     Bevisst tidsstyrt og ikke scrollstyrt, slik at innholdet aldri blir
     stÃ¥ende usynlig i et skjermbilde eller nÃ¥r noe gÃ¥r galt. */

  var reveal = document.querySelectorAll('.reveal');
  if (reveal.length) {
    window.requestAnimationFrame(function () {
      for (var r = 0; r < reveal.length; r++) {
        (function (node, nr) {
          window.setTimeout(function () {
            node.classList.add('is-visible');
          }, Math.min(nr, 6) * 70);
        })(reveal[r], r);
      }
    });
  }

  /* ---------- Booking ---------- */

  var form = document.getElementById('bookForm');
  var receipt = document.getElementById('bookReceipt');
  if (!form || !receipt) return;

  var panels = form.querySelectorAll('[data-step]');
  var dots = document.querySelectorAll('[data-step-dot]');
  var backBtn = form.querySelector('[data-back]');
  var nextBtn = form.querySelector('[data-next]');
  var submitBtn = form.querySelector('[data-submit]');
  var errorBox = document.getElementById('bookError');
  var daySelect = document.getElementById('bookDag');
  var mailLink = receipt.querySelector('[data-r-mail]');
  var newBtn = receipt.querySelector('[data-r-new]');

  var UKEDAGER = ['sÃ¸ndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lÃ¸rdag'];
  var MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'];

  var steg = 1;

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function lagDager(antall) {
    var dager = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    while (dager.length < antall) {
      d.setDate(d.getDate() + 1);
      var dag = d.getDay();
      if (dag !== 0 && dag !== 6) dager.push(new Date(d));
    }
    return dager;
  }

  function fyllDager() {
    if (!daySelect) return;
    var dager = lagDager(5);
    for (var i = 0; i < dager.length; i++) {
      var d = dager[i];
      var option = document.createElement('option');
      option.value = d.getFullYear() + '-' + toSiffer(d.getMonth() + 1) + '-' + toSiffer(d.getDate());
      option.textContent = UKEDAGER[d.getDay()] + ' ' + d.getDate() + '. ' + MANEDER[d.getMonth()];
      daySelect.appendChild(option);
    }
  }

  fyllDager();

  function visFeil(melding, felt) {
    if (errorBox) {
      errorBox.textContent = melding;
      errorBox.hidden = false;
    }
    if (felt) {
      felt.setAttribute('aria-invalid', 'true');
      felt.focus();
    }
  }

  function skjulFeil() {
    if (!errorBox) return;
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function valgt(selector) {
    return form.querySelector(selector + ':checked');
  }

  function visSteg(n, flyttFokus) {
    steg = n;
    for (var i = 0; i < panels.length; i++) {
      var egen = Number(panels[i].getAttribute('data-step'));
      panels[i].hidden = egen !== n;
    }
    for (var j = 0; j < dots.length; j++) {
      var nummer = Number(dots[j].getAttribute('data-step-dot'));
      dots[j].classList.toggle('is-active', nummer === n);
      dots[j].classList.toggle('is-done', nummer < n);
    }
    if (backBtn) backBtn.hidden = n === 1;
    if (nextBtn) nextBtn.hidden = n === 3;
    if (submitBtn) submitBtn.hidden = n !== 3;
    skjulFeil();

    if (!flyttFokus) return;
    var aktiv = form.querySelector('[data-step="' + n + '"]');
    var forste = aktiv ? aktiv.querySelector('input, select, textarea') : null;
    if (forste) forste.focus({ preventScroll: true });
  }

  function validerSteg(n) {
    if (n === 1) {
      if (!valgt('input[name="tema"]')) {
        visFeil('Velg et fagomrÃ¥de for Ã¥ gÃ¥ videre.', form.querySelector('input[name="tema"]'));
        return false;
      }
    }
    if (n === 2) {
      if (!daySelect || !daySelect.value) {
        visFeil('Velg en dag.', daySelect);
        return false;
      }
      if (!valgt('input[name="tid"]')) {
        visFeil('Velg et klokkeslett.', form.querySelector('input[name="tid"]'));
        return false;
      }
    }
    if (n === 3) {
      var navn = document.getElementById('bookNavn');
      var epost = document.getElementById('bookEpost');
      var telefon = document.getElementById('bookTelefon');
      if (!navn || navn.value.trim().length < 2) {
        visFeil('Fyll inn navnet ditt.', navn);
        return false;
      }
      var epostverdi = epost ? epost.value.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epostverdi)) {
        visFeil('Skriv inn en gyldig e-postadresse.', epost);
        return false;
      }
      var siffer = telefon ? telefon.value.replace(/\D/g, '') : '';
      if (siffer.length < 8 || siffer.length > 15) {
        visFeil('Skriv inn et telefonnummer med 8 til 15 sifre.', telefon);
        return false;
      }
    }
    return true;
  }

  /* Synlig markering av valgt kort, ogsÃ¥ der :has ikke stÃ¸ttes. */
  form.addEventListener('change', function (event) {
    var mal = event.target;
    if (mal.type === 'radio') {
      var kort = form.querySelectorAll('.option');
      for (var i = 0; i < kort.length; i++) {
        var inn = kort[i].querySelector('input');
        kort[i].classList.toggle('is-selected', Boolean(inn && inn.checked));
      }
      if (mal.hasAttribute('aria-invalid')) mal.removeAttribute('aria-invalid');
      skjulFeil();
    }
  });

  form.addEventListener('input', function (event) {
    var mal = event.target;
    if (mal && mal.hasAttribute('aria-invalid')) mal.removeAttribute('aria-invalid');
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validerSteg(steg)) return;
      visSteg(Math.min(3, steg + 1), true);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      visSteg(Math.max(1, steg - 1), true);
    });
  }

  function lagReferanse() {
    var nummer = 1000 + Math.floor(Math.random() * 9000);
    return 'AM-' + new Date().getFullYear() + '-' + nummer;
  }

  function tekst(node, verdi) {
    if (node) node.textContent = verdi;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validerSteg(3)) return;

    var tema = valgt('input[name="tema"]');
    var tid = valgt('input[name="tid"]');
    var dagTekst = daySelect && daySelect.selectedIndex >= 0
      ? daySelect.options[daySelect.selectedIndex].textContent
      : '';
    var navn = document.getElementById('bookNavn');
    var firma = document.getElementById('bookFirma');
    var epost = document.getElementById('bookEpost');
    var telefon = document.getElementById('bookTelefon');
    var melding = document.getElementById('bookMelding');

    var data = {
      tema: tema ? tema.value : '',
      tid: dagTekst + ', kl. ' + (tid ? tid.value : ''),
      navn: navn ? navn.value.trim() : '',
      firma: firma && firma.value.trim() ? firma.value.trim() : 'Ikke oppgitt',
      epost: epost ? epost.value.trim() : '',
      telefon: telefon ? telefon.value.trim() : '',
      melding: melding && melding.value.trim() ? melding.value.trim() : 'Ikke oppgitt',
      ref: lagReferanse()
    };

    tekst(receipt.querySelector('[data-r-navn]'), data.navn.split(' ')[0]);
    tekst(receipt.querySelector('[data-r-ref]'), data.ref);
    tekst(receipt.querySelector('[data-r-tema]'), data.tema);
    tekst(receipt.querySelector('[data-r-tid]'), data.tid);
    tekst(receipt.querySelector('[data-r-epost]'), data.epost);
    tekst(receipt.querySelector('[data-r-telefon]'), data.telefon);
    tekst(receipt.querySelector('[data-r-firma]'), data.firma);

    var emne = 'ForespÃ¸rsel om samtale â€” ' + data.tema + ' (' + data.ref + ')';
    var kropp = [
      'Hei,',
      '',
      'Jeg Ã¸nsker en samtale pÃ¥ 30 minutter med Oslo-kontoret.',
      '',
      'FagomrÃ¥de: ' + data.tema,
      'Ã˜nsket tid: ' + data.tid,
      'Navn: ' + data.navn,
      'Virksomhet: ' + data.firma,
      'E-post: ' + data.epost,
      'Telefon: ' + data.telefon,
      'Om saken: ' + data.melding,
      '',
      'Referanse: ' + data.ref
    ].join('\n');

    if (mailLink) {
      mailLink.href = 'mailto:oslo@analysysmason.com'
        + '?subject=' + encodeURIComponent(emne)
        + '&body=' + encodeURIComponent(kropp);
    }

    form.hidden = true;
    receipt.hidden = false;
    receipt.focus();
  });

  if (newBtn) {
    newBtn.addEventListener('click', function () {
      form.reset();
      var kort = form.querySelectorAll('.option');
      for (var i = 0; i < kort.length; i++) kort[i].classList.remove('is-selected');
      receipt.hidden = true;
      form.hidden = false;
      visSteg(1, true);
    });
  }

  visSteg(1, false);
})();
