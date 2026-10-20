/* Intility — demoens egen JavaScript.
   Ingen avhengigheter, ingen sporing, ingen backend. Henvendelsesflyten
   kjører helt i nettleseren og sender ingenting. */

(function () {
  'use strict';

  // Uten denne klassen er alt innhold synlig, også om noe her feiler.
  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apner = nav.hasAttribute('hidden');
      if (apner) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(apner));
      toggle.setAttribute('aria-label', apner ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (event) {
      if (!event.target.closest('a')) return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne meny');
      }
    });
  }

  /* ---------- Bevegelse ---------- */

  // Innholdet er alltid synlig; vi bare justerer hvor myke overgangene skal
  // være. Reduced motion respekteres i CSS, ikke ved å skjule noe her.
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Årstall ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Henvendelsesflyt ---------- */

  var skjema = document.getElementById('henvendelses-skjema');
  if (!skjema) return;

  // Køene speiler kanalene Intility oppgir på sin egen kontaktside.
  var KOER = {
    salg: {
      navn: 'Salg og nye kunder',
      epost: 'salg@intility.no',
      telefon: '+47 24 10 33 08',
      hjelp: 'Rådgivere som kjenner plattformen inn og ut tar gjerne en prat.'
    },
    support: {
      navn: 'Support',
      epost: null,
      telefon: '+47 24 10 34 00',
      hjelp: 'Support svarer kunder døgnet rundt via My Intility eller på telefon.'
    },
    faktura: {
      navn: 'Faktura',
      epost: 'invoice@intility.no',
      telefon: '+47 24 10 33 06',
      hjelp: 'Spørsmål om faktura besvares av fakturateamet.'
    },
    webshop: {
      navn: 'Webshop og brukerutstyr',
      epost: 'bestilling@intility.no',
      telefon: '+47 24 10 33 07',
      hjelp: 'Nytt brukerutstyr bestilles via webshop, og bestillingsteamet svarer på spørsmål.'
    },
    presse: {
      navn: 'Presse',
      epost: 'marked@intility.no',
      telefon: null,
      hjelp: 'Markedsavdelingen avklarer presserelaterte henvendelser.'
    }
  };

  var stegene = Array.prototype.slice.call(skjema.querySelectorAll('.steg'));
  var indikatorer = Array.prototype.slice.call(document.querySelectorAll('[data-steg-indikator]'));
  var kvittering = document.getElementById('kvittering');
  var oppsummering = document.getElementById('oppsummering');
  var status = document.getElementById('skjermleser-status');
  var soknad = skjema.closest('.soknad');
  var valgkortene = Array.prototype.slice.call(skjema.querySelectorAll('.valgkort'));

  function si(melding) {
    if (status) status.textContent = melding;
  }

  function visSteg(nr) {
    stegene.forEach(function (steg) {
      steg.hidden = Number(steg.getAttribute('data-steg')) !== nr;
    });

    indikatorer.forEach(function (punkt) {
      var sitt = Number(punkt.getAttribute('data-steg-indikator'));
      punkt.classList.toggle('er-ferdig', sitt < nr);
      if (sitt === nr) punkt.setAttribute('aria-current', 'step');
      else punkt.removeAttribute('aria-current');
    });

    if (kvittering && nr < 4) kvittering.hidden = true;
    skjema.hidden = false;

    var aktiv = stegene[nr - 1];
    var overskrift = aktiv ? aktiv.querySelector('legend') : null;
    if (overskrift) overskrift.focus({ preventScroll: false });

    si('Steg ' + nr + ' av 3.');
  }

  function valgtKo() {
    var valgt = skjema.querySelector('input[name="ko"]:checked');
    return valgt ? valgt.value : 'salg';
  }

  function merkValg() {
    valgkortene.forEach(function (kort) {
      var felt = kort.querySelector('input');
      kort.classList.toggle('is-valgt', !!(felt && felt.checked));
    });
  }

  valgkortene.forEach(function (kort) {
    var felt = kort.querySelector('input');
    if (felt) felt.addEventListener('change', merkValg);
  });

  function felt(navn) {
    return skjema.querySelector('[name="' + navn + '"]');
  }

  function visFeil(navn, melding) {
    var boks = skjema.querySelector('[data-feil-for="' + navn + '"]');
    var input = felt(navn);
    if (boks) boks.textContent = melding;
    if (input) {
      if (melding) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function erEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function valider() {
    var feil = 0;

    var navn = felt('navn');
    if (!navn || navn.value.trim().length < 2) {
      visFeil('navn', 'Skriv inn navnet ditt.');
      feil++;
    } else {
      visFeil('navn', '');
    }

    var epost = felt('epost');
    if (!epost || !erEpost(epost.value.trim())) {
      visFeil('epost', 'Skriv inn en gyldig e-postadresse.');
      feil++;
    } else {
      visFeil('epost', '');
    }

    var melding = felt('melding');
    if (!melding || melding.value.trim().length < 5) {
      visFeil('melding', 'Skriv noen ord om hva saken gjelder.');
      feil++;
    } else {
      visFeil('melding', '');
    }

    if (feil > 0) {
      var forste = skjema.querySelector('[aria-invalid="true"]');
      if (forste) forste.focus();
      si(feil + ' felt må rettes før du går videre.');
    }

    return feil === 0;
  }

  function lagOppsummering() {
    if (!oppsummering) return;
    var ko = KOER[valgtKo()];
    var rader = [
      ['Kø', ko.navn],
      ['Navn', felt('navn').value.trim()],
      ['Virksomhet', felt('virksomhet').value.trim() || 'Ikke oppgitt'],
      ['E-post', felt('epost').value.trim()],
      ['Telefon', felt('telefon').value.trim() || 'Ikke oppgitt'],
      ['Melding', felt('melding').value.trim()]
    ];

    oppsummering.textContent = '';
    rader.forEach(function (rad) {
      var linje = document.createElement('div');
      linje.className = 'oppsum__rad';

      var navn = document.createElement('span');
      navn.className = 'oppsum__navn';
      navn.textContent = rad[0];

      var verdi = document.createElement('span');
      verdi.className = 'oppsum__verdi';
      verdi.textContent = rad[1];

      linje.appendChild(navn);
      linje.appendChild(verdi);
      oppsummering.appendChild(linje);
    });
  }

  function lagReferanse() {
    var na = new Date();
    var to = String(na.getFullYear()).slice(2);
    var maaned = String(na.getMonth() + 1).padStart(2, '0');
    var dag = String(na.getDate()).padStart(2, '0');
    var alfabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var tegn = '';
    for (var i = 0; i < 4; i++) {
      tegn += alfabet.charAt(Math.floor(Math.random() * alfabet.length));
    }
    return 'INT-' + to + maaned + dag + '-' + tegn;
  }

  function visKvittering() {
    var ko = KOER[valgtKo()];

    var koNavn = kvittering.querySelector('[data-kvittering-ko]');
    if (koNavn) koNavn.textContent = ko.navn;

    var ref = kvittering.querySelector('[data-kvittering-ref]');
    if (ref) ref.textContent = lagReferanse();

    var kanal = kvittering.querySelector('[data-kvittering-kanal]');
    if (kanal) {
      kanal.textContent = '';

      var tekst = document.createElement('p');
      tekst.style.margin = '0 0 0.5rem';
      tekst.textContent = ko.hjelp;
      kanal.appendChild(tekst);

      var linje = document.createElement('p');
      linje.style.margin = '0';

      if (ko.epost) {
        var epostLenke = document.createElement('a');
        epostLenke.href = 'mailto:' + ko.epost;
        epostLenke.textContent = ko.epost;
        linje.appendChild(epostLenke);
      }

      if (ko.epost && ko.telefon) linje.appendChild(document.createTextNode(' · '));

      if (ko.telefon) {
        var telefonLenke = document.createElement('a');
        telefonLenke.href = 'tel:' + ko.telefon.replace(/\s/g, '');
        telefonLenke.textContent = ko.telefon;
        linje.appendChild(telefonLenke);
      }

      if (valgtKo() === 'support') {
        linje.appendChild(document.createTextNode(' · '));
        var myLenke = document.createElement('a');
        myLenke.href = 'https://my.intility.com';
        myLenke.textContent = 'My Intility';
        linje.appendChild(myLenke);
      }

      kanal.appendChild(linje);
    }

    skjema.hidden = true;
    if (kvittering) {
      kvittering.hidden = false;
      var overskrift = kvittering.querySelector('h3');
      if (overskrift) {
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus();
      }
    }

    indikatorer.forEach(function (punkt) {
      punkt.classList.add('er-ferdig');
      punkt.removeAttribute('aria-current');
    });

    if (soknad) soknad.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    si('Henvendelsen er registrert i køen ' + ko.navn + ' med referanse ' + (ref ? ref.textContent : '') + '.');
  }

  skjema.addEventListener('click', function (event) {
    var neste = event.target.closest('[data-neste]');
    var tilbake = event.target.closest('[data-tilbake]');
    var send = event.target.closest('[data-send]');

    if (neste) {
      visSteg(2);
      var forsteFelt = felt('navn');
      if (forsteFelt) forsteFelt.focus();
    }

    if (tilbake) visSteg(1);

    if (send) visKvittering();
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!valider()) return;
    lagOppsummering();
    visSteg(3);
  });

  skjema.addEventListener('input', function (event) {
    var navn = event.target.getAttribute('name');
    if (navn) visFeil(navn, '');
  });

  var nyKnapp = document.querySelector('[data-ny]');
  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      skjema.reset();
      ['navn', 'epost', 'melding'].forEach(function (navn) {
        visFeil(navn, '');
      });
      if (oppsummering) oppsummering.textContent = '';
      merkValg();
      visSteg(1);
      var forste = skjema.querySelector('input[name="ko"]');
      if (forste) forste.focus();
      si('Ny henvendelse. Steg 1 av 3.');
    });
  }

  merkValg();
})();
