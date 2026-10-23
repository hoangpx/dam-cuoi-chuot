/* Chương IV · one clock for the village and the town (owner, 2026-10-15: "thời gian phố huyện và ở làng giống nhau, nhưng phố huyện mở cửa
   đến khuya"; part 1 may be touched for it). One day (SAVE4.day) and one time of day (W4.mins, kept in SAVE4.w4) for both places: the
   clock runs where the player is; going from one to the other keeps the hour. The place left behind keeps trading on its own, reckoned in
   the background (w4VillageBg / w4TownBg: buyers by the same rates, no walkers, no happenings). The village market shuts at C4_CLOSE
   (19:00): if the player is in town then, the village is closed in the background (c4EndDay; its tally waits for the return) and a notice
   says what it took. The town stays open to P4_CLOSE (23:00); its evening sheet tells the village's day too, and "Sang ngày mới" there
   ends the day for both (c4DayAdvance). Ending the day in the village ("Sang ngày mới" / "Đi ngủ") settles the town quietly first
   (w4BeforeDay, hooked into c4DayAdvance). Back in the village after closing: its tally, with "Lên phố huyện" while the town is open; a day
   the village never opened shows "Hôm nay không họp chợ làng". */
const W4 = { day: 0, mins: 0 };
function w4Load() {   // the clock of today, from the save (a reload) or a fresh morning
  const s = SAVE4.w4;
  if (W4.day !== SAVE4.day) { W4.day = SAVE4.day; W4.mins = s && s.day === SAVE4.day ? s.mins : C4_OPEN; }
  return W4;
}
function w4Set(mins) {
  w4Load(); const was = W4.mins; W4.mins = Math.max(W4.mins, mins);
  if (Math.floor(was / 30) !== Math.floor(W4.mins / 30)) { SAVE4.w4 = { day: W4.day, mins: W4.mins }; persist4(); }   // saved every half hour
}
const w4VillageLive = () => typeof C4 !== 'undefined' && C4.day === SAVE4.day && C4.phase === 'open' && C4.today;
const w4TownOpen = () => w4Load().mins < P4_CLOSE;

// ---------- the village ----------
// called by part 1 each frame the market is open (updateC4): the clock, and the town trading meanwhile
function w4VillageTick(dm) {
  w4Set(C4.mins);
  if (SAVE4B.house) { p4EnsureDay(); w4TownBg(dm); }
}
// the village in the background while the player is in town: buyers come at the market's own rate, each takes 1–3 of a ware in stock
function w4VillageBg(dm) {
  if (!w4VillageLive()) return;
  C4.mins = W4.mins;
  const busy = C4_BUSY[c4Hour(C4.mins)] || .3, rate = .9 * C4_PACE * busy * c4Lv().flow * c4Flow() / C4_MPS * .55;   // buyers a game minute
  C4.bgAcc = (C4.bgAcc || 0) + rate * dm;
  while (C4.bgAcc >= 1) {
    C4.bgAcc -= 1;
    const ws = c4Owned().filter(g => c4Stock(g) > 0 && c4Open(g)); if (!ws.length) { C4.today.lost++; continue; }
    const g = ws[Math.floor(Math.random() * (ws.length + 1)) % ws.length], n = Math.min(c4Stock(g), 1 + Math.floor(Math.random() * 3)), pay = n * c4Price(g);
    c4SetStock(g, c4Stock(g) - n); SAVE4.money += pay; SAVE4.sold = (SAVE4.sold || 0) + n;
    C4.today.sold += n; C4.today.take += pay; C4.today.cogs += n * c4Unit(g); C4.today.served++;
    const B = (C4.today.by = C4.today.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.take += pay; b.cogs += n * c4Unit(g); b.n += n;
  }
  SAVE4.openMins = C4.mins;
  if (C4.mins >= C4_CLOSE) {   // closing time at the village while the player is in town
    C4.mins = C4_CLOSE - 1; c4EndDay(); C4.away = 'c4day';
    toast(`Chợ làng đã vãn. Hôm nay ở làng bán được ${c4Money(Math.round(C4.today.take))}.`, 3.6);
  }
}
// part 1 calls this when its market shows again (startC4 → c4Resume / c4MarketStart): catch up with the clock
function w4VillageEnter() {
  w4Load();
  if (C4.day !== SAVE4.day) return;
  if (C4.phase === 'open') {
    C4.mins = Math.max(C4.mins, Math.min(W4.mins, C4_CLOSE));
    if (C4.mins >= C4_CLOSE) { C4.mins = C4_CLOSE - 1; c4EndDay(); }
  } else if (C4.phase === 'morning' && W4.mins > C4.mins) {
    if (W4.mins >= C4_CLOSE - 30) w4VillageNoMarket();                     // too late to open the market today
    else C4.mins = W4.mins;                                                 // "Họp chợ" opens it at this hour
  } else if (C4.phase === 'night') { c4Sheets('c4day'); }
  w4DayButtons();
}
function w4VillageNoMarket() {
  C4.phase = 'night'; SAVE4.openDay = 0; C4.walkers = []; C4.mins = C4_CLOSE - 1;
  $('#c4dayT').textContent = `Ngày ${SAVE4.day}, chợ làng đã vãn`;
  $('#c4dayB').innerHTML = '';
  $('#c4dayN').innerHTML = 'Hôm nay nhà mình không họp chợ ở làng.';
  persist4(); c4LoanUI(true); c4Sheets('c4day');
}
// the village tally's "Lên phố huyện": shown while the town is still open
function w4DayButtons() {
  const b = $('#c4dayPho'); if (!b) return;
  b.hidden = !w4TownOpen();
  b.textContent = SAVE4B.house ? `Lên phố huyện (mở đến ${P4_CLOSE / 60}:00)` : 'Lên phố huyện ngắm đèn';
}
// part 1's c4DayAdvance calls this first: the town's day is settled before the day turns
function w4BeforeDay() {
  if (SAVE4B.house && P4.today && SAVE4B.dayOf === SAVE4.day && SAVE4B.settled !== SAVE4.day) {
    const t = Math.round(P4.today.take); p4EndDay(true);
    if (t > 0) toast(`Hiệu trầu phố huyện hôm nay bán được ${c4Money(t)}.`, 3.2);
  }
  W4.day = SAVE4.day + 1; W4.mins = C4_OPEN; SAVE4.w4 = { day: W4.day, mins: W4.mins };
}

// ---------- the town ----------
// the town's day follows the village's: a new day there starts the town's (its own counters, SAVE4B.day, go on by the days passed)
function p4EnsureDay() {
  if (!P4.scene) { P4.scene = p4TownScene(mulberry(7)); P4.camX = P4_HOME - p4View().vw * .5; }
  if (SAVE4B.house) {
    if (!SAVE4B.dayOf) SAVE4B.dayOf = SAVE4.day;
    if (SAVE4B.dayOf !== SAVE4.day) { SAVE4B.day += Math.max(1, SAVE4.day - SAVE4B.dayOf); SAVE4B.dayOf = SAVE4.day; p4Persist(); }
  }
  if (P4.day !== SAVE4B.day || !P4.today || P4.w4day !== SAVE4.day) { p4NewDay(); P4.w4day = SAVE4.day; }
  P4.mins = Math.max(P4.mins, w4Load().mins);
}
// the town in the background while the player is in the village: our betel shop and the eating houses sell at their own rates
function w4TownBg(dm) {
  if (P4.phase !== 'open') return;
  P4.mins = W4.mins;
  const h = P4.mins / 60;
  // betel: passers-by a game minute, the share who buy (as p4Spawn), 1–3 each
  const pass = p4Busy() * p4WxFlow() / 3.2 / P4_MPS, buy = .3 * (8 / Math.max(5, SAVE4B.price)) * p4Warmth() * (SAVE4B.sign ? 1.1 : 1) * p4Harass();   // a walker every ~3.2 s at full bustle
  P4.bgAcc = (P4.bgAcc || 0) + pass * buy * dm;
  while (P4.bgAcc >= 1) {
    P4.bgAcc -= 1;
    if (SAVE4B.stock <= 0) { P4.today.lost++; continue; }
    const n = Math.min(SAVE4B.stock, 1 + Math.floor(Math.random() * 3)); SAVE4B.stock -= n; p4Earn(n * SAVE4B.price); P4.today.sold += n; SAVE4B.sold = (SAVE4B.sold || 0) + n;
  }
  // the eating houses: their customers a game minute (as p4ShopsUpdate), each eats 1–2 dishes
  const S = p4Shops();
  for (const key in S) {
    const R = S[key]; R.bgAcc = (R.bgAcc || 0) + P4_FOOD_CUST / 900 * P4_MEALS(h) / P4_MEAL_NORM * p4SignK(R) * p4Harass() * dm;
    while (R.bgAcc >= 1) {
      R.bgAcc -= 1; const n = 1 + Math.floor(Math.random() * 2), got = n * P4_FOOD.price, cost = n * P4_FOOD.cost;
      SAVE4.money += got - cost; P4.today.take += got; P4.today.spent += cost;
      const T = P4.shopDay[key] || (P4.shopDay[key] = { n: 0, take: 0, cost: 0 }); T.n += n; T.take += got; T.cost += cost;
    }
  }
  if (Math.floor((P4.mins - dm) / 30) !== Math.floor(P4.mins / 30)) { persist4(); p4Persist(); }
}
// entering the town: the hour the village has reached; past closing, the evening sheet
function w4TownEnter() {
  p4EnsureDay();
  if (P4.phase === 'open' && P4.mins >= P4_CLOSE) { P4.mins = P4_CLOSE; p4EndDay(); }
}
// each frame the town is open (updateP4): the clock, and the village trading meanwhile
function w4TownTick(dm) { w4Set(P4.mins); w4VillageBg(dm); }
// the town's "Sang ngày mới": the village is closed if it was still open, the day turns for both, a new morning in town
function w4TownNextDay() {
  if (w4VillageLive()) c4EndDay();
  SAVE4B.settled = SAVE4.day;
  c4DayAdvance();
  p4Sheets(null); p4EnsureDay(); P4.mins = P4_OPEN; p4Hud();
  if (SAVE4B.house) { p4HomeOpen(); toast('Sáng ngày mới: nhập trầu cho hiệu rồi hãy mở cửa.', 3); }   // the morning's stocking (owner: "bấm sang ngày mới thì phải hiện bảng nhập hàng")
}
// the village's part of the town's evening sheet
function w4VillageLine() {
  if (typeof C4 === 'undefined' || C4.day !== SAVE4.day || !C4.today || !C4.today.take) return '';
  const d = C4.today; return `<p>Ở chợ làng hôm nay bán được <b>${c4Money(Math.round(d.take))}</b> (${d.sold} phần hàng).</p>`;
}
