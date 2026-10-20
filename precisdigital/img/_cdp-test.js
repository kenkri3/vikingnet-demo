/*
  Kort CDP-skript: åpner demoen i ekte Chrome, tester de to interaksjonene
  (svarpanelet og kontaktskjemaet) og tar skjermbilder i 390/768/1440.
  Skriver resultatet som JSON til stdout.
*/
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:4173/precisdigital/';
const OUT = 'C:\\Users\\glosl\\.dsh\\aichat-ops\\state\\bilder';
const PORT = 9334;

const sove = (ms) => new Promise((r) => setTimeout(r, ms));

async function ventPaJson(url, forsok = 40) {
  for (let i = 0; i < forsok; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (feil) {
      /* ikke klar ennå */
    }
    await sove(250);
  }
  throw new Error('fikk ikke svar fra ' + url);
}

async function main() {
  const profil = path.join(process.env.TEMP || '.', 'cdp-profil-' + Date.now());
  const barn = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--remote-debugging-port=' + PORT,
      '--user-data-dir=' + profil,
      'about:blank'
    ],
    { stdio: 'ignore', detached: false }
  );

  const resultat = { tester: {}, bilder: [] };

  try {
    const mal = await ventPaJson('http://127.0.0.1:' + PORT + '/json/new?about:blank', 60);
    // /json/new krever PUT i nyere Chrome; fall tilbake til /json/list.
    let side = mal;
    if (!side || !side.webSocketDebuggerUrl) {
      const liste = await ventPaJson('http://127.0.0.1:' + PORT + '/json/list');
      side = liste.find((t) => t.type === 'page');
    }

    const ws = new WebSocket(side.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = (e) => rej(new Error('ws: ' + (e.message || 'feil')));
    });

    let id = 0;
    const venter = new Map();
    ws.onmessage = (event) => {
      const melding = JSON.parse(event.data);
      if (melding.id && venter.has(melding.id)) {
        const { res, rej } = venter.get(melding.id);
        venter.delete(melding.id);
        if (melding.error) rej(new Error(melding.error.message));
        else res(melding.result);
      }
    };

    const send = (method, params = {}) =>
      new Promise((res, rej) => {
        id += 1;
        venter.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });

    const evaluer = async (uttrykk) => {
      const r = await send('Runtime.evaluate', {
        expression: uttrykk,
        awaitPromise: true,
        returnByValue: true
      });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + uttrykk);
      return r.result.value;
    };

    await send('Page.enable');
    await send('Runtime.enable');

    const settBredde = async (bredde, hoyde = 900) => {
      await send('Emulation.setDeviceMetricsOverride', {
        width: bredde,
        height: hoyde,
        deviceScaleFactor: 1,
        mobile: bredde < 500
      });
    };

    const skjermbilde = async (navn) => {
      const r = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });
      const fil = path.join(OUT, navn);
      fs.writeFileSync(fil, Buffer.from(r.data, 'base64'));
      resultat.bilder.push({ fil, bytes: fs.statSync(fil).size });
    };

    await settBredde(1440, 1000);
    await send('Page.navigate', { url: URL });
    await sove(2500);

    resultat.tester.lastet = await evaluer('document.readyState');
    resultat.tester.tittel = await evaluer('document.title');
    resultat.tester.sprak = await evaluer('document.documentElement.lang');
    resultat.tester.bilderUtenAlt = await evaluer(
      "[...document.images].filter(i => !i.alt).length"
    );
    resultat.tester.brutteBilder = await evaluer(
      "[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.currentSrc)"
    );
    resultat.tester.fontLastet = await evaluer('document.fonts.status');

    /* 1. Svarpanelet: klikk på en chip, les svaret. */
    const forst = await evaluer('document.querySelectorAll("#svar-logg .msg").length');
    await evaluer('document.querySelector("[data-sporsmal=\'Hvor sitter dere?\']").click()');
    await sove(900);
    const etterChip = await evaluer(
      '[...document.querySelectorAll("#svar-logg .msg")].map(m => m.textContent)'
    );
    resultat.tester.chip = { forst, etter: etterChip };

    /* 2. Fritt spørsmål om pris — skal ikke dikte opp en pris. */
    await evaluer(`(() => {
      const f = document.getElementById('svar-felt');
      f.value = 'Hva koster en kampanje?';
      document.getElementById('svar-skjema').dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
    })()`);
    await sove(900);
    resultat.tester.prisSvar = await evaluer(
      '[...document.querySelectorAll("#svar-logg .msg")].slice(-1)[0].textContent'
    );

    /* 3. Kontaktskjema: tom innsending skal gi feil, utfylt skal gi kvittering. */
    await evaluer('document.getElementById("kontakt-skjema").requestSubmit()');
    await sove(300);
    resultat.tester.tomtSkjema = await evaluer(
      '[...document.querySelectorAll(".field__error")].map(p => p.textContent).filter(Boolean)'
    );

    await evaluer(`(() => {
      const sett = (id, verdi) => {
        const el = document.getElementById(id);
        el.value = verdi;
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
      };
      sett('navn', 'Kari Testesen');
      sett('epost', 'kari@eksempelbedrift.no');
      sett('telefon', '912 34 567');
      sett('melding', 'Vi vil måle effekten av mediekjøpet vårt bedre.');
      document.getElementById('kontakt-skjema').requestSubmit();
    })()`);
    await sove(500);
    resultat.tester.kvittering = await evaluer(`(() => {
      const k = document.getElementById('kvittering');
      return {
        synlig: !k.hidden,
        skjemaSkjult: document.getElementById('kontakt-skjema').hidden,
        referanse: document.getElementById('kvittering-ref').textContent,
        rader: document.getElementById('kvittering-innhold').textContent.replace(/\\s+/g, ' ').trim()
      };
    })()`);

    /* 4. Mobilmeny i 390 px. */
    await settBredde(390, 844);
    await sove(400);
    resultat.tester.mobilmeny = await evaluer(`(() => {
      const nav = document.getElementById('meny');
      const knapp = document.getElementById('menyKnapp');
      const lukket = getComputedStyle(nav).display;
      knapp.click();
      const apen = getComputedStyle(nav).display;
      const hoyde = document.querySelector('.nav a').getBoundingClientRect().height;
      knapp.click();
      return { lukket, apen, lenkehoyde: hoyde, aria: knapp.getAttribute('aria-expanded') };
    })()`);

    resultat.tester.overflyt = await evaluer(`(() => {
      const bredder = [360, 390, 768, 1024, 1440];
      return bredder.map(b => ({ b, over: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    })()`);

    await settBredde(390, 900);
    await sove(500);
    await skjermbilde('cdp-390.png');
    await settBredde(768, 900);
    await sove(500);
    await skjermbilde('cdp-768.png');
    await settBredde(1440, 900);
    await sove(500);
    await skjermbilde('cdp-1440.png');

    ws.close();
  } finally {
    try {
      barn.kill();
    } catch (feil) {
      /* ignorer */
    }
  }

  console.log(JSON.stringify(resultat, null, 2));
}

main().catch((feil) => {
  console.error('FEIL: ' + (feil && feil.stack ? feil.stack : feil));
  process.exit(1);
});
