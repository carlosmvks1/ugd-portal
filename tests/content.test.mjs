import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {readJson,mergeArchive,root} from '../scripts/validate.mjs';
import {validateContent,readContent,projectRoot} from '../scripts/validate-content.mjs';
import {contentErrors,publicContent,assignmentsFor,linksForTerritory,territoriesForManager,highlightCodes,datasetState,investmentFor,careLabel,managersInPeriod} from '../src/content/model.js';
import {isPublishable} from '../src/content/contract.js';

execFileSync(process.execPath,['tests/fixtures/synthetic/generate.mjs'],{cwd:projectRoot,stdio:'ignore'});
const archive=await readJson('data/explorer/archive.json');
const fixtures=join(projectRoot,'tests/fixtures/synthetic');
const merged=mergeArchive(archive,JSON.parse(await readFile(join(fixtures,'archive-extra.json'),'utf8')));
const synthetic=await validateContent({dir:join(fixtures,'content'),mediaDir:fixtures,archive:merged,allowSynthetic:true});
const clone=()=>structuredClone(synthetic);
const errors=bundle=>contentErrors(bundle,merged,{allowSynthetic:true});

test('el contenido de producción es válido y no contiene ejemplos ni datos inventados',async()=>{
 const content=await validateContent({archive});
 for(const file of Object.values(content))assert.notEqual(file.synthetic,true);
 assert.equal(content.managers.managers.length,0,'Sin gestores hasta que la UGD los confirme');
 assert.equal(content.investment.datasets.length,0);assert.equal(content.photos.photos.length,0);
 for(const section of Object.values(content.institution.sections))for(const block of section.blocks)assert(!isPublishable(block),'Bloque '+block.block_id+' sin aprobación');
 assert(!/SINT[EÉ]TICO/.test(JSON.stringify(content)));
});
test('data/content rechaza ejemplos sintéticos',()=>{
 assert.match(contentErrors(synthetic,merged).join('\n'),/sintético no admitido/);
});
test('los ejemplos sintéticos son válidos con el período ficticio añadido',()=>{
 assert.deepEqual(errors(synthetic),[]);
 assert.throws(()=>{const e=contentErrors(synthetic,archive,{allowSynthetic:true});if(e.length)throw new Error(e.join('\n'));},/sint-2025/);
});
test('detecta referencias rotas, categorías no configuradas y duplicados',()=>{
 const cases=[
  [b=>b.managers.assignments[0].manager_id='desconocido',/desconocido/],
  [b=>b.managers.assignments[0].territory_id='9999',/9999/],
  [b=>b.managers.assignments[0].snapshot_id='2030-x',/2030-x/],
  [b=>b.managers.managers[0].entity_type='inventada',/inventada/],
  [b=>b.managers.assignments[0].care_level='III',/III/],
  [b=>b.managers.managers.push(structuredClone(b.managers.managers[0])),/duplicad/i],
  [b=>b.managers.assignments.push(structuredClone(b.managers.assignments[0])),/duplicad/i],
  [b=>b.managers.managers[0].source_ids=['no-existe'],/no-existe/],
  [b=>b.managers.managers[0].source_ids=['sint-fuente-pendiente'],/sint-fuente-pendiente/],
  [b=>b.managers.managers[0].archive_labels=['label-999'],/label-999/],
  [b=>b.investment.datasets[0].rows[0].category='inventada',/inventada/],
  [b=>b.investment.datasets[3].scope.id='99',/99/],
  [b=>b.photos.photos[0].authorization.status='pending',/autoriz/i],
  [b=>b.photos.photos[0].identifiable_people='unknown',/identificables|consentimiento/i],
  [b=>b.photos.photos[0].alt=b.photos.photos[0].description,/alt/i],
  [b=>b.institution.sections.contact.blocks[2].items[0].value='no-es-correo',/correo/i],
 ];
 for(const [mutate,pattern] of cases){const b=clone();mutate(b);assert.match(errors(b).join('\n'),pattern,String(mutate));}
});
test('la proyección pública retira lo no aprobado y conserva solo el rótulo de bloques pendientes',()=>{
 const p=publicContent(synthetic);
 assert(!p.managers.managers.some(m=>m.manager_id==='sint-gestor-pendiente'));
 assert(!p.managers.assignments.some(a=>a.manager_id==='sint-gestor-pendiente'||a.status==='collecting'));
 assert(!p.investment.datasets.some(d=>d.dataset_id==='sint-pendiente'));
 assert(!p.photos.photos.some(ph=>ph.photo_id==='sint-foto-sin-autorizacion'));
 assert(!p.sources.sources.some(s=>s.source_id==='sint-fuente-pendiente'));
 const draft=p.institution.sections.decentralization.blocks.find(b=>b.block_id==='servicios');
 assert.deepEqual(Object.keys(draft).sort(),['block_id','kind','placeholder','status','title']);
 assert(!JSON.stringify(p).includes('Borrador no aprobado'));
});
test('relaciones explícitas: varios gestores por territorio y varios territorios por gestor, sin mezclar períodos',()=>{
 const p=publicContent(synthetic);
 const ids=(state,code)=>linksForTerritory(p,merged,state,code).map(l=>l.manager.manager_id).sort();
 assert.deepEqual(ids({snapshot:'2024-v1',care:''},'1301'),['sint-gestor-compartido','sint-gestor-largo']);
 assert.deepEqual(ids({snapshot:'sint-2025',care:''},'1301'),['sint-gestor-largo']);
 assert.deepEqual(ids({snapshot:'2024-v1',care:'II'},'1301'),[]);
 assert.deepEqual(ids({snapshot:'2024-v1',care:'II'},'1302'),['sint-gestor-compartido']);
 const dept=linksForTerritory(p,merged,{snapshot:'2024-v1',care:''},'13');
 assert.equal(dept.find(l=>l.manager.manager_id==='sint-gestor-compartido').direct.length,1,'Vínculo departamental declarado');
 assert.equal(dept.find(l=>l.manager.manager_id==='sint-gestor-largo').municipal.length,3);
 const groups=territoriesForManager(p,merged,'sint-gestor-largo');
 assert.deepEqual(groups.map(g=>g.snapshot_id),['sint-2025','2024-v1'],'Más reciente primero');
 assert.equal(territoriesForManager(p,merged,'sint-gestor-extenso')[0].assignments.length,40);
 assert(highlightCodes(p,merged,{snapshot:'2024-v1',care:''},'sint-gestor-largo').has('13'));
 assert.equal(managersInPeriod(p,{snapshot:'sint-2025',care:''}).length,2);
 assert.equal(assignmentsFor(p,{snapshot:'2024-v1',care:'I'}).some(a=>a.care_level==='II'),false);
});
test('ningún vínculo se infiere por nombre ni por etiquetas históricas',()=>{
 const p=publicContent(synthetic);
 // label-001 se declara equivalente a sint-gestor-largo, pero no crea vínculos territoriales.
 const fake=structuredClone(merged);fake.coverage.find(r=>r.snapshot_id==='2024-v1'&&r.territory_id==='1304').manager_id='label-001';
 assert(!linksForTerritory(p,fake,{snapshot:'2024-v1',care:''},'1304').length);
 const renamed=clone();renamed.managers.managers.push({...renamed.managers.managers[1],manager_id:'sint-otro',name:'[SINTÉTICO] Lempira'});
 assert(!linksForTerritory(publicContent(renamed),merged,{snapshot:'2024-v1',care:''},'13').some(l=>l.manager.manager_id==='sint-otro'));
});
test('inversión: estados completo, parcial y ausente; sin totales calculados',()=>{
 assert.equal(datasetState({rows:[{amount:1},{amount:0}]}),'complete');
 assert.equal(datasetState({rows:[{amount:1},{amount:null}]}),'partial');
 assert.equal(datasetState({rows:[{amount:null}]}),'absent');
 assert.equal(datasetState({rows:[]}),'absent');
 const p=publicContent(synthetic);
 assert.deepEqual(investmentFor(p,{dimension:'management_level'}).map(d=>d.dataset_id).sort(),['sint-gestion-2024','sint-gestion-2025']);
 assert.deepEqual(investmentFor(p,{scope:'department',id:'13'}).map(d=>d.dataset_id),['sint-depto-13']);
 assert.equal(careLabel(p,'I'),'[SINTÉTICO] Primer nivel de atención');
 assert.equal(careLabel({categories:{care_levels:[]}},'III'),'Nivel de atención III');
});
test('el artefacto público excluye ejemplos, observatorio, administración y fotografías no publicadas',async()=>{
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:projectRoot,stdio:'ignore'});
 const dist=new URL('dist/',root);
 const files=(await readdir(dist,{recursive:true})).map(f=>f.split('\\').join('/'));
 assert(!files.some(f=>/(^|\/)(observatory|admin|tests|work|media)(\/|$)/.test(f)),files.filter(f=>/observatory|admin|media/.test(f)).join());
 for(const f of files.filter(f=>/\.(json|html|js)$/.test(f)))assert(!/SINT[EÉ]TICO|"synthetic":\s*true/.test(await readFile(new URL(f,dist),'utf8')),f);
 // Contenido alternativo nunca puede escribirse en dist/.
 const attempt=spawnSync(process.execPath,['scripts/build.mjs','--content','tests/fixtures/synthetic/content','--media','tests/fixtures/synthetic'],{cwd:projectRoot,encoding:'utf8'});
 assert.notEqual(attempt.status,0);assert.match(attempt.stderr,/dist/);
});
