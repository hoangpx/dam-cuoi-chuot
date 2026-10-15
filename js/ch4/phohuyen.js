/* Phố huyện (owner, 2026-10-14: "bây giờ buôn bán trên phố huyện, tạo thử khung cảnh phố huyện"): the couple's next market is the
   district town. A first look only: with ?phohuyen in the address (or C4.town = true) the lane behind the stalls becomes a town street:
   a row of narrow two-storey shophouses wall to wall (each its own colours, a sign board, a balcony, wooden shutters), oil lamps on
   posts, a brick-paved street; far behind, the roofs of the town, the district office's gate with its flag, a watchtower and a temple.
   Nothing in play changes yet. */
C4.town = /[?&]phohuyen/.test(location.search);

// the shophouses: half width, walls, shutters, roof, the board's words
const C4_TOWN_V = [
  { w: 88, wall: 'yellow', shut: 'green', roof: 'red', sign: 'THUỐC BẮC', board: 'red', arch: true },
  { w: 96, wall: 'cream', shut: 'brown', roof: 'red', sign: 'VẢI VÓC', board: 'dark', balc: true },
  { w: 80, wall: 'rose', shut: 'teal', roof: 'brown', sign: 'TẠP HOÁ', board: 'green' },
  { w: 92, wall: 'ash', shut: 'red', roof: 'red', sign: 'ĐỒ GỐM', board: 'blue', balc: true },
  { w: 84, wall: 'white', shut: 'blue', roof: 'brown', sign: 'QUÁN NƯỚC', board: 'red', arch: true },
  { w: 90, wall: 'tan', shut: 'yellow', roof: 'red', sign: 'THỢ BẠC', board: 'dark', balc: true },
  { w: 86, wall: 'lilac', shut: 'brown', roof: 'red', sign: 'SÁCH VỞ', board: 'green' },
  { w: 94, wall: 'cream', shut: 'red', roof: 'brown', sign: 'GẠO MUỐI', board: 'brown', arch: true },
];
const C4_TOWN_ART = [];
function c4TownArt(v) {
  v = ((v | 0) % C4_TOWN_V.length + C4_TOWN_V.length) % C4_TOWN_V.length;
  if (C4_TOWN_ART[v]) return C4_TOWN_ART[v];
  const o = C4_TOWN_V[v], w = o.w, H = 250, top = -H, mid = -128;
  return (C4_TOWN_ART[v] = part([-w - 14, top - 74, w + 14, 6], a => {
    // walls, the floor band between the storeys, pilasters at both ends
    a.fk(o.wall, rect(-w, top, w * 2, H), 2.4);
    a.fk('brown', rect(-w, mid - 10, w * 2, 12), 1.8);
    for (const x of [-w, w - 12]) a.fk(o.wall === 'white' ? 'ash' : 'white', rect(x, top, 12, H), 1.6);
    // upstairs: two windows (arched or square) with shutters, maybe a balcony with a railing
    for (const cx of [-w / 2, w / 2]) {
      const ww = 30, wh = 56, y = top + 34;
      const win = o.arch ? smooth([[cx - ww / 2, y + wh], [cx - ww / 2, y + 14], [cx - ww / 2 + 2, y + 2], [cx, y - 6], [cx + ww / 2 - 2, y + 2], [cx + ww / 2, y + 14], [cx + ww / 2, y + wh]]) : rect(cx - ww / 2, y, ww, wh);
      a.fk('dark', win, 2);
      a.fk(o.shut, rect(cx - ww / 2 - 14, y + 4, 13, wh - 4), 1.6); a.fk(o.shut, rect(cx + ww / 2 + 1, y + 4, 13, wh - 4), 1.6);
      a.key(lines([[cx - ww / 2 - 14, y + 18, cx - ww / 2 - 1, y + 18], [cx - ww / 2 - 14, y + 32, cx - ww / 2 - 1, y + 32], [cx + ww / 2 + 1, y + 18, cx + ww / 2 + 14, y + 18], [cx + ww / 2 + 1, y + 32, cx + ww / 2 + 14, y + 32]]), 1);
    }
    if (o.balc) {
      a.fk('brown', rect(-w + 6, mid - 22, w * 2 - 12, 8), 1.6);
      const bal = []; for (let x = -w + 14; x < w - 8; x += 10) bal.push([x, mid - 54, x, mid - 22]);
      a.key(lines([[-w + 6, mid - 56, w - 6, mid - 56], ...bal]), 1.4);
    }
    // the sign board over the shop front, the shop's name on it
    a.fk(o.board, rect(-w + 14, mid + 6, w * 2 - 28, 26), 2);
    a.text(o.sign, 0, mid + 20, 15, o.board === 'dark' || o.board === 'brown' || o.board === 'blue' || o.board === 'green' || o.board === 'red' ? 'yellow' : 'dark', '"Playfair Display", serif', 'color', '900');
    // downstairs: the open shop front with folding wooden shutter panels (cửa bức bàn), a step
    a.fk('dark', rect(-w + 18, mid + 40, w * 2 - 36, -mid - 40), 2);
    const pn = Math.max(4, Math.round((w * 2 - 36) / 22)), pw = (w * 2 - 36) / pn;
    for (let i = 0; i < pn; i++) { if (i > 0 && i < pn - 1 && i % 3 !== 0) continue; const x = -w + 18 + i * pw; a.fk('brown', rect(x + 1, mid + 42, pw - 2, -mid - 44), 1.4); a.key(lines([[x + pw / 2, mid + 50, x + pw / 2, -8]]), .9); }
    a.fk('ash', rect(-w + 10, -6, w * 2 - 20, 6), 1.6);
    // the roof: a low tiled slope seen from the street, a ridge with upturned ends
    const ry = top + 2, roof = smooth([[-w - 12, ry], [-w - 4, ry - 18], [-w + 10, ry - 46], [w - 10, ry - 46], [w + 4, ry - 18], [w + 12, ry]]);
    a.fk(o.roof, roof, 2.4);
    for (let r = 0; r < 3; r++) { const y = ry - 10 - r * 12, hw = w + 6 - r * 6, t = []; for (let x = -hw; x <= hw; x += 12) t.push([x, y, x - 1, y + 9]); a.key(lines([[-hw, y, hw, y], ...t]), 1); }
    a.fk('dark', smooth([[-w + 6, ry - 44], [-w - 6, ry - 64], [-w + 18, ry - 54], [w - 18, ry - 54], [w + 6, ry - 64], [w - 6, ry - 44]]), 1.8);
  }));
}
// an oil street lamp on a post
let C4_LAMP_ART = null;
const c4LampArt = () => C4_LAMP_ART || (C4_LAMP_ART = part([-30, -250, 30, 6], a => {
  a.fk('dark', rect(-4, -200, 8, 200), 1.8);
  a.fk('dark', rect(-12, -8, 24, 10), 1.6);
  a.fk('dark', lines([[0, -196, 16, -206]]), 2);
  a.fk('yellow', smooth([[-14, -214], [14, -214], [10, -186], [-10, -186]]), 2);
  a.fk('dark', smooth([[-18, -214], [0, -232], [18, -214]]), 2);
  a.key(lines([[0, -214, 0, -188]]), 1);
}));
// far off: the district office's gate (huyện đường) with a flag pole, a watchtower, a temple roof, the roofs of the town
let C4_TOWN_FAR = null;
function c4TownFarArt() {
  if (C4_TOWN_FAR) return C4_TOWN_FAR;
  return (C4_TOWN_FAR = {
    gate: part([-180, -330, 180, 6], a => {
      a.fk('white', rect(-150, -150, 300, 150), 2.4);
      a.fk('dark', smooth([[-40, 0], [-40, -90], [-30, -112], [0, -122], [30, -112], [40, -90], [40, 0]]), 2.2);
      a.fk('red', smooth([[-172, -150], [-150, -182], [-110, -214], [110, -214], [150, -182], [172, -150]]), 2.4);
      a.fk('red', smooth([[-100, -214], [-84, -244], [-60, -262], [60, -262], [84, -244], [100, -214]]), 2.2);
      a.fk('dark', smooth([[-62, -262], [-80, -280], [-50, -270], [50, -270], [80, -280], [62, -262]]), 1.8);
      a.fk('yellow', rect(-60, -200, 120, 30), 2); a.text('HUYỆN ĐƯỜNG', 0, -185, 15, 'dark', '"Playfair Display", serif', 'color', '900');
      a.fk('dark', rect(132, -320, 6, 320), 1.6); a.fk('yellow', smooth([[138, -318], [176, -308], [166, -298], [178, -288], [138, -284]]), 1.8);
    }),
    tower: part([-70, -330, 70, 6], a => {
      a.key(lines([[-40, 0, -20, -230], [40, 0, 20, -230], [-34, -60, 34, -60], [-28, -130, 28, -130], [-40, 0, 28, -130], [40, 0, -28, -130]]), 2.4);
      a.fk('brown', rect(-30, -262, 60, 34), 2);
      a.fk('straw', smooth([[-46, -262], [0, -318], [46, -262]]), 2.2);
    }),
    temple: part([-200, -230, 200, 6], a => {
      a.fk('cream', rect(-150, -110, 300, 110), 2.2);
      for (const x of [-120, -60, 0, 60, 120]) a.fk('red', rect(x - 6, -110, 12, 110), 1.6);
      a.fk('dark', smooth([[-190, -110], [-160, -150], [-120, -176], [120, -176], [160, -150], [190, -110], [196, -130], [150, -112]]), 2.4);
      a.fk('green', smooth([[-128, -176], [-150, -200], [-110, -190], [110, -190], [150, -200], [128, -176]]), 2);
    }),
    roofs: part([-260, -130, 260, 6], a => {
      for (let i = 0; i < 6; i++) { const x = -230 + i * 92, h = 70 + (i % 3) * 18; a.fk(i % 2 ? 'cream' : 'white', rect(x, -h, 84, h), 1.8); a.fk(i % 3 === 1 ? 'brown' : 'red', smooth([[x - 8, -h], [x + 6, -h - 24], [x + 78, -h - 24], [x + 92, -h]]), 1.8); }
    }),
  });
}
// the town's rows (called from c4DayLook): shophouses wall to wall with a lamp now and then, far landmarks
function c4TownScene(rs) {
  const near = [], far = [];
  let x = 60, i = 0;
  while (x < C4_W + 200) {
    const v = (rs() * C4_TOWN_V.length) | 0, w = C4_TOWN_V[v].w * .7;
    near.push([x + w, 'shop', .7, v]); x += w * 2 + 4; i++;
    if (i % 4 === 0) { near.push([x + 10, 'lamp', .8]); x += 26; }
  }
  for (let fx = -100; fx < 3200; fx += 300 + rs() * 120) far.push([fx, 'roofs', .85]);
  far.push([700, 'gate', 1], [1500, 'tower', 1.05], [2300, 'temple', 1.1], [1100, 'bigtree', .75], [2900, 'tower', .95]);
  return { far, near };
}
const c4TownPart = k => k === 'shop' ? null : k === 'lamp' ? c4LampArt() : k === 'bigtree' ? WP.bigTree : c4TownFarArt()[k];
// the brick paving of the street, drawn over the lane's earth
function c4TownPaving(g, cx, vw) {
  g.save(); g.strokeStyle = 'rgba(91,47,31,.28)'; g.lineWidth = 1.3;
  const rows = 9; let yPrev = C4_Y0 - 4;
  for (let r = 1; r <= rows; r++) {
    const y = C4_Y0 - 4 + (C4_D + 10) * r / rows; g.beginPath(); g.moveTo(cx - 50, y); g.lineTo(cx + vw + 50, y); g.stroke();
    const step = 34 + r * 5, off = (r % 2) * step / 2;
    g.beginPath(); for (let x = Math.floor((cx - 60) / step) * step + off; x < cx + vw + 60; x += step) { g.moveTo(x, yPrev); g.lineTo(x, y); } g.stroke();
    yPrev = y;
  }
  g.fillStyle = 'rgba(91,47,31,.12)'; g.fillRect(cx - 50, C4_Y0 - 10, vw + 100, 8);   // the kerb along the shop fronts
  g.restore();
}
// the street's gate: brick piers, a double tiled roof, the board PHỐ HUYỆN (in place of the village market's bamboo gate)
let C4_TOWN_GATE = null;
const c4TownGate = () => C4_TOWN_GATE || (C4_TOWN_GATE = part([-150, -350, 150, 6], a => {
  for (const x of [-112, 112]) { a.fk('ash', rect(x - 16, -280, 32, 280), 2.2); for (let y = -260; y < 0; y += 22) a.key(lines([[x - 16, y, x + 16, y]]), .9); a.fk('white', rect(x - 20, -292, 40, 14), 1.8); }
  a.fk('red', smooth([[-150, -280], [-128, -306], [-100, -322], [100, -322], [128, -306], [150, -280], [0, -286]]), 2.4);
  for (let i = 0; i < 10; i++) a.key(lines([[-112 + i * 25, -318, -118 + i * 26, -288]]), .9);
  a.fk('red', smooth([[-80, -322], [-64, -340], [64, -340], [80, -322]]), 2);
  a.fk('dark', smooth([[-70, -340], [-86, -352], [-50, -346], [50, -346], [86, -352], [70, -340]]), 1.6);
  a.fk('yellow', rect(-86, -262, 172, 40), 2.2);
  a.text('PHỐ HUYỆN', 0, -242, 24, 'dark', '"Playfair Display", serif', 'ink', 900);
}));
