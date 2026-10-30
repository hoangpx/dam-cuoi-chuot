/* Góc Tĩnh Tâm (owner 2026-10-29: a place to sit quietly, not a chapter): the woodblock parts of the clearing — a huge gilded
   Buddha (Phật Như Lai) on a lotus throne, pines and broadleaf trees, rocks, an incense urn, stone lanterns, lotus pots,
   cushions — and the far scenery (sky, three ridges of mountains) painted once. Made on first use (ttArt). */
Object.assign(PL, {
  leafL: ['#8db15e', [-1.4, 1.2]], leafM: ['#4f8a4e', [-1.2, 1]], leafD: ['#2e5e44', [-1.4, 1.2]], bark: ['#6a4a34', [1.4, -1]],
  truc: ['#9bb85e', [-1.2, 1]], trucL: ['#c4d588', [-1, 1]], trucD: ['#6f9142', [-1.4, 1.2]],
  stone: ['#cdc5b2', [.6, 1]], stoneD: ['#9a927f', [1, 1.2]], flower: ['#e58aa0', [1.2, -1]],
});

// one lotus petal of the throne, standing on (x, yb), w half-wide, h tall, leaning by tilt (radians, about its foot): deep pink at its
// foot, lighter toward the tip, a pale gold rim catching the light, two soft veins
function ttPetal(x, yb, w, h, tilt = 0) {
  const c = Math.cos(tilt), sn = Math.sin(tilt), R = ([px, py]) => [x + px * c - py * sn, yb + px * sn + py * c];
  const cu = Math.sign(tilt || .001) * Math.min(1, Math.abs(tilt) * 1.6 + .25) * w * .35;   // the tip curls outward, more on the outer petals
  const shape = k => [[-w * .9, 0], [-w * 1.18, -h * .38 * k], [-w * .9, -h * .7 * k], [-w * .32 + cu * .5, -h * .92 * k], [cu, -h * 1.04 * k], [w * .32 + cu * .5, -h * .92 * k], [w * .9, -h * .7 * k], [w * 1.18, -h * .38 * k], [w * .9, 0], [0, 6]].map(R);   // a full, soft petal
  const ext = Math.max(w, h) + 10;
  return part([x - ext, yb - ext, x + ext, yb + ext * .5], a => {
    const pt = smooth(shape(1));
    a.underFill(pt, '#d98aa4'); a.fill('pink', pt);
    a.fill('flower', smooth([[-w * .8, -h * .18], [-w * .9, -h * .5], [-w * .5, -h * .84], [0, -h * .96], [w * .5, -h * .84], [w * .9, -h * .5], [w * .8, -h * .18], [0, -h * .1]].map(R)));
    a.fill('rose', smooth([[-w * .4, -h * .62], [0, -h * .93], [w * .4, -h * .62], [0, -h * .7]].map(R)));
    a.band('catY', smooth([[-w * .98, -h * .4], [-w * .6, -h * .8], [0, -h * .98], [w * .6, -h * .8], [w * .98, -h * .4]].map(R), false), 2.4);
    a.key(pt, 2.2);
    a.key(smooth([[-w * .45, -h * .12], [-w * .3, -h * .58], [-2, -h * .88]].map(R), false), 1); a.key(smooth([[w * .45, -h * .12], [w * .3, -h * .58], [2, -h * .88]].map(R), false), 1);
  });
}
// a lawn (owner: "kiểu thảm cỏ để ngồi lên"): one seamless 512 px tile of soft fine grass: a green ground with gentle lighter and darker
// patches, then tens of thousands of tiny blades in five greens, lit tips on top, no outlines; laid on the ground in perspective by ttLawn
let TT_LAWN = null;
function ttLawnTile() {
  if (TT_LAWN) return TT_LAWN;
  const N = 512, c = mk(N, N), g = c.getContext('2d'), r = mulberry(4242), wrap = (x, y, f) => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) f(x + dx, y + dy); };
  g.fillStyle = '#5f8f48'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 70; i++) { const x = r() * N, y = r() * N, rad = 30 + r() * 70, light = r() < .5; wrap(x, y, (X, Y) => { const gr = g.createRadialGradient(X, Y, 0, X, Y, rad); gr.addColorStop(0, light ? 'rgba(150,190,96,.35)' : 'rgba(40,82,40,.32)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X - rad, Y - rad, rad * 2, rad * 2); }); }
  const cols = ['rgba(38,78,40,.75)', 'rgba(62,108,52,.75)', 'rgba(86,136,64,.7)', 'rgba(122,168,82,.65)', 'rgba(178,210,120,.55)'];
  g.lineCap = 'round';
  for (let k = 0; k < cols.length; k++) {
    g.strokeStyle = cols[k]; g.lineWidth = 1.6 - k * .15; g.beginPath();
    for (let i = 0; i < 9000; i++) { const x = r() * N, y = r() * N, h = 5 + r() * 9, lean = (r() - .5) * 6; wrap(x, y, (X, Y) => { if (X < -20 || X > N + 20 || Y < -20 || Y > N + 20) return; g.moveTo(X, Y); g.quadraticCurveTo(X + lean * .3, Y - h * .6, X + lean, Y - h); }); }
    g.stroke();
  }
  return (TT_LAWN = c);
}
let TT_ART = null;
function ttArt() {
  if (TT_ART) return TT_ART;
  const A = {};
  const poly = pts => { const q = new Path2D(); q.moveTo(pts[0][0], pts[0][1]); for (const t of pts.slice(1)) q.lineTo(t[0], t[1]); q.closePath(); return q; };

  /* ---------- the Buddha: origin = the centre of his throne's foot, 1 unit = 1 px of the part (≈ 440 tall) ---------- */
  // The statue is printed in four stacked layers, each opaque over the one behind (a single sheet let the ink of the legs and
  // hands show through the robe: owner, "sao phật bị trong trong"): 0 mandorla + halo, 1 throne + legs, 2 body + arms + hands, 3 head
  const BB = [-215, -456, 215, 12], over = (a, path, col) => a.underFill(path, col);
  const mandorla = ell(0, -225, 152, 216), torso = smooth([[-72, -106], [-93, -172], [-86, -234], [-54, -268], [0, -277], [54, -268], [86, -234], [93, -172], [72, -106]]);
  const legsP = smooth([[-152, -72], [-122, -102], [-52, -114], [0, -110], [52, -114], [122, -102], [152, -72], [110, -60], [0, -66], [-110, -60]]);
  const faceP = smooth([[0, -372], [30, -363], [40, -332], [34, -302], [18, -282], [0, -276], [-18, -282], [-34, -302], [-40, -332], [-30, -363]]);
  const sleeve = s => smooth([[s * 56, -266], [s * 92, -252], [s * 114, -194], [s * 108, -132], [s * 76, -110], [s * 62, -150], [s * 74, -214]]);
  const hairP = smooth([[-42, -334], [-40, -366], [-24, -388], [0, -394], [24, -388], [40, -366], [42, -334], [34, -354], [0, -360], [-34, -354]]);
  // After the owner's reference picture: a golden Buddha, the saffron robe over the left shoulder and the right shoulder bare, a great
  // round halo behind the head, sitting on a big pink lotus whose petals open in rows. Every piece is its own opaque layer, back to front,
  // so no ink line shows through what lies over it; each has tight bounds and all share one origin (the middle of the throne's foot).
  const robeP = smooth([[24, -262], [54, -268], [86, -234], [93, -172], [72, -106], [-72, -106], [-91, -150], [-72, -160], [-42, -184], [-10, -222]]);
  A.buddha = [
    part([-160, -486, 160, -170], a => {                                                // the halo: bright round the head, fading gold outward
      a.fill('catY', circ(0, -330, 152)); a.band('yellow', circ(0, -330, 142), 7); a.fill('cream', circ(0, -330, 122)); a.band('yellow', circ(0, -330, 104), 2.4);
      a.fill('white', circ(0, -330, 86));
    }),
    ...[[-158, -38, 32, 104, -.62], [158, -38, 32, 104, .62], [-104, -50, 32, 124, -.34], [104, -50, 31, 120, .32], [-46, -56, 30, 134, -.12], [46, -56, 30, 130, .1]].map(q => ttPetal(...q)),
    part([-196, -26, 196, 12], a => { const b = ell(0, -6, 186, 15); a.underFill(b, '#b57a22'); a.fill('straw', b); a.band('yellow', ell(0, -9, 176, 10), 3); a.key(b, 2.2); }),   // a gold ring under the lotus
    part([-160, -132, 160, -52], a => {                                                 // the crossed legs in the robe, soles up
      over(a, legsP, '#d97b2a'); a.fill('orange', legsP);
      a.band('straw', smooth([[-140, -74], [-96, -86], [-40, -92]], false), 3); a.band('straw', smooth([[140, -74], [96, -86], [40, -92]], false), 3);
      a.key(legsP, 2.6); a.key(smooth([[-128, -80], [-90, -92]], false), 1.2); a.key(smooth([[128, -80], [90, -92]], false), 1.2);
      for (const s of [-1, 1]) { const f = ell(s * 46, -114, 36, 13, -s * .22); over(a, f, '#f2c640'); a.fk('yellow', f, 1.8); a.key(lines([[s * 26, -118, s * 29, -110], [s * 40, -123, s * 43, -114], [s * 54, -124, s * 57, -116]]), 1); }
    }),
    ...[[-188, -22, 30, 86, -1.05], [188, -22, 30, 88, 1.0], [-138, -13, 33, 98, -.64], [136, -13, 33, 94, .6], [-73, -7, 33, 104, -.3], [74, -7, 32, 100, .27], [0, -4, 33, 98, 0]].map(q => ttPetal(...q)),
    part([-100, -284, 100, -100], a => {                                                // the body: gold, the robe over the left shoulder, the right side of the chest bare
      over(a, torso, '#f2c640'); a.fill('yellow', torso);
      a.fill('straw', smooth([[-88, -170], [-82, -230], [-62, -258], [-70, -210], [-72, -170]]));          // shade along the bare side
      over(a, robeP, '#d97b2a'); a.fill('orange', robeP);
      a.band('straw', smooth([[-72, -160], [-42, -184], [-10, -222], [24, -262]], false), 5);                // the robe's hem across the chest
      a.key(torso, 2.8); a.key(smooth([[-91, -150], [-72, -160], [-42, -184], [-10, -222], [24, -262]], false), 1.8);
      a.key(smooth([[62, -248], [52, -200], [44, -150]], false), 1.2); a.key(smooth([[32, -232], [14, -190], [-4, -150]], false), 1.2); a.key(smooth([[-28, -176], [-36, -140], [-30, -112]], false), 1.1);
      a.key(smooth([[-62, -232], [-46, -226], [-32, -232]], false), 1);                                          // the bare chest
    }),
    ...[-1, 1].map(s => part([-122, -272, 122, -104], a => {                            // the right arm bare and gold, the left in the robe
      const sk = s < 0, p = sleeve(s); over(a, p, sk ? '#f2c640' : '#d97b2a'); a.fill(sk ? 'yellow' : 'orange', p);
      a.band('straw', smooth([[s * 100, -240], [s * 108, -196], [s * 102, -138]], false), sk ? 5 : 3);
      a.key(p, 2.4); if (!sk) a.key(smooth([[s * 70, -232], [s * 88, -190], [s * 90, -150]], false), 1.1);
    })),
    // the hands in the lap (thiền định ấn), drawn simply as statues show them (owner: the finger-by-finger version looked bad): the two
    // hands one soft shape resting on the legs, the thumb tips touching in a small arch over an almond of robe, light on top, shade below,
    // and only a few fine lines: the edge of the upper hand and the tips of the fingers at both ends
    part([-80, -156, 80, -88], a => {
      const h = smooth([[-68, -108], [-64, -121], [-46, -127], [-24, -127], [-13, -139], [0, -143], [13, -139], [24, -127], [46, -127], [64, -121], [68, -108], [52, -99], [0, -96], [-52, -99]]);
      over(a, h, '#f2c640'); a.fill('yellow', h);
      a.fill('straw', smooth([[-58, -104], [-30, -101], [0, -100], [30, -101], [58, -104], [50, -100], [0, -97], [-50, -100]]));   // shade under the hands
      a.band('catY', smooth([[-58, -120], [-40, -124], [-24, -124]], false), 3); a.band('catY', smooth([[24, -124], [40, -124], [58, -120]], false), 3);
      a.band('catY', smooth([[-10, -136], [0, -140], [10, -136]], false), 2.4);
      const gap = smooth([[-12, -127], [0, -134], [12, -127], [0, -122]]); a.fill('orange', gap);   // the robe seen between the thumbs and the fingers
      a.key(h, 2.2); a.key(gap, 1.3);
      a.key(smooth([[-58, -112], [-24, -116], [24, -116], [58, -112]], false), 1.1);
      for (const s of [-1, 1]) a.key(lines([[s * 62, -117, s * 58, -114], [s * 64, -111, s * 60, -109]]), 1);
    }),
    part([-60, -424, 60, -252], a => {                                                  // the head: dark curls and the bump on top, long ears, eyes cast down, a quiet smile
      const neck = smooth([[-19, -258], [-14, -272], [-13, -288], [13, -288], [14, -272], [19, -258], [0, -255]]); over(a, neck, '#f2c640'); a.fill('yellow', neck);
      a.key(smooth([[-12, -264], [0, -261], [12, -264]], false), 1.1); a.key(smooth([[-11, -270], [0, -267], [11, -270]], false), 1);
      for (const s of [-1, 1]) { const e = smooth([[s * 38, -340], [s * 48, -334], [s * 50, -312], [s * 48, -292], [s * 42, -286], [s * 38, -300]]); over(a, e, '#f2c640'); a.fk('yellow', e, 1.8); a.key(smooth([[s * 44, -326], [s * 45, -310], [s * 43, -296]], false), 1); }
      over(a, faceP, '#f2c640'); a.fill('yellow', faceP); a.fill('straw', smooth([[30, -350], [38, -330], [33, -304], [26, -330]]));
      a.key(faceP, 2.4);
      over(a, hairP, '#2a221d'); a.fill('dark', hairP); const ush = circ(0, -400, 19); over(a, ush, '#2a221d'); a.fill('dark', ush);
      for (let r = 0; r < 4; r++) for (let i = -3 + (r % 2) * .5; i <= 3; i++) { const x = i * 11, y = -378 - r * 7; if (Math.abs(x) < 38 - r * 6) a.fill('straw', circ(x, y, 2.6)); }
      for (let i = -1; i <= 1; i++) a.fill('straw', circ(i * 9, -402 + Math.abs(i) * 3, 2.4));
      a.key(hairP, 2.2); a.key(ush, 2);
      a.fill('straw', circ(0, -347, 2.6));
      a.key(smooth([[-31, -340], [-18, -348], [-6, -342]], false), 1.8); a.key(smooth([[31, -340], [18, -348], [6, -342]], false), 1.8);
      a.key(smooth([[-27, -329], [-17, -325], [-7, -329]], false), 2.2); a.key(smooth([[27, -329], [17, -325], [7, -329]], false), 2.2);
      a.key(smooth([[-2, -330], [-4, -314], [0, -310], [4, -312]], false), 1.3);
      a.key(smooth([[-9, -295], [0, -291], [9, -295]], false), 1.6); a.key(smooth([[-4, -287], [0, -286], [4, -287]], false), 1);
    }),
  ];

  /* ---------- the rock he sits on (owner: no flat concrete, a natural rock wrapped in mist): boulders piled back to front, the top one
     flat enough for the lotus; grey stone shaded on the lower right, moss on the tops, a few cracks; 100 px = 1 unit (bounds 900 × 160) ---------- */
  const boulder = (seed, cx, cy, rx, ry, flat) => {
    const r = mulberry(seed), pts = [];
    for (let i = 0; i < 14; i++) { const an = Math.PI + i / 13 * Math.PI, k = .88 + r() * .2; pts.push([cx + Math.cos(an) * rx * k, cy + Math.sin(an) * ry * (flat && Math.abs(Math.cos(an)) < .6 ? .82 : k)]); }
    return part([cx - rx - 12, cy - ry - 12, cx + rx + 12, cy + 14], a => {
      const b = smooth([[cx - rx, cy + 4], ...pts.slice(1, 13), [cx + rx, cy + 4], [cx, cy + 10]]);
      a.underFill(b, '#a9a291'); a.fill('stone', b);
      a.fill('stoneD', smooth([[cx + rx * .1, cy + 6], [cx + rx * .5, cy - ry * .45], [cx + rx * .92, cy - ry * .25], [cx + rx, cy + 4]]));
      a.fill('leafM', smooth([[cx - rx * .7, cy - ry * .62], [cx - rx * .3, cy - ry * .96], [cx + rx * .25, cy - ry * .94], [cx + rx * .05, cy - ry * .78], [cx - rx * .4, cy - ry * .66]]));
      a.fill('leafL', smooth([[cx - rx * .5, cy - ry * .8], [cx - rx * .2, cy - ry * .95], [cx, cy - ry * .9], [cx - rx * .3, cy - ry * .84]]));
      a.key(b, 2.6);
      for (let i = 0; i < 3; i++) { const x = cx + (r() - .5) * rx, y = cy - r() * ry * .6; a.key(smooth([[x, y], [x + 8 + r() * 10, y + 6 + r() * 8], [x + 4, y + 18]], false), 1.2); }
    });
  };
  A.rock = A.rock || [];
  A.seat = [
    boulder(301, -300, -40, 150, 90), boulder(302, 290, -36, 160, 84), boulder(303, -120, -62, 200, 104), boulder(304, 140, -58, 190, 100),
    boulder(305, 0, -96, 240, 70, true),                                    // the top, where the lotus rests
    boulder(306, -230, 0, 120, 50), boulder(307, 210, 2, 140, 54), boulder(308, -20, 6, 170, 46), boulder(309, -380, 4, 80, 34), boulder(310, 390, 6, 74, 30),
  ];
  /* ---------- the forest is bamboo (owner: "rừng tre rừng trúc"): tre = thick green culms, trúc = slender yellow-green ones with fine leaves ---------- */
  const clump = (seed, truc) => part([-176, -530, 176, 10], a => {
    const r = mulberry(seed), n = truc ? 9 : 6, cul = [];
    for (let i = 0; i < n; i++) cul.push({ x0: (i - (n - 1) / 2) * (truc ? 17 : 24) + (r() - .5) * 12, H: (truc ? 380 : 340) + r() * (truc ? 130 : 150), bend: (r() - .5) * (truc ? 90 : 60), w0: truc ? 7.5 + r() * 2 : 12 + r() * 3, d: r() });
    cul.sort((p, q) => p.d - q.d);
    const base = truc ? 'truc' : 'leafM', lite = truc ? 'trucL' : 'leafL', dark = truc ? 'trucD' : 'leafD';
    for (const c of cul) {
      const pt = t => [c.x0 + c.bend * t * t, -c.H * t], pts = []; for (let k = 0; k <= 12; k++) pts.push(pt(k / 12));
      const tb = tube(pts, c.w0, c.w0 * .45);
      a.underFill(tb, truc ? '#8fae56' : '#4f8a4e'); a.fill(base, tb); a.band(lite, lines([pts.map(([x, y]) => [x - c.w0 * .22, y]).flat()]), c.w0 * .22); a.key(tb, truc ? 1.8 : 2.2);
      for (let k = 1; k < (truc ? 11 : 8); k++) { const t = k / (truc ? 11 : 8), [x, y] = pt(t), w = c.w0 * (1 - .55 * t) * .6; a.key(lines([[x - w, y, x + w, y - 1.5]]), 1.5); }   // the nodes
      const lv = truc ? 26 : 18;
      for (let k = 0; k < lv; k++) {
        const t = .55 + r() * .45, [x, y] = pt(t), side = r() < .5 ? -1 : 1, len = truc ? 26 + r() * 16 : 22 + r() * 14, ang = side * (.35 + r() * 1.0) + Math.PI / 2 - .2 * side;
        const ex = x + Math.cos(ang) * len * .5, ey = y + Math.sin(ang) * len * .5 - 3, lf = ell(ex, ey, len / 2, truc ? 2.2 : 3.2, ang);
        a.fill(k % 3 === 0 ? dark : k % 3 === 1 ? base : lite, lf); a.key(lf, .8);
      }
    }
  });
  A.bamboo = { tre: [101, 102, 103].map(i => clump(i, false)), truc: [201, 202, 203].map(i => clump(i, true)) };
  A.rock = [1, 2].map(seed => part([-78, -64, 78, 6], a => {
    const r = mulberry(seed * 9), pts = []; for (let i = 0; i < 9; i++) { const an = Math.PI + i / 8 * Math.PI, rx = 62 + r() * 12, ry = 50 + r() * 10; pts.push([Math.cos(an) * rx, Math.sin(an) * ry]); }
    const body = smooth([[-70, 2], ...pts.slice(1, 8), [70, 2]]); a.fill('stone', body); a.fill('stoneD', smooth([[10, 2], [24, -30], [48, -40], [68, -8], [70, 2]])); a.fill('leafM', smooth([[-50, -34], [-24, -52], [10, -50], [30, -42], [-8, -40], [-30, -30]]));
    a.key(body, 2.6); a.key(lines([[-30, -14, -10, -26], [14, -20, 30, -8]]), 1.2);
  }));

  /* ---------- things in the clearing ---------- */
  A.urn = part([-84, -176, 84, 8], a => {                                      // a bronze incense burner (lư hương đồng) on a red lacquered stand
    a.fk('red', poly([[-58, 2], [58, 2], [50, -12], [-50, -12]]), 2.2); a.band('yellow', lines([[-52, -6, 52, -6]]), 2);   // the stand
    for (const s of [-1, 1]) a.fk('straw', smooth([[s * 30, -40], [s * 40, -38], [s * 44, -22], [s * 50, -14], [s * 34, -12], [s * 30, -24]]), 2);   // two lion feet at the sides
    a.fk('straw', smooth([[-7, -34], [7, -34], [6, -20], [11, -13], [-11, -13], [-6, -20]]), 1.8);                  // and one in front
    const belly = smooth([[-58, -78], [-63, -60], [-54, -42], [-30, -31], [30, -31], [54, -42], [63, -60], [58, -78]]);
    a.underFill(belly, '#b57a22'); a.fill('straw', belly); a.fill('brown', smooth([[20, -76], [60, -74], [60, -56], [48, -40], [26, -33], [38, -52]]));
    a.band('yellow', smooth([[-50, -70], [-55, -58], [-46, -44]], false), 4.5);                                    // the light on its round side
    a.key(belly, 2.6); a.key(lines([[-61, -64, 61, -64], [-58, -52, 58, -52]]), 1.3);
    for (let x = -48; x <= 48; x += 16) a.key(smooth([[x - 5, -56], [x - 5, -61], [x, -61], [x, -57], [x + 3, -57]], false), 1.1);   // cloud scrolls round the band
    for (const s of [-1, 1]) {                                                                                    // two upright ears on the rim
      const ear = tube([[s * 34, -76], [s * 31, -96], [s * 36, -110], [s * 50, -110], [s * 54, -96], [s * 50, -78]], 7, 7);
      a.underFill(ear, '#b57a22'); a.fk('straw', ear, 1.8);
    }
    a.fk('yellow', ell(0, -79, 60, 10), 2.4); a.fill('dark', ell(0, -80, 50, 6.5)); a.fill('ash', ell(0, -80, 46, 5));   // the rim and the ash inside
  });
  A.board = part([-74, -186, 74, 8], a => {                                    // the sign by the stream: two posts, a little tiled roof, a pale panel saying THẢ HOA ĐĂNG over a painted lantern
    for (const x of [-54, 54]) a.fk('brown', poly([[x - 5, 4], [x + 5, 4], [x + 4, -160], [x - 4, -160]]), 2);
    const roof = smooth([[-72, -152], [-56, -160], [-30, -176], [30, -176], [56, -160], [72, -152], [60, -150], [0, -158], [-60, -150]]);
    a.underFill(roof, '#a3332a'); a.fill('red', roof); a.band('brown', smooth([[-62, -156], [0, -166], [62, -156]], false), 3); a.key(roof, 2.4);
    const panel = poly([[-48, -142], [48, -142], [48, -34], [-48, -34]]); a.underFill(panel, '#efe4c4'); a.fill('cream', panel); a.band('brown', panel, 5); a.key(panel, 2.2);
    a.solidText('THẢ', 0, -126, 13, '"Be Vietnam Pro", sans-serif', '800'); a.solidText('HOA ĐĂNG', 0, -110, 13, '"Be Vietnam Pro", sans-serif', '800');   // in Vietnamese (owner)
    a.key(lines([[-38, -98, 38, -98]]), 1);
    a.fill('leafM', ell(0, -50, 24, 5));                                          // a little lantern painted below the words
    for (const [an, ln, pl] of [[-1.1, 18, 'pink'], [1.1, 18, 'pink'], [-.5, 22, 'flower'], [.5, 22, 'flower'], [0, 24, 'flower']]) a.fk(pl, ell(Math.sin(an) * ln * .45, -52 - Math.cos(an) * ln * .45, 5.5, ln * .5, an), 1.1);
    a.fill('yellow', ell(0, -70, 2.6, 5));
  });
  A.hoadang = [['pink', 'flower'], ['flower', 'white'], ['orange', 'catY']].map(([c1, c2]) => part([-36, -50, 36, 10], a => {   // a flower lantern: a paper lotus round a candle, on a leaf
    a.fk('leafM', ell(0, 2, 32, 7), 1.6);
    for (const [an, ln] of [[-1.15, 26], [1.15, 26], [-.62, 32], [.62, 32]]) { const p = ell(Math.sin(an) * ln * .5, -Math.cos(an) * ln * .5 - 2, 8, ln * .55, an); a.underFill(p, '#f3d4dc'); a.fk(c1, p, 1.3); }
    const flame = smooth([[0, -46], [5, -34], [3, -27], [-3, -27], [-5, -34]]); a.fill('yellow', flame); a.fill('white', smooth([[0, -40], [2.4, -32], [0, -29], [-2.4, -32]]));
    a.fk('white', poly([[-4, -27], [4, -27], [4, -14], [-4, -14]]), 1);
    for (const [an, ln] of [[-.32, 30], [.32, 30], [0, 26]]) { const p = ell(Math.sin(an) * ln * .45, -Math.cos(an) * ln * .45 + 1, 8, ln * .5, an); a.underFill(p, '#f6eee6'); a.fk(c2, p, 1.3); }
  }));
  A.lantern = part([-46, -206, 46, 6], a => {                                  // a stone lantern: lotus foot, a pillar with a ring, a carved shelf, the light box, an upturned roof and a jewel
    a.fk('stoneD', poly([[-32, 2], [32, 2], [28, -10], [-28, -10]]), 2.2);
    a.fill('leafM', smooth([[-30, 0], [-20, -8], [-8, -6], [-14, 0]]));
    for (let i = -2; i <= 2; i++) { const p = smooth([[i * 10 - 6, -10], [i * 10, -21], [i * 10 + 6, -10]]); a.underFill(p, '#cdc5b2'); a.fk('stone', p, 1.3); }
    const pil = poly([[-9, -18], [9, -18], [7, -96], [-7, -96]]); a.underFill(pil, '#cdc5b2'); a.fill('stone', pil); a.fill('stoneD', poly([[3, -18], [9, -18], [7, -96], [2, -96]])); a.key(pil, 2);
    a.fk('stone', poly([[-12, -58], [12, -58], [12, -64], [-12, -64]]), 1.6);
    const shelf = poly([[-14, -96], [14, -96], [28, -110], [-28, -110]]); a.underFill(shelf, '#cdc5b2'); a.fill('stone', shelf); a.key(shelf, 2);
    for (let x = -22; x <= 22; x += 11) a.key(smooth([[x - 4, -101], [x, -107], [x + 4, -101]], false), 1);
    const box = poly([[-20, -110], [20, -110], [20, -152], [-20, -152]]); a.underFill(box, '#cdc5b2'); a.fill('stone', box); a.fill('stoneD', poly([[12, -110], [20, -110], [20, -152], [12, -152]]));
    const win = smooth([[-11, -116], [11, -116], [11, -138], [6, -146], [0, -148], [-6, -146], [-11, -138]]); a.fill('yellow', win); a.key(win, 1.6); a.key(lines([[0, -116, 0, -147], [-11, -130, 11, -130]]), 1);
    a.key(box, 2.2);
    const roof = smooth([[-44, -150], [-30, -158], [-14, -174], [0, -180], [14, -174], [30, -158], [44, -150], [40, -146], [26, -152], [0, -156], [-26, -152], [-40, -146]]);
    a.underFill(roof, '#9a927f'); a.fill('stoneD', roof); a.fill('leafM', smooth([[-22, -166], [-8, -176], [6, -176], [-6, -168]])); a.band('stone', smooth([[-36, -152], [-18, -166], [0, -174]], false), 3); a.key(roof, 2.4);
    a.fk('stone', smooth([[0, -198], [7, -190], [8, -184], [0, -179], [-8, -184], [-7, -190]]), 1.8); a.fk('stoneD', ell(0, -181, 9, 3), 1.2);   // the jewel on top
  });
  // a lotus pot (owner: prettier, the flowers swaying): a blue-and-white glazed basin with water and floating pads; the standing leaves,
  // the open flowers and the buds are parts of their own, put on swaying stems by ttLotusPot
  A.pot = part([-80, -78, 80, 8], a => {
    const body = smooth([[-66, -60], [-72, -44], [-62, -18], [-40, -4], [40, -4], [62, -18], [72, -44], [66, -60]]);
    a.underFill(body, '#efe9da'); a.fill('white', body);
    a.band('blue', smooth([[-70, -46], [0, -40], [70, -46]], false), 3); a.band('blue', smooth([[-58, -14], [0, -9], [58, -14]], false), 3);
    for (let x = -54; x <= 54; x += 18) a.band('blue', smooth([[x - 7, -24], [x - 3, -33], [x + 3, -33], [x + 7, -24], [x + 2, -28]], false), 2.2);   // waves round the belly
    a.key(body, 2.6);
    a.fk('blue', poly([[-34, -4], [34, -4], [30, 4], [-30, 4]]), 2);                 // the foot
    a.fk('white', ell(0, -60, 68, 11), 2.4); a.fill('blue', ell(0, -60, 60, 8)); a.band('white', smooth([[-40, -62], [-20, -64], [0, -63]], false), 1.6);   // rim and water
    for (const [x, y, r] of [[-30, -60, 15], [26, -59, 13]]) { const pad = new Path2D(); pad.ellipse(x, y, r, r * .32, 0, .4, 6.0); pad.lineTo(x, y); pad.closePath(); a.fk('leafM', pad, 1.4); }
  });
  A.lotusLeaf = part([-34, -16, 34, 8], a => {                                     // a standing leaf: a shallow green cup seen from the side
    const cup = smooth([[-32, -6], [-20, 2], [0, 5], [20, 2], [32, -6], [20, -10], [0, -12], [-20, -10]]); a.underFill(cup, '#4f8a4e'); a.fill('leafM', cup);
    a.fill('leafL', smooth([[-28, -7], [-14, -10], [0, -11], [14, -10], [28, -7], [0, -6]]));
    a.key(cup, 1.8); a.key(lines([[0, 3, -20, -8], [0, 3, 0, -10], [0, 3, 20, -8]]), .9);
  });
  A.lotusFlower = part([-34, -50, 34, 8], a => {                                   // an open flower
    for (const [dx, an, ln] of [[-14, -.75, 34], [14, .75, 34], [-6, -.3, 40], [6, .3, 40]]) { const p = ell(dx * .6 + Math.sin(an) * ln * .5, -Math.cos(an) * ln * .5, 9, ln * .55, an); a.underFill(p, '#f3d4dc'); a.fk('flower', p, 1.4); }
    a.fk('yellow', ell(0, -12, 10, 5), 1.2);
    for (const [dx, an, ln] of [[-10, -.45, 30], [10, .45, 30], [0, 0, 34]]) { const p = ell(dx * .5 + Math.sin(an) * ln * .45, -Math.cos(an) * ln * .45 + 2, 8.5, ln * .5, an); a.underFill(p, '#f6eee6'); a.fill('white', p); a.band('flower', smooth([[Math.sin(an) * ln * .6 + dx * .5 - 3, -Math.cos(an) * ln * .75], [Math.sin(an) * ln * .8 + dx * .5, -Math.cos(an) * ln * .9], [Math.sin(an) * ln * .6 + dx * .5 + 3, -Math.cos(an) * ln * .75]], false), 3); a.key(p, 1.3); }
    a.fk('leafM', smooth([[-8, 2], [0, 6], [8, 2], [0, -2]]), 1);
  });
  A.lotusBud = part([-14, -40, 14, 6], a => {                                      // a bud
    const b = smooth([[0, -38], [9, -20], [8, -4], [0, 2], [-8, -4], [-9, -20]]); a.underFill(b, '#e58aa0'); a.fill('flower', b); a.fill('white', smooth([[-7, -6], [0, 2], [7, -6], [0, -12]])); a.key(b, 1.5); a.key(lines([[0, -36, 0, -4]]), .9);
  });
  A.cushion = part([-38, -18, 38, 14], a => {                                   // a round woven rush cushion (bồ đoàn cói), seen low: rings of plaited straw, a darker rim
    const top = ell(0, -4, 32, 10.5), side = smooth([[-32, -4], [-32, 2], [-24, 8], [0, 10], [24, 8], [32, 2], [32, -4], [0, 6]]);
    a.underFill(side, '#8a5a2a'); a.fill('brown', side); a.underFill(top, '#c99a52'); a.fill('straw', top);
    for (const r of [26, 19, 12]) a.band('cream', ell(0, -4, r, r * .33), 1.4);
    for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283; a.key(lines([[Math.cos(an) * 6, -4 + Math.sin(an) * 2, Math.cos(an) * 30, -4 + Math.sin(an) * 9.8]]), .6); }
    a.fill('brown', ell(0, -4, 4.5, 1.6)); a.key(top, 2); a.key(side, 2.2);
  });
  PL.ash = PL.ash || ['#b9b0a4', [1, 1.4]];
  return (TT_ART = A);
}

/* ---------- the far scenery, painted once per size: sky, three ridges, mist (screen space; ttBack returns a canvas) ---------- */
let TT_BACK = null;
function ttBack(W, H, hor) {
  const key = W + 'x' + H + ':' + (hor | 0);
  if (TT_BACK && TT_BACK.key === key) return TT_BACK.c;
  const c = mk(W, H), g = c.getContext('2d'), r = mulberry(77);
  const sky = g.createLinearGradient(0, 0, 0, hor);
  sky.addColorStop(0, '#87a8c4'); sky.addColorStop(.5, '#c7d3d2'); sky.addColorStop(.82, '#efe0bb'); sky.addColorStop(1, '#f6e7c4');
  g.fillStyle = sky; g.fillRect(0, 0, W, hor + 2);
  const sun = g.createRadialGradient(W * .5, hor * .62, 4, W * .5, hor * .62, Math.max(W, H) * .45);   // a pale sun behind the Buddha's head
  sun.addColorStop(0, 'rgba(255,248,214,.95)'); sun.addColorStop(.12, 'rgba(255,240,190,.55)'); sun.addColorStop(1, 'rgba(255,240,190,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, hor + 2);
  const ridge = (top, amp, col, hi, mist, seed) => {
    const q = mulberry(seed), pts = [], n = 60; let y = 0, v = 0;
    for (let i = 0; i <= n; i++) { v += (q() - .5) * 1.1; v *= .9; y = Math.sin(i * .22 + seed) * .5 + Math.sin(i * .09 + seed * 2) * .8 + v; pts.push([W * i / n, top - amp * (y + 1.2) / 2.4]); }
    const p = new Path2D(); p.moveTo(0, hor + 4); for (const [x, yy] of pts) p.lineTo(x, yy); p.lineTo(W, hor + 4); p.closePath();
    const gr = g.createLinearGradient(0, top - amp, 0, hor); gr.addColorStop(0, hi); gr.addColorStop(.55, col); gr.addColorStop(1, mist);
    g.fillStyle = gr; g.fill(p);
    g.strokeStyle = 'rgba(40,52,60,.28)'; g.lineWidth = 1.3; g.beginPath(); pts.forEach(([x, yy], i) => i ? g.lineTo(x, yy) : g.moveTo(x, yy)); g.stroke();
    for (let i = 0; i < 14; i++) { const x = q() * W, yy = top - amp * .5 + q() * amp * .4; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + 40, yy - 6, x + 90, yy); g.stroke(); }
  };
  ridge(hor - hor * .38, hor * .3, '#9fb3bf', '#bccdd2', '#e6e2cf', 5);
  ridge(hor - hor * .18, hor * .26, '#7f9aa0', '#9bb3b2', '#d3d9c6', 9);
  ridge(hor - hor * .02, hor * .2, '#5f7f74', '#7c9a86', '#b9c7a8', 14);
  TT_BACK = { key, c }; return c;
}

/* ---------- a mouse seen from behind, kneeling (owner: it bows toward the Buddha, so the viewer sees its back and rump) ----------
   Four parts per sort, drawn in c4Mouse's units (≈150 tall standing): head (back of the head, ears, hat), torso (back of the robe,
   origin at the hips), rear (the hips on the heels, soles showing), tail. ttDrawBack poses them. */
const TT_BACKS = {};
const poly = pts => { const q = new Path2D(); q.moveTo(pts[0][0], pts[0][1]); for (const t of pts.slice(1)) q.lineTo(t[0], t[1]); q.closePath(); return q; };
function ttBackRig(i, ov) {                                           // ov: { key, o } = the colours of a Hồ sơ mouse instead of a sort's
  const ck = ov ? ov.key : i;
  if (TT_BACKS[ck]) return TT_BACKS[ck];
  const o = ov ? ov.o : C4_MOUSE_SORTS[i].o, B = {}, robe = o.robe, trim = o.trim, fur = o.head;
  // the same mouse as c4Mouse's side view (buildMouse): fur, lilac ears with a red heart, a cap of the trim colour (or the hat with its red knot),
  // the robe with a lilac belly seen only from the front, the trim hem, lilac feet, a tail that is only a line of ink
  B.head = part([-34, -46, 34, 26], a => {
    a.fk(fur, circ(0, -2, 18), 2.4);
    for (const s of [-1, 1]) { a.fk(fur, circ(s * 15, -15, 9.5), 2); a.fill('lilac', smooth([[s * 16, -22], [s * 21, -15], [s * 17, -9]])); }   // ears seen from behind: fur outside, a little lilac inside
    if (o.hat) { a.fk(o.hat, smooth([[-18, -2], [-16, -17], [0, -24], [16, -17], [18, -2], [8, -9], [-8, -9]]), 2.2); a.fk('red', circ(0, -23, 4), 1.4); }
    else { a.fk(trim, smooth([[-17, -4], [-14, -17], [0, -22], [14, -17], [17, -4], [7, -10], [-7, -10]]), 1.8); }
    a.key(smooth([[-6, 13], [0, 15], [6, 13]], false), 1.2);
  });
  B.body = part([-40, -68, 40, 10], a => {                                          // ONE body, as the side view has: an egg of robe from the shoulders to the hem on the heels
    const t = smooth([[-24, 1], [-29, -18], [-28, -36], [-21, -54], [-9, -62], [9, -62], [21, -54], [28, -36], [29, -18], [24, 1], [0, 4]]); a.fill(robe, t);
    a.fill(trim, smooth([[-27, -11], [0, -6], [27, -11], [24, 1], [0, 4], [-24, 1]]));
    a.fill(trim, smooth([[-10, -59], [0, -62], [10, -59], [0, -53]]));
    a.key(t, 2.6); a.key(lines([[-27, -11, 0, -6, 27, -11]]), 1.2);
    a.key(lines([[-10, -44, -15, -24, -12, -12], [4, -40, 2, -26, 6, -12]]), 1.3);
    if (o.dots) for (const [x, y] of [[-12, -30], [8, -22], [-6, -44], [14, -40]]) a.fk('yellow', circ(x, y, 2.6), 1);
    for (const s of [-1, 1]) { a.fk(robe, smooth([[s * 21, -56], [s * 31, -50], [s * 33, -30], [s * 29, -16], [s * 22, -22]]), 2); a.fk('lilac', ell(s * 28, -14, 5, 4), 1.4); }   // arms hanging at the sides, hands on the thighs
    for (const s of [-1, 1]) a.fk('lilac', ell(s * 14, 5, 7, 3.4), 1.6);                  // soles under the hem
  });
  B.tail = part([-6, -34, 74, 8], a => { a.key(smooth([[0, 0], [14, -4], [36, -2], [58, -12], [68, -30]], false), 3.2); });
  return (TT_BACKS[ck] = B);
}
function ttDrawBack(g, o, sx, sy, k, bow, alpha) {
  const B = ttBackRig(o.sort, o.look ? ttLookOv(o) : null), c = Math.cos(bow * 1.35), lift = -9 * bow, sc = Math.max(.3, c + .08);
  g.save(); g.translate(sx, sy); g.scale(k, k); g.globalAlpha *= alpha;
  const hs = .98 - .14 * bow;
  dp(g, B.tail, 10 * o.face, -2 + lift, 0, o.face, 1);                               // the tail lies on the ground behind the robe
  dp(g, B.head, 0, lift - 62 * sc - 10 * (1 - bow * .5) + 4 * bow, 0, hs, hs);       // the head sinks behind the bowing back
  dp(g, B.body, 0, lift, 0, 1 + .05 * bow, sc);
  g.restore();
}
