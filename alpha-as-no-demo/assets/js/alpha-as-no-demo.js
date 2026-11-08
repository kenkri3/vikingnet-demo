/* ALPHA ØKONOMI — indeks, diagram og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- aktiv side i indeksen ---------- */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.indeks__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- topplinja krympar når ein scrollar ---------- */
  var topp = document.querySelector('.topp');
  if (topp) {
    var sett = function () {
      if (window.scrollY > 40) topp.classList.add('krympet');
      else topp.classList.remove('krympet');
    };
    sett();
    window.addEventListener('scroll', sett, { passive: true });
  }

  /* ---------- diagram: mål linelengda så streken kan teiknast ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.graf'), function (graf) {
    var linje = graf.querySelector('.graf__linje');
    if (!linje || !linje.getTotalLength) return;
    try {
      var lengd = Math.ceil(linje.getTotalLength());
      graf.style.setProperty('--lengd', lengd + 'px');
      linje.style.setProperty('--lengd', lengd);
    } catch (e) {}
    // siste punkt i serien får ei prikk
    var punkter = graf.querySelectorAll('.graf__punkt');
    if (punkter.length) {
      var siste = punkter[punkter.length - 1];
      siste.setAttribute('r', '4.5');
    }
  });

  /* ---------- teljing i panel ---------- */
  function telOpp() {
    var ventar = document.querySelectorAll('.rad[data-status="ventar"]').length;
    var ferdige = document.querySelectorAll('.rad[data-status="ferdig"]').length;
    var kV = document.querySelector('[data-kpi="ventar"] .kpi__tal');
    var kF = document.querySelector('[data-kpi="ferdig"] .kpi__tal');
    if (kV) kV.textContent = ventar;
    if (kF) kF.textContent = ferdige;
    var fram = document.querySelector('[data-framdrift]');
    if (fram) {
      var alle = document.querySelectorAll('.rad').length;
      fram.textContent = ferdige + ' av ' + alle + ' avstemde i dag';
    }
  }

  /* ---------- faner ---------- */
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

  /* ---------- avstem ein post ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-avstem]'), function (knapp) {
    knapp.addEventListener('click', function () {
      var rad = knapp.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Avstemt'; st.className = 'status status--ferdig'; }
      knapp.disabled = true;
      knapp.textContent = 'Avstemt';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) {
        var namn = rad.querySelector('.rad__namn');
        meld.textContent = (namn ? namn.textContent.trim() : 'Posten') + ' er avstemt mot banken.';
      }
      telOpp();
    });
  });

  telOpp();

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (skjema) {
    var kvit = skjema.parentNode.querySelector('.skjema__kvittering');
    var feil = skjema.querySelector('.skjema__feil');
    skjema.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var navn = skjema.querySelector('[name="navn"]');
      var epost = skjema.querySelector('[name="epost"]');
      var melding = '';
      if (navn && !navn.value.trim()) melding = 'Fyll inn namnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var t = kvit.querySelector('[data-kvittering-namn]');
        if (t) t.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
