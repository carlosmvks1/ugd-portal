import {renderManagers} from './institutional.js';
import {renderHome,homeUnavailable} from './home.js';
import {assertArchiveStructure} from './map/structure.js';
import {initShell} from './ui.js';
import {loadConfig,localUrl} from './config.js';
import {startExplorer} from './map/explorer.js';
import {initTerritorialArt} from './territorial-art.js';
import {layoutReady} from './navigation.js';
import {followLegacyAnchor} from './landing.js';
import {loadContent} from './content/load.js';
import {renderInstitution} from './content/institution-view.js';
import {renderInvestment} from './content/investment-view.js';
import {renderPhotos} from './content/photos-view.js';
import {createManagersView} from './content/managers-view.js';
import {emptyContent} from './content/model.js';

const status=document.querySelector('#status');
followLegacyAnchor();
initShell();

let loading=false, initialized=false, config=null, contentResult=null, managersView=null;
const retry=document.querySelector('#retry');
const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Recurso no disponible');return r.json();};
function unavailable(message){
 status.textContent=message;
 homeUnavailable(message);
}
if(new URLSearchParams(location.search).has('gestor')||location.hash==='#ficha-gestor')document.querySelector('#gestores')?.setAttribute('aria-busy','true');

// El contenido institucional se carga una vez y no depende del archivo
// territorial: si este falla, las secciones institucionales siguen disponibles.
async function initContent(){
 try{config=await loadConfig();}catch(error){console.error(error);}
 contentResult=config?await loadContent(config,load):{content:emptyContent(),failed:new Set(['categories','sources','institution','managers','population','investment','photos']),preview:false};
 if(contentResult.preview)document.body.classList.add('is-preview');
 renderInstitution(contentResult);
 renderInvestment(contentResult);
 renderPhotos(contentResult);
 managersView=createManagersView(contentResult);
 document.querySelector('#gestores')?.removeAttribute('aria-busy');
}

async function init(){
 if(loading||initialized)return;
 loading=true;
 retry.disabled=true;
 retry.hidden=true;
 try{
  config??=await loadConfig();
  const catalog=await load(localUrl(config.catalog,config.dataRoot));
  if(!catalog.explorer){
   unavailable('Todavía no hay datos territoriales publicados. Puede reintentar.');
   retry.hidden=false;
   return;
  }
  const data=await load(localUrl(catalog.explorer,config.dataRoot));
  assertArchiveStructure(data);
  renderHome(data);
  renderManagers(data,contentResult.content);
  managersView.setArchive(data);
  await Promise.all([initTerritorialArt(data,config,load),startExplorer(data,config,load,contentResult.content,contentResult.preview)]);
  initialized=true;
 }catch(error){
  unavailable('No se pudieron cargar los datos territoriales. Puede reintentar.');
  retry.hidden=false;
  console.error(error);
 }finally{loading=false;retry.disabled=false;layoutReady();}
}

retry.onclick=init;
await initContent();
await init();
