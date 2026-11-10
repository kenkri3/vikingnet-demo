/* CAPENSA — meny, kø, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.meny a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.ko-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var folk = [];
    for (var i = 0; i < 9; i++) folk.push({ x: 0.06 + i * 0.09, y: 0.72, f: i * 0.3 });
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // gulvlinje
      ctx.strokeStyle = 'rgba(245,246,247,.16)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H * 0.78); ctx.lineTo(W, H * 0.78); ctx.stroke();
      // port
      var px = W * 0.5, py = H * 0.78, pw = Math.min(W * 0.3, 120), ph = H * 0.34;
      ctx.strokeStyle = 'rgba(224,176,47,.75)'; ctx.lineWidth = 2;
      ctx.strokeRect(px - pw / 2, py - ph, pw, ph);
      ctx.fillStyle = 'rgba(224,176,47,.12)';
      ctx.fillRect(px - pw / 2, py - ph, pw, ph);
      // kø som går mot porten
      folk.forEach(function (p, idx) {
        var fram = (t * 0.004 + idx * 0.11) % 1;
        var x = W * (0.06 + fram * 0.42);
        var y = H * 0.78 - 8;
        // kropp
        ctx.beginPath(); ctx.arc(x, y - 13, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = idx % 3 === 0 ? 'rgba(224,176,47,.9)' : 'rgba(245,246,247,.75)'; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 9); ctx.lineTo(x, y); ctx.strokeStyle = 'rgba(245,246,247,.55)'; ctx.lineWidth = 2; ctx.stroke();
        if (x > px - pw / 2) {
          ctx.beginPath(); ctx.arc(x, y - 13, 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(224,176,47,.5)'; ctx.lineWidth = 1; ctx.stroke();
        }
      });
      ctx.fillStyle = 'rgba(245,246,247,.45)';
      ctx.font = '10px Trispace, sans-serif';
      ctx.fillText('kø · moglegheit', 8, H - 10);
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
      if (st) { st.textContent = 'Klar'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Klar';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Saka er merkt klar.';
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
