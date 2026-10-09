/* Chương VIII: find earth that does nothing. node tools/c8-audit.js <level index>   (writes tools/c8-mini/carve-<index>.json = cells to cut)
   A "hanging piece" = a connected piece of the level's earth (outer ring left out) that does not touch the floor row. Each one is cut away (biggest first) and the cut is kept only if
   (1) the plan still wins in the real engine, (2) no swipes still does not win (fine macros), (3) the model's shortest number of gatherings is unchanged. */
process.env.NOCARVE = '1'; process.env.NOMIRROR = '1';
const fs = require('fs'), L = require('./c8-ref-levels.js'), { solveModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js'), { runPlan } = require('./c8-plan.js');
const i = +process.argv[2] - 1, lv = L[i], H = lv.map.length, W = lv.map[0].length; let g = lv.map.map(r => r.split(''));
const mapOf = () => g.map(r => r.join(''));
const pieces = () => { const seen = new Set(), out = []; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (g[y][x] === '#' && !seen.has(x + ',' + y)) {
  const q = [[x, y]], cells = []; seen.add(x + ',' + y); let bottom = false; while (q.length) { const [a, b] = q.pop(); cells.push([a, b]); if (b === H - 2) bottom = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = a + dx, ny = b + dy; if (nx >= 1 && ny >= 1 && nx <= W - 2 && ny <= H - 2 && g[ny][nx] === '#' && !seen.has(nx + ',' + ny)) { seen.add(nx + ',' + ny); q.push([nx, ny]); } } }
  if (!bottom) out.push(cells); } return out.sort((a, b) => b.length - a.length); };
const D = lv.plan ? Math.max(lv.plan.filter(s => s.swipe).length, 1) : 3;
const base = solveModel(mapOf(), { maxDepth: D + 1, maxPath: 6, cap: 150000 }); const baseDepth = base.depth;
console.log(lv.en, 'model depth', baseDepth, 'hanging pieces', pieces().map(p => p.length).join(','));
const kept = [];
for (const cells of pieces()) {
  const save = cells.map(([x, y]) => [x, y]); for (const [x, y] of cells) g[y][x] = ' ';
  let ok = true, why = '';
  try {
    const m = solveModel(mapOf(), { maxDepth: D + 1, maxPath: 6, cap: 150000 }); if (m.depth !== baseDepth) { ok = false; why = 'model depth ' + m.depth; }
    if (ok && run(mapOf(), [], { cap: 40000, depth: 120, fine: true }).won) { ok = false; why = 'no swipes wins'; }
    if (ok && lv.plan) { const r = runPlan(mapOf(), lv.plan, { cap: 60000, depth: 80 }); if (!r.won) { ok = false; why = 'plan fails at ' + r.step; } }
  } catch (e) { ok = false; why = 'error ' + e.message; }
  console.log('  piece of', cells.length, 'cells at', cells[0], ok ? 'CUT' : 'kept (' + why + ')');
  if (ok) kept.push(...save); else for (const [x, y] of save) g[y][x] = '#';
}
fs.writeFileSync('tools/c8-mini/carve-' + (i + 1) + '.json', JSON.stringify(kept));
