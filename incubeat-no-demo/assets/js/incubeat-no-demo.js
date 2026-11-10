/* INCUBEAT — meny, orbital, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.stripe a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var knapp = document.querySelector('.menyknapp');
  var stripe = document.querySelector('.stripe');
  if (knapp && stripe) {
    knapp.addEventListener('click', function () {
      var open = stripe.classList.toggle('open');
      knapp.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var ramme = document.querySelector('.orb-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var partiklar = [];
    for (var i = 0; i < 14; i++) partiklar.push({ a: (i / 14) * Math.PI * 2, r: 0.3 + Math.random() * 0.22, s: 0.2 + Math.random() * 0.5, st: Math.random() * 6 });
    var ut = [];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.42, cy = H * 0.5, R = Math.min(W, H) * 0.34;
      // baner
      for (var b = 1; b <= 3; b++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (0.45 * b), R * (0.28 * b), -0.22, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(247,245,242,' + (0.14 - b * 0.02) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }
      // kjerne
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#e0643c'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 18 + Math.sin(t * 0.03) * 2.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224,100,60,.35)'; ctx.lineWidth = 1; ctx.stroke();
      // partiklar i bane
      partiklar.forEach(function (p, idx) {
        var ang = p.a + t * 0.006 * (idx % 2 ? 1 : -1) * p.s;
        var rx = R * 0.95, ry = R * 0.62;
        var x = cx + Math.cos(ang) * rx * 0.7;
        var y = cy + Math.sin(ang) * ry * 0.7;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 3 === 0 ? 'rgba(47,111,94,.9)' : 'rgba(247,245,242,.6)'; ctx.fill();
        // nokre forlet banen
        if (idx % 5 === 0 && Math.sin(t * 0.01 + idx) > 0.92) {
          var f = (Math.sin(t * 0.01 + idx) - 0.92) / 0.08;
          ctx.beginPath(); ctx.arc(x + f * 40, y - f * 26, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(224,100,60,.85)'; ctx.fill();
        }
      });
      ctx.fillStyle = 'rgba(247,245,242,.42)';
      ctx.font = '10px "Spline Sans Mono", monospace';
      ctx.fillText('idé → realisering', 10, H - 12);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' saker klare';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Saka er merkt ferdig.';
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
