/* SLA — demoens ene interaksjon: tre steg frem til en ferdig kvittering.
   Alt skjer i nettleseren. Ingenting sendes til noen server. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Mobilmeny
     --------------------------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    /* På mobil skal menyen starte lukket — base.css viser den ellers som panel */
    if (window.innerWidth <= 900) {
      nav.hidden = true;
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.hidden = open;
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------------------
     Innlasting: seksjoner toner inn når de kommer i bildet
     --------------------------------------------------------------------- */
  var los = document.querySelectorAll('.reveal');
  if (los.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (o) {
          if (o.isIntersecting) {
            o.target.classList.add('is-visible');
            io.unobserve(o.target);
          }
        });
      }, { threshold: 0.08 });
      los.forEach(function (node) { io.observe(node); });
    } else {
      los.forEach(function (node) { node.classList.add('is-visible'); });
    }
  }

  /* ---------------------------------------------------------------------
     Henvendelsen
     --------------------------------------------------------------------- */
  var form = document.querySelector('[data-henv]');
  if (!form) return;

  var KONTOR = {
    kobenhavn: {
      navn: 'København',
      adresse: 'Njalsgade 17B, Pakhus 2, 3. sal, 2300 København S',
      telefon: '+45 3391 1316',
      epost: 'cph@sla.dk'
    },
    aarhus: {
      navn: 'Aarhus',
      adresse: 'Mejlgade 55B, 2. sal, 8000 Aarhus C',
      telefon: '+45 8230 4095',
      epost: 'aarhus@sla.dk'
    },
    oslo: {
      navn: 'Oslo',
      adresse: 'Hausmanns gate 6, 0186 Oslo',
      telefon: '+47 4064 2836',
      epost: 'oslo@sla.dk'
    }
  };

  var SAKER = {
    forretning: {
      navn: 'Forretningshenvendelse',
      person: 'Line Agnes Bjørløw Skjærlund',
      rolle: 'Head of Business Development, Associate Partner',
      epost: 'lan@sla.dk',
      telefon: '+45 28708968'
    },
    presse: {
      navn: 'Presse',
      person: 'Kristoffer Holm Pedersen',
      rolle: 'Communications Director',
      epost: 'khp@sla.dk',
      telefon: '+45 6080 9394'
    },
    jobb: {
      navn: 'Jobb og rekruttering',
      person: 'HR i SLA',
      rolle: 'Stillinger, praksis og søknader',
      epost: 'hr@sla.dk',
      telefon: ''
    }
  };

  var kort = form.closest('.henv__kort');
  var paneler = Array.prototype.slice.call(form.querySelectorAll('[data-panel]'));
  var stegMerker = Array.prototype.slice.call(document.querySelectorAll('[data-steg-merke]'));
  var feilBoks = form.querySelector('[data-feil]');
  var knappTilbake = form.querySelector('[data-tilbake]');
  var knappNeste = form.querySelector('[data-neste]');
  var knappSend = form.querySelector('[data-send]');
  var kvittering = document.querySelector('[data-kvittering]');
  var kvTittel = document.querySelector('[data-kv-tittel]');
  var kvRef = document.querySelector('[data-kv-ref]');
  var kvListe = document.querySelector('[data-kv-liste]');
  var kvEpost = document.querySelector('[data-kv-epost]');
  var kvKopier = document.querySelector('[data-kv-kopier]');
  var kvNy = document.querySelector('[data-kv-ny]');
  var kvNotat = document.querySelector('[data-kv-notat]');

  var steg = 1;
  var sisteKvittering = null;

  function visFeil(tekst) {
    if (!feilBoks) return;
    feilBoks.textContent = tekst;
    feilBoks.hidden = !tekst;
  }

  function merkFelt(felt, ugyldig) {
    if (!felt) return;
    if (ugyldig) {
      felt.setAttribute('aria-invalid', 'true');
    } else {
      felt.removeAttribute('aria-invalid');
    }
  }

  function visSteg(n) {
    steg = n;
    paneler.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-panel')) !== n;
    });
    stegMerker.forEach(function (merke) {
      var nummer = Number(merke.getAttribute('data-steg-merke'));
      merke.classList.toggle('is-aktiv', nummer === n);
      merke.classList.toggle('is-ferdig', nummer < n);
    });
    knappTilbake.hidden = n === 1;
    knappNeste.hidden = n === 3;
    knappSend.hidden = n !== 3;
    visFeil('');
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function sjekkSteg2() {
    var navn = form.querySelector('#navn');
    var epost = form.querySelector('#epost');
    var navnOk = navn.value.trim().length >= 2;
    var epostOk = gyldigEpost(epost.value.trim());
    merkFelt(navn, !navnOk);
    merkFelt(epost, !epostOk);

    if (!navnOk && !epostOk) {
      visFeil('Fyll ut navn og en gyldig e-postadresse.');
      return false;
    }
    if (!navnOk) {
      visFeil('Fyll ut navnet ditt.');
      navn.focus();
      return false;
    }
    if (!epostOk) {
      visFeil('Skriv en gyldig e-postadresse, så vi kan svare.');
      epost.focus();
      return false;
    }
    return true;
  }

  function sjekkSteg3() {
    var tema = form.querySelector('#tema');
    var melding = form.querySelector('#melding');
    var temaOk = tema.value !== '';
    var meldingOk = melding.value.trim().length >= 10;
    merkFelt(tema, !temaOk);
    merkFelt(melding, !meldingOk);

    if (!temaOk) {
      visFeil('Velg et tema for henvendelsen.');
      tema.focus();
      return false;
    }
    if (!meldingOk) {
      visFeil('Skriv noen linjer om saken — minst ti tegn.');
      melding.focus();
      return false;
    }
    return true;
  }

  knappNeste.addEventListener('click', function () {
    if (steg === 2 && !sjekkSteg2()) return;
    if (steg < 3) visSteg(steg + 1);
  });

  knappTilbake.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1);
  });

  form.addEventListener('input', function (event) {
    if (event.target.matches('input, select, textarea')) {
      event.target.removeAttribute('aria-invalid');
    }
  });

  /* Valgkortene får en klasse, slik at de også ser valgt ut uten :has-støtte */
  var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="sak"]'));
  function oppdaterValg() {
    radios.forEach(function (radio) {
      var kortNode = radio.closest('.valg__kort');
      if (kortNode) kortNode.classList.toggle('is-valgt', radio.checked);
    });
  }
  radios.forEach(function (radio) { radio.addEventListener('change', oppdaterValg); });
  oppdaterValg();

  function lagReferanse() {
    var ar = new Date().getFullYear();
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i += 1) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'SLA-' + ar + '-' + kode;
  }

  function hentData() {
    var valgtSak = form.querySelector('input[name="sak"]:checked');
    var sakNokkel = valgtSak ? valgtSak.value : 'forretning';
    var kontorNokkel = form.querySelector('#kontor').value;
    return {
      sak: SAKER[sakNokkel] || SAKER.forretning,
      sakNokkel: sakNokkel,
      kontor: KONTOR[kontorNokkel] || KONTOR.oslo,
      navn: form.querySelector('#navn').value.trim(),
      epost: form.querySelector('#epost').value.trim(),
      organisasjon: form.querySelector('#organisasjon').value.trim(),
      tema: form.querySelector('#tema').value,
      melding: form.querySelector('#melding').value.trim()
    };
  }

  function rad(term, verdi) {
    var div = document.createElement('div');
    div.className = 'kvittering__rad';
    var dt = document.createElement('dt');
    dt.textContent = term;
    var dd = document.createElement('dd');
    dd.textContent = verdi;
    div.appendChild(dt);
    div.appendChild(dd);
    return div;
  }

  function lagKvittering() {
    var data = hentData();
    var ref = lagReferanse();

    var mottaker = data.sak.person + ' (' + data.sak.epost + ')';
    if (data.sak.telefon) {
      mottaker += ', ' + data.sak.telefon;
    }

    kvTittel.textContent = 'Henvendelsen er klar';
    kvRef.textContent = '';
    var refSterk = document.createElement('strong');
    refSterk.textContent = ref;
    kvRef.appendChild(document.createTextNode('Referanse: '));
    kvRef.appendChild(refSterk);
    kvRef.appendChild(document.createTextNode(' — gjelder bare i denne skissen.'));

    kvListe.textContent = '';
    kvListe.appendChild(rad('Gjelder', data.sak.navn));
    kvListe.appendChild(rad('Mottaker', mottaker));
    kvListe.appendChild(rad('Kontor', data.kontor.navn + ' · ' + data.kontor.adresse + ' · ' + data.kontor.telefon));
    kvListe.appendChild(rad('Fra', data.navn + (data.organisasjon ? ', ' + data.organisasjon : '')));
    kvListe.appendChild(rad('E-post', data.epost));
    kvListe.appendChild(rad('Tema', data.tema));
    kvListe.appendChild(rad('Melding', data.melding));

    var emne = 'Henvendelse via sla.dk — ' + data.sak.navn + ' — ' + data.tema;
    var kropp = [
      'Navn: ' + data.navn,
      'E-post: ' + data.epost,
      'Organisasjon: ' + (data.organisasjon || '–'),
      'Kontor: ' + data.kontor.navn,
      'Gjelder: ' + data.sak.navn,
      'Tema: ' + data.tema,
      'Referanse: ' + ref,
      '',
      'Melding:',
      data.melding,
      '',
      '— sendt fra skissen til sla.dk'
    ].join('\n');

    kvEpost.href = 'mailto:' + data.sak.epost +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp);

    kvNotat.textContent = 'Ingenting er sendt ennå. Knappen åpner en ferdig utfylt e-post i din egen e-postklient, adressert til ' +
      data.sak.epost + '.';

    sisteKvittering = {
      ref: ref,
      data: data,
      tekst: 'Henvendelse til SLA\n' + [
        'Referanse: ' + ref,
        'Gjelder: ' + data.sak.navn,
        'Mottaker: ' + mottaker,
        'Kontor: ' + data.kontor.navn + ', ' + data.kontor.adresse,
        'Fra: ' + data.navn + (data.organisasjon ? ', ' + data.organisasjon : ''),
        'E-post: ' + data.epost,
        'Tema: ' + data.tema,
        '',
        data.melding
      ].join('\n')
    };

    form.hidden = true;
    kvittering.hidden = false;
    if (kort) {
      kort.scrollIntoView({ block: 'nearest' });
    }
    kvTittel.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!sjekkSteg2()) {
      visSteg(2);
      return;
    }
    if (!sjekkSteg3()) return;
    lagKvittering();
  });

  if (kvKopier) {
    kvKopier.addEventListener('click', function () {
      if (!sisteKvittering) return;
      var tekst = sisteKvittering.tekst;

      function kvitter() {
        kvKopier.textContent = 'Kopiert';
        window.setTimeout(function () {
          kvKopier.textContent = 'Kopier oppsummering';
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(kvitter, fallback);
      } else {
        fallback();
      }

      function fallback() {
        var hjelper = document.createElement('textarea');
        hjelper.value = tekst;
        hjelper.setAttribute('readonly', 'readonly');
        hjelper.style.position = 'fixed';
        hjelper.style.top = '-1000px';
        document.body.appendChild(hjelper);
        hjelper.select();
        try {
          document.execCommand('copy');
          kvitter();
        } catch (error) {
          kvKopier.textContent = 'Kunne ikke kopiere';
        }
        document.body.removeChild(hjelper);
      }
    });
  }

  if (kvNy) {
    kvNy.addEventListener('click', function () {
      form.reset();
      oppdaterValg();
      var feil = form.querySelectorAll('[aria-invalid="true"]');
      Array.prototype.forEach.call(feil, function (felt) {
        felt.removeAttribute('aria-invalid');
      });
      kvittering.hidden = true;
      form.hidden = false;
      visSteg(1);
      if (kort) {
        kort.scrollIntoView({ block: 'nearest' });
      }
      var forste = form.querySelector('input[name="sak"]');
      if (forste) forste.focus({ preventScroll: true });
    });
  }

  visSteg(1);
})();
