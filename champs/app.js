
// Felles interaksjon for demosiden
const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');
function syncNav(){
  if(!nav||!hero) return;
  const past = window.scrollY > (hero.offsetHeight - 90);
  nav.classList.toggle('on-hero', !past);
  nav.classList.toggle('solid', past);
}
syncNav();
window.addEventListener('scroll', syncNav, {passive:true});
window.addEventListener('resize', syncNav);

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const t = document.getElementById('navToggle');
const m = document.getElementById('navMobile');
if(t&&m){
  t.addEventListener('click',()=>{
    const open = m.classList.toggle('open');
    t.setAttribute('aria-expanded', open?'true':'false');
  });
  m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')));
}

const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');
if(form){
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const body = ['Navn: '+(d.name||''),'E-post: '+(d.email||''),'Telefon: '+(d.phone||''),
      'Gjelder: '+(d.interest||''),'',(d.message||'')].join('\n');
    window.location.href = 'mailto:'+form.dataset.mail
      + '?subject='+encodeURIComponent('Henvendelse fra nettsiden')
      + '&body='+encodeURIComponent(body);
    note.className='form-note ok';
    note.textContent='Åpner e-postklienten din med opplysningene fylt inn.';
  });
}
const y = document.getElementById('year');
if(y) y.textContent = new Date().getFullYear();
