// Lógica pura del contenido institucional: proyección pública, validación de
// relaciones y consultas gestor ↔ territorio. Sin DOM; se usa en navegador,
// validate, build y pruebas.
import {isPublishable,publishableStates,itemRules,investmentDimensions,singlePlacements} from './contract.js';

export const editorialLabels={proposed:'Propuesto',collecting:'En recopilación',pending_verification:'Pendiente de verificación',
 verified:'Verificado documentalmente',approved:'Aprobado para publicación',published:'Publicado',outdated:'Desactualizado',withdrawn:'Retirado'};
export const emptyContent=()=>({
 categories:{entity_types:[],care_levels:[],management_levels:[],amount_types:[],population_definitions:[]},
 sources:{sources:[]},institution:{sections:{ugd:{blocks:[]},decentralization:{blocks:[]},contact:{blocks:[]}}},
 managers:{managers:[],assignments:[]},population:{periods:[]},investment:{datasets:[]},photos:{photos:[]}
});

// Una fotografía solo es publicable con autorización de uso y sin personas
// identificables sin consentimiento documentado.
export const photoAllowed=p=>p.authorization?.status==='granted'&&['none','consented'].includes(p.identifiable_people);
export const photoPublishable=p=>isPublishable(p)&&photoAllowed(p);

// Proyección para el artefacto público: retira piezas no aprobadas en lugar de
// ocultarlas en la interfaz. Los bloques pendientes conservan solo su rótulo.
export function publicContent(bundle){
 const c=structuredClone(bundle);
 for(const group of Object.keys(c.categories))if(Array.isArray(c.categories[group]))c.categories[group]=c.categories[group].filter(isPublishable);
 c.sources.sources=c.sources.sources.filter(isPublishable);
 for(const section of Object.values(c.institution.sections))section.blocks=section.blocks.map(b=>isPublishable(b)?b:
  {block_id:b.block_id,kind:b.kind,title:b.title,status:b.status,placeholder:b.placeholder});
 c.managers.managers=c.managers.managers.filter(isPublishable);
 const managers=new Set(c.managers.managers.map(m=>m.manager_id));
 c.managers.assignments=c.managers.assignments.filter(a=>isPublishable(a)&&managers.has(a.manager_id));
 c.population.periods=c.population.periods.filter(isPublishable);
 c.investment.datasets=c.investment.datasets.filter(d=>isPublishable(d)&&(d.scope.type!=='manager'||managers.has(d.scope.id)));
 c.photos.photos=c.photos.photos.filter(photoPublishable).map(p=>({...p,manager_ids:(p.manager_ids||[]).filter(id=>managers.has(id))}));
 // Logotipo: solo aprobado y con autorización de uso.
 if(c.institution.brand&&!(isPublishable(c.institution.brand)&&c.institution.brand.authorization?.status==='granted'))delete c.institution.brand;
 return c;
}

// Relaciones entre archivos. Devuelve una lista de errores legibles; vacía si
// el contenido es coherente. «archive» es el archivo territorial (o null).
export function contentErrors(bundle,archive,{allowSynthetic=false}={}){
 const errors=[],fail=message=>errors.push(message);
 if(!allowSynthetic)for(const [name,file] of Object.entries(bundle))if(file?.synthetic)fail(`${name}: contenido sintético no admitido en data/content`);
 const unique=(rows,field,label)=>{const seen=new Set();for(const r of rows){if(seen.has(r[field]))fail(`${label}: identificador duplicado ${r[field]}`);seen.add(r[field]);}return seen;};
 const cat=Object.fromEntries(Object.entries(bundle.categories).filter(([,v])=>Array.isArray(v)).map(([group,rows])=>[group,unique(rows,'key','categorías '+group)]));
 const sources=unique(bundle.sources.sources,'source_id','fuentes');
 const sourceStatus=new Map(bundle.sources.sources.map(s=>[s.source_id,s.status]));
 const archiveSources=new Set((archive?.sources||[]).map(s=>s.source_id));
 const snapshots=new Set((archive?.snapshots||[]).map(s=>s.snapshot_id));
 const territories=new Set((archive?.territories||[]).map(t=>t.official_code));
 const departments=new Set((archive?.territories||[]).filter(t=>t.type==='department').map(t=>t.official_code));
 const archiveManagers=new Set((archive?.managers||[]).map(m=>m.manager_id));
 // Una pieza publicable solo puede citar fuentes también publicables.
 const source=(id,where,item)=>{
  if(archiveSources.has(id))return;
  if(!sources.has(id))return fail(`${where}: fuente inexistente ${id}`);
  if(isPublishable(item)&&!publishableStates.includes(sourceStatus.get(id)))fail(`${where}: cita la fuente ${id}, que no está aprobada`);
 };
 const category=(group,value,where)=>{if(value!=null&&!cat[group]?.has(value))fail(`${where}: categoría «${value}» no configurada en categories.${group}`);};
 const snapshot=(id,where)=>{if(archive&&id!=null&&!snapshots.has(id))fail(`${where}: período (snapshot) inexistente ${id}`);};
 const territory=(id,where)=>{if(archive&&!territories.has(id))fail(`${where}: territorio inexistente ${id}`);};
 const period=(p,where)=>{if(p.start>p.end)fail(`${where}: período con inicio posterior al fin`);};

 for(const [name,section] of Object.entries(bundle.institution.sections)){
  unique(section.blocks,'block_id','institution.'+name);
  for(const b of section.blocks){
   const where=`institution.${name}.${b.block_id}`;
   for(const id of b.source_ids||[])source(id,where,b);
   for(const [i,it] of (b.items||[]).entries())for(const field of itemRules[b.kind])if(it[field]==null||it[field]==='')fail(`${where}.items[${i}]: falta ${field} (tipo ${b.kind})`);
   if(b.kind==='channels')for(const it of b.items||[])if(it.type==='email'&&!/^[^\s@]+@[^\s@]+$/.test(it.value))fail(`${where}: correo inválido ${it.value}`);
   if(isPublishable(b)&&!(b.paragraphs?.length||b.items?.length))fail(`${where}: bloque aprobado sin contenido`);
   if(b.kind==='profile'){
    if((b.items||[]).length>1)fail(`${where}: el bloque de dirección admite una sola persona`);
    for(const it of b.items||[]){
     for(const c of it.contact||[])if(c.type==='email'&&!/^[^\s@]+@[^\s@]+$/.test(c.value))fail(`${where}: correo inválido ${c.value}`);
     if(it.photo_id==null)continue;
     const photo=bundle.photos.photos.find(p=>p.photo_id===it.photo_id);
     if(!photo)fail(`${where}: retrato inexistente ${it.photo_id}`);
     // El retrato es adicional a las fotografías de los equipos: no ocupa lugares narrativos.
     else if(photo.placements?.length)fail(`${where}: el retrato ${it.photo_id} no debe tener «placements»`);
    }
   }
  }
 }
 const brand=bundle.institution.brand;
 if(brand&&isPublishable(brand)&&brand.authorization.status!=='granted')fail('institution.brand: logotipo aprobado sin autorización de uso');

 const managers=unique(bundle.managers.managers,'manager_id','gestores');
 for(const m of bundle.managers.managers){
  const where='managers.'+m.manager_id;
  category('entity_types',m.entity_type,where);
  for(const id of m.source_ids)source(id,where,m);
  if(isPublishable(m)&&!m.source_ids.length)fail(`${where}: gestor aprobado sin fuente`);
  for(const label of m.archive_labels||[])if(archive&&!archiveManagers.has(label))fail(`${where}: etiqueta histórica inexistente ${label}`);
  for(const [i,p] of (m.population||[]).entries()){
   const at=`${where}.population[${i}]`;period(p.period,at);snapshot(p.snapshot_id,at);source(p.source_id,at,m);
   category('care_levels',p.care_level,at);category('population_definitions',p.definition,at);
  }
  for(const c of m.contact||[])if(c.type==='email'&&!/^[^\s@]+@[^\s@]+$/.test(c.value))fail(`${where}: correo inválido ${c.value}`);
 }
 const links=new Set();
 for(const [i,a] of bundle.managers.assignments.entries()){
  const where=`managers.assignments[${i}]`;
  if(!managers.has(a.manager_id))fail(`${where}: gestor inexistente ${a.manager_id}`);
  territory(a.territory_id,where);snapshot(a.snapshot_id,where);source(a.source_id,where,a);category('care_levels',a.care_level,where);
  const k=[a.manager_id,a.territory_id,a.snapshot_id,a.care_level].join('/');if(links.has(k))fail(`${where}: vínculo duplicado ${k}`);links.add(k);
  const m=bundle.managers.managers.find(x=>x.manager_id===a.manager_id);
  if(m&&isPublishable(a)&&!isPublishable(m))fail(`${where}: vínculo aprobado para un gestor no aprobado`);
 }

 unique(bundle.population.periods,'snapshot_id','population.periods');
 for(const p of bundle.population.periods){snapshot(p.snapshot_id,'population.'+p.snapshot_id);category('population_definitions',p.definition,'population.'+p.snapshot_id);}

 unique(bundle.investment.datasets,'dataset_id','inversión');
 for(const d of bundle.investment.datasets){
  const where='investment.'+d.dataset_id,group=d.dimension==='management_level'?'management_levels':'care_levels';
  if(!investmentDimensions.includes(d.dimension))fail(`${where}: dimensión inválida`);
  period(d.period,where);category('amount_types',d.amount_type,where);
  for(const id of d.source_ids)source(id,where,d);
  if(!d.source_ids.length)fail(`${where}: conjunto sin fuente`);
  unique(d.rows,'category',where);
  for(const r of d.rows)category(group,r.category,where);
  if(d.scope.type==='national'&&d.scope.id!==null)fail(`${where}: alcance nacional sin identificador`);
  if(d.scope.type==='department'&&archive&&!departments.has(d.scope.id))fail(`${where}: departamento inexistente ${d.scope.id}`);
  if(d.scope.type==='manager'&&!managers.has(d.scope.id))fail(`${where}: gestor inexistente ${d.scope.id}`);
 }

 unique(bundle.photos.photos,'photo_id','fotografías');
 for(const p of bundle.photos.photos){
  const where='photos.'+p.photo_id;
  if(isPublishable(p)&&p.authorization.status!=='granted')fail(`${where}: aprobada sin autorización de uso`);
  if(isPublishable(p)&&!['none','consented'].includes(p.identifiable_people))fail(`${where}: aprobada con personas identificables sin consentimiento documentado`);
  for(const id of p.territory_ids||[])territory(id,where);
  for(const id of p.manager_ids||[])if(!managers.has(id))fail(`${where}: gestor inexistente ${id}`);
  if(p.alt.trim()===p.description.trim())fail(`${where}: el texto alternativo debe describir la imagen, no repetir la descripción`);
  if((p.placements||[]).length>1)fail(`${where}: una fotografía ocupa un solo lugar de la página (placements), para no repetir imágenes`);
 }
 // Lugares de una sola imagen: como máximo una fotografía publicable en cada uno.
 for(const place of singlePlacements){
  const used=bundle.photos.photos.filter(p=>photoPublishable(p)&&p.placements?.includes(place));
  if(used.length>1)fail(`photos: el lugar «${place}» admite una fotografía; hay ${used.length} publicables (${used.map(p=>p.photo_id).join(', ')})`);
 }
 return errors;
}

// ---------- Consultas ----------
export const categoryLabel=(content,group,key)=>{
 if(key==null)return null;
 return content.categories[group]?.find(c=>c.key===key)?.label??null;
};
export const careLabel=(content,key)=>key==null?'Nivel de atención no especificado':categoryLabel(content,'care_levels',key)||'Nivel de atención '+key;
export const managerById=(content,id)=>content.managers.managers.find(m=>m.manager_id===id)||null;
const collator=new Intl.Collator('es',{sensitivity:'base',numeric:true});
export const sortManagers=managers=>[...managers].sort((a,b)=>collator.compare(a.name,b.name));

// Vínculos de un período y nivel. Sin nivel en el filtro, todos los niveles;
// con nivel, solo los registros de ese nivel (no se asume el nivel ausente).
export function assignmentsFor(content,{snapshot,care=''}){
 return content.managers.assignments.filter(a=>a.snapshot_id===snapshot&&(!care||a.care_level===care));
}
// Gestores vinculados a un territorio. Para un departamento incluye los
// vínculos departamentales y los de sus municipios, identificados como tales.
export function linksForTerritory(content,archive,state,code){
 const territory=archive.territories.find(t=>t.official_code===code);
 if(!territory)return [];
 const children=territory.type==='department'?new Set(archive.territories.filter(t=>t.parent_id===code).map(t=>t.official_code)):new Set();
 const rows=assignmentsFor(content,state).filter(a=>a.territory_id===code||children.has(a.territory_id));
 const byManager=new Map();
 for(const a of rows){
  const manager=managerById(content,a.manager_id);if(!manager)continue;
  const entry=byManager.get(a.manager_id)||{manager,direct:[],municipal:[]};
  (a.territory_id===code?entry.direct:entry.municipal).push(a);byManager.set(a.manager_id,entry);
 }
 return [...byManager.values()].sort((a,b)=>collator.compare(a.manager.name,b.manager.name));
}
// Territorios de un gestor, agrupados por período y nivel; nunca se mezclan.
export function territoriesForManager(content,archive,id){
 const groups=new Map();
 for(const a of content.managers.assignments.filter(a=>a.manager_id===id)){
  const k=a.snapshot_id+'\u0000'+(a.care_level??'');
  const g=groups.get(k)||{snapshot_id:a.snapshot_id,care_level:a.care_level,snapshot:archive?.snapshots.find(s=>s.snapshot_id===a.snapshot_id)||null,assignments:[]};
  g.assignments.push({...a,territory:archive?.territories.find(t=>t.official_code===a.territory_id)||null});groups.set(k,g);
 }
 const order=new Intl.Collator('en',{numeric:true}).compare;
 return [...groups.values()].sort((a,b)=>(b.snapshot?.period_end||'').localeCompare(a.snapshot?.period_end||'')||order(a.snapshot_id,b.snapshot_id)||String(a.care_level).localeCompare(String(b.care_level)))
  .map(g=>({...g,assignments:g.assignments.sort((x,y)=>order(x.territory_id,y.territory_id))}));
}
// Códigos a resaltar en el mapa para un gestor, período y nivel: municipios
// vinculados y departamentos con vínculo propio o en alguno de sus municipios.
export function highlightCodes(content,archive,state,id){
 const codes=new Set();
 for(const a of assignmentsFor(content,state).filter(a=>a.manager_id===id)){
  codes.add(a.territory_id);
  const t=archive.territories.find(x=>x.official_code===a.territory_id);
  if(t?.parent_id)codes.add(t.parent_id);
 }
 return codes;
}
// Gestores con algún vínculo en el período y nivel (para el selector del mapa).
export function managersInPeriod(content,state){
 const ids=new Set(assignmentsFor(content,state).map(a=>a.manager_id));
 return sortManagers(content.managers.managers.filter(m=>ids.has(m.manager_id)));
}
export const photosFor=(content,{manager,territory,placement})=>content.photos.photos.filter(p=>
 (!manager||(p.manager_ids||[]).includes(manager))&&(!territory||(p.territory_ids||[]).includes(territory))&&(!placement||(p.placements||[]).includes(placement)));

// Inversión: estado de completitud sin sumar ni repartir montos.
export function datasetState(dataset){
 if(!dataset.rows.length)return 'absent';
 const missing=dataset.rows.filter(r=>r.amount==null).length;
 return missing===0?'complete':missing===dataset.rows.length?'absent':'partial';
}
export function investmentFor(content,{dimension,scope='national',id=null}){
 return content.investment.datasets.filter(d=>(!dimension||d.dimension===dimension)&&d.scope.type===scope&&(scope==='national'||d.scope.id===id))
  .sort((a,b)=>b.period.end.localeCompare(a.period.end)||a.dataset_id.localeCompare(b.dataset_id));
}
export const populationPeriod=(content,snapshot)=>content.population.periods.find(p=>p.snapshot_id===snapshot)||null;
