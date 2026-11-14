import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {siteArchive,publicArchive} from '../src/map/contract.js';
import {assertArchiveStructure} from '../src/map/structure.js';

const archive=JSON.parse(await readFile(new URL('../data/explorer/archive.json',import.meta.url),'utf8'));

test('el archivo público del sitio no lleva convenios, pero conserva cobertura y población',()=>{
 const site=siteArchive(archive);
 const text=JSON.stringify(site);
 for(const snap of site.snapshots)for(const [k,v] of Object.entries(snap.indicators))if(k.startsWith('agreements'))assert.equal(v,null,'sin conteos de convenios: '+k);
 assert.ok(!/convenio/i.test(text),'ninguna mención a convenios en el archivo público');
 assert.ok(!/convenio/i.test(JSON.stringify(site.data_quality_issues)),'sin observaciones sobre convenios');
 assert.ok(site.coverage.every(r=>Array.isArray(r.agreement_ids)&&!r.agreement_ids.length));
 assert.equal(site.coverage.length,archive.coverage.length);
 assert.equal(site.snapshots[0].indicators.population_I,archive.snapshots[0].indicators.population_I);
 // Las demás observaciones metodológicas se mantienen.
 assert.equal(site.data_quality_issues.length,archive.data_quality_issues.filter(i=>!/convenio/i.test(i.detail)).length);
});

test('la proyección del sitio cumple el contrato del archivo y no altera el que usa la administración',()=>{
 assert.deepEqual(publicArchive(archive),archive);
 assert.doesNotThrow(()=>assertArchiveStructure(siteArchive(archive)),'el cliente debe poder renderizar el archivo proyectado');
});
