import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const base='http://127.0.0.1:4173/ugd/';
const phase=process.env.ARRIVAL_PHASE||'after';
const out=resolve(process.env.SCREENSHOT_DIR||'work/arrival',phase);
await mkdir(out,{recursive:true});
const results=[];
const destinations=['institucion','descentralizacion','documentos','cobertura'];
for(const viewport of [{width:1280,height:720},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 let gate=null;
 await page.route(base+'**',async route=>{
  const path=new URL(route.request().url()).pathname.slice('/ugd'.length);
  if(gate&&path.endsWith(gate.resource)){gate.seen();await gate.promise;}
  const file=resolve('dist','.'+(path==='/'?'/index.html':path));
  try{await route.fulfill({body:await readFile(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/json'})[extname(file)]});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 const ready=async()=>{
  await page.waitForFunction(()=>document.querySelector('#map')?.getAttribute('aria-busy')==='false');
  if(phase!=='before')await page.evaluate(()=>import('./src/main.js'));
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  if(phase==='before')await page.waitForTimeout(600); // Only baseline: allow old smooth scroll to finish.
 };
 const metrics=()=>page.evaluate(id=>{const h=document.querySelector('#'+id+' h2'),r=h.getBoundingClientRect();return {headingTop:r.top,headingBottom:r.bottom,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,scrollY,focus:document.activeElement.id};},new URL(page.url()).hash.slice(1));
 async function record(destination,journey,check,extra={}){
  const m=await metrics(),evidence=`${viewport.width}x${viewport.height}-${destination}-${journey}.png`;
  let reason='';try{if(check)await check(m);else assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height,'Encabezado e inicio visibles debajo del encabezado fijo');}catch(error){reason=error.message;}
  await page.screenshot({path:resolve(out,evidence)});
  results.push({destination,viewport,journey,url:page.url(),...m,...extra,result:reason?'falla':'pasa',reason,evidence});
 }
 async function navigate(id,keyboard=false){
  if(viewport.width<850)await page.locator('#nav-toggle').click();
  const a=page.locator(`#site-nav a[href="#${id}"]`);
  if(keyboard){await a.focus();await page.keyboard.press('Enter');}else await a.click();
  await ready();
 }
 for(const destination of destinations){
  await page.goto(base);await page.locator(`main a[href$="#${destination}"]`).click();await ready();
  await record(destination,'home',phase==='before'?null:m=>{assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height);assert(m.focus);});
  if(phase==='before')continue;
  await page.goto(base+'portal.html#'+destination);await ready();
  await record(destination,'direct',m=>{assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height);assert.equal(m.focus,'');});
  const normalized=page.url();
  await page.reload();await ready();
  await record(destination,'reload',m=>{assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height);assert.equal(m.focus,'');assert.equal(page.url(),normalized);});
  const original=(await metrics()).scrollY;
  await navigate(destination==='cobertura'?'institucion':'cobertura');
  await page.goBack();await ready();
  await record(destination,'back',m=>{assert.equal(page.url(),normalized);assert(Math.abs(m.scrollY-original)<2);assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height);});
  await page.goBack();await ready(); // Native history may now return to the earlier direct entry.
  await page.goForward();await ready();
  await record(destination,'forward',m=>{assert.equal(page.url(),normalized);assert(Math.abs(m.scrollY-original)<2);assert(m.headingTop>=m.headerBottom&&m.headingBottom+30<viewport.height);});
 }
 if(phase!=='before'){
  await page.goto(base+'portal.html#institucion');await ready();
  const urls=[page.url()];
  for(const id of destinations.slice(1)){await navigate(id);urls.push(page.url());}
  for(let i=2;i>=0;i--){await page.goBack();await ready();await record(destinations[i],'sequence-back',()=>assert.equal(page.url(),urls[i]));}
  for(let i=1;i<4;i++){await page.goForward();await ready();await record(destinations[i],'sequence-forward',()=>assert.equal(page.url(),urls[i]));}
  await navigate('cobertura');await navigate('cobertura');await page.goBack();await ready();
  await record('documentos','repeat-no-duplicate',()=>assert.equal(page.url(),urls[2]));
  await page.goForward();await ready();await record('cobertura','repeat-forward',()=>assert.equal(page.url(),urls[3]));
  // Shared state and an actively selected territory, with a non-anchor saved position.
  for(const source of ['selection','shared']){
   await page.goto(base+'portal.html'+(source==='shared'?'?territory=13#cobertura':'#cobertura'));await ready();
   if(source==='selection'){await page.locator('#map [data-code="13"]').click();await ready();}
   await page.evaluate(()=>scrollTo({top:350,behavior:'instant'}));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const selectedURL=page.url(),selectedY=await page.evaluate(()=>scrollY);
   await navigate('documentos');const next=page.url();
   await page.goBack();await ready();
   await record('cobertura',source+'-back',m=>{assert.equal(page.url(),selectedURL);assert.equal(new URL(page.url()).searchParams.get('territory'),'13');assert(Math.abs(m.scrollY-selectedY)<2);});
   await page.goForward();await ready();
   await record('documentos',source+'-forward',()=>{assert.equal(page.url(),next);assert.equal(new URL(page.url()).searchParams.get('territory'),'13');});
  }
  for(const action of ['navigate','wheel','rapid','keyboard','municipal-navigate','municipal-wheel']){
   let release,seen;
   const promise=new Promise(r=>release=r),requested=new Promise(r=>seen=r);
   const resource=action.startsWith('municipal')?'municipios-13.geojson':action==='keyboard'?'archive.json':'departamentos.geojson';
   gate={resource,promise,seen};
   await page.goto(base+'portal.html'+(action.startsWith('municipal')?'?territory=13':'')+'#institucion',{waitUntil:'domcontentloaded'});await requested;
   const beforeURL=page.url();
   if(action.endsWith('navigate')||action==='rapid'){
    for(const id of action==='rapid'?['descentralizacion','documentos','cobertura','documentos']:['documentos']){
     if(viewport.width<850)await page.locator('#nav-toggle').click();
     await page.locator(`#site-nav a[href="#${id}"]`).click();
    }
   }else if(action.endsWith('wheel')){
    await page.mouse.move(30,300);await page.mouse.wheel(0,200);
    await page.waitForFunction(()=>scrollY>0);
   }else{await page.locator('#nav-toggle').focus();await page.keyboard.press('PageDown');}
   const prior=await page.evaluate(()=>({y:scrollY,focus:document.activeElement.id}));
   // Record calls, not browser anchoring, to distinguish programmatic correction from user scroll.
   await page.evaluate(()=>{window.arrivalScrollCalls=[];const original=window.scrollTo;window.scrollTo=(...args)=>{window.arrivalScrollCalls.push(args);return original.apply(window,args);};});
   gate=null;release();await ready();
   await record(new URL(page.url()).hash.slice(1),'delayed-'+action,async m=>{
    if(action.endsWith('navigate')||action==='rapid'){assert.equal(new URL(page.url()).hash,'#documentos');assert.equal(m.focus,'documents-title');assert(m.headingTop>=m.headerBottom&&m.headingBottom<viewport.height);}
    else{assert.equal(new URL(page.url()).hash,new URL(beforeURL).hash);assert.equal(new URL(page.url()).search,(action.startsWith('municipal')?'?territory=13&':'?')+'year=2024&snapshot=2024-v1&layer=status');assert.equal(m.focus,prior.focus);assert.deepEqual(await page.evaluate(()=>window.arrivalScrollCalls),[]);}
   },{resource,releasedAfterInteraction:true,beforeRelease:prior});
  }
  await page.goto(base+'portal.html#institucion');await ready();await navigate('documentos',true);
  await record('documentos','keyboard-menu',async m=>{assert.equal(m.focus,'documents-title');assert.equal(await page.locator('#documents-title').getAttribute('tabindex'),'-1');assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false');});
  await page.emulateMedia({reducedMotion:'reduce'});await navigate('descentralizacion');
  await record('descentralizacion','reduced-motion');
  await page.emulateMedia({reducedMotion:'no-preference'});
 }
 await page.close();
}
await writeFile(resolve(out,'matrix.json'),JSON.stringify(results,null,2));
await writeFile(resolve(out,'index.md'),'# Evidencia de llegada — '+phase+'\n\nViewport móvil emulado en Chromium; no es un dispositivo físico.\n\n| Tamaño | Destino | Recorrido | Resultado | Encabezado / fijo (px) | URL | Captura |\n|---|---|---|---|---|---|---|\n'+results.map(r=>`| ${r.viewport.width} × ${r.viewport.height} | ${r.destination} | ${r.journey} | ${r.result}${r.reason?' — '+r.reason.replaceAll('\n',' '):''} | ${r.headingTop.toFixed(1)} / ${r.headerBottom.toFixed(1)} | ${r.url} | [imagen](${r.evidence}) |`).join('\n')+'\n');
console.log(`${phase}: ${results.filter(r=>r.result==='pasa').length}/${results.length} pasa`);
for(const r of results.filter(r=>r.result==='falla'))console.log(r.viewport.width,r.destination,r.journey,r.reason);
await browser.close();
if(phase!=='before')assert(results.every(r=>r.result==='pasa'),'Hay casos de llegada fallidos; consulte matrix.json');
