/* Amesto — demo. Alt kjører lokalt i nettleseren; ingenting sendes. */
(function () {
  'use strict';

  /* ------------------------------------------------------------- meny */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Åpne meny' : 'Lukk meny');
      if (open) {
        nav.setAttribute('hidden', '');
      } else {
        nav.removeAttribute('hidden');
      }
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne meny');
      }
    });
  }

  /* ------------------------------------------------------------ årstall */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------- innlastingseffekt */

  document.documentElement.classList.add('js');

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------- behovsavklaringen */

  var form = document.getElementById('behovForm');
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll('[data-panel]'));
  var dots = Array.prototype.slice.call(form.querySelectorAll('.wiz__dot'));
  var nextBtn = form.querySelector('[data-next]');
  var submitBtn = form.querySelector('[data-submit]');
  var backBtn = form.querySelector('[data-back]');
  var feilEl = document.getElementById('wizFeil');
  var statusEl = document.getElementById('wizStatus');
  var kvittering = form.querySelector('[data-panel="3"]');
  var steg = 1;
  var maksSteg = 2;

  function visSteg(n) {
    steg = n;
    panels.forEach(function (panel) {
      var tall = Number(panel.getAttribute('data-panel'));
      if (tall === n) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    dots.forEach(function (dot) {
      var tall = Number(dot.getAttribute('data-dot'));
      dot.classList.toggle('is-active', tall === n);
      dot.classList.toggle('is-done', tall < n);
    });

    nextBtn.hidden = n !== 1;
    submitBtn.hidden = n !== 2;
    backBtn.hidden = n === 1 || n === 3;
    feilEl.textContent = '';

    if (statusEl) {
      statusEl.textContent = n === 3 ? 'Oppsummeringen er klar.' : 'Steg ' + n + ' av 2.';
    }

    var fokus = form.querySelector('[data-panel="' + n + '"] input, [data-panel="' + n + '"] select');
    if (fokus && n !== 3) {
      window.requestAnimationFrame(function () { fokus.focus({ preventScroll: true }); });
    }
  }

  function valgteOmrader() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="omrade"]:checked'))
      .map(function (el) { return el.value; });
  }

  function visFeil(melding) {
    feilEl.textContent = melding;
    if (statusEl) statusEl.textContent = melding;
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function lagKvittering() {
    var omrader = valgteOmrader();
    var land = form.elements.land.value;
    var system = form.elements.system.value;
    var navn = form.elements.navn.value.trim();
    var firma = form.elements.firma.value.trim();
    var epost = form.elements.epost.value.trim();
    var telefon = form.elements.telefon.value.trim();

    var kontakt = navn + (firma ? ', ' + firma : '') + ' — ' + epost + (telefon ? ', ' + telefon : '');

    kvittering.querySelector('[data-out="omrade"]').textContent = omrader.join(', ');
    kvittering.querySelector('[data-out="land"]').textContent = land;
    kvittering.querySelector('[data-out="system"]').textContent = system;
    kvittering.querySelector('[data-out="kontakt"]').textContent = kontakt;

    return [
      'Behovsavklaring — Amesto',
      'Områder: ' + omrader.join(', '),
      'Land: ' + land,
      'System: ' + system,
      'Kontakt: ' + kontakt
    ].join('\n');
  }

  nextBtn.addEventListener('click', function () {
    if (steg !== 1) return;
    if (valgteOmrader().length === 0) {
      visFeil('Velg minst ett område før du går videre.');
      return;
    }
    visSteg(2);
  });

  backBtn.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (steg !== 2) return;

    var navn = form.elements.navn.value.trim();
    var epost = form.elements.epost.value.trim();

    if (!navn) {
      visFeil('Skriv inn navnet ditt.');
      form.elements.navn.focus();
      return;
    }
    if (!gyldigEpost(epost)) {
      visFeil('Skriv inn en gyldig e-postadresse.');
      form.elements.epost.focus();
      return;
    }

    lagKvittering();
    visSteg(3);
  });

  var kopierBtn = form.querySelector('[data-kopier]');
  var kopiStatus = form.querySelector('[data-kopistatus]');

  function kopierTekst(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst);
    }
    return new Promise(function (resolve, reject) {
      var hjelp = document.createElement('textarea');
      hjelp.value = tekst;
      hjelp.setAttribute('readonly', '');
      hjelp.style.position = 'fixed';
      hjelp.style.opacity = '0';
      document.body.appendChild(hjelp);
      hjelp.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(hjelp);
      if (ok) { resolve(); } else { reject(new Error('Kopiering ikke støttet')); }
    });
  }

  if (kopierBtn) {
    kopierBtn.addEventListener('click', function () {
      var tekst = lagKvittering();
      kopierTekst(tekst).then(function () {
        if (kopiStatus) kopiStatus.textContent = 'Oppsummeringen er kopiert. Lim den inn i e-posten eller samtalen.';
      }).catch(function () {
        if (kopiStatus) kopiStatus.textContent = 'Nettleseren stoppet kopieringen. Merk teksten i oppsummeringen og kopier manuelt.';
      });
    });
  }

  var omstart = form.querySelector('[data-omstart]');
  if (omstart) {
    omstart.addEventListener('click', function () {
      form.reset();
      if (kopiStatus) kopiStatus.textContent = '';
      visSteg(1);
    });
  }

  visSteg(1);
})();
