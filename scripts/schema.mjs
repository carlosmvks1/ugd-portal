// Validador del subconjunto de JSON Schema usado por los contratos del proyecto.
// Fallar ante keywords nuevas evita aceptar un esquema que no sabemos interpretar.
import assert from 'node:assert/strict';
const supported = new Set(['$schema','type','properties','required','additionalProperties','items','minItems','minLength','minimum','pattern','enum','const','anyOf']);
export function validate(value, schema, path = '$') {
  for (const key of Object.keys(schema)) assert(supported.has(key), 'Keyword no soportada: '+key);
  if (schema.anyOf) {
    assert(schema.anyOf.some(s => {try {validate(value,s,path);return true;}catch{return false;}}), path+': tipo inválido');
    return;
  }
  if ('const' in schema) assert.deepEqual(value,schema.const,path);
  if (schema.enum) assert(schema.enum.includes(value),path+': opción inválida');
  if (schema.type) {
    const ok = schema.type === 'null' ? value === null : schema.type === 'integer' ? Number.isSafeInteger(value) : schema.type === 'array' ? Array.isArray(value) : schema.type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : typeof value === schema.type;
    assert(ok,path+': tipo inválido');
  }
  if (typeof value === 'number') {assert(Number.isFinite(value),path); if ('minimum' in schema) assert(value>=schema.minimum,path);}
  if (typeof value === 'string') {
    if (schema.minLength) assert(value.length>=schema.minLength,path);
    if (schema.pattern) assert(new RegExp(schema.pattern).test(value),path+': formato inválido');
    if (schema.pattern === '^\\d{4}-\\d{2}-\\d{2}$') assert(!Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value,path+': fecha inválida');
  }
  if (Array.isArray(value)) {if(schema.minItems) assert(value.length>=schema.minItems,path); value.forEach((v,i)=>validate(v,schema.items,path+'['+i+']'));}
  if (schema.type === 'object') {
    for (const k of schema.required || []) assert(Object.hasOwn(value,k),path+': falta '+k);
    for (const [k,v] of Object.entries(value)) {
      if (!Object.hasOwn(schema.properties,k)) assert(schema.additionalProperties !== false,path+': campo desconocido '+k);
      else validate(v,schema.properties[k],path+'.'+k);
    }
  }
}
