/* Mice, carried items and the big cat. */
/* ---------- characters ---------- */
function buildMouse(o) {
  const P = {};
  P.tail = part([-96, -66, 12, 22], a => { a.key(smooth([[0, 0], [-28, 10], [-58, -2], [-78, -28], [-70, -54]], false), 3.2); });
  P.leg = part([-18, -8, 24, 50], a => {
    a.fk('lilac', ell(0, 6, 8, 11), 2);
    a.key(smooth([[1, 14], [3, 28], [-1, 40]], false), 3);
    a.key(lines([[-1, 40, 12, 44], [-1, 40, 5, 47], [-1, 40, -10, 44]]), 2);
  });
  P.body = part([-36, -76, 36, 14], a => {
    const b = smooth([[-22, -2], [-27, -24], [-19, -48], [-5, -62], [10, -61], [23, -45], [27, -20], [19, -2], [0, 5]]);
    a.fill(o.robe, b);
    a.fill('lilac', ell(12, -26, 10, 17, -.15));
    a.fill(o.trim, smooth([[-8, -58], [6, -63], [17, -54], [4, -50]]));
    const hem = smooth([[-24, -11], [-6, -5], [21, -9], [23, -2], [0, 5], [-22, -2]]); a.fill(o.trim, hem); a.key(hem, 1.4);
    a.key(b, 2.6);
    a.key(lines([[-10, -44, -15, -24, -12, -8], [0, -40, -2, -26, 2, -12]]), 1.3);
    if (o.dots) for (const [x, y] of [[-12, -30], [-6, -18], [-14, -44]]) a.fk('yellow', circ(x, y, 2.6), 1);
  });
  P.head = part([-34, -58, 70, 14], a => {
    const h = smooth([[-16, -6], [-17, -24], [-5, -34], [12, -31], [28, -21], [44, -13], [51, -7], [45, -2], [26, 2], [6, 6], [-8, 4]]);
    a.fill(o.head, h);
    if (o.powder) { a.fill('white', circ(22, -16, 9)); a.fill('red', circ(26, -12, 3.6)); }   // a powdered face with red cheeks (owner)
    a.fk('lilac', circ(-8, -30, 12), 2.2); a.fill('red', circ(-8, -30, 6));
    a.key(h, 2.6);
    a.fk('yellow', circ(14, -18, 7.5), 2); a.ink(circ(15, -18, 3.4));
    a.ink(circ(49.5, -7, 3));
    a.key(lines([[43, -9, 64, -17], [44, -6, 66, -7], [43, -3, 61, 3]]), 1.1);
    a.key(smooth([[45, -2], [38, 1], [32, -1]], false), 1.4);
    if (o.hat) {
      const hat = smooth([[-21, -19], [-15, -41], [4, -47], [19, -34], [6, -27], [-11, -19]]);
      a.fk(o.hat, hat, 2.2); a.fk('red', circ(-2, -47, 4.2), 1.4);
      a.key(lines([[-14, -26, 12, -34]]), 1.2);
    } else a.fk(o.trim, smooth([[-18, -19], [-7, -34], [4, -32], [-10, -15]]), 1.6);
  });
  P.arm = part([-14, -12, 32, 44], a => {
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
