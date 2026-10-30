import {localUrl} from '../config.js';
import {labels,normalize,options,sanitizeState,readState,stateUrl,territoryModel,visibleTerritories,exportRows,csv} from './model.js';
import {geometryPath,geometryBounds} from './geometry.js';
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
  $('#snapshot').innerHTML=snapshots.length?snapshots.map(s=>`<option value="${esc(s.snapshot_id)}">${esc(s.snapshot_id)} · ${esc(s.status)}</option>`).join(''):'<option value="">Sin datos</option>';
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
  return {covered:'#006571',not_covered:'#dce6eb',pending:'url(#pending)'}[m.status];
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
 function detail(){
  const t=find(state.territory);$('#detail').classList.toggle('selected',!!t);$('#detail').classList.toggle('expanded',expanded);
  if(!t){$('#detail').innerHTML='<h2>Honduras</h2><p>Seleccione un departamento en el mapa o en la tabla para explorar sus municipios.</p>';return;}
  const m=model(t.official_code),issues=data.data_quality_issues.filter(i=>!i.territory_id||i.territory_id===t.official_code||find(i.territory_id)?.parent_id===t.official_code);
  const sources=m.source_ids.map(id=>data.sources.find(s=>s.source_id===id)).filter(Boolean);
  const agreements=data.agreements.filter(a=>a.snapshot_id===state.snapshot&&m.rows.some(r=>r.agreement_ids.includes(a.agreement_id)));
  const explicit=m.rows.filter(r=>r.coverage_status!=='unknown');
  $('#detail').innerHTML=`<div class="panel-heading"><h2>${esc(t.name)}</h2><button id="close-detail" aria-label="Cerrar selección">Cerrar</button></div><p>${esc(labels[m.status])} · ${esc(period())}</p><button id="expand" aria-expanded="${expanded}">${expanded?'Reducir ficha':'Ampliar ficha'}</button><div class="panel-content"><dl><dt>Código</dt><dd>${esc(t.official_code)}</dd><dt>Municipios reportados</dt><dd>${m.aggregate?`${fmt(m.covered)} / ${fmt(m.total)} · ${(m.proportion*100).toFixed(1)}% de municipios`:'Sin agregado aplicable a estos filtros'}</dd><dt>Población publicada</dt><dd>${fmt(m.population)}</dd><dt>Alcance y fuente por registro</dt><dd>${explicit.length?(t.type==='department'?fmt(explicit.length)+' registros municipales explícitos. ':'')+(t.type==='department'?explicit.filter(r=>r.scope_note):explicit).map(r=>`${esc(find(r.territory_id)?.name)} · ${esc(r.care_level)} · ${esc(r.scope_note||'Reportado; no acredita cobertura poblacional completa')} · página ${esc(r.source_page)} · ${esc(r.verification_status)}`).join('<br>'):'Sin registro municipal explícito'}</dd><dt>Gestor / convenio confirmado</dt><dd>${agreements.length?'Ver relaciones abajo':'Sin padrón contractual confirmado'}</dd><dt>Corte exacto</dt><dd>${esc(snapshot()?.cutoff_date||snapshot()?.cutoff_note||'Sin dato')}</dd><dt>Fuente</dt><dd>${sources.map(s=>`<a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('<br>')||'Sin registro disponible'}</dd></dl><p>${issues.length} observaciones aplicables; consultar Fuentes y calidad.</p>${t.type==='department'?'<h3>Municipios</h3><div class="municipality-links">'+data.territories.filter(x=>x.parent_id===t.official_code).map(x=>`<button data-territory="${esc(x.official_code)}">${esc(x.name)}</button>`).join('')+'</div>':''}${agreements.map(a=>`<h3>${esc(a.agreement_id)}</h3>`+m.rows.filter(r=>r.agreement_ids.includes(a.agreement_id)).map(r=>`<button data-territory="${esc(r.territory_id)}">${esc(find(r.territory_id)?.name)}</button>`).join('')).join('')}</div>`;
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
  $('#legend').textContent=state.layer==='status'?Object.values(labels).join(' · ')+' · Turquesa: cobertura; gris: ausencia explícita; rayado gris: sin dato; rayado ámbar: pendiente.':state.layer==='proportion'?'Proporción de municipios reportados en tabla departamental: 0%, 1–24%, 25–59%, 60–100%. No representa población. Rayado: sin agregado aplicable.':'Población municipal publicada: intensidad relativa al máximo visible (tercios). Rayado: sin dato municipal comparable. No se suman niveles o convenios.';
 }
 async function map(token){
  const t=find(state.territory),parent=t?.type==='municipality'?t.parent_id:t?.official_code;
  $('#map-status').textContent='Cargando cartografía…';$('#map').setAttribute('aria-busy','true');$('#map').replaceChildren();hidePreview();
  try{
   const geo=await getGeometry(parent?'municipios-'+parent+'.geojson':'departamentos.geojson');if(token!==generation)return;
   const features=geo.features.filter(f=>find(f.properties.territorio_id));$('#map').setAttribute('viewBox',geometryBounds(features));
   $('#map').innerHTML='<defs><pattern id="unknown" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(.005)"><rect width="8" height="8" fill="#edf0f2"/><path d="M0 8L8 0" stroke="#9aabb4"/></pattern><pattern id="pending" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(.005)"><rect width="8" height="8" fill="#fff0c7"/><path d="M0 8L8 0" stroke="#b98a27"/></pattern></defs>'+features.map(f=>{const code=f.properties.territorio_id,m=model(code);return `<path tabindex="0" role="button" aria-pressed="${code===state.territory}" aria-label="${esc(m.territory.name+' · '+labels[m.status])}" data-code="${esc(code)}" fill="${color(m)}" fill-rule="evenodd" d="${geometryPath(f.geometry)}"><title>${esc(m.territory.name)}</title></path>`;}).join('');
   const paths=[...$('#map').querySelectorAll('[data-code]')];paths.forEach((el,i)=>{
    el.onpointerenter=e=>{if(e.pointerType==='mouse')showPreview(el.dataset.code,el);};el.onpointerleave=hidePreview;el.onfocus=()=>showPreview(el.dataset.code,el);el.onblur=hidePreview;el.onclick=()=>select(el.dataset.code);
    el.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select(el.dataset.code);$('#detail h2').setAttribute('tabindex','-1');$('#detail h2').focus();}else if(e.key==='Escape'){e.preventDefault();select(t?.type==='municipality'?parent:'');$('#home').focus();}else if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?paths.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+paths.length)%paths.length;paths[index].focus();}};
   });$('#map-status').textContent=parent?'Seleccione un municipio para abrir su ficha.':'Pase el cursor o seleccione un departamento.';
  }catch{if(token===generation){$('#map-status').innerHTML='No se pudo cargar la cartografía. La tabla sigue disponible. <button id="retry-map">Reintentar mapa</button>';$('#retry-map').onclick=()=>map(++generation);}}
  finally{if(token===generation)$('#map').setAttribute('aria-busy','false');}
 }
 function update(push=false){
  state=sanitizeState(data,state);history[push?'pushState':'replaceState']({},'',stateUrl(state,location.href));fill();breadcrumbs();detail();table();legend();
  const s=snapshot();$('#status').textContent=s?`${s.year} · archivo histórico ${s.status} · ${period()} · validación: ${s.verification_status}. No acredita situación actual. ${s.cutoff_note||''}`:`${state.year} · Sin datos publicados para el año solicitado.`;
  const rows=exportRows(data,state);$('#csv').disabled=$('#json').disabled=!rows.length;map(++generation);
 }
 for(const key of ['year','snapshot','care','manager','agreement','layer'])$('#'+key).onchange=e=>{state[key]=e.target.value;if(key==='year'){state.snapshot='';for(const k of ['care','manager','agreement'])state[k]='';}update(true);};
 $('#search').oninput=search;$('#search').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();$('#results button')?.focus();}};$('#home').onclick=()=>select('');
 $('#share').onclick=async()=>{try{await navigator.clipboard.writeText(stateUrl(state,location.href).href);$('#status').textContent='Enlace copiado · '+period();}catch{$('#status').textContent='Copie la dirección del navegador para compartir esta consulta.';}};
 for(const kind of ['csv','json'])$('#'+kind).onclick=()=>{
  const rows=exportRows(data,state);if(!rows.length)return;
  const payload={state,period:snapshot(),sources:data.sources,data_quality_issues:data.data_quality_issues,rows};
  const blob=new Blob([kind==='csv'?csv(rows):JSON.stringify(payload,null,2)],{type:kind==='csv'?'text/csv;charset=utf-8':'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download=`ugd-${state.snapshot}-${state.territory||'HN'}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 window.onpopstate=()=>{state=sanitizeState(data,readState(location.search));update();};
 $('#sources').innerHTML=data.sources.map(s=>`<p><a href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · consulta ${esc(s.retrieved_at)}${s.valid_on?' · Geografía histórica válida al '+esc(s.valid_on):''}${s.license?' · '+esc(s.license):''}</p>`).join('');
 $('#issuecount').textContent=data.data_quality_issues.length+' observaciones registradas';$('#issues').innerHTML=data.data_quality_issues.map(i=>`<li><strong>${esc(i.issue_id)}</strong> · ${esc(i.status)} · ${esc(i.detail)}</li>`).join('');
 $('#explorer').hidden=false;update();
}

