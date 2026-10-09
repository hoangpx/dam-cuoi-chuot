/* Chương VIII: new early levels that REALLY need gathering (8 of the first 17 could be crossed with no swipes in the real engine).
   node tools/c8-regen.js <wall|climb|pit> <depth> <seconds> <seed>   writes tools/c8-cand2/regen-<tpl>-<depth>-<seed>.txt (maps + the shortest solution).
   Accepts: model depth == <depth>, at most 2 minimal solutions, the real engine does NOT win with no swipes (fine macros) and DOES win with the solution, and every swipe is needed (leave-one-out). */
const fs = require('fs'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
const [tpl, depthArg, secArg, seedArg] = process.argv.slice(2), D = +depthArg, secs = +secArg; let seed = +(seedArg || 1) * 7919 + 11;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
const grid = (W, H) => { const g = Array.from({ length: H }, () => new Array(W).fill(' ')); for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; } return g; };
const SOFT = ['a', 'b', 'c'];
function kinds() { const out = ['d']; const n = ri(1, 2); while (out.length < n + 1) { const k = pick(SOFT); if (!out.includes(k)) out.push(k); } return out; }
function layout() {
  const KS = kinds(), ed = [];
  if (tpl === 'wall') {
    const W = ri(16, 20), H = ri(7, 9), g = grid(W, H), w = ri(3, 5), x0 = ri(4, W - 6 - w); g[H - 2][1] = 'P'; g[H - 2][W - 2] = 'G';
    for (let y = 1; y <= H - 2; y++) for (let x = x0; x < x0 + w; x++) { ed.push([x, y]); if (rnd() < .66) g[y][x] = pick(KS); } return { g, ed, KS };
  }
  if (tpl === 'climb') {
    const W = ri(16, 19), H = ri(9, 11), g = grid(W, H), th = ri(3, 5), tx = ri(9, W - 5);
    for (let y = H - 1 - th; y < H - 1; y++) for (let x = tx; x < W - 1; x++) g[y][x] = '#'; g[H - 2 - th][W - 2] = 'G'; g[H - 2][1] = 'P';
    const x0 = ri(3, tx - 3); for (let y = 1; y <= H - 2; y++) for (let x = x0; x < tx; x++) { ed.push([x, y]); if (rnd() < .6) g[y][x] = pick(KS); } return { g, ed, KS };
  }
  const wP = ri(8, 10), W = wP + 8, H = ri(10, 11), g = grid(W, H), top = H - 6;                             // pit
  for (let y = top; y <= H - 2; y++) for (const x of [1, 2, 3, W - 4, W - 3, W - 2]) g[y][x] = '#';
  for (let x = 4; x <= W - 5; x++) g[H - 2][x] = 'x'; g[top - 1][1] = 'P'; g[top - 1][W - 3] = 'G';
  for (let x = 4; x <= W - 5; x++) { const h = ri(2, 4); for (let k = 1; k <= h; k++) g[H - 2 - k][x] = pick(KS); for (let k = 1; k <= 4; k++) ed.push([x, H - 2 - k]); }
  return { g, ed, KS };
}
const mapOf = g => g.map(r => r.join(''));
const score = m => { let r; try { r = solveModel(m, { maxDepth: D + 1, maxPath: 6, cap: 60000 }); } catch (e) { return null; } return r.depth === null ? null : { d: r.depth, n: r.solutions.length, sol: r.solutions[0] }; };
const t0 = Date.now(); let found = 0, tried = 0;
while (Date.now() - t0 < secs * 1000 && found < 6) {
  let cur = null; for (let a = 0; a < 25 && !cur; a++) { const L = layout(), m = mapOf(L.g), sc = score(m); tried++; if (sc && sc.d >= 1) cur = { L, m, sc }; }
  if (!cur) continue;
  const dist = s => Math.abs(s.d - D) * 10 + s.n;
  for (let it = 0; it < 80; it++) { const g2 = cur.L.g.map(r => r.slice()), k = ri(1, 2); for (let j = 0; j < k; j++) { const [x, y] = pick(cur.L.ed); g2[y][x] = pick([...cur.L.KS, ' ']); } const m = mapOf(g2), sc = score(m); tried++; if (sc && dist(sc) <= dist(cur.sc)) cur = { L: { g: g2, ed: cur.L.ed, KS: cur.L.KS }, m, sc }; }
  if (cur.sc.d !== D || cur.sc.n > 2) continue;
  const steps = cur.sc.sol.map(s => s.cells); if (run(cur.m, [], { cap: 20000, depth: 120, fine: true }).won) continue; if (!run(cur.m, steps, { cap: 30000, depth: 120 }).won) continue;
  if (steps.some((_, d) => run(cur.m, steps.filter((__, k) => k !== d), { cap: 20000, depth: 120, fine: true }).won)) continue;
  found++; fs.appendFileSync(`tools/c8-cand2/regen-${tpl}-${D}-${seedArg || 1}.txt`, '// depth ' + D + '\n' + cur.m.join('\n') + '\n' + JSON.stringify(cur.sc.sol.map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' '))) + '\n\n');
}
console.log(tpl, D, 'seed', seedArg, 'tried', tried, 'found', found);
