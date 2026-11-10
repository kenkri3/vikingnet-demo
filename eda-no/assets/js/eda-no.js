(function () {
  'use strict';
  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var krets = document.querySelector('[data-krets]');
  if (krets) {
    var linjer = [].slice.call(krets.querySelectorAll('path[data-tegn]'));
    function mal() { linjer.forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = rolig ? 0 : l; p.dataset.l = String(l); }); }
    mal();
    function tegn() { var r = krets.getBoundingClientRect(); var p = Math.min(1, Math.max(0, (window.innerHeight * 0.9 - r.top) / (r.height * 1.1))); linjer.forEach(function (l) { l.style.strokeDashoffset = (parseFloat(l.dataset.l) * (1 - p)).toFixed(1); }); }
    if (rolig) tegn(); else { tegn(); window.addEventListener('scroll', tegn, { passive: true }); }
    window.addEventListener('resize', function () { setTimeout(function () { mal(); tegn(); }, 120); });
  }
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !rolig && avslor.length) {
    var io = new IntersectionObserver(function (rader) { rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else avslor.forEach(function (el) { el.classList.add('inn'); });
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); var m = form.querySelector('.skjema-melding'); if (!m) return;
      var navn = form.querySelector('[name="navn"]'); var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen.';
      m.classList.add('vis'); form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; }); });
  });
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]'), logg = document.querySelector('[data-logg]');
    var kN = document.querySelector('[data-kpi-ny]'), kL = document.querySelector('[data-kpi-loper]'), kF = document.querySelector('[data-kpi-ferdig]');
    function skriv(t) { if (!logg) return; var d = new Date(), kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); var rad = document.createElement('div'); rad.innerHTML = '<b>' + kl + '</b> '; rad.appendChild(document.createTextNode(t)); logg.insertBefore(rad, logg.firstChild); while (logg.children.length > 7) logg.removeChild(logg.lastChild); }
    function tell() { var alle = liste.querySelectorAll('.sak'), n = 0, l = 0, f = 0; alle.forEach(function (s) { var st = s.getAttribute('data-status'); if (st === 'ny') n++; else if (st === 'ferdig') f++; else l++; });
      if (kN) kN.textContent = String(n); if (kL) kL.textContent = String(l); if (kF) kF.textContent = String(f);
      faner.forEach(function (x) { var el = x.querySelector('.antall'); if (!el) return; var k = x.getAttribute('data-filter'); el.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? n : k === 'loper' ? l : f); }); }
    faner.forEach(function (f) { f.addEventListener('click', function () { var k = f.getAttribute('data-filter'); faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); }); f.setAttribute('aria-pressed','true'); liste.querySelectorAll('.sak').forEach(function (s) { s.style.display = (k === 'alle' || s.getAttribute('data-status') === k) ? '' : 'none'; }); }); });
    liste.addEventListener('click', function (e) {
      var k = e.target.closest('[data-handling]'); if (!k) return; var s = k.closest('.sak'); if (!s) return;
      var id = s.getAttribute('data-id') || '', h = k.getAttribute('data-handling'), st = s.querySelector('.status');
      if (h === 'start') { s.setAttribute('data-status','loper'); if (st) { st.textContent = 'Loper'; st.setAttribute('data-status','loper'); } k.disabled = true; k.textContent = 'Startet'; skriv('oppdrag ' + id + ' startet'); visToast('Oppdrag ' + id + ' er startet.'); tell(); }
      else if (h === 'ferdig') { s.setAttribute('data-status','ferdig'); s.classList.add('sak--ferdig'); if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); } s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; }); skriv('oppdrag ' + id + ' ferdig'); visToast('Oppdrag ' + id + ' er ferdig.'); tell(); }
      else if (h === 'ring') { skriv('ringt om ' + id); visToast('Ringer om ' + id + ' ...'); } });
    tell();
  }
  var toastTid = null;
  function visToast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('vis'); clearTimeout(toastTid); toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3200); }
})();
