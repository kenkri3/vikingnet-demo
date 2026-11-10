(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("infra");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,naa=0,maal=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<100||H<60)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var band=[{y:0.3,farge:"rgba(244,244,242,0.30)"},{y:0.5,farge:"rgba(91,141,239,0.75)"},{y:0.7,farge:"rgba(244,244,242,0.22)"}];
band.forEach(function(b,bi){
c.beginPath();
for(var x=0;x<=W;x+=8){var y=H*b.y+Math.sin(x/W*Math.PI*2+bi*1.2)*H*0.05;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}
c.strokeStyle=b.farge;c.lineWidth=bi===1?2.2:1.2;c.stroke();
});
// knutepunkt som tenner etter framdrift
var n=6;
for(var i=0;i<n;i++){
var t=i/(n-1);var x=W*(0.08+0.84*t);var y=H*0.5+Math.sin((x/W)*Math.PI*2+1.2)*H*0.05;
var tent=naa>=t-0.02;
c.beginPath();c.arc(x,y,tent?5:3.4,0,Math.PI*2);c.fillStyle=tent?"rgba(156,188,247,0.95)":"rgba(244,244,242,0.25)";c.fill();
if(tent){c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.strokeStyle="rgba(91,141,239,0.35)";c.lineWidth=1;c.stroke();}
}
naa+=(maal-naa)*0.04;if(Math.abs(maal-naa)<0.002)naa=maal;ko=null;
if(naa!==maal&&!red)ko=requestAnimationFrame(tegn);}
function onsk(){if(!ko)ko=requestAnimationFrame(tegn);}
function oppdater(){var r=l.getBoundingClientRect();var vh=window.innerHeight||800;maal=Math.min(1,Math.max(0,1-(r.top+r.height*0.2)/(vh*0.9)));if(red){naa=maal=1;tegn();}else onsk();}
if(s()){oppdater();window.addEventListener("scroll",oppdater,{passive:true});window.addEventListener("resize",function(){if(s())tegn();});if(red){naa=maal=1;tegn();}}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til contact@nrcgroup.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("prosjekter");if(li){var o=[{nr:"NC-601",kunde:"Damanlegg",oppdrag:"Holmendammen",status:"paagaar",fase:"Rehabilitering"},{nr:"NC-602",kunde:"Samferdsel",oppdrag:"Dobbeltspor Melhus",status:"paagaar",fase:"Anlegg"},{nr:"NC-603",kunde:"Helse",oppdrag:"Nye Aker sykehus",status:"tilbud",fase:"Tilbud sendt"},{nr:"NC-604",kunde:"Bane",oppdrag:"Fornebubanen",status:"ny",fase:"Planlegging"},{nr:"NC-605",kunde:"Kraft",oppdrag:"Dam Nespervatn",status:"ny",fase:"Planlegging"},{nr:"NC-606",kunde:"Bane",oppdrag:"Meråkerbanen",status:"levert",fase:"Ferdig"},{nr:"NC-607",kunde:"Havn",oppdrag:"Kaianlegg",status:"levert",fase:"Ferdig"},{nr:"NC-608",kunde:"Samferdsel",oppdrag:"Strømforsyning bane",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen prosjekter i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start prosjekt":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 prosjekter i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();