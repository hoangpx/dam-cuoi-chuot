/* Chương XI · Dãy hàng thuê (a player's idea passed on by the owner, 2026-11-10: "lập gian hàng giống vợ chồng khởi nghiệp, tiền
   trong làng Vũ Đại không tính vào VCKN, mở rộng chợ làng, có các gian hàng để người chơi thuê bán (VD quầy thuốc Nam, vật dụng decor
   nhà), có thể thuê giúp việc, NPC mua được gian hàng mình bán, khu thờ tự ở nhà giúp có thêm phúc để nhiều NPC mua hơn, mỗi gian hàng
   có thể có khu thờ Thần Tài, Thổ Địa để tránh chuyện chẳng may xảy ra").
   A row of four stalls north of the market (area 'dayhang', its way in at the market's (12,0)). A stall is rented by the day for one
   trade (C11_SAP_TRADES: what it sells best); up to C11_SAP_SLOTS stacks from the bag are laid out, each at a price the player picks
   (×1.5 … ×3 of the item's price: retail, dearer than the box or the Thu mua stall). Villagers buy while someone keeps the stall, 7:00–19:00: the player standing by it, or a hired hand
   paid by the day. How often they come: c11SapRate (the trade, the price, the house altar's incense today (c11Phuc), the stall's own
   Thần Tài – Thổ Địa altar lit today). Mishaps (a thief, goods spoiling) strike some days unless that altar was lit. All money is
   chương XI's own (SAVE11.money). Saved in SAVE11.sap[i] = { trade, until, slots: [{ id, n, m }], hand, than, huong, log, sum }. */
const C11_SAP_X0 = [2, 7, 12, 17], C11_SAP_RENT = [30, 35, 40, 50], C11_SAP_SLOTS = 6, C11_SAP_WAGE = 25, C11_SAP_THAN = 300, C11_SAP_HOURS = [7 * 60, 19 * 60];
const C11_SAP_TRADES = {
  rau: { name: 'Hàng rau quả', sign: 'RAU QUẢ', cats: ['nong', 'thu'] },
  thuoc: { name: 'Quầy thuốc Nam', sign: 'THUỐC NAM', cats: ['rung'] },
  ca: { name: 'Hàng cá tôm', sign: 'HÀNG CÁ', cats: ['ca'] },
  an: { name: 'Hàng quà bánh', sign: 'QUÀ BÁNH', cats: ['mon', 'che'] },
  tap: { name: 'Hàng tạp hoá, đồ dùng', sign: 'TẠP HOÁ', cats: ['vat', 'do', 'hat', 'quy'] },
};
const C11_SAP_MULT = [[1.5, 'Giá chợ'], [1.8, 'Giá cao'], [2.2, 'Giá đắt'], [3, 'Giá cắt cổ']];   // retail: dearer than the shipping box (×1) or the Thu mua stall (×1.25), the reward for keeping a stall
const C11_SAP_LIKE = { 1.5: 1, 1.8: .7, 2.2: .45, 3: .18 };              // how readily a buyer pays that price
const C11_DAYHANG = (() => {
  const W = 22, H = 14, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? 't' : 'g'));
  for (const x0 of C11_SAP_X0) { for (let y = 3; y <= 5; y++) for (let x = x0; x <= x0 + 2; x++) m[y][x] = 'S'; m[6][x0 + 1] = 'S'; }
  for (let x = 1; x < W - 1; x++) m[7][x] = m[8][x] = 'p';
  for (let y = 8; y < H - 1; y++) m[y][10] = m[y][11] = 'p';
  m[H - 1][10] = 'E';
  for (const [x, y] of [[3, 11], [6, 10], [15, 11], [18, 10], [1, 2], [20, 2], [6, 2], [16, 2]]) m[y][x] = 't';
  return m;
})();
C11_AREAS.dayhang = { id: 'dayhang', name: 'Dãy hàng thuê', map: C11_DAYHANG, treeAt: { '3,11': 'xoai', '6,10': 'phuong', '15,11': 'dao', '18,10': 'xoai' }, houses: [], stalls: [],
  exits: { '10,13': ['cho', 12.5, 1.8, '↓ Chợ làng'] },
  lane: [[[[.5, 7.6], [6, 7.5], [11, 7.8], [16, 7.5], [21.5, 7.6]], 1.6], [[[10.6, 7.8], [10.5, 10], [10.7, 13.5]], 1.3]] };
C11_MARKET[0][12] = 'E'; C11_MARKET[1][12] = 'g';
C11_AREAS.cho.exits['12,0'] = ['dayhang', 10.5, 12.2, 'Dãy hàng thuê ↑'];
C11_AREAS.cho.lane.push([[[12.5, -.5], [12.4, 3], [12.2, 6.5]], .7]);
C11_BEASTS.dayhang = [['ga', 4.5, 10.5, '#c119a5a'], ['meo', 13.5, 9.6]];

const c11Saps = () => SAVE11.sap || (SAVE11.sap = [null, null, null, null]);
const c11SapOn = s => s && s.until >= SAVE11.day;                         // rented today
const c11SapAt = (tx, ty) => C11_SAP_X0.findIndex(x0 => tx >= x0 && tx <= x0 + 2 && ty >= 3 && ty <= 6);
const c11SapPrice = sl => Math.max(1, Math.round(C11_ITEMS[sl.id].price * sl.m));
const c11SapNear = i => C11.area === 'dayhang' && Math.abs(C11.px - (C11_SAP_X0[i] + 1.5)) < 2.6 && C11.py > 6 && C11.py < 9.8;
const c11SapKept = (s, i) => s.hand >= SAVE11.day || c11SapNear(i);
const c11SapOpen = () => { const m = SAVE11.mins % 1440; return m >= C11_SAP_HOURS[0] && m < C11_SAP_HOURS[1]; };
function c11SapRate(s) {                                                  // buyers per game hour at this stall
  let r = 2.2 * c11Phuc() ** 2;                                         // the house altar: more people come
  if (s.huong === SAVE11.day) r *= 1.2;                                 // the stall's own altar lit today
  return r;
}
function c11SapLog(s, text) { s.log = s.log || []; s.log.unshift({ d: SAVE11.day, t: Math.floor(SAVE11.mins), text }); s.log.length = Math.min(s.log.length, 12); }

/* ---------- selling, a little at a time while the game runs ---------- */
function c11SapTick(dtMin) {
  const S = c11Saps();
  S.forEach((s, i) => {
    if (!c11SapOn(s)) return;
    if (s.mish !== SAVE11.day) c11SapMishap(s, i);
    if (!c11SapOpen() || !c11SapKept(s, i)) return;
    const stock = s.slots.filter(sl => sl && sl.n > 0); if (!stock.length) return;
    if (Math.random() > c11SapRate(s) * dtMin / 60) return;               // no buyer this moment
    const T = C11_SAP_TRADES[s.trade], w = stock.map(sl => (T.cats.includes(C11_ITEMS[sl.id].cat) ? 1.6 : .55) * (C11_SAP_LIKE[sl.m] ?? .5));
    let r = Math.random() * w.reduce((a, b) => a + b, 0), k = 0; while (k < w.length - 1 && r > w[k]) { r -= w[k]; k++; }
    const sl = stock[k];
    if (Math.random() > (C11_SAP_LIKE[sl.m] ?? .5)) { if (C11.area === 'dayhang') c11SapBuyer(i, null); return; }   // looked, found it dear, walked on
    const q = Math.min(sl.n, 1 + Math.floor(Math.random() * (C11_ITEMS[sl.id].price < 20 ? 4 : 2))), got = c11SapPrice(sl) * q;
    sl.n -= q; SAVE11.money += got; s.sum = (s.sum || 0) + got; s.today = s.today === SAVE11.day ? s.today : SAVE11.day; s.todaySum = (s.todayDay === SAVE11.day ? s.todaySum || 0 : 0) + got; s.todayDay = SAVE11.day;
    c11SapLog(s, `Bán ${q} ${C11_ITEMS[sl.id].name.toLowerCase()}: ${c4Money(got)}`);
    if (!sl.n) s.slots[s.slots.indexOf(sl)] = null;
    if (C11.area === 'dayhang') { c11SapBuyer(i, `+${got} đ`); } else if (!C11.menu) c11Msg(`Sạp ${C11_SAP_TRADES[s.trade].sign.toLowerCase()} vừa bán ${q} ${C11_ITEMS[sl.id].name.toLowerCase()}`, '#2f6a4c');
    persist11();
  });
}
function c11SapMishap(s, i) {                                              // once a day, at a random moment in opening hours
  if (s.mishAt === undefined || s.mishFor !== SAVE11.day) { s.mishFor = SAVE11.day; s.mishAt = C11_SAP_HOURS[0] + Math.random() * (C11_SAP_HOURS[1] - C11_SAP_HOURS[0]); }
  if (SAVE11.mins % 1440 < s.mishAt) return;
  s.mish = SAVE11.day;
  if (s.huong === SAVE11.day) return;                                    // Thần Tài and Thổ Địa keep it safe today
  const stock = s.slots.filter(sl => sl && sl.n > 0); if (!stock.length || Math.random() > .2) return;
  const sl = stock[Math.floor(Math.random() * stock.length)], it = C11_ITEMS[sl.id], soft = ['nong', 'rung', 'ca', 'mon'].includes(it.cat);
  const q = Math.min(sl.n, 1 + Math.floor(Math.random() * 3)); sl.n -= q; if (!sl.n) s.slots[s.slots.indexOf(sl)] = null;
  const text = soft && Math.random() < .5 ? `Trời nắng gắt, ${q} ${it.name.toLowerCase()} hỏng mất` : `Kẻ cắp lẻn vào lấy mất ${q} ${it.name.toLowerCase()}`;
  c11SapLog(s, text); c11Msg(`Sạp ${C11_SAP_TRADES[s.trade].sign.toLowerCase()}: ${text}`, '#a3332a'); persist11();
}

/* ---------- the stall's sheets ---------- */
function c11SapTap(i) {
  const s = c11Saps()[i];
  if (!s || (!c11SapOn(s) && !s.slots.some(Boolean))) { c11SapRentMenu(i); return; }
  if (!c11SapOn(s)) {                                                    // the rent ran out: renew it, or take the goods home
    C11.menu = { title: `Sạp số ${i + 1}`, note: 'Hết hạn thuê rồi, hàng vẫn để đây', rows: [
      { name: 'Thuê tiếp', sub: C11_SAP_TRADES[s.trade].name, tag: ' ', ok: true, f: () => c11SapDays(i, s.trade) },
      { name: 'Dọn hàng về', sub: 'Cất hết hàng vào túi rồi trả sạp', tag: ' ', ok: true, f: () => { c11SapClear(i); } },
    ] }; return;
  }
  const T = C11_SAP_TRADES[s.trade], n = s.slots.filter(Boolean).length, kept = s.hand >= SAVE11.day ? 'có người trông' : c11SapNear(i) ? 'bạn đang đứng bán' : 'không ai trông, chưa bán được';
  C11.menu = { title: `${T.name} · sạp ${i + 1}`, note: `Hôm nay bán được ${c4Money(s.todayDay === SAVE11.day ? s.todaySum || 0 : 0)} · ${kept}`, cols: 2, rows: [
    { name: 'Bày hàng', sub: `${n}/${C11_SAP_SLOTS} chỗ · hàng đúng nghề bán chạy hơn`, tag: ' ', ok: n < C11_SAP_SLOTS, f: () => c11SapPut(i, 0) },
    { name: 'Hàng trên sạp', sub: n ? s.slots.filter(Boolean).map(sl => `${C11_ITEMS[sl.id].name} ×${sl.n}`).join(', ') : 'Chưa bày gì', tag: ' ', ok: true, f: () => c11SapGoods(i) },
    { name: s.hand >= SAVE11.day ? 'Người trông sạp' : 'Thuê người trông', sub: s.hand >= SAVE11.day ? `Trông đến hết ngày ${s.hand}` : 'Có người trông thì mình đi đâu sạp vẫn bán', price: C11_SAP_WAGE, ok: SAVE11.money >= C11_SAP_WAGE, f: () => c11SapHand(i) },
    { name: s.than ? 'Ban thờ Thần Tài' : 'Lập ban thờ Thần Tài', sub: s.than ? (s.huong === SAVE11.day ? 'Hương đã thắp, hôm nay bình an' : 'Thắp hương: khách đông hơn, tránh chuyện xui') : 'Thờ Thần Tài, Thổ Địa cho buôn bán bình an', price: s.than ? 2 : C11_SAP_THAN, f: () => c11SapThan(i) },
    { name: 'Sổ bán hàng', sub: (s.log && s.log[0] ? s.log[0].text : 'Chưa có gì') + ` · tổng ${c4Money(s.sum || 0)}`, tag: ' ', ok: true, f: () => c11SapBook(i) },
    { name: 'Gia hạn thuê', sub: `Đang thuê đến hết ngày ${s.until}`, tag: ' ', ok: true, f: () => c11SapDays(i, s.trade) },
  ] };
}
function c11SapRentMenu(i) {
  C11.menu = { title: `Sạp số ${i + 1} cho thuê`, note: `Tiền thuê ${c4Money(C11_SAP_RENT[i])} một ngày · chọn nghề bán`, cols: 2, rows: Object.entries(C11_SAP_TRADES).map(([k, T]) => ({
    name: T.name, sub: 'Bán chạy: ' + T.cats.map(c => ({ nong: 'nông sản', thu: 'trứng sữa', rung: 'đồ rừng, lá thuốc', ca: 'cá tôm cua ốc', mon: 'món ăn', che: 'đồ nhà làm', vat: 'vật liệu', do: 'đồ dùng', hat: 'hạt giống', quy: 'đồ quý' }[c])).join(', '), tag: ' ', ok: true, f: () => c11SapDays(i, k) })) };
}
function c11SapDays(i, trade) {
  const R = C11_SAP_RENT[i];
  C11.menu = { title: C11_SAP_TRADES[trade].name, note: `Sạp số ${i + 1}`, rows: [[1, R], [3, R * 3], [7, R * 6]].map(([d, cost]) => ({ name: d === 1 ? 'Thuê hôm nay' : `Thuê ${d} ngày`, sub: d === 7 ? 'Thuê cả tuần được bớt một ngày' : `Đến hết ngày ${Math.max(SAVE11.day, (c11Saps()[i] && c11SapOn(c11Saps()[i]) ? c11Saps()[i].until + 1 : SAVE11.day)) + d - 1}`, price: cost, f: () => {
    if (SAVE11.money < cost) { C11.menu.note = 'Chưa đủ tiền thuê'; return; }
    const S = c11Saps(), old = S[i]; SAVE11.money -= cost;
    const from = old && c11SapOn(old) ? old.until + 1 : SAVE11.day;
    S[i] = Object.assign(old || { slots: Array(C11_SAP_SLOTS).fill(null), sum: 0, log: [] }, { trade, until: from + d - 1 });
    c11SapLog(S[i], `Thuê sạp đến hết ngày ${S[i].until}`); persist11(); c11Sfx.tap(); c11SapTap(i);
  } })) };
}
const c11SapCanSell = id => C11_ITEMS[id] && C11_ITEMS[id].cat !== 'truyen' && C11_ITEMS[id].price > 0;
function c11SapPut(i, page) {
  const s = c11Saps()[i], bag = SAVE11.bag.map((sl, k) => ({ sl, k })).filter(o => o.sl && c11SapCanSell(o.sl.id));
  if (!bag.length) { C11.menu.note = 'Trong túi không có gì bán được'; return; }
  const per = 7, P = Math.min(page, Math.ceil(bag.length / per) - 1), T = C11_SAP_TRADES[s.trade];
  const rows = bag.slice(P * per, P * per + per).map(({ sl, k }) => { const it = C11_ITEMS[sl.id]; return { name: `${it.name} ×${sl.n}`, sub: (T.cats.includes(it.cat) ? 'Đúng nghề, bán chạy · ' : 'Không đúng nghề, bán chậm · ') + `thùng bán ở nhà trả ${c4Money(it.price)}`, tag: ' ', ok: true, f: () => c11SapPrice1(i, k) }; });
  if (bag.length > per) rows.push({ name: 'Xem thêm ›', sub: `Trang ${P + 1}`, tag: ' ', ok: true, f: () => c11SapPut(i, (P + 1) * per < bag.length ? P + 1 : 0) });
  rows.push({ name: '‹ Quay lại', sub: 'Về sạp', tag: ' ', ok: true, f: () => c11SapTap(i) });
  C11.menu = { title: 'Bày hàng lên sạp', note: 'Chọn món trong túi', cols: 2, rows };
}
function c11SapPrice1(i, k) {
  const sl = SAVE11.bag[k]; if (!sl) return; const it = C11_ITEMS[sl.id];
  C11.menu = { title: `${it.name} ×${sl.n}`, note: 'Giá càng cao càng ít người mua', cols: 2, rows: C11_SAP_MULT.map(([m, nm]) => ({ name: nm, sub: `${c4Money(Math.max(1, Math.round(it.price * m)))} một ${C11_ITEMS[sl.id].cat === 'ca' ? 'con' : 'món'}`, tag: ' ', ok: true, f: () => {
    const s = c11Saps()[i], same = s.slots.find(o => o && o.id === sl.id && o.m === m), free = s.slots.findIndex(o => !o);
    if (!same && free < 0) { C11.menu.note = 'Sạp đầy rồi'; return; }
    const q = sl.n; SAVE11.bag[k] = null;
    if (same) same.n += q; else s.slots[free] = { id: sl.id, n: q, m };
    persist11(); c11Sfx.tap(); c11SapTap(i); C11.menu.note = `Đã bày ${q} ${it.name.toLowerCase()} lên sạp`;
  } })) };
}
function c11SapGoods(i) {
  const s = c11Saps()[i], rows = s.slots.map((sl, k) => sl ? { name: `${C11_ITEMS[sl.id].name} ×${sl.n}`, sub: `${c4Money(c11SapPrice(sl))} một món · chạm để cất về túi`, tag: ' ', ok: true, f: () => {
    const left = c11Add(sl.id, sl.n); if (left === sl.n) { C11.menu.note = 'Túi đầy rồi'; return; }
    if (left) sl.n = left; else s.slots[k] = null; persist11(); c11Sfx.tap(); c11SapGoods(i);
  } } : null).filter(Boolean);
  rows.push({ name: '‹ Quay lại', sub: 'Về sạp', tag: ' ', ok: true, f: () => c11SapTap(i) });
  C11.menu = { title: 'Hàng trên sạp', note: rows.length > 1 ? 'Chạm một món để cất về túi' : 'Sạp trống', cols: 2, rows };
}
function c11SapClear(i) {
  const s = c11Saps()[i];
  for (let k = 0; k < s.slots.length; k++) { const sl = s.slots[k]; if (!sl) continue; const left = c11Add(sl.id, sl.n); if (left) { sl.n = left; C11.menu.note = 'Túi đầy, còn hàng chưa mang về được'; persist11(); return; } s.slots[k] = null; }
  c11Saps()[i] = null; persist11(); C11.menu = null; c11Msg('Đã dọn hàng về, trả sạp', '#2f6a4c');
}
function c11SapHand(i) {
  const s = c11Saps()[i];
  if (s.hand >= SAVE11.day) { c11Msg(`Người trông sạp làm đến hết ngày ${s.hand}`, '#5b2f1f'); return; }
  if (SAVE11.money < C11_SAP_WAGE) { C11.menu.note = 'Chưa đủ tiền công'; return; }
  SAVE11.money -= C11_SAP_WAGE; s.hand = SAVE11.day; s.handP = s.handP || c11SapHandPerson(i); c11SapLog(s, `Thuê ${s.handP.name} trông sạp hôm nay`); persist11(); c11Sfx.tap(); c11SapTap(i);
}
const C11_SAP_HANDS = ['cái Tẹo', 'thằng Cò', 'chị Nhỡ', 'cô Gấm', 'anh Mít', 'cái Bống'];
function c11SapHandPerson(i) { const nm = C11_SAP_HANDS[(i * 2 + SAVE11.day) % C11_SAP_HANDS.length]; return { id: 'hand' + i, name: nm, sort: C4_ADULT_SORTS2[(i * 3 + 1) % C4_ADULT_SORTS2.length] }; }
function c11SapThan(i) {
  const s = c11Saps()[i];
  if (!s.than) { if (SAVE11.money < C11_SAP_THAN) { C11.menu.note = 'Chưa đủ tiền lập ban thờ'; return; } SAVE11.money -= C11_SAP_THAN; s.than = 1; c11SapLog(s, 'Lập ban thờ Thần Tài, Thổ Địa'); persist11(); c11Sfx.tap(); c11SapTap(i); return; }
  if (s.huong === SAVE11.day) { C11.menu.note = 'Hôm nay đã thắp hương rồi'; return; }
  if (SAVE11.money < 2) { C11.menu.note = 'Không đủ tiền mua hương'; return; }
  SAVE11.money -= 2; s.huong = SAVE11.day; persist11(); c11Sfx.tap(); c11SapTap(i); C11.menu.note = 'Đã thắp hương Thần Tài: buôn may bán đắt, bình an cả ngày';
}
function c11SapBook(i) {
  const s = c11Saps()[i], L = (s.log || []).slice(0, 8);
  C11.menu = { title: 'Sổ bán hàng', note: `Tổng đã bán: ${c4Money(s.sum || 0)}`, rows: [...L.map(l => ({ name: `Ngày ${l.d} · ${Math.floor(l.t / 60) % 24}:${String(Math.floor(l.t % 60 / 10) * 10).padStart(2, '0')}`, sub: l.text, tag: ' ', ok: true, f: () => {} })),
    { name: '‹ Quay lại', sub: 'Về sạp', tag: ' ', ok: true, f: () => c11SapTap(i) }] };
}

/* ---------- people: buyers walking up, the hired hand at the counter ---------- */
function c11SapBuyer(i, pop) {
  const B = C11.sapBuyers || (C11.sapBuyers = []); if (B.length > 5) return;
  const pool = C4_ADULT_SORTS2, x = C11_SAP_X0[i] + 1.5 + (Math.random() - .5) * 1.2;
  B.push({ p: { sort: pool[Math.floor(Math.random() * pool.length)], id: 'mua' + Math.random() }, x: 10.5 + (Math.random() - .5), y: 13.2, path: [[10.6, 7.9], [x, 7.9], [x, 7.25]], st: 0, wait: 1.8, pop, i, ph: 0, face: 1 });
}
function c11SapPeople(dt) {
  const B = C11.sapBuyers; if (!B) return;
  for (const b of B) {
    if (b.st === 1) { b.wait -= dt; b.moving = false; if (b.wait <= 0) { b.st = 2; b.path = [[b.x, 7.9], [10.6, 7.9], [10.5, 13.4]]; if (b.pop) c11Pop(Math.floor(b.x), Math.floor(b.y) - 2, b.pop, '#2f6a4c'); } continue; }
    const tgt = b.path[0]; if (!tgt) { b.done = 1; continue; }
    const dx = tgt[0] - b.x, dy = tgt[1] - b.y, d = Math.hypot(dx, dy), sp = 2.2 * dt;
    b.moving = true; b.ph += dt * 9; if (Math.abs(dx) > .05) b.face = dx > 0 ? 1 : -1;
    if (d <= sp) { b.x = tgt[0]; b.y = tgt[1]; b.path.shift(); if (!b.path.length) { if (b.st === 0) b.st = 1; else b.done = 1; } } else { b.x += dx / d * sp; b.y += dy / d * sp; }
  }
  C11.sapBuyers = B.filter(b => !b.done);
}
function c11SapDrawStall(g, i, sx, sy, k, T) {
  const s = c11Saps()[i], A = c11Art(), on = s && c11SapOn(s), label = on ? C11_SAP_TRADES[s.trade].sign : 'CHO THUÊ';
  A.stalls['own:' + label] = A.stalls['own:' + label] || A.stallP(label, 'orange', 'own');
  const X = sx(C11_SAP_X0[i] + 1.5), Y = sy(6);
  c11Shade(g, X, Y, 110 * k, 14 * k); c11Spr(g, A.stalls['own:' + label], X, Y, k);
  if (s) s.slots.forEach((sl, n) => { if (sl) c11ItemIcon(g, sl.id, X + (n - 2.5) * T * .52, Y - 44 * k, T * .42); });   // the goods laid out on the bamboo platform
  if (s && s.than) {                                                   // a little red altar of Thần Tài – Thổ Địa on the left post
    const ax = X - 92 * k, ay = Y - 70 * k; g.fillStyle = '#b8302a'; g.strokeStyle = INK; g.lineWidth = 1.5; g.fillRect(ax - 9 * k, ay - 14 * k, 18 * k, 14 * k); g.strokeRect(ax - 9 * k, ay - 14 * k, 18 * k, 14 * k);
    g.fillStyle = '#e8c040'; g.fillRect(ax - 6 * k, ay - 11 * k, 12 * k, 4 * k);
    if (s.huong === SAVE11.day) { g.strokeStyle = 'rgba(235,232,222,.7)'; g.lineWidth = 1.4; g.beginPath(); for (let n = 0; n < 8; n++) { const yy = ay - 14 * k - n * 4 * k, xx = ax + Math.sin(C11.t * 1.6 + n * .7) * n * .8 * k; n ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  }
}

/* ---------- hooks ---------- */
const c11SapUpd0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  if (!C11.sleep && !C11.fade) c11SapTick(dt * C11_MPS);
  if (C11.area === 'dayhang') c11SapPeople(dt); else C11.sapBuyers = null;
  return c11SapUpd0(dt);
};
const c11SapDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {
  c11SapDraw0(E, g, sx, sy, k, T);
  if (C11.area !== 'dayhang') return;
  const S = c11Saps();
  C11_SAP_X0.forEach((x0, i) => {
    E.push({ y: 6, d: () => c11SapDrawStall(g, i, sx, sy, k, T) });
    const s = S[i];
    if (s && c11SapOn(s) && s.hand >= SAVE11.day && c11SapOpen()) { const p = s.handP || (s.handP = c11SapHandPerson(i)); E.push({ y: 6.92, d: () => c11Folk1(g, p, sx(x0 + 1.5), sy(6.92), -1, 0, false, T, null, C11.v) }); }
  });
  for (const b of C11.sapBuyers || []) E.push({ y: b.y, d: () => { const s9 = T / 115; c11Mouse(g, b.p, sx(b.x), sy(b.y), b.st === 1 ? 1 : b.face, b.ph, b.moving, s9, null); } });
};
const c11SapAct0 = c11ActNew, c11SapCan0 = c11CanNew;
c11ActNew = function (tx, ty, tool, k, key) {
  if (C11.area === 'dayhang' && !C11.eat) { const i = c11SapAt(tx, ty); if (i >= 0) { c11SapTap(i); return true; } }
  return c11SapAct0(tx, ty, tool, k, key);
};
c11CanNew = function (tx, ty, tool, k, key) {
  if (C11.area === 'dayhang' && c11SapAt(tx, ty) >= 0) return true;
  return c11SapCan0(tx, ty, tool, k, key);
};
