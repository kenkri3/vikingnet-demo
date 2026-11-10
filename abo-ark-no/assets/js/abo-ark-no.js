/* ABO — målestokk, plantegning som teiknar seg, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.linj'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  var ramme = document.querySelector('.plan-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, fram = 0;
    // enkel plantegning: yttervegg, indre vegger, dører, møblar
    var linjer = [
      [[0.08,0.14],[0.62,0.14]], [[0.62,0.14],[0.62,0.52]], [[0.62,0.52],[0.92,0.52]],
      [[0.92,0.52],[0.92,0.86]], [[0.92,0.86],[0.08,0.86]], [[0.08,0.86],[0.08,0.14]],
      [[0.34,0.14],[0.34,0.44]], [[0.34,0.44],[0.62,0.44]],
      [[0.08,0.5],[0.34,0.5]], [[0.34,0.5],[0.34,0.86]]
    ];
    var mobler = [
      [0.13,0.2,0.8,0.5],[0.68,0.58,1.9,0.9],[0.42,0.56,1.4,1.2]
    ];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // rutenett (millimeterpapir)
      ctx.strokeStyle = 'rgba(79,109,120,.13)'; ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 14) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 14) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      var tot = 0, i;
      for (i = 0; i < linjer.length; i++) tot++;
      var synleg = Math.max(0, Math.min(linjer.length, Math.floor(fram)));
      ctx.strokeStyle = '#2f4e56'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (i = 0; i < synleg; i++) {
        var l = linjer[i];
        ctx.beginPath();
        ctx.moveTo(l[0][0] * W, l[0][1] * H);
        ctx.lineTo(l[1][0] * W, l[1][1] * H);
        ctx.stroke();
      }
      // møblar (mjukare)
      if (fram > 8) {
        ctx.strokeStyle = 'rgba(138,106,74,.55)'; ctx.lineWidth = 1.4;
        for (i = 0; i < mobler.length; i++) {
          var m = mobler[i];
          ctx.strokeRect(m[0] * W, m[1] * H, m[2] * W * 0.22, m[3] * H * 0.18);
        }
      }
      // målestokk
      if (fram > 10) {
        ctx.strokeStyle = 'rgba(35,32,25,.5)'; ctx.lineWidth = 1;
        var mx = W - 90, my = H - 18;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 60, my); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx, my - 4); ctx.lineTo(mx, my + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx + 60, my - 4); ctx.lineTo(mx + 60, my + 4); ctx.stroke();
        ctx.fillStyle = 'rgba(35,32,25,.55)';
        ctx.font = '9px "Bai Jamjuree", sans-serif';
        ctx.fillText('0      5 m', mx + 6, my - 8);
      }
      if (fram < 12) fram += 0.14;
    }
    function rull() { teikn(); if (!red.matches && fram < 12.2) window.requestAnimationFrame(rull); }
    storleik();
    window.addEventListener('resize', function () { fram = 11; storleik(); teikn(); });
    if (red.matches) { fram = 12; teikn(); } else window.requestAnimationFrame(rull);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppgåver klare';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppgåva er merkt ferdig.';
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
      if (n && !n.value.trim()) m = 'Fyll inn namnet ditt.';
      else if (p && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.value.trim())) m = 'Fyll inn ei gyldig e-postadresse.';
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
