/* verify a candidate in the REAL engine: node tools/c8-verify-cand.js <out file> <depth> : takes the block "// depth N" from a tools/c8-search2.js output file */
const fs = require('fs'), { run } = require('./c8-engine-test.js'), { solveModel } = require('./c8-model.js');
const txt = fs.readFileSync(process.argv[2], 'utf8').split('\n'); const want = process.argv[3];
let i = txt.findIndex(l => l.startsWith('// depth ' + want)); if (i < 0) { console.log('no such block'); process.exit(1); }
const map = []; for (i++; txt[i] && txt[i].startsWith('#'); i++) map.push(txt[i]); const sol = JSON.parse(txt[i]);
const steps = sol.map(s => s.split(':')[1].split(' ').map(c => c.split(',').map(Number)));
console.log(map.join('\n')); console.log(JSON.stringify(sol));
const cap = +(process.argv[4] || 40000);
const full = run(map, steps, { cap, depth: 120 }); console.log('full solution wins in the engine:', full.won, full.depth, full.seen, full.log.map(l => l.r).join(','));
console.log('no swipes:', run(map, [], { cap: 20000, depth: 120 }).won);
for (let d = 0; d < steps.length; d++) console.log('without swipe', d + 1, run(map, steps.filter((_, k) => k !== d), { cap: 20000, depth: 120 }).won);
const m = solveModel(map, { maxDepth: +want + 1, maxPath: 7, cap: 300000 }); console.log('model with maxPath 7: depth', m.depth, 'solutions', m.solutions.length, m.capped ? '(capped)' : '');
