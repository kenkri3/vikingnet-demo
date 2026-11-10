(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("termo");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
var flekker=[{x:0.28,y:0.36,r:0.30,f:0.0},{x:0.62,y:0.28,r:0.20,f:1.3},{x:0.78,y:0.62,r:0.26,f:2.4},{x:0.44,y:0.7,r:0.18,f:3.1}];
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
// kretslinjer
c.strokeStyle="rgba(37,208,160,0.10)";c.lineWidth=1;
for(var y=0;y<H;y+=H/12){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
// varmeflekker
flekker.forEach(function(f){
var cx=(f.x+Math.sin(t*0.35+f.f)*0.02)*W, cy=(f.y+Math.cos(t*0.3+f.f)*0.02)*H;
var rr=Math.min(W,H)*f.r*(1+0.04*Math.sin(t*0.9+f.f));
var g=c.createRadialGradient(cx,cy,0,cx,cy,rr);
g.addColorStop(0,"rgba(255,214,120,"+(0.42+0.1*Math.sin(t+f.f)).toFixed(2)+")");
g.addColorStop(0.45,"rgba(37,208,160,0.22)");
g.addColorStop(1,"rgba(14,17,22,0)");
c.fillStyle=g;c.beginPath();c.arc(cx,cy,rr,0,Math.PI*2);c.fill();
});
// målekryss
c.strokeStyle="rgba(243,244,242,0.18)";c.lineWidth=1;
flekker.slice(0,3).forEach(function(f,i){
var cx=f.x*W, cy=f.y*H;
var r=Math.min(W,H)*0.03;
c.beginPath();c.moveTo(cx-r,cy);c.lineTo(cx+r,cy);c.moveTo(cx,cy-r);c.lineTo(cx,cy+r);c.stroke();
});
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring Oslo 22 79 59 00 eller Romerike 63 84 64 64.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"ED-101",kunde:"Borettslag",oppdrag:"El-kontroll",status:"paagaar",fase:"Befaring"},{nr:"ED-102",kunde:"Næringsbygg",oppdrag:"Brann og nødlys",status:"tilbud",fase:"Tilbud sendt"},{nr:"ED-103",kunde:"Privat",oppdrag:"Smarthus",status:"ny",fase:"Befaring"},{nr:"ED-104",kunde:"Entreprenør",oppdrag:"Prosjekt",status:"ny",fase:"Kartlegging"},{nr:"ED-105",kunde:"Butikk",oppdrag:"Lås og beslag",status:"paagaar",fase:"Montering"},{nr:"ED-106",kunde:"Skole",oppdrag:"KNX og DALI",status:"levert",fase:"Ferdig"},{nr:"ED-107",kunde:"Borettslag",oppdrag:"Termografering",status:"levert",fase:"Ferdig"},{nr:"ED-108",kunde:"Industri",oppdrag:"Sikkerhet",status:"tilbud",fase:"Tilbud sendt"}];
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