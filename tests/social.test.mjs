import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const meta=key=>html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
const base='https://carlosmvks1.github.io/ugd-portal/';
// Dimensiones de un JPEG a partir de su marcador SOF.
function jpegSize(b){let i=2;while(i<b.length){const m=b[i+1],len=b.readUInt16BE(i+2);if(m>=0xC0&&m<=0xC3)return {height:b.readUInt16BE(i+5),width:b.readUInt16BE(i+7)};i+=2+len;}return null;}

test('vista previa al compartir: metadatos absolutos bajo /ugd-portal/',()=>{
 for(const key of ['og:url','og:image','og:image:secure_url','twitter:image'])assert(meta(key)?.startsWith(base),key);
 assert.equal(meta('og:url'),base);assert.match(html,new RegExp(`<link rel="canonical" href="${base}">`));
 for(const key of ['og:title','og:description','og:image:alt','twitter:title','twitter:description','description'])assert(meta(key),key);
 assert.match(meta('og:title'),/Unidad de Gestión Descentralizada/);assert.match(meta('og:title'),/Secretaría de Salud de Honduras/);
 assert.doesNotMatch(html.slice(0,html.indexOf('</head>')),/Propuesta de portal|Documentos|ugd-preview/i);
});
test('vista previa al compartir: imagen publicada, 1200×630 y ligera',async()=>{
 const file=new URL('../public/'+meta('og:image').slice(base.length),import.meta.url);
 const bytes=await readFile(file);assert.deepEqual(jpegSize(bytes),{width:1200,height:630});
 assert.equal(meta('og:image:width'),'1200');assert.equal(meta('og:image:height'),'630');
 assert((await stat(file)).size<300*1024,'WhatsApp descarta imágenes de vista previa pesadas');
});
