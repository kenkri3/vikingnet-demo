/* ALLTEC — målermeny, energiflyt-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.seg'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  var ramme = document.querySelector('.energi-ramme');
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
      // sol
      var sx = W * 0.16, sy = H * 0.24, sr = Math.min(W, H) * 0.09;
      var g = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 1.8);
      g.addColorStop(0, 'rgba(217,161,59,.55)');
      g.addColorStop(1, 'rgba(217,161,59,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#d9a13b'; ctx.fill();
      // solstrålar
      ctx.strokeStyle = 'rgba(217,161,59,.5)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < 8; i++) {
        var a = (i / 8) * Math.PI * 2 + t * 0.004;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * sr * 0.8, sy + Math.sin(a) * sr * 0.8);
        ctx.lineTo(sx + Math.cos(a) * sr * 1.35, sy + Math.sin(a) * sr * 1.35);
        ctx.stroke();
      }
      // solcellepanel
      var px = W * 0.44, py = H * 0.62, pw = W * 0.2, ph = H * 0.16;
      ctx.fillStyle = 'rgba(25,53,41,.85)';
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px + pw, py - ph * 0.3);
      ctx.lineTo(px + pw, py + ph * 0.7); ctx.lineTo(px, py + ph);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(121,194,87,.65)'; ctx.lineWidth = 1;
      for (var r = 1; r < 4; r++) {
        ctx.beginPath();
        ctx.moveTo(px + (pw * r) / 4, py + ph * 0.25 - (ph * 0.3 * r) / 4);
        ctx.lineTo(px + (pw * r) / 4, py + ph * 0.75 - (ph * 0.3 * r) / 4);
        ctx.stroke();
      }
      // straum til nett
      var gx = W * 0.82, gy = H * 0.5;
      ctx.strokeStyle = 'rgba(121,194,87,.6)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px + pw, py + ph * 0.3);
      ctx.quadraticCurveTo(W * 0.66, py - H * 0.1, gx, gy);
      ctx.stroke();
      // straumprikkar
      for (var k = 0; k < 4; k++) {
        var f = ((t * 0.006 + k * 0.25) % 1);
        var bx = px + pw + (gx - px - pw) * f;
        var by = (py + ph * 0.3) + (gy - py - ph * 0.3) * f - Math.sin(f * Math.PI) * H * 0.12;
        ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(121,194,87,.95)'; ctx.fill();
      }
      // nett-symbol
      ctx.strokeStyle = 'rgba(16,36,28,.5)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(gx, gy, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx, gy - 16); ctx.lineTo(gx, gy - 9); ctx.stroke();
      ctx.fillStyle = 'rgba(16,36,28,.55)';
      ctx.font = '10px K2D, sans-serif';
      ctx.fillText('nett', gx - 11, gy + 26);
      ctx.fillText('sol', sx - 9, sy + sr * 1.9);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppdraget er merkt fullført.';
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
