import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:net';
import {createRequire} from 'node:module';
import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import {AdminStore} from './admin-store.mjs';
import {createAdminServer} from './admin-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const baseline=JSON.parse(await readFile(new URL('../data/explorer/archive.json',import.meta.url),'utf8'));
const store=new AdminStore(':memory:',baseline),password=randomBytes(24).toString('hex');
for(const role of ['editor','reviewer','publisher'])store.createUser('check-'+role,role,password);
const reserve=createServer();await new Promise(resolve=>reserve.listen(0,'127.0.0.1',resolve));const port=reserve.address().port;await new Promise(resolve=>reserve.close(resolve));
const origin='http://127.0.0.1:'+port,server=createAdminServer(store,{origin});await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
let browser;const errors=[];
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 async function login(role){const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.locator('[name=username]').fill('check-'+role);await page.locator('[name=password]').fill(password);await page.locator('#login button').click();await page.locator('#workspace').waitFor({state:'visible'});return page;}
 const editor=await login('editor');assert.match(await editor.locator('#monitor').innerText(),/Sin padrón individual/);await editor.locator('#new').click();await editor.locator('#editor-panel').waitFor({state:'visible'});
 await editor.locator('#title').fill('Prueba del circuito institucional');
 await editor.locator('#csv-file').setInputFiles({name:'cobertura.csv',mimeType:'text/csv',buffer:Buffer.from('snapshot_id,territory_id,care_level,population_covered\n2024-v1,1313,I,42711')});
 await editor.waitForFunction(()=>document.getElementById('message').textContent.startsWith('CSV integrado'));
 await editor.locator('#preview').click();await editor.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Datos válidos'));
 assert.match(await editor.locator('#diff').innerText(),/Cobertura municipal: 0 nuevos, 0 eliminados, 1 modificados/);
 await editor.locator('#save').click();await editor.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Borrador guardado'));
 // No enviar una revisión distinta de la que el editor está viendo.
 const unsaved=JSON.parse(await editor.locator('#payload').inputValue());unsaved.provenance+=' Cambio sin guardar.';await editor.locator('#payload').fill(JSON.stringify(unsaved));
 await editor.getByRole('button',{name:'Enviar a revisión',exact:true}).click();await editor.waitForFunction(()=>document.getElementById('message').textContent.includes('cambios sin guardar'));
 await editor.locator('#save').click();await editor.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Borrador guardado'));
 await editor.getByRole('button',{name:'Enviar a revisión',exact:true}).click();await editor.waitForFunction(()=>document.getElementById('draft-state').textContent.startsWith('En revisión'));
 assert(await editor.locator('#payload').evaluate(e=>e.readOnly));
 const reviewer=await login('reviewer');assert(await reviewer.locator('#new').isHidden());await reviewer.locator('#drafts button').first().click();await reviewer.getByRole('button',{name:'Aprobar revisión',exact:true}).click();await reviewer.waitForFunction(()=>document.getElementById('message').textContent.includes('requiere un comentario'));
 await reviewer.locator('#note').fill('Fuente y cambios revisados en la prueba.');await reviewer.getByRole('button',{name:'Aprobar revisión',exact:true}).click();await reviewer.waitForFunction(()=>document.getElementById('draft-state').textContent.startsWith('Aprobado'));
 const publisher=await login('publisher');await publisher.locator('#drafts button').first().click();assert(await publisher.locator('#save').isHidden());await publisher.getByRole('button',{name:'Preparar paquete aprobado',exact:true}).click();await publisher.waitForFunction(()=>document.getElementById('draft-state').textContent.startsWith('Paquete preparado'));
 const pending=publisher.waitForEvent('download');await publisher.getByRole('link',{name:'Descargar paquete aprobado'}).click();const download=await pending;
 const release=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(release.archive.coverage[0].population_covered,42711);assert.equal(release.archive.snapshots[0].verification_status,'official_unverified');
 assert.equal(await publisher.locator('#history li').count(),5);assert.match(await publisher.locator('#diff').innerText(),/Cobertura municipal: 0 nuevos, 0 eliminados, 1 modificados/);assert(!(await publisher.locator('#draft-state').innerText()).includes('La base cambió'));
 if(process.env.SCREENSHOT_DIR){await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});await publisher.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'admin-publisher.png'),fullPage:true});}
 await publisher.setViewportSize({width:390,height:844});assert(await publisher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(process.env.SCREENSHOT_DIR)await publisher.screenshot({path:resolve(process.env.SCREENSHOT_DIR,'admin-mobile.png'),fullPage:true});
 await publisher.getByRole('button',{name:'Cerrar sesión'}).click();await publisher.locator('#login-panel').waitFor({state:'visible'});assert.equal(await publisher.locator('#payload').inputValue(),'');assert.equal(await publisher.locator('#history li').count(),0);
 assert.deepEqual(errors,[]);console.log('Administración: acceso por roles, CSV, comparación, cambios sin guardar, revisión independiente, aprobación, historial, paquete y móvil: OK');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));store.close();}
