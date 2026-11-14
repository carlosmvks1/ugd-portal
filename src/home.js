import {latestSnapshot,snapshotNotice} from './map/snapshots.js';
const fmt=new Intl.NumberFormat('es-HN');

// Key facts for the opening section. Each figure keeps period, source and
// verification state; no figures are summed from possibly overlapping rows.
export function keyFacts(data){
 const snapshot=latestSnapshot(data.snapshots);
 if(!snapshot)return null;
 const i=snapshot.indicators||{};
 const reported=new Set(data.coverage.filter(r=>r.snapshot_id===snapshot.snapshot_id&&r.coverage_status==='reported').map(r=>r.territory_id));
 const departments=new Set(data.territories.filter(t=>reported.has(t.official_code)).map(t=>t.parent_id).filter(Boolean));
 const fromAggregate=data.departments.filter(d=>d.snapshot_id===snapshot.snapshot_id&&d.municipalities_reported>0).map(d=>d.territory_id);
 for(const code of fromAggregate)departments.add(code);
 return {snapshot,population:i.population_I??null,municipalities:i.municipalities_narrative??null,municipalitiesTable:i.municipalities_table??null,departments:departments.size||null,source:data.sources.find(s=>s.source_id===snapshot.source_id)};
}

export function renderHome(data){
 const facts=keyFacts(data),line=document.querySelector('#facts-source');
 if(!line)return;
 if(!facts){line.textContent='Todavía no hay datos territoriales publicados.';return;}
 const show=(id,value)=>{document.querySelector(id).textContent=value==null?'Sin dato':fmt.format(value);};
 show('#fact-population',facts.population);
 show('#fact-municipalities',facts.municipalities);
 show('#fact-departments',facts.departments);
 const note=document.querySelector('#fact-municipalities-note');
 note.textContent=facts.municipalities!=null&&facts.municipalitiesTable!=null&&facts.municipalities!==facts.municipalitiesTable
  ?'La fuente dice '+fmt.format(facts.municipalities)+' en el texto y '+fmt.format(facts.municipalitiesTable)+' en su tabla.':'';
 line.textContent='Datos de '+facts.snapshot.year+(facts.source?' · Fuente: '+facts.source.title:'')+' · '+snapshotNotice(facts.snapshot)+'.';
}

export function homeUnavailable(message){
 const line=document.querySelector('#facts-source');
 if(line)line.textContent=message;
}
