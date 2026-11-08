/* ============================================================
   Flotte Gulv AS — eget skript
   Flislagt grid-meny, CSS 3D-gulv som legges, befaringer.
   Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Flislagt grid-nav ---------- */
  var rutenett = document.getElementById('rutenett');
  var apne = document.querySelector('[data-rute-apne]');
  var lukk = document.querySelector('[data-rute-lukk]');
  var apen = false;
  function apneRutenett() {
    if (!rutenett || apen) return;
    apen = true;
    rutenett.classList.add('apen');
    rutenett.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if (apne) apne.setAttribute('aria-expanded','true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 60);
  }
  function lukkRutenett() {
    if (!rutenett || !apen) return;
    apen = false;
    rutenett.classList.remove('apen');
    rutenett.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded','false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apneRutenett);
  if (lukk) lukk.addEventListener('click', lukkRutenett);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && apen) { e.preventDefault(); lukkRutenett(); } });
  if (rutenett) rutenett.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(lukkRutenett, 30); }); });

  /* ---------- 2. Gulvet som legges ---------- */
  var gulv = document.querySelector('[data-gulv]');
  if (gulv) {
    if ('IntersectionObserver' in window && !redusert) {
      var io0 = new IntersectionObserver(function (r) {
        r.forEach(function (x) { if (x.isIntersecting) { setTimeout(function () { gulv.classList.add('lagt'); }, 280); io0.unobserve(x.target); } });
      }, { threshold: 0.3 });
      io0.observe(gulv);
    } else {
      gulv.classList.add('lagt');
    }
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
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning havner den i befaringene i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Befaringspanelet ---------- */
  var liste = document.querySelector('[data-befaringer]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiApne = document.querySelector('[data-kpi-apne]');
    var kpiBooket = document.querySelector('[data-kpi-booket]');
    var kpiGjestet = document.querySelector('[data-kpi-gjestet]');
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
      var alle = liste.querySelectorAll('.befaring');
      var ny = 0, booket = 0, gjestet = 0;
      alle.forEach(function (b) {
        var st = b.getAttribute('data-status');
        if (st === 'ny') ny++; else if (st === 'gjestet') gjestet++; else booket++;
      });
      if (kpiApne) kpiApne.textContent = String(ny);
      if (kpiBooket) kpiBooket.textContent = String(booket);
      if (kpiGjestet) kpiGjestet.textContent = String(gjestet);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? ny : k === 'booket' ? booket : gjestet);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.befaring').forEach(function (b) {
          b.style.display = (k === 'alle' || b.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var b = knapp.closest('.befaring');
      if (!b) return;
      var id = b.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = b.querySelector('.status');
      if (h === 'book') {
        b.setAttribute('data-status','booket');
        if (st) { st.textContent = 'Booket'; st.setAttribute('data-status','booket'); }
        knapp.disabled = true; knapp.textContent = 'Booket';
        skrivLogg('befaring ' + id + ' booket i showrommet');
        visToast('Befaring ' + id + ' er booket. Kunden får bekreftelse på e-post.');
        tell();
      } else if (h === 'gjest') {
        b.setAttribute('data-status','gjestet');
        b.classList.add('befaring--gjestet');
        if (st) { st.textContent = 'Gjestet'; st.setAttribute('data-status','gjestet'); }
        b.querySelectorAll('[data-handling]').forEach(function (x) { x.disabled = true; });
        skrivLogg('befaring ' + id + ' gjennomført');
        visToast('Befaring ' + id + ' er registrert som gjennomført. Tilbud kan sendes.');
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
