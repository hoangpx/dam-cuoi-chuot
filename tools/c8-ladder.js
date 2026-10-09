// the reference level "Broken Ladder" (analysis only). picture col k (0 = the left ice rail), rows f (f1 = the floor row). map col = k + 7, map row = 13 - f.
const { solve } = require('./c8-solve.js');
const W = 19, H = 15, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const set = (k, f, ch) => { g[13 - f][k + 7] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[13][x] = '#'; g[14][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = -6; k <= -6; k++) for (let f = 1; f <= 12; f++) set(k, f, '#');
for (let k = -5; k <= -2; k++) for (let f = 1; f <= 4; f++) set(k, f, '#');                       // the ledge, 4 high
for (let k = -5; k <= -4; k++) for (let f = 5; f <= 8; f++) set(k, f, 'w');                       // the pool beside the box
set(-3, 9, '#'); set(-3, 10, '#');
set(9, 1, '#'); set(9, 2, '#');
for (let f = 1; f <= 7; f++) { set(0, f, 'i'); set(2, f, 'i'); }                                    // the two rails
for (const f of [2, 4, 6]) set(1, f, 'i');                                                          // the rungs
for (const f of [1, 3, 5, 7]) set(1, f, 'd');                                                       // the clods between them
set(5, 1, 'P'); set(-3, 5, 'G');
const map = g.map(r => r.join('')); console.log(map.join(String.fromCharCode(10)));
const r = solve({ name: 'Broken Ladder', map }, { maxDepth: +(process.argv[2] || 3), cap: 900000, fixedQ: !!process.env.FIXEDQ });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0] - 7, 13 - p.from[1]]), 'gather (k, f)', JSON.stringify(p.cells.map(([x, y]) => [x - 7, 13 - y]))));
