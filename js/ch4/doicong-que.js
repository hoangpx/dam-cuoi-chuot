/* Chương IV · chợ quê: hired hands ask for pay that matches their stall (owner, 2026-11-08: "cái tiền công của người làm áp dụng cho cả chợ quê
   và chợ huyện"; the town's rule is js/ch4b/doicong.js). Fair pay = 10 % of the stall's own profit averaged over its last 7 evenings (h.hist:
   takings − goods − the stall's rent by the day c4RentOf − the hand's wage now); a stall at a loss: no ask. Paid less: an ask 4–7 days ahead
   (h.wq.ask); that evening the tally says so (wq.pend); on the open market a sheet #c4wage asks: raise (h.wageUp, read by c4Wage) or refuse.
   Refused (an ask waits until it is answered): that evening the hand runs off with that stall's takings of the day. */
const C4_FAIR = .1, C4_FAIR_DAYS = 7;
// one rule for every hired hand, village and town (owner, 2026-11-08: "apply hết luật chung người làm cho cả huyện và quê, nhưng nếu được trả lương xứng
// đáng thì % ôm tiền bỏ trốn rất ít"): the chance an evening that a hand runs off with the day's takings of where they work. Paid fairly (or no fair pay
// known yet): about 0.4 %; the further under the fair pay, the likelier (up to ~30 % unpaid by half); honest hands less, dishonest more; in the village a hand
// on bad terms with the couple (quan hệ ≤ 20) twice as likely.
// a refusal does not make them leave (owner, 2026-11-08: "không tăng thì vẫn làm chứ không bỏ trốn luôn, chỉ là tỷ lệ tăng lên thôi"): each refused ask since they
// were last paid fairly (wq.mad) adds the chance once more; it is cleared when the pay is fair again
function c4RunChance(wage, fair, ho, rel, mad) {
  const under = fair > 0 ? Math.max(0, 1 - wage / fair) : 0, h = ho === undefined ? .5 : ho;
  return Math.min(.35, (.004 + .3 * under) * (1.5 - h) * (rel !== undefined && rel <= 20 ? 2 : 1) * (1 + (mad || 0)));
}
function c4HandFair(h) {
  const H = h.hist; if (!H || H.length < 3) return 0;
  const avg = H.reduce((a, b) => a + b, 0) / H.length; return avg > 0 ? Math.max(5, Math.round(C4_FAIR * avg / 5) * 5) : 0;
}
{ const pay0 = c4PayHands;
  c4PayHands = function (d, quits) {
    for (const g of c4Owned()) {
      const H = c4Hands(g), b = (d.by && d.by[g]) || { take: 0, cogs: 0 }, rent = typeof c4RentOf === 'function' ? c4RentOf(g) || 0 : 0, take = b.take || 0;
      for (const h of [...H]) {
        const wage = c4Wage(g, h), q = h.wq || (h.wq = {}), who = `${c4Cap1(h.name)} (${C4_GOODS[g].name.toLowerCase()})`;
        (h.hist = h.hist || []).push(Math.round(take - (b.cogs || 0) - rent - wage)); if (h.hist.length > C4_FAIR_DAYS) h.hist.shift();
        const fair = c4HandFair(h);
        if (q.pend && q.pend.no) { q.mad = (q.mad || 0) + 1; q.pend = null; q.ask = SAVE4.day + 4 + ((Math.random() * 4) | 0); quits.push(`${who} không được tăng công, vẫn làm nhưng mặt nặng mày nhẹ.`); continue; }   // keeps working, likelier to run off (c4RunChance)
        if (!fair || wage >= fair - 4) { q.ask = null; q.pend = null; q.mad = 0; continue; }
        if (q.pend) { quits.push(`${who} vẫn chờ trả lời việc tăng công lên ${c4Money(q.pend.to)}.`); continue; }
        if (!q.ask) { q.ask = SAVE4.day + 4 + ((Math.random() * 4) | 0); continue; }
        if (SAVE4.day >= q.ask) { const to = Math.min(fair, wage + Math.max(1, Math.floor(wage * .1))); q.pend = { to, from: wage, day: SAVE4.day, g }; quits.push(`${who} kêu công ${c4Money(wage)} một ngày là ít, đòi tăng lên ${c4Money(to)}.`); }   // at most a tenth more each time (owner)
      }
    }
    return pay0(d, quits);
  }; }
// the asks waiting for an answer
function c4WageAsks() { const out = []; for (const g of c4Owned()) for (const h of c4Hands(g)) if (h.wq && h.wq.pend && !h.wq.pend.no) out.push({ g, h }); return out; }
let C4_WAGE_CUR = null;
function c4WageOpen() {
  const a = c4WageAsks()[0]; if (!a) return false;
  C4_WAGE_CUR = a; const m = c4Money, p = a.h.wq.pend, H = a.h.hist || [], avg = H.length ? Math.round(H.reduce((x, y) => x + y, 0) / H.length) : 0;
  $('#c4wageB').innerHTML = `<p><b>${c4Cap1(a.h.name)}</b>, người phụ hàng <b>${C4_GOODS[a.g].name.toLowerCase()}</b>, xin gặp:</p><p>“Làm lụng vất vả mà công tôi mới có ${m(p.from)} một ngày. Xin ông bà tăng lên ${m(p.to)}.”</p>`;
  $('#c4wageYes').textContent = `Tăng lên ${c4Money(p.to)}`;
  c4Sheets('c4wage'); return true;
}
function c4WageAnswer(yes) {
  const a = C4_WAGE_CUR; C4_WAGE_CUR = null; const p = a && a.h.wq && a.h.wq.pend; if (!p) { c4Sheets(null); return; }
  if (yes) { a.h.wageUp = (a.h.wageUp || 0) + Math.max(0, p.to - c4Wage(a.g, a.h)); a.h.wq.pend = null; a.h.wq.ask = null; toast(`Đã tăng công ${c4Cap1(a.h.name)} lên ${c4Money(p.to)} một ngày.`, 2.6); }
  else { p.no = true; toast(`Không tăng công. ${c4Cap1(a.h.name)} sầm mặt lại…`, 2.6); }
  persist4(); AU.tap();
  if (!c4WageOpen()) c4Sheets(null);
}
{
  const d = document.createElement('div'); d.id = 'c4wage'; d.className = 'c4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><h3>Người làm đòi tăng công</h3><div id="c4wageB"></div><div class="row col"><button class="btn" id="c4wageYes"></button><button class="btn alt" id="c4wageNo">Không tăng</button></div></div>';
  document.body.appendChild(d);
  $('#c4wageYes').addEventListener('click', () => c4WageAnswer(true));
  $('#c4wageNo').addEventListener('click', () => c4WageAnswer(false));
}
{ const sh0 = c4Sheets; c4Sheets = function (id) { const el = $('#c4wage'); if (el) el.hidden = id !== 'c4wage'; sh0(id === 'c4wage' ? null : id); if (id === 'c4wage') { C4.sheet = id; C4.paused = true; C4.sheetT = performance.now(); } }; }
// the loop calls the chapter's own update (registered in cho.js), so the hook goes there; reassigning updateC4 did nothing
{ const ch = chapterById(4), up0 = ch.update;
  ch.update = function (dt) {
    up0.call(this, dt);
    if (S.mode === 'c4play' && !C4.sheet && C4.phase === 'open' && (C4.wageT = (C4.wageT || 0) + dt) > 1.5) {
      C4.wageT = 0;
      if (!c4WageOpen() && typeof p4WageAsks === 'function' && SAVE4B && SAVE4B.house && p4WageAsks().length && C4.wageTold !== SAVE4.day) { C4.wageTold = SAVE4.day; toast('Có người làm trên phố huyện đang chờ gặp để xin tăng công.', 3.4); }
    }
  }; }
