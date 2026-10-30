export const project=p=>[p[0]*Math.cos(15*Math.PI/180),-p[1]];
export function geometryPath(g){
 if(!['Polygon','MultiPolygon'].includes(g?.type))throw Error('Geometría no poligonal');
 const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;
 return polygons.map(poly=>poly.map(ring=>ring.map((p,i)=>(i?'L':'M')+project(p).join(',')).join('')+'Z').join('')).join('');
}
export function geometryBounds(features){
 let x=Infinity,y=Infinity,right=-Infinity,bottom=-Infinity;
 for(const f of features){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const poly of polys)for(const ring of poly)for(const p of ring){const [a,b]=project(p);x=Math.min(x,a);y=Math.min(y,b);right=Math.max(right,a);bottom=Math.max(bottom,b);}}
 if(!Number.isFinite(x))return '0 0 1 1';
 const pad=Math.max(right-x,bottom-y)*.04;
 return [x-pad,y-pad,right-x+pad*2,bottom-y+pad*2].join(' ');
}
