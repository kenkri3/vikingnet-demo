/*
  Search People — små, ærlige skript:
  1) mobilmeny, 2) forespørsel i tre steg med oppsummering og mailto-fallback.
  Alt innhold er synlig uten JavaScript; ingenting sendes eller lagres noe sted.
*/

document.documentElement.classList.add('js');

const reduserBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Mobilmeny ---------- */

const menuBtn = document.getElementById('menuBtn');
const meny = document.getElementById('meny');

if (menuBtn && meny) {
  const settMeny = (aapne) => {
    meny.classList.toggle('is-open', aapne);
    menuBtn.setAttribute('aria-expanded', String(aapne));
    menuBtn.setAttribute('aria-label', aapne ? 'Lukk meny' : 'Åpne meny');
  };

  menuBtn.addEventListener('click', () => {
    settMeny(!meny.classList.contains('is-open'));
  });

  meny.addEventListener('click', (hendelse) => {
    if (hendelse.target.closest('a')) settMeny(false);
  });

  document.addEventListener('keydown', (hendelse) => {
    if (hendelse.key === 'Escape' && meny.classList.contains('is-open')) {
      settMeny(false);
      menuBtn.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 940) settMeny(false);
  });
}

/* ---------- 2. Forespørsel i tre steg ---------- */

const skjema = document.getElementById('foresporsel');

if (skjema) {
  const paneler = Array.from(skjema.querySelectorAll('[data-panel]'));
  const punkter = Array.from(skjema.querySelectorAll('.steg li'));
  const feilboks = document.getElementById('skjemaFeil');
  const tilbakeKnapp = document.getElementById('tilbake');
  const nesteKnapp = document.getElementById('neste');
  const kvittering = document.getElementById('kvittering');
  const kvitteringListe = document.getElementById('kvitteringListe');
  const sendEpost = document.getElementById('sendEpost');
  const startPanytt = document.getElementById('startPanytt');

  let steg = 0;

  const navnFelt = document.getElementById('navn');
  const bedriftFelt = document.getElementById('bedrift');
  const epostFelt = document.getElementById('epost');
  const telefonFelt = document.getElementById('telefon');
  const meldingFelt = document.getElementById('melding');

  const skjulFeil = () => {
    feilboks.hidden = true;
    feilboks.textContent = '';
  };

  const visFeil = (melding) => {
    feilboks.textContent = melding;
    feilboks.hidden = false;
  };

  const visSteg = (nyttSteg) => {
    steg = nyttSteg;

    paneler.forEach((panel, indeks) => {
      panel.hidden = indeks !== nyttSteg;
    });

    punkter.forEach((punkt, indeks) => {
      punkt.classList.toggle('is-aktiv', indeks === nyttSteg);
      punkt.classList.toggle('is-ferdig', indeks < nyttSteg);
      if (indeks === nyttSteg) {
        punkt.setAttribute('aria-current', 'step');
      } else {
        punkt.removeAttribute('aria-current');
      }
    });

    tilbakeKnapp.hidden = nyttSteg === 0;
    nesteKnapp.textContent = nyttSteg === paneler.length - 1 ? 'Fullfør' : 'Neste';
    skjulFeil();

    if (nyttSteg > 0) {
      const forste = paneler[nyttSteg].querySelector('input, textarea');
      if (forste) forste.focus({ preventScroll: true });
    }
  };

  const valider = (indeks) => {
    const panel = paneler[indeks];

    if (indeks < paneler.length - 1) {
      const valgt = panel.querySelector('input[type="radio"]:checked');
      return valgt ? '' : 'Velg ett av alternativene for å gå videre.';
    }

    if (!navnFelt.value.trim()) return 'Fyll inn navnet ditt.';
    if (!bedriftFelt.value.trim()) return 'Fyll inn hvilken bedrift du skriver fra.';

    const epost = epostFelt.value.trim();
    if (!epost) return 'Fyll inn e-postadressen din.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) {
      return 'E-postadressen ser ikke helt riktig ut — sjekk den og prøv igjen.';
    }
    return '';
  };

  const hentVerdier = () => {
    const data = new FormData(skjema);
    const tekst = (navnet) => String(data.get(navnet) || '').trim();
    return {
      tjeneste: tekst('tjeneste'),
      niva: tekst('niva'),
      navn: tekst('navn'),
      bedrift: tekst('bedrift'),
      epost: tekst('epost'),
      telefon: tekst('telefon'),
      melding: tekst('melding'),
    };
  };

  const fullfor = () => {
    const verdier = hentVerdier();
    const rader = [
      ['Tjeneste', verdier.tjeneste],
      ['Nivå', verdier.niva],
      ['Navn', verdier.navn],
      ['Bedrift', verdier.bedrift],
      ['E-post', verdier.epost],
    ];

    if (verdier.telefon) rader.push(['Telefon', verdier.telefon]);
    if (verdier.melding) rader.push(['Om stillingen', verdier.melding]);

    kvitteringListe.textContent = '';
    rader.forEach(([etikett, innhold]) => {
      const dt = document.createElement('dt');
      dt.textContent = etikett;
      const dd = document.createElement('dd');
      dd.textContent = innhold;
      kvitteringListe.append(dt, dd);
    });

    const emne = `Forespørsel: ${verdier.tjeneste} – ${verdier.niva}`;
    const linjer = [
      `Tjeneste: ${verdier.tjeneste}`,
      `Nivå: ${verdier.niva}`,
      '',
      `Navn: ${verdier.navn}`,
      `Bedrift: ${verdier.bedrift}`,
      `E-post: ${verdier.epost}`,
    ];

    if (verdier.telefon) linjer.push(`Telefon: ${verdier.telefon}`);
    if (verdier.melding) linjer.push('', 'Om stillingen:', verdier.melding);

    sendEpost.href =
      'mailto:anette@searchpeople.no' +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(linjer.join('\r\n'));

    skjema.hidden = true;
    kvittering.hidden = false;
    kvittering.focus({ preventScroll: true });
    kvittering.scrollIntoView({
      block: 'nearest',
      behavior: reduserBevegelse ? 'auto' : 'smooth',
    });
  };

  skjema.addEventListener('submit', (hendelse) => {
    hendelse.preventDefault();

    const melding = valider(steg);
    if (melding) {
      visFeil(melding);
      const kontroll = paneler[steg].querySelector('input, textarea');
      if (kontroll) kontroll.focus({ preventScroll: true });
      return;
    }

    if (steg < paneler.length - 1) {
      visSteg(steg + 1);
    } else {
      fullfor();
    }
  });

  tilbakeKnapp.addEventListener('click', () => {
    if (steg > 0) visSteg(steg - 1);
  });

  skjema.addEventListener('change', skjulFeil);
  skjema.addEventListener('input', skjulFeil);

  startPanytt.addEventListener('click', () => {
    skjema.reset();
    kvittering.hidden = true;
    skjema.hidden = false;
    visSteg(0);
    const forsteValg = paneler[0].querySelector('input[type="radio"]');
    if (forsteValg) forsteValg.focus({ preventScroll: true });
  });

  visSteg(0);
  [navnFelt, bedriftFelt, epostFelt, telefonFelt, meldingFelt].forEach((felt) => {
    if (felt) felt.addEventListener('keydown', (hendelse) => {
      if (hendelse.key === 'Enter' && felt.tagName !== 'TEXTAREA') {
        hendelse.preventDefault();
        nesteKnapp.click();
      }
    });
  });
}
