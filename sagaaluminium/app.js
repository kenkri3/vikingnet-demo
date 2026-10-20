/* Saga Aluminium — små interaksjoner. Ingen avhengigheter, ingen sporing,
   ingen backend. Forespørselen holdes i nettleseren og kan sendes videre
   med brukerens eget e-postprogram. */

(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* ---------------------------------------------------------------- *
   * Mobilmeny
   * ---------------------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var smal = window.matchMedia('(max-width: 1000px)');

  if (toggle && nav) {
    var settMeny = function (apen) {
      if (apen) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(apen));
    };

    toggle.addEventListener('click', function () {
      settMeny(nav.hasAttribute('hidden'));
    });

    nav.addEventListener('click', function (hendelse) {
      if (smal.matches && hendelse.target.closest('a')) settMeny(false);
    });

    var vedBredde = function () {
      if (smal.matches) settMeny(false);
      else settMeny(true);
    };

    if (smal.addEventListener) smal.addEventListener('change', vedBredde);
    else if (smal.addListener) smal.addListener(vedBredde);

    vedBredde();
  }

  /* ---------------------------------------------------------------- *
   * Rolig innkomst når seksjonen kommer i bildet
   * ---------------------------------------------------------------- */
  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rolige = document.querySelectorAll('.reveal');

  if (redusertBevegelse || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(rolige, function (el) { el.classList.add('is-visible'); });
  } else {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(rolige, function (el) { observator.observe(el); });
  }

  /* ---------------------------------------------------------------- *
   * Årstall i footer
   * ---------------------------------------------------------------- */
  var aar = document.querySelector('[data-year]');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------- *
   * Forespørsel: velg tema, fyll ut, få kvittering med kontaktperson
   * ---------------------------------------------------------------- */
  var MOTTAKERE = {
    fasade: { navn: 'Jan Israelsen', rolle: 'fasaderådgiver' },
    vindu: { navn: 'Øystein Smith Kjær', rolle: 'glassrådgiver' },
    dor: { navn: 'Øystein Smith Kjær', rolle: 'glassrådgiver' },
    rekkverk: { navn: 'Kenneth Sande', rolle: 'glassrådgiver' },
    baldakin: { navn: 'Jan Israelsen', rolle: 'fasaderådgiver' },
    rehab: { navn: 'Kenneth Sande', rolle: 'glassrådgiver' }
  };

  var TEMAER = {
    fasade: 'Fasader',
    vindu: 'Vinduer',
    dor: 'Dører og automatikk',
    rekkverk: 'Rekkverk',
    baldakin: 'Baldakiner',
    rehab: 'Rehabilitering'
  };

  var skjema = document.querySelector('[data-skjema]');

  if (skjema) {
    var steg1 = skjema.querySelector('[data-steg="1"]');
    var steg2 = skjema.querySelector('[data-steg="2"]');
    var knapper = skjema.querySelectorAll('.valg__knapp');
    var mottakerLinje = skjema.querySelector('[data-mottaker]');
    var nesteKnapp = skjema.querySelector('[data-neste]');
    var tilbakeKnapp = skjema.querySelector('[data-tilbake]');
    var kvittering = document.querySelector('[data-kvittering]');
    var refFelt = kvittering.querySelector('[data-ref]');
    var liste = kvittering.querySelector('[data-liste]');
    var epostLenke = kvittering.querySelector('[data-epost]');
    var nyKnapp = kvittering.querySelector('[data-ny]');
    var valgtTema = '';

    var visSteg = function (nummer) {
      steg1.hidden = nummer !== 1;
      steg2.hidden = nummer !== 2;
    };

    var velgTema = function (knapp) {
      Array.prototype.forEach.call(knapper, function (annen) {
        annen.setAttribute('aria-checked', String(annen === knapp));
      });
      valgtTema = knapp.getAttribute('data-kategori');
      nesteKnapp.disabled = false;

      var mottaker = MOTTAKERE[valgtTema];
      mottakerLinje.textContent = '';
      var sterk = document.createElement('strong');
      sterk.textContent = mottaker.navn + ', ' + mottaker.rolle;
      mottakerLinje.appendChild(sterk);
      mottakerLinje.appendChild(document.createTextNode(' tar denne typen henvendelser hos oss.'));
      mottakerLinje.hidden = false;
    };

    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener('click', function () { velgTema(knapp); });
      knapp.addEventListener('keydown', function (hendelse) {
        var indeks = Array.prototype.indexOf.call(knapper, knapp);
        var retning = hendelse.key === 'ArrowRight' || hendelse.key === 'ArrowDown' ? 1
          : hendelse.key === 'ArrowLeft' || hendelse.key === 'ArrowUp' ? -1 : 0;
        if (!retning) return;
        hendelse.preventDefault();
        var ny = (indeks + retning + knapper.length) % knapper.length;
        knapper[ny].focus();
        velgTema(knapper[ny]);
      });
    });

    nesteKnapp.addEventListener('click', function () {
      if (!valgtTema) return;
      visSteg(2);
      var forste = steg2.querySelector('input');
      if (forste) forste.focus();
    });

    if (tilbakeKnapp) {
      tilbakeKnapp.addEventListener('click', function () {
        visSteg(1);
        var valgtKnapp = skjema.querySelector('.valg__knapp[aria-checked="true"]');
        if (valgtKnapp) valgtKnapp.focus();
      });
    }

    var feltListe = skjema.querySelectorAll('input, textarea');

    var nullstillFeil = function (felt) {
      var beholder = felt.closest('.felt');
      if (!beholder) return;
      beholder.classList.remove('felt--feil');
      felt.removeAttribute('aria-invalid');
      var melding = beholder.querySelector('[data-feil]');
      if (melding) melding.textContent = '';
    };

    var kontroller = function () {
      var forsteFeil = null;

      Array.prototype.forEach.call(feltListe, function (felt) {
        var verdi = felt.value.trim();
        var feil = '';

        if (felt.hasAttribute('required') && !verdi) {
          feil = 'Fyll ut dette feltet.';
        } else if (felt.type === 'email' && verdi && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi)) {
          feil = 'Skriv en gyldig e-postadresse.';
        }

        var beholder = felt.closest('.felt');
        var melding = beholder.querySelector('[data-feil]');

        if (feil) {
          beholder.classList.add('felt--feil');
          felt.setAttribute('aria-invalid', 'true');
          melding.textContent = feil;
          if (!forsteFeil) forsteFeil = felt;
        } else {
          nullstillFeil(felt);
        }
      });

      return forsteFeil;
    };

    Array.prototype.forEach.call(feltListe, function (felt) {
      felt.addEventListener('input', function () { nullstillFeil(felt); });
    });

    var lagReferanse = function (naa) {
      var aar = String(naa.getFullYear()).slice(2);
      var maaned = String(naa.getMonth() + 1).padStart(2, '0');
      var lopenummer = String(Math.floor(Math.random() * 900) + 100);
      return 'SA-' + aar + maaned + '-' + lopenummer;
    };

    var leggTilRad = function (navn, verdi) {
      if (!verdi) return;
      var dt = document.createElement('dt');
      dt.textContent = navn;
      var dd = document.createElement('dd');
      dd.textContent = verdi;
      liste.appendChild(dt);
      liste.appendChild(dd);
    };

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      var feil = kontroller();
      if (feil) {
        feil.focus();
        return;
      }

      var data = new FormData(skjema);
      var naa = new Date();
      var referanse = lagReferanse(naa);
      var mottaker = MOTTAKERE[valgtTema];
      var tema = TEMAER[valgtTema];
      var navn = String(data.get('navn') || '').trim();
      var firma = String(data.get('firma') || '').trim();
      var epost = String(data.get('epost') || '').trim();
      var telefon = String(data.get('telefon') || '').trim();
      var sted = String(data.get('sted') || '').trim();
      var melding = String(data.get('melding') || '').trim();
      var tid = naa.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' kl. ' + naa.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

      refFelt.textContent = referanse;
      liste.textContent = '';
      leggTilRad('Tema', tema);
      leggTilRad('Mottaker', mottaker.navn + ', ' + mottaker.rolle);
      leggTilRad('Navn', navn);
      leggTilRad('Firma', firma);
      leggTilRad('E-post', epost);
      leggTilRad('Telefon', telefon);
      leggTilRad('Sted', sted);
      leggTilRad('Melding', melding);
      leggTilRad('Registrert', tid);

      var emne = 'Forespørsel ' + referanse + ' — ' + tema.toLowerCase() + ' (til ' + mottaker.navn + ')';
      var kropp = [
        'Referanse: ' + referanse,
        'Tema: ' + tema,
        'Mottaker: ' + mottaker.navn + ', ' + mottaker.rolle,
        'Registrert: ' + tid,
        '',
        'Navn: ' + navn,
        firma ? 'Firma: ' + firma : '',
        'E-post: ' + epost,
        telefon ? 'Telefon: ' + telefon : '',
        sted ? 'Sted: ' + sted : '',
        '',
        'Om prosjektet:',
        melding
      ].filter(function (linje) { return linje !== ''; }).join('\n');

      epostLenke.setAttribute('href', 'mailto:post@sagaaluminium.no?subject=' +
        encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp));

      skjema.hidden = true;
      kvittering.hidden = false;
      kvittering.focus();

      if (!redusertBevegelse) {
        kvittering.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });

    nyKnapp.addEventListener('click', function () {
      skjema.reset();
      valgtTema = '';
      Array.prototype.forEach.call(knapper, function (knapp) {
        knapp.setAttribute('aria-checked', 'false');
      });
      Array.prototype.forEach.call(feltListe, nullstillFeil);
      nesteKnapp.disabled = true;
      mottakerLinje.hidden = true;
      mottakerLinje.textContent = '';
      visSteg(1);
      kvittering.hidden = true;
      skjema.hidden = false;
      var forsteKnapp = skjema.querySelector('.valg__knapp');
      if (forsteKnapp) forsteKnapp.focus();
      if (!redusertBevegelse) {
        skjema.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
  }
})();
