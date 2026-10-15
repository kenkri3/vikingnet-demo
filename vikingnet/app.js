// Vikingnet — interactions

// Nav turns solid once you scroll past the hero
const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');
function syncNav() {
  const past = window.scrollY > (hero.offsetHeight - 90);
  nav.classList.toggle('on-hero', !past);
}
syncNav();
window.addEventListener('scroll', syncNav, { passive: true });
window.addEventListener('resize', syncNav);

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.svc, .step, .price, .choice, .split-media, .stat').forEach((el) => {
  el.classList.add('reveal');
  io.observe(el);
});

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const open = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  });
  navMobile.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Contact form — static hosting has no backend, so hand off to the mail client.
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const body = [
    'Navn: ' + (data.name || ''),
    'Firma: ' + (data.company || ''),
    'E-post: ' + (data.email || ''),
    'Gjelder: ' + (data.topic || ''),
    '',
    (data.message || ''),
  ].join('\n');
  const url = 'mailto:hei@vikingnet.no?subject=' +
    encodeURIComponent('Henvendelse fra ' + (data.company || data.name || 'nettsiden')) +
    '&body=' + encodeURIComponent(body);
  window.location.href = url;
  note.textContent = 'Takk! E-postklienten din åpnes med meldingen klar til sending.';
});
