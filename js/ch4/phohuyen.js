/* Phố huyện (owner, 2026-10-14: "bây giờ buôn bán trên phố huyện, tạo thử khung cảnh phố huyện"; then the owner's pictures of Hội An,
   "tham khảo phố cổ Hội An thế kỷ 17 18"): the couple's next market is a river town. A first look only: with ?phohuyen in the address
   (or C4.town = true) the lane becomes a town street: old shophouses wall to wall with ochre walls weathered by the rain, big low roofs
   of dark yin-yang tiles, a deep eave over the shop front, a wooden upper floor with a balcony or lattice, strings of silk lanterns,
   bougainvillea and potted palms; the street is paved, and in front of it the river with its stone quay, sampans and the covered
   bridge (after Chùa Cầu). Far behind: the district office, a watchtower, temple roofs. Nothing in play changes yet. */
C4.town = /[?&]phohuyen/.test(location.search);

// the houses: half width, one or two storeys, the wall and wood colours, the upper floor's front, the board's words
const C4_TOWN_V = [
  { w: 96, two: true, wall: 'catY2', wood: 'brown', up: 'balc', sign: 'THUỐC BẮC', board: 'red' },
  { w: 104, two: false, wall: 'catY', wood: 'brown', up: null, sign: 'VẢI LỤA', board: 'dark' },
  { w: 88, two: true, wall: 'catY2', wood: 'dark', up: 'lattice', sign: 'ĐỒ GỐM', board: 'red' },
  { w: 100, two: true, wall: 'catY', wood: 'brown', up: 'wall', sign: 'QUÁN NƯỚC', board: 'dark' },
  { w: 92, two: false, wall: 'catY2', wood: 'dark', up: null, sign: 'TẠP HOÁ', board: 'red' },
  { w: 98, two: true, wall: 'catY2', wood: 'brown', up: 'balc', sign: 'ĐÈN LỒNG', board: 'dark' },
  { w: 90, two: true, wall: 'catY', wood: 'dark', up: 'lattice', sign: 'THỢ BẠC', board: 'red' },
  { w: 102, two: false, wall: 'catY', wood: 'brown', up: null, sign: 'GẠO MUỐI', board: 'dark' },
];
const C4_LANTERN_COLS = ['red', 'yellow', 'red', 'blue', 'green', 'orange', 'red', 'pink'];
// a tiled roof slope seen from the street: the tiles run down in rows of tubes (ngói âm dương)
function c4TileRoof(a, x0, x1, yTop, yBot, out, pl = 'brown') {
  const p = smooth([[x0 - out, yBot], [x0 - out + 4, yBot - 6], [x0 + 6, yTop], [x1 - 6, yTop], [x1 + out - 4, yBot - 6], [x1 + out, yBot]]);
  a.fk(pl, p, 2.4);
  const t = []; for (let x = x0 - out + 8; x < x1 + out - 6; x += 9) { const k = (x - x0) / (x1 - x0); t.push([x + (0.5 - k) * 6, yTop + 3, x, yBot - 2]); }
  a.key(lines(t), .8);
  a.key(lines([[x0 - out + 2, yBot - 2, x1 + out - 2, yBot - 2]]), 2);
}
function c4Lanterns(a, x0, x1, y, seed) {
  for (let x = x0, i = 0; x <= x1; x += 22, i++) {
    const c = C4_LANTERN_COLS[(seed + i * 3) % C4_LANTERN_COLS.length], dy = (i % 2) * 6;
    a.key(lines([[x, y, x, y + 6 + dy]]), .9);
    a.fk(c, ell(x, y + 14 + dy, 7, 9), 1.4);
    a.key(lines([[x - 5, y + 8 + dy, x + 5, y + 8 + dy], [x - 5, y + 20 + dy, x + 5, y + 20 + dy], [x, y + 23 + dy, x, y + 31 + dy]]), .9);
  }
}
const C4_TOWN_ART = [];
function c4TownArt(v) {
  v = ((v | 0) % C4_TOWN_V.length + C4_TOWN_V.length) % C4_TOWN_V.length;
  if (C4_TOWN_ART[v]) return C4_TOWN_ART[v];
  const o = C4_TOWN_V[v], w = o.w, eave = -150, upTop = o.two ? -250 : -160, roofTop = o.two ? -320 : -270;
  return (C4_TOWN_ART[v] = part([-w - 26, roofTop - 30, w + 26, 6], a => {
    // the ground floor: an ochre wall weathered dark at the foot, a wooden shop front with folding panels, a stone step
    a.fk(o.wall, rect(-w, eave, w * 2, -eave), 2.4);
    a.fill('tan', rect(-w + 2, -26, w * 2 - 4, 20)); a.fill('catY', rect(-w + 10, eave + 20, 40, 18));
    a.fk(o.wood, rect(-w + 22, eave + 30, w * 2 - 44, -eave - 36), 2);
    const pn = Math.max(4, Math.round((w * 2 - 44) / 20)), pw = (w * 2 - 44) / pn;
    for (let i = 0; i < pn; i++) { const x = -w + 22 + i * pw; if (i % 4 === 1) { a.fill('dark', rect(x + 2, eave + 34, pw - 4, -eave - 42)); continue; } a.key(lines([[x, eave + 30, x, -6], [x + 3, eave + 46, x + pw - 3, eave + 46], [x + 3, -40, x + pw - 3, -40]]), 1); }
    a.fk('ash', rect(-w + 8, -6, w * 2 - 16, 6), 1.6);
    a.fk(o.board, rect(-44, eave + 6, 88, 20), 1.8);
    a.text(o.sign, 0, eave + 16, 12, o.board === 'dark' ? 'yellow' : 'yellow', '"Playfair Display", serif', 'color', '900');
    if (o.two) {
      // the upper floor, set back a little: wood with a balcony, a lattice, or an ochre wall with a small window
      const ux = w - 10;
      if (o.up === 'wall') { a.fk(o.wall, rect(-ux, upTop, ux * 2, eave - upTop), 2.2); a.fk('dark', rect(-22, upTop + 28, 44, 34), 1.8); a.key(lines([[-11, upTop + 28, -11, upTop + 62], [0, upTop + 28, 0, upTop + 62], [11, upTop + 28, 11, upTop + 62]]), 1); }
      else {
        a.fk(o.wood, rect(-ux, upTop, ux * 2, eave - upTop), 2.2);
        for (const x of [-ux, -ux / 3, ux / 3, ux - 8]) a.fk('dark', rect(x - (x > 0 ? 0 : 0), upTop, 8, eave - upTop), 1.2);
        if (o.up === 'lattice') { const L = []; for (let x = -ux + 14; x < ux - 10; x += 12) L.push([x, upTop + 18, x, eave - 30]); for (let y = upTop + 18; y < eave - 30; y += 12) L.push([-ux + 12, y, ux - 12, y]); a.key(lines(L), .8); }
        else { a.fk('dark', rect(-ux + 14, upTop + 14, ux * 2 - 28, 40), 1.6); a.fk(o.wood, rect(-ux + 4, eave - 40, ux * 2 - 8, 6), 1.4); const B = []; for (let x = -ux + 10; x < ux - 6; x += 9) B.push([x, eave - 34, x, eave - 6]); a.key(lines([[-ux + 4, eave - 34, ux - 4, eave - 34], ...B]), 1.1); }
      }
    }
    // the deep eave over the shop front, lanterns hanging from it
    c4TileRoof(a, -w, w, eave - 26, eave + 4, 22, 'tan');
    c4Lanterns(a, -w + 10, w - 10, eave + 4, v * 2);
    // the main roof: big, low, dark tiles, a straight ridge with little upturned ends
    c4TileRoof(a, -w + (o.two ? 8 : 0), w - (o.two ? 8 : 0), roofTop, o.two ? upTop + 8 : eave - 24, o.two ? 18 : 22, 'brown');
    a.fk('dark', smooth([[-w + 4, roofTop + 2], [-w - 2, roofTop - 12], [-w + 14, roofTop - 6], [w - 14, roofTop - 6], [w + 2, roofTop - 12], [w - 4, roofTop + 2]]), 1.6);
  }));
}
// bougainvillea climbing a post, and a potted palm (between the houses)
let C4_FLOWER_ART = null, C4_POT_ART = null;
const c4FlowerArt = () => C4_FLOWER_ART || (C4_FLOWER_ART = part([-70, -230, 70, 6], a => {
  a.fk('brown', smooth([[-4, 0], [-6, -80], [2, -150], [-2, -190], [6, -190], [10, -150], [4, -80], [6, 0]]), 1.8);
  const r = mulberry(7);
  for (let i = 0; i < 26; i++) { const x = -54 + r() * 108, y = -220 + r() * 120; a.fk(i % 4 ? 'pink' : 'green', ell(x, y, 13 + r() * 9, 10 + r() * 6, r() * 3), 1.2); }
}));
const c4PotArt = () => C4_POT_ART || (C4_POT_ART = part([-50, -150, 50, 6], a => {
  for (let i = 0; i < 7; i++) { const ang = -Math.PI / 2 + (i - 3) * .38, x2 = Math.cos(ang) * 70, y2 = -50 + Math.sin(ang) * 80; a.band('green', smooth([[0, -46], [x2 * .5, -46 + (y2 + 46) * .6 - 10], [x2, y2]], false), 6); a.key(smooth([[0, -46], [x2 * .5, -46 + (y2 + 46) * .6 - 10], [x2, y2]], false), 1); }
  a.fk('red', smooth([[-22, -46], [22, -46], [16, 0], [-16, 0]]), 2); a.fk('brown', rect(-24, -50, 48, 6), 1.4);
}));
// far off: the district office's gate with a flag pole, a watchtower, a temple, the roofs of the town (all under dark tiles)
let C4_TOWN_FAR = null;
function c4TownFarArt() {
  if (C4_TOWN_FAR) return C4_TOWN_FAR;
  return (C4_TOWN_FAR = {
    gate: part([-200, -340, 200, 6], a => {
      a.fk('catY', rect(-150, -150, 300, 150), 2.4);
      a.fk('dark', smooth([[-40, 0], [-40, -90], [-30, -112], [0, -122], [30, -112], [40, -90], [40, 0]]), 2.2);
      c4TileRoof(a, -150, 150, -214, -150, 26, 'dark');
      c4TileRoof(a, -96, 96, -262, -214, 16, 'dark');
      a.fk('red', rect(-62, -204, 124, 28), 2); a.text('HUYỆN ĐƯỜNG', 0, -190, 14, 'yellow', '"Playfair Display", serif', 'color', '900');
      a.fk('dark', rect(150, -330, 6, 330), 1.6); a.fk('yellow', smooth([[156, -328], [192, -318], [182, -308], [194, -298], [156, -294]]), 1.8);
    }),
    tower: part([-70, -330, 70, 6], a => {
      a.key(lines([[-40, 0, -20, -230], [40, 0, 20, -230], [-34, -60, 34, -60], [-28, -130, 28, -130], [-40, 0, 28, -130], [40, 0, -28, -130]]), 2.4);
      a.fk('brown', rect(-30, -262, 60, 34), 2);
      a.fk('dark', smooth([[-46, -262], [0, -312], [46, -262]]), 2.2);
    }),
    temple: part([-200, -240, 200, 6], a => {
      a.fk('catY', rect(-150, -110, 300, 110), 2.2);
      for (const x of [-120, -60, 0, 60, 120]) a.fk('red', rect(x - 6, -110, 12, 110), 1.6);
      c4TileRoof(a, -150, 150, -176, -110, 30, 'dark');
      a.fk('green', smooth([[-128, -176], [-150, -204], [-110, -190], [110, -190], [150, -204], [128, -176]]), 2);
    }),
    roofs: part([-260, -150, 260, 6], a => {
      for (let i = 0; i < 6; i++) { const x = -230 + i * 92, h = 70 + (i % 3) * 18; a.fk(i % 2 ? 'catY' : 'catY2', rect(x, -h, 84, h), 1.8); c4TileRoof(a, x + 6, x + 78, -h - 30, -h, 10, 'dark'); }
    }),
  });
}
// the town's rows (called from c4DayLook): houses wall to wall, now and then a bougainvillea or a potted palm; far landmarks
function c4TownScene(rs) {
  const near = [], far = [];
  near.push([110, 'bridge', .62]);                                          // the covered bridge over a canal between the blocks (after Chùa Cầu)
  let x = 520, i = 0;
  while (x < C4_W + 200) {
    const v = (rs() * C4_TOWN_V.length) | 0, w = C4_TOWN_V[v].w * .72;
    near.push([x + w, 'shop', .72, v]); x += w * 2; i++;
    if (i % 3 === 0) { near.push([x + 14, rs() < .5 ? 'flower' : 'pot', .7]); x += 30; }
  }
  for (let fx = -100; fx < 3200; fx += 300 + rs() * 120) far.push([fx, 'roofs', .85]);
  far.push([700, 'gate', 1], [1500, 'tower', 1.05], [2300, 'temple', 1.1], [1100, 'bigtree', .75], [2900, 'tower', .95]);
  return { far, near };
}
const c4TownPart = k => k === 'bigtree' ? WP.bigTree : c4TownFarArt()[k];
const c4TownNear = k => k === 'flower' ? c4FlowerArt() : k === 'pot' ? c4PotArt() : k === 'bridge' ? c4BridgeArt() : null;
// the paving of the street: big worn stone slabs
function c4TownPaving(g, cx, vw) {
  g.save(); g.fillStyle = 'rgba(160,112,58,.16)'; g.fillRect(cx - 50, C4_Y0 - 4, vw + 100, C4_D + 10);
  g.strokeStyle = 'rgba(91,47,31,.26)'; g.lineWidth = 1.3;
  const rows = 6; let yPrev = C4_Y0 - 4;
  for (let r = 1; r <= rows; r++) {
    const y = C4_Y0 - 4 + (C4_D + 10) * r / rows; g.beginPath(); g.moveTo(cx - 50, y); g.lineTo(cx + vw + 50, y); g.stroke();
    const step = 60 + r * 10, off = (r % 2) * step / 2;
    g.beginPath(); for (let x = Math.floor((cx - 80) / step) * step + off; x < cx + vw + 80; x += step) { g.moveTo(x, yPrev); g.lineTo(x + 3, y); } g.stroke();
    yPrev = y;
  }
  g.restore();
}
// in front of the street: the stone quay, the river with sampans going by, the covered bridge
let C4_BRIDGE_ART = null;
const c4BridgeArt = () => C4_BRIDGE_ART || (C4_BRIDGE_ART = part([-230, -250, 230, 70], a => {
  a.fk('ash', smooth([[-220, 60], [-220, -40], [220, -40], [220, 60], [150, 60], [150, 20], [130, -4], [100, -10], [70, -4], [50, 20], [50, 60], [-50, 60], [-50, 20], [-70, -4], [-100, -10], [-130, -4], [-150, 20], [-150, 60]]), 2.4);
  const st = []; for (let x = -210; x < 220; x += 28) st.push([x, -40, x, -18]); a.key(lines(st), .9);
  a.fk('red', rect(-200, -52, 400, 12), 1.8);
  for (let x = -190; x <= 190; x += 38) a.fk('red', rect(x - 5, -140, 10, 88), 1.6);
  a.fk('brown', rect(-200, -82, 400, 8), 1.6); const R = []; for (let x = -196; x < 200; x += 10) R.push([x, -76, x, -54]); a.key(lines(R), .9);
  c4TileRoof(a, -200, 200, -200, -138, 28, 'dark');
  a.fk('dark', smooth([[-190, -198], [-214, -226], [-170, -212], [170, -212], [214, -226], [190, -198]]), 1.8);
  for (const x of [-120, 0, 120]) a.fk('green', smooth([[x - 14, -212], [x, -236], [x + 14, -212]]), 1.4);
}));
function c4TownRiver(g, cx, vw, V) {
  const yq = C4_Y0 + C4_D + 8, yw = yq + 16, x0 = cx - 50, x1 = cx + vw + 50, yb = V.vh - V.oy + 60;
  g.save();
  // the quay: a band of stone blocks
  g.fillStyle = '#b9b0a4'; g.fillRect(x0, yq, x1 - x0, 16); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, yq); g.lineTo(x1, yq); g.moveTo(x0, yw); g.lineTo(x1, yw); g.stroke();
  g.lineWidth = 1; g.beginPath(); for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) { g.moveTo(x, yq); g.lineTo(x, yw); } g.stroke();
  // the water: green-grey, the town's ochre and the lanterns reflected in streaks, ripples drifting
  g.fillStyle = 'rgba(86,128,112,.78)'; g.fillRect(x0, yw, x1 - x0, yb - yw);
  g.globalAlpha = .22; for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) { g.fillStyle = (x / 90) % 3 ? '#d9a94e' : '#a3332a'; g.fillRect(x + 10, yw + 4, 30 + ((x / 90) % 2) * 20, 40); }
  g.globalAlpha = 1; g.strokeStyle = 'rgba(242,236,222,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (let r = 0; r < 6; r++) { const y = yw + 14 + r * 22, off = (C4.t * (6 + r * 3)) % 80; for (let x = Math.floor((x0 - off) / 80) * 80 + off; x < x1; x += 80) { g.moveTo(x + r * 23, y); g.quadraticCurveTo(x + r * 23 + 10, y - 4, x + r * 23 + 20, y); } }
  g.stroke();
  // sampans: one going each way
  const B = C4.townBoats || (C4.townBoats = [{ x: 300, sp: 16, y: 40 }, { x: 2200, sp: -11, y: 92 }]);
  for (const b of B) {
    if (!C4.paused) { b.x += b.sp / 60; if (b.x > C4_W + 300) b.x = -300; if (b.x < -300) b.x = C4_W + 300; }
    if (b.x < x0 - 120 || b.x > x1 + 120) continue;
    const y = yw + b.y + Math.sin(C4.t * 1.4 + b.x) * 1.5, d = Math.sign(b.sp);
    g.fillStyle = '#7a4a22'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x - 66, y - 10); g.quadraticCurveTo(b.x, y + 14, b.x + 66, y - 10); g.lineTo(b.x + 56, y - 2); g.quadraticCurveTo(b.x, y + 6, b.x - 56, y - 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#a3332a'; g.fillRect(b.x - 50, y - 8, 100, 4);
    g.fillStyle = '#b57a22'; g.beginPath(); g.moveTo(b.x - 24, y - 6); g.quadraticCurveTo(b.x - 4, y - 32, b.x + 16, y - 6); g.closePath(); g.fill(); g.stroke();
    const px = b.x - d * 40; g.fillStyle = '#2f5f8f'; g.beginPath(); g.ellipse(px, y - 20, 7, 10, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#e8d8a8'; g.beginPath(); g.moveTo(px - 12, y - 28); g.lineTo(px, y - 42); g.lineTo(px + 12, y - 28); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(px + d * 6, y - 34); g.lineTo(px - d * 18 + Math.sin(C4.t * 1.2) * 6, y + 28); g.stroke();
  }
  g.restore();
}
// the street's gate: brick piers, a double tiled roof, the board PHỐ HUYỆN (in place of the village market's bamboo gate)
let C4_TOWN_GATE = null;
const c4TownGate = () => C4_TOWN_GATE || (C4_TOWN_GATE = part([-160, -360, 160, 6], a => {
  for (const x of [-112, 112]) { a.fk('catY2', rect(x - 16, -280, 32, 280), 2.2); a.fill('tan', rect(x - 14, -30, 28, 26)); a.fk('ash', rect(x - 20, -292, 40, 14), 1.8); }
  c4TileRoof(a, -128, 128, -322, -280, 24, 'dark');
  c4TileRoof(a, -70, 70, -350, -322, 14, 'dark');
  a.fk('red', rect(-86, -262, 172, 40), 2.2);
  a.text('PHỐ HUYỆN', 0, -242, 24, 'yellow', '"Playfair Display", serif', 'color', '900');
  c4Lanterns(a, -90, 90, -280, 1);
}));
