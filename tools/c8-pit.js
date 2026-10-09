/* Chương VIII: an easy-to-medium THORN PIT level that really needs gathering (the old level 4 could be hopped across: 1-cell gaps).
   Random stacks of flames / spirals / leaves / clods stand on thorns between two cliffs; the model wants a shortest solution of 2..3 swipes and the real engine must NOT win with no swipes.
   node tools/c8-pit.js <seed> <seconds> */
const fs = require('fs'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
let seed = +(process.argv[2] || 1) * 7919 + 3; const secs = +(process.argv[3] || 120);
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
function make() {
  const wP = ri(6, 8), W = wP + 8, H = 10, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), ed = [];
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  for (let y = 5; y <= 8; y++) for (const x of [1, 2, 3, W - 4, W - 3, W - 2]) rows[y][x] = '#';          // the two cliffs: standing row 4
  for (let x = 4; x <= W - 5; x++) rows[8][x] = 'x';                                                  // thorns
  rows[4][1] = 'P'; rows[4][W - 3] = 'G';
  for (let x = 4; x <= W - 5; x++) { const h = ri(2, 4); for (let k = 1; k <= h; k++) { rows[8 - k][x] = pick(['a', 'a', 'b', 'c', 'd', 'd', 'd']); ed.push([x, 8 - k]); } for (let k = h + 1; k <= 4; k++) ed.push([x, 8 - k]); }
  return { rows, ed };
}
const mapOf = rows => rows.map(r => r.join(''));
const score = m => { let r; try { r = solveModel(m, { maxDepth: 4, maxPath: 6, cap: 60000 }); } catch (e) { return null; } return r.depth === null ? null : { d: r.depth, n: r.solutions.length, sol: r.solutions[0] }; };
const t0 = Date.now(), found = []; let tried = 0;
while (Date.now() - t0 < secs * 1000) {
  let cur = null; for (let a = 0; a < 30 && !cur; a++) { const L = make(), m = mapOf(L.rows), sc = score(m); tried++; if (sc && sc.d >= 1) cur = { L, m, sc }; }
  if (!cur) continue;
  for (let it = 0; it < 60; it++) { const L2 = { rows: cur.L.rows.map(r => r.slice()), ed: cur.L.ed }, k = ri(1, 2); for (let j = 0; j < k; j++) { const [x, y] = pick(L2.ed); L2.rows[y][x] = pick(['a', 'a', 'b', 'c', 'd', 'd', ' ']); }
    const m = mapOf(L2.rows), sc = score(m); tried++; if (sc && sc.d >= cur.sc.d && (sc.d > cur.sc.d || sc.n <= cur.sc.n)) cur = { L: L2, m, sc }; }
  if (cur.sc.d >= 2 && cur.sc.d <= 3 && cur.sc.n <= 2) {
    const steps = cur.sc.sol.map(s => s.cells), none = run(cur.m, [], { cap: 20000, depth: 120, fine: true }).won, full = run(cur.m, steps, { cap: 30000, depth: 120 }).won;
    if (!none && full) { found.push({ m: cur.m, d: cur.sc.d, n: cur.sc.n, steps }); fs.appendFileSync('tools/c8-cand2/pit-' + process.argv[2] + '.txt', '// depth ' + cur.sc.d + ', ' + cur.sc.n + ' solutions\n' + cur.m.join('\n') + '\n' + JSON.stringify(cur.sc.sol.map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' '))) + '\n\n'); }
  }
}
console.log('seed', process.argv[2], 'tried', tried, 'found', found.length);
