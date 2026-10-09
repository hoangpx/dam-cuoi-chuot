/* Chương VIII level maker (offline): node tools/c8-gen.js <template> <count> [seed]
   templates: wall (a pile of things blocks a corridor), climb (the chest is on a high ledge: build steps), pit (thorny
   pit: stacks to shape into stepping stones). Random layouts are kept only if tools/c8-solve.js says: solvable, needs at
   least 2 gatherings, no way round. Prints JS-ready maps sorted by effort (states searched). */
const { solve } = require('./c8-solve.js');
const [tpl = 'wall', countArg = '8', seedArg = '1'] = process.argv.slice(2);
let seed = +seedArg * 7919 + 13; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];

function grid(W, H) { return Array.from({ length: H }, () => new Array(W).fill(' ')); }
function box(g) { const H = g.length, W = g[0].length; for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; } }
function fillZone(g, x0, x1, y0, y1, kinds, p) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y][x] === ' ' && rnd() < p) g[y][x] = pick(kinds); }
function settleG(g) { const H = g.length, W = g[0].length; for (let m = true; m;) { m = false; for (let y = H - 2; y >= 0; y--) for (let x = 0; x < W; x++) if ('abcd'.includes(g[y][x]) && g[y][x] !== ' ' && g[y + 1][x] === ' ') { g[y + 1][x] = g[y][x]; g[y][x] = ' '; m = true; } } }
// only clods (d) stop the mouse, the other kinds it walks through (they are still gathered and still hold things up): always some d, plus 1–2 soft kinds
const kindsOf = () => { const soft = ['a', 'b', 'c'], out = ['d']; const n = ri(1, 2); while (out.length < n + 1) { const k = pick(soft); if (!out.includes(k)) out.push(k); } return out; };

function makeWall() {
  const W = ri(15, 19), H = ri(6, 8), g = grid(W, H); box(g);
  g[H - 2][1] = 'P'; g[H - 2][W - 2] = 'G';
  const w = ri(2, 4), x0 = ri(5, W - 6 - w);
  fillZone(g, x0, x0 + w - 1, 1, H - 2, kindsOf(), .62); settleG(g);
  return g;
}
function makeClimb() {
  const W = ri(14, 17), H = ri(8, 10), g = grid(W, H); box(g);
  const th = ri(3, 5), tx = ri(8, W - 5);                       // the tower the chest stands on: th cells tall
  for (let y = H - 1 - th; y < H - 1; y++) for (let x = tx; x < W - 1; x++) g[y][x] = '#';
  g[H - 2 - th][W - 2] = 'G'; g[H - 2][1] = 'P';
  const x0 = ri(3, tx - 2), kinds = kindsOf();
  fillZone(g, x0, tx - 1, 1, H - 2, kinds, .6); settleG(g);
  return g;
}
function makePit() {
  const W = ri(17, 21), H = ri(9, 11), g = grid(W, H); box(g);
  const cl = ri(3, 4), pl = ri(1, 2), pitX0 = cl + 1, pitW = ri(5, 7), pitX1 = pitX0 + pitW - 1;
  const top = ri(3, 4);                                         // the cliffs' top row (standing row top-1)
  for (let y = top; y < H - 1; y++) for (let x = 1; x < pitX0; x++) g[y][x] = '#';
  for (let y = top + ri(0, 1); y < H - 1; y++) for (let x = pitX1 + 1; x < W - 1; x++) g[y][x] = '#';
  for (let x = pitX0; x <= pitX1; x++) g[H - 2][x] = 'x';
  g[top - 1][ri(1, cl)] = 'P';
  const rt = (() => { for (let y = 1; y < H; y++) if (g[y][W - 2] === '#') return y; })();
  g[rt - 1][W - 2] = 'G';
  const kinds = kindsOf(), cols = []; for (let x = pitX0 + 1; x < pitX1; x += 2) cols.push(x);
  for (const x of cols) { const h = ri(3, H - 4); for (let k = 0; k < h; k++) if (rnd() < .88) g[H - 3 - k][x] = (k === h - 1 && rnd() < .5) ? 'd' : pick(kinds); }
  settleG(g);
  return g;
}
const make = { wall: makeWall, climb: makeClimb, pit: makePit }[tpl];
const want = +countArg, found = []; let tries = 0; const seen = new Set();
while (found.length < want && tries < 4000) {
  tries++;
  const g = make(); const map = g.map(r => r.join('')), key = map.join('/'); if (seen.has(key)) continue; seen.add(key);
  const cells = map.join('').replace(/[^abcd]/g, '').length; if (cells < 6 || cells > 16) continue;
  const L = { name: 'x', map };
  let r; try { r = solve(L, { maxDepth: 5, cap: 30000 }); } catch (e) { continue; }
  if (r.error || r.capped || r.minMoves === null || r.cheat || r.noMatchReach || r.minMoves < 2) continue;
  found.push({ map, moves: r.minMoves, states: r.states });
}
found.sort((a, b) => a.moves - b.moves || a.states - b.states);
for (const f of found) { console.log(`// moves ${f.moves}, states ${f.states}`); console.log("  [" + f.map.map(r => "'" + r + "'").join(',\n   ') + ']'); }
console.error(`${found.length} found in ${tries} tries`);
