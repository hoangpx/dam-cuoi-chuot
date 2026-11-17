/* Chương XI · Làng Vũ Đại — VÙNG XA: 33 new places beyond the village (owner 2026-11-17: "mở map to ra gấp 10 lần và thêm 100
   nhiệm vụ mới", then "Thêm nhiều nơi mới"). Four regions, each a tree of places reached from one place of the old village:
     Vùng Bắc  from the north edge of Cánh đồng làng   (9 places)
     Vùng Tây  from the west edge of Xóm Đoài           (8 places)
     Vùng Đông from the east edge of Xóm Đông           (8 places)
     Vùng Nam  from the east edge of Xóm Bãi            (8 places)
   Every place is 28×18 tiles, built here from its kind (field, village, lake, marsh, forest, hill, orchard, meadow, riverbank) by a
   seeded generator, with ways out in the middle of the sides that lead to its neighbours (C11_FAR: grid position on the region's
   map page, the neighbour it hangs from). The places only ever hang off one another, so the villagers' shortest roads between the
   old places never cross them. Nine of them are villages with 5 residents each (45 new villagers, appended to C11_PPL with ids
   'v_<place>_<i>', so the old ids and names stay as they were); they live, work and rest only in their own village.
   Each morning every wild place lays out its own things to pick up (C11_FAR_FORAGE), and has its own fish and digging.
   The map sheet (bando.js) gets one page per region. The jobs of these places are in vungviec.js. */

const C11_FW = 28, C11_FH = 18;
/* id, name, kind, region, [col, row] on the region page, parent id ('@' = the region's anchor in the old village), seed */
const C11_FAR = [
  ['dongchiem', 'Đồng Chiêm', 'field', 'bac', [1, 3], '@'],
  ['xomthuong', 'Xóm Thượng', 'village', 'bac', [1, 2], 'dongchiem'],
  ['damsen', 'Đầm Sen', 'lake', 'bac', [0, 2], 'xomthuong'],
  ['vuondao', 'Vườn Đào', 'orchard', 'bac', [2, 2], 'xomthuong'],
  ['doiche', 'Đồi Chè', 'hill', 'bac', [1, 1], 'xomthuong'],
  ['rungtre', 'Rừng Tre Già', 'forest', 'bac', [0, 1], 'damsen'],
  ['langnon', 'Làng Nón', 'village', 'bac', [2, 1], 'vuondao'],
  ['deomay', 'Đèo Mây', 'hill', 'bac', [1, 0], 'doiche'],
  ['thacbac', 'Thác Bạc', 'lake', 'bac', [2, 0], 'langnon'],
  ['baitrau', 'Bãi Chăn Trâu', 'meadow', 'tay', [2, 1], '@'],
  ['xomngoai', 'Xóm Ngoại', 'village', 'tay', [1, 1], 'baitrau'],
  ['ruonggo', 'Ruộng Gò', 'field', 'tay', [2, 0], 'baitrau'],
  ['damlay', 'Đầm Lầy', 'marsh', 'tay', [2, 2], 'baitrau'],
  ['langdet', 'Làng Dệt', 'village', 'tay', [0, 1], 'xomngoai'],
  ['runggia', 'Rừng Già', 'forest', 'tay', [1, 0], 'xomngoai'],
  ['xomren', 'Xóm Rèn', 'village', 'tay', [1, 2], 'xomngoai'],
  ['nuida', 'Núi Đá', 'hill', 'tay', [0, 0], 'runggia'],
  ['dongma', 'Đồng Mạ', 'field', 'dong', [1, 1], '@'],
  ['langchai', 'Làng Chài', 'village', 'dong', [2, 1], 'dongma'],
  ['vuonxoai', 'Vườn Xoài', 'orchard', 'dong', [1, 0], 'dongma'],
  ['xommoi', 'Xóm Mới', 'village', 'dong', [1, 2], 'dongma'],
  ['baiboi', 'Bãi Bồi', 'river', 'dong', [3, 1], 'langchai'],
  ['doisim', 'Đồi Sim', 'hill', 'dong', [2, 0], 'langchai'],
  ['rungdua', 'Rừng Dừa Nước', 'forest', 'dong', [2, 2], 'langchai'],
  ['cuasong', 'Cửa Sông', 'river', 'dong', [3, 0], 'baiboi'],
  ['bode', 'Bờ Đê', 'river', 'nam', [1, 0], '@'],
  ['xomdo', 'Xóm Bến Đò', 'village', 'nam', [1, 1], 'bode'],
  ['dongkhoai', 'Đồng Khoai', 'field', 'nam', [2, 0], 'bode'],
  ['damcoi', 'Đầm Cói', 'marsh', 'nam', [0, 1], 'xomdo'],
  ['langruou', 'Làng Rượu', 'village', 'nam', [2, 1], 'xomdo'],
  ['rungphuong', 'Rừng Phượng', 'forest', 'nam', [1, 2], 'xomdo'],
  ['godo', 'Gò Đất Đỏ', 'hill', 'nam', [0, 2], 'rungphuong'],
  ['baicat', 'Bãi Cát Trắng', 'river', 'nam', [2, 2], 'rungphuong'],
];
/* the regions: page name, size of its grid, where the old village's card sits, and the anchor: [old place, exit tile, side of that
   place the way out is on] */
const C11_REGIONS = {
  bac: { name: 'Vùng Bắc', cols: 3, rows: 5, V: [1, 4], anchor: ['dong', 12, 0, 'n'] },
  tay: { name: 'Vùng Tây', cols: 4, rows: 3, V: [3, 1], anchor: ['doai', 0, 11, 'w'] },
  dong: { name: 'Vùng Đông', cols: 4, rows: 3, V: [0, 1], anchor: ['dongx', 30, 11, 'e'] },
  nam: { name: 'Vùng Nam', cols: 3, rows: 3, V: [0, 0], anchor: ['bai', 30, 11, 'e'] },
};
const C11_FAR_BY = {}; for (const r of C11_FAR) C11_FAR_BY[r[0]] = { id: r[0], name: r[1], kind: r[2], reg: r[3], at: r[4], par: r[5] };
const C11_OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
const c11FarExitTile = side => side === 'n' ? [14, 0] : side === 's' ? [14, C11_FH - 1] : side === 'w' ? [0, 9] : [C11_FW - 1, 9];
const c11FarArrive = side => side === 'n' ? [14.5, 1.7] : side === 's' ? [14.5, C11_FH - 2.3] : side === 'w' ? [1.6, 9.6] : [C11_FW - 1.6, 9.6];

/* the neighbours of each place and the side they are on */
for (const P of Object.values(C11_FAR_BY)) P.sides = {};
for (const P of Object.values(C11_FAR_BY)) {
  if (P.par === '@') { const R = C11_REGIONS[P.reg]; P.sides[C11_OPP[R.anchor[3]]] = '@'; continue; }
  const Q = C11_FAR_BY[P.par], dx = P.at[0] - Q.at[0], dy = P.at[1] - Q.at[1];
  const side = dx > 0 ? 'e' : dx < 0 ? 'w' : dy > 0 ? 's' : 'n';   // where P lies seen from Q
  Q.sides[side] = P.id; P.sides[C11_OPP[side]] = Q.id;
}

/* ---------- the maps ---------- */
const C11_FAR_TREES = {
  forest: { rungtre: [['bamboo', .7], ['banana', .15], ['xoai', .15]], runggia: [['xoai', .45], ['phuong', .3], ['bamboo', .15], ['cau', .1]], rungdua: [['dua', .6], ['banana', .2], ['cau', .2]], rungphuong: [['phuong', .6], ['xoai', .2], ['dao', .2]] },
  orchard: { vuondao: 'dao', vuonxoai: 'xoai' },
};
const c11FarPick = (L, h) => { let q = h * L.reduce((s, r) => s + r[1], 0); for (const r of L) { q -= r[1]; if (q <= 0) return r[0]; } return L[0][0]; };
function c11FarBuild(P) {
  const W = C11_FW, H = C11_FH, m = c11Grid(W, H), rnd = mulberry(7919 + P.id.split('').reduce((s, c) => s * 31 + c.charCodeAt(0) | 0, 7)), treeAt = {}, lanes = [], fields = [], houses = [];
  const inside = (x, y) => x > 0 && y > 0 && x < W - 1 && y < H - 1;
  const put = (x, y, k) => { if (inside(x, y)) m[y][x] = k; };
  const get = (x, y) => (m[y] || [])[x];
  const used = Object.keys(P.sides);
  /* lanes from each way out to the middle: a cross of 'p' */
  const lane = new Set();
  const L = (x0, y0, x1, y1) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) lane.add(x + ',' + y); };
  if (used.includes('n')) { L(14, 1, 14, 9); lanes.push([[[14, -.5], [14, 9.5]], .8]); }
  if (used.includes('s')) { L(14, 9, 14, H - 2); lanes.push([[[14, 9.5], [14, H - .5]], .8]); }
  if (used.includes('w')) { L(1, 9, 14, 9); lanes.push([[[-.5, 9], [14.5, 9]], .8]); }
  if (used.includes('e')) { L(14, 9, W - 2, 9); lanes.push([[[14, 9], [W - .5, 9]], .8]); }
  const near = (x, y, d = 1) => { for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) if (lane.has((x + dx) + ',' + (y + dy))) return true; return false; };
  const free = (x, y, d = 1) => inside(x, y) && !near(x, y, d) && get(x, y) === 'g';
  /* the kinds */
  const K = P.kind;
  if (K === 'field') {
    for (const [x0, x1] of [[2, 6], [8, 12], [16, 20], [22, 25]]) for (const [y0, y1] of [[2, 6], [11, 15]]) {
      let ok = true; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (near(x, y, 0)) ok = false;
      if (!ok || rnd() < .15) continue;
      c11Fill(m, x0, y0, x1, y1, 'r'); const st = [0, 1, 2, 2, 3, 3][Math.floor(rnd() * 6)]; fields.push({ r: [x0, y0, x1, y1], st });
    }
    for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(rnd() * (W - 2)), y = [1, 7, 8, 10, 16][Math.floor(rnd() * 5)]; if (free(x, y)) put(x, y, 'H'); }
    for (let i = 0; i < 2; i++) { const x = 1 + Math.floor(rnd() * (W - 2)), y = [7, 10][i]; if (free(x, y)) put(x, y, 'F'); }
    for (let x = 1; x < W - 1; x++) for (const y of [1, H - 2]) if (free(x, y, 0) && rnd() < .35) put(x, y, 't');
    const pond = [[3, 8], [19, 8], [5, 10]].find(([x, y]) => free(x, y) && free(x + 2, y) && free(x, y + 1) && free(x + 2, y + 1)); if (pond) c11Fill(m, pond[0], pond[1], pond[0] + 2, pond[1] + 1, 'w');
  } else if (K === 'village') {
    for (const y of [6, 13]) for (let x = 1; x < W - 1; x++) lane.add(x + ',' + y);
    L(14, 6, 14, 13); lanes.push([[[1, 6], [W - 2, 6]], .7], [[[1, 13], [W - 2, 13]], .7], [[[14, 6], [14, 13]], .7]);
    let i = 0;
    for (const Ly of [6, 13]) for (const cx of [4.5, 9.5, 19.5, 24.5]) { const key = P.id + i; C11_HOUSES[key] = { a: P.id, x: cx, y: Ly - 1, w: 3, h: 2, kind: rnd() < .35 ? 'ngoi' : '', s: .56 + rnd() * .05, name: '' }; houses.push(key); i++; }
    for (const [x, y] of [[11, 9], [17, 10]]) put(x, y, 'K');
    for (const [x, y] of [[2, 15], [26, 8], [7, 16]]) if (free(x, y, 0)) put(x, y, 'H');
    if (P.id === 'langchai' || P.id === 'xomdo') c11Fill(m, 1, 15, W - 2, H - 2, 'w');      // the water the fishers and the ferry live by
    else c11Fill(m, 20, 15, 23, 16, 'w');
    for (let k = 0; k < 14; k++) { const x = 1 + Math.floor(rnd() * (W - 2)), y = [1, 2, 7, 8, 10, 11, 14][Math.floor(rnd() * 7)]; if (free(x, y, 0)) put(x, y, 't'); }
  } else if (K === 'lake' || K === 'marsh') {
    const big = K === 'lake';
    for (const [cx, cy] of [[7, 4.5], [21, 4.5], [7, 13.5], [21, 13.5]]) {
      if (!big && rnd() < .2) continue;
      if (big) { const rx = 4.6 + rnd() * 1.2, ry = 2.6 + rnd() * .6; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && !near(x, y, 1)) put(x, y, 'w'); }
      else for (let k = 0; k < 4; k++) { const px = Math.round(cx + (rnd() - .5) * 8), py = Math.round(cy + (rnd() - .5) * 4); for (let y = py - 1; y <= py; y++) for (let x = px - 1; x <= px + 1; x++) if (inside(x, y) && !near(x, y, 1)) put(x, y, 'w'); }
    }
    if (P.id === 'thacbac') for (let y = 1; y <= 3; y++) for (let x = 3; x < W - 3; x++) if (get(x, y) === 'g' && !near(x, y, 1) && rnd() < .5) put(x, y, 'X');   // the falls' rocks
    for (let x = 1; x < W - 1; x++) for (let y = 1; y < H - 1; y++) if (free(x, y, 0) && rnd() < (big ? .06 : .1)) put(x, y, 't');
  } else if (K === 'forest') {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!near(x, y, 1) && rnd() < .62) put(x, y, 't');
    for (let k = 0; k < 4; k++) { const cx = 3 + Math.floor(rnd() * (W - 6)), cy = 3 + Math.floor(rnd() * (H - 6)); for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) if (inside(x, y) && Math.hypot(x - cx, y - cy) < 2.3 && get(x, y) === 't') put(x, y, 'g'); }
    if (P.id === 'rungdua') for (let k = 0; k < 4; k++) { const x = 3 + Math.floor(rnd() * (W - 6)), y = 3 + Math.floor(rnd() * (H - 6)); for (let yy = y; yy <= y + 1; yy++) for (let xx = x; xx <= x + 2; xx++) if (inside(xx, yy) && !near(xx, yy, 1)) put(xx, yy, 'w'); }
  } else if (K === 'hill') {
    for (let k = 0; k < 9; k++) { const cx = 2 + Math.floor(rnd() * (W - 4)), cy = 2 + Math.floor(rnd() * (H - 4)), r = 1 + rnd() * 1.6; for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) if (inside(x, y) && !near(x, y, 1) && Math.hypot(x - cx, y - cy) <= r) put(x, y, 'X'); }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (free(x, y) && rnd() < .14) put(x, y, 't');
  } else if (K === 'orchard') {
    for (let y = 2; y < H - 1; y += 2) for (let x = 2; x < W - 1; x += 3) if (free(x, y, 0) && !near(x, y, 1)) { put(x, y, 't'); treeAt[x + ',' + y] = C11_FAR_TREES.orchard[P.id]; }
  } else if (K === 'meadow') {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (free(x, y) && rnd() < .05) put(x, y, 't');
    c11Fill(m, 4, 3, 7, 5, 'w'); c11Fill(m, 20, 12, 22, 14, 'w');
  } else if (K === 'river') {
    const side = ['s', 'n', 'e', 'w'].find(s => !used.includes(s)) || 's';                  // the water lies along a side with no way out
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const d = side === 's' ? H - 1 - y : side === 'n' ? y : side === 'e' ? W - 1 - x : x, wob = 4 + Math.round(Math.sin((side === 's' || side === 'n' ? x : y) * .6 + rnd() * .3) * 1.2);
      if (d <= wob && !near(x, y, 1)) put(x, y, 'w');
    }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (free(x, y) && rnd() < .05) put(x, y, 't');
    P.water = side;
  }
  for (const k of lane) { const [x, y] = k.split(',').map(Number); if (inside(x, y)) put(x, y, 'p'); }
  if (K === 'village') { c11Footprint(m, P.id); c11Fences(m, P.id); }
  for (const s of used) { const [x, y] = c11FarExitTile(s); m[y][x] = 'E'; }
  P.map = m; P.treeAt = treeAt; P.lanes = lanes; P.fields = fields; P.houses = houses;
}
for (const P of Object.values(C11_FAR_BY)) c11FarBuild(P);

/* ---------- the areas ---------- */
const c11FarLabel = (to, side) => { const nm = to === '@' ? null : C11_FAR_BY[to].name; return side === 'n' ? '↑ ' + nm : side === 's' ? nm + ' ↓' : side === 'w' ? '← ' + nm : nm + ' →'; };
for (const P of Object.values(C11_FAR_BY)) {
  const exits = {};
  for (const [side, to] of Object.entries(P.sides)) {
    const [ex, ey] = c11FarExitTile(side);
    if (to === '@') { const A = C11_REGIONS[P.reg].anchor, back = { n: [A[1] + .5, 1.7], s: [A[1] + .5, C11_AREAS[A[0]].map.length - 2.3], w: [1.6, A[2] + .6], e: [C11_AREAS[A[0]].map[0].length - 1.6, A[2] + .6] }[A[3]], nm = C11_AREAS[A[0]].name.replace(' làng Vũ Đại', '');
      exits[ex + ',' + ey] = [A[0], back[0], back[1], side === 'n' ? '↑ ' + nm : side === 's' ? nm + ' ↓' : side === 'w' ? '← ' + nm : nm + ' →']; continue; }
    const [ax, ay] = c11FarArrive(C11_OPP[side]); exits[ex + ',' + ey] = [to, ax, ay, c11FarLabel(to, side)];
  }
  C11_AREAS[P.id] = { id: P.id, name: P.name, map: P.map, treeAt: P.treeAt, houses: c11HouseList(P.id), stalls: [], exits, lane: P.lanes, far: P.reg, farKind: P.kind, wild: P.kind === 'village' ? 0 : 1 };
  if (P.kind === 'lake') C11_AREAS[P.id].pond = { x: 7, y: 4.5, rx: 4, ry: 2 };
  if (P.fields.length) C11_FIELDS[P.id] = P.fields;
}
/* the ways in from the old village */
for (const [reg, R] of Object.entries(C11_REGIONS)) {
  const [a, x, y, side] = R.anchor, M = C11_AREAS[a].map, first = C11_FAR.find(r => r[3] === reg && r[5] === '@')[0];
  M[y][x] = 'E';
  const ix = x + (side === 'w' ? 1 : side === 'e' ? -1 : 0), iy = y + (side === 'n' ? 1 : side === 's' ? -1 : 0);
  if (C11_BLOCK.includes(M[iy][ix]) || M[iy][ix] === 't') M[iy][ix] = 'p';
  if (a === 'dong') { for (let yy = 1; yy <= 9; yy++) if (!'rx'.includes(M[yy][x])) M[yy][x] = 'p'; C11_AREAS.dong.lane.push([[[x, -.5], [x, 10]], .7]); }
  const [ax, ay] = c11FarArrive(C11_OPP[side]);
  C11_AREAS[a].exits[x + ',' + y] = [first, ax, ay, side === 'n' ? '↑ ' + C11_FAR_BY[first].name : side === 'w' ? '← ' + C11_FAR_BY[first].name : C11_FAR_BY[first].name + ' →'];
}

/* ---------- what lives there ---------- */
const c11FarCells = (id, ok) => { const M = C11_AREAS[id].map, out = []; for (let y = 2; y < M.length - 2; y++) for (let x = 2; x < M[0].length - 2; x++) if (M[y][x] === 'g' && (!ok || ok(x, y))) out.push([x, y]); return out; };
for (const P of Object.values(C11_FAR_BY)) {
  const cells = c11FarCells(P.id, (x, y) => Object.keys(P.sides).every(s => { const [ex, ey] = c11FarExitTile(s); return Math.hypot(x - ex, y - ey) > 4; })), r = k => c11Hash(P.id.length * 13 + P.id.charCodeAt(1), k, 377);
  const at = k => cells.length ? cells[Math.floor(r(k) * cells.length)] : [10, 10];
  const B = [], add = (kind, k, col) => { const [x, y] = at(k); B.push([kind, x + .5, y + .6, col]); };
  if (P.kind === 'meadow') { add('trau', 1); add('trau', 2); add('bo', 3); add('bo', 4); add('ga', 5, '#c119a5a'); add('cho', 6); }
  else if (P.kind === 'village') { add('ga', 1, '#c119a5a'); add('ga', 2, '#f2ecde'); add('trong', 3); add('cho', 4); if (r(9) < .5) add('lon', 5); else add('meo', 5); }
  else if (P.kind === 'field' || P.kind === 'river') { add('trau', 1); add('ga', 2, '#8a5a3a'); }
  C11_BEASTS[P.id] = B;
  C11_SPOTS[P.id] = [[13, 9], [15, 9], [12, 10], [16, 8]];
  if (typeof C11_WILD_AT !== 'undefined') {
    const W = [];
    if (P.kind === 'forest') { for (let i = 0; i < 3; i++) W.push(['lon', ...at(20 + i)]); for (let i = 0; i < 3; i++) W.push(['ran', ...at(30 + i)]); }
    if (P.kind === 'hill') { W.push(['lon', ...at(20)]); for (let i = 0; i < 3; i++) W.push(['ran', ...at(30 + i)]); }
    if (P.kind === 'marsh') for (let i = 0; i < 4; i++) W.push(['ran', ...at(30 + i)]);
    if (W.length) C11_WILD_AT[P.id] = W.map(([k, x, y]) => [k, x + .5, y + .5]);
  }
}

/* ---------- new things found only out there ---------- */
for (const [id, name, cat, price, food, col, desc] of [
  ['che_bup', 'Búp chè', 'rung', 30, 4, '#5f9a3a', 'Hai lá một búp, hái trên Đồi Chè lúc sương còn đọng.'],
  ['hoa_dao', 'Cành đào', 'rung', 45, 0, '#e888a8', 'Cành đào phai Vườn Đào, cắm Tết thì đẹp lắm.'],
  ['qua_xoai', 'Quả xoài', 'rung', 26, 14, '#e0b030', 'Xoài cát Vườn Xoài, chín vàng thơm ngọt.'],
  ['go_lim', 'Gỗ lim', 'vat', 90, 0, '#6a3a22', 'Gỗ lim Rừng Già, nặng chìm nước, đóng nhà trăm năm.'],
  ['da_ong', 'Đá ong', 'vat', 18, 0, '#b5623c', 'Đá ong Gò Đất Đỏ, xây tường mát quanh năm.'],
  ['muoi_hat', 'Muối hột', 'che', 12, 0, '#efe8dc', 'Muối phơi ở Cửa Sông, hạt to trắng.'],
  ['tom_song', 'Tôm sông', 'ca', 40, 10, '#d9805a', 'Tôm càng Cửa Sông, càng xanh dài.'],
  ['cat_trang', 'Cát trắng', 'vat', 6, 0, '#f4eedc', 'Cát mịn Bãi Cát Trắng, thợ gốm quý lắm.'],
  ['la_non', 'Lá nón', 'rung', 8, 0, '#d9d39a', 'Lá cọ non phơi trắng, chằm nón.'],
  ['dua_nuoc', 'Quả dừa nước', 'rung', 22, 10, '#6a7a3a', 'Cùi dừa nước trong veo, ăn mát.'],
  ['nuoc_thac', 'Bầu nước thác', 'che', 10, 6, '#a9d2e0', 'Nước Thác Bạc trong lạnh, pha chè thì ngon.'],
]) if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat, price, food, col, desc };
/* what lies about each morning, by kind, plus each place's own */
const C11_FAR_FORAGE_KIND = {
  field: [['rau_sam', 3], ['cua_dong', 2], ['oc_buou', 2], ['rom', 2], ['rau_ma', 2]],
  village: [],
  lake: [['hoa_sen', 2], ['la_sen', 3], ['hat_sen', 1.5], ['ngo_sen', 1], ['oc_nhoi', 2], ['rau_muong', 0]],
  marsh: [['coi', 3], ['ech', 2], ['oc_buou', 2], ['luon', 1], ['rau_ma', 2]],
  forest: [['nam_huong', 2], ['moc_nhi', 2], ['mang', 2], ['cui_kho', 3], ['gung', 1.5], ['mat_ong_rung', .5]],
  hill: [['da', 3], ['sim', 2], ['oi_dai', 2], ['mua', 1.5], ['cu_mai', 1], ['sa', 1.5]],
  orchard: [['hoa_bi', 1], ['qua', 2], ['la_dong', 2]],
  meadow: [['nam', 2], ['rau', 3], ['ngai_cuu', 2], ['kinh_gioi', 1.5], ['tia_to', 1.5]],
  river: [['hen', 3], ['trai', 2], ['vo_oc', 2], ['soi', 2], ['tom_dong', 1.5]],
};
const C11_FAR_OWN = { doiche: [['che_bup', 6]], vuondao: [['hoa_dao', 4]], vuonxoai: [['qua_xoai', 5]], runggia: [['go_lim', 1.4]], godo: [['da_ong', 5]], cuasong: [['muoi_hat', 4], ['tom_song', 2]], baicat: [['cat_trang', 5], ['ngoc_trai', .15]],
  deomay: [['la_co', 4], ['mat_ong_rung', 1]], rungtre: [['la_non', 4], ['mang', 4]], rungdua: [['dua_nuoc', 4]], thacbac: [['nuoc_thac', 4]], damcoi: [['coi', 6]], damsen: [['hoa_sen', 3]], dongkhoai: [['khoai', 3]], ruonggo: [['lua', 1.2]], dongma: [['rau_muong', 0], ['muong', 2]] };
const c11FarForage = id => { const P = C11_FAR_BY[id]; return [...(C11_FAR_FORAGE_KIND[P.kind] || []), ...(C11_FAR_OWN[id] || [])].filter(r => C11_ITEMS[r[0]] && r[1] > 0); };
function c11FarSpawn(id) {
  SAVE11.farDay = SAVE11.farDay || {}; if (SAVE11.farDay[id] === SAVE11.day) return; SAVE11.farDay[id] = SAVE11.day;
  SAVE11.drops = SAVE11.drops.filter(d => !(d.a === id && d.f));
  const T = c11FarForage(id); if (!T.length) return;
  const [sx, sy] = (() => { const e = Object.keys(C11_AREAS[id].exits)[0].split(',').map(Number); return [Math.min(C11_FW - 2, Math.max(1, e[0])), Math.min(C11_FH - 2, Math.max(1, e[1]))]; })();
  const cells = c11WildReach(id, sx, sy), tot = T.reduce((s, r) => s + r[1], 0), n = C11_FAR_BY[id].kind === 'village' ? 0 : 10;
  for (let i = 0; i < n && cells.length; i++) {
    const [x, y] = cells.splice((Math.random() * cells.length) | 0, 1)[0]; let q = Math.random() * tot, k = T[0][0]; for (const r of T) { q -= r[1]; if (q <= 0) { k = r[0]; break; } }
    SAVE11.drops.push({ k, a: id, f: 1, x: x + .5, y: y + .7, x0: x + .5, y0: y + .7, t: .01, dur: .01, h: 0 });
  }
  persist11();
}
if (typeof C11_FISH2 !== 'undefined') for (const P of Object.values(C11_FAR_BY)) {
  const k = P.kind;
  if (k === 'lake') C11_FISH2[P.id] = P.id === 'thacbac' ? [['ca_bong', 2], ['ca_tre', 1.5], ['ca_chep', 1.2], ['ca_lang', .6, 1, 1], ['ca_chien', .4, 2, 2]] : [['ca_ro', 3], ['ca_diec', 3], ['ca_chep', 2], ['ca_me', 1.5], ['ca_tram', .8, 0, 1], ['ca_vang', .2, 1, 2], ['ca_chep_do', .08, 2, 3]];
  else if (k === 'marsh') C11_FISH2[P.id] = [['ca_ro', 2], ['luon', 2], ['chach', 2], ['ech', 2], ['ca_tre', 1.4], ['ca_qua', .8, 0, 1]];
  else if (k === 'river') C11_FISH2[P.id] = P.id === 'cuasong' ? [['tom_song', 3], ['ca_me', 2], ['ca_nheo', 1, 1, 1], ['ca_lang', .6, 1, 1], ['ca_chien', .2, 2, 2]] : [['ca_me', 3], ['ca_bong', 3], ['ca_tre', 1.6], ['ca_nheo', .8, 1, 1], ['ca_lang', .4, 1, 1]];
  else C11_FISH2[P.id] = [['ca_ro', 3], ['ca_diec', 3], ['tep', 2], ['oc_buou', 1.5]];
  C11_FISH2[P.id] = C11_FISH2[P.id].filter(r => C11_ITEMS[r[0]]);
}
if (typeof C11_DIG !== 'undefined') for (const P of Object.values(C11_FAR_BY)) {
  const k = P.kind;
  C11_DIG[P.id] = (k === 'hill' ? [['da', 6], ['soi', 4], ['than', 2], ['sat', 1.5], ['dong', .8], ['bac_vun', .3], ['vang_cam', .06]] : k === 'river' ? [['cat', 6], ['soi', 4], ['vo_oc', 2], ['ngoc_trai', .06]] : k === 'field' ? [['dat_set', 5], ['khoai', 1], ['tien_dong', .1]] : [['dat_set', 4], ['soi', 2]])
    .concat(P.id === 'godo' ? [['da_ong', 6]] : P.id === 'baicat' ? [['cat_trang', 6]] : []).filter(r => C11_ITEMS[r[0]]);
}

/* ---------- the people of the nine villages ---------- */
/* [role, sex, trade] for each of the five residents; trades from C11_TRADES or new ones with their own act */
const C11_FAR_FOLK = {
  xomthuong: [['o', 'm', 'làm ruộng', 'cuoc'], ['a', 'f', 'làm ruộng', 'tuoi'], ['a', 'm', 'kiếm củi', 'quet'], ['a', 'f', 'nấu rượu', 'nau'], ['c', 'm', 'chăn trâu', 'choi']],
  langnon: [['o', 'f', 'chằm nón', 'det'], ['a', 'f', 'chằm nón', 'det'], ['a', 'f', 'chằm nón', 'det'], ['a', 'm', 'phơi lá nón', 'quet'], ['c', 'f', 'trông em', 'choi']],
  xomngoai: [['o', 'm', 'đánh cờ tướng', 'ngoi'], ['a', 'm', 'làm ruộng', 'cuoc'], ['a', 'f', 'bán rau', 'tuoi'], ['a', 'f', 'giặt thuê', 'giat'], ['c', 'm', 'thả diều', 'choi']],
  langdet: [['o', 'f', 'dệt vải', 'det'], ['a', 'f', 'dệt vải', 'det'], ['a', 'm', 'nhuộm vải', 'nau'], ['a', 'f', 'ươm tơ', 'nau'], ['c', 'f', 'trông em', 'choi']],
  xomren: [['o', 'm', 'thợ rèn', 'ren'], ['a', 'm', 'thợ rèn', 'ren'], ['a', 'm', 'kéo bễ', 'ren'], ['a', 'f', 'bán dao kéo', 'ngoi'], ['c', 'm', 'đi học chữ', 'choi']],
  langchai: [['o', 'm', 'chài lưới', 'cau'], ['a', 'm', 'chài lưới', 'cau'], ['a', 'f', 'vá lưới', 'det'], ['a', 'f', 'bán cá', 'giat'], ['c', 'm', 'bắt cua', 'choi']],
  xommoi: [['a', 'm', 'dựng nhà', 'quet'], ['a', 'f', 'làm vườn', 'tuoi'], ['a', 'm', 'làm ruộng', 'cuoc'], ['o', 'f', 'trông cháu', 'ngoi'], ['c', 'f', 'trông em', 'choi']],
  xomdo: [['o', 'm', 'lái đò', 'cau'], ['a', 'm', 'lái đò', 'cau'], ['a', 'f', 'bán hàng nước', 'nau'], ['a', 'f', 'giặt thuê', 'giat'], ['c', 'm', 'bắt cua', 'choi']],
  langruou: [['o', 'm', 'nấu rượu', 'nau'], ['a', 'm', 'nấu rượu', 'nau'], ['a', 'f', 'nấu rượu', 'nau'], ['a', 'f', 'trồng nếp', 'tuoi'], ['c', 'm', 'chăn vịt', 'choi']],
};
/* where each act is done inside a village (all villages share one plan) */
const C11_FAR_JOBS = { ngoi: [[11, 8, 13, 10], [15, 8, 17, 10]], choi: [[10, 8, 18, 11]], quet: [[2, 7, 12, 7], [16, 14, 26, 14]], tuoi: [[2, 15, 8, 16], [16, 7, 26, 7]], cuoc: [[2, 15, 8, 16]], nau: [[15, 8, 16, 9], [7, 14, 9, 14]],
  det: [[12, 8, 13, 9], [18, 7, 20, 7]], giat: [[11, 14, 17, 14]], ren: [[15, 10, 17, 11]], cau: [[3, 14, 26, 14]] };
if (!C11_ACT_NAME.cuoc) C11_ACT_NAME.cuoc = 'đang cuốc đất';
{
  const used = new Set(C11_PPL.map(p => p.name)), rnd = mulberry(0x5a11ea), pick = a => a[(rnd() * a.length) | 0], sorts = { a: C4_ADULT_SORTS2, o: C4_OLD_SORTS2, c: [11, 12, 13] };
  for (const [vid, L] of Object.entries(C11_FAR_FOLK)) {
    const P = C11_FAR_BY[vid], A = C11_AREAS[vid], keys = P.houses, made = [];
    C11_JOBS[vid] = C11_FAR_JOBS;
    L.forEach(([role, g, trade, act], i) => {
      let name; for (let k = 0; !name || used.has(name); k++) name = `${pick(C11_TITLE[role][g])} ${pick(C11_GIVEN[g])}` + (k > 30 ? ' ' + P.name.split(' ').pop() : '');
      used.add(name);
      const key = role === 'c' && made.length ? made[made.length - 1].home.key : keys[i], hs = C11_HOUSES[key];
      const T = (C11_TRADES[role] || []).find(t => t[0] === trade), temper = role === 'c' ? pick(['vui', 'ru', 'hien', 'luoi']) : pick(C11_TEMPERS);
      const loves = (T ? T[2] : ['com', 'xoi_do', 'che_kho']).slice(0, 2).concat([pick(['xoi_gac', 'banh_chung', 'che_troi_nuoc', 'ca_kho', 'thit_kho', 'nem_ran', 'banh_cuon', 'bun_rieu'])]).filter(id => C11_ITEMS[id]);
      let hate = pick(C11_HATE_POOL); if (loves.includes(hate)) hate = 'rac';
      const p = { id: `v_${vid}_${i}`, n: C11_PPL.length + 1, name, role, sort: pick(sorts[role]), trade, temper, home: { a: vid, key, x: hs.x, y: hs.y }, work: vid, free: vid, far: vid,
        love: loves, hate: [hate].filter(id => C11_ITEMS[id]), likeCat: C11_LIKE_CAT[temper] || 'mon', lines: [], story: role === 'c' ? pick(C11_ARCS_KID) : pick(C11_ARCS) };
      p.sc = role === 'c' ? .74 : role === 'o' ? .94 : 1; p.wake = 5.5 + rnd() * 1.5; p.sleep = role === 'c' ? 20.5 + rnd() : 21 + rnd() * 1.8;
      p._job = { a: vid, act };
      C11_PPL.push(p); made.push(p);
    });
    for (const p of made) { const o = made[(made.indexOf(p) + 1) % made.length]; p.y = o.role === 'c' ? made[0].name : o.name; }
    for (const key of keys) { const head = made.find(p => p.home.key === key && p.role !== 'c'); C11_HOUSES[key].name = head ? 'Nhà ' + head.name : 'Nhà bỏ không'; }
    C11_HAMLET_MAPS[vid] = { name: P.name };   // c11 self-introductions name the hamlet ("nhà mình ở Làng Nón")
    A.houses = c11HouseList(vid);
  }
}
/* they spend their whole day in their own village: rest and play happen there too */
{
  const old = c11Plan;
  c11Plan = function (p, day, mins) {
    const pl = old(p, day, mins); if (!pl || !p.far || pl.a === p.far) return pl;
    const act = p.role === 'c' ? 'choi' : (c11Hash(p.n, day || SAVE11.day, 77) < .5 ? 'ngoi' : 'dao');
    return { a: p.far, act, spot: '', key: p.far + '|' + act + '|' };
  };
}

/* ---------- trees, rocks, spawning on entering ---------- */
(() => {
  const oldType = c11TreeType;
  c11TreeType = function (x, y) {
    const P = C11_FAR_BY[C11_AR.id]; if (!P) return oldType(x, y);
    const s = (C11_AR.treeAt || {})[x + ',' + y]; if (s) return s;
    const h = c11Hash(x, y, 5), F = C11_FAR_TREES.forest[P.id];
    if (F) return c11FarPick(F, h);
    if (P.kind === 'hill') return h < .4 ? 'dao' : h < .7 ? 'phuong' : 'bamboo';
    if (P.kind === 'lake' || P.kind === 'river' || P.kind === 'marsh') return h < .45 ? 'willow' : h < .75 ? 'banana' : 'bamboo';
    return oldType(x, y);
  };
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) { oldEnter(id, x, y, quiet); if (C11_FAR_BY[id]) c11FarSpawn(id); };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    if (!C11_FAR_BY[C11_AR.id]) return;
    const V = C11.v, x0 = Math.floor(V.cx / T) - 1, x1 = Math.floor((V.cx + V.W) / T) + 1, y0 = Math.floor(V.cy / T) - 1, y1 = Math.floor((V.cy + V.H) / T) + 2;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (c11Kind(x, y) === 'X') { const h = c11Hash(x, y, 61); E.push({ y: y + .95, d: () => c11Boulder(g, sx(x + .5), sy(y + .98), T, h) }); }
  };
})();
