/*
  Billink — app.js
  To ting brukeren kan gjøre, begge i nettleseren:

  1. Kanalvelgeren: velg kjøretøytype og publiseringsflater og se med én gang
     hvordan annonsen spres. Teksten i resultatet er satt sammen av Billinks
     egne flater – ingen tall er lagt til.
  2. Søknadsskjemaet: fyll ut, få en kvittering, og send den selv med e-post.

  Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------------- Årstall i footer ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Mobilmeny ---------------- */

  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function lukkMeny() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Åpne meny');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var apen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (hendelse) {
      var mal = hendelse.target;
      if (mal && mal.closest && mal.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---------------- Kanalvelger ---------------- */

  var typeKnapper = Array.prototype.slice.call(document.querySelectorAll('[data-type]'));
  var kanalKnapper = Array.prototype.slice.call(document.querySelectorAll('[data-kanal]'));
  var antallEl = document.getElementById('antallFlater');
  var linjeEl = document.getElementById('resultatLinje');
  var gratisEl = document.getElementById('resultatGratis');

  function valgtType() {
    for (var i = 0; i < typeKnapper.length; i++) {
      if (typeKnapper[i].getAttribute('aria-pressed') === 'true') {
        return typeKnapper[i].getAttribute('data-type');
      }
    }
    return '';
  }

  function valgteKanaler() {
    var ut = [];
    for (var i = 0; i < kanalKnapper.length; i++) {
      if (kanalKnapper[i].getAttribute('aria-pressed') === 'true') {
        ut.push(kanalKnapper[i].getAttribute('data-kanal'));
      }
    }
    return ut;
  }

  /* «a», «a og b», «a, b og c» */
  function liste(ord) {
    if (!ord.length) return '';
    if (ord.length === 1) return ord[0];
    return ord.slice(0, -1).join(', ') + ' og ' + ord[ord.length - 1];
  }

  function oppdater() {
    if (!antallEl || !linjeEl) return;
    var kanaler = valgteKanaler();
    var type = valgtType() || 'Kjøretøyet';

    antallEl.textContent = String(kanaler.length);

    if (kanaler.length === 0) {
      linjeEl.textContent = 'Ingen flater valgt. Velg minst én flate for å se publiseringen.';
    } else {
      linjeEl.textContent = type + ' publiseres til ' + liste(kanaler) + '.';
    }

    if (gratisEl) gratisEl.hidden = kanaler.indexOf('AutoDB.no') === -1;
  }

  typeKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      typeKnapper.forEach(function (annen) {
        annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
      });
      oppdater();
    });
  });

  kanalKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var valgt = knapp.getAttribute('aria-pressed') === 'true';
      knapp.setAttribute('aria-pressed', valgt ? 'false' : 'true');
      oppdater();
    });
  });

  /* ---------------- Skjema og kvittering ---------------- */

  var skjema = document.getElementById('demoSkjema');
  var feilEl = document.getElementById('skjemaFeil');
  var kvittering = document.getElementById('kvittering');
  var kvTittel = document.getElementById('kvitteringTittel');
  var sendLenke = document.getElementById('sendEpost');
  var endreKnapp = document.getElementById('endre');
  var pakkeValg = document.getElementById('pakke');
  var samtykke = document.getElementById('samtykke');
  var ingress = document.getElementById('skjemaIngress');

  function feltVerdi(id) {
    var felt = document.getElementById(id);
    return felt ? felt.value.trim() : '';
  }

  function settTekst(id, tekst) {
    var el = document.getElementById(id);
    if (el) el.textContent = tekst;
  }

  function epostOK(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
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

  function visSkjema() {
    if (kvittering) kvittering.hidden = true;
    if (skjema) skjema.hidden = false;
    if (ingress) ingress.hidden = false;
  }

  /* Pakkeknappene forvalger pakken i skjemaet før ankeret hopper ned. */
  var pakkeLenker = Array.prototype.slice.call(document.querySelectorAll('[data-pakke]'));
  pakkeLenker.forEach(function (lenke) {
    lenke.addEventListener('click', function () {
      var valg = lenke.getAttribute('data-pakke');
      if (pakkeValg && valg) pakkeValg.value = valg;
      skjulFeil();
      visSkjema();
    });
  });

  if (skjema) {
    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      skjulFeil();

      var firma = feltVerdi('firma');
      var orgnr = feltVerdi('orgnr');
      var kontakt = feltVerdi('kontaktperson');
      var epost = feltVerdi('epost');
      var telefon = feltVerdi('telefon');
      var pakke = pakkeValg ? pakkeValg.value : '';

      var mangler = [];
      if (firma.length < 2) mangler.push('bedriftsnavn');
      if (!epostOK(epost)) mangler.push('en gyldig e-postadresse');
      if (!samtykke || !samtykke.checked) mangler.push('samtykke til at vi kontakter deg');

      if (mangler.length) {
        visFeil('Fyll ut ' + liste(mangler) + '.');
        var forste = firma.length < 2 ? 'firma' : (!epostOK(epost) ? 'epost' : 'samtykke');
        var felt = document.getElementById(forste);
        if (felt) felt.focus();
        return;
      }

      settTekst('kvFirma', firma);
      settTekst('kvOrg', orgnr || 'Ikke oppgitt');
      settTekst('kvKontakt', kontakt || 'Ikke oppgitt');
      settTekst('kvEpost', epost);
      settTekst('kvTelefon', telefon || 'Ikke oppgitt');
      settTekst('kvPakke', pakke);

      if (sendLenke) {
        var emne = 'Søknad om Billink – ' + firma;
        var kropp = [
          'Bedriftsnavn: ' + firma,
          'Org. nummer: ' + (orgnr || 'ikke oppgitt'),
          'Kontaktperson: ' + (kontakt || 'ikke oppgitt'),
          'E-post: ' + epost,
          'Telefon: ' + (telefon || 'ikke oppgitt'),
          'Pakke: ' + pakke,
          '',
          'Meldt inn via skjemaet på nettsiden.'
        ].join('\n');
        sendLenke.setAttribute(
          'href',
          'mailto:support@billink.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
        );
      }

      if (skjema) skjema.hidden = true;
      if (ingress) ingress.hidden = true;
      if (kvittering) kvittering.hidden = false;
      if (kvTittel) kvTittel.focus();
    });
  }

  if (endreKnapp) {
    endreKnapp.addEventListener('click', function () {
      visSkjema();
      var firmaFelt = document.getElementById('firma');
      if (firmaFelt) firmaFelt.focus();
    });
  }
})();
