import {localUrl} from './config.js';
import {geometryPath,geometryBounds,project} from './map/geometry.js';

function featureCenter(feature){
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  for(const polygon of polygons)for(const ring of polygon)for(const point of ring){
    const [x,y]=project(point);
    left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  return [(left+right)/2,(top+bottom)/2];
}

export async function initTerritorialArt(data,config,load){
  const svg=document.querySelector('#hero-map-signature');
  if(!svg)return;
  try{
    const geo=await load(localUrl('departamentos.geojson',config.geographyRoot));
    const features=geo.features.filter(feature=>data.territories.some(t=>t.official_code===feature.properties.territorio_id));
    svg.setAttribute('viewBox',geometryBounds(features));

    const labelCodes=new Set(['05','08','13','15']);
    const labels=features.filter(f=>labelCodes.has(f.properties.territorio_id)).map(feature=>{
      const [x,y]=featureCenter(feature);
      return `<text x="${x}" y="${y}" class="signature-code">${feature.properties.territorio_id}</text>`;
    }).join('');

    svg.innerHTML=`
      <g class="signature-map">
        ${features.map(feature=>`<path d="${geometryPath(feature.geometry)}" data-signature-code="${feature.properties.territorio_id}"></path>`).join('')}
      </g>
      <g class="signature-labels">${labels}</g>
    `;

    const departments=data.territories.filter(t=>t.type==='department').length;
    const municipalities=data.territories.filter(t=>t.type==='municipality').length;
    const count=document.querySelector('#hero-territory-count');
    if(count)count.textContent=`${departments} departamentos · ${municipalities} municipios`;
  }catch{
    svg.hidden=true;
  }
}
