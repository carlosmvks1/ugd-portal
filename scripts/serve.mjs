import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,relative,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const allowed=path=>path==='/index.html'||path==='/config.json'||/^\/src\/[a-zA-Z0-9/_-]+\.(js|css)$/.test(path)||
 /^\/data\/(catalog\.json|explorer\/(archive|data_quality_issues)\.json|snapshots\/[a-zA-Z0-9_-]+\/snapshot\.json)$/.test(path)||
 /^\/geography\/(departamentos|municipios-\d{2})\.geojson$/.test(path)||/^\/public\/[a-zA-Z0-9/_-]+\.(json|svg|png|jpg|woff2)$/.test(path);
export function createPublicServer(directory='.'){
 const root=resolve(directory);
 return createServer(async(req,res)=>{
  try{
   if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
   const url=new URL(req.url,'http://localhost'),path=decodeURIComponent(url.pathname),name=path==='/'?'/index.html':path;
   if(!allowed(name)){res.writeHead(404).end('No encontrado');return;}
   let file;
   try{file=await realpath(resolve(root,'.'+name));}catch(e){if(e.code!=='ENOENT'||name!=='/config.json')throw e;file=await realpath(resolve(root,'public/config.json'));}
   const physical='/'+relative(await realpath(root),file).split(sep).join('/');
   if(!allowed(physical)){res.writeHead(404).end('No encontrado');return;}
   const content=await readFile(file);
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);
  }catch{res.writeHead(404).end('No encontrado');}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url))createPublicServer(process.argv[2]||'.').listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
