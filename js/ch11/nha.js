/* Chương XI · Trong nhà (a player's idea passed on by the owner, 2026-11-10: "nhà chỉ dùng để ngủ ... cho phép decor nhà, mua bằng gỗ
   hoặc quan tiền, mỗi căn nhà có khu thờ tự để mua may bán đắt, khu bếp nấu cơm từ thứ mình trồng để tăng nhiều năng lượng hơn, gian
   tiếp khách có sập gụ tủ chè, và gian ngủ"; no toilet, as the player asked).
   The farm's door (tile 'D') now leads into the house, area 'nha', a three-bay house seen from above-and-aside: the bedroom on the left
   (the bed is tile 'D': sleeping there wakes you by the bed), the middle bay with the ancestors' altar ('v') and room for guests, the
   kitchen on the right with the hearth ('k'). Everything is drawn here in code (no background tiles of grass).
   - Altar: light incense once a day (C11_NHA_HUONG đồng): everything sold today fetches C11_NHA_PHUC more (c11Phuc, used by c11Price);
     seven days running, C11_NHA_PHUC7.
   - Hearth: cook a dish (items of the 'mon' category) from what you grew, fished or gathered, plus one stick of firewood (củi khô or gỗ);
     a cooked dish gives more strength than the raw things.
   - Furniture (C11_NHA_DECOR): each piece has its own place; tap the place to buy it with money, or with logs for the wooden ones.
     Bought pieces block their tiles ('z'); a few are hung on the back wall. The sập with the tea set: a cup of tea once a day.
   Saved in SAVE11.nha = { d: { id: day bought }, huong: day, chuoi: days running, tra: day }. Online: the room is 'nha:<own id>'. */
const C11_NHA = (() => {
  const W = 17, H = 11, m = Array.from({ length: H }, () => Array(W).fill('u'));
  for (let x = 0; x < W; x++) { m[0][x] = 'i'; m[9][x] = 'i'; m[10][x] = 'i'; }
  for (let y = 0; y < H; y++) { m[y][0] = 'i'; m[y][W - 1] = 'i'; }
  for (let y = 1; y <= 5; y++) { m[y][5] = 'i'; m[y][11] = 'i'; }     // the two partitions between the bays (open in front)
  m[9][8] = 'E';                                                     // the front door
  m[1][1] = m[1][2] = 'D';                                           // the bed
  m[1][7] = m[1][8] = m[1][9] = 'v';                                 // the altar
  m[1][13] = m[1][14] = 'k';                                         // the hearth
  return m;
})();
const C11_NHA_WAKE = [2.5, 2.75];
const C11_NHA_HUONG = 2, C11_NHA_PHUC = 1.1, C11_NHA_PHUC7 = 1.15;
/* furniture: [id, name, money, logs (0 = only with money), tiles on the floor, wall tiles (row 0) it hangs on, a line about it, needs] */
const C11_NHA_DECOR = [
  ['den', 'Đèn dầu', 120, 0, [[3, 1]], [], 'Ngọn đèn dầu lạc, tối về có chỗ sáng.'],
  ['ruong', 'Rương gỗ', 600, 14, [[4, 1]], [], 'Rương gỗ mít đựng quần áo.'],
  ['man', 'Màn tuyn', 150, 0, [], [[1, 0], [2, 0]], 'Mắc màn mà ngủ cho khỏi muỗi.'],
  ['tranh', 'Tranh Đông Hồ', 250, 0, [], [[3, 0], [4, 0]], 'Bức tranh Đám cưới chuột treo đầu giường.'],
  ['chau', 'Chậu cây cảnh', 400, 0, [[6, 1]], [], 'Cây sanh uốn thế trong chậu sứ men lam.'],
  ['tuche', 'Tủ chè', 1200, 24, [[10, 1]], [], 'Tủ chè gỗ gụ khảm xà cừ, của để dành.'],
  ['cau', 'Đôi câu đối', 200, 0, [], [[6, 0], [10, 0]], 'Đôi câu đối đỏ chữ vàng hai bên ban thờ.'],
  ['hoanh', 'Hoành phi', 600, 10, [], [[7, 0], [8, 0], [9, 0]], 'Bức hoành phi sơn son thếp vàng trên ban thờ.'],
  ['sap', 'Sập gụ', 1500, 30, [[7, 4], [8, 4], [9, 4]], [], 'Bộ sập gụ chân quỳ để tiếp khách.'],
  ['amchen', 'Bộ ấm chén', 300, 0, [], [], 'Ấm chén men lam bày trên sập, khách đến có nước mời.', 'sap'],
  ['chum', 'Chum nước', 200, 0, [[12, 1]], [], 'Chum sành đựng nước mưa nấu cơm.'],
  ['chan', 'Chạn bát', 500, 12, [[15, 1]], [], 'Chạn tre úp bát đĩa cho gọn bếp.'],
];
const C11_NHA_D = Object.fromEntries(C11_NHA_DECOR.map(r => [r[0], { id: r[0], name: r[1], money: r[2], logs: r[3], tiles: r[4], wall: r[5], desc: r[6], need: r[7] }]));
/* recipes: dish id, what goes in ([item, n], …), how many come out; one stick of firewood each time */
const C11_NHA_RECIPES = [
  ['com', [['lua', 1]], 2], ['chao', [['lua', 1]], 2], ['khoai_luoc', [['khoai', 1]], 1], ['khoai_nuong', [['khoai', 1]], 1],
  ['ngo_luoc', [['ngo', 1]], 1], ['ngo_nuong', [['ngo', 1]], 1], ['canh_bi', [['bi', 1]], 2], ['ca_tim_nuong', [['ca', 2]], 1],
  ['rau_muong_luoc', [['muong', 2]], 1], ['canh_mung_toi', [['rau', 2]], 1], ['mang_luoc', [['mang', 1]], 1],
  ['trung_luoc', [['trung_ga', 1]], 1], ['trung_ran_ngai', [['trung_ga', 1], ['ngai_cuu', 1]], 1], ['canh_cua', [['cua_dong', 2], ['rau', 1]], 1],
  ['canh_hen', [['hen', 3]], 1], ['oc_luoc', [['oc_buou', 3]], 1], ['ca_nuong', [['ca_ro', 2]], 1], ['ca_kho', [['ca_tre', 1], ['ot', 1]], 1],
  ['canh_chua', [['ca_chep', 1], ['ca', 1]], 2], ['ech_xao', [['ech', 1], ['sa', 1], ['ot', 1]], 1], ['canh_chua_luon', [['luon', 1], ['chuoi_rung', 1]], 1],
  ['che_hat_sen', [['hat_sen', 2]], 1], ['nom_ngo_sen', [['ngo_sen', 2]], 1],
].filter(([d, ins]) => C11_ITEMS[d] && ins.every(([i]) => C11_ITEMS[i]));
const C11_NHA_FUEL = ['cui_kho', 'go'];

const c11Nha = () => SAVE11.nha || (SAVE11.nha = { d: {}, huong: 0, chuoi: 0, tra: 0, lv: 0 });
/* the house itself (owner's player idea: "mua các loại nhà bằng cách thu thập gỗ hoặc dùng quan tiền"): thatch → tiled roof → brick.
   [name, money, or logs + money, what it brings]; the outside picture on the farm and the floor and walls inside change with it */
const C11_NHA_LV = [
  ['Nhà tranh vách đất', 0, [0, 0], 'Mái rạ, vách đất, nền đất nện.'],
  ['Nhà ngói', 4000, [80, 1000], 'Mái ngói mũi hài, sàn gỗ. Ngủ muộn sáng ra vẫn đủ sức.'],
  ['Nhà gạch ba gian', 12000, [150, 4000], 'Tường gạch, nền lát gạch bát. Hương khói ban thờ linh hơn: bán hàng được giá thêm.'],
];
const c11NhaLv = () => (SAVE11.nha && SAVE11.nha.lv) || 0;
function c11NhaLook() {                                               // the house on the farm: the village's tiled or brick house picture in place of the thatched one
  const h = C11_AREAS.ruong.houses[0], lv = c11NhaLv();
  if (lv) { h.kind = lv === 2 ? 'gach' : 'ngoi'; h.s = .93; } else { delete h.kind; delete h.s; }
}
function c11NhaUpgrade() {
  const lv = c11NhaLv(), N = c11Nha();
  if (lv >= C11_NHA_LV.length - 1) { c11Msg(`${C11_NHA_LV[lv][0]}: nhà đã khang trang nhất làng rồi`, '#2f6a4c'); return; }
  const [name, money, [logs, plus], what] = C11_NHA_LV[lv + 1];
  const done = () => { N.lv = lv + 1; c11NhaLook(); persist11(); c11Sfx.tap(); C11.menu = null; c11Msg(`Dựng xong ${name.toLowerCase()}! Cả xóm sang mừng`, '#2f6a4c'); };
  C11.menu = { title: 'Sửa sang nhà cửa', note: `Đang ở: ${C11_NHA_LV[lv][0].toLowerCase()}`, rows: [
    { name: `Thuê thợ dựng ${name.toLowerCase()}`, sub: what, price: money, f: () => { if (SAVE11.money < money) { C11.menu.note = 'Chưa đủ tiền'; return; } SAVE11.money -= money; done(); } },
    { name: `Tự dựng: ${logs} gỗ + ${c4Money(plus)}`, sub: `Gỗ trong túi và rương: ${c11Count('go') + c11NhaChestCount('go')}`, tag: `${logs} gỗ`, ok: c11Count('go') + c11NhaChestCount('go') >= logs && SAVE11.money >= plus, f: () => {
      if (c11Count('go') + c11NhaChestCount('go') < logs) { C11.menu.note = 'Chưa đủ gỗ: chặt thêm cây'; return; }
      if (SAVE11.money < plus) { C11.menu.note = 'Chưa đủ tiền ngói gạch, công thợ'; return; }
      let left = logs - Math.min(logs, c11Count('go')); c11Take('go', logs - left);
      for (let i = 0; i < SAVE11.chest.length && left > 0; i++) { const sl = SAVE11.chest[i]; if (sl && sl.id === 'go') { const q = Math.min(left, sl.n); sl.n -= q; left -= q; if (!sl.n) SAVE11.chest[i] = null; } }
      SAVE11.money -= plus; done();
    } },
    { name: 'Thôi', sub: 'Để dành thêm đã', tag: ' ', ok: true, f: () => { C11.menu = null; } },
  ] };
}
const c11NhaChestCount = id => SAVE11.chest.reduce((a, sl) => a + (sl && sl.id === id ? sl.n : 0), 0);
const c11NhaHas = id => !!c11Nha().d[id];
function c11Phuc() { const N = SAVE11.nha; return N && N.huong === SAVE11.day ? (N.chuoi >= 7 ? C11_NHA_PHUC7 : C11_NHA_PHUC) + (N.lv >= 2 ? .05 : 0) : 1; }
function c11NhaTiles() { for (const r of C11_NHA_DECOR) for (const [x, y] of r[4]) C11_NHA[y][x] = c11NhaHas(r[0]) ? 'z' : 'u'; }
const c11NhaAt = (tx, ty) => { const r = C11_NHA_DECOR.find(r => r[4].some(([x, y]) => x === tx && y === ty) || r[5].some(([x, y]) => x === tx && y === ty)); return r ? C11_NHA_D[r[0]] : null; };

C11_AREAS.nha = { id: 'nha', name: 'Trong nhà', map: C11_NHA, treeAt: {}, houses: [], stalls: [], indoor: 1, exits: { '8,9': ['ruong', 4.5, 5.75, 'Ra sân'] }, lane: [] };
C11_BEASTS.nha = [['meo', 3.5, 6.5]];

/* ---------- the altar, the hearth, the furniture ---------- */
function c11NhaAltar() {
  const N = c11Nha();
  if (N.huong === SAVE11.day) { c11Msg('Hương đã thắp rồi, hôm nay buôn may bán đắt', '#2f6a4c'); return; }
  C11.menu = { title: 'Ban thờ gia tiên', note: N.chuoi ? `Đã thắp hương ${N.chuoi} ngày liền` : 'Thắp nén hương, khấn ông bà phù hộ', rows: [
    { name: 'Thắp một nén hương', sub: `Hôm nay bán gì cũng được giá hơn${N.chuoi >= 6 ? ', thắp đủ bảy ngày liền thì còn hơn nữa' : ''}`, price: C11_NHA_HUONG, f: () => {
      if (SAVE11.money < C11_NHA_HUONG) { C11.menu.note = 'Không đủ tiền mua hương'; return; }
      SAVE11.money -= C11_NHA_HUONG; N.chuoi = N.huong === SAVE11.day - 1 ? N.chuoi + 1 : 1; N.huong = SAVE11.day; persist11();
      C11.menu = null; c11Sfx.tap(); c11Pop(8, 0, 'Buôn may bán đắt', '#a3332a');
      c11Msg(N.chuoi >= 7 ? `Bảy ngày hương khói đều đặn, hôm nay bán được giá hẳn` : `Đã thắp hương. Hôm nay bán hàng được giá hơn`, '#2f6a4c');
    } },
    { name: 'Thôi', sub: 'Để lúc khác', tag: ' ', ok: true, f: () => { C11.menu = null; } },
  ] };
}
const c11NhaFuel = () => C11_NHA_FUEL.find(i => c11Count(i) > 0);
function c11NhaCook(page = 0) {
  const fuel = c11NhaFuel(), have = ([i, n]) => c11Count(i) >= n;
  const L = C11_NHA_RECIPES.map(r => ({ r, ok: !!fuel && r[1].every(have), some: r[1].some(([i]) => c11Count(i) > 0) })).sort((a, b) => (b.ok - a.ok) || (b.some - a.some));
  const per = 8, pages = Math.ceil(L.length / per), P = Math.min(page, pages - 1);
  const rows = L.slice(P * per, P * per + per).map(({ r: [dish, ins, out], ok }) => {
    const it = C11_ITEMS[dish], need = ins.map(([i, n]) => `${n} ${C11_ITEMS[i].name.toLowerCase()} (${c11Count(i)})`).join(', ');
    return { name: (out > 1 ? out + ' ' : '') + it.name, sub: `${need} · +${it.food} sức`, tag: ok ? 'Nấu' : 'Thiếu', ok, f: () => {
      if (!ok) { C11.menu.note = fuel ? 'Chưa đủ thứ để nấu món này' : 'Hết củi rồi: nhặt củi khô hoặc chặt gỗ'; return; }
      if (c11Add(dish, out) === out) { C11.menu.note = 'Túi đầy rồi'; return; }
      for (const [i, n] of ins) c11Take(i, n); c11Take(fuel, 1); persist11(); c11Sfx.pluck && c11Sfx.pluck();
      C11.nhaSmoke = 2.5; c11NhaCook(P); C11.menu.note = `Đã nấu xong ${it.name.toLowerCase()}, cất trong túi`;
    } };
  });
  if (pages > 1) rows.push({ name: P + 1 < pages ? 'Món khác ›' : '‹ Về đầu', sub: `Trang ${P + 1}/${pages}`, tag: ' ', ok: true, f: () => c11NhaCook(P + 1 < pages ? P + 1 : 0) });
  C11.menu = { title: 'Bếp', cols: 2, note: fuel ? `Mỗi lần nấu tốn 1 ${C11_ITEMS[fuel].name.toLowerCase()} · ${c11Count('cui_kho') + c11Count('go')} củi trong túi` : 'Hết củi: nhặt củi khô trong rừng hoặc chặt gỗ', rows };
}
function c11NhaBuy(D) {
  if (D.need && !c11NhaHas(D.need)) { c11Msg(`Phải có ${C11_NHA_D[D.need].name.toLowerCase()} trước đã`, '#5b2f1f'); return; }
  const rows = [{ name: `Mua ${D.name.toLowerCase()}`, sub: D.desc, price: D.money, f: () => {
    if (SAVE11.money < D.money) { C11.menu.note = 'Chưa đủ tiền'; return; }
    SAVE11.money -= D.money; c11NhaGot(D);
  } }];
  if (D.logs) rows.push({ name: `Tự đóng bằng ${D.logs} gỗ`, sub: `Trong túi có ${c11Count('go')} gỗ`, tag: `${D.logs} gỗ`, ok: c11Count('go') >= D.logs, f: () => {
    if (c11Count('go') < D.logs) { C11.menu.note = 'Chưa đủ gỗ: chặt cây mà lấy'; return; }
    c11Take('go', D.logs); c11NhaGot(D);
  } });
  rows.push({ name: 'Thôi', sub: 'Để sau', tag: ' ', ok: true, f: () => { C11.menu = null; } });
  C11.menu = { title: D.name, note: 'Sắm sửa trong nhà', rows };
}
function c11NhaGot(D) { c11Nha().d[D.id] = SAVE11.day; c11NhaTiles(); persist11(); c11Sfx.tap(); C11.menu = null; c11Msg(`Đã sắm ${D.name.toLowerCase()}`, '#2f6a4c'); }
function c11NhaTea() {
  const N = c11Nha();
  if (!c11NhaHas('amchen')) { c11NhaBuy(C11_NHA_D.amchen); return; }
  if (N.tra === SAVE11.day) { c11Msg('Hôm nay đã ngồi uống trà rồi', '#5b2f1f'); return; }
  N.tra = SAVE11.day; SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + 10); persist11(); c11Pop(8, 3, '+10 sức', '#2f6a4c'); c11Msg('Ngồi sập gụ nhấp chén trà, người nhẹ hẳn đi', '#2f6a4c');
}

/* ---------- drawing ---------- */
const C11_NHA_INK = '#2a221d';
function c11NhaBox(g, x, y, w, h, top, side, front, r = 0) {        // a block seen from above-and-aside: a lit top and a darker front
  g.strokeStyle = C11_NHA_INK; g.lineWidth = 2;
  g.fillStyle = front; g.beginPath(); g.roundRect(x, y + h * .35, w, h * .65, r); g.fill(); g.stroke();
  g.fillStyle = top; g.beginPath(); g.roundRect(x, y, w, h * .38, r); g.fill(); g.stroke();
}
function c11NhaFloor(g, sx, sy, T) {
  const W = C11_NHA[0].length, H = C11_NHA.length;
  g.fillStyle = '#2b2018'; g.fillRect(-4000, -4000, 9000, 9000);
  const x0 = sx(1), y0 = sy(1), x1 = sx(W - 1), y1 = sy(9);
  // floor: planks of jackfruit wood running across, a little lighter towards the door
  const lv = c11NhaLv(), FL = [['#8a6a48', '#a0805a'], ['#9a6a3e', '#b8844e'], ['#b0583a', '#c86a46']][lv];
  const fg = g.createLinearGradient(0, y0, 0, y1); fg.addColorStop(0, FL[0]); fg.addColorStop(1, FL[1]); g.fillStyle = fg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (lv === 0) { g.fillStyle = 'rgba(60,40,24,.18)'; for (let i = 0; i < 220; i++) { const X = x0 + ((i * 131) % 997) / 997 * (x1 - x0), Y = y0 + ((i * 71) % 991) / 991 * (y1 - y0); g.beginPath(); g.arc(X, Y, 1.5 + (i % 3), 0, 6.283); g.fill(); } }   // beaten earth
  if (lv === 1) { g.strokeStyle = 'rgba(70,40,20,.35)'; g.lineWidth = 1.2; for (let y = 1; y < 9; y += .5) { const Y = sy(y); g.beginPath(); g.moveTo(x0, Y); g.lineTo(x1, Y); g.stroke(); for (let x = 1 + ((y * 2) % 2) * .9; x < W - 1; x += 1.8) { const X = sx(x); g.beginPath(); g.moveTo(X, Y); g.lineTo(X, Y + T * .5); g.stroke(); } } }   // planks
  if (lv === 2) { g.strokeStyle = 'rgba(250,220,190,.55)'; g.lineWidth = 2; for (let y = 1; y <= 9; y += .5) { const Y = sy(y); g.beginPath(); g.moveTo(x0, Y); g.lineTo(x1, Y); g.stroke(); } for (let x = 1; x <= W - 1; x += .5) { const X = sx(x); g.beginPath(); g.moveTo(X, y0); g.lineTo(X, y1); g.stroke(); } }   // square terracotta tiles (gạch bát)
  // a woven mat (chiếu) in the middle bay
  const mx = sx(6.3), my = sy(5.6), mw = sx(10.7) - mx, mh = T * 2.2;
  g.fillStyle = '#d9b46a'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.beginPath(); g.roundRect(mx, my, mw, mh, 6); g.fill(); g.stroke();
  g.strokeStyle = '#a3332a'; g.lineWidth = 3; g.strokeRect(mx + 8, my + 8, mw - 16, mh - 16); g.strokeStyle = 'rgba(120,80,30,.35)'; g.lineWidth = 1;
  for (let i = 1; i < 14; i++) { const X = mx + mw * i / 14; g.beginPath(); g.moveTo(X, my + 12); g.lineTo(X, my + mh - 12); g.stroke(); }
  // the kitchen floor is beaten earth with ash near the hearth
  g.fillStyle = '#7a5a3c'; g.fillRect(sx(12), y0, sx(W - 1) - sx(12), y1 - y0);
  g.fillStyle = 'rgba(200,190,170,.25)'; g.beginPath(); g.ellipse(sx(14), sy(2.4), T * 1.3, T * .45, 0, 0, 6.283); g.fill();
  // light from the door
  const lg = g.createRadialGradient(sx(8.5), sy(9), 0, sx(8.5), sy(9), T * 4); lg.addColorStop(0, 'rgba(255,236,190,.35)'); lg.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = lg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  // the back wall: lime-washed mud between dark posts, a beam on top
  const wy0 = sy(-1.6), wy1 = sy(1);
  const WL = [['#b89a70', '#9a7c56'], ['#e6dcc4', '#cfc0a0'], ['#c87a56', '#a85e40']][c11NhaLv()]; const wg = g.createLinearGradient(0, wy0, 0, wy1); wg.addColorStop(0, WL[0]); wg.addColorStop(1, WL[1]); g.fillStyle = wg; g.fillRect(x0, wy0, x1 - x0, wy1 - wy0);
  if (c11NhaLv() === 2) { g.strokeStyle = 'rgba(250,230,210,.5)'; g.lineWidth = 1.5; for (let r = 0; r * T * .22 < wy1 - wy0; r++) { const Y = wy0 + r * T * .22; g.beginPath(); g.moveTo(x0, Y); g.lineTo(x1, Y); g.stroke(); for (let X = x0 + (r % 2) * T * .25; X < x1; X += T * .5) { g.beginPath(); g.moveTo(X, Y); g.lineTo(X, Y + T * .22); g.stroke(); } } }   // brick courses
  g.fillStyle = 'rgba(120,96,64,.18)'; for (let i = 0; i < 60; i++) { const X = x0 + ((i * 97) % 1000) / 1000 * (x1 - x0), Y = wy0 + ((i * 53) % 100) / 100 * (wy1 - wy0); g.fillRect(X, Y, 3, 2); }
  g.fillStyle = '#4a2e1a'; g.fillRect(x0, wy0 - T * .18, x1 - x0, T * .2); g.fillRect(x0, wy1 - 4, x1 - x0, 6);
  for (const x of [1, 5, 6, 11, 12, W - 1]) { g.fillStyle = '#5a3820'; g.fillRect(sx(x) - T * .07, wy0 - T * .1, T * .14, wy1 - wy0 + T * .1); }
  // a little window in the kitchen and one in the bedroom: bamboo bars, daylight
  for (const wx of [3.2, 14.5]) { const X = sx(wx) - T * .4, Y = wy0 + T * .9, w = T * .8, h = T * .55; g.fillStyle = '#f2e6c0'; g.fillRect(X, Y, w, h); g.strokeStyle = '#4a2e1a'; g.lineWidth = 3; g.strokeRect(X, Y, w, h); g.lineWidth = 2.4; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(X + w * i / 5, Y); g.lineTo(X + w * i / 5, Y + h); g.stroke(); } }
  // side walls
  g.fillStyle = '#6a4a2c'; g.fillRect(sx(1) - T * .25, wy0 - T * .18, T * .25, y1 - wy0 + T * .18); g.fillRect(x1, wy0 - T * .18, T * .25, y1 - wy0 + T * .18);
}
function c11NhaPartition(g, sx, sy, T, x) {                         // a wooden partition (vách ván) between two bays, seen end-on: posts and boards
  const X = sx(x + .5), y0 = sy(-1.6), y1 = sy(6), w = T * .3;
  const pg = g.createLinearGradient(X - w / 2, 0, X + w / 2, 0); pg.addColorStop(0, '#8a5a32'); pg.addColorStop(1, '#4a2e1a');
  g.fillStyle = pg; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.beginPath(); g.rect(X - w / 2, y0, w, y1 - y0); g.fill(); g.stroke();
  g.fillStyle = '#a8784a'; g.fillRect(X - w / 2 + 2, y0, w * .3, y1 - y0);
  g.fillStyle = '#5a3820'; g.beginPath(); g.ellipse(X, y1, w * .75, T * .1, 0, 0, 6.283); g.fill(); g.stroke();   // the post's stone foot
}
function c11NhaFront(g, sx, sy, T) {                                // the front wall: a low sill of boards, open at the door
  const W = C11_NHA[0].length, y = sy(9), h = T * .35;
  for (const [a, b] of [[1, 8], [9, W - 1]]) { const X = sx(a), w = sx(b) - X; g.fillStyle = '#6a4a2c'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.fillRect(X, y, w, h); g.strokeRect(X, y, w, h); g.fillStyle = '#8a6440'; g.fillRect(X, y, w, h * .3); }
  g.fillStyle = '#c8a070'; g.fillRect(sx(8), y + h * .2, T, h * .6);   // the threshold
}
function c11NhaBed(g, sx, sy, T) {
  const x = sx(1.05), y = sy(.85), w = sx(2.95) - x, h = T * .95;
  c11NhaBox(g, x, y, w, h, '#b07a44', '#6a4224', '#7a4a28', 6);
  g.fillStyle = '#c9a050'; g.fillRect(x + 6, y + 4, w - 12, h * .3);          // the mat
  g.strokeStyle = '#a3332a'; g.lineWidth = 2; g.strokeRect(x + 10, y + 6, w - 20, h * .26);
  g.fillStyle = '#e8dcc0'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 1.6; g.beginPath(); g.roundRect(x + 10, y + 3, T * .45, h * .2, 6); g.fill(); g.stroke();   // the pillow
  g.fillStyle = '#5a7a9a'; g.beginPath(); g.roundRect(x + w * .45, y + 5, w * .48, h * .26, 5); g.fill(); g.stroke();   // the folded blanket
  if (c11NhaHas('man')) {                                                       // the mosquito net hanging over it
    g.fillStyle = 'rgba(245,242,232,.35)'; g.strokeStyle = 'rgba(240,236,224,.85)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x - 2, y + h * .4); g.lineTo(x + 4, sy(-.4)); g.lineTo(x + w - 4, sy(-.4)); g.lineTo(x + w + 2, y + h * .4); g.closePath(); g.fill(); g.stroke();
    for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(x + w * i / 8, sy(-.4)); g.lineTo(x + w * i / 8, y + h * .4); g.stroke(); }
  }
}
function c11NhaAltarDraw(g, sx, sy, T, t) {
  const x = sx(7.05), y = sy(.2), w = sx(9.95) - x, h = T * 1.6;
  c11NhaBox(g, x, y + h * .35, w, h * .65, '#b8402c', '#7a1c14', '#8a2418', 4);       // the low table
  c11NhaBox(g, x + w * .12, y, w * .76, h * .5, '#c8502e', '#7a1c14', '#9a2a1a', 4);   // the high altar on it
  g.strokeStyle = '#e0b040'; g.lineWidth = 2; g.strokeRect(x + w * .16, y + h * .25, w * .68, h * .2); g.strokeRect(x + 6, y + h * .62, w - 12, h * .3);
  const cx = x + w / 2, ty = y + h * .06;
  g.fillStyle = '#d8c070'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(cx, ty + 6, T * .17, T * .07, 0, 0, 6.283); g.fill(); g.stroke();   // the incense bowl
  g.fillStyle = '#c89a3a'; g.fillRect(cx - T * .17, ty + 6, T * .34, T * .1); g.strokeRect(cx - T * .17, ty + 6, T * .34, T * .1);
  for (const dx of [-.42, .42]) { const X = cx + dx * w * .7; g.fillStyle = '#c89a3a'; g.fillRect(X - 3, ty - T * .2, 6, T * .3); g.fillStyle = '#f2ecde'; g.fillRect(X - 3, ty - T * .32, 6, T * .12); g.fillStyle = '#f2b040'; g.beginPath(); g.ellipse(X, ty - T * .36, 3, 6, 0, 0, 6.283); g.fill(); }   // candles
  for (const [dx, col] of [[-.18, '#e0a020'], [-.1, '#c8402c'], [.12, '#6aa040'], [.2, '#e0a020']]) { g.fillStyle = col; g.beginPath(); g.arc(x + w * (.5 + dx), y + h * .58, T * .07, 0, 6.283); g.fill(); g.stroke(); }   // a plate of fruit
  if (SAVE11.nha && SAVE11.nha.huong === SAVE11.day) for (let i = -1; i <= 1; i++) {         // incense burning, smoke curling up
    const X = cx + i * 6; g.strokeStyle = '#a3332a'; g.lineWidth = 2; g.beginPath(); g.moveTo(X, ty + 4); g.lineTo(X + i * 2, ty - T * .3); g.stroke();
    g.fillStyle = '#f08030'; g.beginPath(); g.arc(X + i * 2, ty - T * .3, 2.2, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(235,232,222,.6)'; g.lineWidth = 1.6; g.beginPath(); for (let k = 0; k < 12; k++) { const yy = ty - T * .3 - k * T * .07, xx = X + i * 2 + Math.sin(t * 1.6 + k * .7 + i) * k * 1.3; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
  }
}
function c11NhaHearth(g, sx, sy, T, t) {
  const cx = sx(14), cy = sy(1.75);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, cy, T * .9, T * .3, 0, 0, 6.283); g.fill();
  const glow = .6 + .4 * Math.sin(t * 7) * Math.sin(t * 3.1); const fg = g.createRadialGradient(cx, cy - T * .2, 0, cx, cy - T * .2, T * .6); fg.addColorStop(0, `rgba(255,170,60,${.7 * glow})`); fg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = fg; g.beginPath(); g.arc(cx, cy - T * .2, T * .6, 0, 6.283); g.fill();
  g.strokeStyle = C11_NHA_INK; g.lineWidth = 2;
  for (const [dx, dy] of [[-.32, 0], [.32, 0], [0, -.18]]) { g.fillStyle = '#8a7a6a'; g.beginPath(); g.ellipse(cx + dx * T, cy + dy * T - T * .12, T * .14, T * .2, 0, 0, 6.283); g.fill(); g.stroke(); }   // the three stones (kiềng)
  for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#f2c640' : '#e8642a'; g.beginPath(); const X = cx + (i - 1) * T * .12, h = T * (.22 + .08 * Math.sin(t * 9 + i * 2)); g.moveTo(X - T * .07, cy - T * .1); g.quadraticCurveTo(X, cy - T * .1 - h * 1.4, X + T * .07, cy - T * .1); g.fill(); }
  const pg = g.createLinearGradient(cx - T * .4, 0, cx + T * .4, 0); pg.addColorStop(0, '#6a4a30'); pg.addColorStop(1, '#2a1a10');
  g.fillStyle = pg; g.beginPath(); g.ellipse(cx, cy - T * .55, T * .4, T * .3, 0, 0, 6.283); g.fill(); g.stroke();   // the clay pot
  g.fillStyle = '#4a3020'; g.beginPath(); g.ellipse(cx, cy - T * .8, T * .3, T * .08, 0, 0, 6.283); g.fill(); g.stroke();
  if ((C11.nhaSmoke || 0) > 0 || Math.sin(t * .5) > 0) for (let i = 0; i < 2; i++) { const a = (t * .7 + i * .5) % 1; g.strokeStyle = `rgba(245,240,230,${.6 * (1 - a)})`; g.lineWidth = 2.4; g.beginPath(); for (let k = 0; k <= 6; k++) { const yy = cy - T * .85 - a * T * .7 - k * T * .05, xx = cx + (i ? 1 : -1) * T * .1 + Math.sin(t * 3 + k) * T * .05; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  for (let i = 0; i < 4; i++) { g.fillStyle = '#7a5030'; g.save(); g.translate(cx + T * .62, cy - T * .02 - i * T * .08); g.rotate(-.15 + i * .1); g.fillRect(-T * .3, -T * .035, T * .6, T * .07); g.strokeRect(-T * .3, -T * .035, T * .6, T * .07); g.restore(); }   // firewood
}
function c11NhaPiece(g, id, sx, sy, T, t) {                         // one bought piece of furniture
  const S = (x, y) => [sx(x), sy(y)];
  if (id === 'den') { const [X, Y] = S(3.5, 1.7); c11NhaBox(g, X - T * .3, Y - T * .5, T * .6, T * .5, '#8a5a32', '', '#5a3820', 3); g.fillStyle = '#c8b070'; g.beginPath(); g.ellipse(X, Y - T * .58, T * .12, T * .06, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(240,236,224,.8)'; g.beginPath(); g.ellipse(X, Y - T * .78, T * .08, T * .16, 0, 0, 6.283); g.fill(); g.stroke(); const lg = g.createRadialGradient(X, Y - T * .78, 0, X, Y - T * .78, T * 1.2); lg.addColorStop(0, `rgba(255,210,120,${.35 + .05 * Math.sin(t * 6)})`); lg.addColorStop(1, 'rgba(255,210,120,0)'); g.fillStyle = lg; g.beginPath(); g.arc(X, Y - T * .78, T * 1.2, 0, 6.283); g.fill(); g.fillStyle = '#f2b040'; g.beginPath(); g.ellipse(X, Y - T * .8, 2.5, 5, 0, 0, 6.283); g.fill(); }
  if (id === 'ruong') { const [X, Y] = S(4.5, 1.8); c11NhaBox(g, X - T * .42, Y - T * .7, T * .84, T * .7, '#a06a3a', '', '#6a4224', 4); g.fillStyle = '#c8a040'; g.fillRect(X - T * .06, Y - T * .45, T * .12, T * .14); g.strokeRect(X - T * .06, Y - T * .45, T * .12, T * .14); }
  if (id === 'man') {}                                               // drawn with the bed
  if (id === 'tranh') { const X = sx(3.2), Y = sy(-.45), w = T * 1.6, h = T * .9; g.fillStyle = '#4a2e1a'; g.fillRect(X - 4, Y - 4, w + 8, h + 8); g.fillStyle = '#f2e8cc'; g.fillRect(X, Y, w, h); for (let i = 0; i < 4; i++) { const mx = X + w * (.18 + i * .2), my = Y + h * .62; g.fillStyle = ['#a3332a', '#2f6a4c', '#f2c640', '#3a6ea8'][i]; g.beginPath(); g.ellipse(mx, my, T * .1, T * .07, 0, 0, 6.283); g.fill(); g.fillStyle = '#5a5a5a'; g.beginPath(); g.arc(mx + T * .09, my - T * .06, T * .05, 0, 6.283); g.fill(); } g.fillStyle = '#a3332a'; g.fillRect(X + w * .7, Y + h * .12, w * .2, h * .2); }
  if (id === 'chau') { const [X, Y] = S(6.5, 1.8); g.fillStyle = '#e8eef2'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.beginPath(); g.moveTo(X - T * .3, Y - T * .45); g.lineTo(X + T * .3, Y - T * .45); g.lineTo(X + T * .22, Y); g.lineTo(X - T * .22, Y); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3a6ea8'; g.lineWidth = 2; g.beginPath(); g.moveTo(X - T * .25, Y - T * .25); g.lineTo(X + T * .25, Y - T * .25); g.stroke(); g.strokeStyle = '#5a3820'; g.lineWidth = 5; g.beginPath(); g.moveTo(X, Y - T * .45); g.bezierCurveTo(X - T * .3, Y - T * .8, X + T * .3, Y - T * 1, X - T * .05, Y - T * 1.3); g.stroke(); for (const [dx, dy, r] of [[-.25, -.85, .2], [.2, -1.05, .22], [-.1, -1.35, .2]]) { g.fillStyle = '#3f7a3a'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(X + dx * T, Y + dy * T, r * T, r * T * .6, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#6aa050'; g.beginPath(); g.ellipse(X + dx * T - 4, Y + dy * T - 3, r * T * .55, r * T * .3, 0, 0, 6.283); g.fill(); } }
  if (id === 'tuche') { const [X, Y] = S(10.5, 1.85); c11NhaBox(g, X - T * .45, Y - T * 1.5, T * .9, T * 1.5, '#5a2e1c', '', '#4a2414', 3); g.strokeStyle = '#d8c8a0'; g.lineWidth = 1.5; g.strokeRect(X - T * .36, Y - T * .9, T * .72, T * .75); g.fillStyle = 'rgba(230,226,240,.7)'; for (const [dx, dy] of [[-.15, -.6], [.15, -.45], [0, -.3]]) { g.beginPath(); g.arc(X + dx * T, Y + dy * T, T * .05, 0, 6.283); g.fill(); } for (const dx of [-.2, 0, .2]) { g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(X + dx * T, Y - T * 1.12, T * .07, T * .05, 0, 0, 6.283); g.fill(); g.strokeStyle = '#3a6ea8'; g.stroke(); } }
  if (id === 'cau') for (const x of [6.5, 10.5]) { const X = sx(x) - T * .14, Y = sy(-.5); g.fillStyle = '#b8302a'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 1.6; g.fillRect(X, Y, T * .28, T * 1.3); g.strokeRect(X, Y, T * .28, T * 1.3); g.fillStyle = '#e8c040'; for (let i = 0; i < 4; i++) g.fillRect(X + T * .08, Y + T * (.12 + i * .3), T * .12, T * .12); }
  if (id === 'hoanh') { const X = sx(7.3), Y = sy(-.62), w = sx(9.7) - X, h = T * .38; g.fillStyle = '#7a1c14'; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.beginPath(); g.roundRect(X, Y, w, h, 5); g.fill(); g.stroke(); g.strokeStyle = '#e0b040'; g.strokeRect(X + 4, Y + 4, w - 8, h - 8); g.fillStyle = '#e8c040'; g.font = `900 ${Math.round(T * .22)}px "Noto Serif TC", "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('福 祿 壽', X + w / 2, Y + h / 2 + 1); }
  if (id === 'sap') { const X = sx(7.05), Y = sy(4.1), w = sx(9.95) - X, h = T * .8; c11NhaBox(g, X, Y, w, h, '#6a3420', '', '#4a2414', 5); g.strokeStyle = '#a06a40'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(X + 8, Y + h * .55); g.bezierCurveTo(X + w * .3, Y + h * .8, X + w * .7, Y + h * .8, X + w - 8, Y + h * .55); g.stroke(); for (const dx of [.06, .94]) { g.fillStyle = '#3a1a0e'; g.fillRect(X + w * dx - 5, Y + h * .9, 10, T * .14); }
    if (c11NhaHas('amchen')) { const cx = X + w / 2, cy = Y + h * .16; g.fillStyle = '#5a3820'; g.beginPath(); g.ellipse(cx, cy, T * .45, T * .12, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#e8eef2'; g.beginPath(); g.ellipse(cx, cy - T * .12, T * .14, T * .12, 0, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = '#3a6ea8'; g.beginPath(); g.moveTo(cx - T * .12, cy - T * .12); g.lineTo(cx + T * .12, cy - T * .12); g.stroke(); for (const dx of [-.3, -.18, .18, .3]) { g.fillStyle = '#f2ecde'; g.strokeStyle = C11_NHA_INK; g.beginPath(); g.ellipse(cx + dx * T, cy - T * .02, T * .05, T * .04, 0, 0, 6.283); g.fill(); g.stroke(); } } }
  if (id === 'chum') { const [X, Y] = S(12.5, 1.85); const jg = g.createLinearGradient(X - T * .4, 0, X + T * .4, 0); jg.addColorStop(0, '#9a6a40'); jg.addColorStop(1, '#4a2e1a'); g.fillStyle = jg; g.strokeStyle = C11_NHA_INK; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y - T * .45, T * .4, T * .45, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#3a5a6a'; g.beginPath(); g.ellipse(X, Y - T * .86, T * .24, T * .08, 0, 0, 6.283); g.fill(); g.stroke(); }
  if (id === 'chan') { const [X, Y] = S(15.5, 1.85); c11NhaBox(g, X - T * .42, Y - T * 1.3, T * .84, T * 1.3, '#c8a060', '', '#9a7a44', 2); g.strokeStyle = '#6a4a28'; g.lineWidth = 1.4; for (let i = 1; i < 3; i++) { const yy = Y - T * 1.3 + T * 1.3 * i / 3 + T * .2; g.beginPath(); g.moveTo(X - T * .38, yy); g.lineTo(X + T * .38, yy); g.stroke(); for (const dx of [-.2, 0, .2]) { g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(X + dx * T, yy - T * .06, T * .08, T * .05, 0, 0, 6.283); g.fill(); g.strokeStyle = '#3a6ea8'; g.stroke(); g.strokeStyle = '#6a4a28'; } } }
}
function c11NhaMark(g, sx, sy, T, t) {                               // a faint dashed outline where a piece could go (only near the mouse, so the room is not busy)
  for (const r of C11_NHA_DECOR) {
    if (c11NhaHas(r[0]) || (r[7] && !c11NhaHas(r[7]))) continue;
    const cells = r[4].length ? r[4] : r[5]; if (!cells.length) continue;
    const mx = cells.reduce((a, c) => a + c[0], 0) / cells.length + .5, my = cells.reduce((a, c) => a + c[1], 0) / cells.length + .5;
    if (Math.hypot(mx - C11.px, my - C11.py) > 3.2) continue;
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]), X = sx(Math.min(...xs)) + 4, Y = sy(Math.min(...ys)) + (r[4].length ? 4 : -T * .5), w = sx(Math.max(...xs) + 1) - X - 4, h = (Math.max(...ys) - Math.min(...ys) + 1) * T - 8;
    g.save(); g.setLineDash([6, 6]); g.lineDashOffset = -t * 10; g.strokeStyle = 'rgba(250,236,190,.7)'; g.lineWidth = 2; g.beginPath(); g.roundRect(X, Y, w, h, 8); g.stroke(); g.restore();
    g.fillStyle = 'rgba(250,236,190,.85)'; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+ ' + r[1], X + w / 2, Y + h / 2);
  }
}

/* ---------- hooks ---------- */
const c11NhaBg0 = c11Bg;
c11Bg = function () {                                                // the house has no grass under it: a tiny blank background
  if (C11_AR.id !== 'nha') return c11NhaBg0();
  if (!c11Bg.blank) { c11Bg.blank = document.createElement('canvas'); c11Bg.blank.width = c11Bg.blank.height = 2; }
  return c11Bg.blank;
};
const c11NhaDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {
  c11NhaDraw0(E, g, sx, sy, k, T);
  if (C11.area !== 'nha') return;
  const t = C11.t;
  E.push({ y: -999, d: () => { c11NhaFloor(g, sx, sy, T); for (const id of ['tranh', 'cau', 'hoanh']) if (c11NhaHas(id)) c11NhaPiece(g, id, sx, sy, T, t); c11NhaMark(g, sx, sy, T, t); } });
  E.push({ y: 1.9, d: () => c11NhaBed(g, sx, sy, T) });
  E.push({ y: 1.9, d: () => c11NhaAltarDraw(g, sx, sy, T, t) });
  E.push({ y: 1.9, d: () => c11NhaHearth(g, sx, sy, T, t) });
  for (const x of [5, 11]) E.push({ y: 6, d: () => c11NhaPartition(g, sx, sy, T, x) });
  for (const r of C11_NHA_DECOR) if (c11NhaHas(r[0]) && r[4].length) { const y = Math.max(...r[4].map(c => c[1])) + .9; E.push({ y, d: () => c11NhaPiece(g, r[0], sx, sy, T, t) }); }
  E.push({ y: 9.9, d: () => c11NhaFront(g, sx, sy, T) });
};
const c11NhaUpd0 = c11NewUpdate;
c11NewUpdate = function (dt) { if (C11.nhaSmoke > 0) C11.nhaSmoke -= dt; return c11NhaUpd0(dt); };
const c11NhaAct0 = c11ActNew, c11NhaCan0 = c11CanNew;
c11ActNew = function (tx, ty, tool, k, key) {
  if (C11.area === 'ruong' && k === 'D') {                           // the door of the house: go in
    if (typeof C11O !== 'undefined' && C11O.visit) { c11Msg('Nhà bạn: chỉ đứng ngoài sân thôi', '#5b2f1f'); return true; }
    c11NhaTiles(); c11GoArea('nha', 8.5, 8.6); return true;
  }
  if (C11.area === 'ruong' && k === 'h' && !(typeof C11O !== 'undefined' && C11O.visit)) { c11NhaUpgrade(); return true; }
  if (C11.area === 'nha') {
    if (k === 'v') { c11NhaAltar(); return true; }
    if (k === 'k') { c11NhaCook(); return true; }
    const D = c11NhaAt(tx, ty);
    if (D) { if (D.id === 'sap' && c11NhaHas('sap')) c11NhaTea(); else if (c11NhaHas(D.id)) c11Msg(`${D.name}: ${D.desc}`, '#5b2f1f'); else c11NhaBuy(D); return true; }
  }
  return c11NhaAct0(tx, ty, tool, k, key);
};
c11CanNew = function (tx, ty, tool, k, key) {
  if (C11.area === 'ruong' && k === 'h' && !(typeof C11O !== 'undefined' && C11O.visit)) return true;
  if (C11.area === 'nha' && ('vk'.includes(k) || c11NhaAt(tx, ty))) return true;
  return c11NhaCan0(tx, ty, tool, k, key);
};
const c11NhaTap0 = c11Tap;
c11Tap = function (tx, ty, wx, wy) {                               // the back wall: what hangs on it is bought from anywhere in the room; elsewhere a tap on the wall means the thing in front of it
  if (C11.area === 'nha' && !C11.sleep && !C11.eat && ty === 0) {
    const D = c11NhaAt(tx, 0); if (D) { if (c11NhaHas(D.id)) c11Msg(`${D.name}: ${D.desc}`, '#5b2f1f'); else c11NhaBuy(D); return; }
    return c11NhaTap0(tx, 1, wx, wy);
  }
  return c11NhaTap0(tx, ty, wx, wy);
};
const c11NhaWx0 = c11WxDraw;
c11WxDraw = function (g, W, H) { if (!C11_AR.indoor) return c11NhaWx0(g, W, H); };   // no rain, wind or sky inside the house
c11NhaTiles();
c11NhaLook();
