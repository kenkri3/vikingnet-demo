/* Conscia Norge — meny, innlasting og henvendelsesflyten.
   Alt skjer i nettleseren: ingen data sendes, ingenting lagres. */
(function () {
  'use strict';

  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Meny (mobil) ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var settMeny = function (apen) {
      nav.classList.toggle('is-open', apen);
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
    };

    toggle.addEventListener('click', function () {
      settMeny(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        settMeny(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(false);
    });
  }

  /* ---------------- Innlasting ---------------- */

  var elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  var vis = function (el) {
    el.classList.add('is-visible');
  };

  if (elementer.length && 'IntersectionObserver' in window && !redusertBevegelse) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          vis(oppforing.target);
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    elementer.forEach(function (el) { observator.observe(el); });

    /* Sikkerhetsnett: blir noe stående usynlig, vises det uansett. */
    window.setTimeout(function () {
      elementer.forEach(function (el) { vis(el); });
      observator.disconnect();
    }, 2500);
  } else {
    elementer.forEach(vis);
  }

  /* ---------------- Henvendelse ---------------- */

  var form = document.getElementById('request-form');
  if (!form) return;

  var kort = document.querySelector('.request');
  var steg = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var streker = Array.prototype.slice.call(document.querySelectorAll('.request__bars span'));
  var stegNa = document.querySelector('[data-step-now]');
  var live = document.getElementById('request-status');
  var kvittering = document.getElementById('receipt');
  var aktivtSteg = 0;

  var omrader = {
    sikkerhet: { navn: 'Sikkerhet', team: 'Conscia Sikkerhet' },
    nettverk: { navn: 'Nettverk', team: 'Conscia Nettverk' },
    sky: { navn: 'Hybrid sky', team: 'Conscia Hybrid sky' },
    observability: { navn: 'Observability', team: 'Conscia Observability' },
    radgivning: { navn: 'Rådgivning', team: 'Conscia Rådgivning' }
  };

  var felt = function (navn) {
    return form.elements[navn];
  };

  var visFeil = function (nokkel, tekst) {
    var boks = form.querySelector('[data-error="' + nokkel + '"]');
    if (!boks) return;
    if (tekst) boks.textContent = tekst;
    boks.hidden = false;
  };

  var skjulFeil = function (nokkel) {
    var boks = form.querySelector('[data-error="' + nokkel + '"]');
    if (boks) boks.hidden = true;
  };

  var merk = function (el, ugyldig) {
    if (!el) return;
    el.classList.toggle('is-invalid', ugyldig);
    if (ugyldig) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  };

  var gyldigEpost = function (verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
  };

  var sjekkSteg1 = function () {
    var valgt = form.querySelector('input[name="omrade"]:checked');
    if (!valgt) {
      visFeil('omrade');
      var forste = form.querySelector('input[name="omrade"]');
      if (forste) forste.focus();
      return false;
    }
    skjulFeil('omrade');
    return true;
  };

  var sjekkSteg2 = function () {
    var navn = felt('navn');
    var epost = felt('epost');
    var virksomhet = felt('virksomhet');
    var feil = [];

    var navnOk = navn.value.trim().length >= 2;
    merk(navn, !navnOk);
    if (!navnOk) feil.push({ el: navn, tekst: 'Fyll inn navn.' });

    var epostOk = gyldigEpost(epost.value.trim());
    merk(epost, !epostOk);
    if (!epostOk) feil.push({ el: epost, tekst: 'Fyll inn en gyldig e-postadresse.' });

    var virksomhetOk = virksomhet.value.trim().length >= 2;
    merk(virksomhet, !virksomhetOk);
    if (!virksomhetOk) feil.push({ el: virksomhet, tekst: 'Fyll inn virksomhet.' });

    if (feil.length) {
      visFeil('kontakt', feil.length === 1
        ? feil[0].tekst
        : 'Fyll inn navn, en gyldig e-postadresse og virksomhet.');
      feil[0].el.focus();
      return false;
    }

    skjulFeil('kontakt');
    return true;
  };

  var fyllSammendrag = function () {
    var valgt = form.querySelector('input[name="omrade"]:checked');
    var sett = function (nokkel, verdi) {
      var el = form.querySelector('[data-sum="' + nokkel + '"]');
      if (el) el.textContent = verdi;
    };

    sett('omrade', valgt ? omrader[valgt.value].navn : '–');
    sett('navn', felt('navn').value.trim() || '–');
    sett('epost', felt('epost').value.trim() || '–');
    sett('telefon', felt('telefon').value.trim() || 'Ikke oppgitt');
    sett('virksomhet', felt('virksomhet').value.trim() || '–');
    sett('storrelse', felt('storrelse').value || 'Ikke oppgitt');
    sett('haster', felt('haster').checked ? 'Ja, pågående hendelse' : 'Nei');
  };

  var visSteg = function (nummer, fokuser) {
    if (!steg[nummer]) return;
    aktivtSteg = nummer;
    steg.forEach(function (el, i) {
      el.hidden = i !== nummer;
    });
    streker.forEach(function (el, i) {
      el.classList.toggle('is-on', i <= nummer);
    });
    if (stegNa) stegNa.textContent = String(nummer + 1);

    if (nummer === 2) fyllSammendrag();

    var overskrift = steg[nummer].querySelector('legend');
    if (live) {
      live.textContent = 'Steg ' + (nummer + 1) + ' av 3: ' + (overskrift ? overskrift.textContent : '');
    }

    var fokus = steg[nummer].querySelector('input, select, button:not([data-prev])');
    if (fokus && fokuser !== false) fokus.focus({ preventScroll: true });

    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ block: 'start', behavior: redusertBevegelse ? 'auto' : 'smooth' });
    }
  };

  var neste = function () {
    if (aktivtSteg === 0 && !sjekkSteg1()) return;
    if (aktivtSteg === 1 && !sjekkSteg2()) return;
    if (aktivtSteg < steg.length - 1) visSteg(aktivtSteg + 1);
  };

  var tilbake = function () {
    if (aktivtSteg > 0) visSteg(aktivtSteg - 1);
  };

  Array.prototype.forEach.call(form.querySelectorAll('[data-next]'), function (knapp) {
    knapp.addEventListener('click', neste);
  });

  Array.prototype.forEach.call(form.querySelectorAll('[data-prev]'), function (knapp) {
    knapp.addEventListener('click', tilbake);
  });

  form.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    var mal = event.target;
    if (mal.tagName === 'BUTTON' || mal.type === 'radio' || mal.type === 'checkbox') return;
    if (aktivtSteg < steg.length - 1) {
      event.preventDefault();
      neste();
    }
  });

  form.addEventListener('input', function (event) {
    var el = event.target;
    if (el.classList.contains('is-invalid')) {
      merk(el, false);
      if (el.name === 'navn' || el.name === 'epost' || el.name === 'virksomhet') {
        skjulFeil('kontakt');
      }
    }
  });

  form.addEventListener('change', function (event) {
    if (event.target.name === 'omrade') skjulFeil('omrade');
  });

  var bokstaver = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  var lagReferanse = function () {
    var ut = '';
    for (var i = 0; i < 6; i++) {
      ut += bokstaver.charAt(Math.floor(Math.random() * bokstaver.length));
    }
    return 'CN-' + ut;
  };

  var visKvittering = function () {
    var valgt = form.querySelector('input[name="omrade"]:checked');
    var omrade = valgt ? omrader[valgt.value] : omrader.sikkerhet;
    var epost = felt('epost').value.trim();
    var referanse = lagReferanse();

    document.getElementById('receipt-ref').textContent = referanse;
    document.getElementById('receipt-team').textContent = omrade.team;

    var tid = new Date();
    document.getElementById('receipt-time').textContent = tid.toLocaleString('nb-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('receipt-next').textContent = 'Vi kontakter deg på ' + epost + '.';

    var haster = felt('haster').checked;
    document.getElementById('receipt-urgent').hidden = !haster;

    form.hidden = true;
    kvittering.hidden = false;

    var overskrift = kvittering.querySelector('h3');
    overskrift.setAttribute('tabindex', '-1');
    overskrift.focus({ preventScroll: true });

    if (live) {
      live.textContent = 'Henvendelse mottatt med referanse ' + referanse + '. Rutet til ' + omrade.team + '.';
    }

    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ block: 'start', behavior: redusertBevegelse ? 'auto' : 'smooth' });
    }
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (aktivtSteg !== steg.length - 1) {
      neste();
      return;
    }
    skjulFeil('send');
    visKvittering();
  });

  var nullstill = function () {
    form.reset();
    Array.prototype.forEach.call(form.querySelectorAll('.is-invalid'), function (el) {
      merk(el, false);
    });
    ['omrade', 'kontakt', 'send'].forEach(skjulFeil);
    kvittering.hidden = true;
    form.hidden = false;
    visSteg(0);
    if (live) live.textContent = 'Skjemaet er nullstilt.';
  };

  var nullstillKnapp = kvittering.querySelector('[data-reset]');
  if (nullstillKnapp) nullstillKnapp.addEventListener('click', nullstill);

  visSteg(0, false);
})();
