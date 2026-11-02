import assert from 'node:assert/strict';
import {validate} from './schema.mjs';
import {explorerSchema} from '../src/map/contract.js';
export function validateExplorer(data){
 validate(data,explorerSchema);
 assert.equal(data.schema_version,'territorial-1');
 const unique=(rows,key)=>{assert(Array.isArray(rows));const ids=new Set(rows.map(r=>r[key]));assert.equal(ids.size,rows.length,'Duplicados: '+key);return ids;};
 const territories=unique(data.territories,'official_code'),snapshots=unique(data.snapshots,'snapshot_id'),sources=unique(data.sources,'source_id');
 unique(data.data_quality_issues,'issue_id');unique(data.managers,'manager_id');unique(data.agreements,'agreement_id');
 for(const t of data.territories){assert.equal(t.territory_id,t.official_code);assert(new RegExp(t.type==='department'?'^\\d{2}$':'^\\d{4}$').test(t.official_code));if(t.type==='municipality'){assert(t.parent_id);assert(t.official_code.startsWith(t.parent_id));assert(data.territories.some(d=>d.official_code===t.parent_id&&d.type==='department'));}else assert.equal(t.parent_id,null);assert(sources.has(t.source_id));}
 for(const s of data.snapshots){assert.equal(String(s.year),s.period_start.slice(0,4));assert.equal(String(s.year),s.period_end.slice(0,4));assert(s.period_start<=s.period_end);assert(s.cutoff_date===null||/^\d{4}-\d{2}-\d{2}$/.test(s.cutoff_date));assert(sources.has(s.source_id));}
 for(const s of data.snapshots)if(s.comparison){assert(sources.has(s.comparison.source_id),'Fuente metodológica inexistente');assert.equal(s.period_start,String(s.year)+'-01-01','Comparación anual requiere año completo');assert.equal(s.period_end,String(s.year)+'-12-31','Comparación anual requiere año completo');}
 for(const m of data.managers)assert(sources.has(m.source_id));
 for(const a of data.agreements){
  assert(snapshots.has(a.snapshot_id));assert(sources.has(a.source_id));
  assert(data.managers.some(m=>m.manager_id===a.manager_id));
  assert(a.valid_to===null||a.valid_from<=a.valid_to,'Vigencia inválida');
 }
 const keys=new Set();
 for(const r of data.coverage){
  const key=[r.snapshot_id,r.territory_id,r.care_level].join('/');assert(!keys.has(key),'Cobertura duplicada');keys.add(key);
  assert(snapshots.has(r.snapshot_id));assert(data.territories.some(t=>t.official_code===r.territory_id&&t.type==='municipality'));assert(r.coverage_status==='unknown'&&r.source_id===null||sources.has(r.source_id));assert(['reported','not_covered','unknown'].includes(r.coverage_status));
  assert(r.population_covered===null||Number.isFinite(r.population_covered)&&r.population_covered>=0);if(r.coverage_status==='unknown')assert.equal(r.population_covered,null);
  if(r.coverage_status!=='unknown')assert(r.source_page>0,'Registro explícito sin página de fuente');
  if(r.manager_id)assert(data.managers.some(m=>m.manager_id===r.manager_id));
  assert.equal(new Set(r.agreement_ids).size,r.agreement_ids.length,'Convenios duplicados');
  for(const id of r.agreement_ids)assert(data.agreements.some(a=>a.agreement_id===id&&a.snapshot_id===r.snapshot_id&&a.manager_id===r.manager_id&&a.care_level===r.care_level));
 }
 const aggregates=new Set();for(const r of data.departments){const key=r.snapshot_id+'/'+r.territory_id;assert(!aggregates.has(key));aggregates.add(key);assert(snapshots.has(r.snapshot_id));assert(data.territories.some(t=>t.official_code===r.territory_id&&t.type==='department'));assert(sources.has(r.source_id));assert(r.municipalities_reported>=0&&r.municipalities_reported<=r.municipalities_total);}
 for(const i of data.data_quality_issues){if(i.territory_id)assert(territories.has(i.territory_id));assert(sources.has(i.source_id));assert(i.detail);}
 for(const e of data.equivalences)assert(data.territories.some(t=>t.official_code===e.official_code&&t.parent_id===e.department_code));
 return data;
}
