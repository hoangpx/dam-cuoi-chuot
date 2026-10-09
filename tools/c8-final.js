/* Chương VIII: the final set of levels (owner, 2026-10-09: "bỏ hết các bài cũ, làm lại từ bài 1 ... rất ít vật liệu nhưng vẫn rất khó").
   Reads tools/c8-mini/final.json = [{ name, en, map, steps }] (steps = the swipes of the one solution, map cells x,y in drag order), checks every level in the REAL engine
   (the full solution wins, no swipes does not, leaving out any one swipe does not; model: the shortest solution and how many) and, with --write, writes js/ch8/levels.js.
   node tools/c8-final.js [--write] */
const fs = require('fs'), path = require('path'), { run } = require('./c8-engine-test.js'), { solveModel } = require('./c8-model.js');
const levels = JSON.parse(fs.readFileSync(path.join(__dirname, 'c8-mini', 'final.json'), 'utf8'));
let bad = 0;
levels.forEach((L, i) => {
  const things = L.map.join('').replace(/[^aibvcdo]/g, '').length, m = solveModel(L.map, { maxDepth: L.steps.length + 1, maxPath: 6, cap: 200000 });
  const full = run(L.map, L.steps, { cap: 60000, depth: 150 }), none = run(L.map, [], { cap: 40000, depth: 150, fine: true });
  const lo = L.steps.map((_, d) => run(L.map, L.steps.filter((__, k) => k !== d), { cap: 40000, depth: 150, fine: true }).won);
  const ok = full.won && !none.won && lo.every(w => !w);
  if (!ok) bad++;
  console.log(String(i + 1).padStart(2), L.en.padEnd(22), 'things', String(things).padStart(2), '| swipes', L.steps.length, '| model depth', m.depth, 'solutions', m.solutions.length, 'states', m.states, '| engine: full', full.won, 'none', none.won, 'leave-one-out', JSON.stringify(lo), ok ? 'OK' : 'CHECK');
});
if (process.argv.includes('--write')) {
  const src = levels.map(L => `  { name: ${JSON.stringify(L.name)}, en: ${JSON.stringify(L.en)}, map: [\n${L.map.map(r => '    ' + JSON.stringify(r).replace(/"/g, "'")).join(',\n')} ] }`).join(',\n');
  const file = path.join(__dirname, '..', 'js/ch8/levels.js'), head = fs.readFileSync(file, 'utf8').split('const C8_LEVELS')[0];
  fs.writeFileSync(file, head + 'const C8_LEVELS = [\n' + src + ',\n];\n'); console.log('wrote', levels.length, 'levels');
}
process.exit(bad ? 1 : 0);
