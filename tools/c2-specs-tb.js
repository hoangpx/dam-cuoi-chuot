/* Chương II · Thiên biến: frames for tools/c2-gen.js where every win needs two or three rule changes, often made from
   the SAME few words (one LÀ, one BAY…), so a sentence has to be taken apart and built again further on, or built as a
   cross that reads two ways. Run with SPECS=./c2-specs-tb.js OUT=c2-gen-tb. Legend as in tools/c2-specs.js and
   tools/c2-specs-ml.js. row(): barriers across the hall (one column each, 4 cells apart, the last at W-4), the gate at
   (W-2, 3), the loose words start left of the first barrier. A barrier may be several columns (o.xs gives where each starts).
   Rivers are two or three wide where a word pushed in would otherwise make a ford. */
const row = (id, bars, row0, o = {}) => {
  const W = row0.length, H = o.H || 7, xs = o.xs || bars.map((_, i) => W - 4 * (bars.length - i)), rows = [row0];
  for (let y = 1; y < H; y++) { const r = Array(W).fill('.'); bars.forEach((b, i) => [...b].forEach((c, j) => { r[xs[i] + j] = c; })); rows.push(r.join('')); }
  rows[3] = rows[3].slice(0, W - 2) + 'g' + rows[3].slice(W - 1);
  for (const [y, s] of o.rows || []) rows[y] = s + rows[y].slice(s.length);    // pinned words at the start of a row
  return { id, base: rows, area: [0, 1, xs[0] - 1, H - 1], walls: 4, cap: 250000, secs: 900, maxLen: 220, ...o };
};
const S = [
  // one LÀ, one BAY: float the river, then the fire
  row('song-lua-bay', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[6, 'G=6']], loose: 'N9=Fm', need: [] }),
  row('lua-song-bay', ['f', '~'], 'M=1W=3N=4F=5:', { rows: [[6, 'G=6']], loose: 'F9=Nm', need: [] }),
  // the key must float over the river and still be pushed: one LÀ read both ways
  row('chu-thap', ['~', 'd'], 'M=1W=3N=4D=8K=7', { rows: [[5, 'w'], [6, 'G=6']], loose: 'N9K2=km', need: ['K=2'] }),
  row('chu-thap-2', ['d', '~'], 'M=1W=3N=4D=8K=7', { rows: [[6, 'G=6']], loose: 'K2N9=km', need: ['K=2'] }),
  // river, fire, door: one LÀ for all of it
  row('ba-ai', ['~', 'f', 'd'], 'M=1W=3N=4F=5D=8:::', { rows: [[6, 'K=7G=6']], loose: 'N9FK2=km', need: ['K=2'], cap: 400000 }),
  // one BAY for fire, river, fire
  row('lua-song-lua', ['f', '~~', 'f'], 'M=1W=3N=4F=5::::', { xs: [5, 9, 13], rows: [[5, 'w'], [6, 'G=6']], loose: 'F9=Nm', need: [] }),
  row('song-lua-song', ['~~', 'f', '~~'], 'M=1W=3N=4F=5:::::', { xs: [5, 9, 12], rows: [[5, 'w'], [6, 'G=6']], loose: 'N9=Fm', need: [] }),
  // the river turns to rocks, the rocks go back into it later
  row('song-da-song', ['~~', '~~'], 'M=1W=3N=4R=2:::', { xs: [5, 10], rows: [[6, 'G=6']], loose: 'N=Rrm', need: ['N=R'] }),
  // safe across the fire, then float across the water, one LÀ
  row('ben-bay', ['f', '~~'], 'M=1W=3N=4F=5::', { xs: [5, 9], rows: [[6, 'G=6']], loose: 'M#N9=m', need: ['M=#'] }),
  // the gate word is past the river: make the river float, carry LÀ and THẮNG over, float the fire too
  row('cong-qua-song', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[6, 'G']], loose: 'N9F=6m', need: ['G=6'] }),
  // fire, then a wall of hay that fire eats
  row('lua-an-rom', ['f', 'h'], 'M=1W=3F=5H=3:', { rows: [[6, 'G=6']], loose: 'F)H-m', need: ['F-5'] }),
  // the gate runs from you; between you, a river and fire
  row('cong-so-song', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[5, 'G(M'], [6, 'G=6']], loose: 'N9=Fm', need: [] }),
  // the words fear you: herd them across a floating river and over the fire
  row('chan-qua-song', ['~', 'f'], 'M=1N=4T(MF=5:', { rows: [[6, 'W=3']], loose: 'N9=F9=G6m', wallCh: 'w', need: ['N=9'] }),
  // the fish eats words in the river; the river floats: words still drown in the fish
  row('ca-an-chu-song', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[5, 'S)T'], [6, 'G=6']], loose: 'N9F=ssm', need: [] }),
  // three rivers, one sentence
  row('ba-song', ['~~', '~~', '~~'], 'M=1W=3N=4G=6::::::::', { xs: [5, 9, 13], loose: 'N9=m', need: ['N=9'], walls: 5 }),
  // three fires: walk safe, or make it not hot, or let it fall
  row('ba-lua', ['f', 'f', 'f'], 'M=1W=3F=5G=6:::::', { loose: 'M=#m', need: ['M=#'], walls: 5 }),
  // rocks fall: the river under them fills
  row('da-roi-song', ['~', 'f'], 'M=1W=3N=4F=5:', { rows: [[5, 'R=2'], [6, 'G=6']], loose: 'F9=rrm', need: ['F=9'] }),
  // a door then a river: the key floats, then the mouse
  row('cua-bay', ['d', '~'], 'M=1W=3N=4D=8K=2', { rows: [[6, 'G=6']], loose: 'K7N9==km', need: ['K=7'] }),
];
// free-form frames
S.push(
  // one LÀ, three rules: break the pen, open the door with the key, then the gate
  { id: 'ba-viec', base: ['M=1D=8K=2H=3', '............', '............', '..www...hhh.', '..wkw...hgh.', '..www...hdh.', '............', 'K.7..G.6....'],
    place: [[0, 2, 'W'], [1, 2, '='], [2, 2, '3']], loose: 'm', walls: 3, wallCh: 'h', need: ['-W=3', 'K=7', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // one LÀ: rocks into the river, then the gate on the far bank
  { id: 'mot-la', base: ['M=1W=3N=4:G.6', '......~~~....', '......~~~....', '......~~~....', '......~~~...g', '......~~~....', '......~~~....'],
    loose: 'R2=rrrm', area: [0, 1, 5, 6], walls: 4, need: ['R=2', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // one LÀ: the river floats for a moment, the gate is on the far side
  { id: 'mot-la-bay', base: ['M=1W=3N=4:G.6', '......~~~....', '......~~~....', '......~~~....', '......~~~...g', '......~~~....', '......~~~....'],
    loose: 'N9=m', area: [0, 1, 5, 6], walls: 4, need: ['N=9', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the gate fears the mouse and falls down the steps; one LÀ for falling and for winning
  { id: 'so-roi-mot-la', base: ['M=1W=3G(M:::', 'G.6.........', '............', '..g.........', '..wwww......', '.......ww...', '............'],
    loose: 'G$=m', walls: 6, need: ['G=$', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the cat eats the mouse and follows it: make the cat afraid, then the gate
  { id: 'meo-duoi-so', base: ['M=1C=^C]M:::', 'C)MW=3......', '............', '............', '...........g', 'c...........', '............'],
    loose: 'C(G=6m', walls: 7, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // fire follows the mouse; lead it into the pond and only then may the words be built
  { id: 'lua-theo-ao', base: ['M=1N=4F]M:::', 'F=5W=3......', '............', '.....ww.....', '..~..wf...g.', '.....ww.....', '............'],
    loose: 'F^G=6m', walls: 5, need: ['F=^', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // rocks fear the mouse and drag each other: drive them into the river, then the words over the ford
  { id: 'so-keo-chu', base: ['M=1W=3R(M:::', 'R=<N=4......', '............', '...r...~....', '...r...~....', '.......~...g', '.......~....'],
    loose: 'G=6m', area: [0, 1, 6, 6], walls: 4, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the mouse walks backwards on hay, the gate fears the mouse, and the gate word lies in the hay
  { id: 'rom-nguoc-cong', base: ['M=1W=3M@H=[', 'G(M........', '...........', '..hh.......', '...h...g...', '...........'],
    loose: 'G=6m', walls: 6, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the river swaps places with whatever walks in: one LÀ for the river and the gate
  { id: 'doi-song', base: ['M=1W=3N=4:G.6', '......~~~....', '......~~~....', '......~~~....', '......~~~...g', '......~~~....', '......~~~....'],
    loose: 'N*=m', area: [0, 1, 5, 6], walls: 4, need: ['N=*', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // fish chase you and eat every word they touch: build the gate's rule out of their reach
  { id: 'ca-duoi-an-chu', base: ['M=1W=3S)TS=^', 'S]M.........', '............', '............', '...........g', '............', '............'],
    loose: 'G=6ssm', walls: 8, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // fire eats hay and follows you: set it running and lead it to the hay round the gate
  { id: 'lua-an-rom-theo', base: ['M=1W=3H=3F)H', 'F=5F]MG=6...', '............', '........hhh.', '..f.....hgh.', '........hhh.', '............'],
    loose: 'F^=m', walls: 6, need: ['F=^'], cap: 300000, secs: 900, maxLen: 220 },
  // over the fire safe, break the jar with the key in it, push the key into the door
  { id: 'chum-sau-lua', base: ['M=1W=3D=8F=5J=!', '...............', '......f........', '......f....d...', '......f..j.d.g.', '......f....d...', 'K=7&2.f....d...'],
    loose: 'J+KM#=m', area: [0, 1, 5, 6], walls: 4, need: ['J+K'], cap: 300000, secs: 900, maxLen: 220 },
  // the key floats over the river on one LÀ, then the same LÀ opens the door
  { id: 'chia-qua-song', base: ['M=1W=3N=4D=8K=2:', '................', '.....~~...d.....', '.....~~...d.....', '.....~~...d...g.', '.....~~...d.....', '.....~~...d.....'],
    loose: 'K7N9=km', area: [0, 1, 4, 6], walls: 4, need: ['K=7'], cap: 300000, secs: 900, maxLen: 220 },
  // the mouse walks backwards on hay; the hay lies across a floating river
  { id: 'rom-tren-song', base: ['M=1W=3M@H=[:', 'N=4.........', '.......~~...', '..h....~~...', '..hh...~~..g', '.......~~...', '.......~~...'],
    loose: 'N9=G6m', area: [0, 1, 6, 6], walls: 4, need: ['N=9'], cap: 300000, secs: 900, maxLen: 220 },
  // the gate runs from the mouse AND from the cat; the cat runs on its beat
  { id: 'cong-so-hai', base: ['M=1W=3G(MG(C', 'C=^.........', '............', 'c...........', '............', '.......g....', '............'],
    loose: 'G=6m', walls: 8, dirs: [[0, 3, 'R']], need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the river eats words: float it to save the words, then make the gate
  { id: 'nuoc-an-chu-bay', base: ['M=1W=3N)T:::', '....~.......', '....~.......', '....~.......', '....~......g', '....~.......'],
    place: [[6, 1, 'G'], [8, 3, '6']], loose: 'N=9=m', area: [0, 1, 3, 5], walls: 3, need: ['N=9', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the gate eats the mouse: a cat must walk in its place, and the cat must be pushed by nobody
  { id: 'cong-an-meo-di', base: ['M=1W=3G)M:::', 'G=6.........', '............', '............', '..........g.', '............'],
    loose: 'C1=&mc', walls: 8, need: ['C=1'], cap: 300000, secs: 900, maxLen: 220 },
  // fish run from the mouse and the mouse eats them; a fish must become the gate before you catch it
  { id: 'ca-so-cong', base: ['M=1W=3S(M:::', 'M)SG=6......', '............', '.....s......', '............', '..........s.'],
    loose: 'S=Gm', walls: 8, need: ['S=G'], cap: 300000, secs: 900, maxLen: 220 },
  // everything fears the mouse; the gate must be cornered with the words still standing
  { id: 'ca-lang-so-2', base: ['M=1W=3T(M:::', 'G(M.........', '............', '............', '.......g....', '............', '............'],
    loose: 'G=6m', walls: 8, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // words walk backwards with the mouse
  { id: 'chu-nguoc-di', base: ['M=1T=1W=3:::', 'T=[.........', '............', '............', '............', '...........g'],
    loose: 'G=6m', walls: 9, need: ['G=6'], cap: 300000, secs: 900, maxLen: 220 },
  // the words fall; a river runs to the floor; one LÀ to float the river and win
  { id: 'chu-roi-mot-la', base: ['M=1W=3T=$:::', '......~.....', '......~.....', '......~....g', '......~.....', '......~.....', 'N=4...~.....'],
    loose: 'N9G6=m', walls: 5, need: ['N=9', 'G=6'], cap: 300000, secs: 900, maxLen: 220 },
);
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
