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
  // the houses that must stand at a place: ours (the betel shop, the rentable plots) and the neighbours'
  const anchors = [[C4_STALL + 10, 'g:trau'], ...C4_SHOPS.map(g => [C4_GOODS[g].x + 20, 'g:' + g]), ...C4_VENDORS.map(v => [v.x + 50, 'v:' + v.ware])].sort((p, q) => p[0] - q[0]);
  const names = ['VẢI LỤA', 'ĐỒ GỐM', 'QUÁN NƯỚC', 'TẠP HOÁ', 'ĐÈN LỒNG', 'THỢ BẠC', 'GẠO MUỐI', 'THUỐC BẮC', 'SÁCH VỞ', 'MAY ÁO'];
  const put = (cx, label) => { const v = (rs() * C4_TOWN_V.length) | 0; near.push([cx, 'shop', .72, v, label]); return C4_TOWN_V[v].w * .72; };
  let x = 600, i = 0;
  for (const [ax, label] of [...anchors, [C4_W + 400, null]]) {
    while (x + 140 < ax - 70) { const w = put(x + 70, names[(rs() * names.length) | 0]); x += 2 * w; if (++i % 3 === 0) { near.push([x + 10, rs() < .5 ? 'flower' : 'pot', .7]); x += 22; } }
    if (!label) break;
    const w = put(ax, label); x = ax + w;
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
// the covered bridge (after Chùa Cầu; owner's photo: a long bridge whose deck rises in a hump, a stone foot with arches, orange tiles
// with white ridges, blue ceramic dragons along the ridge, red-walled houses at both ends): the street runs over it
const C4_BRIDGE_X = 110, C4_BRIDGE_HW = 200, C4_BRIDGE_UP = 48;            // its middle, half span, and how high the deck rises
// how high the deck lifts a walker at x (a smooth hump, 0 off the bridge)
const c4TownLift = x => { if (!C4.town) return 0; const k = Math.abs(x - C4_BRIDGE_X) / C4_BRIDGE_HW; return k >= 1 ? 0 : C4_BRIDGE_UP * Math.pow(Math.cos(k * Math.PI / 2), 1.3); };
const c4OnBridge = x => Math.abs(x - C4_BRIDGE_X) < C4_BRIDGE_HW;
// the creek behind the street, coming down to the bridge; the bridge's deck, raised over the street
function c4TownCreek(g, cx, vw) {
  if (C4_BRIDGE_X + C4_BRIDGE_HW < cx - 80 || C4_BRIDGE_X - C4_BRIDGE_HW > cx + vw + 80) return;
  const x0 = C4_BRIDGE_X - 80, x1 = C4_BRIDGE_X + 80, yT = C4_Y0 - 46, yB = C4_Y0 - 4;
  g.save();
  g.fillStyle = '#b9b0a4'; g.beginPath(); g.moveTo(x0 - 30, yB); g.lineTo(x0 + 8, yT); g.lineTo(x1 - 8, yT); g.lineTo(x1 + 30, yB); g.closePath(); g.fill();
  g.fillStyle = 'rgba(70,112,98,.92)'; g.beginPath(); g.moveTo(x0, yB); g.lineTo(x0 + 22, yT); g.lineTo(x1 - 22, yT); g.lineTo(x1, yB); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  // the deck: wooden planks from the far edge to the near edge, lifted by the hump
  const a = C4_BRIDGE_X - C4_BRIDGE_HW, b = C4_BRIDGE_X + C4_BRIDGE_HW, top = [], bot = [];
  for (let x = a; x <= b + .1; x += 10) { top.push([x, C4_Y0 - 4 - c4TownLift(x)]); bot.push([x, C4_Y0 + C4_D + 6 - c4TownLift(x)]); }
  g.fillStyle = '#9a6a3c'; g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(42,34,29,.35)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < top.length; i += 2) { g.moveTo(top[i][0], top[i][1]); g.lineTo(bot[i][0], bot[i][1]); } g.stroke();
  g.restore();
}
// the line of the deck's edge at depth z, and a polyline along it
const c4DeckY = (x, z) => c4Y(z) - c4TownLift(x);
function c4TownBridgeItems(items, g, vis) {
  if (!vis(C4_BRIDGE_X, C4_BRIDGE_HW + 120)) return;
  const a = C4_BRIDGE_X - C4_BRIDGE_HW, b = C4_BRIDGE_X + C4_BRIDGE_HW;
  const pillars = (z, h) => { const s = c4S(z); g.fillStyle = '#7a3a24'; g.strokeStyle = INK; g.lineWidth = 2;
    for (const k of [-.92, -.31, .31, .92]) { const x = C4_BRIDGE_X + k * C4_BRIDGE_HW; const y = c4DeckY(x, z); g.beginPath(); g.rect(x - 5 * s, y - h * s, 10 * s, h * s); g.fill(); g.stroke(); } };
  const rail = z => { const s = c4S(z); g.strokeStyle = INK; g.lineWidth = 1.6; g.fillStyle = '#c9a36a';
    g.beginPath(); for (let x = a; x <= b + .1; x += 8) { const y = c4DeckY(x, z) - 40 * s; x === a ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = b; x >= a - .1; x -= 8) g.lineTo(x, c4DeckY(x, z) - 34 * s); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); for (let x = a + 5; x < b; x += 8) { const y = c4DeckY(x, z); g.moveTo(x, y - 34 * s); g.lineTo(x, y); } g.stroke(); };
  items.push({ z: -.6, f: () => rail(0) });                                 // the far railing, behind the walkers
  // in front of the walkers: the near railing, the pillars, and the long roof over the deck
  items.push({ z: 1.08, f: () => {
    rail(1); pillars(1, 165);
    const s = c4S(1);
    c4TownRoofBand(g, a - 30, b + 30, x => c4DeckY(Math.max(a, Math.min(b, x)), 1) - 165 * s, 70 * s, s);
    for (let i = 0; i < 6; i++) { const lx = a + 40 + i * (b - a - 80) / 5, ey = c4DeckY(lx, 1) - 165 * s; c4DrawLantern(g, lx, ey + 4 * s, s * 1.15, i % 2 ? '#f2c640' : '#c4473a', 10, Math.sin(C4.t * 1.5 + i * 1.7) * .14); }
  } });
}
// a long tiled roof drawn along a curve: eave at eaveY(x), height h; orange tiles with white mortar lines, a red beam under the eave,
// a white ridge with blue ceramic curls on it
function c4TownRoofBand(g, x0, x1, eaveY, h, s) {
  const pts = []; for (let x = x0; x <= x1 + .1; x += 8) pts.push([x, eaveY(x)]);
  const ridge = pts.map(([x, y]) => [x, y - h]);
  g.save(); g.strokeStyle = INK;
  g.fillStyle = '#c4473a'; g.lineWidth = 1.6; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + 6 * s) : g.moveTo(x, y + 6 * s)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#d9874a'; g.lineWidth = 2.2; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = ridge.length - 1; i >= 0; i--) g.lineTo(ridge[i][0] + (ridge[i][0] < (x0 + x1) / 2 ? 14 : -14) * s, ridge[i][1]); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(242,236,222,.85)'; g.lineWidth = 2 * s; g.beginPath();
  for (let i = 0; i < pts.length; i += 1) { const [x, y] = pts[i], rx = x + (x < (x0 + x1) / 2 ? 14 : -14) * s * .9; g.moveTo(x, y - 2); g.lineTo(rx, y - h + 2); } g.stroke();
  // the ridge: a white band, blue curls rising from it
  g.fillStyle = '#efe8da'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath();
  ridge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = ridge.length - 1; i >= 0; i--) g.lineTo(ridge[i][0], ridge[i][1] - 10 * s); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#2f5f8f'; g.lineWidth = 2.2 * s; g.lineCap = 'round';
  c4RidgeCeramics(g, ridge, s);
  g.restore();
}
// in front of the street: the stone quay, the bridge's stone foot with its arches, the river with boats going by
const C4_BOAT_HULLS = ['#2f6a4c', '#a3332a', '#2f5f8f', '#7a4a22', '#2f6a4c', '#d97b2a'];
const C4_BOAT_SORTS = [1, 3, 5, 7, 2, 4, 6, 8, 9, 10];
function c4TownRiver(g, cx, vw, V) {
  const yq = C4_Y0 + C4_D + 8, yw = yq + 16, x0 = cx - 50, x1 = cx + vw + 50, yb = V.vh - V.oy + 60;
  const bx0 = C4_BRIDGE_X - C4_BRIDGE_HW, bx1 = C4_BRIDGE_X + C4_BRIDGE_HW;
  g.save();
  g.fillStyle = 'rgba(70,112,98,.85)'; g.fillRect(x0, yq - 10, x1 - x0, yb - yq + 10);
  g.globalAlpha = .22; for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) { g.fillStyle = (x / 90) % 3 ? '#d9a94e' : '#a3332a'; g.fillRect(x + 10, yw + 4, 30 + ((x / 90) % 2) * 20, 40); }
  g.globalAlpha = 1;
  g.fillStyle = '#b9b0a4'; g.strokeStyle = INK; g.lineWidth = 2;
  for (const [a, b] of [[x0, bx0 - 20], [bx1 + 20, x1]]) { if (b <= a) continue; g.fillRect(a, yq, b - a, 16); g.beginPath(); g.moveTo(a, yq); g.lineTo(b, yq); g.moveTo(a, yw); g.lineTo(b, yw); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let x = Math.ceil(a / 46) * 46; x < b; x += 46) { g.moveTo(x, yq); g.lineTo(x, yw); } g.stroke(); g.lineWidth = 2; }
  // the foot (owner: four rows of two stone piers): a white plaster band and a stone beam following the deck's hump, four piers in the water, stone banks at both ends
  if (bx1 > x0 - 60 && bx0 < x1 + 60) {
    const bot = yq + 110, topAt = x => c4DeckY(Math.max(bx0, Math.min(bx1, x)), 1) + 6, beam = 26;
    g.fillStyle = '#9a958a'; g.strokeStyle = INK; g.lineWidth = 2;
    for (const [e0, e1] of [[bx0 - 60, bx0 + 4], [bx1 - 4, bx1 + 60]]) { g.beginPath(); g.moveTo(e0, bot); g.lineTo(e0, topAt(e0) + 10); g.lineTo(e1, topAt(e1) + 10); g.lineTo(e1, bot); g.closePath(); g.fill(); g.stroke(); }
    for (const k of [-.62, -.2, .2, .62]) { const px = C4_BRIDGE_X + k * C4_BRIDGE_HW, pw = .11 * C4_BRIDGE_HW, pt = topAt(px) + beam;
      g.fillStyle = '#8f8a7c'; g.beginPath(); g.rect(px - pw / 2, pt, pw, bot - pt); g.fill(); g.stroke();
      g.fillStyle = '#a9a294'; g.beginPath(); g.rect(px - pw / 2 - 5, pt, pw + 10, 9); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(42,34,29,.3)'; g.lineWidth = 1; g.beginPath(); for (let y = pt + 20; y < bot; y += 14) { g.moveTo(px - pw / 2, y); g.lineTo(px + pw / 2, y); } g.stroke(); g.strokeStyle = INK; g.lineWidth = 2; }
    g.fillStyle = '#8f8a7c'; g.beginPath(); for (let x = bx0; x <= bx1 + .1; x += 8) { const y = topAt(x); x === bx0 ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = bx1; x >= bx0 - .1; x -= 8) g.lineTo(x, topAt(x) + beam); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#efe8da'; g.beginPath(); for (let x = bx0 - 4; x <= bx1 + 4.1; x += 8) { const y = topAt(x); x === bx0 - 4 ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = bx1 + 4; x >= bx0 - 4.1; x -= 8) g.lineTo(x, topAt(x) + 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(70,112,98,.6)'; g.fillRect(bx0 - 20, bot - 20, bx1 - bx0 + 40, 20);
  }
  g.strokeStyle = 'rgba(242,236,222,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (let r = 0; r < 7; r++) { const y = yw + 40 + r * 22, off = (C4.t * (6 + r * 3)) % 80; for (let x = Math.floor((x0 - off) / 80) * 80 + off; x < x1; x += 80) { g.moveTo(x + r * 23, y); g.quadraticCurveTo(x + r * 23 + 10, y - 4, x + r * 23 + 20, y); } }
  g.stroke();
  // boats coming and going, the folk in them mice of the town (owner), some with a lantern
  const B = C4.townBoats || (C4.townBoats = [0, 1, 2, 3, 4, 5].map(i => ({ x: 200 + i * 900 + (i % 2) * 300, sp: (i % 2 ? -1 : 1) * (9 + i * 2.5), y: 34 + (i % 3) * 28, hull: C4_BOAT_HULLS[i], lamp: i % 2 === 0,
    folk: Array.from({ length: 1 + (i % 3) }, (_, k) => c4MouseRig(C4_BOAT_SORTS[(i * 3 + k) % C4_BOAT_SORTS.length])), man: c4MouseRig(C4_BOAT_SORTS[(i + 4) % C4_BOAT_SORTS.length]) })));
  for (const b of [...B].sort((p, q) => p.y - q.y)) {
    if (!C4.paused) { b.x += b.sp / 60; if (b.x > C4_W + 300) b.x = -300; if (b.x < -300) b.x = C4_W + 300; }
    if (b.x < x0 - 140 || b.x > x1 + 140) continue;
    const y = yw + b.y + Math.sin(C4.t * 1.4 + b.x * .01) * 1.5, d = Math.sign(b.sp), ms = .55;
    // the folk first (from the waist up), then the hull over their legs
    g.save(); g.beginPath(); g.rect(b.x - 120, y - 200, 240, 194); g.clip();                     // nothing below the gunwale shows (owner: legs stuck out under the boat)
    b.folk.forEach((M, k) => c4Mouse(g, M, b.x + d * (14 - k * 26), d, C4.t * 2 + k, false, null, null, ms, y + 34, b.x + k));   // the passengers sit low in the boat
    c4Mouse(g, b.man, b.x - d * 46, d, C4.t * 2, false, -.6 - Math.sin(C4.t * 1.2 + b.x) * .3, null, ms, y + 14, b.x + 9);
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(b.x - d * 40, y - 44); g.lineTo(b.x - d * 64 + Math.sin(C4.t * 1.2 + b.x) * 6, y + 30); g.stroke();   // the pole
    g.fillStyle = b.hull; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x - 70, y - 12); g.quadraticCurveTo(b.x, y + 14, b.x + 70, y - 12); g.lineTo(b.x + 60, y - 2); g.quadraticCurveTo(b.x, y + 6, b.x - 60, y - 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#e8d8a8'; g.fillRect(b.x - 56, y - 9, 112, 3);
    if (b.lamp) { const lx = b.x + d * 58, ly = y - 34; g.lineWidth = 1.4; g.beginPath(); g.moveTo(b.x + d * 52, y - 8); g.lineTo(lx, ly - 10); g.stroke();
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
  a.text('HẢI PHỐ', 0, -242, 26, 'yellow', '"Playfair Display", serif', 'color', '900');
}));

// the lanterns under a house's eave, drawn live so they sway a little, hung only either side of the sign board (owner: they hid it)
// what a house's board says: our ware (or CHO THUÊ while the plot is not ours), a neighbour's ware, or a name of its own
function c4TownSign(label) {
  if (!label) return '';
  if (label.startsWith('g:')) { const g = label.slice(2); return c4Own(g) ? C4_GOODS[g].name.toUpperCase() : 'CHO THUÊ'; }
  if (label.startsWith('v:')) { const G = C4_GOODS[C4_VENDOR_G[label.slice(2)]]; return G ? G.name.toUpperCase() : ''; }
  return label;
}
// a silk lantern hanging from (ax, ay) on a string, swung by ang: a cap, a round ribbed body, a cap, a tassel
function c4DrawLantern(g, ax, ay, s, col, len, ang) {
  g.save(); g.translate(ax, ay); g.rotate(ang); g.scale(s, s); g.strokeStyle = INK; g.lineJoin = 'round';
  g.lineWidth = 1.1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, len); g.stroke();
  const cy = len + 12;
  g.fillStyle = 'rgba(255,214,120,.22)'; g.beginPath(); g.arc(0, cy, 15, 0, 6.283); g.fill();
  g.fillStyle = '#2a221d'; g.fillRect(-4, len, 8, 3); g.fillRect(-4, cy + 9, 8, 3);
  g.fillStyle = col; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, cy, 9, 9.5, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(42,34,29,.55)'; g.lineWidth = .9; g.beginPath(); g.ellipse(0, cy, 4.5, 9.3, 0, 0, 6.283); g.moveTo(0, cy - 9.5); g.lineTo(0, cy + 9.5); g.stroke();
  g.strokeStyle = '#a3332a'; g.lineWidth = 1.6; g.beginPath(); for (const dx of [-2, 0, 2]) { g.moveTo(dx, cy + 12); g.lineTo(dx * 1.5, cy + 22); } g.stroke();
  g.restore();
}
function c4TownFront(g, hx, hy, s, v, label) {
  const txt = c4TownSign(label);
  if (txt) { g.save(); g.translate(hx, hy); g.scale(s, s); g.fillStyle = '#f2c640'; g.font = '900 12px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 12; while (fs > 8 && g.measureText(txt).width > 82) { fs--; g.font = '900 ' + fs + 'px "Playfair Display", serif'; } g.fillText(txt, 0, -134); g.restore(); }
  c4TownLanterns(g, hx, hy, s, v);
}
function c4TownLanterns(g, hx, hy, s, v) {
  const o = C4_TOWN_V[((v | 0) % C4_TOWN_V.length + C4_TOWN_V.length) % C4_TOWN_V.length], w = o.w;
  for (let x = -w + 12, i = 0; x <= w - 12; x += 22, i++) {
    if (Math.abs(x) < 58) continue;                                         // the sign board's place
    c4DrawLantern(g, hx + x * s, hy - 146 * s, s, PL[C4_LANTERN_COLS[(v * 2 + i * 3) % C4_LANTERN_COLS.length]][0], 6 + (i % 2) * 6, Math.sin(C4.t * 1.7 + hx * .013 + i * 1.3) * .16);
  }
}
// the gate's lanterns, hung outside its board (owner: they hid HẢI PHỐ), swaying
function c4TownGateLanterns(g, gx, gy, s) {
  for (const [x, i] of [[-142, 0], [-104, 1], [104, 2], [142, 3]]) c4DrawLantern(g, gx + x * s, gy - 286 * s, s * 1.1, i % 2 ? '#f2c640' : '#c4473a', 6 + (i % 2) * 8, Math.sin(C4.t * 1.4 + i * 1.9) * .15);
}
// the counter in a shop's doorway: the ware set out on it, the seller standing behind it (owner: in the town selling is indoors)
function c4TownCounter(g, x, ware) {
  const z = .09, s = c4S(z), y = c4Y(z), open = c4Stock(ware) > 0;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  g.fillStyle = '#7a4a22'; g.fillRect(-62, -34, 124, 34); g.strokeRect(-62, -34, 124, 34);
  g.fillStyle = '#b57a22'; g.fillRect(-68, -42, 136, 9); g.strokeRect(-68, -42, 136, 9);
  g.strokeStyle = 'rgba(42,34,29,.45)'; g.lineWidth = 1; g.beginPath(); for (const dx of [-30, 0, 30]) { g.moveTo(dx, -32); g.lineTo(dx, -2); } g.stroke();
  if (open) { g.strokeStyle = INK; g.lineWidth = 1.6; const col = ware === 'trau' ? '#2f6a4c' : '#e8d8a8';
    for (const dx of [-38, 0, 38]) { g.fillStyle = '#5b2f1f'; g.beginPath(); g.ellipse(dx, -42, 16, 5, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = col; g.beginPath(); g.ellipse(dx, -47, 12, 7, 0, Math.PI, 0); g.fill(); g.stroke(); } }
  else if (C4.phase === 'open') { g.fillStyle = '#a3332a'; g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.fillText('Hết hàng', 0, -52); }
  g.restore();
}

// blue-and-white ceramic on the bridge's ridge (after Chùa Cầu): a pearl in flames in the middle, a dragon either side coming to it,
// cloud curls along the rest, and a dragon head curling up at each end
function c4RidgeCeramics(g, ridge, s) {
  const BL = '#2f5f8f', WH = '#efe8da', n = ridge.length, at = f => { const i = Math.max(0, Math.min(n - 1, Math.round(f * (n - 1)))); return [ridge[i][0], ridge[i][1] - 10 * s]; };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  // cloud curls
  g.strokeStyle = BL; g.lineWidth = 2 * s;
  for (const f of [.1, .2, .8, .9]) { const [x, y] = at(f); g.beginPath(); g.arc(x - 5 * s, y - 6 * s, 5 * s, Math.PI * .1, Math.PI * 1.6); g.arc(x + 5 * s, y - 7 * s, 6 * s, Math.PI * 1.1, Math.PI * 2.2); g.stroke(); }
  // the pearl: a white ball ringed in blue with flames
  { const [x, y] = at(.5), r = 7 * s, cy = y - 16 * s;
    g.fillStyle = BL; g.beginPath(); for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .42; g.moveTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); g.quadraticCurveTo(x + Math.cos(a) * r * 2.1, cy + Math.sin(a) * r * 2.1, x + Math.cos(a + .2) * r * 2.4, cy + Math.sin(a + .2) * r * 2.4); } g.lineWidth = 2.2 * s; g.strokeStyle = BL; g.stroke();
    g.fillStyle = WH; g.strokeStyle = BL; g.lineWidth = 2 * s; g.beginPath(); g.arc(x, cy, r, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = BL; g.beginPath(); g.arc(x, cy, r * .45, 0, 6.283); g.fill();
    g.strokeStyle = BL; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, cy + r); g.stroke(); }
  // two dragons: a wavy body along the ridge, the head raised towards the pearl, spines on the back
  for (const d of [-1, 1]) {
    const [hx, hy] = at(.5 + d * .11), [tx, ty] = at(.5 + d * .33), body = [];
    for (let k = 0; k <= 16; k++) { const f = k / 16, x = tx + (hx - tx) * f, yb = ty + (hy - ty) * f; body.push([x, yb - 9 * s - Math.sin(f * Math.PI * 3) * 6 * s - f * 6 * s]); }
    g.strokeStyle = WH; g.lineWidth = 8 * s; g.beginPath(); body.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.strokeStyle = BL; g.lineWidth = 5 * s; g.stroke();
    g.lineWidth = 1.6 * s; g.beginPath(); for (let k = 2; k < 15; k += 2) { const [x, y] = body[k]; g.moveTo(x, y - 3 * s); g.lineTo(x + d * 2 * s, y - 9 * s); } g.stroke();
    // the head: a raised muzzle, an open jaw, a horn swept back
    const [x, y] = body[16], f = -d;
    g.fillStyle = BL; g.strokeStyle = BL; g.beginPath(); g.moveTo(x, y + 3 * s); g.quadraticCurveTo(x + d * 4 * s, y - 12 * s, x + d * 12 * s, y - 10 * s); g.lineTo(x + d * 15 * s, y - 4 * s); g.lineTo(x + d * 8 * s, y - 2 * s); g.lineTo(x + d * 13 * s, y + 3 * s); g.closePath(); g.fill();
    g.lineWidth = 1.8 * s; g.beginPath(); g.moveTo(x + d * 3 * s, y - 10 * s); g.quadraticCurveTo(x + f * 6 * s, y - 20 * s, x + f * 12 * s, y - 16 * s); g.stroke();
    g.fillStyle = WH; g.beginPath(); g.arc(x + d * 7 * s, y - 7 * s, 1.6 * s, 0, 6.283); g.fill();
    // the tail: a curl of flame
    const [qx, qy] = body[0]; g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(qx, qy); g.quadraticCurveTo(qx + f * 8 * s, qy - 2 * s, qx + f * 6 * s, qy - 12 * s); g.quadraticCurveTo(qx + f * 2 * s, qy - 16 * s, qx + f * 1 * s, qy - 9 * s); g.stroke();
  }
  // the ends: dragon heads curling up and out
  for (const [e, d] of [[ridge[0], -1], [ridge[n - 1], 1]]) {
    const x = e[0], y = e[1] - 8 * s;
    g.strokeStyle = WH; g.lineWidth = 7 * s; g.beginPath(); g.moveTo(x - d * 6 * s, y + 2 * s); g.quadraticCurveTo(x + d * 10 * s, y - 2 * s, x + d * 8 * s, y - 20 * s); g.stroke();
    g.strokeStyle = BL; g.lineWidth = 4 * s; g.stroke();
    g.lineWidth = 2 * s; g.beginPath(); g.arc(x + d * 3 * s, y - 22 * s, 5 * s, d > 0 ? 0 : Math.PI, d > 0 ? Math.PI * 1.5 : Math.PI * -.5, d < 0); g.stroke();
  }
  g.restore();
}
