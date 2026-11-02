import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../scripts/validate.mjs';
import {validateExplorer} from '../scripts/validate-explorer.mjs';
import {publicArchive} from '../src/map/contract.js';
import {sanitizeState,readState,exportRows} from '../src/map/model.js';
import {latestSnapshot,snapshotNotice} from '../src/map/snapshots.js';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const data=await readJson('data/explorer/archive.json');
const clone=()=>structuredClone(data);
test('contrato público rechaza campos inesperados en todos los objetos',()=>{
 const objects=[d=>d,d=>d.coverage[0],d=>d.snapshots[0],d=>d.snapshots[0].indicators,
  d=>d.territories[0],d=>d.departments[0],d=>d.sources[0],d=>d.managers[0],d=>d.data_quality_issues[0],d=>d.equivalences[0]];
 for(const at of objects){const d=clone();at(d).internal_note='SYNTHETIC_AUDIT_MARKER';assert.throws(()=>validateExplorer(d),/campo desconocido/);}
});
test('proyección de publicación y descargas elimina campos internos sin cambiar el archivo',()=>{
 const d=clone();d.internal_note='SYNTHETIC_AUDIT_MARKER';d.coverage[0].internal_note=d.internal_note;
 d.snapshots[0].indicators.internal_note=d.internal_note;d.sources[0].internal_note=d.internal_note;
 assert(!JSON.stringify(publicArchive(d)).includes(d.internal_note));
 assert(!JSON.stringify(exportRows(d,sanitizeState(d,readState('')))).includes(d.internal_note));
 assert.equal(d.coverage[0].internal_note,d.internal_note);
 assert.deepEqual(publicArchive(data),data,'No perder campos históricos aprobados');
});
test('contrato rechaza fechas imposibles, estados inventados, campos obligatorios y cifras fraccionarias',()=>{
 const mutations=[d=>d.snapshots[0].period_start='2024-02-30',d=>d.snapshots[0].cutoff_date='2024-99-99',
  d=>d.sources[0].retrieved_at='2026-02-29',d=>d.coverage[0].verification_status='invented',
  d=>d.snapshots[0].status='invented',d=>delete d.coverage[0].agreement_ids,
  d=>d.coverage[0].population_covered=1.5,d=>d.departments[0].municipalities_total=0,
  d=>d.sources[0].url='javascript:alert(1)',d=>d.territories.find(t=>t.type==='municipality').parent_id=null];
 for(const mutate of mutations){const d=clone();mutate(d);assert.throws(()=>validateExplorer(d));}
});
test('convenios validan identidad, fuente, período y vínculo de nivel/gestor',()=>{
 const d=clone(),r=d.coverage[0];r.manager_id=d.managers[0].manager_id;r.agreement_ids=['agreement-1'];
 d.agreements=[{agreement_id:'agreement-1',snapshot_id:r.snapshot_id,manager_id:r.manager_id,care_level:r.care_level,
  valid_from:'2024-01-01',valid_to:'2024-12-31',status:'active',source_id:r.source_id,document_url:null,verification_status:'official_unverified'}];
 validateExplorer(d);
 for(const [key,value] of [['manager_id','missing'],['source_id','missing'],['snapshot_id','missing'],['valid_to','2023-12-31'],['care_level','II'],['internal_note','private']]){
  const bad=structuredClone(d);bad.agreements[0][key]=value;assert.throws(()=>validateExplorer(bad));
 }
});
test('portada y explorador eligen el último año y revisión independientemente del orden',()=>{
 const d=clone(),base=d.snapshots[0];
 const newer={...base,snapshot_id:'2025-v1',year:2025,period_start:'2025-01-01',period_end:'2025-12-31'};
 for(const snapshots of [[newer,base],[base,newer]]){
  d.snapshots=snapshots;assert.equal(latestSnapshot(snapshots).snapshot_id,'2025-v1');
  assert.equal(sanitizeState(d,readState('')).snapshot,'2025-v1');
 }
 d.snapshots=[{...base,snapshot_id:'2024-v9'},{...base,snapshot_id:'2024-v10'}];
 assert.equal(sanitizeState(d,readState('?year=2024')).snapshot,'2024-v10');
 assert.equal(sanitizeState(d,readState('?snapshot=2024-v9')).snapshot,'2024-v9');
 d.snapshots[0].revision=11;d.snapshots[1].revision=10;
 assert.equal(latestSnapshot(d.snapshots).snapshot_id,'2024-v9','La revisión explícita prevalece sobre el ID');
 assert.equal(sanitizeState(d,readState('?year=2099')).snapshot,'');
});
test('metadatos de validación se traducen sin certificar el histórico',()=>{
 assert.match(snapshotNotice(data.snapshots[0]),/provisional.*Pendiente de verificación oficial/);
 assert.match(snapshotNotice({...data.snapshots[0],status:'approved',verification_status:'official_verified'}),/aprobado.*Verificado oficialmente/);
});
test('build publica el contrato histórico completo y bloquea importaciones con campos internos',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'ugd-publication-'));
 try{
  for(const name of ['package.json','index.html','src','scripts','data','geography','public'])await cp(new URL('../'+name,import.meta.url),join(temp,name),{recursive:true});
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:temp,stdio:'pipe'});
  assert.deepEqual(JSON.parse(await readFile(join(temp,'dist/data/explorer/archive.json'),'utf8')),data);
  const contaminated=clone();contaminated.coverage[0].internal_note='SYNTHETIC_AUDIT_MARKER';
  await writeFile(join(temp,'data/explorer/archive.json'),JSON.stringify(contaminated));
  assert.throws(()=>execFileSync(process.execPath,['scripts/build.mjs'],{cwd:temp,stdio:'pipe'}),/campo desconocido/);
 }finally{await rm(temp,{recursive:true,force:true});}
});
