// Totems through the real engine: node tools/c8-totems-bot.js   (C8SOFT=b : the yellow spirals do not block the mouse)
const play = require('./c8-bot.js');
const W = 20, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; g[H - 2][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
const rock = (c0, c1, top) => { for (let c = c0; c <= c1; c++) for (let r = top + 1; r < H; r++) g[r][c + 5] = '#'; };
for (let x = 0; x < 5; x++) for (let y = 11; y < H; y++) g[y][x] = '#';
rock(0, 2, 9); rock(3, 5, 8); rock(6, 8, 7); rock(9, 9, 5); rock(10, 13, 3);
const put = (c, rows, ch) => rows.forEach(r => { g[r + 1][c + 5] = ch; });
put(0, [2, 3, 7, 8], 'd'); put(0, [4, 5, 6], 'a'); put(3, [1, 2, 6, 7], 'd'); put(3, [3, 4, 5], 'b'); put(6, [0, 1, 5, 6], 'd'); put(6, [2, 3, 4], 'o');
g[10][1] = 'P'; g[3][16] = 'G'; const map = g.map(r => r.join(''));
const cell = ([c, r]) => [c + 5, r + 1], S = a => a.map(s => s.map(cell));
console.log('A flames + 3 clods (what the owner did):', JSON.stringify(play(map, S([[[0, 4], [0, 5], [0, 6]], [[0, 5], [0, 6], [0, 7]]]))));
console.log('nothing eaten:', JSON.stringify(play(map, [])));
console.log('only the 3 flames:', JSON.stringify(play(map, S([[[0, 4], [0, 5], [0, 6]]]))));
