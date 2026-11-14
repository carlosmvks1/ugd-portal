// Revisión visual: capturas por sección y estado en escritorio, tableta y
// móvil, del artefacto público (dist/) y de la vista sintética con fotografías
// (work/synthetic-preview). Las capturas van a work/revision/ (no se versionan).
// Uso: npm run build && node scripts/visual-review.mjs   (genera la vista sintética)
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createPublicServer} from './serve.mjs';

const root=resolve(new URL('..',import.meta.url).pathname);
const out=resolve(root,process.argv[2]||'work/revision');
execFileSync(process.execPath,['tests/fixtures/synthetic/generate.mjs'],{cwd:root,stdio:'ignore'});
execFileSync(process.execPath,['scripts/build.mjs','--preview','--content','tests/fixtures/synthetic/content','--media','tests/fixtures/synthetic','--archive-extra','tests/fixtures/synthetic/archive-extra.json','--out','work/synthetic-preview'],{cwd:root,stdio:'ignore'});
await mkdir(out,{recursive:true});
const sites={publico:createPublicServer(resolve(root,'dist')).listen(0),sintetico:createPublicServer(resolve(root,'work/synthetic-preview')).listen(0)};
const widths={escritorio:1440,tableta:820,movil:390};
const views=[
 ['publico','portada','',  'section#inicio'],
 ['publico','la-ugd','#la-ugd','section#la-ugd'],
 ['publico','territorio-municipio','?territory=1313#presencia','section#presencia'],
 ['publico','contacto','#contacto','section#contacto'],
 ['sintetico','portada','','section#inicio'],
 ['sintetico','la-ugd','#la-ugd','section#la-ugd'],
 ['sintetico','descentralizacion','#descentralizacion','section#descentralizacion'],
 ['sintetico','territorio-municipio','?territory=1301#presencia','#explorer'],
 ['sintetico','ficha','?gestor=sint-gestor-largo#ficha-gestor','#ficha-gestor'],
 ['sintetico','ficha-parcial','?gestor=sint-gestor-parcial#ficha-gestor','#ficha-gestor'],
 ['sintetico','inversion','#inversion','section#inversion'],
 ['sintetico','equipos','#equipos','section#equipos'],
];
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const problems=[];
for(const [device,width] of Object.entries(widths)){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>problems.push(`${device}: ${e.message}`));
 for(const [site,name,query,selector] of views){
  await page.goto(`http://127.0.0.1:${sites[site].address().port}/${query}`);
  await page.locator('#map path[data-code]').first().waitFor({timeout:20000}).catch(()=>{});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))problems.push(`Desbordamiento: ${site} ${name} ${device}`);
  const el=page.locator(selector).first();
  if(!await el.count()){problems.push(`Sin ${selector}: ${site} ${name}`);continue;}
  // En móvil la ficha territorial es una hoja inferior fija: se captura la ventana.
  if(device==='movil'&&name==='territorio-municipio')await page.screenshot({path:resolve(out,`${site}-${name}-${device}.jpg`),type:'jpeg',quality:80});
  else await el.screenshot({path:resolve(out,`${site}-${name}-${device}.jpg`),type:'jpeg',quality:80});
 }
 await page.close();
}
await browser.close();for(const s of Object.values(sites))s.close();
console.log(problems.length?'Observaciones:\n- '+problems.join('\n- '):'Sin desbordamientos ni errores de página');
console.log('Capturas en',out);
