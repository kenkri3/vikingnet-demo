/* ============================================================
   ALOA The Label — eget skript
   Meny med bildeavsløring, stoffold i 3D, ordrepanel.
   Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Topplinje fester seg ved scroll ---------- */
  var topp = document.querySelector('.topp');
  function oppdaterTopp() {
    if (!topp) return;
    topp.classList.toggle('limet', window.scrollY > 24);
  }
  oppdaterTopp();
  window.addEventListener('scroll', oppdaterTopp, { passive: true });

  /* ---------- 2. Menyen ---------- */
  var meny = document.getElementById('meny');
  var apneKnapp = document.querySelector('[data-meny-apne]');
  var lukkKnapp = document.querySelector('[data-meny-lukk]');
  var lenker = document.querySelectorAll('[data-meny-punkt]');
  var forhands = document.querySelectorAll('[data-forhands]');
  var forhTekst = document.querySelector('[data-forh-tekst]');
  var apen = false;

  function visForhandsvisning(nokkel, tekst) {
    forhands.forEach(function (img) {
      img.classList.toggle('vis', img.getAttribute('data-forhands') === nokkel);
    });
    if (forhTekst && tekst) forhTekst.textContent = tekst;
  }

  function apneMeny() {
    if (!meny || apen) return;
    apen = true;
    meny.hidden = false;
    requestAnimationFrame(function () { meny.classList.add('apen'); });
    document.body.style.overflow = 'hidden';
    if (apneKnapp) apneKnapp.setAttribute('aria-expanded', 'true');
    if (lukkKnapp) { lukkKnapp.classList.add('synlig'); setTimeout(function () { lukkKnapp.focus(); }, 120); }
    var aktiv = document.querySelector('.meny-liste a[aria-current]');
    var forste = aktiv || document.querySelector('.meny-liste a');
    if (forste) visForhandsvisning(forste.getAttribute('data-bilde') || '', forste.getAttribute('data-kapsel') || '');
  }
  function lukkMeny() {
    if (!meny || !apen) return;
    apen = false;
    meny.classList.remove('apen');
    document.body.style.overflow = '';
    if (apneKnapp) { apneKnapp.setAttribute('aria-expanded', 'false'); apneKnapp.focus(); }
    if (lukkKnapp) lukkKnapp.classList.remove('synlig');
    setTimeout(function () { if (!apen) meny.hidden = true; }, 420);
  }
  if (apneKnapp) apneKnapp.addEventListener('click', apneMeny);
  if (lukkKnapp) lukkKnapp.addEventListener('click', lukkMeny);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && apen) { e.preventDefault(); lukkMeny(); }
  });
  lenker.forEach(function (a) {
    a.addEventListener('mouseenter', function () {
      visForhandsvisning(a.getAttribute('data-bilde') || '', a.getAttribute('data-kapsel') || '');
    });
    a.addEventListener('focus', function () {
      visForhandsvisning(a.getAttribute('data-bilde') || '', a.getAttribute('data-kapsel') || '');
    });
    a.addEventListener('click', function () { lukkMeny(); });
  });

  /* ---------- 3. Stoffold som roterer svakt med scroll ---------- */
  var fold = document.querySelector('[data-fold]');
  if (fold && !redusert) {
    var siste = -1;
    function rull() {
      var p = Math.min(1, Math.max(0, window.scrollY / 900));
      if (Math.abs(p - siste) > 0.002) {
        fold.style.transform = 'rotateY(' + (-14 + p * 16).toFixed(2) + 'deg) rotateX(' + (p * -3).toFixed(2) + 'deg)';
        siste = p;
      }
      requestAnimationFrame(rull);
    }
    requestAnimationFrame(rull);
  }

  /* ---------- 4. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) {
        if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 50 + 'ms';
      io.observe(el);
    });
  } else {
    avslor.forEach(function (el) { el.classList.add('inn'); });
  }

  /* ---------- 5. Nyhetsbrev og skjema ---------- */
  document.querySelectorAll('[data-klubb]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var svar = form.querySelector('.svar') || document.querySelector('.svar');
      var epost = form.querySelector('input[type="email"]');
      if (!svar) return;
      if (!epost || epost.value.indexOf('@') < 1) {
        svar.textContent = 'Skriv inn en gyldig e-postadresse, så melder vi deg inn.';
        return;
      }
      svar.textContent = 'Velkommen til klubben. Rabattkoden er på vei til ' + epost.value + ' (demo – ingenting sendes).';
      epost.value = '';
    });
  });
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var melding = form.querySelector('.skjema-melding');
      if (!melding) return;
      var navn = form.querySelector('[name="navn"]');
      var hei = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      melding.textContent = (hei ? 'Takk, ' + hei + '. ' : 'Takk. ') + 'Vi svarer deg innen to virkedager. (Demo: meldingen sendes ikke.)';
      melding.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 6. Panelet: ordrer og lager ---------- */
  var ordrer = document.querySelector('[data-ordrer]');
  if (ordrer) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiApne = document.querySelector('[data-kpi-apne]');
    var kpiReservert = document.querySelector('[data-kpi-reservert]');
    var kpiSendt = document.querySelector('[data-kpi-sendt]');

    function skrivLogg(tekst) {
      if (!logg) return;
      var t = new Date();
      var kl = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      var rad = document.createElement('div');
      rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(tekst));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = ordrer.querySelectorAll('.ordre');
      var reservert = 0, sendt = 0, apne = 0;
      alle.forEach(function (o) {
        var st = o.getAttribute('data-status');
        if (st === 'reservert') reservert++;
        else if (st === 'sendt') sendt++;
        else apne++;
      });
      if (kpiApne) kpiApne.textContent = String(apne);
      if (kpiReservert) kpiReservert.textContent = String(reservert);
      if (kpiSendt) kpiSendt.textContent = String(sendt);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall');
        if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'reservert' ? reservert : k === 'sendt' ? sendt : apne);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        f.setAttribute('aria-pressed', 'true');
        ordrer.querySelectorAll('.ordre').forEach(function (o) {
          var st = o.getAttribute('data-status');
          var vis = k === 'alle' || st === k || (k === 'nye' && st === 'ny');
          o.style.display = vis ? '' : 'none';
        });
      });
    });
    ordrer.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var ordre = knapp.closest('.ordre');
      if (!ordre) return;
      var id = ordre.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var statusEl = ordre.querySelector('.status');
      if (h === 'reserver') {
        ordre.setAttribute('data-status', 'reservert');
        if (statusEl) { statusEl.textContent = 'Reservert'; statusEl.setAttribute('data-status', 'reservert'); }
        knapp.disabled = true;
        knapp.textContent = 'Reservert';
        skrivLogg('lager reservert for ' + id);
        visToast('Lager reservert for ' + id + '. Varen er holdt av i 24 timer.');
        tell();
      } else if (h === 'pakk') {
        ordre.setAttribute('data-status', 'pakket');
        if (statusEl) { statusEl.textContent = 'Pakket'; statusEl.setAttribute('data-status', 'pakket'); }
        skrivLogg('ordre ' + id + ' pakket');
        visToast('Ordre ' + id + ' er pakket og klar for henting.');
        tell();
      } else if (h === 'send') {
        ordre.setAttribute('data-status', 'sendt');
        ordre.classList.add('ordre--sendt');
        if (statusEl) { statusEl.textContent = 'Sendt'; statusEl.setAttribute('data-status', 'sendt'); }
        ordre.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('ordre ' + id + ' sendt med Posten');
        visToast('Ordre ' + id + ' er sendt. Sporing er sendt til kunden.');
        tell();
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(tekst) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = tekst;
    t.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { t.classList.remove('vis'); }, 3600);
  }
})();
