// Genera shared/mapa.js: trazados SVG simplificados de departamentos y
// municipios a partir de geography/ y la presencia reportada en el corte 2024
// provisional (data/explorer/archive.json). Solo para los prototipos visuales.
import {readFile,writeFile,readdir} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const W=1000,H=560,P=8;
const deps=await read('geography/departamentos.geojson');
const munis=[];
for(const f of await readdir(new URL('geography/',root)))if(f.startsWith('municipios-'))munis.push(...(await read('geography/'+f)).features);
const rings=g=>g.type==='Polygon'?g.coordinates:g.coordinates.flat();
let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
const k=Math.cos(15*Math.PI/180);
for(const f of deps.features)for(const r of rings(f.geometry))for(const [x,y] of r){const X=x*k;minX=Math.min(minX,X);maxX=Math.max(maxX,X);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
const s=Math.min((W-2*P)/(maxX-minX),(H-2*P)/(maxY-minY));
const ox=(W-(maxX-minX)*s)/2,oy=(H-(maxY-minY)*s)/2;
const proj=([x,y])=>[ox+(x*k-minX)*s,oy+(maxY-y)*s];
function path(g,tol){
 return rings(g).map(r=>{const pts=[];for(const c of r){const p=proj(c);const l=pts[pts.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>=tol)pts.push(p);}
  return pts.length<3?'':'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z';}).join('');
}
const archive=await read('data/explorer/archive.json');
const cov=new Map(archive.coverage.filter(r=>r.snapshot_id==='2024-v1').map(r=>[r.territory_id,r]));
const out={viewBox:`0 0 ${W} ${H}`,
 departments:deps.features.map(f=>({id:f.properties.official_code,name:f.properties.name,d:path(f.geometry,1.6)})),
 municipalities:munis.map(f=>{const c=cov.get(f.properties.official_code);return {id:f.properties.official_code,name:f.properties.name,dep:f.properties.parent_id,d:path(f.geometry,1.2),reported:c?.coverage_status==='reported',population:c?.population_covered??null};})};
await writeFile(new URL('shared/mapa.js',import.meta.url),'// Generado por generar-mapa.mjs. Geometría histórica HDX/SINIT simplificada; presencia del corte 2024 provisional.\nexport default '+JSON.stringify(out)+';\n');
console.log('mapa.js',out.municipalities.length,'municipios');
