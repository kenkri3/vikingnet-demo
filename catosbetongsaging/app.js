(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var mobilmeny = document.getElementById('mobilmeny');

  if (menyKnapp && mobilmeny) {
    var settMeny = function (aapen) {
      menyKnapp.setAttribute('aria-expanded', aapen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', aapen ? 'Lukk meny' : 'Åpne meny');
      mobilmeny.hidden = !aapen;
    };

    menyKnapp.addEventListener('click', function () {
      settMeny(mobilmeny.hidden);
    });

    mobilmeny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !mobilmeny.hidden) {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && !mobilmeny.hidden) settMeny(false);
    });
  }

  /* ---------- Fremheving ved scroll ---------- */

  var synlige = document.querySelectorAll('.reveal');

  if (synlige.length) {
    if ('IntersectionObserver' in window) {
      var observator = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (oppforing.isIntersecting) {
            oppforing.target.classList.add('is-visible');
            observator.unobserve(oppforing.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      Array.prototype.forEach.call(synlige, function (element) {
        observator.observe(element);
      });
    } else {
      Array.prototype.forEach.call(synlige, function (element) {
        element.classList.add('is-visible');
      });
    }
  }

  /* ---------- Forespørsel med kvittering ---------- */

  var soknad = document.getElementById('foresporsel');

  if (soknad) {
    var paneler = Array.prototype.slice.call(soknad.querySelectorAll('[data-panel]'));
    var punkter = Array.prototype.slice.call(soknad.querySelectorAll('.steg__punkt'));
    var valg = Array.prototype.slice.call(soknad.querySelectorAll('.valg__knapp'));
    var feilTjeneste = soknad.querySelector('[data-feil="tjeneste"]');
    var feilDetaljer = soknad.querySelector('[data-feil="detaljer"]');
    var feltSted = document.getElementById('feltSted');
    var feltNavn = document.getElementById('feltNavn');
    var feltKontakt = document.getElementById('feltKontakt');
    var feltTekst = document.getElementById('feltTekst');
    var kopiTekst = '';

    var data = {
      tjeneste: '',
      sted: '',
      navn: '',
      kontakt: '',
      tekst: ''
    };

    var fokuser = function (element) {
      if (!element) return;
      try {
        element.focus({ preventScroll: true });
      } catch (feil) {
        element.focus();
      }
      var ramme = soknad.getBoundingClientRect();
      if (ramme.top < 60 || ramme.bottom > window.innerHeight) {
        soknad.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    };

    var visSteg = function (nummer) {
      paneler.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== String(nummer);
      });
      punkter.forEach(function (punkt) {
        punkt.classList.toggle('is-aktiv', punkt.getAttribute('data-steg') === String(nummer));
      });
      fokuser(paneler[nummer - 1]);
    };

    var lesFelt = function () {
      data.sted = feltSted.value.trim();
      data.navn = feltNavn.value.trim();
      data.kontakt = feltKontakt.value.trim();
      data.tekst = feltTekst.value.trim();
    };

    var merkFelt = function (felt, ugyldig) {
      if (ugyldig) {
        felt.setAttribute('aria-invalid', 'true');
      } else {
        felt.removeAttribute('aria-invalid');
      }
    };

    var validerTjeneste = function () {
      var ok = data.tjeneste !== '';
      feilTjeneste.hidden = ok;
      return ok;
    };

    var validerDetaljer = function () {
      lesFelt();
      var navnOk = data.navn.length > 1;
      var kontaktOk = data.kontakt.length > 2;
      var tekstOk = data.tekst.length > 4;

      merkFelt(feltNavn, !navnOk);
      merkFelt(feltKontakt, !kontaktOk);
      merkFelt(feltTekst, !tekstOk);

      var ok = navnOk && kontaktOk && tekstOk;
      feilDetaljer.hidden = ok;
      return ok;
    };

    var lagReferanse = function () {
      var naa = new Date();
      var to = function (tall) {
        return (tall < 10 ? '0' : '') + tall;
      };
      var tilfeldig = Math.floor(Math.random() * 900) + 100;
      return 'CB-' + String(naa.getFullYear()).slice(2) + to(naa.getMonth() + 1) + to(naa.getDate()) + '-' + tilfeldig;
    };

    var sammendrag = function () {
      return [
        'Tjeneste: ' + data.tjeneste,
        'Sted: ' + (data.sted || 'Ikke oppgitt'),
        'Navn: ' + data.navn,
        'Kontakt: ' + data.kontakt,
        'Beskrivelse: ' + data.tekst
      ].join('\n');
    };

    var lagKvittering = function () {
      var referanse = lagReferanse();
      var kropp = sammendrag() + '\n\nReferanse: ' + referanse;

      document.getElementById('kvReferanse').textContent = referanse;
      document.getElementById('kvTjeneste').textContent = data.tjeneste;
      document.getElementById('kvSted').textContent = data.sted || 'Ikke oppgitt';
      document.getElementById('kvNavn').textContent = data.navn;
      document.getElementById('kvKontakt').textContent = data.kontakt;
      document.getElementById('kvTekst').textContent = data.tekst;

      document.getElementById('kvSend').href =
        'mailto:post@catosbetongsaging.no' +
        '?subject=' + encodeURIComponent('Forespørsel: ' + data.tjeneste) +
        '&body=' + encodeURIComponent(kropp);

      kopiTekst = 'Forespørsel til Catos Betongsaging AS\n' + kropp;
    };

    valg.forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        data.tjeneste = knapp.getAttribute('data-verdi');
        valg.forEach(function (annen) {
          annen.setAttribute('aria-checked', annen === knapp ? 'true' : 'false');
        });
        feilTjeneste.hidden = true;
      });
    });

    Array.prototype.forEach.call(soknad.querySelectorAll('[data-neste]'), function (knapp) {
      knapp.addEventListener('click', function () {
        var fraSteg = knapp.getAttribute('data-neste');

        if (fraSteg === '1' && validerTjeneste()) {
          visSteg(2);
        } else if (fraSteg === '2' && validerDetaljer()) {
          lagKvittering();
          visSteg(3);
        }
      });
    });

    Array.prototype.forEach.call(soknad.querySelectorAll('[data-tilbake]'), function (knapp) {
      knapp.addEventListener('click', function () {
        visSteg(1);
      });
    });

    [feltSted, feltNavn, feltKontakt, feltTekst].forEach(function (felt) {
      felt.addEventListener('input', function () {
        if (feltTekst === felt) {
          feilDetaljer.hidden = true;
        }
        if (felt.getAttribute('aria-invalid')) merkFelt(felt, false);
      });

      /* Enter i et tekstfelt skal ta brukeren videre, ikke sende noe. */
      if (felt !== feltTekst) {
        felt.addEventListener('keydown', function (hendelse) {
          if (hendelse.key === 'Enter') {
            hendelse.preventDefault();
            soknad.querySelector('[data-neste="2"]').click();
          }
        });
      }
    });

    document.getElementById('kvKopier').addEventListener('click', function () {
      var knapp = this;
      var opprinnelig = knapp.textContent;
      var kvitter = function () {
        knapp.textContent = 'Kopiert';
        window.setTimeout(function () {
          knapp.textContent = opprinnelig;
        }, 2400);
      };
      var reserve = function () {
        var hjelp = document.createElement('textarea');
        hjelp.value = kopiTekst;
        hjelp.setAttribute('readonly', '');
        hjelp.style.position = 'fixed';
        hjelp.style.left = '-9999px';
        document.body.appendChild(hjelp);
        hjelp.select();
        try {
          document.execCommand('copy');
          kvitter();
        } catch (feil) {
          knapp.textContent = 'Kunne ikke kopiere';
        }
        document.body.removeChild(hjelp);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(kopiTekst).then(kvitter, reserve);
      } else {
        reserve();
      }
    });

    document.getElementById('kvNy').addEventListener('click', function () {
      data = { tjeneste: '', sted: '', navn: '', kontakt: '', tekst: '' };
      valg.forEach(function (knapp) {
        knapp.setAttribute('aria-checked', 'false');
      });
      [feltSted, feltNavn, feltKontakt, feltTekst].forEach(function (felt) {
        felt.value = '';
        merkFelt(felt, false);
      });
      feilTjeneste.hidden = true;
      feilDetaljer.hidden = true;
      visSteg(1);
    });
  }
})();
