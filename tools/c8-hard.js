/* Chương VIII: look for a HARD level of the "hall" family (flames + ice + water things + a hanging block over a water pocket, as in the owner's Iceberg / Basin / Sewer levels).
   node tools/c8-hard.js [samples] [seed] [minDepth]   prints the maps whose shortest solution (tools/c8-model.js) needs at least minDepth gatherings, hardest first */
const { solveModel } = require('./c8-model.js');
const samples = +(process.argv[2] || 100), minDepth = +(process.argv[4] || 5); let seed = +(process.argv[3] || 1) * 7919 + 13;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
function make() {
  const nf = ri(3, 4), nr = ri(3, 5), ni = ri(3, 5), hb = ri(3, 4) + 1, hp = Math.min(hb, ri(3, 5)), wb = 3;
  const W = 1 + 2 + 1 + hp * 0 + 1 + wb + 1 + nf + 3, H = hb + 5, rows = Array.from({ length: H }, () => new Array(W).fill(' ')), R = r => H - 2 - r;
  for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  const xP = W - 2, xF = xP - nf, xI = xF - 1, xB = xI - wb, xPool = xB - 1;
  for (let r = 0; r < nr; r++) for (let k = 0; k < nf; k++) rows[R(r)][xF + k] = rnd() < .12 ? 'b' : 'a';
  for (let r = 0; r < ni; r++) rows[R(r)][xI] = rnd() < .18 ? 'v' : 'i';
  for (let r = 1; r <= hb; r++) for (let k = 0; k < wb; k++) rows[R(r)][xB + k] = '#';
  rows[R(0)][xB + 1] = '#'; for (const k of [0, 2]) rows[R(0)][xB + k] = rnd() < .75 ? 'v' : ' ';
  for (let r = 0; r < hp; r++) rows[R(r)][xPool] = 'v';
  rows[R(0)][xP] = 'P'; rows[R(0)][2] = 'G';
  return rows.map(r => r.join(''));
}
const hist = {}; const found = []; const t0 = Date.now();
for (let n = 0; n < samples; n++) {
  const map = make(); let r; try { r = solveModel(map, { maxDepth: 8, maxPath: 5, cap: 120000 }); } catch (e) { continue; }
  hist[r.depth === null ? (r.capped ? "cap" : "none") : r.depth] = (hist[r.depth === null ? (r.capped ? "cap" : "none") : r.depth] || 0) + 1; if (r.depth !== null && r.depth >= minDepth) found.push({ map, depth: r.depth, count: r.solutions.length, sol: r.solutions[0], states: r.states });
  if ((n + 1) % 20 === 0) console.error(n + 1, 'tried,', found.length, 'found,', Math.round((Date.now() - t0) / 1000) + 's');
}
found.sort((a, b) => b.depth - a.depth || a.count - b.count);
for (const f of found.slice(0, 6)) { console.log(`// depth ${f.depth}, ${f.count} minimal solutions, ${f.states} states`); console.log(f.map.join('\n')); console.log(JSON.stringify(f.sol.map(m => m.kind + ':' + m.cells.map(c => c.join(',')).join(' ')))); }

console.log(JSON.stringify(hist));