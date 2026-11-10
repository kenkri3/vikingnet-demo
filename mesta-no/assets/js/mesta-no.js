/* MESTA — veiskilt, veistrekning-canvas, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.veiskilt a,.skilt__mobil a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- veistrekning: veg med stipla midtlinje og køyretøy ---------- */
  var ramme = document.querySelector('.vei-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0, km = 0;
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // asfalt
      ctx.fillStyle = '#101c15'; ctx.fillRect(0, 0, W, H);
      var veiY = H * 0.62, veiH = H * 0.3;
      ctx.fillStyle = '#20302a'; ctx.fillRect(0, veiY, W, veiH);
      // kantlinjer
      ctx.strokeStyle = 'rgba(242,244,239,.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, veiY + 4); ctx.lineTo(W, veiY + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, veiY + veiH - 4); ctx.lineTo(W, veiY + veiH - 4); ctx.stroke();
      // midtstripe (dash) som rører seg
      var avstand = (t * 3) % 60;
      ctx.strokeStyle = 'rgba(200,217,74,.85)'; ctx.lineWidth = 3; ctx.setLineDash([26, 34]);
      ctx.lineDashOffset = -avstand;
      ctx.beginPath(); ctx.moveTo(-40, veiY + veiH / 2); ctx.lineTo(W + 40, veiY + veiH / 2); ctx.stroke();
      ctx.setLineDash([]);
      // landskap: enkle fjell
      ctx.fillStyle = 'rgba(47,125,79,.35)';
      ctx.beginPath(); ctx.moveTo(0, veiY);
      for (var x = 0; x <= W; x += 10) {
        var h1 = veiY - 26 - Math.sin(x * 0.006 + 1.2) * 18 - Math.sin(x * 0.017) * 8;
        ctx.lineTo(x, h1);
      }
      ctx.lineTo(W, veiY); ctx.closePath(); ctx.fill();
      // køyretøy
      var bx = ((t * 1.6) % (W + 160)) - 80;
      ctx.fillStyle = '#c8d94a';
      ctx.fillRect(bx, veiY + 10, 46, 16);
      ctx.fillStyle = '#1c2b22';
      ctx.fillRect(bx + 30, veiY + 13, 14, 10);
      ctx.fillStyle = 'rgba(28,43,34,.8)';
      ctx.beginPath(); ctx.arc(bx + 12, veiY + 28, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 36, veiY + 28, 4, 0, Math.PI * 2); ctx.fill();
      // km-teljar
      km += 0.02;
      ctx.fillStyle = 'rgba(242,244,239,.75)';
      ctx.font = '600 11px "DM Mono", monospace';
      ctx.fillText(Math.round(km) + ' km', W - 62, 22);
      ctx.fillStyle = 'rgba(200,217,74,.9)';
      ctx.fillText('E6 · drift', 14, 22);
      t += 1;
    }
    function rull() { teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { storleik(); teikn(); });
    if (red.matches) teikn(); else window.requestAnimationFrame(rull);
  }

  /* panel */
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag fullførte';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppdraget er merkt fullført og loggført.';
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
