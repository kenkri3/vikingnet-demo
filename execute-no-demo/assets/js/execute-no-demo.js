(function(){var h=document.documentElement;h.classList.add("js");var red=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var l=document.getElementById("kode");if(l){var c=l.getContext("2d");if(c){var W=0,H=0,dpr=1,t=0,ko=null;
var linjer=["public class Tjeneste {","  private readonly IRepo _repo;","","  public async Task<Resultat> Utfor(","      Forespørsel f) {","    var data = await _repo.Hent(f.Id);","    return Resultat.Ok(data);","  }","}"];
function s(){dpr=Math.min(window.devicePixelRatio||1,2);W=l.clientWidth;H=l.clientHeight;if(!W||!H||W<80||H<80)return false;l.width=Math.round(W*dpr);l.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0);return true;}
function tegn(){if(!W||!H)return;c.clearRect(0,0,W,H);
var fs=Math.max(8,Math.round(W*0.0165));
c.font="400 "+fs+"px ui-monospace, SFMono-Regular, Menlo, monospace";
var lh=Math.round(fs*1.85), x0=W*0.11, y0=H*0.16;
for(var i=0;i<linjer.length;i++){
var y=y0+i*lh; if(y>H-10)break;
var txt=linjer[i];
var vis=Math.floor(Math.max(0,Math.min(txt.length,(t*14)-i*7)));
c.fillStyle="rgba(241,240,236,0.22)";c.fillText(String(i+1),x0-fs*2.1,y);
var innrykk=(txt.length-txt.replace(/^ +/,"").length)*fs*0.6;
var bit=txt.slice(0,vis);
// fargelegging: nøkkelord blå, rest lys
var nokkel=/(public|private|class|readonly|async|Task|return|var|new)/;
c.fillStyle=nokkel.test(bit)?"rgba(168,198,255,0.95)":"rgba(241,240,236,0.86)";
c.fillText(bit,x0+innrykk,y);
if(i===4){c.strokeStyle="rgba(110,168,254,0.35)";c.lineWidth=1;c.beginPath();c.moveTo(W*0.05,y+fs*0.35);c.lineTo(W*0.95,y+fs*0.35);c.stroke();}
}
// markør
var rad=Math.min(linjer.length-1,Math.floor((t*2)%linjer.length));
var txt2=linjer[rad];var v=Math.floor(Math.max(0,Math.min(txt2.length,(t*14)-rad*7)));
var cw=c.measureText(txt2.slice(0,v)).width;
if(Math.floor(t*2)%2===0){c.fillStyle="rgba(110,168,254,0.85)";c.fillRect(x0+cw+2,y0+rad*lh-fs*0.95,Math.max(1.5,fs*0.09),fs*1.1);}
t+=0.012;ko=requestAnimationFrame(tegn);}
function start(){if(!ko&&!red)ko=requestAnimationFrame(tegn);}function stopp(){if(ko){cancelAnimationFrame(ko);ko=null;}}
if(s()){if(red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}else if("IntersectionObserver" in window){new IntersectionObserver(function(o){if(o[0].isIntersecting)start();else stopp();},{threshold:0.01}).observe(l);}else start();
window.addEventListener("resize",function(){if(s()&&red){t=2;tegn();if(ko){cancelAnimationFrame(ko);ko=null;}}});}}}
var av=document.querySelectorAll(".avslor");if(av.length&&"IntersectionObserver" in window&&!red){var io=new IntersectionObserver(function(o){o.forEach(function(e){if(e.isIntersecting){e.target.classList.add("er-inne");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.05});av.forEach(function(el){io.observe(el);});}else{av.forEach(function(el){el.classList.add("er-inne");});}
document.querySelectorAll("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var sv=f.querySelector(".skjema__svar");var n=f.querySelector("#navn");if(sv){sv.innerHTML="<b>Takk"+(n&&n.value?", "+n.value.split(" ")[0]:"")+"!</b>Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til epost@execute.no.";sv.classList.add("vis");sv.setAttribute("tabindex","-1");sv.focus();}f.querySelectorAll("input,textarea,select").forEach(function(x){if(x.type!=="submit")x.value="";});});});
var li=document.getElementById("oppdrag");if(li){var o=[{nr:"EX-501",kunde:"Offentlig",oppdrag:"Webløsning",status:"paagaar",fase:"Utvikling"},{nr:"EX-502",kunde:"Næringsliv",oppdrag:"API og .NET",status:"tilbud",fase:"Tilbud sendt"},{nr:"EX-503",kunde:"Selskap",oppdrag:"Mobilapp",status:"ny",fase:"Behovsavklaring"},{nr:"EX-504",kunde:"Kunde",oppdrag:"Skyløsning Azure",status:"ny",fase:"Behovsavklaring"},{nr:"EX-505",kunde:"Offentlig",oppdrag:"Integrasjon",status:"paagaar",fase:"Test"},{nr:"EX-506",kunde:"Næringsliv",oppdrag:"Web",status:"levert",fase:"Overlevert"},{nr:"EX-507",kunde:"Selskap",oppdrag:"Vedlikehold",status:"levert",fase:"Overlevert"},{nr:"EX-508",kunde:"Kunde",oppdrag:"Rådgivning",status:"tilbud",fase:"Tilbud sendt"}];
var st={ny:"Ny",tilbud:"Tilbud",paagaar:"Pågår",levert:"Levert"},rk=["ny","tilbud","paagaar","levert"],fil="alle";
function kpi(){var s2=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};s2("kpi-total",o.length);s2("kpi-tilbud",o.filter(function(x){return x.status==="tilbud";}).length);s2("kpi-paagaar",o.filter(function(x){return x.status==="paagaar";}).length);s2("kpi-levert",o.filter(function(x){return x.status==="levert";}).length);}
function stempl(s3){return '<span class="stempel stempel--'+s3+'">'+st[s3]+"</span>";}
function tegn(){var vis=o.filter(function(x){return fil==="alle"||x.status===fil;});if(!vis.length){li.innerHTML='<div class="tom">Ingen oppdrag i dette utvalget.</div>';return;}
li.innerHTML=vis.map(function(x){var i=rk.indexOf(x.status);var neste=rk[Math.min(i+1,rk.length-1)];var txt=x.status==="ny"?"Send tilbud":x.status==="tilbud"?"Start utvikling":"Merk levert";var k=x.status==="levert"?'<button class="knapp knapp--mork knapp--liten" data-opp="'+x.nr+'" data-til="ny">Gjenåpne</button>':'<button class="knapp knapp--liten" data-opp="'+x.nr+'" data-til="'+neste+'">'+txt+"</button>";
return '<article class="oppdrag__kort'+(x.status==="levert"?" oppdrag__kort--levert":"")+'"><div class="oppdrag__topp"><span class="oppdrag__nr">'+x.nr+"</span>"+stempl(x.status)+"</div><h3>"+x.oppdrag+'</h3><div class="oppdrag__meta"><span>'+x.kunde+"</span><span>"+x.fase+'</span></div><div class="oppdrag__knapper">'+k+"</div></article>";}).join("");}
function noter(t2){var ul=document.getElementById("hendelser");if(!ul)return;var el2=document.createElement("li");el2.innerHTML="<time>"+new Date().toTimeString().slice(0,5)+"</time><span>"+t2+"</span>";ul.insertBefore(el2,ul.firstChild);while(ul.children.length>12)ul.removeChild(ul.lastChild);}
li.addEventListener("click",function(e){var b=e.target.closest("button[data-opp]");if(!b)return;var x=o.find(function(y){return y.nr===b.getAttribute("data-opp");});if(!x)return;x.status=b.getAttribute("data-til");kpi();tegn();noter(x.nr+" "+x.oppdrag+" → "+st[x.status]);});
document.querySelectorAll("[data-filter]").forEach(function(kn){kn.addEventListener("click",function(){fil=kn.getAttribute("data-filter");document.querySelectorAll("[data-filter]").forEach(function(q){q.setAttribute("aria-pressed",q===kn?"true":"false");});tegn();});});
kpi();tegn();noter("Dagen åpnet. 8 oppdrag i systemet.");}
document.querySelectorAll("[data-dato]").forEach(function(el){el.textContent=new Date().toLocaleDateString("nb-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});});})();