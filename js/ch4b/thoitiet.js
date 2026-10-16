/* Chương IV phần 2 · Phố Huyện: the calendar and the weather follow part 1 (owner, 2026-10-15: "ngày tháng trên phố huyện giống ngày tháng
   và thời tiết ở phần trước"). The day number goes on from the village market's: before the house is bought the town shows part 1's
   own day; once bought, SAVE4B.from = part 1's day at the purchase and the town counts on from it (p4DayNo). The HUD reads like part 1's:
   "Ngày 12  🐉 7:40  ☀️" (part 1's C4_ZOD, c4Hour, c4Clock, C4_WXI, read only). The weather of a day the two share is part 1's own
   (c4Wx); any other day is rolled with part 1's odds from the day number. In town there are no floods or gales (owner): rain is a light
   rain (streaks, umbrellas, fewer folk out), a hot day or a cold one only thins the street a little. Part 2's own code. */
const P4_WX_FLOW = { dep: 1, gat: .88, mua: .62, ret: .85 };
const p4DayNo = () => SAVE4B.house ? (SAVE4B.from || SAVE4.day) + SAVE4B.day - 1 : SAVE4.day;
function p4Wx() {
  const n = p4DayNo();
  if (n === SAVE4.day && SAVE4.plan && SAVE4.plan.wx) return c4Wx();
  const r = mulberry(n * 977 + 13)(); return r < .45 ? 'dep' : r < .65 ? 'gat' : r < .85 ? 'mua' : 'ret';
}
const p4WxFlow = () => P4_WX_FLOW[p4Wx()] || 1;
function p4HudTime() {
  const el = $('#p4Time'); el.textContent = `Ngày ${p4DayNo()}  ${C4_ZOD[c4Hour(P4.mins)] || ''} ${c4Clock(P4.mins)}  ${C4_WXI[p4Wx()] || ''}`;
  el.title = `giờ ${c4Hour(P4.mins)}`;
}
// light rain over the town, in screen space: slanted streaks, a grey wash; a cold day is a pale blue wash, a hot one a warm haze
function p4WxDraw() {
  const wx = p4Wx(), g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  if (wx === 'mua') {
    g.fillStyle = 'rgba(70,80,90,.14)'; g.fillRect(0, 0, cv.width, cv.height);
    g.strokeStyle = 'rgba(225,232,236,.45)'; g.lineWidth = 1.2 * DPR; g.beginPath();
    const n = Math.round(cv.width * cv.height / (9000 * DPR * DPR)), t = P4.t;
    for (let i = 0; i < n; i++) { const r1 = (i * 9301 + 49297) % 233280 / 233280, r2 = (i * 4561 + 2741) % 1000 / 1000;
      const x = (r1 * cv.width + t * 60 * DPR) % cv.width, y = ((r2 * cv.height + t * (520 + r1 * 200) * DPR) % (cv.height + 40 * DPR)) - 20 * DPR;
      g.moveTo(x, y); g.lineTo(x - 5 * DPR, y + 16 * DPR); }
    g.stroke();
  } else if (wx === 'ret') { g.fillStyle = 'rgba(150,180,210,.12)'; g.fillRect(0, 0, cv.width, cv.height); }
  else if (wx === 'gat') { g.fillStyle = 'rgba(240,190,90,.08)'; g.fillRect(0, 0, cv.width, cv.height); }
}
