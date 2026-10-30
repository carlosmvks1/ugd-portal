const fmt=new Intl.NumberFormat('es-HN');
const $=selector=>document.querySelector(selector);

function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}

function demoRecord(data){
  const row=data.coverage.find(r=>r.snapshot_id==='2024-v1'&&r.territory_id==='1301');
  const territory=data.territories.find(t=>t.official_code==='1301');
  const parent=data.territories.find(t=>t.official_code===territory?.parent_id);
  const source=data.sources.find(s=>s.source_id===row?.source_id);
  return {row,territory,parent,source};
}

function renderConcept(data){
  const {row,territory,parent,source}=demoRecord(data);
  if(!row||!territory)return;
  const manager=row.manager_label_raw||'Etiqueta no disponible';
  const territoryLabel=territory.name+(parent?' · '+parent.name:'');
  $('#demo-manager-name').textContent=manager;
  $('#demo-territory').textContent=territoryLabel;
  $('#demo-care').textContent='Nivel '+row.care_level;
  $('#demo-population').textContent=row.population_covered==null?'Sin dato':fmt.format(row.population_covered);
  $('#demo-source').textContent=(source?.title||row.source_id)+' · página '+row.source_page;
  $('#demo-agreement-manager').textContent=manager+' · etiqueta en fuente';
  $('#demo-agreement-territory').textContent=territoryLabel;
}

function initGuide(){
  const steps=[
    {target:'#inicio',title:'1. Apertura: visión + cifras'},
    {target:'#cobertura',title:'2. Mapa: territorio + evidencia'},
    {target:'#fichas-prototipo',title:'3. Fichas: gestor + convenio'},
    {target:'#datos-ugd',title:'4. Lo que necesitamos de UGD'}
  ];
  let index=0;
  const guide=$('#demo-guide'),title=$('#demo-step-title'),count=$('#demo-step-count');
  const update=()=>{
    title.textContent=steps[index].title;
    count.textContent=(index+1)+' / '+steps.length;
    $('#demo-prev').disabled=index===0;
    $('#demo-next').textContent=index===steps.length-1?'Volver al inicio':'Siguiente';
  };
  const go=next=>{
    index=next;
    if(index>=steps.length)index=0;
    if(index<0)index=0;
    update();
    $(steps[index].target)?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
  };
  $('#demo-prev').onclick=()=>go(index-1);
  $('#demo-next').onclick=()=>go(index+1);
  guide.hidden=false;
  update();
}

export function initPresentationPrototype(data){
  const params=new URLSearchParams(location.search);
  if(params.get('demo')!=='1')return;
  document.documentElement.dataset.demo='true';
  document.querySelectorAll('.demo-only').forEach(el=>el.hidden=false);
  renderConcept(data);
  initGuide();
}
