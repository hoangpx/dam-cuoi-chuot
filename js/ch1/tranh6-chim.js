/* ---------- Bắc Kim Thang · chim le le và bìm bịp bị trói (owner, 2026-10-08) ----------
   On the far bank after the bridge hangs a banyan with the two little birds tied up among hawks. Tap it: a rope puzzle (like the
   owner's reference): birds are knots, ropes join them, and some ropes end in a ring on the branch below. Cut ropes by swiping
   across them (or tapping one). Birds left with no rope that leads to a ring are free and fly off. Both friends must go free
   while every hawk stays tied: a hawk that gets free eats them, and the stage starts over at once. Three stages, each a bit
   bigger (made by the offline generator scratch/gen-chim.js: solvable, few ways to win). The gate opens only after this.
   Harder (owner: "dễ quá"): there are also KNOTS (rope junctions without a bird), and the scissors may only cut a few times
   (T6B_STAGES[].cuts). Cutting every rope on the two friends costs too many cuts, so the free region has to be widened over knots,
   as long as no hawk loses its last way to a ring. 5 stages, the last one very hard. Out of cuts = start the stage over.
   T6B_REQUIRED = false makes it optional. Saved in SAVE.t6.birds. */
const T6B_REQUIRED = true;
const T6B = { st: 'off', k: 0, done: false, stage: 0, E: [], B: [], cuts: [], t: 0, how: 0, px: null, py: null, moved: 0, left: 0 };
const t6bRy = () => T6B_STAGES[T6B.stage].ry;                                       // where the rings hang: below the lowest bird of the stage
const T6B_STAGES = [
  { cuts: 3, bs: 1, ry: 290, n: [[64, 57, 'h'], [104, 143, 'h'], [62, 214, 'h'], [169, 60, 'h'], [204, 135, 'f'], [168, 217, 'f']], e: [[0, 1], [0, 3], [1, 5], [4, 5], [3, 4], [1, 2], [5, -1], [2, -1]] },
  { cuts: 3, bs: .95, ry: 277, n: [[352, 123, 'h'], [312, 53, 'k'], [228, 52, 'h'], [94, 121, 'k'], [314, 207, 'h'], [184, 126, 'f'], [142, 50, 'k'], [45, 197, 'f']], e: [[0, 1], [5, 6], [3, 7], [0, 4], [1, 2], [2, 5], [2, 6], [3, 6], [7, -1], [4, -1]] },
  { cuts: 5, bs: .85, ry: 353, n: [[358, 283, 'f'], [233, 45, 'k'], [175, 131, 'f'], [319, 45, 'k'], [401, 200, 'h'], [134, 48, 'k'], [271, 124, 'k'], [143, 206, 'h'], [90, 127, 'h'], [180, 283, 'h'], [352, 124, 'k'], [100, 277, 'h']], e: [[4, 10], [1, 3], [1, 5], [9, 11], [2, 7], [7, 8], [2, 8], [1, 2], [0, 4], [6, 10], [2, 5], [1, 6], [3, 10], [7, 11], [2, 6], [9, -1], [0, -1], [4, -1]] },
  { cuts: 7, bs: .72, ry: 428, n: [[402, 350, 'k'], [177, 131, 'h'], [272, 129, 'h'], [397, 50, 'h'], [231, 47, 'k'], [396, 197, 'k'], [364, 130, 'h'], [313, 358, 'k'], [311, 45, 'k'], [317, 201, 'f'], [356, 280, 'f'], [227, 203, 'h'], [142, 203, 'h'], [269, 276, 'k'], [443, 273, 'k']], e: [[3, 6], [0, 10], [10, 13], [11, 12], [5, 14], [2, 4], [1, 2], [7, 13], [6, 9], [3, 8], [9, 11], [10, 14], [1, 12], [4, 8], [0, 7], [5, 10], [2, 6], [0, 14], [5, 9], [1, 4], [5, 6], [2, 11], [1, 11], [2, 9], [11, 13], [7, 10], [2, 8], [13, -1], [10, -1], [12, -1]] },
  { cuts: 3, bs: .6, ry: 429, n: [[184, 122, 'k'], [134, 53, 'k'], [315, 49, 'h'], [277, 278, 'k'], [313, 205, 'h'], [488, 203, 'h'], [359, 276, 'h'], [263, 125, 'k'], [619, 131, 'k'], [319, 353, 'h'], [441, 280, 'k'], [95, 121, 'f'], [408, 200, 'h'], [581, 52, 'k'], [532, 128, 'h'], [134, 359, 'k'], [227, 54, 'f'], [227, 352, 'h'], [179, 273, 'k']], e: [[10, 12], [8, 13], [3, 18], [0, 11], [0, 16], [3, 9], [6, 10], [3, 4], [6, 12], [17, 18], [1, 16], [15, 18], [2, 7], [13, 14], [0, 1], [0, 7], [4, 12], [8, 14], [7, 16], [15, 17], [3, 17], [2, 16], [1, 11], [4, 6], [5, 10], [5, 14], [4, 7], [17, -1], [9, -1], [15, -1]] },
  { cuts: 6, bs: .55, ry: 428, n: [[537, 131, 'f'], [628, 120, 'k'], [492, 352, 'h'], [136, 201, 'h'], [485, 203, 'k'], [182, 274, 'h'], [181, 125, 'k'], [139, 53, 'h'], [492, 47, 'k'], [318, 358, 'k'], [399, 207, 'k'], [221, 197, 'h'], [48, 46, 'h'], [584, 53, 'k'], [578, 206, 'k'], [227, 358, 'h'], [353, 274, 'h'], [361, 127, 'h'], [277, 280, 'f'], [620, 277, 'k'], [273, 130, 'h']], e: [[9, 18], [17, 20], [9, 15], [0, 1], [16, 18], [9, 16], [0, 4], [0, 8], [1, 14], [0, 13], [6, 7], [7, 12], [5, 15], [15, 18], [0, 14], [11, 18], [6, 11], [3, 11], [11, 20], [4, 14], [8, 13], [5, 18], [5, 11], [3, 6], [10, 16], [14, 19], [18, -1], [10, -1], [2, -1]] },
  { cuts: 4, bs: .5, ry: 430, n: [[313, 197, 'h'], [452, 121, 'k'], [139, 46, 'h'], [407, 352, 'h'], [668, 354, 'h'], [487, 48, 'k'], [449, 276, 'h'], [263, 129, 'k'], [491, 355, 'k'], [230, 202, 'k'], [531, 274, 'h'], [56, 53, 'h'], [175, 124, 'k'], [622, 121, 'f'], [534, 131, 'k'], [665, 55, 'k'], [43, 360, 'h'], [618, 277, 'h'], [716, 123, 'k'], [45, 207, 'k'], [309, 48, 'h'], [263, 278, 'h'], [134, 204, 'f'], [672, 201, 'h']], e: [[13, 23], [1, 14], [13, 18], [12, 22], [9, 21], [4, 17], [9, 12], [15, 18], [7, 12], [6, 8], [13, 15], [5, 14], [18, 23], [17, 23], [13, 14], [0, 7], [10, 17], [6, 10], [2, 12], [7, 20], [1, 5], [2, 11], [9, 22], [3, 8], [19, 22], [16, -1], [21, -1], [8, -1]] },
];

/* ---------- the birds ---------- */
let T6B_ART = null;
function t6bArt() {
  if (T6B_ART) return T6B_ART;
  // all face right, centred on the body; the rope coil is drawn over them in the view
  const hawk = part([-72, -42, 54, 34], a => {
    a.fk('dark', smooth([[-20, 4], [-56, 12], [-62, 22], [-24, 15]]), 2);
    a.fk('brown', ell(0, 0, 26, 18, -.25), 2.2);
    a.fk('tan', smooth([[-18, -8], [6, -15], [21, -3], [4, 12], [-16, 10]]), 1.8);
    a.key(lines([[-12, -2, 4, 2], [-8, 4, 8, 8]]), 1.2);
    a.fill('cream', ell(15, 6, 9, 8, .2));
    a.fk('brown', circ(23, -18, 11), 2.2);
    a.fk('yellow', smooth([[30, -21], [44, -17], [38, -8], [31, -12]]), 1.8);
    a.fk('yellow', circ(26, -21, 3.3), 1.2); a.ink(circ(26.5, -21, 1.5));
    a.key(lines([[20, -28, 31, -24]]), 2.4);
    a.key(lines([[-2, 17, -4, 27], [5, 17, 7, 27]]), 2.4);
  });
  const lele = part([-42, -30, 48, 30], a => {
    a.fk('straw', smooth([[-16, 4], [-32, -1], [-30, 10], [-14, 12]]), 1.6);
    a.fk('straw', ell(0, 2, 20, 13, -.15), 2);
    a.fill('cream', ell(3, 8, 13, 6, 0));
    a.fk('brown', smooth([[-12, -3], [6, -9], [15, 2], [-2, 10], [-12, 6]]), 1.6);
    a.fk('straw', circ(16, -12, 9), 2);
    a.fill('white', circ(19, -9, 4.6));
    a.fill('brown', smooth([[8, -14], [16, -22], [25, -16], [17, -15]]));
    a.fk('orange', smooth([[24, -12], [38, -10], [35, -4], [24, -7]]), 1.6);
    a.ink(circ(18, -14, 2.2));
    a.key(lines([[-2, 14, -3, 23], [6, 14, 7, 23]]), 2);
  });
  const bim = part([-82, -30, 54, 30], a => {
    a.fk('dark', smooth([[-16, 2], [-62, 12], [-68, 21], [-18, 13]]), 2);
    a.fk('dark', ell(0, 2, 22, 13, -.2), 2.2);
    a.fk('tan', smooth([[-14, -4], [8, -11], [21, 0], [4, 10], [-14, 6]]), 1.8);
    a.fk('dark', circ(19, -13, 9.5), 2.2);
    a.fk('ash', smooth([[27, -14], [42, -11], [28, -7]]), 1.6);
    a.fk('red', circ(21, -15, 3.5), 1.2); a.ink(circ(21.6, -15, 1.4));
    a.key(lines([[-2, 14, -3, 23], [6, 14, 7, 23]]), 2);
  });
  return (T6B_ART = { hawk, lele, bim });
}
ITEMS.chim = { name: 'chim bị trói', get part() { return ITEMS.chim.p || (ITEMS.chim.p = part([-24, -22, 24, 22], a => { a.fk('dark', ell(-2, 2, 13, 8, -.2), 2); a.fk('dark', circ(10, -6, 6), 2); a.fk('yellow', smooth([[15, -7], [24, -5], [15, -2]]), 1.4); a.key(lines([[-12, 4, -22, 10]]), 3); a.key(lines([[-14, -6, 12, 12], [-14, 12, 12, -6]]), 2); })); }, s: 1, cy: 0 };

/* ---------- the rules ---------- */
const t6bStage = () => T6B_STAGES[T6B.stage];
function t6bReset() {
  const S0 = t6bStage();
  T6B.E = S0.e.map(() => true); T6B.cuts = []; T6B.B = S0.n.map((p, i) => ({ free: false, fly: 0, vx: (i % 2 ? 1 : -1) * (40 + (i * 13) % 50), vy: -150 - (i * 17) % 60 }));
  T6B.t = 0; T6B.msg = ''; T6B.cutAny = false; T6B.left = S0.cuts;
  T6B.sol = T6B.stage === 0 ? S0.e.map((e, i) => i).filter(i => S0.e[i].some(v => v >= 0 && S0.n[v][2] === 'f')) : [];
}
// who is free now: a group of birds is free when no rope of it leads to a ring any more
function t6bEval() {
  const S0 = t6bStage(), n = S0.n.length, par = [...Array(n + 1).keys()], f = x => par[x] === x ? x : (par[x] = f(par[x]));
  S0.e.forEach(([a, b], i) => { if (T6B.E[i]) par[f(a)] = f(b < 0 ? n : b); });
  let hawkOut = false;
  for (let i = 0; i < n; i++) { const B = T6B.B[i]; if (!B.free && f(i) !== f(n)) { B.free = true; B.fly = 0; if (S0.n[i][2] === 'h') hawkOut = true; else if (S0.n[i][2] === 'f') AU.pluck(88 + (i % 3) * 3); } }
  if (hawkOut) { T6B.st = 'fail'; T6B.t = 0; T6B.msg = 'Diều hâu cũng thoát, nó ăn thịt hai chim nhỏ!'; AU.snort(); return; }
  if (S0.n.every((p, i) => p[2] !== 'f' || T6B.B[i].free)) { T6B.st = 'clear'; T6B.t = 0; AU.stamp(); return; }
  if (T6B.left <= 0) { T6B.st = 'fail'; T6B.t = 0; T6B.msg = 'Hết nhát kéo rồi, thử lại!'; AU.snort(); }
}
function t6bCut(i) {
  if (!T6B.E[i]) return false;
  const S0 = t6bStage(), [a, b] = S0.e[i], pa = S0.n[a], pb = b < 0 ? [pa[0], t6bRy()] : S0.n[b];
  T6B.E[i] = false; T6B.cutAny = true; T6B.left--; T6B.cuts.push({ ax: pa[0], ay: pa[1], bx: pb[0], by: b < 0 ? t6bRy() : pb[1], t: 0 }); AU.click(); AU.pluck(70 + (T6B.cuts.length % 5) * 3);
  t6bEval(); return true;
}
const t6bEnd = (i) => { const S0 = t6bStage(), [a, b] = S0.e[i]; return [S0.n[a], b < 0 ? [S0.n[a][0], t6bRy()] : S0.n[b]]; };
function t6bSegHit(p, q, a, b) {                                            // does the swipe p→q cross the rope a→b?
  const o = (x, y, z) => (y[0] - x[0]) * (z[1] - x[1]) - (y[1] - x[1]) * (z[0] - x[0]);
  return o(p, q, a) * o(p, q, b) < 0 && o(a, b, p) * o(a, b, q) < 0;
}
function t6bNear(p, a, b) {                                                 // distance from a point to a rope
  const dx = b[0] - a[0], dy = b[1] - a[1], k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy);
}
function t6bLay(v) {                                                        // board units → view units
  const S0 = t6bStage(), bw = Math.max(...S0.n.map(p => p[0])) + 70, bh = t6bRy() + 50, top = v.top + 100;
  const s = Math.min((v.W - 24) / bw, (v.H - top - 20) / bh, 1.4);
  return { s, x0: (v.W - bw * s) / 2, y0: top + Math.max(0, (v.H - top - 20 - bh * s) / 2), bw, bh };
}
const t6bP = (L, x, y) => [L.x0 + (x + 35) * L.s, L.y0 + y * L.s];

/* ---------- the entity: the banyan on the road, and the puzzle view over it ---------- */
function t6Chim(cx) {
  const hang = [[-92, -262, 'bim'], [-26, -292, 'hawk'], [52, -250, 'lele'], [112, -288, 'hawk'], [8, -214, 'hawk']];
  const e = { layer: 'bg', ax: cx, held: false, d: null,
    update(dt) {
      if (T6B.st === 'off') { if (this.held) { S.waitMove = false; this.held = false; } return; }
      S.waitMove = true; this.held = true; howtoInput();
      const v = t6View(), L = t6bLay(v);
      if (T6B.st === 'in') { T6B.k = Math.min(1, T6B.k + dt / .9); if (T6B.k >= 1) T6B.st = 'play'; return; }
      if (T6B.st === 'out') { T6B.k = Math.max(0, T6B.k - dt / .8); if (T6B.k <= 0) { T6B.st = 'off'; $('#hud').hidden = false; AU.musicLevel(.75); } return; }
      for (const B of T6B.B) if (B.free) B.fly += dt;
      for (const c of T6B.cuts) c.t += dt;
      T6B.t += dt;
      if (T6B.st === 'fail' && T6B.t > 2.6) { t6bReset(); T6B.st = 'play'; return; }           // start the stage over, right there
      if (T6B.st === 'clear' && T6B.t > 1.8) {
        if (T6B.stage < T6B_STAGES.length - 1) { T6B.stage++; t6bReset(); T6B.st = 'play'; }
        else { T6B.done = true; SAVE.t6 = Object.assign(SAVE.t6 || {}, { birds: true }); persist(); T6B.st = 'out'; T6B.k = 1; toast('Le le và bìm bịp thoát rồi, hót vang tiễn đoàn chuột!', 3.6); AU.pluck(88); setTimeout(() => AU.pluck(95), 160); setTimeout(() => AU.pluck(100), 330); }
        return;
      }
      if (T6B.st !== 'play') return;
      // the swipe: whatever rope the finger crosses between two frames is cut
      const d = S.drag && S.drag.ent === this ? S.drag : null;
      if (d) {
        const [vx, vy] = t6Pt(d.x, d.y), cur = [(vx - L.x0) / L.s - 35, (vy - L.y0) / L.s];
        if (this.px != null) { T6B.moved += Math.hypot(cur[0] - this.px, cur[1] - this.py); const S0 = t6bStage(); for (let i = 0; i < S0.e.length && T6B.st === 'play'; i++) if (T6B.E[i]) { const [a, b] = t6bEnd(i); if (t6bSegHit([this.px, this.py], cur, [a[0], a[1]], [b[0], b[1]])) t6bCut(i); } }
        this.px = cur[0]; this.py = cur[1];
      } else { this.px = null; }
    },
    onClick(wx, wy) {
      if (T6B.st !== 'off' || T6B.done) return false;
      if (Math.abs(wx - cx) > 190 || wy < GROUND - 380 || wy > GROUND + 24) return false;
      t6bReset(); T6B.st = 'in'; T6B.k = 0; AU.click(); $('#hud').hidden = true; AU.musicLevel(.3); return true;
    },
    grab(wx, wy) {
      if (T6B.st === 'off') return null;
      const d = { ent: this, x: wx, y: wy, draw() {} }; this.d = d; T6B.moved = 0; this.px = null;
      const v = t6View(), [x, y] = t6Pt(wx, wy);
      if (Math.hypot(x - 36, y - (v.top + 40)) < 30 && T6B.st !== 'in') { T6B.st = 'out'; T6B.k = 1; AU.click(); }                 // ← back to the road
      else if (Math.hypot(x - (v.W - 36), y - (v.top + 40)) < 30 && T6B.st === 'play') { t6bReset(); AU.click(); }              // ↻ start this stage over
      else this.tap = [x, y];
      return d;
    },
    drop(d) {
      // a tap (the finger hardly moved): cut the rope nearest to it
      if (T6B.st !== 'play' || !this.tap || T6B.moved > 6) { this.tap = null; return; }
      const v = t6View(), L = t6bLay(v), S0 = t6bStage(), p = [(this.tap[0] - L.x0) / L.s - 35, (this.tap[1] - L.y0) / L.s]; this.tap = null;
      let best = -1, bd = 16;
      for (let i = 0; i < S0.e.length; i++) if (T6B.E[i]) { const [a, b] = t6bEnd(i), dd = t6bNear(p, [a[0], a[1]], [b[0], b[1]]); if (dd < bd) { bd = dd; best = i; } }
      if (best >= 0) t6bCut(best);
    },
    draw(g) {
      // the banyan with the birds tied among its roots
      dp(g, WP.bigTree, cx, GROUND + 4, 0, 1.15, 1.15);
      if (T6B.done) return;
      const A = t6bArt();
      g.strokeStyle = '#b08a4a'; g.lineWidth = 3;
      hang.forEach(([dx, dy, k], i) => {
        const sw = Math.sin(S.t * 1.4 + i * 1.7) * 3, x = cx + dx + sw, y = GROUND + dy;
        g.beginPath(); g.moveTo(cx + dx, GROUND + dy - 62); g.lineTo(x, y - 10); g.stroke();
        g.save(); g.translate(x, y); g.scale(i % 2 ? -.6 : .6, .6); dp(g, A[k], 0, 0); g.strokeStyle = '#b08a4a'; g.lineWidth = 5; g.beginPath(); g.ellipse(4, 2, 19, 11, -.3, 0, 6.283); g.stroke(); g.restore();
      });
    },
    drawFg(g) {
      if (T6B.done || T6B.st !== 'off' || Math.abs(groom.x - cx) > 420) return;
      drawBubble(g, cx, GROUND - 320 + Math.sin(S.t * 3) * 3, ['chim']);
    },
    drawHud(g, vw) {
      if (T6B.st === 'off') return;
      const v = t6View(), D = DPR, A = t6bArt(), L = t6bLay(v), S0 = t6bStage(), k = T6B.st === 'in' || T6B.st === 'out' ? t6E(T6B.k) : 1;
      g.save(); g.setTransform(v.k * D, 0, 0, v.k * D, 0, 0); g.globalAlpha = k;
      // dawn sky, the branch with its rings
      const sky = g.createLinearGradient(0, 0, 0, v.H); sky.addColorStop(0, '#f6e4c4'); sky.addColorStop(.6, '#efc9a8'); sky.addColorStop(1, '#d9a98c');
      g.fillStyle = sky; g.fillRect(0, 0, v.W, v.H);
      g.fillStyle = 'rgba(255,250,235,.7)'; for (const [cxx, cyy, r] of [[.2, .18, 60], [.78, .3, 76], [.5, .12, 48]]) { g.beginPath(); g.ellipse(v.W * cxx, v.H * cyy, r * 1.5, r * .55, 0, 0, 6.283); g.fill(); }
      const by = L.y0 + (t6bRy() + 24) * L.s;
      g.fillStyle = '#7a4a22'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(-10, by, v.W + 20, 30 * L.s, 10); g.fill(); g.stroke();
      g.strokeStyle = '#5b2f1f'; g.lineWidth = 2; g.beginPath(); for (let x = 20; x < v.W; x += 90) { g.moveTo(x, by + 8 * L.s); g.quadraticCurveTo(x + 24, by + 14 * L.s, x + 54, by + 8 * L.s); } g.stroke();
      // ropes
      const P = (x, y) => t6bP(L, x, y);
      S0.e.forEach(([a, b], i) => {
        if (!T6B.E[i]) return;
        const [pa, pb] = t6bEnd(i), [ax, ay] = P(pa[0], pa[1]), [bx, byy] = P(pb[0], pb[1]), sag = 6 + Math.hypot(bx - ax, byy - ay) * .04;
        g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 6.5; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, (ay + byy) / 2 + sag, bx, byy); g.stroke();
        g.strokeStyle = '#c9a65c'; g.lineWidth = 4; g.stroke();
        g.strokeStyle = 'rgba(122,88,40,.7)'; g.lineWidth = 1.2; g.setLineDash([3, 5]); g.stroke(); g.setLineDash([]);
      });
      // the how-to cue (owner: no words): a glow slides along a rope that has to go, until the first cut
      if (T6B.st === 'play' && !T6B.cutAny && T6B.stage === 0 && T6B.sol && T6B.sol.length) {
        const i = T6B.sol.find(j => T6B.E[j]); if (i != null) {
          const [pa, pb] = t6bEnd(i), u = (S.t * .7) % 1, [ax, ay] = P(pa[0], pa[1]), [bx, byy] = P(pb[0], pb[1]), x = ax + (bx - ax) * u, y = ay + (byy - ay) * u;
          g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, byy); g.stroke(); g.setLineDash([]);
          g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.fill(); g.stroke();
        }
      }
      // the rings
      S0.e.forEach(([a, b], i) => { if (b >= 0 || !T6B.E[i]) return; const [x, y] = P(S0.n[a][0], t6bRy()); g.strokeStyle = INK; g.lineWidth = 5 * L.s + 2; g.beginPath(); g.arc(x, y, 12 * L.s, 0, 6.283); g.stroke(); g.strokeStyle = '#e2b43c'; g.lineWidth = 3 * L.s + 1; g.stroke(); });
      // cut ropes: the two halves drop and fade
      for (const c of T6B.cuts) {
        if (c.t > 1.1) continue; const q = c.t / 1.1, [ax, ay] = P(c.ax, c.ay), [bx, byy] = P(c.bx, c.by), mx = (ax + bx) / 2, my = (ay + byy) / 2, fall = q * q * 40;
        g.globalAlpha = k * (1 - q); g.strokeStyle = '#c9a65c'; g.lineWidth = 4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(mx - (mx - ax) * .1, my + fall); g.moveTo(bx, byy); g.lineTo(mx + (bx - mx) * .1, my + fall); g.stroke();
        if (q < .4) { g.strokeStyle = `rgba(255,255,255,${.9 - q * 2})`; g.lineWidth = 2; g.beginPath(); g.moveTo(mx - 12, my - 12); g.lineTo(mx + 12, my + 12); g.moveTo(mx + 12, my - 12); g.lineTo(mx - 12, my + 12); g.stroke(); }
        g.globalAlpha = k;
      }
      // the birds
      S0.n.forEach(([x, y, kind], i) => {
        if (kind === 'k') {                                                      // a knot where ropes meet: a little lump of rope
          const B = T6B.B[i], [px, py] = P(x, y); g.save(); if (B.free) { g.globalAlpha = k * Math.max(0, 1 - B.fly / .9); g.translate(px, py + 90 * B.fly * B.fly); } else g.translate(px, py);
          g.fillStyle = '#c9a65c'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 8 * Math.max(.8, L.s), 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = '#7a5828'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-6, -3); g.lineTo(6, 3); g.moveTo(-6, 3); g.lineTo(6, -3); g.stroke(); g.restore(); g.globalAlpha = k; return;
        }
        const B = T6B.B[i], [px, py] = P(x, y), face = x < 150 ? 1 : -1, sw = B.free ? 0 : Math.sin(S.t * 1.7 + i * 1.3) * 1.2, spr = kind === 'h' ? A.hawk : S0.n.filter(p => p[2] === 'f').indexOf(S0.n[i]) === 0 ? A.lele : A.bim, sc = L.s * (S0.bs || 1) * (kind === 'h' ? 1.05 : .95);
        g.save();
        if (B.free) { const fl = B.fly; g.globalAlpha = k * Math.max(0, 1 - fl / 1.4); g.translate(px + B.vx * fl, py + B.vy * fl + 120 * fl * fl * .2 * 0); g.rotate(Math.sin(fl * 20) * .12); g.scale(face * sc, sc * (1 + .14 * Math.sin(fl * 36))); if (kind === 'h' && T6B.st === 'fail') g.scale(1.25, 1.25); }
        else { g.translate(px + sw, py); g.scale(face * sc, sc); }
        if (kind === 'f' && !B.free) { const gr = g.createRadialGradient(0, 0, 4, 0, 0, 46); gr.addColorStop(0, 'rgba(255,236,150,.85)'); gr.addColorStop(1, 'rgba(255,236,150,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 46, 0, 6.283); g.fill(); }   // a soft glow: the two to save
        dp(g, spr, 0, 0);
        if (!B.free) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(2, 2, 19, 12, -.3, 0, 6.283); g.stroke(); g.strokeStyle = '#c9a65c'; g.lineWidth = 4.4; g.stroke(); }   // the rope round the body
        g.restore(); g.globalAlpha = k;
      });
      // the bar: back, stage, the two friends, start over
      const top = v.top + 40;
      g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.4;
      for (const [bx0, glyph] of [[36, '←'], [v.W - 36, '↻']]) { g.beginPath(); g.arc(bx0, top, 22, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 24px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, bx0, top + 1); g.fillStyle = '#f2ecde'; }
      g.font = '900 20px "Playfair Display", serif'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText(`Thế ${T6B.stage + 1}/${T6B_STAGES.length}`, v.W / 2, top - 12);
      g.font = '900 16px "Playfair Display", serif'; g.fillStyle = T6B.left <= 1 ? '#a3332a' : INK; g.fillText(`Còn ${T6B.left} nhát kéo`, v.W / 2, top + 50);
      [[A.lele, -34, 0], [A.bim, 34, 1]].forEach(([spr, dx, fi]) => {
        const idx = S0.n.findIndex((p, i) => p[2] === 'f' && S0.n.slice(0, i).filter(q => q[2] === 'f').length === fi), free = idx >= 0 && T6B.B[idx].free;
        g.save(); g.translate(v.W / 2 + dx, top + 16); g.globalAlpha = k * (free ? 1 : .85); g.scale(.4, .4); dp(g, spr, 0, 0); g.restore();
        if (free) { g.fillStyle = '#2f6a4c'; g.beginPath(); g.arc(v.W / 2 + dx + 14, top + 24, 8, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.font = '900 12px sans-serif'; g.fillText('✓', v.W / 2 + dx + 14, top + 25); }
      });
      // what has just happened
      if (T6B.msg && T6B.st === 'fail') {
        g.fillStyle = `rgba(163,51,42,${.18 + .1 * Math.sin(T6B.t * 14)})`; g.fillRect(0, 0, v.W, v.H);
        g.font = '900 22px "Playfair Display", serif'; const w = g.measureText(T6B.msg).width + 36;
        g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.rect(v.W / 2 - w / 2, v.H / 2 - 24, w, 48); g.fill(); g.stroke();
        g.fillStyle = '#a3332a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(T6B.msg, v.W / 2, v.H / 2 + 1);
      }
      if (T6B.st === 'clear') { g.font = '900 24px "Playfair Display", serif'; const t = T6B.stage < T6B_STAGES.length - 1 ? 'Thoát rồi!' : 'Le le và bìm bịp thoát hết!', w = g.measureText(t).width + 40; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.rect(v.W / 2 - w / 2, v.H / 2 - 26, w, 52); g.fill(); g.stroke(); g.fillStyle = '#2f6a4c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, v.W / 2, v.H / 2 + 1); }
      g.restore();
    },
  };
  return e;
}

const t6bOk = () => T6B.done || !T6B_REQUIRED;
