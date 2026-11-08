/* ABELONE — bevegelse, buet ikonmeny, speilflipp-kort og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- buet ikonmeny: ikonene legges på en bue (kvadratisk bezier) ---------- */
  var bue = document.querySelector('.bue');
  function leggBue() {
    if (!bue) return;
    var lenker = bue.querySelectorAll('.bue__lenke');
    var n = lenker.length;
    if (!n || !bue.clientWidth) return;
    var W = bue.clientWidth, H = bue.clientHeight;
    var smal = W < 620;
    var pad = smal ? 30 : 74;
    var yEnde = smal ? 42 : 60;
    var yMid = smal ? -2 : -4;
    var p0 = { x: pad, y: yEnde }, c = { x: W / 2, y: yMid }, p2 = { x: W - pad, y: yEnde };
    var strek = bue.querySelector('.bue__strek');
    if (strek) {
      strek.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var sti = strek.querySelector('path');
      if (sti) sti.setAttribute('d', 'M' + p0.x.toFixed(1) + ' ' + p0.y.toFixed(1) + 'Q' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1));
    }
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1);
      var u = 1 - t;
      lenker[i].style.left = (u * u * p0.x + 2 * u * t * c.x + t * t * p2.x).toFixed(1) + 'px';
      lenker[i].style.top = (u * u * p0.y + 2 * u * t * c.y + t * t * p2.y).toFixed(1) + 'px';
    }
    bue.classList.add('klar');
  }
  leggBue();
  var vent = null;
  window.addEventListener('resize', function () {
    clearTimeout(vent);
    vent = setTimeout(leggBue, 140);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(leggBue);

  /* marker gjeldende side */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.bue__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- svak parallakse på heltebildet ---------- */
  var heltebilde = document.querySelector('.helt__bilde img');
  if (heltebilde && !redusert.matches) {
    var bildeVent = false;
    var flyttBilde = function () {
      if (bildeVent) return;
      bildeVent = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        heltebilde.style.transform = 'translate3d(0,' + (y * 0.055).toFixed(2) + 'px,0) scale(1.02)';
        bildeVent = false;
      });
    };
    window.addEventListener('scroll', flyttBilde, { passive: true });
    flyttBilde();
  }

  /* ---------- speilflipp-kort ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.flipp'), function (kort) {
    var knapp = kort.querySelector('.flipp__snubtn');
    if (!knapp) return;
    knapp.addEventListener('click', function (ev) {
      ev.preventDefault();
      var snudd = kort.classList.toggle('snu');
      knapp.setAttribute('aria-expanded', snudd ? 'true' : 'false');
      knapp.setAttribute('aria-label', snudd ? 'Snu kortet tilbake' : 'Snu kortet og se detaljer');
    });
  });

  /* ---------- filter på kolleksjon ---------- */
  var filter = document.querySelector('.filter');
  if (filter) {
    var knapper = filter.querySelectorAll('button');
    var ting = document.querySelectorAll('[data-kategori]');
    Array.prototype.forEach.call(knapper, function (k) {
      k.addEventListener('click', function () {
        Array.prototype.forEach.call(knapper, function (annen) {
          annen.setAttribute('aria-pressed', annen === k ? 'true' : 'false');
        });
        var valg = k.getAttribute('data-filter');
        var synlige = 0;
        Array.prototype.forEach.call(ting, function (el) {
          var vis = valg === 'alle' || el.getAttribute('data-kategori') === valg;
          el.hidden = !vis;
          if (vis) synlige++;
        });
        var telling = document.querySelector('[data-filtrettelling]');
        if (telling) telling.textContent = synlige === 1 ? '1 modell' : synlige + ' modeller';
        var tom = document.querySelector('[data-filtretom]');
        if (tom) tom.hidden = synlige !== 0;
      });
    });
  }

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (skjema) {
    var kvit = skjema.parentNode.querySelector('.skjema__kvittering');
    var feil = skjema.querySelector('.skjema__feil');
    skjema.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var navn = skjema.querySelector('[name="navn"]');
      var epost = skjema.querySelector('[name="epost"]');
      var melding = '';
      if (navn && !navn.value.trim()) melding = 'Fyll inn navnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn en gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) {
        (navn && !navn.value.trim() ? navn : epost).focus();
        return;
      }
      if (kvit) {
        var hvem = navn && navn.value.trim() ? navn.value.trim().split(' ')[0] : '';
        var tekst = kvit.querySelector('[data-kvittering-navn]');
        if (tekst) tekst.textContent = hvem ? 'Takk, ' + hvem + '!' : 'Takk!';
        skjema.hidden = true;
        kvit.classList.add('vis');
        kvit.focus();
      }
    });
  });

  /* ---------- panel ---------- */
  var faner = document.querySelectorAll('.fane');
  if (faner.length) {
    Array.prototype.forEach.call(faner, function (fane) {
      fane.addEventListener('click', function () {
        Array.prototype.forEach.call(faner, function (f) {
          var erValgt = f === fane;
          f.setAttribute('aria-selected', erValgt ? 'true' : 'false');
          var mal = document.getElementById(f.getAttribute('aria-controls'));
          if (mal) mal.hidden = !erValgt;
        });
      });
    });
  }

  function tellOpp() {
    var kpi = document.querySelectorAll('[data-kpi]');
    Array.prototype.forEach.call(kpi, function (kort) {
      var navn = kort.getAttribute('data-kpi');
      var verdi = kort.querySelector('.kpi__tall');
      if (!verdi) return;
      if (navn === 'venter') {
        var venter = document.querySelectorAll('.rad[data-status="venter"]');
        verdi.textContent = venter.length;
      }
      if (navn === 'ferdig') {
        var ferdige = document.querySelectorAll('.rad[data-status="ferdig"]');
        verdi.textContent = ferdige.length;
      }
    });
    var alle = document.querySelectorAll('.rad');
    var frabesvart = document.querySelectorAll('.rad[data-status="ferdig"]').length;
    var hjelp = document.querySelector('[data-fremdrift]');
    if (hjelp && alle.length) hjelp.textContent = frabesvart + ' av ' + alle.length + ' fullført i dag';
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (knapp) {
    knapp.addEventListener('click', function () {
      var rad = knapp.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var status = rad.querySelector('.status');
      if (status) { status.textContent = 'Ferdig'; status.className = 'status status--ferdig'; }
      knapp.disabled = true;
      knapp.textContent = 'Ferdig';
      var kortAvtale = document.getElementById(knapp.getAttribute('data-ferdig'));
      if (kortAvtale) {
        kortAvtale.classList.add('ferdig');
        var kstatus = kortAvtale.querySelector('[data-avtale-status]');
        if (kstatus) kstatus.textContent = 'Ferdig';
      }
      var melding = document.querySelector('[data-panelmelding]');
      if (melding) melding.textContent = (rad.querySelector('.rad__navn') ? rad.querySelector('.rad__navn').textContent.trim() : 'Posten') + ' er merket ferdig.';
      tellOpp();
    });
  });

  var filterpanel = document.querySelector('[data-panelfilter]');
  if (filterpanel) {
    filterpanel.addEventListener('change', function () {
      var valg = filterpanel.value;
      Array.prototype.forEach.call(document.querySelectorAll('.rad'), function (rad) {
        var vis = valg === 'alle' || rad.getAttribute('data-status') === valg;
        rad.hidden = !vis;
      });
    });
  }

  tellOpp();
})();
