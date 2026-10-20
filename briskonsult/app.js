/*
  BriS Konsult AS — demoskript.
  Ingenting sendes, ingenting lagres. Skjemaet bygger et sammendrag i
  nettleseren og åpner en ferdig utfylt e-post når brukeren selv vil.
*/

(function () {
  'use strict';

  /* ---------------- Meny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hovedmeny');
  var bredtNok = window.matchMedia('(min-width: 901px)');

  function settMeny() {
    if (!nav || !toggle) return;
    if (bredtNok.matches) {
      nav.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var lukket = nav.hasAttribute('hidden');
      if (lukket) {
        nav.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    nav.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a') && !bredtNok.matches) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    settMeny();
    if (bredtNok.addEventListener) {
      bredtNok.addEventListener('change', settMeny);
    } else if (bredtNok.addListener) {
      bredtNok.addListener(settMeny);
    }
  }

  /* ---------------- Innkomstanimasjon ---------------- */

  var synlige = [].slice.call(document.querySelectorAll('.reveal'));

  function visAlt() {
    synlige.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (!('IntersectionObserver' in window)) {
    visAlt();
  } else {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    synlige.forEach(function (el) {
      observator.observe(el);
    });

    /* Nett: innholdet skal aldri bli stående usynlig. */
    window.setTimeout(visAlt, 2000);
  }

  /* ---------------- Forespørsel ---------------- */

  var form = document.getElementById('requestForm');

  if (!form) return;

  var panes = [].slice.call(document.querySelectorAll('.pane'));
  var dots = [].slice.call(document.querySelectorAll('.progress__dots li'));
  var fill = document.getElementById('progressFill');
  var label = document.getElementById('progressLabel');
  var backBtn = document.getElementById('backBtn');
  var nextBtn = document.getElementById('nextBtn');
  var sendBtn = document.getElementById('sendBtn');
  var errBox = document.getElementById('formError');
  var receipt = document.getElementById('receipt');
  var receiptList = document.getElementById('receiptList');
  var receiptRef = document.getElementById('receiptRef');
  var mailBtn = document.getElementById('mailBtn');
  var restartBtn = document.getElementById('restartBtn');
  var steg = 1;

  function feil(tekst) {
    errBox.textContent = tekst;
    errBox.hidden = false;
  }

  function nullstillFeil() {
    errBox.hidden = true;
    errBox.textContent = '';
  }

  function tegnSteg() {
    panes.forEach(function (pane) {
      pane.classList.toggle('is-active', Number(pane.getAttribute('data-pane')) === steg);
    });

    dots.forEach(function (prikk) {
      var nr = Number(prikk.getAttribute('data-dot'));
      prikk.classList.toggle('is-current', nr === steg);
      prikk.classList.toggle('is-done', nr < steg);
    });

    fill.style.width = (steg / 3) * 100 + '%';
    label.textContent = 'Steg ' + steg + ' av 3';
    backBtn.hidden = steg === 1;
    nextBtn.hidden = steg === 3;
    sendBtn.hidden = steg !== 3;
    nullstillFeil();
  }

  function valgtLosning() {
    var valgt = form.querySelector('input[name="losning"]:checked');
    return valgt ? valgt.value : '';
  }

  function felt(verdi) {
    var el = form.querySelector('[name="' + verdi + '"]');
    return el ? el.value.trim() : '';
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
  }

  function sjekkSteg() {
    if (steg === 1 && !valgtLosning()) {
      feil('Velg hva du trenger, så går vi videre.');
      return false;
    }

    if (steg === 3) {
      if (felt('navn').length < 2) {
        feil('Vi trenger et navn å svare til.');
        form.querySelector('[name="navn"]').focus();
        return false;
      }
      if (!gyldigEpost(felt('epost'))) {
        feil('Skriv en e-postadresse vi kan svare på.');
        form.querySelector('[name="epost"]').focus();
        return false;
      }
    }

    return true;
  }

  function visSteg() {
    panes.forEach(function (pane) {
      if (pane.classList.contains('is-active')) {
        pane.setAttribute('tabindex', '-1');
        pane.focus({ preventScroll: true });
      }
    });
  }

  nextBtn.addEventListener('click', function () {
    if (!sjekkSteg()) return;
    steg = Math.min(3, steg + 1);
    tegnSteg();
    visSteg();
  });

  backBtn.addEventListener('click', function () {
    steg = Math.max(1, steg - 1);
    tegnSteg();
    visSteg();
  });

  form.addEventListener('change', function (hendelse) {
    if (hendelse.target.name === 'losning') nullstillFeil();
  });

  function lagReferanse() {
    var na = new Date();
    var dato = '' + na.getFullYear() +
      ('0' + (na.getMonth() + 1)).slice(-2) +
      ('0' + na.getDate()).slice(-2);
    return 'BRI-' + dato + '-' + (100 + Math.floor(Math.random() * 900));
  }

  function sammendrag() {
    var rader = [];
    var losning = valgtLosning();

    rader.push(['Løsning', losning]);
    rader.push(['Navn', felt('navn')]);
    rader.push(['E-post', felt('epost')]);

    if (felt('telefon')) rader.push(['Telefon', felt('telefon')]);
    if (felt('melding')) rader.push(['Om prosjektet', felt('melding')]);

    var tillegg = [].slice.call(form.querySelectorAll('input[name="tillegg"]:checked'))
      .map(function (boks) { return boks.value; });

    rader.push(['Ta med', tillegg.length ? tillegg.join(', ') : 'Ikke valgt']);

    return rader;
  }

  function tilEpost(rader, referanse) {
    var emne = 'Forespørsel ' + referanse + ' – ' + valgtLosning().toLowerCase();
    var kropp = ['Hei BriS Konsult,', '', 'Her er forespørselen min:', ''];

    rader.forEach(function (rad) {
      kropp.push(rad[0] + ': ' + rad[1]);
    });

    kropp.push('', 'Referanse: ' + referanse, '', 'Hilsen', felt('navn'));

    return 'mailto:post@briskonsult.no?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp.join('\n'));
  }

  form.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (!sjekkSteg()) return;

    var rader = sammendrag();
    var referanse = lagReferanse();

    receiptList.innerHTML = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      div.className = 'receipt__row';
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      receiptList.appendChild(div);
    });

    receiptRef.textContent = referanse;
    mailBtn.setAttribute('href', tilEpost(rader, referanse));

    form.hidden = true;
    receipt.hidden = false;
    receipt.setAttribute('tabindex', '-1');
    receipt.focus({ preventScroll: true });
  });

  restartBtn.addEventListener('click', function () {
    receipt.hidden = true;
    form.hidden = false;
    steg = 1;
    tegnSteg();
    visSteg();
  });

  tegnSteg();
})();
