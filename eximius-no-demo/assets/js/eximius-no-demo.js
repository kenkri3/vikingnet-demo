(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("arkitektur");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var st=Math.max(16,Math.round(W/26));
var kol=Math.floor(W/st), rad=Math.floor(H/st);
for(var y=0;y<rad;y++){
for(var x=0;x<kol;x++){
var d2=Math.hypot(x-kol*0.5,y-rad*0.45)/(Math.max(kol,rad)*0.7);
var puls=0.5+0.5*Math.sin(t*1.2-d2*5+x*0.2+y*0.15);
var alfa=Math.max(0,(0.28-d2*0.26))*puls;
// ramme
c.strokeStyle="rgba(238,242,246,0.06)";c.lineWidth=1;
c.strokeRect(x*st+1,y*st+1,st-2,st-2);
if(alfa>0.02){c.fillStyle="rgba(78,168,222,"+alfa.toFixed(3)+")";c.fillRect(x*st+3,y*st+3,st-6,st-6);}
}
}
// koplingar mellom nokre ruter
c.strokeStyle="rgba(142,205,240,0.35)";c.lineWidth=1.4;
var par=[[0.2,0.25,0.45,0.25],[0.45,0.25,0.45,0.5],[0.45,0.5,0.72,0.5],[0.72,0.5,0.72,0.72]];
par.forEach(function(p){c.beginPath();c.moveTo(W*p[0],H*p[1]);c.lineTo(W*p[2],H*p[3]);c.stroke();});
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til br@eximius.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"EX-301",kunde:"Helseregion",oppdrag:"Enterprise architecture",status:"paagaar",fase:"Arkitektur"},{nr:"EX-302",kunde:"Helseforetak",oppdrag:"Interoperabilitet",status:"tilbud",fase:"Tilbud sendt"},{nr:"EX-303",kunde:"Offentlig",oppdrag:"Anskaffelse",status:"ny",fase:"Behovsavklaring"},{nr:"EX-304",kunde:"Leverandør",oppdrag:"Rådgivning",status:"ny",fase:"Behovsavklaring"},{nr:"EX-305",kunde:"Helseregion",oppdrag:"Prosjektledelse",status:"paagaar",fase:"Gjennomføring"},{nr:"EX-306",kunde:"Kommune",oppdrag:"Integrasjon",status:"levert",fase:"Ferdig"},{nr:"EX-307",kunde:"Helseforetak",oppdrag:"Arkitektur",status:"levert",fase:"Ferdig"},{nr:"EX-308",kunde:"Offentlig",oppdrag:"Standardisering",status:"tilbud",fase:"Tilbud sendt"}];
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