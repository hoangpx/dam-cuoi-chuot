/* Chương IX · Ghép Tranh — the jigsaw engine (pieces, their shapes, pointer rules, drawing). The shell (album, saves, buttons) is
   in game.js. The pictures are the real Đông Hồ prints of chương III (img/ch3/…); each is cut into jigsaw pieces with tabs and
   blanks, scattered and (from the second tier) turned at random.
   POINTER RULES (owner: "chạm vào 1 mảnh là nhấc lên, chuột phải xoay; trên điện thoại vuốt lên vuốt xuống để xoay"):
     computer: press on a piece lifts it; drag, or just click and the piece follows the mouse until the next click; right click
               (or the wheel, or R) turns it a quarter, clockwise.
     phone:    touch a piece lifts it; drag it with a finger, or tap somewhere else to put it there; a quick flick up or down
               ON the piece turns it a quarter (down = clockwise, up = anticlockwise); a little ↻ button next to the lifted piece
               does the same.
   A piece dropped near its place with the right way up snaps in and stays. */

const C9_DRAG_PX = 7;          // a press that moves less than this is a click / tap
const C9_FLICK_MS = 260, C9_FLICK_PX = 26;   // a vertical flick this quick and long turns the piece

// a jigsaw edge from (x0,y0) to (x1,y1); (nx,ny) points out of the piece; e = +1 tab out, -1 tab in, 0 flat; jit = { c, s } of
// the shared edge; rev = the edge is walked against the canonical direction (so the tab sits at 1 - c)
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

function c9MakeGame(L, img, W, H, seedNum) {
  const R = c9Rng(seedNum * 7919 + 13), G = { hitCtx: document.createElement('canvas').getContext('2d'), L, img, cols: L.cols, rows: L.rows, rot: L.rot, pieces: [], held: null, drag: null, t: 0, done: false, win: 0, peek: 0, lw: 0, lh: 0, seed: seedNum, flash: [] };
  // the edges: H[i][j] between row i-1 and i, V[i][j] between col j-1 and j (+1: the tab belongs to the upper / left piece)
  const HE = [], VE = [], JH = [], JV = [];
  for (let i = 0; i <= G.rows; i++) { HE[i] = []; JH[i] = []; for (let j = 0; j < G.cols; j++) { HE[i][j] = R() < .5 ? 1 : -1; JH[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  for (let i = 0; i < G.rows; i++) { VE[i] = []; JV[i] = []; for (let j = 0; j <= G.cols; j++) { VE[i][j] = R() < .5 ? 1 : -1; JV[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  G.H = HE; G.V = VE; G.JH = JH; G.JV = JV;
  let id = 0;
  for (let i = 0; i < G.rows; i++) for (let j = 0; j < G.cols; j++) G.pieces.push({ id: id++, i, j, x: 0, y: 0, ux: 0, uy: 0, rot: 0, ang: 0, placed: false, z: 0, key: '', cv: null, path: null, lift: 0 });
  // random start: spread over the table, turned at random when the level asks for it
  G.pieces.forEach(p => { p.ux = R(); p.uy = R(); p.rot = G.rot ? Math.floor(R() * 4) : 0; p.ang = p.rot * Math.PI / 2; p.z = Math.floor(R() * 1000); });
  G.pieces.sort((a, b) => a.z - b.z).forEach((p, k) => { p.z = k; });
  c9Layout(G, W, H);
  // spread the loose pieces over the table in a shuffled grid with a little jitter, so few of them hide others
  const n = G.pieces.length; let nx = Math.max(1, Math.floor(G.tw / (G.cw * .95))), ny = Math.max(1, Math.floor(G.th / (G.ch * .95)));
  while (nx * ny < n) { nx++; ny++; }
  const slots = []; for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) slots.push([a, b]);
  for (let k = slots.length - 1; k > 0; k--) { const m = Math.floor(R() * (k + 1)); [slots[k], slots[m]] = [slots[m], slots[k]]; }
  G.pieces.forEach((p, k) => { const [a, b] = slots[k]; p.ux = Math.max(0, Math.min(1, (nx > 1 ? a / (nx - 1) : .5) + (R() - .5) * .5 / nx)); p.uy = Math.max(0, Math.min(1, (ny > 1 ? b / (ny - 1) : .5) + (R() - .5) * .5 / ny)); });
  c9Layout(G, W, H);
  return G;
}

// where the board and the table are; positions of loose pieces are kept as fractions of the table so a resize keeps them
function c9Layout(G, W, H) {
  const top = 56, aspect = G.img.naturalWidth / G.img.naturalHeight, wide = W > H * 1.15;
  let bx, by, bw, bh, tx, ty, tw, th;
  if (wide) { const aw = W * .52 - 24, ah = H - top - 20; bw = Math.min(aw, ah * aspect); bh = bw / aspect; bx = 16 + (aw - bw) / 2; by = top + (ah - bh) / 2; tx = W * .55; ty = top + 8; tw = W * .43; th = H - top - 28; }
  else { const aw = W - 24, ah = (H - top) * .5 - 10; bw = Math.min(aw, ah * aspect); bh = bw / aspect; bx = (W - bw) / 2; by = top + 4; tx = 8; ty = by + bh + 14; tw = W - 16; th = H - ty - 8; }
  const old = G.lw ? { bw: G.bw } : null;
  Object.assign(G, { bx, by, bw, bh, cw: bw / G.cols, ch: bh / G.rows, tx, ty, tw, th, lw: W, lh: H });
  G.t_ = .27 * Math.max(G.cw, G.ch);
  for (const p of G.pieces) {
    if (p.placed) { p.x = bx + (p.j + .5) * G.cw; p.y = by + (p.i + .5) * G.ch; }
    else if (!G.held || G.held !== p) { p.x = tx + G.cw * .5 + p.ux * Math.max(0, tw - G.cw); p.y = ty + G.ch * .5 + p.uy * Math.max(0, th - G.ch); }
    p.key = ''; p.cv = null;
  }
}

// one piece's own path in its local frame (origin = top-left of its cell rectangle)
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
// the picture cut to this piece, drawn once into its own canvas
function c9Bake(G, pc) {
  const key = Math.round(G.cw) + 'x' + Math.round(G.ch) + '@' + DPR; if (pc.key === key && pc.cv) return pc.cv;
  const t = G.t_, S = DPR, c = document.createElement('canvas'); c.width = Math.ceil((G.cw + 2 * t) * S); c.height = Math.ceil((G.ch + 2 * t) * S);
  const g = c.getContext('2d'); g.setTransform(S, 0, 0, S, t * S, t * S);
  pc.path = c9PiecePath(G, pc);
  g.save(); g.clip(pc.path);
  g.drawImage(G.img, 0, 0, G.img.naturalWidth, G.img.naturalHeight, -pc.j * G.cw, -pc.i * G.ch, G.bw, G.bh);
  g.restore();
  g.lineJoin = 'round'; g.lineWidth = 3.2; g.strokeStyle = 'rgba(255,250,235,.28)'; g.stroke(pc.path);   // a pale edge, like the cut of the cardboard
  g.lineWidth = 1.3; g.strokeStyle = 'rgba(35,22,10,.7)'; g.stroke(pc.path);
  pc.cv = c; pc.key = key; return c;
}

function c9Tick(G, dt) {
  if (!G.done) G.t += dt;
  for (const p of G.pieces) { const to = p.rot * Math.PI / 2, d = to - p.ang; p.ang = Math.abs(d) < .01 ? to : p.ang + d * Math.min(1, dt * 16); p.lift += ((G.held === p ? 1 : 0) - p.lift) * Math.min(1, dt * 14); }
  G.peek = Math.max(0, G.peek - dt);
  G.flash = G.flash.filter(f => (f.t += dt) < f.life);
  if (G.done) G.win += dt;
}

function c9Draw(G, g, W, H) {
  if (G.lw !== W || G.lh !== H) c9Layout(G, W, H);
  const { bx, by, bw, bh, cw, ch } = G;
  if (G.done) {   // the finished print, big, in the middle of the free space above the result box
    const aw = W - 28, ah = H - 56 - 190, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 60 + (ah - h) / 2;
    g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 7, y - 7, w + 14, h + 14); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); return;
  }
  // the board: a pale ghost of the picture and the faint cut lines, in a frame
  g.save(); g.fillStyle = 'rgba(255,250,235,.55)'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(bx - 5, by - 5, bw + 10, bh + 10); g.fill(); g.stroke(); g.restore();
  g.globalAlpha = G.done ? 1 : (G.peek > 0 ? .9 : .13); g.drawImage(G.img, bx, by, bw, bh); g.globalAlpha = 1;
  if (!G.done && G.peek <= 0) { g.strokeStyle = 'rgba(29,25,21,.16)'; g.lineWidth = 1; g.beginPath(); for (let j = 1; j < G.cols; j++) { g.moveTo(bx + j * cw, by); g.lineTo(bx + j * cw, by + bh); } for (let i = 1; i < G.rows; i++) { g.moveTo(bx, by + i * ch); g.lineTo(bx + bw, by + i * ch); } g.stroke(); }
  // the table
  if (!G.done) { g.fillStyle = 'rgba(120,90,50,.10)'; g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1.4; g.beginPath(); g.roundRect(G.tx, G.ty, G.tw, G.th, 12); g.fill(); g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]); }
  const list = G.pieces.slice().sort((a, b) => (a.placed === b.placed ? a.z - b.z : a.placed ? -1 : 1));
  if (!G.done) for (const p of list) c9DrawPiece(G, g, p);
  for (const f of G.flash) { const k = f.t / f.life; g.globalAlpha = 1 - k; g.strokeStyle = '#f2c640'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, Math.max(cw, ch) * (.4 + k * .6), 0, 6.283); g.stroke(); g.globalAlpha = 1; }
}
function c9DrawPiece(G, g, p) {
  const c = c9Bake(G, p), t = G.t_;
  g.save(); g.translate(p.x, p.y); g.rotate(p.ang);
  const sc = 1 + p.lift * .07;
  if (p.lift > .05) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14 * p.lift; g.shadowOffsetY = 6 * p.lift; }
  g.scale(sc, sc); g.drawImage(c, -G.cw / 2 - t, -G.ch / 2 - t, G.cw + 2 * t, G.ch + 2 * t);
  g.restore();
}
// the little turn button beside the lifted piece (for a finger)
function c9TurnBtn(G) { const p = G.held; if (!p || p.placed || !G.touch) return null; const r = 20, x = Math.min(G.lw - r - 6, Math.max(r + 6, p.x + G.cw * .62 + 14)), y = Math.max(r + 60, p.y - G.ch * .62 - 8); return { x, y, r }; }
function c9DrawTurnBtn(G, g) { const b = c9TurnBtn(G); if (!b) return; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.stroke(); g.lineWidth = 2.6; g.beginPath(); g.arc(b.x, b.y, 8, -2.4, 1.9); g.stroke(); g.fillStyle = '#1d1915'; g.beginPath(); g.moveTo(b.x + 5, b.y + 9); g.lineTo(b.x + 12, b.y + 3); g.lineTo(b.x + 2, b.y + 2); g.closePath(); g.fill(); }

function c9Hit(G, x, y) {
  const list = G.pieces.filter(p => !p.placed).sort((a, b) => b.z - a.z);
  for (const p of list) {
    const dx = x - p.x, dy = y - p.y, c = Math.cos(-p.ang), s = Math.sin(-p.ang), lx = dx * c - dy * s + G.cw / 2, ly = dx * s + dy * c + G.ch / 2;
    if (lx < -G.t_ || ly < -G.t_ || lx > G.cw + G.t_ || ly > G.ch + G.t_) continue;
    if (!p.path) p.path = c9PiecePath(G, p);
    if (G.hitCtx.isPointInPath(p.path, lx, ly)) return p;
  }
  return null;
}
const c9Up = p => ((p.rot % 4) + 4) % 4 === 0;
function c9Turn(G, p, dir) { if (!p || p.placed || !G.rot) return; p.rot += dir; AU.tap(); }
function c9Drop(G, p) {
  // snap into the right cell, the right way up
  const tx = G.bx + (p.j + .5) * G.cw, ty = G.by + (p.i + .5) * G.ch, near = Math.hypot(p.x - tx, p.y - ty) < Math.min(G.cw, G.ch) * .45;
  if (near && c9Up(p)) { p.x = tx; p.y = ty; p.placed = true; p.rot = 0; p.ang = 0; G.flash.push({ x: tx, y: ty, t: 0, life: .5 }); AU.pluck(92); if (G.pieces.every(q => q.placed)) { G.done = true; G.win = 0; return 'win'; } }
  else {
    // keep it on the screen; remember where, as a fraction of the table
    p.x = Math.max(G.cw * .3, Math.min(G.lw - G.cw * .3, p.x)); p.y = Math.max(G.ch * .3 + 52, Math.min(G.lh - G.ch * .3, p.y));
    p.ux = (p.x - G.tx - G.cw / 2) / Math.max(1, G.tw - G.cw); p.uy = (p.y - G.ty - G.ch / 2) / Math.max(1, G.th - G.ch);
  }
  return null;
}
function c9Lift(G, p) { G.held = p; p.z = Math.max(...G.pieces.map(q => q.z)) + 1; AU.tap(); }

// ---- pointer ----
function c9Down(G, x, y, e, done) {
  if (G.done) return;
  G.touch = e.pointerType !== 'mouse';
  if (e.button === 2) { const p = G.held || c9Hit(G, x, y); if (p) c9Turn(G, p, 1); return; }
  const tb = c9TurnBtn(G); if (tb && Math.hypot(x - tb.x, y - tb.y) < tb.r + 6) { c9Turn(G, G.held, 1); G.drag = null; return; }
  const hit = c9Hit(G, x, y);
  const lift = p => { if (G.held !== p) c9Lift(G, p); G.hold = [x - p.x, y - p.y]; G.drag = { id: e.pointerId, x0: x, y0: y, px: p.x, py: p.y, t0: performance.now(), moved: false }; };
  if (!G.touch) {   // mouse: a click lifts; the piece then follows the mouse until the next click puts it down
    if (G.held) { G.held.x = x - G.hold[0]; G.held.y = y - G.hold[1]; const r = c9Drop(G, G.held); G.held = null; G.drag = null; if (r === 'win') done('win'); return; }
    if (hit) lift(hit); return;
  }
  // finger: touching a piece lifts it (drag it, flick it, or tap elsewhere to put it there)
  if (hit) { lift(hit); return; }
  if (G.held) { G.held.x = x; G.held.y = y; const r = c9Drop(G, G.held); G.held = null; G.drag = null; if (r === 'win') done('win'); }
}
function c9Move(G, x, y, e) {
  G.hover = null;
  if (G.drag && G.held) {
    const d = G.drag; if (!d.moved && Math.hypot(x - d.x0, y - d.y0) > C9_DRAG_PX) d.moved = true;
    if (d.moved) { G.held.x = x - G.hold[0]; G.held.y = y - G.hold[1]; }
  } else if (G.held && e.pointerType === 'mouse') { G.held.x = x - G.hold[0]; G.held.y = y - G.hold[1]; }   // clicked up: it follows the mouse
  else if (e.pointerType === 'mouse') G.hover = c9Hit(G, x, y);
}
function c9PtrUp(G, x, y, e, done) {
  const d = G.drag; G.drag = null; if (!d || !G.held) return;
  const p = G.held, dt = performance.now() - d.t0, dy = y - d.y0, dx = x - d.x0;
  if (d.moved && G.rot && e.pointerType !== 'mouse' && dt < C9_FLICK_MS && Math.abs(dy) >= C9_FLICK_PX && Math.abs(dx) < Math.abs(dy) * .6) {   // a quick vertical flick: turn, do not move
    p.x = d.px; p.y = d.py; c9Turn(G, p, dy > 0 ? 1 : -1); return;
  }
  if (d.moved) { const r = c9Drop(G, p); G.held = null; if (r === 'win') done('win'); return; }   // dragged and let go: dropped
  // a click or tap: it stays lifted (a mouse carries it, a finger waits for a tap elsewhere)
  if (e.pointerType === 'mouse') { /* follows the mouse until the next click */ }
}
