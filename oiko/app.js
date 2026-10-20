/*
  OIKO AS — demoens ene interaksjon: brief med kvittering.
  Alt skjer i nettleseren. Ingenting sendes, ingenting lagres; kvitteringen er
  et sammendrag brukeren selv sender videre på e-post.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var erMobil = function () {
      return window.matchMedia('(max-width: 900px)').matches;
    };

    if (erMobil()) {
      nav.hidden = true;
    }

    toggle.addEventListener('click', function () {
      var apen = nav.hidden;
      nav.hidden = !apen;
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && erMobil()) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne menyen');
      }
    });

    window.addEventListener('resize', function () {
      if (!erMobil()) {
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ---------- Innlasting: myk visning ---------- */

  var reveal = document.querySelectorAll('.reveal');

  if (reveal.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Brief med kvittering ---------- */

  var form = document.getElementById('brief-form');
  var kvitt = document.getElementById('kvitt');

  if (!form || !kvitt) {
    return;
  }

  var paneler = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var prikker = Array.prototype.slice.call(document.querySelectorAll('.progress__item'));
  var feilEl = document.getElementById('brief-feil');
  var forrige = document.getElementById('brief-forrige');
  var neste = document.getElementById('brief-neste');
  var send = document.getElementById('brief-send');
  var steg = 0;

  var EPOST = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function visFeil(melding) {
    feilEl.textContent = melding || '';
  }

  function visSteg(n) {
    steg = n;

    paneler.forEach(function (panel, i) {
      panel.hidden = i !== n;
    });

    prikker.forEach(function (prikk, i) {
      prikk.classList.toggle('is-active', i === n);
      prikk.classList.toggle('is-done', i < n);
    });

    forrige.hidden = n === 0;
    neste.hidden = n === paneler.length - 1;
    send.hidden = n !== paneler.length - 1;

    visFeil('');
  }

  function valgteBehov() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="behov"]:checked'))
      .map(function (el) { return el.value; });
  }

  function valgtRadio(navn) {
    var el = form.querySelector('input[name="' + navn + '"]:checked');
    return el ? el.value : '';
  }

  function merkFelt(id, feil) {
    var felt = document.getElementById(id);
    if (!felt) {
      return;
    }
    var gruppe = felt.closest('.felt');
    if (gruppe) {
      gruppe.classList.toggle('felt--feil', !!feil);
    }
  }

  function sjekkSteg(n) {
    var ok = true;

    if (n === 0) {
      if (valgteBehov().length === 0) {
        visFeil('Velg minst ett område, så går vi videre.');
        ok = false;
      }
    }

    if (n === 1) {
      if (!valgtRadio('maal')) {
        visFeil('Velg hva løsningen skal gjøre.');
        ok = false;
      } else if (!document.getElementById('tid').value) {
        visFeil('Velg en tidshorisont.');
        ok = false;
      }
    }

    if (n === 2) {
      var navn = document.getElementById('navn');
      var epost = document.getElementById('epost');

      merkFelt('navn', !navn.value.trim());
      merkFelt('epost', !EPOST.test(epost.value.trim()));

      if (!navn.value.trim()) {
        visFeil('Fyll inn navn eller firma.');
        ok = false;
      } else if (!EPOST.test(epost.value.trim())) {
        visFeil('Sjekk e-postadressen – den ser ikke riktig ut.');
        ok = false;
      }
    }

    return ok;
  }

  neste.addEventListener('click', function () {
    if (!sjekkSteg(steg)) {
      return;
    }
    if (steg < paneler.length - 1) {
      visSteg(steg + 1);
      var legend = paneler[steg].querySelector('legend');
      if (legend) {
        legend.setAttribute('tabindex', '-1');
        legend.focus({ preventScroll: true });
      }
    }
  });

  forrige.addEventListener('click', function () {
    if (steg > 0) {
      visSteg(steg - 1);
    }
  });

  function lagReferanse() {
    var aar = new Date().getFullYear();
    var tall = 1000 + Math.floor(Math.random() * 9000);
    return 'OIKO-' + aar + '-' + tall;
  }

  function sammendrag() {
    var behov = valgteBehov();
    var navn = document.getElementById('navn').value.trim();
    var epost = document.getElementById('epost').value.trim();
    var tlf = document.getElementById('tlf').value.trim();
    var kommentar = document.getElementById('kommentar').value.trim();

    return [
      { navn: 'Trenger', verdi: behov.join(', ') },
      { navn: 'Mål', verdi: valgtRadio('maal') },
      { navn: 'Tidshorisont', verdi: document.getElementById('tid').value },
      { navn: 'Navn', verdi: navn },
      { navn: 'E-post', verdi: epost },
      { navn: 'Telefon', verdi: tlf || 'Ikke oppgitt' },
      { navn: 'Kommentar', verdi: kommentar || 'Ikke oppgitt' }
    ];
  }

  function skrivKvittering() {
    var linjer = sammendrag();
    var referanse = lagReferanse();
    var liste = document.getElementById('kvitt-liste');

    liste.textContent = '';

    linjer.forEach(function (linje) {
      var rad = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = linje.navn;
      dd.textContent = linje.verdi;
      rad.appendChild(dt);
      rad.appendChild(dd);
      liste.appendChild(rad);
    });

    document.getElementById('kvitt-ref').textContent = referanse;

    var emne = 'Brief ' + referanse + ' – ' + linjer[0].verdi;
    var kropp = 'Referanse: ' + referanse + '\n\n' + linjer.map(function (linje) {
      return linje.navn + ': ' + linje.verdi;
    }).join('\n') + '\n\nSendt fra oiko.no';

    document.getElementById('kvitt-mail').href =
      'mailto:hei@oiko.no?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp);

    form.hidden = true;
    kvitt.hidden = false;

    var ref = document.getElementById('kvitt-ref');
    ref.setAttribute('tabindex', '-1');
    ref.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sjekkSteg(2)) {
      skrivKvittering();
    }
  });

  var kopier = document.getElementById('kvitt-kopier');

  kopier.addEventListener('click', function () {
    var tekst = document.getElementById('kvitt-ref').textContent + '\n' +
      sammendrag().map(function (linje) {
        return linje.navn + ': ' + linje.verdi;
      }).join('\n');

    var gi = function () {
      kopier.textContent = 'Kopiert';
      window.setTimeout(function () { kopier.textContent = 'Kopier sammendrag'; }, 2200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(gi, function () { gi(); });
    } else {
      gi();
    }
  });

  document.getElementById('kvitt-ny').addEventListener('click', function () {
    form.reset();
    kvitt.hidden = true;
    form.hidden = false;
    visSteg(0);
  });

  visSteg(0);
})();
