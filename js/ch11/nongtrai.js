/* Chương XI · Ruộng Chuột 田 (DEMO, owner asked for a farm like Stardew Valley, to look at the art first).
   A little farm seen from above-and-aside: a house (the door is the bed), a shipping box, a seed stall, a pond and a field.
   Hoe the earth, plant, water, sleep (crops grow one stage for each night they were watered), harvest, drop the crops in the
   box. The money is its own purse (SAVE11.money, starts at 0, apart from chương IV's) and the folk are chương IV's residents (c4People): the seed
   seller and three villagers who stroll along the lane carry their names. Controls on both: tap a tile = walk beside it and use the
   selected slot on it; WASD / arrows walk, Space / Enter / E uses the slot on the tile in front, 1-5 pick a slot (or tap the
   slots). Saves: SAVE11 in localStorage 'dcc.c11'. */
let C11_W = 20, C11_H = 15;
const C11_CROPS = {
  ca: { name: 'Cà tím', days: 3, seed: 4, sell: 14, col: '#6a3a7a' },
  bi: { name: 'Bí', days: 4, seed: 9, sell: 36, col: '#d97b2a' },
  ngo: { name: 'Ngô', days: 3, seed: 6, sell: 22, col: '#e0a820' },
  lua: { name: 'Lúa', days: 6, seed: 5, sell: 26, col: '#e0b030' },
  muong: { name: 'Rau muống', days: 3, seed: 3, sell: 11, col: '#4f9a4a' },
  cai: { name: 'Cải xanh', days: 3, seed: 4, sell: 15, col: '#5fae4a' },
  khoai: { name: 'Khoai lang', days: 5, seed: 6, sell: 27, col: '#9a4a8a' },
  dau: { name: 'Đậu đũa', days: 4, seed: 24, sell: 36, col: '#6aa84a', dan: true },
  muop: { name: 'Mướp', days: 5, seed: 30, sell: 48, col: '#c8b83a', dan: true },
  ot: { name: 'Ớt', days: 4, seed: 7, sell: 28, col: '#d83a2a' },
};
/* climbers (dan: true) are not hoed: build a trellis (giàn, C11_DAN_WOOD logs) on a cut patch of the field and sow ONE seed at its foot; one seed, one
   trellis, so their seed is dear (bought one at a time) but the plant bears again and again (after a harvest it goes back to its flowering stage) */
const C11_DAN_WOOD = 5;
const C11_CSCALE = { dau: .72, muop: .72 };                        // climbers and their trellis are drawn a size smaller
const C11_CROP_NOTE = { ca: 'cà tím quả dài bóng', bi: 'bí đỏ to tròn', ngo: 'bắp ngô vàng', lua: 'bông lúa chín vàng, cúi đầu', muong: 'rau muống xanh, hoa trắng', cai: 'cải bẹ xanh, cuống trắng', khoai: 'củ tím, dây lan trên đất', dau: 'đậu leo cọc, quả dài rủ', muop: 'mướp leo giàn, hoa vàng', ot: 'ớt chín đỏ' };
const C11_SLOTS = ['sickle', 'hoe', 'axe', 'can', 'dan'];                              // the tools; after them in the bar come the ten slots of the bag (C11.slot 5..14)
const C11_SW = .55, C11_WOOD = 8, C11_HAY = 3;                                   // a swing lasts .45 s; a log sells for 8 đồng
const C11_DAY0 = 6 * 60, C11_DAY1 = 26 * 60, C11_MPS = 3.2;          // 6:00 until 2:00 the next morning (as in Stardew Valley: nobody sends you to bed; at 2:00 you drop where you stand)
/* energy, after Stardew Valley: every swing costs some; at 0 the mouse is exhausted (walks slowly); at -15 it faints in the field
   (loses a tenth of the purse, wakes at half energy). Sleeping at the bed restores all, sleeping past 22:00 only three quarters;
   eating a crop restores some at once. */
const c11Sfx = { tap() {}, pluck() {}, plop() {}, thump() {} };   // chương IX makes no sound at all (owner 2026-10-27: "bỏ tiếng trong game này")
const C11_WALK = 1, C11_EN = 100, C11_FAINT = -15, C11_COST = { sickle: .5, hoe: 1.5, axe: 2, can: 1, seed: .5, dan: 1.5 }, C11_FOOD = { ca: 12, bi: 20, ngo: 16, lua: 14, muong: 8, cai: 8, khoai: 18, dau: 10, muop: 12, ot: 3, nam: 10, rau: 6, qua: 12 };
const C11_FORAGE = { nam: { name: 'Nấm', sell: 18, col: '#b0523a' }, rau: { name: 'Rau dại', sell: 9, col: '#4f8a3e' }, qua: { name: 'Quả rừng', sell: 14, col: '#c8402f' } };
const c11Info = k => k === 'go' ? { name: 'gỗ', col: '#8a5a38' } : k === 'co' ? { name: 'cỏ', col: '#4f8a3e' } : C11_CROPS[k] || C11_FORAGE[k] || (C11_ITEMS[k] ? { name: C11_ITEMS[k].name.toLowerCase(), col: '#a3332a' } : { name: k, col: INK });
const C11_NEW = () => ({ v: 1, money: 0, day: 1, mins: C11_DAY0, stamina: 100, hp: 100, water: 6, tiles: {}, seeds: { ca: 6, bi: 3, ngo: 0, lua: 4, muong: 4, cai: 0, khoai: 0, dau: 0, muop: 0, ot: 0 }, sel: 'ca', inv: { ca: 0, bi: 0, ngo: 0, lua: 0, muong: 0, cai: 0, khoai: 0, dau: 0, muop: 0, ot: 0, go: 0, co: 0, nam: 0, rau: 0, qua: 0 }, cut: {}, gone: {}, hits: {}, drops: [], clear: {} });
/* slots: arrays of { id, n } or null; stacks of up to C11_STACK */
function c11Put(box, id, n) {
  for (const sl of box) if (sl && sl.id === id && sl.n < C11_STACK) { const k = Math.min(n, C11_STACK - sl.n); sl.n += k; n -= k; if (!n) return 0; }
  for (let i = 0; i < box.length && n; i++) if (!box[i]) { const k = Math.min(n, C11_STACK); box[i] = { id, n: k }; n -= k; }
  return n;
}
let SAVE11 = C11_NEW();
try { if (!localStorage.getItem('dcc.c11')) { const o = JSON.parse(localStorage.getItem('dcc.c9') || 'null'); if (o && o.v === 1 && o.tiles) localStorage.setItem('dcc.c11', JSON.stringify(o)); } } catch (e) {}   // before the rename this chapter saved under dcc.c9 (now Ghép Tranh's)
try { const s = JSON.parse(localStorage.getItem('dcc.c11') || 'null'); if (s && s.v === 1) SAVE11 = Object.assign(SAVE11, s); } catch (e) {}
if (typeof SAVE11.money !== 'number' || !(SAVE11.money >= 0)) SAVE11.money = 0;
SAVE11.drops = SAVE11.drops || []; SAVE11.clear = SAVE11.clear || {}; SAVE11.inv.co = SAVE11.inv.co || 0; SAVE11.cut = SAVE11.cut || {}; SAVE11.gone = SAVE11.gone || {}; SAVE11.hits = SAVE11.hits || {}; SAVE11.inv.go = SAVE11.inv.go || 0; for (const k of ['nam', 'rau', 'qua', ...Object.keys(C11_CROPS)]) SAVE11.inv[k] = SAVE11.inv[k] || 0; for (const k of Object.keys(C11_CROPS)) SAVE11.seeds[k] = SAVE11.seeds[k] ?? C11_NEW().seeds[k]; if (!C11_CROPS[SAVE11.sel]) SAVE11.sel = 'ca';
if (!SAVE11.bag) {                                                   // a bag of 10 slots and a chest of 30 (owner); the old counts move into them
  SAVE11.bag = Array(C11_BAG).fill(null); SAVE11.chest = Array(C11_CHEST).fill(null);
  const put = (id, n) => { if (!n || !C11_ITEMS[id]) return; for (const box of [SAVE11.bag, SAVE11.chest]) { n = c11Put(box, id, n); if (!n) return; } };
  put('h_ca', 6); put('h_lua', 4); put('h_muong', 4);
  if (SAVE11.v && SAVE11.inv) { for (const [k, n] of Object.entries(SAVE11.inv)) put(k, n); for (const [k, n] of Object.entries(SAVE11.seeds || {})) put('h_' + k, n); }
}
SAVE11.chest = SAVE11.chest || Array(C11_CHEST).fill(null);
const persist11 = () => { if (typeof C11 !== 'undefined' && C11.demo) return; if (typeof C11O !== 'undefined' && C11O.visit) return;   // nothing is saved on a friend's farm (online.js)
  try { localStorage.setItem('dcc.c11', JSON.stringify(SAVE11)); } catch (e) {} };

const C11_FARM = (() => {
  const m = Array.from({ length: C11_H }, () => Array(C11_W).fill('g'));
  for (let x = 0; x < C11_W; x++) m[0][x] = m[C11_H - 1][x] = 't';
  for (let y = 0; y < C11_H; y++) m[y][0] = m[y][C11_W - 1] = 't';
  for (let y = 1; y <= 4; y++) for (let x = 2; x <= 6; x++) m[y][x] = 'h';
  m[4][4] = 'D'; m[4][8] = 'B';
  m[4][10] = 'C';                                                       // the chest (rương) by the house
  for (let x = 1; x <= 7; x++) m[6][x] = 'p';                        // a lane that winds: y 6, then 7, then 6 again
  for (let x = 7; x <= 12; x++) m[7][x] = 'p';
  for (let x = 12; x <= 18; x++) m[6][x] = 'p';
  m[5][4] = 'p'; m[5][8] = 'p';
  for (const [y, a, b] of [[8, 15, 17], [9, 14, 18], [10, 14, 18], [11, 15, 18], [12, 16, 17]]) for (let x = a; x <= b; x++) m[y][x] = 'w';
  for (const [x, y] of [[1, 3], [1, 8], [1, 11], [13, 8], [12, 13], [13, 11], [17, 3], [18, 2], [9, 2], [10, 3], [16, 6]]) if (m[y][x] === 'g') m[y][x] = 't';
  for (const [x, y] of [[2, 9], [1, 10], [15, 4], [16, 3]]) m[y][x] = 'H';
  m[7][2] = 'K';
  m[6][16] = 'p';
  m[6][19] = 'E'; m[14][15] = 'E';                                     // ways out: east to the hamlet, south into the bamboo wood
  return m;
})();
const C11_BLOCK = 'thDBCSNQUwHKTVJYZLIOnMAWFGRPy', C11_D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const c11Kind = (x, y) => (C11_MAP[y] && C11_MAP[y][x]) || 't';
const c11Field = (x, y) => { const kd = c11Kind(x, y); return (kd === 'f' || (kd === 'g' && C11_AR.id === 'ruong')) && !(typeof c11PenAt === 'function' && c11PenAt(x, y)); };   // at home every bit of grass can be made a field (owner)
const c11Blocked = (x, y) => C11_BLOCK.includes(c11Kind(x, y));
const c11Hash = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 1274126177) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };


/* ---------- the places (after Stardew Valley's several maps): the farm, the village market, the bamboo wood. Walking off an edge ('E'
   tiles) goes to the next one; each has its own map, lane, scenery, folk and things to do. ---------- */
const C11_MARKET = (() => {
  const m = Array.from({ length: 15 }, () => Array(20).fill('g'));
  for (let x = 0; x < 20; x++) m[0][x] = m[14][x] = 't';
  for (let y = 0; y < 15; y++) m[y][0] = m[y][19] = 't';
  m[6][0] = 'E';
  for (const x0 of [3, 9, 15]) for (let y = 2; y <= 4; y++) for (let x = x0; x <= x0 + 2; x++) m[y][x] = 'S';
  m[5][4] = 'Q'; m[5][10] = 'U'; m[5][16] = 'N';
  for (let x = 1; x <= 18; x++) m[6][x] = m[7][x] = 'p';
  for (const x0 of [2, 13]) for (let y = 9; y <= 12; y++) for (let x = x0; x <= x0 + 4; x++) m[y][x] = 'h';
  m[10][10] = 'K'; m[12][8] = 'H'; m[12][12] = 'H'; m[9][8] = 'H';
  for (const [x, y] of [[1, 3], [1, 9], [1, 12], [18, 3], [18, 9], [8, 11], [11, 9], [18, 12], [7, 3], [13, 2]]) if (m[y][x] === 'g') m[y][x] = 't';
  return m;
})();
const C11_FOREST = (() => {
  const W = 20, H = 15, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 || c11Hash(x, y, 300) < .6) ? 't' : 'g'));
  const carve = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const xx = x + dx, yy = y + dy; if (xx > 0 && xx < W - 1 && yy > 0 && yy < H - 1) m[yy][xx] = 'g'; } } };
  carve(10, 1, 10, 3); carve(10, 3, 12, 6); carve(12, 6, 9, 9); carve(9, 9, 10, 13);
  for (const [cx, cy, r] of [[5, 5, 2], [15, 9, 2], [5, 11, 2], [15, 12, 1]]) for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) <= r + .3 && x > 0 && x < W - 1 && y > 0 && y < H - 1) m[y][x] = 'g';
  carve(5, 5, 11, 5); carve(15, 9, 11, 8); carve(5, 11, 10, 11); carve(14, 12, 10, 12);
  m[0][10] = 'E';
  return m;
})();
const C11_AREAS = {
  ruong: { id: 'ruong', name: 'Nhà mình', map: C11_FARM, treeAt: {}, houses: [{ x: 4.5, y: 5 }], stalls: [], exits: { '19,6': ['lang', 1.7, 9.6, 'Xóm làng →'], '15,14': ['rung', 10.5, 1.7, 'Rừng trúc ↓'] }, pond: { x: 16.2, y: 10.2, rx: 1.2, ry: .85 },
    lane: [[[[-.5, 6], [1, 6], [4, 5.95], [6.4, 6.2], [7.6, 6.9], [9, 7.15], [11, 7.1], [12.2, 6.7], [13.4, 6.1], [15, 6.05], [17, 6.1], [19.5, 6]], .86], [[[4, 5.1], [4, 6]], .8], [[[8, 4.9], [8, 5.7], [8.4, 6.8]], .8]] },
  cho: { id: 'cho', name: 'Chợ làng Vũ Đại', map: C11_MARKET, treeAt: {}, houses: [{ x: 4.5, y: 13, h: 4, name: 'Lò rèn bác Năm Thọ' }, { x: 15.5, y: 13, h: 4, name: 'Nhà trọ đầu chợ' }],
    stalls: [{ x0: 3, by: 5, kind: 'Q' }, { x0: 9, by: 5, kind: 'U' }, { x0: 15, by: 5, kind: 'N' }], exits: { '0,6': ['lang', 28.3, 9.6, '← Xóm làng'] },
    lane: [[[[-.5, 6.6], [5, 6.5], [10, 6.8], [15, 6.5], [19.5, 6.6]], 1.9], [[[4.5, 5.2], [4.5, 6.5]], 1.2], [[[10.5, 5.2], [10.5, 6.5]], 1.2], [[[16.5, 5.2], [16.5, 6.5]], 1.2]] },
  rung: { id: 'rung', name: 'Rừng trúc', map: C11_FOREST, treeAt: {}, houses: [], stalls: [], exits: { '10,0': ['ruong', 15.5, 13.3, '↑ Về nhà'] },
    lane: [[[[10.5, -.5], [10.5, 3], [12.5, 6], [9.5, 9], [10.5, 13.5]], .7]] },
};
let C11_AR = C11_AREAS.ruong, C11_MAP = C11_FARM;

const C11 = { area: 'ruong', sellers: {}, menu: null, fade: null, ready: false, t: 0, px: 4.5, py: 6.5, face: 1, ph: 0, moving: false, fx0: 0, fy0: 1, keys: {}, go: null, pend: null, swing: 0, slot: 0, fx: [], say: null, sleep: null, v: null, hud: [], vill: [], seller: null, kbd: false, saveT: 0, msg: null, hl: null };
let C11ART = null;

/* ---------- art ---------- */
function c11Art() {
  if (C11ART) return C11ART;
  PL.nong = ['#a9d95e', [-1.2, 1.2]]; PL.nuoc = ['#8fb9b8', [-1, 1]]; PL.lua = ['#5fae45', [-1.4, 1.2]]; PL.bong = ['#d8cf6a', [-1, 1]];   // rice: tender seedling green, fresh green, flowering ears
  PL.leafhi = ['#79b85a', [-1.2, 1.2]]; PL.tealhi = ['#74b4a4', [-1.2, 1.2]]; PL.catim = ['#5e2f72', [1.4, -1]]; PL.grass2 = ['#8cc260', [-1, 1]];
  /* a pointed leaf: two curved edges meeting at the tip, the upper half printed lighter, an ink midrib and two veins */
  const leafP = (x, y, ang, len, wid, half = 0) => {
    const c = Math.cos(ang), s = Math.sin(ang), px = -s * wid, py = c * wid, tx = x + c * len, ty = y + s * len, p = new Path2D();
    p.moveTo(x, y);
    if (half >= 0) p.quadraticCurveTo(x + c * len * .42 + px, y + s * len * .42 + py, tx, ty); else p.lineTo(tx, ty);
    if (half <= 0) p.quadraticCurveTo(x + c * len * .42 - px, y + s * len * .42 - py, x, y); else p.lineTo(x, y);
    p.closePath(); return p;
  };
  const lf = (a, x, y, ang, len, wid, pl = 'green') => {
    const w = wid * .62, c = Math.cos(ang), sn = Math.sin(ang), up = Math.cos(ang) > 0 ? -1 : 1;
    a.fk(pl, leafP(x, y, ang, len, w), 1.1); a.fill(pl === 'teal' ? 'tealhi' : 'leafhi', leafP(x, y, ang, len, w * .92, up));
    a.key(lines([[x, y, x + c * len * .86, y + sn * len * .86]]), .75);
    for (const f of [.38, .62]) { const bx = x + c * len * f, by = y + sn * len * f; a.key(lines([[bx, by, bx + c * len * .12 - sn * w * .55, by + sn * len * .12 + c * w * .55]]), .5); }
  };
  const stem = (a, h) => { a.band('green', smooth([[0, 0], [1.5, -h * .5], [0, -h]], false), 4.2); a.band('leafhi', smooth([[1.2, -2], [2.4, -h * .5], [1.2, -h]], false), 1.2); a.key(lines([[-2.2, 0, -2, -h]]), .9); };
  /* Vietnamese crops: rice, water spinach, mustard greens, sweet potato, yard-long bean, sponge gourd, chilli (stages 1..3, 3 = ripe) */
  const arrow = (a, x, y, ang, len, pl = 'green') => { lf(a, x, y, ang, len, len * .5, pl); return; a.fk(pl, ell(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2, len / 2, len * .24, ang), 1.1); a.key(lines([[x, y, x + Math.cos(ang) * len * .92, y + Math.sin(ang) * len * .92]]), .8); };
  const heart = (a, x, y, r, pl = 'green') => { a.fill(pl === 'teal' ? 'tealhi' : 'leafhi', circ(x - r * .5, y - r * .3, r * .4)); a.fk(pl, circ(x - r * .5, y - r * .2, r * .62), 1); a.fk(pl, circ(x + r * .5, y - r * .2, r * .62), 1); a.fk(pl, c4Poly([[x - r * 1.05, y], [x + r * 1.05, y], [x, y + r * 1.15]]), 1); };
  const vn = (a, kind, st) => {
    if (kind === 'lua') {
      /* rice as it grows in a paddy: small hills (khóm) of many thin tillers, two rows, the back row a little higher and smaller;
         no ink around the blades, only thin plate strokes, so the patch reads as fine grass, not as big leaves */
      const hills = [[-16, -9, .8], [0, -10, .82], [16, -9, .8], [-8, 0, 1], [8, 0, 1]];
      if (st === 0) { a.fill('nuoc', ell(0, -4, 23, 8)); a.fill('white', ell(-9, -7, 6, 1)); a.fill('white', ell(10, -2, 4, .8)); }
      hills.forEach(([cx, cy, sc], hi) => {
        const n = [6, 9, 11, 11][st], h = [11, 24, 34, 30][st] * sc, spread = [8, 14, 16, 20][st] * sc;
        const cols = st === 0 ? ['nong', 'leafhi'] : st === 3 ? ['bong', 'straw', 'bong', 'leafhi'] : ['lua', 'green', 'leafhi', 'lua'];
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1) - .5, x = cx + t * 3, lean = t * spread + Math.sin(i * 2.3 + hi) * 1.5, hh = h * (.78 + .3 * Math.abs(Math.sin(i * 1.7 + hi)));
          a.band(cols[(i + hi) % cols.length], smooth([[x, cy], [x + lean * .3, cy - hh * .62], [x + lean, cy - hh]], false), st === 0 ? 1.3 : 1.5);
        }
        if (st === 2) for (const d of [-1, 1]) {                          // slim pale ears standing up, a few white flowers
          const x = cx + d * 2, top = cy - h * 1.12;
          a.band('lua', lines([[x, cy - h * .5, x + d, top + 6]]), 1.1); a.fill('bong', ell(x + d, top + 1, 1.6, 6, d * .1));
          a.fill('white', circ(x + d * 2.4, top - 1, .9)); a.fill('white', circ(x - d * .6, top + 4, .8));
        }
        if (st === 3) for (const d of [-1, 1, -1]) {                      // heavy ears bowing over, tiny golden grains
          const x = cx + d * 1.5, top = cy - h * 1.06, ex = x + d * 9, ey = cy - h * .62;
          a.band('straw', smooth([[x, cy - h * .45], [x + d * 2, top], [ex, ey]], false), 1);
          for (let g = 0; g < 7; g++) { const u = .35 + g * .1, px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * (x + d * 2) + u * u * ex, gy = (1 - u) * (1 - u) * (cy - h * .45) + 2 * (1 - u) * u * top + u * u * ey; a.fill(g % 2 ? 'yellow' : 'paper', ell(px + (g % 2 ? 1.4 : -1.4), gy + 1, 1.2, 2.3, d * .6)); }
        }
      });
    } else if (kind === 'muong') {
      const n = [0, 2, 4, 6][st];
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 8, h = [0, 18, 36, 50][st] - (i % 2) * 6, lean = (i - (n - 1) / 2) * .08, m = st > 1 ? 3 : 1;
        a.band('teal', lines([[x * .3, 0, x, -h]]), 2.2);
        for (let j = 1; j <= m; j++) arrow(a, x, -h * j / m, -1.57 + (j % 2 ? -.95 : .95) + lean, st === 1 ? 14 : 19);
      }
      if (st === 3) for (const [x, y] of [[-15, -42], [13, -50], [0, -58]]) { a.fk('white', circ(x, y, 5.5), .9); a.fill('pink', circ(x, y, 2.8)); }
    } else if (kind === 'cai') {
      const n = [0, 3, 5, 7][st], sz = [0, 18, 26, 34][st];
      if (st >= 2) a.band('white', lines([[-5, 0, -4, -16], [0, 0, 0, -20], [5, 0, 4, -16]]), 3.4);
      for (let i = 0; i < n; i++) {
        const ang = -1.57 + (i - (n - 1) / 2) * (st === 3 ? .4 : .55), L = sz * (1 - Math.abs(i - (n - 1) / 2) * .07);
        lf(a, 0, -4, ang, L * 1.05, L * .78, i % 2 ? 'green' : 'teal');
      }
      if (st === 3) a.fk('yellow', ell(0, -22, 9, 8), 1);
    } else if (kind === 'khoai') {
      const vines = [0, 2, 4, 6][st];
      for (let i = 0; i < vines; i++) {
        const sg = i % 2 ? 1 : -1, len = 14 + i * 5, y = -2 - (i % 3) * 3;
        a.band('teal', smooth([[0, y], [sg * len * .5, y - 5], [sg * len, y + 1]], false), 2);
        heart(a, sg * len, y - 2, 6 + st); if (i < 2 + st) heart(a, sg * len * .5, y - 8, 5 + st * .6);
      }
      heart(a, 0, -14 - st * 4, 7 + st);
      if (st === 3) { a.fk('lilac', ell(-12, 1, 9, 5, .2), 1.4); a.fk('pink', ell(-14, 0, 4, 2.5, .2), .6); a.fk('lilac', ell(14, 1, 8, 4.5, -.2), 1.4); a.fk('pink', circ(6, -30, 5), .9); a.fill('white', circ(6, -30, 2)); }
    } else if (kind === 'dau') {                                    // the trellis (A.dan) is drawn under it; vines climb both poles, pods hang from the top bar
      const H = [0, 30, 62, 88][st];
      for (const sg of [-1, 1]) if (st >= 1) { a.band('green', smooth([[sg * 25, 0], [sg * 31, -H * .35], [sg * 25, -H * .7], [sg * 30, -H]], false), 2.2); for (let j = 1; j <= st + 1; j++) lf(a, sg * 27, -H * j / (st + 2), sg > 0 ? -.4 : -2.75, 12, 6.5, j % 2 ? 'green' : 'teal'); }
      if (st >= 2) a.band('green', smooth([[-30, -H], [0, -H - 4], [30, -H]], false), 2);
      if (st >= 2) for (const x of [-12, 6, 20]) lf(a, x, -H - 2, -1.57 + x * .02, 12, 6.5);
      if (st === 3) for (const [x, len] of [[-21, 34], [-12, 44], [-3, 38], [7, 46], [16, 36], [24, 42]]) { a.band('green', smooth([[x, -H], [x + 1, -H + len * .5], [x - 1, -H + len]], false), 2.6); }
      if (st >= 2) { a.fk('lilac', circ(14, -H + 2, 3.4), .8); a.fk('lilac', circ(-18, -H + 4, 3), .8); }
    } else if (kind === 'muop') {
      const H = [0, 30, 62, 88][st];
      for (const sg of [-1, 1]) if (st >= 1) a.band('teal', smooth([[sg * 25, 0], [sg * 20, -H * .5], [sg * 28, -H]], false), 2);
      if (st >= 2) a.band('teal', smooth([[-28, -H], [0, -H - 6], [28, -H]], false), 2);
      const lv = [0, 4, 9, 12][st];
      for (let i = 0; i < lv; i++) {
        const sg = i % 2 ? -1 : 1, top = i >= lv - 4 && st >= 2, x = top ? -22 + (i - (lv - 4)) * 15 : sg * 25, y = top ? -H - 2 + (i % 2) * 5 : -(6 + Math.floor(i / 2) * (H - 8) / Math.max(1, (lv - 4) / 2));
        a.fk('green', ell(x + (top ? 0 : sg * 5), y, 9, 6.5, top ? 0 : sg * .3), 1.1);
      }
      if (st === 3) { for (const x of [-18, -2, 14]) { a.fk('green', ell(x, -H + 26, 6.5, 22, .04), 1.6); a.fill('leafhi', ell(x - 2.5, -H + 22, 1.8, 14, .04)); a.key(lines([[x - 2, -H + 8, x - 2, -H + 42], [x + 2, -H + 8, x + 2, -H + 42]]), .8); } for (const x of [-10, 22]) { a.fk('yellow', circ(x, -H + 4, 5), .9); a.fill('orange', circ(x, -H + 4, 2)); } }
      if (st === 2) a.fk('yellow', circ(10, -H + 6, 4), .9);
    } else if (kind === 'ot') {
      const h = [0, 16, 34, 46][st];
      a.band('green', lines([[0, 0, 0, -h]]), 3.2);
      [[-8, .35, -2.6], [8, .5, -.5], [-6, .72, -2.2], [6, .85, -.9], [0, 1, -1.57]].slice(0, [0, 3, 5, 5][st]).forEach(([x, y, ang], i) => lf(a, 0, -h * y, ang, 18, 8, i % 2 ? 'teal' : 'green'));
      if (st === 2) for (const [x, y] of [[-8, -26], [9, -30]]) { a.fk('white', circ(x, y, 3), .8); }
      if (st === 3) [[-14, -26], [12, -30], [-6, -16], [10, -14], [-20, -38], [4, -42]].forEach(([x, y], i) => { a.fk(i % 3 ? 'red' : 'orange', ell(x, y + 6, 3.4, 10, i % 2 ? .25 : -.25), 1.1); a.fill('white', ell(x - 1.2, y + 2, .9, 3, i % 2 ? .25 : -.25)); a.fk('green', circ(x, y - 3, 2.2), .7); });
    }
  };

  /* ---- the fine style (owner: like the rice): small, true to life, plate fills with only a hair of ink ---- */
  PL.leaflt = ['#a3d270', [-1, 1]]; PL.thatch = ['#d3a24c', [-1, 1]]; PL.thatch2 = ['#a8792f', [1, -1]]; PL.thatch3 = ['#ecc874', [-1, 1]];
  const jit = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }; PL.lilac2 = ['#9a6fb2', [1, -1]];
  const LF = (a, x, y, ang, len, wid, pl = 'lua', hi = 'leaflt', vein = 'green') => {
    const w = wid / 2, p = leafP(x, y, ang, len, w), c = Math.cos(ang), sn = Math.sin(ang);
    a.fill(pl, p); a.fill(hi, leafP(x, y, ang, len * .95, w * .8, c > 0 ? -1 : 1));
    a.band(vein, lines([[x, y, x + c * len * .82, y + sn * len * .82]]), .55); a.key(p, .4);
  };
  const stalk = (a, pts, w = 1.6, pl = 'green') => a.band(pl, smooth(pts, false), w);
  const roundLeaf = (a, x, y, r, pl = 'lua', hi = 'leaflt') => {           // a broad lobed leaf seen from above (pumpkin, gourd)
    const pts = []; for (let i = 0; i < 20; i++) { const t = i / 20 * 6.283 - 1.57, rr = r * (1 + .16 * Math.cos(t * 5)) * (i === 0 || i === 19 ? .7 : 1); pts.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr * .78]); }
    const p = smooth(pts); a.fill(pl, p); a.fill(hi, ell(x - r * .25, y - r * .25, r * .45, r * .3, -.4));
    for (let i = 0; i < 5; i++) { const t = -1.57 + (i - 2) * .75 + 3.14; a.band('green', lines([[x, y + r * .55, x + Math.cos(t + 3.14) * r * .8, y + r * .55 + Math.sin(t + 3.14) * r * .75]]), .5); }
    a.key(p, .4);
  };
  const heartF = (a, x, y, r, ang = 0, pl = 'lua', hi = 'leaflt') => {
    const c = Math.cos(ang), sn = Math.sin(ang), P = (u, v) => [x + u * c - v * sn, y + u * sn + v * c];
    const p = smooth([P(0, r * .95), P(-r * .9, r * .1), P(-r * .7, -r * .6), P(-r * .2, -r * .55), P(0, -r * .25), P(r * .2, -r * .55), P(r * .7, -r * .6), P(r * .9, r * .1)]);
    a.fill(pl, p); a.fill(hi, ell(...P(-r * .35, -r * .2), r * .3, r * .2, ang)); a.band('green', lines([[...P(0, -r * .25), ...P(0, r * .8)]]), .45); a.key(p, .4);
  };
  const vn2 = (a, kind, st) => {
    if (st === 0) {                                                  // a seedling: a little ridge of earth, two seed leaves
      a.fill('brown', ell(0, -1, 9, 3)); a.fill('tan', ell(-2, -2, 5, 1.2)); stalk(a, [[0, -1], [0, -4], [0, -7]], 1.2, 'lua');
      LF(a, 0, -7, -2.6, 7, 5); LF(a, 0, -7, -.55, 7, 5); return;
    }
    if (kind === 'ca') {                                             // eggplant: a bush of soft oval leaves, purple fruit hanging under them
      const h = [0, 16, 28, 34][st];
      stalk(a, [[0, 0], [1, -h * .5], [0, -h]], 2, 'lilac2'); stalk(a, [[0, -h * .4], [-8, -h * .6], [-12, -h * .7]], 1.3, 'lilac2'); stalk(a, [[0, -h * .55], [7, -h * .75], [11, -h * .85]], 1.3, 'lilac2');
      for (const [x, y, ang, L] of [[0, -h, -2.2, 13], [0, -h, -.9, 13], [-12, -h * .7, -2.7, 12], [11, -h * .85, -.4, 12], [0, -h * .3, -2.9, 11], [0, -h * .35, -.2, 11], [0, -h * .7, -1.57, 10]].slice(0, [0, 4, 7, 7][st])) LF(a, x, y, ang, L, L * .62, 'green', 'leafhi', 'teal');
      if (st === 2) for (const [x, y] of [[-6, -h * .5], [6, -h * .62]]) { for (let i = 0; i < 5; i++) a.fill('lilac2', ell(x + Math.cos(i * 1.257) * 2, y + Math.sin(i * 1.257) * 2, 1.6, 1, i * 1.257)); a.fill('yellow', circ(x, y, .9)); }
      if (st === 3) for (const [x, y, r] of [[-8, -h * .42, .3], [7, -h * .5, -.25], [-1, -h * .3, .05]]) { a.fk('catim', ell(x, y + 7, 3.4, 8, r), .7); a.fill('white', ell(x - 1.2, y + 5, .8, 3, r)); a.fill('green', c4Poly([[x - 3.6, y - 1], [x, y - 3.5], [x + 3.6, y - 1], [x, y + 1.6]])); }
    } else if (kind === 'bi') {                                      // pumpkin: a vine on the ground, big lobed leaves, a ribbed orange fruit
      const v = [0, 1, 2, 3][st];
      stalk(a, [[0, -2], [-12, -4], [-22, -1]], 1.4, 'lua'); if (v > 1) stalk(a, [[0, -2], [12, -6], [24, -3]], 1.4, 'lua');
      for (const [x, y, r] of [[-3, -8, 9], [-16, -6, 8], [12, -10, 9], [22, -5, 7], [-6, -16, 7]].slice(0, [0, 2, 4, 5][st])) roundLeaf(a, x, y, r);
      if (st === 2) { a.fill('yellow', c4Poly([[18, -16], [22, -24], [26, -16], [22, -13]])); a.fill('orange', circ(22, -17, 1.2)); }
      if (st === 3) { a.fk('orange', ell(10, -5, 10, 7.5), .8); a.fill('yellow', ell(6, -8, 3, 3.5, .3)); a.key(lines([[6, -11.5, 4, 1], [10, -12.5, 10, 2.4], [14, -11.5, 16, 1]]), .5); a.fill('brown', c4Rect(9, -14, 11.5, -11)); }
    } else if (kind === 'ngo') {                                      // maize: tall stalk, long arching strap leaves, a tassel and a cob in its husk
      const h = [0, 22, 46, 58][st];
      stalk(a, [[0, 0], [.5, -h * .5], [0, -h]], 2.4, 'lua'); a.band('leaflt', lines([[.8, -2, .8, -h + 2]]), .6);
      for (const [f, d, L] of [[.15, -1, 20], [.22, 1, 20], [.42, -1, 24], [.48, 1, 23], [.68, -1, 20], [.74, 1, 18], [.9, -1, 13]].slice(0, [0, 3, 6, 7][st])) {
        const y = -h * f, ex = d * L, ey = y - L * .2; a.band('lua', smooth([[0, y], [d * L * .5, y - L * .45], [ex, ey + 4]], false), 3); a.band('leaflt', smooth([[0, y - .6], [d * L * .48, y - L * .45 - .8], [ex, ey + 3.4]], false), 1); a.band('green', smooth([[0, y + 1], [d * L * .5, y - L * .45 + 1.2], [ex, ey + 4.6]], false), .4);
      }
      if (st >= 2) for (const [dx, dy] of [[-4, -8], [0, -10], [4, -7], [-6, -4], [6, -3]]) a.band('straw', lines([[0, -h, dx, -h + dy]]), .8);
      if (st === 3) { a.fill('lua', leafP(1.5, -h * .38, -1.45, 14, 3.4)); a.fill('yellow', ell(3.4, -h * .5, 2, 5, .15)); for (let i = 0; i < 4; i++) a.band('ash', lines([[3, -h * .56 - 4, 2 + i, -h * .56 - 8 - (i % 2) * 2]]), .4); a.key(leafP(1.5, -h * .38, -1.45, 14, 3.4), .4); }
    } else if (kind === 'muong') {                                   // water spinach: a low bed of slanting hollow stems, narrow arrow leaves
      const n = [0, 4, 7, 9][st], h = [0, 9, 15, 18][st];
      for (let i = 0; i < n; i++) {
        const t = i / Math.max(1, n - 1) - .5, x = t * 16, top = -h * (.75 + .3 * Math.abs(Math.sin(i * 1.9))), lean = t * 10;
        stalk(a, [[x * .4, 0], [x + lean * .3, top * .6], [x + lean, top]], 1, 'leafhi');
        LF(a, x + lean, top, -1.57 + lean * .07 + (i % 2 ? -.5 : .5), 8, 3.2); if (st > 1) LF(a, x + lean * .5, top * .55, (i % 2 ? -2.6 : -.5), 7, 2.8, 'green', 'leafhi', 'teal');
      }
      if (st === 3) for (const [x, y] of [[-7, -16], [6, -18]]) { a.fill('white', circ(x, y, 2.4)); a.fill('rose', circ(x, y, 1)); }
    } else if (kind === 'cai') {                                     // mustard greens: a low rosette of spoon-shaped leaves on pale stalks
      const n = [0, 3, 5, 7][st], L = [0, 9, 13, 16][st];
      for (let i = 0; i < n; i++) {
        const ang = -1.57 + (i - (n - 1) / 2) * (2.6 / Math.max(1, n - 1)), back = i % 2;
        a.band('cream', lines([[0, 0, Math.cos(ang) * L * .45, Math.sin(ang) * L * .45]]), 1.6);
        LF(a, Math.cos(ang) * L * .35, Math.sin(ang) * L * .35, ang, L * .85, L * .7, back ? 'lua' : 'leafhi', 'leaflt', 'cream');
      }
    } else if (kind === 'khoai') {                                   // sweet potato: a mat of heart leaves on runners, purple tubers at the end
      const n = [0, 3, 6, 8][st];
      for (let i = 0; i < Math.min(n, 4); i++) { const d = i % 2 ? 1 : -1, L = 8 + i * 4; stalk(a, [[0, -1], [d * L * .5, -3], [d * L, -1]], .9, 'lilac2'); }
      for (const [x, y, r, ang] of [[0, -7, 5, 0], [-8, -3, 4.5, -.3], [8, -4, 4.5, .3], [-15, -1, 4, -.5], [15, -2, 4, .4], [-4, -12, 4, -.1], [5, -11, 4, .2], [0, -2, 3.5, 0]].slice(0, n)) heartF(a, x, y, r, ang, (x * 7 + y) % 3 ? 'lua' : 'green', 'leaflt');
      if (st === 3) { a.fk('catim', ell(-10, 1, 5, 2.6, .2), .5); a.fill('rose', ell(-11, .2, 2, 1, .2)); a.fk('catim', ell(11, 1.5, 4.4, 2.4, -.2), .5); }
    } else if (kind === 'dau') {                                     // yard-long bean on the trellis: twining vines, leaves in threes, long thin pods
      const H = [0, 30, 62, 88][st];
      for (const sg of [-1, 1]) { stalk(a, [[sg * 26, 0], [sg * 31, -H * .35], [sg * 26, -H * .7], [sg * 30, -H]], 1.1, 'lua'); for (let j = 1; j <= st + 1; j++) { const y = -H * j / (st + 2), x = sg * 28; for (const da of [-.6, 0, .6]) LF(a, x, y, (sg > 0 ? -.3 : -2.85) + da, 7, 4); } }
      if (st >= 2) { stalk(a, [[-30, -H], [0, -H - 4], [30, -H]], 1, 'lua'); for (const x of [-14, 0, 14]) for (const da of [-.6, 0, .6]) LF(a, x, -H - 2, -1.57 + da, 7, 4); }
      if (st >= 2) for (const [x, y] of [[14, -H + 3], [-18, -H + 5]]) a.fill('lilac2', ell(x, y, 2, 1.4));
      if (st === 3) for (const [x, len] of [[-21, 30], [-14, 40], [-6, 34], [6, 42], [14, 32], [22, 38]]) stalk(a, [[x, -H], [x + 1.5, -H + len * .5], [x - .5, -H + len]], 1.3, 'lua');
    } else if (kind === 'muop') {                                    // sponge gourd on the trellis: big lobed leaves, yellow flowers, long gourds
      const H = [0, 30, 62, 88][st];
      for (const sg of [-1, 1]) stalk(a, [[sg * 25, 0], [sg * 20, -H * .5], [sg * 28, -H]], 1.1, 'lua');
      if (st >= 2) stalk(a, [[-28, -H], [0, -H - 6], [28, -H]], 1.1, 'lua');
      const lv = [[-24, -H * .3, 6], [24, -H * .45, 6], [-25, -H * .65, 6.5], [26, -H * .8, 6.5], [-18, -H - 3, 7], [-2, -H - 5, 7], [14, -H - 3, 7], [26, -H - 1, 6]];
      for (const [x, y, r] of lv.slice(0, [0, 2, 6, 8][st])) roundLeaf(a, x, y, r);
      if (st === 3) for (const x of [-15, 0, 15]) { a.fk('lua', ell(x, -H + 20, 3.4, 15, .03), .6); a.band('green', lines([[x - 1, -H + 8, x - 1, -H + 33], [x + 1.2, -H + 8, x + 1.2, -H + 33]]), .45); a.fill('leaflt', ell(x - 1.4, -H + 16, .9, 8, .03)); }
      if (st >= 2) for (const x of [-9, 21]) { for (let i = 0; i < 5; i++) a.fill('yellow', ell(x + Math.cos(i * 1.257) * 2.3, -H + 6 + Math.sin(i * 1.257) * 2.3, 2, 1.3, i * 1.257)); a.fill('orange', circ(x, -H + 6, .9)); }
    } else if (kind === 'ot') {                                      // chilli: a small bush of narrow leaves, slender fruit turning red
      const h = [0, 12, 22, 26][st];
      stalk(a, [[0, 0], [0, -h * .6], [-1, -h]], 1.6, 'lua'); stalk(a, [[0, -h * .5], [-7, -h * .75]], 1, 'lua'); stalk(a, [[0, -h * .6], [7, -h * .85]], 1, 'lua');
      for (const [x, y, ang] of [[-1, -h, -2.1], [-1, -h, -1], [-7, -h * .75, -2.7], [7, -h * .85, -.4], [0, -h * .35, -2.8], [0, -h * .4, -.3], [-7, -h * .75, -1.9], [7, -h * .85, -1.2]].slice(0, [0, 4, 8, 8][st])) LF(a, x, y, ang, 8, 3.6);
      if (st === 2) for (const [x, y] of [[-5, -h * .55], [5, -h * .7]]) a.fill('white', circ(x, y, 1.3));
      if (st === 3) [[-8, -h * .55, .3], [6, -h * .62, -.3], [-3, -h * .4, .1], [9, -h * .45, -.5], [-10, -h * .3, .5]].forEach(([x, y, r], i) => { a.fk(i % 3 ? 'red' : 'orange', ell(x, y + 4, 1.5, 4.6, r), .5); a.fill('white', ell(x - .5, y + 2.6, .4, 1.6, r)); a.fill('green', circ(x, y, .9)); });
    }
  };
  const crop = (kind, st) => part([-44, -132, 44, 8], a => {
    if (kind !== 'lua') { vn2(a, kind, st); return; }
    if (st === 0 && kind !== 'lua') { a.fk('brown', ell(0, -3, 15, 6), 1.2); a.fill('tan', ell(-3, -5, 8, 2.4)); a.band('green', lines([[0, -4, 0, -11]]), 2); lf(a, 0, -11, -2.5, 10, 7, 'green'); lf(a, 0, -11, -.64, 10, 7, 'green'); return; }
    if (!['ca', 'bi', 'ngo'].includes(kind)) { vn(a, kind, st); return; }
    if (kind === 'ca') {
      const h = [0, 22, 40, 52][st]; stem(a, h);
      lf(a, 0, -h * .5, -2.6, 22, 9); lf(a, 0, -h * .5, -.5, 22, 9);
      if (st >= 2) { lf(a, 0, -h * .85, -2.3, 24, 10); lf(a, 0, -h * .85, -.8, 24, 10); lf(a, 0, -h * .2, -2.9, 20, 9, 'teal'); lf(a, 0, -h * .25, -.2, 20, 9, 'teal'); }
      if (st === 2) for (const [x, y] of [[-9, -22], [9, -28]]) { a.fk('lilac', circ(x, y, 3.6), .9); a.fill('yellow', circ(x, y, 1.2)); }
      if (st === 3) for (const [x, y, r] of [[-12, -14, .25], [12, -20, -.2], [-2, -30, .1]]) { a.fk('catim', ell(x, y + 4, 6.5, 13, r), 1.4); a.fill('white', ell(x - 2.5, y, 1.6, 4, r)); a.fk('green', c4Poly([[x - 6, y - 7], [x, y - 12], [x + 6, y - 7], [x, y - 4]]), 1); }
    } else if (kind === 'bi') {
      lf(a, -4, -4, -2.7, [0, 26, 34, 34][st], 16); lf(a, 4, -4, -.4, [0, 26, 34, 34][st], 16);
      if (st >= 2) { lf(a, 0, -6, -1.57, 28, 15); lf(a, -16, -4, -3.1, 24, 12); }
      if (st === 2) a.fk('green', circ(20, -10, 9), 1.2);
      if (st === 3) { a.fk('orange', ell(18, -18, 21, 17), 1.6); a.fill('yellow', ell(10, -24, 6, 9, .3)); a.key(lines([[10, -33, 6, -4], [18, -35, 18, -1], [26, -33, 30, -4]]), 1.2); a.fk('brown', c4Rect(16, -41, 21, -33), 1); a.band('green', smooth([[21, -38], [30, -46], [36, -40]], false), 1.6); }
    } else {
      const h = [0, 34, 64, 86][st]; stem(a, h);
      lf(a, 0, -h * .2, -2.75, 32, 10, 'teal'); lf(a, 0, -h * .25, -.4, 32, 10, 'teal'); lf(a, 0, -h * .42, -2.4, 38, 10); lf(a, 0, -h * .45, -.7, 38, 10); lf(a, 0, -h * .7, -2.5, 34, 9); lf(a, 0, -h * .72, -.65, 34, 9);
      if (st >= 2) a.band('straw', lines([[0, -h, -7, -h - 14], [0, -h, 0, -h - 17], [0, -h, 7, -h - 13], [0, -h - 6, -10, -h - 8]]), 1.6);
      if (st === 3) { a.fk('yellow', ell(10, -50, 5.5, 16, .12), 1.1); for (let i = 0; i < 6; i++) a.key(lines([[6.5, -62 + i * 4.5, 13.5, -61 + i * 4.5]]), .5); a.fk('green', leafP(7, -34, -1.5, 30, 6, 1), 1.2); a.fk('green', leafP(13, -34, -1.65, 28, 5, -1), 1.2); a.band('brown', lines([[11, -66, 9, -74], [11, -66, 14, -73]]), 1.2); }
    }
  });
  const C = {}; for (const k of Object.keys(C11_CROPS)) C[k] = [];
  for (const k of Object.keys(C)) for (let s = 0; s < 4; s++) C[k].push(crop(k, s));
  /* trees in the fine style: crowns built from hundreds of small leaves in four greens (light on top, dark beneath) over a dark mass,
     only a thin ink line round the whole crown; trunks with a lit side and bark strokes; palms with real pinnate fronds */
  PL.leafdk = ['#24533c', [1, -1]]; PL.bark = ['#7a4a2c', [1, -1]];
  const trunk = (a, h, w = 12, lean = 0) => {
    const p = c4Poly([[-w, 0], [w, 0], [w * .62 + lean, -h], [-w * .62 + lean, -h]]);
    a.fill('brown', p); a.fill('bark', c4Poly([[-w * .15, 0], [w * .7, 0], [w * .45 + lean, -h], [-w * .1 + lean, -h]]));
    for (let i = 0; i < 6; i++) { const x = -w * .6 + i * w * .26; a.band('brown', smooth([[x, -3], [x + 1.5 + lean * .3, -h * .45], [x * .65 + lean, -h + 4]], false), .7); }
    for (const sg of [-1, 1]) a.fill('brown', smooth([[sg * w * .5, -6], [sg * (w + 9), 1], [sg * w * .2, 1]]));
    a.key(p, 1.2);
  };
  const T = (sc, py, amp, tr, cr, b1, b2) => ({ sc, py, amp, trunk: part(b1 || [-30, -120, 30, 8], tr), crown: part(b2 || [-90, -230, 90, -20], cr) });
  const lumpy = (cx, cy, rx, ry, seed, n = 16, flat = .82) => { const pts = []; for (let i = 0; i < n; i++) { const t = i / n * 6.283, r = 1 + .15 * Math.sin(i * 2.1 + seed) + .1 * Math.cos(i * 3.3 + seed * 1.7) + (i % 2 ? .07 : -.05); pts.push([cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r * (Math.sin(t) > 0 ? flat : 1)]); } return smooth(pts); };
  /* a leafy crown with volume: overlapping clumps, each dark beneath, mid green, lit at the top left, a fringe of leaves on its
     upper edge and a thin ink line; back clumps first, front (lower) ones over them */
  const foliage = (a, cx, cy, rx, ry, seed, light = 'yellow', leaf = 6) => {
    const pink = light === 'pink', tealish = light === 'teal', D = pink ? 'pink' : tealish ? 'leafdk' : 'green', M = pink ? 'rose' : tealish ? 'teal' : 'lua', L = pink ? 'white' : tealish ? 'tealhi' : 'leaflt';
    const cl = [], mn = Math.min(rx, ry), m = Math.max(6, Math.round(3.9 * (rx + ry) / (mn * .62)) );
    for (let i = 0; i < m; i++) { const t = i / m * 6.283 + seed; cl.push([cx + Math.cos(t) * rx * .6, cy + Math.sin(t) * ry * .58, mn * (.36 + jit(i, seed) * .06)]); }
    const n = Math.max(3, Math.round(rx * ry / 900));
    for (let i = 0; i < n; i++) { const t = i * 2.399 + seed, rr = Math.sqrt((i + .5) / n) * .32; cl.push([cx + Math.cos(t) * rx * rr, cy + Math.sin(t) * ry * rr - ry * .08, mn * (.48 + jit(i, seed + 5) * .08)]); }
    cl.sort((p, q) => p[1] - q[1]);
    const sil = lumpy(cx, cy + ry * .03, rx * .95, ry * .93, seed, 18); a.fill(D, sil);
    for (const [x, y] of cl.slice(0, 4)) a.band('bark', smooth([[cx, cy + ry * .95], [cx + (x - cx) * .4, cy + ry * .5], [x, y + 4]], false), 2.6);
    cl.forEach(([x, y, r], i) => {
      const out = lumpy(x, y, r, r * .86, seed + i * 1.7, 12, .9);
      a.fill(D, out); a.fill(M, lumpy(x - r * .07, y - r * .12, r * .86, r * .7, seed + i, 11, .9)); a.fill(L, lumpy(x - r * .3, y - r * .36, r * .44, r * .3, seed + i * 3, 9, .9));
      for (let j = 0; j < 7; j++) { const t = -2.6 + j * .4, lx = x + Math.cos(t) * r * .9, ly = y + Math.sin(t) * r * .8; a.fill(j < 3 ? L : M, leafP(lx, ly + 2, t + (jit(j, i) - .5) * .5, leaf * 1.2, leaf * .42)); }
      for (let j = 0; j < 4; j++) { const t = .5 + j * .55, lx = x + Math.cos(t) * r * .55, ly = y + Math.sin(t) * r * .5; a.fill(D, leafP(lx, ly, t, leaf, leaf * .36)); }
      a.band('leafdk', smooth([[x - r * .85, y + r * .1], [x - r * .4, y + r * .72], [x + r * .4, y + r * .72], [x + r * .85, y + r * .1]], false), 1.1);
    });
    a.key(sil, 1);
  };
  /* a palm frond: a curved midrib and narrow leaflets hanging from both sides, shorter towards the tip */
  const frond = (a, x0, y0, ang, len, droop, pl = 'lua', pl2 = 'green') => {
    const ex = x0 + Math.cos(ang) * len, ey = y0 + Math.sin(ang) * len + droop, mx = x0 + Math.cos(ang) * len * .5, my = y0 + Math.sin(ang) * len * .5 - 10;
    const q = (a0, a1, a2, t) => (1 - t) * (1 - t) * a0 + 2 * (1 - t) * t * a1 + t * t * a2;
    for (let j = 1; j < 16; j++) {
      const t = j / 16, px = q(x0, mx, ex, t), py = q(y0, my, ey, t), L = 15 * (1 - t * .6), dir = Math.atan2(q(y0, my, ey, t + .01) - py, q(x0, mx, ex, t + .01) - px);
      for (const sd of [-1, 1]) a.band(sd > 0 ? pl : pl2, lines([[px, py, px + Math.cos(dir + sd * 1.1) * L, py + Math.sin(dir + sd * 1.1) * L + L * .5]]), 1.5);
    }
    a.band('leafdk', smooth([[x0, y0], [mx, my], [ex, ey]], false), 1.3);
  };
  const trees = {
    xoai: T(.82, -74, .028, a => trunk(a, 80), a => {
      foliage(a, 0, -142, 58, 66, 1.3, 'yellow');
      for (const [x, y] of [[-26, -128], [24, -160], [30, -112], [-10, -96]]) { a.band('green', lines([[x, y - 6, x + 1, y - 12]]), .8); a.fk('orange', ell(x, y, 3.8, 5.6, .4), .6); a.fill('yellow', ell(x - 1.2, y - 1.5, 1, 2, .4)); }
    }, null, [-100, -240, 100, -30]),
    da: T(.7, -62, .022, a => { trunk(a, 70, 16); for (const x of [-30, 26]) { a.fill('bark', c4Poly([[x - 2.5, -50], [x + 2.5, -50], [x + 1.5, 0], [x - 1.5, 0]])); a.key(lines([[x, -50, x, 0]]), .5); } }, a => {
      foliage(a, 0, -118, 108, 54, 2.7, 'yellow');
      for (const x of [-70, -40, 44, 74]) a.band('bark', smooth([[x, -86], [x + 3, -50], [x - 2, -14]], false), 1.2);
    }, null, [-150, -210, 150, -10]),
    cau: T(.7, -150, .05, a => { const p = c4Poly([[-5, 0], [5, 0], [3.6, -150], [-3.6, -150]]); a.fill('ash', p); a.fill('white', c4Poly([[-1, 0], [2.5, 0], [1.6, -150], [-.5, -150]])); for (let y = 10; y < 148; y += 9) a.band('brown', lines([[-4.5 + y * .006, -y, 4.5 - y * .006, -y]]), .5); a.key(p, .9); a.fill('lua', c4Rect(-4, -150, 4, -128)); }, a => {
      for (const [ang, len, dr] of [[-3.0, 62, 22], [-.15, 62, 22], [-2.55, 66, 12], [-.6, 66, 12], [-2.05, 58, 4], [-1.1, 58, 4], [-1.57, 48, 0]]) frond(a, 0, -150, ang, len, dr);
      for (const [x, y] of [[-5, -144], [5, -145], [0, -139], [-2, -147]]) { a.fk('orange', ell(x, y, 2.8, 3.4), .5); }
    }, [-18, -170, 18, 8], [-90, -250, 90, -90]),
    dao: T(.78, -70, .034, a => { const p = c4Poly([[-11, 0], [11, 0], [6, -34], [30, -88], [20, -96], [3, -58], [-14, -90], [-26, -84], [-6, -34]]); a.fill('brown', p); a.fill('bark', c4Poly([[0, 0], [9, 0], [5, -34], [26, -88], [20, -92], [2, -52]])); a.key(p, 1.1); }, a => {
      foliage(a, 0, -118, 82, 52, 2.1, 'pink', 5);
      for (let i = 0; i < 70; i++) { const t = i * 2.399, rr = Math.sqrt((i + .5) / 70) * .9, x = Math.cos(t) * 80 * rr, y = -118 + Math.sin(t) * 50 * rr; if (jit(i, 4) < .18) { a.fill('lua', leafP(x, y, -1.2 + jit(i, 5), 6, 2)); continue; } const r = 1.6 + jit(i, 6); for (let j = 0; j < 5; j++) a.fill(y < -128 ? 'white' : 'rose', circ(x + Math.cos(j * 1.257) * r * .7, y + Math.sin(j * 1.257) * r * .7, r * .5)); a.fill('red', circ(x, y, .6)); }
    }, [-34, -104, 34, 8], [-100, -200, 100, -30]),
    phuong: T(.74, -66, .03, a => { const p = c4Poly([[-12, 0], [12, 0], [7, -44], [28, -96], [16, -102], [0, -62], [-16, -98], [-28, -92], [-6, -42]]); a.fill('brown', p); a.fill('bark', c4Poly([[0, 0], [10, 0], [6, -44], [24, -96], [17, -98], [1, -56]])); a.key(p, 1.1); }, a => {
      foliage(a, 0, -118, 98, 40, 4.1, 'yellow', 4.5);
      for (let i = 0; i < 60; i++) { const t = i * 2.399 + 1, rr = Math.sqrt((i + .5) / 60), x = Math.cos(t) * 88 * rr, y = -122 + Math.sin(t) * 32 * rr - 4; for (let j = 0; j < 5; j++) a.fill(j ? 'red' : 'orange', circ(x + Math.cos(j * 1.257) * 2, y + Math.sin(j * 1.257) * 2, 1.8)); }
    }, [-34, -112, 34, 8], [-140, -190, 140, -30]),
    dua: T(.62, -140, .05, a => { const p = c4Poly([[-7, 0], [7, 0], [10, -50], [16, -100], [14, -142], [6, -142], [4, -100], [-1, -50]]); a.fill('tan', p); a.fill('cream', c4Poly([[1, 0], [6, 0], [9, -50], [15, -100], [13, -142], [10, -142], [8, -100], [3, -50]])); for (let y = 10; y < 140; y += 7) a.band('brown', lines([[-1 + y * .08, -y, 11 + y * .06, -y + 1.5]]), .55); a.key(p, 1); }, a => {
      for (const [ang, len, dr] of [[-3.05, 80, 30], [-2.65, 86, 16], [-2.15, 76, 6], [-1.57, 62, 0], [-1.0, 76, 6], [-.5, 86, 16], [-.1, 80, 30]]) frond(a, 10, -142, ang, len, dr);
      for (const [x, y] of [[4, -134], [16, -135], [10, -129]]) { a.fk('lua', circ(x, y, 4.4), .6); a.fill('leaflt', circ(x - 1.4, y - 1.4, 1.4)); }
    }, [-20, -160, 24, 8], [-110, -240, 110, -90]),
    willow: T(.62, -76, .05, a => trunk(a, 82, 14), a => {
      foliage(a, 0, -118, 70, 34, 5.3, 'yellow', 4.5);
      for (let i = -9; i <= 9; i++) { const x = i * 7, d = (i % 2 ? 1 : -1) * 4; a.band(i % 3 ? 'lua' : 'leafhi', smooth([[x, -100], [x + d, -70], [x + d * 1.4, -34 - (i % 3) * 6]], false), 1); for (let y = -94; y < -40 - (i % 3) * 6; y += 7) a.fill('leafhi', leafP(x + d * ((y + 100) / 66), y, 1.57 + (i % 2 ? .5 : -.5), 5, 1.6)); }
    }, [-30, -100, 30, 8], [-90, -210, 90, -10]),
    banana: T(.62, -86, .05, a => { const p = c4Poly([[-9, 0], [9, 0], [6, -86], [-6, -86]]); a.fill('lua', p); a.fill('leaflt', c4Poly([[0, 0], [7, 0], [5, -86], [0, -86]])); for (const y of [-20, -44, -66]) a.band('green', smooth([[-8, y], [0, y - 3], [7, y]], false), .7); a.key(p, 1); }, a => {
      const bl = (ang, len, wid, pl) => {                              // a long banana leaf, its edge torn into strips by the wind
        const x0 = 0, y0 = -88; LF(a, x0, y0, ang, len, wid, pl, pl === 'lua' ? 'leaflt' : 'leafhi', 'leaflt');
        const c = Math.cos(ang), sn = Math.sin(ang); for (let j = 1; j < 9; j++) { const f = .15 + j * .09, bx = x0 + c * len * f, by = y0 + sn * len * f, sd = j % 2 ? 1 : -1; a.band('leafdk', lines([[bx, by, bx - sn * wid * .5 * sd + c * 3, by + c * wid * .5 * sd + sn * 3]]), .5); }
      };
      bl(-2.95, 74, 22, 'green'); bl(-.2, 74, 22, 'green'); bl(-2.35, 82, 24, 'lua'); bl(-.8, 82, 24, 'lua'); bl(-2.0, 68, 20, 'green'); bl(-1.15, 68, 20, 'lua'); bl(-1.57, 70, 18, 'lua');
      for (let i = 0; i < 6; i++) { a.fk('yellow', ell(9 + (i % 3) * 4, -84 + Math.floor(i / 3) * 7, 2.2, 6, .4), .5); }
      a.fk('catim', ell(14, -66, 4, 7, .2), .6);
    }, [-20, -100, 20, 8], [-90, -190, 90, -50]),
  };
  const bamboo = [220, 270, 190].map(h => part([-56, -h - 40, 56, 8], a => {   // a bamboo culm: green with a lit side, ringed nodes, twigs with narrow leaves
    a.fill('lua', c4Rect(-4.4, -h, 4.4, 0)); a.fill('leaflt', c4Rect(.6, -h, 3.2, 0)); a.key(c4Rect(-4.4, -h, 4.4, 0), .7);
    for (let y = 22; y < h; y += 24) { a.band('green', lines([[-4.4, -y, 4.4, -y]]), 1.6); a.band('leaflt', lines([[-3.5, -y - 1.6, 3.5, -y - 1.6]]), .6); }
    /* bamboo leaves: long narrow blades with a fine point, hanging in fans of five to seven from the end of each twig */
    const bl = (x, y, ang, len, pl) => { const p = leafP(x, y, ang, len, len * .17); a.fill(pl, p); a.fill('leaflt', leafP(x, y, ang, len * .9, len * .08, Math.cos(ang) > 0 ? -1 : 1)); a.band('green', lines([[x, y, x + Math.cos(ang) * len * .82, y + Math.sin(ang) * len * .82]]), .4); a.key(p, .3); };
    for (let y = 58; y < h + 4; y += 13) {
      const sg = (y / 13 | 0) % 2 ? 1 : -1, up = y / h, reach = 10 + up * 22 + jit(y, 3) * 10, tx = sg * reach, ty = -y - 6 - up * 6 - jit(y, 4) * 6;
      a.band('lua', smooth([[0, -y], [sg * reach * .55, -y - 4], [tx, ty]], false), 1);
      const nl = 5 + Math.round(up * 2), base = sg > 0 ? .15 : Math.PI - .15;           // the fan hangs from the twig, drooping outwards and down
      for (let j = 0; j < nl; j++) { const ang = base + sg * (j / (nl - 1)) * 1.4 - sg * .45 + (jit(j, y + 7) - .5) * .3, f = j / nl; bl(tx - sg * f * 6, ty + f * 2, ang, 22 + jit(j, y) * 8 + up * 4, (j + y) % 3 === 0 ? 'leafhi' : 'lua'); }
    }
    for (let j = 0; j < 9; j++) { const ang = -1.57 + (j - 4) * .38, droop = Math.abs(j - 4) * .12; bl(0, -h + Math.abs(j - 4) * 1.5, ang + (j < 4 ? -droop : j > 4 ? droop : 0), 24 + jit(j, h) * 6, j % 2 ? 'leafhi' : 'lua'); }
  }));
  const bush = part([-56, -64, 56, 8], a => {
    foliage(a, 0, -28, 46, 26, 2.2, 'yellow', 4.5);
    for (const [x, y] of [[-22, -20], [16, -30], [4, -12], [30, -16], [-8, -36]]) { a.fk('red', circ(x, y, 2.4), .5); a.fill('white', circ(x - .8, y - .8, .7)); }
  });
  const hay = part([-56, -112, 56, 8], a => {                     // a village haystack (cây rơm): straw built round a bamboo pole, a little cap at the top
    const cone = smooth([[-44, 0], [-46, -12], [-40, -34], [-26, -64], [-10, -84], [0, -88], [10, -84], [26, -64], [40, -34], [46, -12], [44, 0]]);
    a.fill('thatch', cone); a.fill('thatch2', smooth([[-44, 0], [-46, -12], [-36, -18], [0, -14], [36, -18], [46, -12], [44, 0], [0, 4]]));
    a.fill('thatch3', smooth([[-20, -70], [-8, -84], [0, -82], [-12, -56], [-26, -34], [-32, -42]]));
    for (let i = 0; i < 120; i++) {                                     // strands: short strokes running down the slope, in three straw tones
      const u = (i * .618) % 1, row = (i * .37) % 1, y0 = -84 + row * 80, half = 6 + (y0 + 88) * .46, x0 = -half + u * half * 2, sl = x0 / Math.max(1, half);
      a.band(jit(i, 4) < .45 ? 'thatch2' : jit(i, 4) < .85 ? 'thatch3' : 'straw', lines([[x0, y0, x0 + sl * 6, y0 + 8 + jit(i, 5) * 8]]), .75);
    }
    for (let x = -42; x <= 42; x += 5) a.band('tan', lines([[x, -2, x + (x > 0 ? 2 : -2), 3]]), .8);   // straw ends at the foot
    a.key(cone, 2);
    a.fk('straw', smooth([[-9, -86], [0, -96], [9, -86], [0, -82]]), 1.4); a.band('brown', lines([[0, -94, 1, -108]]), 3); a.fk('brown', ell(1, -108, 3.4, 2), 1);
  });
  const well = part([-56, -122, 56, 10], a => {
    a.fk('brown', c4Rect(-40, -92, -31, -10), 1.8); a.fk('brown', c4Rect(31, -92, 40, -10), 1.8);
    a.fk('ash', ell(0, -12, 46, 18), 2); a.ink(ell(0, -16, 32, 10)); a.fk('teal', ell(0, -14, 28, 8), 1);
    a.fk('ash', c4Rect(-46, -28, 46, -12), 2); a.key(lines([[-30, -28, -30, -12], [-12, -28, -12, -12], [8, -28, 8, -12], [28, -28, 28, -12]]), 1.2);
    a.fk('ash', ell(0, -28, 46, 15), 2); a.ink(ell(0, -29, 32, 9)); a.fk('teal', ell(0, -27, 28, 7), 1);
    a.fk('straw', c4Poly([[-54, -88], [-36, -118], [0, -126], [36, -118], [54, -88], [30, -82], [0, -90], [-30, -82]]), 2.2); a.key(lines([[-30, -92, -22, -118], [-10, -90, -6, -122], [12, -90, 8, -122], [32, -92, 26, -118]]), 1.1);
    a.band('brown', lines([[-34, -76, 34, -76]]), 4); a.band('tan', lines([[0, -76, 0, -42]]), 2); a.fk('brown', c4Rect(-8, -44, 8, -30), 1.4);
  });
  const rock = part([-24, -26, 24, 6], a => { a.fk('ash', ell(0, -9, 20, 12), 1.6); a.fill('white', ell(-6, -14, 8, 4)); a.key(lines([[2, -4, 10, -10]]), 1); });
  const reed = part([-16, -86, 16, 6], a => {
    a.band('green', lines([[0, 0, -3, -66]]), 3.2); a.band('teal', lines([[-5, 0, -22, -50]]), 3); a.band('green', lines([[6, 0, 20, -44]]), 3);
    a.fk('brown', ell(-3, -66, 4.6, 13), 1.1);
  });
  /* a village house of the 1800s: a thick thatched roof, walls of clay and bamboo, a plank door, small windows with bamboo bars, a bench on the porch */
  const house = part([-190, -236, 190, 14], a => {                 // a northern village house: thick thatch, timber frame, mud walls, a porch
    // stone plinth and steps
    a.fk('ash', c4Rect(-140, -6, 140, 8), 1.6); a.fk('ash', c4Rect(-34, 4, 34, 13), 1.4); a.key(lines([[-100, 1, -100, 8], [-50, 1, -50, 8], [50, 1, 50, 8], [100, 1, 100, 8], [-34, 8, 34, 8]]), .8);
    // walls: cream panels in a dark frame
    a.fill('cream', c4Rect(-130, -70, 130, -6));
    for (const [x0, x1] of [[-124, -76], [76, 124]]) { a.fill('tan', c4Rect(x0 + 8, -54, x1 - 8, -24)); for (let x = x0 + 14; x < x1 - 8; x += 7) a.band('brown', lines([[x, -54, x, -24]]), 1.6); a.key(c4Rect(x0 + 8, -54, x1 - 8, -24), 1.2); }
    a.fill('tan', c4Rect(-26, -62, 26, -6)); for (const x of [-13, 13]) { a.key(c4Rect(x - 12, -60, x + 12, -8), 1); for (let y = -56; y < -12; y += 8) a.band('brown', lines([[x - 10, y, x + 10, y]]), .8); }
    for (const x of [-130, -76, -26, 26, 76, 130]) { a.fk('brown', c4Rect(x - 4, -72, x + 4, -6), 1.2); a.fill('ash', c4Rect(x - 6, -9, x + 6, -4)); }
    a.fk('brown', c4Rect(-134, -76, 134, -68), 1.2);
    for (const x of [-38, 38]) { a.fk('red', c4Rect(x - 4, -60, x + 4, -16), .8); for (let y = -55; y < -18; y += 8) a.fill('paper', c4Rect(x - 1.5, y, x + 1.5, y + 3)); }
    a.fk('red', c4Rect(-18, -76, 18, -64), .8); for (const x of [-10, -2, 6]) a.fill('paper', c4Rect(x, -73, x + 4, -67));
    a.fill('tan', c4Rect(-130, -76, 130, -66));                          // the shade under the eave
    // the thatch: a hip roof, layered rows of strands, a thick eave with straw ends, a ridge with rolled ends
    const roof = c4Poly([[-188, -70], [-104, -206], [104, -206], [188, -70]]);
    a.fill('thatch', roof);
    for (let r = 0; r < 8; r++) {                                     // layers of thatch: loose strands of different length and tone, a ragged edge under each layer
      const y = -202 + r * 17, half = 104 + (y + 206) * .62, n = Math.floor(half / 2.6);
      for (let j = 0; j < n; j++) {
        const x = -half + 4 + j * 5.2 + jit(j, r) * 3, sl = x / half, len = 13 + jit(j, r + 9) * 9, tone = jit(j, r + 17);
        a.band(tone < .45 ? 'thatch2' : tone < .8 ? 'thatch3' : 'straw', lines([[x, y + jit(j, r + 3) * 4, x + sl * 6, y + len]]), .8);
      }
      const pts = []; for (let x = -half + 4; x <= half - 4; x += 9) pts.push([x, y + 17 + Math.sin(x * .31 + r) * 1.6]);
      a.band('thatch2', smooth(pts, false), 1.3);
    }
    a.fk('thatch2', c4Poly([[-190, -72], [190, -72], [184, -60], [-184, -60]]), 1.6);
    for (let x = -184; x <= 184; x += 4) a.band(jit(x, 1) < .5 ? 'thatch' : 'tan', lines([[x, -63, x + (x > 0 ? 1.5 : -1.5), -56 + jit(x, 2) * 3]]), .9);
    a.key(roof, 2.4);
    a.fk('tan', c4Rect(-110, -214, 110, -202), 1.8); for (const sg of [-1, 1]) { a.fk('cream', smooth([[sg * 104, -216], [sg * 122, -226], [sg * 126, -214], [sg * 112, -204]]), 1.4); }
    for (let x = -96; x <= 96; x += 16) a.band('brown', lines([[x, -213, x, -203]]), 1.2);
    // things by the house: a water jar, a bench, a round tray of rice drying
    a.fk('brown', ell(-158, -16, 14, 17), 1.6); a.fill('tan', ell(-162, -24, 4, 6)); a.fk('ash', ell(-158, -31, 10, 4), 1.2);
    a.fk('tan', c4Rect(100, -24, 150, -14), 1.4); for (const x of [104, 146]) a.fk('brown', c4Rect(x - 2, -14, x + 2, -4), 1);
    a.fk('straw', ell(164, -30, 18, 18), 1.4); for (let r2 = 5; r2 < 18; r2 += 5) a.key(ell(164, -30, r2, r2), .5);
  });
  const box = part([-38, -60, 38, 6], a => {
    a.fk('straw', c4Rect(-32, -40, 32, 0), 2); a.key(lines([[-32, -27, 32, -27], [-32, -14, 32, -14]]), 1.2);
    a.fk('tan', c4Rect(-36, -50, 36, -38), 2); a.fk('red', circ(0, -22, 7), 1.2); a.key(lines([[-6, -22, 6, -22], [0, -28, 0, -16]]), 1.1);
  });
  const stallP = (label, awn, kind) => part([-130, -176, 130, 14], a => {   // an old village market stall (lều chợ): a thatched roof on bamboo poles over a bamboo platform (sạp tre), wares in flat round baskets
    // back poles, then the platform
    for (const x of [-84, 84]) { a.fill('tan', c4Rect(x - 2.5, -104, x + 2.5, -24)); }
    const sap = c4Poly([[-106, -34], [106, -34], [100, -24], [-100, -24]]);
    a.fill('thatch3', sap); for (let x = -100; x <= 100; x += 7) a.band('thatch2', lines([[x, -33, x * .95, -25]]), .6); a.key(sap, 1);
    a.fill('thatch', c4Rect(-102, -24, 102, -19)); a.key(c4Rect(-102, -24, 102, -19), .9);
    for (const x of [-94, -40, 40, 94]) { a.fill('tan', c4Rect(x - 2.5, -19, x + 2.5, 2)); a.key(c4Rect(x - 2.5, -19, x + 2.5, 2), .7); }
    a.band('tan', lines([[-94, -6, 94, -6]]), 1.6);
    // wares
    const nong = (x, w, fill, dots) => {                                // a flat round basket (nong / mẹt) with a heap on it
      a.fk('thatch', ell(x, -36, w, w * .3), .8); a.key(ell(x, -36, w * .78, w * .22), .4);
      for (let i = 0; i < 7; i++) a.band('thatch2', lines([[x - w * .9 + i * w * .3, -38, x - w * .9 + i * w * .3 + 3, -34]]), .4);
      a.fill(fill, smooth([[x - w * .7, -37], [x - w * .4, -43], [x, -45], [x + w * .45, -43], [x + w * .7, -37]]));
      if (dots) for (let i = 0; i < 9; i++) a.fill(dots, circ(x - w * .5 + (i * 7.3 % (w * 1.1)), -39 - (i % 3) * 1.6, .7));
    };
    const thung = (x, fill) => {                                        // a deep basket (thúng) of woven bamboo
      const p = smooth([[x - 12, -34], [x - 14, -50], [x + 14, -50], [x + 12, -34]]); a.fill('thatch2', p);
      for (let y = -48; y < -34; y += 4) a.band('thatch', lines([[x - 13, y, x + 13, y]]), .6); a.fk('thatch', ell(x, -50, 14, 3.4), .7); a.fill(fill, ell(x, -51, 11, 2.4)); a.key(p, .8);
    };
    const bao = (x, fill) => {                                          // a sedge sack (bao cói) tied at the neck
      const p = smooth([[x - 9, -34], [x - 11, -46], [x - 6, -56], [x + 6, -56], [x + 11, -46], [x + 9, -34]]); a.fill('cream', p);
      for (let i = -2; i <= 2; i++) a.band('thatch3', lines([[x + i * 3.5, -36, x + i * 3, -54]]), .5); a.band('bark', lines([[x - 6, -54, x + 6, -54]]), 1.2);
      a.fill(fill, ell(x, -57, 5, 1.6)); a.key(p, .8);
    };
    if (kind === 'N') { thung(-76, 'yellow'); nong(-38, 20, 'tan', 'white'); bao(-4, 'lua'); nong(30, 18, 'thatch2', 'yellow'); bao(58, 'red'); thung(84, 'paper'); for (const [x, c] of [[-20, 'lua'], [14, 'red'], [44, 'catim']]) { a.fk('cream', c4Poly([[x - 4, -34], [x + 4, -34], [x + 3, -42], [x - 3, -42]]), .5); a.fill(c, c4Rect(x - 2, -41, x + 2, -38)); } }
    if (kind === 'Q') {                                                  // a roadside food and tea stall: a charcoal stove with a pot, a clay teapot, bowls, a basket of greens
      a.fk('bark', c4Poly([[-90, -34], [-62, -34], [-66, -50], [-86, -50]]), .9); a.fill('red', ell(-76, -46, 6, 2)); a.fk('dark', ell(-76, -56, 14, 8), 1); a.fill('ash', ell(-76, -62, 12, 3)); a.fill('cream', ell(-80, -62, 4, 1));
      a.fk('bark', smooth([[-30, -34], [-38, -42], [-34, -52], [-20, -52], [-16, -42], [-22, -34]]), .9); a.band('bark', smooth([[-16, -46], [-8, -50], [-6, -44]], false), 1.4); a.fk('bark', ell(-27, -53, 6, 1.6), .6);
      for (const x of [2, 18, 34]) { a.fk('white', smooth([[x - 7, -40], [x + 7, -40], [x + 4, -34], [x - 4, -34]]), .6); a.band('blue', lines([[x - 6, -39, x + 6, -39]]), .5); }
      nong(70, 20, 'lua'); for (let i = 0; i < 6; i++) a.fill(i % 2 ? 'leafhi' : 'lua', leafP(56 + i * 5, -40, -1.57 + (i - 3) * .2, 10, 3));
    }
    if (kind === 'U') {                                                  // the buyer's stall: deep baskets of produce and a steelyard (cân đòn) hanging from the roof beam
      thung(-74, 'orange'); thung(-44, 'catim'); nong(10, 22, 'lua'); for (let i = 0; i < 6; i++) a.fill(i % 2 ? 'leafhi' : 'lua', leafP(-6 + i * 6, -40, -1.57 + (i - 3) * .2, 10, 3));
      a.band('bark', lines([[52, -100, 52, -78]]), .8); a.band('bark', lines([[30, -78, 86, -82]]), 2); a.fk('dark', circ(82, -78, 4), .6); a.band('bark', lines([[34, -78, 30, -66], [34, -78, 40, -66]]), .6); a.fk('thatch', ell(35, -65, 8, 2.4), .6); a.fk('orange', circ(35, -68, 3), .4);
      bao(70, 'thatch3');
    }
    // front poles
    for (const x of [-100, 100]) { a.fill('tan', c4Rect(x - 3.5, -112, x + 3.5, 2)); a.fill('thatch3', c4Rect(x, -112, x + 2, 2)); a.key(c4Rect(x - 3.5, -112, x + 3.5, 2), .9); for (let y = -96; y < 0; y += 26) a.band('bark', lines([[x - 4, y, x + 4, y]]), 1); }
    // the thatched roof: layered strands, a thick eave, a bamboo ridge pole
    const roof = c4Poly([[-128, -98], [-96, -150], [96, -150], [128, -98]]);
    a.fill('thatch', roof);
    for (let r = 0; r < 4; r++) {
      const y = -148 + r * 13, half = 96 + (y + 150) * .62, n = Math.floor(half / 2.6);
      for (let j = 0; j < n; j++) { const x = -half + 4 + j * 5.2 + jit(j, r + 40) * 3, sl = x / half, len = 10 + jit(j, r + 49) * 7, tone = jit(j, r + 57); a.band(tone < .45 ? 'thatch2' : tone < .8 ? 'thatch3' : 'straw', lines([[x, y + jit(j, r + 43) * 3, x + sl * 5, y + len]]), .8); }
      const pts = []; for (let x = -half + 4; x <= half - 4; x += 9) pts.push([x, y + 13 + Math.sin(x * .31 + r) * 1.4]); a.band('thatch2', smooth(pts, false), 1.1);
    }
    a.fk('thatch2', c4Poly([[-130, -100], [130, -100], [125, -91], [-125, -91]]), 1.2); for (let x = -125; x <= 125; x += 4) a.band(jit(x, 41) < .5 ? 'thatch' : 'tan', lines([[x, -93, x + (x > 0 ? 1.4 : -1.4), -87 + jit(x, 42) * 3]]), .8);
    a.key(roof, 1.6); a.fk('tan', c4Rect(-102, -155, 102, -148), 1.1); for (let x = -90; x <= 90; x += 18) a.band('bark', lines([[x, -155, x, -148]]), .9);
    // a small hand-painted board hung under the eave
    a.band('bark', lines([[-30, -91, -34, -80], [30, -91, 34, -80]]), .8); a.fk('bark', c4Rect(-44, -82, 44, -64), 1.2); a.fill('thatch3', c4Rect(-40, -79, 40, -67)); a.text(label, 0, -73, 11, null, '"Playfair Display", serif', 'ink', '900');
  });
  const dan = part([-44, -132, 44, 8], a => {                       // a bamboo trellis: two poles, a top bar, rungs and a cross-lashed lattice
    a.fk('tan', c4Rect(-32, -96, -28, 2), .9); a.fk('tan', c4Rect(28, -96, 32, 2), .9); a.fk('tan', c4Rect(-35, -99, 35, -95), .9);
    a.band('straw', lines([[-30, -24, 30, -24], [-30, -50, 30, -50], [-30, -74, 30, -74], [-30, -4, 30, -60], [30, -4, -30, -60], [-30, -46, 30, -96], [30, -46, -30, -96]]), 1.1);
    for (const y of [-24, -50, -74]) { a.fill('straw', circ(-30, y, 2.4)); a.fill('straw', circ(30, y, 2.4)); }
  });
  const stalls = { N: stallP('HẠT GIỐNG', 'red', 'N'), Q: stallP('QUÁN ĂN', 'orange', 'Q'), U: stallP('THU MUA', 'teal', 'U'), T: stallP('HÀNG NƯỚC', 'teal', 'Q') };
  /* grass: tapered blades (wide at the foot, curving to a point), dark and light greens, a lit edge on the light ones */
  const blade = (a, x, h, lean, w, pl) => {
    const p = new Path2D(); p.moveTo(x - w, 0); p.quadraticCurveTo(x - w * .3 + lean * .25, -h * .6, x + lean, -h); p.quadraticCurveTo(x + w * .5 + lean * .3, -h * .55, x + w, 0); p.closePath();
    a.fk(pl, p, .85); if (pl !== 'teal') a.band(pl === 'green' ? 'leafhi' : 'grass2', smooth([[x + w * .2, -2], [x + w * .1 + lean * .3, -h * .55], [x + lean * .92, -h * .94]], false), .9);
  };
  const tuft = [
    [[-7, 13, -5, 2.6, 'green'], [-1, 18, 2, 3, 'lua'], [6, 12, 6, 2.4, 'green']],
    [[-10, 14, -8, 2.6, 'teal'], [-3, 20, -2, 3, 'green'], [3, 22, 4, 3, 'lua'], [9, 13, 9, 2.4, 'green']],
    [[-11, 11, -10, 2.4, 'lua'], [-5, 18, -4, 2.8, 'green'], [1, 15, 3, 2.6, 'teal'], [7, 20, 8, 2.8, 'lua'], [12, 10, 12, 2.2, 'green']],
  ].map(bl => part([-24, -28, 24, 4], a => { for (const [x, h, l, w, pl] of bl) blade(a, x, h, l, w, pl); }));
  const clump = part([-34, -56, 34, 4], a => {
    for (const [x, h, l, w, pl] of [[-18, 24, -14, 3, 'teal'], [-10, 36, -10, 3.4, 'green'], [-4, 44, -3, 3.4, 'lua'], [3, 40, 6, 3.4, 'green'], [10, 34, 14, 3.2, 'lua'], [17, 22, 18, 3, 'teal'], [-14, 16, -20, 2.6, 'lua'], [14, 15, 22, 2.6, 'green']]) blade(a, x, h, l, w, pl);
    for (const [x, y, r] of [[-12, -42, -.5], [10, -40, .45], [-2, -50, 0]]) { a.band('straw', lines([[x * .5, -26, x, y + 6]]), 1.1); a.fk('straw', ell(x, y, 2.4, 6, r), .8); }
  });
  const flower = ['red', 'yellow', 'white', 'pink', 'orange'].map(c => part([-14, -34, 14, 4], a => { a.band('green', lines([[0, 0, 0, -18]]), 2.4); a.band('green', lines([[0, -6, 7, -12]]), 2); for (let i = 0; i < 5; i++) a.fk(c, circ(Math.cos(i * 1.257) * 5.4, -21 + Math.sin(i * 1.257) * 5.4, 4), .9); a.fk('yellow', circ(0, -21, 2.8), .8); }));
  const soil = ['tan', 'brown'].map(pl => part([-34, -34, 34, 34], a => { a.fill(pl, c4Poly([[-33, -24], [-24, -33], [24, -33], [33, -24], [33, 24], [24, 33], [-24, 33], [-33, 24]])); a.key(lines([[-26, -19, 26, -19], [-26, -1, 26, -1], [-26, 17, 26, 17]]), 1.5); }));
  const T3 = c11Trees3();                                            // trees, bamboo and bushes with volume (cay.js) replace the flat prints
  return (C11ART = { hay, well, crop: C, trees: T3.trees, bamboo: T3.bamboo, bush: T3.bush, rock, reed, house, box, dan, stall: stalls.N, stalls, tuft, clump, flower, soil });
}
const c11Spr = (g, p, x, y, k) => g.drawImage(p.c, x + p.x0 * k, y + p.y0 * k, p.w * k, p.h * k);
/* wind: a wave that travels across the farm, with slow gusts and a quick flutter (about -1..1) */
const c11Wind = (x, y) => Math.sin(C11.t * 1.4 - x * .45 + y * .15) * .55 + Math.sin(C11.t * .45 - x * .12) * .35 + Math.sin(C11.t * 3.7 + x * .8 + y * .6) * .1;
/* grass, flowers, crops: shear about the foot, a > 0 leans to the right */
function c11Lean(g, p, x, y, k, a) { g.save(); g.translate(x, y); g.transform(1, 0, -a, 1, 0, 0); g.drawImage(p.c, p.x0 * k, p.y0 * k, p.w * k, p.h * k); g.restore(); }
/* crowns: turn about a pivot py (negative = above the foot) */
function c11Sway(g, p, x, y, k, a, py) { g.save(); g.translate(x, y + py * k); g.rotate(a); g.drawImage(p.c, p.x0 * k, (p.y0 - py) * k, p.w * k, p.h * k); g.restore(); }
const c11Shade = (g, x, y, rx, ry, al = .24) => { g.fillStyle = `rgba(22,46,34,${al})`; g.beginPath(); g.ellipse(x + rx * .22, y, rx, ry, 0, 0, 6.283); g.fill(); };
const c11Eve = () => Math.max(0, Math.min(1, (SAVE11.mins - 16.5 * 60) / (5.5 * 60)));
const C11_TREE_AT = C11_AREAS.ruong.treeAt = { '1,3': 'dao', '1,8': 'xoai', '1,11': 'bamboo', '13,8': 'willow', '12,13': 'banana', '13,11': 'xoai', '17,3': 'cau', '18,2': 'dua', '9,2': 'dao', '10,3': 'xoai' };
function c11TreeType(x, y) {
  const s = (C11_AR.treeAt || {})[x + ',' + y]; if (s) return s;
  const h = c11Hash(x, y, 5);
  if (C11_AR.id === 'rung') return h < .42 ? 'bamboo' : h < .58 ? 'phuong' : h < .72 ? 'xoai' : h < .82 ? 'cau' : h < .92 ? 'phuong' : 'dao';
  return h < .16 ? 'xoai' : h < .28 ? 'dao' : h < .38 ? 'xoai' : h < .5 ? 'cau' : h < .62 ? 'bamboo' : h < .7 ? 'banana' : h < .8 ? 'dao' : h < .9 ? 'phuong' : 'dua';
}

/* the ground is painted once: mottled grass, forest floor, a lane, the field's earth, the pond with its sand and stones. Soft edges
   come from blobs (a circle on every tile of a kind), not from tile squares. */
const C11BGS = {};
const C11_S = 56, C11_PAD = 2;
function c11Bg() {
  if (C11BGS[C11_AR.id]) return C11BGS[C11_AR.id];
  const S = C11_S, P = C11_PAD, w = (C11_W + P * 2) * S, h = (C11_H + P * 2) * S, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), rnd = mulberry(0x9a11), at = (x, y) => [(x + P + .5) * S, (y + P + .5) * S];
  const tiles = kd => { const o = []; for (let y = -P; y < C11_H + P; y++) for (let x = -P; x < C11_W + P; x++) if (c11Kind(x, y) === kd) o.push([x, y]); return o; };
  const disc = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); };
  const blob = (kd, r, edge, fill, ow = 3) => {
    const L = tiles(kd).map(([x, y]) => { const [px, py] = at(x, y); return [px, py, r * S * (.94 + c11Hash(x, y, 31) * .12)]; });
    for (const [px, py, rr] of L) disc(px, py, rr + ow, edge);
    for (const [px, py, rr] of L) disc(px, py, rr, fill);
    return L;
  };
  g.fillStyle = '#8bc65a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {                                    // soft uneven patches of lighter and darker grass, never round
    const x = rnd() * w, y = rnd() * h, r = 24 + rnd() * 60, light = rnd() < .55, sx = 1 + rnd() * 1.8, rot = rnd() * 3.14;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, .45 + rnd() * .3);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, light ? 'rgba(176,206,120,.34)' : 'rgba(86,130,82,.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
  }
  g.lineCap = 'round'; g.lineWidth = 1.7;
  c11BgGrass(g, w, h, rnd);                                         // a carpet of short shaded blades (co.js)
  // the forest floor under the border trees, darker and lumpy
  for (const [x, y] of tiles('t')) { const [px, py] = at(x, y), rr = S * (1.1 + c11Hash(x, y, 33) * .5), gr = g.createRadialGradient(px, py, rr * .2, px, py, rr); gr.addColorStop(0, 'rgba(84,128,78,.5)'); gr.addColorStop(1, 'rgba(84,128,78,0)'); g.fillStyle = gr; g.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
  for (const [x, y] of tiles('t')) { const [px, py] = at(x, y); if (c11Hash(x, y, 34) < .6) { g.fillStyle = 'rgba(40,84,52,.35)'; g.beginPath(); g.ellipse(px + (c11Hash(x, y, 35) - .5) * S, py + S * .2, S * .4, S * .16, 0, 0, 6.283); g.fill(); } }
  // soft shapes: discs on every tile, blurred, then cut at a few levels (sand / ink edge / fill) so the outline is smooth, not scalloped
  const soft = (list, r, layers, blur = 17) => {
    if (!list.length) return;
    const m = document.createElement('canvas'); m.width = w; m.height = h; const mg = m.getContext('2d'); mg.filter = `blur(${blur}px)`; mg.fillStyle = '#fff';
    for (const [x, y] of list) { const [px, py] = at(x, y); mg.beginPath(); mg.arc(px, py, S * r, 0, 6.283); mg.fill(); }
    const id = mg.getImageData(0, 0, w, h), d = id.data, o = new Uint8ClampedArray(d.length);
    for (let i = 3; i < d.length; i += 4) { const v = d[i]; for (const [t, rgb] of layers) if (v >= t) { o[i - 3] = rgb[0]; o[i - 2] = rgb[1]; o[i - 1] = rgb[2]; o[i] = 255; break; } }
    const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').putImageData(new ImageData(o, w, h), 0, 0); g.drawImage(c2, 0, 0);
  };
  // the lane: one wide soft stroke along its middle, so it winds like a track
  const lane = list => {
    g.lineCap = g.lineJoin = 'round';
    for (const [col, add] of [['rgba(91,47,31,.8)', 5], ['#dcc088', 0]]) for (const [pts, wd] of list) {
      g.strokeStyle = col; g.lineWidth = S * wd + add; g.beginPath(); g.moveTo(...at(pts[0][0], pts[0][1]));
      for (let i = 1; i < pts.length - 1; i++) { const [ax, ay] = at(pts[i][0], pts[i][1]), [bx, by] = at(pts[i + 1][0], pts[i + 1][1]); g.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2); }
      g.lineTo(...at(pts[pts.length - 1][0], pts[pts.length - 1][1])); g.stroke();
    }
  };
  c11BgLane(g, C11_AR.lane, at, S, w, h, rnd, tiles('p').map(([x, y]) => at(x, y)));   // a worn dirt track sunk into the turf (nen.js)
  c11BgYard(g, tiles, at, S, rnd); c11BgFields(g, tiles, at, S, rnd);
  // the field's earth
  const ft = tiles('f');
  soft(ft, .8, [[125, [218, 168, 88]], [95, [150, 98, 48]]]);
  for (const [x, y] of ft) { const [px, py] = at(x, y); for (let i = 0; i < 14; i++) { const a = rnd() * 6.283, dd = rnd() * S * .5; disc(px + Math.cos(a) * dd, py + Math.sin(a) * dd, 1.2 + rnd() * 1.8, rnd() < .5 ? '#b98a46' : rnd() < .5 ? '#ecca8a' : '#a47638'); }
    for (let i = 0; i < 1; i++) { const x2 = px + (rnd() - .5) * S * .8, y2 = py + (rnd() - .5) * S * .8; g.strokeStyle = rnd() < .75 ? 'rgba(0,0,0,0)' : 'rgba(70,120,60,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 3, y2 - 7); g.moveTo(x2, y2); g.lineTo(x2 + 3, y2 - 6); g.stroke(); }
    if (rnd() < .5) { g.strokeStyle = 'rgba(110,76,44,.35)'; g.lineWidth = 2; const x2 = px + (rnd() - .5) * S * .6, y2 = py + (rnd() - .5) * S * .6; g.beginPath(); g.moveTo(x2 - 9, y2); g.quadraticCurveTo(x2, y2 - 3, x2 + 9, y2); g.stroke(); } }
  g.strokeStyle = 'rgba(91,47,31,.13)'; g.lineWidth = 1.6;
  for (const [x, y] of ft) if (c11Kind(x - 1, y) === 'f' && c11Kind(x, y - 1) === 'f') { const px = (x + P) * S, py = (y + P) * S; g.beginPath(); g.moveTo(px - 5, py); g.lineTo(px + 5, py); g.moveTo(px, py - 5); g.lineTo(px, py + 5); g.stroke(); }
  // the pond: a sandy bank, an ink edge, clear shallow water where the bottom shows, deeper and bluer towards the middle
  const wt = tiles('w').concat(tiles('b')), isW = (x, y) => 'wb'.includes(c11Kind(x, y)), inner = wt.filter(([x, y]) => C11_D4.every(([dx, dy]) => isW(x + dx, y + dy)));
  const core = inner.filter(([x, y]) => [[2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, 1], [1, -1], [-1, -1]].every(([dx, dy]) => isW(x + dx, y + dy)));
  c11BgWater(g, wt, at, S, w, h, rnd);                                // depth, wet sand, the bank's shadow, a sheen of sky (nen.js)
  if (wt.length) {                                                    // pebbles seen through the clear shallow rim
    const clip = new Path2D(); for (const [x, y] of wt) { const [px, py] = at(x, y); clip.moveTo(px + S * .8, py); clip.arc(px, py, S * .8, 0, 6.283); }
    g.save(); g.clip(clip);
    for (const [x, y] of wt) if (!inner.some(([a2, b2]) => a2 === x && b2 === y)) { const [px, py] = at(x, y); for (let i = 0; i < 4; i++) c11Pebble(g, px + (rnd() - .5) * S * .9, py + (rnd() - .5) * S * .8, 2.5 + rnd() * 3.5, 2 + rnd() * 2, rnd(), 44, 14, 56, .45); }
    g.restore();
  }
  c11BgPlanks(g, tiles, at, S);
  // stones along the shore
  for (const [x, y] of tiles('g')) {
    const dir = C11_D4.find(([dx, dy]) => c11Kind(x + dx, y + dy) === 'w');
    if (dir && c11Hash(x, y, 38) < .55) { const [px, py] = at(x, y); for (let i = 0; i < 2; i++) { const sx = px + dir[0] * S * .46 + (rnd() - .5) * S * .5, sy = py + dir[1] * S * .46 + (rnd() - .5) * S * .5; c11Pebble(g, sx, sy, 7 + rnd() * 4, 5 + rnd() * 2, (rnd() - .5) * .5, 40, 7, 60 + rnd() * 8); } }
  }
  return (C11BGS[C11_AR.id] = c);
}

/* ---------- the folk ---------- */
function c11Folk() { C11.sellers = {}; C11.vill = []; C11.seller = null; c11VillEnter(); }   // the villagers and stall keepers present now (langxa.js); nobody at home
function c11Mouse(g, p, x, y, face, ph, moving, s, arm) {
  c4Mouse(g, c4MouseRig(p.sort), x, face, ph, moving, arm, null, s, y, p.n || 0);
  if (C4_MOUSE_SORTS[p.sort].non) { g.save(); g.translate(x, y); g.scale(face * s, s); c4Non(g); g.restore(); }
}

/* ---------- game ---------- */
function startC11() {
  trackEnter('chuong-11');
  AU.init(); hideChapterHuds(); AU.setQuiet(true);     // no music at all in chương IX (owner: "bỏ cái nhạc nền trống kèn"); hush it after hiding the others, whose hide() may wake it
  S.chapter = 11; S.mode = 'c11play';
  PAPER = getPaper('sage'); document.documentElement.style.setProperty('--paper', PAPERS.sage.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  c11Enter('ruong', 4.5, 6.5, true); c11Art(); c11Bg();
  if (/c11demo/.test(location.search)) c11Demo();
  C11.bf = ['#f2a23a', '#f4f0e0', '#f27a9c', '#8cc4f0', '#f2d44a'].map((col, i) => ({ x: 5 + i * 2.6, y: 7 + (i % 3) * 2, tx: 5 + i * 2.6, ty: 7, ph: i * 2.1, col, wait: 0 }));
  for (const d of SAVE11.drops) d.t = d.dur;
  Object.assign(C11, { ready: true, fainted: false, late: false, passed: false, warnLate: false, faintMsg: null, go: null, pend: null, swing: 0, shake: null, fall: null, keys: {}, fx: [], say: null, sleep: null, kbd: false, msg: null, hl: null, menu: null, fade: null });
  cv.focus();
  c11TrialNotice();
}
/* Trial notice (owner 2026-10-28): shown each time the chapter is entered; the game waits behind it. */
function c11TrialNotice() {
  if (document.getElementById('c11trial')) return;
  const d = document.createElement('div'); d.id = 'c11trial';
  d.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(29,25,21,.55);padding:16px';
  d.innerHTML = '<div style="max-width:380px;background:#f4ecd6;border:3px solid #1d1915;border-radius:10px;padding:20px 22px;text-align:center;box-shadow:5px 5px 0 #1d1915;font-family:Be Vietnam Pro,sans-serif;color:#1d1915">'
    + '<div style="font:700 22px Playfair Display,serif;margin-bottom:8px">Đang thử nghiệm</div>'
    + '<p style="margin:0 0 8px;font-size:15px;line-height:1.5">Chương này chưa chơi được. Bạn chỉ vào <b>khám phá</b> làng Vũ Đại thôi: đi lại, ngắm cảnh, làm quen dân làng.</p>'
    + '<p style="margin:0 0 14px;font-size:13px;opacity:.75;line-height:1.45">Tiền ở đây tính riêng, bắt đầu từ 0, không dính tới các chương khác.</p>'
    + '<button style="font:700 16px Be Vietnam Pro,sans-serif;background:#c0392b;color:#fff;border:2px solid #1d1915;border-radius:8px;padding:9px 22px;cursor:pointer">Vào khám phá</button></div>';
  d.querySelector('button').onclick = () => { d.remove(); cv.focus(); };
  document.body.appendChild(d);
}
function c11Enter(id, x, y, quiet) {
  const a = C11_AREAS[id]; C11_AR = a; C11_MAP = a.map; C11_W = a.map[0].length; C11_H = a.map.length;
  Object.assign(C11, { area: id, px: x, py: y, go: null, pend: null, fx: [], say: null, chats: [], mut: [], menu: null, shake: null, fall: null });
  c11Folk(); c11Beasts(); if (id === 'rung') c11ForageSpawn();
  if (!quiet) c11Msg(a.name, '#2f6a4c');
}
const C11_BEASTS = { ruong: [['ga', 5.5, 7.5, '#c119a5a'], ['ga', 6.5, 7.8, '#f2ecde'], ['ga', 3.5, 7.6, '#8a5a3a'], ['trong', 7.5, 7.5], ['lon', 17.5, 13.4], ['bo', 13.5, 13.4], ['trau', 9.5, 10.8], ['cho', 9.5, 6.6], ['meo', 9.5, 4.6]],
  cho: [['ngua', 7.5, 8.4], ['bo', 12.5, 8.4], ['trau', 16.5, 8.4], ['ga', 9.5, 13.4, '#c119a5a'], ['trong', 11.5, 13.5], ['cho', 14.5, 8.4], ['meo', 6.5, 5.6]], rung: [] };
function c11Beasts() { C11.beasts = (C11_BEASTS[C11.area] || []).map(([kind, x, y, col, pen], i) => ({ kind, x, y, col, pen, face: i % 2 ? -1 : 1, ph: 0, moving: false, to: null, wait: 1 + i, dn: 0, peck: 0 })); }
function c11GoArea(id, x, y) { if (C11.fade) return; C11.go = null; C11.pend = null; C11.keys = {}; C11.fade = { t: 0, did: false, id, x, y }; }
function c11ForageSpawn() {                                           // each morning the wood has new mushrooms, greens and berries lying about
  if (SAVE11.forageDay === SAVE11.day) return; SAVE11.forageDay = SAVE11.day;
  SAVE11.drops = SAVE11.drops.filter(d => !(d.a === 'rung' && d.f));
  const cells = []; for (let y = 2; y < C11_H - 1; y++) for (let x = 1; x < C11_W - 1; x++) if (C11_MAP[y][x] === 'g') cells.push([x, y]);
  const kinds = ['nam', 'nam', 'rau', 'qua', 'rau', 'qua', 'nam', 'qua'];
  for (const k of kinds) { if (!cells.length) break; const [x, y] = cells.splice((Math.random() * cells.length) | 0, 1)[0]; SAVE11.drops.push({ k, a: 'rung', f: 1, x: x + .5, y: y + .7, x0: x + .5, y0: y + .7, t: .01, dur: .01, h: 0 }); }
}
function c11Demo() {                                                 // ?c11demo: every crop in every stage on the field (nothing is saved)
  C11.demo = true; SAVE11.tiles = {}; SAVE11.hits = {}; SAVE11.clear = {}; SAVE11.stamina = 100; SAVE11.hp = 100;
  const ids = Object.keys(C11_CROPS), cells = []; for (let y = 8; y <= 13; y++) for (let x = 3; x <= 11; x++) if (c11Field(x, y)) cells.push([x, y]);
  cells.forEach(([x, y], i) => { const id = ids[Math.floor(i / 4)]; SAVE11.clear[x + ',' + y] = 1; if (id) SAVE11.tiles[x + ',' + y] = { soil: 1, dan: C11_CROPS[id].dan ? 1 : 0, wet: 0, crop: id, age: (i % 4) * C11_CROPS[id].days / 3 + .01 }; });
}
function c11Hide() { persist11(); C11.keys = {}; }                // the next chapter starts its own song; the menus are hushed by the hub
const c11Stage = s => { const d = C11_CROPS[s.crop].days; return Math.min(3, Math.floor(s.age * 3 / d)); };
const c11Add = (id, n = 1) => c11Put(SAVE11.bag, id, n);                // what did not fit is returned
const c11Count = id => SAVE11.bag.reduce((t, sl) => t + (sl && sl.id === id ? sl.n : 0), 0);
function c11Take(id, n = 1) { if (c11Count(id) < n) return false; for (let i = SAVE11.bag.length - 1; i >= 0 && n; i--) { const sl = SAVE11.bag[i]; if (sl && sl.id === id) { const k = Math.min(n, sl.n); sl.n -= k; n -= k; if (!sl.n) SAVE11.bag[i] = null; } } return true; }
/* the tools in the bar: only those you own, as indices into C11_SLOTS (the rest are found by talking to people) */
const c11OwnSlots = () => C11_SLOTS.map((t, i) => i).filter(i => typeof c11Has !== 'function' || c11Has(C11_SLOTS[i]));
const c11HandSlot = () => C11.slot >= C11_SLOTS.length ? C11.slot - C11_SLOTS.length : -1;
const c11HandItem = () => { const i = c11HandSlot(); return i >= 0 ? SAVE11.bag[i] : null; };
const c11HandTool = () => { if (C11.slot < C11_SLOTS.length) return c11Has(C11_SLOTS[C11.slot]) ? C11_SLOTS[C11.slot] : 'none'; const it = c11HandItem(); return it && C11_ITEMS[it.id].cat === 'hat' ? 'seed' : 'item'; };
const c11Pre = () => C11_AR.id === 'ruong' ? '' : C11_AR.id + ':';
const c11Tile = () => [Math.floor(C11.px), Math.floor(C11.py - .01)];
function c11Msg(text, col = '#a3332a') { C11.msg = { text, t: 0, col }; }
function c11Pop(tx, ty, text, col) { C11.fx.push({ k: 'text', x: tx + .5, y: ty + .2, text, col, life: 1.1, t: 0 }); }
function c11Drop(kind, n, tx, ty) {                // things burst out of a tree or a plant and lie on the ground until the mouse walks over them
  for (let i = 0; i < n; i++) {
    let lx = tx + .5, ly = ty + 1.1;
    for (let tr = 0; tr < 12; tr++) { const a = Math.random() * 6.283, r = .45 + Math.random() * .55, x = tx + .5 + Math.cos(a) * r, y = ty + .6 + Math.sin(a) * r * .8; if (!c11Blocked(Math.floor(x), Math.floor(y - .01)) && x > .6 && x < C11_W - .6) { lx = x; ly = y; break; } }
    SAVE11.drops.push({ k: kind, a: C11.area, x: lx, y: ly, x0: tx + .5, y0: ty + .5, t: 0, dur: .45 + Math.random() * .2, h: .8 + Math.random() * .8 });
  }
}
function c11Chips(tx, ty, dir, n = 7, green = false) {          // wood splinters and a few leaves flying away from the axe, not dust
  for (let i = 0; i < n; i++) C11.fx.push({ k: 'chip', x: tx + .5 - dir * .3, y: ty + .55, vx: -dir * (.8 + Math.random() * 2.2), vy: -(1.4 + Math.random() * 2), rot: Math.random() * 6, vr: (Math.random() - .5) * 16, col: green ? ['#6fa54c', '#9bc45e', '#4f8a3e'][i % 3] : ['#e6c48c', '#c89a5e', '#a06a3c'][i % 3], leaf: green || i % 4 === 3, life: .7 + Math.random() * .4, t: 0, r: 3 + Math.random() * 3 });
}
function c11Dots(tx, ty, col, n = 8, up = 1) { for (let i = 0; i < n; i++) C11.fx.push({ k: 'dot', x: tx + .5, y: ty + .55, vx: (Math.random() - .5) * 2.4, vy: -(.8 + Math.random() * 1.8) * up, col, life: .5 + Math.random() * .3, t: 0, r: 2 + Math.random() * 2 }); }
const c11Money = () => c4Money(SAVE11.money);

function c11Act(tx, ty) {
  let k = c11Kind(tx, ty); const tool = c11HandTool(), key = c11Pre() + tx + ',' + ty;
  if (c11ActNew(tx, ty, tool, k, key)) return;                         // nghe.js: animals, fishing, digging, building
  if (k === 'S') { const st = C11_AR.stalls.find(q => tx >= q.x0 && tx <= q.x0 + 2 && ty >= q.by - 3 && ty <= q.by - 1); k = st ? st.kind : 'N'; }
  if (k === 'D') { C11.go = null; if (SAVE11.mins >= 24 * 60) C11.late = true; c11StartSleep(false); return; }
  if (k === 'C') { c11OpenChest(); return; }
  if (k === 'B') { c11OpenSell('Thùng bán hàng', 1, 'Thương lái tối nay sẽ ghé lấy'); return; }
  if ('UQNT'.includes(k) && !C11.sellers[k]) { c11Msg('Quán đóng cửa rồi, mai quay lại nhé', '#5b2f1f'); return; }
  if ('UQNT'.includes(k) && (C11.sellers[k].wait = C11.sellers[k].wait || 0, c11QuestTalk(C11.sellers[k]))) return;      // a stall keeper is a villager too: a job to hand in to them (or one they ask for) comes before the shop
  if (k === 'U') { C11.say = { who: C11.sellers.U, text: 'Đưa đây xem nào, hàng tốt tôi trả cao hơn thùng gỗ nhà bạn.', t: 0 }; c11OpenSell('Thu mua', 1.25, 'Giá cao hơn thùng bán ở nhà một phần tư'); return; }
  if (k === 'Q') { c11OpenFood(); return; }
  if (k === 'N') { C11.say = { who: C11.sellers.N, text: 'Chọn hạt đi nào, giống nhà tôi nảy mầm tốt lắm.', t: 0 }; c11OpenShop(); return; }
  if (k === 'T') { C11.say = { who: C11.sellers.T, text: 'Ngồi xuống đây, bát nước chè nóng đây anh.', t: 0 }; c11OpenTea(); return; }
  if (k === 'Y') { c11OpenBoard(); return; }
  if (k === 'Z') { c11Sfx.thump && c11Sfx.thump(); c11Pop(tx, ty - 1.5, 'Tùng!', '#a3332a'); return; }
  if (k === 't') {
    if (tool !== 'axe') return;
    if (SAVE11.gone[key]) return;
    c11Spend(C11_COST.axe);
    const stump = !!SAVE11.cut[key], hk = (stump ? 's' : '') + key, h = (SAVE11.hits[hk] || 0) + 1; SAVE11.hits[hk] = h;
    c11Sfx.thump && c11Sfx.thump(); c11Chips(tx, ty - (stump ? .1 : .5), tx + .5 < C11.px ? -1 : 1, stump ? 6 : 8); if (!stump) C11.shake = { key, t: 0 };
    if (!stump && h >= 10) { delete SAVE11.hits[hk]; SAVE11.cut[key] = SAVE11.day; c11Drop('go', 3, tx, ty); C11.fall = { key, t: 0, dir: tx + .5 < C11.px ? -1 : 1 }; c11Sfx.pluck && c11Sfx.pluck(); c11Chips(tx, ty - .6, tx + .5 < C11.px ? -1 : 1, 14); c11Pop(tx, ty - 1, 'Gỗ văng ra, nhặt đi', '#8a5a38'); }
    else if (stump && h >= 6) { delete SAVE11.hits[hk]; delete SAVE11.cut[key]; SAVE11.gone[key] = SAVE11.day; c11Drop('go', 2, tx, ty); c11Sfx.pluck && c11Sfx.pluck(); c11Chips(tx, ty - .1, tx + .5 < C11.px ? -1 : 1, 12); c11Pop(tx, ty - 1, 'Gỗ văng ra', '#8a5a38'); }
    return;
  }
  if (k === 'w' || k === 'K') { if (tool === 'can') { if (SAVE11.water >= 10) return; SAVE11.water = 10; c11Sfx.plop && c11Sfx.plop(); c11Dots(tx, ty, '#7fb0c4', 10); c11Pop(tx, ty - 1, 'Đầy nước', '#2f5f8f'); } return; }
  if (!c11Field(tx, ty)) return;
  let s = SAVE11.tiles[key];
  if (s && s.dead) { s.crop = null; s.dead = 0; s.age = 0; c11Spend(C11_COST.sickle); c11Dots(tx, ty, '#8a6a3a', 8, 1.2); c11Pop(tx, ty - 1, 'Dọn cây chết', '#5b2f1f'); return; }   // a dead plant is pulled up, the soil stays
  if (s && s.crop && c11Stage(s) === 3) { const c = s.crop; c11Drop(c, 1, tx, ty); if (C11_CROPS[c].dan) s.age = Math.ceil(C11_CROPS[c].days * 2 / 3); else { s.crop = null; s.age = 0; } c11Sfx.tap(); c11Dots(tx, ty, C11_CROPS[c].col, 8, 1.4); return; }
  const cleared = !!(SAVE11.clear[key] || s);
  if (tool === 'sickle') {
    if (cleared) { if (!s) c11Pop(tx, ty - 1, 'Cỏ sạch rồi, cuốc đi', '#5b2f1f'); return; }
    c11Spend(C11_COST.sickle); const hk = 'c' + key, h = (SAVE11.hits[hk] || 0) + 1; c11Sfx.tap && c11Sfx.tap();
    c11Chips(tx, ty - .1, C11.face * -1, 6, true);
    if (h >= 3) { delete SAVE11.hits[hk]; SAVE11.clear[key] = SAVE11.day; c11Drop('co', 1, tx, ty); c11Chips(tx, ty - .2, C11.face * -1, 10, true); } else SAVE11.hits[hk] = h;
    return;
  }
  if (tool === 'hoe') {
    if (!cleared) { c11Pop(tx, ty - 1, 'Cắt cỏ trước đã', '#5b2f1f'); return; }
    if (s) { c11Pop(tx, ty - 1, s.dan ? 'Đây là giàn, không cần cuốc' : s.crop ? 'Đừng cuốc cây' : 'Đất đã cuốc rồi', '#5b2f1f'); return; }
    const hk = 'h' + key, need = c11Hash(tx, ty, 61) < .5 ? 4 : 5, h = (SAVE11.hits[hk] || 0) + 1; c11Spend(C11_COST.hoe); c11Sfx.thump && c11Sfx.thump();
    if (h < need) { SAVE11.hits[hk] = h; c11Dots(tx, ty, '#7a4a28', 4); return; }
    delete SAVE11.hits[hk]; SAVE11.tiles[key] = { soil: 1, wet: 0, crop: null, age: 0 }; c11Dots(tx, ty, '#7a4a28', 9);
  } else if (tool === 'can') {
    if (!s) return; if (s.wet) return;
    if (SAVE11.water <= 0) { c11Pop(tx, ty - 1, 'Hết nước, ra ao múc', '#2f5f8f'); return; }
    s.wet = 1; SAVE11.water--; c11Spend(C11_COST.can); c11Sfx.plop && c11Sfx.plop(); c11Dots(tx, ty, '#7fb0c4', 9, .6);
  } else if (tool === 'dan') {
    if (s) { c11Pop(tx, ty - 1, s.dan ? 'Đã có giàn rồi' : 'Đất đã cuốc, bắc giàn chỗ cỏ sạch', '#5b2f1f'); return; }
    if (!cleared) { c11Pop(tx, ty - 1, 'Cắt cỏ trước đã', '#5b2f1f'); return; }
    if (!c11Take('go', C11_DAN_WOOD)) { c11Pop(tx, ty - 1, `Cần ${C11_DAN_WOOD} gỗ trong túi để bắc giàn`, '#5b2f1f'); return; }
    c11Spend(C11_COST.dan); SAVE11.tiles[key] = { dan: 1, wet: 0, crop: null, age: 0 }; c11Sfx.thump && c11Sfx.thump(); c11Dots(tx, ty, '#c89a5e', 8); c11Chips(tx, ty - .3, C11.face * -1, 8);
  } else if (tool === 'seed') {
    const it = c11HandItem(), cid = it ? it.id.slice(2) : '', cs = C11_CROPS[cid]; if (!cs) return;
    if (cs.dan) { if (!s || !s.dan) { c11Pop(tx, ty - 1, 'Cây leo: bắc giàn rồi gieo hạt vào gốc giàn', '#5b2f1f'); return; } }
    else { if (!s) { c11Pop(tx, ty - 1, 'Cuốc đất trước đã', '#5b2f1f'); return; } if (s.dan) { c11Pop(tx, ty - 1, 'Giàn chỉ dành cho cây leo', '#5b2f1f'); return; } }
    if (s.crop) return;
    c11Spend(C11_COST.seed); c11Take(it.id, 1); s.crop = cid; s.age = 0; c11Sfx.tap(); c11Dots(tx, ty, '#2f6a4c', 5, .8);
  }
}
function c11Spend(n) {
  const was = SAVE11.stamina; SAVE11.stamina = Math.max(C11_FAINT, was - n);
  if (SAVE11.hp === undefined) SAVE11.hp = 100;
  if (was <= 0) { SAVE11.hp = Math.max(0, SAVE11.hp - n * 2); C11.hurt = .5; }   // working past exhaustion wears the body down
  if (was > 0 && SAVE11.stamina <= 0) c11Msg('Kiệt sức rồi! Đi chậm lại; ăn rau hoặc đi ngủ đi', '#a3332a');
  else if (was > 20 && SAVE11.stamina <= 20) c11Msg('Sắp hết sức, ăn rau hoặc đi ngủ thôi', '#b0701a');
  if ((SAVE11.stamina <= C11_FAINT || SAVE11.hp <= 0) && !C11.sleep) { C11.fainted = true; c11StartSleep(true); }
}
function c11EatSlot(i) {
  const sl = SAVE11.bag[i]; if (!sl || C11.sleep) return; const it = C11_ITEMS[sl.id];
  if (!it.food) { c11Msg(`${it.name}: ${it.desc}`, '#5b2f1f'); return; }
  if (SAVE11.stamina >= C11_EN && SAVE11.hp >= 100) { c11Msg('Còn khoẻ lắm, chưa cần ăn', '#5b2f1f'); return; }
  c11Take(sl.id, 1); SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + it.food); SAVE11.hp = Math.min(100, (SAVE11.hp ?? 100) + it.food / 2); c11Sfx.pluck && c11Sfx.pluck(); c11Pop(Math.floor(C11.px), Math.floor(C11.py) - 1, `+${it.food} sức`, '#2f6a4c'); persist11();
}
const c11Price = (id, mult) => C11_ITEMS[id].cat === 'truyen' ? 0 : Math.round(C11_ITEMS[id].price * mult);
function c11SellSlot(i, mult) {
  const sl = SAVE11.bag[i]; if (!sl) return 0; const p = c11Price(sl.id, mult); if (!p) { C11.menu.note = 'Vật này không bán được'; return 0; }
  const got = p * sl.n; SAVE11.money += got; SAVE11.bag[i] = null; persist11(); c11Sfx.pluck && c11Sfx.pluck(); C11.menu.note = `Bán ${sl.n} ${C11_ITEMS[sl.id].name}: ${c4Money(got)}`; return got;
}
function c11OpenSell(title, mult, note) { C11.menu = { grid: 'sell', title, mult, note }; }
function c11OpenChest() { C11.menu = { grid: 'chest', title: 'Rương đồ', note: 'Chạm một ô để chuyển đồ giữa túi và rương' }; }
function c11Move(from, i, to) {                                         // move a whole stack between the bag and the chest
  const sl = from[i]; if (!sl) return; const left = c11Put(to, sl.id, sl.n);
  if (left) { sl.n = left; C11.menu.note = to === SAVE11.chest ? 'Rương đầy rồi' : 'Túi đầy rồi'; } else from[i] = null;
  c11Sfx.tap(); persist11();
}
function c11OpenShop() {
  C11.menu = { title: 'Hạt giống', note: 'Cây thường 4 gói một lần · cây leo giàn mua từng hạt', cols: 2, rows: Object.keys(C11_CROPS).map(id => { const c = C11_CROPS[id], qty = c.dan ? 1 : 4, cost = c.seed * qty; return { name: c.name, sub: c.dan ? `1 hạt cho 1 giàn · bán ${c.sell}` : `lớn ${c.days} ngày · bán ${c.sell}`, price: cost, icon: id, f: () => {
    if (SAVE11.money < cost) { C11.menu.note = 'Chưa đủ tiền'; return; }
    const left = c11Add('h_' + id, qty); if (left === qty) { C11.menu.note = 'Túi đầy rồi, không mang thêm được'; return; } SAVE11.money -= c.seed * (qty - left); persist11(); c11Sfx.tap(); C11.menu.note = `Đã mua ${qty - left} ${c.dan ? 'hạt' : 'gói'} ${c.name}` + (left ? ' (túi đầy)' : ''); } }; }) };
}
function c11OpenFood() {
  const dishes = [['Xôi vò', 'dẻo thơm', 12, 20, 0], ['Bún riêu', 'nóng hổi', 30, 45, 10], ['Cơm nếp thịt', 'bữa đủ đầy', 55, 100, 30]];
  C11.menu = { title: 'Quán ăn', rows: dishes.map(([name, sub, price, en, hp]) => ({ name, sub: `${sub} · +${en} sức${hp ? ` · +${hp} máu` : ''}`, price, f: () => {
    if (SAVE11.money < price) { c11Msg('Không đủ tiền', '#a3332a'); return; }
    if (SAVE11.stamina >= C11_EN && SAVE11.hp >= 100) { c11Msg('Đang no căng rồi', '#5b2f1f'); return; }
    SAVE11.money -= price;  SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + en); SAVE11.hp = Math.min(100, SAVE11.hp + hp); c11Sfx.pluck && c11Sfx.pluck(); c11Pop(Math.floor(C11.px), Math.floor(C11.py) - 1, `+${en} sức`, '#2f6a4c'); persist11();
  } })) };
}
function c11StartSleep(forced) { if (C11.sleep) return; C11.go = null; C11.sleep = { t: 0, did: false, forced }; }
const C11_IDLE = 6;
function c11NewDay() {
  let ripe = 0, died = 0;
  for (const [k, s] of Object.entries(SAVE11.tiles)) {                // hoed earth left bare for C11_IDLE nights goes back to grass (owner 2026-10-31)
    if (s.crop || s.dan) s.idle = 0; else if (!k.includes(':') && (s.idle = (s.idle || 0) + 1) >= C11_IDLE) { delete SAVE11.tiles[k]; delete SAVE11.clear[k]; }
  }
  for (const s of Object.values(SAVE11.tiles)) {                     // a plant not watered for a day dies (owner); a watered one grows a day
    if (s.crop && !s.dead) { if (s.wet) { if (c11Stage(s) < 3) s.age++; } else { s.dead = 1; died++; } }
    s.wet = 0; if (s.crop && !s.dead && c11Stage(s) === 3) ripe++;
  }
  for (const m of [SAVE11.cut, SAVE11.gone]) for (const k of Object.keys(m)) if (SAVE11.day + 1 - m[k] >= 5) delete m[k];   // stumps sprout again after 5 days
  for (const k of Object.keys(SAVE11.clear)) if (!SAVE11.tiles[k] && SAVE11.day + 1 - SAVE11.clear[k] >= 4) delete SAVE11.clear[k];   // mown grass left unhoed grows back in 4 nights
  if (C11.fainted || C11.passed) { const lost = Math.min(Math.floor(SAVE11.money * .1), 100); SAVE11.money -= lost;  C11.faintMsg = C11.fainted ? (lost ? `Ngất giữa ruộng, mất ${c4Money(lost)} tiền thuốc` : 'Ngất giữa ruộng, tỉnh dậy mệt lử') : (lost ? `Ngủ gục ngoài đường, ai đó lấy mất ${c4Money(lost)}` : 'Ngủ gục ngoài đường, sáng ra mệt rã rời'); }
  if (C11.area !== 'ruong') c11Enter('ruong', 4.5, 5.7, true);
  c11NewDayNew();
  const late = c11QuestNewDay();
  SAVE11.day++; SAVE11.mins = C11_DAY0; SAVE11.hp = C11.fainted ? 50 : 100; SAVE11.stamina = C11.fainted ? C11_EN / 2 : (C11.late || C11.passed) ? C11_EN * .75 : C11_EN; C11.px = 4.5; C11.py = 5.7; C11.face = 1; persist11();
  c11Msg(C11.faintMsg || (died ? `Ngày ${SAVE11.day} · ${died} cây chết khô vì không được tưới` : late ? `Ngày ${SAVE11.day} · ${late} việc của đình đã quá hạn` : ripe ? `Ngày ${SAVE11.day} · ${ripe} cây đã chín` : `Ngày ${SAVE11.day}`), C11.faintMsg ? '#a3332a' : '#2f6a4c'); C11.faintMsg = null; C11.fainted = false; C11.late = false; C11.passed = false; C11.warnLate = false;
}

/* ---------- movement, taps ---------- */
function c11Dist(sx, sy) {
  const d = Array.from({ length: C11_H }, () => Array(C11_W).fill(-1)); d[sy][sx] = 0; const q = [[sx, sy]];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of C11_D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= C11_W || ny >= C11_H || d[ny][nx] >= 0 || c11Blocked(nx, ny)) continue; d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); } }
  return d;
}
function c11Route(d, gx, gy) {
  const p = [[gx, gy]]; let x = gx, y = gy;
  while (d[y][x] > 0) { let moved = false; for (const [dx, dy] of C11_D4) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < C11_W && ny < C11_H && d[ny][nx] === d[y][x] - 1) { x = nx; y = ny; p.unshift([x, y]); moved = true; break; } } if (!moved) break; }
  p.shift(); return p;
}
/* walking is finer than the tiles: a tree blocks only its trunk (and the map's edge ring all of it), so a gap between trunks can be walked through */
function c11Solid(tx, ty, px, py) {
  const kd = c11Kind(tx, ty); if (kd !== 't') return C11_BLOCK.includes(kd);
  if (tx <= 0 || ty <= 0 || tx >= C11_W - 1 || ty >= C11_H - 1) return true;
  const tk = c11Pre() + tx + ',' + ty; if (SAVE11.gone[tk]) return false;
  return Math.hypot(px - (tx + .5), (py - (ty + .88)) * 1.5) < (SAVE11.cut[tk] ? .26 : .36);
}
function c11Free(x, y) { for (const dx of [-.2, .2]) for (const dy of [-.15, .03]) if (c11Solid(Math.floor(x + dx), Math.floor(y + dy), x + dx, y + dy)) return false; return true; }
function c11Tap(tx, ty, wx, wy) {
  if (C11.sleep) return;
  if (c11FishTap()) return;                                            // a bite: any tap pulls the line in
  if (typeof c11OTap === 'function' && c11OTap(wx, wy)) return;        // another player (online.js)
  const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty)));
  const near = (ax, ay) => { let best = null; for (const [dx, dy] of C11_D4) { const nx = ax + dx, ny = ay + dy; if (nx < 0 || ny < 0 || nx >= C11_W || ny >= C11_H || d[ny][nx] < 0) continue; if (!best || d[ny][nx] < best.d) best = { x: nx, y: ny, d: d[ny][nx] }; } return best; };
  for (const v of [...C11.vill]) if (Math.abs(wx - v.x) < .6 && wy > v.y - 1.5 && wy < v.y + .25) {
    const vt = [Math.floor(v.x), Math.floor(v.y - .01)];
    if (Math.abs(vt[0] - ptx) + Math.abs(vt[1] - pty) <= 1 || Math.hypot(v.x - C11.px, v.y - C11.py) < 1.6) { C11.go = { path: [], act: { v } }; return; }
    const b = near(vt[0], vt[1]); if (b) C11.go = { path: c11Route(d, b.x, b.y), act: { v } }; return;
  }
  for (const b of C11.beasts || []) if (Math.abs(wx - b.x) < .7 && wy > b.y - 1.1 && wy < b.y + .3 && (!c11ToolWins(tx, ty) || (typeof c11Wild === 'function' && c11Wild(b)))) {   // an animal: walk up to it, no tool is used on it
    const bt = [Math.floor(b.x), Math.floor(b.y - .01)], nb = near(bt[0], bt[1]); if (nb) C11.go = { path: c11Route(d, nb.x, nb.y), act: b.herd ? { tx: bt[0], ty: bt[1] } : null }; return;
  }
  for (const sg of c11SignList()) if (Math.abs(wx - sg.gx) < .85 && wy > sg.gy - 1.6 && wy < sg.gy + .3) {   // a signpost: walk to the way out it points to
    const path = d[sg.ey0] && d[sg.ey0][sg.ex0] >= 0 ? c11Route(d, sg.ex0, sg.ey0) : null; if (path) { C11.go = { path, act: null }; c11Sfx.tap(); return; }
  }
  const k = c11Kind(tx, ty);
  // not what the held tool is for (owner): only walk there
  if (!c11CanAct(tx, ty)) { if (d[ty] === undefined) return; if (c11Blocked(tx, ty) || d[ty][tx] < 0) { const b = near(tx, ty); if (b) C11.go = { path: c11Route(d, b.x, b.y), act: null }; return; } C11.go = { path: c11Route(d, tx, ty), act: null }; return; }
  if (k === 't') {                                                      // an axe is swung from the side: stand level with the tree, left or right of it
    const side = [[-1, 0], [1, 0]].map(([dx]) => [tx + dx, ty]).filter(([ax, ay]) => ax >= 0 && ax < C11_W && ay >= 0 && ay < C11_H && d[ay][ax] >= 0);
    if (side.length) {
      if (side.some(([ax, ay]) => ax === ptx && ay === pty)) { C11.go = { path: [], act: { tx, ty } }; return; }
      side.sort((a, b) => d[a[1]][a[0]] - d[b[1]][b[0]]); C11.go = { path: c11Route(d, side[0][0], side[0][1]), act: { tx, ty } }; return;
    }
  }
  if (!c11Blocked(tx, ty) && d[ty] !== undefined && d[ty][tx] >= 0) {     // field work (cut, dig, sow): walk right onto that spot
    C11.go = { path: tx === ptx && ty === pty ? [] : c11Route(d, tx, ty), act: { tx, ty } }; return;
  }
  if (Math.abs(tx - ptx) + Math.abs(ty - pty) <= 1) { C11.go = { path: [], act: { tx, ty } }; return; }
  const b = near(tx, ty); if (b) C11.go = { path: c11Route(d, b.x, b.y), act: { tx, ty } };
}
/* does the thing in hand fit what is there? (owner: the sickle cuts only grass, the axe only a trunk, the hoe only cut ground, the can only
   soil or water, a seed only ground made for it; otherwise a tap only walks) */
/* a held tool whose own target is the tapped tile beats an animal standing over it (a hen in front of the crop no longer eats the tap) */
const c11ToolWins = (tx, ty) => !['none', 'item', 'seed'].includes(c11HandTool()) && c11CanAct(tx, ty);
function c11CanAct(tx, ty) {
  const k = c11Kind(tx, ty), tool = c11HandTool(), key = c11Pre() + tx + ',' + ty;
  { const r = c11CanNew(tx, ty, tool, k, key); if (r !== undefined) return r; }
  if ('DBCSNQUTYZ'.includes(k)) return true;                            // a bed, a box, a chest, a stall, the board, the drum
  if (k === 't') return tool === 'axe' && !SAVE11.gone[key];
  if (k === 'w' || k === 'K') return tool === 'can' && SAVE11.water < 10;
  if (!c11Field(tx, ty)) return false;
  const s = SAVE11.tiles[key], cleared = !!(SAVE11.clear[key] || s);
  if (s && s.dead) return tool === 'sickle' || tool === 'hoe';          // a dead plant is cleared with the sickle or the hoe
  if (s && s.crop && c11Stage(s) === 3) return true;                      // a ripe crop is picked by hand
  if (tool === 'sickle') return !cleared;
  if (tool === 'hoe' || tool === 'dan') return cleared && !s;
  if (tool === 'can') return !!s && !s.wet;
  if (tool === 'seed') { const it = c11HandItem(), cs = it && C11_CROPS[it.id.slice(2)]; return !!(cs && s && !s.crop && (cs.dan ? s.dan : !s.dan)); }
  return false;
}
function c11Use(a) {
  C11.swing = C11_SW; C11.pend = { a, t: C11_SW * (C11_HIT[C11_SLOTS[C11.slot]] || .5) };
  const ax = a.v ? a.v.x : a.tx + .5; if (Math.abs(ax - C11.px) > .05) C11.face = ax < C11.px ? -1 : 1;
}

function updateC11(dt) {
  const G = C11; if (!G.ready) return; dt = Math.min(dt, .05); G.t += dt; AU.setQuiet(true);   // keep the song silent whatever else touched it
  if (G.msg) { G.msg.t += dt; if (G.msg.t > 2.4) G.msg = null; }
  if (G.say) { G.say.t += dt; if (G.say.t > (G.say.dur || 3.2)) G.say = null; }
  for (const b of G.bf) {
    b.ph += dt * 2.2; if (b.wait > 0) b.wait -= dt;
    if (Math.hypot(b.tx - b.x, b.ty - b.y) < .25 || b.wait <= 0 && Math.random() < .004) { b.tx = 2.5 + Math.random() * 14.5; b.ty = 2.5 + Math.random() * 10; b.wait = 3 + Math.random() * 4; }
    const ex = b.tx - b.x, ey = b.ty - b.y, d = Math.hypot(ex, ey) || 1; b.x += (ex / d * .9 + Math.sin(b.ph * 3) * .8) * dt; b.y += (ey / d * .9 + Math.cos(b.ph * 2.3) * .6) * dt;
  }
  for (const f of G.fx) { f.t += dt; if (f.k === 'dot' || f.k === 'chip') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 6 * dt; if (f.k === 'chip') f.rot += f.vr * dt; } }
  G.fx = G.fx.filter(f => f.t < f.life);
  if (G.fade) { const f = G.fade; f.t += dt; G.moving = false; if (!f.did && f.t > .25) { f.did = true; c11Enter(f.id, f.x, f.y); } if (f.t > .55) G.fade = null; return; }
  if (G.sleep) { const s = G.sleep; s.t += dt; if (!s.did && s.t > .8) { s.did = true; c11NewDay(); } if (s.t > 1.9) G.sleep = null; return; }
  SAVE11.mins += dt * C11_MPS;
  if (SAVE11.mins >= 24 * 60 && !G.warnLate) { G.warnLate = true; c11Msg('Nửa đêm rồi, ngủ muộn thì mai mệt đấy', '#b0701a'); }
  if (SAVE11.mins >= C11_DAY1) { c11Msg('Hai giờ sáng, mệt quá, ngã ra ngủ luôn'); C11.passed = true; c11StartSleep(true); return; }
  G.saveT += dt; if (G.saveT > 8) { G.saveT = 0; persist11(); }
  if (G.swing > 0) G.swing -= dt; if (G.hurt > 0) G.hurt -= dt;
  if (SAVE11.hp === undefined) SAVE11.hp = 100;
  if (SAVE11.stamina > 40 && SAVE11.hp < 100) SAVE11.hp = Math.min(100, SAVE11.hp + dt * .4);   // rested, the body mends slowly
  for (let i = SAVE11.drops.length - 1; i >= 0; i--) {
    const d = SAVE11.drops[i]; if ((d.a || 'ruong') !== G.area) continue; if (d.t < d.dur) { d.t += dt; continue; }
    if (Math.hypot(G.px - d.x, G.py - .25 - d.y) < .9) {
      if (c11Add(d.k, 1)) { if (!G.fullT || G.t - G.fullT > 3) { G.fullT = G.t; c11Msg('Túi đầy rồi! Về cất vào rương hoặc đem bán', '#a3332a'); } continue; } SAVE11.drops.splice(i, 1); c11Sfx.pluck && c11Sfx.pluck(); c11Pop(Math.floor(d.x), Math.floor(d.y) - 1, `+1 ${c11Info(d.k).name}`, c11Info(d.k).col); c11Dots(Math.floor(d.x), Math.floor(d.y) - .3, d.k === 'go' ? '#c89a5e' : c11Info(d.k).col, 4, .6);
    }
  }
  if (G.shake) { G.shake.t += dt; if (G.shake.t > .5) G.shake = null; } if (G.fall) { G.fall.t += dt; if (G.fall.t > 1) G.fall = null; }
  if (G.pend) { G.pend.t -= dt; if (G.pend.t <= 0) { const a = G.pend.a; G.pend = null; if (a.v) { if (G.vill.includes(a.v)) c11TalkTo(a.v); } else c11Act(a.tx, a.ty); } }
  // walking: keys first, else the route a tap made
  const K = G.keys; let dx = (K.ArrowRight || K.KeyD ? 1 : 0) - (K.ArrowLeft || K.KeyA ? 1 : 0), dy = (K.ArrowDown || K.KeyS ? 1 : 0) - (K.ArrowUp || K.KeyW ? 1 : 0);
  const sp = SAVE11.stamina <= 0 ? 1.5 : 2.8; G.moving = false;
  if (dx || dy) {
    G.go = null; G.kbd = true; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    if (c11Free(G.px + dx * sp * dt, G.py)) G.px += dx * sp * dt; if (c11Free(G.px, G.py + dy * sp * dt)) G.py += dy * sp * dt;
    G.moving = true; if (dx) G.face = dx > 0 ? 1 : -1; if (Math.abs(dx) >= Math.abs(dy) && dx) { G.fx0 = Math.sign(dx); G.fy0 = 0; } else if (dy) { G.fx0 = 0; G.fy0 = Math.sign(dy); }
  } else if (G.go) {
    const go = G.go;
    if (go.path.length) {
      const [cx, cy] = go.path[0], tx = cx + .5, ty = cy + .6, ex = tx - G.px, ey = ty - G.py, dist = Math.hypot(ex, ey), st = sp * dt;
      if (dist <= st) { G.px = tx; G.py = ty; go.path.shift(); } else { G.px += ex / dist * st; G.py += ey / dist * st; if (Math.abs(ex) > .02) G.face = ex > 0 ? 1 : -1; }
      G.moving = true;
    } else { G.go = null; if (go.act && !G.pend) c11Use(go.act); }
  }
  if (G.moving) G.ph += dt * (SAVE11.stamina <= 0 ? 4.5 : 7.5);
  { const dd = Math.hypot(G.px - (G.lx ?? G.px), G.py - (G.ly ?? G.py)); G.lx = G.px; G.ly = G.py; if (dd < 1) { G.walked = (G.walked || 0) + dd; if (G.walked >= 6) { G.walked -= 6; c11Spend(C11_WALK); } } }   // a long walk tires too (owner): 1 sức every 6 tiles
  { const [ex0, ey0] = c11Tile(); if (c11Kind(ex0, ey0) === 'E') { const ex = C11_AR.exits[ex0 + ',' + ey0]; if (ex) c11GoArea(ex[0], ex[1], ex[2]); } }
  // the animals wander about the grass; hens peck, cows and horses graze, a pig roots about
  for (const b of G.beasts || []) {
    if (b.fly || b === C11.carry) continue;                              // being carried or thrown (bong.js)
    b.moving = false; const small = b.kind === 'ga' || b.kind === 'trong' || b.kind === 'vit', grazer = !small;
    if (b.wait > 0) { b.wait -= dt; b.dn += ((small ? (Math.sin(G.t * 9 + b.x) > .3 ? 1 : 0) : (Math.sin(G.t * .7 + b.x) > -.3 ? 1 : 0)) - b.dn) * Math.min(1, dt * (small ? 14 : 3)); continue; }
    b.dn += (0 - b.dn) * Math.min(1, dt * 6);
    if (!b.to && b.box) b.to = [b.box[0] + ((Math.random() * (b.box[2] - b.box[0] + 1)) | 0), b.box[1] + ((Math.random() * (b.box[3] - b.box[1] + 1)) | 0)];
    if (!b.to) { const c = []; for (let yy = 1; yy < C11_H - 1; yy++) for (let xx = 1; xx < C11_W - 1; xx++) if (c11Kind(xx, yy) === (b.pen ? 'n' : 'g') && !(C11_AR.id === 'ruong' && (SAVE11.tiles[xx + ',' + yy] || SAVE11.clear[xx + ',' + yy])) && Math.hypot(xx + .5 - b.x, yy + .6 - b.y) < (small ? 2.5 : 3.5)) c.push([xx, yy]); if (!c.length) { b.wait = 3; continue; } b.to = c[(Math.random() * c.length) | 0]; }
    const tx = b.to[0] + .5, ty = b.to[1] + .6, ex = tx - b.x, ey = ty - b.y, dist = Math.hypot(ex, ey), st = ({ ga: 1.1, vit: .9, trong: 1.1, meo: .9, cho: 1.3, lon: .6, bo: .55, trau: .45, ngua: .7 }[b.kind] || .7) * dt;
    if (dist <= st) { b.x = tx; b.y = ty; b.to = null; b.wait = (small ? 1.5 : 4) + Math.random() * (small ? 4 : 8); } else { b.x += ex / dist * st; b.y += ey / dist * st; if (Math.abs(ex) > .02) b.face = ex > 0 ? 1 : -1; b.moving = true; b.ph += dt * (small ? 14 : 6); }
  }
  // the villagers keep their hours: come and go, stroll about where they are (langxa.js)
  c11VillUpdate(dt); c11ChatUpdate(dt); c11NewUpdate(dt);
}

/* ---------- drawing ---------- */
function c11Layout(W, H) {
  const T = Math.round(Math.max(52, Math.min(92, Math.min(W / 9.5, H / 8))));
  const mw = C11_W * T, mh = C11_H * T, mx = T * .6, my = T * 1.4;
  const clamp = (v, lo, hi) => hi < lo ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v));
  const cx = clamp(C11.px * T - W / 2, -mx, mw - W + mx), cy = clamp((C11.py - .6) * T - H / 2, -my, mh - H + T * .6);
  return { W, H, T, cx, cy, k: T / 64 };
}
const c11TagC = (g, x, y, text, o = {}) => { g.font = `700 ${o.size || 13}px "Be Vietnam Pro", sans-serif`; return c11Tag(g, x - (Math.ceil(g.measureText(text).width) + (o.pad || 22)) / 2, y, text, o); };
const c11Tag = (g, x, y, text, o = {}) => {
  g.font = `700 ${o.size || 13}px "Be Vietnam Pro", sans-serif`; const w = Math.ceil(g.measureText(text).width) + (o.pad || 22), h = o.h || 30;
  if (o.right) x -= w;
  g.fillStyle = o.fill || '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.roundRect(x, y, w, h, 9); g.fill(); g.stroke();
  g.fillStyle = o.col || INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + w / 2, y + h / 2 + 1);
  return [x, y, w, h];
};
function c11Bubble(g, x, y, text, name) {
  g.font = '600 13px "Be Vietnam Pro", sans-serif';
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > 190 && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const w = Math.max(...lines.map(l => g.measureText(l).width), name ? g.measureText(name).width : 0) + 22, h = lines.length * 17 + 14 + (name ? 17 : 0), bx = x - w / 2, by = y - h - 12;
  g.fillStyle = '#fbf4dc'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.roundRect(bx, by, w, h, 10); g.moveTo(x - 7, by + h); g.lineTo(x, by + h + 11); g.lineTo(x + 7, by + h); g.fill(); g.stroke();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; let ly = by + 15;
  if (name) { g.fillStyle = '#a3332a'; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText(name, x, ly); ly += 17; g.fillStyle = INK; g.font = '600 13px "Be Vietnam Pro", sans-serif'; }
  for (const l of lines) { g.fillText(l, x, ly); ly += 17; }
}
function c11Slot(g, i, x, y, s, sel) {
  const id = C11_SLOTS[i], by = sel ? y - 8 : y;
  g.fillStyle = sel ? '#f7e3a4' : '#f4ead0'; g.strokeStyle = sel ? '#a3332a' : INK; g.lineWidth = sel ? 3.4 : 2.4; g.beginPath(); g.roundRect(x, by, s, s, 10); g.fill(); g.stroke();
  const cx = x + s / 2, cy = by + s / 2 - 2;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (id === 'hoe') {
    g.strokeStyle = '#5b2f1f'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 13, cy + 14); g.lineTo(cx + 9, cy - 13); g.stroke();
    g.fillStyle = '#6b6560'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 3, cy - 17); g.lineTo(cx + 17, cy - 8); g.lineTo(cx + 12, cy - 2); g.lineTo(cx + 5, cy - 8); g.closePath(); g.fill(); g.stroke();
  } else if (id === 'sickle') {
    g.strokeStyle = '#5b2f1f'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 12, cy + 15); g.lineTo(cx - 2, cy - 4); g.stroke();
    g.fillStyle = '#a8b0b4'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 3, cy - 5); g.quadraticCurveTo(cx + 10, cy - 24, cx + 20, cy - 8); g.quadraticCurveTo(cx + 12, cy - 14, cx, cy + 1); g.closePath(); g.fill(); g.stroke();
  } else if (id === 'axe') {
    g.strokeStyle = '#5b2f1f'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 13, cy + 15); g.lineTo(cx + 7, cy - 14); g.stroke();
    g.save(); g.translate(cx + 5, cy - 11); g.rotate(.5); g.scale(.5, .5); c11AxeHead(g, 0); g.restore();
  } else if (id === 'can') {
    g.fillStyle = '#3f8a86'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 12, cy - 8); g.lineTo(cx + 8, cy - 8); g.lineTo(cx + 10, cy + 12); g.lineTo(cx - 14, cy + 12); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx + 8, cy - 2); g.lineTo(cx + 20, cy - 12); g.lineTo(cx + 22, cy - 9); g.lineTo(cx + 9, cy + 4); g.stroke(); g.beginPath(); g.arc(cx - 3, cy - 10, 8, Math.PI, 0); g.stroke();
    g.fillStyle = '#7fb0c4'; g.fillRect(cx - 11, cy + 12 - SAVE11.water * 1.5, 20, SAVE11.water * 1.5 - 1);
  } else if (id === 'dan') {
    g.strokeStyle = '#5b2f1f'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(cx - 13, cy + 16); g.lineTo(cx - 13, cy - 16); g.moveTo(cx + 13, cy + 16); g.lineTo(cx + 13, cy - 16); g.moveTo(cx - 16, cy - 15); g.lineTo(cx + 16, cy - 15); g.stroke();
    g.strokeStyle = '#a0703a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 13, cy + 4); g.lineTo(cx + 13, cy + 4); g.moveTo(cx - 13, cy + 14); g.lineTo(cx + 13, cy - 8); g.moveTo(cx + 13, cy + 14); g.lineTo(cx - 13, cy - 8); g.stroke();
  } else if (id === 'rod' || id === 'shovel') {
    c11ToolIcon(g, id, cx, cy);
  } else {
    g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(cx - 15, cy - 20, 30, 38, 4); g.fill(); g.stroke();
    g.fillStyle = C11_CROPS[id].col; g.fillRect(cx - 13, cy - 18, 26, 8);
    c11Spr(g, c11Art().crop[id][3], cx, cy + 15, .3);
  }
  g.restore();
  if (!c11Has(id)) { g.fillStyle = 'rgba(244,234,208,.72)'; g.beginPath(); g.roundRect(x + 1, by + 1, s - 2, s - 2, 9); g.fill(); g.fillStyle = '#a3332a'; g.font = '800 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('chưa có', x + s / 2, by + s / 2); }
  if (id === 'dan') { g.fillStyle = c11Count('go') >= C11_DAN_WOOD ? INK : '#a3332a'; g.font = '800 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillText(`${c11Count('go')}/${C11_DAN_WOOD} gỗ`, x + s - 4, by + s - 5); }
  if (false) { g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillText('×' + SAVE11.seeds[id], x + s - 5, by + s - 5); }
  if (id === 'can') { g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillText(SAVE11.water + '/10', x + s - 5, by + s - 5); }
  if (!isTouch) { g.fillStyle = 'rgba(29,25,21,.55)'; g.font = '700 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(String(i + 1), x + 6, by + 4); }
}
function renderC11() {
  const W = cv.width / DPR, Hf = cv.height / DPR, st = safeTop(), H = Hf - st, G = C11;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.sage.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) ctx.drawImage(PAPER, px, 0, PAPER.width, Math.max(Hf, PAPER.height));
  if (!G.ready) return;
  const g = ctx, A = c11Art(), V = G.v = c11Layout(W, H), { T, cx, cy, k } = V;
  g.save(); g.translate(0, st);
  g.fillStyle = '#6a9456'; g.fillRect(0, 0, W, H);                       // the forest beyond the map
  const x0 = Math.max(0, Math.floor(cx / T)), x1 = Math.min(C11_W - 1, Math.floor((cx + W) / T)), y0 = Math.max(0, Math.floor(cy / T)), y1 = Math.min(C11_H - 1, Math.floor((cy + H) / T));
  const sx = x => Math.round(x * T - cx), sy = y => Math.round(y * T - cy);
  // a tree (or anything tall) whose picture covers the mouse standing behind it is printed faint (owner)
  // a tree (or anything tall) is printed faint only when it hides more than half of the mouse standing behind it (owner)
  const behind = (X, Y, p, s, wy) => {
    if (G.py >= wy || G.py < wy - 4) return false;
    const mx = sx(G.px), my = sy(G.py), ax = mx - T * .28, bx = mx + T * .28, ay = my - T * 1.25, by = my;       // the mouse's box
    const cx0 = X + (p.x0 + p.w * .12) * s, cx1 = X + (p.x0 + p.w * .88) * s, cy0 = Y + (p.y0 + p.h * .1) * s, cy1 = Y + (p.y0 + p.h * .85) * s;   // the leafy part
    const ox = Math.max(0, Math.min(bx, cx1) - Math.max(ax, cx0)), oy = Math.max(0, Math.min(by, cy1) - Math.max(ay, cy0));
    return ox * oy > .5 * (bx - ax) * (by - ay);
  };
  g.imageSmoothingEnabled = true; g.drawImage(c11Bg(), sx(-C11_PAD), sy(-C11_PAD), (C11_W + C11_PAD * 2) * T, (C11_H + C11_PAD * 2) * T);
  // tilled earth: tiles that touch merge into one patch; only the outer corners are rounded, only the outer edge is inked
  {
    const wild = (x, y) => c11Kind(x, y) === 'f' && !SAVE11.clear[x + ',' + y] && !SAVE11.tiles[x + ',' + y], R0 = T * .4;
    const wr = (x, y) => { const L = wild(x - 1, y), Rr = wild(x + 1, y), U = wild(x, y - 1), D = wild(x, y + 1); return [!L && !U ? R0 : 0, !Rr && !U ? R0 : 0, !Rr && !D ? R0 : 0, !L && !D ? R0 : 0]; };
    for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (wild(x, y)) { g.fillStyle = 'rgba(60,96,44,.8)'; g.beginPath(); g.roundRect(sx(x) - 2, sy(y) - 2, T + 4, T + 4, wr(x, y).map(r => r ? r + 2 : 0)); g.fill(); }
    for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (wild(x, y)) { g.fillStyle = '#74a24f'; g.beginPath(); g.roundRect(sx(x), sy(y), T + .6, T + .6, wr(x, y)); g.fill(); }
    // grass cut short with the sickle (and under a trellis): a pale mown patch, merged like the tilled earth
    const mown = (x, y) => C11_AR.id === 'ruong' && c11Kind(x, y) === 'g' && (!!SAVE11.clear[x + ',' + y] || !!SAVE11.tiles[x + ',' + y]), RM = T * .38, ml = [];
    for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (mown(x, y)) ml.push([x, y]);
    const mrad = (x, y) => { const L = mown(x - 1, y), Rr = mown(x + 1, y), U = mown(x, y - 1), D = mown(x, y + 1); return [!L && !U ? RM : 0, !Rr && !U ? RM : 0, !Rr && !D ? RM : 0, !L && !D ? RM : 0]; };
    // short stubble with volume (co.js c11Stubble), a soft rim that melts into the long grass round it (owner: the cut patch did not match)
    if (ml.length) {
      const pat = g.createPattern(c11Stubble(), 'repeat');
      g.fillStyle = 'rgba(40,100,40,.12)'; for (const [x, y] of ml) { g.beginPath(); g.roundRect(sx(x) - 3, sy(y) - 1, T + 6, T + 5, mrad(x, y).map(r => r ? r + 3 : 0)); g.fill(); }
      g.save(); g.translate(-cx % 128, -cy % 128); g.fillStyle = pat; for (const [x, y] of ml) { g.beginPath(); g.roundRect(sx(x) + cx % 128, sy(y) + cy % 128, T + .6, T + .6, mrad(x, y)); g.fill(); } g.restore();
    }
    const till = (x, y) => C11_AR.id === 'ruong' && !!SAVE11.tiles[x + ',' + y] && !SAVE11.tiles[x + ',' + y].dan, R = T * .42, list = [];
    for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (till(x, y)) list.push([x, y]);
    const rad = (x, y) => { const L = till(x - 1, y), Rr = till(x + 1, y), U = till(x, y - 1), D = till(x, y + 1); return [!L && !U ? R : 0, !Rr && !U ? R : 0, !Rr && !D ? R : 0, !L && !D ? R : 0]; };
    // hoed earth with volume (co.js c11Soil): ridged furrows lit from the top left, shaded clods; watered earth darker with a wet sheen;
    // a soft rim instead of a hard edge (owner: the hoed ground did not match the grass and trees)
    if (list.length) {
      g.fillStyle = 'rgba(40,24,12,.32)'; for (const [x, y] of list) { g.beginPath(); g.roundRect(sx(x) - 3, sy(y) - 1, T + 6, T + 5, rad(x, y).map(r => r ? r + 3 : 0)); g.fill(); }
      const ox = cx % 128, oy = cy % 128, dry = g.createPattern(c11Soil(false), 'repeat'), wet = g.createPattern(c11Soil(true), 'repeat');
      g.save(); g.translate(-ox, -oy);
      for (const [x, y] of list) { g.fillStyle = SAVE11.tiles[x + ',' + y].wet ? wet : dry; g.beginPath(); g.roundRect(sx(x) + ox, sy(y) + oy, T + .6, T + .6, rad(x, y)); g.fill(); }
      g.restore();
    }
  }
  for (const hk of Object.keys(SAVE11.hits)) if (hk[0] === 'h' && C11_AR.id === 'ruong') {      // a hole that grows with every blow of the hoe
    const [hx, hy] = hk.slice(1).split(',').map(Number), f = SAVE11.hits[hk] / (c11Hash(hx, hy, 61) < .5 ? 4 : 5), X = sx(hx) + T * .5, Y = sy(hy) + T * .55, rx = T * (.1 + .3 * f), ry = rx * .6;
    g.fillStyle = 'rgba(70,40,24,.75)'; g.beginPath(); g.ellipse(X, Y, rx + 3, ry + 2.5, 0, 0, 6.283); g.fill();
    g.fillStyle = '#bb8d58'; g.beginPath(); g.ellipse(X, Y, rx, ry, 0, 0, 6.283); g.fill();
    g.fillStyle = '#5a3a22'; g.beginPath(); g.ellipse(X, Y + ry * .12, rx * .8, ry * .72, 0, 0, 6.283); g.fill();
    g.fillStyle = '#7a4a28'; for (let i = 0; i < 3 + Math.round(f * 3); i++) { const a = i * 2.2 + hx; g.beginPath(); g.ellipse(X + Math.cos(a) * (rx + 4), Y + Math.sin(a) * (ry + 3) + 1, 3, 2, 0, 0, 6.283); g.fill(); }
  }
  // tilled soil, then the living water: ripples, lily pads
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const kd = c11Kind(x, y);
    if (kd === 'w') {
      const h = c11Hash(x, y, 3), ccx = sx(x) + T / 2, ccy = sy(y) + T / 2, ph = (G.t * .3 + h * 3) % 1;
      if (h < .5) { g.strokeStyle = `rgba(255,255,255,${.6 * (1 - ph)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(ccx + (h - .25) * T * .5, ccy + T * .1, T * (.06 + ph * .3), T * (.03 + ph * .14), 0, 0, 6.283); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.6; g.beginPath(); const w = Math.sin(G.t * 1.6 + h * 9) * 5; g.moveTo(ccx - T * .22 + w, ccy + T * .18); g.quadraticCurveTo(ccx + w, ccy + T * .12, ccx + T * .22 + w, ccy + T * .18); g.stroke();
      if (c11Hash(x, y, 15) < .4) { const tw = Math.max(0, Math.sin(G.t * 2.3 + h * 40)); if (tw > .3) { const sx2 = ccx + (c11Hash(x, y, 16) - .5) * T * .7, sy2 = ccy + (c11Hash(x, y, 17) - .5) * T * .5, r = (2 + tw * 3.5); g.strokeStyle = `rgba(255,255,255,${tw})`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx2 - r, sy2); g.lineTo(sx2 + r, sy2); g.moveTo(sx2, sy2 - r); g.lineTo(sx2, sy2 + r); g.stroke(); } }
      if (c11Hash(x, y, 11) < .3) {
        const px = ccx + (c11Hash(x, y, 12) - .5) * T * .4 + Math.sin(G.t * .7 + h * 7) * 2, py = ccy + (c11Hash(x, y, 13) - .5) * T * .3 + Math.cos(G.t * .9 + h * 5) * 1.5, r = T * .2;
        { const lg = g.createRadialGradient(px - r * .35, py - r * .3, 1, px, py, r); lg.addColorStop(0, '#9ccf72'); lg.addColorStop(.6, '#4f8f48'); lg.addColorStop(1, '#2c5a32'); g.fillStyle = 'rgba(16,40,30,.3)'; g.beginPath(); g.ellipse(px + r * .15, py + r * .2, r, r * .55, 0, 0, 6.283); g.fill(); g.fillStyle = lg; } g.strokeStyle = 'rgba(20,40,20,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.ellipse(px, py, r, r * .55, 0, .35, 6.283 - .35); g.closePath(); g.fill(); g.stroke();
        if (c11Hash(x, y, 14) < .5) { g.fillStyle = '#f2a2b4'; g.beginPath(); g.arc(px + 1, py - 2, r * .32, 0, 6.283); g.fill(); g.fillStyle = '#f2d36a'; g.beginPath(); g.arc(px + 1, py - 2, r * .12, 0, 6.283); g.fill(); }
      }
    }
  }
  // fish under the clear water, then two mallards (a drake and a duck) paddling, a little wake behind them
  const PD = C11_AR.pond;
  if (PD) {
    const qx = PD.rx / 1.2, qy = PD.ry / .85;
    for (let i = 0; i < 4; i++) {
      const t = G.t * (.18 + i * .05) + i * 1.7, fx = PD.x - .1 + Math.cos(t) * (.9 + i * .15) * qx, fy = PD.y - .1 + Math.sin(t * 1.3) * .7 * qy, dir = Math.atan2(Math.cos(t * 1.3) * .91, -Math.sin(t) * (1 + i * .15)), u = T / 64;
      if (c11Kind(Math.floor(fx), Math.floor(fy)) === 'b') continue;                 // a fish never shows over the jetty
      g.save(); g.translate(sx(fx), sy(fy)); g.rotate(dir); g.globalAlpha = .55; g.fillStyle = i === 0 ? '#e0703a' : '#3c5a5a';
      g.beginPath(); g.ellipse(0, 0, 9 * u, 3.4 * u, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(-8 * u, 0); g.lineTo(-14 * u, -3.5 * u + Math.sin(G.t * 9 + i) * 1.5 * u); g.lineTo(-14 * u, 3.5 * u + Math.sin(G.t * 9 + i) * 1.5 * u); g.closePath(); g.fill(); g.restore();
    }
    for (let i = 0; i < 2; i++) {
      const t = G.t * .22 + i * 3.1, dx = PD.ducks ? PD.ducks[i][0] + Math.sin(t) * PD.ducks[i][1] : PD.x + (Math.sin(t) * 1.15 + i * .2) * qx, dy = PD.y + Math.cos(t * .8 + i) * .85 * qy, face = Math.cos(t) > 0 ? 1 : -1, X = sx(dx), Y = sy(dy), bob = Math.sin(G.t * 2 + i) * 1.2, u = T / 64;
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.3; for (let w = 1; w <= 3; w++) { g.globalAlpha = .7 - w * .18; g.beginPath(); g.moveTo(X - face * (14 + w * 7) * u, Y + (1 - w * 2) * u); g.lineTo(X - face * 6 * u, Y + 3 * u); g.lineTo(X - face * (14 + w * 7) * u, Y + (5 + w * 3) * u); g.stroke(); } g.globalAlpha = 1;
      c11Duck(g, X, Y + bob, u, face, i === 0);
    }
  }
  // things that stand up, back to front: trees (crowns sway), bamboo, bushes, reeds, grass and flowers (lean in the wind), crops
  const E = [], wide = 3;
  for (let y = y0 - 2; y <= y1 + 4; y++) for (let x = x0 - wide; x <= x1 + wide; x++) {
    if (x < -C11_PAD || y < -C11_PAD || x >= C11_W + C11_PAD || y >= C11_H + C11_PAD) continue;
    const kd = c11Kind(x, y), h7 = c11Hash(x, y, 7);
    if (kd === 't') {
      const ty = c11TreeType(x, y), X = sx(x + .5), Y = sy(y + 1), wv = c11Wind(x, y), tk = c11Pre() + x + ',' + y, shk = G.shake && G.shake.key === tk ? Math.sin(G.shake.t * 46) * .05 * (1 - G.shake.t / .5) : 0, fl = G.fall && G.fall.key === tk ? G.fall : null;
      if (fl) E.push({ y: y + 1, d: () => {
        const q = Math.min(1, fl.t / .75), ang = fl.dir * q * q * 1.45; g.save(); g.globalAlpha = fl.t > .75 ? Math.max(0, 1 - (fl.t - .75) / .25) : 1; g.translate(X, Y); g.rotate(ang); g.translate(-X, -Y);
        if (ty === 'bamboo') [[-18, 0], [2, 1], [20, 2]].forEach(([dx, i]) => c11Spr(g, A.bamboo[i], X + dx * k * .6, Y - i * 2, k * .62)); else { const tr = A.trees[ty], s = k * tr.sc * (.92 + h7 * .16); c11Spr(g, tr.trunk, X, Y, s); c11Spr(g, tr.crown, X, Y, s); }
        g.restore(); c11Stump(g, X, Y, k); } });
      else if (SAVE11.gone[tk]) { }
      else if (SAVE11.cut[tk]) E.push({ y: y + 1, d: () => c11Stump(g, X, Y, k) });
      else if (ty === 'bamboo') E.push({ y: y + 1, d: () => { c11Shade(g, X, Y, 36 * k, 9 * k); g.globalAlpha = behind(X - 20 * k, Y, A.bamboo[1], k * .62 * 1.6, y + 1) ? .4 : 1; [[-18, 0], [2, 1], [20, 2]].forEach(([dx, i]) => c11Sway(g, A.bamboo[i], X + dx * k * .6, Y - i * 2, k * .62, shk + wv * .07 + Math.sin(G.t * 1.7 + i * 2 + x) * .012, 0)); g.globalAlpha = 1; } });
      else E.push({ y: y + 1, d: () => { const tr = A.trees[ty], s = k * tr.sc * (.92 + h7 * .16); c11Shade(g, X, Y, 68 * s, 17 * s); g.globalAlpha = behind(X, Y, tr.crown, s, y + 1) ? .4 : 1; c11Spr(g, tr.trunk, X, Y, s); c11Sway(g, tr.crown, X, Y, s, shk + wv * tr.amp + Math.sin(G.t * 1.1 + x * 1.7 + y) * .008, tr.py); g.globalAlpha = 1; } });
      if (!C11_TREE_AT[x + ',' + y] && c11Hash(x, y, 90) < .85 && ty !== 'bamboo') {            // a second, smaller tree behind: the forest is deep
        const t2 = c11TreeType(x + 41, y + 13), ex = x + .5 + (c11Hash(x, y, 91) - .5) * .9, ey = y + .55 + c11Hash(x, y, 92) * .2;
        if (t2 !== 'bamboo') E.push({ y: ey, d: () => { const tr = A.trees[t2], s2 = k * tr.sc * .8, X2 = sx(ex), Y2 = sy(ey); c11Shade(g, X2, Y2, 68 * s2, 17 * s2, .2); g.globalAlpha = behind(X2, Y2, tr.crown, s2, ey) ? .4 : 1; c11Spr(g, tr.trunk, X2, Y2, s2); c11Sway(g, tr.crown, X2, Y2, s2, c11Wind(ex, ey) * tr.amp + Math.sin(G.t * 1.3 + ex * 2) * .008, tr.py); g.globalAlpha = 1; } });
      }
    } else if (kd === 'H') {
      const fx = x + .5, fy = y + .92, sz = 1.05 + c11Hash(x, y, 120) * .3; E.push({ y: fy, d: () => { c11Shade(g, sx(fx), sy(fy), 52 * k * sz, 12 * k * sz); c11Spr(g, A.hay, sx(fx), sy(fy), k * sz); } });
    } else if (kd === 'K') {
      E.push({ y: y + .92, d: () => { c11Shade(g, sx(x + .5), sy(y + .92), 52 * k, 12 * k); c11Spr(g, A.well, sx(x + .5), sy(y + .92), k * .95); } });
    } else if (kd === 'f' || (kd === 'g' && C11_AR.id === 'ruong' && (SAVE11.tiles[x + ',' + y] || SAVE11.clear[x + ',' + y]))) {
      const s = SAVE11.tiles[x + ',' + y];
      if (kd === 'g') { const GR = c11Grass();   // a cut patch is bare: no tufts left on it (owner 2026-10-31)
        for (const [dx, dy] of C11_D4) { const nk = (x + dx) + ',' + (y + dy); if (c11Kind(x + dx, y + dy) !== 'g' || SAVE11.clear[nk] || SAVE11.tiles[nk]) continue;   // the long grass round it leans over the edge, so the cut has no straight line
          for (let i = 0; i < 3; i++) { const t = .15 + i * .35 + (c11Hash(x, y, 530 + i + dx * 3 + dy * 7) - .5) * .12, fx = x + (dx ? (dx > 0 ? .9 : .1) : t), fy = y + (dy ? (dy > 0 ? 1.02 : .2) : t + .2), sp = GR.tufts[(c11Hash(x, y, 540 + i + dx + dy * 5) * 6) | 0], sc = k * (.55 + c11Hash(x, y, 550 + i) * .3); E.push({ y: fy, d: () => c11Lean(g, sp, sx(fx), sy(fy), sc, c11Wind(fx, fy) * .2 + Math.sin(G.t * 2.6 + fx * 5) * .05) }); } } }
      if (kd === 'f' && !s && !SAVE11.clear[x + ',' + y]) for (let i = 0; i < 5; i++) {
        const fx = x + .14 + ((i * .37 + c11Hash(x, y, 210 + i) * .3) % .74), fy = y + .34 + c11Hash(x, y, 220 + i) * .6, tf = c11Grass().tufts[(i + x) % 6], X = sx(fx), Y = sy(fy), sc = k * (1.05 + c11Hash(x, y, 230 + i) * .4);
        E.push({ y: fy, d: () => c11Lean(g, tf, X, Y, sc, c11Wind(fx, fy) * .28 + Math.sin(G.t * 2.6 + fx * 5 + fy * 3) * .07) });
      }
      if (s && s.dan) E.push({ y: y + .66, d: () => { if (s.wet) { g.fillStyle = 'rgba(52,28,14,.4)'; g.beginPath(); g.ellipse(sx(x + .5), sy(y + .7), T * .34, T * .12, 0, 0, 6.283); g.fill(); } c11Spr(g, A.dan, sx(x + .5), sy(y + .7), k * 1.32 * .72); } });
      if (s && s.crop && s.dead) E.push({ y: y + .7, d: () => c11Lean(g, c11Art3().dead[(x + y) % 2], sx(x + .5), sy(y + .68), k * 1.1, c11Wind(x, y) * .03) });
      else if (s && s.crop) { const st = c11Stage(s); E.push({ y: y + .7, d: () => c11Lean(g, A.crop[s.crop][st], sx(x + .5), sy(y + .68), k * 1.32 * (C11_CSCALE[s.crop] || 1), st ? c11Wind(x, y) * .05 * st + Math.sin(G.t * 2.2 + x * 3 + y) * .01 : 0) }); }
    } else if (kd === 'r' || kd === 'x' || kd === 'y') c11FieldE(E, g, x, y, sx, sy, k);
    else if (kd === 'g') {
      // thick grass with volume (co.js): 4–6 shaded tufts on every grass tile, one in each quarter and more between, now and then a seed head or flowers
      const GR = c11Grass(), hh = c11Hash(x, y, 1), n = 4 + (hh < .6 ? 1 : 0) + (hh < .25 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const fx = x + (i < 4 ? .27 + (i % 2) * .46 : i === 4 ? .5 : .1) + (c11Hash(x, y, 40 + i) - .5) * .34, fy = y + (i < 4 ? .38 + (i >> 1) * .42 : i === 4 ? .6 : .9) + (c11Hash(x, y, 50 + i) - .5) * .22;
        const v = c11Hash(x, y, 60 + i), X = sx(fx), Y = sy(fy), sc = k * (.8 + c11Hash(x, y, 70 + i) * .55);
        const sp = v < .045 ? GR.bloom[(v * 1000 | 0) % 3] : v < .11 ? GR.seed[(v * 1000 | 0) % 2] : GR.tufts[(c11Hash(x, y, 80 + i) * 6) | 0];
        E.push({ y: fy, d: () => c11Lean(g, sp, X, Y, sc, c11Wind(fx, fy) * .22 + Math.sin(G.t * 2.6 + fx * 5 + fy * 3) * .06) });
      }
      const wat = C11_D4.find(([dx, dy]) => c11Kind(x + dx, y + dy) === 'w');
      if (wat && c11Hash(x, y, 80) < .7) { const fx = x + .5 + wat[0] * .3, fy = y + .5 + wat[1] * .3 + .2; E.push({ y: fy, d: () => c11Lean(g, A.reed, sx(fx), sy(fy), k * .9, c11Wind(fx, fy) * .14 + Math.sin(G.t * 1.9 + fx) * .04) }); }
      if (y !== 5 && y !== 6 && y !== 7 && c11Hash(x, y, 8) < .04) { const fx = x + .5, fy = y + .85; E.push({ y: fy, d: () => { c11Shade(g, sx(fx), sy(fy), 34 * k, 8 * k); c11Lean(g, A.bush, sx(fx), sy(fy), k * .9, c11Wind(fx, fy) * .04); } }); }
      else if (y !== 5 && y !== 6 && y !== 7 && c11Hash(x, y, 9) < .035) { const fx = x + .5, fy = y + .8; E.push({ y: fy, d: () => { c11Shade(g, sx(fx), sy(fy), 22 * k, 6 * k); c11Spr(g, A.rock, sx(fx), sy(fy), k * .9); } }); }
    }
  }
  const bedAt = (a, b, y, n) => { for (let i = 0; i < n; i++) { const fx = a + (b - a) * (i + c11Hash(i, y, 95) * .6) / n, fy = y + c11Hash(i, y, 96) * .14, v = c11Hash(i, y, 97), fl = A.flower[(v * 50 | 0) % 5]; E.push({ y: fy, d: () => c11Lean(g, v < .3 ? A.tuft[1] : fl, sx(fx), sy(fy), k * (.9 + v * .3), c11Wind(fx, fy) * .16 + Math.sin(G.t * 2 + fx * 6) * .04) }); } };
  if (C11_AR.id === 'ruong') { bedAt(2.25, 3.85, 5.03, 6); bedAt(5.15, 6.8, 5.03, 6); }
  const drawHouse = (hx, hy, s = 1) => {
    const q = k * s;
    c11Shade(g, sx(hx), sy(hy), 176 * q, 20 * q, .26); c11Spr(g, A.house, sx(hx), sy(hy), q);
    const ev = c11Eve(); if (ev > .1) for (const wx of [-100, 100]) { const gr = g.createRadialGradient(sx(hx) + wx * q, sy(hy) - 48 * q, 0, sx(hx) + wx * q, sy(hy) - 48 * q, 60 * q); gr.addColorStop(0, `rgba(255,214,110,${ev * .6})`); gr.addColorStop(1, 'rgba(255,214,110,0)'); g.fillStyle = gr; g.fillRect(sx(hx) + wx * q - 70 * q, sy(hy) - 120 * q, 140 * q, 140 * q); }
    for (let i = 0; i < 5; i++) { const a = (G.t * .3 + i / 5 + hx * .13) % 1, wd = c11Wind(4, 2) * 24 * q * a; g.fillStyle = `rgba(240,234,220,${.55 * (1 - a)})`; g.beginPath(); g.arc(sx(hx) + 70 * q + a * 26 * q + wd, sy(hy) - 216 * q - a * 100 * q, (8 + a * 16) * q, 0, 6.283); g.fill(); }
  };
  for (const hs of C11_AR.houses) E.push({ y: hs.y, d: () => hs.kind ? c11House2(g, hs, sx, sy, k) : drawHouse(hs.x, hs.y, hs.s || 1) });
  c11Extras(E, g, sx, sy, k, T); c11NewDraw(E, g, sx, sy, k, T);
  for (const st of C11_AR.stalls) E.push({ y: st.by, d: () => { c11Shade(g, sx(st.x0 + 1.5), sy(st.by), 110 * k, 14 * k); c11Spr(g, A.stalls[st.kind], sx(st.x0 + 1.5), sy(st.by), k); } });
  if (C11_AR.id === 'ruong') E.push({ y: 5, d: () => { c11Shade(g, sx(8.5), sy(4.95), 38 * k, 8 * k); c11Spr(g, A.box, sx(8.5), sy(4.95), k * 1.1); } }, { y: 5, d: () => { c11Shade(g, sx(10.5), sy(4.95), 40 * k, 8 * k); c11Chest(g, sx(10.5), sy(4.95), k); } });
  for (const sg of c11SignList()) {                                                // a signpost beside every way out: the pole stands in the row of its foot, the board (high up) is drawn over the trees beside it
    E.push({ y: sg.gy + .02, d: () => c11Sign(g, sx(sg.gx), sy(sg.gy), k, sg.text, 'pole') });
    E.push({ y: sg.gy + 1.6, d: () => c11Sign(g, sx(sg.gx), sy(sg.gy), k, sg.text, 'board') });
  }
  for (const d of SAVE11.drops) { if ((d.a || 'ruong') !== G.area) continue; const q = Math.min(1, d.t / d.dur), fx = d.x0 + (d.x - d.x0) * q, fy = d.y0 + (d.y - d.y0) * q, lift = Math.sin(q * Math.PI) * d.h * T * 1.1, rest = q >= 1 ? Math.sin(G.t * 3 + d.x * 5) * 1.5 : 0;
    E.push({ y: fy + .01, d: () => {
      const X = sx(fx), Y = sy(fy); g.fillStyle = 'rgba(29,25,21,.25)'; g.beginPath(); g.ellipse(X, Y, T * .17, T * .06, 0, 0, 6.283); g.fill();
      g.save(); g.translate(X, Y - lift - rest - T * .06); if (q < 1) g.rotate(q * 9);
      if (d.k === 'go') { g.fillStyle = '#a06a3c'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(-T * .2, -T * .07, T * .4, T * .14, T * .06); g.fill(); g.stroke(); g.fillStyle = '#d9b27a'; g.beginPath(); g.ellipse(T * .2, 0, T * .045, T * .07, 0, 0, 6.283); g.fill(); g.stroke(); }
      else if (d.k === 'co') { g.fillStyle = '#6fa54c'; g.strokeStyle = INK; g.lineWidth = 2; for (const a of [-.5, 0, .5]) { g.beginPath(); g.ellipse(a * T * .12, -T * .05, T * .05, T * .16, a, 0, 6.283); g.fill(); g.stroke(); } g.fillStyle = '#c8392d'; g.fillRect(-T * .06, T * .02, T * .12, T * .04); }
      else if (C11_FORAGE[d.k]) c11DrawForage(g, d.k, T);
      else if (C11_CROPS[d.k]) c11Spr(g, A.crop[d.k][3], 0, T * .1, k * .42);
      else { c11ItemIcon(g, d.k, 0, -T * .12, T * .42); if (d.q) { const tw = .5 + .5 * Math.sin(G.t * 4 + d.x); g.strokeStyle = `rgba(255,236,150,${tw})`; g.lineWidth = 2; for (const a of [0, 1.57]) { g.beginPath(); g.moveTo(Math.cos(a) * -9, -T * .45 + Math.sin(a) * -9); g.lineTo(Math.cos(a) * 9, -T * .45 + Math.sin(a) * 9); g.stroke(); } } }   // anything else: its little picture, a glint on a lost thing
      g.restore(); } }); }
  for (const b of G.bf) E.push({ y: 30, d: () => { const X = sx(b.x), Y = sy(b.y) - T * (.55 + .12 * Math.sin(b.ph * 2)), fl = Math.abs(Math.sin(G.t * 16 + b.ph)), wy = 9 * fl + 2; g.save(); g.translate(X, Y); g.fillStyle = b.col; g.strokeStyle = 'rgba(29,25,21,.8)'; g.lineWidth = 1.3; for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(sg * 5 * fl, -3, 5.5 * fl + .8, wy, sg * .5, 0, 6.283); g.fill(); g.stroke(); } g.fillStyle = INK; g.fillRect(-.8, -6, 1.6, 10); g.restore(); } });
  for (const s9 of Object.values(G.sellers)) E.push({ y: s9.y, d: () => c11Folk1(g, s9.p, sx(s9.x), sy(s9.y), -1, 0, false, T, null, V) });
  for (const b of G.beasts || []) E.push({ y: b.y, d: () => c11Beast(g, b, sx(b.x), sy(b.y), T / 64 * ({ ga: .95, trong: 1.05, vit: .95, lon: .95, bo: 1.02, ngua: 1.4, trau: 1.25, cho: .62, meo: .9 }[b.kind] || 1) * (b.young ? .65 : 1)) });
  for (const v of G.vill) E.push({ y: v.y, d: () => c11DrawVill(g, v, sx(v.x), sy(v.y), T, V) });   // at work, with pose and tool (viecngay.js)
  const arm = G.swing > 0 ? 1 - G.swing / C11_SW : null;
  E.push({ y: G.py, d: () => c11Folk1(g, { sort: 0, id: 99, groom: true }, sx(G.px), sy(G.py), G.face, G.ph, G.moving, T, arm, V) });
  E.sort((a, b) => a.y - b.y); for (const e of E) e.d();
  // sparks, words, speech
  for (const f of G.fx) {
    const p = f.t / f.life;
    if (f.k === 'chip') { g.save(); g.globalAlpha = Math.min(1, 2 * (1 - p)); g.translate(sx(f.x), sy(f.y)); g.rotate(f.rot); g.fillStyle = f.leaf ? '#5f9a4c' : f.col; g.strokeStyle = 'rgba(29,25,21,.7)'; g.lineWidth = 1; g.beginPath(); if (f.leaf) g.ellipse(0, 0, f.r, f.r * .5, 0, 0, 6.283); else g.rect(-f.r * 1.3, -f.r * .45, f.r * 2.6, f.r * .9); g.fill(); g.stroke(); g.restore(); }
    else if (f.k === 'dot') { g.globalAlpha = 1 - p; g.fillStyle = f.col; g.beginPath(); g.arc(sx(f.x), sy(f.y), f.r, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    else { g.globalAlpha = Math.min(1, 2.4 * (1 - p)); g.font = '800 15px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText(f.text, sx(f.x), sy(f.y - p * 1.2)); g.fillStyle = f.col; g.fillText(f.text, sx(f.x), sy(f.y - p * 1.2)); g.globalAlpha = 1; }
  }
  c11ChatDraw(g, sx, sy, T);                                          // what the villagers say to each other (viecngay.js)
  if (G.say) { const w = G.say.who; const wx = w.x, wy = w.y; c11Bubble(g, sx(wx), sy(wy) - T * 1.62 * ((w.p && w.p.sc) || 1), G.say.text, w.p.name); }
  // leaves and petals blown across
  for (let i = 0; i < 16; i++) {
    const sp = 26 + (i % 5) * 9, x = ((i * 137.5 + G.t * sp) % (W + 80)) - 40, y = (i * 83 + Math.sin(G.t * .9 + i) * 30 + G.t * (9 + (i % 3) * 5)) % (H + 40) - 20, r = G.t * 3 + i;
    g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = i % 4 === 0 ? '#f2a2b4' : i % 3 === 0 ? '#e0b440' : '#5f9a4c'; g.globalAlpha = .8; g.beginPath(); g.ellipse(0, 0, 5, 2.4, 0, 0, 6.283); g.fill(); g.restore();
  }
  // a soft dark rim
  { const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .42, W / 2, H / 2, Math.max(W, H) * .78); vg.addColorStop(0, 'rgba(18,48,36,0)'); vg.addColorStop(1, 'rgba(18,48,36,.42)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
  // evening light
  const e =Math.max(0, Math.min(1, (SAVE11.mins - 16.5 * 60) / (5.5 * 60)));
  if (e > 0) { g.fillStyle = `rgba(214,90,40,${e * .22})`; g.fillRect(0, 0, W, H); g.fillStyle = `rgba(30,36,80,${Math.max(0, e - .55) * .5})`; g.fillRect(0, 0, W, H); }
  if (e > .25) {                                                               // fireflies come out at dusk
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) {
      const wx = 2 + c11Hash(i, 1, 100) * 17 + Math.sin(G.t * .5 + i) * .6, wy = 2 + c11Hash(i, 2, 100) * 11 + Math.cos(G.t * .4 + i * 1.7) * .5, a = (e - .25) * 1.4 * (.5 + .5 * Math.sin(G.t * 2 + i * 3)), X = sx(wx), Y = sy(wy), gr = g.createRadialGradient(X, Y, 0, X, Y, 14);
      gr.addColorStop(0, `rgba(230,255,140,${Math.min(1, a)})`); gr.addColorStop(1, 'rgba(230,255,140,0)'); g.fillStyle = gr; g.fillRect(X - 14, Y - 14, 28, 28);
    }
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
  c11Hud(g, W, Hf, st); c11DrawMenu(g, W, Hf);
  if (G.fade) { const f = G.fade, al = f.t < .25 ? f.t / .25 : Math.max(0, 1 - (f.t - .25) / .3); g.fillStyle = `rgba(20,16,30,${al})`; g.fillRect(0, 0, W, Hf); }
  if (G.sleep) { const s = G.sleep, a = s.t < .8 ? s.t / .8 : s.t < 1.1 ? 1 : Math.max(0, 1 - (s.t - 1.1) / .8); g.fillStyle = `rgba(20,16,30,${a})`; g.fillRect(0, 0, W, Hf); if (a > .85) { g.fillStyle = '#f4ead0'; g.font = '900 30px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.did ? `Ngày ${SAVE11.day}` : 'Ngủ…', W / 2, Hf / 2); } }
}
function c11DrawMenu(g, W, H) {
  const m = C11.menu; if (!m) return;
  if (m.grid) { c11DrawGrid(g, W, H, m); return; }
  if (m.book) { c11DrawBook(g, W, H, m); return; }
  g.fillStyle = 'rgba(20,16,30,.5)'; g.fillRect(0, 0, W, H);
  const cols = m.cols || 1, pw = Math.min(W - 20, cols === 2 ? 420 : 360), gap = 8, rows = Math.ceil(m.rows.length / cols), cw0 = (pw - 24 - gap * (cols - 1)) / cols;
  g.font = '600 10.5px "Be Vietnam Pro", sans-serif'; const subs = m.rows.map(r => { const tx0 = (r.icon && c11Art().crop[r.icon]) ? 56 : 12; return c11Wrap(g, r.sub || '', cw0 - tx0 - 8).slice(0, 3); }), rh = Math.max(cols === 2 ? 62 : 58, 45 + 13 * Math.max(1, ...subs.map(l => l.length))), ph = 76 + rows * (rh + gap) + 26, px = (W - pw) / 2, py = Math.max(8, (H - ph) / 2);
  g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.roundRect(px, py, pw, ph, 14); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '900 22px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.title, W / 2, py + 26);
  g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.7)'; g.fillText('Ví: ' + c4Money(SAVE11.money), W / 2, py + 50);
  if (m.note) { g.fillStyle = '#2f6a4c'; g.font = '700 12px "Be Vietnam Pro", sans-serif'; g.fillText(m.note, W / 2, py + ph - 14); }
  const cw = (pw - 24 - gap * (cols - 1)) / cols, A = c11Art();
  m.rows.forEach((r, i) => {
    const x = px + 12 + (i % cols) * (cw + gap), y = py + 66 + Math.floor(i / cols) * (rh + gap), ok = r.ok !== undefined ? r.ok : SAVE11.money >= (r.price || 0);
    g.fillStyle = ok ? '#f7e3a4' : '#e6dcc0'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.roundRect(x, y, cw, rh, 10); g.fill(); g.stroke();
    let tx = x + 12;
    if (r.icon && A.crop[r.icon]) { g.save(); g.beginPath(); g.roundRect(x + 4, y + 4, 44, rh - 8, 7); g.clip(); g.fillStyle = 'rgba(111,165,76,.25)'; g.fillRect(x + 4, y + 4, 44, rh - 8); c11Spr(g, A.crop[r.icon][3], x + 26, y + rh - 8, .36); g.restore(); tx = x + 56; }
    g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 14px "Be Vietnam Pro", sans-serif'; g.fillText(r.name, tx, y + 17, cw - (tx - x) - 8);
    g.font = '600 10.5px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.75)'; const sl = subs[i]; sl.forEach((l, k) => g.fillText(l, tx, y + 34 + k * 13));
    g.fillStyle = '#a3332a'; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText(r.tag !== undefined ? r.tag : c4Money(r.price), tx, y + 34 + Math.max(1, sl.length) * 13 + 4, cw - (tx - x) - 8);
    C11.hud.push({ r: [x, y, cw, rh], modal: true, f: r.f });
  });
}
function c11DrawGrid(g, W, H, m) {                                   // the bag beside the chest, or the bag at a selling place
  g.fillStyle = 'rgba(20,16,30,.55)'; g.fillRect(0, 0, W, H);
  const chest = m.grid === 'chest', cols = chest ? 6 : 5, cs = Math.min(52, Math.floor((Math.min(W - 28, 420) - 24 - (cols - 1) * 6) / cols)), gap = 6;
  const gw = cols * cs + (cols - 1) * gap, pw = gw + 32, bagRows = 2, chestRows = chest ? 5 : 0;
  const ph = 60 + bagRows * (cs + gap) + (chest ? 30 + chestRows * (cs + gap) : 44) + 58, px = (W - pw) / 2, py = Math.max(8, (H - ph) / 2);
  g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(px, py, pw, ph, 14); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '900 20px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.title, W / 2, py + 24);
  let y = py + 50;
  const grid = (box, n, y0, label, tap) => {
    g.fillStyle = 'rgba(29,25,21,.7)'; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'left'; g.fillText(label, px + 16, y0 - 2);
    for (let i = 0; i < n; i++) {
      const x = px + 16 + (i % cols) * (cs + gap), yy = y0 + 8 + Math.floor(i / cols) * (cs + gap), sl = box[i];
      g.fillStyle = '#efe3c4'; g.strokeStyle = 'rgba(29,25,21,.55)'; g.lineWidth = 1.4; g.beginPath(); g.roundRect(x, yy, cs, cs, 7); g.fill(); g.stroke();
      if (sl) { c11ItemIcon(g, sl.id, x + cs / 2, yy + cs / 2, cs * .78, sl.n); if (!chest) { const p = c11Price(sl.id, m.mult); g.fillStyle = p ? '#2f6a4c' : '#a3332a'; g.font = '700 9px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(p ? `${p}đ` : '—', x + cs / 2, yy + 2); } }
      C11.hud.push({ r: [x, yy, cs, cs], modal: true, f: () => { if (sl) { m.sel = { id: sl.id }; tap(i); } } });
    }
    return y0 + 8 + Math.ceil(n / cols) * (cs + gap);
  };
  y = grid(SAVE11.bag, C11_BAG, y, `Túi đồ (${SAVE11.bag.filter(Boolean).length}/${C11_BAG})`, i => chest ? c11Move(SAVE11.bag, i, SAVE11.chest) : c11SellSlot(i, m.mult));
  if (chest) y = grid(SAVE11.chest, C11_CHEST, y + 18, `Rương (${SAVE11.chest.filter(Boolean).length}/${C11_CHEST})`, i => c11Move(SAVE11.chest, i, SAVE11.bag));
  else {
    const tot = SAVE11.bag.reduce((t, sl) => t + (sl ? c11Price(sl.id, m.mult) * sl.n : 0), 0), bw = 150, bx = W / 2 - bw / 2, byy = y + 6;
    g.fillStyle = tot ? '#a3332a' : '#c8b8a0'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.roundRect(bx, byy, bw, 32, 9); g.fill(); g.stroke();
    g.fillStyle = '#fbf4dc'; g.font = '800 13px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`Bán hết · ${c4Money(tot)}`, W / 2, byy + 16);
    C11.hud.push({ r: [bx, byy, bw, 32], modal: true, f: () => { let got = 0; for (let i = 0; i < C11_BAG; i++) if (SAVE11.bag[i] && c11Price(SAVE11.bag[i].id, m.mult)) got += c11SellSlot(i, m.mult); m.note = got ? `Bán được ${c4Money(got)}` : 'Không có gì bán được'; } });
    y = byy + 32;
  }
  const I = m.sel && C11_ITEMS[m.sel.id];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (I) { g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText(I.name, W / 2, py + ph - 38); g.fillStyle = 'rgba(29,25,21,.75)'; g.font = '600 10.5px "Be Vietnam Pro", sans-serif'; g.fillText(I.desc, W / 2, py + ph - 22, pw - 24); }
  if (m.note) { g.fillStyle = '#2f6a4c'; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.fillText(m.note, W / 2, py + ph - (I ? 8 : 20), pw - 20); }
}
/* an item's little picture: crops and seed packets from the crop art, wood, hay and the wood's finds as drawn in the world, the rest a
   picture for its kind in the item's own colour */
function c11ItemIcon(g, id, cx, cy, sz, n) {
  const I = C11_ITEMS[id], A = c11Art(), u = sz / 40; if (!I) return;
  g.save(); g.translate(cx, cy); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 1.4;
  const col = I.col;
  if (C11_CROPS[id]) c11Spr(g, A.crop[id][3], 0, sz * .46, sz / (C11_CROPS[id].dan || id === 'ngo' ? 95 : id === 'lua' ? 62 : 52));
  else if (id.startsWith('h_') && C11_CROPS[id.slice(2)]) { g.fillStyle = '#efe3c4'; g.beginPath(); g.roundRect(-11 * u, -15 * u, 22 * u, 28 * u, 3 * u); g.fill(); g.stroke(); g.fillStyle = col; g.fillRect(-9 * u, -13 * u, 18 * u, 6 * u); c11Spr(g, A.crop[id.slice(2)][3], 0, 11 * u, sz / 190); }
  else if (id === 'go') { g.fillStyle = '#a06a3c'; g.beginPath(); g.roundRect(-13 * u, -5 * u, 24 * u, 10 * u, 5 * u); g.fill(); g.stroke(); g.fillStyle = '#d9b27a'; g.beginPath(); g.ellipse(11 * u, 0, 3 * u, 5 * u, 0, 0, 6.283); g.fill(); g.stroke(); }
  else if (id === 'nam' || id === 'rau' || id === 'qua') { g.translate(0, 8 * u); c11DrawForage(g, id, 64 * u); }
  else if (I.cat === 'ca') { g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 13 * u, 6 * u, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-11 * u, 0); g.lineTo(-18 * u, -6 * u); g.lineTo(-18 * u, 6 * u); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(2 * u, -2.5 * u, 7 * u, 1.6 * u, 0, 0, 6.283); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(8 * u, -1.5 * u, 1.3 * u, 0, 6.283); g.fill(); }
  else if (I.cat === 'thu') { g.fillStyle = col; g.beginPath(); g.ellipse(0, 1 * u, 9 * u, 12 * u, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-3 * u, -4 * u, 2.4 * u, 4 * u, -.3, 0, 6.283); g.fill(); }
  else if (I.cat === 'mon') { g.fillStyle = col; g.beginPath(); g.ellipse(0, -3 * u, 13 * u, 6 * u, 0, 0, 6.283); g.fill(); g.fillStyle = '#f4f0ea'; g.beginPath(); g.moveTo(-15 * u, -2 * u); g.quadraticCurveTo(0, 18 * u, 15 * u, -2 * u); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3a5a9a'; g.beginPath(); g.moveTo(-12 * u, 3 * u); g.quadraticCurveTo(0, 9 * u, 12 * u, 3 * u); g.stroke(); }
  else if (I.cat === 'che') { g.fillStyle = '#8a5a3a'; g.beginPath(); g.moveTo(-6 * u, -14 * u); g.lineTo(6 * u, -14 * u); g.quadraticCurveTo(15 * u, -6 * u, 11 * u, 12 * u); g.lineTo(-11 * u, 12 * u); g.quadraticCurveTo(-15 * u, -6 * u, -6 * u, -14 * u); g.fill(); g.stroke(); g.fillStyle = col; g.beginPath(); g.ellipse(0, -2 * u, 9 * u, 6 * u, 0, 0, 6.283); g.fill(); g.stroke(); }
  else if (I.cat === 'quy') { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 1.047 - 1.57, r = i % 2 ? 8 : 13; g.lineTo(Math.cos(a) * r * u, Math.sin(a) * r * u); } g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-3 * u, -4 * u, 2.4 * u, 0, 6.283); g.fill(); }
  else if (I.cat === 'truyen') { g.fillStyle = '#e8dcb8'; g.beginPath(); g.roundRect(-12 * u, -10 * u, 24 * u, 20 * u, 2 * u); g.fill(); g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(6 * u, 4 * u, 4 * u, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(29,25,21,.5)'; g.beginPath(); for (let i = 0; i < 3; i++) { g.moveTo(-8 * u, (-5 + i * 4) * u); g.lineTo(2 * u, (-5 + i * 4) * u); } g.stroke(); }
  else if (I.cat === 'rung') { g.fillStyle = col; g.beginPath(); g.moveTo(0, 14 * u); g.quadraticCurveTo(-14 * u, 0, 0, -14 * u); g.quadraticCurveTo(14 * u, 0, 0, 14 * u); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0, 13 * u); g.lineTo(0, -10 * u); g.stroke(); }
  else if (I.cat === 'do') { g.fillStyle = col; g.beginPath(); g.roundRect(-12 * u, -6 * u, 24 * u, 16 * u, 4 * u); g.fill(); g.stroke(); g.strokeStyle = '#5b2f1f'; g.lineWidth = 2.4 * u; g.beginPath(); g.arc(0, -6 * u, 7 * u, 3.14, 0); g.stroke(); }
  else { g.fillStyle = col; g.beginPath(); g.roundRect(-11 * u, -9 * u, 22 * u, 18 * u, 5 * u); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-8 * u, -6 * u, 8 * u, 3 * u); }
  g.restore();
  if (n > 1) { g.font = `800 ${Math.max(9, Math.round(sz * .28))}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.lineWidth = 3; g.strokeStyle = '#fbf4dc'; g.strokeText(n, cx + sz * .56, cy + sz * .58); g.fillStyle = INK; g.fillText(n, cx + sz * .56, cy + sz * .58); }
}
function c11Chest(g, X, Y, k) {                                       // a lacquered wooden chest with brass corners
  g.save(); g.translate(X, Y); g.scale(k, k); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 2.2;
  g.fillStyle = '#8a3a22'; g.beginPath(); g.roundRect(-26, -30, 52, 30, 3); g.fill(); g.stroke();
  g.fillStyle = '#a84a2a'; g.beginPath(); g.moveTo(-28, -30); g.quadraticCurveTo(0, -44, 28, -30); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#d8a840'; g.lineWidth = 2.6; for (const x of [-18, 18]) { g.beginPath(); g.moveTo(x, -37); g.lineTo(x, -1); g.stroke(); } g.beginPath(); g.moveTo(-26, -18); g.lineTo(26, -18); g.stroke();
  g.fillStyle = '#e8c050'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.roundRect(-5, -24, 10, 10, 2); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(0, -19, 1.4, 0, 6.283); g.fill();
  g.restore();
}
/* the signposts beside the ways out on the map's edge: where each stands (world tiles) and which exit tile it points to */
function c11SignList() {
  const out = [];
  for (const [key, ex] of Object.entries(C11_AR.exits)) {
    const [ex0, ey0] = key.split(',').map(Number); if (ex0 > 0 && ey0 > 0 && ex0 < C11_W - 1 && ey0 < C11_H - 1) continue;   // a gate inside the map has its own board
    const ix = ex0 === 0 ? 1 : ex0 === C11_W - 1 ? -1 : 0, iy = ey0 === 0 ? 1 : ey0 === C11_H - 1 ? -1 : 0;
    out.push({ gx: ex0 + .5 + ix * .9 + (iy ? 1.3 : 0), gy: ey0 + .55 + iy * .9 - (ix ? 1 : 0), ex0, ey0, text: ex[3] });
  }
  return out;
}
function c11Sign(g, X, Y, k, text, part) {
  g.save(); g.translate(X, Y); g.scale(k, k);
  if (part !== 'board') {
    g.fillStyle = 'rgba(22,46,34,.24)'; g.beginPath(); g.ellipse(6, 0, 20, 5, 0, 0, 6.283); g.fill();
    g.strokeStyle = INK; g.lineWidth = 3; g.fillStyle = '#8a5a38'; g.beginPath(); g.roundRect(-3, -62, 7, 62, 2); g.fill(); g.stroke();
  }
  if (part !== 'pole') {
    g.strokeStyle = INK; g.lineWidth = 3; g.font = '800 15px "Be Vietnam Pro", sans-serif'; const w = g.measureText(text).width + 22;
    g.fillStyle = '#e6c48c'; g.beginPath(); g.roundRect(-w / 2, -92, w, 32, 6); g.fill(); g.stroke();
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, -75);
  }
  g.restore();
}
function c11DrawForage(g, kd, T) {                                   // small things of the wood, drawn about their foot
  g.strokeStyle = INK; g.lineWidth = 2; g.lineJoin = 'round';
  if (kd === 'nam') {
    g.fillStyle = '#f4ead0'; g.beginPath(); g.roundRect(-T * .05, -T * .1, T * .1, T * .17, 3); g.fill(); g.stroke();
    g.fillStyle = '#b0523a'; g.beginPath(); g.ellipse(0, -T * .1, T * .17, T * .12, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#f4ead0'; for (const x of [-.07, .05]) { g.beginPath(); g.arc(T * x, -T * .15, T * .02, 0, 6.283); g.fill(); }
  } else if (kd === 'rau') {
    g.fillStyle = '#4f8a3e'; for (const a of [-.7, 0, .7]) { g.beginPath(); g.ellipse(Math.sin(a) * T * .1, -T * .06 - Math.cos(a) * T * .06, T * .05, T * .13, a, 0, 6.283); g.fill(); g.stroke(); }
  } else {
    g.strokeStyle = '#5b2f1f'; g.beginPath(); g.moveTo(0, -T * .2); g.lineTo(0, -T * .06); g.stroke(); g.strokeStyle = INK;
    g.fillStyle = '#c8402f'; for (const x of [-.07, .07]) { g.beginPath(); g.arc(T * x, -T * .06, T * .07, 0, 6.283); g.fill(); g.stroke(); }
    g.fillStyle = '#4f8a3e'; g.beginPath(); g.ellipse(T * .04, -T * .2, T * .06, T * .03, -.5, 0, 6.283); g.fill(); g.stroke();
  }
}
const c11Ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
// keyframes per tool: [p, lean (forward bend), arm angle, tool angle, body drop, head dip]; p = how far through the swing
// keyframes per tool: [p, lean (forward bend), hand x, hand y (from the shoulder), tool angle, body drop, head dip]; p = how far through the swing
const C11_REST = [0, .05, 22, 24, .35, 0, 0];
const C11_KEYS = {
  hoe: [C11_REST, [.42, -.12, 8, -46, -1.0, 0, -2], [.6, .34, 36, 28, 1.85, 5, 7], [.74, .3, 34, 30, 1.8, 5, 6], [1, ...C11_REST.slice(1)]],
  axe: [C11_REST, [.42, -.16, 6, -47, -1.2, 0, -3], [.6, .4, 34, 30, 1.9, 4, 8], [.74, .36, 33, 30, 1.85, 4, 7], [1, ...C11_REST.slice(1)]],
  sickle: [C11_REST, [.18, .3, 30, 12, 1.5, 5, 6], [.3, .34, 46, 14, 1.5, 6, 8], [.58, .38, 14, 14, 1.5, 6, 9], [.8, .32, 34, 14, 1.5, 5, 7], [1, ...C11_REST.slice(1)]],
  can: [C11_REST, [.35, .1, 32, 10, 1.0, 0, 0], [.7, .1, 32, 10, 2.0, 0, 0], [1, ...C11_REST.slice(1)]],
  seed: [C11_REST, [.4, .25, 30, 20, .35, 4, 4], [.7, .25, 38, 26, .35, 4, 4], [1, ...C11_REST.slice(1)]],
};
const C11_HIT = { hoe: .6, axe: .6, sickle: .5, can: .5, seed: .5 };
function c11Pose(tool, p) {
  const K = C11_KEYS[C11_KEYS[tool] ? tool : 'seed'];
  for (let i = 1; i < K.length; i++) if (p <= K[i][0]) { const A = K[i - 1], B = K[i], t = c11Ease((p - A[0]) / (B[0] - A[0])); return [1, 2, 3, 4, 5, 6].map(j => A[j] + (B[j] - A[j]) * t); }
  return C11_REST.slice(1);
}
function c11Tool(g, tool, hx, hy, phi) {
  if (tool !== 'hoe' && tool !== 'axe' && tool !== 'can' && tool !== 'sickle') return;
  g.save(); g.translate(hx, hy); g.rotate(phi); g.lineCap = 'round'; g.lineJoin = 'round';
  const L = tool === 'axe' ? 52 : tool === 'sickle' ? 34 : 68;
  if (tool === 'sickle') {                                           // a short wooden handle and a crescent blade curving forward
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 12); g.lineTo(0, -L); g.stroke(); g.strokeStyle = '#a06a3c'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 12); g.lineTo(0, -L); g.stroke();
    g.fillStyle = '#a8b0b4'; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-2, -L - 2); g.quadraticCurveTo(26, -L - 18, 34, -L + 14); g.quadraticCurveTo(24, -L - 4, 2, -L + 8); g.closePath(); g.fill(); g.stroke();
  } else if (tool === 'can') {
    g.fillStyle = '#3f8a86'; g.strokeStyle = INK; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-14, -8); g.lineTo(12, -8); g.lineTo(14, 18); g.lineTo(-16, 18); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(12, -2); g.lineTo(30, -16); g.lineTo(33, -11); g.lineTo(13, 6); g.stroke(); g.beginPath(); g.arc(-3, -10, 10, Math.PI, 0); g.stroke();
  } else {
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -L); g.stroke();
    g.strokeStyle = '#a06a3c'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -L); g.stroke();
    if (tool === 'hoe') { g.fillStyle = '#6b6560'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -L - 3); g.lineTo(4, -L - 3); g.lineTo(26, -L + 16); g.lineTo(18, -L + 22); g.lineTo(2, -L + 8); g.closePath(); g.fill(); g.stroke(); }
    else c11AxeHead(g, -L);
  }
  g.restore();
}
/* the player: a farmer mouse of our own (straw hat, brown shirt, red sash). The body has no arm; the arm is a separate limb of two bones
   (upper arm + forearm, solved so the hand reaches where the pose says) drawn over the body, holding the tool. */
const C11_LU = 24;
let C11RIG = null;
function c11Rig() {
  if (C11RIG) return C11RIG;
  const R = {};
  R.tail = MICE.groom.tail; R.leg = MICE.groom.leg; R.body = MICE.groom.body; R.head = MICE.groom.head;   // chương IV's husband (same look)
  R.upper = part([-10, -10, C11_LU + 10, 10], a => { a.fk('green', ell(C11_LU / 2, 0, C11_LU / 2 + 7, 7.5), 2); });
  R.fore = part([-10, -10, C11_LU + 16, 10], a => { a.fk('green', ell(C11_LU / 2 - 1, 0, C11_LU / 2 + 5, 6.5), 2); a.fk('ltred', circ(C11_LU + 2, 0, 6.5), 1.8); });
  return (C11RIG = R);
}
function c11Player(g, x, y, s, face, ph, moving, p) {
  const R = c11Rig(), tool = C11_SLOTS[C11.slot], sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : 0, hy = -45 + bob;
  let [lean, hx, hyy, phi, drop, hd] = p === null ? [C11_REST[1] + sw * .03, C11_REST[2] + sw * 7, C11_REST[3] - Math.abs(sw) * 2, C11_REST[4] + sw * .1, 0, 0] : c11Pose(tool, p);
  g.save(); g.translate(x, y); g.scale(face * s, s);
  dp(g, R.tail, -18, hy + 2 + drop * .6, Math.sin(C11.t * 2.4) * .12);
  dp(g, R.leg, 6, hy, sw * .55);
  g.save(); g.translate(0, drop); g.translate(0, hy + 8); g.rotate(lean); g.translate(0, -(hy + 8));
  dp(g, R.body, 0, hy, .04);
  dp(g, R.head, 6 + hd * .5, hy - 60 + hd, hd * .035);
  const sx0 = 4, sy0 = hy - 48;                                         // shoulder
  let dx = hx, dy = hyy, d = Math.hypot(dx, dy); const reach = C11_LU * 2 - 1; if (d > reach) { dx *= reach / d; dy *= reach / d; d = reach; }
  const mx = sx0 + dx / 2, my = sy0 + dy / 2, hh = Math.sqrt(Math.max(0, C11_LU * C11_LU - d * d / 4)); let px = -dy / d, py = dx / d; if (py < 0) { px = -px; py = -py; }
  const ex = mx + px * hh, ey = my + py * hh, hx2 = sx0 + dx, hy2 = sy0 + dy;
  c11Tool(g, tool, hx2, hy2, phi);
  dp(g, R.upper, sx0, sy0, Math.atan2(ey - sy0, ex - sx0));
  dp(g, R.fore, ex, ey, Math.atan2(hy2 - ey, hx2 - ex));
  g.restore();
  dp(g, R.leg, -2, hy, -sw * .55);
  g.restore();
}
function c11AxeHead(g, y) {                                        // a wood-chopper's axe: a short poll behind the handle, a wide blade with a curved edge in front
  g.fillStyle = '#5b5550'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.roundRect(-11, y - 7, 11, 18, 3); g.fill(); g.stroke();
  g.fillStyle = '#a8b0b4'; g.beginPath(); g.moveTo(0, y - 8); g.lineTo(12, y - 13); g.lineTo(28, y - 24); g.quadraticCurveTo(46, y + 2, 28, y + 28); g.lineTo(12, y + 17); g.lineTo(0, y + 12); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#f4f4ee'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(30, y - 19); g.quadraticCurveTo(42, y + 2, 30, y + 23); g.stroke();
  g.strokeStyle = '#7b8488'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(6, y - 2); g.lineTo(24, y + 1); g.stroke();
}
function c11Duck(g, X, Y, u, face, drake) {                       // a mallard on the water: drake with a glossy green head and white collar, duck mottled brown
  g.save(); g.translate(X, Y); g.scale(face * u, u); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 1.4;
  g.fillStyle = 'rgba(30,60,70,.25)'; g.beginPath(); g.ellipse(0, 3, 18, 4, 0, 0, 6.283); g.fill();
  const body = new Path2D(); body.moveTo(-17, -8); body.quadraticCurveTo(-20, -15, -12, -13); body.quadraticCurveTo(0, -17, 10, -12); body.quadraticCurveTo(17, -8, 14, -1); body.quadraticCurveTo(0, 3, -12, 0); body.closePath();
  g.fillStyle = drake ? '#d8d2c4' : '#a5835a'; g.fill(body);
  g.fillStyle = drake ? '#8a5a3c' : '#8a6a44'; g.beginPath(); g.ellipse(8, -9, 7, 5, .3, 0, 6.283); g.fill();          // breast
  g.fillStyle = drake ? '#9a9286' : '#6f5434'; g.beginPath(); g.moveTo(-14, -9); g.quadraticCurveTo(-2, -15, 8, -9); g.quadraticCurveTo(-2, -5, -14, -6); g.closePath(); g.fill();   // wing
  g.fillStyle = '#3b5fb0'; g.fillRect(-6, -9.5, 6, 2); g.fillStyle = '#f4f0e6'; g.fillRect(-6, -7.5, 6, .8);
  if (!drake) { g.fillStyle = 'rgba(60,40,20,.5)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-12 + i * 3, -6 + (i % 2) * 2, 1.2, .7, .5, 0, 6.283); g.fill(); } }
  g.fillStyle = drake ? '#1f2a2a' : '#6f5434'; g.beginPath(); g.moveTo(-15, -10); g.lineTo(-22, -15); g.lineTo(-18, -8); g.closePath(); g.fill(); if (drake) { g.strokeStyle = '#1f2a2a'; g.lineWidth = 1.2; g.beginPath(); g.arc(-18, -15, 2, 1.2, 4); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.4; }
  g.stroke(body);
  g.fillStyle = drake ? '#2f7a4a' : '#8a6a44'; g.beginPath(); g.moveTo(9, -11); g.quadraticCurveTo(10, -20, 13, -22); g.lineTo(17, -21); g.quadraticCurveTo(15, -16, 14, -10); g.closePath(); g.fill(); g.stroke();   // neck
  if (drake) { g.strokeStyle = '#f4f0e6'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(10, -13.5); g.lineTo(14.5, -13); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.4; }
  g.fillStyle = drake ? '#2f7a4a' : '#8a6a44'; g.beginPath(); g.ellipse(15, -23, 5.6, 4.6, 0, 0, 6.283); g.fill(); g.stroke();
  if (drake) { g.fillStyle = 'rgba(160,230,190,.6)'; g.beginPath(); g.ellipse(14, -25, 2.4, 1.2, -.3, 0, 6.283); g.fill(); } else { g.strokeStyle = '#3a2a1a'; g.lineWidth = 1; g.beginPath(); g.moveTo(12, -23.5); g.lineTo(19, -23); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.4; }
  g.fillStyle = drake ? '#e8c440' : '#d9822a'; g.beginPath(); g.moveTo(19.5, -24); g.quadraticCurveTo(26, -23, 26.5, -21); g.quadraticCurveTo(23, -20, 19.5, -21); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(16.5, -24.2, 1.1, 0, 6.283); g.fill();
  g.restore();
}
/* farm animals (owner: hens, pigs, cows, horses), drawn in ink and flat colours like the rest; ph = walking phase, dn = head down (pecking / grazing) */
/* cattle, buffalo, pig and dog drawn with real silhouettes: a body outline with back, belly and rump, legs that swing from the hip
   and bend at the knee, hooves or paws, a head that dips to graze or sniff; flat colours lit along the back and shaded under the belly */
function c11Beast2(g, b, X, Y, u) {
  const kd = b.kind, mv = b.moving, ph = b.ph, dn = b.dn || 0, sw = mv ? Math.sin(ph) : 0;
  const pal = {
    bo: { c: '#f0b45c', d: '#d9953c', l: '#f8cf86', belly: '#f6cd8a', hoof: '#6b4128' },
    trau: { c: '#8f8884', d: '#6f6865', l: '#aaa39f', belly: '#7d7673', hoof: '#4a3830' },
    lon: { c: '#f4ae98', d: '#e48f80', l: '#f9c8b4', belly: '#f8c4b0', hoof: '#6a4430' },
    cho: { c: '#eaa44c', d: '#c117f2c', l: '#f6c070', belly: '#f9dcaa', hoof: '#5a3a24' },
  }[kd];
  const P = (pts, closed = true) => smooth(pts, closed);
  g.save(); g.translate(X, Y); g.scale(b.face * u, u); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 1.3; g.strokeStyle = INK;
  const fillP = (p, col, stroke = true) => { g.fillStyle = col; g.fill(p); if (stroke) g.stroke(p); };
  // a leg: thigh from the hip, a knee, a slim shank, a hoof (or a paw); ang swings it
  const leg = (hx, hy, len, w, ang, col, far, paw) => {
    g.save(); g.translate(hx, hy); g.rotate(ang);
    const p = P([[-w * .55, 0], [w * .5, 0], [w * .42, len * .45], [w * .26, len * .62], [w * .3, len - 2], [-w * .3, len - 2], [-w * .3, len * .62], [-w * .5, len * .4]]);
    fillP(p, far ? pal.d : col);
    if (paw) { g.fillStyle = far ? pal.d : col; g.beginPath(); g.ellipse(w * .25, len - 1, w * .42, 1.3, 0, 0, 6.283); g.fill(); g.stroke(); }
    else { g.fillStyle = pal.hoof; g.beginPath(); g.moveTo(-w * .34, len - 3); g.lineTo(w * .36, len - 3); g.lineTo(w * .44, len); g.lineTo(-w * .4, len); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  };
  g.fillStyle = 'rgba(22,46,34,.22)'; g.beginPath(); g.ellipse(2, 0, kd === 'cho' ? 15 : kd === 'lon' ? 20 : 27, kd === 'cho' ? 3.4 : 5, 0, 0, 6.283); g.fill();
  if (kd === 'bo') {                                                   // the cow of the owner's picture: plump golden body, small head with a cream muzzle, pink ear, little horns, a pink udder, brown hooves and tail tuft
    const H = 15, s1 = sw * .3, OUT = '#6a4222', wag = Math.sin(C11.t * 2.4 + b.x) * 2, CR = '#fbe3b0';
    g.strokeStyle = OUT; g.lineWidth = 1.7;
    leg(-15, -H, H, 9, -s1, pal.c, true); leg(12, -H, H, 8.5, s1, pal.c, true);
    g.strokeStyle = OUT; g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-25, -34); g.quadraticCurveTo(-32, -26, -30 + wag, -12); g.stroke();       // tail, then its tuft
    g.strokeStyle = pal.d; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-25, -34); g.quadraticCurveTo(-32, -26, -30 + wag, -12); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.7; g.fillStyle = '#7a4a28'; g.beginPath(); g.ellipse(-30 + wag, -8, 3.2, 5, wag * .05, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#f2b2a4'; g.beginPath(); g.ellipse(-6, -13, 7.5, 5.4, 0, 0, 6.283); g.fill(); g.stroke();                                                             // udder (the body covers its top)
    for (const tx of [-9, -4, 1]) { g.beginPath(); g.ellipse(tx, -8.5, 1.5, 2.2, 0, 0, 6.283); g.fill(); }
    const body = P([[-27, -29], [-23, -40], [-9, -43.5], [6, -42.5], [16, -38.5], [21.5, -30], [19.5, -20], [10, -14.5], [-5, -13], [-18, -14.5], [-27, -21]]);
    const head = P([[11, -42], [17, -46.5], [24, -47], [30, -43.5], [35.5, -37.5], [37.5, -32], [36, -27], [30, -25], [23, -27.5], [16, -31.5], [11, -34]]);
    const hd = () => { g.translate(14, -30); g.rotate(dn * .6); g.translate(-14, 30); };
    g.save(); hd();                                                                                                    // two small cream horns behind the head
    for (const hx of [0, 8]) { g.fillStyle = CR; g.strokeStyle = OUT; g.lineWidth = 1.5; g.beginPath(); g.moveTo(17 + hx, -44); g.quadraticCurveTo(15 + hx, -50, 19 + hx, -53); g.quadraticCurveTo(22 + hx, -50, 22 + hx, -44); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
    g.strokeStyle = OUT; g.lineWidth = 3.4; g.stroke(body); g.save(); hd(); g.stroke(head); g.restore(); g.lineWidth = 1.7;
    g.fillStyle = pal.c; g.fill(body);
    g.save(); g.clip(body);
    g.fillStyle = pal.belly; g.beginPath(); g.ellipse(-2, -13, 26, 6.5, 0, 0, 6.283); g.fill();
    g.fillStyle = pal.l; g.beginPath(); g.ellipse(-4, -43, 22, 4.5, 0, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(217,149,60,.35)'; g.beginPath(); g.ellipse(-18, -30, 7, 9, .3, 0, 6.283); g.fill();
    g.restore();
    g.strokeStyle = OUT; g.lineWidth = 1.7;
    g.save(); hd(); g.fillStyle = pal.c; g.fill(head);
    g.save(); g.clip(head); g.fillStyle = pal.l; g.beginPath(); g.ellipse(20, -46, 14, 4, .1, 0, 6.283); g.fill();
    g.fillStyle = CR; g.beginPath(); g.ellipse(32.5, -31, 6, 8, .15, 0, 6.283); g.fill(); g.restore();                // the cream blaze and muzzle
    g.fillStyle = '#f2b2a4'; g.beginPath(); g.ellipse(36.6, -31.5, 1.6, 1.2, 0, 0, 6.283); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.beginPath(); g.moveTo(30.5, -27.5); g.quadraticCurveTo(34, -26.2, 36.8, -28.4); g.stroke(); g.lineWidth = 1.7;    // smile
    g.fillStyle = 'rgba(232,130,120,.5)'; g.beginPath(); g.ellipse(25.5, -33, 3.6, 2.6, 0, 0, 6.283); g.fill();            // rosy cheek
    g.fillStyle = INK; g.beginPath(); g.arc(29.5, -38, 1.7, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(30, -38.5, .5, 0, 6.283); g.fill();
    g.fillStyle = pal.c; g.strokeStyle = OUT; g.beginPath(); g.moveTo(17, -37); g.quadraticCurveTo(7, -39, 4, -32); g.quadraticCurveTo(10, -26, 18, -31); g.closePath(); g.fill(); g.stroke();   // ear
    g.fillStyle = '#f2a29a'; g.beginPath(); g.moveTo(15.5, -35.5); g.quadraticCurveTo(9, -36, 7, -32); g.quadraticCurveTo(11, -29.5, 15.5, -32.5); g.closePath(); g.fill();
    g.restore();
    leg(-20, -H, H, 9.5, s1, pal.c, false); leg(8, -H, H, 9, -s1, pal.c, false);
  } else if (kd === 'trau') {                                                 // the buffalo of the owner's picture: stocky grey-brown body, short legs, swept-back tan horns, pink ear, rosy cheek, brown outline
    const H = 15, s1 = sw * .3, OUT = '#46302a', wag = Math.sin(C11.t * 2.2 + b.x) * 2;
    g.strokeStyle = OUT; g.lineWidth = 1.7;
    leg(-14, -H, H, 9, -s1, pal.c, true); leg(13, -H, H, 8.5, s1, pal.c, true);
    g.strokeStyle = OUT; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, -32); g.quadraticCurveTo(-31, -24, -29 + wag, -11); g.stroke();   // tail, then its tuft
    g.strokeStyle = pal.d; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-24, -32); g.quadraticCurveTo(-31, -24, -29 + wag, -11); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.7; g.fillStyle = '#5a3f33'; g.beginPath(); g.ellipse(-29 + wag, -7, 3.2, 5, wag * .05, 0, 6.283); g.fill(); g.stroke();
    const body = P([[-27, -29], [-22, -39], [-8, -43], [6, -42], [15, -38], [20, -29], [18, -18], [8, -12], [-6, -11], [-19, -13], [-27, -20]]);
    const head = P([[6, -40], [16, -42], [26, -39], [34, -32], [39, -25], [39.5, -18], [34, -13], [25, -14], [16, -19], [6, -25]]);
    const hd = () => { g.translate(14, -28); g.rotate(dn * .55); g.translate(-14, 28); };
    const horn = (dx, dy, col) => { const P = [[17, -39], [3, -38], [-9, -42], [-5, -54]], at = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
      for (const pass of [0, 1]) { g.fillStyle = pass ? col : OUT; for (let n = 0; n <= 60; n++) { const t = n / 60, q = at(t), w = 9 - 6.2 * t + (pass ? -2.4 : 0); g.beginPath(); g.arc(q[0] + dx, q[1] + dy, Math.max(.6, w / 2), 0, 6.283); g.fill(); } } };
    g.save(); hd(); horn(9, -3, '#bf9d72'); g.restore();                                          // the far horn peeps from behind the head
    g.lineWidth = 3.4; g.stroke(body); g.save(); hd(); g.stroke(head); g.restore(); g.lineWidth = 1.7;
    g.fillStyle = pal.c; g.fill(body);
    g.save(); g.clip(body);
    g.fillStyle = pal.belly; g.beginPath(); g.ellipse(-2, -12, 26, 6.5, 0, 0, 6.283); g.fill();
    g.fillStyle = pal.l; g.beginPath(); g.ellipse(-4, -41, 22, 4.5, 0, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(70,48,42,.28)'; g.lineWidth = .7; for (let i = 0; i < 22; i++) { const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1, x = -24 + r1 * 42, y = -38 + r2 * 22, an = (r1 + r2) * 6.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * 2.2, y + Math.sin(an) * 1.2); g.stroke(); }
    g.restore();
    g.strokeStyle = OUT; g.lineWidth = 1.7;
    g.save(); hd(); g.fillStyle = pal.c; g.fill(head);
    g.save(); g.clip(head); g.fillStyle = pal.l; g.beginPath(); g.ellipse(20, -43, 16, 4, .1, 0, 6.283); g.fill(); g.restore();
    g.fillStyle = '#a39b97'; g.beginPath(); g.ellipse(35, -19, 6.2, 5.6, .25, 0, 6.283); g.fill(); g.stroke();       // muzzle
    g.fillStyle = OUT; g.beginPath(); g.ellipse(38, -20.5, 1, 1.5, 0, 0, 6.283); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.beginPath(); g.moveTo(30, -14.6); g.quadraticCurveTo(34, -13.2, 38, -15.6); g.stroke(); g.lineWidth = 1.7;   // smile
    g.fillStyle = 'rgba(224,128,128,.55)'; g.beginPath(); g.ellipse(27, -22, 4, 2.8, 0, 0, 6.283); g.fill();     // rosy cheek
    g.fillStyle = INK; g.beginPath(); g.arc(30, -29, 1.8, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(30.6, -29.6, .6, 0, 6.283); g.fill();
    g.fillStyle = pal.c; g.beginPath(); g.moveTo(17, -32); g.quadraticCurveTo(8, -33, 4, -26); g.quadraticCurveTo(10, -22, 18, -26); g.closePath(); g.fill(); g.stroke();   // ear
    g.fillStyle = '#d98f84'; g.beginPath(); g.moveTo(15.5, -30.5); g.quadraticCurveTo(10, -30.5, 7.3, -27.4); g.quadraticCurveTo(11, -25.6, 15.5, -28); g.closePath(); g.fill();
    horn(0, 0, '#c11a77c');
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); 
    g.restore();
    leg(-19, -H, H, 9.5, s1, pal.c, false); leg(8, -H, H, 9, -s1, pal.c, false);
  } else if (kd === 'lon') {                                           // the pig of the owner's picture: a plump pink pig, a folded ear, a round snout, a curly tail, dark hooves
    const H = 5, s1 = sw * .3, OUT = '#7a4a3a';
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    leg(-17, -H - 3, H + 3, 9, -s1, pal.c, true); leg(13, -H - 3, H + 3, 8.5, s1, pal.c, true);
    g.save(); g.translate(0, 7);                                          // a low, round body on short legs, a big head: cute
    g.strokeStyle = OUT; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -33); g.quadraticCurveTo(-32, -37, -31, -42); g.arc(-28.5, -43.5, 3.2, 3.3, 8.2); g.stroke();   // the curly tail
    g.strokeStyle = pal.c; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-26, -33); g.quadraticCurveTo(-32, -37, -31, -42); g.arc(-28.5, -43.5, 3.2, 3.3, 8.2); g.stroke();
    const body = P([[-27, -28], [-22, -38], [-8, -42.5], [8, -42.5], [18, -38.5], [24, -30], [22, -20], [12, -14.5], [-4, -13], [-18, -14.5], [-27, -20]]);
    const head = P([[17, -41], [24, -46], [32, -44.5], [38, -39], [42, -34], [43, -29], [40, -25], [33, -24.5], [26, -26.5], [19, -31]]);
    const hd = () => { g.translate(18, -32); g.rotate(dn * .5); g.scale(1.2, 1.2); g.translate(-18, 32); };
    g.strokeStyle = OUT; g.lineWidth = 3.2; g.stroke(body); g.save(); hd(); g.stroke(head); g.restore(); g.lineWidth = 1.6;
    g.fillStyle = pal.c; g.fill(body);
    g.save(); g.clip(body); g.fillStyle = pal.belly; g.beginPath(); g.ellipse(2, -14, 26, 6, 0, 0, 6.283); g.fill(); g.fillStyle = pal.l; g.beginPath(); g.ellipse(-3, -43, 22, 4.5, 0, 0, 6.283); g.fill(); g.restore();
    g.save(); hd(); g.fillStyle = pal.c; g.fill(head);
    g.fillStyle = '#ee9a8a'; g.strokeStyle = OUT; g.lineWidth = 1.5; g.beginPath(); g.ellipse(43, -29.5, 3.6, 5.6, .1, 0, 6.283); g.fill(); g.stroke();      // the snout disc
    g.fillStyle = '#9a5446'; for (const ny of [-31.5, -27.5]) { g.beginPath(); g.ellipse(43.6, ny, .8, 1.3, 0, 0, 6.283); g.fill(); }
    g.strokeStyle = OUT; g.lineWidth = 1.1; g.beginPath(); g.moveTo(31, -26.5); g.quadraticCurveTo(36, -24.5, 40, -26.5); g.stroke();                       // smile
    g.fillStyle = 'rgba(236,130,130,.45)'; g.beginPath(); g.ellipse(29.5, -31, 3.6, 2.8, 0, 0, 6.283); g.fill();                                           // rosy cheek
    g.fillStyle = INK; g.beginPath(); g.arc(35.5, -36, 1.6, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(36, -36.5, .45, 0, 6.283); g.fill();
    g.fillStyle = pal.d; g.strokeStyle = OUT; g.lineWidth = 1.5; g.beginPath(); g.moveTo(21, -42); g.quadraticCurveTo(23, -52, 32, -48); g.quadraticCurveTo(31, -42, 26, -37); g.closePath(); g.fill(); g.stroke();   // the folded ear
    g.fillStyle = 'rgba(248,196,176,.55)'; g.beginPath(); g.moveTo(24, -43); g.quadraticCurveTo(26, -48, 29.5, -46.5); g.quadraticCurveTo(28, -43, 26, -41); g.closePath(); g.fill();
    g.restore();
    g.restore();
    leg(-22, -H - 3, H + 3, 9.5, s1, pal.c, false); leg(8, -H - 3, H + 3, 9, -s1, pal.c, false);
  } else {                                                             // the dog of the owner's picture: a lean golden village dog, cream chest and legs, a folded ear, a bushy tail curled over the back
    const H = 19, s1 = sw * .5, OUT = '#6a4020', CR = '#f9dcaa';
    const lg = len => { const gr = g.createLinearGradient(0, len * .35, 0, len * .75); gr.addColorStop(0, pal.c); gr.addColorStop(1, '#f6d9a2'); return gr; };
    g.strokeStyle = OUT; g.lineWidth = 1.5;
    leg(-17, -H - 4, H + 4, 6.5, -s1, lg(H + 4), true, true); leg(11, -H - 4, H + 4, 5.6, s1, lg(H + 4), true, true);
    const tail = [[-23, -31], [-37, -31], [-38, -53], [-27, -52]], tail2 = [[-27, -52], [-19, -51.5], [-19, -43], [-25, -43.5]], at = (Pn, t) => { const u2 = 1 - t; return [0, 1].map(kk => u2 * u2 * u2 * Pn[0][kk] + 3 * u2 * u2 * t * Pn[1][kk] + 3 * u2 * t * t * Pn[2][kk] + t * t * t * Pn[3][kk]); };
    for (const pass of [0, 1]) for (const [Pn, a0, a1] of [[tail, 0, .5], [tail2, .5, 1]]) for (let n = 0; n <= 36; n++) { const t = n / 36, q = at(Pn, t), tt = a0 + (a1 - a0) * t, w = 8.5 - 3 * tt + (pass ? -2.6 : 0); g.fillStyle = pass ? (tt > .78 ? CR : pal.c) : OUT; g.beginPath(); g.arc(q[0], q[1], w / 2, 0, 6.283); g.fill(); }
    const body = P([[-26, -30], [-20, -37], [-6, -38], [8, -37], [17, -38.5], [23, -33], [23, -25], [17, -19], [3, -17.5], [-8, -19], [-19, -20], [-26, -24]]);
    const neck = P([[10, -38], [16, -44], [22, -49.5], [29, -47.5], [31, -40], [29.5, -34], [26, -28], [19, -25.5], [10, -30]]);
    const head = P([[22, -48.5], [29, -50.5], [34, -46.5], [41, -41.5], [44, -38.5], [42, -35], [35, -36], [29, -34.5], [22, -38.5]]);
    const hd = () => { g.translate(16, -36); g.rotate(dn * .55); g.translate(-16, 36); };
    g.strokeStyle = OUT; g.lineWidth = 3.2; g.stroke(body); g.save(); hd(); g.stroke(neck); g.stroke(head); g.restore(); g.lineWidth = 1.5;
    g.fillStyle = pal.c; g.fill(body);
    g.save(); g.clip(body); g.fillStyle = CR; g.beginPath(); g.ellipse(2, -16, 24, 5.5, 0, 0, 6.283); g.fill(); g.fillStyle = pal.l; g.beginPath(); g.ellipse(-2, -39, 22, 4, 0, 0, 6.283); g.fill(); g.restore();
    g.save(); hd(); g.fillStyle = pal.c; g.fill(neck); g.fill(head);
    g.save(); g.clip(neck); g.fillStyle = CR; g.beginPath(); g.ellipse(26, -31, 6, 9, .3, 0, 6.283); g.fill(); g.restore();
    g.save(); g.clip(head); g.fillStyle = CR; g.beginPath(); g.ellipse(36, -35.5, 9, 4, .2, 0, 6.283); g.fill(); g.restore();
    g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(43, -39, 2.1, 1.7, .3, 0, 6.283); g.fill();                         // nose
    g.strokeStyle = OUT; g.lineWidth = 1.1; g.beginPath(); g.moveTo(30, -36.5); g.quadraticCurveTo(37, -35, 41, -37); g.stroke();                       // mouth
    g.fillStyle = INK; g.beginPath(); g.arc(33.5, -43.5, 1.5, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(34, -44, .45, 0, 6.283); g.fill();
    g.fillStyle = pal.d; g.strokeStyle = OUT; g.lineWidth = 1.5; g.beginPath(); g.moveTo(24, -48.5); g.quadraticCurveTo(21, -55.5, 29, -54.5); g.quadraticCurveTo(33, -51.5, 31, -45.5); g.closePath(); g.fill(); g.stroke();   // the folded ear
    g.restore();
    leg(-12, -H - 4, H + 4, 6.8, s1, lg(H + 4), false, true); leg(15, -H - 4, H + 4, 5.8, -s1, lg(H + 4), false, true);
  }
  g.restore();
}
function c11Beast(g, b, X, Y, u) {
  if (b.kind === 'bo' || b.kind === 'trau' || b.kind === 'lon' || b.kind === 'cho') { c11Beast2(g, b, X, Y, u); return; }
  const face = b.face, ph = b.ph, mv = b.moving, sw = mv ? Math.sin(ph) : 0, dn = b.dn || 0;
  g.save(); g.translate(X, Y); g.scale(face * u, u); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 1.5;
  const leg = (x, len, ang, col = '#5b3a22', w = 2.6) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, -len); g.lineTo(x + Math.sin(ang) * len * .5, 0); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5; };
  const shade = (rx) => { g.fillStyle = 'rgba(22,46,34,.22)'; g.beginPath(); g.ellipse(0, 0, rx, rx * .25, 0, 0, 6.283); g.fill(); };
  if (b.kind === 'ga' || b.kind === 'trong') {
    const cock = b.kind === 'trong', bc = cock ? '#c8562a' : b.col || '#c119a5a';
    shade(10);
    leg(-2, 8, sw * .6, '#e0a832', 1.6); leg(3, 8, -sw * .6, '#e0a832', 1.6);
    g.fillStyle = cock ? '#24423a' : '#8a6a3a'; g.beginPath(); g.moveTo(-8, -14); g.quadraticCurveTo(-16, -26, -10, -30); g.quadraticCurveTo(-8, -22, -4, -16); g.closePath(); g.fill(); g.stroke();   // tail
    if (cock) { g.strokeStyle = '#24423a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-8, -16); g.quadraticCurveTo(-20, -30, -18, -14); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5; }
    g.fillStyle = bc; g.beginPath(); g.ellipse(0, -13, 9.5, 7, -.15, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = cock ? '#e0a040' : 'rgba(80,50,20,.35)'; g.beginPath(); g.ellipse(-1, -14, 5, 3.2, -.3, 0, 6.283); g.fill();   // wing
    const hx = 7 + dn * 2, hy = -22 + dn * 12;
    g.fillStyle = bc; g.beginPath(); g.moveTo(4, -17); g.quadraticCurveTo(hx - 1, hy + 4, hx, hy); g.lineTo(hx + 3, hy + 2); g.quadraticCurveTo(8, -14, 6, -10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = cock ? '#e0a040' : bc; g.beginPath(); g.arc(hx + 1, hy, 4, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#d33a2a'; g.beginPath(); g.moveTo(hx - 2, hy - 3); for (let i = 0; i < (cock ? 4 : 3); i++) g.arc(hx - 1 + i * 2, hy - 4.5 - (cock ? 1 : 0), cock ? 1.8 : 1.3, 3.14, 0); g.lineTo(hx + 4, hy - 2); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(hx + 3.4, hy + 3.4, 1.2, cock ? 2.4 : 1.6, 0, 0, 6.283); g.fill();
    g.fillStyle = '#e8b030'; g.beginPath(); g.moveTo(hx + 4.4, hy - .5); g.lineTo(hx + 8, hy + .8); g.lineTo(hx + 4.4, hy + 1.8); g.closePath(); g.fill();
    g.fillStyle = INK; g.beginPath(); g.arc(hx + 2, hy - .6, .9, 0, 6.283); g.fill();
  } else if (b.kind === 'lon') {
    shade(16);
    for (const [x, d] of [[-9, 1], [-5, -1], [6, 1], [10, -1]]) leg(x, 7, sw * d * .5, '#c118478', 3.2);
    g.fillStyle = '#e8a79a'; g.beginPath(); g.ellipse(0, -11, 15, 8.5, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-2, -15, 8, 2.5, 0, 0, 6.283); g.fill();
    g.fillStyle = '#4a3a3a'; g.beginPath(); g.ellipse(-4, -12, 3, 2, .4, 0, 6.283); g.fill();                                   // a dark spot
    g.strokeStyle = '#c118478'; g.lineWidth = 1.4; g.beginPath(); g.arc(-17, -12, 2.4, 0, 5); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5;   // curly tail
    const hy = -12 + dn * 4;
    g.fillStyle = '#e8a79a'; g.beginPath(); g.ellipse(14, hy, 6.5, 5.6, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(11, hy - 5); g.lineTo(14, hy - 11); g.lineTo(16, hy - 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#d98f84'; g.beginPath(); g.ellipse(20, hy + 1, 2.4, 3, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(19.6, hy, .6, 0, 6.283); g.arc(20.6, hy + 2, .6, 0, 6.283); g.fill();
    g.beginPath(); g.arc(15.5, hy - 2, .9, 0, 6.283); g.fill();
  } else if (b.kind === 'bo' || b.kind === 'ngua' || b.kind === 'trau') {
    const horse = b.kind === 'ngua', buf = b.kind === 'trau', col = horse ? '#7a4a2a' : buf ? '#5e5c60' : '#d6a35a', dk = horse ? '#3a2416' : buf ? '#38363a' : '#a8763a';
    shade(24);
    const L = horse ? 16 : 13;
    for (const [x, d] of [[-14, 1], [-10, -1], [10, 1], [14, -1]]) leg(x, L, sw * d * .45, d > 0 ? dk : col, horse ? 3 : 3.6);
    for (const x of [-14 + sw * 2, -10 - sw * 2, 10 + sw * 2, 14 - sw * 2]) { g.fillStyle = INK; g.fillRect(x - 1.8, -1.5, 3.6, 2); }
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -L - 6, 19, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-2, -L - 11, 12, 3, 0, 0, 6.283); g.fill();
    if (!horse && !buf) { g.fillStyle = '#f0d8b0'; g.beginPath(); g.ellipse(2, -L + 1, 7, 3, 0, 0, 6.283); g.fill(); }
    if (buf) { g.fillStyle = 'rgba(30,30,34,.35)'; g.beginPath(); g.ellipse(0, -L - 1, 16, 3.5, 0, 0, 6.283); g.fill(); }
    g.strokeStyle = dk; g.lineWidth = horse ? 3 : 1.6; g.beginPath(); g.moveTo(-18, -L - 8); g.quadraticCurveTo(-22, -L + 2, -21 + Math.sin(G9t() * 3) * 2, -L + 8); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5;   // tail
    const hx = 22 + dn * 2, hy = (horse ? -L - 22 : -L - 12) + dn * (horse ? 18 : 10);
    g.fillStyle = col; g.beginPath(); g.moveTo(12, -L - 12); g.quadraticCurveTo(hx - 4, hy - 2, hx - 2, hy); g.lineTo(hx + 1, hy + 6); g.quadraticCurveTo(16, -L - 2, 12, -L); g.closePath(); g.fill(); g.stroke();
    if (horse) { g.fillStyle = dk; g.beginPath(); g.moveTo(11, -L - 13); g.quadraticCurveTo(hx - 6, hy - 6, hx - 4, hy - 3); g.quadraticCurveTo(hx - 8, hy, 14, -L - 8); g.closePath(); g.fill(); }   // mane
    g.fillStyle = col; g.beginPath(); g.ellipse(hx + 3, hy + 2, horse ? 8 : 6.5, horse ? 4 : 5, horse ? .35 : .2, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = horse ? '#5a3420' : '#e8c08a'; g.beginPath(); g.ellipse(hx + (horse ? 9 : 7.5), hy + (horse ? 4.5 : 3.5), 2.8, 2.4, 0, 0, 6.283); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(hx - 1, hy - 2); g.lineTo(hx - 3, hy - 7); g.lineTo(hx + 1, hy - 3); g.closePath(); g.fill(); g.stroke();
    if (buf) { g.fillStyle = '#d9cfb8'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(hx + 1 + sd, hy - 3); g.quadraticCurveTo(hx - 10 + sd * 2, hy - 8, hx - 12 + sd * 3, hy + 2); g.quadraticCurveTo(hx - 8 + sd * 2, hy - 4, hx + 3 + sd, hy - 1); g.closePath(); g.fill(); g.stroke(); } }
    else if (!horse) { g.strokeStyle = '#efe6d2'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(hx, hy - 3); g.quadraticCurveTo(hx - 3, hy - 9, hx + 1, hy - 10); g.moveTo(hx + 3, hy - 3); g.quadraticCurveTo(hx + 4, hy - 9, hx + 8, hy - 9); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5; }
    g.fillStyle = INK; g.beginPath(); g.arc(hx + 3, hy, 1.1, 0, 6.283); g.fill();
  } else if (b.kind === 'cho' || b.kind === 'meo') {                 // a yellow village dog with pricked ears and a curled tail; a ginger cat with its tail up
    const cat = b.kind === 'meo', col = cat ? '#e8b05a' : '#c118f4a', dk = cat ? '#b8742a' : '#8a5a2a', L = cat ? 6 : 9, k2 = cat ? .8 : 1;
    shade(cat ? 9 : 13);
    for (const [x, d] of [[-9, 1], [-6, -1], [6, 1], [9, -1]]) leg(x * k2, L, sw * d * .6, d > 0 ? dk : col, cat ? 2.2 : 2.8);
    g.strokeStyle = col; g.lineWidth = cat ? 2.6 : 3.2; g.beginPath();
    if (cat) { g.moveTo(-9, -L - 4); g.quadraticCurveTo(-16, -L - 8, -14, -L - 16 - Math.sin(G9t() * 2) * 2); } else { g.moveTo(-11, -L - 5); g.quadraticCurveTo(-18, -L - 16, -10, -L - 13); }
    g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5;
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -L - 4, cat ? 10 : 12.5, cat ? 4.6 : 5.6, 0, 0, 6.283); g.fill(); g.stroke();
    if (cat) { g.strokeStyle = dk; g.lineWidth = 1.4; for (const x of [-5, -1, 3]) { g.beginPath(); g.moveTo(x, -L - 8.4); g.lineTo(x + 1, -L - 4); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 1.5; }
    else { g.fillStyle = '#f0d8b0'; g.beginPath(); g.ellipse(3, -L - 1.6, 6, 2, 0, 0, 6.283); g.fill(); }
    const hx = (cat ? 10 : 13) + dn * 2, hy = -L - (cat ? 8 : 10) + dn * (cat ? 4 : 6);
    g.fillStyle = col; g.beginPath(); g.moveTo(hx - 3, hy - 2); g.lineTo(hx - 4, hy - (cat ? 9 : 10)); g.lineTo(hx, hy - 4); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(hx + 1, hy - 3); g.lineTo(hx + 2, hy - (cat ? 9.5 : 10.5)); g.lineTo(hx + 4.5, hy - 3); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(hx, hy, cat ? 4.8 : 5, cat ? 4.2 : 4.4, 0, 0, 6.283); g.fill(); g.stroke();
    if (!cat) { g.beginPath(); g.ellipse(hx + 5, hy + 1.6, 4, 2.6, .1, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(hx + 8.6, hy + 1, 1.2, 0, 6.283); g.fill(); }
    else { g.fillStyle = '#e88a8a'; g.beginPath(); g.arc(hx + 4.2, hy + 1, .9, 0, 6.283); g.fill(); g.strokeStyle = INK; g.lineWidth = .6; g.beginPath(); g.moveTo(hx + 3, hy + 1.4); g.lineTo(hx + 9, hy + .4); g.moveTo(hx + 3, hy + 2); g.lineTo(hx + 9, hy + 2.6); g.stroke(); g.lineWidth = 1.5; }
    g.fillStyle = INK; g.beginPath(); g.arc(hx + 1.8, hy - .8, .9, 0, 6.283); g.fill();
  }
  g.restore();
}
const G9t = () => C11.t;
function c11Stump(g, X, Y, k) { c11Stump3(g, X, Y, k); }          // a round stump with rings (nen.js)
function c11Folk1(g, p, x, y, face, ph, moving, T, arm, V) {
  const s = T / 115 * (p.sc || 1);
  g.fillStyle = 'rgba(29,25,21,.2)'; g.beginPath(); g.ellipse(x, y, T * .3, T * .1, 0, 0, 6.283); g.fill();
  if (p.groom) c11Player(g, x, y, s, face, ph, moving, arm); else c11Mouse(g, p, x, y, face, ph, moving, s, null);
  if (!p.groom) {
    const d = Math.hypot((x - (C11.px * T - V.cx)), (y - (C11.py * T - V.cy)));
    if (d < T * 3 && !(C11.say && C11.say.who && C11.say.who.p === p)) { g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ny = y - T * 1.42 * (p.sc || 1); g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText(p.name, x, ny); g.fillStyle = INK; g.fillText(p.name, x, ny); }
  }
}
function c11Hud(g, W, H, st) {
  const G = C11; G.hud = [];
  g.save(); g.translate(0, st);
  const back = c11Tag(g, 10, 10, '← Chương', { size: 12, h: 28, pad: 18 }); G.hud.push({ r: [back[0], back[1] + st, back[2], back[3]], f: () => showChapters() });
  const nq = c11Q().act.length, book = c11Tag(g, 10, 44, `Sổ tay${nq ? ` (${nq})` : ''}`, { size: 12, h: 28, pad: 18, fill: nq ? '#f2cf5a' : '#f7e3a4' }); G.hud.push({ r: [book[0], book[1] + st, book[2], book[3]], f: () => { c11OpenBook(); c11Sfx.tap(); } });
  c11Tag(g, 10, 78, C11_AR.name, { size: 11, h: 24, pad: 16, fill: 'rgba(244,234,208,.85)' });
  if (typeof c11OHud === 'function') c11OHud(g, st);                     // Online button, friend's-farm banner (online.js)
  const mins = Math.floor(SAVE11.mins), hh = Math.floor(mins / 60) % 24, mm = Math.floor(mins % 60 / 10) * 10;
  c11Tag(g, W - 10, 10, c11Money(), { right: true, fill: '#f7e3a4' });
  c11Tag(g, W - 10, 46, `Ngày ${SAVE11.day} · ${hh}:${String(mm).padStart(2, '0')}`, { right: true, size: 12, h: 26, pad: 18 });
  // health
  { const hw = 120, hx = W - 10 - hw, hy0 = 80, hf = Math.max(0, SAVE11.hp ?? 100) / 100;
    g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.roundRect(hx, hy0, hw, 14, 7); g.fill(); g.stroke();
    if (hf > 0) { g.fillStyle = G.hurt > 0 && Math.floor(G.t * 12) % 2 ? '#f08070' : '#c8402f'; g.beginPath(); g.roundRect(hx + 2, hy0 + 2, Math.max(8, (hw - 4) * hf), 10, 5); g.fill(); }
    g.fillStyle = INK; g.font = '700 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('Máu', hx - 6, hy0 + 8); g.textAlign = 'center'; g.fillText(Math.round(Math.max(0, SAVE11.hp ?? 100)) + '/100', hx + hw / 2, hy0 + 8); }
  // stamina
  const bw = 120, bx = W - 10 - bw, by = 100;
  g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.roundRect(bx, by, bw, 14, 7); g.fill(); g.stroke();
  const f = Math.max(0, SAVE11.stamina) / C11_EN; if (f > 0) { g.fillStyle = f > .3 ? '#2f6a4c' : '#a3332a'; g.beginPath(); g.roundRect(bx + 2, by + 2, Math.max(8, (bw - 4) * f), 10, 5); g.fill(); }
  g.fillStyle = INK; g.font = '700 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(SAVE11.stamina <= 0 ? 'Kiệt sức' : 'Sức', bx - 6, by + 8); g.textAlign = 'center'; g.fillText(Math.round(Math.max(0, SAVE11.stamina)) + '/' + C11_EN, bx + bw / 2, by + 8);
  g.restore();
  // the bar: five tools, then the ten slots of the bag (two rows on a narrow screen); tap a slot to hold it, tap a held food again to eat it
  const own = c11OwnSlots(), nT = own.length, wide = W >= 760, bs = wide ? 48 : Math.min(46, Math.floor((W - 24 - 9 * 4) / 10)), ts = wide ? 50 : Math.min(48, bs + 6), gap = 4;
  const bagW = C11_BAG * bs + (C11_BAG - 1) * gap, toolW = nT * ts + (nT - 1) * gap;
  const bby = H - bs - (isTouch ? 18 : 12), bx0 = wide ? (W - (bagW + toolW + 18)) / 2 + toolW + 18 : (W - bagW) / 2;
  const ty0 = wide ? H - ts - (isTouch ? 18 : 12) : bby - ts - 8, tx0 = wide ? (W - (bagW + toolW + 18)) / 2 : (W - toolW) / 2;
  own.forEach((si, k) => { const x = tx0 + k * (ts + gap); c11Slot(g, si, x, ty0, ts, si === G.slot); G.hud.push({ r: [x, ty0 - 8, ts, ts + 8], f: () => { G.slot = si; c11Sfx.tap(); } }); });   // only the tools you own show
  g.fillStyle = 'rgba(244,234,208,.85)'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(bx0 - 6, bby - 6, bagW + 12, bs + 12, 10); g.fill(); g.stroke();
  for (let i = 0; i < C11_BAG; i++) {
    const x = bx0 + i * (bs + gap), sel = G.slot === C11_SLOTS.length + i, sl = SAVE11.bag[i];
    g.fillStyle = sel ? '#f7e3a4' : '#efe3c4'; g.strokeStyle = sel ? '#a3332a' : 'rgba(29,25,21,.6)'; g.lineWidth = sel ? 3 : 1.4; g.beginPath(); g.roundRect(x, bby - (sel ? 5 : 0), bs, bs, 7); g.fill(); g.stroke();
    if (sl) c11ItemIcon(g, sl.id, x + bs / 2, bby - (sel ? 5 : 0) + bs / 2, bs * .78, sl.n);
    G.hud.push({ r: [x, bby - 6, bs, bs + 6], f: () => { if (G.slot === C11_SLOTS.length + i && sl) c11EatSlot(i); G.slot = C11_SLOTS.length + i; c11Sfx.tap(); } });
  }
  { const it = c11HandItem(); if (it) { const I = C11_ITEMS[it.id]; c11TagC(g, W / 2, (wide ? bby : ty0) - 40, `${I.name}${I.food ? ` · ăn: +${I.food} sức` : ''}`, { size: 11, h: 24, pad: 16, right: false, fill: '#fbf4dc' }); } }
  { const n = SAVE11.bag.filter(Boolean).length; g.fillStyle = n >= C11_BAG ? '#a3332a' : 'rgba(29,25,21,.7)'; g.font = '700 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(`Túi ${n}/${C11_BAG}`, bx0, bby - 8); }
  if (G.msg) { const a = Math.min(1, (2.4 - G.msg.t) * 2); g.globalAlpha = a; c11Tag(g, W / 2 - 100, H / 2 - 140, G.msg.text, { col: G.msg.col, size: 15, h: 38, pad: 30, right: false }); g.globalAlpha = 1; }
}

/* ---------- input ---------- */
function c11Pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function c11Down(e) {
  if (S.mode !== 'c11play' || !C11.ready || !C11.v) return; capturePointer(e);
  const [x, y] = c11Pos(e), st = safeTop();
  if (C11.menu) { for (const h of C11.hud) if (h.modal) { const [a, b, w, hh] = h.r; if (x >= a && x <= a + w && y >= b && y <= b + hh) { h.f(); return; } } C11.menu = null; return; }
  if (C11.fade) return;
  for (const h of C11.hud) { const [a, b, w, hh] = h.r; if (x >= a && x <= a + w && y >= b && y <= b + hh) { h.f(); return; } }
  C11.kbd = false;
  const V = C11.v, wx = (x + V.cx) / V.T, wy = (y - st + V.cy) / V.T, tx = Math.floor(wx), ty = Math.floor(wy);
  if (tx >= 0 && ty >= 0 && tx < C11_W && ty < C11_H) c11Tap(tx, ty, wx, wy);
}
function c11Key(e) {
  if (e.code === 'Escape') { if (C11.menu) { C11.menu = null; return; } showChapters(); return; }
  if (/^(Arrow|Key[WASD])/.test(e.code) || e.code === 'Space') e.preventDefault();
  C11.keys[e.code] = true;
  if (e.repeat || C11.sleep || C11.menu || C11.fade) return;
  const d = /^Digit([0-9])$/.exec(e.code); if (d) { const n = +d[1], own = c11OwnSlots(), nT = own.length, sl = n >= 1 && n <= nT ? own[n - 1] : C11_SLOTS.length + (n === 0 ? 9 - nT + 1 : n - nT - 1); C11.slot = sl; c11Sfx.tap(); C11.kbd = true; return; }
  if (e.code === 'KeyB') { c11OpenBook(); return; }
  if (e.code === 'KeyJ') { c11OpenLog(); return; }
  if (e.code === 'KeyF') { const h = c11HandSlot(), i = h >= 0 && SAVE11.bag[h] && C11_ITEMS[SAVE11.bag[h].id].food ? h : SAVE11.bag.findIndex(sl => sl && C11_ITEMS[sl.id].food); if (i >= 0) c11EatSlot(i); return; }
  if (e.code === 'KeyI' || e.code === 'Tab') { e.preventDefault(); C11.slot = C11.slot < C11_SLOTS.length ? C11_SLOTS.length : C11.slot + 1 >= C11_SLOTS.length + C11_BAG ? 0 : C11.slot + 1; return; }
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { C11.kbd = true; if (c11FishTap()) return; const [tx, ty] = c11Tile(), ax = tx + C11.fx0, ay = ty + C11.fy0; if (c11CanAct(ax, ay)) c11Use({ tx: ax, ty: ay }); }
}
addEventListener('keyup', e => { delete C11.keys[e.code]; });
addEventListener('blur', () => { C11.keys = {}; });

registerChapter({
  id: 11, modes: ['c11play'], direct: startC11, hidden: () => !C11_DEV,
  card: { num: lg('Chương XI', 'Chapter XI'), han: '田', name: lg('Làng Vũ Đại', 'Vu Dai Village'), desc: lg('Về làng Vũ Đại làm ruộng: cuốc đất, gieo hạt, chặt cây, hái lượm, nuôi gà lợn, ra chợ bán hàng, làm quen dân làng và nghe chuyện từng người. (Bản thử)', 'Farm in Vu Dai village: hoe, sow, chop, forage, keep animals, sell at the market, and get to know the villagers and their stories. (Demo)'), bg: '#d3e0b4' },
  progress: () => SAVE11.day > 1 || Object.keys(SAVE11.tiles).length ? lgf('Ngày {d}', 'Day {d}', { d: SAVE11.day }) : lg('Bản thử', 'Demo'),
  hasProgress: () => false,
  hide: c11Hide,
  update: updateC11, render: renderC11, key: c11Key,
  pointer: { down: c11Down, move() {}, up() {} },
  next() { startC11(); }, retry() { startC11(); },
});
