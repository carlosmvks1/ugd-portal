// Contrato público compartido por validación, build y descargas.
// Todo campo nuevo requiere revisión explícita antes de ser publicable.
const text={type:'string'};
const id={type:'string',minLength:1};
const count={type:'integer',minimum:0};
const positive={type:'integer',minimum:1};
const date={type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'};
const nullable=s=>({anyOf:[s,{type:'null'}]});
const list=items=>({type:'array',items});
const choice=(...values)=>({type:'string',enum:values});
const object=(properties,optional=[])=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties).filter(k=>!optional.includes(k))});
const verification=choice('official_verified','official_unverified','pending_UGD');
const level=choice('I','II');
const link={type:'string',pattern:'^https?://[^\\s]+$'};
const indicators=object(Object.fromEntries(['agreements_total','agreements_I','agreements_II','managers_I','population_I','municipalities_table','municipalities_narrative'].map(k=>[k,nullable(count)])));

export const snapshotSchema=object({
 snapshot_id:id,year:positive,revision:positive,period_start:date,period_end:date,
 cutoff_date:nullable(date),cutoff_note:text,published_at:nullable(date),imported_at:date,
 status:choice('provisional','approved','archived'),source_id:id,
 verification_status:verification,indicators,source_pages:list(positive),
 comparison:object({methodology_id:id,source_id:id,geography_version:id,periodicity:choice('annual')})
},['revision','comparison']);
export const coverageSchema=object({
 snapshot_id:id,territory_id:id,coverage_status:choice('reported','not_covered','unknown'),
 care_level:level,population_covered:nullable(count),men:nullable(count),women:nullable(count),
 manager_id:nullable(id),agreement_ids:list(id),source_id:nullable(id),source_page:nullable(positive),
 source_row:nullable(positive),source_name:nullable(text),manager_label_raw:nullable(text),
 verification_status:verification,scope_note:nullable(text)
},['source_page','source_row','source_name','manager_label_raw','scope_note']);
export const explorerSchema=object({
 schema_version:{const:'territorial-1'},provenance:text,
 territories:list(object({territory_id:id,official_code:id,name:id,type:choice('department','municipality'),parent_id:nullable(id),source_id:id,source_pcode:id})),
 snapshots:list(snapshotSchema),coverage:list(coverageSchema),
 departments:list(object({snapshot_id:id,territory_id:id,municipalities_total:positive,municipalities_reported:count,source_id:id,source_page:positive,verification_status:verification})),
 sources:list(object({source_id:id,title:id,url:link,publisher:id,pages:nullable(list(positive)),retrieved_at:date,valid_on:nullable(date),license:nullable(id),license_url:nullable(link)},['pages','valid_on','license','license_url'])),
 data_quality_issues:list(object({issue_id:id,status:choice('open','resolved'),severity:choice('info','warning','error'),detail:id,source_id:id,territory_id:id,page:positive,pages:list(positive),source_geometry:id},['territory_id','page','pages','source_geometry'])),
 managers:list(object({manager_id:id,source_label:id,legal_name:nullable(id),verification_status:verification,source_id:id,note:text,type:id},['type'])),
 agreements:list(object({agreement_id:id,snapshot_id:id,manager_id:id,care_level:level,valid_from:date,valid_to:nullable(date),status:choice('active','expired','terminated','pending'),source_id:id,document_url:nullable(link),verification_status:verification})),
 equivalences:list(object({source_name:id,department_code:id,official_code:id,canonical_name:id,method:choice('explicit_reviewed_crosswalk')}))
});

// Proyección defensiva: nunca propagar propiedades desconocidas, incluso si
// una fuente de ejecución no ha pasado por nuestro build.
export function publicFields(value,schema){
 if(value==null)return value;
 if(schema.anyOf)return publicFields(value,schema.anyOf.find(s=>s.type!=='null'));
 if(schema.type==='array')return value.map(v=>publicFields(v,schema.items));
 if(schema.type==='object')return Object.fromEntries(Object.entries(schema.properties)
  .filter(([key])=>Object.hasOwn(value,key)).map(([key,s])=>[key,publicFields(value[key],s)]));
 return value;
}
export const publicArchive=data=>publicFields(data,explorerSchema);
