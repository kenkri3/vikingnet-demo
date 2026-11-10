(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("logo");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null,merker=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);
if(!merker.length){for(var i=0;i<7;i++)merker.push({x:0.12+ (i%4)*0.26, y:0.2+Math.floor(i/4)*0.34, type:i%4, fase:i*0.4});}
return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
merker.forEach(function(m){
var s1=Math.min(1,Math.max(0,(t*1.5-m.fase)));
if(s1<=0)return;
var x=W*m.x, y=H*m.y, rr=Math.min(W,H)*0.055*s1;
c.save();c.translate(x,y);c.rotate(Math.sin(t*0.6+m.fase)*0.12);
c.strokeStyle="rgba(232,176,75,"+(0.30+0.4*s1).toFixed(2)+")";c.lineWidth=2;
if(m.type===0){c.beginPath();c.arc(0,0,rr,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,rr*0.55,0,Math.PI*2);c.stroke();}
else if(m.type===1){c.strokeRect(-rr*0.8,-rr*0.8,rr*1.6,rr*1.6);}
else if(m.type===2){c.beginPath();c.moveTo(0,-rr);c.lineTo(rr,-rr*0.2);c.lineTo(rr*0.4,rr);c.lineTo(-rr*0.4,rr);c.lineTo(-rr,-rr*0.2);c.closePath();c.stroke();}
else {c.beginPath();c.moveTo(-rr,rr*0.5);c.lineTo(0,-rr*0.7);c.lineTo(rr,rr*0.5);c.closePath();c.stroke();}
c.restore();
});
t+=0.008;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring +47 38 32 14 06 eller skriv til netstore@rpprofil.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("ordre");if(li){var o=[{nr:"RP-301",kunde:"Bedrift",oppdrag:"Hettegensere med logo",status:"paagaar",fase:"Produksjon"},{nr:"RP-302",kunde:"Klubb",oppdrag:"Handlenett",status:"tilbud",fase:"Tilbud sendt"},{nr:"RP-303",kunde:"Kommune",oppdrag:"Vernesko og klær",status:"ny",fase:"Forespørsel"},{nr:"RP-304",kunde:"Forening",oppdrag:"Drikkeflasker",status:"ny",fase:"Forespørsel"},{nr:"RP-305",kunde:"Bedrift",oppdrag:"Profilklær",status:"paagaar",fase:"Trykk"},{nr:"RP-306",kunde:"Skole",oppdrag:"T-skjorter",status:"levert",fase:"Sendt"},{nr:"RP-307",kunde:"Bedrift",oppdrag:"Stålkopper",status:"levert",fase:"Sendt"},{nr:"RP-308",kunde:"Kommune",oppdrag:"Dispensere",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen ordrer i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start produksjon":"Merk sendt";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 ordrer i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();