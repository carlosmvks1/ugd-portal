export const labels={covered:'Con cobertura reportada',not_covered:'Sin cobertura explícita',unknown:'Sin dato',pending:'Pendiente de verificación'};
export const normalize=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
export function readState(search){
 const p=new URLSearchParams(search);
 return Object.fromEntries(['territory','year','snapshot','care','manager','agreement','layer'].map(k=>[k,p.get(k)||'']));
}
export function stateUrl(state,url){
 const u=new URL(url);
 for(const key of ['territory','year','snapshot','care','manager','agreement','layer']) {if(state[key])u.searchParams.set(key,state[key]);else u.searchParams.delete(key);}
 return u;
}
export function options(data,snapshot){
 const rows=data.coverage.filter(r=>r.snapshot_id===snapshot);
 const agreements=data.agreements.filter(a=>a.snapshot_id===snapshot);
 const managers=data.managers.filter(m=>rows.some(r=>r.manager_id===m.manager_id));
 return {care:[...new Set(rows.map(r=>r.care_level).filter(Boolean))],manager:[...new Set(managers.map(m=>m.type).filter(Boolean))],agreement:[...new Set(agreements.map(a=>a.status).filter(Boolean))]};
}
export function sanitizeState(data,input){
 const state={...input};
 const snapshot=data.snapshots.find(s=>s.snapshot_id===state.snapshot&&(!state.year||String(s.year)===state.year))||data.snapshots.find(s=>String(s.year)===state.year);
 // Un año solicitado sin datos no cae silenciosamente a otro período.
 if(snapshot){state.snapshot=snapshot.snapshot_id;state.year=String(snapshot.year);}
 else if(!state.year){const s=data.snapshots.at(-1);state.snapshot=s?.snapshot_id||'';state.year=s?String(s.year):'';}
 else state.snapshot='';
 if(!data.territories.some(t=>t.official_code===state.territory))state.territory='';
 const available=options(data,state.snapshot);
 for(const k of ['care','manager','agreement'])if(!available[k].includes(state[k]))state[k]='';
 if(!['status','proportion','population'].includes(state.layer))state.layer='status';
 return state;
}
export function filteredCoverage(data,state){
 return data.coverage.filter(r=>r.snapshot_id===state.snapshot&&(!state.care||r.care_level===state.care)&&(!state.manager||data.managers.some(m=>m.manager_id===r.manager_id&&m.type===state.manager))&&(!state.agreement||data.agreements.some(a=>a.snapshot_id===state.snapshot&&r.agreement_ids.includes(a.agreement_id)&&a.status===state.agreement)));
}
export function territoryModel(data,state,territory){
 const dept=territory.type==='department';
 const codes=new Set(dept?data.territories.filter(t=>t.parent_id===territory.official_code).map(t=>t.official_code):[territory.official_code]);
 const rows=filteredCoverage(data,state).filter(r=>codes.has(r.territory_id));
 const known=rows.filter(r=>r.coverage_status!=='unknown');
 const aggregate=dept&&!state.care&&!state.manager&&!state.agreement?data.departments.find(r=>r.snapshot_id===state.snapshot&&r.territory_id===territory.official_code):null;
 let status='unknown';
 if(aggregate||known.length){
  const pending=aggregate?aggregate.verification_status!=='official_verified':known.some(r=>r.verification_status!=='official_verified');
  status=pending?'pending':aggregate?(aggregate.municipalities_reported>0?'covered':'not_covered'):known.some(r=>r.coverage_status==='reported')?'covered':'not_covered';
 }
 const covered=aggregate?.municipalities_reported??new Set(rows.filter(r=>r.coverage_status==='reported').map(r=>r.territory_id)).size;
 const total=aggregate?.municipalities_total??codes.size;
 // Nunca sumar registros potencialmente superpuestos de niveles o convenios.
 const byCode=new Set(rows.map(r=>r.territory_id));
 const population=!dept&&known.length===1?known[0].population_covered:null;
 return {territory,rows,aggregate,status,covered,total,proportion:aggregate&&total?covered/total:null,population,
  complete:known.length>0&&byCode.size===codes.size,source_ids:[...new Set([aggregate?.source_id,...rows.map(r=>r.source_id)].filter(Boolean))]};
}
export function visibleTerritories(data,state){
 const selected=data.territories.find(t=>t.official_code===state.territory);
 const parent=selected?.type==='municipality'?selected.parent_id:selected?.official_code;
 return data.territories.filter(t=>parent?t.parent_id===parent:t.type==='department');
}
export function exportRows(data,state){
 const selected=data.territories.find(t=>t.official_code===state.territory);
 return filteredCoverage(data,state).filter(r=>r.coverage_status!=='unknown'&&(!selected||r.territory_id===selected.official_code||data.territories.some(t=>t.official_code===r.territory_id&&t.parent_id===selected.official_code))).map(r=>({snapshot:state.snapshot,year:state.year,...r,name:data.territories.find(t=>t.official_code===r.territory_id)?.name??''}));
}
export function csv(rows){
 if(!rows.length)return '';
 const keys=Object.keys(rows[0]);
 const cell=v=>{let s=Array.isArray(v)?v.join(';'):String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\uFEFF'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(row=>row.map(cell).join(',')).join('\r\n');
}
