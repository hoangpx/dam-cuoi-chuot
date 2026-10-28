/* Chương XI · Dinh cụ Bá (owner 2026-10-27: "nhà cụ Bá Kiến phải riêng một khu, hoành tráng, có người ở, có hàng rào, hoa hoét các
   kiểu"): a walled compound reached through a roofed gate in the hamlet (tile (22,4) there). Inside: the big brick house with a tiled
   roof, red lanterns and a plaque, two side houses (nhà ngang) where the servants live, a courtyard of old bricks with blue-and-white
   pots of dwarf trees, flower beds, two lotus ponds, fruit trees, a well. Cụ Bá, bà Cả, bà Ba and Lý Cường live in the big house; the
   servants sweep and water the flowers all day. Also here: the brick walls ('G'), the bamboo fences round every house ('R') and the
   flower beds ('y') wherever they are. */
const C11_DINHBA = (() => {
  const m = c11Grid(26, 18);
  c11Fill(m, 1, 1, 24, 1, 'G'); c11Fill(m, 1, 16, 24, 16, 'G'); c11Fill(m, 1, 1, 1, 16, 'G'); c11Fill(m, 24, 1, 24, 16, 'G');
  m[16][13] = 'p'; m[17][13] = 'E';
  c11Footprint(m, 'dinhba');
  c11Fill(m, 6, 8, 18, 12, 'q'); c11Fill(m, 13, 13, 13, 15, 'p'); c11Fill(m, 8, 7, 16, 7, 'q');
  c11Fill(m, 3, 13, 9, 14, 'y'); c11Fill(m, 17, 13, 22, 14, 'y'); c11Fill(m, 2, 11, 4, 11, 'y'); c11Fill(m, 21, 11, 23, 11, 'y');
  c11Fill(m, 2, 3, 5, 5, 'w'); c11Fill(m, 19, 3, 22, 5, 'w');
  for (const [x, y] of [[6, 8], [18, 8], [6, 12], [18, 12], [10, 12], [16, 12]]) m[y][x] = 'P';
  for (const [x, y] of [[2, 7], [23, 7], [2, 14], [23, 14], [7, 2], [18, 2], [11, 14], [15, 14]]) if (m[y][x] === 'g') m[y][x] = 't';
  m[10][21] = 'K';
  return m;
})();
C11_AREAS.dinhba = { id: 'dinhba', name: 'Dinh cụ Bá', map: C11_DINHBA, treeAt: { '2,7': 'cau', '23,7': 'cau', '2,14': 'dao', '23,14': 'dao', '7,2': 'xoai', '18,2': 'xoai', '11,14': 'phuong', '15,14': 'phuong' }, houses: c11HouseList('dinhba'), stalls: [],
  exits: { '13,17': ['lang', 22.5, 7, '↓ Xóm làng'] }, lane: [[[[13, 17.5], [13, 12.8]], .7]], pond: { x: 3.6, y: 4.1, rx: 1.1, ry: .7 } };
delete C11_PROP.I;                                                                  // the đình's gate pillars are drawn by c11Extras3
C11_BEASTS.dinhba = [['cho', 12.5, 13.6], ['meo', 9.5, 8.6], ['ga', 20.5, 12.6, '#c119a5a'], ['trong', 5.5, 12.6]];
C11_SPOTS.dinhba = [[13, 13], [8, 10], [17, 10], [12, 9], [5, 12], [20, 12]];
C11_JOBS.dinhba = { quet: [[7, 8, 18, 11]], tuoi: [[3, 12, 9, 12], [17, 12, 22, 12]], ngoi: [[9, 8, 11, 9], [14, 8, 16, 9]], nau: [[2, 9, 2, 10], [23, 9, 23, 10]] };

/* art: the grand gate, a brick wall block, a blue-and-white pot with a dwarf tree, a red lantern */
let C11ART4 = null;
function c11Art4() {
  if (C11ART4) return C11ART4;
  const R = Math.max(2, RES);
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  const bricks = (g, x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#d48a5a'); gr.addColorStop(.5, '#b0623a'); gr.addColorStop(1, '#7a3c22'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.strokeStyle = 'rgba(240,220,190,.45)'; g.lineWidth = .7; for (let y = y1 - 7, i = 0; y > y0; y -= 7, i++) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); for (let x = x0 + (i % 2) * 7; x < x1; x += 14) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 7); g.stroke(); } } };
  const roof = (g, x0, x1, yb, h, curl) => { const p = new Path2D(); p.moveTo(x0, yb); p.lineTo(x0 + h * .9, yb - h); p.lineTo(x1 - h * .9, yb - h); p.lineTo(x1, yb); p.closePath(); const gr = g.createLinearGradient(0, yb - h, 0, yb); gr.addColorStop(0, '#c0664a'); gr.addColorStop(1, '#7a3324'); g.fillStyle = gr; g.fill(p); g.strokeStyle = 'rgba(60,20,12,.4)'; g.lineWidth = .7; for (let x = x0 + 6; x < x1 - 4; x += 7) { g.beginPath(); g.moveTo(x + (x < (x0 + x1) / 2 ? h * .4 : -h * .4), yb - h + 2); g.lineTo(x, yb); g.stroke(); } const rg = g.createLinearGradient(0, yb - h - 6, 0, yb - h + 2); rg.addColorStop(0, '#e4e0d4'); rg.addColorStop(1, '#8a867a'); g.fillStyle = rg; g.fillRect(x0 + h * .8, yb - h - 5, x1 - x0 - h * 1.6, 6); if (curl) for (const sg of [-1, 1]) { const cx = sg < 0 ? x0 : x1; g.fillStyle = '#7a3324'; g.beginPath(); g.moveTo(cx - sg * 10, yb - 2); g.quadraticCurveTo(cx + sg * 6, yb - 2, cx + sg * 10, yb - 16); g.lineTo(cx + sg * 4, yb - 10); g.closePath(); g.fill(); } };
  const gate = mk([-170, -280, 170, 10], g => {
    g.fillStyle = 'rgba(14,30,18,.35)'; g.beginPath(); g.ellipse(0, 4, 160, 9, 0, 0, 6.283); g.fill();
    for (const sg of [-1, 1]) { bricks(g, sg * 150 - (sg > 0 ? 50 : 0), -120, sg * 150 + (sg > 0 ? 0 : 50), 0); roof(g, sg > 0 ? 96 : -158, sg > 0 ? 158 : -96, -120, 18, false); }
    for (const sg of [-1, 1]) { bricks(g, sg * 74 - 20, -200, sg * 74 + 20, 0); const cg = g.createLinearGradient(sg * 74 - 24, 0, sg * 74 + 24, 0); cg.addColorStop(0, '#e8e2d4'); cg.addColorStop(1, '#9a9488'); g.fillStyle = cg; g.fillRect(sg * 74 - 24, -212, 48, 12); }
    const dg = g.createLinearGradient(-54, 0, 54, 0); dg.addColorStop(0, '#c84a34'); dg.addColorStop(1, '#6a1e14'); g.fillStyle = dg; g.fillRect(-54, -150, 108, 150); g.strokeStyle = 'rgba(40,10,6,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -150); g.lineTo(0, 0); g.stroke();
    g.fillStyle = '#e8b840'; for (let y = -136; y < 0; y += 22) for (const x of [-40, -20, 20, 40]) { g.beginPath(); g.arc(x, y, 2.2, 0, 6.283); g.fill(); }
    bricks(g, -54, -200, 54, -150); g.fillStyle = '#8a2a1c'; g.fillRect(-46, -194, 92, 36); g.strokeStyle = '#e8b840'; g.lineWidth = 2; g.strokeRect(-42, -190, 84, 28);
    roof(g, -120, 120, -212, 46, true); roof(g, -70, 70, -258, 22, true);
  });
  const wall = mk([-36, -84, 36, 6], g => { bricks(g, -32, -66, 32, 0); const cg = g.createLinearGradient(0, -78, 0, -62); cg.addColorStop(0, '#c0664a'); cg.addColorStop(1, '#6a2a1c'); g.fillStyle = cg; g.beginPath(); g.moveTo(-36, -64); g.lineTo(-30, -78); g.lineTo(30, -78); g.lineTo(36, -64); g.closePath(); g.fill(); g.fillStyle = 'rgba(14,30,18,.3)'; g.fillRect(-32, 0, 64, 5); });
  const pot = mk([-30, -90, 30, 6], g => {
    g.fillStyle = 'rgba(14,30,18,.35)'; g.beginPath(); g.ellipse(2, 3, 24, 5, 0, 0, 6.283); g.fill();
    const pg = g.createLinearGradient(-22, 0, 22, 0); pg.addColorStop(0, '#ffffff'); pg.addColorStop(.6, '#d8dce4'); pg.addColorStop(1, '#8a92a4'); g.fillStyle = pg; g.beginPath(); g.moveTo(-20, -30); g.quadraticCurveTo(-26, -12, -14, 0); g.lineTo(14, 0); g.quadraticCurveTo(26, -12, 20, -30); g.closePath(); g.fill();
    g.strokeStyle = '#2a4a8a'; g.lineWidth = 1.4; g.beginPath(); for (let x = -18; x <= 18; x += 6) { g.moveTo(x, -22); g.quadraticCurveTo(x + 3, -16, x, -10); } g.stroke(); g.fillStyle = '#2a4a8a'; g.fillRect(-21, -32, 42, 3);
    const tg = g.createLinearGradient(-6, 0, 6, 0); tg.addColorStop(0, '#a87a52'); tg.addColorStop(1, '#4a2c16'); g.strokeStyle = tg; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(-12, -44, 10, -52, -2, -66); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-2, -50); g.quadraticCurveTo(10, -54, 16, -60); g.stroke();
    for (const [x, y, r] of [[-6, -70, 11], [14, -62, 8], [-14, -58, 8], [4, -80, 8]]) { const gr = g.createRadialGradient(x - r * .4, y - r * .4, 0, x, y, r); gr.addColorStop(0, '#9ccf6a'); gr.addColorStop(.6, '#3f7a3a'); gr.addColorStop(1, '#1e4422'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, 6.283); g.fill(); }
  });
  /* a gate pillar of the đình (cột đồng trụ): a stepped stone plinth, a square shaft with a carved couplet panel, a moulded capital, a
     stone lantern under a little curled tiled roof, a lotus bud on top (owner: "2 cổng đình đang chưa đẹp lắm") */
  const stone = (g, x0, y0, x1, y1, l = 72) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, `hsl(40,8%,${l + 14}%)`); gr.addColorStop(.45, `hsl(40,7%,${l}%)`); gr.addColorStop(1, `hsl(36,9%,${l - 30}%)`); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = `hsla(40,10%,${l + 20}%,.8)`; g.fillRect(x0, y0, x1 - x0, 1.6); g.fillStyle = 'rgba(30,26,20,.35)'; g.fillRect(x0, y1 - 1.6, x1 - x0, 1.6); };
  const pillar = mk([-40, -262, 40, 8], g => {
    g.fillStyle = 'rgba(14,30,18,.35)'; g.beginPath(); g.ellipse(4, 4, 34, 7, 0, 0, 6.283); g.fill();
    stone(g, -26, -10, 26, 2, 66); stone(g, -21, -20, 21, -10, 70); stone(g, -17, -26, 17, -20, 74);
    stone(g, -12, -168, 12, -26, 76);
    const pn = g.createLinearGradient(-7, 0, 7, 0); pn.addColorStop(0, '#9a2a1e'); pn.addColorStop(1, '#5a1610'); g.fillStyle = pn; g.fillRect(-6, -150, 12, 104);
    g.fillStyle = '#e8c050'; for (let y = -144; y < -50; y += 12) { g.beginPath(); g.ellipse(0, y, 2.4, 3.4, 0, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(30,26,20,.4)'; g.lineWidth = .8; g.strokeRect(-8.5, -153, 17, 110);
    stone(g, -16, -176, 16, -168, 70); stone(g, -19, -182, 19, -176, 74); stone(g, -14, -186, 14, -182, 78);
    stone(g, -12, -212, 12, -186, 70); g.fillStyle = 'rgba(24,18,12,.85)'; g.fillRect(-6, -207, 12, 16);
    const gl = g.createRadialGradient(0, -199, 0, 0, -199, 9); gl.addColorStop(0, 'rgba(255,200,110,.75)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.fillRect(-6, -207, 12, 16);
    const rf = g.createLinearGradient(0, -232, 0, -212); rf.addColorStop(0, '#c0664a'); rf.addColorStop(1, '#6a2a1c'); g.fillStyle = rf; g.beginPath(); g.moveTo(-24, -210); g.quadraticCurveTo(-14, -214, -12, -226); g.lineTo(12, -226); g.quadraticCurveTo(14, -214, 24, -210); g.lineTo(28, -218); g.lineTo(20, -213); g.lineTo(-20, -213); g.lineTo(-28, -218); g.closePath(); g.fill();
    stone(g, -10, -232, 10, -226, 80);
    const lb = g.createRadialGradient(-3, -246, 0, 0, -242, 12); lb.addColorStop(0, '#f6e8d0'); lb.addColorStop(.6, '#d8c09a'); lb.addColorStop(1, '#8a7656'); g.fillStyle = lb; g.beginPath(); g.moveTo(0, -258); g.bezierCurveTo(10, -250, 9, -236, 0, -232); g.bezierCurveTo(-9, -236, -10, -250, 0, -258); g.fill();
    g.strokeStyle = 'rgba(120,96,60,.6)'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, -256); g.quadraticCurveTo(-4, -244, 0, -233); g.moveTo(0, -256); g.quadraticCurveTo(4, -244, 0, -233); g.stroke();
  });
  return (C11ART4 = { gate, wall, pot, pillar });
}
/* words on a board, shrunk until they fit inside it (owner: "chữ DINH CỤ BÁ đang bị lòi ra ngoài") */
function c11FitText(g, text, x, y, maxW, maxH, col) {
  let px = Math.max(6, Math.floor(maxH * .8)); g.font = `900 ${px}px "Playfair Display", serif`;
  while (px > 6 && g.measureText(text).width > maxW) { px--; g.font = `900 ${px}px "Playfair Display", serif`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(text, x, y + 1);
}
const c11Lantern = (g, x, y, s, glow) => {
  g.strokeStyle = '#3a2a18'; g.lineWidth = 1 * s; g.beginPath(); g.moveTo(x, y - 14 * s); g.lineTo(x, y - 9 * s); g.stroke();
  if (glow > .05) { const gl = g.createRadialGradient(x, y, 0, x, y, 30 * s); gl.addColorStop(0, `rgba(255,190,90,${glow * .55})`); gl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gl; g.fillRect(x - 30 * s, y - 30 * s, 60 * s, 60 * s); }
  const gr = g.createRadialGradient(x - 3 * s, y - 3 * s, 0, x, y, 10 * s); gr.addColorStop(0, glow > .3 ? '#ffd080' : '#f06a4a'); gr.addColorStop(1, '#8a1c10'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 8 * s, 10 * s, 0, 0, 6.283); g.fill();
  g.fillStyle = '#e8b840'; g.fillRect(x - 5 * s, y - 11 * s, 10 * s, 3 * s); g.fillRect(x - 5 * s, y + 8 * s, 10 * s, 3 * s);
  g.strokeStyle = '#e0302a'; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(x, y + 11 * s); g.lineTo(x, y + 20 * s); g.stroke();
};
/* the background of flower beds: rich dark soil, rounded */
function c11BgGarden(g, tiles, at, S, rnd) {
  for (const [x, y] of tiles('y')) {
    const [px, py] = at(x, y), x0 = px - S / 2 - (c11Kind(x - 1, y) === 'y' ? 1 : -3), x1 = px + S / 2 + (c11Kind(x + 1, y) === 'y' ? 1 : -3), y0 = py - S / 2 - (c11Kind(x, y - 1) === 'y' ? 1 : -3), y1 = py + S / 2 + (c11Kind(x, y + 1) === 'y' ? 1 : -3);
    g.fillStyle = 'rgba(30,40,20,.35)'; g.fillRect(x0 + 3, y1 - 2, x1 - x0, 5);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#7a5a3a'); gr.addColorStop(1, '#4a3420'); g.fillStyle = gr; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, 6); g.fill();
    g.strokeStyle = '#a89a8a'; g.lineWidth = 2; if (c11Kind(x, y + 1) !== 'y') { g.beginPath(); g.moveTo(x0 + 2, y1); g.lineTo(x1 - 2, y1); g.stroke(); }
  }
}
/* flowers on the beds: flowering tufts and now and then a hibiscus bush */
function c11GardenE(E, g, x, y, sx, sy, k) {
  const GR = c11Grass();
  for (let i = 0; i < 3; i++) { const fx = x + .2 + i * .3 + (c11Hash(x, y, 400 + i) - .5) * .1, fy = y + .45 + (i % 2) * .35, sp = GR.bloom[(c11Hash(x, y, 410 + i) * 3) | 0]; E.push({ y: fy, d: () => c11Lean(g, sp, sx(fx), sy(fy), k * 1.2, c11Wind(fx, fy) * .08 + Math.sin(C11.t * 2 + fx * 5) * .03) }); }
  if (c11Hash(x, y, 420) < .35) { const fx = x + .5, fy = y + .85; E.push({ y: fy, d: () => c11Lean(g, c11Trees3().bush, sx(fx), sy(fy), k * .7, c11Wind(fx, fy) * .03) }); }
}
/* the place's walls, fences, pots, the gate in the hamlet, and the lanterns of the big house */
function c11Extras3(E, g, sx, sy, k, T) {
  const A4 = c11Art4(), id = C11_AR.id, ev = c11Eve();
  if (id === 'lang') E.push({ y: 6, d: () => { c11Spr(g, A4.gate, sx(22.5), sy(6), k * .62); c11FitText(g, 'DINH CỤ BÁ', sx(22.5), sy(6) - 176 * k * .62, 78 * k * .62, 22 * k * .62, '#f2cf5a'); for (const sg of [-1, 1]) c11Lantern(g, sx(22.5) + sg * 46 * k, sy(6) - 150 * k * .62 + 14 * k, k * .8, ev); } });
  if (id === 'dinhba') { const hs = C11_HOUSES.ba, s = k * hs.s; E.push({ y: hs.y + .01, d: () => { for (const dx of [-150, -60, 60, 150]) c11Lantern(g, sx(hs.x) + dx * s, sy(hs.y) - 62 * s, s * .9, ev); g.fillStyle = '#8a2a1c'; g.fillRect(sx(hs.x) - 34 * s, sy(hs.y) - 92 * s, 68 * s, 16 * s); g.font = `900 ${Math.round(9 * s)}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f2cf5a'; c11FitText(g, 'PHÚC LỘC', sx(hs.x), sy(hs.y) - 84 * s, 60 * s, 12 * s, '#f2cf5a'); } }); }
  for (let y = 0; y < C11_H; y++) for (let x = 0; x < C11_W; x++) {
    const kd = C11_MAP[y][x];
    if (kd === 'G') E.push({ y: y + .95, d: () => c11Spr(g, A4.wall, sx(x + .5), sy(y + .95), k) });
    else if (kd === 'P') E.push({ y: y + .9, d: () => c11Spr(g, A4.pot, sx(x + .5), sy(y + .9), k) });
    else if (kd === 'I' && id === 'dinh') E.push({ y: y + .92, d: () => c11Spr(g, A4.pillar, sx(x + .5), sy(y + .92), k * 1.05) });
    else if (kd === 'R') {
      const R = (dx, dy) => c11Kind(x + dx, y + dy) === 'R', X = sx(x + .5), Y = sy(y + .7);
      const pole = (x0, y0, x1, y1, w) => { g.strokeStyle = '#5e7a34'; g.lineWidth = (w + 1.4) * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#c4cc7a'; g.lineWidth = w * .45 * k; g.beginPath(); g.moveTo(x0 - .8 * k, y0 - .8 * k); g.lineTo(x1 - .8 * k, y1 - .8 * k); g.stroke(); };
      const post = (px, py) => { pole(px, py, px, py - 30 * k, 2.6); g.fillStyle = '#e4dca0'; g.beginPath(); g.ellipse(px, py - 30 * k, 2 * k, 1 * k, 0, 0, 6.283); g.fill(); };
      if (R(1, 0)) E.push({ y: y + .7, d: () => { const X2 = sx(x + 1.5); for (const h of [8, 18, 26]) pole(X, Y - h * k, X2, Y - h * k, 1.5); for (let i = 1; i < 6; i++) { const xx = X + (X2 - X) * i / 6; g.strokeStyle = 'rgba(120,140,60,.8)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(xx, Y - 2 * k); g.lineTo(xx, Y - 28 * k); g.stroke(); } post(X, Y); post(X2, Y); } });
      if (R(0, 1)) E.push({ y: y + 1.68, d: () => { const Y2 = sy(y + 1.7); for (const h of [8, 18, 26]) pole(X, Y - h * k, X, Y2 - h * k, 1.5); post(X, Y); post(X, Y2); } });
      if (!R(1, 0) && !R(0, 1) && !R(-1, 0) && !R(0, -1)) E.push({ y: y + .7, d: () => post(X, Y) });
    }
  }
}
