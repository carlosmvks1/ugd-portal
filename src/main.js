import {loadConfig,localUrl} from './config.js';
import {startExplorer} from './map/explorer.js';
const status=document.querySelector('#status');
async function init(){
 document.querySelector('#retry').hidden=true;
 try{
  const config=await loadConfig();
  const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Recurso no disponible');return r.json();};
  const catalog=await load(localUrl(config.catalog,config.dataRoot));
  if(!catalog.explorer){status.textContent='Sin archivo territorial publicado.';return;}
  await startExplorer(await load(localUrl(catalog.explorer,config.dataRoot)),config,load);
 }catch(error){status.textContent='No se pudo cargar la consulta territorial. Puede reintentar.';document.querySelector('#retry').hidden=false;console.error(error);}
}
document.querySelector('#retry').onclick=init;
await init();
