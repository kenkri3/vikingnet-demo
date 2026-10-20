/*
  Lygnalia — klient-side tomtematcher og interesseforespørsel.

  Ingen data sendes noe sted. Tomtene under er Lygnalias egne rader fra
  tomtevelgeren deres (lygnalia.no/tomter/tomtevelger), ført inn som de står:
  tomtenummer, størrelse i m², listepris og status.
*/

(function () {
  'use strict';

  var PLOTS = [
    { id: 722, m2: 1077.4, pris: 890000, status: 'Ledig' },
    { id: 723, m2: 1452.4, pris: 990000, status: 'Ledig' },
    { id: 724, m2: 1649, pris: 1200000, status: 'Ledig' },
    { id: 727, m2: 1345.7, pris: 1300000, status: 'Ledig' },
    { id: 728, m2: 1016.1, pris: 1400000, status: 'Ledig' },
    { id: 729, m2: 1107, pris: 990000, status: 'Ledig' },
    { id: 732, m2: 1048, pris: 990000, status: 'Ledig' },
    { id: 734, m2: 840, pris: 990000, status: 'Ledig' },
    { id: 735, m2: 840, pris: null, status: 'Reservert' },
    { id: 739, m2: 1260.6, pris: 890000, status: 'Ledig' },
    { id: 740, m2: 897.2, pris: 890000, status: 'Ledig' },
    { id: 741, m2: 1017.5, pris: 990000, status: 'Ledig' },
    { id: 742, m2: 1708.1, pris: 1300000, status: 'Ledig' },
    { id: 749, m2: 1141.2, pris: 1400000, status: 'Ledig' },
    { id: 750, m2: 1092.2, pris: 1500000, status: 'Ledig' },
    { id: 752, m2: 1028.4, pris: 1800000, status: 'Ledig' },
    { id: 753, m2: 896.2, pris: 1600000, status: 'Ledig' },
    { id: 754, m2: 781, pris: 1300000, status: 'Ledig' },
    { id: 755, m2: 805.2, pris: 1600000, status: 'Ledig' },
    { id: 725, m2: 1650.5, pris: 1300000, status: 'Ledig' },
    { id: 756, m2: 789, pris: 1500000, status: 'Ledig' },
    { id: 757, m2: 879.4, pris: 1500000, status: 'Ledig' },
    { id: 760, m2: 1087.1, pris: 1600000, status: 'Ledig' },
    { id: 761, m2: 1184.8, pris: 1400000, status: 'Ledig' },
    { id: 762, m2: 1082.5, pris: 1300000, status: 'Ledig' },
    { id: 774, m2: 1207.7, pris: 1400000, status: 'Ledig' },
    { id: 775, m2: 1446.4, pris: 1500000, status: 'Ledig' },
    { id: 776, m2: 1153.4, pris: 1600000, status: 'Ledig' },
    { id: 777, m2: 1214.9, pris: 1300000, status: 'Ledig' },
    { id: 778, m2: 1265.8, pris: 1300000, status: 'Ledig' },
    { id: 779, m2: 1202, pris: 1300000, status: 'Ledig' }
  ];

  var FELT = 'Felt D – Sprangåsen';
  var SYNLIGE_FORST = 6;

  var $ = function (id) { return document.getElementById(id); };

  var tilstand = {
    budsjett: 1800000,
    minste: 750,
    bareLedige: true,
    visAlle: false
  };

  function kr(n) {
    return 'kr ' + n.toLocaleString('nb-NO');
  }

  function kvadrat(n) {
    return n.toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' m²';
  }

  /* ---------- Filter ---------- */

  function treff() {
    return PLOTS.filter(function (p) {
      var innenforPris = p.pris === null || p.pris <= tilstand.budsjett;
      var storNok = p.m2 >= tilstand.minste;
      var ledig = !tilstand.bareLedige || p.status === 'Ledig';
      return innenforPris && storNok && ledig;
    });
  }

  function lagRad(p) {
    var li = document.createElement('li');
    li.className = 'plotrow';

    var id = document.createElement('span');
    id.className = 'plotrow__id';
    id.textContent = 'Tomt ' + p.id;
    var felt = document.createElement('span');
    felt.className = 'plotrow__felt';
    felt.textContent = FELT;
    id.appendChild(felt);

    var storrelse = document.createElement('span');
    storrelse.className = 'plotrow__size';
    storrelse.textContent = kvadrat(p.m2);

    var pris = document.createElement('span');
    pris.className = 'plotrow__price';
    pris.textContent = p.pris === null ? 'Pris på forespørsel' : kr(p.pris);

    var status = document.createElement('span');
    status.className = 'plotrow__status';
    var pill = document.createElement('span');
    pill.className = 'pill ' + (p.status === 'Ledig' ? 'pill--ledig' : 'pill--reservert');
    pill.textContent = p.status;
    status.appendChild(pill);

    var handling = document.createElement('span');
    handling.className = 'plotrow__action';
    var knapp = document.createElement('button');
    knapp.type = 'button';
    knapp.className = 'btn btn--ghost btn--sm';
    knapp.setAttribute('data-tomt', String(p.id));
    knapp.textContent = 'Velg';
    handling.appendChild(knapp);

    li.appendChild(id);
    li.appendChild(storrelse);
    li.appendChild(pris);
    li.appendChild(status);
    li.appendChild(handling);
    return li;
  }

  function tegn() {
    var start = performance.now();
    var liste = treff();
    var brukt = performance.now() - start;

    var antall = $('treff');
    var antallTekst = liste.length === 1 ? '1 tomt passer' : liste.length + ' tomter passer';
    if (antall) antall.textContent = antallTekst;

    var tidsbruk = $('treff-tid');
    if (tidsbruk) {
      tidsbruk.textContent = brukt < 1
        ? 'Svar beregnet lokalt på under 1 ms'
        : 'Svar beregnet lokalt på ' + Math.round(brukt) + ' ms';
    }

    var hurtig = $('quick-svar');
    if (hurtig) {
      hurtig.textContent = '';
      var tall = document.createElement('strong');
      tall.textContent = String(liste.length);
      hurtig.appendChild(tall);
      hurtig.appendChild(document.createTextNode(
        liste.length === 1 ? ' tomt passer budsjettet ditt.' : ' tomter passer budsjettet ditt.'
      ));
    }

    var listeEl = $('plotlist');
    if (!listeEl) return;
    while (listeEl.firstChild) listeEl.removeChild(listeEl.firstChild);

    if (liste.length === 0) {
      var tom = document.createElement('li');
      tom.className = 'empty';
      tom.textContent = 'Ingen tomter passer akkurat nå. Øk budsjettet eller senk kravet til størrelse.';
      listeEl.appendChild(tom);
    } else {
      var antallVist = tilstand.visAlle ? liste.length : Math.min(SYNLIGE_FORST, liste.length);
      for (var i = 0; i < antallVist; i++) listeEl.appendChild(lagRad(liste[i]));
    }

    var visAlle = $('vis-alle');
    if (visAlle) {
      if (liste.length > SYNLIGE_FORST) {
        visAlle.hidden = false;
        visAlle.textContent = tilstand.visAlle
          ? 'Vis bare de første ' + SYNLIGE_FORST
          : 'Vis alle ' + liste.length + ' treff';
      } else {
        visAlle.hidden = true;
      }
    }
  }

  /* ---------- Filtre og synkronisering ---------- */

  function settBudsjett(verdi) {
    tilstand.budsjett = verdi;
    var hero = $('budsjett');
    var panel = $('budsjett-2');
    if (hero && Number(hero.value) !== verdi) hero.value = String(verdi);
    if (panel && Number(panel.value) !== verdi) panel.value = String(verdi);
    var heroUt = $('budsjett-ut');
    var panelUt = $('panel-budsjett-ut');
    if (heroUt) heroUt.textContent = kr(verdi);
    if (panelUt) panelUt.textContent = kr(verdi);
    tegn();
  }

  function settStorrelse(verdi) {
    tilstand.minste = verdi;
    var felt = $('storrelse');
    if (felt && Number(felt.value) !== verdi) felt.value = String(verdi);
    var ut = $('storrelse-ut');
    if (ut) ut.textContent = kvadrat(verdi);
    tegn();
  }

  function kobleFiltre() {
    ['budsjett', 'budsjett-2'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', function () { settBudsjett(Number(el.value)); });
    });

    var storrelse = $('storrelse');
    if (storrelse) {
      storrelse.addEventListener('input', function () { settStorrelse(Number(storrelse.value)); });
    }

    var ledige = $('bare-ledige');
    if (ledige) {
      ledige.addEventListener('change', function () {
        tilstand.bareLedige = ledige.checked;
        tegn();
      });
    }

    var visAlle = $('vis-alle');
    if (visAlle) {
      visAlle.addEventListener('click', function () {
        tilstand.visAlle = !tilstand.visAlle;
        tegn();
      });
    }

    var filter = $('filter');
    if (filter) {
      filter.addEventListener('reset', function () {
        window.setTimeout(function () {
          var b = $('budsjett-2');
          var s = $('storrelse');
          var l = $('bare-ledige');
          tilstand.visAlle = false;
          settBudsjett(b ? Number(b.value) : 1800000);
          settStorrelse(s ? Number(s.value) : 750);
          tilstand.bareLedige = l ? l.checked : true;
          tegn();
        }, 0);
      });
    }
  }

  /* ---------- Tomtevalg → skjema ---------- */

  function kobleValg() {
    var listeEl = $('plotlist');
    var velg = $('tomt');
    if (!listeEl || !velg) return;

    listeEl.addEventListener('click', function (hendelse) {
      var knapp = hendelse.target.closest ? hendelse.target.closest('button[data-tomt]') : null;
      if (!knapp) return;
      velg.value = knapp.getAttribute('data-tomt');
      var kontakt = $('kontakt');
      if (kontakt && kontakt.scrollIntoView) {
        kontakt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      var navn = $('navn');
      if (navn) window.setTimeout(function () { navn.focus({ preventScroll: true }); }, 450);
    });
  }

  /* ---------- Interesseforespørsel (kun lokalt) ---------- */

  function fyllTomtevalg() {
    var velg = $('tomt');
    if (!velg) return;
    PLOTS.forEach(function (p) {
      var o = document.createElement('option');
      o.value = String(p.id);
      o.textContent = 'Tomt ' + p.id + ' – ' + kvadrat(p.m2) + ' (' + p.status.toLowerCase() + ')';
      velg.appendChild(o);
    });
  }

  function visFeil(tekst) {
    var feil = $('formfeil');
    if (!feil) return;
    if (tekst) {
      feil.textContent = tekst;
      feil.hidden = false;
    } else {
      feil.textContent = '';
      feil.hidden = true;
    }
  }

  function lagKvittering(data) {
    var liste = $('kvittering-liste');
    if (!liste) return;
    while (liste.firstChild) liste.removeChild(liste.firstChild);

    data.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      liste.appendChild(div);
    });
  }

  function kobleSkjema() {
    var skjema = $('interesse');
    if (!skjema) return;
    var kvittering = $('kvittering');
    var epostKnapp = $('epost-knapp');
    var endre = $('endre');

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      var navn = $('navn');
      var epost = $('epost');
      var telefon = $('telefon');
      var tomt = $('tomt');
      var melding = $('melding');
      var samtykke = $('samtykke');

      [navn, epost, telefon, tomt, melding, samtykke].forEach(function (felt) {
        if (felt) felt.removeAttribute('aria-invalid');
      });

      if (!navn.value.trim()) {
        navn.setAttribute('aria-invalid', 'true');
        visFeil('Fyll inn navnet ditt, så vet Lygnalia hvem som skriver.');
        navn.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) {
        epost.setAttribute('aria-invalid', 'true');
        visFeil('Skriv en e-postadresse vi kan svare på.');
        epost.focus();
        return;
      }

      if (!samtykke.checked) {
        visFeil('Sett kryss for at du vil bli kontaktet om henvendelsen.');
        samtykke.focus();
        return;
      }

      visFeil('');

      var tomtTekst = tomt.value
        ? 'Tomt ' + tomt.value + ' (' + FELT + ')'
        : 'Ikke bestemt ennå';

      var rader = [
        ['Navn', navn.value.trim()],
        ['E-post', epost.value.trim()],
        ['Telefon', telefon.value.trim() || 'Ikke oppgitt'],
        ['Tomt', tomtTekst],
        ['Melding', melding.value.trim() || 'Ingen melding skrevet']
      ];

      lagKvittering(rader);

      if (epostKnapp) {
        var emne = 'Forespørsel fra nettsiden' + (tomt.value ? ' – tomt ' + tomt.value : '');
        var kropp = rader.map(function (rad) { return rad[0] + ': ' + rad[1]; }).join('\n');
        epostKnapp.setAttribute(
          'href',
          'mailto:post@lygnalia.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
        );
      }

      skjema.hidden = true;
      kvittering.hidden = false;
      if (kvittering.scrollIntoView) kvittering.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    if (endre) {
      endre.addEventListener('click', function () {
        kvittering.hidden = true;
        skjema.hidden = false;
        var navn = $('navn');
        if (navn) navn.focus();
      });
    }
  }

  /* ---------- Mobilmeny ---------- */

  function kobleMeny() {
    var toggle = document.querySelector('.nav-toggle');
    var meny = $('meny');
    if (!toggle || !meny) return;
    var smal = window.matchMedia('(max-width: 900px)');

    function lukk() {
      if (smal.matches) meny.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne meny');
    }

    toggle.addEventListener('click', function () {
      var apen = meny.hasAttribute('hidden');
      if (apen) {
        meny.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Lukk meny');
      } else {
        lukk();
      }
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.tagName === 'A') lukk();
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !meny.hasAttribute('hidden')) {
        lukk();
        toggle.focus();
      }
    });

    var skift = function () { lukk(); };
    if (smal.addEventListener) smal.addEventListener('change', skift);
    else if (smal.addListener) smal.addListener(skift);
  }

  /* ---------- Start ---------- */

  fyllTomtevalg();
  kobleFiltre();
  kobleValg();
  kobleSkjema();
  kobleMeny();
  settBudsjett(Number(($('budsjett') || {}).value || 1800000));
})();
