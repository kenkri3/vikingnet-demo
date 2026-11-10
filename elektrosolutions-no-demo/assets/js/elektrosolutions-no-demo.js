/* ELEKTRO SOLUTIONS — ramme, straumkrets, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.ramme a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  var ramme = document.querySelector('.krets-ramme');
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
      // rutenett
      ctx.strokeStyle = 'rgba(247,246,244,.05)'; ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 28) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 28) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      // krets: horisontale og vertikale spor med nodar
      var y1 = H * 0.3, y2 = H * 0.66;
      ctx.strokeStyle = 'rgba(242,160,60,.55)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, y1); ctx.lineTo(W * 0.36, y1); ctx.lineTo(W * 0.36, y2);
      ctx.lineTo(W * 0.62, y2); ctx.lineTo(W * 0.62, y1); ctx.lineTo(W * 0.92, y1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(31,95,139,.6)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, y2); ctx.lineTo(W * 0.2, y2); ctx.lineTo(W * 0.2, y1);
      ctx.lineTo(W * 0.5, y1); ctx.lineTo(W * 0.5, y2); ctx.lineTo(W * 0.78, y2);
      ctx.stroke();
      // nodar
      var nodar = [[0.05,y1],[0.36,y1],[0.36,y2],[0.62,y2],[0.62,y1],[0.92,y1],[0.2,y1],[0.5,y1],[0.78,y2]];
      nodar.forEach(function (n, i) {
        var x = n[0] * W, y = n[1];
        ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? '#f2a03c' : '#1f5f8b'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(247,246,244,.22)'; ctx.lineWidth = 1; ctx.stroke();
      });
      // pulsar som går langs sporet
      for (var k = 0; k < 5; k++) {
        var f = ((t * 0.005 + k * 0.2) % 1);
        var px, py;
        if (f < 0.4) { px = W * 0.05 + (W * 0.31) * (f / 0.4); py = y1; }
        else if (f < 0.5) { px = W * 0.36; py = y1 + (y2 - y1) * ((f - 0.4) / 0.1); }
        else if (f < 0.8) { px = W * 0.36 + (W * 0.26) * ((f - 0.5) / 0.3); py = y2; }
        else { px = W * 0.62; py = y2 + (y1 - y2) * ((f - 0.8) / 0.2); }
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242,160,60,.95)'; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242,160,60,.14)'; ctx.fill();
      }
      ctx.fillStyle = 'rgba(247,246,244,.45)';
      ctx.font = '10px "Red Hat Text", sans-serif';
      ctx.fillText('230 V', W * 0.04, y1 - 10);
      ctx.fillText('400 V', W * 0.04, y2 - 10);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' jobbar fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Jobben er merkt fullført.';
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
