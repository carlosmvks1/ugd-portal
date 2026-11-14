// Fotografías contextualizadas: portada y «Trabajo de los equipos».
// Sin fotografías autorizadas se conservan los espacios «En preparación».
import {figure} from './format.js';
import {photosFor} from './model.js';

export function renderPhotos({content,failed,preview}){
 const teams=document.querySelector('[data-content="teams"]');
 if(failed.has('photos')){
  teams?.insertAdjacentHTML('beforebegin','<p class="content-error" role="status">No se pudieron cargar las fotografías. Recargue la página para intentarlo de nuevo.</p>');
  return;
 }
 const hero=photosFor(content,{placement:'home'})[0];
 const slot=document.querySelector('.hero-photo');
 if(hero&&slot)slot.outerHTML=figure(hero,{preview,className:'hero-photo'});
 const list=photosFor(content,{placement:'teams'});
 if(teams&&list.length){
  teams.innerHTML=list.map(p=>figure(p,{preview})).join('');
  teams.classList.add('has-photos');
 }
}
