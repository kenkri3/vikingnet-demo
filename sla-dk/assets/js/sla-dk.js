/* SLA — prikkindeks, vekst-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.plenk'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- vekst: linjer som veks oppover ---------- */
  var ramme = document.querySelector('.vekst-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, fram = 0;
    var plantar = [];
    function lag() {
      plantar = [];
      var n = Math.max(9, Math.floor(W / 46));
      for (var i = 0; i < n; i++) {
        plantar.push({
          x: (i + 0.5) / n + (Math.random() - 0.5) * 0.05,
          h: 0.35 + Math.random() * 0.5,
          boy: (Math.random() - 0.5) * 26,
          kvist: 2 + Math.floor(Math.random() * 3),
          fart: 0.5 + Math.random() * 0.8
        });
      }
    }
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h; lag();
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // jordlinje
      ctx.strokeStyle = 'rgba(29,38,32,.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H - 26); ctx.lineTo(W, H - 26); ctx.stroke();
      // vekst
      for (var i = 0; i < plantar.length; i++) {
        var p = plantar[i];
        var vekst = Math.max(0, Math.min(1, (fram - i * 0.05) * p.fart));
        if (vekst <= 0) continue;
        var bx = p.x * W, by = H - 26;
        var toppY = by - p.h * H * 0.72 * vekst;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + p.boy * 0.4, (by + toppY) / 2, bx + p.boy * 0.6 * vekst, toppY);
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(184,128,79,.85)' : 'rgba(111,143,106,.9)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // blad/kvist
        for (var k = 0; k < p.kvist; k++) {
          var f = (k + 1) / (p.kvist + 1);
          var lx = bx + p.boy * 0.6 * vekst * f;
          var ly = by + (toppY - by) * f;
          var side = (k % 2 === 0 ? 1 : -1) * (5 + f * 4);
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + side, ly - 6 - f * 5);
          ctx.strokeStyle = 'rgba(111,143,106,.55)'; ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (fram < 1.9) fram += 0.008;
    }
    function rull() { teikn(); if (!red.matches && fram < 2) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { fram = 1.7; storleik(); teikn(); });
    if (red.matches) { fram = 1.9; teikn(); } else window.requestAnimationFrame(rull);
  }

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
    var framEl = document.querySelector('[data-framdrift]');
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' fasar fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Fasen er merkt ferdig.';
      telOpp();
    });
  });
  telOpp();

  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (s) {
    var kvit = s.parentNode.querySelector('.skjema__kvittering');
    var feil = s.querySelector('.skjema__feil');
    s.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = s.querySelector('[name="navn"]'), p = s.querySelector('[name="epost"]');
      var m = '';
      if (n && !n.value.trim()) m = 'Fyll inn navnet ditt.';
      else if (p && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.value.trim())) m = 'Fyll inn en gyldig e-postadresse.';
      if (feil) feil.textContent = m;
      if (m) { (n && !n.value.trim() ? n : p).focus(); return; }
      if (kvit) {
        var tt = kvit.querySelector('[data-kvittering-navn]');
        if (tt) tt.textContent = n && n.value.trim() ? 'Takk, ' + n.value.trim().split(' ')[0] + '!' : 'Takk!';
        s.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
