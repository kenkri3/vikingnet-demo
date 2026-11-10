/* AQUASTRUCTURES — stripe, nøter, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.sitemap a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.not-ramme');
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
      var hav = H * 0.52;
      // bølgjer
      for (var b = 0; b < 3; b++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 6) {
          var y = hav + b * 9 + Math.sin((x * 0.012) + t * 0.02 + b) * (5 - b);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(63,169,160,' + (0.5 - b * 0.12) + ')';
        ctx.lineWidth = 1.4; ctx.stroke();
      }
      // flytande ring (nøter)
      var cx = W * 0.5, cy = hav - H * 0.1, rx = Math.min(W * 0.3, 130), ry = rx * 0.34;
      ctx.strokeStyle = 'rgba(242,246,247,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      // nøter
      ctx.strokeStyle = 'rgba(242,246,247,.22)'; ctx.lineWidth = 0.8;
      for (var i = -6; i <= 6; i++) {
        var dx = (rx / 6) * i;
        ctx.beginPath();
        ctx.moveTo(cx + dx, cy - ry * Math.sqrt(Math.max(0, 1 - (dx / rx) * (dx / rx))));
        ctx.lineTo(cx + dx, cy + ry * Math.sqrt(Math.max(0, 1 - (dx / rx) * (dx / rx))));
        ctx.stroke();
      }
      // forankringsliner
      var anker = [[cx - rx, cy], [cx + rx, cy], [cx, cy + ry]];
      anker.forEach(function (p, i) {
        ctx.strokeStyle = 'rgba(240,160,60,.55)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[0] + (i === 0 ? -W * 0.1 : i === 1 ? W * 0.1 : 0), hav + H * 0.2);
        ctx.stroke();
      });
      // bøye
      ctx.beginPath(); ctx.arc(cx, cy - ry - 6, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,160,60,.9)'; ctx.fill();
      ctx.fillStyle = 'rgba(242,246,247,.45)';
      ctx.font = '10px Scada, sans-serif';
      ctx.fillText('fortøyning', 10, H - 12);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' analysar ferdige';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Analysen er merkt ferdig.';
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
