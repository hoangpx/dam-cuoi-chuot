// Overflowing Sewer with the WATER below gatherable (owner, 2026-10-08: "nước ở phía dưới cũng match được"). Analysis only.
// cols 0..9 (col 4 = Q over the shaft, col 6 = right plug ice, 7..9 free = the way back); y = 0 the corridor, y = -1..-4 the shaft (col 4), y = -4 also the tunnel (cols 5..9).
// kinds: a flame, i ice, w melted ice (water block), v the water of the shaft/tunnel (static, can be gathered, supports things). Melt rule: only the ice AHEAD of the release cell (drag direction).
const W = 10, Y0 = 4, H = 5, MELT = process.env.MELT || 'ahead';           // rows stored top-down: index r = Y0 - y  (y = 0 → r 4? use r = H-1-(y+4))
const R = y => H - 1 - (y + 4);                                          // y = 0 → row 4 ... wait y=0 is the TOP of the structure here
const idx = y => -y;                                                    // row index = -y for the shaft (0 corridor, 1..4 below); the cave is ABOVE: handled with a second block
// simpler: use real coordinates, row 0 = bottom of the tunnel; corridor row = 4; cave f2 = 5, chimney f3 = 6
const HH = 7, CORR = 4;
const brick = (x, r) => { if (r === CORR) return false; if (r > CORR) return !((r === 5 && x >= 3 && x <= 5) || (r === 6 && x === 4)); if (r === 0) return x < 4; return x !== 4; };
let g0 = Array.from({ length: HH }, (_, r) => Array.from({ length: W }, (_, x) => brick(x, r) ? '#' : ' '));
const set = (x, r, k) => { g0[r][x] = k; };
for (const [x, k] of [[1, 'i'], [2, 'i'], [3, 'a'], [4, 'a'], [5, 'a'], [6, 'i']]) set(x, CORR, k);
set(3, 5, 'i'); set(4, 5, 'a'); set(5, 5, 'i'); set(4, 6, 'i');
for (let r = 1; r <= 3; r++) set(4, r, 'v'); for (let x = 4; x <= 9; x++) set(x, 0, 'v');
const key = g => g.map(r => r.join('')).join('/');
const nb = (x, r) => [[x + 1, r], [x - 1, r], [x, r + 1], [x, r - 1]].filter(([a, b]) => a >= 0 && a < W && b >= 0 && b < HH);
function settle(g) { for (let m = true; m;) { m = false; for (let r = 1; r < HH; r++) for (let x = 0; x < W; x++) if ('aiwv'.includes(g[r][x]) && g[r - 1][x] === ' ') { g[r - 1][x] = g[r][x]; g[r][x] = ' '; m = true; } } }
function chains(g) { const out = []; for (let r = 0; r < HH; r++) for (let x = 0; x < W; x++) { const k = g[r][x]; if (!'aiwv'.includes(k) || k === ' ') continue;
  const path = [[x, r]]; (function dfs() { if (path.length >= 3) out.push(path.map(p => p.slice())); if (path.length >= 7) return; for (const n of nb(...path[path.length - 1])) if (g[n[1]][n[0]] === k && !path.some(p => p[0] === n[0] && p[1] === n[1])) { path.push(n); dfs(); path.pop(); } })(); } return out; }
function apply(g, path) { const h = g.map(r => r.slice()), k = g[path[0][1]][path[0][0]]; for (const [x, r] of path) h[r][x] = ' ';
  if (k === 'a') { const e = path[path.length - 1], p = path[path.length - 2], x = e[0] + (e[0] - p[0]), r = e[1] + (e[1] - p[1]); if (x >= 0 && x < W && r >= 0 && r < HH && h[r][x] === 'i') h[r][x] = 'w'; }
  settle(h); return h; }
// the mouse: from (9, CORR) to (0, CORR); free = not brick, not ice. moves: step, jump over up to 3 free cells in a row, up 1-2, down (fall), swim in water
function reach(g) { const free = (x, r) => x >= 0 && x < W && r >= 0 && r < HH && g[r][x] !== '#' && g[r][x] !== 'i'; const seen = new Set(['9,' + CORR]), q = [[9, CORR]];
  while (q.length) { const [x, r] = q.pop(); if (x === 0 && r === CORR) return true; const nx = [];
    for (let d = 1; d <= 3; d++) { let ok = true; for (let t = 1; t <= d; t++) if (!free(x + t, r)) ok = false; if (ok) nx.push([x + d, r]); ok = true; for (let t = 1; t <= d; t++) if (!free(x - t, r)) ok = false; if (ok) nx.push([x - d, r]); }
    for (let d = 1; d <= 2; d++) { let ok = true; for (let t = 1; t <= d; t++) if (!free(x, r + t)) ok = false; if (ok) nx.push([x, r + d]); }
    for (let d = 1; d <= 6; d++) { let ok = true; for (let t = 1; t <= d; t++) if (!free(x, r - t)) ok = false; if (ok) nx.push([x, r - d]); }
    for (const [a, b] of nx) if (!seen.has(a + ',' + b)) { seen.add(a + ',' + b); q.push([a, b]); } } return false; }
const seen = new Map([[key(g0), []]]); let frontier = [{ g: g0, hist: [] }], best = [];
const maxD = +(process.argv[2] || 4);
for (let d = 0; d < maxD && !best.length; d++) { const next = [];
  for (const { g, hist } of frontier) for (const p of chains(g)) { const h = apply(g, p), kk = key(h); if (seen.has(kk)) continue; const nh = hist.concat([{ kind: g[p[0][1]][p[0][0]], path: p.map(c => c[0] + ',' + (c[1] - CORR)).join(' ') }]); seen.set(kk, nh); if (reach(h)) best.push(nh); else next.push({ g: h, hist: nh }); }
  frontier = next; console.error('depth', d + 1, 'states', seen.size, 'frontier', frontier.length); }
console.log('melt', MELT, best.length ? best.length + ' solutions at depth ' + best[0].length : 'none within ' + maxD);
best.slice(0, 6).forEach(b => console.log(b.map(m => m.kind + ':' + m.path).join('  |  ')));
