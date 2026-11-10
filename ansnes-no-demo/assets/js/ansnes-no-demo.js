/* ============================================================
   Ansnes Entreprenør — eget skript (demo-v3)
   Skuffmeny, 3D-bygg som reiser seg ved scroll, avsløring,
   prosjektpanel. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Skuffmeny ---------- */
  var skuff = document.getElementById('skuff');
  var apne = document.querySelector('[data-skuff-apne]');
  var lukk = document.querySelector('[data-skuff-lukk]');
  var apen = false;
  function apneSkuff() {
    if (!skuff || apen) return;
    apen = true; skuff.classList.add('apen'); skuff.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if (apne) apne.setAttribute('aria-expanded','true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 60);
  }
  function lukkSkuff() {
    if (!skuff || !apen) return;
    apen = false; skuff.classList.remove('apen'); skuff.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded','false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apneSkuff);
  if (lukk) lukk.addEventListener('click', lukkSkuff);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && apen) { e.preventDefault(); lukkSkuff(); } });
  if (skuff) skuff.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(lukkSkuff, 30); }); });

  /* ---------- 2. Bygget som reiser seg ---------- */
  var bygg = document.querySelector('[data-bygg]');
  if (bygg) {
    var plan = [].slice.call(bygg.querySelectorAll('.plan'));
    var teller = document.querySelector('[data-bygg-teller]');
    function sett(n) {
      plan.forEach(function (p, i) { if (i < n) p.setAttribute('data-lagt',''); else p.removeAttribute('data-lagt'); });
      if (teller) teller.textContent = (redusert ? plan.length : n) + ' av ' + plan.length + ' etasjer';
    }
    if (redusert) { sett(plan.length); }
    else {
      sett(0);
      var sisteN = -1;
      function oppdater() {
        var r = bygg.getBoundingClientRect();
        var fremdrift = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.25);
        var n = Math.max(0, Math.min(plan.length, Math.round(fremdrift * plan.length)));
        if (n !== sisteN) { sisteN = n; sett(n); }
      }
      oppdater();
      window.addEventListener('scroll', oppdater, { passive: true });
    }
  }

  /* ---------- 3. Avsløring ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }

  /* ---------- 4. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning går den til prosjektkøen i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Prosjektpanelet ---------- */
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiTilbud = document.querySelector('[data-kpi-tilbud]');
    var kpiBygger = document.querySelector('[data-kpi-bygger]');
    var kpiLevert = document.querySelector('[data-kpi-levert]');
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
      var tilbud = 0, bygger = 0, levert = 0;
      alle.forEach(function (s) {
        var st = s.getAttribute('data-status');
        if (st === 'tilbud') tilbud++; else if (st === 'levert') levert++; else bygger++;
      });
      if (kpiTilbud) kpiTilbud.textContent = String(tilbud);
      if (kpiBygger) kpiBygger.textContent = String(bygger);
      if (kpiLevert) kpiLevert.textContent = String(levert);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'tilbud' ? tilbud : k === 'bygger' ? bygger : levert);
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
        s.setAttribute('data-status','bygger');
        if (st) { st.textContent = 'Bygger'; st.setAttribute('data-status','bygger'); }
        knapp.disabled = true; knapp.textContent = 'Startet';
        skrivLogg('bygging startet pa ' + id);
        visToast('Byggestart registrert pa ' + id + '. Lagleder far beskjed.');
        tell();
      } else if (h === 'levert') {
        s.setAttribute('data-status','levert');
        s.classList.add('sak--levert');
        if (st) { st.textContent = 'Levert'; st.setAttribute('data-status','levert'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('prosjekt ' + id + ' overlevert');
        visToast('Prosjekt ' + id + ' er overlevert. Sluttfaktura klargjores.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt kunde om ' + id);
        visToast('Ringer kunden om ' + id + ' ...');
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
    toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3400);
  }
})();
