const b=document.getElementById('burger'),l=document.getElementById('links');
if(b&&l){b.addEventListener('click',()=>{const o=l.classList.toggle('open');b.setAttribute('aria-expanded',o);});
l.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>l.classList.remove('open')));}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
const f=document.getElementById('leadForm'),n=document.getElementById('note');
if(f){f.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f).entries());
const body=['Navn: '+(d.name||''),'E-post: '+(d.email||''),'Virksomhet: '+(d.company||''),'',''+(d.message||'')].join('\n');
window.location.href='mailto:nilsarne@digify.no?subject='+encodeURIComponent('Henvendelse fra nettsiden')+'&body='+encodeURIComponent(body);
n.textContent='Åpner e-postklienten din med feltene fylt inn.';});}
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
