// Inversión por nivel de gestión y por nivel de atención. Cada conjunto
// conserva período, moneda, tipo de monto, definición y fuente. No se suman
// categorías, no se comparan períodos y no se reparten montos entre territorios.
import {esc,money,periodLabel,sourceLine,verification,editorialNote} from './format.js';
import {categoryLabel,datasetState,investmentFor} from './model.js';

const dimensions={management_level:{title:'Por nivel de gestión',group:'management_levels'},care_level:{title:'Por nivel de atención',group:'care_levels'}};
const stateNote={partial:'Datos parciales: algunas categorías no tienen monto reportado. «Sin dato» no equivale a cero.',absent:'La fuente no reporta montos para estas categorías.'};

// Tabla accesible con barras proporcionales dentro del mismo conjunto.
export function datasetView(content,archive,dataset,{preview=false,heading='h4'}={}){
 const group=dimensions[dataset.dimension].group,state=datasetState(dataset);
 const max=Math.max(0,...dataset.rows.map(r=>r.amount??0));
 const amountType=categoryLabel(content,'amount_types',dataset.amount_type)||'Tipo de monto: '+dataset.amount_type;
 const rows=dataset.rows.map(r=>{
  const label=categoryLabel(content,group,r.category)||r.category;
  const width=r.amount!=null&&max>0?Math.max(.5,r.amount/max*100):0;
  return `<tr><th scope="row">${esc(label)}${r.note?`<small>${esc(r.note)}</small>`:''}</th><td><span class="amount">${esc(money(r.amount,dataset.currency))}</span>${r.amount!=null?`<span class="amount-bar" aria-hidden="true"><i style="width:${width.toFixed(1)}%"></i></span>`:''}</td></tr>`;
 }).join('');
 return `<article class="dataset" data-dataset="${esc(dataset.dataset_id)}" data-state="${state}">
  ${editorialNote(dataset,preview)}
  <${heading}>${esc(dataset.title)}</${heading}>
  <p class="dataset-meta">${esc(periodLabel(dataset.period))} · ${esc(amountType)} · ${esc(dataset.currency)} · ${esc(verification(dataset.verification_status))}</p>
  ${state==='complete'?'':`<p class="content-warning">${esc(stateNote[state]||'')}</p>`}
  <div class="table-wrap"><table class="dataset-table"><caption class="sr-only">${esc(dataset.title)}, ${esc(periodLabel(dataset.period))}, en ${esc(dataset.currency)}</caption>
   <thead><tr><th scope="col">Categoría</th><th scope="col">Monto</th></tr></thead><tbody>${rows}</tbody></table></div>
  ${dataset.reported_total!=null?`<p class="dataset-total">Total reportado por la fuente: <strong>${esc(money(dataset.reported_total,dataset.currency))}</strong></p>`:''}
  <p class="content-note"><span>Definición:</span> ${esc(dataset.definition)}</p>
  ${(dataset.notes||[]).map(n=>`<p class="content-note">${esc(n)}</p>`).join('')}
  ${sourceLine(content,archive,dataset.source_ids)}
 </article>`;
}

export function renderInvestment({content,failed,preview},archive=null){
 const root=document.querySelector('[data-content="investment"]');
 if(!root)return;
 if(failed.has('investment')||failed.has('categories')){
  root.insertAdjacentHTML('beforebegin','<p class="content-error" role="status">No se pudo cargar la información de inversión. Recargue la página para intentarlo de nuevo.</p>');
  return;
 }
 root.innerHTML=Object.entries(dimensions).map(([dimension,{title}])=>{
  const sets=investmentFor(content,{dimension});
  if(!sets.length)return `<article class="info-card is-pending" data-dimension="${dimension}"><span class="badge-prep">En preparación</span><h3>${title}</h3><p>Se publicará con las categorías, montos y períodos que defina la UGD.</p></article>`;
  const periods=[...new Map(sets.map(d=>[d.period.start+'/'+d.period.end,periodLabel(d.period)])).entries()];
  const select=periods.length>1?`<label class="period-select">Período<select data-period-for="${dimension}">${periods.map(([k,l])=>`<option value="${esc(k)}">${esc(l)}</option>`).join('')}</select></label>`:'';
  return `<article class="info-card investment-card" data-dimension="${dimension}"><h3>${title}</h3>${select}<div class="datasets">${sets.map(d=>`<div data-period="${esc(d.period.start+'/'+d.period.end)}">${datasetView(content,archive,d,{preview})}</div>`).join('')}</div></article>`;
 }).join('');
 for(const select of root.querySelectorAll('select[data-period-for]')){
  const show=()=>select.closest('article').querySelectorAll('[data-period]').forEach(el=>{el.hidden=el.dataset.period!==select.value;});
  select.onchange=show;show();
 }
 const note=document.querySelector('#investment-note');
 if(note)note.textContent=content.investment.datasets.length?'Cada conjunto muestra su período, moneda, tipo de monto y fuente. Los montos no se suman entre categorías ni se comparan entre períodos; la inversión atribuida a un departamento o gestor se muestra en su consulta.':'Los datos se publicarán con las categorías, montos y períodos que defina la UGD.';
}
