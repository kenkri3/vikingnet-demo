(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("kake");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var basis=H*0.84, lag=4;
for(var i=0;i<lag;i++){
var f=Math.min(1,Math.max(0,(t*1.1-i*0.22)));
if(f<=0)continue;
var hh=H*0.10*f, bred=(W*0.44+i*W*0.02);
var x1=W*0.5-bred/2, x2=W*0.5+bred/2, y=basis-i*(H*0.105);
// kake-lag
c.fillStyle=i%2===0?"rgba(248,244,234,0.10)":"rgba(224,139,79,0.16)";
c.beginPath();
if(c.roundRect)c.roundRect(x1,y-hh,bred,hh,6);else c.rect(x1,y-hh,bred,hh);
c.fill();
c.strokeStyle="rgba(248,244,234,0.30)";c.lineWidth=1;c.stroke();
// krem
c.fillStyle="rgba(255,255,255,0.16)";c.fillRect(x1+6,y-hh+3,bred-12,2);
// "smuler" som fell
if(i===lag-1&&f>0.9){
for(var k=0;k<8;k++){
var px=x1+((k*97)%Math.max(1,bred-20))+10, py=y-hh-8-Math.sin(t*2+k)*4;
c.fillStyle="rgba(224,139,79,0.5)";c.fillRect(px,py,2,2);
}
}
}
// fat
c.fillStyle="rgba(248,244,234,0.22)";
c.fillRect(W*0.18,basis,W*0.64,Math.max(2,H*0.006));
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 94 00 12 60 eller skriv til post@bakerhansen.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"BH-101",kunde:"Privat",oppdrag:"Bryllupskake",status:"paagaar",fase:"Produksjon"},{nr:"BH-102",kunde:"Bedrift",oppdrag:"Catering",status:"tilbud",fase:"Tilbud sendt"},{nr:"BH-103",kunde:"Privat",oppdrag:"Lag din egen kake",status:"ny",fase:"Bestilt"},{nr:"BH-104",kunde:"Butikk",oppdrag:"Brød og småvarer",status:"ny",fase:"Bestilt"},{nr:"BH-105",kunde:"Privat",oppdrag:"Porsjonskaker",status:"paagaar",fase:"Produksjon"},{nr:"BH-106",kunde:"Kantine",oppdrag:"Glutenfritt",status:"levert",fase:"Levert"},{nr:"BH-107",kunde:"Privat",oppdrag:"Gavekort",status:"levert",fase:"Sendt"},{nr:"BH-108",kunde:"Bedrift",oppdrag:"Møtemat",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen bestillinger i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start produksjon":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 bestillinger i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();