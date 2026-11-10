(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("fraktbilde");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var band=[0.28,0.5,0.72];
band.forEach(function(b,i){
var y=H*b;
c.fillStyle="rgba(240,242,239,0.04)";c.fillRect(0,y-H*0.045,W,H*0.09);
c.strokeStyle="rgba(240,242,239,0.10)";c.lineWidth=1;
c.beginPath();c.moveTo(0,y-H*0.045);c.lineTo(W,y-H*0.045);c.moveTo(0,y+H*0.045);c.lineTo(W,y+H*0.045);c.stroke();
// køyretøy
var fart=0.055+i*0.02, retning=(i%2===0)?1:-1;
for(var k=0;k<3;k++){
var p=((t*fart+k*0.34)%1);
var x=retning>0? p*W : W-p*W;
var bw=W*0.075, bh=H*0.045;
c.fillStyle="rgba(88,194,232,0.55)";
c.beginPath();
if(c.roundRect)c.roundRect(x,y-bh/2,bw,bh,3);else c.rect(x,y-bh/2,bw,bh);
c.fill();
c.fillStyle="rgba(240,242,239,0.55)";
c.fillRect(x+bw*0.64,y-bh/2+3,bw*0.3,bh-6);
}
});
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 62 58 86 00 eller skriv til firmapost@nortransport.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"NT-201",kunde:"Landbruk",oppdrag:"Transport",status:"paagaar",fase:"Underveis"},{nr:"NT-202",kunde:"Anlegg",oppdrag:"Tipp og anlegg",status:"tilbud",fase:"Tilbud sendt"},{nr:"NT-203",kunde:"Industri",oppdrag:"Gods innland",status:"ny",fase:"Bestilt"},{nr:"NT-204",kunde:"Kommune",oppdrag:"Renovasjon",status:"ny",fase:"Bestilt"},{nr:"NT-205",kunde:"Eksportør",oppdrag:"Import/Eksport",status:"paagaar",fase:"Fortolling"},{nr:"NT-206",kunde:"Kunde",oppdrag:"Kundespesifikk",status:"levert",fase:"Levert"},{nr:"NT-207",kunde:"Landbruk",oppdrag:"Fôrtransport",status:"levert",fase:"Levert"},{nr:"NT-208",kunde:"Miljø",oppdrag:"Renovasjon",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start transport":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();