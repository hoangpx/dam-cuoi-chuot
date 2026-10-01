/* Chương IV art: the stalls, the market gate; the mouse and animal rigs; speech bubbles sized to their words.
   Parts are built lazily (first use), after the fonts are in. */
let C4ART = null;
// straight-edged shapes (smooth() rounds every corner, which turns posts and boards into eggs)
const c4Poly = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; };
const c4Rect = (x0, y0, x1, y1) => c4Poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
function c4Art() {
  if (C4ART) return C4ART;
  const heap = (a, x, y, w) => {                                          // a heap of betel leaves and areca nuts
    for (let i = 0; i < 5; i++) { const lx = x - w / 2 + 6 + i * (w - 12) / 4, ly = y - 4 - (i % 2) * 5; const lf = smooth([[lx, ly + 6], [lx - 9, ly - 3], [lx, ly - 12], [lx + 9, ly - 3]]); a.fk('green', lf, 1.2); a.key(smooth([[lx, ly + 5], [lx, ly - 8]], false), .8); }
    for (let i = 0; i < 3; i++) { a.fk('yellow', circ(x - w / 4 + i * w / 4, y - 14 - (i % 2) * 4, 5.5), 1.2); a.fill('green', ell(x - w / 4 + i * w / 4 + 1, y - 18 - (i % 2) * 4, 2.5, 1.5)); }
  };
  const basket = (a, x, goods = heap) => {
    a.fk('straw', smooth([[x - 30, -40], [x + 30, -40], [x + 26, -4], [x - 26, -4]]), 2);
    a.key(lines([[x - 28, -28, x + 28, -28], [x - 27, -16, x + 27, -16]]), 1);
    for (let i = -2; i <= 2; i++) a.key(lines([[x + i * 11, -40, x + i * 10, -4]]), .9);
    a.key(lines([[x - 26, -40, x - 4, -96], [x + 26, -40, x + 4, -96]]), 1.4);      // the strings up to the pole
    goods(a, x, -40, 56);
  };
  const ganh = part([-110, -112, 110, 4], a => {                          // two baskets on a shoulder pole, set down
    basket(a, -62); basket(a, 62);
    a.fk('brown', smooth([[-96, -98], [0, -104], [96, -98], [96, -94], [0, -100], [-96, -94]]), 1.6);
  });
  const sap = part([-150, -250, 150, 6], a => {                           // bamboo frame under a leaf-thatch roof, low table
    for (const x of [-128, 128]) a.fk('straw', c4Rect(x - 5, -200, x + 5, 0), 1.6);
    a.fk('dark', c4Poly([[-150, -190], [-118, -238], [118, -238], [150, -190], [0, -184]]), 2.4);
    for (let i = 0; i < 9; i++) a.key(smooth([[-110 + i * 28, -232], [-118 + i * 30, -192]], false), 1.1);
    a.band('straw', smooth([[-146, -190], [0, -183], [146, -190]], false), 3);
    a.fk('brown', c4Rect(-118, -64, 118, -54), 1.8);
    for (const x of [-104, 104]) a.fk('brown', c4Rect(x - 4, -56, x + 4, 0), 1.4);
    for (const x of [-70, 0, 70]) { a.fk('green', ell(x, -68, 30, 6), 1.2); heap(a, x, -68, 48); }
  });
  const gian = part([-180, -300, 180, 6], a => {                          // a tiled stall with a carved sign
    for (const x of [-140, 140]) a.fk('red', c4Rect(x - 8, -230, x + 8, 0), 1.8);
    a.fk('brown', c4Poly([[-178, -236], [-152, -264], [-40, -278], [40, -278], [152, -264], [178, -236], [150, -226], [0, -232], [-150, -226]]), 2.4);
    for (let i = 0; i < 12; i++) a.key(smooth([[-150 + i * 27, -266], [-158 + i * 29, -228]], false), 1);
    a.fk('yellow', c4Rect(-70, -214, 70, -184), 2);
    a.text('TRẦU CAU', 0, -199, 19, 'dark', '"Playfair Display", serif', 'ink', 900);
    a.fk('red', c4Rect(-130, -76, 130, -64), 1.8);
    a.fk('brown', c4Poly([[-126, -64], [126, -64], [122, 0], [-122, 0]]), 1.8);
    for (let i = -2; i <= 2; i++) a.key(lines([[i * 48, -60, i * 48, -4]]), 1);
    for (const x of [-84, -28, 28, 84]) { a.fk('green', ell(x, -80, 26, 5), 1.2); heap(a, x, -80, 42); }
  });
  const gate = part([-140, -330, 140, 6], a => {                          // the market gate with its name board
    for (const x of [-104, 104]) a.fk('brown', c4Rect(x - 10, -270, x + 10, 0), 2);
    a.fk('dark', c4Poly([[-140, -262], [-108, -302], [108, -302], [140, -262], [0, -256]]), 2.4);
    for (let i = 0; i < 8; i++) a.key(smooth([[-96 + i * 27, -296], [-104 + i * 29, -264]], false), 1);
    a.fk('red', circ(0, -312, 9), 1.6);
    a.fk('white', c4Rect(-80, -244, 80, -204), 2);
    a.text('CHỢ LÀNG', 0, -224, 24, 'dark', '"Playfair Display", serif', 'ink', 900);
  });
  const scaffold = part([-160, -270, 160, 4], a => {
    const p = []; for (const x of [-140, -60, 20, 100, 150]) p.push([x, 0, x + 4, -250]); for (const y of [-60, -130, -200]) p.push([-150, y, 156, y - 6]);
    a.band('straw', lines(p), 5); a.key(lines(p), 1.4);
  });
  // the neighbours' wares: fish in baskets, bolts of cloth on a little table, rice cakes on a tray
  const fishes = (a, x, y, w) => { for (let i = 0; i < 3; i++) { const fx = x - w / 3 + i * w / 3, fy = y - 8 - (i % 2) * 6; a.fk('grey', smooth([[fx - 14, fy], [fx - 2, fy - 6], [fx + 10, fy], [fx - 2, fy + 5]]), 1.2); a.fk('grey', c4Poly([[fx + 9, fy], [fx + 17, fy - 6], [fx + 17, fy + 6]]), 1); a.ink(circ(fx - 8, fy - 1, 1.3)); } };
  const hangCa = part([-110, -112, 110, 4], a => { basket(a, -62, fishes); basket(a, 62, fishes); a.fk('brown', smooth([[-96, -98], [0, -104], [96, -98], [96, -94], [0, -100], [-96, -94]]), 1.6); });
  const hangVai = part([-100, -110, 100, 6], a => {
    a.fk('brown', c4Rect(-90, -60, 90, -50), 1.6); for (const x of [-80, 80]) a.fk('brown', c4Rect(x - 4, -52, x + 4, 0), 1.3);
    [['red', -50], ['green', 0], ['yellow', 50]].forEach(([c, x], i) => { a.fk(c, c4Rect(x - 22, -96 + i * 4, x + 22, -60), 1.6); a.key(lines([[x - 22, -84 + i * 4, x + 22, -84 + i * 4]]), 1); });
  });
  const hangBanh = part([-90, -60, 90, 6], a => {
    a.fk('straw', ell(0, -22, 80, 14), 2); a.fk('brown', c4Rect(-6, -14, 6, 0), 1.2);
    for (let i = 0; i < 5; i++) { a.fk('white', ell(-56 + i * 28, -36, 14, 6), 1.2); a.key(lines([[-66 + i * 28, -38, -46 + i * 28, -34]]), .8); }
  });
  // the couple's other stalls: green tea, sticky rice, haberdashery, crab noodle soup
  const table = (a, w) => { a.fk('brown', c4Rect(-w, -62, w, -52), 1.6); for (const x of [-w + 10, w - 10]) a.fk('brown', c4Rect(x - 4, -54, x + 4, 0), 1.3); };
  const bowl = (a, x, y, col = 'white') => { a.fk(col, smooth([[x - 12, y - 6], [x + 12, y - 6], [x + 8, y + 4], [x - 8, y + 4]]), 1.2); a.key(lines([[x - 9, y - 2, x + 9, y - 2]]), .8); };
  const che = part([-110, -150, 110, 6], a => {                           // a big clay pot of green tea on a stove, bowls
    table(a, 100);
    a.fk('brown', ell(-40, -96, 34, 36), 2.2); a.fk('dark', ell(-40, -128, 18, 5), 1.4); a.fk('brown', smooth([[-8, -106], [12, -118], [16, -112], [-6, -98]]), 1.4);
    a.fk('green', ell(-40, -132, 12, 4), 1); a.key(lines([[-62, -96, -18, -96]]), 1);
    for (const x of [24, 52, 80]) { bowl(a, x, -70); a.fill('green', ell(x, -75, 9, 2.4)); }
  });
  const xoi = part([-110, -130, 110, 6], a => {                           // a basket of sticky rice under a banana leaf, packets
    table(a, 100);
    a.fk('straw', smooth([[-80, -64], [-10, -64], [-16, -108], [-74, -108]]), 2); a.key(lines([[-78, -86, -12, -86]]), 1);
    a.fk('green', smooth([[-84, -106], [-46, -126], [-6, -106], [-46, -98]]), 1.6);
    for (const x of [16, 46, 76]) { a.fk('green', smooth([[x - 12, -64], [x + 12, -64], [x + 10, -80], [x - 10, -80]]), 1.4); a.fk('yellow', ell(x, -80, 8, 3), 1); a.key(lines([[x, -64, x, -80]]), .8); }
  });
  const xen = part([-110, -130, 110, 6], a => {                           // needles and thread, combs, small boxes, a little mirror
    table(a, 100);
    const c = ['red', 'green', 'yellow', 'blue', 'red'];
    for (let i = 0; i < 5; i++) { const x = -78 + i * 38; a.fk(c[i], c4Rect(x - 13, -86, x + 13, -64), 1.4); a.key(lines([[x - 13, -76, x + 13, -76]]), .8); }
    a.fk('white', circ(-60, -104, 12), 1.4); a.fk('brown', c4Rect(-63, -92, -57, -86), 1);
    for (let i = 0; i < 4; i++) a.fk(['red', 'yellow', 'green', 'blue'][i], circ(10 + i * 22, -96, 7), 1.2);
  });
  const bun = part([-120, -150, 120, 6], a => {                           // a pot of crab noodle soup on a stove, bowls, herbs
    table(a, 110);
    a.fk('dark', c4Rect(-90, -80, -20, -62), 1.6); a.fill('red', ell(-55, -80, 26, 5));
    a.fk('dark', smooth([[-92, -82], [-18, -82], [-24, -128], [-86, -128]]), 2.2); a.fill('red', ell(-55, -128, 30, 6)); a.key(ell(-55, -128, 30, 6), 1.4);
    for (const x of [6, 40, 74]) { bowl(a, x, -70); a.fill('red', ell(x, -75, 9, 2.4)); a.fill('green', circ(x + 3, -77, 2)); }
    a.fk('green', smooth([[90, -64], [104, -64], [100, -88], [94, -88]]), 1.2);
  });
  const lot = part([-66, -120, 66, 6], a => {                             // an empty plot: a stake with a board
    a.fk('brown', c4Rect(-5, -70, 5, 0), 1.4);
    a.fk('white', c4Rect(-62, -116, 62, -70), 2);
    for (const x of [-30, 30]) a.key(lines([[x - 8, 0, x + 8, -3]]), 1);
  });
  C4ART = { ganh, sap, gian, gate, scaffold, hangCa, hangVai, hangBanh, che, xoi, xen, bun, lot };
  return C4ART;
}
const c4StallArt = lv => { const A = c4Art(); return [A.ganh, A.sap, A.gian][lv]; };

// a mouse: chương I's woodblock rig (legs, tail, arm, body, head), standing on y; the tail sways on the mouse's own
// beat (seed), never on its position (that jittered as it walked)
function c4Mouse(g, M, x, face, ph, moving, arm = null, carry = null, s = 1, y = GROUND, seed = 0) {
  const sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : 0;
  g.save(); g.translate(x, y); g.scale(face * s, s);
  const hy = -45 + bob, armN = arm === null ? sw * .4 : arm;
  dp(g, M.tail, -18, hy + 2, Math.sin(C4.t * 2.4 + seed) * .12);
  dp(g, M.leg, 6, hy, sw * .55);
  dp(g, M.arm, 2, hy - 50, -sw * .4);
  dp(g, M.body, 0, hy, .04);
  dp(g, M.leg, -2, hy, -sw * .55);
  dp(g, M.head, 6, hy - 60, Math.sin(ph * 2) * .04);
  const ax = 10, ay = hy - 52, hx = ax + 16 * Math.cos(armN) - 31 * Math.sin(armN), hyy = ay + 16 * Math.sin(armN) + 31 * Math.cos(armN);
  if (carry) dp(g, carry, hx + 4, hyy + (carry === WP.basket ? -16 : 6), 0, carry === WP.basket ? 1.1 : .9, carry === WP.basket ? 1.1 : .9);
  g.restore();
}
// many sorts of mice at the market: grown-ups in all colours (some in conical hats), old ones with a stick, children
const C4_MOUSE_SORTS = [
  { o: { robe: 'yellow', trim: 'red', head: 'brown' }, role: 'adult' },
  { o: { robe: 'blue', trim: 'yellow', head: 'dark' }, role: 'adult' },
  { o: { robe: 'straw', trim: 'brown', head: 'brown' }, role: 'adult', non: true },
  { o: { robe: 'red', trim: 'yellow', head: 'dark', dots: true }, role: 'adult' },
  { o: { robe: 'green', trim: 'red', head: 'grey' }, role: 'adult', non: true },
  { o: { robe: 'lilac', trim: 'green', head: 'brown' }, role: 'adult' },
  { o: { robe: 'white', trim: 'blue', head: 'dark', hat: 'dark' }, role: 'adult' },
  { o: { robe: 'brown', trim: 'yellow', head: 'grey' }, role: 'adult', non: true },
  { o: { robe: 'white', trim: 'brown', head: 'grey', hat: 'dark' }, role: 'old' },
  { o: { robe: 'brown', trim: 'lilac', head: 'grey' }, role: 'old' },
  { o: { robe: 'grey', trim: 'red', head: 'grey', hat: 'dark' }, role: 'old' },
  { o: { robe: 'red', trim: 'yellow', head: 'brown' }, role: 'child' },
  { o: { robe: 'green', trim: 'yellow', head: 'dark' }, role: 'child' },
  { o: { robe: 'yellow', trim: 'green', head: 'grey' }, role: 'child' },
];
let C4_MOUSE_RIGS = null;
const c4MouseRig = i => { if (!C4_MOUSE_RIGS) C4_MOUSE_RIGS = []; return C4_MOUSE_RIGS[i] || (C4_MOUSE_RIGS[i] = buildMouse(C4_MOUSE_SORTS[i].o)); };
// a conical hat (nón lá) over a mouse's head, in the mouse's own frame
function c4Non(g) {
  g.fillStyle = '#b57a22'; g.strokeStyle = INK; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(-34, -140); g.lineTo(46, -140); g.lineTo(6, -176); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.moveTo(-18, -147); g.lineTo(30, -147); g.moveTo(-4, -156); g.lineTo(18, -156); g.stroke();
}
// the other folk at the market, from chương I's parts; face 1 = walking right. C4_TALL: how high their head is.
const C4_TALL = { mouse: 168, duck: 58, rooster: 150, dog: 110, toad: 100 };
function c4Critter(g, w, x, y, s) {
  const ph = w.ph, moving = w.st === 'walk' || w.st === 'leave' || (w.st === 'queue' && w.moving), f = w.face;
  if (w.kind === 'mouse') {
    const sort = C4_MOUSE_SORTS[w.sort], k = s * .92 * (sort.role === 'child' ? .68 : 1), arm = w.carry ? .4 : (w.talk ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null);
    g.save(); g.translate(x, y); if (sort.role === 'old') g.rotate(f * .1);          // the old ones stoop a little
    c4Mouse(g, w.M, 0, f, ph, moving, sort.role === 'old' && !w.talk ? -.15 : arm, w.carry, k, 0, w.seed);
    if (sort.role === 'old') { g.strokeStyle = INK; g.lineWidth = 6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(f * 32 * k, -92 * k); g.lineTo(f * 44 * k, 0); g.stroke(); g.strokeStyle = '#7a4a22'; g.lineWidth = 3.4 * k; g.stroke(); }
    if (sort.non) { g.scale(f * k, k); c4Non(g); }
    g.restore(); return;
  }
  const bob = moving ? -Math.abs(Math.sin(ph)) * 4 : (w.talk ? -Math.abs(Math.sin(C4.t * 8)) * 2 : 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  if (w.kind === 'duck') dp(g, WP.duck, 0, -4 + bob, moving ? Math.sin(ph) * .08 : 0, -f, 1);              // the duck is drawn facing left
  else if (w.kind === 'rooster') { g.scale(-f * .85, .85); dp(g, WP.rooster, 0, bob); dp(g, WP.rHead, -18, -76 + bob, moving ? Math.sin(ph * 2) * .12 : 0); }   // drawn facing left, head apart
  else if (w.kind === 'toad') { const hop = moving ? Math.max(0, Math.sin(ph * .7)) * 16 : 0; dp(g, MP.toad, 0, -hop, 0, f * .78, .78); }
  else if (w.kind === 'dog') {
    g.scale(f * .8, .8); const k = moving ? Math.sin(ph * 1.4) : 0;
    dp(g, MP.dogTail, -50, -42 + bob, Math.sin(C4.t * 8 + w.seed) * .3);
    dp(g, MP.dogLeg, -28, -44 + bob, k * .6); dp(g, MP.dogLeg, 36, -44 + bob, -k * .6);
    dp(g, MP.dogBody, 0, bob);
    dp(g, MP.dogLeg, -18, -44 + bob, -k * .6); dp(g, MP.dogLeg, 46, -44 + bob, k * .6);
    dp(g, MP.dogHead, 44, -50 + bob, Math.sin(C4.t * 2 + w.seed) * .05);
  }
  g.restore();
}

// speech bubbles: the words decide the size (measured in the real font, iPhone fonts run wider), dots towards the speaker
const C4_BUB = new Map(), C4_MEASURE = document.createElement('canvas').getContext('2d');
function c4Wrap(text, size, maxW) {
  C4_MEASURE.font = `900 ${size}px "Playfair Display", serif`;
  const out = []; let cur = '';
  for (const word of text.split(' ')) { const t = cur ? cur + ' ' + word : word; if (cur && C4_MEASURE.measureText(t).width > maxW) { out.push(cur); cur = word; } else cur = t; }
  if (cur) out.push(cur);
  return out;
}
function c4Bubble(text, side = 0, size = 16, maxW = 190) {
  const key = text + '|' + side + '|' + size + '|' + maxW; if (C4_BUB.has(key)) return C4_BUB.get(key);
  const lines = Array.isArray(text) ? text : c4Wrap(text, size, maxW);
  C4_MEASURE.font = `900 ${size}px "Playfair Display", serif`;
  const tw = Math.max(...lines.map(l => C4_MEASURE.measureText(l).width)), lh = size * 1.32;
  const w = tw / 2 + 14 + size * .25, h = lines.length * lh / 2 + 8 + size * .2, disp = '"Playfair Display", serif';
  const p = part([-w - 8, -h - 8, w + 8, h + 32], a => {
    a.fk('white', smooth([[-w + 4, -h + 4], [0, -h], [w - 3, -h + 5], [w, 0], [w - 4, h - 4], [0, h], [-w + 3, h - 5], [-w, 0]]), 2.2);
    lines.forEach((t, k) => a.text(t, 0, (k - (lines.length - 1) / 2) * lh, size, 'dark', disp, 'ink', 900));
    const dx = side * Math.min(w * .5, 40);
    for (const [k, r] of [[0, 4], [1, 3], [2, 2.2]]) a.ink(circ(dx * (1 + k * .25), h + 6 + k * 7, r));
  });
  p.bh = h; C4_BUB.set(key, p);
  if (C4_BUB.size > 160) C4_BUB.delete(C4_BUB.keys().next().value);       // keep the cache small
  return p;
}
