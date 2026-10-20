/* b reel social — oppførsel.
   To ting: mobilmenyen og behovsplanen. Ingenting sendes eller lagres. */
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('meny');

  if (toggle && meny) {
    var erMobil = function () {
      return window.matchMedia('(max-width: 900px)').matches;
    };

    var stengMeny = function () {
      meny.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne menyen');
    };

    var aapneMeny = function () {
      meny.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Lukk menyen');
    };

    if (erMobil()) {
      stengMeny();
    }

    toggle.addEventListener('click', function () {
      if (meny.hasAttribute('hidden')) {
        aapneMeny();
      } else {
        stengMeny();
      }
    });

    meny.addEventListener('click', function (hendelse) {
      var lenke = hendelse.target.closest ? hendelse.target.closest('a') : null;
      if (lenke && erMobil()) {
        stengMeny();
      }
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !meny.hasAttribute('hidden')) {
        stengMeny();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (!erMobil()) {
        meny.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Behovsplan ---------------- */

  var skjema = document.getElementById('behovsplan');
  if (!skjema) {
    return;
  }

  var stegEls = Array.prototype.slice.call(skjema.querySelectorAll('.steg'));
  var stegtekst = document.getElementById('stegtekst');
  var prikker = Array.prototype.slice.call(document.querySelectorAll('.plan__prikker li'));
  var tilbake = document.getElementById('tilbake');
  var videre = document.getElementById('videre');
  var fullfor = document.getElementById('fullfor');
  var kort = document.querySelector('.plan__kort');
  var topp = document.querySelector('.plan__topp');
  var kvittering = document.getElementById('kvittering');
  var kvitteringListe = document.getElementById('kvittering-liste');
  var kvitteringRef = document.getElementById('kvittering-referanse');
  var sendLenke = document.getElementById('send-lenke');
  var nyPlan = document.getElementById('ny-plan');
  var navnFelt = document.getElementById('navn');
  var bedriftFelt = document.getElementById('bedrift');
  var epostFelt = document.getElementById('epost');

  var steg = 0;
  var harKlikket = false;
  var antallSteg = stegEls.length;

  function hentVerdi(navn) {
    var valgt = skjema.querySelector('input[name="' + navn + '"]:checked');
    return valgt ? valgt.value : '';
  }

  function hentInfo(navn) {
    var valgt = skjema.querySelector('input[name="' + navn + '"]:checked');
    return valgt ? valgt.getAttribute('data-info') || '' : '';
  }

  function skjulFeil() {
    Array.prototype.forEach.call(skjema.querySelectorAll('.feilmelding'), function (el) {
      el.hidden = true;
    });
  }

  function visFeil(nummer) {
    var el = skjema.querySelector('.feilmelding[data-feil="' + nummer + '"]');
    if (el) {
      el.hidden = false;
    }
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function stegErGyldig() {
    if (steg === 0) {
      return hentVerdi('tjeneste') !== '';
    }
    if (steg === 1) {
      return hentVerdi('kanaler') !== '' && hentVerdi('frekvens') !== '';
    }
    var navn = navnFelt.value.trim();
    var bedrift = bedriftFelt.value.trim();
    var epost = epostFelt.value.trim();
    return navn.length >= 2 && bedrift.length >= 2 && gyldigEpost(epost);
  }

  function visSteg(neste) {
    steg = neste;
    stegEls.forEach(function (el, i) {
      el.hidden = i !== steg;
    });
    prikker.forEach(function (el, i) {
      el.classList.toggle('er-aktiv', i <= steg);
    });
    stegtekst.textContent = 'Steg ' + (steg + 1) + ' av ' + antallSteg;
    tilbake.hidden = steg === 0;
    videre.hidden = steg === antallSteg - 1;
    fullfor.hidden = steg !== antallSteg - 1;
    skjulFeil();
    /* Fokus flyttes først når brukeren selv bytter steg — ikke ved lasting. */
    if (harKlikket) {
      var overskrift = stegEls[steg].querySelector('.felt__legend, .felt__label');
      if (overskrift) {
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus({ preventScroll: true });
      }
    }
    harKlikket = true;
  }

  videre.addEventListener('click', function () {
    if (!stegErGyldig()) {
      visFeil(steg + 1);
      return;
    }
    visSteg(Math.min(steg + 1, antallSteg - 1));
  });

  tilbake.addEventListener('click', function () {
    visSteg(Math.max(steg - 1, 0));
  });

  skjema.addEventListener('change', function () {
    skjulFeil();
  });

  function lagKvittering() {
    var tjeneste = hentVerdi('tjeneste');
    var info = hentInfo('tjeneste');
    var kanaler = hentVerdi('kanaler');
    var frekvens = hentVerdi('frekvens');
    var navn = navnFelt.value.trim();
    var bedrift = bedriftFelt.value.trim();
    var epost = epostFelt.value.trim();
    var referanse = 'BRS-' + (1000 + Math.floor(Math.random() * 9000));

    var rader = [
      ['Referanse', referanse],
      ['Tjeneste', tjeneste],
      ['Pris', info],
      ['Kanaler', kanaler],
      ['Frekvens', frekvens],
      ['Navn', navn],
      ['Bedrift', bedrift],
      ['E-post', epost]
    ];

    kvitteringListe.innerHTML = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      div.className = 'kvittering__rad';
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      kvitteringListe.appendChild(div);
    });

    kvitteringRef.textContent = referanse;

    var emne = 'Behovsplan ' + referanse + ' – ' + bedrift;
    var kropp = [
      'Hei Malin,',
      '',
      'Jeg har satt sammen en behovsplan på breelsocial.no:',
      '',
      'Referanse: ' + referanse,
      'Tjeneste: ' + tjeneste,
      'Pris: ' + info,
      'Kanaler: ' + kanaler,
      'Frekvens: ' + frekvens,
      '',
      'Navn: ' + navn,
      'Bedrift: ' + bedrift,
      'E-post: ' + epost,
      '',
      'Kan vi ta en uforpliktende prat?'
    ].join('\n');

    sendLenke.href = 'mailto:malin@breelsocial.no?subject=' +
      encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

    skjema.hidden = true;
    topp.hidden = true;
    kvittering.hidden = false;
    kvittering.setAttribute('tabindex', '-1');
    kvittering.focus({ preventScroll: true });
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (!stegErGyldig()) {
      visFeil(steg + 1);
      return;
    }
    lagKvittering();
  });

  nyPlan.addEventListener('click', function () {
    skjema.reset();
    skjema.hidden = false;
    topp.hidden = false;
    kvittering.hidden = true;
    visSteg(0);
    if (kort) {
      kort.scrollIntoView({ block: 'nearest' });
    }
  });

  visSteg(0);
}());
