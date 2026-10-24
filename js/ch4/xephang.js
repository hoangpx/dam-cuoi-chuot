/* Chương IV · bảng tổng sắp nhà giàu (owner, 2026-10-16: "xem được tất cả những người chơi và tiền, số ngày, tên tự gen và xếp theo thứ
   tự ai giàu nhất, người chơi có option đổi tên"). Every player has one row on Supabase (table dcc_rank, only through the rpc dcc_rank_put /
   dcc_rank_top / dcc_rank_me, docs/supabase-bang-xep-hang.sql), keyed by the device id dcc.dev (it goes with the cloud save to other
   devices): the player's one name (the Hồ sơ name, changed only in the Hồ sơ tab; before 2026-10-23 a made-up name in dcc.rankName with its own Đổi tên), the purse SAVE4.money and the day SAVE4.day. The row is sent when a day turns (c4DayAdvance) and when the board is opened. The
   board (#c4rank, HUD button "Tổng sắp" in the village and the town) lists the richest 100 and the player's own place. */
const C4_RANK_MAX = 22;
// ONE name for the whole game (owner, 2026-10-23: "chỉ cho phép dùng 1 tên toàn game và đổi tên ở 1 chỗ là Hồ sơ"): the Hồ sơ name (dcc.hoso), the same one
// Hội Làng and Ghép Tranh send. The board's own made-up name and its Đổi tên button (dcc.rankName) are gone; the server wants 2–22 letters.
function c4RankName() { const n = hsName(hsMine()).replace(/\s+/g, ' ').trim(); return n.length < 2 ? n + ' chuột' : n.slice(0, C4_RANK_MAX); }
// send my row (the purse plus the things in the house, c4NetWorth: buying furniture moves money from one column to the other),
// with the list of what has been sắm sanh so others can look into the room (docs/supabase-bang-xep-hang-nha.sql);
// quietly does nothing while the server has no board yet, and falls back to the old call while the home column is not there
function c4RankSend() {
  if (!SAVE4.started) return Promise.resolve();
  return c4RankClaim().then(c4RankPut);
}
function c4RankPut() {
  const row = { p_device: p4Device(), p_name: c4RankName(), p_money: Math.round(c4NetWorth()), p_day: Math.max(1, SAVE4.day || 1) };
  return p4Rpc('dcc_rank_put', { ...row, p_home: c4HomeItems().join(',') })
    .catch(() => p4Rpc('dcc_rank_put', row)).catch(() => {});
}
// gifts left under my house become real money in my purse (owner, 2026-10-23: "làm nhận tiền thật"): asked before every send (a day turns, the board
// opens). The server (dcc_rank_claim, docs/supabase-bang-xep-hang-nhan-qua.sql) marks the gifts taken and answers the total in one step, so a gift is paid once;
// a reply lost on the way would lose that sum, which is rare and small (a gift is under 10 quan).
let C4_CLAIMING = null;
function c4RankClaim() {
  if (C4_CLAIMING) return C4_CLAIMING;
  C4_CLAIMING = p4Rpc('dcc_rank_claim', { p_device: p4Device() }).then(r => {
    const g = Array.isArray(r) && r[0], t = g ? Math.round(+g.total || 0) : 0, n = g ? +g.n || 0 : 0;
    if (t > 0 && t <= 100000000) {
      SAVE4.money = Math.max(0, Math.round(SAVE4.money || 0)) + t; persist4(); c4RankHud();
      try { AU.pluck(84); } catch (e) {}
      toast(n > 1 ? `Khách ghé nhà để lại ${n} món quà, được ${c4RankMoney(t)}.` : `Có khách để lại quà ở nhà, được ${c4RankMoney(t)}.`, 3.6);
    }
  }).catch(() => {}).then(() => { C4_CLAIMING = null; });
  return C4_CLAIMING;
}
const c4RankMoney = m => m >= 600 ? `${Math.floor(m / 600).toLocaleString('vi')} quan` : `${Math.max(0, Math.round(m))} đồng`;
const c4RankShow = id => (S.mode === 'c4bplay' ? p4Sheets : c4Sheets)(id);
// the board in a box: my name (with Đổi tên), my place, the richest 100
async function c4RankInto(box) {
  box.classList.add('rankbox');
  box.innerHTML = `<p class="rkme">Tên bạn: <b class="rn">${p4Esc(c4RankName())}</b></p><div class="rkB"><p class="sm">Đang tải bảng tổng sắp…</p></div>`;
  const q = c => box.querySelector(c), B = q('.rkB');
  // sending my row must never hold the board up: a stalled put once left the sheet on "Đang tải…" for good, so it gets a short
  // wait and then the list is drawn anyway (owner, 2026-10-22: "sao bảng tổng sắp trắng trơn vậy?")
  await Promise.race([c4RankSend(), new Promise(done => setTimeout(done, 2500))]);
  try {
    // and one of the two reads failing must not empty the list: whatever answered is drawn
    const [t1, m1] = await Promise.allSettled([p4Rpc('dcc_rank_top', { p_limit: 100 }), p4Rpc('dcc_rank_me', { p_device: p4Device() })]);
    if (t1.status === 'rejected' && m1.status === 'rejected') throw t1.reason;
    const top = t1.status === 'fulfilled' ? t1.value : null, me = m1.status === 'fulfilled' ? m1.value : null;
    const got = Array.isArray(me) && me[0], mine = got && got.pos ? got : null;   // pos is null while the server holds the row back (money far beyond what the days allow, docs/supabase-bang-xep-hang-chan.sql)
    const row = (r, isMe) => `<tr class="${isMe ? 'me' : ''}${r.pos <= 3 ? ' top' + r.pos : ''}"><td>${r.pos}</td><td>${p4Esc(r.name)}</td><td>${c4RankMoney(r.money)}</td><td>${r.day}</td>`
      + `<td><button class="rnv" data-nv="${r.pos}" aria-label="Xem nhà của ${p4Esc(r.name)}">Nhà</button></td></tr>`;
    const list = Array.isArray(top) ? top : [], inTop = mine && list.some(r => +r.pos === +mine.pos);
    B.innerHTML = `<p class="sm">${mine ? `Bạn đứng thứ <b>${mine.pos}</b> trong ${mine.total} nhà buôn.` : got && got.flag ? 'Số tiền của bạn không khớp với số ngày đã chơi nên chưa được xếp hạng.' : 'Chưa có tên bạn trên bảng.'}</p>`
      + '<div class="rkgo"><span>Xem nhà người hạng</span><input class="rgn" type="number" min="1" inputmode="numeric" placeholder="số hạng"><button class="btn rgo">Xem</button></div>'
      + `<div class="rk"><table><thead><tr><th>#</th><th>Tên</th><th>Tiền</th><th>Ngày</th><th></th></tr></thead><tbody>`
      + (list.length ? list.map(r => row(r, mine && +r.pos === +mine.pos)).join('') : '<tr><td colspan="5" class="rknone">Bảng đang trống.</td></tr>')
      + (mine && !inTop ? `<tr class="gap"><td colspan="5">…</td></tr>${row(mine, true)}` : '')
      + '</tbody></table></div>';
    B.querySelectorAll('[data-nv]').forEach(b => b.addEventListener('click', () => { AU.tap(); c4RankVisit(+b.dataset.nv); }));
    { const gi = box.querySelector('.rgn');
      const go = () => { const n = parseInt(gi.value, 10); if (!(n > 0)) { toast('Nhập số hạng muốn xem nhé.', 2.2); gi.focus(); return; } AU.tap(); c4RankVisit(n); };
      box.querySelector('.rgo').addEventListener('click', go);
      gi.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(); }); }
    const me1 = B.querySelector('tr.me'), rk = B.querySelector('.rk'); if (me1 && rk) rk.scrollTop = me1.offsetTop - rk.clientHeight / 2;
  } catch (e) { B.innerHTML = '<p class="sm">Chưa kết nối được bảng tổng sắp. Lát nữa thử lại nhé.</p>'; }
}
// looking into someone else's house (owner, 2026-10-22: "vào bảng tổng sắp thì sẽ có nút xem nhà của người trong bảng, hoặc nhập số
// xếp hạng của người nào đó để vào xem"): every row of the board carries a Nhà button, and the place can be typed in. The server
// keeps each player's sắm sanh list with their row and hands it back by place (dcc_rank_at, docs/supabase-bang-xep-hang-nha.sql);
// the room is the same drawing as my own, so what stands in it is seen, not listed.
// What is written under the room is the guests' talk (owner, 2026-10-22: "ko cần phải liệt kê ra có những gì, thay vào đó là đọc
// được review của người khác, bạn cũng có thể để lại review, lúc review thì có option cho tiền, nếu bạn nhiều tiền hơn thì sẽ gọi là
// bố thí, nếu ít tiền hơn thì sẽ gọi là biếu"): everyone reads what others left, and may leave words of their own with money on top.
// Having more money than the host makes the gift bố thí, having less makes it biếu. The money leaves the giver's purse and lands on
// the host's row (dcc_rank.gift), so the board counts it (docs/supabase-bang-xep-hang-nhan-xet.sql).
const c4RankRvTag = r => r && r.amount > 0
  ? `<span class="rvt ${r.kind === 'bothi' ? 'bothi' : 'bieu'}">${r.kind === 'bothi' ? 'bố thí' : 'biếu'} ${c4RankMoney(r.amount)}</span>` : '';
// when it was written (owner, 2026-10-22: "thêm thời gian ngày giờ, nếu nhiều ngày thì để là x ngày trước, x tháng trước, x năm trước"):
// today and yesterday show the hour, then it counts in days under a month, in months under a year, then in years
const c4RankWhen = t => {
  const d = t ? new Date(t) : null; if (!d || isNaN(d.getTime())) return '';
  const now = new Date(), hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const day0 = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((day0(now) - day0(d)) / 864e5);
  if (days <= 0) return (now - d) < 6e4 ? 'vừa xong' : `hôm nay ${hm}`;
  if (days === 1) return `hôm qua ${hm}`;
  if (days < 30) return `${days} ngày trước`;
  let months = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
  if (now.getDate() < d.getDate()) months--;
  months = Math.max(1, months);
  return months < 12 ? `${months} tháng trước` : `${Math.max(1, Math.floor(months / 12))} năm trước`;
};
const c4RankRvHtml = list => {
  const L = Array.isArray(list) ? list.filter(r => r && (r.note || r.amount > 0)) : [];
  return L.length ? '<ul class="rvl">' + L.map(r => `<li class="rv"><p class="rvh">${r.from_pub ? `<button type="button" class="rvgo" data-pub="${p4Esc(r.from_pub)}" title="Sang thăm nhà người này"><b>${p4Esc(r.from_name || 'Khách')}</b> ›</button>` : `<b>${p4Esc(r.from_name || 'Khách')}</b>`} ${c4RankRvTag(r)}`
      + `<span class="rvwhen">${c4RankWhen(r.created_at)}</span></p>`
      + (r.note ? `<p class="rvn">${p4Esc(r.note)}</p>` : '') + '</li>').join('') + '</ul>'
    : '<p class="cnt rvnone">Chưa ai để lại lời gì.</p>';
};
const c4RankMeta = r => `Hạng <b>${r.pos}</b> trong ${r.total} nhà buôn · ${c4RankMoney(r.money)} · ngày ${r.day}`;
const c4RankHud = () => { try { if (S.mode === 'c4bplay') p4Hud(); else c4Hud(); } catch (e) {} };
function c4RankRvLoad(B, r) {
  const box = B.querySelector('.rvB'); if (!box) return;
  p4Rpc('dcc_rank_review_list', { p_target: r.pub, p_limit: 40 }).then(l => {
    box.innerHTML = c4RankRvHtml(l);
    box.querySelectorAll('.rvgo').forEach(b => b.addEventListener('click', () => { AU.tap(); c4RankVisit(0, b.dataset.pub); }));   // on to the house of whoever wrote it
  })
    .catch(() => { box.innerHTML = '<p class="cnt rvnone">Chưa tải được lời nhận xét.</p>'; });
}
// the box to leave one: words, and money if the guest wants to give some. The money line says only what the gift is called
// ("bố thí" with more money than the host, "biếu" with less) — the owner asked for no explanation there (2026-10-22).
// My own house gets no box (the server refuses it too).
const C4_GIFT_MAX = 5999;   // one gift is under 10 quan (docs/supabase-bang-xep-hang-chan-qua.sql keeps the same limit on the server)
function c4RankFormHtml(r) {
  if (r.mine) return '<p class="cnt rvown">Đây là nhà của bạn — lời nhận xét của khách ở trên.</p>';
  const mine = Math.round(c4NetWorth()), theirs = Math.round(+r.money || 0), more = mine > theirs;
  const word = more ? 'Bố thí' : 'Biếu';
  return '<div class="rvform"><textarea class="rvnote" maxlength="140" rows="2" placeholder="Đôi lời nhận xét cho nhà này…"></textarea>'
    + `<div class="rvrow"><label>${word} <input class="rvamt" type="number" min="0" max="5999" step="1" inputmode="numeric" placeholder="0"> đồng</label>`
    + '<button class="btn rvs">Gửi</button></div></div>';
}
function c4RankWire(B, r) {
  const ta = B.querySelector('.rvnote'), ai = B.querySelector('.rvamt'), btn = B.querySelector('.rvs');
  if (!ta || !ai || !btn) return;
  [ta, ai].forEach(e => e.addEventListener('keydown', ev => ev.stopPropagation()));   // the game's own keys stay out of the box
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    const note = ta.value.replace(/\s+/g, ' ').trim().slice(0, 140);
    let amt = Math.round(+ai.value || 0); if (!(amt > 0)) amt = 0;
    const purse = Math.max(0, Math.round(SAVE4.money || 0));
    if (amt > C4_GIFT_MAX) { toast('Mỗi lần chỉ cho dưới 10 quan (tối đa 5.999 đồng).', 3); ai.value = C4_GIFT_MAX; return; }
    if (amt > purse) { toast(`Ví chỉ còn ${c4RankMoney(purse)}.`, 2.8); ai.value = purse; return; }
    if (!note && !amt) { toast('Viết một câu nhận xét, hoặc để lại chút tiền cho nhà này.', 3); ta.focus(); return; }
    if (p4HoaBad(note)) { toast('Lời nhận xét có chữ không đẹp, sửa lại nhé.', 2.8); return; }
    const kind = Math.round(c4NetWorth()) > Math.round(+r.money || 0) ? 'bố thí' : 'biếu';
    btn.disabled = true;
    try {
      await p4Rpc('dcc_rank_review_put', { p_target: r.pub, p_device: p4Device(), p_name: c4RankName(), p_amount: amt, p_note: note });
      if (amt > 0) { SAVE4.money = Math.max(0, Math.round(SAVE4.money || 0) - amt); persist4(); c4RankSend(); c4RankHud(); }
      AU.pluck(84); AU.tap();
      // a gift does not count for the board (owner, 2026-10-23: "cho tiền thì ko tính vào bảng xếp hạng"), so the host's line stays as it is
      const m = B.querySelector('.rvmeta'); if (m) m.innerHTML = c4RankMeta(r);
      ta.value = ''; ai.value = '';
      toast(amt > 0 ? `Đã ${kind} ${c4RankMoney(amt)} cho nhà này.` : 'Đã để lại lời nhận xét.', 3);
      c4RankRvLoad(B, r);
    } catch (e) {
      const m = (e && e.message) || '';
      toast(/too much/.test(m) ? 'Mỗi lần chỉ cho dưới 10 quan (tối đa 5.999 đồng).'
        : /giver limit/.test(m) ? 'Hôm nay bạn đã cho nhiều rồi, mai cho tiếp nhé.'
        : /house full/.test(m) ? 'Nhà này hôm nay nhận đủ quà rồi.'
        : /no purse/.test(m) ? 'Chưa cho được: ví của bạn chưa đủ hoặc bạn mới chơi những ngày đầu.'
        : /slow down/.test(m) ? 'Gửi dày quá, chờ một chút rồi gửi tiếp nhé.'
        : /bad words/.test(m) ? 'Lời nhận xét có chữ không đẹp, sửa lại nhé.'
        : /no self/.test(m) ? 'Không tự nhận xét nhà mình được.'
        : /no such house/.test(m) ? 'Nhà này vừa rời bảng, mở lại từ bảng nhé.'
        : 'Chưa gửi được lời nhận xét. Lát nữa thử lại nhé.', 3.2);
    } finally { btn.disabled = false; }
  });
}
function c4RankVisit(pos, pub) {
  const B = $('#c4nhaxB'); if (!B) return;
  $('#c4nhaxT').textContent = pub ? 'Nhà' : `Hạng ${pos}`; B.innerHTML = '<p class="sm">Đang mở cổng nhà…</p>';
  c4RankShow('c4nhax');
  const card = $('#c4nhaxB').closest('.card4'); if (card) card.scrollTop = 0;
  (pub ? p4Rpc('dcc_rank_at_pub', { p_pub: pub, p_device: p4Device() }) : p4Rpc('dcc_rank_at', { p_pos: pos, p_device: p4Device() })).then(list => {
    const r = Array.isArray(list) && list[0];
    if (!r) { $('#c4nhaxT').textContent = pub ? 'Nhà' : `Hạng ${pos}`; B.innerHTML = pub ? '<p class="sm">Nhà này vừa rời bảng tổng sắp.</p>' : `<p class="sm">Không có ai ở hạng ${pos} trên bảng.</p>`; return; }
    const has = (r.home || '').split(',').filter(id => C4_SHOP_ITEMS.some(it => it[0] === id));
    $('#c4nhaxT').innerHTML = `Nhà của ${p4Esc(r.name)}${r.mine ? ' (bạn)' : ''}`;
    B.innerHTML = `<p class="cnt rvmeta">${c4RankMeta(r)}</p>`
      + `<div class="roomBox">${c4NhaSvg(has)}</div>`
      + (has.length ? '' : '<p class="cnt">Nhà chưa sắm sanh gì, trống trơn.</p>')
      + '<h4 class="rvtt">Khách qua nhà nhận xét</h4><div class="rvB"><p class="sm">Đang tải lời nhận xét…</p></div>'
      + c4RankFormHtml(r);
    c4RankWire(B, r);
    c4RankRvLoad(B, r);
  }).catch(() => { B.innerHTML = '<p class="sm">Chưa xem được nhà người này. Lát nữa thử lại nhé.</p>'; });
}
// closing the visit goes back to the board it was opened from: the book's tab in the village, its own sheet in the town
function c4RankVisitClose() { c4RankShow(null); if (S.mode === 'c4bplay') c4RankOpen(); else c4OpenNotes('rank'); }
// the town has no book: its HUD button opens the board on a sheet of its own
function c4RankOpen() { c4RankShow('c4rank'); c4RankInto($('#c4rankW')); }
{
  const d = document.createElement('div'); d.id = 'c4rank'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 rank"><h3>Bảng tổng sắp nhà giàu</h3><div id="c4rankW"></div><div class="row"><button class="btn alt" id="c4rankX">Đóng</button></div></div>';
  document.body.appendChild(d);
  $('#c4rankX').addEventListener('click', () => c4RankShow(null));
}
{
  const d = document.createElement('div'); d.id = 'c4nhax'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 nhaview"><h3 id="c4nhaxT">Nhà</h3><div id="c4nhaxB"></div><div class="row"><button class="btn alt" id="c4nhaxX">Đóng</button></div></div>';
  document.body.appendChild(d);
  $('#c4nhaxX').addEventListener('click', c4RankVisitClose);
  d.addEventListener('click', e => { if (e.target === d) c4RankVisitClose(); });   // a tap on the dark around it closes it too
}
