// the reference level "Narrow Gate" (analysis only). picture col k (0 = the left column of the shaft), rows f (f1 = the corridor row). map col = k + 7, map row = 13 - f.
const { solve } = require('./c8-solve.js');
const W = 17, H = 16, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const set = (k, f, ch) => { g[13 - f][k + 7] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[15][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = -6; k <= 9; k++) for (let f = 0; f <= 13; f++) { if (f === 0 && (k < 5 || k > 6) && k >= -5 && k <= 4) set(k, f, '#'); }                  // the floor
for (let k = -3; k <= -1; k++) for (let f = 2; f <= 13; f++) set(k, f, '#');                                                                              // rock over the corridor, left of the shaft
for (let k = 2; k <= 6; k++) for (let f = 2; f <= 13; f++) set(k, f, '#');                                                                                // right of the shaft
for (let k = 0; k <= 1; k++) for (let f = 9; f <= 13; f++) set(k, f, '#');                                                                                // roof of the shaft
for (let k = -6; k <= -6; k++) for (let f = 0; f <= 13; f++) set(k, f, '#');
for (let k = 7; k <= 9; k++) for (let f = -1; f <= 13; f++) set(k, f, '#');
for (let k = -5; k <= -4; k++) for (let f = 1; f <= 12; f++) set(k, f, 'w');                                                                              // the tall water shaft at the left
for (let k = 5; k <= 6; k++) { set(k, 0, 'w'); set(k, -1, 'w'); }                                                                                         // the pool under the start side
for (const k of [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6]) set(k, -1, g[13 + 1][k + 7] === 'w' ? 'w' : '#');
const put = (k, fs, ch) => fs.forEach(f => set(k, f, ch));
put(0, [1], 'i'); put(0, [2], 'd'); put(0, [3, 4], 'b'); put(0, [5, 6], 'i');
put(1, [1, 2, 3], 'a'); put(1, [4, 5, 6], 'd'); put(1, [7], 'b');
set(2, 1, 'P'); set(-2, 1, 'G');
const map = g.map(r => r.join('')); console.log(map.join(String.fromCharCode(10)));
const r = solve({ name: 'Narrow Gate', map }, { maxDepth: +(process.argv[2] || 4), cap: 900000, fixedQ: !!process.env.FIXEDQ });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0] - 7, 13 - p.from[1]]), 'gather (k, f)', JSON.stringify(p.cells.map(([x, y]) => [x - 7, 13 - y]))));
