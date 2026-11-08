/* BISLET SNEKKER — rullegardin-akkordeon og 3D-reising */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- rullegardin med akkordeon ---------- */
  var knapp = document.querySelector('.gardin-knapp');
  var gardin = document.querySelector('.gardin');
  function setGardin(opne) {
    if (!gardin || !knapp) return;
    gardin.classList.toggle('open', opne);
    knapp.setAttribute('aria-expanded', opne ? 'true' : 'false');
    if (opne) {
      var forste = gardin.querySelector('.gardin__hovud');
      if (forste) forste.focus({ preventScroll: true });
    }
  }
  if (knapp && gardin) {
    knapp.setAttribute('aria-expanded', 'false');
    knapp.addEventListener('click', function () {
      setGardin(!gardin.classList.contains('open'));
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') setGardin(false);
    });
    document.addEventListener('click', function (ev) {
      if (!gardin.classList.contains('open')) return;
      if (gardin.contains(ev.target) || knapp.contains(ev.target)) return;
      setGardin(false);
    });
    // akkordeon inne i gardenet
    Array.prototype.forEach.call(gardin.querySelectorAll('.gardin__hovud'), function (h) {
      h.setAttribute('aria-expanded', 'false');
      h.addEventListener('click', function () {
        var rad = h.closest('.gardin__rad');
        var opne = !rad.classList.contains('open');
        Array.prototype.forEach.call(gardin.querySelectorAll('.gardin__rad'), function (r) { r.classList.remove('open'); });
        Array.prototype.forEach.call(gardin.querySelectorAll('.gardin__hovud'), function (x) { x.setAttribute('aria-expanded', 'false'); });
        if (opne) { rad.classList.add('open'); h.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* marker gjeldande side */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.gardin__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- 3D-reising som set seg saman ved scroll ---------- */
  var ramme = document.querySelector('.reising');
  var bjelkar = ramme ? ramme.querySelectorAll('.bjelke') : [];
  if (ramme && bjelkar.length) {
    var setSam = function () {
      var r = ramme.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      // 0 når seksjonen kjem inn nedanfrå, 1 når han er godt inne i bildet
      var p = (vh - r.top) / (vh * 0.75);
      p = Math.max(0, Math.min(1, p));
      Array.prototype.forEach.call(bjelkar, function (b) {
        var d = parseFloat(b.getAttribute('data-d')) || 0;
        var q = Math.max(0, Math.min(1, (p - d * 0.35) / 0.65));
        // lett overdriven easing så det kjennest som det fell på plass
        q = q * q * (3 - 2 * q);
        // start på 45 %: konstruksjonen skal lesast som ei ramme også før ein scrollar
        q = 0.45 + q * 0.55;
        b.style.setProperty('--q', q.toFixed(3));
      });
    };
    if (redusert.matches) {
      Array.prototype.forEach.call(bjelkar, function (b) { b.style.setProperty('--q', '1'); });
    } else {
      var vent = false;
      var oppdater = function () {
        if (vent) return;
        vent = true;
        window.requestAnimationFrame(function () { setSam(); vent = false; });
      };
      window.addEventListener('scroll', oppdater, { passive: true });
      window.addEventListener('resize', oppdater);
      setSam();
    }
  }

  /* ---------- panel ---------- */
  var faner = document.querySelectorAll('.fane');
  if (faner.length) {
    Array.prototype.forEach.call(faner, function (fane) {
      fane.addEventListener('click', function () {
        Array.prototype.forEach.call(faner, function (f) {
          var vald = f === fane;
          f.setAttribute('aria-selected', vald ? 'true' : 'false');
          var mal = document.getElementById(f.getAttribute('aria-controls'));
          if (mal) mal.hidden = !vald;
        });
      });
    });
  }
  function telOpp() {
    var ventar = document.querySelectorAll('.rad[data-status="ventar"]').length;
    var ferdige = document.querySelectorAll('.rad[data-status="ferdig"]').length;
    var kV = document.querySelector('[data-kpi="ventar"] .kpi__tal');
    var kF = document.querySelector('[data-kpi="ferdig"] .kpi__tal');
    if (kV) kV.textContent = ventar;
    if (kF) kF.textContent = ferdige;
    var fram = document.querySelector('[data-framdrift]');
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag fullført';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Oppdraget er merket ferdig og loggført.';
      telOpp();
    });
  });
  telOpp();

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (skjema) {
    var kvit = skjema.parentNode.querySelector('.skjema__kvittering');
    var feil = skjema.querySelector('.skjema__feil');
    skjema.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var navn = skjema.querySelector('[name="navn"]');
      var epost = skjema.querySelector('[name="epost"]');
      var melding = '';
      if (navn && !navn.value.trim()) melding = 'Fyll inn namnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var t = kvit.querySelector('[data-kvittering-namn]');
        if (t) t.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
