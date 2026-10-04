/* Chương III · tranh 5 · Đánh Đu (owner's design, after the Đông Hồ print "Đánh đu").
   A young man and a young woman stand face to face on the board of a tall bamboo swing; prizes hang on a line above,
   children with a parasol watch from behind a red railing. The swing starts still. Pump it up to the crossbar:
   a dial below has a needle going round and orange bands that appear at random places and shrink away. Tap (click)
   while the needle is inside a band: a pump — the man (right) first, then the woman, in turn — the needle turns back
   and goes a little faster. A tap outside a band slows the needle and the swing loses some height. The higher the
   swing, the faster it bleeds height, the faster the bands shrink and the more bands there are.
   Up to the bar within 3 minutes wins (record = fastest time); the time left is shown in the middle of the dial. */
const DD = { W: 460, H: 995, t: 0, A: 0, ph: 0, onWin: null, onFail: null };
const DD_TOP = 1.5, DD_LIMIT = 180, DD_T = 2.7;
let DD_RND = [.7, .6], DD_NARROW = .45;                                       // band size: random spread; how much a fast needle narrows them
const DD_SPMAX = 5.2, DD_SP0 = 2.3, DD_CALM = 3.5;                       // start speed; seconds to win back the speed after a miss                                                          // owner: the needle must not get too fast later on
let DD_GAIN = .1, DD_BLEED = .026, DD_LIFE = [4.6, 1.6], DD_WIDE = [.42, 0];   // bots: sharp ~30 s, good mostly win ~1 min, average about half
let DD_QUICK = .7, DD_SLOW = 3, DD_KMAX = 1.2, DD_KMIN = .4;
let DD_TOPBLEED = .15, DD_TOPMISS = .03;    // owner: .06 too harsh, .015 too easy                                                         // near the top it bleeds slower, so the 2% / 1% pumps can still climb

/* ---------- art ---------- */
let DDART = null;
function ddArt() {
  if (DDART) return DDART;
  const skin = 'white';
  // feet at (0,0), standing up the y axis (-y), face to +x; about 120 tall; arms up to the rope at x≈10
  const person = (top, low, hat, long) => part([-34, -132, 34, 4], a => {
    a.fk(low, smooth(long ? [[-16, -58], [12, -58], [18, -4], [-18, -4]] : [[-12, -56], [10, -56], [12, -4], [2, -4], [0, -40], [-4, -4], [-14, -4]]), 2);   // skirt / trousers
    a.fk('dark', ell(-6, -2, 9, 4), 1.4); a.fk('dark', ell(8, -2, 9, 4), 1.4);                                                      // feet
    a.fk(top, smooth([[-15, -100], [13, -102], [18, -60], [16, long ? -50 : -40], [-18, long ? -50 : -40], [-18, -64]]), 2.2);       // tunic
    a.key(smooth([[-2, -100], [0, -64]], false), 1); if (!long) a.fill('red', smooth([[-6, -98], [6, -98], [4, -80], [-4, -80]]));   // the yếm under her tunic
    a.fk(skin, tube([[-8, -96], [0, -112], [8, -128]], 7, 6), 1.6); a.fk(skin, tube([[10, -96], [14, -112], [10, -128]], 7, 6), 1.6);   // both arms up the rope
    a.fk(skin, circ(4, -114, 13), 2.2);                                                                                              // head
    a.key(smooth([[8, -116], [11, -114], [14, -116]], false), 1.2); a.key(smooth([[9, -108], [12, -106], [15, -108]], false), 1);
    a.fill('red', ell(10, -110, 2.6, 1.8));
    if (hat === 'khan') a.fk('dark', smooth([[-10, -120], [-4, -128], [8, -129], [17, -122], [15, -117], [-9, -114]]), 1.6);         // his turban
    else { a.fk('dark', smooth([[-11, -116], [-6, -128], [10, -129], [17, -121], [14, -115], [-6, -110]]), 1.6); a.ink(smooth([[-12, -112], [-16, -100], [-10, -96], [-8, -108]])); }   // her scarf and hair
  });
  const kid = (col, um) => part([-40, -120, 40, 4], a => {
    if (um) { a.fk('dark', tube([[14, -14], [14, -96]], 3, 3), 1); a.fk('red', smooth([[-22, -94], [14, -116], [50, -94], [32, -92], [14, -98], [-4, -92]]), 2); a.fk('white', smooth([[4, -100], [14, -116], [24, -100], [14, -97]]), 1.2); }
    a.fk(col, smooth([[-14, -6], [-16, -34], [14, -36], [16, -6]]), 2);
    a.fk(skin, circ(0, -48, 13), 2);
    a.ink(smooth([[-4, -62], [0, -66], [4, -62]]));
    a.key(smooth([[2, -48], [6, -45], [10, -48]], false), 1.2); a.fill('red', ell(8, -42, 3, 2));
  });
  const shoe = part([-10, -4, 10, 14], a => { a.fk('red', smooth([[-8, 0], [8, 0], [9, 10], [-9, 10]]), 1.6); a.fk('dark', smooth([[-8, 8], [8, 8], [9, 12], [-9, 12]]), 1.2); });
  const purse = part([-12, -4, 12, 22], a => { a.fk('green', smooth([[-10, 4], [10, 4], [12, 18], [-12, 18]]), 1.8); a.key(smooth([[-4, 4], [0, -2], [4, 4]], false), 1.2); a.fill('yellow', ell(0, 11, 3, 3)); });
  const bag = part([-12, -4, 12, 26], a => { a.fk('white', smooth([[-8, 2], [8, 2], [11, 22], [-11, 22]]), 1.8); a.fill('red', smooth([[-9, 10], [9, 10], [10, 14], [-10, 14]])); });
  const fan = part([-14, -4, 14, 20], a => { a.fk('yellow', smooth([[0, 18], [-13, 4], [-6, 0], [6, 0], [13, 4]]), 1.6); for (const x of [-6, 0, 6]) a.key(smooth([[0, 18], [x, 2]], false), 1); });
  DDART = { man: person('red', 'green', 'khan', false), woman: person('green', 'dark', 'vay', true), kids: [kid('green', false), kid('red', true), kid('green', false)], prizes: [shoe, purse, bag, fan, shoe, bag, purse] };
  return DDART;
}

/* ---------- layout ---------- */
function ddLayout() {
  const p = DD.H > DD.W;
  if (p) {
    DD.L = Math.min(DD.W * .44, DD.H * .27); DD.piv = { x: DD.W / 2, y: DD.H * .12 + 40 };
    DD.ground = DD.piv.y + DD.L + 64;
    DD.dial = { x: DD.W / 2, y: Math.max(DD.ground + 100 + DD.W * .36, DD.H * .72), r: Math.min(DD.W * .36, DD.H * .17) };
  } else {
    DD.L = Math.min(DD.H * .4, DD.W * .2); DD.piv = { x: DD.W * .33, y: DD.H * .12 + 30 };
    DD.ground = DD.piv.y + DD.L + 64;
    DD.dial = { r: Math.min(DD.H * .3, DD.W * .16) }; DD.dial.x = DD.W - DD.dial.r - 50; DD.dial.y = DD.H * .52;
  }
  DD.right = p ? DD.W : DD.dial.x - DD.dial.r - 24;                       // the scene stops short of the dial on a wide screen
}
function ddStart() {
  ddLayout();
  Object.assign(DD, { t: 0, A: 0, ph: 0, done: false, failed: false, doneT: 0, who: 0, pump: [0, 0], n: 0, hits: 0, miss: 0,
    ang: -Math.PI / 2, dir: 1, sp: DD_SP0, bands: [], flash: 0, stall: -1, shake: 0, calm: 0, lastHit: null, combo: 1, flashOk: false, taps: 0 });
  ddBands();
}
const ddH = () => Math.min(1, DD.A / DD_TOP);                   // how high, 0..1
// keep as many bands as the height asks for; each starts wide and shrinks away (faster when higher)
function ddBands() {
  const want = 1 + Math.floor(Math.min(3, ddH() * 3.4) * (1 - DD.calm));   // after a miss: fewer bands, like at the start, coming back as it recovers
  while (DD.bands.length < want) {
    let a = 0;
    for (let k = 0; k < 20; k++) { a = R() * 6.283; const far = d => Math.abs(Math.atan2(Math.sin(a - d), Math.cos(a - d))); if (far(DD.ang) > .9 && DD.bands.every(b => far(b.a) > .7)) break; }
    const life = DD_LIFE[0] - DD_LIFE[1] * ddH() * (1 - DD.calm) + R() * .8;
    DD.bands.push({ a, w0: (DD_WIDE[0] - DD_WIDE[1] * ddH() * (1 - DD.calm)) * (DD_RND[0] + R() * DD_RND[1]) * (1 - DD_NARROW * ddFast()), life, t: 0, born: 0 });
  }
}
const ddFast = () => ddH() * (1 - DD.calm);                                  // owner: band size and needle speed follow the swing's height (%), eased after a miss
const ddW = b => Math.max(0, b.w0 * (1 - b.t / b.life));        // half-width now
function ddUpdate(dt) {
  DD.t += dt;
  if (keys.has('Space') || keys.has('Enter')) { if (!DD.kd) { DD.kd = true; ddTap(); } } else DD.kd = false;   // a key taps too, on computers
  // the swing: a pendulum whose reach A is pumped up by good taps and bleeds away, faster the higher it is
  if (!DD.done) DD.A = Math.max(0, DD.A - (.003 + DD_BLEED * DD.A * DD.A) * (ddH() >= .9 ? DD_TOPBLEED : 1) * dt);
  DD.ph += dt * 6.283 / DD_T;
  DD.pump = DD.pump.map(v => Math.max(0, v - dt));
  DD.flash = Math.max(0, DD.flash - dt);
  if (DD.done) { DD.doneT += dt; if (DD.doneT > 1.6 && DD.onWin) { const cb = DD.onWin; DD.onWin = null; cb(); } return; }
  if (DD.failed) return;
  if (typeof C3 !== 'undefined' && C3.time >= DD_LIMIT) { DD.failed = true; return; }   // the shell ends the round (timeLimit)
  // the needle and the bands
  DD.shake = Math.max(0, (DD.shake || 0) - dt);
  DD.stall = Math.max(-1, DD.stall - dt);
  if (DD.stall <= 0) DD.calm = Math.max(0, DD.calm - dt / DD_CALM);
  const spNow = DD_SP0 + (DD_SPMAX - DD_SP0) * ddFast();                      // the higher the swing, the faster; after a miss it starts slow again and works back up
  if (DD.stall <= 0) DD.ang = (DD.ang + DD.dir * spNow * Math.min(1, -DD.stall * 3.3) * dt) % 6.283;
  for (const b of DD.bands) b.t += dt * (1 + ddH() * .6 * (1 - DD.calm));
  DD.bands = DD.bands.filter(b => ddW(b) > .035);
  ddBands();
}
function ddTap() {
  if (DD.done || DD.failed || DD.stall > 0) return;                           // while the needle is stuck, taps do nothing
  DD.taps++;
  const hit = DD.bands.find(b => { const d = Math.abs(Math.atan2(Math.sin(DD.ang - b.a), Math.cos(DD.ang - b.a))); return d <= ddW(b) + .03; });
  if (hit) {
    DD.bands.splice(DD.bands.indexOf(hit), 1);
    DD.dir = -DD.dir;
    // a pump: the first one sets the swing going to the left (the man on the right pushes off), then each adds reach
    if (DD.A < .02) DD.ph = 0;
    // owner: hits in quick succession lift more, a long wait since the last one lifts less (×DD_KMAX within DD_QUICK s … ×DD_KMIN after DD_SLOW s)
    const gap = DD.lastHit == null ? DD_SLOW / 2 : DD.t - DD.lastHit, k = DD_KMAX - (DD_KMAX - DD_KMIN) * Math.max(0, Math.min(1, (gap - DD_QUICK) / (DD_SLOW - DD_QUICK)));
    DD.lastHit = DD.t; DD.combo = k;
    DD.A = Math.min(DD_TOP, DD.A + (ddH() >= .95 ? Math.min(1, k) * DD_TOP * .01 : k * (ddH() >= .9 ? DD_TOP * .02 : DD_GAIN)));   // from 90% a pump adds 2% (at an even pace); from 95% 1% at the very most (owner)
    if (DD.A >= DD_TOP - 1e-9) { DD.done = true; AU.pluck(88); setTimeout(() => AU.pluck(93), 150); setTimeout(() => AU.pluck(98), 300); }
    DD.pump[DD.who] = .35; DD.who = 1 - DD.who; DD.hits++;
    DD.flash = .25; DD.flashOk = true; AU.knock(1); AU.pluck(79 + Math.round(ddH() * 12));
    ddBands();
  } else {
    DD.A = Math.max(0, DD.A - (ddH() >= .9 ? DD_TOP * DD_TOPMISS : .09)); DD.miss++; DD.calm = 1;   // near the top a miss costs less (owner: the last 10% was too harsh)
    DD.bands = []; ddBands();                                                // the bands go; one fresh wide one, as at the start
    DD.stall = .55; DD.shake = .4;                                         // owner: the needle stops dead like a crash, the dial shakes, then it goes on
    DD.flash = .25; DD.flashOk = false; AU.knock(1); AU.thump();
  }
}

/* ---------- drawing ---------- */
function ddRender(g) {
  const A = ddArt(), P = DD.piv, L = DD.L, gy = DD.ground, th = -DD.A * Math.sin(DD.ph);   // +th: to the right
  // the prize line: from high on the left to high on the right, things swinging under it
  const ly = P.y - 34, lx0 = 20, lx1 = DD.right - 20;
  g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.moveTo(lx0, ly + 10); g.quadraticCurveTo(DD.W / 2, ly + 30, lx1, ly + 10); g.stroke();
  A.prizes.forEach((pz, i) => { const k = (i + .5) / A.prizes.length, x = lx0 + (lx1 - lx0) * k, y = ly + 10 + Math.sin(k * Math.PI) * 18; if (Math.abs(x - P.x) < 26) return; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 8); g.stroke(); dp(g, pz, x, y + 8, Math.sin(DD.t * 1.3 + i) * .12, 1.1, 1.1); });
  // the ground and the children behind the railing
  g.fillStyle = 'rgba(91,47,31,.16)'; g.fillRect(0, gy, DD.right, 26);
  const kx = [P.x - L * 1.05, P.x + L * .62, P.x + L * 1.12];
  A.kids.forEach((k, i) => dp(g, k, Math.max(40, Math.min(DD.right - 40, kx[i])), gy + 10, Math.sin(DD.t * 2 + i) * .03, 1, 1));
  // the bamboo frame: two tall poles leaning in to the top, crossing just over the pivot
  const foot = L * .62;
  for (const s of [-1, 1]) {
    g.strokeStyle = INK; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(P.x + s * foot, gy + 6); g.lineTo(P.x - s * 14, P.y - 16); g.stroke();
    g.strokeStyle = PL.straw[0]; g.lineWidth = 7; g.beginPath(); g.moveTo(P.x + s * foot, gy + 6); g.lineTo(P.x - s * 14, P.y - 16); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 1.2; for (let k = .15; k < 1; k += .17) { const x = P.x + s * foot + (-s * 14 - s * foot) * k, y = gy + 6 + (P.y - 16 - gy - 6) * k; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.stroke(); }
  }
  g.fillStyle = PL.red[0]; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(P.x, P.y, 6, 0, 6.283); g.fill(); g.stroke();
  // the swing: ropes to the board, the couple standing face to face (she on the left, he on the right)
  g.save(); g.translate(P.x, P.y); g.rotate(-th);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-3, 0); g.lineTo(-30, L); g.moveTo(3, 0); g.lineTo(30, L); g.stroke();
  const s = L / 175;
  const fig = (art, x, face, k) => { const sq = 1 - .16 * Math.sin(Math.min(1, k / .35) * Math.PI); g.save(); g.translate(x, L); g.scale(face * s, s * sq); dp(g, art, 0, 0, 0, 1, 1); g.restore(); };
  fig(A.woman, -22, 1, DD.pump[1]); fig(A.man, 22, -1, DD.pump[0]);
  g.fillStyle = PL.brown[0]; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(-42, L, 84, 8); g.strokeRect(-42, L, 84, 8);
  g.restore();
  // the red railing in front, like the print
  const ry = gy + 30;
  g.fillStyle = PL.red[0]; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(0, ry, DD.right, 9); g.strokeRect(-2, ry, DD.right + 4, 9);
  for (let x = 14; x < DD.right - 6; x += 22) { g.fillStyle = (x / 22) % 2 < 1 ? PL.green[0] : '#f2ecde'; g.fillRect(x - 5, ry + 9, 10, 26); g.strokeRect(x - 5, ry + 9, 10, 26); }
  g.fillStyle = PL.red[0]; g.fillRect(0, ry + 35, DD.right, 8); g.strokeRect(-2, ry + 35, DD.right + 4, 8);
  ddDrawDial(g);
}
function ddDrawDial(g) {
  const { x, y, r } = DD.dial, r0 = r * .56, r1 = r * .9, sh = (DD.shake || 0) / .4;
  g.save(); g.translate(x + Math.sin(DD.t * 70) * 7 * sh, y + Math.cos(DD.t * 53) * 4 * sh); g.rotate(Math.sin(DD.t * 61) * .04 * sh);
  // the wooden rim and the dark track
  g.fillStyle = PL.brown[0]; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#2a221d'; g.beginPath(); g.arc(0, 0, r1, 0, 6.283); g.fill(); g.lineWidth = 1.6; g.stroke();
  for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; g.strokeStyle = 'rgba(242,236,222,.25)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(Math.cos(a) * r1 * .96, Math.sin(a) * r1 * .96); g.lineTo(Math.cos(a) * r1 * .9, Math.sin(a) * r1 * .9); g.stroke(); }
  // the bands: orange with a yellow heart
  for (const b of DD.bands) {
    const w = ddW(b), born = Math.min(1, b.t * 5);
    g.globalAlpha = born; g.fillStyle = '#d97b2a'; g.beginPath(); g.arc(0, 0, r1 - 3, b.a - w, b.a + w); g.arc(0, 0, r0 + 3, b.a + w, b.a - w, true); g.closePath(); g.fill();
    g.fillStyle = '#f2c640'; g.beginPath(); g.arc(0, 0, r1 - 10, b.a - w * .55, b.a + w * .55); g.arc(0, 0, r0 + 10, b.a + w * .55, b.a - w * .55, true); g.closePath(); g.fill();
    g.globalAlpha = 1;
  }
  // the needle
  const nc = DD.flash > 0 ? (DD.flashOk ? '#f2c640' : '#c73a1e') : '#f2ecde';
  g.strokeStyle = nc; g.lineWidth = DD.flash > 0 ? 6 : 4.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(Math.cos(DD.ang) * (r0 + 2), Math.sin(DD.ang) * (r0 + 2)); g.lineTo(Math.cos(DD.ang) * (r1 - 2), Math.sin(DD.ang) * (r1 - 2)); g.stroke();
  // the hub: time left, and how high the swing is as a red arc round it
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = PL.red[0]; g.lineWidth = 6; g.lineCap = 'butt'; g.beginPath(); g.arc(0, 0, r0 - 8, -Math.PI / 2, -Math.PI / 2 + ddH() * 6.283); g.stroke();
  const left = Math.max(0, DD_LIMIT - (typeof C3 !== 'undefined' ? C3.time : 0)), sec = Math.ceil(left);
  g.fillStyle = left <= 20 ? '#c73a1e' : INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${Math.round(r0 * .44)}px "Playfair Display", serif`; g.fillText(c3Clock(sec), 0, -r0 * .06);
  g.fillStyle = PL.red[0]; g.font = `700 ${Math.round(r0 * .17)}px "Be Vietnam Pro", sans-serif`; g.fillText(Math.round(ddH() * 100) + '%', 0, r0 * .38);
  g.restore();
}
// until the first good tap: a finger tapping on the dial
function ddOverlay(g, W, H) {
  if (DD.hits || DD.done) return;
  const u = c3Size().u, x = (DD.dial.x + DD.dial.r * .3) * u, y = (DD.dial.y + DD.dial.r * .35) * u, k = (DD.t * 1.4) % 1, press = k < .2;
  g.save(); g.globalAlpha = .9; dp(g, c3HandArt().point, x, y + (press ? 6 : 0), -.28, 1.1 * u, 1.1 * u);
  if (press) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 4 * u, 14 * u * (1 + k * 3), 0, 6.283); g.stroke(); }
  g.restore();
}
function ddPrint(g, W, H, k) {
  g.save(); g.globalAlpha = Math.min(1, k * 5); g.fillStyle = '#f2ecde'; g.fillRect(W * .15, H * .2, W * .7, H * .5); g.restore();
}

C3GAMES[4] = {
  han: '鞦韆', name: lg('Đánh Đu', 'Swinging High'), paper: 'pink', song: 10,
  timeLimit: DD_LIMIT, passed: () => DD.done, ownClock: true,
  failText: () => lg('Hết giờ! Đu chưa lên tới xà.', "Time's up! The swing never reached the bar."),
  praise: () => DD.miss === 0 ? lg('Nhịp nhàng quá! Không trượt nhịp nào!', 'Perfect rhythm! Not one miss!') : lg('Đu lên tới xà rồi! Giỏi quá!', 'Up to the bar! Well done!'),
  print: 'img/ch3/danh-du.jpg',
  start: ddStart, update: ddUpdate, render: ddRender, overlay: ddOverlay, printRender: ddPrint,
  isWon: () => DD.done,
  down() { ddTap(); return true; }, move() {}, up() {},
  resize(W, H) { DD.W = W; DD.H = H; ddLayout(); },
  onWin(f) { DD.onWin = f; }, onFail(f) { DD.onFail = f; },
};
