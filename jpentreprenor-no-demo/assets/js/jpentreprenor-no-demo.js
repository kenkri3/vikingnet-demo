(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("stokk");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var basis=H*0.86, rad=Math.min(W*0.048,H*0.11);
var rader=[{y:basis,n:6},{y:basis-rad*1.75,n:5},{y:basis-rad*3.5,n:4}];
rader.forEach(function(rad2,ri){
for(var k=0;k<rad2.n;k++){
var f=Math.min(1,Math.max(0,(t*1.15-ri*0.25-k*0.05)));
if(f<=0)continue;
var cx=W*0.5+(k-(rad2.n-1)/2)*(rad*2.1);
var r=rad*f;
c.beginPath();c.arc(cx,rad2.y,r,0,Math.PI*2);
c.fillStyle="rgba(168,129,79,0.16)";c.fill();
c.strokeStyle="rgba(245,241,232,0.34)";c.lineWidth=1.5;c.stroke();
c.beginPath();c.arc(cx,rad2.y,r*0.42,0,Math.PI*2);
c.strokeStyle="rgba(245,241,232,0.20)";c.lineWidth=1;c.stroke();
c.beginPath();c.arc(cx,rad2.y,Math.max(1.5,r*0.08),0,Math.PI*2);
c.fillStyle="rgba(245,241,232,0.4)";c.fill();
}
});
// sagblad-linje
c.strokeStyle="rgba(245,241,232,0.18)";c.lineWidth=1;
c.setLineDash([6,10]);
c.beginPath();c.moveTo(W*0.06,H*0.2);c.lineTo(W*0.94,H*0.2);c.stroke();
c.setLineDash([]);
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 46 37 27 05 eller skriv til tomas@jpentreprenor.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"JP-401",kunde:"Privat",oppdrag:"Tilbygg",status:"paagaar",fase:"Reisverk"},{nr:"JP-402",kunde:"Borettslag",oppdrag:"Rehabilitering",status:"tilbud",fase:"Tilbud sendt"},{nr:"JP-403",kunde:"Privat",oppdrag:"Oppussing",status:"ny",fase:"Befaring"},{nr:"JP-404",kunde:"Entreprenør",oppdrag:"Nybygg",status:"ny",fase:"Befaring"},{nr:"JP-405",kunde:"Privat",oppdrag:"Terrasse",status:"paagaar",fase:"Montering"},{nr:"JP-406",kunde:"Bedrift",oppdrag:"Innvendig arbeid",status:"levert",fase:"Ferdig"},{nr:"JP-407",kunde:"Privat",oppdrag:"Bad",status:"levert",fase:"Ferdig"},{nr:"JP-408",kunde:"Sameie",oppdrag:"Utearbeid",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start arbeid":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();