/* Góc Tĩnh Tâm · the incense (owner 2026-10-29: "khi thắp nhang thì đổi view sang góc kiểu 3D, 2 tay cầm nhang, zoom vào bát nhang có số
   nhang đang cắm sẵn, nhang nào cháy hết thì còn lại chân nhang"). Every stick lit today is in TT.incTs (the time it was lit; the Worker
   keeps them); a stick burns down over TT_BURN and then stays as a stub; the sticks of earlier days are stubs too (TT.incAll − today).
   Tapping the urn (once a Vietnam day) plays a close view: the urn fills the screen with what stands in it, a lit stick comes up from below,
   bows twice and goes into the ash (no hands, owner); then the view goes back. No numbers are shown anywhere (owner). */
const TT_BURN = 30 * 60e3, TT_LIGHT_LEN = 7.2, TT_PERM = 3;   // TT_PERM: sticks that always burn in the urn (owner: always incense and smoke)
// where stick i stands in the ash (owner: the first ones in the middle, more spread out round them): 0 in the middle, then one each side,
// further out each time, a little jitter; once the mouth is full they fill in between. Sticks lean a little outward, the outer ones more
const ttStickPos = i => {
  const h = Math.sin(i * 12.9898) * 43758.5453, u = h - Math.floor(h), k = Math.ceil(i / 2), side = i % 2 ? 1 : -1, step = 5.2;
  let bx = side * k * step; if (Math.abs(bx) > 40) bx = side * (((k * step) % 40) + 2.6);
  bx += (u - .5) * 2.4;
  return { bx, len: 64 + ((i * 7) % 5) * 5 - Math.abs(bx) * .15, lean: bx / 40 * .32 + (u - .5) * .08 };
};
// TESTING ONLY (owner: "tạm mở thắp nhang bét nhè để test"): any number of sticks a day, kept on this device only, never sent to the
// Worker. Set to false before release.
const TT_INCENSE_TEST = false;
function ttStickTimes() {
  if (TT_INCENSE_TEST && !TT.testSeeded) {                                  // TESTING ONLY (owner: "cho mấy que nhang đã cháy hết"): sticks lit earlier today,
    TT.testSeeded = true; const now = Date.now();                           // five burnt out to their red feet, three part burnt
    TT.incTs = [now - 95 * 60e3, now - 80 * 60e3, now - 70 * 60e3, now - 50 * 60e3, now - 40 * 60e3, now - 24 * 60e3, now - 15 * 60e3, now - 6 * 60e3, ...(TT.incTs || [])];
    TT.inc = (TT.inc || 0) + 8;
  }                                                   // today's sticks, oldest first; a missing time counts as just lit
  const n = Math.min(TT.inc || 0, 40), T = (TT.incTs || []).slice(-40);
  while (T.length < n) T.unshift(Date.now() - T.length * 60e3);
  return T;
}
// one stick as real ones are: the red bamboo foot below (chân nhang, H units of it showing), the brown incense above it, a little thicker
function ttStickLine(g, x0, y0, x1, y1, w, H) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, k = Math.min(1, H / L), hx = x0 + (x1 - x0) * k, hy = y0 + (y1 - y0) * k;
  g.lineCap = 'round';
  g.strokeStyle = '#b3302a'; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(hx, hy); g.stroke();
  if (k < 1) { g.strokeStyle = '#6e4a2c'; g.lineWidth = w * 1.35; g.beginPath(); g.moveTo(hx, hy); g.lineTo(x1, y1); g.stroke(); }
}
function ttSticks(g, x, y, sc) {
  const T = ttStickTimes(), now = Date.now(), stubs = Math.min(Math.max(0, (TT.incAll || 0) - T.length), 60), t = TT.t;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.lineCap = 'round';
  const stub = (bx, len, lean, i) => {                                      // a stick burnt out: a short dark stem with a grey tip
    g.strokeStyle = i % 3 ? '#b3302a' : '#9a2a24'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(bx, -80); g.lineTo(bx + Math.sin(lean) * len, -80 - Math.cos(lean) * len); g.stroke();   // only the red foot is left
    g.fillStyle = 'rgba(70,60,52,.8)'; g.beginPath(); g.arc(bx + Math.sin(lean) * len, -80 - Math.cos(lean) * len, 1.2, 0, 6.283); g.fill();
  };
  for (let i = 0; i < stubs; i++) { const h = Math.sin(i * 78.233 + 1) * 43758.5453, u = h - Math.floor(h); stub((u - .5) * 84, 7 + ((i * 5) % 7), (u - .5) * .4, i); }
  for (let i = 0; i < TT_PERM; i++) {                                      // the ones always burning, never shorter
    const { bx, len, lean } = ttStickPos(i), tx = bx + Math.sin(lean) * len, ty = -80 - Math.cos(lean) * len;
    ttStickLine(g, bx, -80, tx, ty, 2.2, 16);
    g.fillStyle = `rgba(214,62,34,${.75 + .25 * Math.sin(t * 3 + i)})`; g.beginPath(); g.arc(tx, ty, 1.5, 0, 6.283); g.fill();   // the ember: a tiny red tip only
    g.strokeStyle = 'rgba(245,242,230,.3)'; g.lineWidth = 1.6; g.beginPath();
    for (let k = 0; k <= 12; k++) { const v = k / 12, sx = tx + Math.sin(t * .8 + v * 5 + i * 2) * 9 * v, sy = ty - v * 130; k ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
    g.stroke();
  }
  const tsAll = TT.incTs || [], posAll = TT.incPos || [];                 // where each was planted (owner: a stick stays where it was put); older ones without a place take a slot
  T.forEach((ts, i0) => {
    const pi = tsAll.length - T.length + i0 - (tsAll.length - posAll.length), p = pi >= 0 ? posAll[pi] : null;
    const i = i0 + TT_PERM, d = ttStickPos(i), bx = p ? p[0] : d.bx, lean = p ? p[1] : d.lean, len = d.len, b = (now - ts) / TT_BURN;
    if (b >= 1) { stub(bx, 9 + (i % 4), lean, i); return; }
    const L = 10 + (len - 10) * (1 - b), tx = bx + Math.sin(lean) * L, ty = -80 - Math.cos(lean) * L;
    ttStickLine(g, bx, -80, tx, ty, 2.2, 16);                              // burning down from the top: the brown part shortens, the red foot stays
    const fresh = i0 === T.length - 1 && now - ts < 6e3, glow = .7 + .3 * Math.sin(t * 3 + i);
    g.fillStyle = `rgba(${fresh ? 232 : 214},${fresh ? 80 : 62},34,${glow})`; g.beginPath(); g.arc(tx, ty, 1.5, 0, 6.283); g.fill();
    if (i % Math.max(1, Math.ceil(T.length / 5)) === 0 || fresh) {
      g.strokeStyle = 'rgba(245,242,230,.28)'; g.lineWidth = 1.6; g.beginPath();
      for (let k = 0; k <= 12; k++) { const v = k / 12, sx = tx + Math.sin(t * .8 + v * 5 + i) * 9 * v, sy = ty - v * 120; k ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
      g.stroke();
    }
  });
  g.restore();
}

/* ---------- lighting one: the close view ----------
   The player holds the lit stick (owner: "người chơi cầm que nhang khua qua lại, có khói bay, xong cắm vào bát; 3 s sau tự thoát"): it follows
   the finger or the mouse, leans as it is waved, its smoke trails behind; let go over the mouth of the urn and it goes into the ash at the
   next free place; three seconds later the view goes back. ← (or Esc) leaves without lighting. */
function ttIncense() {
  if (!TT_INCENSE_TEST && (TT.lit || TT_SAVE.litDay === ttDay())) { toast(lg('Hôm nay bạn đã thắp nhang rồi. Mai quay lại nhé.', 'You have lit incense today already. Come back tomorrow.'), 3); return; }
  if (TT.light) return;
  TT.light = { st: 'hold', t: 0, bx: null, by: null, lean: 0, vx: 0, px: null, smoke: [], fade: 0 }; TT.keys.clear(); if (TT.me.mv === 1) TT.me.mv = 0;
}
const ttEase = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
function ttLightGeo(W, H) {                                                 // where the urn sits in the close view, and its scale
  const U = Math.min(W / 150, H / 175) * .92, cx = W / 2, by = H * .99;
  return { U, cx, by, mouthY: by - 80 * U, mouthW: 46 * U };
}
function ttLightUpdate(dt) {
  const L = TT.light; if (!L) return;
  L.t += dt;
  const W = cv.width / DPR, H = cv.height / DPR, G = ttLightGeo(W, H);
  if (L.bx == null) { L.bx = W / 2; L.by = H * .9; L.px = L.bx; }
  if (L.st === 'hold') {
    const v = (L.bx - L.px) / Math.max(dt, 1e-3); L.px = L.bx; L.vx += (v - L.vx) * Math.min(1, dt * 10);
    const want = Math.max(-.22, Math.min(.22, -L.vx / 4500)); L.lean += (want - L.lean) * Math.min(1, dt * 4);   // only a little (owner: it swung too much)   // waved, the stick leans back against the motion, then rights itself
    const len = ttStickPos(ttStickTimes().length + TT_PERM).len * G.U * 1.35, tx = L.bx + Math.sin(L.lean) * len, ty = L.by - Math.cos(L.lean) * len;
    L.tip = [tx, ty];
    for (let i = 0; i < 2; i++) L.smoke.push({ x: tx, y: ty, vx: (Math.random() - .5) * 14, vy: -26 - Math.random() * 18, life: 0, max: 2.4 + Math.random(), r: 2 + Math.random() * 2 });
  } else if (L.st === 'done') {
    L.doneT += dt; if (L.doneT > 3) L.fade += dt / .6; if (L.fade >= 1) { TT.light = null; return; }
  }
  for (const p of L.smoke) { p.life += dt; p.x += (p.vx + Math.sin(p.life * 2.2 + p.r) * 10) * dt; p.y += p.vy * dt; p.vy *= .995; p.r += dt * 5; }
  L.smoke = L.smoke.filter(p => p.life < p.max);
}
function ttLightGrab(x, y) {                                                // held where it was touched: the nearest point of the stick stays under the finger
  const L = TT.light; if (!L || L.st !== 'hold') return;
  const dx = Math.sin(L.lean), dy = -Math.cos(L.lean), len = L.tip ? Math.hypot(L.tip[0] - L.bx, L.tip[1] - L.by) : 0;
  L.grab = L.bx == null ? 0 : Math.max(0, Math.min(len, (x - L.bx) * dx + (y - L.by) * dy));
  L.drag = true; ttLightMove(x, y);
}
function ttLightMove(x, y) { const L = TT.light; if (!L || !L.drag || L.st !== 'hold') return; const g = L.grab || 0; L.bx = x - Math.sin(L.lean) * g; L.by = Math.max(y + Math.cos(L.lean) * g, 80); }
function ttLightDrop() {
  const L = TT.light; if (!L || L.st !== 'hold') return; L.drag = false;
  const W = cv.width / DPR, H = cv.height / DPR, G = ttLightGeo(W, H);
  if (Math.abs(L.bx - G.cx) < G.mouthW && L.by > G.mouthY - 50 * G.U && L.by < G.mouthY + 40 * G.U) {   // let go over the mouth: it goes in
    L.st = 'done'; L.doneT = 0; TT.lit = true; TT_SAVE.litDay = ttDay(); ttPersist();
    const px = +Math.max(-44, Math.min(44, (L.bx - G.cx) / G.U)).toFixed(1), pl = +Math.max(-.3, Math.min(.3, L.lean)).toFixed(3);   // exactly where it went in
    (TT.incTs = TT.incTs || []).push(Date.now()); (TT.incPos = TT.incPos || []).push([px, pl]); TT.inc = (TT.inc || 0) + 1; TT.incAll = (TT.incAll || 0) + 1; AU.zenBell(.7);
    if (TT.on && !TT_INCENSE_TEST) ttSend({ t: 'incense', x: px, lean: pl });
  }
}
function ttLightDraw(g, W, H) {
  const L = TT.light; if (!L) return;
  const a = ttEase(L.t / .6) * (1 - ttEase(L.fade)), A = ttArt(), G = ttLightGeo(W, H);
  g.save(); g.globalAlpha = a;
  const bg = g.createRadialGradient(W / 2, H * .35, 10, W / 2, H * .45, Math.max(W, H) * .8);   // a warm dim hall
  bg.addColorStop(0, '#5a4424'); bg.addColorStop(.45, '#2e2418'); bg.addColorStop(1, '#141009'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) { const h = Math.sin(i * 91.7) * 43758.5453, u = h - Math.floor(h), v = (h * 7) % 1, r = 18 + u * 46; g.fillStyle = `rgba(255,${190 + u * 40 | 0},110,${.05 + v * .07})`; g.beginPath(); g.arc(W * ((u * 1.3 + i * .07) % 1), H * (.08 + v * .45), r, 0, 6.283); g.fill(); }
  dp(g, A.urn, G.cx, G.by, 0, G.U, G.U); ttSticks(g, G.cx, G.by, G.U);
  if (L.st === 'hold') {
    const pulse = .25 + .2 * Math.sin(L.t * 3);                          // the ash glows a little where the stick may go
    g.fillStyle = `rgba(255,220,140,${pulse})`; g.beginPath(); g.ellipse(G.cx, G.mouthY, G.mouthW, 6 * G.U, 0, 0, 6.283); g.fill();
  }
  for (const p of L.smoke) { const k = p.life / p.max; g.fillStyle = `rgba(238,234,226,${.35 * (1 - k)})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); }
  if (L.st === 'hold' && L.tip) {                                           // the stick in the hand: a red stem with a plain foot and a glowing tip
    const [tx, ty] = L.tip, w = 2.6 * G.U * 1.35; g.lineCap = 'round';
    ttStickLine(g, L.bx, L.by, tx, ty, w * .85, 16 * G.U * 1.35);
    const gl = g.createRadialGradient(tx, ty, 0, tx, ty, 4 * G.U); gl.addColorStop(0, 'rgba(255,120,60,.35)'); gl.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(tx, ty, 4 * G.U, 0, 6.283); g.fill();   // only a faint warmth round it
    g.fillStyle = '#d63e22'; g.beginPath(); g.arc(tx, ty, 1.6 * G.U, 0, 6.283); g.fill();
  }
  // ← back, without lighting
  g.fillStyle = 'rgba(244,234,208,.92)'; g.strokeStyle = INK; g.lineWidth = 2.4; const bx = 14, by = safeTop() + 8; g.beginPath(); g.roundRect ? g.roundRect(bx, by, 40, 40, 10) : g.rect(bx, by, 40, 40); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '700 20px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('←', bx + 20, by + 21);
  L.back = [bx, by, 40, 40];
  g.restore();
}
