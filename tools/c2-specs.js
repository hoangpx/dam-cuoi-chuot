/* Chương II: the "Siêu khó" ideas for tools/c2-gen.js, each drawn by hand so its idea is forced; the search only places
   the loose pieces (and a few walls) for a long road. base rows: '.' free cell (loose pieces and walls may go there),
   ':' empty and left alone, anything else stays put (words there are pinned). loose = pieces to scatter.
   need = rules every win must make (the search keeps a board only when a BFS without that rule finds no win).
   Legend as in js/ch2/levels.js: m c w ~ f s g h j k d r o things · M C W N F S G H J K D R O T nouns · = & - + ops ·
   1 ĐI 2 ĐẨY 3 CHẶN 4 CHÌM 5 NÓNG 6 THẮNG 7 MỞ 8 KHOÁ 9 BAY < KÉO ^ CHẠY ! YẾU $ RƠI * ĐỔI # BỀN. */
const S = [
  // the gate sits up a shaft of fire: make it fall
  { id: 'cong-roi', base: ['M=1W=3F=5:', 'wwwwwwwgww', 'G=6...wfw:', '......wfw:', '..........', '..........'], loose: 'G=$m', walls: 5, need: ['G=$'] },
  // a rock over the river: drop it in at the bottom
  { id: 'da-lap', base: ['M=1N=4W=3:', 'wwwwwrwwww', '.....~::::', '.....~::::', '.....~:::g', '.....~::::', '.....~::::', 'G=6..~::::'], loose: 'R=$m', walls: 3, need: ['R=$'] },
  // the gate falls into a water cell no word can reach: it must fall AND be safe
  { id: 'roi-ben', base: ['M=1N=4W=3:', 'wwwwwwwgww', 'F=5...wfww', 'w.....wfww', '.....w:~ww', '......:www', '.......G=6'], loose: 'G=$&#m', walls: 3, need: ['G=$', 'G=#'] },
  // hot cats in the corridor
  { id: 'meo-doi', base: ['M=1W=3C=5:', '..........', '..........', 'wwwwww:www', '......cc:g', 'G=6wwwwwww'], loose: 'C=*m', walls: 4, need: ['C=*'] },
  // swap through the fire, then stop swapping or the gate swaps away too
  { id: 'doi-roi-bo', base: ['M=1W=3F=5:', '.....fw...', '.....f....', '.....f...g', '..w..f....', 'G=6..f....'], loose: 'M=*m', walls: 5, need: ['M=*'] },
  // three doors, one key
  { id: 'chia-ben', base: ['M=1W=3D=8:', 'K=7&2wG=6:', '......wwww', '......dddg', '......wwww'], loose: 'K=#km', walls: 2, cap: 400000, need: ['K=#'] },
  // the gate is hot
  { id: 'cong-nong', base: ['M=1W=3G=5:', 'G=6.......', '..........', '..........', '........g.', '..........'], loose: 'M=#m', walls: 8, need: ['M=#'] },
  // one safe word digs the whole river
  { id: 'chu-ben', base: ['M=1W=3N=4::', '....~~~~~::', '....~~~~~::', '....~~~~~:g', '....~~~~~::', 'G=6.~~~~~::'], loose: 'T=#Wm', walls: 2, need: ['T=#'] },
  // every word falls
  { id: 'chu-roi', base: ['M=1W=3T=$:', '..........', '..........', '..........', '..........', '..........', '.........g'], loose: 'G=6m', walls: 9, need: ['G=6'] },
// the mouse falls: tell it not to
  { id: 'khong-roi', base: ['M=1M=$W=3:', '........g.', '..........', '..........', '..........', '.......G=6'], loose: 'M-$m', walls: 6, need: ['M-$'] },
  // a river you cannot fill: let the water fall, it pours into itself and is gone
  { id: 'nuoc-do', base: ['M=1W=3N=4:', '.....~::::', '.....~::::', '.....~:::g', '.....~::::', 'G=6..~::::'], loose: 'N=$m', walls: 4, need: ['N=$'] },
  // a wall of fire across the hall: let it drop
  { id: 'lua-roi', base: ['M=1W=3F=5:', '..........', '..........', 'ffffffffff', '::::::::::', ':::::::g::', 'G=6:::::::'], loose: 'F=$m', walls: 4, need: ['F=$'] },
  // no gate anywhere near, only a hot cat
  { id: 'meo-cong', base: ['M=1W=3C=5:', 'G=6.......', '..........', '.......c..', '..........', '..........'], loose: 'C=Gm', walls: 8, need: ['C=G'] },
  // shut in a box: the walls themselves walk
  { id: 'tuong-di', base: ['W=3G=6M=1:', ':wwwww::::', ':w...w::::', ':w...w:::g', ':w...w::::', ':wwwww::::'], loose: 'W=1m', walls: 1, maxWalls: 2, need: ['W=1'] },
  // the mouse opens doors, and must live through it
  { id: 'mo-ben', noGuard: true, base: ['W=3D=8G=6:', 'M=1&7..d::', 'w......d::', '.......d:g', '.......d::', '.......d::'], loose: '&#Sm', walls: 5, need: ['M=#'] },
  // break the jar, keep what was inside
  { id: 'co-chia', base: ['M=1W=3J=!:', 'K=7&2D=8..', '......d:::', '......d:::', '......d::g', 'G=6...d:::'], loose: 'J+Kjm', walls: 4, need: ['J+K'] },
  // the fire hides the gate: put it out with water
  { id: 'lua-co-cong', base: ['M=1F=5N=4:', 'F+GW=3....', '..........', '.......f..', '..........', 'G=6.......'], loose: 'N=2~m', walls: 2, need: ['N=2'] },
  // every word pulls
  { id: 'keo-chu', base: ['M=1W=3T=<:', '..........', '..........', '..........', '..........', '.........g'], loose: 'G=6m', walls: 9, need: ['G=6'] },
  // the cat runs and pushes
  { id: 'meo-chay', base: ['M=1W=3C=^:', '..........', '..........', '..........', '..........', '.........g'], loose: 'G=6cm', walls: 10, need: ['G=6'] },
// the words walk, and must walk through fire
  { id: 'chu-qua-lua', base: ['T=1O=3F=5:', '..........', '..........', 'ffffffffff', '::::::::::', 'G=6:g:::::'], loose: 'T=#', walls: 5, wallCh: 'o', need: ['T=#'] },
  // shut in a box; out there lie rocks
  { id: 'da-la-chuot', base: ['M=1W=3G=6:', ':wwwww::::', ':w...w:r::', ':w...w:::g', ':w...w::r:', ':wwwww::::'], loose: 'R=Mm', walls: 1, maxWalls: 2, need: ['R=M'] },
  // walk into the water and it trades places with you
  { id: 'doi-nuoc', base: ['M=1W=3N=4:', '..........', '..........', '~~~~~~~~~~', '~~~~~~~~~~', '~~~~~~~~~~', '~~~~~~~~~~', 'G=6::::g::'], loose: 'N=*m', walls: 4, need: ['N=*'] },
  // the door can be pushed
  { id: 'day-cua', base: ['M=1W=3D=8:', 'K=7wG=6...', '..........', '......wwww', '......dk:g', '......wwww'], loose: 'D=2m', walls: 6, need: ['D=2'] },
  // a key over a stack of doors: let it fall, and keep it whole
  { id: 'chia-roi', base: ['M=1W=3D=8::', 'K=7wwwwkwww', 'w....wwdgww', '.....wwdwww', '.....wwdwww', '.......dwww', 'G=6..wwwwww'], loose: 'K=$&#m', walls: 3, cap: 500000, need: ['K=$', 'K=#'] },
  // hot cats over a pond: let them drop in
  { id: 'meo-roi', base: ['M=1W=3C=5:', '......wwww', '......cc:g', '......~~ww', 'G=6...wwww', '..........'], loose: 'C=$m', walls: 5, need: ['C=$'] },
  // a ring of fire: it does not have to be hot
  { id: 'lua-khong-nong', base: ['M=1W=3F=5:', '.......fff', '.......fgf', '.......fff', '..........', 'G=6.......'], loose: 'F-5m', walls: 6, need: ['F-5'] },
  // break a jar beyond the fire and a mouse comes out of it
  { id: 'chum-co-chuot', base: ['M=1W=3J=!:', 'F=5..f::::', '.....f::::', '.....fj::g', '.....f::::', 'G=6..f::::'], loose: 'J+MSCm', walls: 4, need: ['J+M'] },
  // the river can float away
  { id: 'nuoc-bay', base: ['M=1W=3N=4:', '.....~::::', '.....~::::', '.....~:::g', '.....~::::', 'G=6..~::::'], loose: 'N=9m', walls: 5, need: ['N=9'] },
// the walls can be pushed, and that is the trouble
  { id: 'khong-day', base: ['M=1W=2G=6:', '..........', '..........', '.......www', '.......wgw', '.......www'], loose: 'W-2m', walls: 8, need: ['W-2'] },
  // every word falls, and the floor is water
  { id: 'chu-roi-nuoc', base: ['M=1W=3T=$:', '..........', '..........', '..........', '..........', '~~~~~~~~~g'], loose: 'G=6m', walls: 9, need: ['G=6'] },
  // fire you can fly over
  { id: 'lua-bay', base: ['M=1W=3F=5:', '.....f::::', '.....f::::', '.....f:::g', '.....f::::', 'G=6..f::::'], loose: 'F=9m', walls: 5, need: ['F=9'] },
  // the fish runs along its lane: make it the prize
  { id: 'ca-chay', base: ['M=1W=3S=^:', '..........', '..........', '..........', 'w.....s..w', '..........'], loose: 'S=6m', walls: 7, need: ['S=6'] },
  // a hot cat sits on the gate's place: break it
  { id: 'meo-co-cong', base: ['M=1W=3C=5:', 'C+GG=6....', '..........', '.......c..', '..........', '..........'], loose: 'C=!Sm', walls: 7, need: ['C=!'] },
  // the river turns into gates
  { id: 'nuoc-la-cong', base: ['M=1W=3N=4:', '.....~::::', '.....~::::', '.....~::::', '.....~::::', 'G=6..~::::'], loose: 'N=Gm', walls: 2, need: ['N=G'] },
  // the river turns into rocks, and rocks can be pushed
  { id: 'nuoc-la-da', base: ['M=1W=3R=2:', '.....~~:::', '.....~~:::', '.....~~::g', '.....~~:::', 'N=4..~~:::', 'G=6.......'], loose: 'N=Rm', walls: 6, need: ['N=R'] },
  // the gate is shut in: let it walk out
  { id: 'cong-chay', base: ['M=1W=3G=6:', '..........', '..........', '..........', '..........', '..........'], loose: 'G=^gm', walls: 10, need: ['G=^'] },
  // a ring of fire: fire can be a fish, and fish win
  { id: 'lua-la-ca', base: ['M=1W=3F=5:', 'S=6....fff', '.......f:f', '.......fff', '..........', '..........'], loose: 'F=Sm', walls: 7, need: ['F=S'] },
  // walls that do not stop
  { id: 'tuong-khong-chan', base: ['M=1W=3G=6:', '..........', '..........', '..........', '..........', '.........g'], loose: 'W-3m', walls: 12, need: ['W-3'] },
  // make the words fall, and the rule that walls you in falls into the water
  { id: 'chu-roi-pha', base: ['M=1G=6N=4:', '...ww.....', ':::w......', ':::w.wwwww', ':::w.w:g:w', '~~~~~~~~~~'], place: [[0, 1, 'W'], [1, 1, '='], [2, 1, '3']], loose: 'T=$m', walls: 4, need: ['T=$'] },
  // the gate breaks when you touch it
  { id: 'cong-yeu', base: ['M=1W=3G=!:', 'G=6.......', '..........', '..........', '........g.', '..........'], loose: 'G=#m', walls: 9, need: ['G=#'] },
  // every word runs
  { id: 'chu-chay', base: ['M=1W=3T=^:', '..........', '..........', '..........', '..........', '.........g'], loose: 'G=6m', walls: 9, need: ['G=6'] },
  // a rock that does not sink
  { id: 'da-ben', base: ['M=1R=2N=4:', '..........', '..........', '~~~~~~~~~~', '~~~~~~~~~~', '~~~~~~~~~~', '~~~~~~~~~~', '~~~~~~~~~~', '::::::g:::', 'G=6::::W=3'], loose: 'R=#rm', walls: 4, need: ['R=#'] },
// one LÀ for two rules: they have to cross
  { id: 'chung-chu', base: ['M=1W=3N=4:', '......~:::', '......~:::', '......~:g:', '......~:::', '......~:::'], loose: 'G6N9=m', walls: 4, need: ['N=9', 'G=6'] },
  // a river and a wall of fire, one rule for both
  { id: 'va-song-lua', base: ['M=1W=3N=4:', 'F=5.~..f::', '....~..f::', '....~..f:g', '....~..f::', 'G=6.~..f::'], loose: 'N&F=9m', walls: 3, need: ['N=9', 'F=9'] },
  // hot cats turn into water, and water can be filled
  { id: 'meo-la-nuoc', base: ['M=1W=3C=5:', '..........', '..........', 'wwwwww.www', '......cc:g', 'G=6wwwwwww'], loose: 'C=NSHm', walls: 4, need: ['C=N'] },
  // the cat in the box walks with you, step for step
  { id: 'meo-di', base: ['M=1W=3G=6:', '.....wwwww', '.....wc:ww', '.....ww:ww', '.....w::ww', '.....wgwww'], loose: 'C=1m', walls: 5, need: ['C=1'] },
  // a hot cat at the mouth of the lane: lead it away
  { id: 'keo-meo', base: ['M=1W=3C=5:', '..........', '..........', '......wwww', '.....c:::g', 'G=6...wwww'], loose: 'C=<m', walls: 5, need: ['C=<'] },
  // the words fall, and a river runs to the floor
  { id: 'chu-roi-hai', base: ['M=1W=3T=$:', '......~:::', '......~:::', '......~::g', '......~:::', '......~:::', 'N=4...~:::'], loose: 'N9G6==m', walls: 5, need: ['N=9', 'G=6'] },
  // the mouse floats, the gate does not
  { id: 'khong-bay', base: ['M=1M=9W=3:', '..........', '..........', '........g.', '..........', '.......G=6'], loose: 'M-9m', walls: 8, need: ['M-9'] },
  // water that does not drown
  { id: 'khong-chim', base: ['M=1W=3N=4::', '....~~~~:::', '....~~~~:::', '....~~~~:g:', '....~~~~:::', 'G=6.~~~~:::'], loose: 'N-4m', walls: 4, need: ['N-4'] },
// the mouse falls, and a hot cat sits on the floor
  { id: 'roi-meo-doi', base: ['M=1M=$C=5:', '..........', '..........', '..........', '..........', 'W=3...c.g.'], loose: 'C=*m', walls: 7, need: ['C=*'] },
  // the fish can be keys
  { id: 'ca-la-chia', base: ['M=1W=3D=8:', 'K=7&2.d:::', '......d:::', '......d::g', '......d:::', 'G=6...d:::'], loose: 'S=Kssm', walls: 4, need: ['S=K'] },
  // the gate is hot: it need not be
  { id: 'cong-khong-nong', base: ['M=1W=3G=5:', 'G=6.......', '..........', '..........', '........g.', '..........'], loose: 'G-5m', walls: 9, need: ['G-5'] },
  // the words fall: drop two of them into the river
  { id: 'chu-roi-lap', base: ['M=1W=3T=$:', '....~~....', '....~~....', '....~~....', '....~~....', '....~~...g', 'N=4wwwwwww'], loose: 'G=6SHm', walls: 6, need: ['G=6'] },
  // a hot cat walks its beat
  { id: 'meo-tuan', base: ['M=1W=3C=^:', 'C=5.......', '..........', 'wwwwww.www', '.....c...g', 'wwwwwwwwww'], loose: 'G=6m', walls: 5, need: ['G=6'] },
// the river can be clouds, and clouds are nothing
  { id: 'nuoc-la-may', base: ['M=1W=3N=4:', '.....~::::', '.....~::::', '.....~:::g', '.....~::::', 'G=6..~::::'], loose: 'N=Om', walls: 5, need: ['N=O'] },
  // walls of straw
  { id: 'rom-khong-chan', base: ['M=1H=3G=6:', '..........', '..........', '.......hhh', '.......hgh', '.......hhh'], loose: 'H-3m', walls: 8, wallCh: 'h', need: ['H-3'] },
  // the fish by the gate can walk too
  { id: 'ca-di', base: ['M=1W=3G=6:', '.....wwwww', '.....ws:ww', '.....ww:ww', '.....w::ww', '.....wgwww'], loose: 'S=1m', walls: 5, need: ['S=1'] },
// the words trade places instead of being pushed
  { id: 'chu-doi', base: ['M=1W=3G=6:', '..........', '..........', '..........', '..........', '.........g'], loose: 'T=*SHm', walls: 9, need: ['T=*'] },
  // a stone that trades places: walk through the rocks
  { id: 'da-doi', base: ['M=1W=3R=3:', '......r:::', '......r:::', '......r::g', '......r:::', 'G=6...r:::'], loose: 'R=*m', walls: 5, need: ['R=*'] },
];
for (const s of S) {
  s.need = s.need || [];
  if (!s.noGuard) {
    const b = s.base.map(r => [...r]), isNoun = ch => /[MCWNFSGHJKDROT]/.test(ch), free = (x, y) => b[y] && b[y][x] === '.';
    const wc = s.wallCh || 'w';
    for (let y = 0; y < b.length; y++) for (let x = 0; x < b[y].length; x++) {
      const ch = s.base[y][x];
      if (isNoun(ch) && free(x, y + 1)) b[y + 1][x] = wc;
      if (ch === '6' && free(x, y - 1)) b[y - 1][x] = wc;
      if (/[1-9<^!$*#]/.test(ch) && (s.loose || '').includes('&') && free(x + 1, y)) b[y][x + 1] = wc;
    }
    s.base = b.map(r => r.join(''));
  }
  const w = s.base[0].length; s.base.forEach((r, i) => { if (r.length !== w) throw new Error(s.id + ' row ' + i + ' is ' + r.length + ' not ' + w); });
  s.maxWalls = s.maxWalls ?? 14;
}
module.exports = S;
