/* Hai tờ giấy, một cái chìa (owner's idea, on the branch giay-chia-khoa): two sheets of paper, each cut with holes. The back sheet
   stays put; the front one is dragged over it, a cell at a time. Light only passes where BOTH sheets have a hole there, and only
   one way of laying them makes those lit cells form the shape of a key. Laid right, the key lights up and the cage opens.
   No words on the screen (owner: no hints), only a small key picture to say what is wanted.
   Random every time (gkMake): where the key sits in each sheet, and every other hole, so a solution cannot be shared; the makers
   check that exactly one offset makes the key. giayOpen(done) opens it; done() runs when the key is made. */
const GK = { N: 14, C: 17, W: 340, H: 560, AX: 51, AY: 58, open: false, puz: null };
const GK_KEY = ['.#####.', '##...##', '##...##', '##...##', '.#####.', '...#...', '...#...', '...###.', '...#...', '...###.', '...#...'];   // 7 wide, 11 tall
const GK_KEYCELLS = []; GK_KEY.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') GK_KEYCELLS.push([x, y]); }));
const gkIn = (x, y) => x >= 0 && y >= 0 && x < GK.N && y < GK.N;
function gkMake() {
  const N = GK.N, ri = (a, b) => a + ((R() * (b - a + 1)) | 0);
  for (let tries = 0; tries < 500; tries++) {
    const KA = [ri(0, 7), ri(0, 3)], KB = [ri(0, 7), ri(0, 3)], g = [KA[0] - KB[0], KA[1] - KB[1]];
    if (Math.abs(g[0]) + Math.abs(g[1]) < 3) continue;                       // never already laid right
    const A = Array.from({ length: N }, () => Array.from({ length: N }, () => R() < .42)), B = Array.from({ length: N }, () => Array(N).fill(false));
    const isKeyA = (x, y) => GK_KEYCELLS.some(([a, b]) => KA[0] + a === x && KA[1] + b === y), isKeyB = (x, y) => GK_KEYCELLS.some(([a, b]) => KB[0] + a === x && KB[1] + b === y);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (isKeyA(x, y)) A[y][x] = true;
    for (let v = 0; v < N; v++) for (let u = 0; u < N; u++) {
      if (isKeyB(u, v)) { B[v][u] = true; continue; }
      const mx = u + g[0], my = v + g[1];
      B[v][u] = gkIn(mx, my) && A[my][mx] ? false : R() < .52;                // where it would line up with a hole of the back sheet, no hole: only the key is lit
    }
    const P = { A, B, g, keyCells: GK_KEYCELLS.map(([a, b]) => [KA[0] + a, KA[1] + b]) };
    let right = 0;
    for (let gx = -13; gx <= 13; gx++) for (let gy = -13; gy <= 13; gy++) if (gkIsKey(P, gx, gy)) right++;
    if (right === 1 && gkIsKey(P, g[0], g[1])) return P;
  }
  return null;
}
// the lit cells (in the back sheet's grid) when the front sheet's corner is gx, gy cells from the back sheet's corner
function gkLit(P, gx, gy) {
  const out = [];
  for (let j = 0; j < GK.N; j++) for (let i = 0; i < GK.N; i++) { const u = i - gx, v = j - gy; if (gkIn(u, v) && P.A[j][i] && P.B[v][u]) out.push([i, j]); }
  return out;
}
function gkIsKey(P, gx, gy) {
  const lit = gkLit(P, gx, gy); if (lit.length !== P.keyCells.length) return false;
  const set = new Set(P.keyCells.map(([x, y]) => x + ',' + y)); return lit.every(([x, y]) => set.has(x + ',' + y));
}

(function () {
  const el = document.createElement('div'); el.id = 'giay'; el.hidden = true;
  el.innerHTML = '<canvas id="giayCv"></canvas><button id="giayX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#giayX');
  let st = null;                                                             // { gx, gy, drag, t, done, cb, hold }
  const C = GK.C, SZ = GK.N * C;
  function size() {
    const k = Math.min(innerWidth * .94 / GK.W, innerHeight * .9 / GK.H), d = Math.min(2, devicePixelRatio || 1);
    cv2.style.width = GK.W * k + 'px'; cv2.style.height = GK.H * k + 'px'; cv2.width = Math.round(GK.W * k * d); cv2.height = Math.round(GK.H * k * d); st && (st.k = k * d);
  }
  const INKC = '#1d1915', PAPA = '#e9dcb4', PAPB = '#dba28e', DARK = '#2a221d', GOLD = '#f2c640';
  function keyIcon(h, x, y, s, col) {                                         // the little key picture: what is wanted
    h.save(); h.translate(x, y); h.scale(s, s); h.fillStyle = col; h.strokeStyle = INKC; h.lineWidth = 1.6;
    h.beginPath(); h.arc(-12, 0, 7, 0, 6.283); h.fill(); h.stroke(); h.fillStyle = PAPA; h.beginPath(); h.arc(-12, 0, 2.6, 0, 6.283); h.fill(); h.stroke();
    h.fillStyle = col; h.beginPath(); h.rect(-5, -2.4, 24, 4.8); h.fill(); h.stroke(); h.beginPath(); h.rect(11, 2.4, 3.6, 6); h.rect(16, 2.4, 3.6, 4); h.fill(); h.stroke(); h.restore();
  }
  function sheet(h, ox, oy, holes, col, lit) {
    h.fillStyle = col; h.strokeStyle = INKC; h.lineWidth = 2; h.fillRect(ox, oy, SZ, SZ);
    h.fillStyle = DARK;
    for (let j = 0; j < GK.N; j++) for (let i = 0; i < GK.N; i++) if (holes[j][i]) h.fillRect(ox + i * C + 1.5, oy + j * C + 1.5, C - 3, C - 3);
    h.strokeRect(ox, oy, SZ, SZ);
    h.strokeStyle = 'rgba(29,25,21,.18)'; h.lineWidth = 1; h.beginPath(); for (let k = 1; k < GK.N; k++) { h.moveTo(ox + k * C, oy); h.lineTo(ox + k * C, oy + SZ); h.moveTo(ox, oy + k * C); h.lineTo(ox + SZ, oy + k * C); } h.stroke();
  }
  function draw() {
    if (!st) return; const P = GK.puz, h = g;
    h.setTransform(st.k, 0, 0, st.k, 0, 0); h.clearRect(0, 0, GK.W, GK.H);
    h.fillStyle = '#3a2d1e'; h.strokeStyle = INKC; h.lineWidth = 3; h.fillRect(0, 0, GK.W, GK.H); h.strokeRect(1.5, 1.5, GK.W - 3, GK.H - 3);
    keyIcon(h, GK.W / 2, 28, 1.6, st.done ? GOLD : '#c9a24a');
    // the back sheet (fixed), the front sheet (dragged, a cell at a time) and the lit cells where both are cut
    sheet(h, GK.AX, GK.AY, P.A, PAPA);
    const bx = GK.AX + st.gx * C, by = GK.AY + st.gy * C;
    h.save(); h.shadowColor = 'rgba(0,0,0,.35)'; h.shadowBlur = 8; h.shadowOffsetY = 3; sheet(h, bx, by, P.B, PAPB); h.restore();
    const lit = gkLit(P, st.gx, st.gy), pulse = st.done ? .75 + .25 * Math.sin(st.t * 9) : 1;
    for (const [i, j] of lit) { const x = GK.AX + i * C, y = GK.AY + j * C; h.fillStyle = `rgba(242,198,64,${pulse})`; h.fillRect(x + 1.5, y + 1.5, C - 3, C - 3); if (st.done) { h.fillStyle = 'rgba(255,250,220,.5)'; h.fillRect(x + 4, y + 4, C - 9, C - 9); } }
    if (st.done) { const a = Math.min(1, st.t * 2); h.fillStyle = `rgba(242,198,64,${.18 * a})`; h.fillRect(0, 0, GK.W, GK.H); }
  }
  function toLogical(e) { const r = cv2.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * GK.W, (e.clientY - r.top) / r.height * GK.H]; }
  function check() {
    if (!st || st.done) return;
    if (gkIsKey(GK.puz, st.gx, st.gy)) { st.hold = (st.hold || 0) + 1; } else st.hold = 0;
  }
  function win() { st.done = true; st.t = 0; st.drag = null; AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => AU.pluck(91), 320); setTimeout(() => AU.stamp(), 520); setTimeout(() => close(true), 2300); }
  cv2.addEventListener('pointerdown', e => {
    if (!st || st.done) return; const [px, py] = toLogical(e), bx = GK.AX + st.gx * C, by = GK.AY + st.gy * C;
    if (px < bx || px > bx + SZ || py < by || py > by + SZ) return;
    st.drag = { px, py, gx: st.gx, gy: st.gy }; try { cv2.setPointerCapture(e.pointerId); } catch (err) {} AU.click(); e.preventDefault();
  });
  cv2.addEventListener('pointermove', e => {
    if (!st || !st.drag) return; const [px, py] = toLogical(e), d = st.drag;
    const gx = Math.max(-12, Math.min(12, d.gx + Math.round((px - d.px) / C))), gy = Math.max(-13, Math.min(16, d.gy + Math.round((py - d.py) / C)));
    if (gx !== st.gx || gy !== st.gy) { st.gx = gx; st.gy = gy; AU.click(); check(); if (st.hold) st.matchT = performance.now(); }
  });
  const up = () => { if (!st || !st.drag) return; st.drag = null; if (gkIsKey(GK.puz, st.gx, st.gy)) win(); };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  addEventListener('keydown', e => {                                          // while it is open, the game below hears nothing; arrows nudge the front sheet
    if (!GK.open) return; e.stopPropagation(); e.preventDefault();
    if (e.code === 'Escape') { close(false); return; }
    if (!st || st.done) return; const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }[e.code];
    if (d) { st.gx = Math.max(-12, Math.min(12, st.gx + d[0])); st.gy = Math.max(-13, Math.min(16, st.gy + d[1])); AU.click(); if (gkIsKey(GK.puz, st.gx, st.gy)) win(); }
  }, true);
  X.addEventListener('click', () => close(false));
  let raf = 0, last = 0;
  function loop(ts) { if (!GK.open) return; const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; if (st) st.t += dt; draw(); raf = requestAnimationFrame(loop); }
  function close(solved) {
    if (!GK.open) return; GK.open = false; el.hidden = true; cancelAnimationFrame(raf); const cb = st && st.cb; st = null;
    if (solved && cb) cb();
    if (window.__giayTest) setTimeout(() => { GK.puz = null; giayOpen(() => toast('Lồng chim mở! Thử cặp giấy mới nhé.', 3)); }, 1400);   // (the test copy: a fresh pair of sheets again and again)
  }
  addEventListener('resize', () => GK.open && size());
  window.giayOpen = function (cb) {
    if (GK.open) return;
    if (!GK.puz) GK.puz = gkMake();
    if (!GK.puz) { if (cb) cb(); return; }                                    // (cannot happen: the maker always finds one)
    GK.open = true; el.hidden = false; st = { gx: 0, gy: 15, drag: null, t: 0, done: false, cb, k: 1, hold: 0 }; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
  };
  window.giayReset = () => { GK.puz = null; };                                // a fresh pair of sheets (tests)
  if (window.__giayTest || /[?&]thu=giay/.test(location.search)) setTimeout(() => giayOpen(() => toast('Lồng chim mở! Thử cặp giấy mới nhé.', 3)), 1800);
})();
