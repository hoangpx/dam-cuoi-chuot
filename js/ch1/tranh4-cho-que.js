/* Tranh 4 · Làng Tranh — on the road to the market the party passes the Đông Hồ painting village in the rain. Lính cụ Lý
   keeps the market gate and lets no one in without four coins; the four workshops on the way each give one for a helping
   hand, in the order a painting is made (owner's idea). Nobody blocks the road: the party may walk past, but short of coins
   the gate stays shut.
   1. the dye house: the green jar broke. Five things in the yard dye a jar of rain water (hoa hoè vàng, đậu biếc xanh,
      lá tre đen, hoa đỏ đỏ, vỏ điệp trắng); any jar can be poured (hold it) into the new jar. Yellow with blue makes the
      green; anything else turns it muddy and the dyer tips it out. A jar poured dry refills with rain water a moment
      later, so that colour has to be made again. No hint of the recipe;
   2. the print house: five pictures, each printed with the five blocks (vàng, xanh, đỏ, đen, trắng) in the order the
      printer shows once and then hides (tap him to see it again); a wrong block smears the sheet;
   3. the drying yard: black clouds over the whole sky, the sun hidden somewhere among them — drag them off it;
   4. the arched bamboo bridge: tap the old man's cart and the whole party leans in and pushes with him, but the bridge
      breaks under it unless you hold the bridge up while the cart is in the middle.
   Each thanks the party, then a moment later gives the coin. */

const T4_INK = { vang: '#e8b83a', xanh: '#2f6a4c', do: '#a3332a', den: '#2a221d', trang: '#f6f1e4' };
const T4_INKS = ['vang', 'xanh', 'do', 'den', 'trang'];
const T4_PAPER = '#eadcbc';                                              // giấy dó, so the white (điệp) shows on it

/* ---------- small things drawn straight on the canvas ---------- */
function t4Coin(g, x, y, r = 11) {
  g.fillStyle = '#d9a441'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke();
  const h = r * .3; g.fillStyle = '#f2ecde'; g.fillRect(x - h, y - h, h * 2, h * 2); g.lineWidth = 1.4; g.strokeRect(x - h, y - h, h * 2, h * 2);
}
// a speech bubble (the same shape as drawBubble) with whatever is drawn inside it; x, y is the tip of its tail
function t4Bubble(g, x, y, w, inner, h = 52) {
  g.save(); g.translate(x, y - 12);
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-w / 2 + 8, -h); g.lineTo(w / 2 - 8, -h); g.quadraticCurveTo(w / 2, -h, w / 2, -h + 8); g.lineTo(w / 2, -8); g.quadraticCurveTo(w / 2, 0, w / 2 - 8, 0);
  g.lineTo(8, 0); g.lineTo(0, 12); g.lineTo(-8, 0); g.lineTo(-w / 2 + 8, 0); g.quadraticCurveTo(-w / 2, 0, -w / 2, -8); g.lineTo(-w / 2, -h + 8); g.quadraticCurveTo(-w / 2, -h, -w / 2 + 8, -h);
  g.closePath(); g.fill(); g.stroke();
  g.translate(0, -h / 2); inner(g); g.restore();
}
// a workshop keeper facing the party; bounces and raises a hand when thanking
function t4Folk(g, sort, x, k, face = -1) {
  const b = k.bounce > 0 ? Math.abs(Math.sin(k.bounce * 14)) * 8 : 0;
  c4Mouse(g, c4MouseRig(sort), x, face, S.pose * 2, !!k.walk, k.bounce > 0 ? -1.2 : k.arm ?? null, null, 1, GROUND - b, x);
}
// a coin earned: it flies up into the purse in the corner
function t4Earn(wx, wy) {
  S.coins++; S.coinFx.push({ x: wx - camX, y: wy + offY, t: 0, slot: S.coins - 1 });
  AU.pluck(88); setTimeout(() => AU.pluck(95), 130);
}
function t4Thanks(ent, x, msg) { ent.k.bounce = 2.4; AU.pluck(84); toast(msg, 3.8); setTimeout(() => t4Earn(x, GROUND - 120), 1500); }
// the purse: four places for coins in the top corner
function t4Purse(need) {
  return {
    layer: 'top', draw() {},
    update(dt) {
      for (const f of S.coinFx) { f.t += dt; if (f.t >= .9 && !f.done) { f.done = true; if (f.rev) S.coinShown--; else { S.coinShown++; AU.click(); } } }
      S.coinFx = S.coinFx.filter(f => f.t < 1.3);
    },
    drawHud(g, vw) {
      const y = 70, x0 = vw - 34 - (need - 1) * 30, slot = k => x0 + k * 30;
      g.fillStyle = 'rgba(242,236,222,.92)'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); if (g.roundRect) g.roundRect(x0 - 20, y - 18, (need - 1) * 30 + 40, 36, 18); else g.rect(x0 - 20, y - 18, (need - 1) * 30 + 40, 36); g.fill(); g.stroke();   // a paper strip, seen over the dark clouds
      for (let k = 0; k < need; k++) {
        if (k < S.coinShown) t4Coin(g, slot(k), y);
        else { g.strokeStyle = 'rgba(29,25,21,.45)'; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.arc(slot(k), y, 11, 0, 6.283); g.stroke(); g.setLineDash([]); }
      }
      for (const f of S.coinFx) if (!f.done) {
        const k = Math.min(1, f.t / .9), e = 1 - (1 - k) * (1 - k), [ax, ay, bx, by] = f.rev ? [slot(f.slot), y, f.x, f.y] : [f.x, f.y, slot(f.slot), y];
        t4Coin(g, ax + (bx - ax) * e, ay + (by - ay) * e - Math.sin(k * Math.PI) * 70, 11 + Math.sin(k * Math.PI) * 5);
      }
    },
  };
}

/* ---------- 1 · the dye house ---------- */
const T4_JAR = (() => { const p = new Path2D(); p.moveTo(-12, -60); p.bezierCurveTo(-34, -50, -32, -6, -14, 0); p.lineTo(14, 0); p.bezierCurveTo(32, -6, 34, -50, 12, -60); p.closePath(); return p; })();
// a clay jar standing on x, y (its foot), turned by rot; the dye in it up to level (0–1), a dashed mark at half
function t4Jar(g, x, y, rot, s, liq, level, mark) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#8a5a2a'; g.fill(T4_JAR);
  if (level > 0) { g.save(); g.clip(T4_JAR); g.fillStyle = liq; g.fillRect(-40, -4 - 52 * level, 80, 60); g.restore(); }
  if (mark) { g.save(); g.clip(T4_JAR); g.strokeStyle = '#f2ecde'; g.lineWidth = 2.4; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(-34, -30); g.lineTo(34, -30); g.stroke(); g.restore(); }
  g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(T4_JAR);
  g.fillStyle = level > .95 ? liq : '#5b2f1f'; g.beginPath(); g.ellipse(0, -60, 13, 4, 0, 0, 6.283); g.fill(); g.stroke();
  g.restore();
}
function t4Flower(g, x, y, s = 1) {               // đậu biếc: one deep blue petal round a pale heart
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#2f4f9f'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, 4, -12, -12, 0, -10); g.bezierCurveTo(12, -12, 14, 4, 0, 8); g.fill(); g.stroke();
  g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 0, 3, 5, 0, 0, 6.283); g.fill(); g.fillStyle = '#e8b83a'; g.beginPath(); g.arc(0, 2, 1.6, 0, 6.283); g.fill();
  g.restore();
}
const t4Mix = (y, b) => { const r = b / Math.max(.001, y + b), c = (a, z, k) => Math.round(a + (z - a) * k);
  const A = r < .5 ? [232, 184, 58] : [47, 106, 76], Z = r < .5 ? [47, 106, 76] : [47, 79, 159], k = r < .5 ? r * 2 : (r - .5) * 2;
  return `rgb(${c(A[0], Z[0], k)},${c(A[1], Z[1], k)},${c(A[2], Z[2], k)})`; };
// what each thing in the yard dyes water into (owner): hoa hoè vàng, đậu biếc xanh, lá tre đen, hoa đỏ đỏ, vỏ điệp trắng
const T4_PIG = { vang: '#e8b83a', xanhb: '#2f4f9f', do: '#a3332a', den: '#2a221d', trang: '#f6f1e4' }, T4_WATER = '#bcd4dc';
const T4_STUFF = {
  hoe: { pig: 'vang', draw: (g, x, y, s = 1) => { g.fillStyle = '#e8b83a'; g.strokeStyle = INK; g.lineWidth = 1.2; for (const [a, b] of [[0, 0], [-5, 4], [5, 4], [0, 8], [-3, -5], [4, -4]]) { g.beginPath(); g.arc(x + a * s, y + b * s, 3.2 * s, 0, 6.283); g.fill(); g.stroke(); } } },
  bieu: { pig: 'xanhb', draw: (g, x, y, s = 1) => t4Flower(g, x, y, .85 * s) },
  tre: { pig: 'den', draw: (g, x, y, s = 1) => { g.fillStyle = '#4f7a3a'; g.strokeStyle = INK; g.lineWidth = 1.2; for (const r of [-.5, 0, .5]) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.ellipse(0, -7 * s, 2.6 * s, 9 * s, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); } } },
  do: { pig: 'do', draw: (g, x, y, s = 1) => { g.fillStyle = '#c0402f'; g.strokeStyle = INK; g.lineWidth = 1.2; for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.ellipse(x + Math.cos(a) * 4 * s, y + Math.sin(a) * 4 * s, 3.4 * s, 2.4 * s, a, 0, 6.283); g.fill(); g.stroke(); } g.fillStyle = '#e8b83a'; g.beginPath(); g.arc(x, y, 1.8 * s, 0, 6.283); g.fill(); } },
  diep: { pig: 'trang', draw: (g, x, y, s = 1) => { g.fillStyle = '#f6f1e4'; g.strokeStyle = INK; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - 7 * s, y + 4 * s); g.quadraticCurveTo(x, y - 10 * s, x + 7 * s, y + 4 * s); g.closePath(); g.fill(); g.stroke(); g.beginPath(); for (const d of [-3, 0, 3]) { g.moveTo(x, y + 3 * s); g.lineTo(x + d * s, y - 4 * s); } g.stroke(); } },
};
// the colour of what is in the new jar: yellow and blue go green, anything else in it turns it muddy
function t4MixCol(m) {
  const y = m.vang || 0, b = m.xanhb || 0, other = (m.do || 0) + (m.den || 0) + (m.trang || 0), w = m.nuoc || 0;
  const base = other >= .04 ? '#6a5a3a' : y + b > 0 ? t4Mix(y, b) : T4_WATER, k = w / Math.max(.001, y + b + other + w);
  if (k < .02 || base === T4_WATER) return base;
  const rgb = c => c[0] === '#' ? [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)) : c.match(/\d+/g).map(Number), A = rgb(base), Z = rgb(T4_WATER);
  return 'rgb(' + A.map((v, i) => Math.round(v + (Z[i] - v) * k * .8)).join(',') + ')';
}
// a tree: a trunk and a heap of round leaf clouds (for the hoè and the red-flowered one)
function t4Tree(g, x, top, leaf) {
  g.fillStyle = '#6a4a2a'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 9, GROUND); g.quadraticCurveTo(x - 4, top + 120, x - 5, top + 40); g.lineTo(x + 5, top + 40); g.quadraticCurveTo(x + 4, top + 120, x + 9, GROUND); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = leaf; for (const [a, b, r] of [[-44, 40, 34], [40, 36, 36], [0, 0, 44], [-26, -18, 32], [28, -20, 34], [0, 50, 34]]) { g.beginPath(); g.arc(x + a, top + b, r, 0, 6.283); g.fill(); g.stroke(); }
}
// every workshop starts when its keeper is tapped (owner): a "…" bubble waits over them until then
const t4Asked = (wx, wy, kx) => Math.abs(wx - kx) < 42 && wy > GROUND - 215 && wy < GROUND + 10;   // the keeper or the bubble over them
const t4Dots = (g, x) => t4Bubble(g, x, GROUND - 150, 56, g => { g.fillStyle = INK; for (const d of [-12, 0, 12]) { g.beginPath(); g.arc(d, 0, 3.4, 0, 6.283); g.fill(); } }, 34);
function t4Dyer(W) {
  const SHELF = GROUND - 265, NEW = W + 390, KX = W + 500;
  // the yard, tall like the bamboo of the other tranh: bamboo, a hoè tree, a pea vine up a pole, a red-flowered tree,
  // a basket of shells hung high; five to pick on each, above the jars
  const PLANTS = [['tre', W + 60, [[-40, -300], [30, -326], [-10, -270], [44, -282], [8, -340]]], ['hoe', W + 180, [[-40, -300], [6, -330], [36, -296], [-14, -270], [24, -262]]],
    ['bieu', W + 290, [[-10, -340], [10, -312], [-8, -286], [12, -262], [-6, -364]]], ['do', W + 400, [[-40, -300], [6, -330], [36, -296], [-14, -270], [24, -262]]],
    ['diep', W + 510, [[-14, -282], [0, -290], [14, -282], [-7, -272], [7, -272]]]];
  const spots = []; for (const [kind, x, list] of PLANTS) for (const [dx, dy] of list) spots.push({ kind, x: x + dx, y: GROUND + dy - 112, gone: false, back: 0 });
  // the jars, up on a shelf out of the party's way: plain rain water, and full ones of yellow, red, black, white
  const jars = [[W + 110, null], [W + 190, 'vang'], [W + 270, 'do']].map(([x, pig]) => ({ x, pig, l: 1, tilt: 0, kind: null, n: 0, empty: 0 }));
  const e = {
    layer: 'bg', ax: W + 300, st: 'idle', mix: {}, pour: null, k: { bounce: 0 }, mud: 0,
    onClick(wx, wy) {
      if (this.st !== 'idle' || !t4Asked(wx, wy, KX)) return false;
      this.st = 'make'; this.k.bounce = .8; AU.pluck(70); toast('Chum màu xanh lá vỡ mất rồi! Không có màu xanh lá thì in tranh làm sao được…', 3.8); return true;
    },
    grab(wx, wy) {
      if (this.st !== 'make' || this.mud > 0) return null;
      const s = spots.find(s => !s.gone && Math.hypot(wx - s.x, wy - s.y) < 18);
      if (s) { s.gone = true; AU.pluck(80); return { ent: this, kind: 'pick', s, x: wx, y: wy, draw: g => T4_STUFF[s.kind].draw(g, S.drag.x, S.drag.y, 1.4) }; }
      const j = jars.find(j => Math.abs(wx - j.x) < 30 && wy > SHELF - 74 && wy < SHELF + 6 && j.l > 0);
      if (j) { this.pour = j; AU.pluck(70); return { ent: this, kind: 'pour', x: wx, y: wy, draw() {} }; }
      return null;
    },
    drop(d) {
      if (d.kind === 'pour') { this.pour = null; this.settle(); return; }
      const j = jars.find(j => Math.abs(d.x - j.x) < 34 && d.y > SHELF - 120 && d.y < SHELF + 10);
      const pig = T4_STUFF[d.s.kind].pig;
      if (!j || (j.pig && j.pig !== pig)) { d.s.gone = false; if (j) AU.pluck(56); return; }
      d.s.back = 2.5; AU.plop();
      if (j.pig) return;                                                   // more of the same colour: nothing changes
      if (j.kind !== d.s.kind) { j.kind = d.s.kind; j.n = 0; }              // a different thing starts the steeping again
      if (++j.n >= 5) { j.pig = pig; j.l = 1; AU.pluck(86); }
    },
    // after a pour: green done, or a muddy jar the dyer tips out
    settle() {
      const m = this.mix, y = m.vang || 0, b = m.xanhb || 0, other = (m.do || 0) + (m.den || 0) + (m.trang || 0);
      if (other >= .04) { this.mud = 1.6; AU.pluck(52); toast('Màu lem nhem thế này thì in làm sao! Chú thợ nhuộm đổ đi.', 3); return; }
      if (y >= .2 && b >= .2 && b / (y + b) > .25 && b / (y + b) < .75) {
        this.st = 'done'; AU.swoosh(); t4Thanks(this, KX, 'Ra màu xanh lá rồi! Chú thợ nhuộm mừng quá, cảm tạ đoàn rước một đồng.');
      }
    },
    update(dt) {
      this.k.bounce = Math.max(0, this.k.bounce - dt);
      for (const s of spots) if (s.back > 0 && (s.back -= dt) <= 0) s.gone = false;      // the plants flower again
      for (const j of jars) {
        j.tilt += ((this.pour === j ? 1 : 0) - j.tilt) * Math.min(1, dt * 6);
        if (j.empty > 0 && (j.empty -= dt) <= 0) { j.pig = null; j.kind = null; j.n = 0; j.l = 1; toast('Mưa rơi đầy chum nước lã, lại phải làm màu từ đầu.', 3); }
      }
      if (this.mud > 0 && (this.mud -= dt) <= 0) this.mix = {};
      const j = this.pour;
      if (j && j.tilt > .85 && this.st === 'make') {
        const total = Object.values(this.mix).reduce((a, b) => a + b, 0), a = Math.min(.2 * dt, j.l);
        if (total < 1.2) { j.l -= a; const k = j.pig || 'nuoc'; this.mix[k] = (this.mix[k] || 0) + a; }
        if (j.l <= .001) { j.l = 0; j.empty = 3.2; this.pour = null; S.drag = null; AU.pluck(52); toast('Hết sạch cả chum rồi! Thế bây giờ lấy màu đâu mà làm?', 3); this.settle(); }
      }
    },
    draw(g) {
      // the plants
      { const x = PLANTS[0][1]; dp(g, PROPS.bamboo, x, GROUND + 4, 0, 1.06, 1.06); }
      t4Tree(g, PLANTS[1][1], GROUND - 432, '#4f7a3a');
      { const x = PLANTS[2][1]; g.strokeStyle = '#7a5a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, GROUND); g.lineTo(x, GROUND - 492); g.stroke();
        g.strokeStyle = '#2f6a4c'; g.lineWidth = 2.4; g.beginPath(); for (let y = 0; y < 482; y += 4) { const xx = x + Math.sin(y * .09) * 12; y ? g.lineTo(xx, GROUND - y) : g.moveTo(xx, GROUND); } g.stroke();
        g.fillStyle = '#4f7a3a'; g.strokeStyle = INK; g.lineWidth = 1; for (let k = 0; k < 19; k++) { const y = 30 + k * 25, xx = x + Math.sin(y * .09) * 12; g.beginPath(); g.ellipse(xx + (k % 2 ? 9 : -9), GROUND - y, 8, 4.4, k, 0, 6.283); g.fill(); g.stroke(); } }
      t4Tree(g, PLANTS[3][1], GROUND - 432, '#3f6a3a');
      { const x = PLANTS[4][1]; g.strokeStyle = '#7a5a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 30, GROUND); g.lineTo(x + 30, GROUND - 432); g.lineTo(x, GROUND - 432); g.stroke();
        g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, GROUND - 432); g.lineTo(x - 22, GROUND - 390); g.moveTo(x, GROUND - 432); g.lineTo(x + 22, GROUND - 390); g.stroke();
        g.fillStyle = '#b57a22'; g.beginPath(); g.moveTo(x - 26, GROUND - 390); g.lineTo(x + 26, GROUND - 390); g.lineTo(x + 18, GROUND - 366); g.lineTo(x - 18, GROUND - 366); g.closePath(); g.fill(); g.stroke(); }
      for (const s of spots) if (!s.gone) T4_STUFF[s.kind].draw(g, s.x, s.y + Math.sin(S.t * 2 + s.x) * 1.2, 1.3);
      // the shelf and the stand of the new jar
      g.fillStyle = '#8a5a2a'; g.strokeStyle = INK; g.lineWidth = 2.4;
      g.fillRect(W + 70, SHELF, 240, 10); g.strokeRect(W + 70, SHELF, 240, 10); g.fillRect(NEW - 34, SHELF, 68, 10); g.strokeRect(NEW - 34, SHELF, 68, 10);
      g.lineWidth = 5; g.strokeStyle = '#6a4a2a'; g.beginPath(); for (const x of [W + 82, W + 298, NEW - 26, NEW + 26]) { g.moveTo(x, SHELF + 10); g.lineTo(x, GROUND); } g.stroke();
      // the broken green jar on the ground
      g.fillStyle = '#8a5a2a'; g.strokeStyle = INK; g.lineWidth = 2;
      for (const [x, r, s] of [[NEW + 56, -.4, 1], [NEW + 76, .5, .8], [NEW + 40, 1.2, .7]]) { g.save(); g.translate(x, GROUND - 4); g.rotate(r); g.scale(s, s); g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-6, -16, 10, -12); g.lineTo(12, 2); g.closePath(); g.fill(); g.stroke(); g.restore(); }
      g.fillStyle = 'rgba(47,106,76,.55)'; g.beginPath(); g.ellipse(NEW + 60, GROUND + 4, 34, 6, 0, 0, 6.283); g.fill();
      const tot = Object.values(this.mix).reduce((a, b) => a + b, 0);
      t4Jar(g, NEW, SHELF + 1, 0, 1.25, this.st === 'done' ? T4_INK.xanh : t4MixCol(this.mix), this.st === 'done' ? 1 : Math.min(1, tot / 1.2), false);
      for (const j of jars) {
        const k = j.tilt, x = j.x + (NEW - 66 - j.x) * k, y = SHELF + 1 - 80 * k, rot = 1.15 * k, liq = j.pig ? T4_PIG[j.pig] : T4_WATER;
        t4Jar(g, x, y, rot, 1.05, liq, j.l, false);
        if (!j.pig && j.n > 0) { g.save(); g.globalAlpha = j.n / 6; t4Jar(g, x, y, rot, 1.05, T4_PIG[T4_STUFF[j.kind].pig], j.l, false); g.restore(); }   // steeping
        if (k > .85 && this.pour === j) { const mx = x + 63 * Math.sin(rot), my = y - 63 * Math.cos(rot); g.strokeStyle = liq; g.lineWidth = 6; g.beginPath(); g.moveTo(mx, my); g.quadraticCurveTo(mx + 6, my + 12, NEW + Math.sin(S.t * 30) * 1.5, SHELF - 72); g.stroke(); }
      }
    },
    drawMid(g) {
      t4Folk(g, 7, KX, this.k);
      if (this.st === 'idle' && groom.x > W - 300) t4Dots(g, KX - 10);
      else if (this.st === 'make') t4Bubble(g, KX - 10, GROUND - 150, 64, g => t4Jar(g, 0, 18, 0, .5, T4_INK.xanh, 1, false));
    },
  };
  return e;
}

/* ---------- 2 · the print house ---------- */
// five pictures; each draws only the part of it that one ink prints, in a box about 100 × 120 round 0, 0
const T4_SUBJ = [
  (g, k) => {                                                          // cá chép
    if (k === 'xanh') { g.lineWidth = 4; for (const x of [-34, -6, 26]) { g.beginPath(); g.moveTo(x, 58); g.quadraticCurveTo(x - 10, 34, x + 4, 16); g.stroke(); } }
    if (k === 'vang') { g.beginPath(); g.ellipse(-4, -6, 32, 17, -.2, 0, 6.283); g.fill(); }
    if (k === 'do') { g.beginPath(); g.moveTo(24, -10); g.lineTo(46, -30); g.lineTo(38, -6); g.lineTo(46, 16); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-8, -20); g.lineTo(4, -36); g.lineTo(12, -20); g.closePath(); g.fill(); }
    if (k === 'trang') { g.lineWidth = 2.2; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.beginPath(); g.arc(-10 + i * 10, -12 + j * 9, 4, -.6, 1.6); g.stroke(); } }
    if (k === 'den') { g.lineWidth = 2.6; g.beginPath(); g.ellipse(-4, -6, 32, 17, -.2, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(24, -10); g.lineTo(46, -30); g.lineTo(38, -6); g.lineTo(46, 16); g.closePath(); g.stroke(); g.beginPath(); g.arc(-24, -4, 3.4, 0, 6.283); g.fill(); }
  },
  (g, k) => {                                                          // gà trống
    if (k === 'xanh') { g.lineWidth = 7; for (const [x, y] of [[40, -42], [48, -18], [42, 8]]) { g.beginPath(); g.moveTo(14, 2); g.quadraticCurveTo(x - 4, y - 10, x, y); g.stroke(); } }
    if (k === 'vang') { g.beginPath(); g.ellipse(2, 8, 24, 19, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(-14, -16, 10, 15, -.3, 0, 6.283); g.fill(); }
    if (k === 'do') { for (const x of [-20, -14, -8]) { g.beginPath(); g.arc(x, -34, 5, 0, 6.283); g.fill(); } g.beginPath(); g.ellipse(-24, -16, 4, 6, 0, 0, 6.283); g.fill(); }
    if (k === 'trang') { g.lineWidth = 3; g.beginPath(); g.ellipse(6, 8, 13, 8, 0, Math.PI, 0); g.stroke(); }
    if (k === 'den') { g.lineWidth = 2.6; g.beginPath(); g.ellipse(2, 8, 24, 19, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(-14, -16, 10, 15, -.3, 0, 6.283); g.stroke(); g.beginPath(); g.arc(-16, -22, 2.6, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(-24, -22); g.lineTo(-34, -18); g.lineTo(-24, -14); g.fill(); g.beginPath(); g.moveTo(-4, 26); g.lineTo(-6, 50); g.moveTo(8, 26); g.lineTo(10, 50); g.stroke(); }
  },
  (g, k) => {                                                          // lợn
    if (k === 'vang') { g.lineWidth = 5; g.strokeRect(-46, -56, 92, 112); }
    if (k === 'xanh') { g.lineWidth = 3; for (let x = -40; x <= 40; x += 9) { g.beginPath(); g.moveTo(x, 54); g.lineTo(x + 3, 38); g.stroke(); } }
    if (k === 'den') { g.beginPath(); g.ellipse(4, 2, 34, 22, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(-28, -2, 13, 12, 0, 0, 6.283); g.fill(); for (const x of [-14, 0, 14, 24]) g.fillRect(x, 18, 7, 16); }
    if (k === 'trang') { g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 8, 0, 4.6); g.stroke(); g.beginPath(); g.arc(18, 4, 5, 3, 7.2); g.stroke(); }
    if (k === 'do') { g.beginPath(); g.moveTo(-30, -12); g.lineTo(-22, -26); g.lineTo(-18, -10); g.closePath(); g.fill(); g.beginPath(); g.ellipse(-40, 2, 5, 4, 0, 0, 6.283); g.fill(); }
  },
  (g, k) => {                                                          // hoa sen
    if (k === 'xanh') { g.beginPath(); g.ellipse(-24, 34, 24, 9, -.1, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(26, 40, 21, 8, .1, 0, 6.283); g.fill(); g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 12); g.lineTo(0, 56); g.stroke(); }
    if (k === 'do') { g.beginPath(); g.ellipse(0, -12, 10, 24, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(-16, -6, 9, 20, -.6, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(16, -6, 9, 20, .6, 0, 6.283); g.fill(); }
    if (k === 'vang') { g.beginPath(); g.arc(30, -42, 9, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(0, 10, 9, 5, 0, 0, 6.283); g.fill(); }
    if (k === 'trang') { g.lineWidth = 2.4; for (const [x, r] of [[0, 0], [-15, -.6], [15, .6]]) { g.save(); g.translate(x, -8); g.rotate(r); g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -12); g.stroke(); g.restore(); } }
    if (k === 'den') { g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, -12, 10, 24, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(-16, -6, 9, 20, -.6, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(16, -6, 9, 20, .6, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(-24, 34, 24, 9, -.1, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(26, 40, 21, 8, .1, 0, 6.283); g.stroke(); }
  },
  (g, k) => {                                                          // chuột thổi kèn
    if (k === 'xanh') g.fillRect(-46, 40, 92, 14);
    if (k === 'vang') { g.beginPath(); g.ellipse(0, 12, 19, 26, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(14, -12); g.lineTo(40, -26); g.lineTo(40, -14); g.closePath(); g.fill(); }
    if (k === 'do') { g.beginPath(); g.moveTo(-22, -30); g.lineTo(0, -50); g.lineTo(22, -30); g.closePath(); g.fill(); }
    if (k === 'trang') { g.beginPath(); g.ellipse(0, -18, 12, 10, 0, 0, 6.283); g.fill(); }
    if (k === 'den') { g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, 12, 19, 26, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(0, -18, 12, 10, 0, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(-22, -30); g.lineTo(0, -50); g.lineTo(22, -30); g.closePath(); g.stroke();
      for (const x of [-5, 5]) { g.beginPath(); g.arc(x, -19, 2, 0, 6.283); g.fill(); } g.beginPath(); g.moveTo(16, 30); g.quadraticCurveTo(40, 34, 36, 50); g.stroke(); }
  },
];
// a sheet of giấy dó with the inks printed so far, in the order they were printed
function t4Print(g, subj, layers, x, y, s, wet = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = T4_PAPER; g.fillRect(-50, -60, 100, 120);
  g.save(); g.beginPath(); g.rect(-50, -60, 100, 120); g.clip();
  for (const k of layers) { g.globalAlpha = .9; g.fillStyle = g.strokeStyle = T4_INK[k]; g.lineCap = g.lineJoin = 'round'; T4_SUBJ[subj](g, k); }
  g.globalAlpha = 1; if (wet > 0) { g.fillStyle = `rgba(40,50,70,${.32 * wet})`; g.fillRect(-50, -60, 100, 120); }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(-50, -60, 100, 120); g.restore();
}
function t4Block(g, ink, x, y, lit, press) {           // a carved pear-wood block, its inked face on top
  const up = lit ? 12 : 0, dn = press > 0 ? 6 : 0;
  g.save(); g.translate(x, y - up + dn);
  if (lit) { g.fillStyle = 'rgba(242,198,64,.45)'; g.beginPath(); g.ellipse(0, -6, 34, 26, 0, 0, 6.283); g.fill(); }
  g.fillStyle = '#8a5a2a'; g.strokeStyle = INK; g.lineWidth = 2.2; g.fillRect(-22, -14, 44, 22); g.strokeRect(-22, -14, 44, 22);
  g.fillStyle = T4_INK[ink]; g.fillRect(-22, -22, 44, 9); g.strokeRect(-22, -22, 44, 9);
  g.strokeStyle = 'rgba(29,25,21,.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-14, -4); g.lineTo(14, -4); g.moveTo(-10, 2); g.lineTo(10, 2); g.stroke();
  g.restore();
}
function t4Printer(W) {
  const BX = k => W + 70 + k * 55, BY = GROUND - 272, PX = W + 180, PY = GROUND - 376, KX = W + 380;   // the table up high, out of the party's way
  const newOrder = () => { const o = T4_INKS.slice(); for (let i = o.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [o[i], o[j]] = [o[j], o[i]]; } return o; };
  const e = {
    layer: 'bg', ax: W, st: 'idle', t: 0, round: 0, order: newOrder(), step: 0, layers: [], press: {}, k: { bounce: 0 }, toldWrong: false,
    show() { this.st = 'show'; this.t = -.4; },
    onClick(wx, wy) {
      if (this.st === 'done') return false;
      if (t4Asked(wx, wy, KX)) { if (this.st === 'idle') { this.k.bounce = .8; toast('Bác thợ in nhờ in năm bức tranh: in đúng thứ tự các ván khắc bác giơ lên nhé!', 3.8); } if (this.st === 'input' || this.st === 'idle') { AU.pluck(76); this.show(); } return true; }
      const i = T4_INKS.findIndex((_, k) => Math.abs(wx - BX(k)) < 26 && wy > BY - 50 && wy < BY + 16); if (i < 0) return false;
      if (this.st !== 'input') return true;
      const ink = T4_INKS[i]; this.press[ink] = .25;
      if (ink !== this.order[this.step]) {
        this.st = 'smear'; this.t = 0; AU.pluck(50); AU.thump();
        if (!this.toldWrong) { this.toldWrong = true; toast('In sai thứ tự, tranh nhoè mất rồi! Chạm vào bác thợ in để xem lại.', 3.4); }
        return true;
      }
      this.layers.push(ink); this.step++; AU.stamp();
      if (this.step === 5) { this.st = 'printed'; this.t = 0; setTimeout(() => AU.pluck(86), 200); }
      return true;
    },
    update(dt) {
      this.t += dt; this.k.bounce = Math.max(0, this.k.bounce - dt);
      for (const k in this.press) this.press[k] -= dt;
      if (this.st === 'show') { const k = Math.floor(this.t / .8); if (this.t > 0 && k < 5 && this.lastLit !== k) { this.lastLit = k; AU.pluck(72 + k * 2); } if (this.t > 4.2) { this.st = 'input'; this.lastLit = -1; } }
      if (this.st === 'smear' && this.t > 1.1) { this.st = 'input'; this.layers = []; this.step = 0; }
      if (this.st === 'printed' && this.t > 2.2) {
        this.round++; S.prints = this.round;
        if (this.round >= 5) { this.st = 'done'; t4Thanks(this, KX, 'Đủ năm bức tranh đẹp! Bác thợ in cảm tạ, biếu một đồng.'); }
        else { this.layers = []; this.step = 0; this.order = newOrder(); this.show(); }
      }
    },
    draw(g) {
      dp(g, WP.house, W + 500, GROUND + 4, 0, .8, .8);
      // the board with the sheet, the finished ones pinned beside it
      g.fillStyle = '#6a4a2a'; g.strokeStyle = INK; g.lineWidth = 2.4; g.fillRect(PX - 72, PY - 82, 144, 164); g.strokeRect(PX - 72, PY - 82, 144, 164);
      
      const subj = Math.min(4, this.round), done = this.st === 'done';
      if (!done) {
        t4Print(g, subj, this.layers, PX, PY, 1.1);
        if (this.st === 'smear') { const a = Math.min(1, this.t * 4); g.fillStyle = `rgba(42,34,29,${.55 * a})`; for (const [dx, dy, r] of [[-10, 0, 34], [14, -20, 22], [8, 26, 26], [-22, -30, 16]]) { g.beginPath(); g.ellipse(PX + dx, PY + dy, r, r * .7, dx, 0, 6.283); g.fill(); } }
      }
      for (let k = 0; k < 5; k++) { const x = PX - 94, y = PY - 64 + k * 32; if (k < this.round) t4Print(g, k, T4_INKS, x, y, .22); else { g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 1.4; g.setLineDash([3, 3]); g.strokeRect(x - 11, y - 13.2, 22, 26.4); g.setLineDash([]); } }
      if (done) t4Print(g, 4, T4_INKS, PX, PY, 1.1);
      // the table and the blocks; while showing, the one to print next is raised
      g.fillStyle = '#8a5a2a'; g.strokeStyle = INK; g.lineWidth = 2.4; g.fillRect(BX(0) - 34, BY + 8, BX(4) - BX(0) + 68, 10); g.strokeRect(BX(0) - 34, BY + 8, BX(4) - BX(0) + 68, 10);
      for (const x of [BX(0) - 26, BX(4) + 26]) { g.beginPath(); g.moveTo(x, BY + 18); g.lineTo(x, GROUND); g.stroke(); }
      const lit = this.st === 'show' && this.t > 0 && (this.t % .8) < .62 ? this.order[Math.floor(this.t / .8)] : null;
      T4_INKS.forEach((ink, k) => t4Block(g, ink, BX(k), BY, ink === lit, this.press[ink] || 0));
    },
    drawMid(g) {
      t4Folk(g, 6, KX, this.k);
      if (this.st === 'idle' && groom.x > W - 300) t4Dots(g, KX - 10);
      if (this.st === 'input' && !this.step) sparkle(g, KX + 20, GROUND - 150, 6, .3 + .3 * Math.sin(S.t * 3));
    },
  };
  return e;
}

/* ---------- 3 · the drying yard ---------- */
function t4Cloud(g, x, y, s, dark) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const blobs = [[-26, 6, 18], [-6, -6, 24], [18, 0, 20], [34, 10, 13], [2, 12, 20], [-38, 14, 11]];
  g.fillStyle = dark; g.strokeStyle = INK; g.lineWidth = 2.2;
  for (const [a, b, r] of blobs) { g.beginPath(); g.arc(a, b, r, 0, 6.283); g.stroke(); }
  for (const [a, b, r] of blobs) { g.beginPath(); g.arc(a, b, r - 1, 0, 6.283); g.fill(); }
  g.strokeStyle = 'rgba(242,236,222,.5)'; g.lineWidth = 1.6; g.beginPath(); g.arc(-6, -2, 8, 3.4, 6.6); g.stroke(); g.beginPath(); g.arc(14, 4, 6, 3.4, 6.4); g.stroke();
  g.restore();
}
function t4Drying(W) {
  const KX = W + 420, cells = [];
  for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++) cells.push([W + 30 + c * 100 + (R() - .5) * 30, 34 + r * 46 + (R() - .5) * 14]);
  for (let k = 0; k < 6; k++) cells.push([W + 80 + R() * 440, 30 + R() * 100]);
  const top = () => -offY + 30;                                         // y of a cloud is from the top of the view
  const [SX, SY] = cells[(R() * 18) | 0], clouds = cells.map(([x, y]) => ({ x, y, s: 1.1 + R() * .4 }));
  const far = []; for (let x = 60; x < 4800; x += 150 + R() * 70) if ((x < W - 90 || x > W + 640) && !(x > 650 && x < 2500)) far.push({ x, y: 30 + R() * 50, s: .9 + R() * .4 });   // the rest of the sky: a thinner cover (none over the dye house and the print house, whose jars and board stand high), not to be moved
  const e = {
    layer: 'bg', ax: W, st: 'idle', dry: 0, k: { bounce: 0 }, rainK: 1,
    onClick(wx, wy) {
      if (this.st !== 'idle' || !t4Asked(wx, wy, KX)) return false;
      this.st = 'rain'; this.k.bounce = .8; AU.pluck(70); toast('Mưa mãi không tạnh, mây đen kín trời, tranh phơi ướt sũng chẳng khô được…', 3.8); return true;
    },
    grab(wx, wy) {
      if (this.st !== 'rain') return null;
      let best = null, bd = 1e9; for (const c of clouds) { const d = Math.hypot(wx - c.x, wy - top() - c.y); if (d < 52 * c.s && d < bd) { bd = d; best = c; } }
      if (!best) return null;
      AU.swoosh(); return { ent: this, c: best, ox: best.x - wx, oy: top() + best.y - wy, x: wx, y: wy, draw() {} };
    },
    drop() {},
    update(dt) {
      this.k.bounce = Math.max(0, this.k.bounce - dt);
      const d = S.drag && S.drag.ent === this ? S.drag : null; if (d) { d.c.x = d.x + d.ox; d.c.y = Math.min(GROUND - 340, d.y + d.oy) - top(); }
      this.rainK += ((this.st === 'rain' || this.st === 'idle' ? 1 : 0) - this.rainK) * Math.min(1, dt * 1.5);
      if (this.st === 'rain' && clouds.every(c => Math.hypot(c.x - SX, c.y - SY) > 40 + 42 * c.s)) { this.st = 'sun'; S.drag = null; AU.pluck(84); setTimeout(() => AU.pluck(91), 160); toast('Mây tan, nắng vàng lên rồi!', 2.4); }
      if (this.st === 'sun') { this.dry = Math.min(1, this.dry + dt / 2.6); for (const c of clouds) { c.x += (c.x < SX ? -1 : 1) * 30 * dt; c.y -= 8 * dt; }
        if (this.dry >= 1) { this.st = 'done'; t4Thanks(this, KX, 'Tranh khô cong, màu tươi rói! Bà phơi tranh cảm tạ, biếu một đồng.'); } }
    },
    draw(g) {
      // the sun behind its clouds
      const sun = this.st === 'sun' || this.st === 'done';
      g.save(); g.translate(SX, top() + SY); g.rotate(S.t * .15);
      g.fillStyle = sun ? '#e8a03a' : '#b8935a'; g.strokeStyle = INK; g.lineWidth = 2;
      for (let k = 0; k < 12; k++) { g.save(); g.rotate(k * Math.PI / 6); g.beginPath(); g.moveTo(-6, -36); g.lineTo(0, -52 - (sun ? Math.sin(S.t * 4 + k) * 4 : 0)); g.lineTo(6, -36); g.closePath(); g.fill(); g.stroke(); g.restore(); }
      g.beginPath(); g.arc(0, 0, 32, 0, 6.283); g.fillStyle = sun ? '#f2c640' : '#c9ac6a'; g.fill(); g.stroke(); g.restore();
      const vw = cv.width / DPR / scale;
      far.forEach((c, i) => { if (c.x > camX - 140 && c.x < camX + vw + 140) c4Cloud(g, c.x, top() + c.y, c.s, i % 3, sun ? '#ece6dc' : '#5e5866'); });
      clouds.forEach((c, i) => c4Cloud(g, c.x, top() + c.y, c.s, i % 3, sun ? '#ece6dc' : '#5e5866'));   // chương IV's clouds, dark with rain
      // the drying lines and the five prints from the print house, wet and dark until the sun dries them
      g.strokeStyle = '#7a5a2a'; g.lineWidth = 5; g.beginPath(); for (const x of [W + 40, W + 330]) { g.moveTo(x, GROUND); g.lineTo(x, GROUND - 312); } g.stroke();
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(W + 40, GROUND - 302); g.quadraticCurveTo(W + 185, GROUND - 288, W + 330, GROUND - 302); g.stroke();
      for (let k = 0; k < 5; k++) {
        const x = W + 85 + k * 50, y = GROUND - 260 + Math.abs(k - 2) * -3, sway = Math.sin(S.t * (this.st === 'rain' ? 2.4 : 1.2) + k) * .04;
        g.save(); g.translate(x, y - 36); g.rotate(sway); t4Print(g, k, T4_INKS, 0, 36, .38, 1 - this.dry); g.restore();
        g.fillStyle = '#a3332a'; g.fillRect(x - 3, y - 46, 6, 9);
        if (this.st === 'rain') { const ph = (S.t * 1.3 + k * .37) % 1; g.fillStyle = 'rgba(80,110,150,.7)'; g.beginPath(); g.ellipse(x - 10 + k % 3 * 9, y + 26 + ph * 40, 2, 3, 0, 0, 6.283); g.fill(); }
      }
    },
    drawMid(g) {
      t4Folk(g, 8, KX, this.k);
      if (this.st === 'idle' && groom.x > W - 300) t4Dots(g, KX - 10);
      if (this.st === 'rain') t4Bubble(g, KX - 10, GROUND - 150, 64, g => { g.save(); g.scale(.4, .4); g.fillStyle = '#f2c640'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 30, 0, 6.283); g.fill(); g.stroke(); for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, -38); g.lineTo(0, -50); g.stroke(); } g.restore(); });
    },
    drawHud(g, vw) {                                  // the rain over the whole view, drawn the way chương IV draws it
      if (this.rainK < .02) return;
      g.strokeStyle = `rgba(47,95,143,${.35 * this.rainK})`; g.lineWidth = 1.5; g.beginPath();
      for (let i = 0, rr = mulberry(7 + ((S.t * 12) | 0)); i < 70; i++) { const x = rr() * vw, y = rr() * viewH; g.moveTo(x, y); g.lineTo(x - 6, y + 16); }
      g.stroke(); g.fillStyle = `rgba(80,90,110,${.12 * this.rainK})`; g.fillRect(0, 0, vw, viewH);
    },
  };
  return e;
}

/* ---------- 4 · the bamboo bridge ---------- */
function t4Cart(g, x, y, tilt) {                       // a hand cart heaped with rolled-up paintings
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(1.45, 1.45);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -26); g.lineTo(-70, -40); g.stroke();
  g.fillStyle = '#8a5a2a'; g.lineWidth = 2.4; g.fillRect(-44, -32, 88, 12); g.strokeRect(-44, -32, 88, 12);
  [['#e8b83a', -26, -42], ['#a3332a', 0, -42], ['#2f6a4c', 26, -42], ['#f6f1e4', -13, -60], ['#e8b83a', 13, -60]].forEach(([c, a, b]) => { g.fillStyle = c; g.beginPath(); g.ellipse(a, b, 13, 9, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.ellipse(a, b, 4, 3, 0, 0, 6.283); g.stroke(); });
  g.fillStyle = '#6a4a2a'; g.beginPath(); g.arc(0, -16, 16, 0, 6.283); g.fill(); g.stroke();
  g.lineWidth = 1.6; g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4 + x * .06; g.moveTo(Math.cos(a) * 15, -16 + Math.sin(a) * 15); g.lineTo(-Math.cos(a) * 15, -16 - Math.sin(a) * 15); } g.stroke();
  g.restore();
}
function t4Bridge(g0, g1) {
  const water = WP.pondFor(g1 - g0, 'blue'), START = g0 - 60, END = g1 + 120, span = g1 - g0, mid = (g0 + g1) / 2;
  const e = {
    layer: 'bg', ax: mid, range: 480, gap: [g0, g1], st: 'wait', cx: START, strain: 0, crack: 0, k: { bounce: 0 }, warned: false,
    arch(x) { return x < g0 || x > g1 ? 0 : -28 * Math.sin(Math.PI * (x - g0) / span); },
    held() { return S.drag && S.drag.ent === this; },
    sag(x) { if (x < g0 || x > g1) return 0; const on = this.cx > g0 && this.cx < g1, u = (x - g0) / span; return Math.sin(Math.PI * u) * (on ? (this.held() ? 4 : 10 + 16 * this.strain) : 3); },
    onClick(wx, wy) {
      if (this.st !== 'wait' || wx < this.cx - 125 || wx > this.cx + 75 || wy < GROUND - 215 || wy > GROUND + 10) return false;
      if (Math.abs(groom.x - this.cx) > 420) { toast('Đến gần mà giúp ông cụ một tay!', 2.2); return true; }
      this.st = 'go'; AU.creak(); toast('Cả đoàn xúm vào đẩy xe với ông cụ!', 2.4); return true;
    },
    grab(wx, wy) {
      if (this.st === 'done' || Math.abs(wx - mid) > span / 2 - 10 || wy < GROUND - 120 || wy > GROUND + 70) return null;
      AU.click(); return { ent: this, x: wx, y: wy, draw: g => { g.strokeStyle = INK; g.lineWidth = 2.4; g.fillStyle = 'rgba(242,236,222,.6)'; g.beginPath(); g.arc(S.drag.x, S.drag.y, 16, 0, 6.283); g.fill(); g.stroke(); } };
    },
    drop() {},
    update(dt) {
      this.k.bounce = Math.max(0, this.k.bounce - dt); this.crack = Math.max(0, this.crack - dt);
      // pushing: the party walks right behind the cart (and is dragged back with it); no walking off meanwhile
      S.lockMove = this.st === 'go' || this.st === 'back';
      if (S.lockMove) { groom.x += (this.cx - 110 - groom.x) * Math.min(1, dt * 4); groom.vx = 30; }
      if (this.st === 'go') {
        this.cx += 46 * dt;
        const u = (this.cx - g0) / span, middle = u > .2 && u < .8;
        if (middle && !this.held()) {
          const was = this.strain; this.strain += dt / 1.1;
          if (was < .3 && this.strain >= .3) { AU.creak(); if (!this.warned) { this.warned = true; toast('Cầu tre kêu răng rắc… giữ lấy cầu!', 2.6); } }
          if (this.strain >= 1) { this.st = 'back'; this.crack = 1.6; AU.thump(); AU.creak(); toast('Rắc! Cầu oằn xuống, xe tranh lăn ngược về đầu cầu.', 3); }
        } else this.strain = Math.max(0, this.strain - dt * 1.4);
        if (this.cx > END) { this.st = 'done'; this.strain = 0; S.lockMove = false; t4Thanks(this, END + 60, 'Xe tranh qua cầu rồi! Ông cụ cảm tạ cả đoàn, biếu một đồng.'); }
      } else if (this.st === 'back') {
        this.cx = Math.max(START, this.cx - 170 * dt); this.strain = Math.max(0, this.strain - dt);
        if (this.cx <= START && this.crack <= 0) this.st = 'wait';
      }
    },
    draw(g) {
      dp(g, water, g0, GROUND);
      // the bridge: bamboo poles bending under the cart, a prop under the middle while you hold it
      const y = x => GROUND - 4 + this.arch(x) + this.sag(x);
      if (this.held()) { g.strokeStyle = '#7a5a2a'; g.lineWidth = 7; g.beginPath(); g.moveTo(mid, GROUND + 56); g.lineTo(mid, y(mid)); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(mid - 4, GROUND + 56); g.lineTo(mid - 4, y(mid)); g.moveTo(mid + 4, GROUND + 56); g.lineTo(mid + 4, y(mid)); g.stroke(); }
      for (const [dy, w, c] of [[0, 7, '#c9a24a'], [-30, 3, '#7a5a2a']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); for (let x = g0 - 20; x <= g1 + 20; x += 10) { const yy = y(x) + dy; x === g0 - 20 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); for (let x = g0 - 10; x <= g1 + 10; x += 26) { g.moveTo(x, y(x) - 30); g.lineTo(x, y(x)); } g.stroke();
      g.beginPath(); for (let x = g0 - 20; x <= g1 + 20; x += 10) { const yy = y(x) + 3.5; x === g0 - 20 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    },
    drawMid(g) {
      const yy = x => this.arch(x) + this.sag(x), tilt = (yy(this.cx + 20) - yy(this.cx - 20)) / 40, cy = GROUND + yy(this.cx) - 4;
      const pushing = this.st === 'go' || this.st === 'back';
      t4Folk(g, 9, this.st === 'done' ? END + 80 : this.cx - 74, Object.assign(this.k, { walk: pushing, arm: -1 }), this.st === 'done' ? -1 : 1);
      t4Cart(g, this.cx, cy, tilt);
      if (this.st === 'wait' && groom.x > g0 - 700) t4Dots(g, this.cx - 84);
    },
  };
  return e;
}

/* ---------- the market gate: lính cụ Lý wants four coins ---------- */
function t4MarketGate(g, x) {
  g.strokeStyle = INK; g.lineWidth = 2.4;
  for (const px of [x - 66, x + 66]) { g.fillStyle = '#8a3a22'; g.fillRect(px - 9, GROUND - 236, 18, 236); g.strokeRect(px - 9, GROUND - 236, 18, 236); g.fillStyle = '#5b2f1f'; g.fillRect(px - 13, GROUND - 14, 26, 14); g.strokeRect(px - 13, GROUND - 14, 26, 14); }
  g.fillStyle = '#8a3a22'; g.fillRect(x - 80, GROUND - 236, 160, 12); g.strokeRect(x - 80, GROUND - 236, 160, 12);
  // the roof: dark tiles, the ridge curling up at both ends, a green ridge line
  g.fillStyle = '#2a221d'; g.beginPath(); g.moveTo(x - 112, GROUND - 238); g.quadraticCurveTo(x - 96, GROUND - 252, x - 80, GROUND - 270); g.lineTo(x + 80, GROUND - 270); g.quadraticCurveTo(x + 96, GROUND - 252, x + 112, GROUND - 238); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#f2ecde'; g.lineWidth = 1.4; g.beginPath(); for (let k = -3; k <= 3; k++) { g.moveTo(x + k * 26 - 6, GROUND - 246); g.quadraticCurveTo(x + k * 26, GROUND - 252, x + k * 26 + 6, GROUND - 246); } g.stroke();
  g.strokeStyle = INK; g.lineWidth = 2.4; g.fillStyle = '#2f6a4c'; g.beginPath(); g.moveTo(x - 92, GROUND - 268); g.quadraticCurveTo(x - 100, GROUND - 286, x - 112, GROUND - 284); g.lineTo(x - 84, GROUND - 276); g.lineTo(x + 84, GROUND - 276); g.lineTo(x + 112, GROUND - 284); g.quadraticCurveTo(x + 100, GROUND - 286, x + 92, GROUND - 268); g.closePath(); g.fill(); g.stroke();
  // the board
  g.fillStyle = '#e8b83a'; g.fillRect(x - 46, GROUND - 222, 92, 40); g.strokeRect(x - 46, GROUND - 222, 92, 40); g.strokeStyle = '#a3332a'; g.lineWidth = 2; g.strokeRect(x - 41, GROUND - 217, 82, 30);
  g.fillStyle = '#a3332a'; g.font = '900 24px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CHỢ', x, GROUND - 201); g.textBaseline = 'alphabetic';
  // red lanterns hung from the eaves, clear of the board
  for (const lx of [x - 96, x + 96]) { g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(lx, GROUND - 240); g.lineTo(lx, GROUND - 214); g.stroke(); g.fillStyle = '#c0402f'; g.beginPath(); g.ellipse(lx, GROUND - 200, 10, 14, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#e8b83a'; g.fillRect(lx - 4, GROUND - 188, 8, 5); }
}
function t4Gate(x, need) {
  return {
    layer: 'bg', gateX: x, ax: x, opened: false, paid: false, k: { bounce: 0 }, told: false,
    wall() { return this.opened ? null : x - 120; },
    update(dt) {
      this.k.bounce = Math.max(0, this.k.bounce - dt);
      if (groom.x < x - 520) this.told = false;
      if (this.paid || groom.x < x - 270) return;
      if (S.coinShown >= need && !S.coinFx.length) {
        this.paid = true; this.k.bounce = 1.2;
        for (let k = 0; k < need; k++) setTimeout(() => { S.coinFx.push({ x: x - 70 - camX, y: GROUND - 90 + offY, t: 0, slot: need - 1 - k, rev: true }); AU.pluck(84 + k * 2); }, k * 180);
        setTimeout(() => { this.opened = true; AU.creak(); toast('Lính cụ Lý nhận đủ bốn đồng, mở cổng cho đoàn vào chợ!', 3.4); }, need * 180 + 900);
      } else if (!this.told) { this.told = true; toast('Lính cụ Lý chống giáo: "Nộp đủ bốn đồng mới được vào chợ!"', 3.6); }
    },
    draw(g) {
      for (const sx of [x + 130, x + 230]) dp(g, MP.stall, sx, GROUND + 4, 0, .85, .85);
      t4MarketGate(g, x);
      const gx = this.opened ? x + 150 : x - 70, b = this.k.bounce > 0 ? Math.abs(Math.sin(this.k.bounce * 12)) * 6 : 0;
      // the spear, the soldier, his lacquered nón dấu
      g.strokeStyle = '#6a4a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx - 26, GROUND); g.lineTo(gx - 26, GROUND - 176 - b); g.stroke();
      g.fillStyle = '#9a9a92'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(gx - 26, GROUND - 204 - b); g.lineTo(gx - 32, GROUND - 178 - b); g.lineTo(gx - 20, GROUND - 178 - b); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#a3332a'; g.beginPath(); g.moveTo(gx - 26, GROUND - 178 - b); g.lineTo(gx - 34, GROUND - 160 - b); g.lineTo(gx - 18, GROUND - 160 - b); g.closePath(); g.fill(); g.stroke();
      c4Mouse(g, c4MouseRig(1), gx, -1, S.pose * 2, false, this.k.bounce > 0 ? -1.3 : -.9, null, 1, GROUND - b, 3);
      g.fillStyle = '#2a221d'; g.beginPath(); g.moveTo(gx - 34, GROUND - 124 - b); g.lineTo(gx - 6, GROUND - 146 - b); g.lineTo(gx + 22, GROUND - 124 - b); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#a3332a'; g.beginPath(); g.arc(gx - 6, GROUND - 149 - b, 4, 0, 6.283); g.fill(); g.stroke();
      if (!this.paid && groom.x > x - 700) t4Bubble(g, gx - 10, GROUND - 160, need * 28 + 18, g => { for (let k = 0; k < need; k++) { const cx = -(need - 1) * 14 + k * 28; if (k < S.coinShown) t4Coin(g, cx, 0, 10); else { g.strokeStyle = INK; g.lineWidth = 1.6; g.setLineDash([3, 3]); g.beginPath(); g.arc(cx, 0, 10, 0, 6.283); g.stroke(); g.setLineDash([]); } } }, 40);
    },
  };
}

/* ---------- tranh 4 ---------- */
LEVELS[3] = {
  han: '東湖', name: 'Làng Tranh', paper: 'white', width: 4800, zoom: 1.45, zoomWide: .68, key: -2, abil: ['drum', 'ken', 'parasol'], cps: [160, 860, 1760, 2710, 3540],
  intro: '', endTitle: 'Qua Làng Tranh', endText: 'Pha màu, in tranh, gọi nắng, giữ cầu: làng tranh Đông Hồ cảm tạ bốn đồng tiền. Lính cụ Lý mở cổng, đoàn rước vào chợ.',
  build: () => {
    S.coins = 0; S.coinShown = 0; S.coinFx = []; S.prints = 0;
    return [
      decor(PROPS.bamboo, 250, GROUND + 4, .8), decor(WP.house, 1500, GROUND + 4, .8), decor(PROPS.bamboo, 2500, GROUND + 4, .9), decor(WP.house, 3420, GROUND + 4, .7),
      decor(MP.lanterns, 4350, GROUND - 262), decor(MP.lanterns, 4700, GROUND - 262), decor(PROPS.bamboo, 3330, GROUND + 4, 1),
      t4Dyer(900), t4Printer(1800), t4Drying(2750), t4Bridge(3700, 3960),
      secretSpot(3360, 'drum', 'Tùng! Từ ngọn tre rơi xuống một mảnh triện đỏ!'),
      t4Gate(4560, 4), t4Purse(4),
    ];
  },
};
