// the reference level "Frozen Hut" (analysis only). picture col k (0 = the brick pillar at the left of the pile), rows f (f1 = the floor row). map col = k + 7, map row = 12 - f.
const { solve } = require('./c8-solve.js');
const W = 19, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const set = (k, f, ch) => { g[12 - f][k + 7] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[12][x] = '#'; g[13][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = -1; k <= 7; k++) for (let f = 9; f <= 11; f++) set(k, f, '#');                       // the ceiling over the hut
for (let f = 3; f <= 8; f++) set(7, f, '#');                                                      // the pillar hanging next to the water
for (let k = 10; k <= 12; k++) for (let f = 1; f <= 11; f++) set(k, f, '#');                     // wall right of the water
for (let k = 8; k <= 9; k++) for (let f = 1; f <= 11; f++) set(k, f, 'w');                       // the water shaft
set(-3, 1, '#'); for (let f = 1; f <= 2; f++) set(-4, f, '#'); for (let f = 1; f <= 3; f++) { set(-5, f, '#'); } for (let f = 1; f <= 4; f++) set(-6, f, '#');   // the steps up at the left
const put = (k, fs, ch) => fs.forEach(f => set(k, f, ch));
put(0, [1], 'd'); put(0, [2, 3, 4, 5], '#');
put(1, [1], 'i'); put(1, [2, 3], 'd'); put(1, [4, 5], 'i'); put(1, [6], 'o'); put(1, [7], 'd');
put(2, [1, 2], 'i'); put(2, [3], 'd'); put(2, [4], 'i'); put(2, [5, 6], 'o'); put(2, [7], 'd');
put(3, [1], 'd'); put(3, [2, 3], '#'); put(3, [4, 5], 'd');
const gk = +(process.env.GK ?? -5), gf = +(process.env.GF ?? 4);
set(5, 1, 'P'); set(gk, gf + 0, 'G');
const map = g.map(r => r.join('')); console.log(map.join(String.fromCharCode(10)));
const r = solve({ name: 'Frozen Hut', map }, { maxDepth: +(process.argv[2] || 4), cap: 900000, fixedQ: !!process.env.FIXEDQ });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0] - 7, 12 - p.from[1]]), 'gather (k, f)', JSON.stringify(p.cells.map(([x, y]) => [x - 7, 12 - y]))));
