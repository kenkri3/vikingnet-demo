(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("deig");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null,bolle=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);
if(!bolle.length){var kol=4,rad=3;for(var i=0;i<kol;i++)for(var j=0;j<rad;j++)bolle.push({i:i,j:j});}
return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var kol=4,rad=3,bw=W/(kol+1),bh=H/(rad+1.4);
bolle.forEach(function(b,idx){
var f=Math.min(1,Math.max(0,(t*1.5-idx*0.14)));
if(f<=0)return;
var cx=bw*0.9+b.i*bw, cy=bh*1.1+b.j*bh*1.1;
var rr=(Math.min(bw,bh)*0.29)*(0.6+0.4*f);
// heving
var hev=Math.sin(t*1.4+b.i+b.j)*0.9;
c.beginPath();c.ellipse(cx,cy,rxOf(rr),rr+hev,0,0,Math.PI*2);
c.fillStyle="rgba(217,164,65,"+(0.16+f*0.2).toFixed(2)+")";c.fill();
c.strokeStyle="rgba(253,246,236,"+(0.18+f*0.3).toFixed(2)+")";c.lineWidth=1;c.stroke();
// frø
c.fillStyle="rgba(253,246,236,0.5)";
c.fillRect(cx-rr*0.3,cy-rr*0.2,1.6,1.6);c.fillRect(cx+rr*0.2,cy-rr*0.1,1.6,1.6);
});
function rxOf(r){return r*1.12;}
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 55 34 96 00 eller skriv til kundeservice@bakerbrun.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("bestillinger");if(li){var o=[{nr:"BB-401",kunde:"Firma",oppdrag:"Møtemat 20 pers",status:"paagaar",fase:"Produksjon"},{nr:"BB-402",kunde:"Privat",oppdrag:"Kakebestilling",status:"tilbud",fase:"Tilbud sendt"},{nr:"BB-403",kunde:"Storhusholdning",oppdrag:"Fast leveranse",status:"ny",fase:"Avtale"},{nr:"BB-404",kunde:"Privat",oppdrag:"Møtemat",status:"ny",fase:"Forespørsel"},{nr:"BB-405",kunde:"Firma",oppdrag:"Kake til jubileum",status:"paagaar",fase:"Produksjon"},{nr:"BB-406",kunde:"Kantine",oppdrag:"Storhusholdning",status:"levert",fase:"Levert"},{nr:"BB-407",kunde:"Privat",oppdrag:"Bursdagskake",status:"levert",fase:"Hentet"},{nr:"BB-408",kunde:"Firma",oppdrag:"Møtemat 12 pers",status:"tilbud",fase:"Tilbud sendt"}];
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