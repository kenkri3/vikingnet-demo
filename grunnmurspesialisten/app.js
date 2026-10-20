/*
  Grunnmurspesialisten AS — små, ærlige skript.
  Ingen avhengigheter, ingen sporing, ingen backend. Forespørselen er en
  skisse: den valideres i nettleseren og sendes først når du selv velger e-post.
*/
(function () {
  'use strict';

  var doc = document;

  // Uten denne klassen er alt innhold synlig, også om et skript feiler.
  doc.documentElement.classList.add('js');

  /* --- Årstall i footer -------------------------------------------------- */
  var aar = doc.querySelector('[data-year]');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* --- Mobilmeny --------------------------------------------------------- */
  var toggle = doc.querySelector('.nav-toggle');
  var meny = doc.getElementById('meny');
  var smal = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;

  function settMeny() {
    if (!toggle || !meny) return;
    var open = toggle.getAttribute('aria-expanded') === 'true';
    meny.hidden = !!(smal && smal.matches) && !open;
  }

  if (toggle && meny) {
    settMeny();

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      settMeny();
    });

    meny.addEventListener('click', function (hendelse) {
      var mal = hendelse.target;
      if (mal && mal.closest && mal.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        settMeny();
      }
    });

    if (smal) {
      if (smal.addEventListener) smal.addEventListener('change', settMeny);
      else if (smal.addListener) smal.addListener(settMeny);
    }
  }

  /* --- Forespørsel i tre steg -------------------------------------------- */
  var form = doc.querySelector('[data-foresporsel]');
  if (!form) return;

  var SISTE = 3;
  var steg = 1;
  var valgt = [];
  var referanse = '';
  var sisteRader = [];

  var panel = function (nr) { return form.querySelector('[data-panel="' + nr + '"]'); };
  var punkter = Array.prototype.slice.call(doc.querySelectorAll('[data-punkt]'));
  var fliser = Array.prototype.slice.call(form.querySelectorAll('[data-flis]'));
  var feilboks = form.querySelector('[data-feil]');
  var tilbake = form.querySelector('[data-tilbake]');
  var primar = form.querySelector('[data-primar]');
  var stegviser = doc.querySelector('.steg');
  var kvittering = doc.querySelector('[data-kvittering]');
  var kvitteringTittel = doc.querySelector('[data-kvittering-tittel]');
  var referanseFelt = doc.querySelector('[data-referanse]');
  var ePostLenke = doc.querySelector('[data-epost]');
  var kopierKnapp = doc.querySelector('[data-kopier]');
  var nyKnapp = doc.querySelector('[data-ny]');
  var oppsummering = doc.querySelector('[data-sammendrag]');
  var kvitteringListe = doc.querySelector('[data-sammendrag-kvittering]');

  function verdi(id) {
    var el = doc.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function felt(id) {
    return doc.getElementById(id);
  }

  function visFeil(meldinger) {
    feilboks.innerHTML = '';
    var sterk = doc.createElement('strong');
    sterk.textContent = meldinger.length === 1 ? 'Én ting mangler:' : 'Noen felt mangler:';
    feilboks.appendChild(sterk);
    var liste = doc.createElement('ul');
    meldinger.forEach(function (tekst) {
      var li = doc.createElement('li');
      li.textContent = tekst;
      liste.appendChild(li);
    });
    feilboks.appendChild(liste);
    feilboks.hidden = false;
    feilboks.setAttribute('tabindex', '-1');
    feilboks.focus();
  }

  function valider(nr) {
    var feil = [];
    var navnFelt = felt('navn');
    var epostFelt = felt('epost');
    if (navnFelt) navnFelt.removeAttribute('aria-invalid');
    if (epostFelt) epostFelt.removeAttribute('aria-invalid');

    if (nr === 1 && valgt.length === 0) {
      feil.push('Velg minst én leveranse.');
    }

    if (nr === 2) {
      if (verdi('navn').length < 2) {
        feil.push('Skriv navnet ditt.');
        if (navnFelt) navnFelt.setAttribute('aria-invalid', 'true');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi('epost'))) {
        feil.push('Skriv en gyldig e-postadresse, for eksempel navn@firma.no.');
        if (epostFelt) epostFelt.setAttribute('aria-invalid', 'true');
      }
    }

    return feil;
  }

  function visSteg(nr, flyttFokus) {
    steg = nr;

    for (var i = 1; i <= SISTE; i++) {
      var p = panel(i);
      if (p) p.hidden = i !== nr;
    }

    punkter.forEach(function (punkt) {
      var tall = Number(punkt.getAttribute('data-punkt'));
      punkt.classList.toggle('is-aktiv', tall === nr);
      punkt.classList.toggle('is-ferdig', tall < nr);
    });

    tilbake.hidden = nr === 1;
    primar.textContent = nr === SISTE ? 'Send forespørsel' : 'Neste';
    feilboks.hidden = true;
    feilboks.innerHTML = '';

    if (flyttFokus) {
      var overskrift = panel(nr).querySelector('h3');
      if (overskrift) {
        try {
          overskrift.focus({ preventScroll: false });
        } catch (error) {
          overskrift.focus();
        }
      }
    }
  }

  function sammendrag() {
    var rader = [];
    rader.push(['Gjelder', valgt.join(', ')]);
    if (verdi('sted')) rader.push(['Sted', verdi('sted')]);
    if (verdi('oppstart')) rader.push(['Ønsket oppstart', verdi('oppstart')]);
    rader.push(['Navn', verdi('navn')]);
    rader.push(['E-post', verdi('epost')]);
    if (verdi('telefon')) rader.push(['Telefon', verdi('telefon')]);
    if (verdi('firma')) rader.push(['Firma', verdi('firma')]);
    if (verdi('melding')) rader.push(['Om prosjektet', verdi('melding')]);
    return rader;
  }

  function fyllListe(maal, rader) {
    maal.innerHTML = '';
    rader.forEach(function (rad) {
      var radEl = doc.createElement('div');
      var dt = doc.createElement('dt');
      var dd = doc.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      radEl.appendChild(dt);
      radEl.appendChild(dd);
      maal.appendChild(radEl);
    });
  }

  function lagReferanse() {
    var tall = Math.floor(Math.random() * 900) + 100;
    return 'GMS-' + new Date().getFullYear() + '-' + tall;
  }

  function send() {
    sisteRader = sammendrag();
    referanse = lagReferanse();

    fyllListe(kvitteringListe, sisteRader);
    referanseFelt.textContent = referanse;

    var emne = 'Forespørsel fra nettsiden — ' + valgt.join(' og ');
    var kropp = sisteRader.map(function (rad) {
      return rad[0] + ': ' + rad[1];
    }).join('\n');
    ePostLenke.setAttribute(
      'href',
      'mailto:post@grunnmurspesialisten.no'
        + '?subject=' + encodeURIComponent(emne)
        + '&body=' + encodeURIComponent(kropp + '\n\nReferanse: ' + referanse)
    );

    form.hidden = true;
    stegviser.hidden = true;
    kvittering.hidden = false;
    if (kvitteringTittel) kvitteringTittel.focus();
  }

  function nullstill() {
    form.reset();
    valgt = [];
    fliser.forEach(function (flis) {
      flis.setAttribute('aria-pressed', 'false');
    });
    ['navn', 'epost'].forEach(function (id) {
      var el = felt(id);
      if (el) el.removeAttribute('aria-invalid');
    });
    if (oppsummering) oppsummering.innerHTML = '';
    form.hidden = false;
    stegviser.hidden = false;
    kvittering.hidden = true;
    visSteg(1, true);
  }

  fliser.forEach(function (flis) {
    flis.addEventListener('click', function () {
      var navn = flis.getAttribute('data-flis');
      var indeks = valgt.indexOf(navn);
      if (indeks === -1) {
        valgt.push(navn);
        flis.setAttribute('aria-pressed', 'true');
      } else {
        valgt.splice(indeks, 1);
        flis.setAttribute('aria-pressed', 'false');
      }
    });
  });

  form.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    var feil = valider(steg);
    if (feil.length) {
      visFeil(feil);
      return;
    }

    if (steg < SISTE) {
      if (steg + 1 === SISTE) fyllListe(oppsummering, sammendrag());
      visSteg(steg + 1, true);
      return;
    }

    send();
  });

  tilbake.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1, true);
  });

  ['navn', 'epost'].forEach(function (id) {
    var el = felt(id);
    if (!el) return;
    el.addEventListener('input', function () {
      el.removeAttribute('aria-invalid');
    });
  });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      var tekst = 'Forespørsel ' + referanse + '\n'
        + sisteRader.map(function (rad) { return rad[0] + ': ' + rad[1]; }).join('\n');
      var opprinnelig = 'Kopier sammendrag';

      function svar(melding) {
        kopierKnapp.textContent = melding;
        window.setTimeout(function () {
          kopierKnapp.textContent = opprinnelig;
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          svar('Kopiert');
        }, function () {
          svar('Kunne ikke kopiere');
        });
      } else {
        svar('Kunne ikke kopiere');
      }
    });
  }

  if (nyKnapp) nyKnapp.addEventListener('click', nullstill);

  visSteg(1, false);
})();
