// Mide carga e interacción del portal para comparar antes/después de un cambio
// de movimiento. Laboratorio local: Chrome sin interfaz, servidor local, sin
// limitación de red. «móvil» es emulación (viewport 390, táctil, CPU ×4), no un
// teléfono físico. Para comparar, las URL se alternan en cada repetición y así
// la deriva del equipo afecta por igual a todas.
// Uso: node scripts/motion-perf.mjs <repeticiones> <etiqueta>=<url> [<etiqueta>=<url> …]
import {chromium} from 'playwright';
const [runsArg='5',...targets]=process.argv.slice(2);
const runs=Number(runsArg),bases=(targets.length?targets:['portal=http://127.0.0.1:4173/']).map(t=>t.split(/=(.*)/s).slice(0,2));
const profiles={
 escritorio:{viewport:{width:1280,height:760},cpu:1},
 'móvil (emulado, CPU ×4)':{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,cpu:4}
};
const observe=()=>{
 const p=window.__perf={lcp:0,cls:0,tbt:0,longtasks:0,events:[],loaf:[]};
 new PerformanceObserver(l=>{for(const e of l.getEntries())p.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
 new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)p.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
 new PerformanceObserver(l=>{for(const e of l.getEntries()){p.longtasks++;p.tbt+=Math.max(0,e.duration-50);}}).observe({type:'longtask',buffered:true});
 new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.interactionId)p.events.push(e.duration);}).observe({type:'event',durationThreshold:16,buffered:true});
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())p.loaf.push(e.duration);}).observe({type:'long-animation-frame',buffered:true});}catch{}
};
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:0;};
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const report={};
for(const [name,{cpu,...opts}] of Object.entries(profiles)){
 const all=Object.fromEntries(bases.map(([label])=>[label,[]]));
 for(let i=0;i<runs;i++)for(const [label,base] of bases){
  const samples=all[label];
  const ctx=await browser.newContext(opts),page=await ctx.newPage();
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  await page.addInitScript(observe);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(1500);
  const load=await page.evaluate(()=>({fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0,lcp:__perf.lcp,cls:__perf.cls,tbt:__perf.tbt,bytes:performance.getEntriesByType('resource').filter(r=>/\.(js|css)$/.test(r.name)).reduce((s,r)=>s+r.encodedBodySize,0)}));
  // Recorrido: portada → territorio → municipio → gestor → atrás → atrás → cinco selecciones rápidas.
  const tap=async loc=>opts.hasTouch?loc.tap():loc.click();
  await page.evaluate(()=>{__perf.events=[];__perf.loaf=[];__perf.tbt=0;__perf.longtasks=0;});
  await page.mouse.wheel(0,1800);await page.waitForTimeout(500);
  await page.goto(base+'#presencia');await page.waitForSelector('#map [data-code="13"]');await page.waitForTimeout(400);
  await page.evaluate(()=>{__perf.events=[];__perf.loaf=[];__perf.tbt=0;__perf.longtasks=0;});
  const t0=Date.now();
  await tap(page.locator('#map [data-code="13"]'));await page.waitForSelector('#map [data-code="1301"]');await page.waitForTimeout(400);
  await tap(page.locator('#map [data-code="1301"]'));await page.waitForTimeout(400);
  const link=page.locator('#detail .detail-manager-list a').first();
  if(await link.count()){await link.scrollIntoViewIfNeeded();await tap(link);await page.waitForSelector('#ficha-gestor');await page.waitForTimeout(500);}
  await page.goBack();await page.waitForTimeout(400);await page.goBack();await page.waitForTimeout(400);
  await tap(page.locator('#home'));await page.waitForSelector('#map [data-code="04"]');
  for(const code of ['04','10','12','16','13']){await page.locator(`#map [data-code="${code}"]`).click({timeout:3000});if(code!=='13')await page.locator('#home').click();}
  await page.waitForTimeout(600);
  const journeyMs=Date.now()-t0;
  const j=await page.evaluate(()=>({inp:Math.max(0,...__perf.events),events:__perf.events.length,loaf:__perf.loaf.length,loafMax:Math.max(0,...__perf.loaf),tbtJ:__perf.tbt}));
  const title=await page.locator('#detail h2').innerText();
  samples.push({...load,...j,journeyMs,title,errors:errors.length});
  await ctx.close();
 }
 for(const [label,samples] of Object.entries(all)){
  const m=k=>median(samples.map(s=>s[k])),range=k=>{const v=samples.map(s=>s[k]);return `${Math.round(Math.min(...v))}–${Math.round(Math.max(...v))}`;};
  report[`${name} · ${label}`]={'FCP ms':m('fcp'),'LCP ms':m('lcp'),'CLS':+m('cls').toFixed(4),'TBT carga ms':m('tbt'),'JS+CSS KB':+(m('bytes')/1024).toFixed(1),'Interacción más lenta ms':m('inp'),'  (mín–máx)':range('inp'),'Fotogramas largos (>50 ms)':m('loaf'),'Fotograma más largo ms':m('loafMax'),'TBT recorrido ms':m('tbtJ'),'  (mín–máx) ':range('tbtJ'),'Errores':Math.max(...samples.map(s=>s.errors)),'Título final':[...new Set(samples.map(s=>s.title))].join('/')};
 }
}
const chromeVersion=browser.version();await browser.close();
for(const r of Object.values(report))for(const k in r)if(typeof r[k]==='number')r[k]=Math.round(r[k]*100)/100;
console.log(JSON.stringify({entorno:{chrome:chromeVersion,repeticiones:runs},...report},null,1));
