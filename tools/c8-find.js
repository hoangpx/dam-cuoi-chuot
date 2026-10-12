/* Chương VIII: how hard a level with swipes AND rock pushes is to FIND (owner, 2026-10-12: "less than 10 objects, more moves, hard to find,
   creative"). tools/c8-hardness.js does this for swipes only; here a move is a swipe or a push (tools/c8-push-solve.js succ), a position is
   the board + where the mouse can get to. The whole space of positions reachable from the start is explored once (small with few things),
   every position is marked winnable or dead by working back from the wins, and along the road with the fewest swipes (then pushes):
   - steps: "good/options" at every move, options = distinct positions one move away, good = those still winnable;
   - bits = sum of log2(options / good): the luck a player picking blindly needs (Crumbly Overhang, swipes only: about 9.5);
   - dead = share of all reachable positions that can no longer win (wrong moves are punished, not just slow).
   findBits(map, { strict, cap }) -> { bits, steps, sw, pu, positions, dead, firsts, goodFirst } or { capped } / { unsolvable }
   node tools/c8-find.js <json file with { map } | own level en name> */
const { solve } = require('./c8-push-solve.js');
function findBits(map, opt = {}) {
  const strict = opt.strict === undefined ? true : opt.strict, CAP = opt.cap || 30000;
  const A = solve(map, { api: true, strict }), nodes = new Map(), q = [];
  const add = (g, m) => { const R = A.reach(g, m), k = A.skey(g, R); if (!nodes.has(k)) { nodes.set(k, { g, m, R, won: R.won, kids: null }); q.push(k); } return k; };
  const k0 = add(A.s0, A.start);
  while (q.length) { const k = q.shift(), n = nodes.get(k); if (n.won) { n.kids = []; continue; }
    n.kids = [...new Set(A.succ(n.g, n.m, n.R).map(s => add(s.g, s.m)))].filter(c => c !== k);
    if (nodes.size > CAP) return { capped: true, positions: nodes.size }; }
  const par = new Map(); for (const [k, n] of nodes) for (const c of n.kids) { if (!par.has(c)) par.set(c, []); par.get(c).push(k); }
  const good = new Set([...nodes].filter(([, n]) => n.won).map(([k]) => k)), stack = [...good];
  while (stack.length) for (const p of par.get(stack.pop()) || []) if (!good.has(p)) { good.add(p); stack.push(p); }
  if (!good.has(k0)) return { unsolvable: true, positions: nodes.size };
  const road = solve(map, { by: 'swipes', strict }); if (!road.cost) return { unsolvable: true, positions: nodes.size };
  let bits = 0; const steps = [];
  for (const st of road.path.slice(0, -1)) { const n = nodes.get(A.skey(st.g, A.reach(st.g, st.m))); if (!n) continue;
    const o = n.kids.length, gd = n.kids.filter(c => good.has(c)).length; steps.push(gd + '/' + o); bits += Math.log2(o / Math.max(1, gd)); }
  const k0n = nodes.get(k0);
  return { bits: +bits.toFixed(2), steps, sw: road.cost.swipes, pu: road.cost.pushes, positions: nodes.size, dead: +(1 - good.size / nodes.size).toFixed(3),
    firsts: k0n.kids.length, goodFirst: k0n.kids.filter(c => good.has(c)).length };
}
module.exports = { findBits };
if (require.main === module) {
  const fs = require('fs'), a = process.argv[2];
  const map = fs.existsSync(a) ? JSON.parse(fs.readFileSync(a, 'utf8')).map : require('./c8-own-levels.js').find(l => l.en === a).map;
  const t = Date.now(); console.log(JSON.stringify(findBits(map)), Date.now() - t, 'ms');
}
