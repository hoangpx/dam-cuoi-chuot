// "Scroll room" (owner's picture 2026-10-08): collect the 3 scrolls on the far left; analysis only. Model as tools/c8-sewer3.js: kinds a flame, b spiral (soft), i ice (deadly), w water block, v pool water (both fall, match only their own kind, support things, swimmable), # brick.
// melt: only the ice AHEAD of the release cell (drag direction). Mouse reach with a rough hop model. usage: node tools/c8-scrolls.js [depth] [maxPath]
// Abandoned Basin, second visit: mouse on the left ledge, goal = the top of the right mass (standing cell r5 at c>=7).
const W = 14, H = 9;
const g0 = Array.from({ length: H }, () => new Array(W).fill(" "));
for (let r = 0; r <= 2; r++) g0[r][0] = "#";                                   // the ledge (top surface at the top of r2)
for (let r = 2; r <= 4; r++) for (let x = 7; x < W; x++) g0[r][x] = "#";        // the mass (top at the top of r4)
for (let x = 2; x <= 5; x++) { for (let r = 0; r <= 2; r++) g0[r][x] = "a"; g0[3][x] = "i"; }
const MAXP = +(process.argv[3] || 6), maxD = +(process.argv[2] || 3);
const key = g => g.map(r => r.join('')).join('/');
const nb = (x, r) => [[x + 1, r], [x - 1, r], [x, r + 1], [x, r - 1]].filter(([a, b]) => a >= 0 && a < W && b >= 0 && b < H);
function settle(g) { for (let m = true; m;) { m = false; for (let r = 1; r < H; r++) for (let x = 0; x < W; x++) if ('aibwv'.includes(g[r][x]) && g[r - 1][x] === ' ') { g[r - 1][x] = g[r][x]; g[r][x] = ' '; m = true; } } }
const same = (a, b) => a === b || ("wv".includes(a) && "wv".includes(b) && a !== " " && b !== " ");
function chains(g) { const out = []; for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) { const k = g[r][x]; if (!'aiwv'.includes(k) || k === ' ') continue; if (k === 'w' && false) continue;
  const path = [[x, r]]; (function dfs() { if (path.length >= 3) out.push(path.map(p => p.slice())); if (path.length >= MAXP) return; for (const n of nb(...path[path.length - 1])) if (same(g[n[1]][n[0]], k) && !path.some(p => p[0] === n[0] && p[1] === n[1])) { path.push(n); dfs(); path.pop(); } })(); } return out; }
function apply(g, path) { const h = g.map(r => r.slice()), k = g[path[0][1]][path[0][0]]; for (const [x, r] of path) h[r][x] = ' ';
  if (k === 'a') { const e = path[path.length - 1], p = path[path.length - 2], x = e[0] + (e[0] - p[0]), r = e[1] + (e[1] - p[1]); if (x >= 0 && x < W && r >= 0 && r < H && h[r][x] === 'i') h[r][x] = 'w'; }
  settle(h); return h; }
// mouse: from (15, 0); goal: any cell with x <= 3. free = inside, not brick, not ice. water = w or v.
function reach(g) { const free = (x, r) => x >= 0 && x < W && r >= 0 && r < H && g[r][x] !== '#' && g[r][x] !== 'i', wet = (x, r) => 'wv'.includes(g[r][x]);
  const support = (x, r) => r === 0 || g[r - 1][x] === '#' || wet(x, r) || wet(x, r - 1) ;
  const fall = (x, r) => { while (r > 0 && free(x, r - 1) && !wet(x, r) && !wet(x, r - 1) && g[r - 1][x] !== '#') r--; return r; };
  const seen = new Set(), q = []; const push = (x, r) => { if (!free(x, r)) return; r = fall(x, r); if (!free(x, r) || (r > 0 && g[r - 1][x] === 'i' && !wet(x, r))) return; const k = x + ',' + r; if (seen.has(k)) return; seen.add(k); q.push([x, r]); };
  push(0, 3);
  while (q.length) { const [x, r] = q.pop(); if (x >= 7 && r >= 5) return true;
    for (const d of [-1, 1]) { push(x + d, r); }
    if (wet(x, r)) { push(x, r + 1); push(x, r - 1); }                                  // swim
    for (let u = 1; u <= 2; u++) { let ok = true; for (let t = 1; t <= u; t++) if (!free(x, r + t)) ok = false; if (!ok) break;
      push(x, r + u);
      for (const d of [-1, 1]) for (let s = 1; s <= (u === 2 ? 3 : 4); s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r + u)) ok2 = false; if (!ok2) break; push(x + d * s, r + u); } }
    for (const d of [-1, 1]) for (let s = 2; s <= 4; s++) { let ok2 = true; for (let t = 1; t <= s; t++) if (!free(x + d * t, r)) ok2 = false; if (!ok2) break; push(x + d * s, r); } }   // flat flights over gaps
  return false; }
console.log(g0.map(r => r.join('')).reverse().join('\n'));
console.log('reach at start:', reach(g0));
const seen = new Map([[key(g0), []]]); let frontier = [{ g: g0, hist: [] }], best = [];
for (let d = 0; d < maxD && !best.length; d++) { const next = [];
  for (const { g, hist } of frontier) for (const p of chains(g)) { const h = apply(g, p), kk = key(h); if (seen.has(kk)) continue; const nh = hist.concat([{ kind: g[p[0][1]][p[0][0]], path: p.map(c => c[0] + ',' + c[1]).join(' ') }]); seen.set(kk, nh); if (reach(h)) best.push(nh); else next.push({ g: h, hist: nh }); }
  frontier = next; console.error('depth', d + 1, 'states', seen.size, 'frontier', frontier.length); }
console.log(best.length ? best.length + ' solutions at depth ' + best[0].length : 'none within ' + maxD);
best.slice(0, 5).forEach(b => console.log(b.map(m => m.kind + ':' + m.path).join('  |  ')));
