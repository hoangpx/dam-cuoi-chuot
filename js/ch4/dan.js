/* Chương IV · the village folk (dân làng): every grown-up at the market is a resident with a name, a household, a trade,
   a temper (C4_TRAITS) and ties to others — kin in the same house (vợ chồng, cha mẹ – con, anh em) and across houses
   (hàng xóm, bạn bè, bạn nhậu, thông gia). The village is drawn from SAVE4.seed, so it is the same every visit; only
   what changes is saved, in SAVE4.folk[id] = { k: day met, a: liking 0–100, v: visits, inv: day invited, deal: 'half'
   | 'free' for their next purchase, ref: someone spoke well of the stall, bad: someone spoke ill of it }.
   From day C4_BOOK_DAY the wife writes every buyer into her book: the book's tabs list them (Khách quen), draw the web of
   ties among them (Quan hệ) and their households (Gia phả). Liking decides how often someone comes back, how keen they
   are to buy, and whether they send their kin and friends; running out of stock (or a long wait) costs liking.
   Children are not residents: they come and go nameless (folk.js C4_NAMES.child). */
const C4_BOOK_DAY = 3;
const C4_TRAITS = {
  xoi:    { name: 'Xởi lởi', desc: 'Quen biết rộng, mến ai là rủ cả họ đến mua.', links: 4, refer: 1.8, gain: 1.1, loss: 1 },
  ky:     { name: 'Kỹ tính', desc: 'Khó chiều: hết hàng hay phải chờ lâu là giận lâu.', links: 2, refer: .8, gain: .8, loss: 1.8 },
  chuyen: { name: 'Nhiều chuyện', desc: 'Biết hết chuyện làng; ưng thì khen khắp nơi, không ưng thì nói xấu khắp nơi.', links: 5, refer: 1.5, gain: 1, loss: 1.3, gossip: true },
  chat:   { name: 'Chặt chẽ', desc: 'Tiếc từng đồng, cứ giảm giá là mừng.', links: 2, refer: .8, gain: .9, loss: 1, half: 2.2 },
  hien:   { name: 'Hiền lành', desc: 'Dễ tính, hết hàng cũng chẳng giận mấy.', links: 2, refer: 1, gain: 1.1, loss: .5 },
  sidien: { name: 'Sĩ diện', desc: 'Thích được mời, được biếu; giảm giá thì lại chê.', links: 3, refer: 1.2, gain: 1, loss: 1.2, free: 2, half: .4 },
  itnoi:  { name: 'Ít nói', desc: 'Chẳng mấy khi kể chuyện với ai.', links: 0, refer: .3, gain: 1, loss: .9 },
  khogan: { name: 'Khó gần', desc: 'Mua mấy lần cũng chưa chịu bắt chuyện, thân lên chậm. Nhưng đã thành mối ruột thì mua nhiều, nhiệt tình, rủ cả họ đến.', links: 3, refer: 2.4, gain: .55, loss: 1.2, meet: 5, ruot: 3 },
};
// a regular (owner): liking from C4_RUOT on, they buy more (a hard one far more), come often and send others
const C4_RUOT = 80;
const c4Ruot = id => c4Known(id) && SAVE4.folk[id].a >= C4_RUOT;
// more given names for the households added later (kept apart so the first village stays as it was drawn)
const C4_GIVEN2 = { m: ['Khang', 'Bình', 'Tâm', 'Nghĩa', 'Trung', 'Hiếu', 'Thuận', 'Đức', 'Toàn', 'Sang', 'Lợi', 'Tài', 'Khải', 'Thành', 'Hậu', 'Chiến', 'Hoà', 'Kiên', 'Mạnh', 'Nhân', 'Trọng', 'Vinh', 'Hải', 'Long', 'Sơn', 'Đông', 'Bắc', 'Tùng', 'Bách', 'Lâm'],
  f: ['Thoa', 'Dung', 'Hạnh', 'Hằng', 'Khánh', 'Ngân', 'Trâm', 'Yến', 'Oanh', 'Loan', 'Phượng', 'Thu', 'Xuân', 'Hạ', 'Đông', 'Hiền', 'Thảo', 'Nhung', 'Gương', 'Lược', 'Diệu', 'Tơ', 'Chè', 'Dâu', 'Đậu', 'Mơ Lớn', 'Ngọc', 'Châu', 'Bích', 'Ngà'] };
// the ties, how they read both ways, and their colour in the web
const C4_RELS = {
  vc: { name: 'vợ chồng', col: '#c0567a' }, cc: { name: 'cha mẹ – con', col: '#2f5f8f' }, ae: { name: 'anh chị em', col: '#2f5f8f' },
  dau: { name: 'mẹ chồng – nàng dâu', col: '#2f5f8f' }, ong: { name: 'ông bà – cháu', col: '#2f5f8f' },
  xom: { name: 'hàng xóm', col: '#2f6a4c' }, ban: { name: 'bạn bè', col: '#c98a1c' }, nhau: { name: 'bạn nhậu', col: '#7a4aa0' },
  ketnghia: { name: 'chị em kết nghĩa', col: '#c98a1c' }, thong: { name: 'thông gia', col: '#8a5a2a' }, ghet: { name: 'không ưa nhau', col: '#a3332a' },
};
const C4_GIVEN = {
  m: ['Mão', 'Thìn', 'Tèo', 'Bảy', 'Tám', 'Chín', 'Mười', 'Cả', 'Hai', 'Ba', 'Năm', 'Sáu', 'Khoai', 'Sắn', 'Ngô', 'Mít', 'Tý', 'Sửu', 'Dần', 'Hợi', 'Bính', 'Đinh', 'Canh', 'Lộc', 'Phúc', 'Thọ', 'Bờm', 'Cuội', 'Đực', 'Tràng', 'Quý', 'Hưng', 'Tiến', 'Đạt', 'Chắt', 'Cò', 'Nhỡ', 'Thóc', 'Sỏi', 'Gạo', 'Vượng', 'Lực'],
  f: ['Mận', 'Đào', 'Sen', 'Cúc', 'Lan', 'Huệ', 'Nụ', 'Thắm', 'Bưởi', 'Na', 'Hồng', 'Gấm', 'Lụa', 'Tấm', 'Cám', 'Thơm', 'Mơ', 'Mai', 'Nhài', 'Quế', 'Liễu', 'Gái', 'Nhị', 'Hến', 'Chanh', 'Duyên', 'Thị', 'Ngát', 'Tươi', 'Xoan', 'Vải', 'Mướp', 'Bầu', 'Bí', 'Lài', 'Gừng', 'Nghệ', 'Sim', 'Trinh'],
};
const C4_XOM = ['xóm Đình', 'xóm Chùa', 'xóm Bến', 'xóm Giếng', 'xóm Đồng'];
const C4_JOBS = {
  adult: ['thợ cấy', 'thợ mộc', 'lái đò', 'thợ rèn', 'kéo vó', 'đan rổ', 'dệt vải', 'bán chiếu', 'thợ nhuộm', 'phó cạo', 'mõ làng', 'chăn trâu', 'làm hương', 'bốc thuốc', 'xay lúa', 'đánh cá', 'nặn nồi', 'làm tranh'],
  old_m: ['thầy đồ', 'ông từ giữ đình', 'thầy lang', 'trông cháu', 'thầy địa lý', 'kể chuyện cổ tích'], old_f: ['bà mối', 'bà đỡ', 'trông cháu', 'bán nước chè', 'têm trầu thuê', 'kể chuyện cổ tích'],
  duck: ['mò ốc'], rooster: ['gáy sáng'], dog: ['canh cổng'], toad: ['gọi mưa'],
};
const C4_HOUSES = 20;                                                    // mouse households in the village
const C4_ADULT_SORTS = [0, 1, 2, 3, 4, 5, 6, 7], C4_OLD_SORTS = [8, 9, 10];
let C4P = null;
// build the village from the save's seed
function c4People() {
  if (C4P && C4P.seed === SAVE4.seed) return C4P;
  const rnd = mulberry(SAVE4.seed || 7), pick = a => a[(rnd() * a.length) | 0], used = new Set();
  const list = [], houses = [];
  const given = g => { for (let i = 0; i < 50; i++) { const n = pick(C4_GIVEN[g]); if (!used.has(n)) { used.add(n); return n; } } return pick(C4_GIVEN[g]) + ' ' + (list.length + 1); };
  const trait = () => pick(['xoi', 'ky', 'chuyen', 'chat', 'hien', 'sidien', 'itnoi', 'xoi', 'hien', 'ky']);
  const add = (h, g, role, as) => {
    const n = given(g), pre = role === 'old' ? (g === 'm' ? pick(['ông', 'cụ ông']) : pick(['bà', 'cụ bà'])) : g === 'm' ? pick(['anh', 'chú', 'bác']) : pick(['chị', 'cô', 'thím']);
    const p = { id: list.length, name: `${pre} ${n}`, g, role, kind: 'mouse', sort: pick(role === 'old' ? C4_OLD_SORTS : C4_ADULT_SORTS), trait: trait(), job: pick(C4_JOBS[role === 'old' ? 'old_' + g : role]), house: h.id, as, links: [] };
    list.push(p); h.members.push(p.id); return p;
  };
  const tie = (a, b, rel) => { if (a === b || a.links.some(l => l.to === b.id)) return; a.links.push({ to: b.id, rel }); b.links.push({ to: a.id, rel }); };
  for (let i = 0; i < C4_HOUSES; i++) {
    const h = { id: houses.length, xom: C4_XOM[i % C4_XOM.length], members: [] }; houses.push(h);
    const r = rnd();
    if (r < .3) {                                                           // three generations
      const o = add(h, 'm', 'old', 'chủ nhà'), b = add(h, 'f', 'old', 'vợ'), s = add(h, 'm', 'adult', 'con trai'), d = add(h, 'f', 'adult', 'con dâu');
      tie(o, b, 'vc'); tie(o, s, 'cc'); tie(b, s, 'cc'); tie(s, d, 'vc'); tie(b, d, 'dau');
      if (rnd() < .4) { const e = add(h, rnd() < .5 ? 'm' : 'f', 'adult', 'con út'); tie(o, e, 'cc'); tie(b, e, 'cc'); tie(s, e, 'ae'); }
    } else if (r < .7) {                                                    // a young couple, maybe a brother or sister with them
      const a = add(h, 'm', 'adult', 'chủ nhà'), b = add(h, 'f', 'adult', 'vợ'); tie(a, b, 'vc');
      if (rnd() < .35) { const e = add(h, rnd() < .5 ? 'm' : 'f', 'adult', 'em'); tie(a, e, 'ae'); }
    } else if (r < .85) {                                                   // a widow(er) and a grown child
      const o = add(h, rnd() < .6 ? 'f' : 'm', 'old', 'chủ nhà'), c = add(h, rnd() < .5 ? 'm' : 'f', 'adult', 'con'); tie(o, c, 'cc');
    } else add(h, rnd() < .5 ? 'm' : 'f', 'adult', 'chủ nhà');           // living alone
    const head = list[h.members[0]]; h.name = `nhà ${head.name}`;
  }
  // the animals' households
  for (const [kind, names] of [['duck', ['bác Vịt Bầu', 'cô Vịt Cỏ']], ['rooster', ['ông Gà Trống', 'bà Gà Mái']], ['dog', ['chú Mực', 'thím Vện']]]) {
    const h = { id: houses.length, xom: pick(C4_XOM), members: [] }; houses.push(h);
    const ps = names.map((name, i) => { const p = { id: list.length, name, g: i ? 'f' : 'm', role: 'adult', kind, sort: 0, trait: trait(), job: C4_JOBS[kind][0], house: h.id, as: i ? 'vợ' : 'chủ nhà', links: [] }; list.push(p); h.members.push(p.id); return p; });
    tie(ps[0], ps[1], 'vc');
    h.name = `nhà ${ps[0].name}`;
  }
  // ties across houses: some folk know half the village, some hardly anyone
  const want = list.map(p => C4_TRAITS[p.trait].links + ((rnd() * 2) | 0)), out = p => p.links.filter(l => list[l.to].house !== p.house).length;
  for (const p of list) {
    for (let k = 0; k < 40 && out(p) < want[p.id]; k++) {
      const q = pick(list); if (q.house === p.house || out(q) >= want[q.id] + 1) continue;
      const hp = houses[p.house], hq = houses[q.house];
      const rel = hp.xom === hq.xom && rnd() < .6 ? 'xom' : p.g === 'm' && q.g === 'm' && p.kind === 'mouse' && q.kind === 'mouse' && rnd() < .4 ? 'nhau' : p.g === 'f' && q.g === 'f' && rnd() < .3 ? 'ketnghia' : rnd() < .1 ? 'ghet' : 'ban';
      tie(p, q, rel);
    }
  }
  // how each one looks and what they carry to market (art.js c4Deco), from their trade, age and sex
  for (const p of list) {
    if (p.kind !== 'mouse') { p.look = {}; continue; }
    const non = C4_MOUSE_SORTS[p.sort].non, L = p.look = {};
    if (p.g === 'f') { L.skirt = pick(C4_SKIRTS); if (!non && rnd() < .3) L.hat = 'quai'; }
    const farm = ['thợ cấy', 'chăn trâu', 'xay lúa'].includes(p.job);
    L.tool = p.job === 'chăn trâu' || (farm && rnd() < .5) ? 'buf'
      : farm ? pick(['cay', 'cuoc'])
      : p.role === 'old' && p.g === 'm' && rnd() < .5 ? 'dieu'
      : ['đánh cá', 'bán chiếu', 'nặn nồi', 'đan rổ'].includes(p.job) ? pick(['ganh', 'thung'])
      : rnd() < .55 ? pick(p.g === 'm' ? ['thung', 'o', 'cuoc', 'ganh', 'buf', 'cay'] : ['thung', 'o', 'ganh', 'thung']) : null;
    if (L.tool === 'dieu' && p.g === 'f') L.tool = 'thung';
    L.umbCol = pick(['#a3332a', '#c98a1c', '#2f5f8f', '#2f6a4c']);
    L.drinker = p.g === 'm' && ((p.links.some(l => l.rel === 'nhau') && rnd() < .45) || rnd() < .06);
  }
  { let n = 0; for (const p of list) if (p.look && p.look.tool === 'dieu' && ++n > 2) p.look.tool = null;
    if (!n) { const o = list.find(p => p.role === 'old' && p.g === 'm' && p.kind === 'mouse'); if (o) o.look.tool = 'dieu'; } }
  for (let k = 0; k < 5; k++) { const a = list[houses[(rnd() * C4_HOUSES) | 0].members[0]], b = list[houses[(rnd() * C4_HOUSES) | 0].members[0]]; if (a.house !== b.house) tie(a, b, 'thong'); }
  {
    const used2 = new Set(list.map(p => p.name.split(' ').slice(1).join(' ')));
    const given2 = g => { for (let i = 0; i < 60; i++) { const n = pick(C4_GIVEN2[g]); if (!used2.has(n)) { used2.add(n); return n; } } return pick(C4_GIVEN2[g]); };
    const add2 = (h, g, role, as) => { const n = given2(g), pre = role === 'old' ? (g === 'm' ? pick(['ông', 'cụ ông']) : pick(['bà', 'cụ bà'])) : g === 'm' ? pick(['anh', 'chú', 'bác']) : pick(['chị', 'cô', 'thím']);
      const p = { id: list.length, name: `${pre} ${n}`, g, role, kind: 'mouse', sort: pick(role === 'old' ? C4_OLD_SORTS : C4_ADULT_SORTS), trait: trait(), job: pick(C4_JOBS[role === 'old' ? 'old_' + g : role]), house: h.id, as, links: [] };
      list.push(p); h.members.push(p.id); return p; };
    const first = list.length;
    for (let i = 0; i < 10; i++) {
      const h = { id: houses.length, xom: C4_XOM[(i + 2) % C4_XOM.length], members: [] }; houses.push(h);
      if (i < 4) {                                                       // a big family: grandparents, two sons and their wives, the youngest
        const o = add2(h, 'm', 'old', 'chủ nhà'), b = add2(h, 'f', 'old', 'vợ'); tie(o, b, 'vc');
        const s1 = add2(h, 'm', 'adult', 'con trai cả'), d1 = add2(h, 'f', 'adult', 'con dâu cả'), s2 = add2(h, 'm', 'adult', 'con trai thứ'), d2 = add2(h, 'f', 'adult', 'con dâu thứ'), u = add2(h, rnd() < .5 ? 'f' : 'm', 'adult', 'con út');
        for (const c of [s1, s2, u]) { tie(o, c, 'cc'); tie(b, c, 'cc'); }
        tie(s1, d1, 'vc'); tie(s2, d2, 'vc'); tie(s1, s2, 'ae'); tie(s1, u, 'ae'); tie(s2, u, 'ae'); tie(b, d1, 'dau'); tie(b, d2, 'dau'); tie(d1, d2, rnd() < .5 ? 'ghet' : 'ketnghia');
      } else if (i < 7) {                                                 // a house full of grown children
        const a = add2(h, 'm', 'adult', 'chủ nhà'), b = add2(h, 'f', 'adult', 'vợ'); tie(a, b, 'vc');
        const kids = [add2(h, 'm', 'adult', 'con cả'), add2(h, 'f', 'adult', 'con thứ'), add2(h, rnd() < .5 ? 'm' : 'f', 'adult', 'con út')];
        for (const c of kids) { tie(a, c, 'cc'); tie(b, c, 'cc'); } tie(kids[0], kids[1], 'ae'); tie(kids[1], kids[2], 'ae'); tie(kids[0], kids[2], 'ae');
      } else { const a = add2(h, 'm', 'adult', 'chủ nhà'), b = add2(h, 'f', 'adult', 'vợ'); tie(a, b, 'vc'); if (rnd() < .5) { const o = add2(h, rnd() < .5 ? 'f' : 'm', 'old', 'mẹ già'); tie(o, a, 'cc'); } }
      h.name = `nhà ${list[h.members[0]].name}`;
    }
    const fresh = list.slice(first), out2 = p => p.links.filter(l => list[l.to].house !== p.house).length;
    for (const p of fresh) {                                            // they know people across the village too
      const want = C4_TRAITS[p.trait].links + ((rnd() * 2) | 0);
      for (let k = 0; k < 40 && out2(p) < want; k++) { const q = pick(list); if (q.house === p.house) continue; const hp = houses[p.house], hq = houses[q.house];
        tie(p, q, hp.xom === hq.xom && rnd() < .6 ? 'xom' : p.g === 'm' && q.g === 'm' && q.kind === 'mouse' && rnd() < .4 ? 'nhau' : p.g === 'f' && q.g === 'f' && rnd() < .3 ? 'ketnghia' : rnd() < .12 ? 'ghet' : 'ban'); }
      const non = C4_MOUSE_SORTS[p.sort].non, L = p.look = {};
      if (p.g === 'f') { L.skirt = pick(C4_SKIRTS); if (!non && rnd() < .3) L.hat = 'quai'; }
      L.tool = rnd() < .5 ? pick(p.g === 'm' ? ['thung', 'o', 'cuoc', 'ganh', 'cay'] : ['thung', 'o', 'ganh']) : null;
      L.umbCol = pick(['#a3332a', '#c98a1c', '#2f5f8f', '#2f6a4c']); L.drinker = p.g === 'm' && p.links.some(l => l.rel === 'nhau') && rnd() < .4;
    }
  }
  // habits (owner: the book should help): the double-hour each one comes to market, the ware they like, how they spend.
  // Both are real: c4PickResident brings people at their hour, c4Spawn sends them to their ware first.
  const r2 = mulberry((SAVE4.seed || 7) + 101), p2 = a => a[(r2() * a.length) | 0];
  for (const p of list) {
    const field = ['thợ cấy', 'chăn trâu', 'xay lúa', 'kéo vó', 'đánh cá'].includes(p.job);
    p.hour = p.role === 'old' ? p2(['Mão', 'Thìn', 'Thìn', 'Tỵ']) : field ? p2(['Mão', 'Dậu', 'Thân']) : p2(['Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân']);
    p.fav = p.role === 'old' ? p2(['trau', 'trau', 'che', 'xoi']) : p.look && p.look.drinker ? p2(['bun', 'bun', 'trau']) : p.g === 'f' ? p2(['xen', 'xoi', 'trau', 'che', 'bun']) : p2(['trau', 'che', 'bun', 'xoi', 'xen']);
    if (p.kind === 'mouse') { const non = C4_MOUSE_SORTS[p.sort].non; p.sort = p2(p.role === 'old' ? C4_OLD_SORTS2 : C4_ADULT_SORTS2); if (non) p.sort = p2(p.role === 'old' ? C4_OLD_SORTS2 : [2, 4, 7, 23, 25]); }
    if (p.kind === 'mouse' && p.g === 'f' && p.look && r2() < .3) p.look.hat = 'quai';   // owner: now and then the quai thao hat
    if (p.kind === 'mouse' && r2() < .14) p.trait = 'khogan';
    p.purse = p.trait === 'chat' ? 'chặt chẽ, tiếc từng đồng' : p.trait === 'sidien' || p.trait === 'xoi' ? 'hào phóng' : p.trait === 'khogan' ? 'kín tiếng, nhưng đã tin thì chi mạnh' : 'vừa phải';
  }
  const heads = list.filter(p => p.kind === 'mouse' && (p.role === 'old' || p.as === 'chủ nhà')), landlord = {};
  for (const g of ['trau', 'che', 'xoi', 'xen', 'bun']) landlord[g] = heads[(r2() * heads.length) | 0].id;
  return (C4P = { seed: SAVE4.seed, list, houses, landlord });
}
const c4F = id => SAVE4.folk[id] || (SAVE4.folk[id] = { a: 0, v: 0 });
const c4Known = id => !!(SAVE4.folk[id] && SAVE4.folk[id].k);
const c4Like = id => c4Known(id) ? SAVE4.folk[id].a : 0;
const c4LikeWord = a => a >= 80 ? 'Thân thiết' : a >= 60 ? 'Mến' : a >= 35 ? 'Bình thường' : a >= 15 ? 'Lạnh nhạt' : 'Ghét';
const c4Bump = (id, d) => { const f = c4F(id); f.a = Math.max(0, Math.min(100, f.a + d)); };
// how ready strangers are to try a new stall: nobody knows it the first days
const c4Rep = () => [.35, .5, .62][SAVE4.day - 1] || .85;

// who comes along the lane next: anyone not already there, regulars who like the stall far more often
function c4PickResident() {
  const P = c4People(), here = new Set(C4.walkers.map(w => w.pid)), day = SAVE4.day;
  if (C4.expect && C4.expect.length && R() < .5) { const id = C4.expect.shift(); if (!here.has(id)) return P.list[id]; }
  let sum = 0; const ws = [];
  for (const p of P.list) {
    if (here.has(p.id)) continue;
    const f = SAVE4.folk[p.id], kw = p.kind === 'mouse' ? 1 : .55;
    const hr = C4_HOURS.indexOf(c4Hour(C4.mins)) - C4_HOURS.indexOf(p.hour), at = !hr ? 2.2 : Math.abs(hr) === 1 ? 1 : .55;   // their usual hour
    if (f && f.away >= day) continue;                                     // ill at home, or sulking (events)
    const w = at * kw * (f && f.k ? .4 + f.a / 50 + (f.a >= C4_RUOT ? .8 : 0) : 1) * (f && f.inv === day ? 4 : 1) * (f && f.ref && !f.k ? 2 : 1) * (f && f.seen && !f.k ? 1.3 : 1);
    ws.push([p, w]); sum += w;
  }
  let k = R() * sum; for (const [p, w] of ws) if ((k -= w) <= 0) return p;
  return null;
}
// how keen this person is to buy, on top of how much they want the wares
function c4Keen(p) {
  const f = SAVE4.folk[p.id];
  if (f && f.k) return (.4 + f.a / 60) * (f.deal ? 1.5 : 1) * (f.inv === SAVE4.day ? 1.8 : 1);
  return c4Rep() * (C4_TRAITS[p.trait].meet ? .8 : 1) * (f && f.seen ? 1.15 : 1) * (f && f.ref ? 1.6 : 1) * (f && f.bad ? .5 : 1);
}
// what a served buyer pays (a promised discount or a free treat is used up)
function c4Pay(w, full) {
  if (w.pid === undefined) return full;
  const f = SAVE4.folk[w.pid]; if (!f || !f.deal) return full;
  return f.deal === 'free' ? 0 : Math.round(full / 2);
}
// served: met (from the book's day on), liked a little more, maybe tells kin and friends
function c4Served(w) {
  if (w.pid === undefined || SAVE4.day < C4_BOOK_DAY) return;
  const P = c4People(), p = P.list[w.pid], T = C4_TRAITS[p.trait], f = c4F(p.id), day = SAVE4.day;
  // the first purchase: she knows the face; the second: they get talking, and the buyer goes into the book
  if (!f.k && !f.seen) { f.seen = day; f.v = 1; C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s: p.name }); return; }
  if (!f.k && f.v + 1 < (T.meet || 2)) { f.v++; C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s: `${p.name} · ${f.v}/${T.meet}` }); if (R() < .5) c4Say(w, c4Pick(['…', 'Ừ.', 'Gói lại đi.', 'Nhanh lên cô.'])); return; }
  if (!f.k) {
    f.k = day; f.a = 40 + (f.ref ? 15 : 0) - (f.bad ? 15 : 0); f.v++; C4.today.met = (C4.today.met || 0) + 1; C4.noteNew = true;
    C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s: '★ ' + p.name });
  } else { f.v++; c4Bump(p.id, 4 * T.gain); }
  if (f.a >= C4_RUOT && !f.ruot) { f.ruot = day; (f.facts = f.facts || []).push(`Ngày ${day}: thành mối ruột của quán.`); C4.fx.push({ x: w.x, y: c4Y(w.z) - 230, t: 0, s: '♥ Mối ruột!' }); toast(`${c4Cap1(p.name)} đã thành mối ruột: từ nay mua nhiều, hay ghé, rủ cả người quen.`, 3.6); AU.pluck(91); }
  if (f.inv === day) c4Bump(p.id, 3);
  if (f.deal === 'half') { c4Bump(p.id, 8 * (T.half || 1)); c4Say(w, T.half < 1 ? 'Giảm giá à? Tôi có thiếu tiền đâu!' : 'Ôi, giảm giá thật à? Quý hoá quá!'); }
  if (f.deal === 'free') { c4Bump(p.id, 15 * (T.free || 1)); c4Say(w, 'Cô biếu thật à? Ngại quá, cảm ơn cô nhé!'); }
  f.deal = null;
  c4StoryCheck(); c4AchCheck();
  // someone who likes the stall sends somebody they know
  if (f.a >= 60 && R() < .22 * T.refer * (f.a >= C4_RUOT ? 2 : 1)) {
    const cand = p.links.map(l => P.list[l.to]).filter(q => !c4Known(q.id) && !(SAVE4.folk[q.id] && SAVE4.folk[q.id].ref) && p.links.find(l => l.to === q.id).rel !== 'ghet');
    if (cand.length) {
      const q = c4Pick(cand); c4F(q.id).ref = true; SAVE4.refs = (SAVE4.refs || 0) + 1; (C4.expect = C4.expect || []).push(q.id);
      setTimeout(() => { if (S.mode === 'c4play' && !w.say) c4Say(w, `Để tôi bảo ${q.name} ra đây mua!`); }, 1400);
    }
  }
}
// left without being served: a known buyer likes the stall less (a lot less when it had run out)
function c4Snubbed(w, empty) {
  if (w.pid === undefined || SAVE4.day < C4_BOOK_DAY) return;
  const p = c4People().list[w.pid], T = C4_TRAITS[p.trait], f = c4F(p.id);
  if (f.k) {
    const d = Math.round((empty ? 12 : 4) * T.loss); c4Bump(p.id, -d);
    C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s: `${p.name} −${d}` });
    // liked us too little: back to a stranger (owner) — met again later they start cooler
    if (f.a <= C4_DROP) {
      f.k = 0; f.v = 1; f.bad = true; f.ruot = 0; f.lost = (f.lost || 0) + 1; C4.noteNew = true;
      (f.facts = f.facts || []).push(`Ngày ${SAVE4.day}: giận bỏ đi, không còn là khách quen.`);
      toast(`${c4Cap1(p.name)} bực mình bỏ đi: "Từ giờ tôi mua chỗ khác!" Không còn là khách quen nữa.`, 3.6);
    }
  } else if (empty) f.bad = true;
}
const C4_DROP = 10;   // known buyers whose liking falls this low walk out of the book
// in the evening: people who dislike the stall and love to talk spread it to those they know
// gossips who dislike the stall talk at night: their known ties like us 5 less, the unmet ones will be half as keen and start cooler.
// Returns who talked and who was hurt, so the tally can say it plainly (a player: the bare line seemed to change nothing)
function c4Gossip() {
  const P = c4People(), R0 = { n: 0, who: [], hurt: [], cold: 0 };
  for (const p of P.list) {
    const f = SAVE4.folk[p.id]; if (!f || !f.k || f.a >= 25 || !C4_TRAITS[p.trait].gossip) continue;
    let any = false;
    for (const l of p.links) { const g = c4F(l.to); if (g.k) { c4Bump(l.to, -5); R0.hurt.push(P.list[l.to].name); } else if (!g.bad) { g.bad = true; R0.cold++; } else continue; R0.n++; any = true; }
    if (any) R0.who.push(p.name);
  }
  return R0.n ? R0 : 0;
}

/* ---------- portraits: the woodblock mouse (or critter) in a round frame, drawn once per look ---------- */
const C4_FACE = new Map();
function c4Face(p) {
  const key = (SAVE4.seed || 0) + ':' + p.id; if (C4_FACE.has(key)) return C4_FACE.get(key);   // one portrait per person (a player: many looked the same)
  const c = mk(96, 96), g = c.getContext('2d');
  const X = c4FaceLook(p);
  g.fillStyle = X.bg; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.clip();
  const w = { kind: p.kind, sort: p.sort, M: p.kind === 'mouse' ? c4MouseRig(p.sort) : null, seed: 0, ph: 0, st: 'idle', face: 1 }, t = C4.t; C4.t = 0;
  if (p.kind === 'mouse') c4Critter(g, w, 44, 150, 1.05);                  // head and shoulders
  else { const s = { duck: 1.2, rooster: .55, dog: .62 }[p.kind]; c4Critter(g, w, 48, 82, s); }
  if (p.kind === 'mouse') c4FaceExtras(g, X);
  C4.t = t; g.restore();
  g.strokeStyle = '#b39a6a'; g.lineWidth = 5; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.stroke();
  const url = c.toDataURL(); C4_FACE.set(key, url); return url;
}

/* ---------- the book: rumours, the folk you know, the web of ties, households ---------- */
let C4_TAB = 'tin', C4_WHO = null;
let C4_PICK = null;                                                         // { deal, sel }: choosing whom to invite to take the leftovers
function c4OpenNotes(tab) {
  C4.noteNew = false; c4Hud();
  if (tab) C4_TAB = tab; if (SAVE4.day < C4_BOOK_DAY) C4_TAB = 'tin';
  const P = c4People(), known = P.list.filter(p => c4Known(p.id)), open = SAVE4.day >= C4_BOOK_DAY;
  const tabs = [['tin', 'Tin đồn'], ...(open ? [['quen', 'Khách quen'], ['web', 'Quan hệ'], ['nha', 'Gia phả'], ['chuyen', 'Chuyện'], ['thanh', 'Thành tựu'], ['hao', 'Hảo cảm']] : [])];
  let h = `<div class="c4tabs">${tabs.map(([k, n]) => `<button class="${k === C4_TAB ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>`;
  const seen = P.list.filter(p => !c4Known(p.id) && SAVE4.folk[p.id] && SAVE4.folk[p.id].seen);
  if (open) h += `<p class="cnt">${known.length} người quen · ${seen.length} người biết mặt</p>`;
  if (C4_TAB === 'tin') {
    const days = [SAVE4.day, SAVE4.day + 1].filter(d => SAVE4.notes.some(n => n.day === d));   // owner: only today and tomorrow, past days only confuse
    const now = (t, d) => d !== SAVE4.day ? t : t.replace(/^Mai /, 'Hôm nay ').replace(/ mai /, ' hôm nay ');   // news heard yesterday about "tomorrow" is about today now
    h += (SAVE4.goal ? '' : `<p class="goal">Mục tiêu: để dành <b>${c4Money(C4_GOAL)}</b> thì vợ chồng mới tính chuyện con cái.</p>`)
      + (days.length ? days.map(d => `<h4>${d === SAVE4.day ? 'Hôm nay' : d === SAVE4.day + 1 ? 'Ngày mai' : ''}</h4>` + SAVE4.notes.filter(n => n.day === d).map(n => `<p>• ${now(n.text, d)}</p>`).join('')).join('') : '<p>Chưa nghe được chuyện gì. Ai thì thầm thì lại gần nghe lỏm xem!</p>')
      + (open ? '' : `<p class="hint">Từ ngày ${C4_BOOK_DAY}, vợ ghi sổ những khách đã quen.</p>`);
  } else if (C4_TAB === 'quen' && C4_PICK) {
    const free = new Set(c4Guests().map(p => p.id)), left = c4Owned().filter(g => C4_GOODS[g].keep !== 'ever' && c4Stock(g) > 0).map(g => `${c4Stock(g)} ${C4_GOODS[g].unit} ${C4_GOODS[g].name.toLowerCase()}`).join(', ');
    h += `<div class="pick"><p>Sắp tan chợ còn ${left || 'ít hàng'}. Chọn khách quen để mời ghé lấy:</p>
      <div class="row"><button class="btn ${C4_PICK.deal === 'half' ? '' : 'alt'}" data-deal="half">Bán nửa giá</button><button class="btn ${C4_PICK.deal === 'free' ? '' : 'alt'}" data-deal="free">Biếu không</button></div></div>`;
    h += `<div class="folk">${known.sort((a, b) => (free.has(b.id) - free.has(a.id)) || SAVE4.folk[b.id].a - SAVE4.folk[a.id].a).map(p => { const f = SAVE4.folk[p.id], ok = free.has(p.id), on = C4_PICK.sel.has(p.id);
      return `<button class="fk ${on ? 'sel' : ''}" data-pick="${p.id}" ${ok ? '' : 'disabled'}><img src="${c4Face(p)}" alt=""><b>${p.name}</b>${c4Bar(f.a)}<span>${ok ? (on ? '✓ mời' : 'ghé ' + f.v + ' lần') : f.called === SAVE4.day ? 'đã mời' : 'đang ở chợ'}</span></button>`; }).join('')}</div>`;
    h += `<div class="row col"><button class="btn go" data-invite ${C4_PICK.sel.size ? '' : 'disabled'}>Mời ${C4_PICK.sel.size} người · ${C4_PICK.deal === 'free' ? 'biếu không' : 'bán nửa giá'}</button><button class="btn alt" data-pickx>Thôi</button></div>`;
  }
  else if (C4_TAB === 'quen') {
    h += known.length ? `<div class="folk">${known.sort((a, b) => SAVE4.folk[b.id].a - SAVE4.folk[a.id].a).map(p => { const f = SAVE4.folk[p.id];
      return `<button class="fk" data-who="${p.id}"><img src="${c4Face(p)}" alt=""><b>${p.name}</b>${c4Bar(f.a)}<span>ghé ${f.v} lần${f.deal ? ' · đã hẹn' : ''}</span></button>`; }).join('')}</div>`
      : '<p>Chưa quen ai. Khách ghé mua lần thứ hai mới thành quen.</p>';
    if (seen.length) h += `<h4>Biết mặt</h4><div class="folk">${seen.map(p => `<div class="fk unk2"><img src="${c4Face(p)}" alt=""><b>${p.name}</b><span>mới ghé 1 lần</span></div>`).join('')}</div>`;
  } else if (C4_TAB === 'web') h += c4WebTab();
  else if (C4_TAB === 'chuyen') h += c4StoriesHtml();
  else if (C4_TAB === 'thanh') h += c4AchHtml();
  else if (C4_TAB === 'hao') h += c4HaoHtml();
  else if (C4_TAB === 'nha') h += c4HousesTab();
  const wasWeb = !!$('#qhCv');
  $('#c4noteB').innerHTML = h;
  $('#c4note .card4').classList.toggle('wide', C4_TAB === 'web' || C4_TAB === 'nha');
  $('#c4noteB').querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_WHO = null; C4_PICK = null; c4OpenNotes(b.dataset.tab); }));
  $('#c4noteB').querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { const id = +b.dataset.pick; AU.tap(); C4_PICK.sel.has(id) ? C4_PICK.sel.delete(id) : C4_PICK.sel.add(id); const y = $('#c4note').scrollTop; c4OpenNotes('quen'); $('#c4note').scrollTop = y; }));
  $('#c4noteB').querySelectorAll('[data-deal]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_PICK.deal = b.dataset.deal; const y = $('#c4note').scrollTop; c4OpenNotes('quen'); $('#c4note').scrollTop = y; }));
  { const b = $('#c4noteB [data-invite]'); if (b) b.addEventListener('click', () => { const P = c4People(), ps = [...C4_PICK.sel].map(id => P.list[id]), deal = C4_PICK.deal; C4_PICK = null; c4Sheets(null); c4Invite(ps, deal); }); }
  { const b = $('#c4noteB [data-pickx]'); if (b) b.addEventListener('click', () => { C4_PICK = null; c4Sheets(null); }); }
  $('#c4noteB').querySelectorAll('[data-who]').forEach(b => b.addEventListener('click', () => { AU.tap(); c4OpenWho(+b.dataset.who); }));
  c4Sheets('c4note');
  if (C4_TAB === 'web') c4WebOpened(!wasWeb && QH.focus === null);
  if (C4_TAB === 'nha') c4HousesWire();
}
const c4Bar = a => `<i class="bar"><i style="width:${a}%;background:${a >= 60 ? '#2f6a4c' : a >= 35 ? '#c98a1c' : '#a3332a'}"></i></i>`;
const C4_INVITES = 3, c4Invited = () => Object.values(SAVE4.folk).filter(f => f.inv === SAVE4.day).length;   // invitations a day
function c4Act(id, act) {
  const p = c4People().list[id], f = c4F(id);
  if (act === 'moi') { if (c4Ruot(id)) C4.today.invRuot = (C4.today.invRuot || 0) + 1; f.inv = SAVE4.day; (C4.expect = C4.expect || []).push(id); toast(`Đã nhắn ${p.name} ghé quán.`); }
  else if (C4_ACT_DONE[act]) { C4_ACT_DONE[act](p, f); c4Hud(); }
  else { f.deal = act; toast(act === 'free' ? `Lần tới ${p.name} ghé sẽ được mời miễn phí.` : `Lần tới ${p.name} ghé sẽ được giảm nửa giá.`, 2.6); }
  AU.tap(); persist4(); if ($('#qhCv')) qhFocus(id); else c4OpenNotes('quen');
}

// what makes each portrait its own (a player: many people looked alike): a pale backdrop, and one or two things on the
// head — a woman's turban or a man's khăn xếp, a flower at the ear, the quai thao hat, glasses or a white beard for the old
const C4_FACE_BG = ['#f6f0e2', '#f0e0d0', '#e3ecd8', '#dfe6ee', '#efe2ec', '#f3ead0', '#e6e0f0', '#e8efe9'];
function c4FaceLook(p) {
  let h = (SAVE4.seed || 1) ^ (p.id * 2654435761); const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
  const S = p.kind === 'mouse' ? C4_MOUSE_SORTS[p.sort] : null, capped = !!(S && (S.non || S.o.hat)), old = p.role === 'old', f = p.g === 'f';
  const X = { bg: C4_FACE_BG[(r() * C4_FACE_BG.length) | 0] };
  if (p.look && p.look.hat === 'quai') X.quai = true;
  else if (!capped) { const k = r(); if (f ? k < .55 : k < .45) X.wrap = f ? 'van' : 'xep'; X.wrapCol = ['#2a2320', '#3a2a5a', '#5b2f1f', '#2f4f3c'][(r() * 4) | 0]; }
  if (f && r() < .45) X.flower = ['#c0567a', '#a3332a', '#f2c640', '#f2ecde'][(r() * 4) | 0];
  if (old && r() < .5) X.glasses = true;
  if (old && !f && r() < .6) X.beard = true;
  return X;
}
function c4FaceExtras(g, X) {
  g.save(); g.strokeStyle = INK; g.lineWidth = 2;
  if (X.wrap === 'van') { g.fillStyle = X.wrapCol; g.beginPath(); g.ellipse(46, 19, 21, 8, -.18, 0, 6.283); g.fill(); g.stroke();   // khăn vấn: a rolled band round the head
    g.strokeStyle = 'rgba(242,236,222,.5)'; g.lineWidth = 1.2; for (const x of [36, 46, 56]) { g.beginPath(); g.moveTo(x - 3, 13); g.lineTo(x + 3, 25); g.stroke(); } }
  if (X.wrap === 'xep') { g.fillStyle = X.wrapCol; g.beginPath(); g.moveTo(28, 26); g.quadraticCurveTo(30, 6, 50, 6); g.quadraticCurveTo(68, 8, 66, 22); g.lineTo(60, 24); g.quadraticCurveTo(46, 18, 30, 30); g.closePath(); g.fill(); g.stroke();   // khăn xếp
    g.strokeStyle = 'rgba(242,236,222,.45)'; g.lineWidth = 1.2; for (const y of [12, 17]) { g.beginPath(); g.moveTo(34, y + 6); g.quadraticCurveTo(48, y - 2, 62, y + 3); g.stroke(); } }
  if (X.quai) { g.fillStyle = '#c99a3c'; g.beginPath(); g.ellipse(48, 13, 42, 10, -.08, 0, 6.283); g.fill(); g.stroke();   // nón quai thao: a wide flat hat with a fringe
    g.fillStyle = '#2a2320'; g.beginPath(); g.ellipse(48, 11, 14, 4, -.08, 0, 6.283); g.fill();
    g.strokeStyle = '#2a2320'; g.lineWidth = 1; for (let x = 12; x <= 84; x += 6) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 26); g.stroke(); } }
  if (X.flower) { g.fillStyle = X.flower; g.strokeStyle = INK; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { const a = i * 1.2566; g.beginPath(); g.arc(26 + Math.cos(a) * 4.5, 30 + Math.sin(a) * 4.5, 3.6, 0, 6.283); g.fill(); g.stroke(); } g.fillStyle = '#f2c640'; g.beginPath(); g.arc(26, 30, 2.4, 0, 6.283); g.fill(); }
  if (X.glasses) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(62, 31, 7.5, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(55, 30); g.lineTo(44, 27); g.stroke(); }
  if (X.beard) { g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(64, 50); g.quadraticCurveTo(70, 70, 62, 78); g.quadraticCurveTo(58, 66, 56, 52); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}
