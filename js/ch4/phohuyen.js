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
    for (const ex of [-w + 40, w - 40]) { a.fk('dark', circ(ex, eave + 40, 8), 1.6); a.fk('yellow', circ(ex, eave + 40, 5), 1.2); a.fk('dark', circ(ex + 1, eave + 40, 2.2), 1); }   // mắt cửa: the door's eyes keep watch (Hội An)
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
  const near = [], far = []; C4.townRivalX = 0;
  // the houses that must stand at a place: ours (the betel shop, the rentable plots) and the neighbours'
  const anchors = [[C4_STALL + 10, 'g:trau'], ...C4_SHOPS.map(g => [C4_GOODS[g].x + 20, 'g:' + g]), ...C4_VENDORS.map(v => [v.x + 50, 'v:' + v.ware])].sort((p, q) => p[0] - q[0]);
  const names = ['VẢI LỤA', 'CAO LẦU', 'ĐỒ GỐM', 'MÌ QUẢNG', 'QUÁN NƯỚC', 'CƠM GÀ', 'TẠP HOÁ', 'HOÀNH THÁNH', 'ĐÈN LỒNG', 'BÁNH VẠC', 'THỢ BẠC', 'CHÈ', 'GẠO MUỐI', 'THUỐC BẮC', 'SÁCH VỞ', 'MAY ÁO'];
  let hq = false;                                                           // one assembly hall gate in the street (hội quán)
  const put = (cx, label) => { const v = (rs() * C4_TOWN_V.length) | 0; near.push([cx, 'shop', .72, v, label]); return C4_TOWN_V[v].w * .72; };
  let x = 600, i = 0;
  for (const [ax, label] of [...anchors, [C4_W + 400, null]]) {
    if (!hq && ax - 70 - x > 330) { near.push([x + 160, 'hoiquan', .72]); x += 320; hq = true; }
    while (x + 140 < ax - 70) { const nm = i === 0 ? 'ĐÈN LỒNG' : i === 1 ? 'CAO LẦU' : i === 2 ? 'BÁNH VẠC' : names[(rs() * names.length) | 0], rv = !C4.townRivalX && x + 70 > C4_STALL + 380; if (rv) C4.townRivalX = x + 70; const w = put(x + 70, rv ? 'r:' + nm : nm); x += 2 * w; if (++i % 3 === 0) { near.push([x + 10, rs() < .5 ? 'flower' : 'pot', .7]); x += 22; } }
    if (!label) break;
    const w = put(ax, label); x = ax + w;
  }
  for (let fx = -100; fx < 3200; fx += 300 + rs() * 120) far.push([fx, 'roofs', .85]);
  far.push([700, 'gate', 1], [1500, 'tower', 1.05], [2300, 'temple', 1.1], [1100, 'bigtree', .75], [2900, 'tower', .95]);
  return { far, near };
}
const c4TownPart = k => k === 'bigtree' ? WP.bigTree : c4TownFarArt()[k];
const c4TownNear = k => k === 'flower' ? c4FlowerArt() : k === 'pot' ? c4PotArt() : k === 'hoiquan' ? c4HoiQuanArt() : null;
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
  const J = C4.townJunkAt; if (J) items.push({ z: 2, f: () => c4Junk(g, J[0], J[1], 1) });
  (C4.townBoatFns || []).forEach((f, i) => items.push({ z: 2.1 + i * .001, f }));   // the junk is on the river, nearer than the street: its sails go in front of the walkers (owner)
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
  // boats coming and going (owner: one or two mice a boat, a proper deep hull): a sampan with an eye on its bow, a painted band, a
  // woven bamboo canopy on some; the boatman stands at the stern with his pole, now and then a passenger sits in the middle
  const B = C4.townBoats || (C4.townBoats = [0, 1, 2, 3, 4, 5].map(i => ({ x: 200 + i * 900 + (i % 2) * 300, sp: (i % 2 ? -1 : 1) * (9 + i * 2.5), y: 40 + (i % 3) * 30, hull: C4_BOAT_HULLS[i],
    lamp: i % 3 !== 1, mui: i % 3 === 1, pass: i % 3 === 1 ? null : i % 2 ? null : c4MouseRig(C4_BOAT_SORTS[(i * 3) % C4_BOAT_SORTS.length]), man: c4MouseRig(C4_BOAT_SORTS[(i + 4) % C4_BOAT_SORTS.length]) })));
  { const J = C4.townJunk || (C4.townJunk = { x: 1600, sp: 6 }); if (!C4.paused) { J.x += J.sp / 60; if (J.x > C4_W + 400) J.x = -400; } C4.townJunkAt = J.x > x0 - 200 && J.x < x1 + 200 ? [J.x, yw + 26 + Math.sin(C4.t) * 1.2] : null; }   // drawn later, in front of the street (c4TownBridgeItems)
  C4.townBoatFns = [];
  for (const b of [...B].sort((p, q) => p.y - q.y)) {
    if (!C4.paused) { b.x += b.sp / 60; if (b.x > C4_W + 300) b.x = -300; if (b.x < -300) b.x = C4_W + 300; }
    if (b.x < x0 - 140 || b.x > x1 + 140) continue;
    C4.townBoatFns.push(() => {                                             // drawn in front of the street and the junk (c4TownBridgeItems)
    const y = yw + b.y + Math.sin(C4.t * 1.4 + b.x * .01) * 1.5, d = Math.sign(b.sp), ms = .52, L2 = 78, deck = y - 16;
    const gun = x => deck - Math.pow(Math.abs(x - b.x) / L2, 3) * 16;    // the gunwale rises to bow and stern
    // the people, cut off at the gunwale
    g.save(); g.beginPath(); g.moveTo(b.x - L2, gun(b.x - L2) - 300); g.lineTo(b.x + L2, gun(b.x + L2) - 300); for (let x = b.x + L2; x >= b.x - L2; x -= 6) g.lineTo(x, gun(x) + 2); g.closePath(); g.clip();
    if (b.pass) c4Mouse(g, b.pass, b.x + d * 8, d, C4.t * 2, false, null, null, ms, deck + 30, b.x + 3);
    c4Mouse(g, b.man, b.x - d * 52, d, C4.t * 2, false, -.6 - Math.sin(C4.t * 1.2 + b.x) * .3, null, ms, deck + 12, b.x + 9);
    g.restore();
    // the canopy: an arch of woven bamboo over the middle
    if (b.mui) { g.fillStyle = '#b57a22'; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x - 34, deck + 2); g.bezierCurveTo(b.x - 34, deck - 40, b.x + 34, deck - 40, b.x + 34, deck + 2); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(42,34,29,.45)'; g.lineWidth = 1; g.beginPath(); for (const k of [-18, -6, 6, 18]) { g.moveTo(b.x + k, deck - 28 + Math.abs(k) * .5); g.lineTo(b.x + k * 1.2, deck); } g.stroke(); g.strokeStyle = INK; }
    // the hull: deep, the gunwale curving up at both ends, a coloured band, the bottom rounded
    g.fillStyle = '#5b3a22'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(b.x - L2, gun(b.x - L2));
    for (let x = b.x - L2; x <= b.x + L2; x += 6) g.lineTo(x, gun(x));
    g.quadraticCurveTo(b.x + L2 - 8, y + 10, b.x + L2 - 30, y + 14); g.lineTo(b.x - L2 + 30, y + 14); g.quadraticCurveTo(b.x - L2 + 8, y + 10, b.x - L2, gun(b.x - L2)); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = b.hull; g.beginPath(); for (let x = b.x - L2 + 4; x <= b.x + L2 - 4; x += 6) { const yy = gun(x) + 3; x === b.x - L2 + 4 ? g.moveTo(x, yy) : g.lineTo(x, yy); } for (let x = b.x + L2 - 8; x >= b.x - L2 + 8; x -= 6) g.lineTo(x, gun(x) + 12); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(b.x - L2 + 26, y + 4); g.lineTo(b.x + L2 - 26, y + 4); g.stroke(); g.strokeStyle = INK;
    c4Oar(g, b, d, gun, y);                                               // the oar, on the near side, rowed by the boatman
    // the eye on the bow, to see the way (mắt thuyền)
    { const ex = b.x + d * (L2 - 22), ey = gun(ex) + 20; g.fillStyle = '#f2ecde'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(ex, ey, 7, 4, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(ex + d * 1.5, ey, 2.4, 0, 6.283); g.fill(); }
    if (b.lamp) { const lx = b.x + d * (L2 - 8), ly = gun(b.x + d * L2) - 6; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(lx, gun(lx)); g.lineTo(lx, ly - 4); g.stroke();
      c4DrawLantern(g, lx, ly - 4, .9, b.hull === '#a3332a' ? '#f2c640' : '#c4473a', 4, Math.sin(C4.t * 1.6 + b.x) * .12); }
    });
  }
  g.restore();
}
// the street's gate: brick piers, a double tiled roof, the board PHỐ HUYỆN (in place of the village market's bamboo gate)
let C4_TOWN_GATE = null;
const c4TownGate = () => C4_TOWN_GATE || (C4_TOWN_GATE = part([-160, -360, 160, 6], a => {
  for (const x of [-112, 112]) { a.fk('catY2', rect(x - 16, -280, 32, 280), 2.2); a.fill('tan', rect(x - 14, -30, 28, 26)); a.fk('ash', rect(x - 20, -292, 40, 14), 1.8); }
  c4TileRoof(a, -128, 128, -322, -280, 24, 'dark');
  c4TileRoof(a, -70, 70, -350, -322, 14, 'dark');
  a.fk('red', rect(-86, -270, 172, 50), 2.2);                              // tall enough for the accents (owner: the acute stuck out)
  a.text('HẢI PHỐ', 0, -242, 23, 'yellow', '"Playfair Display", serif', 'color', '900');
}));

// the lanterns under a house's eave, drawn live so they sway a little, hung only either side of the sign board (owner: they hid it)
// what a house's board says: our ware (or CHO THUÊ while the plot is not ours), a neighbour's ware, or a name of its own
function c4TownSign(label) {
  if (!label) return '';
  if (label.startsWith('g:')) { const g = label.slice(2); return c4Own(g) ? C4_GOODS[g].name.toUpperCase() : 'CHO THUÊ'; }
  if (label.startsWith('r:')) return c4RivalOn() && !SAVE4.rivalFar ? 'TRẦU RẺ' : label.slice(2);
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
  if (txt && txt !== 'CHO THUÊ') c4TownInterior(g, hx, hy, s, v, txt);   // the shop is open: its goods show inside (owner)
  c4TownLanterns(g, hx, hy, s, v);
  if (txt === 'ĐÈN LỒNG') c4LanternShop(g, hx, hy, s, v);
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
function c4TownCounter(g, x, ware, full = false) {
  const z = .09, s = c4S(z), y = c4Y(z), open = full || c4Stock(ware) > 0;
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

// a boatman's oar (owner: the pole looked ugly): a wooden shaft through a rest on the gunwale near the stern, a broad blade in the
// water; it swings back and forth with the stroke, the blade dipping and throwing a little splash
function c4Oar(g, b, d, gun, y) {
  const px = b.x - d * 60, py = gun(px) + 2, k = Math.sin(C4.t * 1.6 + b.x * .01), a = .42 + k * .28, ang = -d * a;   // the top leans towards the bow (in the boatman's hands), the blade trails to the stern
  const up = 46, down = 58, ux = px + d * Math.sin(a) * up, uy = py - Math.cos(a) * up, lx = px - d * Math.sin(a) * down, ly = py + Math.cos(a) * down;
  g.save(); g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 6.4; g.beginPath(); g.moveTo(ux, uy); g.lineTo(lx, ly); g.stroke();
  g.strokeStyle = '#a0703a'; g.lineWidth = 3.6; g.stroke();
  g.fillStyle = '#c9a36a'; g.strokeStyle = INK; g.lineWidth = 1.8;                       // the blade
  g.beginPath(); g.ellipse(lx - d * Math.sin(a) * 8, ly + Math.cos(a) * 8, 6, 15, -ang, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#5b2f1f'; g.beginPath(); g.ellipse(px, py, 5, 3.5, 0, 0, 6.283); g.fill(); g.stroke();   // the oar rest
  g.fillStyle = '#2a221d'; g.beginPath(); g.arc(ux, uy, 3.2, 0, 6.283); g.fill();          // the grip
  if (k < -.6) { g.strokeStyle = 'rgba(242,236,222,.85)'; g.lineWidth = 1.6; const sx = lx, sy = Math.min(ly, y + 26);
    g.beginPath(); g.arc(sx - 6, sy, 5, Math.PI * 1.1, Math.PI * 1.7); g.moveTo(sx + 10, sy); g.arc(sx + 6, sy, 5, Math.PI * 1.3, Math.PI * 1.9); g.stroke(); }
  g.restore();
}

// the assembly hall of the Fujian merchants (after Hội quán Phúc Kiến): a three-door gate under a three-tier roof of green-glazed
// tiles, red pillars, a carved board, dragons on the ridge; through the middle door the courtyard and a giant incense coil
let C4_HQ_ART = null;
const c4HoiQuanArt = () => C4_HQ_ART || (C4_HQ_ART = part([-240, -400, 240, 6], a => {
  a.fk('catY2', rect(-220, -170, 440, 170), 2.4);                           // the wall
  a.fk('dark', smooth([[-50, 0], [-50, -120], [-40, -140], [0, -150], [40, -140], [50, -120], [50, 0]]), 2.2);   // the middle door, open
  a.key(lines([[0, -150, 0, -100]]), 1);                                    // the incense coil hanging inside
  for (let r = 0; r < 4; r++) a.band('yellow', ell(0, -84 + r * 8, 24 - r * 5, 7 - r), 2.4);   // the coil, smouldering
  a.fk('red', circ(0, -58, 3), 1);
  for (const x of [-140, 140]) { a.fk('dark', rect(x - 28, -110, 56, 110), 2); a.fk('red', rect(x - 24, -106, 48, 102), 1.6); a.fk('yellow', circ(x - 10, -58, 3), .8); a.fk('yellow', circ(x + 10, -58, 3), .8); }
  for (const x of [-196, -86, 86, 196]) a.fk('red', rect(x - 10, -170, 20, 170), 2);
  a.fk('red', rect(-90, -166, 180, 28), 2.2); a.text('HỘI QUÁN', 0, -152, 17, 'yellow', '"Playfair Display", serif', 'color', '900');
  c4TileRoof(a, -224, 224, -228, -170, 22, 'green');                         // three tiers of green tiles, the middle one highest
  c4TileRoof(a, -150, 150, -290, -238, 18, 'green');
  c4TileRoof(a, -80, 80, -346, -298, 14, 'green');
  for (const [w, y] of [[224, -228], [150, -290], [80, -346]]) { a.fk('yellow', smooth([[-w + 6, y + 2], [-w - 16, y - 18], [-w + 12, y - 8], [w - 12, y - 8], [w + 16, y - 18], [w - 6, y + 2]]), 1.6); }
  for (const d of [-1, 1]) a.fk('blue', smooth([[d * 20, -354], [d * 34, -372], [d * 56, -366], [d * 70, -378], [d * 62, -358], [d * 40, -356]]), 1.4);   // dragons on the top ridge
  a.fk('red', circ(0, -366, 7), 1.4);                                       // the pearl between them
}));
// the lantern makers' house: lanterns hang thick on bamboo poles either side of its board
function c4LanternShop(g, hx, hy, s, v) {
  const o = C4_TOWN_V[((v | 0) % C4_TOWN_V.length + C4_TOWN_V.length) % C4_TOWN_V.length], w = o.w;
  const cols = ['#c4473a', '#f2c640', '#2f5f8f', '#2f6a4c', '#d97b2a', '#c0567a'];
  for (const side of [-1, 1]) for (let row = 0; row < 2; row++) for (let k = 0; k < 3; k++) {
    const x = side * (w - 18 - k * 14), y = -112 + row * 34;
    c4DrawLantern(g, hx + x * s, hy + y * s, s * .9, cols[(k + row * 2 + (side > 0 ? 3 : 0)) % cols.length], 4, Math.sin(C4.t * 1.6 + k + row * 2 + side) * .16);
  }
}
// a merchant junk (the port traded with Chinese and Japanese ships): a big hull with a raised stern, an eye on the bow, two masts with
// ribbed sails; it moves slowly along the river farther out
function c4Junk(g, x, y, d) {
  g.save(); g.translate(x, y); g.scale(d * .72, .72); g.strokeStyle = INK; g.lineJoin = 'round';
  for (const [mx, h, w] of [[-30, 150, 70], [50, 120, 56]]) {               // the masts and sails
    g.lineWidth = 3; g.beginPath(); g.moveTo(mx, -18); g.lineTo(mx, -18 - h); g.stroke();
    g.fillStyle = '#c9783e'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx + 4, -18 - h); g.quadraticCurveTo(mx + w * .9, -18 - h * .85, mx + w, -28); g.lineTo(mx + 4, -28); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); for (let k = 1; k < 6; k++) { const yy = -28 - (h - 10) * k / 6; g.moveTo(mx + 4, yy); g.lineTo(mx + 4 + w * (1 - .1 * k) , yy + 4); } g.stroke();
  }
  g.fillStyle = '#4a2c1a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-120, -40); g.lineTo(-96, -26); g.lineTo(100, -26); g.lineTo(122, -34); g.quadraticCurveTo(116, 10, 80, 16); g.lineTo(-80, 16); g.quadraticCurveTo(-112, 6, -120, -40); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#a3332a'; g.fillRect(-100, -22, 200, 7); g.strokeRect(-100, -22, 200, 7);
  g.fillStyle = '#4a2c1a'; g.beginPath(); g.rect(-122, -62, 38, 34); g.fill(); g.stroke();   // the raised stern house
  g.fillStyle = '#f2c640'; g.fillRect(-114, -54, 10, 10); g.strokeRect(-114, -54, 10, 10);
  g.fillStyle = '#f2ecde'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(96, -10, 8, 5, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(98, -10, 2.6, 0, 6.283); g.fill();
  g.restore();
}

// the folk of the town (owner: "dân bây giờ không vác cuốc nữa… ăn mặc sang lên"): no ploughs, hoes or buffaloes; a folding fan, a bird
// cage, a bundle of books, a parcel of silk, a silk parasol; long silk tunics in rich colours with a gold edge, black turbans for the men
const C4_TOWN_TOOLS = ['quat', 'long', 'sach', 'goi', 'o', null, 'quat', 'goi'];
const C4_SILKS = ['#2f3f6f', '#7a2a22', '#2f5f4f', '#5a2f5f', '#a3332a', '#1f3a5a', '#6a4a1a', '#2a2a2a'];
function c4TownLook(look, seed) {
  const L = { ...(look || {}) }, r = Math.abs(Math.sin(seed * 91.7)) * 1000;
  if (['buf', 'cay', 'cuoc', 'dieu'].includes(L.tool) || !L.tool || r % 3 < 1) L.tool = C4_TOWN_TOOLS[(r | 0) % C4_TOWN_TOOLS.length];
  L.silk = C4_SILKS[((r * 7) | 0) % C4_SILKS.length]; L.pat = ((r * 13) | 0) % 3;
  if (L.tool === 'o') L.umbCol = ['#c4473a', '#f2c640', '#2f5f8f', '#c0567a'][((r * 3) | 0) % 4];
  return L;
}
// a long silk tunic (áo dài / áo the) over the body: rich colour, a gold edge at the neck and hem, a little woven pattern
function c4TownDress(g, w, moving) {
  const L = w.look || {}; if (!L.silk) return;
  const b = moving ? -Math.abs(Math.sin(w.ph)) * 3 : 0, sw = moving ? Math.sin(w.ph) * 4 : 0, woman = !!L.skirt;
  g.save(); g.lineJoin = 'round';
  g.fillStyle = L.silk; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-16, -104 + b); g.lineTo(16, -104 + b); g.lineTo(24, -62 + b); g.lineTo(26 + sw, -22 + b); g.lineTo(-26 + sw, -22 + b); g.lineTo(-24, -62 + b); g.closePath(); g.fill(); g.stroke();
  if (woman) { g.beginPath(); g.moveTo(-2, -60 + b); g.lineTo(0, -22 + b); g.stroke(); }                 // the áo dài's two flaps
  g.strokeStyle = '#e2b43c'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-10, -104 + b); g.quadraticCurveTo(0, -94 + b, 10, -104 + b); g.moveTo(-25 + sw, -26 + b); g.lineTo(25 + sw, -26 + b); g.stroke();
  g.fillStyle = 'rgba(226,180,60,.55)';
  if (L.pat === 0) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-12 + (i % 3) * 12, -80 + ((i / 3) | 0) * 22 + b, 2.6, 0, 6.283); g.fill(); }
  else if (L.pat === 1) { g.strokeStyle = 'rgba(226,180,60,.6)'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, -78 + i * 16 + b, 6, 0, 6.283); g.stroke(); } }
  g.restore();
  // the head: a black turban (khăn xếp) for the men, a gold pin in the hair for the women; none under a quai thao hat
  if (L.hat === 'quai') return;
  if (!woman) { g.fillStyle = '#1f1a17'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.ellipse(4, -142, 20, 7, -.08, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(4, -142, 14, 3.5, -.08, 0, 6.283); g.stroke(); }
  else { g.fillStyle = '#e2b43c'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(-8, -146, 3.4, 0, 6.283); g.fill(); g.stroke(); }
}
// the things the town folk carry, held at the hand (about (44, -100) when raised)
function c4TownThing(g, w, t) {
  g.save(); g.strokeStyle = INK; g.lineJoin = 'round';
  if (t === 'quat') {                                                       // a folding fan, waved a little
    const a = Math.sin(C4.t * 4 + w.seed) * .25; g.translate(50, -122); g.rotate(-.5 + a);
    g.fillStyle = '#efe8da'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 26, -Math.PI * .95, -Math.PI * .05); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#a3332a'; g.lineWidth = 1; g.beginPath(); for (let k = 1; k < 7; k++) { const an = -Math.PI * (.95 - k * .13); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 26, Math.sin(an) * 26); } g.stroke();
  } else if (t === 'long') {                                                // a bird cage hanging from the hand, a little bird inside
    g.translate(48, -84); g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -8); g.lineTo(0, 0); g.stroke();
    g.fillStyle = 'rgba(181,122,34,.25)'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-14, 34); g.lineTo(-14, 10); g.quadraticCurveTo(-14, 0, 0, 0); g.quadraticCurveTo(14, 0, 14, 10); g.lineTo(14, 34); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (const x of [-7, 0, 7]) { g.moveTo(x, 2); g.lineTo(x, 34); } g.stroke();
    g.fillStyle = '#b57a22'; g.fillRect(-16, 32, 32, 4); g.strokeRect(-16, 32, 32, 4);
    g.fillStyle = '#f2c640'; g.beginPath(); g.ellipse(0, 22, 5, 4, 0, 0, 6.283); g.fill(); g.stroke();
  } else if (t === 'sach') {                                                // a bundle of books tied with string, under the arm
    g.translate(22, -70); for (let k = 0; k < 3; k++) { g.fillStyle = ['#2f5f8f', '#a3332a', '#e8d8a8'][k]; g.lineWidth = 1.6; g.fillRect(-14, -k * 6, 28, 6); g.strokeRect(-14, -k * 6, 28, 6); }
    g.strokeStyle = '#7a4a22'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, -12); g.stroke();
  } else if (t === 'goi') {                                                 // a parcel of silk wrapped in cloth, held by its knot
    g.translate(44, -60); g.fillStyle = '#c0567a'; g.lineWidth = 1.8; g.beginPath(); g.roundRect ? g.roundRect(-14, -6, 28, 22, 5) : g.rect(-14, -6, 28, 22); g.fill(); g.stroke();
    g.fillStyle = '#c0567a'; g.beginPath(); g.moveTo(-4, -6); g.lineTo(-8, -16); g.lineTo(0, -10); g.lineTo(8, -16); g.lineTo(4, -6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#f2c640'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-14, 5); g.lineTo(14, 5); g.stroke();
  }
  g.restore();
}

// an open shop front (owner: "cho các hàng khác mở cửa… bên trong có hàng hoá"): the shutter panels folded back to both sides, the
// warm dim room, and what the shop sells set out inside according to its board
function c4TownInterior(g, hx, hy, s, v, txt) {
  const o = C4_TOWN_V[((v | 0) % C4_TOWN_V.length + C4_TOWN_V.length) % C4_TOWN_V.length], w = o.w, x0 = -w + 22, x1 = w - 22, y0 = -120, y1 = -6, W = x1 - x0;
  const R = mulberry(v * 31 + txt.length * 7), ink = INK;
  g.save(); g.translate(hx, hy); g.scale(s, s); g.strokeStyle = ink; g.lineJoin = 'round';
  g.fillStyle = '#5e4330'; g.fillRect(x0, y0, W, y1 - y0);                   // the room
  g.fillStyle = 'rgba(255,214,140,.16)'; g.fillRect(x0, y0, W, (y1 - y0) * .5); // lamplight
  g.fillStyle = '#4a2f1f'; g.fillRect(x0, y1 - 22, W, 22);                   // the floor at the back
  const shelf = (y) => { g.fillStyle = '#7a4a22'; g.fillRect(x0 + 4, y, W - 8, 5); g.lineWidth = 1.2; g.strokeRect(x0 + 4, y, W - 8, 5); };
  const C = ['#a3332a', '#2f5f8f', '#2f6a4c', '#f2c640', '#c0567a', '#e8d8a8', '#d97b2a', '#5a2f5f'];
  const K = /CAO LẦU|MÌ QUẢNG|HOÀNH THÁNH/.test(txt) ? 'noodle' : /CƠM GÀ/.test(txt) ? 'chicken' : /BÁNH VẠC/.test(txt) ? 'dumpling' : txt === 'CHÈ' ? 'sweet' : /SÁCH/.test(txt) ? 'book' : /MAY ÁO/.test(txt) ? 'tailor' : /VẢI|LỤA/.test(txt) ? 'cloth' : /GỐM/.test(txt) ? 'pot' : /THUỐC/.test(txt) ? 'herb' : /ĐÈN LỒNG/.test(txt) ? 'lamp'
    : /BẠC/.test(txt) ? 'silver' : /QUÁN NƯỚC|CHÈ/.test(txt) ? 'tea' : /GẠO|MUỐI/.test(txt) ? 'rice' : /TRẦU/.test(txt) ? 'betel' : /RƯỢU/.test(txt) ? 'wine' : 'shop';
  g.lineWidth = 1.2;
  if (K === 'noodle' || K === 'chicken' || K === 'dumpling' || K === 'sweet') c4TownFood(g, K, txt, x0, x1, R, C);
  else if (K === 'book') {                                                       // shelves of books, spines in many colours, a scroll or two
    for (const y of [-100, -72, -44]) { shelf(y); for (let x = x0 + 8; x < x1 - 8;) { const bw = 4 + R() * 4, bh = 14 + R() * 8; g.fillStyle = C[(R() * C.length) | 0]; g.fillRect(x, y - bh, bw, bh); g.strokeRect(x, y - bh, bw, bh); x += bw + .5; } }
    g.fillStyle = '#e8d8a8'; g.fillRect(x0 + 10, -32, 30, 8); g.strokeRect(x0 + 10, -32, 30, 8);
  } else if (K === 'cloth' || K === 'tailor') {                             // bolts of cloth on shelves; at the tailor's, áo dài hanging on a rail
    shelf(-60);
    for (let x = x0 + 10, i = 0; x < x1 - 20; x += 22, i++) { g.fillStyle = C[i % C.length]; for (let k = 0; k < 2; k++) { g.beginPath(); g.roundRect ? g.roundRect(x, -60 - 12 - k * 12, 20, 11, 4) : g.rect(x, -72 - k * 12, 20, 11); g.fill(); g.stroke(); } }
    if (K === 'tailor') { g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 6, -112); g.lineTo(x1 - 6, -112); g.stroke(); g.lineWidth = 1.2;
      for (let x = x0 + 20, i = 0; x < x1 - 14; x += 26, i++) { g.fillStyle = C[(i + 3) % C.length]; g.beginPath(); g.moveTo(x, -112); g.lineTo(x - 9, -106); g.lineTo(x - 7, -78); g.lineTo(x + 7, -78); g.lineTo(x + 9, -106); g.closePath(); g.fill(); g.stroke(); } }
    else for (let x = x0 + 14, i = 0; x < x1 - 14; x += 30, i++) { g.fillStyle = C[(i + 2) % C.length]; g.fillRect(x, -112, 16, 30); g.strokeRect(x, -112, 16, 30); g.beginPath(); g.moveTo(x - 2, -112); g.lineTo(x + 18, -112); g.stroke(); }
    for (let x = x0 + 12, i = 0; x < x1 - 30; x += 34, i++) { g.fillStyle = C[(i + 5) % C.length]; g.fillRect(x, -30, 28, 10); g.strokeRect(x, -30, 28, 10); g.fillRect(x + 3, -40, 22, 10); g.strokeRect(x + 3, -40, 22, 10); }
  } else if (K === 'pot') {                                                 // jars and vases, blue on white and brown glaze, on a shelf and the floor
    shelf(-70);
    const jar = (x, y, r, h, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - r * .5, y - h); g.quadraticCurveTo(x - r * 1.3, y - h * .5, x - r * .6, y); g.lineTo(x + r * .6, y); g.quadraticCurveTo(x + r * 1.3, y - h * .5, x + r * .5, y - h); g.closePath(); g.fill(); g.stroke(); if (col === '#efe8da') { g.strokeStyle = '#2f5f8f'; g.beginPath(); g.moveTo(x - r * .8, y - h * .5); g.lineTo(x + r * .8, y - h * .5); g.stroke(); g.strokeStyle = ink; } };
    for (let x = x0 + 14, i = 0; x < x1 - 8; x += 20, i++) jar(x, -70, 7, 16 + (i % 3) * 5, i % 2 ? '#efe8da' : '#8a4a22');
    for (let x = x0 + 16, i = 0; x < x1 - 10; x += 30, i++) jar(x, -6, 11, 28 + (i % 2) * 8, i % 3 === 1 ? '#efe8da' : '#6a3a1a');
  } else if (K === 'herb') {                                                // the herbalist's wall of little drawers, jars on top
    const cols = Math.floor((W - 12) / 16); g.fillStyle = '#7a4a22'; g.fillRect(x0 + 6, -110, cols * 16, 84); g.strokeRect(x0 + 6, -110, cols * 16, 84);
    for (let r = 0; r < 6; r++) for (let c = 0; c < cols; c++) { const x = x0 + 6 + c * 16, y = -110 + r * 14; g.strokeRect(x + 1, y + 1, 14, 12); g.fillStyle = '#f2c640'; g.beginPath(); g.arc(x + 8, y + 7, 1.6, 0, 6.283); g.fill(); }
    g.fillStyle = '#efe8da'; for (let x = x0 + 16; x < x1 - 10; x += 26) { g.beginPath(); g.ellipse(x, -18, 7, 9, 0, 0, 6.283); g.fill(); g.stroke(); }
  } else if (K === 'lamp') {                                                // lanterns hanging inside, frames being covered with silk
    for (let x = x0 + 14, i = 0; x < x1 - 8; x += 18, i++) c4DrawLantern(g, x, -118, .8, C[i % 6], 6 + (i % 3) * 10, Math.sin(C4.t * 1.3 + i) * .08);
    g.lineWidth = 1; for (let x = x0 + 20; x < x1 - 20; x += 34) { g.beginPath(); g.ellipse(x, -24, 10, 13, 0, 0, 6.283); g.moveTo(x, -37); g.lineTo(x, -11); g.stroke(); }
  } else if (K === 'silver') {                                              // a workbench with a lamp, little boxes, rings and bowls catching the light
    g.fillStyle = '#7a4a22'; g.fillRect(x0 + 10, -48, W - 20, 8); g.strokeRect(x0 + 10, -48, W - 20, 8);
    g.fillStyle = 'rgba(255,214,120,.35)'; g.beginPath(); g.arc(x0 + 30, -66, 18, 0, 6.283); g.fill(); g.fillStyle = '#f2c640'; g.beginPath(); g.arc(x0 + 30, -62, 4, 0, 6.283); g.fill(); g.stroke();
    for (let x = x0 + 50; x < x1 - 12; x += 18) { g.fillStyle = '#d9d4cc'; g.beginPath(); g.arc(x, -54, 5, Math.PI, 0); g.fill(); g.stroke(); }
    shelf(-90); for (let x = x0 + 12; x < x1 - 12; x += 16) { g.fillStyle = '#a3332a'; g.fillRect(x, -100, 11, 10); g.strokeRect(x, -100, 11, 10); }
  } else if (K === 'tea' || K === 'wine') {                                  // a low table with a teapot (or a wine jar) and cups, stools
    g.fillStyle = '#7a4a22'; g.fillRect(-36, -36, 72, 7); g.strokeRect(-36, -36, 72, 7); g.fillRect(-30, -29, 5, 23); g.fillRect(25, -29, 5, 23);
    g.fillStyle = K === 'tea' ? '#2f6a4c' : '#8a4a22'; g.beginPath(); g.ellipse(0, -46, 10, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#efe8da'; for (const x of [-22, -12, 14, 24]) { g.beginPath(); g.rect(x - 3, -43, 6, 6); g.fill(); g.stroke(); }
    g.fillStyle = '#5b2f1f'; for (const x of [-52, 52]) { g.fillRect(x - 8, -20, 16, 5); g.strokeRect(x - 8, -20, 16, 5); }
    shelf(-90); for (let x = x0 + 14; x < x1 - 10; x += 18) { g.fillStyle = K === 'tea' ? '#c9a45a' : '#6a3a1a'; g.beginPath(); g.ellipse(x, -98, 6, 8, 0, 0, 6.283); g.fill(); g.stroke(); }
  } else if (K === 'rice') {                                                // sacks of rice, a basket of salt, a measure
    for (let x = x0 + 18, i = 0; x < x1 - 12; x += 28, i++) { g.fillStyle = i % 2 ? '#efe8da' : '#e8d8a8'; g.beginPath(); g.moveTo(x - 12, -6); g.quadraticCurveTo(x - 14, -36, x - 6, -40); g.lineTo(x + 6, -40); g.quadraticCurveTo(x + 14, -36, x + 12, -6); g.closePath(); g.fill(); g.stroke(); }
    shelf(-80); for (let x = x0 + 16; x < x1 - 14; x += 24) { g.fillStyle = '#c9a45a'; g.beginPath(); g.ellipse(x, -88, 9, 6, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(x, -91, 7, 3, 0, 0, 6.283); g.fill(); }
  } else if (K === 'betel') {                                               // baskets of betel leaves and areca nuts
    shelf(-70); for (let x = x0 + 16, i = 0; x < x1 - 12; x += 24, i++) { g.fillStyle = '#c9a45a'; g.beginPath(); g.ellipse(x, -76, 10, 6, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = i % 2 ? '#2f6a4c' : '#b57a22'; g.beginPath(); g.ellipse(x, -82, 8, 5, 0, Math.PI, 0); g.fill(); g.stroke(); }
  } else {                                                                  // a general store: jars, baskets, bundles on two shelves
    for (const y of [-92, -56]) { shelf(y); for (let x = x0 + 12, i = 0; x < x1 - 10; x += 18, i++) { g.fillStyle = C[(i + (y > -60 ? 3 : 0)) % C.length]; g.beginPath(); (i % 2 ? g.ellipse(x, y - 8, 6, 8, 0, 0, 6.283) : g.rect(x - 6, y - 13, 12, 13)); g.fill(); g.stroke(); } }
    for (let x = x0 + 20; x < x1 - 16; x += 30) { g.fillStyle = '#c9a45a'; g.beginPath(); g.ellipse(x, -16, 12, 9, 0, 0, 6.283); g.fill(); g.stroke(); }
  }
  // the shutter panels folded back at both sides of the opening
  g.fillStyle = o.wood === 'dark' ? '#2a221d' : '#5b2f1f'; g.lineWidth = 1.6;
  for (const x of [x0, x1 - 14]) { g.fillRect(x, y0 - 2, 14, y1 - y0 + 2); g.strokeRect(x, y0 - 2, 14, y1 - y0 + 2); g.beginPath(); g.moveTo(x + 7, y0); g.lineTo(x + 7, y1); g.stroke(); }
  g.lineWidth = 2; g.strokeRect(x0, y0, W, y1 - y0);
  g.restore();
}

// inside an eating house: a stove with its pot steaming, the dish of the house, a low table and stools for those who eat in
function c4TownFood(g, K, txt, x0, x1, R, C) {
  const W = x1 - x0, ink = INK; g.lineWidth = 1.2; g.strokeStyle = ink;
  // the stove at the back left, a pot on it, steam rising
  const sx = x0 + 22; g.fillStyle = '#7a3a24'; g.fillRect(sx - 16, -40, 32, 34); g.strokeRect(sx - 16, -40, 32, 34);
  g.fillStyle = 'rgba(230,110,40,.85)'; g.beginPath(); g.ellipse(sx, -14, 8, 5, 0, 0, 6.283); g.fill();
  if (K === 'dumpling') { for (let k = 0; k < 3; k++) { g.fillStyle = '#c9a45a'; g.fillRect(sx - 15, -52 - k * 11, 30, 10); g.strokeRect(sx - 15, -52 - k * 11, 30, 10); g.beginPath(); g.moveTo(sx - 15, -47 - k * 11); g.lineTo(sx + 15, -47 - k * 11); g.stroke(); } }   // bamboo steamers stacked
  else { g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(sx - 16, -40); g.quadraticCurveTo(sx - 18, -60, sx, -62); g.quadraticCurveTo(sx + 18, -60, sx + 16, -40); g.closePath(); g.fill(); g.stroke(); }
  for (let k = 0; k < 3; k++) { const ph = (C4.t * .6 + k / 3) % 1, a = 1 - ph; g.fillStyle = 'rgba(242,236,222,' + (.55 * a).toFixed(2) + ')'; g.beginPath(); g.arc(sx + Math.sin(C4.t * 2 + k * 2) * 5, -70 - ph * 40, 5 + ph * 7, 0, 6.283); g.fill(); }
  // the dish of the house, on a shelf or hanging at the back
  if (K === 'noodle') {                                                     // noodles drying in bundles, a stack of bowls, herbs in a basket
    g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 44, -112); g.lineTo(x1 - 8, -112); g.stroke(); g.lineWidth = 1.2;
    for (let x = x0 + 52; x < x1 - 10; x += 14) { g.strokeStyle = txt === 'MÌ QUẢNG' ? '#e2b43c' : txt === 'CAO LẦU' ? '#c98a3a' : '#efe8da'; g.lineWidth = 2; g.beginPath(); for (let k = -3; k <= 3; k += 2) { g.moveTo(x + k, -110); g.quadraticCurveTo(x + k * 1.4, -96, x + k, -84); } g.stroke(); }
    g.strokeStyle = ink; g.lineWidth = 1.2;
    if (txt === 'HOÀNH THÁNH') for (let x = x0 + 54; x < x1 - 12; x += 16) { g.fillStyle = '#efe8da'; g.beginPath(); g.moveTo(x - 6, -66); g.lineTo(x, -76); g.lineTo(x + 6, -66); g.closePath(); g.fill(); g.stroke(); }
  } else if (K === 'chicken') {                                             // boiled chickens hanging on hooks, a pot of yellow rice
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + 44, -112); g.lineTo(x1 - 8, -112); g.stroke(); g.lineWidth = 1.2;
    for (let x = x0 + 56; x < x1 - 14; x += 26) { g.beginPath(); g.moveTo(x, -112); g.lineTo(x, -104); g.stroke(); g.fillStyle = '#e8b04a'; g.beginPath(); g.ellipse(x, -90, 9, 13, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 4, -77); g.lineTo(x - 6, -70); g.moveTo(x + 4, -77); g.lineTo(x + 6, -70); g.stroke(); }
    g.fillStyle = '#f2c640'; g.beginPath(); g.ellipse(x1 - 30, -50, 14, 6, 0, Math.PI, 0); g.fill(); g.stroke();
  } else if (K === 'dumpling') {                                            // plates of little white "white rose" dumplings
    for (let x = x0 + 56; x < x1 - 14; x += 28) { g.fillStyle = '#efe8da'; g.beginPath(); g.ellipse(x, -88, 12, 4, 0, 0, 6.283); g.fill(); g.stroke(); for (const dx of [-5, 0, 5]) { g.fillStyle = '#f7f2e8'; g.beginPath(); g.arc(x + dx, -92, 3.6, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#c0567a'; g.beginPath(); g.arc(x + dx, -93, 1, 0, 6.283); g.fill(); } }
    g.fillStyle = '#7a4a22'; g.fillRect(x0 + 44, -82, W - 52, 4);
  } else if (K === 'sweet') {                                               // pots of sweet soup and glasses in many colours
    g.fillStyle = '#7a4a22'; g.fillRect(x0 + 44, -84, W - 52, 5); g.strokeRect(x0 + 44, -84, W - 52, 5);
    for (let x = x0 + 54, i = 0; x < x1 - 10; x += 14, i++) { g.fillStyle = ['#2f6a4c', '#f2c640', '#c0567a', '#efe8da', '#7a3a24'][i % 5]; g.fillRect(x - 4, -98, 8, 14); g.strokeRect(x - 4, -98, 8, 14); }
  }
  // stacked bowls on the counter by the stove
  g.fillStyle = '#efe8da'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(sx + 34, -10 - k * 5, 9, 3, 0, 0, Math.PI); g.lineTo(sx + 25, -10 - k * 5); g.fill(); g.stroke(); }
  // a low table with bowls and chopsticks, two stools
  const tx = (x0 + x1) / 2 + 14; g.fillStyle = '#7a4a22'; g.fillRect(tx - 26, -30, 52, 6); g.strokeRect(tx - 26, -30, 52, 6); g.fillRect(tx - 22, -24, 4, 18); g.fillRect(tx + 18, -24, 4, 18);
  for (const dx of [-12, 12]) { g.fillStyle = '#efe8da'; g.beginPath(); g.ellipse(tx + dx, -33, 7, 3, 0, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = '#7a4a22'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(tx + dx - 2, -40); g.lineTo(tx + dx + 6, -34); g.stroke(); g.strokeStyle = ink; g.lineWidth = 1.2; }
  g.fillStyle = '#5b2f1f'; for (const dx of [-40, 40]) { g.fillRect(tx + dx - 7, -16, 14, 4); g.strokeRect(tx + dx - 7, -16, 14, 4); }
}
