/* Chương XI · trees with volume (owner 2026-10-27: after the grass, "cây trang trí thì sao?"): the same light as the grass (from the
   top left). Trunks are round: a gradient from a lit left side to a deep right side, bark strokes, flared roots. A leafy crown is a
   heap of leaf clusters, each a shaded sphere covered in small leaves lit by where they face, top clusters sunnier, a pool of shade
   under the crown. Palms and bananas get shaded fronds and leaves, bamboo round culms. Same shape of data as c11Art's trees
   ({ sc, py, amp, trunk, crown } with part-like sprites), so the drawing and swaying code is unchanged. */
let C11TREES3 = null;
function c11Trees3() {
  if (C11TREES3) return C11TREES3;
  const R = Math.max(2, RES), rnd = mulberry(0x7733), LX = -.62, LY = -.78;
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${Math.max(0, Math.min(100, l))}%,${a})`;
  const edge = (g, p, a = .45, w = .7) => { g.strokeStyle = `rgba(24,20,16,${a})`; g.lineWidth = w; g.stroke(p); };
  const sphere = (g, x, y, r, hue, sat, l0, a = 1) => { const gr = g.createRadialGradient(x + LX * r * .4, y + LY * r * .4, r * .08, x, y, r); gr.addColorStop(0, hsl(hue, sat, l0 + 26, a)); gr.addColorStop(.6, hsl(hue, sat, l0, a)); gr.addColorStop(1, hsl(hue + 6, sat, l0 - 16, a)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); };
  /* a round trunk: lit on the left, dark on the right, flared roots, bark */
  const trunk = (g, h, w, lean = 0, hue = 26, sat = 34, lit = 46) => {
    const sh = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, hsl(hue + 4, sat - 6, lit + 6)); gr.addColorStop(.38, hsl(hue, sat, lit - 10)); gr.addColorStop(1, hsl(hue - 2, sat + 4, lit - 32)); return gr; };
    for (const sg of [-1, 1]) { const p = new Path2D(); p.moveTo(sg * w * .4, -h * .18); p.quadraticCurveTo(sg * w * 1.1, -2, sg * (w + 11), 2); p.lineTo(sg * w * .2, 2); p.closePath(); g.fillStyle = sh(-w - 11, w + 11); g.fill(p); edge(g, p, .3); }
    const p = new Path2D(); p.moveTo(-w, 0); p.bezierCurveTo(-w * .82, -h * .3, -w * .62 + lean * .6, -h * .7, -w * .52 + lean, -h); p.lineTo(w * .52 + lean, -h); p.bezierCurveTo(w * .62 + lean * .6, -h * .7, w * .82, -h * .3, w, 0); p.closePath();
    g.fillStyle = sh(-w, w); g.fill(p);
    g.save(); g.clip(p);
    for (let i = 0; i < 12; i++) { const x = -w + (i + .5) * w / 6, wv = (rnd() - .5) * 3; g.strokeStyle = `rgba(30,18,10,${.18 + rnd() * .2})`; g.lineWidth = .6 + rnd() * .8; g.beginPath(); g.moveTo(x, 2); g.bezierCurveTo(x + wv, -h * .35, x * .7 + lean * .5 - wv, -h * .65, x * .55 + lean, -h - 2); g.stroke(); }
    for (let i = 0; i < 10; i++) { const y = -rnd() * h, x = -w * .6 + rnd() * w * .5 + lean * (-y / h); g.fillStyle = 'rgba(255,236,200,.18)'; g.beginPath(); g.ellipse(x, y, 1.2, 3, 0, 0, 6.283); g.fill(); }
    g.restore(); edge(g, p);
    const ao = g.createRadialGradient(0, 2, 0, 0, 2, w + 14); ao.addColorStop(0, 'rgba(14,30,18,.45)'); ao.addColorStop(1, 'rgba(14,30,18,0)'); g.save(); g.scale(1, .3); g.fillStyle = ao; g.beginPath(); g.arc(0, 6, w + 14, 0, 6.283); g.fill(); g.restore();
  };
  const branch = (g, x0, y0, x1, y1, w0, w1, hue = 26) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, p = new Path2D();
    p.moveTo(x0 + nx * w0, y0 + ny * w0); p.quadraticCurveTo((x0 + x1) / 2 + nx * w0 * .8 + dy * .08, (y0 + y1) / 2 + ny * w0 * .8 - dx * .08, x1 + nx * w1, y1 + ny * w1); p.lineTo(x1 - nx * w1, y1 - ny * w1); p.quadraticCurveTo((x0 + x1) / 2 - nx * w0 * .8 + dy * .08, (y0 + y1) / 2 - ny * w0 * .8 - dx * .08, x0 - nx * w0, y0 - ny * w0); p.closePath();
    const gr = g.createLinearGradient(x0 + nx * w0 * (nx < 0 ? 1 : -1), y0, x0 - nx * w0 * (nx < 0 ? 1 : -1), y0); gr.addColorStop(0, hsl(hue + 4, 28, 50)); gr.addColorStop(1, hsl(hue, 38, 18)); g.fillStyle = gr; g.fill(p); edge(g, p, .4, .6);
  };
  /* one leaf cluster: a shaded sphere, then leaves lit by the way they face; top = how sunny (0 under the crown .. 1 on top) */
  const cluster = (g, x, y, r, hue, sat, top, o = {}) => {
    const l0 = (o.lift || 0) + 22 + top * 12;
    sphere(g, x, y, r, hue, sat, l0);
    const n = Math.round(r * r / 9 * (o.dens || 1));
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r * 1.06, lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .95, lit = (Math.cos(a) * LX + Math.sin(a) * LY) * (d / r);
      const l = l0 + lit * 20 + (rnd() - .5) * 8, len = (o.leaf || 4.6) * (.75 + rnd() * .5);
      g.fillStyle = hsl(hue + (rnd() - .5) * 14, sat + (rnd() - .5) * 10, l); g.beginPath(); g.ellipse(lx, ly, len, len * .42, a + 1.2 + (rnd() - .5) * 1.2, 0, 6.283); g.fill();
    }
    if (o.flowers) for (let i = 0; i < o.flowers; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * .9, lit = (Math.cos(a) * LX + Math.sin(a) * LY) * (d / r); o.flower(g, fx, fy, lit); }
  };
  /* a crown: shade pooled under it, a ring of clusters and a heap in the middle, drawn top first so the lower ones stand in front */
  const crown = (g, cx, cy, rx, ry, hue, sat, o = {}) => {
    const ao = g.createRadialGradient(cx, cy + ry * .4, 0, cx, cy + ry * .4, rx * 1.05); ao.addColorStop(0, 'rgba(14,34,22,.42)'); ao.addColorStop(1, 'rgba(14,34,22,0)'); g.save(); g.translate(cx, cy + ry * .4); g.scale(1, ry / rx); g.translate(-cx, -cy - ry * .4); g.fillStyle = ao; g.beginPath(); g.arc(cx, cy + ry * .4, rx * 1.05, 0, 6.283); g.fill(); g.restore();
    const mn = Math.min(rx, ry), cl = [], m = Math.max(7, Math.round((rx + ry) / (mn * .34)));
    for (let i = 0; i < m; i++) { const t = i / m * 6.283 + rnd() * .3; cl.push([cx + Math.cos(t) * rx * (.62 + rnd() * .12), cy + Math.sin(t) * ry * (.58 + rnd() * .1), mn * (.36 + rnd() * .1)]); }
    const n = Math.max(3, Math.round(rx * ry / 700));
    for (let i = 0; i < n; i++) { const t = i * 2.399, rr = Math.sqrt((i + .5) / n) * .42; cl.push([cx + Math.cos(t) * rx * rr, cy + Math.sin(t) * ry * rr - ry * .1, mn * (.44 + rnd() * .1)]); }
    cl.sort((a, b) => a[1] - b[1]);
    for (const [x, y, r] of cl) cluster(g, x, y, r, hue, sat, 1 - (y - (cy - ry)) / (2 * ry), o);
  };
  /* a pinnate frond: leaflets on both sides of a curved midrib, the upper side sunnier */
  const frond = (g, x0, y0, ang, len, droop, hue = 96) => {
    const ex = x0 + Math.cos(ang) * len, ey = y0 + Math.sin(ang) * len + droop, mx = x0 + Math.cos(ang) * len * .5, my = y0 + Math.sin(ang) * len * .5 - 10, q = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    for (const sd of [1, -1]) for (let j = 1; j < 18; j++) {
      const t = j / 18, px = q(x0, mx, ex, t), py = q(y0, my, ey, t), L = 17 * (1 - t * .55), dir = Math.atan2(q(y0, my, ey, t + .01) - py, q(x0, mx, ex, t + .01) - px), a = dir + sd * 1.05, tx = px + Math.cos(a) * L, ty = py + Math.sin(a) * L + L * .55;
      const up = Math.sin(a) < 0, p = new Path2D(); p.moveTo(px, py); p.quadraticCurveTo((px + tx) / 2 - Math.sin(a) * 1.8, (py + ty) / 2 + Math.cos(a) * 1.8, tx, ty); p.quadraticCurveTo((px + tx) / 2 + Math.sin(a) * 1.8, (py + ty) / 2 - Math.cos(a) * 1.8, px, py);
      const gr = g.createLinearGradient(px, py, tx, ty); gr.addColorStop(0, hsl(hue + 6, 45, up ? 30 : 20)); gr.addColorStop(1, hsl(hue - 12, 55, up ? 56 : 36)); g.fillStyle = gr; g.fill(p);
    }
    g.strokeStyle = hsl(62, 34, 52); g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
  };
  const T = (sc, py, amp, b1, tr, b2, cr) => ({ sc, py, amp, trunk: mk(b1, tr), crown: mk(b2, cr) });
  const fruit = (hue, sat, l, r) => (g, x, y, lit) => { g.strokeStyle = hsl(30, 40, 22); g.lineWidth = .8; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + 1, y - r - 4); g.stroke(); sphere(g, x, y, r, hue, sat, l + lit * 8); };
  const blossom = (hue, l) => (g, x, y, lit) => { for (let j = 0; j < 5; j++) { const a = j * 1.257; g.fillStyle = hsl(hue, 70, l + lit * 10 + (j === 0 ? 8 : 0)); g.beginPath(); g.arc(x + Math.cos(a) * 1.9, y + Math.sin(a) * 1.9, 1.7, 0, 6.283); g.fill(); } g.fillStyle = hsl(46, 90, 60); g.beginPath(); g.arc(x, y, .9, 0, 6.283); g.fill(); };
  /* the banyan (cây đa; owner 2026-10-27: "thân cao tán rộng", there is ONE in the village, at the đình where the festival crowd gathers):
     a tall twisted trunk on big roots, limbs spreading under a wide flat-topped canopy of scalloped leaf masses (dark outline, back rows
     deep green, front rows bright, lit clumps and leaf marks), pillar roots that came down from the limbs and took hold, and a curtain
     of brown aerial roots */
  const tubeAt = (g, P, w0, w1, col, edgeCol) => { const at = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
    for (const pass of [0, 1]) { g.fillStyle = pass ? col : edgeCol; for (let n = 0; n <= 70; n++) { const t = n / 70, q = at(t), w = w0 + (w1 - w0) * t + (pass ? -2.8 : 0); g.beginPath(); g.arc(q[0], q[1], Math.max(.5, w / 2), 0, 6.283); g.fill(); } } };
  const banyanTrunk = g => {
    const BR = (c, l) => hsl(22 + c, 52, l), OUTB = 'rgba(40,20,10,.9)', tube = (P, w0, w1, col) => tubeAt(g, P, w0, w1, col, OUTB);
    for (const sg of [-1, 1]) {
      const c = sg < 0 ? BR(4, 44) : BR(-2, 30);
      for (const x of [74, 140]) tube([[sg * (x - 2), -212], [sg * x, -140], [sg * (x + 5), -56], [sg * (x + 8), 6]], 7, 12, c);        // pillar roots
      tube([[sg * 26, -50], [sg * 48, -20], [sg * 74, -2], [sg * 104, 8]], 24, 6, c); tube([[sg * 14, -34], [sg * 28, -10], [sg * 50, 3], [sg * 70, 10]], 17, 5, c); tube([[sg * 5, -24], [sg * 10, -4], [sg * 20, 9], [sg * 36, 12]], 12, 3.4, c);
    }
    const body = new Path2D(); body.moveTo(-62, 8); body.bezierCurveTo(-44, -6, -37, -30, -33, -72); body.bezierCurveTo(-30, -112, -27, -142, -24, -172); body.lineTo(24, -172); body.bezierCurveTo(27, -142, 30, -112, 33, -72); body.bezierCurveTo(37, -30, 44, -6, 64, 8); body.closePath();
    const gr = g.createLinearGradient(-48, 0, 48, 0); gr.addColorStop(0, BR(6, 56)); gr.addColorStop(.42, BR(0, 40)); gr.addColorStop(1, BR(-2, 22)); g.fillStyle = gr; g.fill(body);
    g.save(); g.clip(body);
    for (let k = -7; k <= 7; k++) { const x = k * 8, tw = Math.sin(k * 1.7) * 18; g.strokeStyle = 'rgba(38,20,10,.42)'; g.lineWidth = 1.1 + (k & 1) * .8; g.beginPath(); g.moveTo(x * 1.4, 8); g.bezierCurveTo(x + tw, -60, x * .5 - tw, -120, x * .3 + 6, -176); g.stroke(); g.strokeStyle = 'rgba(255,214,160,.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x * 1.4 + 2.5, 8); g.bezierCurveTo(x + tw + 2.5, -60, x * .5 - tw + 2.5, -120, x * .3 + 8.5, -176); g.stroke(); }
    for (let k = 0; k < 26; k++) { g.fillStyle = 'rgba(255,230,190,.15)'; g.beginPath(); g.ellipse(-34 + rnd() * 38, -rnd() * 165, 1.4, 4, .1, 0, 6.283); g.fill(); }
    for (let k = 0; k < 5; k++) { const y = -30 - rnd() * 150, x = -30 + rnd() * 50; g.fillStyle = 'rgba(30,16,8,.5)'; g.beginPath(); g.ellipse(x, y, 3.4, 5.5, 0, 0, 6.283); g.fill(); }
    g.restore(); edge(g, body, .8, 2);
    for (const [P, w0, w1] of [[[[-12, -158], [-40, -184], [-92, -204], [-146, -214]], 18, 7], [[[12, -158], [40, -182], [92, -202], [144, -212]], 18, 7], [[[-6, -162], [-12, -196], [-14, -232], [-16, -262]], 14, 6], [[[6, -162], [12, -194], [16, -230], [18, -260]], 14, 6], [[[-14, -160], [-56, -192], [-84, -228], [-104, -262]], 14, 6], [[[14, -160], [54, -190], [82, -226], [102, -260]], 14, 6]]) tube(P, w0, w1, BR(0, 38));
  };
  const banyanCrown = g => {
    g.translate(0, -52);
    const GE = a => `rgba(14,38,18,${a})`;
    const lobes = (x, y, r) => { const c = [[x, y, r * .8]]; for (let i = 0; i < 11; i++) { const a = i / 11 * 6.283 + (x + y) * .01; c.push([x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .62, r * (.4 + .07 * Math.sin(i * 2.3 + x))]); } return c; };
    const mass = (x, y, r, l, hue) => {
      const c = lobes(x, y, r), gr = g.createRadialGradient(x - r * .38, y - r * .45, r * .1, x, y, r * 1.2);
      gr.addColorStop(0, hsl(hue + 10, 52, l + 21)); gr.addColorStop(.55, hsl(hue, 50, l + 5)); gr.addColorStop(1, hsl(hue - 8, 54, l - 6));
      g.strokeStyle = GE(.92); g.lineWidth = 2.8; for (const [a, b, rr] of c) { g.beginPath(); g.arc(a, b, rr, 0, 6.283); g.stroke(); }
      g.fillStyle = gr; for (const [a, b, rr] of c) { g.beginPath(); g.arc(a, b, rr, 0, 6.283); g.fill(); }
      for (let k = 0; k < 6; k++) { const px = x - r * .2 + (rnd() - .5) * r * 1.1, py = y - r * .22 - rnd() * r * .36, q = lobes(px, py, r * (.2 + rnd() * .1)); g.fillStyle = hsl(hue + 14, 54, l + 21 + rnd() * 8, .85); for (const [a, b, rr] of q) { g.beginPath(); g.arc(a, b, rr * .8, 0, 6.283); g.fill(); } }
      for (let k = 0; k < 18; k++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r * .8, lx = x + Math.cos(a) * d - r * .1, ly = y + Math.sin(a) * d * .8 - r * .08; g.fillStyle = hsl(hue + 22, 60, l + 35, .62); g.beginPath(); g.ellipse(lx, ly, 3.4, 1.6, a, 0, 6.283); g.fill(); g.fillStyle = GE(.35); g.beginPath(); g.arc(lx + 2, ly + 1.4, .9, 0, 6.283); g.fill(); }
    };
    const rows = [
      [[-50, -262, 38], [0, -280, 42], [52, -264, 38]],
      [[-116, -236, 42], [-62, -248, 44], [0, -252, 48], [64, -248, 44], [118, -237, 42]],
      [[-172, -206, 36], [-122, -214, 44], [-64, -220, 46], [0, -226, 44], [66, -220, 46], [124, -214, 44], [174, -205, 36]],
      [[-196, -178, 30], [-146, -184, 36], [-92, -190, 36], [-32, -194, 32], [34, -194, 32], [94, -190, 36], [148, -184, 36], [198, -177, 30]]];
    rows.forEach((row, ri) => row.forEach((m, k) => mass(m[0], m[1], m[2], 16 + ri * 7 + (k % 3), 108 + ((k * 7 + ri * 3) % 5) * 3)));
    const roots = []; for (let x = -196; x <= 196; x += 14) if (Math.abs(x) > 22) roots.push(x);
    roots.forEach((x, i) => { const h = Math.abs(Math.sin(i * 3.7 + 1)), y0 = -166 + Math.abs(x) * .04, y1 = 40 - h * 100 - (i % 3) * 14, sw = (rnd() - .5) * 8, w = 1.4 + rnd() * 1.5; const path = new Path2D(); path.moveTo(x, y0); path.bezierCurveTo(x + sw, y0 + (y1 - y0) * .35, x - sw, y0 + (y1 - y0) * .7, x + sw * .4, y1);
      g.lineCap = 'round'; g.strokeStyle = 'rgba(40,22,12,.85)'; g.lineWidth = w + 1.3; g.stroke(path); g.strokeStyle = hsl(24, 42, 30 + rnd() * 12); g.lineWidth = w; g.stroke(path); g.strokeStyle = 'rgba(255,210,160,.22)'; g.lineWidth = .6; g.save(); g.translate(-.5, 0); g.stroke(path); g.restore(); });
  };
  const trees = {
    xoai: T(.82, -74, .028, [-32, -120, 32, 8], g => { trunk(g, 86, 12); branch(g, 2, -70, -26, -112, 5, 2.5); branch(g, 3, -76, 30, -118, 4.5, 2.5); },
      [-104, -244, 104, -30], g => crown(g, 0, -146, 62, 66, 104, 46, { flowers: 2, flower: fruit(44, 85, 52, 4.2) })),
    da: T(.8, -230, .012, [-160, -300, 160, 14], g => banyanTrunk(g), [-222, -410, 222, -6], g => banyanCrown(g)),
    cau: T(.7, -150, .05, [-20, -172, 20, 8], g => {
      const h = 152, p = new Path2D(); p.moveTo(-5, 0); p.lineTo(5, 0); p.lineTo(3.6, -h); p.lineTo(-3.6, -h); p.closePath();
      const gr = g.createLinearGradient(-5, 0, 5, 0); gr.addColorStop(0, hsl(40, 10, 82)); gr.addColorStop(.4, hsl(40, 9, 62)); gr.addColorStop(1, hsl(36, 12, 30)); g.fillStyle = gr; g.fill(p);
      for (let y = 8; y < h; y += 8) { g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = .7; g.beginPath(); g.moveTo(-4.6 + y * .007, -y); g.lineTo(4.6 - y * .007, -y); g.stroke(); } edge(g, p);
      const sh = g.createLinearGradient(-4, 0, 4, 0); sh.addColorStop(0, hsl(95, 45, 52)); sh.addColorStop(1, hsl(100, 50, 22)); g.fillStyle = sh; g.fillRect(-4, -h, 8, 24);
    }, [-94, -254, 94, -86], g => { for (const [ang, len, dr] of [[-2.55, 66, 12], [-.6, 66, 12], [-3.0, 62, 22], [-.15, 62, 22], [-2.05, 58, 4], [-1.1, 58, 4], [-1.57, 48, 0]]) frond(g, 0, -150, ang, len, dr, 98); for (const [x, y] of [[-5, -142], [5, -143], [0, -137], [-2, -146], [3, -139]]) sphere(g, x, y, 3, 26, 80, 44); }),
    dao: T(.78, -70, .034, [-36, -104, 36, 8], g => { trunk(g, 40, 11, 0, 22, 30, 40); branch(g, 2, -36, 28, -92, 6, 2.5, 22); branch(g, -2, -36, -24, -88, 6, 2.5, 22); branch(g, 6, -60, -6, -98, 3, 1.6, 22); },
      [-104, -204, 104, -30], g => crown(g, 0, -120, 82, 52, 340, 55, { lift: 26, dens: .9, leaf: 3.8, flowers: 10, flower: blossom(345, 82) })),
    phuong: T(.74, -66, .03, [-36, -112, 36, 8], g => { trunk(g, 46, 12); branch(g, 2, -42, 30, -100, 6, 2.5); branch(g, -2, -42, -30, -96, 6, 2.5); },
      [-144, -194, 144, -30], g => crown(g, 0, -120, 100, 42, 100, 46, { leaf: 4, flowers: 14, flower: (g2, x, y, lit) => { if (y > -110) return; sphere(g2, x, y, 3.4, 8, 85, 44 + lit * 8); } })),
    dua: T(.62, -140, .05, [-22, -162, 26, 8], g => {
      const p = new Path2D(); p.moveTo(-7, 0); p.quadraticCurveTo(-2, -70, 6, -142); p.lineTo(14, -142); p.quadraticCurveTo(8, -70, 7, 0); p.closePath();
      const gr = g.createLinearGradient(-7, 0, 9, 0); gr.addColorStop(0, hsl(34, 30, 70)); gr.addColorStop(.45, hsl(32, 32, 50)); gr.addColorStop(1, hsl(28, 36, 24)); g.fillStyle = gr; g.fill(p);
      g.save(); g.clip(p); for (let y = 6; y < 142; y += 6) { const xo = y * .05; g.strokeStyle = 'rgba(50,30,16,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-8 + xo, -y); g.quadraticCurveTo(2 + xo, -y + 2, 15 + xo, -y); g.stroke(); } g.restore(); edge(g, p);
    }, [-114, -244, 114, -86], g => { for (const [ang, len, dr] of [[-2.65, 86, 16], [-.5, 86, 16], [-3.05, 80, 30], [-.1, 80, 30], [-2.15, 76, 6], [-1.0, 76, 6], [-1.57, 62, 0]]) frond(g, 10, -142, ang, len, dr, 92); for (const [x, y] of [[4, -134], [16, -135], [10, -129]]) sphere(g, x, y, 4.6, 70, 40, 34); }),
    willow: T(.62, -76, .05, [-32, -120, 32, 8], g => trunk(g, 84, 14),
      [-94, -214, 94, -6], g => { crown(g, 0, -122, 66, 34, 96, 44, { leaf: 3.6 }); for (let i = -10; i <= 10; i++) { const x = i * 6.5, d = (i % 2 ? 1 : -1) * 4, y1 = -30 - (i % 3) * 7 - rnd() * 8; for (let y = -100; y < y1; y += 4) { const t = (y + 100) / (y1 + 100), lx = x + d * t * 1.4, lit = i < 0 ? 8 : -2; g.fillStyle = hsl(92 + rnd() * 10, 48, 34 + lit - t * 8 + rnd() * 8); g.beginPath(); g.ellipse(lx, y, 1.6, 3.6, (i % 2 ? .4 : -.4), 0, 6.283); g.fill(); } } }),
    banana: T(.62, -86, .05, [-22, -102, 22, 8], g => {
      const p = new Path2D(); p.moveTo(-9, 0); p.lineTo(9, 0); p.lineTo(6, -88); p.lineTo(-6, -88); p.closePath();
      const gr = g.createLinearGradient(-9, 0, 9, 0); gr.addColorStop(0, hsl(88, 40, 62)); gr.addColorStop(.4, hsl(92, 42, 42)); gr.addColorStop(1, hsl(98, 46, 20)); g.fillStyle = gr; g.fill(p);
      for (const y of [-20, -44, -66]) { g.strokeStyle = 'rgba(40,60,20,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-8, y); g.quadraticCurveTo(0, y - 3, 7, y); g.stroke(); } edge(g, p);
    }, [-94, -194, 94, -46], g => {
      const leaf = (ang, len, wid) => { const x0 = 0, y0 = -88, c = Math.cos(ang), s = Math.sin(ang), ex = x0 + c * len, ey = y0 + s * len + len * .18, mx = x0 + c * len * .5, my = y0 + s * len * .5 - 6;
        for (const sd of [1, -1]) { const p = new Path2D(); p.moveTo(x0, y0); p.quadraticCurveTo(mx - s * wid * sd, my + c * wid * sd, ex, ey); p.quadraticCurveTo(mx, my, x0, y0); const up = sd * c < 0 || s * sd > 0; const gr = g.createLinearGradient(mx, my, mx - s * wid * sd, my + c * wid * sd); gr.addColorStop(0, hsl(95, 50, up ? 44 : 30)); gr.addColorStop(1, hsl(85, 55, up ? 60 : 38)); g.fillStyle = gr; g.fill(p); edge(g, p, .3, .5);
          for (let j = 1; j < 8; j++) { const t = j / 8, bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * ex, by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * ey; g.strokeStyle = 'rgba(30,50,20,.3)'; g.lineWidth = .5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - s * wid * sd * .8 * (1 - t * .6), by + c * wid * sd * .8 * (1 - t * .6)); g.stroke(); } }
        g.strokeStyle = hsl(70, 40, 70); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, ex, ey); g.stroke(); };
      for (const [a, l, w] of [[-2.95, 74, 20], [-.2, 74, 20], [-2.35, 82, 22], [-.8, 82, 22], [-2.0, 68, 18], [-1.15, 68, 18], [-1.57, 70, 16]]) leaf(a, l, w);
      for (let i = 0; i < 6; i++) { const x = 9 + (i % 3) * 4, y = -84 + Math.floor(i / 3) * 7; g.fillStyle = hsl(62, 60, 48); g.beginPath(); g.ellipse(x, y, 2.2, 6, .4, 0, 6.283); g.fill(); }
      sphere(g, 14, -64, 5, 320, 45, 30);
    }),
  };
  const bush = mk([-58, -66, 58, 8], g => crown(g, 0, -28, 46, 26, 106, 44, { leaf: 3.6, flowers: 6, flower: fruit(2, 75, 42, 2.4) }));
  const bamboo = [220, 270, 190].map(h => mk([-58, -h - 42, 58, 8], g => {
    const p = new Path2D(); p.rect(-4.4, -h, 8.8, h); const gr = g.createLinearGradient(-4.4, 0, 4.4, 0); gr.addColorStop(0, hsl(84, 45, 62)); gr.addColorStop(.4, hsl(90, 46, 42)); gr.addColorStop(1, hsl(100, 50, 20)); g.fillStyle = gr; g.fill(p); edge(g, p, .4, .6);
    for (let y = 22; y < h; y += 24) { g.fillStyle = 'rgba(30,60,20,.55)'; g.fillRect(-4.6, -y - 1, 9.2, 2); g.fillStyle = 'rgba(230,240,180,.4)'; g.fillRect(-4.2, -y - 2.6, 8.4, 1); }
    const bl = (x, y, ang, len) => { const c = Math.cos(ang), s = Math.sin(ang), w = len * .15, tx = x + c * len, ty = y + s * len, p2 = new Path2D(); p2.moveTo(x, y); p2.quadraticCurveTo(x + c * len * .4 - s * w, y + s * len * .4 + c * w, tx, ty); p2.quadraticCurveTo(x + c * len * .4 + s * w, y + s * len * .4 - c * w, x, y); const g2 = g.createLinearGradient(x - s * w, y + c * w, x + s * w, y - c * w); g2.addColorStop(0, hsl(96, 46, 26)); g2.addColorStop(1, hsl(84, 55, 54)); g.fillStyle = g2; g.fill(p2); };
    for (let y = 58; y < h + 4; y += 13) {
      const sg = (y / 13 | 0) % 2 ? 1 : -1, up = y / h, reach = 10 + up * 22 + rnd() * 10, tx = sg * reach, ty = -y - 6 - up * 6 - rnd() * 6;
      g.strokeStyle = hsl(88, 40, 40); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -y); g.quadraticCurveTo(sg * reach * .55, -y - 4, tx, ty); g.stroke();
      const nl = 5 + Math.round(up * 2), base = sg > 0 ? .15 : Math.PI - .15;
      for (let j = 0; j < nl; j++) bl(tx - sg * j / nl * 6, ty + j / nl * 2, base + sg * (j / (nl - 1)) * 1.4 - sg * .45 + (rnd() - .5) * .3, 22 + rnd() * 8 + up * 4);
    }
    for (let j = 0; j < 9; j++) bl(0, -h + Math.abs(j - 4) * 1.5, -1.57 + (j - 4) * .38 + (j < 4 ? -1 : j > 4 ? 1 : 0) * Math.abs(j - 4) * .12, 24 + rnd() * 6);
  }));
  return (C11TREES3 = { trees, bush, bamboo });
}
