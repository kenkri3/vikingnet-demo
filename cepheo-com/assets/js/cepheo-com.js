/* CEPHEO — modulmeny, integrasjonsgraf, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.modul'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- integrasjonsgraf: nodar og straumar ---------- */
  var ramme = document.querySelector('.graf-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var nodar = [];
    function lag() {
      nodar = [
        { x: .18, y: .30, n: 'ERP', f: '#5a4bda' },
        { x: .18, y: .70, n: 'CRM', f: '#5a4bda' },
        { x: .50, y: .50, n: 'Plattform', f: '#22b8a6' },
        { x: .80, y: .26, n: 'Data', f: '#22b8a6' },
        { x: .80, y: .72, n: 'Analyse', f: '#22b8a6' },
        { x: .50, y: .16, n: 'Azure', f: '#8f86ff' }
      ];
    }
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h; lag();
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // rutenett
      ctx.strokeStyle = 'rgba(244,245,248,.05)'; ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 34) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 34) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      // kantar
      var mid = nodar[2];
      for (var i = 0; i < nodar.length; i++) {
        if (i === 2) continue;
        var a = nodar[i];
        ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(mid.x * W, mid.y * H);
        ctx.strokeStyle = 'rgba(90,75,218,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
        // straum-prikk
        var f = ((t * 0.008 + i * 0.17) % 1);
        var px = a.x * W + (mid.x - a.x) * W * f;
        var py = a.y * H + (mid.y - a.y) * H * f;
        ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,184,166,.95)'; ctx.fill();
      }
      // nodar
      for (var k = 0; k < nodar.length; k++) {
        var n = nodar[k];
        var x = n.x * W, y = n.y * H;
        var puls = 1 + Math.sin(t * 0.05 + k) * 0.06;
        ctx.beginPath(); ctx.arc(x, y, 15 * puls, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15,24,38,.9)'; ctx.fill();
        ctx.strokeStyle = n.f; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.fillStyle = 'rgba(244,245,248,.85)';
        ctx.font = '10px "Chivo Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.n, x, y + 26);
      }
      ctx.textAlign = 'start';
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppgåver fullførte';
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
