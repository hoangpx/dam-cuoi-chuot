// the reference level "Frigid Well" (ice rule "ice touching X turns it to ice" is NOT modelled): picture columns c (0 = the left box's column), rows f (f1 = the floor row). map col = c + 4.
const { solve } = require('./c8-solve.js');
const W = 21, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const R = f => 13 - f, set = (c, f, ch) => { g[R(f)][c + 4] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let c = -4; c <= 3; c++) for (let f = 1; f <= 4; f++) if (c <= -3 || c >= -2) set(c, f, '#');          // the rock under the hall floor and the brick wall on the left
for (let f = 5; f <= 12; f++) { set(-4, f, '#'); set(-3, f, '#'); }
for (let f = 6; f <= 12; f++) set(0, f, '#');                                                                // the narrow pillar left of the hall
for (let c = 0; c <= 8; c++) set(c, 12, '#');                                                               // hall ceiling
for (let c = 9; c <= 16; c++) for (let f = 5; f <= 12; f++) set(c, f, '#');                                 // the dark mass over the right area
for (let c = 14; c <= 16; c++) for (let f = 3; f <= 4; f++) set(c, f, '#');
for (let c = 6; c <= 8; c++) for (let f = 7; f <= 8; f++) set(c, f, '#');                                    // the block the scrolls sit on
set(4, 1, '#'); set(5, 1, '#'); set(5, 4, '#'); set(6, 3, '#'); set(6, 4, '#');                              // rock around the well, the ledge with the right box (box cell = (6,4))
const put = (cs, fs, ch) => cs.forEach(c => fs.forEach(f => set(c, f, ch)));
put([4], [2, 3, 4], 'i'); put([5], [2, 3], 'i'); put([6, 7, 8, 9], [1, 2], 'i');                             // the ice well and its duct
put([9], [3], 'd');
put([2, 3, 4], [5], 'b'); put([2], [6, 7], 'i'); put([4], [6, 7], 'i'); put([3], [6, 7], 'a'); put([3], [8], 'i');
put([6, 7, 8], [9], 'S');
const goalAt = process.env.BOX === 'B' ? [6, 5] : [0, 5];
set(12, 1, 'P'); set(goalAt[0], goalAt[1], 'G');
const map = g.map(r => r.join('')); console.log(map.join(String.fromCharCode(10)));
const r = solve({ name: 'Frigid Well', map }, { maxDepth: +(process.argv[2] || 3), cap: 900000 });
console.log(JSON.stringify({ box: process.env.BOX || 'A', moves: r.minMoves, allScrolls: r.allScrolls, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0] - 4, 13 - p.from[1]]), 'gather', JSON.stringify(p.cells.map(([x, y]) => [x - 4, 13 - y]))));
