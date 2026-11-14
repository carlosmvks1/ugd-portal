import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {validateExplorer} from './validate-explorer.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[],externalRequests=[];
page.setDefaultTimeout(15000);
let failureMode=null, archiveRequests=0, emptyArchive=false;
let failGeometry=false,injectInternalFields=false;
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173/ugd/';
page.on('request',request=>{if(!request.url().startsWith(base))externalRequests.push(request.url());});
await page.route(base+'**',async route=>{
 const path=new URL(route.request().url()).pathname.slice('/ugd'.length);requests.push(path);
 if(failGeometry&&path.endsWith('municipios-13.geojson'))return route.fulfill({status:503,body:'Unavailable'});
 if(path.endsWith('/config.json')&&failureMode==='config')return route.fulfill({status:503,body:'Unavailable'});
 if(path.endsWith('/catalog.json')&&failureMode==='absent')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({snapshots:[]})});
 if(path.endsWith('/archive.json')){
  archiveRequests++;
  if(failureMode==='http')return route.fulfill({status:503,body:'Unavailable'});
  if(failureMode==='json')return route.fulfill({status:200,contentType:'application/json',body:'{'});
  if(failureMode==='incomplete')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({snapshots:[]})});
  if(emptyArchive){
   const data=JSON.parse(await readFile(resolve('dist/data/explorer/archive.json'),'utf8'));
   data.snapshots=[];data.coverage=[];data.departments=[];
   validateExplorer(data); // Ausencia válida, sin referencias a cortes inexistentes.
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  }
  if(['period','verification'].includes(failureMode)){
   const data=JSON.parse(await readFile(resolve('dist/data/explorer/archive.json'),'utf8'));
   delete data.snapshots[0][failureMode==='period'?'period_start':'verification_status'];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  }
  if(failureMode==='nested'){
   const data=JSON.parse(await readFile(resolve('dist/data/explorer/archive.json'),'utf8'));
   delete data.snapshots[0].indicators;
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  }
 }
 const file=resolve('dist','.'+(path==='/'?'/index.html':path));
 if(injectInternalFields&&path.endsWith('/archive.json')){
  const data=JSON.parse(await readFile(file,'utf8')),marker='SYNTHETIC_AUDIT_MARKER';
  data.coverage.find(r=>r.coverage_status==='reported').internal_note=marker;
  data.snapshots[0].internal_note=marker;data.sources[0].internal_note=marker;
  data.data_quality_issues[0].internal_note=marker;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 }
 try{await route.fulfill({status:200,contentType:({'.html':'text/html','.js':'text/javascript','.json':'application/json','.geojson':'application/json','.css':'text/css'})[extname(file)],body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
});
const sections=['inicio','la-ugd','descentralizacion','presencia','inversion','equipos','contacto'];
const anchorClear=id=>page.waitForFunction(id=>{const e=document.querySelector('#'+id+' h1, #'+id+' h2'),h=document.querySelector('.institutional-header').getBoundingClientRect(),y=e.getBoundingClientRect().top;return y>=h.bottom-1&&(y<h.bottom+200||scrollY+innerHeight>=document.documentElement.scrollHeight-1&&y<innerHeight-40);},id).catch(async error=>{throw new Error('Ancla #'+id+': '+JSON.stringify(await page.evaluate(id=>({hash:location.hash,y:document.querySelector('#'+id+' h1, #'+id+' h2').getBoundingClientRect().top,header:document.querySelector('.institutional-header').getBoundingClientRect().bottom,scrollY,max:document.documentElement.scrollHeight-innerHeight}),id)),{cause:error});});
try{
 // Una sola página: encabezado fijo, menú único con las 7 secciones en orden.
 await page.goto(base);
 await page.locator('#map path[data-code]').first().waitFor();
 assert.deepEqual(errors,[],'Errores JavaScript durante la carga inicial');
 assert.equal(await page.locator('h1').count(),1);
 assert.equal(await page.locator('h1').innerText(),'Unidad de Gestión Descentralizada');
 assert.equal(await page.locator('.institutional-header').evaluate(el=>getComputedStyle(el).position),'sticky');
 assert.deepEqual(await page.locator('#site-nav a').evaluateAll(a=>a.map(x=>x.getAttribute('href'))),sections.map(s=>'#'+s));
 assert.deepEqual(await page.locator('main > section').evaluateAll(s=>s.map(x=>x.id)),sections,'Las secciones siguen el orden del menú');
 assert.equal(new URL(page.url()).search,'','Los valores predeterminados no se escriben en la dirección');
 const headingLevels=await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes=>nodes.map(el=>({level:Number(el.tagName.slice(1)),text:el.innerText.trim().slice(0,60)})));
 assert.equal(headingLevels[0].level,1);
 const headingJumps=headingLevels.filter((heading,index)=>index>0&&heading.level>headingLevels[index-1].level+1);
 assert.deepEqual(headingJumps,[],'Jerarquía de encabezados sin saltos: '+JSON.stringify(headingJumps));
 // Módulos retirados del flujo público.
 for(const id of ['observatorio','documentos','convenios','modelo','informacion','institutional-records'])assert.equal(await page.locator('#'+id).count(),0,'Retirado: '+id);
 const text=await page.locator('main').innerText();
 for(const word of ['snapshot','JSON','Observatorio','Biblioteca'])assert(!text.includes(word),'Lenguaje interno visible: '+word);
 // Secciones sin material visibles con «En preparación».
 for(const id of ['la-ugd','descentralizacion','inversion','equipos','contacto'])assert(await page.locator(`#${id} .badge-prep`).count()>0,'Sección en preparación: '+id);
 // Datos clave con fuente y estado de verificación.
 assert.equal(await page.locator('#fact-population').innerText(),'1,592,136');
 assert.equal(await page.locator('#fact-municipalities').innerText(),'89');
 assert.match(await page.locator('#fact-municipalities-note').innerText(),/89.*93/);
 assert.match(await page.locator('#facts-source').innerText(),/2024.*Fuente.*provisionales.*Pendiente de verificación oficial/);
 // Sin fotografías autorizadas: portada tipográfica y ningún marco vacío ni degradado.
 assert.equal(await page.locator('#inicio.has-photo, .chapter-head.has-media, main figure').count(),0,'Sin fotografías publicadas');
 assert.equal(await page.locator('[data-slot="home"]').evaluate(el=>el.childElementCount),0,'Portada sin imagen de relleno');
 for(const slot of ['ugd','decentralization','territory'])assert(await page.locator(`[data-slot="${slot}"]`).isHidden(),'Lugar sin foto oculto: '+slot);
 assert.match(await page.locator('#hero-lead').innerText(),/Conozca qué hace la UGD/,'Mensaje propuesto mientras no haya uno aprobado');
 assert.match(await page.locator('[data-block="direccion-ugd"]').innerText(),/En preparación[\s\S]*Dirección de la UGD/i);
 assert.equal(await page.locator('[data-block="direccion-ugd"] img').count(),0);
 assert.match(await page.locator('#equipos').innerText(),/En preparación/i);
 if(process.env.SCREENSHOT_DIR){
  await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-desktop.png'),fullPage:true});
 }
 for(const width of [320,390,768,850,1024,1440]){
  await page.setViewportSize({width,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desbordamiento en '+width);
 }
 await page.setViewportSize({width:390,height:844});
 if(process.env.SCREENSHOT_DIR)await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-mobile.png'),fullPage:true});
 const enlarged=await page.addStyleTag({content:':root{font-size:200%} main{line-height:1.5;letter-spacing:.12em;word-spacing:.16em} main p{margin-bottom:2em}'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Texto ampliado y espaciado');
 await enlarged.evaluate(el=>el.remove());
 // Menú móvil con teclado.
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 assert(await page.locator('#site-nav').isHidden());
 await page.locator('#nav-toggle').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Tab');assert.equal(await page.locator('#site-nav a').first().evaluate(el=>el===document.activeElement),true);
 await page.keyboard.press('Escape');
 assert(await page.locator('#site-nav').isHidden());
 assert(await page.locator('#nav-toggle').evaluate(el=>el===document.activeElement));
 await page.locator('#nav-toggle').click();
 await page.locator('#site-nav a[href="#inversion"]').click();
 await page.waitForFunction(()=>location.hash==='#inversion');
 assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false','El menú se cierra al navegar');
 await anchorClear('inversion');
 // Escritorio: cada enlace del menú lleva a su sección sin quedar bajo el encabezado.
 await page.setViewportSize({width:1440,height:900});
 for(const id of sections.slice(1)){
  await page.locator(`#site-nav a[href="#${id}"]`).click();
  await page.waitForFunction(id=>location.hash==='#'+id,id);
  await anchorClear(id);
 }
 // Botones de inicio.
 await page.goto(base);await page.locator('#map path[data-code]').first().waitFor();
 await page.locator('.hero-buttons a[href="#presencia"]').click();await anchorClear('presencia');
 // Enlaces antiguos de portal.html y anclas retiradas.
 await page.goto(base+'portal.html#institucion');await page.waitForURL(url=>url.pathname.endsWith('/index.html')&&url.hash==='#la-ugd');
 await page.goto(base+'portal.html#documentos');await page.waitForURL(url=>url.hash==='#inicio');
 await page.goto(base+'portal.html?year=2024&territory=1301&utm_source=ejemplo#cobertura');
 await page.waitForURL(url=>url.pathname.endsWith('/index.html')&&url.hash==='#presencia');
 assert.equal(new URL(page.url()).searchParams.get('utm_source'),'ejemplo','Conservar parámetros desconocidos');
 await page.locator('#map path[data-code="1301"]').waitFor();
 assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.goto(base+'#cobertura');await page.waitForFunction(()=>location.hash==='#presencia');
 await page.goto(base+'#ancla-no-reconocida');assert.equal(new URL(page.url()).hash,'#ancla-no-reconocida');
 // Enlaces antiguos: filtros retirados (gestor histórico, convenio) y anclas de etiquetas.
 await page.goto(base+'?territory=1301&manager=label-001&agreement=vigente#gestor-label-001');await page.locator('#map path[data-code="1301"]').waitFor();
 assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 assert.equal(await page.locator('#etiquetas-historicas').getAttribute('open'),'');
 await page.locator('#care').selectOption('I');
 assert(!/manager=|agreement=/.test(page.url()),'Parámetros retirados eliminados de la URL');
 await page.goto(base+'?gestor=no-confirmado#ficha-gestor');await page.locator('#map path[data-code]').first().waitFor();
 assert.match(await page.locator('#manager-profile').innerText(),/No se encontró la ficha/);
 // Mapa simplificado: nivel de atención y buscador a la vista; el resto en «Más filtros».
 requests.length=0;
 await page.goto(base);
 await page.locator('#map path[data-code]').first().waitFor();
 assert(await page.locator('#care').isVisible());assert(await page.locator('#search').isVisible());
 assert.equal(await page.locator('.advanced-filters').getAttribute('open'),null);
 for(const id of ['year','snapshot','layer'])assert(await page.locator('#'+id).isHidden(),'Filtro secundario oculto: '+id);
 for(const id of ['manager','agreement'])assert.equal(await page.locator('#'+id).count(),0,'Filtro retirado: '+id);
 // Sin directorio publicado: el filtro de gestor existe, deshabilitado y explicado.
 assert(await page.locator('#gestor').isVisible());assert.equal(await page.locator('#gestor').isDisabled(),true);
 assert.match(await page.locator('#gestor option').first().innerText(),/Sin gestores confirmados/);
 assert.match(await page.locator('#status').innerText(),/provisionales.*Pendiente de verificación oficial/);
 assert((await page.locator('#atlas-title').innerText()).includes('Honduras'));
 // Lista equivalente al mapa y gestores.
 assert.equal(await page.locator('#table tbody tr').count(),18);
 assert.equal(await page.locator('#manager-list li').count(),39);
 assert.match(await page.locator('#manager-list').textContent(),/no son identidades jurídicas confirmadas.*todavía no ha confirmado/s);
 assert(await page.locator('#etiquetas-historicas').isVisible(),'Etiquetas históricas disponibles');
 assert.match(await page.locator('#manager-directory').innerText(),/todavía no ha publicado su directorio/);
 assert.equal(await page.locator('#ficha-gestor').count(),0);
 assert.match(await page.locator('#table thead').textContent(),/Gestores vinculados/);
 assert.equal(await page.locator('#map path[data-code]').count(),18);
 assert(!requests.some(p=>p.includes('municipios-')),'Carga municipal prematura');
 await page.locator('#map path[data-code="13"]').hover();
 assert((await page.locator('#tooltip').innerText()).includes('28 / 28'));
 assert((await page.locator('#tooltip').innerText()).includes('Con cobertura reportada'));
 const before=await page.locator('#tooltip').boundingBox();await page.mouse.move(before.x+5,before.y+5);const after=await page.locator('#tooltip').boundingBox();assert.equal(before.x,after.x);
 await page.locator('#map path[data-code="13"]').click();await page.locator('#map path[data-code="1301"]').waitFor();assert.equal(await page.locator('#map path[data-code]').count(),28);
 assert.equal(await page.locator('#detail h2').innerText(),'Lempira');
 assert.equal(await page.locator('#atlas-title').innerText(),'Lempira');
 assert((await page.locator('#atlas-subtitle').innerText()).includes('28 de 28'));
 assert.equal(await page.locator('#context-map-wrap').isVisible(),true);
 assert.equal(await page.locator('#context-map path.context-selected').count(),1);
 assert(/período/i.test(await page.locator('.provenance-rail').innerText()));
 assert.match(await page.locator('#detail').innerText(),/Gestores vinculados\s*La UGD no ha confirmado el gestor[^]*no significa que el territorio carezca de gestor/i);
 assert.match(await page.locator('#detail .detail-verification').innerText(),/provisionales.*Pendiente de verificación oficial/);
 assert((await page.locator('#detail .detail-metrics').innerText()).includes('28 / 28'));
 assert((await page.locator('#detail .detail-metrics').innerText()).includes('100.0%'));
 await page.locator('#map path[data-code="1301"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.reload();await page.locator('#map path[data-code="1301"]').waitFor();assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.locator('#calidad summary').first().click();
 const download=page.waitForEvent('download');await page.locator('#json').click();assert((await download).suggestedFilename().includes('2024-v1-1301'));
 await page.locator('#home').click();await page.locator('#map path[data-code="13"]').waitFor();
 await page.goBack();await page.locator('#map path[data-code="1301"]').waitFor();assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.locator('#search').fill('intibuca');assert(await page.locator('#results button').count()>0);
 await page.locator('#search').fill('Gracias');await page.locator('#results button').filter({hasText:'Gracias · 1301'}).click();
 await page.locator('#care').selectOption('I');assert(new URL(page.url()).searchParams.get('care')==='I');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#detail').evaluate(el=>getComputedStyle(el).position),'fixed');
 await page.locator('#expand').click();assert(await page.locator('#detail').evaluate(el=>el.classList.contains('expanded')));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desbordamiento horizontal');
 if(process.env.SCREENSHOT_DIR){
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-mobile-territory.png'),fullPage:false});
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-desktop-territory.png'),fullPage:false});
 }
 await page.setViewportSize({width:1440,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base);await page.locator('#map path[data-code]').first().waitFor();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base+'?year=2026&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();assert((await page.locator('#status').innerText()).includes('Sin datos publicados'));assert(await page.locator('#csv').isDisabled());assert(!(await page.locator('#detail').innerText()).includes('62,863'));
 // Empezar en otro departamento detecta geometrías y eventos obsoletos.
 await page.goto(base+'?territory=05');await page.locator('#map path[data-code="0501"]').waitFor();
 failGeometry=true;await page.locator('#search').fill('Lempira');await page.locator('#results button').filter({hasText:'Lempira · 13'}).click();
 await page.locator('#retry-map').waitFor();assert.equal(await page.locator('#table tbody tr').count(),28);
 assert.equal(await page.locator('#detail h2').innerText(),'Lempira');
 assert.equal(await page.locator('#map path[data-code]').count(),0,'No dejar el mapa anterior activo');
 assert.equal(await page.locator('#context-map path').count(),0);
 assert.equal(await page.locator('#context-map-wrap').isVisible(),false);
 failGeometry=false;await page.locator('#retry-map').click();await page.locator('#map path[data-code="1301"]').waitFor();
 await page.locator('#home').click();await page.locator('#map path[data-code="13"]').waitFor();await page.locator('#map path[data-code="13"]').focus();await page.keyboard.press('Enter');await page.locator('#map path[data-code="1301"]').waitFor();await page.locator('#map path[data-code="1301"]').focus();await page.keyboard.press('Escape');await page.locator('#map path[data-code="13"]').waitFor();
 // Una fuente de ejecución contaminada tampoco debe propagar campos internos
 // a los metadatos ni a las filas de las descargas.
 injectInternalFields=true;await page.goto(base);await page.locator('#map path[data-code]').first().waitFor();
 await page.locator('#calidad summary').first().click();
 for(const kind of ['json','csv']){
  const pending=page.waitForEvent('download');await page.locator('#'+kind).click();const downloaded=await pending;
  const text=await readFile(await downloaded.path(),'utf8');assert(!text.includes('SYNTHETIC_AUDIT_MARKER'));
  if(kind==='json'){const json=JSON.parse(text);assert.equal(json.rows.length,93);assert(!/agreement/.test(JSON.stringify(json)),'Exportación sin convenios');}else assert(!/agreement/.test(text),'CSV sin convenios');
 }
 injectInternalFields=false;
 // La página institucional sigue disponible si fallan los datos; reintento serializado.
 for(const mode of ['absent','http','json','incomplete','nested','config','period','verification']){
  failureMode=mode;
  await page.goto(base);
  await page.locator('#retry').waitFor({state:'visible'});
  assert.equal(await page.locator('#ugd-title').count(),1);
  assert.match(await page.locator('#facts-source').innerText(),/Todavía no hay|No se pudieron/);
  assert.match(await page.locator('#status').innerText(),/Todavía no hay|No se pudieron/);
  await page.locator('#site-nav a[href="#la-ugd"]').click();
  assert.equal(new URL(page.url()).hash,'#la-ugd');
  failureMode=null;archiveRequests=0;
  await page.locator('#retry').evaluate(el=>{el.click();el.click();el.click();});
  await page.locator('#map path[data-code]').first().waitFor();
  assert.equal(archiveRequests,1,'Reintento concurrente duplicado');
  assert.equal(await page.locator('#manager-list li').count(),39);
  assert.equal(await page.locator('#fact-population').innerText(),'1,592,136');
  assert(await page.locator('#retry').isHidden());
 }
 // El contrato admite un archivo sin cortes: no deducir período ni verificación de sus fuentes.
 emptyArchive=true;
 await page.goto(base);
 await page.locator('#map path[data-code]').first().waitFor();
 assert.equal(await page.locator('#facts-source').innerText(),'Todavía no hay datos territoriales publicados.');
 assert.equal(await page.locator('#manager-list li').count(),39);
 assert(await page.locator('#retry').isHidden());
 assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[],'El portal no debe solicitar fuentes ni servicios externos');console.log('Navegador: página única con 7 secciones, menú, secciones en preparación, datos clave, enlaces antiguos, mapa simplificado, lista y gestores, móvil, teclado, URL, descargas sin campos internos y recuperación: OK');
}finally{await browser.close();}
await import('./arrival-check.mjs');
await import('./synthetic-check.mjs');
await import('./content-walkthrough.mjs');
