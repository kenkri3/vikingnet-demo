/* DEDICA — meny, signal, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.meny a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.sig-ramme');
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
      var mid = H * 0.5;
      // midtlinje
      ctx.strokeStyle = 'rgba(247,246,242,.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      // tre signallinjer med ulik frekvens
      for (var k = 0; k < 3; k++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 4) {
          var amp = H * (0.16 - k * 0.04);
          var y = mid + Math.sin((x * 0.02) + t * 0.03 + k * 1.4) * amp
                       + Math.sin((x * 0.007) - t * 0.012 + k) * amp * 0.5;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = k === 0 ? 'rgba(217,164,65,.9)' : k === 1 ? 'rgba(111,143,74,.75)' : 'rgba(247,246,242,.35)';
        ctx.lineWidth = k === 0 ? 2 : 1.4; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(247,246,242,.45)';
      ctx.font = '10px Khand, sans-serif';
      ctx.fillText('signal · kommunikasjon', 8, H - 10);
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
