/*
  Bangstad Consult AS — app.js
  Kursplanlegger, meny og kontaktskjema. Alt skjer i nettleseren;
  ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  var EPOST = 'arne.bangstad@plponline.no';

  /* Kursene slik de står i kurstilbudet på plponline.no. `pris` er de
     publiserte prisene deres; de vises ikke på denne siden. */
  var KURS = {
    plp: {
      navn: 'PLP-kurs for omstillingskommuner',
      omfang: '16 timer over to dager',
      pris: 49990,
      tags: ['Målstyring', 'Prosjektstyring', 'Gjennomføringsevne', 'Omstilling']
    },
    samlet: {
      navn: 'Samlet prosjektgruppe',
      omfang: '8 timer (én dag)',
      pris: 25990,
      tags: ['Smarte mål', 'Prosjektstyring', 'Milepæler', 'Gevinstrealisering']
    },
    kickoff: {
      navn: 'Kick-off',
      omfang: '3–4 timer',
      pris: 12990,
      tags: ['Interessent', 'Prosjektstyring', 'Definisjon av prosjekt', 'Kommunikasjon']
    },
    styring: {
      navn: 'Prosjektledelse for styringsgruppen',
      omfang: '4 timer',
      pris: 12990,
      tags: ['Roller og ansvar', 'Faseinndeling', 'Målstyring', 'Gevinstrealisering']
    },
    portefolje: {
      navn: 'Prosjektportefølje',
      omfang: '6 timer',
      pris: 29990,
      tags: ['Strategi', 'Porteføljestyring', 'Prosjektstyring', 'Styringsindikator']
    },
    epj: {
      navn: 'Anskaffelse av EPJ',
      omfang: '3–4 timer',
      pris: 12990,
      tags: ['Anskaffelse', 'Prosjektstyring', 'Elektronisk pasientjournal', 'Roller og ansvar', 'Behovsanalyse']
    }
  };

  function kr(tall) {
    return tall.toLocaleString('nb-NO') + ' kr';
  }

  /* ---------- Meny ---------- */

  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var smal = window.matchMedia('(max-width: 960px)');

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
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && smal.matches) settMeny(false);
    });
  }

  if (smal.addEventListener) {
    smal.addEventListener('change', function () {
      settMeny(false);
    });
  }
  settMeny(false);

  /* ---------- Kursplanlegger ---------- */

  var form = document.getElementById('planForm');
  var temaFelt = document.getElementById('pTema');
  var rNavn = document.getElementById('rNavn');
  var rMeta = document.getElementById('rMeta');
  var rProgram = document.getElementById('rProgram');
  var rPris = document.getElementById('rPris');
  var rPrisNote = document.getElementById('rPrisNote');
  var rSend = document.getElementById('rSend');
  var kommuneFelt = document.getElementById('pKommune');
  var navnFelt = document.getElementById('pNavn');

  function lesValg() {
    var tema = temaFelt ? temaFelt.value : 'plp';
    var dager = 2;
    var formValg = 'sted';
    if (form) {
      var d = form.querySelector('input[name="dager"]:checked');
      var f = form.querySelector('input[name="form"]:checked');
      if (d) dager = parseInt(d.value, 10);
      if (f) formValg = f.value;
    }
    return { tema: tema, dager: dager, form: formValg };
  }

  /*  Demo­siden oppgir ingen priser. Kursene har publiserte priser på
      plponline.no, men et prisforslag skal komme fra Arne — ikke fra en
      skisse. Planleggeren sier derfor «pris etter avtale». */
  function prisFor() {
    return null;
  }

  function byggProgram(kurs, dager) {
    var dagerListe = [];

    if (dager === 1) {
      dagerListe.push({
        tittel: 'Dag 1 · Teori og øvelser',
        punkter: kurs.tags.concat(['Gjennomgang av egne problemstillinger'])
      });
      return dagerListe;
    }

    dagerListe.push({ tittel: 'Dag 1 · Teoretiske økter', punkter: kurs.tags });
    dagerListe.push({
      tittel: 'Dag 2 · Praktiske cases',
      punkter: [
        'Deltakerne anvender metodikken på egne prosjekter',
        'Arbeid i grupper med veiledning'
      ]
    });

    if (dager === 3) {
      dagerListe.push({
        tittel: 'Dag 3 · Fordypning og oppfølging',
        punkter: ['Egne prosjekter bearbeides videre', 'Plan for det videre arbeidet']
      });
    }

    return dagerListe;
  }

  function lagListe(program) {
    rProgram.textContent = '';
    program.forEach(function (dag) {
      var boks = document.createElement('div');
      boks.className = 'dag';

      var tittel = document.createElement('p');
      tittel.className = 'dag-t';
      tittel.textContent = dag.tittel;

      var liste = document.createElement('ul');
      dag.punkter.forEach(function (punkt) {
        var li = document.createElement('li');
        li.textContent = punkt;
        liste.appendChild(li);
      });

      boks.appendChild(tittel);
      boks.appendChild(liste);
      rProgram.appendChild(boks);
    });
  }

  function lagEpost(valg, kurs, program, pris) {
    var dagerTekst = valg.dager + (valg.dager === 1 ? ' dag' : ' dager');
    var formTekst = valg.form === 'sted' ? 'Hos dere i kommunen' : 'Digitalt';
    var kommune = kommuneFelt && kommuneFelt.value.trim();
    var navn = navnFelt && navnFelt.value.trim();

    var linjer = [
      'Hei Arne,',
      '',
      'Vi har satt sammen et forslag til kurs på nettsiden:',
      '',
      'Tema: ' + kurs.navn,
      'Omfang: ' + dagerTekst,
      'Gjennomføring: ' + formTekst,
      'Pris: ' + (pris ? pris.tekst + ' (' + pris.note + ')' : 'etter avtale'),
      '',
      'Forslag til program:'
    ];

    program.forEach(function (dag) {
      linjer.push('');
      linjer.push(dag.tittel);
      dag.punkter.forEach(function (punkt) {
        linjer.push('- ' + punkt);
      });
    });

    linjer.push('');
    linjer.push('Kommune/organisasjon: ' + (kommune || ''));
    linjer.push('Kontaktperson: ' + (navn || ''));
    linjer.push('Telefon: ');
    linjer.push('');
    linjer.push('Hilsen');

    var emne = 'Kursforslag: ' + kurs.navn + ' – ' + dagerTekst;
    return 'mailto:' + EPOST +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(linjer.join('\n'));
  }

  function tegn() {
    var valg = lesValg();
    var kurs = KURS[valg.tema] || KURS.plp;
    var program = byggProgram(kurs, valg.dager);
    var pris = prisFor(kurs, valg.dager);

    rNavn.textContent = kurs.navn;
    rMeta.textContent = valg.dager + (valg.dager === 1 ? ' dag' : ' dager') +
      ' · ' + (valg.form === 'sted' ? 'Hos dere i kommunen' : 'Digitalt');

    lagListe(program);

    if (pris) {
      rPris.textContent = pris.tekst;
      rPrisNote.textContent = pris.note;
    } else {
      rPris.textContent = 'Pris etter avtale';
      rPrisNote.textContent = 'avtales skriftlig per kurs';
    }

    rSend.href = lagEpost(valg, kurs, program, pris);
  }

  if (form && temaFelt && rProgram) {
    form.addEventListener('change', tegn);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tegn();
    });
    if (kommuneFelt) kommuneFelt.addEventListener('input', tegn);
    if (navnFelt) navnFelt.addEventListener('input', tegn);
    tegn();
  }

  /* «Sett opp» fra kurstabellen: velg tema og gå til planleggeren. */
  document.querySelectorAll('.kurs-velg').forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      if (!temaFelt) return;
      temaFelt.value = knapp.getAttribute('data-tema');
      tegn();
      var mal = document.getElementById('planlegger');
      if (mal) {
        var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        mal.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
        var etter = temaFelt;
        if (etter) {
          window.setTimeout(function () {
            etter.focus({ preventScroll: true });
          }, rolig ? 0 : 450);
        }
      }
    });
  });

  /* ---------- Kontaktskjema (mailto, ingen backend) ---------- */

  var kontakt = document.getElementById('kontaktForm');
  var kontaktNote = document.getElementById('kontaktNote');

  if (kontakt) {
    kontakt.addEventListener('submit', function (e) {
      e.preventDefault();
      var navn = kontakt.querySelector('[name="navn"]').value.trim();
      var epost = kontakt.querySelector('[name="epost"]').value.trim();
      var kommune = kontakt.querySelector('[name="kommune"]').value.trim();
      var melding = kontakt.querySelector('[name="melding"]').value.trim();

      var linjer = [
        'Hei Arne,',
        '',
        melding,
        '',
        'Navn: ' + navn,
        'E-post: ' + epost
      ];
      if (kommune) linjer.push('Kommune/organisasjon: ' + kommune);

      var emne = 'Henvendelse fra ' + (kommune || navn);
      window.location.href = 'mailto:' + EPOST +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));

      if (kontaktNote) {
        kontaktNote.textContent =
          'E-postprogrammet ditt åpnes nå med meldingen. Ingenting er sendt før du trykker send der.';
      }
    });
  }

  /* ---------- Rolig innkomst av seksjoner ---------- */

  var roligBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var elementer = document.querySelectorAll('[data-reveal]');

  if (!roligBevegelse && 'IntersectionObserver' in window && elementer.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (opp) {
        if (opp.isIntersecting) {
          opp.target.classList.add('er-synlig');
          observator.unobserve(opp.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elementer.forEach(function (el) {
      el.classList.add('js-reveal');
      observator.observe(el);
    });
  }
})();
