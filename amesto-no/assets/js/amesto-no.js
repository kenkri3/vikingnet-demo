/* AMESTO — datalinje, globus-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.linje a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- globus: prikkar på ein roterande kule ---------- */
  var ramme = document.querySelector('.globus-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, rot = 0;
    var prikkar = [];
    for (var la = -70; la <= 70; la += 14) {
      for (var lo = -180; lo < 180; lo += 14) prikkar.push({ la: la, lo: lo });
    }
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var r = Math.min(W, H) * 0.36, cx = W / 2, cy = H / 2;
      // atmosfære
      var g = ctx.createRadialGradient(cx - r * .3, cy - r * .3, r * .2, cx, cy, r * 1.25);
      g.addColorStop(0, 'rgba(47,111,178,.28)'); g.addColorStop(1, 'rgba(11,21,38,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2); ctx.fill();
      // meridianring
      ctx.strokeStyle = 'rgba(244,246,249,.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      var rad = Math.PI / 180;
      for (var i = 0; i < prikkar.length; i++) {
        var p = prikkar[i];
        var laRad = p.la * rad, loRad = (p.lo + rot) * rad;
        var x = Math.cos(laRad) * Math.sin(loRad);
        var y = Math.sin(laRad);
        var z = Math.cos(laRad) * Math.cos(loRad);
        if (z < 0) continue;
        var alfa = 0.18 + z * 0.55;
        ctx.fillStyle = 'rgba(232,84,43,' + (alfa * 0.9).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(cx + x * r, cy + y * r, 1.4 + z * 1.1, 0, Math.PI * 2); ctx.fill();
      }
      // puls-punkt
      var py = ((Date.now() / 40) % 100) / 100;
      ctx.strokeStyle = 'rgba(127,178,230,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, r * (0.3 + py * 0.7), r * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
      rot += 0.18;
    }
    function rull() { teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { storleik(); teikn(); });
    if (red.matches) teikn(); else window.requestAnimationFrame(rull);
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppgåver fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppgåva er merkt fullført.';
      telOpp();
    });
  });
  telOpp();

  /* ---------- skjema ---------- */
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
