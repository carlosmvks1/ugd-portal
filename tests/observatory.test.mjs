import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../scripts/validate.mjs';
import {validateExplorer} from '../scripts/validate-explorer.mjs';
import {comparison,series,qualityAlerts,operationalAlerts} from '../src/observatory/model.js';
import {publicArchive} from '../src/map/contract.js';
const data=await readJson('data/explorer/archive.json');
function pair(){const d=structuredClone(data),s=d.snapshots[0];s.status='approved';s.verification_status='official_verified';s.comparison={methodology_id:'test-method',source_id:s.source_id,geography_version:'test-geo',periodicity:'annual'};d.snapshots.push({...structuredClone(s),snapshot_id:'2025-v1',year:2025,period_start:'2025-01-01',period_end:'2025-12-31'});return d;}
test('histórico único no genera diferencias, tendencias ni población sumada',()=>{
 const rows=comparison(data,'','2024-v1');assert(rows.every(r=>r.absolute===null&&r.percent===null&&!r.comparable));
 assert.equal(series(data,'population_I')[0].value,1592136);assert.equal(series(data,'municipalities_table')[0].value,93);assert.equal(series(data,'municipalities_narrative')[0].value,89);
 assert(qualityAlerts(data).some(a=>a.kind==='discrepancy'));assert.equal(operationalAlerts(data).agreements_available,false);
});
test('comparación exige verificación, metodología compatible y años distintos',()=>{
 const d=pair();d.snapshots[1].indicators.agreements_total=50;validateExplorer(d);
 let row=comparison(d,'2024-v1','2025-v1')[0];assert.equal(row.absolute,3);assert.equal(row.percent,3/47*100);
 assert.equal(comparison(d,'2025-v1','2024-v1')[0].absolute,null);
 for(const alter of [s=>s.verification_status='official_unverified',s=>s.status='provisional',s=>delete s.comparison,s=>s.comparison.geography_version='different',s=>s.comparison.methodology_id='different']){
  const bad=structuredClone(d);alter(bad.snapshots[1]);assert(comparison(bad,'2024-v1','2025-v1').every(r=>!r.comparable));
 }
 assert.equal(comparison(d,'2024-v1','2024-v1')[0].comparable,false);
 assert.deepEqual(publicArchive(d).snapshots[0].comparison,d.snapshots[0].comparison);
});
test('base cero, ausencia y revisiones no inventan porcentajes o duplican años',()=>{
 const d=pair();d.snapshots[0].indicators.agreements_total=0;d.snapshots[1].indicators.agreements_total=5;
 let row=comparison(d,'2024-v1','2025-v1')[0];assert.equal(row.absolute,5);assert.equal(row.percent,null);
 d.snapshots[0].indicators.agreements_total=null;assert.equal(comparison(d,'2024-v1','2025-v1')[0].absolute,null);
 d.snapshots.push({...structuredClone(d.snapshots[1]),snapshot_id:'2025-v10',revision:10});d.snapshots.reverse();
 assert.equal(series(d,'agreements_total').length,2);assert.equal(series(d,'agreements_total')[1].snapshot_id,'2025-v10');
});
test('contrato valida fuente metodológica y periodicidad anual real',()=>{
 for(const alter of [s=>s.comparison.source_id='missing',s=>s.period_start='2024-02-01',s=>s.comparison.periodicity='monthly',s=>s.comparison.private_note='x']){
  const d=pair();alter(d.snapshots[0]);assert.throws(()=>validateExplorer(d));
 }
});
test('alertas de vencimiento solo usan último período y estados registrados activos',()=>{
 const d=pair(),base={snapshot_id:'2025-v1',status:'active',valid_from:'2025-01-01'};
 d.agreements=[{...base,agreement_id:'overdue',valid_to:'2026-10-31'},{...base,agreement_id:'today',valid_to:'2026-11-02'},{...base,agreement_id:'undated',valid_to:null},{...base,agreement_id:'future',valid_to:'2027-12-31'},{...base,agreement_id:'expired',status:'expired',valid_to:'2026-10-01'},{...base,agreement_id:'historical',snapshot_id:'2024-v1',valid_to:'2024-12-31'},{...base,agreement_id:'not-started',valid_from:'2027-01-01',valid_to:null}];
 const report=operationalAlerts(d,new Date('2026-11-02T19:00:00Z'));
 assert.deepEqual(report.due.map(r=>r.agreement_id),['overdue','today','undated']);assert.equal(report.due[0].days,-2);assert.equal(report.due[1].days,0);assert.equal(report.individual_agreements,6);
});
