/* Chương IV phần 2 · Phố Huyện: wages must match the shop (owner, 2026-11-08: "người làm trên phố huyện tiền phải xứng với thu nhập của tiệm
   đó, 10%; nếu trả không xứng thì cứ 4-7 ngày lại đòi tăng một lần, không tăng thì lấy tiền doanh thu của quán đó bỏ trốn, người sau cũng
   vậy, bao giờ tiền xứng với doanh thu của quán thì mới thôi").
   - Fair pay = 10 % of the shop's own profit (takings − goods − rent or tax by the day − the wages paid now; owner, 2026-11-08), averaged over its last 7 evenings (P4_FAIR, at least 3 evenings known). A shop (cuahang.js) pays its
     keeper and helpers together (p4WageOf, + R.raise); the betel house's hired hand (nguoilam.js) gets 10 % of the betel takings (shared if more).
   - Paid less than fair: an ask is set 4–7 days ahead (R.wq.ask / h.wq.ask). That evening the ask is raised (wq.pend, a line on the tally), and
     the next time the player is on the street a sheet asks: raise to the fair pay, or refuse. Refused (only a refusal; an ask waits until it is answered
     after it was raised): that evening the worker runs off with the shop's day's takings. A shop gets a new keeper at once at the same pay,
     the betel hand is simply gone (hire again); the new one does the same in 4–7 days until the pay is fair. */
const P4_FAIR = .1, P4_FAIR_DAYS = 7;
// one ask is at most a tenth more than the pay now (owner, 2026-11-08: "mỗi lần đòi cũng không quá 10% tiền lương hiện tại"); they ask again later
const p4AskTo = (wage, fair) => Math.min(fair, wage + Math.max(1, Math.floor(wage * .1)));
const p4Rand47 = () => 4 + ((Math.random() * 4) | 0);
const p4Round5 = n => Math.max(5, Math.round(n / 5) * 5);
const p4KeeperName = () => p4Cap1(p4Pick(C4_HAND_TITLES) + ' ' + p4Pick(C4_HAND_NAMES));
// the shop's keeper has a name now (for the asking and the running off)
const p4Keeper = R => R.kn || (R.kn = p4KeeperName());
function p4FairOf(hist, share) {
  if (!hist || hist.length < 3) return 0;
  const avg = hist.reduce((a, b) => a + b, 0) / hist.length; if (avg <= 0) return 0;   // a shop at a loss: nobody asks
  return p4Round5(P4_FAIR * hist.reduce((a, b) => a + b, 0) / hist.length / (share || 1));
}
// fair pay by the takings (owner, 2026-11-09, approved proposal: "công xứng đáng tính theo doanh thu"): the keeper the trade's share (P4_CAT: eating 18 %,
// staples 8 %, trade 11 %, the goldsmith 6 %, lamps 12 %) of the last 7 evenings' takings (R.tk, cuahang.js), a helper half of it; the betel house's
// hands share 6 % of its takings (about the old 10 % of its profit). p4FairOf now reads takings.
const p4FairShare = (hist, k) => { if (!hist || hist.length < 3) return 0; const avg = hist.reduce((a, b) => a + b, 0) / hist.length; return avg > 0 ? p4Round5(k * avg) : 0; };
const p4ShopFair = R => p4FairShare(R.tk, (P4_CAT[p4Kind(R).cat] || P4_CAT.cd).l);
const p4HelpFair = R => p4Round5(.5 * p4ShopFair(R));
const p4HandFair = h => p4FairShare(SAVE4B.trauHist, .06 / Math.max(1, p4Hands().length));
// one evening's look at a worker: q = its wage state, take = today's takings of what it minds, wage / fair now; returns a tally line
function p4WageEvening(q, who, take, wage, fair, onRun) {
  if (q.pend && q.pend.no) { q.mad = (q.mad || 0) + 1; q.pend = null; q.ask = SAVE4.day + p4Rand47(); return `<p>${who} không được tăng công, vẫn làm nhưng mặt nặng mày nhẹ.</p>`; }   // keeps working, likelier to run off (owner)
  if (!fair || wage >= fair - 4) { q.ask = null; q.pend = null; q.mad = 0; return ''; }
  if (q.pend) return `<p>${who} vẫn chờ trả lời việc tăng công lên ${c4Money(q.pend.to)}.</p>`;
  if (!q.ask) { q.ask = SAVE4.day + p4Rand47(); return ''; }
  if (SAVE4.day >= q.ask) { const to = p4AskTo(wage, fair); q.pend = { to, from: wage, day: SAVE4.day }; return `<p class="bad">${who} kêu công ${c4Money(wage)} một ngày là ít, đòi tăng lên ${c4Money(to)}.</p>`; }
  return '';
}
{ const pay0 = p4PayHands;
  p4PayHands = function () {
    const out = [], S = p4Shops(); let shopTake = 0; p4Ran = false;
    // (2026-11-09) a keeper who replaced one who ran off used to inherit his grudge: clear the grudges of old saves once
    if (!SAVE4B.madFix) { SAVE4B.madFix = 1; for (const k in S) if (S[k].wq) S[k].wq.mad = 0; }
    for (const key in S) {
      const R = p4ShopFix(S[key]), T = (P4.shopDay || {})[key] || { take: 0 }; shopTake += T.take || 0;
      // the shop's own profit of the day, after every cost: goods, the week's rent or tax by the day, and the wages it pays now
      if (!R.histP) { R.hist = []; R.histP = 1; }                           // (the first version kept takings: start over)
      const rentDay = (R.own === 'buy' ? p4TaxOf(R) : p4RentNow(R)) / 7;
      R.hist.push(Math.round((T.take || 0) - (T.cost || 0) - rentDay - p4WageOf(R))); if (R.hist.length > P4_FAIR_DAYS) R.hist.shift();
      const q = R.wq || (R.wq = {}), who = `${p4Keeper(R)} (${p4Kind(R).keeper} ${R.name})`;
      const newKeeper = () => { R.kn = p4KeeperName(); R.kho = Math.random(); R.ksp = Math.random(); R.kwm = Math.random(); R.wq = { ask: SAVE4.day + p4Rand47() }; return `<p>${p4Cap1(p4Kind(R).keeper)} mới ${R.kn} đến đứng ${p4Esc(R.name)}, công vẫn như cũ.</p>`; };
      if (R.kho === undefined) R.kho = Math.random();                       // the keeper's honesty, like a hand's
      const kn0 = R.kn, line = p4WageEvening(q, who, T.take || 0, p4KeeperWage(R), p4ShopFair(R), newKeeper), tired = typeof p4Tired === 'function' && p4Tired(R) ? 2 : 1;
      c4SulkDrift(R, 'ksp', 'kwm', c4Unhappy(q, q.rel, p4KeeperWage(R), p4ShopFair(R)));   // unhappy: slower and colder first (doicong-que.js)
      out.push(line || (R.kn === kn0 && !p4Ran ? p4RandomRun(who, T.take || 0, p4KeeperWage(R), p4ShopFair(R), R.kho, newKeeper, q, tired, { sp: R.ksp, wm: R.kwm }) : ''));
      // the helpers: they ask on their own; refused, they leave a few days later instead of running off, and meanwhile now and then take a little
      for (const h of [...p4ShopHands(R)]) {
        const hq = h.wq || (h.wq = {}), hw = `Người phụ ${p4Cap1(h.name)} (${R.name})`, fair = p4HelpFair(R), wage = p4HelpWage(R, h);
        if (h.quit && SAVE4.day >= h.quit) { p4ShopHands(R).splice(p4ShopHands(R).indexOf(h), 1); out.push(`<p class="bad">${hw} đã thôi việc.</p>`); continue; }
        if (hq.pend && hq.pend.no) { hq.mad = (hq.mad || 0) + 1; hq.pend = null; hq.ask = null; h.quit = h.quit || SAVE4.day + 2 + ((Math.random() * 3) | 0); out.push(`<p class="bad">${hw} không được tăng công, nói mấy hôm nữa sẽ nghỉ.</p>`); continue; }
        const l2 = h.quit ? '' : p4WageEvening(hq, hw, T.take || 0, wage, fair, () => '');
        if (l2) { out.push(l2); continue; }
        c4SulkDrift(h, 'sp', 'wm', c4Unhappy(hq, hq.rel, wage, fair));
        const pRun = c4RunChance(wage, fair, h.ho, undefined, hq.mad, hq) * tired;
        if (!c4Thief(hq, h.sp, h.wm, h.ho)) { if (Math.random() < pRun * C4_QUIT_K) { p4ShopHands(R).splice(p4ShopHands(R).indexOf(h), 1); out.push(`<p class="bad">${hw} bỏ việc, không làm nữa.</p>`); } continue; }
        if (T.take > 0 && Math.random() < pRun) {
          const lost = Math.min(Math.round(p4Purse()), Math.round((.1 + .1 * Math.random()) * T.take)); if (lost > 0) { SAVE4.money -= lost; P4.today.spent += lost; out.push(`<p class="bad">Cuối ngày đếm tiền ${p4Esc(R.name)} thấy hụt ${c4Money(lost)}.</p>`); }
        }
      }
    }
    const trau = Math.max(0, Math.round((P4.today.take || 0) - shopTake));
    const H = p4Hands();
    // the betel house's own profit: its takings less the betel (3 đồng a quid) and its hands' wages (the house is ours: no rent)
    if (!SAVE4B.trauHistP) { SAVE4B.trauHist = []; SAVE4B.trauHistP = 1; }
    if (SAVE4B.trauHistP !== 2) { SAVE4B.trauHist = []; SAVE4B.trauHistP = 2; }   // (2026-11-09: takings now, not profit)
    SAVE4B.trauHist.push(Math.round(trau)); if (SAVE4B.trauHist.length > P4_FAIR_DAYS) SAVE4B.trauHist.shift();
    for (const h of H.slice()) {
      const q = h.wq || (h.wq = {});
      const gone = () => { H.splice(H.indexOf(h), 1); const s = P4.sellers && P4.sellers.find(m => m.h === h); if (s) { P4.sellers.splice(P4.sellers.indexOf(s), 1); P4.sellers.forEach((m, k) => { m.slot = k; }); } };
      const line = p4WageEvening(q, `${p4Cap1(h.name)} (hiệu trầu)`, trau / H.length, h.wage, p4HandFair(h), gone);
      c4SulkDrift(h, 'sp', 'wm', c4Unhappy(q, q.rel, h.wage, p4HandFair(h)));
      out.push(line || (H.includes(h) && !p4Ran ? p4RandomRun(`${p4Cap1(h.name)} (hiệu trầu)`, trau / H.length, h.wage, p4HandFair(h), h.ho, gone, q, 1, { sp: h.sp, wm: h.wm }) : ''));
    }
    p4Persist(); persist4();
    return pay0() + out.join('');
  }; }
// the shared rule (c4RunChance, js/ch4/doicong-que.js): now and then a worker runs off with the day's takings anyway, rarely when paid fairly
let p4Ran = false;
function p4RandomRun(who, take, wage, fair, ho, onRun, q, mult, tr) {
  const p = Math.min(.35, c4RunChance(wage, fair, ho, undefined, q && q.mad, q) * (mult || 1)), t = tr || {};
  if (!c4Thief(q, t.sp, t.wm, ho)) { if (Math.random() >= p * C4_QUIT_K) return ''; return `<p class="bad">${who} bỏ việc, không làm nữa.</p>` + (onRun() || ''); }   // normally they just leave (doicong-que.js)
  if (!(take > 0) || Math.random() >= p) return '';
  p4Ran = true;
  const lost = Math.max(0, Math.min(Math.round(take), Math.round(p4Purse()))); if (lost) { SAVE4.money -= lost; P4.today.spent += lost; }
  return `<p class="bad">${who} ôm ${c4Money(lost)} tiền bán hàng hôm nay rồi biến mất.</p>` + (onRun() || '');
}
// the asks waiting for an answer: shops first, then the betel hand
function p4WageAsks() {
  const out = [], S = p4Shops();
  for (const key in S) { const R = S[key]; if (R.wq && R.wq.pend && !R.wq.pend.no) out.push({ kind: 'shop', key, R }); for (const h of (R.hands || [])) if (h.wq && h.wq.pend && !h.wq.pend.no) out.push({ kind: 'help', key, R, h }); }
  for (const h of p4Hands()) if (h.wq && h.wq.pend && !h.wq.pend.no) out.push({ kind: 'hand', h });
  return out;
}
let P4_WAGE_CUR = null;
function p4WageOpen() {
  const a = p4WageAsks()[0]; if (!a) return false;
  P4_WAGE_CUR = a; const m = c4Money, q = a.kind === 'shop' ? a.R.wq : a.h.wq, p = q.pend;
  const who = a.kind === 'shop' ? `<b>${p4Esc(p4Keeper(a.R))}</b>, ${p4Kind(a.R).keeper} quán <b>${p4Esc(a.R.name)}</b>` : a.kind === 'help' ? `<b>${p4Esc(p4Cap1(a.h.name))}</b>, người phụ quán <b>${p4Esc(a.R.name)}</b>` : `<b>${p4Esc(p4Cap1(a.h.name))}</b>, người làm hiệu trầu`;
  const hist = a.kind === 'shop' ? a.R.hist : SAVE4B.trauHist, avg = hist && hist.length ? Math.round(hist.reduce((x, y) => x + y, 0) / hist.length) : 0;
  $('#p4wageB').innerHTML = `<p>${who} xin gặp:</p><p class="say">“Làm lụng vất vả mà công tôi mới có ${m(p.from)} một ngày. Xin ông bà tăng lên ${m(p.to)}.”</p>`;
  $('#p4wageYes').textContent = `Tăng lên ${m(p.to)}`;
  p4Sheets('p4wage'); return true;
}
function p4WageAnswer(yes) {
  const a = P4_WAGE_CUR; P4_WAGE_CUR = null; if (!a) { p4Sheets(null); return; }
  const q = a.kind === 'shop' ? a.R.wq : a.h.wq, p = q.pend; if (!p) { p4Sheets(null); return; }
  if (yes) {
    if (a.kind === 'shop') a.R.raise = p.to - p4KeeperBase(a.R); else if (a.kind === 'help') { a.h.raise = p.to - p4HelpBase(a.R); a.h.quit = null; } else { if (!a.h.w0) a.h.w0 = a.h.wage; a.h.wage = p.to; }
    q.pend = null; q.ask = null; q.mad = 0; q.ok = SAVE4.day; toast(`Đã tăng công lên ${c4Money(p.to)} một ngày.`, 2.6);
  } else { p.no = true; toast('Không tăng công. Người làm sầm mặt lại…', 2.6); }
  p4Persist(); AU.tap();
  if (!p4WageOpen()) p4Sheets(null);
}
// the sheet, and asking whenever the player is on the open street with nothing else up
{
  const d = document.createElement('div'); d.id = 'p4wage'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><h3>Người làm đòi tăng công</h3><div id="p4wageB"></div><div class="row col"><button class="btn" id="p4wageYes"></button><button class="btn alt" id="p4wageNo">Không tăng</button></div></div>';
  document.body.appendChild(d);
  $('#p4wageYes').addEventListener('click', () => p4WageAnswer(true));
  $('#p4wageNo').addEventListener('click', () => p4WageAnswer(false));
}
{ const sh0 = p4Sheets; p4Sheets = function (id) { const el = $('#p4wage'); if (el) el.hidden = id !== 'p4wage'; sh0(id === 'p4wage' ? null : id); if (id === 'p4wage') { P4.sheet = id; P4.paused = true; P4.sheetT = performance.now(); } }; }
// the loop calls the chapter's own update (registered in game.js before this file), so the hook goes there; reassigning updateP4 did nothing
{ const ch = chapterById('4b'), up0 = ch.update;
  ch.update = function (dt) {
    up0.call(this, dt);
    if (S.mode === 'c4bplay' && !P4.sheet && !P4T.on && P4.phase === 'open' && (P4.wageT = (P4.wageT || 0) + dt) > 1.5) {
      P4.wageT = 0;
      if (!p4WageOpen() && typeof c4WageAsks === 'function' && c4WageAsks().length && P4.wageTold !== SAVE4.day) { P4.wageTold = SAVE4.day; toast('Có người phụ ở chợ quê đang chờ gặp để xin tăng công.', 3.4); }
    }
  }; }
// the player sets each worker's pay (owner, 2026-11-09: "người chơi muốn tự chọn trả tiền thuê người trên phố chứ không muốn áp đặt"): on the shop
// sheet (keeper, helpers) and the betel house's sheet (hands) a "Bớt công" / "Thêm công" pair moves the pay a step (a tenth of the plain pay, at
// least 5 đồng), between half and three times the plain pay. The evening rules stay: paid under fair they still ask, paid fairly they do not.
// A raise that reaches a waiting ask answers it with yes (grudge gone, 7 days of grace); any other raise eases one grudge; a cut adds one grudge,
// ends the grace and brings the next ask closer. (Nothing of this is told to the player.)
const p4WageStep = base => Math.max(5, p4R5(base * .1));
function p4WageSet(q, cur, base, d) {
  const step = p4WageStep(base), to = Math.max(Math.max(5, p4R5(base * .5)), Math.min(base * 3, cur + d * step));
  if (to === cur) return cur;
  if (to > cur) {
    if (q.pend && !q.pend.no && to >= q.pend.to) { q.pend = null; q.ask = null; q.mad = 0; q.ok = SAVE4.day; }
    else if (q.mad) q.mad--;
  } else {
    q.mad = (q.mad || 0) + 1; q.ok = null; if (q.pend) q.pend.from = to;
    if (!q.ask || q.ask > SAVE4.day + 2) q.ask = SAVE4.day + 2;
  }
  return to;
}
// d: +1 / −1; who: 'k' (the keeper) or a helper's index
function p4ShopWage(R, who, d) {
  if (who === 'k') { const b = p4KeeperBase(R), to = p4WageSet(R.wq || (R.wq = {}), p4KeeperWage(R), b, d); R.raise = to - b; return to; }
  const h = p4ShopHands(R)[+who]; if (!h) return 0;
  const b = p4HelpBase(R), to = p4WageSet(h.wq || (h.wq = {}), p4HelpWage(R, h), b, d); h.raise = to - b; return to;
}
function p4HandWage(h, d) { if (!h.w0) h.w0 = h.wage; h.wage = p4WageSet(h.wq || (h.wq = {}), h.wage, h.w0, d); return h.wage; }
const p4WageBtns = (attr, can) => `<button class="btn alt" ${attr} data-d="-1"${can.dn ? '' : ' disabled'}>Bớt công</button><button class="btn alt" ${attr} data-d="1"${can.up ? '' : ' disabled'}>Thêm công</button>`;
const p4WageCan = (cur, base) => ({ dn: cur > Math.max(5, p4R5(base * .5)), up: cur < base * 3 });
