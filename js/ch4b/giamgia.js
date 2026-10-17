/* Chương IV · phần 2 (phố huyện): SALES, the same rule as part 1's js/ch4/giamgia.js (owner, 2026-10-17: every rule goes to both parts).
   The couple's betel house ('home') and each eating house they rent or own (keyed by its x) can run a sale: how much off, from what hour
   to what hour, today only or every day. While it runs the price is lower and more customers come (more the bigger the cut, shaped by the
   weather and luck). The town has no named regulars, so the habit is the street's: from the 4th sale day in a row a share of the buyers
   will not pay the full price any more (larger every day, up to 75 %); days without a sale wear it off by two days each. */
const P4_SALE_PCTS = [10, 20, 30, 40, 50];
const p4SaleCfg = k => (SAVE4B.sale || {})[k] || null;
const p4SaleToday = k => { const s = p4SaleCfg(k); return !!(s && s.pct > 0 && (s.daily || s.day === SAVE4.day)); };
const p4SaleNow = k => p4SaleToday(k) && P4.phase === 'open' && P4.mins >= p4SaleCfg(k).from * 60 && P4.mins < p4SaleCfg(k).to * 60;
const p4SalePct = k => (p4SaleNow(k) ? p4SaleCfg(k).pct : 0);
const p4SaleWait = k => { const r = ((SAVE4B.saleRun || {})[k]) || 0; return r > 3 ? Math.min(.75, .12 * (r - 3)) : 0; };
// how many more (or fewer) customers come to k right now
function p4SaleK(k) {
  const pct = p4SalePct(k);
  if (pct) return (1 + pct / 100 * 2.5) * p4WxFlow() * (.7 + Math.random() * .6);
  return 1 - p4SaleWait(k);
}
const p4SalePrice = (k, full) => { const pct = p4SalePct(k); return pct ? Math.round(full * (1 - pct / 100)) : full; };
// each evening (p4EndDay): one more sale day in a row, or two days of the habit worn off
function p4SaleDayEnd() {
  const run = SAVE4B.saleRun || (SAVE4B.saleRun = {}), keys = ['home', ...Object.keys(SAVE4B.shops || {})];
  for (const k of keys) run[k] = p4SaleToday(k) ? (run[k] || 0) + 1 : Math.max(0, (run[k] || 0) - 2);
}
// the block on the house's sheet and on an eating house's sheet; reopen() redraws that sheet
function p4SaleBlock(k, reopen) {
  const d = document.createElement('div'); d.className = 'hands autof sale';
  const s = p4SaleCfg(k) || { pct: 0, from: 17, to: 20, daily: false, day: 0 }, on = p4SaleToday(k), now = p4SaleNow(k), wait = p4SaleWait(k);
  const hours = (a, b, v) => { let o = ''; for (let h = a; h <= b; h++) o += `<option value="${h}"${h === v ? ' selected' : ''}>${h}:00</option>`; return o; };
  d.innerHTML = `<h4>Giảm giá</h4><div class="auto3">
    <label>Giảm <select class="spct"><option value="0">Không giảm</option>${P4_SALE_PCTS.map(p => `<option value="${p}"${on && s.pct === p ? ' selected' : ''}>${p} %</option>`).join('')}</select></label>
    <label>từ <select class="sfrom">${hours(5, 22, s.from)}</select></label>
    <label>đến <select class="sto">${hours(6, 23, s.to)}</select></label>
    <label>Ngày nào cũng giảm <input type="checkbox" class="sdaily"${s.daily ? ' checked' : ''}></label></div>
    <p class="sm">${now ? `<b>Đang giảm ${s.pct} %.</b>` : on ? `Hôm nay giảm ${s.pct} % từ ${s.from}:00 đến ${s.to}:00.` : 'Không giảm giá.'}</p>`
    + (wait > 0 ? `<p class="sm bad">Giảm liền nhiều ngày rồi: khoảng ${Math.round(wait * 100)} % khách giờ chỉ chờ giảm giá mới mua.</p>` : '');
  const save = () => {
    const pct = +d.querySelector('.spct').value, from = +d.querySelector('.sfrom').value, to = Math.max(from + 1, +d.querySelector('.sto').value), daily = d.querySelector('.sdaily').checked;
    (SAVE4B.sale = SAVE4B.sale || {})[k] = { pct, from, to, daily, day: SAVE4.day }; p4Persist(); AU.tap(); reopen();
  };
  d.querySelectorAll('select, input').forEach(e => e.addEventListener('change', save));
  return d;
}
// GIẢM n% hung by a board while its sale runs (p4TownFront, in the board's own frame)
function p4SaleTag(g, hx, hy, s, k) {
  const pct = p4SalePct(k); if (!pct) return;
  g.save(); g.translate(hx, hy); g.scale(s, s); g.translate(52, -150); g.rotate(.12); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.rect(-30, -11, 60, 22); g.fill(); g.stroke(); g.fillStyle = '#f2ecde'; g.font = '900 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(`GIẢM ${pct}%`, 0, 1); g.restore();
}
// a sheet drawn again keeps its scroll (owner, 2026-10-17, part 1's fix brought here)
function p4KeepScroll(id, draw) {
  const el = $('#' + id), c = el && el.querySelector('.card4'), same = P4.sheet === id, y = same && c ? c.scrollTop : 0, y2 = same && el ? el.scrollTop : 0;
  draw(); if (same) { if (c) c.scrollTop = y; if (el) el.scrollTop = y2; }
}
