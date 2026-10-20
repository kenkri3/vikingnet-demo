/*
  Arctic Asfalt AS — interaksjon.
  Alt skjer i nettleseren. Ingen data sendes noe sted før brukeren selv
  velger e-post eller ringer.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var $ = function (sel, rot) { return (rot || document).querySelector(sel); };
  var $$ = function (sel, rot) { return Array.prototype.slice.call((rot || document).querySelectorAll(sel)); };

  /* ---------- Mobilmeny ---------- */

  var nav = $('#nav');
  var navBtn = $('#navBtn');
  var mobil = window.matchMedia('(max-width: 900px)');

  function settMeny(open) {
    if (!nav || !navBtn) return;
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    nav.hidden = !open;
  }

  function synkMeny() {
    if (!nav || !navBtn) return;
    if (mobil.matches) {
      settMeny(false);
    } else {
      nav.hidden = false;
      navBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (nav && navBtn) {
    synkMeny();

    navBtn.addEventListener('click', function () {
      settMeny(navBtn.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) synkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobil.matches) settMeny(false);
    });

    if (mobil.addEventListener) {
      mobil.addEventListener('change', synkMeny);
    } else if (mobil.addListener) {
      mobil.addListener(synkMeny);
    }
  }

  /* ---------- Rolig innkomst ---------- */

  var los = $$('.reveal');
  if ('IntersectionObserver' in window && los.length) {
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add('is-visible');
          io.unobserve(o.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    los.forEach(function (el) { io.observe(el); });

    window.setTimeout(function () {
      los.forEach(function (el) { el.classList.add('is-visible'); });
    }, 1200);
  } else {
    los.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Årstall ---------- */

  var ar = $('#ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------- Prosjektforespørsel ---------- */

  var form = $('#req');
  if (!form) return;

  var panel = $('#panel');
  var stegind = $('#stegind');
  var paneler = $$('.stegpanel', form);
  var punkter = $$('li', stegind);
  var kvittering = $('#kvittering');
  var steg = 1;
  var siste = null;

  var typer = {
    asfaltering: 'Asfaltering',
    fresing: 'Fresing',
    masser: 'Asfaltmasser',
    armering: 'Asfaltarmering',
    transport: 'Transport',
    annet: 'Annet'
  };

  /*
    Hvem som får hva. Rollene er hentet fra kundens egen kontaktside:
    Bjørn R. Pedersen (salg/markedsleder), Cato Rude-Hansen (selger på
    asfaltarmering) og vakttelefonen til Jessheim Asfalt for masser.
  */
  var ruting = {
    asfaltering: {
      navn: 'Bjørn R. Pedersen',
      rolle: 'Salg/markedsleder',
      tlf: '971 46 685',
      tlfHref: 'tel:+4797146685',
      mail: 'bjorn@arcticasfalt.no',
      hvorfor: 'Salg og befaring på alle asfaltjobber.'
    },
    fresing: {
      navn: 'Bjørn R. Pedersen',
      rolle: 'Salg/markedsleder',
      tlf: '971 46 685',
      tlfHref: 'tel:+4797146685',
      mail: 'bjorn@arcticasfalt.no',
      hvorfor: 'Fresing avtales sammen med salg før jobben planlegges.'
    },
    transport: {
      navn: 'Bjørn R. Pedersen',
      rolle: 'Salg/markedsleder',
      tlf: '971 46 685',
      tlfHref: 'tel:+4797146685',
      mail: 'bjorn@arcticasfalt.no',
      hvorfor: 'Transport avtales som del av den samme jobben.'
    },
    armering: {
      navn: 'Cato Rude-Hansen',
      rolle: 'Selger, asfaltarmering',
      tlf: '911 25 403',
      tlfHref: 'tel:+4791125403',
      mail: 'cato@arcticasfalt.no',
      hvorfor: 'Cato er selger på armering og svarer på spørsmål om nett og dokumentasjon.'
    },
    masser: {
      navn: 'Jessheim Asfalt',
      rolle: 'Asfaltverk og levering',
      tlf: '481 51 715',
      tlfHref: 'tel:+4748151715',
      mail: 'labb@jessheimasfalt.no',
      hvorfor: 'Vakttelefonen på verket tar imot bestilling og levering av masser.'
    },
    annet: {
      navn: 'Bjørn R. Pedersen',
      rolle: 'Salg/markedsleder',
      tlf: '971 46 685',
      tlfHref: 'tel:+4797146685',
      mail: 'bjorn@arcticasfalt.no',
      hvorfor: 'Vi finner ut hvem som skal svare, og sender deg videre.'
    }
  };

  function valgtType() {
    var valgt = form.querySelector('input[name="type"]:checked');
    return valgt ? valgt.value : 'asfaltering';
  }

  function oppdaterRuting() {
    var r = ruting[valgtType()] || ruting.annet;
    var rNavn = $('#rNavn');
    var rRolle = $('#rRolle');
    var rTlf = $('#rTlf');
    var rMail = $('#rMail');
    var rHvorfor = $('#rHvorfor');
    if (rNavn) rNavn.textContent = r.navn;
    if (rRolle) rRolle.textContent = r.rolle;
    if (rTlf) { rTlf.textContent = r.tlf; rTlf.setAttribute('href', r.tlfHref); }
    if (rMail) { rMail.textContent = r.mail; rMail.setAttribute('href', 'mailto:' + r.mail); }
    if (rHvorfor) rHvorfor.textContent = r.hvorfor;
  }

  $$('input[name="type"]', form).forEach(function (radio) {
    radio.addEventListener('change', oppdaterRuting);
  });
  oppdaterRuting();

  function visSteg(n) {
    steg = n;
    paneler.forEach(function (p) {
      p.hidden = Number(p.getAttribute('data-steg')) !== n;
    });
    punkter.forEach(function (li) {
      var s = Number(li.getAttribute('data-steg'));
      li.classList.toggle('er-aktiv', s === n);
      li.classList.toggle('er-ferdig', s < n);
      if (s === n) {
        li.setAttribute('aria-current', 'step');
      } else {
        li.removeAttribute('aria-current');
      }
    });
    var felt = paneler[n - 1].querySelector('input, select, textarea, button');
    if (felt) felt.focus({ preventScroll: true });
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function visFeil(n, tekst) {
    var p = form.querySelector('[data-feil="' + n + '"]');
    if (!p) return;
    if (tekst) {
      p.textContent = tekst;
      p.hidden = false;
    } else {
      p.hidden = true;
      p.textContent = '';
    }
  }

  function merk(felt, feil) {
    if (!felt) return;
    if (feil) {
      felt.setAttribute('aria-invalid', 'true');
    } else {
      felt.removeAttribute('aria-invalid');
    }
  }

  function gyldigSteg(n) {
    if (n === 2) {
      var sted = form.elements.sted;
      var tomt = !sted.value.trim();
      merk(sted, tomt);
      visFeil(2, tomt ? 'Fyll inn sted eller kommune, så vi vet hvor jobben er.' : '');
      if (tomt) { sted.focus(); return false; }
      return true;
    }
    if (n === 3) {
      var navn = form.elements.navn;
      var epost = form.elements.epost;
      var navnTomt = !navn.value.trim();
      var epostTomt = !epost.value.trim();
      var epostFeil = !epostTomt && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim());
      merk(navn, navnTomt);
      merk(epost, epostTomt || epostFeil);
      if (navnTomt || epostTomt) {
        visFeil(3, 'Vi trenger navn og e-post for å kunne svare deg.');
        (navnTomt ? navn : epost).focus();
        return false;
      }
      if (epostFeil) {
        visFeil(3, 'E-postadressen ser ikke helt riktig ut. Sjekk den en gang til.');
        epost.focus();
        return false;
      }
      visFeil(3, '');
      return true;
    }
    visFeil(n, '');
    return true;
  }

  $$('[data-neste]', form).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      if (gyldigSteg(steg) && steg < 3) visSteg(steg + 1);
    });
  });

  $$('[data-forrige]', form).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      visFeil(steg, '');
      if (steg > 1) visSteg(steg - 1);
    });
  });

  form.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && steg < 3) {
      event.preventDefault();
      if (gyldigSteg(steg)) visSteg(steg + 1);
    }
  });

  function nyReferanse() {
    var nr = 1000 + Math.floor(Math.random() * 9000);
    return 'AA-' + new Date().getFullYear() + '-' + nr;
  }

  function sammendrag(route, ref) {
    var rader = [];
    rader.push(['Referanse', ref]);
    rader.push(['Type', typer[valgtType()] || 'Annet']);
    if (form.elements.sted.value.trim()) rader.push(['Sted', form.elements.sted.value.trim()]);
    if (form.elements.areal.value.trim()) rader.push(['Areal', form.elements.areal.value.trim() + ' m²']);
    rader.push(['Oppstart', form.elements.oppstart.value]);
    rader.push(['Navn', form.elements.navn.value.trim()]);
    rader.push(['E-post', form.elements.epost.value.trim()]);
    if (form.elements.telefon.value.trim()) rader.push(['Telefon', form.elements.telefon.value.trim()]);
    if (form.elements.firma.value.trim()) rader.push(['Virksomhet', form.elements.firma.value.trim()]);
    if (form.elements.merknad.value.trim()) rader.push(['Merknad', form.elements.merknad.value.trim()]);
    rader.push(['Mottaker', route.navn + ' — ' + route.rolle]);
    return rader;
  }

  function brevtekst(rader) {
    return rader.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!gyldigSteg(3)) return;

    var route = ruting[valgtType()] || ruting.annet;
    var ref = nyReferanse();
    var rader = sammendrag(route, ref);
    siste = { referanse: ref, mottaker: route.navn, tekst: brevtekst(rader) };

    $('#kvRef').textContent = ref;
    $('#kvNavn').textContent = form.elements.navn.value.trim().split(' ')[0] || '';
    $('#kvMottaker').textContent = route.navn + ' (' + route.rolle + ')';

    var liste = $('#kvSammendrag');
    liste.innerHTML = '';
    rader.forEach(function (r) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = r[0];
      dd.textContent = r[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });

    var emne = 'Prosjektforespørsel ' + ref + ' — ' + (typer[valgtType()] || 'Annet');
    var kropp = 'Hei ' + route.navn.split(' ')[0] + ',\n\n'
      + 'Her er en prosjektforespørsel fra nettsiden:\n\n'
      + siste.tekst + '\n\n'
      + 'Mvh\n' + form.elements.navn.value.trim();
    $('#kvMail').setAttribute(
      'href',
      'mailto:' + route.mail + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
    );

    form.hidden = true;
    stegind.hidden = true;
    kvittering.hidden = false;
    kvittering.setAttribute('tabindex', '-1');
    kvittering.focus({ preventScroll: true });
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  var kopier = $('#kvKopier');
  if (kopier) {
    kopier.addEventListener('click', function () {
      if (!siste) return;
      var tekst = 'Prosjektforespørsel ' + siste.referanse + '\nTil: ' + siste.mottaker + '\n\n' + siste.tekst;
      var meld = function (ok) {
        kopier.textContent = ok ? 'Kopiert' : 'Kunne ikke kopiere';
        window.setTimeout(function () { kopier.textContent = 'Kopier sammendrag'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () { meld(true); }, function () { meld(false); });
      } else {
        meld(false);
      }
    });
  }

  var ny = $('#kvNy');
  if (ny) {
    ny.addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      stegind.hidden = false;
      kvittering.hidden = true;
      siste = null;
      visFeil(1, '');
      visFeil(2, '');
      visFeil(3, '');
      oppdaterRuting();
      visSteg(1);
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
})();
