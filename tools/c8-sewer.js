// Overflowing Sewer (analysis only): the corridor row f1 and the T-shaped cave over it. cols: 0 free, 1-2 ice (the 2-wide plug), 3 P, 4 Q (over the water shaft), 5 R, 6 ice plug, 7 free.
// rows: 0 = f1 (corridor), 1 = f2 (cave, cols 3-5), 2 = f3 (cave chimney, col 4). Goal: no ice left in the corridor row (the mouse walks it from col 7 to col 0).
// Melt rule variants: MELT=any (every ice next to the release cell melts to a water block) | ahead (only the ice in the drag direction).
const W = 8, H = 3, MELT = process.env.MELT || 'any';
const open = (x, y) => y === 0 || (y === 1 && x >= 3 && x <= 5) || (y === 2 && x === 4);
const start = Array.from({ length: H }, () => new Array(W).fill('#'));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open(x, y)) start[y][x] = ' ';
const put = (x, y, k) => { start[y][x] = k; };
put(1, 0, 'i'); put(2, 0, 'i'); put(3, 0, 'a'); put(4, 0, 'a'); put(5, 0, 'a'); put(6, 0, 'i');
put(3, 1, 'i'); put(4, 1, 'a'); put(5, 1, 'i'); put(4, 2, 'i');
const key = g => g.map(r => r.join('')).join('/');
function settle(g) { for (let m = true; m;) { m = false; for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) if ('aiw'.includes(g[y][x]) && g[y - 1][x] === ' ') { g[y - 1][x] = g[y][x]; g[y][x] = ' '; m = true; } } }
function chains(g) {
  const out = []; const nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && a < W && b >= 0 && b < H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = g[y][x]; if (!'aiw'.includes(k)) continue;
    const path = [[x, y]]; (function dfs() { if (path.length >= 3) out.push(path.map(p => p.slice())); for (const n of nb(path[path.length - 1])) if (g[n[1]][n[0]] === k && !path.some(p => p[0] === n[0] && p[1] === n[1])) { path.push(n); dfs(); path.pop(); } })(); }
  return out;
}
function apply(g, path) {
  const h = g.map(r => r.slice()), k = g[path[0][1]][path[0][0]];
  for (const [x, y] of path) h[y][x] = ' ';
  if (k === 'a') { const e = path[path.length - 1], p = path[path.length - 2];
    const cand = MELT === 'any' ? [[e[0] + 1, e[1]], [e[0] - 1, e[1]], [e[0], e[1] + 1], [e[0], e[1] - 1]] : [[e[0] + (e[0] - p[0]), e[1] + (e[1] - p[1])]];
    for (const [x, y] of cand) if (x >= 0 && x < W && y >= 0 && y < H && h[y][x] === 'i') h[y][x] = 'w'; }
  settle(h); return h;
}
const done = g => !g[0].includes('i');
const seen = new Map([[key(start), []]]); let frontier = [{ g: start, hist: [] }], best = null;
for (let d = 0; d < 5 && !best; d++) { const next = [];
  for (const { g, hist } of frontier) for (const p of chains(g)) { const h = apply(g, p), kk = key(h); if (seen.has(kk)) continue; const nh = hist.concat([{ kind: g[p[0][1]][p[0][0]], path: p.map(c => c.join(',')).join(' ') }]); seen.set(kk, nh); if (done(h)) { best = nh; break; } next.push({ g: h, hist: nh }); }
  if (best) break; frontier = next; }
console.log('melt rule', MELT, best ? 'solved in ' + best.length + ' gatherings' : 'no solution within 5 gatherings'); if (best) best.forEach((m, i) => console.log(i + 1, m.kind, m.path));
