const fmt=new Intl.NumberFormat('es-HN');
const safeUrl=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const verificationLabel=value=>({
  official_verified:'Verificado con fuente oficial',
  official_unverified:'Fuente oficial pendiente de validación',
  secondary_source:'Fuente secundaria',
  pending_UGD:'Pendiente de validación por UGD'
}[value]||value||'Sin estado de verificación');
const snapshotLabel=value=>({
  provisional:'Provisional',
  published:'Publicado',
  archived:'Histórico'
}[value]||value||'Sin estado');

const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function easeOutCubic(t){return 1-Math.pow(1-t,3);}

function animateNumber(element,target,{delay=0,duration=1050}={}){
  if(target==null){element.textContent='Sin dato';return Promise.resolve();}
  const final=fmt.format(target);
  element.setAttribute('aria-hidden','true');
  if(reducedMotion()){
    element.textContent=final;
    return Promise.resolve();
  }
  element.textContent='0';
  return new Promise(resolve=>{
    let start=null;
    const frame=timestamp=>{
      if(start===null)start=timestamp;
      const elapsed=timestamp-start;
      if(elapsed<delay){requestAnimationFrame(frame);return;}
      const progress=Math.min((elapsed-delay)/duration,1);
      element.textContent=fmt.format(Math.round(target*easeOutCubic(progress)));
      if(progress<1)requestAnimationFrame(frame);
      else{element.textContent=final;resolve();}
    };
    requestAnimationFrame(frame);
  });
}

function animatePair(element,left,right,{delay=0,duration=1050}={}){
  if(left==null||right==null){element.textContent='Sin dato';return Promise.resolve();}
  const final=fmt.format(left)+' / '+fmt.format(right);
  element.setAttribute('aria-hidden','true');
  if(reducedMotion()){
    element.textContent=final;
    return Promise.resolve();
  }
  element.textContent='0 / 0';
  return new Promise(resolve=>{
    let start=null;
    const frame=timestamp=>{
      if(start===null)start=timestamp;
      const elapsed=timestamp-start;
      if(elapsed<delay){requestAnimationFrame(frame);return;}
      const progress=Math.min((elapsed-delay)/duration,1),eased=easeOutCubic(progress);
      element.textContent=fmt.format(Math.round(left*eased))+' / '+fmt.format(Math.round(right*eased));
      if(progress<1)requestAnimationFrame(frame);
      else{element.textContent=final;resolve();}
    };
    requestAnimationFrame(frame);
  });
}

function accessibleKpi(element,label,value){
  const item=element.closest('.kpi-item');
  if(item)item.setAttribute('aria-label',label+': '+value);
}

export function renderHome(data){
  const snapshot=[...data.snapshots].sort((a,b)=>(b.year-a.year)||String(b.snapshot_id).localeCompare(String(a.snapshot_id)))[0];
  const period=document.querySelector('#home-period');
  if(!snapshot){
    period.textContent='No hay un consolidado territorial cargado.';
    return;
  }

  const i=snapshot.indicators||{};
  const agreements=document.querySelector('#kpi-agreements');
  const levels=document.querySelector('#kpi-levels');
  const municipalities=document.querySelector('#kpi-municipalities');
  const population=document.querySelector('#kpi-population');

  accessibleKpi(agreements,'Convenios',i.agreements_total==null?'Sin dato':fmt.format(i.agreements_total));
  accessibleKpi(levels,'Convenios por nivel I y II',(i.agreements_I==null||i.agreements_II==null)?'Sin dato':fmt.format(i.agreements_I)+' y '+fmt.format(i.agreements_II));
  accessibleKpi(municipalities,'Municipios',i.municipalities_narrative==null?'Sin dato':fmt.format(i.municipalities_narrative));
  accessibleKpi(population,'Población reportada en primer nivel',i.population_I==null?'Sin dato':fmt.format(i.population_I));

  animateNumber(agreements,i.agreements_total,{delay:0});
  animatePair(levels,i.agreements_I,i.agreements_II,{delay:80});
  animateNumber(municipalities,i.municipalities_narrative,{delay:160});
  animateNumber(population,i.population_I,{delay:240,duration:1150});

  const municipalityNote=document.querySelector('#kpi-municipalities-note');
  if(i.municipalities_narrative!=null&&i.municipalities_table!=null&&i.municipalities_narrative!==i.municipalities_table){
    municipalityNote.textContent='Cifra narrativa oficial; la tabla departamental suma '+fmt.format(i.municipalities_table)+'.';
    municipalityNote.classList.add('quality-warning');
  }else municipalityNote.textContent='Municipios reportados en el consolidado';

  const source=data.sources.find(s=>s.source_id===snapshot.source_id);
  const sourceText=source&&safeUrl(source.url)?' · Fuente: '+source.title:'';
  period.textContent='Último consolidado público cargado: '+snapshot.year+' · '+snapshotLabel(snapshot.status)+' · '+verificationLabel(snapshot.verification_status)+sourceText+'. No acredita situación actual.';
}
