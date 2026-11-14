import {mkdir,copyFile,cp,writeFile,readdir,readFile,rm} from 'node:fs/promises';
import {resolve,relative,sep,dirname} from 'node:path';
import {parseArgs} from 'node:util';
import {validateData,root} from './validate.mjs';
import {defaultContentDir,defaultMediaDir} from './validate-content.mjs';
import {siteArchive} from '../src/map/contract.js';
import {publicContent,photoAllowed} from '../src/content/model.js';
import {contentSchemas} from '../src/content/contract.js';

// Uso:
//   npm run build                         → dist/ público (solo contenido aprobado)
//   node scripts/build.mjs --preview      → work/preview/ con piezas no aprobadas rotuladas
//   node scripts/build.mjs --content DIR --media DIR [--archive-extra FILE] --out work/x [--preview]
//     contenido alternativo (p. ej. ejemplos sintéticos); nunca escribe en dist/.
const {values:args}=parseArgs({options:{preview:{type:'boolean',default:false},content:{type:'string'},media:{type:'string'},'archive-extra':{type:'string'},out:{type:'string'}}});
const projectDir=resolve(new URL('.',root).pathname);
const contentDir=args.content?resolve(args.content):defaultContentDir;
const mediaDir=args.media?resolve(args.media):defaultMediaDir;
const alternative=args.preview||contentDir!==defaultContentDir||mediaDir!==defaultMediaDir||!!args['archive-extra'];
const out=resolve(projectDir,args.out||(args.preview?'work/preview':'dist'));
const dist=resolve(projectDir,'dist');
const inside=(parent,child)=>{const r=relative(parent,child);return r&&!r.startsWith('..')&&!r.startsWith(sep)&&!/^[a-z]:/i.test(r);};
if(alternative&&out===dist)throw new Error('Vista previa o contenido alternativo no pueden escribirse en dist/.');
if(out!==dist&&!inside(resolve(projectDir,'work'),out))throw new Error('La salida alternativa debe estar dentro de work/.');

const archiveExtra=args['archive-extra']?JSON.parse(await readFile(resolve(args['archive-extra']),'utf8')):null;
const catalog=await validateData({dir:contentDir,mediaDir,allowSynthetic:out!==dist},archiveExtra);
const content=args.preview?catalog.content:publicContent(catalog.content);
// Ni siquiera la vista previa muestra fotografías sin autorización de uso o con
// personas identificables sin consentimiento: es una condición legal, no editorial.
if(args.preview)content.photos={...content.photos,photos:content.photos.photos.filter(photoAllowed)};
const target=path=>resolve(out,path);

await rm(out,{recursive:true,force:true});
await mkdir(target('data'),{recursive:true});
for(const page of ['index.html','portal.html'])await copyFile(new URL(page,root),target(page));
// El módulo del observatorio (fuera de alcance) solo lo usa la administración
// experimental; no forma parte del artefacto público.
await cp(new URL('src/',root),target('src'),{recursive:true,filter:path=>!path.endsWith('.md')&&!path.split(sep).includes('observatory')});
// public/media se copia selectivamente: solo fotografías publicables.
await cp(new URL('public/',root),out,{recursive:true,filter:path=>!relative(resolve(projectDir,'public'),path).split(sep).includes('media')});
const config=JSON.parse(await readFile(new URL('public/config.json',root),'utf8'));
if(args.preview)config.preview=true;
await writeFile(target('config.json'),JSON.stringify(config,null,2)+'\n');
await copyFile(new URL('data/catalog.json',root),target('data/catalog.json'));
if(catalog.explorer){
 await mkdir(target('data/explorer'),{recursive:true});
 const archive=siteArchive(catalog.archive);
 await writeFile(target('data/explorer/archive.json'),JSON.stringify(archive,null,2)+'\n');
 await writeFile(target('data/explorer/data_quality_issues.json'),JSON.stringify(archive.data_quality_issues,null,2)+'\n');
}
await mkdir(target('data/content'),{recursive:true});
for(const name of Object.keys(contentSchemas))await writeFile(target('data/content/'+name+'.json'),JSON.stringify(content[name],null,2)+'\n');
for(const photo of content.photos.photos){
 await mkdir(dirname(target(photo.src)),{recursive:true});
 await copyFile(resolve(mediaDir,photo.src),target(photo.src));
}
for(const entry of catalog.snapshots) {
  const file=target('data/'+entry.path);
  await mkdir(dirname(file),{recursive:true});
  await copyFile(new URL('data/'+entry.path,root),file);
}
await mkdir(target('geography'),{recursive:true});
for(const file of await readdir(new URL('geography/',root))) if(file.endsWith('.geojson')) {
  const data=JSON.parse(await readFile(new URL('geography/'+file,root),'utf8'));
  if(data.type!=='FeatureCollection' || !Array.isArray(data.features)) throw new Error('GeoJSON inválido');
  for(const feature of data.features) if(!feature.properties?.territorio_id) throw new Error('Falta territorio_id');
  await copyFile(new URL('geography/'+file,root),target('geography/'+file));
}
await writeFile(target('.nojekyll'),'');

// Red de seguridad del artefacto público: ningún ejemplo sintético, módulo
// administrativo u observatorio puede terminar en dist/.
if(out===dist){
 const files=async dir=>(await readdir(dir,{withFileTypes:true,recursive:true})).filter(e=>e.isFile()).map(e=>resolve(e.parentPath??e.path,e.name));
 for(const file of await files(out)){
  const path=relative(out,file).split(sep).join('/');
  if(/(^|\/)(admin|observatory|work|tests|design)(\/|$)/.test(path))throw new Error('Recurso interno en dist: '+path);
  if(/\.(json|html|js)$/.test(path)&&/SINT[EÉ]TICO|"synthetic"\s*:\s*true/.test(await readFile(file,'utf8')))throw new Error('Contenido sintético en dist: '+path);
 }
}
console.log((out===dist?'Artefacto portable: ':args.preview?'Vista previa (no publicable): ':'Artefacto alternativo (no publicable): ')+relative(projectDir,out)+'/');
