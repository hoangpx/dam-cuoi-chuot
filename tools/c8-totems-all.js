// every shortest solution of Totems: how many things each tower keeps in the end (picture columns 0 and 3)
const { level, chains, settle } = require('./c8-solve.js');
const W = 20, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; g[H - 2][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
const rock = (c0, c1, top) => { for (let c = c0; c <= c1; c++) for (let r = top + 1; r < H; r++) g[r][c + 5] = '#'; };
for (let x = 0; x < 5; x++) for (let y = 11; y < H; y++) g[y][x] = '#';
rock(0, 2, 9); rock(3, 5, 8); rock(6, 8, 7); rock(9, 9, 5); rock(10, 13, 3);
const put = (c, rows, ch) => rows.forEach(r => { g[r + 1][c + 5] = ch; });
put(0, [2, 3, 7, 8], 'd'); put(0, [4, 5, 6], 'a'); put(3, [1, 2, 6, 7], 'd'); put(3, [3, 4, 5], 'b'); put(6, [0, 1, 5, 6], 'd'); put(6, [2, 3, 4], 'o');
g[10][1] = 'P'; g[3][16] = 'G'; const map = g.map(r => r.join(''));
const env = level({ map }, false), { P } = env, w = P.W, h = P.H, goal = P.goal.y * w + P.goal.x;
const c0 = P.cells.slice(); settle(c0, w, h); const start = env.stand(c0, P.start.x, P.start.y);
const res = new Map(); const seen = new Set();
const count = (c, col) => { let n = 0; for (let y = 0; y < h; y++) if ('abcd'.includes(c[y * w + col + 5])) n++; return n; };
function go(c, q, depth, n) {
  const R = env.reach(c, q[0], q[1]); if (R.has(goal)) { const k = `${n} gatherings: left tower keeps ${count(c, 0)}, middle keeps ${count(c, 3)}`; res.set(k, (res.get(k) || 0) + 1); return; }
  if (!depth) return;
  for (const idx of R) { const qx = idx % w, qy = (idx / w) | 0;
    for (const S of chains(c, w, h)) { const c2 = c.slice(); for (const i of S) c2[i] = ' '; settle(c2, w, h); if (env.solid(c2, qx, qy)) continue; const q2 = env.stand(c2, qx, qy); if (!q2) continue;
      const key = c2.join('') + q2 + depth; if (seen.has(key)) continue; seen.add(key); go(c2, q2, depth - 1, n + 1); } }
}
go(c0, start, 5, 0);
[...res].sort().forEach(([k, v]) => console.log(k, '(x' + v + ')'));
