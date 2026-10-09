/* Chương VIII: "Fiery Pit" (analysis only, owner's picture 2026-10-09): rocks 'd' (solid, fall, pushed one at a time, gathered 3+), flames 'a' (soft: the mouse walks through, fall, gathered 3+; a rock pushed into a flame SWAPS with it).
   Cells counted from the gold box (x = 0); rows r0 = the pit bottom (y 651-745 in the picture), r1, r2 = the ground row, r3, r4, r5 = the top row under the ceiling.
   node tools/c8-fiery.js   (env DEPTH, PATH = longest gathering) */
const { makeModel } = require('./c8-model.js');
const W = 20, H = 8, g0 = Array.from({ length: H }, () => new Array(W).fill(' '));          // g[rr][x]
const solid = (x, r) => { if (x < 0) return true; if (x === 0) return r <= 1 || r >= 3; if (x <= 3) return r <= 1; if (x <= 5) return r < 0; if (x <= 7) return r <= 1; if (x === 8) return r <= 0; if (x <= 10) return r <= 1 || r >= 3; if (x === 11) return r >= 3; if (x <= 16) return r >= 2; return false; };
for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) if (solid(x, r) || (x <= 10 && r >= 6)) g0[r][x] = '#';
for (let r = 6; r < H; r++) for (let x = 11; x < W; x++) g0[r][x] = '#';
for (const x of [4, 5]) { for (let r = 0; r <= 4; r++) g0[r][x] = 'a'; g0[5][x] = 'd'; } g0[2][9] = 'd';
const M = makeModel(W, H, +(process.env.PATH_LEN || 5)), START = [1, 2], GOAL = [17, 0];
// every standing cell the mouse can reach from p (same moves as the model's reach, collected)
function reachSet(g, p) {
  const free = (x, r) => x >= 0 && x < W && r >= 0 && r < H && g[r][x] !== '#' && g[r][x] !== 'd';
  const fall = (x, r) => { while (r > 0 && free(x, r - 1)) r--; return r; };
  const seen = new Map(), q = []; const push = (x, r) => { if (!free(x, r)) return; r = fall(x, r); const k = x + ',' + r; if (seen.has(k)) return; seen.set(k, [x, r]); q.push([x, r]); };
  push(p[0], p[1]);
  while (q.length) { const [x, r] = q.pop(); for (const d of [-1, 1]) push(x + d, r);
    for (let u = 1; u <= 2; u++) { let ok = true; for (let t = 1; t <= u; t++) if (!free(x, r + t)) ok = false; if (!ok) break; push(x, r + u);
      for (const d of [-1, 1]) for (let s = 1; s <= (u === 2 ? 5 : 6); s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r + u)) ok2 = false; if (!ok2) break; push(x + d * s, r + u); } }
    for (const d of [-1, 1]) for (let s = 2; s <= 7; s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r)) ok2 = false; if (!ok2) break; push(x + d * s, r); } }
  return [...seen.values()];
}
const OBJ2 = 'ad';
const key = (g, m) => g.map(r => r.join('')).join('/') + '@' + m[0] + ',' + m[1];
const settleKeep = (g, m) => { M.settle(g); return g[m[1]][m[0]] !== 'd' && g[m[1]][m[0]] !== '#'; };   // the mouse cell must not hold a rock afterwards (crush)
function expand(g, m) {
  const out = [], cells = reachSet(g, m);
  for (const p of cells) {
    if (p[0] === GOAL[0] && p[1] === GOAL[1]) return { goal: true };
    for (const d of [-1, 1]) { const x = p[0] + d, y = x + d; if (g[p[1]][x] === 'd' && y >= 0 && y < W && (g[p[1]][y] === ' ' || g[p[1]][y] === 'o' || g[p[1]][y] === 'a')) {
      const h = g.map(r => r.slice()); const behind = h[p[1]][y]; h[p[1]][y] = 'd'; h[p[1]][x] = (behind === 'o' || behind === 'a') ? behind : ' ';
      const mm = [p[0], p[1]]; if (settleKeep(h, mm)) out.push({ g: h, m: mm, act: 'push ' + (d > 0 ? 'right' : 'left') + ' the rock at x' + x + ' r' + p[1] + ' (mouse on x' + p[0] + ' r' + p[1] + ')' }); } }
    // gather: all chains of rocks; the mouse stays at p
    for (const ch of M.chains(g)) { if (!OBJ2.includes(g[ch[0][1]][ch[0][0]])) continue; const h = M.apply(g, ch); if (h[p[1]][p[0]] === 'd') continue; out.push({ g: h, m: p, act: 'gather ' + g[ch[0][1]][ch[0][0]] + ' ' + ch.map(c => 'x' + c[0] + 'r' + c[1]).join(' ') + ' (mouse on x' + p[0] + ' r' + p[1] + ')' }); }
  }
  return { out };
}
if (process.env.DEBUG) { console.log(g0.map(r => r.join('')).reverse().join(String.fromCharCode(10))); console.log('reach', JSON.stringify(reachSet(g0, START))); console.log((expand(g0, START).out || []).map(o => o.act).join(String.fromCharCode(10))); process.exit(0); }
const seen = new Set([key(g0, START)]); let frontier = [{ g: g0, m: START, path: [] }];
for (let depth = 1; depth <= +(process.env.DEPTH || 14) && frontier.length; depth++) { const next = [];
  for (const s of frontier) { const e = expand(s.g, s.m); if (e.goal) { console.log('GOAL after', s.path.length, 'actions:'); s.path.forEach((a, i) => console.log(i + 1, a)); process.exit(0); }
    if (process.env.CH && s.path.length >= 1 && M.chains(s.g).some(c => s.g[c[0][1]][c[0][0]] === 'd' && c.some(([x]) => x >= 10))) { console.log('chain near R after', s.path.join(' ; ')); console.log(s.g.map(r => r.join('')).reverse().join(String.fromCharCode(10))); process.exit(0); }
    if (process.env.FORM) { const g = s.g, rocks = []; g.forEach((r, rr) => r.forEach((c, x) => { if (c === 'd') rocks.push(x + ',' + rr); })); const has = (x, r) => g[r][x] === 'd'; if (has(5, 2) && has(7, 2) && has(6, 3) && g[2][6] === 'o') { console.log('FORMATION reached after', s.path.length, 'actions:'); s.path.forEach((a, i) => console.log(i + 1, a)); console.log(g.map(r => r.join('')).reverse().join(String.fromCharCode(10))); process.exit(0); } }
    if (process.env.FAR) { let mx = 0; s.g.forEach(r => r.forEach((c, x) => { if (c === 'd' && x > mx) mx = x; })); if (mx >= 9 && !global.shown) { global.shown = 1; console.log('a rock at x' + mx + ' after', s.path.join(' ; ')); console.log(s.g.map(r => r.join('')).reverse().join(String.fromCharCode(10))); } }
    for (const o of e.out) { const k = key(o.g, o.m); if (seen.has(k)) continue; seen.add(k); next.push({ g: o.g, m: o.m, path: s.path.concat([o.act]) }); } }
  frontier = next; console.error('depth', depth, 'states', seen.size); }
console.log('no solution; explored', seen.size, 'states');
