/*
  Castel Bygg AS — oppførsel.
  Tre ting: mobilmeny, rolig innfasing ved scroll, og befaringen som en
  tre-stegs forespørsel med oppsummering og kvittering. Alt skjer i
  nettleseren; ingenting sendes noe sted.
*/
(function () {
  'use strict';

  var doc = document;
  var reduserBevegelse = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Mobilmeny ---------- */

  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('hovedmeny');

  function settMeny(aapen) {
    if (!nav || !toggle) return;
    nav.hidden = !aapen;
    toggle.setAttribute('aria-expanded', aapen ? 'true' : 'false');
    toggle.setAttribute('aria-label', aapen ? 'Lukk meny' : 'Åpne meny');
  }

  if (toggle && nav) {
    var breddeNa = window.innerWidth;
    settMeny(breddeNa > 900);

    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.innerWidth <= 900) settMeny(false);
    });

    window.addEventListener('resize', function () {
      var b = window.innerWidth;
      if ((breddeNa > 900) !== (b > 900)) settMeny(b > 900);
      breddeNa = b;
    });
  }

  /* ---------- Innfasing ved scroll ---------- */

  var los = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));

  function visAlle() {
    los.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (!los.length) {
    /* ingenting å fase inn */
  } else if (!('IntersectionObserver' in window) || reduserBevegelse) {
    visAlle();
  } else {
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (opp) {
        if (opp.isIntersecting) {
          opp.target.classList.add('is-visible');
          io.unobserve(opp.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    los.forEach(function (el) { io.observe(el); });

    /* Sikkerhetsnett: innholdet skal aldri bli stående usynlig. */
    window.setTimeout(visAlle, 2500);
  }

  /* ---------- Befaring ---------- */

  var form = doc.getElementById('befaring-skjema');
  if (!form) return;

  var panel = doc.querySelector('.booking__panel');
  var stepper = doc.querySelector('.stepper');
  var kvittering = doc.getElementById('kvittering');
  var sammendrag = doc.querySelector('.summary');
  var dagerRom = doc.getElementById('dager');
  var steg = Array.prototype.slice.call(form.querySelectorAll('.bstep'));
  var stegMerker = Array.prototype.slice.call(doc.querySelectorAll('.stepper li'));
  var aktivtSteg = 1;

  var ukedag = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
  var maned = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function lagDager() {
    if (!dagerRom) return;
    var dager = [];
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    while (dager.length < 10) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      dager.push(new Date(d));
    }
    dager.forEach(function (dt) {
      var iso = dt.getFullYear() + '-' + toSiffer(dt.getMonth() + 1) + '-' + toSiffer(dt.getDate());
      var kort = ukedag[dt.getDay()] + ' ' + dt.getDate() + '. ' + maned[dt.getMonth()];
      kort = kort.charAt(0).toUpperCase() + kort.slice(1);
      var merke = doc.createElement('label');
      merke.className = 'chip';
      var input = doc.createElement('input');
      input.type = 'radio';
      input.name = 'dag';
      input.value = iso;
      input.setAttribute('data-lang', kort);
      var tekst = doc.createElement('span');
      tekst.textContent = kort;
      merke.appendChild(input);
      merke.appendChild(tekst);
      dagerRom.appendChild(merke);
    });
  }
  lagDager();

  function valgt(sel) {
    var el = form.querySelector(sel + ':checked');
    return el ? el.value : '';
  }

  function visFeil(n, vis) {
    var el = form.querySelector('[data-feil="' + n + '"]');
    if (el) el.hidden = !vis;
  }

  function visSteg(n) {
    aktivtSteg = n;
    steg.forEach(function (s) {
      s.hidden = Number(s.getAttribute('data-step')) !== n;
    });
    stegMerker.forEach(function (li) {
      var i = Number(li.getAttribute('data-step'));
      li.classList.toggle('is-active', i === n);
      li.classList.toggle('is-done', i < n);
    });
    var gjeldende = form.querySelector('.bstep[data-step="' + n + '"]');
    if (gjeldende) {
      gjeldende.setAttribute('tabindex', '-1');
      gjeldende.focus({ preventScroll: true });
    }
    if (panel) {
      var r = panel.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        panel.scrollIntoView({ block: 'start', behavior: reduserBevegelse ? 'auto' : 'smooth' });
      }
    }
  }

  function oppdaterSammendrag() {
    if (!sammendrag) return;
    var dagEl = form.querySelector('input[name="dag"]:checked');
    var felter = {
      type: valgt('input[name="type"]') || 'Ikke valgt',
      dag: dagEl ? dagEl.getAttribute('data-lang') : 'Ikke valgt',
      tid: valgt('input[name="tid"]') || 'Ikke valgt'
    };
    Object.keys(felter).forEach(function (nokkel) {
      var el = sammendrag.querySelector('[data-sum="' + nokkel + '"]');
      if (el) el.textContent = felter[nokkel];
    });
  }

  form.addEventListener('change', function (event) {
    var navn = event.target.name;
    if (navn === 'type') visFeil(1, false);
    if (navn === 'dag' || navn === 'tid') visFeil(2, false);
    if (navn === 'navn' || navn === 'telefon' || navn === 'epost') visFeil(3, false);
    oppdaterSammendrag();
  });

  form.addEventListener('click', function (event) {
    var neste = event.target.closest('[data-next]');
    var tilbake = event.target.closest('[data-back]');

    if (tilbake) {
      visSteg(Math.max(1, aktivtSteg - 1));
      return;
    }
    if (!neste) return;

    if (aktivtSteg === 1) {
      if (!valgt('input[name="type"]')) {
        visFeil(1, true);
        return;
      }
      visFeil(1, false);
      visSteg(2);
      return;
    }

    if (aktivtSteg === 2) {
      if (!valgt('input[name="dag"]') || !valgt('input[name="tid"]')) {
        visFeil(2, true);
        return;
      }
      visFeil(2, false);
      oppdaterSammendrag();
      visSteg(3);
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var navnFelt = form.querySelector('input[name="navn"]');
    var telefonFelt = form.querySelector('input[name="telefon"]');
    var epostFelt = form.querySelector('input[name="epost"]');
    var navn = navnFelt ? navnFelt.value.trim() : '';
    var telefonRent = telefonFelt ? telefonFelt.value.replace(/\D/g, '') : '';
    var epost = epostFelt ? epostFelt.value.trim() : '';
    var epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost);

    if (navn.length < 2 || (telefonRent.length < 8 && !epostOk)) {
      visFeil(3, true);
      if (navn.length < 2 && navnFelt) navnFelt.focus();
      else if (telefonFelt) telefonFelt.focus();
      return;
    }
    visFeil(3, false);

    var dagEl = form.querySelector('input[name="dag"]:checked');
    var dagTekst = dagEl ? dagEl.getAttribute('data-lang') : '';
    var dagIso = dagEl ? dagEl.value : '';
    var tid = valgt('input[name="tid"]');
    var type = valgt('input[name="type"]');
    var naa = new Date();
    var referanse = 'CB-' + naa.getFullYear() + toSiffer(naa.getMonth() + 1) + toSiffer(naa.getDate()) + '-' + (Math.floor(Math.random() * 900) + 100);
    var kontakt = telefonFelt ? 'Telefon ' + telefonFelt.value.trim() : '';
    if (epostOk) kontakt += (kontakt ? ' · ' : '') + epost;

    function sett(id, tekst) {
      var el = doc.getElementById(id);
      if (el) el.textContent = tekst;
    }
    sett('kvitt-ref', referanse);
    sett('kvitt-type', type);
    sett('kvitt-tid', dagTekst + (dagIso ? ' (' + dagIso + ')' : '') + ', kl. ' + tid);
    sett('kvitt-navn', navn);
    sett('kvitt-kontakt', kontakt);

    form.hidden = true;
    if (stepper) stepper.hidden = true;
    if (kvittering) {
      kvittering.hidden = false;
      kvittering.focus({ preventScroll: true });
    }
    if (panel) {
      panel.scrollIntoView({ block: 'start', behavior: reduserBevegelse ? 'auto' : 'smooth' });
    }
  });

  var startPaaNytt = doc.getElementById('start-pa-nytt');
  if (startPaaNytt) {
    startPaaNytt.addEventListener('click', function () {
      form.reset();
      oppdaterSammendrag();
      visFeil(1, false);
      visFeil(2, false);
      visFeil(3, false);
      if (kvittering) kvittering.hidden = true;
      if (stepper) stepper.hidden = false;
      form.hidden = false;
      visSteg(1);
      if (panel) panel.scrollIntoView({ block: 'start', behavior: reduserBevegelse ? 'auto' : 'smooth' });
    });
  }
})();
