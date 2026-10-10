/* ---------- Tai hoạ cho mọi hàng (owner, 2026-10-09): the misfortunes were all about betel. Now they reach every ware the couple sells:
   the gale, the fire and the thief take from several stalls; a beggar asks for a bowl of bún "vì đói quá"; a buffalo smashes the bowls
   of the chè / bún / xôi stalls; a meat, fish or chicken stall buys rotten goods; a shop that sells on credit is cheated out of its money
   ("Khế ước đâu? Khế ước đâu?"); and the rich are squeezed by the local officials. Losses scale with each stall's level (c4LossMult). ---------- */
const c4Lvl = g => g === 'trau' ? SAVE4.lv || 0 : c4SLvI(g);
const c4Wn = g => g === 'trau' ? 'trầu' : C4_GOODS[g].name.toLowerCase();
const c4Un = g => C4_GOODS[g].unit;
const c4Stocked = pool => (pool || c4Owned()).filter(g => c4Stock(g) > 0);
const c4Shuf = a => a.map(x => [R(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
// a share of the stock goes from up to `n` wares (sturdier stalls lose less); returns what to say, e.g. "3 miếng trầu, 2 bát chè"
function c4Dmg(frac, n = 3, pool) {
  const out = [];
  for (const g of c4Shuf(c4Stocked(pool)).slice(0, n)) {
    const f = frac * (1 - .1 * Math.min(c4Lvl(g), 4)), k = Math.max(1, Math.ceil(c4Stock(g) * f * (.7 + R() * .6)));
    const lose = Math.min(c4Stock(g), k); c4SetStock(g, c4Stock(g) - lose); out.push(`${lose} ${c4Un(g)} ${c4Wn(g)}`);
  }
  c4Hud(); persist4(); return out.join(', ');
}
// one ware with stock, preferring a kind; null if nothing on sale
const c4StockedOf = kinds => { const a = c4Stocked(), b = kinds ? a.filter(g => kinds.includes(g)) : a; return b.length ? c4Pick(b) : null; };
const c4Spend = n => { n = Math.min(Math.max(0, SAVE4.money), Math.round(n)); SAVE4.money -= n; if (C4.today) C4.today.spent += n; return n; };
const C4_FOOD = ['che', 'xoi', 'bun'], C4_MEAT = ['thit', 'ca', 'ga'];
const c4NoFood = () => c4Owned().filter(g => !C4_FOOD.includes(g) && !C4_MEAT.includes(g));

Object.assign(C4_EXTRA_EV, {
  // a buffalo runs wild through a food stall: the bowls are smashed; the price follows the stall's level and tables
  trauhuc(E) {
    const gs = c4Owned().filter(g => C4_FOOD.includes(g)); if (!gs.length) return false;
    const g = c4Pick(gs), s = SAVE4.shops[g], lv = c4Lvl(g), cost = Math.round((14 + 10 * lv) * (1 + .25 * (s.tables || 0))), owner = c4Someone();
    E.def = 0; Object.assign(E, { title: 'Trâu húc đổ quán!', text: `Con trâu của ${owner} sổng chuồng, chạy xộc qua hàng ${c4Wn(g)}: bát đĩa vỡ tan tành! Mua lại bát đĩa hết ${c4Money(cost)} (hàng càng khang trang, bát đĩa càng đắt).`, opts: [
      [`Mua bát đĩa mới · ${c4Money(cost)}`, () => { c4Spend(cost); toast('Mua xong bát đĩa mới, quán lại sáng choang.', 3); }, SAVE4.money >= cost],
      [`Bắt ${owner} đền (45% họ chịu)`, () => { if (R() < .45) { c4Spend(Math.round(cost * .4)); toast(`${c4Cap1(owner)} xin lỗi rối rít, đền hai phần ba tiền bát đĩa.`, 3.4); } else { c4Spend(cost); toast(`${c4Cap1(owner)} chối bai bải: "Trâu nó tự chạy!" Đành tự mua bát mới.`, 3.4); } }]] });
  },
  // meat, fish or chicken bought from a hawker turns out off
  thiu(E) {
    const gs = c4Owned().filter(g => C4_MEAT.includes(g)); if (!gs.length) return false;
    const g = c4Pick(gs), n = Math.max(3, Math.ceil(Math.max(c4Stock(g), 4) * .5));
    E.def = 0; Object.assign(E, { title: 'Mua phải hàng ôi', text: `Lái buôn bán rẻ ${c4Wn(g)} nhưng mở ra đã thấy thiu: ruồi bu, mùi hôi nồng. Cỡ ${n} ${c4Un(g)} có nguy cơ hỏng.`, opts: [
      ['Đổ bỏ phần ôi', () => { const lost = Math.min(c4Stock(g), n); c4SetStock(g, c4Stock(g) - lost); c4Hud(); persist4(); toast(`Đổ đi ${lost} ${c4Un(g)} ${c4Wn(g)}. Mất cả vốn nhưng giữ được tiếng.`, 3.2); }],
      ['Rửa sạch rồi bán vẫn (45% khách đau bụng)', () => { if (R() < .45) { const c = c4Spend(40 + 25 * c4Lvl(g)); for (const p of c4People().list) if (c4Known(p.id) && R() < .3) c4Bump(p.id, -5); toast(`Khách ăn xong đau bụng, kéo đến đòi đền ${c4Money(c)}, cả chợ bàn tán.`, 3.8); } else toast('Rửa kỹ nên không ai biết. May quá!', 3); }]] });
  },
  // a customer of a non-food ware takes goods and will not pay: "khế ước đâu?"
  quit(E) {
    const gs = c4Stocked(c4NoFood()); if (!gs.length) return false;
    const g = c4Pick(gs), n = Math.min(c4Stock(g), 4 + ((R() * 4) | 0)), val = Math.round(n * c4Price(g)), who = c4Someone(), fee = Math.max(10, Math.round(val * .15));
    c4SetStock(g, Math.max(0, c4Stock(g) - n)); c4Hud();                    // the goods are already gone
    E.def = 0; Object.assign(E, { title: 'Bị quịt tiền', text: `${c4Cap1(who)} lấy ${n} ${c4Un(g)} ${c4Wn(g)} rồi hẹn mai trả ${c4Money(val)}. Sáng nay đi đòi thì nghênh mặt lên: "Khế ước đâu? Khế ước đâu? Không có giấy thì tôi không biết!"`, opts: [
      [`Nhờ cụ Lý phân xử · ${c4Money(fee)}`, () => { c4Spend(fee); if (R() < .4) { SAVE4.money += val; if (C4.today) C4.today.take += val; toast(`Cụ Lý bắt ${who} trả đủ ${c4Money(val)}.`, 3.4); } else toast('Không giấy tờ nên cụ Lý cũng chịu, phải bỏ.', 3.4); }, SAVE4.money >= fee],
      ['Đành chịu mất', () => toast('Bài học đắt giá: bán chịu phải có khế ước!', 3.2)]] });
  },
  // the rich are squeezed by the local officials
  dinh(E) {
    if (SAVE4.money < 3000) return false;
    const d = Math.round(SAVE4.money * .06);
    E.def = 0; Object.assign(E, { title: 'Quan viên sách nhiễu', text: `Nghe nhà bán buôn khấm khá, mấy ông quan viên trong làng kéo đến xin "đóng góp" tu sửa đình. Họ đòi ${c4Money(d)}.`, opts: [
      [`Nộp đủ · ${c4Money(d)}`, () => { c4Spend(d); toast('Họ khen nhà mình có nghĩa với làng.', 3); }, SAVE4.money >= d],
      [`Nộp nửa · ${c4Money(Math.round(d / 2))}`, () => { c4Spend(d / 2); toast('Họ nhận nửa, mặt hằm hằm bỏ đi.', 3); }],
      ['Từ chối (người quen bớt quý)', () => { for (const p of c4People().list) if (c4Known(p.id)) c4Bump(p.id, -3); toast('Họ phẩy tay: "Giàu mà keo!" Tiếng xấu lan khắp làng.', 3.4); }]] });
  },
});
// appended to the day's pool (kinhdoanh.js c4ExtraPool)
const c4TaiHoaPool = own => [...(own.some(g => C4_FOOD.includes(g)) ? ['trauhuc'] : []), ...(own.some(g => C4_MEAT.includes(g)) ? ['thiu'] : []), 'quit', ...(SAVE4.money >= 3000 ? ['dinh'] : [])];
