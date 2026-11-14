// Comprueba que el movimiento no retrasa la consulta ni rompe la navegación.
// Requiere una vista previa con gestores y fotografías: sin argumento sirve
// work/synthetic-preview (la construye synthetic-check en test:browser).
// Uso: node scripts/motion-check.mjs [url]
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createPublicServer} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const own=process.argv[1]?.endsWith('motion-check.mjs')?process.argv[2]:'';
let server=null,base=own;
if(!base){server=createPublicServer('work/synthetic-preview');await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/`;}
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const sizes={escritorio:{viewport:{width:1280,height:760}},'móvil (emulado)':{viewport:{width:390,height:844},isMobile:true,hasTouch:true}};
const territory=page=>new URL(page.url()).searchParams.get('territory');
const results=[];
for(const [label,opts] of Object.entries(sizes)){
 const ctx=await browser.newContext(opts),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 // Portada: el título es legible desde el primer fotograma de la entrada.
 await page.goto(base);await page.waitForSelector('html.has-motion');
 const heroOpacity=await page.evaluate(()=>Math.min(...[...document.querySelectorAll('.page-hero .hero-inner>*')].map(el=>+getComputedStyle(el).opacity)));
 // Fotografías: tras recorrer la página, ninguna visible queda pendiente y ningún pie de foto se recorta.
 for(let y=0;y<12000;y+=600){await page.mouse.wheel(0,600);await page.waitForTimeout(60);}
 await page.waitForTimeout(700);
 const photoState=await page.evaluate(()=>({pendingVisible:[...document.querySelectorAll('.m-photo-pending')].filter(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).length,captionsClipped:[...document.querySelectorAll('figcaption')].filter(c=>getComputedStyle(c).clipPath!=='none').length,photos:document.querySelectorAll('figure img').length}));
 // Recorrido territorio → municipio → gestor → atrás → atrás → adelante.
 await page.goto(base+'#presencia');await page.waitForSelector('#map [data-code="13"]');
 await page.locator('#map [data-code="13"]').click();
 // Disponibilidad inmediata: el título del detalle ya se lee y el municipio se puede pulsar sin esperar.
 const detailOpacity=await page.evaluate(()=>Math.min(...[...document.querySelectorAll('#detail>*')].map(el=>+getComputedStyle(el).opacity)));
 await page.locator('#map [data-code="1301"]').click({timeout:2000});
 await page.waitForFunction(()=>new URLSearchParams(location.search).get('territory')==='1301');
 const link=page.locator('#detail .detail-manager-list a').first();await link.scrollIntoViewIfNeeded();await link.click();await page.waitForSelector('#ficha-gestor');
 // Resaltado de municipios del gestor: duración total acotada.
 const linkedSpan=await page.evaluate(()=>{const a=document.getAnimations().filter(x=>x.id==='m-linked');return {count:a.length,end:Math.max(0,...a.map(x=>{const t=x.effect.getComputedTiming();return (t.delay||0)+(t.duration||0);}))};});
 const gestorUrl=page.url();
 await page.goBack();await page.waitForTimeout(300);const back1=territory(page);
 await page.goBack();await page.waitForTimeout(300);const back2=territory(page);
 await page.goForward();await page.waitForTimeout(300);const fwd=territory(page);
 // Interacción rápida: cinco selecciones seguidas; queda la última.
 await page.goto(base+'#presencia');await page.waitForSelector('#map [data-code="04"]');
 for(const code of ['04','10','12','16','13']){await page.locator(`#map [data-code="${code}"]`).click({timeout:2000});if(code!=='13')await page.locator('#home').click();}
 await page.waitForTimeout(700);const rapid=await page.locator('#detail h2').innerText();
 // El contorno seleccionado termina continuo (sin guiones) y dorado.
 await page.locator('#map [data-code="1301"]').click();await page.waitForTimeout(700);
 const outline=await page.evaluate(()=>{const cs=getComputedStyle(document.querySelector('#map [aria-pressed="true"]'));return cs.strokeDasharray+' '+cs.stroke;});
 // Teclado: Enter sobre un territorio lleva el foco al título del detalle.
 await page.locator('#home').click();await page.waitForSelector('#map [data-code="10"]');await page.locator('#map [data-code="10"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);
 const focus=await page.evaluate(()=>document.activeElement?.closest('#detail')?document.activeElement.tagName:'(fuera)');
 // Sin efectos permanentes: en reposo no queda ninguna animación en curso.
 await page.waitForTimeout(1200);const idle=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 await ctx.close();
 // Movimiento reducido del sistema: sin clase, sin animaciones, todo visible.
 const rctx=await browser.newContext({...opts,reducedMotion:'reduce'}),r=await rctx.newPage();
 await r.goto(base+'#presencia');await r.waitForSelector('#map [data-code="13"]');await r.locator('#map [data-code="13"]').click();await r.waitForTimeout(100);
 const reduced=await r.evaluate(()=>({hasMotion:document.documentElement.classList.contains('has-motion'),running:document.getAnimations().filter(a=>a.playState==='running').length,pending:document.querySelectorAll('.m-photo-pending').length}));
 await rctx.close();
 const row={label,errors:errors.length,heroOpacity,detailOpacity,...photoState,linked:linkedSpan.count,linkedEndMs:Math.round(linkedSpan.end),gestor:new URL(gestorUrl).searchParams.get('gestor'),back1,back2,fwd,rapid,outline,focus,idle,...Object.fromEntries(Object.entries(reduced).map(([k,v])=>['reduce.'+k,v]))};
 results.push(row);console.log(JSON.stringify(row));
}
await browser.close();server?.close();
for(const r of results){
 assert.equal(r.errors,0);assert.ok(r.heroOpacity>=.4,'portada legible');assert.ok(r.detailOpacity>=.4,'detalle legible');
 assert.equal(r.pendingVisible,0);assert.equal(r.captionsClipped,0);assert.ok(r.linkedEndMs<=650,'resaltado acotado');
 assert.equal(r.back1,'1301');assert.equal(r.back2,'13');assert.equal(r.fwd,'1301');assert.equal(r.rapid,'Lempira');assert.equal(r.outline,'none rgb(173, 132, 17)');assert.equal(r.focus,'H2');assert.equal(r.idle,0);
 assert.equal(r['reduce.hasMotion'],false);assert.equal(r['reduce.running'],0);assert.equal(r['reduce.pending'],0);
}
console.log('Movimiento: legibilidad inmediata, fotografías, resaltado acotado, atrás/adelante, selección rápida, teclado, reposo y movimiento reducido: OK');
