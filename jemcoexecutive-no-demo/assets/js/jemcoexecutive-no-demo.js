(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("nett");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null,noder=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
if(!noder.length){for(var i=0;i<9;i++)noder.push({x:0.1+((i*37)%80)/100*0.95,y:0.15+((i*53)%70)/100*0.95,f:i*0.4});}
// linjer
c.strokeStyle="rgba(150,165,184,0.22)";c.lineWidth=1;
for(var i=0;i<noder.length;i++)for(var j=i+1;j<noder.length;j++){
var a=noder[i],b=noder[j];var d=Math.hypot((a.x-b.x)*W,(a.y-b.y)*H);
if(d<W*0.32){c.beginPath();c.moveTo(a.x*W,a.y*H);c.lineTo(b.x*W,b.y*H);c.stroke();}
}
// noder med puls
noder.forEach(function(n){
var puls=0.5+0.5*Math.sin(t*1.5+n.f);
var r=3+2.2*puls;
c.fillStyle="rgba(195,205,217,"+(0.45+0.45*puls).toFixed(2)+")";
c.beginPath();c.arc(n.x*W,n.y*H,r,0,Math.PI*2);c.fill();
c.strokeStyle="rgba(150,165,184,"+(0.12+0.2*puls).toFixed(2)+")";c.lineWidth=1;
c.beginPath();c.arc(n.x*W,n.y*H,r+7,0,Math.PI*2);c.stroke();
});
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 23 95 01 49.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"JE-301",kunde:"Industri",oppdrag:"Toppleder",status:"paagaar",fase:"Search"},{nr:"JE-302",kunde:"Teknologi",oppdrag:"CTO",status:"tilbud",fase:"Kandidater"},{nr:"JE-303",kunde:"Finans",oppdrag:"Styreverv",status:"ny",fase:"Brief"},{nr:"JE-304",kunde:"Energi",oppdrag:"Direktør",status:"ny",fase:"Brief"},{nr:"JE-305",kunde:"Bygg",oppdrag:"Spesialist",status:"paagaar",fase:"Search"},{nr:"JE-306",kunde:"Media",oppdrag:"Leder",status:"levert",fase:"Ansatt"},{nr:"JE-307",kunde:"Bank",oppdrag:"Outplacement",status:"levert",fase:"Avsluttet"},{nr:"JE-308",kunde:"Transport",oppdrag:"Leder",status:"tilbud",fase:"Kandidater"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Start search":x.status==="tilbud"?"Presentér kandidater":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();