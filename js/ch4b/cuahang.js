/* Chương IV phần 2 · Phố Huyện: every shop on the street can be taken and run like the betel house (owner, 2026-11-06: "mỗi quán sẽ có thể
   đứng bán giống quán trầu, càng nhiều thứ để custom càng tốt"; all 19 at once, eating houses keep a store of ingredients, a game for each).
   This file replaces the single-dish eating house of thue.js (its functions are reassigned here; thue.js keeps the sheet's DOM, the signboard and the list):
   - P4_KINDS: what each shop sells (3–4 wares: cost, base price, unit, whether it keeps overnight, how much it is asked for), its hours,
     its weather, customers a day, rent (× P4_RENT_WEEK), the keeper's wage and serving time, and its game (js/ch4b/tiemnho.js).
   - R (p4Shops()[x]): { food: the street name, name, own, since, sign, stock{id}, price{id}, menu{id: false = put away}, auto{id: n each morning},
     help 0–2 (more hands: faster, dearer), open/close hours, awn (awning colour), lamp, pots 0–2, sk (a counter cloth), day (stock day) }.
   - Customers pick a ware on the menu (by its weight and how fair its price is), ask for 1–3 (more when cheap), the keeper serves them in
     turn. No stocking (owner, 2026-11-08, after the stocking days left shops empty and the purse flat): each sale pays its goods' cost at
     once, as the old one-dish houses did; R.stock / R.auto are emptied (old goods paid back once, R.ns).
   Balance as thue.js: a rented shop's week, after goods and wages, nets about 1.2 × its rent at the plain prices. */
const P4_HOURS = {
  an: h => (h < 6 ? 0 : h < 9 ? 1.5 : h < 11 ? .6 : h < 13.5 ? 1.6 : h < 17 ? .5 : h < 21 ? 1.25 : 0),
  sang: h => (h < 5 ? 0 : h < 10 ? 1.6 : h < 14 ? 1 : h < 18 ? .8 : h < 21 ? .4 : 0),
  chieu: h => (h < 7 ? 0 : h < 11 ? .6 : h < 14 ? .8 : h < 18 ? 1.5 : h < 21 ? 1 : 0),
  dem: h => (h < 7 ? 0 : h < 16 ? .2 : h < 18 ? .7 : h < 23 ? 2.2 : 0),
  deu: h => (h < 6 ? 0 : h < 21 ? 1 : 0),
};
const P4_HOURS_NORM = {}; for (const k in P4_HOURS) { let s = 0; for (let m = 360; m < 1380; m++) s += P4_HOURS[k](m / 60); P4_HOURS_NORM[k] = s / 1020; }
// w = how often it is asked for; keep: 'day' = thrown away at night
const W = (id, n, u, c, p, w, keep = 'ever') => ({ id, n, u, c, p, w, keep });
const P4_FOODK = (wares, hours, wx, game) => ({ t: 'an', wares, hours, wx, cust: 62, rentK: 1, wage: 300, serve: 1.6, keeper: 'đầu bếp', game });
const P4_SHOPK = (wares, hours, wx, game, o = {}) => ({ t: 'hieu', wares, hours, wx, cust: 46, rentK: .6, wage: 200, serve: 1.4, keeper: 'người bán', game, ...o });
const P4_LAMPK = { t: 'den', wares: [W('tron', 'Đèn lồng tròn', 'chiếc', 15, 40, 3), W('sen', 'Đèn hoa sen', 'chiếc', 25, 60, 2), W('keo', 'Đèn kéo quân', 'chiếc', 50, 110, 1), W('hoa', 'Hoa đăng', 'chiếc', 6, 18, 3)],
  hours: 'dem', wx: { mua: .6, ret: 1, gat: 1, dep: 1.1 }, cust: 40, rentK: .4, wage: 150, serve: 1.2, keeper: 'thợ đèn', game: 'den' };
const P4_KINDS = {
  'BÚN CHẢ': P4_FOODK([W('buncha', 'Bún chả', 'suất', 24, 60, 4, 'day'), W('nem', 'Nem rán', 'đĩa', 12, 30, 2, 'day'), W('trada', 'Trà đá', 'cốc', 2, 5, 2, 'day')], 'an', { gat: 1.15, mua: .8 }, 'buncha'),
  'BÁNH BAO': P4_FOODK([W('thit', 'Bánh bao nhân thịt', 'chiếc', 10, 25, 4, 'day'), W('chay', 'Bánh bao chay', 'chiếc', 6, 15, 2, 'day'), W('xiumai', 'Xíu mại', 'bát', 14, 35, 2, 'day')], 'sang', { ret: 1.3, gat: .8 }, 'banhbao'),
  'CƠM GÀ': P4_FOODK([W('comga', 'Cơm gà', 'đĩa', 26, 65, 4, 'day'), W('galuoc', 'Gà luộc nửa con', 'nửa con', 60, 150, 1, 'day'), W('canh', 'Canh', 'bát', 4, 10, 2, 'day')], 'an', {}, 'comga'),
  'HỦ TIẾU': P4_FOODK([W('hutieu', 'Hủ tiếu', 'bát', 22, 55, 4, 'day'), W('hoanh', 'Hoành thánh', 'bát', 16, 40, 2, 'day')], 'an', { mua: 1.3, gat: .85 }, 'pho'),
  'CƠM TẤM': P4_FOODK([W('suon', 'Cơm tấm sườn', 'đĩa', 24, 60, 4, 'day'), W('trung', 'Trứng ốp', 'quả', 6, 15, 2, 'day'), W('bicha', 'Bì chả', 'đĩa', 10, 25, 2, 'day')], 'sang', {}, 'comtam'),
  'CHÈ': P4_FOODK([W('dau', 'Chè đậu', 'cốc', 8, 20, 3, 'day'), W('thapcam', 'Chè thập cẩm', 'cốc', 12, 30, 3, 'day'), W('nong', 'Chè nóng', 'bát', 8, 20, 2, 'day')], 'chieu', { gat: 1.3, ret: .8 }, 'che'),
  'CAO LẦU': P4_FOODK([W('caolau', 'Cao lầu', 'bát', 26, 65, 4, 'day'), W('miquang', 'Mì Quảng', 'bát', 24, 60, 3, 'day')], 'an', {}, 'pho'),
  'PHỞ BÒ': P4_FOODK([W('tai', 'Phở tái', 'bát', 26, 65, 4, 'day'), W('chin', 'Phở chín', 'bát', 24, 60, 3, 'day'), W('quay', 'Quẩy', 'cái', 3, 8, 2, 'day')], 'sang', { ret: 1.3, mua: 1.15, gat: .8 }, 'pho'),
  'BÁNH VẠC': P4_FOODK([W('banhvac', 'Bánh vạc', 'đĩa', 16, 40, 4, 'day'), W('chien', 'Hoành thánh chiên', 'đĩa', 18, 45, 2, 'day')], 'chieu', {}, 'banhbao'),
  'GẠO MUỐI': P4_SHOPK([W('gao', 'Gạo tám', 'thúng', 60, 95, 3), W('nep', 'Gạo nếp', 'thúng', 75, 115, 1.5), W('muoi', 'Muối', 'hũ', 6, 15, 2)], 'sang', { mua: .7 }, 'gao'),
  'THUỐC BẮC': P4_SHOPK([W('cam', 'Thang thuốc cảm', 'thang', 20, 50, 3), W('bo', 'Thuốc bổ', 'thang', 50, 110, 1.5), W('cao', 'Cao hổ cốt', 'lọ', 120, 240, .5)], 'deu', { ret: 1.5, mua: 1.3 }, 'thuoc'),
  'GIẤY BÚT': P4_SHOPK([W('giay', 'Giấy dó', 'tập', 10, 25, 3), W('but', 'Bút lông', 'cây', 25, 60, 2), W('muc', 'Mực tàu', 'thỏi', 30, 70, 1.5)], 'sang', { mua: .8 }, 'giay'),
  'HÀNG XÉN': P4_SHOPK([W('kim', 'Kim chỉ', 'gói', 5, 14, 3), W('guong', 'Gương lược', 'bộ', 25, 55, 2), W('khan', 'Khăn vấn', 'chiếc', 35, 75, 1.5)], 'chieu', {}, 'xen'),
  'TRÀ SEN': P4_SHOPK([W('sen', 'Trà sen', 'gói', 80, 160, 1.5), W('man', 'Trà mạn', 'gói', 30, 65, 3), W('am', 'Ấm chén', 'bộ', 120, 220, .6)], 'sang', { mua: .9 }, 'tra'),
  'TIỆM VẢI': P4_SHOPK([W('lua', 'Lụa tơ tằm', 'tấm', 80, 170, 1.5), W('vai', 'Vải nâu', 'tấm', 30, 65, 3), W('the', 'Vải the', 'tấm', 50, 110, 2)], 'deu', { mua: .8 }, 'vai'),
  'HÀNG GỐM': P4_SHOPK([W('bat', 'Bát đĩa', 'chồng', 20, 45, 3), W('binh', 'Bình hoa', 'chiếc', 45, 100, 1.5), W('am', 'Ấm tích', 'chiếc', 35, 80, 1.5)], 'sang', { mua: .8 }, 'gom'),
  'TIỆM VÀNG': P4_SHOPK([W('nhan', 'Nhẫn bạc', 'chiếc', 40, 90, 3), W('khuyen', 'Khuyên tai', 'đôi', 60, 130, 2), W('vong', 'Vòng vàng', 'chiếc', 200, 380, .6)], 'deu', { mua: .9 }, 'vang', { cust: 34 }),
  'MAY ÁO DÀI': P4_SHOPK([W('aodai', 'Áo dài may sẵn', 'bộ', 150, 300, 1), W('sua', 'Sửa áo', 'lần', 10, 35, 3), W('khanxep', 'Khăn xếp', 'chiếc', 30, 70, 1.5)], 'deu', { mua: .8 }, 'may', { cust: 36 }),
};
for (const n of P4_LAMP_NAMES) P4_KINDS[n] = P4_LAMPK;
const p4Kind = R => P4_KINDS[R && R.food] || P4_KINDS['BÚN CHẢ'];
const p4KindOfName = n => P4_KINDS[n] || null;
// only one lamp shop for the couple (owner): the name of the one they hold, if any
const p4LampHeld = () => { const S = p4Shops(); for (const k in S) if (p4Kind(S[k]).t === 'den') return S[k].name; return null; };
const P4_GAME_WORD = { vai: 'Đo cắt vải', gom: 'Gói đồ gốm', vang: 'Bày đồ vàng bạc', buncha: 'Nướng chả', banhbao: 'Hấp bánh', comga: 'Chặt gà', pho: 'Chan nước dùng', comtam: 'Bày đĩa cơm', che: 'Múc chè', gao: 'Đong gạo', thuoc: 'Bốc thuốc', giay: 'Gói giấy bút', xen: 'Bày hàng xén', tra: 'Pha trà', may: 'Cắt may', den: 'Làm đèn' };
const P4_TYPE_WORD = { an: 'Quán ăn', hieu: 'Cửa hiệu', den: 'Hàng đèn' };
const P4_AWN = [['', 'Không'], ['red', 'Đỏ'], ['blue', 'Xanh lam'], ['green', 'Xanh lá'], ['yellow', 'Vàng'], ['stripe', 'Sọc đỏ trắng']];
const P4_AWN_COL = { red: '#a3332a', blue: '#2f5f8f', green: '#2f6a4c', yellow: '#e0b43a', stripe: '#a3332a' };
const P4_DECO_PRICE = { awn: 1200, lamp: 600, pot: 300, sk: 400, help: 150 };
const p4RentOf = R => Math.round(P4_RENT_WEEK * p4Kind(R).rentK), p4TaxOf = R => Math.round(P4_TAX_WEEK * p4Kind(R).rentK), p4BuyOf = R => Math.round(P4_HOUSE_PRICE * Math.max(.5, p4Kind(R).rentK));
const p4WageOf = R => p4Kind(R).wage + (R.help || 0) * P4_DECO_PRICE.help;
// the shop's own data, filled in for a new shop or an old save (eating houses of the one-dish days keep their price as the first ware's)
// the three lamp shops that became other trades: a shop rented or bought as one turns into the new trade, its lamps paid back at cost
const P4_LAMP_SWAP = { 'LỒNG ĐÈN PHÚC': 'TIỆM VẢI', 'ĐÈN HOA SEN': 'HÀNG GỐM', 'ĐÈN LỒNG TÀI LỘC': 'TIỆM VÀNG' };
function p4ShopFix(R) {
  const to = R && P4_LAMP_SWAP[R.food];
  if (to) { let back = 0; for (const w of P4_LAMPK.wares) back += ((R.stock || {})[w.id] || 0) * w.c; SAVE4.money += back; if (R.name === R.food) R.name = to; R.food = to; R.stock = {}; R.prices = {}; R.menu = {}; R.auto = {}; delete R.price; }
  const K = p4Kind(R);
  R.stock = R.stock || {}; if (!R.prices) { R.prices = {}; if (typeof R.price === 'number') R.prices[K.wares[0].id] = R.price; }
  R.menu = R.menu || {}; R.auto = R.auto || {};
  // no stocking by hand any more (owner, 2026-11-08: "để tự nhập hàng như trước"): the keeper buys what each sale needs, so goods left
  // from the stocking days are paid back at cost once
  if (!R.ns) { let back = 0; for (const w of K.wares) back += Math.max(0, R.stock[w.id] || 0) * w.c; if (back > 0) SAVE4.money += back; R.stock = {}; R.auto = {}; R.ns = 1; }
  for (const w of K.wares) { if (!R.prices[w.id]) R.prices[w.id] = w.p; }
  R.price = R.prices[K.wares[0].id];                                       // (the old one-dish price, still read by gia.js and the friends' market)
  if (R.open === undefined) { R.open = K.t === 'den' ? 15 : 6; R.close = K.t === 'den' ? 23 : 21; }
  return R;
}
const p4WPrice = (R, w) => R.prices[w.id] || w.p;
const p4WRatio = (R, w) => c4TownRatio(p4WPrice(R, w), w.p);
const p4OnMenu = (R, w) => R.menu[w.id] !== false;
const p4Has = (R, w) => p4OnMenu(R, w);                                  // every ware on the menu can be sold: the keeper buys it as it goes
const p4Left = R => p4Kind(R).wares.some(w => p4OnMenu(R, w)) ? 999 : 0;
const p4IsOpenHour = (R, h) => h >= (R.open ?? 6) && h < (R.close ?? 21);
// how many customers a game minute at hour h (before luck): the kind's day, hours, weather, signboard, a sale, the prices on the menu
function p4ShopRate(R, key, h) {
  const K = p4Kind(R); if (!p4IsOpenHour(R, h)) return 0;
  const ws = K.wares.filter(w => p4Has(R, w)); if (!ws.length) return 0;
  const tw = K.wares.reduce((s, w) => s + w.w, 0), mw = ws.reduce((s, w) => s + w.w * c4PFlow(p4WRatio(R, w)), 0) / tw;   // a shorter menu or dear prices: fewer come
  const deco = 1 + (R.awn ? .05 : 0) + (R.lamp ? (K.t === 'den' ? .1 : .04) : 0) + (R.pots || 0) * .02 + (R.sk ? .03 : 0);
  return K.cust / 900 * P4_HOURS[K.hours](h) / P4_HOURS_NORM[K.hours] * ((K.wx || {})[p4Wx()] || 1) * p4SignK(R) * p4Harass() * Math.min(1.3, .45 + .55 * mw) * deco;
}
// a customer's order: one ware (by weight, cheaper is likelier) and how many
function p4PickWare(R) {
  const K = p4Kind(R), ws = K.wares.filter(w => p4Has(R, w)); if (!ws.length) return null;
  let t = 0; const wt = ws.map(w => (t += w.w * c4PFlow(p4WRatio(R, w)))); const r = Math.random() * t;
  return ws[wt.findIndex(v => v >= r)] || ws[0];
}
const p4WantN = (R, w) => Math.max(1, c4RandRound((1 + ((Math.random() * 3) | 0)) * c4PQty(p4WRatio(R, w)) * (w.p > 100 ? .5 : 1)));
// a sale: the money in, the cost of the goods out (the keeper buys them as they sell, as before the stocking days)
function p4ShopSell(R, key, w, n, treat) {
  const k = Math.max(0, Math.round(n)); if (k < 1) return { n: 0, got: 0 };
  const got = treat ? 0 : p4SalePrice(key, k * p4WPrice(R, w)), cost = k * w.c;
  SAVE4.money += got - cost; P4.today.take += got; P4.today.spent += cost;
  const T = P4.shopDay[key] || (P4.shopDay[key] = { n: 0, take: 0, cost: 0, by: {} }); T.n += k; T.take += got; T.cost += k * w.c; T.by = T.by || {}; T.by[w.id] = (T.by[w.id] || 0) + k;
  return { n: k, got };
}
// the morning: nothing to stock any more
function p4ShopMorning(R) { R.day = SAVE4.day; return 0; }

/* ---------- the street, live: customers come, the keeper serves ---------- */
p4ShopsUpdate = function (dt) {
  if (P4.phase !== 'open') return;
  const S = p4Shops(), h = P4.mins / 60, dm = dt * P4_MPS * (P4.mins >= 18 * 60 ? .4 : 1);
  for (const key in S) {
    const R = p4ShopFix(S[key]), K = p4Kind(R); p4ShopMorning(R);
    const C = R.cook || (R.cook = { t: 0, w: null, say: null }); if (C.say) { C.say.t += dt; if (C.say.t > C.say.life) C.say = null; }
    const Q = P4.FQ[key] || (P4.FQ[key] = []);
    if (R.shut || !p4IsOpenHour(R, h) || p4Left(R) < 1) { R.acc = 0; for (const w of Q) if (C.w !== w) { w.st = 'leave'; w.dir = 1; w.gone = true; } P4.FQ[key] = Q.filter(w => !w.gone); if (R.shut) { for (const w of Q) { w.st = 'leave'; w.dir = 1; } P4.FQ[key] = []; C.w = null; continue; } }
    else { R.acc = (R.acc || 0) + p4ShopRate(R, key, h) * dm; while (R.acc >= 1) { R.acc -= 1; p4FoodCustomer(+key, key); } }
    if (!C.w) { const w = (P4.FQ[key] || []).find(q => q.st === 'fq'); if (w) { C.w = w; C.t = K.serve / (1 + .6 * (R.help || 0)); } }
    else if ((C.t -= dt) <= 0) {
      const w = C.w, ware = K.wares.find(x => x.id === w.ware) || p4PickWare(R), r = ware ? p4ShopSell(R, key, ware, w.n, w.treat) : { n: 0, got: 0 };
      if (r.n > 0) { p4Served(w, key); if (Math.abs(+key - P4.camX - p4View().vw / 2) < p4View().vw) { AU.pluck(84 + (r.got % 5)); P4.fx.push({ x: +key, y: p4Y(.12) - 120, s: '+' + r.got, t: 0 }); if (Math.random() < .3) p4Say(C, p4Pick(K.t === 'an' ? ['Mời bác ngồi!', 'Nóng hổi đây!', 'Ăn ngon lại ghé nhé!'] : K.t === 'den' ? ['Đèn đẹp lắm bác ạ!', 'Thắp lên là sáng cả nhà!', 'Mua đôi cho đẹp!'] : ['Hàng tốt đây ạ!', 'Cảm ơn bác!', 'Lần sau lại ghé nhé!'])); } }
      else { p4Say(C, 'Hết ' + (ware ? ware.n.toLowerCase() : 'hàng') + ' rồi bác ơi!'); P4.today.lost++; }
      persist4(); const QQ = P4.FQ[key] || []; const i = QQ.indexOf(w); if (i >= 0) QQ.splice(i, 1); w.st = 'leave'; w.dir = Math.random() < .5 ? -1 : 1; C.w = null;
    }
    const QQ = P4.FQ[key] || [];
    QQ.forEach((w, i) => {
      const x = +key, tx = x + 36 + i * 30, tz = .3 + i * .03, dx = tx - w.x, dz = (tz - w.z) * 300, d = Math.hypot(dx, dz);
      w.moving = d > 3; if (w.moving) { const st = Math.min(d, 70 * dt); w.x += dx / d * st; w.z += dz / d * st / 300; w.ph += dt * 7; w.face = dx > 0 ? 1 : -1; } else { if (w.st !== 'fq' && w.ware) { const ww = K.wares.find(q => q.id === w.ware); if (ww && !w.say) p4Say(w, `Cho ${w.n} ${ww.u} ${ww.n.toLowerCase()}!`); } w.st = 'fq'; w.face = -1; }
      w.wait += dt; if (w.wait > 35 && C.w !== w) { w.st = 'leave'; w.dir = 1; w.gone = true; }
    });
    P4.FQ[key] = QQ.filter(w => !w.gone);
  }
  if ((P4.stkT = (P4.stkT || 0) + dt) > .5) { P4.stkT = 0; p4StockHud(); }
};
/* ---------- the stock of every shop of ours, out on the HUD (like the village's "Trầu 33  Chè 22") ---------- */
const P4_WSHORT = { 'Bánh bao nhân thịt': 'Nhân thịt', 'Bánh bao chay': 'Chay', 'Gà luộc nửa con': 'Gà luộc', 'Hoành thánh chiên': 'H.thánh chiên', 'Thang thuốc cảm': 'Thuốc cảm', 'Cao hổ cốt': 'Cao', 'Áo dài may sẵn': 'Áo dài', 'Đèn lồng tròn': 'Đèn tròn', 'Đèn kéo quân': 'Kéo quân', 'Cơm tấm sườn': 'Sườn' };
const p4KindTitle = n => n.toLowerCase().replace(/^./, c => c.toUpperCase());
function p4StockHud() {
  const el = $('#p4Stock'); if (!el || $('#p4hud').hidden) return;
  const S = p4Shops(), lines = [];
  for (const key of Object.keys(S).sort((a, b) => a - b)) {
    const R = p4ShopFix(S[key]); if (R.shut) continue;                       // a shut shop sells nothing: no need to stock it
    const ws = [];                                                           // the shops buy their goods themselves now: only the betel shows
    if (ws.length) lines.push(`<span class="w"><b>${p4Esc(p4KindTitle(R.food))}</b> ${ws.map(w => { const n = R.stock[w.id] || 0; return `<i class="${n < 1 ? 'out' : 'low'}">${P4_WSHORT[w.n] || w.n} ${n}</i>`; }).join(' · ')}</span>`);
  }
  const cap = p4StkFold(), open = lines.length > cap && p4StkOpen();
  const parts = (SAVE4B.house ? [`<span class="w"><b>Trầu</b> ${SAVE4B.stock}</span>`] : []).concat(open ? lines : lines.slice(0, cap));
  if (lines.length > cap) parts.push(`<button class="fold" data-stk="1">${open ? 'Thu gọn ▴' : `Xem thêm ${lines.length - cap} quán sắp hết ▾`}</button>`);
  const h = parts.join(''); if (el.innerHTML !== h) el.innerHTML = h;
  el.hidden = !parts.length;
}
// "nearly out": 5 or less, or a fifth of what is set to come each morning when that is more
const p4LowAt = (R, w) => Math.max(5, Math.round(.2 * (R.auto[w.id] || 0)));
const p4StkFold = () => innerWidth < 520 ? 4 : 6;                           // lines shown before "Xem thêm"
const p4StkOpen = () => { try { return localStorage.getItem('dcc_p4stk') === '1'; } catch (e) { return false; } };
addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#p4Stock [data-stk]'); if (!b) return;
  e.stopPropagation(); AU.tap(); try { localStorage.setItem('dcc_p4stk', p4StkOpen() ? '0' : '1'); } catch (er) {} p4StockHud();
}, true);
{ const f0 = p4Hud; p4Hud = function () { f0(); p4StockHud(); }; }
p4FoodCustomer = function (x, key, who, opt) {
  const R = p4Shops()[key]; if (!R) return; p4ShopFix(R);
  const ware = p4PickWare(R); if (!ware) return;
  const before = P4.walkers.length; p4Spawn(x + (Math.random() < .5 ? -1 : 1) * (240 + Math.random() * 200), who || p4PickResident());
  const w = P4.walkers[before]; if (!w) return;
  if (!who && p4HoldBack(p4People()[w.pid], key)) { P4.walkers.splice(before, 1); return; }
  Object.assign(w, { food: key, buy: false, st: 'fgo', ware: ware.id, n: (opt && opt.n) || p4WantN(R, ware), wait: 0, treat: !!(opt && opt.treat) });
  (P4.FQ[key] || (P4.FQ[key] = [])).push(w);
};
// while the player is in the village (dongho.js w4CatchTown): the same customers, reckoned for a stretch of the day
function p4ShopBg(R, key, from, to, k) {
  p4ShopFix(R); p4ShopMorning(R); if (R.shut) return 0;
  const T = P4.shopDay[key] || (P4.shopDay[key] = { n: 0, take: 0, cost: 0, by: {} });
  let cust = 0; for (let m = from; m < to; m += 5) cust += p4ShopRate(R, key, m / 60) * Math.min(5, to - m);
  const raw = cust * k + (T.frac || 0); let n = Math.floor(raw); T.frac = raw - n; let sold = 0;
  while (n-- > 0) { const w = p4PickWare(R); if (!w) break; sold += p4ShopSell(R, key, w, p4WantN(R, w), false).n; }
  return sold;
}
// the evening: wages, rent or tax when due, what does not keep is thrown away; the tally's lines
p4ShopsEvening = function () {
  const S = p4Shops(), out = [];
  for (const key in S) {
    const R = p4ShopFix(S[key]), K = p4Kind(R), T = P4.shopDay[key] || { n: 0, take: 0, cost: 0 }, wage = p4WageOf(R);
    SAVE4.money -= wage; P4.today.spent += wage;
    const waste = 0;
    let line = `<b>${p4Esc(R.name)}</b>: bán ${T.n} ${K.t === 'an' ? 'phần' : 'món'}, thu ${c4Money(T.take)}, vốn hàng đã bán ${c4Money(T.cost)}, công ${K.keeper} ${c4Money(wage)}` + (waste ? `, <span class="bad">bỏ đi ${c4Money(waste)} đồ không để qua đêm</span>` : '');
    if ((SAVE4B.day - R.since + 1) % 7 === 0) {
      const due = R.own === 'buy' ? p4TaxOf(R) : p4RentOf(R), what = R.own === 'buy' ? 'thuế nhà' : 'tiền thuê tuần tới';
      if (SAVE4.money >= due) { SAVE4.money -= due; P4.today.spent += due; line += `, <b>${what} ${c4Money(due)}</b>`; }
      else { delete S[key]; delete P4.FQ[key]; line += ` · <span class="bad">không đủ ${c4Money(due)} ${what}, chủ nhà lấy lại cửa hàng</span>`; }
    }
    out.push(`<p>${line}</p>`);
  }
  P4.shopDay = {}; persist4(); p4Persist();
  return out.join('');
};

/* ---------- the sheet: take it, or run it ---------- */
p4ShopTap = function (n) {
  const name = n[4], key = p4ShopKey(n[0]);
  if (!SAVE4B.house) { toast('Phải có nhà trên phố đã mới thuê được cửa hàng.', 2.6); return true; }
  if (!p4KindOfName(name) && !p4Shops()[key]) return false;
  P4.shopSel = { key, name }; p4ShopSheet(); return true;
};
const P4_SH_TAB = {};   // which part of a shop's sheet is open: hang | ban | trang
p4ShopSheet = function () {
  if (!SAVE4B.house) return;
  const { key, name } = P4.shopSel, R0 = p4Shops()[key], m = c4Money, purse = p4Purse();
  let h = '';
  if (!R0) {
    const K = p4KindOfName(name) || p4Kind(null), fake = { food: name };
    h = `<h3>${p4Esc(name)}</h3><p><b>${P4_TYPE_WORD[K.t]}</b> cho thuê. Có ${K.keeper} đứng quán (công ${m(K.wage)} một ngày). Bán:</p><ul class="p4wares">${K.wares.map(w => `<li>${w.n}: nhập ${m(w.c)}, bán chừng ${m(w.p)} một ${w.u}${w.keep === 'day' ? ' (không để qua đêm)' : ''}</li>`).join('')}</ul>`
      + `<p>Đông khách ${{ an: 'giờ ăn sáng, trưa, tối', sang: 'buổi sáng', chieu: 'buổi chiều', dem: 'buổi tối', deu: 'cả ngày' }[K.hours]}. Một ngày chừng ${K.cust} khách.</p>`
      + `<p>Tiền thuê <b>${m(p4RentOf(fake))}</b> một tuần, trả trước tuần đầu. Hoặc mua đứt <b>${m(p4BuyOf(fake))}</b>, rồi mỗi tuần đóng thuế nhà ${m(p4TaxOf(fake))}.</p><p>Trong túi: ${m(Math.round(purse))}</p>`
      + (K.t === 'den' && p4LampHeld() ? `<p class="bad">Nhà mình đã có hàng đèn ${p4Esc(p4LampHeld())} rồi. Mỗi nhà chỉ giữ một hàng đèn.</p>`
        : `<div class="row"><button class="btn" data-rent="1"${purse < p4RentOf(fake) ? ' disabled' : ''}>Thuê · ${m(p4RentOf(fake))}/tuần</button><button class="btn" data-buyshop="1"${purse < p4BuyOf(fake) ? ' disabled' : ''}>Mua đứt · ${m(p4BuyOf(fake))}</button></div>`);
    $('#p4shopB').innerHTML = h + `<div class="row"><button class="btn alt" data-shopx="1">Đóng</button></div>`;
    p4BackToList($('#p4shopB')); p4Sheets('p4shop'); return;
  }
  const R = p4ShopFix(R0), K = p4Kind(R), tab = P4_SH_TAB[key] || 'hang', left = 7 - ((SAVE4B.day - R.since) % 7), T = P4.shopDay[key] || { n: 0, take: 0 };
  h = `<h3>${p4Esc(R.name)}</h3><p>${P4_TYPE_WORD[K.t]} · ${R.own === 'buy' ? 'của mình' : 'thuê'}${R.shut ? ' · <span class="bad">đang đóng cửa</span>' : ''}</p><p>Hôm nay bán ${T.n}, thu ${m(T.take)} · trong túi ${m(Math.round(purse))}</p>`
    + `<div class="row p4tabs">${[['hang', 'Hàng và giá'], ['ban', 'Bán hàng'], ['trang', 'Trang trí']].map(([k, t]) => `<button class="btn ${tab === k ? '' : 'alt'}" data-tab="${k}">${t}</button>`).join('')}</div>`;
  if (tab === 'hang') {
    h += K.wares.map(w => { const on = p4OnMenu(R, w), st = R.stock[w.id] || 0, p = p4WPrice(R, w), r = p / w.p;
      return `<div class="p4ware${on ? '' : ' off'}"><h4>${w.n} <small>(${w.u}${w.keep === 'day' ? ', không để qua đêm' : ''})</small></h4>`
        + `<p>Vốn ${m(w.c)} một ${w.u}, ${K.keeper} tự mua khi bán ra</p>`
        + `<p>Giá bán <b>${m(p)}</b>${r < .85 ? ' · rẻ' : r > 1.25 ? ' · đắt' : ''}</p><div class="row"><button class="btn alt" data-pr="${w.id}" data-d="-1"${p <= Math.ceil(w.p * .4) ? ' disabled' : ''}>Giảm giá</button><button class="btn alt" data-pr="${w.id}" data-d="1"${p >= w.p * 3 ? ' disabled' : ''}>Tăng giá</button></div>`
        + `<div class="row"><button class="btn alt" data-menu="${w.id}">${on ? 'Cất, thôi bày bán' : 'Bày bán lại'}</button></div></div>`; }).join('')
      + '<p class="sm">Không phải nhập hàng: mỗi món bán ra, tiền vốn trừ vào túi.</p>';
  } else if (tab === 'ban') {
    h += `<div class="row"><button class="btn tem" data-game="1">${P4_GAME_WORD[K.game] || 'Tự tay bán'}</button></div>`
      + `<h4>Giờ mở cửa</h4><p>Từ <b>${R.open}:00</b> đến <b>${R.close}:00</b></p><div class="row"><button class="btn alt" data-hr="open" data-d="-1"${R.open <= 5 ? ' disabled' : ''}>Mở sớm hơn</button><button class="btn alt" data-hr="open" data-d="1"${R.open >= R.close - 3 ? ' disabled' : ''}>Mở muộn hơn</button></div>`
      + `<div class="row"><button class="btn alt" data-hr="close" data-d="-1"${R.close <= R.open + 3 ? ' disabled' : ''}>Đóng sớm hơn</button><button class="btn alt" data-hr="close" data-d="1"${R.close >= 23 ? ' disabled' : ''}>Đóng muộn hơn</button></div>`
      + `<h4>Người phụ</h4><p>${p4Cap1(K.keeper)} và <b>${R.help || 0}</b> người phụ: bán nhanh hơn, mỗi người thêm ${m(P4_DECO_PRICE.help)} công một ngày. Công cả quán: ${m(p4WageOf(R))} một ngày.</p><div class="row"><button class="btn alt" data-help="-1"${!(R.help > 0) ? ' disabled' : ''}>Bớt một người</button><button class="btn alt" data-help="1"${(R.help || 0) >= 2 ? ' disabled' : ''}>Thêm một người</button></div>`
      + `<div class="row"><button class="btn alt" data-shut="1">${R.shut ? 'Mở cửa lại' : 'Tạm đóng cửa quán'}</button></div>`
      + `<p>${R.own === 'buy' ? 'Thuế nhà ' + m(p4TaxOf(R)) : 'Tiền thuê ' + m(p4RentOf(R))} đóng sau ${left} ngày nữa (tối ngày ${p4DayNo() + left - 1}).</p>`
      + (R.own === 'buy' ? '' : `<div class="row"><button class="btn" data-buyshop="1"${purse < p4BuyOf(R) ? ' disabled' : ''}>Mua đứt · ${m(p4BuyOf(R))}</button><button class="btn alt" data-giveup="1">Trả lại cửa hàng</button></div>`);
  } else {
    const own = R.owned || (R.owned = {});
    h += `<h4>Biển hiệu</h4><div class="row"><button class="btn alt" data-shopname="1">Đổi tên: ${p4Esc(R.name)}</button></div>` + (R.sign ? '<p>Biển sơn son thếp vàng.</p>' : `<div class="row"><button class="btn" data-sign="1"${purse < P4_SIGN_PRICE ? ' disabled' : ''}>Biển sơn son thếp vàng · ${m(P4_SIGN_PRICE)} (+10% khách)</button></div>`)
      + `<h4>Mái hiên</h4><div class="row lkR">${P4_AWN.map(([k, t]) => `<button class="opt${(R.awn || '') === k ? ' on' : ''}" data-awn="${k}">${t}<small>${!k || own['awn:' + k] ? '' : m(P4_DECO_PRICE.awn)}</small></button>`).join('')}</div>`
      + `<h4>Đèn lồng trước cửa</h4><div class="row"><button class="btn alt" data-lamp="1">${R.lamp ? 'Gỡ đèn lồng' : 'Treo đèn lồng' + (own.lamp ? '' : ' · ' + m(P4_DECO_PRICE.lamp))}</button></div>`
      + `<h4>Chậu cây ở cửa</h4><p>${R.pots || 0} chậu</p><div class="row"><button class="btn alt" data-pot="-1"${!(R.pots > 0) ? ' disabled' : ''}>Bớt một chậu</button><button class="btn alt" data-pot="1"${(R.pots || 0) >= 2 ? ' disabled' : ''}>Thêm một chậu · ${m(P4_DECO_PRICE.pot)}</button></div>`
      + `<h4>Khăn trải quầy</h4><div class="row"><button class="btn alt" data-sk="1">${R.sk ? 'Cất khăn' : 'Trải khăn đỏ' + (own.sk ? '' : ' · ' + m(P4_DECO_PRICE.sk))}</button></div>`
      + '<p class="sm">Quán đẹp thì khách ghé nhiều hơn một chút.</p>';
  }
  $('#p4shopB').innerHTML = h + `<div class="row"><button class="btn alt" data-shopx="1">Đóng</button></div>`;
  p4BackToList($('#p4shopB'));
  { const rr = $('#p4shopB > .row:last-child'); if (rr && tab === 'ban') { rr.before(cnTxnBlock(key)); rr.before(p4SaleBlock(key, () => p4KeepScroll('p4shop', p4ShopSheet))); const tb = p4TreatBlock(key); rr.before(tb); p4Tabs('p4shop', $('#p4shopB'), tb, 'Quán'); } }
  p4Sheets('p4shop');
};
p4ShopClick = function (b) {
  const sel = P4.shopSel; if (!sel) return;
  const S = p4Shops(), R = S[sel.key], d = +b.dataset.d || 0, m = c4Money;
  if (b.dataset.shopx) { p4Sheets(null); return; }
  if (b.dataset.tab) { P4_SH_TAB[sel.key] = b.dataset.tab; AU.tap(); p4ShopSheet(); return; }
  if (!R && (b.dataset.rent || b.dataset.buyshop) && (p4KindOfName(sel.name) || {}).t === 'den' && p4LampHeld()) return;   // one lamp shop only
  if (b.dataset.rent && !R) { const fake = { food: sel.name }, c = p4RentOf(fake); if (p4Purse() < c) return; p4Spend(c); S[sel.key] = p4ShopFix({ food: sel.name, name: sel.name, own: 'rent', since: SAVE4B.day, sign: false, day: SAVE4.day }); toast(`Đã thuê ${sel.name}. Tuần đầu trả rồi. Bày bán thôi!`, 3); }
  else if (b.dataset.buyshop) { const fake = R || { food: sel.name }, c = p4BuyOf(fake); if (p4Purse() < c) return; p4Spend(c); S[sel.key] = p4ShopFix({ ...(R || { food: sel.name, name: sel.name, sign: false, day: SAVE4.day }), own: 'buy', since: SAVE4B.day }); toast(`Đã mua đứt ${S[sel.key].name}. Từ nay chỉ đóng thuế nhà mỗi tuần.`, 3); }
  else if (!R) return;
  else if (b.dataset.buy) { const w = p4Kind(R).wares.find(x => x.id === b.dataset.buy), q = +b.dataset.q, c = q * w.c; if (p4Purse() < c) { toast('Không đủ tiền nhập hàng.', 2); return; } p4Spend(c); R.stock[w.id] = (R.stock[w.id] || 0) + q; toast(`Nhập ${q} ${w.u} ${w.n.toLowerCase()}, tốn ${m(c)}.`, 2); }
  else if (b.dataset.pr) { const w = p4Kind(R).wares.find(x => x.id === b.dataset.pr), step = Math.max(1, Math.round(w.p * .05)); R.prices[w.id] = c4Clamp(p4WPrice(R, w) + d * step, Math.ceil(w.p * .4), w.p * 3); }
  else if (b.dataset.au) { R.auto[b.dataset.au] = Math.max(0, Math.min(120, (R.auto[b.dataset.au] || 0) + d)); }
  else if (b.dataset.menu) { const id = b.dataset.menu; R.menu[id] = !p4OnMenu(R, { id }); }
  else if (b.dataset.hr) { const k = b.dataset.hr; R[k] = Math.max(5, Math.min(23, R[k] + d)); }
  else if (b.dataset.help) { R.help = Math.max(0, Math.min(2, (R.help || 0) + +b.dataset.help)); }
  else if (b.dataset.sign && !R.sign && p4Purse() >= P4_SIGN_PRICE) { p4Spend(P4_SIGN_PRICE); R.sign = true; toast('Biển hiệu mới sơn son thếp vàng!', 2.4); }
  else if (b.dataset.shut) { R.shut = !R.shut; if (R.shut) { for (const w of P4.FQ[sel.key] || []) { w.st = 'leave'; w.dir = 1; } P4.FQ[sel.key] = []; if (R.cook) R.cook.w = null; } }
  else if (b.dataset.giveup && R.own === 'rent') { delete S[sel.key]; delete P4.FQ[sel.key]; toast(`Đã trả lại ${sel.name}.`, 2.4); p4Persist(); p4Hud(); AU.tap(); p4Sheets(null); return; }
  else if (b.dataset.shopname) { p4NameSheet(false, sel.key); return; }
  else if (b.dataset.game) { AU.tap(); if (typeof p4MiniStart === 'function') p4MiniStart(sel.key); return; }
  else if ('awn' in b.dataset || b.dataset.lamp || b.dataset.pot || b.dataset.sk) {
    const own = R.owned || (R.owned = {}), pay = (k, c) => { if (own[k]) return true; if (p4Purse() < c) { toast('Không đủ tiền.', 2); return false; } p4Spend(c); own[k] = 1; return true; };
    if ('awn' in b.dataset) { const k = b.dataset.awn; if (!k || pay('awn:' + k, P4_DECO_PRICE.awn)) R.awn = k; }
    else if (b.dataset.lamp) { if (R.lamp) R.lamp = false; else if (pay('lamp', P4_DECO_PRICE.lamp)) R.lamp = true; }
    else if (b.dataset.sk) { if (R.sk) R.sk = false; else if (pay('sk', P4_DECO_PRICE.sk)) R.sk = true; }
    else if (b.dataset.pot) { const dd = +b.dataset.pot; if (dd < 0) R.pots = Math.max(0, (R.pots || 0) - 1); else if (p4Purse() >= P4_DECO_PRICE.pot) { p4Spend(P4_DECO_PRICE.pot); R.pots = Math.min(2, (R.pots || 0) + 1); } else toast('Không đủ tiền.', 2); }
  }
  if (R && R.prices) R.price = R.prices[p4Kind(R).wares[0].id];
  p4Persist(); p4Hud(); AU.tap(); p4KeepScroll('p4shop', p4ShopSheet);
};

/* ---------- on the street: the counter with the goods, the keeper's words, and the dressing ---------- */
function p4ShopDress(g, hx, hy, s, R) {
  const w = 84;
  g.save(); g.translate(hx, hy); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  if (R.awn) {                                                              // an awning over the door, scalloped
    const c = P4_AWN_COL[R.awn]; for (let i = 0; i < 8; i++) { g.fillStyle = R.awn === 'stripe' && i % 2 ? '#f2ecde' : c; g.beginPath(); g.moveTo(-w + i * 21, -118); g.lineTo(-w + (i + 1) * 21, -118); g.lineTo(-w + (i + 1) * 21, -100); g.arc(-w + i * 21 + 10.5, -100, 10.5, 0, Math.PI); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = c; g.fillRect(-w - 4, -124, w * 2 + 8, 7); g.strokeRect(-w - 4, -124, w * 2 + 8, 7);
  }
  for (let i = 0; i < (R.pots || 0); i++) { const x = i ? w - 4 : -w + 4; g.fillStyle = '#9a4a2a'; g.beginPath(); g.moveTo(x - 12, -22); g.lineTo(x + 12, -22); g.lineTo(x + 8, 0); g.lineTo(x - 8, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#2f6a4c'; for (const [dx, dy, r] of [[0, -38, 13], [-9, -30, 9], [9, -30, 9]]) { g.beginPath(); g.arc(x + dx, dy, r, 0, 6.283); g.fill(); g.stroke(); } }
  g.restore();
  if (R.lamp) for (const x of [-w + 10, w - 10]) p4DrawLantern(g, hx + x * s, hy - 104 * s, s, '#c4473a', 10, Math.sin(P4.t * 1.6 + hx * .01 + x) * .15);
}
{ const front0 = p4TownFront;
  p4TownFront = function (g, hx, hy, s, v, label) {
    front0(g, hx, hy, s, v, label);
    const R = label !== 'home' ? p4ShopAt(hx) : null; if (R) p4ShopDress(g, hx, hy, s, R);
  }; }
// the counter of a shop we run, with the first goods on the menu set out, and a red cloth if bought
function p4ShopCounter(g, x, R) {
  const z = .09, s = p4S(z), y = p4Y(z), K = p4Kind(R), open = p4Left(R) > 0 && !R.shut;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  g.fillStyle = '#7a4a22'; g.fillRect(-56, -34, 112, 34); g.strokeRect(-56, -34, 112, 34);
  g.fillStyle = R.sk ? '#a3332a' : '#b57a22'; g.fillRect(-62, -42, 124, 9); g.strokeRect(-62, -42, 124, 9);
  if (R.sk) { g.fillStyle = '#e0b43a'; for (let i = -50; i <= 50; i += 20) { g.beginPath(); g.moveTo(i - 5, -33); g.lineTo(i + 5, -33); g.lineTo(i, -24); g.closePath(); g.fill(); } }
  if (open) { const col = { an: ['#f2ecde', '#e0b43a', '#9a4a2a'], hieu: ['#e8d8a8', '#c9a45a', '#5a7a4a'], den: ['#c4473a', '#e0b43a', '#f2ecde'] }[K.t];
    for (let i = 0; i < 5; i++) { g.fillStyle = col[i % 3]; g.beginPath(); if (K.t === 'den') { g.ellipse(-44 + i * 22, -52, 8, 10, 0, 0, 6.283); } else g.ellipse(-44 + i * 22, -46, 9, 5, 0, 0, 6.283); g.fill(); g.stroke(); } }
  g.restore();
}
