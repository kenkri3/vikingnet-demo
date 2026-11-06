/* Omega TDS — app.js
   Ingen avhengigheter, ingen backend, ingen sporing. Bestillingsflyten er
   ren klientkode: ingenting sendes eller lagres. Kvitteringen lager en
   ferdig utfylt e-post til post@omegatds.no som brukeren selv sender. */

(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* --- Mobilmeny --- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    var lukk = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) lukk();
    });
  }

  /* --- Årstall i footer --- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Rolig innkomst når seksjonen kommer i bildet --- */
  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kandidater = document.querySelectorAll('.svc__card, .also__item, .flow__step, .ref, .person, .contact__fig');
  if (!rolig && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal', 'is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    kandidater.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* --- Bestillingsflyt --- */
  var boks = document.querySelector('[data-booking]');
  if (!boks) return;

  var skjema = boks.querySelector('[data-booking-form]');
  var steg = Array.prototype.slice.call(boks.querySelectorAll('[data-step]'));
  var etiketter = Array.prototype.slice.call(boks.querySelectorAll('[data-steplabel]'));
  var knappNeste = boks.querySelector('[data-next]');
  var knappTilbake = boks.querySelector('[data-prev]');
  var knappSend = boks.querySelector('[data-submit]');
  var kvittering = boks.querySelector('[data-receipt]');
  var dagBoks = boks.querySelector('[data-days]');
  var feil1 = boks.querySelector('[data-error="1"]');
  var feil2 = boks.querySelector('[data-error="2"]');
  var feil2b = boks.querySelector('[data-error="2b"]');
  var oppsummering = boks.querySelector('[data-summary]');
  var kvitteringSum = boks.querySelector('[data-receipt-summary]');
  var kvitteringRef = boks.querySelector('[data-ref]');
  var kvitteringMail = boks.querySelector('[data-receipt-mail]');
  var startPaaNytt = boks.querySelector('[data-restart]');
  var aktivt = 1;

  var maaned = ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'];
  var ukedag = ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'];

  function datoTekst(dato) {
    return ukedag[dato.getDay()] + ' ' + dato.getDate() + '. ' + maaned[dato.getMonth()];
  }

  function iso(dato) {
    var m = String(dato.getMonth() + 1);
    var d = String(dato.getDate());
    return dato.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (d.length < 2 ? '0' + d : d);
  }

  function lagDager() {
    if (!dagBoks || dagBoks.children.length) return;
    var dag = new Date();
    dag.setHours(12, 0, 0, 0);
    var lagt = 0;
    while (lagt < 10) {
      dag.setDate(dag.getDate() + 1);
      if (dag.getDay() === 0 || dag.getDay() === 6) continue;
      var label = document.createElement('label');
      label.className = 'choice';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'dag';
      input.value = iso(dag);
      input.className = 'choice__radio';
      input.setAttribute('data-label', datoTekst(dag));
      var tekst = document.createElement('span');
      tekst.className = 'choice__date';
      var liten = document.createElement('span');
      liten.className = 'choice__day';
      liten.textContent = lagt === 0 ? 'Neste virkedag' : ukedag[dag.getDay()];
      tekst.appendChild(liten);
      tekst.appendChild(document.createTextNode(datoTekst(dag)));
      label.appendChild(input);
      label.appendChild(tekst);
      dagBoks.appendChild(label);
      lagt++;
    }
  }

  function visSteg(n) {
    aktivt = n;
    steg.forEach(function (el) {
      el.classList.toggle('is-active', Number(el.getAttribute('data-step')) === n);
    });
    etiketter.forEach(function (el) {
      var nr = Number(el.getAttribute('data-steplabel'));
      el.classList.toggle('is-active', nr === n);
      el.classList.toggle('is-done', nr < n);
      if (nr === n) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    knappTilbake.hidden = n === 1;
    knappNeste.hidden = n === 3;
    knappSend.hidden = n !== 3;
    if (n === 3) fyllOppsummering();
  }

  function skjulFeil() {
    [feil1, feil2, feil2b].forEach(function (el) {
      if (el) el.hidden = true;
    });
  }

  function valgt(navn) {
    var el = skjema.querySelector('input[name="' + navn + '"]:checked');
    return el ? el.value : '';
  }

  function valgtDag() {
    var el = skjema.querySelector('input[name="dag"]:checked');
    if (!el) return '';
    return el.getAttribute('data-label') || el.value;
  }

  function felt(navn) {
    var el = skjema.querySelector('[name="' + navn + '"]');
    return el ? el.value.trim() : '';
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function sjekk(n) {
    skjulFeil();
    if (n === 1) {
      if (!valgt('tjeneste')) {
        feil1.hidden = false;
        return false;
      }
      return true;
    }
    if (n === 2) {
      var ok = true;
      if (!valgt('dag')) {
        feil2.hidden = false;
        ok = false;
      }
      var navn = felt('navn');
      var epost = felt('epost');
      var telefon = felt('telefon').replace(/\s+/g, '');
      if (navn.length < 2 || !gyldigEpost(epost) || telefon.replace(/\D/g, '').length < 6) {
        feil2b.hidden = false;
        ok = false;
      }
      return ok;
    }
    return true;
  }

  function leggTil(beholder, nokkel, verdi) {
    if (!verdi) return;
    var dt = document.createElement('dt');
    dt.textContent = nokkel;
    var dd = document.createElement('dd');
    dd.textContent = verdi;
    beholder.appendChild(dt);
    beholder.appendChild(dd);
  }

  function linjer() {
    var rader = [
      ['Tjeneste', valgt('tjeneste')],
      ['Ønsket dag', valgtDag()],
      ['Navn', felt('navn')],
      ['E-post', felt('epost')],
      ['Telefon', felt('telefon')],
      ['Adresse til anlegget', felt('adresse')],
      ['Merknad', felt('merknad')]
    ];
    return rader.filter(function (rad) {
      return rad[1] !== '';
    });
  }

  function fyllOppsummering() {
    if (!oppsummering) return;
    oppsummering.textContent = '';
    linjer().forEach(function (rad) {
      leggTil(oppsummering, rad[0], rad[1]);
    });
  }

  function referanse() {
    var n = new Date();
    var m = String(n.getMonth() + 1);
    var d = String(n.getDate());
    return 'OT-' + n.getFullYear() + (m.length < 2 ? '0' + m : m) + (d.length < 2 ? '0' + d : d) + '-' +
      String(Math.floor(Math.random() * 900) + 100);
  }

  function send() {
    if (!sjekk(3)) return;
    var ref = referanse();
    var kropp = ['Forespørsel fra nettsiden', 'Referanse: ' + ref, ''];
    linjer().forEach(function (rad) {
      kropp.push(rad[0] + ': ' + rad[1]);
    });
    var emne = 'Forespørsel om befaring — ' + valgt('tjeneste');
    var href = 'mailto:post@omegatds.no?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp.join('\n'));

    if (kvitteringRef) kvitteringRef.textContent = ref;
    if (kvitteringMail) kvitteringMail.setAttribute('href', href);
    if (kvitteringSum) {
      kvitteringSum.textContent = '';
      linjer().forEach(function (rad) {
        leggTil(kvitteringSum, rad[0], rad[1]);
      });
    }
    skjema.hidden = true;
    kvittering.hidden = false;
    if (kvittering.scrollIntoView) {
      kvittering.scrollIntoView({ block: 'center', behavior: rolig ? 'auto' : 'smooth' });
    }
  }

  function start() {
    if (!kvittering) return;
    kvittering.hidden = true;
    skjema.hidden = false;
    skjema.reset();
    skjulFeil();
    oppsummering.textContent = '';
    visSteg(1);
    var forste = skjema.querySelector('input[name="tjeneste"]');
    if (forste) forste.focus({ preventScroll: true });
  }

  lagDager();
  visSteg(1);

  knappNeste.addEventListener('click', function () {
    if (!sjekk(aktivt)) return;
    if (aktivt < 3) visSteg(aktivt + 1);
  });

  knappTilbake.addEventListener('click', function () {
    if (aktivt > 1) visSteg(aktivt - 1);
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (aktivt < 3) {
      if (sjekk(aktivt)) visSteg(aktivt + 1);
      return;
    }
    send();
  });

  skjema.addEventListener('change', function (event) {
    if (event.target.name === 'tjeneste' && feil1) feil1.hidden = true;
    if (event.target.name === 'dag' && feil2) feil2.hidden = true;
  });

  skjema.addEventListener('input', function (event) {
    if (['navn', 'epost', 'telefon'].indexOf(event.target.name) !== -1 && feil2b) feil2b.hidden = true;
  });

  if (startPaaNytt) startPaaNytt.addEventListener('click', start);
})();
