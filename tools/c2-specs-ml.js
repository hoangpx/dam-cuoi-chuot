/* Chương II · Muôn loài: frames for tools/c2-gen.js built round the new words ĂN, SỢ, THEO, NGƯỢC (and KHÔNG before a verb),
   mixed with the old ones. Run with SPECS=./c2-specs-ml.js OUT=c2-gen-ml. Same legend as tools/c2-specs.js, plus
   ) ĂN · ( SỢ · ] THEO · [ NGƯỢC. place: [[x, y, ch]] puts a loose piece at a fixed cell (it stays movable in play). */
const S = [
  // the loose words run from the mouse: herd them into a sentence
  { id: 'chan-chu', base: ['M=1W=3T(M:', '..........', '..........', '..........', '..........', '.........g'], loose: 'G=6m', walls: 7, need: ['G=6'] },
  // herd the words, and a river eats the ones that run the wrong way
  { id: 'chan-chu-song', base: ['M=1N=4T(M:', '....~.....', '....~.....', '....~.....', '....~....g', 'W=3.~.....'], loose: 'G=6m', walls: 4, need: ['G=6'] },
  // herd KHÔNG into the wall rule to open the pen round the gate
  { id: 'chan-chu-hai', base: ['M=1W=3T(M::', 'G=6........', '...........', '......www..', '......wgw..', '......www..', '...........'], loose: 'W-3m', walls: 3, need: ['W-3'] },
  // the gate runs from the mouse: corner it
  { id: 'cong-so', base: ['M=1W=3G(M:', '..........', '..........', '....g.....', '..........', '..........'], loose: 'G=6m', walls: 8, need: ['G=6'] },
  // a gate on a ring road never gets cornered: tell it not to be afraid
  { id: 'cong-khong-so', base: ['M=1G=6G(M::', 'W=3........', '.wwwwwwwww.', '.w:::::::w.', '.wwwwwwwww.', '...........'], loose: 'G-(Mgm', walls: 2, need: ['G-(M'] },
  // a hot cat sits by the gate: make it afraid of you
  { id: 'meo-so-chuot', base: ['M=1W=3C=5:', 'wwwwww....', '...c......', '.g...w....', 'wwwwww....', '..........'], loose: 'C(Mm', walls: 3, need: ['C(M'] },
  // rocks run from the mouse: drive them into the river for a ford
  { id: 'da-so', base: ['M=1N=4R(M:', 'R=3G=6W=3.', '.......~..', '..r....~..', '.......~.g', '....r..~..', '.......~..'], loose: 'm', walls: 3, need: [] },
  // the mouse runs from cats: turn the cats to stone
  { id: 'chuot-so-meo', base: ['M=1W=3M(C:', 'C=5.......', '..........', '......ccc.', '......cgc.', '......c.c.'], loose: 'C=Rm', walls: 4, need: ['C=R'] },
  // the gate eats the mouse: be safe
  { id: 'cong-an-chuot', base: ['M=1W=3G)M:', 'G=6.......', '..........', '..........', '........g.', '..........'], loose: 'M=#m', walls: 8, need: ['M=#'] },
  { id: 'cong-an-chuot-hai', base: ['M=1W=3G)M:', '..........', '..........', '..........', '........g.', '..........'], loose: 'M=#G=6m', walls: 7, need: ['M=#', 'G=6'] },
  // fish swim up and down and eat words: slip the words through between them
  { id: 'ca-an-chu', base: ['M=1W=3S=^S)T', '.....w......', '.....s......', '............', '............', '.....s.....g', '.....w......'], loose: 'G=6m', walls: 5, area: [0, 1, 4, 6], dirs: [[5, 2, 'D'], [5, 5, 'U']], need: ['G=6'] },
  // the cat runs and eats the fish: tell the fish to leave a gate first
  { id: 'meo-an-ca', base: ['M=1W=3C)S:', 'C=^G=6....', '..........', 'c.......s.', '..........', '..........'], loose: 'S+Gm', walls: 6, dirs: [[0, 3, 'R']], need: ['S+G'] },
  // the river eats words: the words you need are over there
  { id: 'nuoc-an-chu', base: ['M=1W=3N)T:', '....~.....', '....~.....', '....~.....', '....~....g', '....~.....'], place: [[6, 1, 'G'], [7, 3, '6']], loose: 'N=R=m', area: [0, 1, 3, 5], walls: 3, need: ['N=R'] },
  // a cat chases the mouse and eats it
  { id: 'meo-duoi', base: ['M=1C=^C]M:', 'C)MW=3....', '..........', '..........', '.........g', 'c.........'], loose: 'G=6m', walls: 6, need: ['G=6'] },
  { id: 'meo-duoi-khong-an', base: ['M=1C=^C]M::', 'C)MW=3G=6..', '...........', '...........', '..........g', 'c..........', '...........'], loose: 'C-)Mm', walls: 8, need: ['C-)M'] },
  // rocks follow the mouse: make them run into the river
  { id: 'da-theo-song', base: ['M=1N=4R]M:', 'W=3G=6....', '.......~..', '.......~r.', '.......~.g', '.......~..', '.......~.r'], loose: 'R=^m', walls: 4, need: ['R=^'] },
  // the gate follows the cat, the cat fears the mouse
  { id: 'cong-theo-meo', base: ['M=1W=3G]C:', 'G=^C(MC=5:', '..........', '..c.......', '..........', '.......g..'], loose: 'G=6m', walls: 6, need: ['G=6'] },
  // the gate runs in its pen: make it come to you
  { id: 'cong-chay-theo', base: ['M=1W=3G=^:', 'G=6.......', '..........', '.....w.ww.', '.....wg.w.', '.....wwww.'], loose: 'G]Mm', walls: 5, dirs: [[6, 4, 'R']], need: ['G]M'] },
  // the cat walks the other way: two rooms, one pair of feet
  { id: 'guong-meo', base: ['M=1C=1C=[::', 'W=3........', '...........', 'wwwwwwwwwww', '...........', '..w....w...', '.........g.'], place: [[5, 5, 'm'], [5, 1, 'c']], loose: 'G=6', area: [0, 1, 10, 2], walls: 3, need: ['G=6'] },
  { id: 'guong-hai', base: ['M=1C=1C=[::', 'W=3........', '...........', 'wwwwwwwwwww', '...........', '...........', '.........g.'], place: [[5, 5, 'm'], [5, 1, 'c'], [2, 5, 'G']], loose: '=6', area: [0, 1, 10, 2], walls: 4, need: ['G=6'] },
  // on hay the mouse walks backwards
  { id: 'nguoc-rom', base: ['M=1W=3M@H=[', '...........', '..hh....h..', '..hh...hhh.', '.........h.', '..h.......g'], loose: 'G=6m', walls: 5, need: ['G=6'] },
  // near a cat the mouse walks backwards
  { id: 'nguoc-gan-meo', base: ['M=1W=3M?C=[', '...........', '....c......', '...........', '.......c...', '..........g'], loose: 'G=6m', walls: 6, need: ['G=6'] },
  // mouse and cat walk together: split them
  { id: 'tach-meo', base: ['M=1C=1W=3:', '..........', '..........', '..........', '..........', '.........g'], loose: 'C=[G=6mc', walls: 7, need: ['C=['] },
  // the words walk the other way
  { id: 'chu-nguoc', base: ['M=1T=1T=[:', 'W=3.......', '..........', '..........', '..........', '.........g'], loose: 'G=6m', walls: 8, need: ['G=6'] },
  // the gate runs from the mouse and falls
  { id: 'so-roi', base: ['M=1W=3G(M::', 'G=6........', '...........', '..g........', '..wwww.....', '.......ww..', '...........'], loose: 'G=$m', walls: 6, need: ['G=$'] },
  // the mouse eats fish: let the fish leave a gate
  { id: 'an-ca-co-cong', base: ['M=1W=3M)S:', 'G=6.......', '..........', '.......s..', '..........', '..........'], loose: 'S+Gm', walls: 7, need: ['S+G'] },
  // the river parts as the mouse comes near (two waters meeting both sink)
  { id: 'nuoc-re', base: ['M=1W=3N=4G=6', '.......~~...', '.......~~...', '.......~~...', '.......~~..g', '.......~~...'], loose: 'N(Mm', walls: 4, need: ['N(M'] },
  // a rock that eats lava drills a way through it
  { id: 'da-khoan', base: ['M=1W=3N=5:', 'R=2G=6....', '......~~..', '..r...~~..', '......~~.g', '......~~..'], loose: 'R)Nm', walls: 4, need: ['R)N'] },
  // fire follows the mouse: drown it
  { id: 'lua-xuong-ao', base: ['M=1N=4F]M::', 'F=5W=3G=6..', '...........', '.....ww....', '..~..wf...g', '.....ww....', '...........'], loose: 'F=^m', walls: 5, need: ['F=^'] },
  // cats chase the mouse to eat it: lead them into the river to make a ford
  { id: 'meo-xuong-song', base: ['M=1C]MC=^::', 'C)MN=4G=6..', 'W=3........', '.......~...', '..c....~...', '.......~..g', 'c......~...'], loose: 'm', walls: 4, need: [] },
  // a floating cat crosses the water and pushes the words for you
  { id: 'meo-chan-chu', base: ['M=1W=3C(M::', 'C=9N=4G=6..', '...........', '.....~.....', '.....~.....', '.....~....g', '.....~.....'], place: [[7, 3, 'c'], [8, 2, 'N'], [7, 5, '='], [9, 4, 'R']], loose: 'm', area: [0, 2, 4, 6], walls: 3, need: ['N=R'] },
  // the gate runs only when a cat is near it
  { id: 'cong-so-gan-meo', base: ['M=1W=3G?C(M', '...........', '...........', '...c....g..', '...........', '......c....'], loose: 'G=6m', walls: 6, need: ['G=6'] },
  // rocks come for you and push the words
  { id: 'da-day-chu', base: ['M=1W=3N=4R]M', 'R=^R=9R=2...', '......~.....', '......~.....', '......~.....', '......~....g', '......~.....'], place: [[8, 2, 'r'], [10, 4, 'r']], loose: 'G=6m', area: [0, 2, 5, 6], walls: 3, need: ['G=6'] },
  // the cat eats the gate's word... no: the cat eats fish, the fish is the win
  { id: 'meo-an-ca-thang', base: ['M=1W=3C)S:', 'C=^C]SS=6:', '..........', 'c.........', '..........', '........s.'], loose: 'C-)Sm', walls: 6, dirs: [[0, 3, 'R']], need: ['C-)S'] },
  // fish run from the mouse; the mouse eats fish: make the fish a gate first
  { id: 'ca-so-chuot', base: ['M=1W=3S(M:', 'M)SG=6....', '..........', '.....s....', '..........', '..........'], loose: 'S=Gm', walls: 7, need: ['S=G'] },
  // the cat runs from you and is hot; the words it pushes are your way out
  { id: 'meo-day-chu', base: ['M=1W=3C(M::', 'C=5........', '...........', '...........', '....c......', '..........g'], loose: 'G=6m', walls: 7, need: ['G=6'] },
  // everything runs from the mouse
  { id: 'chu-va-cong-so', base: ['M=1W=3T(M::', 'G(M........', '...........', '...........', '.......g...', '...........'], loose: 'G=6m', walls: 7, need: ['G=6'] },
  // the cloud follows the mouse and floats; lead it over the water
  { id: 'may-theo', base: ['M=1N=4O]M::', 'O=^O=9O=6..', 'W=3........', '......~~~..', '......~o~..', '......~~~..', '...........'], loose: 'O=1m', walls: 4, need: ['O=1'] },
  // the cat follows the mouse and pushes; the mouse is behind a wall
  { id: 'meo-theo-day', base: ['M=1W=3C]M::', 'C=^C=2.....', '...........', 'wwwww......', '....w......', '..m.w....g.', '....w......'], loose: 'G=6c', area: [5, 2, 10, 6], walls: 4, need: ['G=6'] },
  // two kinds of you, the second one backwards: the cat walks into the words for you
  { id: 'guong-ba', base: ['M=1C=1C=[:', 'W=3N=4....', '....~.....', '....~.....', '....~.....', '....~....g'], place: [[2, 3, 'm'], [7, 2, 'c']], loose: 'G=6', area: [5, 1, 9, 5], walls: 3, need: ['G=6'] },
  // the mouse fears water and is pushed off the bank
  { id: 'chuot-so-nuoc', base: ['M=1W=3M(N:', 'G=6.......', '..........', '....~.....', '..........', '........g.'], loose: 'M-(Nm', walls: 6, need: ['M-(N'] },
  // the gate fears the cat, the cat runs back and forth
  { id: 'cong-so-meo', base: ['M=1W=3G(C:', 'C=^G=6....', '..........', 'c.........', '.....g....', '..........'], loose: 'C=3m', walls: 6, dirs: [[0, 3, 'R']], need: [] },
  // cats eat the words you push into them
  { id: 'meo-an-chu', base: ['M=1W=3C)T:', 'G=6.......', '..........', '....c.....', '....c.....', '....c....g'], loose: 'C=2m', walls: 5, need: ['C=2'] },
  // the mouse turns backwards on hay and the gate fears it
  { id: 'rom-cong-so', base: ['M=1W=3M@H=[', 'G(MG=6.....', '...........', '..hh.......', '...h...g...', '...........'], loose: 'm', walls: 6, need: [] },
  // fire eats hay walls: set the fire running
  { id: 'lua-an-rom', base: ['M=1W=3F)H::', 'H=3G=6.....', '...........', '.......hhh.', '.f.....hgh.', '.......hhh.'], loose: 'F=^m', walls: 4, dirs: [[1, 4, 'R']], need: ['F=^'] },
  // a pull rock that fears the mouse drags others along
  { id: 'so-keo', base: ['M=1W=3R(M::', 'R=<N=4G=6..', '...........', '...r...~...', '...r...~...', '.......~..g', '.......~...'], loose: 'm', walls: 4, need: [] },
  // words fear cats; cats run
  { id: 'chu-so-meo', base: ['M=1W=3T(C::', 'C=^........', '...........', 'c..........', '...........', '..........g'], loose: 'G=6m', walls: 6, dirs: [[0, 3, 'R']], need: ['G=6'] },
  // round 2: the hot cat in a room by the gate, scared out of the way
  { id: 'meo-so-chuot-2', base: ['M=1W=3C=5:', '..........', '.....wwwww', '.....w...w', '.....c..gw', '.....w...w', '.....wwwww'], loose: 'C(Mm', walls: 4, need: ['C(M'] },
  // a long race: the running cat will eat the fish before the fish leaves its gate
  { id: 'meo-an-ca-2', base: ['M=1W=3C)S:::', 'C=^.........', '............', 'c...........', '............', '..........s.', '............'], loose: 'S+GG=6m', walls: 9, dirs: [[0, 3, 'R']], need: ['S+G', 'G=6'] },
  // the gate falls and runs from the mouse: bring it down the steps
  { id: 'so-roi-2', base: ['M=1W=3G(M::', 'G=$........', '...........', '..g........', '..wwww.....', '.......ww..', '...........'], loose: 'G=6m', walls: 6, need: ['G=6'] },
  // the mouse eats the fish that is the win: tell it not to
  { id: 'an-ca-khong', base: ['M=1W=3M)S:', 'S=6.......', '..........', '.......s..', '..........', '..........'], loose: 'M-)Sm', walls: 8, need: ['M-)S'] },
  // the words walk with the mouse: make the mouse walk backwards
  { id: 'nguoc-va-chu', base: ['M=1T=1W=3:', '..........', '..........', '..........', '..........', '.........g'], loose: 'M=[G=6m', walls: 8, need: ['M=['] },
  // the gate fears the cat, the cat chases the mouse: steer the gate with the cat
  { id: 'so-theo', base: ['M=1W=3G(C::', 'C]MC=^.....', '...........', '...........', '...........', '...........'], loose: 'G=6mcg', walls: 8, need: ['G=6'] },
  // burning rocks chase the mouse: stop them turning
  { id: 'khong-theo', base: ['M=1W=3R]MR=^', 'R=5.........', '............', '............', '............', '...........g', 'G=6.........'], loose: 'R-]Mrrm', walls: 7, need: ['R-]M'] },
  // the gate eats only mice: let the cat walk instead
  { id: 'cong-an-chuot-meo', base: ['M=1W=3G)M:', 'G=6.......', '..........', '..........', '........g.', '..........'], loose: 'C=1mc', walls: 8, need: ['C=1'] },
];
// as in tools/c2-specs.js: walls under pinned nouns and over a pinned THẮNG so loose words cannot hang a rule on them
for (const s of S) {
  s.need = s.need || [];
  if (!s.noGuard) {
    const b = s.base.map(r => [...r]), isNoun = ch => /[MCWNFSGHJKDROT]/.test(ch), free = (x, y) => b[y] && b[y][x] === '.';
    const wc = s.wallCh || 'w', placed = new Set((s.place || []).map(([x, y]) => x + ',' + y));
    for (let y = 0; y < b.length; y++) for (let x = 0; x < b[y].length; x++) {
      const ch = s.base[y][x]; if (placed.has(x + ',' + y)) continue;
      if (isNoun(ch) && free(x, y + 1) && !placed.has(x + ',' + (y + 1))) b[y + 1][x] = wc;
      if (ch === '6' && free(x, y - 1) && !placed.has(x + ',' + (y - 1))) b[y - 1][x] = wc;
      if (/[1-9<^!$*#[]/.test(ch) && (s.loose || '').includes('&') && free(x + 1, y)) b[y][x + 1] = wc;
    }
    s.base = b.map(r => r.join(''));
  }
  const w = s.base[0].length; s.base.forEach((r, i) => { if (r.length !== w) throw new Error(s.id + ' row ' + i + ' is ' + r.length + ' not ' + w); });
  s.maxWalls = s.maxWalls ?? 14;
}
module.exports = S;
