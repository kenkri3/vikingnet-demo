const b=document.getElementById('burger'),l=document.getElementById('links');
if(b&&l){b.addEventListener('click',()=>{const o=l.classList.toggle('open');b.setAttribute('aria-expanded',o);});
l.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>l.classList.remove('open')));}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
const f=document.getElementById('leadForm'),n=document.getElementById('note');
if(f){f.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f).entries());
const body=['Name: '+(d.name||''),'Company: '+(d.company||''),'E-mail: '+(d.email||''),'',''+(d.message||'')].join('\n');
window.location.href='mailto:finn.nilsen@sojama.com?subject='+encodeURIComponent('Enquiry from website')+'&body='+encodeURIComponent(body);
n.textContent='Opening your e-mail client with the fields filled in.';});}
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
