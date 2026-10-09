/* Chương VIII: remove the THINGS that have nothing to do with getting the mouse to the chest (owner, 2026-10-09: "bỏ hết những chi tiết thừa mà không liên quan giữa chuột và đích đến").
   node tools/c8-audit2.js <level index>   -> tools/c8-mini/things-<index>.json (cells to empty, unmirrored coordinates; merged into tools/c8-carve.json)
   Each thing is tried alone (bottom row first): it is removed when the plan still wins in the real engine, no swipes still does not win, and the model's shortest gathering count is unchanged. */
process.env.NOMIRROR = '1';
const fs = require('fs'), L = require('./c8-ref-levels.js'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js'), { runPlan } = require('./c8-plan.js');
const i = +process.argv[2] - 1, lv = L[i]; if (!lv.plan) { console.log(lv.en, 'no plan'); process.exit(0); }
const H = lv.map.length, W = lv.map[0].length; let g = lv.map.map(r => r.split(''));
const mapOf = () => g.map(r => r.join('')), nSw = lv.plan.filter(s => s.swipe).length;
const baseDepth = solveModel(mapOf(), { maxDepth: nSw + 1, maxPath: 6, cap: 150000 }).depth;
const things = []; for (let y = H - 2; y >= 1; y--) for (let x = 1; x < W - 1; x++) if ('aibvcdor'.includes(g[y][x])) things.push([x, y, g[y][x]]);
console.log(lv.en, 'model depth', baseDepth, 'things', things.length);
const cut = [];
for (const [x, y, ch] of things) {
  g[y][x] = ' '; let ok = true, why = '';
  try {
    if (baseDepth !== null && solveModel(mapOf(), { maxDepth: nSw + 1, maxPath: 6, cap: 150000 }).depth !== baseDepth) { ok = false; why = 'model depth'; }
    if (ok && run(mapOf(), [], { cap: 40000, depth: 120, fine: true }).won) { ok = false; why = 'no swipes wins'; }
    if (ok) { const r = runPlan(mapOf(), lv.plan, { cap: 60000, depth: 80 }); if (!r.won) { ok = false; why = 'plan fails at ' + r.step; } }
  } catch (e) { ok = false; why = 'error ' + e.message; }
  console.log('  ' + ch + ' at', x + ',' + y, ok ? 'REMOVED' : 'kept (' + why + ')');
  if (ok) cut.push([x, y]); else g[y][x] = ch;
}
fs.writeFileSync('tools/c8-mini/things-' + (i + 1) + '.json', JSON.stringify(cut)); console.log('removed', cut.length, 'of', things.length);
