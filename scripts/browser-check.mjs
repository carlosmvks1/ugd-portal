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
let failGeometry=false,injectInternalFields=false,comparisonFixture=false;
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
   data.snapshots=[];data.coverage=[];data.departments=[];data.agreements=[];
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
 if(comparisonFixture&&path.endsWith('/archive.json')){
  const data=JSON.parse(await readFile(file,'utf8')),s=data.snapshots[0];s.status='approved';s.verification_status='official_verified';s.comparison={methodology_id:'synthetic-test',source_id:s.source_id,geography_version:'synthetic-test',periodicity:'annual'};
  const next={...structuredClone(s),snapshot_id:'2025-test',year:2025,period_start:'2025-01-01',period_end:'2025-12-31'};next.indicators.agreements_total=50;data.snapshots.push(next);
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 }
 if(injectInternalFields&&path.endsWith('/archive.json')){
  const data=JSON.parse(await readFile(file,'utf8')),marker='SYNTHETIC_AUDIT_MARKER';
  data.coverage.find(r=>r.coverage_status==='reported').internal_note=marker;
  data.snapshots[0].internal_note=marker;data.sources[0].internal_note=marker;
  data.data_quality_issues[0].internal_note=marker;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 }
 try{await route.fulfill({status:200,contentType:({'.html':'text/html','.js':'text/javascript','.json':'application/json','.geojson':'application/json','.css':'text/css'})[extname(file)],body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
});
async function assertHistoricalNotice(){
 assert.equal(await page.locator('#institutional-records #institutional-notice').count(),1);
 assert.match(await page.locator('#institutional-notice').innerText(),/Registros históricos.*Período de referencia: 2024.*2024-01-01 a 2024-12-31.*Archivo provisional.*Pendiente de verificación oficial/);
 assert.match(await page.locator('#gestores .section-heading').innerText(),/registros históricos no acreditan identidad jurídica, relaciones territoriales ni vigencia actual sin verificación adicional/);
 assert.equal(await page.locator('#institucion #institutional-notice').count(),0);
}
try{
 // Entrance: real links, keyboard menu, responsive layout, and legacy URL compatibility.
 await page.goto(base);
 assert.equal(await page.locator('h1').innerText(),'Unidad de Gestión Descentralizada');
 assert.equal(await page.locator('.home-primary').count(),1);
 assert.equal(await page.locator('.home-links a').count(),3);
 assert.equal(await page.locator('main p').innerText(),'Secretaría de Salud de Honduras');
 assert(!requests.some(path=>/archive|geojson/.test(path)),'La portada no carga datos territoriales');
 if(process.env.SCREENSHOT_DIR){
  await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-desktop-home.png'),fullPage:true});
 }
 for(const width of [320,390,768,850,1024,1440]){
  await page.setViewportSize({width,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desbordamiento en '+width);
 }
 await page.setViewportSize({width:390,height:844});
 if(process.env.SCREENSHOT_DIR)await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-mobile-home.png'),fullPage:true});
 const enlarged=await page.addStyleTag({content:':root{font-size:200%} .home-content{line-height:1.5;letter-spacing:.12em;word-spacing:.16em} .home-content p{margin-bottom:2em}'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Texto ampliado y espaciado');
 await enlarged.evaluate(el=>el.remove());
 assert(await page.locator('#site-nav').isHidden());
 await page.locator('#nav-toggle').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Tab');assert.equal(await page.locator('#site-nav a').first().evaluate(el=>el===document.activeElement),true);
 await page.keyboard.press('Escape');
 assert(await page.locator('#site-nav').isHidden());
 assert(await page.locator('#nav-toggle').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Tab');assert(await page.locator('.home-primary').evaluate(el=>el===document.activeElement));
 for(const selector of ['.home-primary','.home-links a:nth-child(1)','.home-links a:nth-child(2)','.home-links a:nth-child(3)']){
  await page.goto(base);await page.locator(selector).click();
  await page.locator(new URL(page.url()).hash).waitFor({state:'visible'});
  await page.reload();assert(await page.locator(new URL(page.url()).hash).isVisible());
  await page.goBack();assert(await page.locator('h1').isVisible());
 }
 await page.goto(base+'#institucion');await page.waitForURL(url=>url.pathname.endsWith('/portal.html')&&url.hash==='#institucion');
 await page.goto(base+'?year=2024&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.setViewportSize({width:1440,height:900});
 requests.length=0;
 await page.goto(base+'portal.html');
 await page.waitForTimeout(100);
 assert.deepEqual(errors,[],'Errores JavaScript durante la carga inicial');
 await page.locator('#map path[data-code]').first().waitFor();
 assert((await page.locator('#atlas-title').innerText()).includes('Honduras'));
 assert.equal(await page.locator('.ecosystem-node').count(),8);
 assert.equal(await page.locator('.information-orbit article').count(),6);
 assert.equal(await page.locator('.advanced-filters').getAttribute('open'),null);
 assert.equal(await page.locator('#manager').isDisabled(),true);
 assert.equal(await page.locator('#agreement').isDisabled(),true);
 assert.match(await page.locator('#status').innerText(),/Archivo provisional.*Pendiente de verificación oficial/);
 assert((await page.locator('.information-orbit').innerText()).includes('Gestores'));
 assert((await page.locator('.information-orbit').innerText()).includes('Monitoreo'));
 assert.equal(await page.locator('#obs-table tbody tr').count(),6);
 assert.match(await page.locator('#obs-status').innerText(),/Se necesitan dos períodos/);
 assert.match(await page.locator('#obs-table').innerText(),/No calculable/);
 await page.locator('#obs-metric').selectOption('population_I');assert.match(await page.locator('#obs-chart').innerText(),/1,592,136/);
 const obsPending=page.waitForEvent('download');await page.locator('#obs-json').click();const obsDownload=await obsPending;
 const obsPayload=JSON.parse(await readFile(await obsDownload.path(),'utf8'));assert.equal(obsPayload.rows.length,6);assert(obsPayload.rows.every(r=>r.absolute===null&&r.percent===null));
 assert.equal(await page.locator('#document-list article').count(),2);
 assert.equal(await page.locator('#manager-list details').count(),39);
 await assertHistoricalNotice();
 assert.match(await page.locator('#agreement-list').innerText(),/No hay un padrón/);
 await page.locator('#document-year').selectOption('2024');assert.equal(await page.locator('#document-list article').count(),1);
 await page.locator('#document-year').selectOption('');
 await page.locator('#institution-search').fill('label-001');assert.equal(await page.locator('#manager-list details').count(),1);
 await page.locator('#manager-list summary').click();assert.match(await page.locator('#manager-list').innerText(),/Sin confirmar/);
 await page.locator('#institution-search').fill('sin-coincidencias-987');assert.equal(await page.locator('#manager-list details').count(),0);
 await page.locator('#institution-search').fill('');
 assert.equal(await page.locator('#map path[data-code]').count(),18);
 assert(!requests.some(p=>p.includes('municipios-')),'Carga municipal prematura');
 assert(await page.locator('#manager').isDisabled());assert(await page.locator('#agreement').isDisabled());
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
 assert.match(await page.locator('#detail .detail-verification').innerText(),/Archivo provisional.*Pendiente de verificación oficial/);
 assert((await page.locator('#detail .detail-metrics').innerText()).includes('28 / 28'));
 assert((await page.locator('#detail .detail-metrics').innerText()).includes('100.0%'));
 await page.locator('#map path[data-code="1301"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.reload();await page.locator('#map path[data-code="1301"]').waitFor();assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
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
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'portal.html');await page.locator('#map path[data-code]').first().waitFor();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base+'portal.html?year=2026&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();assert((await page.locator('#status').innerText()).includes('Sin datos publicados'));assert(await page.locator('#csv').isDisabled());assert(!(await page.locator('#detail').innerText()).includes('62,863'));
 // Empezar en otro departamento detecta geometrías y eventos obsoletos.
 await page.goto(base+'portal.html?year=2024&territory=05');await page.locator('#map path[data-code="0501"]').waitFor();
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
 injectInternalFields=true;await page.goto(base+'portal.html');await page.locator('#map path[data-code]').first().waitFor();
 for(const kind of ['json','csv']){
  const pending=page.waitForEvent('download');await page.locator('#'+kind).click();const downloaded=await pending;
  const text=await readFile(await downloaded.path(),'utf8');assert(!text.includes('SYNTHETIC_AUDIT_MARKER'));
  if(kind==='json')assert.equal(JSON.parse(text).rows.length,93);
 }
 comparisonFixture=true;await page.goto(base+'portal.html?obs_from=2024-v1&obs_to=2025-test');await page.locator('#obs-table tbody tr').first().waitFor();
 assert.match(await page.locator('#obs-status').innerText(),/Períodos comparables/);assert.equal(await page.locator('#obs-table tbody tr').first().locator('td').nth(2).innerText(),'3');
 await page.locator('#obs-from').selectOption('');await page.reload();await page.locator('#obs-table tbody tr').first().waitFor();assert.equal(await page.locator('#obs-from').inputValue(),'');assert.match(await page.locator('#obs-status').innerText(),/Se necesitan dos períodos/);
 // Independent institutional shell, failure isolation and serialized recovery.
 await page.setViewportSize({width:1440,height:900});
 injectInternalFields=false;comparisonFixture=false;
 for(const mode of ['absent','http','json','incomplete','nested','config','period','verification']){
  failureMode=mode;
  await page.goto(base+'portal.html');
  await page.locator('#retry').waitFor({state:'visible'});
  assert.equal(await page.locator('#institution-title').count(),1);
  assert.match(await page.locator('#institucion').innerText(),/Secretaría de Salud de Honduras/);
  assert.match(await page.locator('#institucion').innerText(),/pendiente de validación/);
  await page.locator('#site-nav a[href="#institucion"]').click();
  assert.equal(new URL(page.url()).hash,'#institucion');
  assert.match(await page.locator('#observatory').innerText(),/Sin archivo|No se pudo/);
  assert.match(await page.locator('#documentos').innerText(),/Sin archivo|No se pudo/);
  assert.equal(await page.locator('#institutional-notice').count(),0);
  failureMode=null;archiveRequests=0;
  await page.locator('#retry').evaluate(el=>{el.click();el.click();el.click();});
  await page.locator('#map path[data-code]').first().waitFor();
  assert.equal(archiveRequests,1,'Reintento concurrente duplicado');
  assert.equal(await page.locator('#institution-title').count(),1);
  assert.equal(await page.locator('#document-list article').count(),2);
  assert.equal(await page.locator('#manager-list details').count(),39);
  await assertHistoricalNotice();
  await page.locator('#institution-search').fill('label-001');
  assert.equal(await page.locator('#manager-list details').count(),1);
  assert(await page.locator('#retry').isHidden());
 }
 // El contrato admite un archivo sin cortes: no deducir período ni verificación de sus fuentes.
 emptyArchive=true;
 await page.goto(base+'portal.html');
 await page.locator('#map path[data-code]').first().waitFor();
 assert.equal(await page.locator('#institutional-notice').count(),1);
 assert.equal(await page.locator('#institutional-notice').innerText(),'Registros históricos del archivo territorial · Período de referencia no disponible · Estado del archivo y verificación no disponibles. No acreditan vigencia actual.');
 assert.equal(await page.locator('#manager-list details').count(),39);
 assert.equal(await page.locator('#institution-title').count(),1);
 assert(await page.locator('#retry').isHidden());
 assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[],'El portal no debe solicitar fuentes ni servicios externos');console.log('Navegador: portada institucional, navegación, Atlas UGD, contexto nacional, ficha de procedencia, ecosistema, móvil, drill-down, teclado, filtros, URL, descargas sin campos internos, advertencias y recuperación sin mapa obsoleto: OK');
}finally{await browser.close();}
