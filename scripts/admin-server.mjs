import {createServer} from 'node:http';
import {readFile,mkdir,chmod} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {AdminStore,AdminError,validated,changes} from './admin-store.mjs';
import {importCoverage} from './admin-import.mjs';
import {operationalAlerts} from '../src/observatory/model.js';
import {csv} from '../src/map/model.js';
const project=new URL('../',import.meta.url);
const stateLabels={draft:'Borrador',submitted:'En revisión',approved:'Aprobado',rejected:'Devuelto',released:'Paquete preparado'};
async function body(req){
 if(Number(req.headers['content-length'])>4*1024*1024){req.resume();throw new AdminError(413,'El archivo supera 4 MB.');}
 let size=0,chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024)throw new AdminError(413,'El archivo supera 4 MB.');chunks.push(chunk);}
 try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw new AdminError(400,'JSON inválido.');}
}
export function createAdminServer(store,{origin='http://127.0.0.1:4174'}={}){
 const trusted=new URL(origin);if(!['http:','https:'].includes(trusted.protocol)||trusted.origin!==origin)throw Error('UGD_ADMIN_ORIGIN debe ser un origen HTTP/HTTPS sin ruta.');
 const secure=trusted.protocol==='https:';
 return createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
  try{
   if(req.headers.host!==trusted.host)throw new AdminError(403,'Host no permitido.');
   const url=new URL(req.url,origin),path=url.pathname;
   if(!['GET','POST'].includes(req.method))throw new AdminError(405,'Método no permitido.');
   if(req.method==='POST'){
    if(req.headers.origin!==origin)throw new AdminError(403,'Origen no permitido.');
    if(req.headers['content-type']?.split(';')[0]!=='application/json')throw new AdminError(415,'Se requiere application/json.');
   }
   if(req.method==='GET'&&['/','/admin.js','/admin.css'].includes(path)){
    const file=path==='/'?'index.html':path.slice(1),type=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html';
    res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(await readFile(new URL('admin/'+file,project)));return;
   }
   if(path==='/api/login'&&req.method==='POST'){
    const b=await body(req),result=store.login(b.username,b.password,req.socket.remoteAddress);
    if(result.error)throw new AdminError(result.error,result.error===429?'Demasiados intentos. Intente en 15 minutos.':'Credenciales inválidas.');
    res.setHeader('Set-Cookie',`ugd_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`);json(200,result.user);return;
   }
   const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('ugd_session='))?.slice(12);
   const user=store.user(token);if(!user)throw new AdminError(401,'Inicie sesión.');
   if(path==='/api/me'&&req.method==='GET'){json(200,{...user,stateLabels});return;}
   if(path==='/api/logout'&&req.method==='POST'){await body(req);store.logout(token);res.setHeader('Set-Cookie',`ugd_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure?'; Secure':''}`);json(200,{ok:true});return;}
   if(path==='/api/monitor'&&req.method==='GET'){json(200,{...operationalAlerts(store.current()),queue:store.list(user).reduce((counts,d)=>({...counts,[d.state]:(counts[d.state]??0)+1}),{})});return;}
   if(path==='/api/current'&&req.method==='GET'){json(200,{data:store.current(),hash:store.currentHash()});return;}
   if(path==='/api/coverage.csv'&&req.method==='GET'){
    res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="cobertura.csv"'});res.end(csv(store.current().coverage));return;
   }
   if(path==='/api/drafts'&&req.method==='GET'){json(200,store.list(user));return;}
   if(path==='/api/drafts'&&req.method==='POST'){const b=await body(req);if(typeof b.baseHash!=='string')throw new AdminError(422,'Falta la versión de base.');json(201,store.create(user,b.title,b.data,b.baseHash));return;}
   if(['/api/preview','/api/import-csv'].includes(path)&&req.method==='POST'){
    if(user.role!=='editor')throw new AdminError(403,'Solo edición puede importar datos.');
    const b=await body(req),data=path.endsWith('import-csv')?importCoverage(b.data,b.csv):validated(b.data);
    const before=b.draftId?store.baseArchive(store.raw(b.draftId,user)):store.current();
    json(200,{data,diff:changes(before,data)});return;
   }
   let m=path.match(/^\/api\/drafts\/([a-f0-9-]+)$/);
   if(m&&req.method==='GET'){json(200,store.detail(m[1],user));return;}
   m=path.match(/^\/api\/drafts\/([a-f0-9-]+)\/(save|submit|approve|reject|publish)$/);
   if(m&&req.method==='POST'){const b=await body(req);json(200,store.act(user,m[1],m[2],b.revision,b));return;}
   m=path.match(/^\/api\/drafts\/([a-f0-9-]+)\/versions\/(\d+)$/);
   if(m&&req.method==='GET'){json(200,store.version(user,m[1],Number(m[2])));return;}
   m=path.match(/^\/api\/releases\/([a-f0-9-]+)$/);
   if(m&&req.method==='GET'){res.setHeader('Content-Disposition','attachment; filename="ugd-release-'+m[1]+'.json"');json(200,store.release(user,m[1]));return;}
   throw new AdminError(404,'Recurso no encontrado.');
  }catch(e){if(!res.headersSent)json(e.status??500,{error:e.status?e.message:'Error interno. Intente nuevamente.'});else res.end();}
 });
}
export async function openAdminStore(path=process.env.UGD_ADMIN_DB||resolve(fileURLToPath(project),'work/admin/portal.sqlite')){
 await mkdir(dirname(path),{recursive:true,mode:0o700});
 const baseline=JSON.parse(await readFile(new URL('data/explorer/archive.json',project),'utf8'));
 const store=new AdminStore(path,baseline);
 for(const file of [path,path+'-wal',path+'-shm'])try{await chmod(file,0o600);}catch(e){if(e.code!=='ENOENT')throw e;}
 return store;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const port=Number(process.env.UGD_ADMIN_PORT||4174),host=process.env.UGD_ADMIN_HOST||'127.0.0.1';
 const origin=process.env.UGD_ADMIN_ORIGIN||`http://127.0.0.1:${port}`;
 const store=await openAdminStore(),server=createAdminServer(store,{origin});
 server.listen(port,host,()=>console.log('Administración interna: '+origin));
 const stop=()=>server.close(()=>{store.close();process.exit(0);});process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
