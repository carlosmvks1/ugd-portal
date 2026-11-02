import {test} from 'node:test';
import {request} from 'node:http';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {AdminStore,digest,changes} from '../scripts/admin-store.mjs';
import {importCoverage,parseCsv} from '../scripts/admin-import.mjs';
import {createAdminServer} from '../scripts/admin-server.mjs';
import {csv} from '../src/map/model.js';
const baseline=JSON.parse(await readFile(new URL('../data/explorer/archive.json',import.meta.url),'utf8'));
function setup(path=':memory:'){
 const s=new AdminStore(path,baseline),users={};
 for(const role of ['editor','reviewer','publisher'])users[role]=s.createUser('test-'+role,role,'synthetic-test-password-'+role);
 return {s,...users};
}
const fails=(fn,status)=>assert.throws(fn,e=>e.status===status);
test('contraseñas con hash, sesiones revocables y límite persistente de intentos',()=>{
 const {s,editor}=setup();try{
  const raw=s.db.prepare('SELECT * FROM users WHERE id=?').get(editor.id);assert(!raw.password_hash.includes('synthetic'));assert.equal(raw.password_hash.length,128);
  const login=s.login(editor.username,'synthetic-test-password-editor');assert.equal(s.user(login.token).role,'editor');assert(!s.user('forged'));assert(!s.user(login.token,Date.now()+9*3600*1000));s.logout(login.token);assert(!s.user(login.token));
  const resetSession=s.login(editor.username,'synthetic-test-password-editor');s.resetPassword(editor.username,'synthetic-test-password-editor');assert(!s.user(resetSession.token));
  for(let i=0;i<5;i++)assert.equal(s.login(editor.username,'wrong').error,401);
  assert.equal(s.login(editor.username,'synthetic-test-password-editor').error,429);
  assert(s.login(editor.username,'synthetic-test-password-editor','local',Date.now()+16*60*1000).token);
 }finally{s.close();}
});
test('flujo independiente con historial, revisión optimista y paquete inmutable',()=>{
 const {s,editor,reviewer,publisher}=setup();try{
  const d=s.create(editor,'Corte para revisión',baseline);assert.equal(d.revision,1);assert.equal(d.state,'draft');
  fails(()=>s.create(reviewer,'No',baseline),403);fails(()=>s.act(publisher,d.id,'publish',1),403);
  const changed=structuredClone(baseline);changed.coverage[0].scope_note='Nota documentada de prueba';
  let next=s.act(editor,d.id,'save',1,{data:changed});assert.equal(next.revision,2);assert.equal(next.diff.find(x=>x.table==='coverage').modified,1);
  fails(()=>s.act(editor,d.id,'submit',1),409);assert.equal(s.detail(d.id,editor).events.length,2);
  next=s.act(editor,d.id,'submit',2);fails(()=>s.act(editor,d.id,'save',3,{data:baseline}),403);
  fails(()=>s.act(editor,d.id,'approve',3,{note:'Intento'}),403);fails(()=>s.act(reviewer,d.id,'approve',3),422);
  next=s.act(reviewer,d.id,'approve',3,{note:'Fuente revisada'});assert.equal(next.state,'approved');
  fails(()=>s.act(reviewer,d.id,'publish',4),403);
  next=s.act(publisher,d.id,'publish',4);assert.equal(next.state,'released');assert.equal(next.releases.length,1);assert.equal(next.stale,false);assert.equal(next.diff.find(d=>d.table==='coverage').modified,1);
  const release=s.release(publisher,next.releases[0].id);assert.equal(digest(JSON.stringify(release.archive)),release.manifest.archive_sha256);
  assert.equal(release.archive.snapshots[0].verification_status,'official_unverified');assert.deepEqual(release.data_quality_issues,baseline.data_quality_issues);
  assert.deepEqual(s.version(reviewer,d.id,1),baseline);assert.equal(s.version(reviewer,d.id,2).coverage[0].scope_note,'Nota documentada de prueba');
  fails(()=>s.act(editor,d.id,'save',5,{data:baseline}),403);fails(()=>s.release(editor,next.releases[0].id),403);
  assert.equal(s.detail(d.id,publisher).events.length,5);assert.equal(next.revision,5);
 }finally{s.close();}
});
test('devolución permite corregir sin perder evidencia y no permite ver borradores ajenos',()=>{
 const {s,editor,reviewer}=setup();try{
  const another=s.createUser('another-editor','editor','another-synthetic-password'),d=s.create(editor,'Revisión',baseline);
  assert.equal(s.list(another).length,0);fails(()=>s.detail(d.id,another),403);fails(()=>s.version(another,d.id,1),403);
  s.act(editor,d.id,'submit',1);s.act(reviewer,d.id,'reject',2,{note:'Falta explicación'});
  const corrected=s.act(editor,d.id,'save',3,{data:baseline});assert.equal(corrected.state,'draft');assert.equal(corrected.reviewer,null);assert.equal(corrected.events[2].note,'Falta explicación');
  const contaminated=structuredClone(baseline);contaminated.coverage[0].internal_note='PRIVATE';fails(()=>s.act(editor,d.id,'save',4,{data:contaminated}),422);
  assert.equal(s.detail(d.id,editor).revision,4);
 }finally{s.close();}
});
test('una publicación nueva bloquea borradores basados en versiones anteriores',()=>{
 const {s,editor,reviewer,publisher}=setup();try{
  const changed=structuredClone(baseline);changed.provenance+=' Revisión documentada.';
  const originalHash=s.currentHash(),a=s.create(editor,'A',changed),b=s.create(editor,'B',baseline);
  for(const d of [a,b]){s.act(editor,d.id,'submit',1);s.act(reviewer,d.id,'approve',2,{note:'Revisado'});}
  s.act(publisher,a.id,'publish',3);fails(()=>s.create(editor,'Base vieja',baseline,originalHash),409);assert(s.detail(b.id,reviewer).stale);fails(()=>s.act(publisher,b.id,'publish',3),409);
  assert.equal(s.detail(b.id,reviewer).state,'approved');assert.equal(s.current().provenance,changed.provenance);
  assert.equal(changes(baseline,changed).find(x=>x.table==='metadata').entries.length,1);
 }finally{s.close();}
});
test('SQLite conserva borradores e historial al reiniciar sin sustituir la base',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ugd-db-'));let s;
 try{const setupResult=setup(join(dir,'data.sqlite'));s=setupResult.s;const d=s.create(setupResult.editor,'Persistente',baseline);s.close();s=null;
  const other=structuredClone(baseline);other.provenance='Otra base';s=new AdminStore(join(dir,'data.sqlite'),other);
  assert.equal(s.detail(d.id,setupResult.editor).events.length,1);assert.equal(s.current().provenance,baseline.provenance);
 }finally{s?.close();await rm(dir,{recursive:true,force:true});}
});
test('CSV preserva códigos, trata ausencias como null y valida antes de aplicar',()=>{
 const text='snapshot_id,territory_id,care_level,population_covered,scope_note\r\n2024-v1,1313,I,42711,"Nota, con ""cita"""';
 const next=importCoverage(baseline,text);assert.equal(next.coverage[0].territory_id,'1313');assert.equal(next.coverage[0].population_covered,42711);assert.equal(next.coverage[0].scope_note,'Nota, con "cita"');assert.equal(baseline.coverage[0].population_covered,42710);
 assert.deepEqual(importCoverage(baseline,csv(baseline.coverage)),baseline);
 assert.deepEqual(parseCsv('a,b\r\n"texto\nsiguiente",x'),[['a','b'],['texto\nsiguiente','x']]);
 for(const bad of ['snapshot_id,territory_id,care_level,internal_note\n2024-v1,1313,I,private','snapshot_id,territory_id,care_level,men\n2024-v1,1313,I,no','snapshot_id,territory_id,care_level\n2024-v1,9999,I','a,a\n1,2','a\n"sin cerrar'])fails(()=>importCoverage(baseline,bad),422);
});
test('API exige sesión, rol, origen y tipo JSON; no sirve la base de datos',async()=>{
 const {s,editor}=setup(),server=createAdminServer(s),expected='http://127.0.0.1:4174';
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const call=(path,{cookie,method='GET',data,origin=expected,host='127.0.0.1:4174',contentType='application/json'}={})=>new Promise((resolve,reject)=>{
  const req=request(base+path,{method,headers:{Host:host,...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{Origin:origin,'Content-Type':contentType}:{})}},res=>{
   let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:{get:key=>Array.isArray(res.headers[key])?res.headers[key][0]:res.headers[key]},json:async()=>JSON.parse(text)}));
  });req.on('error',reject);req.end(method==='POST'?JSON.stringify(data):undefined);
 });
 try{
  assert.equal((await call('/api/drafts')).status,401);assert.equal((await call('/api/login',{method:'POST',origin:'https://evil.invalid',data:{}})).status,403);
  assert.equal((await call('/api/login',{method:'POST',data:{},contentType:'text/plain'})).status,415);
  assert.equal((await call('/',{host:'evil.invalid'})).status,403);
  const login=await call('/api/login',{method:'POST',data:{username:editor.username,password:'synthetic-test-password-editor',role:'publisher'}});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.equal((await (await call('/api/me',{cookie})).json()).role,'editor');
  assert.equal((await call('/work/admin/portal.sqlite',{cookie})).status,404);
  assert.equal((await call('/api/drafts',{cookie,method:'POST',data:null})).status,400);
  assert.equal((await call('/api/drafts',{cookie,method:'POST',origin:'https://evil.invalid',data:{title:'x',data:baseline}})).status,403);
  const create=await call('/api/drafts',{cookie,method:'POST',data:{title:'Seguro',data:baseline,baseHash:s.currentHash()}});assert.equal(create.status,201);
  await call('/api/logout',{cookie,method:'POST',data:{}});assert.equal((await call('/api/me',{cookie})).status,401);
 }finally{await new Promise(resolve=>server.close(resolve));s.close();}
});
test('servidor de desarrollo no expone administración, SQLite, secretos ni enlaces a ellos',async()=>{
 const {mkdir,writeFile,symlink}=await import('node:fs/promises');
 const {createPublicServer}=await import('../scripts/serve.mjs');
 const dir=await mkdtemp(join(tmpdir(),'ugd-public-'));let server;
 try{
  await mkdir(join(dir,'public'));await mkdir(join(dir,'src'));await mkdir(join(dir,'work'));
  await writeFile(join(dir,'index.html'),'<h1>Portal</h1>');await writeFile(join(dir,'public/config.json'),'{}');await writeFile(join(dir,'work/portal.sqlite'),'PRIVATE_DB');await symlink(join(dir,'work/portal.sqlite'),join(dir,'src/leak.js'));
  server=createPublicServer(dir);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/config.json')).status,200);
  for(const path of ['/work/portal.sqlite','/.env','/.git/config','/admin/index.html','/src/leak.js','/scripts/admin-store.mjs'])assert.equal((await fetch(base+path)).status,404);
 }finally{if(server)await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});}
});
