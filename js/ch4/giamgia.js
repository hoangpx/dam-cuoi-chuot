/* Chương IV · phần 1: SALES at each stall, and the treat that is now an INVITATION (owner, 2026-10-17).
   Sales: a stall's sheet sets a sale (how much off, from what hour to what hour, today only or every day). While it runs the price is lower,
   the folk you KNOW come in more (more the bigger the cut, shaped by the weather and luck), and each one served likes the stall more
   (by temper: the tight-fisted love it, the proud hardly care). But a stall that has a sale too many days running teaches its regulars
   to wait: from the 4th day in a row a share of the known folk will not buy that ware at the full price any more, larger every day;
   days without a sale wear the habit off. So a sale now and then (every 2-3 days) works best; nothing on screen says so.
   Invitations: the stall's "Mời khách" tab sends word to someone you know to come and try the ware. They may not come; if they do they
   come a while later (half an hour to a couple of hours), eat one portion for free, and like or dislike it by their taste (c4TreatEffect). */
const C4_SALE_PCTS = [10, 20, 30, 40, 50];
const c4SaleCfg = g => (SAVE4.sale || {})[g] || null;
const c4SaleToday = g => { const s = c4SaleCfg(g); return !!(s && s.pct > 0 && (s.daily || s.day === SAVE4.day)); };
const c4SaleNow = g => c4SaleToday(g) && C4.phase === 'open' && C4.mins >= c4SaleCfg(g).from * 60 && C4.mins < c4SaleCfg(g).to * 60;
const c4SalePct = g => (g && c4SaleNow(g) ? c4SaleCfg(g).pct : 0);
// the share of known folk who now wait for a sale before buying this ware (0 … .75)
const c4SaleWait = g => { const r = ((SAVE4.saleRun || {})[g]) || 0; return r > 3 ? Math.min(.75, .12 * (r - 3)) : 0; };
// a known resident who would buy g at the full price may hold back for a sale (c4Spawn)
function c4SaleHoldBack(P, g) { return !!(P && g && !c4SaleNow(g) && c4Known(P.id) && R() < c4SaleWait(g)); }
// the extra crowd: known folk drawn in by the sale, one every few seconds (shorter for a bigger cut), weather and luck
function c4SaleTick(dt) {
  if (C4.phase !== 'open') return; const T = C4.saleT || (C4.saleT = {});
  for (const g of c4Owned()) {
    const pct = c4SalePct(g); if (!pct) { delete T[g]; continue; }
    if (T[g] === undefined) T[g] = 2 + R() * 3;
    if ((T[g] -= dt) > 0) continue;
    const wx = (C4_GOODS[g].wx && C4_GOODS[g].wx[c4Wx()]) || 1;
    T[g] = 9 / (pct / 10) / Math.max(.3, wx) * (.6 + R());                  // 10 % ≈ one every 9 s, 50 % ≈ one every 2 s (a day is ~3½ min)
    if (c4Stock(g) < 1) continue;
    const here = new Set(C4.walkers.map(w => w.pid)), P = c4People();
    const cand = P.list.filter(p => c4Known(p.id) && !here.has(p.id) && !(p.nope || []).includes(g) && !(SAVE4.folk[p.id].away > SAVE4.day));
    if (!cand.length) continue;
    const wt = p => (.4 + SAVE4.folk[p.id].a / 100) * (C4_TRAITS[p.trait].half || 1) * (p.fav === g ? 1.6 : 1) * (.5 + R());
    let best = null, bw = -1; for (const p of cand) { const w = wt(p); if (w > bw) { bw = w; best = p; } }
    c4Spawn(undefined, { p: best, shop: g, sale: true });
  }
}
// a buyer served during a sale likes the stall more: by the cut, the temper and luck
function c4SaleServed(w, g) {
  const pct = c4SalePct(g); if (!pct || w.pid === undefined || !c4Known(w.pid)) return;
  const p = c4People().list[w.pid], T = C4_TRAITS[p.trait];
  c4Bump(p.id, Math.round(pct / 10 * (T.half || 1) * (.6 + R() * .8)));
  if (T.half < 1 && R() < .3) c4Say(w, c4Pick(['Rẻ thế này chắc hàng không ngon?', 'Tôi có thiếu tiền đâu mà phải chờ giảm giá.']));
  else if (R() < .25) c4Say(w, c4Pick(['Hôm nay rẻ thế, mua thêm!', 'Giảm giá à? Quý hoá quá!', 'Gặp đúng lúc giảm giá, may ghê!']));
}
// each evening: a stall that had a sale today counts one more day in a row; a day without wears the habit off by two
function c4SaleDayEnd() {
  const run = SAVE4.saleRun || (SAVE4.saleRun = {});
  for (const g of c4Owned()) run[g] = c4SaleToday(g) ? (run[g] || 0) + 1 : Math.max(0, (run[g] || 0) - 2);
}
// the stall sheet's block (Hàng quán tab)
function c4SaleBlock(g) {
  const d = document.createElement('div'); d.className = 'hands autof sale';
  const s = c4SaleCfg(g) || { pct: 0, from: 15, to: 18, daily: false, day: 0 }, on = c4SaleToday(g), now = c4SaleNow(g), wait = c4SaleWait(g);
  const hours = (a, b, v) => { let o = ''; for (let h = a; h <= b; h++) o += `<option value="${h}"${h === v ? ' selected' : ''}>${h}:00</option>`; return o; };
  d.innerHTML = `<h4>Giảm giá</h4><div class="auto3">
    <label>Giảm <select class="spct"><option value="0">Không giảm</option>${C4_SALE_PCTS.map(p => `<option value="${p}"${on && s.pct === p ? ' selected' : ''}>${p} %</option>`).join('')}</select></label>
    <label>từ <select class="sfrom">${hours(5, 18, s.from)}</select></label>
    <label>đến <select class="sto">${hours(6, 19, s.to)}</select></label>
    <label>Ngày nào cũng giảm <input type="checkbox" class="sdaily"${s.daily ? ' checked' : ''}></label></div>
    <p class="sm">${now ? `<b>Đang giảm ${s.pct} %</b>, bán ${c4Money(Math.round(c4Price(g) * (1 - s.pct / 100)))} thay vì ${c4Money(c4Price(g))}.` : on ? `Hôm nay giảm ${s.pct} % từ ${s.from}:00 đến ${s.to}:00.` : 'Không giảm giá.'}</p>`
    ;
  const save = () => {
    const pct = +d.querySelector('.spct').value, from = +d.querySelector('.sfrom').value, to = Math.max(from + 1, +d.querySelector('.sto').value), daily = d.querySelector('.sdaily').checked;
    (SAVE4.sale = SAVE4.sale || {})[g] = { pct, from, to, daily, day: SAVE4.day }; persist4(); AU.tap(); c4OpenUp(g);
  };
  d.querySelectorAll('select, input').forEach(e => e.addEventListener('change', save));
  return d;
}
// the stall's tag over the sign while a sale runs (c4SignDraw)
function c4SaleTag(g, ware) {
  const pct = c4SalePct(ware); if (!pct) return;
  g.save(); g.translate(48, C4_SIGN_Y - 22); g.rotate(.12); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.rect(-30, -11, 60, 22); g.fill(); g.stroke(); g.fillStyle = '#f2ecde'; g.font = '900 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(`GIẢM ${pct}%`, 0, 1); g.restore();
}

/* ---------- invitations ---------- */
function c4TreatInvite(id, g) {
  const p = c4People().list[id], f = c4F(id), T = C4_TRAITS[p.trait];
  if (f.treat === SAVE4.day) return;
  f.treat = SAVE4.day;
  const no = R() < Math.max(.1, Math.min(.6, .5 - (f.a || 0) / 200 + (T.meet ? .15 : 0) + (f.k ? 0 : .1)));
  const Q = C4.guestQ = C4.guestQ || []; if (C4.guestT === undefined) C4.guestT = 0;
  if (!C4.guestGoods) C4.guestGoods = () => [];
  Q.push({ p, at: C4.guestT + 8 + R() * 22, no, late: R() < .4, shop: g, treat: true }); Q.sort((a, b) => a.at - b.at);
  if (c4Ruot(id)) C4.today.invRuot = (C4.today.invRuot || 0) + 1;
  toast(`Đã nhắn ${p.name} ra quán ăn thử ${g === 'trau' ? 'miếng trầu' : C4_GOODS[g].name.toLowerCase()}. Người ta có đến không thì chưa biết.`, 3.4);
  AU.tap(); persist4();
}
// what the invited guest thinks of the portion, once eaten (the old instant treat's effect)
function c4TreatEffect(p, g) {
  const id = p.id, f = c4F(id), T = C4_TRAITS[p.trait], day = SAVE4.day, hard = !!(T.meet || T.sour || p.trait === 'ky'); f.facts = f.facts || [];
  if ((p.nope || []).includes(g)) {
    if (f.k) c4Bump(id, -6); else f.bad = true;
    if (!(f.nopeK = f.nopeK || []).includes(g)) { f.nopeK.push(g); f.facts.push(`Ngày ${day}: không ${c4NopeWord(g)}.`); }
    return `${c4Cap1(p.name)} xua tay: "Tôi không ${c4NopeWord(g)}! Mời thế này là chẳng hiểu gì tôi rồi."`;
  }
  if (g === p.fav) {
    if (!f.favK) f.facts.push(`Ngày ${day}: thích nhất ${C4_FAV_WORD[g] || C4_GOODS[g].name.toLowerCase()}.`); f.favK = day;
    if (f.k) c4Bump(id, 16);
    else { f.seen = f.seen || day; f.v = (f.v || 1) + 2; if (f.v >= (T.meet || 2)) { f.k = day; f.a = 50 - (f.bad ? 10 : 0); C4.today.met = (C4.today.met || 0) + 1; C4.noteNew = true; } }
    return `${c4Cap1(p.name)} sáng mắt lên: "Đúng món tôi thích! Cảm ơn cô nhé."${f.k === day ? ' Từ nay đã quen nhau.' : ''}`;
  }
  if (f.k) c4Bump(id, hard ? 1 : 4);
  return hard ? `${c4Cap1(p.name)} ăn cho phải phép, mặt vẫn lạnh tanh.` : `${c4Cap1(p.name)} ăn xong cảm ơn, vui vẻ ra về.`;
}
// the invited guest has been served (nguoiban.js): the free portion, then the verdict
function c4TreatServed(w, g) {
  if (!w.treat || w.pid === undefined) return;
  toast(c4TreatEffect(c4People().list[w.pid], g), 3.8); persist4(); c4Hud();
}
