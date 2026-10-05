/* Gợi ý bought with chương IV's money (owner): every hint in chương II, VI and VII costs HINT_COST đồng (1 quan) out of the
   couple's purse (SAVE4.money), so hints slow the road to the 2-quan goal. Not enough money: the sheet says so and points
   to Vợ Chồng Khởi Nghiệp; nothing free at the start. hintBuy(what, give): `what` is a line on what the hint does, `give()`
   hands it over once paid (it may return false when, after all, there was nothing to give: then nothing is taken). */
const HINT_COST = 600;
{
  const el = document.createElement('div'); el.id = 'hintBuy'; el.hidden = true;
  el.innerHTML = '<div class="hcard"><h3 id="hbT">Gợi ý</h3><p id="hbB"></p><p class="hpurse" id="hbP"></p><div class="hbtns" id="hbO"></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) hintClose(); });
}
function hintClose() { $('#hintBuy').hidden = true; if (typeof cv !== 'undefined') cv.focus(); }
function hintBuy(what, give) {
  const purse = SAVE4.money, ok = purse >= HINT_COST, box = $('#hbO'); box.innerHTML = '';
  $('#hbT').textContent = ok ? 'Mua gợi ý' : 'Không đủ tiền';
  $('#hbB').innerHTML = ok ? `${what}<br>Giá: <b>${c4Money(HINT_COST)}</b>, lấy từ tiền buôn bán của hai vợ chồng chuột.`
    : `Mỗi gợi ý giá <b>${c4Money(HINT_COST)}</b>. Muốn có tiền thì phải khởi nghiệp: sang chương <b>Vợ Chồng Khởi Nghiệp</b> buôn bán kiếm tiền rồi quay lại.`;
  $('#hbP').innerHTML = `Trong túi: <b>${c4Money(purse)}</b>`;
  const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.addEventListener('click', fn); box.appendChild(b); };
  if (ok) {
    btn('Thôi, tự nghĩ', 'btn alt', () => { AU.tap(); hintClose(); });
    btn('Mua · 1 quan', 'btn', () => {
      hintClose();
      if (give() === false) return;
      SAVE4.money -= HINT_COST; SAVE4.hints = (SAVE4.hints || 0) + 1; SAVE4.hintSpent = (SAVE4.hintSpent || 0) + HINT_COST; persist4();
      AU.pluck(90); toast(`Đã trả ${c4Money(HINT_COST)} · còn ${c4Money(SAVE4.money)}`, 2.6);
    });
  } else btn('Được rồi', 'btn', () => { AU.tap(); hintClose(); });
  AU.tap(); $('#hintBuy').hidden = false;
}
