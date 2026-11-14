// Genera la imagen para compartir (Open Graph, 1200×630) con la tipografía,
// la paleta y la silueta departamental del portal. No usa logotipos, sellos ni
// fotografías: solo el nombre en texto y la geometría pública de Honduras.
// Uso: node scripts/social-image.mjs  →  public/social/ugd-compartir.jpg
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {geometryPath,geometryBounds} from '../src/map/geometry.js';

const root=new URL('../',import.meta.url);
const out=fileURLToPath(new URL('public/social/ugd-compartir.jpg',root));
const geo=JSON.parse(await readFile(new URL('geography/departamentos.geojson',root),'utf8'));
const fontData={};
for(const name of ['source-serif-4-latin-700-normal.woff2','source-sans-3-latin-600-normal.woff2','source-sans-3-latin-400-normal.woff2'])fontData[name]='data:font/woff2;base64,'+(await readFile(new URL('public/fonts/'+name,root))).toString('base64');
const font=name=>fontData[name];
const paths=geo.features.map(f=>`<path d="${geometryPath(f.geometry)}"/>`).join('');

// Zona segura: WhatsApp y otros servicios recortan a veces un cuadrado central
// (630×630, x 285–915). Todo el texto queda dentro de x 315–885 para que la
// identificación se lea completa en formato horizontal y en recorte cuadrado.
const SAFE={left:315,right:885};
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:UGDSerif;src:url(${font('source-serif-4-latin-700-normal.woff2')});font-weight:700}
@font-face{font-family:UGDSans;src:url(${font('source-sans-3-latin-600-normal.woff2')});font-weight:600}
@font-face{font-family:UGDSans;src:url(${font('source-sans-3-latin-400-normal.woff2')});font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#FAF7F1;color:#1B2433;font-family:UGDSans;position:relative}
.strip{position:absolute;inset:0 0 auto 0;height:52px;background:#0D1D3A}
.strip span{position:absolute;left:0;right:0;text-align:center;color:#E9D59A;font:600 17px/52px UGDSans;letter-spacing:.13em;text-transform:uppercase}
.map{position:absolute;left:30px;top:96px;width:1140px;height:auto}
.map path{fill:#13294F;fill-opacity:.035;stroke:#13294F;stroke-opacity:.2;stroke-width:1.2;vector-effect:non-scaling-stroke}
.veil{position:absolute;left:300px;width:600px;top:52px;bottom:12px;background:linear-gradient(90deg,rgba(250,247,241,0),rgba(250,247,241,.92) 14%,rgba(250,247,241,.92) 86%,rgba(250,247,241,0))}
.text{position:absolute;left:0;right:0;top:96px;text-align:center}
.text>*{display:block;margin-left:auto;margin-right:auto}
.mark{display:inline-block!important;border:5px solid #AD8411;background:#13294F;color:#E9D59A;font:700 92px/1 UGDSerif;padding:18px 26px 14px;letter-spacing:.03em}
h1{margin-top:30px;font:700 54px/1.06 UGDSerif;color:#13294F;letter-spacing:-.005em}
.rule{width:120px;height:5px;background:#AD8411;margin:24px auto 20px}
.org{font:600 32px/1.2 UGDSans;color:#1B2433}
.topics{margin-top:10px;font:400 23px/1.3 UGDSans;color:#4A5262}
.base{position:absolute;inset:auto 0 0 0;height:12px;background:#13294F}
</style></head><body>
<div class="strip"><span><b class="fit" style="font:inherit">Gobierno de la República de Honduras</b></span></div>
<svg class="map" viewBox="${geometryBounds(geo.features)}" aria-hidden="true">${paths}</svg>
<div class="veil"></div>
<div class="text">
 <span class="mark fit">UGD</span>
 <h1><span class="fit">Unidad de Gestión</span><br><span class="fit">Descentralizada</span></h1>
 <div class="rule"></div>
 <p class="org"><span class="fit">Secretaría de Salud de Honduras</span></p>
 <p class="topics"><span class="fit">Funciones · Territorio · Población e inversión</span></p>
</div>
<div class="base"></div>
</body></html>`;

await mkdir(fileURLToPath(new URL('public/social/',root)),{recursive:true});
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
await page.setContent(html,{waitUntil:'load'});
await page.evaluate(async()=>{await Promise.allSettled([...document.fonts].map(f=>f.load()));await document.fonts.ready;});
const fonts=await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').length);console.log(await page.evaluate(()=>[...document.fonts].map(f=>f.family+f.weight+':'+f.status).join(' ')));
if(fonts<3)throw Error('Fuentes no cargadas: '+fonts);
const boxes=await page.evaluate(()=>[...document.querySelectorAll('.fit')].map(el=>{const r=el.getBoundingClientRect();return {text:el.textContent,left:Math.round(r.left),right:Math.round(r.right),bottom:Math.round(r.bottom)};}));
for(const b of boxes){if(b.left<SAFE.left||b.right>SAFE.right||b.bottom>610)throw Error('Texto fuera de la zona segura: '+JSON.stringify(b));}
console.log(boxes.map(b=>`${b.left}–${b.right} ${b.text}`).join('\n'));
await page.screenshot({path:out,type:'jpeg',quality:86});
await browser.close();
console.log('Imagen para compartir: '+out);
