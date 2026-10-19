const t=document.getElementById('burger'),m=document.getElementById('mobile');
if(t&&m){t.addEventListener('click',()=>{const o=m.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false');});
m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')));}
const f=document.getElementById('leadForm'),n=document.getElementById('formNote');
if(f){f.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f).entries());
const b=['Navn: '+(d.name||''),'Firma: '+(d.company||''),'Telefon: '+(d.phone||''),'E-post: '+(d.email||''),'','Jeg er: '+(d.interest||''),'',(d.message||'')].join('\n');
window.location.href='mailto:post@all10.no?subject='+encodeURIComponent('Henvendelse fra nettsiden')+'&body='+encodeURIComponent(b);
n.className='note ok';n.textContent='Åpner e-postklienten din med opplysningene fylt inn.';});}
const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();