/* ALTOR — meny, kontornett, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.meny a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.nett-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var kontor = [
      { n: 'Oslo', x: 0.42, y: 0.62 }, { n: 'Stockholm', x: 0.62, y: 0.44 },
      { n: 'København', x: 0.48, y: 0.78 }, { n: 'Helsinki', x: 0.78, y: 0.38 },
      { n: 'Zürich', x: 0.38, y: 0.9 }, { n: 'St. Helier', x: 0.18, y: 0.72 }
    ];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // bregdegradar (stilisert)
      ctx.strokeStyle = 'rgba(251,250,247,.07)'; ctx.lineWidth = 1;
      for (var i = 1; i < 5; i++) {
        var y = (H / 5) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // samband mellom kontor
      ctx.strokeStyle = 'rgba(154,123,79,.5)'; ctx.lineWidth = 1.2;
      for (var a = 0; a < kontor.length; a++) {
        for (var b = a + 1; b < kontor.length; b++) {
          var p1 = kontor[a], p2 = kontor[b];
          ctx.beginPath();
          ctx.moveTo(p1.x * W, p1.y * H);
          ctx.quadraticCurveTo(((p1.x + p2.x) / 2) * W, Math.min(p1.y, p2.y) * H - 12, p2.x * W, p2.y * H);
          ctx.stroke();
        }
      }
      // knutepunkt med puls
      kontor.forEach(function (k, i) {
        var x = k.x * W, y = k.y * H;
        var puls = 1 + Math.sin(t * 0.04 + i) * 0.25;
        ctx.beginPath(); ctx.arc(x, y, 3.4 * puls, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#9a7b4f' : 'rgba(251,250,247,.8)'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(154,123,79,.45)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = 'rgba(251,250,247,.55)';
        ctx.font = '9px Ubuntu, sans-serif';
        ctx.fillText(k.n, x + 11, y + 3);
      });
      ctx.fillStyle = 'rgba(251,250,247,.4)';
      ctx.font = '10px Ubuntu, sans-serif';
      ctx.fillText('kontor · Norden og Europa', 8, H - 10);
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
