import {initShell} from './ui.js';
import {loadConfig,localUrl} from './config.js';
import {renderHome} from './home.js';
import {startExplorer} from './map/explorer.js';

const status=document.querySelector('#status');
initShell();

async function init(){
  document.querySelector('#retry').hidden=true;
  try{
    const config=await loadConfig();
    const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Recurso no disponible');return r.json();};
    const catalog=await load(localUrl(config.catalog,config.dataRoot));
    if(!catalog.explorer){
      status.textContent='Sin archivo territorial publicado.';
      document.querySelector('#home-period').textContent='No hay un consolidado territorial cargado.';
      return;
    }
    const data=await load(localUrl(catalog.explorer,config.dataRoot));
    renderHome(data);
    await startExplorer(data,config,load);
  }catch(error){
    status.textContent='No se pudo cargar la consulta territorial. Puede reintentar.';
    document.querySelector('#home-period').textContent='No se pudo cargar el consolidado.';
    document.querySelector('#retry').hidden=false;
    console.error(error);
  }
}

document.querySelector('#retry').onclick=init;
await init();
