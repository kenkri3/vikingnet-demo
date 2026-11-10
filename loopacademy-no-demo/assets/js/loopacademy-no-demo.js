(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("loype");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var cx=W*0.5, cy=H*0.55;
// tre baner
[[0.46,0.26],[0.38,0.21],[0.30,0.165]].forEach(function(p,i){
c.beginPath();c.ellipse(cx,cy,W*p[0],H*p[1],0,0,Math.PI*2);
c.strokeStyle="rgba(139,123,247,"+(0.16+0.1*i)+")";c.lineWidth=i===0?2:1;c.stroke();
});
// prikkar som går rundt
for(var b=0;b<3;b++){
var rx=W*[0.46,0.38,0.30][b], ry=H*[0.26,0.21,0.165][b];
var fart=0.35-b*0.09;
for(var k=0;k<10;k++){
var a=t*fart+k*(Math.PI*2/10)+b;
var x=cx+rx*Math.cos(a), y=cy+ry*Math.sin(a);
var r=(k%5===0)?3.4:2.1;
c.fillStyle="rgba(185,174,254,"+(0.35+0.45*Math.max(0,Math.sin(t*1.2+k))).toFixed(2)+")";
c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
}
}
// kjernepunkt
c.fillStyle="rgba(139,123,247,0.85)";c.beginPath();c.arc(cx,cy,4.5,0,Math.PI*2);c.fill();
c.strokeStyle="rgba(245,243,255,0.22)";c.lineWidth=1;c.beginPath();c.arc(cx,cy,12,0,Math.PI*2);c.stroke();
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til enter@loopacademy.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"LA-201",kunde:"Tech-bedrift",oppdrag:"Utvikler praksis",status:"paagaar",fase:"Praksis"},{nr:"LA-202",kunde:"Kandidat",oppdrag:"Oppstart vinter",status:"tilbud",fase:"Intervju"},{nr:"LA-203",kunde:"Bedrift",oppdrag:"Ansett utvikler",status:"ny",fase:"Behov"},{nr:"LA-204",kunde:"Kandidat",oppdrag:"Søknad",status:"ny",fase:"Screening"},{nr:"LA-205",kunde:"Tech-bedrift",oppdrag:"Praksisplass",status:"paagaar",fase:"Oppfølging"},{nr:"LA-206",kunde:"Bedrift",oppdrag:"Utvikler",status:"levert",fase:"Ansatt"},{nr:"LA-207",kunde:"Bedrift",oppdrag:"Utvikler",status:"levert",fase:"Ansatt"},{nr:"LA-208",kunde:"Kandidat",oppdrag:"Oppstart",status:"tilbud",fase:"Tilbud"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start løp":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();