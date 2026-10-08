/* Tranh 6 · the monkey bridge at dawn (owner's design, after the tale behind Bắc Kim Thang: chú bán dầu must cross the cầu
   khỉ with his two cans of oil). He dozes by the bridge until the frogs are caught; then he gets up with his load. Tap him:
   the view dives down to a top view and counts 3-2-1. Then he trots on by himself, staggering under the pole, and the player
   only turns him — a tap anywhere (a click, Space or an arrow key) swings him the other way — along a single bamboo pole
   zigzagging over a lotus pond, like Dancing Line. Every bend falls on a note of Bắc Kim Thang, which plays once across
   (about 30 s), at one steady speed. Big
   lotus leaves lie over the bridge and part only as he comes near. A tap must come within T6C_WIN of a bend; otherwise he
   falls in and starts over from the start. Across, the sun comes up and the party may cross. */

const T6C_BPM = 100, T6C_BEAT = 60 / T6C_BPM, T6C_BEATS = 50;          // one time through the tune (owner)
const T6C_SPEED = 340;                                                    // one steady speed (owner; the changing speeds were dropped)
const T6C_POLE = 9;                                                       // half the width of the bamboo pole as drawn
const T6C_PART = 380;                                                     // the leaves over the bridge part this close to him
// Bắc Kim Thang, from the owner's score (G major, 2/4, 25 bars): [midi, eighths]; one crotchet = one beat
const T6C_TUNE = [[71, 2], [69, 2], [67, 3], [62, 1], [67, 2], [69, 1], [67, 1], [64, 4], [64, 2], [67, 2], [62, 3], [62, 1], [62, 2], [67, 2], [64, 4],
  [71, 2], [71, 2], [62, 3], [64, 1], [62, 2], [64, 2], [74, 4], [71, 2], [71, 2], [71, 3], [62, 1], [64, 2], [64, 1], [67, 1], [69, 4],
  [69, 2], [69, 2], [69, 3], [71, 1], [71, 2], [64, 1], [67, 1], [62, 4], [67, 2], [62, 2], [64, 2], [62, 1], [64, 1], [62, 2], [71, 2],
  [67, 2], [62, 2], [67, 2], [null, 2]];
const T6C_BASS = [[43, 12], [48, 8], [47, 8], [48, 8], [50, 8], [43, 16], [50, 16], [47, 8], [48, 4], [50, 4], [43, 2], [50, 2], [43, 2], [null, 2]];
const T6C_AT = (seq => { const a = {}; let k = 0; for (const [m, n] of seq) { if (m) a[k] = [m, n]; k += n; } return a; });
const T6C_TUNE_AT = T6C_AT(T6C_TUNE), T6C_BASS_AT = T6C_AT(T6C_BASS), T6C_TUNE_LEN = 100;   // in eighths
const T6C_REPLAY = false;                                                 // while testing (owner): after crossing he waits at the foot again to be played anew — set false for release
const T6C = { st: 'off', k: 0, done: false, segs: null };

// the bridge: straight runs at 45°, alternately up-right and up-left; every bend on a note of the tune that starts on a
// beat (owner: the bar starts matched best, off-beat bends did not) — in the first eight bars only where a bar starts;
// a run lasts at least a beat
function t6cPath() {
  const r = mulberry(616), q = (a, b) => a + (b - a) * r(), E = T6C_TUNE_LEN, bends = [];
  let last = 0;
  for (let c = 8; c < E - 2; c += 2) {
    if (!T6C_TUNE_AT[c] || c - last < 2) continue;
    if (c < 32 && c % 4) continue;
    bends.push(c); last = c;                                              // every such note bends, none skipped (owner: notes without a bend misled)
  }
  bends.push(E);
  const segs = []; let px = 0, py = 0, d = 1, c0 = 0;
  for (const c of bends) {
    const v = T6C_SPEED;
    const L = (c - c0) * T6C_BEAT / 2 * v / Math.SQRT2;
    segs.push({ x0: px, y0: py, x1: px + d * L, y1: py - L, dir: d, v, b0: c0 / 2, b1: c / 2 });
    px += d * L; py -= L; c0 = c; d = -d;
  }
  // lotus leaves: big ones lying over the pole all along it (they part as he comes), and more all over the water; flowers
  const leaves = [], buds = [], minX = Math.min(...segs.map(s => Math.min(s.x0, s.x1))) - 420, maxX = Math.max(...segs.map(s => Math.max(s.x0, s.x1))) + 420, top = segs[segs.length - 1].y1;
  for (const s of segs) { const L = Math.hypot(s.x1 - s.x0, s.y1 - s.y0); for (let u = 30; u < L - 10; u += 64 + r() * 30) { const k = u / L, o = q(-26, 26); leaves.push({ x: s.x0 + (s.x1 - s.x0) * k + o * .7, y: s.y0 + (s.y1 - s.y0) * k + o * .7, r: 52 + r() * 30 }); } }
  for (let i = 0; i < (maxX - minX) * (-top + 400) / 16000; i++) leaves.push({ x: q(minX, maxX), y: q(top + 10, -10), r: 40 + r() * 36 });
  for (let i = leaves.length - 1; i >= 0; i--) { const l = leaves[i]; if (l.y > -l.r * .6 || l.y < top + 20 + l.r * .6) leaves.splice(i, 1); }   // none spilling onto the banks
  for (const l of leaves) {
    l.v = (r() * 4) | 0; l.rot = r() * 6.283; l.ph = r() * 6.283; l.ox = 0; l.oy = 0; l.h = r() < .5 ? 0 : 16 + r() * 60; l.rt = 0; l.pv = 0;   // h: up on a stalk (owner: high and low leaves)
    let bd = 1e9, bs = null; for (const s of segs) { const q = t6cDist(s, l.x, l.y); if (q < bd) { bd = q; bs = s; } }
    const dx = bs.x1 - bs.x0, dy = bs.y1 - bs.y0, L2 = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((l.x - bs.x0) * dx + (l.y - bs.y0) * dy) / L2));
    l.px = bs.x0 + u * dx; l.py = bs.y0 + u * dy; l.d = bd;                 // the nearest point of the bridge under it
    const n = Math.hypot(l.x - l.px, l.y - l.py);
    if (n > 1) { l.nx = (l.x - l.px) / n; l.ny = (l.y - l.py) / n; } else { l.nx = -dy / Math.sqrt(L2); l.ny = dx / Math.sqrt(L2); }
    l.need = Math.max(0, l.r + T6C_POLE + 14 - bd);                       // how far it must slide to clear the pole
    if (bd < l.r + 90) l.h = 0;                                          // near the bridge they lie flat on the water: nothing tall in front of him
    if (l.need) {                                                         // at a bend, slide the way that clears every run near it, not only the nearest
      const clear = l.r + T6C_POLE + 14, near = segs.filter(q => t6cDist(q, l.x, l.y) < clear + 280); let best = null;
      for (let k = 0; k < 16; k++) { const ax = Math.cos(k * Math.PI / 8), ay = Math.sin(k * Math.PI / 8);
        for (let d = 8; d < 300; d += 8) if (near.every(q => t6cDist(q, l.x + ax * d, l.y + ay * d) >= clear)) { if (!best || d < best[0]) best = [d, ax, ay]; break; } }
      if (best) { [l.need, l.nx, l.ny] = best; }
    }
  }
  leaves.sort((a, b) => a.need - b.need);                                  // the covering leaves on top
  for (let i = 0; i < (maxX - minX) * (-top + 400) / 60000; i++) buds.push({ x: q(minX, maxX), y: q(top + 10, -10), ph: r() * 6.283, h: 50 + r() * 60, s: .8 + r() * .3 });
  const end = segs[segs.length - 1], bank = [], streaks = [];
  const tuft = (x, y) => bank.push({ x, y, k: (r() * 3) | 0, s: .7 + r() * .45, kind: 'tuft' }), bam = (x, y) => bank.push({ x, y, s: .7 + r() * .35, f: r() < .5 ? 1 : -1, kind: 'bamboo' });
  for (let i = 0; i < 34; i++) tuft(q(-650, 650), q(38, 170));                                         // the near bank: the road he came from
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) bam(sd * q(200, 430), q(45, 130));
  for (let i = 0; i < 40; i++) tuft(end.x1 + q(-800, 800), end.y1 - q(35, 360));                     // the far bank
  for (let i = 0; i < 9; i++) { const x = end.x1 + (i % 2 ? 1 : -1) * q(120, 700); bam(x, end.y1 - q(60, 380)); }
  for (const [y0, y1, x0] of [[40, 700, 0], [end.y1 - 700, end.y1 - 30, end.x1]]) for (let i = 0; i < 60; i++) streaks.push({ x: x0 + q(-1100, 1100), y: q(y0, y1), l: 16 + r() * 34 });
  const storks = [], hops = [], flies = [], along = (i0) => { const sg = segs[i0 + ((r() * (segs.length - i0)) | 0)], u = r(), dx = sg.x1 - sg.x0, dy = sg.y1 - sg.y0, L = Math.hypot(dx, dy); return [sg.x0 + dx * u, sg.y0 + dy * u, -dy / L, dx / L]; };
  for (let i = 0; i < 7; i++) { const [x, y, nx, ny] = along(1), sd = r() < .5 ? -1 : 1, o = q(150, 330); storks.push({ x: x + nx * o * sd, y: y + ny * o * sd, sd, f: r() < .5 ? 1 : -1 }); }
  for (let i = 0; i < 12; i++) { const [x, y, nx, ny] = along(0), sd = r() < .5 ? -1 : 1, o = q(70, 150); hops.push({ x: x + nx * o * sd, y: y + ny * o * sd, tx: x + nx * (o + q(110, 170)) * sd, ty: y + ny * (o + q(110, 170)) * sd - q(0, 60), rot: r() * 6.283 }); }
  for (let i = 0; i < 60; i++) { const [x, y, nx, ny] = along(0), o = q(-420, 420); flies.push({ x: x + nx * o, y: y + ny * o, h: q(20, 130), ph: r() * 6.283, sp: .4 + r() * .6 }); }
  return { segs, bank, streaks, storks, hops, flies, leaves, buds: buds.filter(b => segs.every(s => t6cDist(s, b.x, b.y) > 140)) };
}
function t6cDist(s, x, y) {                                               // distance from a point to one run of the bridge
  const dx = s.x1 - s.x0, dy = s.y1 - s.y0, L2 = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((x - s.x0) * dx + (y - s.y0) * dy) / L2));
  return Math.hypot(x - s.x0 - u * dx, y - s.y0 - u * dy);
}
const t6cRunAt = t => T6C.segs.find(s => t >= s.b0 * T6C_BEAT && t < s.b1 * T6C_BEAT) || T6C.segs[T6C.segs.length - 1];   // the run he should be on at time t

/* ---------- the run ---------- */
// the tune and the soft beat, scheduled a little ahead on the game clock and early by the speakers' delay, so each note
// is heard just as he reaches its bend (owner: the bends felt off the music)
const T6C_AHEAD = .12;
function t6cSchedule() {
  const T = T6C, lat = AU.latency ? AU.latency() : 0, half = T6C_BEAT / 2;
  while ((T.step + 1) * half <= T.t + T6C_AHEAD && T.step + 1 < T6C_TUNE_LEN) {
    const st = ++T.step, inS = Math.max(0, st * half - T.t - lat), m = T6C_TUNE_AT[st], bs = T6C_BASS_AT[st];
    if (m) AU.note(m[0], m[1] * half * .95 + .05, .13, inS);
    if (bs) AU.bassNote(bs[0], bs[1] * half, inS);
    if (st % 2 === 0) AU.beat(st % 8 === 0, inS);
  }
}
// he runs on rails, like Dancing Line (owner: he strayed off the pole without falling): his place is the bridge's at the
// clock's time; a tap within T6C_WIN of a bend takes it (waiting for a late one he balks at the corner, then catches up along the
// pole), a bend let slip sends him straight on off the pole's end, a tap with no bend near turns him into the water. A fall starts over from the start.
const T6C_WIN = .15;
function t6cPos(t) {                                                      // where the bridge has him at time t
  const s = t6cRunAt(t), u = Math.max(0, Math.min(1, (t - s.b0 * T6C_BEAT) / ((s.b1 - s.b0) * T6C_BEAT)));
  return [s.x0 + (s.x1 - s.x0) * u, s.y0 + (s.y1 - s.y0) * u, s.dir];
}
function t6cStart() {
  const s = T6C.segs[0];
  for (const k of T6C.storks) { k.st = 'stand'; k.t = 0; } for (const h of T6C.hops) { h.st = 'sit'; h.t = 0; }
  Object.assign(T6C, { st: 'count', ct: 0, beat: -1, x: s.x0, y: s.y0, dir: s.dir, t: 0, next: 0, offX: 0, offY: 0, fallT: 0, winT: 0, cp: 0 });
  T6C.bends = T6C.segs.slice(0, -1).map(q => q.b1 * T6C_BEAT);
  T6C.camX = s.x0; T6C.camY = s.y0;
}
function t6cFall(dx, dy) { const T = T6C; T.st = 'fall'; T.fallT = 0; T.fdx = dx; T.fdy = dy; AU.swoosh(); }
function t6cTurn() {                                                      // one tap (click, key) = take the bend (owner)
  const T = T6C; if (T.st !== 'run') return;
  const tb = T.bends[T.next];
  if (tb != null && Math.abs(T.t - tb) <= T6C_WIN) {
    T.next++; AU.tap();
    if (T.t > tb) { const [px, py] = t6cPos(T.t); T.offX = T.x - px; T.offY = T.y - py; }   // late: from the corner, catching up along the pole
    return;
  }
  const d = -T.dir; t6cFall(d / Math.SQRT2, -1 / Math.SQRT2);               // no bend here: he turns off into the water
}
function t6cUpdate(dt) {
  const T = T6C;
  T.rings = (T.rings || []).filter(q => (q.t += dt) < 1.4);
  if (T.storks && T.x != null) {
    for (const k of T.storks) {
      if (k.st === 'stand' && (T.st === 'run' || T.st === 'win') && k.y < T.y && Math.hypot(k.x - T.x, k.y - T.y) < 520) { k.st = 'fly'; k.t = 0; k.f = k.sd; t6Splash(1, 1); }   // starts up while still ahead of him (so it is seen), turning to fly where its bill points; the water splashes
      if (k.st === 'fly') { k.t += dt; k.x += k.sd * 230 * dt; k.y -= 150 * dt; }   // mostly sideways, the way it faces, and away
    }
    for (const h of T.hops) {
      if (h.st === 'sit' && (T.st === 'run' || T.st === 'win') && Math.hypot(h.x - T.x, h.y - T.y) < 210) { h.st = 'jump'; h.t = 0; AU.croak(.5); }
      if (h.st === 'jump' && (h.t += dt) > .6) { h.st = 'gone'; T.rings.push({ x: h.tx, y: h.ty, r: 8, t: 0, a: .45 }); }
    }
  }
  const kd = ['Space', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD'].some(k => keys.has(k));   // keys: a fresh press only
  if (kd && !T.kd) t6cTurn(); T.kd = kd;
  if (T.st === 'count') {                                                 // 3 · 2 · 1, then go on the fourth beat
    T.ct += dt; const b = Math.floor(T.ct / T6C_BEAT);
    if (b !== T.beat) { T.beat = b; if (b < 3) AU.beat(b === 0); }
    if (T.ct >= 3 * T6C_BEAT) { T.st = 'run'; T.step = -1; t6cSchedule(); }
  } else if (T.st === 'run') {
    T.t += dt; t6cSchedule();
    const tb = T.bends[T.next], v = T6C_SPEED / Math.SQRT2;
    if (tb != null && T.t > tb) {                                         // the bend not taken yet: he balks at the corner of the pole
      const s = T.segs[T.next], late = T.t - tb;
      T.x = s.x1; T.y = s.y1; T.dir = s.dir;
      if (late > T6C_WIN) t6cFall(s.dir / Math.SQRT2, -1 / Math.SQRT2);       // too late: straight on, off the end
    } else {
      const [px, py, d] = t6cPos(T.t), k = Math.exp(-dt * 12);
      T.offX *= k; T.offY *= k; T.x = px + T.offX; T.y = py + T.offY; T.dir = d;
    }
    if (T.st === 'run' && T.t >= T6C_BEATS * T6C_BEAT) { T.st = 'win'; T.winT = 0; AU.pluck(81); setTimeout(() => AU.pluck(88), 160); }
  } else if (T.st === 'fall') {
    T.fallT += dt;
    if (T.fallT < .35) { const v = T6C_SPEED * (1 - T.fallT / .35); T.x += T.fdx * v * dt; T.y += T.fdy * v * dt; }   // a few steps off the pole, then in
    if (T.fallT > 1.8) t6cStart();
  } else if (T.st === 'win') {
    T.winT += dt; T.y -= 60 * dt * Math.max(0, 1 - T.winT);
    if (T.winT > 2.6) { T.st = 'out'; T.k = 1; T.done = true; }
  }
  T.camX += (T.x - T.camX) * Math.min(1, dt * 3); T.camY = T.y;
  for (const l of T.leaves) {                                             // the leaves over the bridge slide aside as he comes, and close again behind
    if (!l.need) continue;
    const dd = Math.hypot(l.px - T.x, l.py - T.y), k = Math.max(0, Math.min(1, (T6C_PART - dd) / 140)), want = l.need * k * k * (3 - 2 * k);
    const cur = Math.hypot(l.ox, l.oy), nv = cur + (want - cur) * Math.min(1, dt * 7);
    l.ox = l.nx * nv; l.oy = l.ny * nv;
    l.rt -= dt; if (Math.abs(nv - cur) > 90 * dt && l.rt < 0) { l.rt = .6; T.rings.push({ x: l.x + l.ox, y: l.y + l.oy, r: l.r * .55, t: 0 }); }   // the water stirs as it slides
  }
}

/* ---------- drawing the top view (own units like the pond: t6View) ---------- */
// the view is 2.5D (owner): a camera behind and above him looks forward over the pond, so things ahead get smaller and
// the far water melts into the mist at the horizon. proj(x, y) → [screen x, screen y, scale, squash of the ground plane]
const T6C_CAM = 600, T6C_K = 1.25, T6C_MAN = .62;                         // camera distance; scale at his feet; his size (owner: bigger)
function t6cProj(v) {
  const T = T6C, W = v.W, H = v.H, m = T.mix ?? 1, A0 = T.side, mx = (a, b) => A0 ? a + (b - a) * m : b, D = mx(T6C_SIDE_D, T6C_CAM);
  // from the road (A0: his feet where they are on the road, the pond's far edge as the horizon) up to the 2.5D view as m goes 0 → 1
  const hor = mx(A0 && A0.hor, v.top + H * .1), sy0 = mx(A0 && A0.ay, H * .74), ax = mx(A0 && A0.ax, W / 2), K = mx(A0 && A0.K, T6C_K), man = mx(A0 && A0.man, T6C_K * T6C_MAN);
  const th = A0 ? (1 - m) * Math.PI / 4 * T.segs[0].dir : 0, c = Math.cos(th), sn = Math.sin(th);   // from the road the first run heads straight into the pond, like the frog jetty; it turns to the 2.5D bearing as the camera rises
  const P = (x, y) => { const l = x - T.camX, f = T.camY - y, l2 = l * c - f * sn, f2 = l * sn + f * c, z = Math.max(D * .45, f2 + D), s = K * D / z; return [ax + l2 * s, hor + (sy0 - hor) * D / z, s, (sy0 - hor) / (K * z)]; };
  P.hor = hor; P.K = K; P.man = man; P.step = A0 ? A0.step * (1 - Math.min(1, m / .6)) : 0; P.f = (x, y) => (x - T.camX) * sn + (T.camY - y) * c; P.far = (y, x = T.camX) => P.f(x, y) < 2600; P.near = (y, x = T.camX) => P.f(x, y) > mx(15, -D * .5); P.m = A0 ? m : 1;   // P.step: his steps from where he waited onto the foot
  return P;
}
function t6cDraw(g, v) {
  const T = T6C, W = v.W, H = v.H, t = S.t, p = T.st === 'win' ? 1 : Math.max(0, Math.min(1, (T.t || 0) / (T6C_BEATS * T6C_BEAT))), A = t6Art(), P = t6cProj(v);
  const mix = (a, b, k) => a.map((c, i) => Math.round(c + (b[i] - c) * k));
  const wc = mix([19, 32, 41], [58, 84, 98], p), sky = mix([22, 30, 58], [214, 160, 130], p);
  // the sky over the horizon (the moon, later the dawn), the pond below it
  g.save(); g.globalAlpha *= P.m; g.fillStyle = `rgb(${sky})`; g.fillRect(-2, -2, W + 4, P.hor + 4); g.restore();
  g.fillStyle = `rgb(${wc})`; g.fillRect(-2, P.hor, W + 4, H - P.hor + 2);
  if (T.st !== 'win') { const mx = W * .72, my = P.hor * .55 + 10; const ga = g.globalAlpha; g.globalAlpha = ga * (1 - p * .7) * P.m; g.fillStyle = '#fff6d2'; g.beginPath(); g.arc(mx, my, 16, 0, 6.283); g.fill(); g.globalAlpha = ga;
    g.fillStyle = 'rgba(236,228,186,.28)'; g.beginPath(); g.ellipse(mx, P.hor + 40, 34, 14, 0, 0, 6.283); g.fill(); }   // the moon and its broken reflection
  g.strokeStyle = 'rgba(235,240,220,.14)'; g.lineWidth = 1.4;              // ripples lying on the water
  for (let wy = Math.floor((T.camY + T6C_CAM * .5) / 50) * 50; wy > T.camY - 2400; wy -= 50) for (let k = 0; k < 5; k++) {
    const h = Math.sin(wy * 12.9898 + k * 78.233) * 43758.5453, fx = h - Math.floor(h), wx = T.camX - 700 + fx * 1400 + ((t * 18) % 60);
    const [a1, b1, s1] = P(wx, wy), [a2, b2] = P(wx + 28, wy); if (b1 < P.hor) continue;
    g.lineWidth = 1.6 * s1; g.beginPath(); g.moveTo(a1, b1); g.quadraticCurveTo((a1 + a2) / 2, b1 - 3 * s1 * .4, a2, b2); g.stroke();
  }
  // the banks: the near one below the start, the far one past the end
  const last = T.segs[T.segs.length - 1];
  const nb = P(T.camX, 30)[1]; if (nb < H) { t6cBank(g, nb, H + 2, W, nb); }
  if (P.far(last.y1 - 20)) { const fb = P(T.camX, last.y1 - 20)[1]; t6cBank(g, P.hor, fb, W, fb); }
  for (const k of T.streaks) {                                            // pale streaks on the earth, lying flat
    if (!P.far(k.y, k.x) || !P.near(k.y, k.x)) continue;
    const [a1, b1, s1] = P(k.x, k.y), [a2, b2] = P(k.x + k.l, k.y); if (a2 < -10 || a1 > W + 10 || b1 > H + 10) continue;
    g.strokeStyle = 'rgba(236,232,220,.55)'; g.lineWidth = 2.2 * s1; g.beginPath(); g.moveTo(a1, b1); g.quadraticCurveTo((a1 + a2) / 2, b1 - 2 * s1, a2, b2); g.stroke();
  }
  for (const q of T6C.rings || []) {                                      // rings on the water where leaves were pushed aside
    if (!P.far(q.y, q.x) || !P.near(q.y, q.x)) continue;
    const [rx, ry, rs, rq] = P(q.x, q.y), k = q.t / 1.4, rr = (q.r + 70 * k) * rs;
    g.strokeStyle = `rgba(225,238,232,${(q.a || .28) * (1 - k)})`; g.lineWidth = 1.5 * rs; g.beginPath(); g.ellipse(rx, ry, rr, rr * rq, 0, 0, 6.283); g.stroke();
  }
  // the bridge: one bamboo pole (a quad per run, clipped to what the camera sees), nodes across it, little posts beside it
  const e = T6C_POLE, quad = (pts, fill, line) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = INK; g.lineWidth = line; g.stroke(); } };
  for (const s of T.segs) {
    const yA = T.camY + T6C_CAM * .5, yB = T.camY - 2600, u0 = Math.max(0, Math.min(1, (yA - s.y0) / (s.y1 - s.y0))), u1 = Math.max(0, Math.min(1, (yB - s.y0) / (s.y1 - s.y0)));
    if (u1 <= u0) continue;
    const dx = s.x1 - s.x0, dy = s.y1 - s.y0, L = Math.hypot(dx, dy), nx = -dy / L * e, ny = dx / L * e, ux = dx / L * e, uy = dy / L * e;
    const ax = s.x0 + dx * u0 - (u0 ? 0 : ux), ay = s.y0 + dy * u0 - (u0 ? 0 : uy), bx = s.x0 + dx * u1 + (u1 < 1 ? 0 : ux), by = s.y0 + dy * u1 + (u1 < 1 ? 0 : uy);
    quad([P(ax + nx + 4, ay + ny + 6), P(bx + nx + 4, by + ny + 6), P(bx - nx + 4, by - ny + 6), P(ax - nx + 4, ay - ny + 6)], 'rgba(8,14,20,.4)');   // shadow on the water
    for (let d = 40; d < L - 20; d += 120) { const k = d / L; if (k < u0 || k > u1) continue; for (const o of [-1.7, 1.7]) { const [px, py, ps] = P(s.x0 + dx * k + nx * o, s.y0 + dy * k + ny * o); g.fillStyle = '#5b3a20'; g.strokeStyle = INK; g.lineWidth = 1.2 * ps; g.beginPath(); g.arc(px, py, 4 * ps, 0, 6.283); g.fill(); g.stroke(); } }
    quad([P(ax + nx, ay + ny), P(bx + nx, by + ny), P(bx - nx, by - ny), P(ax - nx, ay - ny)], '#c9b35c', 1.8);
    quad([P(ax + nx * .7, ay + ny * .7), P(bx + nx * .7, by + ny * .7), P(bx + nx * .25, by + ny * .25), P(ax + nx * .25, ay + ny * .25)], 'rgba(255,250,220,.35)');
    g.strokeStyle = INK; for (let d = 26; d < L; d += 42) { const k = d / L; if (k < u0 || k > u1) continue; const [p1, q1, ps] = P(s.x0 + dx * k + nx * .9, s.y0 + dy * k + ny * .9), [p2, q2] = P(s.x0 + dx * k - nx * .9, s.y0 + dy * k - ny * .9); g.lineWidth = 1.6 * ps; g.beginPath(); g.moveTo(p1, q1); g.lineTo(p2, q2); g.stroke(); }
  }
  // the leaves and flowers far to near, him among them (he stands up out of the picture, so the near ones go over his feet)
  const items = [];
  for (const l of T.leaves) { const x = l.x + l.ox + Math.sin(t * .7 + l.ph) * 2, y = l.y + l.oy + Math.cos(t * .6 + l.ph) * 1.6; if (P.far(y, x) && P.near(y, x)) items.push([y, 0, l, x]); }
  for (const b of T.buds) if (P.far(b.y, b.x) && P.near(b.y, b.x)) items.push([b.y, 1, b, b.x]);
  for (const b of T.bank) if (P.far(b.y, b.x) && P.near(b.y, b.x)) items.push([b.y, 3, b, b.x]);
  for (const k of T.storks || []) if (k.t < 6 && P.far(k.y, k.x) && P.near(k.y, k.x)) items.push([k.y, 4, k, k.x]);
  for (const h of T.hops || []) if (h.st !== 'gone' && P.far(h.y, h.x) && P.near(h.y, h.x)) items.push([h.y + 40, 5, h, h.x]);   // sorted a little nearer: on top of its leaf
  items.push([T.y + 1e-3, 2]);
  items.sort((a, b) => P.f(b[3] ?? T.x, b[0]) - P.f(a[3] ?? T.x, a[0]));
  for (const [y, kind, o, x] of items) {
    if (kind === 2) { t6cMan(g, P); continue; }
    if (kind === 4) { const [sx, sy, s] = P(x, y), h = o.st === 'fly' ? (60 * o.t + 90 * o.t * o.t) * s : 0; if (sy - h < -80 || sy - h > H + 80) continue; t6cStork(g, sx, sy, s * .7, o, h); continue; }
    if (kind === 5) {                                                     // a frog on its leaf; leaping, an arc out to the water
      const k = o.st === 'jump' ? Math.min(1, o.t / .6) : 0, fx = o.x + (o.tx - o.x) * k, fy = o.y + (o.ty - o.y) * k, [sx, sy, s, sq] = P(fx, fy), h = Math.sin(k * Math.PI) * 70 * s;
      g.save(); g.translate(sx, sy - h); g.scale(s * .55, s * .55 * Math.max(sq, k ? .7 : 0)); g.rotate(o.rot + (k ? Math.atan2(o.ty - o.y, o.tx - o.x) + Math.PI / 2 - o.rot : 0)); dp(g, A.frog, 0, 0); g.restore();
      continue;
    }
    if (kind === 3) {                                                     // grass and bamboo stand up out of the bank
      const [sx, sy, s] = P(x, y), big = o.kind === 'bamboo', sc = s * o.s * (big ? .62 : .8);
      if (sx < -300 * sc || sx > W + 300 * sc || sy - (big ? 440 : 60) * sc > H) continue;
      if (big) dp(g, PROPS.bamboo, sx, sy + 4 * sc, 0, sc * o.f, sc); else dp(g, PROPS.tufts[o.k], sx, sy - 4 * sc, 0, sc, sc);
      continue;
    }
    const [sx, sy, s, sq] = P(x + (kind ? Math.sin(t * .8 + o.ph) * 3 : 0), y);
    const rad = kind ? 36 * o.s * .6 * s : o.r * s; if (sx < -rad || sx > W + rad || sy < P.hor - rad * sq || sy - (o.h || 0) * s > H + rad * sq) continue;
    const h = (o.h || 0) * s, sway = Math.sin(t * 1.1 + o.ph) * (o.h || 0) * .04 * s;
    if (h) {                                                               // up on a stalk: its shadow on the water, the stalk, then the leaf or the flower
      g.fillStyle = 'rgba(8,14,20,.3)'; g.beginPath(); g.ellipse(sx, sy, rad * .8, rad * .8 * sq, 0, 0, 6.283); g.fill();
      g.strokeStyle = '#2f5a3e'; g.lineWidth = Math.max(1, 3.2 * s); g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + sway * .3, sy - h * .5, sx + sway, sy - h); g.stroke();
    }
    g.save(); g.translate(sx + sway, sy - h);
    if (kind) { g.scale(s, s * Math.max(sq, .6)); dp(g, A.bud, 0, 0, Math.sin(t * .6 + o.ph) * .1, o.s * .6, o.s * .6); }   // the bloom faces up and a little toward us
    else { g.scale(s, s * sq); g.rotate(o.rot + Math.sin(t * .9 + o.ph) * .05); const r = o.r / 100; g.scale(r, r); g.drawImage(A.leaf[o.v].c, -108, -108, 216, 216); }
    g.restore();
  }
  for (const f of T.flies || []) {                                        // fireflies drifting over the pond
    const fx = f.x + Math.sin(t * f.sp + f.ph) * 40, fy = f.y + Math.cos(t * f.sp * 1.3 + f.ph) * 30, a = Math.max(0, Math.sin(t * 2 + f.ph)) * (1 - p * .8);
    if (a < .05 || !P.far(fy, fx) || !P.near(fy, fx)) continue;
    const [sx, sy, s] = P(fx, fy), y2 = sy - (f.h + Math.sin(t * 1.7 + f.ph) * 10) * s, rad = 4 + 9 * s;
    if (sx < -rad || sx > W + rad || y2 < -rad || y2 > H + rad) continue;
    const gl = g.createRadialGradient(sx, y2, 0, sx, y2, rad); gl.addColorStop(0, `rgba(230,255,150,${.9 * a})`); gl.addColorStop(1, 'rgba(230,255,150,0)'); g.fillStyle = gl; g.fillRect(sx - rad, y2 - rad, rad * 2, rad * 2);
  }
  // mist at the horizon, the far water fading into it
  const fc = mix([150, 164, 178], [236, 214, 196], p), top = Math.max(-2, P.hor - 60), fg = g.createLinearGradient(0, top, 0, P.hor + H * .3);   // rising soft into the sky too, so sky and water meet without a seam
  const hk = (P.hor - top) / (P.hor + H * .3 - top);
  fg.addColorStop(0, `rgba(${fc},0)`); fg.addColorStop(hk, `rgba(${fc},${.95 * P.m})`); fg.addColorStop(1, `rgba(${fc},0)`); g.fillStyle = fg; g.fillRect(-2, top, W + 4, P.hor + H * .3 - top);
  // the sun at the end, rising over the far bank
  if (T.st === 'win') {
    const a = Math.min(1, T.winT / 1.2), sy = P.hor - 10 - 40 * a, gl = g.createRadialGradient(W / 2, sy, 10, W / 2, sy, 220); gl.addColorStop(0, `rgba(255,200,120,${.7 * a})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
    g.globalAlpha = a; g.fillStyle = '#e8562a'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(W / 2, sy, 30, 0, 6.283); g.fill(); g.stroke(); g.globalAlpha = 1;
  }
  { const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .25; g.drawImage(PAPER, 0, 0, W, H); g.restore();
  // ← back
  const by = v.top + 40;
  g.fillStyle = '#efe6cf'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(36, by, 22, 0, 6.283); g.fill(); g.stroke();
  g.lineWidth = 3.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(46, by); g.lineTo(26, by); g.moveTo(34, by - 8); g.lineTo(26, by); g.lineTo(34, by + 8); g.stroke();
  // 3 · 2 · 1
  if (T.st === 'count') { const b = Math.min(2, Math.floor(T.ct / T6C_BEAT)), f = (T.ct / T6C_BEAT) % 1, s = 1.4 - .4 * Math.min(1, f * 3);
    g.save(); g.translate(W / 2, H * .42); g.scale(s, s); g.globalAlpha = 1 - Math.max(0, f - .7) / .3;
    g.font = '900 110px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(String(3 - b), 0, 0); g.restore(); }
}
// a stork (cò): standing in the shallows, or startled up, wings beating, rising away; s = scale, h = how high it is
function t6cStork(g, x, y, s, o, h) {
  g.save(); g.translate(x, y); g.scale(s * o.f, s); g.strokeStyle = INK; g.lineWidth = 2; g.lineJoin = g.lineCap = 'round';
  if (o.st !== 'fly') {
    g.fillStyle = 'rgba(8,14,20,.3)'; g.beginPath(); g.ellipse(0, 0, 22, 6, 0, 0, 6.283); g.fill();
    g.beginPath(); g.moveTo(-3, 0); g.lineTo(-2, -42); g.moveTo(4, 0); g.lineTo(3, -42); g.stroke();
    g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, -54, 22, 12, -.25, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(-18, -50); g.lineTo(-30, -44); g.lineTo(-16, -56); g.closePath(); g.fill();
    g.strokeStyle = '#f2ecde'; g.lineWidth = 7; g.beginPath(); g.moveTo(14, -60); g.quadraticCurveTo(26, -72, 16, -84); g.quadraticCurveTo(10, -94, 22, -96); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(18, -58); g.quadraticCurveTo(30, -72, 20, -84); g.stroke();
    g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(22, -97, 5.5, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#e2b43c'; g.lineWidth = 3; g.beginPath(); g.moveTo(26, -97); g.lineTo(44, -94); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(23, -98, 1.4, 0, 6.283); g.fill();
  } else {
    g.fillStyle = 'rgba(8,14,20,.25)'; g.beginPath(); g.ellipse(0, 0, 26, 6, 0, 0, 6.283); g.fill();   // its shadow left on the water
    g.translate(0, -h / s - 50); const fl = Math.sin(o.t * 14);
    for (const d of [-1, 1]) {                                            // the wings, beating
      g.fillStyle = '#f2ecde'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-10 + d * 4, -46 * fl * d * d - 6); g.lineTo(18 + d * 4, -40 * fl - 4); g.lineTo(10, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.moveTo(-10 + d * 4, -46 * fl - 6); g.lineTo(18 + d * 4, -40 * fl - 4); g.lineTo(6 + d * 4, -32 * fl - 4); g.closePath(); g.fill();
    }
    g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 0, 22, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = INK; g.beginPath(); g.moveTo(-20, 2); g.lineTo(-44, 6); g.stroke();                   // legs trailing
    g.strokeStyle = '#f2ecde'; g.lineWidth = 6; g.beginPath(); g.moveTo(18, -2); g.lineTo(38, -6); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(18, 1); g.lineTo(38, -3); g.stroke();
    g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(41, -7, 5, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#e2b43c'; g.lineWidth = 3; g.beginPath(); g.moveTo(45, -7); g.lineTo(60, -5); g.stroke();
  }
  g.restore();
}
// a bank: the dark earth of the road outside, with an inked edge along the water
function t6cBank(g, y0, y1, W, ye) {
  if (y1 <= y0) return;
  g.fillStyle = '#2a221d'; g.fillRect(-2, y0, W + 4, y1 - y0);
  g.strokeStyle = INK; g.lineWidth = 2.4;
  g.beginPath(); for (let x = -2; x <= W + 12; x += 12) g.lineTo(x, ye + Math.sin(x * .07) * 2); g.stroke();
}
// chú bán dầu as on the road (a mouse in a nón lá, the pole on his shoulder, a can at each end), standing up out of the
// 2.5D picture, facing the way he runs; he staggers as he trots; in a fall he sinks with rings on the water
const t6cRig = () => T6C_RIG || (T6C_RIG = buildMouse({ robe: 'grey', trim: 'brown', head: 'grey' }));
function t6cSideMan(g, x, face, ph, moving) {
  drawMouse(g, t6cRig(), x, face, ph, moving, null, 3);
  g.save(); g.translate(x, GROUND); g.scale(face, 1); c4Non(g);
  const bob = moving ? Math.sin(ph) * 2 : Math.sin(S.t * 3) * 1.5, py = -112 + bob;
  g.strokeStyle = '#7a5530'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-60, py + 4); g.lineTo(64, py - 4); g.stroke();
  for (const [ex, ey] of [[-56, py + 4], [60, py - 4]]) {
    const sw = moving ? Math.sin(ph + ex) * 4 : 0;
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 10 + sw, ey + 34); g.moveTo(ex, ey); g.lineTo(ex + 10 + sw, ey + 34); g.stroke();
    g.fillStyle = '#b57a22'; g.lineWidth = 2.2; g.beginPath(); g.rect(ex - 14 + sw, ey + 34, 28, 34); g.fill(); g.stroke();
    g.fillStyle = '#e2c27a'; g.beginPath(); g.ellipse(ex + sw, ey + 34, 14, 4, 0, 0, 6.283); g.fill(); g.stroke();
  }
  g.restore();
}
function t6cMan(g, P) {
  const T = T6C, run = T.st === 'run' || T.st === 'win', ph = S.t * 13, [sx, sy, s] = P(T.x, T.y);
  let a = 1, sink = 0;
  if (T.st === 'fall') { const k = Math.min(1, T.fallT / 1); a = 1 - k * .8; sink = k * 70;
    g.strokeStyle = `rgba(230,240,240,${.6 * (1 - k)})`; g.lineWidth = 2; for (const r of [1, 1.7]) { g.beginPath(); g.ellipse(sx, sy, (24 + k * 60) * r * s, (8 + k * 20) * r * s, 0, 0, 6.283); g.stroke(); } }
  g.fillStyle = 'rgba(8,14,20,.35)'; g.beginPath(); g.ellipse(sx, sy, 34 * s, 9 * s, 0, 0, 6.283); g.fill();   // his shadow on the pole
  g.save(); g.beginPath(); g.rect(-1e4, -1e4, 2e4, sy + 1e4 + (T.st === 'fall' ? 0 : 1e4)); g.clip();   // sinking: cut off at the water line
  const stepping = P.step !== 0; g.translate(sx + P.step + (run ? Math.sin(ph) * 2 * s : 0), sy + sink * s); const k = P.man * s / P.K; g.scale(k, k); g.globalAlpha = a;
  g.translate(0, -GROUND); t6cSideMan(g, 0, T.dir, stepping ? S.t * 9 : ph, run || stepping);
  g.restore(); g.globalAlpha = 1;
}

// the sun in the gate keeper's bubble (has the basket, but day has not come)
ITEMS.troi = { name: 'mặt trời', get part() { return ITEMS.troi.p || (ITEMS.troi.p = part([-20, -20, 20, 20], a => { a.key(lines([[0, -19, 0, -14], [0, 14, 0, 19], [-19, 0, -14, 0], [14, 0, 19, 0], [-13, -13, -10, -10], [10, 10, 13, 13], [-13, 13, -10, 10], [10, -10, 13, -13]]), 2); a.fk('red', circ(0, 0, 10), 2); })); }, s: 1, cy: 0 };

/* ---------- the road: the bamboo bridge running back into the pond from chú bán dầu's feet ----------
   (owner: the bridge should lead into the pond like the frog jetty, and going onto it should flow on without a cut).
   The bridge seen from the road is the very bridge of the run, projected by the same camera as the 2.5D view but set down
   behind him at road level: so tapping him only raises that camera — he stays where he is, the pond opens round him. */
let T6C_RIG = null;
const T6C_DEEP = 110, T6C_SIDE = .75, T6C_STAND = 95, T6C_SIDE_D = 250;   // T6C_SIDE_D: the camera distance seen from the road (closer: the bridge runs deep into the pond)   // T6C_STAND: he waits this far left of the bridge foot, so the bridge shows                                      // T6C_SIDE: how wide the bridge spreads seen from the road (world units per bridge unit)                                                      // how far up the road picture the pond's far edge lies
function t6Cau(cx) {
  const e = { layer: 'bg', ax: cx - T6C_STAND, held: false,
    update(dt) {
      if (!T6C.segs) Object.assign(T6C, t6cPath());
      if (T6C.st === 'off') { if (this.held) { S.waitMove = false; this.held = false; } if (T6C.done) this.walk = (this.walk || 0) + dt; return; }
      S.waitMove = true; this.held = true; howtoInput();
      if (T6C.st === 'in') { T6C.k = Math.min(1, T6C.k + dt / 1.6); if (T6C.k >= 1) t6cStart(); }
      else if (T6C.st === 'out') { T6C.k = Math.max(0, T6C.k - dt / 1.3); if (T6C.k <= 0) { T6C.st = 'off'; $('#hud').hidden = false; AU.musicLevel(.75); if (T6C.done) { toast('Chú bán dầu qua cầu an toàn rồi! Trời cũng vừa sáng.', 3.4); SAVE.t6 = Object.assign(SAVE.t6 || {}, { bridge: true }); persist(); } } }
      else t6cUpdate(dt);
    },
    onClick(wx, wy) {
      if (T6C.st !== 'off' || (T6C.done && !T6C_REPLAY) || !T6.done) return false;          // he dozes until the frogs are caught
      if (Math.abs(wx - (cx - T6C_STAND)) > 70 || wy < GROUND - 190 || wy > GROUND + 20) return false;
      if (!T6C.segs) Object.assign(T6C, t6cPath());
      const s0 = T6C.segs[0]; Object.assign(T6C, { x: s0.x0, y: s0.y0, dir: s0.dir, camX: s0.x0, camY: s0.y0, t: 0, st: 'off' });
      for (const l of T6C.leaves) { l.ox = l.oy = 0; }
      T6C.st = 'in'; T6C.k = 0; AU.click(); $('#hud').hidden = true; AU.musicLevel(0); return true;   // the night flute hushes: Bắc Kim Thang plays on the bridge
    },
    grab(wx, wy) {
      if (T6C.st === 'off') return null;
      const d = { ent: this, x: wx, y: wy, draw() {} };
      if (T6C.st === 'count' || T6C.st === 'run' || T6C.st === 'fall') {
        const v = t6View(), [x, y] = t6Pt(wx, wy);
        if (Math.hypot(x - 36, y - (v.top + 40)) < 30) { T6C.st = 'out'; T6C.k = 1; AU.click(); }   // ← back to the road
        else t6cTurn();
      }
      return d;
    },
    drop() {},
    draw(g) {
      // the bridge from the road: the run's pole projected from behind him at road level, fading into the far mist
      if (!T6C.segs) return;
      g.save(); g.beginPath(); g.rect(camX - 50, -2000, 1e4, GROUND - 24 + 2000); g.clip();   // only over the water: its near end goes under the road
      const D = T6C_SIDE_D, s0 = T6C.segs[0], e = T6C_POLE, th = Math.PI / 4 * s0.dir, c = Math.cos(th), sn = Math.sin(th),
        W = (x, y) => { const l = x - s0.x0, f = s0.y0 - y, l2 = l * c - f * sn, f2 = l * sn + f * c, z = Math.max(D * .45, f2 + D), s = D / z; return [cx + l2 * s * T6C_SIDE, GROUND - T6C_DEEP + T6C_DEEP * s, s]; };
      for (const sg of T6C.segs) {
        if (s0.y0 - sg.y0 > 2400) break;
        const dx = sg.x1 - sg.x0, dy = sg.y1 - sg.y0, L = Math.hypot(dx, dy), nx = -dy / L * e * 2, ny = dx / L * e * 2, n = Math.max(2, Math.ceil(L / 60));   // drawn twice as thick: it is far off
        for (let i = 0; i < n; i++) {                                    // short pieces, each fading with its distance
          const u0 = i / n, u1 = (i + 1) / n, ax = sg.x0 + dx * u0, ay = sg.y0 + dy * u0, bx = sg.x0 + dx * u1, by = sg.y0 + dy * u1;
          g.globalAlpha = Math.max(0, 1 - (s0.y0 - by) / 2400);
          const q = [W(ax + nx, ay + ny), W(bx + nx, by + ny), W(bx - nx, by - ny), W(ax - nx, ay - ny)];
          g.fillStyle = '#c9b35c'; g.strokeStyle = INK; g.lineWidth = 1.2 * q[0][2] + .4; g.beginPath(); q.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.stroke();
        }
      }
      g.globalAlpha = 1; g.restore();
    },
    drawMid(g) {
      // chú bán dầu: a mouse in a nón lá with a pole and two cans; asleep (z z) until the frogs are caught; across, he walks off
      if (T6C.st !== 'off') return;                                      // while the camera rises he is the 2.5D one, stepping onto the foot
      if (T6C.done && !T6C_REPLAY) return;                              // across the pond: he is gone from this road (owner)
      const across = false, x = cx - T6C_STAND, awake = T6.done;
      const ph = S.t * 9, moving = across, sit = !awake;
      g.save(); if (sit) g.translate(0, 18);
      t6cSideMan(g, x, 1, ph, moving);
      g.restore();
      if (sit) for (let i = 0; i < 3; i++) { const k = (S.t * .5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI); dp(g, PROPS.zz, x + 20 + k * 30, GROUND - 190 - k * 50, 0, .7 + k * .5, .7 + k * .5); g.globalAlpha = 1; }
    },
    drawHud(g, vw) {
      if (T6C.st === 'off' || !T6C.segs) return;
      const v = t6View(), U = scale / v.k, D = DPR;                     // road world units → pond-view units
      T6C.side = { ax: (cx - camX) * U, ay: (GROUND + offY) * U, K: U * T6C_SIDE, man: U, hor: (GROUND - T6C_DEEP + offY) * U, step: -T6C_STAND * U };
      const k = T6C.st === 'in' || T6C.st === 'out' ? t6E(T6C.k) : 1;
      T6C.mix = k;                                                       // the camera rises from the road as k goes 0 → 1
      g.save(); g.setTransform(v.k * D, 0, 0, v.k * D, 0, 0); { const q = Math.min(1, k / .7); g.globalAlpha = q * q * (3 - 2 * q); }   // the pond fades in as the camera rises
      t6cDraw(g, v);
      g.restore();
    },
  };
  return e;
}
