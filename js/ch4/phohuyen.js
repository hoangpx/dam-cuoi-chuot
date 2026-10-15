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
const c4TownNear = k => k === 'flower' ? c4FlowerArt() : k === 'pot' ? c4PotArt() : null;
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
const C4_BRIDGE_X = 150, C4_BRIDGE_HW = 140;                                 // the bridge's middle and half span: the street runs over it
const c4OnBridge = x => Math.abs(x - C4_BRIDGE_X) < C4_BRIDGE_HW + 10;
// the creek behind the street, coming down between the houses to the bridge; the bridge's wooden deck over the street
function c4TownCreek(g, cx, vw) {
  if (C4_BRIDGE_X + C4_BRIDGE_HW < cx - 60 || C4_BRIDGE_X - C4_BRIDGE_HW > cx + vw + 60) return;
  const x0 = C4_BRIDGE_X - 70, x1 = C4_BRIDGE_X + 70, yT = C4_Y0 - 150, yB = C4_Y0 - 4;
  g.save();
  g.fillStyle = '#b9b0a4'; g.beginPath(); g.moveTo(x0 - 30, yB); g.lineTo(x0 + 8, yT); g.lineTo(x1 - 8, yT); g.lineTo(x1 + 30, yB); g.closePath(); g.fill();
  g.fillStyle = 'rgba(70,112,98,.92)'; g.beginPath(); g.moveTo(x0, yB); g.lineTo(x0 + 22, yT); g.lineTo(x1 - 22, yT); g.lineTo(x1, yB); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(242,236,222,.6)'; g.lineWidth = 1.4; g.beginPath(); for (let k = 0; k < 5; k++) { const y = yT + 20 + k * 26 + (C4.t * 6) % 26, hw = 30 + k * 8; g.moveTo(C4_BRIDGE_X - hw * .5, y); g.quadraticCurveTo(C4_BRIDGE_X, y - 3, C4_BRIDGE_X + hw * .5, y); } g.stroke();
  // the deck: wooden planks across the street
  g.fillStyle = 'rgba(122,74,34,.42)'; g.fillRect(C4_BRIDGE_X - C4_BRIDGE_HW, C4_Y0 - 4, C4_BRIDGE_HW * 2, C4_D + 10);
  g.strokeStyle = 'rgba(42,34,29,.35)'; g.lineWidth = 1.2; g.beginPath(); for (let x = C4_BRIDGE_X - C4_BRIDGE_HW; x <= C4_BRIDGE_X + C4_BRIDGE_HW; x += 16) { g.moveTo(x, C4_Y0 - 4); g.lineTo(x, C4_Y0 + C4_D + 6); } g.stroke();
  g.restore();
}
// the bridge's house: rear railing and pillars behind the walkers, front pillars, railing and the roof in front of them
let C4_BRIDGE_ROOF = null;
const c4BridgeRoof = () => C4_BRIDGE_ROOF || (C4_BRIDGE_ROOF = part([-200, -130, 200, 14], a => {
  c4TileRoof(a, -C4_BRIDGE_HW - 6, C4_BRIDGE_HW + 6, -84, 8, 34, 'brown');
  a.fk('red', rect(-C4_BRIDGE_HW - 10, 4, (C4_BRIDGE_HW + 10) * 2, 8), 1.6);                      // the red beam under the eave
  // the ridge, its ends curling up, and the little dragons and pots of the real bridge as plain curls
  a.fk('ash', smooth([[-C4_BRIDGE_HW + 4, -84], [-C4_BRIDGE_HW - 18, -104], [-C4_BRIDGE_HW + 10, -96], [C4_BRIDGE_HW - 10, -96], [C4_BRIDGE_HW + 18, -104], [C4_BRIDGE_HW - 4, -84]]), 1.8);
  for (const x of [-90, -30, 30, 90]) { a.fk('ash', smooth([[x - 12, -96], [x - 8, -114], [x, -122], [x + 8, -114], [x + 12, -96]]), 1.4); a.key(smooth([[x - 4, -112], [x, -118], [x + 4, -112]], false), 1); }
  for (const s of [-1, 1]) a.fk('ash', smooth([[s * (C4_BRIDGE_HW + 14), -100], [s * (C4_BRIDGE_HW + 26), -124], [s * (C4_BRIDGE_HW + 6), -116]]), 1.4);
}));
function c4TownBridgeItems(items, g, vis) {
  if (!vis(C4_BRIDGE_X, C4_BRIDGE_HW + 60)) return;
  const pill = (z, h) => { const s = c4S(z), y = c4Y(z); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2;
    for (let x = C4_BRIDGE_X - C4_BRIDGE_HW; x <= C4_BRIDGE_X + C4_BRIDGE_HW + 1; x += C4_BRIDGE_HW / 2) { g.beginPath(); g.rect(x - 5 * s, y - h * s, 10 * s, h * s); g.fill(); g.stroke(); } };
  const rail = z => { const s = c4S(z), y = c4Y(z); g.strokeStyle = INK; g.fillStyle = '#e8d8a8'; g.lineWidth = 1.6;
    g.beginPath(); g.rect(C4_BRIDGE_X - C4_BRIDGE_HW, y - 40 * s, C4_BRIDGE_HW * 2, 6 * s); g.fill(); g.stroke();
    g.beginPath(); for (let x = C4_BRIDGE_X - C4_BRIDGE_HW + 6; x < C4_BRIDGE_X + C4_BRIDGE_HW; x += 9) { g.moveTo(x, y - 34 * s); g.lineTo(x, y); } g.stroke(); };
  // behind everyone: the far pillars and railing
  items.push({ z: -.5, f: () => { pill(0, 165); rail(0); } });
  // in front of everyone: the near railing, the pillars and the roof over the deck, with paper lanterns hanging from the eave
  items.push({ z: 1.08, f: () => {
    rail(1); pill(1, 165);
    const s = c4S(1), y = c4Y(1) - 165 * s;
    dp(g, c4BridgeRoof(), C4_BRIDGE_X, y, 0, s, s);
    for (const lx of [-90, -30, 30, 90]) { const x = C4_BRIDGE_X + lx * s, ly = y + 24 * s + Math.sin(C4.t * 1.3 + lx) * 1.5;
      g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 8 * s); g.lineTo(x, ly - 9 * s); g.stroke();
      g.fillStyle = '#f2ecde'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, ly, 9 * s, 11 * s, 0, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = '#a3332a'; g.beginPath(); g.arc(x, ly, 3.4 * s, 0, 6.283); g.fill(); }
  } });
}
// in front of the street: the stone quay, the bridge's piers and arches over the creek's mouth, the river with boats going by
const C4_BOAT_HULLS = ['#2f6a4c', '#a3332a', '#2f5f8f', '#7a4a22', '#2f6a4c', '#d97b2a'];
function c4TownRiver(g, cx, vw, V) {
  const yq = C4_Y0 + C4_D + 8, yw = yq + 16, x0 = cx - 50, x1 = cx + vw + 50, yb = V.vh - V.oy + 60;
  const bx0 = C4_BRIDGE_X - C4_BRIDGE_HW, bx1 = C4_BRIDGE_X + C4_BRIDGE_HW;
  g.save();
  // the water: green, the town's ochre and the lanterns reflected in streaks, ripples drifting
  g.fillStyle = 'rgba(70,112,98,.85)'; g.fillRect(x0, yq, x1 - x0, yb - yq);
  g.globalAlpha = .22; for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) { g.fillStyle = (x / 90) % 3 ? '#d9a94e' : '#a3332a'; g.fillRect(x + 10, yw + 4, 30 + ((x / 90) % 2) * 20, 40); }
  g.globalAlpha = 1;
  // the quay: stone blocks, broken where the creek comes out under the bridge
  g.fillStyle = '#b9b0a4'; g.strokeStyle = INK; g.lineWidth = 2;
  for (const [a, b] of [[x0, bx0], [bx1, x1]]) { if (b <= a) continue; g.fillRect(a, yq, b - a, 16); g.beginPath(); g.moveTo(a, yq); g.lineTo(b, yq); g.moveTo(a, yw); g.lineTo(b, yw); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let x = Math.ceil(a / 46) * 46; x < b; x += 46) { g.moveTo(x, yq); g.lineTo(x, yw); } g.stroke(); g.lineWidth = 2; }
  // the bridge's foot: a stone face with four arches standing in the water
  if (bx1 > x0 && bx0 < x1) {
    const top = yq - 2, bot = yq + 92;
    g.fillStyle = '#c9bfa6'; g.beginPath(); g.rect(bx0 - 12, top, bx1 - bx0 + 24, bot - top); g.fill(); g.stroke();
    g.fillStyle = 'rgba(42,60,52,.95)';
    const n = 4, sp = (bx1 - bx0) / n;
    for (let i = 0; i < n; i++) { const ax = bx0 + sp * i + sp / 2, aw = sp * .62; g.beginPath(); g.moveTo(ax - aw / 2, bot); g.lineTo(ax - aw / 2, top + 40); g.quadraticCurveTo(ax - aw / 2, top + 16, ax, top + 14); g.quadraticCurveTo(ax + aw / 2, top + 16, ax + aw / 2, top + 40); g.lineTo(ax + aw / 2, bot); g.closePath(); g.fill(); g.stroke(); }
    g.strokeStyle = 'rgba(42,34,29,.35)'; g.lineWidth = 1; g.beginPath(); for (let y = top + 10; y < bot; y += 12) { g.moveTo(bx0 - 12, y); g.lineTo(bx1 + 12, y); } g.stroke();
    g.fillStyle = 'rgba(70,112,98,.55)'; g.fillRect(bx0 - 12, bot - 18, bx1 - bx0 + 24, 18);         // the water at the piers' feet
  }
  g.strokeStyle = 'rgba(242,236,222,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (let r = 0; r < 7; r++) { const y = yw + 40 + r * 22, off = (C4.t * (6 + r * 3)) % 80; for (let x = Math.floor((x0 - off) / 80) * 80 + off; x < x1; x += 80) { g.moveTo(x + r * 23, y); g.quadraticCurveTo(x + r * 23 + 10, y - 4, x + r * 23 + 20, y); } }
  g.stroke();
  // boats coming and going, some with a lantern (owner: "trên sông thì có thuyền qua lại")
  const B = C4.townBoats || (C4.townBoats = [0, 1, 2, 3, 4, 5].map(i => ({ x: 200 + i * 900 + (i % 2) * 300, sp: (i % 2 ? -1 : 1) * (9 + i * 2.5), y: 56 + (i % 3) * 30, hull: C4_BOAT_HULLS[i], lamp: i % 2 === 0, folk: 1 + (i % 3) })));
  for (const b of [...B].sort((p, q) => p.y - q.y)) {
    if (!C4.paused) { b.x += b.sp / 60; if (b.x > C4_W + 300) b.x = -300; if (b.x < -300) b.x = C4_W + 300; }
    if (b.x < x0 - 120 || b.x > x1 + 120) continue;
    const y = yw + b.y + Math.sin(C4.t * 1.4 + b.x * .01) * 1.5, d = Math.sign(b.sp);
    g.fillStyle = b.hull; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x - 66, y - 12); g.quadraticCurveTo(b.x, y + 14, b.x + 66, y - 12); g.lineTo(b.x + 56, y - 2); g.quadraticCurveTo(b.x, y + 6, b.x - 56, y - 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#e8d8a8'; g.fillRect(b.x - 52, y - 9, 104, 3);
    for (let k = 0; k < b.folk; k++) { const fx = b.x + d * (10 - k * 22); g.fillStyle = ['#c0567a', '#f2c640', '#3f8a86'][k % 3]; g.beginPath(); g.ellipse(fx, y - 16, 7, 9, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#e8d8a8'; g.beginPath(); g.arc(fx, y - 29, 5, 0, 6.283); g.fill(); g.stroke(); }
    const px = b.x - d * 46; g.fillStyle = '#2f6a4c'; g.beginPath(); g.ellipse(px, y - 22, 7, 11, 0, 0, 6.283); g.fill(); g.stroke();   // the boatman (green shirt)
    g.fillStyle = '#e8d8a8'; g.beginPath(); g.moveTo(px - 12, y - 32); g.lineTo(px, y - 46); g.lineTo(px + 12, y - 32); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(px + d * 6, y - 38); g.lineTo(px - d * 18 + Math.sin(C4.t * 1.2 + b.x) * 6, y + 28); g.stroke();
    if (b.lamp) { const lx = b.x + d * 54, ly = y - 34; g.lineWidth = 1.4; g.beginPath(); g.moveTo(b.x + d * 48, y - 8); g.lineTo(lx, ly - 10); g.stroke();
      g.fillStyle = 'rgba(255,214,120,.35)'; g.beginPath(); g.arc(lx, ly, 16, 0, 6.283); g.fill();
      g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(lx, ly, 8, 10, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#a3332a'; g.beginPath(); g.arc(lx, ly, 3, 0, 6.283); g.fill(); }
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
