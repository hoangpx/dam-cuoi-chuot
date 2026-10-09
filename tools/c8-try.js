// try one map: node tools/c8-try.js  (edit the map below)
const { solve } = require('./c8-solve.js');
const rows = [];                       // screen rows 0..10, cols 0..13 (as in the reference picture)
const W = 14, H = 11, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) g[10][x] = '#';
for (let y = 5; y <= 10; y++) g[y][0] = '#';
for (let y = 2; y <= 6; y++) for (let x = 4; x <= 8; x++) g[y][x] = '#';
for (let y = 3; y <= 6; y++) g[y][9] = '#';
for (let y = 4; y <= 6; y++) for (let x = 10; x < W; x++) g[y][x] = '#';
for (let x = 10; x < W; x++) g[0][x] = '#'; for (let x = 11; x < W; x++) g[1][x] = '#';
for (let x = 0; x <= 2; x++) { g[3][x] = 'd'; g[4][x] = 'd'; }
for (let y = 5; y <= 9; y++) { g[y][1] = 'a'; g[y][2] = 'a'; }
g[9][7] = 'P'; g[1][+(process.argv[2] || 7)] = 'G';
const map = ['#'.repeat(W + 2), ...g.map(r => '#' + r.join('') + '#')]; map.push('#'.repeat(W + 2));
console.log(map.join('\n'));
const r = solve({ name: 't', map }, { maxDepth: 6 });
console.log(JSON.stringify({ moves: r.minMoves, cheat: r.cheat, states: r.states }));
if (r.path) r.path.forEach((p, k) => console.log(k + 1, 'from', JSON.stringify(p.from), 'gather', JSON.stringify(p.cells)));
