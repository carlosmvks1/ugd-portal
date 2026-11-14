// Capturas comparables de las tres propuestas: 4 vistas × escritorio/móvil.
// Uso: node design/propuestas/capturas.mjs [salida] [opciones...]
//      node design/propuestas/capturas.mjs --serve   → sirve los prototipos en http://127.0.0.1:4174/
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {extname,join,resolve} from 'node:path';
const dir=resolve(new URL('.',import.meta.url).pathname);
const serveOnly=process.argv[2]==='--serve';
const out=resolve(serveOnly?'work/propuestas':process.argv[2]||'work/propuestas');
const opts=process.argv.slice(3).length?process.argv.slice(3):['1','2','3'];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=createServer(async(req,res)=>{try{const p=join(dir,decodeURIComponent(new URL(req.url,'http://x').pathname));const body=await readFile(p);res.writeHead(200,{'content-type':types[extname(p)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}}).listen(serveOnly?4174:0,'127.0.0.1');
if(serveOnly){console.log('http://127.0.0.1:4174/opcion-1.html?vista=portada');await new Promise(()=>{});}
await new Promise(r=>server.listening?r():server.once('listening',r));
const port=server.address().port;
await mkdir(out,{recursive:true});
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const sizes={escritorio:{width:1440,height:900},movil:{width:390,height:844}};
for(const o of opts)for(const [name,vp] of Object.entries(sizes)){
 const page=await browser.newPage({viewport:vp,deviceScaleFactor:1});
 for(const v of ['portada','municipio','ficha','incompleto']){
  await page.goto(`http://localhost:${port}/opcion-${o}.html?vista=${v}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)console.warn(`Desbordamiento horizontal: opción ${o} ${v} ${name}`);
  await page.screenshot({path:join(out,`opcion-${o}-${v}-${name}.jpg`),fullPage:true,type:'jpeg',quality:72});
 }
 await page.close();
}
await browser.close();server.close();
console.log('Capturas en',out);
