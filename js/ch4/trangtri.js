/* Chương IV · trang trí quán (owner, 2026-10-28: "kiểu dáng khác nhau, mái khác nhau, cột, bảng hiệu... cây cảnh, đèn lồng, chỗ chơi để thu hút khách,
   chọn kiểu dáng chọn màu, mỗi kiểu tiền khác nhau"). A stall of the village can be dressed from parts: a roof, a pair of posts, a signboard, one
   colour for the roof and the flag or board, and up to four things beside it (plants, lanterns, a pond, swings and games for the children).
   SAVE4.look[g] = { roof, post, sign, col, deco: [..] }; SAVE4.lookOwn[g] = { 'roof:vai': 1, ... } what has been paid for (switching back is free).
   Parts are drawn with the woodblock engine like the rest. The look rides in the stall's snapshot (sangcho.js) so a visiting friend sees it.
   Nothing says what it does: a dressed stall draws a little more custom (c4LookBonus), never shown as a number. Town stalls are not dressed yet. */
const LOOK_ROOF = [['vai', 'Mái vải sọc', 200], ['tranh', 'Mái tranh', 150], ['non', 'Mái nón lá', 250], ['dan', 'Mái tre đan', 300], ['du', 'Mái dù lớn', 400], ['ngoi', 'Mái ngói', 600], ['cong', 'Mái cong đình', 1800]];
const LOOK_POST = [['tre', 'Cột tre', 60], ['do', 'Cột gỗ sơn đỏ', 200], ['khac', 'Cột gỗ chạm, chân đá', 600], ['day', 'Cột tre đôi buộc dây', 120]];
const LOOK_SIGN = [['vang', 'Biển vàng', 80], ['do', 'Biển đỏ viền vàng', 120], ['phuon', 'Cờ phướn', 100], ['go', 'Biển gỗ treo', 180], ['tron', 'Biển tròn', 150]];
const LOOK_COL = [['red', 'Đỏ son', '#a3332a'], ['yellow', 'Vàng nghệ', '#f2c640'], ['teal', 'Xanh lam', '#3f8a86'], ['green', 'Xanh lá', '#2f6a4c'], ['pink', 'Hồng', '#c0567a'], ['orange', 'Cam đất', '#d97b2a']];
const LOOK_COL_PRICE = 60;
const LOOK_DECO = [['bonsai', 'Chậu cây cảnh', 150, .7], ['quat', 'Cây quất ngày Tết', 300, .7], ['den', 'Đèn lồng đỏ', 100, .75], ['day', 'Dây đèn lồng', 250, .5], ['sen', 'Chum hoa sen', 200, .75], ['ca', 'Hồ cá chép', 600, .6],
  ['xich', 'Xích đu tre', 1200, .55], ['bap', 'Bập bênh gỗ', 780, .55], ['chong', 'Chong chóng gió', 80, .75], ['quan', 'Ô ăn quan', 400, .55], ['truot', 'Cầu trượt tre', 1800, .55], ['mai', 'Mái che, bàn ghế', 1200, .45]];
const LOOK_KIDS = ['xich', 'bap', 'chong', 'truot', 'ca'];
const LOOK_SLOTS = [-135, 135, -200, 200];
const LOOK_MAXDECO = 4;
let c4LookCtx, c4LookLv = 0;                         // (the stall's level too, while drawing someone else's betel stall)                                     // set while drawing someone else's stall (a visit): that stall's look, or null; undefined = my own

const c4LookOf = g => (SAVE4.look || {})[g] || null;
const c4LookGet = g => (c4LookCtx !== undefined ? c4LookCtx : c4LookOf(g));
const c4LookOwn = g => (SAVE4.lookOwn || (SAVE4.lookOwn = {}))[g] || (SAVE4.lookOwn[g] = {});
const lkPrice = (list, k) => { const e = list.find(q => q[0] === k); return e ? e[2] : 0; };
// what a look is worth (for the hidden customer bonus) and what it still costs to pay for
function c4LookScore(L) { if (!L) return 0; return (L.roof ? lkPrice(LOOK_ROOF, L.roof) / 8000 : 0) + (L.post ? lkPrice(LOOK_POST, L.post) / 12000 : 0) + (L.sign ? lkPrice(LOOK_SIGN, L.sign) / 10000 : 0)
  + (L.deco || []).reduce((s, k) => s + .025 + (LOOK_KIDS.includes(k) ? .015 : 0), 0); }
const c4LookBonus = g => Math.min(.3, c4LookScore(c4LookOf(g)));
function c4LookCost(g, L) {
  const own = c4LookOwn(g); let t = 0; const add = (key, p) => { if (!own[key]) t += p; };
  if (L.roof) add('roof:' + L.roof, lkPrice(LOOK_ROOF, L.roof)); if (L.post) add('post:' + L.post, lkPrice(LOOK_POST, L.post)); if (L.sign) add('sign:' + L.sign, lkPrice(LOOK_SIGN, L.sign));
  if (L.col && L.col !== 'red' && (L.roof || L.sign)) add('col:' + L.col, LOOK_COL_PRICE);
  for (const k of L.deco || []) add('deco:' + k, lkPrice(LOOK_DECO, k));
  return t;
}

/* ---------- the parts ---------- */
const LK_FD = '"Playfair Display", serif', LK_B = [-160, -240, 160, 10], lkCache = {};
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
const LK_SIGN = {
  vang: (a, c, t) => { a.fk('yellow', rect(-52, -118, 104, 30), 2.4); a.text(t, 0, -103, 15, 'dark', LK_FD, 'ink', '700'); a.key(lines([[-36, -88, -36, -80], [36, -88, 36, -80]]), 1.4); },
  do: (a, c, t) => { a.fk('red', rect(-52, -118, 104, 30), 2.4); a.fk('yellow', rect(-48, -114, 96, 22), 1); a.key(rect(-48, -114, 96, 22), 1); a.text(t, 0, -103, 15, 'dark', LK_FD, 'ink', '700'); },
  phuon: (a, c) => { a.fk('brown', tube([[-70, -4], [-70, -196]], 6, 6), 1.8); a.fk(c, lkPoly([[-70, -196], [-4, -196], [-4, -92], [-37, -106], [-70, -92]]), 2.2); a.fk('yellow', rect(-70, -196, 66, 8), 1.4); for (let i = 0; i < 3; i++) a.key(lines([[-56 + i * 14, -170, -56 + i * 14, -130]]), 1.2); },
  go: (a, c, t) => { a.key(lines([[-34, -136, -34, -112], [34, -136, 34, -112]]), 2); a.fk('brown', rect(-56, -114, 112, 28), 2.4); a.key(lines([[-50, -106, 50, -106], [-50, -96, 50, -96]]), .8); a.fk('yellow', rect(-44, -110, 88, 20), 1); a.text(t, 0, -100, 15, 'dark', LK_FD, 'ink', '700'); },
  tron: (a, c, t) => { a.key(lines([[0, -134, 0, -122]]), 2); a.fk(c, circ(0, -100, 26), 2.6); a.fk('yellow', circ(0, -100, 19), 1.6); a.text(t.length > 6 ? t.slice(0, 5) : t, 0, -100, 13, 'dark', LK_FD, 'ink', '700'); },
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
const lkRoofPart = (k, c) => lkPart('R' + k + c, LK_B, a => LK_ROOF[k](a, c));
const lkPostPart = (k, X = 50, H = 210) => lkPart('P' + k + X + '_' + H, LK_B, a => LK_POST[k](a, X, H));   // the betel sạp's frame is wider (posts at ±128, 185 high) than a counter's (±50, 210)
const lkSignPart = (k, c, t) => lkPart('S' + k + c + (k === 'phuon' ? '' : t), LK_B, a => LK_SIGN[k](a, c, t));
const lkDecoPart = k => lkPart('D' + k, LK_DECO[k][0], LK_DECO[k][1]);

/* ---------- drawing, hooked into the stall's own drawing ---------- */
const c4LookRoofAt = (g, x, y, s, L, wide) => { const p = lkRoofPart(L.roof, L.col || 'red'); if (wide) dp(g, p, x, y - 79 * s, 0, 1.08 * s, .9 * s); else dp(g, p, x, y - 40 * s, 0, .52 * s, .85 * s); };   // wide: the betel sạp, whose own roof (±150, up to 238) it must cover
const _c4DrawShopLv0 = c4DrawShopLv;
c4DrawShopLv = function (g, x, y, s, lv, ware = 'che') {
  const L = c4LookGet(ware);
  if (L && L.roof && lv >= 1 && lv <= 2) { c4LookRoofAt(g, x, y, s, L); return; }                      // a roof of our own instead of the awning
  _c4DrawShopLv0(g, x, y, s, lv, ware);
};
// the betel stall's art has its roof inside it: ours is laid over it
function c4LookFront(g, ware, x, y, s, lv) { const L = c4LookGet(ware); if (L && L.roof && lv === 1) c4LookRoofAt(g, x, y, s, L, true); }   // (the gian mái ngói, level 2, has its own roof and board)
const _c4SignDraw0 = c4SignDraw;
c4SignDraw = function (g, x, y, s, name, ware) {
  const L = c4LookGet(ware);
  if (!L || !(L.post || L.sign)) return _c4SignDraw0(g, x, y, s, name, ware);
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  const bl = ware === 'trau' ? (c4LookCtx !== undefined ? c4LookLv : SAVE4.lv || 0) : -1;   // the betel stall: a frame only from level 1
  if (L.post && bl !== 0) dp(g, bl === 1 ? lkPostPart(L.post, 128, 185) : lkPostPart(L.post), 0, 0, 0, 1, 1);
  else { g.fillStyle = '#7a4a22'; g.fillRect(-52, C4_SIGN_Y + 12, 5, -C4_SIGN_Y - 12); g.fillRect(47, C4_SIGN_Y + 12, 5, -C4_SIGN_Y - 12); }
  if (L.sign) { const k = L.sign, c = L.col || 'red'; if (k === 'phuon') dp(g, lkSignPart(k, c, name), 0, -28, 0, .9, .62); else dp(g, lkSignPart(k, c, name), 0, C4_SIGN_Y + 103, 0, 1.15, 1); }
  else { g.fillStyle = '#f2d27a'; g.beginPath(); g.rect(-62, C4_SIGN_Y - 14, 124, 28); g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, C4_SIGN_Y + 1); }
  if (ware && c4LookCtx === undefined) c4SaleTag(g, ware);
  g.restore();
};
// the things beside the stall (and the lantern string over it)
function c4LookDecoAt(g, sx, sy, ss, L) {
  if (!L || !L.deco || !L.deco.length) return;
  let n = 0; for (const k of L.deco) { const e = LOOK_DECO.find(q => q[0] === k); if (!e) continue; const sc = e[3] * ss;
    if (k === 'day') dp(g, lkDecoPart(k), sx, sy - 215 * ss, 0, .62 * ss, .62 * ss);
    else dp(g, lkDecoPart(k), sx + LOOK_SLOTS[n++ % 4] * ss, sy, 0, sc, sc); }
}
const c4LookStallX = g => (g === 'trau' ? C4_STALL + ((SAVE4.lv || 0) ? 10 : 30) : C4_GOODS[g].x + 20);
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) {
    fx0(items, g, vis);
    if (c4LookCtx !== undefined || !SAVE4.look) return;
    for (const w of Object.keys(SAVE4.look)) { const L = SAVE4.look[w]; if (!L || !L.deco || !L.deco.length || !c4Own(w) || !C4_GOODS[w]) continue; const sx = c4LookStallX(w); if (!vis(sx, 260)) continue;
      items.push({ z: C4_STALL_Z + .005, f: () => c4LookDecoAt(g, sx, c4Y(C4_STALL_Z), c4S(C4_STALL_Z), L) }); }
  }; }
// a dressed stall draws a few more customers (never said)
{ const want0 = c4Want; c4Want = function (g, noWx) { const w = want0(g, noWx); return w * (1 + c4LookBonus(g)); }; }

/* ---------- the dresser: a sheet to choose the parts, with a picture ---------- */
const c4LookSheet = cnSheet('c4look', '<h3 id="lkT">Trang trí quán</h3><canvas id="lkCv" width="880" height="520" style="width:100%;max-width:440px;height:auto;border:2px solid var(--ink);background:#efe3c4"></canvas><div id="lkB" class="lkB"></div><p class="sm" id="lkMsg"></p><div class="row"><button class="btn" id="lkGo">Áp dụng</button><button class="btn alt" id="lkX">Đóng</button></div>');
let LK = null;
const lkName = g => (g === 'trau' ? 'TRẦU CAU' : C4_GOODS[g].name.toUpperCase());
const lkLv = g => (g === 'trau' ? SAVE4.lv || 0 : c4SLvI(g));
function lkDraw() {
  const cv = $('#lkCv'), g = cv.getContext('2d'), w = LK.g, lv = lkLv(w), s = 1.15, x = 220, y = 440;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 880, 520); g.setTransform(2, 0, 0, 2, 0, 0); g.fillStyle = '#e6d3a0'; g.fillRect(0, 205, 440, 60); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 205); g.lineTo(440, 205); g.stroke();
  const A = c4Art(), prev = c4LookCtx; c4LookCtx = LK.look; c4LookLv = lv;
  try {
    const sy = 222, k = s * .62;   // the same order as the market draws it (cho.js)
    if (w === 'trau') { if (lv >= 3) c4DrawShopLv(g, x, sy, k, lv, w); dp(g, c4StallArt(Math.min(2, lv)), x, sy, 0, k, k); c4LookFront(g, 'trau', x, sy, k, lv); if (lv < 2) c4SignDraw(g, x, sy, k, lkName(w), w); }
    else { c4DrawShopLv(g, x, sy, k, lv, w); dp(g, A[C4_GOODS[w].art], x, sy, 0, k, k); c4SignDraw(g, x, sy, k, lkName(w), w); }
    c4LookDecoAt(g, x, sy, k, LK.look);
  } catch (e) {}
  c4LookCtx = prev;
}
function lkRefresh() {
  const L = LK.look, own = c4LookOwn(LK.g), cost = c4LookCost(LK.g, L), B = $('#lkB');
  const sec = (title, list, key, none) => `<h4>${title}</h4><div class="row lkR">${none ? `<button class="opt${L[key] ? '' : ' on'}" data-k="${key}" data-v="">${none}</button>` : ''}${list.map(([id, nm, p]) => `<button class="opt${L[key] === id ? ' on' : ''}" data-k="${key}" data-v="${id}">${nm}<small>${own[key + ':' + id] ? 'đã có' : c4Money(p)}</small></button>`).join('')}</div>`;
  B.innerHTML = sec('Mái', LOOK_ROOF, 'roof', 'Mái thường') + sec('Cột', LOOK_POST, 'post', 'Cột thường') + sec('Biển hiệu', LOOK_SIGN, 'sign', 'Biển thường')
    + `<h4>Màu mái, cờ, biển</h4><div class="row lkR">${LOOK_COL.map(([id, nm, hex], i) => `<button class="sw${(L.col || 'red') === id ? ' on' : ''}" data-k="col" data-v="${id}" title="${nm}${i && !own['col:' + id] ? ' · ' + c4Money(LOOK_COL_PRICE) : ''}" style="background:${hex}"></button>`).join('')}</div>`
    + `<h4>Đồ trang trí, chỗ chơi (tối đa ${LOOK_MAXDECO})</h4><div class="row lkR">${LOOK_DECO.map(([id, nm, p]) => `<button class="opt${(L.deco || []).includes(id) ? ' on' : ''}" data-d="${id}">${nm}<small>${own['deco:' + id] ? 'đã có' : c4Money(p)}</small></button>`).join('')}</div>`;
  B.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { AU.tap(); const k = b.dataset.k, v = b.dataset.v; if (v) L[k] = v; else delete L[k]; lkRefresh(); }));
  B.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { AU.tap(); const d = L.deco || (L.deco = []), i = d.indexOf(b.dataset.d); if (i >= 0) d.splice(i, 1); else if (d.length < LOOK_MAXDECO) d.push(b.dataset.d); else toast('Chỉ đặt được ' + LOOK_MAXDECO + ' món cạnh quầy.', 2); lkRefresh(); }));
  $('#lkGo').textContent = cost > 0 ? `Áp dụng · ${c4Money(cost)}` : 'Áp dụng'; $('#lkGo').disabled = cost > SAVE4.money;
  $('#lkMsg').innerHTML = (LK.g === 'trau' ? (lkLv(LK.g) < 1 ? 'Gánh trầu chưa có mái: nâng lên sạp lều mới thấy mái. ' : lkLv(LK.g) >= 2 ? 'Gian mái ngói đã có mái và biển riêng, ở đây chỉ chọn đồ đặt cạnh quán. ' : '') : (lkLv(LK.g) < 1 ? 'Mẹt hàng chưa có mái: nâng lên sạp tre mới thấy mái. ' : lkLv(LK.g) >= 3 ? 'Nhà mặt chợ có mái nhà rồi, mái chọn ở đây không hiện. ' : '')) + `Trong túi: ${c4Money(Math.round(SAVE4.money))}` + (cost > SAVE4.money ? ' (chưa đủ tiền)' : '');
  lkDraw();
}
function c4LookOpen(g) {
  const cur = c4LookOf(g); LK = { g, look: cur ? JSON.parse(JSON.stringify(cur)) : {} };
  $('#lkT').textContent = 'Trang trí · ' + (g === 'trau' ? 'quán trầu' : C4_GOODS[g].name.toLowerCase()); cnShow(c4LookSheet); lkRefresh();
}
$('#lkX').addEventListener('click', () => { AU.tap(); cnHide(c4LookSheet); LK = null; });
$('#lkGo').addEventListener('click', () => {
  if (!LK) return; const g = LK.g, cost = c4LookCost(g, LK.look); if (cost > SAVE4.money) return;
  const L = LK.look; if (!(L.roof || L.post || L.sign) && L.col) delete L.col;
  const own = c4LookOwn(g); if (L.roof) own['roof:' + L.roof] = 1; if (L.post) own['post:' + L.post] = 1; if (L.sign) own['sign:' + L.sign] = 1; if (L.col && L.col !== 'red' && (L.roof || L.sign)) own['col:' + L.col] = 1; for (const k of L.deco || []) own['deco:' + k] = 1;
  SAVE4.money -= cost; (SAVE4.look || (SAVE4.look = {}))[g] = L; if (!(L.roof || L.post || L.sign || (L.deco && L.deco.length))) delete SAVE4.look[g];
  persist4(); AU.pluck(84); if (typeof c4Hud === 'function') c4Hud(); toast(cost > 0 ? `Đã trang trí quán, tốn ${c4Money(cost)}.` : 'Đã đổi kiểu quán.', 2.6); cnHide(c4LookSheet); LK = null;
});
// a block on the stall's sheet (cho.js c4OpenUp)
function c4LookBlock(g) {
  const d = document.createElement('div'); d.innerHTML = '<h4>Trang trí quán</h4><p class="sm">Chọn mái, cột, biển hiệu, màu và đồ trang trí cho quán này.</p><div class="row"><button class="btn alt">Trang trí</button></div>';
  d.querySelector('button').addEventListener('click', () => { AU.tap(); c4LookOpen(g); }); return d;
}
