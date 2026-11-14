// Gestores registered in the source, shown inside "Presencia territorial".
// Territorial links come only from coverage.manager_id, never from name similarity.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function institutionalRecords(data){
 return {
  managers:data.managers.map(manager=>({manager,territories:data.territories.filter(t=>data.coverage.some(r=>r.manager_id===manager.manager_id&&r.territory_id===t.official_code))}))
 };
}
export function renderManagers(data){
 const root=document.querySelector('#manager-list');
 if(!root)return;
 const {managers}=institutionalRecords(data);
 const source=data.sources.find(s=>s.source_id===managers[0]?.manager.source_id);
 const linked=managers.some(r=>r.territories.length);
 document.querySelector('#managers-summary').textContent=managers.length+' nombres según '+(source?.title||'la fuente');
 root.innerHTML=`<p class="manager-note">Nombres tal como aparecen en la fuente.${linked?'':' La UGD todavía no ha confirmado qué gestor trabaja en cada territorio; ese vínculo se mostrará en el mapa cuando esté disponible.'}</p>
 <ul>${managers.map(({manager:m,territories})=>`<li id="gestor-${esc(m.manager_id)}"><strong>${esc(m.legal_name||m.source_label)}</strong>${territories.length?`<span>${territories.map(t=>esc(t.name)).join(', ')}</span>`:''}</li>`).join('')}</ul>`;
}
