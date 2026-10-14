/* Chương VIII · Gom Ba Mở Lối — the pictures. Everything is printed once with the woodblock engine (part) and then stamped:
   earth, the four things (ớt, bưởi, lá, đất), the chest, the start gate, the scroll and the little mouse in five poses. */
let C8ART = null;
function c8Art() {
  if (C8ART) return C8ART;
  const rr = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
  const A = { earth: [], k: 64 };
  // the plates this chapter adds: pale ice, cyan, sea blue, foam
  if (!PL.c8ice) { PL.c8ice = ['#c9e8f0', [-1.2, 1]]; PL.c8cyan = ['#74bfd8', [-1.4, 1.2]]; PL.c8sea = ['#3d86c6', [-1.4, 1.2]]; PL.c8foam = ['#eef7f8', [.4, 1]]; }
  const wave = (x, y, len, amp, n = 4) => { const p = []; for (let k = 0; k <= n; k++) p.push([x + len * k / n, y + (k % 2 ? -amp : amp * .4)]); return smooth(p, false); };
  // the ground, in the style of the village prints: flat dark earth with cream wavy strokes and a few pale stones; three looks so a wall does not repeat
  const WV = [[[8, 20, 22], [30, 34, 24], [10, 50, 20]], [[20, 14, 26], [8, 32, 20], [32, 48, 22]], [[10, 12, 22], [34, 26, 22], [12, 44, 26]]], ST = [[[46, 18], [16, 36]], [[50, 36], [14, 52]], [[48, 50], [12, 28]]];
  for (let v = 0; v < 3; v++) A.earth.push(part([0, 0, 64, 64], a => {
    a.fill('brown', rr(0, 0, 64, 64, 0));
    for (const [x, y, l] of WV[v]) a.band('cream', wave(x, y, l, 3), 2.2);
    for (const [x, y] of ST[v]) a.fill('tan', ell(x, y, 4.6, 3.2, x * .1));
  }));
  // the earth is ONE seamless texture (owner, 2026-10-09: why square tiles with seams?): a 512 px pattern for 4 × 4 cells that wraps round, filled behind every earth cell
  A.earthPat = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#5b2f1f'; g.fillRect(0, 0, 512, 512);
    let sd = 7; const R = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const waves = [], stones = []; for (let i = 0; i < 11; i++) waves.push([R() * 512, R() * 512, 60 + R() * 40, R() * .3 - .15]); for (let i = 0; i < 7; i++) stones.push([R() * 512, R() * 512, 9 + R() * 4, 6 + R() * 2.5, R() * 3]);
    for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
      g.save(); g.translate(dx, dy);
      g.strokeStyle = '#c9aa72'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [x, y, len, tilt] of waves) { g.beginPath(); for (let k = 0; k <= 4; k++) { const px = x + len * k / 4, py = y + tilt * len * k / 4 + (k % 2 ? -6 : 2); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
      g.fillStyle = '#7c4b2b'; for (const [x, y, rx, ry, rot] of stones) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); g.fill(); }
      g.restore();
    }
    return c;
  })();
  A.grass = part([-2, -4, 66, 14], a => {                                   // blades of grass along the top of a bare edge
    const c = [-2, 7]; for (let k = 0; k < 8; k++) { const x = 8 * k; c.push(x + 1.5, 7, x + 4, -3 - (k % 2 ? 0 : 3), x + 6.5, 7); } c.push(66, 7, 66, 12, -2, 12);
    a.fk('green', lines([c]), 1.7);
  });
  // things sit on little paper tiles so a pile reads as a grid
  const tile = (pl, motif) => part([0, 0, 64, 64], a => { a.fk('white', rr(4, 4, 56, 56, 9), 2.4); a.fill(pl, rr(7, 7, 50, 50, 7)); a.fill('white', rr(7, 7, 50, 50, 7)); a.fill(pl, ell(32, 32, 22, 22)); a.fill('white', ell(32, 32, 22, 22)); motif(a); });
  const ring = (a, pl) => a.band(pl, circ(32, 32, 27), 3);                       // the soft kinds: no tile, just the picture in a faint ring
  A.a = part([0, 0, 64, 64], a => {                                           // lửa: a clay charcoal stove (lò than) with tall curling flames over its glowing mouth (it melts ice; replaces the reference's plain flame)
    ring(a, 'lilac');
    const tongue = (cx, h, w, lean) => smooth([[cx - w, 43], [cx - w * .7, 43 - h * .55], [cx + lean, 43 - h], [cx + w * .55, 43 - h * .5], [cx + w, 43]]);
    a.fk('red', tongue(32, 36, 13, 5), 2.2); a.fk('red', tongue(19, 22, 8, -5), 2); a.fk('red', tongue(46, 20, 8, 4), 2);
    a.fill('orange', tongue(32, 26, 8.5, 3.5)); a.fk('yellow', tongue(32, 14, 4, 2), 1.2);
    a.fk('tan', smooth([[14, 43], [50, 43], [48, 52], [43, 60], [21, 60], [16, 52]]), 2.4);            // the bowl
    a.fk('brown', rr(11, 40, 42, 6, 3), 2); a.fill('red', ell(32, 42.5, 15, 2));                         // the rim and the glowing mouth
    a.key(lines([[20, 52, 44, 52]]), 1.3);
  });
  A.b = part([0, 0, 64, 64], a => {                                           // bưởi: a round yellow pomelo with a leaf
    ring(a, 'lilac');
    a.fk('yellow', circ(32, 36, 17), 2.4); a.fill('orange', ell(38, 42, 9, 7));
    a.key(smooth([[23, 30], [28, 25], [34, 25]], false), 1.4); a.key(smooth([[25, 41], [30, 47], [39, 48]], false), 1.2);
    a.fk('green', smooth([[32, 19], [41, 9], [49, 15], [41, 23]]), 1.8); a.key(lines([[32, 19, 33, 14]]), 1.6);
  });
  A.c = part([0, 0, 64, 64], a => {                                           // lá: soft, the mouse walks through it, so no tile: just leaves in a faint ring
    a.band('lilac', circ(32, 32, 27), 3);
    a.fk('green', smooth([[32, 9], [48, 24], [46, 43], [32, 56], [18, 43], [16, 24]]), 2.4);
    a.key(lines([[32, 12, 32, 54], [32, 24, 41, 31], [32, 24, 23, 31], [32, 36, 41, 43], [32, 36, 23, 43]]), 1.3);
  });
  A.d = part([0, 0, 64, 64], a => {                                           // chum nước: a big clay jar, wide mouth with a thick rim, round belly, narrower foot (owner: the clods become water jars)
    a.fk('tan', smooth([[13, 12], [51, 12], [57, 24], [59, 38], [54, 53], [45, 60], [19, 60], [10, 53], [5, 38], [7, 24]]), 2.6);
    a.fill('orange', ell(17, 36, 3.6, 11, -.15));                                              // a lit side
    a.band('cream', wave(8, 30, 48, 3, 6), 2.2); a.band('red', wave(7, 44, 50, 3, 6), 2.4);       // bands round the belly
    a.fk('brown', rr(17, 56, 30, 6, 2), 1.8);                                                  // the foot
    a.fk('straw', ell(32, 11, 21, 7), 2.4); a.fill('dark', ell(32, 11.5, 16.5, 4.4)); a.fill('blue', ell(32, 12.2, 12.5, 2.6));   // the thick rim, the mouth, the water in it
  });
  A.i = part([0, 0, 64, 64], a => {                                           // băng: a frost urchin (nhím băng): a pale-blue ball bristling with white spikes (deadly to touch; replaces the reference's jagged block)
    for (let k = 0; k < 14; k++) { const ang = k * Math.PI * 2 / 14 + .1, c1 = Math.cos(ang - .2), s1 = Math.sin(ang - .2), c2 = Math.cos(ang + .2), s2 = Math.sin(ang + .2); a.fk('c8ice', lines([[32 + c1 * 16, 32 + s1 * 16, 32 + Math.cos(ang) * 31, 32 + Math.sin(ang) * 31, 32 + c2 * 16, 32 + s2 * 16]]), 1.8); }
    a.fk('c8cyan', circ(32, 32, 17), 2.4); a.fill('c8ice', ell(26, 25, 8, 5, -.6));
    a.fill('white', circ(24, 23, 2.4)); a.key(smooth([[26, 40], [32, 44], [40, 39]], false), 1.4);
  });
  if (!PL.c8rock) { PL.c8rock = ['#716f6a', [-1.2, 1]]; PL.c8rockL = ['#a3a09a', [-1.4, 1]]; PL.c8rockD = ['#4a4844', [-1, 1.2]]; }
  const poly = pts => { const p = new Path2D(); pts.forEach(([x, y], k) => k ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
  A.r = part([0, 0, 64, 64], a => {                                           // bánh xe gỗ: a wooden cart wheel with an iron-bound rim, eight spokes and a hub (pushed and gathered; replaces the reference's boulder)
    a.fk('brown', circ(32, 32, 28), 2.8);                                                                  // the iron rim
    a.fk('tan', circ(32, 32, 23), 2.2);                                                                    // the wooden felloe
    for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4 + .2, c = Math.cos(ang), s = Math.sin(ang); a.band('straw', lines([[32 + c * 6, 32 + s * 6, 32 + c * 22, 32 + s * 22]]), 4.6); a.key(lines([[32 + c * 6, 32 + s * 6, 32 + c * 22, 32 + s * 22]]), 1.1); }
    a.fk('tan', circ(32, 32, 8.5), 2); a.fk('brown', circ(32, 32, 3.6), 1.4);                              // the hub and its axle hole
    for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4 + .6; a.fill('yellow', circ(32 + Math.cos(ang) * 25.5, 32 + Math.sin(ang) * 25.5, 1.4)); }   // studs on the rim
  });
  A.o = part([0, 0, 64, 64], a => {                                           // mây: a white curled cloud of the folk prints (it replaces the reference's dashed white spiral): the mouse walks through it, things rest on it, it cannot be eaten
    a.fk('white', smooth([[9, 45], [5, 35], [13, 27], [17, 19], [29, 15], [39, 19], [47, 16], [57, 26], [59, 38], [52, 47], [34, 50], [19, 49]]), 2.4);
    a.fill('lilac', ell(32, 44, 19, 4.2));                                               // a pale shade along the bottom
    a.key(smooth([[21, 31], [25, 26], [31, 28], [29, 34], [24, 33]], false), 1.7); a.key(smooth([[39, 30], [43, 25], [49, 28], [46, 34], [41, 33]], false), 1.7);   // the two curls
  });
  A.v = part([0, 0, 64, 64], a => {                                           // nước: a pond block, blue with long folk-print ripples and a little red carp (soft: the mouse swims in it; replaces the reference's sea-blue crest block)
    a.fk('c8sea', rr(5, 8, 54, 51, 10), 2.6);
    a.band('c8cyan', smooth([[11, 17], [20, 13], [30, 17], [40, 13], [52, 17]], false), 4);
    a.band('white', smooth([[12, 26], [22, 22], [32, 26], [42, 22], [52, 26]], false), 2.2);
    a.band('white', smooth([[12, 52], [24, 48], [36, 52], [48, 48]], false), 2.2);
    a.fk('orange', ell(32, 38, 10, 5), 1.7); a.fk('red', lines([[41, 38, 51, 31, 51, 45]]), 1.6); a.fill('red', lines([[41, 38, 51, 31, 51, 45]]));
    a.fill('white', ell(29, 40, 5, 2)); a.ink(circ(26, 36.5, 1.2)); a.key(lines([[33, 34, 33, 42]]), 1.1);
    a.fill('white', circ(18, 40, 1.8)); a.fill('white', circ(15, 35, 1.3));
  });
  // the chest at the end (gold glow is drawn behind it), and the grey one the mouse starts from
  A.goal = part([0, 0, 64, 64], a => {
    a.fk('red', rr(4, 6, 56, 54, 5), 2.8); a.fill('yellow', rr(9, 11, 46, 44, 3));
    a.fill('red', rr(9, 11, 46, 44, 3)); a.fill('yellow', rr(4, 28, 56, 6)); a.key(lines([[4, 31, 60, 31]]), 1.4);
    a.text('囍', 32, 46, 22, 'yellow'); a.fill('yellow', rr(26, 24, 12, 12, 2)); a.key(rr(26, 24, 12, 12, 2), 1.6);
  });
  A.start = part([0, 0, 64, 64], a => {
    a.fk('tan', rr(4, 6, 56, 54, 5), 2.8); a.fill('cream', rr(9, 11, 46, 44, 3));
    a.key(lines([[9, 11, 55, 55], [55, 11, 9, 55]]), 1.2); a.fk('cream', smooth([[32, 22], [43, 33], [32, 44], [21, 33]]), 1.8);
  });
  A.scroll = part([0, 0, 48, 48], a => {                                      // cuộn tranh: a rolled print with a red tie
    a.fk('white', rr(6, 14, 36, 20, 3), 2); a.fk('yellow', ell(7, 24, 4, 11), 1.8); a.fk('yellow', ell(41, 24, 4, 11), 1.8);
    a.fill('red', rr(21, 13, 6, 22, 1)); a.key(lines([[12, 20, 18, 20], [12, 26, 17, 26], [30, 21, 36, 21], [30, 27, 35, 27]]), 1.2);
  });
  // the mouse, 48 × 48, facing right, feet at y 46
  const mouse = (arm, bob, legs, up) => part([-4, -6, 56, 52], a => {
    const y = bob;
    a.key(smooth([[13, 36 + y], [7, 39 + y], [2, 34 + y], [5, 28 + y]], false), 2.2);                        // tail
    a.fk('grey', ell(23, 33 + y, 13, 11), 2.4); a.fill('lilac', ell(27, 36 + y, 8, 7));
    for (const [fx, fy] of legs) a.fk('grey', ell(fx, 45 + fy, 5, 2.8), 1.8);
    a.fk('red', smooth([[17, 22 + y], [11, up ? 14 + y : 25 + y], [4, up ? 17 + y : 29 + y], [10, up ? 21 + y : 31 + y], [18, 28 + y]]), 1.6);   // scarf's tail
    a.fk('grey', circ(29, 20 + y, 10.5), 2.4); a.fk('grey', ell(38, 22 + y, 6, 4.6), 1.8);
    a.fk('lilac', circ(22, 11 + y, 5.5), 1.8); a.fk('lilac', circ(31, 9.5 + y, 5.5), 1.8); a.fill('ltred', circ(31, 9.5 + y, 3));
    a.ink(circ(32, 18 + y, 1.9)); a.ink(circ(43, 21.5 + y, 1.5));
    a.fk('red', smooth([[19, 26 + y], [29, 29 + y], [38, 27 + y], [38, 31 + y], [29, 33 + y], [19, 30 + y]]), 1.6);   // scarf
    a.fk('grey', ell(arm[0], arm[1] + y, 3.4, 5.5, arm[2]), 1.6);
  });
  A.m = {
    idle: mouse([33, 38, 0], 0, [[17, 0], [29, 0]], false),
    walk0: mouse([27, 38, .5], -1, [[13, 0], [32, 0]], false),
    walk1: mouse([36, 38, -.5], 0, [[20, 0], [27, -2]], false),
    jump: mouse([38, 34, -1.1], -2, [[16, -3], [29, -4]], true),
    fall: mouse([28, 31, 1.1], 0, [[14, -1], [31, -1]], true),
  };
  // the far bamboo, printed pale on the paper
  A.bamboo = part([-10, -300, 30, 0], a => {
    for (let n = 0; n < 5; n++) { const y = -n * 60; a.fk('green', rr(-2, y - 58, 14, 60, 4), 1.6); a.key(lines([[-2, y - 58, 12, y - 58]]), 2.2); }
    a.fk('green', smooth([[12, -150], [26, -160], [28, -146], [16, -142]]), 1.4); a.fk('green', smooth([[-2, -210], [-16, -222], [-18, -206], [-4, -202]]), 1.4);
  });
  return (C8ART = A);
}
