/* Chương VIII: an abstract model of the rules for finding levels (analysis only; the real rules are js/ch8/engine.js).
   A level is the engine's map (rows top to bottom). Things fall, 3+ touching things of a kind vanish, flames melt the ice right AHEAD of the last step of the swipe
   into water (v), water (v) is swimmable and gathered with other water; the mouse hops 2 up, flies 3-4 across, swims, climbs out of water +2.
   solveModel(map, { maxDepth, maxPath, cap }) -> { depth, solutions: [[{kind, cells:[[x,y]..]}]], states }   (cells in map coordinates, x right, y down) */
function parseMap(map) {
  const H = map.length, W = Math.max(...map.map(r => r.length)), g = Array.from({ length: H }, (_, r) => new Array(W).fill(' '));   // g[r][x], r = 0 is the BOTTOM row
  let start = null, goal = null;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let ch = map[y][x] || ' '; const r = H - 1 - y; if (ch === 'P') { start = [x, r]; ch = ' '; } else if (ch === 'G') { goal = [x, r]; ch = ' '; } else if (ch === 'S') ch = ' '; g[r][x] = ch; }
  return { g, W, H, start, goal };
}
const OBJ = 'aibvcdo';
function makeModel(W, H, maxPath) {
  const nb = (x, r) => [[x + 1, r], [x - 1, r], [x, r + 1], [x, r - 1]].filter(([a, b]) => a >= 0 && a < W && b >= 0 && b < H);
  const settle = g => { for (let m = true; m;) { m = false; for (let r = 1; r < H; r++) for (let x = 0; x < W; x++) if (OBJ.includes(g[r][x]) && g[r][x] !== ' ' && g[r - 1][x] === ' ') { g[r - 1][x] = g[r][x]; g[r][x] = ' '; m = true; } } };
  const chains = g => { const out = []; for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) { const k = g[r][x]; if (!'aibvcd'.includes(k) || k === ' ') continue;
    const path = [[x, r]]; (function dfs() { if (path.length >= 3) out.push(path.map(p => p.slice())); if (path.length >= maxPath) return; for (const n of nb(...path[path.length - 1])) if (g[n[1]][n[0]] === k && !path.some(p => p[0] === n[0] && p[1] === n[1])) { path.push(n); dfs(); path.pop(); } })(); } return out; };
  const apply = (g, path) => { const h = g.map(r => r.slice()), k = g[path[0][1]][path[0][0]]; for (const [x, r] of path) h[r][x] = ' ';
    if (k === 'a') { const e = path[path.length - 1], p = path[path.length - 2], x = e[0] + (e[0] - p[0]), r = e[1] + (e[1] - p[1]); if (x >= 0 && x < W && r >= 0 && r < H && h[r][x] === 'i') h[r][x] = 'v'; }
    settle(h); return h; };
  const reach = (g, start, goal) => { const free = (x, r) => x >= 0 && x < W && r >= 0 && r < H && g[r][x] !== '#' && g[r][x] !== 'i' && g[r][x] !== 'x' && g[r][x] !== 'd', wet = (x, r) => g[r][x] === 'v';
    const fall = (x, r) => { while (r > 0 && free(x, r - 1) && !wet(x, r) && !wet(x, r - 1) && g[r - 1][x] !== '#') r--; return r; };
    const seen = new Set(), q = []; const push = (x, r) => { if (!free(x, r)) return; r = fall(x, r); if (!free(x, r) || (r > 0 && g[r - 1][x] === 'i' && !wet(x, r))) return; const k = x + ',' + r; if (seen.has(k)) return; seen.add(k); q.push([x, r]); };
    push(start[0], start[1]);
    while (q.length) { const [x, r] = q.pop(); if (x === goal[0] && r === goal[1]) return true;
      for (const d of [-1, 1]) push(x + d, r);
      if (wet(x, r)) { push(x, r + 1); push(x, r - 1); }
      for (let u = 1; u <= 2; u++) { let ok = true; for (let t = 1; t <= u; t++) if (!free(x, r + t)) ok = false; if (!ok) break;
        push(x, r + u);
        for (const d of [-1, 1]) for (let s = 1; s <= (u === 2 ? 5 : 6); s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r + u)) ok2 = false; if (!ok2) break; push(x + d * s, r + u); } }
      for (const d of [-1, 1]) for (let s = 2; s <= 7; s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r)) ok2 = false; if (!ok2) break; push(x + d * s, r); } }
    return false; };
  return { settle, chains, apply, reach };
}
function solveModel(map, opt = {}) {
  const { g: g0, W, H, start, goal } = parseMap(map), M = makeModel(W, H, opt.maxPath || 5), maxDepth = opt.maxDepth || 6, cap = opt.cap || 300000;
  const key = g => g.map(r => r.join('')).join('/'), s0 = g0.map(r => r.slice()); M.settle(s0);
  if (M.reach(s0, start, goal)) return { depth: 0, solutions: [[]], states: 1 };
  const seen = new Map([[key(s0), 1]]); let frontier = [{ g: s0, hist: [] }];
  for (let d = 1; d <= maxDepth; d++) { const next = [], sols = [];
    for (const { g, hist } of frontier) for (const p of M.chains(g)) { const h = M.apply(g, p), kk = key(h); if (seen.has(kk)) continue; seen.set(kk, 1);
      const nh = hist.concat([{ kind: g[p[0][1]][p[0][0]], cells: p.map(([x, r]) => [x, H - 1 - r]) }]);
      if (M.reach(h, start, goal)) sols.push(nh); else next.push({ g: h, hist: nh }); if (seen.size > cap) return { depth: null, solutions: [], states: seen.size, capped: true }; }
    if (sols.length) return { depth: d, solutions: sols, states: seen.size }; frontier = next; if (!frontier.length) break; }
  return { depth: null, solutions: [], states: seen.size };
}
module.exports = { parseMap, makeModel, solveModel };
if (require.main === module) {
  // self test: the second visit of Abandoned Basin (owner's solution = 2 gatherings)
  const W = 14, H = 11, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), R = r => H - 2 - r;           // r = 0 is the standing row of the floor, the bottom row H-1 is earth
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  for (let r = 0; r <= 2; r++) rows[R(r)][1] = '#';                                          // the ledge (c0 -> col 1)
  for (let r = 2; r <= 4; r++) for (let x = 8; x < W - 1; x++) rows[R(r)][x] = '#';            // the mass
  for (let x = 3; x <= 6; x++) { for (let r = 0; r <= 2; r++) rows[R(r)][x] = 'a'; rows[R(3)][x] = 'i'; }
  rows[R(3)][1] = 'P'; rows[R(5)][8] = 'G';
  const map = rows.map(r => r.join('')); console.log(map.join('\n'));
  const r = solveModel(map, { maxDepth: 4, maxPath: 4 }); console.log(r.depth, r.solutions.length, r.states); if (r.solutions[0]) console.log(JSON.stringify(r.solutions[0]));
}
