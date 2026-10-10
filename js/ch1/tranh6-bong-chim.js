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
const BC_LW = (() => { const v = [-.2, -.42, -.88], n = Math.hypot(...v); return v.map(x => x / n); })();      // the way the moon's light travels (towards the viewer, down, right)
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


/* ===== The two friends of tranh 6: the lesser whistling duck (chim le le) and the greater coucal (chim bìm bịp). Each is saved by turning a shadow puzzle (a station: a tangle on a cord and a cloth
   between two bamboo poles, below) to the bird's own shadow: the first station's shadow is the le le, the second's the bìm bịp. The road is open all along (owner): the party may walk past
   without doing anything, but then chú bán dầu (the bridge, and so the gate) does not appear, and the road goes on and on with no gate; going back a little shows the stations again.
   Both saved: the two birds circle over the party, thank the mice and promise to fly along to warn them of danger. Saved in SAVE.t6: bl (le le), bb (bìm bịp), bong (both). ===== */
// the gate is there only once both friends are saved AND chú bán dầu has crossed the bridge (owner); until then the road goes on without an end
const t6Open = () => T6R.done && T6C.done;
const T6R = {
  got: [false, false], done: false, birds: [{ st: 'none' }, { st: 'none' }], say: -1, stations: [],
  init() {                                                                      // at the start of the tranh: what has been saved
    const s = SAVE.t6 || {}; this.got = [!!(s.bl || s.bong), !!(s.bb || s.bong)]; this.done = this.got[0] && this.got[1]; this.say = -1; this.stations = [];
    this.birds = [0, 1].map(i => ({ st: this.done ? 'follow' : this.got[i] ? 'orbit' : 'none', t: 9, a: i * 3.1, ph: i * 1.3, x: 0, y: 0, cx: -1, cy: 0, face: 1 }));
    LEVELS[5].width = 400000;                                                      // the road has no end, and no gate, until t6Open() (kept up to date in t6Friends.update)
  },
  rel(i, x, y) { const b = this.birds[i]; Object.assign(b, { st: 'rise', t: 0, x0: x, y0: y, a: -1.2, ph: 0, cx: -1 }); AU.pluck(i ? 86 : 91); },       // the bird lifts off its cloth
  save(i) {
    this.got[i] = true; SAVE.t6 = SAVE.t6 || {}; SAVE.t6[i ? 'bb' : 'bl'] = true;
    if (this.got[0] && this.got[1]) { this.done = true; this.say = 0; SAVE.t6.bong = true; for (const b of this.birds) b.st = 'follow'; }
    persist();
  },
};
// the two birds, flying (woodblock parts, three wing poses each, facing right): le le = a small duck, brown, a long neck out in front, a round dark bill, chestnut shoulders; bìm bịp = black, long tail, rufous wings, a heavy bill, red eye
let T6R_ART = null;
// A wing, as a bird has it (owner: the first ones looked like a dragonfly's): an arm from the shoulder to the wrist, covert feathers along it, and a fan of long separate primary feathers from the wrist.
// p is the stroke: 0 = raised, .5 = level, 1 = down. The wrist and the way the feathers point follow it.
function t6rWing(a, p, pl, tipPl, far) {
  const lerp = (x, y, t) => x + (y - x) * t, k = p < .5 ? p * 2 : (p - .5) * 2;
  const W0 = p < .5 ? [lerp(-4, -28, k), lerp(-36, -15, k)] : [lerp(-28, -10, k), lerp(-15, 24, k)], W = [W0[0] * .8, W0[1] * .8];     // the wrist (a short arm: the feathers start close to the body, no bare stretch)
  const ang = (p < .5 ? lerp(-108, -172, k) : lerp(-172, -262, k)) * Math.PI / 180;                              // the way the feathers point
  const S0 = far ? [8, -8] : [4, -5], ox = far ? 5 : 0, oy = far ? -4 : 0, w = [W[0] + ox, W[1] + oy], av = [w[0] - S0[0], w[1] - S0[1]], al = Math.hypot(av[0], av[1]) || 1;
  let n = [-av[1] / al, av[0] / al]; if (n[0] * 1 + n[1] * -.4 < 0) n = [-n[0], -n[1]];                              // the normal on the leading (front) side
  const at = (t, d) => [S0[0] + av[0] * t + n[0] * d, S0[1] + av[1] * t + n[1] * d];
  const sec = [.12, .3, .48, .66, .84];                                                                          // the secondaries: feathers all along the arm, behind its leading edge
  sec.forEach((t, j) => { const th = ang + (j - 2) * .05, L = 22 + (j === 2 ? 3 : 0), q = at(t, -2); a.fk(pl, ell(q[0] + Math.cos(th) * L * .5, q[1] + Math.sin(th) * L * .5, L * .5 + 1, 5.6, th), 1.5); });
  a.fk(pl, smooth([at(0, -3), at(0, 5), at(.5, 8), at(1, 7), at(.95, -3), at(.5, -4)]), 2);                       // the coverts: a narrow band along the leading edge
  const lens = [29, 35, 40, 41, 37, 30];
  lens.forEach((L, i) => {                                                                                    // the primaries, fanned from the wrist
    const th = ang + (i - 2.5) * .15, cx = w[0] + Math.cos(th) * L * .5, cy = w[1] + Math.sin(th) * L * .5;
    a.fk(i < 3 ? pl : tipPl, ell(cx, cy, L * .5 + 1, 5.4, th), 1.5);
  });
}
function t6rArt() {
  if (T6R_ART) return T6R_ART;
  const mk = (kind, p) => part([-120, -96, 78, 70], a => {
    const lele = kind === 'lele', cov = lele ? 'straw' : 'tan', tip = lele ? 'brown' : 'straw', farC = lele ? 'brown' : 'dark';
    t6rWing(a, p, farC, farC, true);                                                                          // the far wing, behind the body
    if (lele) {
      a.fk('straw', smooth([[-20, 0], [-36, -3], [-35, 6], [-19, 8]]), 1.6);                                  // the short tail
      a.fk('tan', ell(0, 1, 25, 12.5, -.08), 2.2);                                                           // the body
      a.fill('cream', ell(4, 7, 17, 6, -.05));                                                               // the buff belly
      a.fk('tan', smooth([[14, -4], [28, -12], [38, -17], [43, -13], [36, -6], [22, 3]]), 1.8);              // the neck, stretched out in front
      a.fk('ash', circ(42, -17, 8), 2);                                                                      // the head
      a.fill('brown', smooth([[35, -22], [43, -26], [51, -20], [43, -19]]));                                 // the dark crown
      a.fk('dark', smooth([[49, -18], [63, -16], [62, -9], [49, -12]]), 1.8);                                // the round, dark bill
      a.fill('white', circ(44, -19, 3.4)); a.ink(circ(44.6, -19, 1.6));                                      // the eye
      a.key(lines([[-17, 8, -40, 13], [-13, 9, -37, 17]]), 2); a.fk('dark', ell(-41, 14, 5, 2.4, .3), 1.2); a.fk('dark', ell(-38, 18, 5, 2.4, .3), 1.2);   // the legs and feet trail behind
    } else {
      a.fk('dark', smooth([[-18, 0], [-50, 4], [-86, 13], [-90, 19], [-80, 22], [-48, 15], [-18, 9]]), 2);   // the long, broad tail
      a.key(lines([[-30, 6, -78, 17], [-24, 9, -70, 20]]), 1.2);
      a.fk('dark', ell(0, 1, 24, 12.5, -.1), 2.2);                                                           // the glossy black body
      a.fk('dark', circ(27, -9, 9.5), 2.2);                                                                  // the head
      a.fk('dark', smooth([[34, -12], [50, -9], [51, -3], [35, -3]]), 1.8);                                  // the heavy bill
      a.fill('grey', smooth([[37, -9], [48, -8], [38, -6]]));
      a.fill('red', circ(28, -11, 3.6)); a.ink(circ(28.6, -11, 1.5));                                        // the red eye
      a.key(lines([[-12, 9, -34, 15], [-8, 10, -30, 19]]), 2);                                               // the legs
    }
    t6rWing(a, p, cov, tip, false);                                                                          // the near wing, over the body
  });
  const o = {}; for (const kind of ['lele', 'bim']) o[kind] = [0, .25, .5, .75, 1].map(p => mk(kind, p));
  return (T6R_ART = o);
}
const T6R_FLAP = [0, 1, 2, 3, 4, 3, 2, 1];                                                                  // the wing stroke, frame by frame: up, down and up again
function t6rBird(g, i, x, y, face, ph, s) {                                                                  // a bird in flight at x, y (i: 0 le le, 1 bìm bịp), face = ±1, ph = flap phase
  const A = t6rArt()[i ? 'bim' : 'lele'], f = Math.floor(ph) & 7;
  g.save(); g.translate(x, y - Math.cos(f * Math.PI / 4) * 3); g.scale(face * s, s); dp(g, A[T6R_FLAP[f]], 0, 0); g.restore();                          // the body bobs a little with the stroke
}

/* ===== In the tranh itself (owner: no separate screen). The tangle hangs in the scene on a cord; behind it, a little to the left and lower, a white cloth is stretched between two bamboo poles,
   and the moon's light puts the tangle's shadow on that cloth. Drag the tangle to turn it; the shadow on the cloth changes. When it is the bird (the owner's two photos), the shadow clicks into
   place and the bird lifts off the cloth and flies away; the road opens. The party is stopped short of the cloth until then. All drawn by the graphics card (WebGL2): if there is none, the
   tangle is skipped and the road is open from the start. ===== */
(function () {
  const L = BC_LW, LT = [-L[0], -L[1], -L[2]];
  const SC = 48, SPAN = 3.2, DW = 4.5, CW = 3.3, CH = 2.9;                       // world px per unit; the tangle's picture covers SPAN units; the cloth stands DW units behind its centre and is CW × CH units
    const makeGPU = () => {
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
      const SHAD = COMMON + 'uniform vec3 uLd,uP0,uPx,uPy;uniform float uSc,uGH,uAA;\n' +
        'void main(){float px=gl_FragCoord.x/uSc,py=uGH-gl_FragCoord.y/uSc;vec3 P=uP0+uPx*px+uPy*py;vec3 lp=vec3(dot(uR0,P),dot(uR1,P),dot(uR2,P));float sc=-dot(lp,uLd);vec3 cp=lp+sc*uLd;if(dot(cp,cp)>2.9){oc=vec4(0.);return;}\n' +
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
  };

    function gpuPass(X, w, h, set) {                                               // render one full-screen pass into X's canvas
    const gl = X.gl; if (X.c.width !== w || X.c.height !== h) { X.c.width = w; X.c.height = h; }
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(X.pr); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_3D, X.tex); gl.uniform1i(X.u('uF'), 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, X.tex2); gl.uniform1i(X.u('uT'), 1); gl.activeTexture(gl.TEXTURE0); set(gl, X.u); gl.drawArrays(gl.TRIANGLES, 0, 3);
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
  window.t6Shadow = function (cx0, idx) {
    const cy0 = GROUND - 255, k0 = DW / -L[2], ccx = cx0 + L[0] * k0 * SC, ccy = cy0 - L[1] * k0 * SC, rx0 = ccx - CW * SC / 2, ry0 = ccy - CH * SC / 2, cw = CW * SC, ch = CH * SC;   // the body's centre, the cloth's centre and corner
    let st = null, started = false, tex = null, G = null;                  // the puzzle state, this station's own distance grid, and its own graphics-card canvases
    const skip = () => T6R.got[idx];
    function make() {                                                            // the tangle is made (the picture: the two photos in turn), a pose well away from the right one
      BC.mask = BC_MASKS()[idx]; tex = bcBuild();                                  // the first station: the le le (the goose photo); the second: the bìm bịp (the crow photo)
      const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 2 - 1, n = Math.hypot(ax, ay, az) || 1;
      st = { ver: 1, W: bcMul(bcRot(ax / n, ay / n, az / n, 1.3 + Math.random() * 1.4), BC_Q), t: 0, vel: [0, 0], hold: 0, done: false, dt: 0, solve: null, touched: false, lx: 0, ly: 0 };
      E.st = st; AU.pluck(72);
    }
    function turn(ay, ax) {                                                      // a drag right turns the tangle about the up axis, a drag down about the right axis
      const m = Math.hypot(ay, ax); if (m < 1e-6) return; st.W = bcMul(bcRot(ax / m, ay / m, 0, m), st.W); st.ver++;
    }
    function startSolve(dur, winAfter, upright) {                                // turn the tangle the shortest way to the right tilt (the way up it has, or the right way up when upright)
      if (!st || st.done || st.solve) return; const R = bcMul(bcT(BC_Q), st.W), sg = upright || R[8] >= 0 ? 1 : -1, u = [R[2], R[5], R[8]], t = [0, 0, sg];
      st.vel = [0, 0];
      let ax = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], l = Math.hypot(...ax), an = Math.atan2(l, u[0] * t[0] + u[1] * t[1] + u[2] * t[2]);
      if (an < 1e-3) { if (winAfter) win(); return; }
      if (l < 1e-6) ax = [1, 0, 0], l = 1;
      st.solve = { t: 0, an, ax: ax.map(v => v / l), R, dur, winAfter };
    }
    function win() {
      st.done = true; st.dt = 0; st.ver++;
      AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => { AU.chirp && AU.chirp(); }, 700); setTimeout(() => AU.pluck(91), 1400);
    }
    function render() {                                                          // the two passes on the graphics card, only when the pose or the size changed
      const k = scale * DPR, n = Math.max(160, Math.min(900, Math.round(SPAN * SC * k))), W = st.W, Wt = bcT(W);
      if (!tex.gup) { G.upload(G.A, tex.sdf); G.upload2(G.A, tex.trim, tex.tg); tex.gup = true; }
      if (!tex.gupB) { G.upload(G.B, tex.sdf); G.upload2(G.B, tex.trim, tex.tg); tex.gupB = true; }
      if (st.gl1 !== st.ver || st.gn !== n) {
        st.gl1 = st.ver; st.gn = n;
        gpuPass(G.A, n, n, (gl, u) => { gl.uniform3f(u('uR0'), Wt[0], Wt[1], Wt[2]); gl.uniform3f(u('uR1'), Wt[3], Wt[4], Wt[5]); gl.uniform3f(u('uR2'), Wt[6], Wt[7], Wt[8]); gl.uniform3f(u('uW0'), W[0], W[1], W[2]); gl.uniform3f(u('uW1'), W[3], W[4], W[5]); gl.uniform3f(u('uW2'), W[6], W[7], W[8]); gl.uniform3f(u('uLT'), LT[0], LT[1], LT[2]); gl.uniform1f(u('uBS'), n / SPAN); gl.uniform1f(u('uRes'), n); });
      }
      const w = Math.max(64, Math.min(1000, Math.round(cw * k))), h = Math.max(64, Math.min(1000, Math.round(ch * k)));
      if (st.gl2 !== st.ver || st.gm !== w) {
        st.gl2 = st.ver; st.gm = w;
        gpuPass(G.B, w, h, (gl, u) => { gl.uniform3f(u('uR0'), Wt[0], Wt[1], Wt[2]); gl.uniform3f(u('uR1'), Wt[3], Wt[4], Wt[5]); gl.uniform3f(u('uR2'), Wt[6], Wt[7], Wt[8]); gl.uniform3f(u('uLd'), -(Wt[0] * L[0] + Wt[1] * L[1] + Wt[2] * L[2]), -(Wt[3] * L[0] + Wt[4] * L[1] + Wt[5] * L[2]), -(Wt[6] * L[0] + Wt[7] * L[1] + Wt[8] * L[2]));
          gl.uniform1f(u('uSc'), w / cw); gl.uniform1f(u('uGH'), ch); gl.uniform1f(u('uAA'), 1.1 / (SC * (w / cw))); gl.uniform3f(u('uP0'), (rx0 - cx0) / SC, -(ry0 - cy0) / SC, -DW); gl.uniform3f(u('uPx'), 1 / SC, 0, 0); gl.uniform3f(u('uPy'), 0, -1 / SC, 0); });
      }
    }
    const E = {
      layer: 'bg', cx: cx0, solved: !!skip(), st: null, btn: [],
      update(dt) {
        if (this.solved) return;
        if (!started) { started = true; G = makeGPU(); if (!G.ok) { this.solved = true; T6R.save(idx); return; } setTimeout(() => { if (!this.solved && !st) make(); }, 250 + idx * 1100); return; }
        if (!st) return;
        st.t += dt; const d = S.drag, mine = d && d.ent === this;
        if (mine) { const dx = d.x - st.lx, dy = d.y - st.ly; st.lx = d.x; st.ly = d.y; if (!st.done && !st.solve) { const kk = .012 * scale; turn(dx * kk, dy * kk); st.vel = [dx * kk, dy * kk]; } }
        if (!st.done) {
          if (!mine && !st.solve && (Math.abs(st.vel[0]) > .0006 || Math.abs(st.vel[1]) > .0006)) { turn(st.vel[0], st.vel[1]); st.vel[0] *= Math.pow(.04, dt); st.vel[1] *= Math.pow(.04, dt); }     // a little momentum
          else if (!mine && !st.touched && !st.solve) turn(.3 * dt, .14 * dt);                                      // until it is first touched, it turns slowly by itself, so the shadow is seen to change
          // How close the tilt must be: 1 % of a quarter turn (about 1 degree) at first, and a little more for every 15 seconds spent on this one, up to about 12 degrees, so nobody is shut out
          const tol = Math.min(.21, .0157 * (1 + Math.floor(st.t / 15)));
          const R = bcMul(bcT(BC_Q), st.W), ang = Math.acos(Math.min(1, Math.abs(R[8])));     // R[8]: how far the light axis is from the one it must lie along; the turn about it is free
          if (st.solve) { st.solve.t = Math.min(1, st.solve.t + dt / st.solve.dur); const e = st.solve.t * st.solve.t * (3 - 2 * st.solve.t), an = st.solve.an; st.W = bcMul(BC_Q, bcMul(bcRot(st.solve.ax[0], st.solve.ax[1], st.solve.ax[2], an * e), st.solve.R)); st.ver++; if (st.solve.t >= 1) { const w = st.solve.winAfter; st.solve = null; if (w) win(); } }
          else if (ang < tol) { st.hold += dt; if (st.hold > .3) startSolve(.45, true); } else st.hold = 0;     // kept for a third of a second: then it clicks into place
        } else { st.dt += dt; if (!st.rel && st.dt > .6) { st.rel = true; T6R.rel(idx, ccx, ccy); } if (st.dt > 3.4) { this.solved = true; T6R.save(idx); return; } }       // the bird lifts off its cloth and flies up over the road
        render();
      },
      grab(wx, wy) {                                                             // a finger or the mouse on the tangle: turn it
        if (this.solved || !st || st.done || st.solve) return null;
        if (Math.hypot(wx - cx0, wy - cy0) > 1.45 * SC) return null;
        st.touched = true; st.lx = wx; st.ly = wy; st.vel = [0, 0]; howtoInput();
        return { ent: this, x: wx, y: wy, draw() {} };
      },
      drop() {},
      onClick(wx, wy) {                                                          // (demo only) the two little buttons
        if (this.solved || !st) return false; const sx = wx - camX, sy = wy + offY;
        for (const b of this.btn) if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) { b.act(); return true; }
        return false;
      },
      draw(g) {                                                                  // the cloth between its two poles, with the shadow on it (behind the party)
        if (this.solved || !st) return;
        const fade = st.done ? Math.max(0, 1 - Math.max(0, st.dt - 2.5) / .8) : 1; g.save(); g.globalAlpha = fade;
        for (const sx of [-1, 1]) {                                              // two bamboo poles
          const px = ccx + sx * (cw / 2 + 7);
          g.lineCap = 'round'; g.strokeStyle = '#1d1915'; g.lineWidth = 9; g.beginPath(); g.moveTo(px, GROUND + 4); g.lineTo(px, ry0 - 30); g.stroke();
          g.strokeStyle = '#7d8f4d'; g.lineWidth = 5.4; g.stroke();
          g.strokeStyle = '#1d1915'; g.lineWidth = 1.6; for (let y = GROUND - 40; y > ry0 - 26; y -= 52) { g.beginPath(); g.moveTo(px - 4.6, y); g.lineTo(px + 4.6, y); g.stroke(); }
        }
        g.strokeStyle = '#1d1915'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx0, ry0); g.lineTo(ccx - cw / 2 - 7, ry0 - 18); g.moveTo(rx0 + cw, ry0); g.lineTo(ccx + cw / 2 + 7, ry0 - 18); g.stroke();     // its ropes
        const gr = g.createLinearGradient(rx0, 0, rx0 + cw, 0); gr.addColorStop(0, '#cfd3d6'); gr.addColorStop(1, '#f3efdc');                                  // the cloth: moonlit, brighter on the moon's side (right)
        g.fillStyle = gr; g.beginPath(); g.moveTo(rx0, ry0); g.lineTo(rx0 + cw, ry0); g.lineTo(rx0 + cw, ry0 + ch); g.quadraticCurveTo(rx0 + cw / 2, ry0 + ch + 9, rx0, ry0 + ch); g.closePath(); g.fill();
        g.save(); g.clip(); g.imageSmoothingEnabled = true; g.drawImage(G.B.c, rx0, ry0, cw, ch + 10); g.restore();                                        // the shadow (the cloth is the clip)
        g.strokeStyle = '#1d1915'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(rx0, ry0); g.lineTo(rx0 + cw, ry0); g.lineTo(rx0 + cw, ry0 + ch); g.quadraticCurveTo(rx0 + cw / 2, ry0 + ch + 9, rx0, ry0 + ch); g.closePath(); g.stroke();
        g.restore();
      },
      drawFg(g) {                                                                // the tangle on its cord, and the bird once the shadow is right
        if (this.solved || !st) return;
        g.save(); g.strokeStyle = 'rgba(232,236,255,.6)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx0, -offY - 20); g.lineTo(cx0, cy0 - 1.2 * SC); g.stroke();
        g.globalAlpha = st.done ? Math.max(0, 1 - st.dt / 2.2) : 1; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(G.A.c, cx0 - SPAN * SC / 2, cy0 - SPAN * SC / 2, SPAN * SC, SPAN * SC); g.restore();
        const dxg = Math.abs(groom.x - cx0);                                     // "Cứu tôi với!" when the party comes near
        if (!st.done && dxg < 560) { g.save(); g.globalAlpha = Math.min(1, (560 - dxg) / 160); t5Say(g, cx0 - 64, cy0 - 14 + Math.sin(S.t * 3 + idx * 1.7) * 3, 'Cứu tôi với!'); g.restore(); }
      },
      drawHud(g, vw) {                                                           // (demo only) a button that shows the answer, on the nearest station still to do
        this.btn = []; if (this.solved || !st || st.done) return;
        const me = T6R.stations.filter(q => q && !q.solved && q.st && !q.st.done).sort((p, q) => Math.abs(groom.x - p.cx) - Math.abs(groom.x - q.cx))[0]; if (me !== this || Math.abs(groom.x - cx0) > 520) return;
        g.save(); g.font = '600 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const w = 122, h = 30, x = vw - w - 24, y = viewH - 62; this.btn.push({ x, y, w, h, act: () => startSolve(2, false, true) });
        g.fillStyle = 'rgba(0,0,0,.45)'; g.strokeStyle = '#e8ecff'; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 15) : g.rect(x, y, w, h); g.fill(); g.stroke(); g.fillStyle = '#e8ecff'; g.fillText('Xem đáp án', x + w / 2, y + h / 2 + 1);
        g.restore();
      },
    };
    T6R.stations[idx] = E; window.__t6s = T6R.stations;
    return E;
  };

  window.t6Friends = function () {
    return { layer: 'hud', tp: null,
      update(dt) {
        if (T6R.say >= 0) T6R.say += dt;
        LEVELS[5].width = t6Open() ? 3700 : 400000;
        if (this.tp) {                                                          // far out on the endless road, the moment the party turns back it is back by the pond (owner): a short fade to dark, the jump in the dark, then the light again
          this.tp.t += dt;
          if (!this.tp.done && this.tp.t >= .25) { this.tp.done = true; const d = Math.max(0, groom.x - 3700); groom.x -= d; followers.forEach(f => f.x -= d); camX = Math.max(0, camX - d); T6R.birds.forEach(b => { b.cx -= d; b.x -= d; b.x0 -= d; }); }
          if (this.tp.t > .8) this.tp = null;
        } else if (!t6Open() && groom.x > 3900 && groom.vx < -30) this.tp = { t: 0, done: false };       // far out on the endless road, the moment the party turns back it is back by the pond: the tasks are there at once (owner), however far it had walked
        T6R.birds.forEach((b, i) => {
          if (b.st === 'none') return; b.t += dt; b.ph += dt * (11 + i * 1.3);
          const sx = T6R.stations[i] ? T6R.stations[i].cx : groom.x, tx = T6R.done ? groom.x + (i ? 80 : -40) + 60 : sx, ty = GROUND - (T6R.done ? 275 : 360) - i * 26;     // over its station, then over the party
          if (b.cx < 0) { b.cx = tx; b.cy = ty; }
          b.cx += (tx - b.cx) * Math.min(1, dt * (T6R.done ? 1.6 : 2)); b.cy += (ty - b.cy) * Math.min(1, dt * 2);
          b.a += dt * (.9 + i * .15);
          const Rx = 105 + i * 26, Ry = 24 + i * 5; let px = b.cx + Math.cos(b.a) * Rx, py = b.cy + Math.sin(b.a) * Ry;
          if (b.st === 'rise') { const q = Math.min(1, b.t / 2.4), e = q * q * (3 - 2 * q); px = b.x0 + (px - b.x0) * e; py = b.y0 + (py - b.y0) * e; if (q >= 1) b.st = 'orbit'; }
          b.face = -Math.sin(b.a) >= 0 ? 1 : -1; b.x = px; b.y = py;
        });
      },
      drawHud(g, vw) {                                                          // the fade to dark of the turn back
        if (!this.tp) return; const t = this.tp.t, a = t < .25 ? t / .25 : Math.max(0, 1 - (t - .25) / .5);
        g.fillStyle = `rgba(10,14,30,${a})`; g.fillRect(0, 0, vw, viewH);
      },
      drawFg(g) {
        T6R.birds.forEach((b, i) => { if (b.st === 'none') return; t6rBird(g, i, b.x, b.y, b.face, b.ph, 1.05); });
        const t = T6R.say; if (t < 0) return;                                  // the thanks, once both are free
        const say = [[.6, 5, 0, 'Cảm ơn đàn chuột!'], [5.4, 12, 1, 'Chúng tôi sẽ bay theo để báo cho các bạn khi có nguy hiểm!']];
        for (const [a, z, i, text] of say) if (t > a && t < z) { const b = T6R.birds[i]; g.save(); g.globalAlpha = Math.min(1, (t - a) / .3, (z - t) / .4); t5Say(g, b.x, b.y - 34, text); g.restore(); }
      },
    };
  };
})();
