/* ENERGIMA — meny, luftstrøm, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.meny a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.luft-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0, partiklar = [];
    for (var i = 0; i < 26; i++) partiklar.push({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random() * 0.7 });
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // bygg: to rom + ventilasjonskanal
      var x0 = W * 0.1, y0 = H * 0.2, x1 = W * 0.9, y1 = H * 0.82;
      ctx.strokeStyle = 'rgba(244,247,244,.35)'; ctx.lineWidth = 1.6;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.beginPath(); ctx.moveTo(W * 0.5, y0); ctx.lineTo(W * 0.5, y1); ctx.stroke();
      // kanal øvst
      ctx.strokeStyle = 'rgba(127,176,105,.6)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x0 + 12, y0 - 12); ctx.lineTo(x1 - 12, y0 - 12); ctx.stroke();
      ctx.fillStyle = 'rgba(127,176,105,.6)';
      ctx.fillRect(W * 0.28, y0 - 16, 8, 8); ctx.fillRect(W * 0.62, y0 - 16, 8, 8);
      // luftpartiklar som går inn i romma
      partiklar.forEach(function (p, idx) {
        p.x += 0.0016 * p.s;
        p.y += Math.sin(t * 0.01 + idx) * 0.0008;
        if (p.x > 1) p.x = 0;
        var px = x0 + p.x * (x1 - x0);
        var rom = px < W * 0.5 ? 0 : 1;
        var py = rom === 0 ? y0 + 18 + p.y * (H * 0.2) : y0 + 18 + p.y * (H * 0.28);
        ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 4 === 0 ? 'rgba(224,163,60,.75)' : 'rgba(244,247,244,.4)'; ctx.fill();
      });
      // temperaturmerke
      ctx.fillStyle = 'rgba(244,247,244,.45)';
      ctx.font = '10px Sintony, sans-serif';
      ctx.fillText('inneluft', x0 + 8, y1 - 8);
      ctx.fillText('avtrekk', W * 0.54, y1 - 8);
      ctx.fillText('kanal', x0 + 8, y0 - 20);
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
