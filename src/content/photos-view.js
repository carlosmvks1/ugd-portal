// Fotografías por lugar narrativo (photos.json → placements):
//   home → portada · ugd → «Conocer la UGD» · decentralization → «Cómo funciona»
//   territory → «Territorio y gestores» · teams → galería de los equipos.
// Cada lugar se adapta si falta su imagen: no se muestran marcos vacíos ni
// degradados que aparenten una fotografía.
import {figure} from './format.js';
import {photosFor} from './model.js';

const single=['ugd','decentralization','territory'];

export function renderPhotos({content,failed,preview}){
 const teams=document.querySelector('[data-content="teams"]');
 if(failed.has('photos')){
  teams?.insertAdjacentHTML('beforebegin','<p class="content-error" role="status">No se pudieron cargar las fotografías. Recargue la página para intentarlo de nuevo.</p>');
  return;
 }
 const hero=photosFor(content,{placement:'home'})[0];
 const heroSlot=document.querySelector('[data-slot="home"]');
 if(hero&&heroSlot){
  heroSlot.innerHTML=figure(hero,{preview,className:'hero-photo',eager:true});
  heroSlot.closest('.page-hero')?.classList.add('has-photo');
 }
 for(const place of single){
  const photo=photosFor(content,{placement:place})[0],slot=document.querySelector(`[data-slot="${place}"]`);
  if(!photo||!slot)continue;
  slot.innerHTML=figure(photo,{preview});
  slot.closest('.chapter-head')?.classList.add('has-media');
 }
 const list=photosFor(content,{placement:'teams'});
 if(teams&&list.length){
  teams.innerHTML=list.map((p,i)=>figure(p,{preview,eager:false})).join('');
  teams.classList.add('has-photos');
  teams.dataset.count=String(Math.min(list.length,3));
 }
}
