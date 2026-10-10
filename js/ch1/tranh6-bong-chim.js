/* Tranh 6 · Bắc Kim Thang, the opening (owner's idea, demo; the model is a Shadowmatic-like sculpture): a tangle of metal balls, rods and needles hung under the moon,
   with no shape that means anything. The player turns it any way with a finger or the mouse. The moon shines on it and its shadow falls in a pool of light on the ground.
   Turn it just right, for one moment, and the shadow of the whole tangle is a bird: the bird lifts out of its own shadow and flies up. Then the tranh begins.
   How it is built (a small 3D of its own, drawn with the canvas, no library):
   - in the moon's own frame (x, y across the light, z along it) the shadow of a thing is its (x, y). So the bird is cut into balls that fill it (circles packed into the
     bird, bcBuild: biggest first, each as large as fits), every ball is given its own depth z (a wavy field plus a jitter: the lumps stand out and sink in), and rods join
     neighbouring balls (a rod between two balls whose circles touch stays inside the union, others only if the whole rod stays inside the bird) and needles stand through
     some balls along z (their shadow is a dot). Everything lies inside the bird as seen along the light, so at the TARGET pose the shadow is the bird, and at any other pose
     the depths push the parts apart and it is a jumble.
   - W = the pose (3×3, tangle → world); a drag turns it about the screen's axes (with a little momentum). The view is straight from the front: parts are sorted far to near
     and drawn as shaded metal (ball = radial gradient, rod = three strokes).
   - the shadow is drawn as vectors (circles and thick lines with round caps) in the plane across the light, under the affine map that puts that plane on the ground: smooth.
   - the target is reached when W is within 4° of the target for a quarter of a second: the bird is drawn, rises out of the shadow and flies off; then the cb.
   Random every time: the pose it starts in and the depths, rods and needles are new each time. */
const BC = { open: false, tex: null, st: null };
const BC_W = 340, BC_H = 560, BC_CX = 170, BC_CY = 190, BC_S = 100, BC_GY = 400, BC_GS = 0.72, BC_H3 = 1.5, BC_GTOP = 305;   // canvas; the tangle's centre; px per unit; ground line, its squash, the tangle's height over it (units)
const BC_LW = (() => { const v = [.25, -.88, .4], n = Math.hypot(...v); return v.map(x => x / n); })();      // the way the moon's light travels (towards the viewer, down, right)
const BC_Q = (() => {                                                       // the moon's frame: e3 = the light's way, e1 ≈ screen right, e2 = e3 × e1  (columns, light frame → world)
  const L = BC_LW, d = L[0], e1 = [1 - d * L[0], -d * L[1], -d * L[2]], n = Math.hypot(...e1); e1[0] /= n; e1[1] /= n; e1[2] /= n;
  const e2 = [L[1] * e1[2] - L[2] * e1[1], L[2] * e1[0] - L[0] * e1[2], L[0] * e1[1] - L[1] * e1[0]];
  return [e1[0], e2[0], L[0], e1[1], e2[1], L[1], e1[2], e2[2], L[2]];
})();
const bcMul = (A, B) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return o; };
const bcT = A => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
const bcApp = (A, v) => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];
const bcRot = (ax, ay, az, a) => { const c = Math.cos(a), s = Math.sin(a), t = 1 - c; return [t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay, t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax, t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c]; };
// the bird is the same left and right, so turning the tangle half a way round the bird's upright axis (x → -x, z → -z) gives the very same shadow: that pose wins too
const BC_DY = [-1, 0, 0, 0, 1, 0, 0, 0, -1];
const bcAngleFromI = R => Math.abs(Math.acos(Math.max(-1, Math.min(1, (R[0] + R[4] + R[8] - 1) / 2))));
function bcNoise(seed) {                                                    // smooth value noise on a wrapping grid, 0..1
  const G = 64, v = new Float32Array(G * G); let a = seed >>> 0; for (let i = 0; i < v.length; i++) { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; v[i] = a / 4294967296; }
  return (x, y) => { x = ((x % G) + G) % G; y = ((y % G) + G) % G; const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    return (v[y0 * G + x0] * (1 - sx) + v[y0 * G + x1] * sx) * (1 - sy) + (v[y1 * G + x0] * (1 - sx) + v[y1 * G + x1] * sx) * sy; };
}
// the bird seen from above, in the moon's x, y (head up the picture, wings spread, a fanned tail); k scales it
function bcBirdPath(p, k) {
  // the right half as cubic curves from the beak round to the tail's notch (P0, then [c1, c2, end] for each), mirrored for the left: a swallow with swept wings and a forked tail
  const P0 = [0, -.8], seg = [[.05, -.8, .1, -.7, .1, -.58], [.1, -.5, .12, -.42, .13, -.34], [.35, -.52, .75, -.5, 1.05, -.2], [.9, -.08, .7, .0, .5, .02], [.35, .03, .22, .1, .14, .12], [.12, .25, .12, .4, .16, .55], [.18, .65, .2, .75, .22, .83], [.14, .7, .06, .6, 0, .54]];
  const pts = [P0]; for (const c of seg) pts.push([c[4], c[5]]);
  p.moveTo(P0[0] * k, P0[1] * k); for (const c of seg) p.bezierCurveTo(c[0] * k, c[1] * k, c[2] * k, c[3] * k, c[4] * k, c[5] * k);
  for (let n = seg.length - 1; n >= 0; n--) { const c = seg[n], e = pts[n]; p.bezierCurveTo(-c[2] * k, c[3] * k, -c[0] * k, c[1] * k, -e[0] * k, e[1] * k); }
  p.closePath();
}
// the pictures the shadow can be (the owner's two photos of a bird's shadow): the goose in flight and the crow with its wings spread; one is picked each time
const BC_MASKS = () => [BC_MASK, BC_MASK2];
const BC_TR = 1.3;                                                       // the shadow's picture covers x, y in -BC_TR…BC_TR
function bcMaskCanvas(M) {                                                        // the goose's silhouette (BC_MASK, 1 bit a pixel) as a canvas: black where the bird is
  const w = M.w, h = M.h, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), img = x.createImageData(w, h), bin = atob(M.b), rb = (w + 7) >> 3;
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if ((bin.charCodeAt(y * rb + (xx >> 3)) >> (7 - (xx & 7))) & 1) img.data[(y * w + xx) * 4 + 3] = 255;
  x.putImageData(img, 0, 0); return c;
}
// The tangle's surface: a smooth union of its balls and bent rods (each rod is a bent line, its distance the nearest of its pieces), stored as a signed-distance grid in the
// tangle's own space. Where parts meet they flow into one another (log-sum-exp blend), so it is one continuous body, not balls and sticks.
const BC_GE = 1.8, BC_GN = 128, BC_GH = 2 * BC_GE / (BC_GN - 1), BC_KS = .025;
function bcField(balls, rods) {
  const N = BC_GN, E = BC_GE, H = BC_GH, KS = BC_KS, M = .3, acc = new Float32Array(N * N * N);
  const lo = v => Math.max(0, Math.floor((v + E) / H)), hi = v => Math.min(N - 1, Math.ceil((v + E) / H));
  const each = (min, max, fn) => { for (let k = lo(min[2] - M); k <= hi(max[2] + M); k++) for (let j = lo(min[1] - M); j <= hi(max[1] + M); j++) for (let i = lo(min[0] - M); i <= hi(max[0] + M); i++) { const x = -E + i * H, y = -E + j * H, z = -E + k * H, d = fn(x, y, z); acc[(k * N + j) * N + i] += Math.exp(-d / KS); } };
  for (const b of balls) each([b.x - b.r, b.y - b.r, b.z - b.r], [b.x + b.r, b.y + b.r, b.z + b.r], (x, y, z) => Math.hypot(x - b.x, y - b.y, z - b.z) - b.r);
  for (const r of rods) {
    const P = r.pts, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const p of P) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], p[c] - r.r); mx[c] = Math.max(mx[c], p[c] + r.r); }
    each(mn, mx, (x, y, z) => { let d = 1e9; for (let n = 0; n < P.length - 1; n++) { const a = P[n], b = P[n + 1], bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], t = Math.max(0, Math.min(1, ((x - a[0]) * bx + (y - a[1]) * by + (z - a[2]) * bz) / (bx * bx + by * by + bz * bz + 1e-9))); d = Math.min(d, Math.hypot(x - a[0] - bx * t, y - a[1] - by * t, z - a[2] - bz * t)); } return d - r.r; });
  }
  const f = new Float32Array(N * N * N); for (let i = 0; i < f.length; i++) f[i] = acc[i] > 1e-12 ? Math.min(M, -KS * Math.log(acc[i])) : M;       // far from everything: at least the margin
  return f;
}
function bcBuild() {
  const seed = (Math.random() * 4294967295) >>> 0, rnd = (() => { let a = seed ^ 0x5bd1e995; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; })();
  const G = 320, R0 = BC_TR, cs = 2 * R0 / G;                           // a grid over x, y in -1.1…1.1
  const cv = document.createElement('canvas'); cv.width = cv.height = G; const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.setTransform(G / (2 * R0), 0, 0, G / (2 * R0), G / 2, G / 2); cx.imageSmoothingQuality = 'high'; { const mk = bcMaskCanvas(BC.mask), sc = 2.1 / Math.max(mk.width, mk.height); cx.drawImage(mk, -mk.width * sc / 2, -mk.height * sc / 2, mk.width * sc, mk.height * sc); }       // the goose, 2.1 units tall, in the middle
  const da = cx.getImageData(0, 0, G, G).data, inside = new Uint8Array(G * G); for (let i = 0; i < G * G; i++) inside[i] = da[i * 4 + 3] > 140 ? 1 : 0;
  const px = i => -R0 + (i % G + .5) * cs, py = i => -R0 + (Math.floor(i / G) + .5) * cs;
  const isIn = (x, y) => { const i = Math.floor((x + R0) / cs), j = Math.floor((y + R0) / cs); return i >= 0 && j >= 0 && i < G && j < G && inside[j * G + i] === 1; };
  // distance of each inside cell to the edge of the bird (two-pass chamfer), in units
  const chamfer = init => { const d = new Float32Array(G * G); for (let i = 0; i < G * G; i++) d[i] = init[i];
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const k = j * G + i; let v = d[k]; if (i > 0) v = Math.min(v, d[k - 1] + 1); if (j > 0) { v = Math.min(v, d[k - G] + 1); if (i > 0) v = Math.min(v, d[k - G - 1] + 1.41); if (i < G - 1) v = Math.min(v, d[k - G + 1] + 1.41); } d[k] = v; }
    for (let j = G - 1; j >= 0; j--) for (let i = G - 1; i >= 0; i--) { const k = j * G + i; let v = d[k]; if (i < G - 1) v = Math.min(v, d[k + 1] + 1); if (j < G - 1) { v = Math.min(v, d[k + G] + 1); if (i < G - 1) v = Math.min(v, d[k + G + 1] + 1.41); if (i > 0) v = Math.min(v, d[k + G - 1] + 1.41); } d[k] = v; } return d; };
  const dist = chamfer(Array.from(inside, v => v ? 1e9 : 0)), outd = chamfer(Array.from(inside, v => v ? 0 : 1e9));        // distance to the edge: inside cells / outside cells, in cells
  // the bird's signed distance (< 0 inside, in units), the same all the way along the light: the tangle is trimmed to this, so its shadow is the bird's outline exactly, smooth
  const trim = new Float32Array(G * G); for (let k = 0; k < G * G; k++) trim[k] = (inside[k] ? -dist[k] : outd[k]) * cs;
  // circles filling the bird: the widest uncovered place first
  const covered = new Uint8Array(G * G), balls = [];
  for (let n = 0; n < 420; n++) {
    let best = -1, bd = 0; for (let k = 0; k < G * G; k++) if (inside[k] && !covered[k] && dist[k] > bd) { bd = dist[k]; best = k; }
    const r = (bd - .5) * cs;                                                  // as large as fits inside (a half cell of slack for the pixels' edge)
    if (best < 0 || r < .006) break;
    const x = px(best), y = py(best), rr = Math.min(r + .05, .15); balls.push({ x, y, r: rr });
    const cI = Math.floor((x + R0) / cs), cJ = Math.floor((y + R0) / cs), rc = Math.ceil(rr / cs) + 1;
    for (let j = Math.max(0, cJ - rc); j <= Math.min(G - 1, cJ + rc); j++) for (let i = Math.max(0, cI - rc); i <= Math.min(G - 1, cI + rc); i++) { const k = j * G + i; if (inside[k] && Math.hypot(px(k) - x, py(k) - y) <= rr) covered[k] = 1; }
  }
  // depth: a wavy field plus a jitter, so the parts stand out and sink in
  const zn = bcNoise(seed ^ 0x27d4eb2f), zm = bcNoise(seed ^ 0x165667b1);
  for (const b of balls) { b.z = 2.0 * (.65 * zn(b.x * 1.1 + 6, b.y * 1.1 + 3) + .35 * zm(b.x * 2.3 + 2, b.y * 2.3 + 8) - .5) + (rnd() - .5) * .4; b.r -= .008; }
  // rods between neighbours, as long as the rod's shadow stays in the bird
  const rods = [], key = new Set(), bend = (A, B) => { const bump = (rnd() - .5) * .7, P = []; for (let n = 0; n <= 7; n++) { const u = n / 7; P.push([A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, A.z + (B.z - A.z) * u + bump * Math.sin(Math.PI * u)]); } return P; };
  const add = (a, b, r) => { const k = a < b ? a + '_' + b : b + '_' + a; if (key.has(k)) return false; key.add(k); rods.push({ pts: bend(balls[a], balls[b]), r }); return true; };
  balls.forEach((A, i) => {
    const near = balls.map((B, j) => ({ j, d: Math.hypot(A.x - B.x, A.y - B.y) })).filter(o => o.j !== i && o.d < A.r + balls[o.j].r + .3).sort((p, q) => p.d - q.d);
    let made = 0; for (const o of near) { if (made >= 4) break; const B = balls[o.j], rr = Math.max(.045, Math.min(.095, .7 * Math.min(A.r, B.r)));
      let ok = o.d <= A.r + B.r;
      if (!ok) { ok = true; for (let t = 0; t <= 12; t++) { const u = t / 12, x = A.x + (B.x - A.x) * u, y = A.y + (B.y - A.y) * u; if (!isIn(x + rr, y) || !isIn(x - rr, y) || !isIn(x, y + rr) || !isIn(x, y - rr)) { ok = false; break; } } }
      if (ok && add(i, o.j, rr)) made++; }
  });
  // long thin horns through some balls, along the light: their shadow is only a dot
  const pins = []; for (let n = 0; n < 7; n++) { const b = balls[Math.floor(rnd() * balls.length)], a = b.z - .25 - rnd() * .3, c = b.z + .25 + rnd() * .3; pins.push({ pts: [[b.x, b.y, a], [b.x, b.y, b.z], [b.x, b.y, c]], r: .028 + rnd() * .012 }); }
  const all = rods.concat(pins);
  return { balls, rods: all, sdf: bcField(balls, all), trim, tg: G };
}

(function () {
  const el = document.createElement('div'); el.id = 'bongchim'; el.hidden = true;
  el.innerHTML = '<canvas id="bongCv"></canvas><button id="bongX" aria-label="Đóng">✕</button><button id="bongS">Xem đáp án</button><button id="bongN">Hình khác</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#bongX'), XS = el.querySelector('#bongS'), XN = el.querySelector('#bongN');
  const L = BC_LW, kx = L[0] / L[1], kz = L[2] / L[1], e1 = [BC_Q[0], BC_Q[3], BC_Q[6]], e2 = [BC_Q[1], BC_Q[4], BC_Q[7]];
  let st = null, raf = 0, last = 0;
  const size = () => { const k = Math.min(innerWidth * .96 / BC_W, innerHeight * .94 / BC_H), d = Math.min(2, devicePixelRatio || 1); cv2.style.width = BC_W * k + 'px'; cv2.style.height = BC_H * k + 'px'; cv2.width = Math.round(BC_W * k * d); cv2.height = Math.round(BC_H * k * d); st && (st.k = k * d); };
  const stars = Array.from({ length: 46 }, (_, i) => [(i * 97 % 340) + .5, (i * 53 % 300) + .5, .6 + (i % 4) * .3]);
  const proj = w => [w[0] - kx * (w[1] + BC_H3), w[2] - kz * (w[1] + BC_H3)];       // a point of the tangle (relative to its centre) → where the moon's light puts it on the ground
  const gpos = p => [BC_CX + p[0] * BC_S, BC_GY + p[1] * BC_S * BC_GS];
  const dir = v => [v[0] - kx * v[1], v[2] - kz * v[1]];                              // the same for a direction
  // The body is ray-marched through the signed-distance grid: straight along the view for each pixel (the pose turns the rays into the tangle's own space), so it is one smooth
  // surface and what is nearer always hides what is behind. The shadow is the same grid marched along the moon's rays from each ground pixel; the closest approach gives soft edges.
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), img = x.createImageData(w, h); return { c, x, img, d: img.data, w, h }; };
  const ZR = .85, ZN0 = Math.round(320 * ZR), GW = BC_W, GHh = BC_H - BC_GTOP;
  const ZH = Math.round(320 * 1.8), zl = [mk(ZH, ZH), mk(ZN0, ZN0)], gl = [mk(GW * 2, GHh * 2), mk(Math.round(GW * .75), Math.round(GHh * .75))];       // [sharp, rough]: rough while the tangle is being turned, sharp once it rests
    const LT = [-L[0], -L[1], -L[2]];                                              // towards the moon
  const NN = BC_GN, EE = BC_GE, HH = BC_GH;
  function samp(f, x, y, z) {                                                    // the body's distance, trimmed to the bird's outline (a smooth max, the bird's picture is the same along the light)
    const d = samp3(f, x, y, z), T = BC.tex, G = T.tg, R = BC_TR, fx = (x + R) / (2 * R) * G - .5, fy = (y + R) / (2 * R) * G - .5; let t;
    if (fx < 0 || fy < 0 || fx > G - 1.001 || fy > G - 1.001) { const ox = Math.max(0, Math.abs(x) - R), oy = Math.max(0, Math.abs(y) - R); t = Math.hypot(ox, oy) + .05; }
    else { const i = fx | 0, j = fy | 0, tx = fx - i, ty = fy - j, o = j * G + i, q = T.trim; t = (q[o] * (1 - tx) + q[o + 1] * tx) * (1 - ty) + (q[o + G] * (1 - tx) + q[o + G + 1] * tx) * ty; }
    const h = Math.max(.05 - Math.abs(d - t), 0) / .05; return Math.max(d, t) + h * h * .0125;
  }
  function samp3(f, x, y, z) {                                                    // the distance at a point (trilinear); outside the grid: the distance to the box
    const fx = (x + EE) / HH, fy = (y + EE) / HH, fz = (z + EE) / HH;
    if (fx < 0 || fy < 0 || fz < 0 || fx > NN - 1.001 || fy > NN - 1.001 || fz > NN - 1.001) { const ox = Math.max(0, Math.abs(x) - EE + .06), oy = Math.max(0, Math.abs(y) - EE + .06), oz = Math.max(0, Math.abs(z) - EE + .06); return Math.max(.02, Math.hypot(ox, oy, oz)); }
    const i = fx | 0, j = fy | 0, k = fz | 0, tx = fx - i, ty = fy - j, tz = fz - k, o = (k * NN + j) * NN + i, a = NN, b = NN * NN;
    const c00 = f[o] * (1 - tx) + f[o + 1] * tx, c10 = f[o + a] * (1 - tx) + f[o + a + 1] * tx, c01 = f[o + b] * (1 - tx) + f[o + b + 1] * tx, c11 = f[o + a + b] * (1 - tx) + f[o + a + b + 1] * tx;
    return (c00 * (1 - ty) + c10 * ty) * (1 - tz) + (c01 * (1 - ty) + c11 * ty) * tz;
  }
  function shade(nx, ny, nz, o) {                                                // polished gold-silver metal: a bright sky over a dark ground in the mirror, the moon's glint, a cool edge light
    const rz = 2 * nz * nz - 1, ry = 2 * nz * ny, rx = 2 * nz * nx, e = Math.max(0, Math.min(1, ry * .5 + .5)), dif = Math.max(0, nx * LT[0] + ny * LT[1] + nz * LT[2]);
    const hz = Math.max(0, Math.min(1, (e - .36) / .28)), hs = hz * hz * (3 - 2 * hz), env = .02 + .28 * hs * (.5 + .5 * e) + .07 * dif, sp = Math.pow(Math.max(0, rx * LT[0] + ry * LT[1] + rz * LT[2]), 40), fr = Math.pow(1 - nz, 2.2);
    o[0] = Math.min(255, 150 * env + 255 * sp + 70 * fr); o[1] = Math.min(255, 165 * env + 255 * sp + 120 * fr); o[2] = Math.min(255, 200 * env + 255 * sp + 220 * fr);
  }
  // ---- the same drawing on the graphics card (WebGL2) when there is one: the distance grid is a 3D texture, each pixel ray-marches it, 4 sub-rays per pixel for smooth edges.
  // The CPU code below is the fallback (and gives the same picture). ----
  const GPU = (() => {
    try {
      const mkc = () => { const c = document.createElement('canvas'), gl = c.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: true }); return gl && gl.getExtension ? { c, gl } : null; };
      const A = mkc(), B = mkc(); if (!A || !B) return { ok: false };
      const VS = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      const COMMON = '#version 300 es\nprecision highp float;precision highp sampler3D;uniform sampler3D uF;uniform sampler2D uT;uniform vec3 uR0,uR1,uR2;out vec4 oc;\n' +
        'const float E=' + BC_GE.toFixed(3) + ',N=' + BC_GN.toFixed(1) + ',H=' + BC_GH.toFixed(6) + ',TR=' + BC_TR.toFixed(3) + ';\n' +
        'float samp3(vec3 p){vec3 q=(p+E)/H;vec3 o=max(abs(p)-E+.06,0.);if(any(lessThan(q,vec3(0.)))||any(greaterThan(q,vec3(N-1.001))))return max(.02,length(o));return texture(uF,(q+.5)/N).r;}\n' +
        'float samp(vec3 p){float d=samp3(p);vec2 uv=(p.xy+TR)/(2.*TR);vec2 o=max(abs(p.xy)-TR,0.);float t=texture(uT,clamp(uv,0.,1.)).r+length(o)+step(.0001,length(o))*.05;float h=max(.05-abs(d-t),0.)/.05;return max(d,t)+h*h*.0125;}\n';
      const BODY = COMMON + 'uniform vec3 uW0,uW1,uW2,uLT;uniform float uBS,uRes;\n' +
        'vec3 shade(vec3 n){float rz=2.*n.z*n.z-1.,ry=2.*n.z*n.y,rx=2.*n.z*n.x,e=clamp(ry*.5+.5,0.,1.),dif=max(0.,dot(n,uLT));float hz=clamp((e-.36)/.28,0.,1.),hs=hz*hz*(3.-2.*hz),env=.02+.28*hs*(.5+.5*e)+.07*dif,sp=pow(max(0.,dot(vec3(rx,ry,rz),uLT)),40.),fr=pow(1.-n.z,2.2);\n' +
        'return min(vec3(1.),vec3(150.*env+255.*sp+70.*fr,165.*env+255.*sp+120.*fr,200.*env+255.*sp+220.*fr)/255.);}\n' +
        'vec4 tr(vec2 XY){vec3 lo=vec3(dot(uR0.xy,XY),dot(uR1.xy,XY),dot(uR2.xy,XY));vec3 dl=vec3(uR0.z,uR1.z,uR2.z);float s=0.,md=9.,T0=2.3,px=1./uBS;bool hit=false;\n' +
        'for(int n=0;n<80;n++){float t=T0-s;float d=samp(lo+dl*t);md=min(md,d);if(d<.003){hit=true;break;}s+=max(.006,d*.85);if(s>2.*T0)break;}\n' +
        'if(hit){float t=T0-s;vec3 q=lo+dl*t;float e=.03;vec3 g=vec3(samp(q+vec3(e,0,0))-samp(q-vec3(e,0,0)),samp(q+vec3(0,e,0))-samp(q-vec3(0,e,0)),samp(q+vec3(0,0,e))-samp(q-vec3(0,0,e)));g/=max(length(g),1e-5);vec3 nw=vec3(dot(uW0,g),dot(uW1,g),dot(uW2,g));nw.z=max(0.,nw.z);return vec4(shade(nw),1.);}\n' +
        'if(md<px*1.2){float a=1.-md/(px*1.2);a*=a;return vec4(vec3(40.,48.,70.)/255.,1.)*a;}return vec4(0.);}\n' +
        'void main(){vec2 c=gl_FragCoord.xy-uRes*.5;vec4 acc=vec4(0.);vec2 of[4]=vec2[4](vec2(-.125,-.375),vec2(.375,-.125),vec2(.125,.375),vec2(-.375,.125));\n' +
        'if(dot(c,c)>2.6*uBS*uBS*1.2)discard;for(int i=0;i<4;i++){vec2 XY=(c+of[i])/uBS;if(dot(XY,XY)>2.6)continue;vec4 r=tr(XY);acc+=vec4(r.rgb*r.a,r.a);}\n' +
        'oc=acc/4.;}';
      const SHAD = COMMON + 'uniform vec3 uLd;uniform float uSc,uGW,uGH,uAA,uCX,uGY,uGTOP,uS,uGS,uH3;\n' +
        'void main(){float px=gl_FragCoord.x/uSc,py=uGH-gl_FragCoord.y/uSc;vec3 P=vec3((px-uCX)/uS,-uH3,(py+uGTOP-uGY)/(uS*uGS));vec3 lp=vec3(dot(uR0,P),dot(uR1,P),dot(uR2,P));float sc=-dot(lp,uLd);vec3 cp=lp+sc*uLd;if(dot(cp,cp)>2.9){oc=vec4(0.);return;}\n' +
        'float s=sc-2.,md=9.,en=sc+2.;for(int n=0;n<70;n++){if(s>=en)break;float d=samp(lp+uLd*s);md=min(md,d);if(d<-.004){md=-1.;break;}s+=max(.01,d*.85);}\n' +
        'float a=clamp(.5-md/uAA,0.,1.);oc=vec4(vec3(18.,24.,42.)/255.,1.)*(a*.94);}';
      const build = (X, fs) => {
        const gl = X.gl, mk = (t, src) => { const sh = gl.createShader(t); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(sh); return sh; };
        const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw gl.getProgramInfoLog(pr);
        const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        X.pr = pr; X.u = n => gl.getUniformLocation(pr, n); X.tex = gl.createTexture(); X.tex2 = gl.createTexture(); X.up = false;
      };
      build(A, BODY); build(B, SHAD);
      const half = v => { const f = new Float32Array(1), i = new Uint32Array(f.buffer); f[0] = v; const x = i[0], sg = (x >>> 16) & 0x8000, e = ((x >>> 23) & 0xff) - 127 + 15, m = x & 0x7fffff; if (e <= 0) return sg; if (e >= 31) return sg | 0x7bff; return sg | (e << 10) | (m >> 13); };
      const upload = (X, f) => { const gl = X.gl, h16 = new Uint16Array(f.length); for (let i = 0; i < f.length; i++) h16[i] = half(f[i]);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_3D, X.tex); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage3D(gl.TEXTURE_3D, 0, gl.R16F, BC_GN, BC_GN, BC_GN, 0, gl.RED, gl.HALF_FLOAT, h16);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); for (const w of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, w, gl.CLAMP_TO_EDGE); X.up = true; };
      const upload2 = (X, f, n) => { const gl = X.gl, h16 = new Uint16Array(f.length); for (let i = 0; i < f.length; i++) h16[i] = half(f[i]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, X.tex2); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, n, n, 0, gl.RED, gl.HALF_FLOAT, h16);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.activeTexture(gl.TEXTURE0); };
      return { ok: true, A, B, upload, upload2 };
    } catch (err) { return { ok: false }; }
  })();
  BC.gpu = GPU;
  function gpuPass(X, w, h, set) {                                               // render one full-screen pass into X's canvas
    const gl = X.gl; if (X.c.width !== w || X.c.height !== h) { X.c.width = w; X.c.height = h; }
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(X.pr); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_3D, X.tex); gl.uniform1i(X.u('uF'), 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, X.tex2); gl.uniform1i(X.u('uT'), 1); gl.activeTexture(gl.TEXTURE0); set(gl, X.u); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function gpuLump(h, W) {
    const X = GPU.A, k = st.k, n = Math.max(256, Math.min(1100, Math.round(320 * k)));
    if (!BC.tex.gup) { GPU.upload(GPU.A, BC.tex.sdf); GPU.upload2(GPU.A, BC.tex.trim, BC.tex.tg); BC.tex.gup = true; }
    if (st.gl1 !== st.ver || st.gn !== n) {
      st.gl1 = st.ver; st.gn = n; const Wt = bcT(W);
      gpuPass(X, n, n, (gl, u) => { gl.uniform3f(u('uR0'), Wt[0], Wt[1], Wt[2]); gl.uniform3f(u('uR1'), Wt[3], Wt[4], Wt[5]); gl.uniform3f(u('uR2'), Wt[6], Wt[7], Wt[8]); gl.uniform3f(u('uW0'), W[0], W[1], W[2]); gl.uniform3f(u('uW1'), W[3], W[4], W[5]); gl.uniform3f(u('uW2'), W[6], W[7], W[8]); gl.uniform3f(u('uLT'), LT[0], LT[1], LT[2]); gl.uniform1f(u('uBS'), BC_S * n / 320); gl.uniform1f(u('uRes'), n); });
    }
    h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(X.c, BC_CX - 160, BC_CY - 160, 320, 320);
  }
  function gpuShadow(h, W) {
    const X = GPU.B, k = st.k, w = Math.round(GW * k), hh = Math.round(GHh * k);
    if (!BC.tex.gupB) { GPU.upload(GPU.B, BC.tex.sdf); GPU.upload2(GPU.B, BC.tex.trim, BC.tex.tg); BC.tex.gupB = true; }
    if (st.gl2 !== st.ver || st.gm !== w) {
      st.gl2 = st.ver; st.gm = w; const Wt = bcT(W);
      gpuPass(X, w, hh, (gl, u) => { gl.uniform3f(u('uR0'), Wt[0], Wt[1], Wt[2]); gl.uniform3f(u('uR1'), Wt[3], Wt[4], Wt[5]); gl.uniform3f(u('uR2'), Wt[6], Wt[7], Wt[8]); gl.uniform3f(u('uLd'), -(Wt[0] * L[0] + Wt[1] * L[1] + Wt[2] * L[2]), -(Wt[3] * L[0] + Wt[4] * L[1] + Wt[5] * L[2]), -(Wt[6] * L[0] + Wt[7] * L[1] + Wt[8] * L[2]));
        gl.uniform1f(u('uSc'), k); gl.uniform1f(u('uGW'), GW); gl.uniform1f(u('uGH'), GHh); gl.uniform1f(u('uAA'), .022 / k); gl.uniform1f(u('uCX'), BC_CX); gl.uniform1f(u('uGY'), BC_GY); gl.uniform1f(u('uGTOP'), BC_GTOP); gl.uniform1f(u('uS'), BC_S); gl.uniform1f(u('uGS'), BC_GS); gl.uniform1f(u('uH3'), BC_H3); });
    }
    h.imageSmoothingEnabled = true; h.drawImage(X.c, 0, BC_GTOP, GW, GHh);
  }
  const TR = [0, 0, 0, 0, 0];                                                   // trace(): r, g, b, alpha (0..1), depth
  function trace(f, Wt, W, BS, X, Y, dl) {                                       // one ray along the view through the grid; fills TR (colour is not premultiplied)
    const lx = Wt[0] * X + Wt[1] * Y, ly = Wt[3] * X + Wt[4] * Y, lz = Wt[6] * X + Wt[7] * Y, T0 = 2.3, px = 1 / BS; let s = 0, md = 9, hit = false;
    for (let n = 0; n < 80; n++) {
      const t = T0 - s, d = samp(f, lx + dl[0] * t, ly + dl[1] * t, lz + dl[2] * t);
      if (d < md) md = d; if (d < .003) { hit = true; break; } s += Math.max(.006, d * .85); if (s > 2 * T0) break;
    }
    if (hit) {
      const t = T0 - s, qx = lx + dl[0] * t, qy = ly + dl[1] * t, qz = lz + dl[2] * t, e = .03;
      const gx = samp(f, qx + e, qy, qz) - samp(f, qx - e, qy, qz), gy = samp(f, qx, qy + e, qz) - samp(f, qx, qy - e, qz), gz = samp(f, qx, qy, qz + e) - samp(f, qx, qy, qz - e), gl = Math.hypot(gx, gy, gz) || 1;
      const nx = (W[0] * gx + W[1] * gy + W[2] * gz) / gl, ny = (W[3] * gx + W[4] * gy + W[5] * gz) / gl, nz = Math.max(0, (W[6] * gx + W[7] * gy + W[8] * gz) / gl);
      shade(nx, ny, nz, TR); TR[3] = 1; TR[4] = s; return true;
    }
    if (md < px * 1.2) { const a = 1 - md / (px * 1.2); TR[0] = 40; TR[1] = 48; TR[2] = 70; TR[3] = a * a; TR[4] = 99; return false; }     // a ray that only grazes it: a soft edge
    TR[3] = 0; TR[4] = 99; return false;
  }
  function lump(h, W, q) {
    if (GPU.ok) { try { gpuLump(h, W); return; } catch (err) { GPU.ok = false; } }
    const Ly = zl[q - 1], ZN = Ly.w;
    if (st.lv !== st.ver || st.lq !== q) {
      st.lv = st.ver; st.lq = q; const d = Ly.d; d.fill(0);
      const f = BC.tex.sdf, Wt = bcT(W), BS = BC_S * ZN / 320, c = ZN / 2, dl = [Wt[2], Wt[5], Wt[8]], dep = new Float32Array(ZN * ZN), ok = new Uint8Array(ZN * ZN);
      for (let y = 0; y < ZN; y++) for (let x = 0; x < ZN; x++) {
        const X = (x + .5 - c) / BS, Y = -(y + .5 - c) / BS, k = y * ZN + x; dep[k] = 99; if (X * X + Y * Y > 2.6) continue;
        trace(f, Wt, W, BS, X, Y, dl); const o = k * 4; d[o] = TR[0]; d[o + 1] = TR[1]; d[o + 2] = TR[2]; d[o + 3] = Math.round(255 * TR[3]); dep[k] = TR[4]; ok[k] = TR[3] >= 1 ? 1 : 0;
      }
      // the pixels on an edge (a neighbour that is hit and this not, or a jump in depth between them) are traced again at 4 points inside the pixel and averaged: smooth edges, not steps
      const edge = k => { const e = dep[k]; for (const m of [k - 1, k + 1, k - ZN, k + ZN]) { if (m < 0 || m >= ZN * ZN) continue; if (ok[m] !== ok[k] || Math.abs(dep[m] - e) > .06 && ok[m] && ok[k]) return true; } return false; };
      for (let y = 1; y < ZN - 1; y++) for (let x = 1; x < ZN - 1; x++) {
        const k = y * ZN + x; if (!edge(k)) continue; let r = 0, g = 0, b = 0, a = 0;
        for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
          const X = (x + (sx + .5) / 3 - c) / BS, Y = -(y + (sy + .5) / 3 - c) / BS; trace(f, Wt, W, BS, X, Y, dl); const w = TR[3]; r += TR[0] * w; g += TR[1] * w; b += TR[2] * w; a += w;
        }
        const o = k * 4; if (a > 0) { d[o] = r / a; d[o + 1] = g / a; d[o + 2] = b / a; } d[o + 3] = Math.round(255 * a / 9);
      }
      Ly.x.putImageData(Ly.img, 0, 0);
    }
    h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(Ly.c, BC_CX - 160, BC_CY - 160, 320, 320);
  }
  function ground(h, W, q) { const useGpu = GPU.ok;                                                    // the pool of moonlight, and the tangle's shadow in it
    const o = proj([0, 0, 0]), a = dir(e1), b = dir(e2);
    h.save(); h.beginPath(); h.rect(0, BC_GTOP, BC_W, BC_H - BC_GTOP); h.clip();
    const gr = h.createLinearGradient(0, BC_GTOP, 0, BC_H); gr.addColorStop(0, '#171f38'); gr.addColorStop(1, '#222c4a'); h.fillStyle = gr; h.fillRect(0, BC_GTOP, BC_W, BC_H - BC_GTOP);
    h.setTransform(st.k * BC_S * a[0], st.k * BC_S * BC_GS * a[1], st.k * BC_S * b[0], st.k * BC_S * BC_GS * b[1], st.k * (BC_CX + BC_S * o[0]), st.k * (BC_GY + BC_S * BC_GS * o[1]));
    const pool = h.createRadialGradient(0, 0, 0, 0, 0, 2.0); pool.addColorStop(0, '#dfe6f4'); pool.addColorStop(.7, '#b9c6de'); pool.addColorStop(1, 'rgba(160,178,210,0)'); h.fillStyle = pool; h.beginPath(); h.arc(0, 0, 2.0, 0, 6.283); h.fill();
    h.restore();
    if (useGpu) { try { gpuShadow(h, W); return; } catch (err) { GPU.ok = false; } }
    const Gy = gl[q - 1], gw = Gy.w, gh = Gy.h, gd = Gy.d;
    if (st.gv !== st.ver || st.gq !== q) {
    st.gv = st.ver; st.gq = q; gd.fill(0);
    const f = BC.tex.sdf, Wt = bcT(W), ld = [-(Wt[0] * L[0] + Wt[1] * L[1] + Wt[2] * L[2]), -(Wt[3] * L[0] + Wt[4] * L[1] + Wt[5] * L[2]), -(Wt[6] * L[0] + Wt[7] * L[1] + Wt[8] * L[2])], aa = .022 * GW / gw;
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const gx = ((x + .5) * GW / gw - BC_CX) / BC_S, gz = ((y + .5) * GHh / gh + BC_GTOP - BC_GY) / (BC_S * BC_GS), gy = -BC_H3;       // a ground point (relative to the tangle's centre) and the moon's ray from it
      const lx = Wt[0] * gx + Wt[1] * gy + Wt[2] * gz, ly = Wt[3] * gx + Wt[4] * gy + Wt[5] * gz, lz = Wt[6] * gx + Wt[7] * gy + Wt[8] * gz, sc = -(lx * ld[0] + ly * ld[1] + lz * ld[2]);
      const cx = lx + sc * ld[0], cy = ly + sc * ld[1], cz = lz + sc * ld[2]; if (cx * cx + cy * cy + cz * cz > 2.9) continue;      // the ray never gets near the tangle
      let s = sc - 2.0, md = 9; const end = sc + 2.0;
      for (let n = 0; n < 60 && s < end; n++) { const d = samp(f, lx + ld[0] * s, ly + ld[1] * s, lz + ld[2] * s); if (d < md) md = d; if (d < -.004) { md = -1; break; } s += Math.max(.01, d * .85); }
      const al = Math.max(0, Math.min(1, .5 - md / aa)); if (al <= 0) continue; const o = (y * gw + x) * 4; gd[o] = 18; gd[o + 1] = 24; gd[o + 2] = 42; gd[o + 3] = Math.round(240 * al);
    }
    Gy.x.putImageData(Gy.img, 0, 0);
    }
    h.imageSmoothingEnabled = true; h.drawImage(Gy.c, 0, BC_GTOP, GW, GHh);
  }
  function wing(h, x, y, s, flap, col) {                                      // a woodblock-ish bird seen from the side, wings flapping
    h.save(); h.translate(x, y); h.scale(s, s); h.lineJoin = 'round'; h.strokeStyle = '#1d1915'; h.lineWidth = 2.2;
    for (const w of [-1, 1]) { h.fillStyle = w < 0 ? '#c9a24a' : col; h.beginPath(); h.moveTo(-4, -2); h.quadraticCurveTo(-18, -34 * flap * w, -36, (-10 - 22 * flap) * (w < 0 ? .7 : 1)); h.quadraticCurveTo(-14, -6, 6, 4); h.closePath(); h.fill(); h.stroke(); }
    h.fillStyle = col; h.beginPath(); h.ellipse(0, 4, 20, 11, -.15, 0, 6.283); h.fill(); h.stroke();      // body
    h.beginPath(); h.arc(18, -4, 8, 0, 6.283); h.fill(); h.stroke();                                        // head
    h.fillStyle = '#e07a2f'; h.beginPath(); h.moveTo(25, -6); h.lineTo(36, -3); h.lineTo(25, -1); h.closePath(); h.fill(); h.stroke();   // beak
    h.fillStyle = '#1d1915'; h.beginPath(); h.arc(20, -6, 1.8, 0, 6.283); h.fill();
    h.fillStyle = '#c9a24a'; h.beginPath(); h.moveTo(-18, 6); h.lineTo(-40, 14); h.lineTo(-38, 2); h.closePath(); h.fill(); h.stroke();   // tail
    h.restore();
  }
  function draw() {
    if (!st) return; const k = st.k, h = g; h.setTransform(k, 0, 0, k, 0, 0);
    const sky = h.createLinearGradient(0, 0, 0, BC_GY); sky.addColorStop(0, '#0e1630'); sky.addColorStop(1, '#27345a'); h.fillStyle = sky; h.fillRect(0, 0, BC_W, BC_H);
    for (const [sx, sy, r] of stars) { h.globalAlpha = .5 + .5 * Math.sin(st.t * 1.5 + sx); h.fillStyle = '#e8ecff'; h.beginPath(); h.arc(sx, sy, r * .8, 0, 6.283); h.fill(); } h.globalAlpha = 1;
    const mx = 58, my = 58; const gm = h.createRadialGradient(mx, my, 4, mx, my, 70); gm.addColorStop(0, 'rgba(255,248,214,.55)'); gm.addColorStop(1, 'rgba(255,248,214,0)'); h.fillStyle = gm; h.fillRect(0, 0, 160, 160);
    h.fillStyle = '#fff3c4'; h.beginPath(); h.arc(mx, my, 24, 0, 6.283); h.fill(); h.strokeStyle = 'rgba(29,25,21,.5)'; h.lineWidth = 1.5; h.stroke();
    const q = st.drag || Math.abs(st.vel[0]) > .0006 || Math.abs(st.vel[1]) > .0006 ? 2 : 1; ground(h, st.W, q); h.setTransform(k, 0, 0, k, 0, 0);
    h.strokeStyle = 'rgba(232,236,255,.5)'; h.lineWidth = 1.2; h.beginPath(); h.moveTo(BC_CX, 0); h.lineTo(BC_CX, BC_CY - 110); h.stroke();      // the cord
    h.globalAlpha = st.done ? Math.max(0, 1 - st.dt / 2.2) : 1; lump(h, st.W, q); h.globalAlpha = 1;
    if (st.done) {                                                             // the bird: out of its shadow and away
      const T = st.dt, p = Math.min(1, T / 3.2), e = p * p * (3 - 2 * p), s0 = gpos(proj([0, 0, 0])), sx0 = s0[0], sy0 = s0[1];
      const bx = sx0 + (BC_W + 40 - sx0) * e * .95 + Math.sin(T * 3) * 6, by = sy0 - (sy0 + 40) * e - Math.sin(p * Math.PI) * 30, sc = .45 + 1.2 * Math.min(1, T / 1.6);
      h.globalAlpha = Math.min(1, T / .3); wing(h, bx, by, sc, .4 + .6 * Math.sin(T * 14), '#f2c640'); h.globalAlpha = 1;
    }
  }
  const pt = e => { const r = cv2.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * BC_W, (e.clientY - r.top) / r.height * BC_H]; };
  cv2.addEventListener('pointerdown', e => { if (!st || st.done) return; st.drag = pt(e); st.vel = [0, 0]; try { cv2.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  cv2.addEventListener('pointermove', e => {
    if (!st || !st.drag || st.done || st.solve) return; const [x, y] = pt(e), dx = x - st.drag[0], dy = y - st.drag[1]; st.drag = [x, y];
    turn(dx * .012, dy * .012); st.vel = [dx * .012, dy * .012];
  });
  const up = () => { if (st) st.drag = null; };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  function turn(ay, ax) {                                                    // a drag right turns the tangle about the up axis, a drag down about the right axis
    const m = Math.hypot(ay, ax); if (m < 1e-6) return; st.W = bcMul(bcRot(ax / m, ay / m, 0, m), st.W); st.ver++;
  }
  function loop(ts) {
    if (!BC.open) return; const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    if (st) {
      st.t += dt;
      if (!st.done) {
        if (!st.drag && (Math.abs(st.vel[0]) > .0006 || Math.abs(st.vel[1]) > .0006)) { turn(st.vel[0], st.vel[1]); st.vel[0] *= Math.pow(.04, dt); st.vel[1] *= Math.pow(.04, dt); }     // a little momentum
        const R = bcMul(bcT(BC_Q), st.W), ang = Math.acos(Math.min(1, Math.abs(R[8])));     // R[8]: how far the light axis is from the one it must lie along; the turn about it is free
        if (st.solve) { st.solve.t = Math.min(1, st.solve.t + dt / st.solve.dur); const e = st.solve.t * st.solve.t * (3 - 2 * st.solve.t), R0 = st.solve.R, an = st.solve.an; st.W = bcMul(BC_Q, bcMul(bcRot(st.solve.ax[0], st.solve.ax[1], st.solve.ax[2], an * e), st.solve.R)); st.ver++; if (st.solve.t >= 1) { const w = st.solve.winAfter; st.solve = null; if (w) win(); } }
        else if (ang < .21) { st.hold += dt; if (st.hold > .3) startSolve(.45, true); } else st.hold = 0;     // about 12 degrees, kept for a third of a second: then it clicks into place
      } else { st.dt += dt; if (st.dt > 4.2) finish(); }
      const t0 = performance.now(); draw(); BC.ms = performance.now() - t0;
    }
    raf = requestAnimationFrame(loop);
  }
  function win() {
    st.done = true; st.dt = 0; st.drag = null; st.ver++;         // it has settled exactly (the turn and the way up the player gave it are kept)
    AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => { AU.chirp && AU.chirp(); }, 700); setTimeout(() => AU.pluck(91), 1400);
  }
  function finish() { const cb = st && st.cb; BC.open = false; el.hidden = true; cancelAnimationFrame(raf); st = null; if (cb) cb(); }
  addEventListener('keydown', e => { if (!BC.open) return; e.stopPropagation(); e.preventDefault(); if (e.code === 'Escape') finish(); }, true);
  X.addEventListener('click', finish);
  XN.addEventListener('click', () => { const cb = st && st.cb; cancelAnimationFrame(raf); BC.open = false; st = null; el.hidden = true; bongOpen(cb); });          // (demo only) the next picture
  function startSolve(dur, winAfter, upright) {                                   // turn the tangle the shortest way to the right tilt (the way up it has, or the right way up when upright)
    if (!st || st.done || st.solve) return; const R = bcMul(bcT(BC_Q), st.W), sg = upright || R[8] >= 0 ? 1 : -1, u = [R[2], R[5], R[8]], t = [0, 0, sg];
    st.drag = null; st.vel = [0, 0];
    let ax = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], l = Math.hypot(...ax), an = Math.atan2(l, u[0] * t[0] + u[1] * t[1] + u[2] * t[2]);
    if (an < 1e-3) { if (winAfter) win(); return; }
    if (l < 1e-6) ax = [1, 0, 0], l = 1;
    st.solve = { t: 0, an, ax: ax.map(v => v / l), R, dur, winAfter };
  }
  XS.addEventListener('click', () => startSolve(2, false, true));                      // (demo only) turn the tangle slowly to the right pose, to show what to look for
  addEventListener('resize', () => BC.open && size());
  window.bongOpen = function (cb) {
    if (BC.open) return; BC.open = true; el.hidden = false;
    setTimeout(() => {                                                       // the tangle takes a moment to make: the panel is up first
      if (!BC.open) return; { const all = BC_MASKS(); let last = BC.mi; if (last === undefined) { try { last = +localStorage.getItem('dcc.bongmi'); } catch (err) { last = 0; } } if (!(last >= 0)) last = 0; const i = (last + 1) % all.length; BC.mi = i; BC.mask = all[i]; try { localStorage.setItem('dcc.bongmi', i); } catch (err) {} } BC.tex = bcBuild();
      // a pose well away from the target: turned by 1.3..2.7 radians about a random axis
      const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 2 - 1, n = Math.hypot(ax, ay, az) || 1, W0 = bcMul(bcRot(ax / n, ay / n, az / n, 1.3 + Math.random() * 1.4), BC_Q);
      st = { ver: 1, W: W0, k: 1, t: 0, drag: null, vel: [0, 0], hold: 0, done: false, dt: 0, cb }; BC.st = st; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
    }, 60);
  };
  if (window.__bongTest || /[?&]thu=cau/.test(location.search)) setTimeout(() => bongOpen(() => toast('Chim bay đi rồi! (thử)', 3)), 1800);
})();
