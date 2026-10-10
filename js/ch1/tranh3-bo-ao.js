/* Tranh 3 · Bờ Ao 坡坳 — birds and the trầu cau basket, the duck bridge, the hawk, the sleeping buffalo, the bride's gate. */
/* Màn 3 · Bờ Ao: tap puzzles */
const BIRD_KINDS = [['green', 'red', true], ['green', 'yellow'], ['green', 'dark'], ['brown', 'red'], ['yellow', 'red'], ['grey', 'red'], ['red', 'green'], ['brown', 'dark'], ['yellow', 'green'], ['grey', 'yellow']];
let BIRD_PARTS = null, FEATHER = null, DUCK_SIGN = null;
function birdArt() {
  if (BIRD_PARTS) return;
  BIRD_PARTS = BIRD_KINDS.map(([b, w]) => part([-26, -20, 28, 14], a => {
    a.fk(w, smooth([[-16, 0], [-26, -7], [-26, 5]]), 1.2);
    a.fk(b, smooth([[-16, 0], [-6, -10], [10, -8], [14, 2], [2, 8], [-10, 6]]), 1.8);
    a.fk(w, smooth([[-6, -7], [9, -8], [4, 4], [-9, 2]]), 1.4);
    a.fk(b, circ(12, -8, 6.5), 1.6); a.fk('yellow', smooth([[17, -10], [24, -7], [17, -5]]), 1);
    a.ink(circ(13.5, -9, 1.4));
  }));
  FEATHER = part([-6, -24, 8, 6], a => {
    a.fk('green', smooth([[0, 4], [-4, -8], [0, -22], [5, -8]]), 1.3);
    a.fk('red', smooth([[-1, -14], [0, -22], [4, -12]]), 1);
    a.key(lines([[0, 4, 0, -20]]), 1);
  });
  DUCK_SIGN = part([-40, -120, 40, 6], a => {
    a.fk('brown', rect(-4, -60, 8, 64), 1.8);
    a.fk('straw', rect(-38, -116, 76, 58), 2.2);
    a.text('𠬠𠄩𠀧', 0, -98, 20, 'dark', undefined, 'ink'); a.text('𦊚𠄼', 0, -74, 20, 'dark', undefined, 'ink');
  });
}
function basketTree(treeX) {
  birdArt();
  const hx = treeX + 160, ropeTop = GROUND - 222, cy0 = GROUND - 282;
  const birds = BIRD_KINDS.map((k, i) => ({ i, ok: !!k[2], ph: i * .63 + R(), sp: .7 + R() * .6, rx: 70 + R() * 110, ry: 16 + R() * 30, cx: treeX + 330 + R() * 180, st: 'fly', t: 0, x: 0, y: 0 }));
  const e = {
    layer: 'bg', st: 'hang', t: 0, ax: hx, range: 420, birds,
    onKen() { if (this.st === 'hang') toast('Chim chẳng thèm nghe kèn.', 1.6); return true; },
    onClick(wx, wy) {
      if (this.st !== 'hang') return false;
      let hit = null, bd = 30;
      for (const b of birds) if (b.st === 'fly') { const d = Math.hypot(wx - b.x, wy - b.y); if (d < bd) { bd = d; hit = b; } }
      if (!hit) return false;
      if (hit.ok) { hit.st = 'land'; hit.t = 0; hit.fx = hit.x; hit.fy = hit.y; this.st = 'bird'; this.t = 0; AU.chirp(); toast('Chim sà xuống mổ dây!', 1.8); }
      else { hit.st = 'dive'; hit.t = 0; hit.fx = hit.x; hit.fy = hit.y; AU.pluck(62); }
      return true;
    },
    update(dt) {
      this.t += dt;
      for (const b of birds) {
        b.t += dt;
        const fx = b.cx + Math.cos(S.t * b.sp + b.ph) * b.rx, fy = cy0 + Math.sin(S.t * b.sp * 1.7 + b.ph) * b.ry;
        if (b.st === 'fly') { b.x = fx; b.y = fy; }
        else if (b.st === 'dive') { const k = Math.min(1, b.t / .7), s = Math.sin(k * Math.PI); b.x = b.fx + (hx - b.fx) * s; b.y = b.fy + (ropeTop - 10 - b.fy) * s; if (k >= 1) b.st = 'fly'; }
        else if (b.st === 'land') { const k = Math.min(1, b.t / .9); b.x = b.fx + (hx - b.fx) * k; b.y = b.fy + (ropeTop - 8 - b.fy) * k; }
        else if (b.st === 'gone') { b.x += 160 * dt; b.y -= 90 * dt; }
      }
      if (this.st === 'hang' && !S.told.basket && Math.abs(groom.x - hx) < 300) { S.told.basket = true;  }
      if (this.st === 'bird' && this.t > 1.9) { this.st = 'fall'; this.t = 0; AU.chirp(); for (const b of birds) if (b.ok) { b.st = 'gone'; } toast('Chim mổ đứt dây, giỏ trầu rơi xuống!'); }
      if (this.st === 'fall' && this.t > .45) { this.st = 'ground'; AU.thump(); }
      if (this.st === 'ground' && groom.x > hx - 30) { this.st = 'taken'; S.inv.push('cau'); AU.pluck(); toast('Nhặt được giỏ trầu cau.'); }
    },
    draw(g) {
      dp(g, WP.bigTree, treeX, GROUND + 4);
      let by = GROUND - 150;
      const hanging = this.st === 'hang' || this.st === 'bird';
      if (hanging) {
        g.save(); g.translate(hx, ropeTop); g.rotate(Math.sin(S.t * 1.7) * .13);
        g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, by - 4 - ropeTop); g.stroke();
        dp(g, WP.basket, 0, by + 16 - ropeTop); dp(g, FEATHER, -14, by - 2 - ropeTop, -.35, 1.3, 1.3); g.restore(); return;
      }
      if (this.st === 'fall') by = GROUND - 150 + 134 * (this.t / .45) * (this.t / .45);
      if (this.st === 'ground') by = GROUND - 16;
      const bx = hx + (hanging ? Math.sin(S.pose * 1.5) * 2 : 0);
      if (this.st !== 'taken') { dp(g, WP.basket, bx, by + 16); dp(g, FEATHER, bx - 14, by - 2, -.35, 1.3, 1.3); }
    },
    drawFg(g) {
      for (const b of birds) {
        if (b.st === 'gone' && b.y < -200) continue;
        const flap = 1 - Math.abs(Math.sin(S.t * 14 + b.ph)) * .35, dir = Math.cos(S.t * b.sp + b.ph) < 0 ? 1 : -1;
        const land = b.st === 'land' && b.t > .9;
        dp(g, BIRD_PARTS[b.i], b.x, b.y + (land ? Math.abs(Math.sin(S.t * 20)) * 4 : 0), land ? .4 : 0, (b.st === 'fly' ? dir : 1) * 1.45, 1.45 * (land ? 1 : flap));
      }
    },
  };
  return e;
}
function pond(g0, g1) {
  birdArt();
  const water = WP.pondFor(g1 - g0, 'blue'), n = 5, slots = [], ducks = [];
  for (let i = 0; i < n; i++) slots.push(g0 + 40 + i * (g1 - g0 - 80) / (n - 1));
  const order = [3, 1, 5, 2, 4];
  order.forEach((dots, i) => ducks.push({ dots, x: g0 + 40 + i * 70, y: GROUND - 60 - R() * 80, vx: (R() < .5 ? -1 : 1) * (60 + R() * 50), vy: (R() - .5) * 90, placed: false, ph: R() * 6 }));
  const e = {
    layer: 'bg', st: 'empty', t: 0, ax: g0, range: 480, gap: [g0, g1], placed: 0, ducks,
    wall() { return this.st !== 'bridge' ? g0 - 10 : null; },
    hint: () => 'Ao rộng, phải bắc cầu vịt. Mỗi con vịt có mấy chấm đỏ trên cánh, tấm biển bên ao ghi 𠬠 𠄩 𠀧 𦊚 𠄼. Chạm từng con đúng thứ tự.',
    onKen() { if (this.st === 'empty') toast('Vịt chẳng thèm nghe kèn.', 1.6); return true; },
    onDrum() { if (this.st === 'empty') toast('Tùng tùng… vịt càng hoảng, chạy loạn hơn.', 2.2); return false; },
    onClick(wx, wy) {
      if (this.st === 'bridge') return false;
      let hit = null, bd = 34;
      for (const d of ducks) if (!d.placed) { const dd = Math.hypot(wx - d.x, wy - (d.y - 22)); if (dd < bd) { bd = dd; hit = d; } }
      if (!hit) return false;
      // every tapped duck lands; it extends the line only if it comes right after the last one,
      // otherwise the whole line flies up and the tapped duck starts a new line in the first spot
      const line = ducks.filter(d => d.placed).sort((a, b) => a.slot - b.slot), last = line[line.length - 1];
      if (last && hit.dots !== last.dots + 1) {
        for (const d of line) { d.placed = false; d.vy = -200 - R() * 60; d.vx = (R() < .5 ? -1 : 1) * (70 + R() * 60); }
        this.placed = 0; AU.pluck(60);
      }
      hit.placed = true; hit.slot = this.placed; this.placed++; AU.quack();
      if (this.placed === n) { this.st = 'bridge'; toast('Đủ năm con, cầu vịt đã xong!'); AU.quack(); }
      return true;
    },
    update(dt) {
      this.t += dt;
      if (!S.told.pond && groom.x > g0 - 380) { S.told.pond = true;  }
      for (const d of ducks) {
        if (d.placed) { const tx = slots[d.slot]; d.x += (tx - d.x) * Math.min(1, dt * 5); d.y += (GROUND + 38 - d.y) * Math.min(1, dt * 5); continue; }
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.x < g0 + 20) { d.x = g0 + 20; d.vx = Math.abs(d.vx); } if (d.x > g1 - 20) { d.x = g1 - 20; d.vx = -Math.abs(d.vx); }
        if (d.y < GROUND - 170) { d.y = GROUND - 170; d.vy = Math.abs(d.vy); } if (d.y > GROUND + 30) { d.y = GROUND + 30; d.vy = -Math.abs(d.vy) * (.5 + R()); }
        if (R() < dt * .8) { d.vx = (R() < .5 ? -1 : 1) * (60 + R() * 70); d.vy = (R() - .5) * 140; }
      }
    },
    draw(g) { dp(g, water, g0, GROUND); dp(g, DUCK_SIGN, g0 - 50, GROUND + 4); },
    drawMid(g) {
      for (const d of ducks) {
        const f = d.placed ? 1 : d.vx < 0 ? 1 : -1, bob = d.placed ? Math.sin(S.t * 2 + d.ph) * 2 : Math.sin(S.t * 9 + d.ph) * 3;
        dp(g, WP.duck, d.x, d.y + bob, 0, f, 1);
        g.fillStyle = '#b8342a'; g.strokeStyle = INK; g.lineWidth = 1.2;
        for (let k = 0; k < d.dots; k++) { const px = d.x + f * (2 + k * 5.5 - (d.dots - 1) * 2.75), py = d.y + bob - 20 - (k % 2) * 3; g.beginPath(); g.arc(px, py, 2.6, 0, 6.283); g.fill(); g.stroke(); }
      }
    },
  };
  return e;
}
function hawk(z0, z1) {
  const mid = (z0 + z1) / 2;
  return {
    layer: 'top', watcher: true, mode: 'above', kind: 'hawk', x: mid, z0, z1, st: 'sleep', t: 3, hx: mid, hy: 40,
    catchMsg: () => 'Diều hâu sà xuống!',
    onWarn() { AU.screech(); },
    update(dt) {
      if (!S.told.hawk && groom.x > z0 - 240) { S.told.hawk = true;  }
      if (!S.caught) { if (groom.x < z0 - 12 || groom.x > z1 + 120) { this.st = 'sleep'; this.t = 2 + R(); } else tickWatcher(this, dt); }
      let tx, ty;
      if (S.catcher === this) { tx = groom.x; ty = GROUND - 90; }
      else if (this.st === 'watch') { tx = groom.x + 30 + Math.sin(S.t * 1.3) * 60; ty = 120; }
      else if (this.st === 'warn') { tx = groom.x + 180; ty = 80; }
      else { tx = mid + Math.sin(S.t * .5) * 280; ty = 40 + Math.sin(S.t * .9) * 10; }
      const k = Math.min(1, dt * (this.st === 'watch' || S.catcher === this ? 4 : 1.5));
      this.hx += (tx - this.hx) * k; this.hy += (ty - this.hy) * k;
    },
    draw(g) {
      const s = this.st === 'sleep' && S.catcher !== this ? .45 : this.st === 'warn' ? .7 : 1;
      if (s > .6) { g.globalAlpha = .28; g.fillStyle = INK; g.beginPath(); g.ellipse(this.hx, GROUND + 2, 90 * s, 9, 0, 0, 6.283); g.fill(); g.globalAlpha = 1; }
      dp(g, WP.hawk, this.hx, this.hy + Math.sin(S.t * 3) * 4, Math.sin(S.t * 1.1) * .06, s, s * (1 - Math.abs(Math.sin(S.t * 2.2)) * .25));
    },
  };
}
// Trâu ngủ: near it the drums of the song go quiet and the drummer waits for the player. Tap the drummer:
// three even beats, a rest, three even beats, a rest, three even beats. Each good group opens the eye a little,
// a bad group shuts it again.
function buffalo(x) {
  const e = {
    layer: 'bg', st: 'lie', t: 0, ax: x, range: 620, told: false, bars: 0, grp: [], twitch: 0, eye: 0,
    wall() { return this.st === 'lie' ? x - 262 : null; },
    onClick(wx, wy) {                          // tap the sleeping buffalo for its one hint
      if (this.st !== 'lie' || wx < x - 220 || wx > x + 190 || wy < GROUND - 180 || wy > GROUND + 10) return false;
      this.twitch = .4; AU.snort(); toast('Trâu chỉ thức dậy khi nghe nhịp điệu quen thuộc.', 3.2); return true;
    },
    songActive() { const vw = cv.width / (scale * DPR); return this.st === 'lie' && x - 190 < camX + vw && x + 200 > camX; },
    note(kind) {
      if (kind !== 'T') { AU.kenNote(81); return; }
      AU.drumOne(); this.grp.push(S.t);
    },
    rest() {                                   // how long a silence closes the current group
      const n = this.grp.length; if (n < 2) return 1.2;
      return Math.min(2, Math.max(.8, 1.7 * (this.grp[n - 1] - this.grp[0]) / (n - 1)));
    },
    judge() {
      const h = this.grp; this.grp = [];
      let ok = h.length === 3;
      if (ok) { const a = h[1] - h[0], b = h[2] - h[1]; ok = a > .12 && b > .12 && a < 1.1 && b < 1.1 && Math.abs(a - b) <= .35 * Math.max(a, b); }
      if (ok) {
        this.bars++; this.twitch = .5; AU.pluck(79);
        if (this.bars >= 3) { this.st = 'rise'; this.t = 0; AU.muteDrums(false); setTimeout(() => AU.moo(), 200); toast('Trâu mở mắt, vươn vai đứng dậy!', 2.4); }
      } else { if (this.bars) AU.snort(); this.bars = 0; }
    },
    update(dt) {
      this.t += dt; this.twitch = Math.max(0, this.twitch - dt);
      this.eye += (Math.min(1, this.bars / 3) - this.eye) * Math.min(1, dt * 5);
      if (this.st === 'rise' && this.t > .7) this.st = 'stand';
      const active = this.songActive() && S.mode === 'play';
      AU.muteDrums(active); S.manualDrum = active;
      if (!active) { this.grp = []; return; }
      if (this.grp.length && S.t - this.grp[this.grp.length - 1] > this.rest()) this.judge();
    },
    draw(g) {
      if (this.st === 'lie') {
        const by = GROUND + 4 - (this.twitch > 0 ? Math.sin(this.twitch * 20) * 3 : 0);
        dp(g, WP.bufLie, x, by);
        if (this.eye > .03) {                  // the eye opens a little with every good group
          const ex = x - 168, ey = by - 78, k = this.eye;
          g.fillStyle = PCOL.yellow; g.strokeStyle = INK; g.lineWidth = 1.6;
          g.beginPath(); g.ellipse(ex, ey, 7, Math.max(.8, 6.5 * k), 0, 0, 6.283); g.fill(); g.stroke();
          g.fillStyle = INK; g.beginPath(); g.ellipse(ex - 1, ey, 2.8 * Math.min(1, k * 1.6), Math.max(.6, 2.8 * Math.min(1, k * 1.6)), 0, 0, 6.283); g.fill();
        }
        const nz = 3 - this.bars;
        for (let i = 0; i < nz; i++) { const k = (S.pose * .5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI); dp(g, PROPS.zz, x - 180 - k * 20 + i * 4, GROUND - 140 - k * 50, 0, .8 + k * .5, .8 + k * .5); g.globalAlpha = 1; }
      }
      else if (this.st === 'rise') { const k = Math.min(1, this.t / .7); dp(g, k < .5 ? WP.bufLie : WP.bufStand, x, GROUND + 4 + (k < .5 ? -k * 30 : (1 - k) * 20)); }
      else dp(g, WP.bufStand, x, GROUND + 4);
    },
  };
  return e;
}
let ASK = null;
function gate(x, need) {
  return {
    layer: 'bg', gateX: x, ax: x, opened: !need,
    get spent() { return this.opened; },
    wall() { return this.opened ? null : x - 120; },
    hint: () => need ? (has(need) ? 'Nhà gái đứng chờ ở cổng. Dâng trầu cau đi!' : 'Nhà gái đòi lễ trầu cau mới cho rước dâu. Quay lại lấy giỏ trầu trên cây đa.') : null,
    offer: need ? { wants: [need], label: 'Dâng trầu cau', near: () => groom.x > x - 220, missing: 'Nhà gái đòi lễ trầu cau mới cho rước dâu.' } : null,
    give() { this.opened = true; AU.pluck(81); setTimeout(() => AU.pluck(88), 140); toast('Nhà gái nhận trầu cau, mở cổng đón chú rể!', 3); },
    update(dt) {                              // at the gate: offer the gift by itself, or the bride's family asks for it
      if (this.opened || !need) return;
      const at = groom.x > x - 220;
      if (at && has(need)) { takeItems([need]); this.give(); this.ask = 0; return; }
      if (at && !this.ask) AU.pluck(62);
      this.ask = at ? Math.min(1, (this.ask || 0) + dt * 6) : Math.max(0, (this.ask || 0) - dt * 4);
    },
    draw(g) {
      dp(g, PROPS.gate, x, GROUND + 4);
    },
    drawFg(g) {
      if (this.ask > .02) { ASK = ASK || slipLabel(['SÍNH LỄ', 'ĐÂU?'], 58); const p = .6 + .4 * this.ask; g.globalAlpha = this.ask; dp(g, ASK, x - 108, GROUND - 212, Math.sin(S.t * 3) * .03 - .05, p, p); g.globalAlpha = 1; }
    },
  };
}

/* ---------- tranh 3 ---------- */
LEVELS[2] = {
  han: '坡坳', name: 'Bờ Ao', paper: 'blue', width: 3350, key: -3, abil: ['drum', 'ken', 'parasol'], cps: [160, 700, 1580, 2280],
  intro: 'Bờ ao nhiều việc phải khéo tay: chạm đúng con chim, xếp đàn vịt thành cầu, và chơi nhạc đánh thức trâu. Chạm vào chú chuột đánh trống hay thổi kèn để chơi.',
  endTitle: 'Tới nhà gái', endText: 'Nhà gái nhận trầu cau, mở cổng. Nhưng đường tới sân đình còn xa, còn cả chợ Tết đang họp.',
  build: () => [
    decor(WP.hanFor('坡坳'), 70, 120, .7), basketTree(400),
    pond(1160, 1520), hawk(1640, 2120), decor(PROPS.bamboo, 2310, GROUND + 4, .9, -1),
    secretSpot(2020, 'ken', 'Tò te… từ đám lau rơi xuống một mảnh triện đỏ!'),
    buffalo(2620), gate(3140, 'cau'),
  ],
};
