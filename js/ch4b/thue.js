/* Chương IV phần 2 · Phố Huyện: renting and buying the street's eating houses, and the fine signboard (owner, 2026-10-15).
   - Any eating house along the street can be rented: P4_RENT_WEEK a week (10 % of a house's price), the first week paid at once; it sells
     its own dish, cooked to order by a cook who comes with it (wage each evening), and can be renamed.
   - With 500 quan it can be bought outright: no more rent, but the house tax, P4_TAX_WEEK a week (3 % of the price).
   - Rent or tax is due every 7 days from the day it was taken; if the purse cannot pay, the house is taken back.
   - A fine signboard (P4_SIGN_PRICE) on any of the couple's shops brings 10 % more customers to it.
   Balance (owner: the food must pay the week's rent and leave 20 % of it over): a rented eating house's week, after ingredients and
   the cook, nets about 1.2 × the rent. Daily target (P4_RENT_WEEK × 1.2 / 7 + wage) / margin ≈ 150 dishes ≈ 60 customers of 1–4
   dishes, spread over the day with peaks at breakfast, lunch and dinner (P4_MEALS). Checked by a week's run in the browser. */
const P4_RENT_WEEK = P4_HOUSE_PRICE * .10, P4_TAX_WEEK = P4_HOUSE_PRICE * .03, P4_SIGN_PRICE = 5 * 600;
const P4_FOOD = { price: 60, cost: 24, wage: 300, serve: 1.6 };            // a dish: sold for, costs; the cook's wage a day; seconds a customer
const P4_FOOD_CUST = 62;                                                   // customers a day for an eating house (before the signboard)
// how busy an eating house is through the day (mean 1 over 6:00–21:00): breakfast, lunch, dinner
const P4_MEALS = h => h < 6 ? 0 : h < 9 ? 1.5 : h < 11 ? .6 : h < 13.5 ? 1.6 : h < 17 ? .5 : h < 21 ? 1.25 : 0;
const P4_MEAL_NORM = (() => { let s = 0; for (let m = 360; m < 1260; m++) s += P4_MEALS(m / 60); return s / 900; })();
const p4Shops = () => SAVE4B.shops || (SAVE4B.shops = {});
const p4ShopKey = x => String(Math.round(x));
const p4ShopAt = x => p4Shops()[p4ShopKey(x)] || null;
const p4IsFood = name => P4_FOOD_NAMES.includes(name);
const p4SignK = s => (s && s.sign ? 1.1 : 1);                             // a fine signboard: 10 % more customers
// customers come to each of our eating houses at their own pace (whether it is on the screen or not), walk up and queue at its door
function p4ShopsUpdate(dt) {
  if (P4.phase !== 'open') return;
  const S = p4Shops(), h = P4.mins / 60, dm = dt * P4_MPS * (P4.mins >= 18 * 60 ? .4 : 1);   // game minutes this frame
  for (const key in S) {
    const R = S[key]; if (R.shut) { R.acc = 0; for (const w of P4.FQ[key] || []) { w.st = 'leave'; w.dir = 1; } P4.FQ[key] = []; if (R.cook) R.cook.w = null; continue; }   // shut for a while: nobody comes, those waiting go home
    const x = +key, rate = P4_FOOD_CUST / 900 * P4_MEALS(h) / P4_MEAL_NORM * p4SignK(R) * p4Harass() * p4FoodFlow(R);   // customers a game minute (a sale's extra regulars come by khachquen.js)
    R.acc = (R.acc || 0) + rate * dm;
    while (R.acc >= 1) { R.acc -= 1; p4FoodCustomer(x, key); }
    // the cook serves the first in the queue
    const Q = P4.FQ[key] || (P4.FQ[key] = []);
    R.cook = R.cook || { t: 0, w: null, say: null };
    const C = R.cook;
    if (C.say) { C.say.t += dt; if (C.say.t > C.say.life) C.say = null; }
    if (!C.w) { const w = Q.find(q => q.st === 'fq'); if (w) { C.w = w; C.t = P4_FOOD.serve; } }
    else if ((C.t -= dt) <= 0) {
      const w = C.w, got = w.treat ? 0 : p4SalePrice(key, w.n * p4FoodPrice(R)), cost = w.n * P4_FOOD.cost; p4Served(w, key);
      SAVE4.money += got - cost; P4.today.take += got; P4.today.spent += cost; persist4();
      const T = P4.shopDay[key] || (P4.shopDay[key] = { n: 0, take: 0, cost: 0 }); T.n += w.n; T.take += got; T.cost += cost;
      if (Math.abs(x - P4.camX - p4View().vw / 2) < p4View().vw) { P4.fx.push({ x, y: p4Y(.12) - 120, s: '+' + (got - cost), t: 0 }); if (Math.random() < .3) p4Say(C, p4Pick(['Mời bác ngồi!', 'Nóng hổi đây!', 'Ăn ngon lại ghé nhé!'])); }
      Q.splice(Q.indexOf(w), 1); w.st = 'leave'; w.dir = Math.random() < .5 ? -1 : 1; C.w = null;
    }
    // queue places: walk up, wait, give up after a while
    Q.forEach((w, i) => {
      const tx = x + 36 + i * 30, tz = .3 + i * .03, dx = tx - w.x, dz = (tz - w.z) * 300, d = Math.hypot(dx, dz);
      w.moving = d > 3; if (w.moving) { const st = Math.min(d, 70 * dt); w.x += dx / d * st; w.z += dz / d * st / 300; w.ph += dt * 7; w.face = dx > 0 ? 1 : -1; } else { w.st = 'fq'; w.face = -1; }
      w.wait += dt; if (w.wait > 35 && C.w !== w) { w.st = 'leave'; w.dir = 1; w.gone = true; }
    });
    P4.FQ[key] = Q.filter(w => !w.gone);
  }
}
function p4FoodCustomer(x, key, who, opt) {
  const before = P4.walkers.length; p4Spawn(x + (Math.random() < .5 ? -1 : 1) * (240 + Math.random() * 200), who || p4PickResident());
  const w = P4.walkers[before]; if (!w) return;
  if (!who && p4HoldBack(p4People()[w.pid], key)) { P4.walkers.splice(before, 1); return; }   // a regular used to sales waits for the next one (khachquen.js)
  Object.assign(w, { food: key, buy: false, st: 'fgo', n: (opt && opt.n) || Math.max(1, c4RandRound((1 + ((Math.random() * 4) | 0)) * p4FoodQty(p4Shops()[key]))), wait: 0, treat: !!(opt && opt.treat) });
  (P4.FQ[key] || (P4.FQ[key] = [])).push(w);
}
// the evening: rent or tax when due, the cooks' wages; the tally's lines
function p4ShopsEvening() {
  const S = p4Shops(), out = [];
  for (const key in S) {
    const R = S[key], T = P4.shopDay[key] || { n: 0, take: 0, cost: 0 };
    SAVE4.money -= P4_FOOD.wage; P4.today.spent += P4_FOOD.wage;
    let line = `<b>${p4Esc(R.name)}</b>: ${T.n} bát/đĩa, thu ${c4Money(T.take)}, nguyên liệu ${c4Money(T.cost)}, công bếp ${c4Money(P4_FOOD.wage)}`;
    if ((SAVE4B.day - R.since + 1) % 7 === 0) {                            // a week is up
      const due = R.own === 'buy' ? P4_TAX_WEEK : P4_RENT_WEEK, what = R.own === 'buy' ? 'thuế nhà' : 'tiền thuê tuần tới';
      if (SAVE4.money >= due) { SAVE4.money -= due; P4.today.spent += due; line += `, <b>${what} ${c4Money(due)}</b>`; }
      else { delete S[key]; delete P4.FQ[key]; line += ` · <span class="bad">không đủ ${c4Money(due)} ${what}, chủ nhà lấy lại cửa hàng</span>`; }
    }
    out.push(`<p>${line}</p>`);
  }
  P4.shopDay = {}; persist4(); p4Persist();
  return out.join('');
}
// the sheet of an eating house along the street: rent it, buy it, or (when ours) its week, the signboard, the name, buy it out, give it up
function p4ShopTap(n) {
  const name = n[4], key = p4ShopKey(n[0]);
  if (!SAVE4B.house) { toast('Phải có nhà trên phố đã mới thuê được cửa hàng.', 2.6); return true; }
  if (!p4IsFood(name) && !p4Shops()[key]) return false;                    // only eating houses are let
  P4.shopSel = { key, name }; p4ShopSheet(); return true;
}
function p4ShopSheet() {
  if (!SAVE4B.house) return;
  const { key, name } = P4.shopSel, R = p4Shops()[key], m = c4Money, purse = p4Purse();
  let h = '';
  if (!R) {
    h = `<h3>${p4Esc(name)}</h3><p>Quán ăn này cho thuê. Thuê thì bán món của quán, có đầu bếp nấu sẵn (công ${m(P4_FOOD.wage)} một ngày).</p>`
      + `<p>Mỗi bát/đĩa bán ${m(P4_FOOD.price)}, tốn ${m(P4_FOOD.cost)} nguyên liệu. Một ngày chừng ${P4_FOOD_CUST} khách, đông nhất buổi sáng, trưa và tối.</p>`
      + `<p>Tiền thuê <b>${m(P4_RENT_WEEK)}</b> một tuần, trả trước tuần đầu. Hoặc mua đứt <b>${m(P4_HOUSE_PRICE)}</b>, rồi mỗi tuần đóng thuế nhà ${m(P4_TAX_WEEK)}.</p><p>Trong túi: ${m(Math.round(purse))}</p>`
      + `<div class="row"><button class="btn" data-rent="1"${purse < P4_RENT_WEEK ? ' disabled' : ''}>Thuê · ${m(P4_RENT_WEEK)}/tuần</button><button class="btn" data-buyshop="1"${purse < P4_HOUSE_PRICE ? ' disabled' : ''}>Mua đứt · ${m(P4_HOUSE_PRICE)}</button></div>`;
  } else {
    const left = 7 - ((SAVE4B.day - R.since) % 7), T = P4.shopDay[key] || { n: 0, take: 0, cost: 0 };
    h = `<h3>${p4Esc(R.name)}</h3><p>${R.own === 'buy' ? 'Cửa hàng của mình' : 'Cửa hàng thuê'} · bán ${p4Esc(R.food.toLowerCase())}${R.sign ? ' · biển hiệu đẹp' : ''}</p>`
      + `<p>Hôm nay: ${T.n} bát/đĩa, thu ${m(T.take)}</p><p>${R.own === 'buy' ? 'Thuế nhà ' + m(P4_TAX_WEEK) : 'Tiền thuê ' + m(P4_RENT_WEEK)} đóng sau ${left} ngày nữa (tối ngày ${p4DayNo() + left - 1}).</p>`
      + `<div class="row">` + (R.sign ? '' : `<button class="btn" data-sign="1"${purse < P4_SIGN_PRICE ? ' disabled' : ''}>Làm biển hiệu đẹp · ${m(P4_SIGN_PRICE)} (+10% khách)</button>`)
      + `<button class="btn alt" data-shopname="1">Đổi tên</button></div>`
      + `<div class="row"><button class="btn alt" data-shut="1">${R.shut ? 'Mở cửa lại' : 'Tạm đóng cửa quán'}</button></div>` + (R.shut ? '<p class="sm">Quán đang đóng: khách không ghé nữa.</p>' : '')
      + (R.own === 'buy' ? '' : `<div class="row"><button class="btn" data-buyshop="1"${purse < P4_HOUSE_PRICE ? ' disabled' : ''}>Mua đứt · ${m(P4_HOUSE_PRICE)}</button><button class="btn alt" data-giveup="1">Trả lại cửa hàng</button></div>`);
  }
  $('#p4shopB').innerHTML = h + `<div class="row"><button class="btn alt" data-shopx="1">Đóng</button></div>`;
  { const rr = $('#p4shopB > .row:last-child'); if (R && rr) { rr.before(p4FoodPriceBlock(R)); rr.before(p4SaleBlock(key, () => p4KeepScroll('p4shop', p4ShopSheet))); const tb = p4TreatBlock(key); rr.before(tb); p4Tabs('p4shop', $('#p4shopB'), tb, 'Quán'); } }   // a sale and the Mời khách tab at a shop we run (giamgia.js, khachquen.js)
  p4Sheets('p4shop');
}
function p4ShopClick(b) {
  const sel = P4.shopSel; if (!sel) return;
  const S = p4Shops(), R = S[sel.key];
  if (b.dataset.shopx) { p4Sheets(null); return; }
  if (b.dataset.rent && !R && p4Purse() >= P4_RENT_WEEK) {
    p4Spend(P4_RENT_WEEK); S[sel.key] = { food: sel.name, name: sel.name, own: 'rent', since: SAVE4B.day, sign: false };
    toast(`Đã thuê ${sel.name}. Tuần đầu trả rồi.`, 2.6);
  } else if (b.dataset.buyshop && p4Purse() >= P4_HOUSE_PRICE) {
    p4Spend(P4_HOUSE_PRICE); S[sel.key] = { ...(R || { food: sel.name, name: sel.name, sign: false }), own: 'buy', since: SAVE4B.day };
    toast(`Đã mua đứt ${S[sel.key].name}. Từ nay chỉ đóng thuế nhà mỗi tuần.`, 3);
  } else if (b.dataset.sign && R && !R.sign && p4Purse() >= P4_SIGN_PRICE) { p4Spend(P4_SIGN_PRICE); R.sign = true; toast('Biển hiệu mới sơn son thếp vàng!', 2.4); }
  else if (b.dataset.shut && R) { R.shut = !R.shut; if (R.shut) { for (const w of P4.FQ[sel.key] || []) { w.st = 'leave'; w.dir = 1; } P4.FQ[sel.key] = []; if (R.cook) R.cook.w = null; } }
  else if (b.dataset.giveup && R && R.own === 'rent') { delete S[sel.key]; delete P4.FQ[sel.key]; toast(`Đã trả lại ${sel.name}.`, 2.4); }
  else if (b.dataset.shopname && R) { p4NameSheet(false, sel.key); return; }
  p4Persist(); p4Hud(); AU.tap(); p4ShopSheet();
}
// the fine signboard: red lacquer with a gold double border, the name in gold (drawn over the house's plain board)
function p4FineBoard(g, hx, hy, s, txt) {
  g.save(); g.translate(hx, hy); g.scale(s, s);
  g.fillStyle = '#8f1f18'; g.strokeStyle = '#e2b43c'; g.lineWidth = 3; g.beginPath(); g.rect(-52, -150, 104, 30); g.fill(); g.stroke();
  g.strokeStyle = '#f2c640'; g.lineWidth = 1; g.strokeRect(-47, -146, 94, 22);
  g.fillStyle = '#e2b43c'; for (const x of [-52, 52]) { g.beginPath(); g.arc(x, -135, 4, 0, 6.283); g.fill(); }
  g.fillStyle = '#ffd86a'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 13; g.font = '900 13px "Playfair Display", serif';
  while (fs > 6 && g.measureText(txt).width > 88) { fs--; g.font = '900 ' + fs + 'px "Playfair Display", serif'; } g.fillText(txt, 0, -134);
  g.restore();
}
{
  const d = document.createElement('div'); d.id = 'p4shop'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><div id="p4shopB"></div></div>'; document.body.appendChild(d);
  $('#p4shopB').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) p4ShopClick(b); });
}
