/* Chương II · next 100 (after Thiên biến): more frames for tools/c2-gen.js, same rules as tools/c2-specs-tb.js (row() and the guard
   are copied from there), new combinations of barriers and words so the boards do not look like the Thiên biến ones.
   Run with SPECS=./c2-specs-vh.js OUT=c2-gen-vh. */
const row = (id, bars, row0, o = {}) => {
  const W = row0.length, H = o.H || 7, xs = o.xs || bars.map((_, i) => W - 4 * (bars.length - i)), rows = [row0];
  for (let y = 1; y < H; y++) { const r = Array(W).fill('.'); bars.forEach((b, i) => [...b].forEach((c, j) => { r[xs[i] + j] = c; })); rows.push(r.join('')); }
  rows[3] = rows[3].slice(0, W - 2) + 'g' + rows[3].slice(W - 1);
  for (const [y, s] of o.rows || []) rows[y] = s + rows[y].slice(s.length);    // pinned words at the start of a row
  return { id, base: rows, area: [0, 1, xs[0] - 1, H - 1], walls: 4, cap: 250000, secs: 900, maxLen: 220, ...o };
};
const S = [
  // three locked doors in a row, one key word: every key must be pushed into its door
  row('ba-cua', ['d', 'd', 'd'], 'M=1W=3D=8K=7G=6::::', { loose: 'K2=kkkm', need: ['K=2'], walls: 5 }),
  // door, fire, river: the key is pushed, the river floats
  row('cua-lua-song', ['d', 'f', '~~'], 'M=1W=3N=4F=5D=8K=7', { xs: [5, 9, 13], rows: [[6, 'G=6']], loose: 'K2N9=km', need: ['K=2'] }),
  // river, door, fire: one LÀ read three ways
  row('song-cua-lua', ['~~', 'd', 'f'], 'M=1W=3N=4F=5D=8K=7', { xs: [5, 10, 14], rows: [[6, 'G=6']], loose: 'K2N9F=km', need: ['K=2'] }),
  // the words fall; three rivers, one BAY
  row('chu-roi-ba-song', ['~', '~', '~'], 'M=1W=3T=$N=4G=6:::::', { loose: 'N9=m', need: ['N=9'], walls: 5 }),
  // safe through two fires, then float over the river: one LÀ for both
  row('ben-hai-lua-song', ['f', 'f', '~~'], 'M=1W=3N=4F=5G=6:::::', { xs: [5, 9, 13], loose: 'M#N9=m', need: ['M=#', 'N=9'], walls: 5 }),
  // three rivers, rocks to fill them
  row('ba-song-da', ['~', '~', '~'], 'M=1W=3N=4G=6:::::::', { loose: 'R2=rrrm', need: ['R=2'], walls: 5 }),
  // two doors and a river: two keys pushed, one BAY
  row('hai-cua-song', ['d', 'd', '~'], 'M=1W=3N=4D=8K=7::::', { rows: [[6, 'G=6']], loose: 'K2N9=kkm', need: ['K=2'] }),
  // the gate runs from the mouse; fire, then river
  row('cong-so-lua-song', ['f', '~~'], 'M=1W=3N=4F=5::', { xs: [5, 9], rows: [[5, 'G(M'], [6, 'G=6']], loose: 'F9=Nm', need: [] }),
  // the words fall; two fires to walk through safe
  row('chu-roi-hai-lua', ['f', 'f'], 'M=1W=3F=5T=$:::', { rows: [[6, 'G=6']], loose: 'M#=m', need: ['M=#'] }),
  // the fish eats words; three fires
  row('ca-an-chu-ba-lua', ['f', 'f', 'f'], 'M=1W=3F=5G=6:::::', { rows: [[5, 'S)T']], loose: 'M#=ssm', need: ['M=#'] }),
  // river, fire, river, fire: one BAY
  row('song-lua-song-lua', ['~~', 'f', '~~', 'f'], 'M=1W=3N=4F=5::::::::', { xs: [5, 9, 12, 16], rows: [[5, 'w'], [6, 'G=6']], loose: 'N9=Fm', need: [] }),
  // fire eats the words; float the fire, then the river
  row('lua-an-chu-song', ['f', '~~'], 'M=1W=3N=4F=5::', { xs: [5, 9], rows: [[5, 'F)T'], [6, 'G=6']], loose: 'N9=Fm', need: [] }),
  // the river runs from the mouse; fire before it
  row('nuoc-so-lua', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[5, 'N(M'], [6, 'G=6']], loose: 'F9=Nm', need: [] }),
  // three fires: the mouse floats over them, then must come down at the gate
  row('ba-lua-bay', ['f', 'f', 'f'], 'M=1W=3F=5G=6:::::', { loose: 'M9=m', need: ['M=9'], walls: 5 }),
  // three rivers: the mouse floats over them, then must come down at the gate
  row('ba-song-chuot-bay', ['~', '~~', '~'], 'M=1W=3N=4G=6:::::::', { xs: [5, 9, 14], loose: 'M9=m', need: ['M=9'], walls: 5 }),
  // river, fire, river: the mouse floats, then lands
  row('song-lua-chuot-bay', ['~', 'f', '~~'], 'M=1W=3N=4F=5G=6::::', { xs: [5, 9, 13], loose: 'M9=m', need: ['M=9'], walls: 5 }),
  // the key must fly over the river, the mouse too, then the door
  row('chia-bay-cua', ['~~', 'f', 'd'], 'M=1W=3N=4F=5D=8K=7', { xs: [5, 10, 14], rows: [[6, 'G=6']], loose: 'K2N9F=km', need: ['K=2'] }),
  // two fires then a river: one LÀ to walk safe and to float
  row('hai-lua-song', ['f', 'f', '~~'], 'M=1W=3N=4F=5::::::', { xs: [5, 9, 13], rows: [[6, 'G=6']], loose: 'M#N9=m', need: ['M=#', 'N=9'] }),
  // rocks to fill a river, then a fire to float
  row('da-song-lua', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[5, 'R=2'], [6, 'G=6']], loose: 'F9=rrm', need: ['F=9'] }),
  // the gate runs from the mouse over three rivers
  row('cong-so-ba-song', ['~', '~', '~'], 'M=1W=3N=4G(M:::::', { rows: [[6, 'G=6']], loose: 'N9=m', need: ['N=9'], walls: 5 }),
  // the fish eats words in two rivers; float them
  row('ca-an-chu-hai-song', ['~', '~~'], 'M=1W=3N=4::::::', { xs: [5, 9], rows: [[5, 'S)T'], [6, 'G=6']], loose: 'N9=ssm', need: ['N=9'] }),
  // the words fall; the key must reach the door
  row('chu-roi-cua', ['d', 'd'], 'M=1W=3T=$D=8K=7', { rows: [[6, 'G=6']], loose: 'K2=kkm', need: ['K=2'] }),
  // fire, door, river, the gate runs: everything at once
  row('cong-so-cua-song', ['d', '~~'], 'M=1W=3N=4D=8K=7', { xs: [5, 9], rows: [[5, 'G(M'], [6, 'G=6']], loose: 'K2N9=km', need: ['K=2'] }),
  // rocks fall, three rivers to fill
  row('da-roi-ba-song', ['~', '~', '~'], 'M=1W=3N=4R=$G=6:::', { loose: 'R2=rrrm', need: ['R=2'], walls: 5 }),
  // --- round 2 (2026-11-16): variants of the frames that gave the most strict boards
  // the words fall; fire, river, fire, river: walk safe and float, one LÀ
  row('chu-roi-lua-song', ['f', '~', 'f', '~'], 'M=1W=3T=$N=4F=5G=6::::', { loose: 'M#N9=m', need: ['M=#', 'N=9'], walls: 5 }),
  // the fish eats words; two fires and a river
  row('ca-an-chu-lua-song', ['f', 'f', '~'], 'M=1W=3N=4F=5G=6::::', { rows: [[5, 'S)T']], loose: 'M#N9=ssm', need: ['M=#'] }),
  // fire eats the words; fire then two rivers
  row('lua-an-chu-hai-song', ['f', '~', '~~'], 'M=1W=3N=4F=5::::', { xs: [5, 9, 13], rows: [[5, 'F)T'], [6, 'G=6']], loose: 'N9=Fm', need: [] }),
  // four fires: the mouse floats over them, then must come down at the gate
  row('bon-lua-bay', ['f', 'f', 'f', 'f'], 'M=1W=3F=5G=6:::::::::', { loose: 'M9=m', need: ['M=9'], walls: 5 }),
  // the words fall; three fires to walk through safe
  row('chu-roi-ba-lua', ['f', 'f', 'f'], 'M=1W=3T=$F=5G=6::::', { loose: 'M#=m', need: ['M=#'], walls: 5 }),
  // the words fall; two rivers and a fire, one LÀ for both
  row('chu-roi-song-lua', ['~', '~', 'f'], 'M=1W=3T=$N=4F=5G=6', { loose: 'M#N9=m', need: ['M=#', 'N=9'], walls: 5 }),
];
for (const s of S) {
  s.need = s.need || [];
  const b = s.base.map(r => [...r]), isNoun = ch => /[MCWNFSGHJKDROT]/.test(ch), free = (x, y) => b[y] && b[y][x] === '.';
  const wc = s.wallCh || 'w', placed = new Set((s.place || []).map(([x, y]) => x + ',' + y));
  for (let y = 0; y < b.length; y++) for (let x = 0; x < b[y].length; x++) {
    const ch = s.base[y][x]; if (placed.has(x + ',' + y)) continue;
    if (isNoun(ch) && free(x, y + 1) && !placed.has(x + ',' + (y + 1))) b[y + 1][x] = wc;
    if (ch === '6' && free(x, y - 1) && !placed.has(x + ',' + (y - 1))) b[y - 1][x] = wc;
    if (/[1-9<^!$*#[]/.test(ch) && (s.loose || '').includes('&') && free(x + 1, y)) b[y][x + 1] = wc;
  }
  s.base = b.map(r => r.join(''));
  const w = s.base[0].length; s.base.forEach((r, i) => { if (r.length !== w) throw new Error(s.id + ' row ' + i + ' is ' + r.length + ' not ' + w); });
  s.maxWalls = s.maxWalls ?? 14;
}
module.exports = S;
