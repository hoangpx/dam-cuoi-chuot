/* Chương III · tranh 3 · Chăn Trâu.
   A buffalo runs loose in the field. The herd boy walks left/right (← → / ◀ ▶) along the near edge and a tap throws the
   lasso at that spot; it takes a moment to fly, so aim ahead of the buffalo. Only a loop that lands on its neck holds.
   Roped, the buffalo plants its feet in the middle of the field and keeps turning its head this way and that. A ring of
   rope lies round it and the boy walks round the ring (← → again): while he stands where its head points the ring draws
   in, when he is off to one side it opens out. Closed right in, the buffalo is tamed; opened to the outer ring, it breaks
   free and has to be roped again. The record is the fastest taming; the reward is the "Chăn trâu" print.
   The ground is a flat plane seen from the front: a ring on it is an ellipse squashed by CT_K, and a buffalo heading th
   points along (cos th, sin th · CT_K) on screen (sin th > 0 is towards the viewer). */
const CT = { W: 460, H: 995, t: 0, phase: 'chase', r: 0, onWin: null };
const CT_K = .55, CT_WP = 2.3, CT_IN = 12, CT_OUT = 12, CT_ALIGN = .5;

/* ---------- art ---------- */
let CTART = null;
function ctArt() {
  if (CTART) return CTART;
  const skin = 'white';
  // the buffalo, facing right, feet on y = 0 (legs are drawn live)
  const body = part([-92, -112, 84, -30], a => {
    const b = smooth([[-78, -58], [-72, -92], [-40, -104], [20, -102], [58, -92], [72, -70], [64, -46], [30, -38], [-40, -38], [-72, -44]]);
    a.fk('dark', b, 2.8);
    a.fill('green', smooth([[-50, -86], [-20, -96], [10, -90], [-6, -76], [-38, -74]]));          // the green sheen of the print
    a.fill('green', smooth([[20, -84], [44, -82], [52, -66], [30, -64]]));
    a.fk('red', smooth([[-44, -46], [-10, -52], [26, -48], [22, -40], [-40, -40]]), 1.4);       // the pink-red belly
    for (let i = 0; i < 5; i++) a.key(smooth([[-40 + i * 18, -98], [-34 + i * 18, -90], [-28 + i * 18, -98]], false), 1.1);
    a.key(smooth([[-60, -70], [-50, -60], [-58, -50]], false), 1.4); a.key(smooth([[40, -74], [50, -60]], false), 1.2);
  });
  const horn = side => tube([[side * 12, -8], [side * 30, -16], [side * 40, -32], [side * 32, -46]], 10, 2);   // a crescent sweeping out and up
  const headSide = part([-48, -52, 58, 34], a => {                  // the neck joint at (0,0), snout down-forward
    a.fk('white', tube([[2, -20], [-10, -34], [-28, -40], [-40, -32]], 10, 2), 1.8);        // horn sweeping back
    a.fk('dark', smooth([[-16, -20], [18, -26], [44, 4], [48, 22], [30, 28], [8, 14], [-18, 8]]), 2.6);
    a.fk('red', ell(40, 20, 10, 8, .4), 1.6); a.ink(circ(44, 20, 2.2));                          // muzzle and nostril
    a.fk('white', circ(14, -8, 6), 1.6); a.ink(circ(15, -8, 2.8));
    a.fk('dark', ell(-6, -20, 11, 5, -.6), 1.6);                                                  // ear
  });
  const headFront = part([-50, -56, 50, 44], a => {                 // looking straight out of the picture
    a.fk('white', horn(-1), 1.8); a.fk('white', horn(1), 1.8);
    a.fk('dark', ell(-26, -2, 12, 5, .3), 1.6); a.fk('dark', ell(26, -2, 12, 5, -.3), 1.6);        // ears
    a.fk('dark', smooth([[-18, -10], [18, -10], [22, 14], [14, 36], [-14, 36], [-22, 14]]), 2.6);
    a.fk('red', ell(0, 30, 15, 9), 1.6); a.ink(circ(-6, 30, 2.4)); a.ink(circ(6, 30, 2.4));
    a.fk('white', circ(-10, 4, 5), 1.4); a.fk('white', circ(10, 4, 5), 1.4); a.ink(circ(-10, 5, 2.4)); a.ink(circ(10, 5, 2.4));
  });
  const headBack = part([-50, -56, 50, 30], a => {                  // seen from behind: horns, ears, the poll
    a.fk('white', horn(-1), 1.8); a.fk('white', horn(1), 1.8);
    a.fk('dark', ell(-26, 0, 12, 5, .3), 1.6); a.fk('dark', ell(26, 0, 12, 5, -.3), 1.6);
    a.fk('dark', smooth([[-18, -8], [18, -8], [20, 14], [0, 24], [-20, 14]]), 2.6);
    a.key(smooth([[-8, 2], [0, 8], [8, 2]], false), 1.2);
  });
  const tail = part([-8, -4, 10, 46], a => { a.fk('dark', tube([[0, 0], [3, 20], [1, 34]], 5, 3), 1.4); a.fk('dark', smooth([[-5, 32], [6, 32], [4, 44], [-2, 44]]), 1.2); });
  // the herd boy, facing right, feet on y = 0 (legs and the rope arm are drawn live); a lotus leaf for a hat, as on the print
  const boy = part([-36, -118, 36, -8], a => {
    a.fk('red', smooth([[-15, -40], [15, -40], [17, -16], [0, -20], [-17, -16]]), 2);             // shorts
    a.fk(skin, smooth([[-14, -70], [12, -70], [16, -40], [-16, -40]]), 2.2);
    a.key(smooth([[-4, -52], [0, -48], [4, -52]], false), 1);
    a.fk(skin, circ(2, -84, 14), 2.2);
    a.ink(smooth([[-3, -99], [2, -103], [7, -99], [2, -96]]));
    a.key(smooth([[5, -86], [9, -83], [13, -86]], false), 1.3); a.key(smooth([[4, -77], [8, -75], [11, -78]], false), 1.1);
    a.fill('red', ell(10, -80, 3, 2));
    a.fk('green', smooth([[-32, -100], [-10, -112], [22, -110], [34, -100], [10, -96], [-14, -94]]), 2);   // lotus leaf
    a.key(lines([[0, -104, -24, -100], [0, -104, 26, -102], [0, -104, 2, -95]]), 1);
  });
  const tuft = part([-16, -22, 16, 2], a => { const p = lines([[-10, 0, -14, -14], [-3, 0, -4, -20], [4, 0, 8, -18], [10, 0, 15, -9]]); a.band('green', p, 3.2); a.key(p, 1.1); });
  const flute = part([-4, -4, 44, 4], a => { a.fk('yellow', smooth([[0, -2], [42, -2], [42, 2], [0, 2]]), 1.2); for (let i = 1; i < 5; i++) a.ink(circ(12 + i * 6, 0, 1)); });
  CTART = { body, headSide, headFront, headBack, tail, boy, tuft, flute };
  return CTART;
}

// the inscription at the top right of the print (img/ch3/chan-trau.png), cut out and kept ink-only
let CT_TEXT = null;
function ctText() {
  if (CT_TEXT) return CT_TEXT.ready ? CT_TEXT.c : null;
  CT_TEXT = { ready: false, c: null };
  const img = new Image();
  img.onload = () => {
    const k = img.naturalWidth / 347, sx = 240 * k, sy = 58 * k, sw = 86 * k, sh = 125 * k;   // measured on the 347×487 print
    const c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh);
    const x = c.getContext('2d'); x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const lum = .3 * p[i] + .59 * p[i + 1] + .11 * p[i + 2]; p[i + 3] = Math.max(0, Math.min(1, (150 - lum) / 70)) * 255; p[i] = 29; p[i + 1] = 25; p[i + 2] = 21; }
    x.putImageData(d, 0, 0); CT_TEXT.c = c; CT_TEXT.ready = true;
  };
  img.src = 'img/ch3/chan-trau.png';
  return null;
}

/* ---------- geometry ---------- */
const ctWrap = a => { a = (a + Math.PI) % 6.283185; if (a < 0) a += 6.283185; return a - Math.PI; };
const ctSc = y => (.8 + .3 * Math.max(0, Math.min(1.2, (y - CT.top) / (CT.front - CT.top)))) * CT.big;   // nearer is bigger
const ctDir = () => ((keys.has('ArrowRight') || keys.has('KeyD') || touchDir.R) ? 1 : 0) - ((keys.has('ArrowLeft') || keys.has('KeyA') || touchDir.L) ? 1 : 0);
const ctRing = (phi, r) => [CT.C.x + Math.cos(phi) * r, CT.C.y + Math.sin(phi) * r * CT_K];
// where the neck and the head are on screen, matching ctBuffalo()
function ctNeck(B) { const s = ctSc(B.y); return [B.x + Math.cos(B.th) * 46 * s, B.y - 56 * s + Math.sin(B.th) * 12 * s]; }
function ctHead(B) { const s = ctSc(B.y); return [B.x + Math.cos(B.th) * 66 * s, B.y - 58 * s + Math.sin(B.th) * 18 * s]; }
function ctHand() { const b = CT.boy, s = ctSc(b.y); return [b.x + b.face * 22 * s, b.y - 60 * s]; }

/* ---------- layout ---------- */
function ctLayout() {
  const p = CT.H > CT.W;
  CT.top = CT.H * (p ? .3 : .34); CT.big = p ? 1.1 : 1.05;                       // the far edge of the field
  CT.front = CT.H * (p ? .79 : .88);                      // the near edge, where the boy walks while chasing
  CT.x0 = 60; CT.x1 = CT.W - 60;
  CT.C = { x: CT.W / 2, y: CT.H * (p ? .56 : .62) };      // where a roped buffalo stands
  CT.rMax = Math.min(p ? 185 : 240, CT.W / 2 - 45); CT.rMin = CT.rMax * .54;
  const r = mulberry(33); CT.tufts = [];
  for (let i = 0; i < 26; i++) CT.tufts.push({ x: 30 + r() * (CT.W - 60), y: CT.top + 10 + r() * (CT.H * .95 - CT.top - 10), s: .7 + r() * .6, f: r() < .5 ? -1 : 1 });
  CT.tufts.sort((a, b) => a.y - b.y);
}
function ctStart() {
  ctLayout();
  Object.assign(CT, { t: 0, phase: 'chase', r: 0, throws: 0, breaks: 0, phaseT: 0, lasso: null, puffs: [], won: false, idle: 0, howK: 0, walked: false });
  CT.B = { x: CT.W * .62, y: (CT.top + CT.front) / 2 - 20, th: Math.PI * .9, thTo: Math.PI * .9, sp: 110, turnT: 1.5, ph: 0, stamp: 0, nod: 0, mooT: 3 };
  CT.boy = { x: CT.W * .3, y: CT.front, face: 1, ph: 0, moving: false, phi: Math.PI / 2 };
}

/* ---------- update ---------- */
function ctUpdate(dt) {
  CT.t += dt; CT.phaseT += dt;
  const B = CT.B, boy = CT.boy, dir = ctDir();
  for (const p of CT.puffs) p.t += dt; CT.puffs = CT.puffs.filter(p => p.t < .6);
  // the how-to: the tap critter while roping, until the first throw (and again after standing idle a while)
  if (CT.phase === 'chase' && !CT.lasso) CT.idle += dt;
  const how = CT.phase === 'chase' && (CT.throws === 0 || CT.idle > 6);
  CT.howK += ((how ? 1 : 0) - CT.howK) * Math.min(1, dt * (how ? 3 : 5));
  if (CT.phase === 'tame' && dir) CT.walked = true;
  if (CT.phase === 'chase') {
    // the boy walks along the near edge (after a break he first walks back to it)
    boy.y += (CT.front - boy.y) * Math.min(1, dt * 5);
    boy.moving = dir !== 0; if (dir) boy.face = dir;
    boy.x = Math.max(CT.x0, Math.min(CT.x1, boy.x + dir * 170 * dt)); if (dir) boy.ph += dt * 12;
    // the buffalo wanders, dashes now and then, and shies away from the boy
    if ((B.turnT -= dt) <= 0) {
      B.turnT = 1.1 + R() * 1.7; B.thTo = B.th + (R() * 2 - 1) * 2.2; B.sp = 90 + R() * 80;   // long enough runs to read and lead
      if (R() < .2) { B.sp = 230; B.turnT = .8; }
    }
    if (Math.hypot(B.x - boy.x, (B.y - boy.y) * 1.6) < 120) B.thTo = Math.atan2((B.y - boy.y) / CT_K, B.x - boy.x);
    B.th += Math.max(-2.6 * dt, Math.min(2.6 * dt, ctWrap(B.thTo - B.th)));
    B.x += Math.cos(B.th) * B.sp * dt; B.y += Math.sin(B.th) * B.sp * CT_K * dt;
    const y0 = CT.top + 70, y1 = CT.front - 80;
    if (B.x < CT.x0 + 30) { B.x = CT.x0 + 30; B.th = B.thTo = Math.PI - B.th; } if (B.x > CT.x1 - 30) { B.x = CT.x1 - 30; B.th = B.thTo = Math.PI - B.th; }
    if (B.y < y0) { B.y = y0; B.th = B.thTo = -B.th; } if (B.y > y1) { B.y = y1; B.th = B.thTo = -B.th; }
    B.ph += dt * B.sp / 9; B.nod = Math.sin(B.ph * .5) * .05;
    if ((B.mooT -= dt) <= 0) { B.mooT = 5 + R() * 5; AU.moo(); }
    // the lasso: flies to where it was thrown, holds if it lands on the neck, else is pulled back in
    const L = CT.lasso;
    if (L) {
      L.t += dt;
      if (L.st === 'fly' && L.t >= L.T) {
        const [nx, ny] = ctNeck(B), [hx, hy] = ctHead(B), s = ctSc(B.y);
        if (Math.hypot(L.x1 - nx, (L.y1 - ny) * 1.3) < 44 * s || Math.hypot(L.x1 - hx, (L.y1 - hy) * 1.3) < 32 * s) ctCatch();
        else { L.st = 'drop'; L.t = 0; AU.thump(); }
      } else if (L.st === 'drop' && L.t > .35) { L.st = 'back'; L.t = 0; }
      else if (L.st === 'back' && L.t > .3) CT.lasso = null;
    }
  } else if (CT.phase === 'tug') {
    // roped: the buffalo drags the boy into the middle of the field and plants its feet
    const k = Math.min(1, CT.phaseT / .9), e = k * k * (3 - 2 * k), T = CT.tug;
    B.x = T.bx + (CT.C.x - T.bx) * e; B.y = T.by + (CT.C.y - T.by) * e; B.ph += dt * 14; B.nod = Math.sin(CT.t * 18) * .08;
    B.th = T.th + ctWrap(T.th2 - T.th) * e;
    const [px, py] = ctRing(boy.phi, CT.r); boy.x = T.x + (px - T.x) * e; boy.y = T.y + (py - T.y) * e; boy.face = boy.x < B.x ? 1 : -1; boy.ph += dt * 10;
    if (k >= 1) { CT.phase = 'tame'; CT.phaseT = 0; B.turnT = 1.1; B.thTo = B.th; }
  } else if (CT.phase === 'tame') {
    const prog = 1 - (CT.r - CT.rMin) / (CT.rMax - CT.rMin);   // 0 at the outer ring, 1 when tamed
    boy.phi -= dir * CT_WP * dt; boy.moving = dir !== 0; if (dir) boy.ph += dt * 12;   // → walks right along the near side
    // the buffalo stamps, then swings its head somewhere new; faster and further as the ring closes
    if (B.stamp > 0) { B.stamp -= dt; if (B.stamp <= 0) B.thTo = B.th + (R() < .5 ? -1 : 1) * (.8 + R() * (1.3 + prog * 1.3)); }
    else if ((B.turnT -= dt) <= 0) { B.turnT = 1.5 - prog * .6 + R() * 1.1; B.stamp = .32; AU.thump(); CT.puffs.push({ x: B.x + Math.cos(B.th) * 30, y: B.y, t: 0 }); }
    const wb = 1.2 + prog * 1.1, d = ctWrap(B.thTo - B.th);
    B.th += Math.max(-wb * dt, Math.min(wb * dt, d)); if (Math.abs(d) > .02) B.ph += dt * 6;
    B.nod = B.stamp > 0 ? Math.sin(B.stamp * 30) * .1 : Math.sin(CT.t * 2) * .03;
    CT.aligned = Math.abs(ctWrap(boy.phi - B.th)) < CT_ALIGN;
    const bk = ctBuck(B), up = bk && Math.abs(bk.k) > .5;
    if (CT.bucking && !up) { const s2 = ctSc(B.y), f2 = .45 + .55 * Math.abs(Math.cos(B.th)); CT.puffs.push({ x: B.x + (CT.lastRear ? 40 : -44) * Math.sign(Math.cos(B.th) || 1) * f2 * s2, y: B.y, t: 0 }); if (CT.lastRear) AU.thump(); }
    CT.bucking = up; if (bk) CT.lastRear = bk.rear;
    CT.r += (CT.aligned ? -CT_IN : CT_OUT) * dt;
    const [px, py] = ctRing(boy.phi, CT.r); boy.x = px; boy.y = py; boy.face = px < B.x ? 1 : -1;
    if (CT.r <= CT.rMin) {                                     // tamed
      CT.r = CT.rMin; CT.phase = 'done'; CT.phaseT = 0; CT.won = true; CT.hop = { x: boy.x, y: boy.y }; AU.moo(); AU.drumOne();
    } else if (CT.r >= CT.rMax) {                              // broke loose: off it goes, rope and all
      CT.phase = 'chase'; CT.phaseT = 0; CT.breaks++; AU.snort(); AU.moo();
      B.sp = 240; B.turnT = 1.1; B.thTo = B.th; CT.lasso = null;
      CT.puffs.push({ x: B.x, y: B.y, t: 0 }, { x: B.x - 30, y: B.y + 6, t: 0 });
    }
  } else if (CT.phase === 'done') {
    // the boy hops up onto its back and plays his flute
    B.nod = Math.sin(CT.t * 1.5) * .04; B.th += ctWrap((Math.cos(B.th) >= 0 ? 0 : Math.PI) - B.th) * Math.min(1, dt * 3);   // turns side-on for the picture
    const k = Math.min(1, CT.phaseT / .6), s = ctSc(B.y), tx = B.x - Math.cos(B.th) * 8 * s, ty = B.y - 88 * s;
    boy.x = CT.hop.x + (tx - CT.hop.x) * k; boy.y = CT.hop.y + (ty - CT.hop.y) * k - Math.sin(k * Math.PI) * 50; boy.face = Math.cos(B.th) >= 0 ? 1 : -1;
    if (k >= 1 && !CT.tootT) { CT.tootT = 1; [79, 81, 84, 81].forEach((m, i) => setTimeout(() => AU.pluck(m), i * 180)); }
    if (CT.phaseT > 1.4 && CT.onWin) { const cb = CT.onWin; CT.onWin = null; cb(); }
  }
}
function ctCatch() {
  const B = CT.B, boy = CT.boy;
  CT.lasso = null; CT.phase = 'tug'; CT.phaseT = 0; CT.walked = false; AU.moo(); AU.drumOne();
  boy.phi = Math.atan2((boy.y - CT.C.y) / CT_K, boy.x - CT.C.x);   // he comes to the ring on his own side
  CT.r = CT.rMax * .78;
  CT.tug = { bx: B.x, by: B.y, x: boy.x, y: boy.y, th: B.th, th2: boy.phi + Math.PI * .6 };   // it ends up looking off to one side
}

/* ---------- input ---------- */
function ctDown(x, y) {
  if (CT.phase !== 'chase' || CT.lasso || CT.won) return false;
  const [hx, hy] = ctHand(), d = Math.hypot(x - hx, y - hy);
  CT.lasso = { x0: hx, y0: hy, x1: x, y1: y, t: 0, T: .7 + d / 1100, st: 'fly' }; CT.throws++; CT.idle = 0;
  CT.boy.face = x >= CT.boy.x ? 1 : -1; AU.swoosh();
  return true;
}

/* ---------- drawing ---------- */
// the bucking while roped: k > 0 rears (front up, pivoting on the hind feet), k < 0 kicks (hind up, on the front feet);
// wilder as the ring closes. Returns null when it is not bucking.
function ctBuck(B) {
  if (CT.phase !== 'tame' && CT.phase !== 'tug') return null;
  const sc = ctSc(B.y), c = Math.cos(B.th), side = c >= 0 ? 1 : -1, f = .45 + .55 * Math.abs(c);
  const prog = CT.phase === 'tame' ? Math.max(0, 1 - (CT.r - CT.rMin) / (CT.rMax - CT.rMin)) : 0;
  const k = Math.sin(CT.t * (6.5 + prog * 2.5)), amp = .75 + prog * .5, rear = k > 0;
  return { k, rear, amp, px: B.x + (rear ? -44 : 40) * side * f * sc, py: B.y,
    rot: -k * .4 * amp * side * Math.max(.25, Math.abs(c)), lift: Math.abs(k) * 16 * sc * amp };
}
// a point on the buffalo, moved the way the bucking moves the body
function ctBuckPt(B, [x, y]) {
  const b = ctBuck(B); if (!b) return [x, y];
  const cs = Math.cos(b.rot), sn = Math.sin(b.rot), dx = x - b.px, dy = y - b.py;
  return [b.px + dx * cs - dy * sn, b.py + dx * sn + dy * cs - b.lift];
}
function ctBuffalo(g, B) {
  const A = ctArt(), sc = ctSc(B.y), c = Math.cos(B.th), s = Math.sin(B.th), side = c >= 0 ? 1 : -1, f = .45 + .55 * Math.abs(c);
  const x = B.x, y = B.y, sx = side * f * sc, frontal = Math.abs(c) <= .42;
  g.fillStyle = 'rgba(29,25,21,.16)'; g.beginPath(); g.ellipse(x, y + 2, 74 * sc * f + 14 * sc, 13 * sc, 0, 0, 6.283); g.fill();
  const head = () => {
    const [hx, hy] = ctHead(B);
    if (!frontal) dp(g, A.headSide, hx, hy, B.nod * side, side * sc, sc);
    else dp(g, s > 0 ? A.headFront : A.headBack, hx, hy, B.nod * .5, sc, sc);
  };
  const tail = () => dp(g, A.tail, x - c * 70 * sc, y - 86 * sc, Math.sin(CT.t * 3) * .25 * side + (bk ? -bk.k * .6 * side : 0), sc, sc);
  const bk = ctBuck(B);
  g.save();
  if (bk) { g.translate(0, -bk.lift); g.translate(bk.px, bk.py); g.rotate(bk.rot); g.translate(-bk.px, -bk.py); }
  if (frontal && s < 0) head();                        // walking away: the head is behind the body
  if (!(frontal && s < 0)) tail();
  const gait = CT.phase === 'chase' || CT.phase === 'tug' ? 1 : .35;
  [-50, 48, -34, 32].forEach((lx, i) => {             // far legs first, then near ones
    const px = x + lx * sx, sw = Math.sin(B.ph + (i % 2 ? Math.PI : 0) + (i > 1 ? 1.2 : 0)) * 9 * gait * sc * side;
    let fx = px + sw, fy = y - 2;
    if (bk && (lx > 0) === bk.rear) {                // the lifted pair: forelegs tucked up when rearing, hind legs kicked out back
      const e = Math.abs(bk.k);
      if (lx > 0) { fx = px + side * f * 18 * sc * e; fy = y - 2 - 28 * sc * e; } else { fx = px - side * f * 34 * sc * e; fy = y - 2 - 20 * sc * e; }
    }
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 13 * sc; g.beginPath(); g.moveTo(px, y - 44 * sc); g.lineTo(fx, fy); g.stroke();
    g.strokeStyle = i < 2 ? '#7a2a22' : '#a3332a'; g.lineWidth = 8.5 * sc; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(fx, fy, 6.5 * sc, 4 * sc, 0, 0, 6.283); g.fill();
  });
  dp(g, A.body, x, y, 0, sx, sc);
  if (frontal && s < 0) tail();
  if (!(frontal && s < 0)) head();
  g.restore();
}
function ctBoy(g, target) {
  const A = ctArt(), b = CT.boy, sc = ctSc(CT.phase === 'done' ? CT.B.y : b.y), sitting = CT.phase === 'done' && CT.phaseT > .6;
  const sw = b.moving || CT.phase === 'tug' ? Math.sin(b.ph) * 7 : 0;
  g.save(); g.translate(b.x, b.y - (b.moving ? Math.abs(Math.sin(b.ph)) * 3 : 0)); g.scale(b.face * sc, sc);
  if (!sitting) for (const [lx, s2] of [[-6, sw], [6, -sw]]) { g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx, -18); g.lineTo(lx + s2, 0); g.stroke(); g.strokeStyle = '#f2ecde'; g.lineWidth = 3.8; g.stroke(); }
  dp(g, A.boy, 0, 0);
  if (sitting) dp(g, A.flute, 10, -76, .5);
  g.restore();
  // the arm reaching along the rope (or holding the flute up)
  const shx = b.x + b.face * 6 * sc, shy = b.y - 64 * sc;
  let ax = b.face, ay = .3;
  if (target) { const dx = target[0] - shx, dy = target[1] - shy, d = Math.hypot(dx, dy) || 1; ax = dx / d; ay = dy / d; }
  if (sitting) { ax = b.face * .7; ay = -.5; }
  const ex = shx + ax * 24 * sc, ey = shy + ay * 24 * sc;
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 8 * sc; g.beginPath(); g.moveTo(shx, shy); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#f2ecde'; g.lineWidth = 4.6 * sc; g.stroke();
  return [ex, ey];
}
function ctRope(g, x0, y0, x1, y1, sag) {
  g.strokeStyle = INK; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1); g.stroke();
  g.strokeStyle = '#b57a22'; g.lineWidth = 1.4; g.stroke();
}
function ctLoop(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.ellipse(0, 0, 20 * s, 9 * s, rot, 0, 6.283); g.stroke();
  g.strokeStyle = '#b57a22'; g.lineWidth = 1.5; g.stroke(); g.restore();
}
function ctRender(g) {
  const A = ctArt(), W = CT.W, H = CT.H, B = CT.B, boy = CT.boy;
  dp(g, c3Mound(W * .96), W / 2, CT.top + 10, 0, 1, .55);            // the far bank
  const tx = ctText();                                                 // the inscription in the empty sky, top right as on the print
  if (tx) { const p = H > W, h = Math.min(p ? 200 : 150, CT.top - (p ? 100 : 60)), w = h * tx.width / tx.height; g.drawImage(tx, W - w - (p ? 40 : W * .12), CT.top - h - (p ? 24 : 14), w, h); }
  for (const t of CT.tufts) dp(g, A.tuft, t.x, t.y, 0, t.f * t.s * ctSc(t.y), t.s * ctSc(t.y));
  // the rope ring on the ground: the outer ring is where it breaks loose; the drawn-in one shows how close it is to tamed
  if (CT.phase === 'tame' || CT.phase === 'tug') {
    g.save(); g.setLineDash([6, 8]); g.strokeStyle = 'rgba(29,25,21,.45)'; g.lineWidth = 2; g.beginPath(); g.ellipse(CT.C.x, CT.C.y, CT.rMax, CT.rMax * CT_K, 0, 0, 6.283); g.stroke(); g.restore();
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.ellipse(CT.C.x, CT.C.y, CT.r, CT.r * CT_K, 0, 0, 6.283); g.stroke();
    g.strokeStyle = CT.phase === 'tug' ? '#b57a22' : '#a3332a'; g.lineWidth = 5.5; g.stroke();
    if (CT.phase === 'tame') {                                         // the ring is parametrised like ctRing, so the arc lines up with it
      const th = CT.B.th, on = CT.aligned;
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = on ? 15 : 12; g.beginPath(); g.ellipse(CT.C.x, CT.C.y, CT.r, CT.r * CT_K, 0, th - CT_ALIGN, th + CT_ALIGN); g.stroke();
      g.strokeStyle = on ? '#3f8a5f' : '#2f6a4c'; g.lineWidth = on ? 10 : 7.5; g.stroke(); g.lineCap = 'butt';
    }
  }
  for (const p of CT.puffs) { const k = p.t / .6; g.globalAlpha = .5 * (1 - k); g.fillStyle = '#c3b596'; for (let j = -1; j <= 1; j++) { g.beginPath(); g.arc(p.x + j * 16 * (1 + k), p.y - 6 - k * 14, 8 + k * 10, 0, 6.283); g.fill(); } g.globalAlpha = 1; }
  // depth order: whoever is further up the field is drawn first
  const roped = CT.phase === 'tug' || CT.phase === 'tame', neck = ctBuckPt(B, ctNeck(B)), L = CT.lasso;
  let lp = null;
  if (L) {
    if (L.st === 'fly') {                                           // up high, then down on to the spot (its shadow marks where)
      const k = Math.min(1, L.t / L.T), e = k;
      lp = [L.x0 + (L.x1 - L.x0) * e, L.y0 + (L.y1 - L.y0) * e - Math.sin(k * Math.PI) * (170 + Math.hypot(L.x1 - L.x0, L.y1 - L.y0) * .25)];
      g.fillStyle = 'rgba(29,25,21,.2)'; g.beginPath(); g.ellipse(L.x1, L.y1, 20 * (.5 + k * .5), 8 * (.5 + k * .5), 0, 0, 6.283); g.fill();
    }
    else if (L.st === 'drop') lp = [L.x1, L.y1];
    else { const k = L.t / .3, [hx, hy] = ctHand(); lp = [L.x1 + (hx - L.x1) * k, L.y1 + (hy - L.y1) * k]; }
  }
  const drawBoy = () => { const hand = ctBoy(g, roped ? neck : lp); if (roped) ctRope(g, hand[0], hand[1], neck[0], neck[1], 20); else if (lp) { ctRope(g, hand[0], hand[1], lp[0], lp[1], L.st === 'fly' ? -20 : 12); ctLoop(g, lp[0], lp[1], L.st === 'back' ? .6 : 1, L.st === 'fly' ? CT.t * 9 : 0); } };
  if (CT.phase === 'done') { ctBuffalo(g, B); drawBoy(); }
  else if (boy.y < B.y) { drawBoy(); ctBuffalo(g, B); }
  else { ctBuffalo(g, B); drawBoy(); }
  if (roped) ctLoop(g, neck[0], neck[1] + 4, .8, 0);                // the loop round its neck
}

function ctOverlay(g, W, H) {
  if (CT.howK < .02) return;
  const A = howtoArt(), t = CT.t, k = CT.howK, Z = Math.min(1.35, Math.max(1.1, W / 420));
  g.save(); g.setTransform(DPR * Z, 0, 0, DPR * Z, (34 + 35 * Z) * DPR, (H - 34 - 35 * Z + (1 - k) * 18) * DPR); g.globalAlpha = k;
  const ph = (t % 1.2) / 1.2, tap = ph < .18;                          // a click every 1.2 s
  if (isTouch) {
    const lift = tap ? 0 : Math.sin(ph * Math.PI) * 6;
    if (tap) { g.strokeStyle = INK; g.lineWidth = 1.6; for (const r of [9, 15]) { g.globalAlpha = k * (1 - ph / .18); g.beginPath(); g.arc(-3, -30, r, 0, 6.283); g.stroke(); } g.globalAlpha = k; }
    dp(g, A.finger, 0, -27 - lift, -.15, .62, .62);
  } else {
    const bob = tap ? 1.5 : Math.sin(t * 3) * 1.2;
    dp(g, A.mouse, 0, -9 + bob, Math.sin(t * 2) * .05, .72, .72);
    if (tap) dp(g, A.click, 0, -9 + bob, Math.sin(t * 2) * .05, .72, .72);
  }
  g.restore();
}

C3GAMES[2] = {
  han: '牧牛', name: 'Chăn Trâu', paper: 'white',
  short: portrait => portrait ? 460 : 600,
  print: 'img/ch3/chan-trau.png',                  // the reward: the real Đông Hồ print
  // the ◀ ▶ buttons only once it is roped, one at each side; they pulse until the boy first walks the ring
  padOn: () => CT.phase === 'tug' || CT.phase === 'tame', padPulse: () => !CT.walked,
  overlay: ctOverlay,
  song: 4,
  isWon: () => CT.won,
  praise: () => CT.breaks === 0 && CT.throws === 1 ? 'Tài quá! Ném một lần là trúng!' : 'Giỏi lắm! Trâu đã ngoan rồi!',
  start: ctStart, update: ctUpdate, render: ctRender,
  printRender(g, W, H) { g.fillStyle = '#f2ecde'; g.fillRect(W / 2 - 140, H / 2 - 180, 280, 360); },
  down: ctDown, move() {}, up() {},
  resize(W, H) {
    const sx = W / CT.W, sy = H / CT.H; CT.W = W; CT.H = H; if (!CT.B) return; ctLayout();
    for (const o of [CT.B, CT.boy]) { o.x *= sx; o.y *= sy; }
    CT.lasso = null;
  },
  onWin(f) { CT.onWin = f; },
};
