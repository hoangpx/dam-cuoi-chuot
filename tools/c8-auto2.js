// model + engine (swipes first) search for a map file entry: node tools/c8-auto2.js <key> (from tools/c8-new2.js)
const o = require('./c8-new2.js'), { solveModel } = require('./c8-model.js'), { runPlan } = require('./c8-plan.js'), lv = o[process.argv[2]];
const m = solveModel(lv.map, { maxDepth: +(process.env.D || 5), maxPath: +(process.env.P || 6), cap: +(process.env.CAP || 200000) });
console.log('model depth', m.depth, 'solutions', m.solutions.length, 'states', m.states, m.capped ? '(capped)' : '');
let found = null, n = 0; for (const sol of m.solutions.slice(0, +(process.env.TRY || 30))) { n++; const r = runPlan(lv.map, sol.map(s => ({ swipe: s.cells })), { cap: 30000, depth: 80 }); if (r.won) { found = sol; break; } }
console.log(found ? 'ENGINE WIN ' + JSON.stringify(found.map(s => s.cells)) : 'no engine winner among ' + n);
