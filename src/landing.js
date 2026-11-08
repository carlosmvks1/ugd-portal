import {initShell} from './ui.js';

// Preserve previously shared section and territorial query URLs.
const legacySections=new Set(['cobertura','table','calidad','observatorio','institucion','documentos','gestores','convenios','modelo','informacion','descentralizacion']);
function followLegacyLink(){
  if(location.search||legacySections.has(location.hash.slice(1))){
    location.replace(new URL('./portal.html'+location.search+location.hash,location.href));
  }
}
initShell();
followLegacyLink();
window.addEventListener('hashchange',followLegacyLink);
