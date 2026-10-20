/*
  Petter & Pia — interaksjon.
  Alt skjer i nettleseren. Ingenting sendes noe sted.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var menuBtn = document.getElementById('menuBtn');
  var mobilNav = document.getElementById('mobileNav');

  function settMeny(apen) {
    if (!menuBtn || !mobilNav) return;
    menuBtn.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    mobilNav.hidden = !apen;
  }

  if (menuBtn && mobilNav) {
    menuBtn.addEventListener('click', function () {
      settMeny(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    mobilNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) settMeny(false);
    });
  }

  /* ---------- Skygge under toppen når siden scrolles ---------- */

  var topp = document.getElementById('topp');

  if (topp) {
    var settSkygge = function () {
      topp.classList.toggle('is-stuck', window.scrollY > 8);
    };
    settSkygge();
    window.addEventListener('scroll', settSkygge, { passive: true });
  }

  /* ---------- Årstall i footer ---------- */

  var aar = document.getElementById('aar');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---------- Rolig innfading, med fallback ---------- */

  var blokker = Array.prototype.slice.call(document.querySelectorAll('.section, .hjelp'));
  blokker.forEach(function (b) { b.classList.add('reveal'); });

  function visAlle() {
    blokker.forEach(function (b) { b.classList.add('is-visible'); });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add('is-visible');
          io.unobserve(o.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    blokker.forEach(function (b) { io.observe(b); });
    window.setTimeout(visAlle, 1600);
  } else {
    visAlle();
  }

  /* ---------- Kundeservice: skjema og kvittering ---------- */

  var form = document.getElementById('sakForm');
  var kvitt = document.getElementById('kvitt');

  if (!form || !kvitt) return;

  var chipser = Array.prototype.slice.call(form.querySelectorAll('.chip'));
  var emneFelt = document.getElementById('emne');
  var navn = document.getElementById('navn');
  var epost = document.getElementById('epost');
  var ordre = document.getElementById('ordre');
  var melding = document.getElementById('melding');

  var kvittTittel = document.getElementById('kvittTittel');
  var kvittId = document.getElementById('kvittId');
  var kvittEmne = document.getElementById('kvittEmne');
  var kvittNavn = document.getElementById('kvittNavn');
  var kvittEpost = document.getElementById('kvittEpost');
  var kvittOrdre = document.getElementById('kvittOrdre');
  var kvittOrdreRad = document.getElementById('kvittOrdreRad');
  var kvittTid = document.getElementById('kvittTid');
  var kvittMail = document.getElementById('kvittMail');
  var nySak = document.getElementById('nySak');

  function velgEmne(knapp) {
    chipser.forEach(function (k) {
      k.setAttribute('aria-pressed', k === knapp ? 'true' : 'false');
    });
    if (emneFelt) emneFelt.value = knapp.getAttribute('data-emne') || '';
  }

  chipser.forEach(function (knapp) {
    knapp.addEventListener('click', function () { velgEmne(knapp); });
  });

  function visFeil(felt, meldingsId, tekst) {
    var boks = document.getElementById(meldingsId);
    if (tekst) {
      felt.setAttribute('aria-invalid', 'true');
      if (boks) {
        boks.textContent = tekst;
        boks.hidden = false;
      }
    } else {
      felt.removeAttribute('aria-invalid');
      if (boks) {
        boks.textContent = '';
        boks.hidden = true;
      }
    }
  }

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function lagSaksnummer() {
    var d = new Date();
    var dato = String(d.getFullYear()).slice(2) + toSiffer(d.getMonth() + 1) + toSiffer(d.getDate());
    var lopenummer = String((d.getSeconds() * 7 + d.getMilliseconds()) % 900 + 100);
    return 'PP-' + dato + '-' + lopenummer;
  }

  function lagTid(d) {
    return toSiffer(d.getDate()) + '.' + toSiffer(d.getMonth() + 1) + '.' + d.getFullYear() +
      ' kl. ' + toSiffer(d.getHours()) + ':' + toSiffer(d.getMinutes());
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var feil = [];
    var navnVerdi = (navn.value || '').trim();
    var epostVerdi = (epost.value || '').trim();
    var meldingVerdi = (melding.value || '').trim();
    var ordreVerdi = (ordre.value || '').trim();

    if (navnVerdi.length < 2) {
      visFeil(navn, 'navnFeil', 'Skriv navnet ditt, så vi vet hvem vi svarer.');
      feil.push(navn);
    } else {
      visFeil(navn, 'navnFeil', '');
    }

    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(epostVerdi)) {
      visFeil(epost, 'epostFeil', 'Skriv en e-postadresse vi kan svare på.');
      feil.push(epost);
    } else {
      visFeil(epost, 'epostFeil', '');
    }

    if (meldingVerdi.length < 10) {
      visFeil(melding, 'meldingFeil', 'Skriv noen ord om hva det gjelder, minst 10 tegn.');
      feil.push(melding);
    } else {
      visFeil(melding, 'meldingFeil', '');
    }

    if (feil.length) {
      feil[0].focus();
      return;
    }

    var na = new Date();
    var saksnummer = lagSaksnummer();
    var emneVerdi = (emneFelt && emneFelt.value) || 'Ordre og levering';

    kvittId.textContent = saksnummer;
    kvittEmne.textContent = emneVerdi;
    kvittNavn.textContent = navnVerdi;
    kvittEpost.textContent = epostVerdi;
    kvittTid.textContent = lagTid(na);

    if (ordreVerdi) {
      kvittOrdre.textContent = ordreVerdi;
      kvittOrdreRad.hidden = false;
    } else {
      kvittOrdre.textContent = '—';
      kvittOrdreRad.hidden = true;
    }

    var emneTekst = 'Henvendelse ' + saksnummer + ' — ' + emneVerdi;
    var kropp = [
      'Saksnummer: ' + saksnummer,
      'Emne: ' + emneVerdi,
      'Navn: ' + navnVerdi,
      'E-post: ' + epostVerdi
    ];
    if (ordreVerdi) kropp.push('Ordrenummer: ' + ordreVerdi);
    kropp.push('', meldingVerdi);

    if (kvittMail) {
      kvittMail.setAttribute('href', 'mailto:post@petterpia.no?subject=' +
        encodeURIComponent(emneTekst) + '&body=' + encodeURIComponent(kropp.join('\n')));
    }

    form.hidden = true;
    kvitt.hidden = false;
    if (kvittTittel) {
      kvittTittel.focus();
      kvitt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  if (nySak) {
    nySak.addEventListener('click', function () {
      kvitt.hidden = true;
      form.hidden = false;
      form.reset();
      visFeil(navn, 'navnFeil', '');
      visFeil(epost, 'epostFeil', '');
      visFeil(melding, 'meldingFeil', '');
      velgEmne(chipser[0]);
      navn.focus();
    });
  }
})();
