/* Chương IV · giá bán do người chơi tự đặt (owner 2026-10-27). Every stall (the village's, and the town's betel house and eating houses)
   sells at a price the player sets. THE RULES BELOW ARE NEVER SAID ANYWHERE: the player has to find them out from the whispers and
   from what the folk say.
   - A fair price: the plain price × the village's MOOD of the day (plan.gia, rolled a day ahead like the weather, drifting from day to day,
     now and then a shock: .72 hard times … 1.32 flush). r = price / fair price.
   - Demand D(r) (c4DemandD): 1 at the fair price, more the cheaper it is (r^-.7, up to 1.9), thin when dear (a cliff round r 1.3: .58 at 1.3,
     .17 at 1.6, never below .03). It splits into how many walk up (c4PFlow = D^.55) and how many each takes (c4PQty = D^.45, c4PriceN):
     dear still sells, but less and in ones. Cheap sells a lot at little profit; the profit peaks a little above the fair price.
   - Goodwill (c4PriceServed): a cheap price (r < .9) now and then makes the buyer take to the stall (a stranger counts towards knowing
     it, a known one likes it more); a very dear one (r > 1.35) now and then sours a known buyer (the tight-fisted most).
   - The mood is whispered (C4_NEWS kha / kho, true like the other whispers 72 %) and the buyers say things in passing.
   SAVE4.pr[g] = the village stall's price; SAVE4B.price the town's betel house; SAVE4B.shops[key].price an eating house. */

const c4Clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// when the village is flush (mood above ~1.08) a dearer price costs nothing up to 1 + .6 × how flush (owner: "khấm khá mà tăng giá thì cũng không sao")
const c4Flush = () => c4Clamp((c4GiaMood() - 1.08) / .14, 0, 1);
const c4DemandD = r => (r > 1 ? (r = 1 + Math.max(0, r - 1 - .6 * c4Flush())) : 0, r < 1 ? Math.min(1.9, Math.pow(r, -.7)) : Math.max(.03, (1 + Math.exp(6 * (1 - 1.3))) / (1 + Math.exp(6 * (r - 1.3)))));
const c4PFlow = r => Math.pow(c4DemandD(r), .55), c4PQty = r => Math.pow(c4DemandD(r), .45);
const c4GiaMood = () => ((SAVE4.plan && SAVE4.plan.gia) || 1) * (typeof c4Slump === 'function' && c4Slump() && !c4Slump().g ? .92 : 1);   // (a village-wide lean spell, which is announced, also tightens purses)
const c4RatioOf = (price, base) => price / (base * c4GiaMood());
const c4PRatio = g => c4RatioOf(c4Price(g), c4PriceBase(g));
const c4RandRound = q => { const f = Math.floor(q); return f + (R() < q - f ? 1 : 0); };
const c4PriceN = (n, g) => g ? Math.max(1, c4RandRound(n * c4PQty(c4PRatio(g)))) : n;
// the mood of a day (plan.gia): drifts from the day before, now and then a shock
{ const roll0 = c4Roll;
  c4Roll = function (day) {
    const o = roll0(day), prev = (SAVE4.plan && SAVE4.plan.gia) || 1;
    let g = 1 + (prev - 1) * .6 + (R() - .5) * .55; if (R() < .08) g += R() < .5 ? -.25 : .25;
    o.gia = Math.round(c4Clamp(g, .72, 1.32) * 100) / 100; return o;
  };
}
// the player's price: a step up or down, within what the stall's ware can bear (never a price of nothing, never more than three times the plain one)
const c4PriceRange = g => [Math.max(1, Math.round(c4PriceBase(g) * .4)), Math.round(c4PriceBase(g) * 3)];
const c4PriceSet = g => (SAVE4.pr && SAVE4.pr[g]) || c4PriceBase(g);
function c4SetPrice(g, d) { const [lo, hi] = c4PriceRange(g); (SAVE4.pr = SAVE4.pr || {})[g] = c4Clamp(c4PriceSet(g) + d, lo, hi); persist4(); }
// the stall sheet's block
function c4PriceBlock(g) {
  const d = document.createElement('div'), G = C4_GOODS[g]; d.className = 'hands autof priceB';
  const show = () => {
    const [lo, hi] = c4PriceRange(g), p = c4PriceSet(g);
    d.innerHTML = `<h4>Giá bán</h4><div class="row"><button class="btn alt" data-d="-1"${p <= lo ? ' disabled' : ''}>−</button><b class="pv">${c4Money(p)} một ${G.unit}</b><button class="btn alt" data-d="1"${p >= hi ? ' disabled' : ''}>+</button></div><p class="sm">Vốn ${c4Money(Math.round(c4Cost(g) * 10) / 10)} một ${G.unit}.</p>`;
  };
  d.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b || b.disabled) return; AU.tap(); c4SetPrice(g, +b.dataset.d); show(); });
  show(); return d;
}
// what a buyer says and does about the price (c4Served): cheap draws folk to the stall, very dear sours it
const C4_GIA_CHEAP = ['Rẻ thế này, cho thêm mấy cái!', 'Giá hạt dẻ, mua nhiều về dự trữ.', 'Quán này bán rẻ, lần sau còn ghé!', 'Rẻ quá, mua cho cả nhà.'];
const C4_GIA_DEAR = ['Đắt thế, thôi lấy ít thôi.', 'Hôm nay giá chát quá nhỉ?', 'Ôi, cô bán đắt thế!', 'Tiền đâu mà mua nhiều.'];
const C4_GIA_GOOD = ['Dạo này làm ăn khá, đắt chút cũng chẳng sao.', 'Được mùa mà, cô cứ lấy, tôi không tiếc.'];
const C4_GIA_HARD = ['Năm nay túng thiếu, phải đếm từng đồng.', 'Mất mùa rồi cô ơi, rau cháo qua ngày.'];
function c4PriceServed(w) {
  if (!w.shop || w.treat || w.guest || w.net !== undefined || SAVE4.day < C4_BOOK_DAY) return;
  const g = w.shop, r = c4PRatio(g), mood = c4GiaMood(), p = w.pid !== undefined ? c4People().list[w.pid] : null, f = p ? c4F(p.id) : null, T = p ? C4_TRAITS[p.trait] : null;
  if (r < .9 && f && R() < Math.min(.85, (.9 - r) * 2.4)) {
    if (f.k) c4Bump(p.id, 1 + Math.round((.9 - r) * 6)); else if (f.seen) f.v = (f.v || 0) + 1;
    if (R() < .25) c4Say(w, c4Pick(C4_GIA_CHEAP));
  } else if (r > 1.35 && f && f.k && c4Flush() < .5 && R() < .5) {
    c4Bump(p.id, -1 - ((T.half || 1) < 1 ? 1 : 0)); if (R() < .3) c4Say(w, c4Pick(C4_GIA_DEAR));
  } else if (R() < .05) c4Say(w, c4Pick(mood > 1.12 ? C4_GIA_GOOD : mood < .9 ? C4_GIA_HARD : r > 1.2 && c4Flush() < .5 ? C4_GIA_DEAR : C4_GIA_CHEAP));
}
{ const served0 = c4Served; c4Served = function (w) { c4PriceServed(w); return served0(w); }; }

/* ---------- the town ---------- */
const P4_BETEL_BASE = 8, c4TownRatio = (price, base) => c4RatioOf(price, base);
const p4BetelFlow = () => c4PFlow(c4TownRatio(SAVE4B.price, P4_BETEL_BASE)), p4BetelQty = () => c4PQty(c4TownRatio(SAVE4B.price, P4_BETEL_BASE));
const p4FoodPrice = R0 => (R0 && R0.price) || P4_FOOD.price;
const p4FoodFlow = R0 => c4PFlow(c4TownRatio(p4FoodPrice(R0), P4_FOOD.price)), p4FoodQty = R0 => c4PQty(c4TownRatio(p4FoodPrice(R0), P4_FOOD.price));
// the eating house's price on its sheet (a step of 5 đồng, from half to three times the plain price)
function p4FoodPriceBlock(R0) {
  const d = document.createElement('div'); d.className = 'hands autof priceB';
  const lo = Math.round(P4_FOOD.price * .5), hi = P4_FOOD.price * 3;
  const show = () => { const p = p4FoodPrice(R0); d.innerHTML = `<h4>Giá bán</h4><div class="row"><button class="btn alt" data-d="-5"${p <= lo ? ' disabled' : ''}>−</button><b class="pv">${c4Money(p)} một phần</b><button class="btn alt" data-d="5"${p >= hi ? ' disabled' : ''}>+</button></div><p class="sm">Vốn ${c4Money(P4_FOOD.cost)} một phần.</p>`; };
  d.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b || b.disabled) return; AU.tap(); R0.price = c4Clamp(p4FoodPrice(R0) + +b.dataset.d, lo, hi); p4Persist(); show(); });
  show(); return d;
}
// what a buyer says in the town about the price
function p4PriceServed(w, kind) {
  if (w.pid === undefined || w.pid === null || w.treat || w.net !== undefined) return;
  const R0 = kind === 'trau' || kind === 'home' ? null : p4Shops()[kind], r = R0 ? c4TownRatio(p4FoodPrice(R0), P4_FOOD.price) : c4TownRatio(SAVE4B.price, P4_BETEL_BASE);
  const p = p4People()[w.pid], T = C4_TRAITS[p.trait] || {}, f = p4F(p.id), mood = c4GiaMood();
  if (r < .9 && R() < Math.min(.85, (.9 - r) * 2.4)) {
    if (f.k) f.a = Math.min(100, f.a + 1 + Math.round((.9 - r) * 6)); else if (f.seen) f.v = (f.v || 0) + 1;
    if (R() < .25) p4Say(w, c4Pick(C4_GIA_CHEAP));
  } else if (r > 1.35 && f.k && c4Flush() < .5 && R() < .5) { f.a = Math.max(0, f.a - 1 - ((T.half || 1) < 1 ? 1 : 0)); if (R() < .3) p4Say(w, c4Pick(C4_GIA_DEAR)); }
  else if (R() < .05) p4Say(w, c4Pick(mood > 1.12 ? C4_GIA_GOOD : mood < .9 ? C4_GIA_HARD : r > 1.2 ? C4_GIA_DEAR : C4_GIA_CHEAP));
}
{ const served0 = p4Served; p4Served = function (w, kind) { p4PriceServed(w, kind); return served0(w, kind); }; }

/* ---------- the folk's feelings (owner 2026-10-27: "thi thoảng bà con có icon mặt cười, thoả mãn, hoặc buồn… người chơi dựa vào đó mà tăng hoặc giảm giá") ----------
   Now and then a passer-by shows a face over their head for a moment. It is the village's mood of the day (c4GiaMood) plus a little of
   their own: flush → 😄 😊 😌, middling → 🙂 😐, hard times → 😕 😟 😞 😢. Nothing says what the faces mean. */
const C4_FEEL = [[1.15, ['😄', '😊']], [1.04, ['😌', '😊']], [.93, ['🙂', '😐']], [.84, ['😕', '😟']], [0, ['😞', '😢']]];
function c4FeelAssign(w, t) {
  if (!w || w.kind && w.kind !== 'mouse' || R() > .4) return;
  const v = c4GiaMood() + (R() - .5) * .36, row = C4_FEEL.find(([lim]) => v >= lim)[1];
  w.feel = { icon: c4Pick(row), delay: .6 + R() * 4, start: null, shown: 0, last: null, dur: 3.4 };   // it counts from when the walker is first in view, and only while nothing is being said
}
// is this walker's face to be drawn now? q = how far through its showing (0…1), or -1
function c4FeelQ(w, t, inView, busy) {
  const f = w.feel; if (!f || f.shown >= f.dur) return -1;
  if (f.start === null) { if (!inView) return -1; f.start = t + f.delay; }
  if (t < f.start || t > f.start + 16) return -1;
  if (busy || !inView) { f.last = null; return -1; }
  f.shown += f.last === null ? 0 : Math.min(.1, Math.max(0, t - f.last)); f.last = t;
  return f.shown / f.dur;
}
function c4FeelDraw(g, icon, x, y, s, q) {
  const a = Math.min(1, q * 6, (1 - q) * 4), up = q * 10 * s, r = 17 * s;
  g.save(); g.globalAlpha = Math.max(0, a); g.fillStyle = '#fbf4dc'; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.arc(x, y - up, r, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 4 * s, y - up + r - 1); g.lineTo(x, y - up + r + 7 * s); g.lineTo(x + 5 * s, y - up + r - 2); g.closePath(); g.fillStyle = '#fbf4dc'; g.fill(); g.stroke();
  g.font = `${Math.round(22 * s)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText(icon, x, y - up + 1); g.restore();
}
// a face never shows where a speech bubble is (the walker's own, a chat, a seller calling out): it waits, or is dropped
const c4FeelBusy = (w, list, s) => w.say || w.chat || w.st === 'chat' || list.some(o => o !== w && (o.say || o.st === 'chat') && Math.abs(o.x - w.x) < 190 * s);
{ const spawn0 = c4Spawn; c4Spawn = function (...a) { const n = C4.walkers.length; spawn0(...a); for (let i = n; i < C4.walkers.length; i++) c4FeelAssign(C4.walkers[i], C4.t); }; }
{ const spawn0 = p4Spawn; p4Spawn = function (...a) { const n = P4.walkers.length; spawn0(...a); for (let i = n; i < P4.walkers.length; i++) c4FeelAssign(P4.walkers[i], P4.t); }; }
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) {
    fx0(items, g, vis);
    const talkers = [...C4.walkers, ...(C4.vendors || []), C4.porter, C4.wife].filter(o => o && (o.say || o.st === 'chat'));
    for (const w of C4.walkers) { if (!w.feel) continue;
      const q = c4FeelQ(w, C4.t, vis(w.x, 80), c4FeelBusy(w, talkers, c4S(w.z))); if (q < 0) continue;
      const f = w.feel, tall = C4_TALL.mouse * C4_CROWD * .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .68 : 1), s = c4S(w.z);
      items.push({ z: w.z + .002, f: () => c4FeelDraw(g, f.icon, w.x, c4Y(w.z) - tall * s - 30 * s, s, q) }); }
  }; }
{ const br0 = p4TownBridgeItems;
  p4TownBridgeItems = function (items, g, vis) {
    br0(items, g, vis);
    const talkers = [...P4.walkers, ...(P4.sellers || []), ...(P4.townBoats || [])].filter(o => o && (o.say || o.st === 'chat'));
    for (const w of P4.walkers) { if (!w.feel) continue;
      const q = c4FeelQ(w, P4.t, vis(w.x, 80), c4FeelBusy(w, talkers, p4S(w.z))); if (q < 0) continue;
      const f = w.feel, tall = P4_TALL * P4_CROWD * .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .7 : 1), s = p4S(w.z);
      items.push({ z: w.z + .002, f: () => c4FeelDraw(g, f.icon, w.x, p4Y(w.z) - p4TownLift(w.x) - tall * s - 30 * s, s, q) }); }
  }; }
