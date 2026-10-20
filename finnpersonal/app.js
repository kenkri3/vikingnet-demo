/* FinnPersonal — interaksjon.
   Alt kjører i nettleseren. Ingenting sendes, ingenting lagres. */
(function () {
  'use strict';

  var TIDSSONE = 'Europe/Oslo';
  var UKEDAG = {
    Mon: 'mandag',
    Tue: 'tirsdag',
    Wed: 'onsdag',
    Thu: 'torsdag',
    Fri: 'fredag',
    Sat: 'lørdag',
    Sun: 'søndag'
  };

  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------------
     1. Meny på smale skjermer
     --------------------------------------------------------------------- */
  var menyKnapp = document.getElementById('meny-knapp');
  var meny = document.getElementById('hovedmeny');

  if (menyKnapp && meny) {
    var settMeny = function (apen) {
      meny.classList.toggle('er-apen', apen);
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
    };

    menyKnapp.addEventListener('click', function () {
      settMeny(!meny.classList.contains('er-apen'));
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target && hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape') settMeny(false);
    });
  }

  /* ---------------------------------------------------------------------
     2. Åpningstid: regnet ut fra tidene selskapet selv oppgir
        Hverdager 07:30–22:00, helg 10:00–18:00.
     --------------------------------------------------------------------- */
  function toSiffer(tall) {
    return (tall < 10 ? '0' : '') + tall;
  }

  function klokke(minutter) {
    return toSiffer(Math.floor(minutter / 60)) + ':' + toSiffer(minutter % 60);
  }

  function vindu(helg) {
    return helg ? [10 * 60, 18 * 60] : [7 * 60 + 30, 22 * 60];
  }

  function osloNaa() {
    try {
      var format = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIDSSONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      var deler = {};
      format.formatToParts(new Date()).forEach(function (del) {
        deler[del.type] = del.value;
      });
      var time = parseInt(deler.hour, 10) % 24;
      var minutt = parseInt(deler.minute, 10);
      var dag = deler.weekday;
      return {
        min: time * 60 + minutt,
        dag: dag,
        helg: dag === 'Sat' || dag === 'Sun'
      };
    } catch (feil) {
      return null;
    }
  }

  function statusNaa() {
    var naa = osloNaa();
    if (!naa) return null;
    var vinduNaa = vindu(naa.helg);
    return {
      naa: naa,
      vindu: vinduNaa,
      aapen: naa.min >= vinduNaa[0] && naa.min < vinduNaa[1]
    };
  }

  function dagsTekst(naa) {
    var navn = UKEDAG[naa.dag] || '';
    return (navn ? navn + ' ' : '') + 'kl. ' + klokke(naa.min);
  }

  function imorgenHelg() {
    try {
      var format = new Intl.DateTimeFormat('en-GB', { timeZone: TIDSSONE, weekday: 'short' });
      var dag = format.format(new Date(Date.now() + 86400000));
      return dag === 'Sat' || dag === 'Sun';
    } catch (feil) {
      return false;
    }
  }

  function nesteTekst(status) {
    if (!status) return '';
    var start = klokke(status.vindu[0]);
    if (status.aapen) return 'Stenger kl. ' + klokke(status.vindu[1]) + ' i kveld.';
    if (status.naa.min < status.vindu[0]) return 'Åpner kl. ' + start + ' i dag.';
    return 'Åpner i morgen kl. ' + klokke(vindu(imorgenHelg())[0]) + '.';
  }

  var live = document.getElementById('live');
  var liveStatus = document.getElementById('live-status');
  var liveTid = document.getElementById('live-tid');
  var liveNeste = document.getElementById('live-neste');

  function tegnLive() {
    if (!live || !liveStatus || !liveTid) return;
    var status = statusNaa();
    if (!status) return;
    live.setAttribute('data-apen', status.aapen ? 'ja' : 'nei');
    liveStatus.textContent = status.aapen ? 'Åpent nå' : 'Stengt nå';
    liveTid.textContent = dagsTekst(status.naa);
    if (liveNeste) liveNeste.textContent = nesteTekst(status);
  }

  tegnLive();
  window.setInterval(tegnLive, 30000);

  /* ---------------------------------------------------------------------
     3. Forespørsel i tre steg med kvittering
     --------------------------------------------------------------------- */
  var skjema = document.getElementById('fp-skjema');
  var kvittering = document.getElementById('fp-kvittering');

  if (skjema && kvittering) {
    var steg = Array.prototype.slice.call(skjema.querySelectorAll('[data-steg]'));
    var fremdrift = document.querySelector('.fremdrift');
    var merker = fremdrift ? Array.prototype.slice.call(fremdrift.children) : [];
    var feilBoks = document.getElementById('fp-feil');
    var oppsummering = document.getElementById('fp-oppsummering');
    var kvitteringListe = document.getElementById('fp-kvittering-liste');
    var kvitteringRef = document.getElementById('fp-referanse');
    var kvitteringSvar = document.getElementById('fp-svar');
    var epostKnapp = document.getElementById('fp-epost');
    var nyKnapp = document.getElementById('fp-ny');
    var skjemaKort = skjema.closest('.skjema-kort');
    var naaSteg = 1;
    var valg = {};

    var FELT = ['fagomrade', 'naar', 'navn', 'bedrift', 'epost', 'telefon'];

    function lesSkjema() {
      var radio = skjema.querySelector('input[name="tjeneste"]:checked');
      valg.tjeneste = radio ? radio.value : '';
      FELT.forEach(function (id) {
        var felt = document.getElementById(id);
        valg[id] = felt ? felt.value.trim() : '';
      });
    }

    function visFeil(melding) {
      if (!feilBoks) return;
      feilBoks.textContent = melding;
      feilBoks.hidden = false;
    }

    function skjulFeil() {
      if (!feilBoks) return;
      feilBoks.hidden = true;
      feilBoks.textContent = '';
    }

    function leggRad(liste, term, verdi) {
      if (!liste) return;
      var rad = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = verdi;
      rad.appendChild(dt);
      rad.appendChild(dd);
      liste.appendChild(rad);
    }

    function fyllListe(liste) {
      if (!liste) return;
      liste.textContent = '';
      leggRad(liste, 'Tjeneste', valg.tjeneste);
      leggRad(liste, 'Fagområde', valg.fagomrade);
      leggRad(liste, 'Når', valg.naar);
      leggRad(liste, 'Navn', valg.navn);
      if (valg.bedrift) leggRad(liste, 'Bedrift', valg.bedrift);
      if (valg.epost) leggRad(liste, 'E-post', valg.epost);
      if (valg.telefon) leggRad(liste, 'Telefon', valg.telefon);
    }

    function fokuserSteg(n) {
      var aktiv = skjema.querySelector('[data-steg="' + n + '"]');
      if (!aktiv) return;
      var maal = aktiv.querySelector('input:not([type="radio"]), select, button');
      if (maal && maal.focus) {
        try {
          maal.focus({ preventScroll: true });
        } catch (feil) {
          maal.focus();
        }
      }
    }

    function visSteg(n, giFokus) {
      naaSteg = n;
      steg.forEach(function (del) {
        del.hidden = Number(del.getAttribute('data-steg')) !== n;
      });
      merker.forEach(function (merke, indeks) {
        merke.classList.toggle('er-aktiv', indeks + 1 === n);
        merke.classList.toggle('er-ferdig', indeks + 1 < n);
      });
      skjulFeil();
      if (n === 3) fyllListe(oppsummering);
      if (giFokus) fokuserSteg(n);
    }

    function gyldigEpost(verdi) {
      return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(verdi);
    }

    function neste() {
      lesSkjema();
      if (naaSteg === 1) {
        if (!valg.tjeneste) {
          visFeil('Velg hvilken tjeneste forespørselen gjelder.');
          return;
        }
        visSteg(2, true);
        return;
      }
      if (naaSteg === 2) {
        if (valg.navn.length < 2) {
          visFeil('Fyll inn navnet deres, så vi vet hvem vi svarer.');
          return;
        }
        if (!valg.epost && !valg.telefon) {
          visFeil('Fyll inn e-post eller telefon, så vi kan svare.');
          return;
        }
        if (valg.epost && !gyldigEpost(valg.epost)) {
          visFeil('E-postadressen ser ikke helt riktig ut.');
          return;
        }
        visSteg(3, true);
      }
    }

    function referanse() {
      var dager = '';
      try {
        dager = new Intl.DateTimeFormat('en-GB', {
          timeZone: TIDSSONE,
          day: '2-digit',
          month: '2-digit'
        })
          .format(new Date())
          .replace('/', '');
      } catch (feil) {
        dager = '0000';
      }
      return 'FP-' + dager + '-' + (Math.floor(Math.random() * 9000) + 1000);
    }

    function svarTekst() {
      var status = statusNaa();
      if (!status) return 'Forespørselen er klar til å sendes på e-post.';
      if (status.aapen) {
        return 'Registrert i åpningstiden: telefonen er åpen til kl. ' + klokke(status.vindu[1]) + '.';
      }
      if (status.naa.min < status.vindu[0]) {
        return 'Registrert før åpningstid: telefonen åpner kl. ' + klokke(status.vindu[0]) + ' i dag.';
      }
      return 'Registrert etter åpningstid: telefonen åpner i morgen kl. ' + klokke(vindu(imorgenHelg())[0]) + '.';
    }

    function byggEpost(lenke) {
      if (!lenke) return;
      var linjer = [
        'Tjeneste: ' + valg.tjeneste,
        'Fagområde: ' + valg.fagomrade,
        'Når: ' + valg.naar,
        'Navn: ' + valg.navn
      ];
      if (valg.bedrift) linjer.push('Bedrift: ' + valg.bedrift);
      if (valg.epost) linjer.push('E-post: ' + valg.epost);
      if (valg.telefon) linjer.push('Telefon: ' + valg.telefon);

      lenke.setAttribute(
        'href',
        'mailto:finn@finnpersonal.no?subject=' +
          encodeURIComponent('Forespørsel ' + (kvitteringRef ? kvitteringRef.textContent : '')) +
          '&body=' +
          encodeURIComponent(linjer.join('\n'))
      );
    }

    skjema.addEventListener('click', function (hendelse) {
      var knapp = hendelse.target && hendelse.target.closest('button');
      if (!knapp) return;
      if (knapp.hasAttribute('data-neste')) {
        neste();
      } else if (knapp.hasAttribute('data-forrige') && naaSteg > 1) {
        visSteg(naaSteg - 1, true);
      }
    });

    skjema.addEventListener('change', function (hendelse) {
      if (hendelse.target && hendelse.target.name === 'tjeneste') skjulFeil();
    });

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      lesSkjema();
      if (naaSteg !== 3) {
        neste();
        return;
      }
      if (!valg.tjeneste) {
        visSteg(1, true);
        visFeil('Velg hvilken tjeneste forespørselen gjelder.');
        return;
      }
      if (!valg.navn || valg.navn.length < 2) {
        visSteg(2, true);
        visFeil('Fyll inn navnet deres, så vi vet hvem vi svarer.');
        return;
      }
      if (!valg.epost && !valg.telefon) {
        visSteg(2, true);
        visFeil('Fyll inn e-post eller telefon, så vi kan svare.');
        return;
      }

      fyllListe(kvitteringListe);
      if (kvitteringRef) kvitteringRef.textContent = referanse();
      if (kvitteringSvar) kvitteringSvar.textContent = svarTekst();
      byggEpost(epostKnapp);

      skjema.hidden = true;
      if (fremdrift) fremdrift.hidden = true;
      kvittering.hidden = false;

      var forste = document.getElementById('fp-epost');
      if (forste && forste.focus) {
        try {
          forste.focus({ preventScroll: true });
        } catch (feil) {
          forste.focus();
        }
      }
    });

    if (nyKnapp) {
      nyKnapp.addEventListener('click', function () {
        skjema.reset();
        valg = {};
        kvittering.hidden = true;
        skjema.hidden = false;
        if (fremdrift) fremdrift.hidden = false;
        visSteg(1, false);
        if (skjemaKort && skjemaKort.scrollIntoView) {
          skjemaKort.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      });
    }

    visSteg(1, false);
  }

  /* Innholdet er alltid synlig: ingen innfasing som kan bli stående på
     opacity 0 hvis en observatør eller en skjermleser ikke følger med. */
})();
