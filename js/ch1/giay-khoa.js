/* Hai tờ giấy rách, một cái chìa (owner's idea, on the branch giay-chia-khoa): two sheets of paper torn with holes of every odd
   shape. The back sheet stays put; the front one is dragged over it, smoothly (it glides after the finger). Light only passes
   where BOTH sheets are torn through, and only one way of laying them makes that light the shape of a key. Laid right, the key
   glows and the cage opens. No words on the screen (owner: no hints), only a small key picture to say what is wanted.
   Random every time (gkMake): where the key sits in each sheet and every other tear, so a solution cannot be shared; the maker
   checks that no other way of laying the sheets lights anything like the key. giayOpen(done): done() runs when the key is made. */
const GK = { S: 240, W: 340, H: 560, AX: 50, AY: 58, open: false, puz: null };
// the key in its own units (about 100 wide, 165 tall): a ring (outer polygon turned one way, inner the other) and the shank with two teeth
const GK_KEYPOLYS = (() => {
  const half = poly => poly.map(([x, y]) => [(x - 50) * .5 + 25, y * .5]);   // (about 55 wide and 88 tall)
  return [
    [[50, 2], [98, 34], [53, 69], [5, 31]],                                  // the head: an uneven lozenge
    [[50, 20], [32, 34], [52, 52], [70, 36]],                                 // its eye (turned the other way, so it is left open)
    [[44, 60], [58, 62], [63, 101], [60, 131], [86, 139], [83, 151], [61, 148], [64, 159], [79, 166], [74, 176], [57, 171], [45, 169], [48, 121]],   // the shank, a little crooked, with two slanting teeth
  ].map(half);
})();
// every polygon is resampled and shaken a little: torn edges, not drawn ones
function gkTorn(poly, amp) {
  const out = []; let nx = 0, ny = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / 4.5));
    for (let k = 0; k < n; k++) { const t = k / n; nx = nx * .55 + (R() - .5) * amp * 1.5; ny = ny * .55 + (R() - .5) * amp * 1.5; out.push([a[0] + (b[0] - a[0]) * t + nx, a[1] + (b[1] - a[1]) * t + ny]); }
  }
  return out;
}
function gkBlob(cx, cy, r) {                                                // a torn-out scrap: an uneven, spiky-ish loop
  const n = 12 + ((R() * 8) | 0), sq = .6 + R() * .8, rot = R() * 6.28, pts = []; let wob = 0;
  for (let i = 0; i < n; i++) { const a = i / n * 6.2832; wob = wob * .5 + (R() - .5) * .7; const rr = r * (.72 + wob + (R() < .2 ? (R() - .3) * .45 : 0)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr * sq; pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return gkTorn(pts, 1.4);
}
const gkPath = (polys, dx = 0, dy = 0, s = 1) => { const p = new Path2D(); for (const poly of polys) { poly.forEach(([x, y], i) => i ? p.lineTo((x + dx) * s, (y + dy) * s) : p.moveTo((x + dx) * s, (y + dy) * s)); p.closePath(); } return p; };
function gkRaster(polys, res) {                                              // a hole mask: res × res, 1 = torn through
  const c = document.createElement('canvas'); c.width = c.height = res; const h = c.getContext('2d', { willReadFrequently: true }); h.fillStyle = '#000'; h.fill(gkPath(polys, 0, 0, res / GK.S));
  const d = h.getImageData(0, 0, res, res).data, m = new Uint8Array(res * res); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0; return m;
}
// how like the key is what is lit when the front sheet's corner is (ox, oy) from the back sheet's corner (masks: res × res, offsets in mask pixels)
function gkIou(mA, mB, mK, res, ox, oy) {
  let inter = 0, lit = 0, key = 0;
  for (let y = 0; y < res; y++) {
    const v = y - oy;
    for (let x = 0; x < res; x++) {
      const k = mK[y * res + x]; key += k; const u = x - ox;
      if (u >= 0 && v >= 0 && u < res && v < res && mA[y * res + x] && mB[v * res + u]) { lit++; if (k) inter++; }
    }
  }
  return inter / (lit + key - inter || 1);
}
// a mask's outline as polygons (marching squares, loops joined end to start; a ring's inner edge turns the other way, so a plain fill leaves the island)
function gkContours(m, res) {
  const at = (x, y) => x < 0 || y < 0 || x >= res || y >= res ? 0 : m[y * res + x], segs = new Map(), key = (x, y) => x * 4096 + y;
  const add = (a, b) => { const k = key(a[0] * 2, a[1] * 2); if (!segs.has(k)) segs.set(k, []); segs.get(k).push([a, b]); };
  for (let y = -1; y < res; y++) for (let x = -1; x < res; x++) {
    const tl = at(x, y), tr = at(x + 1, y), br = at(x + 1, y + 1), bl = at(x, y + 1), c = tl | tr << 1 | br << 2 | bl << 3;
    if (c === 0 || c === 15) continue;
    const T = [x + .5, y], R = [x + 1, y + .5], B = [x + .5, y + 1], L = [x, y + .5];
    switch (c) {
      case 1: add(L, T); break; case 2: add(T, R); break; case 4: add(R, B); break; case 8: add(B, L); break;
      case 3: add(L, R); break; case 6: add(T, B); break; case 12: add(R, L); break; case 9: add(B, T); break;
      case 5: add(L, T); add(R, B); break; case 10: add(T, R); add(B, L); break;
      case 14: add(T, L); break; case 13: add(R, T); break; case 11: add(B, R); break; case 7: add(L, B); break;
    }
  }
  const loops = [];
  for (const [k0, list0] of segs) {
    while (list0.length) {
      const first = list0.pop(), loop = [first[0]]; let cur = first[1], guard = 0;
      while (guard++ < 200000) {
        loop.push(cur); const nx = segs.get(key(cur[0] * 2, cur[1] * 2)); if (!nx || !nx.length) break;
        const s2 = nx.pop(); if (s2[1][0] === first[0][0] && s2[1][1] === first[0][1]) break; cur = s2[1];
      }
      if (loop.length > 12) loops.push(gkSmooth(loop));
    }
  }
  return loops;
}
function gkSmooth(p) {                                                        // one round of corner cutting, then drop most of the points
  const q = []; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
  const out = []; for (let i = 0; i < q.length; i += 2) out.push(q[i]); return out;
}
const gkDown = (m, res, lo) => { const f = res / lo, o = new Uint8Array(lo * lo); for (let y = 0; y < lo; y++) for (let x = 0; x < lo; x++) { let n = 0; for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) n += m[(y * f + j) * res + x * f + i]; o[y * lo + x] = n * 2 >= f * f ? 1 : 0; } return o; };
function gkRip() {                                                          // a long thin rip, wandering in from somewhere near the edge
  const S = GK.S, R2 = a => a * R(), side = (R() * 4) | 0, t = R2(S), x0 = [t, S - 6, t, 6][side] + (R() - .5) * 20, y0 = [6, t, S - 6, t][side] + (R() - .5) * 20, len = 40 + R2(70), a0 = [1.57, 3.14, -1.57, 0][side] + (R() - .5) * 1.1, pts = [], w = 2.5 + R2(2.2);
  let x = x0, y = y0, a = a0; const left = [], right = [];
  for (let i = 0; i <= 12; i++) { const tt = i / 12, ww = w * (1 - tt * .8) + (R() - .5) * 1.2; a += (R() - .5) * .7; x += Math.cos(a) * len / 12; y += Math.sin(a) * len / 12; left.push([x - Math.sin(a) * ww, y + Math.cos(a) * ww]); right.push([x + Math.sin(a) * ww, y - Math.cos(a) * ww]); }
  return gkTorn([...left, ...right.reverse()], 1.1);
}
function gkMake() {
  const S = GK.S, ri = (a, b) => a + R() * (b - a), LO = 60, ks = LO / S, M = S * S;
  const touches = (m1, m2) => { for (let i = 0; i < M; i++) if (m1[i] && m2[i]) return true; return false; };
  const orInto = (dst, src) => { for (let i = 0; i < M; i++) if (src[i]) dst[i] = 1; };
  for (let tries = 0; tries < 120; tries++) {
    const KA = [Math.round(ri(14, 170)), Math.round(ri(14, 140))], KB = [Math.round(ri(14, 170)), Math.round(ri(14, 140))], g = [KA[0] - KB[0], KA[1] - KB[1]];   // laid right when the front sheet's corner is g from the back sheet's
    if (Math.hypot(g[0], g[1]) < 45) continue;                               // never already laid right
    const keyOf = K => GK_KEYPOLYS.map(p => gkTorn(p, 1.1).map(([x, y]) => [x + K[0], y + K[1]]));
    const rKeyA = gkRaster(keyOf(KA), S), rKeyB = gkRaster(keyOf(KB), S), edgePts = [], zone = [];
    for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) if (rKeyA[y * S + x] && (!rKeyA[y * S + x - 1] || !rKeyA[y * S + x + 1] || !rKeyA[(y - 1) * S + x] || !rKeyA[(y + 1) * S + x])) edgePts.push([x, y]);
    const dil = r => { const o = new Uint8Array(M); for (const [x, y] of edgePts) for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < S && yy < S && dx * dx + dy * dy <= r * r) o[yy * S + xx] = 1; } for (let i = 0; i < M; i++) if (rKeyA[i]) o[i] = 1; return o; };
    const bury = dil(20), near = dil(30);                                    // the key's surroundings: torn through one sheet or the other, never both
    for (let i = 0; i < M; i++) if (bury[i] && !rKeyA[i]) zone.push(i);
    // the zone round the key is split between the sheets by uneven scraps (nearest of many seeds, the distance shaken): neither sheet shows a clean key,
    // each shows a lumpy hole with the key buried in it; laid right, only the key itself is torn through both
    const seeds = []; for (let n = 0; n < 24; n++) { const i = zone[(R() * zone.length) | 0]; seeds.push([i % S, (i / S) | 0, true, ri(.7, 1.4)]); }
    { const cx = KA[0] + 27, cy = KA[1] + 44; seeds.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx)); seeds.forEach((q, n) => { q[2] = n % 2 === 0; }); }   // taken in turn round the key, so both sheets get a share all the way round
    const nz = Array.from({ length: 19 * 19 }, () => R() * 9), noise = (x, y) => { const fx = x / 14, fy = y / 14, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy; const a = nz[iy * 19 + ix], b = nz[iy * 19 + ix + 1], c = nz[(iy + 1) * 19 + ix], d = nz[(iy + 1) * 19 + ix + 1]; return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty; };
    const fz = Array.from({ length: 52 * 52 }, () => R() * 3.4), fine = (x, y) => { const fx = x / 5, fy = y / 5, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy; return fz[iy * 52 + ix] * (1 - tx) * (1 - ty) + fz[iy * 52 + ix + 1] * tx * (1 - ty) + fz[(iy + 1) * 52 + ix] * (1 - tx) * ty + fz[(iy + 1) * 52 + ix + 1] * tx * ty; };
    const cellsA = new Uint8Array(M), cellsB = new Uint8Array(M);           // (both in the back sheet's frame)
    for (const i of zone) {
      const x = i % S, y = (i / S) | 0; let best = 1e9, mineA = true;
      for (const [sx, sy, a, w] of seeds) { const d = Math.hypot(x - sx, y - sy) * w + noise(x, y) + fine(x, y); if (d < best) { best = d; mineA = a; } }
      (mineA ? cellsA : cellsB)[i] = 1;
    }
    const mAk = new Uint8Array(rKeyA); orInto(mAk, cellsA);
    const used = [];
    for (let n = 0, guard = 0; n < 17 && guard < 220; guard++) {               // far tears of the back sheet
      const r = ri(4, 19), cx = ri(r + 8, S - r - 8), cy = ri(r + 8, S - r - 8), poly = n % 3 === 2 ? gkRip() : gkBlob(cx, cy, r);
      if (used.some(([x, y, rr]) => Math.hypot(x - cx, y - cy) < rr + r + 3)) continue;
      const mr = gkRaster([poly], S); if (touches(mr, near)) continue;
      orInto(mAk, mr); used.push([cx, cy, r]); n++;
    }
    const reach = new Uint8Array(M);                                         // where the back sheet is torn, as the front sheet sees it (shifted by g, grown a little)
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (mAk[y * S + x]) for (let dy = -3; dy <= 3; dy += 3) for (let dx = -3; dx <= 3; dx += 3) { const u = x - g[0] + dx, v = y - g[1] + dy; if (u >= 0 && v >= 0 && u < S && v < S) reach[v * S + u] = 1; }
    const mBk = new Uint8Array(rKeyB);                                       // the front sheet in its own frame: its key, and its share of the zone moved over
    for (let v = 0; v < S; v++) for (let u = 0; u < S; u++) { const x = u + g[0], y = v + g[1]; if (x >= 0 && y >= 0 && x < S && y < S && cellsB[y * S + x]) mBk[v * S + u] = 1; }
    const usedB = [];
    for (let n = 0, guard = 0; n < 17 && guard < 220; guard++) {               // far tears of the front sheet: nowhere the back sheet is torn when laid right
      const r = ri(4, 19), cx = ri(r + 8, S - r - 8), cy = ri(r + 8, S - r - 8), poly = n % 3 === 2 ? gkRip() : gkBlob(cx, cy, r);
      if (usedB.some(([x, y, rr]) => Math.hypot(x - cx, y - cy) < rr + r + 3)) continue;
      const mr = gkRaster([poly], S); if (touches(mr, reach)) continue;
      orInto(mBk, mr); usedB.push([cx, cy, r]); n++;
    }
    const mA = gkDown(mAk, S, LO), mB = gkDown(mBk, S, LO), mK = gkDown(rKeyA, S, LO);
    let sure = true;                                                          // no other way of laying them lights much of a key
    for (let ox = -LO + 4; ox < LO && sure; ox++) for (let oy = -LO + 4; oy < LO; oy++) {
      const dd = Math.hypot(ox - g[0] * ks, oy - g[1] * ks); if (dd < 3) continue;     // (close to the right place it is legitimately key-like, so only a far offset must look nothing like it)
      if (gkIou(mA, mB, mK, LO, ox, oy) > (dd < 12 ? .55 : .42)) { sure = false; break; }
    }
    if (!sure) continue;
    if (gkIou(mA, mB, mK, LO, Math.round(g[0] * ks), Math.round(g[1] * ks)) < .8) continue;
    const edge = () => gkTorn([[0, 0], [S, 0], [S, S], [0, S]], 3.6);        // each sheet's own torn edge
    return { g, holesA: gkContours(mAk, S), holesB: gkContours(mBk, S), edgeA: edge(), edgeB: edge(), mA: mAk, mB: mBk, mK: rKeyA };
  }
  return null;
}

(function () {
  const el = document.createElement('div'); el.id = 'giay'; el.hidden = true;
  el.innerHTML = '<canvas id="giayCv"></canvas><button id="giayX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#giayX'), S = GK.S;
  let st = null;                                                             // { ox, oy, tx, ty, drag, t, done, cb, k, keys, hold, lastIou }
  const INKC = '#1d1915', PAPA = '#e9dcb4', PAPB = '#dba28e', GOLD = '#f2c640';
  const sheets = {};                                                         // the two sheets drawn once, holes cut out
  function size() {
    const k = Math.min(innerWidth * .94 / GK.W, innerHeight * .9 / GK.H), d = Math.min(2, devicePixelRatio || 1);
    cv2.style.width = GK.W * k + 'px'; cv2.style.height = GK.H * k + 'px'; cv2.width = Math.round(GK.W * k * d); cv2.height = Math.round(GK.H * k * d); if (st) st.k = k * d;
    baking();
  }
  function bake(edge, holes, col, k) {                                       // paper with a torn edge and torn-through holes (really see-through)
    const c = document.createElement('canvas'), pad = 6; c.width = c.height = Math.ceil((S + pad * 2) * k); const h = c.getContext('2d'); h.scale(k, k); h.translate(pad, pad);
    h.fillStyle = col; h.fill(gkPath([edge])); h.strokeStyle = 'rgba(29,25,21,.7)'; h.lineWidth = 1.6; h.stroke(gkPath([edge]));
    h.strokeStyle = 'rgba(120,90,50,.13)'; h.lineWidth = 1; for (let i = 0; i < 26; i++) { const x = R() * S, y = R() * S; h.beginPath(); h.moveTo(x, y); h.lineTo(x + (R() - .5) * 30, y + (R() - .5) * 8); h.stroke(); }   // fibres
    const hp = gkPath(holes); h.globalCompositeOperation = 'destination-out'; h.fillStyle = '#000'; h.fill(hp);
    h.globalCompositeOperation = 'source-over'; h.strokeStyle = 'rgba(250,243,214,.85)'; h.lineWidth = 2.6; h.stroke(hp); h.strokeStyle = 'rgba(29,25,21,.65)'; h.lineWidth = 1.1; h.stroke(hp);   // the pale fibre of a tear and its dark edge
    return { c, pad };
  }
  function baking() { if (!GK.puz || !st) return; const P = GK.puz, k = st.k; sheets.A = bake(P.edgeA, P.holesA, PAPA, k); sheets.B = bake(P.edgeB, P.holesB, PAPB, k); sheets.lit = document.createElement('canvas'); sheets.lit.width = cv2.width; sheets.lit.height = cv2.height; }
  function keyIcon(h, x, y, s, col) {
    h.save(); h.translate(x, y); h.scale(s, s); h.fillStyle = col; h.strokeStyle = INKC; h.lineWidth = 1.6;
    h.beginPath(); h.moveTo(-20, 0); h.lineTo(-12, -8); h.lineTo(-4, 0); h.lineTo(-12, 8); h.closePath(); h.fill(); h.stroke(); h.fillStyle = '#3a2d1e'; h.beginPath(); h.moveTo(-15, 0); h.lineTo(-12, -3); h.lineTo(-9, 0); h.lineTo(-12, 3); h.closePath(); h.fill(); h.stroke();
    h.fillStyle = col; h.beginPath(); h.rect(-5, -2.4, 24, 4.8); h.fill(); h.stroke(); h.beginPath(); h.rect(11, 2.4, 3.6, 6); h.rect(16, 2.4, 3.6, 4); h.fill(); h.stroke(); h.restore();
  }
  function draw() {
    if (!st || !sheets.A) return; const P = GK.puz, h = g, k = st.k, ax = GK.AX, ay = GK.AY, bx = ax + st.ox, by = ay + st.oy;
    h.setTransform(k, 0, 0, k, 0, 0); h.clearRect(0, 0, GK.W, GK.H);
    h.fillStyle = '#3a2d1e'; h.strokeStyle = INKC; h.lineWidth = 3; h.fillRect(0, 0, GK.W, GK.H); h.strokeRect(1.5, 1.5, GK.W - 3, GK.H - 3);
    keyIcon(h, GK.W / 2, 28, 1.6, st.done ? GOLD : '#7a6a4a');
    h.drawImage(sheets.A.c, ax - sheets.A.pad, ay - sheets.A.pad, sheets.A.c.width / k, sheets.A.c.height / k);
    h.save(); h.shadowColor = 'rgba(0,0,0,.4)'; h.shadowBlur = 9; h.shadowOffsetY = 3; h.drawImage(sheets.B.c, bx - sheets.B.pad, by - sheets.B.pad, sheets.B.c.width / k, sheets.B.c.height / k); h.restore();
    if (!st.done) return;
    // once the key is made: it glows (gold, kept only inside the back sheet's holes, then only inside the front sheet's)
    const L = sheets.lit, l = L.getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, L.width, L.height); l.setTransform(k, 0, 0, k, 0, 0);
    const pulse = st.done ? .8 + .2 * Math.sin(st.t * 9) : 1;
    l.fillStyle = `rgba(242,198,64,${pulse})`; l.fillRect(0, 0, GK.W, GK.H);
    l.globalCompositeOperation = 'destination-in'; l.fill(gkPath(P.holesA, ax, ay)); l.fill(gkPath(P.holesB, bx, by)); l.globalCompositeOperation = 'source-over';
    h.setTransform(1, 0, 0, 1, 0, 0); h.drawImage(L, 0, 0); h.setTransform(k, 0, 0, k, 0, 0);
    if (st.done) { const a = Math.min(1, st.t * 2); h.fillStyle = `rgba(242,198,64,${.16 * a})`; h.fillRect(0, 0, GK.W, GK.H); }
  }
  const toLogical = e => { const r = cv2.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * GK.W, (e.clientY - r.top) / r.height * GK.H]; };
  const iou = (ox, oy) => gkIou(GK.puz.mA, GK.puz.mB, GK.puz.mK, S, Math.round(ox), Math.round(oy));
  function win() {
    st.done = true; st.t = 0; st.drag = null; st.tx = GK.puz.g[0]; st.ty = GK.puz.g[1];                // it settles exactly into place
    AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => AU.pluck(91), 320); setTimeout(() => AU.stamp(), 520); setTimeout(() => close(true), 2400);
  }
  const clampX = v => Math.max(-170, Math.min(170, v)), clampY = v => Math.max(-175, Math.min(300, v));
  cv2.addEventListener('pointerdown', e => {
    if (!st || st.done) return; const [px, py] = toLogical(e), bx = GK.AX + st.ox, by = GK.AY + st.oy;
    if (px < bx - 4 || px > bx + S + 4 || py < by - 4 || py > by + S + 4) return;
    st.drag = { px, py, ox: st.tx, oy: st.ty }; try { cv2.setPointerCapture(e.pointerId); } catch (err) {} AU.click(); e.preventDefault();
  });
  cv2.addEventListener('pointermove', e => { if (!st || !st.drag) return; const [px, py] = toLogical(e), d = st.drag; st.tx = clampX(d.ox + px - d.px); st.ty = clampY(d.oy + py - d.py); });
  const up = () => { if (!st || !st.drag) return; st.drag = null; if (iou(st.ox, st.oy) >= .75) win(); };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  addEventListener('keydown', e => {                                          // while it is open, the game below hears nothing; arrows glide the front sheet
    if (!GK.open) return; e.stopPropagation(); e.preventDefault();
    if (e.code === 'Escape') { close(false); return; }
    st && st.keys.add(e.code);
  }, true);
  addEventListener('keyup', e => { st && st.keys.delete(e.code); }, true);
  X.addEventListener('click', () => close(false));
  let raf = 0, last = 0;
  function loop(ts) {
    if (!GK.open) return; const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    if (st) {
      st.t += dt;
      if (!st.done) {
        const kx = (st.keys.has('ArrowRight') || st.keys.has('KeyD') ? 1 : 0) - (st.keys.has('ArrowLeft') || st.keys.has('KeyA') ? 1 : 0), ky = (st.keys.has('ArrowDown') || st.keys.has('KeyS') ? 1 : 0) - (st.keys.has('ArrowUp') || st.keys.has('KeyW') ? 1 : 0);
        if (kx || ky) { st.tx = clampX(st.tx + kx * 70 * dt); st.ty = clampY(st.ty + ky * 70 * dt); }
        // it glides after the finger (smooth), and holding it still on the right place for a moment is enough too
        const f = Math.min(1, dt * 16), rx = Math.round(st.ox), ry = Math.round(st.oy); st.ox += (st.tx - st.ox) * f; st.oy += (st.ty - st.oy) * f;
        if (Math.round(st.ox) !== rx || Math.round(st.oy) !== ry || st.lastIou == null) st.lastIou = iou(st.ox, st.oy);
        if (st.lastIou >= .75) { st.hold += dt; if (st.hold > .45) win(); } else st.hold = 0;
      } else { const f = Math.min(1, dt * 9); st.ox += (st.tx - st.ox) * f; st.oy += (st.ty - st.oy) * f; }
      draw();
    }
    raf = requestAnimationFrame(loop);
  }
  function close(solved) {
    if (!GK.open) return; GK.open = false; el.hidden = true; cancelAnimationFrame(raf); const cb = st && st.cb; st = null;
    if (solved && cb) cb();
    if (window.__giayTest) setTimeout(() => { GK.puz = null; giayOpen(() => toast('Lồng chim mở! Thử cặp giấy mới nhé.', 3)); }, 1400);   // (the test copy: a fresh pair of sheets again and again)
  }
  addEventListener('resize', () => GK.open && size());
  window.giayOpen = function (cb) {
    if (GK.open) return;
    if (!GK.puz) GK.puz = gkMake();
    if (!GK.puz) { if (cb) cb(); return; }                                    // (the maker nearly always finds one)
    GK.open = true; el.hidden = false; st = { ox: 0, oy: 250, tx: 0, ty: 250, drag: null, t: 0, done: false, cb, k: 1, keys: new Set(), hold: 0, lastIou: null }; GK.st = st; size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
  };
  window.giayReset = () => { GK.puz = null; };                                // a fresh pair of sheets (tests)
  if (window.__giayTest || /[?&]thu=giay/.test(location.search)) setTimeout(() => giayOpen(() => toast('Lồng chim mở! Thử cặp giấy mới nhé.', 3)), 1800);
})();
