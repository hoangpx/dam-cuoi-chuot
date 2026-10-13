/* Chương VIII: check one of our own levels (tools/c8-own-levels.js) by its English name, against the expectations it carries
   (level.expect = { shortest, roads, things: [lo, hi], minOptions }). Same checks as the old tools/c8-two-way.js (removed with its level), with the numbers taken from the level:
   - map: one P, one G, known characters, rectangular, stored settled; start left of the chest; the plan only swipes;
   - hard to FIND (tools/c8-hardness.js, strict model): shortest = expect.shortest, at most expect.roads roads, one good move out of at least
     expect.minOptions at every swipe, no opener that opens the way at once is on a shortest road, the right opener shows no progress;
     the plan is legal and wins in the model; every trap is legal and leaves no win within 6 swipes;
   - real engine (tools/c8-engine-test.js): the plan wins, also for a clumsy player; no swipes, each trap alone, and the plan without any
     one swipe do not win; no board reachable with fewer swipes wins (tools/c8-cheap.js).
   node tools/c8-own-check.js "<en name>" [--quick]    Exit code 1 when a check fails. */
const { parseMap, makeModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js'), { hardness } = require('./c8-hardness.js'), { cheap } = require('./c8-cheap.js');
const en = process.argv[2], L = require('./c8-own-levels.js').find(l => l.en === en);
if (!L) { console.log('no own level named ' + JSON.stringify(en)); process.exit(1); }
const E = Object.assign({ shortest: L.plan ? L.plan.length : 0, roads: 1, things: [8, 18], minOptions: 6 }, L.expect), traps = L.traps || (L.trap ? [L.trap] : []);
const quick = process.argv.includes('--quick'), fails = [];
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };
const findX = ch => { for (const r of L.map) { const x = r.indexOf(ch); if (x >= 0) return x; } return -1; };

console.log(L.map.join('\n'));
const all = L.map.join(''), nP = all.split('P').length - 1, nG = all.split('G').length - 1, bad = [...new Set(all.replace(/[# aibvcdorPG]/g, ''))];
check(nP === 1, `exactly one start P (got ${nP})`); check(nG === 1, `exactly one chest G (got ${nG})`);
check(!bad.length, `only known characters${bad.length ? ' (bad: ' + bad.map(c => JSON.stringify(c)).join(' ') + ')' : ''}`);
check(L.map.every(r => r.length === L.map[0].length), 'all rows have the same length');
if (!nP || !nG) { console.log(`\n${fails.length} check(s) FAILED`); process.exit(1); }
const things = all.replace(/[^aibvcdor]/g, '').length, swipes = L.plan ? L.plan.map(s => s.swipe) : [];
check(things >= E.things[0] && things <= E.things[1], `things ${things} (want ${E.things[0]}-${E.things[1]})`);
check(findX('P') < findX('G'), 'start left of the chest');

// a level with rock PUSHES (level.moves: swipes and pushes from tools/c8-push-solve.js, expanded by its planOf into engine steps): expect.minSwipes / expect.minPushes = what
// EVERY solution needs, in the strict and in the generous model; the real engine plays the plan (tools/c8-plan.js), also clumsily
if (L.moves) {
  const { solve } = require('./c8-push-solve.js'), { runPlan } = require('./c8-plan.js');
  const PLAN = require("./c8-push-solve.js").planOf(L.map, L.moves), nSw = L.moves.filter(m => m.swipe).length, nPu = L.moves.filter(m => m.push).length;
  console.log(`plan: ${nSw} swipes, ${nPu} pushes`);
  { const { g, W, H } = parseMap(L.map), h = g.map(r => r.slice()); makeModel(W, H, 8, true).settle(h);
    check(h.every((r, i) => r.join('') === g[i].join('')), 'nothing falls at the start (the map is stored settled)'); }
  for (const strict of [true, E.gen === 'plain' ? false : 'loose']) {   // expect.gen 'plain': the second model flies the engine's own 7 cells (cheap wins left to the deep engine checks below)
    const a = solve(L.map, { by: 'swipes', strict }), b = solve(L.map, { by: 'pushes', strict }), nm = strict === true ? 'strict' : strict ? 'generous' : 'engine-like';
    check(!a.capped && !b.capped && a.cost && b.cost, `${nm} model: solvable (${a.states} / ${b.states} states)`);
    if (a.cost && b.cost) {
      check(a.cost.swipes >= E.minSwipes, `${nm} model: every solution needs at least ${E.minSwipes} swipes (fewest: ${a.cost.swipes}, with ${a.cost.pushes} pushes)`);
      check(b.cost.pushes >= E.minPushes, `${nm} model: every solution needs at least ${E.minPushes} pushes (fewest: ${b.cost.pushes}, with ${b.cost.swipes} swipes)`); }
  }
  if (E.minBits) {                                                       // hard to FIND (tools/c8-find.js): luck a blind player needs along the road
    const f = require('./c8-find.js').findBits(L.map); check(!f.capped && f.bits >= E.minBits, `hard to find: ${f.bits} bits (want ${E.minBits}+), steps ${(f.steps || []).join(' ')}`); }
  if (!quick) {
    const o = { cap: 60000, depth: 80 };
    const r = runPlan(L.map, PLAN, o); check(r.won, `engine: the plan wins${r.won ? '' : ' (stuck at step ' + r.step + ', ' + r.why + ')'}`);
    const rh = runPlan(L.map, PLAN, Object.assign({ handicap: true }, o)); check(rh.won, `engine: the plan wins for a clumsy player too (bigger ice, weaker in the air)${rh.won ? '' : ' (stuck at step ' + rh.step + ')'}`);
    check(!run(L.map, [], { cap: 40000, depth: 150, fine: true }).won, 'engine: with no swipes (walking, jumping and pushing allowed) it does not win');
    // deeper (owner, PR #7: levels 58 and 60 were won with no swipe; the check above gave up after 40 000 positions): the plan search of
    // tools/c8-plan.js over 150 000 positions with no swipe, then every distinct first swipe (made from the start) followed by a search
    check(!runPlan(L.map, [], { cap: 150000, depth: 120 }).won, 'engine (deep): with no swipes it does not win');
    if (E.minSwipes >= 2) { const { g, W, H } = parseMap(L.map), M = makeModel(W, H, 8, 'loose'), s0 = g.map(r => r.slice()); M.settle(s0); const seen = new Set(); let n = 0, won = null;
      for (const ch of M.chains(s0)) { const k = M.apply(s0, ch).map(r => r.join('')).join('/'); if (seen.has(k)) continue; seen.add(k); n++;
        const sw = ch.map(([x, r]) => [x, H - 1 - r]); if (runPlan(L.map, [{ swipe: sw }], { cap: 60000, depth: 100 }).won) { won = sw; break; } }
      check(!won, `engine: no single first swipe wins (${n} tried)${won ? ' WON WITH ' + JSON.stringify(won) : ''}`); }
  }
  console.log(fails.length ? `\n${fails.length} check(s) FAILED` : '\nall checks passed');
  process.exit(fails.length ? 1 : 0);
}
check(swipes.every(Boolean), 'plan has only swipes');

const { g: g0, W, H, start, goal } = parseMap(L.map), M = makeModel(W, H, 12, true), toR = ([x, y]) => [x, H - 1 - y], key = g => g.map(r => r.join('')).join('/');
const s0 = g0.map(r => r.slice()); M.settle(s0); check(key(s0) === key(g0), 'nothing falls at the start (the map is stored settled)');
const legal = (g, p) => { if (p.length < 3) return false; const k = g[p[0][1]] && g[p[0][1]][p[0][0]];
  return !!k && 'aibvcd'.includes(k) && k !== ' ' && p.every(([x, r]) => x >= 0 && x < W && r >= 0 && r < H && g[r][x] === k) && p.every(([x, r], i) => !i || Math.abs(x - p[i - 1][0]) + Math.abs(r - p[i - 1][1]) === 1)
    && new Set(p.map(c => c.join(','))).size === p.length; };
let g = s0.map(r => r.slice()), planOk = true;
for (let i = 0; i < swipes.length && planOk; i++) { const p = swipes[i].map(toR); planOk = legal(g, p); check(planOk, `plan swipe ${i + 1} is legal in the model`); if (!planOk) break; g = M.apply(g, p); }
check(planOk && M.reach(g, start, goal), 'the plan wins in the (strict) model');

const t0 = Date.now(), h = hardness(L.map, { mp: 8, strict: true, maxDepth: 6, cap: 400000 });
console.log(`hardness: ${JSON.stringify({ ...h, sol: undefined })} (${Date.now() - t0} ms)`);
check(!h.capped && h.shortest === swipes.length, `shortest ${h.shortest} swipes = plan ${swipes.length}`);
check(h.shortest === E.shortest, `shortest ${E.shortest} swipes`);
check(h.roads <= E.roads, `at most ${E.roads} road(s) (got ${h.roads})`);
check(h.steps && h.steps.split(' ').every(s => { const [a, b] = s.split('/').map(Number); return a === 1 && b >= E.minOptions; }), `one good move out of at least ${E.minOptions} at every swipe (${h.steps})`);
check(h.greedyGood === 0, `no opener that opens the way at once is on a shortest road (${h.greedy} such openers, ${h.greedyGood} good)`);
check(h.hidden, 'the right opener shows no progress');
traps.forEach((tr, n) => { const trapR = tr.map(toR), trapOk = legal(s0, trapR); check(trapOk, `trap ${n + 1} is legal`);
  if (trapOk) { const gt = M.apply(s0, trapR), tmap = Array.from({ length: H }, (_, y) => gt[H - 1 - y].map((ch, x) => x === start[0] && H - 1 - y === start[1] ? 'P' : x === goal[0] && H - 1 - y === goal[1] ? 'G' : ch).join(''));
    const ht = hardness(tmap, { mp: 8, strict: true, maxDepth: 6, cap: 400000 }); check(!ht.capped && ht.shortest === null, `after trap ${n + 1} no win within 6 swipes (${ht.capped ? 'CAPPED' : ht.shortest})`); } });

if (!quick) {
  const o = { cap: 40000, depth: 150, fine: true };
  { const r = run(L.map, swipes, o); check(r.won && !r.crushed, 'engine: the plan wins' + (r.crushed ? ' (CRUSHED on the way)' : '')); }
  { const r = run(L.map, swipes, { cap: 40000, depth: 150, human: true, handicap: true }); check(r.won && !r.crushed, 'engine: the plan wins for a clumsy player too (no frame-exact taps, bigger ice)' + (r.crushed ? ' (CRUSHED on the way)' : '')); }
  check(!run(L.map, [], o).won, 'engine: no swipes does not win');
  traps.forEach((tr, n) => { const t = run(L.map, [tr], o); check(t.log[0] && t.log[0].ok && t.log[0].r === 'gone' && !t.won, `engine: trap ${n + 1} is legal and alone does not win`); });
  swipes.forEach((_, d) => check(!run(L.map, swipes.filter((__, k) => k !== d), o).won, `engine: without swipe ${d + 1} it does not win`));
  const c = cheap(L.map, swipes.length); check(!c.cheats.length, `engine: no cheaper way (${c.boards} boards with fewer swipes, ${c.screened} let through by the generous model, ${c.cheats.length} win)`);
}
console.log(fails.length ? `\n${fails.length} check(s) FAILED` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
