/* Framtidsfylket — éin interaksjon, heilt client-side.
   Svarpanelet svarar med innhald frå framtidsfylket.no og tek imot ein
   førespurnad med kvittering. Ingenting blir sendt, ingenting blir lagra. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---- Mobilmeny ---- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      if (open) {
        nav.removeAttribute('data-open');
      } else {
        nav.setAttribute('data-open', 'true');
      }
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  /* ---- Årstal ---- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---- Svarpanelet ---- */
  var panel = document.querySelector('[data-panel]');
  if (!panel) return;

  var log = panel.querySelector('[data-log]');
  var chips = panel.querySelector('[data-chips]');
  var form = panel.querySelector('[data-ask-form]');
  var receipt = panel.querySelector('[data-receipt]');
  var receiptTxt = panel.querySelector('[data-receipt-txt]');
  var again = panel.querySelector('[data-again]');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Alle svar er henta frå framtidsfylket.no. Ingen tal er lagde til her. */
  var SVAR = {
    medlem: {
      svar: 'Som medlem blir du synleg for framtidas arbeidstakarar i Vestland, og du får tilgang til eit unikt nettverk. Medlemmer får òg rabatterte prisar på karrieremesser, konferansar og andre møteplassar — og tilgang til traineeprogrammet vårt.'
    },
    traineebedrift: {
      svar: 'Som traineebedrift tilsett du ein nyutdanna med driv og ny kompetanse. Framtidsfylket er anbefalt av bedrifter i Vestland gjennom 20 år. Traineen får mentor i bedrifta, ansvar frå dag éin og fire–fem samlingar i året.'
    },
    utlysing: {
      svar: 'Nye traineestillingar blir lyste ut frå og med desember, med oppstart i august. I 2026 søkte 700 personar på 25 traineestillingar.'
    },
    rekkjevidde: {
      svar: 'Kvar månad når Framtidsfylket ut til 500 000, og nyheitsbrevet har 5000 abonnentar. Målgruppa er jobbsøkarar, heimeflyttarar, tilflyttarar og folk som søker livsstilen i Vestland.'
    }
  };

  function boble(tekst, kven) {
    var p = document.createElement('p');
    p.className = 'msg msg--' + kven;
    p.textContent = tekst;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  function skriv() {
    var t = document.createElement('p');
    t.className = 'msg msg--typing';
    t.setAttribute('aria-label', 'Svarpanelet skriv');
    for (var i = 0; i < 3; i++) t.appendChild(document.createElement('span'));
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return t;
  }

  function svarPaa(knapp) {
    var nokkel = knapp.getAttribute('data-q');
    var data = SVAR[nokkel];
    var sporsmal = knapp.textContent.trim();
    knapp.parentNode.removeChild(knapp);
    if (!data) return;

    boble(sporsmal, 'user');

    var vent = skriv();
    var tid = reduced ? 0 : 420;
    window.setTimeout(function () {
      if (vent.parentNode) vent.parentNode.removeChild(vent);
      boble(data.svar, 'bot');
    }, tid);
  }

  if (chips) {
    chips.addEventListener('click', function (event) {
      var knapp = event.target.closest('.chip');
      if (knapp) svarPaa(knapp);
    });
  }

  /* ---- Førespurnad med kvittering ---- */
  if (form) {
    form.addEventListener('submit', function (event) {
      /* Utan JavaScript ville nettlesaren opna e-postprogrammet (mailto).
         Med JavaScript held vi oss på sida og viser kvittering i staden. */
      event.preventDefault();

      var data = new FormData(form);
      var namn = String(data.get('namn') || '').trim();
      var epost = String(data.get('epost') || '').trim();
      var emne = String(data.get('emne') || '').trim();

      if (!namn || !epost) return;

      if (receiptTxt) {
        receiptTxt.textContent = 'Takk, ' + namn + '. Førespurnaden om «' +
          (emne || 'rekruttering') + '» er registrert i denne skissa. Ingenting er sendt frå sida. ' +
          'I den ferdige løysinga hamnar han hos Framtidsfylket, og svaret kjem på ' + epost + '.';
      }

      form.hidden = true;
      if (receipt) {
        receipt.hidden = false;
        receipt.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  if (again) {
    again.addEventListener('click', function () {
      if (receipt) receipt.hidden = true;
      if (form) {
        form.hidden = false;
        form.reset();
        var forste = form.querySelector('input');
        if (forste) forste.focus();
      }
    });
  }
})();
