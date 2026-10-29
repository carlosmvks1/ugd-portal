import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {validate} from './schema.mjs';
export const root = new URL('../',import.meta.url);
export const readJson = async path => JSON.parse(await readFile(new URL(path,root),'utf8'));
export function validateRelations(s) {
  const sets = {};
  for (const name of ['gestores','convenios','territorios','cobertura','fuentes','calidad']) {
    sets[name] = new Set(s[name].map(r=>r.id));
    assert.equal(sets[name].size,s[name].length,'IDs duplicados en '+name);
  }
  const ref=(table,id)=>assert(sets[table].has(id),'Referencia inexistente: '+table+'/'+id);
  for(const name of Object.keys(sets)) for(const r of s[name]) for(const id of r.fuente_ids || []) ref('fuentes',id);
  for(const r of s.convenios) {ref('gestores',r.gestor_id);assert(r.fin===null || r.fin>=r.inicio,'Fechas de convenio');}
  for(const r of s.territorios) {
    const visited=new Set([r.id]); let parent=r.padre_id;
    while(parent!==null) {ref('territorios',parent);assert(!visited.has(parent),'Ciclo territorial');visited.add(parent);parent=s.territorios.find(t=>t.id===parent).padre_id;}
  }
  for(const r of s.cobertura) {
    ref('convenios',r.convenio_id);ref('territorios',r.territorio_id);
    assert(r.periodo_fin>=r.periodo_inicio,'Periodo inválido');
    assert(r.estado==='reportado' ? r.valor!==null : r.valor===null,'Ausencia de dato debe ser null, no cero');
  }
  for(const r of s.calidad) ref(r.entidad,r.registro_id);
  assert(s.publicado_en>=s.fecha_corte,'Publicación anterior al corte');
}
export async function validateData() {
  const catalog=await readJson('data/catalog.json');
  validate(catalog,await readJson('data/schemas/catalog.schema.json'));
  const ids=new Set();
  const schema=await readJson('data/schemas/snapshot.schema.json');
  for(const entry of catalog.snapshots) {
    assert(!ids.has(entry.id),'Snapshot duplicado');ids.add(entry.id);
    assert.equal(entry.path,'snapshots/'+entry.id+'/snapshot.json');
    const snapshot=await readJson('data/'+entry.path);
    validate(snapshot,schema);validateRelations(snapshot);
    assert.equal(snapshot.snapshot_id,entry.id);assert.equal(snapshot.fecha_corte,entry.fecha_corte);
    assert(!snapshot.calidad.some(q=>q.severidad==='error' && q.estado==='pendiente'),'Errores pendientes impiden publicar');
  }
  return catalog;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {await validateData();console.log('Datos válidos');}
