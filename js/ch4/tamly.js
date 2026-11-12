/* Chương IV · how buyers think, the village and the town alike (owner, 2026-11-09, approved proposal "kinh tế": "làm cho cả huyện và quê").
   NONE OF THIS IS EVER SAID IN THE GAME: the player sees it only in what the buyers say, the whispers and the evening's money.
   (a) A price they are used to: each ware remembers a reference price (village SAVE4.ref[g], town R.ref[ware], the betel house SAVE4B.ref) that moves
       a fifth of the way to the price asked each evening. Above it a price feels dearer than it is (×(1 + .5 × the rise)), below it only a little
       cheaper (×(1 − .2 × the cut)): raising a price slowly loses fewer buyers than one big step.
   (b) Fair or not: raising the price (5 % over the reference) on a hard day (the village mood < .9) or on the village's festival day sours known
       buyers (−2 liking, now and then "chặt chém") and the next day a few fewer come (×.92).
   (c) Staples and luxuries: the mood of the day moves staples hardly at all and luxuries a lot (c4CatMood by the trade's kind).
   (d) Too cheap looks fake (trade shops and the goldsmith, cuahang.js p4Fake).
   (e) A queue draws people: 2–4 waiting brings up to 20 % more (village c4Want, town p4QueueK); over 6 the newcomers turn away.
   (f) A dear ware on the menu makes the middle ones look cheap (cuahang.js p4Anchor).
   (g) Habit: a known buyer served quickly likes the house a little more, one who gives up waiting likes it less (town; the village has its own).
   (h) The calendar: a lunar date (c4Lunar: day 1 of the game = mồng 1 tháng Ba): on the 1st and the 15th offerings sell more (betel, fruit,
       chicken, lotus tea, lamps ×1.3); in tháng Chạp everything ×1.2; in tháng Giêng the goldsmith ×.7. The date shows on the morning sheet
       and the town's clock.
   Tết bonus: from mồng 1 to mồng 5 tháng Giêng the morning sheet offers to give every hired hand a month's pay; given, they hardly ever run off
   that year (c4RunChance × .15). */
const C4_LUNAR0 = 60;
const C4_MONTHS = ['Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];
function c4Lunar(day) { const L = (day === undefined ? SAVE4.day : day) - 1 + C4_LUNAR0; return { d: L % 30 + 1, m: Math.floor(L / 30) % 12 + 1, y: Math.floor(L / 360) }; }
function c4LunarText(day) { const { d, m } = c4Lunar(day); return `${d === 15 ? 'rằm' : d <= 10 ? 'mồng ' + d : 'ngày ' + d} tháng ${C4_MONTHS[m - 1]}`; }
// (a) the reference price
const c4RefK = (p, ref) => !(ref > 0) ? 1 : p > ref ? 1 + .5 * (p / ref - 1) : 1 - .2 * (1 - p / ref);
const c4RefStep = (ref, p) => !(ref > 0) ? p : ref + (p - ref) / 5;
// (c) the mood by the trade: an eating house .6, staples .3, trade shops 1.5, lamps 2, the goldsmith 4 × the town's mood swing
const C4_CAT_SWING = { ty: .3, an: .6, cd: 1.5, mv: 2, xx: 4 };
const c4CatMood = cat => c4Clamp(1 + (C4_CAT_SWING[cat] || .6) * (c4TownMood() - 1), .5, 1.5);
// (h) the calendar: tag 'le' = a ware for offerings
function c4CalK(cat, tag) { const { d, m } = c4Lunar(); let k = 1; if (tag === 'le' && (d === 1 || d === 15)) k *= 1.3; if (m === 12) k *= 1.2; if (m === 1 && cat === 'xx') k *= .7; return k; }
// (b) a hard day, when a raise looks greedy
const c4HardDay = () => c4GiaMood() < .9 || !!(SAVE4.plan && SAVE4.plan.hoi);
const c4Gouging = (p, ref) => ref > 0 && p > ref * 1.05 && c4HardDay();
const C4_GOUGE_SAY = ['Ngày khó thế này mà tăng giá, chặt chém quá!', 'Nhân lúc người ta túng mà bán đắt à?', 'Lên giá đúng lúc này, chẳng có lương tâm.', 'Quán này chặt chém, lần sau thôi.'];

/* ---------- the village ---------- */
// what each ware is: staples, eating, trade; which are offerings
const C4_GCAT = { trau: 'ty', che: 'an', xoi: 'an', bun: 'an', banhcuon: 'an', ruou: 'cd', xen: 'cd', gom: 'cd', thuoc: 'ty', thit: 'ty', gao: 'ty', rau: 'ty', trung: 'ty', ga: 'an', qua: 'an', non: 'cd', ca: 'ty', vai: 'cd', banhda: 'an' };
const C4_GLE = { trau: 1, qua: 1, ga: 1 };
const c4GCat = g => C4_GCAT[g] || 'an';
{ const want0 = c4Want;
  c4Want = function (g, noWx) {
    const w = want0(g, noWx); if (!w) return w;
    const q = (C4.Q && C4.Q[g] || []).length, qk = q >= 2 ? 1 + Math.min(.2, .07 * (q - 1)) : 1;
    const gouge = SAVE4.gouge && SAVE4.gouge[g] === SAVE4.day - 1 ? .92 : 1;
    return w * qk * c4CatMood(c4GCat(g)) * c4CalK(c4GCat(g), C4_GLE[g] ? 'le' : '') * gouge;
  }; }
// (b) a known buyer served at a greedy price on a hard day
{ const served0 = c4Served;
  c4Served = function (w) {
    const g = w.shop;
    if (g && !w.treat && !w.guest && w.pid !== undefined && w.pid !== null && c4Gouging(c4Price(g), (SAVE4.ref || {})[g])) {
      const p = c4People().list[w.pid], f = p ? c4F(p.id) : null;
      if (f && f.k) { c4Bump(p.id, -2); if (R() < .25) c4Say(w, c4Pick(C4_GOUGE_SAY)); }
      (SAVE4.gougeN = SAVE4.gougeN || {})[g] = (SAVE4.gougeN[g] || 0) + 1;
    }
    return served0(w);
  }; }
// the evening: the reference prices move, a day of greedy prices is remembered for tomorrow
{ const end0 = c4EndDay;
  c4EndDay = function () {
    const ref = SAVE4.ref = SAVE4.ref || {};
    for (const g of Object.keys(C4_GOODS)) if (typeof c4Own === 'function' && c4Own(g)) ref[g] = Math.round(c4RefStep(ref[g], c4Price(g)) * 100) / 100;
    const gn = SAVE4.gougeN || {}; SAVE4.gouge = SAVE4.gouge || {}; for (const g in gn) if (gn[g] >= 3) SAVE4.gouge[g] = SAVE4.day; SAVE4.gougeN = {};
    return end0.apply(this, arguments);
  }; }

/* ---------- the Tết bonus (the morning sheet) ---------- */
const c4TetPaid = () => SAVE4.tetY === c4Lunar().y;
function c4TetWages() {
  let a = 0;
  if (typeof c4Owned === 'function') for (const g of c4Owned()) for (const h of c4Hands(g)) a += c4Wage(g, h);
  if (typeof SAVE4B !== 'undefined' && SAVE4B) {
    for (const h of (SAVE4B.hands || [])) a += h.wage || 0;
    if (typeof p4Shops === 'function') { const S = p4Shops(); for (const k in S) a += p4WageOf(p4ShopFix(S[k])); }
  }
  return Math.round(a);
}
function c4TetBlock() {
  const { d, m } = c4Lunar(); if (m !== 1 || d > 5 || c4TetPaid()) return '';
  const day = c4TetWages(); if (!day) return '';
  const amt = day * 30;
  return `<div class="tet"><p><b>Tết đến rồi.</b> Người làm trông vào chút tiền mừng tuổi của chủ. Thưởng Tết mỗi người một tháng công: cả thảy ${c4Money(amt)}.</p><div class="row"><button class="btn" data-tet="${amt}"${SAVE4.money < amt ? ' disabled' : ''}>Thưởng Tết · ${c4Money(amt)}</button></div></div>`;
}
addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-tet]'); if (!b || b.disabled) return;
  const amt = +b.dataset.tet; if (SAVE4.money < amt || c4TetPaid()) return;
  SAVE4.money -= amt; SAVE4.tetY = c4Lunar().y; persist4(); AU.tap();
  toast('Người làm cầm tiền thưởng, rối rít chúc Tết ông bà.', 3); const box = b.closest('.tet'); if (box) box.remove();
  if (typeof c4Hud === 'function') try { c4Hud(); } catch (er) {}
}, true);
// the Tết bonus makes running off rare all year (c4RunChance, doicong-que.js)
{ const run0 = c4RunChance; c4RunChance = function () { return run0.apply(this, arguments) * (c4TetPaid() ? .15 : 1); }; }
// the morning sheet: the lunar date in the title, the Tết block
{ const am0 = c4Morning;
  c4Morning = function () {
    const r = am0.apply(this, arguments);
    const t = $('#c4amT'); if (t && !/tháng/.test(t.textContent)) t.textContent += ` · ${c4LunarText()}`;
    const b = $('#c4amB'), h = c4TetBlock(); if (b && h && !b.querySelector('.tet')) b.insertAdjacentHTML('afterbegin', h);
    return r;
  }; }
