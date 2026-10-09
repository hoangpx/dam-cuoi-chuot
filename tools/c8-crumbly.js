// Crumbly Overhang as in the reference: the mouse starts on the glowing chest (bottom right) and must reach the notch on the left (col 0, standing row 4).
const { level, chains, settle } = require('./c8-solve.js');
const W = 14, H = 11, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) g[10][x] = '#';
for (let y = 5; y <= 10; y++) g[y][0] = '#';
for (let y = 2; y <= 6; y++) for (let x = 4; x <= 8; x++) g[y][x] = '#';
for (let y = 3; y <= 6; y++) g[y][9] = '#';
for (let y = 4; y <= 6; y++) for (let x = 10; x < W; x++) g[y][x] = '#';
for (let x = 10; x < W; x++) g[0][x] = '#'; for (let x = 11; x < W; x++) g[1][x] = '#';
for (let x = 0; x <= 2; x++) { g[3][x] = 'd'; g[4][x] = 'd'; } for (let y = 5; y <= 9; y++) { g[y][1] = 'a'; g[y][2] = 'a'; }
g[9][6] = 'P'; const tx = +(process.env.TX ?? 4), ty = +(process.env.TY ?? 1);
const map = ['#'.repeat(W + 2), ...g.map(r => '#' + r.join('') + '#'), '#'.repeat(W + 2)];
const env = level({ map }, false), { P } = env, w = P.W, h = P.H, goal = (ty + 1) * w + tx + 1;
const c0 = P.cells.slice(); settle(c0, w, h); const start = env.stand(c0, P.start.x, P.start.y);
for (const S of JSON.parse(process.env.PRE || '[]')) { for (const [x, y] of S) c0[(y + 1) * w + x + 1] = ' '; settle(c0, w, h); }   // gatherings already made (picture coordinates)
const sols = [], seen = new Set(); const label = S => S.map(i => `${'abcd'.includes(c0[i]) ? '' : ''}(${i % w - 1},${((i / w) | 0) - 1})`).join('');
function go(c, q, path, depth) {
  const R = env.reach(c, q[0], q[1]); if (R.has(goal)) { sols.push(path); return; }
  if (!depth) return;
  for (const idx of R) { const qx = idx % w, qy = (idx / w) | 0;
    for (const S of chains(c, w, h)) {
      const c2 = c.slice(); const kind = c[S[0]]; for (const i of S) c2[i] = ' '; settle(c2, w, h);
      if (env.solid(c2, qx, qy)) continue; const q2 = env.stand(c2, qx, qy); if (!q2) continue;
      const k = c2.join('') + q2 + path.length; if (seen.has(k)) continue; seen.add(k);
      go(c2, q2, path.concat([kind + ':' + label(S)]), depth - 1);
    } }
}
for (let d = 1; d <= (+process.argv[2] || 6) && !sols.length; d++) { seen.clear(); go(c0, start, [], d); if (sols.length) console.log(`${d} gatherings, ${new Set(sols.map(s => [...s].sort().join(' | '))).size} different sets of gatherings:`); }
const uniq = new Map(); for (const s of sols) uniq.set(s.join(' → '), s); [...uniq.keys()].slice(0, 25).forEach(k => console.log('  ' + k));
