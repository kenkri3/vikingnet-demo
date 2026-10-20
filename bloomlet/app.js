/* Bloomlet — demoens ene interaksjon: interesseskjema i tre steg med kvittering.
   Alt skjer i nettleseren. Ingenting sendes, ingenting lagres. */
(function () {
  'use strict';

  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobilmeny ---------- */

  var meny = document.getElementById('meny');
  var veksle = document.querySelector('.nav-toggle');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!meny || !veksle) return;
    if (apen) {
      meny.removeAttribute('hidden');
      veksle.setAttribute('aria-expanded', 'true');
      veksle.setAttribute('aria-label', 'Lukk menyen');
    } else {
      if (smalSkjerm.matches) meny.setAttribute('hidden', '');
      veksle.setAttribute('aria-expanded', 'false');
      veksle.setAttribute('aria-label', 'Åpne menyen');
    }
  }

  function tilpassMeny() {
    if (!meny || !veksle) return;
    if (smalSkjerm.matches) {
      settMeny(false);
    } else {
      meny.removeAttribute('hidden');
      veksle.setAttribute('aria-expanded', 'false');
    }
  }

  if (veksle && meny) {
    veksle.addEventListener('click', function () {
      settMeny(meny.hasAttribute('hidden'));
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !meny.hasAttribute('hidden') && smalSkjerm.matches) {
        settMeny(false);
        veksle.focus();
      }
    });

    tilpassMeny();
    if (smalSkjerm.addEventListener) {
      smalSkjerm.addEventListener('change', tilpassMeny);
    }
  }

  /* ---------- Innhold som toner inn ---------- */

  var elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (elementer.length) {
    if (redusertBevegelse.matches || !('IntersectionObserver' in window)) {
      elementer.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var observator = new IntersectionObserver(
        function (oppforinger) {
          oppforinger.forEach(function (oppforing) {
            if (oppforing.isIntersecting) {
              oppforing.target.classList.add('is-visible');
              observator.unobserve(oppforing.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      elementer.forEach(function (el) {
        observator.observe(el);
      });
    }
  }

  /* ---------- Skjema ---------- */

  var skjema = document.getElementById('interesse-skjema');
  if (!skjema) return;

  var fallback = document.getElementById('skjema-fallback');
  var kvittering = document.getElementById('kvittering');
  var statusFelt = document.getElementById('skjema-status');
  var stegPunkter = Array.prototype.slice.call(document.querySelectorAll('[data-steg-punkt]'));
  var stegVisninger = Array.prototype.slice.call(skjema.querySelectorAll('[data-steg]'));
  var nesteKnapp = skjema.querySelector('[data-neste]');
  var tilbakeKnapp = skjema.querySelector('[data-tilbake]');
  var sendKnapp = skjema.querySelector('[data-send]');
  var sammendrag = document.getElementById('sammendrag');
  var feilRolle = document.getElementById('feil-rolle');
  var feilFelter = document.getElementById('feil-felter');
  var feltFornavn = document.getElementById('felt-fornavn');
  var feltEpost = document.getElementById('felt-epost');
  var feltMelding = document.getElementById('felt-melding');
  var rolleInputs = Array.prototype.slice.call(skjema.querySelectorAll('input[name="rolle"]'));
  var aktivtSteg = 1;
  var epostMonster = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (fallback) fallback.setAttribute('hidden', '');
  skjema.removeAttribute('hidden');

  function valgtRolle() {
    var valgt = rolleInputs.filter(function (input) {
      return input.checked;
    });
    return valgt.length ? valgt[0].value : '';
  }

  function skjulFeil(el) {
    if (el) {
      el.setAttribute('hidden', '');
      el.textContent = '';
    }
  }

  function visFeil(el, tekst) {
    if (!el) return;
    el.textContent = tekst;
    el.removeAttribute('hidden');
  }

  function settSteg(steg) {
    aktivtSteg = steg;

    stegVisninger.forEach(function (visning) {
      var nr = Number(visning.getAttribute('data-steg'));
      if (nr === steg) {
        visning.removeAttribute('hidden');
      } else {
        visning.setAttribute('hidden', '');
      }
    });

    stegPunkter.forEach(function (punkt) {
      var nr = Number(punkt.getAttribute('data-steg-punkt'));
      punkt.classList.toggle('is-aktiv', nr === steg);
    });

    if (nesteKnapp) nesteKnapp.toggleAttribute('hidden', steg === 3);
    if (sendKnapp) sendKnapp.toggleAttribute('hidden', steg !== 3);
    if (tilbakeKnapp) tilbakeKnapp.toggleAttribute('hidden', steg === 1);

    if (steg === 3) byggSammendrag();
  }

  function sjekkSteg1() {
    if (valgtRolle()) {
      skjulFeil(feilRolle);
      return true;
    }
    visFeil(feilRolle, 'Velg hvem du er, så går vi videre.');
    if (rolleInputs.length) rolleInputs[0].focus();
    return false;
  }

  function sjekkSteg2() {
    var mangler = [];

    if (!feltFornavn.value.trim()) {
      mangler.push(feltFornavn);
    }

    if (!epostMonster.test(feltEpost.value.trim())) {
      mangler.push(feltEpost);
    }

    [feltFornavn, feltEpost, feltMelding].forEach(function (felt) {
      if (!felt) return;
      if (mangler.indexOf(felt) !== -1) {
        felt.setAttribute('aria-invalid', 'true');
      } else {
        felt.removeAttribute('aria-invalid');
      }
    });

    if (!mangler.length) {
      skjulFeil(feilFelter);
      return true;
    }

    var tekst = 'Fyll ut fornavn og en gyldig e-postadresse.';
    visFeil(feilFelter, tekst);
    [feltFornavn, feltEpost].forEach(function (felt) {
      if (felt && mangler.indexOf(felt) !== -1) felt.setAttribute('aria-describedby', 'feil-felter');
    });
    mangler[0].focus();
    return false;
  }

  function lagRad(beholder, etikett, verdi) {
    if (!verdi) return;
    var rad = document.createElement('div');
    rad.className = 'sammendrag__rad';
    var lbl = document.createElement('span');
    lbl.className = 'sammendrag__lbl';
    lbl.textContent = etikett;
    var val = document.createElement('span');
    val.className = 'sammendrag__val';
    val.textContent = verdi;
    rad.appendChild(lbl);
    rad.appendChild(val);
    beholder.appendChild(rad);
  }

  function hentData() {
    var etternavn = skjema.querySelector('input[name="etternavn"]');
    var navn = [feltFornavn.value.trim(), etternavn ? etternavn.value.trim() : '']
      .filter(Boolean)
      .join(' ');
    return {
      rolle: valgtRolle(),
      navn: navn,
      epost: feltEpost.value.trim(),
      melding: feltMelding.value.trim(),
    };
  }

  function byggSammendrag() {
    if (!sammendrag) return;
    var data = hentData();
    sammendrag.textContent = '';
    lagRad(sammendrag, 'Rolle', data.rolle);
    lagRad(sammendrag, 'Navn', data.navn);
    lagRad(sammendrag, 'E-post', data.epost);
    lagRad(sammendrag, 'Melding', data.melding);
  }

  function kvitteringsTekst(data, referanse) {
    var linjer = [
      'Interesseforespørsel til Bloomlet',
      'Referanse: ' + referanse,
      'Rolle: ' + data.rolle,
      'Navn: ' + data.navn,
      'E-post: ' + data.epost,
    ];
    if (data.melding) linjer.push('Melding: ' + data.melding);
    linjer.push('');
    linjer.push('Sendt fra interesseskjemaet på nettsiden.');
    return linjer.join('\n');
  }

  function visKvittering() {
    var data = hentData();
    if (!data.rolle || !data.navn || !data.epost) return;

    var naa = new Date();
    var dato =
      naa.getFullYear() +
      String(naa.getMonth() + 1).padStart(2, '0') +
      String(naa.getDate()).padStart(2, '0');
    var bokstav = { Student: 'S', Universitet: 'U', Bedrift: 'B' }[data.rolle] || 'P';
    var referanse = 'BLM-' + dato + '-' + bokstav;
    var tekst = kvitteringsTekst(data, referanse);

    kvittering.textContent = '';

    var tittel = document.createElement('h4');
    tittel.textContent = 'Forespørselen er klar';
    tittel.setAttribute('tabindex', '-1');
    kvittering.appendChild(tittel);

    var ref = document.createElement('p');
    ref.className = 'kvittering__ref';
    ref.textContent = 'Referanse ' + referanse;
    kvittering.appendChild(ref);

    var liste = document.createElement('div');
    liste.className = 'kvittering__liste';
    [
      ['Rolle', data.rolle],
      ['Navn', data.navn],
      ['E-post', data.epost],
      ['Melding', data.melding],
    ].forEach(function (par) {
      if (!par[1]) return;
      var rad = document.createElement('div');
      rad.className = 'kvittering__rad';
      var lbl = document.createElement('span');
      lbl.className = 'kvittering__lbl';
      lbl.textContent = par[0];
      var val = document.createElement('span');
      val.className = 'kvittering__val';
      val.textContent = par[1];
      rad.appendChild(lbl);
      rad.appendChild(val);
      liste.appendChild(rad);
    });
    kvittering.appendChild(liste);

    var note = document.createElement('p');
    note.className = 'kvittering__note';
    note.textContent =
      'Skissen sender ikke inn noe selv. Send sammendraget med e-post, eller kopier det og lim det inn der du vil.';
    kvittering.appendChild(note);

    var knapper = document.createElement('div');
    knapper.className = 'kvittering__knapper';

    var epostKnapp = document.createElement('a');
    epostKnapp.className = 'btn';
    epostKnapp.href =
      'mailto:hello@bloomlet.com' +
      '?subject=' +
      encodeURIComponent('Interesseforespørsel — ' + data.rolle) +
      '&body=' +
      encodeURIComponent(tekst);
    epostKnapp.textContent = 'Send med e-post';
    knapper.appendChild(epostKnapp);

    var kopiKnapp = document.createElement('button');
    kopiKnapp.type = 'button';
    kopiKnapp.className = 'btn btn--ghost';
    kopiKnapp.textContent = 'Kopier sammendrag';
    kopiKnapp.addEventListener('click', function () {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        if (statusFelt) statusFelt.textContent = 'Kopiering er ikke tilgjengelig i denne nettleseren.';
        return;
      }
      navigator.clipboard.writeText(tekst).then(
        function () {
          kopiKnapp.textContent = 'Kopiert';
          if (statusFelt) statusFelt.textContent = 'Sammendraget er kopiert.';
        },
        function () {
          if (statusFelt) statusFelt.textContent = 'Kopiering ble avbrutt av nettleseren.';
        }
      );
    });
    knapper.appendChild(kopiKnapp);

    var nyKnapp = document.createElement('button');
    nyKnapp.type = 'button';
    nyKnapp.className = 'btn btn--ghost';
    nyKnapp.textContent = 'Start på nytt';
    nyKnapp.addEventListener('click', startPaNytt);
    knapper.appendChild(nyKnapp);

    kvittering.appendChild(knapper);

    skjema.setAttribute('hidden', '');
    kvittering.removeAttribute('hidden');
    if (statusFelt) statusFelt.textContent = '';
    tittel.focus();
  }

  function startPaNytt() {
    skjema.reset();
    rolleInputs.forEach(function (input) {
      input.removeAttribute('checked');
    });
    [feltFornavn, feltEpost, feltMelding].forEach(function (felt) {
      if (felt) {
        felt.removeAttribute('aria-invalid');
        felt.removeAttribute('aria-describedby');
      }
    });
    skjulFeil(feilRolle);
    skjulFeil(feilFelter);
    if (statusFelt) statusFelt.textContent = '';
    kvittering.setAttribute('hidden', '');
    kvittering.textContent = '';
    skjema.removeAttribute('hidden');
    settSteg(1);
    if (rolleInputs.length) rolleInputs[0].focus();
  }

  if (nesteKnapp) {
    nesteKnapp.addEventListener('click', function () {
      if (aktivtSteg === 1) {
        if (!sjekkSteg1()) return;
        settSteg(2);
        if (statusFelt) statusFelt.textContent = 'Steg 2 av 3: detaljer.';
        feltFornavn.focus();
        return;
      }

      if (aktivtSteg === 2) {
        if (!sjekkSteg2()) return;
        settSteg(3);
        if (statusFelt) statusFelt.textContent = 'Steg 3 av 3: se over og send.';
        if (sendKnapp) sendKnapp.focus();
      }
    });
  }

  if (tilbakeKnapp) {
    tilbakeKnapp.addEventListener('click', function () {
      if (aktivtSteg > 1) {
        settSteg(aktivtSteg - 1);
        if (statusFelt) statusFelt.textContent = 'Steg ' + (aktivtSteg) + ' av 3.';
        if (aktivtSteg === 1 && rolleInputs.length) rolleInputs[0].focus();
        if (aktivtSteg === 2) feltFornavn.focus();
      }
    });
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (aktivtSteg < 3) {
      if (nesteKnapp) nesteKnapp.click();
      return;
    }
    visKvittering();
  });

  /* Rolleknappene i «For hvem» og i indeksen fyller ut skjemaet. */
  Array.prototype.slice.call(document.querySelectorAll('[data-rolle-velg]')).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var rolle = knapp.getAttribute('data-rolle-velg');
      var truffet = null;
      rolleInputs.forEach(function (input) {
        if (input.value === rolle) {
          input.checked = true;
          truffet = input;
        }
      });

      kvittering.setAttribute('hidden', '');
      kvittering.textContent = '';
      skjema.removeAttribute('hidden');
      settSteg(1);
      skjulFeil(feilRolle);
      skjulFeil(feilFelter);

      if (!truffet) return;
      if (statusFelt) statusFelt.textContent = 'Rollen «' + rolle + '» er valgt. Fyll ut og trykk Neste.';

      if (smalSkjerm.matches) settMeny(false);

      var mal = document.getElementById('skjema');
      if (mal && mal.scrollIntoView) {
        mal.scrollIntoView({ behavior: redusertBevegelse.matches ? 'auto' : 'smooth', block: 'start' });
      }
      if (truffet.focus) truffet.focus({ preventScroll: true });
    });
  });

  /* Tastaturbrukere: skjul feilmeldinger når feltet rettes opp. */
  [feltFornavn, feltEpost].forEach(function (felt) {
    if (!felt) return;
    felt.addEventListener('input', function () {
      felt.removeAttribute('aria-invalid');
      if (feilFelter && !feilFelter.hasAttribute('hidden')) skjulFeil(feilFelter);
    });
  });

  settSteg(1);
})();
