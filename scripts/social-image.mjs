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

const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:UGDSerif;src:url(${font('source-serif-4-latin-700-normal.woff2')});font-weight:700}
@font-face{font-family:UGDSans;src:url(${font('source-sans-3-latin-600-normal.woff2')});font-weight:600}
@font-face{font-family:UGDSans;src:url(${font('source-sans-3-latin-400-normal.woff2')});font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#FAF7F1;color:#1B2433;font-family:UGDSans;position:relative}
.strip{position:absolute;inset:0 0 auto 0;height:58px;background:#0D1D3A;color:#E9D59A;font:600 19px/58px UGDSans;letter-spacing:.14em;text-transform:uppercase;padding-left:72px}
.map{position:absolute;right:-150px;top:150px;width:560px;height:auto}
.map path{fill:#13294F;fill-opacity:.06;stroke:#13294F;stroke-opacity:.42;stroke-width:1.4;vector-effect:non-scaling-stroke}
.text{position:absolute;left:72px;top:118px;width:700px}
.mark{display:inline-block;border:4px solid #AD8411;background:#13294F;color:#E9D59A;font:700 34px/1 UGDSerif;padding:14px 16px 12px;letter-spacing:.02em}
h1{margin-top:30px;font:700 78px/1.02 UGDSerif;color:#13294F;letter-spacing:-.01em}
.rule{width:132px;height:5px;background:#AD8411;margin:30px 0 24px}
.org{font:600 36px/1.2 UGDSans;color:#1B2433}
.topics{margin-top:14px;font:400 27px/1.3 UGDSans;color:#4A5262}
.base{position:absolute;inset:auto 0 0 0;height:14px;background:#13294F}
</style></head><body>
<div class="strip">Gobierno de la República de Honduras</div>
<svg class="map" viewBox="${geometryBounds(geo.features)}" aria-hidden="true">${paths}</svg>
<div class="text">
 <span class="mark">UGD</span>
 <h1>Unidad de Gestión<br>Descentralizada</h1>
 <div class="rule"></div>
 <p class="org">Secretaría de Salud de Honduras</p>
 <p class="topics">Funciones · Territorio y gestores · Población e inversión</p>
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
await page.screenshot({path:out,type:'jpeg',quality:86});
await browser.close();
console.log('Imagen para compartir: '+out);
