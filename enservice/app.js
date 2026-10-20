/*
  Entreprenørservice AS — app.js
  Tre ting brukeren kan gjøre: åpne faglista, følge med på oppdragsarket
  mens skjemaet fylles ut, og lage en kvittering med referansenummer.
  Alt skjer i nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */
  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function erMobil() {
    return window.innerWidth <= 900;
  }

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.hidden = true;
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (meny && menyKnapp) {
    if (erMobil()) meny.hidden = true;

    menyKnapp.addEventListener('click', function () {
      var apen = meny.hidden;
      meny.hidden = !apen;
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (!erMobil()) {
        meny.hidden = false;
        menyKnapp.setAttribute('aria-expanded', 'false');
        menyKnapp.setAttribute('aria-label', 'Åpne meny');
      } else if (menyKnapp.getAttribute('aria-expanded') !== 'true') {
        meny.hidden = true;
      }
    });
  }

  /* ---------------- Årstall i footer ---------------- */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Innhold som kommer inn i bildet ---------------- */
  var inn = document.querySelectorAll('.reveal');
  if (inn.length && 'IntersectionObserver' in window) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add('is-visible');
          observator.unobserve(o.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(inn, function (el) {
      observator.observe(el);
    });
  } else {
    Array.prototype.forEach.call(inn, function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------------- Oppdragsarket ----------------
     Skjemaet er en skisse: hvert felt speiles i arket ved siden av, og
     innsending lager en kvittering med referansenummer. Selve forsendelsen
     er en e-post brukeren ser og sender selv.
  */
  var skjema = document.getElementById('oppdragSkjema');
  var ark = document.getElementById('arket');

  if (skjema && ark) {
    var fagValg = document.getElementById('fagValg');
    var arkFag = document.getElementById('arkFag');
    var arkSted = document.getElementById('arkSted');
    var arkOppstart = document.getElementById('arkOppstart');
    var arkKontakt = document.getElementById('arkKontakt');
    var arkRef = document.getElementById('arkRef');
    var arkStatus = document.getElementById('arkStatus');
    var arkHandlinger = document.getElementById('arkHandlinger');
    var arkSend = document.getElementById('arkSend');
    var arkEndre = document.getElementById('arkEndre');
    var feilFag = document.getElementById('feilFag');
    var referanse = '';

    function felt(id) {
      return document.getElementById(id);
    }

    function verdi(id) {
      var el = felt(id);
      return el ? String(el.value || '').trim() : '';
    }

    function valgteFag() {
      if (!fagValg) return [];
      return Array.prototype.slice
        .call(fagValg.querySelectorAll('button[aria-pressed="true"]'))
        .map(function (b) {
          return b.getAttribute('data-verdi');
        });
    }

    function kontaktlinje() {
      var deler = [];
      if (verdi('navn')) deler.push(verdi('navn'));
      if (verdi('telefon')) deler.push(verdi('telefon'));
      if (verdi('epost')) deler.push(verdi('epost'));
      return deler.join(' · ');
    }

    function skrivArk() {
      var fag = valgteFag();

      if (arkFag) arkFag.textContent = fag.join(', ');
      if (arkSted) arkSted.textContent = verdi('sted');
      if (arkOppstart) arkOppstart.textContent = verdi('oppstart') || 'Så snart som mulig';
      if (arkKontakt) arkKontakt.textContent = kontaktlinje();

      if (referanse) return;

      var mangler = [];
      if (!fag.length) mangler.push('fag');
      if (!verdi('sted')) mangler.push('sted');
      if (!verdi('navn')) mangler.push('navn');
      if (!verdi('telefon')) mangler.push('telefon');
      if (!verdi('epost')) mangler.push('e-post');

      if (!mangler.length) {
        byttStatus('Alt er fylt ut. Lag oppdragsarket for å få kvitteringen.', 'klar');
      } else {
        byttStatus('Mangler: ' + mangler.join(', ') + '.', '');
      }
    }

    function byttStatus(tekst, type) {
      if (!arkStatus) return;
      arkStatus.textContent = tekst;
      if (type) {
        arkStatus.setAttribute('data-type', type);
      } else {
        arkStatus.removeAttribute('data-type');
      }
    }

    function lagReferanse() {
      var arstall = new Date().getFullYear();
      var nr = '';
      for (var i = 0; i < 4; i++) nr += String(Math.floor(Math.random() * 10));
      return 'ES-' + arstall + '-' + nr;
    }

    var PAAKREVD = {
      sted: 'Fyll inn sted eller adresse for oppdraget.',
      navn: 'Fyll inn navnet ditt.',
      telefon: 'Fyll inn et telefonnummer vi kan nå deg på.',
      epost: 'Fyll inn en e-postadresse vi kan svare til.'
    };

    function feilmelding(id) {
      var v = verdi(id);
      if (!v) return PAAKREVD[id] || 'Feltet må fylles ut.';

      if (id === 'epost' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return 'Skriv en gyldig e-postadresse, for eksempel navn@epost.no.';
      }

      if (id === 'telefon') {
        var siffer = v.replace(/[^0-9]/g, '');
        if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
      }

      return '';
    }

    function visFeltfeil(id, melding) {
      var vis = document.querySelector('[data-feil-for="' + id + '"]');
      var el = felt(id);
      if (vis) vis.textContent = melding || '';
      if (!el) return;
      if (melding) {
        el.setAttribute('aria-invalid', 'true');
      } else {
        el.removeAttribute('aria-invalid');
      }
    }

    function sjekkSkjema() {
      var forsteFeil = null;

      if (!valgteFag().length) {
        if (feilFag) feilFag.textContent = 'Velg minst ett fag, eller «Vet ikke ennå».';
        if (fagValg) forsteFeil = fagValg.querySelector('button');
      } else if (feilFag) {
        feilFag.textContent = '';
      }

      ['sted', 'navn', 'telefon', 'epost'].forEach(function (id) {
        var melding = feilmelding(id);
        visFeltfeil(id, melding);
        if (melding && !forsteFeil) forsteFeil = felt(id);
      });

      if (forsteFeil) {
        forsteFeil.focus();
        byttStatus('Noen felt mangler eller er feil utfylt. Rett dem og prøv igjen.', 'feil');
      }

      return !forsteFeil;
    }

    function epostLenke() {
      var fag = valgteFag();
      var sted = verdi('sted');
      var emne = 'Forespørsel fra nettsiden: ' + (fag.join(', ') || 'Henvendelse') + (sted ? ' – ' + sted : '');
      var linjer = ['Hei!', '', 'Jeg sender en forespørsel fra nettsiden deres.', ''];

      linjer.push('Fag: ' + (fag.join(', ') || 'Ikke valgt'));
      linjer.push('Sted: ' + sted);
      linjer.push('Ønsket oppstart: ' + (verdi('oppstart') || 'Så snart som mulig'));
      if (verdi('beskrivelse')) linjer.push('Om oppdraget: ' + verdi('beskrivelse'));
      linjer.push('');
      linjer.push('Navn: ' + verdi('navn'));
      linjer.push('Telefon: ' + verdi('telefon'));
      linjer.push('E-post: ' + verdi('epost'));
      linjer.push('', 'Referanse: ' + referanse, '', 'Hilsen ' + verdi('navn'));

      return 'mailto:post@enservice.no?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));
    }

    if (fagValg) {
      fagValg.addEventListener('click', function (event) {
        var knapp = event.target.closest('button[data-verdi]');
        if (!knapp) return;
        var trykt = knapp.getAttribute('aria-pressed') === 'true';
        knapp.setAttribute('aria-pressed', trykt ? 'false' : 'true');
        if (feilFag && valgteFag().length) feilFag.textContent = '';
        skrivArk();
      });
    }

    skjema.addEventListener('input', function (event) {
      var el = event.target;
      if (el && el.id) {
        var vis = document.querySelector('[data-feil-for="' + el.id + '"]');
        if (vis && vis.textContent) visFeltfeil(el.id, feilmelding(el.id));
      }
      skrivArk();
    });

    skjema.addEventListener('change', function (event) {
      var el = event.target;
      if (el && el.id) {
        var vis = document.querySelector('[data-feil-for="' + el.id + '"]');
        if (vis && vis.textContent) visFeltfeil(el.id, feilmelding(el.id));
      }
      skrivArk();
    });

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!sjekkSkjema()) return;

      if (!referanse) referanse = lagReferanse();
      if (arkRef) arkRef.textContent = referanse;
      if (arkSend) arkSend.setAttribute('href', epostLenke());

      ark.setAttribute('data-tilstand', 'kvittert');
      if (arkHandlinger) arkHandlinger.hidden = false;

      byttStatus('Kvittering ' + referanse + ' er klar. Ingenting er sendt ennå: knappen under åpner e-posten din med oppdragsarket ferdig utfylt.', 'klar');
      skrivArk();

      ark.focus({ preventScroll: true });
      if (ark.scrollIntoView) {
        ark.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });

    if (arkEndre) {
      arkEndre.addEventListener('click', function () {
        var forste = fagValg ? fagValg.querySelector('button') : null;
        if (forste) forste.focus();
      });
    }

    skrivArk();
  }
})();
