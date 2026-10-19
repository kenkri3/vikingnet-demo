// Nordic Care — interactions
const burger=document.getElementById('burger'),links=document.getElementById('navLinks');
if(burger&&links){burger.addEventListener('click',()=>{const o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const f=document.getElementById('contactForm');
if(f){f.addEventListener('submit',e=>{e.preventDefault();const g=id=>document.getElementById(id).value.trim();
const body=`Navn: ${g('navn')}\nE-post: ${g('epost')}\nVirksomhet: ${g('enhet')}\nGjelder: ${document.getElementById('type').value}\n\n${g('melding')}`;
window.location.href='mailto:bestilling@nordiccare.no?subject='+encodeURIComponent('Henvendelse via nettsiden')+'&body='+encodeURIComponent(body);});}
