/* Chương XI · Làng Vũ Đại — two far places (owner 2026-11-10: "làm cho map lớn hơn, nhiều chỗ hơn, hang động, cánh đồng, rừng
   rậm..."; first batch of that ask). RỪNG RẬM (rungram, 34×24): south of the bamboo wood, thick old forest, a winding path, clearings
   and a stream on the west side (its far bank cannot be reached yet: swimming is a later batch); each morning rarer forest things
   lie about (C11_JUNGLE); the stream has its own fish. HANG ĐỘNG (hang, 26×18): a cave mouth at the east end of the forest; rock
   walls (tile 'X'), a stone floor (tile 'q', so the shovel digs it), an underground lake; it is dark: the mouse sees about 2.4 tiles,
   6 with an oil lamp (đèn dầu) in the bag. Digging there gives coal, iron, copper, silver; each day six glittering veins (c11Veins)
   give two pieces of good ore for sure. */

/* ---------- the maps ---------- */
const C11_JUNGLE_MAP = (() => {
  const W = 34, H = 24, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 || c11Hash(x, y, 811) < .74) ? 't' : 'g'));
  const put = (x, y, k) => { if (x > 0 && x < W - 1 && y > 0 && y < H - 1) m[y][x] = k; };
  const carve = (x0, y0, x1, y1, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); for (let dy = 0; dy <= w; dy++) for (let dx = 0; dx <= w; dx++) put(x + dx, y + dy, 'g'); } };
  const glade = (cx, cy, r) => { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) <= r + .3) put(x, y, 'g'); };
  for (let y = 1; y < H - 1; y++) { const x = Math.round(8 + Math.sin(y * .45) * 2.2 + y * .12); put(x, y, 'w'); put(x + 1, y, 'w'); put(x - 1, y, 'g'); put(x + 2, y, 'g'); }   // the stream
  carve(17, 1, 17, 4); carve(17, 4, 21, 8); carve(21, 8, 16, 12); carve(16, 12, 20, 17); carve(20, 17, 27, 20); carve(21, 8, 27, 10); carve(27, 10, 31, 12); carve(16, 12, 13, 13); carve(20, 17, 14, 20);
  glade(24, 5, 2); glade(13, 13, 2); glade(27, 16, 2); glade(14, 20, 2); glade(29, 6, 1); glade(4, 9, 2); glade(4, 18, 2);
  carve(21, 6, 24, 5); carve(27, 12, 27, 16); carve(29, 7, 29, 10);
  m[0][17] = 'E'; m[1][17] = 'g'; m[12][33] = 'E'; m[12][32] = 'g'; m[12][31] = 'g';
  return m;
})();
const C11_CAVE_MAP = (() => {
  const W = 26, H = 18, m = Array.from({ length: H }, () => Array(W).fill('X'));
  const put = (x, y, k) => { if (x > 0 && x < W - 1 && y > 0 && y < H - 1) m[y][x] = k; };
  const room = (cx, cy, rx, ry, k = 'q') => { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / (rx + .4)) ** 2 + ((y - cy) / (ry + .4)) ** 2 <= 1) put(x, y, k); };
  const tun = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); put(x, y, 'q'); put(x, y + 1, 'q'); } };
  room(4, 8, 3, 2); room(11, 4, 3, 2); room(12, 12, 4, 3); room(20, 6, 3, 3); room(21, 13, 3, 2);
  tun(1, 8, 4, 8); tun(6, 7, 9, 5); tun(6, 9, 9, 11); tun(13, 5, 18, 6); tun(15, 12, 19, 13); tun(20, 8, 21, 11); tun(11, 6, 12, 9);
  room(12, 13, 2, 1, 'w');                                            // the underground lake
  for (const [x, y] of [[20, 5], [13, 3], [3, 9], [22, 14]]) put(x, y, 'X');   // pillars of rock
  m[8][0] = 'E'; m[8][1] = 'q'; m[9][1] = 'q';
  return m;
})();
C11_FOREST[14][10] = 'E'; C11_FOREST[13][10] = 'g';
C11_AREAS.rung.exits['10,14'] = ['rungram', 17.5, 1.8, 'Rừng rậm ↓'];
C11_AREAS.rungram = { id: 'rungram', name: 'Rừng rậm', map: C11_JUNGLE_MAP, treeAt: {}, houses: [], stalls: [], wild: 1,
  exits: { '17,0': ['rung', 10.5, 12.7, '↑ Rừng trúc'], '33,12': ['hang', 1.8, 8.6, 'Hang động →'] },
  lane: [[[[17.5, -.5], [17.6, 4], [21.4, 8.2], [16.6, 12.4], [20.4, 17.4], [27.5, 20.4]], .55], [[[21.4, 8.4], [27.4, 10.4], [31, 12.5], [33.5, 12.5]], .55]] };
C11_AREAS.hang = { id: 'hang', name: 'Hang động', map: C11_CAVE_MAP, treeAt: {}, houses: [], stalls: [], cave: 1, wild: 1, exits: { '0,8': ['rungram', 32.2, 12.6, '← Rừng rậm'] }, lane: [] };
C11_BEASTS.rungram = []; C11_BEASTS.hang = [];
if (typeof C11_FISH2 !== 'undefined') {
  if (!C11_ITEMS.ca_hang) C11_ITEMS.ca_hang = { id: 'ca_hang', name: 'Cá hang mù', cat: 'ca', price: 160, food: 10, col: '#e8dcd0', desc: 'Sống trong hồ ngầm tối om, không có mắt, da trắng bệch.' };
  C11_FISH2.rungram = [['ca_bong', 3], ['chach', 2], ['tom_dong', 2], ['cua_dong', 1.6], ['ech', 1.4], ['luon', 1, 0, 1], ['ca_qua', 1, 0, 1], ['ca_lang', .5, 1, 1], ['ca_chien', .2, 2, 2]];
  C11_FISH2.hang = [['ca_bong', 2], ['tep', 2], ['luon', 1.4], ['chach', 1.4], ['ca_hang', 1, 1], ['ca_nheo', .5, 1, 1], ['ca_chien', .25, 2, 2]];
}
if (typeof C11_DIG !== 'undefined') C11_DIG.hang = [['than', 9], ['sat', 6], ['da', 4], ['dong', 3], ['bac_vun', 1], ['vang_cam', .22], ['hat_da_quy', .1], ['ngoc_bich', .03]].filter(r => C11_ITEMS[r[0]]);

/* ---------- the forest: its trees, its darker ground, what lies about each morning ---------- */
const C11_JUNGLE = [['nam_huong', 3], ['moc_nhi', 3], ['mang', 3], ['rau_don', 3], ['sim', 2.5], ['tram', 2], ['mo_rung', 2], ['chuoi_rung', 2], ['gung', 2], ['nghe', 1.5], ['sa', 1.5], ['cui_kho', 3], ['la_dong', 2], ['cu_mai', 1.2], ['mat_ong_rung', .7], ['bo_ket', 1]].filter(r => C11_ITEMS[r[0]]);
function c11WildReach(a, sx0, sy0) {                                   // the tiles one can walk to from the way in
  const M = C11_AREAS[a].map, H = M.length, W = M[0].length, seen = new Set([sx0 + ',' + sy0]), q = [[sx0, sy0]], out = [];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; if (M[y][x] === 'g' && y > 1) out.push([x, y]);
    for (const [dx, dy] of C11_D4) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1 || seen.has(k) || C11_BLOCK.includes(M[ny][nx])) continue; seen.add(k); q.push([nx, ny]); } }
  return out;
}
function c11JungleSpawn() {
  if (SAVE11.jungleDay === SAVE11.day) return; SAVE11.jungleDay = SAVE11.day;
  SAVE11.drops = SAVE11.drops.filter(d => !(d.a === 'rungram' && d.f));
  const cells = c11WildReach('rungram', 17, 1), tot = C11_JUNGLE.reduce((s, r) => s + r[1], 0);
  for (let i = 0; i < 14 && cells.length; i++) {
    const [x, y] = cells.splice((Math.random() * cells.length) | 0, 1)[0]; let q = Math.random() * tot, k = C11_JUNGLE[0][0]; for (const r of C11_JUNGLE) { q -= r[1]; if (q <= 0) { k = r[0]; break; } }
    SAVE11.drops.push({ k, a: 'rungram', f: 1, x: x + .5, y: y + .7, x0: x + .5, y0: y + .7, t: .01, dur: .01, h: 0 });
  }
  persist11();
}
(() => {
  const oldType = c11TreeType;
  c11TreeType = function (x, y) {
    if (C11_AR.id !== 'rungram') return oldType(x, y);
    const h = c11Hash(x, y, 5); return h < .34 ? 'xoai' : h < .5 ? 'phuong' : h < .64 ? 'banana' : h < .78 ? 'bamboo' : h < .88 ? 'cau' : h < .95 ? 'dao' : 'dua';
  };
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) { oldEnter(id, x, y, quiet); if (id === 'rungram') c11JungleSpawn(); };
  const oldBg = c11Bg;
  c11Bg = function () {
    if (C11BGS[C11_AR.id]) return C11BGS[C11_AR.id];
    if (C11_AR.cave) return c11CaveBg();
    const c = oldBg();
    if (C11_AR.id === 'rungram') {                                    // the old forest is darker and damper underfoot
      const g = c.getContext('2d'); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#9fbf9a'; g.fillRect(0, 0, c.width, c.height); g.restore();
      const rnd = mulberry(0x51ab); g.fillStyle = 'rgba(20,52,34,.16)';
      for (let i = 0; i < 300; i++) { g.beginPath(); g.ellipse(rnd() * c.width, rnd() * c.height, 20 + rnd() * 46, 8 + rnd() * 16, rnd() * 3.14, 0, 6.283); g.fill(); }
    }
    return c;
  };
})();

/* ---------- the cave: ground, walls, darkness, veins ---------- */
function c11CaveBg() {
  const S = C11_S, P = C11_PAD, w = (C11_W + P * 2) * S, h = (C11_H + P * 2) * S, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), rnd = mulberry(0xca7e), at = (x, y) => [(x + P + .5) * S, (y + P + .5) * S];
  g.fillStyle = '#231e1a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < .5 ? 'rgba(70,60,52,.35)' : 'rgba(10,8,8,.35)'; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 22, 3 + rnd() * 10, rnd() * 3.14, 0, 6.283); g.fill(); }
  const floor = [], wt = [];
  for (let y = 0; y < C11_H; y++) for (let x = 0; x < C11_W; x++) { const k = C11_MAP[y][x]; if (k === 'w') wt.push([x, y]); if (k !== 'X') floor.push([x, y]); }
  const m = document.createElement('canvas'); m.width = w; m.height = h; const mg = m.getContext('2d');
  mg.filter = 'blur(9px)'; mg.fillStyle = '#7d7062'; for (const [x, y] of floor) { const [px, py] = at(x, y); mg.beginPath(); mg.arc(px, py, S * .68, 0, 6.283); mg.fill(); }
  g.drawImage(m, 0, 0);
  for (const [x, y] of floor) { const [px, py] = at(x, y);
    for (let i = 0; i < 5; i++) { g.fillStyle = rnd() < .5 ? 'rgba(160,146,128,.28)' : 'rgba(52,44,38,.3)'; g.beginPath(); g.ellipse(px + (rnd() - .5) * S, py + (rnd() - .5) * S, 3 + rnd() * 9, 2 + rnd() * 4, rnd() * 3.14, 0, 6.283); g.fill(); }
    if (rnd() < .3 && typeof c11Pebble === 'function') c11Pebble(g, px + (rnd() - .5) * S * .7, py + (rnd() - .5) * S * .6, 4 + rnd() * 4, 3 + rnd() * 2, rnd() - .5, 30, 8, 46); }
  if (wt.length && typeof c11BgWater === 'function') { c11BgWater(g, wt, at, S, w, h, rnd); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,90,120,.55)'; g.beginPath(); for (const [x, y] of wt) { const [px, py] = at(x, y); g.moveTo(px + S * .8, py); g.arc(px, py, S * .8, 0, 6.283); } g.fill(); g.restore(); }
  const keep = Object.keys(C11BGS).filter(id => id !== C11_AR.id); for (const id of keep.slice(0, -1)) { C11BGS[id].width = C11BGS[id].height = 0; delete C11BGS[id]; }
  return (C11BGS[C11_AR.id] = c);
}
/* a boulder of the wall, drawn where rock meets the floor */
function c11Boulder(g, X, Y, T, h) {
  const w = T * (.62 + h * .2), ht = T * (.75 + h * .5), lean = (h - .5) * T * .16;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X, Y, w * .95, T * .16, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(X - w, Y - ht, X + w, Y); gr.addColorStop(0, '#8d8173'); gr.addColorStop(.5, '#5d5349'); gr.addColorStop(1, '#342d28');
  g.fillStyle = gr; g.strokeStyle = '#17120f'; g.lineWidth = 2; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(X - w, Y); g.lineTo(X - w * .8, Y - ht * .55); g.lineTo(X - w * .25 + lean, Y - ht); g.lineTo(X + w * .45 + lean, Y - ht * .86); g.lineTo(X + w * .92, Y - ht * .38); g.lineTo(X + w, Y); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(20,16,14,.5)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(X - w * .25 + lean, Y - ht); g.lineTo(X - w * .05, Y - ht * .5); g.lineTo(X + w * .3, Y - ht * .2); g.stroke();
  g.strokeStyle = 'rgba(210,200,184,.35)'; g.beginPath(); g.moveTo(X - w * .72, Y - ht * .5); g.lineTo(X - w * .3 + lean, Y - ht * .92); g.stroke();
}
function c11Veins() {
  if (C11.veins && C11.veins.day === SAVE11.day) return C11.veins.list;
  const cells = []; for (let y = 1; y < C11_CAVE_MAP.length - 1; y++) for (let x = 3; x < C11_CAVE_MAP[0].length - 1; x++) if (C11_CAVE_MAP[y][x] === 'q') cells.push([x, y]);
  const list = []; for (let i = 0; i < 6 && cells.length; i++) list.push(cells.splice(Math.floor(c11Hash(SAVE11.day, i, 955) * cells.length), 1)[0]);
  C11.veins = { day: SAVE11.day, list }; return list;
}
const C11_VEIN_ORE = [['sat', 4], ['dong', 3], ['bac_vun', 1.6], ['vang_cam', .5], ['hat_da_quy', .22], ['ngoc_bich', .06]].filter(r => C11_ITEMS[r[0]]);
const c11Lamp = () => c11Count('den_dau') > 0;
(() => {
  const oldDig = c11Dig;
  c11Dig = function (tx, ty, key) {
    if (C11.area === 'hang' && !SAVE11.dug[key] && c11Veins().some(([x, y]) => x === tx && y === ty)) {
      c11Spend(C11_COST.shovel); SAVE11.dug[key] = SAVE11.day; c11Dots(tx, ty, '#f2cf5a', 16, 1.8); c11Chips(tx, ty - .1, C11.face * -1, 7);
      const tot = C11_VEIN_ORE.reduce((s, r) => s + r[1], 0); let q = Math.random() * tot, id = C11_VEIN_ORE[0][0]; for (const r of C11_VEIN_ORE) { q -= r[1]; if (q <= 0) { id = r[0]; break; } }
      c11Drop(id, 2, tx, ty); c11Pop(tx, ty - 1, `Trúng mạch quặng: 2 ${C11_ITEMS[id].name.toLowerCase()}`, '#8a5a12'); persist11(); return;
    }
    oldDig(tx, ty, key);
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    if (!C11_AR.cave) return;
    const V = C11.v, x0 = Math.floor(V.cx / T) - 1, x1 = Math.floor((V.cx + V.W) / T) + 1, y0 = Math.floor(V.cy / T) - 1, y1 = Math.floor((V.cy + V.H) / T) + 2;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (c11Kind(x, y) !== 'X') continue;
      const open = C11_D4.some(([dx, dy]) => c11Kind(x + dx, y + dy) !== 'X') || [[1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => c11Kind(x + dx, y + dy) !== 'X');
      if (open) E.push({ y: y + .95, d: () => c11Boulder(g, sx(x + .5), sy(y + .98), T, c11Hash(x, y, 61)) });
    }
    for (const [x, y] of c11Veins()) if (!SAVE11.dug['hang:' + x + ',' + y]) E.push({ y: y + .2, d: () => {
      for (let i = 0; i < 5; i++) { const a = c11Hash(x, y, i) * 6.283, d = c11Hash(x, i, y) * T * .3, tw = .5 + .5 * Math.sin(C11.t * 4 + i * 1.7 + x);
        g.fillStyle = `rgba(250,220,120,${.35 + tw * .65})`; const X = sx(x + .5) + Math.cos(a) * d, Y = sy(y + .6) + Math.sin(a) * d * .5, r = 1.5 + tw * 2.2;
        g.beginPath(); g.moveTo(X, Y - r * 1.8); g.lineTo(X + r * .5, Y); g.lineTo(X, Y + r * 1.8); g.lineTo(X - r * .5, Y); g.closePath(); g.fill(); }
    } });
  };
  const oldWx = c11WxDraw;
  c11WxDraw = function (g, W, H) {
    if (!C11_AR.cave) return oldWx(g, W, H);
    const V = C11.v, X = C11.px * V.T - V.cx, Y = (C11.py - .6) * V.T - V.cy, R = V.T * (c11Lamp() ? 6 : 2.4) * (1 + Math.sin(C11.t * 7) * .012);
    const gr = g.createRadialGradient(X, Y, R * .3, X, Y, R); gr.addColorStop(0, c11Lamp() ? 'rgba(255,190,90,.08)' : 'rgba(8,6,10,.15)'); gr.addColorStop(.7, 'rgba(8,6,10,.72)'); gr.addColorStop(1, 'rgba(8,6,10,.96)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  };
  /* rain does not fall underground, and nothing there is watered */
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    if (C11_AR.cave && !C11.caveTold) { C11.caveTold = 1; c11Msg(c11Lamp() ? 'Đèn dầu soi rõ lòng hang' : 'Hang tối quá. Có cái đèn dầu trong túi thì nhìn được xa hơn', '#5b2f1f'); }
    if (!C11_AR.cave) C11.caveTold = 0;
  };
})();
/* bác Năm Thọ sells the oil lamp for the cave */
if (typeof c11ToolRows === 'function') (() => {
  const old = c11ToolRows;
  c11ToolRows = function (shop) {
    const rows = old(shop);
    if (shop.who === 'tho' && C11_ITEMS.den_dau) rows.push({ name: 'Đèn dầu', sub: c11Lamp() ? 'Đã có trong túi' : 'Mang trong túi thì vào hang nhìn được xa', price: 60, ok: !c11Lamp() && SAVE11.money >= 60, f: () => {
      if (c11Lamp()) { C11.menu.note = 'Bạn đã có rồi'; return; } if (SAVE11.bag.every(Boolean)) { C11.menu.note = 'Túi đầy rồi'; return; } if (!c11Money2(60)) { C11.menu.note = 'Chưa đủ tiền'; return; }
      c11Add('den_dau', 1); persist11(); C11.menu.note = 'Đã mua đèn dầu'; } });
    return rows;
  };
})();
