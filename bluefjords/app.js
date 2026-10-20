/*
  BlueFjords — demointeraksjon.
  Forespørselsflyt i fire steg: behov → effekt → kontakt → oppsummering.
  Alt skjer i nettleseren. Ingenting sendes, ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------------- Meny ---------------- */

  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');
  var mobile = window.matchMedia('(max-width: 900px)');

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    nav.hidden = mobile.matches ? !open : false;
  }

  if (toggle && nav) {
    setNav(false);
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && mobile.matches) setNav(false);
    });
    mobile.addEventListener('change', function () {
      setNav(false);
    });
  }

  /* ---------------- Sanntidsstatus for skjermleser ---------------- */

  var live = document.createElement('p');
  live.className = 'visually-hidden';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);

  /* ---------------- Hjelpere ---------------- */

  function tall(verdi) {
    return verdi.toLocaleString('nb-NO');
  }

  function prosent(verdi) {
    var p = (verdi / 15000) * 100;
    if (p < 0.1) return p.toFixed(2).replace('.', ',') + ' %';
    if (p < 1) return p.toFixed(1).replace('.', ',') + ' %';
    return Math.round(p) + ' %';
  }

  /* ---------------- Forespørsel ---------------- */

  var form = document.getElementById('req-form');
  var steps = form ? Array.prototype.slice.call(form.querySelectorAll('.step')) : [];
  var merker = document.getElementById('stegliste')
    ? Array.prototype.slice.call(document.querySelectorAll('#stegliste li'))
    : [];
  var tilbake = document.getElementById('tilbake');
  var neste = document.getElementById('neste');
  var send = document.getElementById('send');
  var kvittering = document.getElementById('kvittering');
  var review = document.getElementById('review');
  var aktiv = 1;

  var kw = document.getElementById('kw');
  var kwUt = document.getElementById('kw-out');
  var kwBar = document.getElementById('kw-bar');
  var kwHint = document.getElementById('kw-hint');
  var oppstart = document.getElementById('oppstart');
  var gjestekontor = document.getElementById('gjestekontor');

  function valgtBehov() {
    var valgt = form.querySelector('input[name="behov"]:checked');
    return valgt ? valgt.value : 'Rackplass';
  }

  function sidepanel() {
    var effekt = kw ? Number(kw.value) : 150;
    var sett = function (navn, tekst) {
      var el = document.querySelector('[data-live="' + navn + '"]');
      if (el) el.textContent = tekst;
    };
    sett('behov', valgtBehov());
    sett('kw', tall(effekt) + ' kW');
    sett('oppstart', oppstart ? oppstart.value : 'Snarest');
    sett('gjestekontor', gjestekontor && gjestekontor.checked ? 'Ja' : 'Nei');
    sett('pct', prosent(effekt));
    var bar = document.querySelector('[data-live="bar"]');
    if (bar) bar.style.width = Math.max(2, Math.min(100, (effekt / 15000) * 100)) + '%';
  }

  function oppdaterEffekt() {
    if (!kw) return;
    var effekt = Number(kw.value);
    var andel = ((effekt - Number(kw.min)) / (Number(kw.max) - Number(kw.min))) * 100;
    kw.style.setProperty('--pct', andel.toFixed(1) + '%');
    if (kwUt) kwUt.textContent = tall(effekt) + ' kW';
    if (kwBar) kwBar.style.width = Math.max(2, (effekt / 15000) * 100) + '%';
    if (kwHint) {
      kwHint.textContent =
        tall(effekt) + ' kW er ' + prosent(effekt) + ' av de 15 000 kW som er tilgjengelig i anlegget.';
    }
    sidepanel();
  }

  /* Avkryssingskort: hold en klasse i takt med input, så stilen ikke
     avhenger av :has() i eldre nettlesere. */
  function synkValg() {
    Array.prototype.forEach.call(form.querySelectorAll('.opt'), function (opt) {
      var input = opt.querySelector('input');
      opt.classList.toggle('is-checked', !!(input && input.checked));
    });
    var check = gjestekontor ? gjestekontor.closest('.check') : null;
    if (check) check.classList.toggle('is-checked', gjestekontor.checked);
  }

  function visSteg(n, flyttFokus) {
    aktiv = n;
    steps.forEach(function (steg) {
      steg.hidden = Number(steg.getAttribute('data-step')) !== n;
    });
    merker.forEach(function (merke) {
      var nummer = Number(merke.getAttribute('data-steg'));
      merke.classList.toggle('is-done', nummer < n);
      if (nummer === n) {
        merke.setAttribute('aria-current', 'step');
      } else {
        merke.removeAttribute('aria-current');
      }
    });

    if (tilbake) tilbake.hidden = n === 1;
    if (neste) neste.hidden = n === 4;
    if (send) send.hidden = n !== 4;
    if (n === 4) fyllOppsummering();

    var navn = ['behov', 'effekt og oppstart', 'kontakt', 'oppsummering'];
    live.textContent = 'Steg ' + n + ' av 4: ' + navn[n - 1];

    if (flyttFokus !== false) {
      var steg = steps[n - 1];
      if (steg) {
        steg.setAttribute('tabindex', '-1');
        steg.focus({ preventScroll: true });
      }
    }
  }

  function feil(input, melding) {
    if (!input) return;
    input.setAttribute('aria-invalid', 'true');
    var boks = document.getElementById('err-' + input.id);
    if (boks) {
      boks.textContent = melding;
      boks.hidden = false;
    }
  }

  function rensFeil(input) {
    if (!input) return;
    input.removeAttribute('aria-invalid');
    var boks = document.getElementById('err-' + input.id);
    if (boks) boks.hidden = true;
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function valider(n) {
    if (n !== 3) return true;
    var ok = true;
    var navnFelt = document.getElementById('navn');
    var epostFelt = document.getElementById('epost');

    if (!navnFelt.value.trim() || navnFelt.value.trim().length < 2) {
      feil(navnFelt, 'Skriv navnet ditt.');
      ok = false;
    } else {
      rensFeil(navnFelt);
    }

    if (!gyldigEpost(epostFelt.value.trim())) {
      feil(epostFelt, 'Skriv en gyldig e-postadresse, for eksempel navn@firma.no.');
      ok = false;
    } else {
      rensFeil(epostFelt);
    }

    if (!ok) {
      var første = form.querySelector('[aria-invalid="true"]');
      if (første) første.focus({ preventScroll: true });
    }
    return ok;
  }

  function fyllOppsummering() {
    if (!review) return;
    var effekt = Number(kw.value);
    var rader = [
      ['Behov', valgtBehov()],
      ['Effekt', tall(effekt) + ' kW (' + prosent(effekt) + ' av 15 000 kW)'],
      ['Oppstart', oppstart.value],
      ['Gjestekontor', gjestekontor.checked ? 'Ja' : 'Nei'],
      ['Navn', document.getElementById('navn').value.trim()],
      [
        'Virksomhet',
        document.getElementById('firma').value.trim() || 'Ikke oppgitt'
      ],
      ['E-post', document.getElementById('epost').value.trim()],
      ['Telefon', document.getElementById('telefon').value.trim() || 'Ikke oppgitt']
    ];
    review.textContent = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      review.appendChild(div);
    });
  }

  function referanse() {
    var nr = Math.floor(1000 + Math.random() * 9000);
    return 'BF-' + new Date().getFullYear() + '-' + nr;
  }

  function lagKvittering() {
    var effekt = Number(kw.value);
    var navn = document.getElementById('navn').value.trim();
    var epost = document.getElementById('epost').value.trim();
    var firma = document.getElementById('firma').value.trim();
    var telefon = document.getElementById('telefon').value.trim();
    var melding = document.getElementById('melding').value.trim();
    var ref = referanse();

    var innhold = [
      'Behov: ' + valgtBehov(),
      'Effekt: ' + tall(effekt) + ' kW',
      'Oppstart: ' + oppstart.value,
      'Gjestekontor: ' + (gjestekontor.checked ? 'ja' : 'nei'),
      'Navn: ' + navn,
      'Virksomhet: ' + (firma || 'ikke oppgitt'),
      'E-post: ' + epost,
      'Telefon: ' + (telefon || 'ikke oppgitt'),
      'Melding: ' + (melding || 'ingen')
    ];

    var emne = 'Forespørsel om plass ' + ref;
    var kropp = 'Referanse: ' + ref + '\n\n' + innhold.join('\n');
    var postlenke =
      'mailto:edvin@bluefjords.com?subject=' +
      encodeURIComponent(emne) +
      '&body=' +
      encodeURIComponent(kropp);

    kvittering.textContent = '';

    var head = document.createElement('div');
    head.className = 'receipt__head';
    var merke = document.createElement('span');
    merke.className = 'receipt__mark';
    merke.setAttribute('aria-hidden', 'true');
    merke.textContent = '✓';
    var tittel = document.createElement('div');
    var h3 = document.createElement('h3');
    h3.textContent = 'Forespørselen er registrert';
    var sub = document.createElement('p');
    sub.className = 'receipt__sub';
    sub.textContent = 'Takk, ' + navn + '. Slik ser henvendelsen ut.';
    tittel.appendChild(h3);
    tittel.appendChild(sub);
    head.appendChild(merke);
    head.appendChild(tittel);
    kvittering.appendChild(head);

    var refEl = document.createElement('p');
    refEl.className = 'receipt__ref';
    refEl.textContent = ref;
    kvittering.appendChild(refEl);

    var dl = document.createElement('dl');
    dl.className = 'review';
    [
      ['Behov', valgtBehov()],
      ['Effekt', tall(effekt) + ' kW'],
      ['Oppstart', oppstart.value],
      ['E-post', epost]
    ].forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      dl.appendChild(div);
    });
    kvittering.appendChild(dl);

    var note = document.createElement('p');
    note.className = 'receipt__note';
    note.textContent =
      'Denne demoen sender ingenting og lagrer ingenting. I en ekte løsning ville henvendelsen ' +
      'ha gått til edvin@bluefjords.com med referansen ' + ref + ' i emnefeltet, og lagt seg i køen deres med en gang.';
    kvittering.appendChild(note);

    var handlinger = document.createElement('div');
    handlinger.className = 'receipt__actions';

    var a = document.createElement('a');
    a.className = 'btn';
    a.href = postlenke;
    a.textContent = 'Send som e-post';
    handlinger.appendChild(a);

    var ny = document.createElement('button');
    ny.type = 'button';
    ny.className = 'btn btn--ghost';
    ny.textContent = 'Ny forespørsel';
    ny.addEventListener('click', startPåNytt);
    handlinger.appendChild(ny);

    kvittering.appendChild(handlinger);

    form.hidden = true;
    kvittering.hidden = false;
    kvittering.focus({ preventScroll: true });
    kvittering.scrollIntoView({ block: 'center' });
    live.textContent = 'Forespørsel registrert med referanse ' + ref + '.';
  }

  function startPåNytt() {
    form.reset();
    synkValg();
    oppdaterEffekt();
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), rensFeil);
    form.hidden = false;
    kvittering.hidden = true;
    visSteg(1);
  }

  if (form) {
    form.addEventListener('change', function () {
      synkValg();
      sidepanel();
    });

    if (kw) kw.addEventListener('input', oppdaterEffekt);

    if (neste) {
      neste.addEventListener('click', function () {
        if (!valider(aktiv)) return;
        if (aktiv < 4) visSteg(aktiv + 1);
      });
    }

    if (tilbake) {
      tilbake.addEventListener('click', function () {
        if (aktiv > 1) visSteg(aktiv - 1);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!valider(3)) {
        visSteg(3);
        return;
      }
      lagKvittering();
    });

    form.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA' && aktiv < 4) {
        event.preventDefault();
        if (valider(aktiv)) visSteg(aktiv + 1);
      }
    });

    synkValg();
    oppdaterEffekt();
    visSteg(1, false);
  }
})();
