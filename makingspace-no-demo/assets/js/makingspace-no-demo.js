(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("romfelt");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null,boks=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);
if(!boks.length){
boks=[{x:0.06,y:0.10,w:0.30,h:0.34,d:0.0},{x:0.40,y:0.10,w:0.30,h:0.20,d:0.35},{x:0.74,y:0.10,w:0.20,h:0.34,d:0.55},
      {x:0.06,y:0.50,w:0.44,h:0.36,d:0.8},{x:0.54,y:0.36,w:0.40,h:0.50,d:0.2}];
}
return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
boks.forEach(function(b,i){
var syn=Math.min(1,Math.max(0,(t*1.1-b.d)));
if(syn<=0)return;
var x=b.x*W,y=b.y*H,w=b.w*W*syn,hh=b.h*H*syn;
c.fillStyle="rgba(127,166,80,"+(0.05+0.10*(1-i/6)).toFixed(3)+")";
c.fillRect(x,y,w,hh);
c.strokeStyle="rgba(243,239,230,"+(0.16+0.24*syn).toFixed(2)+")";c.lineWidth=1;
c.strokeRect(x+0.5,y+0.5,w-1,hh-1);
c.fillStyle="rgba(243,239,230,0.42)";c.fillRect(x+10,y+11,Math.min(w-20,46),2.4);
});
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til hello@makingspace.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"MS-201",kunde:"Familiebedrift",oppdrag:"Generasjonsskifte",status:"paagaar",fase:"Kartlegging"},{nr:"MS-202",kunde:"SMB",oppdrag:"Selskapsstruktur",status:"tilbud",fase:"Tilbud sendt"},{nr:"MS-203",kunde:"Selskap",oppdrag:"Skattefunn",status:"ny",fase:"Første samtale"},{nr:"MS-204",kunde:"Eier",oppdrag:"Verdivurdering",status:"ny",fase:"Første samtale"},{nr:"MS-205",kunde:"Selskap",oppdrag:"Transaksjon",status:"paagaar",fase:"Forhandling"},{nr:"MS-206",kunde:"Bedrift",oppdrag:"Finansiering",status:"levert",fase:"Avsluttet"},{nr:"MS-207",kunde:"Styre",oppdrag:"Styreoppdrag",status:"levert",fase:"Avsluttet"},{nr:"MS-208",kunde:"Nettverk",oppdrag:"Connector",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start oppdrag":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();