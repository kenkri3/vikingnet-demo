(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("frost");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,greiner=[],t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function bygg(x,y,vinkel,lengde,djupn){if(djupn<=0||lengde<3)return;
var x2=x+Math.cos(vinkel)*lengde,y2=y+Math.sin(vinkel)*lengde;
greiner.push({x1:x,y1:y,x2:x2,y2:y2,d:djupn});
var n=2+Math.floor(Math.random()*2);
for(var i=0;i<n;i++){var a=vinkel+(Math.random()-0.5)*1.1;bygg(x2,y2,a,lengde*(0.55+Math.random()*0.2),djupn-1);}}
function lag(){greiner=[];bygg(W*0.5,H*0.62,-Math.PI/2,H*0.2,5);bygg(W*0.5,H*0.62,-Math.PI/2+2.2,H*0.12,4);bygg(W*0.5,H*0.62,-Math.PI/2-2.2,H*0.12,4);}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var synleg=Math.min(1,t/2.4);
for(var i=0;i<greiner.length;i++){var g=greiner[i];var f=Math.min(1,synleg*(greiner.length/(i+1))*0.9);
c.strokeStyle="rgba(196,240,228,"+(0.08+0.34*(g.d/5)*Math.min(1,f*1.4)).toFixed(2)+")";
c.lineWidth=Math.max(0.6,g.d*0.45);
c.beginPath();c.moveTo(g.x1,g.y1);c.lineTo(g.x1+(g.x2-g.x1)*f,g.y1+(g.y2-g.y1)*f);c.stroke();}
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){lag();if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()){lag();if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 33 36 35 00.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"EP-501",kunde:"Daglivarekjede",stad:"Oslo",type:"Frontline",status:"paagaar",fase:"Montasje"},{nr:"EP-502",kunde:"Butikk Sør",stad:"Kristiansand",type:"Backline",status:"tilbud",fase:"Tilbud sendt"},{nr:"EP-503",kunde:"Nærbutikk",stad:"Bergen",type:"Kjøledisk",status:"ny",fase:"Befaring"},{nr:"EP-504",kunde:"Cash & carry",stad:"Trondheim",type:"Service",status:"ny",fase:"Planlegging"},{nr:"EP-505",kunde:"Faghandel",stad:"Stavanger",type:"Frontline",status:"paagaar",fase:"Idriftsettelse"},{nr:"EP-506",kunde:"Kioskkjede",stad:"Tromsø",type:"Service",status:"levert",fase:"Ferdig"},{nr:"EP-507",kunde:"Supermarked",stad:"Drammen",type:"Backline",status:"levert",fase:"Ferdig"},{nr:"EP-508",kunde:"Butikk Nord",stad:"Bodø",type:"Kjølerom",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start prosjekt":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.kunde+'</h3><div class="oppdrag__meta"><span>'+x.stad+"</span><span>"+x.type+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.kunde+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();