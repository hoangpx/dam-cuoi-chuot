/* Chương VIII: design and check tool for our own level "Lửa Hai Ngả" / "Two-Way Fire" (2026-10-10).
   Reads it from tools/c8-own-levels.js and checks:
   - map: one P, one G, known characters, rectangular; shape: 15-20 things, the start left of the chest, the plan only swipes;
   - model (tools/c8-model.js, swipes up to 8 cells, so no same-kind group may be larger): shortest solution 4 swipes (accepted by the user; 5-6 was the first aim), exactly one,
     at least 300 boards (first aim 1000), every plan swipe legal and the plan wins in the model, the trap is legal and after it there is no solution (depth 8);
   - real engine: the plan wins (tools/c8-plan.js), no swipes does not win, the trap alone is legal and does not win,
     leaving out any one swipe does not win (fine macros).
   node tools/c8-two-way.js [--quick]    --quick = shape and model only.   Exit code 1 when a check fails. */
const { parseMap, makeModel, solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js'), { runPlan } = require('./c8-plan.js');
const L = require('./c8-own-levels.js').find(l => l.en === 'Two-Way Fire');
const quick = process.argv.includes('--quick'), fails = [];
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };
const fmt = sol => sol.map(g => g.kind + ':' + g.cells.map(c => c.join(',')).join(' ')).join('  |  ');
const findX = ch => { for (const r of L.map) { const x = r.indexOf(ch); if (x >= 0) return x; } return -1; };

console.log(L.map.join('\n'));
// map sanity: one P, one G, known characters only, rectangular
const all = L.map.join(''), nP = all.split('P').length - 1, nG = all.split('G').length - 1, bad = [...new Set(all.replace(/[# aibvcdoPG]/g, ''))];
check(nP === 1, `exactly one start P (got ${nP})`); check(nG === 1, `exactly one chest G (got ${nG})`);
check(!bad.length, `only known characters${bad.length ? ' (bad: ' + bad.map(c => JSON.stringify(c)).join(' ') + ')' : ''}`);
check(L.map.every(r => r.length === L.map[0].length), 'all rows have the same length');
if (!nP || !nG) { console.log(`\n${fails.length} check(s) FAILED`); process.exit(1); }
const things = all.replace(/[^aibvcdo]/g, '').length, swipes = L.plan.map(s => s.swipe);
check(things >= 15 && things <= 20, `things ${things} (want 15-20)`);
check(findX('P') < findX('G'), 'start left of the chest');
check(swipes.every(Boolean), 'plan has only swipes');

// model board, legal swipes (model coords [x, r]) and the largest same-kind group (the model only sees swipes of <= MAXP cells)
const MAXP = 8, { g: g0, W, H, start, goal } = parseMap(L.map), M = makeModel(W, H, 12), toR = ([x, y]) => [x, H - 1 - y];
const inG = (x, r) => x >= 0 && x < W && r >= 0 && r < H;
const legal = (g, p) => { if (p.length < 3 || !p.every(([x, r]) => inG(x, r))) return false; const k = g[p[0][1]][p[0][0]];
  return 'aibvcd'.includes(k) && k !== ' ' && p.every(([x, r]) => g[r][x] === k) && p.every(([x, r], i) => !i || Math.abs(x - p[i - 1][0]) + Math.abs(r - p[i - 1][1]) === 1)
    && new Set(p.map(c => c.join(','))).size === p.length; };
const s0 = g0.map(r => r.slice()); M.settle(s0);
let maxGroup = 0; { const seen = new Set(); for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) { const k = s0[r][x]; if (k === ' ' || !'aibvcd'.includes(k) || seen.has(x + ',' + r)) continue;
  let n = 0; const st = [[x, r]]; seen.add(x + ',' + r);
  while (st.length) { const [a, b] = st.pop(); n++; for (const [c, d] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) if (inG(c, d) && s0[d][c] === k && !seen.has(c + ',' + d)) { seen.add(c + ',' + d); st.push([c, d]); } }
  maxGroup = Math.max(maxGroup, n); } }
check(maxGroup <= MAXP, `largest same-kind group ${maxGroup} (want <= ${MAXP} so the model sees every swipe)`);
// per-kind totals (water and ice together, ice melts into water): groups formed after falls may be larger than any group at the start
for (const [name, set] of [['a', 'a'], ['b', 'b'], ['c', 'c'], ['d', 'd'], ['water/ice', 'vi']]) { const n = [...all].filter(c => set.includes(c)).length;
  if (n > MAXP) console.log(`warn kind ${name} total ${n} > ${MAXP}: groups formed after falls may need swipes longer than the model tries`); }

// model
const t0 = Date.now(), m = solveModel(L.map, { maxDepth: 7, maxPath: MAXP, cap: 600000 });
console.log(`model: depth ${m.depth}, shortest solutions ${m.solutions.length}, boards ${m.states}${m.capped ? ' (CAPPED)' : ''}, ${Date.now() - t0} ms`);
m.solutions.slice(0, 6).forEach((s, k) => console.log(`  solution ${k + 1}: ${fmt(s)}`));
check(!m.capped, 'model search not capped');
check(m.depth === 4, `shortest solution ${m.depth} swipes (want 4: the user accepted 4 instead of 5-6, 2026-10-10)`);
check(m.solutions.length === 1, `exactly one winning board at the shortest depth (got ${m.solutions.length})`);
check(m.states >= 300, `boards ${m.states} (want >= 300; first aimed for 1000)`);

let g = s0.map(r => r.slice()), planOk = true;
for (let i = 0; i < swipes.length && planOk; i++) { if (!swipes[i]) { planOk = false; break; } const p = swipes[i].map(toR); planOk = legal(g, p); check(planOk, `plan swipe ${i + 1} is legal in the model`); if (planOk) g = M.apply(g, p); }
check(planOk && M.reach(g, start, goal), 'the plan wins in the model');
check(swipes.length === m.depth, `plan length ${swipes.length} = shortest ${m.depth}`);

const trapR = L.trap.map(toR), trapOk = legal(s0, trapR);
check(trapOk, 'trap swipe is legal');
if (!trapOk) check(false, 'after the trap swipe no solution (trap swipe not legal)');
else { const gt = M.apply(s0, trapR);
  if (gt[start[1]][start[0]] !== ' ' || gt[goal[1]][goal[0]] !== ' ') check(false, 'trap board: something fell into the start or chest cell');
  else { const trapMap = Array.from({ length: H }, (_, y) => gt[H - 1 - y].map((ch, x) => x === start[0] && H - 1 - y === start[1] ? 'P' : x === goal[0] && H - 1 - y === goal[1] ? 'G' : ch).join(''));
    const mt = solveModel(trapMap, { maxDepth: 8, maxPath: MAXP, cap: 600000 });
    check(mt.depth === null && !mt.capped, `after the trap swipe no solution (depth ${mt.depth}${mt.capped ? ', CAPPED' : ''})`); } }

if (!quick) {
  const full = runPlan(L.map, L.plan, { cap: 60000, depth: 80 });
  check(full.won, `engine: the plan wins${full.won ? '' : ' (stopped at step ' + full.step + ': ' + full.why + ')'}`);
  const none = run(L.map, [], { cap: 40000, depth: 150, fine: true });
  check(!none.won, 'engine: no swipes does not win');
  const t = run(L.map, [L.trap], { cap: 40000, depth: 150, fine: true });
  check(t.log[0] && t.log[0].ok && t.log[0].r === 'gone' && !t.won, 'engine: the trap swipe is legal and alone does not win');
  swipes.forEach((_, d) => { const r = run(L.map, swipes.filter((__, k) => k !== d), { cap: 40000, depth: 150, fine: true }); check(!r.won, `engine: without swipe ${d + 1} it does not win`); });
}
console.log(fails.length ? `\n${fails.length} check(s) FAILED` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
