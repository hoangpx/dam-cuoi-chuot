/* ---------- Việc hôm nay, đợt mới (owner): finding things that have strayed, counting, serving well, passing a word on ----------
   The tasks join C4_TASKS (kinhdoanh.js). A task is a plain object saved in SAVE4.tasks (k, text, prize, done, paid + its own
   fields; ok = done by the player). Things that wander (animals, a lost child, the thief, a rare bird, whoever lost a purse) are
   "actors" in C4.nv.act: they come in at their time, stay a few seconds and are found by a tap (c4NvTap, tried first in c4Up).
   One day is only ~3½ minutes, so "a few minutes" in game time is some seconds here. */
const C4_NV_HAT = [['đỏ', '#c8392d'], ['xanh lá', '#2f6a4c'], ['vàng', '#f2c640'], ['xanh dương', '#2f5f8f'], ['tím', '#8a5aa0']];
const C4_NV_ROBE = { 11: 'đỏ', 12: 'xanh lá', 13: 'vàng' };
const C4_NV_HOLD = [['cái bánh', () => MP.banh], ['con cá', () => ITEM.fish], ['quả bưởi', () => WP.pomelo], ['cái trống con', () => ITEM.drum]];
// strays: the rarer, the fewer times and the shorter it shows, the more it pays
const C4_NV_ANIMALS = [
  { an: 'ga', name: 'con gà', kind: 'rooster', rar: 'dễ', n: 3, life: 16, sp: 38, prize: 10 },
  { an: 'vit', name: 'con vịt', kind: 'duck', rar: 'dễ', n: 3, life: 15, sp: 34, prize: 10 },
  { an: 'meo', name: 'con mèo', kind: 'cat', rar: 'khó', n: 2, life: 11, sp: 80, prize: 22 },
  { an: 'cho', name: 'con chó', kind: 'dog', rar: 'rất khó', n: 1, life: 7, sp: 150, prize: 40 },
];
const C4_NV_LOST = ['cái ví', 'cái nón', 'đôi dép'];
const C4_NV_ADULTS = [0, 1, 3, 5, 14, 15, 16, 17, 18, 19];
const C4_NV = () => C4.nv || (C4.nv = { act: [], cnt: { buf: 0, ganh: 0, chim: 0 }, bird: {}, bufAt: [], bufTry: 0, paradeN: 0 });
// n times spread over the day (game minutes)
const c4NvTimes = (n, a = 6.5, b = 17) => { const t = []; for (let i = 0; i < n; i++) t.push(Math.round((a + (b - a) * (i + .1 + R() * .8) / n) * 60)); return t; };
const c4NvKnown = () => c4People().list.filter(p => c4Known(p.id));
const c4NvOpenHour = () => C4.phase === 'open';

C4_TASKS.push(
  // --- finding what has strayed ---
  { k: 'thu', from: () => SAVE4.day >= 2, make: () => { const A = c4Pick(C4_NV_ANIMALS);
      return { an: A.an, text: `Tìm ${A.name} nhà ai xổng chuồng, hay lảng vảng quanh chợ (${A.rar} thấy). Thấy nó thì chạm vào để bắt.`, prize: A.prize, app: c4NvTimes(A.n).map(at => ({ at, life: A.life, fired: false })) }; },
    done: t => !!t.ok },
  { k: 'be', from: () => SAVE4.day >= 3, make: () => { const sort = 11 + ((R() * 3) | 0), hat = (R() * C4_NV_HAT.length) | 0, hold = (R() * C4_NV_HOLD.length) | 0, who = c4Pick(c4People().list.filter(p => p.role !== 'child')).name;
      return { sort, hat, hold, wrong: 0, text: `Tìm bé nhà ${who} đi lạc: áo ${C4_NV_ROBE[sort]}, đội mũ ${C4_NV_HAT[hat][0]}, tay cầm ${C4_NV_HOLD[hold][0]}. Thấy bé thì chạm vào để đưa về.`, prize: 30, app: c4NvTimes(2, 7, 16).map(at => ({ at, life: 18, fired: false })) }; },
    done: t => !!t.ok },
  { k: 'chim', from: () => SAVE4.day >= 4, make: () => { const n = R() < .5 ? 1 : 2;
      return { text: 'Có con chim quý của nhà giàu sổ lồng bay mất. Chim chỉ đậu trên mái hoặc cành cây một lúc rất ngắn: bắt được thì chủ xin hậu tạ.', prize: n === 1 ? 60 : 45, app: c4NvTimes(n, 8, 16).map(at => ({ at, life: 6, fired: false })) }; },
    done: t => !!t.ok },
  { k: 'trom', from: () => SAVE4.day >= 3, make: () => ({ misses: 0, text: 'Có kẻ trộm vặt (che mặt, nón sụp) lảng vảng quanh chợ. Thấy thì chạm vào để bắt, không thì mất hàng.', prize: 25, app: c4NvTimes(2, 8, 16).map(at => ({ at, life: 14, fired: false })) }),
    done: t => !!t.ok },
  { k: 'roi', from: () => SAVE4.day >= 2, make: () => { const item = c4Pick(C4_NV_LOST);
      return { item, text: `Có người làm rơi ${item} ngoài chợ. Nhặt lên (chạm vào), rồi tìm đúng chủ để trả lại.`, prize: 15, app: c4NvTimes(1, 7, 14).map(at => ({ at, life: 40, fired: false })) }; },
    done: t => !!t.ok },
  { k: 'say', from: () => SAVE4.day >= 2, make: () => ({ text: 'Chiều nay có người uống rượu say khướt ở chợ (từ khoảng giờ Mùi). Tìm ra và chạm vào người đó.', prize: 12, app: c4NvTimes(1, 13, 16).map(at => ({ at, life: 30, fired: false })) }),
    done: t => !!t.ok },
  { k: 'loi', from: () => SAVE4.day >= C4_BOOK_DAY && c4NvKnown().length >= 1, make: () => { const A = c4Pick(c4NvKnown()), B = c4Pick(c4People().list.filter(p => p.kind === 'mouse' && p.role !== 'child' && p.id !== A.id));
      return { from: A.id, to: B.id, text: `${A.name} nhờ báo tin cho ${B.name} (${c4People().houses[B.house].xom}): ${B.name} sẽ ra chợ một lát. Thấy thì chạm vào để nhắn.`, prize: 15, app: c4NvTimes(1, 8, 14).map(at => ({ at, life: 35, fired: false })) }; },
    done: t => !!t.ok },
  // --- serving well ---
  { k: 'hai', make: () => { const n = 5 + Math.min(8, c4Owned().length * 2) + (SAVE4.day > 8 ? 2 : 0); return { n, text: `Phục vụ ${n} khách mà không để ai chờ lâu (làm ngay).`, prize: 6 + n }; },
    done: (t, d) => (d.quick || 0) >= t.n },
  { k: 'khongbo', end: true, make: () => ({ text: 'Cả ngày không để khách nào bỏ về vì chờ lâu (phục vụ ít nhất 8 khách).', prize: 25 }),
    done: (t, d) => !(d.lost || 0) && (d.served || 0) >= 8 },
  { k: 'het', from: () => c4Owned().some(g => C4_GOODS[g].keep !== 'ever'), make: () => { const g = c4Pick(c4Owned().filter(x => C4_GOODS[x].keep !== 'ever'));
      return { g, hour: 17, text: `Bán hết ${C4_GOODS[g].name.toLowerCase()} trước 17 giờ (bán ít nhất 8, không để dư).`, prize: 20 }; },
    done: (t, d) => c4Stock(t.g) <= 0 && ((d.by && d.by[t.g] && d.by[t.g].n) || 0) >= 8 && C4.mins < t.hour * 60 },
  { k: 'dumon', from: () => c4Owned().length >= 2, make: () => { const n = Math.min(c4Owned().length, 2 + (SAVE4.day > 10 ? 1 : 0)); return { n, text: `Bán được ít nhất ${n} loại hàng khác nhau hôm nay.`, prize: 8 * n }; },
    done: (t, d) => Object.values(d.by || {}).filter(b => b.n > 0).length >= t.n },
  { k: 'cuoi', from: () => (C4.events || []).some(e => e.kind === 'cuoi'), make: () => ({ text: 'Nhận đơn trầu cưới sáng nay và giao đủ cho nhà trai lúc giờ Thân (15:00–17:00).', prize: 15 }),
    done: (t, d) => !!d.wedOk },
  // --- counting (asked at the end of the day) ---
  { k: 'dem_buf', end: true, from: () => SAVE4.day >= 2, make: () => ({ text: 'Đếm xem hôm nay có bao nhiêu người dắt trâu đi qua chợ. Cuối ngày sẽ hỏi.', ask: 'Hôm nay bạn thấy bao nhiêu người dắt trâu đi qua chợ?', prize: 12 }), done: t => !!t.ok },
  { k: 'dem_ganh', end: true, from: () => SAVE4.day >= 2, make: () => ({ text: 'Đếm xem từ giờ Thìn đến trước trưa (7 giờ đến 11 giờ) có bao nhiêu người gánh hàng đi qua. Cuối ngày sẽ hỏi.', ask: 'Từ 7 đến 11 giờ, bạn thấy bao nhiêu người gánh hàng đi qua?', prize: 12 }), done: t => !!t.ok },
  { k: 'dem_chim', end: true, from: () => c4Wx() !== 'mua' && SAVE4.day >= 2, make: () => ({ text: 'Đếm xem từ giờ Ngọ đến giờ Thân (12 giờ đến 15 giờ) có bao nhiêu đàn chim bay ngang bầu trời. Cuối ngày sẽ hỏi.', ask: 'Từ 12 đến 15 giờ, bạn thấy bao nhiêu đàn chim bay ngang?', prize: 12 }), done: t => !!t.ok },
  { k: 'dem_ruoc', end: true, from: () => SAVE4.day >= 3, make: () => ({ text: 'Sáng nay có đám rước đi ngang chợ. Đếm xem đoàn có bao nhiêu người (cả kèn, trống, lọng, cô dâu chú rể và người gánh lễ). Cuối ngày sẽ hỏi.', ask: 'Đoàn rước sáng nay có bao nhiêu người?', prize: 15 }), done: t => !!t.ok },
);
// the day each kind opens on (owner: one or two tasks a day, coming in gradually)
const C4_NV_DAYS = { news: 1, visit: 1, help: 2, thu: 2, met: 3, roi: 3, hai: 3, tea: 4, be: 4, dem_buf: 4, say: 5, khongbo: 5, cuoi: 5, ws: 6, ruot: 6, loi: 6, trom: 6, het: 7, dumon: 7, dem_ganh: 8, chim: 9, dem_chim: 10, dem_ruoc: 11 };
for (const [k, d] of Object.entries(C4_NV_DAYS)) { const T = C4_TASKS.find(x => x.k === k); if (T) T.d = d; }
// "hóng tin" asks for more as the days go on (the older task, kinhdoanh.js)
{ const T = C4_TASKS.find(t => t.k === 'news'); if (T) T.make = () => { const n = 1 + (R() < .4 ? 1 : 0) + (SAVE4.day >= 10 ? 1 : 0); return { n, text: n === 1 ? 'Hóng được một tin đồn' : `Hóng được ${n} tin đồn`, prize: 4 + n * 4 }; }; }

/* ---------- the book's Việc tab (owner): today's tasks, the streak, the last days ---------- */
function c4TasksTab() {
  const T = SAVE4.taskDay === SAVE4.day ? SAVE4.tasks || [] : null;
  let h = '<h4>Hôm nay</h4>';
  if (!T) h += '<p>Việc hôm nay sẽ biết khi chợ mở cửa.</p>';
  else if (!T.length) h += '<p>Hôm nay không có việc gì.</p>';
  else h += T.map(t => `<p class="tk ${t.done ? 'ok' : t.failed ? 'bad' : ''}">${t.done ? '✓' : t.failed ? '✗' : '○'} ${t.text} <b>(+${t.prize} đồng)</b></p>`).join('');
  const st = SAVE4.streak || 0, next = st < 3 ? [3, 'thưởng 30 đồng'] : st < 5 ? [5, 'lộc chợ: khách đông cả ngày hôm sau'] : [(Math.floor(st / 7) + 1) * 7, 'thưởng 100 đồng'];
  h += `<h4>Chuỗi ngày</h4><p>Đang có <b>${st}</b> ngày liền làm đủ việc. Mốc kế tiếp: ngày thứ ${next[0]}, ${next[1]}. Ngày không có việc thì chuỗi vẫn giữ.</p>`;
  const log = (SAVE4.taskLog || []).slice(-8).reverse();
  if (log.length) h += '<h4>Những ngày trước</h4>' + log.map(l => `<p>Ngày ${l.day}: ${l.ok}/${l.n} việc${l.got ? ' · +' + l.got + ' đồng' : ''}</p>`).join('');
  const seen = Object.keys(SAVE4.taskSeen || {}).length, open = C4_TASKS.filter(t => (t.d || 1) <= SAVE4.day).length;
  return h + `<p class="hint">Việc mới mở dần theo ngày: bạn đã gặp ${seen} trong ${open} loại việc đã mở.</p>`;
}
/* ---------- the actors ---------- */
function c4NvActor(o) { const a = Object.assign({ st: 'walk', ph: R() * 6, seed: R() * 6, face: 1, say: null, turn: 1 + R() * 2, look: {}, carry: null, talk: false }, o); C4_NV().act.push(a); return a; }
function c4NvEdge() { const V = c4View(), left = R() < .5; return { x: left ? C4.camX - 70 : C4.camX + V.vw + 70, face: left ? 1 : -1 }; }
const c4NvTask = k => (SAVE4.tasks || []).find(t => t.k === k && !t.ok);
const c4NvHold = i => C4_NV_HOLD[i][1]();
function c4NvOk(t, msg, prize) {
  t.ok = true; t.done = true; if (prize !== undefined) t.prize = prize;
  AU.pluck(92); toast(`${msg} (+${t.prize} đồng cuối ngày)`, 3.8); c4Hud(); persist4();
  C4_NV().act = C4_NV().act.filter(a => a.tk !== t.k);
}
function c4NvFire(t, ap) {
  const E = c4NvEdge(), V = c4View();
  if (t.k === 'thu') {
    const A = C4_NV_ANIMALS.find(a => a.an === t.an);
    c4NvActor({ tk: 'thu', kind: A.kind, x: E.x, face: E.face, z: A.an === 'cho' ? .3 + R() * .25 : .35 + R() * .6, sp: A.sp, life: ap.life });
    if (A.an === 'meo') AU.meow(); else if (A.an === 'cho') AU.bark();
  } else if (t.k === 'be') {
    const mk = (sort, hat, hold, target, off) => c4NvActor({ tk: 'be', kind: 'mouse', sort, M: c4MouseRig(sort), x: E.x - E.face * off, face: E.face, z: .5 + R() * .45, sp: 62 + R() * 18, life: ap.life, hatCol: C4_NV_HAT[hat][1], carry: c4NvHold(hold), target, st: 'walk' });
    mk(t.sort, t.hat, t.hold, true, 0);
    for (let i = 0; i < 3; i++) {                                           // look-alikes: one thing different, or two
      let sort = t.sort, hat = t.hat, hold = t.hold; const parts = [0, 1, 2].sort(() => R() - .5).slice(0, i === 2 ? 2 : 1);
      for (const p of parts) { if (p === 0) { do { sort = 11 + ((R() * 3) | 0); } while (sort === t.sort); } else if (p === 1) { do { hat = (R() * C4_NV_HAT.length) | 0; } while (hat === t.hat); } else { do { hold = (R() * C4_NV_HOLD.length) | 0; } while (hold === t.hold); } }
      mk(sort, hat, hold, false, 80 * (i + 1));
    }
  } else if (t.k === 'chim') {
    c4NvActor({ tk: 'chim', kind: 'bird', x: C4.camX + V.vw * (.15 + R() * .7), z: .1, face: R() < .5 ? 1 : -1, life: ap.life, st: 'sit' });
    AU.pluck(98);
  } else if (t.k === 'trom') {
    c4NvActor({ tk: 'trom', kind: 'mouse', sort: 1, M: c4MouseRig(1), x: E.x, face: E.face, z: .4 + R() * .4, sp: 50, life: ap.life, thief: true, pause: 0 });
  } else if (t.k === 'roi') {
    c4NvActor({ tk: 'roi', kind: 'item', x: C4.camX + V.vw * (.2 + R() * .6), z: .55 + R() * .3, life: ap.life, item: t.item });
  } else if (t.k === 'say') {
    const w = C4.walkers.find(q => q.st === 'walk' && q.kind === 'mouse' && !q.buf && !q.guest && !q.hoa && C4_MOUSE_SORTS[q.sort].role !== 'child' && q.x > C4.camX - 100 && q.x < C4.camX + V.vw + 100);
    if (w) { w.drunk = true; w.buy = false; w.shop = null; c4Say(w, c4Pick(C4_DRUNK)); }
    else ap.fired = false;                                                   // nobody to be drunk yet: try again next frame
  } else if (t.k === 'loi') {
    const B = c4People().list[t.to], w = C4.walkers.find(q => q.st === 'walk' && q.kind === 'mouse' && !q.buf && !q.guest && !q.hoa && !q.buy && C4_MOUSE_SORTS[q.sort].role !== 'child' && q.x > C4.camX - 100 && q.x < C4.camX + V.vw + 100);
    if (w) { Object.assign(w, { name: B.name, pid: B.id, sort: B.sort, M: c4MouseRig(B.sort), look: B.look || {}, buy: false, shop: null, nvMsg: true }); }
    else ap.fired = false;
  }
}
const c4NvHit = (a, x, y) => {
  if (a.kind === 'bird') return Math.abs(x - a.x) < 36 && Math.abs(y - (c4Y(a.z) - 215 * c4S(a.z))) < 36;
  const s = c4S(a.z) * C4_CROWD; if (a.kind === 'item') return Math.abs(x - a.x) < 34 * s + 10 && y > c4Y(a.z) - 50 * s - 10 && y < c4Y(a.z) + 12;
  const tall = a.kind === 'mouse' ? 168 * .92 * (C4_MOUSE_SORTS[a.sort].role === 'child' ? .68 : 1) : a.kind === 'cat' ? 90 : C4_TALL[a.kind] || 70;
  return Math.abs(x - a.x) < 38 * s + 10 && y > c4Y(a.z) - tall * s - 12 && y < c4Y(a.z) + 12;
};
// a tap on any of the things above or on the people the tasks are about; true when it was one of them
function c4NvTap(x, y) {
  const N = C4.nv; if (!N || C4.phase !== 'open') return false;
  for (const a of [...N.act].reverse()) {
    if (!c4NvHit(a, x, y)) continue;
    const t = c4NvTask(a.tk); if (!t) continue;
    if (a.tk === 'thu') { c4NvOk(t, 'Bắt được rồi! Chủ mừng quá'); return true; }
    if (a.tk === 'chim') { c4NvOk(t, `Bắt được chim quý! Chủ chim hậu tạ`); return true; }
    if (a.tk === 'trom') { c4NvOk(t, 'Bắt được kẻ trộm!'); return true; }
    if (a.tk === 'be') {
      if (a.target) { c4NvOk(t, 'Tìm được bé rồi! Mẹ bé cảm ơn rối rít'); return true; }
      t.wrong++; c4Say(a, c4Pick(['Con không phải bé đi lạc!', 'Nhầm rồi, nhà con ở kia cơ!', 'Bác nhầm rồi ạ.'])); AU.snort();
      if (t.wrong >= 4) { N.act = N.act.filter(q => q.tk !== 'be'); t.wrong = 0; toast('Chạm nhầm nhiều quá, bọn trẻ chạy mất cả rồi.', 2.8); }
      return true;
    }
    if (a.tk === 'roi') {
      if (a.kind === 'item') {
        N.act = N.act.filter(q => q !== a); AU.pluck(86); toast(`Nhặt được ${t.item}! Giờ tìm chủ của nó.`, 2.8);
        const o = c4NvActor({ tk: 'roi', kind: 'mouse', sort: c4Pick(C4_NV_ADULTS), x: C4.camX + c4View().vw * (.2 + R() * .6), face: R() < .5 ? 1 : -1, z: .5 + R() * .4, sp: 26, life: 28, owner: true, sayT: 0 }); o.M = c4MouseRig(o.sort);
        return true;
      }
      if (a.owner) { c4NvOk(t, `Chủ ${t.item} mừng rỡ: cảm ơn nhiều lắm`); return true; }
    }
  }
  for (const w of C4.walkers) {
    if (!(w.drunk || w.nvMsg) || w.kind !== 'mouse') continue;
    const s = c4S(w.z) * C4_CROWD, k = .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .68 : 1);
    if (!(Math.abs(x - w.x) < 38 * s + 10 && y > c4Y(w.z) - 168 * k * s - 12 && y < c4Y(w.z) + 12)) continue;
    if (w.drunk && c4NvTask('say')) { c4NvOk(c4NvTask('say'), 'Tìm ra người say rồi! Có người đưa bác ấy về'); c4Say(w, 'Hức… về thì về…'); w.drunk = false; return true; }
    if (w.nvMsg && c4NvTask('loi')) {
      const t = c4NvTask('loi'), A = c4People().list[t.from]; c4Bump(t.from, 4); c4Bump(t.to, 4); w.nvMsg = false; c4Say(w, `Ừ, cảm ơn nhé, tôi sẽ ghé nhà ${A.name}!`);
      c4NvOk(t, `Đã nhắn lời của ${A.name}`); return true;
    }
  }
  return false;
}
/* ---------- per frame ---------- */
function c4NvUpdate(dt) {
  if (C4.phase !== 'open' || !C4.nv) return;
  const N = C4.nv, V = c4View(), tasks = SAVE4.tasks || [];
  for (const t of tasks) { if (t.ok || t.failed || !t.app) continue; for (const ap of t.app) if (!ap.fired && C4.mins >= ap.at) { ap.fired = true; c4NvFire(t, ap); } }
  for (const a of [...N.act]) {
    a.ph += dt * (a.sp > 100 ? 14 : 8); a.life -= dt;
    if (a.say && (a.say.t += dt) > a.say.life) a.say = null;
    if (a.kind !== 'bird' && a.kind !== 'item') {
      a.turn -= dt;
      if (a.thief) { a.pause -= dt; if (a.pause <= 0 && R() < dt * .4) a.pause = .8 + R() * 1.2; }
      if (a.turn <= 0) { a.turn = 1.2 + R() * 2.6; if (R() < .35) a.face = -a.face; }
      if (a.x < C4.camX - 120) a.face = 1; else if (a.x > C4.camX + V.vw + 120) a.face = -1;
      if (!(a.thief && a.pause > 0)) a.x += a.face * a.sp * dt;
      a.st = a.thief && a.pause > 0 ? 'stand' : 'walk';
      if (a.owner) { a.sayT -= dt; if (a.sayT <= 0) { const t = c4NvTask('roi'); if (t) { c4Say(a, `Ai nhặt được ${t.item} của tôi không?`, 3); a.sayT = 5; } } }
    }
    if (a.life <= 0) {
      N.act = N.act.filter(q => q !== a);
      const t = tasks.find(x => x.k === a.tk && !x.ok);
      if (t && a.tk === 'trom' && ++t.misses >= t.app.length) { const n = 3 + ((R() * 4) | 0); SAVE4.stock = Math.max(0, SAVE4.stock - n); t.failed = true; toast(`Kẻ trộm chuồn mất, hụt ${n} miếng trầu.`, 3.4); c4Hud(); }
      if (t && a.tk === 'roi' && a.owner) { t.failed = true; toast(`Chủ ${t.item} đi mất rồi.`, 2.8); }
      if (t && a.tk === 'be' && a.target && !t.app.some(x => !x.fired)) { t.failed = true; toast('Bé đi lạc đã chạy mất, không tìm thấy nữa.', 2.8); }
    }
  }
  // what the player has seen go by (for the counting tasks): counted once, when they come into view
  const hr = C4.mins / 60;
  for (const w of C4.walkers) {
    if (w.nvSeen || w.x < C4.camX || w.x > C4.camX + V.vw) continue; w.nvSeen = true;
    if (w.buf) N.cnt.buf++;
    if (w.look && w.look.tool === 'ganh' && !w.hoa && hr >= 7 && hr < 11) N.cnt.ganh++;
  }
  if (N.bufAt.length && C4.mins >= N.bufAt[0] && N.bufTry < 14) { N.bufTry++; if (c4NvForceBuf()) N.bufAt.shift(); }
  // flocks of birds, as c4Sky draws them: one starts when its cycle comes round
  if (c4Wx() !== 'mua') for (let k = 0; k < 2; k++) {
    const per = c4OmenOn('chim') ? 8 + k * 4 : 16 + k * 7, idx = Math.floor((C4.t + k * 9) / per);
    if (N.bird[k] === undefined) N.bird[k] = idx;
    else if (idx !== N.bird[k]) { N.bird[k] = idx; if (hr >= 12 && hr < 15 && mulberry(idx * 17 + k * 3 + 1)() >= .35) N.cnt.chim++; }
  }
}
function c4NvForceBuf() {
  const n = C4.walkers.length; c4Spawn(); if (C4.walkers.length <= n) return false;
  const w = C4.walkers[C4.walkers.length - 1];
  if (w.kind !== 'mouse' || w.guest || C4_MOUSE_SORTS[w.sort].role === 'child') return false;
  if (!w.buf) Object.assign(w, { buf: true, sp: 38, buy: false, shop: null, st: 'walk', look: { ...(w.look || {}), tool: 'buf' } });
  return true;
}
// at the start of the day (c4PlanEvents): what each task needs set up
function c4NvInit() {
  C4.nv = null; const N = C4_NV(), ts = SAVE4.tasks || [];
  if (ts.some(t => t.k === 'dem_buf' && !t.ok)) N.bufAt = c4NvTimes(3 + ((R() * 3) | 0), 7, 16);
  if (ts.some(t => t.k === 'dem_ruoc' && !t.ok)) { if (!C4.parade) C4.parade = { at: (8.5 + R() * 2) * 60, x: null }; C4.parade.extra = 1 + ((R() * 4) | 0); N.paradeN = 5 + C4.parade.extra; }
  for (const t of ts) if (t.k.startsWith('dem_') && !t.ok && !t.failed) C4.events.push({ at: 18 * 60 + 15, kind: 'nvdem', tk: t.k });
  C4.events.sort((a, b) => a.at - b.at);
}
const c4NvTruth = k => { const N = C4_NV(); return k === 'dem_buf' ? N.cnt.buf : k === 'dem_ganh' ? N.cnt.ganh : k === 'dem_chim' ? N.cnt.chim : N.paradeN; };
// the evening question for a counting task (an event sheet)
function c4NvDemEvent(E) {
  const k = C4.evArg && C4.evArg.tk, t = (SAVE4.tasks || []).find(x => x.k === k && !x.ok && !x.failed); if (!t) return false;
  const truth = c4NvTruth(k), opts = [];
  for (let v = Math.max(0, truth - 2); v <= truth + 2; v++) opts.push([String(v), () => c4NvAnswer(t, v, truth)]);
  opts.push(['Không nhớ rõ', () => c4NvAnswer(t, -1, truth)]);
  Object.assign(E, { title: 'Việc hôm nay: đếm', text: t.ask, opts });
  return true;
}
function c4NvAnswer(t, v, truth) {
  const d = Math.abs(v - truth);
  if (v >= 0 && d === 0) c4NvOk(t, 'Đếm chuẩn không sai một ai');
  else if (v >= 0 && d === 1) c4NvOk(t, `Gần đúng rồi (thực ra là ${truth}), thưởng một nửa`, Math.round(t.prize / 2));
  else { t.failed = true; toast(`Chưa đúng rồi, thực ra là ${truth}.`, 3.2); }
}
/* ---------- drawing ---------- */
function c4NonCol(g, col) { g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-34, -140); g.lineTo(46, -140); g.lineTo(6, -176); g.closePath(); g.fill(); g.stroke(); }
function c4NvItems(items, g, vis, head) {
  const N = C4.nv; if (!N) return;
  for (const a of N.act) {
    if (!vis(a.x, 90)) continue;
    if (a.kind === 'bird') {
      const y = c4Y(a.z) - 215 * c4S(a.z), b = Math.sin(C4.t * 14) * 2;
      items.push({ z: .95, f: () => {
        const gr = g.createRadialGradient(a.x, y, 4, a.x, y, 44); gr.addColorStop(0, 'rgba(255,224,120,.75)'); gr.addColorStop(1, 'rgba(255,224,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(a.x, y, 44, 0, 6.283); g.fill();
        g.save(); g.translate(a.x, y + b); g.scale(a.face * 1.5, 1.5); dp(g, WP.sparrow, 0, 0); g.restore();
        g.strokeStyle = '#fff3c4'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const an = C4.t * 3 + i * 1.57, r = 30 + Math.sin(C4.t * 6 + i) * 4; g.beginPath(); g.moveTo(a.x + Math.cos(an) * r - 4, y + Math.sin(an) * r); g.lineTo(a.x + Math.cos(an) * r + 4, y + Math.sin(an) * r); g.moveTo(a.x + Math.cos(an) * r, y + Math.sin(an) * r - 4); g.lineTo(a.x + Math.cos(an) * r, y + Math.sin(an) * r + 4); g.stroke(); }
      } });
      continue;
    }
    const s = c4S(a.z) * C4_CROWD, y = c4Y(a.z);
    if (a.kind === 'item') {
      items.push({ z: a.z, f: () => {
        g.save(); g.translate(a.x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
        if (a.item === 'cái ví') { g.fillStyle = '#8a5a2b'; g.beginPath(); g.ellipse(0, -14, 18, 14, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#f2c640'; g.beginPath(); g.arc(0, -20, 4, 0, 6.283); g.fill(); g.stroke(); }
        else if (a.item === 'cái nón') { g.fillStyle = '#b57a22'; g.beginPath(); g.moveTo(-26, -4); g.lineTo(26, -4); g.lineTo(0, -34); g.closePath(); g.fill(); g.stroke(); }
        else { g.fillStyle = '#5b2f1f'; for (const dx of [-14, 12]) { g.beginPath(); g.ellipse(dx, -6, 11, 5, 0, 0, 6.283); g.fill(); g.stroke(); } }
        const k = (C4.t * 1.6) % 1; g.strokeStyle = `rgba(255,243,196,${1 - k})`; g.lineWidth = 3; g.beginPath(); g.arc(0, -16, 22 + k * 22, 0, 6.283); g.stroke();
        g.restore();
      } });
      continue;
    }
    items.push({ z: a.z, f: () => {
      if (a.kind === 'cat') { g.save(); g.translate(a.x, y - Math.abs(Math.sin(a.ph)) * 3); g.scale(a.face, 1); drawCatAt(g, 0, 0, s * .8, 'watch'); g.restore(); return; }
      c4Critter(g, a, a.x, y, s);
      if (a.kind === 'mouse' && (a.hatCol || a.thief)) {
        const k = s * .92 * (C4_MOUSE_SORTS[a.sort].role === 'child' ? .68 : 1);
        g.save(); g.translate(a.x, y); g.scale(a.face * k, k); c4NonCol(g, a.thief ? '#2a221d' : a.hatCol);
        if (a.thief) { g.fillStyle = '#2a221d'; g.beginPath(); g.rect(2, -112, 66, 20); g.fill(); }   // a dark cloth over the face
        g.restore();
      }
    } });
    const tall = a.kind === 'mouse' ? 168 * .92 * (C4_MOUSE_SORTS[a.sort].role === 'child' ? .68 : 1) : a.kind === 'cat' ? 90 : C4_TALL[a.kind] || 70;
    head(a.x, a.z, tall * C4_CROWD, a, 2);
  }
  for (const w of C4.walkers) if (w.nvMsg && vis(w.x, 80)) {                // the one to give the word to wears a little letter over their head
    const s = c4S(w.z) * C4_CROWD, y = c4Y(w.z) - (168 * .92 + 34) * s + Math.sin(C4.t * 4) * 3;
    items.push({ z: w.z + .001, f: () => { g.save(); g.translate(w.x, y); g.scale(s * 1.3, s * 1.3); g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.rect(-14, -9, 28, 18); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-14, -9); g.lineTo(0, 3); g.lineTo(14, -9); g.stroke(); g.fillStyle = '#c8392d'; g.beginPath(); g.arc(0, 3, 3, 0, 6.283); g.fill(); g.restore(); } });
  }
}
