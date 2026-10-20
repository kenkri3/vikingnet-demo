/*
  Flis Prosjekt AS — interaksjon.
  Alt kjører i nettleseren. Ingenting sendes, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ---- Mobilmeny ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var smal = window.matchMedia('(max-width: 900px)');

    function settMeny(apen) {
      if (apen) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
      toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    }

    if (smal.matches) {
      settMeny(false);
    }

    toggle.addEventListener('click', function () {
      settMeny(nav.hasAttribute('hidden'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && smal.matches) {
        settMeny(false);
      }
    });

    if (smal.addEventListener) {
      smal.addEventListener('change', function (e) {
        if (!e.matches) {
          nav.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ---- Rolig innkomst av innhold ---- */
  var los = [].slice.call(document.querySelectorAll('.reveal'));

  if (los.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (o) {
          if (o.isIntersecting) {
            o.target.classList.add('is-visible');
            io.unobserve(o.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });

      los.forEach(function (el) {
        io.observe(el);
      });
    } else {
      los.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ---- Forespørsel: tre steg, sammendrag og kvittering ---- */
  var form = document.getElementById('fp-form');
  if (!form) {
    return;
  }

  var kvitt = document.getElementById('fp-kvitt');
  var steg = [].slice.call(form.querySelectorAll('.fstep'));
  var punkter = [].slice.call(document.querySelectorAll('#fp-prog .prog__i'));
  var live = document.getElementById('fp-live');
  var sum = document.getElementById('fp-sum');
  var refEl = document.getElementById('fp-ref');
  var mail = document.getElementById('fp-mail');
  var nullstill = document.getElementById('fp-reset');
  var SISTE = 3;

  function felt(sel) {
    return form.querySelector(sel);
  }

  function feilmelding(nokkel, tekst) {
    var el = form.querySelector('[data-err="' + nokkel + '"]');
    if (!el) {
      return;
    }
    if (tekst) {
      el.textContent = tekst;
      el.hidden = false;
    } else {
      el.hidden = true;
      el.textContent = '';
    }
  }

  function fokuser(sel) {
    var el = felt(sel);
    if (el) {
      el.focus({ preventScroll: false });
    }
  }

  function gyldig(n) {
    var ok = true;

    if (n === 1) {
      var valgt = form.querySelector('input[name="type"]:checked');
      if (!valgt) {
        feilmelding('type', 'Velg hva forespørselen gjelder.');
        ok = false;
      } else {
        feilmelding('type', '');
      }
    }

    if (n === 2) {
      var tekst = felt('#fp-beskriv').value.trim();
      if (tekst.length < 10) {
        feilmelding('beskrivelse', 'Skriv noen ord om hva som skal gjøres, minst 10 tegn.');
        ok = false;
      } else {
        feilmelding('beskrivelse', '');
      }
    }

    if (n === 3) {
      var navn = felt('#fp-navn').value.trim();
      if (navn.length < 2) {
        feilmelding('navn', 'Skriv navnet vi skal svare til.');
        ok = false;
      } else {
        feilmelding('navn', '');
      }

      var epost = felt('#fp-epost').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(epost)) {
        feilmelding('epost', 'Skriv en e-postadresse vi kan svare på.');
        ok = false;
      } else {
        feilmelding('epost', '');
      }
    }

    return ok;
  }

  function forsteFeil(n) {
    if (n === 1) {
      fokuser('input[name="type"]');
    } else if (n === 2) {
      fokuser('#fp-beskriv');
    } else {
      fokuser(felt('#fp-navn').value.trim().length < 2 ? '#fp-navn' : '#fp-epost');
    }
  }

  function vis(n) {
    steg.forEach(function (s) {
      s.hidden = Number(s.getAttribute('data-step')) !== n;
    });

    punkter.forEach(function (p) {
      var i = Number(p.getAttribute('data-p'));
      p.classList.toggle('is-active', i === n);
      p.classList.toggle('is-done', i < n);
      if (i === n) {
        p.setAttribute('aria-current', 'step');
      } else {
        p.removeAttribute('aria-current');
      }
    });

    if (live) {
      live.textContent = 'Steg ' + n + ' av ' + SISTE;
    }

    var tittel = form.querySelector('.fstep[data-step="' + n + '"] .fstep__h');
    if (tittel) {
      tittel.setAttribute('tabindex', '-1');
      tittel.focus({ preventScroll: true });
    }
  }

  form.addEventListener('click', function (e) {
    var fram = e.target.closest('[data-next]');
    if (fram) {
      var til = Number(fram.getAttribute('data-next'));
      if (!gyldig(til - 1)) {
        forsteFeil(til - 1);
        return;
      }
      vis(til);
      return;
    }

    var tilbake = e.target.closest('[data-back]');
    if (tilbake) {
      vis(Number(tilbake.getAttribute('data-back')));
    }
  });

  function sammendrag() {
    var type = form.querySelector('input[name="type"]:checked');
    var rader = [
      ['Tjeneste', type ? type.value : ''],
      ['Beskrivelse', felt('#fp-beskriv').value.trim()],
      ['Areal', felt('#fp-areal').value.trim() ? felt('#fp-areal').value.trim() + ' m²' : ''],
      ['Sted', felt('#fp-sted').value.trim()],
      ['Ønsket oppstart', felt('#fp-oppstart').value],
      ['Navn', felt('#fp-navn').value.trim()],
      ['Firma eller sameie', felt('#fp-firma').value.trim()],
      ['E-post', felt('#fp-epost').value.trim()],
      ['Telefon', felt('#fp-tel').value.trim()]
    ].filter(function (rad) {
      return rad[1] !== '';
    });

    var d = new Date();
    function to(x) {
      return String(x).length < 2 ? '0' + x : String(x);
    }
    var ref = 'FP-' + d.getFullYear() + to(d.getMonth() + 1) + to(d.getDate()) + '-' + to(d.getHours()) + to(d.getMinutes());

    refEl.textContent = ref;

    sum.textContent = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      sum.appendChild(dt);
      sum.appendChild(dd);
    });

    var emne = 'Forespørsel ' + ref + ' – ' + (type ? type.value : 'flisprosjekt');
    var kropp = rader.map(function (rad) {
      return rad[0] + ': ' + rad[1];
    }).join('\n') + '\n\nReferanse: ' + ref;

    mail.href = 'mailto:post@flisprosjekt.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

    form.hidden = true;
    kvitt.hidden = false;
    kvitt.focus();

    if (live) {
      live.textContent = 'Sammendrag klart. Referanse ' + ref + '.';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var forste = 0;
    [1, 2, 3].forEach(function (n) {
      if (!gyldig(n) && !forste) {
        forste = n;
      }
    });

    if (forste) {
      vis(forste);
      forsteFeil(forste);
      return;
    }

    sammendrag();
  });

  if (nullstill) {
    nullstill.addEventListener('click', function () {
      form.reset();
      feilmelding('type', '');
      feilmelding('beskrivelse', '');
      feilmelding('navn', '');
      feilmelding('epost', '');
      kvitt.hidden = true;
      form.hidden = false;
      vis(1);
      fokuser('input[name="type"]');
    });
  }
}());
