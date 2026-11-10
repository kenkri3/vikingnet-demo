(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("vei");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
// vegbane
var vegY=H*0.62, vegH=H*0.26;
c.fillStyle="rgba(255,255,255,0.04)";c.fillRect(0,vegY,W,vegH);
// fartsretning: midtstripe som ruller
var dash=Math.max(22,W*0.035), gap=Math.max(16,W*0.024);
var off=(t*60)%(dash+gap);
c.fillStyle="rgba(255,210,31,0.9)";
for(var x=-dash+off;x<W+dash;x+=dash+gap){c.fillRect(x,vegY+vegH*0.46,dash,Math.max(3,H*0.008));}
// kantlinjer
c.fillStyle="rgba(245,242,232,0.35)";
c.fillRect(0,vegY+vegH*0.12,W,Math.max(2,H*0.005));
c.fillRect(0,vegY+vegH*0.84,W,Math.max(2,H*0.005));
// merkeutstyr (liten maskin) med stråle
var mx=W*0.5+Math.sin(t*0.7)*W*0.06;
c.fillStyle="rgba(245,242,232,0.85)";
c.fillRect(mx-16,vegY-6,32,6);
c.fillStyle="rgba(255,210,31,0.85)";
c.fillRect(mx-3,vegY-22,6,16);
c.fillStyle="rgba(255,210,31,0.25)";
c.beginPath();c.moveTo(mx-3,vegY);c.lineTo(mx+3,vegY);c.lineTo(mx+26,vegY+vegH*0.5);c.lineTo(mx-26,vegY+vegH*0.5);c.closePath();c.fill();
t+=0.008;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring +47 69 24 06 50 eller skriv til post@zebra.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"ZB-401",kunde:"Kommune",oppdrag:"Veimerking 4 km",status:"paagaar",fase:"Utførelse"},{nr:"ZB-402",kunde:"Kjøpesenter",oppdrag:"Parkeringsplass",status:"tilbud",fase:"Tilbud sendt"},{nr:"ZB-403",kunde:"Entreprenør",oppdrag:"Fresing av asfalt",status:"ny",fase:"Befaring"},{nr:"ZB-404",kunde:"Borettslag",oppdrag:"Oppmerking",status:"ny",fase:"Befaring"},{nr:"ZB-405",kunde:"Statens vegvesen",oppdrag:"Riksveg-merking",status:"paagaar",fase:"Utførelse"},{nr:"ZB-406",kunde:"Næringspark",oppdrag:"Dekor og utsmykking",status:"levert",fase:"Ferdig"},{nr:"ZB-407",kunde:"Kommune",oppdrag:"Verkstedoppdrag",status:"levert",fase:"Ferdig"},{nr:"ZB-408",kunde:"Idrettslag",oppdrag:"Baneoppmerking",status:"tilbud",fase:"Tilbud sendt"}];
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