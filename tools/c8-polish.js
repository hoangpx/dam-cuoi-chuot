/* Chương VIII: tidy a search result. node tools/c8-polish.js <out file> <depth> [maxPath]
   Greedily removes every thing the shortest solutions do not need (the depth must stay and the number of minimal solutions must not grow), settles, then verifies the survivor in the REAL engine
   (full solution wins, no swipes does not, leave-one-out does not). Prints the map and swipes in the form of tools/c8-hard-level.js. */
const fs = require('fs'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
const txt = fs.readFileSync(process.argv[2], 'utf8').split('\n'), want = process.argv[3], D = parseInt(process.argv[3]), mp = +(process.argv[4] || 6);
let i = txt.findIndex(l => l.startsWith('// depth ' + want)); const map0 = []; for (i++; txt[i] && txt[i].startsWith('#'); i++) map0.push(txt[i]);
let map = map0.map(r => r.split('')); const H = map.length, W = map[0].length;
const ev = m => solveModel(m.map(r => r.join('')), { maxDepth: D + 1, maxPath: mp, cap: 250000 });
let base = ev(map); console.log('start depth', base.depth, 'solutions', base.solutions.length);
if (base.depth !== D) { console.log('depth differs; abort'); process.exit(1); }
for (let pass = 0; pass < 3; pass++) { let changed = false;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if ('aibvcdo'.includes(map[y][x])) {
    const keep = map[y][x]; map[y][x] = ' '; const r = ev(map);
    if (r.depth === base.depth && r.solutions.length <= base.solutions.length) { base = r; changed = true; } else map[y][x] = keep; }
  if (!changed) break; }
// settle for display
const g = map.map(r => r.slice()); for (let m = true; m;) { m = false; for (let y = H - 3; y >= 1; y--) for (let x = 1; x < W - 1; x++) if ('aibvcdo'.includes(g[y][x]) && g[y + 1][x] === ' ') { g[y + 1][x] = g[y][x]; g[y][x] = ' '; m = true; } }
const fin = g.map(r => r.join('')), res = solveModel(fin, { maxDepth: D + 1, maxPath: mp, cap: 250000 });
console.log(fin.join('\n')); console.log('model depth', res.depth, 'solutions', res.solutions.length);
const sol = res.solutions[0].map(s => s.cells); console.log(JSON.stringify(res.solutions[0].map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' '))));
const full = run(fin, sol, { cap: 60000, depth: 120 }); console.log('engine: full wins', full.won, full.depth);
console.log('engine: no swipes wins', run(fin, [], { cap: 30000, depth: 120 }).won);
const lo = sol.map((_, d) => run(fin, sol.filter((__, k) => k !== d), { cap: 30000, depth: 120 }).won); console.log('engine: leave-one-out wins', JSON.stringify(lo));
fs.writeFileSync('tools/c8-cand2/polished-' + process.argv[2].replace(/.*out-/, '').replace('.txt', '') + '-' + want + '.json', JSON.stringify({ map: fin, steps: sol, modelDepth: res.depth, solutions: res.solutions.length, engineWin: full.won, leaveOneOut: lo }));
