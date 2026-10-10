/* Hai tờ giấy rách, một cái chìa (owner's idea, on the branch giay-chia-khoa): two sheets of paper torn with holes of every odd
   shape. The back sheet stays put; the front one is dragged over it and turned (by a knob, two fingers, the wheel or Q and E), smoothly (it glides after the finger). Light only passes
   where BOTH sheets are torn through, and only one way of laying them makes that light the shape of a key. Laid right, the key
   glows and the cage opens. No words on the screen (owner: no hints), only a small key picture to say what is wanted.
   Random every time (gkMake): where the key sits in each sheet and every other tear, so a solution cannot be shared; the maker
   checks that no other way of laying the sheets lights anything like the key. giayOpen(done): done() runs when the key is made. */
const GK = { S: 240, W: 340, H: 560, AX: 50, AY: 68, open: false, puz: null, turn: false };   // turn: the sheets could be turned too (off: they lie one way, only the key is turned)
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
// a decoy: the key (or only its head, or only its shank) turned any way and resized, torn out somewhere else
function gkDecoy() {
  const S = GK.S, part = R(), polys = part < .34 ? GK_KEYPOLYS.slice(0, 2) : part < .67 ? GK_KEYPOLYS.slice(2) : GK_KEYPOLYS, a = R() * 6.283, sc = .65 + R() * .55, cx = 25 + 0, cy = 44;
  const x0 = 24 + R() * (S - 48), y0 = 24 + R() * (S - 48), ca = Math.cos(a) * sc, sa = Math.sin(a) * sc;
  const out = polys.map(p => gkTorn(p.map(([x, y]) => [(x - cx) * ca - (y - cy) * sa + x0, (x - cx) * sa + (y - cy) * ca + y0]), 1.3));
  return out.every(p => p.every(([x, y]) => x > 4 && y > 4 && x < S - 4 && y < S - 4)) ? out : null;
}
const gkWrap = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
// The back sheet stays put. The front sheet is turned about its middle by `rot` and moved by (ox, oy): a point p of it lands on the back sheet at
// (ox, oy) + c + R(rot)(p - c), c being the middle. Laid right is (g, phi); the key is torn on each sheet turned and placed to match only at that pose.
function gkFish() {                                                          // a fishbone-looking tear: a spine with ribs alternating along it, any way round
  const S = GK.S, len = 45 + R() * 60, a = R() * 6.283, x0 = 25 + R() * (S - 50), y0 = 25 + R() * (S - 50), ca = Math.cos(a), sa = Math.sin(a), out = [];
  const quad = (px, py, ang, l, w) => { const c1 = Math.cos(ang), s1 = Math.sin(ang), p = [[px - s1 * w, py + c1 * w], [px + c1 * l - s1 * w, py + s1 * l + c1 * w], [px + c1 * l + s1 * w, py + s1 * l - c1 * w], [px + s1 * w, py - c1 * w]]; let ar = 0; for (let i = 0; i < 4; i++) { const q = p[(i + 1) % 4]; ar += p[i][0] * q[1] - q[0] * p[i][1]; } if (ar < 0) p.reverse(); return gkTorn(p, .9); };
  out.push(quad(x0, y0, a, len, 2 + R() * 2.2));
  for (let t = 6, side = R() < .5 ? 1 : -1; t < len - 4; t += 5 + R() * 5, side = -side) out.push(quad(x0 + ca * t, y0 + sa * t, a + side * (.9 + R() * .7), 8 + R() * 14, 1.6 + R() * 1.8));
  return out.every(p => p.every(([x, y]) => x > 4 && y > 4 && x < S - 4 && y < S - 4)) ? out : null;
}
function gkMake() {
  const S = GK.S, c = S / 2, ri = (a, b) => a + R() * (b - a), M = S * S, LO = 48, ks = LO / S, D = LO * 3;
  const touches = (m1, m2) => { for (let i = 0; i < M; i++) if (m1[i] && m2[i]) return true; return false; };
  const orInto = (dst, src) => { for (let i = 0; i < M; i++) if (src[i]) dst[i] = 1; };
  for (let tries = 0; tries < 250; tries++) {
    let KA, KB, g, phi = 0, rotKey;
    if (GK.turn) { KA = [Math.round(ri(14, 170)), Math.round(ri(14, 140))]; phi = (R() < .5 ? -1 : 1) * ri(.6, 3.1); g = [Math.round(ri(-100, 100)), Math.round(ri(-60, 100))]; rotKey = GK_KEYPOLYS; }
    else {                                                                   // the key itself turned any way, then set down in each sheet where it fits
      const th = R() * 6.2832, ct = Math.cos(th), sn0 = Math.sin(th);
      rotKey = GK_KEYPOLYS.map(p => p.map(([x, y]) => { const dx = x - 25, dy = y - 44; return [25 + ct * dx - sn0 * dy, 44 + sn0 * dx + ct * dy]; }));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of rotKey) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const place = () => [Math.round(ri(10 - x0, S - 10 - x1)), Math.round(ri(10 - y0, S - 10 - y1))];
      KA = place(); KB = place(); g = [KA[0] - KB[0], KA[1] - KB[1]];
      if (Math.hypot(g[0], g[1]) < 45 || Math.abs(g[0]) > 140 || Math.abs(g[1]) > 140) continue;
    }
    const cs = Math.cos(phi), sn = Math.sin(phi);
    const toA = (u, v) => [g[0] + c + cs * (u - c) - sn * (v - c), g[1] + c + sn * (u - c) + cs * (v - c)];                  // a point of the front sheet, where it lands on the back sheet
    const toB = (x, y) => { const dx = x - g[0] - c, dy = y - g[1] - c; return [c + cs * dx + sn * dy, c - sn * dx + cs * dy]; };   // and back again
    const base = rotKey.map(p => p.map(([x, y]) => [x + KA[0], y + KA[1]]));
    const keyA = base.map(p => gkTorn(p, 1.1)), keyB = base.map(p => gkTorn(p.map(([x, y]) => toB(x, y)), 1.1));
    if (!keyB.every(p => p.every(([x, y]) => x > 4 && y > 4 && x < S - 4 && y < S - 4))) continue;             // the key must lie wholly on the front sheet too
    const rKeyA = gkRaster(keyA, S), edgePts = [], zone = [];
    for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) if (rKeyA[y * S + x] && (!rKeyA[y * S + x - 1] || !rKeyA[y * S + x + 1] || !rKeyA[(y - 1) * S + x] || !rKeyA[(y + 1) * S + x])) edgePts.push([x, y]);
    const dil = r => { const o = new Uint8Array(M); for (const [x, y] of edgePts) for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < S && yy < S && dx * dx + dy * dy <= r * r) o[yy * S + xx] = 1; } for (let i = 0; i < M; i++) if (rKeyA[i]) o[i] = 1; return o; };
    const bury = dil(18), near = dil(28);
    for (let i = 0; i < M; i++) if (bury[i] && !rKeyA[i]) zone.push(i);
    // The key's edge: wherever one sheet's tear has to follow it, the other sheet's tear bulges out past it. So the edge is walked all round (the outer
    // outline and the eye) in short runs, each run handed to one sheet or the other, and the zone outside takes the owner of its nearest bit of edge.
    // Each sheet then shows only broken fragments of the key's edge, between lumps, and neither shows a clean key.
    const nz = Array.from({ length: 19 * 19 }, () => R() * 9), noise = (x, y) => { const fx = Math.max(0, Math.min(17.9, x / 14)), fy = Math.max(0, Math.min(17.9, y / 14)), ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy; const a0 = nz[iy * 19 + ix], b0 = nz[iy * 19 + ix + 1], c2 = nz[(iy + 1) * 19 + ix], d0 = nz[(iy + 1) * 19 + ix + 1]; return a0 * (1 - tx) * (1 - ty) + b0 * tx * (1 - ty) + c2 * (1 - tx) * ty + d0 * tx * ty; };
    const bp = []; for (const loop of gkContours(rKeyA, S)) { let owner = R() < .5, left = 4 + R() * 8; for (const [x, y] of loop) { if ((left -= 1) <= 0) { owner = !owner; left = 4 + R() * 8; } bp.push([x, y, owner, .85 + R() * .4]); } }
    const cellsA = new Uint8Array(M), cellsB = new Uint8Array(M);           // (both in the back sheet's frame)
    for (const i of zone) {
      const x = i % S, y = (i / S) | 0, wx = x + (noise(x, y) - 4.5) * .9, wy = y + (noise(y + 3, x + 5) - 4.5) * .9; let best = 1e9, mineA = true;
      for (const [bx, by, a1, w] of bp) { const d = ((wx - bx) * (wx - bx) + (wy - by) * (wy - by)) * w; if (d < best) { best = d; mineA = a1; } }
      (mineA ? cellsA : cellsB)[i] = 1;
    }
    const mAk = new Uint8Array(rKeyA); orInto(mAk, cellsA);
    const used = [];
    for (let n = 0, guard = 0; n < 90 && guard < 1600; guard++) {              // far tears of the back sheet
      const r = R() < .2 ? ri(18, 32) : ri(3, 16), cx = ri(r + 8, S - r - 8), cy = ri(r + 8, S - r - 8), poly = n % 3 === 2 && r < 17 ? gkRip() : gkBlob(cx, cy, r);
      if (used.some(([x, y, rr]) => Math.hypot(x - cx, y - cy) < rr + r + 2)) continue;
      const mr = gkRaster([poly], S); if (touches(mr, near)) continue;
      orInto(mAk, mr); used.push([cx, cy, r]); n++;
    }
    for (let n = 0, guard = 0; n < 4 && guard < 60; guard++) {                // fishbone tears on the back sheet
      const f = gkFish(); if (!f) continue; const mr = gkRaster(f, S); if (touches(mr, near)) continue; orInto(mAk, mr); n++;
    }
    const reach = new Uint8Array(M);                                         // where the back sheet is torn, as the front sheet sees it (turned and shifted back, grown a little)
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (mAk[y * S + x]) { const [u0, v0] = toB(x, y); for (let dy = -3; dy <= 3; dy += 3) for (let dx = -3; dx <= 3; dx += 3) { const u = Math.round(u0 + dx), v = Math.round(v0 + dy); if (u >= 0 && v >= 0 && u < S && v < S) reach[v * S + u] = 1; } }
    const mBk = new Uint8Array(gkRaster(keyB, S));                           // the front sheet in its own frame: its key, and its share of the zone carried over
    for (let v = 0; v < S; v++) for (let u = 0; u < S; u++) { const [x, y] = toA(u, v), xi = Math.round(x), yi = Math.round(y); if (xi >= 0 && yi >= 0 && xi < S && yi < S && cellsB[yi * S + xi]) mBk[v * S + u] = 1; }
    const usedB = [];
    for (let n = 0, guard = 0; n < 90 && guard < 1600; guard++) {              // far tears of the front sheet: nowhere the back sheet is torn when laid right
      const r = R() < .2 ? ri(18, 32) : ri(3, 16), cx = ri(r + 8, S - r - 8), cy = ri(r + 8, S - r - 8), poly = n % 3 === 2 && r < 17 ? gkRip() : gkBlob(cx, cy, r);
      if (usedB.some(([x, y, rr]) => Math.hypot(x - cx, y - cy) < rr + r + 2)) continue;
      const mr = gkRaster([poly], S); if (touches(mr, reach)) continue;
      orInto(mBk, mr); usedB.push([cx, cy, r]); n++;
    }
    for (let n = 0, guard = 0; n < 4 && guard < 60; guard++) {                // fishbone tears on the front sheet
      const f = gkFish(); if (!f) continue; const mr = gkRaster(f, S); if (touches(mr, reach)) continue; orInto(mBk, mr); n++;
    }
    // laid right, how much of the lit shape is the key
    let inter = 0, lit = 0, keyN = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const k = rKeyA[y * S + x]; keyN += k; if (!mAk[y * S + x]) continue; const [u, v] = toB(x, y), ui = Math.round(u), vi = Math.round(v); if (ui >= 0 && vi >= 0 && ui < S && vi < S && mBk[vi * S + ui]) { lit++; if (k) inter++; } }
    if (inter / (lit + keyN - inter) < .8) continue;
    // and no other pose lights anything like a key: every 15 degrees, every few pixels, at a coarse scale
    const mA = gkDown(mAk, S, LO), mB = gkDown(mBk, S, LO), mK = gkDown(rKeyA, S, LO), aIdx = []; let kn = 0;
    for (let i = 0; i < LO * LO; i++) { if (mA[i]) aIdx.push(i); kn += mK[i]; }
    let sure = true; const ch = LO / 2;
    for (let ai = 0; ai < (GK.turn ? 24 : 1) && sure; ai++) {
      const ang = ai * Math.PI / 12, ca = Math.cos(ang), sa = Math.sin(ang), rot0 = new Uint8Array(D * D);
      for (let qy = -LO; qy < 2 * LO; qy++) for (let qx = -LO; qx < 2 * LO; qx++) { const dx = qx - ch, dy = qy - ch, px = Math.round(ch + ca * dx + sa * dy), py = Math.round(ch - sa * dx + ca * dy); if (px >= 0 && py >= 0 && px < LO && py < LO) rot0[(qy + LO) * D + qx + LO] = mB[py * LO + px]; }
      const near0 = Math.abs(gkWrap(ang - phi)) < .39;
      for (let ox = -LO + 6; ox < LO - 5 && sure; ox += 2) for (let oy = -LO + 6; oy < LO - 5; oy += 2) {
        if (near0 && Math.hypot(ox - g[0] * ks, oy - g[1] * ks) < 10) continue;               // close to the right pose it is legitimately key-like
        let li = 0, it = 0; for (const i of aIdx) { const x = i % LO, y = (i / LO) | 0; if (rot0[(y - oy + LO) * D + x - ox + LO]) { li++; if (mK[i]) it++; } }
        if (it / (li + kn - it || 1) > .42) { sure = false; break; }
      }
    }
    if (!sure) continue;
    const edge = () => gkTorn([[0, 0], [S, 0], [S, S], [0, S]], 3.6);        // each sheet's own torn edge
    const holesB = gkContours(mBk, S);
    return { g, phi, holesA: gkContours(mAk, S), holesB, pathB: gkPath(holesB), edgeA: edge(), edgeB: edge(), mA: mAk, mB: mBk, mK: rKeyA };
  }
  return null;
}

(function () {
  const el = document.createElement('div'); el.id = 'giay'; el.hidden = true;
  el.innerHTML = '<canvas id="giayCv"></canvas><button id="giayX" aria-label="Đóng">✕</button>';
  document.body.appendChild(el);
  const cv2 = el.querySelector('canvas'), g = cv2.getContext('2d'), X = el.querySelector('#giayX'), S = GK.S, C = S / 2;
  let st = null;                                                             // { ox, oy, rot, tx, ty, trot, drag, ptrs, t, done, cb, k, keys, hold, lastIou }
  const INKC = '#1d1915', PAPA = '#e9dcb4', PAPB = '#dba28e', GOLD = '#f2c640';
  const sheets = {};                                                         // the two sheets drawn once, holes cut out
  const live = document.createElement('canvas'); live.width = live.height = 120; const lg = live.getContext('2d', { willReadFrequently: true });
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
  const AC = [GK.AX + C, GK.AY + C];
  const toGroup = (px, py) => { const dx = px - AC[0], dy = py - AC[1], ca = Math.cos(st.alpha), sa = Math.sin(st.alpha); return [AC[0] + ca * dx + sa * dy, AC[1] - sa * dx + ca * dy]; };   // a screen point, in the back sheet's frame
  const toScreen = (gx, gy) => { const dx = gx - AC[0], dy = gy - AC[1], ca = Math.cos(st.alpha), sa = Math.sin(st.alpha); return [AC[0] + ca * dx - sa * dy, AC[1] + sa * dx + ca * dy]; };
  const clampPose = () => { const [sx, sy] = toScreen(GK.AX + st.tx + C, GK.AY + st.ty + C), cx = Math.max(24, Math.min(GK.W - 24, sx)), cy = Math.max(24, Math.min(GK.H - 24, sy)); if (cx !== sx || cy !== sy) { const [gx, gy] = toGroup(cx, cy); st.tx = gx - GK.AX - C; st.ty = gy - GK.AY - C; } };   // the front sheet's middle stays on the screen
  const centre = () => [GK.AX + st.ox + C, GK.AY + st.oy + C];                // where the front sheet's middle is on the screen
  const handle = () => { const [cx, cy] = centre(), d = C + 22; return [cx + Math.sin(st.rot) * d, cy - Math.cos(st.rot) * d]; };   // the turning knob, out beyond the sheet's top edge
  function draw() {
    if (!st || !sheets.A) return; const P = GK.puz, h = g, k = st.k, ax = GK.AX, ay = GK.AY, [cx, cy] = centre();
    h.setTransform(k, 0, 0, k, 0, 0); h.clearRect(0, 0, GK.W, GK.H);
    h.fillStyle = '#3a2d1e'; h.strokeStyle = INKC; h.lineWidth = 3; h.fillRect(0, 0, GK.W, GK.H); h.strokeRect(1.5, 1.5, GK.W - 3, GK.H - 3);
    keyIcon(h, GK.W / 2, 28, 1.6, st.done ? GOLD : '#7a6a4a');
    h.save(); h.translate(AC[0], AC[1]); h.rotate(st.alpha); h.translate(-AC[0], -AC[1]);
    h.drawImage(sheets.A.c, ax - sheets.A.pad, ay - sheets.A.pad, sheets.A.c.width / k, sheets.A.c.height / k);
    h.save(); h.translate(cx, cy); h.rotate(st.rot); h.shadowColor = 'rgba(0,0,0,.4)'; h.shadowBlur = 9; h.shadowOffsetY = 3; h.drawImage(sheets.B.c, -C - sheets.B.pad, -C - sheets.B.pad, sheets.B.c.width / k, sheets.B.c.height / k); h.restore();
    if (!st.done && GK.turn) {                                               // the knob for turning the front sheet (a circle with a turning arrow)
      const [hx, hy] = handle(); h.save(); h.translate(hx, hy); h.fillStyle = '#e9dcb4'; h.strokeStyle = INKC; h.lineWidth = 2; h.beginPath(); h.arc(0, 0, 13, 0, 6.283); h.fill(); h.stroke();
      h.beginPath(); h.arc(0, 0, 6.5, -2.4, 1.9); h.stroke(); h.fillStyle = INKC; h.beginPath(); h.moveTo(6.6, 3); h.lineTo(8.6, -2.6); h.lineTo(2.4, -1.4); h.closePath(); h.fill(); h.restore(); h.restore(); return;
    }
    h.restore();
    // once the key is made: it glows (gold, kept only inside the back sheet's holes, then only inside the front sheet's)
    const L = sheets.lit, l = L.getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, L.width, L.height); l.setTransform(k, 0, 0, k, 0, 0);
    const pulse = .8 + .2 * Math.sin(st.t * 9);
    l.fillStyle = `rgba(242,198,64,${pulse})`; l.fillRect(0, 0, GK.W, GK.H);
    l.globalCompositeOperation = 'destination-in'; l.save(); l.translate(AC[0], AC[1]); l.rotate(st.alpha); l.translate(-AC[0], -AC[1]); l.fill(gkPath(P.holesA, ax, ay)); l.restore();
    l.save(); l.translate(AC[0], AC[1]); l.rotate(st.alpha); l.translate(-AC[0], -AC[1]);
    l.save(); l.translate(cx, cy); l.rotate(st.rot); l.translate(-C, -C); l.fill(P.pathB); l.restore(); l.restore(); l.globalCompositeOperation = 'source-over';
    h.setTransform(1, 0, 0, 1, 0, 0); h.drawImage(L, 0, 0); h.setTransform(k, 0, 0, k, 0, 0);
    const a = Math.min(1, st.t * 2); h.fillStyle = `rgba(242,198,64,${.16 * a})`; h.fillRect(0, 0, GK.W, GK.H);
  }
  const toLogical = (e) => { const r = cv2.getBoundingClientRect(); return toGroup((e.clientX - r.left) / r.width * GK.W, (e.clientY - r.top) / r.height * GK.H); };
  // how like the key is what is lit, in this pose (the front sheet's holes turned and moved are painted at half size and set against the back sheet's)
  function iouAt(ox, oy, rot) {
    const P = GK.puz; if (!P.m120) { P.m120 = [gkDown(P.mA, S, 120), gkDown(P.mK, S, 120)]; }
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, 120, 120); lg.setTransform(.5, 0, 0, .5, 0, 0); lg.translate(ox + C, oy + C); lg.rotate(rot); lg.translate(-C, -C); lg.fillStyle = '#000'; lg.fill(P.pathB);
    const d = lg.getImageData(0, 0, 120, 120).data, mA = P.m120[0], mK = P.m120[1]; let it = 0, li = 0, kn = 0;
    for (let i = 0; i < 14400; i++) { const k = mK[i]; kn += k; if (mA[i] && d[i * 4 + 3] > 127) { li++; if (k) it++; } }
    return it / (li + kn - it || 1);
  }
  function win() {
    const P = GK.puz; st.done = true; st.t = 0; st.drag = null; st.tx = P.g[0]; st.ty = P.g[1]; st.trot = st.rot + gkWrap(P.phi - st.rot);          // it settles exactly into place
    AU.pluck(79); setTimeout(() => AU.pluck(86), 160); setTimeout(() => AU.pluck(91), 320); setTimeout(() => AU.stamp(), 520); setTimeout(() => close(true), 2400);
  }
  const clampX = v => Math.max(-160, Math.min(160, v)), clampY = v => Math.max(-168, Math.min(372, v));
  const inSheet = (px, py) => { const [cx, cy] = centre(), dx = px - cx, dy = py - cy, ca = Math.cos(st.rot), sa = Math.sin(st.rot), u = ca * dx + sa * dy, v = -sa * dx + ca * dy; return Math.abs(u) < C + 4 && Math.abs(v) < C + 4; };
  cv2.addEventListener('pointerdown', e => {
    if (!st || st.done) return; const [px, py] = toLogical(e); st.ptrs.set(e.pointerId, [px, py]);
    if (GK.turn && st.ptrs.size === 2) { st.drag = { type: 'pair', prev: pairState() }; return; }                      // two fingers: move and twist together
    const [hx, hy] = handle(), [cx, cy] = centre();
    if (GK.turn && Math.hypot(px - hx, py - hy) < 22) st.drag = { type: 'rot', prev: Math.atan2(py - cy, px - cx) };
    else if (inSheet(px, py)) st.drag = { type: 'move', px, py, ox: st.tx, oy: st.ty };
    else return;
    try { cv2.setPointerCapture(e.pointerId); } catch (err) {} AU.click(); e.preventDefault();
  });
  const pairState = () => { const [a, b] = [...st.ptrs.values()]; return { mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; };
  cv2.addEventListener('pointermove', e => {
    if (!st) return; const [px, py] = toLogical(e); if (st.ptrs.has(e.pointerId)) st.ptrs.set(e.pointerId, [px, py]);
    const d = st.drag; if (!d) return;
    if (d.type === 'move') { st.tx = d.ox + px - d.px; st.ty = d.oy + py - d.py; clampPose(); }
    else if (d.type === 'rot') { const [cx, cy] = centre(), a = Math.atan2(py - cy, px - cx); st.trot += gkWrap(a - d.prev); d.prev = a; }   // (turned by the change of angle, so crossing the half-turn does not spin it the long way)
    else if (d.type === 'pair' && st.ptrs.size >= 2) { const n = pairState(), p = d.prev; st.tx += n.mx - p.mx; st.ty += n.my - p.my; clampPose(); st.trot += gkWrap(n.ang - p.ang); d.prev = n; }
  });
  const up = e => { if (!st) return; st.ptrs.delete(e.pointerId); if (st.drag && (st.drag.type !== 'pair' || st.ptrs.size < 2)) st.drag = null; if (!st.done && st.lastIou >= .75) win(); };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  cv2.addEventListener('wheel', e => { if (!st || st.done || !GK.turn) return; st.trot += (e.deltaY > 0 ? 1 : -1) * .07; e.preventDefault(); }, { passive: false });
  addEventListener('keydown', e => {                                          // while it is open, the game below hears nothing; arrows glide the front sheet, Q and E turn it
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
        const K = c => st.keys.has(c), kx = (K('ArrowRight') || K('KeyD') ? 1 : 0) - (K('ArrowLeft') || K('KeyA') ? 1 : 0), ky = (K('ArrowDown') || K('KeyS') ? 1 : 0) - (K('ArrowUp') || K('KeyW') ? 1 : 0), kr = (K('KeyE') ? 1 : 0) - (K('KeyQ') ? 1 : 0);
        if (kx || ky) { const ca = Math.cos(st.alpha), sa = Math.sin(st.alpha); st.tx += (ca * kx + sa * ky) * 70 * dt; st.ty += (-sa * kx + ca * ky) * 70 * dt; clampPose(); }
        if (kr && GK.turn) st.trot += kr * 1.1 * dt;
        // it glides after the finger (smooth), and holding it still on the right pose for a moment is enough too
        const f = Math.min(1, dt * 16), px0 = st.ox, py0 = st.oy, r0 = st.rot; st.ox += (st.tx - st.ox) * f; st.oy += (st.ty - st.oy) * f; st.rot += (st.trot - st.rot) * f;
        if (st.lastIou == null || Math.abs(st.ox - st.cx0) > .5 || Math.abs(st.oy - st.cy0) > .5 || Math.abs(st.rot - st.cr0) > .006) { st.lastIou = iouAt(st.ox, st.oy, st.rot); st.cx0 = st.ox; st.cy0 = st.oy; st.cr0 = st.rot; }
        if (st.lastIou >= .75) { st.hold += dt; if (st.hold > .45) win(); } else st.hold = 0;
      } else { const f = Math.min(1, dt * 9); st.ox += (st.tx - st.ox) * f; st.oy += (st.ty - st.oy) * f; st.rot += (st.trot - st.rot) * f; }
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
    const r0 = GK.turn ? GK.puz.phi + (R() < .5 ? -1 : 1) * (1.2 + R() * 1.4) : 0;          // the front sheet starts turned well away from the right way up
    GK.open = true; el.hidden = false; st = { alpha: GK.turn ? R() * 6.2832 : 0, ox: 0, oy: 250, rot: r0, tx: 0, ty: 250, trot: r0, drag: null, ptrs: new Map(), t: 0, done: false, cb, k: 1, keys: new Set(), hold: 0, lastIou: null, cx0: 0, cy0: 0, cr0: 0 }; GK.st = st; { const [gx, gy] = toGroup(GK.W / 2, 440); st.ox = st.tx = gx - GK.AX - C; st.oy = st.ty = gy - GK.AY - C; } size(); last = performance.now(); raf = requestAnimationFrame(loop); AU.pluck(72);
  };
  setTimeout(() => { if (!GK.puz && !GK.open) GK.puz = gkMake(); }, 9000);                    // the pair of sheets takes a moment to tear: do it while nobody is looking
  window.giayReset = () => { GK.puz = null; };                                // a fresh pair of sheets (tests)
  if (window.__giayTest || /[?&]thu=giay/.test(location.search)) setTimeout(() => giayOpen(() => toast('Lồng chim mở! Thử cặp giấy mới nhé.', 3)), 1800);
})();
