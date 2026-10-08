/* Chương IV · growing the business (owner): every stall grows mẹt → sạp → quầy → a rented house on the market → a house
   of one's own; the market guild (phường) and wholesale orders for the villages around; happenings that last several
   days and come back to bite; and "Việc hôm nay", three small tasks a day with a streak. Hooks: c4OpenUp (upgrades),
   c4Morning (#c4biz: guild, orders, today's tasks), c4EndDay (rent, tasks), c4Event (C4_EXTRA_EV), the porter (orders). */

/* ---------- đợt 2: the other stalls' levels ---------- */
// multipliers on the ware's own numbers; up = cost in multiples of its plot rent; daily = rent each evening (×plot rent)
const C4_SHOP_LV = [
  { name: 'Mẹt hàng', cap: 1, serve: 1, want: 1, up: 0 },
  { name: 'Sạp tre', cap: 1.5, serve: .85, want: 1.2, up: 1 },
  { name: 'Quầy gỗ', cap: 2.2, serve: .72, want: 1.45, up: 2.5 },
  { name: 'Thuê nhà mặt chợ', cap: 3.2, serve: .6, want: 1.8, up: 3, daily: .1, house: 'rent' },
  { name: 'Nhà của mình', cap: 3.6, serve: .55, want: 2.1, up: 14, house: 'own' },
];
// the price of a house to buy (owner): 90 % of the purse you have now, but never below the market's floor for the day; the
// market lifts that floor a little every day, and the price can change later, so the sheet says to buy now
const c4HouseFloor = (base, day = SAVE4.day) => Math.round(base * (1 + .06 * (day - 1)));
const c4HousePrice = base => Math.max(c4HouseFloor(base), Math.round(SAVE4.money * .9));
const c4UpPrice = (nx, base) => nx.house === 'own' ? c4HousePrice(base) : base;
function c4HouseNote(base) {
  const p = c4HousePrice(base), f = c4HouseFloor(base), t = c4HouseFloor(base, SAVE4.day + 1);
  return `<p class="hint">Giá nhà hôm nay <b>${c4Money(p)}</b>: 90 % số tiền đang có, nhưng không dưới ${c4Money(f)}. Thị trường lên giá theo ngày, ngày mai giá sàn là ${c4Money(t)}, và giá có thể đổi về sau. Mua ngay kẻo lỡ.</p>`;
}
const c4SLvI = g => (SAVE4.shops[g] && SAVE4.shops[g].lv) || 0;
const c4SLv = g => C4_SHOP_LV[c4SLvI(g)];
// the betel stall goes on past its tiled stall too (C4_LV in cho.js gets the two house levels)
C4_LV.push({ name: 'Thuê nhà mặt chợ', cap: 420, cost: 2, serve: .85, flow: 2.3, buy: .74, wait: 7, up: 700, daily: 30, house: 'rent' },
  { name: 'Nhà trầu của mình', cap: 520, cost: 2, serve: .8, flow: 2.6, buy: .78, wait: 6, up: 4200, house: 'own' });
// the upgrade block on a stall's sheet (other wares; the betel one keeps its own, extended)
function c4ShopUpBlock(g) {
  const G = C4_GOODS[g], i = c4SLvI(g), nx = C4_SHOP_LV[i + 1], cur = C4_SHOP_LV[i];
  const now = `<p class="nx">Đang là <b>${cur.name}</b>: chứa ${Math.round(G.cap * cur.cap)} ${G.unit}${cur.daily ? ` · tiền nhà ${Math.round(G.rent * cur.daily)} đồng/ngày` : ''}</p>`;
  if (!nx) { $('#c4upB').innerHTML = `<h4>Cơ ngơi</h4>${now}<p>Nhà của mình, không phải trả tiền thuê. Khách quen tìm đến tận nơi.</p>` + c4TablesBlock(g); c4TablesWire(g); return; }
  if (!c4UpAllowed(nx)) { $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${now}<p class="hint">Mua nhà sẽ có sau.</p>` + c4TablesBlock(g); c4TablesWire(g); $('#c4upGo').hidden = true; return; }
  const L = c4Landlord(g), base = Math.round(G.rent * nx.up * (nx.house ? L.k : 1)), cost = c4UpPrice(nx, base);
  if (nx.house && !L.known) { $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${now}<p class="bad">Muốn ${nx.house === 'own' ? 'mua' : 'thuê'} nhà mặt chợ: không biết chủ căn nhà là ai mà hỏi. Quen thêm người trong làng thì sẽ biết; càng thân giá càng rẻ.</p>` + c4TablesBlock(g); c4TablesWire(g); return; }
  $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${now}<p class="nx">Lên <b>${nx.name}</b>: chứa ${Math.round(G.cap * nx.cap)} ${G.unit} · bán nhanh hơn · khách ghé đông hơn${nx.daily ? ` · <b>tiền nhà ${Math.round(G.rent * nx.daily)} đồng mỗi tối</b> (hai tối không trả là bị đuổi về quầy)` : ''}${nx.house === 'own' ? ' · <b>mua đứt, khỏi trả tiền nhà</b>' : ''}</p>`;
  $('#c4upB').insertAdjacentHTML('beforeend', c4TablesBlock(g)); c4TablesWire(g);
  const b = $('#c4upGo'); b.hidden = false; b.disabled = SAVE4.money < cost; b.innerHTML = `${nx.house === 'own' ? 'Mua nhà' : nx.house ? 'Thuê nhà' : 'Nâng cấp'} · ${c4Money(cost)}`;
  if (nx.house === 'own') $('#c4upB').insertAdjacentHTML('beforeend', c4HouseNote(base));
  b.onclick = () => { if (SAVE4.money < cost) return; SAVE4.money -= cost; C4.today.spent += cost; SAVE4.shops[g].lv = i + 1; SAVE4.shops[g].late = 0; if (nx.house) SAVE4.shops[g].rentK = L.k; AU.stamp(); AU.pluck(88); persist4(); c4Hud(); c4Sheets(null);
    toast(nx.house === 'own' ? `Đã mua đứt căn nhà bán ${G.name.toLowerCase()}! Từ nay là cơ ngơi của mình.` : `Hàng ${G.name.toLowerCase()} lên ${nx.name.toLowerCase()}.`, 3.4); };
}
// in the evening: rent for the houses rented; two evenings unpaid and the owner takes the house back
function c4PayRents(d, lines) {
  const pay = (name, amt, late, set) => {
    if (SAVE4.money >= amt) { SAVE4.money -= amt; d.spent += amt; set(0); return; }
    if (late + 1 >= 2) { set('out'); lines.push(`Hai tối không trả nổi tiền nhà, chủ nhà lấy lại căn nhà bán ${name}.`); } else { set(late + 1); lines.push(`Chưa trả được tiền nhà bán ${name}: mai mà không trả là bị đuổi!`); }
  };
  if (c4Lv().daily) pay('trầu', Math.round(c4Lv().daily * (SAVE4.rentKTrau || 1)), SAVE4.lateTrau || 0, v => { if (v === 'out') { SAVE4.lv = 2; SAVE4.lateTrau = 0; } else SAVE4.lateTrau = v; });
  for (const g of C4_SHOPS) { const s = SAVE4.shops[g]; if (!s || !s.own || !c4SLv(g).daily) continue;
    pay(C4_GOODS[g].name.toLowerCase(), Math.round(C4_GOODS[g].rent * c4SLv(g).daily * (s.rentK || 1)), s.late || 0, v => { if (v === 'out') { s.lv = 2; s.late = 0; } else s.late = v; }); }
}
// the rented houses (owner): a landlord may ask for 10 % more on the rent now and then, at least a week after the last ask
const c4RentPlots = () => [...C4_SHOPS.filter(g => SAVE4.shops[g] && SAVE4.shops[g].own && c4SLv(g).daily), ...(c4Lv().daily ? ['trau'] : [])];
const c4RentOf = g => g === 'trau' ? Math.round(c4Lv().daily * (SAVE4.rentKTrau || 1)) : Math.round(C4_GOODS[g].rent * c4SLv(g).daily * (SAVE4.shops[g].rentK || 1));
const c4AskDay = g => g === 'trau' ? SAVE4.askTrau : SAVE4.shops[g].askDay;
const c4SetAsk = g => { if (g === 'trau') SAVE4.askTrau = SAVE4.day; else SAVE4.shops[g].askDay = SAVE4.day; };
const c4RaiseRent = g => { if (g === 'trau') SAVE4.rentKTrau = (SAVE4.rentKTrau || 1) * 1.1; else SAVE4.shops[g].rentK = (SAVE4.shops[g].rentK || 1) * 1.1; };
// drawn behind a stall: an awning for a sạp, a counter for a quầy, a house for the house levels
const C4_SHOP_HOUSE = { trau: 3, che: 1, xoi: 5, xen: 4, bun: 2 };   // each stall's house its own kind
function c4DrawShopLv(g, x, y, s, lv, ware = 'che') {
  if (!lv) return;
  g.save(); g.translate(x, y); g.scale(s, s);
  if (lv >= 3) {
    dp(g, c4HouseArt(C4_SHOP_HOUSE[ware]), 0, -18, 0, .62, .62);
    g.font = '900 13px "Playfair Display", serif'; g.textAlign = 'center'; g.fillStyle = lv >= 4 ? '#a3332a' : '#5a4a32';
    g.fillText(lv >= 4 ? 'Nhà mình' : 'Nhà thuê', 0, -232);
  } else {
    const w = lv === 1 ? 120 : 150, top = lv === 1 ? -150 : -165;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2 + 6, top + 10); g.lineTo(-w / 2 + 6, -8); g.moveTo(w / 2 - 6, top + 10); g.lineTo(w / 2 - 6, -8); g.stroke();
    g.fillStyle = lv === 1 ? '#c98a1c' : '#a3332a'; g.beginPath(); g.moveTo(-w / 2 - 8, top + 22); g.lineTo(-w / 2 + 6, top); g.lineTo(w / 2 - 6, top); g.lineTo(w / 2 + 8, top + 22); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#f2ecde'; g.lineWidth = 2; g.beginPath(); for (let k = -w / 2 + 14; k < w / 2 - 6; k += 14) { g.moveTo(k, top + 2); g.lineTo(k - 3, top + 20); } g.stroke();
    if (lv === 2) { g.fillStyle = '#8a5a2a'; g.strokeStyle = INK; g.lineWidth = 2.5; g.fillRect(-w / 2 + 4, -44, w - 8, 14); g.strokeRect(-w / 2 + 4, -44, w - 8, 14); }
  }
  g.restore();
}

/* ---------- đợt 3: the market guild and wholesale for the villages around ---------- */
const C4_GUILD = { day: 6, known: 8, fee: 200, dues: 20, off: .85 };          // from day 6, knowing 8 folk; 15% off the goods
const C4_VILLAGES = ['làng Đông Hồ', 'làng Bát Tràng', 'làng Vạn Phúc', 'làng Thổ Hà', 'làng Phù Lưu', 'làng Đình Bảng', 'chợ huyện', 'làng chài ven sông'];
const c4Guild = () => !!SAVE4.guild;
// when an order is to go out, as the guild says it: only roughly; the husband leaves at some moment in it and is gone a good while
const C4_SLOTS = [{ w: 'sáng sớm', a: 300, b: 420 }, { w: 'gần trưa', a: 570, b: 690 }, { w: 'buổi chiều', a: 780, b: 900 }, { w: 'chiều muộn', a: 900, b: 1020 }];
const c4Slot = o => C4_SLOTS[o.slot || 0];
// today's offers (rolled once a morning) and the orders taken: { id, vil, g, n, unit, pay, day, dep }
function c4RollOffers() {
  if (!c4Guild() || SAVE4.offerDay === SAVE4.day) return;
  SAVE4.offerDay = SAVE4.day; SAVE4.offers = [];
  const own = c4Owned(), k = 1 + (R() < .5 ? 1 : 0);
  for (let i = 0; i < k; i++) {
    const g = c4Pick(own), G = C4_GOODS[g], n = Math.round((g === 'trau' ? 30 : 12) * (1 + R() * 2)), unit = Math.round(c4Cost(g) * (1.7 + R() * .5) * 10) / 10;
    SAVE4.offers.push({ id: SAVE4.day * 10 + i, vil: c4Pick(C4_VILLAGES), g, n, unit, pay: Math.round(n * unit), day: SAVE4.day + 1 + ((R() * 2) | 0), dep: Math.round(n * unit * .2), slot: (R() * C4_SLOTS.length) | 0 });
  }
}
function c4BizHtml() {
  const day = SAVE4.day; let h = '';
  // the guild
  if (!c4Guild()) {
    const known = c4People().list.filter(p => c4Known(p.id)).length, can = day >= C4_GUILD.day && known >= C4_GUILD.known;
    h += `<div class="biz"><h4>Phường buôn chợ làng</h4><p>Vào phường thì được lấy hàng giá sỉ (rẻ hơn 15%) và nhận <b>đơn hàng sỉ cho các làng bên</b>. Phí vào phường ${c4Money(C4_GUILD.fee)}, mỗi năm ngày góp ${C4_GUILD.dues} đồng.</p>`
      + (can ? `<button class="btn alt" data-guild ${SAVE4.money < C4_GUILD.fee ? 'disabled' : ''}>Xin vào phường · ${c4Money(C4_GUILD.fee)}</button>` : `<p class="hint">Phường chỉ nhận người buôn có tiếng: từ ngày ${C4_GUILD.day}, quen ít nhất ${C4_GUILD.known} khách (đang quen ${known}).</p>`) + '</div>';
  } else {
    c4RollOffers();
    const mine = (SAVE4.ws || []), offers = (SAVE4.offers || []).filter(o => !mine.some(m => m.id === o.id));
    h += `<div class="biz"><h4>Đơn hàng sỉ · phường buôn</h4>`
      + (mine.length ? mine.map(o => `<p class="${o.day === day ? 'due' : ''}">• ${o.day === day ? `<b>Hôm nay giao, ${c4Slot(o).w}</b>` : `Ngày ${o.day} giao, ${c4Slot(o).w}`}: ${o.n} ${C4_GOODS[o.g].unit} ${C4_GOODS[o.g].name.toLowerCase()} cho ${o.vil}, được ${c4Money(o.pay)} (tiền hàng ${c4Money(Math.round(o.n * c4Cost(o.g)))})</p>`).join('') : '')
      + (offers.length && mine.length < 2 ? offers.map(o => `<div class="offer"><p>${c4Cap1(o.vil)} đặt <b>${o.n} ${C4_GOODS[o.g].unit} ${C4_GOODS[o.g].name.toLowerCase()}</b>, giao ngày ${o.day}, ${c4Slot(o).w}, trả ${c4Money(o.pay)}. Nhận đơn phải đặt cọc ${o.dep} đồng; trễ hẹn mất cọc, mất tiếng.</p><button class="btn alt" data-take="${o.id}" ${SAVE4.money < o.dep ? 'disabled' : ''}>Nhận đơn · cọc ${o.dep} đồng</button></div>`).join('') : '')
      + (!mine.length && !offers.length ? '<p class="hint">Hôm nay chưa có làng nào đặt hàng.</p>' : '') + '</div>';
  }
  // today's tasks
  const T = c4Tasks();
  h += `<div class="biz"><h4>Việc hôm nay ${SAVE4.streak ? `· chuỗi ${SAVE4.streak} ngày` : ''}</h4>${T.map(t => `<p>${t.done ? '✓' : '○'} ${t.text} <span class="hint">+${t.prize} đồng</span></p>`).join('')}<p class="hint">Làm đủ ba việc trong ngày để nối chuỗi: 3 ngày được 30 đồng, 5 ngày được "lộc chợ" (khách đông hơn cả ngày), 7 ngày được 100 đồng.</p></div>`;
  return h;
}
function c4BizWire(box) {
  box.querySelectorAll('[data-guild]').forEach(b => b.addEventListener('click', () => {
    if (SAVE4.money < C4_GUILD.fee) return; SAVE4.money -= C4_GUILD.fee; SAVE4.guild = { day: SAVE4.day }; AU.stamp(); AU.kenCall();
    toast('Ông trùm phường gõ ba tiếng mõ: "Từ nay là người trong phường!"', 3.6); persist4(); c4BizRefresh(); c4AfterMoney();
  }));
  box.querySelectorAll('[data-take]').forEach(b => b.addEventListener('click', () => {
    const o = (SAVE4.offers || []).find(x => x.id === +b.dataset.take); if (!o || SAVE4.money < o.dep) return;
    SAVE4.money -= o.dep; (SAVE4.ws = SAVE4.ws || []).push(o); AU.pluck(84); toast(`Nhận đơn của ${o.vil}. Ngày ${o.day}, ${c4Slot(o).w}, chồng gánh hàng đi giao, đi mất một lúc lâu.`, 3.2); persist4(); c4BizRefresh(); c4AfterMoney();
  }));
}
function c4BizRefresh() { const box = $('#c4biz'); if (!box) return; box.innerHTML = c4BizHtml(); c4BizWire(box); }
// the market opens: an order due today goes out with the husband (goods bought now at the guild price), he is back at noon
function c4ShipOrders() {
  const due = (SAVE4.ws || []).filter(o => o.day === SAVE4.day).sort((a, b) => (a.slot || 0) - (b.slot || 0)), lines = [];
  C4.delivQ = [];
  for (const o of due) {
    const cost = Math.round(o.n * c4Cost(o.g));
    if (SAVE4.money < cost) { o.fail = true; lines.push(`Không đủ ${c4Money(cost)} lấy hàng giao cho ${o.vil} (trong túi có ${c4Money(SAVE4.money)}): mất cọc, ${o.vil} chê nhà mình thất hứa.`); SAVE4.wsBad = (SAVE4.wsBad || 0) + 1; continue; }
    const S = c4Slot(o), D = { o, go: S.a + R() * (S.b - S.a), out: false };   // goods bought at the open; he sets off at some moment in the slot
    SAVE4.money -= cost; C4.today.spent += cost;
    c4LogAdd({ src: 'si', g: o.g, q: o.n, cost, who: o.vil });
    if (C4.deliv) C4.delivQ.push(D); else C4.deliv = D;                     // (a player: two orders the same day, the second was dropped) — one after the other
  }
  SAVE4.ws = (SAVE4.ws || []).filter(o => o.day > SAVE4.day);
  if (lines.length) setTimeout(() => toast(lines.join(' '), 4.4), 600);
}
// the husband stays away while delivering; back at noon with the money (and a story)
function c4DelivUpdate() {
  const D = C4.deliv, P = C4.porter; if (!D) return;
  if (!D.out) {                                                             // his moment comes (if he is out fetching, as soon as he is back)
    if (C4.mins < D.go || !c4HusbFree()) return;
    D.out = true; D.until = C4.mins + 140 + R() * 40; Object.assign(P, { st: 'out', good: null, qty: 0, cost: 0, deliv: true, strollX: null });
    toast(`Chồng gánh hàng đi giao cho ${D.o.vil}.`, 2.8); return;
  }
  if (P.st === 'away') P.t = 1;                                             // keep him away a good while
  if (C4.mins >= D.until && P.st === 'away') c4DelivPay(D);
}
// the money for a delivery (also settled at closing if he was still on the road)
function c4DelivPay(D) {
  {
    C4.porter.t = 0; C4.deliv = null; const o = D.o; let pay = o.pay + o.dep, note;
    const r = R();
    if (r < .1) { pay = Math.round(pay * .5); note = `Đường về gặp kẻ cướp, chồng chạy thoát nhưng mất nửa tiền: chỉ còn ${c4Money(pay)}.`; }
    else if (r < .25) { pay += 30; note = `${c4Cap1(o.vil)} khen hàng tốt, thưởng thêm 30 đồng, hẹn lần sau đặt tiếp!`; SAVE4.wsGood = (SAVE4.wsGood || 0) + 1; }
    else note = `Chồng giao xong hàng cho ${o.vil}, mang về ${c4Money(pay)}.`;
    SAVE4.money += pay; C4.today.got += pay; C4.today.ws = (C4.today.ws || 0) + 1; persist4(); c4Hud();
    setTimeout(() => toast(note, 4), 1500);
    if (C4.delivQ && C4.delivQ.length) { const N = C4.delivQ.shift(); N.go = Math.max(N.go, C4.mins + 10); C4.deliv = N; }   // the next order of the day
  }
}

/* ---------- đợt 4: "Việc hôm nay" ---------- */
// owner: only things the player does by tapping, never the luck of the crowd (no "serve N customers"); some days none, some days three
const C4_TASKS = [
  { k: 'news', make: () => { const n = R() < .4 ? 2 : 1; return { n, text: n > 1 ? 'Hóng được hai tin đồn' : 'Hóng được một tin đồn', prize: n > 1 ? 12 : 8 }; }, done: (t, d) => (d.news || 0) >= t.n },
  { k: 'help', make: () => ({ n: 1, text: 'Giúp một người (cho bà cụ ăn xin, trông con hộ, cho vay, đi dập lửa…)', prize: 10 }), done: (t, d) => (d.help || 0) >= 1, from: () => (C4.events || []).some(e => ['xin', 'trong', 'vay', 'chiu', 'lua', 'omdau', 'caicau'].includes(e.kind)) },
  { k: 'visit', make: () => ({ n: 1, text: 'Tiếp chuyện một người ghé gánh (có dấu !)', prize: 6 }), done: (t, d) => (d.visit || 0) >= 1, from: () => (C4.events || []).some(e => C4_VISIT.has(e.kind)) },
  { k: 'met', make: () => ({ n: 1, text: 'Quen thêm một khách mới', prize: 10 }), done: (t, d) => (d.met || 0) >= 1, from: () => SAVE4.day >= C4_BOOK_DAY },
  { k: 'tea', make: () => ({ n: 2, text: 'Mời nước hai người quen', prize: 8 }), done: (t, d) => (d.tea || 0) >= 2, from: () => SAVE4.day >= C4_BOOK_DAY },
  { k: 'ws', make: () => ({ n: 1, text: 'Giao một đơn hàng sỉ', prize: 15 }), done: (t, d) => (d.ws || 0) >= 1, from: () => (SAVE4.ws || []).some(o => o.day === SAVE4.day) },
  { k: 'ruot', make: () => ({ n: 1, text: 'Mời một mối ruột ghé quán', prize: 10 }), done: (t, d) => (d.invRuot || 0) >= 1, from: () => c4People().list.some(p => c4Ruot(p.id)) },
];
function c4Tasks() {
  if (SAVE4.taskDay !== SAVE4.day) {
    SAVE4.taskDay = SAVE4.day;
    // one or two tasks a day (owner), coming in gradually: each kind opens on its own day (t.d), none repeats within three days,
    // and kinds not yet seen come up more often, so the days do not feel alike
    const seen = SAVE4.taskSeen || (SAVE4.taskSeen = {});
    if (SAVE4.taskHistDay === SAVE4.day && (SAVE4.taskHist || []).length) for (const k of SAVE4.taskHist.pop()) seen[k] = Math.max(0, (seen[k] || 1) - 1);
    const recent = new Set((SAVE4.taskHist || []).slice(-3).flat());
    let pool = C4_TASKS.filter(t => (t.d || 1) <= SAVE4.day && (!t.from || t.from()));
    const fresh = pool.filter(t => !recent.has(t.k)); if (fresh.length) pool = fresh;
    const pick = [], want = SAVE4.day < 5 ? 1 : c4Pick([1, 1, 2]);
    while (pick.length < want && pool.length) {
      const w = pool.map(t => (seen[t.k] ? 1 : 4)), tot = w.reduce((a, b) => a + b, 0); let r = R() * tot, i = 0; while (i < w.length - 1 && (r -= w[i]) > 0) i++;
      pick.push(pool.splice(i, 1)[0]);
    }
    SAVE4.taskHist = [...(SAVE4.taskHist || []), pick.map(t => t.k)].slice(-6); SAVE4.taskHistDay = SAVE4.day; for (const t of pick) seen[t.k] = (seen[t.k] || 0) + 1;
    SAVE4.tasks = pick.map(t => ({ k: t.k, ...t.make(), done: false, paid: false }));
  }
  const d = C4.today || {};
  for (const t of SAVE4.tasks) { const T = C4_TASKS.find(x => x.k === t.k); if (!T) continue; if (!t.done && !T.end && C4.phase === 'open' && T.done(t, d)) { t.done = true; toast(`Xong việc: ${t.text}!`, 2.4); AU.pluck(90); } }
  return SAVE4.tasks;
}
function c4TasksHud() { const T = c4Tasks(), n = T.filter(t => t.done).length; return T.length ? `<i class="ic4 task"></i> ${n}/${T.length}` : ''; }
// the evening: the tasks that are judged at closing, the prizes, the streak
function c4TasksEnd(d, lines) {
  const T = c4Tasks(); let got = 0;
  if (!T.length) return;                                                   // a day without tasks: the streak just waits
  for (const t of T) { const X = C4_TASKS.find(x => x.k === t.k); if (!X) continue; if (!t.done && X.done(t, d)) t.done = true; if (t.done && !t.paid) { t.paid = true; got += t.prize; } }
  if (got) { SAVE4.money += got; d.got += got; }
  const all = T.every(t => t.done);
  SAVE4.taskLog = [...(SAVE4.taskLog || []), { day: SAVE4.day, n: T.length, ok: T.filter(t => t.done).length, got }].slice(-12);   // the book's Việc tab shows the last days
  SAVE4.streak = all ? (SAVE4.streak || 0) + 1 : 0;
  let bonus = '';
  if (all && SAVE4.streak === 3) { SAVE4.money += 30; d.got += 30; bonus = ' Chuỗi 3 ngày: thưởng 30 đồng!'; }
  if (all && SAVE4.streak === 5) { SAVE4.loc = SAVE4.day + 1; bonus = ' Chuỗi 5 ngày: mai được "lộc chợ", khách đông hơn cả ngày!'; }
  if (all && SAVE4.streak % 7 === 0 && SAVE4.streak) { SAVE4.money += 100; d.got += 100; bonus = ` Chuỗi ${SAVE4.streak} ngày: thưởng 100 đồng!`; }
  lines.push(`Việc hôm nay: xong ${T.filter(t => t.done).length}/${T.length}${got ? `, được ${got} đồng` : ''}.${all ? ` Chuỗi ${SAVE4.streak} ngày.` : ' Chuỗi đứt.'}${bonus}`);
}

/* ---------- đợt 4: happenings that last and come back ---------- */
// each returns false when it does not fit today; E gets title, text, opts like the others in c4Event
const c4KnownList = (min = 0) => c4People().list.filter(p => c4Known(p.id) && SAVE4.folk[p.id].a >= min);
// the book's Đơn hàng tab (owner): today's orders — the morning order, fetches in the middle of the day, goods bought from a
// passer-by, the wholesale orders due — and the customers who have booked for later today
const C4_RICH = 6000;                                                       // 10 quan (600 đồng a quan): rich enough to be robbed and sued (owner)
function c4OrdersTab() {
  const L = SAVE4.log && SAVE4.log.day === SAVE4.day ? SAVE4.log.items : [];
  const row = i => `${C4_GOODS[i.g].name} · ${i.q} ${C4_GOODS[i.g].unit} · ${c4Money(i.cost)}${i.who ? ' · giao từ ' + i.who : ''}`;
  const sec = (title, items) => items.length ? `<h4>${title}</h4>` + items.map(i => `<p>• ${row(i)}</p>`).join('') : '';
  let h = sec('Đặt buổi sáng', L.filter(i => i.src === 'sang')) + sec('Lấy thêm giữa ngày', L.filter(i => i.src === 'giua'))
    + sec('Mua vặt', L.filter(i => i.src === 'vat')) + sec('Đơn sỉ từ làng', L.filter(i => i.src === 'si'));
  if (C4.wed) h += `<h4>Đám cưới</h4><p>• Nhà trai hẹn lấy ${C4.wed.n} miếng trầu lúc giờ Thân.</p>`;
  const spent = L.reduce((a, i) => a + i.cost, 0);
  if (!h) return '<p>Hôm nay chưa đặt đơn nào. Đặt hàng buổi sáng ở tờ Họp chợ trước khi mở cửa.</p>';
  return h + `<p class="cnt">Đã chi ${c4Money(spent)} tiền hàng hôm nay</p>`;
}
// the private house (owner): once a market house of the last kind is bought, at the day's end the tally offers to buy a
// private house (nhà riêng) as well. Its living room starts empty, with a button to shop; the things get dearer down the list
// the house features (buying a house, the private house, decorating it) are on hold: set to true to bring them back
const C4_HOUSE_ON = false;
const c4UpAllowed = nx => !(nx && nx.house === 'own' && !C4_HOUSE_ON);
const C4_HOME_BASE = 20000;
const C4_SHOP_ITEMS = [['banghe', 'Bàn ghế gỗ', 300], ['amchen', 'Bộ ấm chén', 500], ['tranhcuoi', 'Tranh cưới', 800], ['denlong', 'Đèn lồng', 1200],
  ['caudoi', 'Câu đối', 1500], ['giuongcuoi', 'Giường cưới', 2500], ['mamtrau', 'Mâm trầu đặc biệt', 3500], ['tuong', 'Tương', 4000],
  ['dongdo', 'Đồ đồng', 6000], ['dococ', 'Đồ cổ', 9000], ['vangbac', 'Vàng bạc', 15000], ['tolua', 'Tơ lụa', 25000], ['ngoc', 'Ngọc quý', 50000]];
const c4HasLastHouse = () => C4_HOUSE_ON && ((C4_LV[SAVE4.lv] && C4_LV[SAVE4.lv].house === 'own') || c4Owned().some(g => g !== 'trau' && c4SLv(g).house === 'own'));
const c4HasHome = () => !!(SAVE4.home && SAVE4.home.own);
const c4HomePrice = () => c4HousePrice(C4_HOME_BASE);
// at the tally: the offer, once the last house is there and no private house yet
function c4HomeOffer() {
  const box = $('#c4homeN'); if (!box) return; box.innerHTML = '';
  if (c4HasHome() || !c4HasLastHouse()) return;
  const p = c4HomePrice(), b = document.createElement('button'); b.className = 'btn go'; b.textContent = `Mua nhà riêng · ${c4Money(p)}`;
  b.disabled = SAVE4.money < p;
  b.addEventListener('click', () => { if (SAVE4.money < c4HomePrice()) return; const q = c4HomePrice(); SAVE4.money -= q; C4.today.spent += q; SAVE4.home = { own: true, items: [] }; AU.stamp(); AU.pluck(88); persist4(); c4Hud(); b.remove(); box.innerHTML = '<p class="hint">Đã mua nhà riêng. Vào phòng khách bằng nút Nhà riêng trên thanh trên.</p>'; toast('Đã có nhà riêng của mình!', 3.2); });
  box.innerHTML = c4HouseNote(C4_HOME_BASE); box.appendChild(b);
}
// the living room: the things and where they stand
const C4_ART_INK = '#1d1915';
const C4_ITEM_ART = {
  banghe: `<rect x="6" y="30" width="48" height="7" fill="#8a5a2b" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="12" y="37" width="5" height="18" fill="#5b2f1f"/><rect x="43" y="37" width="5" height="18" fill="#5b2f1f"/><rect x="3" y="50" width="12" height="5" fill="#8a5a2b" stroke="${C4_ART_INK}" stroke-width="1.5"/><rect x="45" y="50" width="12" height="5" fill="#8a5a2b" stroke="${C4_ART_INK}" stroke-width="1.5"/>`,
  amchen: `<rect x="6" y="40" width="48" height="6" fill="#b57a22" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M12 40 Q17 30 22 40 Z" fill="#f2ecde" stroke="${C4_ART_INK}" stroke-width="1.5"/><path d="M24 40 Q29 30 34 40 Z" fill="#f2ecde" stroke="${C4_ART_INK}" stroke-width="1.5"/><ellipse cx="46" cy="32" rx="8" ry="6" fill="#2f5f8f" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="42" y="25" width="8" height="2" fill="${C4_ART_INK}"/><path d="M53 31 Q58 26 58 20" stroke="${C4_ART_INK}" stroke-width="2" fill="none"/>`,
  tranhcuoi: `<rect x="12" y="4" width="36" height="52" fill="#f2ecde" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="8" y="2" width="44" height="5" fill="#a3332a"/><rect x="8" y="53" width="44" height="5" fill="#a3332a"/><text x="30" y="38" font-family="Ma Shan Zheng, KaiTi, serif" font-size="24" text-anchor="middle" fill="#a3332a">囍</text>`,
  denlong: `<line x1="30" y1="0" x2="30" y2="8" stroke="${C4_ART_INK}" stroke-width="1.5"/><path d="M14 10 Q30 6 46 10 Q52 30 46 46 Q30 52 14 46 Q8 30 14 10 Z" fill="#c8392d" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M22 12 Q18 30 22 46 M30 10 Q30 30 30 50 M38 12 Q42 30 38 46" stroke="${C4_ART_INK}" stroke-width="1" fill="none"/><rect x="22" y="50" width="16" height="4" fill="#f2c640" stroke="${C4_ART_INK}" stroke-width="1"/><line x1="30" y1="54" x2="30" y2="60" stroke="#f2c640" stroke-width="2"/>`,
  caudoi: `<rect x="8" y="4" width="18" height="52" fill="#a3332a" stroke="${C4_ART_INK}" stroke-width="1.5"/><rect x="34" y="4" width="18" height="52" fill="#a3332a" stroke="${C4_ART_INK}" stroke-width="1.5"/><line x1="17" y1="10" x2="17" y2="50" stroke="#f2c640" stroke-width="2"/><line x1="43" y1="10" x2="43" y2="50" stroke="#f2c640" stroke-width="2"/><circle cx="17" cy="16" r="2" fill="#f2ecde"/><circle cx="43" cy="16" r="2" fill="#f2ecde"/>`,
  giuongcuoi: `<rect x="4" y="18" width="52" height="22" fill="#5b2f1f" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="6" y="36" width="48" height="8" fill="#f2ecde" stroke="${C4_ART_INK}" stroke-width="1.5"/><rect x="8" y="44" width="5" height="12" fill="#5b2f1f"/><rect x="47" y="44" width="5" height="12" fill="#5b2f1f"/><path d="M4 18 Q30 2 56 18" fill="none" stroke="#a3332a" stroke-width="5"/><line x1="12" y1="12" x2="12" y2="18" stroke="#a3332a" stroke-width="2"/><line x1="48" y1="12" x2="48" y2="18" stroke="#a3332a" stroke-width="2"/>`,
  mamtrau: `<ellipse cx="30" cy="40" rx="26" ry="10" fill="#b57a22" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M14 38 Q20 26 26 36 Q20 42 14 38Z" fill="#2f6a4c" stroke="${C4_ART_INK}" stroke-width="1"/><path d="M30 36 Q36 24 42 34 Q36 40 30 36Z" fill="#2f6a4c" stroke="${C4_ART_INK}" stroke-width="1"/><circle cx="22" cy="44" r="3" fill="#8a5a2b" stroke="${C4_ART_INK}" stroke-width="1"/><circle cx="38" cy="45" r="3" fill="#8a5a2b" stroke="${C4_ART_INK}" stroke-width="1"/><rect x="44" y="30" width="8" height="8" fill="#a3332a" stroke="${C4_ART_INK}" stroke-width="1"/>`,
  tuong: `<rect x="18" y="6" width="24" height="6" fill="#5b2f1f" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="20" y="12" width="20" height="8" fill="#a0703a" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M18 20 Q10 36 16 56 L44 56 Q50 36 42 20 Z" fill="#a0703a" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="20" y="32" width="20" height="10" fill="#f2ecde" stroke="${C4_ART_INK}" stroke-width="1"/><path d="M24 36 H36" stroke="#a3332a" stroke-width="2"/>`,
  dongdo: `<ellipse cx="30" cy="30" rx="22" ry="7" fill="#c69a3a" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M8 30 L8 44 Q30 54 52 44 L52 30 Z" fill="#b8862b" stroke="${C4_ART_INK}" stroke-width="2"/><circle cx="8" cy="36" r="3" fill="none" stroke="${C4_ART_INK}" stroke-width="2"/><circle cx="52" cy="36" r="3" fill="none" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M16 40 Q30 46 44 40" stroke="${C4_ART_INK}" stroke-width="1" fill="none"/>`,
  dococ: `<path d="M22 10 L38 10 L38 16 Q48 22 46 36 Q44 54 30 56 Q16 54 14 36 Q12 22 22 16 Z" fill="#2f5f8f" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M14 30 Q30 36 46 30" stroke="#f2ecde" stroke-width="3" fill="none"/><path d="M20 44 l4 -4 l3 3 M36 40 l-3 4" stroke="#f2ecde" stroke-width="1.5" fill="none"/>`,
  vangbac: `<rect x="6" y="34" width="48" height="20" fill="#5b2f1f" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M6 34 Q30 18 54 34 Z" fill="#7a4a2a" stroke="${C4_ART_INK}" stroke-width="2"/><ellipse cx="18" cy="24" rx="6" ry="3" fill="#f2c640" stroke="${C4_ART_INK}" stroke-width="1.2"/><ellipse cx="30" cy="20" rx="6" ry="3" fill="#f2c640" stroke="${C4_ART_INK}" stroke-width="1.2"/><ellipse cx="42" cy="24" rx="5" ry="2.5" fill="#d8d8d8" stroke="${C4_ART_INK}" stroke-width="1.2"/><rect x="27" y="40" width="6" height="6" fill="#f2c640" stroke="${C4_ART_INK}" stroke-width="1"/>`,
  tolua: `<rect x="8" y="40" width="44" height="10" fill="#c0567a" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="10" y="28" width="40" height="10" fill="#3f8a86" stroke="${C4_ART_INK}" stroke-width="2"/><rect x="12" y="16" width="36" height="10" fill="#f2c640" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M44 50 Q54 54 50 60" stroke="#c0567a" stroke-width="4" fill="none"/>`,
  ngoc: `<rect x="10" y="48" width="40" height="8" fill="#a3332a" stroke="${C4_ART_INK}" stroke-width="1.5"/><polygon points="30,8 44,24 36,48 24,48 16,24" fill="#4f9a6a" stroke="${C4_ART_INK}" stroke-width="2"/><path d="M16 24 H44 M30 8 L24 48 M30 8 L36 48" stroke="#2f5a3e" stroke-width="1" fill="none"/><path d="M50 4 L50 12 M46 8 L54 8" stroke="#fff6d2" stroke-width="1.5"/>`,
};
// where each thing stands in the room (top-left corner, in the room's 360 × 260 picture)
const C4_ROOM_SLOT = { denlong: [206, 22], tranhcuoi: [300, 70], caudoi: [112, 92], dococ: [306, 134], tolua: [124, 150], giuongcuoi: [60, 176],
  banghe: [196, 196], amchen: [206, 196], mamtrau: [344, 220], tuong: [60, 236], dongdo: [384, 170], vangbac: [404, 236], ngoc: [222, 96] };
const c4ItemSvg = (id, px = 60) => `<svg viewBox="0 0 60 60" width="${px}" height="${px}" aria-hidden="true">${C4_ITEM_ART[id] || ''}</svg>`;
// the living room, in one-point perspective like an old house's hall: terracotta floor tiles running to the vanishing point,
// carved wooden pillars, an ancestor altar on the back wall, a lattice window with sunbeams, and the things bought in place
function c4RoomSvg(items) {
  const K = C4_ART_INK, VX = 240, VY = 128;
  const toVP = (bx) => VX + (bx - VX) * (200 - VY) / (300 - VY);          // a floor line from the bottom edge to the back wall
  const floorX = [-260, -120, 0, 120, 240, 360, 480, 600, 740];
  const tileLines = floorX.map(bx => `<line x1="${toVP(bx).toFixed(1)}" y1="200" x2="${bx}" y2="300" stroke="#6e3418" stroke-width="1" opacity=".55"/>`).join('');
  const rows = [212, 226, 243, 265, 292].map(y => `<line x1="0" y1="${y}" x2="480" y2="${y}" stroke="#6e3418" stroke-width="${(y - 200) / 60 + .6}" opacity=".5"/>`).join('');
  const defs = `<defs>
    <linearGradient id="rmBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead8a8"/><stop offset="1" stop-color="#c9ae72"/></linearGradient>
    <linearGradient id="rmLeftW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c08a"/><stop offset="1" stop-color="#b59561"/></linearGradient>
    <linearGradient id="rmRightW" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#d9c08a"/><stop offset="1" stop-color="#b59561"/></linearGradient>
    <linearGradient id="rmCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2416"/><stop offset="1" stop-color="#6b4226"/></linearGradient>
    <linearGradient id="rmTerra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b56a3e"/><stop offset="1" stop-color="#d6895a"/></linearGradient>
    <linearGradient id="rmWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5530"/><stop offset=".35" stop-color="#6b3d22"/><stop offset=".7" stop-color="#4a2814"/><stop offset="1" stop-color="#2e180b"/></linearGradient>
    <linearGradient id="rmShaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8" stop-opacity=".5"/><stop offset="1" stop-color="#fff1b8" stop-opacity="0"/></linearGradient>
    <radialGradient id="rmSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6cf" stop-opacity=".8"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>
    <linearGradient id="rmSilk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e2a22"/><stop offset=".5" stop-color="#c8392d"/><stop offset="1" stop-color="#8e2a22"/></linearGradient>
    <linearGradient id="rmGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d76b"/><stop offset="1" stop-color="#b9842f"/></linearGradient>
    <pattern id="rmLat" width="10" height="10" patternUnits="userSpaceOnUse"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="#3a2214" stroke-width="1"/><path d="M0 5 H10 M5 0 V10" stroke="#3a2214" stroke-width=".4" opacity=".6"/></pattern>
    <pattern id="rmBamb" width="22" height="12" patternUnits="userSpaceOnUse"><path d="M4 0 V12 M16 0 V12" stroke="#2f5a3e" stroke-width="2"/><path d="M4 4 H16 M16 8 H4" stroke="#2f5a3e" stroke-width="1"/></pattern>
  </defs>`;
  const ceiling = `<polygon points="0,0 480,0 360,60 120,60" fill="url(#rmCeil)"/>`
    + [60, 150, 240, 330, 420].map(x => `<line x1="${x}" y1="0" x2="${240 + (x - 240) * .3}" y2="60" stroke="#2a180b" stroke-width="2" opacity=".7"/>`).join('')
    + `<rect x="0" y="0" width="480" height="14" fill="#3e2514"/>`;
  const back = `<rect x="120" y="60" width="240" height="140" fill="url(#rmBack)"/>`
    + `<rect x="120" y="60" width="240" height="6" fill="#2e180b" opacity=".6"/>`;
  const leftW = `<polygon points="0,0 120,60 120,200 0,300" fill="url(#rmLeftW)"/>`;
  const rightW = `<polygon points="480,0 360,60 360,200 480,300" fill="url(#rmRightW)"/>`;
  const floor = `<polygon points="0,300 120,200 360,200 480,300" fill="url(#rmTerra)"/>` + rows + tileLines;
  const beam = `<polygon points="120,60 360,60 360,68 120,68" fill="#4a2814" stroke="#2a180b" stroke-width="1"/>`;
  const wallLines = `<line x1="120" y1="200" x2="0" y2="300" stroke="#6b4a2a" stroke-width="2"/><line x1="360" y1="200" x2="480" y2="300" stroke="#6b4a2a" stroke-width="2"/>`;
  // the carved pillars: the near ones at the sides, and the two at the back corners
  const pillar = (x0, x1, top, bot) => `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bot - top}" fill="url(#rmWood)" stroke="#2a180b" stroke-width="1.5"/>`
    + `<line x1="${x0 + (x1 - x0) * .35}" y1="${top}" x2="${x0 + (x1 - x0) * .35}" y2="${bot}" stroke="#2a180b" stroke-width=".8" opacity=".6"/>`;
  const pillars = pillar(14, 46, 0, 300) + pillar(118, 134, 60, 200) + pillar(346, 362, 60, 200) + pillar(434, 466, 0, 300);
  // the ancestor altar: a panel of red and gold, the scrolls, candles and the incense burner
  const altarPanel = `<rect x="204" y="68" width="72" height="66" fill="#7a1f1a" stroke="url(#rmGold)" stroke-width="2"/><text x="240" y="108" font-family="Ma Shan Zheng, KaiTi, serif" font-size="30" text-anchor="middle" fill="url(#rmGold)">囍</text>`;
  const scroll = (x) => `<rect x="${x}" y="78" width="36" height="72" fill="#efe2b8" stroke="#6b4a2a" stroke-width="1.5"/><rect x="${x + 6}" y="86" width="24" height="56" fill="none" stroke="#2f6a4c" stroke-width="1.2"/><path d="M${x + 10} 100 Q${x + 18} 92 ${x + 26} 102 M${x + 12} 120 Q${x + 20} 112 ${x + 28} 124" stroke="#2f6a4c" stroke-width="1.5" fill="none"/>`;
  const altar = `<rect x="186" y="150" width="108" height="50" fill="url(#rmWood)" stroke="#2a180b" stroke-width="2"/><rect x="186" y="150" width="108" height="6" fill="#8a5530" stroke="#2a180b" stroke-width="1"/>`
    + `<rect x="194" y="160" width="92" height="36" fill="none" stroke="#2a180b" stroke-width="1"/><path d="M240 160 V196 M220 160 V196 M260 160 V196" stroke="#2a180b" stroke-width="1"/>`
    + `<circle cx="206" cy="180" r="2" fill="url(#rmGold)"/><circle cx="274" cy="180" r="2" fill="url(#rmGold)"/>`
    + `<rect x="222" y="134" width="36" height="16" fill="#3a2214" stroke="url(#rmGold)" stroke-width="1"/>`
    + `<ellipse cx="240" cy="146" rx="18" ry="5" fill="#2a1a10" stroke="url(#rmGold)" stroke-width="1"/>`
    + [200, 280].map(x => `<rect x="${x - 3}" y="120" width="6" height="30" fill="url(#rmGold)" stroke="#6b4a2a" stroke-width=".8"/><ellipse cx="${x}" cy="118" rx="4" ry="6" fill="#f6dc86"/>`).join('')
    + `<path d="M236 134 V110 M244 134 V106" stroke="#c94b3a" stroke-width="2"/><circle cx="236" cy="108" r="2" fill="#f2c640"/>`;
  const panels = altarPanel + scroll(140) + scroll(304);
  // a window on the left wall (lattice), with the sun coming through
  const win = `<polygon points="40,94 80,98 80,156 40,168" fill="#fff4cc" stroke="#2a180b" stroke-width="2"/><polygon points="40,94 80,98 80,156 40,168" fill="url(#rmLat)" opacity=".9"/>`;
  const shaft = `<polygon points="40,168 80,156 230,300 60,300" fill="url(#rmShaft)"/><ellipse cx="60" cy="176" rx="40" ry="10" fill="url(#rmSun)"/>`;
  // a window and a bamboo blind on the right wall
  const blind = `<polygon points="402,96 470,116 470,206 402,186" fill="#c9a86a" stroke="#6b4a2a" stroke-width="1.5"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<line x1="402" y1="${96 + i * 11.5}" x2="470" y2="${116 + i * 11.5}" stroke="#8a6a3a" stroke-width="1" opacity=".7"/>`).join('');
  // the low table is the banghe item; floor decor: a jar, a basket of betel leaves, a bamboo plant
  const decor = `<ellipse cx="34" cy="262" rx="16" ry="6" fill="#000" opacity=".2"/><path d="M22 236 Q18 262 30 264 Q44 262 40 236 Z" fill="#8a4a2a" stroke="${K}" stroke-width="1.5"/><rect x="24" y="230" width="20" height="8" fill="#6b3418" stroke="${K}" stroke-width="1"/>`
    + `<ellipse cx="420" cy="278" rx="50" ry="12" fill="#6b4a2a" opacity=".7"/><path d="M372 270 Q420 300 468 270 L462 290 Q420 306 378 290 Z" fill="#b8925a" stroke="${K}" stroke-width="1.5"/>`
    + [0, 1, 2, 3, 4].map(i => `<ellipse cx="${386 + i * 16}" cy="${266 + (i % 2) * 6}" rx="16" ry="5" fill="#2f6a4c" stroke="${K}" stroke-width=".8" transform="rotate(${i * 18 - 30} ${386 + i * 16} ${266 + (i % 2) * 6})"/>`).join('');
  const frame = `<rect x="1" y="1" width="478" height="298" fill="none" stroke="${K}" stroke-width="2"/>`;
  const vignette = `<radialGradient id="rmVig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><rect width="480" height="300" fill="url(#rmVig)"/>`;
  const things = items.filter(id => C4_ROOM_SLOT[id]).map(id => { const [x, y] = C4_ROOM_SLOT[id];
    return `<ellipse cx="${x + 30}" cy="${y + 56}" rx="24" ry="4" fill="#000" opacity=".25"/><g transform="translate(${x} ${y})">${C4_ITEM_ART[id]}</g>`; }).join('');
  return `<svg viewBox="0 0 480 300" width="100%" style="max-width:480px;display:block;margin:4px auto" role="img" aria-label="Phòng khách nhà riêng">${defs}${ceiling}${back}${leftW}${rightW}${wallLines}${floor}${beam}${pillars}${panels}${altar}${win}${blind}${shaft}${decor}${things}${vignette}${frame}</svg>`;
}
// the living room sheet: the picture of the room, and what is in it
function c4HomeHtml() {
  const items = (SAVE4.home && SAVE4.home.items) || [];
  return `<h3>Phòng khách nhà riêng</h3>${c4RoomSvg(items)}${items.length ? '' : '<p>Chưa có gì. Bấm Sắm đồ để mua.</p>'}`;
}
// the shop list, dearer as you scroll down (owner): a picture and the price for each
function c4ShopHtml() {
  const items = (SAVE4.home && SAVE4.home.items) || [];
  return '<h3>Sắm đồ</h3><div style="max-height:52vh;overflow:auto;padding-right:4px">' + C4_SHOP_ITEMS.map(([id, name, price]) => {
    const has = items.includes(id);
    return `<div class="shopRow" style="display:flex;align-items:center;gap:10px;margin:6px 0"><span style="flex:none">${c4ItemSvg(id, 56)}</span><span style="flex:1;text-align:left">${name}<br><b>${c4Money(price)}</b></span><button class="btn${has ? ' alt' : ''}" data-buy="${id}" ${has || SAVE4.money < price ? 'disabled' : ''}>${has ? 'Đã có' : 'Mua'}</button></div>`;
  }).join('') + '</div>';
}
function c4BuyItem(id) {
  const it = C4_SHOP_ITEMS.find(x => x[0] === id); if (!it || !c4HasHome() || SAVE4.money < it[2]) return;
  if (SAVE4.home.items.includes(id)) return;
  SAVE4.money -= it[2]; C4.today.spent += it[2]; SAVE4.home.items.push(id); AU.pluck(84); persist4(); c4Hud();
  toast(`Đã mua ${it[1].toLowerCase()} về phòng khách.`, 2.6);
}
// the money a misfortune takes (owner): a share of the purse as it is now times the number of stalls, drawn between a low and a high share; at least 20 đồng for each stall, never more than the purse
// and it grows with the stalls the family has (owner: bribing soldiers with four stalls costs four times as much)
const c4Stalls = () => Math.max(1, c4Owned().length);
const c4LossRange = (lo, hi, min = 20) => { const m = Math.max(0, SAVE4.money), k = c4Stalls(); return [Math.min(m, Math.max(min * k, Math.round(m * lo * k))), Math.min(m, Math.max(min * k, Math.round(m * hi * k)))]; };
const c4Loss = (lo, hi, min = 20) => { const [a, b] = c4LossRange(lo, hi, min); return Math.min(SAVE4.money, a + Math.round(R() * (b - a))); };
const c4LossText = (lo, hi, min = 20) => { const [a, b] = c4LossRange(lo, hi, min); return a === b ? c4Money(a) : `từ ${c4Money(a)} đến ${c4Money(b)}`; };
const C4_EXTRA_EV = {
  // two households fall out; taking a side wins one and loses the other (and their kin); making peace costs a feast
  caicau(E) {
    const ks = c4KnownList(30); if (ks.length < 4) return false;
    const a = c4Pick(ks), b = c4Pick(ks.filter(q => q.house !== a.house)); if (!b) return false;
    const kin = (p, d) => { for (const l of p.links) if (c4People().list[l.to].house === p.house && c4Known(l.to)) c4Bump(l.to, d); };
    Object.assign(E, { title: 'Hai nhà cãi nhau', text: `${c4Cap1(a.name)} và ${b.name} cãi nhau to ngay trước quán, chuyện con gà sang vườn bên mổ thóc. Cả hai quay sang hỏi: "Cô bảo ai đúng?"`, opts: [
      [`Bênh ${a.name}`, () => { c4Bump(a.id, 15); c4Bump(b.id, -22); kin(b, -8); c4F(b.id).away = SAVE4.day + 2; toast(`${c4Cap1(a.name)} hả hê. ${c4Cap1(b.name)} giận, mấy hôm không thèm ra chợ.`, 3.6); }],
      [`Bênh ${b.name}`, () => { c4Bump(b.id, 15); c4Bump(a.id, -22); kin(a, -8); c4F(a.id).away = SAVE4.day + 2; toast(`${c4Cap1(b.name)} hả hê. ${c4Cap1(a.name)} giận, mấy hôm không thèm ra chợ.`, 3.6); }],
      ['Mời cả hai chén nước làm hoà · 20 đồng', () => { SAVE4.money -= 20; C4.today.spent += 20; if (R() < .65) { c4Bump(a.id, 10); c4Bump(b.id, 10); kin(a, 3); kin(b, 3); toast('Hai bên bắt tay làm lành. Ai cũng khen cô chủ quán khéo ăn khéo nói.', 3.6); } else { c4Bump(a.id, -5); c4Bump(b.id, -5); toast('Chén nước chưa uống xong lại cãi tiếp. Mất toi hai mươi đồng.', 3.4); } }, SAVE4.money >= 20],
      ['Lờ đi', () => { if (R() < .5) { c4Bump(a.id, -5); c4Bump(b.id, -5); toast('Hai người bảo cô chủ quán "ba phải".', 3); } }]] });
  },
  // a regular falls ill: visiting wins them and their family; ignoring them is remembered
  omdau(E) {
    const ks = c4KnownList(60).filter(p => !(SAVE4.folk[p.id].away >= SAVE4.day)); if (!ks.length) return false;
    const p = c4Pick(ks), f = c4F(p.id); f.away = SAVE4.day + 2;
    Object.assign(E, { title: 'Khách quen ốm', text: `Nghe tin ${p.name} ốm nằm nhà mấy hôm nay, không ra chợ được.`, opts: [
      ['Sai chồng mang quà đến thăm · 15 đồng', () => { SAVE4.money -= 15; C4.today.spent += 15; c4Bump(p.id, 18); for (const l of p.links) if (c4Known(l.to)) c4Bump(l.to, 4); (f.facts = f.facts || []).push(`Ngày ${SAVE4.day}: ốm, được nhà mình đến thăm.`); toast(`${c4Cap1(p.name)} cảm động lắm, cả nhà người ta nhớ ơn.`, 3.4); }, SAVE4.money >= 15],
      ['Để khi khác', () => { c4Bump(p.id, -8); toast(`${c4Cap1(p.name)} hơi tủi: "Quen thế mà chẳng hỏi han."`, 3); }]] });
  },
  // a family orders a feast for tomorrow afternoon: enough stock then, or they are put out
  cotiec(E) {
    const k40 = c4KnownList(40), ks = k40.length ? k40 : c4People().list.filter(p => p.kind === 'mouse' && p.role !== 'child'); if (!ks.length || SAVE4.feast) return false;   // early on, anyone in the village (a player)
    const p = c4Pick(ks), need = { trau: 25 + ((R() * 4) | 0) * 5 }; for (const g of ['xoi', 'bun', 'che']) if (c4Own(g) && R() < .7) need[g] = 10 + ((R() * 3) | 0) * 5;
    const pay = Math.round(Object.entries(need).reduce((a, [g, n]) => a + n * c4Price(g) * 1.3, 0));
    Object.assign(E, { title: 'Nhà có cỗ', text: `${c4Cap1(p.name)} sắp làm cỗ mừng thọ, muốn đặt ${Object.entries(need).map(([g, n]) => `${n} ${C4_GOODS[g].unit} ${C4_GOODS[g].name.toLowerCase()}`).join(', ')}. Chiều mai ${c4At('Thân')} đến lấy, trả ${c4Money(pay)}.`, opts: [
      ['Nhận lời', () => { SAVE4.feast = { day: SAVE4.day + 1, need, pay, pid: p.id }; SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'co', text: `Chiều nay ${p.name} đến lấy hàng làm cỗ: ${Object.entries(need).map(([g, n]) => `${n} ${C4_GOODS[g].unit} ${C4_GOODS[g].name.toLowerCase()}`).join(', ')}. Nhớ nhập đủ!` }); toast('Đã ghi vào sổ tay. Sáng mai nhớ nhập đủ hàng!', 3.2); }],
      ['Từ chối khéo', () => c4Bump(p.id, -3)]] });
  },
  // a rival tries to lure a hired helper away
  duthue(E) {
    const gs = c4Owned().filter(g => c4HandsOn(g).length); if (!gs.length) return false;
    const g = c4Pick(gs), s = c4Pick(c4HandsOn(g));
    Object.assign(E, { title: 'Bị dụ mất người làm', text: `Nhà buôn đầu chợ hứa trả ${c4Cap1(s.name)} (hàng ${C4_GOODS[g].name.toLowerCase()}) thêm 4 đồng một ngày để sang làm cho họ.`, opts: [
      ['Tăng công thêm 4 đồng/ngày', () => { s.wageUp = (s.wageUp || 0) + 4; toast(`${c4Cap1(s.name)} ở lại, hứa làm hết lòng.`, 3); }],
      ['Để người ta đi', () => { s.quit = true; toast(`Tối nay ${s.name} bỏ sang nhà kia. Vợ chồng lại phải tự bán, hoặc thuê người khác.`, 3.4); }]] });
  },
  // a flood coming: shore up the stalls now, or lose goods and a level tomorrow
  lut(E) {
    if (c4Wx() !== 'mua' || SAVE4.flood) return false;
    const fix = c4Loss(.02, .05);
    Object.assign(E, { title: 'Nước sông lên', text: `Mưa mãi không ngớt, nước sông dâng gần tới chợ. Các nhà rủ nhau đắp bờ, kê hàng lên cao. Nếu không đắp, có thể thiệt ${c4LossText(.05, .12)}.`, opts: [
      [`Đắp bờ, kê hàng · ${c4Money(fix)}`, () => { SAVE4.money -= fix; C4.today.spent += fix; toast('Hàng quán nhà mình cao ráo, yên tâm.', 3); }, SAVE4.money >= fix],
      ['Chắc không sao đâu', () => { SAVE4.flood = SAVE4.day + 1; toast('Mong là trời thương…', 2.6); }]] });
  },
  // a merchant from another village buys a big lot on the spot
  khachla(E) {
    const n = Math.min(c4Stock('trau'), 20 + ((R() * 3) | 0) * 5); if (n < 15) return false;
    const vil = c4Pick(C4_VILLAGES);
    Object.assign(E, { title: 'Lái buôn làng bên', text: `Một lái buôn ${vil} ghé hỏi mua ${n} miếng trầu, trả 7 đồng một miếng, lấy ngay.`, opts: [
      [`Bán · ${c4Money(n * 7)}`, () => { SAVE4.stock -= n; SAVE4.money += n * 7; C4.today.take += n * 7; C4.today.cogs += n * c4Unit('trau'); C4.today.sold += n; AU.pluck(88); toast('Lái buôn trả tiền sòng phẳng, hẹn phiên sau ghé tiếp.', 3); }],
      ['Để dành bán cho khách quen', () => toast('Khách quen mới là lộc lâu dài.', 2.4)]] });
  },
  // someone you lent to has run off (only after a loan went bad); a debt collector offers to chase it
  bototron(E) {
    if (!SAVE4.badLoan) return false; const L = SAVE4.badLoan; SAVE4.badLoan = null;
    Object.assign(E, { title: 'Con nợ bỏ trốn', text: `Nghe tin ${L.name} vay nhà mình ${c4Money(L.amt)} rồi bỏ lên huyện. Tuần đinh bảo đi đòi giúp, ăn chia một nửa.`, opts: [
      ['Nhờ tuần đinh đòi · mất nửa', () => { if (R() < .6) { const back = Math.round(L.amt / 2); SAVE4.money += back; C4.today.got += back; toast(`Tuần đinh đòi được, mang về ${c4Money(back)}.`, 3); } else toast('Tuần đinh về tay không.', 2.6); }],
      ['Thôi, coi như của đi thay người', () => { SAVE4.phuc = 1; toast('Cả chợ khen nhà mình rộng lượng.', 2.8); }]] });
  },
};
const c4ExtraPool = own => ['caicau', 'omdau', 'cotiec', 'lut', 'khachla', 'bototron', 'mung', 'tang', ...(own.length > 1 ? ['duthue'] : [])];
// the feast is collected at giờ Thân; a flood the morning after a gamble
function c4ExtraUpdate() {
  const F = SAVE4.feast;
  if (F && F.day === SAVE4.day && C4.mins >= (F.at || (F.at = 15 * 60 + R() * 110)) && C4.phase === 'open' && !F.done) {   // some moment in giờ Thân, not always 15:00
    F.done = true; SAVE4.feast = null; const p = c4People().list[F.pid];
    if (Object.entries(F.need).every(([g, n]) => c4Stock(g) >= n)) {
      for (const [g, n] of Object.entries(F.need)) { c4SetStock(g, c4Stock(g) - n); C4.today.sold += n; C4.today.cogs += n * c4Unit(g); }
      SAVE4.money += F.pay; C4.today.take += F.pay; c4Bump(F.pid, 12); AU.drumHit(); toast(`${c4Cap1(p.name)} đến lấy hàng làm cỗ, trả ${c4Money(F.pay)}, khen nhà mình chu đáo!`, 3.6);
    } else { c4Bump(F.pid, -15); AU.snort(); toast(`Không đủ hàng làm cỗ cho ${p.name}! Người ta giận, đi nói khắp làng.`, 3.6); for (const l of p.links) if (c4Known(l.to)) c4Bump(l.to, -4); }
    c4Hud();
  }
}
function c4FloodMorning(back) {
  if (SAVE4.flood !== SAVE4.day) return; SAVE4.flood = 0;
  if (R() < .6) {
    const hit = C4_SHOPS.filter(g => c4Own(g)); let msg = 'Đêm qua nước tràn vào chợ!';
    const wet = c4Loss(.05, .12); SAVE4.money -= wet; C4.today.spent += wet; msg += ` Mất ${c4Money(wet)} đồ đạc trôi.`;
    if (hit.length) { const g = c4Pick(hit), s = SAVE4.shops[g]; if ((s.lv || 0) > 0 && (s.lv || 0) < 4) { s.lv--; msg += ` Hàng ${C4_GOODS[g].name.toLowerCase()} hư hại, phải làm lại.`; } if (g === 'xen' && s.stock) { msg += ` Ướt mất ${Math.ceil(s.stock / 2)} món hàng xén.`; s.stock = Math.floor(s.stock / 2); } }
    back.push(msg);
  } else back.push('Nước sông rút, chợ thoát lụt trong gang tấc.');
}

/* ---------- landlords (owner): a plot is let by someone in the village; a stranger won't even talk, a friend lets it cheap ---------- */
function c4Landlord(g) {
  const P = c4People(), p = P.list[P.landlord[g]], known = c4Known(p.id), a = c4Like(p.id);
  const k = !known ? 1 : a >= 80 ? .6 : a >= 60 ? .8 : a >= 35 ? 1 : 1.4;   // a stranger pays the plain price
  const word = !known ? '' : a >= 80 ? ' (thân thiết, cho giá hời)' : a >= 60 ? ' (quý nhà mình, bớt cho một ít)' : a >= 35 ? '' : ' (chưa ưa nhà mình, nói thách)';
  return { p, known, k, word, price: Math.round((g === 'trau' ? 300 : C4_GOODS[g].rent) * k) };
}
/* ---------- cụ Lý's tax (owner): by what the stalls earned ---------- */
const c4Earned = () => (SAVE4.earn || []).reduce((a, x) => a + Math.max(0, x), 0);
// progressive (owner): 5% of the first 300 đồng earned in the last five days, 10% up to 1 200, 15% above; plus 5 a stall
const C4_TAX_BANDS = [[300, .05], [1200, .1], [Infinity, .15]];
const c4TaxOn = e => { let t = 0, lo = 0; for (const [hi, r] of C4_TAX_BANDS) { if (e > lo) t += (Math.min(e, hi) - lo) * r; lo = hi; } return t; };
const c4Tax = () => Math.max(10, Math.round(c4TaxOn(c4Earned())) + 5 * c4Owned().length);
/* ---------- every stall at a glance (owner's reference): a card each, tap to open it ---------- */
function c4OpenUps() {
  $('#c4evT').textContent = 'Các hàng của nhà mình';
  const all = ['trau', ...C4_SHOPS, ...C4_BUYS.filter(c4Own)], card = g => {
    const G = C4_GOODS[g], own = c4Own(g), lvI = g === 'trau' ? SAVE4.lv : c4SLvI(g), lvN = g === 'trau' ? C4_LV.length : C4_SHOP_LV.length;
    const name = g === 'trau' ? c4Lv().name : own ? c4SLv(g).name : 'Đất trống', L = !own && c4Landlord(g);
    return `<button class="upc ${own ? '' : 'empty'}" data-up="${g}"><b>${G.name}</b><span class="lv">${name}</span>`
      + (own ? `<i class="bar"><i style="width:${(lvI + 1) / lvN * 100}%"></i></i><span>còn ${c4Stock(g)}/${c4Cap(g)} ${G.unit}</span>` : `<span>thuê ${c4Money(L.price)}</span>`) + '</button>';
  };
  $('#c4evB').innerHTML = `<div class="ups">${all.map(card).join('')}</div>`;
  $('#c4evB').querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => { AU.tap(); c4OpenUp(b.dataset.up); }));
  const box = $('#c4evO'); box.innerHTML = ''; const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = 'Đóng'; b.addEventListener('click', () => c4Sheets(null)); box.appendChild(b);
  c4Sheets('c4ev');
}
// the tally, stall by stall: what each brought in after its goods
function c4ByShopHtml(d) {
  const B = d.by || {}, rows = c4Owned().map(g => [g, B[g] || { take: 0, cogs: 0, n: 0 }]).map(([g, b]) => [g, b, b.take - b.cogs - (b.wage || 0)]);
  const max = Math.max(1, ...rows.map(r => Math.abs(r[2])));
  return `<div class="byshop">${rows.sort((a, b) => b[2] - a[2]).map(([g, b, net]) => `<div class="bs"><span class="tg">${g === 'trau' ? c4Lv().name : c4SLv(g).name}</span><b>${C4_GOODS[g].name}</b><span class="${net >= 0 ? 'gain' : 'bad'}">${net >= 0 ? '+' : '−'}${c4Money(Math.abs(net))}</span><i class="bar"><i style="width:${Math.abs(net) / max * 100}%"></i></i><small>${b.n} ${C4_GOODS[g].unit}${b.wage ? ` · công ${c4Money(b.wage)}` : ''}</small></div>`).join('')}</div>`;
}

/* ---------- tables and stools (owner): who eats chè, xôi or bún sits down to it; more tables, more seats, longer patience ---------- */
const C4_EAT = ['che', 'xoi', 'bun'], C4_TABLES_MAX = 3;
const c4Tables = g => C4_EAT.includes(g) && c4Own(g) ? Math.max(1, SAVE4.shops[g].tables || 1) : 0;
const c4TableCost = g => Math.round(C4_GOODS[g].rent * .45 * c4Tables(g));
// where each seat is: tables in a row right of the stall, behind the queue; a stool each side
const c4Seat = (g, i) => { const t = Math.floor(i / 2), tx = C4_GOODS[g].x + 110 + t * 80; return { x: tx + (i % 2 ? 26 : -26), face: i % 2 ? -1 : 1, z: .2, tx }; };
// a customer just served: a free seat, or they take it away
function c4SitDown(w, g) {
  if (!C4_EAT.includes(g) || w.kind !== 'mouse') return false;
  C4.seats = C4.seats || {}; const S = C4.seats[g] || (C4.seats[g] = []), n = c4Tables(g) * 2;
  for (let i = 0; i < n; i++) if (!S[i]) { S[i] = w; const P = c4Seat(g, i); Object.assign(w, { st: 'toseat', seat: { g, i, ...P }, eatT: 7 + R() * 7 }); return true; }
  c4Say(w, c4Pick(['Hết chỗ ngồi, thôi mang về vậy.', 'Đông quá, gói mang về nhé!', 'Chẳng còn ghế nào trống…'])); return false;
}
function c4SeatUpdate(w, dt) {
  const s = w.seat;
  if (w.st === 'toseat') {
    const dx = s.x - w.x, dz = s.z - w.z, d = Math.hypot(dx, dz * 300); w.moving = d > 3;
    if (w.moving) { const k = Math.min(1, 80 * dt / d); w.x += dx * k; w.z += dz * k; w.ph += dt * 9; w.face = dx < 0 ? -1 : 1; }
    else { w.st = 'eat'; w.face = s.face; w.x = s.x; w.z = s.z; }
  } else if (w.st === 'eat') {
    w.talk = Math.sin(C4.t * 3 + w.seed) > .6;                               // a spoonful now and then
    if ((w.eatT -= dt) <= 0) { C4.seats[s.g][s.i] = null; w.seat = null; w.talk = false; if (R() < .4) c4Say(w, c4Pick(['No căng bụng!', 'Ngon thật, mai lại ăn!', 'Bát này đáng đồng tiền!'])); w.st = 'leave'; w.face = R() < .5 ? 1 : -1; w.sp = 70; }
  }
}
// the tables, with a bowl at each seat taken (empty stools drawn here too)
function c4TableItems(items, g, vis, sh) {
  const n = c4Tables(sh); if (!n) return;
  for (let t = 0; t < n; t++) {
    const tx = C4_GOODS[sh].x + 110 + t * 80; if (!vis(tx, 80)) continue;
    const z = .2, y = c4Y(z), s = c4S(z) * .92, S = (C4.seats && C4.seats[sh]) || [];
    items.push({ z: z - .001, f: () => {
      g.save(); g.translate(tx, y); g.scale(s, s);
      for (const d of [-1, 1]) { const i = t * 2 + (d > 0 ? 1 : 0); if (S[i] && S[i].st === 'eat') continue;
        c4Shape(g, '#8a5a2a', [[d * 26 - 20, -40], [d * 26 + 20, -40], [d * 26 + 20, -33], [d * 26 - 20, -33]], 2); c4Stroke(g, 4, '#7a4a22', [[d * 26 - 14, -33], [d * 26 - 17, 0]]); c4Stroke(g, 4, '#7a4a22', [[d * 26 + 14, -33], [d * 26 + 17, 0]]); }
      g.restore();
    } });
    items.push({ z: z + .002, f: () => {
      g.save(); g.translate(tx, y); g.scale(s, s);
      c4Shape(g, '#a0703a', [[-24, -56], [24, -56], [24, -48], [-24, -48]], 2); c4Stroke(g, 4, '#7a4a22', [[-18, -48], [-18, 0]]); c4Stroke(g, 4, '#7a4a22', [[18, -48], [18, 0]]);
      for (const d of [-1, 1]) { const i = t * 2 + (d > 0 ? 1 : 0); if (!S[i] || S[i].st !== 'eat') continue;
        c4Shape(g, '#f2ecde', [[d * 12 - 8, -64], [d * 12 + 8, -64], [d * 12 + 5, -56], [d * 12 - 5, -56]], 1.4);
        g.fillStyle = sh === 'bun' ? '#a3332a' : sh === 'che' ? '#2f6a4c' : '#f2c640'; g.beginPath(); g.ellipse(d * 12, -64, 7, 2, 0, 0, 6.283); g.fill(); }
      g.restore();
    } });
  }
}
// the stall sheet: a line about the tables and a button for one more
function c4TablesBlock(g) {
  if (!C4_EAT.includes(g) || !c4Own(g)) return '';
  const n = c4Tables(g), cost = c4TableCost(g);
  return `<h4>Bàn ghế</h4><p class="nx">${n} bàn · ${n * 2} chỗ ngồi. Khách có chỗ ngồi thì chịu chờ lâu hơn, ghé đông hơn; hết chỗ thì họ mua mang về.</p>`
    + (n < C4_TABLES_MAX ? `<button class="btn alt" data-table="${g}" ${SAVE4.money < cost ? 'disabled' : ''}>Thêm một bàn hai ghế · ${c4Money(cost)}</button>` : '<p class="hint">Đã kê đủ bàn ghế.</p>');
}
function c4TablesWire(g) {
  const b = $('#c4upB [data-table]'); if (!b) return;
  b.addEventListener('click', () => { const cost = c4TableCost(g); if (SAVE4.money < cost) return; SAVE4.money -= cost; C4.today.spent += cost; SAVE4.shops[g].tables = c4Tables(g) + 1; AU.stamp(); persist4(); c4Hud(); toast(`Kê thêm một bàn hai ghế cho hàng ${C4_GOODS[g].name.toLowerCase()}.`, 2.6); c4OpenUp(g); });
}

/* ---------- weddings and funerals in the village (owner): they cost a gift, and win the household (and their friends) over;
   staying away leaves them hurt. Timed like the other happenings: when the time runs out, you did not go. ---------- */
// a household you know: its people, and everyone tied to them
function c4Household(p) { const P = c4People(); return { all: P.list.filter(q => q.house === p.house), ties: p.links.map(l => P.list[l.to]) }; }
function c4Warm(p, me, house, ties) {
  const H = c4Household(p);
  c4Bump(p.id, me); for (const q of H.all) if (q.id !== p.id && c4Known(q.id)) c4Bump(q.id, house);
  if (ties) for (const q of H.ties) if (c4Known(q.id)) c4Bump(q.id, ties);
}
Object.assign(C4_EXTRA_EV, {
  mung(E) {
    const ks = c4KnownList(15).filter(p => p.kind === 'mouse'); if (!ks.length) return false;
    const olds = ks.filter(q => q.role === 'old' || /^(bác|ông|bà)/.test(q.name)), p = c4Pick(olds.length ? olds : ks), sp = n => { SAVE4.money -= n; C4.today.spent += n; };
    Object.assign(E, { title: 'Đám cưới', text: `Nhà ${p.name} cưới con, sang đánh tiếng mời nhà mình đi ăn cỗ mừng cô dâu chú rể. Mừng càng hậu thì nhà ấy và bạn bè họ càng quý.`, opts: [
      ['Mừng 10 đồng', () => { sp(10); c4Warm(p, 6, 3, 0); toast(`${c4Cap1(p.name)} cảm ơn, mời nhà mình ngồi mâm trên. Cả nhà ấy quý nhà mình hơn.`, 3.4); }, SAVE4.money >= 10],
      ['Mừng 30 đồng', () => { sp(30); c4Warm(p, 12, 6, 2); toast(`Phong bì dày dặn! Nhà ${p.name} và bạn bè họ đều mến nhà mình hơn.`, 3.4); }, SAVE4.money >= 30],
      ['Mừng 60 đồng, thật hậu', () => { sp(60); c4Warm(p, 20, 10, 5); toast(`Cả đám cưới xôn xao khen nhà mình chịu chơi. ${c4Cap1(p.name)} nhớ mãi, nhà ấy và bạn bè họ quý nhà mình lắm.`, 3.8); }, SAVE4.money >= 60],
      ['Bận bán hàng, không đi', () => { c4Warm(p, -6, -3, 0); toast(`${c4Cap1(p.name)} hơi phật ý: "Mời mà chẳng thấy mặt!"`, 3.2); }]] });
  },
  tang(E) {
    const ks = c4KnownList(10).filter(p => p.kind === 'mouse'); if (!ks.length) return false;
    const p = c4Pick(ks), sp = n => { SAVE4.money -= n; C4.today.spent += n; }, who = c4Pick(['ông cụ thân sinh', 'bà cụ thân sinh', 'cụ ông bên nội', 'cụ bà bên ngoại']);
    Object.assign(E, { title: 'Đám ma', text: `Nhà ${p.name} có tang: ${who} vừa mất. Cả xóm đi phúng viếng. Đi đưa tang thì nhà ấy nhớ ơn lắm, nhưng gánh hàng phải bỏ trống một lúc.`, opts: [
      ['Phúng 10 đồng', () => { sp(10); c4Warm(p, 8, 4, 0); toast(`Nhà ${p.name} cảm động vì nhà mình đến thắp nén hương.`, 3.2); }, SAVE4.money >= 10],
      ['Phúng 30 đồng và đi đưa tang', () => { sp(30); c4Warm(p, 18, 9, 4); C4.shut = Math.max(C4.shut || 0, 25); if (C4.today) C4.today.help = (C4.today.help || 0) + 1; toast(`Vợ chồng đi đưa tang, gánh hàng đóng một lúc. Nhà ${p.name} và người quen của họ nhớ ơn lắm.`, 3.8); }, SAVE4.money >= 30],
      ['Không đi', () => { c4Warm(p, -8, -4, -1); toast(`Người ta xì xào: "Hàng xóm có tang mà nhà ấy không ló mặt!"`, 3.2); }]] });
  },
});
