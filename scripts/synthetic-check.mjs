// Escenarios con EJEMPLOS SINTÉTICOS (tests/fixtures/synthetic): nombres
// largos, varios gestores por territorio, períodos distintos, datos parciales,
// listas largas, fotografías, inversión y errores de carga. Construye en work/
// (nunca en dist/) y sirve el resultado bajo un subdirectorio (/ugd/).
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const fixtures=['--content','tests/fixtures/synthetic/content','--media','tests/fixtures/synthetic','--archive-extra','tests/fixtures/synthetic/archive-extra.json'];
execFileSync(process.execPath,['tests/fixtures/synthetic/generate.mjs'],{stdio:'ignore'});
execFileSync(process.execPath,['scripts/build.mjs',...fixtures,'--out','work/synthetic'],{stdio:'ignore'});
execFileSync(process.execPath,['scripts/build.mjs',...fixtures,'--preview','--out','work/synthetic-preview'],{stdio:'ignore'});

const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.geojson':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const base='http://127.0.0.1:4174/ugd/';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const errors=[],external=[];
let dir='work/synthetic',broken={};
async function open(viewport={width:1280,height:900}){
 const page=await browser.newPage({viewport});
 page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 await page.route(base+'**',async route=>{
  const path=new URL(route.request().url()).pathname.slice('/ugd'.length);
  for(const [suffix,mode] of Object.entries(broken))if(path.endsWith(suffix))return mode==='http'?route.fulfill({status:503,body:'Unavailable'}):route.fulfill({status:200,contentType:'application/json',body:'{'});
  const file=resolve(dir,'.'+(path==='/'?'/index.html':path));
  try{await route.fulfill({status:200,contentType:types[extname(file)],body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 return page;
}
const ready=page=>page.locator('#map path[data-code]').first().waitFor();
const noOverflow=async(page,label)=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desbordamiento horizontal: '+label);
const longName='Asociación Intermunicipal de Desarrollo Comunitario';

try{
 let page=await open();
 // Enlace compartido a una ficha, cargado directamente.
 await page.goto(base+'?gestor=sint-gestor-largo#ficha-gestor');await ready(page);
 const profile=page.locator('#ficha-gestor');
 assert.match(await page.locator('#ficha-gestor-title').innerText(),new RegExp(longName));
 const text=await profile.textContent();
 for(const expected of [/\[SINTÉTICO\] Asociación/,/Descripción/,/Ámbito de trabajo/,/Territorios vinculados/,/Año 2025/,/Año 2024/,/Población reportada/,/52,340/,/Sin dato/,/Inversión atribuida a este gestor/,/Crédito: \[SINTÉTICO\] Autoría ficticia/,/Contacto institucional/,/gestor@example\.org/,/Equivalencia declarada por la UGD/,/Fuentes/])assert.match(text,expected);
 const groupHeads=await profile.locator('.territory-group-head').allInnerTexts();
 assert(groupHeads[0].includes('Año 2025')&&groupHeads[1].includes('Año 2024'),'Períodos del más reciente al más antiguo, sin mezclarse');
 // Una sola fotografía del gestor: encabeza la ficha y no se repite en una galería.
 assert.equal(await profile.locator('.profile-banner img').count(),1);assert.equal(await profile.locator('.profile-photos').count(),0);
 assert.equal(await profile.locator('.territory-group').count(),2);
 assert.equal(await profile.locator('img[alt]').count(),1);
 assert(await page.evaluate(()=>{const r=document.querySelector('#ficha-gestor-title').getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}),'La ficha queda a la vista');
 // El mapa resalta los territorios del gestor del enlace.
 assert(await page.locator('#gestor-banner').isVisible());
 assert.equal(await page.locator('#gestor').inputValue(),'sint-gestor-largo');

 // Ficha con datos parciales: sin secciones vacías.
 await page.goto(base+'?gestor=sint-gestor-parcial#ficha-gestor');await ready(page);
 const partial=await page.locator('#ficha-gestor').textContent();
 assert.match(partial,/Tipo de entidad pendiente de confirmación/);
 assert.match(partial,/todavía no ha confirmado territorios vinculados/);
 assert.match(partial,/Identidad jurídica pendiente/);
 for(const absent of ['Descripción','Ámbito de trabajo','Población reportada','Fotografías','Contacto institucional','Inversión atribuida'])assert(!partial.includes(absent),'Sección vacía: '+absent);
 assert.equal(await page.locator('#ficha-gestor h5').evaluateAll(h=>h.filter(e=>!e.nextElementSibling).length),0);

 // Identificador desconocido y gestor no aprobado (excluido del artefacto).
 await page.goto(base+'?gestor=no-existe#ficha-gestor');await ready(page);
 assert.match(await page.locator('#manager-profile').innerText(),/No se encontró la ficha/);
 assert.equal(await page.locator('#gestor').inputValue(),'');
 await page.goto(base+'?gestor=sint-gestor-pendiente#ficha-gestor');await ready(page);
 assert.match(await page.locator('#manager-profile').innerText(),/No se encontró la ficha/);
 assert(!(await page.locator('#manager-directory').innerText()).includes('Gestor no aprobado'));

 // Directorio largo con filtro accesible.
 await page.goto(base+'#gestores');await ready(page);
 assert.equal(await page.locator('.manager-directory li').count(),35);
 await page.locator('#manager-filter').fill('lista 0');
 assert.equal(await page.locator('#manager-filter-count').innerText(),'9 gestores');
 await page.locator('#manager-filter').fill('zzz');
 assert.match(await page.locator('#manager-filter-count').innerText(),/Ningún gestor/);
 await page.locator('#manager-filter').fill('');

 // Mapa → ficha: varios gestores en un territorio, solo del período consultado.
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 let detail=await page.locator('#detail').innerText();
 assert.match(detail,/Gestores vinculados/i);assert.match(detail,new RegExp(longName));assert.match(detail,/Mancomunidad ficticia compartida/);
 assert(!detail.includes('Gestor solo en 2025'),'No mezclar períodos');
 assert(!detail.includes('Gestor no aprobado'),'Sin vínculos no aprobados');
 assert.match(await page.locator('#table').textContent(),/Mancomunidad ficticia compartida/);
 // Otro período: solo sus asignaciones.
 await page.goto(base+'?year=2025&snapshot=sint-2025&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 detail=await page.locator('#detail').innerText();
 assert.match(detail,new RegExp(longName));assert(!detail.includes('Mancomunidad ficticia compartida'));
 // Nivel de atención: solo coincidencias exactas.
 await page.goto(base+'?year=2024&snapshot=2024-v1&care=II&territory=1302');await page.locator('#map path[data-code="1302"]').waitFor();
 detail=await page.locator('#detail').innerText();
 assert.match(detail,/Mancomunidad ficticia compartida/);assert(!detail.includes(longName));
 // Sin vínculo confirmado: no afirma ausencia de gestor.
 await page.goto(base+'?year=2025&snapshot=sint-2025&territory=1302');await page.locator('#map path[data-code="1302"]').waitFor();
 assert.match(await page.locator('#detail').innerText(),/no significa que el territorio carezca de gestor/);
 // Departamento: gestores con vínculos municipales o departamentales.
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=13');await page.locator('#map path[data-code="1301"]').waitFor();
 detail=await page.locator('#detail').innerText();
 assert.match(detail,/Gestor con muchos territorios/);assert.match(detail,/En \d+ municipios/);

 // Teclado: del detalle a la ficha, foco en su título, atrás y adelante.
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 const link=page.locator('#detail .detail-manager-list a').first();
 await link.focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>location.hash==='#ficha-gestor'&&document.activeElement?.id==='ficha-gestor-title');
 const url=new URL(page.url());
 assert.equal(url.searchParams.get('territory'),'1301');assert.equal(url.searchParams.get('snapshot'),'2024-v1');assert(url.searchParams.get('gestor'));
 await page.goBack();await page.waitForFunction(()=>!new URLSearchParams(location.search).has('gestor'));
 assert.equal(await page.locator('#ficha-gestor').count(),0);
 assert.equal(await page.locator('#detail h2').innerText(),'Gracias');
 await page.goForward();await page.locator('#ficha-gestor-title').waitFor();
 // Ficha → mapa con sus territorios resaltados.
 await page.goto(base+'?gestor=sint-gestor-extenso#ficha-gestor');await ready(page);
 await page.locator('#ficha-gestor .profile-actions a',{hasText:'Ver sus territorios en el mapa'}).click();
 await page.waitForFunction(()=>location.hash==='#presencia');
 assert.match(await page.locator('#gestor-banner').innerText(),/40 municipios/);
 assert(await page.locator('#map path.is-highlighted, #table tr.is-highlighted').count()>0);
 await page.locator('#clear-gestor').click();
 assert(await page.locator('#gestor-banner').isHidden());assert(!new URL(page.url()).searchParams.has('gestor'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'gestor');
 // Una ficha con territorios en Lempira: el enlace de un territorio abre su detalle.
 await page.goto(base+'?gestor=sint-gestor-largo#ficha-gestor');await ready(page);
 await page.locator('#ficha-gestor .territory-links a').first().click();
 await page.waitForFunction(()=>location.hash==='#presencia'&&new URLSearchParams(location.search).get('territory')==='1301');
 await page.locator('#map path[data-code="1301"]').waitFor();
 assert.equal(await page.locator('#detail h2').innerText(),'Gracias');

 // Contenido institucional, inversión y fotografías.
 await page.goto(base);await ready(page);
 assert.match(await page.locator('#la-ugd').innerText(),/Párrafo ficticio de presentación/);
 assert(await page.locator('#la-ugd .badge-prep').count()>=1,'Bloque pendiente conserva su rótulo');
 assert.match(await page.locator('#la-ugd').innerText(),/Información desactualizada/);
 assert(!(await page.locator('#descentralizacion').innerText()).includes('Borrador no aprobado'));
 assert.match(await page.locator('#contacto').innerText(),/sintetico@example\.org/);
 const management=page.locator('[data-content="investment"] [data-dimension="management_level"]');
 assert.equal(await management.locator('select option').count(),2);
 assert.equal(await management.locator('[data-period]:not([hidden])').count(),1);
 await management.locator('select').selectOption({index:1});
 assert.equal(await management.locator('[data-period]:not([hidden]) .dataset').getAttribute('data-state'),'complete');
 await management.locator('select').selectOption({index:0});
 const shown=management.locator('[data-period]:not([hidden]) .dataset');
 assert.equal(await shown.getAttribute('data-state'),'partial');
 assert.match(await shown.innerText(),/Sin dato/);assert(!(await shown.innerText()).includes('Total reportado'),'No calcular totales');
 assert.equal(await page.locator('[data-content="investment"] [data-dimension="care_level"] .dataset').getAttribute('data-state'),'partial');
 assert(!(await page.locator('#inversion').innerText()).includes('Conjunto no aprobado'));
 assert.equal(await page.locator('figure.hero-photo img').count(),1);
 // Lugares narrativos: con fotografía se muestran; sin ella no se reserva espacio.
 assert(await page.locator('#inicio').evaluate(el=>el.classList.contains('has-photo')),'Portada con fotografía');
 assert.equal(await page.locator('[data-chapter="ugd"].has-media img').count(),1);
 assert.equal(await page.locator('[data-chapter="territory"].has-media img').count(),1);
 assert.equal(await page.locator('[data-chapter="decentralization"]').evaluate(el=>el.classList.contains('has-media')),false);
 assert(await page.locator('[data-slot="decentralization"]').isHidden(),'Sin fotografía no queda un hueco');
 assert.equal(new Set(await page.locator('main figure[data-photo]').evaluateAll(f=>f.map(x=>x.dataset.photo))).size,await page.locator('main figure[data-photo]').count(),'Ninguna fotografía se repite');
 // Dirección institucional y mensaje de portada desde contenido estructurado.
 const direction=page.locator('[data-block="direccion-ugd"]');
 assert.match(await direction.innerText(),/Nombre Ficticio Apellido Apellido/);assert.match(await direction.innerText(),/cargo ficticio/);
 assert.equal(await direction.locator('img[alt]').count(),1,'Retrato con texto alternativo');
 assert.match(await direction.innerText(),/direccion@example\.org/);
 const blocks=await page.locator('[data-content="ugd"] > article').evaluateAll(a=>a.map(x=>x.dataset.block));
 assert.equal(blocks.indexOf('direccion-ugd'),blocks.indexOf('funciones')+1,'Dirección después de las funciones');
 assert.match(await page.locator('#hero-lead').innerText(),/Mensaje ficticio de portada/);
 assert.equal(await page.locator('[data-content="teams"] figure').count(),2);
 for(const alt of await page.locator('figure img').evaluateAll(list=>list.map(i=>i.alt)))assert(alt.length>5,'Texto alternativo');
 assert.match(await page.locator('[data-content="teams"]').innerText(),/Crédito:/);
 assert(!(await page.content()).includes('no-existe.png'),'Fotografía sin autorización excluida');
 assert.equal(await page.locator('.preview-badge').count(),0,'Sin rótulos de vista previa en un artefacto publicable');
 // Detalle territorial: inversión departamental y fotografía del territorio.
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=13');await page.locator('#map path[data-code="1301"]').waitFor();
 assert.match(await page.locator('#detail').innerText(),/Inversión atribuida a Lempira/);
 await page.close();

 // Móvil 320 px: nombre largo y ficha sin desbordamiento.
 page=await open({width:320,height:720});
 await page.goto(base+'?gestor=sint-gestor-largo#ficha-gestor');await ready(page);
 await page.locator('#ficha-gestor-title').waitFor();
 await noOverflow(page,'ficha a 320 px');
 await page.goto(base+'?year=2024&snapshot=2024-v1&territory=1301');await page.locator('#map path[data-code="1301"]').waitFor();
 await noOverflow(page,'detalle a 320 px');
 await page.close();

 // Errores de carga: cada archivo de contenido falla sin arrastrar al resto.
 for(const [file,mode] of [['managers.json','http'],['investment.json','json'],['institution.json','http'],['photos.json','json']]){
  broken={['/data/content/'+file]:mode};
  page=await open();
  await page.goto(base);await ready(page);
  assert(await page.locator('.content-error').count()>=1,'Aviso de error: '+file);
  if(file!=='managers.json')assert.equal(await page.locator('#manager-directory .manager-directory li').count(),35);
  if(file!=='institution.json')assert.match(await page.locator('#la-ugd').innerText(),/Párrafo ficticio/);
  await page.close();
 }
 broken={};

 // Vista previa: piezas no aprobadas rotuladas; fotografías sin autorización, nunca.
 dir='work/synthetic-preview';
 page=await open();
 await page.goto(base);await ready(page);
 assert(await page.evaluate(()=>document.body.classList.contains('is-preview')));
 assert(await page.locator('.preview-badge').count()>0);
 assert.match(await page.locator('#descentralizacion').innerText(),/Borrador no aprobado/);
 assert.match(await page.locator('#manager-directory').innerText(),/Gestor no aprobado/);
 assert(!(await page.content()).includes('no-existe.png'));
 await page.close();

 assert.deepEqual(errors,[]);assert.deepEqual(external,[],'Sin solicitudes externas');
 console.log('Sintéticos: fichas completas y parciales, directorio largo, mapa↔ficha por período y nivel, teclado, atrás/adelante, inversión, fotografías, 320 px, errores de carga y vista previa: OK');
}finally{await browser.close();}
