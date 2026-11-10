/* BUBE — meny, sjø, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.meny a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.sjo-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var hav = H * 0.62;
      // himmelgradient
      var g = ctx.createLinearGradient(0, 0, 0, hav);
      g.addColorStop(0, 'rgba(22,48,63,.9)');
      g.addColorStop(1, 'rgba(8,22,31,.2)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, hav);
      // bølgjer
      for (var b = 0; b < 4; b++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 5) {
          var y = hav + b * 11 + Math.sin(x * 0.011 + t * 0.02 + b) * (6 - b);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(44,140,148,' + (0.55 - b * 0.11) + ')';
        ctx.lineWidth = 1.5; ctx.stroke();
      }
      // fartøy som passerer
      var fx = ((t * 0.7) % (W + 220)) - 110;
      var fy = hav - 16;
      ctx.fillStyle = 'rgba(242,245,246,.9)';
      ctx.beginPath();
      ctx.moveTo(fx - 34, fy);
      ctx.lineTo(fx + 26, fy);
      ctx.lineTo(fx + 18, fy + 10);
      ctx.lineTo(fx - 26, fy + 10);
      ctx.closePath(); ctx.fill();
      // overbygging
      ctx.fillRect(fx - 12, fy - 16, 22, 16);
      ctx.fillRect(fx - 2, fy - 26, 7, 10);
      // lanterne
      ctx.beginPath(); ctx.arc(fx + 2, fy - 28, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232,134,60,.95)'; ctx.fill();
      // kjølvatn
      ctx.strokeStyle = 'rgba(242,245,246,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fx - 40, fy + 12); ctx.lineTo(fx - 80, fy + 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 26, fy + 12); ctx.lineTo(fx + 62, fy + 14); ctx.stroke();
      ctx.fillStyle = 'rgba(242,245,246,.42)';
      ctx.font = '10px Gantari, sans-serif';
      ctx.fillText('bogserbåt · kjølvatn', 8, H - 10);
      t += 1;
    }
    function rull() { teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { storleik(); teikn(); });
    if (red.matches) teikn(); else window.requestAnimationFrame(rull);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag ferdige';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppdraget er merkt ferdig.';
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
