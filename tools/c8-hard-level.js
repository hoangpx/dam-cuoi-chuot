/* Chương VIII: the hard level "Ba Cửa Ải" / "Three Gates", built from three of the owner's levels in a row (right to left):
   1. the corridor of Overflowing Sewer (3 swipes), 2. the hall of Iceberg (4 swipes), 3. the pit of Abandoned Basin, mirrored (2 swipes).
   F = the standing row of the floor. Prints the map, checks the 9 swipes with the model and in the real engine. */
const F = 8, W = 31, H = F + 6, g = Array.from({ length: H }, () => new Array(W).fill('#'));
const set = (x, y, c) => { g[y][x] = c; }, open = (x, y) => set(x, y, ' ');
for (let y = 2; y <= F; y++) for (let x = 1; x <= 19; x++) open(x, y);                       // the big hall: sky over the pit, the Iceberg hall
for (let x = 20; x <= 29; x++) open(x, F);                                                     // the corridor of the Sewer
// ---- 1. Sewer (c0 = x 20): left plug 21-22, P 23, Q 24 over a shaft, R 25, right plug 26, the way back 27-29
for (const x of [23, 24, 25]) open(x, F - 1); open(24, F - 2);
set(21, F, 'i'); set(22, F, 'i'); set(23, F, 'a'); set(24, F, 'a'); set(25, F, 'a'); set(26, F, 'i');
set(23, F - 1, 'i'); set(24, F - 1, 'a'); set(25, F - 1, 'i'); set(24, F - 2, 'i');
for (let y = F + 1; y <= F + 3; y++) set(24, y, 'v'); for (let x = 24; x <= 29; x++) set(x, F + 4, 'v');
// ---- 2. Iceberg: pool 11, block 12-14 (pillar 13, pockets 12 and 14), ice column 15, flames 16-18 (spirals at 16)
for (let y = F - 4; y <= F; y++) set(11, y, 'v');
for (let y = F - 4; y <= F - 1; y++) for (let x = 12; x <= 14; x++) set(x, y, '#');
set(13, F, '#'); set(12, F, 'v'); set(14, F, 'v');
for (let y = F - 4; y <= F; y++) set(15, y, 'i');
for (let y = F - 4; y <= F; y++) for (let x = 16; x <= 18; x++) set(x, y, (x === 16 && (y === F - 1 || y === F - 3)) ? 'b' : 'a');
// a low roof over the pit and the chest (rows 2..F-4, x 1..10): nothing can be flown over the pit from the pool's top (the engine let the mouse do that when the hall was open)
for (let y = 2; y <= F - 4; y++) for (let x = 1; x <= 10; x++) set(x, y, '#');
// ---- 3. Basin, mirrored: ledge x 10 (standing row F), gap 9, flames/ice 5-8, gap 4, mass 1-3 with the chest on it
for (let y = F + 1; y <= F + 3; y++) for (let x = 4; x <= 9; x++) open(x, y);
for (let x = 5; x <= 8; x++) { set(x, F, 'i'); for (let y = F + 1; y <= F + 3; y++) set(x, y, 'a'); }
for (let y = F - 1; y <= F + 3; y++) for (let x = 1; x <= 3; x++) set(x, y, '#');
set(29, F, 'P'); set(3, F - 2, 'G');
const map = g.map(r => r.join(''));
const sw = (...c) => c;
const steps = [
  sw([24, F + 4], [25, F + 4], [26, F + 4]),                                                  // Sewer: water along the tunnel floor (the shaft water drops one cell)
  sw([23, F], [24, F], [25, F]),                                                              // flames P Q R, let go at R: the right plug melts
  sw([21, F], [22, F], [23, F], [24, F], [25, F]),                                            // the five ice in the corridor
  sw([18, F - 4], [17, F - 4], [16, F - 4]), sw([18, F], [17, F], [16, F]), sw([17, F - 2], [17, F - 1], [16, F - 1]), sw([15, F - 1], [15, F], [14, F]),   // Iceberg
  sw([6, F + 3], [5, F + 3], [5, F + 2]), sw([8, F + 2], [8, F + 1], [7, F + 1]),               // Basin
];
module.exports = { map, steps };
if (require.main === module) {
  console.log(map.join('\n'));
  const { makeModel, parseMap } = require('./c8-model.js'), P = parseMap(map), M = makeModel(P.W, P.H, 6); let gr = P.g.map(r => r.slice()); M.settle(gr);
  console.log('model: reach at start', M.reach(gr, P.start, P.goal));
  for (const s of steps) { gr = M.apply(gr, s.map(([x, y]) => [x, P.H - 1 - y])); console.log('after swipe', JSON.stringify(s[0]), '->', M.reach(gr, P.start, P.goal)); }
  const { run } = require('./c8-engine-test.js'); const t0 = Date.now(), r = run(map, steps, { cap: +(process.argv[2] || 60000), depth: 90 });
  console.log('engine:', JSON.stringify({ won: r.won, depth: r.depth, seen: r.seen, log: r.log.map(l => l.r + (l.ok ? '' : '!')) }), Math.round((Date.now() - t0) / 1000) + 's');
}
