/* Chương VIII: search for SMALL levels (few things) that are still hard (analysis tool; owner 2026-10-09: "ít vật liệu nhưng vẫn rất khó").
   A small hall (floor, a start ledge, a goal platform of height hg, optional pillars / a trench / a hanging block) plus K things of the allowed kinds, hill-climbed
   for the longest SHORTEST solution of tools/c8-model.js with as few minimal solutions as possible. Every improvement is appended to tools/c8-mini/pool-<tag>.jsonl.
   node tools/c8-mini.js <seed> <minutes> <kinds, e.g. dab> <kmin> <kmax> <tag> */
const fs = require('fs'), { solveModel, parseMap, makeModel } = require('./c8-model.js');
let seed = +(process.argv[2] || 1) * 104729 + 17; const minutes = +(process.argv[3] || 5), KINDS = process.argv[4] || 'd', KMIN = +(process.argv[5] || 3), KMAX = +(process.argv[6] || 8), TAG = process.argv[7] || 'x', TEMPLATE = process.argv[8] || 'hall';
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
function tunnelParams() {
  const W = ri(12, +(process.env.WMAX || 16)), ch = ri(1, 2), H = 10, p = { kind: 'tunnel', W, H, ch, rise: ri(0, 2), caves: [], pit: null, wet: false };
  for (let k = ri(1, +(process.env.CAVES || 2)); k > 0; k--) p.caves.push({ x: ri(3, W - 6), w: ri(1, 3), h: ri(2, 4) });
  if (rnd() < .6) p.pit = { x: ri(3, W - 6), w: ri(1, 2), d: ri(2, 4) };
  p.wet = rnd() < .5; return p;
}
function buildTunnel(p, things) {
  const { W, H, ch } = p, rows = Array.from({ length: H }, () => new Array(W).fill('#')), floor = H - 3;
  for (let y = floor - ch + 1; y <= floor; y++) for (let x = 1; x < W - 1; x++) rows[y][x] = ' ';                      // the corridor
  for (const c of p.caves) for (let y = floor - ch - c.h + 1; y <= floor - ch; y++) for (let k = 0; k < c.w; k++) if (y >= 1) rows[y][c.x + k] = ' ';
  if (p.pit) for (let d = 1; d <= p.pit.d; d++) for (let x = p.pit.x; x < p.pit.x + p.pit.w; x++) if (floor + d < H - 1) rows[floor + d][x] = p.wet && d <= p.pit.d - 1 ? 'v' : ' ';
  if (p.rise) for (let y = floor - p.rise + 1; y <= floor; y++) rows[y][W - 2] = '#';
  rows[floor][1] = 'P'; rows[floor - p.rise][W - 2] = 'G';
  for (const t of things) if (rows[t.y][t.x] === ' ') rows[t.y][t.x] = t.k;
  return rows.map(r => r.join(''));
}
function newParams() {
  if (TEMPLATE === 'tunnel') return tunnelParams();
  if (TEMPLATE === 'mixed' && rnd() < .5) return tunnelParams();
  const W = ri(10, 14), hg = ri(1, 4), H = Math.max(hg, 3) + 5;
  const p = { W, H, hg, pillars: [], pit: null, hang: null };
  for (let k = ri(0, 2); k > 0; k--) p.pillars.push({ x: ri(4, W - 6), h: ri(1, 3) });
  if (rnd() < .45) p.pit = { x: ri(4, W - 7), w: ri(1, 3), d: ri(1, 3) };
  if (rnd() < .3) p.hang = { x: ri(4, W - 7), w: ri(2, 3), h: ri(2, 3) };
  return p;
}
function build(p, things) {
  if (p.kind === 'tunnel') return buildTunnel(p, things);
  const { W, H, hg } = p, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), floor = H - 2;
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  for (let y = floor - hg + 1; y <= floor; y++) for (let x = W - 3; x < W - 1; x++) rows[y][x] = '#';               // the goal platform (2 wide, hg high)
  rows[floor][1] = 'P'; rows[floor - hg][W - 2] = 'G';
  for (const q of p.pillars) for (let y = floor - q.h + 1; y <= floor; y++) rows[y][q.x] = '#';
  if (p.pit) for (let d = 1; d <= p.pit.d; d++) for (let x = p.pit.x; x < p.pit.x + p.pit.w; x++) if (floor + d < H - 1) rows[floor + d][x] = ' ';
  if (p.pit) for (let x = p.pit.x; x < p.pit.x + p.pit.w; x++) rows[Math.min(H - 1, floor + p.pit.d + 1)][x] = '#';
  if (p.hang) for (let y = floor - p.hang.h - 1; y <= floor - 2; y++) for (let k = 0; k < p.hang.w; k++) rows[y][p.hang.x + k] = '#';
  for (const t of things) if (rows[t.y][t.x] === ' ') rows[t.y][t.x] = t.k;
  return rows.map(r => r.join(''));
}
const zone = p => { if (p.kind === 'tunnel') { const m = buildTunnel(p, []), z = []; m.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === ' ') z.push([x, y]); }); return z; }
   const z = [], floor = p.H - 2; for (let y = Math.max(1, floor - Math.max(p.hg, 2) - 3); y <= floor; y++) for (let x = 2; x <= p.W - 4; x++) z.push([x, y]); return z; };
const countThings = m => m.join('').replace(/[^aibvcdo]/g, '').length;
const MELTB = !!process.env.MELTB;
function meltsOf(map, sol) { const { g, W, H } = parseMap(map), M = makeModel(W, H, 6), cnt = (g, k) => g.reduce((s, r) => s + r.filter(c => c === k).length, 0); let cur = g.map(r => r.slice()), n = 0; M.settle(cur);
  for (const st of sol) { const path = st.cells.map(([x, y]) => [x, H - 1 - y]), kind = cur[path[0][1]][path[0][0]], before = cnt(cur, 'i'); cur = M.apply(cur, path); if (kind === 'a' && cnt(cur, 'i') < before) n++; } return n; }
const score0 = m => { let r; try { r = solveModel(m, { maxDepth: +(process.env.MAXD || 8), maxPath: 5, cap: +(process.env.CAP || 120000) }); } catch (e) { return { s: -3 }; } return r.depth === null ? { s: r.capped ? -1 : -2 } : { s: r.depth, n: r.solutions.length, states: r.states, sol: r.solutions[0] }; };
const score = m => { const r = score0(m); if (MELTB && r.sol) { r.melts = meltsOf(m, r.sol); r.s2 = r.s + (r.melts ? .5 : 0); } else r.s2 = r.s; if (r.sol && process.env.STB) r.s2 += .12 * Math.log2(r.states); return r; };
function randomThings(p) { const z = zone(p), k = ri(KMIN, KMAX), out = []; for (let i = 0; i < k; i++) { const [x, y] = pick(z); out.push({ x, y, k: pick(KINDS.split('')) }); } return out; }
const t0 = Date.now(); let tried = 0; const best = {};
const better = (a, b) => a.s2 > b.s2 || (a.s2 === b.s2 && (a.n < b.n || (a.n === b.n && a.states > b.states)));
while ((Date.now() - t0) / 60000 < minutes) {
  let cur = null; for (let a = 0; a < 300 && !cur; a++) { const p = newParams(), th = randomThings(p), m = build(p, th), sc = score(m); tried++; if (sc.s >= 1) cur = { p, th, m, sc }; }
  if (!cur) continue;
  for (let it = 0; it < 250 && (Date.now() - t0) / 60000 < minutes; it++) {
    const p2 = JSON.parse(JSON.stringify(cur.p)); let th2 = cur.th.map(t => ({ ...t })); const z = zone(p2), r = rnd();
    if (r < .25) { const t = pick(th2); t.k = pick(KINDS.split('')); }
    else if (r < .55) { const t = pick(th2), [x, y] = pick(z); t.x = x; t.y = y; }
    else if (r < .7 && th2.length < KMAX) { const [x, y] = pick(z); th2.push({ x, y, k: pick(KINDS.split('')) }); }
    else if (r < .85 && th2.length > KMIN) th2.splice(ri(0, th2.length - 1), 1);
    else if (r < .93 && p2.kind === 'tunnel') { const c = p2.caves.length ? pick(p2.caves) : null; if (c) { c.x = Math.max(2, Math.min(p2.W - 4, c.x + pick([-1, 0, 1]))); c.w = Math.max(1, Math.min(3, c.w + pick([-1, 0, 1]))); c.h = Math.max(2, Math.min(4, c.h + pick([-1, 0, 1]))); } p2.ch = Math.max(1, Math.min(2, p2.ch + (rnd() < .2 ? pick([-1, 1]) : 0))); }
    else if (r < .93) { p2.hg = Math.max(1, Math.min(4, p2.hg + pick([-1, 1]))); }
    else if (r < .97 && p2.pillars && p2.pillars.length) { const q = pick(p2.pillars); q.x = Math.max(3, Math.min(p2.W - 5, q.x + pick([-1, 1]))); q.h = Math.max(1, Math.min(3, q.h + pick([-1, 0, 1]))); }
    else { if (p2.kind === 'tunnel' && rnd() < .5) { p2.wet = !p2.wet; } if (p2.pit) { p2.pit.d = Math.max(1, Math.min(3, p2.pit.d + pick([-1, 1]))); p2.pit.w = Math.max(1, Math.min(3, p2.pit.w + pick([-1, 0, 1]))); } }
    th2 = th2.filter(t => t.y >= 1 && t.y <= p2.H - 2 && t.x >= 1 && t.x <= p2.W - 2);
    const m = build(p2, th2); if (m.join('/') === cur.m.join('/')) continue; const sc = score(m); tried++;
    if (sc.s >= 1 && !better(cur.sc, sc)) { cur = { p: p2, th: th2, m, sc }; }
  }
  const n = countThings(cur.m), key = cur.sc.s + ':' + n + (cur.sc.melts ? 'm' : '');
  if (cur.sc.s >= +(process.env.MINREC || 2) && (!best[key] || better(best[key].sc, cur.sc))) { best[key] = cur; fs.appendFileSync(`tools/c8-mini/pool-${TAG}.jsonl`, JSON.stringify({ depth: cur.sc.s, things: n, solutions: cur.sc.n, states: cur.sc.states, map: cur.m, sol: cur.sc.sol.map(s => s.kind + ':' + s.cells.map(c => c.join(',')).join(' ')) }) + '\n'); }
}
console.log('tag', TAG, 'tried', tried, 'best:', Object.entries(best).map(([k, v]) => k + '(n' + v.sc.n + ',st' + v.sc.states + ')').join(' '));
