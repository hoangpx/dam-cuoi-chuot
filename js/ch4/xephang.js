/* Chương IV · bảng tổng sắp nhà giàu (owner, 2026-10-16: "xem được tất cả những người chơi và tiền, số ngày, tên tự gen và xếp theo thứ
   tự ai giàu nhất, người chơi có option đổi tên"). Every player has one row on Supabase (table dcc_rank, only through the rpc dcc_rank_put /
   dcc_rank_top / dcc_rank_me, docs/supabase-bang-xep-hang.sql), keyed by the device id dcc.dev (it goes with the cloud save to other
   devices): a name made up the first time (C4_RANK_A × C4_RANK_B + a number, kept in dcc.rankName, can be changed, 2–22 letters, no bad
   words), the purse SAVE4.money and the day SAVE4.day. The row is sent when a day turns (c4DayAdvance) and when the board is opened. The
   board (#c4rank, HUD button "Tổng sắp" in the village and the town) lists the richest 100 and the player's own place. */
const C4_RANK_A = ['Phú ông', 'Lái buôn', 'Bà chủ', 'Cậu ấm', 'Cô hàng', 'Bác', 'Chú', 'Lão', 'Mợ', 'Chuột'];
const C4_RANK_B = ['Trầu Cau', 'Bánh Đa', 'Xôi Gấc', 'Hạt Thóc', 'Củ Lạc', 'Mè Xửng', 'Bánh Chưng', 'Ngô Rang', 'Khoai Lang', 'Cốm Vòng',
  'Chè Kho', 'Râu Dài', 'Đuôi Cong', 'Tai To', 'Má Hồng', 'Bánh Giầy', 'Hạt Dẻ', 'Bưởi Đào', 'Nón Lá', 'Quai Thao'];
const C4_RANK_MAX = 22;
function c4RankName() {
  let n = ''; try { n = localStorage.getItem('dcc.rankName') || ''; } catch (e) {}
  if (!n) { const r = () => Math.random(); n = `${C4_RANK_A[(r() * C4_RANK_A.length) | 0]} ${C4_RANK_B[(r() * C4_RANK_B.length) | 0]} ${10 + ((r() * 90) | 0)}`; try { localStorage.setItem('dcc.rankName', n); } catch (e) {} }
  return n;
}
// send my row; quietly does nothing while the server has no board yet
function c4RankSend() {
  if (!SAVE4.started) return Promise.resolve();
  return p4Rpc('dcc_rank_put', { p_device: p4Device(), p_name: c4RankName(), p_money: Math.round(SAVE4.money || 0), p_day: Math.max(1, SAVE4.day || 1) }).catch(() => {});
}
const c4RankMoney = m => m >= 600 ? `${Math.floor(m / 600).toLocaleString('vi')} quan` : `${Math.max(0, Math.round(m))} đồng`;
const c4RankShow = id => (S.mode === 'c4bplay' ? p4Sheets : c4Sheets)(id);
// the board in a box: my name (with Đổi tên), my place, the richest 100
async function c4RankInto(box) {
  box.classList.add('rankbox');
  box.innerHTML = '<p class="rkme rs">Tên bạn: <b class="rn"></b> <button class="btn alt rren">Đổi tên</button></p>'
    + `<p class="rkme re" hidden><input class="rin" maxlength="${C4_RANK_MAX}" autocomplete="off"><button class="btn rok">Lưu</button><button class="btn alt rno">Thôi</button></p>`
    + '<div class="rkB"><p class="sm">Đang tải bảng tổng sắp…</p></div>';
  const q = c => box.querySelector(c), B = q('.rkB');
  const edit = on => { q('.rn').textContent = c4RankName(); q('.rs').hidden = on; q('.re').hidden = !on; if (on) { const i = q('.rin'); i.value = c4RankName(); i.focus(); i.select(); } };
  const save = () => {
    const v = q('.rin').value.replace(/\s+/g, ' ').trim().slice(0, C4_RANK_MAX);
    if (v.length < 2) { toast('Tên phải có ít nhất 2 chữ.', 2.2); return; }
    if (p4HoaBad(v)) { toast('Tên có chữ không đẹp, chọn tên khác nhé.', 2.6); return; }
    try { localStorage.setItem('dcc.rankName', v); } catch (e) {}
    AU.tap(); toast('Đã đổi tên: ' + p4Esc(v), 2.2); setTimeout(() => c4RankInto(box), 300);
  };
  edit(false);
  q('.rren').addEventListener('click', () => { AU.tap(); edit(true); });
  q('.rno').addEventListener('click', () => edit(false));
  q('.rok').addEventListener('click', save);
  q('.rin').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') save(); });
  await c4RankSend();
  try {
    const [top, me] = await Promise.all([p4Rpc('dcc_rank_top', { p_limit: 100 }), p4Rpc('dcc_rank_me', { p_device: p4Device() })]);
    const got = Array.isArray(me) && me[0], mine = got && got.pos ? got : null;   // pos is null while the server holds the row back (money far beyond what the days allow, docs/supabase-bang-xep-hang-chan.sql)
    const row = (r, isMe) => `<tr class="${isMe ? 'me' : ''}${r.pos <= 3 ? ' top' + r.pos : ''}"><td>${r.pos}</td><td>${p4Esc(r.name)}</td><td>${c4RankMoney(r.money)}</td><td>${r.day}</td></tr>`;
    const list = Array.isArray(top) ? top : [], inTop = mine && list.some(r => +r.pos === +mine.pos);
    B.innerHTML = `<p class="sm">${mine ? `Bạn đứng thứ <b>${mine.pos}</b> trong ${mine.total} nhà buôn.` : got && got.flag ? 'Số tiền của bạn không khớp với số ngày đã chơi nên chưa được xếp hạng.' : 'Chưa có tên bạn trên bảng.'}</p>`
      + `<div class="rk"><table><thead><tr><th>#</th><th>Tên</th><th>Tiền</th><th>Ngày</th></tr></thead><tbody>`
      + list.map(r => row(r, mine && +r.pos === +mine.pos)).join('')
      + (mine && !inTop ? `<tr class="gap"><td colspan="4">…</td></tr>${row(mine, true)}` : '')
      + '</tbody></table></div>';
    const me1 = B.querySelector('tr.me'), rk = B.querySelector('.rk'); if (me1 && rk) rk.scrollTop = me1.offsetTop - rk.clientHeight / 2;
  } catch (e) { B.innerHTML = '<p class="sm">Chưa kết nối được bảng tổng sắp. Lát nữa thử lại nhé.</p>'; }
}
// the town has no book: its HUD button opens the board on a sheet of its own
function c4RankOpen() { c4RankShow('c4rank'); c4RankInto($('#c4rankW')); }
{
  const d = document.createElement('div'); d.id = 'c4rank'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 rank"><h3>Bảng tổng sắp nhà giàu</h3><div id="c4rankW"></div><div class="row"><button class="btn alt" id="c4rankX">Đóng</button></div></div>';
  document.body.appendChild(d);
  $('#c4rankX').addEventListener('click', () => c4RankShow(null));
}
