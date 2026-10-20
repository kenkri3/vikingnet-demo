/*
  Bye Berg Elektro AS — interaksjon.
  To ting: mobilmenyen, og henvendelsen i fire steg med kvittering.
  Alt skjer i nettleseren. Ingenting sendes noe sted herfra; kvitteringen
  bygges lokalt, og e-postlenken åpner brukerens egen e-postklient.
*/
(function () {
  'use strict';

  /* ---------- Årstall i footer ---------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------- Mobilmeny ---------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  if (menyKnapp && meny) {
    var settMeny = function (apen) {
      meny.hidden = !apen;
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    };

    menyKnapp.addEventListener('click', function () {
      settMeny(meny.hidden);
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !meny.hidden) {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && !meny.hidden) settMeny(false);
    });
  }

  /* ---------- Henvendelsen ---------- */

  var skjema = document.getElementById('henvendelse-skjema');
  if (!skjema) return;

  var kort = document.getElementById('henvendelse-kort');
  var kvittering = document.getElementById('kvittering');
  var visninger = Array.prototype.slice.call(skjema.querySelectorAll('.visning'));
  var stegbar = Array.prototype.slice.call(document.querySelectorAll('#stegbar li'));
  var stegstatus = document.getElementById('stegstatus');
  var steg = 1;

  var FELTER = ['tema', 'type', 'adresse', 'postnummer', 'beskrivelse', 'navn', 'telefon', 'epost', 'kontaktform'];

  /* Koble hver feilmelding til feltet den gjelder, for skjermlesere. */
  Array.prototype.forEach.call(skjema.querySelectorAll('[data-feil-for]'), function (melding) {
    var navn = melding.getAttribute('data-feil-for');
    var id = 'feil-' + navn;
    melding.id = id;
    Array.prototype.forEach.call(skjema.querySelectorAll('[name="' + navn + '"]'), function (felt) {
      felt.setAttribute('aria-describedby', id);
    });
  });

  function lesData() {
    var data = {};
    FELTER.forEach(function (navn) {
      var felt = skjema.elements[navn];
      var verdi = '';
      if (felt) {
        if (felt.length && !felt.tagName) {
          verdi = felt.value || '';
        } else if (typeof felt.value === 'string') {
          verdi = felt.value;
        }
      }
      data[navn] = verdi.trim();
    });
    return data;
  }

  function visFeil(navn, melding) {
    var meldinger = skjema.querySelectorAll('[data-feil-for="' + navn + '"]');
    Array.prototype.forEach.call(meldinger, function (el) {
      el.textContent = melding;
    });
    Array.prototype.forEach.call(skjema.querySelectorAll('[name="' + navn + '"]'), function (felt) {
      if (melding) felt.setAttribute('aria-invalid', 'true');
      else felt.removeAttribute('aria-invalid');
    });
  }

  var REGLER = {
    1: {
      tema: function (v) {
        return v ? '' : 'Velg hva henvendelsen gjelder.';
      }
    },
    2: {
      type: function (v) {
        return v ? '' : 'Velg om det er bolig, næring eller anlegg.';
      },
      adresse: function (v) {
        return v.length >= 3 ? '' : 'Skriv gateadressen der jobben skal gjøres.';
      },
      postnummer: function (v) {
        return /^\d{4}$/.test(v) ? '' : 'Postnummer skal være fire siffer.';
      }
    },
    3: {
      navn: function (v) {
        return v.length >= 2 ? '' : 'Skriv navnet ditt.';
      },
      telefon: function (v) {
        return v.replace(/\D/g, '').length >= 8 ? '' : 'Skriv et telefonnummer vi kan nå deg på.';
      },
      epost: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Skriv en gyldig e-postadresse.';
      },
      kontaktform: function (v) {
        return v ? '' : 'Velg hvordan vi skal svare.';
      }
    }
  };

  function sjekk(stegnummer) {
    var data = lesData();
    var regler = REGLER[stegnummer] || {};
    var forsteFeil = null;

    Object.keys(regler).forEach(function (navn) {
      var melding = regler[navn](data[navn]);
      visFeil(navn, melding);
      if (melding && !forsteFeil) forsteFeil = navn;
    });

    if (!forsteFeil) return true;

    var felt = skjema.querySelector('[name="' + forsteFeil + '"]');
    if (felt) {
      felt.focus();
      if (felt.type === 'radio') {
        var flis = felt.closest('.flis');
        if (flis && flis.scrollIntoView) flis.scrollIntoView({ block: 'nearest' });
      }
    }
    return false;
  }

  function fokuserSteg() {
    var synlig = skjema.querySelector('.visning:not([hidden])');
    if (!synlig) return;
    var forste = synlig.querySelector('input, select, textarea, button');
    if (forste) {
      forste.focus({ preventScroll: true });
    }
  }

  function gåTil(n, fokuser) {
    steg = n;
    visninger.forEach(function (visning) {
      visning.hidden = Number(visning.getAttribute('data-visning')) !== n;
    });
    stegbar.forEach(function (punkt) {
      var nummer = Number(punkt.getAttribute('data-steg'));
      punkt.classList.toggle('er-aktiv', nummer === n);
      punkt.classList.toggle('er-ferdig', nummer < n);
      if (nummer === n) punkt.setAttribute('aria-current', 'step');
      else punkt.removeAttribute('aria-current');
    });
    if (stegstatus) {
      stegstatus.textContent = n === 4 ? 'Steg 4 av 4. Se over og registrer.' : 'Steg ' + n + ' av 4.';
    }
    if (n === 4) lagOppsummering();
    if (fokuser) fokuserSteg();
  }

  function byggListe(container, rader) {
    container.innerHTML = '';
    rader.forEach(function (rad) {
      if (!rad[1]) return;
      var gruppe = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      gruppe.appendChild(dt);
      gruppe.appendChild(dd);
      container.appendChild(gruppe);
    });
  }

  function rader(data) {
    var adresse = data.adresse;
    if (data.postnummer) adresse = adresse + ', ' + data.postnummer;
    return [
      ['Tema', data.tema],
      ['Type bygg', data.type],
      ['Adresse', adresse],
      ['Om jobben', data.beskrivelse || 'Ikke angitt'],
      ['Navn', data.navn],
      ['Telefon', data.telefon],
      ['E-post', data.epost],
      ['Svar på', data.kontaktform]
    ];
  }

  function lagOppsummering() {
    byggListe(document.getElementById('oppsummering'), rader(lesData()));
  }

  function lagReferanse() {
    var arstall = new Date().getFullYear();
    var nummer = String(Math.floor(1000 + Math.random() * 9000));
    return 'BBE-' + arstall + '-' + nummer;
  }

  function lagEpostlenke(data, referanse) {
    var linjer = rader(data).filter(function (rad) {
      return rad[1];
    }).map(function (rad) {
      return rad[0] + ': ' + rad[1];
    });
    var emne = 'Henvendelse ' + referanse + ' — ' + data.tema;
    var kropp = 'Henvendelse ' + referanse + '\n\n' + linjer.join('\n') + '\n\nSendt fra nettsiden.';
    return 'mailto:post@byebergelektro.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
  }

  function registrer() {
    var data = lesData();
    var referanse = lagReferanse();

    document.getElementById('kvittering-ref').textContent = referanse;
    document.getElementById('kvittering-tid').textContent =
      'Registrert ' + new Intl.DateTimeFormat('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date());

    byggListe(document.getElementById('kvittering-data'), rader(data));

    var lenke = document.getElementById('epost-lenke');
    if (lenke) lenke.href = lagEpostlenke(data, referanse);

    skjema.hidden = true;
    kvittering.hidden = false;

    stegbar.forEach(function (punkt) {
      punkt.classList.remove('er-aktiv');
      punkt.classList.add('er-ferdig');
      punkt.removeAttribute('aria-current');
    });

    if (stegstatus) stegstatus.textContent = 'Henvendelsen er registrert med referanse ' + referanse + '.';

    kvittering.setAttribute('tabindex', '-1');
    kvittering.focus({ preventScroll: true });
    if (kvittering.scrollIntoView) {
      var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      kort.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
    }
  }

  skjema.addEventListener('click', function (hendelse) {
    var neste = hendelse.target.closest('[data-neste]');
    if (neste) {
      var til = Number(neste.getAttribute('data-neste'));
      if (sjekk(til - 1)) gåTil(til, true);
      return;
    }
    var tilbake = hendelse.target.closest('[data-tilbake]');
    if (tilbake) gåTil(Number(tilbake.getAttribute('data-tilbake')), true);
  });

  skjema.addEventListener('input', function (hendelse) {
    var navn = hendelse.target.name;
    if (navn) visFeil(navn, '');
  });

  skjema.addEventListener('change', function (hendelse) {
    var navn = hendelse.target.name;
    if (navn) visFeil(navn, '');
  });

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    if (steg < 4) {
      if (sjekk(steg)) gåTil(steg + 1, true);
      return;
    }

    var stegene = [1, 2, 3];
    for (var i = 0; i < stegene.length; i += 1) {
      if (!sjekk(stegene[i])) {
        gåTil(stegene[i], true);
        return;
      }
    }
    registrer();
  });

  var nyHenvendelse = document.getElementById('nyHenvendelse');
  if (nyHenvendelse) {
    nyHenvendelse.addEventListener('click', function () {
      skjema.reset();
      FELTER.forEach(function (navn) {
        visFeil(navn, '');
      });
      kvittering.hidden = true;
      skjema.hidden = false;
      gåTil(1, false);
      if (kort.scrollIntoView) {
        var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        kort.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
      }
      fokuserSteg();
    });
  }
})();
