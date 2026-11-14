import {renderManagers} from './institutional.js';
import {renderHome,homeUnavailable} from './home.js';
import {assertArchiveStructure} from './map/structure.js';
import {initShell} from './ui.js';
import {loadConfig,localUrl} from './config.js';
import {startExplorer} from './map/explorer.js';
import {initTerritorialArt} from './territorial-art.js';
import {layoutReady} from './navigation.js';
import {followLegacyAnchor} from './landing.js';

const status=document.querySelector('#status');
followLegacyAnchor();
initShell();

let loading=false, initialized=false;
const retry=document.querySelector('#retry');
function unavailable(message){
 status.textContent=message;
 homeUnavailable(message);
}
async function init(){
 if(loading||initialized)return;
 loading=true;
 retry.disabled=true;
  retry.hidden=true;
  try{
    const config=await loadConfig();
    const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Recurso no disponible');return r.json();};
    const catalog=await load(localUrl(config.catalog,config.dataRoot));
    if(!catalog.explorer){
      unavailable('Todavía no hay datos territoriales publicados. Puede reintentar.');
      retry.hidden=false;
      return;
    }
    const data=await load(localUrl(catalog.explorer,config.dataRoot));
    assertArchiveStructure(data);
    renderHome(data);
    renderManagers(data);
    await Promise.all([initTerritorialArt(data,config,load),startExplorer(data,config,load)]);
    initialized=true;
  }catch(error){
    unavailable('No se pudieron cargar los datos territoriales. Puede reintentar.');
    retry.hidden=false;
    console.error(error);
  }finally{loading=false;retry.disabled=false;layoutReady();}
}

retry.onclick=init;
await init();
