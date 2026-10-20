/* Murmestrene Knudsen & Olsen — menneske, ikke maskin.
   Ingen avhengigheter, ingen sporing, ingen backend. Befaringsforespørselen
   bygges lokalt i nettleseren og sendes først når brukeren selv trykker send
   i e-postprogrammet. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apner = nav.hasAttribute('hidden');
      if (apner) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(apner));
      toggle.setAttribute('aria-label', apner ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (hendelse) {
      if (!hendelse.target.closest('a')) return;
      if (!window.matchMedia('(max-width: 900px)').matches) return;
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne meny');
    });
  }

  /* ---------- Rolig innkomst ---------- */
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var elementer = document.querySelectorAll('.reveal');

  if (redusert || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(elementer, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          io.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(elementer, function (el) { io.observe(el); });
  }

  /* ---------- Befaring i tre steg ---------- */
  var rot = document.querySelector('[data-befaring]');
  if (!rot) return;

  var MOTTAKER = 'olsen@mko.no';

  var stegene = Array.prototype.slice.call(rot.querySelectorAll('[data-steg]'));
  var punkter = Array.prototype.slice.call(document.querySelectorAll('[data-steg-punkt]'));
  var feilEl = rot.querySelector('[data-feil]');
  var kvittering = rot.querySelector('[data-kvittering]');
  var kvTittel = rot.querySelector('[data-kvittering-tittel]');
  var kvListe = rot.querySelector('[data-kvittering-liste]');
  var sendLenke = rot.querySelector('[data-send-epost]');
  var kopierKnapp = rot.querySelector('[data-kopier]');
  var chips = Array.prototype.slice.call(rot.querySelectorAll('.chip'));
  var omrade = rot.querySelector('#omrade');
  var naar = rot.querySelector('#naar');
  var notat = rot.querySelector('#notat');
  var navn = rot.querySelector('#navn');
  var telefon = rot.querySelector('#telefon');
  var epost = rot.querySelector('#epost');

  var aktivtSteg = 1;
  var kvitteringTekst = '';

  function valgte() {
    return chips
      .filter(function (chip) { return chip.getAttribute('aria-pressed') === 'true'; })
      .map(function (chip) { return chip.getAttribute('data-tjeneste'); });
  }

  function visFeil(melding) {
    if (!feilEl) return;
    feilEl.textContent = melding;
    feilEl.hidden = false;
  }

  function skjulFeil() {
    if (!feilEl) return;
    feilEl.hidden = true;
    feilEl.textContent = '';
  }

  function visSteg(nummer) {
    aktivtSteg = nummer;
    stegene.forEach(function (steg) {
      steg.hidden = Number(steg.getAttribute('data-steg')) !== nummer;
    });
    punkter.forEach(function (punkt) {
      var nr = Number(punkt.getAttribute('data-steg-punkt'));
      punkt.classList.toggle('er-aktiv', nr === nummer);
      punkt.classList.toggle('er-ferdig', nr < nummer);
      if (nr === nummer) {
        punkt.setAttribute('aria-current', 'step');
      } else {
        punkt.removeAttribute('aria-current');
      }
    });
    skjulFeil();

    var synlig = stegene.filter(function (steg) { return !steg.hidden; })[0];
    if (!synlig) return;
    var fokus = synlig.querySelector('select, input, textarea, .chip');
    if (fokus) {
      try { fokus.focus({ preventScroll: true }); } catch (feil) { fokus.focus(); }
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var trykket = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', trykket ? 'false' : 'true');
      skjulFeil();
    });
  });

  function saksnummer() {
    var naa = new Date();
    var dato = String(naa.getFullYear()).slice(2) +
      String(naa.getMonth() + 1).padStart(2, '0') +
      String(naa.getDate()).padStart(2, '0');
    var tilfeldig = String(Math.floor(Math.random() * 900) + 100);
    return 'MKO-' + dato + '-' + tilfeldig;
  }

  function lagKvittering() {
    if (navn.value.trim().length < 2) {
      visFeil('Skriv inn navnet ditt, så vi vet hvem vi skal ringe.');
      navn.focus();
      return;
    }

    var tlf = telefon.value.trim();
    var post = epost.value.trim();

    if (!tlf && !post) {
      visFeil('Legg igjen telefonnummer eller e-post, ellers får vi ikke tak i deg.');
      telefon.focus();
      return;
    }

    if (post && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(post)) {
      visFeil('E-postadressen ser ikke helt riktig ut. Sjekk den en gang til.');
      epost.focus();
      return;
    }

    var tjenester = valgte();
    var nr = saksnummer();
    var rader = [
      ['Tjenester', tjenester.join(', ')],
      ['Område', omrade.value],
      ['Tidspunkt', naar.value]
    ];

    if (notat.value.trim()) rader.push(['Om jobben', notat.value.trim()]);
    rader.push(['Navn', navn.value.trim()]);
    if (tlf) rader.push(['Telefon', tlf]);
    if (post) rader.push(['E-post', post]);
    rader.push(['Saksnr.', nr]);

    kvListe.innerHTML = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      kvListe.appendChild(dt);
      kvListe.appendChild(dd);
    });

    kvitteringTekst = 'Befaring hos Murmestrene Knudsen & Olsen\n' +
      rader.map(function (rad) { return rad[0] + ': ' + rad[1]; }).join('\n');

    kvTittel.textContent = 'Saksnr. ' + nr;

    sendLenke.setAttribute(
      'href',
      'mailto:' + MOTTAKER +
        '?subject=' + encodeURIComponent('Befaring ' + nr + ' — ' + tjenester.join(', ')) +
        '&body=' + encodeURIComponent(kvitteringTekst)
    );

    stegene.forEach(function (steg) { steg.hidden = true; });
    punkter.forEach(function (punkt) {
      punkt.classList.remove('er-aktiv');
      punkt.classList.add('er-ferdig');
      punkt.removeAttribute('aria-current');
    });

    skjulFeil();
    kvittering.hidden = false;
    kvTittel.setAttribute('tabindex', '-1');
    try { kvTittel.focus({ preventScroll: true }); } catch (feil) { kvTittel.focus(); }
  }

  function markerKopiert() {
    kopierKnapp.textContent = 'Kopiert';
    window.setTimeout(function () {
      kopierKnapp.textContent = 'Kopier sammendrag';
    }, 2400);
  }

  function kopierNodlosning() {
    var felt = document.createElement('textarea');
    felt.value = kvitteringTekst;
    felt.setAttribute('readonly', 'readonly');
    felt.style.position = 'fixed';
    felt.style.top = '-1000px';
    document.body.appendChild(felt);
    felt.select();
    try { document.execCommand('copy'); } catch (feil) { /* ignoreres */ }
    document.body.removeChild(felt);
    markerKopiert();
  }

  function kopier() {
    if (!kvitteringTekst) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(kvitteringTekst).then(markerKopiert, kopierNodlosning);
    } else {
      kopierNodlosning();
    }
  }

  function startPaNytt() {
    chips.forEach(function (chip) { chip.setAttribute('aria-pressed', 'false'); });
    omrade.value = '';
    naar.value = '';
    notat.value = '';
    navn.value = '';
    telefon.value = '';
    epost.value = '';
    kvitteringTekst = '';
    kvListe.innerHTML = '';
    kvittering.hidden = true;
    kopierKnapp.textContent = 'Kopier sammendrag';
    visSteg(1);
  }

  rot.addEventListener('click', function (hendelse) {
    var knapp = hendelse.target.closest ? hendelse.target.closest('button') : null;
    if (!knapp || !rot.contains(knapp)) return;

    if (knapp.hasAttribute('data-neste')) {
      if (aktivtSteg === 1) {
        if (valgte().length === 0) {
          visFeil('Velg minst én tjeneste, så vet vi hva befaringen gjelder.');
          return;
        }
        visSteg(2);
        return;
      }
      if (aktivtSteg === 2) {
        if (!omrade.value) {
          visFeil('Velg hvilket område oppdraget ligger i.');
          omrade.focus();
          return;
        }
        if (!naar.value) {
          visFeil('Velg når det passer med befaring.');
          naar.focus();
          return;
        }
        visSteg(3);
        return;
      }
      return;
    }

    if (knapp.hasAttribute('data-tilbake')) {
      visSteg(Math.max(1, aktivtSteg - 1));
      return;
    }

    if (knapp.hasAttribute('data-lag')) {
      lagKvittering();
      return;
    }

    if (knapp.hasAttribute('data-kopier')) {
      kopier();
      return;
    }

    if (knapp.hasAttribute('data-ny')) {
      startPaNytt();
    }
  });

  /* Enter i et tekstfelt går videre, som i et vanlig skjema. */
  rot.addEventListener('keydown', function (hendelse) {
    if (hendelse.key !== 'Enter') return;
    var mal = hendelse.target;
    if (!mal || mal.tagName !== 'INPUT') return;
    var steg = mal.closest('.steg');
    if (!steg) return;
    var knapp = steg.querySelector('[data-neste], [data-lag]');
    if (!knapp) return;
    hendelse.preventDefault();
    knapp.click();
  });
})();
