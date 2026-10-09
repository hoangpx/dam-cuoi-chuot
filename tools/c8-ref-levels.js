/* Chương VIII: the levels of the REFERENCE game, rebuilt from the owner's screenshots and notes (CLAUDE.md, tools/c8-*.js) in the order he showed them (owner, 2026-10-09: "dựng lại các màn y hệt cái game kia cho m xem").
   Exports [{ name, en, map, plan? }]: plan (tools/c8-plan.js) = the owner's solution (or my reading of it) as steps, used to check the level in the real engine. Levels with no plan are not checked.
   Not rebuilt (no layout kept): Hollowed Pillars, Barren Crossroads (only part seen), Overpass (not understood). node tools/c8-ref-levels.js [--write] [index…] checks and writes js/ch8/levels.js. */
class Grid {
  constructor(W, H) { this.W = W; this.H = H; this.g = Array.from({ length: H }, () => new Array(W).fill(' ')); }
  set(x, y, ch) { if (x >= 0 && x < this.W && y >= 0 && y < this.H) this.g[y][x] = ch; return this; }
  rect(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, ch); return this; }
  box() { this.rect(0, 0, this.W - 1, 0, '#').rect(0, this.H - 1, this.W - 1, this.H - 1, '#').rect(0, 0, 0, this.H - 1, '#').rect(this.W - 1, 0, this.W - 1, this.H - 1, '#'); return this; }
  map() { return this.g.map(r => r.join('')); }
}
const lit = rows => rows.map(r => r.replace(/w/g, 'v'));
const L = [];

// 1. Crumbly Overhang: the mouse starts under the plateau (bottom right) and must reach the plateau's left tip; two clods rows and ten flames hang in the corner on the left.
{ const g = new Grid(16, 13).box(), o = (x, y) => [x + 1, y + 1];   // picture coordinates (x, y) -> map
  const S = (x, y, ch) => g.set(...o(x, y), ch), R = (x0, y0, x1, y1, ch) => g.rect(x0 + 1, y0 + 1, x1 + 1, y1 + 1, ch);
  R(0, 10, 13, 10, '#'); R(0, 5, 0, 10, '#'); R(4, 2, 8, 6, '#'); R(9, 3, 9, 6, '#'); R(10, 4, 13, 6, '#'); R(10, 0, 13, 0, '#'); R(11, 1, 13, 1, '#');
  R(0, 3, 2, 4, 'd'); R(1, 5, 2, 9, 'a'); S(6, 9, 'P'); S(4, 1, 'G');
  L.push({ name: 'Mái Đá Vụn', en: 'Crumbly Overhang', map: g.map(), plan: [{ swipe: [[1, 4], [2, 4], [3, 4]] }, { swipe: [[2, 6], [3, 6], [3, 7], [3, 8], [3, 9], [2, 9]] }] }); }

// 2. Totems: three towers on a rock staircase; the left tower first (3 flames, then 3 of its 4 clods).
L.push({ name: 'Ba Cột Tháp', en: 'Totems', map: [
  '####################', '#          d       #', '#       d  d       #', '#    d  d  o    G  #', '#    d  b  o   #####', '#    a  b  o   #####', '#    a  b  d  ######',
  '#    a  d  d  ######', '#    d  d  #########', '#    d  ############', '#P   ###############', '####################' ],
  plan: [{ swipe: [[5, 5], [5, 6], [5, 7]] }, { swipe: [[5, 6], [5, 7], [5, 8]] }] });

// 3. Elevator: a 1-wide shaft (spirals, a peg, clods on top) and a 1-high tunnel plugged by clods; the mouse must stand in the shaft while it gathers.
L.push({ name: 'Thang Máy', en: 'Elevator', map: [
  '################', '#    #d#########', '#    #o#########', '#    #d#########', '#     b##      #', '#  P  b##   G  #', '######b##  #####', '######b##  #####', '######b## ######', '######bdd ######', '################' ],
  plan: [{ swipe: [[6, 4], [6, 5], [6, 6]] }, { at: [6, 5] }, { swipe: [[6, 7], [6, 8], [6, 9]] }, { swipe: [[6, 9], [7, 9], [8, 9]] }] });

// 4. Terrace: a rock mass with a pocket (the exit) on its left, two slabs of clods over flames on its right.
L.push({ name: 'Thềm Đá', en: 'Terrace', map: [
  '#################', '##             ##', '##             ##', '## #####       ##', '## #####       ##', '## #####ddd    ##', '#G #####ddd    ##', '########aaa    ##', '########aaa    ##',
  '########dddd   ##', '########dddd   ##', '#       aaaa   ##', '#    P  aaaa   ##', '#################' ],
  plan: [{ swipe: [[9, 10], [10, 10], [10, 9], [11, 9]] }, { swipe: [[9, 12], [10, 12], [10, 11], [11, 11]] }] });   // found by tools/c8-ref-auto.js (the order matters: the clods of the upper slab first)

// 5. Frigid Well: the well and a duct under a ledge filled with ice (the freezing rule is not modelled).
L.push({ name: 'Giếng Giá', en: 'Frigid Well', map: [
  '#####################', '##  #################', '##  #        ########', '##  #        ########', '##  #     SSS########', '##  #  i  ###########', '##  # iai ###########', '##  # iai    ########',
  '##  G bbb    ########', '########i##       ###', '########ii#  d    ###', '########iiiiii      #', '##########iiii  P   #', '#####################' ] });

// 6. Frozen Hut
L.push({ name: 'Nhà Băng', en: 'Frozen Hut', map: lit([
  '###################', '#     #########ww###', '#     #########ww###', '#     #########ww###', '#             #ww###', '#       dd    #ww###', '#       oo    #ww###', '#      #iod   #ww###', '##G    #iid   #ww###',
  '###    #dd#   #ww###', '####   #di#    ww###', '#####  diid P  ww###', '###################' ]),
  plan: [[[8, 11], [9, 11], [9, 10]], [[10, 11], [9, 11], [8, 11], [8, 10]], [[9, 8], [10, 8], [10, 7]], [[9, 11], [8, 11], [8, 10]]].map(c => ({ swipe: c })) });

// 7. Broken Ladder
L.push({ name: 'Thang Gãy', en: 'Broken Ladder', map: lit([
  '###################', '##                #', '##                #', '##  #             #', '##  #             #', '##ww              #', '##ww   idi        #', '##ww   iii        #', '##wwG  idi        #',
  '###### iii        #', '###### idi        #', '###### iii      # #', '###### idi  P   # #', '###################' ]),
  plan: [[[7, 12], [7, 11], [8, 11], [9, 11], [9, 10], [9, 9]], [[9, 12], [9, 11], [9, 10], [8, 10], [7, 10], [7, 9]], [[8, 12], [8, 11], [8, 10]]].map(c => ({ swipe: c })) });

// 8. Narrow Gate: a 1-high corridor with one ice plugging it under a 2-wide shaft (left column: ice, clod, 2 spirals, 2 ice; right column: 3 flames, 3 clods, a spiral). Only the corridor and the shaft are kept (owner, 2026-10-09: nothing unrelated to the mouse and the chest)
L.push({ name: 'Cổng Hẹp', en: 'Narrow Gate', map: [
  '#################', '#######  ########', '####### b########', '#######id########', '#######id########', '#######bd########', '#######ba########', '#######da########', '#### G iaP    ###', '#################' ],
  plan: [{ at: [8, 8] }, { swipe: [[8, 8], [8, 7], [8, 6]] }, { at: [8, 8] }, { swipe: [[7, 7], [8, 7], [8, 6]] }, { at: [8, 8] }, { swipe: [[7, 7], [7, 6], [8, 6]] }, { at: [8, 8] }, { swipe: [[7, 8], [7, 7], [7, 6]] }] });   // found by tools/c8-joint.js: the mouse stands in the shaft the whole time

// 9. Dim Tunnel: a low tunnel with a row ice, 3 flames, ice, 3 flames, ice; the two end ices under the 1-high ceiling must melt, the middle one sits under a dome.
L.push({ name: 'Hầm Tối', en: 'Dim Tunnel', map: [
  '###################', '######   ##########', '#####     #########', '#G iaaaiaaai P   ##', '###################' ],
  plan: [{ swipe: [[8, 3], [9, 3], [10, 3]] }, { swipe: [[6, 3], [5, 3], [4, 3]] }] });

// 10. Abandoned Basin (first visit): the mouse starts under the right mass and must reach the top of the left cliff; 12 flames under a row of 4 ice.
{ const g = new Grid(17, 10).box();
  g.rect(1, 6, 1, 8, '#');                                   // the cliff (3 high) at the left, its top is the exit
  g.rect(9, 4, 15, 6, '#');                                  // the mass (3 high, hanging) at the right, a tunnel under it
  g.rect(3, 6, 6, 8, 'a'); g.rect(3, 5, 6, 5, 'i');          // 12 flames and the ice over them
  g.set(1, 5, 'G'); g.set(15, 8, 'P');
  L.push({ name: 'Lòng Chảo Hoang', en: 'Abandoned Basin', map: g.map(), plan: [3, 4, 5, 6].map(x => ({ swipe: [[x, 8], [x, 7], [x, 6]] })) }); }

// 11. Freezing Tip: a brick mass on the left with a corridor on its top (flame + hanging ice, flames, an ice plug, the exit); on its right a column of water/ice and two columns of flames.
{ const g = new Grid(16, 10).box();                           // f1 = y8 ... f6 = y3
  g.rect(1, 1, 14, 2, '#');                                  // ceiling
  g.rect(1, 3, 7, 3, '#'); g.set(5, 3, 'i');                  // ceiling over the corridor, with the notch holding a hanging ice
  g.rect(1, 5, 7, 8, '#');                                   // the mass, top at f4
  g.set(1, 4, 'G'); g.set(2, 4, 'i'); g.set(3, 4, 'a'); g.set(4, 4, 'a'); g.set(5, 4, 'a');   // the exit box, the plug, three flames
  g.set(8, 8, 'v'); g.set(8, 7, 'i'); g.set(8, 6, 'v'); g.set(8, 5, 'i'); g.set(8, 4, 'i');   // col A: water, ice, water, ice, ice
  g.rect(9, 4, 10, 8, 'a'); g.set(14, 8, 'P');
  L.push({ name: 'Mũi Băng Giá', en: 'Freezing Tip', map: g.map(), plan: [
    { swipe: [[10, 6], [10, 5], [10, 4], [9, 4]] }, { swipe: [[10, 8], [10, 7], [9, 7]] }, { swipe: [[8, 6], [8, 7], [8, 8]] },
    { at: [4, 4] }, { swipe: [[5, 4], [4, 4], [3, 4]] }] }); }

// 12. Overflowing Sewer: a 1-high corridor, a T-shaped cave over three flames, a water shaft and tunnel under it; leave through the left end.
{ const g = new Grid(15, 9).box();
  g.rect(1, 1, 13, 7, '#');                                  // all earth, then carve
  g.rect(1, 3, 13, 3, ' ');                                  // the corridor
  g.rect(4, 2, 6, 2, ' '); g.set(5, 1, ' ');                 // the cave and its chimney
  g.rect(5, 4, 5, 7, 'v'); g.rect(6, 7, 12, 7, 'v');         // the shaft (4) and the tunnel
  g.set(1, 3, 'G'); g.set(2, 3, 'i'); g.set(3, 3, 'i'); g.set(4, 3, 'a'); g.set(5, 3, 'a'); g.set(6, 3, 'a'); g.set(7, 3, 'i'); g.set(13, 3, 'P');
  g.set(4, 2, 'i'); g.set(5, 2, 'a'); g.set(6, 2, 'i'); g.set(5, 1, 'i');
  L.push({ name: 'Cống Tràn', en: 'Overflowing Sewer', map: g.map(), plan: [
    { swipe: [[5, 7], [6, 7], [7, 7]] }, { swipe: [[4, 3], [5, 3], [6, 3]] }, { swipe: [[2, 3], [3, 3], [4, 3], [5, 3], [6, 3]] }] }); }

// 13. Iceberg (the owner's own solution, 4 swipes)
L.push({ name: 'Tảng Băng', en: 'Iceberg', map: [
  '##################', '#                #', '#                #', '#     v###iaaa   #', '#     v###ibaa   #', '#     v###iaaa   #', '#     v###ibaa   #', '#G SSSvv#viaaa P #', '##################' ],
  plan: [{ swipe: [[13, 3], [12, 3], [11, 3]] }, { swipe: [[13, 7], [12, 7], [11, 7]] }, { swipe: [[12, 5], [12, 6], [11, 6]] }, { swipe: [[10, 6], [10, 7], [9, 7]] }] });

// 14. Abandoned Basin (second visit): the mouse starts on the left ledge and must reach the top of the right mass; the pile is back.
{ const g = new Grid(17, 10).box();
  g.rect(1, 6, 1, 8, '#'); g.rect(9, 4, 15, 6, '#'); g.rect(3, 6, 6, 8, 'a'); g.rect(3, 5, 6, 5, 'i');
  g.set(1, 5, 'P'); g.set(12, 3, 'G');
  L.push({ name: 'Lòng Chảo Hoang II', en: 'Abandoned Basin II', map: g.map(), plan: [{ swipe: [[5, 8], [6, 8], [6, 7]] }, { swipe: [[3, 7], [3, 6], [4, 6]] }] }); }

// 15. Rocky Shoreline: rocks are pushed one at a time; a single rock and a column of 4 against a cliff (4 high).
{ const g = new Grid(16, 12).box();
  g.rect(3, 7, 14, 10, '#');                                 // the plateau (2 above the low ground)
  g.rect(1, 9, 2, 10, '#');                                  // the low ground
  g.rect(11, 3, 14, 10, '#');                                // the cliff (4 above the plateau)
  g.set(5, 6, 'r'); g.rect(10, 3, 10, 6, 'r');
  g.set(1, 8, 'P'); g.set(12, 2, 'G');
  L.push({ name: 'Bãi Đá Ven Biển', en: 'Rocky Shoreline', map: g.map(), plan: [
    { until: [[9, 6, 'r']] }, { swipe: [[9, 6], [10, 6], [10, 5]] }] }); }

// 16. Eroded Cliffside: dashed spirals (soft) hold rocks; a stack of 2, a single rock on a step, a column of 4 against a 6-high cliff.
{ const g = new Grid(14, 15).box();
  g.rect(1, 13, 12, 13, '#');                                // the low ground (standing row 12)
  g.rect(5, 11, 12, 12, '#');                                // the step (2 high)
  g.rect(8, 7, 12, 12, '#');                                 // the cliff (6 above the low ground... top at f6)
  g.set(2, 12, 'o'); g.set(3, 12, 'r'); g.set(3, 11, 'r'); g.set(4, 12, 'o'); g.set(4, 11, 'o');
  g.set(5, 10, 'r'); g.rect(7, 7, 7, 10, 'r');
  g.set(1, 12, 'P'); g.set(9, 6, 'G');
  L.push({ name: 'Vách Đá Mòn', en: 'Eroded Cliffside', map: g.map(), plan: [{ until: [[2, 12, 'r'], [3, 11, 'r']] }, { until: [[4, 11, 'r']] }, { until: [[6, 10, 'r']] }, { swipe: [[6, 10], [7, 10], [7, 9]] }] }); }

// 17. Rubble: a 2x4 block of 8 rocks fills the hall; at the far end a single rock rests on a 1-wide water shaft (the way out is down).
{ const g = new Grid(15, 11).box();
  g.rect(1, 5, 13, 9, '#'); g.rect(1, 1, 13, 4, ' ');          // hall 4 high
  g.rect(4, 1, 5, 4, 'r');                                   // the block
  g.rect(13, 1, 13, 8, '#'); g.rect(12, 5, 12, 8, 'v'); g.set(12, 4, 'r'); g.set(12, 8, 'G');   // the shaft with the rock on its surface
  g.set(1, 4, 'P');
  L.push({ name: 'Đống Đổ Nát', en: 'Rubble', map: g.map(), plan: [
    { swipe: [[4, 1], [4, 2], [4, 3]] }, { until: [[6, 4, 'r'], [5, 2, 'r']] }, { swipe: [[5, 4], [5, 3], [5, 2]] }, { until: [[10, 4, 'r'], [11, 4, 'r'], [12, 4, 'r']] }, { swipe: [[10, 4], [11, 4], [12, 4]] }] }); }

// 18. Stalagmite: a column of 3 rocks, a dashed spiral, a pit, a lone rock plugging a 1-high corridor, then a drop and the tunnel.
{ const g = new Grid(21, 13).box();
  g.rect(1, 2, 20, 12, '#');                                 // all earth, then carve
  g.rect(1, 3, 9, 8, ' ');                                   // the room (6 high) over ledge and floor
  g.rect(1, 8, 3, 8, '#');                                   // the ledge (standing row 7)
  g.rect(10, 4, 10, 8, ' '); g.set(10, 9, ' ');              // the pit column (ceiling lower) and its pit
  g.rect(11, 5, 11, 8, ' ');
  g.rect(12, 8, 13, 8, ' ');                                 // the corridor (1 high)
  g.rect(14, 8, 14, 10, ' '); g.rect(15, 10, 19, 10, ' ');   // the drop and the tunnel
  g.set(6, 8, 'o'); g.rect(7, 6, 7, 8, 'r'); g.set(12, 8, 'r');
  g.set(2, 7, 'P'); g.set(19, 10, 'G');
  L.push({ name: 'Măng Đá', en: 'Stalagmite', map: g.map(), plan: [{ until: [[6, 8, 'r'], [8, 8, 'r'], [7, 7, 'r']] }, { until: [[5, 8, 'r'], [7, 8, 'r'], [9, 8, 'r']] }, { until: [[10, 9, 'r']] }, { until: [[13, 8, 'r']] }, { until: [[11, 8, 'r'], [12, 8, 'r'], [13, 8, 'r']] }, { swipe: [[11, 8], [12, 8], [13, 8]] }] }); }

// 19. Fiery Pit: a 2x2 pit of flames topped by two rocks, a 1-deep pit, a rock in a 1-high corridor, a drop and a water shaft up.
{ const g = new Grid(21, 11).box();
  g.rect(1, 1, 19, 9, '#');
  g.rect(1, 3, 4, 6, ' ');                                   // the room over the ground
  g.rect(5, 3, 6, 8, ' ');                                   // the 2-deep, 2-wide pit and the space above it
  g.rect(7, 3, 8, 6, ' ');
  g.rect(9, 3, 9, 7, ' ');                                   // the small pit (1 deep)
  g.rect(10, 6, 11, 6, ' ');                                 // the corridor (1 high)
  g.rect(12, 6, 12, 8, ' '); g.rect(13, 7, 17, 8, ' ');       // the drop and the low passage
  g.rect(18, 1, 19, 8, 'v');                                  // the water shaft up
  g.rect(5, 4, 6, 8, 'a'); g.rect(5, 3, 6, 3, 'r'); g.set(10, 6, 'r');
  g.set(1, 6, 'P'); g.set(18, 1, 'G');
  L.push({ name: 'Hố Lửa', en: 'Fiery Pit', map: g.map(), plan: [{ swipe: [[5, 8], [6, 8], [6, 7], [5, 7], [5, 6]] }, { until: [[7, 5, 'r']] }, { until: [[6, 6, 'r']] }, { swipe: [[5, 8], [5, 7], [6, 7]] }, { until: [[9, 7, 'r']] }, { until: [[12, 8, 'r']] }] }); }

// the first three levels, from the owner's pictures of 2026-10-09 (maps in tools/c8-new2.js): Explorer's Trail, Collapsed Alley (the untitled one: gather the top 3 spirals of the left column, stand on its clods, then the top 3 of the middle column), Floating Earth (the lowest 3 of the 5 spirals)
{ const N = require('./c8-new2.js');
  L.unshift(
    { name: 'Đường Mòn Thám Hiểm', en: "Explorer's Trail", map: N.trail.map, plan: N.trail.plan },
    { name: 'Ngõ Sụp', en: 'Collapsed Alley', map: N.pillars.map, plan: [{ swipe: [[8, 5], [8, 6], [8, 7]] }, { at: [8, 5] }, { swipe: [[10, 4], [10, 5], [10, 6]] }] },
    { name: 'Đất Lơ Lửng', en: 'Floating Earth', map: N.floating.map, plan: N.floating.plan }); }
// no slab of earth over the top of a room (owner, 2026-10-09: "cũng đâu cần cái đất ở phía trên"): where the free space under a column's top earth is 3 or more cells tall, that top earth is cut away; a low corridor keeps its ceiling
function openSky(map) {
  const H = map.length, W = map[0].length, g = map.map(r => r.split(''));
  for (let x = 1; x < W - 1; x++) { let y = 1; while (y < H - 1 && g[y][x] === '#') y++; if (y === 1 || y >= H - 1) continue;
    let h = 0; for (let k = y; k < H - 1 && g[k][x] !== '#'; k++) h++;
    if (h >= 3) for (let k = 1; k < y; k++) g[k][x] = ' '; }
  return g.map(r => r.join(''));
}
if (!process.env.NOSKY) L.forEach(lv => { if (lv.plan) lv.map = openSky(lv.map); });
// earth that does nothing (owner, 2026-10-09: "rà soát lại hết": pieces that hang in the air and are not needed) is cut away: tools/c8-audit.js tries each hanging piece of earth and keeps the cut only if the plan still wins, no swipes still does not win and the model's depth is the same
if (!process.env.NOCARVE) { let cv = {}; try { cv = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'c8-carve.json'), 'utf8')); } catch (e) {}
  L.forEach(lv => { const cells = lv.plan && cv[lv.en]; if (!cells) return; const g = lv.map.map(r => r.split('')); for (const [x, y] of cells) if (!'PGS'.includes(g[y][x])) g[y][x] = ' '; lv.map = g.map(r => r.join('')); }); }
// every row as long as the longest (a short row of a hand-typed map would leave a gap)
L.forEach(lv => { const W = Math.max(...lv.map.map(r => r.length)); lv.map = lv.map.map(r => r.padEnd(W, '#')); });
// the mouse goes from LEFT to RIGHT in every level (owner, 2026-10-09: "cho chuột đi từ trái sang phải"): a level whose chest is left of its start is mirrored (map, plan, cuts); NOMIRROR=1 keeps the pictures' own sides
if (!process.env.NOMIRROR) L.forEach(lv => {
  const find = ch => { for (let y = 0; y < lv.map.length; y++) { const x = lv.map[y].indexOf(ch); if (x >= 0) return x; } return -1; };
  if (find('G') < find('P')) { const W = lv.map[0].length, mx = x => W - 1 - x; lv.map = lv.map.map(r => r.split('').reverse().join(''));
    if (lv.plan) lv.plan = lv.plan.map(st => st.swipe ? { swipe: st.swipe.map(([x, y]) => [mx(x), y]) } : st.at ? { at: [mx(st.at[0]), st.at[1]] } : st.until ? { until: st.until.map(([x, y, ch]) => [mx(x), y, ch]) } : st);
    lv.mirrored = true; } });
module.exports = L;
if (require.main === module) {
  const fs = require('fs'), path = require('path'), { runPlan } = require('./c8-plan.js');
  const only = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
  L.forEach((lv, i) => {
    if (only.length && !only.includes(i + 1)) return;
    const things = lv.map.join('').replace(/[^aibvcdor]/g, '').length;
    let res = '-'; if (lv.plan && !process.argv.includes('--nocheck')) { try { const r = runPlan(lv.map, lv.plan, { cap: +(process.env.CAP || 40000), depth: 60 }); res = r.won ? 'WIN' : 'fail at step ' + r.step + ' (' + r.why + ')'; if (!r.won && process.env.BOARD) console.log(r.board); } catch (e) { res = 'error ' + e.message; } }
    console.log(String(i + 1).padStart(2), lv.en.padEnd(20), lv.map[0].length + 'x' + lv.map.length, 'things', String(things).padStart(3), '| plan:', res);
  });
  if (process.argv.includes('--write')) {
    const src = L.map(lv => `  { name: ${JSON.stringify(lv.name)}, en: ${JSON.stringify(lv.en)}, map: [\n${lv.map.map(r => '    ' + JSON.stringify(r).replace(/"/g, "'")).join(',\n')} ] }`).join(',\n');
    const file = path.join(__dirname, '..', 'js/ch8/levels.js'), head = fs.readFileSync(file, 'utf8').split('const C8_LEVELS')[0];
    fs.writeFileSync(file, head + 'const C8_LEVELS = [\n' + src + ',\n];\n'); console.log('wrote', L.length, 'levels');
  }
}
