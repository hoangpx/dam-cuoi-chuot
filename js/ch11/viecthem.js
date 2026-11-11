/* Chương XI · Làng Vũ Đại — việc cho những ngày sau (owner 2026-11-10: "làm thêm các nhiệm vụ cho các ngày sau cho người chơi
   đỡ chán khi làm hết nhiệm vụ rồi"). Four things, all without an end:
   1. NHỜ LẠI: a villager with 3 hearts or more (a child 2) who has no request of their own to give asks again every three days
      (about half of them each time): crops, forest things, fish (when the player owns a rod), eggs (when hens or ducks are kept),
      earth and stone (with a shovel), a letter to someone with the answer brought back, or a round of asking after two people.
      Runs out after three days; at most C11_AGAIN_MAX running.
   2. ĐƠN LỚN on the đình's board (from day 6, about one day in three): two or three kinds of crops in bulk for one buyer,
      three days to fill, paid well. The board also carries more posts as the days go by.
   3. VIỆC CHUNG CỦA LÀNG (from day 5, the first row of the board): the whole village builds something; the player gives wood,
      stone, clay, rice or money over many days. Eight works one after another, then the rice fund for the poor again and again.
   4. DANH HIỆU: titles by the number of jobs done, each with a purse from the đình. */

const C11_AGAIN_MAX = 3, C11_AGAIN_DAYS = 3;
const C11_AGAIN_NO = ['chi', 'cuong', 'hac'];   // they speak in their own way (tao / lão): the shared lines would sound wrong
const C11_AGAIN = {
  an: { items: () => C11_DELIVER, n: [3, 6], ask: ['Nhà tôi lại sắp có khách. Anh để cho tôi {n} {i} nhé, tôi trả tiền sòng phẳng.', 'Hôm trước anh giúp, cả nhà nhắc mãi. Lần này tôi cần {n} {i}, anh xem có không?', 'Chợ dạo này đắt quá. Anh có {n} {i} thì để cho tôi với.', 'Tôi định làm mâm cơm cúng, còn thiếu {n} {i}.'], end: ['Tốt quá, đúng lúc đang cần. Tiền đây anh cầm lấy.', 'Có anh, nhà tôi đỡ bao nhiêu việc.', 'Của nhà trồng có khác, tươi hơn ngoài chợ.'] },
  ca: { items: () => ['ca_diec', 'ca_bong', 'ca_ro', 'tep'], n: [2, 4], ask: ['Nghe nói anh mới sắm cần câu. Câu giúp tôi {n} {i} nấu canh nhé.', 'Cả nhà tôi thèm {i} kho tương. Anh kiếm giúp {n} được không?', 'Lâu rồi nhà không có bữa cá. Anh câu được {n} {i} thì để tôi mua.'], end: ['Cá tươi quá! Tối nay nhà tôi có bữa ngon.', 'Tay câu của anh khá đấy. Tiền cá đây.'] },
  trung: { items: () => ['trung_ga', 'trung_vit'], n: [3, 5], ask: ['Gà vịt nhà anh đẻ đều chứ? Để cho tôi {n} {i} nhé.', 'Nhà có người mới ốm dậy, cần {n} {i} tẩm bổ.', 'Tôi muốn làm ít bánh, thiếu {n} {i}.'], end: ['Trứng to, vỏ hồng. Cảm ơn anh.', 'Thế là đủ rồi. Anh cầm tiền nhé.'] },
  dat: { items: () => ['dat_set', 'da', 'soi'], n: [4, 7], ask: ['Tôi đắp lại cái bếp, cần {n} {i}. Anh có xẻng thì đào giúp tôi.', 'Nền chuồng nhà tôi lún, phải kê thêm {n} {i}.', 'Tôi muốn sửa cái bờ giếng, thiếu {n} {i}.'], end: ['Đủ rồi. Việc nặng thế mà anh chịu giúp, quý quá.', 'Thế này thì mai tôi làm được rồi.'] },
};
const C11_AGAIN_THU = { ask: ['Anh tiện đường thì đưa giúp lá thư này cho {y}, rồi về cho tôi biết họ nói sao nhé.', 'Tôi có lời nhắn cho {y} mà ngại sang. Anh cầm thư đưa giúp tôi.', 'Chuyện hôm nọ tôi còn áy náy với {y}. Anh đưa hộ lá thư này.'],
  say: ['Thư của {p} à? Được, tôi đọc rồi. Anh về nói là tôi nhận lời.', 'Lại thư của {p}... Bảo là mai tôi sang, hai bên nói chuyện cho rõ.', '{p} gửi à? Anh về nói giúp là tôi không để bụng đâu.'],
  end: ['Họ nói thế à? Nhẹ cả người. Cảm ơn anh đã đi giúp.', 'Tốt quá. Chút tiền này anh uống nước.'] };
const C11_AGAIN_THAM = { ask: ['Mấy hôm nay không thấy {a} với {b} đâu. Anh ghé hỏi thăm giúp tôi xem có ốm đau gì không.', 'Tôi bận quá không đi được. Anh sang nhà {a} và {b} hỏi thăm giúp, rồi về nói tôi nghe.', 'Sắp có việc họ. Anh báo giúp cho {a} và {b} biết, tôi cảm ơn.'],
  say: ['{p} hỏi thăm à? Tôi vẫn khoẻ, chỉ bận việc đồng thôi. Cho tôi gửi lời cảm ơn.', 'Quý hoá quá. Anh về nói là nhà tôi vẫn bình thường.', 'Được, tôi biết rồi. Phiền anh đi một chuyến.'],
  end: ['Cả hai đều ổn à? Thế thì tôi yên tâm rồi.', 'Anh đi giúp một vòng, tôi đỡ hẳn. Cầm lấy chút quà.'] };
const c11HPick = (L, ...k) => L[Math.floor(c11Hash(...k) * L.length) % L.length];
/* which kinds the player can do now (a rod for fish, a shovel for earth, hens or ducks for eggs) */
function c11AgainKinds(p) {
  const K = ['an', 'an'];
  if (p.role !== 'c') { K.push('thu', 'tham'); if (c11Has('rod')) K.push('ca'); if (c11Has('shovel')) K.push('dat'); if ((SAVE11.herd || []).some(h => h.kind === 'ga' || h.kind === 'vit')) K.push('trung'); }
  return K;
}
/* the request this person makes in this three-day turn, or null */
function c11Again(p) {
  const Q = c11Q(), day = SAVE11.day, turn = Math.floor((day + p.n % C11_AGAIN_DAYS) / C11_AGAIN_DAYS), id = `${p.id}:r${turn}`;
  if (p.stall || C11_AGAIN_NO.includes(p.id) || day < 3 || Q.done[id] || Q.gone && Q.gone[id]) return null;
  if (c11Hearts(p.id) < (p.role === 'c' ? 2 : 3) || c11Hash(p.n, turn, 91) >= .5) return null;
  if (Q.act.filter(q => q.src === 'lai').length >= C11_AGAIN_MAX) return null;
  const K = c11AgainKinds(p), kind = c11HPick(K, p.n, turn, 92), base = { id, due: day + C11_AGAIN_DAYS, src: 'lai' };
  const others = C11_PPL.filter(q => q !== p && !q.stall && q.role !== 'c' && q.home.a !== 'out');
  if (kind === 'thu') {
    const y = C11_PPL.find(q => q.name === p.y && !q.stall && q.role !== 'c') || c11HPick(others, p.n, turn, 93), T = C11_AGAIN_THU;
    return { ...base, title: `${p.name} gửi thư cho ${y.name}`, start: c11HPick(T.ask, p.n, turn, 94).replace('{y}', y.name), give: 'thu_tay',
      steps: [{ t: 'carry', who: y.id, item: 'thu_tay', say: c11HPick(T.say, p.n, turn, 95).replace('{p}', p.name) }, { t: 'talk', who: p.id }], end: c11HPick(T.end, p.n, turn, 96), reward: { f: 140, m: 35, ff: { [y.id]: 60 } } };
  }
  if (kind === 'tham') {
    const a = c11HPick(others, p.n, turn, 97); let b = c11HPick(others, p.n, turn, 98); if (b === a) b = others[(others.indexOf(a) + 1) % others.length];
    const T = C11_AGAIN_THAM, say = k => c11HPick(T.say, p.n, turn, k).replace('{p}', p.name);
    return { ...base, title: `Hỏi thăm giúp ${p.name}`, start: c11HPick(T.ask, p.n, turn, 99).replace('{a}', a.name).replace('{b}', b.name),
      steps: [{ t: 'talk', who: a.id, say: say(100) }, { t: 'talk', who: b.id, say: say(101) }, { t: 'talk', who: p.id }], end: c11HPick(T.end, p.n, turn, 102), reward: { f: 150, m: 40, ff: { [a.id]: 50, [b.id]: 50 } } };
  }
  const T = C11_AGAIN[kind], it = c11HPick(T.items().filter(i => C11_ITEMS[i]), p.n, turn, 103), I = C11_ITEMS[it];
  const n = p.role === 'c' ? 1 + Math.floor(c11Hash(p.n, turn, 104) * 2) : T.n[0] + Math.floor(c11Hash(p.n, turn, 104) * (T.n[1] - T.n[0] + 1));
  const ask = p.role === 'c' ? c11HPick(C11_ASK_KID, p.n, turn, 105) : c11HPick(T.ask, p.n, turn, 105);
  return { ...base, title: `${p.name} nhờ ${n} ${I.name.toLowerCase()}`, start: ask.replace('{n}', n).replace('{i}', I.name.toLowerCase()), steps: [{ t: 'bring', who: p.id, item: it, n }],
    end: p.role === 'c' ? 'Cháu cảm ơn chú ạ!' : c11HPick(T.end, p.n, turn, 106), reward: { f: 120, m: Math.round(Math.max(I.price, 4) * n * 2) + 25 } };
}

/* ---------- đơn lớn: a bulk order on the board ---------- */
const C11_BIG = [
  { who: 'ba', t: 'Nhà cụ Bá mở tiệc mừng thọ', say: 'Hàng của anh à? Được, người nhà ra nhận. Còn thiếu gì thì mang nốt.', end: 'Đủ cả rồi. Tiệc nhà tôi năm nay tươm tất. Tiền đây, không thiếu anh đồng nào.' },
  { who: 'tu', t: 'Đình làm lễ cầu mùa', say: 'Cậu mang lễ vật ra đấy à? Để vào gian bên, còn thiếu thì mang tiếp nhé.', end: 'Lễ vật đủ rồi. Cả làng góp tiền trả cậu đây, thần làng chứng cho.' },
  { who: 'trade:buôn chuyến', t: 'Lái buôn gom hàng lên tỉnh', say: 'Hàng tốt đấy. Tôi còn cần mấy thứ nữa mới đủ chuyến.', end: 'Đủ chuyến rồi! Mai tôi lên tỉnh. Tiền hàng đây, lần sau tôi lại đặt anh.' },
  { who: 'duyen', t: 'Cô Duyên nấu cỗ thuê', say: 'Anh mang ra rồi à? Em còn thiếu mấy thứ nữa cơ.', end: 'Đủ rồi anh ạ! Cỗ này em nấu được hai chục mâm. Tiền công em chia anh đây.' },
  { who: 'lanh', t: 'Nhà anh Lành làm cỗ cưới', say: 'Quý hoá quá. Còn mấy thứ nữa anh giúp tôi nốt nhé.', end: 'Đủ lễ đủ cỗ rồi! Nhà tôi gửi anh tiền, hôm cưới nhớ sang uống rượu.' },
];
function c11BigPost(day, id) {
  const r = j => c11Hash(day, j, 733), B = C11_BIG.filter(b => c11Who(b.who)), b = B[Math.floor(r(1) * B.length)], who = c11Who(b.who);
  const kinds = 2 + (day >= 14 && r(2) < .5 ? 1 : 0), pool = C11_DELIVER.filter(i => C11_ITEMS[i] && !['go', 'co'].includes(i)), steps = []; let m = 0;
  for (let k = 0; k < kinds; k++) {
    let it = pool[Math.floor(r(10 + k) * pool.length)]; while (steps.some(s => s.item === it)) it = pool[(pool.indexOf(it) + 1) % pool.length];
    const n = 5 + Math.floor(r(20 + k) * (day >= 14 ? 8 : 5)); steps.push({ t: 'bring', who, item: it, n, say: b.say }); m += C11_ITEMS[it].price * n;
  }
  return { id, big: 1, days: 3, title: `Đơn lớn: ${b.t}`, giver: 'lang', steps, end: b.end, reward: { m: Math.round(m * 2.6) + 120, ff: { [who]: 250 } } };
}

/* ---------- việc chung của làng: the whole village builds something, the player gives over many days ---------- */
const C11_WORKS = [
  { t: 'Lợp lại mái quán nước', why: 'Mái quán cô Duyên dột, khách ngồi uống nước ướt cả lưng.', need: [['go', 12], ['co', 20]], m: 80, item: 'che_kho' },
  { t: 'Lát lại sân đình', why: 'Gạch sân đình vỡ nhiều, sắp tới hội không có chỗ trải chiếu.', need: [['da', 15], ['cat', 10], ['dat_set', 10]], m: 120, item: 'tranh_dong_ho' },
  { t: 'Kè bờ ao làng', why: 'Bờ ao sạt, trẻ con ra chơi dễ ngã.', need: [['da', 25], ['go', 20]], m: 160, item: 'non_quai_thao' },
  { t: 'Dựng cầu ván ra bến', why: 'Mùa nước lên, người ra bến phải lội bùn.', need: [['go', 40], ['da', 10]], m: 200, item: 'den_dau' },
  { t: 'Đắp đê trước mùa lũ', why: 'Đê sông năm ngoái vỡ một quãng. Không đắp thì đồng làng mất trắng.', need: [['dat_set', 30], ['da', 20], ['co', 30]], m: 260, item: 'chuong_dong' },
  { t: 'Sửa lớp học của ông giáo', why: 'Lớp học dột nát, bọn trẻ phải ngồi nhờ hiên đình.', need: [['go', 30], ['dat_set', 15], ['$', 300]], m: 0, item: 'sach_nom' },
  { t: 'Đúc lại chuông đình', why: 'Chuông đình nứt từ năm bão. Cả làng góp tiền đúc lại.', need: [['$', 600], ['go', 20]], m: 0, item: 'khanh_bac' },
  { t: 'Mở hội làng', why: 'Việc lớn xong cả rồi. Làng mở hội ba ngày, nhà nào cũng góp gạo góp rau.', need: [['lua', 30], ['bi', 10], ['ngo', 15]], m: 400, item: 'trong_dong_nho' },
];
const C11_WORK_AGAIN = { t: 'Quỹ thóc cho nhà nghèo', why: 'Tháng ba ngày tám, mấy nhà nghèo trong làng đứt bữa. Đình lập quỹ thóc, ai có thì góp.', need: [['lua', 20]], m: 60, again: 1 };
const C11_WORK_DAY = 5;
const c11WorkS = () => SAVE11.work || (SAVE11.work = { i: 0, got: {}, at: 0 });
const c11WorkNow = () => { const S = c11WorkS(); return SAVE11.day < C11_WORK_DAY || SAVE11.day < S.at ? null : (C11_WORKS[S.i] || C11_WORK_AGAIN); };
const c11WorkName = k => k === '$' ? 'tiền' : c11IName(k);
const c11WorkLine = W => W.need.map(([k, n]) => { const g = c11WorkS().got[k] || 0; return k === '$' ? `tiền ${c4Money(g)} / ${c4Money(n)}` : `${c11IName(k)} ${g}/${n}`; }).join(' · ');
/* give everything the work still needs that is in the bag (money: up to 100 đồng a tap) */
function c11WorkGive() {
  const W = c11WorkNow(), S = c11WorkS(); if (!W) return;
  const bits = [];
  for (const [k, n] of W.need) {
    const left = n - (S.got[k] || 0); if (left <= 0) continue;
    const have = k === '$' ? Math.min(SAVE11.money, 100) : c11Count(k), g = Math.min(left, have); if (g <= 0) continue;
    if (k === '$') SAVE11.money -= g; else c11Take(k, g);
    S.got[k] = (S.got[k] || 0) + g; bits.push(k === '$' ? c4Money(g) : `${g} ${c11IName(k)}`);
  }
  if (!bits.length) { c11OpenBoard(); C11.menu.note = `Trong túi không có thứ làng đang cần (${W.need.filter(([k, n]) => (S.got[k] || 0) < n).map(([k]) => c11WorkName(k)).join(', ')})`; return; }
  S.gave = (S.gave || 0) + 1; c11Sfx.tap();
  if (W.need.every(([k, n]) => (S.got[k] || 0) >= n)) { c11WorkDone(W); return; }
  persist11(); c11OpenBoard(); C11.menu.note = `Đã góp ${bits.join(', ')}`;
}
function c11WorkDone(W) {
  const S = c11WorkS(), Q = c11Q(); let met = 0;
  for (const p of C11_PPL) { const s = SAVE11.ppl && SAVE11.ppl[p.id]; if (s && s.met) { s.f = Math.min(2500, s.f + (W.again ? 25 : 50)); met++; } }
  if (W.m) SAVE11.money += W.m;
  let where = ''; if (W.item && C11_ITEMS[W.item] && c11Add(W.item, 1)) { c11Put(SAVE11.chest, W.item, 1); where = ' (túi đầy, đã cất vào rương)'; }
  if (!W.again) S.i++; S.n = (S.n || 0) + 1; S.got = {}; S.at = SAVE11.day + 2; Q.n = (Q.n || 0) + 1; c11TitleCheck();
  const bits = [W.m ? '+' + c4Money(W.m) : '', W.item && C11_ITEMS[W.item] ? c11IName(W.item) : '', met ? `${met} người quen quý mình hơn` : ''].filter(Boolean).join(' · ');
  persist11(); C11.menu = null; c11Msg(`Xong việc chung: ${W.t}${bits ? ' · ' + bits : ''}${where}`, '#2f6a4c'); c11Sfx.pluck && c11Sfx.pluck();
}

/* ---------- danh hiệu: titles by the number of jobs done ---------- */
const C11_TITLES_JOB = [[5, 'Người làng mới', 50], [15, 'Người được việc', 100], [30, 'Người đáng tin', 200], [50, 'Cánh tay của làng', 350], [80, 'Người cả làng quý', 500], [120, 'Bậc hương hào', 800], [200, 'Tiên chỉ không ngôi', 1500]];
const c11TitleOf = n => { let t = null; for (const r of C11_TITLES_JOB) if (n >= r[0]) t = r; return t; };
function c11TitleCheck() {
  const Q = c11Q(), n = Q.n || 0, t = c11TitleOf(n); if (!t) return;
  if ((Q.title || 0) >= t[0]) return;
  Q.title = t[0]; SAVE11.money += t[2];
  setTimeout(() => c11Msg(`Làng gọi bạn là "${t[1]}" · đình thưởng ${c4Money(t[2])}`, '#8a5a12'), 2600);
}
/* the line under the jobs tab and on the board */
function c11JobsLine() {
  const n = c11Q().n || 0, t = c11TitleOf(n), nx = C11_TITLES_JOB.find(r => r[0] > n);
  return `Đã làm xong ${n} việc${t ? ` · ${t[1]}` : ''}${nx ? ` · còn ${nx[0] - n} việc nữa thành "${nx[1]}"` : ''}`;
}
/* how long a running job has left, for the jobs tab */
const c11DueText = q => !q.due ? '' : q.due - SAVE11.day <= 0 ? ' · hết hạn hôm nay' : q.due - SAVE11.day === 1 ? ' · hạn ngày mai' : ` · còn ${q.due - SAVE11.day} ngày`;
