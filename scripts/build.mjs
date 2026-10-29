import {mkdir,copyFile,cp,writeFile,readdir} from 'node:fs/promises';
import {validateData,root} from './validate.mjs';
const catalog=await validateData();
// Recrear solo dist dentro del proyecto.
const {rm}=await import('node:fs/promises');
await rm(new URL('dist/',root),{recursive:true,force:true});
await mkdir(new URL('dist/data/',root),{recursive:true});
await copyFile(new URL('index.html',root),new URL('dist/index.html',root));
await cp(new URL('src/',root),new URL('dist/src/',root),{recursive:true,filter:path=>!path.endsWith('.md')});
await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
await copyFile(new URL('data/catalog.json',root),new URL('dist/data/catalog.json',root));
for(const entry of catalog.snapshots) {
  const target=new URL('dist/data/'+entry.path,root);
  await mkdir(new URL('./',target),{recursive:true});
  await copyFile(new URL('data/'+entry.path,root),target);
}
await mkdir(new URL('dist/geography/',root),{recursive:true});
for(const file of await readdir(new URL('geography/',root))) if(file.endsWith('.geojson')) {
  const data=JSON.parse(await (await import('node:fs/promises')).readFile(new URL('geography/'+file,root),'utf8'));
  if(data.type!=='FeatureCollection' || !Array.isArray(data.features)) throw new Error('GeoJSON inválido');
  for(const feature of data.features) if(!feature.properties?.territorio_id) throw new Error('Falta territorio_id');
  await copyFile(new URL('geography/'+file,root),new URL('dist/geography/'+file,root));
}
await writeFile(new URL('dist/.nojekyll',root),'');
console.log('Artefacto portable: dist/');
