/* GEXCON — risikomatrise, dispersjon-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.celle'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- dispersjon: konsentriske konturar og partiklar ---------- */
  var ramme = document.querySelector('.disp-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var partiklar = [];
    for (var i = 0; i < 60; i++) partiklar.push({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.2 + Math.random() * 0.7 });
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.26, cy = H * 0.62;
      var maks = Math.min(W, H) * 0.52;
      // gitter
      ctx.strokeStyle = 'rgba(232,236,241,.06)'; ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 30) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      // konturar (pulsar utover frå kjelda)
      for (var k = 0; k < 6; k++) {
        var f = ((t * 0.006 + k / 6) % 1);
        var r = maks * f;
        var alfa = (1 - f) * 0.55;
        ctx.beginPath();
        ctx.ellipse(cx + maks * f * 0.55, cy - maks * f * 0.16, r, r * 0.6, -0.16, 0, Math.PI * 2);
        ctx.strokeStyle = k < 3 ? 'rgba(67,170,139,' + alfa.toFixed(3) + ')' : 'rgba(209,73,91,' + alfa.toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      // partiklar som driv med vinden
      for (var p = 0; p < partiklar.length; p++) {
        var pt = partiklar[p];
        var rr = (pt.r + t * 0.0012 * pt.s) % 1;
        var x = cx + Math.cos(pt.a) * maks * rr * 1.5 + maks * rr * 0.5;
        var y = cy + Math.sin(pt.a) * maks * rr * 0.75 - maks * rr * 0.12;
        var a2 = Math.max(0, 0.5 - rr * 0.5);
        ctx.beginPath(); ctx.arc(x, y, 1.2 + (1 - rr) * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,236,241,' + a2.toFixed(3) + ')';
        ctx.fill();
      }
      // kjelde
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = '#d1495b'; ctx.fill();
      ctx.strokeStyle = 'rgba(209,73,91,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 9 + Math.sin(t * 0.08) * 3, 0, Math.PI * 2); ctx.stroke();
      // aksar/etikett
      ctx.fillStyle = 'rgba(232,236,241,.45)';
      ctx.font = '10px Arimo, sans-serif';
      ctx.fillText('kjelde', cx - 14, cy + 26);
      ctx.fillText('konsentrasjon ↓', W - 128, H - 12);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' leveransar ferdige';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Levert'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Levert';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Leveransen er merkt ferdig.';
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
