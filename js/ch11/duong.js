/* Chương XI · Làng Vũ Đại — the highway and the potters' village (owner 2026-11-10/11, batch E: "bắt trộm cướp... thêm làng").
   ĐƯỜNG CÁI QUAN (area duongcai, 40×13): east of the Trạm dừng chân (its new way out at the lane's east end). A long road through
   woods where robbers wait (san.js kinds 'cuop' and their chief 'tuong'): a hit also takes some of the purse; struck down, a
   robber gives it back and more. They are back the next day.
   LÀNG GỐM (area langgom, 26×16): at the road's far end. Two kilns; ông Cả Gốm buys clay dear, sells pots, and fires pieces to
   order (C11_GOM: clay + coal + a fee today, collected from the next day on; SAVE11.gom); bà Hai, a trader, buys anything at ×1.4.
   JOBS on the đình's board (c11Board wrapped, one more post some days): 'hunt' steps (strike down n of a kind, then see who asked:
   robbers for Đội Tảo, boars, snakes) and the ESCORT (step 'escort'): a trader waits at the Trạm, follows the mouse along the
   highway and pays on reaching Làng gốm; leaving the road or fainting loses him. */

/* ---------- places ---------- */
const C11_ROAD_MAP = (() => {
  const W = 40, H = 13, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? 't' : (y >= 5 && y <= 8) ? 'g' : c11Hash(x, y, 617) < .5 ? 't' : 'g'));
  for (let x = 1; x < W - 1; x++) m[6][x] = m[7][x] = 'p';
  for (const [cx, cy] of [[12, 3], [22, 10], [31, 3], [22, 3]]) for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 2; x <= cx + 2; x++) if (y > 0 && y < H - 1) m[y][x] = 'g';   // the robbers' clearings
  for (const [x, y] of [[12, 4], [22, 9], [31, 4], [22, 4]]) m[y][x] = 'g';
  m[6][0] = 'E'; m[6][W - 1] = 'E';
  return m;
})();
const C11_GOM_MAP = (() => {
  const W = 26, H = 16, m = c11Grid(W, H);
  for (let x = 1; x < W - 1; x++) m[8][x] = m[9][x] = 'p';
  for (const [x0, y0] of [[6, 4], [16, 4]]) for (let y = y0; y <= y0 + 1; y++) for (let x = x0; x <= x0 + 1; x++) m[y][x] = 'X';      // the kilns
  for (const [x, y] of [[3, 5], [10, 5], [13, 5], [20, 5], [22, 5]]) m[y][x] = 'X';                                                     // racks of pots
  for (const [x, y] of [[2, 2], [11, 2], [23, 2], [3, 12], [9, 13], [15, 12], [21, 13], [12, 11], [18, 2]]) m[y][x] = 't';
  for (const [y, a, b] of [[12, 5, 7], [13, 4, 7]]) for (let x = a; x <= b; x++) m[y][x] = 'w';                                          // the clay pit, full of water
  m[8][0] = 'E';
  return m;
})();
C11_AREAS.duongcai = { id: 'duongcai', name: 'Đường cái quan', map: C11_ROAD_MAP, treeAt: {}, houses: [], stalls: [], wild: 1,
  exits: { '0,6': ['tram', 19.6, 6.7, '← Trạm dừng chân'], '39,6': ['langgom', 1.8, 8.7, 'Làng gốm →'] },
  lane: [[[[-.5, 6.6], [6, 6.5], [13, 6.9], [20, 6.5], [27, 6.9], [34, 6.5], [39.5, 6.6]], 1.6]] };
C11_AREAS.langgom = { id: 'langgom', name: 'Làng gốm', map: C11_GOM_MAP, houses: [], stalls: [],
  treeAt: { '2,2': 'xoai', '11,2': 'cau', '23,2': 'dao', '3,12': 'banana', '9,13': 'bamboo', '15,12': 'xoai', '21,13': 'banana', '12,11': 'cau', '18,2': 'phuong' },
  exits: { '0,8': ['duongcai', 37.2, 6.7, '← Đường cái quan'] }, lane: [[[[-.5, 8.6], [8, 8.5], [16, 8.8], [25, 8.6]], 1.6]] };
C11_TRAM[6][21] = 'E';
C11_AREAS.tram.exits['21,6'] = ['duongcai', 1.8, 6.7, 'Đường cái quan →'];
C11_BEASTS.duongcai = []; C11_BEASTS.langgom = [['ga', 4.5, 10.5, '#c119a5a'], ['cho', 19.5, 10.6]];

/* ---------- robbers ---------- */
const c11RobDraw = (big) => function (g, X, Y, T, w) {
  const p = w.p || (w.p = { sort: C4_ADULT_SORTS2[(w.i * 3 + 1) % C4_ADULT_SORTS2.length], id: 'cuop' + w.i, name: big ? 'Tướng cướp' : 'Tên cướp' }), sc = big ? 1.22 : 1;
  g.save(); g.translate(X, Y); g.scale(sc, sc); g.translate(-X, -Y);
  c11Folk1(g, p, X, Y, w.face, w.ph, w.mov, T, w.mode === 'run' && w.cd > 1 ? .5 : null, C11.v);
  g.strokeStyle = '#1d1915'; g.lineWidth = T * .09; g.lineCap = 'butt'; g.beginPath(); g.moveTo(X - T * .16, Y - T * .98); g.lineTo(X + T * .16, Y - T * .98); g.stroke();       // a black band over the eyes
  g.strokeStyle = '#5b3a1e'; g.lineWidth = T * .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(X + w.face * T * .2, Y - T * .45); g.lineTo(X + w.face * T * .48, Y - T * 1.05); g.stroke();   // a club
  g.restore();
};
function c11RobHit(w) {
  if (w.loot) return;                                                 // each robber snatches once
  const take = Math.min(SAVE11.money, Math.max(5, Math.min(40, Math.round(SAVE11.money * .05))));
  if (take > 0) { SAVE11.money -= take; w.loot = (w.loot || 0) + take; c11Msg(`Bị cướp giật mất ${c4Money(take)}!`, '#a3332a'); }
}
c11WildKind('cuop', { name: 'Tên cướp', hp: 5, dmg: 8, sp: 2.95, see: 3.8, ai: 'charge', run: 2.4, rest: 1.1, xp: 25, r: .5, tall: 1.5, barY: 1.55, leash: 8, drops: [], onHit: c11RobHit,
  onDead: w => { const m = (w.loot || 0) + 15 + Math.floor(Math.random() * 26); SAVE11.money += m; c11Msg(`Tên cướp bỏ chạy, để lại ${c4Money(m)}`, '#2f6a4c'); } }, c11RobDraw(false));
c11WildKind('tuong', { name: 'Tướng cướp', hp: 16, dmg: 16, sp: 2.6, see: 5, ai: 'charge', run: 3, rest: 1.4, xp: 80, r: .6, tall: 1.8, bar: .8, barY: 1.85, leash: 9, drops: [['vong_bac', .5, 1]], onHit: c11RobHit,
  onDead: w => { const m = (w.loot || 0) + 200; SAVE11.money += m; c11Msg(`Hạ được tướng cướp! Thu lại ${c4Money(m)}`, '#8a5a12'); } }, c11RobDraw(true));
C11_WILD_AT.duongcai = [['cuop', 12, 4], ['cuop', 13, 5], ['tuong', 22, 9], ['cuop', 21, 9], ['cuop', 31, 4], ['cuop', 22, 4]];

/* ---------- the potters ---------- */
for (const [id, name, cat, price, desc] of [['binh_hoa', 'Bình hoa men lam', 'quy', 220, 'Bình gốm vẽ hoa lam, nung ở làng gốm.'], ['tuong_gom', 'Tượng trâu gốm', 'quy', 120, 'Con trâu đất nung, trẻ con mê lắm.']]) if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat, price, food: 0, col: '#b9743a', desc };
const C11_GOM = [
  { id: 'noi_dat', need: { dat_set: 3, than: 1 }, fee: 5 },
  { id: 'chum', need: { dat_set: 5, than: 1 }, fee: 10 },
  { id: 'tuong_gom', need: { dat_set: 4, than: 1 }, fee: 20 },
  { id: 'binh_hoa', need: { dat_set: 6, than: 2 }, fee: 40 },
].filter(r => C11_ITEMS[r.id]);
const C11_GOM_SELL = ['bat_su', 'am_dat', 'noi_dat', 'vai', 'chum', 'binh_voi'].filter(id => C11_ITEMS[id]);
const C11_GOM_WHO = { ca: { x: 7.5, y: 6.9, p: { sort: C4_OLD_SORTS2[2 % C4_OLD_SORTS2.length], id: 'gom_ca', name: 'ông Cả Gốm', role: 'o' } }, hai: { x: 17.5, y: 6.9, p: { sort: C4_ADULT_SORTS2[5 % C4_ADULT_SORTS2.length], id: 'gom_hai', name: 'bà Hai lái buôn', role: 'a' } } };
const c11GomS = () => SAVE11.gom || (SAVE11.gom = []);
function c11OpenGom() {
  const K = c11GomS(), rows = [], ready = K.filter(k => SAVE11.day > k.day);
  if (ready.length) rows.push({ name: `Lấy ${ready.length} món đã nung xong`, sub: ready.map(k => C11_ITEMS[k.id].name).join(', '), tag: 'Lấy về', ok: true, f: () => {
    let got = 0; for (const k of ready) { if (c11Add(k.id, 1)) break; K.splice(K.indexOf(k), 1); got++; }
    persist11(); c11OpenGom(); C11.menu.note = got ? `Đã lấy ${got} món` : 'Túi đầy rồi'; } });
  for (const r of C11_GOM) { const I = C11_ITEMS[r.id], need = Object.entries(r.need), has = need.every(([k, n]) => c11Count(k) >= n);
    rows.push({ name: `Nung ${I.name.toLowerCase()}`, sub: `${need.map(([k, n]) => `${n} ${c11IName(k)} (có ${c11Count(k)})`).join(', ')} · bán được ${c4Money(I.price)} · mai lấy`, tag: `Công nung ${c4Money(r.fee)}`, ok: has && SAVE11.money >= r.fee && K.length < 4, f: () => {
      if (K.length >= 4) { C11.menu.note = 'Lò đang nung bốn món rồi, mai lấy bớt đã'; return; } if (!has || SAVE11.money < r.fee) { C11.menu.note = 'Chưa đủ đất sét, than hoặc tiền công'; return; }
      for (const [k, n] of need) c11Take(k, n); SAVE11.money -= r.fee; K.push({ id: r.id, day: SAVE11.day }); persist11(); c11OpenGom(); C11.menu.note = `Đã đưa vào lò. Mai quay lại lấy ${I.name.toLowerCase()}`; } }); }
  if (c11Count('dat_set')) rows.push({ name: `Bán ${c11Count('dat_set')} đất sét`, sub: 'Làng gốm mua đất sét giá cao gấp ba', tag: `Được ${c4Money(c11Count('dat_set') * C11_ITEMS.dat_set.price * 3)}`, ok: true, f: () => { const n = c11Count('dat_set'); c11Take('dat_set', n); SAVE11.money += n * C11_ITEMS.dat_set.price * 3; persist11(); c11OpenGom(); C11.menu.note = `Đã bán ${n} đất sét`; } });
  for (const id of C11_GOM_SELL) { const I = C11_ITEMS[id]; rows.push({ name: I.name, sub: I.desc, price: I.price, ok: SAVE11.money >= I.price, f: () => { if (SAVE11.money < I.price) { C11.menu.note = 'Chưa đủ tiền'; return; } if (c11Add(id, 1)) { C11.menu.note = 'Túi đầy rồi'; return; } SAVE11.money -= I.price; persist11(); C11.menu.note = `Đã mua ${I.name.toLowerCase()}`; } }); }
  C11.say = { who: C11_GOM_WHO.ca, text: 'Đất sét với than anh mang tới, tôi nung cho. Mai là lấy được.', t: 0 };
  C11.menu = { title: 'Lò gốm ông Cả', note: K.length ? `Trong lò có ${K.length} món của bạn` : 'Mang đất sét và than tới để nung', cols: 1, rows };
}

/* ---------- jobs: hunting and the escort ---------- */
const c11HuntN = s => Math.max(0, (((SAVE11.san || {}).by || {})[s.kind] || 0) - (s.h0 || 0));
const C11_HUNT_POSTS = [
  { kind: 'cuop', n: 3, who: 'tao', title: 'Dẹp cướp ở đường cái quan', m: 320, say: 'Hạ được ba tên rồi à? Quan trên biết thì làng mình được tiếng. Tiền thưởng của đình đây.' },
  { kind: 'lon', n: 2, who: 'dau', title: 'Lợn rừng phá nương', m: 180, say: 'Thế là nương ngô nhà tôi yên rồi. Cảm ơn anh, anh cầm lấy.' },
  { kind: 'ran', n: 3, who: 'trade:thầy lang', title: 'Diệt rắn trong rừng rậm', m: 140, say: 'Bớt được ba con rắn độc, người đi rừng đỡ khổ. Tiền công của anh.' },
  { kind: 'doi', n: 4, who: 'tu', title: 'Đuổi dơi trong hang', m: 110, say: 'Dơi bớt thì người làng mới dám vào hang lấy than. Đình gửi anh chút tiền.' },
];
const C11_ESCORT_ROUTE = ['tram', 'duongcai', 'langgom'];
(() => {
  const oldText = c11StepText;
  c11StepText = function (s) {
    if (s.t === 'hunt') { const p = c11P(c11Who(s.who)), n = Math.min(s.n, c11HuntN(s)); return n >= s.n ? `Đã hạ đủ ${s.n} ${C11_WILD[s.kind].name.toLowerCase()}, về gặp ${p ? p.name : '?'}` : `Hạ ${s.n} ${C11_WILD[s.kind].name.toLowerCase()} (được ${n}/${s.n}), rồi gặp ${p ? p.name : '?'}`; }
    if (s.t === 'escort') return 'Đón lái buôn ở Trạm dừng chân, đưa qua đường cái quan tới Làng gốm';
    return oldText(s);
  };
  const oldBoard = c11Board;
  c11Board = function () {
    const B = oldBoard(); if (B.ex || SAVE11.day < 6) return B; B.ex = 1;
    const day = SAVE11.day, r = j => c11Hash(day, j, 909);
    if (r(1) < .34) { const H = C11_HUNT_POSTS.filter(h => c11Who(h.who) && day >= (h.from || 0)), h = H[Math.floor(r(2) * H.length)]; if (h) B.posts.push({ id: `b${day}_san`, big: 1, days: 3, title: h.title, giver: 'lang', steps: [{ t: 'hunt', kind: h.kind, n: h.n, who: c11Who(h.who), h0: (((SAVE11.san || {}).by || {})[h.kind] || 0), say: h.say }], end: h.say, reward: { m: h.m, ff: { [c11Who(h.who)]: 200 } } }); }
    else if (r(1) < .56) B.posts.push({ id: `b${day}_hotong`, big: 1, days: 2, title: 'Hộ tống lái buôn sang Làng gốm', giver: 'lang', steps: [{ t: 'escort', who: 'x_none' }], reward: { m: 260 } });
    return B;
  };
  const escortQ = () => c11Q().act.find(q => q.steps[q.si] && q.steps[q.si].t === 'escort');
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) {
    const had = C11.escort;
    oldEnter(id, x, y, quiet);
    const q = escortQ();
    if (had && q) {
      if (!C11_ESCORT_ROUTE.includes(id)) { C11.escort = null; const Q = c11Q(); Q.act = Q.act.filter(a => a !== q); persist11(); setTimeout(() => c11Msg('Lái buôn không dám đi đường khác, bỏ về. Việc hộ tống hỏng rồi', '#a3332a'), 600); }
      else { had.x = x - .6; had.y = y; C11.escort = had;
        if (id === 'langgom') { const v = had; v.wait = 0; q.si = q.steps.length; q.end = 'Tới nơi bình yên rồi! Không có anh thì mất cả gánh hàng. Tiền công của anh đây.'; setTimeout(() => { c11QuestDone(q, v); v.leave = 4; }, 700); } }
    } else if (!q) C11.escort = null;
    if (id === 'tram' && q && !C11.escort) { C11.escort = { x: 16.5, y: 6.8, face: -1, ph: 0, wait: 0, p: { sort: C4_ADULT_SORTS2[7 % C4_ADULT_SORTS2.length], id: 'laibuon', name: 'Lái buôn' } }; setTimeout(() => { if (C11.escort) c11Say(C11.escort, 'Anh là người đình cử tới à? Đi thôi, nhờ cả vào anh đấy.'); }, 500); }
  };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    const G = C11, e = G.escort; if (!e || G.fade || G.sleep) return;
    if (e.leave !== undefined) { e.leave -= dt; if (e.leave <= 0) G.escort = null; return; }
    const tx = G.px - G.face * .9, ty = G.py + .1, ex = tx - e.x, ey = ty - e.y, d = Math.hypot(ex, ey); e.mov = false;
    if (d > .5) { const st = Math.min(d, (d > 3 ? 3.4 : 2.7) * dt), nx = e.x + ex / d * st, ny = e.y + ey / d * st; if (c11WildFree(nx, e.y)) { e.x = nx; e.mov = true; } if (c11WildFree(e.x, ny)) { e.y = ny; e.mov = true; } if (Math.abs(ex) > .05) e.face = ex > 0 ? 1 : -1; e.ph += dt * 7; if (d > 6) { e.x = tx; e.y = ty; } }
  };
  /* the kilns, the racks, the two keepers, the trader who follows */
  const kiln = (g, X, Y, T, t, lit) => {
    g.fillStyle = 'rgba(22,46,34,.25)'; g.beginPath(); g.ellipse(X, Y, T * 1.1, T * .2, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b5623c'; g.strokeStyle = '#1d1915'; g.lineWidth = 2.4; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(X - T, Y); g.lineTo(X - T, Y - T * .7); g.quadraticCurveTo(X - T * .9, Y - T * 1.75, X, Y - T * 1.8); g.quadraticCurveTo(X + T * .9, Y - T * 1.75, X + T, Y - T * .7); g.lineTo(X + T, Y); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 1.2; for (let r = 0; r < 6; r++) { const y = Y - T * (.18 + r * .26), hw = T * (r < 3 ? 1 : 1 - (r - 2) * .22); g.beginPath(); g.moveTo(X - hw, y); g.lineTo(X + hw, y); g.stroke(); for (let c = -3; c <= 3; c++) { const x = X + (c + (r % 2 ? .5 : 0)) * T * .3; if (Math.abs(x - X) < hw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + T * .26); g.stroke(); } } }
    g.fillStyle = '#1d1915'; g.beginPath(); g.moveTo(X - T * .3, Y); g.lineTo(X - T * .3, Y - T * .35); g.quadraticCurveTo(X, Y - T * .7, X + T * .3, Y - T * .35); g.lineTo(X + T * .3, Y); g.closePath(); g.fill();
    if (lit) { const fl = .7 + Math.sin(t * 9) * .2; g.fillStyle = '#e5691a'; g.beginPath(); g.moveTo(X - T * .22, Y); g.quadraticCurveTo(X - T * .1, Y - T * .5 * fl, X, Y - T * .2); g.quadraticCurveTo(X + T * .12, Y - T * .55 * fl, X + T * .22, Y); g.closePath(); g.fill(); g.fillStyle = '#f2cf5a'; g.beginPath(); g.ellipse(X, Y - T * .08, T * .1, T * .12 * fl, 0, 0, 6.283); g.fill(); }
    g.fillStyle = '#7a4a34'; g.strokeStyle = '#1d1915'; g.lineWidth = 2; g.beginPath(); g.rect(X - T * .16, Y - T * 2.05, T * .32, T * .3); g.fill(); g.stroke();                        // the flue
    for (let i = 0; i < 3; i++) { const p = (t * .25 + i / 3) % 1; g.fillStyle = `rgba(230,225,215,${.5 * (1 - p)})`; g.beginPath(); g.arc(X + Math.sin(t + i * 2) * T * .12 + p * T * .3, Y - T * 2.1 - p * T * 1.2, T * (.1 + p * .22), 0, 6.283); g.fill(); }
  };
  const rack = (g, X, Y, T, h) => {
    g.fillStyle = 'rgba(22,46,34,.2)'; g.beginPath(); g.ellipse(X, Y, T * .5, T * .1, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#1d1915'; g.lineWidth = 2; g.fillStyle = '#a87648'; for (const y of [0, -T * .42]) { g.beginPath(); g.rect(X - T * .46, Y + y - T * .08, T * .92, T * .08); g.fill(); g.stroke(); }
    g.beginPath(); g.moveTo(X - T * .44, Y); g.lineTo(X - T * .44, Y - T * .5); g.moveTo(X + T * .44, Y); g.lineTo(X + T * .44, Y - T * .5); g.stroke();
    const cols = ['#b9743a', '#8a5a34', '#d8c8a8', '#6a8aa8'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const px = X + (i - 1) * T * .29, py = Y - T * .08 - r * T * .42, c = cols[Math.floor(c11Hash(i, r, h * 97) * 4)]; g.fillStyle = c; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px - T * .07, py); g.quadraticCurveTo(px - T * .15, py - T * .16, px - T * .05, py - T * .27); g.lineTo(px + T * .05, py - T * .27); g.quadraticCurveTo(px + T * .15, py - T * .16, px + T * .07, py); g.closePath(); g.fill(); g.stroke(); }
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    const G = C11, e = G.escort;
    if (e) E.push({ y: e.y, d: () => { c11Folk1(g, e.p, sx(e.x), sy(e.y), e.face, e.ph, e.mov, T, null, G.v); const X = sx(e.x), Y = sy(e.y); g.fillStyle = '#8a5a34'; g.strokeStyle = '#1d1915'; g.lineWidth = 1.6; g.beginPath(); g.roundRect(X - e.face * T * .34 - T * .12, Y - T * .78, T * .24, T * .3, 4); g.fill(); g.stroke(); } });   // his pack
    if (G.area !== 'langgom') return;
    for (const [x0, y0, i] of [[6, 4, 0], [16, 4, 1]]) E.push({ y: y0 + 2, d: () => kiln(g, sx(x0 + 1), sy(y0 + 2), T, G.t + i * 3, i === 0 || c11GomS().length > 0) });
    for (const [x, y] of [[3, 5], [10, 5], [13, 5], [20, 5], [22, 5]]) E.push({ y: y + .95, d: () => rack(g, sx(x + .5), sy(y + .95), T, x) });
    for (const w of Object.values(C11_GOM_WHO)) E.push({ y: w.y, d: () => { c11Folk1(g, w.p, sx(w.x), sy(w.y), G.px < w.x ? -1 : 1, 0, false, T, null, G.v);
      g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const X = sx(w.x), Y = sy(w.y) - T * 1.62; g.lineWidth = 3; g.strokeStyle = 'rgba(251,244,220,.9)'; g.strokeText(w.p.name, X, Y); g.fillStyle = '#1d1915'; g.fillText(w.p.name, X, Y);
      if (w === C11_GOM_WHO.ca && c11GomS().some(k => SAVE11.day > k.day)) { g.fillStyle = '#f2cf5a'; g.strokeStyle = '#1d1915'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - 18, 9, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#1d1915'; g.font = '900 12px "Be Vietnam Pro", sans-serif'; g.fillText('!', X, Y - 17); } } });
  };
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    const G = C11;
    if (G.area === 'langgom' && !G.sleep && !G.menu) for (const [key, w] of Object.entries(C11_GOM_WHO)) if (Math.abs(wx - w.x) < .6 && wy > w.y - 1.6 && wy < w.y + .3) {
      const open = () => key === 'ca' ? c11OpenGom() : c11OpenSell('Bà Hai lái buôn', 1.4, 'Mua mọi thứ, giá hơn ở làng');
      if (Math.hypot(G.px - w.x, G.py - w.y) < 1.9) { G.go = null; open(); return; }
      const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty))), gx = Math.floor(w.x), gy = Math.floor(w.y) + 1;
      if (d[gy] && d[gy][gx] >= 0) { G.go = { path: c11Route(d, gx, gy), act: null }; G.gomGo = key; return; }
    }
    oldTap(tx, ty, wx, wy);
  };
  const oldUpd2 = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd2(dt);
    const G = C11; if (!G.gomGo) return; if (G.area !== 'langgom') { G.gomGo = null; return; }
    if (!G.go) { const key = G.gomGo, w = C11_GOM_WHO[key]; G.gomGo = null; if (!G.menu && Math.hypot(G.px - w.x, G.py - w.y) < 2.3) { if (key === 'ca') c11OpenGom(); else c11OpenSell('Bà Hai lái buôn', 1.4, 'Mua mọi thứ, giá hơn ở làng'); } }
  };
})();
