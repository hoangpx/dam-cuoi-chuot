const { solve } = require('./c8-push-solve.js'), { runPlan } = require('./c8-plan.js'), { map } = require('./c8-boulder.js'), fs = require('fs');
const f = 'tools/c8-mini/boulder-plan.json'; let r;
if (fs.existsSync(f)) r = JSON.parse(fs.readFileSync(f, 'utf8')); else { r = solve(map, { by: 'swipes', cap: 250000 }); fs.writeFileSync(f, JSON.stringify(r)); }
console.log(r.cost, r.plan.length);
const res = runPlan(map, r.plan, { cap: 60000, depth: 150 });
console.log(res.won, res.step, res.why, res.board || '');
console.log(JSON.stringify(res.log).slice(0, 1500));
