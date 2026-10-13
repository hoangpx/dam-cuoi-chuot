/* Chương VIII: solve a level whose answer mixes SWIPES and ROCK PUSHES (owner, 2026-10-11: "more than 5 swipes and 10 pushes").
   Abstract model (tools/c8-model.js for falling, chains and the mouse's reach) plus the engine's push rule (js/ch8/engine.js c8Push):
   the mouse stands next to a rock in its own row and walks into it; the rock moves one cell if the cell beyond is empty, a peg (o) or a
   flame (a) (it swaps with those), never two rocks at once; the mouse walks along into the rock's old cell only when there is ground under
   that cell. A state = the board + where the mouse can get to (its reach); a swipe or a push is made from any cell it can stand in.
   Conservative: an action after which a solid thing would land in the mouse's cell is not taken (the engine would make it wait).
   solve(map, { by: 'swipes' | 'pushes', mp, cap, strict }) -> { cost: { swipes, pushes }, plan: [steps for tools/c8-plan.js], acts, states }
     by 'swipes': fewest swipes first, then fewest pushes; by 'pushes': the other way round.
   node tools/c8-push-solve.js <level index | json file with { map }> [by=swipes] */
const { parseMap, makeModel } = require('./c8-model.js');
function solve(map, opt = {}) {
  const { g: g0, W, H, start, goal } = parseMap(map), M = makeModel(W, H, opt.mp || 8, opt.strict === undefined ? true : opt.strict);
  const by = opt.by || 'swipes', CAP = opt.cap || 300000, BIG = 1000;
  const s0 = g0.map(r => r.slice()); M.settle(s0);
  const solid = c => c === '#' || c === 'd' || c === 'r' || c === 'i';
  const free = (g, x, r) => x >= 0 && x < W && r >= 0 && r < H && !solid(g[r][x]) && g[r][x] !== 'x';
  const fall = (g, x, r) => { while (r > 0 && free(g, x, r - 1) && g[r][x] !== 'v' && g[r - 1][x] !== 'v') r--; return r; };
  const reach = (g, m) => { const out = new Set(); const won = M.reach(g, m, goal, out); return { won, cells: [...out].map(k => k.split(',').map(Number)) }; };
  const bkey = g => g.map(r => r.join('')).join('/');
  const toY = ([x, r]) => [x, H - 1 - r];
  // after a change the mouse at m falls; null when a solid thing sits in its cell (crushed / held over it) or it lands on ice
  const place = (g, m) => { if (!free(g, m[0], m[1])) return null; const r = fall(g, m[0], m[1]); if (r > 0 && g[r - 1][m[0]] === 'i') return null; return [m[0], r]; };
  const cost = (sw, pu) => by === 'swipes' ? sw * BIG + pu : pu * BIG + sw;
  // a small binary heap on cost
  const heap = [], hpush = e => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p].c <= heap[i].c) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } },
    hpop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].c < heap[m].c) m = l; if (r < heap.length && heap[r].c < heap[m].c) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  // every move from a position: { g, m, act, sw: 0 | 1, pu: 0 | 1 } (pushes of a rock beside a cell the mouse can stand in, and swipes from any
  // such cell: the mouse's cell decides where it ends up)
  const succ = (g, m, R) => { R = R || reach(g, m); const out = [];
    for (const p of R.cells) {
      const [x, r] = p; if (g[r][x] === 'v') continue;                         // no pushing while swimming (engine: c8Walk pushes only on the ground, not in water)
      for (const d of [-1, 1]) {                                                  // push the rock beside the mouse
        const x1 = x + d, x2 = x + 2 * d; if (x2 < 0 || x2 >= W || g[r][x1] !== 'r' || !' oa'.includes(g[r][x2])) continue;
        const h = g.map(row => row.slice()), t = h[r][x2]; h[r][x2] = 'r'; h[r][x1] = t === ' ' ? ' ' : t;
        const carried = r > 0 && solid(g[r - 1][x1]); M.settle(h);
        // carried into the rock's old cell; if something above drops into that cell first (it falls the moment the rock leaves), the
        // engine just stops the mouse against it where it stood (owner's PR #7: levels 58-60 were won with no swipe by such a push,
        // which this solver used to skip as a crush)
        const m2 = (carried && place(h, [x1, r])) || place(h, p); if (!m2) continue;
        out.push({ g: h, m: m2, sw: 0, pu: 1, act: { push: [x1, r], dir: d, from: p, to: [x2, r], swap: t } });
      }
    }
    const seen = new Set();
    for (const ch of M.chains(g)) { const h = M.apply(g, ch), hk = bkey(h), kind = g[ch[0][1]][ch[0][0]], e = ch[ch.length - 1], q = ch[ch.length - 2],
      ax = 2 * e[0] - q[0], ar = 2 * e[1] - q[1], melt = kind === 'a' && ax >= 0 && ax < W && ar >= 0 && ar < H && g[ar][ax] === 'i'; for (const p of R.cells) {   // a swipe, the mouse standing at p
      const m2 = place(h, p); if (!m2) continue;
      if (seen.has(hk + '@' + m2.join(','))) continue;
      seen.add(hk + '@' + m2.join(','));
      out.push({ g: h, m: m2, sw: 1, pu: 0, act: { swipe: ch, at: p, kind, melt } });
    } }
    return out; };
  const skey = (g, R) => bkey(g) + '@' + R.cells.map(c => c.join(',')).sort()[0];   // a position: the board + where the mouse can get to
  if (opt.api) return { s0, start: place(s0, start) || start, succ, reach, skey };   // opt.api: the pieces, for tools/c8-find.js
  const best = new Map(); let states = 0;
  const startM = opt.from ? opt.from.m : place(s0, start) || start;               // opt.from = { g, m }: solve from that position
  hpush({ c: 0, sw: 0, pu: 0, g: opt.from ? opt.from.g : s0, m: startM, acts: [], prev: null });
  while (heap.length) {
    const s = hpop(), R = reach(s.g, s.m), key = skey(s.g, R);
    if (best.has(key) && best.get(key) <= s.c) continue; best.set(key, s.c);
    if (R.won) { const moves = movesOf(s.acts, H), path = []; for (let e = s; e; e = e.prev) path.unshift({ g: e.g, m: e.m });
      return { cost: { swipes: s.sw, pushes: s.pu }, acts: s.acts, moves, plan: opt.from ? null : planOf(map, moves), path, states }; }
    if (++states > CAP) return { capped: true, states };
    for (const n of succ(s.g, s.m, R)) hpush({ c: cost(s.sw + n.sw, s.pu + n.pu), sw: s.sw + n.sw, pu: s.pu + n.pu, g: n.g, m: n.m, acts: s.acts.concat([n.act]), prev: s });
  }
  return { cost: null, states };
}
// the moves of a solution in map coordinates (y down), as stored in tools/c8-own-levels.js: { swipe: [[x, y]..], at: [x, y] } (the mouse
// stands at 'at' while it swipes) and { push: [x, y], dir: -1 | 1, at: [x, y] } (the rock in cell push, the mouse standing at 'at')
function movesOf(acts, H) { const y = ([x, r]) => [x, H - 1 - r];
  return acts.map(a => a.swipe ? { swipe: a.swipe.map(y), at: y(a.at) } : { push: y(a.push), dir: a.dir, at: y(a.from) }); }
// the steps for tools/c8-plan.js runPlan: every step pins the WHOLE board to the model's (else the engine's search may reach a cell or a
// rock's place another way, e.g. by pushing a rock out of the road on its way to the standing cell); the engine keeps G and S in their cells
function planOf(map, moves) {
  const { g: g0, W, H } = parseMap(map), M = makeModel(W, H, 8, true); let g = g0.map(r => r.slice()); M.settle(g);
  const board = h => { const want = []; for (let rr = 0; rr < H; rr++) for (let x = 0; x < W; x++) if (h[rr][x] !== '#' && !'GS'.includes((map[H - 1 - rr] || '')[x])) want.push([x, H - 1 - rr, h[rr][x]]); return want; };
  const plan = [];
  for (const mv of moves) {
    // standing on water in the model = swimming in it in the engine (water is soft): wet = how many water cells lie under the standing cell
    let wet = 0; for (let rr = H - 2 - mv.at[1]; rr >= 0 && g[rr][mv.at[0]] === 'v'; rr--) wet++;
    plan.push(wet ? { at: mv.at, until: board(g), wet } : { at: mv.at, until: board(g) });
    if (mv.swipe) { plan.push({ swipe: mv.swipe }); g = M.apply(g, mv.swipe.map(([x, y]) => [x, H - 1 - y])); continue; }
    const r = H - 1 - mv.push[1], x1 = mv.push[0], x2 = x1 + mv.dir, h = g.map(row => row.slice()), t = h[r][x2];
    if (h[r][x1] !== 'r' || !' oa'.includes(t)) throw new Error('move ' + JSON.stringify(mv) + ': no rock to push there');
    h[r][x2] = 'r'; h[r][x1] = t; M.settle(h); g = h; plan.push({ until: board(h) });
  }
  return plan;
}
module.exports = { solve, movesOf, planOf };
if (require.main === module) {
  const fs = require('fs'), a = process.argv[2] || '0', by = process.argv[3] || 'swipes'; let map;
  if (fs.existsSync(a)) map = JSON.parse(fs.readFileSync(a, 'utf8')).map; else { const vm = require('vm'), ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../js/ch8/levels.js', 'utf8').replace('const C8_LEVELS', 'C8_LEVELS'), ctx); map = ctx.C8_LEVELS[+a].map; }
  const t = Date.now(), r = solve(map, { by, strict: process.env.STRICT === '0' ? false : true });
  console.log(JSON.stringify({ cost: r.cost, capped: r.capped, states: r.states, ms: Date.now() - t }));
  if (r.acts) r.acts.forEach((x, i) => console.log(' ', i + 1, x.swipe ? 'swipe ' + x.swipe.map(c => c.join(',')).join(' ') + ' (mouse ' + x.at + ')' : 'push ' + (x.dir > 0 ? 'right' : 'left') + ' rock ' + x.push + ' (mouse ' + x.from + ')'));
}
