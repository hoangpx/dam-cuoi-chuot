/* Tranh 6 · Bắc Kim Thang, the opening (owner's idea, demo): a solid ball full of holes, hung under the moon. The player turns it any way with a finger or
   the mouse. The moon shines through the holes and the shadow of the ball falls on the ground, with spots of light where a ray gets through a hole on the
   near side AND a hole on the far side. Turn it just right, for one moment, and those spots make the shape of a bird on the ground: the bird lifts out of
   its own shadow and flies up. Then the tranh begins.
   How it is built (all drawn by hand in a small 3D of its own, no library):
   - the ball is a cube-map of "hole or paper" (BC.cube). It was made for ONE pose (the target): in the moon's own frame the ray through the point (a, b) of
     the disc across the moon's path meets the ball at a lit-side point and a far-side point; where the bird is, both are holes; everywhere else at most one is,
     chosen by smooth noise (blobs and rips). So at the target pose the lit spots are exactly the bird, and in every other pose they are a scatter.
   - W = the ball's pose (sphere → world, a 3×3 matrix); the player's drag turns it about the screen's axes (with a little momentum).
   - each frame: the ball is drawn pixel by pixel (paper shaded by the moon, or a hole: through it the inside of the far wall, or the sky if that is a hole too);
     the ground is drawn pixel by pixel: a ray from the ground toward the moon, if it crosses the ball, is lit only through two holes.
   - the target is reached when W is within 4° of the target for a quarter of a second: the bird is drawn, rises out of the shadow and flies off; then done().
   Random every time: the starting pose (and the noise) are new each time, so there is nothing to share. */
const BC = { open: false, cube: null, st: null, S: 256 };
const BC_W = 340, BC_H = 560, BC_CX = 170, BC_CY = 196, BC_S = 106, BC_GY = 452, BC_GS = 0.42, BC_H3 = 1.45;   // canvas, ball centre and radius (px), ground line, ground squash, ball height over the ground (units of radius)
const BC_LW = (() => { const v = [.25, -.88, .4], n = Math.hypot(...v); return v.map(x => x / n); })();      // the way the moon's light travels (towards the viewer, down, right)
const BC_Q = (() => {                                                       // the moon's frame: e3 = the light's way, e1 ≈ screen right, e2 = e3 × e1  (columns, light frame → world)
  const L = BC_LW, d = L[0], e1 = [1 - d * L[0], -d * L[1], -d * L[2]], n = Math.hypot(...e1); e1[0] /= n; e1[1] /= n; e1[2] /= n;
  const e2 = [L[1] * e1[2] - L[2] * e1[1], L[2] * e1[0] - L[0] * e1[2], L[0] * e1[1] - L[1] * e1[0]];
  return [e1[0], e2[0], L[0], e1[1], e2[1], L[1], e1[2], e2[2], L[2]];
})();
// 3×3 matrices, row-major
const bcMul = (A, B) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return o; };
const bcT = A => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
const bcRot = (ax, ay, az, a) => { const c = Math.cos(a), s = Math.sin(a), t = 1 - c; return [t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay, t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax, t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c]; };
const bcAngleFromI = R => Math.acos(Math.max(-1, Math.min(1, (R[0] + R[4] + R[8] - 1) / 2)));
function bcNoise(seed) {                                                    // smooth value noise on a grid, 0..1
  const G = 64, v = new Float32Array(G * G); let a = seed >>> 0; for (let i = 0; i < v.length; i++) { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; v[i] = a / 4294967296; }
  return (x, y) => { x = ((x % G) + G) % G; y = ((y % G) + G) % G; const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    return (v[y0 * G + x0] * (1 - sx) + v[y0 * G + x1] * sx) * (1 - sy) + (v[y1 * G + x0] * (1 - sx) + v[y1 * G + x1] * sx) * sy; };
}
// the bird as seen from above, drawn into a ground bitmap (head to -z, wings spread, a fanned tail)
function bcBirdPath(p, k) {
  const m = (x, z) => [x * k, z * k], L = (a, b) => { const [x, y] = m(a, b); return [x, y]; };
  const tri = (pts) => { pts.forEach(([x, z], i) => { const [px, py] = L(x, z); i ? p.lineTo(px, py) : p.moveTo(px, py); }); p.closePath(); };
  tri([[0, -.62], [.1, -.5], [.13, -.3], [.1, 0], [.12, .3], [.2, .62], [.06, .52], [0, .66], [-.06, .52], [-.2, .62], [-.12, .3], [-.1, 0], [-.13, -.3], [-.1, -.5]]);   // body, head and the fanned tail
  for (const s of [-1, 1]) tri([[s * .1, -.3], [s * .4, -.42], [s * .95, -.34], [s * 1.04, -.2], [s * .8, -.14], [s * .86, -.02], [s * .55, .06], [s * .1, .16]]);          // a wing
  tri([[-.03, -.74], [.03, -.74], [0, -.62]]);                              // the beak
}
function bcBuild() {
  const S = BC.S, GR2 = () => Math.random(), seed = (Math.random() * 4294967295) >>> 0;
  // the ground bitmap of the bird (coordinates -1.7..1.7), scaled until the whole bird lies inside the lit disc
  const BG = 256, gc = document.createElement('canvas'); gc.width = gc.height = BG; const gg = gc.getContext('2d', { willReadFrequently: true });
  const L = BC_LW, Q = BC_Q, e1 = [Q[0], Q[3], Q[6]], e2 = [Q[1], Q[4], Q[7]];
  const ground = (a, b) => { const x = a * e1[0] + b * e2[0], y = BC_H3 + a * e1[1] + b * e2[1], z = a * e1[2] + b * e2[2], t = -y / L[1]; return [x + t * L[0], z + t * L[2]]; };   // the ground point of the disc point (a, b)
  const [x0, z0] = ground(0, 0);
  let k = 1, bird = null;
  for (let tries = 0; tries < 12; tries++, k *= .9) {
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, BG, BG); gg.setTransform(BG / 3.4, 0, 0, BG / 3.4, BG / 2, BG / 2); gg.fillStyle = '#000'; const p = new Path2D(); bcBirdPath(p, k); gg.fill(p);
    const d = gg.getImageData(0, 0, BG, BG).data; bird = new Uint8Array(BG * BG); for (let i = 0; i < bird.length; i++) bird[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    // do all bird points map into the disc? (invert the ground projection: take the disc's boundary and see if the bird stays inside)
    let ok = true; for (let i = 0; i < BG && ok; i += 3) for (let j = 0; j < BG; j += 3) if (bird[j * BG + i]) {
      const gx = (i - BG / 2) / (BG / 3.4) + x0, gz = (j - BG / 2) / (BG / 3.4) + z0;
      // solve the ground point back to (a, b): g = C + a e1 + b e2 + t L, y = 0
      const rx = gx, rz = gz; let A = 0, B = 0; { const M = [[e1[0] - e1[1] * L[0] / L[1], e2[0] - e2[1] * L[0] / L[1]], [e1[2] - e1[1] * L[2] / L[1], e2[2] - e2[1] * L[2] / L[1]]];
        const c0 = rx - (BC_H3 * (-L[0] / L[1])), c1 = rz - (BC_H3 * (-L[2] / L[1])), det = M[0][0] * M[1][1] - M[0][1] * M[1][0]; A = (c0 * M[1][1] - M[0][1] * c1) / det; B = (M[0][0] * c1 - c0 * M[1][0]) / det; }
      if (A * A + B * B > .78) { ok = false; break; }
    }
    if (ok) break;
  }
  // the two layers of the disc: what the lit side and the far side have torn (1 = hole)
  const nf1 = bcNoise(seed), nf2 = bcNoise(seed ^ 0x9e3779b9), nb1 = bcNoise(seed ^ 0x85ebca6b), nb2 = bcNoise(seed ^ 0xc2b2ae35), FH = new Uint8Array(S * S), BH = new Uint8Array(S * S);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const a = (i + .5) / (S / 2) - 1, b = (j + .5) / (S / 2) - 1; if (a * a + b * b > 1.02) continue;
    const [gx, gz] = ground(a, b), bi = ((gx - x0) * (BG / 3.4) + BG / 2) | 0, bj = ((gz - z0) * (BG / 3.4) + BG / 2) | 0, isBird = bi >= 0 && bj >= 0 && bi < BG && bj < BG && bird[bj * BG + bi] === 1;
    const f = .6 * nf1(a * 7 + 9, b * 7 + 3) + .4 * nf2(a * 17 + 5, b * 17 + 11), g = .6 * nb1(a * 7 + 31, b * 7 + 17) + .4 * nb2(a * 17 + 2, b * 17 + 29);
    const fh = f > .56, bh = g > .56 && !fh;                                 // a hole on one layer only (never both, outside the bird)
    FH[j * S + i] = isBird ? 1 : fh ? 1 : 0; BH[j * S + i] = isBird ? 1 : bh ? 1 : 0;
  }
  // the cube map of the ball: each texel, a direction in the moon's frame (target pose): its side (c < 0 = the lit side) and its (a, b)
  const C = 256, cube = new Uint8Array(6 * C * C);
  for (let f = 0; f < 6; f++) for (let v = 0; v < C; v++) for (let u = 0; u < C; u++) {
    const s = (u + .5) / (C / 2) - 1, t = (v + .5) / (C / 2) - 1; let x, y, z;
    switch (f) { case 0: x = 1; y = -t; z = -s; break; case 1: x = -1; y = -t; z = s; break; case 2: x = s; y = 1; z = t; break; case 3: x = s; y = -1; z = -t; break; case 4: x = s; y = -t; z = 1; break; default: x = -s; y = -t; z = -1; }
    const n = Math.hypot(x, y, z), a = x / n, b = y / n, c = z / n, i = Math.min(S - 1, ((a + 1) * S / 2) | 0), j = Math.min(S - 1, ((b + 1) * S / 2) | 0);
    cube[(f * C + v) * C + u] = c < 0 ? FH[j * S + i] : BH[j * S + i];
  }
  return { cube, C, bird, k, x0, z0, BG };
}
function bcHole(P0, P1, P2) {                                               // is the point (unit vector) a hole?
  const cu = BC.cube.cube, C = BC.cube.C, ax = Math.abs(P0), ay = Math.abs(P1), az = Math.abs(P2); let f, s, t;
  if (ax >= ay && ax >= az) { if (P0 > 0) { f = 0; s = -P2 / ax; t = -P1 / ax; } else { f = 1; s = P2 / ax; t = -P1 / ax; } }
  else if (ay >= az) { if (P1 > 0) { f = 2; s = P0 / ay; t = P2 / ay; } else { f = 3; s = P0 / ay; t = -P2 / ay; } }
  else { if (P2 > 0) { f = 4; s = P0 / az; t = -P1 / az; } else { f = 5; s = -P0 / az; t = -P1 / az; } }
  const u = Math.min(C - 1, ((s + 1) * C / 2) | 0), v = Math.min(C - 1, ((t + 1) * C / 2) | 0); return cu[(f * C + v) * C + u] === 1;
}

(function () {
  const el = document.createElement('div'); el.id = 'bongchim'; el.hidden = true;
  el.innerHTML = '<canvas id="bongCv"></canvas><button id="bongX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#bongX');
  const ball = document.createElement('canvas'); ball.width = BC_S * 2 + 4; ball.height = BC_S * 2 + 4; const bg = ball.getContext('2d'), bImg = bg.createImageData(ball.width, ball.height);
  const gImg = g.createImageData(BC_W, BC_H - BC_GY + 40);                 // the ground, drawn at half resolution into a small canvas and scaled up
  const gl = document.createElement('canvas'); gl.width = BC_W / 2; gl.height = (BC_H - (BC_GY - 40)) / 2; const glx = gl.getContext('2d'), glImg = glx.createImageData(gl.width, gl.height);
  let st = null, raf = 0, last = 0;
  const size = () => { const k = Math.min(innerWidth * .96 / BC_W, innerHeight * .94 / BC_H), d = Math.min(2, devicePixelRatio || 1); cv2.style.width = BC_W * k + 'px'; cv2.style.height = BC_H * k + 'px'; cv2.width = Math.round(BC_W * k * d); cv2.height = Math.round(BC_H * k * d); st && (st.k = k * d); };
  const stars = Array.from({ length: 46 }, (_, i) => [(i * 97 % 340) + .5, (i * 53 % 300) + .5, .6 + (i % 4) * .3]);
  function renderBall(W) {                                                   // W: sphere → world
    const d = bImg.data, n = ball.width, Wt = bcT(W), L = BC_LW; let q = 0;
    for (let py = 0; py < n; py++) for (let px = 0; px < n; px++, q += 4) {
      const x = (px - n / 2 + .5) / BC_S, y = -(py - n / 2 + .5) / BC_S, r2 = x * x + y * y;
      if (r2 > 1) { d[q + 3] = 0; continue; }
      const z = Math.sqrt(1 - r2), P0 = Wt[0] * x + Wt[1] * y + Wt[2] * z, P1 = Wt[3] * x + Wt[4] * y + Wt[5] * z, P2 = Wt[6] * x + Wt[7] * y + Wt[8] * z;
      if (!bcHole(P0, P1, P2)) {                                              // paper, shaded by the moon
        const lit = Math.max(0, -(x * L[0] + y * L[1] + z * L[2])), sh = .2 + .8 * lit, rim = 1 - .45 * Math.pow(1 - z, 2);
        d[q] = (206 * sh + 18) * rim; d[q + 1] = (206 * sh + 22) * rim; d[q + 2] = (190 * sh + 40) * rim; d[q + 3] = 255; continue;
      }
      const F0 = Wt[0] * x + Wt[1] * y - Wt[2] * z, F1 = Wt[3] * x + Wt[4] * y - Wt[5] * z, F2 = Wt[6] * x + Wt[7] * y - Wt[8] * z;   // through the hole: the far wall, seen from inside
      if (bcHole(F0, F1, F2)) { d[q + 3] = 0; continue; }                     // a hole there too: the sky
      d[q] = 38; d[q + 1] = 40; d[q + 2] = 56; d[q + 3] = 255;
    }
    bg.putImageData(bImg, 0, 0);
  }
  function renderGround(W) {                                                 // the lit ground and the ball's shadow with the spots of light
    const d = glImg.data, w = gl.width, h = gl.height, L = BC_LW, Wt = bcT(W), y0 = BC_GY - 40; let lit = 0;
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const sx = px * 2 + 1, sy = y0 + py * 2 + 1, gx = (sx - BC_CX) / BC_S, gz = (sy - BC_GY) / (BC_S * BC_GS);
      // from the ground point towards the moon (-L): through the ball?
      const ux = -L[0], uy = -L[1], uz = -L[2], ox = gx, oy = -BC_H3, oz = gz, b = ux * ox + uy * oy + uz * oz, c = ox * ox + oy * oy + oz * oz - 1, disc = b * b - c;
      let v;
      if (disc <= 0) v = 1;                                                    // the moon reaches here freely
      else {
        const sq = Math.sqrt(disc), t1 = -b - sq, t2 = -b + sq;                // the way the light comes: it meets the ball at t2 first, leaves at t1
        const A0 = ox + ux * t1, A1 = oy + uy * t1, A2 = oz + uz * t1, B0 = ox + ux * t2, B1 = oy + uy * t2, B2 = oz + uz * t2;
        const a0 = Wt[0] * A0 + Wt[1] * A1 + Wt[2] * A2, a1 = Wt[3] * A0 + Wt[4] * A1 + Wt[5] * A2, a2 = Wt[6] * A0 + Wt[7] * A1 + Wt[8] * A2;
        const b0 = Wt[0] * B0 + Wt[1] * B1 + Wt[2] * B2, b1 = Wt[3] * B0 + Wt[4] * B1 + Wt[5] * B2, b2 = Wt[6] * B0 + Wt[7] * B1 + Wt[8] * B2;
        v = bcHole(a0, a1, a2) && bcHole(b0, b1, b2) ? 1 : 0;
      }
      const i = (py * w + px) * 4, fade = Math.max(0, 1 - Math.hypot(gx - .5, (gz - .9) / 1.3) / 3.4);
      if (v) { d[i] = 150 + 60 * fade; d[i + 1] = 168 + 56 * fade; d[i + 2] = 190 + 46 * fade; } else { d[i] = 22; d[i + 1] = 28; d[i + 2] = 44; } d[i + 3] = 255; lit += v;
    }
    glx.putImageData(glImg, 0, 0);
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
    // the moon, up in the corner the light comes from
    const mx = 58, my = 58; const gm = h.createRadialGradient(mx, my, 4, mx, my, 70); gm.addColorStop(0, 'rgba(255,248,214,.55)'); gm.addColorStop(1, 'rgba(255,248,214,0)'); h.fillStyle = gm; h.fillRect(0, 0, 160, 160);
    h.fillStyle = '#fff3c4'; h.beginPath(); h.arc(mx, my, 24, 0, 6.283); h.fill(); h.strokeStyle = 'rgba(29,25,21,.5)'; h.lineWidth = 1.5; h.stroke();
    // the ground, with the shadow
    if (st.dirty) { renderBall(st.W); renderGround(st.W); st.dirty = false; }
    h.imageSmoothingEnabled = true; h.drawImage(gl, 0, BC_GY - 40, BC_W, gl.height * 2);
    // the cord and the ball
    h.strokeStyle = 'rgba(232,236,255,.5)'; h.lineWidth = 1.2; h.beginPath(); h.moveTo(BC_CX, 0); h.lineTo(BC_CX, BC_CY - BC_S); h.stroke();
    h.globalAlpha = st.done ? Math.max(0, 1 - st.dt / 2.2) : 1; h.drawImage(ball, BC_CX - ball.width / 2, BC_CY - ball.height / 2); h.globalAlpha = 1;
    // the bird: out of its shadow and away
    if (st.done) {
      const T = st.dt, p = Math.min(1, T / 3.2), e = p * p * (3 - 2 * p), sx0 = BC_CX + (BC.cube.x0) * BC_S, sy0 = BC_GY + (BC.cube.z0) * BC_S * BC_GS;
      const bx = sx0 + (BC_W + 40 - sx0) * e * .95 + Math.sin(T * 3) * 6, by = sy0 - (sy0 + 40) * e - Math.sin(p * Math.PI) * 30, sc = .45 + 1.2 * Math.min(1, T / 1.6);
      h.globalAlpha = Math.min(1, T / .3); wing(h, bx, by, sc, .4 + .6 * Math.sin(T * 14), '#f2c640'); h.globalAlpha = 1;
    }
    h.fillStyle = 'rgba(0,0,0,0)';
  }
  const pt = e => { const r = cv2.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * BC_W, (e.clientY - r.top) / r.height * BC_H]; };
  cv2.addEventListener('pointerdown', e => { if (!st || st.done) return; st.drag = pt(e); st.vel = [0, 0]; try { cv2.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  cv2.addEventListener('pointermove', e => {
    if (!st || !st.drag || st.done) return; const [x, y] = pt(e), dx = x - st.drag[0], dy = y - st.drag[1]; st.drag = [x, y];
    turn(dx * .012, dy * .012); st.vel = [dx * .012, dy * .012];
  });
  const up = () => { if (st) st.drag = null; };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  function turn(ay, ax) {                                                    // a drag right turns the ball about the up axis, a drag down about the right axis
    const m = Math.hypot(ay, ax); if (m < 1e-6) return; st.W = bcMul(bcRot(ax / m, ay / m, 0, m), st.W); st.dirty = true;
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
    st.done = true; st.dt = 0; st.drag = null; st.W = BC_Q.slice(); st.dirty = true;       // it settles exactly on the target
    AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => { AU.chirp && AU.chirp(); }, 700); setTimeout(() => AU.pluck(91), 1400);
  }
  function finish() { const cb = st && st.cb; BC.open = false; el.hidden = true; cancelAnimationFrame(raf); st = null; if (cb) cb(); }
  addEventListener('keydown', e => { if (!BC.open) return; e.stopPropagation(); e.preventDefault(); if (e.code === 'Escape') skip(); }, true);
  function skip() { const cb = st && st.cb; BC.open = false; el.hidden = true; cancelAnimationFrame(raf); st = null; if (cb) cb(); }
  X.addEventListener('click', skip);
  addEventListener('resize', () => BC.open && size());
  window.bongOpen = function (cb) {
    if (BC.open) return; BC.open = true; el.hidden = false;
    setTimeout(() => {                                                       // the cube map takes a moment to make: the panel is up first
      if (!BC.open) return; BC.cube = bcBuild();
      // a pose well away from the target: turned by 1.2..2.6 radians about a random axis
      const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 2 - 1, n = Math.hypot(ax, ay, az) || 1, W0 = bcMul(bcRot(ax / n, ay / n, az / n, 1.3 + Math.random() * 1.4), BC_Q);
      st = { W: W0, dirty: true, k: 1, t: 0, drag: null, vel: [0, 0], hold: 0, done: false, dt: 0, cb }; BC.st = st; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
    }, 60);
  };
  if (window.__bongTest || /[?&]thu=cau/.test(location.search)) setTimeout(() => bongOpen(() => toast('Chim bay đi rồi! (thử)', 3)), 1800);
})();
