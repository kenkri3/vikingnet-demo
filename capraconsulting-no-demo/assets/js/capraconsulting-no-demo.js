(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("pipe");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
var steg=["plan","bygg","test","deploy"];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var n=4, bw=W*0.17, bh=H*0.15, gap=(W-bw*n-(W*0.08))/(n-1);
var y=H*0.46;
var aktiv=Math.floor((t*0.55)%n);
for(var i=0;i<n;i++){
var x=W*0.04+i*(bw+gap);
var lys=i===aktiv;
c.fillStyle=lys?"rgba(249,199,79,0.18)":"rgba(239,242,240,0.05)";
c.strokeStyle=lys?"rgba(249,199,79,0.9)":"rgba(239,242,240,0.18)";
c.lineWidth=lys?2:1;
c.beginPath();
if(c.roundRect)c.roundRect(x,y-bh/2,bw,bh,6);else c.rect(x,y-bh/2,bw,bh);
c.fill();c.stroke();
// etikett
c.fillStyle=lys?"rgba(249,199,79,0.95)":"rgba(239,242,240,0.55)";
c.font="500 "+(Math.max(8,Math.round(W*0.0105)))+"px ui-monospace, monospace";
c.fillText(steg[i],x+10,y-2);
// statuslinje
c.fillStyle=lys?"rgba(249,199,79,0.7)":"rgba(239,242,240,0.2)";
c.fillRect(x+10,y+6,bw*0.5,2);
// pil
if(i<n-1){
c.strokeStyle="rgba(239,242,240,0.25)";c.lineWidth=1.4;
c.beginPath();c.moveTo(x+bw,y);c.lineTo(x+bw+gap,y);c.stroke();
c.beginPath();c.moveTo(x+bw+gap-6,y-4);c.lineTo(x+bw+gap,y);c.lineTo(x+bw+gap-6,y+4);c.stroke();
}
}
// logglinjer under
for(var k=0;k<4;k++){
var f=(t*0.5+k*0.25)%1;
var lw=W*(0.15+0.35*((k*7)%5)/5);
c.fillStyle="rgba(239,242,240,"+(0.18-f*0.14).toFixed(2)+")";
c.fillRect(W*0.04, H*0.72+k*(H*0.05), lw, 2.4);
}
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til post@capraconsulting.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"CA-501",kunde:"Bank",oppdrag:"Produktutvikling",status:"paagaar",fase:"Utvikling"},{nr:"CA-502",kunde:"Offentlig",oppdrag:"Organisasjonsdesign",status:"tilbud",fase:"Tilbud sendt"},{nr:"CA-503",kunde:"Forsikring",oppdrag:"AI",status:"ny",fase:"Kartlegging"},{nr:"CA-504",kunde:"Handel",oppdrag:"Teknologiledelse",status:"ny",fase:"Kartlegging"},{nr:"CA-505",kunde:"Energi",oppdrag:"Team Topologies",status:"paagaar",fase:"Workshop"},{nr:"CA-506",kunde:"Bank",oppdrag:"Plattform",status:"levert",fase:"Overlevert"},{nr:"CA-507",kunde:"Helse",oppdrag:"Produktteam",status:"levert",fase:"Overlevert"},{nr:"CA-508",kunde:"Logistikk",oppdrag:"Digital produktutvikling",status:"tilbud",fase:"Tilbud sendt"}];
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