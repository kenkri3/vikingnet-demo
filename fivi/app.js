const nav=document.getElementById('nav');
const burger=document.getElementById('burger');
const links=document.getElementById('navLinks');
if(burger&&links){burger.addEventListener('click',()=>{const o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));}
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const form=document.getElementById('leadForm');
const note=document.getElementById('formNote');
if(form){form.addEventListener('submit',(e)=>{e.preventDefault();
const d=Object.fromEntries(new FormData(form).entries());
const body=['Navn: '+(d.name||''),'E-post: '+(d.email||''),'Telefon: '+(d.phone||''),'',' '+(d.message||'')].join('\n');
window.location.href='mailto:fivi@fivi.no?subject='+encodeURIComponent('Henvendelse fra nettsiden')+'&body='+encodeURIComponent(body);
note.textContent='Åpner e-postklienten din med feltene fylt inn.';});}
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
