/*
  app.js — Byggrent
  Alt skjer i nettleseren. Ingen data forlater siden, og ingenting sendes før
  brukeren selv åpner e-postprogrammet fra oppsummeringen.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* ---------------- Mobilmeny ---------------- */

  var velger = document.querySelector('.nav-toggle');
  var meny = document.getElementById('meny');

  if (velger && meny) {
    velger.addEventListener('click', function () {
      var open = meny.classList.toggle('is-open');
      velger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) {
        meny.classList.remove('is-open');
        velger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && meny.classList.contains('is-open')) {
        meny.classList.remove('is-open');
        velger.setAttribute('aria-expanded', 'false');
        velger.focus();
      }
    });
  }

  /* ---------------- Innhold som tonar inn ---------------- */

  var los = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && los.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    los.forEach(function (element) {
      observator.observe(element);
    });
  } else {
    los.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  /* ---------------- Årstall i bunnen ---------------- */

  var aar = document.getElementById('ar');
  if (aar) {
    aar.textContent = String(new Date().getFullYear());
  }

  /* ---------------- Renholdplan ---------------- */

  var TYPER = {
    kontor: {
      navn: 'Kontor og lokaler',
      oppgaver: [
        'Gulvvask og støvsuging i alle rom',
        'Tørke av bord, dørhåndtak og kontaktflater',
        'Toalett, kjøkken og pauserom',
        'Tømming av søppel og pant'
      ]
    },
    bygg: {
      navn: 'Bygg og nybygg',
      oppgaver: [
        'Klarvask før overtakelse',
        'Fjerne byggstøv fra flater, lister og ventiler',
        'Vinduer og glass uten merker etter beskyttelsesfilm',
        'Sluttrengjøring av bad og kjøkken'
      ]
    },
    brakke: {
      navn: 'Brakke og rigg',
      oppgaver: [
        'Rigg, spiserom og møterom',
        'Toalett og dusj',
        'Søppel og påfyll av forbruksmateriell',
        'Trapper og gangsoner'
      ]
    },
    privat: {
      navn: 'Privat og flytting',
      oppgaver: [
        'Flyttevask med garanti',
        'Nedvask av kjøkken og bad',
        'Innvendig vindusvask',
        'Gulv, lister og innvendige skap'
      ]
    }
  };

  var HYPPIGHET = {
    daglig: 'Hver arbeidsdag',
    tre: 'To til tre dager i uken',
    uke: 'Én dag i uken',
    behov: 'Ved behov'
  };

  var TIDSPUNKT = {
    dag: 'Dag',
    kveld: 'Kveld',
    natt: 'Natt',
    helg: 'Helg'
  };

  var skjema = document.querySelector('.plan__skjema');

  if (skjema) {
    var valg = {
      type: 'kontor',
      areal: 400,
      frekvens: 'tre',
      tid: 'dag',
      navn: '',
      kontakt: ''
    };

    var steg = 1;
    var SISTE = 4;

    var stegVisere = skjema.querySelectorAll('[data-steg]');
    var knappNeste = skjema.querySelector('[data-neste]');
    var knappForrige = skjema.querySelector('[data-forrige]');
    var knappNullstill = skjema.querySelector('[data-nullstill]');
    var stolpe = skjema.querySelector('[data-stolpe]');
    var trinnTekst = skjema.querySelector('[data-trinn]');
    var feilTekst = skjema.querySelector('[data-feil]');
    var sumListe = skjema.querySelector('[data-sum]');
    var sendLenke = skjema.querySelector('[data-send]');
    var arealInn = document.getElementById('areal');
    var arealUt = document.getElementById('areal-ut');
    var navnInn = document.getElementById('navn');
    var kontaktInn = document.getElementById('kontakt');

    var utTittel = document.querySelector('[data-ut-tittel]');
    var utMeta = document.querySelector('[data-ut-meta]');
    var utOppgaver = document.querySelector('[data-ut-oppgaver]');

    function arealTekst(verdi) {
      return String(verdi).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' m²';
    }

    function trykk(gruppe, aktiv) {
      var knapper = skjema.querySelectorAll('[data-' + gruppe + ']');
      Array.prototype.forEach.call(knapper, function (knapp) {
        var erValgt = knapp.getAttribute('data-' + gruppe) === aktiv;
        knapp.setAttribute('aria-pressed', erValgt ? 'true' : 'false');
      });
    }

    function lagEpost() {
      var type = TYPER[valg.type];
      var linjer = [
        'Forespørsel om renhold – sendt fra nettsiden',
        '',
        'Type lokale: ' + type.navn,
        'Areal: ca. ' + valg.areal + ' m²',
        'Hyppighet: ' + HYPPIGHET[valg.frekvens],
        'Når: ' + TIDSPUNKT[valg.tid],
        'Navn: ' + (valg.navn || 'ikke oppgitt'),
        'Kontakt: ' + (valg.kontakt || 'ikke oppgitt'),
        '',
        'Foreslått oppgaveliste:'
      ];

      type.oppgaver.forEach(function (oppgave) {
        linjer.push('- ' + oppgave);
      });

      return 'mailto:kontor@byggrent.no'
        + '?subject=' + encodeURIComponent('Renholdsforespørsel: ' + type.navn + ' – ca. ' + valg.areal + ' m²')
        + '&body=' + encodeURIComponent(linjer.join('\r\n'));
    }

    function tegn() {
      var type = TYPER[valg.type];

      if (utTittel) {
        utTittel.textContent = type.navn;
      }

      if (utMeta) {
        utMeta.textContent = 'Ca. ' + valg.areal + ' m² · '
          + HYPPIGHET[valg.frekvens] + ' · ' + TIDSPUNKT[valg.tid];
      }

      if (utOppgaver) {
        utOppgaver.innerHTML = '';
        type.oppgaver.forEach(function (oppgave) {
          var li = document.createElement('li');
          li.textContent = oppgave;
          utOppgaver.appendChild(li);
        });
      }

      if (sumListe) {
        var rader = [
          ['Type lokale', type.navn],
          ['Areal', 'Ca. ' + valg.areal + ' m²'],
          ['Hyppighet', HYPPIGHET[valg.frekvens]],
          ['Når', TIDSPUNKT[valg.tid]],
          ['Navn', valg.navn],
          ['Kontakt', valg.kontakt]
        ];

        sumListe.innerHTML = '';
        rader.forEach(function (rad) {
          var li = document.createElement('li');
          var ett = document.createElement('span');
          var to = document.createElement('span');
          ett.textContent = rad[0];
          to.textContent = rad[1];
          li.appendChild(ett);
          li.appendChild(to);
          sumListe.appendChild(li);
        });
      }

      if (sendLenke) {
        sendLenke.setAttribute('href', lagEpost());
      }
    }

    function visSteg() {
      Array.prototype.forEach.call(stegVisere, function (element) {
        var nummer = Number(element.getAttribute('data-steg'));
        if (nummer === steg) {
          element.removeAttribute('hidden');
        } else {
          element.setAttribute('hidden', '');
        }
      });

      if (stolpe) {
        stolpe.style.width = Math.round((steg / SISTE) * 100) + '%';
      }

      if (trinnTekst) {
        trinnTekst.textContent = 'Steg ' + steg + ' av ' + SISTE;
      }

      if (knappForrige) {
        if (steg > 1) {
          knappForrige.removeAttribute('hidden');
        } else {
          knappForrige.setAttribute('hidden', '');
        }
      }

      if (knappNeste) {
        if (steg < SISTE) {
          knappNeste.removeAttribute('hidden');
          knappNeste.textContent = 'Neste';
        } else {
          knappNeste.setAttribute('hidden', '');
        }
      }

      if (knappNullstill) {
        if (steg === SISTE) {
          knappNullstill.removeAttribute('hidden');
        } else {
          knappNullstill.setAttribute('hidden', '');
        }
      }

      tegn();
    }

    function visFeil(vis) {
      if (!feilTekst) {
        return;
      }
      if (vis) {
        feilTekst.removeAttribute('hidden');
      } else {
        feilTekst.setAttribute('hidden', '');
      }
    }

    Array.prototype.forEach.call(skjema.querySelectorAll('[data-type]'), function (knapp) {
      knapp.addEventListener('click', function () {
        valg.type = knapp.getAttribute('data-type');
        trykk('type', valg.type);
        tegn();
      });
    });

    Array.prototype.forEach.call(skjema.querySelectorAll('[data-frekvens]'), function (knapp) {
      knapp.addEventListener('click', function () {
        valg.frekvens = knapp.getAttribute('data-frekvens');
        trykk('frekvens', valg.frekvens);
        tegn();
      });
    });

    Array.prototype.forEach.call(skjema.querySelectorAll('[data-tid]'), function (knapp) {
      knapp.addEventListener('click', function () {
        valg.tid = knapp.getAttribute('data-tid');
        trykk('tid', valg.tid);
        tegn();
      });
    });

    if (arealInn) {
      arealInn.addEventListener('input', function () {
        valg.areal = Number(arealInn.value) || 0;
        if (arealUt) {
          arealUt.textContent = arealTekst(valg.areal);
        }
        tegn();
      });
    }

    if (navnInn) {
      navnInn.addEventListener('input', function () {
        valg.navn = navnInn.value.trim();
        visFeil(false);
        tegn();
      });
    }

    if (kontaktInn) {
      kontaktInn.addEventListener('input', function () {
        valg.kontakt = kontaktInn.value.trim();
        visFeil(false);
        tegn();
      });
    }

    if (knappNeste) {
      knappNeste.addEventListener('click', function () {
        if (steg === 3) {
          if (!valg.navn || !valg.kontakt) {
            visFeil(true);
            if (!valg.navn && navnInn) {
              navnInn.focus();
            } else if (kontaktInn) {
              kontaktInn.focus();
            }
            return;
          }
          visFeil(false);
        }

        if (steg < SISTE) {
          steg += 1;
          visSteg();
        }
      });
    }

    if (knappForrige) {
      knappForrige.addEventListener('click', function () {
        if (steg > 1) {
          steg -= 1;
          visSteg();
        }
      });
    }

    if (knappNullstill) {
      knappNullstill.addEventListener('click', function () {
        steg = 1;
        valg.navn = '';
        valg.kontakt = '';
        if (navnInn) {
          navnInn.value = '';
        }
        if (kontaktInn) {
          kontaktInn.value = '';
        }
        visFeil(false);
        visSteg();
      });
    }

    /* Starttilstand: alle grupper markert riktig, planen tegnet med én gang. */
    trykk('type', valg.type);
    trykk('frekvens', valg.frekvens);
    trykk('tid', valg.tid);
    if (arealUt) {
      arealUt.textContent = arealTekst(valg.areal);
    }
    visSteg();
  }
})();
