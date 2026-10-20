/*
  Smart Norway — demoens ene interaksjon, pluss meny og innstikk.

  «Ta en kaffe» er en tre-stegs henvendelse som bygger et e-postutkast i
  nettleseren. Ingenting sendes og ingenting lagres: kvitteringen viser hva
  som ble laget, og brukeren velger selv om e-postklienten skal åpnes.
*/

(function () {
  'use strict';

  var doc = document;

  /* ---------- Meny ---------- */

  var nav = doc.getElementById('nav');
  var toggle = doc.querySelector('.nav-toggle');

  function erMobil() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function settMeny(open) {
    if (!nav || !toggle) return;
    nav.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Lukk menyen' : 'Åpne menyen');
  }

  if (nav && toggle) {
    nav.hidden = erMobil();

    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && erMobil()) settMeny(false);
    });

    var varMobil = erMobil();
    window.addEventListener('resize', function () {
      var naMobil = erMobil();
      if (naMobil === varMobil) return;
      varMobil = naMobil;
      nav.hidden = naMobil;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne menyen');
    });
  }

  /* ---------- Innstikk ---------- */

  var innstikk = doc.querySelectorAll('.reveal');
  if (innstikk.length) {
    if (!('IntersectionObserver' in window)) {
      innstikk.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observator = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (!oppforing.isIntersecting) return;
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      innstikk.forEach(function (el) { observator.observe(el); });
    }
  }

  /* ---------- «Ta en kaffe» ---------- */

  var form = doc.getElementById('kaffe-form');
  if (!form) return;

  var stegEls = Array.prototype.slice.call(form.querySelectorAll('.steg'));
  var punkter = Array.prototype.slice.call(doc.querySelectorAll('#stegliste li'));
  var btnNeste = doc.getElementById('neste');
  var btnTilbake = doc.getElementById('tilbake');
  var btnLag = doc.getElementById('lag');
  var feilEl = doc.getElementById('feil');
  var sammendrag = doc.getElementById('sammendrag');
  var kvittering = doc.getElementById('kvittering');
  var stempel = doc.getElementById('stempel');
  var liste = doc.getElementById('kvittering-liste');
  var apne = doc.getElementById('apne');
  var kopier = doc.getElementById('kopier');
  var paanytt = doc.getElementById('paanytt');
  var epostFelt = doc.getElementById('epost');
  var meldingFelt = doc.getElementById('melding');
  var personInputs = Array.prototype.slice.call(form.querySelectorAll('input[name="person"]'));
  var emneInputs = Array.prototype.slice.call(form.querySelectorAll('input[name="emne"]'));
  var steg = 1;
  var utkast = null;

  function valgt(gruppe) {
    for (var i = 0; i < gruppe.length; i++) {
      if (gruppe[i].checked) return gruppe[i];
    }
    return null;
  }

  function skjulFeil() {
    feilEl.hidden = true;
    feilEl.textContent = '';
    if (epostFelt) epostFelt.removeAttribute('aria-invalid');
  }

  function visFeil(melding, felt) {
    feilEl.textContent = melding;
    feilEl.hidden = false;
    if (felt) {
      felt.setAttribute('aria-invalid', 'true');
      felt.focus();
    }
  }

  function oppdaterSammendrag() {
    var person = valgt(personInputs);
    var emne = valgt(emneInputs);
    var melding = meldingFelt.value.trim();

    sammendrag.textContent = '';
    [
      ['Til', person ? person.dataset.navn + ' (' + person.dataset.epost + ')' : 'Ikke valgt'],
      ['Gjelder', emne ? emne.value : 'Ikke valgt'],
      ['Melding', melding ? (melding.length > 160 ? melding.slice(0, 160) + '…' : melding) : 'Ikke skrevet ennå']
    ].forEach(function (rad) {
      var p = doc.createElement('p');
      var strong = doc.createElement('strong');
      strong.textContent = rad[0] + ': ';
      p.appendChild(strong);
      p.appendChild(doc.createTextNode(rad[1]));
      sammendrag.appendChild(p);
    });
  }

  function visSteg(n, flyttFokus) {
    steg = n;

    stegEls.forEach(function (el) {
      var erHer = Number(el.dataset.steg) === n;
      el.hidden = !erHer;
      el.classList.toggle('is-active', erHer);
    });

    punkter.forEach(function (li) {
      var nummer = Number(li.dataset.steg);
      li.classList.toggle('is-active', nummer === n);
      li.classList.toggle('is-done', nummer < n);
    });

    btnTilbake.hidden = n === 1;
    btnNeste.hidden = n === 3;
    btnLag.hidden = n !== 3;
    skjulFeil();

    if (n === 3) oppdaterSammendrag();

    if (!flyttFokus) return;
    var nyttSteg = stegEls[n - 1];
    var fokus =
      nyttSteg.querySelector('input:checked') ||
      nyttSteg.querySelector('input, textarea, button');
    if (fokus) fokus.focus();
  }

  btnNeste.addEventListener('click', function () {
    if (steg < 3) visSteg(steg + 1, true);
  });

  btnTilbake.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1, true);
  });

  form.addEventListener('change', function (event) {
    skjulFeil();
    if (steg === 3) oppdaterSammendrag();
    if (event.target && event.target.name === 'person' && steg === 3) oppdaterSammendrag();
  });

  meldingFelt.addEventListener('input', function () {
    if (steg === 3) oppdaterSammendrag();
  });

  epostFelt.addEventListener('input', skjulFeil);

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(verdi);
  }

  function lagListe(rader) {
    liste.textContent = '';
    rader.forEach(function (rad) {
      var div = doc.createElement('div');
      var dt = doc.createElement('dt');
      var dd = doc.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      liste.appendChild(div);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var epost = epostFelt.value.trim();
    if (!gyldigEpost(epost)) {
      visFeil('Skriv inn en gyldig e-postadresse, så vi vet hvor utkastet skal sendes fra.', epostFelt);
      return;
    }

    var person = valgt(personInputs);
    var emneValg = valgt(emneInputs);
    var melding = meldingFelt.value.trim();
    var navn = person ? person.dataset.navn : 'Smart Norway';
    var til = person ? person.dataset.epost : 'post@smartnorway.no';
    var fornavn = navn.split(' ')[0];
    var gjelder = emneValg ? emneValg.value : 'Henvendelse';
    var emne = 'Ta en kaffe – ' + gjelder;
    var kropp = [
      'Hei ' + fornavn + ',',
      '',
      melding || 'Jeg vil gjerne ta en prat.',
      '',
      'Gjelder: ' + gjelder,
      'Fra: ' + epost
    ].join('\n');

    utkast = { til: til, navn: navn, emne: emne, kropp: kropp, fra: epost, gjelder: gjelder };

    stempel.textContent = new Date().toLocaleString('nb-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    lagListe([
      ['Til', navn + ' · ' + til],
      ['Emne', emne],
      ['Gjelder', gjelder],
      ['Fra', epost]
    ]);

    apne.href = 'mailto:' + til +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp);

    form.hidden = true;
    kvittering.hidden = false;
    kvittering.focus();
  });

  function merkeKopiert(tekst) {
    kopier.textContent = tekst;
    window.setTimeout(function () { kopier.textContent = 'Kopier teksten'; }, 2600);
  }

  kopier.addEventListener('click', function () {
    if (!utkast) return;
    var tekst = 'Til: ' + utkast.til + '\nEmne: ' + utkast.emne + '\n\n' + utkast.kropp;

    function medUtvalg() {
      var ta = doc.createElement('textarea');
      ta.value = tekst;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (error) { ok = false; }
      doc.body.removeChild(ta);
      merkeKopiert(ok ? 'Kopiert' : 'Merk teksten og kopier selv');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function () {
        merkeKopiert('Kopiert');
      }).catch(medUtvalg);
    } else {
      medUtvalg();
    }
  });

  paanytt.addEventListener('click', function () {
    kvittering.hidden = true;
    form.hidden = false;
    form.reset();
    utkast = null;
    visSteg(1, true);
  });

  visSteg(1, false);
})();
