/* Chương IV · trang trí quán (owner, 2026-10-28; redone the same day: "mỗi quán chỉ có cột, bàn, mái, biển là sẽ custom được; nhà thì có cột, cửa, cửa sổ, mái, màu tường;
   đừng làm kiểu đè đè che lên nhau"). A dressed stall is DRAWN WHOLE from its own parts, nothing is laid over the old art:
   posts + table + (the ware's goods, cut off the old art above the table top) + signboard + roof. A house level (3, 4) gets a house
   drawn from a wall colour, roof, door, window and porch posts. Beside either: up to two things on the ground and a string of lanterns.
   SAVE4.look[g] = { roof, post, table, sign, col, deco[], hroof, hpost, door, win, wall }; SAVE4.lookOwn[g] = what is paid for (switching back is free).
   Level 0 (mẹt, gánh) has no frame: only the things beside it. Town stalls are not dressed yet. The look rides in the stall snapshot (st.look, st.lv). */
const LOOK_ROOF = [['vai', 'Mái vải sọc', 200], ['tranh', 'Mái tranh', 150], ['non', 'Mái nón lá', 250], ['dan', 'Mái tre đan', 300], ['du', 'Mái dù lớn', 400], ['ngoi', 'Mái ngói', 600], ['cong', 'Mái cong đình', 1800]];
const LOOK_POST = [['tre', 'Cột tre', 60], ['do', 'Cột gỗ sơn đỏ', 200], ['khac', 'Cột gỗ chạm, chân đá', 600], ['day', 'Cột tre đôi buộc dây', 120]];
const LOOK_TABLE = [['go', 'Bàn gỗ', 100], ['tre', 'Bàn tre', 40], ['son', 'Bàn sơn đỏ', 250], ['da', 'Bàn đá', 500]];
const LOOK_SIGN = [['vang', 'Biển vàng', 80], ['do', 'Biển đỏ viền vàng', 120], ['go', 'Biển gỗ treo', 180], ['tron', 'Biển tròn', 150], ['vai', 'Biển vải', 100]];
const LOOK_HROOF = [['tranh', 'Mái tranh', 300], ['ngoi', 'Mái ngói', 900], ['cong', 'Mái cong đình', 2400]];
const LOOK_DOOR = [['go', 'Cửa gỗ', 80], ['do', 'Cửa sơn đỏ', 250], ['ke', 'Cửa chấn song', 200], ['cong', 'Cửa vòm', 600]];
const LOOK_WIN = [['vuong', 'Cửa sổ vuông', 60], ['tron', 'Cửa sổ tròn', 150], ['chop', 'Cửa chớp', 120], ['hoa', 'Cửa sổ hoa văn', 300]];
const LOOK_WALL = [['cream', 'Kem', 80], ['white', 'Trắng vôi', 80], ['tan', 'Nâu đất', 80], ['rose', 'Hồng phấn', 80], ['ash', 'Xám tro', 80], ['yellow', 'Vàng nghệ', 80]];
const LOOK_COL = [['red', 'Đỏ son', '#a3332a'], ['yellow', 'Vàng nghệ', '#f2c640'], ['teal', 'Xanh lam', '#3f8a86'], ['green', 'Xanh lá', '#2f6a4c'], ['pink', 'Hồng', '#c0567a'], ['orange', 'Cam đất', '#d97b2a']];
const LOOK_COL_PRICE = 60;
const LOOK_DECO = [['bonsai', 'Chậu cây cảnh', 150, .55], ['quat', 'Cây quất ngày Tết', 300, .55], ['den', 'Đèn lồng đỏ', 100, .6], ['day', 'Dây đèn lồng', 250, .5], ['sen', 'Chum hoa sen', 200, .45], ['ca', 'Hồ cá chép', 600, .38],
  ['xich', 'Xích đu tre', 1200, .44], ['bap', 'Bập bênh gỗ', 780, .36], ['chong', 'Chong chóng gió', 80, .55], ['quan', 'Ô ăn quan', 400, .36], ['truot', 'Cầu trượt tre', 1800, .38], ['mai', 'Mái che, bàn ghế', 1200, .3]];
const LOOK_KIDS = ['xich', 'bap', 'chong', 'truot', 'ca'];
const LOOK_SLOTS = [-146, 146];
const LOOK_MAXGROUND = 2;                          // two things on the ground at a framed stall (the plots are only 380 apart, so each is small and never meets a neighbour's); a house has no room: only the string of lanterns
// which parts a level has: 1-2 a framed stall, 3-4 a house; level 0 only the things beside
const LOOK_FIELDS_STALL = [['roof', LOOK_ROOF, 'Mái'], ['post', LOOK_POST, 'Cột'], ['table', LOOK_TABLE, 'Bàn'], ['sign', LOOK_SIGN, 'Biển hiệu']];
const LOOK_FIELDS_HOUSE = [['hroof', LOOK_HROOF, 'Mái nhà'], ['hpost', LOOK_POST, 'Cột hiên'], ['door', LOOK_DOOR, 'Cửa ra vào'], ['win', LOOK_WIN, 'Cửa sổ'], ['wall', LOOK_WALL, 'Màu tường']];
const lkFields = lv => (lv >= 3 ? LOOK_FIELDS_HOUSE : lv >= 1 ? LOOK_FIELDS_STALL : []);
let c4LookCtx, c4LookLv = 0;                       // set while drawing someone else's stall (a visit): that stall's look (or null) and level; undefined = my own

const c4LookOf = g => (SAVE4.look || {})[g] || null;
const c4LookGet = g => (c4LookCtx !== undefined ? c4LookCtx : c4LookOf(g));
const c4LookOwn = g => (SAVE4.lookOwn || (SAVE4.lookOwn = {}))[g] || (SAVE4.lookOwn[g] = {});
const lkPrice = (list, k) => { const e = list.find(q => q[0] === k); return e ? e[2] : 0; };
const lkLvOf = g => (g === 'trau' ? SAVE4.lv || 0 : c4SLvI(g));
// what a look is worth (for the hidden customer bonus) and what it still costs to pay for
function c4LookScore(L) {
  if (!L) return 0; let t = 0; for (const [k, list] of [...LOOK_FIELDS_STALL, ...LOOK_FIELDS_HOUSE]) if (L[k]) t += lkPrice(list, L[k]) / 10000;
  return t + (L.deco || []).reduce((s, k) => s + .025 + (LOOK_KIDS.includes(k) ? .015 : 0), 0);
}
const c4LookBonus = g => Math.min(.3, c4LookScore(c4LookOf(g)));
function c4LookCost(g, L, lv) {
  const own = c4LookOwn(g); let t = 0; const add = (key, p) => { if (!own[key]) t += p; };
  for (const [k, list] of lkFields(lv)) if (L[k]) add(k + ':' + L[k], lkPrice(list, L[k]));
  if (L.col && L.col !== 'red' && (L.roof || L.sign) && lv >= 1 && lv <= 2) add('col:' + L.col, LOOK_COL_PRICE);
  for (const k of L.deco || []) if (lv < 3 || k === 'day') add('deco:' + k, lkPrice(LOOK_DECO, k));
  return t;
}

/* ---------- the parts ---------- */
const LK_FD = '"Playfair Display", serif', LK_B = [-160, -280, 160, 10], LK_HB = [-230, -300, 230, 12], lkCache = {};
const lkPoly = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; };
const lkPart = (key, b, f) => lkCache[key] || (lkCache[key] = part(b, f));
const LK_ROOF = {
  vai: (a, c) => { const top = u => -110 + 220 * u, bot = u => -136 + 272 * u; for (let i = 0; i < 6; i++) { const u0 = i / 6, u1 = (i + 1) / 6; a.fk(i % 2 ? 'white' : c, lkPoly([[top(u0), -186], [top(u1), -186], [bot(u1), -132], [bot(u0), -132]]), 1.8); const r = (bot(u1) - bot(u0)) / 2, cx = (bot(u0) + bot(u1)) / 2, p = new Path2D(); p.arc(cx, -132, r, 0, Math.PI); p.closePath(); a.fk(i % 2 ? 'white' : c, p, 1.8); } a.key(lines([[top(0), -186, top(1), -186]]), 2.6); },
  tranh: (a, c) => { a.fk('straw', lkPoly([[-138, -124], [-20, -192], [20, -192], [138, -124]]), 2.6); for (let i = 0; i <= 8; i++) a.key(lines([[-20 + i * 5, -190, -132 + i * 33, -127]]), 1.2); for (let i = 0; i < 13; i++) a.key(lines([[-132 + i * 22, -124, -132 + i * 22, -112]]), 1.8); a.fk(c, rect(-142, -130, 284, 9), 1.8); },
  ngoi: (a, c) => { a.fk('brown', smooth([[-146, -122], [-100, -160], [-40, -186], [0, -190], [40, -186], [100, -160], [146, -122], [0, -130]]), 2.6); for (let r = 0; r < 4; r++) for (let i = -5 + r; i <= 5 - r; i++) { const p = new Path2D(); p.arc(i * 20, -134 - r * 13, 9, 0, Math.PI); a.key(p, 1.2); } a.fk(c, lkPoly([[-150, -124], [150, -124], [144, -114], [-144, -114]]), 2); a.fk('yellow', ell(0, -193, 10, 6), 1.6); },
  non: (a, c) => { a.fk('cream', lkPoly([[-140, -126], [0, -202], [140, -126]]), 2.6); for (let i = -5; i <= 5; i++) a.key(lines([[i * 2, -198, i * 27, -130]]), 1); a.fk(c, smooth([[-140, -126], [0, -112], [140, -126], [0, -134]]), 2); a.fk('yellow', circ(0, -204, 7), 1.6); },
  cong: (a, c) => { const edge = [[-156, -112], [-112, -140], [-60, -172], [0, -186], [60, -172], [112, -140], [156, -112]]; a.fk('dark', smooth([...edge, [100, -126], [0, -134], [-100, -126]]), 2.6); a.band(c, smooth(edge, false), 5); a.key(smooth(edge, false), 1.6); a.fk('yellow', rect(-22, -196, 44, 12), 1.8); a.fk('yellow', circ(0, -204, 6), 1.4); a.fk('yellow', circ(-156, -112, 5), 1.2); a.fk('yellow', circ(156, -112, 5), 1.2); },
  dan: (a, c) => { a.fk('straw', rect(-134, -150, 268, 30), 2.6); for (let i = 0; i < 11; i++) { const x = -130 + i * 22; a.key(lines([[x, -150, x + 28, -120]]), 1.2); a.key(lines([[x + 28, -150, x, -120]]), 1.2); } a.fk(c, rect(-138, -156, 276, 8), 1.8); a.fk(c, rect(-138, -122, 276, 6), 1.8); },
  du: (a, c) => { const dome = new Path2D(); dome.moveTo(-150, -124); dome.bezierCurveTo(-150, -210, 150, -210, 150, -124); dome.closePath(); a.fk('white', dome, 2.6); const cy = [-168, -196, -204, -196, -168];
    for (let i = 0; i < 5; i++) { const x0 = -150 + i * 60, x1 = x0 + 60, p = new Path2D(); p.moveTo(x0, -124); p.quadraticCurveTo((x0 + x1) / 2, cy[i], x1, -124); p.closePath(); if (i % 2 === 0) a.fill(c, p); a.key(p, 1.4); }
    a.key(smooth([[-150, -124], [-120, -114], [-90, -124], [-60, -114], [-30, -124], [0, -114], [30, -124], [60, -114], [90, -124], [120, -114], [150, -124]], false), 1.6); a.fk('yellow', circ(0, -196, 6), 1.4); },
};
const LK_POST = {
  tre: (a, X, H) => { for (const x of [-X, X]) { a.fk('straw', tube([[x, 0], [x, -H]], 10, 10), 2); for (const f of [.22, .5, .78]) a.key(lines([[x - 6, -H * f, x + 6, -H * f]]), 2); } },
  do: (a, X, H) => { for (const x of [-X, X]) { a.fk('red', rect(x - 6, -H, 12, H), 2); a.fk('yellow', rect(x - 9, -H - 4, 18, 8), 1.6); a.fk('yellow', rect(x - 9, -8, 18, 8), 1.6); } },
  khac: (a, X, H) => { for (const x of [-X, X]) { a.fk('brown', rect(x - 7, -H, 14, H - 4), 2); for (const f of [.25, .5, .75]) { const y = -H * f; a.fk('yellow', lkPoly([[x, y - 11], [x + 5, y], [x, y + 11], [x - 5, y]]), 1.2); } a.fk('grey', rect(x - 12, -8, 24, 12), 2); } },
  day: (a, X, H) => { for (const x of [-X, X]) { a.fk('straw', tube([[x - 4, 0], [x - 4, -H]], 8, 8), 2); a.fk('straw', tube([[x + 4, 0], [x + 4, -H]], 8, 8), 2); for (const f of [.2, .5, .8]) a.fk('red', rect(x - 8, -H * f - 4, 18, 8), 1.3); } },
};
// the table: its top is at y -62..-52 like the old art, so the goods cut from it sit right on it
const LK_TABLE = {
  go: a => { a.fk('brown', rect(-112, -62, 224, 10), 1.8); for (const x of [-100, 100]) a.fk('brown', rect(x - 4, -54, 8, 54), 1.4); a.key(lines([[-100, -30, 100, -30]]), 1.4); },
  tre: a => { a.fk('straw', rect(-112, -62, 224, 10), 1.8); for (let i = 0; i < 8; i++) a.key(lines([[-100 + i * 28, -62, -100 + i * 28, -52]]), 1.2); for (const x of [-100, 100]) a.fk('straw', tube([[x, -54], [x, 0]], 8, 8), 1.6); a.fk('straw', tube([[-100, -26], [100, -26]], 5, 5), 1.4); },
  son: a => { a.fk('red', rect(-114, -64, 228, 12), 1.8); a.fk('yellow', rect(-114, -64, 228, 3), 1); for (const x of [-100, 100]) { a.fk('brown', rect(x - 5, -52, 10, 52), 1.4); a.fk('yellow', rect(x - 7, -6, 14, 6), 1.2); } a.fk('red', rect(-96, -50, 192, 12), 1.4); a.key(lines([[-60, -44, -60, -38], [0, -44, 0, -38], [60, -44, 60, -38]]), 1); },
  da: a => { a.fk('grey', rect(-116, -68, 232, 16), 2); a.key(lines([[-60, -68, -60, -52], [40, -68, 40, -52]]), 1); for (const x of [-96, 96]) { a.fk('grey', rect(x - 14, -52, 28, 52), 2); a.key(lines([[x - 14, -30, x + 14, -30]]), 1); } },
};
const LK_SIGN = {
  vang: (a, c, t) => { a.fk('yellow', rect(-52, -118, 104, 30), 2.4); a.text(t, 0, -103, 15, 'dark', LK_FD, 'ink', '700'); a.key(lines([[-36, -88, -36, -80], [36, -88, 36, -80]]), 1.4); },
  do: (a, c, t) => { a.fk('red', rect(-52, -118, 104, 30), 2.4); a.fk('yellow', rect(-48, -114, 96, 22), 1); a.key(rect(-48, -114, 96, 22), 1); a.text(t, 0, -103, 15, 'dark', LK_FD, 'ink', '700'); },
  go: (a, c, t) => { a.key(lines([[-34, -136, -34, -118], [34, -136, 34, -118]]), 2); a.fk('brown', rect(-56, -118, 112, 30), 2.4); a.key(lines([[-50, -110, 50, -110], [-50, -98, 50, -98]]), .8); a.fk('yellow', rect(-44, -113, 88, 21), 1); a.text(t, 0, -102, 15, 'dark', LK_FD, 'ink', '700'); },
  tron: (a, c, t) => { a.fk(c, circ(0, -103, 27), 2.6); a.fk('yellow', circ(0, -103, 21), 1.6); const w = t.split(' '); if (w.length > 1) { a.text(w.slice(0, -1).join(' '), 0, -110, 11, 'dark', LK_FD, 'ink', '700'); a.text(w[w.length - 1], 0, -96, 11, 'dark', LK_FD, 'ink', '700'); } else a.text(t, 0, -103, t.length > 5 ? 11 : 14, 'dark', LK_FD, 'ink', '700'); },
  vai: (a, c, t) => { a.fk(c, smooth([[-54, -120], [54, -120], [54, -92], [36, -86], [18, -92], [0, -86], [-18, -92], [-36, -86], [-54, -92]]), 2.4); a.fk('yellow', rect(-54, -122, 108, 5), 1.2); a.text(t, 0, -106, 14, 'white', LK_FD, 'ink', '700'); },
};
const LK_DECO = {
  bonsai: [[-70, -150, 70, 6], a => { a.fk('red', lkPoly([[-34, -30], [34, -30], [26, -2], [-26, -2]]), 2.4); a.fk('yellow', rect(-38, -38, 76, 10), 2); a.fk('brown', tube([[0, -36], [-10, -62], [6, -86], [-4, -108]], 14, 7), 2); a.fk('brown', tube([[-4, -76], [-34, -84]], 7, 4), 1.6); a.fk('brown', tube([[4, -90], [36, -98]], 7, 4), 1.6);
    for (const [x, y, rx, ry] of [[-38, -92, 26, 15], [38, -104, 28, 16], [0, -124, 34, 19], [-6, -100, 22, 14]]) { a.fk('green', ell(x, y, rx, ry), 2); a.key(lines([[x - rx * .5, y - 2, x - rx * .1, y - 4], [x + rx * .1, y + 3, x + rx * .5, y]]), 1); } }],
  quat: [[-70, -170, 70, 6], a => { a.fk('straw', lkPoly([[-30, -34], [30, -34], [24, -2], [-24, -2]]), 2.4); a.fk('red', rect(-34, -42, 68, 10), 2); a.fk('brown', tube([[0, -40], [0, -90]], 11, 8), 2); a.fk('green', ell(0, -118, 50, 44), 2.4);
    for (const [x, y] of [[-30, -120], [-12, -96], [14, -134], [32, -110], [-22, -146], [8, -110], [36, -136], [-40, -100]]) { a.fk('orange', circ(x, y, 9), 1.8); a.key(lines([[x - 2, y - 2, x + 1, y - 3]]), 1); } }],
  den: [[-60, -150, 60, 10], a => { a.fk('brown', tube([[-50, 6], [-50, -120], [10, -120]], 8, 6), 2); a.key(lines([[8, -118, 8, -102]]), 1.8); a.fk('yellow', rect(-12, -104, 40, 9), 1.6); a.fk('red', ell(8, -64, 30, 36), 2.4); a.key(lines([[8, -98, 8, -30], [-10, -92, -14, -36], [26, -92, 30, -36]]), 1.2); a.fk('yellow', rect(-12, -34, 40, 9), 1.6); a.key(lines([[8, -25, 8, 6], [2, -25, 0, -4], [14, -25, 16, -4]]), 1.8); a.fk('red', circ(8, 8, 4), 1); }],
  day: [[-170, -100, 170, 70], a => { a.key(smooth([[-164, -80], [-80, -50], [0, -44], [80, -50], [164, -80]], false), 2.2); for (let i = 0; i < 6; i++) { const u = (i + .5) / 6, x = -164 + 328 * u, y = -80 + 36 * Math.sin(u * Math.PI) + (i % 2 ? 3 : 0); a.key(lines([[x, y, x, y + 8]]), 1.6); a.fk('yellow', rect(x - 6, y + 8, 12, 5), 1.3); a.fk(i % 2 ? 'yellow' : 'red', ell(x, y + 27, 14, 17), 2); a.key(lines([[x - 6, y + 14, x - 7, y + 38], [x + 6, y + 14, x + 7, y + 38]]), 1); a.fk(i % 2 ? 'red' : 'yellow', rect(x - 6, y + 42, 12, 4), 1.3); a.key(lines([[x, y + 46, x, y + 60]]), 1.4); } }],
  sen: [[-90, -140, 90, 8], a => { a.fk('brown', smooth([[-46, -60], [-52, -30], [-34, -4], [0, 0], [34, -4], [52, -30], [46, -60]]), 2.6); a.fk('straw', rect(-50, -70, 100, 14), 2); a.key(lines([[-40, -44, -28, -48], [10, -22, 26, -30], [-30, -18, -16, -12]]), 1.2);
    a.fk('green', ell(-56, -76, 26, 9), 1.8); a.fk('green', ell(52, -72, 22, 8), 1.8); a.fk('green', tube([[0, -70], [2, -100], [0, -122]], 6, 4), 1.6);
    a.fk('pink', smooth([[0, -124], [-20, -118], [-26, -98], [-8, -92], [0, -96]]), 1.8); a.fk('pink', smooth([[0, -124], [20, -118], [26, -98], [8, -92], [0, -96]]), 1.8); a.fk('rose', smooth([[0, -140], [-10, -124], [-6, -100], [0, -94], [6, -100], [10, -124]]), 1.8); a.fk('yellow', circ(0, -104, 5), 1.2); }],
  ca: [[-110, -70, 110, 24], a => { a.fk('teal', ell(0, -8, 100, 30), 2.6); a.fk('blue', ell(0, -10, 86, 22), 1.4); a.fill('white', ell(-30, -16, 24, 5)); for (const [x, y, r] of [[-98, -4, 10], [-86, 10, 9], [96, -2, 10], [84, 12, 8], [-60, 22, 8], [60, 24, 9]]) a.fk('grey', ell(x, y, r * 1.4, r), 1.8);
    a.fk('orange', smooth([[-42, -6], [-20, -20], [10, -14], [24, -4], [8, 6], [-18, 4]]), 1.8); a.fk('orange', lkPoly([[24, -4], [44, -16], [40, 0], [44, 12]]), 1.6); a.fk('white', circ(-30, -8, 2.5), 1); a.key(lines([[-12, -14, -12, -2]]), 1.2); a.fk('yellow', smooth([[40, 14], [56, 6], [72, 12], [60, 22]]), 1.6); }],
  xich: [[-90, -140, 90, 8], a => { a.fk('brown', tube([[-70, 6], [-44, -124]], 10, 8), 2); a.fk('brown', tube([[70, 6], [44, -124]], 10, 8), 2); a.fk('brown', tube([[-52, -122], [52, -122]], 10, 10), 2); a.key(lines([[-18, -118, -18, -48], [18, -118, 18, -48]]), 1.6); a.fk('red', rect(-30, -48, 60, 10), 2); a.fk('yellow', rect(-26, -46, 52, 3), .8); a.key(lines([[-70, -4, 70, -4]]), 1.4); a.fk('grey', ell(-70, 5, 12, 4), 1); a.fk('grey', ell(70, 5, 12, 4), 1); }],
  bap: [[-110, -100, 110, 8], a => { a.fk('straw', lkPoly([[-26, 6], [26, 6], [0, -40]]), 2.4); a.fk('brown', tube([[-100, -48], [100, -70]], 12, 12), 2.4); a.fk('red', rect(-104, -66, 16, 18), 1.8); a.fk('red', rect(88, -88, 16, 18), 1.8); a.fk('yellow', circ(0, -56, 6), 1.4); a.key(lines([[-96, -48, -96, -24], [96, -70, 96, -46]]), 1.4); }],
  chong: [[-70, -170, 70, 8], a => { a.fk('brown', tube([[-4, 6], [0, -96]], 8, 6), 2); const c = [0, -108]; for (const [ang, pl] of [[-90, 'red'], [0, 'yellow'], [90, 'green'], [180, 'teal']]) { const r = q => [c[0] + Math.cos(q * Math.PI / 180) * 52, c[1] + Math.sin(q * Math.PI / 180) * 52]; a.fk(pl, lkPoly([c, r(ang), r(ang + 60)]), 2); } a.fk('dark', circ(0, -108, 6), 1.2); }],
  quan: [[-110, -80, 110, 12], a => { a.fk('cream', smooth([[-104, 0], [104, 0], [110, 10], [-110, 10]]), 1.4); a.fk('straw', rect(-92, -62, 184, 58), 2.6); a.fk('red', rect(-92, -62, 184, 6), 1.6); a.key(lines([[-30, -56, -30, -6], [30, -56, 30, -6], [-92, -33, 92, -33]]), 1.6);
    for (const [x, y, c] of [[-62, -48, 'green'], [-62, -20, 'red'], [0, -48, 'yellow'], [0, -20, 'green'], [62, -48, 'red'], [62, -20, 'yellow']]) { a.fk(c, circ(x - 6, y, 5), 1); a.fk(c, circ(x + 6, y + 3, 5), 1); a.fk(c, circ(x, y - 6, 5), 1); } a.fk('white', ell(-84, -33, 12, 18), 1.6); a.fk('white', ell(84, -33, 12, 18), 1.6); }],
  truot: [[-100, -170, 110, 8], a => { a.fk('brown', tube([[-70, 6], [-70, -150]], 10, 8), 2); a.fk('brown', tube([[-70, -150], [96, 6]], 12, 12), 2.4); a.fk('yellow', tube([[-68, -142], [92, -2]], 12, 12), 1.4); a.key(lines([[-70, -126, -30, -126], [-70, -96, -30, -96], [-70, -66, -30, -66], [-70, -36, -30, -36]]), 2); a.key(tube([[-70, -150], [96, 6]], 12, 12), 1.8); a.fk('brown', rect(-92, -158, 44, 10), 2); }],
  mai: [[-130, -170, 130, 12], a => { for (const x of [-100, 100]) a.fk('brown', rect(x - 5, -110, 10, 112), 2); a.fk('straw', lkPoly([[-130, -96], [0, -168], [130, -96]]), 2.6); a.key(lines([[-100, -100, 0, -160], [-60, -100, 0, -150], [0, -100, 0, -150], [60, -100, 0, -150], [100, -100, 0, -160]]), 1.2); a.fk('red', rect(-130, -100, 260, 8), 1.8);
    a.fk('brown', rect(-60, -44, 120, 10), 2); a.key(lines([[-50, -34, -50, 2], [50, -34, 50, 2]]), 2.4); a.fk('white', ell(-16, -52, 20, 6), 1.2); a.fk('red', rect(-96, -24, 36, 8), 1.8); a.key(lines([[-90, -16, -90, 2], [-66, -16, -66, 2]]), 2); a.fk('green', rect(60, -24, 36, 8), 1.8); a.key(lines([[66, -16, 66, 2], [90, -16, 90, 2]]), 2); }],
};
// the house (levels 3, 4): the wall with its door and windows; the porch posts and the roof are separate parts drawn over it, never across the door
const LK_DOORS = {
  go: (a, x) => { a.fk('brown', rect(x - 32, -108, 64, 108), 2.2); a.key(lines([[x, -108, x, 0], [x - 16, -108, x - 16, 0], [x + 16, -108, x + 16, 0]]), 1.2); a.fk('yellow', circ(x - 7, -54, 3), 1); a.fk('yellow', circ(x + 7, -54, 3), 1); },
  do: (a, x) => { a.fk('red', rect(x - 32, -108, 64, 108), 2.2); a.fk('yellow', rect(x - 32, -108, 64, 6), 1.2); a.key(lines([[x, -102, x, 0]]), 1.4); a.fk('yellow', circ(x - 9, -54, 4), 1.2); a.fk('yellow', circ(x + 9, -54, 4), 1.2); a.key(rect(x - 26, -96, 52, 90), 1); },
  ke: (a, x) => { a.fk('brown', rect(x - 34, -108, 68, 108), 2.2); a.fk('cream', rect(x - 26, -100, 52, 70), 1); for (let i = -2; i <= 2; i++) a.key(lines([[x + i * 10, -100, x + i * 10, -30]]), 1.4); for (let j = 0; j < 4; j++) a.key(lines([[x - 26, -100 + j * 23, x + 26, -100 + j * 23]]), 1.2); a.key(rect(x - 26, -100, 52, 70), 1.6); a.fk('yellow', circ(x, -16, 3), 1); },
  cong: (a, x) => { const p = new Path2D(); p.moveTo(x - 34, 0); p.lineTo(x - 34, -76); p.arc(x, -76, 34, Math.PI, 0); p.lineTo(x + 34, 0); p.closePath(); a.fk('brown', p, 2.4); a.key(lines([[x, -110, x, 0]]), 1.4); const q = new Path2D(); q.arc(x, -76, 27, Math.PI, 0); a.band('yellow', q, 4); a.fk('yellow', circ(x - 8, -50, 3), 1); a.fk('yellow', circ(x + 8, -50, 3), 1); a.fk('red', rect(x - 22, -118, 44, 8), 1.4); },
};
const LK_WINS = {
  vuong: (a, x) => { a.fk('brown', rect(x - 30, -134, 60, 54), 2.2); a.fk('cream', rect(x - 24, -128, 48, 42), 1); a.key(lines([[x, -128, x, -86], [x - 24, -107, x + 24, -107]]), 1.4); },
  tron: (a, x) => { a.fk('brown', circ(x, -108, 30), 2.2); a.fk('cream', circ(x, -108, 23), 1); a.key(lines([[x - 23, -108, x + 23, -108], [x, -131, x, -85], [x - 16, -124, x + 16, -92], [x + 16, -124, x - 16, -92]]), 1.2); },
  chop: (a, x) => { a.fk('dark', rect(x - 28, -134, 56, 54), 2.2); a.fk('brown', rect(x - 42, -134, 20, 54), 2); a.fk('brown', rect(x + 22, -134, 20, 54), 2); for (let j = 0; j < 5; j++) { a.key(lines([[x - 42, -128 + j * 10, x - 22, -128 + j * 10], [x + 22, -128 + j * 10, x + 42, -128 + j * 10]]), 1); } },
  hoa: (a, x) => { a.fk('brown', rect(x - 30, -134, 60, 54), 2.2); a.fk('cream', rect(x - 24, -128, 48, 42), 1); for (let i = -2; i <= 2; i++) { a.key(lines([[x + i * 12, -128, x + i * 12 + 24, -86], [x + i * 12, -128, x + i * 12 - 24, -86]]), 1); } a.key(rect(x - 24, -128, 48, 42), 1.4); },
};
const lkRoofPart = (k, c) => lkPart('R' + k + c, LK_B, a => LK_ROOF[k](a, c));
const lkPostPart = (k, X, H) => lkPart('P' + k + X + '_' + H, LK_B, a => LK_POST[k](a, X, H));
const lkTablePart = k => lkPart('T' + k, LK_B, a => LK_TABLE[k](a));
const lkSignPart = (k, c, t) => lkPart('S' + k + c + t, LK_B, a => LK_SIGN[k](a, c, t));
const lkDecoPart = k => lkPart('D' + k, LK_DECO[k][0], LK_DECO[k][1]);
const lkWallPart = (wall, door, win) => lkPart('W' + wall + door + win, LK_HB, a => {
  a.fk(wall, rect(-190, -150, 380, 150), 2.6); a.key(lines([[-190, -14, 190, -14]]), 1.2); for (const x of [-70, -20, 20, 70]) a.key(lines([[x, -148, x, -140]]), 1);
  LK_DOORS[door](a, -156); LK_WINS[win](a, 156);   // the door and the window stand to the sides: the stall in front hides the middle
});

/* ---------- drawing ---------- */
// a custom house stands behind the stall: then the stall in front is only its table and goods (no roof, posts or board of its own: a player saw two roofs)
const lkHouseOn = (g, lv) => { const L = c4LookGet(g); return !!(L && lv >= 3 && (L.door || L.win || L.hroof || L.hpost)); };   // (a wall colour alone keeps the house it was: see c4DrawShopLv)
const lkFull = (g, lv) => { const L = c4LookGet(g); return !!(L && lv >= 1 && lv <= 2 && (L.roof || L.post || L.table || L.sign)); };
// a stall drawn whole: posts, table, goods (the old art cut off just above the table top), board, roof. x, y = the stall's foot; s = scale
function c4LookStall(g, x, y, s, ware, name, alpha = 1) {
  const L = c4LookGet(ware) || {}, c = L.col || 'red', A = c4Art(), art = ware === 'trau' ? A.sap : A[C4_GOODS[ware].art];
  g.save(); g.globalAlpha = alpha;
  dp(g, lkPostPart(L.post || 'tre', 106, 205), x, y, 0, s, s);
  if (ware !== 'gom') { dp(g, lkTablePart(L.table || 'go'), x, y, 0, s, s); g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.rect(-120, -190, 240, 128); g.clip(); dp(g, art, 0, 0, 0, 1, 1); g.restore(); }
  else dp(g, art, x, y, 0, s, s);                                            // pottery stands on its own mat, no table
  dp(g, lkSignPart(L.sign || 'vang', c, name), x, y - 68 * s, 0, s, s);
  dp(g, lkRoofPart(L.roof || 'vai', c), x, y - 103 * s, 0, .88 * s, .85 * s);
  g.restore();
  c4LookSale(g, x, y, s, ware, -171);
}
// the GIẢM n% tag at the top right corner of OUR board, drawn last so nothing covers it (my own stall only; a visit has no sale)
function c4LookSale(g, x, y, s, ware, signY) {
  if (c4LookCtx !== undefined || typeof c4SalePct !== 'function') return; const pct = c4SalePct(ware); if (!pct) return;
  g.save(); g.translate(x + 62 * s, y + (signY - 16) * s); g.rotate(.12); g.scale(s, s); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.rect(-30, -11, 60, 22); g.fill(); g.stroke();
  g.fillStyle = '#f2ecde'; g.font = '900 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`GIẢM ${pct}%`, 0, 1); g.restore();
}
// the table and the goods in front of the house, and the board standing on the roof's ridge
function c4LookHouseFront(g, x, y, s, ware, name, alpha = 1) {
  const L = c4LookGet(ware) || {}, A = c4Art(), art = ware === 'trau' ? A.sap : A[C4_GOODS[ware].art];
  g.save(); g.globalAlpha = alpha;
  if (ware !== 'gom') { dp(g, lkTablePart(L.table || 'go'), x, y, 0, s, s); g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.rect(-120, -190, 240, 128); g.clip(); dp(g, art, 0, 0, 0, 1, 1); g.restore(); }
  else dp(g, art, x, y, 0, s, s);
  g.restore();
  dp(g, lkSignPart(L.sign || 'vang', L.col || 'red', name), x, y - 108 * s, 0, s, s);
  c4LookSale(g, x, y, s, ware, -211);
}
// the house behind a stall of level 3, 4
function c4LookHouse(g, x, y, s, L, lv) {
  const P = (list, v, d) => (list.some(e => e[0] === v) ? v : d), wall = P(LOOK_WALL, L.wall, 'cream'), door = P(LOOK_DOOR, L.door, 'go'), win = P(LOOK_WIN, L.win, 'vuong'), hr = P(LOOK_HROOF, L.hroof, 'tranh');
  const k = .85 * s, y0 = y - 8 * s;
  dp(g, lkWallPart(wall, door, win), x, y0, 0, k, k);
  if (L.hpost) dp(g, lkPostPart(L.hpost, 190, 150), x, y0, 0, k, k);
  dp(g, lkRoofPart(hr, 'red'), x, y0 - 23 * k, 0, 1.37 * k, 1.1 * k);
  g.save(); g.translate(x, y); g.scale(s, s); g.font = '900 13px "Playfair Display", serif'; g.textAlign = 'center'; g.fillStyle = lv >= 4 ? '#a3332a' : '#5a4a32'; g.fillText(lv >= 4 ? 'Nhà mình' : 'Nhà thuê', 0, -262); g.restore();
}
const _c4DrawShopLv0 = c4DrawShopLv;
let C4_HOUSE_SKIP = false;                       // set by the market while it draws a stall whose house was already drawn behind the sellers (cho.js)
c4DrawShopLv = function (g, x, y, s, lv, ware = 'che') {
  if (lv >= 3 && C4_HOUSE_SKIP) return;
  const L = c4LookGet(ware);
  if (L && lv >= 3 && (L.door || L.win || L.hroof || L.hpost)) { c4LookHouse(g, x, y, s, L, lv); return; }
  if (L && lv >= 3 && L.wall && LOOK_WALL.some(e => e[0] === L.wall)) { C4_HOUSE_WALL = L.wall; try { _c4DrawShopLv0(g, x, y, s, lv, ware); } finally { C4_HOUSE_WALL = null; } return; }   // only the wall colour was bought: the old house, painted that colour (owner: it used to swap the whole house)
  _c4DrawShopLv0(g, x, y, s, lv, ware);
};
// the whole stall as the market draws it (used by the dresser and by a visit); ware 'trau' is the betel stall
function c4LookDrawStall(g, x, y, s, ware, lv, name, alpha = 1) {
  if (lkFull(ware, lv)) { c4LookStall(g, x, y, s, ware, name, alpha); return; }
  if (lkHouseOn(ware, lv)) { c4DrawShopLv(g, x, y, s, lv, ware); c4LookHouseFront(g, x, y, s, ware, name, alpha); return; }
  if (ware === 'trau') { if (lv >= 3) c4DrawShopLv(g, x, y, s, lv, 'trau'); g.globalAlpha = alpha; dp(g, c4StallArt(Math.min(2, lv)), x, y, 0, s, s); g.globalAlpha = 1; if (lv < 2) c4SignDraw(g, x, y, s, name, c4LookCtx === undefined ? 'trau' : undefined); return; }
  c4DrawShopLv(g, x, y, s, lv, ware); g.globalAlpha = alpha; dp(g, c4Art()[C4_GOODS[ware].art], x, y, 0, s, s); g.globalAlpha = 1; c4SignDraw(g, x, y, s, name, c4LookCtx === undefined ? ware : undefined);
}
// the things beside the stall (and the lantern string over it)
function c4LookDecoAt(g, sx, sy, ss, L, lv = 1) {
  if (!L || !L.deco || !L.deco.length) return;
  let n = 0; for (const k of L.deco) { const e = LOOK_DECO.find(q => q[0] === k); if (!e) continue; const sc = e[3] * ss;
    if (k === 'day') dp(g, lkDecoPart(k), sx, sy - 232 * ss, 0, .62 * ss, .62 * ss);
    else if (lv <= 2 && n < LOOK_MAXGROUND) dp(g, lkDecoPart(k), sx + LOOK_SLOTS[n++] * ss, sy, 0, sc, sc); }
}
const c4LookStallX = g => (g === 'trau' ? C4_STALL + ((SAVE4.lv || 0) ? 10 : 30) : C4_GOODS[g].x + 20);
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) {
    fx0(items, g, vis);
    if (c4LookCtx !== undefined || !SAVE4.look) return;
    for (const w of Object.keys(SAVE4.look)) { const L = SAVE4.look[w]; if (!L || !L.deco || !L.deco.length || !c4Own(w) || !C4_GOODS[w]) continue; const sx = c4LookStallX(w); if (!vis(sx, 260)) continue;
      const lvw = lkLvOf(w); items.push({ z: C4_STALL_Z + .005, f: () => c4LookDecoAt(g, sx, c4Y(C4_STALL_Z), c4S(C4_STALL_Z), L, lvw) }); }
  }; }
// a dressed stall draws a few more customers (never said)
{ const want0 = c4Want; c4Want = function (g, noWx) { const w = want0(g, noWx); return w * (1 + c4LookBonus(g)); }; }

/* ---------- the dresser: a sheet to choose the parts, with a picture ---------- */
const c4LookSheet = cnSheet('c4look', '<h3 id="lkT">Trang trí quán</h3><canvas id="lkCv" width="880" height="520" style="width:100%;max-width:440px;height:auto;border:2px solid var(--ink);background:#efe3c4"></canvas><div id="lkB" class="lkB"></div><p class="sm" id="lkMsg"></p><div class="row"><button class="btn" id="lkGo">Áp dụng</button><button class="btn alt" id="lkX">Đóng</button></div>');
let LK = null;
const lkName = g => (g === 'trau' ? 'TRẦU CAU' : C4_GOODS[g].name.toUpperCase());
function lkClean(L, lv) { const ok = new Set(lkFields(lv).map(f => f[0])); for (const [k] of [...LOOK_FIELDS_STALL, ...LOOK_FIELDS_HOUSE]) if (!ok.has(k)) delete L[k]; if (L.table && LK && LK.g === 'gom') delete L.table; if (!(L.roof || L.sign) || lv < 1 || lv > 2) delete L.col; if (lv >= 3 && L.deco) L.deco = L.deco.filter(k => k === 'day'); }
function lkDraw() {
  const cv = $('#lkCv'), g = cv.getContext('2d'), w = LK.g, lv = lkLvOf(w), k = lv >= 3 ? .8 : .8, x = 220, y = 240;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 880, 520); g.setTransform(2, 0, 0, 2, 0, 0); g.fillStyle = '#e6d3a0'; g.fillRect(0, y - 8, 440, 60); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y - 8); g.lineTo(440, y - 8); g.stroke();
  const prev = c4LookCtx, prevLv = c4LookLv; c4LookCtx = LK.look; c4LookLv = lv;
  try { c4LookDrawStall(g, x, y, k, w, lv, lkName(w)); c4LookDecoAt(g, x, y, k, LK.look, lv); } catch (e) {}
  c4LookCtx = prev; c4LookLv = prevLv;
}
function lkRefresh() {
  const w = LK.g, lv = lkLvOf(w), L = LK.look; lkClean(L, lv);
  const own = c4LookOwn(w), cost = c4LookCost(w, L, lv), B = $('#lkB'), fields = lkFields(lv).filter(f => !(f[0] === 'table' && w === 'gom'));
  const sec = ([key, list, title]) => `<h4>${title}</h4><div class="row lkR"><button class="opt${L[key] ? '' : ' on'}" data-k="${key}" data-v="">Như cũ</button>${list.map(([id, nm, p]) => `<button class="opt${L[key] === id ? ' on' : ''}" data-k="${key}" data-v="${id}">${nm}<small>${own[key + ':' + id] ? 'đã có' : c4Money(p)}</small></button>`).join('')}</div>`;
  const colOk = lv >= 1 && lv <= 2;
  B.innerHTML = fields.map(sec).join('')
    + (colOk ? `<h4>Màu mái, vải, biển</h4><div class="row lkR">${LOOK_COL.map(([id, nm, hex], i) => `<button class="sw${(L.col || 'red') === id ? ' on' : ''}" data-k="col" data-v="${id}" title="${nm}${i && !own['col:' + id] ? ' · ' + c4Money(LOOK_COL_PRICE) : ''}" style="background:${hex}"></button>`).join('')}</div>` : '')
    + `<h4>${lv >= 3 ? 'Dây đèn lồng (nhà không còn chỗ đặt đồ dưới đất)' : 'Đặt cạnh quán (hai món dưới đất, một dây đèn)'}</h4><div class="row lkR">${LOOK_DECO.filter(e => lv < 3 || e[0] === 'day').map(([id, nm, p]) => `<button class="opt${(L.deco || []).includes(id) ? ' on' : ''}" data-d="${id}">${nm}<small>${own['deco:' + id] ? 'đã có' : c4Money(p)}</small></button>`).join('')}</div>`;
  B.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { AU.tap(); const k = b.dataset.k, v = b.dataset.v; if (v) L[k] = v; else delete L[k]; lkRefresh(); }));
  B.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { AU.tap(); const d = L.deco || (L.deco = []), id = b.dataset.d, i = d.indexOf(id); if (i >= 0) d.splice(i, 1); else if (id !== 'day' && d.filter(q => q !== 'day').length >= LOOK_MAXGROUND) toast('Dưới đất chỉ đặt được ' + LOOK_MAXGROUND + ' món cạnh quán.', 2); else d.push(id); lkRefresh(); }));
  $('#lkGo').textContent = cost > 0 ? `Áp dụng · ${c4Money(cost)}` : 'Áp dụng'; $('#lkGo').disabled = cost > SAVE4.money;
  $('#lkMsg').innerHTML = (lv < 1 ? 'Chưa có khung quán (mẹt, gánh): nâng cấp lên sạp mới chọn được mái, cột, bàn, biển. ' : lv >= 3 ? 'Nhà mặt chợ: chọn mái, cột, cửa, cửa sổ, màu tường. ' : '') + `Trong túi: ${c4Money(Math.round(SAVE4.money))}` + (cost > SAVE4.money ? ' (chưa đủ tiền)' : '');
  lkDraw();
}
function c4LookOpen(g) {
  const cur = c4LookOf(g); LK = { g, look: cur ? JSON.parse(JSON.stringify(cur)) : {} };
  $('#lkT').textContent = 'Trang trí · ' + (g === 'trau' ? 'quán trầu' : C4_GOODS[g].name.toLowerCase()); cnShow(c4LookSheet); lkRefresh();
}
$('#lkX').addEventListener('click', () => { AU.tap(); cnHide(c4LookSheet); LK = null; });
$('#lkGo').addEventListener('click', () => {
  if (!LK) return; const g = LK.g, lv = lkLvOf(g), L = LK.look; lkClean(L, lv); const cost = c4LookCost(g, L, lv); if (cost > SAVE4.money) return;
  const own = c4LookOwn(g); for (const [k] of lkFields(lv)) if (L[k]) own[k + ':' + L[k]] = 1; if (L.col && L.col !== 'red') own['col:' + L.col] = 1; for (const k of L.deco || []) own['deco:' + k] = 1;
  SAVE4.money -= cost; (SAVE4.look || (SAVE4.look = {}))[g] = L; if (!Object.keys(L).some(k => k !== 'col' && (k !== 'deco' || L.deco.length))) delete SAVE4.look[g];
  persist4(); AU.pluck(84); if (typeof c4Hud === 'function') c4Hud(); toast(cost > 0 ? `Đã trang trí quán, tốn ${c4Money(cost)}.` : 'Đã đổi kiểu quán.', 2.6); cnHide(c4LookSheet); LK = null;
});
// a block on the stall's sheet (cho.js c4OpenUp)
function c4LookBlock(g) {
  const d = document.createElement('div'); d.innerHTML = '<h4>Trang trí quán</h4><p class="sm">Chọn mái, cột, bàn, biển hiệu (nhà thì cột, cửa, cửa sổ, mái, màu tường) và đồ đặt cạnh quán.</p><div class="row"><button class="btn alt">Trang trí</button></div>';
  d.querySelector('button').addEventListener('click', () => { AU.tap(); c4LookOpen(g); }); return d;
}
