// Validación del contenido institucional editable (data/content/*.json).
// Uso: node scripts/validate-content.mjs [directorio-de-contenido [directorio-de-medios]] [--allow-synthetic]
import {parseArgs} from 'node:util';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validate} from './schema.mjs';
import {contentSchemas} from '../src/content/contract.js';
import {contentErrors} from '../src/content/model.js';
import {isPublishable} from '../src/content/contract.js';

export const projectRoot=resolve(fileURLToPath(new URL('../',import.meta.url)));
export const defaultContentDir=resolve(projectRoot,'data/content');
export const defaultMediaDir=resolve(projectRoot,'public');

export async function readContent(dir=defaultContentDir){
 const bundle={};
 for(const name of Object.keys(contentSchemas)){
  const file=resolve(dir,name+'.json');
  let value;
  try{value=JSON.parse(await readFile(file,'utf8'));}catch(error){throw new Error(`${name}.json: no se pudo leer (${error.message})`);}
  try{validate(value,contentSchemas[name],name);}catch(error){throw new Error(`${name}.json: ${error.message}`);}
  bundle[name]=value;
 }
 return bundle;
}

// Devuelve el contenido validado o lanza un error con todas las observaciones.
export async function validateContent({dir=defaultContentDir,mediaDir=defaultMediaDir,archive,allowSynthetic=false}={}){
 const bundle=await readContent(dir);
 const errors=contentErrors(bundle,archive,{allowSynthetic});
 for(const photo of bundle.photos.photos){
  // Las fotografías no aprobadas pueden faltar todavía; las publicables no.
  try{await access(resolve(mediaDir,photo.src));}catch{if(isPublishable(photo))errors.push(`photos.${photo.photo_id}: no existe el archivo ${photo.src}`);}
 }
 if(errors.length)throw new Error('Contenido inválido:\n- '+errors.join('\n- '));
 return bundle;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const archive=JSON.parse(await readFile(resolve(projectRoot,'data/explorer/archive.json'),'utf8'));
 // Uso: node scripts/validate-content.mjs [DIR_CONTENIDO [DIR_MEDIOS]] [--allow-synthetic]
 const {values,positionals}=parseArgs({allowPositionals:true,options:{'allow-synthetic':{type:'boolean',default:false}}});
 const dir=positionals[0]?resolve(positionals[0]):defaultContentDir;
 const mediaDir=positionals[1]?resolve(positionals[1]):defaultMediaDir;
 await validateContent({dir,mediaDir,archive,allowSynthetic:values['allow-synthetic']||dir!==defaultContentDir});
 console.log('Contenido válido: '+dir);
}
