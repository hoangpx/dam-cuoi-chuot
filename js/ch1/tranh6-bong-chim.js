/* Tranh 6 · Bắc Kim Thang, the opening (owner's idea, demo): a strange lump hung under the moon, many layers of torn paper stacked inside one another, full of holes
   and with no shape that means anything. The player turns it any way with a finger or the mouse. The moon shines through the holes and the shadow of the lump falls
   on the ground; the light gets through only where the holes of ALL the layers line up. Turn it just right, for one moment, and those spots of light make the shape of
   a bird on the ground: the bird lifts out of its own shadow and flies up. Then the tranh begins.
   How it is built (a small 3D of its own, drawn with the canvas, no library):
   - the lump is BC_N sheets of paper (plates), each with its own wobbly outline, size, a small tilt and a place along the light's way. Each plate has a texture:
     paper with holes. In the moon's own frame (x, y across the light, z along it) a ray goes through the point (x, y) of every plate, so at the TARGET pose the
     light gets through exactly where every plate has a hole: the bird is a hole in every plate, and everywhere else one plate is chosen at random (a patch of the
     ground belongs to one plate, cell()) to be solid there, the other plates get random holes. So the bird is in no single plate but in all of them together.
   - W = the pose (3×3, lump → world); the player's drag turns it about the screen's axes. Looking from the front, the plates are drawn far to near, each as a
     flat sheet (an orthographic view of a flat thing is an affine map, so setTransform + drawImage, smooth), with a dark copy under it for the thickness.
   - the shadow is the same plates projected along the moon's light on to the ground (also an affine map), drawn dark, so the lit spots are the holes common to all.
   - the target is reached when W is within 4° of the target for a quarter of a second: the bird is drawn, rises out of the shadow and flies off; then the cb.
   Random every time: the pose it starts in, the plates and their holes are new each time. */
const BC = { open: false, tex: null, st: null };
const BC_W = 340, BC_H = 560, BC_CX = 170, BC_CY = 190, BC_S = 88, BC_GY = 452, BC_GS = 0.42, BC_H3 = 1.5, BC_N = 6, BC_T = 320, BC_GTOP = BC_GY - 44;   // canvas; ball centre; px per unit; ground line, its squash, the lump's height over it (units); plates and texture size
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
const bcAngleFromI = R => Math.acos(Math.max(-1, Math.min(1, (R[0] + R[4] + R[8] - 1) / 2)));
function bcNoise(seed) {                                                    // smooth value noise on a wrapping grid, 0..1
  const G = 64, v = new Float32Array(G * G); let a = seed >>> 0; for (let i = 0; i < v.length; i++) { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; v[i] = a / 4294967296; }
  return (x, y) => { x = ((x % G) + G) % G; y = ((y % G) + G) % G; const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    return (v[y0 * G + x0] * (1 - sx) + v[y0 * G + x1] * sx) * (1 - sy) + (v[y1 * G + x0] * (1 - sx) + v[y1 * G + x1] * sx) * sy; };
}
const bcStep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// the bird seen from above, in the moon's x, y (head up the picture, wings spread, a fanned tail); k scales it
function bcBirdPath(p, k) {
  const tri = pts => { pts.forEach(([x, z], i) => { i ? p.lineTo(x * k, z * k) : p.moveTo(x * k, z * k); }); p.closePath(); };
  tri([[0, -.62], [.1, -.5], [.13, -.3], [.1, 0], [.12, .3], [.2, .62], [.06, .52], [0, .66], [-.06, .52], [-.2, .62], [-.12, .3], [-.1, 0], [-.13, -.3], [-.1, -.5]]);
  for (const s of [-1, 1]) tri([[s * .1, -.3], [s * .4, -.42], [s * .95, -.34], [s * 1.04, -.2], [s * .8, -.14], [s * .86, -.02], [s * .55, .06], [s * .1, .16]]);
  tri([[-.03, -.74], [.03, -.74], [0, -.62]]);
}
function bcBuild() {
  const seed = (Math.random() * 4294967295) >>> 0, rnd = (() => { let a = seed ^ 0x5bd1e995; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; })();
  const T = BC_T, N = BC_N;
  // the bird as a smooth alpha picture over x, y in -1.1…1.1
  const BG = 384, bc = document.createElement('canvas'); bc.width = bc.height = BG; const bx = bc.getContext('2d', { willReadFrequently: true });
  bx.setTransform(BG / 2.2, 0, 0, BG / 2.2, BG / 2, BG / 2); bx.fillStyle = '#000'; const bp = new Path2D(); bcBirdPath(bp, .78); bx.fill(bp);
  const bd = bx.getImageData(0, 0, BG, BG).data, birdA = (x, y) => { const i = Math.round((x + 1.1) / 2.2 * BG - .5), j = Math.round((y + 1.1) / 2.2 * BG - .5); return i < 0 || j < 0 || i >= BG || j >= BG ? 0 : bd[(j * BG + i) * 4 + 3] / 255; };
  // which plate is solid over each patch of ground: uneven cells, each given to one plate (small ones, so no plate shows the whole outline of the bird)
  const wx = bcNoise(seed ^ 0x27d4eb2f), wy = bcNoise(seed ^ 0x165667b1), cell = (x, y) => {
    const u = x * 4.2 + (wx(x * 2.1 + 5, y * 2.1) - .5) * 2.2, v = y * 4.2 + (wy(x * 2.1, y * 2.1 + 9) - .5) * 2.2, i = Math.floor(u), j = Math.floor(v);
    let h = Math.imul(i * 73856093 ^ j * 19349663 ^ seed, 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return h % N; };
  const plates = [];
  for (let n = 0; n < N; n++) {
    const rad = 1.18 + rnd() * .22, tx = (rnd() - .5) * .24, ty = (rnd() - .5) * .24, U = [1, 0, tx], V = [0, 1, ty], c = [(rnd() - .5) * .16, (rnd() - .5) * .16, -1 + n * (2 / (N - 1)) + (rnd() - .5) * .08];
    const hn1 = bcNoise(seed + n * 7919 + 1), hn2 = bcNoise(seed + n * 104729 + 2), on = bcNoise(seed + n * 31 + 3), pn = bcNoise(seed + n * 977 + 4), thr = .5 + rnd() * .08;
    const cv = document.createElement('canvas'); cv.width = cv.height = T; const cx = cv.getContext('2d'), img = cx.createImageData(T, T), d = img.data;
    for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) {
      const u = (i + .5) / T * 2 - 1, v = (j + .5) / T * 2 - 1, r = Math.hypot(u, v), th = Math.atan2(v, u), rr = .84 + .16 * on(Math.cos(th) * 2.2 + 8, Math.sin(th) * 2.2 + 8);
      const x = c[0] + u * rad, y = c[1] + v * rad, q = (i + j * T) * 4;
      let o = bcStep(rr, rr - .02, r);                                         // inside the wobbly outline
      if (o > 0) {
        const mine = cell(x, y) === n || cell(x + .05, y) === n || cell(x - .05, y) === n || cell(x, y + .05) === n || cell(x, y - .05) === n;      // solid here (a little over the seam into the next cell)
        const hn = .62 * hn1(x * 3.1 + 11, y * 3.1 + 4) + .38 * hn2(x * 7.3 + 3, y * 7.3 + 21), hole = bcStep(thr - .035, thr + .035, hn);
        o *= mine ? 1 : 1 - hole; o *= 1 - birdA(x, y);                        // the bird is a hole in every plate
      }
      const m = pn(x * 9 + 2, y * 9 + 7), tone = .9 + .12 * m - .06 * (n % 2);
      d[q] = Math.min(255, 214 * tone); d[q + 1] = Math.min(255, 208 * tone); d[q + 2] = Math.min(255, 186 * tone); d[q + 3] = Math.round(o * 255);
    }
    cx.putImageData(img, 0, 0);
    const sh = document.createElement('canvas'); sh.width = sh.height = T; const sx = sh.getContext('2d'); sx.drawImage(cv, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#161c2e'; sx.fillRect(0, 0, T, T);   // the same sheet, dark: its shadow
    plates.push({ c, U, V, rad, cv, sh });
  }
  return { plates };
}

(function () {
  const el = document.createElement('div'); el.id = 'bongchim'; el.hidden = true;
  el.innerHTML = '<canvas id="bongCv"></canvas><button id="bongX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#bongX');
  const SC = 2, BW = 300, ballC = document.createElement('canvas'), bgx = ballC.getContext('2d'), tmp = document.createElement('canvas'), tg = tmp.getContext('2d');
  ballC.width = ballC.height = tmp.width = tmp.height = BW * SC;
  const GH = BC_H - BC_GTOP, gC = document.createElement('canvas'), ggx = gC.getContext('2d'); gC.width = BC_W * SC; gC.height = GH * SC;
  const L = BC_LW, kx = L[0] / L[1], kz = L[2] / L[1];
  let st = null, raf = 0, last = 0;
  const size = () => { const k = Math.min(innerWidth * .96 / BC_W, innerHeight * .94 / BC_H), d = Math.min(2, devicePixelRatio || 1); cv2.style.width = BC_W * k + 'px'; cv2.style.height = BC_H * k + 'px'; cv2.width = Math.round(BC_W * k * d); cv2.height = Math.round(BC_H * k * d); st && (st.k = k * d); };
  const stars = Array.from({ length: 46 }, (_, i) => [(i * 97 % 340) + .5, (i * 53 % 300) + .5, .6 + (i % 4) * .3]);
  const proj = w => [w[0] - kx * (w[1] + BC_H3), w[2] - kz * (w[1] + BC_H3)];       // a point of the lump (relative to its centre) → where the moon's light puts it on the ground
  const gpos = p => [BC_CX + p[0] * BC_S, BC_GY + p[1] * BC_S * BC_GS];
  // each plate's texture-to-world frame under the pose W: the world place of texel (0, 0), the steps along the texture's x and y, and the plate's normal
  function frame(P, W) {
    const k = 2 * P.rad / BC_T, o = bcApp(W, [P.c[0] - P.rad * (P.U[0] + P.V[0]), P.c[1] - P.rad * (P.U[1] + P.V[1]), P.c[2] - P.rad * (P.U[2] + P.V[2])]);
    return { o, ex: bcApp(W, [P.U[0] * k, P.U[1] * k, P.U[2] * k]), ey: bcApp(W, [P.V[0] * k, P.V[1] * k, P.V[2] * k]), n: bcApp(W, [-P.U[2], -P.V[2], 1]) };
  }
  function renderBall(W) {
    const h = bgx; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, ballC.width, ballC.height);
    const list = BC.tex.plates.map(P => ({ P, f: frame(P, W), z: bcApp(W, P.c)[2] })).sort((a, b) => a.z - b.z);
    for (const { P, f } of list) {
      const nrm = f.n, nl = Math.hypot(...nrm) || 1, lit = Math.abs((nrm[0] * L[0] + nrm[1] * L[1] + nrm[2] * L[2]) / nl), back = nrm[2] < 0;
      const put = (dz, shade, col) => {                                        // the sheet drawn once, shifted along its normal by dz, with a coat of shade
        const sx = BC_S * SC, ox = BW * SC / 2 + sx * (f.o[0] + nrm[0] / nl * dz), oy = BW * SC / 2 - sx * (f.o[1] + nrm[1] / nl * dz), t = tg;
        t.globalCompositeOperation = 'source-over'; t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, tmp.width, tmp.height);
        t.setTransform(sx * f.ex[0], -sx * f.ex[1], sx * f.ey[0], -sx * f.ey[1], ox, oy); t.imageSmoothingQuality = 'high'; t.drawImage(P.cv, 0, 0);
        t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'source-atop'; t.fillStyle = col || 'rgba(10,12,32,' + shade + ')'; t.fillRect(0, 0, tmp.width, tmp.height); t.globalCompositeOperation = 'source-over';
        h.drawImage(tmp, 0, 0);
      };
      put(back ? .09 : -.09, 0, '#1d1915');                                    // its thickness: the dark edge under it
      put(0, .78 * (1 - (.3 + .7 * lit)) + (back ? .18 : 0));                  // the face, darker when turned from the moon
    }
  }
  function renderGround(W) {
    const h = ggx; h.setTransform(SC, 0, 0, SC, 0, -BC_GTOP * SC); h.clearRect(0, BC_GTOP, BC_W, GH);
    const gr = h.createLinearGradient(0, BC_GTOP, 0, BC_H); gr.addColorStop(0, '#9aa8c4'); gr.addColorStop(1, '#c4d0e2'); h.fillStyle = gr; h.fillRect(0, BC_GTOP, BC_W, GH);
    h.imageSmoothingQuality = 'high';
    for (const P of BC.tex.plates) {                                           // every sheet's shadow, dark: what is left lit is where all of them have holes
      const f = frame(P, W), o = gpos(proj(f.o)), ax = f.ex[0] - kx * f.ex[1], az = f.ex[2] - kz * f.ex[1], bx = f.ey[0] - kx * f.ey[1], bz = f.ey[2] - kz * f.ey[1];
      h.setTransform(SC * BC_S * ax, SC * BC_S * BC_GS * az, SC * BC_S * bx, SC * BC_S * BC_GS * bz, SC * o[0], SC * (o[1] - BC_GTOP)); h.drawImage(P.sh, 0, 0);
    }
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
    if (st.dirty) { renderBall(st.W); renderGround(st.W); st.dirty = false; }
    h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(gC, 0, BC_GTOP, BC_W, GH);
    h.strokeStyle = 'rgba(232,236,255,.5)'; h.lineWidth = 1.2; h.beginPath(); h.moveTo(BC_CX, 0); h.lineTo(BC_CX, BC_CY - 100); h.stroke();      // the cord
    h.globalAlpha = st.done ? Math.max(0, 1 - st.dt / 2.2) : 1; h.drawImage(ballC, BC_CX - BW / 2, BC_CY - BW / 2, BW, BW); h.globalAlpha = 1;
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
  function turn(ay, ax) {                                                    // a drag right turns the lump about the up axis, a drag down about the right axis
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
  addEventListener('keydown', e => { if (!BC.open) return; e.stopPropagation(); e.preventDefault(); if (e.code === 'Escape') finish(); }, true);
  X.addEventListener('click', finish);
  addEventListener('resize', () => BC.open && size());
  window.bongOpen = function (cb) {
    if (BC.open) return; BC.open = true; el.hidden = false;
    setTimeout(() => {                                                       // the plates take a moment to make: the panel is up first
      if (!BC.open) return; BC.tex = bcBuild();
      // a pose well away from the target: turned by 1.3..2.7 radians about a random axis
      const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 2 - 1, n = Math.hypot(ax, ay, az) || 1, W0 = bcMul(bcRot(ax / n, ay / n, az / n, 1.3 + Math.random() * 1.4), BC_Q);
      st = { W: W0, dirty: true, k: 1, t: 0, drag: null, vel: [0, 0], hold: 0, done: false, dt: 0, cb }; BC.st = st; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
    }, 60);
  };
  if (window.__bongTest || /[?&]thu=cau/.test(location.search)) setTimeout(() => bongOpen(() => toast('Chim bay đi rồi! (thử)', 3)), 1800);
})();
