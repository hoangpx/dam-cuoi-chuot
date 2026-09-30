/* Landscape pieces: trees, pond, ditch, rooster, buffalo, basket, ducks… */
/* ---------- more woodblock parts for the puzzle levels ---------- */
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
function blob(cx, cy, r, seed, squash = .85) {
  const rn = mulberry(seed), n = 14, ph = rn() * 6.28, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.283, k = 1 + .12 * Math.sin(a * 5 + ph) + rn() * .06; pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * squash]); }
  return smooth(pts);
}
function leafy(a, cx, cy, r, seed) {
  const b = blob(cx, cy, r, seed); a.fill('green', b);
  a.fill('dark', blob(cx + r * .25, cy + r * .3, r * .55, seed + 1));
  a.key(b, 2.2);
  const rn = mulberry(seed + 7);
  for (let i = 0; i < r / 5; i++) { const x = cx + (rn() - .5) * r * 1.4, y = cy + (rn() - .5) * r; a.key(smooth([[x - 4, y - 3], [x, y + 2], [x + 4, y - 3]], false), 1.1); }
}
function buildWorldParts() {
  const P = {};
  /* gà trống (faces left) */
  P.rooster = part([-60, -150, 110, 8], a => {
    const cols = ['green', 'red', 'dark', 'green', 'red', 'dark', 'green'];
    for (let i = 0; i < 7; i++) {
      const ang = -1.5 + i * .26, L = 80 - i * 4;
      const t = tube([[14, -62], [16 + Math.cos(ang) * L * .45 + 12, -64 + Math.sin(ang) * L * .5 - 10], [24 + Math.cos(ang) * L + 22, -56 + Math.sin(ang) * L * .75]], 13, 4);
      a.fk(cols[i], t, 1.8);
    }
    const b = smooth([[-30, -44], [-24, -72], [-2, -84], [26, -76], [36, -54], [26, -30], [0, -22], [-22, -26]]);
    a.fill('yellow', b);
    const w = smooth([[-8, -64], [20, -68], [34, -52], [18, -34], [-4, -40]]);
    a.fill('red', w); a.key(b, 2.6); a.key(w, 1.8);
    for (let i = 0; i < 4; i++) a.key(smooth([[i * 8, -60], [4 + i * 8, -50], [i * 8, -40]], false), 1.2);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) a.key(smooth([[-22 + i * 7, -64 + r * 9], [-19 + i * 7, -60 + r * 9], [-16 + i * 7, -64 + r * 9]], false), 1);
    a.key(lines([[-6, -24, -10, -2], [8, -24, 6, -2]]), 3.4);
    a.key(lines([[-10, -2, -22, 2], [-10, -2, -12, 5], [-10, -2, -2, 3], [6, -2, -6, 2], [6, -2, 4, 5], [6, -2, 14, 3]]), 2);
  });
  P.rHead = part([-46, -60, 18, 16], a => {
    const neck = smooth([[-4, 10], [-16, -6], [-14, -30], [0, -34], [10, -18], [10, 6]]);
    a.fill('yellow', neck);
    for (let i = 0; i < 4; i++) a.key(lines([[-12 + i * 5, -14, -8 + i * 5, 4]]), 1.2);
    a.key(neck, 2.2);
    a.fk('red', circ(-6, -32, 11), 2.2);
    a.fk('red', smooth([[-16, -40], [-14, -53], [-8, -46], [-4, -57], [2, -46], [8, -51], [8, -38], [-6, -40]]), 2);
    a.fk('yellow', smooth([[-16, -35], [-31, -29], [-16, -25]]), 1.8);
    a.fk('red', ell(-14, -18, 4, 7), 1.6);
    a.fk('yellow', circ(-8, -34, 3.8), 1.4); a.ink(circ(-8.5, -34, 1.7));
  });
  P.rWing = part([-56, -120, 50, 4], a => {
    a.fk('red', smooth([[0, 0], [-30, -40], [-48, -100], [-12, -72], [0, -112], [14, -70], [42, -94], [30, -30]]), 2.2);
    for (let i = 0; i < 5; i++) a.key(lines([[0, -6, -36 + i * 17, -84 + Math.abs(i - 2) * 9]]), 1.3);
  });
  P.fence = part([-165, -134, 165, 6], a => {
    for (let x = -150; x <= 150; x += 26) { const h = 104 + Math.abs((x * 7) % 13); a.fk('straw', smooth([[x - 6, 0], [x - 6, -h], [x, -h - 12], [x + 6, -h], [x + 6, 0]]), 1.8); }
    for (const y of [-30, -82]) { a.fk('green', smooth([[-162, y - 5], [162, y - 7], [162, y + 3], [-162, y + 5]]), 2); for (let x = -140; x < 160; x += 60) a.key(lines([[x, y - 5, x, y + 4]]), 1.4); }
  });
  /* nhà mái ngói */
  P.house = part([-285, -262, 285, 8], a => {
    a.fk('white', rect(-230, -150, 460, 150), 2.4);
    for (const x of [-230, -120, 0, 120, 216]) a.fk('brown', rect(x - (x === 216 ? 0 : 7), -150, 14, 150), 1.8);
    a.fk('dark', rect(-40, -112, 80, 112), 2);
    a.key(lines([[0, -112, 0, 0]]), 1.6);
    for (const x of [-190, 140]) { a.fk('red', rect(x, -112, 56, 42), 2); a.key(lines([[x + 14, -112, x + 14, -70], [x + 28, -112, x + 28, -70], [x + 42, -112, x + 42, -70]]), 1.4); }
    const roof = smooth([[-282, -138], [-266, -154], [-212, -236], [212, -236], [266, -154], [282, -138], [240, -146], [-240, -146]]);
    a.fk('dark', roof, 2.6);
    for (let r = 0; r < 4; r++) {
      const y = -160 - r * 20, hw = 258 - (r + .3) * 13;
      const pts = []; for (let x = -hw; x <= hw; x += 18) pts.push([x, y], [x + 9, y + 5]);
      a.band('white', smooth(pts, false), 1.6);
    }
    a.fk('green', smooth([[-216, -234], [-248, -254], [-204, -246], [204, -246], [248, -254], [216, -234]]), 2);
  });
  /* cây bưởi */
  P.pomelo = part([-150, -330, 150, 8], a => {
    a.fk('brown', tube([[0, 0], [-6, -80], [4, -170]], 26, 14), 2.4);
    a.key(lines([[-4, -110, -40, -150], [4, -140, 44, -176]]), 6);
    for (const [x, y, r, s] of [[-86, -168, 44, 3], [82, -176, 46, 4], [-58, -212, 60, 5], [48, -226, 66, 6], [-8, -268, 62, 7]]) leafy(a, x, y, r, s);
    for (const [x, y] of [[-40, -176], [70, -198], [-80, -150], [16, -244]]) { a.fk('yellow', circ(x, y, 13), 2); a.fill('green', ell(x - 4, y - 5, 4, 3)); }
  });
  P.fruit = part([-17, -22, 17, 16], a => { a.fk('yellow', circ(0, 0, 14), 2.2); a.fill('green', ell(-5, -5, 4, 3)); a.key(lines([[0, -14, 2, -20]]), 2); a.fk('green', ell(6, -18, 6, 3, -.4), 1.2); });
  /* cây đa có cành ngang để treo giỏ */
  P.bigTree = part([-170, -350, 210, 8], a => {
    a.fk('brown', tube([[0, 0], [8, -90], [0, -190]], 40, 22), 2.6);
    a.fk('brown', tube([[4, -190], [80, -214], [170, -222]], 20, 8), 2.2);
    for (let i = 0; i < 6; i++) a.key(lines([[-16 + i * 7, -10, -12 + i * 6, -150]]), 1.2);
    for (const [x, y, r, s] of [[-90, -230, 60, 11], [-10, -280, 72, 12], [70, -262, 56, 13], [140, -250, 44, 14], [-120, -190, 40, 15]]) leafy(a, x, y, r, s);
    for (let i = 0; i < 6; i++) a.key(smooth([[-60 + i * 20, -200], [-62 + i * 20, -160], [-58 + i * 20, -120]], false), 1.4);
  });
  P.basket = part([-28, -34, 28, 22], a => {
    a.fk('white', smooth([[6, -18], [14, -32], [20, -30], [16, -18]]), 1.4);
    const b = smooth([[-22, -18], [22, -18], [18, 18], [-18, 18]]);
    a.fk('straw', b, 2.2);
    for (let i = -2; i <= 2; i++) a.key(lines([[i * 8 - 4, -16, i * 8 + 4, 16], [i * 8 + 4, -16, i * 8 - 4, 16]]), 1);
    a.fk('brown', ell(0, -18, 23, 5), 1.8);
  });
  P.sparrow = part([-22, -16, 24, 12], a => {
    a.fk('brown', smooth([[-16, 0], [-6, -10], [10, -8], [14, 2], [2, 8], [-10, 6]]), 1.8);
    a.fk('dark', smooth([[-4, -6], [8, -6], [2, 4], [-8, 2]]), 1.2);
    a.fk('brown', circ(12, -8, 6), 1.6); a.fk('yellow', smooth([[17, -9], [23, -7], [17, -5]]), 1);
    a.ink(circ(13, -9, 1.3));
    a.fk('dark', smooth([[-16, 0], [-22, -6], [-22, 4]]), 1.2);
  });
  /* ao: nước in đen, sóng trắng, lá sen */
  P.pondFor = (w, wpl = 'dark') => part([-6, -16, w + 6, 48], a => {
    const top = []; for (let x = 0; x <= w; x += 16) top.push([x, -6 + Math.sin(x * .05) * 3]);
    a.fill(wpl, smooth([[0, 48], ...top, [w, 48]]));
    const rn = mulberry(w | 0);
    for (let i = 0; i < w / 14; i++) { const x = rn() * (w - 40) + 10, y = 4 + rn() * 34, l = 18 + rn() * 26; a.band('white', smooth([[x, y], [x + l * .25, y - 3], [x + l * .5, y], [x + l * .75, y - 3], [x + l, y]], false), 1.6); }
    for (let i = 0; i < w / 90; i++) { const x = 30 + rn() * (w - 60), y = 10 + rn() * 26, r = 12 + rn() * 8; const lf = new Path2D(); lf.moveTo(x, y); lf.arc(x, y, r, .4, 6.0); lf.closePath(); a.fk('green', lf, 1.6); }
    const fx = w * .7, fy = 6;
    for (let i = 0; i < 6; i++) { const an = -Math.PI + i * .63; a.fk('red', ell(fx + Math.cos(an) * 8, fy - 6 + Math.sin(an) * 8, 8, 4, an), 1.3); }
    a.fk('yellow', circ(fx, fy - 8, 4), 1.2);
  });
  P.ditchFor = w => part([-8, -12, w + 8, 54], a => {
    const hole = smooth([[0, -4], [8, 40], [w / 2, 50], [w - 8, 40], [w, -4]]);
    a.fill('brown', hole);
    a.fill('dark', smooth([[12, 24], [w / 2, 46], [w - 12, 24], [w / 2, 30]]));
    a.band('white', smooth([[w * .3, 34], [w * .4, 31], [w * .5, 34], [w * .6, 31], [w * .7, 34]], false), 1.6);
    a.key(hole, 2.4);
    for (let i = 0; i < 5; i++) a.key(lines([[10 + i * (w - 20) / 4, 6, 14 + i * (w - 20) / 4, 16]]), 1.2);
  });
  P.duck = part([-52, -54, 42, 10], a => {
    a.fk('white', tube([[-22, -10], [-27, -30]], 11, 9), 2);
    const b = smooth([[-30, -8], [-26, -26], [0, -34], [26, -30], [38, -40], [36, -20], [24, -4], [-10, 2]]);
    a.fk('white', b, 2.2);
    a.fill('grey', smooth([[-6, -26], [22, -26], [16, -12], [-4, -14]]));
    a.key(lines([[0, -24, 16, -16], [4, -20, 18, -12]]), 1.2);
    a.fk('green', circ(-28, -36, 11), 2);
    a.fk('yellow', smooth([[-37, -39], [-50, -34], [-37, -30]]), 1.6);
    a.ink(circ(-30, -39, 1.9));
    a.band('white', lines([[-34, -27, -20, -27]]), 2);
  });
  P.hawk = part([-112, -52, 112, 40], a => {
    const w = smooth([[-106, -6], [-72, -36], [-30, -20], [0, -10], [30, -20], [72, -36], [106, -6], [72, 4], [40, -2], [20, 12], [-20, 12], [-40, -2], [-72, 4]]);
    a.fk('brown', w, 2.4);
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const x = s * (60 + i * 9); a.fk('dark', tube([[x, -8 + i], [x + s * 8, 8 + i * 2]], 7, 3), 1.2); }
    for (const s of [-1, 1]) a.band('yellow', smooth([[s * 20, -12], [s * 50, -22], [s * 80, -18]], false), 3);
    a.fk('brown', ell(0, 0, 26, 12), 2.2);
    a.fk('dark', smooth([[-24, -6], [-54, -12], [-54, 12], [-24, 8]]), 1.8);
    a.fk('white', circ(32, -4, 10), 2); a.fk('yellow', smooth([[40, -6], [50, -2], [42, 4]]), 1.4);
    a.fk('yellow', circ(34, -7, 3), 1); a.ink(circ(34.5, -7, 1.4));
  });
  const buffalo = lying => part(lying ? [-215, -175, 185, 8] : [-215, -262, 185, 8], a => {
    const dy = lying ? 98 : 0;
    if (!lying) for (const x of [-96, -58, 76, 112]) { a.fk('grey', tube([[x, -112], [x - 2, -52], [x, -8]], 26, 20), 2.2); a.fk('dark', ell(x, -4, 13, 6), 1.6); }
    else for (const x of [-100, 60]) a.fk('grey', ell(x, -10, 34, 12), 2);
    a.key(lines([[146, -182 + dy, 162, -100 + dy]]), 2.4); a.ink(ell(163, -96 + dy, 5, 10));
    const body = smooth([[-132, -120 + dy], [-122, -192 + dy], [-40, -216 + dy], [80, -214 + dy], [142, -188 + dy], [152, -130 + dy], [112, -104 + dy], [-90, -104 + dy]]);
    a.fk('grey', body, 2.8);
    const cx = 24, cy = -160 + dy, r = 34, sw = new Path2D();
    sw.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2); sw.arc(cx, cy + r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true); sw.arc(cx, cy - r / 2, r / 2, Math.PI / 2, -Math.PI / 2); sw.closePath();
    a.fill('yellow', circ(cx, cy, r)); a.fill('red', sw); a.key(circ(cx, cy, r), 2);
    const cr = new Path2D(); cr.arc(-66, -160 + dy, 26, 1.9, 5.2); cr.arc(-58, -160 + dy, 20, 5.0, 2.1, true); cr.closePath(); a.fk('yellow', cr, 1.6);
    for (let i = 0; i < 6; i++) a.key(smooth([[-20 + i * 16, -210 + dy], [-14 + i * 16, -202 + dy], [-8 + i * 16, -210 + dy]], false), 1.2);
    const hx = -150, hy = (lying ? -80 : -168), hr = lying ? .25 : 0;
    const hd = smooth([[hx + 22, hy - 28], [hx - 26, hy - 22], [hx - 50, hy + 18], [hx - 40, hy + 50], [hx - 10, hy + 48], [hx + 16, hy + 18]]);
    a.fk('white', tube([[hx + 2, hy - 24], [hx - 22, hy - 62], [hx + 12, hy - 84]], 13, 4), 2);
    a.fk('grey', hd, 2.6);
    a.fk('white', tube([[hx + 16, hy - 26], [hx + 34, hy - 64], [hx + 62, hy - 74]], 12, 4), 2);
    a.fk('lilac', ell(hx - 38, hy + 38, 15, 12), 1.8); a.ink(circ(hx - 44, hy + 38, 2.4)); a.ink(circ(hx - 34, hy + 40, 2.4));
    if (lying) a.key(smooth([[hx - 26, hy + 2], [hx - 18, hy + 6], [hx - 10, hy + 2]], false), 2);
    else { a.fk('yellow', circ(hx - 18, hy + 2, 6), 1.6); a.ink(circ(hx - 19, hy + 2, 2.6)); }
    a.fk('grey', ell(hx + 22, hy - 12, 13, 6, -.5), 1.6);
    void hr;
  });
  P.bufStand = buffalo(false); P.bufLie = buffalo(true);
  P.note = part([-9, -24, 14, 7], a => { a.ink(ell(0, 0, 6, 4.5, -.4)); a.key(lines([[5, -2, 5, -21]]), 2); a.key(smooth([[5, -21], [11, -16], [11, -9]], false), 2); });
  P.tung = part([-60, -26, 60, 26], a => { a.text('Tùng!', 3, 3, 36, 'yellow', '"Playfair Display", serif', 'color', 900); a.text('Tùng!', 0, 0, 36, 'dark', '"Playfair Display", serif', 'ink', 900); });
  P.hanFor = str => part([-34, -str.length * 42, 34, str.length * 42], a => str.split('').forEach((ch, i) => a.text(ch, 0, -str.length * 42 + 42 + i * 84, 70, 'dark', undefined, 'ink')));
  return P;
}
