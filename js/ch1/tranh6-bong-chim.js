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
const BC_W = 340, BC_H = 560, BC_CX = 170, BC_CY = 190, BC_S = 100, BC_GY = 452, BC_GS = 0.42, BC_H3 = 1.5, BC_GTOP = BC_GY - 60;   // canvas; the tangle's centre; px per unit; ground line, its squash, the tangle's height over it (units)
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
const bcAngleFromI = R => Math.abs(Math.acos(Math.max(-1, Math.min(1, (R[0] + R[4] + R[8] - 1) / 2))));
function bcNoise(seed) {                                                    // smooth value noise on a wrapping grid, 0..1
  const G = 64, v = new Float32Array(G * G); let a = seed >>> 0; for (let i = 0; i < v.length; i++) { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; v[i] = a / 4294967296; }
  return (x, y) => { x = ((x % G) + G) % G; y = ((y % G) + G) % G; const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    return (v[y0 * G + x0] * (1 - sx) + v[y0 * G + x1] * sx) * (1 - sy) + (v[y1 * G + x0] * (1 - sx) + v[y1 * G + x1] * sx) * sy; };
}
// the bird seen from above, in the moon's x, y (head up the picture, wings spread, a fanned tail); k scales it
function bcBirdPath(p, k) {
  const tri = pts => { pts.forEach(([x, z], i) => { i ? p.lineTo(x * k, z * k) : p.moveTo(x * k, z * k); }); p.closePath(); };
  tri([[0, -.62], [.1, -.5], [.13, -.3], [.1, 0], [.12, .3], [.2, .62], [.06, .52], [0, .66], [-.06, .52], [-.2, .62], [-.12, .3], [-.1, 0], [-.13, -.3], [-.1, -.5]]);
  for (const s of [-1, 1]) tri([[s * .1, -.3], [s * .4, -.42], [s * .95, -.34], [s * 1.04, -.2], [s * .8, -.14], [s * .86, -.02], [s * .55, .06], [s * .1, .16]]);
  tri([[-.03, -.74], [.03, -.74], [0, -.62]]);
}
function bcBuild() {
  const seed = (Math.random() * 4294967295) >>> 0, rnd = (() => { let a = seed ^ 0x5bd1e995; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; })();
  const G = 150, R0 = 1.3, cs = 2 * R0 / G, K = 1.0;                           // a grid over x, y in -1.1…1.1
  const cv = document.createElement('canvas'); cv.width = cv.height = G; const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.setTransform(G / (2 * R0), 0, 0, G / (2 * R0), G / 2, G / 2); cx.fillStyle = '#000'; const bp = new Path2D(); bcBirdPath(bp, K); cx.fill(bp);
  const da = cx.getImageData(0, 0, G, G).data, inside = new Uint8Array(G * G); for (let i = 0; i < G * G; i++) inside[i] = da[i * 4 + 3] > 140 ? 1 : 0;
  const px = i => -R0 + (i % G + .5) * cs, py = i => -R0 + (Math.floor(i / G) + .5) * cs;
  const isIn = (x, y) => { const i = Math.floor((x + R0) / cs), j = Math.floor((y + R0) / cs); return i >= 0 && j >= 0 && i < G && j < G && inside[j * G + i] === 1; };
  // distance of each inside cell to the edge of the bird (two-pass chamfer), in units
  const dist = new Float32Array(G * G); for (let i = 0; i < G * G; i++) dist[i] = inside[i] ? 1e9 : 0;
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const k = j * G + i; let d = dist[k]; if (i > 0) d = Math.min(d, dist[k - 1] + 1); if (j > 0) { d = Math.min(d, dist[k - G] + 1); if (i > 0) d = Math.min(d, dist[k - G - 1] + 1.41); if (i < G - 1) d = Math.min(d, dist[k - G + 1] + 1.41); } dist[k] = d; }
  for (let j = G - 1; j >= 0; j--) for (let i = G - 1; i >= 0; i--) { const k = j * G + i; let d = dist[k]; if (i < G - 1) d = Math.min(d, dist[k + 1] + 1); if (j < G - 1) { d = Math.min(d, dist[k + G] + 1); if (i < G - 1) d = Math.min(d, dist[k + G + 1] + 1.41); if (i > 0) d = Math.min(d, dist[k + G - 1] + 1.41); } dist[k] = d; }
  // circles filling the bird: the widest uncovered place first
  const covered = new Uint8Array(G * G), balls = [];
  for (let n = 0; n < 140; n++) {
    let best = -1, bd = 0; for (let k = 0; k < G * G; k++) if (inside[k] && !covered[k] && dist[k] > bd) { bd = dist[k]; best = k; }
    const r = (bd - .5) * cs;                                                  // as large as fits inside (a half cell of slack for the pixels' edge)
    if (best < 0 || r < .028) break;
    const x = px(best), y = py(best); balls.push({ x, y, r: Math.min(r, .17) });
    for (let k = 0; k < G * G; k++) if (inside[k] && Math.hypot(px(k) - x, py(k) - y) <= Math.min(r, .17)) covered[k] = 1;
  }
  // depth: a wavy field plus a jitter, so the parts stand out and sink in
  const zn = bcNoise(seed ^ 0x27d4eb2f), zm = bcNoise(seed ^ 0x165667b1);
  for (const b of balls) b.z = 2.6 * (.65 * zn(b.x * 1.1 + 6, b.y * 1.1 + 3) + .35 * zm(b.x * 2.3 + 2, b.y * 2.3 + 8) - .5) + (rnd() - .5) * .5;
  // rods between neighbours, as long as the rod's shadow stays in the bird
  const rods = [], key = new Set(), add = (a, b, r) => { const k = a < b ? a + '_' + b : b + '_' + a; if (key.has(k)) return false; key.add(k); rods.push({ a: [balls[a].x, balls[a].y, balls[a].z], b: [balls[b].x, balls[b].y, balls[b].z], r }); return true; };
  balls.forEach((A, i) => {
    const near = balls.map((B, j) => ({ j, d: Math.hypot(A.x - B.x, A.y - B.y) })).filter(o => o.j !== i && o.d < A.r + balls[o.j].r + .3).sort((p, q) => p.d - q.d);
    let made = 0; for (const o of near) { if (made >= 4) break; const B = balls[o.j], rr = Math.max(.035, Math.min(.085, .6 * Math.min(A.r, B.r)));
      let ok = o.d <= A.r + B.r; for (let t = 1; t < 12 && !ok; t++) { }
      if (!ok) { ok = true; for (let t = 0; t <= 12; t++) { const u = t / 12, x = A.x + (B.x - A.x) * u, y = A.y + (B.y - A.y) * u; if (!isIn(x + rr, y) || !isIn(x - rr, y) || !isIn(x, y + rr) || !isIn(x, y - rr)) { ok = false; break; } } }
      if (ok && add(i, o.j, rr)) made++; }
  });
  // needles through some balls, along the light: their shadow is only a dot
  const pins = []; for (let n = 0; n < 8; n++) { const b = balls[Math.floor(rnd() * balls.length)]; pins.push({ a: [b.x, b.y, b.z - .25 - rnd() * .35], b: [b.x, b.y, b.z + .25 + rnd() * .35], r: .02 + rnd() * .01, pin: true }); }
  return { balls, rods: rods.concat(pins) };
}

(function () {
  const el = document.createElement('div'); el.id = 'bongchim'; el.hidden = true;
  el.innerHTML = '<canvas id="bongCv"></canvas><button id="bongX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#bongX');
  const L = BC_LW, kx = L[0] / L[1], kz = L[2] / L[1], e1 = [BC_Q[0], BC_Q[3], BC_Q[6]], e2 = [BC_Q[1], BC_Q[4], BC_Q[7]];
  let st = null, raf = 0, last = 0;
  const size = () => { const k = Math.min(innerWidth * .96 / BC_W, innerHeight * .94 / BC_H), d = Math.min(2, devicePixelRatio || 1); cv2.style.width = BC_W * k + 'px'; cv2.style.height = BC_H * k + 'px'; cv2.width = Math.round(BC_W * k * d); cv2.height = Math.round(BC_H * k * d); st && (st.k = k * d); };
  const stars = Array.from({ length: 46 }, (_, i) => [(i * 97 % 340) + .5, (i * 53 % 300) + .5, .6 + (i % 4) * .3]);
  const proj = w => [w[0] - kx * (w[1] + BC_H3), w[2] - kz * (w[1] + BC_H3)];       // a point of the tangle (relative to its centre) → where the moon's light puts it on the ground
  const gpos = p => [BC_CX + p[0] * BC_S, BC_GY + p[1] * BC_S * BC_GS];
  const dir = v => [v[0] - kx * v[1], v[2] - kz * v[1]];                              // the same for a direction
  // The tangle is drawn by a small z-buffer renderer of its own (balls and rods are exact shapes, so every pixel shows the nearest one: nothing pops in and out as it turns).
  const ZR = 1.5, ZN = Math.round(300 * ZR), zc = document.createElement('canvas'); zc.width = zc.height = ZN; const zx = zc.getContext('2d'), zimg = zx.createImageData(ZN, ZN), zb = new Float32Array(ZN * ZN), zd = zimg.data;
  const LT = [-L[0], -L[1], -L[2]];                                              // towards the moon
  function shade(nx, ny, nz, o) {                                                // polished gold-silver metal: a bright sky over a dark ground in the mirror, the moon's glint, a cool edge light
    const rz = 2 * nz * nz - 1, ry = 2 * nz * ny, rx = 2 * nz * nx, e = Math.max(0, Math.min(1, ry * .5 + .5)), dif = Math.max(0, nx * LT[0] + ny * LT[1] + nz * LT[2]);
    const hz = Math.max(0, Math.min(1, (e - .44) / .12)), hs = hz * hz * (3 - 2 * hz), env = .1 + .78 * hs * (.6 + .4 * e) + .22 * dif, sp = Math.pow(Math.max(0, rx * LT[0] + ry * LT[1] + rz * LT[2]), 30), fr = Math.pow(1 - nz, 2.5);
    zd[o] = Math.min(255, 238 * env + 255 * sp + 90 * fr); zd[o + 1] = Math.min(255, 214 * env + 250 * sp + 130 * fr); zd[o + 2] = Math.min(255, 170 * env + 235 * sp + 210 * fr); zd[o + 3] = 255;
  }
  function zSphere(cx, cy, cz, r) {                                              // centre in buffer pixels, depth in units, radius in pixels (and units: rz)
    const rp = r * BC_S * ZR, x0 = Math.max(0, Math.floor(cx - rp)), x1 = Math.min(ZN - 1, Math.ceil(cx + rp)), y0 = Math.max(0, Math.floor(cy - rp)), y1 = Math.min(ZN - 1, Math.ceil(cy + rp));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + .5 - cx) / rp, dy = -(y + .5 - cy) / rp, d2 = dx * dx + dy * dy; if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2), z = cz + nz * r, k = y * ZN + x; if (z <= zb[k]) continue; zb[k] = z; shade(dx, dy, nz, k * 4);
    }
  }
  function zRod(a, b, r) {                                                       // a, b: the ends in world units (relative to the centre); a cylinder (the caps are balls)
    const BS = BC_S * ZR, c = ZN / 2, dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz); if (len < 1e-6) return;
    const ux = dx / len, uy = dy / len, uz = dz / len, uu = 1 - uz * uz; if (uu < 1e-4) return;           // an axis along the view shows only its end balls
    const vx = -uz * ux, vy = -uz * uy, vz = 1 - uz * uz, rp = r * BS;
    const x0 = Math.max(0, Math.floor(c + Math.min(a[0], b[0]) * BS - rp)), x1 = Math.min(ZN - 1, Math.ceil(c + Math.max(a[0], b[0]) * BS + rp)), y0 = Math.max(0, Math.floor(c - Math.max(a[1], b[1]) * BS - rp)), y1 = Math.min(ZN - 1, Math.ceil(c - Math.min(a[1], b[1]) * BS + rp));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const w0x = (x + .5 - c) / BS - a[0], w0y = -(y + .5 - c) / BS - a[1], w0z = -a[2], d = w0x * ux + w0y * uy + w0z * uz, qx = w0x - d * ux, qy = w0y - d * uy, qz = w0z - d * uz;
      const bb = qx * vx + qy * vy + qz * vz, cc = qx * qx + qy * qy + qz * qz - r * r, disc = bb * bb - uu * cc; if (disc < 0) continue;
      const t = (-bb + Math.sqrt(disc)) / uu, px = w0x, py = w0y, pz = w0z + t, s = px * ux + py * uy + pz * uz; if (s < 0 || s > len) continue;
      const k = y * ZN + x; if (t <= zb[k]) continue; zb[k] = t; shade((px - s * ux) / r, (py - s * uy) / r, (pz - s * uz) / r, k * 4);
    }
  }
  function lump(h, W) {
    const T = BC.tex; zb.fill(-1e9); zd.fill(0); const c = ZN / 2;
    for (const b of T.balls) { const w = bcApp(W, [b.x, b.y, b.z]); zSphere(c + w[0] * BC_S * ZR, c - w[1] * BC_S * ZR, w[2], b.r); }
    for (const r of T.rods) {
      const a = bcApp(W, r.a), b = bcApp(W, r.b), A = [c + a[0] * BC_S * ZR, c - a[1] * BC_S * ZR, a[2]], B = [c + b[0] * BC_S * ZR, c - b[1] * BC_S * ZR, b[2]];
      zRod(a, b, r.r); if (r.pin) { zSphere(A[0], A[1], A[2], r.r); zSphere(B[0], B[1], B[2], r.r); }
    }
    zx.putImageData(zimg, 0, 0); h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(zc, BC_CX - 150, BC_CY - 150, 300, 300);
  }
  function ground(h, W) {                                                    // the pool of moonlight and the tangle's shadow in it, drawn in the plane across the light
    const o = proj([0, 0, 0]), a = dir(e1), b = dir(e2);
    h.save(); h.beginPath(); h.rect(0, BC_GTOP, BC_W, BC_H - BC_GTOP); h.clip();
    const gr = h.createLinearGradient(0, BC_GTOP, 0, BC_H); gr.addColorStop(0, '#171f38'); gr.addColorStop(1, '#222c4a'); h.fillStyle = gr; h.fillRect(0, BC_GTOP, BC_W, BC_H - BC_GTOP);
    h.setTransform(st.k * BC_S * a[0], st.k * BC_S * BC_GS * a[1], st.k * BC_S * b[0], st.k * BC_S * BC_GS * b[1], st.k * (BC_CX + BC_S * o[0]), st.k * (BC_GY + BC_S * BC_GS * o[1]));
    const pool = h.createRadialGradient(0, 0, 0, 0, 0, 2.0); pool.addColorStop(0, '#dfe6f4'); pool.addColorStop(.7, '#b9c6de'); pool.addColorStop(1, 'rgba(160,178,210,0)'); h.fillStyle = pool; h.beginPath(); h.arc(0, 0, 2.0, 0, 6.283); h.fill();
    h.fillStyle = h.strokeStyle = '#141a2c'; h.lineCap = 'round';
    for (const p of BC.tex.balls) { const w = bcApp(W, [p.x, p.y, p.z]); h.beginPath(); h.arc(w[0] * e1[0] + w[1] * e1[1] + w[2] * e1[2], w[0] * e2[0] + w[1] * e2[1] + w[2] * e2[2], p.r, 0, 6.283); h.fill(); }
    for (const r of BC.tex.rods) {
      const wa = bcApp(W, r.a), wb = bcApp(W, r.b); h.lineWidth = r.r * 2;
      h.beginPath(); h.moveTo(wa[0] * e1[0] + wa[1] * e1[1] + wa[2] * e1[2], wa[0] * e2[0] + wa[1] * e2[1] + wa[2] * e2[2]); h.lineTo(wb[0] * e1[0] + wb[1] * e1[1] + wb[2] * e1[2], wb[0] * e2[0] + wb[1] * e2[1] + wb[2] * e2[2]); h.stroke();
    }
    h.restore();
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
    ground(h, st.W); h.setTransform(k, 0, 0, k, 0, 0);
    h.strokeStyle = 'rgba(232,236,255,.5)'; h.lineWidth = 1.2; h.beginPath(); h.moveTo(BC_CX, 0); h.lineTo(BC_CX, BC_CY - 110); h.stroke();      // the cord
    h.globalAlpha = st.done ? Math.max(0, 1 - st.dt / 2.2) : 1; lump(h, st.W); h.globalAlpha = 1;
    if (st.done) {                                                             // the bird: out of its shadow and away
      const T = st.dt, p = Math.min(1, T / 3.2), e = p * p * (3 - 2 * p), s0 = gpos(proj([0, 0, 0])), sx0 = s0[0], sy0 = s0[1];
      const bx = sx0 + (BC_W + 40 - sx0) * e * .95 + Math.sin(T * 3) * 6, by = sy0 - (sy0 + 40) * e - Math.sin(p * Math.PI) * 30, sc = .45 + 1.2 * Math.min(1, T / 1.6);
      h.globalAlpha = Math.min(1, T / .3); wing(h, bx, by, sc, .4 + .6 * Math.sin(T * 14), '#f2c640'); h.globalAlpha = 1;
    }
  }
  const pt = e => { const r = cv2.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * BC_W, (e.clientY - r.top) / r.height * BC_H]; };
  cv2.addEventListener('pointerdown', e => { if (!st || st.done) return; st.drag = pt(e); st.vel = [0, 0]; try { cv2.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  cv2.addEventListener('pointermove', e => {
    if (!st || !st.drag || st.done) return; const [x, y] = pt(e), dx = x - st.drag[0], dy = y - st.drag[1]; st.drag = [x, y];
    turn(dx * .012, dy * .012); st.vel = [dx * .012, dy * .012];
  });
  const up = () => { if (st) st.drag = null; };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  function turn(ay, ax) {                                                    // a drag right turns the tangle about the up axis, a drag down about the right axis
    const m = Math.hypot(ay, ax); if (m < 1e-6) return; st.W = bcMul(bcRot(ax / m, ay / m, 0, m), st.W);
  }
  function loop(ts) {
    if (!BC.open) return; const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    if (st) {
      st.t += dt;
      if (!st.done) {
        if (!st.drag && (Math.abs(st.vel[0]) > .0006 || Math.abs(st.vel[1]) > .0006)) { turn(st.vel[0], st.vel[1]); st.vel[0] *= Math.pow(.04, dt); st.vel[1] *= Math.pow(.04, dt); }     // a little momentum
        const R = bcMul(bcT(BC_Q), st.W), ang = bcAngleFromI(R);
        if (ang < .07) { st.hold += dt; if (st.hold > .25) win(); } else st.hold = 0;     // about 4 degrees, kept for a quarter of a second
      } else { st.dt += dt; if (st.dt > 4.2) finish(); }
      draw();
    }
    raf = requestAnimationFrame(loop);
  }
  function win() {
    st.done = true; st.dt = 0; st.drag = null; st.W = BC_Q.slice();         // it settles exactly on the target
    AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => { AU.chirp && AU.chirp(); }, 700); setTimeout(() => AU.pluck(91), 1400);
  }
  function finish() { const cb = st && st.cb; BC.open = false; el.hidden = true; cancelAnimationFrame(raf); st = null; if (cb) cb(); }
  addEventListener('keydown', e => { if (!BC.open) return; e.stopPropagation(); e.preventDefault(); if (e.code === 'Escape') finish(); }, true);
  X.addEventListener('click', finish);
  addEventListener('resize', () => BC.open && size());
  window.bongOpen = function (cb) {
    if (BC.open) return; BC.open = true; el.hidden = false;
    setTimeout(() => {                                                       // the tangle takes a moment to make: the panel is up first
      if (!BC.open) return; BC.tex = bcBuild();
      // a pose well away from the target: turned by 1.3..2.7 radians about a random axis
      const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 2 - 1, n = Math.hypot(ax, ay, az) || 1, W0 = bcMul(bcRot(ax / n, ay / n, az / n, 1.3 + Math.random() * 1.4), BC_Q);
      st = { W: W0, k: 1, t: 0, drag: null, vel: [0, 0], hold: 0, done: false, dt: 0, cb }; BC.st = st; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
    }, 60);
  };
  if (window.__bongTest || /[?&]thu=cau/.test(location.search)) setTimeout(() => bongOpen(() => toast('Chim bay đi rồi! (thử)', 3)), 1800);
})();
