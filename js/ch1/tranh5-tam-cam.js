/* Tranh 5 · Tấm Cám — the owner's script (docs/kich-ban/chuong1-man5-tam-cam.md), followed as written. The party walks
   on as always (the ◀ ▶ buttons) and is never stopped: every meeting with Tấm can be passed by. But the meetings hang
   together: only if the party helps Tấm sort the rice from the beans (the first meeting) do the later ones appear —
   the dress from Bống's bones, the rain and the parasol, the areca tree, the oriole's cage, the thị fruit — and only
   then does Tấm, at the very end, give the parasol back with the cat's bell (lục lạc mèo, a key item for the next tranh).
   Tấm's own lines are ours (owner: "lời thoại b tự viết"); the special tune at the rainbow will be the owner's file. */

// the owner's tune for the rainbow (from the score sent): G major, a pickup and three bars, then bar 16 to close;
// [midi, beats]; slow, like slow motion (owner). Chords under it: Em | Bm | C Am | Cm D
const T5_TUNE = [[74, 1 / 3], [74, 1 / 3], [79, 1 / 3],
  [79, .5], [79, .25], [79, .75], [81, .5], [79, 1], [74, 1 / 3], [74, 1 / 3], [79, 1 / 3],
  [78, .5], [78, .25], [79, .75], [78, .25], [76, .25], [74, .75], [71, .25], [71, 1 / 3], [72, 1 / 3], [74, 1 / 3],
  [76, .75], [72, .25], [72, .25], [71, .25], [72, 1.5], [71, 1 / 3], [67, 1 / 3], [64, 1 / 3],
  [71, .75], [71, .25], [71, .25], [72, .25], [69, 2.5]];
const T5_CHORDS = [[[], 1], [[52, 55, 59], 4], [[47, 50, 54], 4], [[48, 52, 55], 2], [[45, 48, 52], 2], [[48, 51, 55], 2], [[50, 54, 57], 2]];

// the cat's bell: a key item, kept in the save once given
ITEMS.lucLac = { name: 'lục lạc mèo', part: part([-14, -16, 14, 14], a => {
  a.fk('red', smooth([[-12, -12], [0, -6], [12, -12], [10, -4], [-10, -4]]), 1.4);
  a.fk('yellow', circ(0, 3, 9), 2); a.key(lines([[-6, 4, 6, 4]]), 1.4); a.ink(circ(0, 7, 1.8));
}), s: 1.2, cy: 0 };

/* ---------- Tấm, drawn straight on the canvas in the prints' flat colours and ink ---------- */
const T5_SKIN = '#f0d0a8', T5_INK = INK;
function t5Shape(g, col, f) { g.fillStyle = col; g.strokeStyle = T5_INK; g.lineWidth = 2.4; g.lineJoin = 'round'; g.beginPath(); f(); g.fill(); g.stroke(); }
// the head (0,0 = the chin): black hair parted over the brow (a red flower in it on festival day); crying closes the eyes
function t5Head(g, o) {
  t5Shape(g, T5_SKIN, () => g.ellipse(0, -18, 16, 19, 0, 0, 6.283));
  g.fillStyle = '#e8a090'; for (const d of [-8, 8]) { g.beginPath(); g.ellipse(d, -11, 4, 2.6, 0, 0, 6.283); g.fill(); }
  g.strokeStyle = T5_INK; g.lineWidth = 2; g.lineCap = 'round';
  if (o.cry) { for (const d of [-7, 7]) { g.beginPath(); g.arc(d, -19, 4, .2, Math.PI - .2); g.stroke(); }
    const k = (S.t * 1.6) % 1; g.fillStyle = '#5b9fd0'; for (const d of [-8, 8]) { g.beginPath(); g.ellipse(d, -13 + k * 14, 2, 3, 0, 0, 6.283); g.fill(); } }
  else { g.fillStyle = T5_INK; for (const d of [-7, 7]) { g.beginPath(); g.ellipse(d, -19, 2, 2.6, 0, 0, 6.283); g.fill(); } }
  g.strokeStyle = '#a3332a'; g.lineWidth = 2; g.beginPath(); o.cry ? g.arc(0, -3, 3.4, 3.4, 6) : g.arc(0, -9, 3.4, .3, 2.8); g.stroke();
  if (o.hairDown) { t5Shape(g, '#1d1915', () => { g.moveTo(-16, -24); g.quadraticCurveTo(0, -46, 16, -24); g.lineTo(18, -18); g.quadraticCurveTo(0, -36, -18, -18); g.closePath(); }); return; }
  // the hair: black, parted in the middle over the brow; on festival day a red flower in it
  t5Shape(g, '#1d1915', () => { g.moveTo(-17, -16); g.quadraticCurveTo(-20, -42, 0, -40); g.quadraticCurveTo(20, -42, 17, -16); g.quadraticCurveTo(12, -30, 0, -32); g.quadraticCurveTo(-12, -30, -17, -16); g.closePath(); });
  if (o.dep) { t5Shape(g, '#c0402f', () => g.arc(14, -32, 5, 0, 6.283)); g.fillStyle = '#e8b83a'; g.beginPath(); g.arc(14, -32, 1.8, 0, 6.283); g.fill(); }
}
// the body in áo tứ thân: brown and worn, or (dep) a bright festival dress; poses: stand, run, sit, bed, wash, hug, hold
function t5Tam(g, x, y, o = {}) {
  const pose = o.pose || 'stand', ao = o.dep ? '#2f6a4c' : '#8a5a2a', vay = o.dep ? '#a3332a' : '#2a221d', yem = o.dep ? '#e8b83a' : '#a3332a', band = o.dep ? '#c0567a' : '#5b2f1f';
  const sc = o.s ?? .8;                                                   // as tall as the mice (owner)
  g.save(); g.translate(x, y); g.scale((o.face || 1) * sc, sc);
  if (o.alpha != null) g.globalAlpha = o.alpha;
  const sw = pose === 'run' ? Math.sin(o.ph || 0) : 0;
  if (pose === 'wash') {                                   // sitting by a basin, the long hair down over it into the water
    t5Shape(g, '#9a9a92', () => g.ellipse(48, -8, 26, 9, 0, 0, 6.283)); g.fillStyle = '#5b9fd0'; g.beginPath(); g.ellipse(48, -11, 20, 4, 0, 0, 6.283); g.fill();
    g.restore(); t5Tam(g, x, y, { ...o, pose: 'sit', hairDown: true });
    const sc2 = o.s ?? .8, sway = Math.sin(S.t * 2) * 2; g.save(); g.translate(x, y); g.scale(sc2, sc2);
    g.fillStyle = '#1d1915'; g.strokeStyle = INK; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(10, -118); g.quadraticCurveTo(40 + sway, -84, 42 + sway, -12); g.lineTo(54 + sway, -12); g.quadraticCurveTo(52 + sway, -90, 18, -124); g.closePath(); g.fill(); g.stroke();
    g.restore(); return;
  }
  const seat = pose === 'sit' ? -28 : pose === 'bed' ? -34 : 0;
  // legs and skirt
  if (pose === 'sit') { t5Shape(g, vay, () => g.ellipse(4, -14, 36, 15, 0, 0, 6.283)); t5Shape(g, '#2a221d', () => g.ellipse(34, -4, 8, 5, 0, 0, 6.283)); }
  else if (pose === 'bed') {                                              // sitting on the edge: the lap, then both shins hanging down
    for (const lx of [14, 26]) { t5Shape(g, '#2a221d', () => g.rect(lx - 4, -30, 8, 28)); t5Shape(g, '#2a221d', () => g.ellipse(lx + 4, -2, 7, 3.6, 0, 0, 6.283)); }
    t5Shape(g, vay, () => { g.moveTo(-18, -38); g.lineTo(30, -38); g.lineTo(32, -24); g.lineTo(-18, -24); g.closePath(); });
  }
  else if (pose === 'hug') {                                              // clinging: knees bent forward round the trunk
    for (const s of [-1, 1]) { g.save(); g.translate(s * 4, -50); g.rotate(-1.1); t5Shape(g, '#2a221d', () => g.rect(-4, 0, 9, 26)); g.translate(0, 24); g.rotate(1.5); t5Shape(g, '#2a221d', () => g.rect(-4, 0, 8, 22)); t5Shape(g, '#2a221d', () => g.ellipse(-3, 23, 7, 3.6, 0, 0, 6.283)); g.restore(); }
    t5Shape(g, vay, () => { g.moveTo(-20, -96); g.lineTo(20, -96); g.lineTo(24, -48); g.lineTo(-22, -48); g.closePath(); });
  }
  else {
    for (const s of [-1, 1]) { g.save(); g.translate(s * 7, -46); g.rotate(s * sw * .4); t5Shape(g, '#2a221d', () => g.rect(-4, 0, 8, 44)); t5Shape(g, '#2a221d', () => g.ellipse(4, 44, 8, 4, 0, 0, 6.283)); g.restore(); }
    t5Shape(g, vay, () => { g.moveTo(-20, -96); g.lineTo(20, -96); g.lineTo(26, -40); g.lineTo(-26, -40); g.closePath(); });
  }
  const top = pose === 'sit' ? -28 : pose === 'bed' ? -34 : -90;            // the waist
  if (pose === 'bend') { t5Shape(g, '#b57a22', () => { g.moveTo(-34, -96); g.lineTo(-16, -96); g.lineTo(-19, -70); g.lineTo(-31, -70); g.closePath(); }); }   // the giỏ tép at her hip
  g.translate(0, top);
  if (pose === 'bend') g.rotate(1.15);
  if (!o.hairDown) t5Shape(g, '#1d1915', () => { g.moveTo(-15, -100); g.quadraticCurveTo(-26, -40, -18, 14 + Math.sin(S.t * 2) * 2); g.lineTo(-4, 16); g.quadraticCurveTo(-8, -40, 4, -98); g.closePath(); });   // long hair down the back
  // the áo: four flaps, the yếm at the chest, a sash at the waist
  t5Shape(g, ao, () => { g.moveTo(-20, 4); g.lineTo(-18, -58); g.quadraticCurveTo(0, -66, 18, -58); g.lineTo(20, 4); g.closePath(); });
  t5Shape(g, yem, () => { g.moveTo(-10, -56); g.lineTo(10, -56); g.lineTo(12, -24); g.lineTo(0, -16); g.lineTo(-12, -24); g.closePath(); });
  t5Shape(g, band, () => g.rect(-21, -6, 42, 8));
  if (o.dep) { g.strokeStyle = '#e8b83a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, -40); g.lineTo(-14, 2); g.moveTo(18, -40); g.lineTo(14, 2); g.stroke(); }
  // arms: to the face when crying, up to a trunk when hugging, holding a parasol pole, or swinging
  const arm = (s, a1, len = 46) => { g.save(); g.translate(s * 17, -54); g.rotate(a1); t5Shape(g, ao, () => g.rect(-5, 0, 10, len)); t5Shape(g, T5_SKIN, () => g.arc(0, len + 3, 5, 0, 6.283)); g.restore(); };
  if (o.cry && pose !== 'hug') { arm(-1, -2.5, 40); arm(1, 2.5, 40); }
  else if (pose === 'hug') { arm(-1, -1.75, 34); arm(1, -1.5, 34); }   // both arms forward round the trunk
  else if (pose === 'hold') { arm(-1, .2); arm(1, -2.6, 40); }
  else if (pose === 'bend') { arm(-1, -1.0, 50); arm(1, -1.25, 50); }
  else { arm(-1, .15 + sw * .5); arm(1, -.15 - sw * .5); }
  // neck and head
  t5Shape(g, T5_SKIN, () => g.rect(-5, -70, 10, 10));
  g.translate(0, -66); if (o.hairDown) g.rotate(.35); t5Head(g, { cry: o.cry, dep: o.dep, hairDown: o.hairDown });
  g.restore();
}
// Tấm's "…" bubble (tap it or her to hear her)
const t5Dots = (g, x, y) => t4Bubble(g, x, y, 56, g => { g.fillStyle = INK; for (const d of [-12, 0, 12]) { g.beginPath(); g.arc(d, 0, 3.4, 0, 6.283); g.fill(); } }, 34);
// a helper for each meeting: the lines, the tap on her or her bubble, the run off to the right after thanking
function t5Meet(x, lines) {
  const m = { x, n: 0, gone: false, runT: -1, said: 0,
    hit(wx, wy, top = 200) { return Math.abs(wx - this.x) < 46 && wy > GROUND - top && wy < GROUND + 6; },   // her body, from the ground up
    talk() { toastSay(lines[this.n % lines.length]); this.n++; AU.pluck(76); },
    run(msg) { toastSay(msg); AU.pluck(84); setTimeout(() => AU.pluck(91), 140); this.runT = 0; },
    step(dt) { if (this.runT >= 0 && !this.gone) { this.runT += dt; if (this.runT > 2.4) this.x += 320 * dt; if (this.runT > 5) this.gone = true; } },   // thanks for a while, then off at a run
    alpha() { return this.runT > 4.2 ? Math.max(0, 1 - (this.runT - 4.2) / .8) : 1; },
  };
  T5.meets.push(m); return m;
}
// the walk buttons rest while Tấm thanks and runs off, and while the rainbow's tune plays (owner)
function t5Music() {
  return { layer: 'bg', draw() {}, looped: false,
    update() {
      const near = S.ents.some(e => e.ax != null && e.near && e.near());
      if (!this.looped && T5.musicEnd && S.t > T5.musicEnd) { this.looped = true; AU.setSong(8); }   // from the rainbow on, the owner's loop
      AU.musicLevel(near ? .14 : .5);
    },
  };
}
function t5Wait() {
  return { layer: 'bg', draw() {},
    update() { S.waitMove = T5.meets.some(m => m.runT >= 0 && !m.gone) || S.t < (T5.holdEnd || 0) || T5.backUp != null || S.ents.some(e => e.busy && e.busy()); },
  };
}
const T5 = { chain: false, meets: [], musicEnd: 0 };                                             // set when the rice is sorted: the rest of the story may appear

/* ---------- 0 · far off in a paddy field: Tấm bent over, catching shrimp ---------- */
function t5Field(x) {
  const m = t5Meet(x, ['Xa xa ngoài đồng, Tấm cúi lom khom bắt tép. Mẹ hứa ai bắt được đầy giỏ sẽ được thưởng cái yếm đỏ.', 'Tấm chăm chỉ, giỏ tép đã gần đầy.']);
  const Y = GROUND - 34, rr = mulberry(11);
  const rows = []; for (let i = 0; i < 26; i++) rows.push([x - 300 + rr() * 600, Y - 6 + rr() * 14]);
  return { layer: 'bg', ax: x,
    gone: false,
    update() { if (!this.gone && groom.x > x + 400 && x - camX < -120) this.gone = true; },   // passed by and out of sight: she has gone back to the yard
    onClick(wx, wy) { if (this.gone || Math.abs(wx - x) > 50 || wy < Y - 90 || wy > Y + 10) return false; m.talk(); return true; },
    draw(g) {
      // the paddy behind the road: water with a little bank, rows of young rice, all a little pale with distance
      g.save(); g.globalAlpha = .85;
      t5Shape(g, '#7fa8b0', () => { g.moveTo(x - 330, Y + 14); g.quadraticCurveTo(x - 320, Y - 16, x - 260, Y - 18); g.lineTo(x + 260, Y - 18); g.quadraticCurveTo(x + 320, Y - 16, x + 330, Y + 14); g.closePath(); });
      g.strokeStyle = 'rgba(242,236,222,.7)'; g.lineWidth = 1.4; g.beginPath(); for (let k = 0; k < 7; k++) { const wx = x - 250 + k * 80; g.moveTo(wx, Y - 4 + k % 2 * 6); g.lineTo(wx + 26, Y - 4 + k % 2 * 6); } g.stroke();
      g.strokeStyle = '#2f6a4c'; g.lineWidth = 1.8; g.beginPath(); for (const [px, py] of rows) { g.moveTo(px, py); g.lineTo(px - 3, py - 10); g.moveTo(px, py); g.lineTo(px + 3, py - 11); g.moveTo(px, py); g.lineTo(px, py - 13); } g.stroke();
      if (!this.gone) {
      t5Tam(g, x, Y + 4, { pose: 'bend', s: .5 });
      const k = (S.t * .8) % 1; g.strokeStyle = 'rgba(242,236,222,.8)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x + 30, Y + 2, 6 + k * 14, 2 + k * 3, 0, 0, 6.283); g.stroke();   // ripples where her hands are
      }
      g.restore();
    },
  };
}

/* ---------- 1 · rice and beans: the trumpet calls the birds down ---------- */
function t5Rice(x) {
  birdArt();
  const TX = x + 40, NX = x + 90, YY = GROUND - 30, TK = 1.35;            // the birds' tree (tall, its crown over Tấm), the tray of rice and beans, back from the road
  const m = t5Meet(x, ['Mẹ trộn gạo với đỗ, bắt ta nhặt riêng ra, xong mới được đi xem hội…', 'Nhiều thế này, ta nhặt đến sáng cũng chưa xong…', 'Giá mà đàn chim trên cây kia xuống giúp ta…']);
  const perch = [[-70, -300], [-30, -330], [10, -312], [50, -296], [-50, -270], [30, -346]];   // right over Tấm's head
  const birds = perch.map(([dx, dy], i) => ({ k: i % BIRD_PARTS.length, hx: TX + dx, hy: GROUND + dy, x: TX + dx, y: GROUND + dy, ph: i * 1.3 }));
  const e = { layer: 'bg', ax: NX, range: 700, st: 'mixed', t: 0, sorted: 0,
    busy() { return this.st === 'birds' || this.st === 'calling' || (this.st === 'done' && !this.thanked); },   // then t5Wait holds on while she runs off
    near() { return !m.gone && Math.abs(groom.x - x - 60) < 520; },
    onKen() {                                                             // the trumpet's tune brings the birds down
      if (this.st !== 'mixed' || Math.abs(groom.x - x) > 700) return false;
      this.st = 'calling'; this.t = 0; S.kenT = 3.4;                      // a long call on the trumpet first
      for (const d of [1400, 2600]) setTimeout(() => { if (S.mode === 'play') AU.kenCall(); }, d);
      for (let k = 0; k < 14; k++) S.fx.push({ kind: 'note', x: followers[2].x + 50, y: GROUND - 100, t: -k * .22, vx: 40 + R() * 40, vy: -50 - R() * 30 });
      return true;
    },
    update(dt) {
      m.step(dt); this.t += dt;
      if (this.st === 'calling' && this.t > 3.4) { this.st = 'birds'; this.t = 0; AU.chirp(); toast('Nghe tiếng kèn, đàn chim trên cây sà xuống nhặt giúp Tấm!', 3.4); }
      if (this.st === 'birds') {
        this.sorted = Math.min(1, Math.max(0, (this.t - 1.2) / 7.5));
        if (this.t > 9.4) { this.st = 'done'; this.t = 0; T5.chain = true; }
      }
      if (this.st === 'done' && !this.thanked && this.t > 1.4) { this.thanked = true; m.run('Gạo một rổ, đỗ một rổ! Ta cảm ơn đoàn chuột nhiều lắm, ta đi xem hội đây!');
      }
      birds.forEach((b, i) => {
        const away = this.st === 'birds' && this.t > .2 && this.t < 9;
        const tx = away ? NX - 50 + (i % 3) * 50 + Math.sin(this.t * 3 + i) * 6 : b.hx, ty = away ? YY - 16 - (i > 2 ? 8 : 0) : b.hy;
        b.x += (tx - b.x) * Math.min(1, dt * 3); b.y += (ty - b.y) * Math.min(1, dt * 3);
      });
    },
    draw(g) {
      dp(g, WP.bigTree, TX, YY + 4, 0, TK, TK);
      // the tray: rice and beans mixed, emptying into two baskets as the birds pick
      // the beaten-earth yard behind the road, the big tray of rice mixed with beans, two baskets
      g.fillStyle = 'rgba(201,168,122,.75)'; g.beginPath(); g.ellipse(NX - 10, YY + 4, 200, 24, 0, 0, 6.283); g.fill();
      t5Shape(g, '#c9a24a', () => g.ellipse(NX, YY - 2, 74, 15, 0, 0, 6.283)); g.strokeStyle = '#8a5a2a'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(NX, YY - 2, 64, 11, 0, 0, 6.283); g.stroke();
      const rr = mulberry(5), left = 1 - this.sorted;
      for (let k = 0; k < 90; k++) { const a = rr() * 6.283, r = Math.sqrt(rr()), px = NX + Math.cos(a) * r * 60, py = YY - 2 + Math.sin(a) * r * 10; if (rr() > left) continue; g.fillStyle = k % 3 ? '#f6f1e4' : '#7a2a22'; g.beginPath(); g.ellipse(px, py, 3, 1.8, rr() * 3, 0, 6.283); g.fill(); }
      for (const [bx, col] of [[NX + 110, '#f6f1e4'], [NX + 170, '#7a2a22']]) {
        t5Shape(g, '#b57a22', () => { g.moveTo(bx - 24, YY - 30); g.lineTo(bx + 24, YY - 30); g.lineTo(bx + 18, YY + 2); g.lineTo(bx - 18, YY + 2); g.closePath(); });
        g.strokeStyle = '#8a5a2a'; g.lineWidth = 1; g.beginPath(); for (let k = -16; k <= 16; k += 8) { g.moveTo(bx + k, YY - 28); g.lineTo(bx + k * .75, YY); } g.stroke();
        t5Shape(g, this.sorted > 0 ? col : '#5b2f1f', () => g.ellipse(bx, YY - 30, 24, 4 + this.sorted * 3, 0, 0, 6.283));
      }
      if (!m.gone && m.runT < 0) t5Tam(g, x, YY, { pose: 'sit', cry: true });            // Tấm sits in the yard, behind the road
    },
    drawMid(g) {
      if (!m.gone && m.runT >= 0) t5Tam(g, m.x, GROUND, { pose: m.runT > 2.4 ? 'run' : 'stand', ph: S.t * 10, alpha: m.alpha() });
      if (!m.gone && m.runT < 0 && this.st === 'mixed' && groom.x > x - 620) t5Say(g, x, YY - 112, 'Mẹ bắt ta nhặt riêng gạo với đỗ, xong mới được đi xem hội…');
      for (const b of birds) { const peck = this.st === 'birds' && Math.abs(b.y - (GROUND - 34)) < 12 ? Math.abs(Math.sin(S.t * 12 + b.ph)) * 5 : 0; dp(g, BIRD_PARTS[b.k], b.x, b.y + peck, 0, .9, .9); }
    },
  };
  return e;
}

/* ---------- 2 · the dress from Bống's bones: drag the hoe over the foot of the bed ---------- */
function t5Bed(x) {
  const BX = x, HX = x + 210, DX = x + 50;                                // the bed, the hoe by it, the spot to dig (the bed's far foot)
  const m = t5Meet(x, ['Ta muốn đi xem hội lắm, mà chỉ có bộ áo nâu sờn rách này…', 'Bụt dặn ta chôn xương cá Bống ở chân giường. Nhưng ta chẳng có gì mà đào…']);
  const hoe = { x: HX, y: GROUND - 6, home: [HX, GROUND - 6] };
  const e = { layer: 'bg', ax: x, digs: 0, inSpot: false, st: 'cry', t: 0,
    busy() { return this.st === 'magic' || (this.st === 'done' && !this.thanked) || !!(S.drag && S.drag.ent === this); },
    near() { return this.on() && !m.gone && Math.abs(groom.x - x) < 520; },   // digging, and the bones turning into the dress
    on() { return T5.chain; },
    grab(wx, wy) {
      if (!this.on() || this.st !== 'cry' || Math.abs(wx - hoe.x) > 26 || wy < hoe.y - 120 || wy > hoe.y + 10) return null;
      AU.click(); return { ent: this, x: wx, y: wy, draw: g => this.drawHoe(g, S.drag.x, S.drag.y + 40, -.6) };
    },
    drop(d) { hoe.x = hoe.home[0]; hoe.y = hoe.home[1]; },
    update(dt) {
      m.step(dt); this.t += dt;
      const d = S.drag && S.drag.ent === this ? S.drag : null;
      T5.backUp = d && this.st === 'cry' && groom.x > BX - 100 ? BX - 100 : null;   // just to the bed's side
      if (T5.backUp != null && groom.x > T5.backUp) { groom.x = Math.max(T5.backUp, groom.x - 140 * dt); groom.vx = -30; }
      if (d && this.st === 'cry') {                                       // each stroke into the spot digs a little deeper
        const inside = Math.abs(d.x - DX) < 40 && d.y + 40 > GROUND - 30 && d.y + 40 < GROUND + 30;
        if (inside && !this.inSpot) { this.digs++; AU.thump(); if (this.digs === 2) toast('Lộ ra mấy cái xương cá Bống…', 2.4); }
        this.inSpot = inside;
        if (this.digs >= 4) { this.st = 'magic'; this.t = 0; S.drag = null; AU.swoosh(); toast('Bộ xương cá Bống từ từ bay lên…', 2.6); }
      }
      if (this.st === 'magic') {
        if (this.t > 2.4 && !this.said) { this.said = true; AU.pluck(84); setTimeout(() => AU.pluck(88), 160); setTimeout(() => AU.pluck(91), 320); toast('…rồi hoá thành một bộ quần áo đẹp, toả sáng lấp lánh!', 3); }
        if (this.t > 6) { this.st = 'done'; this.t = 0; T5.dress = true; }
      }
      if (this.st === 'done' && !this.thanked && this.t > 1) { this.thanked = true; m.run('Đẹp quá! Ta cảm ơn đoàn chuột, giờ ta đi xem hội được rồi!'); }
    },
    drawHoe(g, x, y, rot) {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.strokeStyle = '#6a4a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -110); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.4; g.strokeRect(-3, -110, 6, 110);
      t5Shape(g, '#9a9a92', () => { g.moveTo(-2, -4); g.lineTo(-26, -2); g.lineTo(-24, 12); g.lineTo(-2, 8); g.closePath(); });
      g.restore();
    },
    draw(g) {
      if (!this.on()) return;
      // the bed (a plank bed on legs) with a straw mat
      t5Shape(g, '#8a5a2a', () => g.rect(BX - 70, GROUND - 46, 140, 12));
      g.strokeStyle = '#6a4a2a'; g.lineWidth = 6; g.beginPath(); for (const lx of [BX - 62, BX + 62]) { g.moveTo(lx, GROUND - 34); g.lineTo(lx, GROUND); } g.stroke();
      t5Shape(g, '#e8c870', () => g.rect(BX - 64, GROUND - 52, 128, 6));
      // the dug earth, the bones, the dress
      if (this.digs > 0) { t5Shape(g, '#5b2f1f', () => g.ellipse(DX, GROUND + 2, 10 + this.digs * 6, 4 + this.digs, 0, 0, 6.283)); }
      if (this.digs >= 2 && this.st === 'cry') {
        const k = 0, bx = DX, by = GROUND - 4 - Math.min(4, this.digs) * 3 - k * 30;
        g.globalAlpha = 1 - k; g.strokeStyle = '#f6f1e4'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 22, by); g.lineTo(bx + 18, by); for (let r = -14; r <= 10; r += 6) { g.moveTo(bx + r, by - 7); g.lineTo(bx + r + 3, by + 7); } g.stroke();
        g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1;
        if (k > 0) { g.globalAlpha = k; t5Shape(g, '#2f6a4c', () => { g.moveTo(bx - 16, by - 30); g.lineTo(bx + 16, by - 30); g.lineTo(bx + 22, by + 10); g.lineTo(bx - 22, by + 10); g.closePath(); }); t5Shape(g, '#a3332a', () => g.rect(bx - 22, by + 10, 44, 16)); g.globalAlpha = 1; sparkle(g, bx + 20, by - 30, 10, k); }
      }
      if (this.st === 'cry' && !(S.drag && S.drag.ent === this)) { this.drawHoe(g, hoe.x, hoe.y, .18); if (this.digs === 0) sparkle(g, hoe.x + 12, hoe.y - 120, 6, .3 + .3 * Math.sin(S.t * 3)); }
    },
    // the magic, in the middle of the screen: the fish bones rise from the hole and grow, turn into a glowing dress,
    // which then flies down onto Tấm
    drawHud(g, vw) {
      if (this.st !== 'magic') return;
      const t = this.t, cx = vw / 2, cy = viewH * .42, sx = DX - camX, sy = GROUND - 20 + offY, ease = k => 1 - (1 - k) * (1 - k);
      const dim = Math.min(1, t / .6, Math.max(0, (6 - t) / .6)); g.fillStyle = 'rgba(29,25,21,' + (.3 * dim) + ')'; g.fillRect(0, 0, vw, viewH);
      const rise = ease(Math.min(1, t / 2.4)), bx = sx + (cx - sx) * rise, by = sy + (cy - sy) * rise, bs = .6 + 2.4 * rise;
      const morph = Math.min(1, Math.max(0, (t - 2.4) / 1.2)), fly = ease(Math.min(1, Math.max(0, (t - 4.8) / 1.2))), tx = m.x + 10 - camX, ty = GROUND - 80 + offY;
      if (morph > 0) {                                                      // rays of light behind
        g.save(); g.translate(bx, by); g.rotate(t * .6); g.globalAlpha = morph * (1 - fly);
        for (let k = 0; k < 14; k++) { g.rotate(Math.PI / 7); g.fillStyle = k % 2 ? 'rgba(242,198,64,.55)' : 'rgba(255,240,180,.45)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-14, -190); g.lineTo(14, -190); g.closePath(); g.fill(); }
        g.restore();
      }
      if (morph < 1) { g.save(); g.globalAlpha = 1 - morph; t5Bone(g, bx, by, bs); g.restore(); }
      if (morph > 0) { const dx = bx + (tx - bx) * fly, dy = by + (ty - by) * fly, ds = (bs * .9) * (1 - fly * .8); g.save(); g.globalAlpha = morph * (1 - fly * .6); t5Dress(g, dx, dy, ds); g.restore(); if (fly < .9) sparkle(g, dx + 40 * ds, dy - 40 * ds, 12, .6 + .4 * Math.sin(t * 9)); }
    },
    drawMid(g) {
      if (!this.on() || m.gone) return;
      const onBed = m.runT < 0;
      t5Tam(g, m.x + (onBed ? 10 : 0), onBed ? GROUND - 12 : GROUND, { pose: onBed ? 'bed' : m.runT > 2.4 ? 'run' : 'stand', cry: onBed && this.st === 'cry', dep: this.st === 'done' || (this.st === 'magic' && this.t > 5.6), ph: S.t * 10, alpha: m.alpha() });
      if (onBed && this.st === 'cry' && groom.x > x - 620) t5Say(g, x + 10, GROUND - 146, 'Ta muốn đi xem hội lắm, mà chẳng có bộ áo nào đẹp…');
    },
  };
  return e;
}

// the big fish bone of Bống and the festival dress it turns into (drawn round x, y at size s)
function t5Bone(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineCap = 'round';
  g.fillStyle = '#f6f1e4'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-24, -12); g.lineTo(-20, 12); g.closePath(); g.fill(); g.stroke();   // the head
  g.fillStyle = INK; g.beginPath(); g.arc(-30, -2, 2.2, 0, 6.283); g.fill();
  for (const [w, c] of [[6, INK], [3.6, '#f6f1e4']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(-20, 0); g.lineTo(28, 0); for (let r = -12; r <= 20; r += 8) { g.moveTo(r, 0); g.quadraticCurveTo(r + 3, -8, r + 6, -14); g.moveTo(r, 0); g.quadraticCurveTo(r + 3, 8, r + 6, 14); } g.stroke(); }
  g.fillStyle = '#f6f1e4'; g.lineWidth = 2.2; g.strokeStyle = INK; g.beginPath(); g.moveTo(28, 0); g.lineTo(44, -14); g.lineTo(40, 0); g.lineTo(44, 14); g.closePath(); g.fill(); g.stroke();   // the tail
  g.restore();
}
function t5Dress(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  t5Shape(g, '#a3332a', () => { g.moveTo(-16, 6); g.lineTo(16, 6); g.lineTo(22, 46); g.lineTo(-22, 46); g.closePath(); });
  t5Shape(g, '#2f6a4c', () => { g.moveTo(-18, 8); g.lineTo(-16, -40); g.quadraticCurveTo(0, -46, 16, -40); g.lineTo(18, 8); g.closePath(); });
  t5Shape(g, '#2f6a4c', () => { g.moveTo(-16, -38); g.lineTo(-34, -10); g.lineTo(-26, -6); g.lineTo(-14, -26); g.closePath(); }); t5Shape(g, '#2f6a4c', () => { g.moveTo(16, -38); g.lineTo(34, -10); g.lineTo(26, -6); g.lineTo(14, -26); g.closePath(); });
  t5Shape(g, '#e8b83a', () => { g.moveTo(-8, -38); g.lineTo(8, -38); g.lineTo(10, -14); g.lineTo(0, -8); g.lineTo(-10, -14); g.closePath(); });
  t5Shape(g, '#c0567a', () => g.rect(-19, 2, 38, 7));
  g.restore();
}

/* ---------- the evening coming on: the light turns to the orange of sunset as the party goes on ---------- */
function t5Dusk(x0, x1) {
  return { layer: 'bg', k: 0,
    update(dt) { const want = Math.max(0, Math.min(1, (groom.x - x0) / (x1 - x0))); this.k += (want - this.k) * Math.min(1, dt * 2); },
    draw(g) {                                                             // the sun going down over the far part of the tranh
      if (this.k < .02) return;
      const vw = cv.width / DPR / scale, sx = camX + vw * .86, sy = -offY + 80 + this.k * (offY + GROUND - 380);   // high on the right, sinking toward the trees
      g.save(); g.globalAlpha = Math.min(1, this.k * 2);
      g.fillStyle = this.k > .6 ? '#d4471c' : '#e8a03a'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(sx, sy, 38, 0, 6.283); g.fill(); g.stroke(); g.restore();
    },
    drawHud(g, vw) { if (this.k < .02) return; const gr = g.createLinearGradient(0, 0, 0, viewH); gr.addColorStop(0, `rgba(228,96,34,${.34 * this.k})`); gr.addColorStop(1, `rgba(240,150,60,${.1 * this.k})`); g.fillStyle = gr; g.fillRect(0, 0, vw, viewH); },
  };
}

/* ---------- 3 · in the rain: drag the parasol from its mouse onto Tấm ---------- */
function t5Rain(x) {
  const m = t5Meet(x, ['Mưa to quá… ta ướt hết cả rồi, lạnh quá…', 'Hu hu… ta lạnh lắm…']);
  const e = { layer: 'bg', ax: x, st: 'rain', t: 0, rainK: 0, bow: 0,
    near() { return this.on() && !m.gone && Math.abs(groom.x - x) < 520; },
    on() { return !!T5.dress; },                                     // only once she has her dress
    grab(wx, wy) {
      const f = followers[0];
      if (!this.on() || this.st !== 'rain' || f.item !== 'parasol' || Math.abs(groom.x - x) > 700) return null;
      const px = f.x + 14 * f.face; if (Math.abs(wx - px) > 50 || wy < GROUND - 250 || wy > GROUND - 60) return null;
      f.item = null; AU.click(); return { ent: this, x: wx, y: wy, draw: g => dp(g, ITEM.parasol, S.drag.x, S.drag.y + 60, -.1) };   // the mouse lets go of it
    },
    drop(d) {
      if (!(Math.abs(d.x - x) < 80 && d.y > GROUND - 300 && d.y < GROUND)) { followers[0].item = 'parasol'; return; }   // not on Tấm: back to the mouse
      {
        followers[0].item = null; S.parasol = false; updateHud();            // the parasol goes to Tấm (back at the very end)
        this.st = 'given'; this.t = 0; T5.lent = true; AU.pluck(84);
        const len = AU.melody(T5_TUNE, T5_CHORDS, 58, 'sao') || 16;          // the owner's tune, slow, on the bamboo flute
        T5.musicEnd = S.t + len + .5; T5.holdEnd = S.t + 4.5;               // the tune plays on, but the party need not wait it out
      }
    },
    update(dt) {
      m.step(dt); this.t += dt;
      const near = this.on() && this.st === 'rain' && groom.x > x - 900 && groom.x < x + 500;
      this.rainK += ((near ? 1 : 0) - this.rainK) * Math.min(1, dt * (this.st === 'given' ? .9 : 1.5));   // the rain dies away slowly
      if (this.st === 'given' && !this.thanked && this.t > 4.5) { this.thanked = true; m.run('Ta cảm ơn đoàn chuột, cho ta mượn chiếc lọng nhé!'); }   // she thanks them and goes while the flute plays on
      if (this.st === 'given') this.bow = Math.min(1, this.bow + dt / 3);   // slow, but not too slow
      if (this.think == null && this.on() && this.st === 'rain' && x - camX < cv.width / DPR / scale - 70) this.think = 0;   // first sight of her alone in the rain (she is on screen)
      if (this.think != null) this.think += dt;
    },
    draw(g) {                                                             // the rainbow behind her once the rain stops
      if (this.bow < .02) return;
      g.save(); g.globalAlpha = Math.min(1, this.bow * 2) * .8 * (m.gone ? .6 : 1); g.lineWidth = 9;
      const sweep = Math.PI * Math.min(1, this.bow * 1.4);                 // the bow draws itself from the left foot over to the right
      ['#a3332a', '#e07a2a', '#e8b83a', '#2f6a4c', '#2f5f8f', '#6a3f7a'].forEach((c, i) => { g.strokeStyle = c; g.beginPath(); g.arc(x + 40, GROUND + 40, 300 - i * 9, Math.PI, Math.PI + sweep); g.stroke(); });
      g.restore();
    },
    drawMid(g) {
      if (!this.on() || m.gone) return;
      const has = this.st === 'given';
      t5Tam(g, m.x, GROUND, { pose: has ? (m.runT > 2.4 ? 'run' : 'hold') : 'stand', cry: !has, dep: true, ph: S.t * 10, alpha: m.alpha() });
      if (has) dp(g, ITEM.parasol, m.x + 18, GROUND - 60, -.05, 1, 1);
      if (!has && groom.x > x - 620) t5Say(g, x, GROUND - 180, Math.floor(S.t / 3.2) % 2 ? 'Hu hu… ta lạnh lắm…' : 'Mưa to quá, lạnh quá…');
      if (has && m.runT < 0 && this.t > 2) t5Say(g, x, GROUND - 230, 'Trong tim ta như có cầu vồng vậy…');
      if (!has && followers[0].item === 'parasol' && Math.abs(groom.x - x) < 700 && !S.drag) { const f = followers[0]; sparkle(g, f.x + 14 * f.face + 20, GROUND - 230, 6, .3 + .3 * Math.sin(S.t * 3)); }
    },
    drawFg(g) {                                                           // the groom's thought, over the parasol
      if (this.think != null && this.think < 3.8) t5Think(g, groom.x + 20, GROUND - 262, 'Lại gì nữa đây?', Math.min(1, this.think * 4, (3.8 - this.think) * 3));
    },
    drawHud(g, vw) {                                                      // the rain, as chương IV draws it
      if (this.rainK < .02) return;
      g.strokeStyle = `rgba(47,95,143,${.35 * this.rainK})`; g.lineWidth = 1.5; g.beginPath();
      for (let i = 0, rr = mulberry(7 + ((S.t * 12) | 0)); i < 70; i++) { const px = rr() * vw, py = rr() * viewH; g.moveTo(px, py); g.lineTo(px - 6, py + 16); }
      g.stroke(); g.fillStyle = `rgba(80,90,110,${.12 * this.rainK})`; g.fillRect(0, 0, vw, viewH);
    },
  };
  return e;
}

/* ---------- 4 · up the areca tree: drag her down to the ground ---------- */
function t5Cau(x) {
  const TOP = GROUND - 160, FR = GROUND - 380, HX = x - 26, m = t5Meet(x, []);
  const SAY = ['Mẹ bắt ta lên hái cau, ta sợ quá…', 'Hu hu… cao quá, ta không dám xuống…', 'Cứu ta với…'];   // she cries out by herself, no tap needed (owner)
  const e = { layer: 'bg', ax: x, st: 'top', tx: HX, ty: TOP,
    near() { return this.on() && !m.gone && Math.abs(groom.x - x) < 520; },
    on() { return !!T5.lent; },                                      // only once the parasol is lent
    grab(wx, wy) {
      if (!this.on() || this.st !== 'top' || Math.abs(wx - this.tx) > 40 || wy < this.ty - 180 || wy > this.ty + 10) return null;
      AU.click(); return { ent: this, ox: this.tx - wx, oy: this.ty - wy, x: wx, y: wy, draw() {} };
    },
    drop(d) {
      if (this.ty > GROUND - 50) { this.ty = GROUND; this.st = 'down'; T5.down = true; m.x = this.tx; m.run('May quá, xuống được rồi! Ta cảm ơn đoàn chuột đã đỡ ta!'); }
      else { this.st = 'back'; toast('Chưa tới đất, Tấm lại bám lấy thân cau…', 2.2); }
    },
    update(dt) {
      m.step(dt);
      const d = S.drag && S.drag.ent === this ? S.drag : null;
      if (d) { this.tx = d.x + d.ox; this.ty = Math.min(GROUND, d.y + d.oy); }
      if (this.st === 'back') { this.tx += (HX - this.tx) * Math.min(1, dt * 4); this.ty += (TOP - this.ty) * Math.min(1, dt * 4); if (Math.abs(this.ty - TOP) < 2) this.st = 'top'; }
    },
    draw(g) {
      // the areca palm: a tall ringed trunk and fronds at the top
      g.fillStyle = '#7a6a4a'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.rect(x - 7, FR, 15, GROUND - FR); g.fill(); g.stroke();
      g.lineWidth = 1.2; g.beginPath(); for (let y = GROUND - 20; y > FR + 10; y -= 18) { g.moveTo(x - 7, y); g.lineTo(x + 8, y); } g.stroke();
      for (const a of [-2.7, -2.2, -1.6, -1.0, -.5]) { g.save(); g.translate(x + 2, FR - 2); g.rotate(a); t5Shape(g, '#2f6a4c', () => g.ellipse(48, 0, 50, 8, 0, 0, 6.283)); g.restore(); }
      t5Shape(g, '#e8b83a', () => g.ellipse(x + 10, FR + 18, 10, 7, 0, 0, 6.283));
    },
    drawMid(g) {
      if (!this.on() || m.gone) return;
      if (this.st === 'down') { t5Tam(g, m.x, GROUND, { pose: m.runT > 2.4 ? 'run' : 'stand', dep: true, ph: S.t * 10, alpha: m.alpha() }); return; }
      const dragging = S.drag && S.drag.ent === this;
      t5Tam(g, this.tx, this.ty, { pose: dragging ? 'stand' : 'hug', cry: true, dep: true, s: .75 });
      if (this.st === 'top' && !dragging) {
        // the trunk passes in front of her hands and knees, so she holds it rather than hangs before it
        g.fillStyle = '#7a6a4a'; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(x - 7, this.ty - 124, 15, 124); g.beginPath(); g.moveTo(x - 7, this.ty - 124); g.lineTo(x - 7, this.ty); g.moveTo(x + 8, this.ty - 124); g.lineTo(x + 8, this.ty); g.stroke();
        g.lineWidth = 1.2; g.beginPath(); for (let y = this.ty - 118; y < this.ty; y += 18) { g.moveTo(x - 7, y); g.lineTo(x + 8, y); } g.stroke();
        if (groom.x > x - 620) t5Say(g, this.tx + 10, this.ty - 150, SAY[Math.floor(S.t / 3.2) % SAY.length]);
      }
    },
  };
  return e;
}

// a speech bubble with words in it, its tail at x, y
function t5Say(g, x, y, text) {
  g.font = '700 15px "Be Vietnam Pro", sans-serif'; const words = text.split(' '), lines = []; let ln = '';
  for (const w of words) { const t = ln ? ln + ' ' + w : w; if (g.measureText(t).width > 170 && ln) { lines.push(ln); ln = w; } else ln = t; } lines.push(ln);
  const w = Math.max(...lines.map(l => g.measureText(l).width)) + 24;
  t4Bubble(g, x, y, w, g => { g.fillStyle = INK; g.font = '700 15px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, k) => g.fillText(l, 0, (k - (lines.length - 1) / 2) * 19)); }, lines.length * 19 + 16);
}

function t5Think(g, x, y, text, a) {
  g.save(); g.globalAlpha = a; g.font = '700 15px "Be Vietnam Pro", sans-serif';
  const w = g.measureText(text).width + 30, h = 40, cy = y - h / 2 - 22;
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.2;
  const puffs = []; for (let k = 0; k < 12; k++) { const t = k / 12 * 6.283; puffs.push([x + Math.cos(t) * (w / 2 - 6), cy + Math.sin(t) * (h / 2 - 4), 13]); }
  for (const [px, py, r] of puffs) { g.beginPath(); g.arc(px, py, r, 0, 6.283); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(x, cy, w / 2 - 4, h / 2, 0, 0, 6.283); g.fill();          // covers the inner edges of the puffs
  for (const [bx, by, r] of [[x - 14, y - 10, 6], [x - 22, y + 2, 3.6]]) { g.beginPath(); g.arc(bx, by, r, 0, 6.283); g.fill(); g.stroke(); }
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, cy + 1);
  g.restore();
}

/* ---------- 5 · the oriole's cage: three taps open it ---------- */
function t5Cage(x) {
  const CY = GROUND - 250;
  const e = { layer: 'bg', ax: x, taps: 0, st: 'shut', t: 0, shake: 0, bx: x, by: CY + 30,
    near() { return this.on() && this.st === 'shut' && Math.abs(groom.x - x) < 520; },
    on() { return !!T5.down; },                                      // only once she is down from the areca
    onClick(wx, wy) {
      if (!this.on() || this.st !== 'shut' || Math.abs(wx - x) > 40 || wy < CY - 10 || wy > CY + 70) return false;
      this.shake = .5; AU.chirp();
      // the cage has a lock: two cut papers laid one over the other must light up a key (js/ch1/giay-khoa.js)
      giayOpen(() => { const vw0 = cv.width / DPR / scale; this.st = 'key'; this.kt = 0; this.kfrom = [camX + vw0 / 2, -offY + viewH * .45]; this.kclick = false; AU.pluck(88); });
      return true;
    },
    update(dt) {
      this.shake = Math.max(0, this.shake - dt); this.t += dt;
      if (this.on() && !this.prepped) { this.prepped = true; giayPrep(); }          // the two papers are torn in the background from the moment Tấm is down
      if (this.st === 'key') {                                                 // the key flies to the lock (1.3 s), is pushed in and turned (.7 s), then the door gives
        this.kt += dt;
        if (!this.kclick && this.kt > 1.3) { this.kclick = true; AU.click(); AU.thump(); }
        if (this.kt > 2) { T5.bird = true; this.st = 'open'; this.t = 0; AU.pluck(88); AU.stamp(); toast('Cửa lồng bật mở, chim vàng anh bay vút lên trời!', 3); }
      }
      if (this.st === 'open' && this.t > .5) { this.bx += 160 * dt; this.by -= 120 * dt + Math.sin(this.t * 14) * 2; }
    },
    draw(g) {
      // a tree with a branch out over the road, the cage hanging from it
      dp(g, PROPS.bamboo, x - 100, GROUND + 4, 0, 1.05, 1.05);
      if (!this.on()) return;
      t5Shape(g, '#5f8a3a', () => { g.moveTo(x - 86, CY - 98); g.quadraticCurveTo(x - 30, CY - 118, x + 28, CY - 108); g.lineTo(x + 28, CY - 102); g.quadraticCurveTo(x - 30, CY - 110, x - 86, CY - 90); g.closePath(); });   // a bamboo pole tied out from the clump
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); for (const k of [-60, -20, 14]) { g.moveTo(x + k, CY - 112); g.lineTo(x + k, CY - 102); } g.stroke();
      const sh = Math.sin(S.t * 40) * this.shake * 5;
      g.save(); g.translate(x + sh, CY);
      g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-sh, -106); g.lineTo(0, -8); g.stroke();   // the cord, up to the branch
      if (this.st === 'shut' || this.st === 'key') this.drawBird(g, 0, 40, 1);
      g.strokeStyle = '#8a5a2a'; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, 26, 8, 0, Math.PI, 0); g.stroke();
      g.beginPath(); for (let k = -24; k <= 24; k += 8) { g.moveTo(k, 0 + (Math.abs(k) > 20 ? 4 : 0)); g.lineTo(k * 1.1, 56); } g.stroke();
      t5Shape(g, '#8a5a2a', () => g.ellipse(0, 58, 30, 7, 0, 0, 6.283));
      if (this.st === 'open') { g.save(); g.translate(26, 44); g.rotate(-1.2); g.strokeStyle = '#8a5a2a'; g.lineWidth = 2.4; g.strokeRect(-12, -24, 24, 24); g.restore(); }
      g.restore();
      if (this.st === 'key') {
        const lock = [x + 30, CY + 44], p = Math.min(1, this.kt / 1.3), e = p * p * (3 - 2 * p), push = this.kt > 1.3 ? Math.min(1, (this.kt - 1.3) / .25) : 0, turn = this.kt > 1.55 ? Math.min(1, (this.kt - 1.55) / .45) : 0;
        const kx = this.kfrom[0] + (lock[0] + 26 - this.kfrom[0]) * e - 26 * push, ky = this.kfrom[1] + (lock[1] - this.kfrom[1]) * e - Math.sin(p * Math.PI) * 70;
        t5Key(g, kx, ky, 3 - 2 * e, Math.PI + (1 - e) * 5.5 + turn * 1.2, 1 - Math.max(0, push - .6));
      }
      if (this.st === 'open' && this.by > -offY - 40) this.drawBird(g, this.bx, this.by, Math.sin(this.t * 20) > 0 ? 1 : -1);
      if (this.st === 'shut' && groom.x > x - 600) sparkle(g, x + 34, CY - 4, 6, .3 + .3 * Math.sin(S.t * 3));
    },
    drawBird(g, x, y, flap) {                                              // chim vàng anh: yellow, a black mask and wings
      t5Shape(g, '#e8b83a', () => g.ellipse(x, y, 13, 9, -.2, 0, 6.283));
      t5Shape(g, '#2a221d', () => { g.moveTo(x - 4, y - 2); g.lineTo(x - 18, y - 2 - 10 * flap); g.lineTo(x - 2, y + 4); g.closePath(); });
      t5Shape(g, '#e8b83a', () => g.arc(x + 11, y - 8, 7, 0, 6.283));
      g.fillStyle = '#2a221d'; g.fillRect(x + 8, y - 11, 9, 3); g.fillStyle = '#c0567a'; g.beginPath(); g.moveTo(x + 17, y - 9); g.lineTo(x + 24, y - 7); g.lineTo(x + 17, y - 5); g.fill();
    },
  };
  return e;
}

// the key made from the two papers: gold, a lozenge head and a shank with two teeth; its head at the left, the shank to the right when rot is 0
function t5Key(g, x, y, sc, rot, alpha = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = alpha; g.fillStyle = '#f2c640'; g.strokeStyle = INK; g.lineWidth = 2; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-34, 0); g.lineTo(-22, -12); g.lineTo(-10, 0); g.lineTo(-22, 12); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#6a4a1a'; g.beginPath(); g.moveTo(-27, 0); g.lineTo(-22, -5); g.lineTo(-17, 0); g.lineTo(-22, 5); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#f2c640'; g.beginPath(); g.rect(-10, -3, 38, 6); g.fill(); g.stroke(); g.beginPath(); g.rect(14, 3, 5, 9); g.rect(22, 3, 5, 6); g.fill(); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
// the cat's bell drawn crisp at any size: a gold ball with its slit, on a red ribbon
function t5Bell(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  t5Shape(g, '#a3332a', () => { g.moveTo(-13, -15); g.quadraticCurveTo(0, -8, 13, -15); g.lineTo(11, -7); g.quadraticCurveTo(0, -2, -11, -7); g.closePath(); });
  t5Shape(g, '#e8b83a', () => g.arc(0, 4, 10, 0, 6.283));
  g.fillStyle = 'rgba(255,248,210,.8)'; g.beginPath(); g.ellipse(-4, 0, 3, 2, -.6, 0, 6.283); g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-7, 6); g.lineTo(7, 6); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(0, 9, 2, 0, 6.283); g.fill();
  g.restore();
}

/* ---------- 6 · the thị tree's one fruit: shake it down, it becomes Tấm, who gives back the parasol and the cat's bell ---------- */
function t5Thi(x) {
  const FX = x + 40, FY = GROUND - 250, m = t5Meet(x + 40, ['Ta là Tấm đây! Cảm ơn đoàn chuột đã giúp ta suốt cả chặng đường.']);
  const e = { layer: 'bg', ax: x, taps: 0, st: 'hang', t: 0, shake: 0, fx: FX, fy: FY, vy: 0,
    busy() { return T5.bell != null || this.st === 'fall' || this.st === 'ground' || this.st === 'grow'; },
    near() { return this.on() && Math.abs(groom.x - x) < 520; },
    on() { return !!T5.bird; },                                      // the fruit is there only once the oriole is free
    onClick(wx, wy) {
      if (!this.on()) return false;
      if (this.st === 'tam' && m.hit(wx, wy)) { m.talk(); return true; }
      if (this.st !== 'hang' || Math.abs(wx - x) > 140 || wy < GROUND - 360 || wy > GROUND) return false;
      this.taps++; this.shake = .6; AU.creak();
      if (this.taps >= 4) { this.st = 'fall'; this.t = 0; }
      return true;
    },
    update(dt) {
      m.step(dt); this.t += dt; this.shake = Math.max(0, this.shake - dt);
      if (T5.bell != null && (T5.bell += dt) > 4) { T5.bell = null; if (!S.inv.includes('lucLac')) S.inv.push('lucLac'); updateHud(); AU.pluck(91); }
      if (this.st === 'fall') { this.vy += 900 * dt; this.fy = Math.min(GROUND - 10, this.fy + this.vy * dt); if (this.fy >= GROUND - 10) { this.st = 'ground'; this.t = 0; AU.thump(); } }
      if (this.st === 'ground' && this.t > .9) { this.st = 'grow'; this.t = 0; AU.swoosh(); toast('Quả thị lăn một vòng, hoá thành Tấm!', 3); }
      if (this.st === 'grow' && this.t > 1.6) {
        this.st = 'tam'; this.t = 0; m.x = FX;
        followers[0].item = 'parasol'; updateHud();                     // the parasol comes back
        T5.bell = 0; SAVE.lucLac = true; persist();                     // the bell shows itself big in the middle first (drawHud)
        toastSay('Tấm trả lại chiếc lọng, và tặng đoàn chuột một chiếc lục lạc của mèo: "Thế nào cũng có lúc cần đến!"', 4.6);
        AU.pluck(84); setTimeout(() => AU.pluck(88), 150); setTimeout(() => AU.pluck(93), 300);
      }
    },
    draw(g) {
      const sh = Math.sin(S.t * 40) * this.shake * 6;
      g.save(); g.translate(sh * .4, 0); dp(g, WP.bigTree, x, GROUND + 4, 0, .9, .9); g.restore();
      if (!this.on()) return;
      if (this.st === 'hang' || this.st === 'fall' || this.st === 'ground') {
        const w = this.st === 'hang' ? Math.sin(S.t * 30) * this.taps * 1.5 * (this.shake > 0 ? 1 : .2) : 0;
        if (this.st === 'hang') { g.strokeStyle = '#5b2f1f'; g.lineWidth = 2; g.beginPath(); g.moveTo(FX, FY - 30); g.lineTo(FX + w, FY - 12); g.stroke(); }
        t5Shape(g, '#e8a03a', () => g.arc(this.fx + w, this.fy, 13, 0, 6.283));
        t5Shape(g, '#2f6a4c', () => g.ellipse(this.fx + w + 4, this.fy - 14, 7, 3, -.4, 0, 6.283));
        if (this.st === 'hang' && groom.x > x - 600) sparkle(g, FX + 20, FY - 20, 6, .3 + .3 * Math.sin(S.t * 3));
      }
      if (this.st === 'ground' || this.st === 'grow') sparkle(g, FX, GROUND - 30, 12, .5 + .5 * Math.sin(S.t * 8));
    },
    drawHud(g, vw) {                                                     // the bell: grows and glows in the middle, then flies to the groom's hand
      if (T5.bell == null) return;
      const t = T5.bell, cx = vw / 2, cy = viewH * .42, grow = Math.min(1, t / 1.2), fly = Math.max(0, Math.min(1, (t - 3) / 1));
      const [hx, hy] = handPos(groom), tx = hx - camX, ty = hy + offY, x0 = FX - camX, y0 = GROUND - 120 + offY;
      const ex = grow < 1 ? x0 + (cx - x0) * grow : cx + (tx - cx) * fly, ey = grow < 1 ? y0 + (cy - y0) * grow : cy + (ty - cy) * fly, s = (1 + 4 * grow) * (1 - fly * .8);
      g.fillStyle = 'rgba(29,25,21,' + (.28 * Math.min(1, t * 2) * (1 - fly)) + ')'; g.fillRect(0, 0, vw, viewH);
      g.save(); g.translate(ex, ey); g.rotate(t * .7); g.globalAlpha = grow * (1 - fly);
      for (let k = 0; k < 14; k++) { g.rotate(Math.PI / 7); g.fillStyle = k % 2 ? 'rgba(242,198,64,.55)' : 'rgba(255,240,180,.45)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-12, -170); g.lineTo(12, -170); g.closePath(); g.fill(); }
      g.restore();
      t5Bell(g, ex, ey, s * .9, Math.sin(t * 6) * .25 * (1 - fly)); if (fly < .9) sparkle(g, ex + 30 * s / 3, ey - 30 * s / 3, 12, .6 + .4 * Math.sin(t * 9));
    },
    drawMid(g) {
      if (!this.on()) return;
      if (this.st === 'grow') { const k = Math.min(1, this.t / 1.6); t5Tam(g, FX, GROUND, { pose: 'stand', dep: true, s: (.3 + .7 * k) * .8, alpha: k }); }
      if (this.st === 'tam' && !m.gone) t5Tam(g, m.x, GROUND, { pose: m.runT > 2.4 ? 'run' : 'stand', dep: true, ph: S.t * 10, alpha: m.alpha() });
    },
  };
  return e;
}

/* ---------- tranh 5 ---------- */
LEVELS[4] = {
  han: '糁𥽇', name: 'Tấm Cám', paper: 'sage', width: 9600, key: 0, abil: ['drum', 'ken'], cps: [160, 1950, 3350, 4800, 6200, 7300, 8300],
  zoom: 1.3, zoomWide: .7, kenFront: true, song: 0, gapK: .85,
  intro: '', endTitle: 'Qua chuyện Tấm Cám', endText: 'Đoàn rước đi hết con đường làng chiều hôm ấy, rồi lại rộn ràng lên đường.',
  build: () => {
    T5.chain = false; T5.meets = []; T5.musicEnd = 0; T5.holdEnd = 0; T5.bird = false; T5.dress = T5.lent = T5.down = false; T5.backUp = null; T5.bell = null; followers[0].item = 'parasol';
    return [
      decor(PROPS.bamboo, 260, GROUND + 4, .8), decor(PROPS.bamboo, 560, GROUND + 4, .9),
      t5Wait(), t5Music(), t5Field(1150), secretSpot(700, 'drum', 'Tùng! Từ ngọn tre rơi xuống một mảnh triện đỏ!'),
      t5Rice(2100),
      t5Bed(3500),
      t5Dusk(4000, 5500),
      t5Rain(5000),
      t5Cau(6400),
      t5Cage(7500),
      t5Thi(8500),
      gate(9400),
    ];
  },
};
