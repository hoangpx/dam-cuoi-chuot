/* ---------- incense at Góc Thiền Định wards off bad luck (owner 2026-11-11: "nếu 1 ngày thắp 1 nén hương ở góc tịnh tâm thì sẽ được giảm
   1% các thiên tai, tai hoạ, người làm ôm tiền bỏ trốn, 2 ngày thì 2%"; counted as an unbroken run of days, at most 30 %; NEVER said to the
   player). The run is kept by js/tinhtam/nhang.js in localStorage 'dcc.tt' (litDay = the Vietnam day of the last stick, litRun = days in a row);
   it still counts the day after the last stick (today's may not be lit yet) and is gone after a day missed.
   Applied: the day's calamities and mishaps in the village are struck off one by one with that chance (c4PlanEvents), a worker running off
   with the takings (c4RunChance, village and town), and the town shops' evening mishaps (p4Mishaps). ---------- */
const C4_NHANG_MAX = 30;
const C4_NHANG_BAD = new Set(['trom', 'sau', 'do2', 'om', 'trom_ngay', 'kien', 'gio', 'lua', 'lut', 'bototron']);
let C4_NHANG_C = { t: 0, n: 0 };
function c4NhangRun() {
  const now = Date.now(); if (now - C4_NHANG_C.t < 5000) return C4_NHANG_C.n;
  let n = 0;
  try {
    const s = JSON.parse(localStorage.getItem('dcc.tt') || 'null'), vn = d => new Date(now + 7 * 3600e3 - d * 864e5).toISOString().slice(0, 10);
    if (s && s.litDay && (s.litDay === vn(0) || s.litDay === vn(1))) n = Math.max(1, s.litRun || 1);
  } catch (e) {}
  C4_NHANG_C = { t: now, n }; return n;
}
const c4NhangK = () => 1 - Math.min(C4_NHANG_MAX, c4NhangRun()) / 100;   // what is left of a bad chance: .99 after one day, .7 at most
{ const pe0 = c4PlanEvents;
  c4PlanEvents = function () {
    const r = pe0.apply(this, arguments), k = c4NhangK();
    if (k < 1 && C4.events) C4.events = C4.events.filter(e => !C4_NHANG_BAD.has(e.kind) || Math.random() < k);
    return r;
  }; }
{ const rc0 = c4RunChance;
  c4RunChance = function () { return rc0.apply(this, arguments) * c4NhangK(); }; }
{ const mh0 = p4Mishaps;
  p4Mishaps = function () { const o = mh0.apply(this, arguments); return o.cost > 0 && Math.random() >= c4NhangK() ? { cost: 0, text: '' } : o; }; }
