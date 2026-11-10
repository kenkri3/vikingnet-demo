(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("lag");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
var lag=[{f:0.72,y:0.5,namn:"Eiendom"},{f:0.86,y:0.62,namn:"Kartlag"},{f:0.96,y:0.74,namn:"Risiko"}];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var cx=W*0.5,cy=H*0.62;
for(var i=0;i<lag.length;i++){
var L=lag[i];var w=W*L.f,h=H*L.f*0.52;
var off=(1-(t*0.9-i*0.12)%1.6);
var yy=cy+(i*10)-Math.max(0,off)*6;
// plan
c.beginPath();c.moveTo(cx-w/2,yy);c.lineTo(cx+00,yy);c.lineTo(cx,yy+h/2);c.lineTo(cx-w/2,yy+h/2);c.closePath();
c.fillStyle="rgba(79,156,249,"+(0.05+0.05*i)+")";c.fill();
c.strokeStyle="rgba(140,196,255,"+(0.16+0.1*i)+")";c.lineWidth=1;c.stroke();
c.beginPath();c.moveTo(cx+0,yy);c.lineTo(cx+w/2,yy);c.lineTo(cx+w/2,yy+h/2);c.lineTo(cx,yy+h/2);c.closePath();
c.fillStyle="rgba(79,156,249,"+(0.04+0.04*i)+")";c.fill();c.stroke();
// pin
var px=cx+Math.sin(t+i)*w*0.16,py=yy+h*0.34;
c.fillStyle="rgba(140,196,255,0.9)";c.beginPath();c.arc(px,py,2.6,0,Math.PI*2);c.fill();
}
t+=0.008;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til support@placepoint.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"PP-101",kunde:"Eiendomsforvalter",oppdrag:"Leadliste næringsbygg",status:"paagaar",fase:"Kartlag"},{nr:"PP-102",kunde:"Meglerhus",oppdrag:"Eiendomsanalyse",status:"tilbud",fase:"Demo booket"},{nr:"PP-103",kunde:"Utvikler",oppdrag:"Tomtesøk",status:"ny",fase:"Kartlegging"},{nr:"PP-104",kunde:"Bank",oppdrag:"Risikovurdering",status:"ny",fase:"Kartlegging"},{nr:"PP-105",kunde:"Kommune",oppdrag:"Eiendomsoversikt",status:"paagaar",fase:"Integrasjon"},{nr:"PP-106",kunde:"Industri",oppdrag:"Leietakeroversikt",status:"levert",fase:"Ferdig"},{nr:"PP-107",kunde:"Forsikring",oppdrag:"Skadedata",status:"levert",fase:"Ferdig"},{nr:"PP-108",kunde:"Byggherre",oppdrag:"Mulighetsstudie",status:"tilbud",fase:"Tilbud sendt"}];
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