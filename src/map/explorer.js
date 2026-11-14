import {localUrl} from '../config.js';
import {labels,normalize,options,sanitizeState,readState,stateUrl,territoryModel,visibleTerritories,exportRows,csv} from './model.js';
import {geometryPath,geometryBounds} from './geometry.js';
import {snapshotNotice,verificationLabels,latestSnapshot} from './snapshots.js';
import {siteArchive} from './contract.js';
import {trackLayout,writeHistory} from '../navigation.js';
import {emptyContent,linksForTerritory,highlightCodes,managersInPeriod,managerById,careLabel,categoryLabel,photosFor,investmentFor,populationPeriod} from '../content/model.js';
import {figure} from '../content/format.js';
import {datasetView} from '../content/investment-view.js';
const $=s=>document.querySelector(s);
// Paleta del mapa: misma que las variables --map-* de styles.css (leyenda).
const palette={reported:'#2F5E9E',low:'#A9BFDF',mid:'#5F84BE',empty:'#E6E0D2',link:'#13294F'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'Sin dato':new Intl.NumberFormat('es-HN').format(n);
const safeLink=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?esc(u.href):'';}catch{return '';}};
// «content» es el contenido institucional ya proyectado (solo piezas publicables
// salvo en vista previa). Los gestores se vinculan únicamente por identificador.
export async function startExplorer(data,config,load,content=emptyContent(),preview=false){
 let state=sanitizeState(data,readState(location.search),content),generation=0,expanded=false;
 const cache=new Map();
 const getGeometry=path=>{if(!cache.has(path))cache.set(path,load(localUrl(path,config.geographyRoot)).catch(e=>{cache.delete(path);throw e;}));return cache.get(path);};
 const find=code=>data.territories.find(t=>t.official_code===code);
 const snapshot=()=>data.snapshots.find(s=>s.snapshot_id===state.snapshot);
 const day=iso=>{const [y,m,d]=iso.split('-');return `${Number(d)}/${Number(m)}/${y}`;};
 const period=()=>{const s=snapshot();if(!s)return `${state.year||'Sin período'} · sin datos`;return s.period_start===s.year+'-01-01'&&s.period_end===s.year+'-12-31'?'Año '+s.year:`${day(s.period_start)} a ${day(s.period_end)}`;};
 const sourceTitle=()=>{const s=snapshot();return s?data.sources.find(x=>x.source_id===s.source_id)?.title||'':'';};
 const model=code=>territoryModel(data,state,find(code));
 function summary(m){return `<strong>${esc(m.territory.name)}</strong><br>${esc(labels[m.status])}<br>${m.aggregate?`${fmt(m.covered)} / ${fmt(m.total)} municipios reportados · ${(m.proportion*100).toFixed(1)}%`:'Cobertura municipal: '+(m.rows.some(r=>r.coverage_status==='reported')?'reportada':'sin dato')}<br>Población reportada:${fmt(m.population)}<br><small>${esc(period())}</small>`;}
 function fill(){
  const years=[...new Set(data.snapshots.map(s=>String(s.year)))];if(state.year&&!years.includes(state.year))years.push(state.year);
  $('#year').innerHTML=years.map(y=>`<option value="${esc(y)}">${esc(y)}${data.snapshots.some(s=>String(s.year)===y)?'':' · sin datos'}</option>`).join('');$('#year').value=state.year;
  const snapshots=data.snapshots.filter(s=>String(s.year)===state.year);
  $('#snapshot').innerHTML=snapshots.length?snapshots.map(s=>`<option value="${esc(s.snapshot_id)}">${esc(s.snapshot_id)}</option>`).join(''):'<option value="">Sin datos</option>';
  $('#snapshot').value=state.snapshot;$('#snapshot').disabled=snapshots.length<2;
  const available=options(data,state.snapshot,content);
  $('#care').innerHTML=`<option value="">${available.care.length?'Todos':'Sin datos disponibles'}</option>`+available.care.map(v=>`<option value="${esc(v)}">${esc(careLabel(content,v))}</option>`).join('');$('#care').value=state.care;$('#care').disabled=!available.care.length;
  const inPeriod=managersInPeriod(content,state),current=managerById(content,state.gestor);
  const listed=current&&!inPeriod.includes(current)?[...inPeriod,current]:inPeriod;
  $('#gestor').innerHTML=`<option value="">${listed.length?'Todos':'Sin gestores confirmados'}</option>`+listed.map(m=>`<option value="${esc(m.manager_id)}">${esc(m.name)}${inPeriod.includes(m)?'':' · sin territorios en este período'}</option>`).join('');
  $('#gestor').value=state.gestor;$('#gestor').disabled=!listed.length;
  $('#layer').value=state.layer;
 }
 function color(m){
  if(state.gestor)return highlight().has(m.territory.official_code)?palette.link:palette.empty;
  if(m.status==='unknown')return 'url(#unknown)';
  if(state.layer==='proportion')return m.proportion==null?'url(#unknown)':m.proportion===0?palette.empty:m.proportion<.25?palette.low:m.proportion<.6?palette.mid:palette.reported;
  if(state.layer==='population'){
   if(m.population==null)return 'url(#unknown)';
   const max=Math.max(1,...visibleTerritories(data,state).map(t=>territoryModel(data,state,t).population??0));
   return m.population/max<.33?palette.low:m.population/max<.66?palette.mid:palette.reported;
  }
  return {covered:palette.reported,not_covered:palette.empty}[m.status];
 }
 const highlight=()=>highlightCodes(content,data,state,state.gestor);
 const profileUrl=id=>{const u=stateUrl({...visibleState(),gestor:id},location.href);u.hash='ficha-gestor';return u.pathname.split('/').pop()+u.search+u.hash;};
 const managerType=m=>categoryLabel(content,'entity_types',m.entity_type);
 // Gestores vinculados al territorio en el período y nivel consultados.
 function managersSection(t,m){
  if(!snapshot())return '<div class="detail-section detail-managers"><h3>Gestores vinculados</h3><p>Sin datos para el período seleccionado.</p></div>';
  const links=linksForTerritory(content,data,state,t.official_code);
  // Etiquetas transcritas del archivo histórico, solo si el registro las enlaza por ID.
  const labels=data.managers.filter(x=>m.rows.some(r=>r.manager_id===x.manager_id));
  const scope=`${period()}${state.care?' · '+careLabel(content,state.care):''}`;
  const items=links.map(({manager,direct,municipal})=>{
   const levels=[...new Set([...direct,...municipal].map(a=>careLabel(content,a.care_level)))].join(', ');
   const where=municipal.length?(direct.length?'Vínculo departamental y en ':'En ')+municipal.length+(municipal.length===1?' municipio':' municipios'):'';
   return `<li><a data-state-link href="${esc(profileUrl(manager.manager_id))}">${esc(manager.name)}</a><span>${[managerType(manager),levels,where].filter(Boolean).map(esc).join(' · ')}</span></li>`;
  }).join('');
  const labelText=labels.length?`<p class="detail-note">Etiqueta en la fuente histórica, no confirmada como entidad: ${labels.map(x=>esc(x.source_label)).join(', ')}.</p>`:'';
  return `<div class="detail-section detail-managers"><h3>Gestores vinculados</h3>
   ${links.length?`<ul class="detail-manager-list">${items}</ul>`:'<p>La UGD no ha confirmado el gestor vinculado a este territorio para el período y nivel consultados. Esto no significa que el territorio carezca de gestor.</p>'}
   <p class="detail-note">${esc(scope)}</p>${labelText}</div>`;
 }
 function showPreview(code,el){
  const tip=$('#tooltip');tip.innerHTML=summary(model(code));tip.hidden=false;
  const rect=el.getBoundingClientRect(),box=$('.map-wrap').getBoundingClientRect();
  tip.style.left=Math.max(8,Math.min(rect.x-box.x+rect.width/2,box.width-tip.offsetWidth-8))+'px';
  tip.style.top=Math.max(8,Math.min(rect.y-box.y,box.height-tip.offsetHeight-8))+'px';el.setAttribute('aria-describedby','tooltip');
 }
 function hidePreview(){$('#tooltip').hidden=true;$('#map').querySelectorAll('[aria-describedby]').forEach(el=>el.removeAttribute('aria-describedby'));}
 function bindSelection(root){root.querySelectorAll('[data-territory]').forEach(el=>el.onclick=e=>{select(el.dataset.territory);if(e.detail===0){const heading=$('#detail h2');heading?.setAttribute('tabindex','-1');heading?.focus();}});}
 function select(code){expanded=false;$('#detail').classList.remove('collapsed');state.territory=code;update(true);}
 // En teléfono la ficha del territorio es una hoja inferior: al abrir la ficha
 // de un gestor se pliega a una barra con el nombre para no tapar la ficha.
 function syncSheet(){$('#detail').classList.toggle('collapsed',location.hash==='#ficha-gestor');}
 function atlasMeta(){
  const selected=find(state.territory),department=selected?.type==='municipality'?find(selected.parent_id):selected;
  const m=selected?model(selected.official_code):null,s=snapshot(),source=s?data.sources.find(x=>x.source_id===s.source_id):null;
  $('#atlas-title').textContent=selected?(selected.type==='municipality'?selected.name+' · '+(department?.name||''):selected.name):'Honduras';
  if(selected?.type==='department'&&m?.aggregate){
    $('#atlas-subtitle').textContent=fmt(m.covered)+' de '+fmt(m.total)+' municipios reportados · '+(m.proportion*100).toFixed(1)+'%';
  }else if(selected?.type==='municipality'){
    $('#atlas-subtitle').textContent=labels[m.status]+(m.population!=null?' · '+fmt(m.population)+' habitantes reportados':'');
  }else{
    $('#atlas-subtitle').textContent=data.territories.filter(t=>t.type==='department').length+' departamentos · '+period();
  }
  $('#atlas-source').textContent=source?('Fuente: '+source.title):period();
 }

 function detail(){
  const t=find(state.territory);$('#detail').classList.toggle('selected',!!t);$('#detail').classList.toggle('expanded',expanded);
  if(!t){$('#detail').innerHTML='<div class="detail-empty"><h2>Elija un territorio</h2><p>Seleccione un departamento en el mapa o en la lista para ver sus gestores, población y fuentes.</p></div>';return;}
  const m=model(t.official_code);
  const sources=m.source_ids.map(id=>data.sources.find(s=>s.source_id===id)).filter(Boolean);
  const explicit=m.rows.filter(r=>r.coverage_status!=='unknown');
  const coverageText=m.aggregate?fmt(m.covered)+' / '+fmt(m.total):'—';
  const coveragePercent=m.aggregate&&m.proportion!=null?(m.proportion*100).toFixed(1)+'%':'—';
  const populationText=fmt(m.population);
  const pages=[...new Set(explicit.map(r=>r.source_page).filter(Boolean))];
  const recordDetail=t.type==='department'
    ?(explicit.length?fmt(explicit.length)+' registros municipales en la fuente.':'Sin registros municipales para este período.')
    :(explicit.length?explicit.map(r=>esc(r.care_level)+' · '+esc(r.scope_note||'Reportado en fuente')).join('<br>'):'Sin registro municipal para este período.');
  const progress=m.aggregate&&m.proportion!=null?Math.max(0,Math.min(100,m.proportion*100)):null;
  // Mention record-level verification only when it differs from the period's.
  const recordLabels=[...new Set(explicit.map(r=>verificationLabels[r.verification_status]||'Verificación no disponible'))].filter(l=>l!==verificationLabels[snapshot()?.verification_status]);
  const recordNotice=recordLabels.length?' · Registros: '+recordLabels.map(esc).join(', '):'';
  const populationInfo=populationPeriod(content,state.snapshot);
  const definition=categoryLabel(content,'population_definitions',populationInfo?.definition)||'definición pendiente';
  const photos=photosFor(content,{territory:t.official_code});
  const investment=t.type==='department'?investmentFor(content,{scope:'department',id:t.official_code}):[];
  $('#detail').innerHTML=`<div class="territory-sheet-head">
    <div>
      <p class="detail-kicker">${esc(t.type==='department'?'Departamento':'Municipio')}</p>
      <h2>${esc(t.name)}</h2>
    </div>
    <div class="territory-code"><span>Código</span><strong>${esc(t.official_code)}</strong></div>
    <button id="close-detail" aria-label="Cerrar selección">Cerrar</button>
  </div>
  <p class="detail-status"><span class="detail-status-dot status-${esc(m.status)}" aria-hidden="true"></span>${esc(labels[m.status])}</p>
  <p class="detail-verification">${esc(snapshotNotice(snapshot()))}${recordNotice}</p>
  ${managersSection(t,m)}
  <div class="detail-metrics">
    ${m.aggregate?`<div><span>Municipios</span><strong>${coverageText}</strong><small>reportados / total</small></div>
    <div><span>Proporción</span><strong>${coveragePercent}</strong><small>cobertura municipal</small></div>`:''}
    <div><span>Población</span><strong>${populationText}</strong><small>reportada · ${esc(definition)}</small></div>
  </div>
  ${progress==null?'':`<div class="coverage-progress" aria-label="Proporción municipal ${progress.toFixed(1)}%"><span style="width:${progress.toFixed(1)}%"></span></div>`}
  <button id="expand" aria-expanded="${expanded}">${expanded?'Reducir ficha':'Ver ficha completa'}</button>
  <div class="panel-content">
    <div class="provenance-rail" aria-label="Procedencia del dato">
      <div><span>Período</span><strong>${esc(period())}</strong></div>
      <div><span>Fuente</span><strong>${sources.length?sources.map(s=>`<a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('<br>'):'Sin registro disponible'}</strong></div>
      ${pages.length?'<div><span>Página</span><strong>'+pages.map(esc).join(', ')+'</strong></div>':''}
    </div>
    <div class="detail-section"><h3>Alcance</h3><p>${recordDetail}</p>${populationInfo?.note?`<p class="detail-note">${esc(populationInfo.note)}</p>`:''}</div>
    ${investment.length?`<div class="detail-section"><h3>Inversión atribuida al departamento</h3>${investment.map(d=>datasetView(content,data,d,{preview,heading:'h4'})).join('')}</div>`:''}
    ${photos.length?`<div class="detail-section"><h3>Fotografías</h3>${photos.map(p=>figure(p,{preview})).join('')}</div>`:''}
    ${t.type==='department'?'<div class="detail-section"><h3>Municipios</h3><div class="municipality-links">'+data.territories.filter(x=>x.parent_id===t.official_code).map(x=>`<button data-territory="${esc(x.official_code)}">${esc(x.name)}</button>`).join('')+'</div></div>':''}
  </div>`;
  $('#close-detail').onclick=()=>{select(t.type==='municipality'?t.parent_id:'');$('#home').focus();};
  $('#expand').onclick=()=>{expanded=!expanded;detail();$('#expand').focus();};bindSelection($('#detail'));
 }
 function search(){
  const q=normalize($('#search').value),matches=q?data.territories.filter(t=>normalize(t.name).includes(q)||t.official_code.includes(q)):[];
  $('#results').innerHTML=matches.slice(0,40).map(t=>`<li><button data-territory="${esc(t.official_code)}">${esc(t.name)} · ${esc(t.official_code)}${t.parent_id?' · '+esc(find(t.parent_id)?.name):''}</button></li>`).join('');
  if(matches.length>40)$('#results').insertAdjacentHTML('beforeend','<li>Más resultados; precise la búsqueda.</li>');bindSelection($('#results'));
 }
 function table(){
  const territories=visibleTerritories(data,state);$('#caption').textContent=territories.length+' territorios · '+period()+(sourceTitle()?' · Fuente: '+sourceTitle():'');
  const hl=state.gestor?highlight():null;
  $('#table tbody').innerHTML=territories.map(t=>{const m=model(t.official_code),links=snapshot()?linksForTerritory(content,data,state,t.official_code):[];
   const shown=links.slice(0,3).map(({manager})=>`<a data-state-link href="${esc(profileUrl(manager.manager_id))}">${esc(manager.name)}</a>`).join(', ')+(links.length>3?` y ${links.length-3} más`:'');
   return `<tr ${state.territory===t.official_code?'aria-selected="true"':''}${hl?.has(t.official_code)?' class="is-highlighted"':''}><th scope="row"><button data-territory="${esc(t.official_code)}">${esc(t.name)}</button></th><td>${esc(labels[m.status])}</td><td>${m.aggregate?`${fmt(m.covered)} / ${fmt(m.total)}`:'No aplica'}</td><td>${fmt(m.population)}</td><td>${links.length?shown:'Sin vínculo confirmado'}</td><td>${m.source_ids.length?esc(period()):'Sin registro'}</td></tr>`;}).join('');bindSelection($('#table'));
 }
 function breadcrumbs(){
  const t=find(state.territory),d=t?.type==='municipality'?find(t.parent_id):t;
  $('#breadcrumbs').innerHTML=`<button data-territory="">Honduras</button>${d?` › <button data-territory="${esc(d.official_code)}" ${t===d?'aria-current="location"':''}>${esc(d.name)}</button>`:''}${t?.type==='municipality'?` › <span aria-current="location">${esc(t.name)}</span>`:''}`;bindSelection($('#breadcrumbs'));
 }
 function legend(){
  legendBody();
  if(find(state.territory))$('#legend').insertAdjacentHTML('beforeend','<span><i class="legend-swatch legend-selected"></i>Territorio seleccionado</span>');
 }
 function legendBody(){
  const banner=$('#gestor-banner'),manager=managerById(content,state.gestor);
  if(manager){
   const count=[...highlight()].filter(code=>find(code)?.type==='municipality').length;
   banner.innerHTML=`<p>Territorios vinculados a <strong>${esc(manager.name)}</strong> · ${esc(period())}${state.care?' · '+esc(careLabel(content,state.care)):''}: ${count?fmt(count)+(count===1?' municipio':' municipios'):'ninguno en este período y nivel'}.</p><p><a data-state-link href="${esc(profileUrl(manager.manager_id))}">Ver ficha</a> <button type="button" id="clear-gestor" class="link-button">Quitar resaltado</button></p>`;
   banner.hidden=false;$('#clear-gestor').onclick=()=>{state.gestor='';update(true);$('#gestor').focus();};
   $('#legend').innerHTML='<span><i class="legend-swatch legend-covered"></i>Con vínculo confirmado</span><span><i class="legend-swatch legend-empty"></i>Sin vínculo confirmado</span>';
   return;
  }
  banner.hidden=true;banner.replaceChildren();
  if(state.layer==='status'){
    $('#legend').innerHTML='<span><i class="legend-swatch legend-covered"></i>Cobertura reportada</span><span><i class="legend-swatch legend-empty"></i>Sin cobertura reportada</span><span><i class="legend-swatch legend-unknown"></i>Sin dato</span>';
  }else if(state.layer==='proportion'){
    $('#legend').innerHTML='<span><i class="legend-swatch legend-empty"></i>0%</span><span><i class="legend-swatch legend-low"></i>Más de 0 y menos de 25%</span><span><i class="legend-swatch legend-mid"></i>25 a menos de 60%</span><span><i class="legend-swatch legend-covered"></i>60–100%</span><span><i class="legend-swatch legend-unknown"></i>Sin dato aplicable</span>';
  }else{
    $('#legend').innerHTML='<span><i class="legend-swatch legend-low"></i>Menor</span><span><i class="legend-swatch legend-mid"></i>Media</span><span><i class="legend-swatch legend-covered"></i>Mayor población</span><span><i class="legend-swatch legend-unknown"></i>Sin dato aplicable</span>';
  }
 }

 async function contextMap(parent,token){
  const wrap=$('#context-map-wrap'),svg=$('#context-map');
  if(!parent){wrap.hidden=true;svg.replaceChildren();return;}
  try{
    const geo=await getGeometry('departamentos.geojson');if(token!==generation)return;
    svg.setAttribute('viewBox',geometryBounds(geo.features));
    svg.innerHTML=geo.features.map(f=>`<path d="${geometryPath(f.geometry)}" class="${f.properties.territorio_id===parent?'context-selected':''}"></path>`).join('');
    wrap.hidden=false;
  }catch{wrap.hidden=true;}
 }

 async function map(token){
  const t=find(state.territory),parent=t?.type==='municipality'?t.parent_id:t?.official_code;
  const nextDepth=parent?'department':'national',wrap=$('.map-wrap'),mapEl=$('#map');
  $('#map-status').textContent='Cargando cartografía…';mapEl.setAttribute('aria-busy','true');hidePreview();
  // No dejar geometrías o eventos del territorio anterior durante una carga.
  mapEl.replaceChildren();$('#context-map').replaceChildren();$('#context-map-wrap').hidden=true;
  wrap.dataset.depth=nextDepth;
  try{
   const geo=await getGeometry(parent?'municipios-'+parent+'.geojson':'departamentos.geojson');if(token!==generation)return;
   const features=geo.features.filter(f=>find(f.properties.territorio_id));
   mapEl.setAttribute('viewBox',geometryBounds(features));
   mapEl.innerHTML='<defs><pattern id="unknown" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(.005)"><rect width="8" height="8" fill="#EDF0F2"/><path d="M0 8L8 0" stroke="#9AABB4"/></pattern></defs>'+features.map(f=>{const code=f.properties.territorio_id,m=model(code);return `<path tabindex="0" role="button" aria-pressed="${code===state.territory}" aria-label="${esc(m.territory.name+' · '+labels[m.status])}" data-code="${esc(code)}" fill="${color(m)}" fill-rule="evenodd" d="${geometryPath(f.geometry)}"><title>${esc(m.territory.name)}</title></path>`;}).join('');
   mapEl.classList.remove('map-enter');void mapEl.getBoundingClientRect();mapEl.classList.add('map-enter');
   wrap.dataset.depth=nextDepth;
   await contextMap(parent,token);
   if(token!==generation)return;

   const paths=[...mapEl.querySelectorAll('[data-code]')];paths.forEach((el,i)=>{
    el.onpointerenter=e=>{if(e.pointerType==='mouse')showPreview(el.dataset.code,el);};el.onpointerleave=hidePreview;el.onfocus=()=>showPreview(el.dataset.code,el);el.onblur=hidePreview;el.onclick=()=>select(el.dataset.code);
    el.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select(el.dataset.code);$('#detail h2').setAttribute('tabindex','-1');$('#detail h2').focus();}else if(e.key==='Escape'){e.preventDefault();select(t?.type==='municipality'?parent:'');$('#home').focus();}else if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?paths.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+paths.length)%paths.length;paths[index].focus();}};
   });
   $('#map-status').textContent=parent?'Nivel municipal':'Nivel departamental';
  }catch{if(token===generation){mapEl.replaceChildren();$('#context-map').replaceChildren();$('#context-map-wrap').hidden=true;$('#map-status').innerHTML='No se pudo cargar la cartografía. La tabla sigue disponible. <button id="retry-map">Reintentar mapa</button>';$('#retry-map').onclick=()=>trackLayout(map(++generation));}}
  finally{if(token===generation)mapEl.setAttribute('aria-busy','false');}
 }
 // Keep the address clean: defaults (latest period, default layer) are not written.
 function visibleState(){
  const shown={...state},latest=latestSnapshot(data.snapshots);
  if(latest&&shown.snapshot===latest.snapshot_id){shown.snapshot='';shown.year='';}
  if(shown.layer==='status')shown.layer='';
  return shown;
 }
 function update(push=false){
  state=sanitizeState(data,state,content);writeHistory(stateUrl(visibleState(),location.href),push);fill();breadcrumbs();atlasMeta();detail();table();legend();
  window.dispatchEvent(new CustomEvent('ugd:state'));
  const s=snapshot(),source=s?data.sources.find(x=>x.source_id===s.source_id):null;
  $('#status').textContent=s?`${period()}${source?' · Fuente: '+source.title:''} · ${snapshotNotice(s)}`:`${state.year} · Sin datos publicados para el año seleccionado.`;
  const rows=exportRows(data,state);$('#csv').disabled=$('#json').disabled=!rows.length;return trackLayout(map(++generation));
 }
 for(const key of ['year','snapshot','care','gestor','layer'])$('#'+key).onchange=e=>{state[key]=e.target.value;if(key==='year'){state.snapshot='';state.care='';}update(true);};
 $('#search').oninput=search;$('#search').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();$('#results button')?.focus();}};$('#home').onclick=()=>select('');
 $('#share').onclick=async()=>{try{await navigator.clipboard.writeText(stateUrl(visibleState(),location.href).href);$('#status').textContent='Enlace copiado · '+period();}catch{$('#status').textContent='Copie la dirección del navegador para compartir esta consulta.';}};
 for(const kind of ['csv','json'])$('#'+kind).onclick=()=>{
  const rows=exportRows(data,state);if(!rows.length)return;
  const approved=siteArchive(data);
  // Convenios fuera de alcance (PRODUCT.md): siteArchive vacía sus valores y la
  // descarga, que no está sujeta al contrato del archivo, omite además las claves.
  const snap=approved.snapshots.find(s=>s.snapshot_id===state.snapshot),indicators=Object.fromEntries(Object.entries(snap?.indicators||{}).filter(([k])=>!k.startsWith('agreements')));
  const payload={state,period:snap&&{...snap,indicators},sources:approved.sources,data_quality_issues:approved.data_quality_issues,rows};
  const blob=new Blob([kind==='csv'?csv(rows):JSON.stringify(payload,null,2)],{type:kind==='csv'?'text/csv;charset=utf-8':'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download=`ugd-${state.snapshot}-${state.territory||'HN'}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const reread=()=>{state=sanitizeState(data,readState(location.search),content);update();};
 window.onpopstate=reread;
 // Enlaces internos (fichas, «ver en el mapa») cambian la dirección sin recargar.
 window.addEventListener('ugd:navigate',()=>{reread();syncSheet();});
 window.addEventListener('popstate',syncSheet);
 $('#detail').addEventListener('click',e=>{if($('#detail').classList.contains('collapsed')&&!e.target.closest('#close-detail')){$('#detail').classList.remove('collapsed');}});
 $('#sources').innerHTML=data.sources.map(s=>`<p><a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · consultada el ${esc(day(s.retrieved_at))}${s.valid_on?' · límites territoriales vigentes al '+esc(day(s.valid_on)):''}${s.license?' · '+esc(s.license):''}</p>`).join('');
 $('#issuecount').textContent=data.data_quality_issues.length+' observaciones sobre los datos';$('#issues').innerHTML=data.data_quality_issues.map(i=>`<li><strong>${esc(i.issue_id)}</strong> · ${esc(i.status)} · ${esc(i.detail)}</li>`).join('');
 $('#explorer').hidden=false;await update();syncSheet();
}

