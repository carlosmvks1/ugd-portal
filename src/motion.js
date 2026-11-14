// Movimiento del portal (combinación aprobada: A sutil + C territorial + de B
// solo la entrada de portada y la aparición de fotografías).
// Mejora progresiva: usa la Web Animations API sobre elementos ya visibles.
// No oculta textos ni controles (las entradas parten de opacidad ≥ 0,4), no
// cambia el foco ni la navegación, no fuerza cálculos de diseño dentro de un
// clic y no deja animaciones en curso. Si falla, o el sistema pide reducir
// movimiento, el portal queda igual que sin él. Ver docs/visual-system.md §6.
const media=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
const enabled=()=>!!media&&!media.matches;
const $=s=>document.querySelector(s);

export const EASE_ENTER='cubic-bezier(0,0,.3,1)';
export const DURATION={expressive:240,detail:200,zoom:320,trace:480,link:360,hero:360,photo:520};
// Resaltado de municipios de un gestor: el escalonado total no supera
// LINK_STAGGER_MAX ms y, con muchos municipios, se resaltan todos a la vez.
export const LINK_STAGGER_MAX=240,LINK_STAGGER_LIMIT=24,LINK_DURATION=DURATION.link;
export const linkStagger=n=>n>LINK_STAGGER_LIMIT||n<2?0:Math.min(30,LINK_STAGGER_MAX/(n-1));
// Todas las entradas parten de opacidad 0,4: el texto se lee desde el primer fotograma.
export const MIN_OPACITY=.4;
const RISE=[{opacity:MIN_OPACITY,transform:'translateY(6px)'},{opacity:1,transform:'none'}];

function animate(el,keyframes,options){
 if(!el?.animate||!enabled())return null;
 try{return el.animate(keyframes,{easing:EASE_ENTER,fill:'backwards',...options});}catch{return null;}
}

// ── A · Sutil y C · Territorial: cambios de estado del explorador ──
const depth=code=>!code?0:code.length<=2?1:2;
let lastTerritory='',lastGestor='',origin=null,pendingZoom=0,pendingLinked=false;

// La posición del territorio pulsado se lee en el clic, antes de que el
// explorador cambie el DOM: así no se fuerza un cálculo de diseño extra.
function rememberOrigin(e){
 const path=e.target?.closest?.('#map [data-code]');if(!path)return;
 const map=$('#map'),r=path.getBoundingClientRect(),m=map.getBoundingClientRect();
 origin=m.width&&m.height?`${((r.x+r.width/2-m.x)/m.width*100).toFixed(1)}% ${((r.y+r.height/2-m.y)/m.height*100).toFixed(1)}%`:null;
}

function onState(){
 const p=new URLSearchParams(location.search),t=p.get('territory')||'',g=p.get('gestor')||'';
 if(t!==lastTerritory){
  const detail=$('#detail');
  if(t&&detail)[...detail.children].slice(0,8).forEach((el,i)=>animate(el,RISE,{duration:DURATION.detail,delay:Math.min(i,2)*30}));
  if(t&&!lastTerritory&&innerWidth<=700)animate(detail,[{transform:'translateY(16px)'},{transform:'none'}],{duration:DURATION.expressive});
  const from=depth(lastTerritory),to=depth(t);
  pendingZoom=to>from?1:to<from?-1:0;
  if(to<=from)origin=null;
  lastTerritory=t;
 }
 if(g&&g!==lastGestor)pendingLinked=true;
 lastGestor=g;
}

function onMap(){
 const map=$('#map');if(!map)return;
 // No se atenúa el resto del mapa: medido, cambiar la opacidad de cientos de
 // trazados a la vez añadía ~25 ms a la selección (docs/visual-system.md §6).
 const pressed=map.querySelector('[aria-pressed="true"]');
 if(!map.querySelector('[data-code]'))return;
 if(pressed&&!pressed.dataset.mTraced){pressed.dataset.mTraced='1';pressed.setAttribute('pathLength','1000');animate(pressed,[{strokeDashoffset:1000},{strokeDashoffset:0}],{duration:DURATION.trace});}
 if(pendingZoom&&enabled()){
  // El acercamiento sustituye al fundido genérico del mapa (map-enter): un solo efecto.
  map.classList.remove('map-enter');map.getAnimations().forEach(a=>{if(a.id==='m-zoom')a.cancel();});
  const s=pendingZoom>0?.92:1.08,o=origin||'50% 50%';
  const a=animate(map,[{opacity:MIN_OPACITY,transform:`scale(${s})`,transformOrigin:o},{opacity:1,transform:'none',transformOrigin:o}],{duration:DURATION.zoom});
  if(a)a.id='m-zoom';
  pendingZoom=0;origin=null;
 }
 if(pendingLinked){
  pendingLinked=false;
  const linked=[...map.querySelectorAll('path[data-code]')].filter(p=>p.getAttribute('fill')==='#13294F');
  const step=linkStagger(linked.length);
  linked.forEach((p,i)=>{const a=animate(p,[{fill:'#E6E0D2'},{fill:'#13294F'}],{duration:LINK_DURATION,delay:Math.round(i*step)});if(a)a.id='m-linked';});
 }
}

function onProfile(){
 const prof=$('#ficha-gestor');
 if(prof&&!prof.dataset.mSeen){prof.dataset.mSeen='1';animate(prof.querySelector('.profile-head')||prof,RISE,{duration:DURATION.expressive});}
}

// ── De B: portada (una vez, solo si se carga arriba) y fotografías ──
function hero(){
 if(scrollY>innerHeight/2)return;
 [...document.querySelectorAll('.page-hero .hero-inner>*')].slice(0,4).forEach((el,i)=>animate(el,RISE,{duration:DURATION.hero,delay:i*60}));
}
// Solo imágenes que aún están por debajo del pliegue; el pie de foto nunca se oculta.
let io=null,safety=0;const seen=new WeakSet();
function photos(images){
 if(!enabled()||!('IntersectionObserver' in window))return;
 io||=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)reveal(e.target);},{rootMargin:'0px 0px -10% 0px'});
 for(const img of images){
  if(seen.has(img)||!img.closest('.chapter-media,.team-gallery,.portrait,.profile-head'))continue;seen.add(img);
  if(img.getBoundingClientRect().top<innerHeight)continue;
  img.classList.add('m-photo-pending');io.observe(img);
 }
 // Red de seguridad: si el observador no avisa, ninguna fotografía visible
 // queda pendiente más de 3 s. Se detiene cuando no queda ninguna pendiente.
 if(!safety&&document.querySelector('.m-photo-pending'))safety=setInterval(()=>{
  for(const img of document.querySelectorAll('.m-photo-pending'))if(img.getBoundingClientRect().top<innerHeight)reveal(img);
  if(!document.querySelector('.m-photo-pending')){clearInterval(safety);safety=0;}
 },3000);
}
function reveal(img){
 io?.unobserve(img);if(!img.classList.contains('m-photo-pending'))return;
 img.classList.remove('m-photo-pending');
 animate(img,[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0)'}],{duration:DURATION.photo});
}
function releaseAll(){document.querySelectorAll('.m-photo-pending').forEach(img=>{io?.unobserve(img);img.classList.remove('m-photo-pending');});}

// Escuchas y observadores solo existen mientras el movimiento está activo:
// con «reducir movimiento» el módulo no hace ningún trabajo.
let observer=null;
function onKey(e){if(e.key==='Enter'||e.key===' ')rememberOrigin(e);}
function start(){
 if(observer)return;
 const q=new URLSearchParams(location.search);lastTerritory=q.get('territory')||'';lastGestor=q.get('gestor')||'';
 document.addEventListener('click',rememberOrigin,true);
 document.addEventListener('keydown',onKey,true);
 window.addEventListener('ugd:state',onState);
 // Las vistas se pintan de forma asíncrona: se reacciona una vez por lote de
 // cambios y solo se examinan las imágenes nuevas.
 // La tabla, el detalle y los resultados (cientos de filas por cambio) no
 // contienen fotografías que revelar y se descartan sin recorrerlos.
 let queued=false,mapChanged=false,images=[];
 observer=new MutationObserver(records=>{
  for(const r of records){
   if(r.target.id==='map'){mapChanged=true;continue;}
   if(r.target.closest('#table,#detail,#results,#map,#context-map'))continue;
   for(const n of r.addedNodes)if(n.nodeType===1){if(n.tagName==='IMG')images.push(n);else if(n.firstElementChild)for(const img of n.getElementsByTagName('img'))images.push(img);}
  }
  if(queued)return;queued=true;
  queueMicrotask(()=>{queued=false;const batch=images;images=[];if(mapChanged){mapChanged=false;onMap();}onProfile();if(batch.length)photos(batch);});
 });
 observer.observe(document.body,{subtree:true,childList:true});
 photos(document.getElementsByTagName('img'));
}
function stop(){
 observer?.disconnect();observer=null;
 document.removeEventListener('click',rememberOrigin,true);document.removeEventListener('keydown',onKey,true);window.removeEventListener('ugd:state',onState);
 releaseAll();document.getAnimations?.().forEach(a=>{try{a.finish();}catch{}});
}

export function initMotion(){
 const root=document.documentElement;
 try{
  const sync=()=>{const on=enabled();root.classList.toggle('has-motion',on);on?start():stop();};
  sync();media?.addEventListener?.('change',sync);
  if(enabled())hero();
 }catch(error){root.classList.remove('has-motion');releaseAll();console.error(error);}
}
