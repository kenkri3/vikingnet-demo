/*
  JKS Norge AS — demo.
  Alt skjer i nettleseren: meny, behovsskjema i tre steg og et sammendrag
  med referansenummer. Ingenting sendes til en server. E-posten åpnes ferdig
  utfylt i brukerens eget e-postprogram først når brukeren selv trykker send.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---- Mobilmeny ---- */
  var menuBtn = document.getElementById('menuBtn');
  var mobil = document.getElementById('mobil');

  function lukkMeny() {
    if (!menuBtn || !mobil) return;
    mobil.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn && mobil) {
    menuBtn.addEventListener('click', function () {
      var apen = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', apen ? 'false' : 'true');
      mobil.hidden = apen;
      if (!apen) {
        var forste = mobil.querySelector('a');
        if (forste) forste.focus();
      }
    });

    mobil.addEventListener('click', function (e) {
      if (e.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobil.hidden) {
        lukkMeny();
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---- Behovsskjema i tre steg ---- */
  var form = document.getElementById('behov');
  var kvittering = document.getElementById('kvittering');
  var stegvis = document.getElementById('stegvis');
  var kort = document.querySelector('.foresp__kort');
  if (!form || !kvittering || !stegvis) return;

  var felter = Array.prototype.slice.call(form.querySelectorAll('.steg-felt'));
  var punkter = Array.prototype.slice.call(stegvis.querySelectorAll('li'));
  var aktiv = 1;

  function feilFelt(steg) {
    return form.querySelector('[data-feil="' + steg + '"]');
  }

  function visFeil(steg, melding) {
    var p = feilFelt(steg);
    if (!p) return;
    p.textContent = melding;
    p.hidden = false;
  }

  function skjulFeil(steg) {
    var p = feilFelt(steg);
    if (!p) return;
    p.hidden = true;
    p.textContent = '';
  }

  function settSteg(n) {
    aktiv = n;
    felter.forEach(function (f) {
      f.hidden = Number(f.dataset.steg) !== n;
    });
    punkter.forEach(function (li, i) {
      li.classList.toggle('er-ferdig', i + 1 < n);
      if (i + 1 === n) {
        li.setAttribute('aria-current', 'step');
      } else {
        li.removeAttribute('aria-current');
      }
    });
    var legend = form.querySelector('.steg-felt[data-steg="' + n + '"] legend');
    if (legend) {
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
    }
    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function verdier() {
    var f = form.elements;
    return {
      tjeneste: f.namedItem('tjeneste').value,
      fagomrade: f.namedItem('fagomrade').value,
      naar: f.namedItem('naar').value,
      antall: f.namedItem('antall').value || '1',
      navn: f.namedItem('navn').value.trim(),
      bedrift: f.namedItem('bedrift').value.trim(),
      epost: f.namedItem('epost').value.trim(),
      telefon: f.namedItem('telefon').value.trim(),
      melding: f.namedItem('melding').value.trim()
    };
  }

  function valider(steg) {
    var v = verdier();
    if (steg === 1) {
      return v.tjeneste ? '' : 'Velg tjenesten som passer best.';
    }
    if (steg === 2) {
      if (!v.fagomrade) return 'Velg fagområde.';
      if (!v.naar) return 'Velg når dere trenger folk.';
      var antall = Number(v.antall);
      if (!antall || antall < 1 || antall > 500) return 'Antall personer må være mellom 1 og 500.';
      return '';
    }
    if (steg === 3) {
      if (!v.navn) return 'Fyll inn navn.';
      if (!v.bedrift) return 'Fyll inn bedrift.';
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.epost)) return 'Fyll inn en gyldig e-postadresse.';
      return '';
    }
    return '';
  }

  form.addEventListener('click', function (e) {
    var neste = e.target.closest('[data-neste]');
    var tilbake = e.target.closest('[data-tilbake]');
    if (neste) {
      var feil = valider(aktiv);
      if (feil) {
        visFeil(aktiv, feil);
        return;
      }
      skjulFeil(aktiv);
      settSteg(Math.min(aktiv + 1, 3));
    }
    if (tilbake) {
      skjulFeil(aktiv);
      settSteg(Math.max(aktiv - 1, 1));
    }
  });

  form.addEventListener('change', function (e) {
    if (e.target.closest('.steg-felt')) skjulFeil(aktiv);
  });

  var referanse = '';

  function lagReferanse() {
    var d = new Date();
    var dato = String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    var nr = String(Math.floor(Math.random() * 9000) + 1000);
    return 'JKS-' + dato + '-' + nr;
  }

  function lagSammendrag(v) {
    var linjer = [
      'Referanse: ' + referanse,
      'Tjeneste: ' + v.tjeneste,
      'Fagområde: ' + v.fagomrade,
      'Når: ' + v.naar,
      'Antall personer: ' + v.antall,
      'Navn: ' + v.navn,
      'Bedrift: ' + v.bedrift,
      'E-post: ' + v.epost
    ];
    if (v.telefon) linjer.push('Telefon: ' + v.telefon);
    if (v.melding) linjer.push('', 'Melding: ' + v.melding);
    return linjer;
  }

  function lagKvittering() {
    var v = verdier();
    referanse = lagReferanse();
    skjulFeil(3);

    var liste = document.getElementById('kv-liste');
    liste.innerHTML = '';
    var rader = [
      ['Tjeneste', v.tjeneste],
      ['Fagområde', v.fagomrade],
      ['Når', v.naar],
      ['Antall personer', v.antall],
      ['Kontaktperson', v.navn],
      ['Bedrift', v.bedrift],
      ['E-post', v.epost]
    ];
    if (v.telefon) rader.push(['Telefon', v.telefon]);
    if (v.melding) rader.push(['Melding', v.melding]);

    rader.forEach(function (r) {
      var dt = document.createElement('dt');
      dt.textContent = r[0];
      var dd = document.createElement('dd');
      dd.textContent = r[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });

    document.getElementById('kv-ref').textContent = 'Referanse ' + referanse;

    var emne = 'Behov: ' + v.tjeneste + ' — ' + v.bedrift;
    var kropp = lagSammendrag(v).join('\r\n');
    document.getElementById('kv-send').href =
      'mailto:post@jks.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

    var status = document.getElementById('kv-status');
    status.textContent = '';

    form.hidden = true;
    kvittering.hidden = false;
    punkter.forEach(function (li) {
      li.classList.add('er-ferdig');
      li.removeAttribute('aria-current');
    });

    var tittel = kvittering.querySelector('h3');
    if (tittel) {
      tittel.setAttribute('tabindex', '-1');
      tittel.focus({ preventScroll: true });
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var feil = valider(3);
    if (feil) {
      visFeil(3, feil);
      return;
    }
    lagKvittering();
  });

  document.getElementById('kv-kopier').addEventListener('click', function () {
    var v = verdier();
    var tekst = lagSammendrag(v).join('\n');
    var status = document.getElementById('kv-status');
    function kvitter(melding) {
      status.textContent = melding;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function () {
        kvitter('Sammendraget er kopiert.');
      }).catch(function () {
        kvitter('Nettleseren lot oss ikke kopiere. Merk teksten og kopier manuelt.');
      });
    } else {
      kvitter('Nettleseren lot oss ikke kopiere. Merk teksten og kopier manuelt.');
    }
  });

  document.getElementById('kv-ny').addEventListener('click', function () {
    form.reset();
    referanse = '';
    document.getElementById('kv-status').textContent = '';
    kvittering.hidden = true;
    form.hidden = false;
    settSteg(1);
  });
})();
