/*
  Fulcio Media AS — app.js
  Én interaksjon: riggvelgeren. Du krysser av hva du trenger, og får den
  riggen – eller kombinasjonen av rigger – som dekker det, med et sammendrag
  du kan sende på e-post. Alt skjer i nettleseren. Ingenting sendes eller
  lagres av siden.
*/

(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('meny-knapp');
  var meny = document.getElementById('meny');

  function settMeny(open) {
    if (!meny || !menyKnapp) return;
    meny.classList.toggle('is-open', open);
    menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      settMeny(!meny.classList.contains('is-open'));
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 899) settMeny(false);
    });
  }

  /* ---------------- Riggvelger ---------------- */

  var BEHOV = {
    strategi: 'Kreativ strategi',
    matching: 'UGC-kreatører',
    manus: 'Manus og hooks',
    produksjon: 'Videoproduksjon',
    redigering: 'Klipping',
    annonsering: 'Annonsering',
    analyse: 'Teknisk analyse',
    iterasjon: 'Iterasjon',
    rapportering: 'Rapportering',
    team: 'Dedikert team',
    lipsync: 'AI-lipsync',
    ai: 'AI-varianter'
  };

  /*
    Dekningen er hentet fra sammenligningstabellen og inkludert-listene på
    fulciomedia.no. Rekkefølgen avgjør hvilken rigg som foretrekkes når flere
    dekker det samme: den minst omfattende først.
  */
  var REKKEFOLGE = ['cutrigg', 'nativrigg', 'airigg', 'innholdsrigg', 'vekstrigg'];

  var RIGGER = {
    cutrigg: {
      navn: 'Cutrigg',
      tag: 'Redigering',
      involvering: 'moderat',
      tekst: 'Performance-trent editor-team som klipper råmateriale til annonser optimalisert for paid social. Betaling per edit og fast månedlig leveranse.',
      dekker: ['redigering']
    },
    nativrigg: {
      navn: 'NativeRigg',
      tag: 'Lokalisering',
      involvering: 'moderat',
      tekst: 'Vi oversetter og lipsyncer vinnende annonser til nye språk og markeder med AI, med AI-lipsync fra HeyGen og 40+ språk.',
      dekker: ['lipsync']
    },
    airigg: {
      navn: 'AiRigg',
      tag: 'AI-varianter',
      involvering: 'moderat',
      tekst: 'AI-drevet variantmotor som genererer animerte, Pixar-inspirerte og filmatiske formater fra vinnende konsepter.',
      dekker: ['ai']
    },
    innholdsrigg: {
      navn: 'Innholdsrigg',
      tag: 'Innholdsproduksjon',
      involvering: 'moderat',
      tekst: 'Vi supplerer annonsekontoen din med konverterende innhold, mens du styrer annonseringen selv.',
      dekker: ['strategi', 'matching', 'manus', 'produksjon', 'redigering', 'iterasjon', 'rapportering']
    },
    vekstrigg: {
      navn: 'Vekstrigg',
      tag: 'Vekstpartner',
      involvering: 'minimal',
      tekst: 'Vi blir din vekstpartner: strategien, innholdet og annonseringen – så du kan fokusere på å skalere.',
      dekker: ['strategi', 'matching', 'manus', 'produksjon', 'redigering', 'annonsering', 'analyse', 'iterasjon', 'rapportering', 'team']
    }
  };

  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var resultatTom = document.getElementById('resultat-tom');
  var resultatInnhold = document.getElementById('resultat-innhold');
  var velgerStatus = document.getElementById('velger-status');
  var nullstill = document.getElementById('velger-null');

  var EPOST = 'sondre@fulciomedia.no';

  function valgte() {
    return chips.filter(function (b) {
      return b.getAttribute('aria-pressed') === 'true';
    }).map(function (b) {
      return b.getAttribute('data-behov');
    });
  }

  /* Finner den minste kombinasjonen av rigger som dekker alle punktene. */
  function besteKombinasjon(behov) {
    var beste = null;
    var antall = REKKEFOLGE.length;

    for (var maske = 1; maske < 1 << antall; maske++) {
      var valgt = [];
      var dekker = {};
      var rang = 0;

      for (var i = 0; i < antall; i++) {
        if (maske & (1 << i)) {
          var id = REKKEFOLGE[i];
          valgt.push(id);
          rang += i;
          RIGGER[id].dekker.forEach(function (b) {
            dekker[b] = true;
          });
        }
      }

      var fullt = behov.every(function (b) {
        return dekker[b] === true;
      });
      if (!fullt) continue;

      if (!beste || valgt.length < beste.length || (valgt.length === beste.length && rang < beste.rang)) {
        beste = { valgt: valgt, rang: rang, length: valgt.length };
      }
    }

    return beste ? beste.valgt : [];
  }

  function tekstFor(behov, valgt) {
    var navn = valgt.map(function (id) {
      return RIGGER[id].navn;
    });
    var linjer = [
      'Hei!',
      '',
      'Jeg har brukt riggvelgeren på fulciomedia.no og ønsker en prat om:',
      ''
    ];
    behov.forEach(function (b) {
      linjer.push('- ' + BEHOV[b]);
    });
    linjer.push('');
    linjer.push('Anbefalt rigg: ' + navn.join(' + '));
    linjer.push('Involvering fra vår side: ' + valgt.map(function (id) {
      return RIGGER[id].navn + ' (' + RIGGER[id].involvering + ')';
    }).join(', '));
    linjer.push('');
    linjer.push('Hilsen');
    return linjer.join('\r\n');
  }

  function el(tag, klasse, tekst) {
    var node = document.createElement(tag);
    if (klasse) node.className = klasse;
    if (tekst !== undefined) node.textContent = tekst;
    return node;
  }

  var sisteTekst = '';

  function tegn(behov) {
    if (!resultatTom || !resultatInnhold) return;

    var valgt = behov.length ? besteKombinasjon(behov) : [];

    if (!behov.length || !valgt.length) {
      resultatTom.hidden = false;
      resultatInnhold.hidden = true;
      resultatInnhold.textContent = '';
      sisteTekst = '';
      if (velgerStatus) {
        velgerStatus.textContent = behov.length
          ? 'Ingen rigg dekker dette alene – ta kontakt, så setter vi sammen noe.'
          : '';
      }
      return;
    }

    resultatTom.hidden = true;
    resultatInnhold.hidden = false;
    resultatInnhold.textContent = '';

    /* Vis den bredeste riggen først, så kombinasjonen leses som hovedrigg pluss tillegg. */
    valgt = valgt.slice().sort(function (a, b) {
      return RIGGER[b].dekker.length - RIGGER[a].dekker.length;
    });

    var navn = valgt.map(function (id) {
      return RIGGER[id].navn;
    });

    var topp = el('div', 'resultat__topp');
    topp.appendChild(el('p', 'resultat__tag', valgt.length === 1 ? RIGGER[valgt[0]].tag : 'Kombinasjon'));
    topp.appendChild(el('h3', null, navn.join(' + ')));
    resultatInnhold.appendChild(topp);

    if (valgt.length > 1) {
      resultatInnhold.appendChild(el('p', 'resultat__tekst',
        'Ingen enkelt rigg dekker alt du valgte. Denne kombinasjonen gjør det:'));
    }

    valgt.forEach(function (id) {
      var rigg = RIGGER[id];
      var p = el('p', 'resultat__tekst');
      if (valgt.length > 1) {
        p.appendChild(el('strong', null, rigg.navn + ': '));
      }
      p.appendChild(document.createTextNode(rigg.tekst));
      resultatInnhold.appendChild(p);
    });

    var liste = el('ul', 'resultat__behov');
    behov.forEach(function (b) {
      liste.appendChild(el('li', null, BEHOV[b]));
    });
    resultatInnhold.appendChild(liste);

    resultatInnhold.appendChild(el('p', 'resultat__meta', 'Involvering fra din side: ' +
      (valgt.length === 1
        ? RIGGER[valgt[0]].involvering
        : valgt.map(function (id) {
          return RIGGER[id].involvering + ' (' + RIGGER[id].navn + ')';
        }).join(' · '))));

    var merknad = el('p', 'resultat__merknad',
      'Anbefalingen bygger bare på hva riggene inneholder på fulciomedia.no. Endelig omfang avtales i en samtale.');
    resultatInnhold.appendChild(merknad);

    /* Sammendrag med utgang til e-post – ingen data forlater siden før du selv sender. */
    sisteTekst = tekstFor(behov, valgt);

    var kvittering = el('div', 'kvittering');
    kvittering.appendChild(el('h4', null, 'Sammendrag'));
    kvittering.appendChild(el('p', 'kvittering__linjer',
      behov.length + (behov.length === 1 ? ' punkt valgt' : ' punkter valgt') +
      ' · ' + navn.join(' + ')));

    var rad = el('div', 'knapperad');

    var mail = document.createElement('a');
    mail.className = 'btn';
    mail.textContent = 'Send på e-post';
    mail.href = 'mailto:' + EPOST +
      '?subject=' + encodeURIComponent('Riggvalg: ' + navn.join(' + ')) +
      '&body=' + encodeURIComponent(sisteTekst);
    rad.appendChild(mail);

    var kopier = el('button', 'btn btn--ghost', 'Kopier sammendrag');
    kopier.type = 'button';
    kopier.addEventListener('click', function () {
      kopierTekst(sisteTekst, 'Sammendraget er kopiert.');
    });
    rad.appendChild(kopier);

    kvittering.appendChild(rad);
    resultatInnhold.appendChild(kvittering);

    if (velgerStatus) {
      velgerStatus.textContent = 'Anbefalt: ' + navn.join(' + ') + '.';
    }
  }

  function kopierTekst(tekst, okMelding) {
    function fallback() {
      var felt = document.createElement('textarea');
      felt.value = tekst;
      felt.setAttribute('readonly', 'readonly');
      felt.style.position = 'fixed';
      felt.style.opacity = '0';
      document.body.appendChild(felt);
      felt.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(felt);
      if (velgerStatus) {
        velgerStatus.textContent = ok
          ? okMelding
          : 'Nettleseren ville ikke kopiere. Merk teksten i sammendraget og kopier manuelt.';
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function () {
        if (velgerStatus) velgerStatus.textContent = okMelding;
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var pressed = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', pressed ? 'false' : 'true');
        tegn(valgte());
      });
    });

    if (nullstill) {
      nullstill.addEventListener('click', function () {
        chips.forEach(function (chip) {
          chip.setAttribute('aria-pressed', 'false');
        });
        tegn([]);
        if (velgerStatus) velgerStatus.textContent = 'Valgene er nullstilt.';
      });
    }

    tegn([]);
  }

  /* ---------------- Kontaktskjema ---------------- */

  var skjema = document.getElementById('kontakt-skjema');
  var skjemaStatus = document.getElementById('skjema-status');

  if (skjema) {
    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!skjema.reportValidity()) return;

      var navn = (document.getElementById('navn') || {}).value || '';
      var epost = (document.getElementById('epost') || {}).value || '';
      var bedrift = (document.getElementById('bedrift') || {}).value || '';
      var tema = (document.getElementById('tema') || {}).value || '';
      var melding = (document.getElementById('melding') || {}).value || '';

      var linjer = [
        'Hei!',
        '',
        melding,
        '',
        'Navn: ' + navn,
        'E-post: ' + epost
      ];
      if (bedrift) linjer.push('Merkevare: ' + bedrift);
      linjer.push('Gjelder: ' + tema);
      linjer.push('');
      linjer.push('Sendt fra kontaktskjemaet på fulciomedia.no');

      var href = 'mailto:' + EPOST +
        '?subject=' + encodeURIComponent('Henvendelse fra nettsiden: ' + tema) +
        '&body=' + encodeURIComponent(linjer.join('\r\n'));

      window.location.href = href;

      if (skjemaStatus) {
        skjemaStatus.textContent = 'Vi har laget et e-postutkast til ' + EPOST +
          '. Kom det ikke opp, kan du sende til samme adresse direkte. Ingenting er sendt ennå.';
      }
    });
  }
})();
