// ===== Vikingnet demo — interactions =====

// ---- Hero live log ----
const heroLines = [
  'agent: skanner innboks for nye henvendelser…',
  'agent: 3 nye leads funnet · beriker med selskapsdata',
  'agent: kvalifiserer mot ICP — 2 godkjent, 1 avvist',
  'agent: booker møte i kalender · varsler selger',
  'agent: logger til CRM · ferdig ✓',
];
const heroLog = document.getElementById('heroLog');
let hi = 0;
function heroTick() {
  if (!heroLog) return;
  const d = document.createElement('div');
  d.textContent = '› ' + heroLines[hi % heroLines.length];
  heroLog.appendChild(d);
  if (heroLog.children.length > 4) heroLog.removeChild(heroLog.firstChild);
  hi++;
}
heroTick();
setInterval(heroTick, 2600);

// ---- Agent demo ----
const script = [
  { t: 0,    cls: 'info', txt: '› Ny henvendelse mottatt fra skjema: "Nordvik Entreprenør AS"' },
  { t: 700,  cls: 't',    txt: '  tenker… (DeepSeek V4.1 Flash)' },
  { t: 1500, cls: 'pur',  txt: '  → verktøy: enrich_company("Nordvik Entreprenør AS")' },
  { t: 2400, cls: 'ok',   txt: '  ✓ Org.nr 912 345 678 · 24 ansatte · bygg & anlegg · omsetning 41 MNOK' },
  { t: 3200, cls: 'pur',  txt: '  → verktøy: score_lead(ICP="entreprenør 10-100 ansatte")' },
  { t: 4000, cls: 'ok',   txt: '  ✓ Score 87/100 — høy prioritet (treffer ICP, aktiv i anbud)' },
  { t: 4800, cls: 'pur',  txt: '  → verktøy: check_calendar("neste 5 virkedager")' },
  { t: 5600, cls: 'ok',   txt: '  ✓ Ledig: torsdag 14:00 og fredag 09:30' },
  { t: 6400, cls: 'pur',  txt: '  → verktøy: send_email(til=kontakt, forslag=2 tidspunkt)' },
  { t: 7300, cls: 'ok',   txt: '  ✓ E-post sendt med personlig tilpasning' },
  { t: 8000, cls: 'pur',  txt: '  → verktøy: create_crm_deal(stage="Møte booket")' },
  { t: 8700, cls: 'ok',   txt: '  ✓ Deal opprettet · oppfølging satt til +3 dager' },
  { t: 9400, cls: 'warn', txt: '  ⚑ Varsel til selger: "Varm lead — ring innen 24t"' },
  { t: 10200, cls: 'info', txt: '› Kjøring fullført. 6 verktøykall, 0 menneskelige inngrep.' },
];

const consoleEl = document.getElementById('console');
const runBtn = document.getElementById('runAgent');
const resetBtn = document.getElementById('resetAgent');
const statusEl = document.getElementById('agentStatus');
const mTime = document.getElementById('mTime');
const mCalls = document.getElementById('mCalls');
let timers = [];
let running = false;

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function reset() {
  clearTimers();
  running = false;
  consoleEl.innerHTML = '';
  statusEl.textContent = 'Klar';
  mTime.textContent = '0,0 s';
  mCalls.textContent = '0';
  runBtn.disabled = false;
  runBtn.textContent = 'Kjør agenten';
}

function run() {
  if (running) return;
  reset();
  running = true;
  runBtn.disabled = true;
  runBtn.textContent = 'Kjører…';
  statusEl.textContent = 'Arbeider…';
  let calls = 0;

  script.forEach((step) => {
    const id = setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'ln ' + step.cls;
      d.textContent = step.txt;
      consoleEl.appendChild(d);
      consoleEl.scrollTop = consoleEl.scrollHeight;
      if (step.txt.includes('verktøy:')) { calls++; mCalls.textContent = calls; }
      mTime.textContent = (step.t / 1000).toFixed(1).replace('.', ',') + ' s';
      if (step === script[script.length - 1]) {
        running = false;
        runBtn.disabled = false;
        runBtn.textContent = 'Kjør igjen';
        statusEl.textContent = 'Fullført ✓';
      }
    }, step.t);
    timers.push(id);
  });
}

runBtn.addEventListener('click', run);
resetBtn.addEventListener('click', reset);

// ---- ROI calculator ----
const inputs = {
  people: document.getElementById('cPeople'),
  hours: document.getElementById('cHours'),
  rate: document.getElementById('cRate'),
  auto: document.getElementById('cAuto'),
};
const outs = {
  people: document.getElementById('oPeople'),
  hours: document.getElementById('oHours'),
  rate: document.getElementById('oRate'),
  auto: document.getElementById('oAuto'),
};
const res = {
  year: document.getElementById('rYear'),
  hours: document.getElementById('rHours'),
  month: document.getElementById('rMonth'),
  three: document.getElementById('rThree'),
  payback: document.getElementById('rPayback'),
};

const nf = new Intl.NumberFormat('nb-NO');

function calc() {
  const people = +inputs.people.value;
  const hours = +inputs.hours.value;
  const rate = +inputs.rate.value;
  const auto = +inputs.auto.value / 100;

  outs.people.textContent = people;
  outs.hours.textContent = hours + ' t';
  outs.rate.textContent = nf.format(rate) + ' kr';
  outs.auto.textContent = Math.round(auto * 100) + ' %';

  const hoursYear = people * hours * 44 * auto;      // 44 arbeidsuker
  const valueYear = hoursYear * rate;
  const valueMonth = valueYear / 12;

  res.year.textContent = nf.format(Math.round(valueYear / 1000) * 1000) + ' kr';
  res.hours.textContent = nf.format(Math.round(hoursYear)) + ' t';
  res.month.textContent = nf.format(Math.round(valueMonth / 1000) * 1000) + ' kr';
  res.three.textContent = nf.format(Math.round((valueYear * 3) / 1000) * 1000) + ' kr';

  // Enkel tilbakebetaling: antar etablering 49 000 + drift 1 490/mnd
  const setup = 49000, monthly = 1490;
  const monthlyNet = valueMonth - monthly;
  if (monthlyNet > 0) {
    const months = Math.ceil(setup / monthlyNet);
    res.payback.textContent = months <= 1 ? 'Under 1 måned' : months + ' måneder';
  } else {
    res.payback.textContent = 'Regn sammen med oss';
  }
}

Object.values(inputs).forEach((el) => el.addEventListener('input', calc));
calc();

// ---- Lead form -> /gumloop/action/lead ----
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');
const submitBtn = document.getElementById('leadSubmit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sender…';
  note.className = 'form-note muted small';
  note.textContent = 'Sender henvendelsen…';

  try {
    const r = await fetch('/gumloop/action/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const out = await r.json();
    if (out && out.ok) {
      note.className = 'form-note ok';
      note.textContent = 'Takk! Henvendelsen er sendt — vi svarer innen én virkedag.';
      form.reset();
    } else {
      throw new Error((out && out.error) || 'Ukjent feil');
    }
  } catch (err) {
    // Static hosting (GitHub Pages) has no backend — fall back to the visitor's mail client.
    const body = [
      'Navn: ' + (data.name || ''),
      'Bedrift: ' + (data.company || ''),
      'E-post: ' + (data.email || ''),
      'Telefon: ' + (data.phone || ''),
      'Interesse: ' + (data.interest || ''),
      '',
      (data.message || ''),
    ].join('\n');
    window.location.href = 'mailto:hei@vikingnet.no'
      + '?subject=' + encodeURIComponent('Henvendelse fra ' + (data.company || data.name || 'nettsiden'))
      + '&body=' + encodeURIComponent(body);
    note.className = 'form-note ok';
    note.textContent = 'Åpner e-postklienten din med opplysningene fylt inn.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send henvendelse';
  }
});

// ---- Year ----
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
