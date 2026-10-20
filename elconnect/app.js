/* Elconnect AS — demointeraksjon. Alt skjer i nettleseren; ingenting sendes. */
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('meny');

  if (toggle && meny) {
    var lukk = function () {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne menyen');
      meny.hidden = true;
    };

    var apne = function () {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Lukk menyen');
      meny.hidden = false;
    };

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        lukk();
      } else {
        apne();
      }
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukk();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        lukk();
        toggle.focus();
      }
    });

    var bred = window.matchMedia('(min-width: 901px)');
    var synkNav = function () {
      if (bred.matches) {
        meny.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        meny.hidden = true;
      }
    };
    synkNav();
    if (bred.addEventListener) {
      bred.addEventListener('change', synkNav);
    } else if (bred.addListener) {
      bred.addListener(synkNav);
    }
  }

  /* ---------- Åpent nå? (åpningstider hentet fra elconnect.no) ---------- */
  var statusEl = document.getElementById('status');
  var statusTekst = document.getElementById('status-tekst');
  var APNER = 7 * 60 + 30;
  var STENGER = 16 * 60;

  function osloNaa() {
    var tid = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Oslo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    var deler = {};
    for (var i = 0; i < tid.length; i++) deler[tid[i].type] = tid[i].value;
    return {
      dag: deler.weekday,
      minutter: parseInt(deler.hour, 10) * 60 + parseInt(deler.minute, 10)
    };
  }

  function oppdaterStatus() {
    if (!statusEl || !statusTekst) return;
    var naa;
    try {
      naa = osloNaa();
    } catch (e) {
      return;
    }
    var helg = naa.dag === 'Sat' || naa.dag === 'Sun';
    var apent = !helg && naa.minutter >= APNER && naa.minutter < STENGER;
    var tekst;

    if (apent) {
      tekst = 'Åpent nå · stenger 16:00';
      statusEl.className = 'status status--apent';
    } else if (!helg && naa.minutter < APNER) {
      tekst = 'Stengt nå · åpner 07:30 i dag';
      statusEl.className = 'status status--stengt';
    } else {
      tekst = 'Stengt nå · åpner 07:30 neste virkedag';
      statusEl.className = 'status status--stengt';
    }

    statusTekst.textContent = tekst;
    statusEl.title = 'Åpningstider: mandag–fredag 07:30–16:00';
  }

  oppdaterStatus();
  window.setInterval(oppdaterStatus, 60000);

  /* ---------- Tjenestelenker forhåndsvelger i skjemaet ---------- */
  var skjema = document.getElementById('foresporsel-skjema');
  var kvittering = document.getElementById('kvittering');
  var feilEl = document.getElementById('feltfeil');

  function velgTjeneste(navn) {
    if (!skjema) return;
    var valg = skjema.querySelectorAll('input[name="tjeneste"]');
    for (var i = 0; i < valg.length; i++) {
      if (valg[i].value === navn) valg[i].checked = true;
    }
  }

  var tjenesteLenker = document.querySelectorAll('[data-tjeneste]');
  for (var t = 0; t < tjenesteLenker.length; t++) {
    tjenesteLenker[t].addEventListener('click', function () {
      velgTjeneste(this.getAttribute('data-tjeneste'));
      if (kvittering && !kvittering.hidden) visSkjema();
    });
  }

  /* ---------- Forespørselsskjema ---------- */
  var KODER = {
    'Hovedtavle': 'HT',
    'Underfordeling': 'UF',
    'Service / Ettermontering': 'SE',
    'Strømskinne': 'ST',
    'Gravering': 'GR'
  };

  function visSkjema() {
    if (!kvittering) return;
    kvittering.hidden = true;
    skjema.hidden = false;
  }

  function felt(tekst, verdi) {
    var dt = document.createElement('dt');
    dt.textContent = tekst;
    var dd = document.createElement('dd');
    dd.textContent = verdi && verdi.length ? verdi : 'Ikke oppgitt';
    return [dt, dd];
  }

  function lesSkjema() {
    var tjeneste = skjema.querySelector('input[name="tjeneste"]:checked');
    var omfang = [];
    var bokser = skjema.querySelectorAll('input[name="omfang"]:checked');
    for (var i = 0; i < bokser.length; i++) omfang.push(bokser[i].value);

    return {
      tjeneste: tjeneste ? tjeneste.value : '',
      omfang: omfang,
      antall: document.getElementById('antall').value,
      frist: document.getElementById('frist').value,
      navn: document.getElementById('navn').value.trim(),
      firma: document.getElementById('firma').value.trim(),
      epost: document.getElementById('epost').value.trim(),
      telefon: document.getElementById('telefon').value.trim()
    };
  }

  function visFeil(tekst, feltNavn) {
    if (!feilEl) return;
    feilEl.textContent = tekst;
    feilEl.hidden = false;
    if (feltNavn) {
      var el = document.getElementById(feltNavn);
      if (el) {
        el.setAttribute('aria-invalid', 'true');
        el.focus();
      }
    }
  }

  function nullstillFeil() {
    if (!feilEl) return;
    feilEl.hidden = true;
    feilEl.textContent = '';
    var feltMedFeil = skjema.querySelectorAll('[aria-invalid]');
    for (var i = 0; i < feltMedFeil.length; i++) feltMedFeil[i].removeAttribute('aria-invalid');
  }

  function lagReferanse(tjeneste) {
    var kode = KODER[tjeneste] || 'TA';
    var tall;
    if (window.crypto && window.crypto.getRandomValues) {
      var b = new Uint32Array(1);
      window.crypto.getRandomValues(b);
      tall = 1000 + (b[0] % 9000);
    } else {
      tall = 1000 + Math.floor(Math.random() * 9000);
    }
    return 'ELC-' + kode + '-' + tall;
  }

  function sammendrag(data, ref) {
    var linjer = [
      'Forespørsel ' + ref,
      'Tjeneste: ' + data.tjeneste,
      'Omfang: ' + data.omfang.join(', '),
      'Antall: ' + data.antall,
      'Ønsket levering: ' + data.frist,
      'Navn: ' + data.navn
    ];
    if (data.firma) linjer.push('Firma: ' + data.firma);
    linjer.push('E-post: ' + data.epost);
    if (data.telefon) linjer.push('Telefon: ' + data.telefon);
    return linjer.join('\n');
  }

  if (skjema && kvittering) {
    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      nullstillFeil();

      var data = lesSkjema();

      if (!data.tjeneste) {
        visFeil('Velg hva du trenger i steg 1.', 'navn');
        return;
      }
      if (!data.navn) {
        visFeil('Fyll inn navnet ditt, så vi vet hvem vi svarer.', 'navn');
        return;
      }
      if (!data.epost || data.epost.indexOf('@') < 1) {
        visFeil('Fyll inn en gyldig e-postadresse.', 'epost');
        return;
      }
      if (!data.omfang.length) {
        visFeil('Kryss av minst ett punkt i steg 2.');
        return;
      }

      var ref = lagReferanse(data.tjeneste);
      var liste = document.getElementById('kvittering-liste');
      liste.textContent = '';

      var par = [
        felt('Tjeneste', data.tjeneste),
        felt('Omfang', data.omfang.join(', ')),
        felt('Antall', data.antall),
        felt('Ønsket levering', data.frist),
        felt('Navn', data.navn),
        felt('Firma', data.firma),
        felt('E-post', data.epost),
        felt('Telefon', data.telefon)
      ];
      for (var i = 0; i < par.length; i++) {
        liste.appendChild(par[i][0]);
        liste.appendChild(par[i][1]);
      }

      document.getElementById('kvittering-ref').textContent = ref;

      var tekst = sammendrag(data, ref);
      var send = document.getElementById('kvittering-send');
      send.href = 'mailto:post@elconnect.no'
        + '?subject=' + encodeURIComponent('Forespørsel ' + ref + ' – ' + data.tjeneste)
        + '&body=' + encodeURIComponent(tekst);
      send.setAttribute('data-sammendrag', tekst);

      var statusFelt = document.getElementById('kvittering-status');
      statusFelt.textContent = '';

      skjema.hidden = true;
      kvittering.hidden = false;
      kvittering.focus();
    });

    document.getElementById('kvittering-kopier').addEventListener('click', function () {
      var send = document.getElementById('kvittering-send');
      var tekst = send.getAttribute('data-sammendrag') || '';
      var statusFelt = document.getElementById('kvittering-status');
      var knapp = this;

      function kvitter(melding) {
        statusFelt.textContent = melding;
        var opprinnelig = knapp.textContent;
        knapp.textContent = 'Kopiert';
        window.setTimeout(function () {
          knapp.textContent = opprinnelig;
        }, 2200);
      }

      function reservemetode() {
        var boks = document.createElement('textarea');
        boks.value = tekst;
        boks.setAttribute('readonly', 'readonly');
        boks.style.position = 'fixed';
        boks.style.top = '0';
        boks.style.left = '0';
        document.body.appendChild(boks);
        boks.select();
        var ok = false;
        try {
          ok = document.execCommand('copy');
        } catch (e) {
          ok = false;
        }
        document.body.removeChild(boks);
        if (ok) {
          kvitter('Sammendraget er kopiert.');
        } else {
          statusFelt.textContent = 'Nettleseren nektet å kopiere. Merk teksten i sammendraget og kopier manuelt.';
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          kvitter('Sammendraget er kopiert.');
        }).catch(reservemetode);
      } else {
        reservemetode();
      }
    });

    document.getElementById('kvittering-endre').addEventListener('click', function () {
      visSkjema();
      document.getElementById('navn').focus();
    });
  }

  /* ---------- Rolig innkomst av innhold ---------- */
  var elementer = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observator = new IntersectionObserver(function (oppforinger) {
      for (var i = 0; i < oppforinger.length; i++) {
        if (oppforinger[i].isIntersecting) {
          oppforinger[i].target.classList.add('is-visible');
          observator.unobserve(oppforinger[i].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var r = 0; r < elementer.length; r++) observator.observe(elementer[r]);
  } else {
    for (var k = 0; k < elementer.length; k++) elementer[k].classList.add('is-visible');
  }
}());
