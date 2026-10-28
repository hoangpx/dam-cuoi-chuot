/* Chương IV phần 2 · Phố Huyện: the game. A first version to build the new rules on (owner: part 2 will have many mechanics of its
   own): a day in the town from 6:00 to 21:00 (the evening runs slower and the lanterns light up), townsfolk along the street, some
   come to the couple's house and buy betel from the wife at the counter; the house's sheet buys betel and sets the price; a tally at
   night; flower lanterns on the river after dark (art.js). Drawing of the town: art.js; state and save: state.js. */

// ---------- the folk: part 2's own mouse drawing (after part 1's, with the town's dress) ----------
const P4_TOOL_ARM = { o: -1.2, quat: -1.5, long: -.5, sach: .35, goi: .15 };
const P4_TALL = 168;
function p4Mouse(g, M, x, face, ph, moving, arm = null, carry = null, s = 1, y = GROUND, seed = 0, dress = null) {
  const sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : 0;
  g.save(); g.translate(x, y); g.scale(face * s, s);
  const hy = -45 + bob, armN = arm === null ? sw * .4 : arm;
  dp(g, M.tail, -18, hy + 2, Math.sin(P4.t * 2.4 + seed) * .12);
  dp(g, M.leg, 6, hy, sw * .55);
  if (!M.skirt) dp(g, M.arm, 2, hy - 50, -sw * .4);                         // (a skirted mouse wears it in front of the skirt, below)
  dp(g, M.body, 0, hy, .04);
  dp(g, M.leg, -2, hy, -sw * .55);
  if (M.skirt) { dp(g, M.skirt, 0, hy, .04 + sw * .03); dp(g, M.arm, 2, hy - 50, -sw * .4); }   // a skirt drawn as part of the mouse (buildMouse o.skirt), the arm hanging over it (owner: the hand looked to be inside the skirt)
  if (dress) dress(g, hy);                                                  // the town's tunic, between the body and the head
  dp(g, M.head, 6, hy - 60, Math.sin(ph * 2) * .04);
  const ax = 10, ay = hy - 52, hx = ax + 16 * Math.cos(armN) - 31 * Math.sin(armN), hyy = ay + 16 * Math.sin(armN) + 31 * Math.cos(armN);
  if (carry) dp(g, carry, hx + 4, hyy + 6, 0, .9, .9);
  g.restore();
}
let P4_SHAPED = false;
function p4Folk(g, w, x, y, s) {
  if ((w.sx || w.hx) && !P4_SHAPED) { P4_SHAPED = true; g.save(); g.translate(x, y); g.scale(w.sx || 1, w.sy || 1); try { p4Folk(g, w, 0, 0, s); hsHeadOn(g, w, 0, 0, s); } finally { P4_SHAPED = false; g.restore(); } return; }   // a far-away guest's build (js/ch4/hoso.js)
  const sort = C4_MOUSE_SORTS[w.sort], k = s * .92 * (sort.role === 'child' ? .68 : 1), L = w.look || {}, f = w.face;
  const moving = w.st === 'walk' || w.st === 'leave' || w.st === 'go' || ((w.st === 'queue' || w.st === 'fgo' || w.st === 'fq') && w.moving);
  const busy = L.tool && L.tool !== 'o' ? L.tool : (w.umb && !p4OnBridge(w.x) ? 'o' : null);
  const arm = busy ? P4_TOOL_ARM[busy] : (w.say ? -.3 - Math.abs(Math.sin(P4.t * 5)) * .4 : null);
  g.save(); g.translate(x, y); if (sort.role === 'old') g.rotate(f * .1);
  p4Mouse(g, w.M, 0, f, w.ph, moving, sort.role === 'old' && !busy ? -.15 : arm, null, k, 0, w.seed, sort.role !== 'child' ? (g2, hy) => p4TownDress(g2, w, moving, hy) : null);
  g.save(); g.scale(f * k, k);
  if (sort.role !== 'child') p4TownHead(g, w);
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
// shutting the house for a while: those in the queue go home (nobody is snubbed); one being served is served
const p4TurnAway = () => { for (const w of P4.Q) if (!w.servedBy) { w.st = 'leave'; w.buy = false; w.dir = w.x < P4.camX + p4View().vw / 2 ? -1 : 1; } P4.Q = P4.Q.filter(w => w.servedBy); };
const p4Say = (who, text, life = 1.6 + text.length * .045) => { who.say = { text, t: 0, life }; };
const p4Pick = a => a[(Math.random() * a.length) | 0];

// ---------- the street ----------
const P4_BUSY = [[6, .5], [8, 1], [11, .7], [13, .45], [15, .8], [17, .7], [19, 1], [21, .6]];   // how busy the street is through the day (hour, k)
const p4Busy = () => { const h = P4.mins / 60; for (let i = P4_BUSY.length - 1; i >= 0; i--) if (h >= P4_BUSY[i][0]) return P4_BUSY[i][1]; return .4; };
const P4_CHAT = ['Phố hôm nay đông thật!', 'Tối nay có thả đèn không?', 'Hàng vải bên kia mới về lụa đẹp.', 'Nhà chuột trầu cau ngon lắm đấy!',
  'Thuyền buôn vừa cập bến.', 'Đi qua chùa cầu mát ghê.', 'Mua cái đèn lồng về treo Tết nào.', 'Cao lầu ở đây là nhất phố.', 'Chiều nay trời đẹp quá.'];
const P4_ASK = n => p4Pick([`Cho tôi ${n} miếng trầu.`, `Bán cho ${n} miếng trầu nhé!`, `${n} miếng trầu têm cánh phượng!`]);
// a walker: now and then a child, else one of the townsfolk (khachquen.js: who, if not given, is picked; opt { buy, treat, n } for invited / sale guests)
function p4Spawn(atX, who, opt) {
  const kid = !who && Math.random() < .1, P = kid ? null : who || p4PickResident(), old = !!(P && P.old);
  const sort = kid ? 11 + ((Math.random() * 3) | 0) : P.sort;
  const fromRight = Math.random() < .5, V = p4View(), seed = P ? P.seed : Math.random() * 6;
  const x = atX !== undefined ? atX : fromRight ? P4.camX + V.vw + 120 + Math.random() * 200 : P4.camX - 120 - Math.random() * 200;
  const look = kid ? {} : p4TownLook({ skirt: P.look.skirt, hat: P.look.hat }, seed);
  // some come for betel: the more so in the busy hours, never children, never when the house is out of it
  const buy = !kid && SAVE4B.house && !SAVE4B.shut && P4.phase === 'open' && SAVE4B.stock > 0 && Math.random() < .3 * p4BetelFlow() * p4Warmth() * (SAVE4B.sign ? 1.1 : 1) * p4Harass() * p4KeenK(P) && !p4HoldBack(P, 'home') || !!(opt && opt.buy && SAVE4B.house && P4.phase === 'open' && SAVE4B.stock > 0);   // regulars buy more, a habit of sales makes them wait; invited / sale guests come to buy (khachquen.js)
  P4.walkers.push({ sort, M: c4MouseRig(sort), seed, look, umb: look.tool === 'o' || (p4Wx() === 'mua' && Math.random() < .75), x, z: .3 + Math.random() * .62, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1,
    sp: kid ? 85 + Math.random() * 30 : old ? 34 + Math.random() * 10 : 50 + Math.random() * 35, ph: Math.random() * 6, st: 'walk', buy, n: (opt && opt.n) || (buy ? Math.max(1, c4RandRound((1 + ((Math.random() * 3) | 0)) * p4BetelQty())) : 1 + ((Math.random() * 3) | 0)), pid: P ? P.id : undefined, treat: !!(opt && opt.treat), wait: 0, say: null, cd: 3 + Math.random() * 8 });
}
function p4WalkersUpdate(dt) {
  const V = p4View(), Q = P4.Q, door = P4_HOME, qz = .3;
  for (const w of P4.walkers) {
    if (w.say) { w.say.t += dt; if (w.say.t > w.say.life) w.say = null; }
    if (w.food && w.st !== 'leave') continue;                               // on the way to one of our eating houses (thue.js)
    if (w.st === 'walk' || w.st === 'leave') {
      w.x += w.dir * w.sp * dt; w.ph += dt * w.sp / 9; w.face = w.dir;
      if (w.st === 'walk' && w.buy && Math.abs(w.x - door) < 140 && Q.length < 6) { w.st = 'go'; Q.push(w); }
      if ((w.cd -= dt) < 0 && !w.say) { w.cd = 8 + Math.random() * 14; if (Math.random() < .35) p4Say(w, p4Pick(P4_CHAT)); }
    } else if (w.st === 'go' || w.st === 'queue') {
      const i = Q.indexOf(w), tx = door + 40 + i * 34, tz = qz + i * .03, dx = tx - w.x, dz = tz - w.z, d = Math.hypot(dx, dz * 300);
      w.moving = d > 3; if (w.moving) { const st = Math.min(d, 70 * dt); w.x += dx / d * st; w.z += dz * 300 / d * st / 300; w.ph += dt * 7; w.face = dx > 0 ? 1 : -1; }
      else { w.st = 'queue'; w.face = -1; }
      w.wait += dt;
      if (w.st === 'queue' && i < P4.sellers.length && !w.asked) { w.asked = true; w.askT = P4.t; p4Say(w, P4_ASK(w.n)); }
      if (w.wait > 30 && !w.servedBy) { Q.splice(Q.indexOf(w), 1); w.st = 'leave'; w.dir = w.x < P4.camX + V.vw / 2 ? -1 : 1; p4Say(w, 'Lâu quá, thôi đi chỗ khác.'); }
    }
  }
  P4.walkers = P4.walkers.filter(w => !(w.st !== 'queue' && w.st !== 'go' && !(w.food && w.st !== 'leave') && (w.x < P4.camX - 500 || w.x > P4.camX + V.vw + 500)));
  p4BoatOrders(dt); p4SellersUpdate(dt); p4ShopsUpdate(dt); p4BossUpdate(dt);   // chupho.js: the street's master and his men                                   // nguoilam.js: the wife and the hired hands
}

// ---------- start, the day, leaving ----------
function p4Enter() { c4Hide(); startP4(); }                                // part 1's button "Lên Phố Huyện": go and look; buying the house is here
function startP4() {
  AU.init(); AU.setSong(12); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 4; S.mode = 'c4bplay'; document.body.classList.add('c4'); document.documentElement.style.setProperty('--paper', PAPERS[P4_PAPER].css);
  $('#album').hidden = true; $('#end').hidden = true; $('#chapters').hidden = true; $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  if (!P4.scene) { P4.scene = p4TownScene(mulberry(7)); P4.camX = P4_HOME - p4View().vw * .5; }
  w4TownEnter();                                                           // the village's day and hour (dongho.js)
  if (SAVE4B.house && SAVE4B.morning === SAVE4.day && P4.phase === 'open') p4HomeOpen();   // the new day's stocking, not yet done
  p4HoaLoad();                                                              // everyone's lanterns (hoadang-net.js)
  $('#p4hud').hidden = false; p4Hud(); if (P4.hoaHold) p4HoaHold(P4.hoaHold); cv.focus();
  if (typeof trackEnter === 'function') trackEnter('chuong-4/pho-huyen');
}
function p4NewDay() {
  Object.assign(P4, { day: SAVE4B.day, mins: P4_OPEN, phase: 'open', walkers: [], Q: [], fx: [], today: { sold: 0, take: 0, spent: 0, lost: 0 } });
  P4.FQ = {}; P4.shopDay = {}; P4.boss = null; P4.thugs = null;
  P4.sellers = p4MakeSellers(); P4.wife = P4.sellers[0]; P4.apply = null; P4.boatT = 25;
  for (const b of P4.townBoats || []) if (b.order) { b.order = null; b.stop = false; b.say = null; if (b.y0 !== undefined) { b.y = b.y0; b.y0 = undefined; } }   // last night's callers are gone
  for (let i = 0; i < 18; i++) p4Spawn(P4.camX - 200 + Math.random() * (p4View().vw + 400));
}
function p4Hide() { P4.talk = null; if (P4T.on) { P4T.on = false; if (P4T.fetch > 0) { SAVE4B.stock += P4_TEM_MORE.n; P4T.fetch = 0; p4Persist(); } $('#p4temHud').hidden = true; } $('#p4hud').hidden = true; p4Sheets(null); $('#p4hands').hidden = true; document.body.classList.remove('p4holding', 'c4'); }
function p4EndDay(silent) {
  P4.phase = 'night';
  if (!SAVE4B.house) { $('#p4dayT').textContent = `Khuya rồi, ngày ${p4DayNo()} đã hết`; $('#p4dayB').innerHTML = '<p>Phố huyện đã lên đèn hết, hàng quán đóng cửa.</p>' + w4VillageLine(); if (!silent) p4Sheets('p4day'); return; }
  SAVE4B.settled = SAVE4.day; p4SaleDayEnd();                             // sale days in a row (giamgia.js)
  const wilt = SAVE4B.stock; SAVE4B.stock = 0; SAVE4B.weekTake = (SAVE4B.weekTake || 0) + P4.today.take; p4Persist();   // the week's takings, for the street master's tax                // betel does not keep overnight
  $('#p4dayB').innerHTML = `<p>Bán được <b>${P4.today.sold}</b> miếng trầu: <b>${c4Money(P4.today.take)}</b></p><p>Chi: ${c4Money(P4.today.spent)}</p>`
    + (wilt ? `<p class="bad">Trầu thừa héo mất ${wilt} miếng.</p>` : '') + (P4.today.lost ? `<p>${P4.today.lost} khách đến mà hết trầu.</p>` : '')
    + p4PayHands() + p4ShopsEvening() + (P4.today.smash ? `<p class="bad">Bị tay chân bá hộ phá: mất ${c4Money(P4.today.smash)}.</p>` : '') + (p4Harass() < 1 ? '<p class="bad">Tay chân bá hộ còn quấy, khách ngại ghé.</p>' : '') + w4VillageLine() + `<p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>`;
  $('#p4dayT').textContent = `Tối ngày ${p4DayNo()} trên phố huyện`;
  if (!silent) p4Sheets('p4day');
}
function updateP4(dt) {
  P4.t += dt;
  if (P4T.on) { if (!P4.sheet) p4TemUpdate(dt); return; }                 // têm trầu by hand: the street waits (temtrau.js)
  if (P4.mins >= 16.5 * 60 && !document.hidden && Date.now() - P4_HOA_AT > P4_HOA_RELOAD * 1000 && P4.t - (P4.hoaLoadT ?? -1e9) > P4_HOA_RELOAD) p4HoaLoad();   // the shared wishes: only towards night (fewer requests, owner 2026-10-17)
  if (P4.talk) p4TalkUpdate(dt);                                           // the couple talking before buying the house (muanha.js)
  if (P4.paused) return;
  if (P4.phase === 'open') {
    const dm = dt * P4_MPS * (P4.mins >= 18 * 60 ? .4 : 1); P4.mins += dm;   // the evening lasts longer
    if (typeof w4TownTick === 'function') w4TownTick();                     // the one clock of village and town (dongho.js)
    if (P4.mins >= P4_CLOSE) { P4.mins = P4_CLOSE; p4EndDay(); }
    if ((P4.spawnT -= dt) < 0) { P4.spawnT = (2.2 + Math.random() * 2) / (p4Busy() * p4WxFlow()); p4Spawn(); }
    p4Hud();
  }
  p4WalkersUpdate(dt); p4FolkTick(dt);                                     // invited guests and a sale's regulars (khachquen.js)
  if (typeof hsTownTick === 'function') hsTownTick(dt);                     // far-away guests: other players' profiles (js/ch4/hoso.js)
  for (const f of P4.fx) f.t += dt; P4.fx = P4.fx.filter(f => f.t < 1.2);
  if (P4.drag && P4.drag.moved) {} else { const V = p4View(); P4.camX = Math.max(-260, Math.min(P4_W - V.vw + 200, P4.camX)); }
}

// ---------- drawing ----------
function renderP4() {
  if (P4T.on || P4.sheet === 'p4temEnd') { if (P4T.on || P4.drawnSheet !== P4.sheet) { P4.drawnSheet = P4.sheet || null; p4TemRender(); } return; }
  if (P4.sheet && P4.drawnSheet === P4.sheet) return;
  P4.drawnSheet = P4.sheet || null; P4.glows = [];
  const V = p4View(), Sc = V.s * DPR, vw = V.vw, cx = P4.camX, oy = V.oy, g = ctx, vis = (x, w) => x + w > cx - 40 && x - w < cx + vw + 40;
  const PP = P4.paper || (P4.paper = getPaper(P4_PAPER));                   // the town's own paper, the same every day (part 1 changes its paper daily; the street showed it)
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS[P4_PAPER].base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(Sc, 0, 0, Sc, -cx * Sc, oy * Sc);
  const pw = PP.width; for (let px = Math.floor(cx / pw) * pw; px < cx + vw; px += pw) ctx.drawImage(PP, px, -oy - 20, pw, Math.max(V.vh + 40, PP.height));
  const sun = p4Sunset(), dayK = Math.max(0, Math.min(1, (P4.mins - P4_OPEN) / (19 * 60 - P4_OPEN)));
  // the sun, the sky's warmth at evening, clouds
  g.save(); g.translate(cx * .25 + (P4_HOME - vw / 2) * .75, 0);             // the sun scrolls by at 3/4 of the street's speed; over the house at the start
  g.fillStyle = sun > .3 ? '#d4471c' : '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(80 + dayK * (vw - 160), -oy + 90 + Math.pow(dayK * 2 - 1, 2) * Math.max(110, P4_Y0 + oy - 170), 32, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  { const skyH = P4_Y0 + oy; g.save(); g.translate(cx, -oy);
    if (sun > 0) { const gr = g.createLinearGradient(0, 0, 0, skyH); gr.addColorStop(0, `rgba(228,96,34,${.42 * sun})`); gr.addColorStop(1, `rgba(240,150,60,${.12 * sun})`); g.fillStyle = gr; g.fillRect(-10, -10, vw + 20, skyH + 10); }
    const Wd = vw + 360; for (let i = 0; i < 5; i++) { const r = mulberry(i * 31 + 5), base = r() * Wd, sp = 5 + r() * 9, type = i % 3, s = .7 + r() * .6;
      c4Cloud(g, ((base + P4.t * sp - cx * .7) % Wd + Wd) % Wd - 180, 26 + r() * skyH * .45, s, type, sun > .3 ? '#f5d2a8' : '#f2ecde'); }
    g.restore(); }
  // far landmarks, the street, the river
  g.save(); g.translate(cx * .3, 0); g.globalAlpha = .5;                   // the far rows at 70 % of the street's speed
  for (const [x, k, sc] of P4.scene.far) if (x + 150 > cx * .7 - 40 && x - 150 < cx * .7 + vw + 40) dp(g, p4TownPart(k), x, P4_Y0 - 70, 0, sc, sc);
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
  for (const n of P4.scene.near) if (n[1] === 'shop' && (n[4] !== 'home' || !SAVE4B.house) && vis(n[0], 80)) { const r = mulberry(n[0] | 0), M = c4MouseRig(C4_ADULT_SORTS2[(r() * C4_ADULT_SORTS2.length) | 0]), x = n[0] + (r() - .5) * 40, f = r() < .5 ? 1 : -1;
    items.push({ z: .04, f: () => p4Mouse(g, M, x, f, P4.t * 2 + n[0], false, null, null, p4S(.04) * P4_CROWD * .95, p4Y(.04), n[0]) }); }
  // the couple's house: the wife behind the counter, the husband by the door
  if (SAVE4B.house && vis(P4_HOME, 160)) {
    items.push({ z: .09, f: () => p4TownCounter(g, P4_HOME + 10, 'trau') });
    items.push({ z: .16, f: () => p4Mouse(g, MICE.groom, P4_HOME - 120, 1, P4.t * 2, false, null, null, p4S(.16) * .95, p4Y(.16), 2) });
  }
  if (SAVE4B.house) for (const m of P4.sellers) if (vis(m.x, 80)) {                          // the wife and the hands: behind the counter, or running a boat's order
    const out = m.st !== 'counter';
    items.push({ z: m.z, f: () => p4Mouse(g, m.M, m.x, m.face || 1, out ? m.ph : P4.t * 2, out && m.moving, m.st === 'out' ? -.9 : m.say ? -.3 - Math.abs(Math.sin(P4.t * 5)) * .4 : null, m.st === 'out' ? WP.basket : null, p4S(m.z) * .95, p4Y(m.z), m.slot + 1) });
    head(m.x, m.z, 168 * .95, m, 3);
  }
  for (const b of P4.townBoats || []) if (b.say && vis(b.x, 100)) bubbles.push({ e: b, x: b.x, y: P4_Y0 + P4_D + 24 + b.y - 16 - 70, s: .9, pri: 2 });
  for (const w of P4.walkers) if (vis(w.x, 80) && !(P4.talk && Math.abs(w.x - P4_HOME) < 170)) { items.push({ z: w.z, f: () => p4Folk(g, w, w.x, p4Y(w.z) - p4TownLift(w.x), p4S(w.z) * P4_CROWD) }); head(w.x, w.z, P4_TALL * P4_CROWD * .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .7 : 1), w, w.asked ? 2 : 1); }
  for (const m of [...(P4.boss ? P4.boss.men : []), ...(P4.thugs || [])]) if (vis(m.x, 80)) { items.push({ z: m.z, f: () => p4Folk(g, m, m.x, p4Y(m.z), p4S(m.z) * P4_CROWD * (m === (P4.boss && P4.boss.men[0]) ? 1.08 : 1)) }); head(m.x, m.z, P4_TALL * P4_CROWD * .92, m, 3); }
  p4TownBridgeItems(items, g, vis);
  if (P4.talk) p4TalkItems(items, g);
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
  if (P4.talk) p4TalkDraw(g);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  p4WxDraw(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = sun * (1 - .7 * p4NightK()); if (k > 0) { ctx.fillStyle = `rgba(232,110,36,${.2 * k})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  const dawn = Math.max(0, (P4_OPEN + 40 - P4.mins) / 40 * .18); if (dawn > 0) { ctx.fillStyle = `rgba(40,30,60,${dawn})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
const p4Sunset = () => Math.max(0, Math.min(1, (P4.mins - 15 * 60) / 210)) * (1 - .8 * p4NightK());

// ---------- input ----------
function p4World(e) { const r = cv.getBoundingClientRect(), V = p4View(); return [(e.clientX - r.left) / V.s + P4.camX, (e.clientY - r.top) / V.s - V.oy]; }
function p4Down(e) { if (S.mode !== 'c4bplay') return; P4.drag = { x0: e.clientX, cam0: P4.camX, moved: false }; capturePointer(e); if (P4T.on && !P4.sheet) { const r = cv.getBoundingClientRect(); p4TemDown(e.clientX - r.left, e.clientY - r.top); } }
function p4Move(e) { const d = P4.drag; if (d && P4T.on) { const r = cv.getBoundingClientRect(); p4TemMove(e.clientX - r.left, e.clientY - r.top); return; } if (!d || P4T.on || P4.talk) return; const dx = e.clientX - d.x0; if (Math.abs(dx) > 8) d.moved = true; if (d.moved) P4.camX = d.cam0 - dx / p4View().s; }
function p4Up(e) {
  const d = P4.drag; P4.drag = null; if (!d || S.mode !== 'c4bplay' || P4.sheet) return;
  if (P4T.on) { const r = cv.getBoundingClientRect(); p4TemUp(e.clientX - r.left, e.clientY - r.top); return; }
  if (P4.talk) { p4TalkNext(); return; }
  if (d.moved) return;
  const [x, y] = p4World(e);
  if (p4HoaTap(x, y)) return;
  if (p4TownHouseTap(x, y)) return;
}
cv.addEventListener('wheel', e => { if (S.mode !== 'c4bplay' || P4.sheet) return; e.preventDefault(); const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; P4.camX += d * 1.5 * (e.deltaMode === 1 ? 30 : 1) / p4View().s; }, { passive: false });
function p4Key(e) {
  if (P4.talk) { if (['Space', 'Enter', 'NumpadEnter'].includes(e.code)) { e.preventDefault && e.preventDefault(); p4TalkNext(); } return; }
  if (e.code === 'Escape' && P4T.on) { p4TemStop(); return; }
  if (e.code === 'Escape' && P4.sheet === 'p4home' && SAVE4B.morning === SAVE4.day) { w4TownOpen(); return; }
  if (e.code === 'Escape') { if (P4.sheet && P4.sheet !== 'p4buy' && P4.sheet !== 'p4day' && P4.sheet !== 'p4boss') p4Sheets(null); else showChapters(); return; }
  if (e.code === 'ArrowLeft') P4.camX -= 60; if (e.code === 'ArrowRight') P4.camX += 60;
}

// ---------- HUD and sheets ----------
function p4Sheets(id) { if (id && id !== P4.sheet) P4.sheetT = performance.now(); for (const s of ['p4buy', 'p4home', 'p4day', 'p4hoa', 'p4name', 'p4wish', 'p4shop', 'p4boss', 'p4temEnd', 'c4rank', 'c4nhax', 'hs', 'hsWho', 'hsEdit']) { const el = $('#' + s); if (el) el.hidden = s !== id; } P4.paused = !!id && id !== 'p4day'; P4.sheet = id; }
// a sheet opened by a tap on the street (our house, a neighbour's, the lanterns) appears under the finger, and the phone then sends that
// same tap's click to the button now there (Nhập trầu, Đổi tên, Trả quán…: a player, "nhấn một lần mà như nhấn đúp"): clicks inside a
// sheet in its first .45 s are dropped (chương IV's village has the same guard in cho.js)
addEventListener('click', e => { if (S.mode === 'c4bplay' && P4.sheet && c4GhostClick(e, P4.sheetT || 0) && e.target.closest && e.target.closest('#' + P4.sheet)) { e.stopPropagation(); e.preventDefault(); } }, true);
const p4Clock = () => { const m = Math.floor(P4.mins), h = Math.floor(m / 60), mm = m % 60; return `${h}:${String(mm).padStart(2, '0')}`; };
function p4Hud() {
  if ($('#p4hud').hidden) return;
  p4HudTime();                                                             // like part 1: day, the hour's animal, the clock, the weather (thoitiet.js)
  $('#p4Money').innerHTML = c4Money(Math.round(p4Purse()));
  $('#p4Stock').textContent = `Trầu ${SAVE4B.stock}`; $('#p4Stock').hidden = !SAVE4B.house;
  $('#p4Buy').hidden = !!SAVE4B.house; $('#p4Buy').classList.toggle('off', p4Purse() < P4_HOUSE_PRICE);
  for (const id of ['p4Note', 'p4Ups']) { $('#' + id).disabled = !SAVE4B.house; $('#' + id).classList.toggle('off', !SAVE4B.house); }   // greyed until the house is bought
}
// buying the house: 500 quan out of the purse
function p4BuySheet() {
  const ok = p4Purse() >= P4_HOUSE_PRICE;
  $('#p4buyB').innerHTML = `<p>Một căn nhà mặt phố trên phố huyện đang bán: <b>${c4Money(P4_HOUSE_PRICE)}</b>. Mua được nhà thì vợ chồng chuột mở hiệu trầu ở đây.</p><p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>` + (ok ? '' : `<p class="bad">Chưa đủ tiền. Về chợ quê buôn bán thêm đã.</p>`);
  $('#p4buyGo').disabled = !ok;
  p4Sheets('p4buy');
}
function p4HomeOpen() {
  if (!SAVE4B.house) { p4BuySheet(); return; }
  p4KeepScroll('p4home', p4HomeDraw);                                     // a redraw keeps the scroll (giamgia.js)
}
function p4HomeDraw() {
  const G = SAVE4B, cost = 3;
  $('#p4homeB').innerHTML = `<div class="row"><button class="btn tem" data-tem="1">Têm trầu</button></div><p class="p4name">Hiệu <b>${p4Esc(SAVE4B.name || 'TRẦU CAU')}</b> <button class="btn alt" data-rename="1">Đổi tên</button></p><p>Trầu trong nhà: <b>${G.stock}</b> miếng · giá bán <b>${G.price}</b> đồng một miếng</p><p>Nhập trầu: ${cost} đồng một miếng. Trầu không để được qua đêm.</p>`
    + `<div class="row"><button class="btn" data-n="20">Nhập 20</button><button class="btn" data-n="50">Nhập 50</button></div>`
    + `<div class="row"><button class="btn alt" data-p="-1">Giảm giá</button><button class="btn alt" data-p="1">Tăng giá</button></div>`
    + `<div class="row"><button class="btn alt" data-shut="1">${SAVE4B.shut ? 'Mở cửa lại' : 'Tạm đóng cửa hiệu'}</button></div>` + (SAVE4B.shut ? '<p class="sm">Hiệu đang đóng: khách không ghé nữa.</p>' : '')
    + (SAVE4B.sign ? '' : `<div class="row"><button class="btn" data-homesign="1"${p4Purse() < P4_SIGN_PRICE ? ' disabled' : ''}>Làm biển hiệu đẹp · ${c4Money(P4_SIGN_PRICE)} (+10% khách)</button></div>`)
    + `<p>Trong túi: ${c4Money(Math.round(p4Purse()))}</p>` + p4HandsHtml();
  $('#p4homeB').appendChild(p4SaleBlock('home', p4HomeOpen));               // a sale at the betel house (giamgia.js)
  { const tb = p4TreatBlock('trau'); $('#p4homeB').appendChild(tb); p4Tabs('p4home', $('#p4homeB'), tb, 'Hiệu trầu'); }   // the Mời khách tab (khachquen.js)
  { const m = SAVE4B.morning === SAVE4.day; $('#p4homeGo').hidden = !m; $('#p4homeVil').hidden = !m; $('#p4homeX').hidden = m; }   // the morning after "Sang ngày mới": stock, then open or go to the village
  p4Sheets('p4home');
}
{
  const hud = document.createElement('div'); hud.id = 'p4hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="p4Name">Phố Huyện</button><div class="mid"><div class="tag" id="p4Time"></div></div><div class="right"><div class="tag" id="p4Money"></div><div class="tag" id="p4Stock"></div></div><div class="bar"><button class="tag ic" id="p4Note" title="Sổ tay" aria-label="Sổ tay"><i class="ic4 book"></i></button><button class="tag ic up" id="p4Ups" title="Nâng cấp" aria-label="Nâng cấp"><i class="ic4 up"></i></button><button class="tag pho" id="p4Back">Về chợ quê</button><button class="tag buy" id="p4Buy" hidden>Mua nhà · 500 quan</button></div>';
  const sheet = (id, inner) => { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet p4sheet'; d.hidden = true; d.innerHTML = `<div class="card4">${inner}</div>`; return d; };
  document.body.append(hud,
    sheet('p4buy', '<h3>Lên Phố Huyện</h3><div id="p4buyB"></div><div class="row"><button class="btn" id="p4buyGo">Mua nhà</button><button class="btn alt" id="p4buyX">Thôi</button></div>'),
    sheet('p4home', '<h3>Hiệu trầu nhà chuột</h3><div id="p4homeB"></div><div class="row"><button class="btn" id="p4homeGo" hidden>Họp chợ ở phố</button><button class="btn alt" id="p4homeVil" hidden>Nhập hàng ở làng</button><button class="btn alt" id="p4homeX">Đóng</button></div>'),
    sheet('p4name', '<h3>Đặt tên hiệu</h3><p>Tên treo trên biển trước nhà (tối đa ' + P4_NAME_MAX + ' chữ).</p><input id="p4nameIn" maxlength="' + P4_NAME_MAX + '" autocomplete="off"><div class="row"><button class="btn" id="p4nameGo">Treo biển</button><button class="btn alt" id="p4nameX">Thôi</button></div>'),
    sheet('p4day', '<h3 id="p4dayT"></h3><div id="p4dayB"></div><div class="row"><button class="btn" id="p4dayGo">Sang ngày mới</button></div>'));
  $('#p4Name').addEventListener('click', () => showChapters());
  $('#p4Buy').addEventListener('click', () => { AU.tap(); p4BuySheet(); });
  // the bar is the village's (owner, 2026-10-17: "các control cũng giống y như ở làng, chỉ là chưa mua nhà thì chưa ấn đc"): the book (here: Khách quen,
  // Hồ sơ, Tổng sắp: hsOpen in js/ch4/hoso.js), Nâng cấp (the house's sheet), the way back; book and upgrades wait for the house (p4Hud)
  $('#p4Note').addEventListener('click', () => { if (!SAVE4B.house) return; AU.tap(); hsOpen('quen'); });
  $('#p4Ups').addEventListener('click', () => { if (!SAVE4B.house) return; AU.tap(); p4HomeOpen(); });
  $('#p4Back').addEventListener('click', () => { AU.tap(); p4Hide(); startC4(); });
  $('#p4buyX').addEventListener('click', () => p4Sheets(null));
  $('#p4buyGo').addEventListener('click', () => {
    if (p4Purse() < P4_HOUSE_PRICE || SAVE4B.house) return;
    AU.tap(); p4BuyTalkStart(p4DoBuy);                                     // the couple talk it over first (muanha.js)
  });
  $('#p4homeX').addEventListener('click', () => p4Sheets(null));
  $('#p4homeGo').addEventListener('click', () => { AU.tap(); w4TownOpen(); });          // the new day's morning: open the house (dongho.js)
  $('#p4homeVil').addEventListener('click', () => { AU.tap(); p4Hide(); startC4(); });   // …or first go to the village's morning order
  $('#p4homeB').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.shut) { SAVE4B.shut = !SAVE4B.shut; if (SAVE4B.shut) p4TurnAway(); p4Persist(); AU.tap(); p4HomeOpen(); p4Hud(); return; }
    if (b.dataset.tem) { AU.tap(); p4TemStart(); return; }
    if (b.dataset.rename) { AU.tap(); p4NameSheet(false); return; }
    if (b.dataset.homesign) { if (!SAVE4B.sign && p4Purse() >= P4_SIGN_PRICE) { p4Spend(P4_SIGN_PRICE); SAVE4B.sign = true; p4Persist(); toast('Biển hiệu mới sơn son thếp vàng!', 2.4); } AU.tap(); p4HomeOpen(); p4Hud(); return; }
    if (p4HandsClick(b)) { AU.tap(); p4HomeOpen(); p4Hud(); return; }
    if (b.dataset.n) { const n = +b.dataset.n, c = n * 3; if (p4Purse() < c) { toast('Không đủ tiền nhập trầu.', 2); return; } p4Spend(c); SAVE4B.stock += n; p4BetelLog(n); }
    if (b.dataset.p) SAVE4B.price = Math.max(3, Math.min(24, SAVE4B.price + +b.dataset.p));
    p4Persist(); AU.tap(); p4HomeOpen(); p4Hud();
  });
  const nameBack = () => { if (P4.nameKey) p4ShopSheet(); else if (P4.nameBack) p4HomeOpen(); else p4Sheets(null); };
  $('#p4nameGo').addEventListener('click', () => { const v = $('#p4nameIn').value.replace(/\s+/g, ' ').trim().slice(0, P4_NAME_MAX).trim().toLocaleUpperCase('vi'); if (v) { if (P4.nameKey && p4Shops()[P4.nameKey]) p4Shops()[P4.nameKey].name = v; else SAVE4B.name = v; p4Persist(); toast('Biển mới: ' + p4Esc(v), 2.4); } AU.tap(); nameBack(); });
  $('#p4nameX').addEventListener('click', nameBack);
  $('#p4nameIn').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') $('#p4nameGo').click(); });
  $('#p4dayGo').addEventListener('click', () => { AU.tap(); w4TownNextDay(); });   // the day turns for the village too (dongho.js)
}
// part 2 is a mode of chương IV (no card of its own): the hub routes to it by its mode
registerChapter({
  id: '4b', modes: ['c4bplay'], hidden: () => true,
  card: { num: '', han: '', name: 'Phố Huyện', desc: '', bg: '#efcfb8' }, progress: () => '', hasProgress: () => false,
  hide: p4Hide, update: updateP4, render: renderP4, key: p4Key,
  pointer: { down: p4Down, move: p4Move, up: p4Up },
  next() { startP4(); }, retry() { startP4(); },
});

// ---------- orders from the boats (owner): a boat comes in to the quay in front of the house and calls for betel; the seller has to
// leave the counter and run down to the water with it, and back (the counter waits meanwhile) ----------
const P4_DOCK_Z = 1.03;                                                    // where she stands to hand it over: the quay's edge
const p4NextBoat = () => (P4.townBoats || []).filter(b => b.order && b.stop && !b.order.taken).sort((a, b) => a.order.t0 - b.order.t0)[0] || null;
function p4BoatOrders(dt) {
  const B = P4.townBoats; if (!B) return;
  for (const b of B) {
    if (b.say) { b.say.t += dt; if (b.say.t > b.say.life) b.say = null; }
    if (!b.order) continue;
    const o = b.order;
    if (!b.stop && Math.abs(b.x - o.dock) < 6) { b.stop = true; b.fast = 0; o.t0 = P4.t; p4Say(b, p4Pick([`Ơi nhà trầu! Cho ${o.n} miếng!`, `Mang ra đây ${o.n} miếng trầu!`, `Bến ơi! ${o.n} miếng trầu nhé!`])); }
    if (b.stop && !o.taken && P4.t - o.t0 > 40) p4BoatLeave(b, p4Pick(['Thôi, đi tiếp vậy.', 'Chờ lâu quá!']), true);
  }
  // now and then (more when the street is busy) a boat turns in towards the house: it comes from off the screen and stops at the quay
  if (!SAVE4B.house || SAVE4B.shut || P4.phase !== 'open' || SAVE4B.stock <= 0 || B.some(b => b.order)) return;
  if ((P4.boatT -= dt) > 0) return;
  P4.boatT = (22 + Math.random() * 25) / p4Busy();
  const V = p4View(), b = B.filter(q => !q.order && (q.x < P4.camX - 150 || q.x > P4.camX + V.vw + 150)).sort((p, q) => Math.abs(p.x - P4_HOME) - Math.abs(q.x - P4_HOME))[0]; if (!b) return;
  const from = Math.random() < .5 ? -1 : 1, dock = P4_HOME + 40 + (Math.random() - .5) * 120;
  b.y0 = b.y; b.y = 40; b.x = dock + from * (V.vw * .7 + 120); b.sp = -from * Math.abs(b.sp); b.fast = -from * 60;
  b.order = { n: 2 + ((Math.random() * 5) | 0), dock, t0: Infinity, taken: false };
}
function p4BoatLeave(b, line, lost) {
  if (line) p4Say(b, line); if (lost) P4.today.lost++;
  b.order = null; b.stop = false; b.fast = Math.sign(b.sp) * 40; if (b.y0 !== undefined) { b.y = b.y0; b.y0 = undefined; }
  setTimeout(() => { b.fast = 0; }, 6000);
}

// the shop's name (owner: the player names it once the house is theirs; at most P4_NAME_MAX letters, shown in capitals on the board)

function p4NameSheet(first, key = null) {
  if (!SAVE4B.house) return;
  P4.nameBack = !first; P4.nameKey = key; $('#p4nameIn').value = key ? p4Shops()[key].name : SAVE4B.name || 'TRẦU CAU';
  p4Sheets('p4name'); setTimeout(() => { const i = $('#p4nameIn'); i.focus(); i.select(); }, 60);
}
