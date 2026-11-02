import {DatabaseSync} from 'node:sqlite';
import {createHash,randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {validateExplorer} from './validate-explorer.mjs';
import {publicArchive} from '../src/map/contract.js';
export class AdminError extends Error {constructor(status,message){super(message);this.status=status;}}
const check=(ok,status,message)=>{if(!ok)throw new AdminError(status,message);};
export const digest=value=>createHash('sha256').update(value).digest('hex');
const serialize=data=>JSON.stringify(publicArchive(data));
export function validated(data){try{validateExplorer(data);return data;}catch(error){throw new AdminError(422,'Archivo inválido: '+error.message);}}
export function changes(before,after){
 before=publicArchive(before);after=publicArchive(after);
 return ['territories','snapshots','coverage','departments','sources','managers','agreements','data_quality_issues','equivalences'].map(table=>{
  const key=r=>table==='coverage'?[r.snapshot_id,r.territory_id,r.care_level].join('/'):
   table==='departments'?[r.snapshot_id,r.territory_id].join('/'):
   r.official_code??r.snapshot_id??r.source_id??r.manager_id??r.agreement_id??r.issue_id;
  // IDs específicos por tabla evitan confundir una fuente con el registro que cita.
  const id=r=>({territories:r.official_code,snapshots:r.snapshot_id,sources:r.source_id,managers:r.manager_id,agreements:r.agreement_id,data_quality_issues:r.issue_id,equivalences:r.official_code})[table]??key(r);
  const old=new Map(before[table].map(r=>[id(r),r])),next=new Map(after[table].map(r=>[id(r),r]));
  const entries=[...new Set([...old.keys(),...next.keys()])].filter(k=>JSON.stringify(old.get(k))!==JSON.stringify(next.get(k))).map(k=>({key:k,before:old.get(k)??null,after:next.get(k)??null}));
  return {table,entries,added:[...next.keys()].filter(k=>!old.has(k)).length,removed:[...old.keys()].filter(k=>!next.has(k)).length,
   modified:[...next.keys()].filter(k=>old.has(k)&&JSON.stringify(old.get(k))!==JSON.stringify(next.get(k))).length};
 }).concat([{table:'metadata',added:0,removed:0,modified:before.provenance===after.provenance?0:1,entries:before.provenance===after.provenance?[]:[{key:'provenance',before:before.provenance,after:after.provenance}]}]);
}
export class AdminStore {
 constructor(path,baseline){
  validated(baseline);this.db=new DatabaseSync(path);
  this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,role TEXT NOT NULL CHECK(role IN ('editor','reviewer','publisher')),salt TEXT NOT NULL,password_hash TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until_time INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS drafts(id TEXT PRIMARY KEY,title TEXT NOT NULL,author TEXT NOT NULL REFERENCES users(id),state TEXT NOT NULL,revision INTEGER NOT NULL,payload TEXT NOT NULL,base_hash TEXT NOT NULL,reviewer TEXT REFERENCES users(id),updated TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS versions(draft_id TEXT NOT NULL REFERENCES drafts(id),revision INTEGER NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(draft_id,revision));
   CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,draft_id TEXT NOT NULL REFERENCES drafts(id),actor TEXT NOT NULL REFERENCES users(id),action TEXT NOT NULL,revision INTEGER NOT NULL,note TEXT NOT NULL,created TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS releases(id TEXT PRIMARY KEY,draft_id TEXT UNIQUE NOT NULL REFERENCES drafts(id),payload TEXT NOT NULL,hash TEXT NOT NULL,manifest TEXT NOT NULL,created TEXT NOT NULL);`);
  this.db.prepare('INSERT OR IGNORE INTO meta VALUES (?,?)').run('baseline',serialize(baseline));
 }
 transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 close(){this.db.close();}
 createUser(username,role,password){
  check(typeof username==='string'&&/^[a-z][a-z0-9._-]{2,63}$/.test(username),422,'Usuario inválido (3–64 caracteres minúsculos).');
  check(['editor','reviewer','publisher'].includes(role),422,'Rol inválido.');
  check(typeof password==='string'&&password.length>=12&&password.length<=256,422,'La contraseña debe tener de 12 a 256 caracteres.');
  check(!this.db.prepare('SELECT id FROM users WHERE username=?').get(username),409,'El usuario ya existe.');
  const id=randomUUID(),salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');
  this.db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id,username,role,salt,hash);return {id,username,role};
 }
 resetPassword(username,password){
  check(typeof password==='string'&&password.length>=12&&password.length<=256,422,'La contraseña debe tener de 12 a 256 caracteres.');
  return this.transaction(()=>{const u=this.db.prepare('SELECT id FROM users WHERE username=?').get(username);check(u,404,'Usuario no encontrado.');
   const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');
   this.db.prepare('UPDATE users SET salt=?,password_hash=? WHERE id=?').run(salt,hash,u.id);
   this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);return {username};
  });
 }
 login(username,password,ip='local',now=Date.now()){
  check(typeof username==='string'&&username.length<=64&&typeof password==='string'&&password.length<=256,401,'Credenciales inválidas.');
  return this.transaction(()=>{
   this.db.prepare('DELETE FROM attempts WHERE until_time<=?').run(now);
   const keys=[['user:'+digest(username.toLowerCase()),5],['ip:'+digest(ip),100]];
   for(const [key,max] of keys){const a=this.db.prepare('SELECT count FROM attempts WHERE key=?').get(key);if(a?.count>=max)return {error:429};}
   const u=this.db.prepare('SELECT * FROM users WHERE username=?').get(username);
   const candidate=scryptSync(password,u?.salt??'unknown-user-timing-salt',64);
   if(!u||!timingSafeEqual(candidate,Buffer.from(u.password_hash,'hex'))){
    for(const [key] of keys)this.db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+15*60*1000);
    return {error:401};
   }
   this.db.prepare('DELETE FROM attempts WHERE key=?').run(keys[0][0]);
   this.db.prepare('DELETE FROM sessions WHERE expires<=?').run(now);
   const token=randomBytes(32).toString('hex');this.db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token),u.id,now+8*60*60*1000);
   return {token,user:{id:u.id,username:u.username,role:u.role}};
  });
 }
 user(token,now=Date.now()) {return typeof token==='string'?this.db.prepare('SELECT u.id,u.username,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?').get(digest(token),now):undefined;}
 logout(token){if(token)this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));}
 current(){const r=this.db.prepare('SELECT payload FROM releases ORDER BY rowid DESC LIMIT 1').get();return JSON.parse(r?.payload??this.db.prepare('SELECT value FROM meta WHERE key=?').get('baseline').value);}
 baseArchive(draft){
  const release=this.db.prepare('SELECT payload FROM releases WHERE hash=? ORDER BY rowid DESC LIMIT 1').get(draft.base_hash);
  const payload=release?.payload??this.db.prepare('SELECT value FROM meta WHERE key=?').get('baseline').value;
  check(digest(payload)===draft.base_hash,500,'No se encontró la versión de base.');return JSON.parse(payload);
 }
 currentHash(){return digest(serialize(this.current()));}
 list(user){return this.db.prepare(`SELECT d.id,d.title,d.state,d.revision,d.updated,u.username AS author FROM drafts d JOIN users u ON u.id=d.author ${user.role==='editor'?'WHERE d.author=?':''} ORDER BY d.updated DESC`).all(...(user.role==='editor'?[user.id]:[]));}
 raw(id,user){const d=this.db.prepare('SELECT * FROM drafts WHERE id=?').get(id);check(d,404,'Borrador no encontrado.');check(user.role!=='editor'||d.author===user.id,403,'Sin acceso a este borrador.');return d;}
 detail(id,user){const d=this.raw(id,user);return {...d,payload:JSON.parse(d.payload),diff:changes(this.baseArchive(d),JSON.parse(d.payload)),stale:d.state!=='released'&&d.base_hash!==this.currentHash(),events:this.db.prepare('SELECT e.action,e.revision,e.note,e.created,u.username AS actor FROM events e JOIN users u ON e.actor=u.id WHERE draft_id=? ORDER BY e.id').all(id),releases:this.db.prepare('SELECT id,hash,created FROM releases WHERE draft_id=?').all(id)};}
 log(id,user,action,revision,note,payload){
  this.db.prepare('INSERT INTO versions VALUES (?,?,?)').run(id,revision,payload);
  this.db.prepare('INSERT INTO events(draft_id,actor,action,revision,note,created) VALUES (?,?,?,?,?,?)').run(id,user.id,action,revision,note,new Date().toISOString());
 }
 create(user,title,data,expectedBaseHash=this.currentHash()){
  check(user.role==='editor',403,'Solo edición puede crear borradores.');check(typeof title==='string'&&title.trim().length>0&&title.length<=160,422,'Título requerido (hasta 160 caracteres).');validated(data);
  return this.transaction(()=>{check(expectedBaseHash===this.currentHash(),409,'La base cambió. Inicie un nuevo borrador desde la versión vigente.');const id=randomUUID(),payload=serialize(data);
   this.db.prepare('INSERT INTO drafts VALUES (?,?,?,?,?,?,?,?,?)').run(id,title.trim(),user.id,'draft',1,payload,this.currentHash(),null,new Date().toISOString());
   this.log(id,user,'create',1,'',payload);return this.detail(id,user);});
 }
 act(user,id,action,revision,{data,note=''}={}){
  check(typeof note==='string'&&note.length<=2000,422,'Comentario inválido.');
  return this.transaction(()=>{
   const d=this.raw(id,user);check(Number.isSafeInteger(revision)&&revision===d.revision,409,'La versión cambió. Recargue antes de continuar.');
   let state=d.state,payload=d.payload,reviewer=d.reviewer;
   if(action==='save'){
    check(user.role==='editor'&&d.author===user.id&&['draft','rejected'].includes(state),403,'No puede editar esta versión.');validated(data);payload=serialize(data);state='draft';reviewer=null;
   }else if(action==='submit'){
    check(user.role==='editor'&&d.author===user.id&&state==='draft',403,'Solo puede enviar un borrador propio.');state='submitted';
   }else if(action==='approve'||action==='reject'){
    check(user.role==='reviewer'&&user.id!==d.author&&state==='submitted',403,'Se requiere revisión independiente de un envío pendiente.');
    check(note.trim().length>0,422,'La revisión requiere un comentario.');state=action==='approve'?'approved':'rejected';reviewer=user.id;
   }else if(action==='publish'){
    check(user.role==='publisher'&&user.id!==d.author&&user.id!==d.reviewer&&state==='approved',403,'Solo publicación puede preparar una versión aprobada.');
    check(d.base_hash===this.currentHash(),409,'La base publicada cambió. Cree un nuevo borrador sobre la versión vigente.');
    validated(JSON.parse(payload));const releaseId=randomUUID(),hash=digest(payload),created=new Date().toISOString();
    const manifest={release_id:releaseId,draft_id:id,revision:d.revision,archive_sha256:hash,reviewer:d.reviewer,publisher:user.id,prepared_at:created,notice:'Aprobación del paquete para publicación; no modifica la verificación de las fuentes ni despliega el sitio.'};
    this.db.prepare('INSERT INTO releases VALUES (?,?,?,?,?,?)').run(releaseId,id,payload,hash,JSON.stringify(manifest),created);state='released';
   }else throw new AdminError(404,'Acción desconocida.');
   const next=d.revision+1;this.db.prepare('UPDATE drafts SET state=?,revision=?,payload=?,reviewer=?,updated=? WHERE id=?').run(state,next,payload,reviewer,new Date().toISOString(),id);
   this.log(id,user,action,next,note,payload);return this.detail(id,user);
  });
 }
 version(user,id,revision){this.raw(id,user);const row=this.db.prepare('SELECT payload FROM versions WHERE draft_id=? AND revision=?').get(id,revision);check(row,404,'Revisión no encontrada.');return JSON.parse(row.payload);}
 release(user,id){check(['reviewer','publisher'].includes(user.role),403,'Sin acceso al paquete.');const r=this.db.prepare('SELECT * FROM releases WHERE id=?').get(id);check(r,404,'Paquete no encontrado.');const archive=JSON.parse(r.payload);return {manifest:JSON.parse(r.manifest),archive,data_quality_issues:archive.data_quality_issues};}
}
