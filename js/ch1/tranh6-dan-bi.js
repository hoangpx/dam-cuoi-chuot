/* Tranh 6 · Bắc Kim Thang, the first stretch: Dàn Bí Rợ (owner's idea): pitch dark. The party walks through the night for about three minutes (T6_OFF px) before the rescue of the two birds
   under a trellis of giant gourds, pumpkins, aubergines and tomatoes ("cà lang bí rợ", from the song) that hides the moon, hung in THREE layers: a far one (dim), a middle one (lit by
   the lamp and by the torch) and a near one that is never lit: it stays pitch black and only shows as black shapes against what is lit behind it.
   The mouse who carried the parasol carries an oil lamp: a wide, soft, flickering round, and the party casts long black shadows backwards from it. A finger (or the mouse) held on the picture
   is a torch. Now and then the shadow of a huge cat, as big as the screen (only its four legs and belly), streaks past in front of the lights.
   Everything is drawn as usual and then a black sheet is laid over the view with holes punched out for the lights (an offscreen canvas, destination-out); the near layer and the cat are drawn
   over the sheet, as pure black. Where the trellis ends the dark thins to the moonlight and the old road of the tranch (the stations, the pond, the bridge, the gate) begins, T6_OFF further on.
   ITEM.lantern is the lamp, drawn in drawMouse (game.js) when a follower's item is 'lantern'. */
PL.nero = ['#050406', [0, 0]];                                                      // the near layer's black
const T7 = { px: 0, py: 0, in: false, down: false, a: 0, cat: null, catT: 7, cricT: 1, dk: null, dkx: null, sh: null, shx: null };
ITEM.lantern = part([-20, -12, 20, 56], a => {                                    // an oil lamp hung from the hand: a ring, a dark cap, a paper body glowing from inside
  a.key(lines([[0, -10, 0, 2]]), 2.4);
  a.fk('dark', smooth([[-9, 2], [9, 2], [11, 8], [-11, 8]]), 2);
  a.fk('yellow', smooth([[-12, 8], [12, 8], [16, 24], [10, 38], [-10, 38], [-16, 24]]), 2.2);
  a.fill('orange', smooth([[-7, 14], [7, 14], [9, 26], [0, 34], [-9, 26]]));
  a.fill('white', ell(0, 24, 3.4, 6, 0));                                       // the flame
  a.key(lines([[-12, 8, -10, 38], [12, 8, 10, 38], [-15, 24, 15, 24]]), 1.3);
  a.fk('dark', smooth([[-10, 38], [10, 38], [8, 44], [-8, 44]]), 2);
});
// the gourds, hung by their stems (origin = the point they hang from); made twice: in colour, and all black (for the near layer, which is never lit)
let T7_ART = null;
function t7Art() {
  if (T7_ART) return T7_ART;
  const make = pl => {
    const stem = a => { a.fk(pl('green'), smooth([[-3, 0], [3, 0], [4, 9], [-4, 9]]), 1.8); };
    const pump = part([-46, -4, 46, 70], a => {                                       // bí rợ: a ribbed pumpkin
      stem(a); a.fk(pl('orange'), ell(0, 38, 40, 30, 0), 2.4); a.fill(pl('red'), ell(0, 44, 26, 22, 0));
      a.key(lines([[0, 10, 0, 66], [-18, 12, -24, 60], [18, 12, 24, 60], [-32, 20, -38, 52], [32, 20, 38, 52]]), 1.4); a.fk(pl('green'), smooth([[-8, 8], [0, 0], [8, 8], [0, 12]]), 1.4);
    });
    const egg = part([-24, -4, 24, 96], a => {                                         // cà: an aubergine, long and glossy
      a.fk(pl('lilac'), smooth([[-12, 14], [12, 14], [22, 48], [18, 82], [0, 94], [-18, 82], [-22, 48]]), 2.4); a.fill(pl('grey'), smooth([[-6, 24], [4, 24], [10, 52], [4, 80], [-6, 60]]));
      a.fk(pl('green'), smooth([[-14, 14], [-6, 4], [0, 14], [6, 4], [14, 14], [0, 20]]), 1.8); stem(a);
    });
    const bau = part([-34, -4, 34, 100], a => {                                         // bầu: a bottle gourd, a small lobe over a big one
      stem(a); a.fk(pl('teal'), circ(0, 26, 16), 2.2); a.fk(pl('teal'), circ(0, 64, 30), 2.4); a.fill(pl('cream'), ell(-10, 66, 9, 16, .25));
      a.key(lines([[-8, 36, -10, 40], [8, 36, 10, 40]]), 1.6);
    });
    const ca = part([-30, -4, 30, 54], a => {                                           // cà lang: a round red tomato
      stem(a); a.fk(pl('red'), circ(0, 30, 24), 2.4); a.fill(pl('pink'), ell(-8, 24, 8, 6, -.4)); a.fk(pl('green'), smooth([[-14, 8], [-6, 12], [0, 6], [6, 12], [14, 8], [6, 18], [-6, 18]]), 1.6);
    });
    const leaf = part([-30, -16, 30, 16], a => { a.fk(pl('green'), smooth([[-28, 0], [-10, -14], [14, -12], [28, 0], [10, 12], [-12, 12]]), 2); a.key(lines([[-24, 0, 22, 0]]), 1.2); });
    return { gourds: [pump, egg, bau, ca], leaf };
  };
  const o = make(c => c);
  const sil = p => { const c = document.createElement('canvas'); c.width = p.c.width; c.height = p.c.height; const g = c.getContext('2d'); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2]]) g.drawImage(p.c, dx, dy); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); return Object.assign({}, p, { c }); };
  o.sil = { gourds: o.gourds.map(sil), leaf: sil(o.leaf) };
  return (T7_ART = o);
}
const t7wind = x => (Math.sin(S.t * .7 - x * .0032) * .6 + Math.sin(S.t * 1.9 - x * .0065) * .25) * (.75 + .25 * Math.sin(S.t * .23));      // the wind: waves running along the trellis, with slow gusts (about -1 … 1)
const t7h = (n, s) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };      // a steady pseudo-random number for cell n, stream s
const T7_TOP = () => GROUND - 440;                                              // the trellis
// the three layers of gourds: far (dim, small, high), middle (lit), near (black, big, low). cell width, density, scale range, hang length, a stream seed
const T7_LAYERS = [
  { cell: 70, dens: .62, s0: .62, s1: .5, len0: 6, len1: 34, seed: 40, top: -34, alpha: .3 },
  { cell: 80, dens: .72, s0: 1.05, s1: .95, len0: 18, len1: 58, seed: 0, top: 48, alpha: 1 },
  { cell: 130, dens: .5, s0: 1.1, s1: .7, len0: 24, len1: 56, seed: 80, top: 14, alpha: 1 },
];
function t7Layer(g, L, A, x0, x1, top) {                                         // one layer of gourds with their vines, between x0 and x1
  for (let i = Math.floor(x0 / L.cell); i <= Math.floor(x1 / L.cell); i++) {
    if (t7h(i, L.seed + 1) > L.dens) continue;
    const n = t7h(i, L.seed + 5) < .55 ? 1 : 2;
    for (let j = 0; j < n; j++) {
      const gx = i * L.cell + t7h(i, L.seed + 6 + j) * L.cell, kind = Math.floor(t7h(i, L.seed + 8 + j) * 4), sc = L.s0 + t7h(i, L.seed + 10 + j) * L.s1, len = L.len0 + t7h(i, L.seed + 12 + j) * (L.len1 - L.len0), sw = t7wind(gx) * .14 + Math.sin(S.t * .9 + i * 1.7 + j) * .02;
      g.strokeStyle = A === null ? '#000' : '#150f0a'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(gx, top + L.top); g.quadraticCurveTo(gx + 8, top + L.top + len * .5, gx, top + L.top + len); g.stroke();      // the vine
      g.save(); g.translate(gx, top + L.top + len); g.rotate(sw); dp(g, (A || T7_ART.sil).gourds[kind], 0, 0, 0, sc, sc); g.restore();
    }
  }
}

// creepers hung from the trellis, thick with leaves, swaying: per layer (far / middle / near). black = true draws them as solid black shapes (the near layer)
const T7_FOL = [
  { cell: 44, dens: .85, top: -34, len0: 30, len1: 120, ls: .7, amp: .05, seed: 200 },
  { cell: 52, dens: .9, top: 46, len0: 40, len1: 175, ls: 1.0, amp: .07, seed: 230 },
  { cell: 105, dens: .55, top: 14, len0: 40, len1: 120, ls: .95, amp: .06, seed: 260 },
];
function t7Fol(g, F, A, x0, x1, top, black) {
  for (let i = Math.floor(x0 / F.cell); i <= Math.floor(x1 / F.cell); i++) {
    for (let j = 0; j < 2; j++) {
      if (t7h(i, F.seed + j * 7) > F.dens) continue;
      const vx = i * F.cell + t7h(i, F.seed + 1 + j * 7) * F.cell, len = F.len0 + t7h(i, F.seed + 2 + j * 7) * (F.len1 - F.len0), ph = t7h(i, F.seed + 3 + j * 7) * 6.283, wob = 6 + t7h(i, F.seed + 4 + j * 7) * 14;
      const ang = t7wind(vx) * F.amp * 2.6 + Math.sin(S.t * (.7 + t7h(i, F.seed + 5 + j * 7) * .5) + ph) * F.amp * .4;                       // the whole creeper sways from where it is tied
      g.save(); g.translate(vx, top + F.top); g.rotate(ang);
      g.strokeStyle = black ? '#000' : '#1c2a17'; g.lineWidth = black ? 4.4 : 3; g.beginPath(); g.moveTo(0, 0);
      const N = 10; for (let k = 1; k <= N; k++) { const u = k / N; g.lineTo(Math.sin(u * 3.2 + ph) * wob * u + t7wind(vx) * len * .1 * u * u, len * u); } g.stroke();
      const nl = Math.max(3, Math.round(len / 20 / (F.ls > 1.1 ? 1.4 : 1)));
      for (let k = 1; k <= nl; k++) {                                                                      // leaves along the creeper, each swaying a little by itself
        const u = k / (nl + 1), lx = Math.sin(u * 3.2 + ph) * wob * u + t7wind(vx) * len * .1 * u * u, ly = len * u, side = k % 2 ? 1 : -1, r = side * (.9 + Math.sin(S.t * 1.3 + k + ph) * .12) + t7wind(vx + k * 9) * .4;
        g.save(); g.translate(lx, ly); g.rotate(r); dp(g, (black ? A.sil : A).leaf, side * 18 * F.ls, 0, 0, F.ls * (.8 + t7h(i, F.seed + 9 + k) * .5), F.ls * (.8 + t7h(i, F.seed + 9 + k) * .5)); g.restore();
      }
      g.restore();
    }
  }
}
// the shadow of a huge cat: only its belly and its four long legs, black, as big as the screen, running past in front of the lights
// the cat as it pounces (owner): a whole leaping cat in black, seen side on, legs reaching forward
function t7LeapDraw(g, x, y, s, dir, open) {
  g.save(); g.translate(x, y); g.scale(dir * s, s); g.fillStyle = 'rgba(0,0,0,.97)'; g.strokeStyle = 'rgba(0,0,0,.97)'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.ellipse(0, 0, 130, 56, -.12, 0, 6.283); g.fill();                                                        // the body
  g.beginPath(); g.arc(128, -40, 48, 0, 6.283); g.fill();                                                                     // the head
  g.beginPath(); g.moveTo(98, -70); g.lineTo(104, -128); g.lineTo(132, -84); g.moveTo(140, -86); g.lineTo(170, -124); g.lineTo(168, -66); g.fill();   // the ears
  g.lineWidth = 30; for (const [ax, ay, bx, by] of [[80, 20, 150 + 40 * open, 110 - 30 * open], [60, 26, 120 + 50 * open, 128 - 20 * open], [-80, 24, -170, 96], [-60, 30, -130, 120]]) { g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) - 10, bx, by); g.stroke(); }
  g.lineWidth = 26; g.beginPath(); g.moveTo(-120, -14); g.quadraticCurveTo(-210, -40, -230, -130); g.stroke();             // the tail
  g.fillStyle = 'rgba(255,214,90,.9)'; g.beginPath(); g.ellipse(150, -48, 9, 6, 0, 0, 6.283); g.fill();                     // one glowing eye
  g.restore();
}
function t7CatDraw(g, vw, q, dir) {
  const H = viewH, x = dir > 0 ? -vw * .55 + (vw * 2.1) * q : vw * 1.55 - (vw * 2.1) * q, ph = q * 22, sw = i => Math.sin(ph + i * 1.7) * 38;
  g.save(); g.translate(x, 0); g.scale(dir, 1); g.fillStyle = 'rgba(0,0,0,.97)'; g.strokeStyle = 'rgba(0,0,0,.97)'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.ellipse(0, -H * .05, vw * .62, H * .26 + Math.sin(ph) * 6, 0, 0, 6.283); g.fill();                    // the belly, over the top of the screen
  g.lineWidth = 46; g.beginPath(); g.moveTo(-vw * .62, -H * .05); g.quadraticCurveTo(-vw * .8, H * .1 + Math.sin(ph) * 20, -vw * .74, H * .3); g.stroke();                // the tail
  for (const [lx, i] of [[-vw * .42, 0], [-vw * .2, 1], [vw * .26, 2], [vw * .5, 3]]) {                                       // four legs: down from the belly, knee forward, paw on the ground
    const s = sw(i), kx = lx + 26 + s * .5, ky = H * .42, px = lx + s, py = H * 1.02;
    g.lineWidth = 56; g.beginPath(); g.moveTo(lx, H * .1); g.quadraticCurveTo(kx, ky, px, py - 30); g.stroke();
    g.lineWidth = 34; g.beginPath(); g.moveTo(px, py - 70); g.lineTo(px + 6, py - 10); g.stroke();
    g.beginPath(); g.ellipse(px + 14, py - 6, 46, 20, 0, 0, 6.283); g.fill();                                                  // the paw
  }
  g.restore();
}

(function () {                                                                   // where the finger or the mouse is (in the units of the HUD)
  const upd = e => { if (!(S.lv === 5 && S.mode === 'play')) cv.style.cursor = ''; const r = cv.getBoundingClientRect(); T7.px = (e.clientX - r.left) / scale; T7.py = (e.clientY - r.top) / scale; T7.in = true; };
  cv.addEventListener('pointermove', upd); cv.addEventListener('pointerdown', e => { upd(e); T7.down = true; });
  addEventListener('pointerup', () => { T7.down = false; }); addEventListener('pointercancel', () => { T7.down = false; });
  cv.addEventListener('pointerleave', () => { T7.in = false; });
})();

// the cat pounces every T7_ZONE px of the dark; without the bell on the tranh-1 cat (SAVE.catBell) the party is always caught and sent back to the start;
// with it the bell jingles as the cat comes: the party must stop at once (it has T7_WARN s: still moving when the shadow comes = caught) and wait 1–3 s until the shadow has passed, then walks on
const T7_Z0 = 700, T7_GAP0 = 450, T7_GAP1 = 750, T7_REACT = .7, T7_MIN = 3, T7_MAX = 6, T7_CAT = .95;       // 5 pounces; from the first jingle the party has T7_REACT s to stop, and the cat's shadow passing is the ALL-CLEAR (owner): it passes a random T7_MIN–T7_MAX s after the bell starts; the party must stop within T7_REACT s of the bell and stay still till the shadow has passed
const t7Zones = () => { const a = []; for (let x = T7_Z0, k = 0; k < 5; k++, x += T7_GAP0 + Math.random() * (T7_GAP1 - T7_GAP0)) a.push(x); return a; };       // 5 pounces, 3–5 s of walking apart (450–750 px)
// the recorded bell rings without a pause (owner): a new jingle every .45 s over the last one, louder and a little higher as the cat comes
function t7Ring(e, dt) {
  if (!AU.hasSample('bell')) bellLoad();                                       // (the audio device may open only after the first touch: try again until it decodes)
  if ((e.jt -= dt) > 0) return; const n = e.n = (e.n || 0) + 1; e.jt = .45; const v = Math.min(1.2, .45 + n * .1), r = 1 + ((n % 4) - 1.5) * .025 + Math.min(.12, n * .01);
  if (AU.hasSample('bell')) AU.play('bell', v, r); else AU.pluck(96 + (n % 4) * 3);
}
function t6Dark() {
  T7.cat = null; T7.catT = 6; T7.a = 0; T7.ev = null; T7.pounceT = undefined; T7.pounce = null; S.hideParty = false; T7.zi = 0; T7.black = 0; T7.zs = t7Zones();
  const lamp = () => { const f = followers[0]; return [f.x + f.face * 44, GROUND - 78]; };                // the lamp in the hand of the third mouse
  return {
    layer: 'bg', flick: 0, dawn: 0, btn: null,
    update(dt) {
      this.flick += dt; if (T6R.ready && this.sayT != null) this.sayT += dt; if (!T7.bl) { T7.bl = 1; bellLoad(); } if (!AU.hasSample('meovo')) AU.sampleB64('meovo', MEOW_B64);
      this.dawn = Math.max(0, Math.min(1, (groom.x - (T6_OFF - 1700)) / 1500));                  // the dark thins as the trellis ends, and the moon comes out
      followers[0].item = 'lantern';
      if (groom.x > T6_OFF && !(SAVE.t6 && SAVE.t6.dark)) { SAVE.t6 = Object.assign(SAVE.t6 || {}, { dark: true }); persist(); }       // the dark stretch is walked once
      const want = (isTouch ? T7.down : T7.in) && this.dawn < .98 ? 1 : 0; T7.a += (want - T7.a) * Math.min(1, dt * (want ? 9 : 2.4));    // the torch of the finger: on while it is down, fading when lifted
      cv.style.cursor = !isTouch && T7.in && this.dawn < .98 ? 'none' : '';                      // the mouse pointer is a lamp while it is dark; once the moon is out it is the plain pointer again
      if (false && (T7.cricT -= dt) < 0) { T7.cricT = 1.4 + Math.random() * 3.2; AU.cricket(.35 + Math.random() * .4); }       // (owner: crickets off for now, to hear the bell)
      T7.black = Math.max(0, T7.black - dt * 1.4);
      if (T7.loop) t7Ring(T7.loop, dt);                                           // (demo) the bell button: rings without stopping until pressed again
      if (T7.pounce) {                                                               // the pounce (owner): the shadow drops onto the party, leaps away with it, black, back at the start
        const P = T7.pounce; P.t += dt; S.waitMove = true;
        if (!P.hit && P.t > .42) { P.hit = true; S.hideParty = true; if (AU.hasSample('meovo')) AU.play('meovo', 1); else AU.meow(); }
        if (!P.back && P.t > 1.55) { P.back = true; const d = 340 - groom.x; placeParty(340); camX += d; T7.zi = 0; S.hideParty = false; toast('Mèo vồ rồi! Làm lại nào.', 3); }
        if (P.t > 2.1) { T7.pounce = null; S.waitMove = false; }
        return;
      }
      if (S.mode === 'play' && this.dawn < .8 && !SAVE.catBell) {                  // no bell on the cat (owner): two separate things — the cat's shadow now and then, harmless, and a pounce at random moments, with no warning
        if (!T7.cat && (T7.catT -= dt) < 0) { T7.catT = 8 + Math.random() * 13; T7.cat = { t: 0, dir: Math.random() < .5 ? -1 : 1 }; AU.rustle && AU.rustle(.7); }
        if (T7.cat) { T7.cat.t += dt; if (T7.cat.t > T7_CAT) T7.cat = null; }
        if ((T7.pounceT = (T7.pounceT ?? 6 + Math.random() * 6) - dt) < 0) { T7.pounceT = 7 + Math.random() * 8; this.caught(); }
      }
      if (S.mode === 'play' && this.dawn < .8) {
        if (!T7.ev) {
          while (T7.zi < T7.zs.length && T7.zs[T7.zi] < groom.x - 300) T7.zi++;                // zones already behind the party are not run again
          if (SAVE.catBell && T7.zi < T7.zs.length && groom.x > T7.zs[T7.zi]) { const total = T7_MIN + Math.random() * (T7_MAX - T7_MIN);
          T7.ev = { t: 0, el: 0, warn: Math.max(.05, total - T7_CAT), ph: SAVE.catBell ? 'warn' : 'sneak', dir: Math.random() < .5 ? -1 : 1, jt: 0 }; T7.zi++; }
        } else {
          const e = T7.ev; e.t += dt; e.el += dt;
          if (e.ph === 'warn') {                                                              // the bell: a jingle that rings quicker and quicker
            t7Ring(e, dt);
            if (e.el > T7_REACT && groom.moving) this.caught();            // the bell was heard: stand still
            else if (e.t > e.warn) { e.ph = 'cat'; e.t = 0; T7.cat = { t: 0, dir: e.dir }; AU.rustle && AU.rustle(.7); }
          } else if (e.ph === 'sneak') {                                                      // no bell: no warning at all
            if (e.t > 1.1) { e.ph = 'cat'; e.t = 0; T7.cat = { t: 0, dir: e.dir }; AU.rustle && AU.rustle(.7); }
          } else {
            if (e.ph === 'cat' && SAVE.catBell) t7Ring(e, dt);                                  // the bell keeps jingling while the shadow passes
            if (T7.cat) { T7.cat.t += dt; if (T7.cat.t > T7_CAT) T7.cat = null; }
            const moved = groom.moving;
            if (!SAVE.catBell ? e.t > T7_CAT * .55 : (moved && e.el > T7_REACT)) this.caught();       // no bell: always caught; bell: caught only if it moves
            else if (e.ph === 'cat' && e.t > T7_CAT) { e.ph = 'after'; e.t = 0; e.wait = .05; }
            else if (e.ph === 'after' && e.t > e.wait) T7.ev = null;                         // 1–3 s after the shadow has passed the party may go on
          }
        }
      }
    },
    caught() {                                                                   // the cat has the party: a black moment, the growl, and back to the start of the dark road
      if (T7.pounce) return; T7.ev = null; T7.cat = null; T7.pounce = { t: 0, dir: Math.random() < .5 ? -1 : 1, hit: false, back: false }; S.catches = (S.catches || 0) + 1; return;
      T7.black = 1; if (AU.hasSample('meovo')) AU.play('meovo', 1); else AU.meow(); toast('Mèo vồ rồi! Làm lại nào.', 3);   // the owner's recorded meow
      const d = 340 - groom.x; placeParty(340); camX += d; T7.zi = 0;
    },
    draw(g) {                                                                    // the posts that hold the trellis up (behind the party)
      const vw = cv.width / DPR / scale, x0 = Math.floor((camX - 100) / 700) * 700;
      for (let x = x0; x < camX + vw + 100; x += 700) {
        const px = x + 240 + t7h(x / 700, 11) * 200; if (px > T6_OFF - 150) continue; g.lineCap = 'round';
        g.strokeStyle = '#150f0a'; g.lineWidth = 11; g.beginPath(); g.moveTo(px, GROUND + 6); g.lineTo(px, T7_TOP() - 10); g.stroke();
        g.strokeStyle = '#7d6a32'; g.lineWidth = 6.5; g.stroke();
        g.strokeStyle = '#150f0a'; g.lineWidth = 2; for (let y = GROUND - 40; y > T7_TOP(); y -= 70) { g.beginPath(); g.moveTo(px - 5.5, y); g.lineTo(px + 5.5, y); g.stroke(); }
      }
    },
    drawMid(g) {                                                                 // the long black shadows the party casts backwards from the lamp (behind the mice, over the road)
      if (this.dawn >= .99 || S.hideParty) return;
      const [lx] = lamp(), L = [{ m: MICE.groom, x: groom.x, face: groom.face, ph: groom.ph, mv: groom.moving, it: null }, ...followers.map(f => ({ m: f.m, x: f.x, face: f.face, ph: f.ph, mv: f.moving, it: f.item }))];
      if (!T7.sh) { T7.sh = document.createElement('canvas'); T7.sh.width = 260; T7.sh.height = 340; T7.shx = T7.sh.getContext('2d'); }
      const o = T7.shx;
      L.forEach((q, i) => {
        o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, 260, 340);
        o.setTransform(1, 0, 0, 1, 130, 310 - GROUND); drawMouse(o, q.m, 0, q.face, q.ph, q.mv, q.it, i * 1.7 + 1);
        o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-in'; o.fillStyle = '#000'; o.fillRect(0, 0, 260, 340);
        const r = q.x - lx, sg = r >= 0 ? 1 : -1, lean = sg * (.9 + Math.min(.9, Math.abs(r) / 260));
        g.save(); g.globalAlpha = .8 * (1 - this.dawn); g.translate(q.x + sg * 6, GROUND + 3); g.transform(1, 0, -lean, -.2, 0, 0); g.drawImage(T7.sh, -130, -310); g.restore();       // lying on the ground (owner): the silhouette is turned over and flattened below the feet, stretched away from the lamp
      });
    },
    drawFg(g) {                                                                  // the trellis and the far and middle layers of gourds, over the party's heads
      const A = t7Art(), vw = cv.width / DPR / scale, x0 = camX - 150, x1 = Math.min(camX + vw + 150, T6_OFF - 100), top = T7_TOP();
      if (x1 <= x0) return;
      g.lineCap = 'round';
      g.save(); g.globalAlpha = T7_LAYERS[0].alpha; t7Layer(g, T7_LAYERS[0], A, x0, x1, top); t7Fol(g, T7_FOL[0], A, x0, x1, top, false); g.restore();                  // the far layer, dim, behind the trellis
      for (const [dy, w] of [[0, 9], [46, 7]]) { g.strokeStyle = '#150f0a'; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, top + dy); g.lineTo(x1, top + dy); g.stroke(); g.strokeStyle = '#8a7a3a'; g.lineWidth = w - 1; g.stroke(); }
      g.strokeStyle = '#150f0a'; g.lineWidth = 4; for (let x = Math.floor(x0 / 74) * 74; x < x1; x += 74) { g.beginPath(); g.moveTo(x, top - 4); g.lineTo(x + 14, top + 50); g.stroke(); }
      for (let i = Math.floor(x0 / 80); i <= Math.floor(x1 / 80); i++) { if (t7h(i, 1) < .28) continue; const lx = i * 80 + t7h(i, 2) * 80; dp(g, A.leaf, lx, top + 6, t7h(i, 3) * 1.2 - .6, .9 + t7h(i, 4) * .7, .9 + t7h(i, 4) * .7); }   // leaves along it
      t7Layer(g, T7_LAYERS[1], A, x0, x1, top); t7Fol(g, T7_FOL[1], A, x0, x1, top, false);                                                                               // the middle layer: this is the one the lights show
    },
    onClick(wx, wy) {                                                            // (demo only) skip the dark stretch
      const sx = wx - camX, sy = wy + offY;
      const b = this.btn; if (!b) return false;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) { const d = (T6_OFF - 300) - groom.x; if (d > 0) { groom.x += d; followers.forEach(f => f.x += d); camX += d; } return true; }
      return false;
    },
    drawHud(g, vw) {                                                             // the black sheet with the lights punched out of it
      this.drawHud2(g, vw);
      if (T6R.ready && this.dawn < .5 && !S.hideParty) {                        // as the tranh starts, the mouse with the lamp has a feeling (owner)
        if (this.sayT == null) this.sayT = groom.x < 1200 ? 0 : 99;
        const t = this.sayT; if (t > .6 && t < 6.2) { const f = followers[0]; g.save(); g.translate(-camX, offY); g.globalAlpha = Math.min(1, (t - .6) / .3, (6.2 - t) / .4); t6Say(g, f.x, GROUND - 120, 'Ta có cảm giác lão mèo mà chúng ta dâng cá đang ở đâu đây…'); g.restore(); }
      }
    },
    drawHud2(g, vw) {
      const k = cv.width / vw;
      if (!T7.dk || T7.dk.width !== cv.width || T7.dk.height !== cv.height) { T7.dk = document.createElement('canvas'); T7.dk.width = cv.width; T7.dk.height = cv.height; T7.dkx = T7.dk.getContext('2d'); }
      const d = T7.dkx, base = .997 * (1 - this.dawn);
      d.globalCompositeOperation = 'source-over'; d.setTransform(1, 0, 0, 1, 0, 0); d.clearRect(0, 0, T7.dk.width, T7.dk.height);
      if (base > .003) {
        d.fillStyle = 'rgba(2,3,9,' + base + ')'; d.fillRect(0, 0, T7.dk.width, T7.dk.height);
        d.setTransform(k, 0, 0, k, 0, 0); d.globalCompositeOperation = 'destination-out';
        const light = (x, y, R, s) => { const gr = d.createRadialGradient(x, y, R * .06, x, y, R); gr.addColorStop(0, 'rgba(0,0,0,' + s + ')'); gr.addColorStop(.3, 'rgba(0,0,0,' + s * .78 + ')'); gr.addColorStop(.62, 'rgba(0,0,0,' + s * .36 + ')'); gr.addColorStop(.86, 'rgba(0,0,0,' + s * .1 + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.beginPath(); d.arc(x, y, R, 0, 6.283); d.fill(); };
        const [lx, ly] = lamp(), fl = 1 + Math.sin(this.flick * 11) * .035 + Math.sin(this.flick * 23.7) * .03 + (Math.sin(this.flick * 3.1) > .96 ? -.1 : 0);        // the lamp: a wide, soft, guttering round, a little dimmer than before
        if (!S.hideParty) light(lx - camX, ly + offY, 205 * fl, .86);
        if (T7.a > .02) { const ff = 1 + Math.sin(this.flick * 9.3 + 1) * .045 + Math.sin(this.flick * 21.1) * .035 + (Math.sin(this.flick * 2.7 + 2) > .95 ? -.12 : 0); light(T7.px, T7.py, 215 * ff, .88 * T7.a * (.92 + .08 * ff)); }   // it flickers like the oil lamp                      // the finger's torch
        d.globalCompositeOperation = 'source-over';
      }
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(T7.dk, 0, 0); g.restore();
      if (!S.hideParty) { const [lx, ly] = lamp(); g.save(); g.globalCompositeOperation = 'lighter'; const wg = g.createRadialGradient(lx - camX, ly + offY, 2, lx - camX, ly + offY, 160); wg.addColorStop(0, 'rgba(255,170,70,' + .26 * (1 - this.dawn) + ')'); wg.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = wg; g.fillRect(lx - camX - 160, ly + offY - 160, 320, 320); g.restore(); }     // warm glow
      if (base > .003) {                                                         // the near layer of gourds: never lit, pure black shapes over the sheet
        const A = t7Art(), x0 = camX - 150, x1 = Math.min(camX + vw + 150, T6_OFF - 100);
        if (x1 > x0) { g.save(); g.translate(-camX, offY); g.globalAlpha = Math.min(1, base * 1.3); g.lineCap = 'round'; t7Layer(g, T7_LAYERS[2], null, x0, x1, T7_TOP()); t7Fol(g, T7_FOL[2], A, x0, x1, T7_TOP(), true); g.restore(); }
      }
      if (T7.a > .05 && base > .003) {                                          // the lamp in the finger's place (above it on a touch screen, so the finger does not hide it)
        const px = T7.px, py = T7.py + (isTouch ? -78 : -10), fg = .75 + .25 * Math.abs(Math.sin(this.flick * 7.7) * Math.sin(this.flick * 3.1 + 1)), gl = g.createRadialGradient(px, py + 30, 2, px, py + 30, 52 + 14 * fg); gl.addColorStop(0, 'rgba(255,200,110,' + (.4 + .25 * fg) + ')'); gl.addColorStop(1, 'rgba(255,200,110,0)');
        g.save(); g.globalAlpha = Math.min(1, T7.a * 1.4); g.fillStyle = gl; g.fillRect(px - 60, py - 30, 120, 120); dp(g, ITEM.lantern, px, py, Math.sin(this.flick * 2.1) * .07, 1.5, 1.5); g.restore();
      }
      const c = T7.cat;
      if (c && base > .003) t7CatDraw(g, vw, c.t / T7_CAT, c.dir);
      if (T7.pounce) {
        const P = T7.pounce, t = P.t, px = (groom.x - 150) - camX, py = GROUND - 60 + offY;
        if (t < 1.25) { let x, y, open;
          if (t < .45) { const k = t / .45, e = k * k; x = px - P.dir * vw * .8 * (1 - e); y = py - viewH * .7 * (1 - e) - Math.sin(k * Math.PI) * 40; open = 1 - k; }       // dropping onto them
          else if (t < .6) { x = px; y = py + 6; open = 0; }                                                                                                   // on them
          else { const k = (t - .6) / .65, e = k * (2 - k); x = px + P.dir * vw * .95 * e; y = py - viewH * .75 * e + Math.sin(k * Math.PI) * -60; open = k; } // and away with them
          t7LeapDraw(g, x, y, 1.5, P.dir, open); }
        const b = t < 1.15 ? 0 : t < 1.55 ? (t - 1.15) / .4 : t < 1.75 ? 1 : Math.max(0, 1 - (t - 1.75) / .35);                             // black, the jump back, the light again
        if (b > 0) { g.save(); g.fillStyle = 'rgba(0,0,0,' + b + ')'; g.fillRect(0, -offY, vw, viewH + offY + 40); g.restore(); }
      }
      if (T7.black > .01) { g.save(); g.fillStyle = 'rgba(0,0,0,' + Math.min(1, T7.black * 1.6) + ')'; g.fillRect(0, -offY, vw, viewH + offY + 40); g.restore(); }                   // the cat's shadow streaks past, very fast
      if (this.dawn < 1 && T6R.ready && !window.TRAILER) {                                           // (demo only) a button to skip the dark stretch
        const w = 136, h = 32, x = vw - w - 24, y = viewH - 62; this.btn = { x, y, w, h };
        g.save(); g.font = '600 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(0,0,0,.6)'; g.strokeStyle = '#e8ecff'; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 16) : g.rect(x, y, w, h); g.fill(); g.stroke(); g.fillStyle = '#e8ecff'; g.fillText('Qua dàn bí rợ', x + w / 2, y + h / 2 + 1); g.restore();
      } else this.btn = null;
    },
  };
}
