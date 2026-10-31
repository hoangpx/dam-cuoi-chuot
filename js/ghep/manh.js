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
const C9_ANG_TOL_NET = 22 * Math.PI / 180, C9_POS_TOL_NET = .6;   // the shared puzzle (chương X) is more forgiving: a thousand small pieces on a phone (a join still needs a neighbouring pair, so nothing joins by mistake); the server uses the same numbers

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
  const R = c9Rng(seedNum * 7919 + 13), G = { hitCtx: document.createElement('canvas').getContext('2d'), L, img, cols: L.cols, rows: L.rows, big: !!L.big || L.cols * L.rows >= 100, pieces: [], groups: [], order: [], held: null, drag: null, pan: null, pinch: null, tp: new Map(), noDrag: new Set(), hl: [0, 0], cam: { x: 0, y: 0, z: 1 }, t: 0, done: false, win: 0, peek: 0, lw: 0, lh: 0, seed: seedNum, flash: [], zTop: 0, bakeLeft: 1e9, psx: 0, psy: 0 };
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
// (a print of thousands of pieces can be seen whole, down to 3.5 px a piece: the far view draws the print itself)
function c9Layout(G, W, H, first) {
  const top = 56, vw = W, vh = H - top, aw = W - 20, ah = vh - 16, asp = G.img.naturalWidth / G.img.naturalHeight, old = { W: G.lw, H: G.lh, z: G.cam.z, cx: G.cam.x + G.lw / (2 * G.cam.z), cy: G.cam.y + (G.lh - top) / (2 * G.cam.z), ww: G.ww, wh: G.wh };
  let cw, ch;
  if (G.big) { cw = 44; ch = cw / (asp * G.rows / G.cols); } else { const bw = Math.min(aw * .75, ah * .75 * asp); cw = bw / G.cols; ch = (bw / asp) / G.rows; }
  G.cw = cw; G.ch = ch; G.bw = cw * G.cols; G.bh = ch * G.rows; G.t_ = .27 * Math.max(cw, ch);
  if (G.big) { G.ww = G.bw * 1.5; G.wh = G.bh * 1.5; G.zmin = Math.max(Math.min(vw / G.ww, vh / G.wh), (G.pieces.length > 2500 ? 3.5 : 11) / G.cw); G.zmax = 5; } else { G.ww = vw; G.wh = vh; G.zmin = .5; G.zmax = 3; }
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
// the print shrunk to a few pixels a piece, for the far view and for the pieces not baked yet: G.midCv (16 px a piece, a canvas) and the same as
// pixels at 16 and at 4 px a piece (G.midU0, G.midU1) so a piece seen from far away is a bit of the real picture, not a flat square; null if the browser will not read the pixels
const C9_MID = 16;
function c9Avg(G) {
  if (G.avg !== undefined) return G.avg;
  try {
    const T = C9_MID, mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    let src = G.img, w = G.img.naturalWidth, h = G.img.naturalHeight;
    while (w > G.cols * T * 2) { w = Math.max(G.cols * T, Math.floor(w / 2)); h = Math.max(G.rows * T, Math.floor(h / 2)); const c = mk(w, h), x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h); src = c; }
    const m0 = mk(G.cols * T, G.rows * T), x0 = m0.getContext('2d'); x0.imageSmoothingQuality = 'high'; x0.drawImage(src, 0, 0, m0.width, m0.height);
    const m1 = mk(G.cols * 4, G.rows * 4), x1 = m1.getContext('2d'); x1.imageSmoothingQuality = 'high'; x1.drawImage(m0, 0, 0, m1.width, m1.height);
    const m2 = mk(G.cols * 8, G.rows * 8), x2 = m2.getContext('2d'); x2.imageSmoothingQuality = 'high'; x2.drawImage(m0, 0, 0, m2.width, m2.height);
    const d0 = x0.getImageData(0, 0, m0.width, m0.height), d1 = x1.getImageData(0, 0, m1.width, m1.height), d2 = x2.getImageData(0, 0, m2.width, m2.height);
    G.midCv = m0; G.midU0 = new Uint32Array(d0.data.buffer); G.midU1 = new Uint32Array(d1.data.buffer); G.midU2 = new Uint32Array(d2.data.buffer); G.avg = true;
  } catch (e) { G.avg = null; }
  return G.avg;
}
// the cut lines of the whole print on one transparent canvas (half a world unit a pixel), for the finished print seen from far: the print itself is drawn sharp under it
function c9Grooves(G) {
  const S = .5, key = G.cw + 'x' + G.ch + 'x' + G.pieces.length; if (G.groovesKey === key && G.grooves) return G.grooves;
  const c = document.createElement('canvas'); c.width = Math.ceil(G.bw * S); c.height = Math.ceil(G.bh * S); const x = c.getContext('2d');
  x.lineJoin = 'round'; x.lineWidth = 1.6 / S; x.strokeStyle = 'rgba(40,26,12,.42)';
  for (const p of G.pieces) { x.setTransform(S, 0, 0, S, p.j * G.cw * S, p.i * G.ch * S); x.stroke(c9PiecePath(G, p)); }
  G.grooves = c; G.groovesKey = key; return c;
}
// an atlas of every piece as a tiny real puzzle piece (its shape, a bit of the print, a hairline), 16 px a cell, baked a few ms a frame in id order (G.atlasN pieces so far):
// pieces seen from far away are drawn from it, so they look like pieces and not squares
const C9_ATL = 16, C9_TMP = [0, 0];
function c9AtlasStep(G) {
  if (!G.big || !c9Avg(G)) return;
  const A = C9_ATL, t = G.t_, key = G.cw + 'x' + G.ch + 'x' + G.pieces.length;
  if (G.atlasKey !== key) { G.atlasKey = key; G.atlasN = 0; const c = document.createElement('canvas'); c.width = G.cols * A; c.height = G.rows * A; G.atlas = c; G.atlasCx = c.getContext('2d'); }
  if (G.atlasN >= G.pieces.length) return;
  const x = G.atlasCx, end = performance.now() + 4, sx = A / (G.cw + 2 * t), sy = A / (G.ch + 2 * t), mc = G.midCv, T = C9_MID;
  while (G.atlasN < G.pieces.length && performance.now() < end) {
    const p = G.pieces[G.atlasN++], ox = p.j * A, oy = p.i * A;
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.beginPath(); x.rect(ox, oy, A, A); x.clip();
    x.setTransform(sx, 0, 0, sy, ox + t * sx, oy + t * sy);
    const path = c9PiecePath(G, p); x.save(); x.clip(path);
    x.drawImage(mc, p.j * T - t * T / G.cw, p.i * T - t * T / G.ch, T * (1 + 2 * t / G.cw), T * (1 + 2 * t / G.ch), -t, -t, G.cw + 2 * t, G.ch + 2 * t);
    x.restore(); x.lineJoin = 'round'; x.lineWidth = .7 / Math.min(sx, sy); x.strokeStyle = 'rgba(40,26,12,.55)'; x.stroke(path); x.restore();
  }
}
// the far view: every piece a bit of the print (turned with its group) in a pixel buffer at about the screen's size (half of it when the screen is huge), drawn over the camera's rectangle with one drawImage
// fx: piece id, x, y, group angle
function c9FarLayer(G, g, W, H, z, fx) {
  const s = Math.max(.5, Math.min(DPR, Math.sqrt(3e6 / (W * (H - G.top))))), bw = Math.max(1, Math.ceil(W * s)), bh = Math.max(1, Math.ceil((H - G.top) * s));
  if (!G.farCv || G.farCv.width !== bw || G.farCv.height !== bh) { G.farCv = document.createElement('canvas'); G.farCv.width = bw; G.farCv.height = bh; G.farCx = G.farCv.getContext('2d'); G.farImg = G.farCx.createImageData(bw, bh); G.farU = new Uint32Array(G.farImg.data.buffer); }
  const u = G.farU, cam = G.cam, k = z * s, hx = G.cw * k / 2, hy = G.ch * k / 2, T = hx >= 5 ? C9_MID : hx >= 2 ? 8 : 4, M = T === C9_MID ? G.midU0 : T === 8 ? G.midU2 : G.midU1, mw = G.cols * T, cols = G.cols; u.fill(0);
  for (let n = 0; n < fx.length; n += 4) {
    const id = fx[n], cx = (fx[n + 1] - cam.x) * k, cy = (fx[n + 2] - cam.y) * k, a = fx[n + 3], c = Math.cos(a), sn = Math.sin(a);
    const ex = Math.ceil(Math.abs(c) * hx + Math.abs(sn) * hy), ey = Math.ceil(Math.abs(sn) * hx + Math.abs(c) * hy);
    const xa = Math.max(0, Math.floor(cx - ex)), xb = Math.min(bw, Math.ceil(cx + ex)), ya = Math.max(0, Math.floor(cy - ey)), yb = Math.min(bh, Math.ceil(cy + ey));
    const bi = Math.floor(id / cols) * T, bj = (id % cols) * T, kx = T / (2 * hx), ky = T / (2 * hy);
    for (let yy = ya; yy < yb; yy++) {
      const dy = yy + .5 - cy;
      for (let xx = xa; xx < xb; xx++) {
        const dx = xx + .5 - cx, uu = dx * c + dy * sn, vv = dy * c - dx * sn;
        if (uu < -hx - .02 || uu > hx + .02 || vv < -hy - .02 || vv > hy + .02) continue;   // a hair wider than the piece, so two pieces never leave a pixel row between them
        const tx = Math.min(T - 1, Math.max(0, ((uu + hx) * kx) | 0)), ty = Math.min(T - 1, Math.max(0, ((vv + hy) * ky) | 0));
        u[yy * bw + xx] = M[(bi + ty) * mw + bj + tx];
      }
    }
  }
  G.farCx.putImageData(G.farImg, 0, 0); g.drawImage(G.farCv, 0, 0, bw, bh, cam.x, cam.y, W / z, (H - G.top) / z);
}
// the printed face of a piece, drawn once into its own canvas
function c9Bake(G, pc, S0) {
  const S = S0 || G.bs, key = Math.round(G.cw * 10) + 'x' + Math.round(G.ch * 10) + '@' + S.toFixed(2); if (pc.key === key && pc.cvTop) return true;
  if (G.bakeLeft <= 0 || performance.now() > G.bakeEnd) return false; G.bakeLeft--;
  const t = G.t_, c = document.createElement('canvas'); c.width = Math.ceil((G.cw + 2 * t) * S); c.height = Math.ceil((G.ch + 2 * t) * S);
  const g = c.getContext('2d'); g.setTransform(c.width / (G.cw + 2 * t), 0, 0, c.height / (G.ch + 2 * t), t * c.width / (G.cw + 2 * t), t * c.height / (G.ch + 2 * t));
  pc.path = c9PiecePath(G, pc);
  g.lineJoin = 'round';
  g.save(); g.clip(pc.path);
  g.drawImage(G.img, 0, 0, G.img.naturalWidth, G.img.naturalHeight, -pc.j * G.cw, -pc.i * G.ch, G.bw, G.bh);
  g.restore();
  g.lineWidth = .8; g.strokeStyle = 'rgba(40,26,12,.7)'; g.stroke(pc.path);   // only a hairline so the pieces can be told apart
  pc.cvTop = c; pc.key = key; pc.lvl = S; return true;
}

function c9Tick(G, dt) {
  if (G.thold) {   // a finger kept on a turn button: after a tap's worth of time the piece keeps turning, faster and faster
    const th = G.thold; if (!G.held || th.t > 12) G.thold = null;
    else { th.t += dt; if (th.t > .4) { const k = Math.min(1, (th.t - .4) / 1.6), rate = (60 + 120 * k) * Math.PI / 180, c = c9Centroid(G, G.held); c9Turn(G, G.held, th.dir * rate * dt, c[0], c[1], false); } }
  }
  if (G.tgrp && G.tacc) { let da = G.tacc * Math.min(1, dt * 14); if (Math.abs(G.tacc) < .003) da = G.tacc; G.tacc -= da; c9TurnApply(G, da); if (!G.tacc) G.tgrp = null; }
  if (!G.done) G.t += dt;
  for (const g of G.groups) { const up = G.held === g || g.by; if (g.lift > .001 || up) g.lift += ((up ? 1 : 0) - g.lift) * Math.min(1, dt * 14);
    if (g.tx !== undefined && G.held !== g) { const k = Math.min(1, dt * 12); g.x += (g.tx - g.x) * k; g.y += (g.ty - g.y) * k; g.a += c9Wrap(g.ta - g.a) * k; if (Math.abs(g.tx - g.x) + Math.abs(g.ty - g.y) < .05 && Math.abs(c9Wrap(g.ta - g.a)) < .002) { g.x = g.tx; g.y = g.ty; g.a = g.ta; g.tx = undefined; } } }
  if (G.net) G.net.tick(G, dt);
  for (const p of G.pieces) if (p.flash > 0) p.flash = Math.max(0, p.flash - dt / .45);
  G.flash = G.flash.filter(f => (f.t += dt) < f.life);
  if (G.done) G.win += dt;
  // a lifted piece near the edge of the screen scrolls the view
  if (G.held && !G.pinch && (G.drag && G.drag.moved || (!G.touch && !G.drag))) {
    const m = 38, sp = 520 / G.cam.z * dt; let dx = 0, dy = 0;
    if (G.psx < m) dx = -sp; else if (G.psx > G.lw - m) dx = sp; if (G.psy < G.top + m) dy = -sp; else if (G.psy > G.lh - m) dy = sp;
    if (dx || dy) { const x0 = G.cam.x, y0 = G.cam.y; G.cam.x += dx; G.cam.y += dy; c9ClampCam(G); const w = c9S2W(G, G.psx, G.psy); c9Hold(G, G.held, w[0], w[1]); void x0; void y0; }
  }
}

// ---- the sample print (the eye button): the whole picture at its full quality, zoomed in and out and panned. G.sv = null | { z (screen px per picture px), cx, cy (the picture point at the middle), fit, pts, pan, pinch }
const c9SvArea = G => ({ x: 0, y: G.top, w: G.lw, h: G.lh - G.top - (G.net ? 52 : 0) });
function c9SvBtns(G) { const a = c9SvArea(G), r = 19, x = a.x + a.w - 30; return [{ k: 'x', t: '×', x, y: a.y + 30, r }, { k: 'in', t: '+', x, y: a.y + a.h - 30 - 2 * 48, r }, { k: 'out', t: '−', x, y: a.y + a.h - 30 - 48, r }, { k: 'fit', t: '⤢', x, y: a.y + a.h - 30, r }]; }
function c9SvToggle(G) {
  if (G.sv) { G.sv = null; return; }
  const a = c9SvArea(G), iw = G.img.naturalWidth, ih = G.img.naturalHeight, f = Math.min((a.w - 24) / iw, (a.h - 24) / ih);
  G.sv = { z: f, fit: f, cx: iw / 2, cy: ih / 2, pts: new Map(), pan: null, pinch: null };
}
function c9SvClamp(G) {
  const s = G.sv, a = c9SvArea(G), iw = G.img.naturalWidth, ih = G.img.naturalHeight; s.z = c9Clip(s.z, s.fit, Math.max(s.fit * 1.01, 2.2));
  const hw = a.w / 2 / s.z, hh = a.h / 2 / s.z; s.cx = iw <= 2 * hw ? iw / 2 : c9Clip(s.cx, hw, iw - hw); s.cy = ih <= 2 * hh ? ih / 2 : c9Clip(s.cy, hh, ih - hh);
}
function c9SvZoom(G, f, sx, sy) {   // zoom about a screen point
  const s = G.sv, a = c9SvArea(G), ox = sx - (a.x + a.w / 2), oy = sy - (a.y + a.h / 2), ix = s.cx + ox / s.z, iy = s.cy + oy / s.z;
  s.z = c9Clip(s.z * f, s.fit, Math.max(s.fit * 1.01, 2.2)); s.cx = ix - ox / s.z; s.cy = iy - oy / s.z; c9SvClamp(G);
}
function c9SvDown(G, x, y, e) {
  const s = G.sv; for (const b of c9SvBtns(G)) if (Math.hypot(x - b.x, y - b.y) < b.r + 8) {
    const a = c9SvArea(G); if (b.k === 'x') G.sv = null; else if (b.k === 'in') c9SvZoom(G, 1.5, a.x + a.w / 2, a.y + a.h / 2); else if (b.k === 'out') c9SvZoom(G, 1 / 1.5, a.x + a.w / 2, a.y + a.h / 2); else { s.z = s.fit; s.cx = G.img.naturalWidth / 2; s.cy = G.img.naturalHeight / 2; c9SvClamp(G); } return;
  }
  s.pts.set(e.pointerId, { x, y });
  if (s.pts.size >= 2) { const p = [...s.pts.values()]; s.pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1 }; s.pan = null; }
  else s.pan = { id: e.pointerId, x0: x, y0: y, cx: s.cx, cy: s.cy };
}
function c9SvMove(G, x, y, e) {
  const s = G.sv; if (!s.pts.has(e.pointerId)) return; s.pts.set(e.pointerId, { x, y });
  if (s.pinch && s.pts.size >= 2) { const p = [...s.pts.values()], d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1; c9SvZoom(G, d / s.pinch.d, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2); s.pinch.d = d; }
  else if (s.pan && s.pan.id === e.pointerId) { s.cx = s.pan.cx - (x - s.pan.x0) / s.z; s.cy = s.pan.cy - (y - s.pan.y0) / s.z; c9SvClamp(G); }
}
function c9SvUp(G, x, y, e) {
  const s = G.sv; s.pts.delete(e.pointerId); s.pinch = null; s.pan = null;
  if (s.pts.size === 1) { const [id, p] = [...s.pts][0]; s.pan = { id, x0: p.x, y0: p.y, cx: s.cx, cy: s.cy }; }
}
function c9SvWheel(G, d, x, y) { c9SvZoom(G, Math.exp(-d * .0016), x, y); }
function c9SvDraw(G, g) {
  const s = G.sv, a = c9SvArea(G); g.save(); g.fillStyle = 'rgba(29,25,21,.93)'; g.fillRect(a.x, a.y, a.w, a.h); g.beginPath(); g.rect(a.x, a.y, a.w, a.h); g.clip();
  const iw = G.img.naturalWidth, ih = G.img.naturalHeight, w = iw * s.z, h = ih * s.z, x = a.x + a.w / 2 - s.cx * s.z, y = a.y + a.h / 2 - s.cy * s.z;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(G.img, x, y, w, h);
  g.strokeStyle = '#f2ecde'; g.lineWidth = 3; g.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3); g.restore();
  for (const b of c9SvBtns(G)) { g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#1d1915'; g.font = '800 ' + (b.k === 'fit' ? 15 : 22) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.t, b.x, b.y + 1); }
}

function c9Draw(G, g, W, H) {
  if (G.lw !== W || G.lh !== H) c9Layout(G, W, H);
  if (G.done && G.net && !G.fitted) { G.fitted = true; c9FitPrint(G, W, H); }
  if (G.done && !G.net) {   // the finished print, big, in the middle of the free space above the result box
    const aw = W - 28, ah = H - 56 - 190, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 60 + (ah - h) / 2;
    g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 7, y - 7, w + 14, h + 14); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); return;
  }
  const cam = G.cam, z = cam.z; G.bakeLeft = G.big ? 70 : 1e9;
  if (G.big) c9AtlasStep(G);
  const avg = G.big ? c9Avg(G) : null, far = !!avg && G.pieces.length > 2500 && (W / z / G.cw) * ((H - G.top) / z / G.ch) > 2200; G.bakeEnd = G.big ? performance.now() + 6 : Infinity;
  let L = G.bs;   // the sharpness the pieces in view are baked at (see c9Bake)
  if (G.big) {
    G.fr = (G.fr || 0) + 1;
    const vis = Math.max(1, (W / z / G.cw) * ((H - G.top) / z / G.ch)), cwt = G.cw + 2 * G.t_, cht = G.ch + 2 * G.t_, raw = Math.min(DPR * z * 1.15, Math.sqrt(14e6 / (vis * cwt * cht)), 12);
    if (raw > G.bs * 1.2) L = G.bs * Math.pow(1.4142, Math.floor(Math.log(raw / G.bs) / Math.log(1.4142)));
    if (G.fr % 90 === 0) for (const p of G.pieces) if (p.cvTop && p.lvl > G.bs * 1.01 && G.fr - (p.seen || 0) > 90) { p.cvTop = null; p.key = ''; }
  }
  g.save(); g.beginPath(); g.rect(0, G.top, W, H - G.top); g.clip(); g.translate(0, G.top); g.scale(z, z); g.translate(-cam.x, -cam.y);
  if (G.big) { g.fillStyle = 'rgba(120,90,50,.10)'; g.fillRect(0, 0, G.ww, G.wh); g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 3 / z; g.setLineDash([10 / z, 8 / z]); g.strokeRect(0, 0, G.ww, G.wh); g.setLineDash([]); }
  const vx0 = cam.x, vy0 = cam.y, vx1 = cam.x + W / z, vy1 = cam.y + (H - G.top) / z, rad = Math.hypot(G.cw, G.ch) * .75 + G.t_, t = G.t_;
  const flat = G.flatL || (G.flatL = []), items = G.itemsL || (G.itemsL = []), fx = G.farL || (G.farL = []); flat.length = 0; items.length = 0; fx.length = 0;   // flat: key, x, y; items: group, piece, x, y
  const still = G.done && G.net && z < .35 && G.groups.length === 1 && Math.abs(G.groups[0].a) < .01;   // finished print, seen small: the sharp print with its cut lines on top
  if (still) {   // composed once for this zoom (a canvas as big as it shows on screen), then only blitted
    const g0 = G.groups[0], k = Math.round(z * DPR * 1000); if (G.stillK !== k || !G.stillCv) { const c = G.stillCv || (G.stillCv = document.createElement('canvas')); c.width = Math.ceil(G.bw * z * DPR); c.height = Math.ceil(G.bh * z * DPR); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(G.img, 0, 0, c.width, c.height); x.drawImage(c9Grooves(G), 0, 0, c.width, c.height); G.stillK = k; }
    g.drawImage(G.stillCv, g0.x, g0.y, G.bw, G.bh);
  }
  for (const grp of (still ? [] : G.order)) {
    const ga = grp.a, gc = Math.cos(ga), gs = Math.sin(ga), gx = grp.x, gy = grp.y, c = C9_TMP;
    for (const p of grp.pcs) {
      const lx = (p.j + .5) * G.cw, ly = (p.i + .5) * G.ch; c[0] = gx + lx * gc - ly * gs; c[1] = gy + lx * gs + ly * gc; if (c[0] < vx0 - rad || c[0] > vx1 + rad || c[1] < vy0 - rad || c[1] > vy1 + rad) continue;
      if (far) { if (p.id < G.atlasN) flat.push(grp, p, c[0], c[1]); else fx.push(p.id, c[0], c[1], grp.a); continue; }
      if (avg && (!c9Bake(G, p, L) && !p.cvTop)) { flat.push(grp, p, c[0], c[1]); continue; }   // not baked yet: a bit of the print for now
      if (!avg && !c9Bake(G, p, L) && !p.cvTop) continue;
      p.seen = G.fr; items.push(grp, p, c[0], c[1]);
    }
  }
  if (fx.length) c9FarLayer(G, g, W, H, z, fx);
  if (flat.length) {   // pieces not baked yet: their bit of the shrunk print, turned with the group
    const M0 = g.getTransform(), T = C9_MID, fw = G.cw + .8, fh = G.ch + .8; g.imageSmoothingQuality = 'medium';
    for (let k = 0; k < flat.length; k += 4) {
      const grp = flat[k], p = flat[k + 1], x = flat[k + 2], y = flat[k + 3], cc = Math.cos(grp.a), cs = Math.sin(grp.a);
      g.setTransform(M0.a * cc + M0.c * cs, M0.b * cc + M0.d * cs, -M0.a * cs + M0.c * cc, -M0.b * cs + M0.d * cc, M0.a * x + M0.c * y + M0.e, M0.b * x + M0.d * y + M0.f);
      if (p.id < G.atlasN) g.drawImage(G.atlas, p.j * C9_ATL, p.i * C9_ATL, C9_ATL, C9_ATL, -G.cw / 2 - G.t_, -G.ch / 2 - G.t_, G.cw + 2 * G.t_, G.ch + 2 * G.t_);
      else g.drawImage(G.midCv, p.j * T, p.i * T, T, T, -fw / 2, -fh / 2, fw, fh);
    }
    g.setTransform(M0);
  }
  g.imageSmoothingQuality = Math.max(G.cw, G.ch) * z < 12 ? 'high' : 'low';
  const M = g.getTransform(), hw = -G.cw / 2 - t, hh = -G.ch / 2 - t, dw = G.cw + 2 * t, dh = G.ch + 2 * t;
  for (let k = 0; k < items.length; k += 4) {
    const grp = items[k], p = items[k + 1], sc = 1 + grp.lift * .035, x = items[k + 2], y = items[k + 3];
    if (sc === 1 && !(p.flash > 0)) {   // the usual piece: its matrix set directly (save/translate/rotate/restore were a third of the time)
      if (grp.ca !== grp.a) { grp.ca = grp.a; grp.cc = Math.cos(grp.a); grp.cs = Math.sin(grp.a); }
      g.setTransform(M.a * grp.cc + M.c * grp.cs, M.b * grp.cc + M.d * grp.cs, -M.a * grp.cs + M.c * grp.cc, -M.b * grp.cs + M.d * grp.cc, M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f);
      g.drawImage(p.cvTop, hw, hh, dw, dh); continue;
    }
    g.setTransform(M); g.save(); g.translate(x, y); g.rotate(grp.a); if (sc !== 1) g.scale(sc, sc); g.drawImage(p.cvTop, hw, hh, dw, dh);
    if (p.flash > 0) { g.globalAlpha = p.flash * .75; g.translate(-G.cw / 2, -G.ch / 2); g.fillStyle = '#fffbe0'; g.fill(p.path); }
    g.restore();
  }
  g.setTransform(M); g.imageSmoothingQuality = 'low';
  for (const f of G.flash) { const k = f.t / f.life; g.globalAlpha = 1 - k; g.strokeStyle = '#fff6c8'; g.lineWidth = 4 / z; g.beginPath(); g.arc(f.x, f.y, Math.max(G.cw, G.ch) * (.3 + k * .5), 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  g.restore();
  if (G.net) for (const grp of G.groups) if (grp.by) { const c = c9Centroid(G, grp), s = c9W2S(G, c[0], c[1]); if (s[0] < -40 || s[0] > W + 40 || s[1] < G.top - 40 || s[1] > H + 40) continue; G.net.tag(g, grp.by, s[0], s[1] - Math.max(14, G.ch * z * .7)); }
  if (G.sv) c9SvDraw(G, g);   // the sample print (the eye button), over everything
}

// the two little turn buttons beside the lifted group (for a finger), in screen pixels: anticlockwise (dir -1) on the left, clockwise (dir 1) on the right
function c9TurnBtns(G) {
  const grp = G.held; if (!grp || !G.touch) return [];
  const c = c9Centroid(G, grp), s = c9W2S(G, c[0], c[1]), r = 20, off = Math.min(110, G.cw * G.cam.z * .9 + 18), hi = G.lw - r - 6 - (G.big ? 48 : 0);   // clear of the zoom buttons and the player strip
  const y = c9Clip(s[1] - off, G.top + r + 6, G.lh - r - 8 - (G.net ? 52 : 0)); let xr = c9Clip(s[0] + off, r + 6 + 2 * r + 8, hi), xl = c9Clip(s[0] - off, r + 6, hi); if (xr - xl < 2 * r + 8) xl = xr - 2 * r - 8;
  return [{ x: xl, y, r, dir: -1 }, { x: xr, y, r, dir: 1 }];
}
function c9DrawTurnBtn(G, g) {
  for (const b of c9TurnBtns(G)) {
    g.save(); g.translate(b.x, b.y); g.scale(b.dir, 1);   // drawn clockwise; the left one is its mirror image
    g.beginPath(); g.arc(0, 0, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.stroke();
    // a clockwise arc with its arrowhead exactly at the end of the line, pointing along it
    const R = 9, a0 = -2.3, a1 = 1.7, ex = R * Math.cos(a1), ey = R * Math.sin(a1), tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1);
    g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, R, a0, a1 - .12); g.stroke();
    g.fillStyle = '#1d1915'; g.beginPath(); g.moveTo(ex + tx * 6, ey + ty * 6); g.lineTo(ex + nx * 5, ey + ny * 5); g.lineTo(ex - nx * 5, ey - ny * 5); g.closePath(); g.fill(); g.lineCap = 'butt';
    g.restore();
  }
}

// the piece (and so its group) under a world point; the topmost group first
// a group somebody else is carrying under the point (clicking it reminds the carrier to put it down)
function c9HitHeld(G, x, y) {
  for (let k = G.order.length - 1; k >= 0; k--) { const grp = G.order[k]; if (!grp.by) continue; for (const p of grp.pcs) { const c = c9Center(G, grp, p); if (Math.abs(x - c[0]) < G.cw * .6 && Math.abs(y - c[1]) < G.ch * .6) return grp; } }
  return null;
}
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
// turns asked for by the wheel, the keys, the button and the right click glide to their angle (c9Tick); a drop or another lift finishes them at once
function c9TurnSmooth(G, grp, da, x, y) { if (G.tgrp && G.tgrp !== grp) c9TurnFlush(G); G.tgrp = grp; G.tacc = (G.tacc || 0) + da; G.tpx = x; G.tpy = y; G.tmouse = G.held === grp && !G.touch; }   // x, y null: about the centroid at the moment it is applied
function c9TurnApply(G, da) { const p = G.tpx == null ? c9Centroid(G, G.tgrp) : [G.tpx, G.tpy]; c9Turn(G, G.tgrp, da, p[0], p[1], G.tmouse); }
function c9TurnFlush(G) { if (G.tgrp && G.tacc) c9TurnApply(G, G.tacc); G.tacc = 0; G.tgrp = null; }
function c9Turn(G, grp, da, x, y, byMouse) {
  const mouse = (byMouse !== undefined ? byMouse : G.held === grp && !G.touch) && G.hl;   // carried by the mouse: turn about the point it is held by, which stays under the pointer
  if (mouse) { const h = c9Rot(grp.a, G.hl[0], G.hl[1]); x = grp.x + h[0]; y = grp.y + h[1]; }
  const d = c9Rot(-grp.a, x - grp.x, y - grp.y); grp.a += da; const o = c9Rot(grp.a, d[0], d[1]); grp.x = x - o[0]; grp.y = y - o[1];
  if (G.held === grp && !mouse) G.hl = d;
}
function c9Clamp(G, grp) {
  const c = c9Centroid(G, grp); let dx = 0, dy = 0; const m = Math.min(G.cw, G.ch) * .3;
  if (c[0] < m) dx = m - c[0]; if (c[0] > G.ww - m) dx = G.ww - m - c[0]; if (c[1] < m) dy = m - c[1]; if (c[1] > G.wh - m) dy = G.wh - m - c[1];
  grp.x += dx; grp.y += dy;
}
// two groups meet when a piece of one is next to a piece of the other (in the print) and their angle agrees and the two touching pieces
// agree in place (measured at the contact, not at the corner of the print: a big group turned a few degrees off would otherwise never join)
const C9_NB = [[-1, 0], [1, 0], [0, -1], [0, 1]];
// the neighbouring group this one fits best, measured at the contact (see the note above c9TryJoin): for every piece of grp and every lattice
// neighbour of it in another group, the neighbour's place under grp's pose against its real place, and the same for the piece itself
function c9Contact(G, grp, tol, angTol) {
  let best = null;
  for (const a of grp.pcs) for (const [di, dj] of C9_NB) {
    const i = a.i + di, j = a.j + dj; if (i < 0 || j < 0 || i >= G.rows || j >= G.cols) continue;
    const b = G.pieces[i * G.cols + j], other = b.grp; if (other === grp || other.by) continue;
    const ox = other.tx !== undefined ? other.tx : other.x, oy = other.tx !== undefined ? other.ty : other.y, oa = other.tx !== undefined ? other.ta : other.a;   // where it is heading, when it is still gliding
    if (Math.abs(c9Wrap(grp.a - oa)) > angTol) continue;
    const op = { x: ox, y: oy, a: oa }, pb = c9Center(G, grp, b), qb = c9Center(G, op, b), pa = c9Center(G, grp, a), qa = c9Center(G, op, a);
    const err = Math.max(Math.hypot(pb[0] - qb[0], pb[1] - qb[1]), Math.hypot(pa[0] - qa[0], pa[1] - qa[1]));
    if (err <= tol && (!best || err < best.err)) best = { other, pair: [a, b], err };
  }
  return best;
}
function c9TryJoin(G, grp) {
  let joined = false; const net = !!G.net, tol = (net ? C9_POS_TOL_NET : C9_POS_TOL) * Math.min(G.cw, G.ch), angTol = net ? C9_ANG_TOL_NET : C9_ANG_TOL;
  for (let guard = 0; guard < 60; guard++) {
    const hit = c9Contact(G, grp, tol, angTol);
    if (!hit) break;
    // the bigger group keeps its pose, the smaller moves onto it
    const big = hit.other.pcs.length >= grp.pcs.length ? hit.other : grp, small = big === grp ? hit.other : grp;
    for (const p of small.pcs) { p.grp = big; big.pcs.push(p); }
    G.groups.splice(G.groups.indexOf(small), 1); const oi = G.order.indexOf(small); if (oi >= 0) G.order.splice(oi, 1); if (G.gm) G.gm.delete(small.id);
    hit.pair.forEach(p => { p.flash = 1; }); const c = c9Center(G, big, hit.pair[0]), c2 = c9Center(G, big, hit.pair[1]); G.flash.push({ x: (c[0] + c2[0]) / 2, y: (c[1] + c2[1]) / 2, t: 0, life: .5 });
    AU.pluck(92); joined = true; if (G.held === small) G.held = big; grp = big;
  }
  return joined;
}
function c9Drop(G, grp) {
  G.thold = null; c9TurnFlush(G);
  c9Clamp(G, grp); if (G.net) { c9TryJoin(G, grp); G.net.drop(grp); return null; } c9TryJoin(G, grp);
  if (G.groups.length === 1) { G.done = true; G.win = 0; G.held = null; return 'win'; }
  return null;
}
function c9Lift(G, grp, x, y) { G.thold = null; c9TurnFlush(G); G.held = grp; grp.z = ++G.zTop; const i = G.order.indexOf(grp); if (i >= 0) G.order.splice(i, 1); G.order.push(grp); G.hl = c9Rot(-grp.a, x - grp.x, y - grp.y); AU.tap(); if (G.net) G.net.lift(grp); }

// ---- pointer (sx, sy: canvas pixels below the notch; the world point is worked out here) ----
function c9PinchStart(G) {
  G.thold = null;
  const pts = [...G.tp.values()], a = pts[0], b = pts[1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  G.drag = null; G.pan = null; G.pinch = { d0: Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), z0: G.cam.z, wp: c9S2W(G, mx, my) };
}
function c9PinchMove(G) {
  const pts = [...G.tp.values()], a = pts[0], b = pts[1], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, z = c9Clip(G.pinch.z0 * d / G.pinch.d0, G.zmin, G.zmax);
  G.cam.z = z; G.cam.x = G.pinch.wp[0] - mx / z; G.cam.y = G.pinch.wp[1] - (my - G.top) / z; c9ClampCam(G);
}
// a finished shared print is looked at as the real jigsaw (every piece with its cut lines): fit above the result box; pan and zoom only
function c9FitPrint(G, W, H) {
  const aw = W - 24, ah = H - G.top - 190, z = c9Clip(Math.min(aw / G.bw, ah / G.bh), G.zmin, G.zmax), c = [(G.ww - G.bw) / 2 + G.bw / 2, (G.wh - G.bh) / 2 + G.bh / 2];
  G.cam.z = z; G.cam.x = c[0] - W / (2 * z); G.cam.y = c[1] - (ah / 2) / z; c9ClampCam(G);
}
function c9Down(G, sx, sy, e, done) {
  if (G.done && !G.net) return;
  G.touch = e.pointerType !== 'mouse'; G.psx = sx; G.psy = sy;
  if (G.touch) { G.tp.set(e.pointerId, { x: sx, y: sy }); if (G.tp.size >= 2) { c9PinchStart(G); return; } }
  if (G.pinch) return;
  const [wx, wy] = c9S2W(G, sx, sy), fin = r => { if (r === 'win') done('win'); };
  const view = false;   // a finished shared print can be moved freely like any group (owner, 2026-10-31)
  if (e.button === 2) { if (view) return; const h = G.held ? { grp: G.held } : c9Hit(G, wx, wy); if (h) c9TurnSmooth(G, h.grp, C9_STEP, wx, wy); return; }
  const tb = c9TurnBtns(G).find(b => Math.hypot(sx - b.x, sy - b.y) < b.r + 6); if (tb) { c9TurnSmooth(G, G.held, tb.dir * C9_STEP, null, null); G.thold = { id: e.pointerId, dir: tb.dir, t: 0 }; G.drag = null; return; }
  const hit = view ? null : c9Hit(G, wx, wy);
  if (!hit && !view && G.net && G.net.poke) { const hg = c9HitHeld(G, wx, wy); if (hg) { G.net.poke(hg); return; } }
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
  if (G.thold && G.thold.id === e.pointerId) { G.thold = null; return; }
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
  if (G.held && !ctrl) { const [wx, wy] = c9S2W(G, sx, sy); c9TurnSmooth(G, G.held, delta * .0009, wx, wy); return true; }
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
  G.fitted = false; G.groups = groups; G.order = groups.slice(); G.zTop = groups.length + 1; G.t = +st.t || 0;
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
  G.groups = groups; G.order = groups.slice(); G.gm = new Map(groups.map(g => [g.id, g])); G.held = null; G.drag = null; G.fitted = false; G.done = false; G.win = 0; G.flash = [];
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
