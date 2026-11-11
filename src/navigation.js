// One coordinator per document. Layout producers report their actual completion;
// no DOM polling, resize observation, or repeated scroll correction is needed.
let controller;
const entryKey='ugdEntry';
const positions=new Map();
let currentKey;
let pendingLayout=0;
let booted=false;
export function trackLayout(promise){
 pendingLayout++;
 return Promise.resolve(promise).finally(()=>{pendingLayout--;controller?.settle();});
}
export function layoutReady(){booted=true;controller?.settle();}
function key(){return crypto.randomUUID();}
function savePosition(){
 if(currentKey)positions.set(currentKey,[scrollX,scrollY]);
 if(positions.size>100)positions.delete(positions.keys().next().value);
}
export function writeHistory(url,push=false){
 const changed=new URL(url,location.href).href!==location.href;
 if(push&&changed){
  savePosition();currentKey=key();
  history.pushState({[entryKey]:currentKey},'',url);
 }else history.replaceState({...history.state,[entryKey]:currentKey},'',url);
}
export function initNavigation(){
 if(controller)return controller;
 const home=document.body.classList.contains('institutional-home');
 currentKey=history.state?.[entryKey]||key();
 history.replaceState({...history.state,[entryKey]:currentKey},'');
 history.scrollRestoration='manual';
 let intent=null,frame=0,handledURL=location.href;
 const cancel=()=>{if(intent)clearTimeout(intent.timer);intent=null;cancelAnimationFrame(frame);};
 function settle(){
  if(!intent||(!home&&!booted)||pendingLayout)return;
  cancelAnimationFrame(frame);
  const active=intent;
  frame=requestAnimationFrame(()=>{
   if(intent!==active||pendingLayout)return;
   const target=document.getElementById(active.hash.slice(1));
   const heading=target?.querySelector('h1,h2')||target;
   if(!active.position&&!target){cancel();return;}
   const header=document.querySelector('.site-header');
   const top=active.position?.[1]??Math.max(0,scrollY+target.getBoundingClientRect().top-(header?.getBoundingClientRect().height||0)-20);
   const left=active.position?.[0]||0;
   cancel();
   if(active.focus&&heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
   // Explicit instant behavior also overrides the existing CSS smooth behavior.
   window.scrollTo({left,top,behavior:'instant'});
   savePosition();
  });
 }
 function arrive({focus=false,position=null}={}){
  cancel();
  handledURL=location.href;
  intent={hash:location.hash,focus,position,timer:setTimeout(cancel,20000)};
  settle();
 }
 controller={settle,cancel};
 window.addEventListener('scroll',savePosition,{passive:true});
 window.addEventListener('pagehide',()=>{
  savePosition();cancel();
  try{sessionStorage.setItem('ugdPositions',JSON.stringify([...positions]));}catch{/* Storage may be disabled. */}
 });
 try{for(const [id,value] of JSON.parse(sessionStorage.getItem('ugdPositions')||'[]'))positions.set(id,value);}catch{/* Optional cross-document restoration. */}
 window.addEventListener('popstate',()=>{
  currentKey=history.state?.[entryKey]||key();
  // Explorer's popstate listener synchronously rebuilds and registers map work.
  queueMicrotask(()=>{
   // Removed nodes naturally return focus to body. If a retained node became
   // hidden (e.g. a collapsed mobile menu), use its visible navigation toggle.
   if(document.activeElement!==document.body&&!document.activeElement.checkVisibility())document.querySelector('#nav-toggle')?.focus({preventScroll:true});
   arrive({position:positions.get(currentKey)});
  });
 });
 window.addEventListener('pageshow',event=>{if(event.persisted)arrive({position:positions.get(currentKey)});});
 window.addEventListener('hashchange',()=>{if(handledURL!==location.href)arrive();});
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
  const url=new URL(link.href);
  if(url.origin!==location.origin||!url.hash)return;
  if(url.pathname!==location.pathname||url.search!==location.search){
   if(url.pathname.endsWith('/portal.html')){
    try{sessionStorage.setItem('ugdArrival',JSON.stringify({url:url.href,time:Date.now()}));}catch{/* Navigation still works without storage. */}
   }
   return;
  }
  event.preventDefault();
  writeHistory(url,true);
  arrive({focus:true});
 });
 const userScroll=()=>cancel();
 window.addEventListener('wheel',userScroll,{passive:true});
 window.addEventListener('touchmove',userScroll,{passive:true});
 window.addEventListener('pointerdown',event=>{if(event.clientX>=document.documentElement.clientWidth)cancel();},{passive:true});
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.target.closest('input,textarea,select,[contenteditable="true"],[role="button"]'))return;
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)&&!(event.key===' '&&event.target.closest('button')))cancel();
 });
 const navigationType=performance.getEntriesByType('navigation')[0]?.type;
 let focus=false;
 try{
  const incoming=JSON.parse(sessionStorage.getItem('ugdArrival')||'null');
  sessionStorage.removeItem('ugdArrival');
  focus=navigationType==='navigate'&&incoming?.url===location.href&&Date.now()-incoming.time<20000;
 }catch{/* A direct URL never requests focus. */}
 if(!home)trackLayout(document.fonts.ready);
 arrive({focus,position:navigationType==='back_forward'?positions.get(currentKey):null});
 return controller;
}
