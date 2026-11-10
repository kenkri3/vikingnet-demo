(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sjikt = document.querySelector('[data-sjikt]');
  if (sjikt) {
    if (redusert) { sjikt.classList.add('apen'); }
    else if ('IntersectionObserver' in window) {
      var io0 = new IntersectionObserver(function (r) {
        r.forEach(function (x) { if (x.isIntersecting) setTimeout(function () { sjikt.classList.add('apen'); }, 280); else sjikt.classList.remove('apen'); });
      }, { threshold: 0.4 });
      io0.observe(sjikt);
    } else { sjikt.classList.add('apen'); }
  }
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til prosjektkoen i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kT = document.querySelector('[data-kpi-tilbud]');
    var kA = document.querySelector('[data-kpi-arbeid]');
    var kF = document.querySelector('[data-kpi-ferdig]');
    function skriv(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div'); rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t)); logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.sak'); var t = 0, a = 0, f = 0;
      alle.forEach(function (s) { var st = s.getAttribute('data-status'); if (st === 'tilbud') t++; else if (st === 'ferdig') f++; else a++; });
      if (kT) kT.textContent = String(t); if (kA) kA.textContent = String(a); if (kF) kF.textContent = String(f);
      faner.forEach(function (x) {
        var n = x.querySelector('.antall'); if (!n) return;
        var k = x.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'tilbud' ? t : k === 'arbeid' ? a : f);
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
      var k = e.target.closest('[data-handling]'); if (!k) return;
      var s = k.closest('.sak'); if (!s) return;
      var id = s.getAttribute('data-id') || '';
      var h = k.getAttribute('data-handling');
      var st = s.querySelector('.status');
      if (h === 'start') {
        s.setAttribute('data-status','arbeid');
        if (st) { st.textContent = 'I arbeid'; st.setAttribute('data-status','arbeid'); }
        k.disabled = true; k.textContent = 'Startet';
        skriv('arbeid startet pa ' + id); visToast('Arbeid startet pa ' + id + '.'); tell();
      } else if (h === 'ferdig') {
        s.setAttribute('data-status','ferdig'); s.classList.add('sak--ferdig');
        if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skriv('prosjekt ' + id + ' ferdig'); visToast('Prosjekt ' + id + ' er ferdig. Dokumentasjon klar.'); tell();
      } else if (h === 'ring') { skriv('ringt kunde om ' + id); visToast('Ringer kunden om ' + id + ' ...'); }
    });
    tell();
  }
  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = t; el.classList.add('vis');
    clearTimeout(toastTid); toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3400);
  }
})();
