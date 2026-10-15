/* Chương IV phần 2 · Phố Huyện: the game. A first version to build the new rules on (owner: part 2 will have many mechanics of its
   own): a day in the town from 6:00 to 21:00 (the evening runs slower and the lanterns light up), townsfolk along the street, some
   come to the couple's house and buy betel from the wife at the counter; the house's sheet buys betel and sets the price; a tally at
   night; flower lanterns on the river after dark (art.js). Drawing of the town: art.js; state and save: state.js. */

// ---------- the folk: part 2's own mouse drawing (after part 1's, with the town's dress) ----------
const P4_TOOL_ARM = { o: -1.2, quat: -1.5, long: -.5, sach: .35, goi: .15 };
const P4_TALL = 168;
function p4Mouse(g, M, x, face, ph, moving, arm = null, carry = null, s = 1, y = GROUND, seed = 0) {
  const sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : 0;
  g.save(); g.translate(x, y); g.scale(face * s, s);
  const hy = -45 + bob, armN = arm === null ? sw * .4 : arm;
  dp(g, M.tail, -18, hy + 2, Math.sin(P4.t * 2.4 + seed) * .12);
  dp(g, M.leg, 6, hy, sw * .55);
  dp(g, M.arm, 2, hy - 50, -sw * .4);
  dp(g, M.body, 0, hy, .04);
  dp(g, M.leg, -2, hy, -sw * .55);
  dp(g, M.head, 6, hy - 60, Math.sin(ph * 2) * .04);
  const ax = 10, ay = hy - 52, hx = ax + 16 * Math.cos(armN) - 31 * Math.sin(armN), hyy = ay + 16 * Math.sin(armN) + 31 * Math.cos(armN);
  if (carry) dp(g, carry, hx + 4, hyy + 6, 0, .9, .9);
  g.restore();
}
function p4Folk(g, w, x, y, s) {
  const sort = C4_MOUSE_SORTS[w.sort], k = s * .92 * (sort.role === 'child' ? .68 : 1), L = w.look || {}, f = w.face;
  const moving = w.st === 'walk' || w.st === 'leave' || w.st === 'go' || (w.st === 'queue' && w.moving);
  const busy = L.tool && L.tool !== 'o' ? L.tool : (w.umb && !p4OnBridge(w.x) ? 'o' : null);
  const arm = busy ? P4_TOOL_ARM[busy] : (w.say ? -.3 - Math.abs(Math.sin(P4.t * 5)) * .4 : null);
  g.save(); g.translate(x, y); if (sort.role === 'old') g.rotate(f * .1);
  p4Mouse(g, w.M, 0, f, w.ph, moving, sort.role === 'old' && !busy ? -.15 : arm, null, k, 0, w.seed);
  g.save(); g.scale(f * k, k);
  if (sort.role !== 'child') p4TownDress(g, w, moving);
  if (busy && busy !== 'o') p4TownThing(g, w, busy);
  if (L.hat === 'quai') {                                                   // nón quai thao
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-26, -140); g.lineTo(-30, -104); g.moveTo(40, -140); g.lineTo(44, -106); g.stroke();
    g.fillStyle = '#e2b43c'; g.fillRect(-33, -106, 6, 8); g.fillRect(41, -108, 6, 8);
    g.fillStyle = '#d9b46a'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(8, -142, 48, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(8, -146, 20, 5, 0, 0, 6.283); g.stroke();
  }
  if (busy === 'o') {                                                       // a silk parasol, held low; folded on the covered bridge
    g.lineCap = 'round'; g.strokeStyle = '#7a4a22'; g.lineWidth = 3; g.beginPath(); g.moveTo(44, -96); g.lineTo(42, -176); g.stroke();
    g.fillStyle = L.umbCol || '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-12, -160); g.quadraticCurveTo(42, -222, 96, -160); g.quadraticCurveTo(69, -168, 42, -160); g.quadraticCurveTo(15, -168, -12, -160); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 1.1; g.beginPath(); for (const x2 of [-12, 15, 42, 69, 96]) { g.moveTo(42, -188); g.lineTo(x2, -161); } g.stroke();
  }
  g.restore();
  if (sort.role === 'old') { g.strokeStyle = INK; g.lineWidth = 6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(f * 32 * k, -92 * k); g.lineTo(f * 44 * k, 0); g.stroke(); g.strokeStyle = '#7a4a22'; g.lineWidth = 3.4 * k; g.stroke(); }
  g.restore();
}
const p4Say = (who, text, life = 1.6 + text.length * .045) => { who.say = { text, t: 0, life }; };
const p4Pick = a => a[(Math.random() * a.length) | 0];

// ---------- the street ----------
const P4_BUSY = [[6, .5], [8, 1], [11, .7], [13, .45], [15, .8], [17, .7], [19, 1], [21, .6]];   // how busy the street is through the day (hour, k)
const p4Busy = () => { const h = P4.mins / 60; for (let i = P4_BUSY.length - 1; i >= 0; i--) if (h >= P4_BUSY[i][0]) return P4_BUSY[i][1]; return .4; };
const P4_CHAT = ['Phố hôm nay đông thật!', 'Tối nay có thả đèn không?', 'Hàng vải bên kia mới về lụa đẹp.', 'Nhà chuột trầu cau ngon lắm đấy!',
  'Thuyền buôn vừa cập bến.', 'Đi qua chùa cầu mát ghê.', 'Mua cái đèn lồng về treo Tết nào.', 'Cao lầu ở đây là nhất phố.', 'Chiều nay trời đẹp quá.'];
const P4_ASK = n => p4Pick([`Cho tôi ${n} miếng trầu.`, `Bán cho ${n} miếng trầu nhé!`, `${n} miếng trầu têm cánh phượng!`]);
function p4Spawn(atX) {
  const kid = Math.random() < .1, old = !kid && Math.random() < .14;
  const sort = kid ? 11 + ((Math.random() * 3) | 0) : old ? p4Pick(C4_OLD_SORTS2) : p4Pick(C4_ADULT_SORTS2);
  const fromRight = Math.random() < .5, V = p4View(), seed = Math.random() * 6;
  const x = atX !== undefined ? atX : fromRight ? P4.camX + V.vw + 120 + Math.random() * 200 : P4.camX - 120 - Math.random() * 200;
  const look = kid ? {} : p4TownLook({ skirt: Math.random() < .5, hat: Math.random() < .25 ? 'quai' : null }, seed);
  // some come for betel: the more so in the busy hours, never children, never when the house is out of it
  const buy = !kid && P4.phase === 'open' && SAVE4B.stock > 0 && Math.random() < .3 * (8 / Math.max(5, SAVE4B.price));
  P4.walkers.push({ sort, M: c4MouseRig(sort), seed, look, umb: look.tool === 'o', x, z: .3 + Math.random() * .62, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1,
    sp: kid ? 85 + Math.random() * 30 : old ? 34 + Math.random() * 10 : 50 + Math.random() * 35, ph: Math.random() * 6, st: 'walk', buy, n: 1 + ((Math.random() * 3) | 0), wait: 0, say: null, cd: 3 + Math.random() * 8 });
}
function p4WalkersUpdate(dt) {
  const V = p4View(), Q = P4.Q, door = P4_HOME, qz = .3;
  for (const w of P4.walkers) {
    if (w.say) { w.say.t += dt; if (w.say.t > w.say.life) w.say = null; }
    if (w.st === 'walk' || w.st === 'leave') {
      w.x += w.dir * w.sp * dt; w.ph += dt * w.sp / 9; w.face = w.dir;
      if (w.st === 'walk' && w.buy && Math.abs(w.x - door) < 140 && Q.length < 6) { w.st = 'go'; Q.push(w); }
      if ((w.cd -= dt) < 0 && !w.say) { w.cd = 8 + Math.random() * 14; if (Math.random() < .35) p4Say(w, p4Pick(P4_CHAT)); }
    } else if (w.st === 'go' || w.st === 'queue') {
      const i = Q.indexOf(w), tx = door + 40 + i * 34, tz = qz + i * .03, dx = tx - w.x, dz = tz - w.z, d = Math.hypot(dx, dz * 300);
      w.moving = d > 3; if (w.moving) { const st = Math.min(d, 70 * dt); w.x += dx / d * st; w.z += dz * 300 / d * st / 300; w.ph += dt * 7; w.face = dx > 0 ? 1 : -1; }
      else { w.st = 'queue'; w.face = -1; }
      w.wait += dt;
      if (w.st === 'queue' && i === 0 && !P4.wife.serving && !w.asked) { w.asked = true; p4Say(w, P4_ASK(w.n)); }
      if (w.wait > 30 && P4.wife.serving !== w) { Q.splice(Q.indexOf(w), 1); w.st = 'leave'; w.dir = w.x < P4.camX + V.vw / 2 ? -1 : 1; p4Say(w, 'Lâu quá, thôi đi chỗ khác.'); }
    }
  }
  P4.walkers = P4.walkers.filter(w => !(w.st !== 'queue' && w.st !== 'go' && (w.x < P4.camX - 500 || w.x > P4.camX + V.vw + 500)));
  // the wife serves the first in the queue
  const W = P4.wife;
  if (W.say) { W.say.t += dt; if (W.say.t > W.say.life) W.say = null; }
  if (!W.serving && Q.length && Q[0].st === 'queue' && Q[0].asked) { W.serving = Q[0]; W.t = 2.2; }
  if (W.serving && (W.t -= dt) <= 0) {
    const w = W.serving, n = Math.min(w.n, SAVE4B.stock);
    if (n > 0) { SAVE4B.stock -= n; SAVE4B.sold = (SAVE4B.sold || 0) + n; P4.today.sold += n; p4Earn(n * SAVE4B.price); P4.fx.push({ x: door, y: p4Y(.12) - 120, s: '+' + n * SAVE4B.price, t: 0 }); p4Say(W, p4Pick(['Trầu đây, mời bác!', 'Của bác đây ạ!', 'Ăn ngon lại ghé nhé!'])); }
    else { p4Say(W, 'Hết trầu mất rồi!'); P4.today.lost++; }
    Q.splice(Q.indexOf(w), 1); w.st = 'leave'; w.dir = Math.random() < .5 ? -1 : 1; W.serving = null; p4Persist(); p4Hud();
  }
}

// ---------- start, the day, leaving ----------
function p4Enter() {                                                       // part 1's button "Lên Phố Huyện"
  if (SAVE4B.house) { c4Hide(); startP4(); return; }
  if (p4Purse() < P4_HOUSE_PRICE) { toast('Cần ' + c4Money(P4_HOUSE_PRICE) + ' để mua nhà trên phố huyện.', 3); return; }
  c4Hide(); startP4(); p4BuySheet();
}
function startP4() {
  AU.init(); AU.setSong(12); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 4; S.mode = 'c4bplay'; document.body.classList.add('c4');
  $('#album').hidden = true; $('#end').hidden = true; $('#chapters').hidden = true; $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  if (!P4.scene) { P4.scene = p4TownScene(mulberry(7)); P4.camX = P4_HOME - p4View().vw * .5; }
  if (P4.day !== SAVE4B.day) p4NewDay();
  $('#p4hud').hidden = false; p4Hud(); if (P4.hoaHold) p4HoaHold(P4.hoaHold); cv.focus();
  if (typeof trackEnter === 'function') trackEnter('chuong-4/pho-huyen');
}
function p4NewDay() {
  Object.assign(P4, { day: SAVE4B.day, mins: P4_OPEN, phase: 'open', walkers: [], Q: [], fx: [], today: { sold: 0, take: 0, spent: 0, lost: 0 } });
  P4.wife = { say: null, serving: null, t: 0 };
  for (let i = 0; i < 18; i++) p4Spawn(P4.camX - 200 + Math.random() * (p4View().vw + 400));
}
function p4Hide() { $('#p4hud').hidden = true; p4Sheets(null); $('#p4hands').hidden = true; document.body.classList.remove('p4holding', 'c4'); }
function p4EndDay() {
  P4.phase = 'night';
  const wilt = SAVE4B.stock; SAVE4B.stock = 0; p4Persist();                // betel does not keep overnight
  $('#p4dayB').innerHTML = `<p>Bán được <b>${P4.today.sold}</b> miếng trầu: <b>${c4Money(P4.today.take)}</b></p><p>Chi: ${c4Money(P4.today.spent)}</p>`
    + (wilt ? `<p class="bad">Trầu thừa héo mất ${wilt} miếng.</p>` : '') + (P4.today.lost ? `<p>${P4.today.lost} khách đến mà hết trầu.</p>` : '')
    + `<p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>`;
  $('#p4dayT').textContent = `Tối ngày ${SAVE4B.day} trên phố huyện`;
  p4Sheets('p4day');
}
function updateP4(dt) {
  P4.t += dt;
  if (P4.paused) return;
  if (P4.phase === 'open') {
    P4.mins += dt * P4_MPS * (P4.mins >= 18 * 60 ? .4 : 1);              // the evening lasts longer
    if (P4.mins >= P4_CLOSE) { P4.mins = P4_CLOSE; p4EndDay(); }
    if ((P4.spawnT -= dt) < 0) { P4.spawnT = (2.2 + Math.random() * 2) / p4Busy(); p4Spawn(); }
    p4Hud();
  }
  p4WalkersUpdate(dt);
  for (const f of P4.fx) f.t += dt; P4.fx = P4.fx.filter(f => f.t < 1.2);
  if (P4.drag && P4.drag.moved) {} else { const V = p4View(); P4.camX = Math.max(-260, Math.min(P4_W - V.vw + 200, P4.camX)); }
}

// ---------- drawing ----------
function renderP4() {
  if (P4.sheet && P4.drawnSheet === P4.sheet) return;
  P4.drawnSheet = P4.sheet || null; P4.glows = [];
  const V = p4View(), Sc = V.s * DPR, vw = V.vw, cx = P4.camX, oy = V.oy, g = ctx, vis = (x, w) => x + w > cx - 40 && x - w < cx + vw + 40;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.yellow.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(Sc, 0, 0, Sc, -cx * Sc, oy * Sc);
  const pw = PAPER.width; for (let px = Math.floor(cx / pw) * pw; px < cx + vw; px += pw) ctx.drawImage(PAPER, px, -oy - 20, pw, Math.max(V.vh + 40, PAPER.height));
  const sun = p4Sunset(), dayK = Math.max(0, Math.min(1, (P4.mins - P4_OPEN) / (19 * 60 - P4_OPEN)));
  // the sun, the sky's warmth at evening, clouds
  g.save(); g.translate(cx * .85, 0);
  g.fillStyle = sun > .3 ? '#d4471c' : '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(80 + dayK * (vw - 160), -oy + 90 + Math.pow(dayK * 2 - 1, 2) * Math.max(110, P4_Y0 + oy - 170), 32, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  { const skyH = P4_Y0 + oy; g.save(); g.translate(cx, -oy);
    if (sun > 0) { const gr = g.createLinearGradient(0, 0, 0, skyH); gr.addColorStop(0, `rgba(228,96,34,${.42 * sun})`); gr.addColorStop(1, `rgba(240,150,60,${.12 * sun})`); g.fillStyle = gr; g.fillRect(-10, -10, vw + 20, skyH + 10); }
    const Wd = vw + 360; for (let i = 0; i < 5; i++) { const r = mulberry(i * 31 + 5), base = r() * Wd, sp = 5 + r() * 9, type = i % 3, s = .7 + r() * .6;
      c4Cloud(g, ((base + P4.t * sp - cx * .08) % Wd + Wd) % Wd - 180, 26 + r() * skyH * .45, s, type, sun > .3 ? '#f5d2a8' : '#f2ecde'); }
    g.restore(); }
  // far landmarks, the street, the river
  g.save(); g.translate(cx * .55, 0); g.globalAlpha = .5;
  for (const [x, k, sc] of P4.scene.far) if (x + 150 > cx * .45 - 40 && x - 150 < cx * .45 + vw + 40) dp(g, p4TownPart(k), x, P4_Y0 - 70, 0, sc, sc);
  g.globalAlpha = 1; g.restore();
  g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, P4_Y0 - 4, vw + 100, P4_D + 10);
  g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, P4_Y0 + P4_D + 6, vw + 100, V.vh);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, P4_Y0 - 4); g.lineTo(cx + vw + 50, P4_Y0 - 4); g.stroke();
  p4TownPaving(g, cx, vw); p4TownCreek(g, cx, vw); p4TownRiver(g, cx, vw, V);
  for (const [x, k, s, hv, lab] of P4.scene.near) if (vis(x, 260)) {
    dp(g, k === 'shop' ? p4TownArt(hv) : p4TownNear(k), x, P4_Y0, 0, s, s);
    if (k === 'shop') p4TownFront(g, x, P4_Y0, s, hv, lab);
  }
  if (vis(P4_GATE + 60, 160)) { dp(g, p4TownGate(), P4_GATE + 60, P4_Y0 + 6, 0, .88, .88); p4TownGateLanterns(g, P4_GATE + 60, P4_Y0 + 6, .88); }
  const items = [], bubbles = [];
  const head = (x, z, tall, e, pri = 1) => { if (e && e.say) bubbles.push({ e, x, y: p4Y(z) - p4TownLift(x) - tall * p4S(z) - 8, s: p4S(z), pri }); };
  // the neighbours: a seller in each open door
  for (const n of P4.scene.near) if (n[1] === 'shop' && n[4] !== 'home' && vis(n[0], 80)) { const r = mulberry(n[0] | 0), M = c4MouseRig(C4_ADULT_SORTS2[(r() * C4_ADULT_SORTS2.length) | 0]), x = n[0] + (r() - .5) * 40, f = r() < .5 ? 1 : -1;
    items.push({ z: .04, f: () => p4Mouse(g, M, x, f, P4.t * 2 + n[0], false, null, null, p4S(.04) * P4_CROWD * .95, p4Y(.04), n[0]) }); }
  // the couple's house: the wife behind the counter, the husband by the door
  if (vis(P4_HOME, 160)) {
    items.push({ z: .07, f: () => p4Mouse(g, MICE.b, P4_HOME - 6, 1, P4.t * 2, false, P4.wife.say ? -.3 - Math.abs(Math.sin(P4.t * 5)) * .4 : null, null, p4S(.07) * .95, p4Y(.07), 1) });
    items.push({ z: .09, f: () => p4TownCounter(g, P4_HOME + 10, 'trau') });
    items.push({ z: .16, f: () => p4Mouse(g, MICE.groom, P4_HOME - 120, 1, P4.t * 2, false, null, null, p4S(.16) * .95, p4Y(.16), 2) });
    head(P4_HOME - 6, .07, 168 * .95, P4.wife, 3);
  }
  for (const w of P4.walkers) if (vis(w.x, 80)) { items.push({ z: w.z, f: () => p4Folk(g, w, w.x, p4Y(w.z) - p4TownLift(w.x), p4S(w.z) * P4_CROWD) }); head(w.x, w.z, P4_TALL * P4_CROWD * .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .7 : 1), w, w.asked ? 2 : 1); }
  p4TownBridgeItems(items, g, vis);
  items.sort((a, b) => a.z - b.z); for (const it of items) it.f();
  for (const f of P4.fx) { const k = f.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = '900 26px "Playfair Display", serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = '#2f6a4c'; g.strokeText(f.s, f.x, f.y - k * 40); g.fillText(f.s, f.x, f.y - k * 40); g.restore(); }
  p4TownNight(g);
  // speech bubbles over the speakers
  bubbles.sort((a, b) => b.pri - a.pri);
  const placed = [];
  for (const b of bubbles) {
    const sy = b.e.say, B = c4Bubble(sy.text, 0, 13, 150), a = Math.min(1, sy.t * 6, (sy.life - sy.t) * 4), sc = .8 + .2 * b.s;
    const x = b.x, y = b.y - (B.bh + 30) * sc, hh = (B.bh + 6) * sc, bw = (B.w / 2 - 8) * sc;
    if (!sy.shown && placed.some(p => Math.abs(p.x - x) < p.w + bw && Math.abs(p.y - y) < p.h + hh)) continue;
    sy.shown = true; placed.push({ x, y, w: bw, h: hh });
    g.globalAlpha = Math.max(0, a); dp(g, B, x, y, 0, sc, sc); g.globalAlpha = 1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = sun * (1 - .7 * p4NightK()); if (k > 0) { ctx.fillStyle = `rgba(232,110,36,${.2 * k})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  const dawn = Math.max(0, (P4_OPEN + 40 - P4.mins) / 40 * .18); if (dawn > 0) { ctx.fillStyle = `rgba(40,30,60,${dawn})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
const p4Sunset = () => Math.max(0, Math.min(1, (P4.mins - 15 * 60) / 210)) * (1 - .8 * p4NightK());

// ---------- input ----------
function p4World(e) { const r = cv.getBoundingClientRect(), V = p4View(); return [(e.clientX - r.left) / V.s + P4.camX, (e.clientY - r.top) / V.s - V.oy]; }
function p4Down(e) { if (S.mode !== 'c4bplay') return; P4.drag = { x0: e.clientX, cam0: P4.camX, moved: false }; capturePointer(e); }
function p4Move(e) { const d = P4.drag; if (!d) return; const dx = e.clientX - d.x0; if (Math.abs(dx) > 8) d.moved = true; if (d.moved) P4.camX = d.cam0 - dx / p4View().s; }
function p4Up(e) {
  const d = P4.drag; P4.drag = null; if (!d || d.moved || S.mode !== 'c4bplay' || P4.sheet) return;
  const [x, y] = p4World(e);
  if (p4HoaTap(x, y)) return;
  if (p4TownHouseTap(x, y)) return;
}
cv.addEventListener('wheel', e => { if (S.mode !== 'c4bplay' || P4.sheet) return; e.preventDefault(); const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; P4.camX += d * 1.5 * (e.deltaMode === 1 ? 30 : 1) / p4View().s; }, { passive: false });
function p4Key(e) {
  if (e.code === 'Escape') { if (P4.sheet && P4.sheet !== 'p4buy' && P4.sheet !== 'p4day') p4Sheets(null); else showChapters(); return; }
  if (e.code === 'ArrowLeft') P4.camX -= 60; if (e.code === 'ArrowRight') P4.camX += 60;
}

// ---------- HUD and sheets ----------
function p4Sheets(id) { if (id && id !== P4.sheet) P4.sheetT = performance.now(); for (const s of ['p4buy', 'p4home', 'p4day', 'p4hoa']) { const el = $('#' + s); if (el) el.hidden = s !== id; } P4.paused = !!id && id !== 'p4day'; P4.sheet = id; }
const p4Clock = () => { const m = Math.floor(P4.mins), h = Math.floor(m / 60), mm = m % 60; return `${h}:${String(mm).padStart(2, '0')}`; };
function p4Hud() {
  if ($('#p4hud').hidden) return;
  $('#p4Time').textContent = `Ngày ${SAVE4B.day} · ${p4Clock()}`;
  $('#p4Money').innerHTML = c4Money(Math.round(p4Purse()));
  $('#p4Stock').textContent = `Trầu ${SAVE4B.stock}`;
}
// buying the house: 500 quan out of the purse
function p4BuySheet() {
  $('#p4buyB').innerHTML = `<p>Sau mấy năm buôn bán ở chợ quê, vợ chồng chuột đã để dành được tiền. Một căn nhà mặt phố trên phố huyện đang bán: <b>${c4Money(P4_HOUSE_PRICE)}</b>.</p><p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>`;
  p4Sheets('p4buy');
}
function p4HomeOpen() {
  const G = SAVE4B, cost = 3;
  $('#p4homeB').innerHTML = `<p>Trầu trong nhà: <b>${G.stock}</b> miếng · giá bán <b>${G.price}</b> đồng một miếng</p><p>Nhập trầu: ${cost} đồng một miếng. Trầu không để được qua đêm.</p>`
    + `<div class="row"><button class="btn" data-n="20">Nhập 20</button><button class="btn" data-n="50">Nhập 50</button></div>`
    + `<div class="row"><button class="btn alt" data-p="-1">Giảm giá</button><button class="btn alt" data-p="1">Tăng giá</button></div>`
    + `<p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>`;
  p4Sheets('p4home');
}
{
  const hud = document.createElement('div'); hud.id = 'p4hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="p4Name">Phố Huyện</button><div class="mid"><div class="tag" id="p4Time"></div></div><div class="right"><div class="tag" id="p4Money"></div><div class="tag" id="p4Stock"></div></div><div class="bar"><button class="tag" id="p4Back">Về chợ quê</button></div>';
  const sheet = (id, inner) => { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet p4sheet'; d.hidden = true; d.innerHTML = `<div class="card4">${inner}</div>`; return d; };
  document.body.append(hud,
    sheet('p4buy', '<h3>Lên Phố Huyện</h3><div id="p4buyB"></div><div class="row"><button class="btn" id="p4buyGo">Mua nhà</button><button class="btn alt" id="p4buyX">Thôi</button></div>'),
    sheet('p4home', '<h3>Hiệu trầu nhà chuột</h3><div id="p4homeB"></div><div class="row"><button class="btn alt" id="p4homeX">Đóng</button></div>'),
    sheet('p4day', '<h3 id="p4dayT"></h3><div id="p4dayB"></div><div class="row"><button class="btn" id="p4dayGo">Sang ngày mới</button></div>'));
  $('#p4Name').addEventListener('click', () => showChapters());
  $('#p4Back').addEventListener('click', () => { AU.tap(); p4Hide(); startC4(); });
  $('#p4buyX').addEventListener('click', () => { p4Hide(); startC4(); });
  $('#p4buyGo').addEventListener('click', () => {
    if (p4Purse() < P4_HOUSE_PRICE) { p4Hide(); startC4(); return; }
    SAVE4.money -= P4_HOUSE_PRICE; persist4();
    SAVE4B = { house: true, day: 1, stock: 30, price: 8, sold: 0 }; p4Persist();
    p4Sheets(null); P4.day = 0; startP4(); toast('Vợ chồng chuột đã có nhà trên phố huyện!', 3);
  });
  $('#p4homeX').addEventListener('click', () => p4Sheets(null));
  $('#p4homeB').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.n) { const n = +b.dataset.n, c = n * 3; if (p4Purse() < c) { toast('Không đủ tiền nhập trầu.', 2); return; } p4Spend(c); SAVE4B.stock += n; }
    if (b.dataset.p) SAVE4B.price = Math.max(4, Math.min(20, SAVE4B.price + +b.dataset.p));
    p4Persist(); AU.tap(); p4HomeOpen(); p4Hud();
  });
  $('#p4dayGo').addEventListener('click', () => { SAVE4B.day++; p4Persist(); p4Sheets(null); p4NewDay(); p4Hud(); });
}
// part 2 is a mode of chương IV (no card of its own): the hub routes to it by its mode
registerChapter({
  id: '4b', modes: ['c4bplay'], hidden: () => true,
  card: { num: '', han: '', name: 'Phố Huyện', desc: '', bg: '#efcfb8' }, progress: () => '', hasProgress: () => false,
  hide: p4Hide, update: updateP4, render: renderP4, key: p4Key,
  pointer: { down: p4Down, move: p4Move, up: p4Up },
  next() { startP4(); }, retry() { startP4(); },
});
