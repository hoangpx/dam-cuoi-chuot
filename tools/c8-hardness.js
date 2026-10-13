/* Chương VIII: how hard is a level to FIND (not how long it is). Owner, 2026-10-11: "hard to find moves, hidden moves, creative moves
   ... instead of too many objects or too long". Uses the abstract model (tools/c8-model.js, swipes up to MP cells), so the mouse's place
   during a swipe is not modelled. Reports:
   - shortest: fewest swipes to win;
   - firsts: distinct first moves (distinct boards after one swipe), good: how many of them lie on a shortest road;
   - roads: distinct shortest roads (sequences of boards), 1 = one order only, no filler swipes that can be done any time;
   - pRandom: chance that a player picking uniformly among the distinct moves at every step wins within `shortest` swipes;
   - deadFirst: share of first moves after which there is no win at all within shortest + 2 swipes (the mistake is clear, not just slower).
   - greedy: first moves that at once let the mouse reach more ground (what a player tries first); greedyGood: how many of those are on a
     shortest road (0 = the obvious opening never works), greedyDead: how many of them leave no win at all;
   - hidden: true when no good first move lets the mouse reach new ground (the right start looks like it does nothing);
   - steps: along the found road, "good/options" at every swipe (distinct boards).
   Reference: level 4 Crumbly Overhang (owner: hard): 2 swipes, 44 firsts, 1 good, 2 roads. Level 23 v1 (owner: too easy): 4 swipes, 32 firsts, 4 good, 24 roads.
   node tools/c8-hardness.js <level index | path to a json { map }> [maxPath=8]      or require: hardness(map, { mp, extra }) */
const { parseMap, makeModel } = require('./c8-model.js');
function hardness(map, opt = {}) {
  const MP = opt.mp || 8, EXTRA = opt.extra === undefined ? 2 : opt.extra, CAP = opt.cap || 200000;
  const { g: g0, W, H, start, goal } = parseMap(map), M = makeModel(W, H, MP, opt.strict), key = g => g.map(r => r.join('')).join('/');
  const s0 = g0.map(r => r.slice()); M.settle(s0);
  const kids = new Map(), won = new Map(); let nodes = 0;
  const children = (g, k) => { if (kids.has(k)) return kids.get(k); const out = [], seen = new Set();
    for (const p of M.chains(g)) { const h = M.apply(g, p), kk = key(h); if (kk === k || seen.has(kk)) continue; seen.add(kk); out.push({ h, kk, p }); }
    kids.set(k, out); if (++nodes > CAP) throw new Error('cap'); return out; };
  const isWin = (g, k) => { if (!won.has(k)) won.set(k, M.reach(g, start, goal)); return won.get(k); };
  const memo = new Map();   // dist(state, budget): fewest swipes to win within budget, else Infinity
  const dist = (g, k, b) => { const mk = k + '|' + b; if (memo.has(mk)) return memo.get(mk); let best = isWin(g, k) ? 0 : Infinity;
    if (best && b > 0) for (const c of children(g, k)) { best = Math.min(best, 1 + dist(c.h, c.kk, b - 1)); if (best === 1) break; }
    memo.set(mk, best); return best; };
  const k0 = key(s0), maxD = opt.maxDepth || 6;
  let shortest = Infinity; try { for (let d = 0; d <= maxD && shortest === Infinity; d++) shortest = dist(s0, k0, d); } catch (e) { if (e.message !== 'cap') throw e; return { capped: true }; }
  if (shortest === Infinity) return { shortest: null };
  const firsts = children(s0, k0); let good = 0, dead = 0, greedy = 0, greedyGood = 0, greedyDead = 0, hidden = true;
  const area = g => { const o = new Set(); M.reach(g, start, null, o); return o.size; }, a0 = area(s0);
  for (const c of firsts) { const ok = 1 + dist(c.h, c.kk, shortest - 1) === shortest, dd = dist(c.h, c.kk, shortest + EXTRA - 1) === Infinity, grows = area(c.h) > a0;
    if (ok) good++; if (dd) dead++; if (grows) { greedy++; if (ok) greedyGood++; if (dd) greedyDead++; } if (ok && grows) hidden = false; }
  const roadsMemo = new Map(), roads = (g, k, d) => { if (d === 0) return isWin(g, k) ? 1 : 0; const mk = k + '|' + d; if (roadsMemo.has(mk)) return roadsMemo.get(mk);
    let n = 0; for (const c of children(g, k)) if (dist(c.h, c.kk, d - 1) === d - 1) n += roads(c.h, c.kk, d - 1); roadsMemo.set(mk, n); return n; };
  const pMemo = new Map(), pr = (g, k, d) => { if (isWin(g, k)) return 1; if (d === 0) return 0; const mk = k + '|' + d; if (pMemo.has(mk)) return pMemo.get(mk);
    const cs = children(g, k); let s = 0; for (const c of cs) s += pr(c.h, c.kk, d - 1); const v = cs.length ? s / cs.length : 0; pMemo.set(mk, v); return v; };
  const sol = [], steps = []; for (let g = s0, k = k0, d = shortest; d > 0; d--) { const cs = children(g, k), gs = cs.filter(c => dist(c.h, c.kk, d - 1) === d - 1), c = gs[0]; steps.push(gs.length + '/' + cs.length);
    const kind = g[c.p[0][1]][c.p[0][0]], e = c.p[c.p.length - 1], q = c.p[c.p.length - 2], ax = 2 * e[0] - q[0], ar = 2 * e[1] - q[1];
    const melt = kind === 'a' && ax >= 0 && ax < W && ar >= 0 && ar < H && g[ar][ax] === 'i';
    sol.push({ kind, cells: c.p.map(([x, r]) => [x, H - 1 - r]), melt }); g = c.h; k = c.kk; }
  return { shortest, firsts: firsts.length, good, roads: roads(s0, k0, shortest), pRandom: pr(s0, k0, shortest), deadFirst: dead / firsts.length, greedy, greedyGood, greedyDead, hidden, steps: steps.join(' '), things: map.join('').replace(/[^abcdivro]/g, '').length, sol, states: nodes };
}
module.exports = { hardness };
if (require.main === module) {
  const fs = require('fs'), a = process.argv[2] || '0', mp = +(process.argv[3] || 8);
  let map; if (fs.existsSync(a)) map = JSON.parse(fs.readFileSync(a, 'utf8')).map; else {
    const vm = require('vm'), ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../js/ch8/levels.js', 'utf8').replace('const C8_LEVELS', 'C8_LEVELS'), ctx); map = ctx.C8_LEVELS[+a].map; }
  const r = hardness(map, { mp });
  const { sol, ...rest } = r; console.log(JSON.stringify(rest)); if (sol) for (const s of sol) console.log('  ' + s.kind + ': ' + s.cells.map(c => c.join(',')).join(' '));
}
