import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertArchiveStructure} from '../src/map/structure.js';
const archive=JSON.parse(await readFile(new URL('../data/explorer/archive.json',import.meta.url),'utf8'));
test('guard permite histórico y campos extra para la proyección existente',()=>{
 assert.doesNotThrow(()=>assertArchiveStructure(archive));
 assert.doesNotThrow(()=>assertArchiveStructure({...archive,internal_note:'synthetic'}));
});
test('guard rechaza datos incompletos antes de renderizar consumidores',()=>{
 for(const mutate of [d=>delete d.sources,d=>d.coverage=null,d=>delete d.snapshots[0].indicators,d=>d.snapshots[0].indicators.agreements_total='47',d=>d.territories[0]=null]){
  const data=structuredClone(archive);mutate(data);
  assert.throws(()=>assertArchiveStructure(data),/Estructura territorial inválida/);
 }
});
