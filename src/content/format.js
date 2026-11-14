// Utilidades de presentación compartidas por las vistas de contenido.
import {isPublishable} from './contract.js';
import {editorialLabels} from './model.js';
import {verificationLabels} from '../map/snapshots.js';

export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeLink=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?esc(u.href):'';}catch{return '';}};
export const number=value=>value==null?'Sin dato':new Intl.NumberFormat('es-HN').format(value);
export function money(value,currency){
 if(value==null)return 'Sin dato';
 try{return new Intl.NumberFormat('es-HN',{style:'currency',currency,maximumFractionDigits:2}).format(value);}
 catch{return number(value)+' '+currency;}
}
export const day=iso=>{if(!iso)return '';const [y,m,d]=iso.split('-');return `${Number(d)}/${Number(m)}/${y}`;};
export function periodLabel(period){
 if(!period)return 'Período no consta';
 if(period.label)return period.label;
 const y=period.start.slice(0,4);
 return period.start===y+'-01-01'&&period.end===y+'-12-31'?'Año '+y:`${day(period.start)} a ${day(period.end)}`;
}
export const snapshotPeriod=s=>s?periodLabel({start:s.period_start,end:s.period_end}):'Período no disponible';
export const verification=status=>verificationLabels[status]||'Verificación no disponible';

// Fuentes citadas: emisor, título, fecha o período y enlace cuando existe.
export function sourceItems(content,archive,ids){
 return [...new Set(ids)].map(id=>{
  const s=content.sources.sources.find(x=>x.source_id===id);
  if(s)return `${s.url?`<a href="${safeLink(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>`:esc(s.title)} · ${esc(s.publisher)}${s.date?' · '+esc(day(s.date)):s.period?' · '+esc(s.period):''}`;
  const a=archive?.sources.find(x=>x.source_id===id);
  if(a)return `<a href="${safeLink(a.url)}" rel="noopener" target="_blank">${esc(a.title)}</a> · ${esc(a.publisher)}`;
  return 'Fuente no disponible';
 });
}
export const sourceLine=(content,archive,ids)=>ids?.length?`<p class="content-source"><span>Fuente:</span> ${sourceItems(content,archive,ids).join('; ')}</p>`:'';

// Rótulo visible del estado editorial: solo en vista previa o si la pieza está
// marcada como desactualizada en el sitio público.
export function editorialNote(item,preview){
 if(item.status==='outdated')return '<p class="content-warning">Información desactualizada: la UGD está revisando este contenido.</p>';
 if(preview&&!isPublishable(item))return `<p class="preview-badge">Vista previa · ${esc(editorialLabels[item.status]||item.status)} · no se publica</p>`;
 return '';
}
export const showable=(item,preview)=>isPublishable(item)||preview;

export function figure(photo,{preview=false,className=''}={}){
 const when=photo.date_label||(photo.date?day(photo.date):'');
 const meta=[photo.place,when].filter(Boolean).map(esc).join(' · ');
 return `<figure class="content-photo ${esc(className)}">
  <img src="./${esc(photo.src)}" alt="${esc(photo.alt)}" width="${Number(photo.width)}" height="${Number(photo.height)}" loading="lazy" decoding="async">
  <figcaption><span class="photo-description">${esc(photo.description)}</span>${meta?`<span class="photo-meta">${meta}</span>`:''}<span class="photo-credit">Crédito: ${esc(photo.credit)}</span>${preview&&!isPublishable(photo)?'<span class="preview-badge">Vista previa · no se publica</span>':''}</figcaption>
 </figure>`;
}
