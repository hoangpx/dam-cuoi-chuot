/* Tranh 6 · Bắc Kim Thang, the first stretch: Dàn Bí Rợ (owner's idea): pitch dark. The party walks through the night for about three minutes (T6_OFF px) before the rescue of the two birds under a trellis of giant gourds, pumpkins, aubergines and tomatoes
   ("cà lang bí rợ", from the song) that hides the moon. The mouse who carried the parasol now carries an oil lamp: it lights a small flickering round about itself and nothing else.
   A finger (or the mouse) held on the picture is a torch: it lights what it is over, the rest stays black. Now and then the shadow of a cat streaks past, very fast.
   Everything is drawn as usual and then a black sheet is laid over the view with holes punched out for the lights (an offscreen canvas, destination-out). Where the trellis ends the dark thins to the moonlight and the old road of the tranh (the stations, the pond, the bridge, the gate) begins, T6_OFF further on. ITEM.lantern is the lamp, drawn in drawMouse (game.js) when a follower's item is 'lantern'. */
const T7 = { px: 0, py: 0, in: false, down: false, a: 0, cat: null, catT: 7, cricT: 1, dk: null, dkx: null };
ITEM.lantern = part([-20, -12, 20, 56], a => {                                    // an oil lamp hung from the hand: a ring, a dark cap, a paper body glowing from inside
  a.key(lines([[0, -10, 0, 2]]), 2.4);
  a.fk('dark', smooth([[-9, 2], [9, 2], [11, 8], [-11, 8]]), 2);
  a.fk('yellow', smooth([[-12, 8], [12, 8], [16, 24], [10, 38], [-10, 38], [-16, 24]]), 2.2);
  a.fill('orange', smooth([[-7, 14], [7, 14], [9, 26], [0, 34], [-9, 26]]));
  a.fill('white', ell(0, 24, 3.4, 6, 0));                                       // the flame
  a.key(lines([[-12, 8, -10, 38], [12, 8, 10, 38], [-15, 24, 15, 24]]), 1.3);
  a.fk('dark', smooth([[-10, 38], [10, 38], [8, 44], [-8, 44]]), 2);
});
// the gourds, hung by their stems (origin = the point they hang from)
let T7_ART = null;
function t7Art() {
  if (T7_ART) return T7_ART;
  const stem = a => { a.fk('green', smooth([[-3, 0], [3, 0], [4, 9], [-4, 9]]), 1.8); };
  const pump = part([-46, -4, 46, 70], a => {                                       // bí rợ: a ribbed pumpkin
    stem(a); a.fk('orange', ell(0, 38, 40, 30, 0), 2.4); a.fill('red', ell(0, 44, 26, 22, 0));
    a.key(lines([[0, 10, 0, 66], [-18, 12, -24, 60], [18, 12, 24, 60], [-32, 20, -38, 52], [32, 20, 38, 52]]), 1.4); a.fk('green', smooth([[-8, 8], [0, 0], [8, 8], [0, 12]]), 1.4);
  });
  const egg = part([-24, -4, 24, 96], a => {                                         // cà: an aubergine, long and glossy
    a.fk('lilac', smooth([[-12, 14], [12, 14], [22, 48], [18, 82], [0, 94], [-18, 82], [-22, 48]]), 2.4); a.fill('grey', smooth([[-6, 24], [4, 24], [10, 52], [4, 80], [-6, 60]]));
    a.fk('green', smooth([[-14, 14], [-6, 4], [0, 14], [6, 4], [14, 14], [0, 20]]), 1.8); stem(a);
  });
  const bau = part([-34, -4, 34, 100], a => {                                         // bầu: a bottle gourd, a small lobe over a big one
    stem(a); a.fk('teal', circ(0, 26, 16), 2.2); a.fk('teal', circ(0, 64, 30), 2.4); a.fill('cream', ell(-10, 66, 9, 16, .25));
    a.key(lines([[-8, 36, -10, 40], [8, 36, 10, 40]]), 1.6);
  });
  const ca = part([-30, -4, 30, 54], a => {                                           // cà lang: a round red tomato
    stem(a); a.fk('red', circ(0, 30, 24), 2.4); a.fill('pink', ell(-8, 24, 8, 6, -.4)); a.fk('green', smooth([[-14, 8], [-6, 12], [0, 6], [6, 12], [14, 8], [6, 18], [-6, 18]]), 1.6);
  });
  const leaf = part([-30, -16, 30, 16], a => { a.fk('green', smooth([[-28, 0], [-10, -14], [14, -12], [28, 0], [10, 12], [-12, 12]]), 2); a.key(lines([[-24, 0, 22, 0]]), 1.2); });
  return (T7_ART = { gourds: [pump, egg, bau, ca], leaf });
}
const t7h = (n, s) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };      // a steady pseudo-random number for cell n, stream s
const T7_TOP = () => GROUND - 440;                                              // the trellis

// the shadow of a cat: a dim shape with two glowing eyes
function t7CatDraw(g, x, y, dir, t, s) {
  const run = Math.sin(t * 34);
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  g.fillStyle = 'rgba(46,54,86,.9)'; g.strokeStyle = 'rgba(46,54,86,.9)'; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 0, 27, 11 + run * 1.2, run * .05, 0, 6.283); g.fill();                                  // the body, stretched out in the run
  g.beginPath(); g.arc(30, -6 + run * 1.5, 10, 0, 6.283); g.fill();                                                    // the head
  g.beginPath(); g.moveTo(24, -13); g.lineTo(27, -25); g.lineTo(33, -14); g.closePath(); g.moveTo(32, -13); g.lineTo(38, -23); g.lineTo(40, -10); g.closePath(); g.fill();   // the ears
  g.lineWidth = 6; g.beginPath(); g.moveTo(-24, -2); g.quadraticCurveTo(-52, -26 + run * 6, -58, -4 + run * 8); g.stroke();                                // the tail
  g.lineWidth = 5; g.beginPath(); g.moveTo(16, 8); g.lineTo(26 + run * 12, 22); g.moveTo(8, 9); g.lineTo(2 - run * 12, 23); g.moveTo(-14, 8); g.lineTo(-24 + run * 14, 22); g.moveTo(-20, 7); g.lineTo(-8 - run * 14, 21); g.stroke();   // legs
  for (const ex of [34, 41]) { const gr = g.createRadialGradient(ex, -8 + run * 1.5, 0, ex, -8 + run * 1.5, 9); gr.addColorStop(0, 'rgba(230,255,120,.95)'); gr.addColorStop(1, 'rgba(230,255,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(ex, -8 + run * 1.5, 9, 0, 6.283); g.fill(); }   // the eyes
  g.restore();
}

(function () {                                                                   // where the finger or the mouse is (in the units of the HUD)
  const upd = e => { const r = cv.getBoundingClientRect(); T7.px = (e.clientX - r.left) / scale; T7.py = (e.clientY - r.top) / scale; T7.in = true; };
  cv.addEventListener('pointermove', upd); cv.addEventListener('pointerdown', e => { upd(e); T7.down = true; });
  addEventListener('pointerup', () => { T7.down = false; }); addEventListener('pointercancel', () => { T7.down = false; });
  cv.addEventListener('pointerleave', () => { T7.in = false; });
})();

function t6Dark() {
  T7.cat = null; T7.catT = 6; T7.a = 0;
  const lamp = () => { const f = followers[0]; return [f.x + f.face * 44, GROUND - 78]; };                // the lamp in the hand of the third mouse
  return {
    layer: 'bg', flick: 0, dawn: 0, btn: null,
    update(dt) {
      this.flick += dt;
      this.dawn = Math.max(0, Math.min(1, (groom.x - (T6_OFF - 1700)) / 1500));                  // the dark thins as the trellis ends, and the moon comes out
      followers[0].item = this.dawn < .98 ? 'lantern' : 'parasol';
      if (groom.x > T6_OFF && !(SAVE.t6 && SAVE.t6.dark)) { SAVE.t6 = Object.assign(SAVE.t6 || {}, { dark: true }); persist(); }       // the dark stretch is walked once
      const want = (isTouch ? T7.down : T7.in) ? 1 : 0; T7.a += (want - T7.a) * Math.min(1, dt * (want ? 9 : 2.4));    // the torch of the finger: on while it is down, fading when lifted
      if ((T7.cricT -= dt) < 0) { T7.cricT = 1.4 + Math.random() * 3.2; AU.cricket(.35 + Math.random() * .4); }
      if (!T7.cat && this.dawn < .8 && (T7.catT -= dt) < 0) { T7.catT = 7 + Math.random() * 12; T7.cat = { t: 0, dir: Math.random() < .5 ? -1 : 1, hi: Math.random() < .35, s: .9 + Math.random() * .5 }; AU.rustle && AU.rustle(.55); }
      if (T7.cat) { T7.cat.t += dt; if (T7.cat.t > .85) T7.cat = null; }
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
    drawFg(g) {                                                                  // the trellis and the giant gourds hanging from it, over the party's heads
      const A = t7Art(), vw = cv.width / DPR / scale, x0 = camX - 150, x1 = Math.min(camX + vw + 150, T6_OFF - 100), top = T7_TOP();
      if (x1 <= x0) return;
      g.lineCap = 'round';
      for (const [dy, w] of [[0, 9], [46, 7]]) { g.strokeStyle = '#150f0a'; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, top + dy); g.lineTo(x1, top + dy); g.stroke(); g.strokeStyle = '#8a7a3a'; g.lineWidth = w - 1; g.stroke(); }
      g.strokeStyle = '#150f0a'; g.lineWidth = 4; for (let x = Math.floor(x0 / 74) * 74; x < x1; x += 74) { g.beginPath(); g.moveTo(x, top - 4); g.lineTo(x + 14, top + 50); g.stroke(); }
      for (let i = Math.floor(x0 / 80); i <= Math.floor(x1 / 80); i++) {
        if (t7h(i, 1) < .28) continue;
        const lx = i * 80 + t7h(i, 2) * 80; dp(g, A.leaf, lx, top + 6, t7h(i, 3) * 1.2 - .6, .9 + t7h(i, 4) * .7, .9 + t7h(i, 4) * .7);   // leaves along it
        const n = t7h(i, 5) < .55 ? 1 : 2;
        for (let j = 0; j < n; j++) {
          const gx = i * 80 + t7h(i, 6 + j) * 80, kind = Math.floor(t7h(i, 8 + j) * 4), sc = 1.05 + t7h(i, 10 + j) * .95, len = 18 + t7h(i, 12 + j) * 58, sw = Math.sin(S.t * .8 + i * 1.7 + j) * .04;     // giant ones
          g.strokeStyle = '#150f0a'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(gx, top + 48); g.quadraticCurveTo(gx + 8, top + 48 + len * .5, gx, top + 48 + len); g.stroke();      // the vine
          g.save(); g.translate(gx, top + 48 + len); g.rotate(sw); dp(g, A.gourds[kind], 0, 0, 0, sc, sc); g.restore();
        }
      }
    },
    onClick(wx, wy) {                                                            // (demo only) skip the dark stretch
      const b = this.btn; if (!b) return false; const sx = wx - camX, sy = wy + offY;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) { const d = (T6_OFF - 300) - groom.x; if (d > 0) { groom.x += d; followers.forEach(f => f.x += d); camX += d; } return true; }
      return false;
    },
    drawHud(g, vw) {                                                             // the black sheet with the lights punched out of it
      const k = cv.width / vw;
      if (!T7.dk || T7.dk.width !== cv.width || T7.dk.height !== cv.height) { T7.dk = document.createElement('canvas'); T7.dk.width = cv.width; T7.dk.height = cv.height; T7.dkx = T7.dk.getContext('2d'); }
      const d = T7.dkx, base = .997 * (1 - this.dawn);
      d.globalCompositeOperation = 'source-over'; d.setTransform(1, 0, 0, 1, 0, 0); d.clearRect(0, 0, T7.dk.width, T7.dk.height);
      if (base > .003) {
        d.fillStyle = 'rgba(2,3,9,' + base + ')'; d.fillRect(0, 0, T7.dk.width, T7.dk.height);
        d.setTransform(k, 0, 0, k, 0, 0); d.globalCompositeOperation = 'destination-out';
        const light = (x, y, R, s) => { const gr = d.createRadialGradient(x, y, R * .08, x, y, R); gr.addColorStop(0, 'rgba(0,0,0,' + s + ')'); gr.addColorStop(.45, 'rgba(0,0,0,' + s * .82 + ')'); gr.addColorStop(.78, 'rgba(0,0,0,' + s * .3 + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.beginPath(); d.arc(x, y, R, 0, 6.283); d.fill(); };
        const [lx, ly] = lamp(), fl = 1 + Math.sin(this.flick * 11) * .035 + Math.sin(this.flick * 23.7) * .03 + (Math.sin(this.flick * 3.1) > .96 ? -.1 : 0);        // the lamp: a small guttering round
        light(lx - camX, ly + offY, 118 * fl, 1);
        if (T7.a > .02) light(T7.px, T7.py, 150, T7.a);                            // the finger's torch
        d.globalCompositeOperation = 'source-over';
      }
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(T7.dk, 0, 0); g.restore();
      const [lx, ly] = lamp(); g.save(); g.globalCompositeOperation = 'lighter'; const wg = g.createRadialGradient(lx - camX, ly + offY, 2, lx - camX, ly + offY, 130); wg.addColorStop(0, 'rgba(255,170,70,' + .34 * (1 - this.dawn) + ')'); wg.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = wg; g.fillRect(lx - camX - 130, ly + offY - 130, 260, 260); g.restore();     // warm glow
      if (this.dawn < 1 && T6R.ready) {                                           // (demo only) a button to skip the dark stretch
        const w = 136, h = 32, x = vw - w - 24, y = viewH - 104; this.btn = { x, y, w, h };
        g.save(); g.font = '600 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(0,0,0,.6)'; g.strokeStyle = '#e8ecff'; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 16) : g.rect(x, y, w, h); g.fill(); g.stroke(); g.fillStyle = '#e8ecff'; g.fillText('Qua dàn bí rợ', x + w / 2, y + h / 2 + 1); g.restore();
      } else this.btn = null;
      const c = T7.cat;
      if (c) {                                                                   // the cat's shadow streaks across, very fast
        const q = c.t / .85, x = c.dir > 0 ? -90 + (vw + 180) * q : vw + 90 - (vw + 180) * q, y = (c.hi ? T7_TOP() + 4 : GROUND - 20) + offY;
        t7CatDraw(g, x, y, c.dir, c.t, c.s);
      }
    },
  };
}
