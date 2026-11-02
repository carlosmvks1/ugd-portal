import {latestSnapshot} from '../map/snapshots.js';
export const metrics=[
 {key:'agreements_total',label:'Convenios reportados',unit:'convenios',definition:'Total agregado publicado en la fuente; no equivale a un padrón de expedientes individuales.'},
 {key:'agreements_I',label:'Convenios de nivel I',unit:'convenios',definition:'Convenios reportados para el primer nivel de atención.'},
 {key:'agreements_II',label:'Convenios de nivel II',unit:'convenios',definition:'Convenios reportados para el segundo nivel de atención.'},
 {key:'municipalities_table',label:'Municipios según tabla',unit:'municipios',definition:'Cifra agregada de la tabla de la fuente, conservada separada de la narrativa.'},
 {key:'municipalities_narrative',label:'Municipios según texto',unit:'municipios',definition:'Cifra narrativa de la fuente; no sustituye la cifra de la tabla.'},
 {key:'population_I',label:'Población publicada · nivel I',unit:'habitantes',definition:'Total nacional publicado para el nivel I. No se obtiene sumando registros potencialmente superpuestos.'}
];
export function series(data,key){
 return [...new Set(data.snapshots.map(s=>s.year))].sort((a,b)=>a-b).map(year=>{
  const s=latestSnapshot(data.snapshots,String(year));return {snapshot_id:s.snapshot_id,year,value:s.indicators?.[key]??null,source_id:s.source_id,verification_status:s.verification_status};
 });
}
export function comparable(from,to){
 if(!from||!to)return 'Se necesitan dos períodos disponibles.';
 if(from.snapshot_id===to.snapshot_id||from.year===to.year)return 'Las revisiones de un mismo año no constituyen una tendencia entre períodos.';
 if(from.year>to.year)return 'Seleccione primero el período anterior.';
 if(![from,to].every(s=>['approved','archived'].includes(s.status)&&s.verification_status==='official_verified'))return 'Ambos períodos deben estar aprobados y verificados oficialmente.';
 if(!from.comparison||!to.comparison)return 'Falta documentar la metodología de comparación de ambos períodos.';
 for(const key of ['methodology_id','geography_version','periodicity'])if(from.comparison[key]!==to.comparison[key])return 'La metodología, geografía o periodicidad de los períodos no coincide.';
 return '';
}
export function comparison(data,fromId,toId){
 const from=data.snapshots.find(s=>s.snapshot_id===fromId),to=data.snapshots.find(s=>s.snapshot_id===toId),reason=comparable(from,to);
 return metrics.map(metric=>{
  const a=from?.indicators?.[metric.key]??null,b=to?.indicators?.[metric.key]??null;
  const explanation=reason||(a===null||b===null?'Falta el valor publicado de este indicador.':'');
  return {metric:metric.key,label:metric.label,unit:metric.unit,from_snapshot:from?.snapshot_id??'',to_snapshot:to?.snapshot_id??'',from_value:a,to_value:b,absolute:explanation?null:b-a,percent:explanation||a===0?null:(b-a)/a*100,comparable:!explanation,reason:explanation||(a===0?'La variación porcentual no se define con una base cero.':''),from_source:from?.source_id??'',to_source:to?.source_id??''};
 });
}
export function qualityAlerts(data){
 const latest=latestSnapshot(data.snapshots),alerts=[];
 if(!latest)return [{kind:'missing',title:'Sin períodos registrados',detail:'No hay una base para calcular indicadores.'}];
 if(latest.status==='provisional'||latest.verification_status!=='official_verified')alerts.push({kind:'verification',title:'Validación pendiente',detail:`El período ${latest.year} no está certificado como aprobado y verificado.`});
 if(!latest.published_at)alerts.push({kind:'publication',title:'Fecha de publicación sin registrar',detail:'La fecha de importación o consulta no acredita la fecha de publicación institucional.'});
 if(!latest.cutoff_date)alerts.push({kind:'cutoff',title:'Sin fecha exacta de corte',detail:latest.cutoff_note||'El período anual no acredita un día exacto de cierre.'});
 const a=latest.indicators?.municipalities_narrative,b=latest.indicators?.municipalities_table;
 if(a!=null&&b!=null&&a!==b)alerts.push({kind:'discrepancy',title:'Diferencia en municipios reportados',detail:`${a} en el texto y ${b} en la tabla. Se conservan ambas cifras.`});
 const open=data.data_quality_issues.filter(i=>i.status==='open');if(open.length)alerts.push({kind:'quality',title:`${open.length} observaciones abiertas`,detail:'Consulte el registro de fuentes y calidad del dato para conocer su alcance.'});
 if(!data.agreements.some(a=>a.snapshot_id===latest.snapshot_id))alerts.push({kind:'agreements',title:'Padrón individual no disponible',detail:'No es posible determinar vencimientos a partir del total agregado de convenios.'});
 return alerts;
}
export function operationalAlerts(data,now=new Date()){
 const today=now.toISOString().slice(0,10),latest=latestSnapshot(data.snapshots);
 const agreements=data.agreements.filter(a=>a.snapshot_id===latest?.snapshot_id);
 const due=[];
 for(const a of agreements){
  if(a.status!=='active'||a.valid_from>today)continue;
  if(!a.valid_to){due.push({agreement_id:a.agreement_id,kind:'undated',days:null,detail:'Convenio activo sin fecha final registrada.'});continue;}
  const days=Math.round((Date.parse(a.valid_to+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
  if(days<=90)due.push({agreement_id:a.agreement_id,kind:days<0?'overdue':'due',days,detail:days<0?'La fecha final pasó, pero el estado sigue registrado como activo.':'Fecha final dentro de los próximos 90 días (incluido hoy).'});
 }
 return {as_of:today,snapshot_id:latest?.snapshot_id??null,scope:'Convenios individuales del último período disponible; no certifica vigencia actual.',individual_agreements:agreements.length,agreements_available:agreements.length>0,quality:qualityAlerts(data),due:due.sort((a,b)=>(a.days??Infinity)-(b.days??Infinity))};
}
