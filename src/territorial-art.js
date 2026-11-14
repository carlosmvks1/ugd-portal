import {localUrl} from './config.js';
import {geometryPath,geometryBounds} from './map/geometry.js';

// Decorative outline of Honduras behind the opening photo slot.
export async function initTerritorialArt(data,config,load){
  const svg=document.querySelector('#hero-map-signature');
  if(!svg)return;
  try{
    const geo=await load(localUrl('departamentos.geojson',config.geographyRoot));
    const features=geo.features.filter(feature=>data.territories.some(t=>t.official_code===feature.properties.territorio_id));
    svg.setAttribute('viewBox',geometryBounds(features));
    svg.innerHTML=features.map(feature=>`<path d="${geometryPath(feature.geometry)}"></path>`).join('');
  }catch{
    svg.hidden=true;
  }
}
