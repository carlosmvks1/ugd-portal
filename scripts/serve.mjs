import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve(process.argv[2] || '.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/geo+json'};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const path=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(path!==root && !path.startsWith(root+sep)) {res.writeHead(403).end();return;}
    let file=path;
    if((await stat(path)).isDirectory()) {
      if(!url.pathname.endsWith('/')) {res.writeHead(301,{Location:url.pathname+'/'}).end();return;}
      file=resolve(path,'index.html');
    }
    res.writeHead(200,{'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  }catch{res.writeHead(404).end('No encontrado');}
}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
