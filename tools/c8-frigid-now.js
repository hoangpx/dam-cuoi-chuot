// Frigid Well as in the owner's later picture (right box lit): where can the mouse go from the right box? node tools/c8-frigid-now.js
const { level, settle } = require('./c8-solve.js');
const W = 21, H = 14, g = Array.from({ length: H }, () => new Array(W).fill(' ')); const R = f => 13 - f, set = (c, f, ch) => { g[R(f)][c + 4] = ch; };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let c = -4; c <= 3; c++) for (let f = 1; f <= 4; f++) if (c <= -3 || c >= -2) set(c, f, '#');
for (let f = 5; f <= 12; f++) { set(-4, f, '#'); set(-3, f, '#'); } for (let f = 6; f <= 12; f++) set(0, f, '#'); for (let c = 0; c <= 8; c++) set(c, 12, '#');
for (let c = 9; c <= 16; c++) for (let f = 5; f <= 12; f++) set(c, f, '#'); for (let c = 14; c <= 16; c++) for (let f = 3; f <= 4; f++) set(c, f, '#');
for (let c = 6; c <= 8; c++) for (let f = 7; f <= 8; f++) set(c, f, '#');
set(4, 1, '#'); set(5, 1, '#'); set(5, 4, '#'); set(6, 3, '#'); set(6, 4, '#');
const put = (cs, fs, ch) => cs.forEach(c => fs.forEach(f => set(c, f, ch)));
put([4], [2, 3], 'i'); put([5], [2], 'i'); put([6, 7, 8, 9], [1], 'i'); put([9], [2], 'd');                  // what is left of the well and the duct
put([2, 3], [5], 'b'); put([4], [4], 'b'); put([2], [6, 7], 'i'); put([4], [5, 6], 'i'); put([3], [6, 7], 'a'); put([3], [8], 'i');
put([6, 7, 8], [9], 'S');
set(6, 5, 'P'); set(0, 5, 'G');
const map = g.map(r => r.join('')), env = level({ map }, false), { P } = env, w = P.W, h = P.H;
require('fs').writeFileSync((process.env.TEMP || '.') + '/frigid-now.json', JSON.stringify(map));
let c = P.cells.slice(); settle(c, w, h);
for (const S of JSON.parse(process.argv[2] || '[]')) { for (const [k, f] of S) c[R(f) * w + k + 4] = ' '; settle(c, w, h); }   // more gatherings (col, f)
const q = env.stand(c, P.start.x, P.start.y), R2 = env.reach(c, q[0], q[1]);
for (let y = 0; y < h; y++) { let row = ''; for (let x = 0; x < w; x++) row += R2.has(y * w + x) && c[y * w + x] === ' ' ? '·' : (R2.has(y * w + x) ? c[y * w + x].toUpperCase() : c[y * w + x]); console.log(String(13 - y).padStart(2) + ' ' + row); }
console.log('the mouse can reach the left box:', R2.has(P.goal.y * w + P.goal.x), ' scrolls reachable:', P.scrolls.filter(s => R2.has(s.y * w + s.x)).length + '/3');
