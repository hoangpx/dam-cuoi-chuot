/* Woodblock print engine: seeded noise, colour plates with misregistration, parts, paper. */
/* ---------- rng / noise ---------- */
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = mulberry(1986);
const rr = (a, b) => a + (b - a) * R();
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };

/* ink-starved speckle used to knock holes out of every printed plate */
const NOISE = (() => {
  const c = mk(256, 256), g = c.getContext('2d'), r = mulberry(7);
  g.fillStyle = '#000';
  for (let i = 0; i < 1500; i++) { g.globalAlpha = .25 + r() * .7; g.beginPath(); g.ellipse(r() * 256, r() * 256, .6 + r() * 2.2, .5 + r() * 1.4, r() * 3, 0, 6.283); g.fill(); }
  for (let i = 0; i < 70; i++) { g.globalAlpha = .12 + r() * .25; g.fillRect(r() * 256, r() * 256, 10 + r() * 50, .8 + r() * 1.2); }
  for (let i = 0; i < 14; i++) { g.globalAlpha = .08 + r() * .12; g.beginPath(); g.ellipse(r() * 256, r() * 256, 8 + r() * 20, 5 + r() * 12, r() * 3, 0, 6.283); g.fill(); }
  return c;
})();

/* ---------- colour plates: [colour, misregistration offset] ---------- */
const PL = {
  red: ['#a3332a', [2.2, -1.6]], green: ['#2f6a4c', [-1.8, 1.4]], lilac: ['#d9cfdb', [1.2, 1.8]],
  grey: ['#9d95b9', [1.2, 1.8]], yellow: ['#f2c640', [-1.2, -1]], white: ['#f2ecde', [.4, 1.2]],
  brown: ['#5b2f1f', [2.2, -1.6]], dark: ['#2a221d', [0, 0]], straw: ['#b57a22', [-1.2, -1]],
  paper: ['#e2b43c', [0, 0]], blue: ['#2f5f8f', [-1.4, 1.2]],
  catY: ['#f3dc96', [.4, 1.2]], catY2: ['#d9a94e', [-1.2, -1]], ltred: ['#d98a7c', [2.2, -1.6]],   // the cat (pale yellow) and the groom's face (owner)
  // added for chương IV's crowd: more robes and fur
  pink: ['#c0567a', [2, -1.4]], orange: ['#d97b2a', [-1.4, -1]], teal: ['#3f8a86', [-1.6, 1.2]], cream: ['#e8d8a8', [.6, 1]], tan: ['#a0703a', [1.6, -1.2]], ash: ['#b9b0a4', [1, 1.4]], rose: ['#e2b2a6', [1.2, -1]],
};

/* ---------- path helpers ---------- */
function smooth(pts, closed = true) {
  const p = new Path2D(), n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const m = mid(pts[n - 1], pts[0]); p.moveTo(m[0], m[1]);
    for (let i = 0; i < n; i++) { const a = pts[i], mm = mid(a, pts[(i + 1) % n]); p.quadraticCurveTo(a[0], a[1], mm[0], mm[1]); }
    p.closePath();
  } else {
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) { const mm = mid(pts[i], pts[i + 1]); p.quadraticCurveTo(pts[i][0], pts[i][1], mm[0], mm[1]); }
    p.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
  return p;
}
const circ = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, 6.283); return p; };
const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, 6.283); return p; };
const lines = segs => { const p = new Path2D(); for (const s of segs) { p.moveTo(s[0], s[1]); for (let i = 2; i < s.length; i += 2) p.lineTo(s[i], s[i + 1]); } return p; };
function tube(pts, w0, w1) {
  const L = [], Rr = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * i / (n - 1)) / 2, nx = -dy / d * w, ny = dx / d * w;
    L.push([pts[i][0] + nx, pts[i][1] + ny]); Rr.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return smooth([...L, ...Rr.reverse()]);
}

/* ---------- woodblock part: colour plates (offset, mottled) + key block (ink) ---------- */
function part(b, draw, keepKey) {
  const [x0, y0, x1, y1] = b, W = Math.ceil((x1 - x0) * RES), H = Math.ceil((y1 - y0) * RES);
  const out = mk(W, H), col = mk(W, H), key = mk(W, H), cg = col.getContext('2d'), kg = key.getContext('2d');
  const T = (g, dx = 0, dy = 0) => g.setTransform(RES, 0, 0, RES, (-x0 + dx) * RES, (-y0 + dy) * RES), late = [], early = [];
  T(kg); kg.strokeStyle = INK; kg.fillStyle = INK; kg.lineCap = 'round'; kg.lineJoin = 'round';
  const api = {
    fill(pl, path) { const [c, [dx, dy]] = PL[pl]; T(cg, dx, dy); cg.fillStyle = c; cg.fill(path); },
    band(pl, path, w) { const [c, [dx, dy]] = PL[pl]; T(cg, dx, dy); cg.strokeStyle = c; cg.lineWidth = w; cg.lineCap = cg.lineJoin = 'round'; cg.stroke(path); },
    key(path, w = 2.4) { kg.lineWidth = w; kg.stroke(path); kg.save(); kg.translate(.5, .35); kg.lineWidth = w * .5; kg.stroke(path); kg.restore(); },
    ink(path) { kg.fill(path); },
    fk(pl, path, w = 2.4) { api.fill(pl, path); api.key(path, w); },
    text(str, x, y, size, pl, font = '"Nom Na Tong", "Ma Shan Zheng", KaiTi, serif', layer = 'color', weight = '') {
      const g = layer === 'ink' ? kg : cg; if (g === cg) { const [c, [dx, dy]] = PL[pl]; T(cg, dx, dy); cg.fillStyle = c; }
      g.font = `${weight ? weight + ' ' : ''}${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, x, y);
      if (g === kg) g.fillStyle = INK;
    },
    // a solid fill under everything (unmottled), e.g. a speech bubble's paper
    underFill(path, col) { early.push(g => { g.fillStyle = col; g.fill(path); }); },
    // solid ink text, printed after the mottling so small words stay easy to read (speech bubbles; owner)
    solidText(str, x, y, size, font, weight = '') { late.push(g => { g.font = `${weight ? weight + ' ' : ''}${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText(str, x, y); }); },
  };
  draw(api);
  mottle(cg, W, H, .55); mottle(kg, W, H, .2);
  const og = out.getContext('2d'); if (early.length) { T(og); for (const f of early) f(og); og.setTransform(1, 0, 0, 1, 0, 0); } og.drawImage(col, 0, 0); og.drawImage(key, 0, 0);
  if (late.length) { T(og); for (const f of late) f(og); og.setTransform(1, 0, 0, 1, 0, 0); }
  col.width = col.height = 0; if (!keepKey) key.width = key.height = 0;
  return { c: out, k: keepKey ? key : null, x0, y0, w: x1 - x0, h: y1 - y0 };
}
function mottle(g, W, H, a) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = a;
  const ox = R() * 256, oy = R() * 256;
  g.translate(-ox, -oy); g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(ox, oy, W, H);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function dp(g, p, x, y, rot = 0, sx = 1, sy = 1) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (sx !== 1 || sy !== 1) g.scale(sx, sy);
  g.drawImage(p.c, p.x0, p.y0, p.w, p.h); g.restore();
}

/* ---------- paper: giấy dó quét điệp ---------- */
function makePaper(P) {
  const W = 1400, H = 1300, c = mk(W, H), g = c.getContext('2d'), r = mulberry(3);
  g.fillStyle = P.base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {                  // brush sweeps of the điệp coat
    const y = r() * H, x = r() * W - 200, len = 200 + r() * 700;
    g.globalAlpha = .05 + r() * .09; g.fillStyle = r() < .55 ? P.hi : P.lo;
    g.fillRect(x, y, len, .8 + r() * 2.6);
  }
  for (let i = 0; i < 5000; i++) { g.globalAlpha = .1 + r() * .25; g.fillStyle = r() < .5 ? P.s1 : P.s2; g.fillRect(r() * W, r() * H, 1 + r() * 1.8, .8 + r()); }
  for (let i = 0; i < 260; i++) {                  // dó fibres
    g.globalAlpha = .12 + r() * .15; g.strokeStyle = P.fib; g.lineWidth = .7;
    const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + rr(-8, 8), y + rr(-6, 6), x + rr(-18, 18), y + rr(-10, 10)); g.stroke();
  }
  // wrap seams horizontally so the scroll tiles
  const s = mk(W, H), sg = s.getContext('2d'); sg.drawImage(c, 0, 0);
  const f = 120, grad = g.createLinearGradient(W - f, 0, W, 0); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,1)');
  const m = mk(f, H), mg = m.getContext('2d'); mg.drawImage(s, 0, 0, f, H, 0, 0, f, H);
  mg.globalCompositeOperation = 'destination-in'; const g2 = mg.createLinearGradient(0, 0, f, 0); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)'); mg.fillStyle = g2; mg.fillRect(0, 0, f, H);
  g.globalAlpha = 1; g.drawImage(m, W - f, 0);
  s.width = s.height = m.width = m.height = 0;
  return c;
}
