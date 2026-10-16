/* Chương IV · the village and the town share the day (owner, 2026-10-15; part 1 may be touched for it). First one clock ran for both with
   the place left behind trading in the background; the owner then chose "thôi cho thời gian bên kia dừng lại": each place keeps its own
   hour and it STANDS STILL while the player is away; nothing is sold there meanwhile. The day (SAVE4.day) is one:
   - the town's first visit of a day opens at the village's hour (W4.mins = the village's clock, saved in SAVE4.w4), later visits carry
     on where the town was left; the town is open to P4_CLOSE (23:00), the village to C4_CLOSE (19:00);
   - the town's "Sang ngày mới" (after 23:00) closes the village where it stood if its market is still open (c4EndDay) and turns the day
     for both (c4DayAdvance); the town's evening sheet tells the village's takings (w4VillageLine);
   - turning the day in the village settles the town quietly first (w4BeforeDay, hooked at the top of c4DayAdvance; a notice);
   - the village's tally has "Lên phố huyện" while the town's day is not over (w4DayButtons). */
const W4 = { day: 0, mins: 0 };
function w4Load() {   // the village's hour today, from the save (a reload) or a fresh morning
  const s = SAVE4.w4;
  if (W4.day !== SAVE4.day) { W4.day = SAVE4.day; W4.mins = s && s.day === SAVE4.day ? s.mins : C4_OPEN; }
  return W4;
}
const w4VillageLive = () => typeof C4 !== 'undefined' && C4.day === SAVE4.day && C4.phase === 'open' && C4.today;
const w4TownOver = () => (SAVE4B.house && SAVE4B.settled === SAVE4.day) || (P4.w4day === SAVE4.day && P4.phase === 'night');

// ---------- the village ----------
// called by part 1 each frame its market is open (updateC4): remember the village's hour
function w4VillageTick() {
  w4Load(); const was = W4.mins; W4.mins = C4.mins;
  if (Math.floor(was / 30) !== Math.floor(W4.mins / 30)) SAVE4.w4 = { day: W4.day, mins: W4.mins };   // saved with part 1's half-hourly save
}
// part 1 calls this when its market shows again (c4Resume / c4MarketStart): the tally after closing, with the way to the town
function w4VillageEnter() {
  if (C4.day === SAVE4.day && C4.phase === 'night') c4Sheets('c4day');
  w4DayButtons();
}
function w4DayButtons() {
  const b = $('#c4dayPho'); if (!b) return;
  b.hidden = w4TownOver();
  b.textContent = SAVE4B.house ? `Lên phố huyện (mở đến ${P4_CLOSE / 60}:00)` : 'Lên phố huyện ngắm đèn';
}
// part 1's c4DayAdvance calls this first: the town's day is settled before the day turns
function w4BeforeDay() {
  if (SAVE4B.house && P4.today && P4.w4day === SAVE4.day && SAVE4B.settled !== SAVE4.day) {
    const t = Math.round(P4.today.take); p4EndDay(true);
    if (t > 0) toast(`Hiệu trầu phố huyện hôm nay bán được ${c4Money(t)}.`, 3.2);
  }
  W4.day = SAVE4.day + 1; W4.mins = C4_OPEN; SAVE4.w4 = { day: W4.day, mins: W4.mins };
}

// ---------- the town ----------
// the town's day follows the village's; a new day there opens at the village's hour (its own counters, SAVE4B.day, go on by the days passed)
function p4EnsureDay() {
  if (!P4.scene) { P4.scene = p4TownScene(mulberry(7)); P4.camX = P4_HOME - p4View().vw * .5; }
  if (SAVE4B.house) {
    if (!SAVE4B.dayOf) SAVE4B.dayOf = SAVE4.day;
    if (SAVE4B.dayOf !== SAVE4.day) { SAVE4B.day += Math.max(1, SAVE4.day - SAVE4B.dayOf); SAVE4B.dayOf = SAVE4.day; p4Persist(); }
  }
  if (P4.day !== SAVE4B.day || !P4.today || P4.w4day !== SAVE4.day) { p4NewDay(); P4.w4day = SAVE4.day; P4.mins = Math.max(P4_OPEN, Math.min(P4_CLOSE - 60, w4Load().mins)); }
}
// entering the town: today's town, where it was left
function w4TownEnter() {
  p4EnsureDay();
  if (P4.phase === 'night') p4Sheets('p4day');                              // the evening sheet again (already reckoned)
}
// the town's "Sang ngày mới": the village is closed where it stood if its market is still open, the day turns for both
function w4TownNextDay() {
  if (w4VillageLive()) c4EndDay();
  SAVE4B.settled = SAVE4.day;
  c4DayAdvance();
  p4Sheets(null); p4EnsureDay(); P4.mins = P4_OPEN; p4Hud();
}
// the village's part of the town's evening sheet
function w4VillageLine() {
  if (typeof C4 === 'undefined' || C4.day !== SAVE4.day || !C4.today || !C4.today.take) return '';
  const d = C4.today; return `<p>Ở chợ làng hôm nay bán được <b>${c4Money(Math.round(d.take))}</b> (${d.sold} phần hàng).</p>`;
}
