/* Chương I · Đám Cưới Chuột — items, the wedding party and the level list.
   Each tranh file (tranh1-…js) defines its own characters and fills LEVELS[i]. */
/* ---------- items ---------- */
const ITEMS = {
  fish: { name: 'cá', part: ITEM.fish, s: .9, cy: 0 },
  cau: { name: 'trầu cau', part: WP.basket, s: .8, cy: -6 },
  gao: { name: 'gạo nếp', part: MP.gao, s: .8, cy: -15 },
  ladong: { name: 'lá dong', part: MP.ladong, s: 1, cy: 0 },
  banh: { name: 'bánh chưng', part: MP.banh, s: 1, cy: -11 },
};
const PLN = { red: 'Đỏ', green: 'Xanh', yellow: 'Vàng' }, PKEY = { red: '4', green: '5', yellow: '6' };
const PCOL = { red: '#a3332a', green: '#2f6a4c', yellow: '#f2c640' };
const PBTN = { red: '#bRed', green: '#bGreen', yellow: '#bYellow' };


/* ---------- game state ---------- */
Object.assign(S, { parasol: false, drumT: 0, kenT: 0, caught: 0, catcher: null, cp: 0, inv: [], hold: false, plate: null, pads: {}, catches: 0, gotSecret: false, ents: [], gaps: [], tufts: [], fx: [], wallT: 0, lastHint: -99, endT: 0, told: {}, reset: false });
const groom = { x: 160, vx: 0, face: 1, ph: 0, moving: false };
const followers = [
  { m: MICE.a, item: 'parasol', gap: 100 }, { m: MICE.b, item: 'drum', gap: 196 },
  { m: MICE.c, item: 'ken', gap: 290 },
];
let L = null, PAPER = null, camX = 0;
const members = () => [groom, ...followers];
const has = i => S.inv.includes(i);
const hasAll = list => list.every(has);
function takeItems(list) { for (const i of list) { const k = S.inv.indexOf(i); if (k >= 0) S.inv.splice(k, 1); } }
function drawItem(g, i, x, y, s = 1, rot = 0) { const it = ITEMS[i]; dp(g, it.part, x, y - it.cy * it.s * s, rot, it.s * s, it.s * s); }
function drawBubble(g, x, y, items) {
  const w = items.length * 40 + 18, h = 48;
  g.save(); g.translate(x, y);
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-w / 2 + 8, -h); g.lineTo(w / 2 - 8, -h); g.quadraticCurveTo(w / 2, -h, w / 2, -h + 8); g.lineTo(w / 2, -8); g.quadraticCurveTo(w / 2, 0, w / 2 - 8, 0);
  g.lineTo(8, 0); g.lineTo(0, 12); g.lineTo(-8, 0); g.lineTo(-w / 2 + 8, 0); g.quadraticCurveTo(-w / 2, 0, -w / 2, -8); g.lineTo(-w / 2, -h + 8); g.quadraticCurveTo(-w / 2, -h, -w / 2 + 8, -h);
  g.closePath(); g.fill(); g.stroke();
  items.forEach((it, k) => drawItem(g, it, -w / 2 + 29 + k * 40, -h / 2, .8));
  g.restore();
}
function sparkle(g, x, y, s, a) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(S.t * .6); g.fillStyle = INK; g.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .26 : s, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  g.closePath(); g.fill(); g.restore();
}


const LEVELS = [];
