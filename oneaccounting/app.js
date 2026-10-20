/*
  One Accounting — demoens ene interaksjon.
  1) Mobilmeny.
  2) Møteforespørsel i tre steg med kvittering. Alt skjer i nettleseren:
     ingenting sendes eller lagres, kvitteringen gir en mailto-lenke.
  3) Innhold som skal vises selv om noe går galt: .reveal får en sikring
     som gjør alt synlig etter kort tid.
*/
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var settMeny = function (aapen) {
      nav.hidden = !aapen;
      toggle.setAttribute('aria-expanded', aapen ? 'true' : 'false');
      toggle.setAttribute('aria-label', aapen ? 'Lukk menyen' : 'Åpne menyen');
    };

    toggle.addEventListener('click', function () {
      settMeny(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.innerWidth <= 900) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && window.innerWidth <= 900) settMeny(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Vis innhold når det kommer i bildet ---------- */

  var reveal = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  var visAlt = function () {
    reveal.forEach(function (el) {
      el.classList.add('is-visible');
    });
  };

  if (!('IntersectionObserver' in window)) {
    visAlt();
  } else if (reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    reveal.forEach(function (el) {
      io.observe(el);
    });

    window.setTimeout(visAlt, 2600);
  }

  /* ---------- Møteforespørsel ---------- */

  var form = document.getElementById('bookForm');
  if (!form) return;

  var bookPanel = form.closest('.book');

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var prog = Array.prototype.slice.call(document.querySelectorAll('#prog li'));
  var feilEl = document.getElementById('feil');
  var nesteBtn = document.getElementById('neste');
  var tilbakeBtn = document.getElementById('tilbake');
  var sendBtn = document.getElementById('send');
  var receipt = document.getElementById('receipt');
  var sumPanel = document.getElementById('sum');
  var recRows = document.getElementById('recRows');
  var recMail = document.getElementById('recMail');
  var recReset = document.getElementById('recReset');

  var sum = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-sum]'), function (el) {
    sum[el.getAttribute('data-sum')] = el;
  });

  var steg = 1;
  var valg = {
    tjenester: [],
    kontor: '',
    dag: '',
    dagLang: '',
    tid: '',
    navn: '',
    firma: '',
    epost: ''
  };

  var kortDag = new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
  var langDag = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

  var TIDER = ['09:00', '10:00', '11:00', '13:00', '14:00'];

  var storForste = function (tekst) {
    return tekst.charAt(0).toUpperCase() + tekst.slice(1);
  };

  var isoDag = function (dato) {
    var mnd = String(dato.getMonth() + 1);
    var dag = String(dato.getDate());
    if (mnd.length < 2) mnd = '0' + mnd;
    if (dag.length < 2) dag = '0' + dag;
    return dato.getFullYear() + '-' + mnd + '-' + dag;
  };

  var lagKnapp = function (attributt, verdi, tekst) {
    var knapp = document.createElement('button');
    knapp.type = 'button';
    knapp.className = 'choice';
    knapp.setAttribute('aria-pressed', 'false');
    knapp.setAttribute(attributt, verdi);

    var prikk = document.createElement('span');
    prikk.className = 'choice__mark';
    prikk.setAttribute('aria-hidden', 'true');

    knapp.appendChild(prikk);
    knapp.appendChild(document.createTextNode(tekst));
    return knapp;
  };

  var fyllDager = function () {
    var boks = document.getElementById('dager');
    if (!boks) return;
    var dato = new Date();
    dato.setHours(12, 0, 0, 0);
    var lagt = 0;

    while (lagt < 5) {
      dato.setDate(dato.getDate() + 1);
      var ukedag = dato.getDay();
      if (ukedag === 0 || ukedag === 6) continue;

      var kopi = new Date(dato.getTime());
      var knapp = lagKnapp('data-dag', isoDag(kopi), storForste(kortDag.format(kopi)));
      knapp.dataset.daglang = storForste(langDag.format(kopi));
      boks.appendChild(knapp);
      lagt += 1;
    }
  };

  var fyllTider = function () {
    var boks = document.getElementById('tider');
    if (!boks) return;
    TIDER.forEach(function (tid) {
      boks.appendChild(lagKnapp('data-tid', tid, tid));
    });
  };

  var settSum = function (nokkel, verdi, tomTekst) {
    var el = sum[nokkel];
    if (!el) return;
    el.textContent = verdi || tomTekst;
    el.classList.toggle('sum__v--tom', !verdi);
  };

  var oppdaterSum = function () {
    settSum('tjenester', valg.tjenester.join(', '), 'Ikke valgt');
    settSum('kontor', valg.kontor, 'Ikke valgt');
    settSum('dag', valg.dagLang, 'Ikke valgt');
    settSum('tid', valg.tid, 'Ikke valgt');
    settSum('navn', valg.navn.trim(), 'Ikke fylt ut');
  };

  var velgEn = function (gruppe, knapp) {
    Array.prototype.forEach.call(form.querySelectorAll('[data-' + gruppe + ']'), function (other) {
      other.setAttribute('aria-pressed', other === knapp ? 'true' : 'false');
    });
  };

  var lesKontakt = function () {
    var navn = document.getElementById('navn');
    var firma = document.getElementById('firma');
    var epost = document.getElementById('epost');
    valg.navn = navn ? navn.value : '';
    valg.firma = firma ? firma.value : '';
    valg.epost = epost ? epost.value : '';
  };

  var visSteg = function (nr, flyttFokus) {
    steg = nr;

    steps.forEach(function (el) {
      el.hidden = Number(el.getAttribute('data-step')) !== nr;
    });

    prog.forEach(function (el) {
      if (Number(el.getAttribute('data-prog')) === nr) {
        el.setAttribute('aria-current', 'step');
      } else {
        el.removeAttribute('aria-current');
      }
    });

    tilbakeBtn.hidden = nr === 1;
    nesteBtn.hidden = nr === steps.length;
    sendBtn.hidden = nr !== steps.length;

    feilEl.textContent = '';
    oppdaterSum();

    if (flyttFokus) {
      var fokus = steps[nr - 1].querySelector('button, input');
      if (fokus) fokus.focus({ preventScroll: true });
    }
  };

  var valider = function (nr) {
    if (nr === 1 && valg.tjenester.length === 0) {
      return 'Velg minst ett område, så vi vet hvem som skal være med i møtet.';
    }
    if (nr === 2) {
      if (!valg.kontor) return 'Velg hvilket kontor du vil møtes på.';
      if (!valg.dag) return 'Velg en dag som passer.';
      if (!valg.tid) return 'Velg et tidspunkt.';
    }
    if (nr === 3) {
      lesKontakt();
      if (!valg.navn.trim()) return 'Fyll inn navnet ditt.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valg.epost.trim())) {
        return 'Fyll inn en e-postadresse vi kan svare på.';
      }
    }
    return '';
  };

  var lagKvittering = function () {
    var linjer = [
      ['Tjenester', valg.tjenester.join(', ')],
      ['Kontor', valg.kontor],
      ['Dag', valg.dagLang],
      ['Tid', valg.tid],
      ['Navn', valg.navn.trim()],
      ['Firma', valg.firma.trim() || 'Ikke oppgitt'],
      ['E-post', valg.epost.trim()]
    ];

    recRows.textContent = '';

    linjer.forEach(function (linje) {
      var rad = document.createElement('div');
      rad.className = 'receipt__row';

      var dt = document.createElement('dt');
      dt.textContent = linje[0];

      var dd = document.createElement('dd');
      dd.textContent = linje[1];

      rad.appendChild(dt);
      rad.appendChild(dd);
      recRows.appendChild(rad);
    });

    var emne = 'Møteforespørsel: ' + valg.tjenester.join(', ');
    var kropp = [
      'Hei,',
      '',
      'Jeg ønsker et møte med One Accounting.',
      '',
      'Tjenester: ' + valg.tjenester.join(', '),
      'Kontor: ' + valg.kontor,
      'Forslag til dag: ' + valg.dagLang,
      'Forslag til tid: ' + valg.tid,
      '',
      'Navn: ' + valg.navn.trim(),
      'Firma: ' + (valg.firma.trim() || 'Ikke oppgitt'),
      'E-post: ' + valg.epost.trim(),
      '',
      'Vennlig hilsen',
      valg.navn.trim()
    ].join('\n');

    recMail.href = 'mailto:marked@oneaccounting.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
  };

  form.addEventListener('click', function (event) {
    var knapp = event.target.closest('button');
    if (!knapp) return;

    if (knapp.hasAttribute('data-tjeneste')) {
      var navn = knapp.getAttribute('data-tjeneste');
      var inne = valg.tjenester.indexOf(navn);
      if (inne >= 0) {
        valg.tjenester.splice(inne, 1);
        knapp.setAttribute('aria-pressed', 'false');
      } else {
        valg.tjenester.push(navn);
        knapp.setAttribute('aria-pressed', 'true');
      }
      oppdaterSum();
      feilEl.textContent = '';
      return;
    }

    if (knapp.hasAttribute('data-kontor')) {
      valg.kontor = knapp.getAttribute('data-kontor');
      velgEn('kontor', knapp);
      oppdaterSum();
      feilEl.textContent = '';
      return;
    }

    if (knapp.hasAttribute('data-dag')) {
      valg.dag = knapp.getAttribute('data-dag');
      valg.dagLang = knapp.dataset.daglang || valg.dag;
      velgEn('dag', knapp);
      oppdaterSum();
      feilEl.textContent = '';
      return;
    }

    if (knapp.hasAttribute('data-tid')) {
      valg.tid = knapp.getAttribute('data-tid');
      velgEn('tid', knapp);
      oppdaterSum();
      feilEl.textContent = '';
    }
  });

  form.addEventListener('input', function (event) {
    if (event.target.closest('.step[data-step="3"]')) {
      lesKontakt();
      oppdaterSum();
    }
  });

  nesteBtn.addEventListener('click', function () {
    var feil = valider(steg);
    if (feil) {
      feilEl.textContent = feil;
      return;
    }
    if (steg < steps.length) visSteg(steg + 1, true);
  });

  tilbakeBtn.addEventListener('click', function () {
    if (steg > 1) visSteg(steg - 1, true);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var feil = valider(steg);
    if (feil) {
      feilEl.textContent = feil;
      return;
    }
    lagKvittering();
    form.hidden = true;
    sumPanel.hidden = true;
    if (bookPanel) bookPanel.classList.add('book--kvittering');
    receipt.hidden = false;
    receipt.setAttribute('tabindex', '-1');
    receipt.focus({ preventScroll: true });
    receipt.scrollIntoView({ block: 'nearest' });
  });

  recReset.addEventListener('click', function () {
    valg.tjenester = [];
    valg.kontor = '';
    valg.dag = '';
    valg.dagLang = '';
    valg.tid = '';
    valg.navn = '';
    valg.firma = '';
    valg.epost = '';

    Array.prototype.forEach.call(form.querySelectorAll('[aria-pressed]'), function (el) {
      el.setAttribute('aria-pressed', 'false');
    });

    Array.prototype.forEach.call(form.querySelectorAll('input'), function (el) {
      el.value = '';
    });

    receipt.hidden = true;
    sumPanel.hidden = false;
    form.hidden = false;
    if (bookPanel) bookPanel.classList.remove('book--kvittering');
    visSteg(1, true);
  });

  fyllDager();
  fyllTider();
  visSteg(1);
})();
