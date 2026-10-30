/* Mice, carried items and the big cat. */
/* ---------- characters ---------- */
/* ---------- the head: one part, the hair, hat, ear, eye and snout all drawn INTO it (owner, 2026-10-28: a hat or hair drawn over the head looked pasted on) ----------
   Options besides the old ones (head colour, hat, powder, trim): snout (.75-1.35 of the snout's length), headS (head size), jaw, ear 'round'|'big'|'small'|'point'|'droop'
   (earS size, earc outer plate, earin inner plate), eye 'round'|'big'|'small'|'narrow'|'lash' (brow 1|2), nose, blush, teeth, stache, wrinkle,
   hair 'ngan'|'bui'|'duoi'|'dai'|'ro'|'xoan'|'haibui' (hairc plate), hatk 'nonla'|'quai'|'xep'|'van'|'quan'|'nonme'|'mu' (hatc, hatc2 plates).
   A mouse with none of them is drawn exactly as before. A hat (or long hair) covers the ear. */
const MV_KEYS = ['snout', 'headS', 'jaw', 'ear', 'earS', 'earc', 'earin', 'eye', 'brow', 'nose', 'blush', 'teeth', 'stache', 'wrinkle', 'hair', 'hatk'];
const mouseV2 = o => MV_KEYS.some(k => o[k]);
const HV = {
  sx(o, x) { const s = o.snout || 1; return x > 14 ? 14 + (x - 14) * s : x; },
  head(o, pts) { const k = o.headS || 1; return pts.map(([x, y]) => { const X = HV.sx(o, x); let Y = y; if (o.jaw) Y = y > -12 ? y + o.jaw * Math.max(0, (x + 16) / 70) : y; return [14 + (X - 14) * k, -16 + (Y + 16) * k]; }); },
  ear(a, o) {
    if (o.hatk || o.hair === 'dai' || o.hair === 'ro') return;                                   // covered
    const t = o.ear || 'round', s = o.earS || 1, x = -8, y = -31, oc = o.earc || 'lilac', ic = o.earin || 'red'; let p, q;
    if (t === 'round') { p = circ(x, y, 11 * s); q = circ(x, y + 1, 5.5 * s); }
    else if (t === 'big') { p = circ(x - 1, y - 2, 14 * s); q = circ(x - 1, y - 1, 7.5 * s); }
    else if (t === 'small') { p = circ(x, y + 1, 7.5 * s); q = circ(x, y + 2, 3.8 * s); }
    else if (t === 'point') { p = smooth([[x - 9, y + 9], [x - 6, y - 18 * s], [x + 9, y - 4], [x + 8, y + 9]]); q = smooth([[x - 4, y + 6], [x - 3, y - 10 * s], [x + 5, y - 2], [x + 4, y + 7]]); }
    else { p = smooth([[x - 11, y - 5], [x + 7, y - 10], [x + 14, y + 4], [x + 5, y + 16], [x - 12, y + 5]]); q = smooth([[x - 5, y - 1], [x + 5, y - 5], [x + 9, y + 4], [x + 2, y + 9]]); }   // droop
    a.erase(p); a.fk(oc, p, 2.2); a.fill(ic, q);
  },
  eye(a, o) {
    const e = o.eye || 'round', x = 14, y = -18;
    if (e === 'round') { a.fk('yellow', circ(x, y, 7.5), 2); a.ink(circ(x + 1, y, 3.4)); }
    else if (e === 'big') { a.fk('yellow', circ(x, y, 10), 2); a.ink(circ(x + 1.5, y, 4.8)); }
    else if (e === 'small') { a.fk('yellow', circ(x, y, 5), 1.8); a.ink(circ(x + 1, y, 2.6)); }
    else if (e === 'narrow') { a.fk('yellow', ell(x, y, 8, 4.2), 2); a.ink(circ(x + 1, y, 2.6)); }
    else { a.fk('yellow', circ(x, y, 7.5), 2); a.ink(circ(x + 1, y, 3.4)); a.key(lines([[x - 6, y - 6, x - 10, y - 10], [x, y - 8, x - 1, y - 13], [x + 6, y - 6, x + 9, y - 10]]), 1.3); }   // lash
    if (o.brow) a.key(lines([[x - 8, y - 11 + (o.brow > 1 ? 3 : 0), x + 8, y - 14 + (o.brow > 1 ? -3 : 0)]]), o.brow > 1 ? 2.6 : 1.6);
  },
  face(a, o) {
    const sx = x => HV.sx(o, x);
    a.ink(circ(sx(49.5), -7, 3 * (o.nose || 1)));
    a.key(lines([[sx(43), -9, sx(64), -17], [sx(44), -6, sx(66), -7], [sx(43), -3, sx(61), 3]]), 1.1);
    a.key(smooth([[sx(45), -2], [sx(38), 1], [sx(32), -1]], false), 1.4);
    if (o.blush) a.fill('red', circ(26, -8, 6));
    if (o.teeth) a.fk('white', rect(sx(38), -1, 5, 6), 1.1);
    if (o.stache) a.key(smooth([[sx(36), -4], [sx(44), -8], [sx(54), -4]], false), 2.4);
    if (o.wrinkle) a.key(lines([[20, -27, 28, -25], [22, -24, 29, -22]]), .9);
  },
};
const HK = {
  back(a, o) {
    const hc = o.hairc || 'dark';
    if (o.hair === 'duoi') { a.fk(hc, smooth([[-14, -30], [-30, -34], [-48, -26], [-58, -8], [-50, -18], [-38, -18], [-22, -14]]), 2.2); a.fk('red', ell(-24, -30, 3, 5), 1.2); }
    if (o.hair === 'dai') a.fk(hc, smooth([[-14, -30], [-30, -26], [-36, -4], [-32, 14], [-12, 12], [-6, 0], [-14, -12]]), 2.4);
    if (o.hair === 'bui') { a.fk(hc, circ(-14, -42, 10), 2.2); a.fk('red', rect(-20, -36, 12, 4), 1.2); }
    if (o.hair === 'haibui') { a.fk(hc, circ(-10, -44, 8), 2); a.fk(hc, circ(12, -46, 8), 2); }
  },
  front(a, o) {
    const poly = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; };
    const cov = (p, pl, w) => { a.erase(p); a.fk(pl, p, w); };                                     // wipe the head's ink under it, then print it
    const hc = o.hairc || 'dark', hk = o.hatk, hcol = o.hatc || 'straw';
    if (o.hair) {
      const cap = smooth([[-17, -22], [-17, -32], [-8, -41], [10, -42], [24, -32], [28, -22], [14, -27], [0, -29], [-10, -26]]);
      if (o.hair === 'ro') { cov(smooth([[-17, -20], [-17, -32], [-6, -42], [12, -42], [26, -30], [28, -20], [16, -30], [6, -33], [-4, -26], [-8, -14]]), hc, 2.2); a.key(lines([[8, -42, 6, -30]]), 1.2); }
      else if (o.hair === 'xoan') { cov(cap, hc, 2); for (let i = 0; i < 6; i++) cov(circ(-14 + i * 8, -39 + Math.abs(i - 2.5) * 2.4, 5.5), hc, 1.6); }
      else { cov(cap, hc, 2.2); a.key(lines([[-6, -38, -2, -30], [4, -40, 6, -31], [14, -37, 13, -30]]), 1); }
    }
    if (hk === 'nonla') { cov(poly([[-26, -24], [9, -64], [44, -22], [20, -18], [-8, -18]]), hcol, 2.4); a.key(lines([[9, -64, -14, -21], [9, -64, 9, -19], [9, -64, 32, -21]]), 1); a.key(smooth([[-22, -28], [9, -30], [40, -26]], false), 1); a.fk('red', circ(9, -65, 3.6), 1.2); a.key(lines([[36, -21, 32, -2]]), 1.6); }
    if (hk === 'quai') { cov(ell(9, -33, 44, 9), o.hatc2 || 'brown', 2.4); cov(smooth([[-12, -34], [-8, -48], [10, -52], [26, -46], [30, -34]]), o.hatc2 || 'brown', 2.4); a.fk('red', rect(-12, -37, 42, 4), 1.2); a.fk('red', ell(-30, -26, 4, 12), 1.2); a.fk('red', ell(48, -24, 4, 12), 1.2); }
    if (hk === 'xep') { cov(smooth([[-16, -24], [-16, -44], [-2, -54], [16, -52], [26, -42], [24, -26], [8, -30]]), o.hatc2 || 'dark', 2.4); a.key(lines([[-8, -44, 6, -50], [-12, -38, 16, -47], [-14, -32, 22, -40]]), 1.1); }
    if (hk === 'van') { cov(smooth([[-19, -22], [-19, -36], [-6, -45], [14, -44], [28, -33], [27, -22], [12, -30], [-4, -28]]), o.hatc2 || 'dark', 2.4); for (let i = 0; i < 3; i++) a.key(smooth([[-17 + i * 2, -26 - i * 5], [4, -33 - i * 4], [24, -28 - i * 3]], false), 1.1); }
    if (hk === 'quan') { cov(smooth([[-17, -24], [-17, -38], [-4, -46], [14, -46], [26, -36], [24, -24], [8, -30]]), 'dark', 2.4); cov(ell(-26, -40, 18, 4), 'dark', 2); cov(ell(36, -40, 16, 4), 'dark', 2); a.fk('yellow', circ(4, -47, 3), 1); }
    if (hk === 'nonme') { cov(ell(9, -30, 40, 10), hcol, 2.4); cov(smooth([[-14, -31], [-8, -44], [10, -48], [26, -42], [31, -31]]), hcol, 2.4); a.key(lines([[-6, -33, -4, -45], [9, -33, 9, -48], [24, -33, 22, -44]]), 1); a.fk('red', rect(-14, -36, 44, 3), 1.2); }
    if (hk === 'mu') { cov(smooth([[-21, -19], [-15, -41], [4, -47], [19, -34], [6, -27], [-11, -19]]), hcol === 'straw' ? 'dark' : hcol, 2.2); a.fk('red', circ(-2, -47, 4.2), 1.4); }
  },
};
function mouseHead(o) {
  const v = mouseV2(o);
  return part(v ? [-52, -84, 96, 18] : [-34, -58, 70, 14], a => {
    const pts = [[-16, -6], [-17, -24], [-5, -34], [12, -31], [28, -21], [44, -13], [51, -7], [45, -2], [26, 2], [6, 6], [-8, 4]];
    const h = smooth(v ? HV.head(o, pts) : pts);
    if (v) HK.back(a, o);
    a.fill(o.head, h);
    if (o.powder) { a.fill('white', circ(22, -16, 9)); a.fill('red', circ(26, -12, 3.6)); }   // a powdered face with red cheeks (owner)
    if (!v) { a.fk('lilac', circ(-8, -30, 12), 2.2); a.fill('red', circ(-8, -30, 6)); }
    a.key(h, 2.6);
    if (v) { HV.eye(a, o); HV.face(a, o); HK.front(a, o); HV.ear(a, o); }
    else {
      a.fk('yellow', circ(14, -18, 7.5), 2); a.ink(circ(15, -18, 3.4));
      a.ink(circ(49.5, -7, 3));
      a.key(lines([[43, -9, 64, -17], [44, -6, 66, -7], [43, -3, 61, 3]]), 1.1);
      a.key(smooth([[45, -2], [38, 1], [32, -1]], false), 1.4);
    }
    if (o.hat && !o.hatk) {
      const hat = smooth([[-21, -19], [-15, -41], [4, -47], [19, -34], [6, -27], [-11, -19]]);
      a.fk(o.hat, hat, 2.2); a.fk('red', circ(-2, -47, 4.2), 1.4);
      a.key(lines([[-14, -26, 12, -34]]), 1.2);
    } else if (!(o.hair || o.hatk)) a.fk(o.trim, smooth([[-18, -19], [-7, -34], [4, -32], [-10, -15]]), 1.6);
  });
}
// base: a finished rig of the same sort (chương IV's individual mice): everything but the head is the same, so those parts are shared, not drawn again (memory: a village of rigs crashed phones)
function buildMouse(o, base) {
  const P = {}, sh = base && !o.fat, pp = (k, b, f) => (sh && base[k]) || part(b, f);
  P.tail = pp('tail', [-96, -66, 12, 22], a => { a.key(smooth([[0, 0], [-28, 10], [-58, -2], [-78, -28], [-70, -54]], false), 3.2); });
  P.leg = pp('leg', [-18, -8, 24, 50], a => {
    a.fk(o.leg || 'lilac', ell(0, 6, 8, 11), 2);                          // o.leg: trousers of that colour (chương IV profiles: a husband's quần)
    a.key(smooth([[1, 14], [3, 28], [-1, 40]], false), 3);
    a.key(lines([[-1, 40, 12, 44], [-1, 40, 5, 47], [-1, 40, -10, 44]]), 2);
  });
  P.body = pp('body', o.fat ? [-46, -76, 50, 14] : [-36, -76, 36, 14], a => {
    // o.fat (tranh 6's chú bán ếch, owner): a rounder, wider body with a belly bulging forward
    const b = o.fat ? smooth([[-28, -2], [-36, -24], [-30, -46], [-12, -61], [10, -61], [30, -48], [42, -24], [34, -3], [2, 6]]) : smooth([[-22, -2], [-27, -24], [-19, -48], [-5, -62], [10, -61], [23, -45], [27, -20], [19, -2], [0, 5]]);
    a.fill(o.robe, b);
    a.fill('lilac', o.fat ? ell(18, -24, 17, 20, -.1) : ell(12, -26, 10, 17, -.15));
    a.fill(o.trim, smooth([[-8, -58], [6, -63], [17, -54], [4, -50]]));
    const hem = o.fat ? smooth([[-30, -11], [-6, -5], [33, -10], [35, -3], [2, 6], [-28, -2]]) : smooth([[-24, -11], [-6, -5], [21, -9], [23, -2], [0, 5], [-22, -2]]); a.fill(o.trim, hem); a.key(hem, 1.4);
    a.key(b, 2.6);
    a.key(lines([[-10, -44, -15, -24, -12, -8], [0, -40, -2, -26, 2, -12]]), 1.3);
    if (o.dots) for (const [x, y] of [[-12, -30], [-6, -18], [-14, -44]]) a.fk('yellow', circ(x, y, 2.6), 1);
  });
  P.head = mouseHead(o);
  // o.skirt (chương IV, owner 2026-10-17: "vẽ luôn 1 chuột với váy"): a váy đụp of that plate, part of the mouse, not laid over it:
  // a sash at the waist, the skirt flaring to just above the feet with its folds, a darker band at the hem. c4Mouse / p4Mouse draw it
  // after the front leg, so only the shins and feet show under it.
  if (o.skirt) P.skirt = pp('skirt', o.fat ? [-46, -30, 50, 40] : [-36, -30, 36, 40], a => {
    const W = o.fat ? (pts => pts.map(([x, y]) => [x * 1.3 + 4, y])) : (pts => pts);   // a stout one: a wider skirt over the wider body
    const sk = smooth(W([[-26, -24], [0, -26], [26, -22], [29, 4], [33, 31], [16, 36], [0, 34], [-16, 36], [-33, 31], [-30, 4]]));
    a.fill(o.skirt, sk);
    a.fill(o.skirt === 'dark' ? 'brown' : 'dark', smooth(W([[-31, 22], [0, 23], [31, 22], [33, 31], [16, 36], [0, 34], [-16, 36], [-33, 31]])));
    const folds = [[[-14, -18], [-19, 22]], [[-2, -20], [-3, 23]], [[10, -18], [14, 22]], [[20, -14], [25, 21]]];
    a.key(lines(folds.map(f => W(f).flat())), 1.1);
    a.key(sk, 2.4);
    const sash = smooth(W([[-27, -28], [0, -29], [27, -25], [27, -18], [0, -21], [-27, -20]]));
    a.fk(o.skirt === 'red' ? 'yellow' : 'red', sash, 1.4);
  });
  P.arm = pp('arm', [-14, -12, 32, 44], a => {
    a.fk(o.robe, smooth([[-6, -4], [7, -6], [15, 10], [19, 25], [11, 29], [2, 15]]), 2.2);
    a.fk('lilac', ell(16, 31, 5, 4), 1.6);
    a.key(lines([[18, 33, 24, 38], [15, 34, 17, 40]]), 1.3);
  });
  return P;
}
const ITEM = {};
function buildItems() {
  ITEM.parasol = part([-66, -150, 66, 8], a => {
    a.key(lines([[0, 0, 0, -118]]), 3);
    const dome = smooth([[-60, -100], [-44, -128], [0, -142], [44, -128], [60, -100], [30, -104], [0, -106], [-30, -104]]);
    a.fill('dark', dome);
    for (let i = 0; i < 9; i++) { const t = -1 + i / 4; a.band('white', smooth([[0, -138], [t * 30, -122], [t * 56, -104]], false), 2.2); }
    const sc = [];
    for (let i = 0; i < 8; i++) { const x = -60 + i * 15; sc.push([x, -100], [x + 7.5, -88]); }
    sc.push([60, -100]);
    const scal = smooth([[-60, -101], ...sc, [60, -101], [0, -104]]);
    a.fill('red', scal); a.key(scal, 1.8); a.key(dome, 2.4);
    a.fk('red', circ(0, -144, 5), 1.5);
  });
  ITEM.drum = part([-30, -26, 30, 26], a => {
    const d = smooth([[-22, -18], [22, -18], [26, 0], [22, 18], [-22, 18], [-26, 0]]);
    a.fk('red', d, 2.4);
    a.fk('green', ell(-23, 0, 5, 18), 2); a.fk('green', ell(23, 0, 5, 18), 2);
    for (const x of [-12, 0, 12]) { a.ink(circ(x, -12, 1.8)); a.ink(circ(x, 12, 1.8)); }
    a.key(lines([[-10, -6, 10, 6], [-10, 6, 10, -6]]), 1.2);
  });
  ITEM.stick = part([-3, -3, 30, 5], a => { a.key(lines([[0, 0, 26, 0]]), 2.4); a.ink(circ(27, 0, 3)); });
  ITEM.ken = part([-4, -16, 58, 12], a => {
    const k = smooth([[0, -2], [36, -3], [48, -12], [56, -13], [56, 5], [48, 5], [36, 2], [0, 2]]);
    a.fk('yellow', k, 2); a.key(lines([[12, -3, 12, 2], [22, -3, 22, 2]]), 1.4);
  });
  ITEM.fish = part([-34, -14, 36, 14], a => {
    const f = smooth([[-24, 0], [-10, -10], [10, -10], [24, -2], [30, -10], [34, -8], [30, 0], [34, 8], [30, 10], [24, 2], [10, 10], [-10, 10]]);
    a.fk('white', f, 2);
    for (let i = 0; i < 5; i++) a.key(smooth([[-8 + i * 6, -7], [-5 + i * 6, 0], [-8 + i * 6, 7]], false), 1.1);
    a.fill('grey', ell(0, -5, 14, 3));
    a.ink(circ(-17, -2, 2.2)); a.key(lines([[-24, 2, -18, 3]]), 1.2);
  });
}
function buildCat() {
  const P = {};
  P.tail = part([-8, -70, 106, 22], a => {
    const t = tube([[0, 0], [30, 8], [62, 2], [84, -20], [84, -44], [72, -58]], 17, 7);
    a.fill('catY', t); a.key(t, 2.4);
    for (let i = 0; i < 5; i++) { const q = [[16, 0], [40, 3], [62, -2], [80, -24], [80, -46]][i]; a.band('catY2', lines([[q[0] - 5, q[1] - 7, q[0] + 5, q[1] + 7]]), 4); a.key(lines([[q[0] - 3, q[1] - 7, q[0] + 4, q[1] + 6]]), 1.4); }
  });
  P.body = part([-82, -124, 92, 14], a => {
    const b = smooth([[-50, 0], [-58, -34], [-48, -76], [-18, -106], [22, -106], [56, -80], [72, -40], [66, -4], [30, 4]]);
    a.fill('catY', b);
    for (const [x, y, rx, ry, ro] of [[10, -84, 26, 10, .3], [36, -58, 22, 9, .9], [44, -24, 18, 9, 1.3], [-8, -60, 14, 8, .2]]) a.fill('catY2', ell(x, y, rx, ry, ro));
    a.key(b, 2.8);
    for (let i = 0; i < 9; i++) {
      const t = i / 8, x = -10 + t * 66, y = -104 + t * 70;
      a.key(smooth([[x, y], [x - 8, y + 10], [x - 14, y + 24]], false), 1.8);
    }
    const leg1 = tube([[-34, -54], [-40, -28], [-44, -4]], 20, 18), leg2 = tube([[-16, -50], [-20, -24], [-22, -4]], 20, 18);
    a.fk('catY', leg2, 2.4); a.fk('catY', leg1, 2.4);
    for (const x of [-46, -24]) { a.fk('catY', ell(x, -3, 13, 6), 2); a.key(lines([[x - 5, -7, x - 6, 0], [x, -8, x, 0], [x + 5, -7, x + 6, 0]]), 1.2); }
    a.key(lines([[-48, -64, -42, -58], [-50, -56, -44, -50], [-46, -46, -40, -42]]), 1.3);
  });
  P.head = part([-92, -102, 44, 22], a => {
    const h = smooth([[-52, -8], [-57, -34], [-44, -58], [-16, -68], [12, -62], [28, -40], [26, -12], [8, 6], [-26, 10]]);
    const e1 = smooth([[-44, -54], [-40, -88], [-22, -62]]), e2 = smooth([[-6, -66], [10, -94], [20, -58]]);
    a.fk('catY', e1, 2.2); a.fk('catY', e2, 2.2);
    a.fill('red', smooth([[-38, -60], [-38, -80], [-28, -62]])); a.fill('red', smooth([[2, -64], [10, -84], [14, -60]]));
    a.fill('catY', h);
    a.fill('catY2', ell(-14, -54, 16, 6)); a.fill('catY2', ell(10, -34, 10, 14, .3));
    a.key(h, 2.8);
    a.key(lines([[-22, -64, -20, -52], [-12, -66, -12, -52], [-2, -64, -4, -52], [16, -46, 8, -42], [20, -34, 12, -32], [18, -22, 12, -22]]), 1.8);
    a.fill('red', smooth([[-58, -28], [-50, -30], [-53, -22]])); a.key(smooth([[-58, -28], [-50, -30], [-53, -22]]), 1.3);
    a.key(smooth([[-53, -22], [-52, -14], [-44, -12], [-38, -15]], false), 1.6);
    a.key(lines([[-50, -24, -86, -32], [-50, -20, -88, -18], [-48, -16, -82, -4], [-40, -22, -4, -28], [-40, -18, 0, -14]]), 1);
  });
  const eye = (kind) => part([-60, -52, 0, -22], a => {
    for (const [x, y] of [[-40, -36], [-15, -38]]) {
      if (kind === 'open') { a.fk('yellow', ell(x, y, 8.5, 6), 2); a.ink(ell(x, y, 2.2, 5.6)); }
      else if (kind === 'half') { a.fk('yellow', ell(x, y + 1, 8.5, 2.6), 2); a.ink(ell(x, y + 1, 2, 2.4)); }
      else if (kind === 'happy') a.key(smooth([[x - 8, y + 3], [x, y - 4], [x + 8, y + 3]], false), 2.4);
      else a.key(smooth([[x - 8, y], [x, y + 4], [x + 8, y]], false), 2.4);
    }
  });
  P.eyes = { open: eye('open'), half: eye('half'), closed: eye('closed'), happy: eye('happy') };
  return P;
}
