/* Chương XI · ground with volume (owner 2026-10-27: "gốc cây phải match phong cách của cái cây, cái đường và hồ nước cũng nên match
   phong cách của cây cỏ mới"): the same light from the top left as the grass and trees. The lane is a worn dirt track sunk a little
   into the turf (shade under its top-left edge, a sunlit lip on the other, a paler worn middle, grit, round pebbles); the water gets
   depth from its distance to the shore (wet sand, a clear shallow rim, deep blue-green in the middle), the bank's shadow on it and
   a soft dark waterline; shore stones and pebbles are shaded; a felled tree leaves a round stump with rings. */
const c11Can = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const c11Lerp = (a, b, t) => a + (b - a) * t;
const c11Smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/* a pebble or stone: shadow to the bottom right, a body lit on the top left, a glint */
function c11Pebble(g, x, y, rx, ry, rot = 0, hue = 40, sat = 8, l = 62, a = 1) {
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(20,30,20,.3)'; g.beginPath(); g.ellipse(x + rx * .25, y + ry * .45, rx * 1.05, ry * .8, rot, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(x - rx * .35, y - ry * .45, 0, x, y, Math.max(rx, ry) * 1.1); gr.addColorStop(0, `hsl(${hue},${sat}%,${l + 18}%)`); gr.addColorStop(.6, `hsl(${hue},${sat}%,${l}%)`); gr.addColorStop(1, `hsl(${hue},${sat + 4}%,${l - 28}%)`);
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); g.fill();
  g.fillStyle = 'rgba(255,255,250,.45)'; g.beginPath(); g.ellipse(x - rx * .38, y - ry * .42, rx * .3, ry * .18, rot - .3, 0, 6.283); g.fill();
  g.restore();
}
/* the dirt lane, painted into the area's background */
function c11BgLane(g, list, at, S, w, h, rnd, ptiles) {
  if (!list || !list.length) return;
  /* the track winds (owner: "đường đang quá thẳng và vuông vức"): points every ~1.6 tiles pushed sideways a little, the ends kept on
     the way out; a second, narrower winding of its own makes the edges uneven */
  const wig = (pts, seed, amp) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay) || 1, n = Math.max(1, Math.round(L / 1.6)), nx = -(by - ay) / L, ny = (bx - ax) / L; for (let j = 1; j <= n; j++) { const t = j / n, o = i === pts.length - 1 && j === n ? 0 : (Math.sin((ax * 1.7 + ay * 1.3 + i * n + j) * 1.9 + seed) * .6 + (c11Hash(i * 31 + j, seed | 0, 77) - .5) * .8) * amp; out.push([ax + (bx - ax) * t + nx * o, ay + (by - ay) * t + ny * o]); } } return out; };
  const L1 = list.map(([pts, wd], i) => [wig(pts, i * 7.3 + 1, .24), wd]), L2 = list.map(([pts, wd], i) => [wig(pts, i * 5.1 + 9, .34), wd * .8]);
  const strokeAll = (cg, wk, col, LL = L1) => { cg.lineCap = cg.lineJoin = 'round'; cg.strokeStyle = col; for (const [pts, wd] of LL) { cg.lineWidth = S * wd * wk; cg.beginPath(); cg.moveTo(...at(pts[0][0], pts[0][1])); for (let i = 1; i < pts.length - 1; i++) { const [ax, ay] = at(pts[i][0], pts[i][1]), [bx, by] = at(pts[i + 1][0], pts[i + 1][1]); cg.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2); } cg.lineTo(...at(pts[pts.length - 1][0], pts[pts.length - 1][1])); cg.stroke(); } };
  const m = c11Can(w, h), mg = m.getContext('2d'); mg.filter = 'blur(1.2px)'; strokeAll(mg, 1, '#fff'); strokeAll(mg, 1, '#fff', L2);
  const tint = (src, col, dx = 0, dy = 0, blur = 0) => { const c = c11Can(w, h), cg = c.getContext('2d'); if (blur) cg.filter = `blur(${blur}px)`; cg.drawImage(src, dx, dy); cg.filter = 'none'; cg.globalCompositeOperation = 'source-in'; cg.fillStyle = col; cg.fillRect(0, 0, w, h); return c; };
  // a dark rim in the turf just outside the track
  g.save(); g.globalAlpha = .4; g.drawImage(tint(m, 'rgb(36,56,28)', 1, 2, 5), 0, 0); g.restore();
  // the dirt: a warm base, a paler worn middle, grit
  const d = tint(m, '#c11a66e'), dg = d.getContext('2d'); dg.globalCompositeOperation = 'source-atop';
  dg.filter = 'blur(5px)'; strokeAll(dg, .5, 'rgba(238,214,160,.6)'); dg.filter = 'none';
  for (let i = 0, n = w * h / 45; i < n; i++) { const x = rnd() * w, y = rnd() * h, r = .6 + rnd() * 1.4, v = rnd(); dg.fillStyle = v < .45 ? 'rgba(120,84,46,.45)' : v < .8 ? 'rgba(246,230,190,.5)' : 'rgba(90,64,36,.5)'; dg.beginPath(); dg.arc(x, y, r, 0, 6.283); dg.fill(); }
  // sunk into the turf: shade under the top-left edge, a sunlit lip on the bottom-right edge
  const shade = (col, dx, dy, blur, alpha) => { const c = c11Can(w, h), cg = c.getContext('2d'); cg.fillStyle = col; cg.fillRect(0, 0, w, h); cg.globalCompositeOperation = 'destination-out'; cg.filter = `blur(${blur}px)`; cg.drawImage(m, dx, dy); cg.filter = 'none'; cg.globalCompositeOperation = 'destination-in'; cg.drawImage(m, 0, 0); dg.globalAlpha = alpha; dg.drawImage(c, 0, 0); dg.globalAlpha = 1; };
  shade('rgb(70,44,20)', 6, 7, 4, .55); shade('rgb(255,242,205)', -3, -4, 3, .4);
  g.drawImage(d, 0, 0);
  for (const [px, py] of ptiles) { for (let i = 0; i < 3; i++) if (rnd() < .7) c11Pebble(g, px + (rnd() - .5) * S * .7, py + (rnd() - .5) * S * .5, 1.8 + rnd() * 2.2, 1.3 + rnd() * 1.4, rnd(), 34, 14, 60 + rnd() * 10); if (rnd() < .3) c11Pebble(g, px + (rnd() - .5) * S * .6, py + (rnd() - .5) * S * .4, 4.5 + rnd() * 2.5, 3 + rnd(), rnd() * .6, 38, 10, 66); }
}
/* the water: depth from the distance to the shore, wet sand, a dark waterline, the bank's shadow on the top-left side */
function c11BgWater(g, wt, at, S, w, h, rnd) {
  if (!wt.length) return;
  const mask = blur => { const c = c11Can(w, h), cg = c.getContext('2d'); cg.filter = `blur(${blur}px)`; cg.fillStyle = '#fff'; for (const [x, y] of wt) { const [px, py] = at(x, y); cg.beginPath(); cg.arc(px, py, S * .86, 0, 6.283); cg.fill(); } return cg.getImageData(0, 0, w, h).data; };
  const m1 = mask(16), m2 = mask(46), id = g.getImageData(0, 0, w, h), o = id.data, SX = 7, SY = 9;
  const SAND = [222, 204, 158], WET = [160, 146, 104], LINE = [74, 70, 54], SH = [150, 206, 192], MID = [84, 170, 176], DEEP = [42, 110, 132];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, v = m1[i + 3]; if (v < 18) continue;
    let c;
    if (v < 96) { const t = c11Smooth(18, 70, v), b = c11Smooth(70, 96, v); c = [0, 1, 2].map(j => c11Lerp(c11Lerp(SAND[j], WET[j], t), LINE[j], b * .8)); const a = c11Smooth(18, 34, v); for (let j = 0; j < 3; j++) o[i + j] = c11Lerp(o[i + j], c[j], a); continue; }
    const dd = c11Smooth(60, 250, m2[i + 3]), clear = c11Smooth(96, 150, v);
    c = [0, 1, 2].map(j => dd < .5 ? c11Lerp(SH[j], MID[j], dd * 2) : c11Lerp(MID[j], DEEP[j], (dd - .5) * 2));
    c = c.map((cc, j) => c11Lerp(c11Lerp(WET[j], LINE[j], .4), cc, clear));                           // at the very edge the bottom shows through
    const xs = x - SX, ys = y - SY, vs = xs >= 0 && ys >= 0 ? m1[(ys * w + xs) * 4 + 3] : 0, sh = 1 - .3 * (1 - c11Smooth(110, 230, vs));   // the bank's shadow
    for (let j = 0; j < 3; j++) o[i + j] = c[j] * sh;
  }
  g.putImageData(id, 0, 0);
  // a sheen of sky on the open water, fading towards the shore
  const sheen = c11Can(w, h), sg = sheen.getContext('2d'); sg.strokeStyle = 'rgba(235,250,255,.16)'; sg.lineCap = 'round';
  for (let i = 0, n = wt.length * 3; i < n; i++) { const [x, y] = wt[(rnd() * wt.length) | 0], [px, py] = at(x, y), ox = px + (rnd() - .5) * S, oy = py + (rnd() - .5) * S, L = 8 + rnd() * 16; sg.lineWidth = 1 + rnd() * 1.6; sg.beginPath(); sg.moveTo(ox - L, oy); sg.quadraticCurveTo(ox, oy - 2.5, ox + L, oy + .5); sg.stroke(); }
  const mc = c11Can(w, h), mcg = mc.getContext('2d'), mid = mcg.createImageData(w, h); for (let i = 3; i < m1.length; i += 4) mid.data[i] = c11Smooth(130, 230, m1[i]) * 255; mcg.putImageData(mid, 0, 0);
  sg.globalCompositeOperation = 'destination-in'; sg.drawImage(mc, 0, 0); g.drawImage(sheen, 0, 0);
}
/* a felled tree's stump: a round bark side lit on the left, flared roots, a pale cut top with growth rings */
function c11Stump3(g, X, Y, k) {
  g.save(); g.translate(X, Y); g.scale(k, k); g.lineJoin = g.lineCap = 'round';
  const ao = g.createRadialGradient(2, 2, 0, 2, 2, 26); ao.addColorStop(0, 'rgba(14,30,18,.5)'); ao.addColorStop(1, 'rgba(14,30,18,0)'); g.save(); g.scale(1, .34); g.fillStyle = ao; g.beginPath(); g.arc(2, 6, 26, 0, 6.283); g.fill(); g.restore();
  const bark = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'hsl(30,26%,52%)'); gr.addColorStop(.4, 'hsl(26,34%,36%)'); gr.addColorStop(1, 'hsl(24,38%,15%)'); return gr; };
  for (const [sg, l] of [[-1, 1], [1, 1], [.3, .7]]) { const p = new Path2D(); p.moveTo(sg * 8, -6); p.quadraticCurveTo(sg * 16, -2, sg * (17 + l * 5), 2); p.lineTo(sg * 6, 2); p.closePath(); g.fillStyle = bark(-22, 22); g.fill(p); g.strokeStyle = 'rgba(24,16,10,.35)'; g.lineWidth = .7; g.stroke(p); }
  const side = new Path2D(); side.moveTo(-14, 0); side.lineTo(-12.5, -13); side.lineTo(12.5, -13); side.lineTo(14, 0); side.quadraticCurveTo(0, 6, -14, 0); side.closePath();
  g.fillStyle = bark(-14, 14); g.fill(side);
  g.save(); g.clip(side); for (let i = 0; i < 9; i++) { const x = -13 + i * 3.2; g.strokeStyle = `rgba(30,18,10,${.25 + (i % 3) * .08})`; g.lineWidth = .8; g.beginPath(); g.moveTo(x, 4); g.quadraticCurveTo(x + (i % 2 ? 1 : -1), -6, x * .92, -14); g.stroke(); } g.restore();
  g.strokeStyle = 'rgba(24,16,10,.5)'; g.lineWidth = .8; g.stroke(side);
  const top = g.createRadialGradient(-2, -14, 0, 0, -13, 13); top.addColorStop(0, '#f0d8a4'); top.addColorStop(.7, '#d6ad74'); top.addColorStop(1, '#a8794a');
  g.fillStyle = top; g.beginPath(); g.ellipse(0, -13, 12.5, 5, 0, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(140,90,48,.5)'; g.lineWidth = .6; for (const r of [9.5, 7, 4.6, 2.4]) { g.beginPath(); g.ellipse(.4, -13.1, r, r * .4, 0, 0, 6.283); g.stroke(); }
  g.strokeStyle = 'rgba(110,70,36,.6)'; g.lineWidth = .7; g.beginPath(); g.moveTo(1, -13); g.lineTo(8, -15.4); g.stroke();
  g.strokeStyle = 'hsl(24,36%,22%)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -13, 12.5, 5, 0, 0, 6.283); g.stroke();
  g.fillStyle = 'rgba(255,240,210,.35)'; g.beginPath(); g.ellipse(-5, -14.5, 4, 1.2, -.2, 0, 6.283); g.fill();
  g.restore();
}
