// from the Crumbly Overhang picture (right-hand flames already eaten): how high can the mouse get with n more gatherings?
const { level, chains, settle } = require('./c8-solve.js');
const W = 14, H = 11, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) g[10][x] = '#';
for (let y = 5; y <= 10; y++) g[y][0] = '#';
for (let y = 2; y <= 6; y++) for (let x = 4; x <= 8; x++) g[y][x] = '#';
for (let y = 3; y <= 6; y++) g[y][9] = '#';
for (let y = 4; y <= 6; y++) for (let x = 10; x < W; x++) g[y][x] = '#';
for (let x = 10; x < W; x++) g[0][x] = '#'; for (let x = 11; x < W; x++) g[1][x] = '#';
for (let x = 0; x <= 2; x++) { g[3][x] = 'd'; g[4][x] = 'd'; } for (let y = 5; y <= 9; y++) { g[y][1] = 'a'; g[y][2] = 'a'; }
g[9][7] = 'P'; g[1][7] = 'G';
const map = ['#'.repeat(W + 2), ...g.map(r => '#' + r.join('') + '#'), '#'.repeat(W + 2)];
const env = level({ map }, false), gen = level({ map }, true), { P } = env, w = P.W, h = P.H;
const c0 = P.cells.slice(); settle(c0, w, h);
const start = env.stand(c0, P.start.x, P.start.y);
let best = { y: 99 }, bestG = { y: 99 }; const seen = new Set();
function go(c, q, path, depth) {
  const R = env.reach(c, q[0], q[1]), RG = gen.reach(c, q[0], q[1]);
  for (const i of R) { const y = (i / w) | 0; if (y < best.y) best = { y, x: i % w, path }; }
  for (const i of RG) { const y = (i / w) | 0; if (y < bestG.y) bestG = { y, x: i % w, path }; }
  if (!depth) return;
  for (const idx of R) { const qx = idx % w, qy = (idx / w) | 0;
    for (const S of chains(c, w, h)) {
      const c2 = c.slice(); for (const i of S) c2[i] = ' '; settle(c2, w, h);
      if (env.solid(c2, qx, qy)) continue; const q2 = env.stand(c2, qx, qy); if (!q2) continue;
      const k = c2.join('') + q2; if (seen.has(k)) continue; seen.add(k);
      go(c2, q2, path.concat([S.map(i => [i % w - 1, ((i / w) | 0) - 1])]), depth - 1);
    } }
}
go(c0, start, [], +(process.argv[2] || 4));
const show = b => `highest standing row ${b.y - 1} at col ${b.x - 1} (screen rows; plateau top = 1); gatherings: ${JSON.stringify(b.path)}`;
console.log('conservative:', show(best)); console.log('tight hops allowed:', show(bestG));
