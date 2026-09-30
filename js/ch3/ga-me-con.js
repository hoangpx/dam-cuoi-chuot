/* Chương III · tranh 1 · Đàn Gà Mẹ Con.
   Ten chicks scatter around the hen, who keeps calling them home. Drag a chick into the nest: alone it stays 5 s and runs
   off again. Drag the hen in first and she sits for 10 s; while she sits the chicks stay put. If the ten are not home
   when her 10 s are up, she gets up to call again and the chicks scatter. All ten home → the "Đàn Gà Mẹ Con" print. */
const G3 = { chicks: [], hen: null, nest: null, drag: null, won: false, winT: 0, callT: 2, sayT: 0, helpT: 0, smart: false, t: 0, W: 960, H: 540 };
const G3_ALONE = 4.5, G3_WITH_HEN = 10;
let G3_SAY = null, G3_HELP = null;

function g3Layout() {
  const portrait = G3.H > G3.W;
  G3.home = { x: G3.W * (portrait ? .6 : .58), y: G3.H * (portrait ? .52 : .68) };
  G3.nest = { x: G3.W * (portrait ? .32 : .2), y: G3.H * (portrait ? .76 : .8) };
  G3.field = { x0: 50, x1: G3.W - 50, y0: G3.H * (portrait ? .36 : .45), y1: G3.H - (portrait ? 110 : 40) };
  const tr = mulberry(33); G3.tufts = []; for (let i = 0; i < 9; i++) G3.tufts.push([60 + tr() * (G3.W - 120), G3.field.y0 + tr() * (G3.field.y1 - G3.field.y0), .7 + tr() * .4]);
}
function g3Start() {
  g3Layout();
  G3.won = false; G3.winT = 0; G3.drag = null; G3.callT = 1.2; G3.sayT = 0; G3.t = 0;
  G3.hen = { x: G3.home.x, y: G3.home.y, st: 'out', t: 0, face: -1, tx: G3.home.x, ty: G3.home.y, wanderT: 0 };
  G3.chicks = [];
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * 6.283 + R(), r = 120 + R() * 120;
    G3.chicks.push({ i, kind: i % 5, x: G3.home.x + Math.cos(a) * r, y: G3.home.y + Math.sin(a) * r * .5, st: 'run', t: R() * 2, face: 1, ph: R() * 6, tx: 0, ty: 0, retarget: 0, hop: 0 });
  }
}
const g3InNest = (x, y) => { const n = G3.nest; return ((x - n.x) / 118) ** 2 + ((y - n.y) / 52) ** 2 < 1; };
// where a dropped chick or hen counts as "in the nest": wider and taller than the nest itself, so small fingers need not be exact
const g3DropIn = (x, y) => { const n = G3.nest; return ((x - n.x) / 175) ** 2 + ((y - n.y + 30) / 110) ** 2 < 1; };
const g3Home = () => G3.chicks.filter(c => c.st === 'nest').length;
function g3Slot(c) {                                    // spots inside the nest, two rows
  const used = new Set(G3.chicks.filter(o => o !== c && o.st === 'nest').map(o => o.slot));
  let s = 0; while (used.has(s)) s++;
  c.slot = s;
  const row = s < 5 ? 0 : 1, k = s % 5, n = G3.nest;
  return row === 0 ? { x: n.x - 72 + k * 36, y: n.y + 16 } : { x: n.x - 60 + k * 30, y: n.y - 12 };   // front rim, behind the hen
}
function g3Scatter(c, delay = 0) { c.st = 'hop'; c.hop = -delay; c.hx = c.x; c.hy = c.y; const a = -Math.PI / 2 + (R() - .5) * 2.4; c.tx = G3.nest.x + Math.cos(a) * 200 + 120; c.ty = G3.nest.y - 60 + R() * 40; }

function g3Update(dt) {
  G3.t += dt;
  const hen = G3.hen, F = G3.field;
  // the hen: wander and call while out; sit while in the nest; get up after 10 s if the brood is not home
  if (hen.st === 'out') {
    if ((hen.wanderT -= dt) <= 0) { hen.wanderT = 1.5 + R() * 2; hen.tx = G3.home.x + (R() - .5) * 160; hen.ty = G3.home.y + (R() - .5) * 50; }
    const dx = hen.tx - hen.x; hen.x += Math.sign(dx) * Math.min(Math.abs(dx), 40 * dt); hen.y += (hen.ty - hen.y) * Math.min(1, dt * 1.5);
    if (Math.abs(dx) > 2) hen.face = dx > 0 ? 1 : -1;
    if (!G3.won && (G3.callT -= dt) <= 0) { G3.callT = 3.6 + R() * 1.6; G3.sayT = 2.4; AU.cluck(); }
  } else if (hen.st === 'in') {
    hen.t += dt;
    if (hen.t > G3_WITH_HEN && !G3.won) {
      hen.st = 'leave'; hen.t = 0; hen.face = 1; AU.cluck();
      G3.chicks.filter(c => c.st === 'nest').forEach((c, k) => g3Scatter(c, .2 + k * .12));
    }
  } else if (hen.st === 'leave') {
    hen.t += dt; const k = Math.min(1, hen.t / 1.1);
    hen.x = G3.nest.x + (G3.home.x - G3.nest.x) * k; hen.y = G3.nest.y + (G3.home.y - G3.nest.y) * k - Math.sin(k * Math.PI) * 60;
    if (k >= 1) { hen.st = 'out'; G3.callT = .4; }
  }
  G3.sayT = Math.max(0, G3.sayT - dt); G3.helpT = Math.max(0, G3.helpT - dt);
  for (const c of G3.chicks) {
    c.ph += dt * 14;
    if (c.st === 'drag') continue;
    if (c.st === 'nest') {
      c.t += dt;
      if (hen.st !== 'in' && c.t > G3_ALONE && !G3.won) g3Scatter(c);
      continue;
    }
    if (c.st === 'hop') {
      c.hop += dt; if (c.hop < 0) continue;
      const k = Math.min(1, c.hop / .55); c.x = c.hx + (c.tx - c.hx) * k; c.y = c.hy + (c.ty - c.hy) * k - Math.sin(k * Math.PI) * 70; c.face = c.tx > c.hx ? 1 : -1;
      if (k >= 1) { c.st = 'run'; c.retarget = 0; AU.cheep(); }
      continue;
    }
    // running helter-skelter around the hen
    if ((c.retarget -= dt) <= 0) {
      c.retarget = .5 + R() * 1.1;
      const a = R() * 6.283, r = 90 + R() * 200;
      c.tx = Math.max(F.x0, Math.min(F.x1, hen.x + Math.cos(a) * r * 1.3)); c.ty = Math.max(F.y0, Math.min(F.y1, hen.y + Math.sin(a) * r * .55));
      if (g3InNest(c.tx, c.ty)) c.tx += 220;
      if (R() < .25) AU.cheep();
    }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy), sp = 150;
    if (d > 3) { c.x += dx / d * Math.min(d, sp * dt); c.y += dy / d * Math.min(d, sp * dt); c.face = dx > 0 ? 1 : -1; }
    c.x = Math.max(F.x0, Math.min(F.x1, c.x)); c.y = Math.max(F.y0, Math.min(F.y1, c.y));
  }
  if (!G3.won && g3Home() === 10) { G3.won = true; G3.smart = hen.st === 'in'; G3.winT = 0; AU.cluck(); setTimeout(() => AU.cheep(), 200); setTimeout(() => AU.cheep(), 420); }
  if (G3.won) { G3.winT += dt; if (G3.onWin) { const f = G3.onWin; G3.onWin = null; f(); } }   // the print shows the moment the last chick is home
}

/* ---------- input (logical coordinates) ---------- */
function g3Down(x, y) {
  if (G3.won) return;
  let best = null, bd = 38;
  for (const c of G3.chicks) { if (c.st === 'hop') continue; const d = Math.hypot(x - c.x, y - (c.y - 32)); if (d < bd) { bd = d; best = c; } }
  if (best) { G3.drag = { who: best, dx: best.x - x, dy: best.y - y }; if (best.st === 'nest') best.slot = -1; best.st = 'drag'; AU.cheep(); return true; }
  const h = G3.hen;
  if (h.st !== 'leave' && Math.abs(x - h.x) < 140 && y > h.y - 270 && y < h.y + 10) { G3.drag = { who: h, dx: h.x - x, dy: h.y - y, hen: true }; h.st = 'drag'; AU.cluck(); return true; }
  if (g3InNest(x, y + 10)) { G3.helpT = 3; AU.pluck(72); }            // "Hãy giúp gà mẹ đưa các con về tổ"
  return false;
}
function g3Move(x, y) { const d = G3.drag; if (!d) return; d.who.x = x + d.dx; d.who.y = y + d.dy; }
function g3Up() {
  const d = G3.drag; if (!d) return; G3.drag = null;
  const w = d.who, inside = g3DropIn(w.x, w.y - (d.hen ? 40 : 10));
  if (d.hen) {
    if (inside) { w.st = 'in'; w.t = 0; w.x = G3.nest.x; w.y = G3.nest.y + 6; w.face = 1; AU.pluck(76); }
    else { w.st = 'out'; w.tx = w.x; w.ty = Math.max(G3.field.y0, Math.min(G3.field.y1, w.y)); w.y = w.ty; w.wanderT = 1; }
    return;
  }
  if (inside) { const p = g3Slot(w); w.x = p.x; w.y = p.y; w.st = 'nest'; w.t = 0; AU.pluck(80 + g3Home()); }
  else { w.st = 'run'; w.retarget = 0; w.y = Math.max(G3.field.y0, Math.min(G3.field.y1, w.y)); }
}

/* ---------- drawing (logical coordinates, u = CSS px per unit) ---------- */
function g3DrawChick(g, c, s = 1) {
  const A = c3Art(), run = c.st === 'run' || c.st === 'hop', lift = c.st === 'drag' ? 14 : 0;
  const bob = run ? -Math.abs(Math.sin(c.ph)) * 3 : c.st === 'nest' ? Math.sin(G3.t * 3 + c.i) * 1 : 0;
  g.save(); g.translate(c.x, c.y - lift + bob); g.scale(c.face * s, s);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath();
  const sw = run ? Math.sin(c.ph) * 6 : c.st === 'drag' ? Math.sin(G3.t * 20) * 4 : 0;
  if (c.st !== 'nest') { g.moveTo(-3, -10); g.lineTo(-3 + sw, 0); g.moveTo(5, -10); g.lineTo(5 - sw, 0); }
  g.stroke();
  dp(g, A.chicks[c.kind], 0, 0, c.st === 'drag' ? Math.sin(G3.t * 12) * .12 : 0);
  g.restore();
}
function g3Render(ctx2, u) {
  const A = c3Art(), W = G3.W, H = G3.H, n = G3.nest, hen = G3.hen;
  const g = ctx2;
  // ground mound under the flock, and a second one for the nest
  dp(g, c3Mound(W * .9), W / 2, G3.field.y1 + 18);
  dp(g, c3Mound(300), n.x, n.y + 44);
  for (const [fx, fy, s] of G3.tufts || []) dp(g, PROPS.tufts[(fx | 0) % 3], fx, fy, 0, s, s);
  dp(g, A.nestBack, n.x, n.y);
  const inNest = G3.chicks.filter(c => c.st === 'nest').sort((a, b) => a.y - b.y);
  const henFront = hen.st === 'in';
  for (const c of inNest) if (c.slot >= 5) g3DrawChick(g, c, .85);
  const headRot = hen.st === 'in' ? Math.sin(G3.t * 2.2) * .2 + Math.sin(G3.t * 5.3) * .05 : Math.sin(G3.t * 3.4) * .12;   // she keeps looking about
  // sitting deep in the nest, tail fanned towards the yard
  if (henFront) { g.save(); g.translate(hen.x, hen.y + 36); g.scale(-.56, .56); c3Hen(g, A.henSit, 0, 0, 0, headRot); g.restore(); }
  for (const c of inNest) if (c.slot < 5) g3DrawChick(g, c, .9);
  dp(g, A.nestFront, n.x, n.y);
  // her patience while she sits: a small red disc above her head that unwinds backwards
  if (hen.st === 'in' && !G3.won) {
    const k = Math.max(0, 1 - hen.t / G3_WITH_HEN), cx = hen.x - C3_HEAD_TOP[0] * .56, cy = hen.y + 36 + C3_HEAD_TOP[1] * .56 - 24;
    g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(cx, cy, 17, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#a3332a'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 13, -Math.PI / 2, -Math.PI / 2 - k * 6.283, true); g.closePath(); g.fill();
  }
  const out = G3.chicks.filter(c => c.st !== 'nest').sort((a, b) => a.y - b.y);
  const drawHen = () => { if (henFront) return; g.save(); g.translate(hen.x, hen.y - (hen.st === 'drag' ? 16 : 0)); g.scale(hen.face * .76, .76); c3Hen(g, A.hen, 0, 0, hen.st === 'drag' ? Math.sin(G3.t * 10) * .05 : 0, headRot); g.restore(); };
  let henDone = false;
  for (const c of out) { if (!henDone && c.y > hen.y && c !== G3.drag?.who) { drawHen(); henDone = true; } if (c.st !== 'drag') g3DrawChick(g, c); }
  if (!henDone) drawHen();
  if (G3.drag && !G3.drag.hen) g3DrawChick(g, G3.drag.who, 1.1);
  // "Trời tối rồi, mau về tổ nào!"
  if (G3.sayT > 0 && hen.st === 'out') {
    G3_SAY = G3_SAY || slipLabel(['TRỜI TỐI RỒI,', 'MAU VỀ TỔ NÀO!'], 102);
    const k = Math.min(1, (2.4 - G3.sayT) / .15, G3.sayT / .3), S = .68, half = 110 * S;
    // just up and to the left of her head, so the trailing ink dots end at her face
    const headX = hen.x + 90 * hen.face, headY = hen.y - 217;
    const x = Math.max(half + 14, Math.min(G3.W - half - 14 - 30, hen.face > 0 ? headX - 118 : headX - 150)), y = Math.max(150, headY - 24);
    g.save(); g.globalAlpha = k; g.translate(x, y); dp(g, G3_SAY, 0, 0, -.03, S, S); g.restore();
  }
  if (G3.helpT > 0) {
    G3_HELP = G3_HELP || slipLabel(['HÃY GIÚP GÀ MẸ', 'ĐƯA CÁC CON VỀ TỔ'], 120);
    const k = Math.min(1, (3 - G3.helpT) / .15, G3.helpT / .3), S = .72, half = 126 * S;
    g.save(); g.globalAlpha = k; g.translate(Math.max(half + 14, Math.min(G3.W - half - 40, n.x + 20)), n.y - 108); dp(g, G3_HELP, 0, 0, .03, S, S); g.restore();
  }
  // ten chick counters along the top
  for (let i = 0; i < 10; i++) {
    const c = G3.chicks[i], home = c.st === 'nest';
    g.save(); g.globalAlpha = home ? 1 : .22; g.translate(W / 2 - 4.5 * (W < 520 ? 40 : 44) + i * (W < 520 ? 40 : 44), (H > W ? 118 : 64) + (home ? Math.sin(G3.t * 4 + i) * 1.5 : 0)); g.scale(.62, .62); dp(g, A.chicks[c.kind], 0, 0); g.restore();
  }
}

/* ---------- the reward print ---------- */
let G3_TITLE = null;
function g3RenderPrint(g, W, H, k) {
  const A = c3Art(), tall = H > W * 1.15;
  G3_TITLE = G3_TITLE || part([-230, -34, 230, 34], a => { a.text('ĐÀN GÀ MẸ CON', 0, 2, 40, 'dark', '"Playfair Display", serif', 'ink', 900); });
  // a landscape print on wide screens, a portrait one on phones
  const L = tall ? { fw: 260, fh: 390, title: -332, mound: [470, 272], hen: [60, 258, .95], seal: [196, 330],
      spots: [[-190, 262, 1, 1.2], [-112, 270, -1, 1.15], [150, 270, 1, 1.15], [212, 262, -1, 1.1], [-185, -20, 1, 1.05], [192, -80, -1, 1.05], [-120, -210, 1, 1], [120, -250, -1, 1], [30, -150, -1, 1.05], [-205, 120, 1, 1.1]] }
    : { fw: 440, fh: 270, title: -214, mound: [760, 222], hen: [-10, 206, 1.25], seal: [360, 200],
      spots: [[-330, 205, 1, 1.25], [-250, 212, -1, 1.2], [230, 214, 1, 1.25], [320, 205, -1, 1.2], [140, 60, -1, 1.1], [300, 40, 1, 1.05], [-160, -20, 1, 1.05], [-60, -60, 1, 1], [330, -90, -1, 1], [-330, 60, 1, 1.1]] };
  const s = Math.min(W / (L.fw * 2 + 100), (H - 110) / (L.fh * 2 + 60)), cx = W / 2, cy = (H - 90) / 2 + 10;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  const pop = .9 + .1 * Math.min(1, k * 2);
  g.scale(pop, pop);
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 5; g.fillRect(-L.fw, -L.fh, L.fw * 2, L.fh * 2); g.strokeRect(-L.fw, -L.fh, L.fw * 2, L.fh * 2);
  g.lineWidth = 1.6; g.strokeRect(-L.fw + 14, -L.fh + 14, L.fw * 2 - 28, L.fh * 2 - 28);
  dp(g, G3_TITLE, 0, L.title, 0, tall ? .95 : 1, tall ? .95 : 1);
  dp(g, c3Mound(L.mound[0]), 0, L.mound[1]);
  g.save(); g.translate(L.hen[0], L.hen[1]); g.scale(L.hen[2], L.hen[2]); c3Hen(g, A.hen, 0, 0); g.restore();
  L.spots.forEach(([x, y, f, sc], i) => { const hop = Math.abs(Math.sin(k * 3 + i)) * 4 * Math.min(1, k); g.save(); g.translate(x, y - hop); g.scale(f * sc, sc); dp(g, A.chicks[i % 5], 0, 0); g.restore(); });
  if (k > .5) { const kk = Math.min(1, (k - .5) / .3), sc = 1.8 - .8 * kk; g.globalAlpha = kk; dp(g, PROPS.seal, L.seal[0], L.seal[1], -.08, sc, sc); g.globalAlpha = 1; }
  g.restore();
}

C3GAMES[0] = {
  han: '母雞', name: 'Đàn Gà Mẹ Con', paper: 'white',
  print: 'img/ch3/dan-ga-me-con.jpg',            // the reward: a photo of the real Đông Hồ print
  isWon: () => G3.won,
  praise: () => G3.smart ? 'Bạn thật thông minh!' : 'Tuyệt vời! Bạn có một đôi tay siêu nhanh!',
  start: g3Start, update: g3Update, render: g3Render, printRender: g3RenderPrint,
  down: g3Down, move: g3Move, up: g3Up,
  resize(W, H) { const oldW = G3.W, oldH = G3.H; G3.W = W; G3.H = H; if (!G3.hen) return; const sx = W / oldW, sy = H / oldH; g3Layout(); for (const o of [G3.hen, ...G3.chicks]) { o.x *= sx; o.y *= sy; o.tx *= sx; o.ty *= sy; } },
  onWin(f) { G3.onWin = f; },
};
