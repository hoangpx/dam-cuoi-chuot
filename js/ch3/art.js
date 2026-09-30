/* Chương III art, after the Đông Hồ print "Đàn gà mẹ con": red / green / yellow plates on white paper, black key block.
   The hen is plump and low, with a small ruffled comb, a hooked yellow beak holding a worm, rows of red / green / white
   scale feathers on her back, a green dotted wing and a fanned striped tail. Her tail, body and head are separate prints
   (so the tail's ink stays behind the body and the head can move). Chicks are little birds with striped yellow wing
   feathers, in five colourings like the print. */
let C3ART = null;
function c3Art() {
  if (C3ART) return C3ART;
  const leaf = (x0, y0, ang, len, w) => {            // a pointed feather from (x0,y0) along ang
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, mx = x0 + dx * len * .5, my = y0 + dy * len * .5;
    return smooth([[x0 + nx * w * .3, y0 + ny * w * .3], [mx + nx * w, my + ny * w], [x0 + dx * len, y0 + dy * len], [mx - nx * w, my - ny * w], [x0 - nx * w * .3, y0 - ny * w * .3]]);
  };
  const stripes = (a, x0, y0, ang, len, w, n, lw = 1.2) => {   // ink hatching across a feather
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, segs = [];
    for (let i = 1; i <= n; i++) { const k = .15 + i / (n + 1) * .75, cx = x0 + dx * len * k, cy = y0 + dy * len * k, ww = w * (1 - Math.abs(k - .5) * 1.2) * .75;
      segs.push([cx + nx * ww, cy + ny * ww, cx + dx * 6, cy + dy * 6, cx - nx * ww, cy - ny * ww]); }
    a.key(lines(segs), lw);
  };
  const scale = (x, y, s) => smooth([[x - s, y], [x - s * .7, y + s * 1.1], [x, y + s * 1.7], [x + s * .7, y + s * 1.1], [x + s, y]]);   // one U-shaped feather
  const scaleRows = (a, rows) => { for (const [x0, y0, n, s, cols] of rows) for (let i = 0; i < n; i++) { const x = x0 + i * s * 1.5, col = cols[i % cols.length]; a.fk(col, scale(x, y0 + Math.sin(i * .9) * 2, s), 1.2); } };
  const dots = (a, cx, cy, rx, ry, step) => { for (let y = -ry; y <= ry; y += step) for (let x = -rx; x <= rx; x += step) if ((x / rx) ** 2 + (y / ry) ** 2 < .8) a.ink(circ(cx + x + (y / step % 2 ? step / 2 : 0), cy + y, 1.3)); };

  // ---------- hen (faces right, feet at y 0) ----------
  const O = [-95, -165];
  const henTail = part([-340, -420, 20, 20], a => {
    const tail = [[2.75, 185, 'red'], [2.98, 212, 'green'], [3.2, 228, 'red'], [3.43, 236, 'green'], [3.66, 232, 'red'], [3.9, 220, 'green'], [4.13, 200, 'red'], [4.36, 172, 'green'], [4.58, 140, 'red']];
    for (const [ang, len, col] of tail) {
      a.fk(col, leaf(O[0], O[1], ang, len, 19), 2);
      a.band('yellow', smooth([[O[0] + Math.cos(ang) * 40, O[1] + Math.sin(ang) * 40], [O[0] + Math.cos(ang) * len * .8, O[1] + Math.sin(ang) * len * .8]], false), 3.6);
      stripes(a, O[0], O[1], ang, len, 14, 8);
    }
  });
  const henBody = sitting => part([-150, -320, 175, 14], a => {
    if (!sitting) for (const [x0, x1] of [[-8, -22], [42, 48]]) {
      a.fk('yellow', tube([[x0, -66], [(x0 + x1) / 2, -34], [x1, -8]], 17, 13), 2);
      a.key(lines([[x0 - 8, -52, x0 + 7, -55], [x1 - 8, -36, x1 + 7, -38], [x1 - 7, -22, x1 + 7, -23]]), 1.2);
      for (const [dx, dy] of [[32, 4], [18, 8], [-18, 5]]) a.fk('yellow', tube([[x1, -6], [x1 + dx, -6 + dy]], 7, 4), 1.6);
    }
    // body: yellow chest and belly
    a.fk('yellow', smooth([[-130, -170], [-80, -228], [0, -246], [70, -230], [112, -186], [118, -128], [96, -80], [40, -58], [-40, -58], [-104, -86], [-138, -130]]), 2.8);
    a.key(lines([[60, -150, 84, -148], [58, -130, 86, -128], [56, -110, 84, -108]]), 1);
    // back: rows of scale feathers, red / green / white like the print
    scaleRows(a, [
      [-96, -246, 8, 14, ['red', 'green']], [-112, -224, 10, 14, ['green', 'red']], [-122, -202, 10, 14, ['red', 'white', 'green']],
      [-128, -180, 9, 14, ['white']], [-132, -158, 8, 14, ['green', 'red']]]);
    // wing: long striped feathers to the back and a green dotted patch
    for (const [ang, len, col] of [[2.75, 128, 'red'], [2.9, 140, 'green'], [3.05, 132, 'red'], [3.2, 118, 'green']]) { a.fk(col, leaf(-10, -118, ang, len, 13), 1.8); stripes(a, -10, -118, ang, len, 10, 5); }
    a.fk('green', ell(36, -120, 44, 32, -.2), 2);
    dots(a, 36, -120, 38, 26, 8);
    // neck: small scale feathers up to the head
    a.fk('red', smooth([[42, -236], [72, -282], [108, -300], [140, -286], [138, -246], [110, -214], [74, -206]]), 2.4);
    scaleRows(a, [[64, -250, 4, 8, ['green', 'yellow']], [70, -232, 4, 8, ['yellow', 'green']], [80, -214, 3, 8, ['green']]]);
  });
  const henHead = part([-40, -52, 72, 44], a => {       // drawn at the neck point (118, -286), faces right
    for (const [x, y, r] of [[-12, -30, 8], [0, -36, 8], [12, -32, 7], [22, -24, 5]]) a.fk('red', circ(x, y, r), 1.8);
    a.fk('red', circ(0, 0, 30), 2.6);
    a.key(smooth([[-16, 10], [-6, 20], [10, 18]], false), 1.4);
    a.key(lines([[-22, -6, -12, -2], [-24, 4, -14, 6]]), 1.1);
    a.fk('green', circ(6, -6, 11), 1.6); a.fill('white', circ(7, -6, 7.5)); a.ink(circ(9, -6, 3.6)); a.key(circ(6, -6, 11), 1.4);
    a.fk('yellow', smooth([[24, -12], [52, -6], [60, 4], [44, 2], [26, 0]]), 2);
    a.fk('yellow', smooth([[26, 6], [46, 8], [30, 14]]), 1.6);
    a.fk('red', ell(22, 22, 5, 8), 1.4);
    a.key(smooth([[50, 6], [56, 16], [50, 26], [58, 34]], false), 3.2);   // the worm
  });
  const HEAD = [118, -286];
  // ---------- chicks (face right, feet at y 0; legs are drawn live so they can run) ----------
  const KINDS = [['red', 'green'], ['green', 'red'], ['yellow', 'red'], ['red', 'yellow'], ['green', 'yellow']];
  const chick = ([body, wing]) => part([-44, -74, 46, 4], a => {
    for (const [ang, len] of [[2.7, 30], [2.95, 34]]) a.fk(wing, leaf(-22, -30, ang, len, 7), 1.4);
    a.fk(body, smooth([[-28, -26], [-12, -46], [12, -46], [26, -32], [22, -12], [2, -6], [-20, -12]]), 2.2);
    a.fk(wing, smooth([[-20, -34], [4, -40], [12, -26], [-2, -16], [-22, -20]]), 1.8);
    for (const [ang, len] of [[2.9, 30], [3.05, 32], [3.2, 26]]) { a.fk('yellow', leaf(-2, -24, ang, len, 5), 1.2); stripes(a, -2, -24, ang, len, 4, 3, 1); }
    a.fk(body, circ(18, -52, 14), 2.2);
    a.fk('white', circ(22, -55, 6), 1.4); a.ink(circ(23.5, -55, 2.8));
    a.fk('yellow', smooth([[30, -58], [42, -54], [31, -50]]), 1.3);
    a.fk('yellow', smooth([[31, -49], [39, -47], [31, -45]]), 1.1);
    if (body !== 'red') a.fill('red', ell(16, -44, 3.6, 2.4));
  });
  // ---------- straw nest: the hollow and back rim, and the front rim drawn over whoever sits inside ----------
  const straw = (a, cx, cy, rx, ry, from, to, n) => { const segs = []; for (let i = 0; i < n; i++) { const t = from + (to - from) * i / n, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry; segs.push([x - 9, y - 2, x + 9, y + 3]); } a.key(lines(segs), 1.2); };
  const nestBack = part([-120, -60, 120, 40], a => {
    a.fk('yellow', ell(0, 0, 112, 40), 2.6);
    a.fill('brown', ell(0, -6, 84, 22));
    straw(a, 0, 0, 100, 32, Math.PI, Math.PI * 2, 18);
  });
  const nestFront = part([-120, -20, 120, 44], a => {
    const p = new Path2D(); p.ellipse(0, 0, 112, 40, 0, 0, Math.PI); p.ellipse(0, -2, 88, 20, 0, Math.PI, 0, true); p.closePath();
    a.fk('yellow', p, 2.4);
    straw(a, 0, 4, 98, 28, .15, Math.PI - .15, 16);
    a.key(smooth([[-100, 8], [-60, 22], [0, 28], [60, 22], [100, 8]], false), 1.2);
  });
  // ---------- the green mound the flock stands on ----------
  const mound = w => part([-w / 2 - 10, -40, w / 2 + 10, 30], a => {
    const pts = []; for (let i = 0; i <= 12; i++) { const x = -w / 2 + w * i / 12; pts.push([x, -14 - Math.sin(i * 1.3) * 8 - (i % 3 === 0 ? 10 : 0)]); }
    a.fk('green', smooth([[-w / 2, 24], ...pts, [w / 2, 24]]), 2.4);
    const segs = []; for (let i = 0; i < w / 26; i++) { const x = -w / 2 + 14 + i * 26; segs.push([x, 8, x + 6, -8]); } a.key(lines(segs), 1.3);
  });
  C3ART = { hen: { tail: henTail, body: henBody(false), head: henHead, headAt: HEAD }, henSit: { tail: henTail, body: henBody(true), head: henHead, headAt: HEAD },
    chicks: KINDS.map(chick), nestBack, nestFront, mound, moundCache: {} };
  return C3ART;
}
const c3Mound = w => { const A = c3Art(), k = Math.round(w / 40) * 40; return A.moundCache[k] || (A.moundCache[k] = A.mound(k)); };
// draw a hen: tail, body, then the head turned by headRot (it keeps moving while she sits or walks)
function c3Hen(g, h, x, y, rot = 0, headRot = 0) {
  dp(g, h.tail, x, y, rot); dp(g, h.body, x, y, rot);
  g.save(); g.translate(x, y); g.rotate(rot); dp(g, h.head, h.headAt[0], h.headAt[1], headRot); g.restore();
}
// where the top of the hen's head is, in the hen's own coordinates
const C3_HEAD_TOP = [118, -334];
