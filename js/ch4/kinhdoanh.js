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
  const L = c4Landlord(g), cost = Math.round(G.rent * nx.up * (nx.house ? L.k : 1));
  if (nx.house && !L.known) { $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${now}<p class="bad">Muốn ${nx.house === 'own' ? 'mua' : 'thuê'} nhà mặt chợ: không biết chủ căn nhà là ai mà hỏi. Quen thêm người trong làng thì sẽ biết; càng thân giá càng rẻ.</p>` + c4TablesBlock(g); c4TablesWire(g); return; }
  $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${now}<p class="nx">Lên <b>${nx.name}</b>: chứa ${Math.round(G.cap * nx.cap)} ${G.unit} · bán nhanh hơn · khách ghé đông hơn${nx.daily ? ` · <b>tiền nhà ${Math.round(G.rent * nx.daily)} đồng mỗi tối</b> (hai tối không trả là bị đuổi về quầy)` : ''}${nx.house === 'own' ? ' · <b>mua đứt, khỏi trả tiền nhà</b>' : ''}</p>`;
  $('#c4upB').insertAdjacentHTML('beforeend', c4TablesBlock(g)); c4TablesWire(g);
  const b = $('#c4upGo'); b.hidden = false; b.disabled = SAVE4.money < cost; b.innerHTML = `${nx.house === 'own' ? 'Mua nhà' : nx.house ? 'Thuê nhà' : 'Nâng cấp'} · ${c4Money(cost)}`;
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
// today's offers (rolled once a morning) and the orders taken: { id, vil, g, n, unit, pay, day, dep }
function c4RollOffers() {
  if (!c4Guild() || SAVE4.offerDay === SAVE4.day) return;
  SAVE4.offerDay = SAVE4.day; SAVE4.offers = [];
  const own = c4Owned(), k = 1 + (R() < .5 ? 1 : 0);
  for (let i = 0; i < k; i++) {
    const g = c4Pick(own), G = C4_GOODS[g], n = Math.round((g === 'trau' ? 30 : 12) * (1 + R() * 2)), unit = Math.round(c4Cost(g) * (1.7 + R() * .5) * 10) / 10;
    SAVE4.offers.push({ id: SAVE4.day * 10 + i, vil: c4Pick(C4_VILLAGES), g, n, unit, pay: Math.round(n * unit), day: SAVE4.day + 1 + ((R() * 2) | 0), dep: Math.round(n * unit * .2) });
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
      + (mine.length ? mine.map(o => `<p class="${o.day === day ? 'due' : ''}">• ${o.day === day ? '<b>Hôm nay giao</b>' : 'Ngày ' + o.day + ' giao'}: ${o.n} ${C4_GOODS[o.g].unit} ${C4_GOODS[o.g].name.toLowerCase()} cho ${o.vil}, được ${c4Money(o.pay)} (tiền hàng ${c4Money(Math.round(o.n * c4Cost(o.g)))})</p>`).join('') : '')
      + (offers.length && mine.length < 2 ? offers.map(o => `<div class="offer"><p>${c4Cap1(o.vil)} đặt <b>${o.n} ${C4_GOODS[o.g].unit} ${C4_GOODS[o.g].name.toLowerCase()}</b>, giao ngày ${o.day}, trả ${c4Money(o.pay)}. Nhận đơn phải đặt cọc ${o.dep} đồng; trễ hẹn mất cọc, mất tiếng.</p><button class="btn alt" data-take="${o.id}" ${SAVE4.money < o.dep ? 'disabled' : ''}>Nhận đơn · cọc ${o.dep} đồng</button></div>`).join('') : '')
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
    SAVE4.money -= o.dep; (SAVE4.ws = SAVE4.ws || []).push(o); AU.pluck(84); toast(`Nhận đơn của ${o.vil}. Ngày ${o.day} chồng gánh hàng đi giao từ sáng (5:00), trưa (11:00) mới về.`, 3.2); persist4(); c4BizRefresh(); c4AfterMoney();
  }));
}
function c4BizRefresh() { const box = $('#c4biz'); if (!box) return; box.innerHTML = c4BizHtml(); c4BizWire(box); }
// the market opens: an order due today goes out with the husband (goods bought now at the guild price), he is back at noon
function c4ShipOrders() {
  const due = (SAVE4.ws || []).filter(o => o.day === SAVE4.day), lines = [];
  for (const o of due) {
    const cost = Math.round(o.n * c4Cost(o.g));
    if (SAVE4.money < cost || C4.deliv) { o.fail = true; lines.push(`Không đủ ${c4Money(cost)} lấy hàng giao cho ${o.vil}: mất cọc, ${o.vil} chê nhà mình thất hứa.`); SAVE4.wsBad = (SAVE4.wsBad || 0) + 1; continue; }
    SAVE4.money -= cost; C4.today.spent += cost; C4.deliv = { o, until: 11 * 60 };
    Object.assign(C4.porter, { st: 'out', good: null, qty: 0, cost: 0, deliv: true });
  }
  SAVE4.ws = (SAVE4.ws || []).filter(o => o.day > SAVE4.day);
  if (lines.length) setTimeout(() => toast(lines.join(' '), 4.4), 600);
}
// the husband stays away while delivering; back at noon with the money (and a story)
function c4DelivUpdate() {
  const D = C4.deliv, P = C4.porter; if (!D) return;
  if (P.st === 'away') P.t = 1;                                             // keep him away until the hour
  if (C4.mins >= D.until && P.st === 'away') {
    P.t = 0; C4.deliv = null; const o = D.o; let pay = o.pay + o.dep, note;
    const r = R();
    if (r < .1) { pay = Math.round(pay * .5); note = `Đường về gặp kẻ cướp, chồng chạy thoát nhưng mất nửa tiền: chỉ còn ${c4Money(pay)}.`; }
    else if (r < .25) { pay += 30; note = `${c4Cap1(o.vil)} khen hàng tốt, thưởng thêm 30 đồng, hẹn lần sau đặt tiếp!`; SAVE4.wsGood = (SAVE4.wsGood || 0) + 1; }
    else note = `Chồng giao xong hàng cho ${o.vil}, mang về ${c4Money(pay)}.`;
    SAVE4.money += pay; C4.today.got += pay; C4.today.ws = (C4.today.ws || 0) + 1; persist4(); c4Hud();
    setTimeout(() => toast(note, 4), 1500);
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
  { k: 'ask', make: () => ({ n: 1, text: 'Hỏi chuyện nhà một người', prize: 8 }), done: (t, d) => (d.ask || 0) >= 1, from: () => SAVE4.day >= C4_BOOK_DAY },
  { k: 'ws', make: () => ({ n: 1, text: 'Giao một đơn hàng sỉ', prize: 15 }), done: (t, d) => (d.ws || 0) >= 1, from: () => (SAVE4.ws || []).some(o => o.day === SAVE4.day) },
  { k: 'ruot', make: () => ({ n: 1, text: 'Mời một mối ruột ghé quán', prize: 10 }), done: (t, d) => (d.invRuot || 0) >= 1, from: () => c4People().list.some(p => c4Ruot(p.id)) },
];
function c4Tasks() {
  if (SAVE4.taskDay !== SAVE4.day) {
    SAVE4.taskDay = SAVE4.day; const pool = C4_TASKS.filter(t => !t.from || t.from()), pick = [], want = c4Pick([0, 1, 1, 2, 2, 3]);
    while (pick.length < want && pool.length) pick.push(pool.splice((R() * pool.length) | 0, 1)[0]);
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
    const ks = c4KnownList(40); if (!ks.length || SAVE4.feast) return false;
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
    Object.assign(E, { title: 'Nước sông lên', text: 'Mưa mãi không ngớt, nước sông dâng gần tới chợ. Các nhà rủ nhau đắp bờ, kê hàng lên cao.', opts: [
      ['Đắp bờ, kê hàng · 30 đồng', () => { SAVE4.money -= 30; C4.today.spent += 30; toast('Hàng quán nhà mình cao ráo, yên tâm.', 3); }, SAVE4.money >= 30],
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
const c4ExtraPool = own => ['caicau', 'omdau', 'cotiec', 'lut', 'khachla', 'bototron', ...(own.length > 1 ? ['duthue'] : [])];
// the feast is collected at giờ Thân; a flood the morning after a gamble
function c4ExtraUpdate() {
  const F = SAVE4.feast;
  if (F && F.day === SAVE4.day && C4.mins >= 15 * 60 && C4.phase === 'open' && !F.done) {
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
    if (hit.length) { const g = c4Pick(hit), s = SAVE4.shops[g]; if ((s.lv || 0) > 0 && (s.lv || 0) < 4) { s.lv--; msg += ` Hàng ${C4_GOODS[g].name.toLowerCase()} hư hại, phải làm lại.`; } if (g === 'xen' && s.stock) { msg += ` Ướt mất ${Math.ceil(s.stock / 2)} món hàng xén.`; s.stock = Math.floor(s.stock / 2); } }
    back.push(msg);
  } else back.push('Nước sông rút, chợ thoát lụt trong gang tấc.');
}

/* ---------- landlords (owner): a plot is let by someone in the village; a stranger won't even talk, a friend lets it cheap ---------- */
function c4Landlord(g) {
  const P = c4People(), p = P.list[P.landlord[g]], known = c4Known(p.id), a = c4Like(p.id);
  const k = a >= 80 ? .6 : a >= 60 ? .8 : a >= 35 ? 1 : 1.4;
  const word = a >= 80 ? ' (thân thiết, cho giá hời)' : a >= 60 ? ' (quý nhà mình, bớt cho một ít)' : a >= 35 ? '' : ' (chưa ưa nhà mình, nói thách)';
  return { p, known, k, word, price: Math.round((g === 'trau' ? 300 : C4_GOODS[g].rent) * k) };
}
/* ---------- cụ Lý's tax (owner): by what the stalls earned ---------- */
const c4Earned = () => (SAVE4.earn || []).reduce((a, x) => a + Math.max(0, x), 0);
const c4Tax = () => Math.max(10, Math.round(c4Earned() * .1) + 5 * c4Owned().length);
/* ---------- every stall at a glance (owner's reference): a card each, tap to open it ---------- */
function c4OpenUps() {
  $('#c4evT').textContent = 'Các hàng của nhà mình';
  const all = ['trau', ...C4_SHOPS], card = g => {
    const G = C4_GOODS[g], own = c4Own(g), lvI = g === 'trau' ? SAVE4.lv : c4SLvI(g), lvN = g === 'trau' ? C4_LV.length : C4_SHOP_LV.length;
    const name = g === 'trau' ? c4Lv().name : own ? c4SLv(g).name : 'Đất trống', L = !own && c4Landlord(g);
    return `<button class="upc ${own ? '' : 'empty'}" data-up="${g}"><b>${G.name}</b><span class="lv">${name}</span>`
      + (own ? `<i class="bar"><i style="width:${(lvI + 1) / lvN * 100}%"></i></i><span>còn ${c4Stock(g)}/${c4Cap(g)} ${G.unit}</span>` : `<span>${L.known ? 'thuê ' + c4Money(L.price) : 'chưa rõ chủ'}</span>`) + '</button>';
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
