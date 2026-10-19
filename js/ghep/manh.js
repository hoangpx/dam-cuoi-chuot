/* Chương IX · Ghép Tranh — the jigsaw engine. The pictures are the real Đông Hồ prints of chương III (img/ch3/…) cut into jigsaw
   pieces with tabs and blanks. There is NO board and no guide picture: the pieces lie on the table at any angle (0–360°), and the
   player joins them wherever they like. Pieces live in GROUPS: a group is a rigid piece of the finished print with one pose (where
   its lattice origin is on the screen and its angle); a loose piece is a group of one. Two groups join when, dropped, they touch
   (some piece of one is next to some piece of the other in the print) and their angle and position agree closely enough: the
   smaller one snaps onto the bigger, and the two pieces that met flash once. The print is done when everything is one group.
   Pieces look like thick cardboard: a stack of kraft-coloured copies of the outline under the printed face (no drop shadow: it made the pieces hard to see).
   POINTER RULES (owner, 2026-10-20):
     computer: press lifts a piece (its whole group); drag, or just click and it follows the mouse until the next click;
               the mouse WHEEL turns it round the pointer, any angle (right click or R: a step of 15°).
     phone:    touching lifts; drag it, or tap elsewhere to put it there; a quick vertical flick ON it turns it (the longer the flick the
               bigger the turn; down = clockwise); a little round arrow beside the lifted piece turns it 15°. */

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

function c9MakeGame(L, img, W, H, seedNum) {
  const R = c9Rng(seedNum * 7919 + 13), G = { hitCtx: document.createElement('canvas').getContext('2d'), L, img, cols: L.cols, rows: L.rows, pieces: [], groups: [], held: null, drag: null, hl: [0, 0], t: 0, done: false, win: 0, peek: 0, lw: 0, lh: 0, seed: seedNum, flash: [], zTop: 0 };
  const HE = [], VE = [], JH = [], JV = [];
  for (let i = 0; i <= G.rows; i++) { HE[i] = []; JH[i] = []; for (let j = 0; j < G.cols; j++) { HE[i][j] = R() < .5 ? 1 : -1; JH[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  for (let i = 0; i < G.rows; i++) { VE[i] = []; JV[i] = []; for (let j = 0; j <= G.cols; j++) { VE[i][j] = R() < .5 ? 1 : -1; JV[i][j] = { c: (R() - .5) * .1, s: (R() - .5) * .2 }; } }
  G.H = HE; G.V = VE; G.JH = JH; G.JV = JV;
  let id = 0;
  for (let i = 0; i < G.rows; i++) for (let j = 0; j < G.cols; j++) { const p = { id: id++, i, j, grp: null, key: '', cvTop: null, cvSide: null, path: null, flash: 0, _G: G }; G.pieces.push(p); const grp = { id: p.id, x: 0, y: 0, a: R() * 2 * Math.PI, pcs: [p], z: id, lift: 0, ux: R(), uy: R() }; G.groups.push(grp); p.grp = grp; }
  c9Layout(G, W, H, true);
  // spread the loose pieces over the table in a shuffled grid with a little jitter
  const n = G.groups.length, aw = W - G.cw, ah = H - 56 - G.ch; const nx = Math.max(1, Math.round(Math.sqrt(n * aw / Math.max(1, ah)))), ny = Math.max(1, Math.ceil(n / nx));
  const slots = []; for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) slots.push([a, b]);
  for (let k = slots.length - 1; k > 0; k--) { const m = Math.floor(R() * (k + 1)); [slots[k], slots[m]] = [slots[m], slots[k]]; }
  G.groups.forEach((g, k) => { const [a, b] = slots[k]; g.ux = Math.max(0, Math.min(1, (nx > 1 ? a / (nx - 1) : .5) + (R() - .5) * .5 / nx)); g.uy = Math.max(0, Math.min(1, (ny > 1 ? b / (ny - 1) : .5) + (R() - .5) * .5 / ny)); c9Place(G, g); });
  return G;
}
// the cell size: the finished print would fill about 75 % of the free area; a resize keeps the groups where they were, in proportion
function c9Layout(G, W, H, first) {
  const top = 56, aw = W - 20, ah = H - top - 16, asp = G.img.naturalWidth / G.img.naturalHeight, fit = .75;
  const bw = Math.min(aw * fit, ah * fit * asp), bh = bw / asp, old = { W: G.lw, H: G.lh };
  G.bw = bw; G.bh = bh; G.cw = bw / G.cols; G.ch = bh / G.rows; G.t_ = .27 * Math.max(G.cw, G.ch); G.depth = Math.max(3, Math.min(G.cw, G.ch) * .075);
  G.lw = W; G.lh = H; G.top = top;
  if (!first && old.W) for (const g of G.groups) { g.x *= W / old.W; g.y = top + (g.y - top) * (H - top) / Math.max(1, old.H - top); }
  for (const p of G.pieces) { p.key = ''; p.cvTop = null; p.cvSide = null; }
}
// a loose piece's place from its fractions (the centre of the piece)
function c9Place(G, g) {
  const cx = G.cw * .5 + g.ux * (G.lw - G.cw), cy = G.top + G.ch * .5 + g.uy * (G.lh - G.top - G.ch), o = c9Rot(g.a, (g.pcs[0].j + .5) * G.cw, (g.pcs[0].i + .5) * G.ch);
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
// the printed face and the cardboard silhouette of a piece, each drawn once into its own canvas
function c9Bake(G, pc) {
  const key = Math.round(G.cw) + 'x' + Math.round(G.ch) + '@' + DPR; if (pc.key === key && pc.cvTop) return;
  const t = G.t_, S = DPR, mk = () => { const c = document.createElement('canvas'); c.width = Math.ceil((G.cw + 2 * t) * S); c.height = Math.ceil((G.ch + 2 * t) * S); const g = c.getContext('2d'); g.setTransform(S, 0, 0, S, t * S, t * S); return [c, g]; };
  pc.path = c9PiecePath(G, pc);
  const [c1, g] = mk();
  g.save(); g.clip(pc.path);
  g.drawImage(G.img, 0, 0, G.img.naturalWidth, G.img.naturalHeight, -pc.j * G.cw, -pc.i * G.ch, G.bw, G.bh);
  g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(30,18,6,.20)'; g.stroke(pc.path);   // the face darkens a little towards the cut, like a bevel
  g.restore();
  g.lineJoin = 'round'; g.lineWidth = 1.6; g.strokeStyle = 'rgba(255,248,230,.55)'; g.stroke(pc.path);   // the pale edge of the printed paper
  g.lineWidth = .8; g.strokeStyle = 'rgba(40,26,12,.75)'; g.stroke(pc.path);
  const [c2, h] = mk();
  h.fillStyle = '#b8996a'; h.fill(pc.path); h.lineJoin = 'round'; h.lineWidth = 1.4; h.strokeStyle = '#6c5232'; h.stroke(pc.path);
  pc.cvTop = c1; pc.cvSide = c2; pc.key = key;
}

function c9Tick(G, dt) {
  if (!G.done) G.t += dt;
  for (const g of G.groups) g.lift += ((G.held === g ? 1 : 0) - g.lift) * Math.min(1, dt * 14);
  for (const p of G.pieces) if (p.flash > 0) p.flash = Math.max(0, p.flash - dt / .45);
  G.peek = Math.max(0, G.peek - dt);
  G.flash = G.flash.filter(f => (f.t += dt) < f.life);
  if (G.done) G.win += dt;
}

function c9Draw(G, g, W, H) {
  if (G.lw !== W || G.lh !== H) c9Layout(G, W, H);
  if (G.done) {   // the finished print, big, in the middle of the free space above the result box
    const aw = W - 28, ah = H - 56 - 190, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 60 + (ah - h) / 2;
    g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 7, y - 7, w + 14, h + 14); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); return;
  }
  for (const grp of G.groups.slice().sort((a, b) => a.z - b.z)) c9DrawGroup(G, g, grp);
  for (const f of G.flash) { const k = f.t / f.life; g.globalAlpha = 1 - k; g.strokeStyle = '#fff6c8'; g.lineWidth = 4; g.beginPath(); g.arc(f.x, f.y, Math.max(G.cw, G.ch) * (.3 + k * .5), 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  if (G.peek > 0) {   // the sample print, over everything (the eye button)
    const aw = W - 40, ah = H - 56 - 40, k = Math.min(aw / G.img.naturalWidth, ah / G.img.naturalHeight), w = G.img.naturalWidth * k, h = G.img.naturalHeight * k, x = (W - w) / 2, y = 56 + (H - 56 - h) / 2;
    g.globalAlpha = Math.min(1, G.peek * 4) * .96; g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.rect(x - 8, y - 8, w + 16, h + 16); g.fill(); g.stroke(); g.drawImage(G.img, x, y, w, h); g.globalAlpha = 1;
  }
}
// a group: its cardboard sides first (so they hide under the printed faces of its neighbours), then the faces
function c9DrawGroup(G, g, grp) {
  for (const p of grp.pcs) c9Bake(G, p);
  const lift = grp.lift, depth = G.depth * (1 + lift * .9), layers = Math.max(3, Math.ceil(depth / .9)), t = G.t_, sc = 1 + lift * .035;
  const dx = .62, dy = .92;   // the thickness shows on the lower right (the light comes from the upper left), in screen space
  const draw = (cv, c, ox, oy) => { g.save(); g.translate(c[0] + ox, c[1] + oy); g.rotate(grp.a); g.scale(sc, sc); g.drawImage(cv, -G.cw / 2 - t, -G.ch / 2 - t, G.cw + 2 * t, G.ch + 2 * t); g.restore(); };
  const cs = grp.pcs.map(p => c9Center(G, grp, p));
  for (let l = layers; l >= 1; l--) grp.pcs.forEach((p, k) => draw(p.cvSide, cs[k], dx * l * depth / layers * 1.4, dy * l * depth / layers * 1.4));
  grp.pcs.forEach((p, k) => {
    draw(p.cvTop, cs[k], 0, 0);
    if (p.flash > 0) { g.save(); g.globalAlpha = p.flash * .75; g.translate(cs[k][0], cs[k][1]); g.rotate(grp.a); g.scale(sc, sc); g.translate(-G.cw / 2, -G.ch / 2); g.fillStyle = '#fffbe0'; g.fill(p.path); g.restore(); }
  });
}

// the little turn button beside the lifted group (for a finger)
function c9TurnBtn(G) { const grp = G.held; if (!grp || !G.touch) return null; const c = c9Centroid(G, grp), r = 20; return { x: Math.min(G.lw - r - 6, Math.max(r + 6, c[0] + G.cw * .9 + 18)), y: Math.max(r + 62, Math.min(G.lh - r - 8, c[1] - G.ch * .9 - 10)), r }; }
function c9DrawTurnBtn(G, g) { const b = c9TurnBtn(G); if (!b) return; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.stroke(); g.lineWidth = 2.6; g.beginPath(); g.arc(b.x, b.y, 8, -2.4, 1.9); g.stroke(); g.fillStyle = '#1d1915'; g.beginPath(); g.moveTo(b.x + 5, b.y + 9); g.lineTo(b.x + 12, b.y + 3); g.lineTo(b.x + 2, b.y + 2); g.closePath(); g.fill(); }

// the piece (and so its group) under a point; the topmost group first
function c9Hit(G, x, y) {
  for (const grp of G.groups.slice().sort((a, b) => b.z - a.z)) for (const p of grp.pcs) {
    const c = c9Center(G, grp, p), d = c9Rot(-grp.a, x - c[0], y - c[1]), lx = d[0] + G.cw / 2, ly = d[1] + G.ch / 2;
    if (lx < -G.t_ || ly < -G.t_ || lx > G.cw + G.t_ || ly > G.ch + G.t_) continue;
    if (!p.path) p.path = c9PiecePath(G, p);
    if (G.hitCtx.isPointInPath(p.path, lx, ly)) return { grp, p };
  }
  return null;
}
// put the group so that the grabbed point (G.hl, in the group's frame) is under (x, y)
function c9Hold(G, grp, x, y) { const o = c9Rot(grp.a, G.hl[0], G.hl[1]); grp.x = x - o[0]; grp.y = y - o[1]; }
// turn a group by da radians round the point (x, y)
function c9Turn(G, grp, da, x, y) {
  const d = c9Rot(-grp.a, x - grp.x, y - grp.y); grp.a += da; const o = c9Rot(grp.a, d[0], d[1]); grp.x = x - o[0]; grp.y = y - o[1];
  if (G.held === grp) G.hl = d;
}
function c9Clamp(G, grp) {
  const c = c9Centroid(G, grp); let dx = 0, dy = 0; const m = Math.min(G.cw, G.ch) * .3;
  if (c[0] < m) dx = m - c[0]; if (c[0] > G.lw - m) dx = G.lw - m - c[0]; if (c[1] < G.top + m) dy = G.top + m - c[1]; if (c[1] > G.lh - m) dy = G.lh - m - c[1];
  grp.x += dx; grp.y += dy;
}
// two groups meet when a piece of one is next to a piece of the other (in the print) and their angle and place agree
function c9TryJoin(G, grp) {
  let joined = false;
  for (let guard = 0; guard < 40; guard++) {
    let hit = null;
    for (const other of G.groups) {
      if (other === grp) continue;
      if (Math.abs(c9Wrap(grp.a - other.a)) > C9_ANG_TOL) continue;
      if (Math.hypot(grp.x - other.x, grp.y - other.y) > C9_POS_TOL * Math.min(G.cw, G.ch)) continue;
      let pair = null; for (const a of grp.pcs) { for (const b of other.pcs) if (Math.abs(a.i - b.i) + Math.abs(a.j - b.j) === 1) { pair = [a, b]; break; } if (pair) break; }
      if (pair) { hit = { other, pair }; break; }
    }
    if (!hit) break;
    // the bigger group keeps its pose, the smaller moves onto it
    const big = hit.other.pcs.length >= grp.pcs.length ? hit.other : grp, small = big === grp ? hit.other : grp;
    for (const p of small.pcs) { p.grp = big; big.pcs.push(p); }
    G.groups.splice(G.groups.indexOf(small), 1);
    hit.pair.forEach(p => { p.flash = 1; }); const c = c9Center(G, big, hit.pair[0]), c2 = c9Center(G, big, hit.pair[1]); G.flash.push({ x: (c[0] + c2[0]) / 2, y: (c[1] + c2[1]) / 2, t: 0, life: .5 });
    AU.pluck(92); joined = true; if (G.held === small) G.held = big; grp = big;
  }
  return joined;
}
function c9Drop(G, grp) {
  c9Clamp(G, grp); c9TryJoin(G, grp);
  if (G.groups.length === 1) { G.done = true; G.win = 0; G.held = null; return 'win'; }
  return null;
}
function c9Lift(G, grp, x, y) { G.held = grp; grp.z = ++G.zTop + 1000; G.hl = c9Rot(-grp.a, x - grp.x, y - grp.y); AU.tap(); }

// ---- pointer ----
function c9Down(G, x, y, e, done) {
  if (G.done) return;
  G.touch = e.pointerType !== 'mouse';
  const fin = r => { if (r === 'win') done('win'); };
  if (e.button === 2) { const h = G.held ? { grp: G.held } : c9Hit(G, x, y); if (h) c9Turn(G, h.grp, C9_STEP, x, y); return; }
  const tb = c9TurnBtn(G); if (tb && Math.hypot(x - tb.x, y - tb.y) < tb.r + 6) { const c = c9Centroid(G, G.held); c9Turn(G, G.held, C9_STEP, c[0], c[1]); G.drag = null; return; }
  const hit = c9Hit(G, x, y);
  const lift = h => { if (G.held !== h.grp) c9Lift(G, h.grp, x, y); else G.hl = c9Rot(-h.grp.a, x - h.grp.x, y - h.grp.y); G.drag = { id: e.pointerId, x0: x, y0: y, gx: h.grp.x, gy: h.grp.y, ga: h.grp.a, t0: performance.now(), moved: false }; };
  if (!G.touch) {   // mouse: a click lifts; the group then follows the mouse until the next click puts it down
    if (G.held) { c9Hold(G, G.held, x, y); const g0 = G.held; G.held = null; G.drag = null; fin(c9Drop(G, g0)); return; }
    if (hit) lift(hit); return;
  }
  if (hit) { lift(hit); return; }   // finger: touching a piece lifts it (drag it, flick it, or tap elsewhere to put it there)
  if (G.held) { const c = c9Centroid(G, G.held); G.held.x += x - c[0]; G.held.y += y - c[1]; const g0 = G.held; G.held = null; G.drag = null; fin(c9Drop(G, g0)); }
}
function c9Move(G, x, y, e) {
  G.hover = null; G.px = x; G.py = y;
  if (G.drag && G.held) {
    const d = G.drag; if (!d.moved && Math.hypot(x - d.x0, y - d.y0) > C9_DRAG_PX) d.moved = true;
    if (d.moved) c9Hold(G, G.held, x, y);
  } else if (G.held && e.pointerType === 'mouse') c9Hold(G, G.held, x, y);   // clicked up: it follows the mouse
  else if (e.pointerType === 'mouse') { const h = c9Hit(G, x, y); G.hover = h ? h.grp : null; }
}
function c9PtrUp(G, x, y, e, done) {
  const d = G.drag; G.drag = null; if (!d || !G.held) return;
  const grp = G.held, dt = performance.now() - d.t0, dy = y - d.y0, dx = x - d.x0;
  if (d.moved && e.pointerType !== 'mouse' && dt < C9_FLICK_MS && Math.abs(dy) >= C9_FLICK_PX && Math.abs(dx) < Math.abs(dy) * .6) {   // a quick vertical flick: turn, do not move
    grp.x = d.gx; grp.y = d.gy; grp.a = d.ga; const c = c9Centroid(G, grp); c9Turn(G, grp, dy * .016, c[0], c[1]); return;   // about 1° for every 3.5 px
  }
  if (d.moved) { const g0 = grp; G.held = null; if (c9Drop(G, g0) === 'win') done('win'); return; }   // dragged and let go: dropped
  // a click or tap: it stays lifted (a mouse carries it, a finger waits for a tap elsewhere)
}
// the wheel turns the lifted group, or the one under the pointer, round the pointer
function c9Wheel(G, delta, x, y) { const grp = G.held || G.hover; if (!grp) return false; c9Turn(G, grp, delta * .0018, x, y); return true; }
