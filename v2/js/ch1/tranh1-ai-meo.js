/* Tranh 1 · Ải Mèo 貓關 — the fish pond and the hungry cat. */
/* Màn 1: ao cá có cầu ván, chạm vào con cá để bắt */
function fishPond(g0, g1) {
  const water = WP.pondFor(g1 - g0);
  // swim → out (leaps onto a bank) → bank (flops, the only moment it can be grabbed) → in (leaps back)
  const f = { x: (g0 + g1) / 2, dir: 1, st: 'swim', t: 0, next: 2, sx: 0, bx: 0 };
  const T_OUT = .7, T_BANK = 1.8, T_IN = .6, WY = GROUND + 26, BY = GROUND - 8;
  const arc = (x0, y0, x1, y1, k) => [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 110];
  const e = {
    layer: 'bg', gap: [g0, g1], caught: false, ax: (g0 + g1) / 2,
    fishPos() {
      if (f.st === 'out') return arc(f.sx, WY, f.bx, BY, Math.min(1, f.t / T_OUT));
      if (f.st === 'bank') return [f.bx, BY - Math.abs(Math.sin(f.t * 9)) * 10];
      if (f.st === 'in') return arc(f.bx, BY, f.sx, WY, Math.min(1, f.t / T_IN));
      return [f.x, WY];
    },
    onClick(wx, wy) {
      if (this.caught || f.st !== 'bank') return false;
      const [fx, fy] = this.fishPos();
      if (Math.hypot(wx - fx, wy - fy) < 40) { this.caught = true; S.inv.push('fish'); AU.pluck(86); return true; }
      return false;
    },
    update(dt) {
      if (this.caught) return;
      f.t += dt;
      if (f.st === 'swim') {
        f.x += f.dir * 70 * dt; if (f.x > g1 - 26) f.dir = -1; if (f.x < g0 + 26) f.dir = 1;
        if (R() < dt * .6) f.dir *= -1;
        if ((f.next -= dt) <= 0) {
          const right = f.x > (g0 + g1) / 2 ? R() < .75 : R() < .25;
          f.st = 'out'; f.t = 0; f.sx = f.x; f.bx = right ? g1 + 34 + R() * 30 : g0 - 34 - R() * 30; f.dir = right ? 1 : -1; AU.plop();
        }
      }
      else if (f.st === 'out' && f.t >= T_OUT) { f.st = 'bank'; f.t = 0; AU.tap(); }
      else if (f.st === 'bank' && f.t >= T_BANK) { f.st = 'in'; f.t = 0; f.sx = f.bx < g0 ? g0 + 40 + R() * 60 : g1 - 40 - R() * 60; f.dir = f.bx < g0 ? 1 : -1; }
      else if (f.st === 'in' && f.t >= T_IN) { f.st = 'swim'; f.t = 0; f.x = f.sx; f.next = 2 + R() * 2.5; AU.plop(); }
    },
    draw(g) {
      dp(g, water, g0, GROUND);
      // plank bridge over the pond
      g.fillStyle = '#5a4838'; g.strokeStyle = INK; g.lineWidth = 1.6;
      for (const px of [g0 + 6, (g0 + g1) / 2, g1 - 6]) { g.fillRect(px - 5, GROUND - 4, 10, 40); g.strokeRect(px - 5, GROUND - 4, 10, 40); }
      for (let px = g0 - 12; px < g1 + 12; px += 26) { g.fillStyle = (px / 26 | 0) % 2 ? '#7a6048' : '#6b5540'; g.fillRect(px, GROUND - 4, 24, 9); g.strokeRect(px, GROUND - 4, 24, 9); }
    },
    drawMid(g) {                               // under water: faint, behind the party
      if (this.caught || f.st !== 'swim') return;
      const [fx, fy] = this.fishPos();
      g.globalAlpha = .55; dp(g, ITEM.fish, fx, fy, Math.sin(S.t * 6) * .08, -f.dir * 1.2, 1.2); g.globalAlpha = 1;
    },
    drawFg(g) {                                // out of the water: in front of everything
      if (this.caught || f.st === 'swim') return;
      const [fx, fy] = this.fishPos();
      const rot = f.st === 'bank' ? Math.sin(f.t * 18) * .5 : f.st === 'out' ? (f.t < T_OUT / 2 ? -.6 : .6) * f.dir : (f.t < T_IN / 2 ? -.6 : .6) * -f.dir;
      dp(g, ITEM.fish, fx, fy, rot, -f.dir * 1.2, 1.2);
    },
  };
  return e;
}
/* Màn 1: mèo ngồi canh cuối đường */
// woodblock label the cat "says": ĐÓI QUÁ on a paper slip, with ink dots trailing to its mouth
let HUNGRY = null;
function slipLabel(lines, w = 34) {
  const display = '"Playfair Display", serif', h = 20 + lines.length * 12;
  return part([-w - 6, -h - 6, w + 42, h + 6], a => {
    a.fk('white', smooth([[-w + 4, -h + 4], [0, -h], [w - 3, -h + 6], [w, 0], [w - 4, h - 4], [0, h], [-w + 3, h - 6], [-w, 0]]), 2.6);
    a.key(smooth([[-w + 10, -h + 12], [0, -h + 9], [w - 9, -h + 13], [w - 7, 0], [w - 10, h - 12], [0, h - 9], [-w + 9, h - 13], [-w + 7, 0]]), 1.2);
    lines.forEach((t, k) => a.text(t, 0, (k - (lines.length - 1) / 2) * 23, 18, 'dark', display, 'ink', 900));
    for (const [x, y, r] of [[w + 10, -6, 5], [w + 22, -14, 3.6], [w + 32, -20, 2.6]]) a.ink(circ(x, y, r));
  });
}
const hungryLabel = () => slipLabel(['ĐÓI', 'QUÁ']);
function groundCat(cx, from) {
  const wallX = cx - 190;
  return {
    layer: 'mid', watcher: true, mode: 'ground', kind: 'cat', x: cx, z0: from, z1: wallX - 90, st: 'sleep', t: 3, fed: false,
    get spent() { return this.fed; },
    wall() { return this.fed ? null : wallX; },
    hint() { return has('fish') ? 'Mèo chắn đường, đòi lễ vật. Dâng cá đi!' : 'Mèo chắn đường. Không có lễ thì đừng hòng qua!'; },
    offer: { wants: ['fish'], label: 'Dâng cá', near: () => groom.x > wallX - 90, missing: 'Mèo chắn đường. Không có lễ thì đừng hòng qua!' },
    give() { this.fed = true; this.st = 'fed'; AU.pluck(81); setTimeout(() => AU.pluck(86), 140); toast('Mèo nhận lễ, cho đoàn rước đi qua.', 3); },
    catchMsg: () => 'Mèo vồ!',
    update(dt) {
      if (this.fed) { this.st = 'fed'; return; }
      if (S.caught) return;
      if (groom.x > wallX - 90) {
        if (!has('fish')) {                    // no fish in hand: the cat says it is hungry, then pounces
          if (!this.hungry) { this.hungry = 2; this.st = 'watch'; AU.meow(); }
          else if ((this.hungry -= dt) <= 0) { this.hungry = 0; caught(this); }
          return;
        }
        this.hungry = 0; this.st = 'block'; return;
      }
      this.hungry = 0;
      if (groom.x < from) { this.st = 'sleep'; this.t = 2 + R() * 1.5; return; }
      if (this.st === 'block') { this.st = 'sleep'; this.t = 1.5; }
      tickWatcher(this, dt);
    },
    draw(g) {
      let x = cx, lift = 0;
      if (S.catcher === this) { const p = S.caught, k = Math.min(1, p / .45), back = p > .45 ? Math.max(0, 1 - (p - .45) / .6) : 1; x += (this.from0 + 60 - cx) * Math.sin(k * Math.PI / 2) * back; lift = -Math.sin(k * Math.PI) * 60 * back; }
      drawCatAt(g, x, GROUND + lift, 1.55, this.fed ? 'fed' : S.catcher === this ? 'watch' : this.st);
      if (this.hungry > 0 || (S.catcher === this && S.caught < .45)) {
        HUNGRY = HUNGRY || hungryLabel();
        const k = this.hungry > 0 ? Math.min(1, (2 - this.hungry) / .15) : 1, pop = .6 + .4 * k + Math.sin(k * Math.PI) * .12;
        dp(g, HUNGRY, cx - 182, GROUND - 190, Math.sin(S.t * 3) * .03 - .05, pop * 1.1, pop * 1.1);
      }
    },
  };
}

/* ---------- tranh 1 ---------- */
LEVELS[0] = {
  han: '貓關', name: 'Ải Mèo', paper: 'yellow', width: 3800, catchToStart: true, key: 0, abil: [], cps: [160, 1100, 1680, 2080, 2440],
  intro: 'Mèo mở mắt thì đứng im, hoặc nấp sau rơm, sau chum!',
  endTitle: 'Qua ải Mèo', endText: 'Mèo đã nhận lễ, đoàn rước đi tiếp. Phía trước là ngõ tre dẫn vào làng.',
  build: () => [
    decor(PROPS.bamboo, 430, GROUND + 4), decor(PROPS.bamboo, 1250, GROUND + 4, .9, -1), decor(PROPS.bamboo, 1900, GROUND + 4, .85), decor(PROPS.bamboo, 3280, GROUND + 4, 1.05),
    decor(PROPS.txt1, 70, 150, .75), decor(PROPS.txt2, 2710, 120, .8),
    fishPond(760, 980), groundCat(2960, 420),
    cover(1680, 'hay', 70), cover(2080, 'chum', 40), cover(2440, 'chum', 40), gate(3600),
  ],
};
