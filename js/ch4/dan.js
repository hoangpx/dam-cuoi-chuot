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
};
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
  for (const [kind, names] of [['duck', ['bác Vịt Bầu', 'cô Vịt Cỏ']], ['rooster', ['ông Gà Trống', 'bà Gà Mái']], ['dog', ['chú Mực', 'thím Vện']], ['toad', ['cụ Cóc', 'chú Ếch']]]) {
    const h = { id: houses.length, xom: pick(C4_XOM), members: [] }; houses.push(h);
    const ps = names.map((name, i) => { const p = { id: list.length, name, g: i ? 'f' : 'm', role: 'adult', kind, sort: 0, trait: trait(), job: C4_JOBS[kind][0], house: h.id, as: i ? 'vợ' : 'chủ nhà', links: [] }; list.push(p); h.members.push(p.id); return p; });
    if (kind === 'toad') ps[1].as = 'cháu', tie(ps[0], ps[1], 'ong'); else tie(ps[0], ps[1], 'vc');
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
  for (let k = 0; k < 5; k++) { const a = list[houses[(rnd() * C4_HOUSES) | 0].members[0]], b = list[houses[(rnd() * C4_HOUSES) | 0].members[0]]; if (a.house !== b.house) tie(a, b, 'thong'); }
  return (C4P = { seed: SAVE4.seed, list, houses });
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
    const w = kw * (f && f.k ? .4 + f.a / 50 : 1) * (f && f.inv === day ? 4 : 1) * (f && f.ref && !f.k ? 2 : 1);
    ws.push([p, w]); sum += w;
  }
  let k = R() * sum; for (const [p, w] of ws) if ((k -= w) <= 0) return p;
  return null;
}
// how keen this person is to buy, on top of how much they want the wares
function c4Keen(p) {
  const f = SAVE4.folk[p.id];
  if (f && f.k) return (.4 + f.a / 60) * (f.deal ? 1.5 : 1) * (f.inv === SAVE4.day ? 1.8 : 1);
  return c4Rep() * (f && f.ref ? 1.6 : 1) * (f && f.bad ? .5 : 1);
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
  if (!f.k) {
    f.k = day; f.a = 40 + (f.ref ? 15 : 0) - (f.bad ? 15 : 0); f.v = 1; C4.today.met = (C4.today.met || 0) + 1; C4.noteNew = true;
    C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s: '★ ' + p.name });
  } else { f.v++; c4Bump(p.id, 4 * T.gain); }
  if (f.inv === day) c4Bump(p.id, 3);
  if (f.deal === 'half') { c4Bump(p.id, 8 * (T.half || 1)); c4Say(w, T.half < 1 ? 'Giảm giá à? Tôi có thiếu tiền đâu!' : 'Ôi, giảm giá thật à? Quý hoá quá!'); }
  if (f.deal === 'free') { c4Bump(p.id, 15 * (T.free || 1)); c4Say(w, 'Cô biếu thật à? Ngại quá, cảm ơn cô nhé!'); }
  f.deal = null;
  // someone who likes the stall sends somebody they know
  if (f.a >= 60 && R() < .22 * T.refer) {
    const cand = p.links.map(l => P.list[l.to]).filter(q => !c4Known(q.id) && !(SAVE4.folk[q.id] && SAVE4.folk[q.id].ref) && p.links.find(l => l.to === q.id).rel !== 'ghet');
    if (cand.length) {
      const q = c4Pick(cand); c4F(q.id).ref = true; (C4.expect = C4.expect || []).push(q.id);
      setTimeout(() => { if (S.mode === 'c4play' && !w.say) c4Say(w, `Để tôi bảo ${q.name} ra đây mua!`); }, 1400);
    }
  }
}
// left without being served: a known buyer likes the stall less (a lot less when it had run out)
function c4Snubbed(w, empty) {
  if (w.pid === undefined || SAVE4.day < C4_BOOK_DAY) return;
  const p = c4People().list[w.pid], T = C4_TRAITS[p.trait], f = c4F(p.id);
  if (f.k) c4Bump(p.id, -(empty ? 12 : 4) * T.loss);
  else if (empty) f.bad = true;
}
// in the evening: people who dislike the stall and love to talk spread it to those they know
function c4Gossip() {
  const P = c4People(); let n = 0;
  for (const p of P.list) {
    const f = SAVE4.folk[p.id]; if (!f || !f.k || f.a >= 25 || !C4_TRAITS[p.trait].gossip) continue;
    for (const l of p.links) { const g = c4F(l.to); if (g.k) c4Bump(l.to, -5); else g.bad = true; n++; }
  }
  return n;
}

/* ---------- portraits: the woodblock mouse (or critter) in a round frame, drawn once per look ---------- */
const C4_FACE = new Map();
function c4Face(p) {
  const key = p.kind + p.sort; if (C4_FACE.has(key)) return C4_FACE.get(key);
  const c = mk(96, 96), g = c.getContext('2d');
  g.fillStyle = '#f6f0e2'; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.clip();
  const w = { kind: p.kind, sort: p.sort, M: p.kind === 'mouse' ? c4MouseRig(p.sort) : null, seed: 0, ph: 0, st: 'idle', face: 1 }, t = C4.t; C4.t = 0;
  if (p.kind === 'mouse') c4Critter(g, w, 44, 150, 1.05);                  // head and shoulders
  else { const s = { duck: 1.2, rooster: .55, dog: .62, toad: .7 }[p.kind]; c4Critter(g, w, 48, 82, s); }
  C4.t = t; g.restore();
  g.strokeStyle = '#b39a6a'; g.lineWidth = 5; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.stroke();
  const url = c.toDataURL(); C4_FACE.set(key, url); return url;
}

/* ---------- the book: rumours, the folk you know, the web of ties, households ---------- */
let C4_TAB = 'tin', C4_WHO = null;
function c4OpenNotes(tab) {
  C4.noteNew = false; c4Hud();
  if (tab) C4_TAB = tab; if (SAVE4.day < C4_BOOK_DAY) C4_TAB = 'tin';
  const P = c4People(), known = P.list.filter(p => c4Known(p.id)), open = SAVE4.day >= C4_BOOK_DAY;
  const tabs = [['tin', 'Tin đồn'], ...(open ? [['quen', 'Khách quen'], ['web', 'Quan hệ'], ['nha', 'Gia phả']] : [])];
  let h = `<div class="c4tabs">${tabs.map(([k, n]) => `<button class="${k === C4_TAB ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>`;
  if (open) h += `<p class="cnt">${known.length} người quen</p>`;
  if (C4_TAB === 'tin') {
    const days = [...new Set(SAVE4.notes.map(n => n.day))].sort();
    h += (SAVE4.goal ? '' : `<p class="goal">Mục tiêu: để dành <b>${c4Money(C4_GOAL)}</b> thì vợ chồng mới tính chuyện con cái.</p>`)
      + (days.length ? days.map(d => `<h4>${d === SAVE4.day ? 'Hôm nay' : d === SAVE4.day + 1 ? 'Ngày mai' : 'Ngày ' + d}</h4>` + SAVE4.notes.filter(n => n.day === d).map(n => `<p>• ${n.text}</p>`).join('')).join('') : '<p>Chưa nghe được chuyện gì. Ai thì thầm thì lại gần nghe lỏm xem!</p>')
      + (open ? '' : `<p class="hint">Từ ngày ${C4_BOOK_DAY}, vợ ghi sổ những khách đã quen.</p>`);
  } else if (C4_TAB === 'quen' && C4_WHO !== null) h += c4WhoHtml(P.list[C4_WHO]);
  else if (C4_TAB === 'quen') {
    h += known.length ? `<div class="folk">${known.sort((a, b) => SAVE4.folk[b.id].a - SAVE4.folk[a.id].a).map(p => { const f = SAVE4.folk[p.id];
      return `<button class="fk" data-who="${p.id}"><img src="${c4Face(p)}" alt=""><b>${p.name}</b>${c4Bar(f.a)}<span>ghé ${f.v} lần${f.deal ? ' · đã hẹn' : ''}</span></button>`; }).join('')}</div>`
      : '<p>Chưa quen ai. Ai mua hàng sẽ được ghi vào đây.</p>';
  } else if (C4_TAB === 'web') h += c4WebHtml(P, known);
  else if (C4_TAB === 'nha') {
    h += P.houses.filter(hs => hs.members.some(c4Known)).map(hs => { const n = hs.members.filter(c4Known).length;
      return `<div class="house"><h5>${hs.xom} · ${hs.name} <span>${n}/${hs.members.length} đã quen</span></h5><div class="mem">${hs.members.map(id => { const p = P.list[id];
        return c4Known(id) ? `<button class="fk sm" data-who="${id}"><img src="${c4Face(p)}" alt=""><b>${p.name}</b><span>${p.as}</span></button>` : `<div class="fk sm unk"><i>?</i><span>${p.as}</span></div>`; }).join('')}</div></div>`; }).join('')
      || '<p>Chưa quen ai.</p>';
  }
  $('#c4noteB').innerHTML = h;
  $('#c4noteB').querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_WHO = null; c4OpenNotes(b.dataset.tab); }));
  $('#c4noteB').querySelectorAll('[data-who]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_WHO = +b.dataset.who; c4OpenNotes('quen'); }));
  $('#c4noteB').querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => c4Act(C4_WHO, b.dataset.act)));
  const bk = $('#c4noteB .bk'); if (bk) bk.addEventListener('click', () => { AU.tap(); C4_WHO = null; c4OpenNotes('quen'); });
  c4Sheets('c4note');
}
const c4Bar = a => `<i class="bar"><i style="width:${a}%;background:${a >= 60 ? '#2f6a4c' : a >= 35 ? '#c98a1c' : '#a3332a'}"></i></i>`;
function c4WhoHtml(p) {
  const P = c4People(), f = SAVE4.folk[p.id], T = C4_TRAITS[p.trait], hs = P.houses[p.house], day = SAVE4.day;
  const links = p.links.map(l => { const q = P.list[l.to], k = c4Known(q.id);
    return `<li><i style="background:${C4_RELS[l.rel].col}"></i>${C4_RELS[l.rel].name} với ${k ? `<b>${q.name}</b>` : '<span class="unk">??? (chưa quen)</span>'}</li>`; }).join('');
  const kn = p.links.filter(l => c4Known(l.to)).length;
  const buy = SAVE4.day >= C4_BOOK_DAY && C4.phase === 'open';
  return `<button class="btn alt bk">← Khách quen</button>
    <div class="who"><img src="${c4Face(p)}" alt=""><div><h4>${p.name}</h4><p>${p.as === 'chủ nhà' ? 'chủ nhà' : p.as + ' ' + hs.name} · ${hs.xom}<br>nghề ${p.job}</p></div></div>
    <p><b>${T.name}:</b> ${T.desc}</p>
    <p>Hảo cảm: <b>${c4LikeWord(f.a)}</b> ${c4Bar(f.a)}</p>
    <p>Ghé quán ${f.v} lần · quen biết ${p.links.length} người (mình đã quen ${kn})</p>
    <ul class="ties">${links || '<li>Chẳng quen biết ai.</li>'}</ul>
    ${f.deal ? `<p class="back">Lần tới ghé: ${f.deal === 'free' ? 'mời miễn phí' : 'giảm nửa giá'}.</p>` : ''}
    <div class="row col">
      <button class="btn" data-act="moi" ${!buy || f.inv === day || c4Invited() >= C4_INVITES ? 'disabled' : ''}>${f.inv === day ? 'Đã mời hôm nay' : `Mời ghé quán (hôm nay còn ${C4_INVITES - c4Invited()} lượt)`}</button>
      <button class="btn alt" data-act="half" ${!buy || f.deal ? 'disabled' : ''}>Lần tới giảm nửa giá</button>
      <button class="btn alt" data-act="free" ${!buy || f.deal ? 'disabled' : ''}>Lần tới mời miễn phí</button>
    </div>`;
}
const C4_INVITES = 3, c4Invited = () => Object.values(SAVE4.folk).filter(f => f.inv === SAVE4.day).length;   // invitations a day
function c4Act(id, act) {
  const p = c4People().list[id], f = c4F(id);
  if (act === 'moi') { f.inv = SAVE4.day; (C4.expect = C4.expect || []).push(id); toast(`Đã nhắn ${p.name} ghé quán.`); }
  else { f.deal = act; toast(act === 'free' ? `Lần tới ${p.name} ghé sẽ được mời miễn phí.` : `Lần tới ${p.name} ghé sẽ được giảm nửa giá.`, 2.6); }
  AU.tap(); persist4(); c4OpenNotes('quen');
}
// the web of ties among the folk you know: houses round a circle, kin side by side; a tie to someone not yet met is a "?"
function c4WebHtml(P, known) {
  if (!known.length) return '<p>Chưa quen ai.</p>';
  const W = 400, cx = W / 2, cy = W / 2, n = known.length, R0 = Math.min(125, 40 + n * 4), r = Math.max(7, Math.min(16, 300 / n)), pos = {};
  const ks = [...known].sort((a, b) => a.house - b.house || a.id - b.id);   // households side by side round the ring
  ks.forEach((p, i) => { const an = i / n * 6.283 - 1.57; pos[p.id] = [cx + Math.cos(an) * R0, cy + Math.sin(an) * R0, an]; });
  let lines = '', nodes = '';
  const drawn = new Set();
  for (const p of ks) for (const l of p.links) {
    const key = Math.min(p.id, l.to) + '-' + Math.max(p.id, l.to); if (drawn.has(key) || !pos[l.to]) continue; drawn.add(key);
    const [x1, y1] = pos[p.id], [x2, y2] = pos[l.to], kin = P.list[l.to].house === p.house, k = kin ? 1 : .25;
    // kin: a short thick stroke; other ties: a curve bent through the middle of the ring
    const qx = cx + ((x1 + x2) / 2 - cx) * k, qy = cy + ((y1 + y2) / 2 - cy) * k;
    lines += `<path d="M${x1} ${y1} Q${qx} ${qy} ${x2} ${y2}" fill="none" stroke="${C4_RELS[l.rel].col}" stroke-width="${kin ? 3 : 1.8}" opacity=".75"/>`;
  }
  for (const p of ks) {
    const [x, y, an] = pos[p.id], f = SAVE4.folk[p.id], deg = an * 180 / Math.PI, flip = Math.cos(an) < 0;
    const tx = x + Math.cos(an) * (r + 4), ty = y + Math.sin(an) * (r + 4);   // names run outwards along the radius
    nodes += `<g class="nd" data-who="${p.id}"><image href="${c4Face(p)}" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}"/>`
      + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${f.a >= 60 ? '#2f6a4c' : f.a >= 35 ? '#c98a1c' : '#a3332a'}" stroke-width="2.5"/>`
      + `<text transform="translate(${tx} ${ty}) rotate(${flip ? deg + 180 : deg})" text-anchor="${flip ? 'end' : 'start'}" dominant-baseline="middle">${p.name}</text></g>`;
  }
  const legend = [...new Set(ks.flatMap(p => p.links.filter(l => c4Known(l.to)).map(l => l.rel)))].map(r => `<span><i style="background:${C4_RELS[r].col}"></i>${C4_RELS[r].name}</span>`).join('');
  return `<svg class="web" viewBox="-30 -30 ${W + 60} ${W + 60}">${lines}${nodes}</svg><div class="legend">${legend}</div>`;
}
