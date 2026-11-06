/* Chương IV phần 2 · Phố Huyện: selling by hand at any shop we run (owner, 2026-11-06: a game for every shop, like têm trầu). One game for
   all, its pieces per kind of shop (P4_MINI[game]): customers come to the counter (up to 3), each asking for one of the wares on the menu that
   is in stock; the order card shows what goes into it. The player taps the pieces in that order onto the tray, then taps the customer.
   Right: paid the shop's price, plus a tip the quicker it was (up to +50 %); one of that ware leaves the stock. Wrong: "Không phải thế!",
   the tray is emptied and that customer's patience drops. Patience gone: they walk off. A shift lasts P4_MINI_SHIFT seconds, customers come
   faster as it goes on. The street waits meanwhile. A DOM sheet (#p4mini), so it reads the same on a phone and a computer. */
const P4_MINI_SHIFT = 90;
// each game: its pieces [id, name] and, per ware id, the pieces in order
const P4_MINI = {
  buncha: { pieces: [['bun', 'Bún'], ['cha', 'Chả nướng'], ['nuoc', 'Nước chấm'], ['rau', 'Rau sống'], ['nem', 'Nem'], ['da', 'Đá'], ['tra', 'Trà']],
    r: { buncha: ['bun', 'cha', 'nuoc', 'rau'], nem: ['nem', 'nuoc'], trada: ['da', 'tra'] } },
  banhbao: { pieces: [['vo', 'Vỏ bánh'], ['thit', 'Nhân thịt'], ['chay', 'Nhân chay'], ['trung', 'Trứng cút'], ['tom', 'Tôm'], ['xm', 'Viên xíu mại'], ['sot', 'Nước sốt'], ['hap', 'Hấp'], ['chien', 'Chiên'], ['hanh', 'Hành phi']],
    r: { thit: ['vo', 'thit', 'trung', 'hap'], chay: ['vo', 'chay', 'hap'], xiumai: ['xm', 'sot'], banhvac: ['vo', 'tom', 'hap', 'hanh'], chien: ['vo', 'tom', 'chien'] } },
  comga: { pieces: [['com', 'Cơm'], ['gaxe', 'Gà xé'], ['nuaga', 'Nửa con gà'], ['ram', 'Rau răm'], ['gung', 'Mắm gừng'], ['canh', 'Canh']],
    r: { comga: ['com', 'gaxe', 'ram', 'gung'], galuoc: ['nuaga', 'gung'], canh: ['canh'] } },
  pho: { pieces: [['banh', 'Bánh phở'], ['hu', 'Hủ tiếu'], ['mi', 'Mì'], ['tai', 'Thịt tái'], ['chin', 'Thịt chín'], ['hoanh', 'Hoành thánh'], ['nuoc', 'Nước dùng'], ['hanh', 'Hành'], ['rau', 'Rau'], ['quay', 'Quẩy']],
    r: { tai: ['banh', 'tai', 'nuoc', 'hanh'], chin: ['banh', 'chin', 'nuoc', 'hanh'], quay: ['quay'], hutieu: ['hu', 'chin', 'nuoc', 'hanh'], hoanh: ['hoanh', 'nuoc', 'hanh'], caolau: ['mi', 'chin', 'rau'], miquang: ['mi', 'chin', 'nuoc', 'rau'] } },
  comtam: { pieces: [['com', 'Cơm tấm'], ['suon', 'Sườn'], ['trung', 'Trứng'], ['bi', 'Bì'], ['cha', 'Chả'], ['mo', 'Mỡ hành'], ['mam', 'Nước mắm']],
    r: { suon: ['com', 'suon', 'mo', 'mam'], trung: ['trung'], bicha: ['bi', 'cha'] } },
  che: { pieces: [['coc', 'Cốc'], ['bat', 'Bát'], ['dau', 'Đậu'], ['thach', 'Thạch'], ['dua', 'Nước cốt dừa'], ['da', 'Đá'], ['duong', 'Nước đường nóng']],
    r: { dau: ['coc', 'dau', 'dua', 'da'], thapcam: ['coc', 'dau', 'thach', 'dua', 'da'], nong: ['bat', 'dau', 'duong'] } },
  gao: { pieces: [['thung', 'Thúng'], ['hu', 'Hũ'], ['tam', 'Gạo tám'], ['nep', 'Gạo nếp'], ['muoi', 'Muối'], ['gat', 'Gạt miệng'], ['nap', 'Đậy nắp']],
    r: { gao: ['thung', 'tam', 'gat'], nep: ['thung', 'nep', 'gat'], muoi: ['hu', 'muoi', 'nap'] } },
  thuoc: { pieces: [['giay', 'Giấy gói'], ['lo', 'Lọ'], ['gung', 'Gừng'], ['que', 'Quế'], ['camthao', 'Cam thảo'], ['quy', 'Đương quy'], ['sam', 'Nhân sâm'], ['cao', 'Cao']],
    r: { cam: ['giay', 'gung', 'que', 'camthao'], bo: ['giay', 'quy', 'sam', 'camthao'], cao: ['lo', 'cao'] } },
  giay: { pieces: [['giay', 'Giấy dó'], ['but', 'Bút lông'], ['muc', 'Mực tàu'], ['goi', 'Giấy gói'], ['day', 'Dây buộc']],
    r: { giay: ['giay', 'day'], but: ['but', 'goi'], muc: ['muc', 'goi'] } },
  xen: { pieces: [['kim', 'Kim'], ['chi', 'Chỉ'], ['guong', 'Gương'], ['luoc', 'Lược'], ['khan', 'Khăn'], ['goi', 'Giấy gói']],
    r: { kim: ['kim', 'chi', 'goi'], guong: ['guong', 'luoc', 'goi'], khan: ['khan', 'goi'] } },
  tra: { pieces: [['goi', 'Giấy gói'], ['sen', 'Trà sen'], ['man', 'Trà mạn'], ['day', 'Dây buộc'], ['am', 'Ấm'], ['chen', 'Chén']],
    r: { sen: ['goi', 'sen', 'day'], man: ['goi', 'man', 'day'], am: ['am', 'chen', 'goi'] } },
  may: { pieces: [['do', 'Thước đo'], ['vai', 'Vải'], ['keo', 'Kéo'], ['kim', 'Kim chỉ'], ['khan', 'Khăn'], ['gap', 'Gấp']],
    r: { aodai: ['do', 'vai', 'keo', 'kim'], sua: ['keo', 'kim'], khanxep: ['khan', 'gap'] } },
  den: { pieces: [['khung', 'Khung tre'], ['do', 'Giấy đỏ'], ['vang', 'Giấy vàng'], ['canh', 'Cánh sen'], ['ho', 'Hồ dán'], ['nen', 'Nến'], ['tua', 'Tua']],
    r: { tron: ['khung', 'do', 'ho', 'tua'], sen: ['khung', 'canh', 'ho', 'nen'], keo: ['khung', 'vang', 'ho', 'nen', 'tua'], hoa: ['canh', 'nen'] } },
};
let P4M = null;
function p4MiniStart(key) {
  const R = p4Shops()[key]; if (!R) return; p4ShopFix(R);
  const K = p4Kind(R), G = P4_MINI[K.game];
  if (!G) { toast('Quán này chưa có trò tự tay bán.', 2.4); return; }
  if (R.shut) { toast('Quán đang đóng cửa: mở cửa rồi hẵng bán.', 2.6); return; }
  if (p4Left(R) < 1) { toast('Hết hàng rồi: nhập hàng đã.', 2.4); return; }
  P4M = { key, R, K, G, t: 0, tray: [], cust: [], next: 1.2, got: 0, n: 0, miss: 0, msg: '', msgT: 0 };
  $('#p4miniT').textContent = (P4_GAME_WORD[K.game] || 'Tự tay bán') + ' · ' + R.name;
  $('#p4miniEnd').hidden = true; $('#p4miniPlay').hidden = false;
  $('#p4miniP').innerHTML = G.pieces.map(([id, nm]) => `<button class="btn alt" data-pc="${id}">${nm}</button>`).join('');
  p4Sheets('p4mini'); p4MiniDraw();
  clearInterval(p4MiniStart.tk); p4MiniStart.tk = setInterval(p4MiniTick, 100);
}
function p4MiniTick() {
  const M = P4M; if (!M || P4.sheet !== 'p4mini' || document.hidden) return;
  const dt = .1; M.t += dt; if (M.msgT > 0) M.msgT -= dt;
  const slow = 1 + M.t / P4_MINI_SHIFT;                                     // customers come quicker as the shift goes on
  if ((M.next -= dt * slow) <= 0 && M.cust.length < 3 && M.t < P4_MINI_SHIFT - 4) {
    const w = p4PickWare(M.R);
    if (w && M.G.r[w.id]) { const P = p4PickResident(); M.cust.push({ w, who: P ? P.name : 'Khách', pat: 1, sp: .055 + Math.random() * .03 + M.t / P4_MINI_SHIFT * .03, t0: M.t }); }
    M.next = 3 + Math.random() * 3;
  }
  for (const c of M.cust) c.pat -= c.sp * dt;
  const gone = M.cust.filter(c => c.pat <= 0); if (gone.length) { M.miss += gone.length; M.cust = M.cust.filter(c => c.pat > 0); p4MiniSay(`${gone[0].who} chờ lâu quá, bỏ đi.`); }
  if (M.t >= P4_MINI_SHIFT || (p4Left(M.R) < 1 && !M.cust.length)) { p4MiniEnd(); return; }
  p4MiniDraw();
}
function p4MiniSay(s) { if (P4M) { P4M.msg = s; P4M.msgT = 2.2; } }
function p4MiniDraw() {
  const M = P4M; if (!M) return;
  const lab = id => (M.G.pieces.find(p => p[0] === id) || [id, id])[1];
  $('#p4miniH').innerHTML = `<span>Còn ${Math.max(0, Math.ceil(P4_MINI_SHIFT - M.t))} giây</span><span>Đã bán ${M.n} · thu ${c4Money(M.got)}</span>`;
  $('#p4miniC').innerHTML = [0, 1, 2].map(i => { const c = M.cust[i]; if (!c) return '<div class="mc empty">…</div>';
    return `<button class="mc" data-c="${i}"><b>${p4Esc(c.who)}</b><span>${c.w.n}</span><small>${M.G.r[c.w.id].map(lab).join(' → ')}</small><i class="pat"><i style="width:${Math.max(0, c.pat) * 100}%;background:${c.pat > .5 ? '#4f9a4a' : c.pat > .25 ? '#e0b43a' : '#b8412e'}"></i></i></button>`; }).join('');
  $('#p4miniY').innerHTML = M.tray.length ? M.tray.map(lab).join(' + ') : '<span class="sm">Khay trống: chạm các món bên dưới theo đúng thứ tự</span>';
  $('#p4miniM').textContent = M.msgT > 0 ? M.msg : '';
}
function p4MiniGive(i) {
  const M = P4M, c = M && M.cust[i]; if (!c) return;
  const want = M.G.r[c.w.id];
  if (M.tray.length === want.length && M.tray.every((x, k) => x === want[k])) {
    const r = p4ShopSell(M.R, M.key, c.w, 1, false), tip = r.n ? Math.round(r.got * .5 * Math.max(0, c.pat - .3) / .7) : 0;
    if (r.n) { SAVE4.money += tip; P4.today.take += tip; M.got += r.got + tip; M.n++; AU.pluck(86 + (M.n % 5)); p4MiniSay(tip ? `Đúng rồi! Khách thưởng thêm ${c4Money(tip)}.` : 'Đúng rồi!'); persist4(); p4Persist(); }
    else p4MiniSay('Hết ' + c.w.n.toLowerCase() + ' trong kho rồi!');
    M.cust.splice(i, 1); M.tray = [];
  } else { c.pat -= .25; M.tray = []; AU.tap(); p4MiniSay('Không phải thế!'); }
  p4MiniDraw();
}
function p4MiniEnd() {
  const M = P4M; if (!M) return; clearInterval(p4MiniStart.tk);
  $('#p4miniPlay').hidden = true; $('#p4miniEnd').hidden = false;
  $('#p4miniR').innerHTML = `<p>Bán được <b>${M.n}</b> món, thu <b>${c4Money(M.got)}</b>${M.miss ? `, ${M.miss} khách bỏ đi` : ''}.</p>`;
  P4M = null; p4Hud();
}
{
  const d = document.createElement('div'); d.id = 'p4mini'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 p4mini"><h3 id="p4miniT"></h3><div id="p4miniPlay"><div class="mh" id="p4miniH"></div><div class="mcs" id="p4miniC"></div><div class="tray" id="p4miniY"></div><p class="mm" id="p4miniM"></p><div class="pcs" id="p4miniP"></div><div class="row"><button class="btn alt" id="p4miniClr">Bỏ khay</button><button class="btn alt" id="p4miniStop">Thôi, nghỉ tay</button></div></div>'
    + '<div id="p4miniEnd" hidden><div id="p4miniR"></div><div class="row"><button class="btn" id="p4miniBack">Về quán</button><button class="btn alt" id="p4miniX">Đóng</button></div></div></div>';
  document.body.appendChild(d);
  $('#p4miniP').addEventListener('click', e => { const b = e.target.closest('[data-pc]'); if (!b || !P4M) return; AU.tap(); if (P4M.tray.length < 6) P4M.tray.push(b.dataset.pc); p4MiniDraw(); });
  $('#p4miniC').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b && P4M) p4MiniGive(+b.dataset.c); });
  $('#p4miniClr').addEventListener('click', () => { if (P4M) { P4M.tray = []; AU.tap(); p4MiniDraw(); } });
  $('#p4miniStop').addEventListener('click', () => { AU.tap(); p4MiniEnd(); });
  $('#p4miniBack').addEventListener('click', () => { AU.tap(); p4ShopSheet(); });
  $('#p4miniX').addEventListener('click', () => { AU.tap(); p4Sheets(null); });
}
