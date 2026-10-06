/* Gợi ý bought with chương IV's money (owner): every hint in chương II, VI and VII is paid out of the couple's purse
   (SAVE4.money), so hints slow the road to the 2-quan goal. The price follows what the player has (owner: "like 20% of
   their income"): 20% of the purse up to 10 quan, 30% of what is above (10 quan → 2 quan, 20 quan → 5 quan), never less
   than HINT_MIN (1 quan). Less than that in the purse: the sheet says so and points to Vợ Chồng Khởi Nghiệp; nothing free
   at the start. hintBuy(what, give): `what` is a line on what the hint does, `give()` hands it over once paid (it may
   return false when, after all, there was nothing to give: then nothing is taken). */
const HINT_MIN = 600, HINT_BANDS = [[6000, .2], [Infinity, .3]];   // đồng (600 a quan)
function hintCost(purse = SAVE4.money) {
  let left = Math.max(0, purse), low = 0, c = 0;
  for (const [top, k] of HINT_BANDS) { const part = Math.min(left, top - low); c += part * k; left -= part; low = top; if (left <= 0) break; }
  return Math.max(HINT_MIN, Math.round(c));
}
{
  const el = document.createElement('div'); el.id = 'hintBuy'; el.hidden = true;
  el.innerHTML = '<div class="hcard"><h3 id="hbT">Gợi ý</h3><p id="hbB"></p><p class="hpurse" id="hbP"></p><div class="hbtns" id="hbO"></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) hintClose(); });
}
function hintClose() { $('#hintBuy').hidden = true; if (typeof cv !== 'undefined') cv.focus(); }
const HINT_RULE = 'Giá gợi ý tính theo của cải: một phần năm số tiền trong túi (phần trên 10 quan thì ba phần mười), ít nhất 1 quan.';
function hintBuy(what, give) {
  const purse = SAVE4.money, cost = hintCost(purse), ok = purse >= cost, box = $('#hbO'); box.innerHTML = '';
  $('#hbT').textContent = ok ? 'Mua gợi ý' : 'Không đủ tiền';
  $('#hbB').innerHTML = ok ? `${what}<br>Giá: <b>${c4Money(cost)}</b>, lấy từ tiền buôn bán của hai vợ chồng chuột.<br><span class="hrule">${HINT_RULE}</span>`
    : `Gợi ý giá ít nhất <b>${c4Money(HINT_MIN)}</b>. Muốn có tiền thì phải khởi nghiệp: sang chương <b>Vợ Chồng Khởi Nghiệp</b> buôn bán kiếm tiền rồi quay lại.`;
  $('#hbP').innerHTML = `Trong túi: <b>${c4Money(purse)}</b>`;
  const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.addEventListener('click', fn); box.appendChild(b); };
  if (ok) {
    btn('Thôi, tự nghĩ', 'btn alt', () => { AU.tap(); hintClose(); });
    btn('Mua · ' + c4Money(cost), 'btn', () => {
      hintClose();
      if (give() === false) return;
      SAVE4.money -= cost; SAVE4.hints = (SAVE4.hints || 0) + 1; SAVE4.hintSpent = (SAVE4.hintSpent || 0) + cost; persist4();
      AU.pluck(90); toast(`Đã trả ${c4Money(cost)} · còn ${c4Money(SAVE4.money)}`, 2.6);
    });
  } else btn('Được rồi', 'btn', () => { AU.tap(); hintClose(); });
  AU.tap(); $('#hintBuy').hidden = false;
}
