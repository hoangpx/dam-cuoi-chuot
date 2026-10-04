/* Chương IV · village stories (Chuyện) and achievements (Thành tựu), two more tabs of the wife's book.
   A story is a little mystery among three residents tied to each other (A knows B, B knows C), picked from the village
   when it is built: each line is learnt once its teller is met; the last (C) tells the end only to a stall they like
   (≥ C4_STORY_LIKE). A solved story brings money or makes the stall better known (SAVE4.perk: +4% folk each).
   Achievements are ticks the book keeps (SAVE4.ach[id] = day reached). All text is original. */
const C4_STORY_LIKE = 50;
const C4_STORIES = [
  { id: 'sao', title: 'Tiếng sáo lúc nửa đêm', lines: ['{A} kể đêm nào cũng nghe tiếng sáo ở đầu xóm, buồn não ruột.', '{B} thì thào: người thổi sáo là {C} đấy.', '{C} thú thật: thổi sáo cho đỡ nhớ người thương ở làng bên.'], money: 60, end: '{C} rủ cả phường bát âm ra quán uống nước.' },
  { id: 'ga', title: 'Con gà mái mất tích', lines: ['{A} mất con gà mái hoa mơ, tiếc cả buổi.', '{B} thấy con gà chạy về phía nhà {C}.', '{C} nhặt được gà lạc, giữ hộ mãi chẳng biết của ai.'], perk: 1, end: 'Gà về với chủ; {A} đi đâu cũng khen quán nhà mình.' },
  { id: 'noi', title: 'Cái nồi đồng của cụ', lines: ['{A} lục tung nhà tìm cái nồi đồng cụ để lại.', '{B} nhớ ra đã mượn nồi rồi cho {C} mượn lại.', '{C} đem trả nồi, còn biếu thêm thúng gạo.'], money: 50, end: 'Nhà {A} đãi cả xóm, đặt trầu ở quán mình.' },
  { id: 'rau', title: 'Mớ rau trước cửa', lines: ['Sáng nào trước cửa nhà {A} cũng có mớ rau tươi.', '{B} bảo hôm nọ thấy {C} lén đặt rau rồi đi.', '{C} đỏ mặt: thương nhà {A} vất vả, giúp chút thôi.'], perk: 1, end: 'Chuyện tốt lan khắp làng, ai cũng nhắc tên quán nhà mình.' },
  { id: 'no', title: 'Món nợ cũ', lines: ['{A} còn giữ tờ giấy nợ từ thời cụ thân sinh.', '{B} biết người vay ngày xưa là ông cụ nhà {C}.', '{C} xin trả nợ thay cha, hai nhà làm lành.'], money: 80, end: 'Hai nhà làm lành, mua trầu ở quán mình để mời nhau.' },
  { id: 'da', title: 'Cây đa có ma?', lines: ['{A} sợ chẳng dám đi qua gốc đa sau đình.', '{B} bảo đêm đêm có bóng trắng ngồi dưới gốc đa.', '{C} cười: là mình ra hóng mát, mặc áo cánh trắng!'], perk: 1, end: 'Cả làng cười một trận, ai cũng kể lại ở quán nhà mình.' },
  { id: 'thu', title: 'Lá thư không tên', lines: ['{A} nhận được lá thư không đề tên người gửi.', '{B} nhận ra nét chữ là của {C}.', '{C} thú nhận viết thư xin lỗi chuyện cãi nhau năm ngoái.'], money: 40, end: '{A} và {C} lại thân như xưa, rủ nhau ra quán.' },
  { id: 'do', title: 'Người lạ ở bến đò', lines: ['{A} thấy một người lạ ngày nào cũng ngồi ở bến đò.', '{B} kể người lạ hỏi thăm nhà {C}.', '{C} mừng rỡ: đó là đứa em thất lạc bao năm!'], perk: 1, end: 'Nhà {C} mở tiệc đoàn viên, khen quán mình hết lời.' },
];
const C4_STORY_COL = ['#a3332a', '#2f5f8f', '#2f6a4c', '#c98a1c', '#7a4aa0', '#c0567a', '#8a5a2a', '#2f6a4c'];
// bind each story to three residents of this village (A–B–C along ties, no one in two stories)
function c4Stories() {
  const P = c4People(); if (P.stories) return P.stories;
  const rnd = mulberry((SAVE4.seed || 7) + 99), used = new Set(), out = [];
  const grown = P.list.filter(p => p.kind === 'mouse');
  for (const S of C4_STORIES) {
    for (let k = 0; k < 200; k++) {
      const a = grown[(rnd() * grown.length) | 0]; if (used.has(a.id)) continue;
      const bs = a.links.map(l => P.list[l.to]).filter(q => !used.has(q.id) && q.house !== a.house); if (!bs.length) continue;
      const b = bs[(rnd() * bs.length) | 0];
      const cs = b.links.map(l => P.list[l.to]).filter(q => !used.has(q.id) && q.id !== a.id && q.house !== b.house); if (!cs.length) continue;
      const c = cs[(rnd() * cs.length) | 0];
      for (const p of [a, b, c]) used.add(p.id);
      out.push({ ...S, who: [a.id, b.id, c.id] }); break;
    }
  }
  return (P.stories = out);
}
const c4StoryFill = (s, St) => { const P = c4People(); return s.replace(/\{([ABC])\}/g, (m, k) => `<b>${P.list[St.who['ABC'.indexOf(k)]].name}</b>`); };
const c4StoryDone = St => SAVE4.stories && SAVE4.stories[St.id];
// solved when all three are met and the last one likes the stall enough to tell the end
function c4StoryCheck() {
  if (SAVE4.day < C4_BOOK_DAY) return;
  SAVE4.stories = SAVE4.stories || {};
  for (const St of c4Stories()) {
    if (c4StoryDone(St) || !St.who.every(c4Known) || c4Like(St.who[2]) < C4_STORY_LIKE) continue;
    SAVE4.stories[St.id] = SAVE4.day;
    if (St.money) { SAVE4.money += St.money; if (C4.today) C4.today.got += St.money; }
    if (St.perk) SAVE4.perk = (SAVE4.perk || 0) + St.perk;
    C4.noteNew = true; AU.pluck(92);
    toast(`Rõ chuyện "${St.title}"! ${St.money ? '+' + c4Money(St.money) : 'Quán nổi tiếng hơn.'}`, 3.4);
  }
}
function c4StoriesHtml() {
  const P = c4People(), sts = c4Stories().filter(St => St.who.some(c4Known));
  if (!sts.length) return '<p>Chưa nghe được chuyện gì trong làng. Quen thêm người, khắc có người kể.</p>';
  const done = sts.filter(c4StoryDone).length;
  return `<p class="cnt">Đã rõ ${done}/${C4_STORIES.length} chuyện</p>` + sts.map(St => {
    const i = c4Stories().indexOf(St), col = C4_STORY_COL[i % C4_STORY_COL.length], n = St.who.filter(c4Known).length, ok = c4StoryDone(St);
    const dots = St.who.map(id => `<i class="${c4Known(id) ? 'on' : ''}"></i>`).join('') + `<i class="${ok ? 'on' : ''}"></i>`;
    const lines = St.lines.map((l, k) => c4Known(St.who[k]) ? `<p>• ${c4StoryFill(l, St)}</p>` : '<p class="unk">• ???</p>').join('');
    const chips = St.who.map(id => c4Known(id) ? `<button class="fk sm" data-who="${id}"><img src="${c4Face(P.list[id])}" alt=""><b>${P.list[id].name}</b></button>` : '<div class="fk sm unk"><i>?</i></div>').join('');
    const wait = !ok && n === 3 ? `<p class="hint">${P.list[St.who[2]].name} còn chưa đủ thân để kể hết.</p>` : '';
    return `<div class="story" style="border-left-color:${col}"><h5><span class="no" style="background:${col}">${i + 1}</span>${St.title}<span class="dots">${dots}</span></h5>${lines}${ok ? `<p class="back">${c4StoryFill(St.end, St)} ${St.money ? '+' + c4Money(St.money) : '(khách ghé đông hơn)'}</p>` : wait}<div class="mem">${chips}</div></div>`;
  }).join('');
}

/* ---------- achievements ---------- */
const c4KnownN = () => c4People().list.filter(p => c4Known(p.id)).length;
const c4CloseN = () => c4People().list.filter(p => c4Like(p.id) >= 80).length;
const c4HouseDoneN = () => c4People().houses.filter(h => h.members.every(c4Known)).length;
const C4_ACH = [
  ['xom', 'Xóm giềng', [
    ['quen5', 'Quen mặt', 'Quen 5 người khách', () => c4KnownN() >= 5],
    ['ban', 'Có bạn', 'Một người thân thiết với quán', () => c4CloseN() >= 1],
    ['nha', 'Người nhà', 'Quen hết một nhà', () => c4HouseDoneN() >= 1],
    ['gioi', 'Giới thiệu', 'Có khách giới thiệu người đến quán', () => (SAVE4.refs || 0) >= 1],
    ['quen20', 'Người xóm', 'Quen 20 người', () => c4KnownN() >= 20],
    ['caxom', 'Cả xóm', 'Quen hết một xóm', () => C4_XOM.some(x => { const hs = c4People().houses.filter(h => h.xom === x); return hs.length && hs.every(h => h.members.every(c4Known)); })],
    ['quen40', 'Ai cũng chào', 'Quen 40 người', () => c4KnownN() >= 40],
    ['lang', 'Cả làng', 'Quen hết cả làng', () => c4KnownN() >= c4People().list.length],
    ['than10', 'Chân trong', '10 người thân thiết với quán', () => c4CloseN() >= 10],
    ['nha5', 'Gia phả', 'Quen hết năm nhà', () => c4HouseDoneN() >= 5],
    ['tham', 'Thám tử', 'Rõ một chuyện trong làng', () => Object.keys(SAVE4.stories || {}).length >= 1],
    ['hetchuyen', 'Biết hết chuyện', 'Rõ mọi chuyện trong làng', () => Object.keys(SAVE4.stories || {}).length >= C4_STORIES.length],
  ]],
  ['buon', 'Buôn bán', [
    ['mo', 'Mở hàng', 'Bán được món hàng đầu tiên', () => (SAVE4.sold || 0) >= 1],
    ['tuan', 'Một tuần', 'Buôn bán qua bảy ngày', () => SAVE4.day > 7],
    ['dat', 'Ngày đắt hàng', 'Lãi hơn 200 đồng trong một ngày', () => (SAVE4.best || 0) >= 200],
    ['sap', 'Sạp lều', 'Dựng được sạp lều', () => SAVE4.lv >= 1],
    ['hai', 'Hai gánh', 'Thuê thêm một chỗ bán', () => C4_SHOPS.some(c4Own)],
    ['gian', 'Gian mái ngói', 'Dựng được gian mái ngói', () => SAVE4.lv >= 2],
    ['day', 'Đủ cả dãy', 'Thuê đủ bốn chỗ bán', () => C4_SHOPS.every(c4Own)],
    ['goal', 'Hai quan', 'Để dành đủ hai quan', () => !!SAVE4.goal],
    ['nam', 'Năm quan', 'Có trong tay năm quan', () => SAVE4.money >= 3000],
    ['thang', 'Một tháng', 'Buôn bán qua ba mươi ngày', () => SAVE4.day > 30],
  ]],
];
function c4AchCheck() {
  SAVE4.ach = SAVE4.ach || {};
  for (const [, , list] of C4_ACH) for (const [id, name, , ok] of list) if (!SAVE4.ach[id] && ok()) {
    SAVE4.ach[id] = SAVE4.day; C4.noteNew = true;
    setTimeout(() => toast(`Thành tựu: ${name}`, 2.4), 300 + Math.random() * 600);
  }
}
function c4AchHtml() {
  const all = C4_ACH.flatMap(g => g[2]), n = all.filter(a => SAVE4.ach && SAVE4.ach[a[0]]).length;
  return `<p class="cnt">Đã đạt ${n}/${all.length}</p>` + C4_ACH.map(([, title, list]) => `<div class="ach"><h5>${title}</h5>${list.map(([id, name, desc]) => {
    const d = SAVE4.ach && SAVE4.ach[id];
    return `<div class="a ${d ? 'on' : ''}"><i></i><b>${name}</b><span>${desc}${d ? ' · ngày ' + d : ''}</span></div>`; }).join('')}</div>`).join('');
}
