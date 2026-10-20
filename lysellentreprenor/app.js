/* Lysell Entreprenør AS — interaksjon.
   Ingen avhengigheter, ingen sporing, ingen backend. Alt skjer i nettleseren.
   Skjemaet faller tilbake på mailto: fordi GitHub Pages er statisk hosting. */

(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');

  if (nav && toggle) {
    var settMeny = function (apent) {
      if (apent) nav.classList.add('is-open');
      else nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', apent ? 'true' : 'false');
      toggle.setAttribute('aria-label', apent ? 'Lukk menyen' : 'Åpne menyen');
    };

    toggle.addEventListener('click', function () {
      settMeny(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });
  }

  /* Innkomsten ligger i CSS (styles.css), ikke her. Erfaringssak: en
     IntersectionObserver som gjør seksjoner usynlige til de kommer i bildet,
     gjør dem også usynlige i fullside-skjermbilder og i utskrift. En ren
     CSS-animasjon som starter synlig kan ikke svikte på den måten. */

  /* ---------- Åpent nå / stengt ---------- */
  /* Kundens egne åpningstider: ukedager 07:00–15:30, helg stengt.
     Klokka leses i Europe/Oslo, uansett hvor besøkende sitter. */

  var AAPNER = 7 * 60;
  var STENGER = 15 * 60 + 30;

  function osloTid() {
    var naiv = new Date();
    try {
      var fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Oslo',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
      var deler = fmt.formatToParts(new Date());
      var ukedag = '';
      var time = 0;
      var minutt = 0;
      for (var i = 0; i < deler.length; i++) {
        if (deler[i].type === 'weekday') ukedag = deler[i].value;
        if (deler[i].type === 'hour') time = parseInt(deler[i].value, 10);
        if (deler[i].type === 'minute') minutt = parseInt(deler[i].value, 10);
      }
      var kart = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
      var dag = kart[ukedag];
      if (typeof dag !== 'number') return naivTid(naiv);
      return { dag: dag, minutter: time * 60 + minutt };
    } catch (feil) {
      return naivTid(naiv);
    }
  }

  function naivTid(d) {
    return { dag: (d.getDay() + 6) % 7, minutter: d.getHours() * 60 + d.getMinutes() };
  }

  function nesteApning(dag, minutter) {
    if (dag <= 4 && minutter < AAPNER) return 'i dag kl. 07:00';
    var navn = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
    for (var i = 1; i <= 7; i++) {
      var d = (dag + i) % 7;
      if (d <= 4) {
        if (i === 1) return 'i morgen kl. 07:00';
        return navn[d] + ' kl. 07:00';
      }
    }
    return 'mandag kl. 07:00';
  }

  var statusBoks = document.querySelector('[data-status]');

  if (statusBoks) {
    var statusTekst = statusBoks.querySelector('[data-status-tekst]');
    var statusDetalj = statusBoks.querySelector('[data-status-detalj]');
    var naa = osloTid();
    var apent = naa.dag <= 4 && naa.minutter >= AAPNER && naa.minutter < STENGER;

    if (apent) {
      statusTekst.textContent = 'Åpent nå';
      statusDetalj.textContent = 'Telefonen er betjent til 15:30.';
    } else {
      statusBoks.classList.add('is-stengt');
      statusTekst.textContent = 'Stengt nå';
      statusDetalj.textContent = 'Åpner ' + nesteApning(naa.dag, naa.minutter) + '.';
    }
  }

  /* ---------- Forespørsel med kvittering ---------- */

  var skjema = document.querySelector('[data-forespor]');

  if (skjema) {
    var panelene = skjema.querySelectorAll('[data-panel]');
    var punktene = skjema.querySelectorAll('.steg__punkt');
    var valgKnappene = skjema.querySelectorAll('[data-valg]');
    var kvittering = skjema.querySelector('[data-kvittering]');
    var valgtType = '';
    var steg = 1;

    var feltFeil = function (nr, vis) {
      var el = skjema.querySelector('[data-feil="' + nr + '"]');
      if (!el) return;
      if (vis) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    };

    var verdi = function (navn) {
      var el = skjema.querySelector('[name="' + navn + '"]');
      if (!el) return '';
      return String(el.value).replace(/\s+/g, ' ').trim();
    };

    var rader = function () {
      return [
        ['Type arbeid', valgtType],
        ['Navn', verdi('Navn')],
        ['Kontakt', verdi('Kontakt')],
        ['Sted', verdi('Sted')],
        ['Oppstart', verdi('Oppstart')],
        ['Om jobben', verdi('Om jobben')]
      ];
    };

    var fyllListe = function (liste, innhold) {
      if (!liste) return;
      liste.textContent = '';
      for (var i = 0; i < innhold.length; i++) {
        var rad = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = innhold[i][0];
        dd.textContent = innhold[i][1] || 'Ikke oppgitt';
        rad.appendChild(dt);
        rad.appendChild(dd);
        liste.appendChild(rad);
      }
    };

    var visSteg = function (nr) {
      steg = nr;
      for (var i = 0; i < panelene.length; i++) {
        if (parseInt(panelene[i].getAttribute('data-panel'), 10) === nr) panelene[i].removeAttribute('hidden');
        else panelene[i].setAttribute('hidden', '');
      }
      if (kvittering) kvittering.setAttribute('hidden', '');
      for (var j = 0; j < punktene.length; j++) {
        punktene[j].classList.toggle('is-aktiv', j === nr - 1);
        punktene[j].classList.toggle('is-ferdig', j < nr - 1);
      }
      if (nr === 3) fyllListe(skjema.querySelector('[data-oppsum]'), rader());
    };

    for (var v = 0; v < valgKnappene.length; v++) {
      valgKnappene[v].addEventListener('click', function () {
        valgtType = this.getAttribute('data-valg');
        for (var i = 0; i < valgKnappene.length; i++) {
          valgKnappene[i].setAttribute('aria-pressed', valgKnappene[i] === this ? 'true' : 'false');
        }
        feltFeil(1, false);
      });
    }

    var nesteKnappene = skjema.querySelectorAll('[data-neste]');

    for (var n = 0; n < nesteKnappene.length; n++) {
      nesteKnappene[n].addEventListener('click', function () {
        var fra = parseInt(this.getAttribute('data-neste'), 10);
        if (fra === 1) {
          if (!valgtType) {
            feltFeil(1, true);
            return;
          }
          feltFeil(1, false);
          visSteg(2);
          return;
        }
        if (fra === 2) {
          if (!verdi('Navn') || !verdi('Kontakt')) {
            feltFeil(2, true);
            return;
          }
          feltFeil(2, false);
          visSteg(3);
        }
      });
    }

    var tilbakeKnappene = skjema.querySelectorAll('[data-tilbake]');

    for (var t = 0; t < tilbakeKnappene.length; t++) {
      tilbakeKnappene[t].addEventListener('click', function () {
        visSteg(parseInt(this.getAttribute('data-tilbake'), 10));
      });
    }

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      // Enter i et felt skal ikke sende et halvferdig skjema.
      if (steg !== 3) {
        var videre = skjema.querySelector('[data-neste="' + steg + '"]');
        if (videre) videre.click();
        return;
      }

      var aar = String(new Date().getFullYear()).slice(2);
      var nummer = 'LE-' + aar + '-' + (1000 + Math.floor(Math.random() * 9000));
      var nummerEl = skjema.querySelector('[data-kvitt-nr]');
      if (nummerEl) nummerEl.textContent = nummer;

      fyllListe(skjema.querySelector('[data-kvitt-liste]'), rader());

      for (var i = 0; i < panelene.length; i++) panelene[i].setAttribute('hidden', '');
      if (kvittering) kvittering.removeAttribute('hidden');

      for (var j = 0; j < punktene.length; j++) {
        punktene[j].classList.remove('is-aktiv');
        punktene[j].classList.add('is-ferdig');
      }

      var linjer = [];
      var alle = rader();
      for (var k = 0; k < alle.length; k++) {
        linjer.push(alle[k][0] + ': ' + (alle[k][1] || 'Ikke oppgitt'));
      }
      linjer.push('');
      linjer.push('Referanse: ' + nummer);

      var emne = 'Forespørsel fra nettsiden — ' + valgtType + ' (' + nummer + ')';
      window.location.href =
        'mailto:frans@lysellentreprenor.no' +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));

      var kvittStatus = skjema.querySelector('[data-kvitt-status]');
      if (kvittStatus) {
        kvittStatus.textContent = 'E-postprogrammet åpnes med opplysningene. Ingenting er lagret i nettleseren din.';
      }
    });

    var nyKnapp = skjema.querySelector('[data-ny]');
    if (nyKnapp) {
      nyKnapp.addEventListener('click', function () {
        skjema.reset();
        valgtType = '';
        for (var i = 0; i < valgKnappene.length; i++) valgKnappene[i].setAttribute('aria-pressed', 'false');
        feltFeil(1, false);
        feltFeil(2, false);
        visSteg(1);
      });
    }
  }

  /* ---------- Årstall ---------- */

  var aarEl = document.querySelectorAll('[data-year]');
  for (var a = 0; a < aarEl.length; a++) aarEl[a].textContent = String(new Date().getFullYear());
})();
