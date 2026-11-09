/* Chương IV phần 2 · Phố Huyện: the town's side of the approved economy (owner, 2026-11-09; numbers in cuahang.js P4_ECON, the buyers' minds in
   js/ch4/tamly.js). Here:
   - p4Mishaps: what goes wrong now and then, paid in the evening: an eating house throws food away on a wet or quiet day (5–10 % of the day's
     goods), the potter breaks a few pieces, the draper's cloth mildews in the rain (1–3 % of the takings), a thief takes one dear piece from the
     goldsmith or the draper when nobody helps at the counter (3 % of days), a bought house needs mending (about once a month, 1–2 % of its price).
   - Tiredness: a counter busy more than 90 % of a game hour wears its keeper out (R.tir: slower serving, cuahang.js p4ServeK); 4 such hours make a
     hard day, 3 hard days running and the workers complain and run off twice as readily (doicong.js); a night's sleep rests them.
   - The reference prices (tamly.js a) of every ware and of the betel house move each evening; a queue draws people (p4QueueK, over 6 they turn
     away); a known buyer served within 8 s likes the house a little more, one who gives up waiting likes it less (g); a greedy raise on a hard day
     sours known buyers (b); the calendar (h) and the lunar date on the clock. */
const p4CalTag = R => (R.food === 'TRÀ SEN' || p4Kind(R).t === 'den') ? 'le' : '';
const p4QueueK = key => { const n = ((P4.FQ || {})[key] || []).length; return n >= 2 && n <= 6 ? 1 + Math.min(.2, .07 * (n - 1)) : 1; };
function p4Mishaps(R, key, T) {
  const K = p4Kind(R), out = { cost: 0, text: '' }, rnd = Math.random, wet = p4Wx() === 'mua';
  const add = (c, t) => { c = Math.round(c); if (c > 0) { out.cost += c; out.text += `, <span class="bad">${t} ${c4Money(c)}</span>`; } };
  if (K.t === 'an' && T.cost > 0) {
    const avg = (R.nh || []).length >= 3 ? R.nh.reduce((a, b) => a + b, 0) / R.nh.length : 0;
    if (wet || (avg && T.n < .6 * avg)) add((.05 + .05 * rnd()) * T.cost, 'đồ ăn ế phải bỏ');
  }
  if (R.food === 'HÀNG GỐM' && T.take > 0 && rnd() < .25) add((.01 + .02 * rnd()) * T.take, 'vỡ mấy món gốm');
  if (R.food === 'TIỆM VẢI' && wet && T.take > 0 && rnd() < .4) add((.01 + .02 * rnd()) * T.take, 'vải ẩm mốc');
  if ((R.food === 'TIỆM VÀNG' || R.food === 'TIỆM VẢI') && !p4ShopHands(R).length && T.n > 0 && rnd() < .03) {
    const w = K.wares.reduce((a, b) => (b.c > a.c ? b : a)); add(w.c, `kẻ gian lẻn lấy mất một ${w.u} ${w.n.toLowerCase()}`);
  }
  if (R.own === 'buy' && rnd() < 1 / 30) add((.01 + .01 * rnd()) * p4BuyOf(R), rnd() < .5 ? 'mái dột phải lợp lại' : 'cột kèo mục phải thay');
  return out;
}
// the busy time of the counter, a game hour at a time (60 / P4_MPS real seconds)
function p4TireTick(R, dt, busy) {
  R.bt = (R.bt || 0) + dt; if (busy) R.bz = (R.bz || 0) + dt;
  if (R.bt >= 60 / P4_MPS) {
    if (R.bz / R.bt > .9) { R.tir = Math.min(1, (R.tir || 0) + .15); R.hotH = (R.hotH || 0) + 1; } else R.tir = Math.max(0, (R.tir || 0) - .1);
    R.bt = 0; R.bz = 0;
  }
}
function p4TireEvening(R) { R.hot = (R.hotH || 0) >= 4 ? (R.hot || 0) + 1 : 0; R.hotH = 0; R.tir = 0; R.bt = 0; R.bz = 0; }
const p4Tired = R => (R.hot || 0) >= 3;
function p4RefDrift(R) { const K = p4Kind(R), ref = R.ref = R.ref || {}; for (const w of K.wares) ref[w.id] = Math.round(c4RefStep(ref[w.id], p4WPrice(R, w)) * 100) / 100; }
// the evening: the betel house's reference price too, and a tired shop says so
{ const ev0 = p4ShopsEvening;
  p4ShopsEvening = function () {
    if (SAVE4B && SAVE4B.house && SAVE4B.price) SAVE4B.ref = Math.round(c4RefStep(SAVE4B.ref, SAVE4B.price) * 100) / 100;
    const tired = []; const S = p4Shops();
    let h = ev0.apply(this, arguments);
    for (const k in S) if (p4Tired(S[k])) tired.push(S[k].name);
    if (tired.length) h += `<p class="bad">Người làm ở ${tired.map(p4Esc).join(', ')} than mệt: mấy hôm liền khách đông quá, làm không xuể.</p>`;
    return h;
  }; }
// (e) over six waiting, newcomers turn away
{ const fc0 = p4FoodCustomer;
  p4FoodCustomer = function (x, key, who, opt) { if (!who && ((P4.FQ || {})[key] || []).length > 6) return; return fc0.apply(this, arguments); }; }
// (g) served quickly, (b) a greedy price on a hard day
{ const served0 = p4Served;
  p4Served = function (w, kind) {
    if (w.pid !== undefined && w.pid !== null && !w.treat && w.net === undefined) {
      const p = p4People()[w.pid], f = p ? p4F(p.id) : null;
      if (f && f.k) {
        if ((w.wait || 0) < 8) f.a = Math.min(100, (f.a || 0) + 1);
        const R0 = kind === 'trau' || kind === 'home' ? null : p4Shops()[kind], ware = R0 && p4Kind(R0).wares.find(x => x.id === w.ware);
        const gouge = R0 ? ware && c4Gouging(p4WPrice(R0, ware), (R0.ref || {})[ware.id]) : c4Gouging(SAVE4B.price, SAVE4B.ref);
        if (gouge) { f.a = Math.max(0, f.a - 2); if (Math.random() < .25) p4Say(w, c4Pick(C4_GOUGE_SAY)); }
      }
    }
    return served0(w, kind);
  }; }
// a known buyer who gives up waiting (cuahang.js queue)
function p4Walkout(w) { if (w.pid === undefined || w.pid === null || w.treat) return; const f = SAVE4B.folk && SAVE4B.folk[w.pid]; if (f && f.k) f.a = Math.max(0, (f.a || 0) - 3); }
// the lunar date on the town's clock
{ const t0 = p4HudTime; p4HudTime = function () { t0.apply(this, arguments); const el = $('#p4Time'); if (el) el.textContent = el.textContent.replace(/^Ngày \d+/, m => `${m} · ${c4LunarText()}`); }; }
