// Galik Bygg — interactions

// Progress bars animate in on load
window.addEventListener('load', () => {
  document.querySelectorAll('.bar i').forEach((el, i) => {
    const target = el.style.getPropertyValue('--w');
    el.style.setProperty('--w', '0%');
    setTimeout(() => el.style.setProperty('--w', target), 150 + i * 120);
  });
});

// Contact form — static hosting has no backend, so hand off to the mail client.
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');
const submitBtn = document.getElementById('leadSubmit');

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
