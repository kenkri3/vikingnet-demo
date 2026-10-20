/*
  Dagmamma.no — interaksjon.
  Alt kjører i nettleseren. Ingenting sendes til en server, og ingenting lagres.

  1. Mobilmeny
  2. Svarassistenten: korte svar hentet fra dagmamma.no sine egne sider
  3. Prisanslaget: regner med satsene fra deres egen prisguide
  4. Forespørselen: validering og kvittering med mailto-fallback
*/
(function () {
  'use strict';

  var tall = new Intl.NumberFormat('nb-NO');
  var kr = function (n) {
    return tall.format(n) + ' kr';
  };

  document.documentElement.classList.add('js');

  /* ---------------- 1. Mobilmeny ---------------- */

  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    var setNav = function (open) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
    };

    // På bred skjerm er menyen alltid synlig og skal ikke bære hidden-attributtet.
    var bredSkjerm = window.matchMedia('(min-width: 901px)');
    var synkNav = function () {
      if (bredSkjerm.matches) {
        nav.removeAttribute('hidden');
        navToggle.setAttribute('aria-expanded', 'true');
      } else if (navToggle.getAttribute('aria-expanded') !== 'true') {
        nav.setAttribute('hidden', '');
      }
    };

    if (typeof bredSkjerm.addEventListener === 'function') {
      bredSkjerm.addEventListener('change', synkNav);
    }
    synkNav();

    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setNav(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  /* ---------------- 2. Svarassistenten ---------------- */

  var SVAR = [
    {
      test: /abonn|melding|fornye/,
      tekst:
        'Et abonnement koster 99 kr per uke, 249 kr per måned, 499 kr per kvartal eller 899 kr per år. ' +
        'Det fornyes til du stopper det. Alle kan svare gratis på meldinger, også uten abonnement.'
    },
    {
      test: /dagmamma/,
      tekst:
        'En dagmamma på heltid koster ofte rundt 9 000–10 000 kr i måneden eller mer. ' +
        'Tommelfingerregelen i prisguiden vår er ca. 8 700 kr og oppover. Full kontantstøtte er 7 500 kr i måneden.'
    },
    {
      test: /pris|kost|koster|timepris|betale|dyr/,
      tekst:
        'Vanlig timepris for barnevakt er 100–180 kr i 2026, med en median på ca. 130 kr. ' +
        'Mange tar betalt for minst to timer per oppdrag. Prisen avtales alltid mellom familien og barnepasseren.'
    },
    {
      test: /bankid|ekte|trygg|politi|verifis|falsk/,
      tekst:
        'Alle brukere kan bekrefte identiteten sin gratis med BankID og får da logoen på profilen. ' +
        'Barnepassere kan i tillegg registrere politiattest, og profiler kontrolleres før de publiseres. ' +
        'Vi har også rapporteringsrutiner i samarbeid med Kripos.'
    },
    {
      test: /skatt|fradrag|a-melding|melde/,
      tekst:
        'Du kan betale samme barnevakt opptil 6 000 kr per år skattefritt for arbeid i hjemmet. ' +
        'Foreldrefradraget er 15 000 kr for første barn og 10 000 kr per ekstra barn i 2026.'
    },
    {
      test: /kommune|bergen|oslo|trondheim|stavanger|sandnes|bærum|asker|fredrikstad|nær|område|hele norge/,
      tekst:
        'Dagmamma.no er for hele Norge. Du velger kommune i profilen, og familier og barnepassere tar kontakt ' +
        'direkte gjennom meldingstjenesten.'
    },
    {
      test: /kontrakt|avtale|regel|lov/,
      tekst:
        'Kontraktmalen ligger på dagmamma.no, sammen med regelverket for dagmammaer. Bli enige om timepris ' +
        'eller månedspris før første dag, og avtal hva som gjelder ved sykdom, ferie og avlysning.'
    },
    {
      test: /hvordan|start|registrer|begynne|komme i gang|profil/,
      tekst:
        'Du registrerer en gratis profil, forteller hva du tilbyr eller leter etter, og velger kommune. ' +
        'Deretter sender dere meldinger til hverandre gjennom meldingstjenesten — uten mellomledd.'
    }
  ];

  var svarLogg = document.getElementById('svar-logg');
  var svarForm = document.getElementById('svar-form');
  var svarInput = document.getElementById('svar-input');
  var svarChips = document.getElementById('svar-chips');

  var leggTilMelding = function (tekst, type) {
    var p = document.createElement('p');
    p.className = 'msg msg--' + type;
    p.textContent = tekst;
    svarLogg.appendChild(p);

    while (svarLogg.children.length > 14) {
      svarLogg.removeChild(svarLogg.firstElementChild);
    }

    svarLogg.scrollTop = svarLogg.scrollHeight;
    return p;
  };

  var svarPaa = function (sporsmal) {
    var tekst = String(sporsmal || '').trim();
    if (!tekst) {
      return;
    }

    leggTilMelding(tekst, 'bruker');
    svarInput.value = '';

    var lav = tekst.toLowerCase();
    var treff = null;
    for (var i = 0; i < SVAR.length; i += 1) {
      if (SVAR[i].test.test(lav)) {
        treff = SVAR[i];
        break;
      }
    }

    window.setTimeout(function () {
      if (treff) {
        leggTilMelding(treff.tekst, 'bot');
        return;
      }

      var p = leggTilMelding('Det står ikke i sidene jeg har hentet. Send spørsmålet til kundeservice på ', 'bot');
      var a = document.createElement('a');
      a.href = 'mailto:post@dagmamma.no';
      a.textContent = 'post@dagmamma.no';
      p.appendChild(a);
      p.appendChild(document.createTextNode(', så svarer de deg.'));
    }, 240);
  };

  if (svarLogg && svarForm && svarInput) {
    svarForm.addEventListener('submit', function (event) {
      event.preventDefault();
      svarPaa(svarInput.value);
    });

    if (svarChips) {
      svarChips.addEventListener('click', function (event) {
        var knapp = event.target.closest('button[data-sporsmal]');
        if (knapp) {
          svarPaa(knapp.getAttribute('data-sporsmal'));
        }
      });
    }
  }

  /* ---------------- 3. Prisanslaget ---------------- */

  var kalkForm = document.getElementById('kalk-form');

  if (kalkForm) {
    var kalkKategori = document.getElementById('kalk-kategori');
    var kalkTimer = document.getElementById('kalk-timer');
    var kalkTimerUt = document.getElementById('kalk-timer-ut');
    var kalkBarnevakt = document.getElementById('kalk-barnevakt');
    var kalkDagmamma = document.getElementById('kalk-dagmamma');
    var kalkBelop = document.getElementById('kalk-belop');
    var kalkDetalj = document.getElementById('kalk-detalj');
    var kalkForklaring = document.getElementById('kalk-forklaring');

    var valgtType = function () {
      var valgt = kalkForm.querySelector('input[name="kalk-type"]:checked');
      return valgt ? valgt.value : 'barnevakt';
    };

    var oppdaterKalk = function () {
      if (valgtType() === 'dagmamma') {
        kalkBarnevakt.setAttribute('hidden', '');
        kalkDagmamma.removeAttribute('hidden');
        kalkBelop.textContent = '8 700–10 000 kr';
        kalkDetalj.textContent = 'Per måned for dagmamma på heltid. En dagmamma setter sin egen pris.';
        kalkForklaring.textContent =
          'Full kontantstøtte er 7 500 kr i måneden, og makspris i barnehage er 1 200 kr. ' +
          'Dagmamma.no fastsetter ingen priser.';
        return;
      }

      kalkBarnevakt.removeAttribute('hidden');
      kalkDagmamma.setAttribute('hidden', '');

      var valg = kalkKategori.options[kalkKategori.selectedIndex];
      var min = Number(valg.getAttribute('data-min'));
      var maks = Number(valg.getAttribute('data-maks'));
      var timer = Number(kalkTimer.value);
      var faktiskeTimer = Math.max(2, timer);

      kalkTimerUt.textContent = String(timer);
      kalkBelop.textContent = min === maks ? kr(min * faktiskeTimer) : kr(min * faktiskeTimer) + '–' + kr(maks * faktiskeTimer);
      kalkDetalj.textContent =
        faktiskeTimer +
        ' timer × ' +
        (min === maks ? kr(min) : kr(min) + '–' + kr(maks)) +
        ' per time' +
        (timer < 2 ? '. Mange tar betalt for minst to timer, så vi regner to.' : '.');

      if (maks > min) {
        kalkForklaring.textContent =
          'Spennet følger satsene i prisguiden vår. Prisen avtales alltid mellom familien og barnepasseren.';
      } else if (valg.value === 'ansvar') {
        kalkForklaring.textContent =
          '200 kr er nedre grense i prisguiden for høyt ansvar. Høyere ansvar avtales særskilt.';
      } else {
        kalkForklaring.textContent = 'Prisen avtales alltid mellom familien og barnepasseren.';
      }
    };

    kalkForm.addEventListener('change', oppdaterKalk);
    kalkForm.addEventListener('input', oppdaterKalk);
    kalkForm.addEventListener('submit', function (event) {
      event.preventDefault();
      oppdaterKalk();
    });

    oppdaterKalk();
  }

  /* ---------------- 4. Forespørsel og kvittering ---------------- */

  var skjema = document.getElementById('kontakt-skjema');
  var kvittering = document.getElementById('kvittering');
  var kvitteringListe = document.getElementById('kvittering-liste');
  var kvitteringMalia = document.getElementById('kvittering-malia');
  var kvitteringEndre = document.getElementById('kvittering-endre');
  var feltfeil = document.getElementById('feltfeil');

  if (skjema && kvittering) {
    var felt = {
      navn: document.getElementById('navn'),
      epost: document.getElementById('epost'),
      telefon: document.getElementById('telefon'),
      kommune: document.getElementById('kommune'),
      gjelder: document.getElementById('gjelder'),
      melding: document.getElementById('melding')
    };

    var visFeil = function (melding, feltNode) {
      if (feltfeil) {
        feltfeil.textContent = melding;
        feltfeil.removeAttribute('hidden');
      }
      if (feltNode && typeof feltNode.focus === 'function') {
        feltNode.focus();
      }
    };

    var skjulFeil = function () {
      if (feltfeil) {
        feltfeil.setAttribute('hidden', '');
      }
    };

    var telefonSiffer = function (verdi) {
      return String(verdi || '').replace(/[^\d]/g, '');
    };

    var lagKvittering = function (data) {
      kvitteringListe.textContent = '';

      var rader = [
        ['Navn', data.navn],
        ['E-post', data.epost],
        ['Telefon', data.telefon],
        ['Kommune', data.kommune || 'Ikke oppgitt'],
        ['Gjelder', data.gjelder],
        ['Melding', data.melding || 'Ikke oppgitt']
      ];

      rader.forEach(function (rad) {
        var div = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = rad[0];
        dd.textContent = rad[1];
        div.appendChild(dt);
        div.appendChild(dd);
        kvitteringListe.appendChild(div);
      });

      var emne = 'Forespørsel fra ' + data.navn + ' – ' + data.gjelder;
      var kropp = [
        'Navn: ' + data.navn,
        'E-post: ' + data.epost,
        'Telefon: ' + data.telefon,
        'Kommune: ' + (data.kommune || 'Ikke oppgitt'),
        'Gjelder: ' + data.gjelder,
        '',
        data.melding || ''
      ].join('\n');

      if (kvitteringMalia) {
        kvitteringMalia.href =
          'mailto:post@dagmamma.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
      }
    };

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      skjulFeil();

      var navn = felt.navn ? felt.navn.value.trim() : '';
      var epost = felt.epost ? felt.epost.value.trim() : '';
      var telefon = felt.telefon ? felt.telefon.value.trim() : '';

      if (navn.length < 2) {
        visFeil('Skriv navnet ditt, så vi vet hvem forespørselen gjelder.', felt.navn);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) {
        visFeil('Skriv en e-postadresse vi kan svare på, for eksempel navn@epost.no.', felt.epost);
        return;
      }

      if (telefonSiffer(telefon).length < 8) {
        visFeil('Skriv et telefonnummer med minst åtte sifre.', felt.telefon);
        return;
      }

      var data = {
        navn: navn,
        epost: epost,
        telefon: telefon,
        kommune: felt.kommune ? felt.kommune.value.trim() : '',
        gjelder: felt.gjelder ? felt.gjelder.value : 'Forespørsel',
        melding: felt.melding ? felt.melding.value.trim() : ''
      };

      lagKvittering(data);
      skjema.setAttribute('hidden', '');
      kvittering.removeAttribute('hidden');
      kvittering.setAttribute('tabindex', '-1');
      kvittering.focus();
    });

    if (kvitteringEndre) {
      kvitteringEndre.addEventListener('click', function () {
        kvittering.setAttribute('hidden', '');
        skjema.removeAttribute('hidden');
        if (felt.navn) {
          felt.navn.focus();
        }
      });
    }
  }

  /* ---------------- 5. Rolig innstegning ---------------- */
})();
