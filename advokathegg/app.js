/*
  Advokatfirmaet Hegg & Co — demo.
  Alt skjer i nettleseren: ingen data lagres, ingen e-post sendes automatisk.
  Kvitteringen kan sendes videre via brukerens egen e-postklient (mailto).
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Årstall i footer ---------- */

  var aar = new Date().getFullYear();
  Array.prototype.forEach.call(document.querySelectorAll('[data-ar]'), function (el) {
    el.textContent = String(aar);
  });

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hovednav');

  if (toggle && nav) {
    var mq = window.matchMedia('(max-width: 900px)');

    var settMeny = function (apen) {
      if (apen) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
    };

    var synkMeny = function () {
      if (mq.matches) {
        settMeny(false);
      } else {
        nav.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    synkMeny();

    toggle.addEventListener('click', function () {
      settMeny(nav.hasAttribute('hidden'));
    });

    nav.addEventListener('click', function (e) {
      if (mq.matches && e.target.closest('a')) settMeny(false);
    });

    if (mq.addEventListener) {
      mq.addEventListener('change', synkMeny);
    } else if (mq.addListener) {
      mq.addListener(synkMeny);
    }
  }

  /* ---------- Kalkulator på firmaets egne timesatser ---------- */

  var kalkulator = document.querySelector('[data-kalkulator]');

  if (kalkulator) {
    var satsKnapper = kalkulator.querySelectorAll('[data-sats]');
    var timer = kalkulator.querySelector('#timer');
    var timerUt = kalkulator.querySelector('#timer-ut');
    var utEks = kalkulator.querySelector('[data-ut-eks]');
    var utMva = kalkulator.querySelector('[data-ut-mva]');
    var utInkl = kalkulator.querySelector('[data-ut-inkl]');
    var sats = 2400;
    var tallformat = new Intl.NumberFormat('nb-NO');

    var kroner = function (belop) {
      return tallformat.format(belop) + ' kr';
    };

    var regnUt = function () {
      var antall = parseInt(timer.value, 10);
      var eks = sats * antall;
      var mva = Math.round(eks * 0.25);

      utEks.textContent = kroner(eks);
      utMva.textContent = kroner(mva);
      utInkl.textContent = kroner(eks + mva);
      timerUt.textContent = antall + (antall === 1 ? ' time' : ' timer');
    };

    Array.prototype.forEach.call(satsKnapper, function (knapp) {
      knapp.addEventListener('click', function () {
        sats = parseInt(knapp.getAttribute('data-sats'), 10);
        Array.prototype.forEach.call(satsKnapper, function (annen) {
          var valgt = annen === knapp;
          annen.classList.toggle('is-valgt', valgt);
          annen.setAttribute('aria-pressed', valgt ? 'true' : 'false');
        });
        regnUt();
      });
    });

    timer.addEventListener('input', regnUt);
    regnUt();
  }

  /* ---------- Henvendelse: tre steg og kvittering ---------- */

  var form = document.getElementById('henvendelse-skjema');

  if (form) {
    var steg = Array.prototype.slice.call(form.querySelectorAll('.steg'));
    var kvittering = form.querySelector('[data-kvittering]');
    var framdriftFyll = document.querySelector('[data-framdrift-fyll]');
    var stegtekst = document.querySelector('[data-stegtekst]');

    var felt = {
      omrade: document.getElementById('omrade'),
      kontor: document.getElementById('kontor'),
      navn: document.getElementById('navn'),
      epost: document.getElementById('epost'),
      telefon: document.getElementById('telefon'),
      beskrivelse: document.getElementById('beskrivelse')
    };

    var feil = {};
    ['omrade', 'navn', 'epost', 'telefon', 'beskrivelse'].forEach(function (nokkel) {
      feil[nokkel] = document.getElementById('feil-' + nokkel);
    });

    var merkFeil = function (nokkel, tekst) {
      var inn = felt[nokkel];
      if (inn) inn.setAttribute('aria-invalid', 'true');
      if (feil[nokkel]) {
        feil[nokkel].textContent = tekst;
        feil[nokkel].hidden = false;
      }
    };

    var fjernFeil = function (nokkel) {
      var inn = felt[nokkel];
      if (inn) inn.removeAttribute('aria-invalid');
      if (feil[nokkel]) {
        feil[nokkel].textContent = '';
        feil[nokkel].hidden = true;
      }
    };

    var visSteg = function (indeks, flyttFokus) {
      steg.forEach(function (element, nr) {
        element.hidden = nr !== indeks;
      });
      if (kvittering) kvittering.hidden = true;

      framdriftFyll.style.width = ((indeks + 1) / steg.length) * 100 + '%';
      stegtekst.textContent = 'Steg ' + (indeks + 1) + ' av ' + steg.length;

      if (flyttFokus) {
        var tittel = steg[indeks].querySelector('[data-fokus]');
        if (tittel) tittel.focus();
      }
    };

    var gyldigSteg = function (indeks) {
      var ok = true;
      var forsteFeil = null;

      if (indeks === 0) {
        if (!felt.omrade.value) {
          merkFeil('omrade', 'Velg hva henvendelsen gjelder.');
          ok = false;
          forsteFeil = forsteFeil || felt.omrade;
        } else {
          fjernFeil('omrade');
        }
      }

      if (indeks === 1) {
        if (felt.navn.value.trim().length < 2) {
          merkFeil('navn', 'Skriv navnet ditt.');
          ok = false;
          forsteFeil = forsteFeil || felt.navn;
        } else {
          fjernFeil('navn');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(felt.epost.value.trim())) {
          merkFeil('epost', 'Skriv en gyldig e-postadresse.');
          ok = false;
          forsteFeil = forsteFeil || felt.epost;
        } else {
          fjernFeil('epost');
        }

        if (felt.telefon.value.replace(/\D/g, '').length < 8) {
          merkFeil('telefon', 'Skriv et telefonnummer med minst 8 sifre.');
          ok = false;
          forsteFeil = forsteFeil || felt.telefon;
        } else {
          fjernFeil('telefon');
        }

        if (felt.beskrivelse.value.trim().length < 10) {
          merkFeil('beskrivelse', 'Skriv noen ord om saken, minst 10 tegn.');
          ok = false;
          forsteFeil = forsteFeil || felt.beskrivelse;
        } else {
          fjernFeil('beskrivelse');
        }
      }

      if (!ok && forsteFeil) forsteFeil.focus();
      return ok;
    };

    var lesSvar = function () {
      var svar = {
        omrade: felt.omrade.value,
        kontor: felt.kontor.value,
        navn: felt.navn.value.trim(),
        epost: felt.epost.value.trim(),
        telefon: felt.telefon.value.trim(),
        beskrivelse: felt.beskrivelse.value.trim()
      };

      ['omrade', 'kontor', 'navn', 'epost', 'telefon', 'beskrivelse'].forEach(function (nokkel) {
        var mal = form.querySelector('[data-opp-' + nokkel + ']');
        if (mal) mal.textContent = svar[nokkel] || '—';
      });

      return svar;
    };

    var lagReferanse = function (dato) {
      var to = function (tall) {
        return (tall < 10 ? '0' : '') + tall;
      };
      return 'HEGG-' + dato.getFullYear() + to(dato.getMonth() + 1) + to(dato.getDate()) +
        '-' + (1000 + Math.floor(Math.random() * 9000));
    };

    var visKvittering = function () {
      var svar = lesSvar();
      var naa = new Date();
      var referanse = lagReferanse(naa);

      form.querySelector('[data-ref]').textContent = referanse;
      form.querySelector('[data-kv-mottatt]').textContent =
        new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long', timeStyle: 'short' }).format(naa);

      ['omrade', 'kontor', 'navn', 'epost', 'telefon', 'beskrivelse'].forEach(function (nokkel) {
        var mal = form.querySelector('[data-kv-' + nokkel + ']');
        if (mal) mal.textContent = svar[nokkel] || '—';
      });

      var tekst = [
        'Henvendelse fra ' + svar.navn,
        'Rettsområde: ' + svar.omrade,
        'Kontor: ' + svar.kontor,
        'Telefon: ' + svar.telefon,
        'E-post: ' + svar.epost,
        '',
        svar.beskrivelse,
        '',
        'Referanse: ' + referanse
      ].join('\r\n');

      var epostlenke = form.querySelector('[data-kv-mailto]');
      if (epostlenke) {
        epostlenke.href = 'mailto:post@advokathegg.no?subject=' +
          encodeURIComponent('Henvendelse – ' + svar.omrade) +
          '&body=' + encodeURIComponent(tekst);
      }

      steg.forEach(function (element) {
        element.hidden = true;
      });
      kvittering.hidden = false;
      framdriftFyll.style.width = '100%';
      stegtekst.textContent = 'Kvittering';

      var tittel = form.querySelector('[data-kvittering-tittel]');
      if (tittel) tittel.focus();
    };

    var nullstill = function () {
      form.reset();
      ['omrade', 'navn', 'epost', 'telefon', 'beskrivelse'].forEach(fjernFeil);
      visSteg(0, true);
    };

    form.addEventListener('click', function (e) {
      var neste = e.target.closest('[data-neste]');
      var tilbake = e.target.closest('[data-tilbake]');
      var ny = e.target.closest('[data-ny]');

      if (neste) {
        var fra = steg.indexOf(neste.closest('.steg'));
        if (gyldigSteg(fra)) {
          if (fra === 1) lesSvar();
          visSteg(fra + 1, true);
        }
        return;
      }

      if (tilbake) {
        var til = steg.indexOf(tilbake.closest('.steg'));
        visSteg(Math.max(0, til - 1), true);
        return;
      }

      if (ny) nullstill();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!gyldigSteg(0)) {
        visSteg(0, false);
        return;
      }
      if (!gyldigSteg(1)) {
        visSteg(1, false);
        return;
      }

      visKvittering();
    });

    var ryddPaaEndring = function (e) {
      var nokkel = e.target.id;
      if (nokkel && feil[nokkel]) fjernFeil(nokkel);
    };

    form.addEventListener('input', ryddPaaEndring);
    form.addEventListener('change', ryddPaaEndring);
  }
})();
