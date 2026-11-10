(function () {
  'use strict';
  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mb = document.querySelector('[data-mob-apne]'), mm = document.getElementById('mobmeny');
  if (mb && mm) mb.addEventListener('click', function () { var a = mm.classList.toggle('apen'); mb.setAttribute('aria-expanded', a ? 'true' : 'false'); });
  var monster = document.querySelector('[data-flmonster]');
  if (monster) {
    var fliser = [].slice.call(monster.querySelectorAll('.fl'));
    fliser.forEach(function (f, i) { f.style.setProperty('--i', String(i)); });
    if (rolig) monster.classList.add('inn');
    else if ('IntersectionObserver' in window) {
      var io0 = new IntersectionObserver(function (r) { r.forEach(function (x) { if (x.isIntersecting) { monster.classList.add('inn'); fliser.forEach(function (f, i) { f.style.transitionDelay = (i * 55) + 'ms'; }); } }); }, { threshold: 0.3 });
      io0.observe(monster);
    } else monster.classList.add('inn');
  }
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !rolig && avslor.length) {
    var io = new IntersectionObserver(function (rader) { rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else avslor.forEach(function (el) { el.classList.add('inn'); });
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); var m = form.querySelector('.skjema-melding'); if (!m) return;
      var navn = form.querySelector('[name="navn"]'); var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til tilbudskoen.';
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
      if (h === 'start') { s.setAttribute('data-status','loper'); if (st) { st.textContent = 'Loper'; st.setAttribute('data-status','loper'); } k.disabled = true; k.textContent = 'Startet'; skriv('jobb ' + id + ' startet'); visToast('Jobb ' + id + ' er startet.'); tell(); }
      else if (h === 'ferdig') { s.setAttribute('data-status','ferdig'); s.classList.add('sak--ferdig'); if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); } s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; }); skriv('jobb ' + id + ' ferdig'); visToast('Jobb ' + id + ' er ferdig.'); tell(); }
      else if (h === 'ring') { skriv('ringt om ' + id); visToast('Ringer om ' + id + ' ...'); } });
    tell();
  }
  var toastTid = null;
  function visToast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('vis'); clearTimeout(toastTid); toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3200); }
})();
