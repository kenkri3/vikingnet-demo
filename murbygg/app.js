/* Murbygg AS — meny, årstall og forespørselsflyten.
   Alt er client-side: ingenting sendes eller lagres. Kvitteringen settes sammen
   i nettleseren, og brukeren velger selv om den skal gå videre på e-post. */
(function () {
  'use strict';

  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Årstall i bunnen -------------------------------------------------- */
  var arstall = document.getElementById('arstall');
  if (arstall) {
    arstall.textContent = '© ' + new Date().getFullYear() + ' Murbygg AS';
  }

  /* ---- Mobilmeny --------------------------------------------------------- */
  var velger = document.getElementById('nav-toggle');
  var meny = document.getElementById('nav');

  if (velger && meny) {
    var settMeny = function (open) {
      meny.hidden = !open;
      velger.setAttribute('aria-expanded', open ? 'true' : 'false');
      velger.setAttribute('aria-label', open ? 'Lukk menyen' : 'Åpne menyen');
    };

    velger.addEventListener('click', function () {
      settMeny(velger.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && velger.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        velger.focus();
      }
    });
  }

  /* ---- Forespørsel ------------------------------------------------------- */
  var skjema = document.getElementById('skjema');
  if (!skjema) return;

  var STEGNAVN = {
    1: 'Hva gjelder det?',
    2: 'Om jobben',
    3: 'Kontaktinformasjon'
  };

  var steg = Array.prototype.slice.call(skjema.querySelectorAll('.skjema__steg'));
  var prikker = Array.prototype.slice.call(skjema.querySelectorAll('[data-prikk]'));
  var status = document.getElementById('steg-status');
  var indikator = skjema.querySelector('.steg-ind');
  var kvittering = document.getElementById('kvittering');
  var oppsummering = document.getElementById('oppsummering');
  var aktiv = 1;
  var valgt = { tjeneste: '', kunde: '' };

  function felt(id) {
    return document.getElementById(id);
  }

  function feilElement(navn) {
    return skjema.querySelector('[data-feil="' + navn + '"]');
  }

  function visFeil(navn, tekst) {
    var el = feilElement(navn);
    if (!el) return;
    el.textContent = tekst;
    el.hidden = false;
    var inngang = felt(navn);
    if (inngang) inngang.setAttribute('aria-invalid', 'true');
  }

  function skjulFeil(navn) {
    var el = feilElement(navn);
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
    var inngang = felt(navn);
    if (inngang) inngang.removeAttribute('aria-invalid');
  }

  function lesVerdier() {
    return {
      tjeneste: valgt.tjeneste,
      kunde: valgt.kunde,
      oppstart: felt('oppstart') ? felt('oppstart').value : '',
      beskrivelse: felt('beskrivelse') ? felt('beskrivelse').value.trim() : '',
      navn: felt('navn') ? felt('navn').value.trim() : '',
      telefon: felt('telefon') ? felt('telefon').value.trim() : '',
      epost: felt('epost') ? felt('epost').value.trim() : '',
      sted: felt('sted') ? felt('sted').value.trim() : ''
    };
  }

  function tilRader(verdier) {
    var rader = [
      ['Tjeneste', verdier.tjeneste],
      ['Gjelder', verdier.kunde],
      ['Oppstart', verdier.oppstart]
    ];
    if (verdier.sted) rader.push(['Sted', verdier.sted]);
    if (verdier.beskrivelse) rader.push(['Beskrivelse', verdier.beskrivelse]);
    rader.push(['Navn', verdier.navn]);
    rader.push(['Telefon', verdier.telefon]);
    rader.push(['E-post', verdier.epost]);
    return rader;
  }

  function fyllListe(liste, rader) {
    while (liste.firstChild) liste.removeChild(liste.firstChild);
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });
  }

  function gyldig(stegNr) {
    if (stegNr === 1) {
      if (!valgt.tjeneste) {
        visFeil('tjeneste', 'Velg hva henvendelsen gjelder.');
        return false;
      }
      return true;
    }

    if (stegNr === 2) {
      if (!valgt.kunde) {
        visFeil('kunde', 'Velg hvem henvendelsen gjelder.');
        return false;
      }
      return true;
    }

    var ok = true;
    ['navn', 'telefon', 'epost'].forEach(skjulFeil);

    var navn = felt('navn');
    if (!navn || !navn.value.trim()) {
      visFeil('navn', 'Skriv navnet ditt, så vi vet hvem vi skal kontakte.');
      ok = false;
    }

    var telefon = felt('telefon');
    var siffer = telefon ? telefon.value.replace(/\D/g, '') : '';
    if (siffer.length < 8) {
      visFeil('telefon', 'Skriv et telefonnummer med minst åtte siffer.');
      ok = false;
    }

    var epost = felt('epost');
    var adresse = epost ? epost.value.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse)) {
      visFeil('epost', 'Skriv en e-postadresse vi kan svare på.');
      ok = false;
    }

    return ok;
  }

  function gåTil(nr, medFokus) {
    aktiv = nr;

    steg.forEach(function (del) {
      del.hidden = Number(del.getAttribute('data-steg')) !== nr;
    });

    prikker.forEach(function (prikk) {
      var nummer = Number(prikk.getAttribute('data-prikk'));
      prikk.classList.toggle('is-aktiv', nummer === nr);
      prikk.classList.toggle('is-ferdig', nummer < nr);
    });

    if (status) status.textContent = 'Steg ' + nr + ' av 3 · ' + STEGNAVN[nr];

    if (nr === 3 && oppsummering) {
      fyllListe(oppsummering, tilRader(lesVerdier()));
    }

    if (medFokus === false) return;

    var ramme = skjema.getBoundingClientRect();
    if (ramme.top < 0 || ramme.bottom > window.innerHeight) {
      skjema.scrollIntoView({
        behavior: redusertBevegelse ? 'auto' : 'smooth',
        block: 'start'
      });
    }

    var del = skjema.querySelector('.skjema__steg[data-steg="' + nr + '"]');
    var første = del ? del.querySelector('.chip, input, select, textarea, button') : null;
    if (første) første.focus({ preventScroll: true });
  }

  /* Valgpanelet: én knapp trykket inn om gangen. */
  Array.prototype.forEach.call(skjema.querySelectorAll('.valg'), function (gruppe) {
    var nokkel = gruppe.getAttribute('data-gruppe');

    gruppe.addEventListener('click', function (hendelse) {
      var knapp = hendelse.target.closest('.chip');
      if (!knapp || !gruppe.contains(knapp)) return;

      Array.prototype.forEach.call(gruppe.querySelectorAll('.chip'), function (annen) {
        annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
      });

      valgt[nokkel] = knapp.getAttribute('data-verdi');
      skjulFeil(nokkel);
    });
  });

  skjema.addEventListener('click', function (hendelse) {
    var neste = hendelse.target.closest('[data-neste]');
    if (neste) {
      var mål = Number(neste.getAttribute('data-neste'));
      if (gyldig(aktiv)) gåTil(mål);
      return;
    }

    var tilbake = hendelse.target.closest('[data-tilbake]');
    if (tilbake) {
      gåTil(Number(tilbake.getAttribute('data-tilbake')));
    }
  });

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (!gyldig(3)) return;
    lagKvittering();
  });

  function lagKvittering() {
    var verdier = lesVerdier();
    var rader = tilRader(verdier);
    var aar = new Date().getFullYear();
    var referanse = 'MB-' + aar + '-' + String(Math.floor(Math.random() * 9000) + 1000);

    var ref = document.getElementById('kv-ref');
    if (ref) ref.textContent = referanse;

    var innledning = document.getElementById('kv-innledning');
    if (innledning) {
      var fornavn = verdier.navn.split(/\s+/)[0] || verdier.navn;
      innledning.textContent = 'Takk, ' + fornavn + '. Forespørselen er satt sammen — slik ser den ut.';
    }

    var liste = document.getElementById('kv-liste');
    if (liste) fyllListe(liste, rader);

    var lenke = document.getElementById('kv-epost');
    if (lenke) {
      var emne = 'Forespørsel ' + referanse + ' — ' + verdier.tjeneste;
      var kropp = 'Hei Murbygg,\n\n' +
        'Jeg sender en forespørsel fra nettsiden.\n\n' +
        'Referanse: ' + referanse + '\n\n' +
        rader.map(function (rad) { return rad[0] + ': ' + rad[1]; }).join('\n') +
        '\n\nMed vennlig hilsen\n' + verdier.navn;
      lenke.href = 'mailto:murbygg@murbygg.com' +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(kropp);
    }

    steg.forEach(function (del) { del.hidden = true; });
    if (indikator) indikator.hidden = true;
    if (kvittering) kvittering.hidden = false;

    var statusfelt = document.getElementById('steg-status');
    if (statusfelt) statusfelt.textContent = 'Kvittering ' + referanse + ' er klar.';

    if (kvittering) {
      var ramme = kvittering.getBoundingClientRect();
      if (ramme.top < 0 || ramme.bottom > window.innerHeight) {
        kvittering.scrollIntoView({
          behavior: redusertBevegelse ? 'auto' : 'smooth',
          block: 'start'
        });
      }
      var overskrift = document.getElementById('kv-innledning');
      if (overskrift) overskrift.focus({ preventScroll: true });
    }
  }

  /* Kopier sammendraget */
  var kopier = document.getElementById('kv-kopier');
  var melding = document.getElementById('kv-melding');

  if (kopier && melding) {
    kopier.addEventListener('click', function () {
      var tekst = tilRader(lesVerdier())
        .map(function (rad) { return rad[0] + ': ' + rad[1]; })
        .join('\n');

      function si(innhold) {
        melding.textContent = innhold;
        melding.hidden = false;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(
          function () { si('Sammendraget er kopiert.'); },
          function () { si('Nettleseren stoppet kopieringen. Merk teksten og kopier manuelt.'); }
        );
      } else {
        si('Nettleseren tillater ikke kopiering her. Merk teksten og kopier manuelt.');
      }
    });
  }

  /* Start på nytt */
  var ny = document.getElementById('kv-ny');
  if (ny) {
    ny.addEventListener('click', function () {
      skjema.reset();
      valgt.tjeneste = '';
      valgt.kunde = '';
      Array.prototype.forEach.call(skjema.querySelectorAll('.chip'), function (knapp) {
        knapp.setAttribute('aria-pressed', 'false');
      });
      ['tjeneste', 'kunde', 'navn', 'telefon', 'epost'].forEach(skjulFeil);
      if (melding) melding.hidden = true;
      if (kvittering) kvittering.hidden = true;
      if (indikator) indikator.hidden = false;
      gåTil(1);
    });
  }

  /* Delbar lenke rett til et steg: ?steg=2 eller ?steg=3 */
  var onsket = new URLSearchParams(window.location.search).get('steg');
  if (onsket) {
    var nummer = parseInt(onsket, 10);
    if (!isNaN(nummer) && nummer >= 2 && nummer <= 3) {
      gåTil(nummer, false);
    }
  }
})();
