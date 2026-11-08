import {renderObservatory} from './observatory/view.js';
import {renderInstitutional} from './institutional.js';
import {assertArchiveStructure} from './map/structure.js';
import {initShell} from './ui.js';
import {loadConfig,localUrl} from './config.js';
import {renderHome} from './home.js';
import {startExplorer} from './map/explorer.js';
import {initTerritorialArt} from './territorial-art.js';

const status=document.querySelector('#status');
initShell();

let loading=false, initialized=false;
const retry=document.querySelector('#retry');
function unavailable(message){
 status.textContent=message;
 document.querySelector('#home-period').textContent=message;
 document.querySelector('#observatory').textContent=message;
 document.querySelectorAll('[data-territorial-status]').forEach(el=>el.textContent=message);
}
async function init(){
 if(loading||initialized)return;
 loading=true;
 retry.disabled=true;
  document.querySelector('#retry').hidden=true;
  try{
    const config=await loadConfig();
    const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Recurso no disponible');return r.json();};
    const catalog=await load(localUrl(config.catalog,config.dataRoot));
    if(!catalog.explorer){
      unavailable('Sin archivo territorial publicado. Puede reintentar.');
      retry.hidden=false;
      return;
    }
    const data=await load(localUrl(catalog.explorer,config.dataRoot));
    assertArchiveStructure(data);
    renderHome(data);
    renderInstitutional(data);
    renderObservatory(data);
    await Promise.all([initTerritorialArt(data,config,load),startExplorer(data,config,load)]);
    initialized=true;
  }catch(error){
    unavailable('No se pudo cargar la información territorial: recurso no disponible o datos incompletos/ inválidos. Puede reintentar.');
    document.querySelector('#retry').hidden=false;
    console.error(error);
  }finally{loading=false;retry.disabled=false;}
}

document.querySelector('#retry').onclick=init;
await init();
