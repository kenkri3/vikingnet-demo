/*
  SEIE AS — app.js
  Tre oppgaver: mobilmeny, klokka i vaktkortet, og behovsavklaringen i tre
  steg med oppsummering, referanse og ferdig utfylt e-post. Alt skjer i
  nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ------------------------------------------------------------ Mobilmeny */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function settMeny(apen) {
    if (!meny || !menyKnapp) return;
    if (apen) {
      meny.removeAttribute('hidden');
    } else {
      meny.setAttribute('hidden', '');
    }
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      settMeny(meny.hasAttribute('hidden'));
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) {
        meny.removeAttribute('hidden');
        menyKnapp.setAttribute('aria-expanded', 'false');
        menyKnapp.setAttribute('aria-label', 'Åpne meny');
      } else if (menyKnapp.getAttribute('aria-expanded') !== 'true') {
        meny.setAttribute('hidden', '');
      }
    });

    if (window.innerWidth > 940) meny.removeAttribute('hidden');
  }

  /* ------------------------------------------------------------ Årstall */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------ Klokka */

  var klokke = document.getElementById('klokke');
  if (klokke && window.Intl) {
    var klokkeFormat = new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Oslo'
    });
    var oppdaterKlokke = function () {
      klokke.textContent = klokkeFormat.format(new Date());
    };
    oppdaterKlokke();
    window.setInterval(oppdaterKlokke, 30000);
  }

  /* ------------------------------------------------------------ Behovsskjema */

  var skjema = document.getElementById('behov-skjema');
  if (!skjema) return;

  var visninger = Array.prototype.slice.call(skjema.querySelectorAll('.wizard__visning'));
  var bar = Array.prototype.slice.call(document.querySelectorAll('#wizard-bar li'));
  var stegMerke = document.getElementById('steg-merke');
  var nav = document.getElementById('wizard-nav');
  var tilbakeKnapp = document.getElementById('tilbake');
  var nesteKnapp = document.getElementById('neste');
  var feilBoks = document.getElementById('wizard-feil');
  var sammendrag = document.getElementById('sammendrag');
  var kvitteringRef = document.getElementById('kvittering-ref');
  var kvitteringTekst = document.getElementById('kvittering-tekst');
  var kvitteringEpost = document.getElementById('kvittering-epost');
  var kopiStatus = document.getElementById('kopi-status');
  var kopierKnapp = document.getElementById('kopier');
  var nyKnapp = document.getElementById('ny');

  var steg = 1;
  var ref = '';
  var sammendragTekst = '';

  var AVDELINGER = {
    rekruttering: {
      navn: 'Rekruttering og bemanning',
      epost: 'kristin@seie.no',
      roller: [
        'Kaptein, styrmann eller maskinist',
        'Kranfører eller offshorepersonell',
        'Produksjon, prosess eller vedlikehold',
        'Forpleining og service',
        'Dekksoffiser, matros eller dekksarbeider',
        'Mekanisk, elektro eller automasjon',
        'Formann, arbeidsleder eller prosjektstøtte',
        'Lederstilling',
        'Annet'
      ]
    },
    helse: {
      navn: 'Helsepersonell',
      epost: 'annelene@seie.no',
      roller: [
        'Sykepleier',
        'Helsepersonell til kommunal sektor',
        'Helsepersonell til privat sektor',
        'Vikar innen helse',
        'BPA og hjemmetjenester',
        'Rekruttering til fast stilling',
        'Annet'
      ]
    }
  };

  var FELT = {
    navn: 'felt-navn',
    virksomhet: 'felt-virksomhet',
    telefon: 'felt-telefon',
    epost: 'felt-epost',
    rolle: 'felt-rolle',
    tid: 'felt-tid',
    sted: 'felt-sted'
  };

  function feltVerdi(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function valgtAvdeling() {
    var valgt = skjema.querySelector('input[name="avdeling"]:checked');
    return valgt ? valgt.value : '';
  }

  function merkFelt(nokkel, feil) {
    var hylle = document.getElementById(FELT[nokkel]);
    var el = document.getElementById(nokkel);
    var feilMelding = document.getElementById('feil-' + nokkel);

    if (hylle) {
      if (feil) {
        hylle.setAttribute('data-invalid', 'true');
      } else {
        hylle.removeAttribute('data-invalid');
      }
    }
    if (el) {
      if (feil) {
        el.setAttribute('aria-invalid', 'true');
      } else {
        el.removeAttribute('aria-invalid');
      }
    }
    if (feilMelding) {
      if (feil) {
        feilMelding.removeAttribute('hidden');
      } else {
        feilMelding.setAttribute('hidden', '');
      }
    }
  }

  function ryddFeil() {
    Object.keys(FELT).forEach(function (nokkel) {
      merkFelt(nokkel, false);
    });
    feilBoks.setAttribute('hidden', '');
    feilBoks.textContent = '';
  }

  function visFeil(melding, forsteFelt) {
    feilBoks.textContent = melding;
    feilBoks.removeAttribute('hidden');
    if (forsteFelt) {
      var el = document.getElementById(forsteFelt);
      if (el) el.focus();
    }
  }

  function validerSteg(n) {
    var feil = false;
    var forste = '';

    if (n === 1) {
      if (!valgtAvdeling()) {
        feil = true;
        forste = forste || 'rolle';
      }
      if (!feltVerdi('rolle')) {
        merkFelt('rolle', true);
        feil = true;
        forste = forste || 'rolle';
      } else {
        merkFelt('rolle', false);
      }
      if (!valgtAvdeling()) {
        visFeil('Velg hvilken avdeling forespørselen gjelder.');
        var radio = skjema.querySelector('input[name="avdeling"]');
        if (radio) radio.focus();
        return false;
      }
    }

    if (n === 2) {
      if (!feltVerdi('tid')) {
        merkFelt('tid', true);
        feil = true;
        forste = forste || 'tid';
      } else {
        merkFelt('tid', false);
      }
      if (!feltVerdi('sted')) {
        merkFelt('sted', true);
        feil = true;
        forste = forste || 'sted';
      } else {
        merkFelt('sted', false);
      }
    }

    if (n === 3) {
      ['navn', 'virksomhet', 'telefon', 'epost'].forEach(function (nokkel) {
        var verdi = feltVerdi(nokkel);
        var gyldig = verdi.length > 0;
        if (nokkel === 'epost' && gyldig) {
          gyldig = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
        }
        if (nokkel === 'telefon' && gyldig) {
          gyldig = verdi.replace(/[^\d]/g, '').length >= 8;
        }
        if (!gyldig) {
          merkFelt(nokkel, true);
          feil = true;
          forste = forste || nokkel;
        } else {
          merkFelt(nokkel, false);
        }
      });
    }

    if (feil) {
      visFeil('Fyll ut feltene som er merket, og prøv igjen.', forste);
      return false;
    }

    feilBoks.setAttribute('hidden', '');
    return true;
  }

  function lagRoller(avdeling) {
    var rolle = document.getElementById('rolle');
    if (!rolle) return;
    var gruppe = AVDELINGER[avdeling];
    if (!gruppe) return;
    var gammel = rolle.value;
    rolle.innerHTML = '';
    var tom = document.createElement('option');
    tom.value = '';
    tom.textContent = 'Velg rolle';
    rolle.appendChild(tom);
    var optgroup = document.createElement('optgroup');
    optgroup.label = gruppe.navn;
    gruppe.roller.forEach(function (navn) {
      var opt = document.createElement('option');
      opt.value = navn;
      opt.textContent = navn;
      optgroup.appendChild(opt);
    });
    rolle.appendChild(optgroup);
    if (gammel && gruppe.roller.indexOf(gammel) !== -1) rolle.value = gammel;
  }

  function visSteg(n, settFokus) {
    steg = n;
    visninger.forEach(function (visning) {
      if (Number(visning.getAttribute('data-steg')) === n) {
        visning.removeAttribute('hidden');
      } else {
        visning.setAttribute('hidden', '');
      }
    });

    bar.forEach(function (li, i) {
      var nr = i + 1;
      li.classList.toggle('is-aktiv', nr === n);
      li.classList.toggle('is-ferdig', nr < n || n > 3);
    });

    if (n === 4) {
      byggSammendrag();
      stegMerke.textContent = 'Se over';
    } else if (n === 5) {
      stegMerke.textContent = 'Sammendrag';
    } else {
      stegMerke.textContent = 'Steg ' + n + ' av 3';
    }

    if (n < 5) {
      nav.removeAttribute('hidden');
    } else {
      nav.setAttribute('hidden', '');
    }

    tilbakeKnapp.disabled = n === 1;
    nesteKnapp.textContent = n === 3 ? 'Se over' : n === 4 ? 'Fullfør' : 'Neste';

    var overskrift = document.getElementById('steg-overskrift-' + n);
    if (overskrift && settFokus !== false) {
      overskrift.setAttribute('tabindex', '-1');
      overskrift.focus({ preventScroll: true });
    }
  }

  function hentData() {
    return {
      avdeling: valgtAvdeling(),
      rolle: feltVerdi('rolle'),
      tid: feltVerdi('tid'),
      sted: feltVerdi('sted'),
      omfang: feltVerdi('omfang'),
      notat: feltVerdi('notat'),
      navn: feltVerdi('navn'),
      virksomhet: feltVerdi('virksomhet'),
      telefon: feltVerdi('telefon'),
      epost: feltVerdi('epost')
    };
  }

  function rader(data) {
    var liste = [
      ['Avdeling', AVDELINGER[data.avdeling] ? AVDELINGER[data.avdeling].navn : data.avdeling],
      ['Rolle', data.rolle],
      ['Tidspunkt', data.tid],
      ['Sted', data.sted]
    ];
    if (data.omfang) liste.push(['Omfang', data.omfang]);
    if (data.notat) liste.push(['Om behovet', data.notat]);
    liste.push(['Navn', data.navn]);
    liste.push(['Virksomhet', data.virksomhet]);
    liste.push(['Telefon', data.telefon]);
    liste.push(['E-post', data.epost]);
    return liste;
  }

  function byggSammendrag() {
    var data = hentData();
    sammendrag.innerHTML = '';
    rader(data).forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      sammendrag.appendChild(div);
    });
    sammendragTekst = rader(data).map(function (rad) {
      return rad[0] + ': ' + rad[1];
    }).join('\n');
  }

  function lagRef() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var ut = '';
    var buf = new Uint8Array(4);
    var harKrypto = window.crypto && typeof window.crypto.getRandomValues === 'function';
    for (var i = 0; i < 4; i++) {
      var tall = harKrypto
        ? window.crypto.getRandomValues(buf)[0] % tegn.length
        : Math.floor(Math.random() * tegn.length);
      ut += tegn.charAt(tall);
    }
    return 'SEIE-' + new Date().getFullYear() + '-' + ut;
  }

  function visKvittering() {
    var data = hentData();
    var gruppe = AVDELINGER[data.avdeling] || AVDELINGER.rekruttering;
    ref = lagRef();
    byggSammendrag();
    sammendragTekst = 'Forespørsel til SEIE AS\nReferanse: ' + ref + '\n' + sammendragTekst;

    kvitteringRef.textContent = ref;
    kvitteringTekst.textContent = 'Sammendraget for ' + gruppe.navn + ' er klart. Send det til ' + gruppe.epost + ' — eller ring 55 38 5000 og oppgi referansen.';

    var emne = 'Forespørsel ' + ref + ' — ' + gruppe.navn;
    kvitteringEpost.textContent = 'Send til ' + gruppe.epost;
    kvitteringEpost.setAttribute('href', 'mailto:' + gruppe.epost + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(sammendragTekst));
    kopiStatus.textContent = '';
    visSteg(5);
    var kvitteringsOverskrift = document.querySelector('#kvittering h3');
    if (kvitteringsOverskrift) {
      kvitteringsOverskrift.setAttribute('tabindex', '-1');
      kvitteringsOverskrift.focus({ preventScroll: true });
    }
  }

  function nullstill() {
    skjema.reset();
    ref = '';
    sammendrag.innerHTML = '';
    sammendragTekst = '';
    kopiStatus.textContent = '';
    Object.keys(FELT).forEach(function (nokkel) {
      merkFelt(nokkel, false);
    });
    Array.prototype.slice.call(skjema.querySelectorAll('.valg__kort')).forEach(function (kort) {
      kort.classList.remove('is-valgt');
    });
    feilBoks.setAttribute('hidden', '');
    lagRoller('');
    visSteg(1, false);
  }

  /* Avdelingsvalg */

  Array.prototype.slice.call(skjema.querySelectorAll('input[name="avdeling"]')).forEach(function (radio) {
    radio.addEventListener('change', function () {
      Array.prototype.slice.call(skjema.querySelectorAll('.valg__kort')).forEach(function (kort) {
        var input = kort.querySelector('input[name="avdeling"]');
        kort.classList.toggle('is-valgt', Boolean(input && input.checked));
      });
      lagRoller(radio.value);
      merkFelt('rolle', false);
    });
  });

  /* Forhåndsvalg fra «Meld behov»-knappene i avdelingskortene */

  Array.prototype.slice.call(document.querySelectorAll('[data-avdeling]')).forEach(function (lenke) {
    lenke.addEventListener('click', function () {
      var radio = skjema.querySelector('input[name="avdeling"][value="' + lenke.getAttribute('data-avdeling') + '"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  /* Navigasjon */

  nesteKnapp.addEventListener('click', function () {
    if (steg >= 5) return;
    if (steg < 4 && !validerSteg(steg)) return;
    if (steg === 4) {
      visKvittering();
      return;
    }
    ryddFeil();
    visSteg(steg + 1);
  });

  tilbakeKnapp.addEventListener('click', function () {
    if (steg <= 1) return;
    ryddFeil();
    visSteg(steg === 5 ? 4 : steg - 1);
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    nesteKnapp.click();
  });

  /* Kopier sammendrag */

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      if (!sammendragTekst) return;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(sammendragTekst).then(function () {
          kopiStatus.textContent = 'Sammendraget er kopiert.';
        }).catch(function () {
          kopiStatus.textContent = 'Nettleseren stoppet kopieringen. Bruk e-postknappen i stedet.';
        });
      } else {
        kopiStatus.textContent = 'Nettleseren støtter ikke kopiering. Bruk e-postknappen i stedet.';
      }
    });
  }

  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      nullstill();
      var overskrift = document.getElementById('steg-overskrift-1');
      if (overskrift) overskrift.focus({ preventScroll: true });
    });
  }

  /* Rydd feilmeldinger når brukeren retter feltet */

  Object.keys(FELT).forEach(function (nokkel) {
    var el = document.getElementById(nokkel);
    if (!el) return;
    var hendelse = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(hendelse, function () {
      merkFelt(nokkel, false);
    });
  });

  lagRoller('');
  visSteg(1, false);
})();
