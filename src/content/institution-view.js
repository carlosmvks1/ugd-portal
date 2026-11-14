// Conocer la UGD, Descentralización y Contacto a partir de institution.json.
// Las plantillas HTML conservan marcadores estáticos como alternativa sin JS.
import {esc,safeLink,day,sourceLine,editorialNote,showable,figure} from './format.js';
import {isPublishable} from './contract.js';

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
const channels=list=>list?.length?`<ul class="content-list channel-list">${list.map(c=>{const h=href(c);return `<li><span>${esc(c.label)}</span><strong>${h?`<a href="${esc(h)}">${esc(c.value)}</a>`:esc(c.value)}</strong>${c.note?`<small>${esc(c.note)}</small>`:''}</li>`;}).join('')}</ul>`:'';
// Dirección institucional: retrato (si hay uno publicable), nombre, cargo,
// responsabilidades validadas y contacto autorizado. Sin biografía ni mensajes.
function profileBody(block,content,archive,preview){
 const person=block.items?.[0];
 const photo=person?.photo_id?content.photos.photos.find(p=>p.photo_id===person.photo_id):null;
 const portrait=photo?`<div class="portrait">${figure(photo,{preview,caption:false})}<p class="content-note">Crédito: ${esc(photo.credit)}</p></div>`:'';
 return {portrait:!!photo,html:`<div class="block-label"><p class="profile-kicker">${esc(block.title)}</p>${portrait}</div><div class="block-body profile-copy">${editorialNote(block,preview)}
  <h3>${esc(person.name)}</h3><p class="profile-role">${esc(person.role)}</p>
  ${person.text?`<p class="profile-text">${esc(person.text)}</p>`:''}${(block.paragraphs||[]).map(p=>`<p class="profile-text">${esc(p)}</p>`).join('')}
  ${channels(person.contact)}
  ${block.reference_date?`<p class="content-note">Información a la fecha: ${esc(day(block.reference_date))}</p>`:''}${sourceLine(content,archive,block.source_ids)}</div>`};
}
export function blockBody(block,content,archive,preview){
 if(!showable(block,preview)||!(block.paragraphs?.length||block.items?.length)){
  const label=`<span class="badge-prep">En preparación</span><h3>${esc(block.title)}</h3>`,body=`<p>${esc(block.placeholder)}</p>`;
  return {pending:true,label,body,html:label+body};
 }
 const label=`<h3>${esc(block.title)}</h3>`;
 const body=`${editorialNote(block,preview)}${(block.paragraphs||[]).map(p=>`<p class="block-text">${esc(p)}</p>`).join('')}${items(block)}${block.note?`<p class="content-note">${esc(block.note)}</p>`:''}${block.reference_date?`<p class="content-note">Información a la fecha: ${esc(day(block.reference_date))}</p>`:''}${sourceLine(content,archive,block.source_ids)}`;
 return {pending:false,label,body,html:label+body};
}
// Mensaje de portada aprobado (sections.home → mensaje) y logotipo autorizado.
function renderHomeMessage({content,preview}){
 const block=content.institution.sections.home?.blocks?.find(b=>b.block_id==='mensaje');
 const lead=document.querySelector('#hero-lead');
 if(lead&&block&&showable(block,preview)&&block.paragraphs?.length)lead.textContent=block.paragraphs.join(' ');
 const brand=content.institution.brand,slot=document.querySelector('#brand-logo');
 if(slot&&brand&&(isPublishable(brand)||preview)&&brand.authorization?.status==='granted'){
  slot.innerHTML=`<img src="./${esc(brand.logo_src)}" alt="${esc(brand.logo_alt)}" width="${Number(brand.logo_width)}" height="${Number(brand.logo_height)}">`;
  slot.hidden=false;slot.closest('.brand')?.classList.add('has-logo');
 }
}
export function renderInstitution({content,failed,preview},archive=null){
 if(!failed.has('institution'))renderHomeMessage({content,preview});
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
   root.innerHTML=blocks.map(b=>{
    if(b.kind==='profile'&&showable(b,preview)&&b.items?.length){const {portrait,html}=profileBody(b,content,archive,preview);return `<article class="info-card profile-card${portrait?' has-portrait':''}" data-block="${esc(b.block_id)}">${html}</article>`;}
    const {pending,html,label,body}=blockBody(b,content,archive,preview);
    // «La UGD» usa filas editoriales (título | contenido); Contacto, tarjetas simples.
    return name==='ugd'?`<article class="info-card${pending?' is-pending':''}" data-block="${esc(b.block_id)}"><div class="block-label">${label}</div><div class="block-body">${body}</div></article>`
     :`<article class="info-card${pending?' is-pending':''}" data-block="${esc(b.block_id)}">${html}</article>`;
   }).join('');
  }
 }
}
