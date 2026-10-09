// the reference level "Terrace": a rock mass with a pocket (the exit) on its left, two slabs of clods over flames on its right. Rows: f1 = the floor row the mouse stands in, f(n) above it.
const { solve } = require('./c8-solve.js');
const W = 17, H = 15, g = Array.from({ length: H }, () => new Array(W).fill(' '));
const R = f => 14 - f, set = (k, f, ch) => { g[R(f)][k] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[1][x] = '#'; g[14][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = 15; k < W; k++) for (let f = 1; f <= 13; f++) set(k, f, '#');                    // right wall
for (let k = 3; k <= 7; k++) for (let f = 3; f <= 10; f++) set(k, f, '#');                     // the tall rock, floor corridor (f1, f2) underneath
for (let k = 0; k <= 2; k++) for (let f = 3; f <= 6; f++) set(k, f, '#');                       // the ledge with the exit box
for (let k = 0; k <= 1; k++) for (let f = 8; f <= 13; f++) set(k, f, '#');                      // the block above the pocket
const put = (ks, fs, ch) => ks.forEach(k => fs.forEach(f => set(k, f, ch)));
put([8, 9, 10], [7, 8], 'd'); put([8, 9, 10], [5, 6], 'a'); put([8, 9, 10, 11], [3, 4], 'd'); put([8, 9, 10, 11], [1, 2], 'a');
const start = process.env.START ? +process.env.START : 5;
g[R(1)][start] = 'P'; g[R(7)][1] = 'G';
const map = g.map(r => r.join('')); console.log(map.join('\n'));
const r = solve({ name: 'Terrace', map }, { maxDepth: +(process.argv[2] || 5), cap: 900000, fixedQ: !!process.env.FIXEDQ });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0], 14 - p.from[1]]), 'gather (col, f)', JSON.stringify(p.cells.map(([x, y]) => [x, 14 - y]))));
