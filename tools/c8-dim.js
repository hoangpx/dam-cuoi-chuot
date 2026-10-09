// the reference level "Dim Tunnel" (analysis only): a low tunnel with a row of 9 on the floor: ice, 3 flames, ice, 3 flames, ice. cols c = 0 at the tunnel's left end; map col = c + 1, map row = 4 - f.
const { solve } = require('./c8-solve.js');
const W = 19, H = 8, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const set = (c, f, ch) => { g[4 - f][c + 1] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[7][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let c = 0; c <= 16; c++) set(c, 0, (c === 14 || c === 15) ? 'w' : '#');
for (let c = 0; c <= 16; c++) set(c, -1, (c === 14 || c === 15) ? 'w' : '#');
for (let c = 0; c <= 16; c++) { const hi = c >= 5 && c <= 7 ? 3 : (c === 4 || c === 8) ? 2 : 1; for (let f = hi + 1; f <= 3; f++) set(c, f, '#'); }       // the stepped ceiling
set(16, 1, '#'); set(16, 2, '#'); set(16, 3, '#');
const put = (cs, ch) => cs.forEach(c => set(c, 1, ch));
put([2, 6, 10], 'i'); put([3, 4, 5, 7, 8, 9], 'a');
set(12, 1, 'P'); set(+(process.env.GC ?? 0), 1, 'G');
const map = g.map(r => r.join('')); console.log(map.join(String.fromCharCode(10)));
const r = solve({ name: 'Dim Tunnel', map }, { maxDepth: +(process.argv[2] || 4), cap: 900000, fixedQ: !!process.env.FIXEDQ });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states, capped: r.capped }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'stand', JSON.stringify([p.from[0] - 1, 4 - p.from[1]]), 'gather (c, f)', JSON.stringify(p.cells.map(([x, y]) => [x - 1, 4 - y]))));
