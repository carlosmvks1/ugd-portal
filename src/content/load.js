// Carga del contenido institucional. Cada archivo se carga y comprueba por
// separado: un archivo ausente o inválido deja su sección en estado de error
// sin afectar al resto del portal ni a la consulta territorial.
import {localUrl} from '../config.js';
import {contentSchemas,contentFiles} from './contract.js';
import {checkStructure} from '../map/structure.js';
import {emptyContent,publicContent} from './model.js';

export async function loadContent(config,load){
 const content=emptyContent(),failed=new Set();
 await Promise.all(Object.entries(contentFiles).map(async([name,path])=>{
  try{content[name]=checkStructure(await load(localUrl(path,config.dataRoot)),contentSchemas[name],name);}
  catch(error){failed.add(name);console.error(error);}
 }));
 // dist/ ya contiene solo piezas aprobadas; la proyección se repite aquí como
 // defensa. En vista previa (work/preview) se muestran rotuladas.
 return {content:config.preview?content:publicContent(content),failed,preview:config.preview};
}
