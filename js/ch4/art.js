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
  const mat = (a, w) => a.fk('straw', c4Poly([[-w, -6], [w, -6], [w + 8, 2], [-w - 8, 2]]), 1.4);   // a straw mat on the ground
  const hangThit = part([-100, -120, 100, 6], a => {                      // a butcher's block, a rail of hanging pork, a cleaver
    a.fk('brown', c4Rect(-70, -46, 40, -30), 1.8); for (const x of [-60, 30]) a.fk('brown', c4Rect(x - 4, -32, x + 4, 0), 1.3);
    a.fk('brown', c4Rect(-80, -112, 60, -106), 1.4); for (const x of [-80, 60]) a.fk('brown', c4Rect(x - 3, -110, x + 3, -46), 1.2);
    for (const x of [-56, -22, 14]) { a.key(lines([[x, -106, x, -98]]), 1); a.fk('red', smooth([[x - 12, -98], [x + 12, -98], [x + 9, -68], [x - 9, -66]]), 1.6); a.fill('white', ell(x, -92, 9, 3)); }
    a.fk('red', smooth([[-50, -46], [-10, -50], [0, -38], [-46, -36]]), 1.2); a.fill('white', ell(-28, -44, 12, 2.5));
    a.fk('grey', c4Poly([[48, -50], [80, -50], [80, -36], [48, -40]]), 1.2); a.fk('brown', c4Rect(80, -46, 96, -42), 1);
  });
  const hangGao = part([-110, -80, 110, 6], a => {                       // two baskets heaped with rice, a measuring tin
    mat(a, 100);
    for (const x of [-50, 40]) { basket(a, x, () => {}); a.fk('white', smooth([[x - 30, -40], [x - 14, -58], [x + 14, -60], [x + 30, -40]]), 1.6); for (let i = 0; i < 6; i++) a.ink(circ(x - 16 + i * 6, -46 - (i % 2) * 5, .9)); }
    a.fk('grey', c4Rect(80, -22, 100, -2), 1.2); a.fill('white', ell(90, -22, 10, 3));
  });
  const hangRau = part([-110, -80, 110, 6], a => {                       // baskets of greens, bundles of water spinach tied with straw
    mat(a, 100);
    for (const x of [-50, 40]) { basket(a, x, () => {}); for (let i = 0; i < 5; i++) { const lx = x - 22 + i * 11, ly = -46 - (i % 2) * 6; a.fk('green', smooth([[lx, ly + 8], [lx - 9, ly - 4], [lx, ly - 16], [lx + 9, ly - 4]]), 1.1); } }
    for (const x of [80, 96]) { a.fk('green', smooth([[x - 5, -2], [x + 5, -2], [x + 8, -40], [x - 8, -40]]), 1.2); a.fk('straw', c4Rect(x - 6, -20, x + 6, -16), .8); }
  });
  const hangTrung = part([-100, -70, 100, 6], a => {                     // a basket of hens' eggs, a tray of duck eggs
    mat(a, 90);
    basket(a, -40, () => {}); for (let i = 0; i < 7; i++) a.fk('white', ell(-62 + (i % 4) * 14, -44 - Math.floor(i / 4) * 9, 6, 7.5), 1.1);
    a.fk('straw', ell(50, -10, 40, 8), 1.4); for (let i = 0; i < 6; i++) a.fk('lilac', ell(24 + i * 10, -18 - (i % 2) * 4, 5, 6.5), 1);
  });
  const hangGa = part([-100, -100, 100, 6], a => {                       // a bamboo coop with hens peeping out
    mat(a, 90);
    a.fk('straw', smooth([[-80, -4], [80, -4], [70, -78], [-70, -78]]), 1.8);
    for (const [x, c] of [[-40, 'yellow'], [0, 'red'], [40, 'yellow']]) { a.fk(c, ell(x, -44, 16, 12), 1.4); a.fk('red', c4Poly([[x + 8, -58], [x + 14, -66], [x + 16, -56]]), 1); a.ink(circ(x + 10, -50, 1.6)); }
    a.key(lines([[-60, -78, -62, -4], [-20, -78, -20, -4], [20, -78, 20, -4], [60, -78, 62, -4]]), 1.6);
  });
  const hangQua = part([-110, -70, 110, 6], a => {                       // a flat tray of fruit: bananas, oranges, a pomelo
    mat(a, 100);
    a.fk('straw', ell(0, -14, 90, 12), 1.8);
    for (let i = 0; i < 3; i++) a.fk('yellow', smooth([[-70 + i * 14, -20], [-58 + i * 14, -46], [-50 + i * 14, -44], [-58 + i * 14, -18]]), 1.2);
    for (let i = 0; i < 5; i++) a.fk('orange', circ(-6 + (i % 3) * 18, -28 - Math.floor(i / 3) * 14, 9), 1.2);
    a.fk('green', circ(66, -34, 18), 1.6);
  });
  const hangNon = part([-100, -110, 100, 6], a => {                      // a stack of conical hats, a few hung on a stick
    mat(a, 90);
    for (let i = 0; i < 4; i++) a.fk('straw', c4Poly([[-60, -10 - i * 10], [-20, -46 - i * 10], [20, -10 - i * 10]]), 1.4);
    a.fk('brown', c4Rect(46, -100, 52, 0), 1.2); for (const y of [-88, -58]) a.fk('straw', c4Poly([[30, y + 20], [49, y], [68, y + 20]]), 1.2);
  });
  C4ART = { ganh, sap, gian, gate, scaffold, hangCa, hangVai, hangBanh, che, xoi, xen, bun, lot, hangThit, hangGao, hangRau, hangTrung, hangGa, hangQua, hangNon };
  return C4ART;
}
const c4StallArt = lv => { const A = c4Art(); return [A.ganh, A.sap, A.gian][lv]; };

// a mouse: chương I's woodblock rig (legs, tail, arm, body, head), standing on y; the tail sways on the mouse's own
// beat (seed), never on its position (that jittered as it walked)
let C4_SIT = false;                                                        // c4Mouse draws the legs folded forward (sitting on a stool)
function c4Mouse(g, M, x, face, ph, moving, arm = null, carry = null, s = 1, y = GROUND, seed = 0) {
  const sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : 0;
  g.save(); g.translate(x, y); g.scale(face * s, s);
  const hy = -45 + bob, armN = arm === null ? sw * .4 : arm;
  dp(g, M.tail, -18, hy + 2, Math.sin(C4.t * 2.4 + seed) * .12);
  dp(g, M.leg, 6, hy, C4_SIT ? -1.25 : sw * .55);
  dp(g, M.arm, 2, hy - 50, -sw * .4);
  dp(g, M.body, 0, hy, .04);
  dp(g, M.leg, -2, hy, C4_SIT ? -1.1 : -sw * .55);
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
  // more grown-ups, every colour of robe and fur (owner: a colourful crowd) — 14…25 adults, 26–27 elders
  { o: { robe: 'pink', trim: 'white', head: 'tan' }, role: 'adult' }, { o: { robe: 'orange', trim: 'blue', head: 'brown' }, role: 'adult' },
  { o: { robe: 'teal', trim: 'yellow', head: 'ash' }, role: 'adult' }, { o: { robe: 'blue', trim: 'pink', head: 'tan', dots: true }, role: 'adult' },
  { o: { robe: 'cream', trim: 'red', head: 'dark' }, role: 'adult' }, { o: { robe: 'green', trim: 'orange', head: 'tan' }, role: 'adult' },
  { o: { robe: 'lilac', trim: 'teal', head: 'ash', hat: 'dark' }, role: 'adult' }, { o: { robe: 'red', trim: 'teal', head: 'tan' }, role: 'adult' },
  { o: { robe: 'yellow', trim: 'blue', head: 'ash' }, role: 'adult' }, { o: { robe: 'orange', trim: 'green', head: 'grey' }, role: 'adult', non: true },
  { o: { robe: 'pink', trim: 'green', head: 'brown' }, role: 'adult' }, { o: { robe: 'teal', trim: 'red', head: 'dark' }, role: 'adult', non: true },
  { o: { robe: 'cream', trim: 'brown', head: 'ash', hat: 'dark' }, role: 'old' }, { o: { robe: 'teal', trim: 'white', head: 'ash' }, role: 'old' },
];
const C4_ADULT_SORTS2 = [0, 1, 2, 3, 4, 5, 6, 7, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], C4_OLD_SORTS2 = [8, 9, 10, 26, 27];
let C4_MOUSE_RIGS = null;
const c4MouseRig = i => { if (!C4_MOUSE_RIGS) C4_MOUSE_RIGS = []; return C4_MOUSE_RIGS[i] || (C4_MOUSE_RIGS[i] = buildMouse(C4_MOUSE_SORTS[i].o)); };
// a conical hat (nón lá) over a mouse's head, in the mouse's own frame
function c4Non(g) {
  g.fillStyle = '#b57a22'; g.strokeStyle = INK; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(-34, -140); g.lineTo(46, -140); g.lineTo(6, -176); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.moveTo(-18, -147); g.lineTo(30, -147); g.moveTo(-4, -156); g.lineTo(18, -156); g.stroke();
}
// the other folk at the market, from chương I's parts; face 1 = walking right. C4_TALL: how high their head is.
/* ---------- what folk wear and carry (look: dan.js c4People; drawn over the mouse in its own frame, face right) ----------
   skirt (váy đụp, a colour), hat 'quai' (nón quai thao), tool: cay (a plough on the shoulder), cuoc (a hoe), dieu (a
   bamboo water pipe, smoking), thung (a basket on the hip), ganh (a shoulder pole with two baskets), o (an umbrella);
   in the rain: an umbrella or a straw rain cape (áo tơi); drunk: red cheeks and a gourd of rice wine. */
const C4_SKIRTS = ['#3a2a22', '#2a2320', '#2f3f6f', '#7a2a22', '#2f4f3c'];
// the arm pose each thing needs (c4Mouse arm angle): the hand where the thing is held
const C4_TOOL_ARM = { o: -1.2, dieu: -.6, thung: .2, ganh: -1.6, cay: -2, cuoc: -2, drunk: .3, buf: 1.2 };
const c4Stroke = (g, w, col, pts) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.strokeStyle = INK; g.lineWidth = w + 3; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
const c4Shape = (g, col, pts, lw = 2.2) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); };
function c4Basket(g, x, y, rx, ry) {
  g.fillStyle = '#c9a45a'; g.strokeStyle = INK; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(x - rx, y - ry * .3); g.quadraticCurveTo(x - rx, y + ry, x, y + ry); g.quadraticCurveTo(x + rx, y + ry, x + rx, y - ry * .3); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 1.1; g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(x + i * rx * .35, y - ry * .2); g.lineTo(x + i * rx * .3, y + ry * .8); } g.stroke();
  g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - ry * .3, rx, ry * .35, 0, 0, 6.283); g.stroke();
}
// behind the mouse (drawn first): a plough or hoe handle passing behind the back, the pole of a gánh
function c4DecoBack(g, w) {
  const L = w.look || {}, t = L.tool;
  if (t === 'cay') {                                                         // the plough: beam over the shoulder, the share and handle behind
    c4Stroke(g, 7, '#8a5a2a', [[34, -128], [-10, -118], [-70, -70]]);
    c4Shape(g, '#7a4a22', [[-70, -70], [-92, -40], [-78, -34], [-60, -62]]);
    c4Shape(g, '#5a5a5a', [[-92, -40], [-104, -26], [-80, -30]], 1.8);
    c4Stroke(g, 5, '#8a5a2a', [[-66, -66], [-84, -100]]);
  } else if (t === 'cuoc') {
    c4Stroke(g, 5, '#8a5a2a', [[34, -130], [-8, -120], [-56, -88]]);
    c4Shape(g, '#5a5a5a', [[-56, -88], [-70, -66], [-58, -62], [-48, -84]], 1.8);
  } else if (t === 'ganh') {
    const sw = Math.sin(C4.t * 3 + w.seed) * 3;
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath();
    for (const bx of [-66, 70]) { g.moveTo(bx, -104); g.lineTo(bx - 13 + sw, -46); g.moveTo(bx, -104); g.lineTo(bx + 13 + sw, -46); }
    g.stroke();
    if (w.hoa) for (const bx of [-66, 70]) {                               // a flower seller: the baskets heaped with blooms
      g.fillStyle = '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(bx + sw - 16 + i * 8, -48 - (i % 2) * 6, 6, 3, (i - 2) * .5, 0, 6.283); g.fill(); g.stroke(); }
      ['#c0567a', '#f2c640', '#a3332a', '#f2ecde', '#d97b2a', '#b8a5c8', '#c0567a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(bx + sw - 18 + i * 6, -54 - ((i * 7) % 3) * 6, 5, 0, 6.283); g.fill(); g.stroke(); });
    }
    c4Basket(g, -66 + sw, -38, 22, 13); c4Basket(g, 70 + sw, -38, 22, 13);
    c4Stroke(g, 5, '#8a5a2a', [[-78, -105], [82, -103]]);
  }
}
// over the mouse: skirt, rain cape, hat, the things held in front
function c4Deco(g, w, k, moving = false) {
  const L = w.look || {}, rain = typeof c4Wx === 'function' && c4Wx() === 'mua' && C4.phase !== 'story', t = L.tool;
  if (L.skirt) {
    const b = moving ? -Math.abs(Math.sin(w.ph)) * 3.5 : 0, sw = moving ? Math.sin(w.ph) * 5 : 0;
    c4Shape(g, L.skirt, [[-20, -50 + b], [20, -50 + b], [26 + sw, -12 + b], [0 + sw * .6, -9 + b], [-26 + sw, -12 + b]]);
    g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1.2; g.beginPath(); for (const x of [-10, 0, 10]) { g.moveTo(x, -47 + b); g.lineTo(x * 1.25 + sw * .8, -12 + b); } g.stroke();
    c4Shape(g, '#a3332a', [[-21, -53 + b], [21, -53 + b], [21, -48 + b], [-21, -48 + b]], 1.4);   // the sash
  }
  if (rain && !w.umb) {                                                     // áo tơi: a straw cape over the shoulders
    c4Shape(g, '#b08a48', [[-8, -120], [18, -118], [30, -66], [28, -34], [-32, -34], [-30, -70]]);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath();
    for (let x = -28; x <= 26; x += 6) { g.moveTo(x * .6, -110); g.lineTo(x, -36); }
    for (let x = -32; x <= 28; x += 5) { g.moveTo(x, -36); g.lineTo(x - 2, -28); }
    g.stroke();
  }
  if (L.hat === 'quai' && !(rain && w.umb)) {                               // nón quai thao: a wide flat hat with tassels
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-26, -140); g.lineTo(-30, -104); g.moveTo(40, -140); g.lineTo(44, -106); g.stroke();
    g.fillStyle = '#e2b43c'; g.fillRect(-33, -106, 6, 8); g.fillRect(41, -108, 6, 8);
    g.fillStyle = '#d9b46a'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(8, -142, 48, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(8, -146, 20, 5, 0, 0, 6.283); g.stroke();
  }
  if (w.drunk) {                                                            // red cheeks, a gourd of rice wine
    g.fillStyle = 'rgba(200,40,40,.55)'; g.beginPath(); g.arc(24, -98, 7, 0, 6.283); g.fill();
    g.fillStyle = '#c98a1c'; g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.arc(18, -44, 10, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.arc(18, -60, 6.5, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#a3332a'; g.fillRect(15, -71, 6, 5);
  }
  if (t === 'dieu' && w.st === 'sit') {                                     // điếu cày: a bamboo pipe standing on the ground, up to the mouth
    c4Stroke(g, 8, '#c9a45a', [[40, 0], [50, -104]]);
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(38, -60); g.lineTo(46, -61); g.moveTo(42, -84); g.lineTo(50, -85); g.stroke();
    c4Stroke(g, 3, '#7a4a22', [[40, -54], [30, -62]]);
    const k2 = (C4.t * .7 + w.seed) % 3;
    if (k2 < 1.4) { g.fillStyle = `rgba(200,195,185,${.7 - k2 * .45})`; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(54 + i * 6 + k2 * 10, -116 - i * 9 - k2 * 22, 5 + i * 2 + k2 * 4, 0, 6.283); g.fill(); } }
  } else if (t === 'dieu') {}
  else if (t === 'thung' && !w.drunk) c4Basket(g, 20, -58, 24, 13);
  else if (t === 'cay' || t === 'cuoc') c4Stroke(g, t === 'cay' ? 7 : 5, '#8a5a2a', [[46, -136], [30, -128]]);   // the handle's end in front of the hand
  if (w.umb && (rain || t === 'o')) {                                       // an umbrella (paper, oiled)
    c4Stroke(g, 3, '#7a4a22', [[44, -96], [40, -214]]);
    g.fillStyle = L.umbCol || '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-14, -196); g.quadraticCurveTo(40, -262, 96, -196); g.quadraticCurveTo(68, -204, 41, -196); g.quadraticCurveTo(14, -204, -14, -196); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 1.1; g.beginPath(); for (const x of [-14, 14, 41, 68, 96]) { g.moveTo(40, -226); g.lineTo(x, -197); } g.stroke();
  }
}
// a buffalo (chương III's Chăn Trâu art), side on, led on a rope; feet on y = 0, face 1 = facing right
function c4Buffalo(g, x, y, s, face, ph, moving) {
  const A = ctArt(), sx = face * s, gait = moving ? 1 : 0;
  g.fillStyle = 'rgba(29,25,21,.16)'; g.beginPath(); g.ellipse(x, y + 2, 86 * s, 12 * s, 0, 0, 6.283); g.fill();
  dp(g, A.tail, x - face * 70 * s, y - 86 * s, Math.sin(C4.t * 3) * .25 * face, s, s);
  [-50, 48, -34, 32].forEach((lx, i) => {
    const px = x + lx * sx, sw = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? 1.2 : 0)) * 9 * gait * s * face;
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 13 * s; g.beginPath(); g.moveTo(px, y - 44 * s); g.lineTo(px + sw, y - 2); g.stroke();
    g.strokeStyle = i < 2 ? '#7a2a22' : '#a3332a'; g.lineWidth = 8.5 * s; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(px + sw, y - 2, 6.5 * s, 4 * s, 0, 0, 6.283); g.fill();
  });
  dp(g, A.body, x, y, 0, sx, s);
  const nod = moving ? Math.sin(ph * 2) * .06 : Math.sin(C4.t * 1.3) * .05;
  dp(g, A.headSide, x + face * 66 * s, y - 58 * s, nod * face, sx, s);
  return [x + face * (66 + 40) * s, y - (58 - 20) * s];                     // the muzzle, where the rope is tied
}
// the other folk at the market, from chương I's parts; face 1 = walking right. C4_TALL: how high their head is.
const C4_TALL = { mouse: 168, duck: 58, rooster: 150, dog: 70, toad: 100 };
function c4Critter(g, w, x, y, s) {
  const ph = w.ph, moving = w.st === 'walk' || w.st === 'leave' || ((w.st === 'queue' || w.st === 'toseat') && w.moving), f = w.face;
  if (w.kind === 'mouse') {
    const sort = C4_MOUSE_SORTS[w.sort], k = s * .92 * (sort.role === 'child' ? .68 : 1), L = w.look || {};
    const busy = w.st === 'eat' ? null : w.buf ? 'buf' : w.drunk ? 'drunk' : L.tool === 'dieu' ? (w.st === 'sit' ? 'dieu' : null) : (L.tool && L.tool !== 'o') ? L.tool : w.umb && (L.tool === 'o' || (typeof c4Wx === 'function' && c4Wx() === 'mua')) ? 'o' : null;
    const arm = busy && (busy !== 'thung' || !w.carry) ? C4_TOOL_ARM[busy] : w.carry ? .4 : (w.talk ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null);
    let muzzle = null;
    if (w.buf) muzzle = c4Buffalo(g, x - f * 205 * s, y, s * 1.3, f, ph, moving);   // the buffalo plods behind on its rope
    const sit = w.st === 'sit' || w.st === 'eat';
    if (sit) {                                                               // a low stool by the roadside
      g.save(); g.translate(x, y); g.scale(k, k);
      c4Shape(g, '#8a5a2a', [[-26, -40], [26, -40], [26, -33], [-26, -33]], 2); c4Stroke(g, 4, '#7a4a22', [[-20, -33], [-23, 0]]); c4Stroke(g, 4, '#7a4a22', [[20, -33], [23, 0]]);
      g.restore();
    }
    g.save(); g.translate(x, y); if (sort.role === 'old' && !sit) g.rotate(f * .1);   // the old ones stoop a little
    if (w.drunk) g.rotate(Math.sin(C4.t * 2.2 + w.seed) * .13);                     // reeling
    g.save(); g.scale(f * k, k); c4DecoBack(g, w); g.restore();
    C4_SIT = sit; c4Mouse(g, w.M, 0, f, ph, moving, sort.role === 'old' && !w.talk && !busy ? -.15 : arm, w.carry, k, sit ? -8 * k : 0, w.seed); C4_SIT = false;
    g.save(); g.scale(f * k, k); c4Deco(g, w, k, moving); g.restore();
    if (sort.role === 'old' && !sit) { g.strokeStyle = INK; g.lineWidth = 6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(f * 32 * k, -92 * k); g.lineTo(f * 44 * k, 0); g.stroke(); g.strokeStyle = '#7a4a22'; g.lineWidth = 3.4 * k; g.stroke(); }
    const wet = typeof c4Wx === 'function' && c4Wx() === 'mua' && C4.phase !== 'story';
    if ((sort.non || (wet && !w.umb && L.hat !== 'quai')) && !(w.umb && (L.tool === 'o' || wet))) { g.scale(f * k, k); c4Non(g); }   // a conical hat; in the rain with the straw cape
    g.restore();
    if (muzzle) { const hx = x + f * -13 * k, hy = y - 71 * k; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo((hx + muzzle[0]) / 2, Math.max(hy, muzzle[1]) + 22 * s, muzzle[0], muzzle[1]); g.stroke(); }
    return;
  }
  const bob = moving ? -Math.abs(Math.sin(ph)) * 4 : (w.talk ? -Math.abs(Math.sin(C4.t * 8)) * 2 : 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  if (w.kind === 'duck') dp(g, WP.duck, 0, -4 + bob, moving ? Math.sin(ph) * .08 : 0, -f, 1);              // the duck is drawn facing left
  else if (w.kind === 'rooster') { g.scale(-f * .85, .85); dp(g, WP.rooster, 0, bob); dp(g, WP.rHead, -18, -76 + bob, moving ? Math.sin(ph * 2) * .12 : 0); }   // drawn facing left, head apart
  else if (w.kind === 'toad') { const hop = moving ? Math.max(0, Math.sin(ph * .7)) * 16 : 0; dp(g, MP.toad, 0, -hop, 0, f * .78, .78); }
  else if (w.kind === 'dog') {
    g.scale(f * .5, .5); const k = moving ? Math.sin(ph * 1.4) : 0;          // a small village dog (owner)
    dp(g, MP.dogTail, -44, -48 + bob, Math.sin(C4.t * 8 + w.seed) * .3, -1, 1);   // mirrored: the tail curls up behind, not forward
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
    const shape = smooth([[-w + 4, -h + 4], [0, -h], [w - 3, -h + 5], [w, 0], [w - 4, h - 4], [0, h], [-w + 3, h - 5], [-w, 0]]);
    a.underFill(shape, '#f6f1e4'); a.fk('white', shape, 2.2);                 // a solid paper under the print (owner: easier to read)
    lines.forEach((t, k) => a.solidText(t, 0, (k - (lines.length - 1) / 2) * lh, size, disp, 900));   // solid, not mottled: easy to read (owner)
    const dx = side * Math.min(w * .5, 40);
    for (const [k, r] of [[0, 4], [1, 3], [2, 2.2]]) a.ink(circ(dx * (1 + k * .25), h + 6 + k * 7, r));
  });
  p.bh = h; C4_BUB.set(key, p);
  if (C4_BUB.size > 160) C4_BUB.delete(C4_BUB.keys().next().value);       // keep the cache small
  return p;
}

/* ---------- the market's houses, each its own shape and colours (owner: easy to tell apart) ---------- */
const C4_HOUSE_V = [
  { w: 230, wall: 'white', roof: 'thatch', ridge: 'green', win: 'red', door: 'dark' },                 // a thatched house, whitewashed
  { w: 200, wall: 'cream', roof: 'tile', ridge: 'yellow', win: 'blue', door: 'brown' },                // red tiles, cream walls
  { w: 180, wall: 'tan', roof: 'straw', ridge: null, win: 'green', door: 'brown' },                    // mud walls under fresh straw
  { w: 150, wall: 'yellow', roof: 'tile', ridge: 'red', win: 'teal', door: 'dark', tall: true },       // a narrow two-storey shophouse
  { w: 210, wall: 'ash', roof: 'thatch', ridge: 'red', win: 'yellow', door: 'teal' },                  // grey walls, dark thatch
  { w: 170, wall: 'rose', roof: 'tile', ridge: 'green', win: 'white', door: 'brown' },                 // soft pink walls, tiles
];
const C4_HOUSE_ART = [];
function c4HouseArt(v) {
  v = ((v | 0) % C4_HOUSE_V.length + C4_HOUSE_V.length) % C4_HOUSE_V.length;
  if (C4_HOUSE_ART[v]) return C4_HOUSE_ART[v];
  const o = C4_HOUSE_V[v], w = o.w, H = o.tall ? 215 : 150, top = -H, ry = top + 12, rx = w + 52;
  return (C4_HOUSE_ART[v] = part([-rx - 4, ry - 124, rx + 4, 8], a => {
    a.fk(o.wall, rect(-w, top, w * 2, H), 2.4);
    for (const x of [-w, -w / 2, 0, w / 2, w - 14]) a.fk('brown', rect(x - (x === w - 14 ? 0 : 7), top, 14, H), 1.8);
    a.fk(o.door, rect(-36, -112, 72, 112), 2); a.key(lines([[0, -112, 0, 0]]), 1.6);
    for (const x of [-w + 40, w - 96]) { a.fk(o.win, rect(x, -112, 56, 42), 2); a.key(lines([[x + 14, -112, x + 14, -70], [x + 28, -112, x + 28, -70], [x + 42, -112, x + 42, -70]]), 1.4); }
    if (o.tall) { for (const x of [-w + 40, -28, w - 96]) { a.fk(o.win, rect(x, top + 22, 56, 40), 2); a.key(lines([[x + 28, top + 22, x + 28, top + 62]]), 1.2); }
      a.fk('brown', rect(-w, top + 72, w * 2, 10), 1.6); }                  // the floor between the storeys
    const roof = smooth([[-rx, ry], [-rx + 16, ry - 16], [-w + 18, ry - 98], [w - 18, ry - 98], [rx - 16, ry - 16], [rx, ry], [w + 10, ry - 8], [-w - 10, ry - 8]]);
    if (o.roof === 'thatch') {
      a.fk('dark', roof, 2.6);
      for (let r = 0; r < 4; r++) { const y = ry - 22 - r * 20, hw = rx - 24 - (r + .3) * 13, pts = []; for (let x = -hw; x <= hw; x += 18) pts.push([x, y], [x + 9, y + 5]); a.band('white', smooth(pts, false), 1.6); }
    } else if (o.roof === 'tile') {
      a.fk('red', roof, 2.6);
      for (let r = 0; r < 5; r++) { const y = ry - 18 - r * 17, hw = rx - 22 - (r + .3) * 13, t = []; for (let x = -hw; x <= hw; x += 16) t.push([x, y, x - 2, y + 12]); a.key(lines([[-hw, y, hw, y]]), 1.2); a.key(lines(t), .8); }
    } else {
      a.fk('straw', roof, 2.6);
      const t = []; for (let x = -rx + 20; x < rx - 20; x += 11) t.push([x * .78, ry - 92, x, ry - 4]); a.key(lines(t), .9);
    }
    if (o.ridge) a.fk(o.ridge, smooth([[-w + 14, ry - 96], [-w - 18, ry - 116], [-w + 26, ry - 108], [w - 26, ry - 108], [w + 18, ry - 116], [w - 14, ry - 96]]), 2);
  }));
}
