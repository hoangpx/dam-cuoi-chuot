/* For reference levels without a plan: ask the abstract model (tools/c8-model.js) for the shortest sequences of gatherings, then test them swipes-first in the real engine and print the first that wins.
   node tools/c8-ref-auto.js <level index…>   (env D = max depth, P = longest chain, TRY = how many solutions to test) */
const L = require('./c8-ref-levels.js'), { solveModel } = require('./c8-model.js'), { runPlan } = require('./c8-plan.js');
for (const a of process.argv.slice(2)) { const i = +a - 1, lv = L[i];
  const m = solveModel(lv.map.map(r => r.replace(/S/g, ' ')), { maxDepth: +(process.env.D || 4), maxPath: +(process.env.P || 6), cap: +(process.env.CAP || 150000) });
  console.log(a, lv.en, 'model depth', m.depth, 'solutions', m.solutions.length, 'states', m.states, m.capped ? '(capped)' : '');
  let found = null, tried = 0;
  for (const sol of m.solutions.slice(0, +(process.env.TRY || 25))) { tried++; const r = runPlan(lv.map, sol.map(s => ({ swipe: s.cells })), { cap: 30000, depth: 80 }); if (r.won) { found = sol; break; } }
  console.log('  engine (swipes first):', found ? 'WIN with ' + JSON.stringify(found.map(s => s.cells)) : 'no winner among ' + tried);
}
