/* Chương VIII level maker, the "shaft" kind (after the owner's Elevator, but its own layout): a start room, a 1-wide shaft with a stack of
   things (soft leaves under a clod, a peg, more things on top) and a 1-high tunnel at the bottom plugged by 2–3 things, a chamber and two
   steps up to the chest. Kept only if the mouse must STAND IN THE SHAFT while it gathers (it fails when it only gathers from where it
   starts): node tools/c8-gen-shaft.js [count] [seed] */
const { solve } = require('./c8-solve.js');
let seed = +(process.argv[3] || 1) * 7919 + 5; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
function make() {
  const rp = ri(4, 5), depth = ri(3, 5), fS = rp + depth, xs = ri(5, 7), tl = ri(2, 3), cx = xs + tl + 1, W = cx + 6, H = fS + 3;
  const g = Array.from({ length: H }, () => new Array(W).fill(' ')); const set = (x, y, ch) => { g[y][x] = ch; };
  for (let x = 0; x < W; x++) { set(x, 0, '#'); set(x, 1, '#'); set(x, H - 1, '#'); } for (let y = 0; y < H; y++) { set(0, y, '#'); set(W - 1, y, '#'); }
  for (let x = 1; x < xs; x++) for (let y = rp; y < H; y++) set(x, y, '#');                      // the start room's floor (top row rp)
  for (let y = 1; y <= rp - 3; y++) set(xs - 1, y, '#');                                         // a pillar left of the top of the shaft; the opening is the two rows above the floor
  for (let y = fS + 1; y < H; y++) { set(xs, y, '#'); }                                          // the shaft's floor
  for (let x = xs + 1; x <= xs + tl; x++) { for (let y = 1; y < fS; y++) set(x, y, '#'); set(x, fS + 1, '#'); }   // roof and floor of the 1-high tunnel
  for (let y = fS + 1; y < H; y++) set(cx, y, '#');                                              // the chamber's floor
  for (let y = 1; y < fS - 5; y++) for (let x = cx; x < W; x++) set(x, y, "#");                  // ceiling over the chamber and the steps
  for (let y = fS - 1; y < H; y++) set(cx + 1, y, '#');                                          // step 1 (2 up)
  for (let x = cx + 2; x < W; x++) for (let y = fS - 3; y < H; y++) set(x, y, '#');              // step 2 (2 more) and the ledge with the chest
  const K = 'd', softs = ['a', 'b', 'c'], stack = [];
  for (let k = ri(1, 2); k > 0; k--) stack.push('d');                           // things above the peg
  for (let k = ri(0, 2); k > 0; k--) stack.push('o');
  const sk = pick(softs); stack.push(K); for (let k = ri(5, 7); k > 0; k--) stack.push(sk);          // one soft kind in the column, so a chain can be drawn
  const start = fS - stack.length + 1; if (start < 2) return null;
  stack.forEach((ch, k) => set(xs, start + k, ch));
  for (let x = xs + 1; x <= xs + tl; x++) set(x, fS, K);
  set(ri(2, xs - 2), rp - 1, 'P'); set(cx + 2, fS - 4, 'G');
  return g.map(r => r.join(''));
}
if (process.env.DIAG) {                                                        // why are candidates rejected?
  const st = { n: 0, capped: 0, unsolvable: 0, cheat: 0, few: 0, stayWorks: 0, good: 0 }; let shown = 0;
  for (let t = 0; t < 300; t++) { const map = make(); if (!map) continue; st.n++; let f; try { f = solve({ map }, { maxDepth: 5, cap: 100000 }); } catch (e) { continue; }
    if (f.capped) { st.capped++; continue; } if (f.minMoves === null) { st.unsolvable++; if (shown++ < 1) console.log(map.join(String.fromCharCode(10))); continue; } if (f.cheat) { st.cheat++; continue; } if (f.minMoves < 2) { st.few++; continue; }
    const y = solve({ map }, { maxDepth: 5, cap: 100000, fixedQ: true }); if (y.minMoves !== null) { st.stayWorks++; continue; } st.good++; }
  console.log(JSON.stringify(st)); process.exit(0);
}
const want = +(process.argv[2] || 3), found = [], seen = new Set(); let tries = 0;
while (found.length < want && tries < 3000) {
  tries++; const map = make(); if (!map) continue; const key = map.join('/'); if (seen.has(key)) continue; seen.add(key);
  let free, stay; try { free = solve({ map }, { maxDepth: 5, cap: 200000 }); } catch (e) { continue; }
  if (free.error || free.capped || free.minMoves === null || free.cheat || free.minMoves < 2) continue;
  try { stay = solve({ map }, { maxDepth: 5, cap: 200000, fixedQ: true }); } catch (e) { continue; }
  if (stay.minMoves !== null) continue;                                     // gathering from the start would do: not the kind we want
  found.push({ map, moves: free.minMoves, path: free.path });
}
for (const f of found) { console.log(`// moves ${f.moves}`); console.log(JSON.stringify(f.map, null, 0).replace(/"/g, "'")); f.path.forEach((p, k) => console.log(`//   ${k + 1}. stand at ${JSON.stringify(p.from)} gather ${JSON.stringify(p.cells)}`)); }
console.error(`${found.length} found in ${tries} tries`);
