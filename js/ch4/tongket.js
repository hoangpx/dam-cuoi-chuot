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
