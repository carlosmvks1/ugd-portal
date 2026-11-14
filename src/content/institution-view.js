// Conocer la UGD, Descentralización y Contacto a partir de institution.json.
// Las plantillas HTML conservan marcadores estáticos como alternativa sin JS.
import {esc,safeLink,day,sourceLine,editorialNote,showable} from './format.js';

const validity={current:'Vigente',historical:'Histórica',unknown:'Vigencia no confirmada'};
const href=item=>{
 if(item.type==='email')return 'mailto:'+item.value;
 if(item.type==='phone')return 'tel:'+item.value.replace(/[^\d+]/g,'');
 if(item.type==='website')return safeLink(item.value)?item.value:'';
 return '';
};
function items(block){
 const list=block.items||[];
 if(!list.length)return '';
 if(block.kind==='people')return `<ul class="content-list people-list">${list.map(p=>`<li><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span>${p.unit?`<span>${esc(p.unit)}</span>`:''}${p.since?`<span>Desde ${esc(day(p.since))}</span>`:''}</li>`).join('')}</ul>`;
 if(block.kind==='legal')return `<ul class="content-list legal-list">${list.map(l=>`<li><strong>${l.url&&safeLink(l.url)?`<a href="${safeLink(l.url)}" rel="noopener" target="_blank">${esc(l.title)}</a>`:esc(l.title)}</strong><span>${[l.issuer,l.number,l.date?day(l.date):null,l.validity?validity[l.validity]:null].filter(Boolean).map(esc).join(' · ')}</span>${l.text?`<span>${esc(l.text)}</span>`:''}</li>`).join('')}</ul>`;
 if(block.kind==='channels')return `<ul class="content-list channel-list">${list.map(c=>{const h=href(c);return `<li><span>${esc(c.label)}</span><strong>${h?`<a href="${esc(h)}">${esc(c.value)}</a>`:esc(c.value)}</strong>${c.note?`<small>${esc(c.note)}</small>`:''}</li>`;}).join('')}</ul>`;
 return `<ul class="content-list">${list.map(i=>`<li>${i.title?`<strong>${esc(i.title)}</strong>`:''}${i.text?`<span>${esc(i.text)}</span>`:''}</li>`).join('')}</ul>`;
}
export function blockBody(block,content,archive,preview){
 if(!showable(block,preview)||!(block.paragraphs?.length||block.items?.length))
  return {pending:true,html:`<span class="badge-prep">En preparación</span><h3>${esc(block.title)}</h3><p>${esc(block.placeholder)}</p>`};
 return {pending:false,html:`${editorialNote(block,preview)}<h3>${esc(block.title)}</h3>${(block.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${items(block)}${block.note?`<p class="content-note">${esc(block.note)}</p>`:''}${block.reference_date?`<p class="content-note">Información a la fecha: ${esc(day(block.reference_date))}</p>`:''}${sourceLine(content,archive,block.source_ids)}`};
}
export function renderInstitution({content,failed,preview},archive=null){
 for(const name of ['ugd','decentralization','contact']){
  const root=document.querySelector(`[data-content="${name}"]`);
  if(!root)continue;
  if(failed.has('institution')){
   root.insertAdjacentHTML('beforebegin','<p class="content-error" role="status">No se pudo cargar el contenido de esta sección. Recargue la página para intentarlo de nuevo.</p>');
   continue;
  }
  const blocks=content.institution.sections[name].blocks;
  if(name==='decentralization'){
   root.innerHTML=blocks.map((b,i)=>{const {pending,html}=blockBody(b,content,archive,preview);return `<li class="${pending?'is-pending':'is-ready'}" data-block="${esc(b.block_id)}"><span class="step-number" aria-hidden="true">${i+1}</span>${html}</li>`;}).join('');
  }else{
   root.innerHTML=blocks.map(b=>{const {pending,html}=blockBody(b,content,archive,preview);return `<article class="info-card${pending?' is-pending':''}" data-block="${esc(b.block_id)}">${html}</article>`;}).join('');
  }
 }
}
