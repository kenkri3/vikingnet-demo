/*
  Smistad Mur og Flis AS — app.js
  To ting brukeren kan gjøre: se om det er åpent nå, og sende en forespørsel
  i tre steg med kvittering. Alt skjer i nettleseren. Ingenting sendes til en
  server, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */
  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function erMobil() {
    return window.innerWidth <= 1000;
  }

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.hidden = true;
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (meny && menyKnapp) {
    // På mobil starter menyen lukket. På brede skjermer viser CSS den uansett.
    if (erMobil()) meny.hidden = true;

    menyKnapp.addEventListener('click', function () {
      var apen = meny.hidden;
      meny.hidden = !apen;
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (!erMobil()) {
        meny.hidden = false;
        menyKnapp.setAttribute('aria-expanded', 'false');
      } else if (menyKnapp.getAttribute('aria-expanded') !== 'true') {
        meny.hidden = true;
      }
    });
  }

  /* ---------------- Årstall i footer ---------------- */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Åpent nå ----------------
     Åpningstidene er hentet fra kundens egen side: mandag–fredag 08:00–16:00,
     lørdag og søndag stengt. Klokka regnes i norsk tid, ikke i brukerens.
  */
  var apentStatus = document.getElementById('apentStatus');
  var apentTekst = document.getElementById('apentTekst');

  var DAGNAVN = {
    Mon: 'mandag',
    Tue: 'tirsdag',
    Wed: 'onsdag',
    Thu: 'torsdag',
    Fri: 'fredag',
    Sat: 'lørdag',
    Sun: 'søndag'
  };
  var UKEDAGER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function norskTid() {
    try {
      var format = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Oslo',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      var deler = format.formatToParts(new Date());
      var ukedag = '';
      var time = 0;
      var minutt = 0;

      deler.forEach(function (del) {
        if (del.type === 'weekday') ukedag = del.value;
        if (del.type === 'hour') time = Number(del.value) % 24;
        if (del.type === 'minute') minutt = Number(del.value);
      });

      if (!ukedag) return null;
      return { ukedag: ukedag, minutter: time * 60 + minutt };
    } catch (error) {
      return null;
    }
  }

  function nesteApning(na) {
    var start = UKEDAGER.indexOf(na.ukedag);
    if (start < 0) return '';

    for (var i = 0; i < 8; i++) {
      var indeks = (start + i) % 7;
      var dag = UKEDAGER[indeks];
      var erHverdag = indeks <= 4;

      if (!erHverdag) continue;
      if (i === 0 && na.minutter >= 8 * 60) continue;

      if (i === 0) return 'åpner 08:00 i dag';
      if (i === 1) return 'åpner 08:00 i morgen';
      return 'åpner ' + DAGNAVN[dag] + ' 08:00';
    }

    return '';
  }

  function oppdaterApent() {
    if (!apentStatus || !apentTekst) return;

    var na = norskTid();
    if (!na) {
      apentStatus.setAttribute('data-status', 'lukket');
      apentTekst.textContent = 'Mandag til fredag 08:00–16:00';
      return;
    }

    var hverdag = UKEDAGER.indexOf(na.ukedag) <= 4;
    var innenfor = na.minutter >= 8 * 60 && na.minutter < 16 * 60;

    if (hverdag && innenfor) {
      var minutterIgjen = 16 * 60 - na.minutter;
      apentStatus.setAttribute('data-status', 'apent');
      apentTekst.textContent = minutterIgjen <= 60
        ? 'Åpent nå · stenger om ' + minutterIgjen + ' min'
        : 'Åpent nå · stenger 16:00';
      return;
    }

    apentStatus.setAttribute('data-status', 'stengt');
    apentTekst.textContent = 'Stengt nå · ' + nesteApning(na);
  }

  oppdaterApent();
  window.setInterval(oppdaterApent, 60 * 1000);

  /* ---------------- Forespørsel ----------------
     Steg 1: tjeneste og hvem oppdraget gjelder.
     Steg 2: sted, oppstart og en kort beskrivelse.
     Steg 3: kontaktinfo. Steg 4: kvittering med referansenummer og e-post.
  */
  var skjema = document.getElementById('foresporselSkjema');
  var mottak = document.getElementById('mottak');

  if (skjema && mottak) {
    var visninger = Array.prototype.slice.call(skjema.querySelectorAll('.visning'));
    var indikatorer = Array.prototype.slice.call(mottak.querySelectorAll('.mottak__steg li'));
    var tjenesteValg = document.getElementById('tjenesteValg');
    var markedValg = document.getElementById('markedValg');
    var feilTjeneste = document.getElementById('feilTjeneste');
    var kvInnhold = document.getElementById('kvInnhold');
    var kvRef = document.getElementById('kvRef');
    var sendStatus = document.getElementById('sendStatus');

    var steg = 1;
    var referanse = '';

    var PAAKREVD = {
      sted: 'Fyll inn sted eller adresse for oppdraget.',
      navn: 'Fyll inn navnet ditt.',
      telefon: 'Fyll inn et telefonnummer vi kan nå deg på.',
      epost: 'Fyll inn en e-postadresse vi kan svare til.'
    };

    function valgt(beholder) {
      if (!beholder) return '';
      var knapp = beholder.querySelector('button[aria-pressed="true"]');
      return knapp ? knapp.getAttribute('data-verdi') : '';
    }

    function felt(id) {
      return document.getElementById(id);
    }

    function verdi(id) {
      var el = felt(id);
      return el ? String(el.value || '').trim() : '';
    }

    function lagRef() {
      var arstall = new Date().getFullYear();
      var tilfeldig = Math.floor(1000 + Math.random() * 9000);
      return 'SMF-' + arstall + '-' + tilfeldig;
    }

    function feilmelding(id) {
      var v = verdi(id);
      if (!v) return PAAKREVD[id] || 'Feltet må fylles ut.';

      if (id === 'epost' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return 'Skriv en gyldig e-postadresse, f.eks. navn@epost.no.';
      }

      if (id === 'telefon') {
        var siffer = v.replace(/[^0-9]/g, '');
        if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
      }

      return '';
    }

    function visFeltfeil(id, melding) {
      var ramme = skjema.querySelector('[data-felt="' + id + '"]');
      if (!ramme) return;
      var feil = ramme.querySelector('[data-feil-for="' + id + '"]');
      var el = felt(id);

      if (melding) {
        ramme.setAttribute('data-ugyldig', 'true');
        if (el) el.setAttribute('aria-invalid', 'true');
        if (feil) feil.textContent = melding;
      } else {
        ramme.removeAttribute('data-ugyldig');
        if (el) el.removeAttribute('aria-invalid');
        if (feil) feil.textContent = '';
      }
    }

    function sjekkSteg(nummer) {
      var forsteFeil = null;

      if (nummer === 1) {
        var tjeneste = valgt(tjenesteValg);
        if (!tjeneste) {
          if (feilTjeneste) feilTjeneste.textContent = 'Velg hvilken tjeneste henvendelsen gjelder.';
          if (!forsteFeil) forsteFeil = tjenesteValg ? tjenesteValg.querySelector('button') : null;
        } else if (feilTjeneste) {
          feilTjeneste.textContent = '';
        }

        if (!valgt(markedValg)) {
          var forsteMarked = markedValg ? markedValg.querySelector('button') : null;
          if (forsteMarked) forsteMarked.setAttribute('aria-pressed', 'true');
        }

        if (forsteFeil) forsteFeil.focus();
        return !forsteFeil;
      }

      var felter = nummer === 2 ? ['sted'] : ['navn', 'telefon', 'epost'];

      felter.forEach(function (id) {
        var melding = feilmelding(id);
        visFeltfeil(id, melding);
        if (melding) {
          if (!forsteFeil) forsteFeil = felt(id);
        }
      });

      if (forsteFeil) forsteFeil.focus();
      return !forsteFeil;
    }

    function vis(nummer, flytt) {
      steg = nummer;

      visninger.forEach(function (visning) {
        visning.hidden = Number(visning.getAttribute('data-visning')) !== nummer;
      });

      indikatorer.forEach(function (ind, i) {
        var n = i + 1;
        ind.classList.toggle('is-current', nummer === n);
        ind.classList.toggle('is-done', nummer > n);
        if (nummer === n) {
          ind.setAttribute('aria-current', 'step');
        } else {
          ind.removeAttribute('aria-current');
        }
      });

      if (nummer === 4) {
        if (!referanse) referanse = lagRef();
        fyllKvittering();
        if (sendStatus) sendStatus.textContent = '';
      }

      if (flytt === false) return;

      mottak.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function rader() {
      var oppstart = verdi('oppstart');
      var beskrivelse = verdi('beskrivelse');
      var liste = [
        ['Tjeneste', valgt(tjenesteValg) || 'Ikke valgt'],
        ['Gjelder', valgt(markedValg) || 'Ikke valgt'],
        ['Sted', verdi('sted')],
        ['Ønsket oppstart', oppstart],
        ['Navn', verdi('navn')],
        ['Telefon', verdi('telefon')],
        ['E-post', verdi('epost')]
      ];

      if (beskrivelse) liste.push(['Om oppdraget', beskrivelse]);
      return liste;
    }

    function fyllKvittering() {
      if (kvRef) kvRef.textContent = referanse;
      if (!kvInnhold) return;

      kvInnhold.textContent = '';
      rader().forEach(function (rad) {
        var div = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = rad[0];
        dd.textContent = rad[1];
        div.appendChild(dt);
        div.appendChild(dd);
        kvInnhold.appendChild(div);
      });
    }

    function epostLenke() {
      var tjeneste = valgt(tjenesteValg) || 'Henvendelse';
      var sted = verdi('sted');
      var emne = 'Forespørsel fra nettsiden: ' + tjeneste + (sted ? ' – ' + sted : '');
      var linjer = ['Hei!', '', 'Jeg sender en forespørsel fra nettsiden deres.', ''];

      rader().forEach(function (rad) {
        linjer.push(rad[0] + ': ' + rad[1]);
      });

      linjer.push('', 'Referanse: ' + referanse, '', 'Hilsen ' + verdi('navn'));

      return 'mailto:post@smistadmurogflis.no?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));
    }

    mottak.addEventListener('click', function (event) {
      var knapp = event.target.closest('[data-neste], [data-tilbake]');
      if (!knapp) return;

      var tilbake = knapp.getAttribute('data-tilbake');
      if (tilbake) {
        vis(Number(tilbake));
        return;
      }

      var neste = knapp.getAttribute('data-neste');
      if (!neste) return;

      var mal = Number(neste);
      if (mal > steg && !sjekkSteg(steg)) return;
      vis(mal);
    });

    // Valgknappene er en enkel gruppe: ett valg om gangen.
    [tjenesteValg, markedValg].forEach(function (gruppe) {
      if (!gruppe) return;
      gruppe.addEventListener('click', function (event) {
        var knapp = event.target.closest('button[data-verdi]');
        if (!knapp) return;

        Array.prototype.forEach.call(gruppe.querySelectorAll('button'), function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        knapp.setAttribute('aria-pressed', 'true');

        if (gruppe === tjenesteValg && feilTjeneste) feilTjeneste.textContent = '';
      });
    });

    skjema.addEventListener('input', function (event) {
      var el = event.target;
      if (!el.id) return;
      var ramme = el.closest('[data-felt]');
      if (ramme && ramme.hasAttribute('data-ugyldig')) {
        visFeltfeil(el.id, feilmelding(el.id));
      }
    });

    skjema.addEventListener('change', function (event) {
      var el = event.target;
      if (!el.id) return;
      var ramme = el.closest('[data-felt]');
      if (ramme && ramme.hasAttribute('data-ugyldig')) {
        visFeltfeil(el.id, feilmelding(el.id));
      }
    });

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      if (steg < 4 && sjekkSteg(steg)) vis(steg + 1);
    });

    var sendEpost = document.getElementById('sendEpost');
    if (sendEpost) {
      sendEpost.addEventListener('click', function () {
        window.location.href = epostLenke();
        if (sendStatus) {
          sendStatus.textContent = 'E-postklienten din åpnes med henvendelsen ferdig utfylt. ' +
            'Skjer det ingenting, kan du sende den til post@smistadmurogflis.no.';
        }
      });
    }

    var skrivUt = document.getElementById('skrivUt');
    if (skrivUt) {
      skrivUt.addEventListener('click', function () {
        document.documentElement.classList.add('is-printing');
        window.print();
        window.setTimeout(function () {
          document.documentElement.classList.remove('is-printing');
        }, 500);
      });
    }

    var nyHenvendelse = document.getElementById('nyHenvendelse');
    if (nyHenvendelse) {
      nyHenvendelse.addEventListener('click', function () {
        skjema.reset();
        referanse = '';
        if (tjenesteValg) {
          Array.prototype.forEach.call(tjenesteValg.querySelectorAll('button'), function (b) {
            b.setAttribute('aria-pressed', 'false');
          });
        }
        if (markedValg) {
          Array.prototype.forEach.call(markedValg.querySelectorAll('button'), function (b, i) {
            b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
          });
        }
        ['sted', 'navn', 'telefon', 'epost'].forEach(function (id) {
          visFeltfeil(id, '');
        });
        if (feilTjeneste) feilTjeneste.textContent = '';
        if (kvInnhold) kvInnhold.textContent = '';
        vis(1);
      });
    }

    vis(1, false);
  }
})();
