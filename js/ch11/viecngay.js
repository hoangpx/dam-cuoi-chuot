/* Chương XI · a day in the village (owner 2026-10-27: "mỗi NPC đều đang làm một việc nào đó, ở một chỗ có mục đích, thỉnh thoảng đi
   chơi đi dạo chứ không phải đứng bơ vơ; tạo các không gian khác nhau: cánh đồng, chuồng lợn, xây dựng, câu cá, chăn vịt, bón phân,
   tưới cây; NPC không phải lúc nào cũng có mặt đầy đủ").
   - A new place, Cánh đồng làng (north of the hamlet): paddies at four stages (just planted, young, lush, golden), a flooded field
     with ducks, vegetable beds, a pig pen with a shed, a house going up (frame, scaffolding, bricks), a scarecrow, a well.
   - Every villager has a job (c11JobOf: by trade, hand-set for the people of the stories): an act done at a station of a place
     (C11_JOBS: rectangles per place and act). c11Plan(p) says where they are and what they do now: asleep, away for the day
     (~1 day in 10: visiting kin, the district market, ill), chores at their door in the early morning, work, lunch indoors or a sit,
     work, an evening out (tea stall, chess at the đình, fishing, a stroll), indoors at night; a rest day a week.
   - At work they walk to their spot and do it (a pose and a tool drawn on the mouse: hoe, sickle, seedlings, watering can, bucket,
     basket, duck pole and flock, hammer and anvil, broom, book, chessboard, wash basin, cooking pot, loom basket, wares on a mat,
     a shuttlecock, a pole with two baskets, a staff, the mõ), and now and then put it down for a short stroll and come back.
   This replaces the old wandering-round-an-anchor villagers of langxa.js. */

/* ---------- the field place ---------- */
const C11_DONG = (() => {
  const m = c11Grid(30, 20);
  for (const [x0, y0, x1, y1] of [[2, 2, 6, 8], [8, 2, 11, 8], [13, 2, 17, 8], [19, 2, 22, 8], [2, 12, 7, 17]]) c11Fill(m, x0, y0, x1, y1, 'r');
  for (const y of [12, 14, 16]) c11Fill(m, 9, y, 13, y, 'x');
  c11Fill(m, 16, 13, 20, 16, 'n'); c11Fill(m, 21, 13, 22, 14, 'M');
  c11Fill(m, 26, 3, 28, 5, 'A'); m[7][23] = 'W'; m[4][24] = 'W'; m[5][10] = 'F';
  c11Fill(m, 1, 10, 28, 10, 'p'); c11Fill(m, 25, 6, 25, 18, 'p'); m[19][25] = 'E';
  m[11][14] = 'K'; m[13][27] = 'H'; m[17][23] = 'H';
  for (const [x, y] of [[14, 14], [24, 12], [28, 8], [23, 2], [27, 17], [8, 15], [1, 4], [1, 15]]) if (m[y][x] === 'g') m[y][x] = 't';
  return m;
})();
const C11_FIELDS = { dong: [{ r: [2, 2, 6, 8], st: 1 }, { r: [8, 2, 11, 8], st: 3 }, { r: [13, 2, 17, 8], st: 0 }, { r: [19, 2, 22, 8], st: 2 }, { r: [2, 12, 7, 17], st: -1 }] };
c11Fill(C11_XOM, 25, 1, 25, 8, 'p'); C11_XOM[0][25] = 'E';                        // the hamlet's new way out, north to the fields
C11_AREAS.lang.exits['25,0'] = ['dong', 25.5, 18.2, '↑ Cánh đồng']; C11_AREAS.lang.lane.push([[[25, -.5], [25, 9]], .8]);
C11_AREAS.dong = { id: 'dong', name: 'Cánh đồng làng', map: C11_DONG, treeAt: { '14,14': 'xoai', '24,12': 'xoai', '28,8': 'cau', '23,2': 'dua', '27,17': 'banana', '8,15': 'willow', '1,4': 'bamboo', '1,15': 'bamboo' }, houses: [], stalls: [],
  exits: { '25,19': ['lang', 25.5, 1.6, '↓ Xóm làng'] }, lane: [[[[.5, 10], [28.5, 10]], .8], [[[25, 5.6], [25, 19.5]], .8]], pond: { x: 4.5, y: 14.6, rx: 1.8, ry: 1.4 },
  decor: { site: [27.5, 6], shed: [22, 15], pen: [16, 13, 20, 16], trough: [18, 13.35] } };
C11_BEASTS.dong = [['lon', 17.5, 14.6, null, 1], ['lon', 19.5, 15.6, null, 1], ['lon', 18.5, 13.8, null, 1], ['trau', 21.5, 11.6], ['bo', 26.5, 12.6], ['ga', 15.5, 11.6, '#c119a5a'], ['trong', 23.5, 9.6]];
C11_SPOTS.dong = [[5, 10], [12, 10], [20, 10], [25, 12], [25, 16], [15, 9], [27, 9]];
const c11FieldSt = (x, y) => { const F = (C11_FIELDS[C11_AR.id] || []).find(f => x >= f.r[0] && x <= f.r[2] && y >= f.r[1] && y <= f.r[3]); return F ? F.st : 2; };

/* ---------- jobs and where they are done ---------- */
const C11_JOBS = {
  lang: { tuoi: [[6, 3, 7, 4], [11, 4, 13, 5]], nau: [[11, 7, 12, 7], [20, 15, 21, 16], [24, 15, 25, 16]], det: [[6, 7, 7, 8], [16, 15, 17, 16]], quet: [[2, 10, 8, 11], [16, 10, 24, 11]],
    ngoi: [[2, 8, 4, 8], [11, 12, 13, 13], [16, 6, 18, 7]], choi: [[5, 10, 9, 11], [19, 15, 24, 15], [6, 17, 8, 18]], giat: [[3, 11, 6, 11], [3, 16, 6, 16]] },
  dinh: { quet: [[6, 6, 17, 10]], doc: [[6, 9, 8, 10], [16, 6, 17, 7]], co: [[13, 9, 15, 10]], ngoi: [[9, 9, 11, 10], [18, 9, 20, 11]], canh: [[11, 12, 11, 12], [13, 12, 13, 12]], cau: [[3, 11, 7, 11]], choi: [[7, 8, 16, 10]] },
  ben: { cau: [[2, 8, 9, 8], [13, 8, 20, 8]], giat: [[4, 8, 8, 8]], mocua: [[15, 8, 21, 8]], do: [[11, 9, 12, 10]], det: [[6, 6, 8, 6]], ngoi: [[13, 4, 16, 5]] },
  cho: { ban: [[2, 8, 18, 8]], ren: [[3, 13, 5, 13]], ngoi: [[7, 10, 9, 11], [11, 10, 12, 12]], doc: [[12, 8, 13, 8]] },
  dong: { cay: [[13, 2, 17, 8]], gat: [[8, 2, 11, 8]], cuoc: [[2, 2, 6, 8]], hai: [[2, 2, 6, 8]], bon: [[19, 2, 22, 8]], tuoi: [[9, 13, 13, 13], [9, 15, 13, 15], [9, 17, 13, 17]],
    chan_vit: [[2, 12, 7, 17]], cho_lon: [[16, 12, 20, 12]], xay: [[26, 6, 28, 6], [24, 5, 24, 6]], ganh: [[23, 8, 26, 6]], ngoi: [[26, 14, 28, 16]], mocua: [[2, 11, 7, 11]], choi: [[13, 9, 22, 9]] },
};
const C11_ACT_NAME = { cay: 'đang cấy lúa', gat: 'đang gặt lúa', cuoc: 'đang cuốc đất', hai: 'đang nhổ cỏ', bon: 'đang bón phân', tuoi: 'đang tưới rau', cho_lon: 'đang cho lợn ăn', chan_vit: 'đang chăn vịt', xay: 'đang dựng nhà', ganh: 'đang gánh gạch', cau: 'đang câu cá', giat: 'đang giặt đồ', mocua: 'đang mò cua', do: 'đang chở đò', det: 'đang đan dệt', nau: 'đang nấu', quet: 'đang quét sân', doc: 'đang đọc sách', co: 'đang đánh cờ', ngoi: 'đang ngồi chơi', ban: 'đang bán hàng', ren: 'đang rèn', canh: 'đang canh gác', mo: 'đang đi rao mõ', choi: 'đang chơi', dao: 'đang đi dạo' };
const C11_MOVER = { dao: 1, mo: 1, chan_vit: 1, ganh: 1 }, C11_CARRY = { chan_vit: 1, ganh: 1, canh: 1, mo: 1 }, C11_SIT = { cau: 1, doc: 1, co: 1, ngoi: 1, det: 1 };
const C11_JOB_TRADE = {
  'chài lưới': ['ben', 'cau'], 'kéo vó': ['ben', 'cau'], 'lái đò': ['ben', 'do'], 'thợ gốm': ['ben', 'det'], 'mò cua bắt ốc': ['ben', 'mocua'], 'thầy lang': ['cho', 'ban'],
  'thợ mộc': ['dong', 'xay'], 'thợ nhuộm': ['lang', 'nau'], 'dệt vải': ['lang', 'det'], 'đan rổ rá': ['lang', 'det'], 'nấu rượu': ['lang', 'nau'], 'làm đậu phụ': ['lang', 'nau'], 'ươm tơ': ['lang', 'nau'], 'làm tương': ['lang', 'nau'],
  'tuần đinh': ['dinh', 'canh'], 'phó lý': ['dinh', 'doc'], 'kiếm củi': ['dong', 'ganh'], 'hái thuốc': ['dong', 'hai'], 'ngồi lê đôi mách': ['lang', 'ngoi'], 'trông cháu': ['lang', 'ngoi'], 'têm trầu': ['dinh', 'ngoi'],
  'kể chuyện cổ': ['dinh', 'ngoi'], 'đánh cờ tướng': ['dinh', 'co'], 'làm vườn': ['lang', 'tuoi'], 'chăn trâu': ['dong', 'chan_vit'], 'đi học chữ': ['dinh', 'doc'], 'trông em': ['lang', 'choi'], 'bắt cua': ['dong', 'mocua'],
  'thả diều': ['dong', 'choi'], 'vợ cả cụ Bá': ['dinhba', 'ngoi'], 'đầy tớ nhà cụ Bá': ['dinhba', 'quet'], 'thợ phụ lò rèn': ['cho', 'ren'], 'dệt vải, mò cua': ['ben', 'giat'],
};
const C11_JOB_STORY = { hac: ['lang', 'tuoi'], giao: ['dinh', 'doc'], dau: ['dong', 'cay'], chidau: ['cho', 'ban'], ti: ['lang', 'choi'], tho: ['cho', 'ren'], chuc: ['cho', 'ngoi'], tu: ['dinh', 'quet'], do: ['cho', 'doc'], lanh: ['lang', 'det'],
  kieu: ['lang', 'ngoi'], xuan: ['cho', 'dao'], tugoa: ['dong', 'cho_lon'], dong: ['cho', 'ngoi'], mo: ['lang', 'mo'], ba: ['dinh', 'ngoi'], baba: ['cho', 'dao'], cuong: ['cho', 'dao'], tao: ['dinh', 'doc'], chi: ['lang', 'dao'], thi: ['ben', 'giat'], cothi: ['cho', 'ban'] };
const C11_FARMHAND = ['cay', 'cuoc', 'gat', 'bon', 'tuoi', 'cho_lon', 'chan_vit', 'xay', 'ganh', 'hai', 'cay', 'gat'];
function c11JobOf(p) {
  if (p._job) return p._job;
  let j = C11_JOB_STORY[p.id] || C11_JOB_TRADE[p.trade];
  if (j && p.trade === 'đầy tớ nhà cụ Bá' && p.n % 2) j = ['dinhba', 'tuoi'];          // one sweeps the yard, one waters the flowers
  if (j && j[1] === 'chan_vit' && p.role === 'c' && c11Hash(p.n, 4, 23) < .6) j = ['dong', 'choi'];   // not every herd-boy has ducks: most play on the dikes
  if (!j && (p.trade === 'tá điền' || p.trade === 'cày thuê')) j = ['dong', C11_FARMHAND[Math.floor(c11Hash(p.n, 4, 19) * C11_FARMHAND.length)]];
  if (!j && p.work === 'cho') j = ['cho', 'ban'];
  if (!j) j = [p.work || 'lang', p.role === 'c' ? 'choi' : 'dao'];
  return (p._job = { a: j[0], act: j[1] });
}

/* ---------- the day of one villager ---------- */
const C11_LEISURE = { c: [['lang', 'choi'], ['dong', 'choi'], ['dinh', 'choi'], ['ben', 'dao']], o: [['dinh', 'co'], ['dinh', 'ngoi'], ['lang', 'ngoi'], ['ben', 'cau']], a: [['lang', 'ngoi'], ['lang', 'dao'], ['dinh', 'ngoi'], ['ben', 'cau'], ['cho', 'dao'], ['dong', 'dao'], ['dinh', 'co']] };
const C11_CHORE = ['quet', 'tuoi', 'ngoi', 'nau', 'giat', 'quet'];
function c11Plan(p, day = SAVE11.day, mins = SAVE11.mins) {
  const h = mins / 60, r = k => c11Hash(p.n, day, k), home = p.home.a === 'out' ? null : p.home.a, J = c11JobOf(p);
  if (h < p.wake || h >= p.sleep) return null;
  if (p.stall) return h >= 6 && h < 20 ? { a: p.work, act: 'ban', key: 'stall' } : null;
  if (r(91) < .1) return null;                                                       // away for the day
  const mk = (a, act, spot) => ({ a, act, spot: spot || '', key: a + '|' + act + '|' + (spot || '') });
  const work = () => mk(J.a, J.act, J.a === home && (J.act === 'nau' || J.act === 'det') ? 'home' : '');
  const chore = k => home ? mk(home, C11_CHORE[Math.floor(r(k) * C11_CHORE.length)], 'home') : null;
  const leisure = k => { const L = C11_LEISURE[p.role] || C11_LEISURE.a, l = L[Math.floor(r(k) * L.length)]; return mk(l[0], l[1]); };
  const rest = (day + p.n) % 7 === 3;
  // everyone keeps their own clock (owner: they came onto the field in a crowd): each change of the day moves by up to an hour per person
  const t1 = p.wake + 1 + r(61) * 1.2, t2 = 11 + r(62) * .9, t3 = 12.9 + r(63) * .9, t4 = 16.8 + r(64) * 1.2, t5 = 19 + r(65) * 1.2;
  if (h < t1) return r(10) < .65 ? chore(11) : null;
  if (p.role === 'c') {
    if (h < t2) return J.act === 'doc' ? work() : rest ? leisure(20) : work();
    if (h < t3) return r(12) < .6 ? null : chore(13);
    if (h < t4) return r(14) < .5 ? leisure(21) : (J.act === 'doc' ? leisure(22) : work());
    return h < t5 ? leisure(23) : r(15) < .6 ? null : chore(16);
  }
  if (h < t2) return rest ? leisure(20) : work();
  if (h < t3) return r(12) < .55 ? null : r(13) < .5 ? mk(J.a, 'ngoi') : chore(13);
  if (h < t4) return rest ? leisure(21) : work();
  if (h < t5) return r(15) < .7 ? leisure(22) : chore(16);
  return r(17) < .55 ? null : chore(18);
}
function c11Where(p, day, mins) { const pl = c11Plan(p, day, mins); return pl ? pl.a : null; }
function c11Why(p) { const h = SAVE11.mins / 60; return h < p.wake || h >= p.sleep ? 'đang ngủ' : p.home.a === 'out' ? 'đã về xóm ngoài' : c11Hash(p.n, SAVE11.day, 91) < .1 ? 'hôm nay đi vắng' : 'đang ở trong nhà'; }
/* the exact spot: near their door for chores, else a point of a station of that act in that place, on a tile one can stand on */
function c11Fix(tx, ty) { for (let rr = 0; rr < 6; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if ((Math.abs(dx) === rr || Math.abs(dy) === rr) && c11WalkTile(tx + dx, ty + dy)) return [tx + dx, ty + dy]; return [tx, ty]; }
function c11GoalOf(p, pl) {
  if (C11_MOVER[pl.act]) return null;
  const r = k => c11Hash(p.n, SAVE11.day, k);
  let tx, ty;
  if (pl.spot === 'home') { const hs = C11_HOUSES[p.home.key]; if (hs) { tx = Math.floor(hs.x + (r(31) - .5) * hs.w * 1.4); ty = hs.y + (r(32) < .7 ? 0 : 1); } else { const sp = C11_SPOTS[pl.a] || [[8, 8]]; [tx, ty] = sp[0]; } }
  else { const L = (C11_JOBS[pl.a] || {})[pl.act]; if (!L) return null; const R = L[Math.floor(r(33) * L.length)]; tx = R[0] + Math.floor(r(34) * (R[2] - R[0] + 1)); ty = R[1] + Math.floor(r(35) * (R[3] - R[1] + 1)); }
  [tx, ty] = c11Fix(tx, ty);
  return { x: tx + .25 + r(36) * .5, y: ty + .55 + r(37) * .2, face: r(38) < .5 ? -1 : 1 };
}

/* ---------- moving about (replaces the wandering of langxa.js) ---------- */
const c11WalkTile = (x, y) => x > 0 && y > 0 && x < C11_W - 1 && y < C11_H - 1 && 'gpqbrx'.includes(c11Kind(x, y));
function c11Near(ax, ay, r) {
  for (let i = 0; i < 12; i++) { const x = Math.round(ax + (Math.random() * 2 - 1) * r), y = Math.round(ay + (Math.random() * 2 - 1) * r * .7); if (c11WalkTile(x, y)) return [x, y]; }
  return c11Fix(Math.round(ax), Math.round(ay));
}
/* the next place on the way from one place to another (a breadth-first search over the ways out), so folk cross the right places */
function c11NextHop(from, to) {
  if (from === to) return to; const prev = { [from]: null }, q = [from];
  for (let i = 0; i < q.length; i++) for (const ex of Object.values(C11_AREAS[q[i]].exits)) { const n = ex[0]; if (n in prev || n === 'ruong' || n === 'rung') continue; prev[n] = q[i]; if (n === to) { let c = n; while (prev[c] !== from) c = prev[c]; return c; } q.push(n); }
  return 'lang';
}
function c11ExitTile(to) {
  if (to === 'out') { if (C11_AR.outExit) return C11_AR.outExit; to = 'lang'; }
  const hop = C11_AREAS[to] ? c11NextHop(C11_AR.id, to) : 'lang', E = Object.entries(C11_AR.exits), f = E.find(([, v]) => v[0] === hop) || E.find(([, v]) => v[0] === 'lang') || E[0];
  return f ? f[0].split(',').map(Number) : null;
}
function c11NpcGo(v, tx, ty) {
  const sx = Math.max(0, Math.min(C11_W - 1, Math.floor(v.x))), sy = Math.max(0, Math.min(C11_H - 1, Math.floor(v.y - .01))), d = c11Dist(sx, sy);
  if (!d[ty] || d[ty][tx] < 0) return false; v.path = c11Route(d, tx, ty); return true;
}
function c11SellerOn(p) { const st = C11_AR.stalls.find(s => s.kind === p.stall); if (!st) return; C11.sellers[p.stall] = { p, x: st.x0 + 1.5, y: st.by + .92, ph: 0 }; if (p.stall === 'N') C11.seller = C11.sellers.N; }
const c11StallHere = p => p.stall && C11_AR.stalls.some(s => s.kind === p.stall);
function c11GoTo(v) {
  const G = v.goal; if (!G) return;
  const [tx, ty] = c11Fix(Math.floor(G.x), Math.floor(G.y - .01));
  if (Math.hypot(tx + .5 - v.x, ty + .6 - v.y) < .2 || !c11NpcGo(v, tx, ty)) { v.path = []; }
  v.atGoal = false;
}
function c11Arrive(v) { v.atGoal = true; v.doing = v.plan.act; if (v.goal && v.goal.face) v.face = v.goal.face; v.workT = 20 + Math.random() * 45; }
function c11SetPlan(v, pl, here) {
  v.plan = pl; v.doing = null; v.atGoal = false; v.path = null; v.glide = null; v.brk = false; v.goal = c11GoalOf(v.p, pl);
  if (pl.act === 'chan_vit' && !v.ducks) v.ducks = Array.from({ length: 6 }, (_, i) => ({ x: v.x + (i % 3) * .4, y: v.y + (i / 3 | 0) * .4, face: 1, ph: i }));
  if (here) { if (v.goal) { v.x = v.goal.x; v.y = v.goal.y; c11Arrive(v); } else v.doing = C11_CARRY[pl.act] ? pl.act : null; if (v.ducks) v.ducks.forEach((d, i) => { d.x = v.x + .6 + (i % 3) * .4; d.y = v.y - .2 + (i / 3 | 0) * .4; }); }
}
function c11NpcAdd(p, pl, at) {
  const t = at || c11Near(...(C11_SPOTS[C11.area] || [[8, 8]])[0], 3); if (!t) return;
  const v = { p, x: t[0] + .5, y: t[1] + .6, face: Math.random() < .5 ? -1 : 1, ph: 0, moving: false, path: null, wait: 0, leaving: false, sp: p.role === 'c' ? 1.5 : p.role === 'o' ? .8 : 1.15 };
  C11.vill.push(v); c11SetPlan(v, pl, !at);
}
function c11VillEnter() {
  C11.sellers = {}; C11.vill = []; C11.seller = null; C11.vLast = {}; C11.vT = 1;
  for (const p of C11_PPL) {
    const pl = c11Plan(p), w = pl ? pl.a : null; C11.vLast[p.id] = w;
    if (w !== C11.area) continue;
    if (c11StallHere(p)) c11SellerOn(p); else c11NpcAdd(p, pl, null);
  }
}
function c11VillCheck() {
  const a = C11.area;
  for (const p of C11_PPL) {
    const pl = c11Plan(p), w = pl ? pl.a : null, was = C11.vLast[p.id]; C11.vLast[p.id] = w;
    if (c11StallHere(p)) { if (w === a && !C11.sellers[p.stall]) c11SellerOn(p); else if (w !== a && C11.sellers[p.stall]) delete C11.sellers[p.stall]; continue; }
    const v = C11.vill.find(q => q.p === p);
    if (w === a && !v) {
      const door = (was === null || was === undefined) && p.home.a === a && C11_HOUSES[p.home.key];
      c11NpcAdd(p, pl, door ? c11Fix(Math.floor(p.home.x), Math.floor(p.home.y)) : c11ExitTile(was === null || was === undefined ? p.home.a : was));
    } else if (w !== a && v && !v.leaving) {
      v.leaving = true; v.doing = null; v.wait = Math.min(v.wait, .4); v.glide = null;
      const t = w === null && p.home.a === a && C11_HOUSES[p.home.key] ? c11Fix(Math.floor(p.home.x), Math.floor(p.home.y)) : c11ExitTile(w === null ? p.home.a : w);
      if (!t || !c11NpcGo(v, t[0], t[1])) C11.vill.splice(C11.vill.indexOf(v), 1);
    } else if (v && !v.leaving && pl && (!v.plan || v.plan.key !== pl.key)) c11SetPlan(v, pl, false);
  }
}
function c11VillUpdate(dt) {
  const G = C11; G.vT = (G.vT || 0) - dt; if (G.vT <= 0) { G.vT = 1; c11VillCheck(); }
  for (let i = G.vill.length - 1; i >= 0; i--) {
    const v = G.vill[i], act = v.plan ? v.plan.act : 'dao', slow = act === 'chan_vit' ? .45 : act === 'ganh' ? .8 : 1; v.moving = false;
    if (v.ducks) for (const [j, d] of v.ducks.entries()) { const tx = v.x + v.face * (.7 + (j % 3) * .38), ty = v.y - .25 + (j / 3 | 0) * .42 + Math.sin(G.t * .7 + j) * .08, ex = tx - d.x, ey = ty - d.y, dd = Math.hypot(ex, ey); if (dd > .05) { const st = Math.min(dd, (dd > .6 ? .9 : .35) * dt); d.x += ex / dd * st; d.y += ey / dd * st; if (Math.abs(ex) > .02) d.face = ex > 0 ? 1 : -1; } }
    if (v.wait > 0) { v.wait -= dt; continue; }
    if (v.path && v.path.length) {
      const [cx, cy] = v.path[0], tx = cx + .5, ty = cy + .6, ex = tx - v.x, ey = ty - v.y, d = Math.hypot(ex, ey), st = v.sp * slow * dt;
      if (d <= st) { v.x = tx; v.y = ty; v.path.shift(); } else { v.x += ex / d * st; v.y += ey / d * st; if (Math.abs(ex) > .02) v.face = ex > 0 ? 1 : -1; }
      v.moving = true; v.ph += dt * 7 * v.sp * slow; continue;
    }
    if (v.glide) {
      const ex = v.glide.x - v.x, ey = v.glide.y - v.y, d = Math.hypot(ex, ey), st = v.sp * .8 * dt;
      if (d <= st) { v.x = v.glide.x; v.y = v.glide.y; v.glide = null; if (!v.brk && v.plan && !C11_MOVER[v.plan.act]) c11Arrive(v); } else { v.x += ex / d * st; v.y += ey / d * st; if (Math.abs(ex) > .02) v.face = ex > 0 ? 1 : -1; v.moving = true; v.ph += dt * 6; }
      continue;
    }
    if (v.leaving) { G.vill.splice(i, 1); continue; }
    if (v.path) {                                                                    // a walk just ended
      v.path = null;
      if (v.brk) { v.brk = false; v.wait = 3 + Math.random() * 5; continue; }        // a short stroll: stand a moment, then back to work
      if (v.goal && !v.atGoal) { v.glide = { x: v.goal.x, y: v.goal.y }; continue; }
      if (C11_MOVER[act]) { v.wait = act === 'ganh' ? 1.5 : 2 + Math.random() * 5; continue; }
    }
    if (C11_MOVER[act]) {                                                             // those whose work is walking: strolls, the mõ, the ducks, the pole of bricks
      v.doing = C11_CARRY[act] ? act : null;
      let t = null;
      if (act === 'chan_vit' || act === 'ganh') { const L = (C11_JOBS[v.plan.a] || {})[act]; if (L) { const R = L[0]; if (act === 'ganh') { v.leg = !v.leg; t = v.leg ? [R[0], R[1]] : [R[2], R[3]]; } else t = c11Fix(R[0] + Math.floor(Math.random() * (R[2] - R[0] + 1)), R[1] + Math.floor(Math.random() * (R[3] - R[1] + 1))); } }
      if (!t) { const sp = C11_SPOTS[G.area] || [[8, 8]], a0 = sp[Math.floor(Math.random() * sp.length)]; t = c11Near(a0[0], a0[1], 3); }
      if (!t || !c11NpcGo(v, t[0], t[1])) v.wait = 2 + Math.random() * 3;
      continue;
    }
    if (!v.atGoal) { if (v.goal) c11GoTo(v); else { v.doing = null; v.wait = 3; } continue; }
    v.workT -= dt;
    if (v.workT <= 0) {                                                               // now and then: put the work down and stroll a few steps
      const g0 = v.goal, t = c11Near(Math.floor(g0.x), Math.floor(g0.y), 2.5);
      v.workT = 25 + Math.random() * 50;
      if (t && c11NpcGo(v, t[0], t[1])) { v.brk = true; v.atGoal = false; v.doing = null; }
    }
  }
}

/* ---------- art for the fields: rice hills at four stages, the house frame, bricks, a scarecrow, a trough ---------- */
let C11ART3 = null;
function c11Art3() {
  if (C11ART3) return C11ART3;
  const R = Math.max(2, RES), rnd = mulberry(0x51ce);
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  const blade = (g, x, h, lean, w, d, hue, sat = 50) => { const tx = x + lean, ty = -h, p = new Path2D(); p.moveTo(x - w, 0); p.quadraticCurveTo(x + lean * .25 - w * .4, -h * .55, tx, ty); p.quadraticCurveTo(x + lean * .3 + w * .5, -h * .5, x + w, 0); p.closePath(); const gr = g.createLinearGradient(x, 0, tx, ty); gr.addColorStop(0, hsl(hue + 6, sat, 16 + d * 6)); gr.addColorStop(.5, hsl(hue, sat, 30 + d * 10)); gr.addColorStop(1, hsl(hue - 10, sat + 8, 50 + d * 14)); g.fillStyle = gr; g.fill(p); };
  const rice = st => [0, 1].map(() => mk([-24, -50, 24, 6], g => {
    const n = [6, 10, 15, 13][st], h0 = [6, 15, 24, 22][st], h1 = [11, 23, 34, 30][st], spr = [4, 7, 10, 10][st], hue = [100, 102, 106, 60][st];
    const B = []; for (let i = 0; i < n; i++) B.push({ x: (rnd() - .5) * spr, h: h0 + rnd() * (h1 - h0), d: rnd() }); B.sort((a, b) => a.d - b.d);
    for (const b of B) blade(g, b.x * .3, b.h, b.x * 1.7 + (rnd() - .5) * 5, .9, b.d, hue + (st === 3 ? rnd() * 12 : 0), st === 3 ? 58 : 50);
    if (st === 3) for (let i = 0; i < 4; i++) { const x0 = (rnd() - .5) * 6, top = -h1 * (.85 + rnd() * .15), dir = rnd() < .5 ? -1 : 1, ex = x0 + dir * (8 + rnd() * 6), ey = top + 9; g.strokeStyle = hsl(50, 60, 48); g.lineWidth = .9; g.beginPath(); g.moveTo(x0, top + 12); g.quadraticCurveTo(x0 + dir * 2, top - 3, ex, ey); g.stroke(); for (let j = 0; j < 6; j++) { const t = .3 + j * .12, gx = x0 + (ex - x0) * t + dir * Math.sin(t * 3) * 2, gy = top + 12 * (1 - t) - 3 * Math.sin(t * 3.14) + 9 * t * t; const gr = g.createRadialGradient(gx - .5, gy - .5, 0, gx, gy, 1.8); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(1, '#c8962e'); g.fillStyle = gr; g.beginPath(); g.ellipse(gx, gy, 1.1, 1.8, dir * .6, 0, 6.283); g.fill(); } }
    if (st === 2) for (let i = 0; i < 2; i++) { const x0 = (rnd() - .5) * 6, top = -h1 - 2; g.fillStyle = hsl(70, 40, 70); g.beginPath(); g.ellipse(x0, top, 1.2, 4, .1, 0, 6.283); g.fill(); }
  }));
  const wood = (g, x0, y0, x1, y1, w) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w, ny = dx / L * w, p = new Path2D(); p.moveTo(x0 + nx, y0 + ny); p.lineTo(x1 + nx, y1 + ny); p.lineTo(x1 - nx, y1 - ny); p.lineTo(x0 - nx, y0 - ny); p.closePath(); const gr = g.createLinearGradient(x0 + nx, y0 + ny, x0 - nx, y0 - ny); gr.addColorStop(0, '#c89a62'); gr.addColorStop(1, '#6a4422'); g.fillStyle = gr; g.fill(p); g.strokeStyle = 'rgba(30,18,8,.4)'; g.lineWidth = .6; g.stroke(p); };
  const bamboo = (g, x0, y0, x1, y1) => { g.strokeStyle = '#5e7a34'; g.lineWidth = 4.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#b8c87a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0 - 1, y0); g.lineTo(x1 - 1, y1); g.stroke(); };
  const brickRow = (g, x0, x1, y, h, off) => { for (let x = x0 + off; x < x1; x += 16) { const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, '#d0784a'); gr.addColorStop(1, '#8a3e22'); g.fillStyle = gr; g.fillRect(x, y - h, Math.min(15, x1 - x), h - 1); } };
  const frame = mk([-118, -214, 118, 10], g => {
    for (let r = 0; r < 3; r++) brickRow(g, -96, 96, -r * 8, 8, r % 2 ? 0 : 8);
    for (const x of [-90, -30, 30, 90]) wood(g, x, 0, x, -132, 4);
    wood(g, -100, -132, 100, -132, 4); wood(g, -96, -84, 96, -84, 2.6);
    for (const x of [-100, -50, 0, 50, 100]) wood(g, x, -132, x * .02, -202, 2.4);
    wood(g, -6, -202, 6, -202, 3);
    for (let y = -140; y > -196; y -= 12) { const f = (-132 - y) / 70; wood(g, -100 + f * 98, y, -6 - f * 2, y, 1.4); }
    for (const sg of [-1, 1]) { bamboo(g, sg * 108, 6, sg * 106, -152); bamboo(g, sg * 112, -60, sg * 74, -60); bamboo(g, sg * 112, -112, sg * 74, -112); }
    wood(g, 58, 2, 82, -126, 2.2); wood(g, 70, 2, 94, -126, 2.2); for (let i = 1; i < 9; i++) wood(g, 58 + i * 2.7, 2 - i * 14, 70 + i * 2.7, 2 - i * 14, 1.2);
    g.fillStyle = 'rgba(14,30,18,.35)'; g.beginPath(); g.ellipse(0, 4, 112, 8, 0, 0, 6.283); g.fill();
  });
  const bricks = mk([-38, -44, 38, 8], g => { g.fillStyle = 'rgba(14,30,18,.35)'; g.beginPath(); g.ellipse(2, 4, 36, 7, 0, 0, 6.283); g.fill(); for (let r = 0; r < 4; r++) brickRow(g, -32 + r * 6, 32 - r * 6, -r * 9, 9, r % 2 ? 8 : 0); });
  const scare = mk([-34, -118, 34, 8], g => {
    wood(g, 0, 4, 0, -96, 2); wood(g, -28, -72, 28, -72, 1.8);
    const shirt = new Path2D(); shirt.moveTo(-24, -76); shirt.lineTo(24, -76); shirt.lineTo(16, -36); shirt.lineTo(10, -30); shirt.lineTo(-10, -30); shirt.lineTo(-16, -36); shirt.closePath(); const gr = g.createLinearGradient(-24, 0, 24, 0); gr.addColorStop(0, '#6a7aa8'); gr.addColorStop(1, '#2c3458'); g.fillStyle = gr; g.fill(shirt);
    for (const sg of [-1, 1]) for (let i = 0; i < 5; i++) { g.strokeStyle = '#e0c46e'; g.lineWidth = 1; g.beginPath(); g.moveTo(sg * 26, -72); g.lineTo(sg * (32 + i), -66 + i * 3); g.stroke(); }
    const hg = g.createRadialGradient(-3, -90, 0, 0, -86, 10); hg.addColorStop(0, '#f2dc8a'); hg.addColorStop(1, '#a8862e'); g.fillStyle = hg; g.beginPath(); g.arc(0, -86, 9, 0, 6.283); g.fill();
    const ng = g.createLinearGradient(-22, 0, 22, 0); ng.addColorStop(0, '#f2d890'); ng.addColorStop(1, '#a07a30'); g.fillStyle = ng; g.beginPath(); g.moveTo(-22, -92); g.lineTo(22, -92); g.lineTo(0, -112); g.closePath(); g.fill();
  });
  const trough = mk([-36, -16, 36, 6], g => { const p = new Path2D(); p.moveTo(-32, -12); p.lineTo(32, -12); p.lineTo(28, 2); p.lineTo(-28, 2); p.closePath(); const gr = g.createLinearGradient(0, -12, 0, 2); gr.addColorStop(0, '#b88a56'); gr.addColorStop(1, '#5a3a1c'); g.fillStyle = gr; g.fill(p); g.fillStyle = '#6a5a2a'; g.beginPath(); g.ellipse(0, -11, 28, 2.6, 0, 0, 6.283); g.fill(); });
  /* a plant that died of thirst: dry brown stalks bent over, a few fallen leaves */
  const dead = [0, 1].map(() => mk([-30, -46, 30, 6], g => {
    g.fillStyle = 'rgba(14,30,18,.3)'; g.beginPath(); g.ellipse(2, 2, 18, 4, 0, 0, 6.283); g.fill();
    for (let i = 0; i < 9; i++) { const x = (rnd() - .5) * 10, h = 16 + rnd() * 18, dir = rnd() < .5 ? -1 : 1, ex = x + dir * (10 + rnd() * 12), ey = -h * .45 + rnd() * 8; const gr = g.createLinearGradient(x, 0, ex, ey); gr.addColorStop(0, '#5a3e22'); gr.addColorStop(1, '#b89a62'); g.strokeStyle = gr; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + dir * 2, -h, ex, ey); g.stroke(); }
    for (let i = 0; i < 4; i++) { const x = (rnd() - .5) * 34, gr = g.createLinearGradient(x - 4, 0, x + 4, 0); gr.addColorStop(0, '#c8a868'); gr.addColorStop(1, '#7a5a30'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, -1, 4.5, 1.8, rnd() * 3, 0, 6.283); g.fill(); }
  }));
  return (C11ART3 = { rice: [0, 1, 2, 3].map(rice), frame, bricks, scare, trough, dead });
}
/* paddies, vegetable beds and the pig pen, painted into the background */
function c11BgFields(g, tiles, at, S, rnd) {
  const rect = (x0, y0, x1, y1) => { const [ax, ay] = at(x0, y0), [bx, by] = at(x1, y1); return [ax - S / 2, ay - S / 2, bx - ax + S, by - ay + S]; };
  for (const F of C11_FIELDS[C11_AR.id] || []) {                      // each paddy one sheet of water between its banks
    const [X, Y, W, H] = rect(...F.r), gold = F.st === 3, dry = F.st === 3 ? .6 : 0;
    const gr = g.createLinearGradient(X, Y, X + W * .4, Y + H); gr.addColorStop(0, gold ? '#bcaa6c' : '#a6c4a6'); gr.addColorStop(.6, gold ? '#a4925a' : '#88a890'); gr.addColorStop(1, gold ? '#8a7844' : '#6a8a76'); g.fillStyle = gr; g.fillRect(X, Y, W, H);
    g.strokeStyle = `rgba(235,248,255,${.22 - dry * .15})`; g.lineCap = 'round'; for (let i = 0, n = W * H / 700; i < n; i++) { const ox = X + rnd() * W, oy = Y + rnd() * H, L = 6 + rnd() * 12; g.lineWidth = .8 + rnd(); g.beginPath(); g.moveTo(ox - L, oy); g.quadraticCurveTo(ox, oy - 1.5, ox + L, oy + .6); g.stroke(); }
    let sg = g.createLinearGradient(0, Y, 0, Y + 9); sg.addColorStop(0, 'rgba(40,46,24,.55)'); sg.addColorStop(1, 'rgba(40,46,24,0)'); g.fillStyle = sg; g.fillRect(X, Y, W, 9);
    sg = g.createLinearGradient(X, 0, X + 9, 0); sg.addColorStop(0, 'rgba(40,46,24,.5)'); sg.addColorStop(1, 'rgba(40,46,24,0)'); g.fillStyle = sg; g.fillRect(X, Y, 9, H);
    sg = g.createLinearGradient(0, Y + H, 0, Y + H - 6); sg.addColorStop(0, 'rgba(236,220,170,.5)'); sg.addColorStop(1, 'rgba(236,220,170,0)'); g.fillStyle = sg; g.fillRect(X, Y + H - 6, W, 6);
    sg = g.createLinearGradient(X + W, 0, X + W - 6, 0); sg.addColorStop(0, 'rgba(236,220,170,.45)'); sg.addColorStop(1, 'rgba(236,220,170,0)'); g.fillStyle = sg; g.fillRect(X + W - 6, Y, 6, H);
    g.strokeStyle = '#6a5434'; g.lineWidth = 2.4; g.strokeRect(X, Y, W, H);
  }
  c11BgGarden(g, tiles, at, S, rnd);
  const D = C11_AR.decor;
  if (D && D.pen) {                                                   // the pig pen: trodden mud with puddles and straw
    const [X, Y, W, H] = rect(...D.pen), gr = g.createLinearGradient(X, Y, X + W, Y + H); gr.addColorStop(0, '#a0805a'); gr.addColorStop(1, '#6a4e30'); g.fillStyle = gr; g.fillRect(X, Y, W, H);
    for (let i = 0; i < 7; i++) { const ex = X + rnd() * W, ey = Y + rnd() * H, pr = 8 + rnd() * 12, pg = g.createRadialGradient(ex - pr * .3, ey - pr * .3, 0, ex, ey, pr); pg.addColorStop(0, 'rgba(160,180,180,.55)'); pg.addColorStop(.7, 'rgba(70,54,34,.55)'); pg.addColorStop(1, 'rgba(70,54,34,0)'); g.fillStyle = pg; g.beginPath(); g.ellipse(ex, ey, pr * 1.4, pr, 0, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(232,206,120,.7)'; g.lineWidth = 1; for (let i = 0; i < 40; i++) { const ox = X + rnd() * W, oy = Y + rnd() * H, a = rnd() * 3; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * 6, oy + Math.sin(a) * 6); g.stroke(); }
  }
  for (const [x, y] of tiles('x')) {
    const [px, py] = at(x, y), x0 = px - S / 2 - (c11Kind(x - 1, y) === 'x' ? 1 : -4), x1 = px + S / 2 + (c11Kind(x + 1, y) === 'x' ? 1 : -4), y0 = py - S * .32, y1 = py + S * .36;
    g.fillStyle = 'rgba(30,40,20,.35)'; g.fillRect(x0 + 3, y1 - 2, x1 - x0, 6);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#b4844e'); gr.addColorStop(.5, '#8a5e36'); gr.addColorStop(1, '#5a3a1e'); g.fillStyle = gr; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, 8); g.fill();
    for (let i = 0; i < 8; i++) { g.fillStyle = rnd() < .5 ? 'rgba(220,180,120,.5)' : 'rgba(60,36,18,.45)'; g.beginPath(); g.arc(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), .8 + rnd() * 1.4, 0, 6.283); g.fill(); }
  }
}
/* rice hills on the paddies, vegetables on the beds */
function c11FieldE(E, g, x, y, sx, sy, k) {
  const kd = c11Kind(x, y), A3 = c11Art3();
  if (kd === 'y') { c11GardenE(E, g, x, y, sx, sy, k); return; }
  if (kd === 'r') {
    const st = c11FieldSt(x, y); if (st < 0) return;
    for (let i = 0; i < 4; i++) { const fx = x + .27 + (i % 2) * .46 + (c11Hash(x, y, 300 + i) - .5) * .08, fy = y + .4 + (i >> 1) * .44, spr = A3.rice[st][(c11Hash(x, y, 310 + i) * 2) | 0]; E.push({ y: fy, d: () => c11Lean(g, spr, sx(fx), sy(fy), k * .95, c11Wind(fx, fy) * .05 * (st + 1) + Math.sin(C11.t * 2 + fx * 4) * .02) }); }
  } else if (kd === 'x') {
    const ck = ['cai', 'muong', 'khoai'][Math.max(0, Math.min(2, (y - 12) >> 1))], A = c11Art();
    for (let i = 0; i < 2; i++) { const fx = x + .3 + i * .42, fy = y + .62, st = c11Hash(x, y, 320 + i) < .3 ? 2 : 3; E.push({ y: fy, d: () => c11Lean(g, A.crop[ck][st], sx(fx), sy(fy), k * 1.15, c11Wind(fx, fy) * .04) }); }
  }
}
/* the place's things: the house going up, bricks, the scarecrow, the pen's fence, shed and trough, and the herded ducks */
function c11Extras2(E, g, sx, sy, k, T) {
  const A3 = c11Art3(), D = C11_AR.decor || {}, t = C11.t;
  if (D.site) E.push({ y: D.site[1], d: () => c11Spr(g, A3.frame, sx(D.site[0]), sy(D.site[1]), k) });
  if (D.shed) E.push({ y: D.shed[1], d: () => { c11Shade(g, sx(D.shed[0]), sy(D.shed[1]), 70 * k, 10 * k); c11Spr(g, c11Art2().leu, sx(D.shed[0]), sy(D.shed[1]), k * .75); } });
  if (D.trough) E.push({ y: D.trough[1], d: () => c11Spr(g, A3.trough, sx(D.trough[0]), sy(D.trough[1]), k) });
  if (D.pen) {
    const [x0, y0, x1, y1] = D.pen, post = (X, Y) => { const gr = g.createLinearGradient(X - 3 * k, 0, X + 3 * k, 0); gr.addColorStop(0, '#c89a62'); gr.addColorStop(1, '#5a3a1c'); g.fillStyle = gr; g.fillRect(X - 3 * k, Y - 34 * k, 6 * k, 34 * k); };
    const rail = (Xa, Ya, Xb, Yb) => { for (const h of [12, 26]) { g.strokeStyle = '#6a7a34'; g.lineWidth = 3.4 * k; g.beginPath(); g.moveTo(Xa, Ya - h * k); g.lineTo(Xb, Yb - h * k); g.stroke(); g.strokeStyle = 'rgba(220,230,160,.6)'; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(Xa, Ya - h * k - 1); g.lineTo(Xb, Yb - h * k - 1); g.stroke(); } };
    const edge = (ax, ay, bx, by, sortY) => E.push({ y: sortY, d: () => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) * 2)); rail(sx(ax), sy(ay), sx(bx), sy(by)); for (let i = 0; i <= n; i++) post(sx(ax + (bx - ax) * i / n), sy(ay + (by - ay) * i / n)); } });
    edge(x0, y0, x1 + 1, y0, y0); edge(x0, y1 + 1, x1 + 1, y1 + 1, y1 + 1.01);
    for (let yy = y0; yy <= y1; yy++) { edge(x0, yy, x0, yy + 1, yy + 1); edge(x1 + 1, yy, x1 + 1, yy + 1, yy + 1); }
  }
  for (let y = 0; y < C11_H; y++) for (let x = 0; x < C11_W; x++) {
    const kd = C11_MAP[y][x];
    if (kd === 'W') E.push({ y: y + .9, d: () => c11Spr(g, A3.bricks, sx(x + .5), sy(y + .9), k) });
    else if (kd === 'F') E.push({ y: y + .9, d: () => c11Lean(g, A3.scare, sx(x + .5), sy(y + .9), k, Math.sin(t * 1.2) * .03 + c11Wind(x, y) * .03) });
  }
  c11Extras3(E, g, sx, sy, k, T);
  for (const v of C11.vill) if (v.ducks) for (const d of v.ducks) E.push({ y: d.y, d: () => { const wet = c11Kind(Math.floor(d.x), Math.floor(d.y - .01)) === 'r'; if (!wet) { g.fillStyle = 'rgba(29,25,21,.22)'; g.beginPath(); g.ellipse(sx(d.x), sy(d.y) + 2, 10 * k, 3 * k, 0, 0, 6.283); g.fill(); } c11Duck(g, sx(d.x), sy(d.y) + Math.sin(t * 3 + d.ph) * 1.2, T / 64 * .8, d.face, d.ph % 2 === 0); } });
}

/* ---------- drawing a villager at work ---------- */
const C11_WARES = [['#d8a040', '#7aa84a', '#c8402f'], ['#e8e0c8', '#c89a5e', '#8a6a4a'], ['#5f9a4c', '#9bc45e', '#e0b440'], ['#6a8ab0', '#c0c8d0', '#b05a3a']];
function c11DrawVill(g, v, X, Y, T, V) {
  const p = v.p, s = T / 115 * (p.sc || 1), talk = C11.say && C11.say.who === v, t = C11.t + p.n * 1.7;
  const act = talk ? null : v.moving ? (C11_CARRY[v.doing] ? v.doing : null) : v.doing;
  const wet = c11Kind(Math.floor(v.x), Math.floor(v.y - .01)) === 'r', f = v.face;
  let arm = null, sit = false, tilt = 0, lift = 0, back = null, front = null;
  const hand = a => [10 + 16 * Math.cos(a) - 31 * Math.sin(a), -97 + 16 * Math.sin(a) + 31 * Math.cos(a)];
  const along = (a, len) => { const [hx, hy] = hand(a), dx = hx - 10, dy = hy + 97, L = Math.hypot(dx, dy); return [hx + dx / L * len, hy + dy / L * len, dx / L, dy / L]; };
  const stick = (g2, x0, y0, x1, y1, w, c1 = '#c89a62', c2 = '#6a4422') => { g2.strokeStyle = c2; g2.lineWidth = w + 1.6; g2.beginPath(); g2.moveTo(x0, y0); g2.lineTo(x1, y1); g2.stroke(); g2.strokeStyle = c1; g2.lineWidth = w; g2.beginPath(); g2.moveTo(x0, y0); g2.lineTo(x1, y1); g2.stroke(); };
  const ball = (g2, x, y, r, c1, c2) => { const gr = g2.createRadialGradient(x - r * .35, y - r * .35, 0, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g2.fillStyle = gr; g2.beginPath(); g2.arc(x, y, r, 0, 6.283); g2.fill(); };
  const basketHip = g2 => { const gr = g2.createLinearGradient(-30, 0, -6, 0); gr.addColorStop(0, '#e0b870'); gr.addColorStop(1, '#8a6a30'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(-18, -50, 13, 9, 0, 0, 6.283); g2.fill(); g2.strokeStyle = 'rgba(80,56,20,.6)'; g2.lineWidth = 1; for (let i = -2; i <= 2; i++) { g2.beginPath(); g2.moveTo(-18 + i * 4, -58); g2.lineTo(-18 + i * 4, -42); g2.stroke(); } };
  const stool = g2 => { const gr = g2.createLinearGradient(-20, 0, 8, 0); gr.addColorStop(0, '#c89a62'); gr.addColorStop(1, '#5a3a1c'); g2.fillStyle = gr; g2.fillRect(-20, -28, 30, 6); g2.fillRect(-18, -22, 4, 22); g2.fillRect(4, -22, 4, 22); };
  switch (act) {
    case 'cuoc': { arm = -1.05 + 1.3 * Math.sin(t * 3.2); front = g2 => { const [hx, hy] = hand(arm), [ex, ey, dx, dy] = along(arm, 46); stick(g2, hx - dx * 8, hy - dy * 8, ex, ey, 3.4); const bx = -dy, by = dx; g2.fillStyle = '#6b6560'; g2.beginPath(); g2.moveTo(ex, ey); g2.lineTo(ex + bx * 16 + dx * 4, ey + by * 16 + dy * 4); g2.lineTo(ex + bx * 13 + dx * 10, ey + by * 13 + dy * 10); g2.lineTo(ex + dx * 6, ey + dy * 6); g2.closePath(); g2.fill(); if (Math.sin(t * 3.2) > .93) for (let i = 0; i < 4; i++) ball(g2, 50 + i * 6, -4 - i * 5, 2.2, '#b98a56', '#5a3a1e'); }; break; }
    case 'gat': { tilt = .32; arm = .25 + .5 * Math.sin(t * 4); front = g2 => { const [hx, hy] = hand(arm); g2.strokeStyle = '#a8b0b4'; g2.lineWidth = 2.4; g2.beginPath(); g2.arc(hx + 10, hy - 2, 10, Math.PI * .9, Math.PI * 1.9); g2.stroke(); stick(g2, hx, hy, hx + 2, hy + 8, 2.4); }; break; }
    case 'cay': { tilt = .4; arm = .35 + .35 * Math.sin(t * 2.6); front = g2 => { const [hx, hy] = hand(arm); for (let i = -2; i <= 2; i++) { g2.strokeStyle = i % 2 ? '#8ad06a' : '#5aa04a'; g2.lineWidth = 1.4; g2.beginPath(); g2.moveTo(hx, hy); g2.lineTo(hx + i * 3 + 4, hy - 14 - Math.abs(i) * -2); g2.stroke(); } }; break; }
    case 'hai': case 'mocua': { tilt = act === 'mocua' ? .4 : .3; arm = .25 + .35 * Math.sin(t * 3.3); back = basketHip; break; }
    case 'bon': { const k2 = Math.max(0, Math.sin(t * 2.5)); arm = -.6 + .9 * k2; back = basketHip; front = g2 => { if (k2 > .6) for (let i = 0; i < 5; i++) ball(g2, 40 + i * 9 + (t * 30 % 9), -50 + i * 9, 1.8, '#9a7a4a', '#4a321a'); }; break; }
    case 'tuoi': { arm = -.5 + .12 * Math.sin(t * 1.5); front = g2 => { const [hx, hy] = hand(arm), gr = g2.createLinearGradient(hx - 10, 0, hx + 10, 0); gr.addColorStop(0, '#8ab8b4'); gr.addColorStop(1, '#2e5e5a'); g2.fillStyle = gr; g2.beginPath(); g2.roundRect(hx - 8, hy - 4, 18, 16, 4); g2.fill(); stick(g2, hx + 9, hy + 2, hx + 26, hy + 12, 2.2, '#8ab8b4', '#2e5e5a'); for (let i = 0; i < 6; i++) { const q = ((t * 1.6 + i / 6) % 1); g2.fillStyle = `rgba(150,200,230,${.9 - q * .6})`; g2.beginPath(); g2.ellipse(hx + 28 + q * 8, hy + 14 + q * (-hy - 14), 1.3, 2.4, 0, 0, 6.283); g2.fill(); } }; break; }
    case 'cho_lon': { arm = .35 + .25 * Math.sin(t * 1.2); front = g2 => { const [hx, hy] = hand(arm), gr = g2.createLinearGradient(hx - 9, 0, hx + 9, 0); gr.addColorStop(0, '#b88a56'); gr.addColorStop(1, '#5a3a1c'); g2.fillStyle = gr; g2.beginPath(); g2.moveTo(hx - 9, hy); g2.lineTo(hx + 9, hy - 3); g2.lineTo(hx + 7, hy + 16); g2.lineTo(hx - 7, hy + 16); g2.closePath(); g2.fill(); if (Math.sin(t * 1.2) > .5) { g2.fillStyle = 'rgba(120,100,50,.8)'; for (let i = 0; i < 4; i++) { g2.beginPath(); g2.arc(hx + 12 + i * 2, hy + 4 + i * 8, 2, 0, 6.283); g2.fill(); } } }; break; }
    case 'chan_vit': { arm = -.9; front = g2 => { const [hx, hy] = hand(arm); stick(g2, hx - 10, hy + 18, hx + 70, hy - 110, 2.2, '#c8d070', '#5e7a34'); const fl = Math.sin(t * 6) * 4; g2.fillStyle = '#c8402f'; g2.beginPath(); g2.moveTo(hx + 68, hy - 108); g2.lineTo(hx + 86, hy - 100 + fl); g2.lineTo(hx + 70, hy - 94); g2.closePath(); g2.fill(); }; break; }
    case 'ganh': { arm = -1.6; back = g2 => { const b = v.moving ? Math.sin(v.ph * 2) * 3 : 0; stick(g2, -56, -100 + b, 72, -100 - b, 3); for (const [x, yb] of [[-52, b], [68, -b]]) { g2.strokeStyle = '#6a4a2a'; g2.lineWidth = 1; g2.beginPath(); g2.moveTo(x - 8, -98 + yb); g2.lineTo(x - 10, -54 + yb); g2.moveTo(x + 8, -98 + yb); g2.lineTo(x + 10, -54 + yb); g2.stroke(); const gr = g2.createLinearGradient(x - 14, 0, x + 14, 0); gr.addColorStop(0, '#e0b870'); gr.addColorStop(1, '#7a5a26'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(x, -48 + yb, 14, 9, 0, 0, 6.283); g2.fill(); g2.fillStyle = '#b8603a'; g2.fillRect(x - 9, -60 + yb, 18, 6); } }; break; }
    case 'xay': case 'ren': { arm = -1.9 + 1.5 * Math.abs(Math.sin(t * 4.5)); front = g2 => { const [hx, hy] = hand(arm), [ex, ey, dx, dy] = along(arm, 26); stick(g2, hx - dx * 4, hy - dy * 4, ex, ey, 2.6); g2.fillStyle = '#5a5a5e'; g2.save(); g2.translate(ex, ey); g2.rotate(Math.atan2(dy, dx)); g2.fillRect(-3, -9, 7, 18); g2.restore(); if (act === 'ren') { const gr = g2.createLinearGradient(30, -30, 30, 0); gr.addColorStop(0, '#a0a4a8'); gr.addColorStop(1, '#3a3c40'); g2.fillStyle = gr; g2.fillRect(28, -26, 30, 10); g2.fillRect(36, -16, 14, 16); if (Math.abs(Math.sin(t * 4.5)) < .15) for (let i = 0; i < 5; i++) ball(g2, 44 + Math.cos(i * 1.3) * 10, -30 - Math.abs(Math.sin(i * 1.7)) * 12, 1.4, '#fff2a0', '#f08020'); } }; break; }
    case 'quet': { arm = .3 + .4 * Math.sin(t * 2.2); front = g2 => { const [hx, hy] = hand(arm), ex = hx + 34 + Math.sin(t * 2.2) * 8; stick(g2, hx, hy, ex, -6, 2.2); g2.strokeStyle = '#d8b860'; g2.lineWidth = 1.2; for (let i = -4; i <= 4; i++) { g2.beginPath(); g2.moveTo(ex, -8); g2.lineTo(ex + i * 3 + 8, 2); g2.stroke(); } }; break; }
    case 'doc': { sit = true; arm = -.55; front = g2 => { const [hx, hy] = hand(arm); g2.fillStyle = '#f4ead0'; g2.beginPath(); g2.moveTo(hx, hy); g2.lineTo(hx + 14, hy - 6); g2.lineTo(hx + 16, hy + 6); g2.lineTo(hx + 2, hy + 10); g2.closePath(); g2.fill(); g2.fillStyle = '#e0d4b0'; g2.beginPath(); g2.moveTo(hx, hy); g2.lineTo(hx - 10, hy - 4); g2.lineTo(hx - 9, hy + 8); g2.lineTo(hx + 2, hy + 10); g2.closePath(); g2.fill(); g2.strokeStyle = 'rgba(60,40,20,.5)'; g2.lineWidth = .6; for (let i = 0; i < 3; i++) { g2.beginPath(); g2.moveTo(hx + 3, hy - 1 + i * 3); g2.lineTo(hx + 12, hy - 4 + i * 3); g2.stroke(); } }; break; }
    case 'co': { sit = true; arm = .1 + (Math.sin(t * .7) > .85 ? -.5 : 0); front = g2 => { const gr = g2.createLinearGradient(30, -10, 64, 0); gr.addColorStop(0, '#e8c890'); gr.addColorStop(1, '#a87a48'); g2.fillStyle = gr; g2.beginPath(); g2.moveTo(30, -4); g2.lineTo(64, -4); g2.lineTo(58, 4); g2.lineTo(26, 4); g2.closePath(); g2.fill(); for (let i = 0; i < 6; i++) ball(g2, 32 + (i * 7 % 28), -2 + (i % 2) * 4, 2, i % 2 ? '#f08070' : '#f4ead0', i % 2 ? '#8a2018' : '#8a7a5a'); }; break; }
    case 'ngoi': { sit = true; arm = .15; front = p.role === 'o' ? g2 => { stick(g2, 22, -4, 30, -92, 3.2, '#c8b070', '#6a5a2a'); if ((t % 5) < 1.2) for (let i = 0; i < 3; i++) { g2.fillStyle = `rgba(235,232,222,${.5 - i * .14})`; g2.beginPath(); g2.arc(32 + i * 4, -98 - i * 9 - (t % 5) * 8, 4 + i * 2, 0, 6.283); g2.fill(); } } : g2 => { const [hx, hy] = hand(-.4); g2.fillStyle = '#f2f0e8'; g2.beginPath(); g2.ellipse(hx + 2, hy, 6, 3, 0, 0, Math.PI); g2.fill(); g2.fillStyle = '#7a8a3a'; g2.beginPath(); g2.ellipse(hx + 2, hy, 5, 1.4, 0, 0, 6.283); g2.fill(); }; if (p.role !== 'o') arm = -.4; break; }
    case 'giat': { sit = true; tilt = .25; arm = .45 + .2 * Math.sin(t * 7); front = g2 => { const gr = g2.createLinearGradient(26, -12, 60, 0); gr.addColorStop(0, '#c0a070'); gr.addColorStop(1, '#6a4a28'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(44, -6, 18, 7, 0, 0, 6.283); g2.fill(); g2.fillStyle = '#9cc4cc'; g2.beginPath(); g2.ellipse(44, -8, 15, 4.5, 0, 0, 6.283); g2.fill(); g2.fillStyle = '#4a5a8a'; g2.beginPath(); g2.ellipse(42 + Math.sin(t * 7) * 3, -9, 7, 2.6, .3, 0, 6.283); g2.fill(); }; break; }
    case 'nau': { arm = .2 + .3 * Math.sin(t * 3); front = g2 => { for (const x of [36, 46, 56]) ball(g2, x, -3, 4, '#a8a49c', '#4a4844'); const fl = Math.sin(t * 9) * 2; for (let i = 0; i < 3; i++) { const gr = g2.createRadialGradient(46 + (i - 1) * 6, -6, 0, 46 + (i - 1) * 6, -6, 6); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(1, 'rgba(240,90,30,0)'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(46 + (i - 1) * 6, -8 + fl * (i % 2 ? 1 : -1), 4, 7, 0, 0, 6.283); g2.fill(); } ball(g2, 46, -18, 11, '#6a6460', '#1e1c1a'); for (let i = 0; i < 3; i++) { const q = (t * .4 + i / 3) % 1; g2.fillStyle = `rgba(240,240,236,${.5 * (1 - q)})`; g2.beginPath(); g2.arc(46 + Math.sin(t + i) * 4, -32 - q * 40, 4 + q * 8, 0, 6.283); g2.fill(); } }; break; }
    case 'det': { sit = true; arm = .1 + .2 * Math.sin(t * 5); front = g2 => { const gr = g2.createLinearGradient(14, -50, 40, -30); gr.addColorStop(0, '#e8c880'); gr.addColorStop(1, '#8a6a30'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(28, -36, 15, 7, 0, 0, 6.283); g2.fill(); g2.strokeStyle = 'rgba(90,60,20,.6)'; g2.lineWidth = .8; for (let i = -3; i <= 3; i++) { g2.beginPath(); g2.moveTo(28 + i * 4, -42); g2.lineTo(28 + i * 4.5, -30); g2.stroke(); } }; break; }
    case 'ban': { arm = .1 + (Math.sin(t * .9) > .75 ? -1.1 : 0); const W = C11_WARES[p.n % C11_WARES.length]; front = g2 => { const gr = g2.createLinearGradient(20, -8, 20, 8); gr.addColorStop(0, '#e8d090'); gr.addColorStop(1, '#a8884a'); g2.fillStyle = gr; g2.beginPath(); g2.ellipse(46, 0, 28, 8, 0, 0, 6.283); g2.fill(); W.forEach((c, i) => { for (let j = 0; j < 4; j++) ball(g2, 30 + i * 16 + (j % 2) * 4, -3 - (j >> 1) * 4, 3.4, '#fff8e0', c); }); }; break; }
    case 'choi': { lift = Math.abs(Math.sin(t * 5)) * 14; arm = -1.5 + .4 * Math.sin(t * 5); front = g2 => { const yy = -150 - Math.abs(Math.cos(t * 2.5)) * 50; ball(g2, 26, yy, 3, '#f4ead0', '#c8a060'); g2.strokeStyle = '#c8402f'; g2.lineWidth = 1.2; for (const a of [-.4, 0, .4]) { g2.beginPath(); g2.moveTo(26, yy - 2); g2.lineTo(26 + Math.sin(a) * 6, yy - 11); g2.stroke(); } }; break; }
    case 'cau': { sit = true; arm = -.9; front = g2 => { const [hx, hy] = hand(arm), tx = hx + 96, ty = hy - 84; stick(g2, hx - 8, hy + 6, tx, ty, 1.8, '#d0c070', '#6a5a2a'); const bx = tx + 10, by = 26 + Math.sin(t * 2) * 1.5; g2.strokeStyle = 'rgba(240,240,240,.7)'; g2.lineWidth = .6; g2.beginPath(); g2.moveTo(tx, ty); g2.quadraticCurveTo(tx + 8, (ty + by) / 2, bx, by); g2.stroke(); ball(g2, bx, by, 2.4, '#ff9070', '#a02010'); if ((t % 23) < 1) { const q = t % 23; ball(g2, bx + q * 6, by - Math.sin(q * 3.14) * 30, 4, '#f0c080', '#a0602a'); } }; break; }
    case 'canh': { arm = -.15; front = g2 => { const [hx, hy] = hand(arm); stick(g2, hx, hy - 70, hx + 2, 2, 2.6); g2.fillStyle = '#c8402f'; g2.beginPath(); g2.arc(hx, hy - 66, 3.4, 0, 6.283); g2.fill(); }; break; }
    case 'mo': { arm = -.7; front = g2 => { const [hx, hy] = hand(arm); ball(g2, hx + 6, hy - 4, 7, '#c89a62', '#5a3a1c'); stick(g2, hx - 4, hy + 10, hx + 18, hy - 14, 1.6); if ((t % 4) < .8) { g2.save(); g2.scale(f, 1); g2.font = '800 18px "Be Vietnam Pro", sans-serif'; g2.textAlign = 'center'; g2.fillStyle = '#a3332a'; g2.fillText('Cốc cốc!', f * 20, -170); g2.restore(); } }; break; }
    case 'do': { arm = -1.3 + .3 * Math.sin(t * 1.4); front = g2 => { const [hx, hy] = hand(arm); stick(g2, hx - 14, hy + 90, hx + 10, hy - 80, 2.4); }; break; }
  }
  g.fillStyle = 'rgba(29,25,21,.2)'; g.beginPath(); g.ellipse(X, Y, T * .3, T * .1, 0, 0, 6.283); g.fill();
  const Yb = Y - lift * s + (sit && act !== 'giat' ? -8 * s : 0);
  const frameDo = fn => { g.save(); g.translate(X, Yb); g.scale(f * s, s); g.lineCap = g.lineJoin = 'round'; fn(g); g.restore(); };
  g.save(); if (tilt) { g.translate(X, Y); g.rotate(f * tilt); g.translate(-X, -Y); }
  if (sit && act !== 'giat') frameDo(stool);
  if (back) frameDo(back);
  C4_SIT = sit; c11Mouse(g, p, X, Yb, f, v.ph, v.moving, s, arm); C4_SIT = false;
  if (front) frameDo(front);
  g.restore();
  if (wet) { g.fillStyle = 'rgba(150,186,170,.7)'; g.beginPath(); g.ellipse(X, Y - 2 * s, T * .28, T * .08, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(X, Y - 2 * s, T * .28 + Math.sin(t * 2) * 3, T * .08 + 1, 0, 0, 6.283); g.stroke(); }
  const d = Math.hypot(X - (C11.px * T - V.cx), Y - (C11.py * T - V.cy));
  if (d < T * 3 && !talk) { const ny = Yb - T * 1.42 * (p.sc || 1) - (sit ? -T * .12 : 0); g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText(p.name, X, ny); g.fillStyle = INK; g.fillText(p.name, X, ny); }   // the name over the head (owner)
}

/* ---------- villagers talk among themselves (owner: "sao các NPC cứ đứng đần ra, cho nói chuyện giống như trong chương 4") ----------
   Two who are near each other and not busy walking may stop and play a short exchange ({A} {B} the two, {X} someone else of the
   village); strollers stand still for it, workers talk over their work. Now and then someone at work says a line of their own.
   Every line is written for this chapter. */
const C11_CHATS = [
  [['A', 'Hôm nay trời đẹp nhỉ {B}.'], ['B', 'Ừ, phơi thóc là khô ngay.']],
  [['A', 'Lúa nhà {B} năm nay tốt thế.'], ['B', 'Nhờ trời thôi. Mà sâu cũng nhiều lắm.'], ['A', 'Rắc tro bếp vào gốc, sâu nó sợ.']],
  [['A', 'Nghe nói cụ Bá lại sắp tăng lãi.'], ['B', 'Suỵt! Nói nhỏ thôi, tai vách mạch rừng.']],
  [['A', '{B} ăn cơm chưa?'], ['B', 'Ăn rồi, bát cà với bát canh rau.'], ['A', 'Thế là sướng rồi.']],
  [['A', 'Đêm qua anh Chí lại say, chửi cả làng.'], ['B', 'Tội, chẳng ai thương nên mới thế.']],
  [['A', 'Thị đi đâu mà vội thế nhỉ?'], ['B', 'Chắc lại mang cháo cho ai đấy.'], ['A', 'Con bé tốt bụng thật.']],
  [['A', 'Giá gạo ngoài chợ lại lên rồi.'], ['B', 'Lên thì người bán mừng, người mua khóc.']],
  [['A', 'Mai có phiên chợ to đấy.'], ['B', 'Tôi phải gánh rau ra từ sớm.']],
  [['A', '{X} dạo này sao gầy thế?'], ['B', 'Nghe đâu nhà có chuyện buồn.'], ['A', 'Hôm nào mang biếu ít khoai.']],
  [['A', 'Đội Tảo sắp đi thu thuế thân.'], ['B', 'Trời ơi, chưa có đồng nào.'], ['A', 'Thì vay tạm đã, tính sau.']],
  [['A', 'Con gà mái nhà tôi lại mất.'], ['B', 'Chắc con cáo ở rừng trúc đấy.']],
  [['A', 'Này {B}, có biết vì sao con vịt đi lạch bạch không?'], ['B', 'Sao?'], ['A', 'Vì nó không biết đi giày!'], ['B', 'Khổ, đùa nhạt thế.']],
  [['A', 'Lão Hạc vẫn chưa có thư con à?'], ['B', 'Chưa. Lão ngồi nhìn ra ngõ suốt.']],
  [['A', 'Ông giáo bán thêm sách rồi đấy.'], ['B', 'Nghèo thì chữ cũng phải bán.']],
  [['A', 'Ra đình xem đánh cờ không {B}?'], ['B', 'Để tối, giờ còn dở việc.']],
  [['A', 'Trời này chắc sắp mưa.'], ['B', 'Mưa thì đỡ phải tưới.'], ['A', 'Mà mưa to thì úng hết.']],
  [['A', 'Cô Duyên hàng nước biết hết chuyện làng.'], ['B', 'Ngồi đấy một buổi là biết cả.']],
  [['A', 'Mõ vừa rao gì thế?'], ['B', 'Quan huyện sắp về đình.'], ['A', 'Lại phải sửa soạn rồi.']],
  [['A', 'Nhà {X} mới cất được gian bếp.'], ['B', 'Giỏi thật, chắt bóp mãi mới được.']],
  [['A', 'Bà goá Tư lại góp họ đấy.'], ['B', 'Góp thì góp, chọn chủ họ cho cẩn thận.']],
  [['A', 'Hôm qua ngoài bến có con cá chép đỏ to lắm.'], ['B', 'Câu được chưa?'], ['A', 'Nó đứt cước rồi chạy mất.']],
  [['A', 'Anh xe tơ sắp cưới vợ đấy.'], ['B', 'Đủ lễ chưa?'], ['A', 'Chưa, còn thiếu dăm mâm xôi.']],
  [['A', 'Nắng quá, nghỉ tay uống bát nước chè đã.'], ['B', 'Ừ, chè xanh mát ruột.']],
  [['A', '{B} có thấy cái nón của tôi đâu không?'], ['B', 'Đang đội trên đầu kia kìa!'], ['A', 'Ơ, thế mà tìm mãi.']],
  [['A', 'Cậu Xuân trên tỉnh về, ăn mặc lạ lắm.'], ['B', 'Tóc thì đỏ, nói thì toàn tiếng Tây.']],
  [['A', 'Đàn vịt nhà ai đi lạc kìa.'], ['B', 'Của người chăn vịt ngoài đồng đấy.']],
  [['A', 'Năm nay đình làng dột nhiều quá.'], ['B', 'Ông từ kêu mãi mà chẳng ai góp.']],
  [['A', 'Đi đâu đấy {B}?'], ['B', 'Ra chợ một tí.'], ['A', 'Mua giúp tôi bó hành nhé.']],
];
const C11_MUTTER = {
  cay: ['Cấy cho thẳng hàng nào.', 'Mỏi lưng quá.', 'Ruộng này cấy xong là trưa.'], gat: ['Lúa chín vàng, mừng ghê.', 'Bông nặng trĩu tay.'], cuoc: ['Đất cứng quá.', 'Cuốc sâu cho tơi đất.'],
  bon: ['Bón ít phân cho lúa tốt.', 'Phân chuồng là nhất.'], tuoi: ['Tưới đẫm kẻo rau héo.', 'Rau lên xanh mướt rồi.'], cho_lon: ['Ăn đi, ăn cho béo.', 'Ủn ỉn cái gì, từ từ chứ.'],
  chan_vit: ['Đi nào, đi nào!', 'Vịt ơi về đây.'], xay: ['Đóng chặt cái kèo này.', 'Sắp xong khung rồi.'], ganh: ['Nặng quá trời.', 'Gạch này đủ xây gian bếp.'],
  cau: ['Cá ơi cắn câu đi.', 'Im nào, cá nó sợ.'], giat: ['Vết bẩn này cứng đầu ghê.', 'Nước sông mát thật.'], mocua: ['Cua ở đâu ra đây.', 'Được con to rồi!'],
  quet: ['Lá rụng nhiều quá.', 'Quét xong sân là nghỉ.'], ban: ['Mua đi, rẻ thôi!', 'Hàng tươi đây!'], ren: ['Lửa phải đỏ mới rèn được.'], nau: ['Nồi này sắp sôi rồi.', 'Thơm quá.'],
  doc: ['Học ăn, học nói…', 'Chữ này khó viết quá.'], choi: ['Đá cầu không?', 'Bắt được rồi!'], canh: ['Đứng gác buồn ngủ quá.'], co: ['Chiếu tướng!', 'Nước này hay đấy.'],
};
function c11ChatUpdate(dt) {
  const G = C11; G.chats = (G.chats || []).filter(c => G.vill.includes(c.a) && G.vill.includes(c.b) && !c.done); G.mut = (G.mut || []).filter(m => (m.t += dt) < 2.8 && G.vill.includes(m.v));
  for (const c of G.chats) { c.t += dt; if (c.t > c.dur) { c.t = 0; c.i++; if (c.i >= c.lines.length) { c.done = true; c.a.chat = c.b.chat = null; } } }
  G.chatT = (G.chatT ?? 2) - dt; if (G.chatT > 0) return; G.chatT = 1.5 + Math.random() * 2.5;
  const free = v => !v.chat && !v.leaving && !(G.say && G.say.who === v) && !(v.path && v.path.length) && !v.glide;
  if (G.chats.length < 3) {                                                          // two near each other start talking
    const L = G.vill.filter(free);
    for (let n = 0; n < 12; n++) {
      const a = L[(Math.random() * L.length) | 0], b = a && L.filter(v => v !== a && Math.hypot(v.x - a.x, (v.y - a.y) * 1.3) < 3)[0];
      if (!a || !b) continue;
      const S = C11_CHATS[(Math.random() * C11_CHATS.length) | 0], X = C11_PPL[(Math.random() * C11_PPL.length) | 0].name;
      const lines = S.map(([w, t]) => ({ who: w === 'A' ? a : b, text: t.replace(/\{A\}/g, a.p.name).replace(/\{B\}/g, b.p.name.replace(/^(thằng|cái|con) /, '')).replace(/\{X\}/g, X) }));
      const c = { a, b, lines, i: 0, t: 0, dur: 2.8 }; a.chat = b.chat = c; G.chats.push(c);
      const tot = lines.length * c.dur + .5; for (const v of [a, b]) { v.wait = Math.max(v.wait, tot); if (!(v.atGoal && v.doing)) v.face = (v === a ? b : a).x < v.x ? -1 : 1; }
      break;
    }
  }
  if (G.mut.length < 2 && Math.random() < .6) {                                    // someone at work says a word to themself
    const W = G.vill.filter(v => free(v) && v.doing && C11_MUTTER[v.doing]), v = W[(Math.random() * W.length) | 0];
    if (v) { const L = C11_MUTTER[v.doing]; G.mut.push({ v, text: L[(Math.random() * L.length) | 0], t: 0 }); }
  }
}
function c11ChatDraw(g, sx, sy, T) {
  const G = C11, put = (v, text) => { if (G.say && G.say.who === v) return; c11Bubble(g, sx(v.x), sy(v.y) - T * 1.62 * (v.p.sc || 1), text, null); };
  for (const m of G.mut || []) put(m.v, m.text);
  for (const c of G.chats || []) { const l = c.lines[c.i]; if (l) put(l.who, l.text); }
}
