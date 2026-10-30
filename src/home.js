const fmt=new Intl.NumberFormat('es-HN');
const safeUrl=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};

export function renderHome(data){
  const snapshot=[...data.snapshots].sort((a,b)=>(b.year-a.year)||String(b.snapshot_id).localeCompare(String(a.snapshot_id)))[0];
  const period=document.querySelector('#home-period');
  if(!snapshot){
    period.textContent='No hay un consolidado territorial cargado.';
    return;
  }

  const i=snapshot.indicators||{};
  document.querySelector('#kpi-agreements').textContent=i.agreements_total==null?'Sin dato':fmt.format(i.agreements_total);
  document.querySelector('#kpi-levels').textContent=(i.agreements_I==null||i.agreements_II==null)?'Sin dato':fmt.format(i.agreements_I)+' / '+fmt.format(i.agreements_II);
  document.querySelector('#kpi-municipalities').textContent=i.municipalities_narrative==null?'Sin dato':fmt.format(i.municipalities_narrative);
  document.querySelector('#kpi-population').textContent=i.population_I==null?'Sin dato':fmt.format(i.population_I);

  const municipalityNote=document.querySelector('#kpi-municipalities-note');
  if(i.municipalities_narrative!=null&&i.municipalities_table!=null&&i.municipalities_narrative!==i.municipalities_table){
    municipalityNote.textContent='Cifra narrativa oficial; la tabla departamental suma '+fmt.format(i.municipalities_table)+'.';
    municipalityNote.classList.add('quality-warning');
  }else municipalityNote.textContent='Municipios reportados en el consolidado';

  const source=data.sources.find(s=>s.source_id===snapshot.source_id);
  const link=source&&safeUrl(source.url)?' · Fuente: '+source.title:'';
  period.textContent='Último consolidado público cargado: '+snapshot.year+' · '+snapshot.status+' · '+snapshot.verification_status+link+'. No acredita situación actual.';
}
