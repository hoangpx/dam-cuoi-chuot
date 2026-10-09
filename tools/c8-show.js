// prints the board after a list of gatherings (picture coordinates) and which cells the mouse can stand on: node tools/c8-show.js '[[[0,3],[1,3],[2,3]], ...]'
const { level, settle } = require('./c8-solve.js');
const W = 14, H = 11, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) g[10][x] = '#'; for (let y = 5; y <= 10; y++) g[y][0] = '#';
for (let y = 2; y <= 6; y++) for (let x = 4; x <= 8; x++) g[y][x] = '#'; for (let y = 3; y <= 6; y++) g[y][9] = '#';
for (let y = 4; y <= 6; y++) for (let x = 10; x < W; x++) g[y][x] = '#'; for (let x = 10; x < W; x++) g[0][x] = '#'; for (let x = 11; x < W; x++) g[1][x] = '#';
for (let x = 0; x <= 2; x++) { g[3][x] = 'd'; g[4][x] = 'd'; } for (let y = 5; y <= 9; y++) { g[y][1] = 'a'; g[y][2] = 'a'; }
g[9][6] = 'P';
const map = ['#'.repeat(W + 2), ...g.map(r => '#' + r.join('') + '#'), '#'.repeat(W + 2)];
const env = level({ map }, false), { P } = env, w = P.W, h = P.H;
let c = P.cells.slice(); settle(c, w, h); let q = env.stand(c, P.start.x, P.start.y);
for (const S of JSON.parse(process.argv[2] || '[]')) { for (const [x, y] of S) c[(y + 1) * w + x + 1] = ' '; settle(c, w, h); q = env.stand(c, q[0], q[1]) || q; }
const R = env.reach(c, q[0], q[1]);
for (let y = 0; y < h; y++) { let row = ''; for (let x = 0; x < w; x++) row += R.has(y * w + x) && c[y * w + x] === ' ' ? '·' : c[y * w + x]; console.log(String(y - 1).padStart(2) + ' ' + row); }
console.log('cols:  ' + [...Array(w).keys()].map(x => (x - 1 + 10) % 10).join(''));
