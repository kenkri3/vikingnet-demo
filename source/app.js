// Source demo — interactions
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.card,.split-media,.split-copy,.sec-head,.fact').forEach(el=>{el.classList.add('reveal');io.observe(el)});

const t=document.getElementById('navToggle'),m=document.getElementById('navMobile');
if(t&&m){t.addEventListener('click',()=>{const o=m.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false')});
m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')))}

const f=document.getElementById('leadForm'),n=document.getElementById('formNote');
if(f){f.addEventListener('submit',(e)=>{e.preventDefault();
  const d=Object.fromEntries(new FormData(f).entries());
  const body=['Navn: '+(d.name||''),'E-post: '+(d.email||''),'Firma: '+(d.company||''),'',''+(d.message||'')].join('\n');
  window.location.href='mailto:post@source.no?subject='+encodeURIComponent('Henvendelse fra nettsiden')+'&body='+encodeURIComponent(body);
  if(n)n.textContent='E-postklienten din åpnes med meldingen klar.'})}

const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
