// Directorio de gestores y ficha individual con enlace compartible
// (?gestor=<id>#ficha-gestor). «Gestor» es la entidad gestora del modelo
// institucional, no una persona. Las relaciones con territorios provienen solo
// de managers.json → assignments (identificadores explícitos).
import {esc,number,periodLabel,snapshotPeriod,sourceLine,verification,editorialNote,figure,safeLink} from './format.js';
import {isPublishable} from './contract.js';
import {careLabel,categoryLabel,managerById,sortManagers,territoriesForManager,photosFor,investmentFor} from './model.js';
import {datasetView} from './investment-view.js';
import {normalize} from '../map/model.js';

const $=s=>document.querySelector(s);
const channelHref=c=>c.type==='email'?'mailto:'+c.value:c.type==='phone'?'tel:'+c.value.replace(/[^\d+]/g,''):c.type==='website'&&safeLink(c.value)?c.value:'';

// Enlace a una vista del mismo documento: conserva los parámetros actuales y
// cambia solo los indicados. navigation.js lo resuelve sin recargar.
export function viewUrl(patch,hash){
 const url=new URL(location.href);
 for(const [k,v] of Object.entries(patch)){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}
 url.hash=hash;
 return url.pathname.split('/').pop()+url.search+url.hash;
}
export const profileLink=id=>viewUrl({gestor:id},'ficha-gestor');
const mapLink=(id,group,territory='')=>{
 const year=group.snapshot?String(group.snapshot.year):'';
 return viewUrl({gestor:id,year,snapshot:group.snapshot_id,care:group.care_level||'',territory},'presencia');
};

export function createManagersView(result){
 const {content,failed,preview}=result;
 let archive=null,notFound='',copied='';
 const typeLabel=m=>categoryLabel(content,'entity_types',m.entity_type)||(m.entity_type?'Tipo: '+m.entity_type:'Tipo de entidad pendiente de confirmación');
 const territoryName=t=>{
  if(!t.territory)return archive?'Territorio '+t.territory_id:'Territorio '+t.territory_id+' (nombres no disponibles)';
  const parent=t.territory.parent_id?archive.territories.find(x=>x.official_code===t.territory.parent_id):null;
  return t.territory.name+(parent?' ('+parent.name+')':'');
 };
 function latestGroups(id){
  const groups=territoriesForManager(content,archive,id);
  const latest=groups[0]?.snapshot_id;
  return {groups,latest:groups.filter(g=>g.snapshot_id===latest)};
 }
 function territoriesSection(m){
  const groups=territoriesForManager(content,archive,m.manager_id);
  if(!groups.length)return `<section class="profile-section"><h5>Territorios vinculados</h5><p>La UGD todavía no ha confirmado territorios vinculados a este gestor.</p></section>`;
  return `<section class="profile-section"><h5>Territorios vinculados</h5>
   <p class="content-note">Cada grupo corresponde a un período y un nivel de atención; no se combinan asignaciones de períodos distintos.</p>
   ${groups.map(g=>{
    const list=`<ul class="territory-links">${g.assignments.map(a=>`<li><a data-state-link href="${esc(mapLink(m.manager_id,g,a.territory_id))}">${esc(territoryName(a))}</a>${a.verification_status!==m.verification_status?`<small>${esc(verification(a.verification_status))}</small>`:''}${a.note?`<small>${esc(a.note)}</small>`:''}${editorialNote(a,preview)}</li>`).join('')}</ul>`;
    const label=`${snapshotPeriod(g.snapshot)} · ${careLabel(content,g.care_level)} · ${number(g.assignments.length)} ${g.assignments.length===1?'territorio':'territorios'}`;
    return `<div class="territory-group"><p class="territory-group-head"><strong>${esc(label)}</strong> <a class="map-link" data-state-link href="${esc(mapLink(m.manager_id,g))}">Ver en el mapa</a></p>
     ${g.assignments.length>24?`<details><summary>Mostrar los ${number(g.assignments.length)} territorios</summary>${list}</details>`:list}
     ${sourceLine(content,archive,[...new Set(g.assignments.map(a=>a.source_id))])}</div>`;
   }).join('')}</section>`;
 }
 function populationSection(m){
  if(!m.population?.length)return '';
  return `<section class="profile-section"><h5>Población reportada</h5><ul class="record-list">${m.population.map(p=>{
   const def=categoryLabel(content,'population_definitions',p.definition)||'Definición pendiente de confirmación';
   return `<li><strong>${esc(number(p.value))}</strong><span>${esc(periodLabel(p.period))}${p.care_level?' · '+esc(careLabel(content,p.care_level)):''}</span><span>${esc(def)}</span><span>${esc(verification(p.verification_status))}</span>${p.note?`<span>${esc(p.note)}</span>`:''}${sourceLine(content,archive,[p.source_id])}</li>`;
  }).join('')}</ul><p class="content-note">Cifras reportadas por la fuente para el gestor; no se obtienen sumando territorios ni se comparan entre períodos.</p></section>`;
 }
 function investmentSection(m){
  const sets=investmentFor(content,{scope:'manager',id:m.manager_id});
  if(!sets.length)return '';
  return `<section class="profile-section"><h5>Inversión atribuida a este gestor</h5>${sets.map(d=>datasetView(content,archive,d,{preview,heading:'h6'})).join('')}</section>`;
 }
 // La primera fotografía del gestor encabeza la ficha; las demás forman la
 // galería. Ninguna se repite.
 function photosSection(m){
  const list=photosFor(content,{manager:m.manager_id}).slice(1);
  return list.length?`<section class="profile-section"><h5>Fotografías</h5><div class="profile-photos">${list.map(p=>figure(p,{preview})).join('')}</div></section>`:'';
 }
 function banner(m){
  const photo=photosFor(content,{manager:m.manager_id})[0];
  if(!photo)return '';
  const meta=[photo.description,photo.place,photo.date_label||(photo.date?photo.date.slice(0,4):'')].filter(Boolean).join(' · ');
  return `<figure class="profile-banner" data-photo="${esc(photo.photo_id)}"><img src="./${esc(photo.src)}" alt="${esc(photo.alt)}" width="${Number(photo.width)}" height="${Number(photo.height)}"${photo.focus?` style="object-position:${esc(photo.focus)}"`:''} decoding="async"><figcaption class="profile-banner-credit">${esc(meta)} · Crédito: ${esc(photo.credit)}${preview&&!isPublishable(photo)?' · Vista previa, no se publica':''}</figcaption></figure>`;
 }
 // Datos esenciales en la cabecera: ámbito territorial actual y población más reciente.
 function facts(m){
  const {latest}=latestGroups(m.manager_id);
  const codes=new Set(latest.flatMap(g=>g.assignments.map(a=>a.territory_id)));
  const items=[];
  if(codes.size)items.push(`<li><strong>${number(codes.size)}</strong> ${codes.size===1?'territorio':'territorios'} · ${esc(snapshotPeriod(latest[0].snapshot))}</li>`);
  const pop=[...(m.population||[])].filter(p=>p.value!=null).sort((a,b)=>b.period.end.localeCompare(a.period.end))[0];
  if(pop)items.push(`<li>Población reportada: <strong>${esc(number(pop.value))}</strong> · ${esc(periodLabel(pop.period))}</li>`);
  return items.length?`<ul class="profile-facts">${items.join('')}</ul>`:'';
 }
 function contactSection(m){
  if(!m.contact?.length)return '';
  return `<section class="profile-section"><h5>Contacto institucional</h5><ul class="content-list channel-list">${m.contact.map(c=>{const h=channelHref(c);return `<li><span>${esc(c.label)}</span><strong>${h?`<a href="${esc(h)}">${esc(c.value)}</a>`:esc(c.value)}</strong>${c.note?`<small>${esc(c.note)}</small>`:''}</li>`;}).join('')}</ul></section>`;
 }
 function labelsSection(m){
  if(!m.archive_labels?.length||!archive)return '';
  const labels=m.archive_labels.map(id=>archive.managers.find(x=>x.manager_id===id)?.source_label).filter(Boolean);
  return labels.length?`<p class="content-note">Equivalencia declarada por la UGD con ${labels.length===1?'la etiqueta':'las etiquetas'} ${labels.map(l=>'«'+esc(l)+'»').join(', ')} del archivo histórico.</p>`:'';
 }
 function profile(m){
  const {latest}=latestGroups(m.manager_id);
  const mapAll=latest[0]?`<a class="btn btn-secondary" data-state-link href="${esc(viewUrl({gestor:m.manager_id,year:latest[0].snapshot?String(latest[0].snapshot.year):'',snapshot:latest[0].snapshot_id,care:latest.length===1?latest[0].care_level||'':'',territory:''},'presencia'))}">Ver sus territorios en el mapa</a>`:'';
  const head=banner(m);
  const aside=`${m.description?`<section class="profile-section"><h5>Descripción</h5><p>${esc(m.description)}</p></section>`:''}
   ${m.scope?`<section class="profile-section"><h5>Ámbito de trabajo</h5><p>${esc(m.scope)}</p></section>`:''}
   ${contactSection(m)}
   ${m.source_ids.length?`<section class="profile-section"><h5>Fuentes</h5>${sourceLine(content,archive,m.source_ids)}</section>`:''}
   ${labelsSection(m)}`.trim();
  return `<article id="ficha-gestor" class="manager-profile" aria-labelledby="ficha-gestor-title" data-manager="${esc(m.manager_id)}">
   <header class="profile-head${head?' has-photo':''}">${head}
    <p class="detail-kicker">${esc(typeLabel(m))}</p>
    <h4 id="ficha-gestor-title">${esc(m.name)}</h4>
    ${m.short_name?`<p class="profile-short">${esc(m.short_name)}</p>`:''}
    ${facts(m)}
    <p class="profile-verification">${esc(verification(m.verification_status))}</p>
    ${editorialNote(m,preview)}
    ${m.note?`<p class="content-warning">${esc(m.note)}</p>`:''}
   </header>
   <div class="profile-body">
    <div class="profile-main">${territoriesSection(m)}${populationSection(m)}${investmentSection(m)}${photosSection(m)}</div>
    ${aside?`<div class="profile-aside">${aside}</div>`:''}
   </div>
   <div class="profile-actions">${mapAll}<button type="button" class="link-button" data-copy-profile>Copiar enlace a esta ficha</button><a class="link-button" data-state-link href="${esc(viewUrl({gestor:''},'gestores'))}">Volver al directorio</a></div>
   <p class="profile-copy-status" role="status">${esc(copied)}</p>
  </article>`;
 }
 function directory(){
  const list=sortManagers(content.managers.managers);
  if(!list.length)return '<p class="managers-empty">La UGD todavía no ha publicado su directorio de gestores. Las fichas aparecerán aquí cuando se incorpore información autorizada.</p>';
  const items=list.map(m=>{
   const {latest}=latestGroups(m.manager_id);
   const codes=new Set(latest.flatMap(g=>g.assignments.map(a=>a.territory_id)));
   const scope=codes.size?`${number(codes.size)} ${codes.size===1?'territorio':'territorios'} · ${snapshotPeriod(latest[0].snapshot)}`:'Territorios pendientes de confirmación';
   return `<li data-name="${esc(normalize(m.name+' '+(m.short_name||'')))}"><a data-state-link href="${esc(profileLink(m.manager_id))}">${esc(m.name)}</a><span>${esc(typeLabel(m))}</span><span>${esc(scope)}</span>${editorialNote(m,preview)}</li>`;
  }).join('');
  const filter=list.length>8?`<div class="directory-filter"><label for="manager-filter">Filtrar gestores por nombre</label><input id="manager-filter" type="search" autocomplete="off" aria-describedby="manager-filter-count"><p id="manager-filter-count" role="status">${number(list.length)} gestores</p></div>`:'';
  return `${filter}<ul class="manager-directory">${items}</ul>`;
 }
 function render(){
  const root=$('#manager-directory'),slot=$('#manager-profile');
  if(!root||!slot)return;
  if(failed.has('managers')){root.innerHTML='<p class="content-error" role="status">No se pudo cargar el directorio de gestores. Recargue la página para intentarlo de nuevo.</p>';slot.innerHTML='';return;}
  const id=new URLSearchParams(location.search).get('gestor')||'';
  const manager=id?managerById(content,id):null;
  if(id&&!manager)notFound=id;
  slot.innerHTML=manager?profile(manager):notFound?`<p class="content-warning" id="ficha-gestor" tabindex="-1">No se encontró la ficha solicitada («${esc(notFound)}»). Puede que el gestor no figure en el directorio publicado.</p>`:'';
  const filterValue=$('#manager-filter')?.value||'';
  root.innerHTML=directory();
  root.closest('.managers-block')?.classList.toggle('has-profile',!!manager);
  const input=$('#manager-filter');
  if(input){
   input.value=filterValue;
   const apply=()=>{const q=normalize(input.value);let shown=0;root.querySelectorAll('.manager-directory li').forEach(li=>{const ok=!q||li.dataset.name.includes(q);li.hidden=!ok;if(ok)shown++;});$('#manager-filter-count').textContent=shown?`${number(shown)} ${shown===1?'gestor':'gestores'}`:'Ningún gestor coincide con el filtro';};
   input.oninput=apply;apply();
  }
  slot.querySelector('[data-copy-profile]')?.addEventListener('click',async()=>{
   const url=new URL(location.href);url.hash='ficha-gestor';
   try{await navigator.clipboard.writeText(url.href);copied='Enlace copiado.';}catch{copied='Copie la dirección del navegador para compartir esta ficha.';}
   slot.querySelector('.profile-copy-status').textContent=copied;copied='';
  });
 }
 const reset=()=>{notFound='';render();};
 window.addEventListener('popstate',reset);
 window.addEventListener('ugd:navigate',reset);
 window.addEventListener('ugd:state',render);
 render();
 return {setArchive(value){archive=value;render();},render};
}
