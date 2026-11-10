/* ABACUS RATIO — regnearkfaner, talgrafikk, panel, kalkulator */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.arkfane'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- graf som teiknar seg sjølv ---------- */
  var ramme = document.querySelector('.graf-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, fram = 0;
    var seriar = [
      { namn: 'Inntekt', verdi: [0.55, 0.62, 0.58, 0.71, 0.78, 0.86], farge: '#12857a' },
      { namn: 'Kostnad', verdi: [0.41, 0.44, 0.4, 0.46, 0.44, 0.48], farge: '#c96b3a' }
    ];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var ml = 40, mr = 14, mt = 18, mb = 30;
      var iw = W - ml - mr, ih = H - mt - mb;
      // aksar
      ctx.strokeStyle = 'rgba(23,29,43,.18)'; ctx.lineWidth = 1;
      for (var gy = 0; gy <= 4; gy++) {
        var y = mt + ih * (gy / 4);
        ctx.beginPath(); ctx.moveTo(ml, y); ctx.lineTo(W - mr, y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(23,29,43,.5)';
      ctx.font = '10px "Geist Mono", monospace';
      for (var g2 = 0; g2 <= 4; g2++) ctx.fillText(String(100 - g2 * 25), 8, mt + ih * (g2 / 4) + 4);
      ctx.fillText('0', 8, H - mb + 4);
      // seriar
      seriar.forEach(function (s, si) {
        var steg = s.verdi.length;
        ctx.beginPath();
        for (var i = 0; i < steg; i++) {
          var mål = Math.min(1, Math.max(0, fram - i * 0.08));
          var x = ml + iw * (i / (steg - 1));
          var y = mt + ih * (1 - s.verdi[i] * mål);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = s.farge; ctx.lineWidth = 2.2; ctx.stroke();
        for (var j = 0; j < steg; j++) {
          var mål2 = Math.min(1, Math.max(0, fram - j * 0.08));
          if (mål2 <= 0) continue;
          var x2 = ml + iw * (j / (steg - 1));
          var y2 = mt + ih * (1 - s.verdi[j] * mål2);
          ctx.beginPath(); ctx.arc(x2, y2, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = s.farge; ctx.fill();
        }
      });
      // akse-etikett
      ctx.fillStyle = 'rgba(23,29,43,.45)';
      ctx.font = '10px "Geist Mono", monospace';
      var mnd = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun'];
      for (var k = 0; k < mnd.length; k++) {
        var xk = ml + iw * (k / (mnd.length - 1));
        ctx.fillText(mnd[k], xk - 9, H - 10);
      }
      // teljar
      ctx.fillStyle = '#12857a';
      ctx.font = '600 12px "Geist Mono", monospace';
      var vist = Math.round(86 * Math.min(1, fram));
      ctx.fillText(vist + ' %', W - mr - 42, mt + 10);
      if (fram < 1.6) fram += 0.012;
    }
    function rull() { teikn(); if (!red.matches && fram < 1.7) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { fram = 1.4; storleik(); teikn(); });
    if (red.matches) { fram = 1.6; teikn(); } else window.requestAnimationFrame(rull);
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
    var framEl = document.querySelector('[data-framdrift]');
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppgåver klare';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Klar'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Klar';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppgåva er merkt klar og loggført.';
      telOpp();
    });
  });
  telOpp();

  /* kalkulator: ingen prisar er dikta opp – han berre samlar behovet */
  var kalk = document.querySelector('[data-kalkulator]');
  if (kalk) {
    kalk.addEventListener('submit', function (e) {
      e.preventDefault();
      var ansatte = kalk.querySelector('[name="ansatte"]');
      var bilag = kalk.querySelector('[name="bilag"]');
      var behov = kalk.querySelectorAll('[name="behov"]:checked');
      var ut = document.querySelector('[data-utrekning]');
      var feil = kalk.querySelector('.skjema__feil');
      var m = '';
      if (ansatte && !ansatte.value.trim()) m = 'Fyll inn talet på tilsette.';
      else if (bilag && !bilag.value.trim()) m = 'Fyll inn omtrentleg tal bilag per månad.';
      if (feil) feil.textContent = m;
      if (m) { (ansatte && !ansatte.value.trim() ? ansatte : bilag).focus(); return; }
      if (ut) {
        var liste = [];
        Array.prototype.forEach.call(behov, function (b) { liste.push(b.value); });
        ut.querySelector('[data-ut-ansatte]').textContent = ansatte.value.trim();
        ut.querySelector('[data-ut-bilag]').textContent = bilag.value.trim();
        ut.querySelector('[data-ut-behov]').textContent = liste.length ? liste.join(', ') : 'Ikkje valt';
        ut.classList.add('vis');
        ut.focus();
        kalk.hidden = true;
      }
    });
  }

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
