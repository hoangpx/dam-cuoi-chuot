/* Chương VIII: tidy and verify the candidates of tools/c8-mini.js. node tools/c8-mini-polish.js <from> <to> [maxSolutions]
   Candidates = every line of tools/c8-mini/pool-*.jsonl with depth >= 2, sorted (depth desc, solutions asc, states desc), deduplicated by map; the slice [from, to) is processed.
   For each: greedily remove every thing the shortest solutions do not need (depth kept, number of minimal solutions not larger), settle, then verify in the REAL engine
   (the full solution wins, no swipes does not, any one swipe left out does not). Survivors are appended to tools/c8-mini/verified.jsonl. */
const fs = require('fs'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
const all = []; for (const f of fs.readdirSync('tools/c8-mini')) if (f.startsWith(process.env.POOLPFX || 'pool-')) for (const l of fs.readFileSync('tools/c8-mini/' + f, 'utf8').split('\n')) if (l) all.push(JSON.parse(l));
const maxN = +(process.argv[4] || 2), seen = new Set(), cand = [];
all.filter(e => e.depth >= 2 && e.solutions <= maxN).sort((a, b) => b.depth - a.depth || a.solutions - b.solutions || b.states - a.states).forEach(e => { const k = e.map.join('/'); if (!seen.has(k)) { seen.add(k); cand.push(e); } });
console.log('candidates', cand.length);
const from = +(process.argv[2] || 0), to = +(process.argv[3] || 10);
for (const e of cand.slice(from, to)) {
  const D = e.depth; let map = e.map.map(r => r.split('')); const H = map.length, W = map[0].length;
  const ev = m => solveModel(m.map(r => r.join('')), { maxDepth: D + 1, maxPath: 6, cap: 200000 });
  let base = ev(map); const base0 = base; if (base.depth !== D) { console.log('skip (depth differs)'); continue; }
  for (let pass = 0; pass < 3; pass++) { let ch = false;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if ('aibvcdo'.includes(map[y][x])) {
      const keep = map[y][x]; map[y][x] = ' '; const r = ev(map);
      if (r.depth === base.depth && r.solutions.length <= base.solutions.length && r.states >= (+process.env.KEEPST || 0) * base0.states) { base = r; ch = true; } else map[y][x] = keep; }
    if (!ch) break; }
  const g = map.map(r => r.slice()); for (let m = true; m;) { m = false; for (let y = H - 3; y >= 1; y--) for (let x = 1; x < W - 1; x++) if ('aibvcdo'.includes(g[y][x]) && g[y + 1][x] === ' ') { g[y + 1][x] = g[y][x]; g[y][x] = ' '; m = true; } }
  const fin = g.map(r => r.join('')), res = solveModel(fin, { maxDepth: D + 1, maxPath: 6, cap: 200000 }); if (res.depth !== D) { console.log('skip (settled depth differs)'); continue; }
  const sol = res.solutions[0].map(s => s.cells), things = fin.join('').replace(/[^aibvcdo]/g, '').length;
  const full = run(fin, sol, { cap: 60000, depth: 150 }), none = run(fin, [], { cap: 40000, depth: 150, fine: true });
  const lo = sol.map((_, d) => run(fin, sol.filter((__, k) => k !== d), { cap: 40000, depth: 150, fine: true }).won);
  const ok = full.won && !none.won && lo.every(w => !w);
  console.log('depth', D, 'things', things, 'solutions', res.solutions.length, 'states', res.states, '| engine full', full.won, 'none', none.won, 'lo', JSON.stringify(lo), ok ? 'OK' : 'x');
  if (ok) fs.appendFileSync((process.env.VERIFIED || 'tools/c8-mini/verified.jsonl'), JSON.stringify({ depth: D, things, solutions: res.solutions.length, states: res.states, map: fin, steps: sol, solText: res.solutions[0].map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' ')) }) + '\n');
}
