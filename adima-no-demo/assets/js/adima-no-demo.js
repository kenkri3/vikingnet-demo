/* ============================================================
   Adima — eget skript (demo-v3)
   Radiell ringmeny, roterende 3D-kube, bemanningspanel.
   Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Ringmeny ---------- */
  var ring = document.getElementById('ringmeny');
  var apne = document.querySelector('[data-ring-apne]');
  var lukk = document.querySelector('[data-ring-lukk]');
  var apen = false;
  var punkter = document.querySelectorAll('.ringmeny li');
  function plasser() {
    var mobil = window.innerWidth <= 700;
    var n = punkter.length || 1;
    punkter.forEach(function (li, i) {
      if (mobil) { li.style.transform = ''; var ma = li.querySelector('a'); if (ma) ma.style.transform = ''; return; }
      var vinkel = (360 / n) * i - 90;
      var a = li.querySelector('a');
      var indre = li;
      var rot = 'rotate(' + vinkel + 'deg)';
      var mot = 'rotate(' + (-vinkel) + 'deg)';
      indre.style.transform = rot;
      if (a) a.style.transform = mot + ' translateY(calc(-1 * clamp(150px,30vmin,250px)))';
    });
  }
  function apneRing() {
    if (!ring || apen) return;
    apen = true;
    ring.classList.add('apen');
    ring.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    plasser();
    if (apne) apne.setAttribute('aria-expanded', 'true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 60);
  }
  function lukkRing() {
    if (!ring || !apen) return;
    apen = false;
    ring.classList.remove('apen');
    ring.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded', 'false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apneRing);
  if (lukk) lukk.addEventListener('click', lukkRing);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && apen) { e.preventDefault(); lukkRing(); }
  });
  if (ring) ring.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(lukkRing, 30); }); });
  window.addEventListener('resize', function () { if (apen) plasser(); });

  /* ---------- 2. Kuben som roterer med scroll ---------- */
  var kube = document.querySelector('[data-kube]');
  if (kube && !redusert) {
    var vinkel = -28, mal = -28;
    var siste = window.scrollY;
    function rull() {
      var y = window.scrollY;
      vinkel += (y - siste) * 0.22;
      siste = y;
      mal += (vinkel - mal) * 0.08;
      kube.style.transform = 'rotateX(' + (-18 + Math.sin(y / 300) * 4).toFixed(2) + 'deg) rotateY(' + mal.toFixed(2) + 'deg)';
      requestAnimationFrame(rull);
    }
    requestAnimationFrame(rull);
  }

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
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning går den til bemanningskøen i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Bemanningspanelet ---------- */
  var liste = document.querySelector('[data-oppdrag]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiApne = document.querySelector('[data-kpi-apen]');
    var kpiTildelt = document.querySelector('[data-kpi-tildelt]');
    var kpiFylt = document.querySelector('[data-kpi-fylt]');
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
      var apen = 0, tildelt = 0, fylt = 0;
      alle.forEach(function (s) {
        var st = s.getAttribute('data-status');
        if (st === 'apen') apen++; else if (st === 'fylt') fylt++; else tildelt++;
      });
      if (kpiApne) kpiApne.textContent = String(apen);
      if (kpiTildelt) kpiTildelt.textContent = String(tildelt);
      if (kpiFylt) kpiFylt.textContent = String(fylt);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'apen' ? apen : k === 'tildelt' ? tildelt : fylt);
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
      if (h === 'tildel') {
        s.setAttribute('data-status','tildelt');
        if (st) { st.textContent = 'Tildelt'; st.setAttribute('data-status','tildelt'); }
        knapp.disabled = true; knapp.textContent = 'Tildelt';
        skrivLogg('kandidat tildelt oppdrag ' + id);
        visToast('Kandidat tildelt ' + id + '. Kunden får bekreftelse på e-post.');
        tell();
      } else if (h === 'fyll') {
        s.setAttribute('data-status','fylt');
        s.classList.add('sak--fylt');
        if (st) { st.textContent = 'Fylt'; st.setAttribute('data-status','fylt'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('oppdrag ' + id + ' er fylt');
        visToast('Oppdrag ' + id + ' er merket fylt. Fakturaunderlag opprettet.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt kunde om ' + id);
        visToast('Ringer kunden om ' + id + ' …');
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
