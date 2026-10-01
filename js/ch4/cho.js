/* Chương IV · Vợ Chồng Khởi Nghiệp 創業 — a village-market trading game (step 1: one stall).
   It opens with the newly-wed mouse couple talking over how to make a living: he wants to steal food, she says no —
   it is dangerous, and what would their children do? — "phi thương bất phú", so they open a betel stall at the market.
   The market lane is seen a little from above: folk walk along it at different depths (z 0 = the far edge by the
   houses, 1 = the near edge; nearer is lower on screen and bigger) — mice, ducks, cocks, dogs, pigs, toads, each with a
   name. They meet and stop to chat (greetings, news, gossip, a little back-biting: js/ch4/folk.js), the neighbours call
   out their wares, and some come to the betel stall. The wife sells by herself: buyers queue, say what they want, she
   serves them one by one and they pay. When the baskets run low the trader's boat comes down the river and the husband
   carries the goods up (bought on credit up to a limit, paid back from the takings). The day runs by the old
   double-hours (giờ Mão … giờ Dậu), busy and slack, and ends with a tally. (The husband fetches the goods from the
   trader's boat at the landing, off the near end of the lane.)
   The player only watches, reckons and decides: tap the stall to upgrade it (gánh → sạp lều → gian mái ngói), drag
   sideways to look along the lane. Money is counted in đồng, shown as quan + đồng (600 đồng a quan).
   Art and rigs: js/ch4/art.js; folk and their lines: js/ch4/folk.js. */
const C4 = { t: 0, camX: 0, mins: 300, phase: 'open', walkers: [], queue: [], fx: [], boat: null, porter: null, serve: null, build: null, drag: null, spawnT: 1 };
const C4_W = 2300, C4_STALL = 720, C4_GATE = 390, C4_OFF = 300;   // … how far (at least) the husband goes for goods
const c4HusbX = () => SAVE4.lv ? C4_STALL + 70 : C4_STALL - 40;           // where he waits: just behind the stall, by his wife
const C4_Y0 = 300, C4_D = 190;                                            // the lane: its far edge on screen, and its depth
const c4Y = z => C4_Y0 + z * C4_D, c4S = z => .62 + .42 * z;              // where depth z stands on screen, and how big
const C4_STALL_Z = .12, C4_WIFE_Z = .07, C4_Q_Z = .32;
const C4_QX = [175, 200, 225];                                           // where the queue starts, right of each kind of stall
const C4_OPEN = 5 * 60, C4_CLOSE = 19 * 60, C4_MPS = 4;                 // market hours (game minutes), game minutes per second
const C4_PRICE = 6;                                                       // đồng a quid of betel
// the three stalls: how many quids it holds, what the trader charges, how long it takes to serve, how many come by
const C4_LV = [
  { name: 'Gánh trầu', cap: 40, cost: 4, serve: 1.8, flow: 1, buy: .45, wait: 12, up: 0 },
  { name: 'Sạp lều', cap: 100, cost: 3, serve: 1.35, flow: 1.4, buy: .57, wait: 9, up: 180 },
  { name: 'Gian mái ngói', cap: 240, cost: 2, serve: .95, flow: 1.9, buy: .68, wait: 7, up: 900 },
];
const C4_DEBT = 300;                                                      // the trader gives credit up to this
const C4_HOURS = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const C4_BUSY = { 'Mão': .7, 'Thìn': 1, 'Tỵ': .8, 'Ngọ': .35, 'Mùi': .5, 'Thân': .9, 'Dậu': .45 };   // how busy each double-hour is
const C4_NEW = () => ({ day: 1, money: 60, stock: 30, debt: 0, lv: 0, started: false, best: 0, intro: false });
let SAVE4 = C4_NEW();
try { const s = JSON.parse(localStorage.getItem('dcc.c4') || 'null'); if (s && s.day) SAVE4 = Object.assign(SAVE4, s); } catch (e) {}
const persist4 = () => { try { localStorage.setItem('dcc.c4', JSON.stringify(SAVE4)); } catch (e) {} };
const c4Hour = m => C4_HOURS[Math.floor(((m / 60 + 1) % 24) / 2)];
function c4Money(d) {
  d = Math.round(d); const q = Math.floor(d / 600), r = d - q * 600;
  return q ? `${q} quan${r ? ' ' + r + ' đồng' : ''}` : `${r} đồng`;
}
// the view: a phone shows ~430 units across with the lane in its lower part; a wide screen the whole height of the scene
function c4View() {
  const w = innerWidth, h = innerHeight, portrait = h > w, s = portrait ? w / 430 : Math.min(h / 560, w / 700), vh = h / s;
  return { s, vh, vw: w / s, oy: vh * (portrait ? .8 : .88) - (C4_Y0 + C4_D) };
}

/* ---------- the opening talk ---------- */
// who speaks (h = husband, w = wife) and what they say
const C4_TALK = [
  ['h', 'Mình ơi, cưới nhau rồi, giờ mình làm gì mà sống?'],
  ['h', 'Hay tối tối anh lẻn vào bếp nhà người ta, khuân ít thóc ít gạo về là đủ ăn!'],
  ['w', 'Không được đâu anh! Ăn trộm nguy hiểm lắm.'],
  ['w', 'Mai này mình có con, anh cũng muốn con mình đi ăn trộm sao?'],
  ['w', 'Lỡ chúng mình bị bắt, hay gặp hoạ, thì các con biết trông cậy vào ai?'],
  ['h', '…Mình nói phải. Thế mình tính làm gì?'],
  ['w', 'Các cụ dạy rồi: "Phi thương bất phú". Mình ra chợ buôn bán đi anh.'],
  ['h', 'Phải đấy! Vốn chẳng bao nhiêu, mình mở gánh trầu cau trước đã.'],
  ['w', 'Miếng trầu là đầu câu chuyện, chợ nào mà chẳng có người mua!'],
  ['h', 'Vậy sáng mai mình gánh ra cổng chợ!'],
];
function c4StoryStart() {
  Object.assign(C4, { phase: 'story', line: 0, lineT: 0, storyT: 0, fade: 0, walkers: [], queue: [], fx: [], boat: null, porter: null, serve: null, build: null });
  C4.camX = -c4View().vw / 2;
  $('#c4hud').hidden = true;
}
function c4StoryNext() {
  if (C4.phase !== 'story' || C4.fade > 0) return;
  AU.tap();
  if (C4.line < C4_TALK.length - 1) { C4.line++; C4.lineT = 0; C4.tapped = true; }
  else C4.fade = .001;                                                      // the last line: on to the market
}
function c4StoryUpdate(dt) {
  C4.storyT += dt; C4.lineT += dt;
  if (C4.fade > 0) { C4.fade += dt; if (C4.fade > 1.1) { SAVE4.intro = true; persist4(); c4MarketStart(); } }
}
function c4RenderStory(g, V) {
  const cx = C4.camX, t = C4.storyT, [who, text] = C4_TALK[C4.line], gy = C4_Y0 + 120;
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx + V.vw * .78, -V.oy + 110, 30, 0, 6.283); g.fill(); g.stroke();   // the moon
  g.fillStyle = 'rgba(91,47,31,.16)'; g.fillRect(cx - 20, gy, V.vw + 40, V.vh);
  dp(g, WP.house, 0, gy, 0, .8, .8);
  dp(g, PROPS.chum, 230, gy, 0, .6, .6);
  const hb = who === 'h' ? Math.abs(Math.sin(t * 9)) * 3 : 0, wb = who === 'w' ? Math.abs(Math.sin(t * 9)) * 3 : 0;
  c4Mouse(g, MICE.groom, -95, 1, 0, false, who === 'h' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - hb);
  c4Mouse(g, MICE.b, 95, -1, 0, false, who === 'w' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - wb);
  // the slip of whoever is talking: sized to its words, kept on screen, its dots towards the speaker
  const B = c4Bubble(text, who === 'h' ? -1 : 1, 18, Math.min(280, V.vw - 70)), k = Math.min(1, C4.lineT * 6), sc = .85 + .15 * k;
  const half = B.w / 2 * sc, x = Math.max(cx + half + 8, Math.min(cx + V.vw - half - 8, who === 'h' ? -40 : 40));
  g.globalAlpha = k; dp(g, B, x, gy - 210 - B.bh, 0, sc, sc); g.globalAlpha = 1;
}

/* ---------- the day ---------- */
const c4Lv = () => C4_LV[SAVE4.lv];
function startC4() {
  AU.init(); AU.setSong(6); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 4; S.mode = 'c4play';
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  $('#c4hud').hidden = false; $('#c4day').hidden = true; $('#c4up').hidden = true;
  SAVE4.started = true; persist4();
  if (!SAVE4.intro) { c4StoryStart(); cv.focus(); return; }
  c4MarketStart();
}
function c4MarketStart() {
  $('#c4hud').hidden = false;
  Object.assign(C4, { mins: C4_OPEN, phase: 'open', walkers: [], queue: [], fx: [], boat: null, porter: null, serve: null, build: null, drag: null, spawnT: .3,
    today: { sold: 0, take: 0, cogs: 0, served: 0, lost: 0 }, chatT: 1, wife: { say: null }, porter: { x: c4HusbX(), z: .04, st: 'idle', ph: 0, say: null, t: 0 }, vendors: C4_VENDORS.map(v => ({ ...v, M: MICE[v.M], say: null, callT: 3 + R() * 8 })) });
  C4.camX = C4_STALL - c4View().vw * .5;
  // the lane is already busy when the day opens
  for (let i = 0; i < 8; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
  c4Hud(); cv.focus();
}
function c4Hide() { $('#c4hud').hidden = true; $('#c4day').hidden = true; $('#c4up').hidden = true; }
const c4Say = (who, text, life = 1.6 + text.length * .045) => { who.say = { text, t: 0, life }; };
function c4Spawn(atX) {
  const lv = c4Lv(), busy = C4_BUSY[c4Hour(C4.mins)] || .3;
  let r = R(), kind = 'mouse'; for (const [k, p] of C4_KINDS) { if (r < p) { kind = k; break; } r -= p; }
  const fromRight = atX === undefined ? R() < .6 : R() < .5, sort = (R() * C4_MOUSE_SORTS.length) | 0, role = C4_MOUSE_SORTS[sort].role;
  const x = atX !== undefined ? atX : fromRight ? C4.camX + c4View().vw + 120 + R() * 200 : C4_GATE - 40;
  const sp = { mouse: role === 'old' ? 34 + R() * 10 : role === 'child' ? 80 + R() * 30 : 55 + R() * 40, duck: 40, rooster: 65, dog: 105, toad: 50 }[kind];
  C4.walkers.push({ kind, sort, M: c4MouseRig(sort), seed: R() * 6, name: c4Pick(C4_NAMES[kind === 'mouse' && role !== 'adult' ? role : kind]), x, z: .38 + R() * .6, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1, sp, ph: R() * 6,
    buy: !C4.build && !(kind === 'mouse' && role === 'child') && R() < lv.buy * .56 * (.7 + busy * .4), st: 'walk', n: 1 + ((R() * 3) | 0), carry: null, cd: 3 + R() * 6, say: null });
}
function updateC4(dt) {
  C4.t += dt;
  if (C4.phase === 'story') { c4StoryUpdate(dt); return; }
  if (C4.paused) return;                                                 // a sheet is open: the market waits
  const lv = c4Lv();
  for (const f of C4.fx) f.t += dt; C4.fx = C4.fx.filter(f => f.t < 1.2);
  for (const e of [...C4.walkers, C4.wife, ...C4.vendors, C4.porter]) if (e.say && (e.say.t += dt) > e.say.life) e.say = null;
  if (C4.phase === 'open') {
    C4.mins += dt * C4_MPS;
    const busy = C4_BUSY[c4Hour(C4.mins)] || .3;
    if ((C4.spawnT -= dt) <= 0) { C4.spawnT = 1 / (.9 * busy * lv.flow) * (.6 + R() * .8); c4Spawn(); }
    for (const v of C4.vendors) if ((v.callT -= dt) <= 0) { v.callT = 9 + R() * 9; if (Math.abs(v.x - C4.camX - c4View().vw / 2) < 600) c4Say(v, c4Pick(v.calls)); }
    if (C4.mins >= C4_CLOSE) { C4.mins = C4_CLOSE - 1; c4EndDay(); }   // stays in giờ Dậu
  }
  // the folk on the lane
  for (const w of C4.walkers) {
    w.cd -= dt;
    if (w.st === 'walk') {
      w.x += w.face * w.sp * dt; w.ph += dt * w.sp / 9;
      if (w.buy && C4.phase === 'open' && Math.abs(w.x - (C4_STALL + C4_QX[SAVE4.lv])) < 140 && C4.queue.length < 4) { w.st = 'queue'; w.wait = 0; C4.queue.push(w); }
      else if (R() < dt * .006 && !w.say) c4Say(w, c4Pick(C4_ALONE));
    } else if (w.st === 'queue') {
      const i = C4.queue.indexOf(w), tx = C4_STALL + C4_QX[SAVE4.lv] + i * 62, dx = tx - w.x, dz = C4_Q_Z - w.z, d = Math.hypot(dx, dz * 300);
      w.moving = d > 3;
      if (w.moving) { const k = Math.min(1, 90 * dt / d); w.x += dx * k; w.z += dz * k; w.ph += dt * 9; w.face = dx < -1 ? -1 : dx > 1 ? 1 : -1; } else w.face = -1;
      w.wait += dt;
      if (w.wait > lv.wait + i * 2 && C4.serve?.who !== w) { c4Say(w, c4Pick(C4_GIVEUP)); c4Leave(w, false); C4.today.lost++; }
    } else if (w.st === 'chat') {
      const c = w.chat; if (c.a === w) c4ChatStep(c, dt);
    } else if (w.st === 'leave') { w.x += w.face * w.sp * dt; w.ph += dt * w.sp / 9; }
  }
  // two folk meeting on the lane may stop and talk (not too many at once, so the words can be read)
  if ((C4.chatT -= dt) <= 0) {
    C4.chatT = .35;
    const free = C4.walkers.filter(w => w.st === 'walk' && w.cd <= 0 && !w.buy), talking = C4.walkers.filter(w => w.st === 'chat').length / 2;
    if (talking < 3) for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
      const a = free[i], b = free[j];
      if (Math.abs(a.x - b.x) < 80 && Math.abs(a.z - b.z) < .2 && Math.abs(a.x - C4.camX - c4View().vw / 2) < c4View().vw * .6) {
        a.cd = b.cd = 5; if (R() < .85) { c4ChatStart(a, b); i = free.length; break; }
      }
    }
  }
  C4.walkers = C4.walkers.filter(w => w.x > -300 && w.x < C4_W + 300 && (w.st !== 'walk' || Math.abs(w.x - C4.camX) < 1600));
  // the wife serves the front of the queue, if there is anything left to sell
  if (!C4.serve && C4.queue.length && SAVE4.stock > 0 && !C4.build) {
    const w = C4.queue[0]; if (!w.moving && Math.abs(w.x - (C4_STALL + C4_QX[SAVE4.lv])) < 4) { C4.serve = { who: w, t: 0 }; c4Say(w, c4Pick(C4_BUY).replace('{n}', w.n)); }
  }
  if (C4.serve) {
    C4.serve.t += dt;
    if (C4.serve.t >= lv.serve + .6) {
      const w = C4.serve.who, n = Math.min(w.n, SAVE4.stock), pay = n * C4_PRICE;
      SAVE4.stock -= n; SAVE4.money += pay; C4.today.sold += n; C4.today.take += pay; C4.today.cogs += n * (C4.unitCost || lv.cost); C4.today.served++;
      C4.fx.push({ x: C4_STALL + 40, y: c4Y(C4_STALL_Z) - 210, t: 0, s: '+' + pay }); AU.pluck(84 + (pay % 5));
      if (w.kind === 'mouse') w.carry = MP.ladong;
      c4Say(C4.wife, c4Pick(C4_SELL)); c4Leave(w, true); C4.serve = null; c4Hud();
    }
  }
  // restocking: send for the trader when the baskets run low
  // restocking: the husband walks off to the trader at the landing and comes back carrying the goods
  const P = C4.porter;
  if (P.st === 'idle' && !C4.build && SAVE4.stock <= lv.cap * .3 && SAVE4.debt + lv.cap * lv.cost <= C4_DEBT + SAVE4.money) { P.st = 'out'; P.qty = lv.cap - SAVE4.stock; P.cost = lv.cost; }
  if (P.st === 'out') { P.x -= 150 * dt; P.z = Math.min(.3, P.z + dt * .2); P.ph += dt * 10; if (P.x <= Math.min(C4_OFF, C4.camX - 110)) { P.st = 'away'; P.t = 2; } }   // just out of sight is far enough
  else if (P.st === 'away') { if ((P.t -= dt) <= 0) { P.st = 'back'; AU.click(); } }
  else if (P.st === 'back') { P.x += 140 * dt; P.ph += dt * 10; if (P.x >= c4HusbX() - 60) P.z = Math.max(.04, P.z - dt * .5); if (P.x >= c4HusbX()) { P.x = c4HusbX(); P.z = .04; P.st = 'idle'; c4Deliver(); } }
  if (SAVE4.debt > 0 && SAVE4.money > 0) { const p = Math.min(SAVE4.debt, SAVE4.money, dt * 40); SAVE4.debt -= p; SAVE4.money -= p; }
  if (C4.build) { C4.build.t += dt; if (Math.floor(C4.build.t * 3) !== Math.floor((C4.build.t - dt) * 3)) AU.tap(); if (C4.build.t >= 6) { SAVE4.lv = C4.build.to; if (C4.porter.st === 'idle') C4.porter.x = c4HusbX(); C4.build = null; AU.drumOne(); AU.pluck(88); persist4(); c4Hud(); } }
  C4.camX = Math.max(-140, Math.min(C4_W - c4View().vw + 40, C4.camX));
  if ((C4.hudT = (C4.hudT || 0) - dt) <= 0) { C4.hudT = .25; c4Hud(); }
  if ((C4.saveT = (C4.saveT || 0) - dt) <= 0) { C4.saveT = 5; persist4(); }
}
// a chat: the two stop, face each other and take turns through one of the little scripts
function c4ChatStart(a, b) {
  if (a.x > b.x) [a, b] = [b, a];
  const others = [...C4.walkers.filter(w => w !== a && w !== b).map(w => w.name), ...C4.vendors.map(v => v.name)].filter(n => n !== a.name && n !== b.name);
  const fill = s => s.replace(/\{A\}/g, a.name).replace(/\{B\}/g, b.name).replace(/\{X\}/g, () => c4Pick(others.length ? others : ['ông Lý']));
  const script = c4Pick(C4_CHATS).map(([k, s]) => [k, fill(s).replace(/^./, ch => ch.toUpperCase())]);
  const c = { a, b, script, i: -1, t: 0 };
  for (const w of [a, b]) { w.st = 'chat'; w.chat = c; }
  a.face = 1; b.face = -1; const mid = (a.x + b.x) / 2, mz = (a.z + b.z) / 2; a.x = mid - 42; b.x = mid + 42; a.z = b.z = mz;
}
function c4ChatStep(c, dt) {
  c.t -= dt; if (c.t > 0) return;
  for (const w of [c.a, c.b]) w.talk = false;
  if (++c.i >= c.script.length) { for (const w of [c.a, c.b]) { w.st = 'walk'; w.face = w.dir; w.chat = null; w.cd = 18 + R() * 14; } return; }
  const [k, s] = c.script[c.i], who = k ? c.b : c.a;
  who.talk = true; const life = 1.5 + s.length * .05; c4Say(who, s, life); c.t = life + .25;
}
function c4Leave(w, bought) { const i = C4.queue.indexOf(w); if (i >= 0) C4.queue.splice(i, 1); w.st = 'leave'; w.face = bought ? (R() < .5 ? 1 : -1) : 1; w.sp = (w.kind === 'mouse' ? 70 : w.sp) + R() * 20; }
function c4Deliver() {
  const B = C4.porter;
  const cost = B.qty * B.cost;
  C4.unitCost = ((C4.unitCost || B.cost) * SAVE4.stock + B.cost * B.qty) / (SAVE4.stock + B.qty);   // the blended price of what is in stock
  SAVE4.stock += B.qty;
  const paid = Math.min(SAVE4.money, cost); SAVE4.money -= paid; SAVE4.debt += cost - paid;
  C4.fx.push({ x: c4HusbX(), y: c4Y(.04) - 200, t: 0, s: '+' + B.qty + ' miếng' }); AU.pluck(76); c4Hud();
  c4Say(C4.porter, c4Pick(C4_HUSBAND)); setTimeout(() => { if (C4.wife) c4Say(C4.wife, c4Pick(C4_WIFE_GOT)); }, 1300);
}
function c4EndDay() {
  C4.phase = 'night'; persist4();
  for (const w of C4.walkers) if (w.st !== 'leave') { w.st = 'leave'; w.face = w.x < C4_STALL ? -1 : 1; w.chat = null; w.talk = false; }
  C4.queue = []; C4.serve = null;
  const d = C4.today, gain = d.take - d.cogs;
  if (gain > SAVE4.best) SAVE4.best = gain;
  $('#c4dayT').textContent = `Ngày ${SAVE4.day} đã tan chợ`;
  $('#c4dayB').innerHTML = `<div><b>${c4Money(d.take)}</b><span>Bán được</span></div><div><b>${c4Money(d.cogs)}</b><span>Tiền hàng</span></div><div class="gain"><b>${c4Money(gain)}</b><span>Lãi</span></div>`;
  $('#c4dayN').textContent = `${d.sold} miếng trầu · ${d.served} khách mua${d.lost ? ' · ' + d.lost + ' khách bỏ đi' : ''}${SAVE4.debt > 0 ? ' · còn nợ lái buôn ' + c4Money(SAVE4.debt) : ''}`;
  setTimeout(() => { if (S.mode === 'c4play' && C4.phase === 'night') $('#c4day').hidden = false; }, 900);
}
function c4NewDay() {
  $('#c4day').hidden = true; SAVE4.day++; persist4();
  C4.mins = C4_OPEN; C4.phase = 'open'; C4.today = { sold: 0, take: 0, cogs: 0, served: 0, lost: 0 }; C4.spawnT = .3; c4Hud();
  for (let i = 0; i < 6; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
}
function c4Hud() {
  $('#c4Money').textContent = c4Money(SAVE4.money);
  $('#c4Time').textContent = `Ngày ${SAVE4.day} · giờ ${c4Hour(C4.mins)}`;
  const lv = c4Lv(); $('#c4Stock').textContent = `Trầu ${SAVE4.stock}/${lv.cap}`;
  $('#c4Debt').textContent = SAVE4.debt > 0.5 ? 'Nợ ' + c4Money(SAVE4.debt) : '';
  $('#c4Debt').hidden = !(SAVE4.debt > 0.5);
}

/* ---------- upgrading ---------- */
function c4OpenUp() {
  const lv = SAVE4.lv, cur = C4_LV[lv], nx = C4_LV[lv + 1];
  $('#c4upT').textContent = cur.name;
  if (!nx) { $('#c4upB').innerHTML = `<p>Gian hàng khang trang nhất phiên chợ.</p><p>Chứa ${cur.cap} miếng · lái buôn lấy ${cur.cost} đồng/miếng</p>`; $('#c4upGo').hidden = true; }
  else {
    $('#c4upB').innerHTML = `<p class="now">Đang có: chứa ${cur.cap} miếng · nhập ${cur.cost} đồng/miếng</p><p class="nx">Lên <b>${nx.name}</b>: chứa ${nx.cap} miếng · nhập ${nx.cost} đồng/miếng · khách ghé đông hơn, bán nhanh hơn</p>`;
    $('#c4upGo').hidden = false; $('#c4upGo').disabled = !(SAVE4.money >= nx.up && !C4.build); $('#c4upGo').textContent = `Nâng cấp · ${c4Money(nx.up)}`;
  }
  $('#c4up').hidden = false; C4.paused = true;
}
function c4CloseUp() { $('#c4up').hidden = true; C4.paused = false; cv.focus(); }
function c4DoUp() {
  const nx = C4_LV[SAVE4.lv + 1]; if (!nx || SAVE4.money < nx.up || C4.build) return;
  SAVE4.money -= nx.up; C4.build = { to: SAVE4.lv + 1, t: 0 };
  for (const w of [...C4.queue]) c4Leave(w, false); C4.serve = null;
  c4CloseUp(); persist4(); c4Hud(); AU.stamp();
}
const c4CanUp = () => { const nx = C4_LV[SAVE4.lv + 1]; return nx && SAVE4.money >= nx.up && !C4.build; };

/* ---------- drawing ---------- */
function renderC4() {
  const A = c4Art(), V = c4View(), Sc = V.s * DPR, vw = V.vw, cx = C4.camX, oy = V.oy;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.yellow.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(Sc, 0, 0, Sc, -cx * Sc, oy * Sc);
  const pw = PAPER.width; for (let px = Math.floor(cx / pw) * pw; px < cx + vw; px += pw) ctx.drawImage(PAPER, px, -oy - 20, pw, Math.max(V.vh + 40, PAPER.height));
  const g = ctx, vis = (x, w) => x + w > cx - 40 && x - w < cx + vw + 40;
  if (C4.phase === 'story') {
    c4RenderStory(g, V);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(40,30,60,.22)'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (C4.fade > 0) { ctx.fillStyle = `rgba(242,236,222,${Math.min(1, C4.fade * 1.4)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (!C4.tapped && C4.storyT > 1.5) c4TapHint();
    return;
  }
  // sky: the red sun crossing the day; the far row of the village, faded and drifting slower
  const dayK = Math.max(0, Math.min(1, (C4.mins - C4_OPEN) / (C4_CLOSE - C4_OPEN)));
  g.save(); g.translate(cx * .85, 0);
  g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(80 + dayK * (vw - 160), -oy + 90 + Math.pow(dayK * 2 - 1, 2) * 110, 32, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  g.save(); g.translate(cx * .55, 0); g.globalAlpha = .5;
  for (const [x, k, sc] of [[-80, 'house', .45], [260, 'bamboo', .5], [520, 'house', .42], [880, 'tree', .45], [1180, 'house', .45], [1500, 'bamboo', .45], [1720, 'house', .42]])
    if (x + 150 > cx * .45 - 40 && x - 150 < cx * .45 + vw + 40) dp(g, k === 'house' ? WP.house : k === 'tree' ? WP.bigTree : PROPS.bamboo, x, C4_Y0 - 70, 0, sc, sc);
  g.globalAlpha = 1; g.restore();
  // the lane: trodden earth seen from a little above, wheel ruts along it, grass at its near edge and below
  g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, C4_Y0 - 4, vw + 100, C4_D + 10);
  g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, C4_Y0 + C4_D + 6, vw + 100, V.vh);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, C4_Y0 - 4); g.lineTo(cx + vw + 50, C4_Y0 - 4); g.stroke();
  g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1.4; g.setLineDash([18, 14]);
  for (const z of [.45, .78]) { g.beginPath(); g.moveTo(cx - 50, c4Y(z)); g.lineTo(cx + vw + 50, c4Y(z)); g.stroke(); }
  g.setLineDash([]);
  g.strokeStyle = '#2f6a4c'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0, rr = mulberry(41); i < 110; i++) { const tx = -300 + rr() * (C4_W + 300), ty = C4_Y0 + C4_D + 14 + rr() * Math.max(20, V.vh - oy - C4_Y0 - C4_D - 30); if (!vis(tx, 20)) continue; g.beginPath(); for (const d of [-6, 0, 6]) { g.moveTo(tx + d, ty); g.lineTo(tx + d * 1.6, ty - 12 - Math.abs(d)); } g.stroke(); }
  // the village along the far edge of the lane
  for (const [x, k, s] of [[960, 'tree', .9], [1360, 'house', .72], [1760, 'house', .7], [2050, 'bamboo', .8], [2220, 'hay', .9], [600, 'house', .62], [210, 'bamboo', .7]])
    if (vis(x, 260)) dp(g, k === 'tree' ? WP.bigTree : k === 'house' ? WP.house : k === 'bamboo' ? PROPS.bamboo : PROPS.hay, x, C4_Y0, 0, s, s);
  if (vis(C4_GATE, 140)) dp(g, A.gate, C4_GATE, C4_Y0 + 6, 0, .88, .88);
  // everyone and everything on the lane, far first
  const items = [], bubbles = [];
  const head = (x, z, tall, e, pri = 1) => { if (e && e.say) bubbles.push({ e, x, y: c4Y(z) - tall * c4S(z) - 8, s: c4S(z), pri }); };
  for (const v of C4.vendors) if (vis(v.x, 140)) {
    items.push({ z: .05, f: () => c4Mouse(g, v.M, v.x - 40, 1, C4.t * 2 + v.x, false, v.say ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null, null, c4S(.05) * .95, c4Y(.05), v.x) });
    items.push({ z: .1, f: () => dp(g, A[v.ware], v.x + 50, c4Y(.1), 0, c4S(.1), c4S(.1)) });
    head(v.x - 40, .05, 168 * .95, v, 0);
  }
  const lv = SAVE4.lv;
  if (C4.build) items.push({ z: C4_STALL_Z, f: () => { dp(g, A.scaffold, C4_STALL, c4Y(C4_STALL_Z), 0, c4S(C4_STALL_Z), c4S(C4_STALL_Z)); for (let i = 0; i < 3; i++) { const k = (C4.t * .8 + i / 3) % 1; g.globalAlpha = .5 * (1 - k); g.fillStyle = '#c3b596'; g.beginPath(); g.arc(C4_STALL - 60 + i * 60, c4Y(C4_STALL_Z) - 20 - k * 60, 14 + k * 20, 0, 6.283); g.fill(); g.globalAlpha = 1; } } });
  else {
    const serving = C4.serve ? Math.sin(Math.min(1, C4.serve.t / (c4Lv().serve + .6)) * Math.PI) : 0, wx = C4_STALL - (lv ? 70 : 130);
    items.push({ z: C4_WIFE_Z, f: () => c4Mouse(g, MICE.b, wx, 1, C4.t * 2, false, -.2 - serving * 1.1, serving > .3 ? MP.ladong : null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), 2.1) });
    items.push({ z: C4_STALL_Z, f: () => dp(g, c4StallArt(lv), C4_STALL + (lv ? 10 : 30), c4Y(C4_STALL_Z), 0, c4S(C4_STALL_Z), c4S(C4_STALL_Z)) });
    head(wx, C4_WIFE_Z, 168, C4.wife, 2);
  }
  { const P = C4.porter, walk = P.st === 'out' || P.st === 'back', load = P.st === 'back';
    if (P.st !== 'away' && vis(P.x, 80)) items.push({ z: P.z, f: () => c4Mouse(g, MICE.groom, P.x, P.st === 'out' ? -1 : 1, P.ph, walk, load ? -1.35 : null, load ? WP.basket : null, c4S(P.z), c4Y(P.z), 1.3) });
    head(P.x, P.z, 168, P, 2); }
  for (const w of C4.walkers) if (vis(w.x, 80)) { items.push({ z: w.z, f: () => c4Critter(g, w, w.x, c4Y(w.z), c4S(w.z)) }); head(w.x, w.z, C4_TALL[w.kind] * (w.kind === 'mouse' ? .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .68 : 1) : 1), w, w.st === 'chat' || w.st === 'queue' ? 1.5 : .5); }
  items.sort((a, b) => a.z - b.z); for (const it of items) it.f();
  if (c4CanUp() && C4.phase === 'open' && !C4.build) { const b = Math.sin(C4.t * 4) * 6, ax = C4_STALL + 20, ay = c4Y(C4_STALL_Z) - [200, 270, 310][lv] * c4S(C4_STALL_Z) + b; g.fillStyle = '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ax, ay - 26); g.lineTo(ax + 20, ay); g.lineTo(ax + 8, ay); g.lineTo(ax + 8, ay + 18); g.lineTo(ax - 8, ay + 18); g.lineTo(ax - 8, ay); g.lineTo(ax - 20, ay); g.closePath(); g.fill(); g.stroke(); }
  // patience bars over the queue, coins, then the speech bubbles on top of everything
  for (const w of C4.queue) { const k = Math.max(0, 1 - w.wait / (c4Lv().wait + C4.queue.indexOf(w) * 2)), y = c4Y(w.z) - C4_TALL[w.kind] * c4S(w.z) - 14; if (w.say) continue; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(w.x - 22, y, 44, 7); g.strokeRect(w.x - 22, y, 44, 7); g.fillStyle = k > .4 ? '#2f6a4c' : '#a3332a'; g.fillRect(w.x - 21, y + 1, 42 * k, 5); }
  for (const f of C4.fx) { const k = f.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = '900 26px "Playfair Display", serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = f.s[0] === '+' ? '#2f6a4c' : INK; g.strokeText(f.s, f.x, f.y - k * 40); g.fillText(f.s, f.x, f.y - k * 40); g.restore(); }
  // small bubbles, each right over its speaker; the couple, chats and buyers first — one that would cover a bubble
  // already shown waits (it is not pushed away from its speaker)
  bubbles.sort((a, b) => b.pri - a.pri || a.e.say.t - b.e.say.t);
  const placed = [];
  for (const b of bubbles) {
    const sy = b.e.say, B = c4Bubble(sy.text, 0, 13, 150), a = Math.min(1, sy.t * 6, (sy.life - sy.t) * 4), sc = (.8 + .2 * b.s) * (.9 + .1 * Math.min(1, sy.t * 6));
    const half = B.w / 2 * sc, x = Math.max(cx + half + 4, Math.min(cx + vw - half - 4, b.x)), y = b.y - (B.bh + 30) * sc, hh = (B.bh + 6) * sc, bw = (B.w / 2 - 8) * sc;
    if (placed.some(p => Math.abs(p.x - x) < p.w + bw && Math.abs(p.y - y) < p.h + hh)) continue;
    placed.push({ x, y, w: bw, h: hh });
    g.globalAlpha = Math.max(0, a); dp(g, B, x, y, 0, sc, sc); g.globalAlpha = 1;
  }
  const m = C4.mins, dusk = C4.phase === 'night' ? .45 : Math.max(0, Math.min(.3, (m - (C4_CLOSE - 60)) / 60 * .3)) + Math.max(0, (C4_OPEN + 40 - m) / 40 * .18);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (dusk > 0) { ctx.fillStyle = `rgba(40,30,60,${dusk})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
// the chương I tap critter in the corner (a finger on phones), until the first tap through the talk
function c4TapHint() {
  const A = howtoArt(), W = cv.width / DPR, H = cv.height / DPR, Z = Math.min(1.35, Math.max(1.1, W / 420)), ph = (C4.storyT % 1.2) / 1.2, tap = ph < .18;
  ctx.save(); ctx.setTransform(DPR * Z, 0, 0, DPR * Z, (W - 34 - 35 * Z) * DPR, (H - 34 - 35 * Z) * DPR);
  if (isTouch) { if (tap) { ctx.strokeStyle = INK; ctx.lineWidth = 1.6; for (const r of [9, 15]) { ctx.globalAlpha = 1 - ph / .18; ctx.beginPath(); ctx.arc(-3, -30, r, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1; } dp(ctx, A.finger, 0, -27 - (tap ? 0 : Math.sin(ph * Math.PI) * 6), -.15, .62, .62); }
  else { dp(ctx, A.mouse, 0, -9, 0, .72, .72); if (tap) dp(ctx, A.click, 0, -9, 0, .72, .72); }
  ctx.restore();
}

/* ---------- input: drag to look along the lane, tap the stall ---------- */
function c4World(e) { const r = cv.getBoundingClientRect(), V = c4View(); return [(e.clientX - r.left) / V.s + C4.camX, (e.clientY - r.top) / V.s - V.oy]; }
function c4Down(e) { if (S.mode !== 'c4play') return; C4.drag = { x0: e.clientX, cam0: C4.camX, moved: false }; if (C4.phase !== 'story') capturePointer(e); }
function c4Move(e) { const d = C4.drag; if (!d || C4.phase === 'story') return; const dx = e.clientX - d.x0; if (Math.abs(dx) > 8) d.moved = true; if (d.moved) C4.camX = d.cam0 - dx / c4View().s; }
function c4Up(e) {
  const d = C4.drag; C4.drag = null; if (!d || d.moved || S.mode !== 'c4play') return;
  if (C4.phase === 'story') { c4StoryNext(); return; }
  const [x, y] = c4World(e), sy = c4Y(C4_STALL_Z), s = c4S(C4_STALL_Z);
  if (Math.abs(x - C4_STALL) < 170 * s && y > sy - 300 * s && y < sy + 30) { AU.tap(); c4OpenUp(); }
}
function c4Key(e) {
  if (C4.phase === 'story' && ['Space', 'Enter', 'ArrowRight'].includes(e.code)) { e.preventDefault(); c4StoryNext(); return; }
  if (e.code === 'Escape') { if (!$('#c4up').hidden) c4CloseUp(); else showAlbum(4); }
}

/* ---------- HUD, sheets, album, registration ---------- */
{
  const hud = document.createElement('div'); hud.id = 'c4hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="c4Name">Vợ Chồng Khởi Nghiệp</button><div class="mid"><div class="tag" id="c4Time"></div></div><div class="right"><div class="tag" id="c4Money"></div><div class="tag" id="c4Stock"></div><div class="tag debt" id="c4Debt" hidden></div></div>';
  const day = document.createElement('div'); day.id = 'c4day'; day.hidden = true;
  day.innerHTML = '<div class="card4"><h3 id="c4dayT"></h3><div class="nums" id="c4dayB"></div><p id="c4dayN"></p><button class="btn" id="c4dayGo">Họp chợ ngày mới</button></div>';
  const up = document.createElement('div'); up.id = 'c4up'; up.hidden = true;
  up.innerHTML = '<div class="card4"><h3 id="c4upT"></h3><div id="c4upB"></div><div class="row"><button class="btn" id="c4upGo"></button><button class="btn alt" id="c4upX">Đóng</button></div></div>';
  document.body.append(hud, day, up);
  $('#c4Name').addEventListener('click', () => showAlbum(4));
  $('#c4dayGo').addEventListener('click', c4NewDay);
  $('#c4upGo').addEventListener('click', c4DoUp);
  $('#c4upX').addEventListener('click', c4CloseUp);
  up.addEventListener('click', e => { if (e.target === up) c4CloseUp(); });
}
function buildAlbum4() {
  const box = $('#cards'); box.textContent = '';
  const b = document.createElement('button'); b.className = 'card'; b.style.background = PAPERS.yellow.css;
  b.innerHTML = `<div class="num">Phiên chợ</div><div class="ch">市</div><b>${C4_LV[SAVE4.lv].name}</b><span class="st${SAVE4.started ? ' done' : ''}">${SAVE4.started ? 'Ngày ' + SAVE4.day + ' · ' + c4Money(SAVE4.money) : 'Ra chợ'}</span>`;
  b.addEventListener('click', startC4); box.appendChild(b);
  if (SAVE4.started) {
    const r = document.createElement('button'); r.className = 'card'; r.style.background = '#cfcbd0';
    r.innerHTML = '<div class="num">Làm lại</div><div class="ch">新</div><b>Gánh mới</b><span class="st">Bắt đầu lại từ gánh trầu</span>';
    r.addEventListener('click', () => { if (confirm('Bắt đầu lại từ đầu? Tiền và quầy hiện có sẽ mất.')) { SAVE4 = C4_NEW(); persist4(); buildAlbum4(); } });
    box.appendChild(r);
  }
}
// still being made: open only when the game runs on this computer (localhost), closed on the published site
const C4_LOCAL = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
registerChapter({
  id: 4, modes: ['c4play'], locked: () => !C4_LOCAL,
  card: { num: 'Chương IV', han: '創業', name: 'Vợ Chồng Khởi Nghiệp', desc: 'Vợ chồng chuột mới cưới bàn nhau làm ăn: không đi ăn trộm, mà ra chợ mở gánh trầu cau, rồi gây dựng cả một gian hàng.', bg: PAPERS.yellow.css },
  progress: () => SAVE4.started ? `Ngày ${SAVE4.day}` : 'Mới mở',
  hasProgress: () => SAVE4.started,
  album() { buildAlbum4(); $('#albumTitle').textContent = 'Chương IV · Vợ Chồng Khởi Nghiệp'; $('#albumDesc').textContent = 'Buôn bán ở chợ làng: bán trầu, nhập hàng, nâng gánh thành sạp, thành gian hàng.'; },
  hide: c4Hide,
  update: updateC4, render: renderC4, key: c4Key,
  pointer: { down: c4Down, move: c4Move, up: c4Up },
  next() { startC4(); }, retry() { startC4(); },
});
