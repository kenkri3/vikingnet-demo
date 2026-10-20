/*
  Amundsen Sports — app.js

  Tre ting brukeren kan gjøre, alt i nettleseren:
    1. Se hvilken butikk som er åpen nå — regnet ut i butikkens egen tidssone.
    2. Regne ut hva en reparasjon koster, med Amundsens egen sats.
    3. Fylle ut en forespørsel og få en kvittering med referanse.

  Ingen server, ingen innsamling, ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------- Butikkene, slik de står på amundsen.com/en-NO/stores ----------
     timer: åpning og stenging i minutter etter midnatt, lokal tid.
     Nøkkelen er ukedag slik Date.getDay() teller: 0 = søndag … 6 = lørdag.
     timer: null betyr sesongbutikk — da vises notatet i stedet for en tabell. */

  var BUTIKKER = [
    {
      id: 'oslo',
      navn: 'Oslo',
      land: 'Norge',
      tz: 'Europe/Oslo',
      gate: 'Underhaugsveien 28',
      post: '0354 Oslo',
      telefon: '+4767110100',
      telefonVis: '67 11 01 00',
      epost: null,
      timer: {
        1: [600, 1140],
        2: [600, 1140],
        3: [600, 1140],
        4: [600, 1200],
        5: [600, 1140],
        6: [600, 1020],
        0: null
      },
      notat: ''
    },
    {
      id: 'newyork',
      navn: 'New York',
      land: 'USA',
      tz: 'America/New_York',
      gate: '262 Mott St',
      post: 'New York, NY 10012',
      telefon: '+19299965958',
      telefonVis: '+1 929-996-5958',
      epost: 'nyc@amundsen.com',
      timer: {
        1: [660, 1080],
        2: [660, 1080],
        3: [660, 1080],
        4: [660, 1080],
        5: [660, 1080],
        6: [600, 1080],
        0: [660, 1080]
      },
      notat: ''
    },
    {
      id: 'boulder',
      navn: 'Boulder',
      land: 'USA',
      tz: 'America/Denver',
      gate: '2023 17th St #4',
      post: 'Boulder, CO 80302',
      telefon: '+17208800668',
      telefonVis: '+1 720-880-0668',
      epost: 'boulder@amundsen.com',
      timer: {
        1: [660, 1080],
        2: [660, 1080],
        3: [660, 1080],
        4: [600, 1080],
        5: [600, 1080],
        6: [600, 1080],
        0: [720, 1080]
      },
      notat: ''
    },
    {
      id: 'verbier',
      navn: 'Verbier',
      land: 'Sveits',
      tz: 'Europe/Zurich',
      gate: 'Rue de Médran 70',
      post: '1936 Verbier',
      telefon: null,
      telefonVis: null,
      epost: 'shop@amundsen.ch',
      timer: null,
      notat: 'Åpner igjen for sesongen i desember.'
    },
    {
      id: 'kragero',
      navn: 'Kragerø',
      land: 'Norge',
      tz: 'Europe/Oslo',
      gate: 'Ytre Strandvei 3',
      post: '3770 Kragerø',
      telefon: null,
      telefonVis: null,
      epost: 'aleksandra@amundsen.com',
      timer: null,
      notat: 'Sesongåpent: helger fram til 19. juni, deretter hver dag 10–18 til 16. august.'
    }
  ];

  var UKEDAG_LANG = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  var UKEDAG_KORT = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
  var UKEDAG_TABELL = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  var REKKEFOLGE = [1, 2, 3, 4, 5, 6, 0];
  var KORT_UKEDAG = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function klokke(minutter) {
    var t = Math.floor(minutter / 60);
    var m = minutter % 60;
    return (t < 10 ? '0' : '') + t + ':' + (m < 10 ? '0' : '') + m;
  }

  /* Nå, i butikkens egen tidssone. */
  function lokalTid(tz, na) {
    var format = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
    var deler = {};
    format.formatToParts(na).forEach(function (del) {
      deler[del.type] = del.value;
    });
    return {
      dag: KORT_UKEDAG[deler.weekday],
      min: parseInt(deler.hour, 10) * 60 + parseInt(deler.minute, 10),
      klokke: deler.hour + ':' + deler.minute
    };
  }

  /* Er butikken åpen nå, og når åpner den neste gang? */
  function statusFor(butikk, na) {
    var tid;
    try {
      tid = lokalTid(butikk.tz, na);
    } catch (feil) {
      return { apen: false, hoved: 'Åpningstid', detalj: 'se tabellen under', klokke: '', dag: 1, sesong: false };
    }

    if (!butikk.timer) {
      return { apen: false, hoved: 'Sesongstengt', detalj: butikk.notat, klokke: tid.klokke, dag: tid.dag, sesong: true };
    }

    var iDag = butikk.timer[tid.dag];

    if (iDag && tid.min >= iDag[0] && tid.min < iDag[1]) {
      return { apen: true, hoved: 'Åpent nå', detalj: 'stenger ' + klokke(iDag[1]), klokke: tid.klokke, dag: tid.dag, sesong: false };
    }

    for (var steg = 0; steg < 8; steg++) {
      var dag = (tid.dag + steg) % 7;
      var vindu = butikk.timer[dag];
      if (!vindu) continue;
      if (steg === 0 && tid.min >= vindu[1]) continue;
      var naar = steg === 0 ? 'i dag' : UKEDAG_KORT[dag];
      return {
        apen: false,
        hoved: 'Stengt nå',
        detalj: 'åpner ' + naar + ' kl. ' + klokke(vindu[0]),
        klokke: tid.klokke,
        dag: tid.dag,
        sesong: false
      };
    }

    return { apen: false, hoved: 'Stengt nå', detalj: '', klokke: tid.klokke, dag: tid.dag, sesong: false };
  }

  /* ---------- Hero: status for Oslo-butikken ---------- */

  var heroLenke = document.getElementById('heroStatus');
  var heroTekst = document.querySelector('[data-hero-status]');

  function tegnHero() {
    if (!heroTekst) return;
    var butikk = BUTIKKER[0];
    var status = statusFor(butikk, new Date());
    var tekst;
    if (status.sesong) {
      tekst = 'er sesongstengt';
    } else if (status.apen) {
      tekst = 'åpent nå · ' + status.detalj;
    } else {
      tekst = 'stengt nå · ' + status.detalj;
    }
    heroTekst.textContent = tekst;
    if (heroLenke) heroLenke.classList.toggle('is-closed', !status.apen);
  }

  /* ---------- Butikkvelger ---------- */

  var panel = document.getElementById('butikkPanel');
  var faner = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var valgt = 'oslo';

  function timetabell(butikk, iDag) {
    var rader = REKKEFOLGE.map(function (dag) {
      var vindu = butikk.timer[dag];
      var tekst = vindu ? klokke(vindu[0]) + '–' + klokke(vindu[1]) : 'Stengt';
      var idag = dag === iDag;
      return '<tr' + (idag ? ' class="i-dag"' : '') + '>' +
        '<th scope="row">' + UKEDAG_TABELL[dag] +
        (idag ? '<span class="i-dag-merke">i dag</span>' : '') + '</th>' +
        '<td>' + tekst + '</td>' +
        '</tr>';
    }).join('');
    return '<table class="hours">' +
      '<caption class="visually-hidden">Åpningstider for ' + butikk.navn + '</caption>' +
      '<tbody>' + rader + '</tbody></table>';
  }

  function tegnButikk(id) {
    if (!panel) return;
    var butikk = null;
    BUTIKKER.forEach(function (b) {
      if (b.id === id) butikk = b;
    });
    if (!butikk) return;

    var status = statusFor(butikk, new Date());
    var statusTekst = status.hoved + (status.detalj ? ' · ' + status.detalj : '');
    var handlinger = '';

    if (butikk.telefon) {
      handlinger += '<a class="btn" href="tel:' + butikk.telefon + '">Ring ' + butikk.telefonVis + '</a>';
    }
    if (butikk.epost) {
      handlinger += '<a class="btn btn--line" href="mailto:' + butikk.epost + '">' + butikk.epost + '</a>';
    }

    panel.innerHTML =
      '<p class="store__status"><span class="store__dot" aria-hidden="true"></span><span>' + statusTekst + '</span></p>' +
      '<h3 class="store__name">' + butikk.navn + '</h3>' +
      '<p class="store__addr">' + butikk.gate + '<br>' + butikk.post + ', ' + butikk.land + '</p>' +
      (butikk.timer ? timetabell(butikk, status.dag) : '') +
      (handlinger ? '<div class="store__actions">' + handlinger + '</div>' : '') +
      (butikk.timer ? '' : '<p class="store__notat">' + butikk.notat + '</p>') +
      '<p class="store__meta">Lokal tid i ' + butikk.navn + ': ' + status.klokke + '</p>';

    panel.classList.toggle('is-closed', !status.apen);
  }

  function velgButikk(id, flyttFokus) {
    valgt = id;
    faner.forEach(function (fane) {
      var erValgt = fane.getAttribute('data-butikk') === id;
      fane.setAttribute('aria-selected', erValgt ? 'true' : 'false');
      fane.setAttribute('tabindex', erValgt ? '0' : '-1');
      if (erValgt && flyttFokus) fane.focus();
    });
    if (panel) panel.setAttribute('aria-labelledby', 'tab-' + id);
    tegnButikk(id);
  }

  if (faner.length && panel) {
    faner.forEach(function (fane, indeks) {
      fane.addEventListener('click', function () {
        velgButikk(fane.getAttribute('data-butikk'), false);
      });
      fane.addEventListener('keydown', function (hendelse) {
        var retning = 0;
        if (hendelse.key === 'ArrowRight' || hendelse.key === 'ArrowDown') retning = 1;
        if (hendelse.key === 'ArrowLeft' || hendelse.key === 'ArrowUp') retning = -1;
        if (hendelse.key === 'Home') retning = -100;
        if (hendelse.key === 'End') retning = 100;
        if (!retning) return;
        hendelse.preventDefault();
        var neste;
        if (retning === -100) neste = 0;
        else if (retning === 100) neste = faner.length - 1;
        else neste = (indeks + retning + faner.length) % faner.length;
        velgButikk(faner[neste].getAttribute('data-butikk'), true);
      });
    });
    tegnButikk(valgt);
  }

  /* Én gang i minuttet: hold klokke og status fersk. */
  function oppdater() {
    tegnHero();
    tegnButikk(valgt);
  }

  if (panel) {
    window.setInterval(oppdater, 30000);
  }

  /* ---------- Reparasjonskalkulator ---------- */

  var antallFelt = document.getElementById('calcAntall');
  var sumFelt = document.getElementById('calcSum');
  var minus = document.getElementById('calcMinus');
  var pluss = document.getElementById('calcPluss');
  var antall = 1;
  var SATS = 200;

  function tegnKalkulator() {
    if (!antallFelt || !sumFelt) return;
    antallFelt.textContent = String(antall);
    sumFelt.textContent = (SATS * antall).toLocaleString('nb-NO') + ' kr';
  }

  if (minus && pluss) {
    minus.addEventListener('click', function () {
      antall = Math.max(1, antall - 1);
      tegnKalkulator();
    });
    pluss.addEventListener('click', function () {
      antall = Math.min(8, antall + 1);
      tegnKalkulator();
    });
    tegnKalkulator();
  }

  /* ---------- Forespørsel med kvittering ---------- */

  var form = document.getElementById('kontaktForm');
  var note = document.getElementById('formNote');
  var kvittering = document.getElementById('kvittering');
  var kvitteringRef = document.getElementById('kvitteringRef');
  var kvitteringInnhold = document.getElementById('kvitteringInnhold');
  var kvitteringSend = document.getElementById('kvitteringSend');
  var kvitteringNullstill = document.getElementById('kvitteringNullstill');
  var MOTTAKER = 'service@amundsen.com';

  function lagLinje(etiket, verdi) {
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = etiket;
    dd.textContent = verdi;
    rad.appendChild(dt);
    rad.appendChild(dd);
    return rad;
  }

  if (form) {
    form.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      var felter = {
        navn: form.elements.navn,
        epost: form.elements.epost,
        melding: form.elements.melding
      };
      var mangler = [];

      Object.keys(felter).forEach(function (navn) {
        var felt = felter[navn];
        var verdi = felt.value.trim();
        var gyldig = verdi.length > 0;
        if (navn === 'epost') {
          gyldig = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
        }
        felt.classList.toggle('felt-feil', !gyldig);
        felt.setAttribute('aria-invalid', gyldig ? 'false' : 'true');
        if (!gyldig) mangler.push(navn);
      });

      if (mangler.length) {
        if (note) {
          note.classList.add('er-feil');
          note.textContent = 'Fyll ut navn, en gyldig e-postadresse og en melding.';
        }
        felter[mangler[0]].focus();
        return;
      }

      var navnVerdi = felter.navn.value.trim();
      var epostVerdi = felter.epost.value.trim();
      var meldingVerdi = felter.melding.value.trim();
      var gjelderVerdi = form.elements.gjelder.value;
      var referanse = 'ASP-' + new Date().getFullYear() + '-' +
        Math.random().toString(36).slice(2, 6).toUpperCase();
      var registrert = new Date().toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' });

      if (kvitteringRef) kvitteringRef.textContent = referanse;
      if (kvitteringInnhold) {
        kvitteringInnhold.innerHTML = '';
        [
          ['Registrert', registrert],
          ['Navn', navnVerdi],
          ['E-post', epostVerdi],
          ['Gjelder', gjelderVerdi],
          ['Melding', meldingVerdi]
        ].forEach(function (par) {
          kvitteringInnhold.appendChild(lagLinje(par[0], par[1]));
        });
      }

      if (kvitteringSend) {
        var emne = 'Forespørsel ' + referanse + ' — ' + gjelderVerdi;
        var kropp = [
          'Hei,',
          '',
          meldingVerdi,
          '',
          'Navn: ' + navnVerdi,
          'E-post: ' + epostVerdi,
          'Gjelder: ' + gjelderVerdi,
          'Referanse: ' + referanse
        ].join('\n');
        kvitteringSend.setAttribute(
          'href',
          'mailto:' + MOTTAKER + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
        );
      }

      form.hidden = true;
      if (kvittering) {
        kvittering.hidden = false;
        var overskrift = kvittering.querySelector('h3');
        if (overskrift) {
          overskrift.setAttribute('tabindex', '-1');
          overskrift.focus({ preventScroll: false });
        }
      }
      if (note) {
        note.classList.remove('er-feil');
        note.textContent = '';
      }
    });
  }

  if (kvitteringNullstill && form) {
    kvitteringNullstill.addEventListener('click', function () {
      form.reset();
      Array.prototype.forEach.call(form.querySelectorAll('.felt-feil'), function (felt) {
        felt.classList.remove('felt-feil');
        felt.removeAttribute('aria-invalid');
      });
      if (kvittering) kvittering.hidden = true;
      form.hidden = false;
      var forste = form.querySelector('input');
      if (forste) forste.focus();
    });
  }

  /* ---------- Meny på smal skjerm ---------- */

  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var smal = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!nav || !navToggle) return;
    if (smal.matches) {
      nav.hidden = !apen;
      navToggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    } else {
      nav.hidden = false;
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Åpne meny');
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });
  }

  if (nav) {
    nav.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a') && smal.matches) settMeny(false);
    });
  }

  if (smal.addEventListener) {
    smal.addEventListener('change', function () {
      settMeny(false);
    });
  }
  settMeny(false);

  /* ---------- Rolig innkomst ---------- */

  tegnHero();

  var rolige = document.querySelectorAll('.sec-head, .row, .mat__item, .calc, .svc__facts, .st__panel, .press__inner, .contact__info, .contact__form');

  if ('IntersectionObserver' in window && document.documentElement.classList.contains('js')) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (opp) {
        if (opp.isIntersecting) {
          opp.target.classList.add('is-visible');
          observator.unobserve(opp.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    Array.prototype.forEach.call(rolige, function (element, indeks) {
      element.classList.add('reveal');
      if (indeks > 4) element.style.transitionDelay = '0.05s';
      observator.observe(element);
    });

    window.setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.is-visible)'), function (element) {
        element.classList.add('is-visible');
      });
    }, 2500);
  }
})();
