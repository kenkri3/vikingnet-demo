// Galik Bygg — interactions

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
document.querySelectorAll('.feature, .svc, .gal, .step, .om-media, .om-copy').forEach((el) => {
  el.classList.add('reveal');
  io.observe(el);
});

// Contact form — static hosting has no backend, so hand off to the mail client.
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const body = [
    'Navn: ' + (data.name || ''),
    'Telefon: ' + (data.phone || ''),
    'E-post: ' + (data.email || ''),
    'Gjelder: ' + (data.interest || ''),
    '',
    (data.message || ''),
  ].join('\n');

  window.location.href = 'mailto:info@galikbygg.no'
    + '?subject=' + encodeURIComponent('Henvendelse fra nettsiden — ' + (data.interest || 'tilbud'))
    + '&body=' + encodeURIComponent(body);

  note.className = 'form-note ok';
  note.textContent = 'Åpner e-postklienten din med opplysningene fylt inn.';
});

// Year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
