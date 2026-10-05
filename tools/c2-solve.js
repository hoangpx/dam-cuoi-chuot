/* Chương II solver (node): solves every map (or those given) by breadth-first search with the game's own engine
   (js/ch2/levels.js, engine.js, solver.js), prints moves and states; --out writes the moves into js/ch2/solutions.js
   (C2_SOL[i]: the hint follows these). Usage: node --max-old-space-size=8000 tools/c2-solve.js [index ...] [--cap N] [--out] */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const src = ['js/ch2/levels.js', 'js/ch2/engine.js', 'js/ch2/solver.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const tmp = path.join(require('os').tmpdir(), 'c2-engine-' + process.pid + '.js');
fs.writeFileSync(tmp, src + '\nmodule.exports = { C2LEVELS, c2Parse, c2Settle, c2Solve };'); const E = require(tmp); fs.unlinkSync(tmp);
const args = process.argv.slice(2), capI = args.indexOf('--cap'), cap = capI >= 0 ? +args[capI + 1] : 3e6;
const which = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--cap').map(Number);
const L = E.C2LEVELS, solFile = path.join(root, 'js/ch2/solutions.js');
let old = []; try { old = JSON.parse((fs.readFileSync(solFile, 'utf8').match(/C2_SOL = (\[[\s\S]*\]);/) || [])[1] || '[]'); } catch (e) {}
const out = old.slice(); let bad = 0;
for (let i = 0; i < L.length; i++) {
  if (which.length && !which.includes(i)) continue;
  const t0 = Date.now(), st = E.c2Parse(L[i]); E.c2Settle(st);
  const r = E.c2Solve(st, cap);
  console.log(`${i + 1}. ${L[i].name}: ${r.moves ? r.moves.length + ' moves ' + r.moves : 'NO SOLUTION' + (r.capped ? ' (cap)' : '')} · ${r.states} states · ${Date.now() - t0} ms`);
  if (r.moves) out[i] = r.moves; else bad++;
}
if (args.includes('--out')) {
  out.length = L.length;
  fs.writeFileSync(solFile, `/* Chương II: a shortest win for every map (tools/c2-solve.js --out writes this; rerun it after changing a map).\n   The bought hint finds its way from where the player stands back onto this road. */\nconst C2_SOL = [\n  ${[...out].map(m => JSON.stringify(m || '')).join(',\n  ')}\n];\n`);
  console.log('wrote', solFile);
}
process.exitCode = bad ? 1 : 0;
