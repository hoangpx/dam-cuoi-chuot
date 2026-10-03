/* Corner how-to for chương I: two arrow keys (walk) and a little woodblock computer-mouse critter (tap / drag).
   It only shows what the player has not done yet, fades out once they have, remembers that between visits,
   and comes back for a moment when the player stands idle or keeps pushing against something that blocks the way.
   On touch screens the mouse becomes a tapping finger and the ◀ ▶ pad pulses until the player walks. */
const HOWTO = { walk: false, tap: false, show: 0, idle: 0, lastX: null, walked: 0, why: '' };
try { Object.assign(HOWTO, JSON.parse(localStorage.getItem('dcc.how') || '{}')); } catch (e) {}
const howtoSave = () => { try { localStorage.setItem('dcc.how', JSON.stringify({ walk: HOWTO.walk, tap: HOWTO.tap })); } catch (e) {} };
function howtoInput() { HOWTO.idle = 0; if (HOWTO.why === 'idle') HOWTO.why = ''; }
function howtoTapped() { howtoInput(); if (!HOWTO.tap) { HOWTO.tap = true; howtoSave(); } if (HOWTO.why === 'blocked') HOWTO.why = ''; }

function howtoUpdate(dt) {
  const playing = S.mode === 'play' && !S.caught;
  if (HOWTO.lastX === null || !playing) HOWTO.lastX = groom.x;
  const moved = Math.abs(groom.x - HOWTO.lastX); HOWTO.lastX = groom.x;
  if (moved > .5) { HOWTO.walked += moved; howtoInput(); }
  if (!HOWTO.walk && HOWTO.walked > 160) { HOWTO.walk = true; howtoSave(); }
  if (playing && !S.drag) HOWTO.idle += dt;
  if (HOWTO.idle > 10) HOWTO.why = 'idle';                     // stood still a while: remind both
  else if (S.wallT > 2.5 && !S.drag) HOWTO.why = 'blocked';    // keeps walking into something: remind to tap
  const want = playing && (!HOWTO.walk || !HOWTO.tap || HOWTO.why);
  HOWTO.show += ((want ? 1 : 0) - HOWTO.show) * Math.min(1, dt * (want ? 3 : 5));
  const pad = document.getElementById('pad'); if (pad) pad.classList.toggle('pulse', playing && (!HOWTO.walk || HOWTO.why === 'idle'));
}

let HOWTO_ART = null;
function howtoArt() {
  if (HOWTO_ART) return HOWTO_ART;
    const rrect = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
  const tri = dir => { const p = new Path2D(); p.moveTo(-7 * dir, 0); p.lineTo(6 * dir, -8); p.lineTo(6 * dir, 8); p.closePath(); return p; };
  HOWTO_ART = {
    keyBase: part([-22, -18, 22, 26], a => a.fk('dark', rrect(-19, -14, 38, 38, 8), 2)),
    keyL: part([-22, -22, 22, 22], a => { a.fk('white', rrect(-19, -19, 38, 36, 8), 2.2); a.ink(tri(1)); }),
    keyR: part([-22, -22, 22, 22], a => { a.fk('white', rrect(-19, -19, 38, 36, 8), 2.2); a.ink(tri(-1)); }),
    // the critter: a computer mouse with round ears, a face, whiskers and a cable for a tail
    mouse: part([-44, -46, 34, 48], a => {
      a.key(smooth([[0, 34], [-6, 42], [-20, 40], [-30, 30], [-38, 34]], false), 2);
      for (const x of [-15, 15]) { a.fk('grey', circ(x, -32, 10), 2); a.fill('lilac', circ(x, -32, 5)); }
      a.fk('white', ell(0, 0, 22, 32), 2.6);
      a.key(lines([[0, -31, 0, -6], [-21, -6, 21, -6]]), 1.6);
      a.ink(circ(-8, 8, 2.6)); a.ink(circ(8, 8, 2.6));
      a.fill('red', ell(-13, 15, 4, 2.4)); a.fill('red', ell(13, 15, 4, 2.4));
      a.key(smooth([[-3, 15], [0, 17], [3, 15]], false), 1.4);
      a.key(lines([[-10, 17, -28, 14], [-10, 19, -27, 22], [10, 17, 28, 14], [10, 19, 27, 22]]), 1);
    }),
    click: part([-22, -34, 2, -5], a => { const p = new Path2D(); p.moveTo(-1, -31); p.bezierCurveTo(-12, -31, -20, -22, -21, -7); p.lineTo(-1, -7); p.closePath(); a.fill('red', p); }),
    finger: part([-18, -8, 18, 52], a => {
      a.fk('white', smooth([[-9, 50], [-10, 8], [-8, -2], [0, -5], [8, -2], [10, 8], [10, 50]]), 2.4);
      a.fk('lilac', smooth([[-5, 6], [-4, 0], [0, -1], [4, 0], [5, 6], [0, 8]]), 1.2);
      a.key(lines([[-6, 22, 5, 22], [-6, 27, 5, 27]]), 1);
    }),
  };
  return HOWTO_ART;
}

function howtoDraw() {
  if (HOWTO.show < .02) return;
  const A = howtoArt(), W = cv.width / DPR, H = cv.height / DPR, t = S.t;
  const needWalk = !isTouch && (!HOWTO.walk || HOWTO.why === 'idle');
  const needTap = false;                                                  // owner: no finger in the corner; tranh 1 shows one at the fish and the cat
  if (!needWalk && !needTap) return;
  // sit on the same line as the ◀ ▶ pad when it is shown (it already clears the iPhone home bar)
  const pad = document.getElementById('pad'), pr = pad && !pad.hidden ? pad.getBoundingClientRect() : null;
  const k = HOWTO.show, bottom = pr && pr.height ? Math.max(12, H - pr.bottom - 4) : 34;
  const both = needWalk && needTap, Z = Math.min(1.35, Math.max(1.1, W / 420));              // local drawing scale
  const w = (both ? 170 : 70) * Z, h = 70 * Z;
  // desktop: bottom-left corner; touch: bottom-right, clear of the pad
  const cx = isTouch ? W - 20 - w / 2 : 34 + w / 2, cy = H - bottom - h / 2 + (1 - k) * 18;
  ctx.save(); ctx.setTransform(DPR * Z, 0, 0, DPR * Z, cx * DPR, cy * DPR); ctx.globalAlpha = k;
  const tapPulse = HOWTO.why === 'blocked' ? 1 + Math.max(0, Math.sin(t * 6)) * .12 : 1;
  let x = both ? -42 : 0;
  if (needWalk) {
    const down = Math.floor(t / .45) % 2;                         // press ← and → in turn
    for (const [i, key] of [[-1, A.keyL], [1, A.keyR]]) {
      const kx = x + i * 21, pressed = (i < 0 ? down === 0 : down === 1) ? 3 : 0;
      dp(ctx, A.keyBase, kx, -8, 0, .8, .8); dp(ctx, key, kx, -10 + pressed, 0, .8, .8);
    }
    x = 46;
  }
  if (needTap) {
    const ph = (t % 1.2) / 1.2, tap = ph < .18;                   // a click every 1.2 s
    if (isTouch) {
      const lift = tap ? 0 : Math.sin(ph * Math.PI) * 6;
      if (tap) { ctx.strokeStyle = INK; ctx.lineWidth = 1.6; for (const r of [9, 15]) { ctx.globalAlpha = k * (1 - ph / .18); ctx.beginPath(); ctx.arc(x - 3, -30, r, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = k; }
      dp(ctx, A.finger, x, -27 - lift, -.15, .62 * tapPulse, .62 * tapPulse);
    } else {
      const bob = tap ? 1.5 : Math.sin(t * 3) * 1.2;
      dp(ctx, A.mouse, x, -9 + bob, Math.sin(t * 2) * .05, .72 * tapPulse, .72 * tapPulse);
      if (tap) dp(ctx, A.click, x, -9 + bob, Math.sin(t * 2) * .05, .72 * tapPulse, .72 * tapPulse);
    }
  }
  ctx.restore();
}
