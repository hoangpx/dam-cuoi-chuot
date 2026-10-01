/* Chương IV · Vợ Chồng Khởi Nghiệp 創業 — a village-market trading game.
   It opens with the newly-wed mouse couple talking over how to make a living: he wants to steal food, she says no —
   it is dangerous, and what would their children do? — "phi thương bất phú", so they open a betel stall at the market.
   THE GOAL: put by C4_GOAL (2 quan); then she is with child, a brood of mice is born, and chương V (their adventures)
   opens. The player may keep trading after that, to open more stalls.
   A day: in the morning the player sees the weather and what was overheard and decides how much of each ware to buy
   (most wares do not keep: unsold betel wilts, tea is poured away, sticky rice goes off at noon — losses). Along the lane
   are empty plots: rent one (and hire a helper, paid each evening) to sell green tea, sticky rice, haberdashery or crab
   noodle soup; each sells at its own hours and weather. Folk of many sorts walk the lane, each with a name; two who meet
   stop to chat (folk.js). Some WHISPER ("…" and an ear): tap them to overhear news of tomorrow for the notebook (mostly
   true, sometimes rumour). Buyers queue at the stall they want, say what they want and are served one by one. Things go
   wrong: the cat, the headman's dues, thieves, rotten areca, a dog knocking the tea over, helpers falling ill or skimming,
   a rival betel stall, a gale, a fire, the district's levy… each needs a decision (#c4ev). Owing the trader too much three
   mornings running is ruin. The day runs by the old double-hours with the modern clock beside them, and ends with a tally.
   Drag sideways to look along the lane. Money is counted in đồng (600 đồng a quan). Art: art.js; folk and lines: folk.js. */
const C4 = { t: 0, camX: 0, mins: 300, phase: 'open', walkers: [], fx: [], porter: null, build: null, drag: null, spawnT: 1, Q: {}, SV: {} };
const C4_W = 2350, C4_STALL = 720, C4_GATE = 390, C4_OFF = 300;           // … how far (at least) the husband goes for goods
const c4HusbX = () => SAVE4.lv ? C4_STALL + 70 : C4_STALL - 40;           // where he waits: just behind the betel stall
const C4_Y0 = 300, C4_D = 190;                                            // the lane: its far edge on screen, and its depth
const c4Y = z => C4_Y0 + z * C4_D, c4S = z => .62 + .42 * z;              // where depth z stands on screen, and how big
const C4_STALL_Z = .12, C4_WIFE_Z = .07, C4_Q_Z = .32;
const C4_OPEN = 5 * 60, C4_CLOSE = 19 * 60, C4_MPS = 4;                 // market hours (game minutes), game minutes per second
const C4_GOAL = 1200;                                                     // 2 quan: then the children come, and chương V
// the betel stall's three sizes: how much it holds, what the trader charges, how long a sale takes, how many come by
const C4_LV = [
  { name: 'Gánh trầu', cap: 60, cost: 4, serve: 1.8, flow: 1, buy: .45, wait: 12, up: 0 },
  { name: 'Sạp lều', cap: 150, cost: 3, serve: 1.35, flow: 1.4, buy: .57, wait: 9, up: 180 },
  { name: 'Gian mái ngói', cap: 300, cost: 2, serve: .95, flow: 1.9, buy: .68, wait: 7, up: 900 },
];
const C4_HOURS = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const C4_BUSY = { 'Mão': .7, 'Thìn': 1, 'Tỵ': .8, 'Ngọ': .35, 'Mùi': .5, 'Thân': .9, 'Dậu': .45 };   // how busy each double-hour is
// the wares: where their stall stands, price and cost, when they keep, who wants them at which hour and weather
const C4_GOODS = {
  trau: { name: 'Trầu cau', unit: 'miếng', x: C4_STALL, price: 6, keep: 'day', serve: 0, hours: C4_BUSY, wx: { gat: 1, mua: .9, ret: 1, dep: 1 } },
  che: { name: 'Chè xanh', unit: 'bát', x: 990, price: 4, cost: 1, fuel: 10, keep: 'day', rent: 100, wage: 8, from: 2, cap: 80, serve: 1, art: 'che',
    hours: { 'Mão': 1.5, 'Thìn': 1.2, 'Tỵ': .8, 'Ngọ': .4, 'Mùi': .5, 'Thân': .8, 'Dậu': .7 }, wx: { gat: .4, mua: 1.7, ret: 2.1, dep: 1 } },
  xoi: { name: 'Xôi', unit: 'gói', x: 1370, price: 8, cost: 4, keep: 'noon', rent: 200, wage: 10, from: 4, cap: 60, serve: 1.2, art: 'xoi',
    hours: { 'Mão': 1.8, 'Thìn': 1.4, 'Tỵ': .7, 'Ngọ': 0, 'Mùi': 0, 'Thân': 0, 'Dậu': 0 }, wx: { gat: .8, mua: .9, ret: 1.4, dep: 1 } },
  xen: { name: 'Hàng xén', unit: 'món', x: 1750, price: 10, cost: 8, keep: 'ever', rent: 300, wage: 8, from: 6, cap: 60, serve: 1.6, art: 'xen',
    hours: { 'Mão': .6, 'Thìn': .9, 'Tỵ': .9, 'Ngọ': .6, 'Mùi': .7, 'Thân': .9, 'Dậu': .6 }, wx: { gat: .8, mua: .6, ret: 1, dep: 1 } },
  bun: { name: 'Bún riêu', unit: 'bát', x: 2130, price: 15, cost: 9, keep: 'day', rent: 500, wage: 15, from: 8, cap: 50, serve: 2.2, art: 'bun',
    hours: { 'Mão': .3, 'Thìn': .5, 'Tỵ': .9, 'Ngọ': 1.7, 'Mùi': 1.2, 'Thân': .5, 'Dậu': .3 }, wx: { gat: .7, mua: 1.1, ret: 1.4, dep: 1 } },
};
const C4_SHOPS = ['che', 'xoi', 'xen', 'bun'];                             // the plots you can rent, in order along the lane
const C4_HELPERS = [1, 3, 5, 0, 7];                                       // which mouse sorts serve as hired helpers
const C4_DEBT = 300;                                                      // the trader gives credit up to this
const C4_NEW = () => ({ day: 1, money: 60, stock: 0, debt: 0, lv: 0, started: false, best: 0, intro: false, plan: null, next: null, notes: [], owed: [], favor: 0, dues: 0, shops: {}, goal: false });
let SAVE4 = C4_NEW();
try { const s = JSON.parse(localStorage.getItem('dcc.c4') || 'null'); if (s && s.day) SAVE4 = Object.assign(SAVE4, s); } catch (e) {}
const persist4 = () => { try { localStorage.setItem('dcc.c4', JSON.stringify(SAVE4)); } catch (e) {} };
const c4Hour = m => C4_HOURS[Math.floor(((m / 60 + 1) % 24) / 2)];
// the old double-hours mean little to players today: show the clock too ("7:40"), and a double-hour's span ("15–17 giờ")
const c4Clock = m => `${Math.floor(m / 60)}:${String(Math.floor(m % 60 / 10) * 10).padStart(2, '0')}`;
const c4Span = name => { const i = C4_HOURS.indexOf(name), a = (i * 2 + 23) % 24; return `giờ ${name} (${a}–${(a + 2) % 24} giờ)`; };
const C4_BROKE = 200, C4_BROKE_DAYS = 3;                                   // owing this much this many mornings running: ruin
const C4_DUES_EVERY = 5;                                                  // the headman collects the market dues every fifth day
function c4Money(d) {
  d = Math.round(d); const neg = d < 0; d = Math.abs(d); const q = Math.floor(d / 600), r = d - q * 600;
  return (neg ? '−' : '') + (q ? `${q} quan${r ? ' ' + r + ' đồng' : ''}` : `${r} đồng`);
}
// the weather (fine, scorching, rain, cold) and what else a day brings
const C4_WX = { dep: 'Trời nắng đẹp.', gat: 'Nắng gắt như đổ lửa: đồ tươi mau hỏng, ít người uống chè.', mua: 'Trời mưa rả rích, chợ vắng hơn.', ret: 'Trời rét căm căm: ai cũng muốn bát chè nóng.' };
function c4Roll(day) { const r = R(); return { wx: r < .45 ? 'dep' : r < .65 ? 'gat' : r < .85 ? 'mua' : 'ret', hoi: R() < .16, meo: R() < .3, thue: day % C4_DUES_EVERY === 0, cuoi: R() < .2 }; }
const c4Wx = () => (SAVE4.plan && SAVE4.plan.wx) || 'dep';
// the view: a phone shows ~430 units across with the lane in its lower part; a wide screen the whole height of the scene
function c4View() {
  const w = innerWidth, h = innerHeight, portrait = h > w, s = portrait ? w / 430 : Math.min(h / 560, w / 700), vh = h / s;
  return { s, vh, vw: w / s, oy: vh * (portrait ? .8 : .88) - (C4_Y0 + C4_D) };
}
// stock, price and cost of a ware; the betel stall keeps its old fields in SAVE4
const c4Own = g => g === 'trau' || !!(SAVE4.shops[g] && SAVE4.shops[g].own);
const c4Open = g => g === 'trau' ? !C4.build : c4Own(g) && !!SAVE4.shops[g].staff && !SAVE4.shops[g].sick;
const c4Stock = g => g === 'trau' ? SAVE4.stock : (SAVE4.shops[g] ? SAVE4.shops[g].stock : 0);
const c4SetStock = (g, v) => { v = Math.max(0, v); if (g === 'trau') SAVE4.stock = v; else SAVE4.shops[g].stock = v; };
const c4Cap = g => g === 'trau' ? c4Lv().cap : C4_GOODS[g].cap;
const c4Cost = g => g === 'trau' ? c4Lv().cost : C4_GOODS[g].cost;
const c4Price = g => g === 'trau' ? (SAVE4.cheap > 0 ? 5 : 6) : C4_GOODS[g].price;
const c4Owned = () => ['trau', ...C4_SHOPS.filter(c4Own)];
const c4QX = g => g === 'trau' ? [175, 200, 225][SAVE4.lv] : 140;          // where the queue starts, right of a stall

/* ---------- the opening talk ---------- */
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
  ['h', 'Mình để dành đủ hai quan rồi hẵng tính chuyện con cái nhé.'],
  ['h', 'Vậy sáng mai mình gánh ra cổng chợ!'],
];
function c4StoryStart() {
  Object.assign(C4, { phase: 'story', line: 0, lineT: 0, storyT: 0, fade: 0, walkers: [], fx: [], build: null, Q: {}, SV: {} });
  C4.camX = -c4View().vw / 2;
  $('#c4hud').hidden = true;
}
function c4StoryNext() {
  if (C4.phase !== 'story' || C4.fade > 0) return;
  AU.tap();
  if (C4.line < C4_TALK.length - 1) { C4.line++; C4.lineT = 0; C4.tapped = true; }
  else C4.fade = .001;
}
function c4StoryUpdate(dt) {
  C4.storyT += dt; C4.lineT += dt;
  if (C4.fade > 0) { C4.fade += dt; if (C4.fade > 1.1) { SAVE4.intro = true; persist4(); c4MarketStart(); } }
}
function c4RenderStory(g, V) {
  const cx = C4.camX, t = C4.storyT, [who, text] = C4_TALK[C4.line], gy = C4_Y0 + 120;
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx + V.vw * .78, -V.oy + 110, 30, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = 'rgba(91,47,31,.16)'; g.fillRect(cx - 20, gy, V.vw + 40, V.vh);
  dp(g, WP.house, 0, gy, 0, .8, .8);
  dp(g, PROPS.chum, 230, gy, 0, .6, .6);
  const hb = who === 'h' ? Math.abs(Math.sin(t * 9)) * 3 : 0, wb = who === 'w' ? Math.abs(Math.sin(t * 9)) * 3 : 0;
  c4Mouse(g, MICE.groom, -95, 1, 0, false, who === 'h' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - hb, 1);
  c4Mouse(g, MICE.b, 95, -1, 0, false, who === 'w' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - wb, 2);
  const B = c4Bubble(text, who === 'h' ? -1 : 1, 18, Math.min(280, V.vw - 70)), k = Math.min(1, C4.lineT * 6), sc = .85 + .15 * k;
  const half = B.w / 2 * sc, x = Math.max(cx + half + 8, Math.min(cx + V.vw - half - 8, who === 'h' ? -40 : 40));
  g.globalAlpha = k; dp(g, B, x, gy - 210 - B.bh, 0, sc, sc); g.globalAlpha = 1;
}

/* ---------- the day ---------- */
const c4Lv = () => C4_LV[SAVE4.lv];
function startC4() {
  AU.init(); AU.setSong(6); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 4; S.mode = 'c4play'; document.body.classList.add('c4');   // c4: notices go to the bottom, clear of the top bar
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  c4Sheets(null);
  SAVE4.started = true; persist4();
  if (!SAVE4.intro) { c4StoryStart(); cv.focus(); return; }
  c4MarketStart();
}
function c4MarketStart() {
  $('#c4hud').hidden = false;
  if (!SAVE4.plan || !SAVE4.plan.wx) { SAVE4.plan = c4Roll(SAVE4.day); SAVE4.next = c4Roll(SAVE4.day + 1); }
  Object.assign(C4, { mins: C4_OPEN, phase: 'morning', walkers: [], fx: [], build: null, drag: null, spawnT: .3, cat: null, wed: null, shut: 0, kid: null, parade: null, Q: {}, SV: {},
    today: { sold: 0, take: 0, cogs: 0, served: 0, lost: 0, wilt: 0, wiltLoss: 0, spent: 0, got: 0, wages: 0 }, chatT: 1, wife: { say: null },
    porter: { x: c4HusbX(), z: .04, st: 'idle', ph: 0, say: null, t: 0 }, vendors: C4_VENDORS.map(v => ({ ...v, M: MICE[v.M], say: null, callT: 3 + R() * 8 })) });
  for (const g of Object.keys(C4_GOODS)) { C4.Q[g] = []; C4.SV[g] = null; }
  for (const g of C4_SHOPS) if (c4Own(g)) { const s = SAVE4.shops[g]; s.sick = false; s.say = null; }
  C4.camX = C4_STALL - c4View().vw * .5;
  for (let i = 0; i < 8; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
  c4Hud(); c4Morning(); cv.focus();
}
function c4Hide() { $('#c4hud').hidden = true; c4Sheets(null); document.body.classList.remove('c4'); }
// one sheet at a time: morning plan, stall, event, notebook, tally
function c4Sheets(id) { for (const s of ['c4am', 'c4up', 'c4ev', 'c4note', 'c4day']) $('#' + s).hidden = s !== id; C4.paused = !!id && id !== 'c4day'; }
const c4Say = (who, text, life = 1.6 + text.length * .045) => { who.say = { text, t: 0, life }; };
// how many come to the market: weather, a fair, the cat sitting there, the headman's favour, luck, cụ Đồ's scroll, a fire
const c4Flow = () => ({ dep: 1, gat: .85, mua: .55, ret: .8 }[c4Wx()]) * (SAVE4.plan.hoi ? 1.8 : 1) * (C4.cat && C4.cat.st === 'sit' ? .2 : 1) * (SAVE4.favor > 0 ? 1.15 : 1) * (SAVE4.phuc ? 1.08 : 1) * (SAVE4.cauDoi ? 1.06 : 1) * (C4.fire > 0 ? .1 : 1);
// how much a passer-by wants a ware now
function c4Want(g) {
  const G = C4_GOODS[g], h = c4Hour(C4.mins), lv = c4Lv();
  if (!c4Own(g)) return 0;
  const base = g === 'trau' ? lv.buy * (.7 + (C4_BUSY[h] || .3) * .4) * (SAVE4.rival > 0 && SAVE4.cheap <= 0 ? .6 : 1) : .28 * (G.hours[h] || 0);
  return base * (G.wx[c4Wx()] || 1);
}
function c4Spawn(atX) {
  let r = R(), kind = 'mouse'; for (const [k, p] of C4_KINDS) { if (r < p) { kind = k; break; } r -= p; }
  const fromRight = atX === undefined ? R() < .6 : R() < .5, sort = (R() * C4_MOUSE_SORTS.length) | 0, role = C4_MOUSE_SORTS[sort].role;
  let x = atX !== undefined ? atX : fromRight ? C4.camX + c4View().vw + 120 + R() * 200 : C4_GATE - 40;
  const sp = { mouse: role === 'old' ? 34 + R() * 10 : role === 'child' ? 80 + R() * 30 : 55 + R() * 40, duck: 40, rooster: 65, dog: 105, toad: 50 }[kind];
  // what (if anything) they come to buy
  let shop = null;
  if (!(kind === 'mouse' && role === 'child') && C4.phase === 'open') {
    const wants = c4Owned().map(g => [g, c4Want(g) * .56]), sum = wants.reduce((a, [, w]) => a + w, 0);
    if (R() < Math.min(.85, sum)) { let k = R() * sum; for (const [g, w] of wants) { if ((k -= w) <= 0) { shop = g; break; } } }
  }
  if (shop && fromRight && atX === undefined) x = Math.max(x, C4_GOODS[shop].x + 260);         // buyers come from a side that takes them past their stall
  C4.walkers.push({ kind, sort, M: c4MouseRig(sort), seed: R() * 6, name: c4Pick(C4_NAMES[kind === 'mouse' && role !== 'adult' ? role : kind]), x, z: .38 + R() * .6, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1, sp, ph: R() * 6,
    buy: !!shop, shop, st: 'walk', n: 1 + ((R() * 3) | 0), carry: null, cd: 3 + R() * 6, say: null });
  if (kind === 'mouse' && role === 'child' && atX === undefined && R() < .5) {             // a gang of children chasing each other
    const lead = C4.walkers[C4.walkers.length - 1]; lead.sp = 150; lead.cd = 99;
    for (let i = 1; i <= 1 + ((R() * 2) | 0); i++) { const s2 = 11 + ((R() * 3) | 0); C4.walkers.push({ ...lead, sort: s2, M: c4MouseRig(s2), seed: R() * 6, name: c4Pick(C4_NAMES.child), x: lead.x - lead.face * 60 * i, z: Math.min(.98, lead.z + (R() - .5) * .2), ph: R() * 6, say: null }); }
    if (R() < .5) c4Say(lead, c4Pick(['Đuổi được tao đi!', 'Ú òa!', 'Chạy nhanh lên!']));
  }
}

/* ---------- the morning: weather, news, how much of each ware to buy ---------- */
function c4Morning() {
  const p = SAVE4.plan, heard = SAVE4.notes.filter(n => n.day === SAVE4.day);
  const back = [];
  SAVE4.owed = SAVE4.owed.filter(o => { if (o.due > SAVE4.day) return true; if (o.ok) { SAVE4.money += o.back; back.push(`${o.name} trả ${c4Money(o.back)}.`); } else back.push(`${o.name} khất mãi không trả.`); return false; });
  SAVE4.debtDays = SAVE4.debt >= C4_BROKE ? (SAVE4.debtDays || 0) + 1 : 0;
  if (SAVE4.debtDays >= C4_BROKE_DAYS) { c4Bankrupt(); return; }
  const warn = SAVE4.debtDays ? `<p class="bad">Lái buôn đến đòi nợ ${c4Money(SAVE4.debt)}. Còn ${C4_BROKE_DAYS - SAVE4.debtDays} buổi sáng nữa mà chưa trả bớt xuống dưới ${C4_BROKE} đồng là vỡ nợ!</p>` : '';
  const dues = 15 * c4Owned().length;
  $('#c4amT').textContent = `Sáng ngày ${SAVE4.day}`;
  $('#c4amB').innerHTML = `<p class="wx">${C4_WX[p.wx]}${p.hoi ? ' <b>Làng mở hội, chợ đông!</b>' : ''}</p>`
    + (SAVE4.goal ? '' : `<p class="goal">Mục tiêu: để dành <b>${c4Money(C4_GOAL)}</b> · còn thiếu ${c4Money(Math.max(0, C4_GOAL - SAVE4.money))}</p>`)
    + warn + (back.length ? `<p class="back">${back.join(' ')}</p>` : '')
    + (p.thue ? `<p>Hôm nay ông Lý đi thu tiền chợ (${dues} đồng).</p>` : SAVE4.next && SAVE4.next.thue ? `<p>Mai ông Lý đi thu tiền chợ, nhớ để dành ${dues} đồng.</p>` : '')
    + (SAVE4.rival > 0 ? '<p class="bad">Gánh trầu đối diện vẫn bán rẻ, khách bị kéo sang bên ấy.</p>' : '')
    + (heard.length ? `<div class="heard"><b>Hôm qua nghe được:</b>${heard.map(n => `<p>• ${n.text}</p>`).join('')}</div>` : '');
  // one stepper per ware the couple sells
  const box = $('#c4amO'); box.innerHTML = '';
  const orders = {};
  for (const g of c4Owned()) {
    const G = C4_GOODS[g], row = document.createElement('div'); row.className = 'ware';
    const closed = g !== 'trau' && !c4Open(g);
    row.innerHTML = `<h5>${G.name}${g !== 'trau' && G.keep === 'ever' ? ` · còn ${c4Stock(g)} ${G.unit}` : ''}${g === 'che' ? ' · tốn củi ' + G.fuel + ' đồng' : ''}${g === 'xoi' ? ' · thiu từ giờ Ngọ' : ''}${closed ? ' · <span class="bad">không ai trông</span>' : ''}</h5><div class="ord"></div>`;
    box.appendChild(row);
    if (closed) { orders[g] = 0; row.querySelector('.ord').innerHTML = ''; continue; }
    c4Stepper(row.querySelector('.ord'), g, q => { orders[g] = q; c4AmTotal(orders); });
  }
  const tot = document.createElement('div'); tot.className = 'tot'; box.appendChild(tot);
  const go = document.createElement('button'); go.className = 'btn go'; go.textContent = 'Họp chợ'; box.appendChild(go);
  go.addEventListener('click', () => {
    for (const [g, q] of Object.entries(orders)) { if (q) c4Receive(g, q, c4Cost(g)); if (g === 'che' && q) { SAVE4.money -= C4_GOODS.che.fuel; C4.today.spent += C4_GOODS.che.fuel; } }
    c4Sheets(null); C4.phase = 'open'; c4PlanEvents(); c4Hud();
  });
  c4AmTotal(orders);
  c4Sheets('c4am');
}
function c4AmTotal(orders) {
  const el = $('#c4amO .tot'); if (!el) return;
  const sum = Object.entries(orders).reduce((a, [g, q]) => a + q * c4Cost(g) + (g === 'che' && q ? C4_GOODS.che.fuel : 0), 0);
  el.innerHTML = `Tổng tiền hàng: <b>${c4Money(sum)}</b>${sum > SAVE4.money ? ` · mua chịu ${c4Money(sum - SAVE4.money)}` : ''}${SAVE4.debt + Math.max(0, sum - SAVE4.money) > C4_DEBT ? ' · <span class="bad">quá hạn mức nợ!</span>' : ''}`;
  const go = $('#c4amO .go'); if (go) go.disabled = SAVE4.debt + Math.max(0, sum - SAVE4.money) > C4_DEBT;
}
// a stepper for one ware: how many, what it costs
function c4Stepper(box, g, on) {
  const G = C4_GOODS[g], max = c4Cap(g) - c4Stock(g), step = max > 40 ? 10 : 5; let q = 0;
  box.innerHTML = `<div class="step"><button class="btn alt" data-d="-${step}">−${step}</button><b class="q"></b><button class="btn alt" data-d="${step}">+${step}</button></div><p class="cost"></p>`;
  const show = () => { q = Math.max(0, Math.min(q, max)); box.querySelector('.q').textContent = `${q} ${G.unit}`; box.querySelector('.cost').textContent = `${c4Cost(g)} đồng/${G.unit} · bán ${c4Price(g)} đồng`; on(q); };
  box.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { q += +b.dataset.d; AU.tap(); show(); }));
  show();
}
// the goods arrive: paid from the purse, the rest on credit with the trader
function c4Receive(g, q, cost) {
  if (!q) return;
  const st = c4Stock(g); C4.unit = C4.unit || {};
  C4.unit[g] = ((C4.unit[g] || cost) * st + cost * q) / (st + q);             // the blended price of what is in stock
  c4SetStock(g, st + q);
  const bill = q * cost, paid = Math.min(Math.max(0, SAVE4.money), bill); SAVE4.money -= paid; SAVE4.debt += bill - paid;
  C4.fx.push({ x: C4_GOODS[g].x - 40, y: c4Y(.04) - 200, t: 0, s: '+' + q + ' ' + C4_GOODS[g].unit }); AU.pluck(76); c4Hud();
}
const c4Unit = g => (C4.unit && C4.unit[g]) || c4Cost(g);

/* ---------- things that happen, and what you decide ---------- */
function c4PlanEvents() {
  const p = SAVE4.plan, ev = [], at = (a, b) => (a + R() * (b - a)) * 60, own = c4Owned();
  if (p.cuoi) ev.push({ at: at(6.5, 8), kind: 'cuoi' });
  if (p.thue) ev.push({ at: at(8.5, 10), kind: 'thue' });
  if (p.meo) ev.push({ at: at(9, 15), kind: 'meo' });
  if (SAVE4.dues) ev.push({ at: at(6, 7), kind: 'khat' });
  // the everyday ones (some only make sense with certain stalls); hard luck a little more often than good
  const pool = ['vay', 'chiu', 'boi', 'trom', 'ho', 'cau', 'tuan', 'xin', 'trong', 'sau', 'linh', 'gio', 'lua', 'rival'];
  if (!SAVE4.cauDoi) pool.push('do');
  if (own.includes('che') || own.includes('xoi') || own.includes('bun')) pool.push('do2', 'do2');
  if (own.length > 1) pool.push('om', 'bot', 'om');
  for (let i = 0; i < 3 && pool.length; i++) ev.push({ at: at(7, 16.5), kind: pool.splice((R() * pool.length) | 0, 1)[0] });
  if (p.cuoi || R() < .2) C4.parade = { at: at(9, 11), x: null };       // a wedding procession goes through the market
  C4.events = ev.sort((a, b) => a.at - b.at);
}
const c4Someone = () => c4Pick([...C4.walkers.filter(w => w.kind === 'mouse' && C4_MOUSE_SORTS[w.sort].role !== 'child').map(w => w.name), 'bà Ba', 'chú Năm', 'cô Tư']);
const c4Cap1 = s => s[0].toUpperCase() + s.slice(1);
function c4Event(kind) {
  const who = c4Someone(), E = { title: '', text: '', opts: [] }, sp = n => { SAVE4.money -= n; C4.today.spent += n; }, own = c4Owned();
  const helped = own.filter(g => g !== 'trau' && SAVE4.shops[g].staff && !SAVE4.shops[g].sick);
  if (kind === 'meo' && (!C4.cat || C4.cat.st !== 'ask')) { AU.meow(); C4.cat = { t: 0, st: 'roof' }; return; }   // first it shows itself on the roof
  if (kind === 'meo') {
    Object.assign(E, { title: 'Mèo đến!', text: 'Con mèo khoang to sụ nhảy phốc xuống trước gánh, vểnh râu đòi lễ.', opts: [
      ['Dâng con cá · 20 đồng', () => { sp(20); C4.cat.st = 'fed'; C4.cat.t = 0; toast('Mèo ngoạm cá, nhảy tót lên mái nhà đi mất.', 3); }, SAVE4.money >= 20],
      ['Không dâng', () => { C4.cat.st = 'sit'; C4.cat.t = 0; toast('Mèo ngồi chễm chệ trước gánh suốt một canh giờ. Khách sợ, chẳng ai dám ghé!', 3.4); }]] });
  } else if (kind === 'thue') {
    const d = 15 * own.length;
    Object.assign(E, { title: 'Ông Lý thu tiền chợ', text: `Ông Lý chống gậy đến: "Tiền chợ ${own.length} gánh, ${d} đồng!"`, opts: [
      [`Nộp ${d} đồng`, () => { sp(d); toast('Ông Lý gật gù, ghi vào sổ.'); }, SAVE4.money >= d],
      [`Biếu thêm · ${d + 10} đồng`, () => { sp(d + 10); SAVE4.favor = 2; toast('Ông Lý cười tít mắt, dặn tuần đinh để gánh nhà mình chỗ đẹp. Khách ghé đông hơn hai ngày tới.', 4); }, SAVE4.money >= d + 10],
      ['Xin khất', () => { if (R() < .55) { SAVE4.dues = d; toast('Ông Lý cho khất đến sáng mai.', 3); } else { sp(Math.min(Math.max(0, SAVE4.money), d * 2)); toast(`Ông Lý nổi giận, phạt gấp đôi!`, 3); } }]] });
  } else if (kind === 'khat') {
    Object.assign(E, { title: 'Ông Lý đến lấy tiền khất', text: `Ông Lý đến lấy món tiền chợ khất hôm qua: ${SAVE4.dues} đồng.`, opts: [
      ['Nộp', () => { sp(Math.min(Math.max(0, SAVE4.money), SAVE4.dues)); SAVE4.dues = 0; }]] });
  } else if (kind === 'vay') {
    const amt = 30 + ((R() * 4) | 0) * 10;
    Object.assign(E, { title: 'Hàng xóm hỏi vay', text: `${c4Cap1(who)} ghé gánh, khẽ hỏi vay ${amt} đồng, hẹn ba hôm trả thêm chút lãi.`, opts: [
      ['Cho vay', () => { sp(amt); SAVE4.owed.push({ name: who, back: amt + 10, due: SAVE4.day + 3, ok: R() < .65 }); toast(`${c4Cap1(who)} cảm ơn rối rít.`); }, SAVE4.money >= amt],
      ['Nhà cũng túng', () => toast(`${c4Cap1(who)} lủi thủi đi.`)]] });
  } else if (kind === 'chiu') {
    const n = 3 + ((R() * 3) | 0);
    Object.assign(E, { title: 'Mua chịu', text: `${c4Cap1(who)} xin mua chịu ${n} miếng trầu, mai trả.`, opts: [
      ['Cho chịu', () => { SAVE4.stock -= n; SAVE4.owed.push({ name: who, back: n * 6, due: SAVE4.day + 1, ok: R() < .65 }); c4Hud(); }, SAVE4.stock >= n],
      ['Không bán chịu', () => toast(`${c4Cap1(who)} bĩu môi bỏ đi.`)]] });
  } else if (kind === 'cuoi') {
    const n = 30 + ((R() * 3) | 0) * 10;
    Object.assign(E, { title: 'Nhà có cưới', text: `Nhà ${who} cưới con, đặt ${n} miếng trầu têm cánh phượng, trả 9 đồng một miếng. Đến ${c4Span('Thân')} nhà trai đến lấy.`, opts: [
      ['Nhận', () => { C4.wed = { n, who }; toast(`Nhớ để dành đủ trầu đến ${c4Span('Thân')}!`, 3.4); }],
      ['Không nhận', () => {}]] });
  } else if (kind === 'boi') {
    Object.assign(E, { title: 'Thầy bói', text: 'Ông thầy bói chống gậy ghé gánh: "Gieo một quẻ, biết ngày mai lành dữ, chỉ năm đồng!"', opts: [
      ['Xem quẻ · 5 đồng', () => { sp(5); const n = SAVE4.next, got = Object.keys(C4_NOTE).filter(k => k === 'mua' ? n.wx === 'mua' : n[k]);
        if (n.wx === 'ret') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'ret', text: 'Thầy bói phán: mai trời rét căm căm.' });
        if (n.wx === 'gat') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'gat', text: 'Thầy bói phán: mai nắng gắt như đổ lửa.' });
        for (const k of got) if (!SAVE4.notes.some(x => x.day === SAVE4.day + 1 && x.kind === k)) SAVE4.notes.push({ day: SAVE4.day + 1, kind: k, text: 'Thầy bói phán: ' + C4_NOTE[k].replace('Nghe nói ', '').replace('Nghe đồn ', '') });
        if (!got.length && n.wx === 'dep') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'yen', text: 'Thầy bói phán: mai trời đẹp, bình yên vô sự.' });
        C4.noteNew = true; toast('Thầy bói lẩm nhẩm bấm đốt tay… Đã ghi lời phán vào sổ tay.', 3.4); }, SAVE4.money >= 5],
      ['Không tin bói', () => toast('Thầy bói lắc đầu: "Có kiêng có lành đấy!"', 2.6)]] });
  } else if (kind === 'trom') {
    const n = Math.min(SAVE4.stock, 4 + ((R() * 5) | 0)); if (n < 2) return;
    SAVE4.stock -= n; AU.snort();
    Object.assign(E, { title: 'Kẻ cắp!', text: `Một tên kẻ cắp chộp vội ${n} miếng trầu rồi co cẳng chạy!`, opts: [
      ['Sai chồng đuổi theo', () => { if (R() < .5) { SAVE4.stock += n; toast('Chồng đuổi kịp, giằng lại được cả gói trầu!', 3); } else toast('Kẻ cắp chạy mất hút vào ngõ.', 2.8); }],
      ['Thôi, của đi thay người', () => {}]] });
  } else if (kind === 'ho') {
    Object.assign(E, { title: 'Góp họ', text: `${c4Cap1(who)} rủ góp họ: góp 30 đồng hôm nay, năm hôm nữa hốt về 45 đồng.`, opts: [
      ['Góp họ · 30 đồng', () => { sp(30); SAVE4.owed.push({ name: 'Chủ họ ' + who, back: 45, due: SAVE4.day + 5, ok: R() < .75 }); toast('Đã góp họ, năm hôm nữa hốt.'); }, SAVE4.money >= 30],
      ['Không góp', () => {}]] });
  } else if (kind === 'cau') {
    const n = Math.min(20, c4Cap('trau') - SAVE4.stock); if (n < 10) return;
    Object.assign(E, { title: 'Cau non giá hời', text: `Một lái buôn chèo đò ngang qua, chào ${n} miếng trầu cau non chỉ 2 đồng một miếng.`, opts: [
      [`Mua · ${n * 2} đồng`, () => { c4Receive('trau', n, 2); if (R() < .35) { const bad = Math.ceil(n * .6); SAVE4.stock -= bad; setTimeout(() => toast(`Hớ rồi! Cau rẻ mà sâu, phải bỏ ${bad} miếng.`, 3.2), 400); } else toast(`Mua được ${n} miếng giá hời!`); }, SAVE4.money >= n * 2],
      ['Không mua', () => {}]] });
  } else if (kind === 'tuan') {
    Object.assign(E, { title: 'Tuần đinh dẹp lối', text: 'Tuần đinh cầm gậy đi dẹp lối: "Gánh nào lấn đường thì dẹp vào một canh giờ!"', opts: [
      ['Dẹp vào', () => { C4.shut = 30; for (const g of own) for (const w of [...C4.Q[g]]) c4Leave(w, false); toast('Phải dẹp gánh vào một canh giờ.', 2.6); }],
      ['Biếu tuần đinh · 10 đồng', () => { sp(10); toast('Tuần đinh làm ngơ đi chỗ khác.'); }, SAVE4.money >= 10]] });
  } else if (kind === 'xin') {
    Object.assign(E, { title: 'Người ăn xin', text: 'Bà cụ ăn xin lưng còng, chìa cái bát mẻ trước gánh.', opts: [
      ['Cho 3 đồng', () => { sp(3); SAVE4.phuc = 1; toast('Bà cụ chắp tay: "Cầu cho cô buôn may bán đắt!"', 3); }, SAVE4.money >= 3],
      ['Không cho', () => {}]] });
  } else if (kind === 'do') {
    if (SAVE4.stock < 1) return;
    Object.assign(E, { title: 'Cụ Đồ', text: 'Cụ Đồ ghé xin miếng trầu, hứa viết tặng đôi câu đối treo gánh cho đắt hàng.', opts: [
      ['Biếu cụ miếng trầu', () => { SAVE4.stock--; SAVE4.cauDoi = true; toast('Cụ Đồ viết tặng đôi câu đối đỏ. Khách nhìn thấy thích lắm!', 3.2); }],
      ['Hết trầu mất rồi ạ', () => {}]] });
  } else if (kind === 'trong') {
    Object.assign(E, { title: 'Nhờ trông con', text: `${c4Cap1(who)} gửi thằng cu con nhờ trông hộ một lúc để ra đồng.`, opts: [
      ['Trông hộ', () => { C4.kid = { t: 0, who }; toast('Thằng cu ngồi ngoan bên gánh.'); }],
      ['Bận lắm', () => {}]] });
  } else if (kind === 'sau') {                                              // the trader's areca was rotten inside
    const n = Math.floor(SAVE4.stock * (.2 + R() * .2)); if (n < 3) return;
    SAVE4.stock -= n; AU.snort();
    Object.assign(E, { title: 'Cau sâu!', text: `Bổ ra mới thấy ${n} quả cau sâu ruỗng. Lái buôn bán hàng xấu!`, opts: [
      ['Đành bỏ đi', () => {}],
      ['Đòi lái buôn bù', () => { if (R() < .4) { SAVE4.debt = Math.max(0, SAVE4.debt - n * c4Cost('trau')); toast('Lái buôn ngượng, trừ tiền vào nợ.', 3); } else toast('Lái buôn chối đây đẩy: "Hàng ra khỏi đò là hết trách nhiệm!"', 3.2); }]] });
  } else if (kind === 'do2') {                                              // a dog knocks the tea pot / rice basket / soup over
    const g = c4Pick(own.filter(x => ['che', 'xoi', 'bun'].includes(x) && c4Stock(x) > 4)); if (!g) return;
    const n = Math.ceil(c4Stock(g) * (.4 + R() * .3)); c4SetStock(g, c4Stock(g) - n); AU.bark();
    const what = { che: 'nồi chè', xoi: 'thúng xôi', bun: 'nồi bún' }[g];
    Object.assign(E, { title: 'Chó húc đổ!', text: `Con Vện đuổi gà, lao sầm vào ${what}! Đổ mất ${n} ${C4_GOODS[g].unit}.`, opts: [
      ['Mắng con Vện', () => toast('Con Vện cụp đuôi chạy mất.')],
      ['Bắt chủ nó đền', () => { if (R() < .45) { const pay = n * C4_GOODS[g].cost; SAVE4.money += pay; C4.today.got += pay; toast(`Chủ con Vện xin lỗi, đền ${c4Money(pay)}.`, 3); } else toast('Chủ con Vện cãi lấy được, chẳng đền đồng nào.', 3); }]] });
  } else if (kind === 'om') {                                               // a helper is ill
    const g = c4Pick(helped); if (!g) return;
    const s = SAVE4.shops[g];
    Object.assign(E, { title: 'Người phụ ốm', text: `${c4Cap1(s.staff)} bán ${C4_GOODS[g].name.toLowerCase()} lên cơn sốt, xin nghỉ về nhà. Hàng ${C4_GOODS[g].name.toLowerCase()} phải đóng cả buổi.`, opts: [
      ['Cho nghỉ, vẫn trả công', () => { s.sick = true; for (const w of [...C4.Q[g]]) c4Leave(w, false); }],
      ['Trừ công hôm nay', () => { s.sick = true; s.nowage = true; for (const w of [...C4.Q[g]]) c4Leave(w, false); if (R() < .4) { s.quit = true; toast(`${c4Cap1(s.staff)} giận, mai không làm nữa!`, 3); } }]] });
  } else if (kind === 'bot') {                                              // a helper skims off the takings
    const g = c4Pick(helped); if (!g) return;
    const s = SAVE4.shops[g], n = 10 + ((R() * 3) | 0) * 10; sp(Math.min(Math.max(0, SAVE4.money), n));
    Object.assign(E, { title: 'Hụt tiền', text: `Đếm tiền hàng ${C4_GOODS[g].name.toLowerCase()} thấy hụt ${n} đồng. Hình như ${s.staff} bớt xén.`, opts: [
      ['Đuổi việc', () => { s.staff = null; for (const w of [...C4.Q[g]]) c4Leave(w, false); toast('Hàng ấy không còn ai trông, phải thuê người khác.', 3); }],
      ['Bỏ qua lần này', () => {}]] });
  } else if (kind === 'rival') {                                            // a rival betel stall across the lane, cheaper
    if (SAVE4.rival > 0) return;
    Object.assign(E, { title: 'Có người tranh khách', text: `Nhà ${who} mở gánh trầu ngay đối diện, bán rẻ hơn một đồng!`, opts: [
      ['Hạ giá trầu còn 5 đồng (3 ngày)', () => { SAVE4.rival = 3; SAVE4.cheap = 3; toast('Hạ giá giữ khách, lãi mỗi miếng mỏng đi.', 3); }],
      ['Giữ giá', () => { SAVE4.rival = 3; toast('Khách bị kéo sang gánh bên kia mất mấy hôm.', 3); }]] });
  } else if (kind === 'gio') {                                              // a gale
    Object.assign(E, { title: 'Gió to!', text: SAVE4.lv ? 'Cơn gió lốc thổi tốc cả mái lều, hàng hoá bay tứ tung!' : 'Cơn gió lốc thổi lật cả gánh, trầu cau văng tứ tung!', opts: [
      ['Gọi thợ sửa ngay · 30 đồng', () => { sp(30); const n = Math.floor(SAVE4.stock * .15); SAVE4.stock -= n; toast(`Sửa xong, nhặt lại được hàng, chỉ mất ${n} miếng.`, 3); }, SAVE4.money >= 30],
      ['Tự nhặt nhạnh', () => { const n = Math.floor(SAVE4.stock * .4); SAVE4.stock -= n; C4.shut = Math.max(C4.shut, 20); toast(`Mất cả buổi nhặt nhạnh, ${n} miếng dập nát phải bỏ.`, 3); }]] });
  } else if (kind === 'lua') {                                              // a fire behind the market
    if (R() < .6) return;                                                   // (rare)
    AU.drumHit();
    Object.assign(E, { title: 'Cháy!', text: 'Đống rơm sau chợ bốc cháy! Cả chợ nháo nhác chạy đi xách nước.', opts: [
      ['Cùng mọi người đi dập lửa', () => { C4.fire = 25; SAVE4.phuc = 1; toast('Lửa tắt. Cả làng nhớ ơn nhà mình xông xáo.', 3.2); }],
      ['Ở lại trông hàng', () => { C4.fire = 25; toast('Chợ vắng tanh một lúc lâu.', 3); }]] });
    for (const w of C4.walkers) if (w.st !== 'leave') { if (w.chat) w.chat = null; w.st = 'leave'; w.talk = false; w.sp = 160; }
    for (const g of own) C4.Q[g] = [];
  } else if (kind === 'linh') {                                             // the district's soldiers levy money for labour
    const d = 10 * own.length;
    Object.assign(E, { title: 'Lính huyện', text: `Lính huyện đi qua, bắt mỗi gánh nộp mười đồng tiền phu. Cả thảy ${d} đồng.`, opts: [
      [`Nộp ${d} đồng`, () => sp(d), SAVE4.money >= d],
      ['Kêu nghèo', () => { if (R() < .5) toast('Lính huyện thấy gánh nhỏ, tha cho.', 2.8); else { const n = Math.min(SAVE4.stock, 10); SAVE4.stock -= n; toast(`Lính huyện tịch thu ${n} miếng trầu thay tiền!`, 3); } }]] });
  } else return;
  C4.ev = E;
  $('#c4evT').textContent = E.title; $('#c4evB').textContent = E.text;
  const box = $('#c4evO'); box.innerHTML = '';
  for (const [label, act, ok = true] of E.opts) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; b.disabled = !ok; b.addEventListener('click', () => { c4Sheets(null); act(); c4Hud(); persist4(); }); box.appendChild(b); }
  c4Sheets('c4ev');
}
function c4Bankrupt() {
  AU.snort();
  $('#c4evT').textContent = 'Vỡ nợ!';
  $('#c4evB').textContent = `Nợ lái buôn ${c4Money(SAVE4.debt)} đã ba buổi sáng không trả nổi. Lái buôn thu hết gánh hàng để trừ nợ. Hai vợ chồng đành làm lại từ đầu với hai bàn tay trắng.`;
  const box = $('#c4evO'); box.innerHTML = '';
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Làm lại từ đầu';
  b.addEventListener('click', () => { const keep = { best: SAVE4.best, goal: SAVE4.goal }; SAVE4 = C4_NEW(); Object.assign(SAVE4, { intro: true, started: true }, keep); persist4(); c4Sheets(null); c4MarketStart(); });
  box.appendChild(b); C4.phase = 'morning'; c4Sheets('c4ev');
}
// the goal reached: she is with child, and in time a brood of mice is born — chương V opens
function c4GoalReached() {
  SAVE4.goal = true; persist4(); AU.kenCall(); setTimeout(() => AU.drumHit(), 600);
  $('#c4evT').textContent = 'Đạt mục tiêu!';
  $('#c4evB').innerHTML = `Hai vợ chồng đã để dành được <b>${c4Money(SAVE4.money)}</b>.<br><br>Tối ấy, vợ thẹn thùng: "Mình ơi… em có mang rồi."<br>Chồng mừng quýnh: "Trời ơi, mình sắp làm cha!"<br><br>Chín tháng mười ngày sau, cả một bầy chuột con ra đời, đứa nào cũng tinh nghịch…<br><br><b>Đã mở Chương V · Bầy Chuột Phiêu Lưu.</b> Vợ chồng vẫn có thể buôn bán tiếp, mở thêm cửa hàng.`;
  const box = $('#c4evO'); box.innerHTML = '';
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Buôn bán tiếp';
  b.addEventListener('click', () => { c4Sheets(null); c4NewDay(); });
  box.appendChild(b); c4Sheets('c4ev');
}

/* ---------- the market at work ---------- */
function updateC4(dt) {
  C4.t += dt;
  if (C4.phase === 'story') { c4StoryUpdate(dt); return; }
  if (C4.paused) return;                                                 // a sheet is open: the market waits
  for (const f of C4.fx) f.t += dt; C4.fx = C4.fx.filter(f => f.t < 1.2);
  for (const e of [...C4.walkers, C4.wife, ...C4.vendors, C4.porter, ...C4_SHOPS.map(g => SAVE4.shops[g]).filter(Boolean)]) if (e.say && (e.say.t += dt) > e.say.life) e.say = null;
  if (C4.phase === 'open') {
    const was = C4.mins; C4.mins += dt * C4_MPS;
    const busy = C4_BUSY[c4Hour(C4.mins)] || .3;
    if ((C4.spawnT -= dt) <= 0) { C4.spawnT = 1 / (.9 * busy * c4Lv().flow * c4Flow()) * (.6 + R() * .8); c4Spawn(); }
    for (const v of C4.vendors) if ((v.callT -= dt) <= 0) { v.callT = 9 + R() * 9; if (Math.abs(v.x - C4.camX - c4View().vw / 2) < 600) c4Say(v, c4Pick(v.calls)); }
    if (C4.events.length && C4.mins >= C4.events[0].at && !Object.values(C4.SV).some(Boolean)) { c4Event(C4.events.shift().kind); return; }
    // noon: sticky rice goes off; scorching days wilt some betel
    if (was < 12 * 60 && C4.mins >= 12 * 60) {
      if (c4Own('xoi') && c4Stock('xoi') > 0) { const n = c4Stock('xoi'); C4.today.wilt += n; C4.today.wiltLoss += n * c4Unit('xoi'); c4SetStock('xoi', 0); toast(`Đến trưa, ${n} gói xôi thiu phải đổ bỏ.`, 3); }
      if (c4Wx() === 'gat' && SAVE4.stock > 4) { const n = Math.floor(SAVE4.stock * .25); SAVE4.stock -= n; C4.today.wilt += n; C4.today.wiltLoss += n * c4Unit('trau'); toast(`Nắng gắt, ${n} miếng trầu héo rũ.`, 3); }
      c4Hud();
    }
    if (C4.wed && C4.mins >= 15 * 60) {
      const W = C4.wed; C4.wed = null;
      if (SAVE4.stock >= W.n) { SAVE4.stock -= W.n; const pay = W.n * 9; SAVE4.money += pay; C4.today.take += pay; C4.today.cogs += W.n * c4Unit('trau'); C4.today.sold += W.n; AU.drumHit(); toast(`Nhà ${W.who} đến lấy ${W.n} miếng trầu, trả ${c4Money(pay)}!`, 3.4); C4.fx.push({ x: C4_STALL + 40, y: c4Y(C4_STALL_Z) - 230, t: 0, s: '+' + pay }); }
      else { AU.snort(); toast(`Không đủ ${W.n} miếng trầu, nhà ${W.who} giận dỗi bỏ đi.`, 3.4); }
      c4Hud();
    }
    if (C4.mins >= C4_CLOSE) { C4.mins = C4_CLOSE - 1; c4EndDay(); }
  }
  // the cat: on the roof, a leap down, the decision; fed it goes back over the roof; refused it sits, then takes betel
  if (C4.cat) {
    const c = C4.cat; c.t += dt;
    if (c.st === 'roof' && c.t > 1.3) { c.st = 'down'; c.t = 0; }
    else if (c.st === 'down' && c.t > .8) { c.st = 'ask'; c.t = 0; AU.meow(); c4Event('meo'); return; }
    else if (c.st === 'fed' && c.t > 1.4) { c.st = 'up'; c.t = 0; }
    else if (c.st === 'sit' && c.t > 30) { const n = Math.min(SAVE4.stock, 8); SAVE4.stock -= n; if (n) toast(`Mèo cắp mất ${n} miếng trầu rồi nhảy lên mái nhà!`, 3); c.st = 'up'; c.t = 0; c4Hud(); }
    else if (c.st === 'up' && c.t > .8) { c.st = 'away'; c.t = 0; }
    else if (c.st === 'away' && c.t > 2.2) C4.cat = null;
  }
  if (C4.shut > 0) C4.shut -= dt;
  if (C4.fire > 0) C4.fire -= dt;
  if (C4.kid && (C4.kid.t += dt) > 40) { const pay = 10; SAVE4.money += pay; C4.today.got += pay; toast(`${c4Cap1(C4.kid.who)} về đón con, cảm ơn và biếu ${pay} đồng.`, 3); C4.kid = null; c4Hud(); }
  if (C4.parade && C4.phase === 'open') {
    const pd = C4.parade;
    if (pd.x === null && C4.mins >= pd.at) { pd.x = C4.camX - 260; pd.ph = 0; AU.kenCall(); setTimeout(() => AU.drumHit(), 500); for (const w of C4.walkers.filter(w => w.st === 'walk').slice(0, 2)) c4Say(w, c4Pick(['Đám cưới nhà ai đẹp quá!', 'Kìa, rước dâu kìa!', 'Cô dâu xinh ghê!'])); }
    if (pd.x !== null) { pd.x += 55 * dt; pd.ph += dt * 6; if (pd.x > C4.camX + c4View().vw + 600) C4.parade = null; }
  }
  // the folk on the lane
  for (const w of C4.walkers) {
    w.cd -= dt;
    if (w.st === 'walk') {
      w.x += w.face * w.sp * dt; w.ph += dt * w.sp / 9;
      const g = w.shop, qx = g && C4_GOODS[g].x + c4QX(g);
      if (g && c4Open(g) && !(g === 'trau' && C4.cat && C4.cat.st === 'sit') && !(C4.shut > 0) && C4.phase === 'open' && Math.abs(w.x - qx) < 140 && C4.Q[g].length < 4) { w.st = 'queue'; w.wait = 0; C4.Q[g].push(w); }
      else if (R() < dt * .006 && !w.say) c4Say(w, c4Pick(C4_ALONE));
    } else if (w.st === 'queue') {
      const g = w.shop, q = C4.Q[g], i = q.indexOf(w), tx = C4_GOODS[g].x + c4QX(g) + i * 62, dx = tx - w.x, dz = C4_Q_Z - w.z, d = Math.hypot(dx, dz * 300);
      w.moving = d > 3;
      if (w.moving) { const k = Math.min(1, 90 * dt / d); w.x += dx * k; w.z += dz * k; w.ph += dt * 9; w.face = dx < -1 ? -1 : dx > 1 ? 1 : -1; } else w.face = -1;
      w.wait += dt;
      if ((w.wait > c4Lv().wait + i * 2 || (g === 'trau' && C4.cat && C4.cat.st === 'sit') || !c4Open(g)) && C4.SV[g]?.who !== w) { c4Say(w, c4Stock(g) ? c4Pick(C4_GIVEUP) : 'Hết hàng rồi à? Tiếc quá!'); c4Leave(w, false); C4.today.lost++; }
    } else if (w.st === 'chat') {
      const c = w.chat; if (c.a === w) c4ChatStep(c, dt);
    } else if (w.st === 'leave') { w.x += w.face * w.sp * dt; w.ph += dt * w.sp / 9; }
  }
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
  C4.walkers = C4.walkers.filter(w => w.x > -300 && w.x < C4_W + 300 && (w.st !== 'walk' || Math.abs(w.x - C4.camX) < 1600 || (w.shop && (w.x - C4_GOODS[w.shop].x) * w.face < 0)));
  // each stall serves the front of its queue (the wife at the betel stall, a hired helper at the others)
  for (const g of c4Owned()) {
    const q = C4.Q[g]; if (!q) continue;
    if (!C4.SV[g] && q.length && c4Stock(g) > 0 && c4Open(g) && !(C4.shut > 0)) {
      const w = q[0]; if (!w.moving && Math.abs(w.x - (C4_GOODS[g].x + c4QX(g))) < 4) { C4.SV[g] = { who: w, t: 0 }; c4Say(w, g === 'trau' ? c4Pick(C4_BUY).replace('{n}', w.n) : c4Pick(C4_WANT[g]).replace('{n}', w.n)); }
    }
    const sv = C4.SV[g];
    if (sv) {
      sv.t += dt;
      if (sv.t >= (g === 'trau' ? c4Lv().serve : C4_GOODS[g].serve) + .6) {
        const w = sv.who, n = Math.min(w.n, c4Stock(g)), pay = n * c4Price(g);
        c4SetStock(g, c4Stock(g) - n); SAVE4.money += pay; C4.today.sold += n; C4.today.take += pay; C4.today.cogs += n * c4Unit(g); C4.today.served++;
        C4.fx.push({ x: C4_GOODS[g].x + 40, y: c4Y(C4_STALL_Z) - 210, t: 0, s: '+' + pay }); AU.pluck(84 + (pay % 5));
        if (w.kind === 'mouse' && g === 'trau') w.carry = MP.ladong;
        c4Say(g === 'trau' ? C4.wife : SAVE4.shops[g], c4Pick(g === 'trau' ? C4_SELL : C4_THANKS)); c4Leave(w, true); C4.SV[g] = null; c4Hud();
      }
    }
  }
  // the husband fetching more (sent from a stall sheet)
  const P = C4.porter;
  if (P.st === 'out') { P.x -= 150 * dt; P.z = Math.min(.3, P.z + dt * .2); P.ph += dt * 10; if (P.x <= Math.min(C4_OFF, C4.camX - 110)) { P.st = 'away'; P.t = 2; } }
  else if (P.st === 'away') { if ((P.t -= dt) <= 0) { P.st = 'back'; AU.click(); } }
  else if (P.st === 'back') { P.x += 140 * dt; P.ph += dt * 10; if (P.x >= c4HusbX() - 60) P.z = Math.max(.04, P.z - dt * .5); if (P.x >= c4HusbX()) { P.x = c4HusbX(); P.z = .04; P.st = 'idle'; c4Receive(P.good, P.qty, P.cost); c4Say(P, c4Pick(C4_HUSBAND)); setTimeout(() => c4Say(C4.wife, c4Pick(C4_WIFE_GOT)), 1300); } }
  if (SAVE4.debt > 0 && SAVE4.money > 0) { const p = Math.min(SAVE4.debt, SAVE4.money, dt * 40); SAVE4.debt -= p; SAVE4.money -= p; }
  if (C4.build) { C4.build.t += dt; if (Math.floor(C4.build.t * 3) !== Math.floor((C4.build.t - dt) * 3)) AU.tap(); if (C4.build.t >= 6) { SAVE4.lv = C4.build.to; if (C4.porter.st === 'idle') C4.porter.x = c4HusbX(); C4.build = null; AU.drumOne(); AU.pluck(88); persist4(); c4Hud(); } }
  C4.camX = Math.max(-140, Math.min(C4_W - c4View().vw + 40, C4.camX));
  if ((C4.hudT = (C4.hudT || 0) - dt) <= 0) { C4.hudT = .25; c4Hud(); }
  if ((C4.saveT = (C4.saveT || 0) - dt) <= 0) { C4.saveT = 5; persist4(); }
}
function c4ChatStart(a, b) {
  if (a.x > b.x) [a, b] = [b, a];
  const others = [...C4.walkers.filter(w => w !== a && w !== b).map(w => w.name), ...C4.vendors.map(v => v.name)].filter(n => n !== a.name && n !== b.name);
  const fill = s => s.replace(/\{A\}/g, a.name).replace(/\{B\}/g, b.name).replace(/\{X\}/g, () => c4Pick(others.length ? others : ['ông Lý']));
  let news = null, pick = C4_CHATS;
  if (R() < .38 && SAVE4.next) {
    const truth = k => k === 'mua' ? SAVE4.next.wx === 'mua' : !!SAVE4.next[k];
    const kinds = Object.keys(C4_NEWS), yes = kinds.filter(truth), no = kinds.filter(k => !truth(k));
    news = (yes.length && (R() < .72 || !no.length)) ? c4Pick(yes) : c4Pick(no.length ? no : kinds);
    pick = C4_NEWS[news];
  }
  const script = c4Pick(pick).map(([k, s]) => [k, fill(s).replace(/^./, ch => ch.toUpperCase())]);
  const c = { a, b, script, i: -1, t: 0, news, heard: false };
  for (const w of [a, b]) { w.st = 'chat'; w.chat = c; }
  a.face = 1; b.face = -1; const mid = (a.x + b.x) / 2, mz = (a.z + b.z) / 2; a.x = mid - 42; b.x = mid + 42; a.z = b.z = mz;
}
function c4ChatStep(c, dt) {
  c.t -= dt; if (c.t > 0) return;
  for (const w of [c.a, c.b]) w.talk = false;
  if (++c.i >= c.script.length) {
    for (const w of [c.a, c.b]) { w.st = 'walk'; w.face = w.dir; w.chat = null; w.cd = 18 + R() * 14; }
    if (c.news && c.heard && !SAVE4.notes.some(n => n.day === SAVE4.day + 1 && n.kind === c.news)) {
      SAVE4.notes.push({ day: SAVE4.day + 1, kind: c.news, text: C4_NOTE[c.news] }); SAVE4.notes = SAVE4.notes.filter(n => n.day >= SAVE4.day);
      persist4(); AU.pluck(90); C4.noteNew = true; c4Hud(); toast('Đã ghi vào sổ tay.', 2);
    }
    return;
  }
  const [k, s] = c.script[c.i], who = k ? c.b : c.a;
  who.talk = true; const life = 1.5 + s.length * .05; c4Say(who, s, life); who.say.whisper = c.news && !c.heard; c.t = life + .25;
}
function c4Listen(c) {
  if (c.heard) return; c.heard = true; AU.tap();
  for (const w of [c.a, c.b]) if (w.say) w.say.whisper = false;
  c.i = -1; c.t = 0;
}
function c4Leave(w, bought) { const q = w.shop && C4.Q[w.shop], i = q ? q.indexOf(w) : -1; if (i >= 0) q.splice(i, 1); w.st = 'leave'; w.face = bought ? (R() < .5 ? 1 : -1) : 1; w.sp = (w.kind === 'mouse' ? 70 : w.sp) + R() * 20; }
function c4EndDay() {
  C4.phase = 'night';
  for (const w of C4.walkers) if (w.st !== 'leave') { w.st = 'leave'; w.face = w.x < C4_STALL ? -1 : 1; w.chat = null; w.talk = false; }
  for (const g of Object.keys(C4.Q)) { C4.Q[g] = []; C4.SV[g] = null; }
  C4.cat = null; C4.shut = 0; C4.parade = null; C4.fire = 0;
  if (C4.kid) { SAVE4.money += 10; C4.kid = null; }
  const d = C4.today, lines = [];
  // what does not keep is lost
  for (const g of c4Owned()) { const G = C4_GOODS[g], n = c4Stock(g); if (n && G.keep !== 'ever') { d.wilt += n; d.wiltLoss += n * c4Unit(g); lines.push(`${n} ${G.unit} ${G.name.toLowerCase()}`); c4SetStock(g, 0); } }
  d.wiltLoss = Math.round(d.wiltLoss);
  // helpers are paid; one owed two days running walks out
  const quits = [];
  for (const g of C4_SHOPS) {
    const s = SAVE4.shops[g]; if (!s || !s.own || !s.staff) continue;
    const wage = s.nowage ? 0 : C4_GOODS[g].wage; s.nowage = false;
    if (s.quit) { quits.push(`${c4Cap1(s.staff)} (${C4_GOODS[g].name.toLowerCase()}) bỏ việc.`); s.staff = null; s.quit = false; continue; }
    if (SAVE4.money >= wage) { SAVE4.money -= wage; d.wages += wage; s.unpaid = 0; }
    else if (++s.unpaid >= 2) { quits.push(`${c4Cap1(s.staff)} hai hôm không được trả công, bỏ việc.`); s.staff = null; s.unpaid = 0; }
  }
  const gain = d.take - d.cogs - d.wiltLoss - d.spent - d.wages + d.got;
  if (gain > SAVE4.best) SAVE4.best = gain;
  if (SAVE4.favor > 0) SAVE4.favor--;
  if (SAVE4.rival > 0) SAVE4.rival--; if (SAVE4.cheap > 0) SAVE4.cheap--;
  SAVE4.phuc = 0;
  $('#c4dayT').textContent = `Ngày ${SAVE4.day} đã tan chợ`;
  $('#c4dayB').innerHTML = `<div><b>${c4Money(d.take)}</b><span>Bán được</span></div><div><b>${c4Money(d.cogs)}</b><span>Tiền hàng</span></div><div class="${gain >= 0 ? 'gain' : 'loss'}"><b>${c4Money(Math.abs(gain))}</b><span>${gain >= 0 ? 'Lãi' : 'Lỗ'}</span></div>`;
  $('#c4dayN').innerHTML = `${d.served} khách mua${d.lost ? ' · ' + d.lost + ' khách bỏ đi' : ''}`
    + (lines.length || d.wiltLoss ? `<br><span class="bad">Hàng hỏng phải bỏ${lines.length ? ' (' + lines.join(', ') + ')' : ''}: mất ${c4Money(d.wiltLoss)}</span>` : '')
    + (d.wages ? `<br>Trả công người phụ: ${c4Money(d.wages)}` : '')
    + (d.spent ? `<br>Chi khác (củi, lễ, tiền chợ, cho vay…): ${c4Money(d.spent)}` : '')
    + (d.got ? `<br>Thu khác: ${c4Money(d.got)}` : '')
    + (quits.length ? `<br><span class="bad">${quits.join(' ')}</span>` : '')
    + (SAVE4.debt > 0 ? `<br>Còn nợ lái buôn ${c4Money(SAVE4.debt)}` : '')
    + (SAVE4.goal ? '' : `<br>Mục tiêu ${c4Money(C4_GOAL)}: đã có ${c4Money(SAVE4.money)}`);
  persist4();
  setTimeout(() => { if (S.mode === 'c4play' && C4.phase === 'night') c4Sheets('c4day'); }, 900);
}
function c4NewDay() {
  SAVE4.day++; SAVE4.plan = SAVE4.next; SAVE4.next = c4Roll(SAVE4.day + 1); persist4();
  C4.mins = C4_OPEN; C4.phase = 'morning'; C4.today = { sold: 0, take: 0, cogs: 0, served: 0, lost: 0, wilt: 0, wiltLoss: 0, spent: 0, got: 0, wages: 0 }; C4.spawnT = .3; C4.wed = null; C4.parade = null; C4.cat = null;
  for (const g of C4_SHOPS) if (c4Own(g)) SAVE4.shops[g].sick = false;
  for (let i = 0; i < 6; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
  c4Hud(); c4Morning();
}
function c4Hud() {
  $('#c4Money').textContent = c4Money(SAVE4.money) + (SAVE4.goal ? '' : ' / ' + c4Money(C4_GOAL));
  $('#c4Time').textContent = `Ngày ${SAVE4.day} · giờ ${c4Hour(C4.mins)} · ${c4Clock(C4.mins)}${{ mua: ' · mưa', ret: ' · rét', gat: ' · nắng gắt', dep: '' }[c4Wx()]}`;
  $('#c4Stock').textContent = c4Owned().map(g => `${C4_GOODS[g].name.split(' ')[0]} ${c4Stock(g)}`).join(' · ');
  $('#c4Debt').textContent = SAVE4.debt > 0.5 ? 'Nợ ' + c4Money(SAVE4.debt) : '';
  $('#c4Debt').hidden = !(SAVE4.debt > 0.5);
  $('#c4Note').classList.toggle('new', !!C4.noteNew);
}

/* ---------- stall sheets: more goods, a bigger betel stall, renting a plot, hiring a helper ---------- */
function c4OpenUp(g = 'trau') {
  const G = C4_GOODS[g], P = C4.porter, box = $('#c4upO');
  $('#c4upGo').hidden = true; $('#c4upB').innerHTML = '';
  if (g !== 'trau' && !c4Own(g)) {                                         // an empty plot
    $('#c4upT').textContent = 'Đất trống';
    const ok = SAVE4.day >= G.from;
    box.innerHTML = ok ? `<p>Thuê chỗ này bán <b>${G.name.toLowerCase()}</b>: ${c4Money(G.rent)}, và thuê một người phụ bán, công ${G.wage} đồng mỗi ngày.</p><p class="hint">${c4Ware(g)}</p>`
      : `<p>Chỗ này để bán <b>${G.name.toLowerCase()}</b>, từ ngày ${G.from} mới cho thuê.</p>`;
    if (ok) { $('#c4upGo').hidden = false; $('#c4upGo').disabled = SAVE4.money < G.rent || C4.phase !== 'open'; $('#c4upGo').textContent = `Thuê · ${c4Money(G.rent)}`; $('#c4upGo').onclick = () => c4Rent(g); }
    c4Sheets('c4up'); return;
  }
  $('#c4upT').textContent = g === 'trau' ? c4Lv().name : G.name;
  const s = g !== 'trau' && SAVE4.shops[g];
  if (s && !s.staff) {                                                      // nobody minding it: hire someone
    box.innerHTML = `<p>Hàng ${G.name.toLowerCase()} không có ai trông.</p>`;
    $('#c4upGo').hidden = false; $('#c4upGo').disabled = false; $('#c4upGo').textContent = `Thuê người · công ${G.wage} đồng/ngày`; $('#c4upGo').onclick = () => { s.staff = c4Pick(C4_NAMES.mouse); s.sort = c4Pick(C4_HELPERS); s.unpaid = 0; c4Sheets(null); toast(`${c4Cap1(s.staff)} nhận trông hàng ${G.name.toLowerCase()}.`); persist4(); };
    c4Sheets('c4up'); return;
  }
  if (P.st !== 'idle') box.innerHTML = '<p>Chồng đang đi lấy hàng…</p>';
  else if (C4.phase !== 'open') box.innerHTML = '';
  else {
    box.innerHTML = `<h4>Nhập thêm ${G.name.toLowerCase()}</h4><div class="ord"></div><button class="btn get">Sai chồng đi lấy</button>`;
    let q = 0; c4Stepper(box.querySelector('.ord'), g, v => { q = v; });
    box.querySelector('.get').addEventListener('click', () => { if (!q) { c4Sheets(null); return; } Object.assign(P, { st: 'out', good: g, qty: q, cost: c4Cost(g) }); c4Sheets(null); toast('Chồng đi lấy hàng ở bến.'); });
  }
  if (g === 'trau') {
    const nx = C4_LV[SAVE4.lv + 1];
    if (!nx) $('#c4upB').innerHTML = '<p>Gian hàng trầu khang trang nhất phiên chợ.</p>';
    else { $('#c4upB').innerHTML = `<h4>Nâng cấp</h4><p class="nx">Lên <b>${nx.name}</b>: chứa ${nx.cap} miếng · nhập ${nx.cost} đồng/miếng · khách ghé đông hơn, bán nhanh hơn</p>`; $('#c4upGo').hidden = false; $('#c4upGo').disabled = !(SAVE4.money >= nx.up && !C4.build); $('#c4upGo').textContent = `Nâng cấp · ${c4Money(nx.up)}`; $('#c4upGo').onclick = c4DoUp; }
  }
  c4Sheets('c4up');
}
// what each ware is like, for the plot sheet
const c4Ware = g => ({ che: 'Bán chạy buổi sáng, trời rét hay mưa; nắng gắt thì ế. Mỗi ngày tốn củi đun. Tan chợ chè thừa phải đổ.', xoi: 'Chỉ bán buổi sáng. Đến giờ Ngọ (11–13 giờ) xôi thiu, thừa bao nhiêu đổ bấy nhiêu.', xen: 'Kim chỉ, lược, gương… để lâu không hỏng, nhưng lãi mỏng, bán chậm.', bun: 'Bán chạy quanh trưa. Vốn đắt, công người phụ cao; tan chợ bún thừa phải đổ.' }[g]);
function c4Rent(g) {
  const G = C4_GOODS[g]; if (SAVE4.money < G.rent) return;
  SAVE4.money -= G.rent; C4.today.spent += G.rent;
  SAVE4.shops[g] = { own: true, stock: 0, staff: c4Pick(C4_NAMES.mouse), sort: c4Pick(C4_HELPERS), unpaid: 0, sick: false };
  C4.Q[g] = []; C4.SV[g] = null;
  c4Sheets(null); AU.stamp(); AU.pluck(88); persist4(); c4Hud();
  toast(`Đã thuê chỗ bán ${G.name.toLowerCase()}, ${SAVE4.shops[g].staff} trông hàng. Chạm vào để nhập hàng!`, 3.6);
}
function c4DoUp() {
  const nx = C4_LV[SAVE4.lv + 1]; if (!nx || SAVE4.money < nx.up || C4.build) return;
  SAVE4.money -= nx.up; C4.build = { to: SAVE4.lv + 1, t: 0 };
  for (const w of [...C4.Q.trau]) c4Leave(w, false); C4.SV.trau = null;
  c4Sheets(null); persist4(); c4Hud(); AU.stamp();
}
const c4CanUp = () => { const nx = C4_LV[SAVE4.lv + 1]; return nx && SAVE4.money >= nx.up && !C4.build; };
function c4OpenNotes() {
  C4.noteNew = false; c4Hud();
  const days = [...new Set(SAVE4.notes.map(n => n.day))].sort();
  $('#c4noteB').innerHTML = (SAVE4.goal ? '' : `<p class="goal">Mục tiêu: để dành <b>${c4Money(C4_GOAL)}</b> thì vợ chồng mới tính chuyện con cái.</p>`)
    + (days.length ? days.map(d => `<h4>${d === SAVE4.day ? 'Hôm nay' : d === SAVE4.day + 1 ? 'Ngày mai' : 'Ngày ' + d}</h4>` + SAVE4.notes.filter(n => n.day === d).map(n => `<p>• ${n.text}</p>`).join('')).join('') : '<p>Chưa nghe được chuyện gì. Ai thì thầm thì lại gần nghe lỏm xem!</p>');
  c4Sheets('c4note');
}

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
  const wx = c4Wx(), rain = wx === 'mua';
  const dayK = Math.max(0, Math.min(1, (C4.mins - C4_OPEN) / (C4_CLOSE - C4_OPEN)));
  g.save(); g.translate(cx * .85, 0);
  g.fillStyle = rain || wx === 'ret' ? '#9d95b9' : wx === 'gat' ? '#c73a1e' : '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(80 + dayK * (vw - 160), -oy + 90 + Math.pow(dayK * 2 - 1, 2) * 110, wx === 'gat' ? 40 : 32, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  g.save(); g.translate(cx * .55, 0); g.globalAlpha = .5;
  for (const [x, k, sc] of [[-80, 'house', .45], [260, 'bamboo', .5], [520, 'house', .42], [880, 'tree', .45], [1180, 'house', .45], [1500, 'bamboo', .45], [1720, 'house', .42]])
    if (x + 150 > cx * .45 - 40 && x - 150 < cx * .45 + vw + 40) dp(g, k === 'house' ? WP.house : k === 'tree' ? WP.bigTree : PROPS.bamboo, x, C4_Y0 - 70, 0, sc, sc);
  g.globalAlpha = 1; g.restore();
  g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, C4_Y0 - 4, vw + 100, C4_D + 10);
  g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, C4_Y0 + C4_D + 6, vw + 100, V.vh);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, C4_Y0 - 4); g.lineTo(cx + vw + 50, C4_Y0 - 4); g.stroke();
  g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1.4; g.setLineDash([18, 14]);
  for (const z of [.45, .78]) { g.beginPath(); g.moveTo(cx - 50, c4Y(z)); g.lineTo(cx + vw + 50, c4Y(z)); g.stroke(); }
  g.setLineDash([]);
  g.strokeStyle = '#2f6a4c'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0, rr = mulberry(41); i < 110; i++) { const tx = -300 + rr() * (C4_W + 300), ty = C4_Y0 + C4_D + 14 + rr() * Math.max(20, V.vh - oy - C4_Y0 - C4_D - 30); if (!vis(tx, 20)) continue; g.beginPath(); for (const d of [-6, 0, 6]) { g.moveTo(tx + d, ty); g.lineTo(tx + d * 1.6, ty - 12 - Math.abs(d)); } g.stroke(); }
  for (const [x, k, s] of [[960, 'tree', .9], [1360, 'house', .72], [1760, 'house', .7], [2050, 'bamboo', .8], [2260, 'hay', .9], [600, 'house', .62], [210, 'bamboo', .7]])
    if (vis(x, 260)) dp(g, k === 'tree' ? WP.bigTree : k === 'house' ? WP.house : k === 'bamboo' ? PROPS.bamboo : PROPS.hay, x, C4_Y0, 0, s, s);
  if (vis(C4_GATE, 140)) dp(g, A.gate, C4_GATE, C4_Y0 + 6, 0, .88, .88);
  const items = [], bubbles = [];
  const head = (x, z, tall, e, pri = 1, chat = null) => { if (e && e.say) bubbles.push({ e, x, y: c4Y(z) - tall * c4S(z) - 8, s: c4S(z), pri, chat }); };
  for (const v of C4.vendors) if (vis(v.x, 140)) {
    items.push({ z: .05, f: () => c4Mouse(g, v.M, v.x - 40, 1, C4.t * 2 + v.x, false, v.say ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null, null, c4S(.05) * .95, c4Y(.05), v.x) });
    items.push({ z: .1, f: () => dp(g, A[v.ware], v.x + 50, c4Y(.1), 0, c4S(.1), c4S(.1)) });
    head(v.x - 40, .05, 168 * .95, v, 0);
  }
  // the couple's other plots: rented ones with their stall and helper, empty ones with a board
  for (const sh of C4_SHOPS) {
    const G = C4_GOODS[sh], sx = G.x, sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z); if (!vis(sx, 200)) continue;
    if (c4Own(sh)) {
      const s = SAVE4.shops[sh], serving = C4.SV[sh] ? Math.sin(Math.min(1, C4.SV[sh].t / (G.serve + .6)) * Math.PI) : 0;
      if (s.staff && !s.sick) { items.push({ z: C4_WIFE_Z, f: () => c4Mouse(g, c4MouseRig(s.sort || 1), sx - 80, 1, C4.t * 2, false, -.2 - serving * 1.1, null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), sx) }); head(sx - 80, C4_WIFE_Z, 168, s, 2); }
      items.push({ z: C4_STALL_Z, f: () => { g.globalAlpha = c4Open(sh) && !(C4.shut > 0) ? 1 : .45; dp(g, A[G.art], sx + 20, sy, 0, ss, ss); g.globalAlpha = 1;
        if (c4Stock(sh) <= 0 && C4.phase === 'open') { g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.fillStyle = '#a3332a'; g.fillText('Hết hàng', sx + 20, sy - 120 * ss); } } });
    } else {
      items.push({ z: C4_STALL_Z, f: () => { dp(g, A.lot, sx, sy, 0, ss, ss); g.save(); g.translate(sx, sy); g.scale(ss, ss); g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK;
        const open = SAVE4.day >= G.from; g.fillText(open ? 'Đất trống' : G.name, 0, -102); g.font = '700 13px "Playfair Display", serif'; g.fillText(open ? 'thuê ' + c4Money(G.rent) : 'từ ngày ' + G.from, 0, -83); g.restore(); } });
    }
  }
  const lv = SAVE4.lv;
  if (C4.build) items.push({ z: C4_STALL_Z, f: () => { dp(g, A.scaffold, C4_STALL, c4Y(C4_STALL_Z), 0, c4S(C4_STALL_Z), c4S(C4_STALL_Z)); for (let i = 0; i < 3; i++) { const k = (C4.t * .8 + i / 3) % 1; g.globalAlpha = .5 * (1 - k); g.fillStyle = '#c3b596'; g.beginPath(); g.arc(C4_STALL - 60 + i * 60, c4Y(C4_STALL_Z) - 20 - k * 60, 14 + k * 20, 0, 6.283); g.fill(); g.globalAlpha = 1; } } });
  else {
    const serving = C4.SV.trau ? Math.sin(Math.min(1, C4.SV.trau.t / (c4Lv().serve + .6)) * Math.PI) : 0, wx2 = C4_STALL - (lv ? 70 : 130);
    items.push({ z: C4_WIFE_Z, f: () => c4Mouse(g, MICE.b, wx2, 1, C4.t * 2, false, -.2 - serving * 1.1, serving > .3 ? MP.ladong : null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), 2.1) });
    items.push({ z: C4_STALL_Z, f: () => { const sx = C4_STALL + (lv ? 10 : 30), sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z);
      g.globalAlpha = C4.shut > 0 ? .45 : 1; dp(g, c4StallArt(lv), sx, sy, 0, ss, ss); g.globalAlpha = 1;
      if (SAVE4.cauDoi) for (const d of [-1, 1]) { const px = sx + d * (lv ? 120 : 112) * ss, py = sy - (lv ? 150 : 80) * ss; g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(px - 7, py - 40 * ss, 14, 60 * ss); g.strokeRect(px - 7, py - 40 * ss, 14, 60 * ss); g.fillStyle = '#f2c640'; for (let k = 0; k < 3; k++) g.fillRect(px - 3, py - 32 * ss + k * 18 * ss, 6, 8 * ss); }
    } });
    head(wx2, C4_WIFE_Z, 168, C4.wife, 2);
  }
  { const P = C4.porter, walk = P.st === 'out' || P.st === 'back', load = P.st === 'back';
    if (P.st !== 'away' && vis(P.x, 80)) items.push({ z: P.z, f: () => c4Mouse(g, MICE.groom, P.x, P.st === 'out' ? -1 : 1, P.ph, walk, load ? -1.35 : null, load ? WP.basket : null, c4S(P.z), c4Y(P.z), 1.3) });
    head(P.x, P.z, 168, P, 2); }
  if (C4.cat) {
    // a big cat, bigger than any mouse: on the roof behind the stall, a leap down to the stall front; back up and off
    const c = C4.cat, roof = [600, C4_Y0 - 150, c4S(0) * 1.3], spot = [C4_STALL + 190, c4Y(.3), c4S(.3) * 1.9];
    let p = spot, face = 1, z = .3, hop = 0;
    const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    if (c.st === 'roof') { p = roof; z = -1; }
    else if (c.st === 'down') { const k = Math.min(1, c.t / .8); p = mix(roof, spot, k); hop = Math.sin(k * Math.PI) * 90; face = -1; z = k < .5 ? -1 : .3; }
    else if (c.st === 'up') { const k = Math.min(1, c.t / .8); p = mix(spot, roof, k); hop = Math.sin(k * Math.PI) * 90; face = 1; z = k > .5 ? -1 : .3; }
    else if (c.st === 'away') { p = [roof[0] + c.t * 260, roof[1], roof[2]]; face = -1; z = -1; }
    const st = c.st === 'fed' ? 'fed' : 'watch', [x, y, s] = p;
    items.push({ z, f: () => { g.save(); g.translate(x, y - hop); g.scale(face, 1); drawCatAt(g, 0, 0, s, st); g.restore(); } });
  }
  if (C4.kid) items.push({ z: .2, f: () => c4Mouse(g, c4MouseRig(12), C4_STALL - 190, 1, C4.t * 2, false, null, null, c4S(.2) * .62, c4Y(.2), 4) });
  if (C4.parade && C4.parade.x !== null) {
    const pd = C4.parade, z = .62, s = c4S(z) * .9;
    [[MICE.c, ITEM.drum, -.4], [MICE.d, ITEM.ken, -1.05], [MICE.a, ITEM.parasol, -1.35], [MICE.groom, null, null], [MICE.b, null, null]].forEach(([M, it, arm], i) => {
      const x = pd.x - i * 70; if (!vis(x, 80)) return;
      items.push({ z: z + i * .001, f: () => c4Mouse(g, M, x, 1, pd.ph + i, true, arm, it, s, c4Y(z), i) });
    });
  }
  for (const w of C4.walkers) if (vis(w.x, 80)) { items.push({ z: w.z, f: () => c4Critter(g, w, w.x, c4Y(w.z), c4S(w.z)) }); head(w.x, w.z, C4_TALL[w.kind] * (w.kind === 'mouse' ? .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .68 : 1) : 1), w, w.st === 'chat' || w.st === 'queue' ? 1.5 : .5, w.chat); }
  items.sort((a, b) => a.z - b.z); for (const it of items) it.f();
  if (c4CanUp() && C4.phase === 'open' && !C4.build) { const b = Math.sin(C4.t * 4) * 6, ax = C4_STALL + 20, ay = c4Y(C4_STALL_Z) - [200, 270, 310][lv] * c4S(C4_STALL_Z) + b; g.fillStyle = '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ax, ay - 26); g.lineTo(ax + 20, ay); g.lineTo(ax + 8, ay); g.lineTo(ax + 8, ay + 18); g.lineTo(ax - 8, ay + 18); g.lineTo(ax - 8, ay); g.lineTo(ax - 20, ay); g.closePath(); g.fill(); g.stroke(); }
  for (const gq of Object.keys(C4.Q)) for (const w of C4.Q[gq]) { const k = Math.max(0, 1 - w.wait / (c4Lv().wait + C4.Q[gq].indexOf(w) * 2)), y = c4Y(w.z) - C4_TALL[w.kind] * c4S(w.z) - 14; if (w.say) continue; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(w.x - 22, y, 44, 7); g.strokeRect(w.x - 22, y, 44, 7); g.fillStyle = k > .4 ? '#2f6a4c' : '#a3332a'; g.fillRect(w.x - 21, y + 1, 42 * k, 5); }
  for (const f of C4.fx) { const k = f.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = '900 26px "Playfair Display", serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = f.s[0] === '+' ? '#2f6a4c' : INK; g.strokeText(f.s, f.x, f.y - k * 40); g.fillText(f.s, f.x, f.y - k * 40); g.restore(); }
  // speech bubbles, each fixed over its speaker's head; once shown a bubble keeps its place; a whisper shows "…" and an ear
  const shown = b => b.e.say.shown ? 1 : 0;
  bubbles.sort((a, b) => shown(b) - shown(a) || b.pri - a.pri || a.e.say.t - b.e.say.t);
  const placed = [];
  for (const b of bubbles) {
    const sy = b.e.say, whisper = sy.whisper, B = c4Bubble(whisper ? '…' : sy.text, 0, 13, 150), a = Math.min(1, sy.t * 6, (sy.life - sy.t) * 4), sc = (.8 + .2 * b.s) * (.9 + .1 * Math.min(1, sy.t * 6));
    const x = b.x, y = b.y - (B.bh + 30) * sc, hh = (B.bh + 6) * sc, bw = (B.w / 2 - 8) * sc;
    if (!sy.shown && placed.some(p => Math.abs(p.x - x) < p.w + bw && Math.abs(p.y - y) < p.h + hh)) continue;
    sy.shown = true; placed.push({ x, y, w: bw, h: hh });
    g.globalAlpha = Math.max(0, a); dp(g, B, x, y, 0, sc, sc);
    if (whisper) c4Ear(g, x + B.w / 2 * sc, y - B.bh * sc - 4, sc * 1.6, C4.t);
    g.globalAlpha = 1;
  }
  const m = C4.mins, dusk = C4.phase === 'night' ? .45 : Math.max(0, Math.min(.3, (m - (C4_CLOSE - 60)) / 60 * .3)) + Math.max(0, (C4_OPEN + 40 - m) / 40 * .18);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (rain) { ctx.strokeStyle = 'rgba(47,95,143,.35)'; ctx.lineWidth = 1.5 * DPR; ctx.beginPath(); for (let i = 0, rr = mulberry(7 + ((C4.t * 12) | 0)); i < 70; i++) { const x = rr() * cv.width, y = rr() * cv.height; ctx.moveTo(x, y); ctx.lineTo(x - 6 * DPR, y + 16 * DPR); } ctx.stroke(); ctx.fillStyle = 'rgba(80,90,110,.12)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (wx === 'ret') { ctx.fillStyle = 'rgba(120,140,170,.14)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (wx === 'gat') { ctx.fillStyle = 'rgba(255,170,60,.08)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (C4.fire > 0) { ctx.fillStyle = `rgba(200,60,20,${.12 + Math.sin(C4.t * 8) * .04})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (dusk > 0) { ctx.fillStyle = `rgba(40,30,60,${dusk})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
function c4Ear(g, x, y, s, t) {
  g.save(); g.translate(x, y + Math.sin(t * 5) * 2); g.scale(s, s);
  g.fillStyle = '#e2a597'; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-2, 12); g.bezierCurveTo(-12, 10, -12, -10, 0, -12); g.bezierCurveTo(12, -12, 12, 2, 4, 6); g.quadraticCurveTo(0, 9, -2, 12); g.fill(); g.stroke();
  g.lineWidth = 1.5; g.beginPath(); g.moveTo(-3, 5); g.bezierCurveTo(-7, 0, -4, -7, 2, -6); g.stroke();
  g.restore();
}
function c4TapHint() {
  const A = howtoArt(), W = cv.width / DPR, H = cv.height / DPR, Z = Math.min(1.35, Math.max(1.1, W / 420)), ph = (C4.storyT % 1.2) / 1.2, tap = ph < .18;
  ctx.save(); ctx.setTransform(DPR * Z, 0, 0, DPR * Z, (W - 34 - 35 * Z) * DPR, (H - 34 - 35 * Z) * DPR);
  if (isTouch) { if (tap) { ctx.strokeStyle = INK; ctx.lineWidth = 1.6; for (const r of [9, 15]) { ctx.globalAlpha = 1 - ph / .18; ctx.beginPath(); ctx.arc(-3, -30, r, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1; } dp(ctx, A.finger, 0, -27 - (tap ? 0 : Math.sin(ph * Math.PI) * 6), -.15, .62, .62); }
  else { dp(ctx, A.mouse, 0, -9, 0, .72, .72); if (tap) dp(ctx, A.click, 0, -9, 0, .72, .72); }
  ctx.restore();
}

/* ---------- input: drag to look along the lane; tap a whispering pair, a stall or a plot ---------- */
function c4World(e) { const r = cv.getBoundingClientRect(), V = c4View(); return [(e.clientX - r.left) / V.s + C4.camX, (e.clientY - r.top) / V.s - V.oy]; }
function c4Down(e) { if (S.mode !== 'c4play') return; C4.drag = { x0: e.clientX, cam0: C4.camX, moved: false }; if (C4.phase !== 'story') capturePointer(e); }
function c4Move(e) { const d = C4.drag; if (!d || C4.phase === 'story') return; const dx = e.clientX - d.x0; if (Math.abs(dx) > 8) d.moved = true; if (d.moved) C4.camX = d.cam0 - dx / c4View().s; }
function c4Up(e) {
  const d = C4.drag; C4.drag = null; if (!d || d.moved || S.mode !== 'c4play') return;
  if (C4.phase === 'story') { c4StoryNext(); return; }
  const [x, y] = c4World(e);
  for (const w of C4.walkers) if (w.st === 'chat' && w.chat.news && !w.chat.heard) {
    const c = w.chat, mx = (c.a.x + c.b.x) / 2, s = c4S(c.a.z), top = c4Y(c.a.z) - 230 * s;
    if (Math.abs(x - mx) < 95 * s && y > top && y < c4Y(c.a.z) + 10) { c4Listen(c); return; }
  }
  const sy = c4Y(C4_STALL_Z), s = c4S(C4_STALL_Z);
  if (Math.abs(x - C4_STALL) < 170 * s && y > sy - 300 * s && y < sy + 30) { AU.tap(); c4OpenUp('trau'); return; }
  for (const g of C4_SHOPS) if (Math.abs(x - C4_GOODS[g].x) < 120 * s && y > sy - 200 * s && y < sy + 30) { AU.tap(); c4OpenUp(g); return; }
}
function c4Key(e) {
  if (C4.phase === 'story' && ['Space', 'Enter', 'ArrowRight'].includes(e.code)) { e.preventDefault(); c4StoryNext(); return; }
  if (e.code === 'Escape') { if (!$('#c4up').hidden || !$('#c4note').hidden) c4Sheets(null); else showChapters(); }
}

/* ---------- HUD, sheets, registration ---------- */
{
  const hud = document.createElement('div'); hud.id = 'c4hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="c4Name">Vợ Chồng Khởi Nghiệp</button><div class="mid"><div class="tag" id="c4Time"></div></div><div class="right"><div class="tag" id="c4Money"></div><div class="tag" id="c4Stock"></div><div class="tag debt" id="c4Debt" hidden></div><button class="tag" id="c4Note">Sổ tay</button></div>';
  const sheet = (id, inner) => { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet'; d.hidden = true; d.innerHTML = `<div class="card4">${inner}</div>`; return d; };
  document.body.append(hud,
    sheet('c4am', '<h3 id="c4amT"></h3><div id="c4amB"></div><h4>Sáng nay nhập bao nhiêu hàng?</h4><p class="hint">Hàng tươi không để qua đêm được: tan chợ còn thừa là hỏng, mất vốn.</p><div id="c4amO"></div>'),
    sheet('c4up', '<h3 id="c4upT"></h3><div id="c4upO"></div><div id="c4upB"></div><div class="row"><button class="btn" id="c4upGo"></button><button class="btn alt" id="c4upX">Đóng</button></div>'),
    sheet('c4ev', '<h3 id="c4evT"></h3><p id="c4evB"></p><div class="row col" id="c4evO"></div>'),
    sheet('c4note', '<h3>Sổ tay</h3><div id="c4noteB"></div><div class="row"><button class="btn alt" id="c4noteX">Đóng</button></div>'),
    sheet('c4day', '<h3 id="c4dayT"></h3><div class="nums" id="c4dayB"></div><p id="c4dayN"></p><button class="btn" id="c4dayGo">Sang ngày mới</button>'));
  $('#c4Name').addEventListener('click', () => showChapters());
  $('#c4Note').addEventListener('click', () => { if (C4.phase === 'open') { AU.tap(); c4OpenNotes(); } });
  $('#c4dayGo').addEventListener('click', () => { c4Sheets(null); if (!SAVE4.goal && SAVE4.money >= C4_GOAL) c4GoalReached(); else c4NewDay(); });
  $('#c4upX').addEventListener('click', () => c4Sheets(null));
  $('#c4noteX').addEventListener('click', () => c4Sheets(null));
  for (const id of ['c4up', 'c4note']) $('#' + id).addEventListener('click', e => { if (e.target.id === id) c4Sheets(null); });
}
// still being made: closed on the public site (GitHub Pages), open everywhere else (this computer, the private artifact)
const C4_LOCAL = !location.hostname.endsWith('.github.io');
registerChapter({
  id: 4, modes: ['c4play'], locked: () => !C4_LOCAL, direct: startC4,   // no album: the card opens the market
  card: { num: 'Chương IV', han: '創業', name: 'Vợ Chồng Khởi Nghiệp', desc: 'Vợ chồng chuột mới cưới bàn nhau làm ăn: không đi ăn trộm, mà ra chợ buôn bán, để dành đủ hai quan mới tính chuyện con cái.', bg: PAPERS.yellow.css },
  progress: () => SAVE4.goal ? 'Đã đạt mục tiêu' : SAVE4.started ? `Ngày ${SAVE4.day} · ${c4Money(SAVE4.money)}` : 'Mới mở',
  hasProgress: () => SAVE4.started,
  hide: c4Hide,
  update: updateC4, render: renderC4, key: c4Key,
  pointer: { down: c4Down, move: c4Move, up: c4Up },
  next() { startC4(); }, retry() { startC4(); },
});
// chương V (the brood's adventures) is not made yet: its card shows once chương IV's goal is reached
registerChapter({
  id: 5, modes: [], locked: () => true, hidden: () => !SAVE4.goal,
  card: { num: 'Chương V', han: '冒險', name: 'Bầy Chuột Phiêu Lưu', desc: 'Bầy chuột con nhà trầu cau lớn lên, rủ nhau đi phiêu lưu khắp làng.', bg: '#cfcbd0' },
  lockText: 'Đang khắc ván', progress: () => 'Đang khắc ván',
});
