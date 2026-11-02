import {AdminError,validated} from './admin-store.mjs';
import {coverageSchema} from '../src/map/contract.js';
const fail=message=>{throw new AdminError(422,message);};
export function parseCsv(text){
 if(typeof text!=='string')fail('CSV requerido.');text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)fail('Comillas CSV inválidas.');quoted=true;}
  else if(c===','||c==='\r'||c==='\n'){
   row.push(cell);cell='';closed=false;
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v!==''))rows.push(row);row=[];}
  }else{if(closed)fail('Texto después de una celda entrecomillada.');cell+=c;}
 }
 if(quoted)fail('CSV con comillas sin cerrar.');
 row.push(cell);if(row.some(v=>v!==''))rows.push(row);
 return rows;
}
export function importCoverage(base,text){
 validated(base);const rows=parseCsv(text),headers=rows.shift();
 if(!headers?.length)fail('CSV vacío.');
 if(new Set(headers).size!==headers.length)fail('Columnas duplicadas.');
 for(const h of headers)if(!Object.hasOwn(coverageSchema.properties,h))fail('Columna no permitida: '+h);
 for(const h of ['snapshot_id','territory_id','care_level'])if(!headers.includes(h))fail('Falta columna clave: '+h);
 const result=structuredClone(base),key=r=>[r.snapshot_id,r.territory_id,r.care_level].join('/'),seen=new Set();
 const integers=new Set(['population_covered','men','women','source_page','source_row']);
 const nullable=new Set(['population_covered','men','women','manager_id','source_id','source_page','source_row','scope_note','source_name','manager_label_raw']);
 const index=new Map(result.coverage.map((r,i)=>[key(r),i]));
 for(const [i,row] of rows.entries()){
  if(row.length!==headers.length)fail('Número de columnas incorrecto en fila '+(i+2));
  const entry=Object.fromEntries(headers.map((h,j)=>{
   const v=row[j];if(v===''&&nullable.has(h))return [h,null];
   if(h==='agreement_ids')return [h,v?v.split(';'):[]];
   if(integers.has(h)){if(!/^\d+$/.test(v))fail('Entero inválido en fila '+(i+2)+': '+h);return [h,Number(v)];}
   return [h,v];
  }));
  const id=key(entry);if(seen.has(id))fail('Clave duplicada en CSV: '+id);seen.add(id);
  if(index.has(id)){
   const old=result.coverage[index.get(id)];
   for(const h of headers)if(entry[h]===null&&nullable.has(h)){
    if(old[h]==='')entry[h]='';
    else if(!Object.hasOwn(old,h)&&!coverageSchema.required.includes(h))delete entry[h];
   }
   result.coverage[index.get(id)]={...old,...entry};
  }
  else{index.set(id,result.coverage.length);result.coverage.push(entry);}
 }
 return validated(result);
}
