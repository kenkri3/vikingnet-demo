/*!
 * Akershus Murforretning AS — demo.
 * Alt kjører i nettleseren: meny, scroll-avsløring og prosjektbriefen.
 * Ingenting sendes, ingenting lagres.
 */
(function () {
  'use strict';

  /* ---- Årstall ---------------------------------------------------- */
  var aar = document.querySelector('[data-year]');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---- Mobilmeny --------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hovednav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Scroll-avsløring -------------------------------------------- */
  var avslor = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(avslor, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(avslor, function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Prosjektbrief ---------------------------------------------- */
  var skjema = document.getElementById('brief-skjema');
  var kort = document.getElementById('kvittering');
  if (!skjema || !kort) return;

  var steg = Array.prototype.slice.call(skjema.querySelectorAll('.bstep'));
  var segmenter = skjema.querySelectorAll('.briefbar__seg');
  var neste = skjema.querySelector('[data-next]');
  var tilbake = skjema.querySelector('[data-back]');
  var send = skjema.querySelector('[data-send]');
  var chips = skjema.querySelectorAll('.chip');
  var statusEl = kort.querySelector('[data-status]');
  var sammendrag = kort.querySelector('[data-sammendrag]');
  var mailto = kort.querySelector('[data-mailto]');
  var aktivt = 1;

  function rolig() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function vis(n) {
    aktivt = n;
    steg.forEach(function (s) {
      s.hidden = Number(s.getAttribute('data-step')) !== n;
    });
    Array.prototype.forEach.call(segmenter, function (seg, i) {
      seg.classList.toggle('is-on', i < n);
    });
    tilbake.hidden = n === 1;
    neste.hidden = n === 3;
    send.hidden = n !== 3;
  }

  function valgte() {
    return Array.prototype.filter.call(chips, function (c) {
      return c.getAttribute('aria-pressed') === 'true';
    }).map(function (c) {
      return c.getAttribute('data-val');
    });
  }

  function feil(n, visFeil) {
    var el = skjema.querySelector('[data-feil="' + n + '"]');
    if (el) el.hidden = !visFeil;
  }

  function fokuser() {
    var el = steg[aktivt - 1].querySelector('input, select, textarea, button');
    if (el) {
      try { el.focus({ preventScroll: true }); } catch (error) { el.focus(); }
    }
  }

  function status(tekst) {
    if (statusEl) statusEl.textContent = tekst;
  }

  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      var trykket = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', trykket ? 'false' : 'true');
      feil(1, false);
    });
  });

  neste.addEventListener('click', function () {
    if (aktivt === 1 && valgte().length === 0) {
      feil(1, true);
      return;
    }
    feil(1, false);
    vis(Math.min(3, aktivt + 1));
    fokuser();
  });

  tilbake.addEventListener('click', function () {
    vis(Math.max(1, aktivt - 1));
    status('');
  });

  function felt(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();

    var navn = felt('navn');
    var telefon = felt('telefon');
    var epost = felt('epost');

    if (!navn || (!telefon && !epost)) {
      feil(3, true);
      return;
    }
    feil(3, false);

    var arbeid = valgte();
    var areal = felt('areal');
    var rader = [
      ['Arbeid', arbeid.join(', ')],
      ['Type oppdrag', felt('omfang') || 'Ikke valgt'],
      ['Areal', areal ? areal + ' m²' : 'Ikke oppgitt'],
      ['Ønsket oppstart', felt('oppstart')],
      ['Sted', felt('sted') || 'Ikke oppgitt'],
      ['Navn', navn],
      ['Telefon', telefon || 'Ikke oppgitt'],
      ['E-post', epost || 'Ikke oppgitt']
    ];

    if (felt('melding')) rader.push(['Merknad', felt('melding')]);

    var ref = 'AM-' + String(1000 + (Date.now() % 9000));

    sammendrag.innerHTML = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      sammendrag.appendChild(dt);
      sammendrag.appendChild(dd);
    });

    var tekst = 'Prosjektbrief ' + ref + '\n\n' + rader.map(function (rad) {
      return rad[0] + ': ' + rad[1];
    }).join('\n');

    kort.querySelector('[data-ref]').textContent = ref;
    kort.setAttribute('data-tekst', tekst);
    mailto.href = 'mailto:trond@akershusmur.no'
      + '?subject=' + encodeURIComponent('Prosjektbrief ' + ref)
      + '&body=' + encodeURIComponent(tekst);

    status('');
    skjema.hidden = true;
    kort.hidden = false;
    kort.scrollIntoView({ behavior: rolig() ? 'auto' : 'smooth', block: 'center' });
  });

  /* Kvittering: kopier, eller start på nytt */
  var kopier = kort.querySelector('[data-kopier]');
  var nytt = kort.querySelector('[data-ny]');

  if (kopier) {
    kopier.addEventListener('click', function () {
      var tekst = kort.getAttribute('data-tekst') || '';

      function fallback() {
        var hjelp = document.createElement('textarea');
        hjelp.value = tekst;
        hjelp.setAttribute('readonly', 'readonly');
        hjelp.style.position = 'fixed';
        hjelp.style.top = '-200px';
        document.body.appendChild(hjelp);
        hjelp.select();
        try {
          document.execCommand('copy');
          status('Sammendraget er kopiert.');
        } catch (error) {
          status('Kunne ikke kopiere automatisk. Merk teksten og kopier selv.');
        }
        document.body.removeChild(hjelp);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          status('Sammendraget er kopiert.');
        }, fallback);
      } else {
        fallback();
      }
    });
  }

  if (nytt) {
    nytt.addEventListener('click', function () {
      skjema.reset();
      Array.prototype.forEach.call(chips, function (chip) {
        chip.setAttribute('aria-pressed', 'false');
      });
      sammendrag.innerHTML = '';
      kort.setAttribute('data-tekst', '');
      kort.hidden = true;
      skjema.hidden = false;
      vis(1);
      status('');
      skjema.scrollIntoView({ behavior: rolig() ? 'auto' : 'smooth', block: 'center' });
    });
  }

  vis(1);
})();
