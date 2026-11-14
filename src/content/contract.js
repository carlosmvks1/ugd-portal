// Contrato del contenido institucional editable (data/content/*.json).
// Separado del archivo territorial (src/map/contract.js): estos archivos los
// edita la UGD; las plantillas HTML y los módulos de presentación no cambian.
// Usa el mismo subconjunto de JSON Schema que scripts/schema.mjs.
const text={type:'string'};
const id={type:'string',minLength:1};
const key={type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9_-]*$'};
const count={type:'integer',minimum:0};
const amount={type:'number',minimum:0};
const positive={type:'integer',minimum:1};
const date={type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'};
const link={type:'string',pattern:'^https?://[^\\s]+$'};
const nullable=s=>({anyOf:[s,{type:'null'}]});
const list=items=>({type:'array',items});
const choice=(...values)=>({type:'string',enum:values});
const object=(properties,optional=[])=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties).filter(k=>!optional.includes(k))});

// Estados editoriales de docs/content-governance.md §3. Son distintos de los
// estados de verificación de datos (official_verified, etc.).
export const editorialStates=['proposed','collecting','pending_verification','verified','approved','published','outdated','withdrawn'];
// Solo estas piezas se publican en el artefacto público (dist/).
export const publishableStates=['approved','published','outdated'];
export const isPublishable=item=>publishableStates.includes(item?.status);
const editorial=choice(...editorialStates);
const verification=choice('official_verified','official_unverified','pending_UGD');
const period=object({start:date,end:date,label:nullable(text)},['label']);
// Marca de ejemplos sintéticos: aceptada por el contrato para poder probar
// con los mismos esquemas, rechazada por validate/build en data/content.
const header=(version,extra)=>object({schema_version:{const:version},synthetic:{type:'boolean'},...extra},['synthetic']);

const category=object({key,label:id,description:nullable(text),status:editorial},['description']);
export const categoriesSchema=header('categories-1',{
 entity_types:list(category),care_levels:list(category),management_levels:list(category),
 amount_types:list(category),population_definitions:list(category)
});

export const sourcesSchema=header('content-sources-1',{
 sources:list(object({source_id:key,title:id,publisher:id,date:nullable(date),period:nullable(text),url:nullable(link),note:nullable(text),status:editorial},['date','period','url','note']))
});

// Canales de contacto: el tipo decide cómo se enlaza (correo, teléfono, web).
export const channelTypes=['address','phone','email','website','hours','other'];
const channel=object({type:choice(...channelTypes),label:id,value:id,note:nullable(text)},['note']);

// Bloque institucional genérico. «kind» decide qué campos de cada elemento
// son obligatorios (ver itemRules); el resto de la estructura es común.
export const blockKinds=['text','list','people','legal','channels'];
const item=object({
 title:nullable(text),text:nullable(text),name:nullable(text),role:nullable(text),unit:nullable(text),
 since:nullable(date),issuer:nullable(text),number:nullable(text),date:nullable(date),url:nullable(link),
 validity:nullable(choice('current','historical','unknown')),
 type:nullable(choice(...channelTypes)),label:nullable(text),value:nullable(text),note:nullable(text)
},['title','text','name','role','unit','since','issuer','number','date','url','validity','type','label','value','note']);
export const itemRules={text:[],list:['title'],people:['name','role'],legal:['title','issuer'],channels:['type','label','value']};
const block=object({
 block_id:key,kind:choice(...blockKinds),title:id,status:editorial,placeholder:id,
 paragraphs:list(text),items:list(item),source_ids:list(key),reference_date:nullable(date),note:nullable(text)
},['paragraphs','items','source_ids','reference_date','note']);
const section=object({blocks:list(block)});
export const institutionSections=['ugd','decentralization','contact'];
export const institutionSchema=header('institution-1',{
 sections:object(Object.fromEntries(institutionSections.map(s=>[s,section])))
});

const population=object({
 value:nullable(count),period,snapshot_id:nullable(id),care_level:nullable(key),
 definition:nullable(key),source_id:key,verification_status:verification,note:nullable(text)
},['snapshot_id','care_level','definition','note']);
export const managersSchema=header('managers-1',{
 managers:list(object({
  manager_id:key,name:id,short_name:nullable(text),entity_type:nullable(key),status:editorial,
  verification_status:verification,source_ids:list(key),description:nullable(text),scope:nullable(text),
  archive_labels:list(id),contact:list(channel),population:list(population),note:nullable(text)
 },['short_name','entity_type','description','scope','archive_labels','contact','population','note'])),
 // Vínculos explícitos gestor ↔ territorio. Un registro por gestor, territorio,
 // período (snapshot del archivo territorial) y nivel de atención.
 assignments:list(object({
  manager_id:key,territory_id:id,snapshot_id:id,care_level:nullable(key),status:editorial,
  verification_status:verification,source_id:key,note:nullable(text)
 },['care_level','note']))
});

// Definición de población por período territorial (archivo 2024 y siguientes).
export const populationSchema=header('population-1',{
 periods:list(object({snapshot_id:id,definition:nullable(key),unit:nullable(text),note:nullable(text),status:editorial},['unit','note']))
});

export const investmentDimensions=['management_level','care_level'];
export const investmentSchema=header('investment-1',{
 datasets:list(object({
  dataset_id:key,title:id,dimension:choice(...investmentDimensions),status:editorial,verification_status:verification,
  period,currency:{type:'string',pattern:'^[A-Z]{3}$'},amount_type:key,definition:id,source_ids:list(key),
  scope:object({type:choice('national','department','manager'),id:nullable(id)}),
  reported_total:nullable(amount),notes:list(text),
  rows:list(object({category:key,amount:nullable(amount),note:nullable(text)},['note']))
 },['reported_total','notes']))
});

export const photoPlacements=['home','teams'];
export const photosSchema=header('photos-1',{
 photos:list(object({
  photo_id:key,src:{type:'string',pattern:'^media/[a-z0-9][a-z0-9/_-]*\\.(jpg|jpeg|png|webp)$'},
  width:positive,height:positive,alt:id,description:id,place:nullable(text),date:nullable(date),date_label:nullable(text),
  credit:id,status:editorial,
  authorization:object({status:choice('granted','pending','denied'),scope:nullable(text)},['scope']),
  identifiable_people:choice('none','consented','unknown'),
  territory_ids:list(id),manager_ids:list(key),placements:list(choice(...photoPlacements))
 },['place','date','date_label','territory_ids','manager_ids','placements']))
});

export const contentSchemas={
 categories:categoriesSchema,sources:sourcesSchema,institution:institutionSchema,
 managers:managersSchema,population:populationSchema,investment:investmentSchema,photos:photosSchema
};
export const contentFiles=Object.fromEntries(Object.keys(contentSchemas).map(name=>[name,'content/'+name+'.json']));
