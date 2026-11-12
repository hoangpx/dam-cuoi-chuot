/* Chương IV · the evening tally, shorter and easier to read (owner 2026-11-12: "bảng tổng kết quá dài, làm gọn hơn, nhìn thông minh hơn, thân
   thiện, vẫn đầy đủ thông tin"). Built by c4DayHtml from what c4EndDay (cho.js) gathered; nothing is left out, it is only ordered:
   1. the day's result: profit or loss in big, what came in and what went out, the goal bar;
   2. each stall on one line (c4ByShopHtml);
   3. "Chuyện hôm nay": one short line each, red dot for what went wrong, green for what went well;
   4. "Từng khoản thu chi": folded, every sum in and out and the purse from morning to evening. */
function c4DayHtml(d, gain, lines, quits, extra, gossip) {
  const m = c4Money, inn = Math.round(d.take + (d.got || 0)), out = Math.round(d.cogs + d.wiltLoss + d.spent + d.wages + (d.theft || 0) + (d.skim || 0));
  let h = `<div class="dhRes ${gain >= 0 ? 'gain' : 'loss'}"><span>${gain >= 0 ? 'Lãi hôm nay' : 'Lỗ hôm nay'}</span><b>${m(Math.abs(Math.round(gain)))}</b><small>Thu ${m(inn)} · Chi ${m(out)}</small></div>`;
  if (!SAVE4.goal) { const net = Math.max(0, c4Net()), p = Math.min(100, Math.round(net / C4_GOAL * 100)); h += `<div class="dhGoal"><span>Mục tiêu ${m(C4_GOAL)}</span><i><b style="width:${p}%"></b></i><small>đã để dành ${m(net)}</small></div>`; }
  if (c4Owned().length) h += `<h4 class="dhH">Từng hàng</h4>${c4ByShopHtml(d)}`;
  // what happened, worst first
  const it = [], add = (k, t) => it.push([k, t]);
  if (d.theft) add('bad', `Người phụ cuỗm mất ${m(d.theft)}`);
  for (const q of quits) add('bad', q);
  if (d.wiltLoss) add('bad', `Hàng hỏng phải bỏ${lines.length ? ': ' + lines.join(', ') : ''} (mất ${m(d.wiltLoss)})`);
  if (gossip) add('bad', `${gossip.who.length > 1 ? gossip.who.length + ' người' : 'Có người'} không ưa quán, nói ra nói vào${gossip.hurt.length ? `; ${gossip.hurt.length} người quen bớt quý` : ''}${gossip.cold ? `; ${gossip.cold} người lạ ngại ghé` : ''}`);
  add(d.lost > d.served * .25 ? 'bad' : '', `${d.served} khách mua${d.lost ? `, ${d.lost} khách bỏ đi` : ''}`);
  if (d.met) add('good', `Quen thêm ${d.met} khách (cả thảy ${c4People().list.filter(p => c4Known(p.id)).length} người quen)`);
  for (const e of extra) { const t = e.replace(/<[^>]+>/g, ''); add(/class="bad"/.test(e) || /đứt|mất|phạt|hụt|nợ|bỏ việc|bỏ đi|thiếu|tăng tiền/i.test(t) ? 'bad' : /thưởng|được tặng|hoàn thành|đủ chuỗi|giảm tiền/i.test(t) ? 'good' : '', e.replace(/^<br>/, '')); }
  if (typeof w4TownLine === 'function') { const t = w4TownLine(); if (t) { const [a, b] = t.replace(/^<br>/, '').split('<br>'); add('', b ? `${a}<details class="dhMore"><summary>từng nhà</summary>${b}</details>` : a); } }
  it.sort((x, y) => (x[0] === 'bad' ? 0 : x[0] === 'good' ? 2 : 1) - (y[0] === 'bad' ? 0 : y[0] === 'good' ? 2 : 1));
  h += `<h4 class="dhH">Chuyện hôm nay</h4><ul class="dhList">${it.map(([k, t]) => `<li class="${k}">${t}</li>`).join('')}</ul>`;
  // every sum, folded
  const rows = [['Bán được', d.take, 1], ['Thu khác', d.got || 0, 1], ['Tiền hàng', d.cogs, -1], ['Hàng hỏng', d.wiltLoss, -1], ['Công người làm', d.wages, -1]];
  const sp = d.sp || {}, spRows = Object.entries(sp).sort((a, b) => b[1] - a[1]); for (const [w, n] of spRows) rows.push([w, n, -1]);
  const rest = Math.round((d.spent || 0) - spRows.reduce((s, r) => s + r[1], 0)); if (rest > 0) rows.push(['Chi khác (cho vay, tiền chợ…)', rest, -1]);
  if (d.theft) rows.push(['Bị cuỗm', d.theft, -1]); if (d.skim) rows.push(['Bị bớt xén', d.skim, -1]);
  let led = '';
  if (d.m0 !== undefined) { const now = Math.round(SAVE4.money), exp = d.m0 - (d.bought || 0) + d.take - d.wages - d.spent + d.got - (d.theft || 0) - (d.skim || 0), off = now - Math.round(exp);
    led = `<p class="dhPurse">Trong túi: ${m(d.m0)} lúc sáng → <b>${m(now)}</b> tối nay${Math.abs(off) >= 1 ? `<br><small>Còn ${off > 0 ? 'dư' : 'hụt'} ${m(Math.abs(off))} từ các việc khác: trả nợ, vay, nhận tiền nợ, hàng giao sỉ.</small>` : ''}<br><small>Sáng mai còn có thể bị trừ: nợ đến hạn, quỹ phường, thuế cụ Lý.</small></p>`; }
  h += `<details class="dhMoney"><summary>Từng khoản thu chi</summary><table>${rows.filter(r => r[1]).map(([w, n, s]) => `<tr><td>${w}</td><td class="${s > 0 ? 'gain' : 'bad'}">${s > 0 ? '+' : '−'}${m(Math.round(n))}</td></tr>`).join('')}<tr class="sum"><td>${gain >= 0 ? 'Lãi' : 'Lỗ'}</td><td class="${gain >= 0 ? 'gain' : 'bad'}">${m(Math.abs(Math.round(gain)))}</td></tr></table>${led}</details>`;
  return h;
}

/* ---------- the town's evening, the same way (owner 2026-11-12: "làm cả phố"). eve = the evening's paragraphs (wages, each shop, rent, mishaps,
   asks, run-offs); a paragraph naming a shop in bold goes under that shop's row, folded; the rest become "Chuyện hôm nay". ---------- */
function p4DayHtml(wilt, eve, day0) {
  const SD = day0 || P4.shopDay || {};
  const m = c4Money, T = P4.today || {}, take = Math.round(T.take || 0), spent = Math.round(T.spent || 0) + Math.round(T.smash || 0), gain = take - spent;
  let h = `<div class="dhRes ${gain >= 0 ? 'gain' : 'loss'}"><span>${gain >= 0 ? 'Lãi hôm nay ở phố' : 'Lỗ hôm nay ở phố'}</span><b>${m(Math.abs(gain))}</b><small>Thu ${m(take)} · Chi ${m(spent)}</small></div>`;
  const box = document.createElement('div'); box.innerHTML = eve || '';
  const S = p4Shops(), byName = {}; for (const k in S) byName[String(S[k].name || '').trim().toUpperCase()] = k;
  const shopP = {}, other = [];
  for (const p of box.querySelectorAll('p')) { const b = p.querySelector('b'), k = b && byName[b.textContent.trim().toUpperCase()]; if (k) (shopP[k] = shopP[k] || []).push(p.innerHTML); else other.push(p); }
  // each house on one line, its details folded
  const rows = [], shopTake = Object.values(SD).reduce((s, x) => s + (x.take || 0), 0);
  { const bt = Math.max(0, take - shopTake), wages = p4Hands().reduce((a, h2) => a + (h2.wage || 0), 0); rows.push({ name: SAVE4B.name ? p4Cap1(String(SAVE4B.name).toLowerCase()) : 'Hiệu trầu', sub: `${T.sold || 0} miếng · thu ${m(Math.round(bt))}`, net: Math.round(bt - 3 * (T.sold || 0) - wages), more: '' }); }
  for (const k in S) { const R = S[k], D = SD[k] || { n: 0, take: 0, cost: 0 }; rows.push({ name: p4Cap1(String(R.name || '').toLowerCase()), sub: R.shut ? 'đóng cửa' : `${D.n || 0} phần · thu ${m(Math.round(D.take || 0))}`, net: R.hist && R.hist.length ? Math.round(R.hist[R.hist.length - 1]) : Math.round((D.take || 0) - (D.cost || 0)), more: (shopP[k] || []).join('<br>') }); }
  const max = Math.max(1, ...rows.map(r => Math.abs(r.net)));
  h += `<h4 class="dhH">Từng nhà</h4><div class="byshop">${rows.sort((a, b) => b.net - a.net).map(r => `<div class="bs p"><b>${p4Esc(r.name)}</b><span class="${r.net >= 0 ? 'gain' : 'bad'}">${r.net >= 0 ? '+' : '−'}${m(Math.abs(r.net))}</span><i class="bar${r.net < 0 ? ' neg' : ''}"><i style="width:${Math.abs(r.net) / max * 100}%"></i></i><small>${r.sub}</small>${r.more ? `<details class="dhMore"><summary>chi tiết</summary>${r.more}</details>` : ''}</div>`).join('')}</div>`;
  // what happened, worst first
  const it = [], add = (k, t) => it.push([k, t]);
  if (wilt) add('bad', `Trầu thừa héo mất ${wilt} miếng`);
  if (T.lost) add('bad', `${T.lost} khách đến mà hết trầu`);
  if (T.smash) add('bad', `Bị tay chân bá hộ phá: mất ${m(T.smash)}`);
  if (typeof p4Harass === 'function' && p4Harass() < 1) add('bad', 'Tay chân bá hộ còn quấy, khách ngại ghé');
  for (const p of other) { const t = p.textContent; add(p.classList.contains('bad') || /đứt|mất|phạt|hụt|nợ|bỏ việc|bỏ trốn|biến mất|thiếu|đòi tăng|tăng tiền|chưa trả/i.test(t) ? 'bad' : /thưởng|giảm tiền|hạ tiền/i.test(t) ? 'good' : '', p.innerHTML); }
  if (typeof w4VillageLine === 'function') { const v = w4VillageLine().replace(/^<p>|<\/p>$/g, ''); if (v) add('', v); }
  it.sort((x, y) => (x[0] === 'bad' ? 0 : x[0] === 'good' ? 2 : 1) - (y[0] === 'bad' ? 0 : y[0] === 'good' ? 2 : 1));
  if (it.length) h += `<h4 class="dhH">Chuyện hôm nay</h4><ul class="dhList">${it.map(([k, t]) => `<li class="${k}">${t}</li>`).join('')}</ul>`;
  h += `<details class="dhMoney"><summary>Thu chi</summary><table><tr><td>Bán được (trầu và các quán)</td><td class="gain">+${m(take)}</td></tr><tr><td>Đã chi (vốn hàng, công, thuê, chi vặt…)</td><td class="bad">−${m(Math.round(T.spent || 0))}</td></tr>${T.smash ? `<tr><td>Bị phá</td><td class="bad">−${m(T.smash)}</td></tr>` : ''}<tr class="sum"><td>${gain >= 0 ? 'Lãi' : 'Lỗ'}</td><td class="${gain >= 0 ? 'gain' : 'bad'}">${m(Math.abs(gain))}</td></tr></table><p class="dhPurse">Trong túi tối nay: <b>${m(Math.round(p4Purse()))}</b></p></details>`;
  return h;
}
