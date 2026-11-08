import {initShell} from './ui.js';

// Preserve only known atlas queries and section anchors from the previous portal URL.
const legacySections=new Set(['cobertura','table','calidad','observatorio','institucion','documentos','gestores','convenios','modelo','informacion','descentralizacion']);
const legacyAtlasParams=new Set(['territory','year','snapshot','care','manager','agreement','layer']);
function followLegacyLink(){
  const hasAtlasParam=[...new URLSearchParams(location.search).keys()].some(key=>legacyAtlasParams.has(key));
  if(hasAtlasParam||legacySections.has(location.hash.slice(1))){
    location.replace(new URL('./portal.html'+location.search+location.hash,location.href));
  }
}
initShell();
followLegacyLink();
window.addEventListener('hashchange',followLegacyLink);
