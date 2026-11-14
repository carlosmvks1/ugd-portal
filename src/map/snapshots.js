// Una sola política para portada, consulta por año y versión predeterminada.
const compareId=new Intl.Collator('en',{numeric:true,sensitivity:'variant'}).compare;
export function latestSnapshot(snapshots,year=''){
 return snapshots.filter(s=>!year||String(s.year)===String(year)).sort((a,b)=>
  b.year-a.year||b.period_end.localeCompare(a.period_end)||(b.revision??0)-(a.revision??0)||
  (b.published_at??'').localeCompare(a.published_at??'')||b.imported_at.localeCompare(a.imported_at)||
  compareId(b.snapshot_id,a.snapshot_id))[0];
}
export const verificationLabels={official_verified:'Verificado oficialmente',official_unverified:'Pendiente de verificación oficial',pending_UGD:'Pendiente de validación UGD'};
export function snapshotNotice(snapshot){
 if(!snapshot)return '';
 const status={provisional:'Datos provisionales',approved:'Datos aprobados',archived:'Datos históricos'}[snapshot.status]||'Estado no disponible';
 return status+' · '+(verificationLabels[snapshot.verification_status]||'Verificación no disponible');
}
