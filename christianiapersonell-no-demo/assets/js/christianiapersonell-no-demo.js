(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("match");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function rundKort(x,y,w,h,alfa){c.fillStyle="rgba(244,241,234,"+(0.05+alfa*0.06).toFixed(3)+")";c.strokeStyle="rgba(244,241,234,"+(0.16+alfa*0.3).toFixed(2)+")";c.lineWidth=1;
c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,7);else c.rect(x,y,w,h);c.fill();c.stroke();
c.fillStyle="rgba(244,241,234,"+(0.28+alfa*0.4).toFixed(2)+")";c.fillRect(x+9,y+11,w*0.4,2.5);c.fillRect(x+9,y+19,w*0.26,2.5);}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var bw=W*0.19,bh=H*0.24;var f=(t*0.16)%1;
for(var i=0;i<3;i++){rundKort(W*0.06, H*0.16+i*(bh+10), bw, bh, 0.3);}
rundKort(W*0.62, H*0.30, bw, bh, 0.5);
var y=H*0.16+f*H*0.5;
c.fillStyle="rgba(240,166,58,0.85)";
c.beginPath();if(c.roundRect)c.roundRect(W*0.34,y,bw*0.62,bh*0.55,6);else c.rect(W*0.34,y,bw*0.62,bh*0.55);c.fill();
c.fillStyle="rgba(40,50,58,0.85)";c.fillRect(W*0.34+8,y+9,bw*0.3,2.5);c.fillRect(W*0.34+8,y+16,bw*0.2,2.5);
if(f>0.55){c.strokeStyle="rgba(240,166,58,0.5)";c.lineWidth=1.4;c.beginPath();c.moveTo(W*0.53,y+bh*0.25);c.lineTo(W*0.62,H*0.30+bh*0.25);c.stroke();}
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til oslo@christianiapersonell.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"CP-101",kunde:"Bedrift",oppdrag:"Rekruttering selger",status:"paagaar",fase:"Intervju"},{nr:"CP-102",kunde:"Klinikk",oppdrag:"Vikariat",status:"tilbud",fase:"Tilbud sendt"},{nr:"CP-103",kunde:"Bedrift",oppdrag:"Fast stilling",status:"ny",fase:"Behovsavklaring"},{nr:"CP-104",kunde:"Kommune",oppdrag:"Bemanning",status:"ny",fase:"Behovsavklaring"},{nr:"CP-105",kunde:"Bedrift",oppdrag:"Lederrekruttering",status:"paagaar",fase:"Kandidater"},{nr:"CP-106",kunde:"Butikk",oppdrag:"Sesongbemanning",status:"levert",fase:"Ansatt"},{nr:"CP-107",kunde:"Bedrift",oppdrag:"Rekruttering",status:"levert",fase:"Ansatt"},{nr:"CP-108",kunde:"Innlandet",oppdrag:"Bemanning",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start søk":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();