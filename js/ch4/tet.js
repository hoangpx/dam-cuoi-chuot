/* Chương IV · Tết (owner 2026-11-11: "thêm không khí Tết"), for the village and the town alike. The game's lunar calendar (tamly.js
   c4Lunar: day 1 = mồng 1 tháng Ba, so Tết is day 301, then every 360 days) already makes tháng Chạp sell ×1.2 and offers the Tết
   bonus for hired hands; this adds what is seen and heard:
   - From the 20th of tháng Chạp to mồng 7 tháng Giêng: a potted peach in blossom by each of our stalls and houses, a kumquat by the
     betel stall and the town house. From the 23rd (ông Công ông Táo) to mồng 7 (the day it comes down): a cây nêu by the betel stall
     and by the town house, and a red "CHÚC MỪNG NĂM MỚI" banner under the village gate and the town gate.
   - Crowds: the last days before Tết are crowded (23–27 Chạp ×1.3, 28–30 ×1.6), mồng 1–3 quieter (folk visit their families, ×.75);
     the town's background selling follows (p4Busy, dongho.js).
   - Firecrackers all over the street for the seven days of Tết, and the road red with their scraps (see below).
   - Talk: half the chats in the village and the town's chatter are about Tết (the weeks before: shopping, bánh chưng, ông Táo; from
     mồng 1: wishes, visits, lì xì). All lines original. */
function c4TetDay(day) { const { d, m } = c4Lunar(day); return m === 12 ? d - 31 : m === 1 ? d - 1 : null; }   // days to Tết: −11 … −1 in Chạp (30-day months), 0 = mồng 1
function c4TetPhase() { const t = c4TetDay(); if (t === null) return null; if (t >= -11 && t <= -8) return 'chap'; if (t >= -8 && t < 0) return 'giap'; if (t >= 0 && t <= 2) return 'tet'; if (t >= 3 && t <= 6) return 'sau'; return null; }
const c4TetDeco = () => { const t = c4TetDay(); return t !== null && t >= -11 && t <= 6; };     // peach and kumquat: from the 20th of Chạp
const c4TetNeu = () => { const t = c4TetDay(); return t !== null && t >= -8 && t <= 6; };      // the cây nêu and the banner: 23 Chạp → mồng 7
function c4TetFlow() { const t = c4TetDay(); if (t === null) return 1; if (t >= -8 && t <= -4) return 1.3; if (t >= -3 && t < 0) return 1.6; if (t >= 0 && t <= 2) return .75; return 1; }

/* ---------- the pictures, printed once ---------- */
const C4_TET_ART = {};
const c4TetArt = k => C4_TET_ART[k] || (C4_TET_ART[k] = k === 'neu' ? part([-70, -350, 70, 6], a => {
  const pole = new Path2D(); pole.moveTo(0, 0); pole.lineTo(1, -300);
  a.band('straw', pole, 7); a.key(pole, 1.8);                                                 // the bamboo pole, its nodes
  a.key(lines([[-4, -60, 5, -60], [-4, -120, 5, -120], [-3, -180, 5, -180], [-3, -240, 5, -240]]), 1.2);
  for (const [dx, dy, r] of [[-30, -312, -.5], [-14, -322, -.2], [6, -326, .15], [24, -318, .5], [36, -306, .8], [-40, -298, -.85]]) {   // a tuft of bamboo leaves at the top
    const L = new Path2D(); L.moveTo(1, -300); L.quadraticCurveTo(dx * .5, dy - 4, dx, dy); L.quadraticCurveTo(dx * .55 + 4, dy + 8, 1, -300);
    a.fk('green', L, 1.2);
  }
  const cord = new Path2D(); cord.moveTo(1, -296); cord.quadraticCurveTo(24, -250, 30, -170); a.key(cord, 1);   // a cord hung with charms
  a.fk('yellow', circ(26, -236, 9), 1.3); a.key(circ(26, -236, 4), .9);                        // a woven disc
  for (const [x, y] of [[29, -205], [30, -186]]) a.fk('red', ell(x, y, 4, 6), 1);             // little red bells
  const fish = new Path2D(); fish.moveTo(30, -172); fish.quadraticCurveTo(38, -160, 30, -148); fish.quadraticCurveTo(22, -160, 30, -172); fish.closePath();
  a.fk('red', fish, 1.1); a.fk('red', new Path2D('M26 -146 L30 -150 L34 -146 L30 -140 Z'), .9);   // a red paper carp
  a.fk('red', new Path2D('M-3 -292 L-26 -268 L-22 -262 L-1 -284 Z'), 1);                        // a red cloth streamer
  a.fk('white', new Path2D('M-14 0 L14 0 L10 -10 L-10 -10 Z'), 1.4);                             // its stone foot
}) : k === 'dao' ? part([-70, -170, 70, 4], a => {
  a.fk('blue', new Path2D('M-24 0 L24 0 L30 -36 L-30 -36 Z'), 2); a.fk('white', new Path2D('M-31 -36 L31 -36 L31 -44 L-31 -44 Z'), 1.8);   // a blue glazed pot
  a.key(lines([[-18, -18, 18, -18]]), 1);
  const br = [[[0, -44], [-6, -80], [-22, -120], [-40, -140]], [[0, -44], [4, -90], [14, -130], [12, -160]], [[-4, -80], [-34, -96], [-52, -100]], [[6, -96], [34, -118], [50, -122]], [[10, -126], [32, -150]]];
  for (const b of br) { const p = new Path2D(); b.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); a.band('brown', p, 3.6); a.key(p, 1.1); }
  const R0 = mulberry(31); for (let i = 0; i < 46; i++) {                                        // pink blossoms along the branches
    const b = br[i % br.length], j = 1 + ((R0() * (b.length - 1)) | 0), t = R0(), [x0, y0] = b[j - 1], [x1, y1] = b[j], x = x0 + (x1 - x0) * t + (R0() - .5) * 10, y = y0 + (y1 - y0) * t + (R0() - .5) * 10;
    a.fk(R0() < .7 ? 'pink' : 'white', circ(x, y, 3.2 + R0() * 1.6), .8); a.fill('red', circ(x, y, 1));
  }
}) : null);

/* ---------- where things stand ---------- */
function c4TetSpots(place) {           // [x, z, kind, scale]
  const S = [];
  if (place === 'lang') {
    if (c4TetNeu()) S.push([C4_STALL - 240, .02, 'neu', .9]);
    if (c4TetDeco()) { S.push([C4_STALL - 175, .07, 'quat', .5]); for (const g of c4Owned()) S.push([(g === 'trau' ? C4_STALL : C4_GOODS[g].x + 20) + 175, .08, 'dao', .62]); }
  } else {
    if (c4TetNeu()) S.push([P4_HOME + 165, .03, 'neu', .9]);
    if (c4TetDeco()) { S.push([P4_HOME - 190, .06, 'quat', .5]); for (const k of Object.keys(SAVE4B.shops || {})) S.push([+k + 130, .07, 'dao', .58]); if (SAVE4B.house) S.push([P4_HOME + 120, .07, 'dao', .62]); }
  }
  return S;
}
function c4TetBanner(g, x, y, s) {     // a red banner under a gate, gold edged
  const w = 178 * s, h = 30 * s;
  g.save(); g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-w / 2 + 4 * s, -h / 2 - 22 * s); g.lineTo(-w / 2 + 6 * s, -h / 2); g.moveTo(w / 2 - 4 * s, -h / 2 - 22 * s); g.lineTo(w / 2 - 6 * s, -h / 2); g.stroke();   // hung on cords from the board above
  g.fillStyle = '#b8352b'; g.fillRect(-w / 2, -h / 2, w, h); g.strokeRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = '#e8c24a'; g.lineWidth = 1.2; g.strokeRect(-w / 2 + 3 * s, -h / 2 + 3 * s, w - 6 * s, h - 6 * s);
  g.fillStyle = '#f6d36a'; g.font = `900 ${15 * s}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CHÚC MỪNG NĂM MỚI', 0, 1 * s);
  g.restore();
}

/* ---------- firecrackers (owner 2026-11-11: "7 ngày tết thì người đốt pháo đầy đường, xác pháo, pháo nổ các kiểu") ----------
   From mồng 1 to mồng 7, all day (thickest on mồng 1 and in the evening), and in the town from 22:30 on the 30th (giao thừa), folk set
   off crackers all along the street, three kinds: pháo tép (a crackle of little pops on the ground), pháo dây (a red string hung from a
   stall or a door, popping from the bottom up as it burns) and pháo đùng (one big bang, a cloud of smoke); in the town at night pháo hoa
   burst in the sky as well. Every scrap of red paper that lands stays on the road (xác pháo): the road is already littered from the
   first morning (scraps seeded by the day, more each day of Tết) and gets redder with every burst; it is swept away after mồng 7. */
const C4_TET_FX = { list: [], t: 0, hoaT: 0, debris: { lang: null, pho: null }, dKey: { lang: '', pho: '' } };
const c4TetPhaoOn = (place, mins) => { const t = c4TetDay(); return (t !== null && t >= 0 && t <= 6) || (place === 'pho' && t === -1 && mins >= 22.5 * 60); };
function c4TetDebris(place, W) {        // the red scraps lying on the road: seeded once a day, grown by every burst
  const F = C4_TET_FX, t = c4TetDay(), key = SAVE4.day + ':' + W;
  if (t === null || t < 0 || t > 6) { F.debris[place] = null; return null; }
  if (F.dKey[place] !== key) {
    F.dKey[place] = key; const r = mulberry(SAVE4.day * 7 + (place === 'pho' ? 3 : 1)), L = [], n = 260 + 70 * t;
    for (let i = 0; i < n; i++) { const cx = r() * W, cl = r() < .7; for (let k = 0, m = cl ? 4 + ((r() * 8) | 0) : 1; k < m; k++) L.push({ x: cx + (r() - .5) * 40, z: Math.min(1, Math.max(.05, r() * .95 + (r() - .5) * .05)), r: r() * 6.3, c: r() < .85 ? 0 : 1 }); }
    F.debris[place] = L;
  }
  return F.debris[place];
}
function c4TetCrackers(place, dt, mins, xs, yOf, sOf, cam, vw) {
  const F = C4_TET_FX, D = F.debris[place];
  F.list = F.list.filter(p => { if ((p.t += dt) < p.life) return true; if (p.k === 'bit' && D && D.length < 2600 && p.place === place) D.push({ x: p.x, z: p.z, r: p.r, c: 0 }); return false; });   // a scrap that lands stays
  for (const p of F.list) {
    if (p.k === 'bit') { p.vy += 170 * dt; p.vx *= .985; p.x += p.vx * dt * .5; p.h = Math.max(0, p.h - p.vy * dt); if (p.h <= 0) { p.vx = 0; p.vy = 0; p.t = Math.max(p.t, p.life - .05); } }
    else if (p.k === 'smoke') { p.x += p.vx * dt; p.h += 14 * dt; }
    else if (p.k === 'spark') { p.vy += 40 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    else if (p.k === 'day') { p.left -= dt / p.dur; if (p.left > 0 && R() < dt * 26) c4TetPop(place, p.x, p.z, p.h0 * p.left, p.s, 4, .5); }
  }
  if (!c4TetPhaoOn(place, mins)) return;
  const t = c4TetDay(), eve = mins >= 17 * 60 || t === -1, rate = (t === 0 || t === -1 ? 1.6 : t <= 2 ? 1 : .6) * (eve ? 1.5 : 1);
  if ((F.t -= dt * rate) <= 0) {
    F.t = .9 + R() * 1.8;
    const z = .12 + R() * .8, s = sOf(z), x = cam + 40 + R() * Math.max(80, vw - 80), u = R();
    if (u < .5) { c4TetPop(place, x, z, 0, s, 20, 1); if (typeof AU !== 'undefined' && AU.knock) for (let i = 0; i < 4; i++) setTimeout(() => AU.knock(2), i * 90 + R() * 50); }   // pháo tép
    else if (u < .82 && xs.length) { const hx = xs[(R() * xs.length) | 0] + (R() - .5) * 60, hz = .1; F.list.push({ k: 'day', place, x: hx, z: hz, h0: 110, left: 1, dur: 2.4 + R() * 1.5, s: sOf(hz), t: 0, life: 4.2 }); if (typeof AU !== 'undefined' && AU.knock) for (let i = 0; i < 14; i++) setTimeout(() => AU.knock(2), i * 170 + R() * 60); }   // pháo dây
    else { c4TetPop(place, x, z, 0, s, 34, 2.2); for (let i = 0; i < 6; i++) F.list.push({ k: 'smoke', place, x: x + (R() - .5) * 50 * s, z, h: 4 + R() * 20, vx: (R() - .5) * 8, t: 0, life: 3 + R(), s }); if (typeof AU !== 'undefined' && AU.thump) AU.thump(); }   // pháo đùng
  }
  if (place === 'pho' && (typeof p4NightK === 'function' && p4NightK() > .6) && (F.hoaT -= dt * rate) <= 0) {   // pháo hoa over the town at night
    F.hoaT = 1.6 + R() * 2.4;
    const V = p4View(), top = -V.oy + 150 / V.s, bot = (typeof p4SkyTop === 'function' ? p4SkyTop() : P4_Y0) - 50; if (top > bot) return;   // only in open sky above the roofs (tall phones), as the moon
    const cx = cam + 60 + R() * (vw - 120), cy = top + R() * (bot - top), cols = ['#ffd36a', '#ff7a6a', '#f6f1e4', '#9fe0c9', '#ffa8d8'], col = cols[(R() * cols.length) | 0];
    for (let i = 0; i < 34; i++) { const a = i / 34 * 6.283, v = 70 + R() * 30; F.list.push({ k: 'spark', place, x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 1.4 + R() * .5, col }); }
  }
}
function c4TetPop(place, x, z, h, s, n, big) {      // a burst: red scraps flying, a flash, a puff of smoke
  const F = C4_TET_FX;
  for (let i = 0; i < n; i++) F.list.push({ k: 'bit', place, x: x + (R() - .5) * 16 * s, z: Math.min(1, Math.max(.05, z + (R() - .5) * .08)), h: h + 4, vx: (R() - .5) * 150 * s * big, vy: (-80 - R() * 140 * big), t: 0, life: 3, r: R() * 6.3, s });
  F.list.push({ k: 'flash', place, x, z, h, t: 0, life: .22 + .1 * big, s: s * big });
  F.list.push({ k: 'smoke', place, x, z, h: h + 6, vx: (R() - .5) * 10, t: 0, life: 1.6 + big, s: s * Math.sqrt(big) });
}
function c4TetDebrisDraw(g, place, yOf, sOf, lo, hi) {   // xác pháo on the road, under everyone's feet
  const D = C4_TET_FX.debris[place]; if (!D) return;
  for (const d of D) if (d.x > lo && d.x < hi) { const y = yOf(d.z), s = sOf(d.z); g.save(); g.translate(d.x, y); g.rotate(d.r); g.fillStyle = d.c ? '#e8c24a' : '#c8302a'; g.fillRect(-2.6 * s, -1.2 * s, 5.2 * s, 2.4 * s); g.restore(); }
}
function c4TetFxDraw(g, place, yOf) {
  for (const p of C4_TET_FX.list) {
    if (p.place !== place || p.k === 'spark') continue;
    const a = 1 - p.t / p.life, y = yOf(p.z) - (p.h || 0) * (p.s || 1);
    if (p.k === 'bit') { g.save(); g.translate(p.x, y); g.rotate(p.r + (p.h > 0 ? p.t * 9 : 0)); g.fillStyle = '#c8302a'; g.fillRect(-2.6 * p.s, -1.2 * p.s, 5.2 * p.s, 2.4 * p.s); g.restore(); }
    else if (p.k === 'smoke') { g.globalAlpha = .3 * a; g.fillStyle = '#ece6da'; g.beginPath(); g.arc(p.x, y, (9 + p.t * 16) * p.s, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    else if (p.k === 'flash') { g.globalAlpha = a; g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(p.x, y, 14 * p.s * (1 + p.t * 4), 0, 6.283); g.fill(); g.fillStyle = '#ffb347'; g.beginPath(); g.arc(p.x, y, 7 * p.s * (1 + p.t * 3), 0, 6.283); g.fill(); g.globalAlpha = 1; }
    else if (p.k === 'day') {                                                        // a red string hanging, burning from the bottom up
      const top = yOf(p.z) - p.h0 * p.s, bot = top + p.h0 * p.s * Math.max(0, p.left);
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, top - 8 * p.s); g.lineTo(p.x, top); g.stroke();
      if (p.left > 0) for (let yy = top; yy < bot; yy += 5 * p.s) { g.fillStyle = (((yy - top) / (5 * p.s)) | 0) % 2 ? '#c8302a' : '#a3241e'; g.fillRect(p.x - 4 * p.s, yy, 3 * p.s, 4 * p.s); g.fillRect(p.x + 1 * p.s, yy + 2 * p.s, 3 * p.s, 4 * p.s); }
    }
  }
}
function c4TetSparks(g) {               // pháo hoa: in screen space after the night, so they glow
  const L = C4_TET_FX.list.filter(p => p.k === 'spark'); if (!L.length) return;
  const V = p4View(), Sc = V.s * DPR; g.save(); g.setTransform(Sc, 0, 0, Sc, -P4.camX * Sc, V.oy * Sc); g.globalCompositeOperation = 'lighter';
  for (const p of L) { const a = 1 - p.t / p.life; g.globalAlpha = a; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, 2.4, 0, 6.283); g.fill(); g.globalAlpha = a * .35; g.beginPath(); g.arc(p.x - p.vx * .05, p.y - p.vy * .05, 1.6, 0, 6.283); g.fill(); }
  g.restore();
}

/* ---------- talk ---------- */
const C4_TET_CHATS_GIAP = [
  [[0, 'Tết này nhà {B} gói mấy cặp bánh chưng?'], [1, 'Mười cặp, ăn đến rằm chưa hết!']],
  [[0, 'Đã sắm được cành đào chưa?'], [1, 'Đào thì đắt, nhà tôi chơi chậu quất cho lâu.']],
  [[0, 'Hai mươi ba tiễn ông Táo rồi đấy.'], [1, 'Cá chép mua sẵn chưa? Để ông đi bộ lên trời thì mỏi chân lắm!']],
  [[0, 'Chợ giáp Tết đông quá, chen mãi không ra.'], [1, 'Đông thế mới là chợ Tết chứ!']],
  [[0, 'Năm nay nhờ ai xông đất nhà {B}?'], [1, 'Nhờ {X}, người hiền lành, cho cả năm êm ấm.']],
  [[0, 'Bọn trẻ cứ đếm từng ngày chờ mừng tuổi.'], [1, 'Người lớn thì đếm tiền chờ… cạn túi!']],
  [[0, 'Lá dong năm nay đắt quá!'], [1, 'Thì gói bánh chưng nhỏ lại một tí, ông bà thông cảm.']],
];
const C4_TET_CHATS_TET = [
  [[0, 'Chúc {B} năm mới phát tài!'], [1, 'Chúc {A} năm mới mạnh khoẻ, buôn may bán đắt!']],
  [[0, 'Mồng một đã đi đâu chưa?'], [1, 'Mồng một nhà cha, mồng hai nhà mẹ, mồng ba nhà thầy, như lệ thôi.']],
  [[0, 'Cháu nhà {B} được mừng tuổi nhiều không?'], [1, 'Được nhiều lắm, mẹ nó giữ hộ hết rồi!']],
  [[0, 'Đầu năm đi lễ chùa chưa?'], [1, 'Đi rồi, xin được quẻ tốt lắm.']],
  [[0, 'Ăn Tết xong béo ra hẳn đấy!'], [1, 'Bánh chưng nhà {X} ngon quá, không dừng được.']],
];
const P4_TET_CHAT_GIAP = ['Chợ hoa bến sông năm nay đẹp quá!', 'Mua cặp bánh chưng về thắp hương ông bà.', 'Đào về đến phố rồi kìa!', 'Sắm Tết mà tiền cứ bay như lá.', 'Tối ba mươi ra bến xem đốt pháo không?', 'Câu đối đỏ ông đồ viết đẹp quá.'];
const P4_TET_CHAT_TET = ['Năm mới phát tài nhé!', 'Chúc mừng năm mới, vạn sự như ý!', 'Đi lễ chùa đầu năm cho may.', 'Mừng tuổi cháu cái phong bao đỏ này.', 'Năm mới buôn may bán đắt nhé!'];
const c4TetChats = () => { const ph = c4TetPhase(); if (!ph || R() > .5) return null; return ph === 'tet' || ph === 'sau' ? C4_TET_CHATS_TET : C4_TET_CHATS_GIAP; };
const p4TetChat = () => { const ph = c4TetPhase(); if (!ph || Math.random() > .5) return null; return p4Pick(ph === 'tet' || ph === 'sau' ? P4_TET_CHAT_TET : P4_TET_CHAT_GIAP); };

/* ---------- hooks ---------- */
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) {
    fx0(items, g, vis);
    if (c4LookCtx !== undefined || !c4TetPhase()) return;                                       // not in a friend's market, nor in the stall dresser
    for (const [x, z, k, sc] of c4TetSpots('lang')) if (vis(x, 120)) { const s = c4S(z) * sc, P = k === 'quat' ? lkDecoPart('quat') : c4TetArt(k); items.push({ z, f: () => dp(g, P, x, c4Y(z), 0, s, s) }); }
    if (c4TetNeu() && vis(C4_GATE, 140)) items.push({ z: -.5, f: () => c4TetBanner(g, C4_GATE, C4_Y0 + 6 - 176 * .88, .88) });
    const lo = C4.camX - 40, hi = C4.camX + c4View().vw + 40;
    if (c4TetDebris('lang', C4_W)) items.push({ z: -.3, f: () => c4TetDebrisDraw(g, 'lang', c4Y, c4S, lo, hi) });
    if (C4_TET_FX.list.length) items.push({ z: 1.2, f: () => c4TetFxDraw(g, 'lang', c4Y) });
  }; }
{ const br0 = p4TownBridgeItems;
  p4TownBridgeItems = function (items, g, vis) {
    br0(items, g, vis);
    if (!c4TetPhase() && !c4TetPhaoOn('pho', P4.mins)) return;
    for (const [x, z, k, sc] of c4TetSpots('pho')) if (vis(x, 120)) { const s = p4S(z) * sc, P = k === 'quat' ? lkDecoPart('quat') : c4TetArt(k); items.push({ z, f: () => dp(g, P, x, p4Y(z), 0, s, s) }); }
    if (c4TetNeu() && vis(P4_GATE + 60, 140)) items.push({ z: -.5, f: () => c4TetBanner(g, P4_GATE + 60, P4_Y0 + 6 - 192 * .88, .88) });
    const lo = P4.camX - 40, hi = P4.camX + p4View().vw + 40, fs = () => P4_FOLK_S * P4_CROWD;
    if (c4TetDebris('pho', P4_W)) items.push({ z: -.3, f: () => c4TetDebrisDraw(g, 'pho', p4Y, fs, lo, hi) });
    if (C4_TET_FX.list.length) items.push({ z: 1.2, f: () => c4TetFxDraw(g, 'pho', p4Y) });
  }; }
{ const C = chapterById(4), u0 = C.update;
  C.update = function (dt) { const r = u0.apply(this, arguments); if (C4.phase === 'open' || C4_TET_FX.list.length) c4TetCrackers('lang', dt, C4.mins, c4Owned().map(g => g === 'trau' ? C4_STALL : C4_GOODS[g].x), c4Y, c4S, C4.camX, c4View().vw); return r; }; }
{ const C = chapterById('4b'), u0 = C.update, r0 = C.render;
  C.update = function (dt) { const r = u0.apply(this, arguments); if (P4.phase === 'open' || C4_TET_FX.list.length) c4TetCrackers('pho', dt, P4.mins, [P4_HOME, ...Object.keys(SAVE4B.shops || {}).map(Number)], p4Y, () => P4_FOLK_S * P4_CROWD, P4.camX, p4View().vw); return r; };
  C.render = function () { const r = r0.apply(this, arguments); if (S.mode === 'c4bplay' && !P4T.on) c4TetSparks(ctx); return r; }; }
