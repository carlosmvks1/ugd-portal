import {localUrl} from '../config.js';
import {labels,normalize,options,sanitizeState,readState,stateUrl,territoryModel,visibleTerritories,exportRows,csv} from './model.js';
import {geometryPath,geometryBounds} from './geometry.js';
import {snapshotNotice,verificationLabels} from './snapshots.js';
import {publicArchive} from './contract.js';
import {trackLayout,writeHistory} from '../navigation.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'Sin dato':new Intl.NumberFormat('es-HN').format(n);
const safeLink=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?esc(u.href):'';}catch{return '';}};
export async function startExplorer(data,config,load){
 let state=sanitizeState(data,readState(location.search)),generation=0,expanded=false;
 const cache=new Map();
 const getGeometry=path=>{if(!cache.has(path))cache.set(path,load(localUrl(path,config.geographyRoot)).catch(e=>{cache.delete(path);throw e;}));return cache.get(path);};
 const find=code=>data.territories.find(t=>t.official_code===code);
 const snapshot=()=>data.snapshots.find(s=>s.snapshot_id===state.snapshot);
 const period=()=>snapshot()?`${snapshot().period_start} a ${snapshot().period_end}`:`${state.year||'Sin período'} · sin datos`;
 const model=code=>territoryModel(data,state,find(code));
 function summary(m){return `<strong>${esc(m.territory.name)}</strong><br>${esc(labels[m.status])}<br>${m.aggregate?`${fmt(m.covered)} / ${fmt(m.total)} municipios reportados · ${(m.proportion*100).toFixed(1)}%`:'Registro municipal: '+(m.rows.some(r=>r.coverage_status==='reported')?'reportado':'sin dato explícito')}<br>Población publicada: ${fmt(m.population)}<br><small>${esc(period())}</small>`;}
 function fill(){
  const years=[...new Set(data.snapshots.map(s=>String(s.year)))];if(state.year&&!years.includes(state.year))years.push(state.year);
  $('#year').innerHTML=years.map(y=>`<option value="${esc(y)}">${esc(y)}${data.snapshots.some(s=>String(s.year)===y)?'':' · sin datos'}</option>`).join('');$('#year').value=state.year;
  const snapshots=data.snapshots.filter(s=>String(s.year)===state.year);
  $('#snapshot').innerHTML=snapshots.length?snapshots.map(s=>`<option value="${esc(s.snapshot_id)}">${esc(s.snapshot_id)}</option>`).join(''):'<option value="">Sin datos</option>';
  $('#snapshot').value=state.snapshot;$('#snapshot').disabled=snapshots.length<2;
  const available=options(data,state.snapshot);
  for(const key of ['care','manager','agreement']){const el=$('#'+key);el.innerHTML=`<option value="">${available[key].length?'Todos':'Sin datos disponibles'}</option>`+available[key].map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');el.value=state[key];el.disabled=!available[key].length;}
  $('#layer').value=state.layer;
 }
 function color(m){
  if(m.status==='unknown')return 'url(#unknown)';
  if(state.layer==='proportion')return m.proportion==null?'url(#unknown)':m.proportion===0?'#dce6eb':m.proportion<.25?'#a4d4d8':m.proportion<.6?'#419ea8':'#006571';
  if(state.layer==='population'){
   if(m.population==null)return 'url(#unknown)';
   const max=Math.max(1,...visibleTerritories(data,state).map(t=>territoryModel(data,state,t).population??0));
   return m.population/max<.33?'#a4d4d8':m.population/max<.66?'#419ea8':'#006571';
  }
  return {covered:'#006571',not_covered:'#dce6eb'}[m.status];
 }
 function showPreview(code,el){
  const tip=$('#tooltip');tip.innerHTML=summary(model(code));tip.hidden=false;
  const rect=el.getBoundingClientRect(),box=$('.map-wrap').getBoundingClientRect();
  tip.style.left=Math.max(8,Math.min(rect.x-box.x+rect.width/2,box.width-tip.offsetWidth-8))+'px';
  tip.style.top=Math.max(8,Math.min(rect.y-box.y,box.height-tip.offsetHeight-8))+'px';el.setAttribute('aria-describedby','tooltip');
 }
 function hidePreview(){$('#tooltip').hidden=true;$('#map').querySelectorAll('[aria-describedby]').forEach(el=>el.removeAttribute('aria-describedby'));}
 function bindSelection(root){root.querySelectorAll('[data-territory]').forEach(el=>el.onclick=e=>{select(el.dataset.territory);if(e.detail===0){const heading=$('#detail h2');heading?.setAttribute('tabindex','-1');heading?.focus();}});}
 function select(code){expanded=false;state.territory=code;update(true);}
 function atlasMeta(){
  const selected=find(state.territory),department=selected?.type==='municipality'?find(selected.parent_id):selected;
  const m=selected?model(selected.official_code):null,s=snapshot(),source=s?data.sources.find(x=>x.source_id===s.source_id):null;
  $('#atlas-title').textContent=selected?(selected.type==='municipality'?selected.name+' · '+(department?.name||''):selected.name):'Honduras';
  if(selected?.type==='department'&&m?.aggregate){
    $('#atlas-subtitle').textContent=fmt(m.covered)+' de '+fmt(m.total)+' municipios reportados · '+(m.proportion*100).toFixed(1)+'%';
  }else if(selected?.type==='municipality'){
    $('#atlas-subtitle').textContent=labels[m.status]+(m.population!=null?' · '+fmt(m.population)+' habitantes publicados':'');
  }else{
    $('#atlas-subtitle').textContent=data.territories.filter(t=>t.type==='department').length+' departamentos · '+period();
  }
  $('#atlas-source').textContent=source?(source.title+' · '+s.year):period();
 }

 function detail(){
  const t=find(state.territory);$('#detail').classList.toggle('selected',!!t);$('#detail').classList.toggle('expanded',expanded);
  if(!t){$('#detail').innerHTML='<div class="detail-empty"><span aria-hidden="true">HN</span><p class="detail-kicker">Atlas territorial</p><h2>Explore el territorio</h2><p>Seleccione un departamento para consultar cobertura, población y fuentes.</p></div>';return;}
  const m=model(t.official_code);
  const sources=m.source_ids.map(id=>data.sources.find(s=>s.source_id===id)).filter(Boolean);
  const agreements=data.agreements.filter(a=>a.snapshot_id===state.snapshot&&m.rows.some(r=>r.agreement_ids.includes(a.agreement_id)));
  const explicit=m.rows.filter(r=>r.coverage_status!=='unknown');
  const coverageText=m.aggregate?fmt(m.covered)+' / '+fmt(m.total):'—';
  const coveragePercent=m.aggregate&&m.proportion!=null?(m.proportion*100).toFixed(1)+'%':'—';
  const populationText=fmt(m.population);
  const pages=[...new Set(explicit.map(r=>r.source_page).filter(Boolean))];
  const recordDetail=t.type==='department'
    ?(explicit.length?fmt(explicit.length)+' registros municipales en la fuente.':'Sin registros municipales para este período.')
    :(explicit.length?explicit.map(r=>esc(r.care_level)+' · '+esc(r.scope_note||'Reportado en fuente')).join('<br>'):'Sin registro municipal para este período.');
  const progress=m.aggregate&&m.proportion!=null?Math.max(0,Math.min(100,m.proportion*100)):null;
  $('#detail').innerHTML=`<div class="territory-sheet-head">
    <div>
      <p class="detail-kicker">${esc(t.type==='department'?'Departamento':'Municipio')}</p>
      <h2>${esc(t.name)}</h2>
    </div>
    <div class="territory-code"><span>Código</span><strong>${esc(t.official_code)}</strong></div>
    <button id="close-detail" aria-label="Cerrar selección">Cerrar</button>
  </div>
  <p class="detail-status"><span class="detail-status-dot status-${esc(m.status)}" aria-hidden="true"></span>${esc(labels[m.status])}</p>
  <p class="detail-verification">${esc(snapshotNotice(snapshot()))}${explicit.length?' · Registros: '+[...new Set(explicit.map(r=>verificationLabels[r.verification_status]||'Verificación no disponible'))].map(esc).join(', '):''}</p>
  <div class="detail-metrics">
    <div><span>Municipios</span><strong>${coverageText}</strong><small>${m.aggregate?'reportados / total':'No aplica'}</small></div>
    <div><span>Proporción</span><strong>${coveragePercent}</strong><small>${m.aggregate?'cobertura municipal':'No aplica'}</small></div>
    <div><span>Población</span><strong>${populationText}</strong><small>publicada</small></div>
  </div>
  ${progress==null?'':`<div class="coverage-progress" aria-label="Proporción municipal ${progress.toFixed(1)}%"><span style="width:${progress.toFixed(1)}%"></span></div>`}
  <button id="expand" aria-expanded="${expanded}">${expanded?'Reducir ficha':'Ver ficha completa'}</button>
  <div class="panel-content">
    <div class="provenance-rail" aria-label="Procedencia del dato">
      <div><span>Período</span><strong>${esc(period())}</strong></div>
      <div><span>Fuente</span><strong>${sources.length?sources.map(s=>`<a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('<br>'):'Sin registro disponible'}</strong></div>
      ${pages.length?'<div><span>Página</span><strong>'+pages.map(esc).join(', ')+'</strong></div>':''}
    </div>
    <div class="detail-section"><h3>Alcance</h3><p>${recordDetail}</p></div>
    ${agreements.length?'<div class="detail-section"><h3>Convenios</h3><p>Convenios asociados a este territorio.</p></div>':''}
    ${t.type==='department'?'<div class="detail-section"><h3>Municipios</h3><div class="municipality-links">'+data.territories.filter(x=>x.parent_id===t.official_code).map(x=>`<button data-territory="${esc(x.official_code)}">${esc(x.name)}</button>`).join('')+'</div></div>':''}
    ${agreements.map(a=>`<div class="detail-section"><h3>${esc(a.agreement_id)}</h3>`+m.rows.filter(r=>r.agreement_ids.includes(a.agreement_id)).map(r=>`<button data-territory="${esc(r.territory_id)}">${esc(find(r.territory_id)?.name)}</button>`).join('')+'</div>').join('')}
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
  const territories=visibleTerritories(data,state);$('#caption').textContent=period()+' · '+territories.length+' territorios · '+$('#layer').selectedOptions[0].textContent;
  $('#table tbody').innerHTML=territories.map(t=>{const m=model(t.official_code);return `<tr ${state.territory===t.official_code?'aria-selected="true"':''}><th scope="row"><button data-territory="${esc(t.official_code)}">${esc(t.name)} · ${esc(t.official_code)}</button></th><td>${esc(labels[m.status])}</td><td>${m.aggregate?`${fmt(m.covered)} / ${fmt(m.total)}`:'Sin agregado aplicable'}</td><td>${fmt(m.population)}</td><td>${esc(m.source_ids.join(', ')||'Sin registro')} · ${esc(period())}</td></tr>`;}).join('');bindSelection($('#table'));
 }
 function breadcrumbs(){
  const t=find(state.territory),d=t?.type==='municipality'?find(t.parent_id):t;
  $('#breadcrumbs').innerHTML=`<button data-territory="">Honduras</button>${d?` › <button data-territory="${esc(d.official_code)}" ${t===d?'aria-current="location"':''}>${esc(d.name)}</button>`:''}${t?.type==='municipality'?` › <span aria-current="location">${esc(t.name)}</span>`:''}`;bindSelection($('#breadcrumbs'));
 }
 function legend(){
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
   mapEl.innerHTML='<defs><pattern id="unknown" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(.005)"><rect width="8" height="8" fill="#edf0f2"/><path d="M0 8L8 0" stroke="#9aabb4"/></pattern></defs>'+features.map(f=>{const code=f.properties.territorio_id,m=model(code);return `<path tabindex="0" role="button" aria-pressed="${code===state.territory}" aria-label="${esc(m.territory.name+' · '+labels[m.status])}" data-code="${esc(code)}" fill="${color(m)}" fill-rule="evenodd" d="${geometryPath(f.geometry)}"><title>${esc(m.territory.name)}</title></path>`;}).join('');
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
 function update(push=false){
  state=sanitizeState(data,state);writeHistory(stateUrl(state,location.href),push);fill();breadcrumbs();atlasMeta();detail();table();legend();
  const s=snapshot(),source=s?data.sources.find(x=>x.source_id===s.source_id):null;
  $('#status').textContent=s?`Datos ${s.year} · ${period()}${source?' · '+source.title:''} · ${snapshotNotice(s)}`:`${state.year} · Sin datos publicados para el año seleccionado.`;
  const rows=exportRows(data,state);$('#csv').disabled=$('#json').disabled=!rows.length;return trackLayout(map(++generation));
 }
 for(const key of ['year','snapshot','care','manager','agreement','layer'])$('#'+key).onchange=e=>{state[key]=e.target.value;if(key==='year'){state.snapshot='';for(const k of ['care','manager','agreement'])state[k]='';}update(true);};
 $('#search').oninput=search;$('#search').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();$('#results button')?.focus();}};$('#home').onclick=()=>select('');
 $('#share').onclick=async()=>{try{await navigator.clipboard.writeText(stateUrl(state,location.href).href);$('#status').textContent='Enlace copiado · '+period();}catch{$('#status').textContent='Copie la dirección del navegador para compartir esta consulta.';}};
 for(const kind of ['csv','json'])$('#'+kind).onclick=()=>{
  const rows=exportRows(data,state);if(!rows.length)return;
  const approved=publicArchive(data);
  const payload={state,period:approved.snapshots.find(s=>s.snapshot_id===state.snapshot),sources:approved.sources,data_quality_issues:approved.data_quality_issues,rows};
  const blob=new Blob([kind==='csv'?csv(rows):JSON.stringify(payload,null,2)],{type:kind==='csv'?'text/csv;charset=utf-8':'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download=`ugd-${state.snapshot}-${state.territory||'HN'}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 window.onpopstate=()=>{state=sanitizeState(data,readState(location.search));update();};
 $('#sources').innerHTML=data.sources.map(s=>`<p><a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · consulta ${esc(s.retrieved_at)}${s.valid_on?' · Geografía histórica válida al '+esc(s.valid_on):''}${s.license?' · '+esc(s.license):''}</p>`).join('');
 $('#issuecount').textContent=data.data_quality_issues.length+' observaciones registradas';$('#issues').innerHTML=data.data_quality_issues.map(i=>`<li><strong>${esc(i.issue_id)}</strong> · ${esc(i.status)} · ${esc(i.detail)}</li>`).join('');
 $('#explorer').hidden=false;await update();
}

