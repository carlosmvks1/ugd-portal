import {metrics,series,comparison,comparable,qualityAlerts} from './model.js';
import {latestSnapshot,snapshotNotice} from '../map/snapshots.js';
import {snapshotSchema,publicFields} from '../map/contract.js';
import {csv} from '../map/model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n===null||n===undefined?'Sin dato':new Intl.NumberFormat('es-HN',{maximumFractionDigits:2}).format(n);
export function renderObservatory(data){
 const root=document.querySelector('#observatory'),last=latestSnapshot(data.snapshots);if(!last){root.textContent='No hay períodos disponibles para el observatorio.';return;}
 const previous=latestSnapshot(data.snapshots.filter(s=>s.year<last.year));
 const params=new URLSearchParams(location.search),valid=id=>data.snapshots.some(s=>s.snapshot_id===id);
 const readFrom=p=>p.has('obs_from')&&p.get('obs_from')===''?'':valid(p.get('obs_from'))?p.get('obs_from'):previous?.snapshot_id??'';
 let from=readFrom(params),to=valid(params.get('obs_to'))?params.get('obs_to'):last.snapshot_id;
 const options=data.snapshots.slice().sort((a,b)=>a.year-b.year||a.snapshot_id.localeCompare(b.snapshot_id,'en',{numeric:true})).map(s=>`<option value="${esc(s.snapshot_id)}">${esc(s.year)} · ${esc(s.snapshot_id)}</option>`).join('');
 root.innerHTML=`<div class="section-heading"><div><p class="eyebrow">Observatorio institucional</p><h2>Indicadores con período y evidencia</h2></div><p>Cifras nacionales transcritas de las fuentes. Una diferencia entre registros no acredita una tendencia sin metodología comparable.</p></div>
 <div class="observatory-filters"><label>Indicador<select id="obs-metric">${metrics.map(m=>`<option value="${m.key}">${esc(m.label)}</option>`).join('')}</select></label><label>Período anterior<select id="obs-from"><option value="">Sin período anterior</option>${options}</select></label><label>Período posterior<select id="obs-to">${options}</select></label></div>
 <p id="obs-status" role="status"></p><p id="obs-definition"></p><div id="obs-chart" class="obs-chart" aria-label="Valores publicados por año"></div>
 <div class="table-wrap"><table id="obs-table"><caption>Comparación de valores publicados</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Anterior</th><th scope="col">Posterior</th><th scope="col">Variación absoluta</th><th scope="col">Variación %</th><th scope="col">Interpretación</th></tr></thead><tbody></tbody></table></div>
 <div id="obs-provenance" class="obs-provenance"></div><div class="actions"><button id="obs-csv">Descargar comparación CSV</button><button id="obs-json">Descargar comparación JSON</button><button id="obs-share">Copiar consulta</button></div><p id="obs-feedback" role="status"></p>
 <details class="obs-method"><summary>Metodología y límites de interpretación</summary><p>La serie utiliza una versión por año, elegida con la misma política del atlas. Las revisiones del mismo año no representan evolución temporal. La comparación requiere períodos anuales completos, aprobados y verificados, y metadatos compatibles de metodología, geografía y periodicidad.</p><p>Los valores ausentes permanecen como “Sin dato”. Un cero explícito se conserva; su variación porcentual no se calcula. Municipios según texto y según tabla son indicadores distintos. La población se toma del total nacional publicado y no se suma desde registros superpuestos.</p></details>
 <section aria-labelledby="obs-quality-title"><h3 id="obs-quality-title">Calidad y actualización del archivo</h3><p>Observaciones sobre el último período registrado (${esc(last.year)}). No existe una frecuencia de actualización institucional declarada que permita calcular retrasos.</p><div class="obs-alerts">${qualityAlerts(data).map(a=>`<article><h4>${esc(a.title)}</h4><p>${esc(a.detail)}</p></article>`).join('')||'<p>No se detectaron observaciones en estas comprobaciones. Esto no certifica la integridad del archivo.</p>'}</div><a href="#calidad">Consultar el registro de fuentes y observaciones</a></section>`;
 const $=id=>root.querySelector('#'+id);
 $('obs-from').value=from;$('obs-to').value=to;$('obs-metric').value=metrics.some(m=>m.key===params.get('obs_metric'))?params.get('obs_metric'):metrics[0].key;
 const link=source=>{if(!source)return '';let href='';try{const u=new URL(source.url);if(['http:','https:'].includes(u.protocol))href=u.href;}catch{}return href?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`:esc(source.title);};
 function update(write=false){
  const a=data.snapshots.find(s=>s.snapshot_id===from),b=data.snapshots.find(s=>s.snapshot_id===to),rows=comparison(data,from,to),metric=metrics.find(m=>m.key===$('obs-metric').value);
  const reason=comparable(a,b);$('obs-status').textContent=reason||'Períodos comparables según los metadatos registrados. Revise las fuentes y los límites de cada indicador.';
  $('obs-definition').textContent=metric.definition+' Los valores por año se muestran como referencia; las barras no certifican comparabilidad.';
  const values=series(data,metric.key),max=Math.max(1,...values.map(r=>r.value??0));
  $('obs-chart').innerHTML=values.map(r=>`<div class="obs-bar"><span>${r.year} · ${esc(r.snapshot_id)}</span>${r.value===null?'<span>Sin dato</span>':`<meter min="0" max="${max}" value="${r.value}" aria-label="${esc(metric.label)} ${r.year}: ${r.value}">${r.value}</meter><strong>${fmt(r.value)}</strong>`}</div>`).join('');
  $('obs-table tbody').innerHTML=rows.map(r=>`<tr><th scope="row">${esc(r.label)}</th><td>${fmt(r.from_value)}</td><td>${fmt(r.to_value)}</td><td>${r.comparable?fmt(r.absolute):'No calculable'}</td><td>${r.percent===null?'No calculable':fmt(r.percent)+'%'}</td><td>${esc(r.reason||'Comparación descriptiva; no acredita causalidad.')}</td></tr>`).join('');
  $('obs-provenance').innerHTML=[a,b].filter(Boolean).map(s=>`<article><h3>${esc(s.year)} · ${esc(s.snapshot_id)}</h3><p>${esc(snapshotNotice(s))}</p><p>${esc(s.period_start)} a ${esc(s.period_end)}</p><p>Publicación: ${esc(s.published_at||'Sin registrar')} · Corte exacto: ${esc(s.cutoff_date||'Sin registrar')}</p>${link(data.sources.find(source=>source.source_id===s.source_id))}${s.comparison?`<p>Metodología: ${esc(s.comparison.methodology_id)} · Geografía: ${esc(s.comparison.geography_version)}</p>${link(data.sources.find(source=>source.source_id===s.comparison.source_id))}`:''}</article>`).join('');
  if(write){const u=new URL(location.href);u.searchParams.set('obs_from',from);u.searchParams.set('obs_to',to);u.searchParams.set('obs_metric',$('obs-metric').value);history.replaceState(history.state,'',u);}
 }
 for(const [id,key] of [['obs-from','from'],['obs-to','to']])$(id).onchange=e=>{if(key==='from')from=e.target.value;else to=e.target.value;update(true);};
 $('obs-metric').onchange=()=>update(true);
 for(const kind of ['csv','json'])$('obs-'+kind).onclick=()=>{
  const rows=comparison(data,from,to),payload={generated_at:new Date().toISOString(),selected_metric:$('obs-metric').value,scope:'Indicadores nacionales publicados. No sustituye las fuentes originales.',periods:[...new Set([from,to])].filter(Boolean).map(id=>publicFields(data.snapshots.find(s=>s.snapshot_id===id),snapshotSchema)),definitions:metrics,rows};
  const blob=new Blob([kind==='csv'?csv(rows):JSON.stringify(payload,null,2)],{type:kind==='csv'?'text/csv;charset=utf-8':'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ugd-observatorio-${from||'sin-base'}-${to}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 $('obs-share').onclick=async()=>{update(true);try{const u=new URL(location.href);u.hash='observatorio';await navigator.clipboard.writeText(u.href);$('obs-feedback').textContent='Consulta copiada.';}catch{$('obs-feedback').textContent='Copie la dirección del navegador para compartir los períodos seleccionados.';}};
 window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);from=readFrom(p);to=valid(p.get('obs_to'))?p.get('obs_to'):last.snapshot_id;$('obs-from').value=from;$('obs-to').value=to;$('obs-metric').value=metrics.some(m=>m.key===p.get('obs_metric'))?p.get('obs_metric'):metrics[0].key;update();});
 update();
}
