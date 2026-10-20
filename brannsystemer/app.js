/*
  Brannsystemer AS — app.js
  Tre små ting: mobilmeny, enkel innfading, og forespørselen i tre steg med
  kvittering. Alt skjer i nettleseren: ingenting sendes til en server, og
  ingenting lagres. Kvitteringen blir liggende til fanen lukkes.
*/
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.classList.remove('is-open');
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne menyen');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      var open = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', open ? 'Lukk menyen' : 'Åpne menyen');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---------------- Årstall i bunnen ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Rolig bevegelse ----------------
     Brukes når vi flytter fokus mellom stegene og ruller kortet i synet. */

  var roligBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- Forespørselen ----------------
     Steg 1: tjeneste og type bygg. Steg 2: kontakt. Steg 3: se over.
     Deretter en kvittering med referanse, sammendrag og mailto.
  */

  var skjema = document.getElementById('foresporsel-skjema');
  var kort = document.getElementById('foresporsel-kort');
  var kvittering = document.getElementById('kvittering');
  if (!skjema || !kort || !kvittering) return;

  var punkter = Array.prototype.slice.call(document.querySelectorAll('#steg .steg__punkt'));
  var visninger = Array.prototype.slice.call(document.querySelectorAll('.flyt__visning'));
  var oppsummering = document.getElementById('oppsummering');
  var kvListe = document.getElementById('kv-liste');
  var kvRef = document.getElementById('kv-ref');
  var kvTid = document.getElementById('kv-tid');
  var kvMail = document.getElementById('kv-mail');
  var kvKopier = document.getElementById('kv-kopier');
  var kvNy = document.getElementById('kv-ny');
  var kvStatus = document.getElementById('kv-status');
  var feilFelt = {
    1: document.getElementById('feil-1'),
    2: document.getElementById('feil-2')
  };

  var steg = 1;
  var sisteTekst = '';

  function felt(navn) {
    return skjema.querySelector('[name="' + navn + '"]');
  }

  function hentData() {
    var valgt = skjema.querySelector('input[name="tjeneste"]:checked');
    return {
      tjeneste: valgt ? valgt.value : '',
      bygg: felt('bygg').value,
      navn: felt('navn').value.trim(),
      telefon: felt('telefon').value.trim(),
      epost: felt('epost').value.trim(),
      naar: felt('naar').value,
      melding: felt('melding').value.trim(),
      planer: felt('planer').checked
    };
  }

  function visFeil(nummer, tekst) {
    var boks = feilFelt[nummer];
    if (!boks) return;
    if (tekst) {
      boks.textContent = tekst;
      boks.hidden = false;
    } else {
      boks.textContent = '';
      boks.hidden = true;
    }
  }

  function erEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
  }

  function erTelefon(verdi) {
    var siffer = verdi.replace(/[^0-9]/g, '');
    return siffer.length >= 5 && siffer.length <= 15;
  }

  function sjekkSteg(nummer) {
    var data = hentData();

    if (nummer === 1) {
      if (!data.tjeneste) {
        visFeil(1, 'Velg hva forespørselen gjelder.');
        skjema.querySelector('input[name="tjeneste"]').focus();
        return false;
      }
      if (!data.bygg) {
        visFeil(1, 'Velg hva slags bygg det er.');
        felt('bygg').focus();
        return false;
      }
      visFeil(1, '');
      return true;
    }

    if (nummer === 2) {
      if (!data.navn) {
        visFeil(2, 'Skriv inn navnet ditt, så vi vet hvem vi snakker med.');
        felt('navn').focus();
        return false;
      }
      if (!data.telefon && !data.epost) {
        visFeil(2, 'Oppgi telefon eller e-post, slik at vi kan svare deg.');
        felt('telefon').focus();
        return false;
      }
      if (data.epost && !erEpost(data.epost)) {
        visFeil(2, 'E-postadressen ser ikke helt riktig ut. Sjekk den og prøv igjen.');
        felt('epost').focus();
        return false;
      }
      if (data.telefon && !erTelefon(data.telefon)) {
        visFeil(2, 'Telefonnummeret ser for kort ut. Skriv det med retningsnummer om du vil.');
        felt('telefon').focus();
        return false;
      }
      visFeil(2, '');
      return true;
    }

    return true;
  }

  function lagRader(beholder, data) {
    beholder.textContent = '';
    var rader = [
      ['Tjeneste', data.tjeneste],
      ['Type bygg', data.bygg],
      ['Planer', data.planer ? 'Ja – orienterings- og rømningsplaner' : 'Ikke bestilt'],
      ['Navn', data.navn],
      ['Telefon', data.telefon || 'Ikke oppgitt'],
      ['E-post', data.epost || 'Ikke oppgitt'],
      ['Kontakt', data.naar],
      ['Melding', data.melding || 'Ikke skrevet']
    ];

    rader.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      beholder.appendChild(div);
    });
  }

  function settSteg(nummer) {
    steg = nummer;
    visninger.forEach(function (visning) {
      visning.hidden = Number(visning.getAttribute('data-visning')) !== nummer;
    });
    punkter.forEach(function (punkt) {
      var n = Number(punkt.getAttribute('data-steg'));
      punkt.classList.toggle('er-aktiv', n === nummer);
      punkt.classList.toggle('er-ferdig', n < nummer);
    });
    if (nummer === 3) lagRader(oppsummering, hentData());
  }

  function gåTil(nummer) {
    if (nummer > steg && !sjekkSteg(steg)) return;
    settSteg(nummer);
    if (nummer === 3) return;

    var visning = visninger[nummer - 1];
    var mal = visning ? visning.querySelector('input, select, textarea') : null;
    if (mal) mal.focus();
    if (kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ behavior: roligBevegelse.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  Array.prototype.forEach.call(kort.querySelectorAll('[data-gå]'), function (knapp) {
    knapp.addEventListener('click', function () {
      gåTil(Number(knapp.getAttribute('data-gå')));
    });
  });

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function lagReferanse(dato) {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var bokstaver = '';
    for (var i = 0; i < 4; i += 1) {
      bokstaver += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'BS-' + String(dato.getFullYear()).slice(2) + toSiffer(dato.getMonth() + 1) +
      toSiffer(dato.getDate()) + '-' + bokstaver;
  }

  function somTekst(data, ref, dato) {
    var linjer = [
      'Forespørsel fra brannsystemer.no',
      '',
      'Referanse: ' + ref,
      'Tidspunkt: ' + dato.toLocaleString('nb-NO'),
      '',
      'Tjeneste: ' + data.tjeneste,
      'Type bygg: ' + data.bygg,
      'Orienterings- og rømningsplaner: ' + (data.planer ? 'ja' : 'nei'),
      '',
      'Navn: ' + data.navn,
      'Telefon: ' + (data.telefon || '-'),
      'E-post: ' + (data.epost || '-'),
      'Passer best: ' + data.naar,
      '',
      'Melding:',
      data.melding || '-'
    ];
    return linjer.join('\n');
  }

  function lagKvittering() {
    var data = hentData();
    var dato = new Date();
    var ref = lagReferanse(dato);
    var tekst = somTekst(data, ref, dato);

    sisteTekst = tekst;
    lagRader(kvListe, data);
    kvRef.textContent = ref;
    kvTid.textContent = dato.toLocaleString('nb-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    var emne = 'Forespørsel: ' + data.tjeneste + ' – ' + data.bygg;
    kvMail.setAttribute('href', 'mailto:magne@brannsystemer.no?subject=' +
      encodeURIComponent(emne) + '&body=' + encodeURIComponent(tekst));

    punkter.forEach(function (punkt) {
      punkt.classList.remove('er-aktiv');
      punkt.classList.add('er-ferdig');
    });

    skjema.hidden = true;
    kvittering.hidden = false;
    kvStatus.textContent = '';

    var tittel = kvittering.querySelector('h3');
    if (tittel) {
      tittel.setAttribute('tabindex', '-1');
      tittel.focus();
    }
    kvittering.scrollIntoView({ behavior: roligBevegelse.matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (steg < 3) {
      gåTil(steg + 1);
      return;
    }
    if (!sjekkSteg(1) || !sjekkSteg(2)) {
      settSteg(1);
      return;
    }
    lagKvittering();
  });

  if (kvKopier) {
    kvKopier.addEventListener('click', function () {
      if (!sisteTekst) return;
      function kvitter() {
        kvStatus.textContent = 'Sammendraget er kopiert.';
        window.setTimeout(function () { kvStatus.textContent = ''; }, 3000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sisteTekst).then(kvitter, function () {
          kvStatus.textContent = 'Nettleseren stoppet kopieringen. Merk teksten og kopier manuelt.';
        });
        return;
      }
      kvStatus.textContent = 'Nettleseren støtter ikke kopiering her. Merk teksten og kopier manuelt.';
    });
  }

  if (kvNy) {
    kvNy.addEventListener('click', function () {
      skjema.reset();
      visFeil(1, '');
      visFeil(2, '');
      sisteTekst = '';
      kvittering.hidden = true;
      skjema.hidden = false;
      settSteg(1);
      felt('bygg').focus();
      kort.scrollIntoView({ behavior: roligBevegelse.matches ? 'auto' : 'smooth', block: 'nearest' });
    });
  }
})();
