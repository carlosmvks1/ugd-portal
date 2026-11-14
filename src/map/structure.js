import {explorerSchema} from './contract.js';

// Guard estructural de entrada, no sustituye validación de relaciones del build.
// Campos extra se toleran: las descargas conservan su proyección defensiva.
export function checkStructure(data,schema,label){
 function check(value,schema,path){
  const fail=()=>{throw new Error('Estructura '+label+' inválida: '+path);};
  if(schema.anyOf){
   if(value===null&&schema.anyOf.some(s=>s.type==='null'))return;
   return check(value,schema.anyOf.find(s=>s.type!=='null'),path);
  }
  if(schema.const!==undefined&&value!==schema.const)fail();
  if(schema.type==='object'){
   if(!value||typeof value!=='object'||Array.isArray(value))fail();
   for(const key of schema.required||[])if(!Object.hasOwn(value,key))fail();
   for(const [key,child] of Object.entries(schema.properties))if(Object.hasOwn(value,key))check(value[key],child,path+'.'+key);
  }else if(schema.type==='array'){
   if(!Array.isArray(value))fail();
   value.forEach((item,i)=>check(item,schema.items,path+'['+i+']'));
  }else if(schema.type==='integer'){
   if(!Number.isSafeInteger(value)||(schema.minimum!==undefined&&value<schema.minimum))fail();
  }else if(schema.type==='number'){
   if(!Number.isFinite(value)||(schema.minimum!==undefined&&value<schema.minimum))fail();
  }else if(schema.type==='boolean'&&typeof value!=='boolean')fail();
  else if(schema.type==='string'&&(typeof value!=='string'||(schema.pattern&&!new RegExp(schema.pattern).test(value))))fail();
  if(schema.enum&&!schema.enum.includes(value))fail();
 }
 check(data,schema,label);
 return data;
}
export const assertArchiveStructure=data=>checkStructure(data,explorerSchema,'territorial');
