(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("signatur");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,naa=0,maal=0,ko=null;
var prikkar=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);
if(!prikkar.length){prikkar=[];for(var i=0;i<=120;i++){var t=i/120;var x=W*(0.08+0.84*t);var y=H*(0.62-Math.sin(t*Math.PI*2.1)*0.16-Math.sin(t*Math.PI*6.4)*0.05);prikkar.push([x,y]);}}
return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var n=Math.floor(prikkar.length*naa);
c.beginPath();
for(var i=0;i<n;i++){var p=prikkar[i];if(i===0)c.moveTo(p[0],p[1]);else c.lineTo(p[0],p[1]);}
c.strokeStyle="rgba(230,207,172,0.9)";c.lineWidth=2.2;c.lineJoin="round";c.stroke();
// blekkpunkt i enden
if(n>2){var e=prikkar[Math.min(n,prikkar.length-1)];c.fillStyle="rgba(217,189,142,0.95)";c.beginPath();c.arc(e[0],e[1],3,0,Math.PI*2);c.fill();}
// underlinje
c.strokeStyle="rgba(245,243,238,0.18)";c.lineWidth=1;c.beginPath();c.moveTo(W*0.08,H*0.78);c.lineTo(W*0.92,H*0.78);c.stroke();
naa+=(maal-naa)*0.03;if(Math.abs(maal-naa)<0.002)naa=maal;ko=null;
if(naa!==maal&&!red)ko=requestAnimationFrame(tegn);}
function onsk(){if(!ko)ko=requestAnimationFrame(tegn);}
function oppdater(){var r=l.getBoundingClientRect();var vh=window.innerHeight||800;maal=Math.min(1,Math.max(0,1-(r.top+r.height*0.2)/(vh*0.9)));if(red){naa=maal=1;tegn();}else onsk();}
if(s()){oppdater();window.addEventListener("scroll",oppdater,{passive:true});window.addEventListener("resize",function(){if(s())tegn();});if(red){naa=maal=1;tegn();}}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 64 84 00 20.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("saker");if(li){var o=[{nr:"HC-301",kunde:"Privat",sak:"Arverett",status:"paagaar",fase:"Kartlegging"},{nr:"HC-302",kunde:"Bedrift",sak:"Arbeidsrett",status:"tilbud",fase:"Tilbud sendt"},{nr:"HC-303",kunde:"Privat",sak:"Fremtidsfullmakt",status:"ny",fase:"Første samtale"},{nr:"HC-304",kunde:"Selskap",sak:"Selskapsrett",status:"ny",fase:"Første samtale"},{nr:"HC-305",kunde:"Privat",sak:"Tvisteløsning",status:"paagaar",fase:"Forhandling"},{nr:"HC-306",kunde:"Bank",sak:"Konkurs/insolvens",status:"levert",fase:"Avsluttet"},{nr:"HC-307",kunde:"Entreprenør",sak:"Entreprise",status:"levert",fase:"Avsluttet"},{nr:"HC-308",kunde:"Privat",sak:"Erstatning",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen saker i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start sak":"Merk avsluttet";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-sak="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-sak="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.sak+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-sak]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-sak");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.sak+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 saker i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();