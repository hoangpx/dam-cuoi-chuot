/* Chương III · tranh 2 · Hứng Dừa.
   A boy clings to the top of a coconut palm; a girl walks to and fro below holding out the front of her skirt.
   The player does not move the catcher: tap a RIPE (brown) coconut and the boy twists it off, so the trick is to pick
   the moment she is about to pass underneath. Only a coconut that drops right into the lifted front of her skirt counts.
   Green coconuts come off too, but catching one costs a coconut; so does dropping one on the head of either of the
   two children running about under the palm.
   Three in the skirt wins straight away (penalties take you back down on the way); the record is the fastest time. The wind (shown by the swaying fronds
   and drifting leaves) pushes falling coconuts sideways. The whole palm leans and sways about its foot, so the coconuts
   are always moving and one picked mid-swing flies off with the palm's momentum. Three caught → the "Hứng dừa" print.
   Laid out for a portrait phone first; on wide screens the girl's walk is kept under the crown. */
const HD = { W: 460, H: 995, t: 0, ang: 0, angV: 0, caught: 0, missed: 0, won: false, slots: [], falling: [], leaves: [], wind: 0, windTo: 0, windT: 0, onWin: null };
const HD_PASS = 3, HD_G = 900, HD_GIRL = 1.2;             // the girl is drawn a little larger so she reads well on a phone

/* ---------- art ---------- */
let HDART = null;
function hdArt() {
  if (HDART) return HDART;
  const frond = (len, col, edge) => part([-30, -len - 10, len * .8, 40], a => {       // grows up-right from (0,0), bends over
    const pts = [[0, 0], [len * .18, -len * .55], [len * .45, -len * .86], [len * .56, -len * .8]];
    const spine = smooth(pts, false);
    const segs = [];
    for (let i = 1; i < 16; i++) {                                    // feather-comb leaflets on both sides, like the print
      const k = i / 16, p = [len * .45 * k * (1 + k * .2), -len * .9 * Math.sin(k * 1.35)], w = 26 * (1 - k * .55);
      segs.push([p[0], p[1], p[0] - w * .9, p[1] + w * .35], [p[0], p[1], p[0] + w * .6, p[1] + w * .75]);
    }
    const blade = new Path2D(); for (const [x0, y0, x1, y1] of segs) { blade.moveTo(x0, y0); blade.lineTo(x1, y1); }
    a.band(col, blade, 11);
    a.band(edge, spine, 5);
    a.key(lines(segs.map(s => s.slice())), 1);
    a.key(spine, 2);
  });
  const nut = (col) => part([-24, -30, 24, 24], a => {
    a.fk(col, circ(0, 0, 19), 2.4);
    a.fill('yellow', smooth([[-11, -8], [-6, -14], [2, -15], [-4, -9]]));
    a.fk('green', smooth([[-9, -17], [0, -26], [9, -17], [0, -13]]), 1.4);
  });
  const skin = 'white';
  const boy = part([-40, -70, 44, 70], a => {                          // hugging the trunk, head up
    a.fk('red', smooth([[-20, 4], [16, 2], [22, 26], [-4, 30], [-24, 22]]), 2);          // shorts
    a.fk(skin, tube([[-16, 24], [-26, 44], [-12, 62]], 9, 7), 1.8); a.fk(skin, tube([[12, 26], [26, 44], [14, 60]], 9, 7), 1.8);
    a.fk(skin, smooth([[-18, -34], [14, -36], [20, -8], [16, 6], [-20, 6], [-24, -14]]), 2.2);   // body
    a.key(smooth([[-6, -12], [0, -8], [6, -12]], false), 1);
    a.fk(skin, circ(0, -50, 17), 2.2);
    a.ink(smooth([[-6, -67], [0, -72], [6, -67], [0, -64]]));                     // topknot
    a.key(smooth([[-8, -52], [-4, -49], [0, -52]], false), 1.4); a.key(smooth([[4, -52], [8, -49], [12, -52]], false), 1.4);
    a.key(smooth([[-3, -42], [2, -39], [7, -42]], false), 1.2);
    a.fill('red', ell(-10, -44, 3.5, 2.2)); a.fill('red', ell(12, -44, 3.5, 2.2));
  });
  const boyArm = part([-8, -8, 44, 10], a => { a.fk(skin, tube([[0, 0], [20, -2], [38, 0]], 8, 6), 1.8); a.fk(skin, circ(40, 0, 6), 1.4); });
  const girl = part([-46, -150, 64, 4], a => {                        // walks right, holding the front of her skirt up as a sling
    a.ink(smooth([[-10, -142], [10, -146], [20, -128], [16, -96], [8, -60], [2, -60], [6, -100], [-8, -120]]));   // long hair
    // the skirt: the back falls to the knee, the front hem is lifted to her hands; the hollow of the cloth is the catch
    a.fk('green', smooth([[-22, -64], [16, -66], [24, -46], [48, -82], [54, -72], [42, -46], [22, -26], [-4, -18], [-26, -20]]), 2.2);
    a.fill('brown', smooth([[20, -62], [46, -80], [44, -68], [28, -52]]));
    a.key(smooth([[-12, -56], [-16, -24]], false), 1); a.key(smooth([[4, -58], [6, -24]], false), 1);
    a.key(smooth([[26, -42], [48, -74]], false), 1); a.key(smooth([[18, -30], [42, -52]], false), 1);
    a.fk('red', smooth([[-18, -110], [14, -112], [20, -64], [-20, -62]]), 2.2);          // top
    a.fk(skin, circ(4, -126, 15), 2.2);
    a.key(smooth([[6, -128], [10, -126], [14, -128]], false), 1.3);
    a.key(smooth([[8, -118], [12, -116], [15, -119]], false), 1.1);
    a.fill('red', ell(12, -122, 3, 2));
    a.fk(skin, tube([[-8, -102], [14, -90], [44, -82]], 8, 6), 1.8);                  // both hands hold up the hem
    a.fk(skin, tube([[12, -100], [30, -90], [50, -84]], 8, 6), 1.8);
    a.fk(skin, circ(50, -83, 5), 1.4);
  });
  const kid = col => part([-26, -66, 26, 4], a => {                  // one little one, legs drawn live
    for (const [x] of [[0]]) {
      a.fk(col, smooth([[x - 16, -8], [x - 18, -32], [x + 14, -34], [x + 16, -8]]), 2);
      a.fk(skin, circ(x, -46, 14), 2);
      a.ink(smooth([[x - 4, -60], [x, -64], [x + 4, -60]]));
      a.key(smooth([[x - 6, -46], [x - 2, -43], [x + 2, -46]], false), 1.2); a.key(smooth([[x + 4, -46], [x + 8, -43], [x + 12, -46]], false), 1.2);
      a.fill('red', ell(x + 8, -40, 3, 2));
    }
  });
  const leafBit = part([-10, -5, 10, 5], a => a.fk('green', smooth([[-9, 0], [0, -4], [9, 0], [0, 4]]), 1.2));
  const trunk = len => part([-30, -len - 10, 60, 10], a => {
    const pts = []; for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push([Math.sin(k * 1.6) * 34 * k, -len * k]); }
    a.fk('green', tube(pts, 30, 22), 2.4);
    const segs = []; for (let i = 1; i < len / 22; i++) { const k = i * 22 / len, x = Math.sin(k * 1.6) * 34 * k, y = -len * k, w = 13 - k * 4; segs.push([x - w, y + 6, x, y - 3, x + w, y + 6]); }
    a.key(lines(segs), 1.4);
  });
  HDART = { fronds: [frond(190, 'green', 'red'), frond(170, 'red', 'green'), frond(210, 'green', 'red')], ripe: nut('brown'), green: nut('green'), boy, boyArm, girl, kids: [kid('red'), kid('green')], leafBit, trunk, trunkCache: {} };
  return HDART;
}
const hdTrunk = len => { const A = hdArt(), k = Math.round(len / 20) * 20; return A.trunkCache[k] || (A.trunkCache[k] = A.trunk(k)); };

// the Nôm inscription from the real print (img/ch3/hung-dua-chu.png): only its ink is kept, so it prints onto our paper
let HD_TEXT = null;
function hdText() {
  if (HD_TEXT) return HD_TEXT.ready ? HD_TEXT.c : null;
  HD_TEXT = { ready: false, c: null };
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    const W0 = c.width, H0 = c.height;
    for (let i = 0; i < p.length; i += 4) {
      const px = (i / 4) % W0, py = Math.floor(i / 4 / W0), stray = px < W0 * .09 || px > W0 * .97 || py < H0 * .035 || (py > H0 * .89 && px < W0 * .55);   // bits of frond and a flower caught at the crop edges
      const lum = .3 * p[i] + .59 * p[i + 1] + .11 * p[i + 2]; p[i + 3] = stray ? 0 : Math.max(0, Math.min(1, (165 - lum) / 85)) * p[i + 3]; p[i] = 29; p[i + 1] = 25; p[i + 2] = 21; }
    x.putImageData(d, 0, 0); HD_TEXT.c = c; HD_TEXT.ready = true;
  };
  img.src = 'img/ch3/hung-dua-chu.png';
  return null;
}

// where the inscription sits (right of the palm) and, mirrored across the trunk, the clock
function hdTextBox() {
  const p = HD.H > HD.W, h = HD.H * (p ? .3 : .34), w = h * 131 / 331;
  return { x: p ? HD.W - w - 28 : HD.W * .74, y: p ? HD.H * .38 : HD.H * .2, w, h };
}
// the time so far as a red woodblock disc, its red ring going round once a minute like a clock hand
function hdDrawClock(g, box) {
  const el = typeof C3 !== 'undefined' ? C3.time : 0, k = (el % 60) / 60, sec = Math.floor(el);
  const p = HD.H > HD.W, cx = p ? 64 : Math.max(90, 2 * HD.base.x - (box.x + box.w / 2)), cy = box.y + box.h / 2, r = p ? 46 : 58;
  g.save(); g.translate(cx, cy);
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#a3332a'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r - 7, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.closePath(); g.fill();
  g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(0, 0, r - 19, 0, 6.283); g.fill(); g.lineWidth = 1.4; g.stroke();
  g.font = `900 ${p ? 22 : 26}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#a3332a';
  g.fillText(c3Clock(sec), 0, 1);
  g.restore();
}

/* ---------- layout ---------- */
function hdLayout() {
  const portrait = HD.H > HD.W;
  HD.ground = HD.H * (portrait ? .86 : .88);
  HD.base = { x: portrait ? HD.W * .34 : HD.W * .5 - 60, y: HD.ground + 6 };
  HD.top = { x: HD.base.x + 34, y: HD.H * (portrait ? .24 : .32) };
  HD.crown = { x: HD.top.x, y: HD.top.y + 16 };
  HD.apronY = HD.ground - 72 * HD_GIRL;                  // the mouth of the skirt sling
  // coconuts hang under the fronds, from a little left of the crown to well right of it; she walks under all of them
  // kept in from the edges: the swaying palm carries them up to ~100 units either way
  const sx0 = Math.max(portrait ? 110 : 90, HD.crown.x - 150), sx1 = Math.min(HD.W - (portrait ? 110 : 90), HD.crown.x + 175);
  HD.walk = { x0: Math.max(70, sx0 - 90), x1: Math.min(HD.W - 70, sx1 + 90) };
  const n = 7; HD.slotPos = [];
  for (let i = 0; i < n; i++) { const k = i / (n - 1), dx = sx0 + k * (sx1 - sx0) - HD.crown.x; HD.slotPos.push({ x: HD.crown.x + dx, y: HD.crown.y + 34 + Math.abs(dx) * .22 + (i % 2) * 14 }); }
}
function hdStart() {
  hdLayout();
  Object.assign(HD, { t: 0, caught: 0, missed: 0, won: false, falling: [], leaves: [], wind: 0, windTo: 0, windT: 2, smart: false });
  HD.ang = hdSway(0); HD.angV = 0;                         // no jolt on the first frame
  HD.slots = HD.slotPos.map((p, i) => ({ ...p, i, st: i % 3 === 1 ? 'ripe' : 'green', t: 0, grow: 2 + R() * 4, wig: 0 }));
  HD.girl = { x: (HD.walk.x0 + HD.walk.x1) / 2, face: 1, sp: 90, turnT: 2, pause: 0, ph: 0, bump: 0, load: 0 };
  HD.boy = { reach: 0, target: null, shake: 0 };
  HD.kids = [0, 1].map(i => ({ i, x: HD.walk.x0 + (HD.walk.x1 - HD.walk.x0) * (.25 + i * .5), face: i ? -1 : 1, sp: 100, turnT: 1, ph: R() * 6, dizzy: 0 }));
  HD.fx = []; HD.lost = 0;
}

/* ---------- update ---------- */
function hdUpdate(dt) {
  HD.t += dt;
  // wind: eases towards a new strength every few seconds
  if ((HD.windT -= dt) <= 0) { HD.windT = 3.5 + R() * 3.5; HD.windTo = (R() * 2 - 1) * (R() < .25 ? .2 : 1); }
  HD.wind += (HD.windTo - HD.wind) * Math.min(1, dt * .9);
  const ang = hdSway(HD.t);
  HD.angV = dt > 0 ? (ang - HD.ang) / dt : 0; HD.ang = ang;
  if (R() < dt * (.6 + Math.abs(HD.wind) * 1.8)) HD.leaves.push({ x: HD.wind > 0 ? -10 : HD.W + 10, y: HD.H * (.15 + R() * .55), t: 0, ph: R() * 6 });
  for (const l of HD.leaves) { l.t += dt; l.x += (HD.wind * 150 + (HD.wind >= 0 ? 20 : -20)) * dt; l.y += Math.sin(l.t * 3 + l.ph) * 20 * dt + 8 * dt; }
  HD.leaves = HD.leaves.filter(l => l.x > -30 && l.x < HD.W + 30 && l.t < 12);
  // the girl strolls, turns and sometimes stops
  const g = HD.girl;
  g.bump = Math.max(0, g.bump - dt);
  if (g.pause > 0) g.pause -= dt;
  else {
    g.x += g.face * g.sp * dt; g.ph += dt * g.sp / 11;
    if (g.x < HD.walk.x0) { g.x = HD.walk.x0; g.face = 1; } if (g.x > HD.walk.x1) { g.x = HD.walk.x1; g.face = -1; }
    if ((g.turnT -= dt) <= 0) { g.turnT = 1.4 + R() * 2.6; if (R() < .45) g.face *= -1; g.sp = 60 + R() * 80; if (R() < .2) g.pause = .5 + R() * .8; }
  }
  // the two children scamper about, turn often, and sit dazed for a moment after a knock on the head
  for (const k of HD.kids) {
    k.dizzy = Math.max(0, k.dizzy - dt);
    if (k.dizzy > 0) continue;
    k.x += k.face * k.sp * dt; k.ph += dt * k.sp / 8;
    if (k.x < HD.walk.x0) { k.x = HD.walk.x0; k.face = 1; } if (k.x > HD.walk.x1) { k.x = HD.walk.x1; k.face = -1; }
    if ((k.turnT -= dt) <= 0) { k.turnT = .6 + R() * 1.6; if (R() < .55) k.face *= -1; k.sp = 70 + R() * 110; }
  }
  for (const e of HD.fx) e.t += dt; HD.fx = HD.fx.filter(e => e.t < 1.2);
  // coconuts ripen on the palm
  for (const s of HD.slots) {
    s.wig = Math.max(0, s.wig - dt); s.t += dt;
    if (s.st === 'empty' && s.t > 1.4) { s.st = 'green'; s.t = 0; s.grow = 2.5 + R() * 4; }
    else if (s.st === 'green' && s.t > s.grow) { s.st = 'ripe'; s.t = 0; }
    else if (s.st === 'twist' && s.t > .28) {
      s.st = 'empty'; s.t = 0; const [wx, wy] = hdWorld(s.x, s.y), rx = wx - HD.base.x, ry = wy - HD.base.y;
      HD.falling.push({ x: wx, y: wy, vx: -HD.angV * ry, vy: HD.angV * rx, rot: 0, st: 'fall', t: 0, green: !!s.wasGreen }); AU.pluck(70);
    }
  }
  if (!HD.slots.some(s => s.st === 'ripe' || s.st === 'twist')) { const g2 = HD.slots.filter(s => s.st === 'green'); if (g2.length) { const s = g2[(R() * g2.length) | 0]; s.st = 'ripe'; s.t = 0; } }
  // falling coconuts: gravity, wind drift, the catch
  for (const f of HD.falling) {
    f.t += dt;
    if (f.st === 'fall') {
      const y0 = f.y; f.vy += HD_G * dt; f.y += f.vy * dt; f.x += (f.vx + HD.wind * 60) * dt; f.rot += dt * 5;
      const ax = g.x + g.face * 34 * HD_GIRL, headY = HD.ground - 48;
      if (!HD.won && !f.bounced && y0 < HD.apronY && f.y >= HD.apronY && Math.abs(f.x - ax) < 22 * HD_GIRL) {
        f.st = 'caught'; g.bump = .35;
        if (f.green) { hdLose(ax, HD.apronY - 30); AU.snort(); }                  // a green one: that costs a coconut
        else {
          HD.caught++; g.load = Math.min(3, HD.caught); AU.pluck(78 + HD.caught); AU.drumOne();
          if (HD.caught >= HD_PASS && !HD.won) { HD.won = true; if (HD.onWin) { const cb = HD.onWin; HD.onWin = null; cb(); } }   // three: done

        }
      } else if (!HD.won && !f.bounced && y0 < headY && f.y >= headY && HD.kids.some(k => Math.abs(f.x - k.x) < 24 && (f.kid = k))) {
        const k = f.kid; k.dizzy = 1.4; f.bounced = true; f.vy = -260; f.vx = (f.x < k.x ? -1 : 1) * 140; hdLose(k.x, headY - 40); AU.thump(); AU.snort();
      } else if (f.y >= HD.ground - 12) { f.y = HD.ground - 12; f.st = 'ground'; f.t = 0; f.vx = HD.wind * 40 + (R() - .5) * 60; HD.missed++; AU.thump(); }
    } else if (f.st === 'ground') { f.x += f.vx * dt; f.vx *= .96; f.rot += f.vx * dt / 18; }
  }
  HD.falling = HD.falling.filter(f => f.st === 'fall' || (f.st === 'ground' && f.t < 1.6));
  HD.boy.reach = Math.max(0, HD.boy.reach - dt); HD.boy.shake = Math.max(0, HD.boy.shake - dt);
}

function hdLose(x, y) { HD.lost++; if (HD.caught > 0) HD.caught--; HD.girl.load = Math.min(3, HD.caught); HD.fx.push({ x, y, t: 0 }); }

/* ---------- input ---------- */
// how far the palm leans at time t: two slow swings plus a lean with the wind (radians)
function hdSway(t) { return .03 + Math.sin(t * .85) * .08 + Math.sin(t * 2.05 + 1) * .03 + HD.wind * .06; }
// palm frame ↔ screen: rotate about the foot of the trunk
function hdWorld(x, y, a = HD.ang) { const dx = x - HD.base.x, dy = y - HD.base.y, c = Math.cos(a), s = Math.sin(a); return [HD.base.x + dx * c - dy * s, HD.base.y + dx * s + dy * c]; }
function hdDown(x, y) {
  if (HD.won) return false;
  [x, y] = hdWorld(x, y, -HD.ang);
  let best = null, bd = 46;
  for (const s of HD.slots) { if (s.st === 'empty' || s.st === 'twist') continue; const d = Math.hypot(x - s.x, y - s.y); if (d < bd) { bd = d; best = s; } }
  if (!best) return false;
  HD.boy.target = best; HD.boy.reach = .45;
  best.wasGreen = best.st === 'green'; best.st = 'twist'; best.t = 0;
  return true;
}

/* ---------- drawing ---------- */
function hdRender(g) {
  const A = hdArt(), W = HD.W, H = HD.H, girl = HD.girl, t = HD.t;
  dp(g, c3Mound(W * .96), W / 2, HD.ground + 26);
  // the inscription in the empty sky to the right of the palm, as on the print
  const tx = hdText();
  const box = hdTextBox(); if (tx) g.drawImage(tx, box.x, box.y, box.w, box.h);
  hdDrawClock(g, box);
  for (const l of HD.leaves) dp(g, A.leafBit, l.x, l.y, Math.sin(l.t * 4 + l.ph) * .6 + HD.wind * .5);
  // the palm leans and sways about its foot; everything on it moves with it
  g.save(); g.translate(HD.base.x, HD.base.y); g.rotate(HD.ang); g.translate(-HD.base.x, -HD.base.y);
  dp(g, hdTrunk(HD.base.y - HD.top.y), HD.base.x, HD.base.y);
  const sway = HD.wind * .16, fl = [[-3.05, 2, 1], [-2.55, 0, 1.05], [-2.05, 1, 1], [-1.45, 2, 1], [-1.0, 0, 1], [-.55, 1, 1.05], [-.1, 2, 1.05], [.35, 0, .9]];
  for (const [ang, k, s] of fl) { const wob = Math.sin(t * 1.6 + ang * 3) * .03, left = ang < -Math.PI / 2; g.save(); g.translate(HD.top.x, HD.top.y); g.rotate(ang + Math.PI / 2 + sway * (1 + Math.abs(ang) * .2) + wob); const fs2 = s; dp(g, A.fronds[k], 0, 0, 0, left ? -fs2 : fs2, fs2); g.restore(); }   // left fronds are mirrored so they arch outwards
  // coconuts on the palm
  for (const s of HD.slots) {
    if (s.st === 'empty') continue;
    const wig = s.wig > 0 ? Math.sin(s.wig * 40) * .25 : 0, tw = s.st === 'twist' ? Math.sin(s.t * 60) * .4 : 0;
    const grow = s.st === 'green' ? Math.min(1, .55 + s.t / s.grow * .45) : 1;
    g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.moveTo(s.x, s.y - 20 * grow); g.lineTo(s.x + (HD.crown.x - s.x) * .12, s.y - 44); g.stroke();   // a short stalk up into the fronds
    dp(g, s.st === 'green' ? A.green : A.ripe, s.x, s.y, wig + tw + Math.sin(t * 1.3 + s.i) * .04 + HD.wind * .06, grow, grow);
  }
  // the boy at the top, reaching towards the coconut he was asked to pick
  const b = HD.boy, bx = HD.top.x - 22, by = HD.top.y + 92;
  const target = b.target, reachK = b.reach > 0 ? Math.sin((1 - b.reach / .45) * Math.PI) : 0;
  const armAng = target ? Math.atan2(target.y - (by - 20), target.x - bx) : -.6;
  g.save(); g.translate(bx, by); g.rotate(b.shake > 0 ? Math.sin(b.shake * 30) * .08 : 0);
  dp(g, A.boy, 0, 0);
  g.save(); g.translate(8, -20); g.rotate(-.5 + (armAng + .5) * reachK); g.scale(1 + reachK * .8, 1); dp(g, A.boyArm, 0, 0); g.restore();
  g.restore();
  g.restore();                                                          // end of the swaying palm
  for (const k of HD.kids) {
    const run = k.dizzy <= 0, sw = run ? Math.sin(k.ph) * 7 : 0;
    g.save(); g.translate(k.x, HD.ground + (run ? -Math.abs(Math.sin(k.ph)) * 3 : 0)); g.scale(k.face * .95, .95);
    for (const [x, s] of [[-5, sw], [6, -sw]]) { g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + s, 0); g.stroke(); g.strokeStyle = '#f2ecde'; g.lineWidth = 3.8; g.stroke(); }
    dp(g, A.kids[k.i], 0, 0, k.dizzy > 0 ? Math.sin(k.dizzy * 20) * .12 : 0);
    g.restore();
    if (k.dizzy > 0) for (let j = 0; j < 3; j++) { const a = HD.t * 6 + j * 2.1; g.fillStyle = '#f2c640'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(k.x + Math.cos(a) * 20, HD.ground - 72 + Math.sin(a) * 6, 6, 0, 6.283); g.fill(); g.stroke(); }
  }
  // falling and fallen coconuts
  for (const f of HD.falling) if (f.st !== 'caught') { g.globalAlpha = f.st === 'ground' ? Math.max(0, 1 - f.t / 1.6) : 1; dp(g, f.green ? A.green : A.ripe, f.x, f.y, f.rot); g.globalAlpha = 1; }
  // the girl, legs drawn live
  const walking = girl.pause <= 0, sw = walking ? Math.sin(girl.ph) * 9 : 0, bob = walking ? -Math.abs(Math.sin(girl.ph)) * 3 : 0;
  g.save(); g.translate(girl.x, HD.ground + bob + (girl.bump > 0 ? Math.sin(girl.bump * 18) * 3 : 0)); g.scale(girl.face * HD_GIRL, HD_GIRL);
  for (const [x, s] of [[-6, sw], [8, -sw]]) { g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -18); g.lineTo(x + s, 0); g.stroke(); g.strokeStyle = '#f2ecde'; g.lineWidth = 4.5; g.stroke(); }
  dp(g, A.girl, 0, 0);
  for (let i = 0; i < girl.load; i++) dp(g, A.ripe, 30 + i * 6, -70 - i * 4, 0, .45, .45);   // a few coconuts show in the sling
  g.restore();
  for (const e of HD.fx) { const k = e.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = '900 40px "Playfair Display", serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = '#a3332a'; g.strokeText('−1', e.x, e.y - k * 50); g.fillText('−1', e.x, e.y - k * 50); g.restore(); }
  // under the green ground strip: the three needed to pass, then how many have been caught
  const ty = Math.min(H - 44, HD.ground + (H > W ? 86 : 78)), gap = 44, tx0 = W / 2 - gap * 1.6;
  g.save(); g.globalAlpha = .88; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(tx0 - 30, ty - 30, gap * HD_PASS + 110, 56, 14); g.fill(); g.globalAlpha = 1; g.stroke(); g.restore();   // a paper strip so the count reads over the fronds
  for (let i = 0; i < HD_PASS; i++) { const on = i < HD.caught; g.save(); g.globalAlpha = on ? 1 : .22; g.translate(tx0 + i * gap, ty + (on ? Math.sin(t * 4 + i) * 1.5 : 0)); g.scale(.72, .72); dp(g, A.ripe, 0, 0); g.restore(); }
  g.save(); g.font = '900 34px "Playfair Display", serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = HD.caught >= HD_PASS ? '#2f6a4c' : INK;
  const label = '× ' + HD.caught; g.strokeText(label, tx0 + HD_PASS * gap - 8, ty - 4); g.fillText(label, tx0 + HD_PASS * gap - 8, ty - 4); g.restore();
}

C3GAMES[1] = {
  han: '承椰', name: 'Hứng Dừa', paper: 'white',
  short: portrait => portrait ? 460 : 860,         // wide screens: zoom out so the palm is as tall as on a phone
  print: 'img/ch3/hung-dua.png',                 // the reward: the real Đông Hồ print
  isWon: () => HD.won,                           // three caught; the record is the fastest time
  song: 3, ownClock: true,
  praise: () => HD.lost === 0 && HD.missed === 0 ? 'Mắt tinh quá! Không sai quả nào!' : 'Giỏi lắm! Đủ 3 quả rồi!',
  start: hdStart, update: hdUpdate, render: hdRender,
  printRender(g, W, H) { g.fillStyle = '#f2ecde'; g.fillRect(W / 2 - 140, H / 2 - 180, 280, 360); },
  down: hdDown, move() {}, up() {},
  resize(W, H) {
    const sx = W / HD.W, sy = H / HD.H; HD.W = W; HD.H = H; if (!HD.girl) return; hdLayout();
    HD.girl.x = Math.max(HD.walk.x0, Math.min(HD.walk.x1, HD.girl.x * sx));
    HD.slots.forEach((s, i) => { s.x = HD.slotPos[i].x; s.y = HD.slotPos[i].y; });
    for (const f of HD.falling) { f.x *= sx; f.y *= sy; }
  },
  onWin(f) { HD.onWin = f; },
};
