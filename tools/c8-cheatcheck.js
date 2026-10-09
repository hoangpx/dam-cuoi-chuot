/* Is there a shorter way in the REAL engine than the intended solution? Enumerates every distinct board reachable by fewer swipes than the solution (model chains, up to 8 long), and runs the mouse search in the engine on each (swipes first, then the mouse moves).
   node tools/c8-cheatcheck.js <index in tools/c8-mini/final.json | path to a json file with {map, steps}> */
const fs = require('fs'), { parseMap, makeModel } = require('./c8-model.js'), { run } = require('./c8-engine-test.js');
const arg = process.argv[2] || '0', L = fs.existsSync(arg) ? JSON.parse(fs.readFileSync(arg, 'utf8')) : JSON.parse(fs.readFileSync('tools/c8-mini/final.json', 'utf8'))[+arg];
const { g, W, H } = parseMap(L.map), M = makeModel(W, H, 8), key = g => g.map(r => r.join('')).join('/');
let s0 = g.map(r => r.slice()); M.settle(s0); const seen = new Map([[key(s0), []]]); let frontier = [{ g: s0, seq: [] }]; const D = L.steps.length;
for (let d = 1; d < D; d++) { const next = []; for (const { g: gg, seq } of frontier) for (const p of M.chains(gg)) { const h = M.apply(gg, p), k = key(h); if (seen.has(k)) continue; const sq = seq.concat([p.map(([x, r]) => [x, H - 1 - r])]); seen.set(k, sq); next.push({ g: h, seq: sq }); } frontier = next; }
console.log('boards with fewer swipes than the solution:', seen.size);
let cheats = 0; for (const [k, seq] of seen) { const r = run(L.map, seq, { cap: 40000, depth: 150, fine: true }); if (r.won) { cheats++; console.log('CHEAT with', JSON.stringify(seq)); } }
console.log(cheats ? cheats + ' cheap way(s) found' : 'no cheap way: every board with fewer swipes fails in the engine');
