/* Chương III · tranh 4 · Thả Diều.
   The herd boy sits on his buffalo and throws his kite up; the camera follows the kite as it climbs, so boy and buffalo
   sink out of the bottom of the picture and only the kite and the bamboo are left. The kite climbs by itself; the player
   only steers it left and right through the gaps between the bamboo branches: hold a finger (or the mouse button) on the
   screen and slide it sideways, and the kite goes where the finger goes; on computers ← → and the ◀ ▶ buttons work too.
   Every so often a gust sweeps across and the kite shoots up faster for a moment.
   Now and then a crow flaps across. Touching a branch or a crow brings the kite down (a fail); clearing the tops of the
   bamboo wins. The record is the fastest climb.
   World coordinates are screen-like (y down); the camera keeps the kite a little below the middle of the screen. */
const TD = { W: 460, H: 995, t: 0, phase: 'intro', phaseT: 0, camY: 0, onWin: null, onFail: null };
const TD_ROWS0 = 1050, TD_HEIGHT = 3100, TD_KR = 19;             // first branches above the ground, bamboo height, kite radius

/* ---------- art ---------- */
let TDART = null;
function tdArt() {
  if (TDART) return TDART;
  // the arched wing kite of the print: dark wing with a red lining, a flute along its top, bridle lines down to a knot (0, 30)
  const kite = part([-50, -34, 50, 34], a => {
    const wing = new Path2D(); wing.moveTo(-44, 4); wing.bezierCurveTo(-36, -26, 36, -26, 44, 4); wing.bezierCurveTo(30, -10, -30, -10, -44, 4); wing.closePath();
    a.fk('dark', wing, 2.4);
    const lin = new Path2D(); lin.moveTo(-36, 0); lin.bezierCurveTo(-26, -16, 26, -16, 36, 0); lin.bezierCurveTo(24, -8, -24, -8, -36, 0); lin.closePath();
    a.fill('red', lin);
    a.fk('straw', smooth([[-22, -22], [22, -22], [22, -17], [-22, -17]]), 1.3);                    // the flute (sáo diều)
    for (let i = -2; i <= 2; i++) a.ink(circ(i * 7, -19.5, 1.3));
    a.key(lines([[-42, 3, 0, 30, 42, 3], [0, -12, 0, 30]]), 1.2);
  });
  const crow = up => part([-34, -30, 34, 22], a => {                // facing right
    a.fk('dark', up ? smooth([[-6, -4], [-18, -26], [4, -30], [10, -6]]) : smooth([[-6, 0], [-20, 18], [2, 20], [10, 2]]), 1.8);
    a.fk('dark', ell(0, 0, 20, 10, -.1), 2.2);
    a.fk('dark', smooth([[-18, -2], [-32, -8], [-30, 6], [-18, 4]]), 1.6);                          // tail
    a.fk('dark', circ(18, -6, 8), 1.8);
    a.fk('yellow', smooth([[24, -8], [33, -5], [24, -2]]), 1.2);
    a.fk('white', circ(20, -8, 2.6), 1); a.ink(circ(20.6, -8, 1.2));
    a.fk('dark', up ? smooth([[4, -4], [0, -24], [16, -22], [14, -4]]) : smooth([[4, 2], [2, 20], [16, 16], [14, 2]]), 1.8);
  });
  const leaf = (x, y, ang, len) => { const c = Math.cos(ang), s = Math.sin(ang), n = -s, m = c, w = len * .16;
    return smooth([[x, y], [x + c * len * .5 + n * w, y + s * len * .5 + m * w], [x + c * len, y + s * len], [x + c * len * .5 - n * w, y + s * len * .5 - m * w]]); };
  // a bamboo branch growing right from (0,0) and rising a little, leaves bunched towards its tip
  const branch = L => part([-4, -48, L + 30, 36], a => {
    const stalk = smooth([[0, 0], [L * .5, -8], [L, -18]], false);
    a.band('green', stalk, 5); a.key(stalk, 1.6);
    for (let i = 0; i < 7; i++) {
      const k = .35 + i * .1, x = L * k, y = -18 * k - (k > .5 ? (k - .5) * 4 : 0);
      for (const [da, len] of [[-.9, 26], [.6, 30], [1.4, 24]]) { const p = leaf(x, y, da + (i % 2) * .3, len); a.fill('green', p); a.key(p, 1); }
    }
    const tip = leaf(L, -18, -.2, 30); a.fill('green', tip); a.key(tip, 1);
  });
  const crown = part([-60, -80, 60, 10], a => {                      // leaves at the very top of a culm
    for (const [da, len] of [[-2.5, 44], [-2.0, 52], [-1.6, 56], [-1.2, 50], [-.7, 44], [-2.9, 36], [-.3, 38]]) { const p = leaf(0, 0, da, len); a.fill('green', p); a.key(p, 1.1); }
  });
  const cloud = part([-60, -26, 60, 20], a => {
    const p = smooth([[-54, 14], [-50, -2], [-30, -8], [-22, -22], [2, -24], [14, -12], [34, -18], [52, -4], [54, 14]]);
    a.fk('white', p, 2); a.key(smooth([[-20, 4], [-10, -6], [0, 2], [-8, 8]], false), 1.2); a.key(smooth([[18, 2], [28, -6], [36, 2]], false), 1.2);
  });
  TDART = { kite, crow: [crow(true), crow(false)], branch, branchCache: {}, crown, cloud };
  return TDART;
}
const tdBranch = L => { const A = tdArt(), k = Math.max(60, Math.round(L / 20) * 20); return A.branchCache[k] || (A.branchCache[k] = A.branch(k)); };

// the boy on his buffalo (chương III tranh 3's art), facing right, feet on y; armUp holds the kite overhead
function tdHerd(g, x, y, s, armUp, t) {
  const A = ctArt();
  for (const [lx, col] of [[-50, '#7a2a22'], [48, '#7a2a22'], [-34, '#a3332a'], [32, '#a3332a']]) {
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 13 * s; g.beginPath(); g.moveTo(x + lx * s, y - 44 * s); g.lineTo(x + lx * s, y - 2); g.stroke();
    g.strokeStyle = col; g.lineWidth = 8.5 * s; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + lx * s, y - 2, 6.5 * s, 4 * s, 0, 0, 6.283); g.fill();
  }
  dp(g, A.tail, x - 70 * s, y - 86 * s, Math.sin(t * 3) * .25, s, s);
  dp(g, A.body, x, y, 0, s, s);
  dp(g, A.headSide, x + 66 * s, y - 58 * s, Math.sin(t * 1.4) * .05, s, s);
  const bx = x - 8 * s, by = y - 88 * s;
  dp(g, A.boy, bx, by, 0, s, s);
  const shx = bx + 6 * s, shy = by - 64 * s, ex = shx + (armUp ? 8 : 22) * s, ey = shy - (armUp ? 26 : 6) * s;
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 8 * s; g.beginPath(); g.moveTo(shx, shy); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = '#f2ecde'; g.lineWidth = 4.6 * s; g.stroke();
  return [ex, ey];
}

let TD_TEXT = null;
function tdText() {
  if (TD_TEXT) return TD_TEXT.ready ? TD_TEXT.c : null;
  TD_TEXT = { ready: false, c: null };
  const img = new Image();
  img.onload = () => {
    const W0 = img.naturalWidth, H0 = img.naturalHeight, sx = W0 * .17, sy = H0 * .16, sw = W0 * .2, sh = H0 * .2;   // measured on the 648×926 print
    const c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh);
    const x = c.getContext('2d'); x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const lum = .3 * p[i] + .59 * p[i + 1] + .11 * p[i + 2]; p[i + 3] = Math.max(0, Math.min(1, (150 - lum) / 70)) * 255; p[i] = 29; p[i + 1] = 25; p[i + 2] = 21; }
    x.putImageData(d, 0, 0); TD_TEXT.c = c; TD_TEXT.ready = true;
  };
  img.src = 'img/ch3/tha-dieu.jpg';                // until the file is there, there is simply no inscription
  return null;
}

/* ---------- layout and course ---------- */
function tdLayout() {
  TD.ground = TD.H * .86; TD.top = TD.ground - TD_HEIGHT;
  TD.herd = { x: TD.W * .38, y: TD.ground, s: 1.05 };
  TD.culms = [16, 46, TD.W - 46, TD.W - 16];
}
// rows of branches from TD_ROWS0 above the ground to just below the tops; the gaps narrow and the rows close up higher up
function tdCourse() {
  const rows = [], W = TD.W; let y = TD.ground - TD_ROWS0, side = R() < .5 ? -1 : 1;
  while (y > TD.top + 120) {
    const p = (TD.ground - TD_ROWS0 - y) / (TD_HEIGHT - TD_ROWS0);
    if (R() < .35 + p * .3) {                                          // branches from both sides with a gap between
      const gw = 235 - p * 50, gc = 60 + gw / 2 + R() * (W - 120 - gw);
      rows.push({ y, from: -1, tip: gc - gw / 2 }, { y: y - 6, from: 1, tip: gc + gw / 2 });
    } else {                                                          // one long branch, alternating sides more often than not
      if (R() < .75) side = -side;
      const reach = W * (.4 + p * .1 + R() * .06);
      rows.push({ y, from: side, tip: side < 0 ? reach : W - reach });
    }
    y -= 215 - p * 70 + R() * 40;
  }
  return rows;
}
function tdStart() {
  tdLayout();
  Object.assign(TD, { t: 0, phase: 'intro', phaseT: 0, camY: 0, crows: [], crowT: 4, why: '', walked: false, hold: null, gust: 0, gustT: 5, streaks: [] });
  TD.rows = tdCourse();
  const r = mulberry(21); TD.clouds = [];
  for (let y = TD.ground - 900; y > TD.top - 900; y -= 260 + r() * 200) TD.clouds.push({ x: r() * TD.W, y, s: .7 + r() * .6, v: (r() - .5) * 14 });
  const [hx, hy] = tdHand();
  TD.kite = { x: hx, y: hy - 30, vx: 0, rot: 0, climb: 0 };
  TD.tails = [-1, 1].map(sd => { const t = []; for (let i = 0; i < 8; i++) t.push([TD.kite.x + sd * 44, TD.kite.y + 10 + i * 11]); return t; });
}
function tdHand() { const h = TD.herd, s = h.s, bx = h.x - 8 * s, by = h.y - 88 * s; return [bx + 14 * s, by - 90 * s]; }

/* ---------- update ---------- */
function tdUpdate(dt) {
  TD.t += dt; TD.phaseT += dt;
  const k = TD.kite, W = TD.W, H = TD.H;
  for (const c of TD.clouds) c.x = ((c.x + c.v * dt) % (W + 140) + W + 140) % (W + 140);
  if (TD.phase === 'intro') {                                           // holds it up, winds up, throws
    const [hx, hy] = tdHand();
    if (TD.phaseT < 1) { k.x = hx; k.y = hy - 30 - Math.sin(TD.phaseT * 6) * 3; k.rot = Math.sin(TD.t * 3) * .08; }
    else { TD.phase = 'launch'; TD.phaseT = 0; TD.l0 = [k.x, k.y]; AU.swoosh(); }
  } else if (TD.phase === 'launch') {                                    // up into the wind
    const e = Math.min(1, TD.phaseT / 1.1), ee = 1 - (1 - e) * (1 - e);
    k.x = TD.l0[0] + (W / 2 - TD.l0[0]) * ee; k.y = TD.l0[1] - 420 * ee; k.rot = Math.sin(TD.t * 5) * .15 * (1 - e);
    if (e >= 1) { TD.phase = 'fly'; TD.phaseT = 0; }
  } else if (TD.phase === 'fly') {
    const dir = ctDir(); if (dir || TD.hold !== null) TD.walked = true;
    const p = Math.max(0, Math.min(1, (TD.ground - TD_ROWS0 - k.y) / (TD_HEIGHT - TD_ROWS0)));
    // gusts: every few seconds the wind picks up for a moment and the kite shoots up
    if ((TD.gustT -= dt) <= 0) { TD.gustT = 4.5 + R() * 4 - p * 1.5; TD.gust = 1.7; AU.swoosh(); for (let i = 0; i < 7; i++) TD.streaks.push({ x: -60 - R() * 200, y: TD.camY + R() * H, t: 0, len: 60 + R() * 80 }); }
    TD.gust = Math.max(0, TD.gust - dt);
    const boost = TD.gust > 0 ? 1 + .9 * Math.sin(Math.min(1, TD.gust / 1.7) * Math.PI) : 1;
    k.climb = Math.min((130 + p * 60) * boost, k.climb + dt * 160);
    k.y -= k.climb * dt;
    if (TD.hold !== null) {                                          // follow the finger across
      const want = Math.max(-360, Math.min(360, (TD.hold - k.x) * 7));
      k.vx += (want - k.vx) * Math.min(1, dt * 9);
    } else { k.vx += dir * 1300 * dt; k.vx *= Math.max(0, 1 - dt * (dir ? 2.2 : 4.5)); }
    k.vx = Math.max(-360, Math.min(360, k.vx));
    k.x += (k.vx + Math.sin(TD.t * .7) * 18) * dt;
    if (k.x < 56) { k.x = 56; k.vx = Math.max(0, k.vx); } if (k.x > W - 56) { k.x = W - 56; k.vx = Math.min(0, k.vx); }
    k.rot = k.vx / 280 * .35 + Math.sin(TD.t * 2.3) * .05;
    // crows flap across a little above the kite, from either side
    if ((TD.crowT -= dt) <= 0 && k.y > TD.top + 200) {
      TD.crowT = 3.2 + R() * 2.8 - p * 1.2; const from = R() < .5 ? -1 : 1;
      TD.crows.push({ x: from < 0 ? -40 : W + 40, y: k.y - 220 - R() * 200, v: -from * (120 + R() * 70 + p * 40), ph: R() * 6 });
      AU.caw();
    }
    // a branch (stalk or its leaves) or a crow brings the kite down
    for (const r of TD.rows) {
      if (Math.abs(r.y - k.y) > 60) continue;
      const x0 = r.from < 0 ? 30 : W - 30, y0 = r.y, x1 = r.tip, y1 = r.y - 18;
      if (tdSegDist(k.x, k.y, x0, y0, x1, y1) < TD_KR + 8 || [-1, 1].some(sd => { const [tx, ty] = tdTip(sd); return tdSegDist(tx, ty, x0, y0, x1, y1) < 7; })) { tdCrash('tre'); break; }   // body or a wing tip
    }
    for (const c of TD.crows) if (Math.hypot(c.x - k.x, (c.y - k.y) * 1.2) < TD_KR + 20) { tdCrash('qua'); break; }
    if (TD.phase === 'fly' && k.y < TD.top - 140) { TD.phase = 'done'; TD.phaseT = 0; [79, 83, 86, 91].forEach((m, i) => setTimeout(() => AU.pluck(m), i * 170)); }
  } else if (TD.phase === 'fall') {                                      // tumbles down, string slack
    k.vy += 700 * dt; k.y += k.vy * dt; k.x += k.vx * dt; k.rot += dt * 7;
    if (TD.phaseT > 1.1 && TD.onFail) { const cb = TD.onFail; TD.onFail = null; cb(); }
  } else if (TD.phase === 'done') {                                      // floats in the open sky above the bamboo
    k.y -= 40 * dt * Math.max(0, 1 - TD.phaseT); k.rot = Math.sin(TD.t * 1.6) * .1; k.x += (W / 2 - k.x) * Math.min(1, dt * 1.2);
    if (TD.phaseT > 1.4 && TD.onWin) { const cb = TD.onWin; TD.onWin = null; cb(); }
  }
  for (const s of TD.streaks) { s.t += dt; s.x += 700 * dt; }
  TD.streaks = TD.streaks.filter(s => s.x < W + 200);
  for (const c of TD.crows) { c.x += c.v * dt; c.ph += dt * 9; }
  TD.crows = TD.crows.filter(c => c.x > -80 && c.x < W + 80);
  // each ribbon follows its wing tip like a chain, fluttering
  TD.tails.forEach((tl, j) => {
    let prev = tdTip(j ? 1 : -1);
    for (const p of tl) {
      p[1] += 34 * dt; p[0] += Math.sin(TD.t * 5 + p[1] * .03 + j) * 26 * dt;
      const dx = p[0] - prev[0], dy = p[1] - prev[1], d = Math.hypot(dx, dy) || 1;
      p[0] = prev[0] + dx / d * 11; p[1] = prev[1] + dy / d * 11; prev = p;
    }
  });
  // the camera follows the kite up (never below the ground view)
  const want = Math.min(0, k.y - H * .62); TD.camY += (want - TD.camY) * Math.min(1, dt * (TD.phase === 'launch' ? 3 : 6));
}
function tdTip(sd) { const k = TD.kite, c = Math.cos(k.rot), s = Math.sin(k.rot); return [k.x + sd * 44 * c - 4 * s, k.y + sd * 44 * s + 4 * c]; }
function tdSegDist(px, py, x0, y0, x1, y1) { const dx = x1 - x0, dy = y1 - y0, l = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l)); return Math.hypot(px - x0 - t * dx, py - y0 - t * dy); }
function tdCrash(why) { TD.phase = 'fall'; TD.phaseT = 0; TD.why = why; TD.kite.vy = -60; AU.snort(); if (why === 'qua') AU.caw(); else AU.creak(); }

/* ---------- drawing ---------- */
function tdRender(g) {
  const A = tdArt(), W = TD.W, H = TD.H, k = TD.kite, t = TD.t;
  g.save(); g.translate(0, -TD.camY);
  const vy0 = TD.camY - 60, vy1 = TD.camY + H + 60;                    // the visible band of the world
  // a red sun waiting above the bamboo, and clouds on the way
  const sy = TD.top - 520; if (sy > vy0 - 80) { g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(W * .7, sy, 56, 0, 6.283); g.fill(); g.stroke(); }
  const tx = tdText(); if (tx && sy > vy0 - 300) { const h = 190, w = h * tx.width / tx.height; g.drawImage(tx, W * .2 - w / 2, sy - 90, w, h); }
  for (const c of TD.clouds) if (c.y > vy0 - 40 && c.y < vy1 + 40) dp(g, A.cloud, c.x - 70, c.y, 0, c.s, c.s);
  // ground, and the boy on his buffalo holding the string
  if (TD.ground - 200 < vy1) {
    dp(g, c3Mound(W * .96), W / 2, TD.ground + 26);
    const hand = tdHerd(g, TD.herd.x, TD.herd.y, TD.herd.s, TD.phase === 'intro', t);
    if (TD.phase !== 'intro') tdString(g, hand[0], hand[1]);
  } else if (TD.phase !== 'intro') tdString(g, k.x - 60, vy1 + 40);
  // the bamboo culms up both sides, with nodes, crowned with leaves at the top
  const cy0 = Math.max(vy0, TD.top), cy1 = Math.min(vy1, TD.ground - 60);
  if (cy1 > cy0) for (const [i, x] of TD.culms.entries()) {
    const top = TD.top + (i % 2 ? 40 : 0), y0 = Math.max(cy0, top);
    if (y0 >= cy1) continue;
    g.fillStyle = i % 2 ? '#3f7a58' : '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 2.2;
    g.fillRect(x - 8, y0, 16, cy1 - y0); g.beginPath(); g.moveTo(x - 8, y0); g.lineTo(x - 8, cy1); g.moveTo(x + 8, y0); g.lineTo(x + 8, cy1); g.stroke();
    g.lineWidth = 2; g.beginPath(); for (let ny = Math.ceil((y0 - top) / 64) * 64 + top; ny < cy1; ny += 64) { g.moveTo(x - 9, ny); g.quadraticCurveTo(x, ny + 3, x + 9, ny); } g.stroke();
    if (top > vy0 - 80 && top < vy1) dp(g, A.crown, x, top, 0, i < 2 ? -1 : 1, 1);
  }
  for (const r of TD.rows) if (r.y > vy0 - 60 && r.y < vy1 + 60) {
    const L = Math.abs(r.tip - (r.from < 0 ? 30 : W - 30));
    dp(g, tdBranch(L), r.from < 0 ? 30 : W - 30, r.y, 0, r.from < 0 ? 1 : -1, 1);
  }
  g.strokeStyle = 'rgba(242,236,222,.85)'; g.lineWidth = 3; g.lineCap = 'round';
  for (const s of TD.streaks) { g.beginPath(); g.moveTo(s.x, s.y); g.quadraticCurveTo(s.x + s.len / 2, s.y - 8, s.x + s.len, s.y); g.stroke(); }
  for (const c of TD.crows) dp(g, A.crow[Math.sin(c.ph) > 0 ? 0 : 1], c.x, c.y, 0, c.v > 0 ? 1 : -1, 1);
  // the two ribbons (ink, tapering), then the kite
  TD.tails.forEach((tl, j) => {
    const pts = [tdTip(j ? 1 : -1), ...tl];
    g.lineCap = g.lineJoin = 'round'; g.strokeStyle = INK;
    for (let i = 1; i < pts.length; i++) { g.lineWidth = 5.5 * (1 - i / pts.length) + 1.2; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
  });
  dp(g, A.kite, k.x, k.y, k.rot);
  g.restore();
}
// the kite string, sagging down from the kite to the boy's hand (or off the bottom of the screen)
function tdString(g, x1, y1) {
  const k = TD.kite, x0 = k.x - Math.sin(k.rot) * 30, y0 = k.y + Math.cos(k.rot) * 30;
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2 + (TD.phase === 'fall' ? 0 : 40), (y0 + y1) / 2 + (TD.phase === 'fall' ? 60 : 0), x1, y1); g.stroke();
}
// the reward until the real print is sent: our own kite-flying scene, framed like a print
function tdPrint(g, W, H, k) {
  const w = Math.min(W - 48, 380), h = Math.min(H - 250, w * 1.38), s = w / 460, x = W / 2 - w / 2, y = 30 + (H - 230 - h) / 2;
  g.save(); g.globalAlpha = Math.min(1, k * 6);
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.fillRect(x - 12, y - 12, w + 24, h + 24); g.lineWidth = 3; g.strokeRect(x - 12, y - 12, w + 24, h + 24);
  g.fillStyle = PAPERS.blue.css; g.fillRect(x, y, w, h);
  g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y); g.scale(s, s);
  const LH = h / s, A = tdArt();
  g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(340, 110, 50, 0, 6.283); g.fill(); g.stroke();
  dp(g, A.cloud, 120, 170, 0, .9, .9);
  for (const [cx, top] of [[26, 250], [60, 300], [410, 270], [440, 330]]) { g.fillStyle = '#2f6a4c'; g.fillRect(cx - 8, top, 16, LH); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(cx - 8, top, 16, LH); dp(g, A.crown, cx, top, 0, cx < 230 ? -1 : 1, 1); }
  dp(g, tdBranch(120), 30, LH * .55, 0, 1, 1); dp(g, tdBranch(100), 430, LH * .62, 0, -1, 1);
  dp(g, c3Mound(460), 230, LH - 40);
  const hand = tdHerd(g, 190, LH - 60, 1, false, 0);
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hand[0], hand[1]); g.quadraticCurveTo(300, 300, 250, 190); g.stroke();
  dp(g, A.kite, 250, 160, .15);
  g.restore();
  g.save(); g.lineWidth = 1.2; g.strokeStyle = INK; g.strokeRect(x, y, w, h);
  if (k > .3) { const kk = Math.min(1, (k - .3) / .25); g.globalAlpha = kk; dp(g, PROPS.seal, x + w - 34, y + h - 34, -.08, 1.8 - .8 * kk, 1.8 - .8 * kk); }
  g.restore();
}

function tdOverlay(g, W, H) {
  if (TD.phase !== 'fly' || TD.walked) return;
  const A = howtoArt(), t = TD.t, Z = Math.min(1.35, Math.max(1.1, W / 420)), sx = Math.sin(t * 3) * 40;
  g.save(); g.setTransform(DPR * Z, 0, 0, DPR * Z, (W / 2) * DPR, (H - 90 * Z) * DPR);
  g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 2.4;
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(d * 52, -26); g.lineTo(d * 66, -26); g.stroke(); g.beginPath(); g.moveTo(d * 72, -26); g.lineTo(d * 64, -32); g.lineTo(d * 64, -20); g.closePath(); g.fill(); }
  if (isTouch) dp(g, A.finger, sx, -27, -.1, .62, .62); else dp(g, A.mouse, sx, -9, 0, .72, .72), dp(g, A.click, sx, -9, 0, .72, .72);
  g.restore();
}

C3GAMES[3] = {
  han: '放鳶', name: 'Thả Diều', paper: 'blue',
  short: portrait => portrait ? 460 : 620,
  song: 5,
  // steering: slide a held finger / mouse; on computers also ← → and the ◀ ▶ buttons at both sides
  padOn: () => TD.phase === 'fly' && !isTouch, padPulse: () => !TD.walked,   // computers only; phones steer by sliding
  overlay: tdOverlay,
  isWon: () => TD.phase === 'done',
  praise: () => 'Diều bay cao quá!',
  failText: () => TD.why === 'qua' ? 'Ôi! Diều đâm phải con quạ rồi!' : 'Ôi! Diều vướng cành tre rồi!',
  start: tdStart, update: tdUpdate, render: tdRender,
  print: 'img/ch3/tha-dieu.jpg',                   // the real print; if the file is missing the shell falls back to tdPrint
  printRender: tdPrint,
  down(x) { TD.hold = x; return true; }, move(x) { if (TD.hold !== null) TD.hold = x; }, up() { TD.hold = null; },
  resize(W, H) { const sx = W / TD.W; TD.W = W; TD.H = H; if (!TD.kite) return; const g0 = TD.ground; tdLayout(); const dy = TD.ground - g0;
    TD.kite.x *= sx; TD.kite.y += dy; TD.camY += dy; for (const r of TD.rows) { r.y += dy; r.tip *= sx; } for (const c of TD.clouds) c.y += dy; TD.crows = []; TD.tails.forEach(tl => tl.forEach(p => { p[0] *= sx; p[1] += dy; })); },
  onWin(f) { TD.onWin = f; }, onFail(f) { TD.onFail = f; },
};
