/* The village map (owner 2026-11-01: "làm thêm map cho làng vũ đại", a map to look at the whole village): a "Bản đồ" button beside
   the place name opens a sheet of paper with every place of the village laid out as they join (the ways out of each map, read from
   C11_AREAS[].exits, drawn as dirt roads), and a red dot where the mouse stands now. Any tap closes it. */
(() => {
  /* where each place sits on the sheet (columns, rows): the hamlet in the middle, home to the west with the bamboo wood below it,
     the market and Xóm Đông to the east, the đình, Xóm Đoài and the fields to the north, the landing and Xóm Bãi to the south */
  const AT = { doai: [0, 0], dinh: [1, 0], dong: [2, 0], ruong: [0, 1], lang: [1, 1], cho: [2, 1], dongx: [3, 1], rung: [0, 2], ben: [1, 2], bai: [2, 2], dinhba: [1.62, .5] };
  const NAME = { ruong: 'Nhà mình', lang: 'Xóm làng', cho: 'Chợ làng', dinh: 'Đình làng', ben: 'Bến sông', dong: 'Cánh đồng', rung: 'Rừng trúc', dongx: 'Xóm Đông', doai: 'Xóm Đoài', bai: 'Xóm Bãi', dinhba: 'Dinh cụ Bá' };
  const FILL = { ruong: '#e6d79a', lang: '#e9d2a8', cho: '#efc49a', dinh: '#e8b4a0', ben: '#a9d2e0', dong: '#cfe39a', rung: '#a9cf8a', dongx: '#e9d2a8', doai: '#e9d2a8', bai: '#e9d2a8', dinhba: '#e7a990' };
  /* a tiny picture on each card so the places are told apart at a glance */
  const icon = (g, id, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 1.6; g.strokeStyle = INK; g.lineJoin = 'round';
    const roof = (dx, col) => { g.fillStyle = '#f4ead0'; g.fillRect(dx - 7, -4, 14, 9); g.strokeRect(dx - 7, -4, 14, 9); g.fillStyle = col; g.beginPath(); g.moveTo(dx - 10, -3); g.lineTo(dx, -12); g.lineTo(dx + 10, -3); g.closePath(); g.fill(); g.stroke(); };
    if (id === 'ruong') { roof(0, '#c98a3a'); }
    else if (id === 'lang' || id === 'dongx' || id === 'doai' || id === 'bai') { roof(-8, '#c9a04a'); roof(8, '#b0703a'); }
    else if (id === 'cho') { g.fillStyle = '#c9a04a'; g.beginPath(); g.moveTo(-12, -4); g.lineTo(0, -12); g.lineTo(12, -4); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-9, -4); g.lineTo(-9, 6); g.moveTo(9, -4); g.lineTo(9, 6); g.stroke(); g.fillStyle = '#d24a3a'; g.beginPath(); g.arc(-3, 3, 3, 0, 6.283); g.fill(); g.fillStyle = '#e8c23a'; g.beginPath(); g.arc(4, 3, 3, 0, 6.283); g.fill(); }
    else if (id === 'dinh' || id === 'dinhba') { g.fillStyle = '#f4ead0'; g.fillRect(-9, -3, 18, 9); g.strokeRect(-9, -3, 18, 9); g.fillStyle = '#a8432f'; g.beginPath(); g.moveTo(-14, -2); g.quadraticCurveTo(-8, -6, -6, -11); g.lineTo(6, -11); g.quadraticCurveTo(8, -6, 14, -2); g.closePath(); g.fill(); g.stroke(); }
    else if (id === 'ben') { g.fillStyle = '#5a9ec0'; g.beginPath(); g.ellipse(0, 2, 13, 6, 0, 0, 6.283); g.fill(); g.fillStyle = '#8a5a34'; g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.lineTo(5, 4); g.lineTo(-5, 4); g.closePath(); g.fill(); g.stroke(); }
    else if (id === 'dong') { g.strokeStyle = '#5a8a2a'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 5, 6); g.lineTo(i * 5 + 1, -8); g.stroke(); } g.fillStyle = '#e0b83a'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 5 + 1, -8, 1.8, 3.4, 0, 0, 6.283); g.fill(); } }
    else if (id === 'rung') { g.strokeStyle = '#3f7a2a'; g.lineWidth = 2.4; for (const dx of [-8, -1, 6]) { g.beginPath(); g.moveTo(dx, 7); g.lineTo(dx + 1, -11); g.stroke(); } g.fillStyle = '#6fb44a'; for (const [dx, dy] of [[-6, -9], [2, -11], [9, -7]]) { g.beginPath(); g.ellipse(dx, dy, 5, 2.2, -.4, 0, 6.283); g.fill(); } }
    g.restore();
  };
  const draw = (g, W, H, m) => {
    g.fillStyle = 'rgba(20,16,30,.55)'; g.fillRect(0, 0, W, H);
    const pw = Math.min(W - 16, 620), cols = 4, rows = 3, cw = (pw - 24) / cols, ch = Math.min(cw * .78, (H - 150) / rows), ph = ch * rows + 92, px = (W - pw) / 2, py = Math.max(10, (H - ph) / 2);
    /* the paper */
    g.fillStyle = '#f6ecd0'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(px, py, pw, ph, 14); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(140,100,50,.35)'; g.lineWidth = 1.2; g.beginPath(); g.roundRect(px + 7, py + 7, pw - 14, ph - 14, 9); g.stroke();
    g.fillStyle = INK; g.font = '900 20px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Bản đồ làng Vũ Đại', W / 2, py + 26);
    const ox = px + 12, oy = py + 50, C = id => [ox + (AT[id][0] + .5) * cw, oy + (AT[id][1] + .5) * ch];
    /* roads first: one for every pair of places joined by a way out */
    const seen = new Set();
    for (const [id, A] of Object.entries(C11_AREAS)) { if (!AT[id]) continue; for (const ex of Object.values(A.exits || {})) { const to = ex[0]; if (!AT[to]) continue; const k = [id, to].sort().join('|'); if (seen.has(k)) continue; seen.add(k);
      const [x0, y0] = C(id), [x1, y1] = C(to); g.lineCap = 'round'; g.strokeStyle = '#8a6a3e'; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#d9b97a'; g.lineWidth = 5; g.stroke(); } }
    /* the places */
    const here = C11_AR && C11_AR.id;
    for (const id of Object.keys(AT)) {
      if (!C11_AREAS[id]) continue;
      const small = id === 'dinhba', w = cw * (small ? .5 : .82), h = ch * (small ? .46 : .72), [cx, cy] = C(id), x = cx - w / 2, y = cy - h / 2, me = id === here;
      g.fillStyle = FILL[id] || '#e9d2a8'; g.strokeStyle = me ? '#c8402f' : INK; g.lineWidth = me ? 3.6 : 2.2; g.beginPath(); g.roundRect(x, y, w, h, 9); g.fill(); g.stroke();
      icon(g, id, cx, y + h * .36, Math.min(1.3, h / 52) * (small ? .8 : 1));
      let fs = small ? 9.5 : 12; g.font = `800 ${fs}px "Be Vietnam Pro", sans-serif`; while (g.measureText(NAME[id]).width > w - 6 && fs > 8) { fs -= .5; g.font = `800 ${fs}px "Be Vietnam Pro", sans-serif`; }
      g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(NAME[id], cx, y + h * .8);
      /* the mouse: a red dot at its spot inside this place, pulsing */
      if (me) { const fx = Math.max(.08, Math.min(.92, C11.px / C11_W)), fy = Math.max(.1, Math.min(.9, C11.py / C11_H)), dx = x + w * fx, dy = y + h * fy, p = 1 + Math.sin(C11.t * 5) * .25;
        g.fillStyle = 'rgba(200,64,47,.3)'; g.beginPath(); g.arc(dx, dy, 9 * p, 0, 6.283); g.fill(); g.fillStyle = '#c8402f'; g.strokeStyle = '#fbf4dc'; g.lineWidth = 2; g.beginPath(); g.arc(dx, dy, 5, 0, 6.283); g.fill(); g.stroke(); }
    }
    g.fillStyle = 'rgba(29,25,21,.6)'; g.font = '600 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText('Chấm đỏ là chỗ bạn đang đứng · chạm để đóng', W / 2, py + ph - 18);
  };
  const oldMenu = c11DrawMenu;
  c11DrawMenu = function (g, W, H) { const m = C11.menu; if (m && m.map) return draw(g, W, H, m); return oldMenu(g, W, H); };
  /* the button: right of the place name, which is tappable too */
  const oldHud = c11OHud;
  c11OHud = function (g, st) {
    oldHud(g, st);
    const t = c11Tag(g, 10, 78, C11_AR.name, { size: 11, h: 24, pad: 16, fill: 'rgba(244,234,208,.85)' }), b = c11Tag(g, t[0] + t[2] + 6, 78, 'Bản đồ', { size: 11, h: 24, pad: 16, fill: '#f7e3a4' });
    const open = () => { C11.menu = { map: true }; C11.go = null; c11Sfx.tap && c11Sfx.tap(); };
    C11.hud.push({ r: [t[0], t[1] + st, t[2], t[3]], f: open }, { r: [b[0], b[1] + st, b[2], b[3]], f: open });
  };
})();
