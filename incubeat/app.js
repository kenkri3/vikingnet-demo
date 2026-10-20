/*
  Incubeat — app.js
  Meny, rolig innkomst, årstall og henvendelsesskjema med kvittering.
  Alt skjer i nettleseren. Ingenting sendes til en server og ingenting lagres.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apen = nav.hasAttribute('hidden');
      if (apen) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(apen));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Rolig innkomst ---------- */

  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var los = document.querySelectorAll('.reveal');

  if (redusert || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(los, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observator = new IntersectionObserver(
      function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (oppforing.isIntersecting) {
            oppforing.target.classList.add('is-visible');
            observator.unobserve(oppforing.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    Array.prototype.forEach.call(los, function (el) {
      observator.observe(el);
    });
  }

  /* ---------- Årstall ---------- */

  var aar = document.querySelector('[data-year]');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---------- Henvendelse med kvittering ---------- */

  var skjema = document.getElementById('henvForm');
  var kvitt = document.getElementById('henvKvittering');
  if (!skjema || !kvitt) return;

  var MOTTAKER = 'post@incubeat.no';

  var felt = {
    navn: document.getElementById('navn'),
    epost: document.getElementById('epost'),
    telefon: document.getElementById('telefon'),
    gjelder: document.getElementById('gjelder'),
    melding: document.getElementById('melding')
  };

  var feil = {
    navn: document.getElementById('feil-navn'),
    epost: document.getElementById('feil-epost'),
    melding: document.getElementById('feil-melding')
  };

  var ut = {
    ref: document.getElementById('kvittRef'),
    navn: document.getElementById('kvittNavn'),
    epost: document.getElementById('kvittEpost'),
    gjelder: document.getElementById('kvittGjelder'),
    tid: document.getElementById('kvittTid'),
    melding: document.getElementById('kvittMelding'),
    mail: document.getElementById('kvittMail'),
    tittel: document.getElementById('kvittTittel'),
    ny: document.getElementById('kvittNy')
  };

  function visFeil(nokkel, tekst) {
    if (!feil[nokkel]) return;
    feil[nokkel].textContent = tekst;
    feil[nokkel].hidden = false;
    felt[nokkel].setAttribute('aria-invalid', 'true');
  }

  function ryddFeil(nokkel) {
    if (!feil[nokkel]) return;
    feil[nokkel].hidden = true;
    felt[nokkel].removeAttribute('aria-invalid');
  }

  Object.keys(feil).forEach(function (nokkel) {
    felt[nokkel].addEventListener('input', function () {
      ryddFeil(nokkel);
    });
  });

  function serUtSomEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-zæøåA-ZÆØÅ]{2,}$/.test(verdi);
  }

  function lagReferanse() {
    var no = new Date();
    function to(n) {
      return String(n).padStart(2, '0');
    }
    return 'IB-' + to(no.getDate()) + to(no.getMonth() + 1) + '-' + String(Math.floor(Math.random() * 9000) + 1000);
  }

  function lagTid() {
    try {
      return new Intl.DateTimeFormat('nb-NO', {
        dateStyle: 'long',
        timeStyle: 'short'
      }).format(new Date());
    } catch (error) {
      return new Date().toLocaleString('nb-NO');
    }
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    var verdier = {
      navn: felt.navn.value.trim(),
      epost: felt.epost.value.trim(),
      telefon: felt.telefon.value.trim(),
      gjelder: felt.gjelder.value,
      melding: felt.melding.value.trim()
    };

    Object.keys(feil).forEach(ryddFeil);

    var forsteFeil = null;

    if (verdier.navn.length < 2) {
      visFeil('navn', 'Skriv navnet ditt.');
      forsteFeil = forsteFeil || felt.navn;
    }

    if (!serUtSomEpost(verdier.epost)) {
      visFeil('epost', 'Skriv en e-postadresse vi kan svare på, for eksempel navn@firma.no.');
      forsteFeil = forsteFeil || felt.epost;
    }

    if (verdier.melding.length < 10) {
      visFeil('melding', 'Skriv noen ord om hva henvendelsen gjelder.');
      forsteFeil = forsteFeil || felt.melding;
    }

    if (forsteFeil) {
      forsteFeil.focus();
      return;
    }

    /* Kvitteringen bygges av det brukeren selv skrev. */
    var referanse = lagReferanse();
    var tid = lagTid();

    ut.ref.textContent = referanse;
    ut.navn.textContent = verdier.navn;
    ut.epost.textContent = verdier.epost;
    ut.gjelder.textContent = verdier.gjelder;
    ut.tid.textContent = tid;
    ut.melding.textContent = verdier.melding;

    var emne = 'Henvendelse: ' + verdier.gjelder + ' — ' + verdier.navn;
    var kropp = [
      'Navn: ' + verdier.navn,
      'E-post: ' + verdier.epost,
      verdier.telefon ? 'Telefon: ' + verdier.telefon : '',
      'Gjelder: ' + verdier.gjelder,
      'Referanse: ' + referanse,
      '',
      verdier.melding
    ]
      .filter(function (linje) {
        return linje !== '';
      })
      .join('\n');

    ut.mail.href =
      'mailto:' + MOTTAKER + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

    skjema.hidden = true;
    kvitt.hidden = false;
    ut.tittel.focus();
  });

  ut.ny.addEventListener('click', function () {
    skjema.reset();
    Object.keys(feil).forEach(ryddFeil);
    kvitt.hidden = true;
    skjema.hidden = false;
    felt.navn.focus();
  });
})();
