/* Tranh 6 · Bắc Kim Thang (owner's idea): a moonlit night. The party walks on as always; behind the road lies a lotus
   pond with a wooden jetty (cầu ao). Tap the jetty: the groom walks onto its foot and the view dives down onto the pond,
   now seen from above. The pond is full of lotus leaves swaying in the wind; seven frogs hide there, as green as the leaves —
   some sit on a leaf (only their eyes and the leaf-vein back give them away), some sit under one (drag the leaf aside to
   look; it drifts back by itself). Tap a frog to catch it. All seven → back on the road with a basket of frogs, the gift
   that opens the gate at the end. The ← button (top left) goes back to the road at any time; frogs caught stay caught. */

// night plates: leaf and frog greens kept close on purpose (the frogs must be hard to see)
Object.assign(PL, {
  lotus: ['#3d6a49', [-1.4, 1.2]], lotusD: ['#2b4f38', [-1.4, 1.2]], lotusL: ['#5d8a5c', [-1, 1]],
  frog: ['#416d4a', [-1.2, 1]], frogD: ['#2c4d37', [-1.2, 1]], frogL: ['#6f9762', [-.8, .8]], bud: ['#d9909f', [1.2, -1]],
});
const T6_FROGS = 7, T6_UNIT = 520, T6_BUD_GIVE = 30;   // T6_BUD_GIVE: how far a flower can be pushed from its place           // pond view: the short side of the screen is T6_UNIT units

/* ---------- art (made on first use) ---------- */
let T6_ART = null;
function t6Art() {
  if (T6_ART) return T6_ART;
  const A = {};
  // a lotus leaf seen from above, radius 100, the notch pointing right; solid underneath so a frog below never shows through
  A.leaf = [0, 1, 2, 3].map(v => part([-108, -108, 108, 108], a => {
    const rn = mulberry(40 + v), notch = .12 + rn() * .06, p = new Path2D();
    p.moveTo(6, 0);
    for (let i = 0; i <= 48; i++) { const an = notch + (6.283 - 2 * notch) * i / 48, r = 100 * (1 + .03 * Math.sin(an * 5 + v * 2) + .025 * (rn() - .5)); p.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    p.closePath();
    a.underFill(p, '#2f573d');
    a.fill('lotus', p);
    const sh = new Path2D(); sh.moveTo(0, 0); sh.arc(0, 0, 90, 1.2 + v * .3, 3.4 + v * .3); sh.closePath(); a.fill('lotusD', sh);
    a.band('lotusL', (() => { const q = new Path2D(); q.arc(0, 0, 84, 3.7, 5.4); return q; })(), 7);
    const vein = []; for (let i = 0; i < 13; i++) { const an = notch + .25 + (6.283 - 2 * notch - .5) * i / 12, r = 86 + rn() * 6; vein.push([Math.cos(an) * 9, Math.sin(an) * 9, Math.cos(an) * r * .55 + rn() * 4, Math.sin(an) * r * .55 + rn() * 4, Math.cos(an) * r, Math.sin(an) * r]); }
    a.key(lines(vein), 1.3);
    a.fk('lotusL', circ(0, 0, 8), 1.4);
    a.key(p, 2.8);
  }));
  // a frog seen from above, facing up (-y): green like the leaves, its back marked like a leaf (midrib, veins, blotches)
  A.frog = part([-44, -44, 44, 46], a => {
    for (const s of [-1, 1]) {
      a.fk('frogD', smooth([[s * 10, 6], [s * 30, 2], [s * 37, 18], [s * 27, 29], [s * 36, 38], [s * 20, 42], [s * 12, 26]]), 1.8);
      a.fk('frogD', smooth([[s * 10, -12], [s * 23, -15], [s * 28, -25], [s * 21, -27], [s * 14, -20]]), 1.6);
    }
    const body = smooth([[0, -35], [12, -31], [18, -14], [19, 6], [14, 24], [0, 31], [-14, 24], [-19, 6], [-18, -14], [-12, -31]]);
    a.fill('frog', body);
    for (const s of [-1, 1]) a.fk('frog', circ(s * 11, -25, 6.5), 1.8);
    a.fill('frogD', ell(-8, 10, 4.5, 3, .5)); a.fill('frogD', ell(9, 2, 3.5, 2.6, -.4)); a.fill('frogD', ell(5, 18, 3, 2.2, .2));
    a.band('frogL', smooth([[0, -20], [1, 2], [0, 24]], false), 2.6);
    a.key(lines([[0, -6, -9, -12], [0, -6, 9, -12], [0, 7, -12, 1], [0, 7, 12, 1], [0, 18, -9, 13], [0, 18, 9, 13]]), 1);
    a.key(body, 2.2);
  });
  // the last frog: the same shapes printed in the leaf's own greens with no ink outline (owner: the 7th must be very hard)
  A.frogHid = part([-44, -44, 44, 46], a => {
    for (const s of [-1, 1]) {
      a.fill('lotusD', smooth([[s * 10, 6], [s * 30, 2], [s * 37, 18], [s * 27, 29], [s * 36, 38], [s * 20, 42], [s * 12, 26]]));
      a.fill('lotusD', smooth([[s * 10, -12], [s * 23, -15], [s * 28, -25], [s * 21, -27], [s * 14, -20]]));
    }
    a.fill('lotus', smooth([[0, -35], [12, -31], [18, -14], [19, 6], [14, 24], [0, 31], [-14, 24], [-19, 6], [-18, -14], [-12, -31]]));
    for (const s of [-1, 1]) a.fill('lotus', circ(s * 11, -25, 6.5));
    a.key(lines([[0, -20, 0, 26], [0, -6, -12, -14], [0, -6, 12, -14], [0, 8, -14, 0], [0, 8, 14, 0]]), 1.1);   // only vein-like lines, as on a leaf
  });
  // a lotus flower from above
  A.bud = part([-40, -40, 40, 40], a => {
    for (let i = 0; i < 8; i++) { const an = i * .785; a.fk('bud', ell(Math.cos(an) * 20, Math.sin(an) * 20, 16, 8, an), 1.4); }
    for (let i = 0; i < 5; i++) { const an = i * 1.256 + .3; a.fk('white', ell(Math.cos(an) * 10, Math.sin(an) * 10, 10, 5, an), 1.2); }
    a.fk('yellow', circ(0, 0, 7), 1.4); a.ink(circ(-2, -1, 1.2)); a.ink(circ(2, 2, 1.2));
  });
  // side view: the pond strip behind the road (origin = its left end on the ground line)
  A.pondSide = w => part([-14, -112, w + 14, 0], a => {
    const top = []; for (let x = 0; x <= w; x += 20) top.push([x, -96 + Math.sin(x * .03) * 4]);
    const water = smooth([[-6, -8], ...top, [w + 6, -8]]);
    a.fill('dark', water);
    const rn = mulberry(w | 0);
    for (let i = 0; i < w / 18; i++) { const x = 10 + rn() * (w - 50), y = -84 + rn() * 66, l = 16 + rn() * 24; a.band('white', smooth([[x, y], [x + l * .25, y - 2], [x + l * .5, y], [x + l * .75, y - 2], [x + l, y]], false), 1.3); }
    for (let i = 0; i < w / 34; i++) {
      const x = 20 + rn() * (w - 40), y = -86 + rn() * 70, r = 12 + rn() * 10 + (y + 86) * .12, lf = new Path2D();
      lf.ellipse(x, y, r, r * .36, 0, .5, 6.0); lf.lineTo(x, y); lf.closePath(); a.fk('green', lf, 1.4);
    }
    for (let i = 0; i < 4; i++) { const x = 60 + rn() * (w - 120), y = -60 + rn() * 30; a.key(lines([[x, y, x + 2, y - 26]]), 1.6); for (let k = 0; k < 5; k++) a.fk('bud', ell(x + 2 + (k - 2) * 4, y - 30, 4, 8, (k - 2) * .35), 1.1); }
    for (const x0 of [6, w - 30]) for (let k = 0; k < 7; k++) { const x = x0 + k * 4; a.key(lines([[x, -10, x - 6 + k * 2, -70 - rn() * 30]]), 1.4); }
  });
  // side view: the wooden jetty going back from the road into the pond, a little oil lamp on its far post
  A.jetty = part([-70, -150, 70, 6], a => {
    const poly = pts => { const q = new Path2D(); q.moveTo(pts[0][0], pts[0][1]); for (const t of pts.slice(1)) q.lineTo(t[0], t[1]); q.closePath(); return q; };
    for (const [x, y, h] of [[-50, -10, 22], [50, -10, 22], [-30, -66, 16], [30, -66, 16]]) a.fk('brown', poly([[x - 3, y], [x + 3, y], [x + 3, y + h], [x - 3, y + h]]), 1.4);
    a.fk('straw', poly([[-56, -4], [56, -4], [34, -70], [-34, -70]]), 2.2);
    a.fill('brown', poly([[-56, -4], [56, -4], [56, 1], [-56, 1]]));
    const pl = []; for (let i = 1; i < 8; i++) { const k = 1 - Math.pow(1 - i / 8, 1.4), y = -4 - 66 * k, hw = 56 - 22 * k; pl.push([-hw, y, hw, y]); } a.key(lines(pl), 1.1);
    a.fk('brown', poly([[27, -70], [32, -70], [32, -112], [27, -112]]), 1.4);
    a.fk('yellow', poly([[23, -112], [36, -112], [33, -128], [26, -128]]), 1.4); a.key(lines([[24, -130, 35, -130]]), 2);
  });
  // the basket of frogs carried home (an item in the groom's hand)
  A.basket = part([-22, -26, 22, 18], a => {
    for (const s of [-1, 1]) { a.fk('frog', circ(s * 8, -12, 7), 1.6); a.fill('dark', circ(s * 9, -14, 2)); }
    a.fk('frog', circ(0, -16, 6), 1.4);
    const b = smooth([[-18, -8], [18, -8], [14, 14], [-14, 14]]); a.fk('straw', b, 2.2);
    a.key(lines([[-16, -1, 16, -1], [-15, 6, 15, 6], [-6, -8, -5, 14], [6, -8, 5, 14]]), 1.1);
  });
  return (T6_ART = A);
}
ITEMS.ech = { name: 'giỏ ếch', get part() { return t6Art().basket; }, s: 1, cy: -4 };

// the oil lamp's flicker, 0..1: two quick wobbles and now and then a dip as the wick gutters
function t6Flicker() { const t = S.t; return Math.max(0, Math.min(1, .6 + .25 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1) + .15 * Math.sin(t * 23.7) - (Math.sin(t * 1.7) > .93 ? .45 : 0))); }

// a leaf parting the water (the owner's recording, audio/la-re-nuoc.wav): at most one every T6_SPLASH_GAP s, and only by
// chance, so many leaves moving at once do not pile the sound up; a little change of pitch each time
const T6_SPLASH_GAP = .5;
const t6SplashLoad = () => AU.sample('lare', 'audio/la-re-nuoc.wav' + (typeof VERSION !== 'undefined' ? '?v=' + VERSION : ''));   // fetched as the tranh starts
function t6Splash(vol = 1, chance = 1) {
  t6SplashLoad();
  if (S.t - (t6Splash.last ?? -9) < T6_SPLASH_GAP || R() > chance) return;
  t6Splash.last = S.t; AU.play('lare', vol * (.75 + R() * .25), .88 + R() * .24);
}

/* ---------- state ---------- */
const T6 = { st: 'side', k: 0, found: 0, pond: null, done: false };
const t6E = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function t6View() {                     // the pond view's own units: CSS px per unit, its size, where the top bar starts
  const W = cv.width / DPR, H = cv.height / DPR, k = Math.min(W, H) / T6_UNIT;
  return { k, W: W / k, H: H / k, top: safeTop() / k };
}
function t6Pt(wx, wy) { const v = t6View(); return [(wx - camX) * scale / v.k, (wy + offY) * scale / v.k]; }

// a fresh pond: leaves scattered to cover the water (overlapping), seven frogs (3 on leaves, 4 under them), a few flowers
function t6MakePond() {
  const v = t6View(), W = v.W, H = v.H, leaves = [];
  const jetty = (x, y) => Math.abs(x - W / 2) < 80 && y > H - 150;
  const want = Math.round(W * H / 8200);
  for (let tries = 0; tries < 8000 && leaves.length < want; tries++) {
    const r = 40 + R() * 32, x = rr(-10, W + 10), y = rr(v.top + 10, H + 10);
    if (jetty(x, y) || leaves.some(l => Math.hypot(l.x - x, l.y - y) < (l.r + r) * .66)) continue;
    leaves.push({ x, y, r, v: (R() * 4) | 0, rot: R() * 6.283, ph: R() * 6.283, dx: 0, dy: 0, vx: 0, vy: 0, twitch: 0, z: R(), frogs: [] });
  }
  leaves.sort((a, b) => a.z - b.z);
  const frogs = [], used = [];
  const fits = (l, gap) => used.every(u => Math.hypot(u.x - l.x, u.y - l.y) > gap) && l.x > 50 && l.x < W - 50 && l.y > v.top + 90 && l.y < H - 60;
  const pick = minR => {                                                // spread the frogs out, easing off when the pond is small
    for (const [gap, r0] of [[130, minR], [90, minR], [60, minR - 8], [0, 0]]) {
      const c = leaves.filter(l => l.r >= r0 && !used.includes(l) && fits(l, gap));
      if (c.length) { const l = c[(R() * c.length) | 0]; used.push(l); return l; }
    }
    const l = leaves.find(q => !used.includes(q)); used.push(l); return l;
  };
  for (let i = 0; i < T6_FROGS; i++) {
    if (i === T6_FROGS - 1) { frogs.push({ jet: true, st: 'hid', t: 0, s: .6, rot: 0, blink: 3, bl: 0, breath: 0, sac: 0, sacT: 2, caught: false }); continue; }
    const under = i >= 3, l = pick(under ? 54 : 46);
    const f = { under, leaf: l, rot: R() * 6.283, s: .58 + R() * .08, blink: 2 + R() * 5, bl: 0, breath: R() * 6, caught: false, t: 0, croak: 6 + R() * 8 };
    if (under) { const an = R() * 6.283, d = R() * l.r * .18; f.x = l.x + Math.cos(an) * d; f.y = l.y + Math.sin(an) * d; }
    else { const an = R() * 6.283, d = l.r * (.2 + R() * .2); f.ox = Math.cos(an) * d; f.oy = Math.sin(an) * d; l.frogs.push(f); }
    frogs.push(f);
  }
  // water-lily flowers stay in their place, over the leaves, only swaying in the wind (owner); a finger or a leaf pushed
  // against one moves it a little, then it drifts back
  const buds = []; for (let i = 0; i < 5; i++) buds.push({ x: rr(40, W - 40), y: rr(v.top + 80, H - 170), dx: 0, dy: 0, vx: 0, vy: 0, ph: R() * 6.283, s: .8 + R() * .3 });
  const flies = []; for (let i = 0; i < 9; i++) flies.push({ x: R() * W, y: rr(v.top + 40, H - 40), ph: R() * 6.283, sp: .3 + R() * .5 });
  return { W, H, leaves, frogs, buds, flies, ripples: [], gust: { x: -400, t: 3 + R() * 3 }, drag: null };
}
// where a leaf is this frame: home + push from the finger + the wind's sway, and a gust passing over
function t6LeafPose(P, l) {
  const g = Math.exp(-Math.pow((l.x - P.gust.x) / 170, 2)), t = S.t;
  return {
    x: l.x + l.dx + Math.sin(t * .7 + l.ph) * 2.6 + g * 8,
    y: l.y + l.dy + Math.cos(t * .6 + l.ph * 1.7) * 2 + g * 2,
    rot: l.rot + Math.sin(t * .9 + l.ph) * .05 + g * .16 + l.dx * .0025 + Math.sin(l.twitch * 30) * l.twitch * .3 + Math.sin(t * 5 + l.ph) * (l.bob || 0) * .07,
    sy: 1 - .06 * g * Math.abs(Math.sin(t * 7 + l.ph)) - l.twitch * .05 - (l.bob || 0) * .06 * (.5 + .5 * Math.sin(t * 6 + l.ph)),
  };
}
function t6FrogPos(P, f) {
  if (f.jet && f.st === 'crawl') return { x: f.cx, y: f.cy, rot: f.rot };
  if (f.under) return { x: f.x, y: f.y, rot: f.rot };
  const p = t6LeafPose(P, f.leaf), c = Math.cos(p.rot), s = Math.sin(p.rot);
  return { x: p.x + f.ox * c - f.oy * s, y: p.y + (f.ox * s + f.oy * c) * p.sy, rot: f.rot + p.rot };
}
function t6Slot(P, i) { const v = t6View(), w = 46, x0 = v.W / 2 - (T6_FROGS - 1) * w / 2; return [x0 + i * w, v.top + 40]; }

/* ---------- the night over the whole tranh: dark wash, moon, stars, fireflies by the pond ---------- */
function t6Night(p0, p1) {
  const flies = []; for (let i = 0; i < 14; i++) flies.push({ x: rr(p0 - 200, p1 + 200), y: GROUND - rr(40, 200), ph: R() * 6.283 });
  const stars = []; for (let i = 0; i < 40; i++) stars.push({ x: R(), y: R() * .45, ph: R() * 6.283, s: .6 + R() });
  return { layer: 'bg', crT: 1,
    update(dt) {
      this.dawn = Math.min(1, (this.dawn || 0) + (T6C.done ? dt / 4 : 0));   // after the bridge the night lifts
      if ((this.crT -= dt) < 0) { this.crT = 1.2 + R() * 2.8; AU.cricket(.5 + R() * .5); } },   // crickets in the grass all night (owner)
    // the sky goes first in the back layer, so the moon and the stars sit behind everything (owner); they move with
    // the view, slipping back only a little, as far things do
    draw(g) {
      const vw = cv.width / DPR / scale, top = -offY, sky = Math.max(60, offY + GROUND - 260), drift = -camX * .03;
      for (const st of stars) { const a = .3 + .35 * Math.sin(S.t * 1.3 + st.ph); if (a <= 0) continue; g.globalAlpha = a; g.fillStyle = '#f4ecc8'; g.fillRect(camX + ((st.x * vw + drift) % vw + vw) % vw, top + 20 + st.y * sky, 1.6 * st.s, 1.6 * st.s); }
      g.globalAlpha = 1;
      const mx = camX + vw * .8 + drift, my = top + Math.max(70, offY + 40), halo = g.createRadialGradient(mx, my, 18, mx, my, 120);   // far off and hazy: no ink rim
      halo.addColorStop(0, 'rgba(255,246,215,.5)'); halo.addColorStop(1, 'rgba(255,246,215,0)'); g.fillStyle = halo; g.fillRect(mx - 120, my - 120, 240, 240);
      g.fillStyle = '#fff6d2'; g.beginPath(); g.arc(mx, my, 27, 0, 6.283); g.fill();
      this.moon = [mx - camX, my + offY];
      g.fillStyle = 'rgba(200,184,130,.4)'; g.beginPath(); g.arc(mx - 8, my - 5, 5, 0, 6.283); g.arc(mx + 7, my + 8, 3.5, 0, 6.283); g.fill();
      g.globalAlpha = 1;
    },
    drawHud(g, vw) {
      const [mx, my] = this.moon || [vw * .8, 70], wash = g.createRadialGradient(mx, my, 10, mx, my, 190);   // the night wash, thinner round the moon so it shines
      const n = 1 - .8 * (this.dawn || 0);
      wash.addColorStop(0, `rgba(16,22,52,${.04 * n})`); wash.addColorStop(.22, `rgba(16,22,52,${.2 * n})`); wash.addColorStop(1, `rgba(16,22,52,${.46 * n})`);
      g.fillStyle = wash; g.fillRect(0, 0, vw, viewH);
      if (this.dawn) { const gr = g.createLinearGradient(0, 0, 0, viewH); gr.addColorStop(0, `rgba(250,170,120,${.22 * this.dawn})`); gr.addColorStop(1, 'rgba(250,200,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, vw, viewH); }
      for (const f of flies) {
        const x = f.x + Math.sin(S.t * .5 + f.ph) * 40 - camX, y = f.y + Math.cos(S.t * .7 + f.ph * 1.3) * 20 + offY, a = Math.max(0, Math.sin(S.t * 2 + f.ph));
        if (x < -20 || x > vw + 20 || a < .05) continue;
        g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, 'rgba(230,255,150,.9)'); gr.addColorStop(1, 'rgba(230,255,150,0)'); g.fillStyle = gr; g.fillRect(x - 9, y - 9, 18, 18);
      }
      g.globalAlpha = 1;
    },
  };
}

/* ---------- the pond: behind the road from the side, and from above once the party walks out on the jetty ---------- */
function t6Pond(p0, p1, jx) {
  let art = null;
  const e = { layer: 'bg', ax: jx, croakT: 3,
    update(dt) {
      t6SplashLoad();
      if (!art) art = t6Art().pondSide(p1 - p0);
      if (T6.st === 'side') {
        if (groom.x > p0 - 400 && groom.x < p1 + 400 && (this.croakT -= dt) < 0) { this.croakT = 4 + R() * 5; AU.croak(.6 + R() * .4); }   // frogs in the pond (owner)
        if (S.waitMove && this.held) { S.waitMove = false; this.held = false; }
        return;
      }
      S.waitMove = true; this.held = true; howtoInput();
      if (T6.st === 'walk') {                                              // the groom steps onto the foot of the jetty
        const d = jx - groom.x;
        if (Math.abs(d) < 8) { groom.vx = 0; groom.face = 1; T6.st = 'in'; T6.k = 0; if (!T6.pond) T6.pond = t6MakePond(); $('#hud').hidden = true; }
        else groom.vx = Math.sign(d) * 150;
        return;
      }
      if (T6.st === 'in') { T6.k = Math.min(1, T6.k + dt / 1.3); if (T6.k >= 1) T6.st = 'pond'; }
      if (T6.st === 'out') { T6.k = Math.max(0, T6.k - dt / 1); if (T6.k <= 0) { T6.st = 'side'; $('#hud').hidden = false; if (T6.done && !has('ech')) { S.inv.push('ech'); AU.pluck(84); toast('Bắt đủ bảy chú ếch rồi! Mang giỏ ếch đi tiếp nào.', 3.4); } } }
      if (T6.pond) t6PondUpdate(T6.pond, dt);
    },
    onClick(wx, wy) {
      if (T6.st !== 'side' || T6.done) return false;
      const lamp = Math.hypot(wx - (jx + 29.5), wy - (GROUND - 142)) < 60;          // the lamp counts too (owner)
      if (!lamp && (Math.abs(wx - jx) > 115 || wy < GROUND - 175 || wy > GROUND + 25)) return false;
      T6.st = 'walk'; AU.click(); return true;
    },
    // while the pond is up every touch belongs to it
    grab(wx, wy) {
      if (T6.st === 'side') return null;
      const d = { ent: this, x: wx, y: wy, draw() {} };
      if (T6.st === 'pond') t6PondDown(T6.pond, ...t6Pt(wx, wy), d);
      return d;
    },
    drop(d) { if (T6.pond && T6.pond.drag === d) { const l = d.leaf; if (l) { l.vx = d.vx || 0; l.vy = d.vy || 0; } T6.pond.drag = null; } },
    draw(g) {
      if (art) dp(g, art, p0, GROUND - 18);
      dp(g, t6Art().jetty, jx, GROUND - 22);
    },
    drawHud(g, vw) {
      const lx = jx + 29.5 - camX, ly = GROUND - 22 - 120 + offY, fl = t6Flicker(), R0 = 26 + 12 * fl, gl = g.createRadialGradient(lx, ly, 2, lx, ly, R0);   // the lamp's glow flickers over the night wash
      gl.addColorStop(0, `rgba(255,220,130,${.45 + .45 * fl})`); gl.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gl; g.fillRect(lx - R0, ly - R0, R0 * 2, R0 * 2);
      if (T6.st === 'side' || T6.st === 'walk' || !T6.pond) return;
      const k = t6E(T6.k), D = DPR, cw = cv.width, ch = cv.height;
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      const z = 1 + 2.2 * k, px = (jx - camX) * scale * D, py = (GROUND - 60 + offY) * scale * D;   // dive towards the jetty
      g.drawImage(cv, 0, 0, cw, ch, px - px * z, py - py * z, cw * z, ch * z);
      const a = Math.max(0, Math.min(1, (k - .35) / .65)), v = t6View(), ps = (1.3 - .3 * a) * v.k * D;
      g.globalAlpha = a; g.setTransform(ps, 0, 0, ps, cw / 2 - v.W / 2 * ps, ch / 2 - v.H / 2 * ps);
      t6PondDraw(g, T6.pond, v);
      g.restore();
    },
  };
  return e;
}

/* ---------- the pond from above: input, update, drawing ---------- */
function t6PondDown(P, x, y, d) {
  const v = t6View(), jf = P.frogs.find(f => f.jet && !f.caught);
  P.quiet = 0;
  if (jf && jf.st === 'crawl' && t6HitFrog(P, jf, x, y)) return t6Catch(P, jf);
  if (jf && jf.st !== 'hid') { let hit = false; for (const l of P.leaves) if (l.frogs.includes(jf) && t6HitFrog(P, jf, x, y)) hit = true; if (!hit) t6Dive(P, jf); }
  if (Math.hypot(x - 36, y - (v.top + 40)) < 30) { d.back = true; T6.st = 'out'; AU.click(); return; }   // ← back to the road
  for (let i = P.buds.length - 1; i >= 0; i--) {                       // the flowers lie on top: grab one first
    const b = P.buds[i], q = t6BudPos(P, b);
    if (Math.hypot(x - q.x, y - q.y) < 24 * b.s) { P.drag = d; d.bud = b; d.sx = x; d.sy = y; d.ox = b.dx; d.oy = b.dy; AU.rustle(.7); return; }
  }
  for (let i = P.leaves.length - 1; i >= 0; i--) {                     // from the top leaf down: a frog on it, then the leaf
    const l = P.leaves[i];
    for (const f of l.frogs) if (!f.caught && t6HitFrog(P, f, x, y)) return t6Catch(P, f);
    const p = t6LeafPose(P, l);
    if (Math.hypot(x - p.x, y - p.y) < l.r * .97) { t6GrabLeaf(P, l, x, y, d); return; }
  }
  for (const f of P.frogs) if (f.under && !f.caught && t6HitFrog(P, f, x, y)) return t6Catch(P, f);
  P.ripples.push({ x, y, t: 0 });
}
function t6GrabLeaf(P, l, x, y, d) { t6Splash(.9, .85); P.drag = d; d.leaf = l; d.sx = x; d.sy = y; d.ox = l.dx; d.oy = l.dy; d.lx = x; d.ly = y; d.vx = d.vy = 0; }
function t6BudPos(P, b) { const g = Math.exp(-Math.pow((b.x - P.gust.x) / 170, 2)); return { x: b.x + b.dx + Math.sin(S.t * .8 + b.ph) * 3 + g * 6, y: b.y + b.dy + Math.cos(S.t * .7 + b.ph) * 2, rot: Math.sin(S.t * .6 + b.ph) * .1 + g * .12 }; }
function t6HitFrog(P, f, x, y) {
  if (f.jet && f.st === 'crawl') return Math.hypot(x - f.cx, y - f.cy) < 30;
  if (f.jet && f.st !== 'sit') return false;
  const p = t6FrogPos(P, f); return Math.hypot(x - p.x, y - p.y) < 30 * f.s / .6;
}
// the seventh frog lives under the jetty (owner: it needs a trick): once six are caught it comes out only when the pond has
// been left alone for T6_QUIET s — it creeps from under the planks onto a leaf near the jetty and sits there, as green as the
// rest, croaking now and then (its cheeks puff pale). Any touch that misses it sends it straight back under the jetty.
const T6_QUIET = 6;
function t6JetLeaf(P) {
  const jx = P.W / 2, jy = P.H - 150, ok = l => !l.frogs.length && l.r >= 44 && Math.hypot(l.x - jx, l.y - jy) > 80 && Math.hypot(l.x - jx, l.y - jy) < 300 && l.y < P.H - 120;
  const c = P.leaves.filter(ok); return c.length ? c[(R() * c.length) | 0] : P.leaves[P.leaves.length - 1];
}
function t6Dive(P, f) {                                                  // back under the jetty with a little splash
  if (f.st === 'sit') { const q = t6FrogPos(P, f); f.leaf.frogs.splice(f.leaf.frogs.indexOf(f), 1); f.leaf.twitch = .4; P.ripples.push({ x: q.x, y: q.y, t: 0 }); }
  else if (f.st === 'crawl') { P.ripples.push({ x: f.cx, y: f.cy, t: 0 }); }
  f.st = 'hid'; f.t = 0;
}
function t6Land(P, f, l) { const an = R() * 6.283, d = l.r * (.15 + R() * .25); f.leaf = l; f.ox = Math.cos(an) * d; f.oy = Math.sin(an) * d; f.rot = R() * 6.283; l.frogs.push(f); }
function t6Catch(P, f) {
  const p = t6FrogPos(P, f);
  if (f.jet && f.st === 'sit') f.leaf.frogs.splice(f.leaf.frogs.indexOf(f), 1);
  f.caught = true; f.t = 0; f.from = [p.x, p.y, p.rot]; f.slot = T6.found++;
  if (!f.under && f.leaf) f.leaf.twitch = .5;
  P.ripples.push({ x: p.x, y: p.y, t: 0 });
  AU.pluck(76 + f.slot * 2);
  if (T6.found >= T6_FROGS) { T6.done = true; P.endT = 1.8; SAVE.t6 = { frogs: true }; persist(); }   // remembered: leaving and coming back starts at the bridge
}
function t6Wake(P, d, x, y, r) {
  if (d.wx == null) { d.wx = x; d.wy = y; d.acc = 0; d.snd = 0; return; }
  const m = Math.hypot(x - d.wx, y - d.wy); if (m < .5) return;
  const ux = (x - d.wx) / m, uy = (y - d.wy) / m; d.wx = x; d.wy = y; d.acc += m; d.snd += m;
  P.stir = Math.min(1, (P.stir || 0) + m * .02);
  if (d.acc > 16) {
    d.acc = 0; P.ripples.push({ x: x - ux * r * .9 + rr(-4, 4), y: y - uy * r * .9 + rr(-4, 4), t: 0, s: .8 });
    for (const l of P.leaves) if (l !== d.leaf) { const q = Math.hypot(l.x + l.dx - x, l.y + l.dy - y) - l.r - r; if (q < 60) l.bob = Math.min(1, (l.bob || 0) + .25 * (1 - Math.max(0, q) / 60)); }   // the leaves round about rock on the wake
  }
  if (d.snd > 70) { d.snd = 0; t6Splash(.7, .45); }
}
function t6PondUpdate(P, dt) {
  P.stir = Math.max(0, (P.stir || 0) - dt * .8);
  const d = P.drag;
  P.quiet = S.drag ? 0 : (P.quiet || 0) + dt;
  if (d && d.bud && S.drag === d) {                                     // a flower gives only a little way to the finger
    const [x, y] = t6Pt(d.x, d.y), b = d.bud; let nx = d.ox + x - d.sx, ny = d.oy + y - d.sy; const m = Math.hypot(nx, ny);
    if (m > T6_BUD_GIVE) { nx *= T6_BUD_GIVE / m; ny *= T6_BUD_GIVE / m; } b.dx = nx; b.dy = ny; b.vx = b.vy = 0;
    t6Wake(P, d, b.x + b.dx, b.y + b.dy, 14 * b.s);
  } else if (d && d.leaf && S.drag === d) {                                    // drag the leaf aside (only so far)
    const [x, y] = t6Pt(d.x, d.y), l = d.leaf;
    let nx = d.ox + x - d.sx, ny = d.oy + y - d.sy; const m = Math.hypot(nx, ny), lim = l.r * 1.5;
    if (m > lim) { nx *= lim / m; ny *= lim / m; }
    l.dx = nx; l.dy = ny; l.vx = l.vy = 0; d.vx = (x - d.lx) / Math.max(dt, .001) * .3; d.vy = (y - d.ly) / Math.max(dt, .001) * .3; d.lx = x; d.ly = y;
    t6Wake(P, d, l.x + l.dx, l.y + l.dy, l.r);
  } else if (d && S.drag !== d) P.drag = null;
  const pushL = P.drag && P.drag.leaf;
  for (const b of P.buds) {
    if (P.drag && P.drag.bud === b) continue;
    if (pushL) {                                                         // a leaf dragged into a flower nudges it aside
      const lp = t6LeafPose(P, pushL), bx = b.x + b.dx, by = b.y + b.dy, dd = Math.hypot(bx - lp.x, by - lp.y) || 1, over = pushL.r + 8 - dd;
      if (over > 0) { b.dx += (bx - lp.x) / dd * over; b.dy += (by - lp.y) / dd * over; const m = Math.hypot(b.dx, b.dy); if (m > T6_BUD_GIVE) { b.dx *= T6_BUD_GIVE / m; b.dy *= T6_BUD_GIVE / m; } b.vx = b.vy = 0; continue; }
    }
    b.vx += (-3 * b.dx - 3 * b.vx) * dt; b.vy += (-3 * b.dy - 3 * b.vy) * dt; b.dx += b.vx * dt; b.dy += b.vy * dt;   // and back home it drifts
  }
  for (const l of P.leaves) {
    if (P.drag && P.drag.leaf === l) continue;
    l.vx += (-1.4 * l.dx - 2.2 * l.vx) * dt; l.vy += (-1.4 * l.dy - 2.2 * l.vy) * dt;   // it drifts back home, slowly
    l.dx += l.vx * dt; l.dy += l.vy * dt;
    l.twitch = Math.max(0, l.twitch - dt); if (l.bob) l.bob = Math.max(0, l.bob - dt * .6);
  }
  if (P.gust.x < P.W + 400) P.gust.x += 300 * dt;                     // a gust sweeps across the pond every few seconds
  else if ((P.gust.t -= dt) < 0) { P.gust.x = -400; P.gust.t = 4 + R() * 5; }
  for (const f of P.frogs) {
    if (f.caught) { f.t += dt; continue; }
    f.breath += dt * 3.2;
    if ((f.blink -= dt) < 0) { f.bl = .18; f.blink = 2.5 + R() * 5; }
    f.bl = Math.max(0, f.bl - dt);
    if (f.jet) {
      f.sac = Math.max(0, f.sac - dt);
      if (f.st === 'hid' && T6.found >= T6_FROGS - 1 && P.quiet > T6_QUIET) {      // the pond has gone quiet: out it creeps
        const l = t6JetLeaf(P), an = R() * 6.283, d = l.r * (.15 + R() * .2);
        f.st = 'crawl'; f.t = 0; f.to = l; f.tox = Math.cos(an) * d; f.toy = Math.sin(an) * d; f.side = l.x < P.W / 2 ? -1 : 1;
      }
      if (f.st === 'crawl') {
        f.t += dt; const k = t6E(Math.min(1, f.t / 2.2)), lp = t6LeafPose(P, f.to), x0 = P.W / 2 + f.side * 40, y0 = P.H - 110;
        f.cx = x0 + (lp.x + f.tox - x0) * k; f.cy = y0 + (lp.y + f.toy - y0) * k; f.rot = Math.atan2(lp.y - y0, lp.x - x0) + Math.PI / 2;
        if (f.t >= 2.2) { f.st = 'sit'; f.leaf = f.to; f.ox = f.tox; f.oy = f.toy; f.rot -= f.to.rot; f.to.frogs.push(f); f.sacT = 1.5 + R(); }
      }
      if (f.st === 'sit' && (f.sacT -= dt) < 0) { f.sacT = 5 + R() * 3; f.sac = .9; AU.ribbit(); }
      continue;
    }
    if (f.under && (f.croak -= dt) < 0) { f.croak = 7 + R() * 7; f.leaf.twitch = .35; P.ripples.push({ x: f.x + rr(-20, 20), y: f.y + f.leaf.r * .9, t: 0 }); }   // a hidden frog stirs its leaf now and then
  }
  for (const r of P.ripples) r.t += dt; P.ripples = P.ripples.filter(r => r.t < 1.6);
  if ((P.croakT = (P.croakT ?? 3) - dt) < 0) { P.croakT = 4 + R() * 6; AU.croak(.5 + R() * .5); }   // frogs somewhere in the pond, far and near
  if (P.endT != null && (P.endT -= dt) < 0) { P.endT = null; T6.st = 'out'; }
}
function t6Rings(g, P) {                                               // every ring sits on the water, under the leaves and flowers (owner)
  for (const r of P.ripples) { const k = r.s || 1; g.strokeStyle = `rgba(225,238,225,${.65 * (1 - r.t / 1.6)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(r.x, r.y, (8 + r.t * 34) * k, (5 + r.t * 22) * k, 0, 0, 6.283); g.stroke(); }
}
function t6PondDraw(g, P, v) {
  const W = v.W, H = v.H, t = S.t, A = t6Art();
  g.fillStyle = '#132029'; g.fillRect(-2, -2, W + 4, H + 4);
  const mx = W * .72, my = v.top + H * .22;                             // the moon in the water, broken by ripples
  g.fillStyle = 'rgba(236,228,186,.32)'; g.beginPath(); g.ellipse(mx, my, 54, 50, 0, 0, 6.283); g.fill();
  g.strokeStyle = '#132029'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { const y = my + i * 14 + Math.sin(t + i) * 2; g.beginPath(); g.moveTo(mx - 60, y); g.quadraticCurveTo(mx, y + 4 * Math.sin(t * 1.3 + i), mx + 60, y); g.stroke(); }
  const st = P.stir || 0;                                               // the water lines: stirred when a leaf or flower is moved
  g.strokeStyle = `rgba(235,240,220,${.12 + .2 * st})`; g.lineWidth = 1.6;
  for (let i = 0; i < 26; i++) { const x = ((i * 137 + t * 8) % (W + 80)) - 40 + Math.sin(t * 6 + i) * 5 * st, y = v.top + ((i * 271) % (H - v.top)), l = 20 + (i % 4) * 8, w = 3 + 4 * st * Math.sin(t * 9 + i * 1.7); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - w, x + l, y); g.stroke(); }
  t6Rings(g, P);
  for (const f of P.frogs) if (f.under && !f.caught) t6DrawFrog(g, f, f.x, f.y, f.rot, .92);   // sitting in the water, under a leaf
  for (const l of P.leaves) {
    const p = t6LeafPose(P, l), s = l.r / 100;
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(s, s * p.sy); g.drawImage(A.leaf[l.v].c, -108, -108, 216, 216); g.restore();
    for (const f of l.frogs) if (!f.caught) { const q = t6FrogPos(P, f); t6DrawFrog(g, f, q.x, q.y, q.rot, 1); }
  }
  for (const b of P.buds) { const q = t6BudPos(P, b), k = 1; dp(g, A.bud, q.x, q.y, q.rot, b.s * .6 * k, b.s * .6 * k); }   // on top of every leaf
  for (const f of P.frogs) if (f.jet && f.st === 'crawl') t6DrawFrog(g, f, f.cx, f.cy, f.rot, Math.min(1, f.t / .6));   // creeping out from under the jetty
  // the jetty comes in from the bottom, where the party stands
  g.fillStyle = '#b57a22'; g.strokeStyle = INK; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(W / 2 - 52, H + 4); g.lineTo(W / 2 - 46, H - 138); g.lineTo(W / 2 + 46, H - 138); g.lineTo(W / 2 + 52, H + 4); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 1.2; for (let y = H - 120; y < H; y += 18) { g.beginPath(); g.moveTo(W / 2 - 50, y); g.lineTo(W / 2 + 50, y); g.stroke(); }
  { const fl = t6Flicker(), gl = g.createRadialGradient(W / 2, H - 120, 4, W / 2, H - 120, 55 + 15 * fl); gl.addColorStop(0, `rgba(255,214,120,${.2 + .2 * fl})`); gl.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gl; g.fillRect(W / 2 - 110, H - 230, 220, 220); }   // the lamp's light on the deck
  // moonlight and a dark edge, then the paper's grain over all of it
  { const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .28; g.drawImage(PAPER, 0, 0, W, H); g.restore();
  for (const f of P.flies) {
    const x = f.x + Math.sin(t * f.sp + f.ph) * 50, y = f.y + Math.cos(t * f.sp * 1.3 + f.ph) * 30, a = Math.max(0, Math.sin(t * 2 + f.ph));
    if (a < .05) continue; g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 0, x, y, 10); gr.addColorStop(0, 'rgba(230,255,150,.9)'); gr.addColorStop(1, 'rgba(230,255,150,0)'); g.fillStyle = gr; g.fillRect(x - 10, y - 10, 20, 20);
  }
  g.globalAlpha = 1;
  // the top bar: ← back, and seven slots that fill with the frogs caught (pictures only)
  const by = v.top + 40;
  g.fillStyle = '#efe6cf'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(36, by, 22, 0, 6.283); g.fill(); g.stroke();
  g.lineWidth = 3.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(46, by); g.lineTo(26, by); g.moveTo(34, by - 8); g.lineTo(26, by); g.lineTo(34, by + 8); g.stroke();
  const [sx0] = t6Slot(P, 0), sw = 46 * T6_FROGS + 10;
  g.fillStyle = 'rgba(239,230,207,.92)'; g.lineWidth = 2.4; g.beginPath(); g.roundRect(sx0 - 33, by - 26, sw, 52, 14); g.fill(); g.stroke();
  for (let i = 0; i < T6_FROGS; i++) { const [x, y] = t6Slot(P, i); g.globalAlpha = .18; dp(g, A.frog, x, y, 0, .5, .5); g.globalAlpha = 1; }
  for (const f of P.frogs) if (f.caught) {                               // the catch hops up into its slot
    const [x1, y1] = t6Slot(P, f.slot), k = Math.min(1, f.t / .7), e = t6E(k), [x0, y0, r0] = f.from;
    const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(k * Math.PI) * 120, s = (f.s + (.5 - f.s) * e) * (1 + Math.sin(k * Math.PI) * .6);
    t6DrawFrog(g, f, x, y, r0 * (1 - k), 1, s);
  }
}
function t6DrawFrog(g, f, x, y, rot, a, sc) {
  const s = sc ?? f.s * (1 + Math.sin(f.breath) * .025);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha *= a;
  const hid = !f.caught;
  dp(g, hid ? t6Art().frogHid : t6Art().frog, 0, 0);
  if (hid && f.sac > 0) {                                               // croaking: both cheeks puff out pale
    const k = Math.sin((1 - f.sac / .9) * Math.PI * 3) * .5 + .5;
    g.fillStyle = 'rgba(230,236,200,.85)'; g.strokeStyle = INK; g.lineWidth = 1.4;
    for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * 19, -16, 4 + 6 * k, 3 + 4 * k, 0, 0, 6.283); g.fill(); g.stroke(); }
  }
  if (hid) { if (f.bl <= 0) for (const d of [-11, 11]) { g.fillStyle = 'rgba(29,25,21,.55)'; g.beginPath(); g.arc(d, -26, 2.2, 0, 6.283); g.fill(); } g.restore(); return; }   // dull eyes, no glint
  for (const d of [-11, 11]) {                                          // the eyes: a glint gives it away; a blink hides it
    if (f.bl > 0 && !f.caught) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(d - 4, -25); g.lineTo(d + 4, -25); g.stroke(); continue; }
    g.fillStyle = INK; g.beginPath(); g.arc(d, -26, 3, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(250,240,190,.85)'; g.beginPath(); g.arc(d - 1, -27.5, 1.1, 0, 6.283); g.fill();
  }
  g.restore();
}

/* ---------- coming back: the frogs, once all caught, stay caught until the tranh is done; the party starts by the bridge ---------- */
function t6Resume(x) {
  return { layer: 'hud', did: false,
    update() {
      if (this.did) return; this.did = true;
      if (!(SAVE.t6 && SAVE.t6.frogs)) return;
      T6.done = true; T6.found = T6_FROGS; if (!has('ech')) S.inv.push('ech');
      if (SAVE.t6.bridge) { T6C.done = true; x = 3000; }                       // across the bridge already: start on the far bank, at dawn
      S.cp = x; placeParty(x); camX = Math.max(0, x - 320); updateHud();
    },
  };
}

/* ---------- the gate at the end: the keeper wants the frogs, and opens only at daybreak ---------- */
function t6Gate(x) {
  return {
    layer: 'bg', gateX: x, ax: x, opened: false, ask: 0,
    get spent() { return this.opened; },
    wall() { return this.opened ? null : x - 120; },
    get offer() { return T6C.done ? { wants: ['ech'], label: 'Dâng giỏ ếch', near: () => groom.x > x - 220, missing: '' } : null; },   // only once day has come
    give() { this.opened = true; delete SAVE.t6; persist(); AU.pluck(81); setTimeout(() => AU.pluck(88), 140); toast('Trời sáng, bác giữ cổng làng nhận giỏ ếch, mở cổng cho đoàn qua!', 3.2); },
    update(dt) {
      if (this.opened) return;
      const at = groom.x > x - 220;
      if (at && has('ech') && T6C.done) { takeItems(['ech']); this.give(); return; }   // the basket, and day come (the bridge crossed)
      if (at && !this.ask) AU.pluck(62);
      this.ask = at ? Math.min(1, this.ask + dt * 6) : Math.max(0, this.ask - dt * 4);
    },
    draw(g) { dp(g, PROPS.gate, x, GROUND + 4); },
    drawFg(g) { if (this.ask > .02) { g.globalAlpha = this.ask; drawBubble(g, x - 108, GROUND - 210 + Math.sin(S.t * 3) * 3, has('ech') ? ['troi'] : ['ech']); g.globalAlpha = 1; } },   // the basket first, then: wait for the sun
  };
}

/* ---------- tranh 6 ---------- */
LEVELS[5] = {
  han: '捕蛙', name: 'Bắc Kim Thang', paper: 'blue', width: 3700, key: -2, abil: [], cps: [160, 1300, 2350], song: 11, noSecret: true,   // a still night (owner): no drum, no trumpet, no water sounds; a far flute, crickets and frogs croaking
  zoom: 1.35,
  intro: '', endTitle: 'Bắt ếch đêm trăng', endText: 'Bắc kim thang cà lang bí rợ… Giỏ ếch đầy, đoàn chuột vừa đi vừa hát dưới trăng.',
  build: () => {
    T6.st = 'side'; T6.k = 0; T6.found = 0; T6.pond = null; T6.done = false; Object.assign(T6C, { st: 'off', k: 0, done: false, cp: 0 });
    return [
      t6Resume(2350),
      t6Night(1250, 3300),
      decor(PROPS.bamboo, 300, GROUND + 4, .8), decor(PROPS.bamboo, 620, GROUND + 4, .95, -1),
      t6Pond(1250, 3300, 1800),
      decor(PROPS.bamboo, 2330, GROUND + 4, .85, -1),
      t6Cau(2620),
      t6Gate(3450),
    ];
  },
};
