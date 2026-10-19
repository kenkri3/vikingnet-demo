// Ensure — interactions
const navToggle=document.getElementById('navToggle');
const navMobile=document.getElementById('navMobile');
if(navToggle&&navMobile){
  navToggle.addEventListener('click',()=>{
    const open=navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded',open?'true':'false');
  });
  navMobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navMobile.classList.remove('open')));
}
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('.card,.split,.quote,.section-head').forEach(el=>{el.classList.add('reveal');io.observe(el);});
const form=document.getElementById('leadForm');
const note=document.getElementById('formNote');
if(form){
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form).entries());
    const body=['Navn: '+(d.name||''),'E-post: '+(d.email||''),'Telefon: '+(d.phone||''),'Emne: '+(d.interest||''),'',' '+(d.message||'')].join('\n');
    window.location.href='mailto:tron.even.skyberg@ensure.no?subject='+encodeURIComponent('Henvendelse fra nettsiden — '+(d.interest||'rådgivning'))+'&body='+encodeURIComponent(body);
    note.className='form-note ok';
    note.textContent='Åpner e-postklienten din med opplysningene fylt inn.';
  });
}
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
