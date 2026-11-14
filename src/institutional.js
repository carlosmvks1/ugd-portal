// Etiquetas de gestores transcritas del archivo territorial histórico. No son
// identidades jurídicas confirmadas: el directorio con fichas se alimenta de
// data/content/managers.json. Un vínculo con territorios solo existe cuando un
// registro lo declara por identificador (coverage.manager_id); nunca por nombre.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function institutionalRecords(data){
 return {
  managers:data.managers.map(manager=>({manager,territories:data.territories.filter(t=>data.coverage.some(r=>r.manager_id===manager.manager_id&&r.territory_id===t.official_code))}))
 };
}
export function renderManagers(data,content=null){
 const root=document.querySelector('#manager-list');
 if(!root)return;
 const {managers}=institutionalRecords(data);
 const drawer=root.closest('details');
 if(drawer)drawer.hidden=!managers.length;
 if(!managers.length)return;
 const source=data.sources.find(s=>s.source_id===managers[0]?.manager.source_id);
 const linked=managers.some(r=>r.territories.length);
 // Equivalencias declaradas en el directorio (archive_labels), nunca inferidas.
 const declared=new Map();
 for(const m of content?.managers.managers||[])for(const label of m.archive_labels||[])declared.set(label,m);
 document.querySelector('#managers-summary').textContent=managers.length+' nombres según '+(source?.title||'la fuente');
 root.innerHTML=`<p class="manager-note">Nombres tal como aparecen en la fuente histórica; no son identidades jurídicas confirmadas.${linked?'':' La UGD todavía no ha confirmado qué gestor trabaja en cada territorio; ese vínculo se mostrará en el mapa y en las fichas cuando esté disponible.'}</p>
 <ul>${managers.map(({manager:m,territories})=>{const entity=declared.get(m.manager_id);return `<li id="gestor-${esc(m.manager_id)}"><strong>${esc(m.legal_name||m.source_label)}</strong>${territories.length?`<span>${territories.map(t=>esc(t.name)).join(', ')}</span>`:''}${entity?`<span>Corresponde a <a data-state-link href="?gestor=${encodeURIComponent(entity.manager_id)}#ficha-gestor">${esc(entity.name)}</a> (equivalencia declarada por la UGD)</span>`:''}</li>`;}).join('')}</ul>`;
 // Enlaces antiguos a una etiqueta (#gestor-<id>) abren el cajón que la contiene.
 const hash=decodeURIComponent(location.hash.slice(1));
 if(drawer&&hash.startsWith('gestor-')&&document.getElementById(hash))drawer.open=true;
}
