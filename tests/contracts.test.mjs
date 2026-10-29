import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate} from '../scripts/schema.mjs';
import {readJson,validateData,validateRelations} from '../scripts/validate.mjs';
import {localUrl,resolveConfig} from '../src/config.js';
const fixture=()=>({schema_version:'1.0.0',snapshot_id:'test',fecha_corte:'2026-01-01',publicado_en:'2026-01-02',gestores:[],convenios:[],territorios:[],cobertura:[],fuentes:[],calidad:[]});
test('catálogo inicial válido',async()=>{await validateData();});
test('schema rechaza campos desconocidos y fechas inválidas',async()=>{
 const schema=await readJson('data/schemas/snapshot.schema.json');
 validate(fixture(),schema);
 assert.throws(()=>validate({...fixture(),paciente:'dato no permitido'},schema));
 assert.throws(()=>validate({...fixture(),fecha_corte:'2026-02-30'},schema));
});
test('referencias, duplicados y ciclos',()=>{
 let s=fixture(); s.gestores=[{id:'g'},{id:'g'}];assert.throws(()=>validateRelations(s));
 s=fixture();s.convenios=[{id:'c',gestor_id:'ausente',inicio:'2026-01-01',fin:null}];assert.throws(()=>validateRelations(s));
 s=fixture();s.territorios=[{id:'a',padre_id:'b'},{id:'b',padre_id:'a'}];assert.throws(()=>validateRelations(s));
});
test('sin dato es null y cero reportado es válido',()=>{
 const s=fixture();s.gestores=[{id:'g'}];s.convenios=[{id:'c',gestor_id:'g',inicio:'2026-01-01',fin:null}];s.territorios=[{id:'t',padre_id:null}];
 s.cobertura=[{id:'x',convenio_id:'c',territorio_id:'t',estado:'reportado',valor:0,periodo_inicio:'2026-01-01',periodo_fin:'2026-01-01'}];validateRelations(s);
 s.cobertura[0].estado='sin_dato';assert.throws(()=>validateRelations(s));s.cobertura[0].valor=null;validateRelations(s);
});
test('mismas rutas bajo raíz, Pages y SESAL',()=>{
 for(const prefix of ['/','/ugd-portal/','/unidades/ugd/']) {
  const c=resolveConfig({dataRoot:'./data/',geographyRoot:'./geography/',catalog:'catalog.json'},'https://example.org'+prefix);
  assert.equal(localUrl(c.catalog,c.dataRoot).pathname,prefix+'data/catalog.json');
 }
 for(const path of ['/data','../data','https://externo.org/a','//externo.org/a']) assert.throws(()=>localUrl(path,'https://example.org/ugd/'));
});
