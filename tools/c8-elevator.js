// the reference level "Elevator": a 1-wide shaft with soft spirals, a peg and clods on top, a 1-high tunnel plugged by two clods. C8SOFT=b (the yellow spirals).
const { solve } = require('./c8-solve.js');
const W = 16, H = 12, g = Array.from({ length: H }, () => new Array(W).fill(' '));
const S = (k, r) => g[r + 1][k + 6] = '#', rows = (k, r0, r1) => { for (let r = r0; r <= r1; r++) S(k, r); };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = -5; k <= -1; k++) rows(k, 5, 9); rows(-1, 0, 2); rows(0, 9, 9);
rows(1, 0, 7); rows(2, 0, 7); rows(1, 9, 9); rows(2, 9, 9); rows(3, 0, 2); rows(3, 9, 9); rows(4, 0, 2); rows(4, 7, 9);
for (let k = 5; k <= 9; k++) { rows(k, 0, 2); rows(k, 5, 9); }
const put = (k, rs, ch) => rs.forEach(r => { g[r + 1][k + 6] = ch; });
put(0, [0, 2], 'd'); put(0, [1], 'o'); put(0, [3, 4, 5, 6, 7, 8], 'b'); put(1, [8], 'd'); put(2, [8], 'd');
g[5][3] = 'P'; g[5][12] = 'G';
const map = g.map(r => r.join('')); console.log(map.join('\n'));
const r = solve({ name: 'Elevator', map }, { maxDepth: 5, cap: 800000 });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'gather (shaft col 0 = map col 6)', JSON.stringify(p.cells.map(([x, y]) => [x - 6, y - 1]))));
