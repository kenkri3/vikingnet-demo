/*
  GFR AS — demo. Alt skjer i nettleseren: ingen data forlater siden, og
  befaringen sender ingenting selv. Den lager en oppsummering og en ferdig
  e-post til post@gfr.no som brukeren selv åpner.
*/
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hovednav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', apen ? 'false' : 'true');
      nav.hidden = apen;
    });

    nav.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.hidden = true;
      }
    });
  }

  /* ---------- Innhold som toner inn ---------- */

  var elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (elementer.length) {
    var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (rolig || !('IntersectionObserver' in window)) {
      elementer.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var observator = new IntersectionObserver(function (poster) {
        poster.forEach(function (post) {
          if (post.isIntersecting) {
            post.target.classList.add('is-visible');
            observator.unobserve(post.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

      elementer.forEach(function (el) {
        observator.observe(el);
      });
    }
  }

  /* ---------- Årstall i footer ---------- */

  var aar = document.getElementById('footer-aar');
  if (aar) {
    aar.textContent = String(new Date().getFullYear());
  }

  /* ---------- Befaring: tre steg, oppsummering, kvittering ---------- */

  var skjema = document.getElementById('befaring-skjema');
  if (!skjema) return;

  var stegfelt = Array.prototype.slice.call(skjema.querySelectorAll('.stegfelt'));
  var stegviser = Array.prototype.slice.call(document.querySelectorAll('[data-stegviser]'));
  var valgknapper = Array.prototype.slice.call(skjema.querySelectorAll('.valg__knapp'));
  var kvittering = document.getElementById('kvittering');
  var oppsummering = document.getElementById('oppsummering');
  var tilbake = document.getElementById('tilbake');
  var neste = document.getElementById('neste');
  var sisteSteg = stegfelt.length;
  var steg = 1;

  function felt(navn) {
    return skjema.querySelector('[name="' + navn + '"]');
  }

  function verdi(navn) {
    var el = felt(navn);
    return el ? String(el.value).trim() : '';
  }

  function valgteTjenester() {
    return valgknapper
      .filter(function (knapp) {
        return knapp.getAttribute('aria-pressed') === 'true';
      })
      .map(function (knapp) {
        return knapp.getAttribute('data-verdi');
      });
  }

  function visFeil(nr, melding) {
    var boks = skjema.querySelector('[data-feil="' + nr + '"]');
    if (!boks) return;
    if (melding) {
      boks.textContent = melding;
      boks.hidden = false;
    } else {
      boks.textContent = '';
      boks.hidden = true;
    }
  }

  function valider(nr) {
    if (nr === 1) {
      if (valgteTjenester().length === 0) {
        visFeil(1, 'Velg minst én tjeneste før du går videre.');
        return false;
      }
      visFeil(1, '');
      return true;
    }

    if (nr === 2) {
      if (!verdi('byggtype')) {
        visFeil(2, 'Velg hvilken type bygg det gjelder.');
        return false;
      }
      if (verdi('sted').length < 2) {
        visFeil(2, 'Skriv sted eller postnummer, så vi vet hvor bygget ligger.');
        return false;
      }
      visFeil(2, '');
      return true;
    }

    if (nr === 3) {
      if (verdi('navn').length < 2) {
        visFeil(3, 'Skriv navnet ditt.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(verdi('epost'))) {
        visFeil(3, 'Skriv en gyldig e-postadresse, så vi kan svare.');
        return false;
      }
      visFeil(3, '');
      return true;
    }

    return true;
  }

  function gaaTil(nr, flyttFokus) {
    steg = Math.min(Math.max(1, nr), sisteSteg);

    stegfelt.forEach(function (gruppe) {
      gruppe.hidden = Number(gruppe.getAttribute('data-steg')) !== steg;
    });

    stegviser.forEach(function (punkt) {
      var tall = Number(punkt.getAttribute('data-stegviser'));
      if (tall === steg) {
        punkt.setAttribute('aria-current', 'step');
      } else {
        punkt.removeAttribute('aria-current');
      }
    });

    tilbake.hidden = steg === 1;
    neste.textContent = steg === sisteSteg ? 'Se oppsummering' : 'Neste';

    if (flyttFokus) {
      var tittel = stegfelt[steg - 1].querySelector('legend');
      if (tittel) {
        tittel.setAttribute('tabindex', '-1');
        tittel.focus({ preventScroll: true });
      }
    }
  }

  function sammendrag() {
    return {
      tjenester: valgteTjenester(),
      byggtype: verdi('byggtype'),
      etasjer: verdi('etasjer'),
      sted: verdi('sted'),
      navn: verdi('navn'),
      epost: verdi('epost'),
      telefon: verdi('telefon'),
      tidspunkt: verdi('tidspunkt')
    };
  }

  function rad(nokkel, innhold) {
    var li = document.createElement('li');
    var k = document.createElement('span');
    k.className = 'oppsummering__nokkel';
    k.textContent = nokkel;
    var v = document.createElement('span');
    v.className = 'oppsummering__verdi';
    v.textContent = innhold;
    li.appendChild(k);
    li.appendChild(v);
    return li;
  }

  function oppdaterOppsummering() {
    var s = sammendrag();
    var bygg = [];
    if (s.byggtype) bygg.push(s.byggtype);
    if (s.etasjer) bygg.push(s.etasjer + ' etasjer');
    var kontakt = [];
    if (s.navn) kontakt.push(s.navn);
    if (s.epost) kontakt.push(s.epost);

    oppsummering.textContent = '';
    oppsummering.appendChild(rad('Tjenester', s.tjenester.length ? s.tjenester.join(', ') : 'Ikke valgt ennå'));
    oppsummering.appendChild(rad('Bygg', bygg.length ? bygg.join(', ') : 'Ikke valgt ennå'));
    oppsummering.appendChild(rad('Sted', s.sted || 'Ikke valgt ennå'));
    oppsummering.appendChild(rad('Kontakt', kontakt.length ? kontakt.join(', ') : 'Ikke fylt ut ennå'));
  }

  function lagKvittering(s, nummer) {
    var linjer = [
      ['Tjenester', s.tjenester.join(', ')],
      ['Byggtype', s.byggtype],
      ['Antall etasjer', s.etasjer || 'Ikke oppgitt'],
      ['Sted', s.sted],
      ['Ønsket tidspunkt', s.tidspunkt || 'Ikke oppgitt'],
      ['Navn', s.navn],
      ['E-post', s.epost],
      ['Telefon', s.telefon || 'Ikke oppgitt']
    ];

    var emne = 'Befaring ' + nummer + ' – ' + s.tjenester.join(', ');
    var kropp = ['Befaring ' + nummer, '']
      .concat(linjer.map(function (linje) {
        return linje[0] + ': ' + linje[1];
      }))
      .join('\n');

    var lenke = 'mailto:post@gfr.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

    kvittering.textContent = '';

    var topp = document.createElement('div');
    var merke = document.createElement('p');
    merke.className = 'eyebrow';
    merke.textContent = 'Kvittering';
    var tittel = document.createElement('h3');
    tittel.textContent = 'Befaring ' + nummer;
    tittel.setAttribute('tabindex', '-1');
    var notat = document.createElement('p');
    notat.className = 'kvittering__notat';
    notat.textContent = 'Sammendraget er laget i nettleseren din. Ingenting er sendt ennå.';
    topp.appendChild(merke);
    topp.appendChild(tittel);
    topp.appendChild(notat);

    var liste = document.createElement('dl');
    liste.className = 'kvittering__liste';
    linjer.forEach(function (linje) {
      var wrapper = document.createElement('div');
      var dt = document.createElement('dt');
      dt.textContent = linje[0];
      var dd = document.createElement('dd');
      dd.textContent = linje[1];
      wrapper.appendChild(dt);
      wrapper.appendChild(dd);
      liste.appendChild(wrapper);
    });

    var knapper = document.createElement('div');
    knapper.className = 'kvittering__knapper';

    var send = document.createElement('a');
    send.className = 'btn';
    send.href = lenke;
    send.textContent = 'Åpne e-post til post@gfr.no';

    var endre = document.createElement('button');
    endre.type = 'button';
    endre.className = 'btn btn--ghost';
    endre.textContent = 'Endre svarene';
    endre.addEventListener('click', function () {
      kvittering.hidden = true;
      skjema.hidden = false;
      gaaTil(1, true);
    });

    knapper.appendChild(send);
    knapper.appendChild(endre);

    var fot = document.createElement('p');
    fot.className = 'kvittering__fot';
    fot.textContent = 'Kvitteringsnummeret er laget lokalt og er først registrert hos GFR AS når e-posten er sendt.';

    kvittering.appendChild(topp);
    kvittering.appendChild(liste);
    kvittering.appendChild(knapper);
    kvittering.appendChild(fot);

    return tittel;
  }

  valgknapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var valgt = knapp.getAttribute('aria-pressed') === 'true';
      knapp.setAttribute('aria-pressed', valgt ? 'false' : 'true');
      visFeil(1, '');
      oppdaterOppsummering();
    });
  });

  skjema.addEventListener('input', oppdaterOppsummering);
  skjema.addEventListener('change', oppdaterOppsummering);

  tilbake.addEventListener('click', function () {
    gaaTil(steg - 1, true);
  });

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    if (!valider(steg)) return;

    if (steg < sisteSteg) {
      gaaTil(steg + 1, true);
      return;
    }

    var s = sammendrag();
    var nummer = 'B-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
    var tittel = lagKvittering(s, nummer);

    skjema.hidden = true;
    kvittering.hidden = false;
    oppdaterOppsummering();

    if (tittel) {
      tittel.focus({ preventScroll: true });
    }
    kvittering.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  oppdaterOppsummering();
  gaaTil(1, false);
})();
