(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("valse");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
// underlag: rått asfaltkorn
c.fillStyle="rgba(239,233,220,0.05)";c.fillRect(0,0,W,H);
for(var i=0;i<70;i++){var x=(i*97)%W,y=(i*61)%H;c.fillStyle="rgba(239,233,220,"+(i%3?0.06:0.13)+")";c.fillRect(x,y,2,2);}
// valset flate
var bredde=(W*0.72);var x0=(W-bredde)/2;var hoyde=H*0.44;
var grad=c.createLinearGradient(0,H*0.3,0,H*0.78);grad.addColorStop(0,"rgba(125,108,174,0.30)");grad.addColorStop(1,"rgba(125,108,174,0.06)");
c.fillStyle=grad;c.fillRect(x0,H*0.32,bredde,hoyde);
c.strokeStyle="rgba(201,189,234,0.35)";c.lineWidth=1;c.strokeRect(x0,H*0.32,bredde,hoyde);
// valse som beveger seg
var pos=(t*0.16)%1;var vx=x0+bredde*pos;
c.fillStyle="rgba(239,233,220,0.92)";c.fillRect(vx-5,H*0.24,10,H*0.56);
c.beginPath();c.arc(vx,H*0.22,9,0,Math.PI*2);c.fillStyle="rgba(201,189,234,0.9)";c.fill();
c.fillStyle="rgba(27,26,23,0.9)";c.beginPath();c.arc(vx,H*0.22,3.4,0,Math.PI*2);c.fill();
// kantmarkering
c.strokeStyle="rgba(239,233,220,0.18)";c.setLineDash([7,7]);c.beginPath();c.moveTo(x0,H*0.82);c.lineTo(x0+bredde,H*0.82);c.stroke();c.setLineDash([]);
t+=0.006;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Bruk skjemaet på firmas egen side for å få pris.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"HA-801",kunde:"Borettslag",stad:"Sotra",type:"Reasfaltering",status:"paagaar",fase:"Utlegging"},{nr:"HA-802",kunde:"Næringseiendom",stad:"Bergen",type:"Asfaltering",status:"tilbud",fase:"Tilbud sendt"},{nr:"HA-803",kunde:"Privat",stad:"Askøy",type:"Innkjøring",status:"ny",fase:"Befaring"},{nr:"HA-804",kunde:"Kommunal vei",stad:"Osterøy",type:"Reparasjon",status:"ny",fase:"Befaring"},{nr:"HA-805",kunde:"Industriområde",stad:"Nordhordaland",type:"Håndlegging",status:"paagaar",fase:"Håndlegging"},{nr:"HA-806",kunde:"Sameie",stad:"Bergen",type:"Fresing",status:"levert",fase:"Ferdig"},{nr:"HA-807",kunde:"Lagerbygg",stad:"Austevoll",type:"Asfaltering",status:"levert",fase:"Ferdig"},{nr:"HA-808",kunde:"Vei og gangsti",stad:"Stord",type:"Reparasjon",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start arbeid":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.kunde+'</h3><div class="oppdrag__meta"><span>'+x.stad+"</span><span>"+x.type+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.kunde+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();