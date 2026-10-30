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
 await page.goto(base);await page.locator('#map path[data-code]').first().waitFor();
 assert.equal(await page.locator('#map path[data-code]').count(),18);
 assert(!requests.some(p=>p.includes('municipios-')),'Carga municipal prematura');
 assert(await page.locator('#manager').isDisabled());assert(await page.locator('#agreement').isDisabled());
 await page.locator('#map path[data-code="13"]').hover();assert((await page.locator('#tooltip').innerText()).includes('28 / 28'));
 const before=await page.locator('#tooltip').boundingBox();await page.mouse.move(before.x+5,before.y+5);const after=await page.locator('#tooltip').boundingBox();assert.equal(before.x,after.x);
 await page.locator('#map path[data-code="13"]').click();await page.locator('#map path[data-code="1301"]').waitFor();assert.equal(await page.locator('#map path[data-code]').count(),28);
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
 if(process.env.SCREENSHOT_DIR){await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'explorador-mobile.png')});await page.setViewportSize({width:1280,height:900});await page.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'explorador-desktop.png')});}
 await page.goto(base+'?year=2026&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();assert((await page.locator('#status').innerText()).includes('Sin datos publicados'));assert(await page.locator('#csv').isDisabled());assert(!(await page.locator('#detail').innerText()).includes('62,863'));
 failGeometry=true;await page.goto(base+'?year=2024&territory=13');await page.locator('#retry-map').waitFor();assert.equal(await page.locator('#table tbody tr').count(),28);
 failGeometry=false;await page.locator('#retry-map').click();await page.locator('#map path[data-code="1301"]').waitFor();
 await page.locator('#home').click();await page.locator('#map path[data-code="13"]').waitFor();await page.locator('#map path[data-code="13"]').focus();await page.keyboard.press('Enter');await page.locator('#map path[data-code="1301"]').waitFor();await page.locator('#map path[data-code="1301"]').focus();await page.keyboard.press('Escape');await page.locator('#map path[data-code="13"]').waitFor();
 assert.deepEqual(errors,[]);console.log('Navegador: hover, drill-down, teclado, búsqueda, filtros, URL, histórico, descarga, móvil, carga progresiva y recuperación: OK');
}finally{await browser.close();}
