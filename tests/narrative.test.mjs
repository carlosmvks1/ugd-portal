// Dirección institucional, mensaje de portada, logotipo y lugares narrativos de
// las fotografías: reglas que permiten incorporar ese contenido sin tocar
// componentes y sin repetir imágenes ni publicar material no autorizado.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {readJson,mergeArchive} from '../scripts/validate.mjs';
import {validateContent,projectRoot} from '../scripts/validate-content.mjs';
import {contentErrors,publicContent} from '../src/content/model.js';

execFileSync(process.execPath,['tests/fixtures/synthetic/generate.mjs'],{cwd:projectRoot,stdio:'ignore'});
const fixtures=join(projectRoot,'tests/fixtures/synthetic');
const archive=mergeArchive(await readJson('data/explorer/archive.json'),JSON.parse(await readFile(join(fixtures,'archive-extra.json'),'utf8')));
const base=await validateContent({dir:join(fixtures,'content'),mediaDir:fixtures,archive,allowSynthetic:true});
const clone=()=>structuredClone(base);
const errors=bundle=>contentErrors(bundle,archive,{allowSynthetic:true}).join('\n');
const director=b=>b.institution.sections.ugd.blocks.find(x=>x.block_id==='direccion-ugd');
const photo=(b,id)=>b.photos.photos.find(p=>p.photo_id===id);

test('el bloque de dirección admite una persona con retrato y contacto opcionales',()=>{
 assert.equal(errors(base),'');
 const b=clone();delete director(b).items[0].photo_id;delete director(b).items[0].contact;
 assert.equal(errors(b),'','Sin retrato ni contacto sigue siendo válido');
 const two=clone();director(two).items.push({name:'Otra persona',role:'Otro cargo'});
 assert.match(errors(two),/una sola persona/);
 const noRole=clone();delete director(noRole).items[0].role;
 assert.match(errors(noRole),/falta role/);
});

test('el retrato debe existir y no ocupa lugares de las fotografías de equipos',()=>{
 const missing=clone();director(missing).items[0].photo_id='no-existe';
 assert.match(errors(missing),/retrato inexistente/);
 const reused=clone();photo(reused,'sint-retrato').placements=['teams'];
 assert.match(errors(reused),/no debe tener «placements»/);
});

test('cada fotografía ocupa un solo lugar y los lugares únicos admiten una imagen',()=>{
 const twice=clone();photo(twice,'sint-foto-equipo').placements=['teams','home'];
 assert.match(errors(twice),/un solo lugar/);
 const crowded=clone();photo(crowded,'sint-foto-ugd').placements=['home'];
 assert.match(errors(crowded),/«home» admite una fotografía/);
 // Una imagen no publicable no compite por el lugar.
 const pending=clone();Object.assign(photo(pending,'sint-foto-ugd'),{placements:['home'],status:'collecting'});
 assert.doesNotMatch(errors(pending),/admite una fotografía/);
});

test('el logotipo solo se publica aprobado y con autorización de uso',()=>{
 const brand={status:'approved',logo_src:'media/sintetico/logo.svg',logo_alt:'Logotipo',logo_width:200,logo_height:60,authorization:{status:'pending'}};
 const b=clone();b.institution.brand=brand;
 assert.match(errors(b),/logotipo aprobado sin autorización/);
 assert.equal(publicContent(b).institution.brand,undefined,'Sin autorización no llega al artefacto público');
 const ok=clone();ok.institution.brand={...brand,authorization:{status:'granted'}};
 assert.deepEqual(publicContent(ok).institution.brand,ok.institution.brand);
 const draft=clone();draft.institution.brand={...brand,status:'proposed',authorization:{status:'granted'}};
 assert.equal(publicContent(draft).institution.brand,undefined);
});

test('la proyección pública retira el retrato no autorizado y conserva el bloque de dirección',()=>{
 const b=clone();Object.assign(photo(b,'sint-retrato'),{authorization:{status:'pending'}});
 const pub=publicContent(b);
 assert(!pub.photos.photos.some(p=>p.photo_id==='sint-retrato'),'Retrato sin autorización excluido');
 assert.equal(director(pub).items[0].name,director(b).items[0].name,'El bloque aprobado se publica sin retrato');
 const draft=clone();director(draft).status='collecting';
 assert.deepEqual(Object.keys(director(publicContent(draft))).sort(),['block_id','kind','placeholder','status','title'],'Pendiente: solo rótulo');
});

test('el contenido real prepara la dirección y el mensaje de portada sin publicarlos',async()=>{
 const real=await validateContent({archive:await readJson('data/explorer/archive.json')});
 const block=director(real);
 assert.equal(block.kind,'profile');assert.notEqual(block.status,'approved');
 const order=real.institution.sections.ugd.blocks.map(b=>b.block_id);
 assert(order.indexOf('direccion-ugd')===order.indexOf('funciones')+1,'La dirección va después de las funciones');
 const message=real.institution.sections.home.blocks.find(b=>b.block_id==='mensaje');
 assert.equal(message.status,'proposed','El mensaje de portada es una propuesta sin aprobar');
 assert.equal(publicContent(real).institution.sections.home.blocks[0].paragraphs,undefined);
});
