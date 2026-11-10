(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("radar");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var cx=W*0.5, cy=H*0.55, R=Math.min(W,H)*0.44;
// ringer
for(var r=R;r>20;r-=R/5){
c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.strokeStyle="rgba(241,244,244,0.10)";c.lineWidth=1;c.stroke();
}
// aksar
for(var a=0;a<360;a+=30){
var rad=a*Math.PI/180;
c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+R*Math.cos(rad),cy+R*Math.sin(rad));
c.strokeStyle="rgba(241,244,244,0.06)";c.lineWidth=1;c.stroke();
}
// sveip
var vinkel=t*0.9;
for(var k=0;k<26;k++){
var aa=vinkel-k*0.035;
var alfa=(1-k/26)*0.35;
var grad=c.createLinearGradient(cx,cy,cx+R*Math.cos(aa),cy+R*Math.sin(aa));
grad.addColorStop(0,"rgba(255,59,59,"+(alfa*0.2).toFixed(3)+")");
grad.addColorStop(1,"rgba(255,59,59,"+alfa.toFixed(3)+")");
c.strokeStyle=grad;c.lineWidth=3;
c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+R*Math.cos(aa),cy+R*Math.sin(aa));c.stroke();
}
// blippar
[[0.66,0.30,0.0],[0.28,0.72,1.7],[0.74,0.78,3.1]].forEach(function(p){
var px=cx+R*Math.cos(p[2])*0.18+ (p[0]-0.5)*R*1.4, py=cy+(p[1]-0.5)*R*1.4;
var puls=0.5+0.5*Math.sin(t*2+p[2]);
c.fillStyle="rgba(255,138,138,"+(0.4+0.5*puls).toFixed(2)+")";
c.beginPath();c.arc(px,py,3.2,0,Math.PI*2);c.fill();
if(puls>0.75){c.strokeStyle="rgba(255,59,59,"+((1-puls)*0.8).toFixed(2)+")";c.lineWidth=1;c.beginPath();c.arc(px,py,10*(puls-0.75)*4+4,0,Math.PI*2);c.stroke();}
});
t+=0.01;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring +47 33 47 17 10 eller skriv til post@team-security.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"TS-301",kunde:"Bolig",oppdrag:"Boligalarm",status:"paagaar",fase:"Montering"},{nr:"TS-302",kunde:"Bedrift",oppdrag:"Bedriftsalarm",status:"tilbud",fase:"Tilbud sendt"},{nr:"TS-303",kunde:"Næringsbygg",oppdrag:"Adgangskontroll",status:"ny",fase:"Befaring"},{nr:"TS-304",kunde:"Bolig",oppdrag:"Kamera",status:"ny",fase:"Befaring"},{nr:"TS-305",kunde:"Byggeplass",oppdrag:"Vektertjeneste",status:"paagaar",fase:"Runder"},{nr:"TS-306",kunde:"Butikk",oppdrag:"Overvåking",status:"levert",fase:"I drift"},{nr:"TS-307",kunde:"Borettslag",oppdrag:"Boligalarm",status:"levert",fase:"I drift"},{nr:"TS-308",kunde:"Bedrift",oppdrag:"Vekter",status:"tilbud",fase:"Tilbud sendt"}];
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