(function(){'use strict';
var f=document.getElementById('skjema'),st=document.getElementById('status');
if(f){f.addEventListener('submit',function(e){e.preventDefault();
var n=f.elements.navn,ep=f.elements.epost,m=f.elements.melding,t=f.elements.telefon.value.trim(),mangler=false;
[n,ep,m].forEach(function(x){var tom=x.value.trim()==='';x.setAttribute('aria-invalid',tom?'true':'false');if(tom)mangler=true;});
if(ep.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep.value.trim())){ep.setAttribute('aria-invalid','true');mangler=true;}
if(mangler){st.textContent='Fyll ut navn, e-post og hva det gjelder.';return;}
var linjer=['Navn: '+n.value.trim(),'E-post: '+ep.value.trim(),t?'Telefon: '+t:'','',m.value.trim()].filter(Boolean);
window.location.href='mailto:'+"post@amesto.no"+'?subject='+encodeURIComponent('Henvendelse fra nettsiden')+'&body='+encodeURIComponent(linjer.join('\n'));
st.textContent='E-postprogrammet åpnes med opplysningene fylt inn.';});}
var ar=document.getElementById('ar');if(ar)ar.textContent=String(new Date().getFullYear());
})();
