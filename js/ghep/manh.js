/* Chương IX · Ghép Tranh — the jigsaw engine. The pictures are the real Đông Hồ prints of chương III (img/ch3/…) cut into jigsaw
   pieces with tabs and blanks. There is NO board and no guide picture: the pieces lie on a table at any angle (0–360°), and the
   player joins them wherever they like. Pieces live in GROUPS: a group is a rigid piece of the finished print with one pose (where
   its lattice origin is in the world and its angle); a loose piece is a group of one. Two groups join when, dropped, they touch
   (some piece of one is next to some piece of the other in the print) and their angle and position agree closely enough: the
   smaller one snaps onto the bigger, and the two pieces that met flash once. The print is done when everything is one group.
   Pieces are flat printed faces with a hairline outline: NO shadow, no rim, no side (owner, three times: it was hard to see).
   THE TABLE AND THE CAMERA (owner, 2026-10-20: a 1000-piece puzzle, zoom by wheel / two fingers): the world is the table; a camera
   {x, y, z} looks at it (screen = (world − cam) × z, below the top bar). Small puzzles fill one screen; the big one has a table
   1.5 times the size of the finished print, so you zoom and pan. Only pieces in view are drawn and their faces are baked a few per
   frame.
   POINTER RULES:
     computer: press lifts a piece (its whole group); drag, or just click and it follows the mouse until the next click; the WHEEL
               turns the lifted piece round the pointer (right click or R: a step of 15°); with nothing lifted (or Ctrl held) the wheel
               ZOOMS about the pointer; dragging empty table pans.
     phone:    touching a piece lifts it; drag it, or tap elsewhere to put it there; a quick vertical flick ON it turns it (the longer
               the flick the bigger the turn); a little round arrow beside it turns it 15°; one finger on empty table pans; TWO fingers
               pinch to zoom and pan. Near the screen edge a dragged piece scrolls the view. */

const C9_DRAG_PX = 7, C9_FLICK_MS = 260, C9_FLICK_PX = 26;
const C9_ANG_TOL = 14 * Math.PI / 180, C9_POS_TOL = .38;   // an angle in radians, a position as a fraction of the smaller cell side
const C9_STEP = 15 * Math.PI / 180;

function c9Edge(p, x0, y0, x1, y1, nx, ny, e, jit, rev) {
  if (!e) { p.lineTo(x1, y1); return; }
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  const P = (u, v) => [x0 + ux * L * u + nx * L * v * e, y0 + uy * L * u + ny * L * v * e];
  const uc = rev ? .5 - jit.c : .5 + jit.c, sc = 1 + jit.s, w = .065, nh = .05, r = .095 * sc, cc = nh + r * .82, d = Math.sqrt(Math.max(1e-4, r * r - w * w)), vj = cc - d;
  const a = P(uc - w - .08, 0); p.lineTo(a[0], a[1]);
  let c1 = P(uc - w - .03, 0), c2 = P(uc - w, nh * .45), en = P(uc - w, vj); p.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], en[0], en[1]);
  const aL = Math.atan2(-d, -w), aR = Math.atan2(-d, w) - 2 * Math.PI, N = 20;
  for (let k = 1; k <= N; k++) { const an = aL + (aR - aL) * k / N, q = P(uc + r * Math.cos(an), cc + r * Math.sin(an)); p.lineTo(q[0], q[1]); }
  c1 = P(uc + w, nh * .45); c2 = P(uc + w + .03, 0); en = P(uc + w + .08, 0);
  const rj = P(uc + w, vj); p.lineTo(rj[0], rj[1]); p.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], en[0], en[1]);
  p.lineTo(x1, y1);
}
const c9Rng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const c9Wrap = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
const c9Rot = (a, x, y) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const c9Clip = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function c9MakeGame(L, img, W, H, seedNum) {
  const R = c9Rng(seedNum * 7919 + 13), G = { hitCtx: document.createElement('canvas').getContext('2d'), L, img, cols: L.cols, rows: L.rows, big: L.cols * L.rows >= 100, pieces: [], groups: [], order: [], held: null, drag: null, pan: null, pinch: null, tp: new Map(), noDrag: new Set(), hl: [0, 0], cam: { x: 0, y: 0, z: 1 }, t: 0, done: false, win: 0, peek: 0, lw: 0, lh: 0, seed: seedNum, flash: [], zTop: 0, bakeLeft: 1e9, psx: 0, psy: 0 };
  const HE = [], VE = [], JH = [], JV = [];
  for (let i = 0; i <= G.rows; i++) { HE[i] = []; JH[i] = []; for (let j = 0; j < G.cols; j++) { HE[i][j] = R() < .5 ? 1 : -1; JH[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  for (let i = 0; i < G.rows; i++) { VE[i] = []; JV[i] = []; for (let j = 0; j <= G.cols; j++) { VE[i][j] = R() < .5 ? 1 : -1; JV[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  G.H = HE; G.V = VE; G.JH = JH; G.JV = JV;
  let id = 0;
  for (let i = 0; i < G.rows; i++) for (let j = 0; j < G.cols; j++) { const p = { id: id++, i, j, grp: null, key: '', cvTop: null, path: null, flash: 0 }; G.pieces.push(p); const grp = { id: p.id, x: 0, y: 0, a: R() * 2 * Math.PI, pcs: [p], z: 0, lift: 0, ux: R(), uy: R() }; G.groups.push(grp); p.grp = grp; }
  c9Layout(G, W, H, true);
  // spread the loose pieces over the table in a shuffled grid with a little jitter
  const n = G.groups.length, nx = Math.max(1, Math.round(Math.sqrt(n * G.ww / Math.max(1, G.wh)))), ny = Math.max(1, Math.ceil(n / nx));
  const slots = []; for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) slots.push([a, b]);
  for (let k = slots.length - 1; k > 0; k--) { const m = Math.floor(R() * (k + 1)); [slots[k], slots[m]] = [slots[m], slots[k]]; }
  G.groups.forEach((g, k) => { const [a, b] = slots[k]; g.ux = c9Clip((nx > 1 ? a / (nx - 1) : .5) + (R() - .5) * .6 / nx, 0, 1); g.uy = c9Clip((ny > 1 ? b / (ny - 1) : .5) + (R() - .5) * .6 / ny, 0, 1); c9Place(G, g); g.z = ++G.zTop; });
  const o = G.groups.slice(); for (let k = o.length - 1; k > 0; k--) { const m = Math.floor(R() * (k + 1)); [o[k], o[m]] = [o[m], o[k]]; } G.order = o;
  return G;
}
// the cell size and the world: small puzzles fill one screen (the finished print would take about 75 % of it); the big one has a fixed
// cell and a table 1.5 times the finished print; a resize keeps the view centred
function c9Layout(G, W, H, first) {
  const top = 56, vw = W, vh = H - top, aw = W - 20, ah = vh - 16, asp = G.img.naturalWidth / G.img.naturalHeight, old = { W: G.lw, H: G.lh, z: G.cam.z, cx: G.cam.x + G.lw / (2 * G.cam.z), cy: G.cam.y + (G.lh - top) / (2 * G.cam.z), ww: G.ww, wh: G.wh };
  let cw, ch;
  if (G.big) { cw = 44; ch = cw / (asp * G.rows / G.cols); } else { const bw = Math.min(aw * .75, ah * .75 * asp); cw = bw / G.cols; ch = (bw / asp) / G.rows; }
  G.cw = cw; G.ch = ch; G.bw = cw * G.cols; G.bh = ch * G.rows; G.t_ = .27 * Math.max(cw, ch);
  if (G.big) { G.ww = G.bw * 1.5; G.wh = G.bh * 1.5; G.zmin = Math.min(vw / G.ww, vh / G.wh); G.zmax = 5; } else { G.ww = vw; G.wh = vh; G.zmin = .5; G.zmax = 3; }
  G.lw = W; G.lh = H; G.top = top;
  const N = G.cols * G.rows, cwt = cw + 2 * G.t_, cht = ch + 2 * G.t_;
  G.bs = Math.max(.5, Math.min(DPR * 2.5, G.img.naturalWidth / G.cols * 1.6 / cw, Math.sqrt(14e6 / (N * cwt * cht))));   // the baked pixels per world unit
  if (first) { G.cam.z = G.big ? 1 : 1; G.cam.x = G.ww / 2 - vw / 2; G.cam.y = G.wh / 2 - vh / 2; }
  else { G.cam.z = c9Clip(old.z, G.zmin, G.zmax); G.cam.x = old.cx - vw / (2 * G.cam.z); G.cam.y = old.cy - vh / (2 * G.cam.z); if (!G.big) { const sx = G.ww / old.ww, sy = G.wh / old.wh; for (const g of G.groups) { g.x *= sx; g.y *= sy; } } }
  c9ClampCam(G);
  for (const p of G.pieces) { p.key = ''; p.cvTop = null; }
}
function c9ClampCam(G) {
  const c = G.cam, vw = G.lw / c.z, vh = (G.lh - G.top) / c.z;
  c.x = vw >= G.ww ? (G.ww - vw) / 2 : c9Clip(c.x, 0, G.ww - vw); c.y = vh >= G.wh ? (G.wh - vh) / 2 : c9Clip(c.y, 0, G.wh - vh);
}
const c9S2W = (G, sx, sy) => [G.cam.x + sx / G.cam.z, G.cam.y + (sy - G.top) / G.cam.z];
const c9W2S = (G, wx, wy) => [(wx - G.cam.x) * G.cam.z, G.top + (wy - G.cam.y) * G.cam.z];
function c9Zoom(G, factor, sx, sy) { const w = c9S2W(G, sx, sy), z = c9Clip(G.cam.z * factor, G.zmin, G.zmax); G.cam.z = z; G.cam.x = w[0] - sx / z; G.cam.y = w[1] - (sy - G.top) / z; c9ClampCam(G); }
// a loose piece's place from its fractions (the centre of the piece)
function c9Place(G, g) {
  const cx = G.cw * .5 + g.ux * (G.ww - G.cw), cy = G.ch * .5 + g.uy * (G.wh - G.ch), o = c9Rot(g.a, (g.pcs[0].j + .5) * G.cw, (g.pcs[0].i + .5) * G.ch);
  g.x = cx - o[0]; g.y = cy - o[1];
}
const c9Center = (G, g, p) => { const o = c9Rot(g.a, (p.j + .5) * G.cw, (p.i + .5) * G.ch); return [g.x + o[0], g.y + o[1]]; };
function c9Centroid(G, g) { let sx = 0, sy = 0; for (const p of g.pcs) { const c = c9Center(G, g, p); sx += c[0]; sy += c[1]; } return [sx / g.pcs.length, sy / g.pcs.length]; }

function c9PiecePath(G, pc) {
  const { cw, ch } = G, i = pc.i, j = pc.j, p = new Path2D();
  const eT = i === 0 ? 0 : -G.H[i][j], eB = i === G.rows - 1 ? 0 : G.H[i + 1][j], eL = j === 0 ? 0 : -G.V[i][j], eR = j === G.cols - 1 ? 0 : G.V[i][j + 1];
  p.moveTo(0, 0);
  c9Edge(p, 0, 0, cw, 0, 0, -1, eT, G.JH[i][j], false);
  c9Edge(p, cw, 0, cw, ch, 1, 0, eR, G.JV[i][j + 1], false);
  c9Edge(p, cw, ch, 0, ch, 0, 1, eB, G.JH[i + 1][j], true);
  c9Edge(p, 0, ch, 0, 0, -1, 0, eL, G.JV[i][j], true);
  p.closePath(); return p;
}
// the printed face of a piece, drawn once into its own canvas
function c9Bake(G, pc) {
  const key = Math.round(G.cw * 10) + 'x' + Math.round(G.ch * 10) + '@' + G.bs.toFixed(2); if (pc.key === key && pc.cvTop) return true;
  if (G.bakeLeft <= 0) return false; G.bakeLeft--;
  const t = G.t_, S = G.bs, c = document.createElement('canvas'); c.width = Math.ceil((G.cw + 2 * t) * S); c.height = Math.ceil((G.ch + 2 * t) * S);
  const g = c.getContext('2d'); g.setTransform(c.width / (G.cw + 2 * t), 0, 0, c.height / (G.ch + 2 * t), t * c.width / (G.cw + 2 * t), t * c.height / (G.ch + 2 * t));
  pc.path = c9PiecePath(G, pc);
  g.lineJoin = 'round';
  g.save(); g.clip(pc.path);
  g.drawImage(G.img, 0, 0, G.img.naturalWidth, G.img.naturalHeight, -pc.j * G.cw, -pc.i * G.ch, G.bw, G.bh);
  g.restore();
  g.lineWidth = .8; g.strokeStyle = 'rgba(40,26,12,.7)'; g.stroke(pc.path);   // only a hairline so the pieces can be told apart
  pc.cvTop = c; pc.key = key; return true;
}

function c9Tick(G, dt) {
  if (!G.done) G.t += dt;
  for (const g of G.groups) { const up = G.held === g || g.by; if (g.lift > .001 || up) g.lift += ((up ? 1 : 0) - g.lift) * Math.min(1, dt * 14);
    if (g.tx !== undefined && G.held !== g) { const k = Math.min(1, dt * 12); g.x += (g.tx - g.x) * k; g.y += (g.ty - g.y) * k; g.a += c9Wrap(g.ta - g.a) * k; if (Math.abs(g.tx - g.x) + Math.abs(g.ty - g.y) < .05 && Math.abs(c9Wrap(g.ta - g.a)) < .002) { g.x = g.tx; g.y = g.ty; g.a = g.ta; g.tx = undefined; } } }
  if (G.net) G.net.tick(G, dt);
  for (const p of G.pieces) if (p.flash > 0) p.flash = Math.max(0, p.flash - dt / .45);
  G.peek = Math.max(0, G.peek - dt);
  G.flash = G.flash.filter(f => (f.t += dt) < f.life);
  if (G.done) G.win += dt;
  // a lifted piece near the edge of the screen scrolls the view
  if (G.held && !G.pinch && (G.drag && G.drag.moved || (!G.touch && !G.drag))) {
    const m = 38, sp = 520 / G.cam.z * dt; let dx = 0, dy = 0;
    if (G.psx < m) dx = -sp; else if (G.psx > G.lw - m) dx = sp; if (G.psy < G.top + m) dy = -sp; else if (G.psy > G.lh - m) dy = sp;
    if (dx || dy) { const x0 = G.cam.x, y0 = G.cam.y; G.cam.x += dx; G.cam.y += dy; c9ClampCam(G); const w = c9S2W(G, G.psx, G.psy); c9Hold(G, G.held, w[0], w[1]); void x0; void y0; }
  }
}

function c9Draw(G, g, W, H) {
  if (G.lw !== W || G.lh !== H) c9Layout(G, W, H);
  if (G.done) {   // the finished print, big, in the middle of the free space above the result box
    const aw = W - 28, ah = H - 56 - 190, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 60 + (ah - h) / 2;
    g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 7, y - 7, w + 14, h + 14); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); return;
  }
  const cam = G.cam, z = cam.z; G.bakeLeft = G.big ? 70 : 1e9;
  g.save(); g.beginPath(); g.rect(0, G.top, W, H - G.top); g.clip(); g.translate(0, G.top); g.scale(z, z); g.translate(-cam.x, -cam.y);
  if (G.big) { g.fillStyle = 'rgba(120,90,50,.10)'; g.fillRect(0, 0, G.ww, G.wh); g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 3 / z; g.setLineDash([10 / z, 8 / z]); g.strokeRect(0, 0, G.ww, G.wh); g.setLineDash([]); }
  const vx0 = cam.x, vy0 = cam.y, vx1 = cam.x + W / z, vy1 = cam.y + (H - G.top) / z, rad = Math.hypot(G.cw, G.ch) * .75 + G.t_, t = G.t_;
  for (const grp of G.order) {
    const sc = 1 + grp.lift * .035;
    for (const p of grp.pcs) {
      const c = c9Center(G, grp, p); if (c[0] < vx0 - rad || c[0] > vx1 + rad || c[1] < vy0 - rad || c[1] > vy1 + rad) continue;
      if (!c9Bake(G, p)) continue;
      g.save(); g.translate(c[0], c[1]); g.rotate(grp.a); if (sc !== 1) g.scale(sc, sc); g.drawImage(p.cvTop, -G.cw / 2 - t, -G.ch / 2 - t, G.cw + 2 * t, G.ch + 2 * t);
      if (p.flash > 0) { g.globalAlpha = p.flash * .75; g.translate(-G.cw / 2, -G.ch / 2); g.fillStyle = '#fffbe0'; g.fill(p.path); }
      g.restore();
    }
  }
  for (const f of G.flash) { const k = f.t / f.life; g.globalAlpha = 1 - k; g.strokeStyle = '#fff6c8'; g.lineWidth = 4 / z; g.beginPath(); g.arc(f.x, f.y, Math.max(G.cw, G.ch) * (.3 + k * .5), 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  g.restore();
  if (G.net) for (const grp of G.groups) if (grp.by) { const c = c9Centroid(G, grp), s = c9W2S(G, c[0], c[1]); if (s[0] < -40 || s[0] > W + 40 || s[1] < G.top - 40 || s[1] > H + 40) continue; G.net.tag(g, grp.by, s[0], s[1] - Math.max(14, G.ch * z * .7)); }
  if (G.peek > 0) {   // the sample print, over everything (the eye button)
    const aw = W - 40, ah = H - 56 - 40, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 56 + (H - 56 - h) / 2;
    g.globalAlpha = Math.min(1, G.peek * 4) * .96; g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 8, y - 8, w + 16, h + 16); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); g.globalAlpha = 1;
  }
}

// the little turn button beside the lifted group (for a finger), in screen pixels
function c9TurnBtn(G) {
  const grp = G.held; if (!grp || !G.touch) return null; const c = c9Centroid(G, grp), s = c9W2S(G, c[0], c[1]), r = 20, off = Math.min(110, G.cw * G.cam.z * .9 + 18);
  return { x: c9Clip(s[0] + off, r + 6, G.lw - r - 6), y: c9Clip(s[1] - off, G.top + r + 6, G.lh - r - 8), r };
}
function c9DrawTurnBtn(G, g) { const b = c9TurnBtn(G); if (!b) return; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.stroke(); g.lineWidth = 2.6; g.beginPath(); g.arc(b.x, b.y, 8, -2.4, 1.9); g.stroke(); g.fillStyle = '#1d1915'; g.beginPath(); g.moveTo(b.x + 5, b.y + 9); g.lineTo(b.x + 12, b.y + 3); g.lineTo(b.x + 2, b.y + 2); g.closePath(); g.fill(); }

// the piece (and so its group) under a world point; the topmost group first
function c9Hit(G, x, y) {
  for (let k = G.order.length - 1; k >= 0; k--) {
    const grp = G.order[k]; if (grp.by) continue;
    for (const p of grp.pcs) {
      const c = c9Center(G, grp, p), d = c9Rot(-grp.a, x - c[0], y - c[1]), lx = d[0] + G.cw / 2, ly = d[1] + G.ch / 2;
      if (lx < -G.t_ || ly < -G.t_ || lx > G.cw + G.t_ || ly > G.ch + G.t_) continue;
      if (!p.path) p.path = c9PiecePath(G, p);
      if (G.hitCtx.isPointInPath(p.path, lx, ly)) return { grp, p };
    }
  }
  return null;
}
// put the group so that the grabbed point (G.hl, in the group's frame) is under the world point (x, y)
function c9Hold(G, grp, x, y) { const o = c9Rot(grp.a, G.hl[0], G.hl[1]); grp.x = x - o[0]; grp.y = y - o[1]; }
// turn a group by da radians round the world point (x, y)
function c9Turn(G, grp, da, x, y) {
  const d = c9Rot(-grp.a, x - grp.x, y - grp.y); grp.a += da; const o = c9Rot(grp.a, d[0], d[1]); grp.x = x - o[0]; grp.y = y - o[1];
  if (G.held === grp) G.hl = d;
}
function c9Clamp(G, grp) {
  const c = c9Centroid(G, grp); let dx = 0, dy = 0; const m = Math.min(G.cw, G.ch) * .3;
  if (c[0] < m) dx = m - c[0]; if (c[0] > G.ww - m) dx = G.ww - m - c[0]; if (c[1] < m) dy = m - c[1]; if (c[1] > G.wh - m) dy = G.wh - m - c[1];
  grp.x += dx; grp.y += dy;
}
// two groups meet when a piece of one is next to a piece of the other (in the print) and their angle and place agree
function c9TryJoin(G, grp) {
  let joined = false; const tol = C9_POS_TOL * Math.min(G.cw, G.ch);
  for (let guard = 0; guard < 60; guard++) {
    let hit = null;
    for (const other of G.groups) {
      if (other === grp) continue;
      if (Math.abs(other.x - grp.x) > tol || Math.abs(other.y - grp.y) > tol) continue;
      if (Math.abs(c9Wrap(grp.a - other.a)) > C9_ANG_TOL || Math.hypot(grp.x - other.x, grp.y - other.y) > tol) continue;
      let pair = null; for (const a of grp.pcs) { for (const b of other.pcs) if (Math.abs(a.i - b.i) + Math.abs(a.j - b.j) === 1) { pair = [a, b]; break; } if (pair) break; }
      if (pair) { hit = { other, pair }; break; }
    }
    if (!hit) break;
    // the bigger group keeps its pose, the smaller moves onto it
    const big = hit.other.pcs.length >= grp.pcs.length ? hit.other : grp, small = big === grp ? hit.other : grp;
    for (const p of small.pcs) { p.grp = big; big.pcs.push(p); }
    G.groups.splice(G.groups.indexOf(small), 1); const oi = G.order.indexOf(small); if (oi >= 0) G.order.splice(oi, 1);
    hit.pair.forEach(p => { p.flash = 1; }); const c = c9Center(G, big, hit.pair[0]), c2 = c9Center(G, big, hit.pair[1]); G.flash.push({ x: (c[0] + c2[0]) / 2, y: (c[1] + c2[1]) / 2, t: 0, life: .5 });
    AU.pluck(92); joined = true; if (G.held === small) G.held = big; grp = big;
  }
  return joined;
}
function c9Drop(G, grp) {
  c9Clamp(G, grp); if (G.net) { G.net.drop(grp); return null; } c9TryJoin(G, grp);
  if (G.groups.length === 1) { G.done = true; G.win = 0; G.held = null; return 'win'; }
  return null;
}
function c9Lift(G, grp, x, y) { G.held = grp; grp.z = ++G.zTop; const i = G.order.indexOf(grp); if (i >= 0) G.order.splice(i, 1); G.order.push(grp); G.hl = c9Rot(-grp.a, x - grp.x, y - grp.y); AU.tap(); if (G.net) G.net.lift(grp); }

// ---- pointer (sx, sy: canvas pixels below the notch; the world point is worked out here) ----
function c9PinchStart(G) {
  const pts = [...G.tp.values()], a = pts[0], b = pts[1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  G.drag = null; G.pan = null; G.pinch = { d0: Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), z0: G.cam.z, wp: c9S2W(G, mx, my) };
}
function c9PinchMove(G) {
  const pts = [...G.tp.values()], a = pts[0], b = pts[1], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, z = c9Clip(G.pinch.z0 * d / G.pinch.d0, G.zmin, G.zmax);
  G.cam.z = z; G.cam.x = G.pinch.wp[0] - mx / z; G.cam.y = G.pinch.wp[1] - (my - G.top) / z; c9ClampCam(G);
}
function c9Down(G, sx, sy, e, done) {
  if (G.done) return;
  G.touch = e.pointerType !== 'mouse'; G.psx = sx; G.psy = sy;
  if (G.touch) { G.tp.set(e.pointerId, { x: sx, y: sy }); if (G.tp.size >= 2) { c9PinchStart(G); return; } }
  if (G.pinch) return;
  const [wx, wy] = c9S2W(G, sx, sy), fin = r => { if (r === 'win') done('win'); };
  if (e.button === 2) { const h = G.held ? { grp: G.held } : c9Hit(G, wx, wy); if (h) c9Turn(G, h.grp, C9_STEP, wx, wy); return; }
  const tb = c9TurnBtn(G); if (tb && Math.hypot(sx - tb.x, sy - tb.y) < tb.r + 6) { const c = c9Centroid(G, G.held); c9Turn(G, G.held, C9_STEP, c[0], c[1]); G.drag = null; return; }
  const hit = c9Hit(G, wx, wy);
  const lift = h => { if (G.held !== h.grp) c9Lift(G, h.grp, wx, wy); else G.hl = c9Rot(-h.grp.a, wx - h.grp.x, wy - h.grp.y); G.drag = { id: e.pointerId, x0: sx, y0: sy, gx: h.grp.x, gy: h.grp.y, ga: h.grp.a, t0: performance.now(), moved: false }; };
  const startPan = () => { G.pan = { id: e.pointerId, x0: sx, y0: sy, cx: G.cam.x, cy: G.cam.y, moved: false }; };
  if (!G.touch) {   // mouse: a click lifts; the group then follows the mouse until the next click puts it down; empty table: drag to pan
    if (G.held) { c9Hold(G, G.held, wx, wy); const g0 = G.held; G.held = null; G.drag = null; fin(c9Drop(G, g0)); return; }
    if (hit) lift(hit); else startPan(); return;
  }
  if (hit) { lift(hit); return; }   // finger: touching a piece lifts it (drag it, flick it, or tap elsewhere to put it there)
  startPan();
}
function c9Move(G, sx, sy, e) {
  G.hover = null; G.psx = sx; G.psy = sy;
  if (G.touch && G.tp.has(e.pointerId)) G.tp.set(e.pointerId, { x: sx, y: sy });
  if (G.noDrag.has(e.pointerId)) return;
  if (G.pinch) { if (G.tp.size >= 2) c9PinchMove(G); return; }
  const [wx, wy] = c9S2W(G, sx, sy);
  if (G.pan && G.pan.id === e.pointerId) {
    const p = G.pan; if (!p.moved && Math.hypot(sx - p.x0, sy - p.y0) > C9_DRAG_PX) p.moved = true;
    if (p.moved) { G.cam.x = p.cx - (sx - p.x0) / G.cam.z; G.cam.y = p.cy - (sy - p.y0) / G.cam.z; c9ClampCam(G); }
    return;
  }
  if (G.drag && G.held) {
    const d = G.drag; if (!d.moved && Math.hypot(sx - d.x0, sy - d.y0) > C9_DRAG_PX) d.moved = true;
    if (d.moved) c9Hold(G, G.held, wx, wy);
  } else if (G.held && e.pointerType === 'mouse') c9Hold(G, G.held, wx, wy);   // clicked up: it follows the mouse
  else if (e.pointerType === 'mouse') { const h = c9Hit(G, wx, wy); G.hover = h ? h.grp : null; }
}
function c9PtrUp(G, sx, sy, e, done) {
  const wasTouch = e.pointerType !== 'mouse'; G.tp.delete(e.pointerId);
  if (G.noDrag.delete(e.pointerId)) return;
  if (G.pinch) { if (G.tp.size < 2) { G.pinch = null; for (const id of G.tp.keys()) G.noDrag.add(id); } return; }
  if (G.pan && G.pan.id === e.pointerId) {
    const p = G.pan; G.pan = null;
    if (!p.moved && wasTouch && G.held) { const [wx, wy] = c9S2W(G, sx, sy), c = c9Centroid(G, G.held), g0 = G.held; g0.x += wx - c[0]; g0.y += wy - c[1]; G.held = null; G.drag = null; if (c9Drop(G, g0) === 'win') done('win'); }   // a tap on empty table puts the lifted piece there
    return;
  }
  const d = G.drag; G.drag = null; if (!d || !G.held) return;
  const grp = G.held, dt = performance.now() - d.t0, dy = sy - d.y0, dx = sx - d.x0;
  if (d.moved && wasTouch && dt < C9_FLICK_MS && Math.abs(dy) >= C9_FLICK_PX && Math.abs(dx) < Math.abs(dy) * .6) {   // a quick vertical flick: turn, do not move
    grp.x = d.gx; grp.y = d.gy; grp.a = d.ga; const c = c9Centroid(G, grp); c9Turn(G, grp, dy * .016, c[0], c[1]); return;   // about 1° for every 3.5 px
  }
  if (d.moved) { const g0 = grp; G.held = null; if (c9Drop(G, g0) === 'win') done('win'); return; }   // dragged and let go: dropped
  // a click or tap: it stays lifted (a mouse carries it, a finger waits for a tap elsewhere)
}
// the wheel: turns the lifted group round the pointer; with nothing lifted (or with Ctrl, or a trackpad pinch) it zooms about the pointer
function c9Wheel(G, delta, sx, sy, ctrl) {
  if (G.held && !ctrl) { const [wx, wy] = c9S2W(G, sx, sy); c9Turn(G, G.held, delta * .0018, wx, wy); return true; }
  c9Zoom(G, Math.exp(-delta * (ctrl ? .01 : .0016)), sx, sy); return true;
}

// ---- save and resume (the big puzzle takes a long time) ----
const c9R1 = v => Math.round(v * 10) / 10;
function c9Snapshot(G) { return { t: Math.round(G.t), cam: { x: c9R1(G.cam.x), y: c9R1(G.cam.y), z: Math.round(G.cam.z * 1000) / 1000 }, g: G.order.map(g => [c9R1(g.x), c9R1(g.y), Math.round(g.a * 1000) / 1000, g.pcs.map(p => p.id).join(',')]) };
}
function c9Restore(G, st) {
  if (!st || !Array.isArray(st.g)) return false;
  const seen = new Set(), groups = [];
  for (const row of st.g) {
    const ids = String(row[3]).split(',').map(Number), pcs = ids.map(i => G.pieces[i]); if (pcs.some(p => !p || seen.has(p.id))) return false;
    pcs.forEach(p => seen.add(p.id)); groups.push({ id: pcs[0].id, x: +row[0], y: +row[1], a: +row[2], pcs, z: groups.length + 1, lift: 0, ux: 0, uy: 0 });
  }
  if (seen.size !== G.pieces.length) return false;
  for (const g of groups) g.pcs.forEach(p => { p.grp = g; });
  G.groups = groups; G.order = groups.slice(); G.zTop = groups.length + 1; G.t = +st.t || 0;
  if (st.cam) { G.cam.z = c9Clip(+st.cam.z || 1, G.zmin, G.zmax); G.cam.x = +st.cam.x || 0; G.cam.y = +st.cam.y || 0; c9ClampCam(G); }
  if (G.groups.length === 1) G.done = false;
  return true;
}

// ---- the shared puzzle (chương X): the server owns the groups; these apply what it tells us ----
function c9NetRestore(G, rows, holds, done) {
  const groups = [], seen = new Set();
  for (const r of rows) {
    const pcs = String(r[4]).split(',').map(i => G.pieces[+i]); if (pcs.some(p => !p || seen.has(p.id))) return false; pcs.forEach(p => seen.add(p.id));
    const g = { id: r[0], x: +r[1], y: +r[2], a: +r[3], pcs, z: 0, lift: 0, ux: 0, uy: 0, by: null, tx: undefined }; pcs.forEach(p => { p.grp = g; }); groups.push(g);
  }
  if (seen.size !== G.pieces.length) return false;
  G.groups = groups; G.order = groups.slice(); G.gm = new Map(groups.map(g => [g.id, g])); G.held = null; G.drag = null; G.done = false; G.win = 0; G.flash = [];
  for (const h of holds || []) { const g = G.gm.get(h[0]); if (g) { g.by = h[1]; g.lift = 1; } }
  if (done) { G.done = true; } return true;
}
function c9NetLift(G, gid, by) {
  const g = G.gm.get(gid); if (!g) return; g.by = by; g.tx = undefined; if (G.held === g) { G.held = null; G.drag = null; }
  const i = G.order.indexOf(g); if (i >= 0) { G.order.splice(i, 1); G.order.push(g); }
}
function c9NetPoses(G, rows) { for (const r of rows) { const g = G.gm.get(r[0]); if (g && G.held !== g) { g.tx = r[1]; g.ty = r[2]; g.ta = g.a + c9Wrap(r[3] - g.a); } } }
function c9NetDrop(G, gid, x, y, a) {
  const g = G.gm.get(gid); if (!g) return; g.by = null; if (G.held === g) { G.held = null; G.drag = null; }
  g.tx = x; g.ty = y; g.ta = g.a + c9Wrap(a - g.a);
}
function c9NetDeny(G, gid) { const g = G.gm.get(gid); if (g && G.held === g) { G.held = null; G.drag = null; } }
function c9NetJoin(G, m) {
  const big = G.gm.get(m.keep), small = G.gm.get(m.gone); if (!big || !small) return;
  if (G.held === small) { G.held = null; G.drag = null; }
  big.by = null; big.tx = m.x; big.ty = m.y; big.ta = big.a + c9Wrap(m.a - big.a);
  for (const p of small.pcs) { p.grp = big; big.pcs.push(p); }
  G.groups.splice(G.groups.indexOf(small), 1); const oi = G.order.indexOf(small); if (oi >= 0) G.order.splice(oi, 1); G.gm.delete(small.id);
  const pa = G.pieces[m.pair[0]], pb = G.pieces[m.pair[1]]; pa.flash = 1; pb.flash = 1;
  const c = c9Center(G, big, pa), c2 = c9Center(G, big, pb); G.flash.push({ x: (c[0] + c2[0]) / 2, y: (c[1] + c2[1]) / 2, t: 0, life: .5 });
  AU.pluck(92);
}
