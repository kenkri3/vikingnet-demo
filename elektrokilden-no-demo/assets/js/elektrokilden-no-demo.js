/* ============================================================
   Elektro Kilden AS — eget skript
   Canvas strømkrets, bryterpanel som meny, oppdrags- og
   avvikspanel. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Strømkrets på canvas ---------- */
  var holder = document.querySelector('[data-krets]');
  var ctx = null, W = 0, H = 0, dpr = 1, segmenter = [], pulser = [], raf = 0, aktiv = true;

  function lagNett() {
    segmenter = [];
    var kolonner = Math.max(4, Math.round(W / 130));
    var rader = Math.max(3, Math.round(H / 110));
    var stegX = W / kolonner, stegY = H / rader;
    var punkter = [];
    for (var r = 0; r <= rader; r++) {
      punkter[r] = [];
      for (var k = 0; k <= kolonner; k++) {
        punkter[r][k] = { x: k * stegX + stegX * 0.5, y: r * stegY + stegY * 0.5 };
      }
    }
    for (var rr = 0; rr <= rader; rr++) {
      for (var kk = 0; k <= kolonner; kk++) {
        var p = punkter[rr][kk];
        if (kk < kolonner && Math.random() > 0.32) segmenter.push([p, punkter[rr][kk + 1]]);
        if (rr < rader && Math.random() > 0.42) segmenter.push([p, punkter[rr + 1][kk]]);
      }
    }
    pulser = [];
    if (segmenter.length > 0) {
      var antall = Math.max(3, Math.min(9, Math.round(segmenter.length / 10)));
      for (var i = 0; i < antall; i++) {
        pulser.push({ s: segmenter[Math.floor(Math.random() * segmenter.length)], t: Math.random() });
      }
    }
  }

  function tegn() {
    if (!ctx || !segmenter.length) return;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#22313f';
    ctx.beginPath();
    segmenter.forEach(function (s) {
      ctx.moveTo(s[0].x, s[0].y);
      ctx.lineTo(s[1].x, s[1].y);
    });
    ctx.stroke();
    ctx.fillStyle = '#33465a';
    segmenter.forEach(function (s) {
      ctx.fillRect(s[0].x - 1.5, s[0].y - 1.5, 3, 3);
    });
    pulser.forEach(function (p) {
      if (!p.s || !p.s[0] || !p.s[1]) return;
      var a = p.s[0], b = p.s[1];
      var x = a.x + (b.x - a.x) * p.t;
      var y = a.y + (b.y - a.y) * p.t;
      var grd = ctx.createRadialGradient(x, y, 0, x, y, 16);
      grd.addColorStop(0, 'rgba(91,144,240,0.85)');
      grd.addColorStop(1, 'rgba(91,144,240,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9dc0ff';
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      p.t += 0.012;
      if (p.t >= 1) { p.t = 0; p.s = segmenter[Math.floor(Math.random() * segmenter.length)]; }
    });
    if (aktiv) raf = requestAnimationFrame(tegn);
  }

  function startKrets() {
    if (!holder) return;
    var c = document.createElement('canvas');
    holder.appendChild(c);
    ctx = c.getContext('2d');
    if (!ctx) { c.remove(); return; }
    function tilpass() {
      var r = holder.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(320, Math.round(r.width));
      H = Math.max(220, Math.round(r.height));
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lagNett();
    }
    tilpass();
    window.addEventListener('resize', function () { setTimeout(function () { tilpass(); }, 140); });
    if (redusert) { tegn(); } else { tegn(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { aktiv = false; cancelAnimationFrame(raf); }
      else if (!redusert) { aktiv = true; tegn(); }
    });
  }
  startKrets();

  /* ---------- 2. Bryterpanelet ---------- */
  var panel = document.getElementById('fordeling');
  var apne = document.querySelector('[data-ford-apne]');
  var lukk = document.querySelector('[data-ford-lukk]');
  var apen = false;
  function apnePanel() {
    if (!panel || apen) return;
    apen = true;
    panel.classList.add('apen');
    panel.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if (apne) apne.setAttribute('aria-expanded','true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 60);
  }
  function lukkPanel() {
    if (!panel || !apen) return;
    apen = false;
    panel.classList.remove('apen');
    panel.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded','false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apnePanel);
  if (lukk) lukk.addEventListener('click', lukkPanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && apen) { e.preventDefault(); lukkPanel(); } });
  if (panel) panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(lukkPanel, 30); }); });

  /* ---------- 3. Avsløring ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 50 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }

  /* ---------- 4. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning går den til oppdragene i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Oppdrags- og avvikspanelet ---------- */
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiApne = document.querySelector('[data-kpi-apne]');
    var kpiPagaar = document.querySelector('[data-kpi-pagaar]');
    var kpiLukket = document.querySelector('[data-kpi-lukket]');
    function skrivLogg(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div');
      rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.sak');
      var apen = 0, pagaar = 0, lukket = 0;
      alle.forEach(function (s) {
        var st = s.getAttribute('data-status');
        if (st === 'apen') apen++; else if (st === 'lukket') lukket++; else pagaar++;
      });
      if (kpiApne) kpiApne.textContent = String(apen);
      if (kpiPagaar) kpiPagaar.textContent = String(pagaar);
      if (kpiLukket) kpiLukket.textContent = String(lukket);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'apen' ? apen : k === 'pagaar' ? pagaar : lukket);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.sak').forEach(function (s) {
          s.style.display = (k === 'alle' || s.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var s = knapp.closest('.sak');
      if (!s) return;
      var id = s.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = s.querySelector('.status');
      if (h === 'start') {
        s.setAttribute('data-status','pagaar');
        if (st) { st.textContent = 'Pågår'; st.setAttribute('data-status','pagaar'); }
        knapp.disabled = true; knapp.textContent = 'Startet';
        skrivLogg('oppdrag ' + id + ' startet');
        visToast('Oppdrag ' + id + ' er startet. Kunden får SMS når elektrikeren er på vei.');
        tell();
      } else if (h === 'lukk') {
        s.setAttribute('data-status','lukket');
        s.classList.add('sak--lukket');
        if (st) { st.textContent = 'Lukket'; st.setAttribute('data-status','lukket'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('avvik ' + id + ' lukket');
        visToast('Avvik ' + id + ' er lukket og dokumentert i HMS-loggen.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt kunde på ' + id);
        visToast('Ringer kunden på ' + id + ' …');
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = t;
    el.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3600);
  }
})();
