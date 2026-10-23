/* Chương IV · the village and the town run on ONE clock (owner, 2026-10-18: "một đồng hồ chung, bên vắng mặt vẫn buôn bán ngầm nhờ người
   làm"; this replaces 2026-10-15's "thôi cho thời gian bên kia dừng lại", where the place left behind stood still). The day (SAVE4.day) and
   the hour are the world's: W4.mins, driven by the place the player is in (the village's C4.mins or the town's P4.mins), saved in SAVE4.w4.
   - The place the player is away from keeps trading in the background, caught up every half hour of the world clock and again whenever
     it comes into view (w4CatchVillage / w4CatchTown): a ware sells only where someone minds it — in the village a stall's hired hands (the
     couple are with the player), in the town the betel house's hired hand, and each eating house we run (its cook is always there).
     Sales are reckoned from the usual flow (the village: what each ware sold lately, SAVE4.salesHist, spread over the day by C4_BUSY; the
     town: the street's flow and the eating houses' meal times, as their own code does), a lone hand selling less than the couple, never
     more than the stock; everything goes into the day's counts (C4.today / P4.today), so the evening tallies include it.
   - When the absent place reaches its closing hour it just closes (the village at C4_CLOSE 19:00: c4EndDay with no sheet; the town at
     P4_CLOSE 23:00: p4EndDay(true)). Owner: no notice, except that the town's "Về chợ quê" blinks red once the village has closed meanwhile.
   - A place's first moment of a day is its opening: the town (with the house bought) opens at P4_OPEN whether or not the player is there;
     the village opens when its morning order is given, at the world's hour (c4OpenAt).
   - The town's "Sang ngày mới" closes the village (caught up to its closing first) and turns the day for both (c4DayAdvance); turning
     the day in the village runs the town to its closing first (w4BeforeDay). The town's caught-up hour is kept (SAVE4.w4.pho) so a reload
     never sells the same hours twice. */
const W4 = { day: 0, mins: 0, pho: 0 };
function w4Load() {   // the world's hour today, from the save (a reload) or a fresh morning
  const s = SAVE4.w4;
  if (W4.day !== SAVE4.day) { const ok = s && s.day === SAVE4.day; W4.day = SAVE4.day; W4.mins = ok ? s.mins : C4_OPEN; W4.pho = ok && s.pho ? s.pho : 0; }
  return W4;
}
const w4Save = () => { SAVE4.w4 = { day: W4.day, mins: Math.round(W4.mins), pho: Math.round(W4.pho || 0) }; };
const w4VillageLive = () => typeof C4 !== 'undefined' && C4.day === SAVE4.day && C4.phase === 'open' && C4.today;
const w4TownOver = () => (SAVE4B.house && SAVE4B.settled === SAVE4.day) || (P4.w4day === SAVE4.day && P4.phase === 'night');
const w4TownLive = () => SAVE4B.house && P4.today && P4.w4day === SAVE4.day && P4.phase === 'open';
const w4Rnd = () => .85 + Math.random() * .3;

// ---------- the village ----------
// called by part 1 each frame its market is open (updateC4): the world's hour follows the village's; each half hour the town catches up
function w4VillageTick() {
  w4Load(); const was = W4.mins; W4.mins = Math.max(W4.mins, C4.mins);
  if (Math.floor(was / 30) !== Math.floor(W4.mins / 30)) { w4CatchTown(W4.mins); w4Save(); }
}
// part 1 calls this when its market shows again (c4Resume / c4MarketStart): it catches up to the world's hour (it may close meanwhile);
// the tally after closing, with the way to the town
function w4VillageEnter() {
  w4Load(); W4.villageShut = false;
  if (w4VillageLive()) w4CatchVillage(W4.mins);
  if (C4.day === SAVE4.day && C4.phase === 'night') c4Sheets('c4day');
  if (C4.day === SAVE4.day && C4.phase === 'morning' && $('#c4amO .go')) { c4Sheets('c4am'); c4AmClock(); }   // the order not given yet: the sheet again, against the hour now (cho.js)
  w4DayButtons();
}
// the hour the village's market opens when the morning order is given: the world's
const c4OpenAt = () => Math.max(C4_OPEN, w4Load().mins);
// how busy the village is over [a, b) (game minutes), on C4_BUSY's double-hours
function w4VillageBusy(a, b) { let s = 0; for (let m = a; m < b; m += 5) s += (C4_BUSY[c4Hour(m)] || .3) * Math.min(5, b - m); return s; }
// the village while the player is away: each stall with a hand at it sells, up to the world's hour; at closing it closes
function w4CatchVillage(to) {
  if (!w4VillageLive()) return;
  const from = C4.mins; to = Math.min(to, C4_CLOSE); if (to <= from + .5) return;
  const day = w4VillageBusy(C4_OPEN, C4_CLOSE), share = w4VillageBusy(from, to) / day, H = SAVE4.salesHist || [];
  for (const g of c4Owned()) {
    const hands = c4HandsOn(g); if (!c4Open(g) || c4Stock(g) < 1) continue;
    // nobody hired: a relative minds the stall and sells a little less than one hand would (owner, 2026-10-22: "không lên phố thì không tự bán được")
    const nh = hands.length || 1, past = H.filter(h => h.by && h.by[g]), want = Math.max(c4Cap(g) * .7, past.length ? past.reduce((a, h) => a + h.by[g].n + h.by[g].lost * 2, 0) / past.length : 0);   // (never below 70 % of the capacity: days it sold nothing while unattended must not keep it at nothing)
    const quick = hands.length ? hands.reduce((a, h) => a + .8 + .4 * (h.sp || .5), 0) / hands.length : 1;
    const cap = (to - from) / C4_MPS / (c4ServeDur(g, hands[0]) + 1.5) * 2 * nh;   // what they can serve in that time
    const raw = Math.min(cap, want * share * (hands.length ? Math.min(1, .55 * nh) : .6) * quick * w4Rnd());
    const fr = (C4.bgFrac = C4.bgFrac || {}), n = Math.min(c4Stock(g), Math.floor((fr[g] || 0) + raw)); fr[g] = (fr[g] || 0) + raw - n;   // (a half hour at a time is a fraction of a sale: the rest carries over)
    if (n < 1) continue;
    const pay = Math.round(n * c4Price(g) * (1 - c4SalePct(g) / 100));
    c4SetStock(g, c4Stock(g) - n); SAVE4.money += pay; SAVE4.sold = (SAVE4.sold || 0) + n;
    const d = C4.today; d.sold += n; d.take += pay; d.cogs += n * c4Unit(g); d.served += Math.max(1, Math.round(n / 2));
    const B = (d.by = d.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.take += pay; b.cogs += n * c4Unit(g); b.n += n;
  }
  C4.mins = to; SAVE4.openMins = to;
  if (C4.events) C4.events = C4.events.filter(e => e.at > to);             // what would have happened meanwhile happened without us
  for (const w of C4.walkers) if (w.st !== 'leave') { w.st = 'leave'; w.face = w.x < C4_STALL ? -1 : 1; w.chat = null; w.talk = false; }   // a fresh crowd when we come back
  for (const g of Object.keys(C4.Q)) { C4.Q[g] = []; C4.SV[g] = []; }
  persist4();
  if (to >= C4_CLOSE) { c4EndDay(); if (S.mode !== 'c4play') { C4.away = 'c4day'; W4.villageShut = true; } }   // it just closes (owner); the town's "Về chợ quê" blinks
}
function w4DayButtons() {
  const b = $('#c4dayPho'); if (!b) return;
  b.hidden = w4TownOver();
  b.textContent = SAVE4B.house ? `Lên phố huyện (mở đến ${P4_CLOSE / 60}:00)` : 'Lên phố huyện ngắm đèn';
}
// part 1's c4DayAdvance calls this first: the town runs to its closing and is settled before the day turns
function w4BeforeDay() {
  if (SAVE4B.house && SAVE4B.settled !== SAVE4.day) {
    p4EnsureDay(); w4CatchTown(P4_CLOSE);
    if (P4.w4day === SAVE4.day && SAVE4B.settled !== SAVE4.day) p4EndDay(true);
  }
  if (SAVE4B.house) { SAVE4B.morning = SAVE4.day + 1; p4Persist(); }          // the next morning starts with the town's stocking sheet (and a way to the village's)
  W4.day = SAVE4.day + 1; W4.mins = C4_OPEN; W4.pho = 0; w4Save();
}

// ---------- the town ----------
// the town's day follows the world's; a new day opens at P4_OPEN once the house is ours (its hand and cooks work whether we are there or
// not), or at the world's hour before that; after a reload it carries on from the hour it had been caught up to (W4.pho)
function p4EnsureDay() {
  if (!P4.scene) { P4.scene = p4TownScene(mulberry(7)); P4.camX = P4_HOME - p4View().vw * .5; }
  if (SAVE4B.house) {
    if (!SAVE4B.dayOf) SAVE4B.dayOf = SAVE4.day;
    if (SAVE4B.dayOf !== SAVE4.day) { SAVE4B.day += Math.max(1, SAVE4.day - SAVE4B.dayOf); SAVE4B.dayOf = SAVE4.day; p4Persist(); }
  }
  if (P4.day !== SAVE4B.day || !P4.today || P4.w4day !== SAVE4.day) {
    p4NewDay(); P4.w4day = SAVE4.day; w4Load();
    P4.mins = SAVE4B.house ? Math.max(P4_OPEN, W4.pho || P4_OPEN) : Math.max(P4_OPEN, Math.min(P4_CLOSE - 60, W4.mins));
  }
}
// called by part 2 each frame its street is open (updateP4): the world's hour follows the town's; each half hour the village catches up
function w4TownTick() {
  w4Load(); const was = W4.mins; W4.mins = Math.max(W4.mins, P4.mins); W4.pho = P4.mins;
  if (Math.floor(was / 30) !== Math.floor(W4.mins / 30)) { w4CatchVillage(W4.mins); w4Save(); p4BackBlink(); }
}
// entering the town: today's town, caught up to the world's hour (it may close meanwhile)
function w4TownEnter() {
  p4EnsureDay(); w4Load();
  if (SAVE4B.house) SAVE4B.autoDay = SAVE4.day;                             // the player is here today: they buy the betel themselves (no w4TownAutoBuy, not even at the day's end)
  if (w4TownLive()) w4CatchTown(W4.mins);
  else if (P4.phase === 'open') P4.mins = Math.max(P4.mins, Math.min(P4_CLOSE, W4.mins));
  if (P4.phase === 'night') p4Sheets('p4day');                              // the evening sheet again (already reckoned)
  p4BackBlink();
}
// how many buyers of betel the street sends a game minute at hour m (p4Spawn's odds, as an average)
function w4TownBetelRate(m) {
  const h = m / 60; let busy = .4; for (let i = P4_BUSY.length - 1; i >= 0; i--) if (h >= P4_BUSY[i][0]) { busy = P4_BUSY[i][1]; break; }
  const walkers = busy * p4WxFlow() / 3.2, buy = Math.min(1, .3 * (8 / Math.max(5, SAVE4B.price)) * p4Warmth() * (SAVE4B.sign ? 1.1 : 1) * p4Harass() * .8);
  return walkers * buy / (P4_MPS * (m >= 18 * 60 ? .4 : 1));
}
// betel bought at the house on a day (the house sheet's Nhập trầu): a new day begun away from the town buys the same (w4TownAutoBuy)
function p4BetelLog(n) { const L = SAVE4B.buyLog; if (!L || L.day !== SAVE4.day) SAVE4B.buyLog = { day: SAVE4.day, n: 0 }; SAVE4B.buyLog.n += n; }
// owner, 2026-10-18 ("ngược lại cũng thế nếu có nhà trên phố thì cũng tự nhập"): a town day that begins while the player is in the village
// buys the betel of the last day it was bought, at 3 đồng (as the sheet), as far as the purse goes; only when a hand minds the house
// (the couple are in the village, nobody else sells there); the eating houses buy their own ingredients as they cook
function w4TownAutoBuy() {
  if (!SAVE4B.house || SAVE4B.shut || S.mode === 'c4bplay' || SAVE4B.autoDay === SAVE4.day) return;
  SAVE4B.autoDay = SAVE4.day;
  const L = SAVE4B.buyLog; if (!L || L.day >= SAVE4.day || !L.n) return;
  const n = Math.min(L.n, Math.floor(p4Purse() / 3)); if (n < 1) return;
  p4Spend(n * 3); SAVE4B.stock += n; SAVE4B.buyLog = { day: SAVE4.day, n };
}
// the town while the player is away: the betel house sells if a hand minds it, every eating house we run serves its meals; at closing it closes
function w4CatchTown(to) {
  if (!SAVE4B.house) return;
  if (P4.w4day !== SAVE4.day || !P4.today) p4EnsureDay();
  if (!w4TownLive()) return;
  w4TownAutoBuy();                                                          // a new day away from the town: betel as the last day
  const from = P4.mins; to = Math.min(to, P4_CLOSE); if (to <= from + .5) return;
  const hands = p4Hands();
  if (SAVE4B.stock > 0 && !SAVE4B.shut) {                                  // the betel house: its hand alone, or a relative at 60 % when none is hired (the wife is with the player)
    let buyers = 0; for (let m = from; m < to; m += 5) buyers += w4TownBetelRate(m) * Math.min(5, to - m);
    const quick = hands.length ? hands.reduce((a, h) => a + .8 + .4 * (h.sp || .5), 0) / hands.length : .6;
    const raw = buyers * 2 * .6 * quick * w4Rnd(), T = P4.today;
    const n = Math.min(SAVE4B.stock, Math.floor((T.frac || 0) + raw)); T.frac = (T.frac || 0) + raw - n;   // (a half hour at a time is often a fraction of a sale, as in the village: the rest carries over, else a dear or quiet house never sold while we were away)
    if (n > 0) {
      const got = p4SalePrice('home', n * SAVE4B.price);
      SAVE4B.stock -= n; SAVE4B.sold = (SAVE4B.sold || 0) + n; P4.today.sold += n; p4Earn(got);
      const s = (P4.sellers || []).find(x => x.who === 'hand'); if (s) s.take += got;
    }
  }
  const S2 = p4Shops();
  for (const key in S2) {                                                   // the eating houses: the cook serves the meals' customers
    const R = S2[key]; if (R.shut) continue; let cust = 0;
    for (let m = from; m < to; m += 5) cust += P4_FOOD_CUST / 900 * P4_MEALS(m / 60) / P4_MEAL_NORM * p4SignK(R) * p4Harass() * Math.min(5, to - m);
    const n = Math.round(cust * 2.5 * w4Rnd()); if (n < 1) continue;
    const got = p4SalePrice(key, n * P4_FOOD.price), cost = n * P4_FOOD.cost;
    SAVE4.money += got - cost; P4.today.take += got; P4.today.spent += cost;
    const T = P4.shopDay[key] || (P4.shopDay[key] = { n: 0, take: 0, cost: 0 }); T.n += n; T.take += got; T.cost += cost;
  }
  P4.mins = to; W4.pho = to;
  P4.walkers = []; P4.Q = []; P4.FQ = {};                                   // a fresh street when we come back
  for (const s of P4.sellers || []) Object.assign(s, { st: 'counter', job: null, serving: null, t: 0, x: p4SlotX(s.slot), z: .07 });
  persist4(); p4Persist();
  if (to >= P4_CLOSE) p4EndDay(S.mode !== 'c4bplay');                      // it just closes (owner)
}
// the town's "Sang ngày mới": the village is run to its closing (if its market is open) and closed, the day turns for both
function w4TownNextDay() {
  if (w4VillageLive()) { w4CatchVillage(C4_CLOSE); if (w4VillageLive()) c4EndDay(); }
  SAVE4B.settled = SAVE4.day;
  c4DayAdvance();                                                           // the day turns
  p4Sheets(null); p4EnsureDay(); P4.mins = P4_OPEN; p4Hud();
  if (SAVE4B.house) { p4HomeOpen(); toast('Sáng ngày mới: nhập trầu cho hiệu rồi bấm Họp chợ, hoặc sang làng nhập hàng trước.', 3.4); }   // the town's morning stocking (owner, 2026-10-22); the village's order is made by the player, or for them when the town opens (w4TownOpen)
  else w4VillageAutoMorning();                                              // no house in town: the village just opens
}
// the town's "Họp chợ" (or closing the morning sheet): the town opens; if the village's morning order was not given by the player, it is given for them
function w4TownOpen() {
  SAVE4B.morning = 0; p4Persist(); p4Sheets(null); p4Hud();
  w4VillageAutoMorning();
}
// the village's morning played without the player (owner, 2026-10-18; asked again 2026-10-22 for both ways): the order is yesterday's ("Như hôm qua", else the usual suggestion), cut to what can be paid, and the market opens at the world's hour
function w4VillageAutoMorning() {
  if (typeof C4 === 'undefined' || SAVE4.openDay === SAVE4.day || !SAVE4.intro || c4Talk2Due()) return;
  if (!(C4.day === SAVE4.day && C4.phase === 'morning' && $('#c4amO .go'))) { c4MarketStart(); $('#c4hud').hidden = true; }   // (the morning sheet may already be waiting there)
  if (C4.day !== SAVE4.day || C4.phase !== 'morning' || !$('#c4amO .go')) { c4Sheets(null); C4.away = null; return; }   // (a ruin…: left for the player)
  const qua = $('#c4amO [data-all="qua"]'); if (qua && !qua.disabled) qua.click();
  const go = $('#c4amO .go'); if (go && !go.disabled && getComputedStyle(go).display !== 'none') go.click();
  c4Sheets(null); C4.away = null;
}
// the village's "Họp chợ" was pressed: the town's morning is over too (it stocks itself as the last day if the player did not, w4TownAutoBuy)
function w4VillageOpened() { if (SAVE4B.house && SAVE4B.morning === SAVE4.day) { SAVE4B.morning = 0; p4Persist(); } }
// the village's part of the town's evening sheet (caught up first, so the hands' sales are in)
function w4VillageLine() {
  if (w4VillageLive()) w4CatchVillage(W4.mins);
  if (typeof C4 === 'undefined' || C4.day !== SAVE4.day || !C4.today || !C4.today.take) return '';
  const d = C4.today; return `<p>Ở chợ làng hôm nay bán được <b>${c4Money(Math.round(d.take))}</b> (${d.sold} phần hàng).</p>`;
}
// the town's "Về chợ quê" blinks red once the village has closed while the player was in the town (owner: the only notice)
function p4BackBlink() { const b = $('#p4Back'); if (b) b.classList.toggle('blink', !!W4.villageShut); }
