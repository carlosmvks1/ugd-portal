// Contenido representativo común a las tres propuestas visuales.
// NO es contenido institucional: los textos marcados «ejemplo» y las entidades
// gestoras son ficticios; las cifras «provisional 2024» provienen del corte
// territorial del repositorio (SESAL · Memoria institucional 2024, sin
// verificación oficial). Nada de esto se publica ni entra en dist/.
export const contenido={
 ugd:{
  nombre:'Unidad de Gestión Descentralizada',siglas:'UGD',institucion:'Secretaría de Salud de Honduras',
  presentacion:'Texto de ejemplo: aquí irá la presentación aprobada por la UGD, en dos o tres líneas que expliquen qué hace la unidad, con quién trabaja y en qué territorios.',
 },
 tareas:[
  {t:'Conocer la UGD',d:'Funciones, estructura y autoridades',h:'#ugd'},
  {t:'Cómo funciona la descentralización',d:'Quién participa y qué hace cada parte',h:'#modelo'},
  {t:'Buscar un municipio',d:'Gestores y población reportada',h:'?vista=municipio'},
  {t:'Directorio de gestores',d:'Fichas por entidad gestora',h:'?vista=ficha'},
  {t:'Población e inversión',d:'Cifras con fuente y período',h:'#cifras'},
  {t:'Contacto',d:'Canales institucionales',h:'#contacto'},
 ],
 pasos:[
  {t:'La Secretaría de Salud',d:'Texto de ejemplo sobre el papel de la Secretaría en el modelo.'},
  {t:'Los gestores',d:'Texto de ejemplo: qué es una entidad gestora y qué responsabilidades asume.'},
  {t:'Los servicios en el territorio',d:'Texto de ejemplo: cómo llegan los servicios a la población.'},
  {t:'El papel de la UGD',d:'Texto de ejemplo: qué hace la UGD dentro del modelo.'},
 ],
 cifras:[
  {v:'1 592 136',l:'personas reportadas en el primer nivel de atención',m:'2024 · provisional · SESAL, Memoria 2024, p. 90',estado:'provisional'},
  {v:'93',l:'municipios con cobertura reportada en la tabla departamental',m:'2024 · provisional · el texto de la fuente indica 89',estado:'provisional'},
  {v:'—',l:'inversión por nivel de gestión y de atención',m:'Categorías, moneda y período pendientes de la UGD',estado:'pendiente'},
 ],
 municipio:{
  id:'1313',nombre:'Lepaera',departamento:'Lempira',depId:'13',
  poblacion:'42 710',poblacionDef:'Población reportada · definición pendiente de confirmación',periodo:'2024',nivel:'Primer nivel de atención',
  fuente:'SESAL · Memoria institucional 2024, p. 92',estado:'Provisional · pendiente de verificación oficial',
  gestores:[{id:'ejemplo-occidente',nombre:'Asociación Gestora de Ejemplo del Occidente',tipo:'Asociación (tipo de ejemplo)',vinculo:'Vínculo municipal · 2024 · primer nivel'}],
 },
 gestor:{
  id:'ejemplo-occidente',nombre:'Asociación Gestora de Ejemplo del Occidente',siglas:'AGEO · nombre ficticio',
  tipo:'Asociación (tipo de ejemplo)',
  descripcion:'Texto de ejemplo: descripción breve de la entidad gestora, su ámbito de trabajo y su relación con la Secretaría de Salud, redactada y aprobada por la UGD.',
  territorios:[{id:'1313',n:'Lepaera'},{id:'1323',n:'Talgua'},{id:'1310',n:'Las Flores'},{id:'1315',n:'Piraera'}],
  territoriosNota:'2024 · primer nivel de atención · vínculos ficticios para el prototipo',
  poblacion:{v:'87 500',m:'Cifra ficticia · 2024 · reportada para el gestor, no suma de municipios'},
  inversion:{v:'L 14 200 000',m:'Cifra ficticia · monto transferido · 2024 · atribuido explícitamente al gestor'},
  fotos:[{c:'Equipo de salud en visita comunitaria',l:'Lempira · fecha pendiente',cr:'Crédito pendiente'},{c:'Jornada de vacunación en centro de salud',l:'Lepaera · 2024',cr:'Crédito pendiente'}],
  contacto:[{t:'Correo',v:'contacto@ejemplo.invalid'},{t:'Teléfono',v:'+504 0000-0000'}],
  fuente:'Fuente de ejemplo · período 2024',
 },
 incompleto:{
  nombre:'Entidad gestora de ejemplo con un nombre institucional especialmente largo para comprobar cortes de línea en móvil',
  tipo:'Tipo de entidad pendiente de confirmación',
 },
};

// Marcador de fotografía: no hay fotografías autorizadas todavía.
export const foto=(c,{tone='a',ratio='4/3',label=true}={})=>`<figure class="ph ph-${tone}" style="aspect-ratio:${ratio}"><svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 7h3l2-2h6l2 2h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>${label?`<figcaption><span>Fotografía pendiente de autorización</span>${c}</figcaption>`:''}</figure>`;

// Mapa SVG: departamentos y municipios; resalta presencia y selección.
export function mapa(data,{selected='',highlight=[],focus='',presence=true,label='Mapa de Honduras'}={}){
 const hl=new Set(highlight);
 let vb=data.viewBox;
 if(focus){
  const nums=data.municipalities.filter(m=>m.dep===focus).flatMap(m=>m.d.match(/-?\d+\.?\d*/g).map(Number));
  const xs=nums.filter((_,i)=>i%2===0),ys=nums.filter((_,i)=>i%2===1);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),pad=14;
  vb=`${(x0-pad).toFixed(0)} ${(y0-pad).toFixed(0)} ${(x1-x0+2*pad).toFixed(0)} ${(y1-y0+2*pad).toFixed(0)}`;
 }
 const munis=data.municipalities.filter(m=>!focus||m.dep===focus).map(m=>`<path class="m${presence&&m.reported?' r':''}${hl.has(m.id)?' h':''}${m.id===selected?' s':''}" d="${m.d}"><title>${m.name}</title></path>`).join('');
 const deps=data.departments.map(d=>`<path class="d" d="${d.d}"/>`).join('');
 return `<svg class="mapa" viewBox="${vb}" role="img" aria-label="${label}">${munis}${deps}</svg>`;
}

export const vista=()=>new URLSearchParams(location.search).get('vista')||'portada';
export const aviso='<p class="proto-flag" role="note">Prototipo de diseño · contenido de ejemplo, no institucional</p>';
