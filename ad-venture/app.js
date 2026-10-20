/* Ad.venture — demo. Alt skjer i nettleseren; ingenting sendes. */
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!nav || !toggle) return;
    if (smalSkjerm.matches) {
      if (apen) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    } else {
      nav.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne meny');
    }
  }

  if (toggle && nav) {
    settMeny(false);

    toggle.addEventListener('click', function () {
      settMeny(nav.hasAttribute('hidden'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !nav.hasAttribute('hidden')) {
        settMeny(false);
        toggle.focus();
      }
    });

    if (smalSkjerm.addEventListener) {
      smalSkjerm.addEventListener('change', function () { settMeny(false); });
    } else if (smalSkjerm.addListener) {
      smalSkjerm.addListener(function () { settMeny(false); });
    }
  }

  /* ---------------- Innstikk av seksjoner ---------------- */

  var blokker = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function visAlle() {
    blokker.forEach(function (b) { b.classList.add('is-visible'); });
  }

  if ('IntersectionObserver' in window && blokker.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add('is-visible');
          observator.unobserve(o.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    blokker.forEach(function (b) { observator.observe(b); });
    /* Nett: om observatøren aldri fyrer, skal ingenting bli stående usynlig. */
    window.setTimeout(visAlle, 2500);
  } else {
    visAlle();
  }

  /* ---------------- Kanalplan ---------------- */

  var kort = Array.prototype.slice.call(document.querySelectorAll('.tcard'));
  var antallEl = document.getElementById('planAntall');
  var lesereEl = document.getElementById('planLesere');
  var hintEl = document.getElementById('planHint');
  var lagKnapp = document.getElementById('planLag');
  var nullKnapp = document.getElementById('planNull');
  var kvittering = document.getElementById('kvittering');
  var kvTall = document.getElementById('kvTall');
  var kvListe = document.getElementById('kvListe');
  var kvMail = document.getElementById('kvMail');
  var kvLukk = document.getElementById('kvLukk');

  if (!kort.length || !antallEl || !lesereEl) return;

  var hjemsok = window.matchMedia('(prefers-reduced-motion: reduce)');
  var valgt = [];
  var ADVARSEL = 'Velg minst én tittel først — klikk på en forside.';

  function tall(n) {
    return n.toLocaleString('nb-NO');
  }

  function sum() {
    return valgt.reduce(function (a, t) { return a + t.lesere; }, 0);
  }

  function oppdater() {
    antallEl.textContent = String(valgt.length);
    lesereEl.textContent = tall(sum());

    if (valgt.length) {
      hintEl.textContent = 'Planen er klar. Lag forespørselen når du vil sende den.';
      hintEl.classList.remove('is-warn');
    } else {
      hintEl.textContent = 'Klikk på en forside for å ta titlen med i planen.';
      hintEl.classList.remove('is-warn');
    }
  }

  function reset() {
    valgt = [];
    kort.forEach(function (k) { k.setAttribute('aria-pressed', 'false'); });
    oppdater();
    if (kvittering) kvittering.setAttribute('hidden', '');
  }

  kort.forEach(function (k) {
    k.addEventListener('click', function () {
      var tittel = k.getAttribute('data-tittel');
      var lesere = parseInt(k.getAttribute('data-lesere'), 10) || 0;
      var trykket = k.getAttribute('aria-pressed') === 'true';

      if (trykket) {
        k.setAttribute('aria-pressed', 'false');
        valgt = valgt.filter(function (t) { return t.tittel !== tittel; });
      } else {
        k.setAttribute('aria-pressed', 'true');
        valgt.push({ tittel: tittel, lesere: lesere });
      }

      if (kvittering && !kvittering.hasAttribute('hidden')) {
        if (valgt.length) {
          byggKvittering();
        } else {
          kvittering.setAttribute('hidden', '');
        }
      }
      oppdater();
    });
  });

  function byggKvittering() {
    if (!valgt.length) return;

    var sortert = valgt.slice().sort(function (a, b) { return b.lesere - a.lesere; });
    var total = sum();
    var navn = sortert.map(function (t) { return t.tittel; });

    kvTall.textContent = sortert.length + (sortert.length === 1 ? ' tittel' : ' titler') +
      ' · ' + tall(total) + ' lesere brutto';

    kvListe.textContent = '';
    sortert.forEach(function (t) {
      var li = document.createElement('li');
      var navnEl = document.createElement('span');
      var tallEl = document.createElement('span');
      navnEl.textContent = t.tittel;
      tallEl.textContent = tall(t.lesere);
      li.appendChild(navnEl);
      li.appendChild(tallEl);
      kvListe.appendChild(li);
    });

    var emne = 'Kanalplan: ' + navn.join(', ');
    var kropp = 'Hei,\n\nJeg vil gjerne vite mer om annonsering i disse titlene:\n\n' +
      sortert.map(function (t) { return '- ' + t.tittel + ' (' + tall(t.lesere) + ' lesere)'; }).join('\n') +
      '\n\nSum: ' + tall(total) + ' lesere (brutto).\n\nKontakt meg gjerne på telefon eller e-post.\n';

    kvMail.setAttribute(
      'href',
      'mailto:ad@ad-venture.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
    );
  }

  if (lagKnapp) {
    lagKnapp.addEventListener('click', function () {
      if (!valgt.length) {
        hintEl.textContent = ADVARSEL;
        hintEl.classList.add('is-warn');
        return;
      }

      byggKvittering();
      if (kvittering) {
        kvittering.removeAttribute('hidden');
        kvittering.focus({ preventScroll: true });
        kvittering.scrollIntoView({
          behavior: hjemsok.matches ? 'auto' : 'smooth',
          block: 'nearest'
        });
      }
    });
  }

  if (nullKnapp) nullKnapp.addEventListener('click', reset);

  if (kvLukk) {
    kvLukk.addEventListener('click', function () {
      kvittering.setAttribute('hidden', '');
      if (lagKnapp) lagKnapp.focus();
    });
  }

  oppdater();
})();
