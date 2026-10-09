// the owner's Iceberg in the engine's map format (analysis only) and his solution, to check the real engine
const W = 18, H = 9, R = r => H - 2 - r, rows = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
for (let r = 0; r <= 4; r++) rows[R(r)][6] = 'v';
for (let r = 1; r <= 4; r++) for (let x = 7; x <= 9; x++) rows[R(r)][x] = '#';
rows[R(0)][8] = '#'; rows[R(0)][7] = 'v'; rows[R(0)][9] = 'v';
for (let r = 0; r <= 4; r++) rows[R(r)][10] = 'i';
for (let r = 0; r <= 4; r++) for (let x = 11; x <= 13; x++) rows[R(r)][x] = (x === 11 && (r === 1 || r === 3)) ? 'b' : 'a';
rows[R(0)][15] = 'P'; rows[R(0)][2] = 'G';
const map = rows.map(r => r.join(''));
const P = (...c) => c.map(([x, r]) => [x, R(r)]);
const steps = [P([13, 4], [12, 4], [11, 4]), P([13, 0], [12, 0], [11, 0]), P([12, 2], [12, 1], [11, 1]), P([10, 1], [10, 0], [9, 0])];
module.exports = { map, steps };
if (require.main === module) { const { run } = require('./c8-engine-test.js'); console.log(map.join('\n')); const r = run(map, steps); console.log(JSON.stringify({ won: r.won, depth: r.depth, seen: r.seen, log: r.log })); console.log(r.finalCells.match(new RegExp('.{' + W + '}', 'g')).join('\n')); }
