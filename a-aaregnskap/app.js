/*
  A-Å Regnskap AS — interaksjon.
  To ting: mobilmenyen fra kit/base.css, og bookingflyten som er demosidens
  ene verktøy. Alt skjer i nettleseren. Ingen data forlater siden, og
  forespørselen sendes først når brukeren selv åpner e-posten.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* ---------------- Mobilmeny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('hovedmeny');
  var smal = window.matchMedia('(max-width: 900px)');

  if (toggle && meny) {
    var settMeny = function (apen) {
      meny.hidden = !apen;
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    };

    var synkMeny = function () {
      if (smal.matches) {
        settMeny(false);
      } else {
        meny.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    synkMeny();

    toggle.addEventListener('click', function () {
      settMeny(meny.hidden);
    });

    meny.addEventListener('click', function (hendelse) {
      if (smal.matches && hendelse.target.closest('a')) settMeny(false);
    });

    if (smal.addEventListener) smal.addEventListener('change', synkMeny);
    else if (smal.addListener) smal.addListener(synkMeny);
  }

  /* ---------------- Booking ---------------- */

  var panel = document.getElementById('booking-panel');
  var stegMerke = document.getElementById('verktoy-steg');

  if (panel && stegMerke) {
    var TJENESTER = [
      { id: 'regnskap', navn: 'Regnskap', hva: 'Bokføring, avstemning og omsetningsoppgave' },
      { id: 'lonn', navn: 'Lønn', hva: 'Lønnsslipper, A-melding og skattetrekk' },
      { id: 'fakturering', navn: 'Fakturering', hva: 'Elektroniske fakturaer fra økonomisystemet' },
      { id: 'radgivning', navn: 'Rådgivning', hva: 'Løpende spørsmål og raske svar' },
      { id: 'hele', navn: 'Hele eller deler', hva: 'Vi tar alt, bare litt, eller er kontrollør' }
    ];

    var TIDER = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

    var MAIL = 'marianne@a-aaregnskap.no';
    var TLF = '+4793267432';
    var TLF_VIS = '932 67 432';

    var ukedagFmt = new Intl.DateTimeFormat('nb-NO', { weekday: 'short' });
    var datoFmt = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' });
    var langFmt = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

    var steg = 1;
    var valg = { tjeneste: null, dag: null, tid: null };
    var dager = lagDager();

    function lagDager() {
      var ut = [];
      var d = new Date();
      d.setHours(12, 0, 0, 0);
      var vakt = 0;
      while (ut.length < 10 && vakt < 40) {
        vakt++;
        d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        var ukedag = d.getDay();
        if (ukedag === 0 || ukedag === 6) continue;
        ut.push({ dato: new Date(d), nokkel: nokkel(d) });
      }
      return ut;
    }

    function nokkel(d) {
      var mnd = String(d.getMonth() + 1);
      var dag = String(d.getDate());
      if (mnd.length < 2) mnd = '0' + mnd;
      if (dag.length < 2) dag = '0' + dag;
      return d.getFullYear() + '-' + mnd + '-' + dag;
    }

    function tjenesteVed(id) {
      for (var i = 0; i < TJENESTER.length; i++) {
        if (TJENESTER[i].id === id) return TJENESTER[i];
      }
      return null;
    }

    function dagVed(nokkelVerdi) {
      for (var i = 0; i < dager.length; i++) {
        if (dager[i].nokkel === nokkelVerdi) return dager[i];
      }
      return null;
    }

    /* En tid er «opptatt» etter en fast regel, slik at skissen ser levende ut
       uten å late som den kjenner kalenderen deres. */
    function erOpptatt(dagIndeks, tidIndeks) {
      return (dagIndeks * 2 + tidIndeks * 3) % 7 === 0;
    }

    function el(lagnavn, klasser, tekst) {
      var node = document.createElement(lagnavn);
      if (klasser) node.className = klasser;
      if (tekst !== undefined) node.textContent = tekst;
      return node;
    }

    function knapp(klasse, etikett) {
      var b = el('button', klasse, etikett);
      b.type = 'button';
      return b;
    }

    function fokuser(node) {
      if (!node) return;
      try {
        node.focus({ preventScroll: false });
      } catch (feil) {
        node.focus();
      }
    }

    function settSteg(nr) {
      steg = nr;
      stegMerke.textContent = nr === 1 ? 'Steg 1 av 3' : nr === 4 ? 'Ferdig' : 'Steg ' + nr + ' av 3';
      tegn();
    }

    function tegn() {
      panel.textContent = '';
      if (steg === 1) tegnTjeneste();
      else if (steg === 2) tegnDag();
      else if (steg === 3) tegnTid();
      else tegnKvittering();
    }

    function tegnTjeneste() {
      var tittel = el('p', 'verktoy__sporsmal', 'Hva skal samtalen handle om?');
      panel.appendChild(tittel);

      var gruppe = el('div', 'valg');
      gruppe.setAttribute('role', 'group');
      gruppe.setAttribute('aria-label', 'Velg tjeneste');

      TJENESTER.forEach(function (t) {
        var b = knapp('valg__knapp');
        b.appendChild(document.createTextNode(t.navn));
        b.appendChild(el('small', null, t.hva));
        b.setAttribute('aria-pressed', valg.tjeneste === t.id ? 'true' : 'false');
        b.addEventListener('click', function () {
          valg.tjeneste = t.id;
          valg.dag = null;
          valg.tid = null;
          settSteg(2);
        });
        gruppe.appendChild(b);
      });

      panel.appendChild(gruppe);
    }

    function tegnDag() {
      var tjeneste = tjenesteVed(valg.tjeneste);

      panel.appendChild(el('p', 'verktoy__sporsmal', 'Hvilken dag passer?'));
      panel.appendChild(
        el('p', 'small', tjeneste ? 'Du har valgt ' + tjeneste.navn + '.' : '')
      );

      var rutenett = el('div', 'dager');
      rutenett.setAttribute('role', 'group');
      rutenett.setAttribute('aria-label', 'Velg dag');

      dager.forEach(function (d, indeks) {
        var b = knapp('dag');
        b.appendChild(el('strong', null, ukedagFmt.format(d.dato).replace('.', '')));
        b.appendChild(el('span', null, datoFmt.format(d.dato)));
        b.setAttribute('aria-pressed', valg.dag === d.nokkel ? 'true' : 'false');
        b.setAttribute('aria-label', langFmt.format(d.dato));
        b.addEventListener('click', function () {
          valg.dag = d.nokkel;
          valg.tid = null;
          settSteg(3);
        });
        rutenett.appendChild(b);
      });

      panel.appendChild(rutenett);

      var fot = el('div', 'verktoy__fot');
      var tilbake = knapp('btn btn--tekst', '← Velg tjeneste på nytt');
      tilbake.addEventListener('click', function () {
        settSteg(1);
      });
      fot.appendChild(tilbake);
      panel.appendChild(fot);
    }

    function tegnTid() {
      var dag = dagVed(valg.dag);
      var tjeneste = tjenesteVed(valg.tjeneste);

      panel.appendChild(el('p', 'verktoy__sporsmal', 'Når passer det?'));
      panel.appendChild(
        el(
          'p',
          'small',
          (tjeneste ? tjeneste.navn + ' · ' : '') +
            (dag ? langFmt.format(dag.dato) : 'valgt dag')
        )
      );

      var rutenett = el('div', 'tider');
      rutenett.setAttribute('role', 'group');
      rutenett.setAttribute('aria-label', 'Velg klokkeslett');

      var dagIndeks = 0;
      for (var i = 0; i < dager.length; i++) {
        if (dager[i].nokkel === valg.dag) dagIndeks = i;
      }

      TIDER.forEach(function (tid, tidIndeks) {
        var opptatt = erOpptatt(dagIndeks, tidIndeks);
        var b = knapp('tid', tid);
        b.setAttribute('aria-pressed', valg.tid === tid ? 'true' : 'false');
        if (opptatt) {
          b.disabled = true;
          b.setAttribute('aria-label', tid + ' — opptatt');
        } else {
          b.setAttribute('aria-label', 'Klokken ' + tid);
          b.addEventListener('click', function () {
            valg.tid = tid;
            settSteg(4);
          });
        }
        rutenett.appendChild(b);
      });

      panel.appendChild(rutenett);

      var fot = el('div', 'verktoy__fot');
      var tilbake = knapp('btn btn--tekst', '← Velg en annen dag');
      tilbake.addEventListener('click', function () {
        settSteg(2);
      });
      fot.appendChild(tilbake);
      panel.appendChild(fot);

      fokuser(rutenett.querySelector('.tid:not([disabled])'));
    }

    function tegnKvittering() {
      var tjeneste = tjenesteVed(valg.tjeneste);
      var dag = dagVed(valg.dag);

      var boks = el('div', 'kvittering');
      boks.appendChild(el('span', 'kvittering__flagg', 'Forespørselen er klar'));
      boks.appendChild(el('h3', null, 'Takk — her er oppsummeringen'));

      var liste = el('dl');
      leggRad(liste, 'Tjeneste', tjeneste ? tjeneste.navn : '—');
      leggRad(liste, 'Dag', dag ? langFmt.format(dag.dato) : '—');
      leggRad(liste, 'Klokken', valg.tid || '—');
      boks.appendChild(liste);

      boks.appendChild(
        el(
          'p',
          null,
          'Ingenting er sendt ennå. Åpne e-posten for å sende forespørselen til oss, så bekrefter vi tidspunktet.'
        )
      );

      var handlinger = el('div', 'kvittering__handlinger');

      var emne = 'Forespørsel om samtale: ' + (tjeneste ? tjeneste.navn : '');
      var kropp =
        'Hei!\n\n' +
        'Jeg ønsker en uforpliktende samtale.\n\n' +
        'Tjeneste: ' + (tjeneste ? tjeneste.navn : '') + '\n' +
        'Dag: ' + (dag ? langFmt.format(dag.dato) : '') + '\n' +
        'Klokken: ' + (valg.tid || '') + '\n\n' +
        'Navn:\nBedrift:\nTelefon:\n\n' +
        'Hilsen\n';

      var mail = el('a', 'btn', 'Send på e-post');
      mail.href =
        'mailto:' + MAIL + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
      handlinger.appendChild(mail);

      var ring = el('a', 'btn btn--ghost', 'Ring ' + TLF_VIS);
      ring.href = 'tel:' + TLF;
      handlinger.appendChild(ring);

      var endre = knapp('btn btn--tekst', 'Endre valget');
      endre.addEventListener('click', function () {
        valg.dag = null;
        valg.tid = null;
        settSteg(1);
      });
      handlinger.appendChild(endre);

      boks.appendChild(handlinger);
      panel.appendChild(boks);

      fokuser(mail);
    }

    function leggRad(liste, navn, verdi) {
      liste.appendChild(el('dt', null, navn));
      liste.appendChild(el('dd', null, verdi));
    }

    tegn();
  }

  /* ---------------- Innkommende seksjoner ---------------- */

  var los = document.querySelectorAll('.reveal');

  if (los.length) {
    if ('IntersectionObserver' in window) {
      var observator = new IntersectionObserver(
        function (oppforinger) {
          oppforinger.forEach(function (opp) {
            if (opp.isIntersecting) {
              opp.target.classList.add('is-visible');
              observator.unobserve(opp.target);
            }
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
      );

      Array.prototype.forEach.call(los, function (node) {
        observator.observe(node);
      });

      /* Sikkerhetsnett: alt skal være synlig selv om observatøren ikke fyrer. */
      window.setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.is-visible)'), function (node) {
          node.classList.add('is-visible');
        });
      }, 1400);
    } else {
      Array.prototype.forEach.call(los, function (node) {
        node.classList.add('is-visible');
      });
    }
  }
})();
