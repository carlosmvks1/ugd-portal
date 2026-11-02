import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../scripts/validate.mjs';
import {institutionalRecords} from '../src/institutional.js';
const data=await readJson('data/explorer/archive.json');
test('biblioteca usa fuentes existentes y separa año documental de consulta',()=>{
 const {documents}=institutionalRecords(data);assert.equal(documents.length,2);
 assert.deepEqual(documents.find(d=>d.source.source_id==='sesal-2024').years,['2024']);
 assert.deepEqual(documents.find(d=>d.source.source_id==='hdx-sinit').years,['2016']);
});
test('directorio no inventa relaciones a partir de etiquetas transcritas',()=>{
 const records=institutionalRecords(data);assert.equal(records.managers.length,39);
 assert(records.managers.every(m=>m.territories.length===0&&m.agreements.length===0));
 const d=structuredClone(data);d.coverage[0].manager_id=d.managers[0].manager_id;
 const linked=institutionalRecords(d).managers[0];assert.equal(linked.territories.length,1);
 assert.equal(linked.territories[0].official_code,d.coverage[0].territory_id);
});
