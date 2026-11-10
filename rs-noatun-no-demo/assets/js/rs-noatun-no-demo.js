(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("sjo");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var horisont=H*0.55;
// solnedgang
var g=c.createLinearGradient(0,horisont-H*0.28,0,horisont);
g.addColorStop(0,"rgba(247,244,236,0.02)");
g.addColorStop(0.6,"rgba(185,154,104,0.22)");
g.addColorStop(1,"rgba(216,191,148,0.42)");
c.fillStyle=g;c.fillRect(0,horisont-H*0.28,W,H*0.28);
// sol
c.fillStyle="rgba(247,238,214,0.75)";
c.beginPath();c.arc(W*0.5,horisont-H*0.06,Math.min(W,H)*0.045,0,Math.PI*2);c.fill();
// sjø med bølgjer
for(var row=0;row<14;row++){
var y=horisont+row*(H*0.031);
c.beginPath();
for(var x=0;x<=W;x+=10){
var yy=y+Math.sin(x/W*7.2+t*(0.8+row*0.05)+row*0.7)*(H*0.006+row*H*0.0009);
if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy);
}
c.strokeStyle="rgba(247,244,236,"+(0.20-row*0.012).toFixed(3)+")";
c.lineWidth=row<3?1.6:1;
c.stroke();
}
// lysrefleks i sjøen
c.fillStyle="rgba(247,238,214,0.10)";
c.fillRect(W*0.46,horisont,W*0.08,H*0.4);
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 95 13 24 00 eller skriv til reception@rs-noatun.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"RS-501",kunde:"Selskap",oppdrag:"Bryllup",status:"paagaar",fase:"Planlegging"},{nr:"RS-502",kunde:"Bedrift",oppdrag:"Konferanse",status:"tilbud",fase:"Tilbud sendt"},{nr:"RS-503",kunde:"Privat",oppdrag:"Julebord",status:"ny",fase:"Forespørsel"},{nr:"RS-504",kunde:"Familie",oppdrag:"Konfirmasjon",status:"ny",fase:"Forespørsel"},{nr:"RS-505",kunde:"Familie",oppdrag:"Minnestund",status:"paagaar",fase:"Planlegging"},{nr:"RS-506",kunde:"Hotellgjest",oppdrag:"Opphold",status:"levert",fase:"Gjennomført"},{nr:"RS-507",kunde:"Bedrift",oppdrag:"Møte og lunsj",status:"levert",fase:"Gjennomført"},{nr:"RS-508",kunde:"Selskap",oppdrag:"Sommerfest",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start planlegging":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();