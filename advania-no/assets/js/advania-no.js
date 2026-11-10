(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("modul");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
var bokser=[];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);
if(!bokser.length){var rutenett=[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[1,2]];bokser=rutenett.map(function(p,i){return {x:p[0],y:p[1],i:i,lys:Math.random()*0.5};});}
return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var bw=W*0.22,bh=H*0.19,luke=W*0.032;
bokser.forEach(function(b){
var x=W*0.08+b.x*(bw+luke),y=H*0.12+b.y*(bh+luke*0.7);
var syn=Math.min(1,Math.max(0,(t*1.6-b.i*0.13)));
if(syn<=0)return;
var puls=0.5+0.5*Math.sin(t*1.6+b.i);
c.fillStyle="rgba(255,92,138,"+(0.05+0.10*puls*syn).toFixed(3)+")";
c.fillRect(x,y,bw*syn,bh*syn);
c.strokeStyle="rgba(238,241,245,"+(0.14+0.22*syn).toFixed(2)+")";c.lineWidth=1;
c.strokeRect(x+0.5,y+0.5,bw*syn-1,bh*syn-1);
c.fillStyle="rgba(238,241,245,0.55)";
c.fillRect(x+8,y+10,Math.max(4,bw*0.28),2);
c.fillRect(x+8,y+16,Math.max(4,bw*0.18),2);
});
// koplingar
c.strokeStyle="rgba(255,154,181,0.35)";c.lineWidth=1.4;
for(var i=0;i<bokser.length-1;i++){var a=bokser[i],b2=bokser[i+1];
var ax=W*0.08+a.x*(bw+luke)+bw*0.5, ay=H*0.12+a.y*(bh+luke*0.7)+bh*0.5;
var bx=W*0.08+b2.x*(bw+luke)+bw*0.5, by=H*0.12+b2.y*(bh+luke*0.7)+bh*0.5;
if(t*1.6<i*0.13)continue;
c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();}
t+=0.008;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=3;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ta kontakt via skjemaet på advania.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"AD-901",kunde:"Kommune",oppdrag:"Plattform og skytjenester",status:"paagaar",fase:"Migrering"},{nr:"AD-902",kunde:"Næringsliv",oppdrag:"AI-pilot",status:"tilbud",fase:"Tilbud sendt"},{nr:"AD-903",kunde:"Helse",oppdrag:"Sikkerhet og drift",status:"ny",fase:"Kartlegging"},{nr:"AD-904",kunde:"Industri",oppdrag:"Datagrunnlag",status:"ny",fase:"Kartlegging"},{nr:"AD-905",kunde:"Offentlig",oppdrag:"Rådgivning",status:"paagaar",fase:"Workshop"},{nr:"AD-906",kunde:"Bank",oppdrag:"Infrastruktur",status:"levert",fase:"Ferdig"},{nr:"AD-907",kunde:"Handel",oppdrag:"App-utvikling",status:"levert",fase:"Ferdig"},{nr:"AD-908",kunde:"Energi",oppdrag:"Driftsstøtte",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start prosjekt":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();