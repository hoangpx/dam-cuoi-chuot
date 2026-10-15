/* Chương IV phần 2 · Phố Huyện: the town's look (owner, 2026-10-14, after old Hội An): shophouses wall to wall with ochre walls, low
   roofs of dark tiles, deep eaves, upper floors with balconies or lattices, silk lanterns, bougainvillea and potted palms; the paved street,
   the river with its quay, sampans and a junk, the covered bridge (after Chùa Cầu), the gate HẢI PHỐ; far behind the district office, a
   watchtower, temple roofs. Night with lantern light falling on everything, and the flower lanterns on the river. Part 2's own code:
   nothing here is used by part 1 (js/ch4/*), and part 1's code is not changed by part 2. */

// the houses: half width, one or two storeys, the wall and wood colours, the upper floor's front, the board's words
const P4_TOWN_V = [
  { w: 96, two: true, wall: 'catY2', wood: 'brown', up: 'balc', sign: 'THUỐC BẮC', board: 'red' },
  { w: 104, two: false, wall: 'catY', wood: 'brown', up: null, sign: 'VẢI LỤA', board: 'dark' },
  { w: 88, two: true, wall: 'catY2', wood: 'dark', up: 'lattice', sign: 'ĐỒ GỐM', board: 'red' },
  { w: 100, two: true, wall: 'catY', wood: 'brown', up: 'wall', sign: 'QUÁN NƯỚC', board: 'dark' },
  { w: 92, two: false, wall: 'catY2', wood: 'dark', up: null, sign: 'TẠP HOÁ', board: 'red' },
  { w: 98, two: true, wall: 'catY2', wood: 'brown', up: 'balc', sign: 'ĐÈN LỒNG', board: 'dark' },
  { w: 90, two: true, wall: 'catY', wood: 'dark', up: 'lattice', sign: 'THỢ BẠC', board: 'red' },
  { w: 102, two: false, wall: 'catY', wood: 'brown', up: null, sign: 'GẠO MUỐI', board: 'dark' },
];
const P4_LANTERN_COLS = ['red', 'yellow', 'red', 'blue', 'green', 'orange', 'red', 'pink'];
const P4_LANTERN_BRIGHT = ['#e8393a', '#f7c531', '#2fae74', '#3b8fd8', '#9b59d0', '#f06aa0', '#f28a2e', '#f4efe2'];   // the lantern maker's silks
// a tiled roof slope seen from the street: the tiles run down in rows of tubes (ngói âm dương)
// a roof of yin-yang tiles (ngói âm dương, owner: "mái ngói không giống Hội An, nhìn như mái rơm"): dark channels, rows of round cover
// tiles running down the slope (each row a little lighter along one side, the tiles' laps marked across it), round tile ends along
// the eave, a thick ridge on top with its ends turned up
const p4Poly = pts => { const q = new Path2D(); q.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) q.lineTo(pts[i][0], pts[i][1]); q.closePath(); return q; };   // straight edges (smooth() rounds every corner)
const P4_TILE_HI = { brown: 'red', tan: 'catY2', dark: 'brown', green: 'teal', red: 'ltred' };
function p4TileRoof(a, x0, x1, yTop, yBot, out, pl = 'brown') {
  const p = p4Poly([[x0 - out - 3, yBot + 1], [x0 - out + 2, yBot - 3], [x0 + 4, yTop], [x1 - 4, yTop], [x1 + out - 2, yBot - 3], [x1 + out + 3, yBot + 1]]);   // straight slopes, the eave's corners flicked up a little
  a.fk('dark', p, 2.4);                                                      // the channels between the rows
  const L = x0 - out + 7, Rr = x1 + out - 7, span = Rr - L, h = yBot - yTop, step = Math.max(9, Math.min(13, h * .35)), tw = step * .62, hi = P4_TILE_HI[pl] || pl;
  for (let x = L; x <= Rr + .1; x += step) {
    const k = (x - L) / span, xt = x0 + 6 + k * (x1 - x0 - 12);            // the rows lean in towards the ridge
    const roll = [[xt - tw * .42, yTop + 2], [xt + tw * .42, yTop + 2], [x + tw / 2, yBot - 3], [x - tw / 2, yBot - 3]];
    a.fk(pl, p4Poly(roll), 1.1);
    a.fill(hi, p4Poly([[xt - tw * .42, yTop + 3], [xt - tw * .1, yTop + 3], [x - tw * .12, yBot - 5], [x - tw / 2 + 1, yBot - 5]]));   // the light along one side
    const laps = [];                                                          // where each tile laps over the next, down the row
    for (let y = yTop + 9; y < yBot - 6; y += 8) { const kk = (y - yTop) / h, cx = xt + (x - xt) * kk, hw = (tw * .42 + (tw / 2 - tw * .42) * kk); laps.push([cx - hw, y, cx + hw, y + 1.6]); }
    if (laps.length) a.key(lines(laps), .7);
    a.fk(pl, circ(x, yBot - 1, tw * .52), 1.2);                               // the round tile end at the eave
    a.fill('dark', circ(x, yBot - 1, tw * .18));
  }
  a.fk('dark', p4Poly([[x0 - 2, yTop + 3], [x0 - 9, yTop - 9], [x0 + 6, yTop - 6], [x1 - 6, yTop - 6], [x1 + 9, yTop - 9], [x1 + 2, yTop + 3]]), 2);   // the ridge, ends turned up
  a.key(lines([[x0 + 4, yTop - 2, x1 - 4, yTop - 2]]), 1);
  a.key(lines([[x0 - out + 2, yBot + 2, x1 + out - 2, yBot + 2]]), 1.6);   // the eave's edge
}
function p4Lanterns(a, x0, x1, y, seed) {
  for (let x = x0, i = 0; x <= x1; x += 22, i++) {
    const c = P4_LANTERN_COLS[(seed + i * 3) % P4_LANTERN_COLS.length], dy = (i % 2) * 6;
    a.key(lines([[x, y, x, y + 6 + dy]]), .9);
    a.fk(c, ell(x, y + 14 + dy, 7, 9), 1.4);
    a.key(lines([[x - 5, y + 8 + dy, x + 5, y + 8 + dy], [x - 5, y + 20 + dy, x + 5, y + 20 + dy], [x, y + 23 + dy, x, y + 31 + dy]]), .9);
  }
}
const P4_TOWN_ART = [];
function p4TownArt(v) {
  v = ((v | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length;
  if (P4_TOWN_ART[v]) return P4_TOWN_ART[v];
  const o = P4_TOWN_V[v], w = o.w, eave = -150, upTop = o.two ? -250 : -160, roofTop = o.two ? -320 : -270;
  return (P4_TOWN_ART[v] = part([-w - 26, roofTop - 30, w + 26, 6], a => {
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
    p4TileRoof(a, -w, w, eave - 26, eave + 4, 22, 'brown');                 // the lower eave over the shop front, tiled too
    // the main roof: big, low, dark tiles, a straight ridge with little upturned ends
    p4TileRoof(a, -w + (o.two ? 8 : 0), w - (o.two ? 8 : 0), roofTop, o.two ? upTop + 8 : eave - 24, o.two ? 18 : 22, 'brown');
    a.fk('dark', smooth([[-w + 4, roofTop + 2], [-w - 2, roofTop - 12], [-w + 14, roofTop - 6], [w - 14, roofTop - 6], [w + 2, roofTop - 12], [w - 4, roofTop + 2]]), 1.6);
  }));
}
// bougainvillea climbing a post, and a potted palm (between the houses)
let P4_FLOWER_ART = null, P4_POT_ART = null;
const p4FlowerArt = () => P4_FLOWER_ART || (P4_FLOWER_ART = part([-70, -230, 70, 6], a => {
  a.fk('brown', smooth([[-4, 0], [-6, -80], [2, -150], [-2, -190], [6, -190], [10, -150], [4, -80], [6, 0]]), 1.8);
  const r = mulberry(7);
  for (let i = 0; i < 26; i++) { const x = -54 + r() * 108, y = -220 + r() * 120; a.fk(i % 4 ? 'pink' : 'green', ell(x, y, 13 + r() * 9, 10 + r() * 6, r() * 3), 1.2); }
}));
const p4PotArt = () => P4_POT_ART || (P4_POT_ART = part([-50, -150, 50, 6], a => {
  for (let i = 0; i < 7; i++) { const ang = -Math.PI / 2 + (i - 3) * .38, x2 = Math.cos(ang) * 70, y2 = -50 + Math.sin(ang) * 80; a.band('green', smooth([[0, -46], [x2 * .5, -46 + (y2 + 46) * .6 - 10], [x2, y2]], false), 6); a.key(smooth([[0, -46], [x2 * .5, -46 + (y2 + 46) * .6 - 10], [x2, y2]], false), 1); }
  a.fk('red', smooth([[-22, -46], [22, -46], [16, 0], [-16, 0]]), 2); a.fk('brown', rect(-24, -50, 48, 6), 1.4);
}));
// far off: the district office's gate with a flag pole, a watchtower, a temple, the roofs of the town (all under dark tiles)
let P4_TOWN_FAR = null;
function p4TownFarArt() {
  if (P4_TOWN_FAR) return P4_TOWN_FAR;
  return (P4_TOWN_FAR = {
    gate: part([-200, -340, 200, 6], a => {
      a.fk('catY', rect(-150, -150, 300, 150), 2.4);
      a.fk('dark', smooth([[-40, 0], [-40, -90], [-30, -112], [0, -122], [30, -112], [40, -90], [40, 0]]), 2.2);
      p4TileRoof(a, -150, 150, -214, -150, 26, 'dark');
      p4TileRoof(a, -96, 96, -262, -214, 16, 'dark');
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
      p4TileRoof(a, -150, 150, -176, -110, 30, 'dark');
      a.fk('green', smooth([[-128, -176], [-150, -204], [-110, -190], [110, -190], [150, -204], [128, -176]]), 2);
    }),
    roofs: part([-260, -150, 260, 6], a => {
      for (let i = 0; i < 6; i++) { const x = -230 + i * 92, h = 70 + (i % 3) * 18; a.fk(i % 2 ? 'catY' : 'catY2', rect(x, -h, 84, h), 1.8); p4TileRoof(a, x + 6, x + 78, -h - 30, -h, 10, 'dark'); }
    }),
  });
}
// the town's rows: houses wall to wall, the couple's own house among them (P4_HOME), now and then a bougainvillea or a potted palm, one
// assembly hall; far landmarks behind
function p4TownScene(rs) {
  const near = [], far = [];
  const names = P4_SHOP_NAMES.slice(), lamps = P4_LAMP_NAMES.slice();
  for (let k = names.length - 1; k > 0; k--) { const j = (rs() * (k + 1)) | 0; [names[k], names[j]] = [names[j], names[k]]; }   // shuffled once, then each used once
  const next = n => (n % 6 === 0 && lamps.length) ? lamps.shift() : names.length ? names.shift() : lamps.length ? lamps.shift() : 'TẠP HOÁ';
  let hq = false;
  const put = (cx, label) => { const v = (rs() * P4_TOWN_V.length) | 0; near.push([cx, 'shop', .72, v, label]); return P4_TOWN_V[v].w * .72; };
  let x = 600, i = 0;
  for (const [ax, label] of [[P4_HOME, 'home'], [P4_W + 400, null]]) {
    if (!hq && ax > P4_HOME && ax - 70 - x > 330) { near.push([x + 160, 'hoiquan', .72]); x += 320; hq = true; }
    while (x + 140 < ax - 70) { const nm = next(i); const w = put(x + 70, nm); x += 2 * w; if (++i % 3 === 0) { near.push([x + 10, rs() < .5 ? 'flower' : 'pot', .7]); x += 22; } }
    if (!label) break;
    const w = put(ax, label); x = ax + w;
  }
  for (let fx = -100; fx < P4_W; fx += 300 + rs() * 120) far.push([fx, 'roofs', .85]);
  far.push([700, 'gate', 1], [1500, 'tower', 1.05], [2300, 'temple', 1.1], [1100, 'bigtree', .75], [2900, 'tower', .95]);
  return { far, near };
}
const p4TownPart = k => k === 'bigtree' ? WP.bigTree : p4TownFarArt()[k];
const p4TownNear = k => k === 'flower' ? p4FlowerArt() : k === 'pot' ? p4PotArt() : k === 'hoiquan' ? p4HoiQuanArt() : null;
// the paving of the street: big worn stone slabs
function p4TownPaving(g, cx, vw) {
  g.save(); g.fillStyle = 'rgba(160,112,58,.16)'; g.fillRect(cx - 50, P4_Y0 - 4, vw + 100, P4_D + 10);
  g.strokeStyle = 'rgba(91,47,31,.26)'; g.lineWidth = 1.3;
  const rows = 6; let yPrev = P4_Y0 - 4;
  for (let r = 1; r <= rows; r++) {
    const y = P4_Y0 - 4 + (P4_D + 10) * r / rows; g.beginPath(); g.moveTo(cx - 50, y); g.lineTo(cx + vw + 50, y); g.stroke();
    const step = 60 + r * 10, off = (r % 2) * step / 2;
    g.beginPath(); for (let x = Math.floor((cx - 80) / step) * step + off; x < cx + vw + 80; x += step) { g.moveTo(x, yPrev); g.lineTo(x + 3, y); } g.stroke();
    yPrev = y;
  }
  g.restore();
}
// the covered bridge (after Chùa Cầu; owner's photo: a long bridge whose deck rises in a hump, a stone foot with arches, orange tiles
// with white ridges, blue ceramic dragons along the ridge, red-walled houses at both ends): the street runs over it
const P4_BRIDGE_X = 110, P4_BRIDGE_HW = 200, P4_BRIDGE_UP = 48;            // its middle, half span, and how high the deck rises
// how high the deck lifts a walker at x (a smooth hump, 0 off the bridge)
const p4TownLift = x => { const k = Math.abs(x - P4_BRIDGE_X) / P4_BRIDGE_HW; return k >= 1 ? 0 : P4_BRIDGE_UP * Math.pow(Math.cos(k * Math.PI / 2), 1.3); };
const p4OnBridge = x => Math.abs(x - P4_BRIDGE_X) < P4_BRIDGE_HW;
// the creek behind the street, coming down to the bridge; the bridge's deck, raised over the street
function p4TownCreek(g, cx, vw) {
  if (P4_BRIDGE_X + P4_BRIDGE_HW < cx - 80 || P4_BRIDGE_X - P4_BRIDGE_HW > cx + vw + 80) return;
  const x0 = P4_BRIDGE_X - 80, x1 = P4_BRIDGE_X + 80, yT = P4_Y0 - 46, yB = P4_Y0 - 4;
  g.save();
  g.fillStyle = '#b9b0a4'; g.beginPath(); g.moveTo(x0 - 30, yB); g.lineTo(x0 + 8, yT); g.lineTo(x1 - 8, yT); g.lineTo(x1 + 30, yB); g.closePath(); g.fill();
  g.fillStyle = 'rgba(70,112,98,.92)'; g.beginPath(); g.moveTo(x0, yB); g.lineTo(x0 + 22, yT); g.lineTo(x1 - 22, yT); g.lineTo(x1, yB); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  // the deck: wooden planks from the far edge to the near edge, lifted by the hump
  const a = P4_BRIDGE_X - P4_BRIDGE_HW, b = P4_BRIDGE_X + P4_BRIDGE_HW, top = [], bot = [];
  for (let x = a; x <= b + .1; x += 10) { top.push([x, P4_Y0 - 4 - p4TownLift(x)]); bot.push([x, P4_Y0 + P4_D + 6 - p4TownLift(x)]); }
  g.fillStyle = '#9a6a3c'; g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(42,34,29,.35)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < top.length; i += 2) { g.moveTo(top[i][0], top[i][1]); g.lineTo(bot[i][0], bot[i][1]); } g.stroke();
  g.restore();
}
// the line of the deck's edge at depth z, and a polyline along it
const p4DeckY = (x, z) => p4Y(z) - p4TownLift(x);
function p4TownBridgeItems(items, g, vis) {
  p4QuayLamps(items, g, vis);
  const J = P4.townJunkAt; if (J) items.push({ z: 2, f: () => p4Junk(g, J[0], J[1], 1) });
  (P4.townBoatFns || []).forEach((f, i) => items.push({ z: 2.1 + i * .001, f }));   // the junk is on the river, nearer than the street: its sails go in front of the walkers (owner)
  if (!vis(P4_BRIDGE_X, P4_BRIDGE_HW + 120)) return;
  const a = P4_BRIDGE_X - P4_BRIDGE_HW, b = P4_BRIDGE_X + P4_BRIDGE_HW;
  const pillars = (z, h) => { const s = p4S(z); g.fillStyle = '#7a3a24'; g.strokeStyle = INK; g.lineWidth = 2;
    for (const k of [-.92, -.31, .31, .92]) { const x = P4_BRIDGE_X + k * P4_BRIDGE_HW; const y = p4DeckY(x, z); g.beginPath(); g.rect(x - 5 * s, y - h * s, 10 * s, h * s); g.fill(); g.stroke(); } };
  const rail = z => { const s = p4S(z); g.strokeStyle = INK; g.lineWidth = 1.6; g.fillStyle = '#c9a36a';
    g.beginPath(); for (let x = a; x <= b + .1; x += 8) { const y = p4DeckY(x, z) - 40 * s; x === a ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = b; x >= a - .1; x -= 8) g.lineTo(x, p4DeckY(x, z) - 34 * s); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); for (let x = a + 5; x < b; x += 8) { const y = p4DeckY(x, z); g.moveTo(x, y - 34 * s); g.lineTo(x, y); } g.stroke(); };
  items.push({ z: -.6, f: () => rail(0) });                                 // the far railing, behind the walkers
  // in front of the walkers: the near railing, the pillars, and the long roof over the deck
  items.push({ z: 1.08, f: () => {
    rail(1); pillars(1, 165);
    const s = p4S(1);
    p4TownRoofBand(g, a - 30, b + 30, x => p4DeckY(Math.max(a, Math.min(b, x)), 1) - 165 * s, 70 * s, s);
    for (let i = 0; i < 6; i++) { const lx = a + 40 + i * (b - a - 80) / 5, ey = p4DeckY(lx, 1) - 165 * s; p4DrawLantern(g, lx, ey + 4 * s, s * 1.15, i % 2 ? '#f2c640' : '#c4473a', 10, Math.sin(P4.t * 1.5 + i * 1.7) * .14); }
  } });
}
// a long tiled roof drawn along a curve: eave at eaveY(x), height h; orange tiles with white mortar lines, a red beam under the eave,
// a white ridge with blue ceramic curls on it
function p4TownRoofBand(g, x0, x1, eaveY, h, s) {
  const pts = []; for (let x = x0; x <= x1 + .1; x += 8) pts.push([x, eaveY(x)]);
  const ridge = pts.map(([x, y]) => [x, y - h]), mid = (x0 + x1) / 2, inn = x => (x < mid ? 14 : -14) * s;   // the ridge sits a little in from the eave's ends
  g.save(); g.strokeStyle = INK; g.lineJoin = 'round';
  // yin-yang tiles like the town's houses (owner): the dark channels first, the whole slope
  g.fillStyle = '#2a221d'; g.lineWidth = 2.2; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + 4 * s) : g.moveTo(x, y + 4 * s)); for (let i = ridge.length - 1; i >= 0; i--) g.lineTo(ridge[i][0] + inn(ridge[i][0]), ridge[i][1]); g.closePath(); g.fill(); g.stroke();
  // the rows of round cover tiles from the eave up to the ridge, lighter along one side, their laps marked across
  const tw = 5.2 * s;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], rx = x + inn(x) * .9, ry = y - h + 2;
    g.fillStyle = '#5b2f1f'; g.lineWidth = 1; g.beginPath(); g.moveTo(rx - tw * .4, ry); g.lineTo(rx + tw * .4, ry); g.lineTo(x + tw / 2, y - 1); g.lineTo(x - tw / 2, y - 1); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#a3332a'; g.beginPath(); g.moveTo(rx - tw * .4, ry + 1); g.lineTo(rx - tw * .05, ry + 1); g.lineTo(x - tw * .08, y - 2); g.lineTo(x - tw / 2 + .8, y - 2); g.closePath(); g.fill();
    g.lineWidth = .7; g.beginPath(); for (let k = .18; k < .95; k += .2) { const lx = x + (rx - x) * k, ly = y - 1 + (ry - y + 1) * k; g.moveTo(lx - tw * .45, ly); g.lineTo(lx + tw * .45, ly - 1.2); } g.stroke();
  }
  // the round tile ends along the eave, and the eave's edge
  for (const [x, y] of pts) { g.fillStyle = '#5b2f1f'; g.lineWidth = 1; g.beginPath(); g.arc(x, y + 1, tw * .55, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#2a221d'; g.beginPath(); g.arc(x, y + 1, tw * .2, 0, 6.283); g.fill(); }
  g.lineWidth = 1.6; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + 4 * s) : g.moveTo(x, y + 4 * s)); g.stroke();
  // the ridge: a white band, blue curls rising from it
  g.fillStyle = '#efe8da'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath();
  ridge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = ridge.length - 1; i >= 0; i--) g.lineTo(ridge[i][0], ridge[i][1] - 10 * s); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#2f5f8f'; g.lineWidth = 2.2 * s; g.lineCap = 'round';
  p4RidgeCeramics(g, ridge, s);
  g.restore();
}
// in front of the street: the stone quay, the bridge's stone foot with its arches, the river with boats going by
const P4_BOAT_HULLS = ['#2f6a4c', '#a3332a', '#2f5f8f', '#7a4a22', '#2f6a4c', '#d97b2a'];
const P4_BOAT_SORTS = [1, 3, 5, 7, 2, 4, 6, 8, 9, 10];
function p4TownRiver(g, cx, vw, V) {
  const yq = P4_Y0 + P4_D + 8, yw = yq + 16, x0 = cx - 50, x1 = cx + vw + 50, yb = V.vh - V.oy + 60;
  const bx0 = P4_BRIDGE_X - P4_BRIDGE_HW, bx1 = P4_BRIDGE_X + P4_BRIDGE_HW;
  g.save();
  g.fillStyle = 'rgba(70,112,98,.85)'; g.fillRect(x0, yq - 10, x1 - x0, yb - yq + 10);
  g.globalAlpha = .22; for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) { g.fillStyle = (x / 90) % 3 ? '#d9a94e' : '#a3332a'; g.fillRect(x + 10, yw + 4, 30 + ((x / 90) % 2) * 20, 40); }
  g.globalAlpha = 1;
  g.fillStyle = '#b9b0a4'; g.strokeStyle = INK; g.lineWidth = 2;
  for (const [a, b] of [[x0, bx0 - 20], [bx1 + 20, x1]]) { if (b <= a) continue; g.fillRect(a, yq, b - a, 16); g.beginPath(); g.moveTo(a, yq); g.lineTo(b, yq); g.moveTo(a, yw); g.lineTo(b, yw); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let x = Math.ceil(a / 46) * 46; x < b; x += 46) { g.moveTo(x, yq); g.lineTo(x, yw); } g.stroke(); g.lineWidth = 2; }
  // the foot (owner: four rows of two stone piers): a white plaster band and a stone beam following the deck's hump, four piers in the water, stone banks at both ends
  if (bx1 > x0 - 60 && bx0 < x1 + 60) {
    const bot = yq + 110, topAt = x => p4DeckY(Math.max(bx0, Math.min(bx1, x)), 1) + 6, beam = 26;
    g.fillStyle = '#9a958a'; g.strokeStyle = INK; g.lineWidth = 2;
    for (const [e0, e1] of [[bx0 - 60, bx0 + 4], [bx1 - 4, bx1 + 60]]) { g.beginPath(); g.moveTo(e0, bot); g.lineTo(e0, topAt(e0) + 10); g.lineTo(e1, topAt(e1) + 10); g.lineTo(e1, bot); g.closePath(); g.fill(); g.stroke(); }
    for (const k of [-.62, -.2, .2, .62]) { const px = P4_BRIDGE_X + k * P4_BRIDGE_HW, pw = .11 * P4_BRIDGE_HW, pt = topAt(px) + beam;
      g.fillStyle = '#8f8a7c'; g.beginPath(); g.rect(px - pw / 2, pt, pw, bot - pt); g.fill(); g.stroke();
      g.fillStyle = '#a9a294'; g.beginPath(); g.rect(px - pw / 2 - 5, pt, pw + 10, 9); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(42,34,29,.3)'; g.lineWidth = 1; g.beginPath(); for (let y = pt + 20; y < bot; y += 14) { g.moveTo(px - pw / 2, y); g.lineTo(px + pw / 2, y); } g.stroke(); g.strokeStyle = INK; g.lineWidth = 2; }
    g.fillStyle = '#8f8a7c'; g.beginPath(); for (let x = bx0; x <= bx1 + .1; x += 8) { const y = topAt(x); x === bx0 ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = bx1; x >= bx0 - .1; x -= 8) g.lineTo(x, topAt(x) + beam); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#efe8da'; g.beginPath(); for (let x = bx0 - 4; x <= bx1 + 4.1; x += 8) { const y = topAt(x); x === bx0 - 4 ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = bx1 + 4; x >= bx0 - 4.1; x -= 8) g.lineTo(x, topAt(x) + 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(70,112,98,.6)'; g.fillRect(bx0 - 20, bot - 20, bx1 - bx0 + 40, 20);
  }
  g.strokeStyle = 'rgba(242,236,222,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (let r = 0; r < 7; r++) { const y = yw + 40 + r * 22, off = (P4.t * (6 + r * 3)) % 80; for (let x = Math.floor((x0 - off) / 80) * 80 + off; x < x1; x += 80) { g.moveTo(x + r * 23, y); g.quadraticCurveTo(x + r * 23 + 10, y - 4, x + r * 23 + 20, y); } }
  g.stroke();
  // boats coming and going (owner: one or two mice a boat, a proper deep hull): a sampan with an eye on its bow, a painted band, a
  // woven bamboo canopy on some; the boatman stands at the stern with his pole, now and then a passenger sits in the middle
  const B = P4.townBoats || (P4.townBoats = [0, 1, 2, 3, 4, 5].map(i => ({ x: 200 + i * 900 + (i % 2) * 300, sp: (i % 2 ? -1 : 1) * (9 + i * 2.5), y: 40 + (i % 3) * 30, hull: P4_BOAT_HULLS[i],
    lamp: i % 3 !== 1, mui: i % 3 === 1, pass: i % 3 === 1 ? null : i % 2 ? null : c4MouseRig(P4_BOAT_SORTS[(i * 3) % P4_BOAT_SORTS.length]), man: c4MouseRig(P4_BOAT_SORTS[(i + 4) % P4_BOAT_SORTS.length]) })));
  { const J = P4.townJunk || (P4.townJunk = { x: 1600, sp: 6 }); if (!P4.paused) { J.x += J.sp / 60; if (J.x > P4_W + 400) J.x = -400; } P4.townJunkAt = J.x > x0 - 200 && J.x < x1 + 200 ? [J.x, yw + 26 + Math.sin(P4.t) * 1.2] : null; }   // drawn later, in front of the street (p4TownBridgeItems)
  p4HoaDang(g, x0, x1, yw, yb);                                            // flower lanterns on the water at night
  P4.townBoatFns = [];
  for (const b of [...B].sort((p, q) => p.y - q.y)) {
    if (!P4.paused && !b.stop) { b.x += (b.fast || b.sp) / 60; if (b.x > P4_W + 300) b.x = -300; if (b.x < -300) b.x = P4_W + 300; }
    if (b.x < x0 - 140 || b.x > x1 + 140) continue;
    P4.townBoatFns.push(() => {                                             // drawn in front of the street and the junk (p4TownBridgeItems)
    const y = yw + b.y + Math.sin(P4.t * 1.4 + b.x * .01) * 1.5, d = Math.sign(b.sp), ms = .52, L2 = 78, deck = y - 16;
    const gun = x => deck - Math.pow(Math.abs(x - b.x) / L2, 3) * 16;    // the gunwale rises to bow and stern
    // the people, cut off at the gunwale
    g.save(); g.beginPath(); g.moveTo(b.x - L2, gun(b.x - L2) - 300); g.lineTo(b.x + L2, gun(b.x + L2) - 300); for (let x = b.x + L2; x >= b.x - L2; x -= 6) g.lineTo(x, gun(x) + 2); g.closePath(); g.clip();
    if (b.pass) p4Mouse(g, b.pass, b.x + d * 8, d, P4.t * 2, false, null, null, ms, deck + 30, b.x + 3);
    p4Mouse(g, b.man, b.x - d * 52, d, P4.t * 2, false, -.6 - Math.sin(P4.t * 1.2 + b.x) * .3, null, ms, deck + 12, b.x + 9);
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
    p4Oar(g, b, d, gun, y);                                               // the oar, on the near side, rowed by the boatman
    // the eye on the bow, to see the way (mắt thuyền)
    { const ex = b.x + d * (L2 - 22), ey = gun(ex) + 20; g.fillStyle = '#f2ecde'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(ex, ey, 7, 4, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(ex + d * 1.5, ey, 2.4, 0, 6.283); g.fill(); }
    if (b.lamp) { const lx = b.x + d * (L2 - 8), ly = gun(b.x + d * L2) - 6; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(lx, gun(lx)); g.lineTo(lx, ly - 4); g.stroke();
      p4DrawLantern(g, lx, ly - 4, .9, b.hull === '#a3332a' ? '#f2c640' : '#c4473a', 4, Math.sin(P4.t * 1.6 + b.x) * .12); }
    });
  }
  g.restore();
}
// the street's gate: brick piers, a double tiled roof, the board PHỐ HUYỆN (in place of the village market's bamboo gate)
let P4_TOWN_GATE = null;
const p4TownGate = () => P4_TOWN_GATE || (P4_TOWN_GATE = part([-160, -360, 160, 6], a => {
  for (const x of [-112, 112]) { a.fk('catY2', rect(x - 16, -280, 32, 280), 2.2); a.fill('tan', rect(x - 14, -30, 28, 26)); a.fk('ash', rect(x - 20, -292, 40, 14), 1.8); }
  p4TileRoof(a, -128, 128, -322, -280, 24, 'dark');
  p4TileRoof(a, -70, 70, -350, -322, 14, 'dark');
  a.fk('red', rect(-86, -270, 172, 50), 2.2);                              // tall enough for the accents (owner: the acute stuck out)
  a.text('HẢI PHỐ', 0, -242, 23, 'yellow', '"Playfair Display", serif', 'color', '900');
}));

// the lanterns under a house's eave, drawn live so they sway a little, hung only either side of the sign board (owner: they hid it)
// what a house's board says: TRẦU CAU on the couple's house, else the neighbour's own trade
function p4TownSign(label) {
  if (!label) return '';
  if (label === 'home') return SAVE4B.house ? (SAVE4B.name || 'TRẦU CAU') : 'NHÀ BÁN';
  return label;
}
// a silk lantern hanging from (ax, ay) on a string, swung by ang: a cap, a round ribbed body, a cap, a tassel
function p4DrawLantern(g, ax, ay, s, col, len, ang) {
  g.save(); g.translate(ax, ay); g.rotate(ang); g.scale(s, s); g.strokeStyle = INK; g.lineJoin = 'round';
  g.lineWidth = 1.1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, len); g.stroke();
  const cy = len + 12;
  if (P4.glows && p4NightK() > 0) { const T = g.getTransform(), P = new DOMPoint(0, cy).matrixTransform(T); P4.glows.push([P.x, P.y, 62 * Math.hypot(T.a, T.b) * (P4.glowW ? .7 : 1), col, 0, P4.glowW || 1]); }
  g.fillStyle = 'rgba(255,214,120,.22)'; g.beginPath(); g.arc(0, cy, 15, 0, 6.283); g.fill();
  g.fillStyle = '#2a221d'; g.fillRect(-4, len, 8, 3); g.fillRect(-4, cy + 9, 8, 3);
  g.fillStyle = col; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, cy, 9, 9.5, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(42,34,29,.55)'; g.lineWidth = .9; g.beginPath(); g.ellipse(0, cy, 4.5, 9.3, 0, 0, 6.283); g.moveTo(0, cy - 9.5); g.lineTo(0, cy + 9.5); g.stroke();
  g.strokeStyle = '#a3332a'; g.lineWidth = 1.6; g.beginPath(); for (const dx of [-2, 0, 2]) { g.moveTo(dx, cy + 12); g.lineTo(dx * 1.5, cy + 22); } g.stroke();
  g.restore();
}
function p4TownFront(g, hx, hy, s, v, label) {
  const txt = p4TownSign(label);
  if (txt) { g.save(); g.translate(hx, hy); g.scale(s, s); g.fillStyle = '#f2c640'; g.font = '900 12px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 12; while (fs > 6 && g.measureText(txt).width > 84) { fs--; g.font = '900 ' + fs + 'px "Playfair Display", serif'; } g.fillText(txt, 0, -134); g.restore(); }
  const lamp = p4IsLamp(txt) && label !== 'home';
  if (txt && txt !== 'CHO THUÊ' && txt !== 'NHÀ BÁN') p4TownInterior(g, hx, hy, s, v, txt, label === 'home' ? 'betel' : lamp ? 'lamp' : null);   // the shop is open: its goods show inside (owner)
  if (lamp) P4.glowW = .45; p4TownLanterns(g, hx, hy, s, v, lamp); P4.glowW = 0;
  if (lamp) p4LanternShop(g, hx, hy, s, v);
}
function p4TownLanterns(g, hx, hy, s, v, bright = false) {
  const o = P4_TOWN_V[((v | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length], w = o.w;
  for (let x = -w + 12, i = 0; x <= w - 12; x += 22, i++) {
    if (Math.abs(x) < 58) continue;                                         // the sign board's place
    p4DrawLantern(g, hx + x * s, hy - 146 * s, s, bright ? P4_LANTERN_BRIGHT[i % P4_LANTERN_BRIGHT.length] : PL[P4_LANTERN_COLS[(v * 2 + i * 3) % P4_LANTERN_COLS.length]][0], 6 + (i % 2) * 6, Math.sin(P4.t * 1.7 + hx * .013 + i * 1.3) * .16);
  }
}
// the gate's lanterns, hung outside its board (owner: they hid HẢI PHỐ), swaying
function p4TownGateLanterns(g, gx, gy, s) {
  for (const [x, i] of [[-142, 0], [-104, 1], [104, 2], [142, 3]]) p4DrawLantern(g, gx + x * s, gy - 286 * s, s * 1.1, i % 2 ? '#f2c640' : '#c4473a', 6 + (i % 2) * 8, Math.sin(P4.t * 1.4 + i * 1.9) * .15);
}
// the counter in a shop's doorway: the ware set out on it, the seller standing behind it (owner: in the town selling is indoors)
function p4TownCounter(g, x, ware, full = false) {
  const z = .09, s = p4S(z), y = p4Y(z), open = full || P4_SAVE().stock > 0;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  g.fillStyle = '#7a4a22'; g.fillRect(-62, -34, 124, 34); g.strokeRect(-62, -34, 124, 34);
  g.fillStyle = '#b57a22'; g.fillRect(-68, -42, 136, 9); g.strokeRect(-68, -42, 136, 9);
  g.strokeStyle = 'rgba(42,34,29,.45)'; g.lineWidth = 1; g.beginPath(); for (const dx of [-30, 0, 30]) { g.moveTo(dx, -32); g.lineTo(dx, -2); } g.stroke();
  if (open) { g.strokeStyle = INK; g.lineWidth = 1.6; const col = ware === 'trau' ? '#2f6a4c' : '#e8d8a8';
    for (const dx of [-38, 0, 38]) { g.fillStyle = '#5b2f1f'; g.beginPath(); g.ellipse(dx, -42, 16, 5, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = col; g.beginPath(); g.ellipse(dx, -47, 12, 7, 0, Math.PI, 0); g.fill(); g.stroke(); } }
  else if (P4.phase === 'open') { g.fillStyle = '#a3332a'; g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.fillText('Hết hàng', 0, -52); }
  g.restore();
}

// blue-and-white ceramic on the bridge's ridge (after Chùa Cầu): a pearl in flames in the middle, a dragon either side coming to it,
// cloud curls along the rest, and a dragon head curling up at each end
function p4RidgeCeramics(g, ridge, s) {
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
function p4Oar(g, b, d, gun, y) {
  const px = b.x - d * 60, py = gun(px) + 2, k = Math.sin(P4.t * 1.6 + b.x * .01), a = .42 + k * .28, ang = -d * a;   // the top leans towards the bow (in the boatman's hands), the blade trails to the stern
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
let P4_HQ_ART = null;
const p4HoiQuanArt = () => P4_HQ_ART || (P4_HQ_ART = part([-240, -400, 240, 6], a => {
  a.fk('catY2', rect(-220, -170, 440, 170), 2.4);                           // the wall
  a.fk('dark', smooth([[-50, 0], [-50, -120], [-40, -140], [0, -150], [40, -140], [50, -120], [50, 0]]), 2.2);   // the middle door, open
  a.key(lines([[0, -150, 0, -100]]), 1);                                    // the incense coil hanging inside
  for (let r = 0; r < 4; r++) a.band('yellow', ell(0, -84 + r * 8, 24 - r * 5, 7 - r), 2.4);   // the coil, smouldering
  a.fk('red', circ(0, -58, 3), 1);
  for (const x of [-140, 140]) { a.fk('dark', rect(x - 28, -110, 56, 110), 2); a.fk('red', rect(x - 24, -106, 48, 102), 1.6); a.fk('yellow', circ(x - 10, -58, 3), .8); a.fk('yellow', circ(x + 10, -58, 3), .8); }
  for (const x of [-196, -86, 86, 196]) a.fk('red', rect(x - 10, -170, 20, 170), 2);
  a.fk('red', rect(-90, -166, 180, 28), 2.2); a.text('HỘI QUÁN', 0, -152, 17, 'yellow', '"Playfair Display", serif', 'color', '900');
  p4TileRoof(a, -224, 224, -228, -170, 22, 'green');                         // three tiers of green tiles, the middle one highest
  p4TileRoof(a, -150, 150, -290, -238, 18, 'green');
  p4TileRoof(a, -80, 80, -346, -298, 14, 'green');
  for (const [w, y] of [[224, -228], [150, -290], [80, -346]]) { a.fk('yellow', smooth([[-w + 6, y + 2], [-w - 16, y - 18], [-w + 12, y - 8], [w - 12, y - 8], [w + 16, y - 18], [w - 6, y + 2]]), 1.6); }
  for (const d of [-1, 1]) a.fk('blue', smooth([[d * 20, -354], [d * 34, -372], [d * 56, -366], [d * 70, -378], [d * 62, -358], [d * 40, -356]]), 1.4);   // dragons on the top ridge
  a.fk('red', circ(0, -366, 7), 1.4);                                       // the pearl between them
}));
// the lantern makers' house: lanterns hang thick on bamboo poles either side of its board
function p4LanternShop(g, hx, hy, s, v) {
  P4.glowW = .22;
  const o = P4_TOWN_V[((v | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length], w = o.w;
  const cols = P4_LANTERN_BRIGHT;
  for (const side of [-1, 1]) for (let row = 0; row < 3; row++) for (let k = 0; k < 4; k++) {
    const x = side * (w - 14 - k * 13 - (row % 2) * 6), y = -116 + row * 30;
    p4DrawLantern(g, hx + x * s, hy + y * s, s * .85, cols[(k * 3 + row * 5 + (side > 0 ? 2 : 0)) % cols.length], 3 + (k % 2) * 4, Math.sin(P4.t * 1.6 + k + row * 2 + side) * .16);
  }
  P4.glowW = 0;
}
// a merchant junk (the port traded with Chinese and Japanese ships): a big hull with a raised stern, an eye on the bow, two masts with
// ribbed sails; it moves slowly along the river farther out
function p4Junk(g, x, y, d) {
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
const P4_TOWN_TOOLS = ['quat', 'long', 'sach', 'goi', 'o', null, 'quat', 'goi'];
const P4_SILKS = ['#2f3f6f', '#7a2a22', '#2f5f4f', '#5a2f5f', '#a3332a', '#1f3a5a', '#6a4a1a', '#2a2a2a'];
function p4TownLook(look, seed) {
  const L = { ...(look || {}) }, r = Math.abs(Math.sin(seed * 91.7)) * 1000;
  if (['buf', 'cay', 'cuoc', 'dieu'].includes(L.tool) || !L.tool || r % 3 < 1) L.tool = P4_TOWN_TOOLS[(r | 0) % P4_TOWN_TOOLS.length];
  L.silk = P4_SILKS[((r * 7) | 0) % P4_SILKS.length]; L.pat = ((r * 13) | 0) % 3;
  if (L.tool === 'o') L.umbCol = ['#c4473a', '#f2c640', '#2f5f8f', '#c0567a'][((r * 3) | 0) % 4];
  return L;
}
// a long silk tunic (áo dài / áo the) over the body: rich colour, a gold edge at the neck and hem, a little woven pattern
// the tunic is cut on the mouse's own body (buildMouse's outline, a little larger, so none of the robe under it shows) with the long
// flaps of an áo dài falling to below the knee; p4Mouse draws it after the body and legs, before the head (hy = the body's anchor)
const P4_BODY = [[-22, -2], [-27, -24], [-19, -48], [-5, -62], [10, -61], [23, -45], [27, -20], [19, -2], [0, 5]];
function p4TownDress(g, w, moving, hy) {
  const L = w.look || {}; if (!L.silk) return;
  const sw = moving ? Math.sin(w.ph) * 4 : 0, woman = !!L.skirt, hem = -18;
  const body = smooth(P4_BODY.map(([x, y]) => [x * 1.08, (y + 28) * 1.06 - 28 + hy]));
  const skirt = [[-28, hy - 26], [28, hy - 26], [29 + sw, hem], [-29 + sw, hem]];
  g.save(); g.lineJoin = 'round'; g.strokeStyle = INK; g.fillStyle = L.silk;
  g.lineWidth = 2; g.beginPath(); skirt.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 2.4; g.fill(body); g.stroke(body);
  g.beginPath(); g.moveTo(-26.5, hy - 12); g.lineTo(26.5, hy - 12); g.lineTo(27.5 + sw, hem - 1.2); g.lineTo(-27.5 + sw, hem - 1.2); g.closePath(); g.fill();   // the skirt runs on over the body's hem line
  if (woman) { g.lineWidth = 1.6; g.beginPath(); g.moveTo(-1, hy - 8); g.lineTo(sw * .5, hem); g.stroke(); }   // the áo dài's two flaps
  g.strokeStyle = '#e2b43c'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-6, hy - 60); g.quadraticCurveTo(4, hy - 52, 15, hy - 58); g.moveTo(-27 + sw, hem - 4); g.lineTo(27 + sw, hem - 4); g.stroke();   // gold at the collar and the hem
  g.fillStyle = 'rgba(226,180,60,.55)';
  if (L.pat === 0) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-12 + (i % 3) * 12, hy - 36 + ((i / 3) | 0) * 20, 2.6, 0, 6.283); g.fill(); }
  else if (L.pat === 1) { g.strokeStyle = 'rgba(226,180,60,.6)'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(2, hy - 40 + i * 15, 6, 0, 6.283); g.stroke(); } }
  g.restore();
}
// over the head: a black turban (khăn xếp) for the men, a gold pin in the hair for the women; none under a quai thao hat
function p4TownHead(g, w) {
  const L = w.look || {}; if (!L.silk || L.hat === 'quai') return;
  if (!L.skirt) { g.fillStyle = '#1f1a17'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.ellipse(4, -142, 20, 7, -.08, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(4, -142, 14, 3.5, -.08, 0, 6.283); g.stroke(); }
  else { g.fillStyle = '#e2b43c'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(-8, -146, 3.4, 0, 6.283); g.fill(); g.stroke(); }
}
// the things the town folk carry, held at the hand (about (44, -100) when raised)
function p4TownThing(g, w, t) {
  g.save(); g.strokeStyle = INK; g.lineJoin = 'round';
  if (t === 'quat') {                                                       // a folding fan, waved a little
    const a = Math.sin(P4.t * 4 + w.seed) * .25; g.translate(50, -122); g.rotate(-.5 + a);
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
function p4TownInterior(g, hx, hy, s, v, txt, kind = null) {
  const o = P4_TOWN_V[((v | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length], w = o.w, x0 = -w + 22, x1 = w - 22, y0 = -120, y1 = -6, W = x1 - x0;
  const R = mulberry(v * 31 + txt.length * 7), ink = INK;
  g.save(); g.translate(hx, hy); g.scale(s, s); g.strokeStyle = ink; g.lineJoin = 'round';
  g.fillStyle = '#5e4330'; g.fillRect(x0, y0, W, y1 - y0);                   // the room
  g.fillStyle = 'rgba(255,214,140,.16)'; g.fillRect(x0, y0, W, (y1 - y0) * .5); // lamplight
  if (P4.glows && p4NightK() > 0) { const T = g.getTransform(), P = new DOMPoint((x0 + x1) / 2, (y0 + y1) / 2).matrixTransform(T); P4.glows.push([P.x, P.y, W * .6 * Math.hypot(T.a, T.b), '#ffcf7a', 1]); }
  g.fillStyle = '#4a2f1f'; g.fillRect(x0, y1 - 22, W, 22);                   // the floor at the back
  const shelf = (y) => { g.fillStyle = '#7a4a22'; g.fillRect(x0 + 4, y, W - 8, 5); g.lineWidth = 1.2; g.strokeRect(x0 + 4, y, W - 8, 5); };
  const C = ['#a3332a', '#2f5f8f', '#2f6a4c', '#f2c640', '#c0567a', '#e8d8a8', '#d97b2a', '#5a2f5f'];
  const K = kind || (/CAO LẦU|MÌ QUẢNG|HOÀNH THÁNH/.test(txt) ? 'noodle' : /CƠM GÀ/.test(txt) ? 'chicken' : /BÁNH VẠC/.test(txt) ? 'dumpling' : txt === 'CHÈ' ? 'sweet' : /SÁCH/.test(txt) ? 'book' : /MAY ÁO/.test(txt) ? 'tailor' : /VẢI|LỤA/.test(txt) ? 'cloth' : /GỐM/.test(txt) ? 'pot' : /THUỐC/.test(txt) ? 'herb' : /ĐÈN LỒNG/.test(txt) ? 'lamp'
    : /BẠC/.test(txt) ? 'silver' : /QUÁN NƯỚC|CHÈ/.test(txt) ? 'tea' : /GẠO|MUỐI/.test(txt) ? 'rice' : /TRẦU/.test(txt) ? 'betel' : /RƯỢU/.test(txt) ? 'wine' : /TRÀ/.test(txt) ? 'tea' : 'shop');
  g.lineWidth = 1.2;
  if (K === 'noodle' || K === 'chicken' || K === 'dumpling' || K === 'sweet') p4TownFood(g, K, txt, x0, x1, R, C);
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
    P4.glowW = .22; for (let row = 0; row < 2; row++) for (let x = x0 + 12 + row * 9, i = 0; x < x1 - 8; x += 18, i++) p4DrawLantern(g, x, -118 + row * 30, .78, P4_LANTERN_BRIGHT[(i * 3 + row * 4) % P4_LANTERN_BRIGHT.length], 4 + (i % 3) * 6, Math.sin(P4.t * 1.3 + i + row) * .08); P4.glowW = 0;
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
function p4TownFood(g, K, txt, x0, x1, R, C) {
  const W = x1 - x0, ink = INK; g.lineWidth = 1.2; g.strokeStyle = ink;
  // the stove at the back left, a pot on it, steam rising
  const sx = x0 + 22; g.fillStyle = '#7a3a24'; g.fillRect(sx - 16, -40, 32, 34); g.strokeRect(sx - 16, -40, 32, 34);
  g.fillStyle = 'rgba(230,110,40,.85)'; g.beginPath(); g.ellipse(sx, -14, 8, 5, 0, 0, 6.283); g.fill();
  if (K === 'dumpling') { for (let k = 0; k < 3; k++) { g.fillStyle = '#c9a45a'; g.fillRect(sx - 15, -52 - k * 11, 30, 10); g.strokeRect(sx - 15, -52 - k * 11, 30, 10); g.beginPath(); g.moveTo(sx - 15, -47 - k * 11); g.lineTo(sx + 15, -47 - k * 11); g.stroke(); } }   // bamboo steamers stacked
  else { g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(sx - 16, -40); g.quadraticCurveTo(sx - 18, -60, sx, -62); g.quadraticCurveTo(sx + 18, -60, sx + 16, -40); g.closePath(); g.fill(); g.stroke(); }
  for (let k = 0; k < 3; k++) { const ph = (P4.t * .6 + k / 3) % 1, a = 1 - ph; g.fillStyle = 'rgba(242,236,222,' + (.55 * a).toFixed(2) + ')'; g.beginPath(); g.arc(sx + Math.sin(P4.t * 2 + k * 2) * 5, -70 - ph * 40, 5 + ph * 7, 0, 6.283); g.fill(); }
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
// a tap on a house of the town (owner: tapping the board or the seller in the door should both work, with room around the board):
// the whole front from above the board down to the doorstep opens that shop's sheet: ours, a neighbour's, the rival's
function p4TownHouseTap(x, y) {
  if (!P4.scene) return false;
  for (const n of P4.scene.near) {
    if (n[1] !== 'shop' || n[4] !== 'home') continue;
    const s = n[2], w = P4_TOWN_V[((n[3] | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length].w * s;
    if (Math.abs(x - n[0]) > w + 6 || y < P4_Y0 - 200 * s || y > p4Y(.22)) continue;
    AU.tap(); p4HomeOpen(); return true;
  }
  return false;
}

// the town's evening (owner: "buổi tối cho đèn lung linh lên"): from 17:30 the street sinks into a deep blue dusk; the lanterns and the
// open shops glow through it, each lantern flickering a little
const p4NightK = () => P4.phase === 'night' ? 1 : Math.max(0, Math.min(1, (P4.mins - 17.5 * 60) / 100));
// soft light sprites, made once (a radial gradient per light per frame was the costly part): the pool on the light map, the halo in
// the air, the lantern's lit core; each 128 px, drawn scaled
const p4GlowSprite = (() => { const S = {}; return (key, stops) => { if (S[key]) return S[key];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return S[key] = c; }; })();
const P4_POOL = [[0, 'rgb(255,196,120)'], [.45, 'rgba(240,150,80,.45)'], [1, 'rgba(200,110,60,0)']];
const P4_HALO = [[0, 'rgb(255,205,115)'], [.35, 'rgba(255,155,60,.36)'], [1, 'rgba(255,120,40,0)']];
const P4_CORE = [[0, 'rgb(255,248,220)'], [.55, 'rgba(255,195,95,.53)'], [1, 'rgba(255,150,60,0)']];
function p4TownNight(g) {
  const k = p4NightK(); if (k <= 0) return;
  // a light map (owner: the light falls on the street, the houses and the folk): deep blue everywhere, warm white pools round every
  // lantern and lit room; multiplied over the picture, so what stands near a light keeps its colours, lit warm. Made at half size
  // (light is soft, nobody sees the difference) and stretched over the picture.
  const Q = .5, L = P4.lightMap || (P4.lightMap = document.createElement('canvas')), w = Math.ceil(cv.width * Q), h = Math.ceil(cv.height * Q);
  if (L.width !== w || L.height !== h) { L.width = w; L.height = h; }
  const lg = L.getContext('2d'), mix = n => Math.round(255 + (n - 255) * k);
  lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.fillStyle = 'rgb(' + mix(56) + ',' + mix(66) + ',' + mix(132) + ')'; lg.fillRect(0, 0, w, h);
  lg.globalCompositeOperation = 'lighter';
  const pool = p4GlowSprite('pool', P4_POOL), halo = p4GlowSprite('halo', P4_HALO), core = p4GlowSprite('core', P4_CORE);
  const flick = (x, y) => .88 + Math.sin(P4.t * 7 + x * .05) * .06 + Math.sin(P4.t * 13 + y * .07) * .04;
  const glows = (P4.glows || []).filter(([x, y, r]) => x > -r * 3 && x < cv.width + r * 3 && y > -r * 3 && y < cv.height + r * 3);   // only what can reach the screen
  for (const [x, y, r, , room, wt = 1] of glows) {
    const f = flick(x, y), R = r * (room ? 1.7 : 2.6) * f * Q, cy = (y + (room ? 0 : r * .55)) * Q, ry = R * (room ? .9 : 1.05);   // a lantern's pool reaches down onto the street
    lg.globalAlpha = (room ? .6 : .8) * k * wt; lg.drawImage(pool, x * Q - R, cy - ry, R * 2, ry * 2);
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, r, col, room, wt = 1] of glows) {                               // the glow in the air, and the lanterns themselves lit from inside
    const f = flick(x, y), R = r * f;
    ctx.globalAlpha = (room ? .25 : .45) * k * Math.sqrt(wt); ctx.drawImage(room || !/^#[0-9a-f]{6}$/i.test(col || '') ? halo : p4GlowSprite('h' + col, p4TintStops(col)), x - R, y - R, R * 2, R * 2);
    if (room) continue;
    const cr = r * .25; ctx.globalAlpha = Math.min(1, .85 * k * f * (wt < 1 ? .3 : 1)); ctx.drawImage(core, x - cr, y - cr, cr * 2, cr * 2);
  }
  ctx.restore();
}

// wooden lamp posts along the quay, an arm reaching out over the water with a silk lantern hanging from it (owner)
function p4QuayLamps(items, g, vis) {
  const s = p4S(1), yq = P4_Y0 + P4_D + 10;
  for (let x = 520; x < P4_W; x += 300) {
    if (!vis(x, 60)) continue;
    items.push({ z: 1.05, f: () => {
      g.save(); g.strokeStyle = INK; g.lineCap = 'round';
      g.lineWidth = 7 * s; g.beginPath(); g.moveTo(x, yq); g.lineTo(x, yq - 150 * s); g.stroke();
      g.strokeStyle = '#5b2f1f'; g.lineWidth = 4.2 * s; g.stroke();
      g.strokeStyle = INK; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x, yq - 146 * s); g.quadraticCurveTo(x + 18 * s, yq - 160 * s, x + 34 * s, yq - 150 * s); g.stroke();
      g.strokeStyle = '#7a4a22'; g.lineWidth = 2 * s; g.stroke();
      g.fillStyle = '#5b2f1f'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(x - 7 * s, yq - 6 * s, 14 * s, 6 * s); g.strokeRect(x - 7 * s, yq - 6 * s, 14 * s, 6 * s);
      g.fillStyle = '#c4473a'; g.beginPath(); g.moveTo(x - 6 * s, yq - 150 * s); g.lineTo(x, yq - 162 * s); g.lineTo(x + 6 * s, yq - 150 * s); g.closePath(); g.fill(); g.stroke();   // a little cap on the post
      g.restore();
      p4DrawLantern(g, x + 32 * s, yq - 150 * s, s * 1.25, ((x / 300) | 0) % 2 ? '#f2c640' : '#c4473a', 8, Math.sin(P4.t * 1.5 + x * .01) * .14);
    } });
  }
}

// hoa đăng (owner): at night groups of paper lotus lanterns drift down the river, each with a candle, bobbing, their light on the water
const P4_HOA_COLS = [['#e86a8a', '#f7b9c8'], ['#e2b43c', '#f6dc8a'], ['#c4473a', '#f09a7a'], ['#f2ece0', '#ffffff']];
function p4HoaDang(g, x0, x1, yw, yb) {
  P4.hoaHits = [];
  if (P4.hoaHold && P4.phase !== 'open') { const V = p4View(); P4.hoaCdT = -99; p4HoaTap(P4.camX + V.vw / 2, yw + 60); }   // the market closed with a lantern still in hand: it is set afloat
  const k = p4NightK(); if (k <= 0) return;
  p4HoaMine(g, k, x0, x1);
  p4HoaShared(g, k, x0, x1, yw);                                           // everyone's wishes (hoadang-net.js)
  const span = P4_W + 800, drift = P4.t * 7;
  for (let gi = 0; gi < 34; gi++) {
    const h = n => Math.abs(Math.sin(gi * 127.1 + n * 311.7) * 43758.5) % 1;
    const gx = ((gi * span / 34 + h(1) * 160 + drift) % span) - 400, gy = yw + 30 + h(2) * Math.max(60, Math.min(260, yb - yw - 110)), n = 5 + ((h(3) * 6) | 0);
    if (gx < x0 - 200 || gx > x1 + 200) continue;
    const items = [];
    for (let i = 0; i < n; i++) items.push([gx + (h(10 + i) - .5) * 150, gy + (h(30 + i) - .5) * 44, i]);
    items.sort((a, b) => a[1] - b[1]);
    for (const [x0b, y0b, i] of items) {
      const x = x0b + Math.sin(P4.t * .7 + i * 2 + gi) * 5, y = y0b + Math.sin(P4.t * 1.6 + i * 1.3 + gi) * 1.6, s = .75 + (y - yw) / 400, [c1, c2] = P4_HOA_COLS[(gi + i) % P4_HOA_COLS.length];
      g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = k; g.strokeStyle = INK; g.lineWidth = 1.3;
      g.drawImage(p4HoaSprite(c1, c2), -20, -22, 40, 30);                // the lotus on its leaf raft, printed once per colour
      P4.hoaHits.push({ x, y: y - 6 * s, r: 18 * s, id: gi * 16 + i });
      if (P4.glows) { const T = g.getTransform(), P = new DOMPoint(0, -8).matrixTransform(T), Q = new DOMPoint(0, 6).matrixTransform(T), sc = Math.hypot(T.a, T.b);
        P4.glows.push([P.x, P.y, 30 * sc, '#ffcf7a']); P4.glows.push([Q.x, Q.y, 20 * sc, '#ffcf7a', 1]); }
      g.restore();
    }
  }
}

function p4HoaSprite(c1, c2) {
  const S = p4HoaSprite.S || (p4HoaSprite.S = {}), key = c1 + c2; if (S[key]) return S[key];
  const c = document.createElement('canvas'); c.width = 160; c.height = 120; const g = c.getContext('2d');
  g.scale(4, 4); g.translate(20, 22); g.strokeStyle = INK; g.lineWidth = 1.3;
  g.fillStyle = 'rgba(255,200,110,.35)'; g.beginPath(); g.ellipse(0, 3, 16, 3.5, 0, 0, 6.283); g.fill();          // its light on the water
  g.fillStyle = '#5f7a4a'; g.beginPath(); g.ellipse(0, 1, 14, 3.4, 0, 0, 6.283); g.fill(); g.stroke();              // a leaf raft
  for (const [a, len, col] of [[-1.15, 13, c1], [1.15, 13, c1], [-.55, 15, c2], [.55, 15, c2], [0, 16, c2]]) {    // the lotus petals
    g.save(); g.rotate(a); g.fillStyle = col; g.beginPath(); g.moveTo(-4.5, 0); g.quadraticCurveTo(-5, -len * .7, 0, -len); g.quadraticCurveTo(5, -len * .7, 4.5, 0); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.ellipse(0, -10, 2, 3.5, 0, 0, 6.283); g.fill();                           // the candle flame
  return S[key] = c;
}

// thả đèn hoa đăng (owner): after dark a tap on the river sets a flower lantern afloat where the finger is, one every 2 s; it bobs
// down the river with the others, a ring of ripples where it touched the water, and fades out after a while
const P4_HOA_CD = 2, P4_HOA_LIFE = 90;
function p4HoaTap(x, y) {
  if (p4NightK() < .35) { if (P4.hoaHold) p4HoaHold(null); return false; }
  const water = y > P4_Y0 + P4_D + 38;
  if (P4.hoaHold) {                                                         // holding a lantern: set it down on the water
    if (!water) return false;
    if (S.t - (P4.hoaCdT ?? -99) < P4_HOA_CD) return true;
    P4.hoaCdT = S.t;
    const L = P4.hoaMine || (P4.hoaMine = []);
    L.push({ x, y: Math.min(y, p4View().vh - p4View().oy - 10), t0: S.t, c: P4.hoaHold.c, wish: P4.hoaHold.wish });
    if (L.length > 60) L.shift();
    p4HoaSend(L[L.length - 1]);                                             // to the server: other players see it drift (hoadang-net.js)
    // silent (owner: no sound when a lantern is set down)
    p4HoaHold(null); return true;
  }
  // a lantern under the finger: read its wish
  let best = null, bd = 1e9;
  for (const h of P4.hoaHits || []) { const d = Math.hypot(x - h.x, y - h.y); if (d < h.r + 8 && d < bd) { bd = d; best = h; } }
  if (best) { AU.tap(); p4HoaRead(best); return true; }
  if (!water || !SAVE4B.house) return false;
  if (S.t - (P4.hoaCdT ?? -99) < P4_HOA_CD) return true;
  AU.tap(); p4HoaShop(); return true;
}
function p4HoaMine(g, k, x0, x1) {
  const L = P4.hoaMine; if (!L || !L.length) return;
  P4.hoaMine = L.filter(h => S.t - h.t0 < P4_HOA_LIFE);
  const yw = P4_Y0 + P4_D + 24;
  for (const h of [...P4.hoaMine].sort((a, b) => a.y - b.y)) {
    const age = S.t - h.t0, x = h.x + age * 7 + Math.sin(P4.t * .7 + h.t0) * 4, y = h.y + Math.sin(P4.t * 1.6 + h.t0 * 3) * 1.6;
    if (x < x0 - 60 || x > x1 + 60) continue;
    const a = k * Math.min(1, age / .4, (P4_HOA_LIFE - age) / 6), s = (.75 + (y - yw) / 400) * (age < .4 ? .6 + age : 1) * (h.big || 1);
    if (age < 1.6) { const r = age / 1.6; g.save(); g.strokeStyle = 'rgba(255,236,190,' + (.7 * (1 - r) * k).toFixed(3) + ')'; g.lineWidth = 1.5;
      for (const m of [1, .6]) { g.beginPath(); g.ellipse(h.x, h.y + 2, (8 + 40 * r) * m, (2 + 9 * r) * m, 0, 0, 6.283); g.stroke(); } g.restore(); }   // the ripples where it was set down
    const [c1, c2] = P4_HOA_COLS[h.c];
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = a;
    g.drawImage(p4HoaSprite(c1, c2), -20, -22, 40, 30);
    P4.hoaHits.push({ x, y: y - 6 * s, r: 18 * s, mine: h });
    if (P4.glows) { const T = g.getTransform(), P = new DOMPoint(0, -8).matrixTransform(T), Q = new DOMPoint(0, 6).matrixTransform(T), sc = Math.hypot(T.a, T.b) * a;
      P4.glows.push([P.x, P.y, 30 * sc, '#ffcf7a']); P4.glows.push([Q.x, Q.y, 20 * sc, '#ffcf7a', 1]); }
    g.restore();
  }
}

// buying a lantern (owner): 1 quan each; then a wish is written on it, and the pointer becomes two hands holding it until it is set
// down on the river. Every lantern on the water carries a wish: the player's own, or a villager's (P4_HOA_WISH, all original)
const P4_HOA_PRICE = 600;
const P4_HOA_WISH = [
  'Cầu cho mẹ già mạnh khoẻ, sống lâu trăm tuổi.', 'Mong mùa này lúa trúng, nhà nhà no đủ.', 'Mong anh bán vải ở đầu phố để ý đến em một lần.',
  'Cầu buôn may bán đắt, tiền vào như nước sông Hoài.', 'Ước con mèo nhà bên đi lạc thật xa, xa mãi.', 'Mong thằng cu nhà tôi năm nay đỗ tú tài.',
  'Cầu cho chồng tôi bớt rượu, về nhà sớm hơn.', 'Mong khoản nợ cụ Lý tự dưng... quên mất.', 'Ước được một bát cao lầu no nê mà không ai bắt trả tiền.',
  'Cầu cho thuyền buôn của cha đi biển bình an trở về.', 'Mong vợ chồng hoà thuận, con cháu đầy nhà.', 'Cầu trời đừng mưa vào phiên chợ rằm.',
  'Mong cho cái răng sâu đừng đau nữa.', 'Ước có đôi guốc mộc mới để đi lễ chùa.', 'Cầu cho bà nội bên kia thế giới được an lành.',
  'Mong hàng xóm bớt nói xấu nhà mình.', 'Ước lũ chuột con nghe lời, đừng trèo lên bàn thờ nữa.', 'Cầu cho làng ta năm nay không lụt.',
  'Mong học được chữ để tự viết điều ước lên đèn.', 'Ước năm sau được thả hai chiếc đèn.', 'Cầu bình an cho người đi xa chưa về.',
  'Mong cô hàng chè nhớ mặt tôi, múc cho đầy bát.', 'Ước con gà mái nhà tôi đẻ trứng vàng.', 'Mong cửa hàng nhỏ của tôi mai có khách đầu tiên.',
];
const p4HoaWho = id => { const N = C4_NAMES.mouse.concat(C4_NAMES.old); return N[(id * 7 + 3) % N.length]; };
const p4Esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function p4HoaRead(h) {
  if (h.shared) { p4WishCard(h.shared); return; }
  if (h.mine) { p4WishCard({ wish: h.mine.wish, shop: SAVE4B.name || 'TRẦU CAU', mine: true, c: h.mine.c }); return; }
  p4WishCard({ wish: P4_HOA_WISH[(h.id * 5 + 1) % P4_HOA_WISH.length], shop: p4HoaWho(h.id), village: true, c: (h.id >> 4) % P4_HOA_COLS.length });
}
{
  const d = document.createElement('div'); d.id = 'p4hoa'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><h3>Thả đèn hoa đăng</h3><div id="p4hoaB"></div></div>';
  document.body.appendChild(d);
  const hands = document.createElement('div'); hands.id = 'p4hands'; hands.hidden = true; document.body.appendChild(hands);
  addEventListener('pointermove', e => { if (P4.hoaHold && e.pointerType === 'mouse') { hands.style.left = e.clientX + 'px'; hands.style.top = e.clientY + 'px'; } }, true);
}
function p4HoaShop() {
  const B = $('#p4hoaB'), ok = p4Purse() >= P4_HOA_PRICE;
  B.innerHTML = '<p>Một chiếc đèn hoa sen giấy giá <b>' + c4Money(P4_HOA_PRICE) + '</b>. Viết điều ước lên đèn rồi thả xuống sông, cầu bình an và tài lộc.</p>'
    + '<p>Trong túi: ' + c4Money(Math.round(p4Purse())) + '</p>' + (ok ? '' : '<p class="bad">Chưa đủ tiền mua đèn.</p>')
    + '<div class="row">' + (ok ? '<button class="btn" id="p4hoaBuy">Mua một đèn</button>' : '') + '<button class="btn alt" id="p4hoaX">Thôi</button></div>';
  $('#p4hoaX').onclick = () => p4Sheets(null);
  if (ok) $('#p4hoaBuy').onclick = () => {
    p4Spend(P4_HOA_PRICE); p4Hud(); AU.tap();
    B.innerHTML = '<p>Viết điều ước lên đèn:</p><textarea id="p4hoaW" maxlength="90" rows="3" placeholder="Cầu cho…"></textarea><div class="row"><button class="btn" id="p4hoaOk">Viết xong</button></div>';
    const ta = $('#p4hoaW'); setTimeout(() => ta.focus(), 50);
    $('#p4hoaOk').onclick = () => { const w = ta.value.trim() || 'Cầu bình an.'; if (p4HoaBad(w)) { toast('Lời chúc có chữ không đẹp, viết lại nhé.', 2.6); return; } p4Sheets(null); p4HoaHold({ wish: w, c: (P4.hoaN = (P4.hoaN || 0) + 1) % P4_HOA_COLS.length }); };
  };
  p4Sheets('p4hoa');
}
// two hands cupping the lantern: they follow the mouse on a computer; on a phone they wait low in the middle of the screen, over the river
function p4HoaHold(h) {
  P4.hoaHold = h; const el = $('#p4hands');
  document.body.classList.toggle('p4holding', !!h);
  if (!h) { el.hidden = true; return; }
  const [c1, c2] = P4_HOA_COLS[h.c];
  el.innerHTML = p4HandsSvg(c1, c2);
  el.hidden = false;
  if (!matchMedia('(pointer: fine)').matches) el.classList.add('touch');
  else { el.classList.remove('touch'); if (!el.style.top) { el.style.left = '50%'; el.style.top = '75%'; } }
}

// the two hands holding a lantern (owner chose the plainest: two round mittens with a thumb bump, a red cuff, the lantern in the palms)
function p4HandsSvg(c1, c2) {
  const I = '#2a1d16', cx = 100, y = 140, k = 1.4;
  const pet = (a, len, col) => '<path transform="rotate(' + a + ' ' + cx + ' ' + y + ')" d="M' + (cx - 6 * k) + ' ' + y + ' Q' + (cx - 7 * k) + ' ' + (y - len * .7 * k) + ' ' + cx + ' ' + (y - len * k) + ' Q' + (cx + 7 * k) + ' ' + (y - len * .7 * k) + ' ' + (cx + 6 * k) + ' ' + y + ' Z" fill="' + col + '" stroke="' + I + '" stroke-width="2" stroke-linejoin="round"/>';
  const mit = '<path d="M100 196 L58 196 C52 170 40 150 40 128 C40 114 52 110 58 120 C58 104 66 94 80 94 C94 94 100 104 100 116 Z" fill="#efc39b" stroke="' + I + '" stroke-width="3" stroke-linejoin="round"/>'
    + '<path d="M58 196 L60 178 L100 178 L100 196 Z" fill="#a3332a" stroke="' + I + '" stroke-width="3" stroke-linejoin="round"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><defs><radialGradient id="p4hg"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".8"/><stop offset=".5" stop-color="#ffbf6a" stop-opacity=".28"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs>'
    + '<circle cx="100" cy="110" r="80" fill="url(#p4hg)"/>' + mit + '<g transform="translate(200 0) scale(-1 1)">' + mit + '</g>'
    + '<path d="M100 144 L100 196" stroke="' + I + '" stroke-width="2"/>'
    + '<ellipse cx="' + cx + '" cy="' + (y + 1) + '" rx="' + 30 * k + '" ry="' + 7 * k + '" fill="#5f7a4a" stroke="' + I + '" stroke-width="2"/>'
    + pet(-68, 26, c1) + pet(68, 26, c1) + pet(-34, 31, c2) + pet(34, 31, c2) + pet(0, 34, c2)
    + '<ellipse cx="' + cx + '" cy="' + (y - 24 * k) + '" rx="' + 3.6 * k + '" ry="' + 6.5 * k + '" fill="#fff4c8"/></svg>';
}

// a halo in a lantern's own colour: warm white in the middle, the silk's colour around it
function p4TintStops(col) {
  const n = parseInt(col.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, mix = (a, t) => Math.round(a + (255 - a) * t);
  return [[0, 'rgb(255,236,190)'], [.3, 'rgba(' + mix(r, .35) + ',' + mix(g, .35) + ',' + mix(b, .35) + ',.55)'], [1, 'rgba(' + r + ',' + g + ',' + b + ',0)']];
}

// the neighbours' trades along the street, each once (the board's words also decide what is set out inside, p4TownInterior)
const P4_SHOP_NAMES = ['VẢI LỤA', 'LỤA TƠ TẰM', 'ĐỒ GỐM', 'GỐM BÁT TRÀNG', 'CAO LẦU', 'MÌ QUẢNG', 'HOÀNH THÁNH', 'CƠM GÀ', 'BÁNH VẠC', 'CHÈ',
  'QUÁN NƯỚC', 'TRÀ SEN', 'RƯỢU NẾP', 'TẠP HOÁ', 'HÀNG XÉN', 'THỢ BẠC', 'VÀNG BẠC', 'GẠO MUỐI', 'GẠO TÁM THƠM', 'THUỐC BẮC', 'THUỐC NAM',
  'SÁCH VỞ', 'HIỆU SÁCH', 'MAY ÁO', 'MAY ÁO DÀI', 'QUẠT GIẤY', 'NÓN LÁ', 'HƯƠNG TRẦM', 'TRANH ĐÔNG HỒ', 'GIẤY BÚT'];
// the lantern makers: the only trade that comes back along the street, never under the same name
const P4_LAMP_NAMES = ['ĐÈN LỒNG', 'LỒNG ĐÈN PHÚC', 'ĐÈN HOA SEN', 'ĐÈN LỒNG TÀI LỘC', 'LỒNG ĐÈN AN KHANG'];
const p4IsLamp = txt => /ĐÈN|LỒNG/.test(txt || '');
