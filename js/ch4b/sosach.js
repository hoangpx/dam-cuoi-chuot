/* Chương IV · Sổ buôn bán (owner 2026-11-12: "biểu đồ lãi từng món theo ngày, món nào lỗ, giờ nào đông", then "làm thử"). A tab "Sổ" of the
   village book (dan.js): two figures (profit of the last 7 days against the 7 before; the ware that lost most), a stacked bar of each day's
   profit by ware (losses go below the line), and the customers served by double-hour, averaged over the days kept. A switch shows the village
   or the town. Tapping a day's bar shows that day: weather, each ware's sales and profit, what went bad.
   Nothing here is a hidden rule: only what happened. Kept 14 days: SAVE4.ledger (village) and SAVE4B.ledger (town), each
   { d, wx, gain, by: { key: { name, n, take, net } }, hrs: [counts by double-hour] }.
   Customers by hour are counted only while the player is at that market (sales made in the background have no hour). */
const C4_SO_DAYS = 14;
const C4_SO_COL = { trau: '#a3332a', che: '#4f7a3a', xoi: '#c9922b', xen: '#3b5a85', bun: '#8a5a3c', banhcuon: '#6b4f8a', ruou: '#b5546b', gom: '#5f6b6d', thuoc: '#3f7f74' };
const C4_SO_PAL = ['#a3332a', '#3b5a85', '#c9922b', '#4f7a3a', '#6b4f8a', '#8a5a3c', '#b5546b', '#3f7f74', '#5f6b6d', '#d07a2e'];
const C4_SO_HRS_LANG = ['Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu'];
const C4_SO_HRS_PHO = ['Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const c4SoHr = mins => Math.max(0, Math.floor((mins - 300) / 120));          // 5:00 → giờ Mão = 0
const c4SoPush = (L, e) => { const a = (L || []).filter(x => x.d !== e.d); a.push(e); return a.slice(-C4_SO_DAYS); };

// customers by hour, while the player is there
{ const s0 = c4Served; c4Served = function (w) { const d = C4.today; if (d) { const h = d.hrs || (d.hrs = []), i = Math.min(6, c4SoHr(C4.mins || 0)); h[i] = (h[i] || 0) + 1; } return s0.apply(this, arguments); }; }
{ const s0 = p4Served; p4Served = function (w, kind) { const d = P4.today; if (d) { const h = d.hrs || (d.hrs = []), i = Math.min(8, c4SoHr(P4.mins || 0)); h[i] = (h[i] || 0) + 1; } return s0.apply(this, arguments); }; }

// the village's evening: each ware's sales, what went bad, the day's profit
{ const end0 = c4EndDay;
  c4EndDay = function () {
    const wilt = {};
    try { for (const g of c4Owned()) { const G = C4_GOODS[g], n = Math.max(0, c4Stock(g) - (typeof cnKeepN === 'function' ? cnKeepN(g) : 0)); if (n && G.keep !== 'ever') wilt[g] = n * c4Unit(g); } } catch (e) {}
    const r = end0.apply(this, arguments);
    try {
      const d = C4.today, B = d.by || {}, by = {};
      for (const g of c4Owned()) { const b = B[g] || { take: 0, cogs: 0, n: 0 }; by[g] = { name: C4_GOODS[g].name, n: b.n || 0, take: Math.round(b.take || 0), net: Math.round((b.take || 0) - (b.cogs || 0) - (b.wage || 0) - (wilt[g] || 0)), bad: Math.round(wilt[g] || 0) }; }
      const gain = Math.round(d.take - d.cogs - d.wiltLoss - d.spent - d.wages + d.got - (d.theft || 0) - (d.skim || 0));
      SAVE4.ledger = c4SoPush(SAVE4.ledger, { d: SAVE4.day, wx: c4Wx(), gain, by, hrs: d.hrs || [] }); persist4();
    } catch (e) {}
    return r;
  }; }
// the town's evening: each shop (its profit after rent and wages, doicong.js R.hist) and the betel house
{ const end0 = p4EndDay;
  p4EndDay = function () {
    const day = SAVE4.day, take0 = P4.today ? P4.today.take || 0 : 0, sold0 = P4.today ? P4.today.sold || 0 : 0, hrs = (P4.today && P4.today.hrs) || [], spent0 = P4.today ? P4.today.spent || 0 : 0;
    const shopDay = JSON.parse(JSON.stringify(P4.shopDay || {}));
    const r = end0.apply(this, arguments);
    try {
      if (!SAVE4B.house) return r;
      const by = {}, S = p4Shops(); let shopTake = 0;
      for (const k in S) { const R = S[k], T = shopDay[k] || { n: 0, take: 0 }; shopTake += T.take || 0; by[k] = { name: p4Cap1(String(R.name || '').toLowerCase()), n: T.n || 0, take: Math.round(T.take || 0), net: R.hist && R.hist.length ? Math.round(R.hist[R.hist.length - 1]) : Math.round((T.take || 0) - (T.cost || 0)) }; }
      const bt = Math.max(0, take0 - shopTake), wages = p4Hands().reduce((a, h) => a + (h.wage || 0), 0);
      by.trau = { name: 'Hiệu trầu', n: sold0, take: Math.round(bt), net: Math.round(bt - 3 * sold0 - wages) };
      SAVE4B.ledger = c4SoPush(SAVE4B.ledger, { d: day, wx: c4Wx(), gain: Math.round(take0 - spent0), by, hrs }); p4Persist();
    } catch (e) {}
    return r;
  }; }

/* ---------- the tab ---------- */
let C4_SO = { place: 'lang', sel: null };
const c4SoLedger = () => (C4_SO.place === 'pho' ? (typeof SAVE4B !== 'undefined' && SAVE4B.ledger) : SAVE4.ledger) || [];
function c4SoColors(L) {
  const keys = [], col = {};
  for (const e of L) for (const k in e.by) if (!keys.includes(k)) keys.push(k);
  keys.forEach((k, i) => { col[k] = C4_SO.place === 'lang' && C4_SO_COL[k] ? C4_SO_COL[k] : k === 'trau' ? '#a3332a' : C4_SO_PAL[(i + 1) % C4_SO_PAL.length]; });
  return { keys, col };
}
const c4SoWx = { dep: 'nắng đẹp', gat: 'nắng gắt', mua: 'mưa', ret: 'rét' };
function c4SoTab() {
  const L = c4SoLedger(), hasPho = typeof SAVE4B !== 'undefined' && SAVE4B.house;
  let h = hasPho ? `<div class="row soPlace"><button class="btn ${C4_SO.place === 'lang' ? '' : 'alt'}" data-sop="lang">Chợ quê</button><button class="btn ${C4_SO.place === 'pho' ? '' : 'alt'}" data-sop="pho">Phố huyện</button></div>` : '';
  if (!L.length) return h + '<p>Chưa có gì trong sổ. Hết một ngày bán, sổ sẽ ghi lại.</p>';
  const last7 = L.slice(-7), prev7 = L.slice(-14, -7), sum = a => a.reduce((s, e) => s + e.gain, 0), s7 = sum(last7), p7 = sum(prev7);
  const tot = {}; for (const e of last7) for (const k in e.by) { const b = e.by[k]; (tot[k] = tot[k] || { name: b.name, net: 0, bad: 0 }).net += b.net; tot[k].bad += b.bad || 0; }
  const worst = Object.values(tot).sort((a, b) => a.net - b.net)[0];
  const cmp = prev7.length ? (p7 !== 0 ? Math.round((s7 - p7) / Math.abs(p7) * 100) : null) : null;
  h += `<div class="soTiles"><div><small>Lãi ${last7.length} ngày</small><b class="${s7 >= 0 ? 'gain' : 'bad'}">${s7 < 0 ? '−' : ''}${c4Money(Math.abs(s7))}</b>${cmp !== null ? `<em class="${cmp >= 0 ? 'gain' : 'bad'}">${cmp >= 0 ? 'hơn' : 'kém'} ${prev7.length} ngày trước ${Math.abs(cmp)} %</em>` : ''}</div>`
    + `<div><small>${worst && worst.net < 0 ? 'Món lỗ nhất' : 'Món lãi ít nhất'}</small><b>${worst ? c4Esc4(worst.name) : '—'}</b>${worst ? `<em class="${worst.net < 0 ? 'bad' : ''}">${worst.net < 0 ? 'lỗ' : 'lãi'} ${c4Money(Math.abs(worst.net))}${worst.bad ? ' · hỏng ' + c4Money(worst.bad) : ''}</em>` : ''}</div></div>`;
  h += `<h4>Lãi mỗi ngày theo món</h4>${c4SoBars(L)}`;
  h += `<h4>Khách theo giờ (trung bình)</h4>${c4SoHours(L)}`;
  if (C4_SO.sel !== null) { const e = L.find(x => x.d === C4_SO.sel); if (e) h += c4SoDay(e); }
  else h += '<p class="sm">Chạm vào một cột để xem ngày đó.</p>';
  return h;
}
function c4SoBars(L) {
  const { keys, col } = c4SoColors(L), W = 340, H = 170, top = 10, bot = 22, n = L.length, bw = Math.min(22, (W - 34) / n * .62), gap = (W - 34) / n;
  let mx = 1, mn = 0;
  for (const e of L) { let p = 0, q = 0; for (const k in e.by) { const v = e.by[k].net; if (v >= 0) p += v; else q += v; } mx = Math.max(mx, p); mn = Math.min(mn, q); }
  const sc = (H - top - bot) / (mx - mn), y0 = top + mx * sc;
  let s = `<svg class="soChart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lãi mỗi ngày theo món"><line x1="30" x2="${W}" y1="${y0}" y2="${y0}" stroke="#2b2620" stroke-width="1"/>`;
  s += `<text x="26" y="${top + 4}" text-anchor="end" class="soAx">${Math.round(mx)}</text>` + (mn < 0 ? `<text x="26" y="${H - bot}" text-anchor="end" class="soAx">${Math.round(mn)}</text>` : '') + `<text x="26" y="${y0 + 4}" text-anchor="end" class="soAx">0</text>`;
  L.forEach((e, i) => {
    const x = 34 + i * gap + (gap - bw) / 2; let up = y0, dn = y0;
    for (const k of keys) { const b = e.by[k]; if (!b || !b.net) continue; const hgt = Math.abs(b.net) * sc;
      if (b.net > 0) { up -= hgt; s += `<rect x="${x}" y="${up}" width="${bw}" height="${hgt}" fill="${col[k]}" stroke="#2b2620" stroke-width=".6"/>`; }
      else { s += `<rect x="${x}" y="${dn}" width="${bw}" height="${hgt}" fill="${col[k]}" stroke="#2b2620" stroke-width=".6" opacity=".8"/>`; dn += hgt; } }
    if (C4_SO.sel === e.d) s += `<rect x="${x - 3}" y="${top - 2}" width="${bw + 6}" height="${H - top - bot + 4}" fill="none" stroke="#a3332a" stroke-width="1.6" stroke-dasharray="3 2"/>`;
    s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" class="soAx">${e.d}</text><rect x="${34 + i * gap}" y="0" width="${gap}" height="${H}" fill="transparent" data-sod="${e.d}" style="cursor:pointer"/>`;
  });
  s += '</svg>';
  const leg = keys.map(k => { const nm = (L.slice().reverse().find(e => e.by[k]) || {}).by[k].name; return `<span><i style="background:${col[k]}"></i>${c4Esc4(nm)}</span>`; }).join('');
  return `<div class="soLeg">${leg}</div>${s}<p class="sm">Cột dưới vạch là lỗ (hàng hỏng, công người làm, bán dưới giá vốn). Số dưới cột là ngày.</p>`;
}
function c4SoHours(L) {
  const lab = C4_SO.place === 'pho' ? C4_SO_HRS_PHO : C4_SO_HRS_LANG, days = L.filter(e => e.hrs && e.hrs.some(v => v)), avg = lab.map((_, i) => days.length ? days.reduce((a, e) => a + (e.hrs[i] || 0), 0) / days.length : 0);
  if (!days.length) return '<p class="sm">Chưa đếm được: khách chỉ được đếm theo giờ khi mình có mặt ở chợ.</p>';
  const W = 340, H = 120, bot = 20, mx = Math.max(1, ...avg), gap = (W - 10) / lab.length, bw = Math.min(24, gap * .6);
  let s = `<svg class="soChart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Khách theo giờ">`;
  lab.forEach((l, i) => { const v = avg[i], hgt = v / mx * (H - bot - 14), x = 10 + i * gap + (gap - bw) / 2; s += `<rect x="${x}" y="${H - bot - hgt}" width="${bw}" height="${hgt}" fill="#3b5a85" stroke="#2b2620" stroke-width=".6"/><text x="${x + bw / 2}" y="${H - bot - hgt - 3}" text-anchor="middle" class="soAx">${Math.round(v)}</text><text x="${x + bw / 2}" y="${H - 5}" text-anchor="middle" class="soAx">${l}</text>`; });
  return s + `</svg><p class="sm">Tính trên ${days.length} ngày có mặt ở chợ.</p>`;
}
function c4SoDay(e) {
  const rows = Object.values(e.by).sort((a, b) => b.net - a.net).map(b => `<tr><td>${c4Esc4(b.name)}</td><td>${b.n}</td><td>${c4Money(b.take)}</td><td class="${b.net >= 0 ? 'gain' : 'bad'}">${b.net < 0 ? '−' : ''}${c4Money(Math.abs(b.net))}</td></tr>`).join('');
  return `<div class="soDay"><h4>Ngày ${e.d} · ${c4SoWx[e.wx] || ''}</h4><table><tr><th>Món</th><th>Bán</th><th>Thu</th><th>Lãi</th></tr>${rows}</table><p>Cả ngày: <b class="${e.gain >= 0 ? 'gain' : 'bad'}">${e.gain < 0 ? 'lỗ ' : 'lãi '}${c4Money(Math.abs(e.gain))}</b> (đã trừ mọi khoản chi).</p></div>`;
}
function c4SoWire(root) {
  if (!root) return;
  root.querySelectorAll('[data-sop]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_SO.place = b.dataset.sop; C4_SO.sel = null; c4OpenNotes('so'); }));
  root.querySelectorAll('[data-sod]').forEach(b => b.addEventListener('click', () => { AU.tap(); const d = +b.dataset.sod; C4_SO.sel = C4_SO.sel === d ? null : d; c4OpenNotes('so'); }));
}
