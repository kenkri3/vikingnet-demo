/* Arundo — små, avhengighetsfrie hjelpere.
   Ingenting sendes: bookingen er en skisse som bare lever i nettleseren. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    };

    toggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Årstall ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Booking ---------- */

  var root = document.querySelector('[data-booking]');
  if (!root) return;

  var form = root.querySelector('[data-booking-form]');
  var receipt = root.querySelector('[data-receipt]');
  var status = root.querySelector('[data-status]');
  var steps = root.querySelectorAll('[data-steps] li');
  var panels = root.querySelectorAll('[data-panel]');
  var prevBtn = root.querySelector('[data-prev]');
  var nextBtn = root.querySelector('[data-next]');
  var confirmBtn = root.querySelector('[data-confirm]');
  var daysBox = root.querySelector('[data-days]');
  var timesBox = root.querySelector('[data-times]');

  var TIDER = ['09:00', '10:30', '13:00', '14:30'];
  var DAGER = 8;

  var state = { tema: '', dag: '', dagTekst: '', tid: '', steg: 1 };
  var dagKnapper = [];
  var tidKnapper = [];
  var temaKnapper = Array.prototype.slice.call(root.querySelectorAll('[data-tema]'));

  /* --- Dager og tider --- */

  var dagNavn = new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
  var langDato = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

  function isoDato(dato) {
    var ar = dato.getFullYear();
    var mnd = String(dato.getMonth() + 1).padStart(2, '0');
    var dag = String(dato.getDate()).padStart(2, '0');
    return ar + '-' + mnd + '-' + dag;
  }

  function lagDager() {
    var dato = new Date();
    dato.setHours(12, 0, 0, 0);
    var laget = 0;

    while (laget < DAGER) {
      dato.setDate(dato.getDate() + 1);
      var ukedag = dato.getDay();
      if (ukedag === 0 || ukedag === 6) continue;

      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'chip';
      knapp.setAttribute('aria-pressed', 'false');
      knapp.setAttribute('data-dag', isoDato(dato));
      knapp.textContent = dagNavn.format(dato);

      (function (iso, tekst) {
        knapp.addEventListener('click', function () {
          state.dag = iso;
          state.dagTekst = tekst;
          velgEn(tidKnapper, null);
          state.tid = '';
          velgEn(dagKnapper, knapp);
          si('');
        });
      })(isoDato(dato), langDato.format(dato));

      daysBox.appendChild(knapp);
      dagKnapper.push(knapp);
      laget += 1;
    }
  }

  function lagTider() {
    TIDER.forEach(function (tid) {
      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'chip';
      knapp.setAttribute('aria-pressed', 'false');
      knapp.textContent = tid;
      knapp.addEventListener('click', function () {
        state.tid = tid;
        velgEn(tidKnapper, knapp);
        si('');
      });
      timesBox.appendChild(knapp);
      tidKnapper.push(knapp);
    });
  }

  function velgEn(liste, valgt) {
    liste.forEach(function (knapp) {
      knapp.setAttribute('aria-pressed', String(knapp === valgt));
    });
  }

  /* --- Steg --- */

  function visSteg(n) {
    state.steg = n;
    Array.prototype.forEach.call(panels, function (panel) {
      var erAktiv = Number(panel.getAttribute('data-panel')) === n;
      panel.classList.toggle('is-active', erAktiv);
      if (erAktiv) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });

    Array.prototype.forEach.call(steps, function (li, i) {
      li.classList.toggle('is-active', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });

    if (prevBtn) prevBtn.hidden = n === 1;
    if (nextBtn) nextBtn.hidden = n === 3;
    if (confirmBtn) confirmBtn.hidden = n !== 3;

    var aktivPanel = root.querySelector('[data-panel="' + n + '"]');
    var forste = aktivPanel ? aktivPanel.querySelector('button, input, select, textarea') : null;
    if (forste) forste.focus({ preventScroll: true });
    si('');
  }

  function si(melding, ok) {
    if (!status) return;
    status.textContent = melding || '';
    status.classList.toggle('is-ok', Boolean(ok));
  }

  /* --- Validering --- */

  function felt(navn) {
    return form.querySelector('[name="' + navn + '"]');
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
  }

  function gyldigTelefon(verdi) {
    var siffer = verdi.replace(/\D/g, '');
    return siffer.length >= 8;
  }

  function merkFelt(el, feil) {
    if (!el) return;
    if (feil) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function neste() {
    if (state.steg === 1) {
      if (!state.tema) {
        si('Velg et tema før du går videre.');
        return;
      }
      visSteg(2);
      return;
    }

    if (state.steg === 2) {
      if (!state.dag) {
        si('Velg en dag.');
        return;
      }
      if (!state.tid) {
        si('Velg et klokkeslett.');
        return;
      }
      visSteg(3);
    }
  }

  /* --- Bekreftelse --- */

  function referanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i += 1) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    var naa = new Date();
    var dato = String(naa.getFullYear()).slice(2) + String(naa.getMonth() + 1).padStart(2, '0') + String(naa.getDate()).padStart(2, '0');
    return 'ARU-' + dato + '-' + kode;
  }

  function lagIcs(dato, tid, tema, ref) {
    var d = dato.replace(/-/g, '');
    var kl = tid.replace(':', '');
    var start = d + 'T' + kl + '00';
    var sluttTime = Number(tid.slice(0, 2));
    var sluttMin = Number(tid.slice(3, 5)) + 30;
    if (sluttMin >= 60) {
      sluttTime += 1;
      sluttMin -= 60;
    }
    var slutt = d + 'T' + String(sluttTime).padStart(2, '0') + String(sluttMin).padStart(2, '0') + '00';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Arundo//Samtale//NO',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + ref + '@arundo.com',
      'DTSTAMP:' + start,
      'DTSTART:' + start,
      'DTEND:' + slutt,
      'SUMMARY:Arundo – samtale om ' + tema,
      'DESCRIPTION:30 minutter på video. Referanse ' + ref + '.',
      'LOCATION:Videomøte',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function bekreft() {
    var navn = felt('navn');
    var epost = felt('epost');
    var telefon = felt('telefon');

    var navnVerdi = navn ? navn.value.trim() : '';
    var epostVerdi = epost ? epost.value.trim() : '';
    var telefonVerdi = telefon ? telefon.value.trim() : '';

    merkFelt(navn, false);
    merkFelt(epost, false);
    merkFelt(telefon, false);

    if (navnVerdi.length < 2) {
      merkFelt(navn, true);
      si('Skriv inn navnet ditt.');
      if (navn) navn.focus();
      return;
    }

    if (!gyldigEpost(epostVerdi)) {
      merkFelt(epost, true);
      si('Skriv inn en gyldig e-postadresse, for eksempel navn@firma.no.');
      if (epost) epost.focus();
      return;
    }

    if (!gyldigTelefon(telefonVerdi)) {
      merkFelt(telefon, true);
      si('Skriv inn et telefonnummer med minst åtte sifre.');
      if (telefon) telefon.focus();
      return;
    }

    var ref = referanse();
    var tidTekst = state.dagTekst + ', kl. ' + state.tid;
    var anlegg = felt('anlegg');

    root.querySelector('[data-ref]').textContent = ref;
    root.querySelector('[data-r-tema]').textContent = state.tema;
    root.querySelector('[data-r-tid]').textContent = tidTekst;
    root.querySelector('[data-r-navn]').textContent = navnVerdi;
    root.querySelector('[data-r-epost]').textContent = epostVerdi;
    root.querySelector('[data-r-telefon]').textContent = telefonVerdi;

    var melding = felt('melding') ? felt('melding').value.trim() : '';
    var linjer = [
      'Referanse: ' + ref,
      'Tema: ' + state.tema,
      'Tid: ' + tidTekst + ' (norsk tid)',
      'Navn: ' + navnVerdi,
      'E-post: ' + epostVerdi,
      'Telefon: ' + telefonVerdi
    ];
    if (anlegg && anlegg.value) linjer.push('Anleggstype: ' + anlegg.value);
    if (melding) linjer.push('Melding: ' + melding);

    var mailto = root.querySelector('[data-mailto]');
    if (mailto) {
      mailto.href = 'mailto:contact@arundo.com'
        + '?subject=' + encodeURIComponent('Samtale ' + state.dagTekst + ' kl. ' + state.tid + ' – ' + state.tema)
        + '&body=' + encodeURIComponent(linjer.join('\n'));
    }

    var icsKnapp = root.querySelector('[data-ics]');
    if (icsKnapp) {
      icsKnapp.onclick = function () {
        var ics = lagIcs(state.dag, state.tid, state.tema, ref);
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'arundo-samtale-' + ref + '.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        si('Kalenderfilen er lastet ned.', true);
      };
    }

    form.hidden = true;
    receipt.hidden = false;
    Array.prototype.forEach.call(steps, function (li) {
      li.classList.remove('is-active');
      li.classList.add('is-done');
    });

    var overskrift = receipt.querySelector('.booking__h');
    if (overskrift) {
      overskrift.setAttribute('tabindex', '-1');
      overskrift.focus({ preventScroll: true });
    }
  }

  function startPaNytt() {
    state = { tema: '', dag: '', dagTekst: '', tid: '', steg: 1 };
    velgEn(temaKnapper, null);
    velgEn(dagKnapper, null);
    velgEn(tidKnapper, null);
    if (form) {
      form.reset();
      form.hidden = false;
    }
    receipt.hidden = true;
    var icsKnapp = root.querySelector('[data-ics]');
    if (icsKnapp) icsKnapp.onclick = null;
    visSteg(1);
  }

  /* --- Koblinger --- */

  temaKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      state.tema = knapp.getAttribute('data-tema');
      velgEn(temaKnapper, knapp);
      si('');
    });
  });

  if (nextBtn) nextBtn.addEventListener('click', neste);

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (state.steg > 1) visSteg(state.steg - 1);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (state.steg === 3) bekreft();
    else neste();
  });

  var restart = root.querySelector('[data-restart]');
  if (restart) restart.addEventListener('click', startPaNytt);

  lagDager();
  lagTider();
})();
