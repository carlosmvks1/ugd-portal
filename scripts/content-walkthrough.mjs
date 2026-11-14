// Demostración: incorporar un gestor solo con cambios de contenido.
// Sobre una copia temporal del proyecto: 1) agregar un gestor, 2) vincularlo a
// un territorio, 3) verlo en el mapa y abrir su ficha, 4) agregar población y
// una fotografía. Tras cada paso se valida, se construye en work/ y se revisa
// en el navegador. Al final se comprueba que src/ e index.html no cambiaron y
// que el build público (dist/) rechaza el contenido de ejemplo.
// Todo el contenido usado aquí es SINTÉTICO y no toca el repositorio real.
import {createRequire} from 'node:module';
import {execFileSync,spawnSync} from 'node:child_process';
import {cp,mkdtemp,readFile,writeFile,readdir,rm,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join,resolve,relative,sep,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const repo=resolve(new URL('..',import.meta.url).pathname);
const copy=await mkdtemp(join(tmpdir(),'ugd-walkthrough-'));
const skip=new Set(['node_modules','dist','work','.git']);
await cp(repo,copy,{recursive:true,filter:p=>!skip.has(relative(repo,p).split(sep)[0])});
execFileSync(process.execPath,['tests/fixtures/synthetic/generate.mjs'],{cwd:copy,stdio:'ignore'});

const files=async dir=>(await readdir(dir,{withFileTypes:true,recursive:true})).filter(e=>e.isFile()).map(e=>join(e.parentPath??e.path,e.name)).sort();
const fingerprint=async()=>{const h=createHash('sha256');for(const f of [join(copy,'index.html'),...await files(join(copy,'src'))]){h.update(relative(copy,f));h.update(await readFile(f));}return h.digest('hex');};
const before=await fingerprint();
const contentFile=name=>join(copy,'data/content',name+'.json');
const read=async name=>JSON.parse(await readFile(contentFile(name),'utf8'));
const write=async(name,value)=>writeFile(contentFile(name),JSON.stringify(value,null,2)+'\n');
const run=(...args)=>execFileSync(process.execPath,args,{cwd:copy,stdio:'pipe'}).toString();
const build=()=>{run('scripts/validate-content.mjs','--allow-synthetic');run('scripts/build.mjs','--content','data/content','--out','work/walkthrough');};

const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.geojson':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const base='http://127.0.0.1:4175/portal/';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const errors=[];
const page=await browser.newPage({viewport:{width:1280,height:900}});
page.setDefaultTimeout(15000);
page.on('pageerror',e=>errors.push(e.message));
await page.route(base+'**',async route=>{
 const path=new URL(route.request().url()).pathname.slice('/portal'.length);
 const file=resolve(copy,'work/walkthrough','.'+(path==='/'?'/index.html':path));
 try{await route.fulfill({status:200,contentType:types[extname(file)],body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
});
const ready=()=>page.locator('#map path[data-code]').first().waitFor();
const S='[SINTÉTICO] ';
const steps=[];
try{
 // Paso 1: una fuente y un gestor nuevos.
 const sources=await read('sources');
 sources.synthetic=true;
 sources.sources.push({source_id:'demo-fuente',title:S+'Registro de gestores de demostración',publisher:S+'UGD (ejemplo)',date:'2026-01-15',status:'approved'});
 await write('sources',sources);
 const managers=await read('managers');
 managers.synthetic=true;
 managers.managers.push({manager_id:'demo-gestor',name:S+'Gestor de demostración',status:'approved',verification_status:'pending_UGD',source_ids:['demo-fuente'],description:S+'Entidad incorporada solo con cambios de contenido.'});
 await write('managers',managers);
 build();
 await page.goto(base+'#gestores');await ready();
 await page.locator('.manager-directory a',{hasText:'Gestor de demostración'}).click();
 await page.locator('#ficha-gestor-title').waitFor();
 assert.match(await page.locator('#ficha-gestor').textContent(),/todavía no ha confirmado territorios/);
 steps.push('1. gestor agregado → aparece en el directorio y su ficha abre');

 // Paso 2: vínculo explícito con Gracias (1301), período 2024-v1, primer nivel.
 managers.assignments.push({manager_id:'demo-gestor',territory_id:'1301',snapshot_id:'2024-v1',care_level:'I',status:'approved',verification_status:'pending_UGD',source_id:'demo-fuente'});
 await write('managers',managers);
 build();
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 const detailLink=page.locator('#detail .detail-manager-list a',{hasText:'Gestor de demostración'});
 assert.equal(await detailLink.count(),1);
 await detailLink.click();
 await page.waitForFunction(()=>document.activeElement?.id==='ficha-gestor-title');
 assert.match(await page.locator('#ficha-gestor').textContent(),/Gracias \(Lempira\)/);
 await page.locator('#ficha-gestor .profile-actions a',{hasText:'Ver sus territorios en el mapa'}).click();
 await page.waitForFunction(()=>location.hash==='#presencia');
 assert.match(await page.locator('#gestor-banner').innerText(),/1 municipio/);
 assert.equal(await page.locator('#gestor').inputValue(),'demo-gestor');
 steps.push('2–3. territorio vinculado → visible en el mapa, enlace mapa→ficha y ficha→mapa');

 // Paso 4: población del gestor y una fotografía autorizada.
 managers.managers.at(-1).population=[{value:12345,period:{start:'2024-01-01',end:'2024-12-31'},snapshot_id:'2024-v1',care_level:'I',definition:null,source_id:'demo-fuente',verification_status:'pending_UGD'}];
 await write('managers',managers);
 await mkdir(join(copy,'public/media/demo'),{recursive:true});
 await copyFile(join(copy,'tests/fixtures/synthetic/media/sintetico/equipo.png'),join(copy,'public/media/demo/equipo.png'));
 const photos=await read('photos');
 photos.synthetic=true;
 photos.photos.push({photo_id:'demo-foto',src:'media/demo/equipo.png',width:800,height:600,alt:S+'Rectángulo verde con un recuadro claro',description:S+'Fotografía de demostración del equipo del gestor',credit:S+'Autoría de ejemplo',status:'approved',authorization:{status:'granted'},identifiable_people:'none',manager_ids:['demo-gestor'],territory_ids:['1301'],placements:['teams']});
 await write('photos',photos);
 build();
 await page.goto(base+'?gestor=demo-gestor#ficha-gestor');await ready();
 const text=await page.locator('#ficha-gestor').textContent();
 assert.match(text,/12,345/);assert.match(text,/Definición pendiente de confirmación/);
 assert.equal(await page.locator('#ficha-gestor figure img[alt]').count(),1);
 assert(await page.locator('#ficha-gestor figure img').evaluate(img=>img.complete&&img.naturalWidth>0),'La fotografía carga');
 steps.push('4. población y fotografía → visibles en la ficha con fuente, período y crédito');

 // Ningún componente cambió y el contenido de ejemplo no puede ir a dist/.
 assert.equal(await fingerprint(),before,'src/ e index.html no deben cambiar');
 const publicBuild=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:copy,encoding:'utf8'});
 assert.notEqual(publicBuild.status,0,'El build público debe rechazar contenido sintético');
 assert.match(publicBuild.stderr,/sint[eé]tico/i);
 steps.push('5. src/ e index.html sin cambios; el build público rechaza el contenido de ejemplo');
 assert.deepEqual(errors,[]);
 console.log('Recorrido solo con contenido:\n  '+steps.join('\n  '));
}finally{await browser.close();await rm(copy,{recursive:true,force:true});}
