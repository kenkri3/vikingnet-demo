/*
  Top Recruit AS — interaksjon.

  Tre ting: mobilmeny, oppdragsnotatet (skjema → kvittering med e-postutkast)
  og en rolig innkomst-animasjon. Alt kjører i nettleseren; ingenting sendes
  til en server og ingenting lagres.
*/

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Mobilmeny
     ------------------------------------------------------------------ */

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  var mobil = window.matchMedia('(max-width: 900px)');

  function settMeny(aapen) {
    if (!nav || !toggle) return;
    nav.hidden = !aapen;
    toggle.setAttribute('aria-expanded', aapen ? 'true' : 'false');
  }

  if (nav && toggle) {
    if (mobil.matches) settMeny(false);

    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });

    nav.addEventListener('click', function (hendelse) {
      if (mobil.matches && hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && mobil.matches && !nav.hidden) {
        settMeny(false);
        toggle.focus();
      }
    });

    var varMobil = mobil.matches;
    mobil.addEventListener('change', function (hendelse) {
      if (hendelse.matches !== varMobil) {
        varMobil = hendelse.matches;
        settMeny(!hendelse.matches);
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Oppdragsnotatet
     ------------------------------------------------------------------ */

  var skjema = document.getElementById('oppdragsnotat');
  var kvittering = document.getElementById('kvittering');
  if (!skjema || !kvittering) return;

  var typeKnapper = skjema.querySelectorAll('[data-type]');
  var stilling = document.getElementById('stilling');
  var navn = document.getElementById('navn');
  var epost = document.getElementById('epost');
  var telefon = document.getElementById('telefon');
  var merknad = document.getElementById('merknad');
  var feil = document.getElementById('feilmelding');
  var stolpe = document.getElementById('framdrift-stolpe');
  var framdriftTekst = document.getElementById('framdrift-tekst');
  var intro = document.getElementById('notat-intro');
  var kvittListe = document.getElementById('kvitt-liste');
  var kvittTittel = document.getElementById('kvitt-tittel');
  var kvittStatus = document.getElementById('kvitt-status');
  var sendEpost = document.getElementById('send-epost');
  var kopier = document.getElementById('kopier-notat');
  var nyttNotat = document.getElementById('nytt-notat');
  var epostAdresse = 'post@toprecruit.no';

  var valgtType = '';
  var lagetTid = '';
  var sisteTekst = '';

  var typeNavn = {
    lederrekruttering: 'Lederrekruttering',
    headhunting: 'Headhunting',
    coaching: 'Kandidatcoaching'
  };

  function erEpost(verdi) {
    return /.+@.+\..+/.test(verdi.trim());
  }

  function erTelefon(verdi) {
    return verdi.replace(/[^0-9]/g, '').length >= 5;
  }

  function kontaktOk() {
    return erEpost(epost.value) || erTelefon(telefon.value);
  }

  function status() {
    return {
      type: Boolean(valgtType),
      stilling: stilling.value.trim().length >= 2,
      navn: navn.value.trim().length >= 2,
      kontakt: kontaktOk()
    };
  }

  function oppdaterFramdrift() {
    var s = status();
    var klare = 0;
    Object.keys(s).forEach(function (nokkel) {
      if (s[nokkel]) klare += 1;
    });
    stolpe.style.width = (klare / 4) * 100 + '%';
    framdriftTekst.textContent = klare + ' av 4 felt klare';
    feil.hidden = true;
    stilling.removeAttribute('aria-invalid');
    navn.removeAttribute('aria-invalid');
    epost.removeAttribute('aria-invalid');
    telefon.removeAttribute('aria-invalid');
  }

  function velgType(knapp) {
    valgtType = knapp.getAttribute('data-type');
    Array.prototype.forEach.call(typeKnapper, function (annen) {
      annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
    });
    oppdaterFramdrift();
  }

  Array.prototype.forEach.call(typeKnapper, function (knapp) {
    knapp.addEventListener('click', function () {
      velgType(knapp);
    });
  });

  [stilling, navn, epost, telefon].forEach(function (felt) {
    felt.addEventListener('input', oppdaterFramdrift);
  });

  function rader() {
    var liste = [];
    if (valgtType) liste.push(['Gjelder', typeNavn[valgtType]]);
    if (stilling.value.trim()) liste.push(['Stilling', stilling.value.trim()]);
    if (navn.value.trim()) liste.push(['Navn', navn.value.trim()]);
    if (epost.value.trim()) liste.push(['E-post', epost.value.trim()]);
    if (telefon.value.trim()) liste.push(['Telefon', telefon.value.trim()]);
    if (merknad.value.trim()) liste.push(['Om oppdraget', merknad.value.trim()]);
    if (lagetTid) liste.push(['Laget', lagetTid]);
    return liste;
  }

  function tekstAvRader() {
    return rader()
      .map(function (rad) {
        return rad[0] + ': ' + rad[1];
      })
      .join('\n');
  }

  function fyllListe() {
    kvittListe.textContent = '';
    rader().forEach(function (rad) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      kvittListe.appendChild(dt);
      kvittListe.appendChild(dd);
    });
  }

  function datoTekst() {
    var naa = new Date();
    var tekst = naa.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return tekst;
  }

  function lagEpostLenke() {
    var emne = 'Oppdragsnotat';
    if (valgtType) emne += ' – ' + typeNavn[valgtType];
    if (stilling.value.trim()) emne += ' – ' + stilling.value.trim();
    var kropp = tekstAvRader() + '\n\nSendt fra nettsiden til Top Recruit AS.';
    return 'mailto:' + epostAdresse
      + '?subject=' + encodeURIComponent(emne)
      + '&body=' + encodeURIComponent(kropp);
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    var s = status();
    if (!s.type || !s.stilling || !s.navn || !s.kontakt) {
      feil.hidden = false;
      if (!s.stilling) stilling.setAttribute('aria-invalid', 'true');
      if (!s.navn) navn.setAttribute('aria-invalid', 'true');
      if (!s.kontakt) {
        epost.setAttribute('aria-invalid', 'true');
        telefon.setAttribute('aria-invalid', 'true');
      }
      feil.textContent = !s.kontakt && s.type && s.stilling && s.navn
        ? 'Fyll ut e-post eller telefon, så vi kan svare deg.'
        : 'Fyll ut hva det gjelder, stilling, navn og én av e-post eller telefon.';
      if (!s.type) {
        var forste = skjema.querySelector('[data-type]');
        if (forste) forste.focus();
      } else if (!s.stilling) {
        stilling.focus();
      } else if (!s.navn) {
        navn.focus();
      } else if (!s.kontakt) {
        epost.focus();
      }
      return;
    }

    lagetTid = datoTekst();
    sisteTekst = tekstAvRader();
    fyllListe();
    sendEpost.href = lagEpostLenke();
    kvittStatus.textContent = '';
    if (intro) intro.hidden = true;
    skjema.hidden = true;
    kvittering.hidden = false;
    kvittTittel.focus();
  });

  sendEpost.addEventListener('click', function () {
    kvittStatus.textContent = 'E-postprogrammet åpnes med notatet utfylt.';
  });

  function kopierTekst(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst);
    }
    return new Promise(function (resolve, reject) {
      var hjelper = document.createElement('textarea');
      hjelper.value = tekst;
      hjelper.setAttribute('readonly', '');
      hjelper.style.position = 'fixed';
      hjelper.style.opacity = '0';
      document.body.appendChild(hjelper);
      hjelper.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(hjelper);
      if (ok) resolve();
      else reject(new Error('Kopiering støttes ikke'));
    });
  }

  kopier.addEventListener('click', function () {
    kopierTekst(sisteTekst).then(function () {
      kvittStatus.textContent = 'Notatet er kopiert.';
    }).catch(function () {
      kvittStatus.textContent = 'Kunne ikke kopiere automatisk — merk teksten og kopier selv.';
    });
  });

  nyttNotat.addEventListener('click', function () {
    skjema.reset();
    valgtType = '';
    lagetTid = '';
    sisteTekst = '';
    Array.prototype.forEach.call(typeKnapper, function (knapp) {
      knapp.setAttribute('aria-pressed', 'false');
    });
    kvittering.hidden = true;
    skjema.hidden = false;
    if (intro) intro.hidden = false;
    oppdaterFramdrift();
    var forste = skjema.querySelector('[data-type]');
    if (forste) forste.focus();
  });

  oppdaterFramdrift();

  /* ------------------------------------------------------------------
     3. Innkomst
     ------------------------------------------------------------------ */

  var brikker = document.querySelectorAll('.reveal');
  if (brikker.length && 'IntersectionObserver' in window) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(brikker, function (brikke) {
      observator.observe(brikke);
    });

    /* Sikkerhetsnett: innholdet skal aldri bli stående usynlig. */
    window.setTimeout(function () {
      Array.prototype.forEach.call(brikker, function (brikke) {
        brikke.classList.add('is-visible');
      });
    }, 4000);
  } else {
    Array.prototype.forEach.call(brikker, function (brikke) {
      brikke.classList.add('is-visible');
    });
  }
})();
