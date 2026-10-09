// Terrace with flames walk-through (C8SOFT=ao): apply a list of gatherings (col, f) and show the board with the cells the mouse can stand on; node tools/c8-terrace-check.js '[...]'
const { level, settle } = require('./c8-solve.js');
const W = 17, H = 15, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const R = f => 14 - f, set = (k, f, ch) => { g[R(f)][k] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[1][x] = '#'; g[14][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = 15; k < W; k++) for (let f = 1; f <= 13; f++) set(k, f, '#');
for (let k = 3; k <= 7; k++) for (let f = 3; f <= 10; f++) set(k, f, '#');
for (let k = 0; k <= 2; k++) for (let f = 3; f <= 6; f++) set(k, f, '#');
for (let k = 0; k <= 1; k++) for (let f = 8; f <= 13; f++) set(k, f, '#');
const put = (ks, fs, ch) => ks.forEach(k => fs.forEach(f => set(k, f, ch)));
put([8, 9, 10], [7, 8], 'd'); put([8, 9, 10], [5, 6], 'a'); put([8, 9, 10, 11], [3, 4], 'd'); put([8, 9, 10, 11], [1, 2], 'a');
g[R(1)][+(process.env.START || 5)] = 'P'; g[R(7)][1] = 'G';
const map = g.map(r => r.join('')), env = level({ map }, false), { P } = env, w = P.W, h = P.H;
let c = P.cells.slice(); settle(c, w, h); let q = env.stand(c, P.start.x, P.start.y);
for (const S of JSON.parse(process.argv[2] || '[]')) { for (const [k, f] of S) c[R(f) * w + k] = ' '; settle(c, w, h); }
const R2 = env.reach(c, q[0], q[1]); const goal = P.goal.y * w + P.goal.x;
for (let y = 0; y < h; y++) { let row = ''; for (let x = 0; x < w; x++) row += R2.has(y * w + x) && c[y * w + x] === ' ' ? '·' : (R2.has(y * w + x) ? c[y * w + x].toUpperCase() : c[y * w + x]); console.log(String(14 - y).padStart(2) + ' ' + row); }
console.log('reaches the exit box:', R2.has(goal));
