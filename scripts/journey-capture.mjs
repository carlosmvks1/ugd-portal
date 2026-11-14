// Evidencia visual del recorrido territorio → gestor → regreso al mapa, y del
// estado con la carga territorial fallida. Usa la vista sintética
// (work/synthetic-preview, generada por scripts/visual-review.mjs).
// Uso: node scripts/journey-capture.mjs [carpeta]   → work/revision/recorrido-*.jpg
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {createPublicServer} from './serve.mjs';
const root=resolve(new URL('..',import.meta.url).pathname),out=resolve(root,process.argv[2]||'work/revision');
await mkdir(out,{recursive:true});
const server=createPublicServer(resolve(root,'work/synthetic-preview')).listen(0),base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
for(const [device,viewport] of [['escritorio',{width:1440,height:900}],['movil',{width:390,height:844}]]){
 const page=await browser.newPage({viewport});
 const shot=async name=>{await page.waitForTimeout(350);await page.screenshot({path:resolve(out,`recorrido-${name}-${device}.jpg`),type:'jpeg',quality:78});};
 // 1. Territorio seleccionado: gestores vinculados visibles con enlace a su ficha.
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=1301#presencia');
 await page.locator('#map path[data-code="1301"]').waitFor();
 const link=page.locator('#detail .detail-manager-list a').first();
 await link.scrollIntoViewIfNeeded();await shot('1-territorio');
 const name=(await link.innerText()).replace(/\s*→\s*$/,'');
 // 2. Ficha del gestor (misma página, enlace compartible).
 await link.click();await page.locator('#ficha-gestor-title').waitFor();
 assert.match(page.url(),/gestor=/);
 await page.waitForTimeout(400);
 // La ficha queda visible: ningún panel fijo tapa su título (hoja plegada en teléfono).
 assert(await page.locator('#ficha-gestor-title').evaluate(h=>{const r=h.getBoundingClientRect(),e=document.elementFromPoint(r.left+Math.min(40,r.width/2),r.top+r.height/2);return h.contains(e)||e===h;}),'Título de la ficha tapado en '+device);assert.equal((await page.locator('#ficha-gestor-title').innerText()).trim(),name.trim());
 await shot('2-ficha');
 // 3. Regreso a sus territorios en el mapa, con el gestor resaltado.
 await page.locator('#ficha-gestor .profile-actions a',{hasText:'Ver sus territorios en el mapa'}).click();
 await page.locator('#gestor-banner:not([hidden])').waitFor();
 await page.locator('#gestor-banner').scrollIntoViewIfNeeded();await shot('3-mapa');
 // 4. Atrás vuelve a la ficha.
 await page.goBack();await page.locator('#ficha-gestor-title').waitFor();
 await page.close();
}
// Estado de error: falla el archivo territorial; el contenido institucional sigue legible.
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.route('**/data/explorer/archive.json',r=>r.fulfill({status:503,body:'{}'}));
await page.goto(base+'#presencia');await page.locator('#retry').waitFor({state:'visible'});
await page.locator('#presencia').screenshot({path:resolve(out,'recorrido-error-territorial-escritorio.jpg'),type:'jpeg',quality:78});
assert.match(await page.locator('#la-ugd').innerText(),/Dirección de la UGD/i);
await browser.close();server.close();
console.log('Recorrido territorio → ficha → mapa → atrás: OK; error territorial con contenido disponible: OK');
