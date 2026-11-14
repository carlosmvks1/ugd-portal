// Genera los EJEMPLOS SINTÉTICOS usados por las pruebas y por
// `npm run preview:synthetic`. Todo es ficticio y está rotulado «[SINTÉTICO]».
// Estos archivos viven en tests/fixtures y nunca se copian a dist/:
// validate/build rechazan "synthetic": true en data/content y el build
// público falla si encuentra la marca en el artefacto.
// Uso: node tests/fixtures/synthetic/generate.mjs
import {writeFile,mkdir} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const here=new URL('./',import.meta.url);
const S='[SINTÉTICO] ';
const head=version=>({schema_version:version,synthetic:true});
const ok='approved';

// PNG mínimo sin dependencias: franjas de color con un recuadro claro.
function png(width,height,[r,g,b]){
 const raw=Buffer.alloc((width*3+1)*height);
 for(let y=0;y<height;y++){
  raw[y*(width*3+1)]=0;
  for(let x=0;x<width;x++){
   const o=y*(width*3+1)+1+x*3,band=((x+y)>>5)&1,box=x>width*.3&&x<width*.7&&y>height*.3&&y<height*.7;
   raw[o]=box?240:r-band*30;raw[o+1]=box?244:g-band*30;raw[o+2]=box?242:b-band*30;
  }
 }
 const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 const crc=buf=>{let c=0xffffffff;for(const byte of buf)c=crcTable[(c^byte)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;};
 const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([len,td,c]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}

const categories={...head('categories-1'),
 entity_types:[{key:'sint-asociacion',label:S+'Asociación',description:'Categoría ficticia.',status:ok},{key:'sint-mancomunidad',label:S+'Mancomunidad',status:ok}],
 care_levels:[{key:'I',label:S+'Primer nivel de atención',status:ok},{key:'II',label:S+'Segundo nivel de atención',status:ok}],
 management_levels:[{key:'sint-central',label:S+'Gestión central',status:ok},{key:'sint-regional',label:S+'Gestión regional',status:ok},{key:'sint-local',label:S+'Gestión local',status:ok}],
 amount_types:[{key:'sint-transferido',label:S+'Monto transferido',status:ok}],
 population_definitions:[{key:'sint-asignada',label:S+'Población asignada',description:'Definición ficticia.',status:ok}]};
const sources={...head('content-sources-1'),sources:[
 {source_id:'sint-fuente-a',title:S+'Informe ficticio de gestión',publisher:S+'Unidad ficticia',date:'2025-03-01',url:'https://example.org/sintetico/informe',status:ok},
 {source_id:'sint-fuente-pendiente',title:S+'Fuente pendiente',publisher:S+'Unidad ficticia',status:'collecting'}]};
const institution={...head('institution-1'),sections:{
 ugd:{blocks:[
  {block_id:'presentacion',kind:'text',title:'Qué es la UGD',status:ok,placeholder:'Presentación institucional.',paragraphs:[S+'Párrafo ficticio de presentación para comprobar el formato.',S+'Segundo párrafo ficticio.'],source_ids:['sint-fuente-a'],reference_date:'2025-03-01'},
  {block_id:'funciones',kind:'list',title:'Funciones',status:ok,placeholder:'Funciones.',items:[{title:S+'Función ficticia uno',text:'Descripción ficticia.'},{title:S+'Función ficticia dos'}],source_ids:['sint-fuente-a']},
  {block_id:'estructura',kind:'list',title:'Estructura',status:'collecting',placeholder:'Organización de la unidad y su coordinación.'},
  {block_id:'autoridades',kind:'people',title:'Autoridades',status:ok,placeholder:'Autoridades.',items:[{name:S+'Persona ficticia',role:S+'Cargo ficticio',since:'2025-01-01'}],source_ids:['sint-fuente-a']},
  {block_id:'fundamento-legal',kind:'legal',title:'Fundamento legal',status:'outdated',placeholder:'Normas.',items:[{title:S+'Norma ficticia',issuer:S+'Emisor ficticio',number:'0000',date:'2020-01-01',url:'https://example.org/sintetico/norma',validity:'unknown'}],source_ids:['sint-fuente-a']}]},
 decentralization:{blocks:[
  {block_id:'secretaria',kind:'text',title:'La Secretaría de Salud',status:ok,placeholder:'Papel de la Secretaría.',paragraphs:[S+'Texto ficticio del paso uno.']},
  {block_id:'gestores',kind:'text',title:'Los gestores',status:ok,placeholder:'Qué es un gestor.',paragraphs:[S+'Texto ficticio del paso dos.']},
  {block_id:'servicios',kind:'text',title:'Los servicios en el territorio',status:'pending_verification',placeholder:'Cómo llegan los servicios.',paragraphs:[S+'Borrador no aprobado: solo visible en vista previa.']},
  {block_id:'papel-ugd',kind:'text',title:'El papel de la UGD',status:'collecting',placeholder:'Qué hace la UGD dentro del modelo.'}]},
 contact:{blocks:[
  {block_id:'direccion',kind:'channels',title:'Dirección',status:ok,placeholder:'Dirección.',items:[{type:'address',label:'Oficina',value:S+'Dirección ficticia'}]},
  {block_id:'telefono',kind:'channels',title:'Teléfono',status:ok,placeholder:'Teléfono.',items:[{type:'phone',label:'Central',value:'+504 0000-0000',note:S+'Horario ficticio'}]},
  {block_id:'correo',kind:'channels',title:'Correo electrónico',status:ok,placeholder:'Correo.',items:[{type:'email',label:'Consultas',value:'sintetico@example.org'}]}]}}};

const manager=(id,name,extra={})=>({manager_id:id,name,status:ok,verification_status:'pending_UGD',source_ids:['sint-fuente-a'],...extra});
const link=(manager_id,territory_id,snapshot_id='2024-v1',care_level='I',extra={})=>({manager_id,territory_id,snapshot_id,care_level,status:ok,verification_status:'pending_UGD',source_id:'sint-fuente-a',...extra});
const longName=S+'Asociación Intermunicipal de Desarrollo Comunitario y Gestión Descentralizada de Servicios de Salud del Occidente y Sur de Lempira, Intibucá y La Paz';
const lempira=Array.from({length:28},(_,i)=>'13'+String(i+1).padStart(2,'0'));
const atlantida=Array.from({length:8},(_,i)=>'01'+String(i+1).padStart(2,'0'));
const intibuca=Array.from({length:17},(_,i)=>'10'+String(i+1).padStart(2,'0'));
const managers={...head('managers-1'),
 managers:[
  manager('sint-gestor-largo',longName,{short_name:S+'AIDC',entity_type:'sint-asociacion',description:S+'Descripción ficticia de una entidad gestora.',scope:S+'Ámbito ficticio: primer nivel de atención en municipios del occidente.',archive_labels:['label-001'],
   contact:[{type:'email',label:'Correo institucional',value:'gestor@example.org'},{type:'website',label:'Sitio web',value:'https://example.org/sintetico/gestor'}],
   population:[
    {value:52340,period:{start:'2024-01-01',end:'2024-12-31'},snapshot_id:'2024-v1',care_level:'I',definition:'sint-asignada',source_id:'sint-fuente-a',verification_status:'pending_UGD'},
    {value:null,period:{start:'2025-01-01',end:'2025-12-31'},snapshot_id:'sint-2025',care_level:'I',definition:null,source_id:'sint-fuente-a',verification_status:'pending_UGD',note:S+'La fuente no reporta población para este período.'}]}),
  manager('sint-gestor-compartido',S+'Mancomunidad ficticia compartida',{entity_type:'sint-mancomunidad'}),
  manager('sint-gestor-2025',S+'Gestor solo en 2025',{entity_type:'sint-asociacion'}),
  manager('sint-gestor-parcial',S+'Gestor con datos parciales',{verification_status:'official_unverified',note:S+'Identidad jurídica pendiente de confirmación.'}),
  manager('sint-gestor-extenso',S+'Gestor con muchos territorios',{entity_type:'sint-mancomunidad'}),
  manager('sint-gestor-pendiente',S+'Gestor no aprobado',{status:'collecting'}),
  ...Array.from({length:30},(_,i)=>manager('sint-gestor-lista-'+String(i+1).padStart(2,'0'),S+'Gestor de lista '+String(i+1).padStart(2,'0'),{entity_type:i%2?'sint-asociacion':'sint-mancomunidad'}))],
 assignments:[
  ...['1301','1302','1303'].map(code=>link('sint-gestor-largo',code)),
  link('sint-gestor-largo','1301','sint-2025'),
  link('sint-gestor-compartido','1301'),link('sint-gestor-compartido','13',undefined,'I',{note:S+'Vínculo de alcance departamental.'}),link('sint-gestor-compartido','1302','2024-v1','II'),
  link('sint-gestor-2025','1305','sint-2025'),link('sint-gestor-2025','0101','sint-2025'),
  ...[...lempira.slice(5),...intibuca].map(code=>link('sint-gestor-extenso',code)),
  link('sint-gestor-pendiente','1304',undefined,'I',{status:'collecting'}),
  ...Array.from({length:30},(_,i)=>link('sint-gestor-lista-'+String(i+1).padStart(2,'0'),atlantida[i%atlantida.length]))]};
const population={...head('population-1'),periods:[
 {snapshot_id:'2024-v1',definition:'sint-asignada',unit:'personas',note:S+'Nota ficticia sobre la definición de población.',status:ok},
 {snapshot_id:'sint-2025',definition:null,status:ok}]};
const dataset=(id,title,dimension,start,rows,extra={})=>({dataset_id:id,title,dimension,status:ok,verification_status:'pending_UGD',period:{start,end:start.slice(0,4)+'-12-31'},currency:'HNL',amount_type:'sint-transferido',definition:S+'Definición ficticia del monto.',source_ids:['sint-fuente-a'],scope:{type:'national',id:null},rows,...extra});
const investment={...head('investment-1'),datasets:[
 dataset('sint-gestion-2024',S+'Inversión por nivel de gestión','management_level','2024-01-01',[{category:'sint-central',amount:1250000.5},{category:'sint-regional',amount:830000},{category:'sint-local',amount:0}],{reported_total:2080000.5,notes:[S+'Un monto 0 indica cero reportado; no es ausencia de dato.']}),
 dataset('sint-gestion-2025',S+'Inversión por nivel de gestión','management_level','2025-01-01',[{category:'sint-central',amount:990000},{category:'sint-regional',amount:null,note:S+'Pendiente de reporte'},{category:'sint-local',amount:410000}]),
 dataset('sint-atencion-2024',S+'Inversión por nivel de atención','care_level','2024-01-01',[{category:'I',amount:2400000},{category:'II',amount:null}]),
 dataset('sint-depto-13',S+'Inversión atribuida a Lempira','management_level','2024-01-01',[{category:'sint-regional',amount:150000}],{scope:{type:'department',id:'13'}}),
 dataset('sint-gestor-largo-2024',S+'Inversión atribuida al gestor','care_level','2024-01-01',[{category:'I',amount:75000}],{scope:{type:'manager',id:'sint-gestor-largo'}}),
 dataset('sint-pendiente',S+'Conjunto no aprobado','care_level','2024-01-01',[{category:'I',amount:1}],{status:'collecting'})]};
const photos={...head('photos-1'),photos:[
 {photo_id:'sint-foto-equipo',src:'media/sintetico/equipo.png',width:800,height:600,alt:S+'Rectángulo verde con un recuadro claro en el centro',description:S+'Imagen de prueba que representa a un equipo de salud',place:'Gracias, Lempira',date:'2025-02-14',credit:S+'Autoría ficticia',status:ok,authorization:{status:'granted',scope:S+'Uso en el portal'},identifiable_people:'none',territory_ids:['1301'],manager_ids:['sint-gestor-largo'],placements:['home','teams']},
 {photo_id:'sint-foto-sin-lugar',src:'media/sintetico/sin-lugar.png',width:800,height:600,alt:S+'Rectángulo azul con un recuadro claro en el centro',description:S+'Imagen de prueba sin lugar ni fecha',credit:S+'Autoría ficticia',status:ok,authorization:{status:'granted'},identifiable_people:'none',placements:['teams']},
 {photo_id:'sint-foto-sin-autorizacion',src:'media/sintetico/no-existe.png',width:800,height:600,alt:S+'Imagen sin autorización',description:S+'No debe publicarse',credit:S+'Autoría ficticia',status:'collecting',authorization:{status:'pending'},identifiable_people:'unknown',placements:['teams']}]};

// Período territorial ficticio añadido al archivo histórico solo en pruebas.
const archiveExtra={synthetic:true,
 sources:[{source_id:'sint-fuente-territorial',title:S+'Fuente territorial ficticia',url:'https://example.org/sintetico/territorial',publisher:S+'Emisor ficticio',retrieved_at:'2026-11-14'}],
 snapshots:[{snapshot_id:'sint-2025',year:2025,period_start:'2025-01-01',period_end:'2025-12-31',cutoff_date:null,cutoff_note:S+'Período ficticio para pruebas.',published_at:null,imported_at:'2026-11-14',status:'provisional',source_id:'sint-fuente-territorial',verification_status:'pending_UGD',
  indicators:{agreements_total:null,agreements_I:null,agreements_II:null,managers_I:null,population_I:null,municipalities_table:null,municipalities_narrative:null},source_pages:[1]}],
 coverage:[['1301',11111],['1305',22222],['0101',33333]].map(([territory_id,population_covered],i)=>({snapshot_id:'sint-2025',territory_id,coverage_status:'reported',care_level:'I',population_covered,men:null,women:null,manager_id:null,agreement_ids:[],source_id:'sint-fuente-territorial',source_page:1,source_row:i+1,verification_status:'pending_UGD'}))};

await mkdir(new URL('content/',here),{recursive:true});
await mkdir(new URL('media/sintetico/',here),{recursive:true});
for(const [name,value] of Object.entries({categories,sources,institution,managers,population,investment,photos}))
 await writeFile(new URL('content/'+name+'.json',here),JSON.stringify(value,null,1)+'\n');
await writeFile(new URL('archive-extra.json',here),JSON.stringify(archiveExtra,null,1)+'\n');
await writeFile(new URL('media/sintetico/equipo.png',here),png(800,600,[90,150,120]));
await writeFile(new URL('media/sintetico/sin-lugar.png',here),png(800,600,[80,120,170]));
console.log('Ejemplos sintéticos generados en tests/fixtures/synthetic/');
