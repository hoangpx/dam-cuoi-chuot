/* Chương IV · phần 2 (phố huyện): the townsfolk you get to know, invitations and the sale's crowd of regulars — the same rules as
   the village (owner, 2026-10-17: "đã nói là làm phố huyện y hệt"). The town has its own folk (P4_FOLK_N, seeded, named, a temper
   from part 1's C4_TRAITS, some never chew betel, some love it), remembered in SAVE4B.folk[id] = { v visits, seen, k day known, a liking,
   treat, bad }. A first purchase makes a face known by sight, the second (a hard one: more) a regular you know; known folk come
   more often the more they like the house. Invitations (the "Mời khách" tab of the betel house and of each eating house we run): word
   is sent, they may not come, if they do it is a while later, they eat one portion free and like it or not. A sale draws extra KNOWN
   folk only; a habit of sales (js/ch4b/giamgia.js p4SaleWait) makes known folk hold back at the full price. */
const P4_FOLK_N = 90;
let P4P = null;
function p4People() {
  if (P4P) return P4P;
  let s = 4242 + ((SAVE4.seed || 7) | 0); const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return (s >>> 8) / 16777216; }, pick = a => a[(rnd() * a.length) | 0];
  const pool = g => [...(C4_GIVEN[g] || []), ...((typeof C4_GIVEN2 !== 'undefined' && C4_GIVEN2[g]) || []), ...((typeof C4_GIVEN3 !== 'undefined' && C4_GIVEN3[g]) || [])];
  const used = new Set(), list = [], traits = ['xoi', 'ky', 'chuyen', 'chat', 'hien', 'sidien', 'itnoi', 'khogan', 'danhda', 'hien', 'xoi'].filter(k => C4_TRAITS[k]);
  for (let i = 0; i < P4_FOLK_N; i++) {
    const g = rnd() < .5 ? 'm' : 'f', old = rnd() < .18, names = pool(g);
    let n = pick(names); for (let k = 0; k < 40 && used.has(n); k++) n = pick(names); used.add(n);
    const title = old ? pick(g === 'm' ? ['cụ ông', 'ông', 'bác'] : ['cụ bà', 'bà', 'bác']) : pick(g === 'm' ? ['anh', 'chú', 'cậu', 'thầy'] : ['chị', 'cô', 'mợ', 'thím']);
    const nope = rnd() < .25 ? ['trau'] : [];
    list.push({ id: i, name: `${title} ${n}`, g, old, sort: pick(old ? C4_OLD_SORTS2 : C4_ADULT_SORTS2), seed: rnd() * 6, trait: pick(traits),
      nope, fav: !nope.length && rnd() < .35 ? 'trau' : null, look: { skirt: g === 'f' && rnd() < .5, hat: rnd() < .25 ? 'quai' : null } });
  }
  return (P4P = list);
}
const p4F = id => (SAVE4B.folk = SAVE4B.folk || {})[id] || (SAVE4B.folk[id] = { a: 0, v: 0 });
const p4Known = id => !!(SAVE4B.folk && SAVE4B.folk[id] && SAVE4B.folk[id].k);
const p4Seen = id => !!(SAVE4B.folk && SAVE4B.folk[id] && (SAVE4B.folk[id].k || SAVE4B.folk[id].seen));
// who walks by: anyone, the regulars more often the more they like the house; nobody twice at once if it can be helped
function p4PickResident() {
  const here = new Set(P4.walkers.map(w => w.pid)), L = p4People().filter(p => !here.has(p.id)), list = L.length ? L : p4People();
  const wt = p => { const f = SAVE4B.folk && SAVE4B.folk[p.id]; return f && f.k ? 1 + f.a / 40 : f && f.seen ? 1.2 : 1; };
  let tot = 0; for (const p of list) tot += wt(p); let r = Math.random() * tot; for (const p of list) if ((r -= wt(p)) <= 0) return p; return list[0];
}
// how keen to buy betel: regulars more, folk who never chew betel never
function p4KeenK(P) {
  if (!P) return 1; if ((P.nope || []).includes('trau')) return 0;
  const f = SAVE4B.folk && SAVE4B.folk[P.id]; return f && f.k ? .6 + f.a / 80 : f && f.seen ? .9 : .8;
}
// a regular used to sales waits for the next one (k = 'home' or an eating house's key)
const p4HoldBack = (P, k) => !!(P && p4Known(P.id) && !p4SaleNow(k) && Math.random() < p4SaleWait(k));
// served (at the house: kind 'trau'; at an eating house: its key): known by sight, then a regular; liking; a sale's bonus; an invited guest's verdict
function p4Served(w, kind) {
  if (w.pid === undefined || w.pid === null) return;
  const p = p4People()[w.pid], T = C4_TRAITS[p.trait] || {}, f = p4F(p.id), day = SAVE4.day;
  if (w.treat) { toast(p4TreatEffect(p, kind), 3.6); }
  else if (!f.k) {
    f.v = (f.v || 0) + 1; if (!f.seen) f.seen = day;
    if (f.v >= (T.meet || 2)) { f.k = day; f.a = 40 - (f.bad ? 15 : 0); P4.fx.push({ x: w.x, y: p4Y(w.z) - 200, s: '★ ' + p.name, t: 0 }); }
  } else { f.v = (f.v || 0) + 1; f.a = Math.min(100, f.a + 4 * (T.gain || 1)); }
  const pct = p4SalePct(kind === 'trau' ? 'home' : kind);
  if (pct && f.k) { f.a = Math.min(100, f.a + Math.round(pct / 10 * (T.half || 1) * (.6 + Math.random() * .8))); if (Math.random() < .25) p4Say(w, p4Pick((T.half || 1) < 1 ? ['Rẻ thế này chắc hàng không ngon?'] : ['Hôm nay rẻ thế, mua thêm!', 'Gặp đúng lúc giảm giá, may ghê!'])); }
  p4Persist();
}
function p4TreatEffect(p, kind) {
  const f = p4F(p.id), T = C4_TRAITS[p.trait] || {}, day = SAVE4.day, hard = !!(T.meet || T.sour || p.trait === 'ky'), cap = s => s[0].toUpperCase() + s.slice(1);
  if (kind === 'trau' && (p.nope || []).includes('trau')) { if (f.k) f.a = Math.max(0, f.a - 6); else f.bad = true; f.nopeK = true; return `${cap(p.name)} xua tay: "Tôi không ăn trầu! Mời thế này là chẳng hiểu gì tôi rồi."`; }
  if (kind === 'trau' && p.fav === 'trau') {
    f.favK = day;
    if (f.k) f.a = Math.min(100, f.a + 16); else { f.seen = f.seen || day; f.v = (f.v || 1) + 2; if (f.v >= (T.meet || 2)) { f.k = day; f.a = 50 - (f.bad ? 10 : 0); } }
    return `${cap(p.name)} sáng mắt lên: "Trầu têm khéo quá, đúng thứ tôi thích!"${f.k === day ? ' Từ nay đã quen nhau.' : ''}`;
  }
  if (f.k) f.a = Math.min(100, f.a + (hard ? 1 : kind === 'trau' ? 4 : 6));
  return hard ? `${cap(p.name)} ăn cho phải phép, mặt vẫn lạnh tanh.` : `${cap(p.name)} ăn xong cảm ơn, vui vẻ ra về.`;
}
// ---------- invitations ----------
function p4Invite(id, kind) {
  const p = p4People()[id], f = p4F(id), T = C4_TRAITS[p.trait] || {};
  if (f.treat === SAVE4.day) return; f.treat = SAVE4.day;
  const no = Math.random() < Math.max(.1, Math.min(.6, .5 - (f.a || 0) / 200 + (T.meet ? .15 : 0) + (f.k ? 0 : .1)));
  (P4.guestQ = P4.guestQ || []).push({ p, at: (P4.guestT || 0) + 8 + Math.random() * 22, no, late: Math.random() < .4, kind });
  P4.guestQ.sort((a, b) => a.at - b.at);
  toast(`Đã nhắn ${p.name} ra ${kind === 'trau' ? 'hiệu ăn thử miếng trầu' : 'quán ăn thử'}. Người ta có đến không thì chưa biết.`, 3.2); AU.tap(); p4Persist();
}
// every frame: invited guests arrive (or not), and a sale brings known folk in
function p4FolkTick(dt) {
  if (P4.phase !== 'open' || !SAVE4B.house) return;
  P4.guestT = (P4.guestT || 0) + dt;
  const Q = P4.guestQ || [];
  while (Q.length && Q[0].at <= P4.guestT) {
    const { p, no, late, kind } = Q.shift();
    if (no) { toast(p4Pick([`Chờ mãi chẳng thấy ${p.name} đâu. Hẹn rồi lại quên!`, `${p.name} nhắn ra: "Bận việc nhà, hôm khác nhé!"`]), 3); continue; }
    if (kind === 'trau') { if (SAVE4B.stock < 1) { toast(`${p.name} ra đến nơi thì hiệu hết trầu, đành về.`, 3); continue; } p4Spawn(undefined, p, { buy: true, treat: true, n: 1 }); }
    else if (p4Shops()[kind]) p4FoodCustomer(+kind, kind, p, { treat: true, n: 1 });
    const w = P4.walkers.find(q => q.pid === p.id && q.treat); if (w) setTimeout(() => { if (S.mode === 'c4bplay' && !w.say) p4Say(w, p4Pick(late ? ['Xin lỗi, giờ tôi mới ra được!', 'Bận tí việc, giờ mới đến!'] : ['Nghe nói mời, tôi ra đây!', 'Mời thì tôi đến ngay!'])); }, 900);
  }
  // a sale's crowd: known folk only, more for a bigger cut, shaped by the weather and luck
  const T = P4.saleT || (P4.saleT = {});
  for (const k of ['home', ...Object.keys(p4Shops())]) {
    const pct = p4SalePct(k); if (!pct) { delete T[k]; continue; }
    if (T[k] === undefined) T[k] = 2 + Math.random() * 3;
    if ((T[k] -= dt) > 0) continue;
    T[k] = 9 / (pct / 10) / Math.max(.3, p4WxFlow()) * (.6 + Math.random());
    if (k === 'home' && SAVE4B.stock < 1) continue;
    const here = new Set(P4.walkers.map(w => w.pid)), cand = p4People().filter(p => p4Known(p.id) && !here.has(p.id) && !(k === 'home' && (p.nope || []).includes('trau')));
    if (!cand.length) continue;
    const wt = p => (.4 + SAVE4B.folk[p.id].a / 100) * ((C4_TRAITS[p.trait] || {}).half || 1) * (k === 'home' && p.fav === 'trau' ? 1.6 : 1) * (.5 + Math.random());
    let best = null, bw = -1; for (const p of cand) { const w = wt(p); if (w > bw) { bw = w; best = p; } }
    if (k === 'home') p4Spawn(undefined, best, { buy: true }); else p4FoodCustomer(+k, k, best);
  }
}
// the "Mời khách" list of a sheet (kind 'trau' for the house, else an eating house's key)
function p4TreatBlock(kind) {
  const d = document.createElement('div'); d.className = 'treat';
  const known = p4People().filter(p => p4Seen(p.id)); if (!known.length) return d;
  if (P4.phase !== 'open') { d.innerHTML = '<p class="sm">Mời khách quen được lúc phố còn mở hàng.</p>'; return d; }
  const has = kind === 'trau' ? SAVE4B.stock > 0 : true, day = SAVE4.day, F = id => SAVE4B.folk[id];
  d.innerHTML = `<p class="sm">Nhắn người ta ra ${kind === 'trau' ? 'hiệu' : 'quán'} ăn thử, mỗi người một lần một ngày. Chưa chắc người ta đến; có đến thì cũng phải một lúc sau. Mời đúng thứ họ thích mới thân${has ? '' : '. <b>Hết trầu rồi.</b>'}</p>`
    + `<div class="trl">${known.sort((a, b) => (p4Known(b.id) - p4Known(a.id)) || (F(b.id).a || 0) - (F(a.id).a || 0)).map(p => { const f = F(p.id), done = f.treat === day, fav = kind === 'trau' && f.favK && p.fav === 'trau', no = kind === 'trau' && f.nopeK;
      return `<div class="tr"><img src="${p4Face(p)}" alt=""><b>${p.name}${fav ? ' <i class="fav">♥</i>' : ''}${no ? ' <i class="no">✕</i>' : ''}${p4Known(p.id) ? '' : ' <small>biết mặt</small>'}</b>${c4Bar(f.a || 0)}<button data-tr="${p.id}" ${!has || done ? 'disabled' : ''}>${done ? '✓ đã nhắn' : 'Mời'}</button></div>`; }).join('')}</div>`;
  d.querySelectorAll('[data-tr]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); p4Invite(+b.dataset.tr, kind); P4.keepTab = true; if (kind === 'trau') p4HomeOpen(); else p4KeepScroll('p4shop', p4ShopSheet); }));
  return d;
}
// a portrait for the list (part 1's c4Face draws a village person; a town person is drawn the same way from its sort and seed)
const P4_FACE = new Map();
function p4Face(p) {
  if (P4_FACE.has(p.id)) return P4_FACE.get(p.id);
  let src = '';
  try { src = c4Face({ id: 9000 + p.id, kind: 'mouse', sort: p.sort, role: p.old ? 'old' : 'adult', g: p.g, look: { hat: p.look.hat } }); } catch (e) { src = ''; }
  P4_FACE.set(p.id, src); return src;
}
// two tabs on a sheet, like part 1's stalls: the trade and "Mời khách (N)"; P4.keepTab keeps the tab when the sheet is drawn again
function p4Tabs(sheetId, body, treat, label) {
  if (!treat || !treat.children.length) { $('#' + sheetId).classList.remove('tab-moi'); return; }
  const n = treat.querySelectorAll('.tr').length, bar = document.createElement('div'); bar.className = 'uptabs';
  bar.innerHTML = `<button type="button" data-ut="q">${label}</button><button type="button" data-ut="m">Mời khách${n ? ' (' + n + ')' : ''}</button>`; body.prepend(bar);
  const set = t => { P4.upTab = t; $('#' + sheetId).classList.toggle('tab-moi', t === 'm'); bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.ut === t)); };
  bar.querySelectorAll('button').forEach(x => x.addEventListener('click', e => { e.stopPropagation(); AU.tap(); set(x.dataset.ut); }));
  set(P4.keepTab || P4.sheet === sheetId ? P4.upTab || 'q' : 'q'); P4.keepTab = false;
}
