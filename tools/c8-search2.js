/* Chương VIII: search for an ORIGINAL hard level in a rich random "hall" (bricks, pillars, a high goal platform, and a zone of flames / ice / water / clods / spirals / pegs).
   Hill-climbs the zone for the longest shortest solution (tools/c8-model.js). node tools/c8-search2.js <seed> <minutes> */
const fs = require('fs'), { solveModel } = require('./c8-model.js');
let seed = +(process.argv[2] || 1) * 104729 + 7; const minutes = +(process.argv[3] || 10);
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
const KINDS = ['a', 'a', 'a', 'a', 'i', 'i', 'v', 'v', 'd', 'b', 'o', ' ', ' ', ' '];
function layout() {
  const W = ri(14, 17), hg = ri(4, 6), H = hg + 6, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), floor = H - 2, ed = [];
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  for (let y = H - 1 - hg; y <= floor; y++) for (let x = W - 4; x < W - 1; x++) rows[y][x] = '#';
  rows[floor][1] = 'P'; rows[floor - hg][W - 3] = 'G';
  const pillars = ri(0, 2); for (let k = 0; k < pillars; k++) { const x = ri(4, W - 7), h = ri(1, 3); for (let y = floor - h + 1; y <= floor; y++) rows[y][x] = '#'; }
  if (rnd() < .35) { const x = ri(5, W - 8), w = ri(2, 3), h = ri(3, hg); for (let y = floor - h; y <= floor - 1; y++) for (let k = 0; k < w; k++) rows[y][x + k] = '#'; }            // a hanging block over the floor
  for (let y = floor - hg; y <= floor; y++) for (let x = 3; x <= W - 5; x++) if (rows[y][x] === ' ') { ed.push([x, y]); if (rnd() < .42) rows[y][x] = pick(KINDS); }
  return { rows, ed };
}
const mapOf = rows => rows.map(r => r.join(''));
const score = m => { let r; try { r = solveModel(m, { maxDepth: 8, maxPath: 5, cap: 70000 }); } catch (e) { return { s: -3 }; } return r.depth === null ? { s: r.capped ? -1 : -2 } : { s: r.depth, n: r.solutions.length, sol: r.solutions[0] }; };
const t0 = Date.now(), out = []; let best = null, tried = 0;
while ((Date.now() - t0) / 60000 < minutes) {
  // a fresh random start, then climb
  let cur = null; for (let a = 0; a < 40 && !cur; a++) { const L = layout(), m = mapOf(L.rows), sc = score(m); tried++; if (sc.s >= 1) cur = { L, m, sc }; }
  if (!cur) continue;
  for (let it = 0; it < 120 && (Date.now() - t0) / 60000 < minutes; it++) {
    const L2 = { rows: cur.L.rows.map(r => r.slice()), ed: cur.L.ed }, k = ri(1, 3);
    for (let j = 0; j < k; j++) { const [x, y] = pick(L2.ed); L2.rows[y][x] = pick(KINDS); }
    const m = mapOf(L2.rows); if (m.join('/') === cur.m.join('/')) continue; const sc = score(m); tried++;
    if (sc.s >= cur.sc.s && sc.s >= 1 && (sc.s > cur.sc.s || sc.n <= cur.sc.n)) cur = { L: L2, m, sc };
  }
  if (!best || cur.sc.s > best.sc.s || (cur.sc.s === best.sc.s && cur.sc.n < best.sc.n)) { best = cur; fs.appendFileSync(`tools/c8-cand2/out-${process.argv[2]}.txt`, `// depth ${cur.sc.s}, ${cur.sc.n} minimal solutions (${tried} tried, ${Math.round((Date.now() - t0) / 1000)}s)\n${cur.m.join('\n')}\n${JSON.stringify(cur.sc.sol.map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' ')))}\n\n`); }
  if (cur.sc.s >= 5) out.push(cur);
}
console.log('seed', process.argv[2], 'best depth', best && best.sc.s, 'tried', tried);
