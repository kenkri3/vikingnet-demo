(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("folk");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var cx=W*0.5, cy=H*0.55;
var ringer=[{r:0.42,n:12,rad:0.016},{r:0.31,n:10,rad:0.013},{r:0.21,n:8,rad:0.010}];
ringer.forEach(function(ring,ri){
for(var k=0;k<ring.n;k++){
var a=2*Math.PI*k/ring.n+ri*0.3+t*(0.06+ri*0.03);
var x=cx+W*ring.r*Math.cos(a), y=cy+H*ring.r*0.62*Math.sin(a);
var rad=Math.min(W,H)*ring.rad;
var lys=(k%3===0);
c.fillStyle=lys?"rgba(194,162,90,0.9)":"rgba(244,242,236,0.28)";
c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill();
// linje mot sentrum
c.strokeStyle="rgba(244,242,236,0.06)";c.lineWidth=1;
c.beginPath();c.moveTo(cx,cy);c.lineTo(x,y);c.stroke();
}
});
// kjerne
c.fillStyle="rgba(244,242,236,0.85)";c.beginPath();c.arc(cx,cy,Math.max(4,W*0.007),0,Math.PI*2);c.fill();
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 33 47 99 77 eller skriv til post@skc.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"SK-301",kunde:"Industri",oppdrag:"Forretningsutvikling",status:"paagaar",fase:"Workshop"},{nr:"SK-302",kunde:"Offentlig",oppdrag:"Rekruttering",status:"tilbud",fase:"Tilbud sendt"},{nr:"SK-303",kunde:"Selskap",oppdrag:"Ledelsesutvikling",status:"ny",fase:"Behov"},{nr:"SK-304",kunde:"Kommune",oppdrag:"Organisasjonsutvikling",status:"ny",fase:"Behov"},{nr:"SK-305",kunde:"Næringsliv",oppdrag:"Strategiprosess",status:"paagaar",fase:"Gjennomføring"},{nr:"SK-306",kunde:"Selskap",oppdrag:"Rekruttering",status:"levert",fase:"Ansatt"},{nr:"SK-307",kunde:"Offentlig",oppdrag:"Ledelse",status:"levert",fase:"Avsluttet"},{nr:"SK-308",kunde:"Industri",oppdrag:"Bærekraft",status:"tilbud",fase:"Tilbud sendt"}];
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