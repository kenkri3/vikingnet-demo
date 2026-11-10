/* euroRessurs — meny, kraftlinje, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.nav a,.mobnav a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  var ramme = document.querySelector('.linje-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    var nodar = [
      { x: 0.08, y: 0.62 }, { x: 0.26, y: 0.4 }, { x: 0.44, y: 0.56 },
      { x: 0.62, y: 0.34 }, { x: 0.8, y: 0.5 }, { x: 0.93, y: 0.3 }
    ];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // horisont
      var hy = H * 0.72;
      ctx.strokeStyle = 'rgba(245,246,247,.14)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(W, hy); ctx.stroke();
      // installasjonar på linja
      nodar.forEach(function (n, i) {
        var x = n.x * W, y = n.y * H;
        // mast
        ctx.strokeStyle = 'rgba(245,246,247,.28)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, hy); ctx.stroke();
        // node
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 2 || i === 4 ? '#e08b3c' : '#6fa6c9'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 9 + Math.sin(t * 0.03 + i) * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = i === 2 || i === 4 ? 'rgba(224,139,60,.35)' : 'rgba(111,166,201,.3)';
        ctx.lineWidth = 1; ctx.stroke();
      });
      // leidning mellom nodane
      ctx.strokeStyle = 'rgba(245,246,247,.2)'; ctx.lineWidth = 1;
      for (var i = 0; i < nodar.length - 1; i++) {
        var a = nodar[i], b = nodar[i + 1];
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H);
        ctx.quadraticCurveTo(((a.x + b.x) / 2) * W, Math.min(a.y, b.y) * H - H * 0.13, b.x * W, b.y * H);
        ctx.stroke();
      }
      // pulsar
      for (var k = 0; k < 4; k++) {
        var seg = k % (nodar.length - 1);
        var f = ((t * 0.004 + k * 0.25) % 1);
        var a2 = nodar[seg], b2 = nodar[seg + 1];
        var cx = ((a2.x + b2.x) / 2) * W, cy = Math.min(a2.y, b2.y) * H - H * 0.13;
        var inv = 1 - f;
        var px = inv * inv * a2.x * W + 2 * inv * f * cx + f * f * b2.x * W;
        var py = inv * inv * a2.y * H + 2 * inv * f * cy + f * f * b2.y * H;
        ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224,139,60,.95)'; ctx.fill();
      }
      ctx.fillStyle = 'rgba(245,246,247,.42)';
      ctx.font = '10px "Spline Sans", sans-serif';
      ctx.fillText('energi · infrastruktur · offentlege bygg', 10, H - 12);
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
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppdraget er merkt fullført.';
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
