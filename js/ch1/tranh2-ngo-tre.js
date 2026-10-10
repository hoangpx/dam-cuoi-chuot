/* Tranh 2 · Ngõ Tre 𡉦𥯌 — the silent rooster (ò ó o), the roof cat, the pomelo ditch. */
// Gà trống chắn ngõ, cứ vươn cổ gáy mà không ra tiếng. Ba chữ ò, ó, o lơ lửng trong bụi tre (to, vừa, nhỏ);
// kéo từng chữ thả vào con gà theo đúng thứ tự ò → ó → o (sai thì cả hàng bay về bụi tre). Đủ ba chữ thì gà
// nhảy lên ngọn tre gáy vang "ò ó o" và nhường đường.
const CROW = ['ò', 'ó', 'o'];
let CROW_TILES = null;
function crowTiles() {
  if (CROW_TILES) return CROW_TILES;
  const display = '"Playfair Display", serif';
  CROW_TILES = {};
  for (const ch of CROW) CROW_TILES[ch] = part([-24, -30, 24, 30], a => {
    a.fk('white', smooth([[-20, -26], [0, -28], [21, -25], [22, 0], [20, 26], [0, 28], [-21, 25], [-22, 0]]), 2.4);
    a.text(ch, 0, 2, 40, 'dark', display, 'ink', 900);
  });
  return CROW_TILES;
}
function rooster(x, hayX, pegs, perchH = 106) {
  // pegs: where each letter floats among the bamboo, [x, height, size, letter]
  const beakX = x - 44, beakY = GROUND - 84;
  const letters = pegs.map(([px, h, sc, ch]) => ({ ch, hx: px, hy: GROUND - h, sc, x: px, y: GROUND - h, st: 'hang', sw: R() * 6 }));
  const e = {
    layer: 'mid', st: 'block', t: 0, ax: x, crowT: 1.5, open: 0, placed: [],
    wall() { return this.st === 'block' ? x - 60 : null; },
    grab(wx, wy) {
      if (this.st !== 'block') return null;
      for (const l of letters) if (l.st !== 'placed' && Math.hypot(wx - l.x, wy - l.y) < 30 * l.sc) {
        l.st = 'drag';
        return { item: 'crow', ent: this, l, x: wx, y: wy, draw: g => dp(g, crowTiles()[l.ch], l.x, l.y, Math.sin(S.t * 8) * .05, l.sc, l.sc) };
      }
      return null;
    },
    drop(d) {
      const l = d.l;
      const inFront = Math.abs(d.x - (x + 10)) < 90 && d.y > GROUND - 160 && d.y < GROUND + 10;   // dropped onto the rooster
      const ok = inFront && l.ch === CROW[this.placed.length];
      if (ok) { l.st = 'placed'; l.ly = d.y; const i = this.placed.length; l.px = beakX + 4 - i * 34; l.py = GROUND - 168 - i * 50; this.placed.push(l); AU.pluck(76 + this.placed.length * 3); if (this.placed.length === 3) { this.st = 'hop'; this.t = 0; } }
      else { l.st = 'back'; AU.pluck(60); if (inFront) { for (const p of this.placed) p.st = 'back'; this.placed = []; } }
    },
    update(dt) {
      this.t += dt;
      for (const l of letters) {
        if (l.st === 'drag') { const dr = S.drag; if (dr && dr.l === l) { l.x = dr.x; l.y = dr.y; } else l.st = 'back'; }
        else if (l.st === 'placed') { l.x += (l.px - l.x) * Math.min(1, dt * 10); l.y += (l.py - l.y) * Math.min(1, dt * 10); }
        else if (l.st === 'back' || l.st === 'hang') { const tx = l.hx + Math.sin(S.t * .9 + l.sw) * 6, ty = l.hy + Math.sin(S.t * 1.3 + l.sw * 2) * 7, k = Math.min(1, dt * (l.st === 'back' ? 3.5 : 8)); l.x += (tx - l.x) * k; l.y += (ty - l.y) * k; if (l.st === 'back' && Math.hypot(tx - l.x, ty - l.y) < 4) l.st = 'hang'; }
      }
      if (this.st === 'block') {                 // a silent crow every few seconds
        if ((this.crowT -= dt) <= 0) { this.crowT = 2.6 + R() * 1.6; this.cr = 1.1; }
        this.cr = Math.max(0, (this.cr || 0) - dt);
        this.open = this.cr > 0 ? Math.sin((1 - this.cr / 1.1) * Math.PI) : 0;
      }
      if (this.st === 'hop' && this.t > .8) {
        this.st = 'crow'; this.t = 0; this.open = 1; AU.crow();
        S.fx.push(...CROW.map((ch, i) => ({ kind: 'crowCh', life: 2.2, ch, t: -i * .35 - (i === 2 ? .2 : 0), x: hayX + 50, y: GROUND - perchH - 92 })));
        for (const l of letters) l.st = 'gone';
      }
      if (this.st === 'crow') { this.open = this.t < 1.3 ? 1 : 0; if (this.t > 1.3) this.st = 'perch'; }
    },
    draw(g) { if (this.st !== 'crow' && this.st !== 'perch') this.bird(g); },
    bird(g) {
      let px = x, py = GROUND, fly = false;
      if (this.st === 'hop') { const k = Math.min(1, this.t / .8); px = x + (hayX - x) * k; py = GROUND - perchH * k - Math.sin(k * Math.PI) * 90; fly = true; }
      if (this.st === 'crow' || this.st === 'perch') { px = hayX; py = GROUND - perchH; }
      const up = this.open;
      g.save(); g.translate(px, py); if (this.st === 'crow' || this.st === 'perch') g.scale(-1, 1);
      if (fly) dp(g, WP.rWing, 12, -58, Math.sin(S.pose * 18) * .5, 1, 1);
      dp(g, WP.rooster, 0, 0);
      dp(g, WP.rHead, -18 + up * 4, -76 - up * 12, up * .6);
      if (fly) dp(g, WP.rWing, 2, -60, -.3 + Math.sin(S.pose * 18 + 1) * .5, -1, 1);
      g.restore();
    },
    drawFg(g) {
      if (this.st === 'crow' || this.st === 'perch') this.bird(g);
      for (const l of letters) if (l.st === 'hang' || l.st === 'back') dp(g, crowTiles()[l.ch], l.x, l.y, Math.sin(S.t * 1.4 + l.sw) * .08, l.sc, l.sc);
      for (const l of letters) if (l.st === 'placed') dp(g, crowTiles()[l.ch], l.x, l.y, Math.sin(S.t * 2 + l.sw) * .04, l.sc, l.sc);
    },
  };
  return e;
}
function roofCat(x0, x1) {
  const cx = (x0 + x1) / 2, catX = cx + 50;
  return {
    layer: 'bg', watcher: true, mode: 'above', kind: 'roof', x: catX, z0: cx - 270, z1: cx + 270, st: 'sleep', t: 3, ax: catX, range: 520,
    catchMsg: () => 'Mèo trên mái vồ xuống!',
    onDrum() { if (this.st === 'sleep') { this.st = 'watch'; this.t = 2.4; AU.meow(); toast('Tiếng trống làm mèo trên mái thức giấc!'); return true; } return false; },
    update(dt) {
      if (S.caught) return;
      if (!S.told.roof && groom.x > x0 - 260) { S.told.roof = true;  }
      if (groom.x < x0 - 250 || groom.x > x1 + 150) { this.st = 'sleep'; this.t = 1.5 + R(); return; }
      tickWatcher(this, dt);
    },
    draw(g) {
      dp(g, WP.house, cx, GROUND + 4, 0, .8, .8);
      let x = catX, y = GROUND - 192;
      if (S.catcher === this) { const p = S.caught, k = Math.min(1, p / .45), back = p > .45 ? Math.max(0, 1 - (p - .45) / .6) : 1; x += (this.from0 - catX) * k * back; y += 190 * Math.sin(k * Math.PI / 2) * back; }
      drawCatAt(g, x, y, .62, S.catcher === this ? 'watch' : this.st);
    },
  };
}
function pomeloDitch(treeX, g0, g1) {
  const ditch = WP.ditchFor(g1 - g0), mid = (g0 + g1) / 2;
  return {
    layer: 'bg', st: 'empty', t: 0, ax: treeX, range: 420, gap: [g0, g1],
    wall() { return this.st !== 'filled' ? g0 - 10 : null; },
    hint: () => 'Rãnh sâu quá, không qua được. Trên cây bưởi có một quả đã chín, đung đưa khác mấy quả kia. Chạm vào đúng quả đó.',
    ripe: [treeX + 86, GROUND - 140],
    onClick(wx, wy) {
      if (this.st !== 'empty') return false;
      const [rx, ry] = this.ripe;
      if (Math.hypot(wx - rx, wy - ry) < 26) { this.st = 'fall'; this.t = 0; AU.pluck(84); toast('Bộp!', 1); return true; }
      for (const [fx, fy] of [[-40, -176], [70, -198], [-80, -150], [16, -244]]) if (Math.hypot(wx - (treeX + fx), wy - (GROUND + 4 + fy)) < 22) { toast('Quả này còn xanh, bám chặt lắm.', 1.8); AU.pluck(62); return true; }
      return false;
    },
    onDrum() { if (this.st === 'empty') toast('Tùng tùng… bưởi không rụng vì tiếng trống đâu.', 2.2); return false; },
    update(dt) { this.t += dt; if (this.st === 'fall' && this.t > .5 && !this.hit) { this.hit = true; AU.thump(); } if (this.st === 'fall' && this.t > 1.5) { this.st = 'filled'; AU.plop(); toast('Quả bưởi lăn xuống lấp rãnh. Đi được rồi!'); } },
    draw(g) {
      const shake = this.st === 'fall' && this.t < .5 ? Math.sin(this.t * 60) * .02 : 0;
      dp(g, WP.pomelo, treeX, GROUND + 4, shake);
      dp(g, ditch, g0, GROUND);
      const [rx, ry] = this.ripe;
      let fx = rx, fy = ry, rot = Math.sin(S.pose * 2.2) * .18, sc = 1;
      if (this.st === 'fall') {
        const t = this.t;
        if (t < .5) { const k = t / .5; sc = 1 + 2.1 * k; fy = ry + (GROUND - 40 - ry) * k * k; }
        else if (t < 1.3) { const k = (t - .5) / .8; sc = 3.1; fx = rx + (mid - rx) * k; fy = GROUND - 40 - Math.abs(Math.sin(k * Math.PI * 2)) * 24 * (1 - k); rot = k * 6; }
        else { const k = Math.min(1, (t - 1.3) / .2); sc = 3.1; fx = mid; fy = GROUND - 40 + 70 * k; rot = 6; }
      }
      if (this.st === 'filled') { fx = mid; fy = GROUND + 30; rot = 6; sc = 3.1; }
      if (this.st === 'empty') { g.save(); g.translate(rx, ry - 14); g.rotate(rot); g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -8); g.stroke(); g.restore(); }
      dp(g, WP.fruit, fx, fy, rot, sc, sc);
    },
  };
}

/* ---------- tranh 2 ---------- */
LEVELS[1] = {
  han: '𡉦𥯌', name: 'Ngõ Tre', paper: 'pink', width: 2800, key: 2, abil: ['drum', 'parasol'], cps: [160, 720, 1640, 2160],
  intro: 'Mở khoá Trống (phím 1) và Lọng (phím 3). Tiếng trống làm muông thú giật mình. Lọng che khỏi con mắt trên cao, nhưng chỉ giương được 3 giây.',
  endTitle: 'Qua Ngõ Tre', endText: 'Gà trống, mèo trên mái, rãnh sâu đều đã qua. Ra khỏi ngõ là tới bờ ao.',
  build: () => [
    decor(WP.hanFor('𡉦𥯌'), 70, 120, .7), decor(PROPS.bamboo, 360, GROUND + 4, .95), decor(WP.fence, 700, GROUND + 4),
    secretSpot(360, 'drum', 'Tùng! Từ bụi tre rơi xuống một mảnh triện đỏ!'),
    rooster(600, 392, [[348, 228, 1.35, 'ó'], [408, 282, 1.08, 'o'], [470, 258, .85, 'ò']], 190), roofCat(980, 1540), decor(PROPS.bamboo, 1680, GROUND + 4, 1, -1),
    pomeloDitch(1880, 2010, 2110), decor(PROPS.bamboo, 2380, GROUND + 4, .9), gate(2640),
  ],
};
