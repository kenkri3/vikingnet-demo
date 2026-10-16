// Kontaktskjema: statisk hosting har ingen backend — faller tilbake på mailto.
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const body = [
      'Navn: ' + (d.name || ''),
      'E-post: ' + (d.email || ''),
      'Telefon: ' + (d.phone || ''),
      'Gjelder: ' + (d.topic || ''),
      '',
      (d.message || ''),
    ].join('\n');
    window.location.href = 'mailto:svein.berg@mantinia.no?subject=' + encodeURIComponent('Henvendelse fra nettsiden — ' + (d.topic || 'henvendelse')) + '&body=' + encodeURIComponent(body);
    note.className = 'form-note ok';
    note.textContent = 'Åpner e-postklienten din med opplysningene fylt inn.';
  });
}

// Mobilmeny
const t = document.getElementById('navToggle');
const m = document.getElementById('navMobile');
if (t && m) {
  t.addEventListener('click', () => {
    const open = m.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    t.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  });
  m.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    m.classList.remove('open'); t.setAttribute('aria-expanded','false');
  }));
}

// Nav-skygge ved scroll
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
}

// Reveal
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
