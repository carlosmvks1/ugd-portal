import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../scripts/validate.mjs';
import {institutionalRecords} from '../src/institutional.js';
import {keyFacts} from '../src/home.js';
const data=await readJson('data/explorer/archive.json');
test('directorio no inventa relaciones a partir de etiquetas transcritas',()=>{
 const records=institutionalRecords(data);assert.equal(records.managers.length,39);
 assert(records.managers.every(m=>m.territories.length===0));
 const d=structuredClone(data);d.coverage[0].manager_id=d.managers[0].manager_id;
 const linked=institutionalRecords(d).managers[0];assert.equal(linked.territories.length,1);
 assert.equal(linked.territories[0].official_code,d.coverage[0].territory_id);
});
test('datos clave conservan los valores de la fuente y no suman filas',()=>{
 const facts=keyFacts(data);
 assert.equal(facts.population,1592136);
 assert.equal(facts.municipalities,89);
 assert.equal(facts.municipalitiesTable,93);
 assert(facts.departments>0&&facts.departments<=18);
 assert.equal(keyFacts({...data,snapshots:[]}),null);
});
