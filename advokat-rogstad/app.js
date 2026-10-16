document.addEventListener('DOMContentLoaded',function(){
  var b=document.querySelector('.burger'),m=document.querySelector('nav ul');
  if(b&&m){b.addEventListener('click',function(){m.classList.toggle('open');b.setAttribute('aria-expanded',m.classList.contains('open'));});}
  var f=document.querySelector('form');
  if(f){f.addEventListener('submit',function(e){
    e.preventDefault();
    var n=(f.navn.value||'').trim(),em=(f.epost.value||'').trim(),om=(f.omrade.value||''),t=(f.melding.value||'').trim();
    if(!n||!em||!t){alert('Fyll ut navn, e-post og melding.');return;}
    var body=t+'\n\nOmr\u00e5de: '+om+'\n'+n+'\n'+em;
    window.location.href='mailto:post@advokat-rogstad.no?subject='+encodeURIComponent('Henvendelse fra '+n)+'&body='+encodeURIComponent(body);
  });}
});
