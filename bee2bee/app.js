/*
  Bee2Bee Talent Solutions — interaksjon.
  Alt skjer i nettleseren: ingen data sendes, ingenting lagres.
  Henvendelsen settes sammen steg for steg, og brukeren sender den selv
  med e-post fra kvitteringen.
*/

(function () {
  'use strict';

  /* ============ 1. Mobilmeny ============ */
  (function () {
    var knapp = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    if (!knapp || !nav) return;

    function sett(open) {
      nav.hidden = !open;
      knapp.setAttribute('aria-expanded', open ? 'true' : 'false');
      knapp.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    }

    knapp.addEventListener('click', function () {
      sett(nav.hidden);
    });

    /* Uten JavaScript står menyen åpen i markupen. På mobil lukker vi den
       med én gang scriptet kjører, så den ikke dekker forsiden. */
    if (window.innerWidth <= 900) sett(false);

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) sett(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !nav.hidden) {
        sett(false);
        knapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        if (nav.hidden) {
          nav.hidden = false;
          knapp.setAttribute('aria-expanded', 'false');
        }
      } else if (!nav.hidden) {
        sett(false);
      }
    });
  })();

  /* ============ 3. Book en samtale ============ */
  (function () {
    var form = document.getElementById('bookForm');
    if (!form) return;

    var paneler = Array.prototype.slice.call(document.querySelectorAll('.steg-panel'));
    var kvittering = document.getElementById('kvittering');
    var oppsummering = document.getElementById('oppsummering');
    var sendLenke = document.getElementById('sendEpost');
    var live = document.getElementById('live');
    var stegviser = document.getElementById('stegviser');
    var tjenesteChips = Array.prototype.slice.call(document.querySelectorAll('[data-tjeneste]'));
    var tidChips = Array.prototype.slice.call(document.querySelectorAll('[data-tid]'));
    var datoFelt = document.getElementById('dato');
    var steg = 1;

    var state = {
      tjeneste: '',
      dato: '',
      datoTekst: '',
      tid: '',
      navn: '',
      epost: '',
      telefon: '',
      bedrift: '',
      notat: ''
    };

    var STEGNAVN = { 1: 'Hva gjelder henvendelsen', 2: 'Når passer det', 3: 'Kontaktinfo' };

    function si(melding) {
      if (!live) return;
      live.textContent = '';
      window.setTimeout(function () {
        live.textContent = melding;
      }, 60);
    }

    /* ---- Dager: de neste ti hverdagene ---- */
    function byggDager() {
      if (!datoFelt) return;
      var i, d;
      var fmt = new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
      var iDag = new Date();
      var lagt = 0;
      for (i = 1; lagt < 10 && i < 40; i++) {
        d = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate() + i);
        var dagNr = d.getDay();
        if (dagNr === 0 || dagNr === 6) continue;
        var opt = document.createElement('option');
        opt.value = d.toISOString().slice(0, 10);
        opt.textContent = fmt.format(d).replace(/\.$/, '');
        datoFelt.appendChild(opt);
        lagt++;
      }
    }

    /* ---- Chips ---- */
    function settPressed(liste, aktiv) {
      liste.forEach(function (b) {
        b.setAttribute('aria-pressed', b === aktiv ? 'true' : 'false');
      });
    }

    function velgTjeneste(verdi) {
      state.tjeneste = verdi;
      tjenesteChips.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-tjeneste') === verdi ? 'true' : 'false');
      });
      skjulFeil(document.getElementById('feil-tjeneste'));
    }

    tjenesteChips.forEach(function (b) {
      b.addEventListener('click', function () {
        var verdi = b.getAttribute('data-tjeneste');
        var fraHero = !b.closest('#bookForm');
        velgTjeneste(verdi);
        if (fraHero) {
          visSteg(1);
          gaaTilBook();
          si('Tjeneste valgt: ' + verdi + '. Steg 1 av 3.');
        } else {
          si('Tjeneste valgt: ' + verdi + '.');
        }
      });
    });

    tidChips.forEach(function (b) {
      b.addEventListener('click', function () {
        state.tid = b.getAttribute('data-tid');
        settPressed(tidChips, b);
        skjulFeil(document.getElementById('feil-tid'));
        si('Tid på dagen: ' + state.tid + '.');
      });
    });

    /* ---- Steg ---- */
    function visSteg(n) {
      steg = n;
      paneler.forEach(function (p) {
        p.hidden = Number(p.getAttribute('data-panel')) !== n;
      });
      if (kvittering) kvittering.hidden = true;
      if (form) form.hidden = false;
      if (stegviser) {
        Array.prototype.forEach.call(stegviser.children, function (li) {
          var nr = Number(li.getAttribute('data-steg'));
          li.classList.toggle('er-ferdig', nr < n);
          if (nr === n) {
            li.setAttribute('aria-current', 'step');
          } else {
            li.removeAttribute('aria-current');
          }
        });
      }
      si('Steg ' + n + ' av 3: ' + STEGNAVN[n] + '.');
    }

    function gaaTilBook() {
      var seksjon = document.getElementById('book');
      if (!seksjon) return;
      var panel = paneler[steg - 1];
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus({ preventScroll: true });
        panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }

    /* ---- Feil ---- */
    function visFeil(el, melding) {
      if (!el) return;
      el.hidden = false;
      if (melding) el.textContent = melding;
      var gruppe = el.closest('.felt');
      if (gruppe) gruppe.classList.add('har-feil');
    }

    function skjulFeil(el) {
      if (!el) return;
      el.hidden = true;
      var gruppe = el.closest('.felt');
      if (gruppe) gruppe.classList.remove('har-feil');
    }

    function gyldigEpost(verdi) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
    }

    /* ---- Validering per steg ---- */
    function valider(n) {
      if (n === 1) {
        if (!state.tjeneste) {
          visFeil(document.getElementById('feil-tjeneste'));
          si('Du må velge en tjeneste før du går videre.');
          return false;
        }
        skjulFeil(document.getElementById('feil-tjeneste'));
        return true;
      }
      if (n === 2) {
        if (datoFelt) state.dato = datoFelt.value;
        if (!state.dato || !state.tid) {
          visFeil(document.getElementById('feil-tid'));
          si('Du må velge en dag og omtrent når på dagen.');
          return false;
        }
        skjulFeil(document.getElementById('feil-tid'));
        return true;
      }
      if (n === 3) {
        var navn = document.getElementById('navn');
        var epost = document.getElementById('epost');
        state.navn = navn ? navn.value.trim() : '';
        state.epost = epost ? epost.value.trim() : '';
        state.telefon = (document.getElementById('telefon') || {}).value || '';
        state.bedrift = (document.getElementById('bedrift') || {}).value || '';
        state.notat = (document.getElementById('notat') || {}).value || '';

        var ok = true;
        if (navn) navn.setAttribute('aria-invalid', state.navn ? 'false' : 'true');
        if (epost) epost.setAttribute('aria-invalid', gyldigEpost(state.epost) ? 'false' : 'true');
        if (!state.navn || !gyldigEpost(state.epost)) ok = false;

        if (!ok) {
          var melding = !state.navn
            ? 'Fyll inn navnet ditt.'
            : 'Fyll inn en gyldig e-postadresse, for eksempel navn@virksomhet.no.';
          visFeil(document.getElementById('feil-kontakt'), melding);
          si(melding);
          return false;
        }
        skjulFeil(document.getElementById('feil-kontakt'));
        return true;
      }
      return true;
    }

    /* ---- Oppsummering ---- */
    function datoTekst() {
      if (!state.dato) return '';
      var d = new Date(state.dato + 'T12:00:00');
      if (isNaN(d.getTime())) return state.dato;
      return new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }

    function rad(term, verdi) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = verdi;
      var div = document.createElement('div');
      div.className = 'kvittering__rad';
      div.appendChild(dt);
      div.appendChild(dd);
      return div;
    }

    function brevtekst() {
      var linjer = [
        'Hei Bee2Bee,',
        '',
        'Jeg vil gjerne ta en samtale. Her er henvendelsen:',
        '',
        'Tjeneste: ' + state.tjeneste,
        'Foreslått dag: ' + datoTekst(),
        'Tid på dagen: ' + state.tid
      ];
      if (state.bedrift.trim()) linjer.push('Virksomhet: ' + state.bedrift.trim());
      linjer.push('Navn: ' + state.navn);
      linjer.push('E-post: ' + state.epost);
      if (state.telefon.trim()) linjer.push('Telefon: ' + state.telefon.trim());
      if (state.notat.trim()) {
        linjer.push('');
        linjer.push('Om behovet:');
        linjer.push(state.notat.trim());
      }
      linjer.push('');
      linjer.push('Hilsen');
      linjer.push(state.navn);
      return linjer.join('\n');
    }

    function visKvittering() {
      if (!oppsummering) return;
      oppsummering.innerHTML = '';
      oppsummering.appendChild(rad('Tjeneste', state.tjeneste));
      oppsummering.appendChild(rad('Dag', datoTekst()));
      oppsummering.appendChild(rad('Tid', state.tid));
      oppsummering.appendChild(rad('Navn', state.navn));
      oppsummering.appendChild(rad('E-post', state.epost));
      if (state.telefon.trim()) oppsummering.appendChild(rad('Telefon', state.telefon.trim()));
      if (state.bedrift.trim()) oppsummering.appendChild(rad('Virksomhet', state.bedrift.trim()));
      if (state.notat.trim()) oppsummering.appendChild(rad('Om behovet', state.notat.trim()));

      if (sendLenke) {
        var emne = 'Samtale: ' + state.tjeneste + ' — ' + (state.bedrift.trim() || state.navn);
        sendLenke.href =
          'mailto:kontakt@bee2bee.no' +
          '?subject=' + encodeURIComponent(emne) +
          '&body=' + encodeURIComponent(brevtekst());
      }

      paneler.forEach(function (p) {
        p.hidden = true;
      });
      form.hidden = true;
      kvittering.hidden = false;
      si('Oppsummeringen er klar. Ingenting er sendt ennå.');

      var overskrift = kvittering.querySelector('h3');
      if (overskrift) {
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus({ preventScroll: true });
      }
      kvittering.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    /* ---- Knapper ---- */
    form.addEventListener('click', function (e) {
      var neste = e.target.closest('[data-neste]');
      var forrige = e.target.closest('[data-forrige]');
      var oppsummer = e.target.closest('[data-oppsummer]');

      if (neste) {
        if (!valider(steg)) return;
        visSteg(Number(neste.getAttribute('data-neste')));
        var p = paneler[steg - 1];
        if (p) {
          p.setAttribute('tabindex', '-1');
          p.focus({ preventScroll: true });
        }
      }

      if (forrige) {
        visSteg(Number(forrige.getAttribute('data-forrige')));
        var q = paneler[steg - 1];
        if (q) {
          q.setAttribute('tabindex', '-1');
          q.focus({ preventScroll: true });
        }
      }

      if (oppsummer) {
        if (!valider(3)) return;
        visKvittering();
      }
    });

    /* Skjemaet skal ikke sendes noe sted — vi holder alt lokalt. */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (steg === 3 && valider(3)) visKvittering();
    });

    if (datoFelt) {
      datoFelt.addEventListener('change', function () {
        state.dato = datoFelt.value;
        var valgt = datoFelt.options[datoFelt.selectedIndex];
        state.datoTekst = valgt ? valgt.textContent : '';
        if (state.dato) skjulFeil(document.getElementById('feil-tid'));
      });
    }

    var nytt = document.querySelector('[data-nytt]');
    if (nytt) {
      nytt.addEventListener('click', function () {
        form.reset();
        state = { tjeneste: '', dato: '', datoTekst: '', tid: '', navn: '', epost: '', telefon: '', bedrift: '', notat: '' };
        tjenesteChips.forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        tidChips.forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        ['navn', 'epost'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.removeAttribute('aria-invalid');
        });
        ['feil-tjeneste', 'feil-tid', 'feil-kontakt'].forEach(function (id) {
          skjulFeil(document.getElementById(id));
        });
        visSteg(1);
        gaaTilBook();
        si('Skjemaet er tømt. Steg 1 av 3.');
      });
    }

    byggDager();
  })();
})();
