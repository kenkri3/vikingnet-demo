/*
  Byggmester Reidar Solheim AS — demo.
  Alt skjer i nettleseren: ingen data sendes, ingen lagres.
  To interaksjoner: ukesoppgjøret (timelogg → rapport) og kontaktforespørselen
  som åpner e-postprogrammet med teksten ferdig utfylt.
*/

(function () {
  'use strict';

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------------- Mobilmeny ---------------- */

  var toggle = $('.nav-toggle');
  var nav = $('#nav');

  function settMeny(apen) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
    toggle.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
    if (apen) {
      nav.removeAttribute('hidden');
    } else {
      nav.setAttribute('hidden', '');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      settMeny(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Lukk menyen når en lenke er valgt, og når vi går tilbake til bred skjerm.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });
  }

  /* ---------------- Ukesoppgjør ---------------- */

  var form = $('#time-form');
  var linjer = $('#linjer');
  var feil = $('#f-feil');
  var kvittering = $('#kvittering');
  var rapportTekst = $('#rapport-tekst');
  var kopiStatus = $('#kopi-status');
  var sumTimer = $('#sum-timer');
  var sumDager = $('#sum-dager');
  var sumPersoner = $('#sum-personer');

  var foringer = [];

  function iDag() {
    var naa = new Date();
    var maned = String(naa.getMonth() + 1).padStart(2, '0');
    var dag = String(naa.getDate()).padStart(2, '0');
    return naa.getFullYear() + '-' + maned + '-' + dag;
  }

  function tall(n) {
    return n.toFixed(1).replace('.', ',');
  }

  function kortDato(iso) {
    var deler = iso.split('-');
    if (deler.length !== 3) return iso;
    var d = new Date(Number(deler[0]), Number(deler[1]) - 1, Number(deler[2]));
    return d.toLocaleDateString('nb-NO', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }

  function langDato(iso) {
    var deler = iso.split('-');
    if (deler.length !== 3) return iso;
    return deler[2] + '.' + deler[1] + '.' + deler[0];
  }

  function visFeil(melding) {
    if (!feil) return;
    if (melding) {
      feil.textContent = melding;
      feil.removeAttribute('hidden');
    } else {
      feil.textContent = '';
      feil.setAttribute('hidden', '');
    }
  }

  function tegnLinjer() {
    if (!linjer) return;
    linjer.innerHTML = '';

    foringer.forEach(function (linje, index) {
      var li = document.createElement('li');
      li.className = 'line';

      var main = document.createElement('div');
      main.className = 'line__main';

      var dag = document.createElement('span');
      dag.className = 'line__day';
      dag.textContent = kortDato(linje.dato);

      var meta = document.createElement('span');
      meta.className = 'line__meta';
      meta.textContent = linje.tekst + ' · ' + linje.navn;

      main.appendChild(dag);
      main.appendChild(meta);

      var timer = document.createElement('span');
      timer.className = 'line__hours';
      timer.textContent = tall(linje.timer) + ' t';

      var slett = document.createElement('button');
      slett.type = 'button';
      slett.className = 'line__del';
      slett.setAttribute('aria-label', 'Fjern linjen fra ' + langDato(linje.dato));
      slett.textContent = '×';
      slett.addEventListener('click', function () {
        foringer.splice(index, 1);
        tegnLinjer();
      });

      li.appendChild(main);
      li.appendChild(timer);
      li.appendChild(slett);
      linjer.appendChild(li);
    });
  }

  function oppdaterSum() {
    var total = 0;
    var dager = {};
    var personer = {};

    foringer.forEach(function (linje) {
      total += linje.timer;
      dager[linje.dato] = true;
      personer[linje.navn.toLowerCase()] = linje.navn;
    });

    if (sumTimer) sumTimer.textContent = tall(total);
    if (sumDager) sumDager.textContent = String(Object.keys(dager).length);
    if (sumPersoner) sumPersoner.textContent = String(Object.keys(personer).length);

    if (foringer.length === 0 && kvittering) {
      kvittering.setAttribute('hidden', '');
      if (kopiStatus) kopiStatus.textContent = '';
    }

    return { total: total, dager: Object.keys(dager).length, personer: Object.keys(personer).length };
  }

  function lagRapport() {
    var sum = oppdaterSum();
    if (foringer.length === 0) {
      visFeil('Legg til minst én linje før du lager ukesoppgjøret.');
      return;
    }
    visFeil('');

    var sortert = foringer.slice().sort(function (a, b) {
      return a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : a.navn.localeCompare(b.navn, 'nb');
    });

    var rader = sortert.map(function (linje) {
      return [
        langDato(linje.dato).padEnd(11),
        String(linje.navn).padEnd(14).slice(0, 14),
        (tall(linje.timer) + ' t').padStart(6),
        '  ' + linje.tekst
      ].join('');
    });

    var tekst = [
      'Ukesoppgjør – Byggmester Reidar Solheim AS',
      'Laget ' + new Date().toLocaleDateString('nb-NO') + ' i nettleseren',
      '',
      'Dato        Person           Timer  Arbeid',
      '------------------------------------------------------------'
    ]
      .concat(rader)
      .concat([
        '------------------------------------------------------------',
        'Sum: ' + tall(sum.total) + ' timer på ' + sum.dager + (sum.dager === 1 ? ' dag' : ' dager') + ', ' + sum.personer + (sum.personer === 1 ? ' person' : ' personer') + '.',
        '',
        'Kontor: 911 60 400 · tor-henrik@reidarsolheim.no'
      ])
      .join('\n');

    if (rapportTekst) rapportTekst.textContent = tekst;
    if (kvittering) kvittering.removeAttribute('hidden');
    if (kopiStatus) kopiStatus.textContent = '';

    var epost = $('#send-epost');
    if (epost) {
      epost.setAttribute(
        'href',
        'mailto:tor-henrik@reidarsolheim.no?subject=' +
          encodeURIComponent('Ukesoppgjør fra timeloggen') +
          '&body=' +
          encodeURIComponent(tekst)
      );
    }
  }

  if (form) {
    var datoFelt = $('#f-dato');
    if (datoFelt) datoFelt.value = iDag();

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var dato = $('#f-dato');
      var navn = $('#f-navn');
      var tekst = $('#f-tekst');
      var timer = $('#f-timer');

      if (!dato.value || !navn.value.trim() || !tekst.value.trim() || !timer.value) {
        visFeil('Fyll ut dato, navn, hva som ble gjort og antall timer.');
        return;
      }

      var antall = Number(timer.value);
      if (!isFinite(antall) || antall <= 0 || antall > 24) {
        visFeil('Timene må være et tall mellom 0,5 og 24.');
        return;
      }

      foringer.push({
        dato: dato.value,
        navn: navn.value.trim(),
        tekst: tekst.value.trim(),
        timer: Math.round(antall * 10) / 10
      });

      visFeil('');
      tekst.value = '';
      tegnLinjer();
      oppdaterSum();
      tekst.focus();
    });

    var lagKnapp = $('#lag-rapport');
    if (lagKnapp) lagKnapp.addEventListener('click', lagRapport);

    var tomKnapp = $('#tom-liste');
    if (tomKnapp) {
      tomKnapp.addEventListener('click', function () {
        foringer = [];
        tegnLinjer();
        oppdaterSum();
        visFeil('');
        var navnFelt = $('#f-navn');
        if (navnFelt) navnFelt.focus();
      });
    }
  }

  /* ---------------- Kopier rapporten ---------------- */

  function kopierTekst(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst);
    }
    return new Promise(function (resolve, reject) {
      var hjelper = document.createElement('textarea');
      hjelper.value = tekst;
      hjelper.setAttribute('readonly', '');
      hjelper.style.position = 'fixed';
      hjelper.style.top = '-1000px';
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
      else reject(new Error('Kunne ikke kopiere'));
    });
  }

  var kopierKnapp = $('#kopier');
  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      if (!rapportTekst || !rapportTekst.textContent) return;
      kopierTekst(rapportTekst.textContent).then(
        function () {
          if (kopiStatus) kopiStatus.textContent = 'Kopiert – klar til å limes inn i e-posten.';
        },
        function () {
          if (kopiStatus) kopiStatus.textContent = 'Kunne ikke kopiere automatisk. Merk teksten og kopier manuelt.';
        }
      );
    });
  }

  /* ---------------- Kontaktforespørsel ---------------- */

  var kontakt = $('#kontakt-form');
  if (kontakt) {
    kontakt.addEventListener('submit', function (event) {
      event.preventDefault();

      var status = $('#k-status');
      var navn = $('#k-navn');
      var telefon = $('#k-telefon');
      var epost = $('#k-epost');
      var tema = $('#k-tema');
      var melding = $('#k-melding');

      if (!kontakt.reportValidity()) {
        if (status) {
          status.dataset.state = 'feil';
          status.textContent = 'Fyll ut navn, e-post og melding.';
        }
        return;
      }

      var kropp = [
        'Navn: ' + navn.value.trim(),
        'Telefon: ' + (telefon.value.trim() || 'ikke oppgitt'),
        'E-post: ' + epost.value.trim(),
        'Gjelder: ' + tema.value,
        '',
        melding.value.trim()
      ].join('\n');

      var lenke =
        'mailto:tor-henrik@reidarsolheim.no?subject=' +
        encodeURIComponent('Forespørsel: ' + tema.value) +
        '&body=' +
        encodeURIComponent(kropp);

      if (status) {
        status.dataset.state = 'ok';
        status.textContent = 'E-postprogrammet åpnes med forespørselen klar til å sendes.';
      }

      window.location.href = lenke;
    });
  }
})();
