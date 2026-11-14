import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {linkStagger,LINK_DURATION,MIN_OPACITY} from '../src/motion.js';

test('el resaltado de municipios de un gestor no supera 600 ms con cualquier número de municipios',()=>{
 for(let n=0;n<=300;n++){const end=Math.max(0,n-1)*linkStagger(n)+LINK_DURATION;assert.ok(end<=600,`${n} municipios: ${end} ms`);}
 assert.equal(linkStagger(1),0);assert.equal(linkStagger(5),30);assert.equal(linkStagger(100),0);
});

test('el CSS de movimiento solo actúa con html.has-motion y se anula con reducir movimiento',async()=>{
 const css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
 const block=css.slice(css.indexOf('/* ───── Movimiento'),css.indexOf('@media (prefers-reduced-motion:reduce)'));
 const rules=block.replace(/\/\*[\s\S]*?\*\//g,'').match(/[^{}]+\{[^{}]*\}/g).map(r=>r.trim()).filter(r=>!r.startsWith(':root')&&!r.startsWith('@keyframes')&&!r.startsWith('from')&&!r.startsWith('to'));
 for(const r of rules)assert.match(r.replace(/^@media[^{]*\{/,''),/^\.has-motion/,r);
 assert.match(css,/prefers-reduced-motion:reduce\)\{\s*\*\{transition:none!important;animation:none!important/);
 // Ningún estado oculta texto: CSS y entradas de motion.js parten de opacidad ≥ 0,4.
 for(const m of block.matchAll(/opacity:([\d.]+)/g))assert.ok(+m[1]>=.4,m[0]);
 assert.ok(MIN_OPACITY>=.4);
 const js=await readFile(new URL('../src/motion.js',import.meta.url),'utf8');
 assert.doesNotMatch(js,/opacity:0[,}]/);
});
