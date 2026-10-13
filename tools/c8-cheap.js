/* Chương VIII: is there a cheaper way than the shortest solution in the REAL engine? Every distinct board reachable with fewer swipes
   (model chains up to 8 cells) is first screened with a GENEROUS model (makeModel 'loose': flights one cell longer, no limit on hops out of
   water); only boards it lets through are run in the engine (tools/c8-engine-test.js, fine macros). Faster than tools/c8-cheatcheck.js.
   node tools/c8-cheap.js <json file with { map } | level index> <swipes in the solution> */
const fs = require('fs'), { parseMap, makeModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
function cheap(map, D) {
  const { g, W, H, start, goal } = parseMap(map), M = makeModel(W, H, 8), L = makeModel(W, H, 8, 'loose'), key = g => g.map(r => r.join('')).join('/');
  const s0 = g.map(r => r.slice()); M.settle(s0); const seen = new Map([[key(s0), { g: s0, seq: [] }]]); let frontier = [seen.get(key(s0))];
  for (let d = 1; d < D; d++) { const next = []; for (const { g: gg, seq } of frontier) for (const p of M.chains(gg)) { const h = M.apply(gg, p), k = key(h); if (seen.has(k)) continue;
    const it = { g: h, seq: seq.concat([p.map(([x, r]) => [x, H - 1 - r])]) }; seen.set(k, it); next.push(it); } frontier = next; }
  const sus = [...seen.values()].filter(it => L.reach(it.g, start, goal)), cheats = [];
  for (const it of sus) if (run(map, it.seq, { cap: 40000, depth: 150, fine: true }).won) cheats.push(it.seq);
  return { boards: seen.size, screened: sus.length, cheats };
}
module.exports = { cheap };
if (require.main === module) {
  const a = process.argv[2]; let map;
  if (fs.existsSync(a)) map = JSON.parse(fs.readFileSync(a, 'utf8')).map; else { const vm = require('vm'), ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../js/ch8/levels.js', 'utf8').replace('const C8_LEVELS', 'C8_LEVELS'), ctx); map = ctx.C8_LEVELS[+a].map; }
  const r = cheap(map, +process.argv[3]); console.log(`boards with fewer swipes: ${r.boards}, let through by the generous model: ${r.screened}, cheap ways in the engine: ${r.cheats.length}`);
  r.cheats.forEach(c => console.log('  CHEAP: ' + JSON.stringify(c)));
}
