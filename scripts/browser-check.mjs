import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],requests=[];
let failGeometry=false;
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173/ugd/';
await page.route(base+'**',async route=>{
 const path=new URL(route.request().url()).pathname.slice('/ugd'.length);requests.push(path);
 if(failGeometry&&path.endsWith('municipios-13.geojson'))return route.fulfill({status:503,body:'Unavailable'});
 const file=resolve('dist','.'+(path==='/'?'/index.html':path));
 try{await route.fulfill({status:200,contentType:({'.html':'text/html','.js':'text/javascript','.json':'application/json','.geojson':'application/json','.css':'text/css'})[extname(file)],body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
});
try{
 await page.goto(base);
 await page.waitForTimeout(100);
 assert.deepEqual(errors,[],'Errores JavaScript durante la carga inicial');
 await page.locator('#map path[data-code]').first().waitFor();
 assert((await page.locator('#hero-title').innerText()).includes('Gestión descentralizada'));
 await page.waitForFunction(()=>[
   ['#kpi-agreements','47'],
   ['#kpi-levels','40 / 7'],
   ['#kpi-municipalities','89'],
   ['#kpi-population','1,592,136']
  ].every(([selector,value])=>document.querySelector(selector)?.textContent===value));
 assert.equal(await page.locator('#kpi-agreements').innerText(),'47');
 assert.equal(await page.locator('#kpi-levels').innerText(),'40 / 7');
 assert.equal(await page.locator('#kpi-municipalities').innerText(),'89');
 assert.equal(await page.locator('#kpi-population').innerText(),'1,592,136');
 assert.equal(await page.locator('#kpi-agreements').getAttribute('aria-hidden'),'true');
 assert((await page.locator('.kpi-item').first().getAttribute('aria-label')).includes('47'));
 assert((await page.locator('#home-period').innerText()).includes('2024'));
 assert.equal(await page.locator('#kpi-snapshot-year').innerText(),'2024');
 await page.waitForFunction(()=>document.querySelectorAll('#hero-map-signature path[data-signature-code]').length===18);
 assert.equal(await page.locator('#hero-map-signature path[data-signature-code]').count(),18);
 assert((await page.locator('#hero-territory-count').innerText()).includes('18 departamentos'));
 assert((await page.locator('#atlas-title').innerText()).includes('Honduras'));
 assert.equal(await page.locator('.ecosystem-node').count(),8);
 assert.equal(await page.locator('.information-orbit article').count(),6);
 assert.equal(await page.locator('.advanced-filters').getAttribute('open'),null);
 assert.equal(await page.locator('#manager').isDisabled(),true);
 assert.equal(await page.locator('#agreement').isDisabled(),true);
 assert(!(await page.locator('body').innerText()).match(/prototipo|en desarrollo|pendiente de verificación|pendiente de validación|requiere padrón|no acredita situación actual/i));
 assert((await page.locator('.information-orbit').innerText()).includes('Gestores'));
 assert((await page.locator('.information-orbit').innerText()).includes('Monitoreo'));
 if(process.env.SCREENSHOT_DIR){
  await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-desktop-home.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#nav-toggle').isVisible(),true);
  await page.locator('#nav-toggle').click();
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('#site-nav').isVisible(),true);
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-mobile-home.png'),fullPage:true});
  await page.locator('#nav-toggle').click();
  await page.setViewportSize({width:1280,height:900});
 }
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
 assert((await page.locator('.provenance-rail').innerText()).includes('Período'));
 assert(!(await page.locator('#detail').innerText()).match(/pendiente de verificación|pendiente de validación|no acredita/i));
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
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-mobile-territory.png'),fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'portal-desktop-territory.png'),fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base);await page.locator('#map path[data-code]').first().waitFor();
 assert.equal(await page.locator('#kpi-population').innerText(),'1,592,136');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base+'?year=2026&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();assert((await page.locator('#status').innerText()).includes('Sin datos publicados'));assert(await page.locator('#csv').isDisabled());assert(!(await page.locator('#detail').innerText()).includes('62,863'));
 failGeometry=true;await page.goto(base+'?year=2024&territory=13');await page.locator('#retry-map').waitFor();assert.equal(await page.locator('#table tbody tr').count(),28);
 failGeometry=false;await page.locator('#retry-map').click();await page.locator('#map path[data-code="1301"]').waitFor();
 await page.locator('#home').click();await page.locator('#map path[data-code="13"]').waitFor();await page.locator('#map path[data-code="13"]').focus();await page.keyboard.press('Enter');await page.locator('#map path[data-code="1301"]').waitFor();await page.locator('#map path[data-code="1301"]').focus();await page.keyboard.press('Escape');await page.locator('#map path[data-code="13"]').waitFor();
 assert.deepEqual(errors,[]);console.log('Navegador: firma territorial, Atlas UGD, contexto nacional, ficha de procedencia, ecosistema, móvil, KPIs, drill-down, teclado, filtros, URL, descarga y recuperación: OK');
}finally{await browser.close();}
