/* GET ACADEMY — løpslinje, kodeflyt-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.steg-lenke,.loptopp__mobil a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- kodeflyt ---------- */
  var ramme = document.querySelector('.kode-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var teiknsett = 'GET ACADEMY 01{}<>=+;:()[]//kode logikk frontend';
    var kolonnar = [], W = 0, H = 0, t = 0;
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR));
      c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
      var n = Math.max(8, Math.floor(W / 22));
      kolonnar = [];
      for (var i = 0; i < n; i++) {
        kolonnar.push({ x: i * 22 + 11, y: Math.random() * H, f: 0.5 + Math.random() * 1.4, teikn: [] });
        for (var j = 0; j < 9; j++) kolonnar[i].teikn.push(teiknsett[Math.floor(Math.random() * teiknsett.length)]);
      }
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '13px "Fira Mono", monospace';
      for (var i = 0; i < kolonnar.length; i++) {
        var k = kolonnar[i];
        k.y += k.f;
        if (k.y - 9 * 16 > H) { k.y = -Math.random() * 120; }
        for (var j = 0; j < k.teikn.length; j++) {
          var y = k.y - j * 16;
          if (y < -16 || y > H + 16) continue;
          var alfa = j === 0 ? 0.95 : Math.max(0.05, 0.6 - j * 0.065);
          ctx.fillStyle = j === 0 ? 'rgba(24,194,156,' + alfa + ')' : (j % 4 === 0 ? 'rgba(76,141,255,' + alfa + ')' : 'rgba(232,238,247,' + alfa + ')');
          ctx.fillText(k.teikn[j], k.x, y);
        }
        if (Math.random() < 0.06) k.teikn[Math.floor(Math.random() * 9)] = teiknsett[Math.floor(Math.random() * teiknsett.length)];
      }
      // markørlinje
      var my = (t * 0.6) % (H + 40) - 20;
      ctx.fillStyle = 'rgba(76,141,255,.06)';
      ctx.fillRect(0, my, W, 2);
      t += 1;
    }
    function rull() { teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik();
    window.addEventListener('resize', function () { storleik(); teikn(); });
    if (red.matches) { teikn(); } else { window.requestAnimationFrame(rull); }
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' søknader behandla';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Behandla'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Behandla';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Søknaden er merkt behandla.';
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
