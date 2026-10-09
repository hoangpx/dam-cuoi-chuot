/* Chương VIII: hill-climb a hard level of the "hall" family: mutate the things (flames, spirals, ice, water) until the shortest solution
   (tools/c8-model.js) is as long as possible. node tools/c8-hill.js [seed] [iterations] [layout] */
const { solveModel } = require('./c8-model.js');
let seed = +(process.argv[2] || 1) * 7919 + 13; const iters = +(process.argv[3] || 300);
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
function layout() {
  const nf = ri(3, 4), nr = ri(4, 5), ni = ri(4, 5), hb = ri(3, 4) + 1, hp = Math.min(hb, ri(3, 5)), wb = 3;
  const W = 1 + 2 + 1 + 1 + wb + 1 + nf + 3, H = hb + 5, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), R = r => H - 2 - r, ed = [];
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  const xP = W - 2, xF = xP - nf, xI = xF - 1, xB = xI - wb, xPool = xB - 1;
  for (let r = 0; r < nr; r++) for (let k = 0; k < nf; k++) { rows[R(r)][xF + k] = 'a'; ed.push([xF + k, R(r)]); }
  for (let r = 0; r < ni; r++) { rows[R(r)][xI] = 'i'; ed.push([xI, R(r)]); }
  for (let r = 1; r <= hb; r++) for (let k = 0; k < wb; k++) rows[R(r)][xB + k] = '#';
  rows[R(0)][xB + 1] = '#'; for (const k of [0, 2]) { rows[R(0)][xB + k] = 'v'; ed.push([xB + k, R(0)]); }
  for (let r = 0; r < hp; r++) { rows[R(r)][xPool] = 'v'; ed.push([xPool, R(r)]); }
  rows[R(0)][xP] = 'P'; rows[R(0)][2] = 'G';
  return { rows, ed };
}
const score = map => { let r; try { r = solveModel(map, { maxDepth: 9, maxPath: 5, cap: 90000 }); } catch (e) { return { s: -2 }; } return r.depth === null ? { s: r.capped ? -1 : -3 } : { s: r.depth, count: r.solutions.length, sol: r.solutions[0] }; };
let best = null, t0 = Date.now();
for (let attempt = 0; attempt < 12 && !best; attempt++) { const L = layout(), m = L.rows.map(r => r.join('')), sc = score(m); if (sc.s >= 1) best = { L, map: m, sc }; }
if (!best) { console.log('no start'); process.exit(); }
console.error('start depth', best.sc.s);
for (let it = 0; it < iters; it++) {
  const L = { rows: best.L.rows.map(r => r.slice()), ed: best.L.ed }, k = ri(1, 2);
  for (let j = 0; j < k; j++) { const [x, y] = pick(L.ed); L.rows[y][x] = pick([' ', 'a', 'a', 'a', 'b', 'i', 'v']); }
  const m = L.rows.map(r => r.join('')); if (m.join('/') === best.map.join('/')) continue;
  const sc = score(m); if (sc.s < 0) continue;
  if (sc.s > best.sc.s || (sc.s === best.sc.s && sc.count <= best.sc.count)) { if (sc.s > best.sc.s) console.error('it', it, 'depth', sc.s, 'count', sc.count, Math.round((Date.now() - t0) / 1000) + 's'); best = { L, map: m, sc }; }
}
console.log('// depth ' + best.sc.s + ', ' + best.sc.count + ' minimal solutions'); console.log(best.map.join('\n')); console.log(JSON.stringify(best.sc.sol.map(m => m.kind + ':' + m.cells.map(c => c.join(',')).join(' '))));
