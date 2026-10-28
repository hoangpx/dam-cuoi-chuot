/* Chương XI · grass with volume (owner 2026-10-27: "cỏ đẹp hơn, dầy hơn, phong cách kiểu 3D"): every blade is a tapered curve
   filled with a gradient from a deep shaded foot to a sunlit tip, back blades darker and front ones lighter, a lit edge on the
   side facing the light (top left) and a soft shadow pooled under each tuft. The tufts are rendered once into sprites
   ({ c, x0, y0, w, h } like part()) and swayed with c11Lean; the ground under them is a carpet of short two-tone blades. */
let C11GRASS = null;
function c11Grass() {
  if (C11GRASS) return C11GRASS;
  const R = Math.max(2, RES), rnd = mulberry(0x6a55);
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  /* one blade: foot at (x, 0), tip at (x + lean, -h); d = depth 0 (back) .. 1 (front) */
  const blade = (g, x, h, lean, w, d, hue) => {
    const tx = x + lean, ty = -h, p = new Path2D();
    p.moveTo(x - w, 0); p.bezierCurveTo(x - w * .7, -h * .45, tx - w * .3 - lean * .2, ty + h * .3, tx, ty);
    p.bezierCurveTo(tx + w * .2 - lean * .15, ty + h * .35, x + w * .8, -h * .4, x + w, 0); p.closePath();
    const gr = g.createLinearGradient(x, 0, tx, ty);
    gr.addColorStop(0, hsl(hue + 8, 48, 13 + d * 6)); gr.addColorStop(.45, hsl(hue, 46, 27 + d * 9)); gr.addColorStop(1, hsl(hue - 18, 58, 50 + d * 14));
    g.fillStyle = gr; g.fill(p);
    g.strokeStyle = hsl(70, 70, 82, .22 + d * .3); g.lineWidth = .9;                       // the lit edge
    g.beginPath(); g.moveTo(x - w * .45, -h * .12); g.bezierCurveTo(x - w * .4, -h * .5, tx - w * .25 - lean * .15, ty + h * .3, tx, ty); g.stroke();
    g.strokeStyle = hsl(120, 40, 8, .35); g.lineWidth = .55; g.stroke(p);                   // a fine dark edge, so it still sits with the prints
  };
  const tuft = (n, spread, hMin, hMax, extra) => mk([-spread - 30, -hMax - 24, spread + 30, 8], g => {
    const ao = g.createRadialGradient(0, 0, 0, 0, 0, spread + 10); ao.addColorStop(0, 'rgba(18,40,22,.5)'); ao.addColorStop(1, 'rgba(18,40,22,0)');
    g.save(); g.scale(1, .32); g.fillStyle = ao; g.beginPath(); g.arc(0, 0, spread + 10, 0, 6.283); g.fill(); g.restore();
    const B = []; for (let i = 0; i < n; i++) { const u = (rnd() + rnd() + rnd()) / 3 * 2 - 1; B.push({ x: u * spread, d: rnd(), h: hMin + rnd() * (hMax - hMin), hue: 92 + (rnd() - .5) * 22 }); }
    B.sort((a, b) => a.d - b.d);
    for (const b of B) { const hh = b.h * (1 - Math.abs(b.x) / (spread * 2.2)) * (.8 + b.d * .3), lean = b.x * .55 + (rnd() - .5) * 10; blade(g, b.x, hh, lean, 1.7 + rnd() * 1.6, b.d, b.hue); }
    if (extra) extra(g, B);
  });
  const seeds = (g, B) => { for (let i = 0; i < 3; i++) { const b = B[(i * 5 + 2) % B.length], x = b.x * .6, h = b.h * 1.25, tx = x + b.x * .3 + 4; g.strokeStyle = hsl(60, 35, 45); g.lineWidth = .9; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 2, -h * .6, tx, -h); g.stroke(); const gr = g.createLinearGradient(tx - 3, -h - 8, tx + 3, -h + 4); gr.addColorStop(0, '#f3e6b0'); gr.addColorStop(1, '#a8925a'); g.fillStyle = gr; g.beginPath(); g.ellipse(tx, -h - 2, 2.4, 6, .25, 0, 6.283); g.fill(); } };
  const blooms = cols => (g, B) => { for (let i = 0; i < 4; i++) { const b = B[(i * 7 + 3) % B.length], x = b.x * .7, h = b.h * (.9 + i * .08), c = cols[i % cols.length]; g.strokeStyle = hsl(110, 40, 26); g.lineWidth = 1; g.beginPath(); g.moveTo(x, -3); g.lineTo(x + b.x * .2, -h); g.stroke(); const fx = x + b.x * .2, fy = -h; for (let j = 0; j < 5; j++) { const a = j * 1.257, gr = g.createRadialGradient(fx - 1, fy - 1, 0, fx, fy, 4); gr.addColorStop(0, '#fff'); gr.addColorStop(1, c); g.fillStyle = gr; g.beginPath(); g.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.3, 0, 6.283); g.fill(); } g.fillStyle = '#f2c23a'; g.beginPath(); g.arc(fx, fy, 1.5, 0, 6.283); g.fill(); } };
  C11GRASS = {
    tufts: [tuft(12, 9, 14, 24), tuft(16, 12, 18, 30), tuft(20, 15, 22, 36), tuft(26, 18, 26, 44), tuft(14, 16, 10, 18), tuft(22, 13, 24, 40)],
    seed: [tuft(18, 13, 22, 36, seeds), tuft(14, 10, 20, 30, seeds)],
    bloom: [tuft(16, 12, 16, 28, blooms(['#f6f2e8'])), tuft(16, 12, 16, 28, blooms(['#f2d04a'])), tuft(16, 12, 16, 28, blooms(['#f2a2b8', '#f6f2e8']))],
  };
  return C11GRASS;
}
/* the ground carpet: thousands of short blades, dark at the foot and light at the tip, painted once with the area's background */
function c11BgGrass(g, w, h, rnd) {
  for (let i = 0; i < w * h / 9000; i++) {                          // low swells of the turf: lit on the top left, shaded below
    const x = rnd() * w, y = rnd() * h, r = 30 + rnd() * 50, gr = g.createRadialGradient(x - r * .3, y - r * .35, 0, x, y, r);
    gr.addColorStop(0, 'rgba(206,232,140,.26)'); gr.addColorStop(.55, 'rgba(120,170,90,0)'); gr.addColorStop(.85, 'rgba(30,70,40,.12)'); gr.addColorStop(1, 'rgba(30,70,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  const n = Math.floor(w * h / 50);
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, l = 7 + rnd() * 10, lean = (rnd() - .5) * 6, bw = 1 + rnd() * 1.1, hue = 88 + rnd() * 26, d = rnd();
    g.fillStyle = `hsla(${hue + 6},45%,${20 + d * 8}%,.55)`; g.beginPath(); g.moveTo(x - bw, y); g.lineTo(x + bw, y); g.lineTo(x + lean, y - l); g.closePath(); g.fill();
    g.fillStyle = `hsla(${hue - 14},55%,${50 + d * 14}%,.55)`; g.beginPath(); g.moveTo(x - bw * .5 + lean * .45, y - l * .45); g.lineTo(x + bw * .5 + lean * .45, y - l * .45); g.lineTo(x + lean, y - l); g.closePath(); g.fill();
  }
}
/* the ground where grass was cut (owner: it should match the grass round it): a 128 px tile of short shaded stubble, a few cut blades
   lying about and bare earth showing through, drawn as a pattern into the cut patches */
let C11STUB = null;
function c11Stubble() {
  if (C11STUB) return C11STUB;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), rnd = mulberry(0x5a7b);
  const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, '#80a85a'); gr.addColorStop(1, '#709a50'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const wrap = (f) => { for (const dx of [-128, 0, 128]) for (const dy of [-128, 0, 128]) f(dx, dy); };
  for (let i = 0; i < 18; i++) { const x = rnd() * 128, y = rnd() * 128, r = 3 + rnd() * 6; wrap((dx, dy) => { const pg = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); pg.addColorStop(0, 'rgba(150,120,70,.45)'); pg.addColorStop(1, 'rgba(150,120,70,0)'); g.fillStyle = pg; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2); }); }
  for (let i = 0; i < 900; i++) {
    const x = rnd() * 128, y = rnd() * 128, l = 2.5 + rnd() * 4, lean = (rnd() - .5) * 2.4, w = .7 + rnd() * .6, hue = 86 + rnd() * 24, d = rnd();
    wrap((dx, dy) => { const X = x + dx, Y = y + dy; if (X < -8 || X > 136 || Y < -8 || Y > 136) return; g.fillStyle = `hsla(${hue + 6},44%,${22 + d * 9}%,.8)`; g.beginPath(); g.moveTo(X - w, Y); g.lineTo(X + w, Y); g.lineTo(X + lean, Y - l); g.closePath(); g.fill(); g.fillStyle = `hsla(${hue - 16},56%,${58 + d * 12}%,.85)`; g.beginPath(); g.moveTo(X + lean * .5 - w * .4, Y - l * .5); g.lineTo(X + lean * .5 + w * .4, Y - l * .5); g.lineTo(X + lean, Y - l); g.closePath(); g.fill(); });
  }
  g.lineCap = 'round';
  for (let i = 0; i < 40; i++) { const x = rnd() * 128, y = rnd() * 128, a = rnd() * 3.14, L = 4 + rnd() * 5; wrap((dx, dy) => { g.strokeStyle = rnd() < .5 ? 'rgba(214,214,120,.8)' : 'rgba(170,196,96,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * L, y + dy + Math.sin(a) * L * .5); g.stroke(); }); }
  return (C11STUB = c);
}
/* hoed earth (owner: it should match the grass and trees): a 128 px tile of furrows, each ridge lit on top and shaded under, with
   rounded clods, a few pebbles and roots; the watered one darker and richer with a wet sheen */
const C11SOIL = {};
function c11Soil(wet) {
  if (C11SOIL[wet]) return C11SOIL[wet];
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), rnd = mulberry(wet ? 0x50a1 : 0x50a0);
  const L = wet ? -14 : 0, col = (h, s, l, a = 1) => `hsla(${h},${s}%,${l + L}%,${a})`;
  g.fillStyle = col(26, 40, 34); g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 16) {                                // the furrows: a soft wavy ridge every 16 px, lit on top, shaded under
    const wv = x => Math.sin(x * .09 + y * .7) * 1.6 + Math.sin(x * .23 + y) * .7;
    g.lineCap = 'round';
    g.strokeStyle = col(22, 44, 22, .5); g.lineWidth = 5; g.beginPath(); for (let x = -2; x <= 130; x += 4) g.lineTo(x, y + 12 + wv(x)); g.stroke();
    g.strokeStyle = col(28, 36, 44, .55); g.lineWidth = 4; g.beginPath(); for (let x = -2; x <= 130; x += 4) g.lineTo(x, y + 6 + wv(x)); g.stroke();
    g.strokeStyle = col(30, 32, 54, .35); g.lineWidth = 1.4; g.beginPath(); for (let x = -2; x <= 130; x += 4) g.lineTo(x, y + 4.5 + wv(x)); g.stroke();
  }
  const wrap = f => { for (const dx of [-128, 0, 128]) for (const dy of [-128, 0, 128]) f(dx, dy); };
  for (let i = 0; i < 110; i++) { const x = rnd() * 128, y = rnd() * 128, r = 1.4 + rnd() * 3.4; wrap((dx, dy) => { const X = x + dx, Y = y + dy; if (X < -6 || X > 134 || Y < -6 || Y > 134) return; g.fillStyle = col(20, 40, 14, .45); g.beginPath(); g.ellipse(X + r * .3, Y + r * .4, r, r * .7, 0, 0, 6.283); g.fill(); const cg = g.createRadialGradient(X - r * .35, Y - r * .4, 0, X, Y, r); cg.addColorStop(0, col(30, 36, 54)); cg.addColorStop(1, col(22, 44, 26)); g.fillStyle = cg; g.beginPath(); g.ellipse(X, Y, r, r * .78, 0, 0, 6.283); g.fill(); }); }
  for (let i = 0; i < 10; i++) { const x = rnd() * 128, y = rnd() * 128, r = 1.2 + rnd() * 1.4; wrap((dx, dy) => { const pg = g.createRadialGradient(x + dx - r * .3, y + dy - r * .3, 0, x + dx, y + dy, r); pg.addColorStop(0, '#e8e2d4'); pg.addColorStop(1, '#8a8478'); g.fillStyle = pg; g.beginPath(); g.arc(x + dx, y + dy, r, 0, 6.283); g.fill(); }); }
  g.strokeStyle = col(34, 30, 60, .5); g.lineWidth = .7; for (let i = 0; i < 8; i++) { const x = rnd() * 128, y = rnd() * 128, a = rnd() * 6.28; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 4, y + 3, x + Math.cos(a) * 7, y + Math.sin(a) * 3); g.stroke(); }
  if (wet) { g.fillStyle = 'rgba(200,220,235,.22)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(rnd() * 128, rnd() * 128, 1.2 + rnd() * 2.4, .6 + rnd() * .8, 0, 0, 6.283); g.fill(); } }
  return (C11SOIL[wet] = c);
}
