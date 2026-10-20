/* =========================================================
   VDA Lifting AS — app.js
   Tre ting: mobilmeny, rolig innfasing, og forespørselen i to
   steg med kvittering. Alt skjer i nettleseren; skissen lagrer
   ingenting. Knappen i kvitteringen åpner et ferdig utfylt
   e-postutkast til post@vdalifting.no.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('site-nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  /* ---------- Rolig innfasing ---------- */
  var reveal = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reveal.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Forespørsel ---------- */
  var form = document.getElementById('req-form');
  if (!form) return;

  var panel1 = document.getElementById('req-panel-1');
  var panel2 = document.getElementById('req-panel-2');
  var receipt = document.getElementById('receipt');
  var stepEl = document.getElementById('req-step');
  var titleEl = document.getElementById('req-title');
  var leadEl = document.getElementById('req-lead');
  var err1 = document.getElementById('req-err-1');
  var err2 = document.getElementById('req-err-2');
  var kursWrap = document.getElementById('kurs-wrap');
  var listEl = document.getElementById('kvitt-liste');
  var refEl = document.getElementById('kvitt-ref');
  var mailLink = document.getElementById('kvitt-mail');
  var backBtn = document.getElementById('req-back');
  var newBtn = document.getElementById('kvitt-ny');

  var steg = 1;

  function verdi(navn) {
    var felt = form.elements[navn];
    return felt ? String(felt.value || '').trim() : '';
  }

  function valgtType() {
    var valgt = form.querySelector('input[name="type"]:checked');
    return valgt ? valgt.value : '';
  }

  function synkKurs() {
    if (kursWrap) kursWrap.hidden = valgtType() !== 'Kurs';
  }

  function visFeil(el, melding) {
    if (!el) return;
    el.textContent = melding;
    el.hidden = false;
  }

  function skjulFeil() {
    if (err1) err1.hidden = true;
    if (err2) err2.hidden = true;
  }

  function visSteg(n) {
    steg = n;
    if (panel1) panel1.hidden = n !== 1;
    if (panel2) panel2.hidden = n !== 2;
    if (stepEl) stepEl.textContent = 'Steg ' + n + ' av 2';

    if (n === 2) {
      if (titleEl) titleEl.textContent = 'Hvor når vi deg?';
      if (leadEl) leadEl.textContent = 'Vi bruker opplysningene bare til å svare på denne henvendelsen.';
      var navnFelt = document.getElementById('navn');
      if (navnFelt) navnFelt.focus();
    } else {
      if (titleEl) titleEl.textContent = 'Hva gjelder det?';
      if (leadEl) leadEl.textContent = 'Velg type først, så tar vi kontaktinfo til slutt.';
    }

    skjulFeil();
  }

  function lagReferanse() {
    var aar = String(new Date().getFullYear()).slice(2);
    var nr = Math.floor(1000 + Math.random() * 9000);
    return 'VDA-' + aar + '-' + nr;
  }

  function kvitter() {
    var type = valgtType();
    var kurs = type === 'Kurs' ? verdi('kurs') : '';
    var referanse = lagReferanse();
    var rader = [['Type', type]];

    if (kurs) rader.push(['Kurs', kurs]);
    if (verdi('behov')) rader.push(['Behov', verdi('behov')]);
    if (verdi('bedrift')) rader.push(['Bedrift', verdi('bedrift')]);
    rader.push(['Navn', verdi('navn')]);
    if (verdi('epost')) rader.push(['E-post', verdi('epost')]);
    if (verdi('telefon')) rader.push(['Telefon', verdi('telefon')]);
    rader.push(['Referanse', referanse]);

    if (listEl) {
      listEl.innerHTML = '';
      rader.forEach(function (rad) {
        var div = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = rad[0];
        dd.textContent = rad[1];
        div.appendChild(dt);
        div.appendChild(dd);
        listEl.appendChild(div);
      });
    }

    if (refEl) refEl.textContent = referanse;

    if (mailLink) {
      var emne = 'Forespørsel – ' + type + (kurs ? ': ' + kurs : '');
      var kropp = rader.map(function (rad) { return rad[0] + ': ' + rad[1]; }).join('\n');
      mailLink.href = 'mailto:post@vdalifting.no?subject=' +
        encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
    }

    form.hidden = true;
    if (receipt) {
      receipt.hidden = false;
      receipt.scrollIntoView({ block: 'nearest' });
    }
    if (mailLink) mailLink.focus();
  }

  form.addEventListener('change', function (event) {
    if (event.target && event.target.name === 'type') synkKurs();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (steg === 1) {
      if (!valgtType()) {
        visFeil(err1, 'Velg hva forespørselen gjelder.');
        return;
      }
      visSteg(2);
      return;
    }

    var navn = verdi('navn');
    var epost = verdi('epost');
    var telefon = verdi('telefon').replace(/[^0-9]/g, '');

    if (navn.length < 2) {
      visFeil(err2, 'Skriv navnet ditt, så vi vet hvem vi svarer.');
      var nf = document.getElementById('navn');
      if (nf) nf.focus();
      return;
    }

    var epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost);

    if (!epostOk && telefon.length < 8) {
      visFeil(err2, 'Legg inn en gyldig e-postadresse eller et telefonnummer.');
      var ef = document.getElementById('epost');
      if (ef) ef.focus();
      return;
    }

    skjulFeil();
    kvitter();
  });

  if (backBtn) {
    backBtn.addEventListener('click', function () { visSteg(1); });
  }

  if (newBtn) {
    newBtn.addEventListener('click', function () {
      form.reset();
      if (receipt) receipt.hidden = true;
      form.hidden = false;
      synkKurs();
      visSteg(1);
      var navnFelt = document.getElementById('navn');
      if (navnFelt) navnFelt.value = '';
    });
  }

  /* Knapper andre steder på siden som velger type på forhånd */
  Array.prototype.slice.call(document.querySelectorAll('[data-type]')).forEach(function (el) {
    el.addEventListener('click', function () {
      var onske = el.getAttribute('data-type');
      Array.prototype.slice.call(form.querySelectorAll('input[name="type"]')).forEach(function (radio) {
        radio.checked = radio.value === onske;
      });
      if (receipt && !receipt.hidden) {
        receipt.hidden = true;
        form.hidden = false;
      }
      synkKurs();
      visSteg(1);
    });
  });

  synkKurs();
})();
