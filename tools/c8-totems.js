// the reference level "Totems": three towers on a rock staircase. Picture coordinates (cols from the first tower, rows from the top clod), shifted by (+5, +1) into the map.
const { solve } = require('./c8-solve.js');
const W = 20, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; g[H - 2][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
const rock = (c0, c1, top) => { for (let c = c0; c <= c1; c++) for (let r = top + 1; r < H; r++) g[r][c + 5] = '#'; };   // picture col range, picture top row
for (let x = 0; x < 5; x++) for (let y = 11; y < H; y++) g[y][x] = '#';
rock(0, 2, 9); rock(3, 5, 8); rock(6, 8, 7); rock(9, 9, 5); rock(10, 13, 3);
const put = (c, rows, ch) => rows.forEach(r => { g[r + 1][c + 5] = ch; });
put(0, [2, 3, 7, 8], 'd'); put(0, [4, 5, 6], 'a'); put(3, [1, 2, 6, 7], 'd'); put(3, [3, 4, 5], 'b'); put(6, [0, 1, 5, 6], 'd'); put(6, [2, 3, 4], 'o');
if (process.env.FREEZE) for (const c of process.env.FREEZE.split(',')) for (let y = 0; y < H; y++) if ('abcd'.includes(g[y][+c + 5])) g[y][+c + 5] = '#';   // FREEZE=3 : that tower can not be gathered (picture column)
g[10][1] = 'P'; g[+(process.env.GY || 3)][+(process.env.GX || 16)] = 'G';
const map = g.map(r => r.join(''));
console.log(map.join('\n'));
const r = solve({ name: 'Totems', map }, { maxDepth: +(process.argv[2] || 5), cap: 800000 });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'gather', JSON.stringify(p.cells.map(([x, y]) => [x - 5, y - 1]))));
