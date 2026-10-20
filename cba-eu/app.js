/*
  CBA Fagformidling — interaksjon uten backend.
  1) Mobilmeny  2) Årstall i footer  3) Behovsregistrering i tre steg med
  kvittering  4) Meldingsskjema med mailto-fallback.
  Ingenting sendes eller lagres: kvitteringen lever bare i nettleseren, og
  e-postknappen åpner brukerens eget e-postprogram.
*/

(function () {
  'use strict';

  var SEGMENTER = {
    bil: {
      navn: 'Bil og mekanisk',
      fag: [
        'Bilmekaniker lett og tung',
        'Bilskadepersonell',
        'Diagnosetekniker',
        'Klargjører og detailer',
        'Dekkarbeider',
        'Kundemottaker',
        'Delelagerpersonell',
        'Teknisk leder'
      ]
    },
    infra: {
      navn: 'Anlegg og industri',
      fag: [
        'Elektriker',
        'Betongarbeider',
        'Maskinfører',
        'Hjelpearbeider',
        'Bas og formann',
        'Tømrer',
        'Byggeleder'
      ]
    },
    entreprise: {
      navn: 'Entreprise (CBA Services)',
      fag: [
        'Klargjøring av kjøretøy',
        'Inspeksjon',
        'Detailing',
        'Rengjøring og vask',
        'Dekkskift',
        'Opplæring',
        'Tømrerarbeid',
        'Husbygg',
        'Prosjektstyring',
        'Oppussing'
      ]
    }
  };

  /* ---------- Mobilmeny ---------- */

  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var smal = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!nav || !toggle) return;
    nav.hidden = !apen;
    toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
    toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
  }

  if (nav && toggle) {
    settMeny(!smal.matches);

    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && smal.matches) settMeny(false);
    });

    var onSmalChange = function () {
      settMeny(!smal.matches);
    };

    if (smal.addEventListener) smal.addEventListener('change', onSmalChange);
    else if (smal.addListener) smal.addListener(onSmalChange);
  }

  /* ---------- Årstall ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Innlastingsanimasjon ---------- */

  var reveal = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveal, function (el) {
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveal, function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Hjelpere ---------- */

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function datoNorsk(verdi) {
    if (!verdi) return 'Ikke oppgitt';
    var deler = verdi.split('-');
    if (deler.length !== 3) return verdi;
    return deler[2] + '.' + deler[1] + '.' + deler[0];
  }

  function erEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function erTelefon(verdi) {
    return String(verdi).replace(/[^0-9]/g, '').length >= 8;
  }

  function iDag() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /* ---------- Behovsregistrering ---------- */

  var skjema = document.querySelector('[data-order]');

  if (skjema) {
    var panelene = skjema.querySelectorAll('[data-panel]');
    var progres = document.querySelectorAll('[data-progress]');
    var neste = skjema.querySelector('[data-next]');
    var tilbake = skjema.querySelector('[data-back]');
    var feilboks = skjema.querySelector('[data-formerror]');
    var segmentKnapper = skjema.querySelectorAll('.seg__btn');
    var faggruppe = skjema.querySelector('[data-faggruppe]');
    var oppstart = skjema.querySelector('[data-oppstart]');
    var kvittering = document.querySelector('[data-receipt]');
    var kvitteringId = document.querySelector('[data-receipt-id]');
    var kvitteringSum = document.querySelector('[data-receipt-sum]');
    var kvitteringMail = document.querySelector('[data-receipt-mail]');
    var kvitteringReset = document.querySelector('[data-receipt-reset]');
    var steg = 1;
    var valgt = '';

    if (oppstart) oppstart.min = iDag();

    function visFeil(melding, felt) {
      if (feilboks) {
        feilboks.textContent = melding;
        feilboks.hidden = false;
      }
      Array.prototype.forEach.call(skjema.querySelectorAll('[aria-invalid="true"]'), function (el) {
        el.removeAttribute('aria-invalid');
      });
      if (felt) {
        felt.setAttribute('aria-invalid', 'true');
        felt.focus();
      }
    }

    function skjulFeil() {
      if (feilboks) {
        feilboks.hidden = true;
        feilboks.textContent = '';
      }
      Array.prototype.forEach.call(skjema.querySelectorAll('[aria-invalid="true"]'), function (el) {
        el.removeAttribute('aria-invalid');
      });
    }

    function visSteg(n) {
      steg = n;
      Array.prototype.forEach.call(panelene, function (panel) {
        panel.hidden = Number(panel.getAttribute('data-panel')) !== n;
      });
      Array.prototype.forEach.call(progres, function (item) {
        var nummer = Number(item.getAttribute('data-progress'));
        item.classList.toggle('is-active', nummer === n);
        item.classList.toggle('is-done', nummer < n);
      });
      if (tilbake) tilbake.hidden = n === 1;
      if (neste) neste.textContent = n === 3 ? 'Send behov' : 'Neste';
      skjulFeil();
    }

    function fyllFaggrupper(nokkel) {
      if (!faggruppe) return;
      var data = SEGMENTER[nokkel];
      faggruppe.innerHTML = '';
      var tom = document.createElement('option');
      tom.value = '';
      tom.textContent = data ? 'Velg faggruppe' : 'Velg segment først';
      faggruppe.appendChild(tom);
      if (!data) return;
      data.fag.forEach(function (navn) {
        var opt = document.createElement('option');
        opt.value = navn;
        opt.textContent = navn;
        faggruppe.appendChild(opt);
      });
    }

    function velgSegment(nokkel, flytt) {
      if (!SEGMENTER[nokkel]) return;
      valgt = nokkel;
      Array.prototype.forEach.call(segmentKnapper, function (knapp) {
        knapp.setAttribute('aria-checked', knapp.getAttribute('data-segment') === nokkel ? 'true' : 'false');
      });
      fyllFaggrupper(nokkel);
      skjulFeil();
      if (flytt) {
        visSteg(1);
        if (skjema.scrollIntoView) {
          skjema.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        var forste = skjema.querySelector('[data-panel="1"] .seg__btn[aria-checked="true"]');
        if (forste) forste.focus({ preventScroll: true });
      }
    }

    Array.prototype.forEach.call(segmentKnapper, function (knapp) {
      knapp.addEventListener('click', function () {
        velgSegment(knapp.getAttribute('data-segment'), false);
      });

      knapp.addEventListener('keydown', function (event) {
        var retning = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
          : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
        if (!retning) return;
        event.preventDefault();
        var knapper = Array.prototype.slice.call(segmentKnapper);
        var index = knapper.indexOf(knapp);
        var nesteKnapp = knapper[(index + retning + knapper.length) % knapper.length];
        nesteKnapp.focus();
        velgSegment(nesteKnapp.getAttribute('data-segment'), false);
      });
    });

    /* Snarveier fra tjenesteradene: velg segment og hopp til skjemaet. */
    Array.prototype.forEach.call(document.querySelectorAll('.row__pickbtn[data-segment]'), function (knapp) {
      knapp.addEventListener('click', function () {
        velgSegment(knapp.getAttribute('data-segment'), true);
      });
    });

    function feltNavn(navn) {
      return skjema.querySelector('[name="' + navn + '"]');
    }

    function sjekkSteg1() {
      if (!valgt) {
        visFeil('Velg hva du trenger først — bil, anlegg eller entreprise.', null);
        return false;
      }
      return true;
    }

    function sjekkSteg2() {
      var fag = feltNavn('faggruppe');
      if (!fag || !fag.value) {
        visFeil('Velg en faggruppe, så vet vi hvem vi skal lete etter.', fag);
        return false;
      }
      var antall = feltNavn('antall');
      var tall = Number(antall && antall.value);
      if (!antall || !tall || tall < 1 || tall > 60) {
        visFeil('Antall personer må være et tall mellom 1 og 60.', antall);
        return false;
      }
      var start = feltNavn('oppstart');
      if (!start || !start.value) {
        visFeil('Velg når du trenger folkene.', start);
        return false;
      }
      if (start.value < iDag()) {
        visFeil('Oppstart kan ikke være tilbake i tid.', start);
        return false;
      }
      return true;
    }

    function sjekkSteg3() {
      var navn = feltNavn('navn');
      if (!navn || navn.value.trim().length < 2) {
        visFeil('Fyll inn navnet ditt.', navn);
        return false;
      }
      var firma = feltNavn('firma');
      if (!firma || firma.value.trim().length < 2) {
        visFeil('Fyll inn firmanavnet.', firma);
        return false;
      }
      var epost = feltNavn('epost');
      if (!epost || !erEpost(epost.value.trim())) {
        visFeil('Skriv en gyldig e-postadresse, så vi kan svare.', epost);
        return false;
      }
      var telefon = feltNavn('telefon');
      if (!telefon || !erTelefon(telefon.value)) {
        visFeil('Skriv et telefonnummer med minst åtte sifre.', telefon);
        return false;
      }
      return true;
    }

    function lagKvittering() {
      var segment = SEGMENTER[valgt];
      var antall = feltNavn('antall');
      var fag = feltNavn('faggruppe');
      var start = feltNavn('oppstart');
      var varighet = feltNavn('varighet');
      var sted = feltNavn('sted');
      var navn = feltNavn('navn');
      var firma = feltNavn('firma');
      var epost = feltNavn('epost');
      var telefon = feltNavn('telefon');

      var d = new Date();
      var nummer = 'CBA-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
        '-' + (Math.floor(Math.random() * 900) + 100);

      var rader = [
        ['Segment', segment.navn],
        ['Faggruppe', fag.value],
        ['Antall', antall.value + (Number(antall.value) === 1 ? ' person' : ' personer')],
        ['Oppstart', datoNorsk(start.value)],
        ['Varighet', varighet.value],
        ['Sted', sted.value.trim() || 'Ikke oppgitt'],
        ['Kontakt', navn.value.trim()],
        ['Firma', firma.value.trim()],
        ['E-post', epost.value.trim()],
        ['Telefon', telefon.value.trim()]
      ];

      if (kvitteringId) kvitteringId.textContent = nummer;

      if (kvitteringSum) {
        kvitteringSum.innerHTML = '';
        rader.forEach(function (rad) {
          var dt = document.createElement('dt');
          dt.textContent = rad[0];
          var dd = document.createElement('dd');
          dd.textContent = rad[1];
          kvitteringSum.appendChild(dt);
          kvitteringSum.appendChild(dd);
        });
      }

      if (kvitteringMail) {
        var emne = 'Behov: ' + segment.navn + ' — ' + antall.value + ' personer fra ' + datoNorsk(start.value);
        var kropp = rader.map(function (rad) {
          return rad[0] + ': ' + rad[1];
        }).join('\n');
        kropp += '\n\nBehovsnummer: ' + nummer;
        kropp += '\nRegistrert i demoen på cba-eu.com. Ingenting er sendt automatisk.';
        kvitteringMail.href = 'mailto:post@cba-eu.com?subject=' + encodeURIComponent(emne) +
          '&body=' + encodeURIComponent(kropp);
      }

      skjema.hidden = true;
      if (kvittering) {
        kvittering.hidden = false;
        var overskrift = kvittering.querySelector('.receipt__stamp');
        if (overskrift && overskrift.focus) overskrift.setAttribute('tabindex', '-1');
        if (overskrift) overskrift.focus();
      }
    }

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      if (steg === 1 && sjekkSteg1()) {
        visSteg(2);
        if (faggruppe) faggruppe.focus();
        return;
      }
      if (steg === 2 && sjekkSteg2()) {
        visSteg(3);
        var forsteFelt = skjema.querySelector('[data-panel="3"] input');
        if (forsteFelt) forsteFelt.focus();
        return;
      }
      if (steg === 3 && sjekkSteg3()) {
        lagKvittering();
      }
    });

    if (tilbake) {
      tilbake.addEventListener('click', function () {
        if (steg > 1) {
          visSteg(steg - 1);
          var panel = skjema.querySelector('[data-panel="' + steg + '"] input, [data-panel="' + steg + '"] select');
          if (panel) panel.focus();
        }
      });
    }

    if (kvitteringReset) {
      kvitteringReset.addEventListener('click', function () {
        if (kvittering) kvittering.hidden = true;
        skjema.hidden = false;
        skjema.reset();
        valgt = '';
        Array.prototype.forEach.call(segmentKnapper, function (knapp) {
          knapp.setAttribute('aria-checked', 'false');
        });
        fyllFaggrupper('');
        if (oppstart) oppstart.min = iDag();
        visSteg(1);
        var forsteSegment = skjema.querySelector('.seg__btn');
        if (forsteSegment) forsteSegment.focus();
      });
    }

    fyllFaggrupper('');
    visSteg(1);
  }

  /* ---------- Meldingsskjema (kontakt) ---------- */

  var kontakt = document.querySelector('[data-contact]');

  if (kontakt) {
    var kFeil = kontakt.querySelector('[data-contact-error]');
    var kOk = kontakt.querySelector('[data-contact-ok]');

    kontakt.addEventListener('submit', function (event) {
      event.preventDefault();
      var navn = kontakt.querySelector('[name="navn"]');
      var firma = kontakt.querySelector('[name="firma"]');
      var epost = kontakt.querySelector('[name="epost"]');
      var melding = kontakt.querySelector('[name="melding"]');

      function stopp(meldingstekst, felt) {
        if (kOk) kOk.hidden = true;
        if (kFeil) {
          kFeil.textContent = meldingstekst;
          kFeil.hidden = false;
        }
        if (felt) felt.focus();
      }

      if (!navn.value.trim()) return stopp('Fyll inn navnet ditt.', navn);
      if (!firma.value.trim()) return stopp('Fyll inn firmanavnet.', firma);
      if (!erEpost(epost.value.trim())) return stopp('Skriv en gyldig e-postadresse.', epost);
      if (melding.value.trim().length < 5) return stopp('Skriv noen ord om hva det gjelder.', melding);

      var emne = 'Melding fra ' + firma.value.trim() + ' — cba-eu.com';
      var kropp = 'Navn: ' + navn.value.trim() +
        '\nFirma: ' + firma.value.trim() +
        '\nE-post: ' + epost.value.trim() +
        '\n\n' + melding.value.trim();

      if (kFeil) kFeil.hidden = true;
      if (kOk) kOk.hidden = false;

      window.location.href = 'mailto:post@cba-eu.com?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(kropp);
    });
  }
})();
