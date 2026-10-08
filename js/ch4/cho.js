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
const C4_W = 3950, C4_STALL = 720, C4_GATE = 390, C4_OFF = 300;           // … how far (at least) the husband goes for goods
const c4HusbX = () => SAVE4.lv ? C4_STALL + 70 : C4_STALL - 40;           // where he waits: just behind the betel stall
const C4_Y0 = 300, C4_D = 190;                                            // the lane: its far edge on screen, and its depth
const c4Y = z => C4_Y0 + z * C4_D, c4S = z => .62 + .42 * z;
const C4_CROWD = .86;                                                         // passers-by drawn this much smaller (owner: our stalls stand out)              // where depth z stands on screen, and how big
const C4_STALL_Z = .12, C4_WIFE_Z = .07, C4_Q_Z = .32;
const C4_OPEN = 5 * 60, C4_CLOSE = 19 * 60, C4_MPS = 4;                 // market hours (game minutes), game minutes per second
let C4_BUY0 = 1;                                                            // a buyer takes 1–3 (C4_BUY0 … +2)
let C4_PACE = .62;                                                          // how many come (a player: ~20 buyers a day; bots: ~15–30 a day, 2 quan ~day 17 with the stall upgraded)
const C4_GOAL = 1200;                                                     // 2 quan: then the children come, and chương V
// savings towards the goal: the purse less what is owed (borrowed money is not saved money)
const c4Net = () => SAVE4.money - SAVE4.debt - (SAVE4.loans || []).reduce((a, L) => a + L.owe, 0);
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
  che: { name: 'Chè xanh', unit: 'bát', x: 1150, price: 4, cost: 1, fuel: 10, keep: 'day', rent: 100, wage: 8, from: 2, cap: 80, serve: 1, art: 'che',
    hours: { 'Mão': 1.5, 'Thìn': 1.2, 'Tỵ': .8, 'Ngọ': .4, 'Mùi': .5, 'Thân': .8, 'Dậu': .7 }, wx: { gat: .4, mua: 1.7, ret: 2.1, dep: 1 } },
  xoi: { name: 'Xôi', unit: 'gói', x: 1580, price: 8, cost: 4, keep: 'noon', rent: 200, wage: 10, from: 4, cap: 60, serve: 1.2, art: 'xoi',
    hours: { 'Mão': 1.8, 'Thìn': 1.4, 'Tỵ': .7, 'Ngọ': 0, 'Mùi': 0, 'Thân': 0, 'Dậu': 0 }, wx: { gat: .8, mua: .9, ret: 1.4, dep: 1 } },
  xen: { name: 'Hàng xén', unit: 'món', x: 2010, price: 10, cost: 8, keep: 'ever', rent: 300, wage: 8, from: 6, cap: 60, serve: 1.6, art: 'xen',
    hours: { 'Mão': .6, 'Thìn': .9, 'Tỵ': .9, 'Ngọ': .6, 'Mùi': .7, 'Thân': .9, 'Dậu': .6 }, wx: { gat: .8, mua: .6, ret: 1, dep: 1 } },
  bun: { name: 'Bún riêu', unit: 'bát', x: 2440, price: 15, cost: 9, keep: 'day', rent: 500, wage: 15, from: 8, cap: 50, serve: 2.2, art: 'bun',
    hours: { 'Mão': .3, 'Thìn': .5, 'Tỵ': .9, 'Ngọ': 1.7, 'Mùi': 1.2, 'Thân': .5, 'Dậu': .3 }, wx: { gat: .7, mua: 1.1, ret: 1.4, dep: 1 } },
};
const C4_SHOPS = ['che', 'xoi', 'xen', 'bun'];                             // the plots you can rent, in order along the lane
const C4_HELPERS = [1, 3, 5, 0, 7];                                       // which mouse sorts serve as hired helpers
const C4_DEBT = 300;                                                      // the trader gives credit up to this
const C4_NEW = () => ({ day: 1, money: 60, stock: 0, debt: 0, lv: 0, started: false, best: 0, intro: false, plan: null, next: null, notes: [], owed: [], favor: 0, dues: 0, shops: {}, loans: [], goal: false, seed: (Math.random() * 1e9) | 0, folk: {} });
let SAVE4 = C4_NEW();
try { const s = JSON.parse(localStorage.getItem('dcc.c4') || 'null'); if (s && s.day) SAVE4 = Object.assign(SAVE4, s); } catch (e) {}
const persist4 = () => { try { localStorage.setItem('dcc.c4', JSON.stringify(SAVE4)); } catch (e) {} };
const c4Hour = m => C4_HOURS[Math.floor(((m / 60 + 1) % 24) / 2)];
// the old double-hours mean little to players today: show the clock too ("7:40"), and a double-hour's span ("15–17 giờ")
// the double-hours' animals (Mão is the cat in Vietnam), the weather and the wares as pictures (owner: fewer words)
const C4_ZOD = { 'Tý': '🐀', 'Sửu': '🐃', 'Dần': '🐅', 'Mão': '🐈', 'Thìn': '🐉', 'Tỵ': '🐍', 'Ngọ': '🐎', 'Mùi': '🐐', 'Thân': '🐒', 'Dậu': '🐓', 'Tuất': '🐕', 'Hợi': '🐖' };
const C4_WXI = { dep: '☀️', gat: '🔥', mua: '🌧️', ret: '❄️' };
const C4_WARE_I = { trau: 'Trầu', che: 'Chè', xoi: 'Xôi', xen: 'Xén', bun: 'Bún' };   // words: the drawn betel looked like a shield (a player)
const c4Clock = m => `${Math.floor(m / 60)}:${String(Math.floor(m % 60 / 10) * 10).padStart(2, '0')}`;
const c4Span = name => { const i = C4_HOURS.indexOf(name), a = (i * 2 + 23) % 24; return `giờ ${name} (${a}:00–${(a + 2) % 24}:00)`; };   // owner: the clock in brackets
const c4At = name => { const i = C4_HOURS.indexOf(name), a = (i * 2 + 23) % 24; return `giờ ${name} (${a}:00)`; };   // a set time: the start of the double-hour
const C4_BROKE = 200, C4_BROKE_DAYS = 3;                                   // owing this much this many mornings running: ruin
const C4_DUES_EVERY = 5;
// borrowing cash in the morning: a neighbour lends a little cheaply, cụ Lý lends a lot at a steep rate. SAVE4.loans:
// { from: 'xom' | 'ly', name, pid, amt, owe, due, late }. Repaid by hand on the morning sheet, or taken on the due morning.
const C4_LOANS = {
  xom: { amt: 60, rate: .1, days: 3, late: 5, max: 3 },     // late: what each morning overdue adds; max: overdue mornings before cụ Lý seizes all
  ly: { amt: 300, rate: .35, days: 5, late: .2, max: 3 },
};                                                  // the headman collects the market dues every fifth day
function c4Money(d) { d = Math.round(d); const a = Math.abs(d), q = Math.floor(a / 600), r = a % 600; return (d < 0 ? '−' : '') + (q ? `${q} quan${r ? ` ${r} đồng` : ''}` : `${r} đồng`); }   // a player asked for quan and đồng: 600 đồng a quan
const c4Num = d => (d < 0 ? '−' : '') + Math.abs(Math.round(d)).toLocaleString('vi-VN');
// the weather (fine, scorching, rain, cold) and what else a day brings
const C4_WX = { dep: 'Trời nắng đẹp.', gat: 'Nắng gắt như đổ lửa: đồ tươi mau hỏng, ít người uống chè.', mua: 'Trời mưa rả rích, chợ vắng hơn.', ret: 'Trời rét căm căm: ai cũng muốn bát chè nóng.' };
const c4OmenOn = k => !!(SAVE4.omens && SAVE4.omens.day === SAVE4.day && (SAVE4.omens.all || []).includes(k));
// the signs for today's talk: rain tomorrow → 80 % of days 1 or 2 signs; no rain → 30 % of days a false one (owner)
function c4OmensRoll() {
  const rain = !!(SAVE4.next && SAVE4.next.wx === 'mua'), wed = !!(SAVE4.next && SAVE4.next.cuoi);
  const RAIN = ['oi', 'quang', 'rang', 'hoang', 'chuon', 'kien', 'chim'], WED = ['do', 'cau', 'khac', 'nau'];
  const pick = (pool, n) => { const out = []; while (out.length < Math.min(n, pool.length)) { const k = c4Pick(pool); if (!out.includes(k)) out.push(k); } return out; };
  const nr = rain && R() < .8 ? 1 + (R() < .4 ? 1 : 0) : 0;                        // a sign is never wrong (owner): none unless rain is coming
  const nw = wed && R() < .6 ? 1 : 0;                                       // wedding signs are hard to notice (owner), and never wrong
  const left = [...pick(RAIN, nr), ...pick(WED, nw)];
  SAVE4.omens = { day: SAVE4.day, left, all: left.slice() };
}
function c4Roll(day) { const r = R(); return { wx: r < .45 ? 'dep' : r < .65 ? 'gat' : r < .85 ? 'mua' : 'ret', hoi: R() < .16, meo: R() < .3, thue: day % C4_DUES_EVERY === 0, cuoi: R() < (day <= 6 ? .4 : .2), rk: .2 + R() * .2, hk: 1.5 + R() * .4, ck: 1.5 + R() * .4 }; }   // wedding betel orders: more often in the first days (a player)
const c4Wx = () => (SAVE4.plan && SAVE4.plan.wx) || 'dep';
// the view: a phone shows ~430 units across with the lane in its lower part; a wide screen the whole height of the scene
function c4View() {
  const w = innerWidth || 430, h = innerHeight || 800, portrait = h > w, s = portrait ? w / 470 : Math.min(h / 600, w / 760), vh = h / s;
  return { s, vh, vw: w / s, oy: vh * (portrait ? .8 : .88) - (C4_Y0 + C4_D) };
}
// stock, price and cost of a ware; the betel stall keeps its old fields in SAVE4
const c4Own = g => g === 'trau' || !!(SAVE4.shops[g] && SAVE4.shops[g].own);
const c4Open = g => g === 'trau' ? !C4.build : c4Own(g);   // the couple can always mind a stall themselves (owner)
const c4Stock = g => g === 'trau' ? SAVE4.stock : (SAVE4.shops[g] ? SAVE4.shops[g].stock : 0);
const c4SetStock = (g, v) => { v = Math.max(0, v); if (g === 'trau') SAVE4.stock = v; else SAVE4.shops[g].stock = v; };
const c4Cap = g => g === 'trau' ? c4Lv().cap : Math.round(C4_GOODS[g].cap * c4SLv(g).cap);
const c4Cost = g => (g === 'trau' ? c4Lv().cost : C4_GOODS[g].cost) * (c4Guild() ? C4_GUILD.off : 1);   // the guild buys cheaper
const c4Price = g => g === 'trau' ? (SAVE4.cheap > 0 ? 5 : 6) : C4_GOODS[g].price;
const c4Owned = () => ['trau', ...C4_SHOPS.filter(c4Own), ...C4_BUYS.filter(c4Own)];   // (C4_BUYS: neighbours' stalls bought out, muagan.js)
const c4QX = g => g === 'trau' ? [175, 200, 225, 225, 225][SAVE4.lv] : 140;          // where the queue starts, right of a stall

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
// the morning of day C4_BOOK_DAY: the couple talk over why nobody buys, and start the book of regulars
const C4_TALK2 = [
  ['w', 'Mình ơi, mấy hôm nay ế ẩm quá, chẳng mấy ai ghé mua.'],
  ['h', 'Ừ, trầu thì héo, tiền thì hụt. Lỗ mất mấy hôm rồi.'],
  ['w', 'Em để ý, người ta chỉ quen mua ở chỗ người quen.'],
  ['h', 'Phải rồi, mình mới ra chợ, có ai biết mình là ai đâu.'],
  ['w', 'Các cụ dạy: "Buôn có bạn, bán có phường". Mình phải chịu khó làm quen.'],
  ['w', 'Khách ghé đến lần thứ hai là em hỏi han, nhớ mặt, nhớ tên, nhớ cả nhà người ta.'],
  ['h', 'Mình quý khách thì khách quý mình. Thân rồi, người ta còn rủ họ hàng, bạn bè đến mua.'],
  ['w', 'Nhưng hết hàng để khách về tay không là người ta giận lắm đấy.'],
  ['h', 'Thế từ nay mình mở sổ, ghi hết khách quen vào!'],
  ['w', 'Vâng! Hôm nay mình làm lại từ đầu, cố lên anh nhé!'],
];
function c4StoryStart(lines = C4_TALK, end = () => { SAVE4.intro = true; persist4(); c4MarketStart(); }) {
  Object.assign(C4, { phase: 'story', talk: lines, talkEnd: end, tapped: false, line: 0, lineT: 0, storyT: 0, fade: 0, walkers: [], fx: [], build: null, Q: {}, SV: {} });
  C4.camX = -c4View().vw / 2;
  $('#c4hud').hidden = true;
}
function c4StoryNext() {
  if (C4.phase !== 'story' || C4.fade > 0) return;
  AU.tap();
  if (C4.line < C4.talk.length - 1) { C4.line++; C4.lineT = 0; C4.tapped = true; }
  else C4.fade = .001;
}
function c4StoryUpdate(dt) {
  C4.storyT += dt; C4.lineT += dt;
  if (C4.fade > 0) { C4.fade += dt; if (C4.fade > 1.1) C4.talkEnd(); }
}
function c4RenderStory(g, V) {
  const cx = C4.camX, t = C4.storyT, [who, text] = C4.talk[C4.line], gy = C4_Y0 + 120;
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx + V.vw * .78, -V.oy + 110, 30, 0, 6.283); g.fill(); g.stroke();
  c4Sky(g, V, cx, 'dep');
  g.fillStyle = 'rgba(91,47,31,.16)'; g.fillRect(cx - 20, gy, V.vw + 40, V.vh);
  dp(g, WP.house, 0, gy, 0, .8, .8);
  dp(g, PROPS.chum, 230, gy, 0, .6, .6);
  const hb = who === 'h' ? Math.abs(Math.sin(t * 9)) * 3 : 0, wb = who === 'w' ? Math.abs(Math.sin(t * 9)) * 3 : 0;
  c4Mouse(g, MICE.groom, -95, 1, 0, false, who === 'h' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - hb, 1);
  c4Mouse(g, MICE.wife, 95, -1, 0, false, who === 'w' ? -.3 - Math.abs(Math.sin(t * 4)) * .5 : null, null, 1, gy - wb, 2);
  const B = c4Bubble(text, who === 'h' ? -1 : 1, 18, Math.min(280, V.vw - 70)), k = Math.min(1, C4.lineT * 6), sc = .85 + .15 * k;
  const half = B.w / 2 * sc, x = Math.max(cx + half + 8, Math.min(cx + V.vw - half - 8, who === 'h' ? -40 : 40));
  g.globalAlpha = k; dp(g, B, x, gy - 210 - B.bh, 0, sc, sc); g.globalAlpha = 1;
}

/* ---------- the day ---------- */
const c4Lv = () => C4_LV[SAVE4.lv];
function startC4() {
  trackEnter('chuong-4');
  AU.init(); AU.setSong(6); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 4; S.mode = 'c4play'; document.body.classList.add('c4');   // c4: notices go to the bottom, clear of the top bar
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  c4Sheets(null);
  SAVE4.started = true; persist4();
  if (!SAVE4.intro) { c4StoryStart(); cv.focus(); return; }
  if (c4Talk2Due()) { c4Talk2(); cv.focus(); return; }
  if (C4.day === SAVE4.day && C4.porter) { c4Resume(); return; }   // back from the chapter list the same day: carry on where it was
  c4MarketStart();
}
// coming back to a day still in memory: the same market, and whatever sheet was open (the morning order only if it was not yet given)
function c4Resume() { $('#c4hud').hidden = false; c4Sheets(C4.away || null); c4Hud(); cv.focus(); }
function c4MarketStart() {
  $('#c4hud').hidden = false;
  if (!SAVE4.plan || !SAVE4.plan.wx) { SAVE4.plan = c4Roll(SAVE4.day); SAVE4.next = c4Roll(SAVE4.day + 1); }
  Object.assign(C4, { mins: C4_OPEN, phase: 'morning', walkers: [], fx: [], build: null, drag: null, spawnT: .3, cat: null, wed: null, shut: 0, kid: null, parade: null, Q: {}, SV: {},
    today: { sold: 0, take: 0, cogs: 0, served: 0, lost: 0, wilt: 0, wiltLoss: 0, spent: 0, got: 0, wages: 0 }, chatT: 1, wife: { say: null },
    porter: { x: c4HusbX(), z: .04, st: 'idle', ph: 0, say: null, t: 0 }, vendors: [...C4_VENDORS, ...C4_VENDORS_FRONT].map(v => ({ ...v, M: typeof v.M === 'number' ? c4MouseRig(v.M) : MICE[v.M], say: null, callT: 3 + R() * 8 })) });
  for (const g of Object.keys(C4_GOODS)) { C4.Q[g] = []; C4.SV[g] = []; }
  for (const { h } of c4AllHands()) { h.say = null; h.trip = false; }   // a reload mid-trip lost the trip: the hand is back at the stall
  for (const g of C4_SHOPS) if (c4Own(g)) { const s = SAVE4.shops[g]; s.sick = false; s.say = null; }
  C4.camX = C4_STALL - c4View().vw * .5;
  c4DayLook();
  for (let i = 0; i < 8; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
  C4.day = SAVE4.day;
  // the page was reloaded during a day already under way: no new morning order, the market opens at the hour it had reached
  if (SAVE4.openDay === SAVE4.day) { C4.phase = 'open'; C4.mins = Math.max(C4_OPEN, SAVE4.openMins || C4_OPEN); c4PlanEvents(); C4.events = C4.events.filter(e => e.at > C4.mins); c4Hud(); cv.focus(); return; }
  c4Hud(); c4Morning(); cv.focus();
}
function c4Hide() { AU.ambient({}); C4.away = C4.sheet; $('#c4hud').hidden = true; c4Sheets(null); document.body.classList.remove('c4'); }
// one sheet at a time: morning plan, stall, event, notebook, tally
function c4Sheets(id) { for (const s of ['c4am', 'c4up', 'c4ev', 'c4note', 'c4day', 'c4home', 'c4shop']) $('#' + s).hidden = s !== id; C4.paused = !!id && id !== 'c4day'; C4.sheet = id; }
const c4Say = (who, text, life = 1.6 + text.length * .045) => { who.say = { text, t: 0, life }; };
// how many come to the market: weather, a fair, the cat sitting there, the headman's favour, luck, cụ Đồ's scroll, a fire
const c4Flow = () => ({ dep: 1, gat: .85, ret: .8 }[c4Wx()] || (SAVE4.plan.rk || .3)) * (SAVE4.plan.hoi ? (SAVE4.plan.hk || 1.7) : 1) * (SAVE4.plan.cuoi ? (SAVE4.plan.ck || 1.7) : 1) * (C4.cat && C4.cat.st === 'sit' ? .2 : 1) * (SAVE4.favor > 0 ? 1.15 : 1) * (SAVE4.phuc ? 1.08 : 1) * (SAVE4.cauDoi ? 1.06 : 1) * (C4.fire > 0 ? .1 : 1) * (1 + .04 * (SAVE4.perk || 0)) * (SAVE4.loc === SAVE4.day ? 1.25 : 1);   // a streak's market luck
// how much a passer-by wants a ware now
function c4Want(g) {
  const G = C4_GOODS[g], h = c4Hour(C4.mins), lv = c4Lv();
  if (!c4Own(g)) return 0;
  const base = g === 'trau' ? lv.buy * (.7 + (C4_BUSY[h] || .3) * .4) * (SAVE4.rival > 0 && SAVE4.cheap <= 0 ? .45 : 1) : .28 * (G.hours[h] || 0) * c4SLv(g).want * (1 + .12 * c4Tables(g));
  return base * (G.wx[c4Wx()] || 1);
}
function c4Spawn(atX, guest = null) {
  // a resident of the village (dan.js), or now and then a child (nameless, never buys); or an invited guest
  const kid = !guest && R() < .13, P = guest ? guest.p : kid ? null : c4PickResident(); if (!kid && !P) return;
  const kind = kid ? 'mouse' : P.kind, sort = kid ? 11 + ((R() * 3) | 0) : P.sort, role = kid ? 'child' : P.role;
  const fromRight = atX === undefined ? R() < .6 : R() < .5;
  let x = atX !== undefined ? atX : fromRight ? C4.camX + c4View().vw + 120 + R() * 200 : C4_GATE - 40;
  const sp = { mouse: role === 'old' ? 34 + R() * 10 : role === 'child' ? 80 + R() * 30 : 55 + R() * 40, duck: 40, rooster: 65, dog: 105, toad: 50 }[kind];
  // what (if anything) they come to buy
  let shop = null;
  if (guest) shop = guest.shop;
  else if (!(kind === 'mouse' && role === 'child') && C4.phase === 'open') {
    const wants = c4Owned().map(g => [g, c4Want(g) * .56 * (P && P.fav === g ? 1.8 : 1)]), sum = wants.reduce((a, [, w]) => a + w, 0);
    if (R() < Math.min(.9, sum * c4Keen(P))) { let k = R() * sum; for (const [g, w] of wants) { if ((k -= w) <= 0) { shop = g; break; } } }
  }
  // what they bring: a buffalo to lead (then they are only passing, on the way to the fields), an umbrella in the rain, too much wine
  const look = kid ? {} : P.look || {}, buf = !guest && look.tool === 'buf' && R() < .7 && C4.walkers.filter(q => q.buf).length < 2, drunk = !guest && !!look.drinker && C4.mins > 11 * 60 && R() < .3;
  if (guest) x = C4_GOODS[shop].x + c4QX(shop) + (fromRight ? 1 : -1) * (c4View().vw * .6 + 40);   // off screen, heading for their stall
  const smokeX = !guest && look.tool === 'dieu' ? C4.camX + c4View().vw * (.15 + R() * .7) : undefined;
  if (buf || smokeX !== undefined) shop = null;
  if (shop && fromRight && atX === undefined) x = Math.max(x, C4_GOODS[shop].x + 260);         // buyers come from a side that takes them past their stall
  C4.walkers.push({ kind, sort, M: kind === 'mouse' ? c4MouseRig(sort) : null, seed: R() * 6, name: kid ? c4Pick(C4_NAMES.child) : P.name, pid: kid ? undefined : P.id, look: look.tool === 'buf' && !buf ? { ...look, tool: null } : look, buf, smokeX, drunk, umb: look.tool === 'o' || R() < .4, x, z: .38 + R() * .6, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1, guest: !!guest, sp: guest ? 120 : buf ? 38 : drunk ? sp * .6 : sp, ph: R() * 6,
    buy: !!shop, shop, st: 'walk', n: guest ? 3 + ((R() * 4) | 0) : c4BuyN(P), carry: null, cd: 3 + R() * 6, say: null });
  if (kind === 'mouse' && role === 'child' && atX === undefined && R() < .5) {             // a gang of children chasing each other
    const lead = C4.walkers[C4.walkers.length - 1]; lead.sp = 150; lead.cd = 99;
    for (let i = 1; i <= 1 + ((R() * 2) | 0); i++) { const s2 = 11 + ((R() * 3) | 0); C4.walkers.push({ ...lead, pid: undefined, sort: s2, M: c4MouseRig(s2), seed: R() * 6, name: c4Pick(C4_NAMES.child), x: lead.x - lead.face * 60 * i, z: Math.min(.98, lead.z + (R() - .5) * .2), ph: R() * 6, say: null }); }
    if (R() < .5) c4Say(lead, c4Pick(['Đuổi được tao đi!', 'Ú oà!', 'Chạy nhanh lên!']));
  }
}

/* ---------- the morning: weather, news, how much of each ware to buy ---------- */
function c4Morning() {
  const p = SAVE4.plan, heard = SAVE4.notes.filter(n => n.day === SAVE4.day);
  const back = [];
  SAVE4.owed = SAVE4.owed.filter(o => { if (o.due > SAVE4.day) return true; if (o.ok) { SAVE4.money += o.back; back.push(`${o.name} trả ${c4Money(o.back)}.`); } else { back.push(`${o.name} khất mãi không trả.`); SAVE4.badLoan = { name: o.name, amt: o.back }; } return false; });
  c4FloodMorning(back);
  if (c4Guild() && SAVE4.day % 5 === 0 && SAVE4.duesDay !== SAVE4.day) { SAVE4.duesDay = SAVE4.day; SAVE4.money -= C4_GUILD.dues; back.push(`Góp quỹ phường ${C4_GUILD.dues} đồng.`); }
  SAVE4.debtDays = SAVE4.debt >= C4_BROKE ? (SAVE4.debtDays || 0) + 1 : 0;
  if (SAVE4.debtDays >= C4_BROKE_DAYS) { c4Bankrupt(); return; }
  // loans falling due: paid if the purse allows, else they grow (a neighbour cools, cụ Lý adds a penalty)
  SAVE4.loans = SAVE4.loans || [];
  for (const L of SAVE4.loans) if (L.due <= SAVE4.day && L.owe > 0) {
    if (SAVE4.money >= L.owe) { SAVE4.money -= L.owe; back.push(`Đã trả ${L.name} ${c4Money(L.owe)}.`); L.owe = 0; continue; }
    L.late = (L.late || 0) + 1;
    if (L.from === 'xom') { L.owe += C4_LOANS.xom.late; if (L.pid !== undefined && c4Known(L.pid)) c4Bump(L.pid, -10); }
    else L.owe = Math.round(L.owe * (1 + C4_LOANS.ly.late));
    if (L.late > C4_LOANS[L.from].max && L.from === 'ly') { c4Bankrupt(`Nợ cụ Lý ${c4Money(L.owe)} quá hạn mãi không trả. Cụ Lý sai tuần đinh đến tịch thu hết gánh hàng.`); return; }
  }
  SAVE4.loans = SAVE4.loans.filter(L => L.owe > 0);
  const warn = SAVE4.debtDays ? `<p class="bad">Lái buôn đến đòi nợ ${c4Money(SAVE4.debt)}. Còn ${C4_BROKE_DAYS - SAVE4.debtDays} buổi sáng nữa mà chưa trả bớt xuống dưới ${C4_BROKE} đồng là vỡ nợ!</p>` : '';
  const dues = c4Tax();
  $('#c4amT').textContent = `Sáng ngày ${SAVE4.day}`;
  $('#c4amB').innerHTML = `<p class="wx">${C4_WXI[p.wx]} ${C4_WX[p.wx]}${p.hoi ? ' <b>Làng mở hội, chợ đông!</b>' : ''}</p>`
    + (SAVE4.goal ? '' : `<p class="goal">Mục tiêu: để dành <b>${c4Money(C4_GOAL)}</b> · còn thiếu ${c4Money(Math.max(0, C4_GOAL - c4Net()))}</p>`)
    + warn + '<div id="c4loan"></div>' + (back.length ? `<p class="back">${back.join(' ')}</p>` : '')
    + (p.thue ? `<p>Hôm nay cụ Lý đi thu tiền chợ (${dues} đồng).</p>` : SAVE4.next && SAVE4.next.thue ? `<p>Mai cụ Lý đi thu tiền chợ, nhớ để dành ${dues} đồng.</p>` : '')
    + (SAVE4.rival > 0 ? '<p class="bad">Gánh trầu đối diện vẫn bán rẻ, khách bị kéo sang bên ấy.</p>' : '')
    + (heard.length ? `<div class="heard"><b>Hôm qua nghe được:</b>${heard.map(n => `<p>• ${n.text}</p>`).join('')}</div>` : '')
    + '<div id="c4biz"></div>';
  c4BizRefresh();
  // one stepper per ware the couple sells
  const box = $('#c4amO'); box.innerHTML = '';
  const orders = {};
  for (const g of c4Owned()) {
    const G = C4_GOODS[g], row = document.createElement('div'); row.className = 'ware';
    const closed = g !== 'trau' && !c4Open(g);
    row.innerHTML = `<h5>${G.name}${g !== 'trau' && G.keep === 'ever' ? ` · còn ${c4Stock(g)} ${G.unit}` : ''}${g === 'che' ? ' · tốn củi ' + G.fuel + ' đồng' : ''}${g === 'xoi' ? ' · thiu lúc 12:00 (giờ Ngọ)' : ''}${closed ? ' · <span class="bad">không ai trông</span>' : ''}</h5><div class="ord"></div>`;
    box.appendChild(row);
    if (closed) { orders[g] = 0; row.querySelector('.ord').innerHTML = ''; continue; }
    c4Stepper(row.querySelector('.ord'), g, q => { orders[g] = q; c4AmTotal(orders); });
  }
  const tot = document.createElement('div'); tot.className = 'tot'; box.appendChild(tot);
  const go = document.createElement('button'); go.className = 'btn go'; go.textContent = 'Họp chợ'; box.appendChild(go);
  C4.orders = orders; c4LoanUI();
  go.addEventListener('click', () => {
    for (const [g, q] of Object.entries(orders)) { if (q) c4Receive(g, q, c4Cost(g), 'sang'); if (g === 'che' && q) { SAVE4.money -= C4_GOODS.che.fuel; C4.today.spent += C4_GOODS.che.fuel; } }
    c4Sheets(null); C4.phase = 'open'; c4PlanEvents(); c4ShipOrders(); c4Hud();
    SAVE4.openDay = SAVE4.day; SAVE4.openMins = C4.mins; persist4();   // the day is under way (a reload carries on, see c4MarketStart)
  });
  c4AmTotal(orders);
  c4Sheets('c4am');
}
// the money box on the morning sheet: what is owed, borrow, pay back
// (in the evening, on the tally: pay back only — the player decides when and how much; nothing is taken during the day)
function c4LoanUI(evening = C4.phase === 'night') {
  const el = $(evening ? '#c4loanN' : '#c4loan'); if (!el) return;
  const L = SAVE4.loans || [], has = k => L.some(x => x.from === k), day = SAVE4.day;
  const nb = c4Lender();
  let h = L.map((x, i) => `<div class="loan ${x.due <= day ? 'bad' : ''}"><span>Nợ ${x.name} <b>${c4Money(x.owe)}</b> · ${x.due > day ? 'hạn ngày ' + x.due : 'quá hạn ' + x.late + ' buổi'}</span><button class="btn alt" data-pay="${i}" ${SAVE4.money >= x.owe ? '' : 'disabled'}>Trả</button></div>`).join('');
  if (SAVE4.debt > .5) h = `<div class="loan"><span>Nợ lái buôn <b>${c4Money(SAVE4.debt)}</b></span><span class="pays"><button class="btn alt" data-trader="20" ${SAVE4.money >= 1 ? '' : 'disabled'}>Trả 20</button><button class="btn alt" data-trader="all" ${SAVE4.money >= 1 ? '' : 'disabled'}>Trả hết</button></span></div>` + h;
  const X = C4_LOANS.xom, Y = C4_LOANS.ly;
  if (evening) { el.innerHTML = h ? `<div class="money"><h4>Trả nợ · trong túi ${c4Money(SAVE4.money)}</h4>${h}</div>` : ''; c4LoanWire(el, L); return; }
  h += `<div class="row col borrow"><button class="btn alt" data-loan="xom" ${has('xom') ? 'disabled' : ''}>Vay ${nb.name} ${c4Money(X.amt)} · lãi ${X.rate * 100}%, ${X.days} ngày trả</button>`
    + `<button class="btn alt" data-loan="ly" ${has('ly') ? 'disabled' : ''}>Vay cụ Lý ${c4Money(Y.amt)} · lãi ${Y.rate * 100}%, ${Y.days} ngày trả</button></div>`;
  el.innerHTML = `<div class="money"><h4>Tiền nong · trong túi ${c4Money(SAVE4.money)}</h4>${h}</div>`;
  el.querySelectorAll('[data-loan]').forEach(b => b.addEventListener('click', () => c4Borrow(b.dataset.loan)));
  c4LoanWire(el, L);
}
function c4LoanWire(el, L) {
  el.querySelectorAll('[data-trader]').forEach(b => b.addEventListener('click', () => { const p = Math.min(SAVE4.money, SAVE4.debt, b.dataset.trader === 'all' ? 1e9 : 20); SAVE4.money -= p; SAVE4.debt -= p; AU.pluck(80); c4AfterMoney(); }));
  el.querySelectorAll('[data-pay]').forEach(b => b.addEventListener('click', () => { const x = L[+b.dataset.pay]; if (SAVE4.money < x.owe) return; SAVE4.money -= x.owe; x.owe = 0; SAVE4.loans = L.filter(y => y.owe > 0); AU.pluck(80); c4AfterMoney(); }));
}
// who next door would lend: the neighbour who likes the stall best, else an older neighbour
function c4Lender() {
  const P = c4People(), kn = P.list.filter(p => c4Known(p.id) && p.kind === 'mouse').sort((a, b) => c4Like(b.id) - c4Like(a.id));
  return kn[0] && c4Like(kn[0].id) >= 35 ? kn[0] : (P.list.find(p => p.role === 'old' && p.kind === 'mouse') || { name: 'bà hàng xóm' });
}
function c4Borrow(k) {
  const C = C4_LOANS[k], nb = k === 'xom' ? c4Lender() : null;
  SAVE4.loans = SAVE4.loans || [];
  SAVE4.loans.push({ from: k, name: k === 'xom' ? nb.name : 'cụ Lý', pid: nb && nb.id, amt: C.amt, owe: Math.round(C.amt * (1 + C.rate)), due: SAVE4.day + C.days, late: 0 });
  SAVE4.money += C.amt; AU.pluck(88);
  toast(k === 'xom' ? `${c4Cap1(nb.name)} cho vay ${c4Money(C.amt)}, hẹn ${C.days} ngày trả.` : `Cụ Lý vuốt râu: "Vay thì được, nhưng ${C.days} ngày nữa phải trả ${c4Money(Math.round(C.amt * (1 + C.rate)))}!"`, 3.4);
  c4AfterMoney();
}
function c4AfterMoney() { persist4(); c4Hud(); c4LoanUI(); if (C4.orders) c4AmTotal(C4.orders); }
function c4AmTotal(orders) {
  const el = $('#c4amO .tot'); if (!el) return;
  const sum = Object.entries(orders).reduce((a, [g, q]) => a + q * c4Cost(g) + (g === 'che' && q ? C4_GOODS.che.fuel : 0), 0);
  // only the part bought on credit counts against the trader's limit (a player owed 304 of 300 and could not even open
  // the market with nothing ordered): with no new credit the market always opens, and the sheet says what to do
  const credit = Math.max(0, sum - SAVE4.money), over = credit > 0 && SAVE4.debt + credit > C4_DEBT, room = Math.max(0, C4_DEBT - SAVE4.debt);
  el.innerHTML = `Tổng tiền hàng: <b>${c4Money(sum)}</b>${credit ? ` · mua chịu ${c4Money(credit)}` : ''}${over ? ' · <span class="bad">quá hạn mức nợ!</span>' : ''}`
    + (over || (SAVE4.money < c4Cost('trau') * 5 && !room) ? `<p class="bad">Lái buôn chỉ cho chịu tối đa ${c4Money(C4_DEBT)}${SAVE4.debt ? `, nhà mình đã nợ ${c4Money(SAVE4.debt)}` : ''}${room ? ` (còn chịu được ${c4Money(room)})` : ''}. Muốn nhập thêm thì trả bớt nợ lái buôn hoặc vay tiền ở ô Tiền nong phía trên rồi mua bằng tiền mặt. Không nhập gì vẫn họp chợ được.</p>` : '');
  const go = $('#c4amO .go'); if (go) go.disabled = over;
}
// a stepper for one ware: how many, what it costs
// goods fetched during the day cost more than the morning's (the trader's best is gone, the husband walks twice)
const c4CostMid = g => c4Cost(g) + (g === 'trau' ? 1 : Math.max(1, Math.round(c4Cost(g) * .5)));
function c4Stepper(box, g, on, mid = false) {
  const G = C4_GOODS[g], max = c4Cap(g) - c4Stock(g), step = max > 40 ? 10 : 5, cost = mid ? c4CostMid(g) : c4Cost(g); let q = 0;
  box.innerHTML = `<div class="step"><button class="btn alt" data-d="-${step}">−${step}</button><b class="q"></b><button class="btn alt" data-d="${step}">+${step}</button></div><p class="cost"></p>`;
  const show = () => { q = Math.max(0, Math.min(q, max)); box.querySelector('.q').textContent = `${q} ${G.unit}`; const r1 = v => Math.round(v * 10) / 10, coin = ' đồng'; box.querySelector('.cost').innerHTML = `${r1(cost)}${coin}/${G.unit}${mid ? ` (sáng sớm ${r1(c4Cost(g))})` : ''} · bán ${c4Price(g)}${coin}`; on(q); };
  box.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { q += +b.dataset.d; AU.tap(); show(); }));
  show();
}
// the goods arrive: paid from the purse, the rest on credit with the trader
// today's orders, for the book's Đơn hàng tab (owner): each is { src, g, q, cost, who? }; the list restarts each day
function c4LogAdd(item) {
  if (!SAVE4.log || SAVE4.log.day !== SAVE4.day) SAVE4.log = { day: SAVE4.day, items: [] };
  SAVE4.log.items.push(item);
}
function c4Receive(g, q, cost, src = 'giua') {
  if (!q) return;
  c4LogAdd({ src, g, q, cost: Math.round(q * cost) }); persist4();
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
  const pool = ['vay', 'chiu', 'boi', 'trom', 'ho', 'cau', 'tuan', 'xin', 'trong', 'sau', 'linh', 'gio', 'lua', 'rival', 'tangtien', ...c4ExtraPool(own)];
  if (!SAVE4.cauDoi) pool.push('do');
  if (own.includes('che') || own.includes('xoi') || own.includes('bun')) pool.push('do2', 'do2');
  if (own.length > 1) pool.push('om', 'bot', 'om');
  if (SAVE4.money >= C4_RICH) { pool.push('kien'); if (own.some(g => c4HandsOn(g).length)) pool.push('trom_ngay'); }   // a rich purse is worth robbing and suing (owner)
  for (let i = 0; i < 3 && pool.length; i++) ev.push({ at: at(7, 16.5), kind: pool.splice((R() * pool.length) | 0, 1)[0] });
  if (SAVE4.day >= 2) for (let i = 0, n = R() < .5 ? 1 : 2; i < n; i++) ev.push({ at: at(8, 16), kind: 'hao' });
  if (SAVE4.day <= 5) {                                                     // a player: the first days were too quiet — a knock (thief, gale, bad areca) and often an order
    ev.push({ at: at(8, 15.5), kind: c4Pick(['trom', 'gio', 'trom', 'sau']) });
    if (R() < .55) ev.push({ at: at(7, 10.5), kind: 'cotiec' });
  }   // Hảo cảm: one or two verdicts a day (haocam.js)
  if (p.cuoi || R() < .2) C4.parade = { at: at(9, 11), x: null };       // a wedding procession goes through the market
  c4HandPlan(ev);
  C4.events = ev.sort((a, b) => a.at - b.at); C4.evRepl = 0;
  SAVE4.taskDay = null; c4Tasks(); c4NvInit();                                         // today's tasks, now that today's happenings are known
}
// how many a buyer takes: one to three; a regular twice that, a hard-won regular three times
const c4BuyN = P => { const n = C4_BUY0 + ((R() * 3) | 0); return P && c4Ruot(P.id) ? n * (C4_TRAITS[P.trait].ruot || 2) : n; };
// a hired hand is let go, and his sales in progress are dropped
const c4DropHand = (g, s) => { const H = c4Hands(g); H.splice(H.indexOf(s), 1); for (const k in C4.SV) { const A = C4.SV[k]; if (A) for (const sv of [...A]) if (sv.by === s) A.splice(A.indexOf(sv), 1); } persist4(); };
const c4Someone = () => c4Pick([...C4.walkers.filter(w => w.kind === 'mouse' && C4_MOUSE_SORTS[w.sort].role !== 'child').map(w => w.name), 'bà Ba', 'chú Năm', 'cô Tư']);
const c4Cap1 = s => s[0].toUpperCase() + s.slice(1);
function c4Event(kind) {
  const who = C4.evWho || c4Someone(), E = { kind, title: '', text: '', opts: [] }, sp = n => { SAVE4.money -= n; C4.today.spent += n; }, own = c4Owned();
  const helped = own.filter(g => c4HandsOn(g).length);
  if (kind === 'meo' && (!C4.cat || C4.cat.st !== 'ask')) { AU.meow(); C4.cat = { t: 0, st: 'roof' }; return; }   // first it shows itself on the roof
  if (kind === 'meo') {
    const catFee = 20 * Math.max(1, own.length);                              // a fee for every stall (owner)
    Object.assign(E, { title: 'Mèo đến!', text: 'Con mèo khoang to sụ nhảy phốc xuống trước gánh, vểnh râu đòi lễ.', opts: [
      [`Dâng con cá · ${c4Money(catFee)}`, () => { sp(catFee); C4.cat.st = 'fed'; C4.cat.t = 0; toast('Mèo ngoạm cá, nhảy tót lên mái nhà đi mất.', 3); }, SAVE4.money >= catFee],
      ['Không dâng', () => { C4.cat.st = 'sit'; C4.cat.t = 0; toast('Mèo ngồi chễm chệ trước gánh suốt một canh giờ (khoảng 2 tiếng). Khách sợ, chẳng ai dám ghé!', 3.4); }]] });
  } else if (kind === 'thue') {
    const d = c4Tax(), earn = c4Earned();
    Object.assign(E, { title: 'Cụ Lý thu thuế chợ', text: `Cụ Lý chống gậy đến, giở sổ: "Năm phiên qua nhà ${own.length > 1 ? 'có ' + own.length + ' hàng' : 'gánh trầu'} lãi ${c4Money(earn)}. Thuế luỹ tiến: ba trăm đồng đầu năm phần trăm, đến hai quan mười phần trăm, trên nữa mười lăm phần trăm, cộng tiền chỗ: ${d} đồng!"`, opts: [
      [`Nộp ${d} đồng`, () => { sp(d); toast('Cụ Lý gật gù, ghi vào sổ.'); }, SAVE4.money >= d],
      [`Biếu thêm · ${d + 10} đồng`, () => { sp(d + 10); SAVE4.favor = 2; toast('Cụ Lý cười tít mắt, dặn tuần đinh để gánh nhà mình chỗ đẹp. Khách ghé đông hơn hai ngày tới.', 4); }, SAVE4.money >= d + 10],
      ['Xin khất', () => { if (R() < .55) { SAVE4.dues = d; toast('Cụ Lý cho khất đến sáng mai.', 3); } else { sp(Math.min(Math.max(0, SAVE4.money), d * 2)); toast(`Cụ Lý nổi giận, phạt gấp đôi!`, 3); } }]] });
  } else if (kind === 'khat') {
    Object.assign(E, { title: 'Cụ Lý đến lấy tiền khất', text: `Cụ Lý đến lấy món tiền chợ khất hôm qua: ${SAVE4.dues} đồng.`, opts: [
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
    Object.assign(E, { title: 'Nhà có cưới', text: `Nhà ${who} cưới con, đặt ${n} miếng trầu têm cánh phượng, trả 9 đồng một miếng. Nhà trai đến lấy lúc nào đó trong ${c4Span('Thân')}.`, opts: [
      ['Nhận', () => { C4.wed = { n, who, at: 15 * 60 + R() * 110 }; toast(`Nhớ để dành đủ trầu, nhà trai đến lấy trong ${c4Span('Thân')}!`, 3.4); }],
      ['Không nhận', () => {}]] });
  } else if (kind === 'boi') {
    Object.assign(E, { title: 'Thầy bói', text: 'Ông thầy bói chống gậy ghé gánh: "Gieo một quẻ, biết ngày mai lành dữ, chỉ năm đồng! Bói vui thì một đồng thôi!"', opts: [
      ['Xem quẻ · 5 đồng', () => { sp(5); const n = SAVE4.next, got = Object.keys(C4_NOTE).filter(k => k === 'mua' ? n.wx === 'mua' : n[k]);
        if (n.wx === 'ret') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'ret', text: 'Thầy bói phán: mai trời rét căm căm.' });
        if (n.wx === 'gat') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'gat', text: 'Thầy bói phán: mai nắng gắt như đổ lửa.' });
        for (const k of got) if (!SAVE4.notes.some(x => x.day === SAVE4.day + 1 && x.kind === k)) SAVE4.notes.push({ day: SAVE4.day + 1, kind: k, text: 'Thầy bói phán: ' + C4_NOTE[k].replace('Nghe nói ', '').replace('Nghe đồn ', '') });
        if (!got.length && n.wx === 'dep') SAVE4.notes.push({ day: SAVE4.day + 1, kind: 'yen', text: 'Thầy bói phán: mai trời đẹp, bình yên vô sự.' });
        C4.noteNew = true; toast(`Thầy bói bấm đốt tay: "${c4Pick(C4_BOI)}" (đã ghi lời phán ngày mai vào sổ tay)`, 5); }, SAVE4.money >= 5],
      ['Bói vui · 1 đồng', () => { sp(1); toast(`Thầy bói phán: "${c4Pick(C4_BOI)}"`, 4.6); }, SAVE4.money >= 1],
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
      [`Mua · ${n * 2} đồng`, () => { c4Receive('trau', n, 2, 'vat'); if (R() < .35) { const bad = Math.ceil(n * .6); SAVE4.stock -= bad; setTimeout(() => toast(`Hớ rồi! Cau rẻ mà sâu, phải bỏ ${bad} miếng.`, 3.2), 400); } else toast(`Mua được ${n} miếng giá hời!`); }, SAVE4.money >= n * 2],
      ['Không mua', () => {}]] });
  } else if (kind === 'tuan') {
    E.def = 0; Object.assign(E, { title: 'Tuần đinh dẹp lối', text: 'Tuần đinh cầm gậy đi dẹp lối: "Gánh nào lấn đường thì dẹp vào một canh giờ (khoảng 2 tiếng)!"', opts: [
      ['Dẹp vào', () => { C4.shut = 30; for (const g of own) for (const w of [...C4.Q[g]]) c4Leave(w, false); toast('Phải dẹp gánh vào một canh giờ (khoảng 2 tiếng).', 2.6); }],
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
      ['Trông hộ (được biếu ít tiền, nhưng trẻ con hay nghịch)', () => { C4.kid = { t: 0, who, spill: R() < .45 ? 8 + R() * 25 : 99 }; toast('Thằng cu ngồi ngoan bên gánh… được một lúc.'); }],
      ['Bận lắm', () => {}]] });
  } else if (kind === 'sau') {                                              // the trader's areca was rotten inside
    const n = Math.floor(SAVE4.stock * (.2 + R() * .2)); if (n < 3) return;
    SAVE4.stock -= n; AU.snort();
    E.def = 0; Object.assign(E, { title: 'Cau sâu!', text: `Bổ ra mới thấy ${n} quả cau sâu ruỗng. Lái buôn bán hàng xấu!`, opts: [
      ['Đành bỏ đi', () => {}],
      ['Đòi lái buôn bù', () => { if (R() < .4) { SAVE4.debt = Math.max(0, SAVE4.debt - n * c4Cost('trau')); toast('Lái buôn ngượng, trừ tiền vào nợ.', 3); } else toast('Lái buôn chối đây đẩy: "Hàng ra khỏi đò là hết trách nhiệm!"', 3.2); }]] });
  } else if (kind === 'do2') {                                              // a dog knocks the tea pot / rice basket / soup over
    const g = c4Pick(own.filter(x => ['che', 'xoi', 'bun'].includes(x) && c4Stock(x) > 4)); if (!g) return;
    const n = Math.ceil(c4Stock(g) * (.4 + R() * .3)); c4SetStock(g, c4Stock(g) - n); AU.bark();
    const what = { che: 'nồi chè', xoi: 'thúng xôi', bun: 'nồi bún' }[g];
    E.def = 0; Object.assign(E, { title: 'Chó húc đổ!', text: `Con Vện đuổi gà, lao sầm vào ${what}! Đổ mất ${n} ${C4_GOODS[g].unit}.`, opts: [
      ['Mắng con Vện', () => toast('Con Vện cụp đuôi chạy mất.')],
      ['Bắt chủ nó đền', () => { if (R() < .45) { const pay = n * C4_GOODS[g].cost; SAVE4.money += pay; C4.today.got += pay; toast(`Chủ con Vện xin lỗi, đền ${c4Money(pay)}.`, 3); } else toast('Chủ con Vện cãi lấy được, chẳng đền đồng nào.', 3); }]] });
  } else if (kind === 'om') {                                               // a helper is ill
    const g = c4Pick(helped); if (!g) return;
    const s = c4Pick(c4HandsOn(g));
    E.def = 0; Object.assign(E, { title: 'Người phụ ốm', text: `${c4Cap1(s.name)} bán ${C4_GOODS[g].name.toLowerCase()} lên cơn sốt, xin nghỉ về nhà. Hôm nay hàng ${C4_GOODS[g].name.toLowerCase()} thiếu một người bán.`, opts: [
      ['Cho nghỉ, vẫn trả công', () => { s.sick = true; }],
      ['Trừ công hôm nay', () => { s.sick = true; s.nowage = true; if (R() < .4) { s.quit = true; toast(`${c4Cap1(s.name)} giận, mai không làm nữa!`, 3); } }]] });
  } else if (kind === 'bot') {                                              // a helper skims off the takings
    const g = c4Pick(helped); if (!g) return;
    const s = c4Pick(c4HandsOn(g)), n = c4Loss(.02, .06, 10); sp(n);
    Object.assign(E, { title: 'Hụt tiền', text: `Đếm tiền hàng ${C4_GOODS[g].name.toLowerCase()} thấy hụt ${n} đồng. Hình như ${s.name} bớt xén.`, opts: [
      ['Đuổi việc', () => { const H = c4Hands(g); H.splice(H.indexOf(s), 1); for (const k in C4.SV) { const A = C4.SV[k]; if (A) for (const sv of [...A]) if (sv.by === s) A.splice(A.indexOf(sv), 1); } toast(`${c4Cap1(s.name)} bị đuổi. Vợ chồng lại phải tự bán, hoặc thuê người khác.`, 3); }],
      ['Bỏ qua lần này', () => {}]] });
  } else if (kind === 'trom_ngay') {                                       // a hired hand runs off with the day's takings (only when rich)
    if (SAVE4.money < C4_RICH || !helped.length) return;
    const g = c4Pick(helped), s = c4Pick(c4HandsOn(g)), take = Math.min(Math.max(0, C4.today.take), SAVE4.money);
    if (take <= 0) return;
    Object.assign(E, { title: 'Người làm bỏ trốn!', text: `${c4Cap1(s.name)} ôm theo ${c4Money(take)} tiền bán hàng hôm nay rồi biến mất tăm. Làm sao đây?`, opts: [
      ['Báo quan', () => { c4DropHand(g, s); sp(take); const fee = Math.min(SAVE4.money, Math.round(take * .2)); sp(fee); if (R() < .1) { SAVE4.money += take; C4.today.spent -= take; toast(`Quan sai lính lùng được ${s.name} ở bến đò, thu lại được tiền. Phí quan ${c4Money(fee)}.`, 3.8); } else toast(`Quan sai lính đi lùng mãi không thấy. Mất ${c4Money(take)}, còn trả phí quan ${c4Money(fee)}.`, 3.8); c4Hud(); }],
      ['Thôi, bỏ của đi thay người', () => { c4DropHand(g, s); sp(take); toast(`Mất ${c4Money(take)} và ${s.name} đi luôn.`, 3); }]] });
  } else if (kind === 'kien') {                                             // a customer ill from the food sues before cụ Lý (only when rich)
    if (SAVE4.money < C4_RICH) return;
    const g = c4Pick(own.filter(x => ['che', 'xoi', 'bun', 'trau'].includes(x))); if (!g) return;
    const amt = Math.min(SAVE4.money, Math.round(SAVE4.money * .2 + 200)), plaintiff = c4Someone();
    Object.assign(E, { title: 'Kiện ngộ độc', text: `${c4Cap1(plaintiff)} ăn ${C4_GOODS[g].name.toLowerCase()} ở gánh rồi đau bụng nằm bẹp, kiện lên cụ Lý đòi bồi thường ${c4Money(amt)}.`, opts: [
      ['Cãi đến cùng', () => { if (R() < .4) toast('Cụ Lý xét: khách ăn no quá, chẳng phải lỗi của gánh. Kiện bị bác.', 3.4); else { const n = Math.min(SAVE4.money, Math.round(amt * 1.5)); sp(n); toast(`Cụ Lý phạt vì cãi cùn: phải đền ${c4Money(n)}.`, 3.4); } }],
      ['Hoà giải, đền nửa', () => { const n = Math.min(SAVE4.money, Math.round(amt / 2)); sp(n); toast(`${c4Cap1(plaintiff)} nhận ${c4Money(n)} rồi bỏ kiện. Cả chợ bàn tán mãi.`, 3.4); }],
      ['Đền đủ, xin lỗi', () => { const n = Math.min(SAVE4.money, amt); sp(n); toast(`Đền ${c4Money(n)}, ${plaintiff} nguôi giận. Từ nay nhớ giữ vệ sinh.`, 3.4); }]] });
  } else if (kind === 'tangtien') {                                         // the landlord of a rented house asks for 10 % more on the rent (owner)
    const ok = c4RentPlots().filter(g => c4AskDay(g) == null || SAVE4.day - c4AskDay(g) >= 7);
    if (!ok.length) return;
    const g = c4Pick(ok), now = c4RentOf(g), next = Math.round(now * 1.1), name = g === 'trau' ? 'trầu' : C4_GOODS[g].name.toLowerCase(), who = c4Landlord(g).p.name;
    Object.assign(E, { title: 'Chủ nhà đòi tăng tiền', text: `${c4Cap1(who)}, chủ căn nhà bán ${name}, đòi tăng tiền thuê: từ ${c4Money(now)} lên ${c4Money(next)} mỗi tối.`, opts: [
      ['Mặc cả', () => { c4SetAsk(g); if (R() < .5) { c4RaiseRent(g); toast(`${who} chỉ bớt đôi chút, tiền thuê vẫn lên ${c4Money(c4RentOf(g))} mỗi tối.`, 3.6); } else toast(`${who} nghĩ lại, giữ nguyên giá thuê.`, 3); }],
      ['Đồng ý tăng', () => { c4SetAsk(g); c4RaiseRent(g); toast(`Từ nay tiền thuê nhà bán ${name} là ${c4Money(c4RentOf(g))} mỗi tối.`, 3.4); }]] });
  } else if (kind === 'tangluong' || kind === 'hanghi') {                  // a hand asks for a raise, or gives notice (owner)
    const { g, h } = C4.evArg?.hand || {}; if (!h || !c4Hands(g).includes(h)) return;
    const w = c4Wage(g, h), inc = Math.max(10, Math.round(w * .2)), nm = c4Cap1(h.name), job = C4_GOODS[g].name.toLowerCase();
    if (kind === 'tangluong') {
      h.askDay = SAVE4.day;
      Object.assign(E, { title: 'Người làm đòi tăng công', text: `${nm} (${job}) thấy công ${c4Money(w)} mỗi ngày còn thấp, đòi tăng thêm. Quan hệ: ${h.rel}/100.`, opts: [
        [`Tăng ${c4Money(inc)} mỗi ngày`, () => { h.wageUp = (h.wageUp || 0) + inc; c4HandRel(h, 6); toast(`${nm} mừng, công giờ là ${c4Money(c4Wage(g, h))} mỗi ngày.`, 3.2); }],
        ['Từ chối', () => { c4HandRel(h, -12); toast(h.rel <= 20 ? `${nm} bực lắm, coi chừng có chuyện.` : `${nm} buồn, không nói thêm gì.`, 3.2); }]] });
    } else {
      Object.assign(E, { title: 'Người làm xin nghỉ', text: `${nm} (${job}) xin nghỉ việc: thấy chủ bạc, quan hệ chỉ còn ${h.rel}/100. Giữ lại hay cho nghỉ?`, opts: [
        [`Tăng ${c4Money(inc)} mỗi ngày để giữ`, () => { h.wageUp = (h.wageUp || 0) + inc; c4HandRel(h, 15); toast(`${nm} ở lại, công giờ là ${c4Money(c4Wage(g, h))} mỗi ngày.`, 3.2); }],
        ['Cho nghỉ, tuyển người khác', () => { c4DropHand(g, h); toast(`${nm} nghỉ việc. Muốn có người mới thì thuê ở mục Người bán.`, 3.4); }]] });
    }
  } else if (kind === 'nvdem') { if (!c4NvDemEvent(E)) return;                 // the evening question of a counting task (nhiemvu.js)
  } else if (kind === 'rival') {                                            // a rival betel stall across the lane, cheaper
    if (SAVE4.rival > 0) return;
    Object.assign(E, { title: 'Có người tranh khách', text: `Nhà ${who} mở gánh trầu ngay đối diện, bán rẻ hơn một đồng!`, opts: [
      ['Hạ giá trầu còn 5 đồng (3 ngày)', () => { SAVE4.rival = 3; SAVE4.cheap = 3; SAVE4.rivalWho = who; toast('Hạ giá giữ khách, lãi mỗi miếng mỏng đi.', 3); }],
      ['Giữ giá', () => { SAVE4.rival = 3; SAVE4.rivalWho = who; toast('Khách bị kéo sang gánh bên kia mất mấy hôm. Chạm vào gánh ấy nếu muốn mua đứt.', 3.6); }]] });
  } else if (kind === 'gio') {                                              // a gale
    const fix = c4Loss(.03, .08);
    Object.assign(E, { title: 'Gió to!', text: SAVE4.lv ? 'Cơn gió lốc thổi tốc cả mái lều, hàng hoá bay tứ tung!' : 'Cơn gió lốc thổi lật cả gánh, trầu cau văng tứ tung!', opts: [
      [`Gọi thợ sửa ngay · ${c4Money(fix)}`, () => { sp(fix); const n = Math.floor(SAVE4.stock * .15); SAVE4.stock -= n; toast(`Sửa xong, nhặt lại được hàng, chỉ mất ${n} miếng.`, 3); }, SAVE4.money >= fix],
      ['Tự nhặt nhạnh', () => { const n = Math.floor(SAVE4.stock * .4); SAVE4.stock -= n; C4.shut = Math.max(C4.shut, 20); toast(`Mất cả buổi nhặt nhạnh, ${n} miếng dập nát phải bỏ.`, 3); }]] });
  } else if (kind === 'lua') {                                              // a fire behind the market
    if (R() < .6) return;                                                   // (rare)
    AU.drumHit();
    const known = c4People().list.filter(p => c4Known(p.id));
    Object.assign(E, { title: 'Cháy!', text: 'Đống rơm sau chợ bốc cháy! Cả chợ nháo nhác chạy đi xách nước, một lúc lâu không ai mua bán gì.<br><br><b>Đi dập lửa:</b> cả làng nhớ ơn (người quen quý nhà mình hơn, khách ghé đông hơn đến hết ngày), nhưng gánh bỏ trống, có thể mất ít hàng.<br><b>Ở lại trông hàng:</b> hàng còn nguyên, nhưng mang tiếng chỉ biết giữ của (người quen bớt quý).', opts: [
      ['Cùng mọi người đi dập lửa', () => { const dap = c4Loss(.01, .03); sp(dap); C4.fire = 25; SAVE4.phuc = 1; for (const p of known) c4Bump(p.id, 5); const n = R() < .35 ? Math.min(SAVE4.stock, 3 + ((R() * 5) | 0)) : 0; SAVE4.stock -= n;
        toast(`Lửa tắt nhờ cả làng xúm vào. Ai cũng khen nhà mình xông xáo: người quen quý hơn, khách ghé đông hơn đến hết ngày.${n ? ` Về đến gánh mới thấy mất ${n} miếng trầu.` : ''}`, 4.6); }],
      ['Ở lại trông hàng', () => { const ct = c4Loss(.04, .10); sp(ct); C4.fire = 25; for (const p of known) c4Bump(p.id, -3); toast('Hàng còn nguyên, nhưng có người bĩu môi: "Cháy cả chợ mà nhà ấy chỉ lo giữ của!" Người quen bớt quý nhà mình.', 4.4); }]] });
    for (const w of C4.walkers) if (w.st !== 'leave') { if (w.chat) w.chat = null; w.st = 'leave'; w.talk = false; w.sp = 160; }
    for (const g of own) C4.Q[g] = [];
  } else if (kind === 'linh') {                                             // the district's soldiers levy money for labour
    const d = c4Loss(.01, .02, 10);
    Object.assign(E, { title: 'Lính huyện', text: `Lính huyện đi qua, đòi tiền phu cho ${own.length} gánh: có thể phải nộp ${c4LossText(.01, .02, 10)}.`, opts: [
      [`Nộp ${d} đồng`, () => sp(d), SAVE4.money >= d],
      ['Kêu nghèo', () => { if (R() < .5) toast('Lính huyện thấy gánh nhỏ, tha cho.', 2.8); else { const n = Math.min(SAVE4.stock, 10); SAVE4.stock -= n; toast(n ? `Lính huyện tịch thu ${n} miếng trầu thay tiền!` : 'Lính huyện lục gánh chẳng thấy gì đáng giá, chửi đổng rồi đi.', 3); } }]] });
  } else if (C4_EXTRA_EV[kind]) { if (C4_EXTRA_EV[kind](E) === false) return; }   // kinhdoanh.js
  else return;
  C4.ev = E;
  $('#c4evT').textContent = E.title; $('#c4evB').innerHTML = E.text;
  const box = $('#c4evO'); box.innerHTML = '';
  E.opts.forEach(([label, act, ok = true], i) => { const b = document.createElement('button'); b.className = 'btn'; b.innerHTML = label; b.disabled = !ok; b.addEventListener('click', () => c4EvPick(i)); box.appendChild(b); });   // bienco.js
  c4Sheets('c4ev');
}
function c4Bankrupt(why) {
  AU.snort();
  $('#c4evT').textContent = 'Vỡ nợ!';
  $('#c4evB').innerHTML = why ? why + ' Hai vợ chồng đành làm lại từ đầu với hai bàn tay trắng.' : `Nợ lái buôn ${c4Money(SAVE4.debt)} đã ba buổi sáng không trả nổi. Lái buôn thu hết gánh hàng để trừ nợ. Hai vợ chồng đành làm lại từ đầu với hai bàn tay trắng.`;
  const box = $('#c4evO'); box.innerHTML = '';
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Làm lại từ đầu';
  b.addEventListener('click', c4StartOver);
  box.appendChild(b); C4.phase = 'morning'; c4Sheets('c4ev');
}
// back to day one with empty hands (bankrupt, or the player's own choice); the record and a reached goal (chương V) are kept
function c4StartOver() { const keep = { best: SAVE4.best, goal: SAVE4.goal }; SAVE4 = C4_NEW(); Object.assign(SAVE4, { intro: true, started: true }, keep); persist4(); c4Sheets(null); c4MarketStart(); }
// owner: a "start over" button (small, at the foot of the morning and evening sheets) asks first, in plain words, what is lost
function c4AskStartOver() {
  const back = C4.sheet; AU.tap(); C4.ev = null;
  $('#c4evT').textContent = 'Khởi nghiệp lại từ đầu?';
  $('#c4evB').innerHTML = `Toàn bộ cơ nghiệp sẽ mất hết: <b>${c4Money(SAVE4.money)}</b> trong túi, gánh hàng, sạp quán, người làm, khách quen và mọi điều đã ghi trong sổ tay.<br><br>Hai vợ chồng sẽ quay về ngày đầu tiên với hai bàn tay trắng. Chẳng ai còn nhớ mặt, mọi thứ phải gây dựng lại, muôn vàn khó khăn.<br><br><b>Bạn có chắc không?</b>`;
  const box = $('#c4evO'); box.innerHTML = '';
  const no = document.createElement('button'); no.className = 'btn'; no.textContent = 'Thôi, giữ cơ nghiệp'; no.addEventListener('click', () => { AU.tap(); c4Sheets(back); });
  const yes = document.createElement('button'); yes.className = 'btn alt'; yes.textContent = 'Chắc chắn, làm lại từ đầu'; yes.addEventListener('click', () => { AU.snort(); c4StartOver(); toast('Hai vợ chồng lại bắt đầu từ gánh trầu đầu tiên. Cố lên!', 3.4); });
  box.append(no, yes); c4Sheets('c4ev');
}
// the goal reached: she is with child, and in time a brood of mice is born — chương V opens
function c4GoalReached() {
  SAVE4.goal = true; persist4(); AU.kenCall(); setTimeout(() => AU.drumHit(), 600);
  $('#c4evT').textContent = 'Đạt mục tiêu!';
  $('#c4evB').innerHTML = `Hai vợ chồng đã để dành được <b>${c4Money(c4Net())}</b>.<br><br>Tối ấy, vợ thẹn thùng: "Mình ơi… em có mang rồi."<br>Chồng mừng quýnh: "Trời ơi, mình sắp làm cha!"<br><br>Chín tháng mười ngày sau, cả một bầy chuột con ra đời, đứa nào cũng tinh nghịch…<br><br><b>Đã mở Chương V · Bầy Chuột Phiêu Lưu.</b> Vợ chồng vẫn có thể buôn bán tiếp, mở thêm cửa hàng.`;
  const box = $('#c4evO'); box.innerHTML = '';
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Buôn bán tiếp';
  b.addEventListener('click', () => { c4Sheets(null); c4NewDay(); });
  box.appendChild(b); c4Sheets('c4ev');
}

/* ---------- the market at work ---------- */
function updateC4(dt) {
  C4.t += dt;
  if (C4.phase === 'story') { c4StoryUpdate(dt); return; }
  if (C4.paused) { c4EvTick(dt); AU.ambient({}); return; }                            // a sheet is open: the market waits, the rain bed goes quiet
  for (const f of C4.fx) f.t += dt; C4.fx = C4.fx.filter(f => f.t < 1.2);
  for (const e of [...C4.walkers, C4.wife, ...C4.vendors, C4.porter, ...C4_SHOPS.map(g => SAVE4.shops[g]).filter(Boolean), ...c4AllHands().map(o => o.h)]) if (e.say && (e.say.t += dt) > e.say.life) e.say = null;
  if (C4.phase === 'open') {
    const was = C4.mins; C4.mins += dt * C4_MPS;
    if (Math.floor(was / 30) !== Math.floor(C4.mins / 30)) { SAVE4.openMins = C4.mins; persist4(); }   // every half hour of the market
    const busy = C4_BUSY[c4Hour(C4.mins)] || .3;
    if ((C4.spawnT -= dt) <= 0) { C4.spawnT = 1 / (.9 * C4_PACE * busy * c4Lv().flow * c4Flow()) * (.6 + R() * .8); c4Spawn(); }
    for (const v of C4.vendors) if (!c4VendorMine(v) && (v.callT -= dt) <= 0) { v.callT = 9 + R() * 9; if (Math.abs(v.x - C4.camX - c4View().vw / 2) < 600) c4Say(v, c4Pick(v.calls)); }
    if (C4.events.length && C4.mins >= C4.events[0].at && !Object.values(C4.SV).some(A => A && A.length)) { c4Dispatch(C4.events[0].kind, C4.events.shift()); return; }
    // noon: sticky rice goes off; scorching days wilt some betel
    if (was < 12 * 60 && C4.mins >= 12 * 60) {
      if (c4Own('xoi') && c4Stock('xoi') > 0) { const n = c4Stock('xoi'); C4.today.wilt += n; C4.today.wiltLoss += n * c4Unit('xoi'); c4SetStock('xoi', 0); toast(`Đến trưa (12:00), ${n} gói xôi thiu phải đổ bỏ.`, 3); }
      if (c4Wx() === 'gat' && SAVE4.stock > 4) { const n = Math.floor(SAVE4.stock * .25); SAVE4.stock -= n; C4.today.wilt += n; C4.today.wiltLoss += n * c4Unit('trau'); toast(`Nắng gắt, ${n} miếng trầu héo rũ.`, 3); }
      c4Hud();
    }
    if (C4.wed && C4.mins >= (C4.wed.at || 15 * 60)) {
      const W = C4.wed; C4.wed = null;
      if (SAVE4.stock >= W.n) { C4.today.wedOk = true; SAVE4.stock -= W.n; const pay = W.n * 9; SAVE4.money += pay; C4.today.take += pay; C4.today.cogs += W.n * c4Unit('trau'); C4.today.sold += W.n; AU.drumHit(); toast(`Nhà ${W.who} đến lấy ${W.n} miếng trầu, trả ${c4Money(pay)}!`, 3.4); C4.fx.push({ x: C4_STALL + 40, y: c4Y(C4_STALL_Z) - 230, t: 0, s: '+' + pay }); }
      else { AU.snort(); toast(`Không đủ ${W.n} miếng trầu, nhà ${W.who} giận dỗi bỏ đi.`, 3.4); }
      c4Hud();
    }
    c4NvUpdate(dt); c4DelivUpdate(); c4ExtraUpdate(); c4StreetUpdate(dt); c4CoupleTalk(dt); c4Ambience(dt); c4FlowerSeller(dt); c4VisitorsUpdate(dt); c4RivalUpdate(dt); c4RivalWalk(dt); c4HusbTout(dt); c4TripsUpdate(dt); c4AutoUpdate(dt);
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
  if (C4.kid && C4.kid.t > C4.kid.spill && !C4.kid.spilt) {                  // the child knocks the stall over
    C4.kid.spilt = true; const g = c4Pick(c4Owned().filter(x => c4Stock(x) > 3)) || 'trau', n = Math.ceil(c4Stock(g) * (.15 + R() * .2));
    if (n > 0) { c4SetStock(g, c4Stock(g) - n); AU.thump(); toast(`Thằng cu nghịch ngợm làm đổ ${g === 'trau' ? 'gánh trầu' : 'hàng ' + C4_GOODS[g].name.toLowerCase()}, hỏng mất ${n} ${C4_GOODS[g].unit}!`, 3.4); c4Hud(); }
  }
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
      if (w.smokeX !== undefined && !w.smoked && Math.abs(w.x - w.smokeX) < 8) {   // sit down on a stool for a smoke, then go on
        w.st = 'sit'; w.smoked = true; w.sitT = 14 + R() * 10; if (R() < .6) c4Say(w, c4Pick(['Rít một hơi điếu cày… sướng!', 'Ngồi nghỉ chân tí đã.', 'Thuốc lào quê mình nặng ra phết!']));
      }
      if (w.drunk) w.z = Math.max(.38, Math.min(.98, w.z + Math.sin(C4.t * 1.7 + w.seed) * dt * .12));   // zigzagging across the lane
      const g = w.shop, qx = g && C4_GOODS[g].x + c4QX(g);
      if (g && c4Open(g) && !(g === 'trau' && C4.cat && C4.cat.st === 'sit') && !(C4.shut > 0) && C4.phase === 'open' && Math.abs(w.x - qx) < 140 && C4.Q[g].length < (w.guest ? 9 : 4)) { w.st = 'queue'; w.wait = 0; C4.Q[g].push(w); }
      else if (R() < dt * (w.drunk ? .05 : .006) && !w.say) c4Say(w, c4Pick(w.drunk ? C4_DRUNK : C4_ALONE));
    } else if (w.st === 'queue') {
      const g = w.shop, q = C4.Q[g], i = q.indexOf(w), tx = C4_GOODS[g].x + c4QX(g) + i * 62, dx = tx - w.x, dz = C4_Q_Z - w.z, d = Math.hypot(dx, dz * 300);
      w.moving = d > 3;
      if (w.moving) { const k = Math.min(1, 90 * dt / d); w.x += dx * k; w.z += dz * k; w.ph += dt * 9; w.face = dx < -1 ? -1 : dx > 1 ? 1 : -1; } else w.face = -1;
      w.wait += dt;
      if ((w.wait > (c4Lv().wait + i * 2) * (w.guest ? 4 : 1) * (1 + .35 * c4Tables(g)) || (g === 'trau' && C4.cat && C4.cat.st === 'sit') || !c4Open(g)) && !(C4.SV[g] || []).some(sv => sv.who === w)) { c4Say(w, c4Stock(g) ? c4Pick(C4_GIVEUP) : 'Hết hàng rồi à? Tiếc quá!'); if (!w.guest) c4Snubbed(w, !c4Stock(g)); c4Leave(w, false); C4.today.lost++; }
    } else if (w.st === 'chat') {
      const c = w.chat; if (c.a === w) c4ChatStep(c, dt);
    } else if (w.st === 'leave') { w.x += w.face * w.sp * dt; w.ph += dt * w.sp / 9; }
    else if (w.st === 'sit' && (w.sitT -= dt) <= 0) w.st = 'walk';
    else if (w.st === 'toseat' || w.st === 'eat') c4SeatUpdate(w, dt);
  }
  if (C4.guestQ && C4.guestQ.length) {
    C4.guestT += dt;
    while (C4.guestQ.length && C4.guestQ[0].at <= C4.guestT) {
      const { p, no, late } = C4.guestQ.shift(), gs = C4.guestGoods();
      if (no) { toast(c4Pick([`Chờ mãi chẳng thấy ${p.name} đâu. Hẹn rồi lại quên!`, `${c4Cap1(p.name)} nhắn ra: "Bận việc nhà, hôm khác nhé!"`, `${c4Cap1(p.name)} hẹn mà không đến.`]), 3); continue; }
      if (gs.length) { c4Spawn(undefined, { p, shop: gs[(R() * Math.min(2, gs.length)) | 0] }); const w = C4.walkers[C4.walkers.length - 1]; if (late && w && w.pid === p.id) setTimeout(() => { if (S.mode === 'c4play' && !w.say) c4Say(w, c4Pick(['Xin lỗi, tôi đến muộn!', 'Còn hàng không cô? Tôi chạy ra đây!', 'Bận tí việc, giờ mới ra được!'])); }, 900); }
    }
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
  // who sells where, then the sales (nguoiban.js): the couple run between the stalls, helpers stay at theirs
  c4SellersUpdate(dt); c4ServeUpdate(dt);
  // the husband fetching more (sent from a stall sheet)
  const P = C4.porter;
  if (P.st === 'out') { P.x -= 150 * dt; P.z = Math.min(.3, P.z + dt * .2); P.ph += dt * 10; if (P.x <= Math.min(C4_OFF, C4.camX - 110)) { P.st = 'away'; P.t = 2; } }
  else if (P.st === 'away') { if ((P.t -= dt) <= 0) { P.st = 'back'; AU.click(); } }
  else if (P.st === 'back') { P.x += 140 * dt; P.ph += dt * 10; if (P.x >= c4HusbX() - 60) P.z = Math.max(.04, P.z - dt * .5); if (P.x >= c4HusbX()) { P.x = c4HusbX(); P.z = .04; P.st = 'idle'; P.deliv = false; if (P.good) c4Receive(P.good, P.qty, P.cost); c4Say(P, c4Pick(C4_HUSBAND)); setTimeout(() => c4Say(C4.wife, c4Pick(C4_WIFE_GOT)), 1300); } }
  if (C4.build) { C4.build.t += dt; if (Math.floor(C4.build.t * 3) !== Math.floor((C4.build.t - dt) * 3)) AU.tap(); if (C4.build.t >= 6) { SAVE4.lv = C4.build.to; if (C4.porter.st === 'idle') C4.porter.x = c4HusbX(); C4.build = null; AU.drumOne(); AU.pluck(88); persist4(); c4Hud(); } }
  C4.camX = Math.max(-140, Math.min(C4_W - c4View().vw + 40, C4.camX));
  if ((C4.hudT = (C4.hudT || 0) - dt) <= 0) { C4.hudT = .25; c4Hud(); }
  if ((C4.saveT = (C4.saveT || 0) - dt) <= 0) { C4.saveT = 5; persist4(); }
}
function c4ChatStart(a, b) {
  if (a.x > b.x) [a, b] = [b, a];
  const others = [...C4.walkers.filter(w => w !== a && w !== b).map(w => w.name), ...C4.vendors.map(v => v.name)].filter(n => n !== a.name && n !== b.name);
  const fill = s => s.replace(/\{A\}/g, a.name).replace(/\{B\}/g, b.name).replace(/\{X\}/g, () => c4Pick(others.length ? others : ['cụ Lý']));
  let news = null, pick = C4_CHATS;
  if (R() < .38 && SAVE4.next) {
    const truth = k => k === 'mua' ? SAVE4.next.wx === 'mua' : !!SAVE4.next[k];
    C4.said = C4.said || {};
    const kinds = Object.keys(C4_NEWS).filter(k => !SAVE4.notes.some(n => n.day === SAVE4.day + 1 && n.kind === k) && (C4.said[k] || 0) < 2);
    const yes = kinds.filter(truth), no = kinds.filter(k => !truth(k));
    if (kinds.length && Object.values(C4.said).reduce((x, y) => x + y, 0) < 3) { news = (yes.length && (R() < .5 || !no.length)) ? c4Pick(yes) : c4Pick(no.length ? no : kinds); C4.said[news] = (C4.said[news] || 0) + 1; pick = C4_NEWS[news]; }
  }
  if (!news && SAVE4.omens && SAVE4.omens.day === SAVE4.day && SAVE4.omens.left.length && R() < .35) { const k = c4Pick(SAVE4.omens.left); SAVE4.omens.left = SAVE4.omens.left.filter(x => x !== k); pick = C4_OMENS[k]; }
  const script = c4Pick(pick).map(([k, s]) => [k, fill(s).replace(/^./, ch => ch.toUpperCase())]);
  const c = { a, b, script, i: -1, t: 0, news, heard: false, from: script[0][0] ? b.name : a.name };   // the one who starts the news: named in the notebook
  for (const w of [a, b]) { w.st = 'chat'; w.chat = c; }
  a.face = 1; b.face = -1; const mid = (a.x + b.x) / 2, mz = (a.z + b.z) / 2; a.x = mid - 42; b.x = mid + 42; a.z = b.z = mz;
}
function c4ChatStep(c, dt) {
  c.t -= dt; if (c.t > 0) return;
  for (const w of [c.a, c.b]) w.talk = false;
  if (++c.i >= c.script.length) {
    for (const w of [c.a, c.b]) { w.st = 'walk'; w.face = w.dir; w.chat = null; w.cd = 18 + R() * 14; }
    if (c.news && c.heard && !SAVE4.notes.some(n => n.day === SAVE4.day + 1 && n.kind === c.news)) {
      SAVE4.notes.push({ day: SAVE4.day + 1, kind: c.news, text: `${c.from} kể: ${C4_NOTE[c.news]}`, from: c.from }); SAVE4.notes = SAVE4.notes.filter(n => n.day >= SAVE4.day);
      persist4(); AU.pluck(90); C4.noteNew = true; c4Hud(); toast('Đã ghi vào sổ tay.', 2);
    }
    return;
  }
  const [k, s] = c.script[c.i], who = k ? c.b : c.a;
  who.talk = true; const life = 1.5 + s.length * .05; c4Say(who, s, life); who.say.whisper = c.news && !c.heard; c.t = life + .25;
}
function c4Listen(c) {
  if (c.heard) return; c.heard = true; AU.tap(); if (C4.today) C4.today.news = (C4.today.news || 0) + 1;
  for (const w of [c.a, c.b]) if (w.say) w.say.whisper = false;
  c.i = -1; c.t = 0;
}
function c4Leave(w, bought) { const q = w.shop && C4.Q[w.shop], i = q ? q.indexOf(w) : -1; if (i >= 0) q.splice(i, 1); w.st = 'leave'; w.face = bought ? (R() < .5 ? 1 : -1) : 1; w.sp = (w.kind === 'mouse' ? 70 : w.sp) + R() * 20; }
function c4EndDay() {
  AU.ambient({});
  C4.phase = 'night'; SAVE4.openDay = 0;
  for (const w of C4.walkers) if (w.st !== 'leave') { w.st = 'leave'; w.face = w.x < C4_STALL ? -1 : 1; w.chat = null; w.talk = false; }
  for (const g of Object.keys(C4.Q)) { C4.Q[g] = []; C4.SV[g] = []; }
  C4.guestQ = []; C4.seats = {};
  for (let k = 0; C4.deliv && k < 6; k++) c4DelivPay(C4.deliv);           // deliveries still under way (or waiting their turn) at closing are settled now
  C4.cat = null; C4.shut = 0; C4.parade = null; C4.fire = 0;
  if (C4.kid) { SAVE4.money += 10; C4.kid = null; }
  const d = C4.today, lines = [];
  // what does not keep is lost
  for (const g of c4Owned()) { const G = C4_GOODS[g], n = c4Stock(g); if (n && G.keep !== 'ever') { d.wilt += n; d.wiltLoss += n * c4Unit(g); lines.push(`${n} ${G.unit} ${G.name.toLowerCase()}`); c4SetStock(g, 0); } }
  d.wiltLoss = Math.round(d.wiltLoss);
  // helpers are paid; one owed two days running walks out
  const quits = []; c4PayHands(d, quits); C4.trips = [];
  const extra = []; c4PayRents(d, extra);
  const gossip = SAVE4.day >= C4_BOOK_DAY ? c4Gossip() : 0;
  c4TasksEnd(d, extra);
  const gain = d.take - d.cogs - d.wiltLoss - d.spent - d.wages + d.got;
  if (gain > SAVE4.best) SAVE4.best = gain;
  SAVE4.earn = [...(SAVE4.earn || []), Math.round(gain)].slice(-5);   // what cụ Lý's tax is reckoned on
  c4AchCheck();
  if (SAVE4.favor > 0) SAVE4.favor--;
  if (SAVE4.rival > 0) SAVE4.rival--; if (SAVE4.cheap > 0) SAVE4.cheap--;
  SAVE4.phuc = 0;
  $('#c4dayT').textContent = `Ngày ${SAVE4.day} đã tan chợ`;
  $('#c4dayB').innerHTML = `<div><b>${c4Money(d.take)}</b><span>Bán được</span></div><div><b>${c4Money(d.cogs)}</b><span>Tiền hàng</span></div><div class="${gain >= 0 ? 'gain' : 'loss'}"><b>${c4Money(Math.abs(gain))}</b><span>${gain >= 0 ? 'Lãi' : 'Lỗ'}</span></div>`;
  $('#c4dayN').innerHTML = c4ByShopHtml(d) + `${d.served} khách mua${d.lost ? ' · ' + d.lost + ' khách bỏ đi' : ''}`
    + (lines.length || d.wiltLoss ? `<br><span class="bad">Hàng hỏng phải bỏ${lines.length ? ' (' + lines.join(', ') + ')' : ''}: mất ${c4Money(d.wiltLoss)}</span>` : '')
    + (d.wages ? `<br>Trả công người phụ: ${c4Money(d.wages)}` : '')
    + (d.spent ? `<br>Chi khác (củi, lễ, tiền chợ, cho vay…): ${c4Money(d.spent)}` : '')
    + (d.got ? `<br>Thu khác: ${c4Money(d.got)}` : '')
    + (d.met ? `<br>Quen thêm ${d.met} khách · cả thảy ${c4People().list.filter(p => c4Known(p.id)).length} người quen` : '')
    + (gossip ? `<br><span class="bad">${gossip.who.map(c4Cap1).join(', ')} không ưa quán, đi nói ra nói vào:${gossip.hurt.length ? ` ${gossip.hurt.slice(0, 4).join(', ')}${gossip.hurt.length > 4 ? ' và ' + (gossip.hurt.length - 4) + ' người nữa' : ''} bớt quý nhà mình (−5)` : ''}${gossip.hurt.length && gossip.cold ? ';' : ''}${gossip.cold ? ` ${gossip.cold} người chưa quen nghe chuyện không hay, sẽ ngại ghé hơn` : ''}. Lấy lòng ${gossip.who.length > 1 ? 'họ' : gossip.who[0]} thì hết chuyện.</span>` : '')
    + (quits.length ? `<br><span class="bad">${quits.join(' ')}</span>` : '')
    + (extra.length ? `<br>${extra.join('<br>')}` : '')
    + (SAVE4.goal ? '' : `<br>Mục tiêu ${c4Money(C4_GOAL)}: đã để dành ${c4Money(Math.max(0, c4Net()))} (tiền trong túi trừ nợ)`);
  persist4(); c4LoanUI(true); c4HomeOffer();
  setTimeout(() => { if (S.mode === 'c4play' && C4.phase === 'night') c4Sheets('c4day'); }, 900);
}
const c4Talk2Due = () => SAVE4.day === C4_BOOK_DAY && !SAVE4.talk2;
function c4Talk2() { c4StoryStart(C4_TALK2, () => { SAVE4.talk2 = true; persist4(); c4MarketStart(); }); }
function c4DayAdvance() { trackSend(`xong/chuong-4/ngay-${SAVE4.day}`); SAVE4.day++; SAVE4.plan = SAVE4.next; SAVE4.next = c4Roll(SAVE4.day + 1); persist4(); }
function c4NewDay() {
  c4DayAdvance();
  if (c4Talk2Due()) { c4Sheets(null); c4Talk2(); return; }
  c4OmensRoll();
  C4.day = SAVE4.day; C4.mins = C4_OPEN; C4.phase = 'morning'; C4.said = {}; C4.expect = []; C4.today = { sold: 0, take: 0, cogs: 0, served: 0, lost: 0, wilt: 0, wiltLoss: 0, spent: 0, got: 0, wages: 0 }; C4.spawnT = .3; C4.wed = null; C4.parade = null; C4.cat = null;
  for (const g of C4_SHOPS) if (c4Own(g)) SAVE4.shops[g].sick = false;
  c4DayLook();
  for (let i = 0; i < 6; i++) c4Spawn(C4.camX - 200 + R() * (c4View().vw + 400));
  c4Hud(); c4Morning();
}
// near closing with much left over that will not keep: invite people you know to come and take it, half price or free
const c4Leftover = () => c4Owned().filter(g => C4_GOODS[g].keep !== 'ever').reduce((a, g) => a + c4Stock(g), 0);
const c4CanInvite = () => C4.phase === 'open' && SAVE4.day >= C4_BOOK_DAY && C4.mins >= 15 * 60 && c4Leftover() >= 5 && c4Guests().length > 0;
function c4Guests() {
  const here = new Set(C4.walkers.map(w => w.pid));
  return c4People().list.filter(p => c4Known(p.id) && !here.has(p.id) && SAVE4.folk[p.id].called !== SAVE4.day);
}
function c4OpenInvite() {
  const left = c4Owned().filter(g => C4_GOODS[g].keep !== 'ever' && c4Stock(g) > 0).map(g => `${c4Stock(g)} ${C4_GOODS[g].unit} ${C4_GOODS[g].name.toLowerCase()}`).join(', ');
  const n = c4Guests().length;
  $('#c4evT').textContent = 'Hàng còn nhiều';
  $('#c4evB').innerHTML = `Sắp tan chợ mà còn ${left}. Để đến tối là hỏng. Mời khách quen ghé lấy, vừa đỡ phí, vừa được lòng người ta.`;
  const box = $('#c4evO'); box.innerHTML = '';
  for (const [k, deal, label] of [[3, 'half', 'Mời 3 người · bán nửa giá'], [6, 'half', 'Mời 6 người · bán nửa giá'], [3, 'free', 'Mời 3 người · biếu không'], [6, 'free', 'Mời 6 người · biếu không'], [0, null, 'Thôi']]) {
    const b = document.createElement('button'); b.className = k ? 'btn' : 'btn alt'; b.textContent = label; b.disabled = k > 0 && n === 0;
    b.addEventListener('click', () => { c4Sheets(null); if (k) c4Invite(c4Guests().sort((a, b) => c4Like(a.id) - c4Like(b.id) + (R() - .5) * 40).slice(0, Math.min(k, n)), deal); });
    box.appendChild(b);
  }
  c4Sheets('c4ev');
}
function c4Invite(ps, deal) {
  const goods = () => c4Owned().filter(g => C4_GOODS[g].keep !== 'ever' && c4Stock(g) > 0).sort((a, b) => c4Stock(b) - c4Stock(a));
  // owner: not everyone comes straight away — some come late, some never turn up (the less they like us, the likelier)
  const Q = C4.guestQ = C4.guestQ || [];
  ps.forEach((p, i) => {
    const f = c4F(p.id), a = c4Like(p.id); f.deal = deal; f.called = SAVE4.day;
    const no = R() < Math.max(.05, Math.min(.4, .25 - (a - 50) / 200)) / (deal === 'free' ? 1.6 : 1), late = R() < .35;
    Q.push({ p, at: no ? 10 + R() * 12 : late ? 5 + R() * 10 : i * .7 + R() * 3, no, late });   // ~11 s of play = an hour
  });
  Q.sort((a, b) => a.at - b.at);
  C4.guestGoods = goods; C4.guestT = 0; AU.pluck(88);
  toast(`Chồng chạy đi mời ${ps.map(p => p.name).join(', ')}. Người bảo "Ra ngay!", người bảo "Để tí nữa"…`, 3.6);
}
function c4Hud() {
  $('#c4Invite').hidden = !c4CanInvite();
  $('#c4Money').innerHTML = c4Money(SAVE4.money);
  $('#c4Time').textContent = `Ngày ${SAVE4.day}  ${C4_ZOD[c4Hour(C4.mins)] || ''} ${c4Clock(C4.mins)}  ${C4_WXI[c4Wx()]}`;
  $('#c4Time').title = `giờ ${c4Hour(C4.mins)}`;
  $('#c4Stock').innerHTML = c4Owned().map(g => `${C4_WARE_I[g] || C4_GOODS[g].name} ${c4Stock(g)}`).join(' &nbsp;');
  $('#c4Debt').innerHTML = SAVE4.debt > 0.5 ? 'Nợ ' + c4Money(SAVE4.debt) : '';
  $('#c4Debt').hidden = !(SAVE4.debt > 0.5);
  $('#c4Note').classList.toggle('new', !!C4.noteNew);
  $('#c4Home').hidden = !(C4_HOUSE_ON && c4HasHome());
  $('#c4Task').innerHTML = c4TasksHud(); $('#c4Task').hidden = !SAVE4.tasks || !SAVE4.tasks.length;   // some days have no tasks
}

/* ---------- stall sheets: more goods, a bigger betel stall, renting a plot, hiring a helper ---------- */
function c4OpenUp(g = 'trau') {
  const G = C4_GOODS[g], P = C4.porter, box = $('#c4upO');
  $('#c4upGo').hidden = true; $('#c4upB').innerHTML = '';
  if (g !== 'trau' && !c4Own(g)) {                                         // an empty plot
    $('#c4upT').textContent = 'Đất trống';
    const L = c4Landlord(g), ok = L.known;                                    // a plot needs no acquaintance (owner); a house does
    box.innerHTML = `<p>Chỗ này bán <b>${G.name.toLowerCase()}</b>. Chủ đất: <b>${L.p.name}</b> (${c4People().houses[L.p.house].xom})${ok ? '' : ', nhà mình chưa quen'}.</p>`
      + `<p>Giá thuê chỗ: <b>${c4Money(L.price)}</b>${ok ? L.word : ' (giá thường; quen thân với chủ đất thì được bớt)'}. Vợ tự trông được; đông khách thì thuê thêm người phụ.</p><p class="hint">${c4Ware(g)}</p><p class="hint">Riêng nhà mặt chợ (thuê hay mua cả căn về sau) thì chưa quen sẽ không biết chủ nhà là ai mà hỏi.</p>`;
    { $('#c4upGo').hidden = false; $('#c4upGo').disabled = SAVE4.money < L.price || C4.phase !== 'open'; $('#c4upGo').innerHTML = `Thuê · ${c4Money(L.price)}`; $('#c4upGo').onclick = () => c4Rent(g); }
    c4Sheets('c4up'); return;
  }
  $('#c4upT').textContent = g === 'trau' ? c4Lv().name : G.name;
  const carry = c4Carrier(g);                                                // the husband, or a hired hand if he is out (nguoiban.js)
  const husb = C4.deliv && C4.deliv.out ? `chồng đang gánh hàng đi giao cho ${C4.deliv.o.vil}` : 'chồng đang đi lấy hàng';   // (a player: delivering is not fetching)
  if (!carry) box.innerHTML = c4AllHands().length ? `<p>${c4Cap1(husb)}, người làm thuê cũng đều đang bận…</p>` : `<p>${c4Cap1(husb)}…</p>`;
  else if (C4.phase !== 'open') box.innerHTML = '';
  else {
    box.innerHTML = `<h4>Nhập thêm ${G.name.toLowerCase()}</h4><div class="ord"></div><button class="btn get">Sai ${carry.name} đi lấy</button>`;
    let q = 0; c4Stepper(box.querySelector('.ord'), g, v => { q = v; }, true);
    box.querySelector('.get').addEventListener('click', () => { if (!q) { c4Sheets(null); return; } if (carry.hand) c4SendTrip(carry, g, q, c4CostMid(g)); else Object.assign(P, { st: 'out', good: g, qty: q, cost: c4CostMid(g), to: null, at: null }); c4Sheets(null); toast(`${c4Cap1(carry.name)} đi lấy hàng ở bến.`); });
  }
  box.appendChild(c4AutoBlock(g));                                          // fetching by itself, once it is a counter (nguoiban.js)
  if (c4Owned().length > 1 || c4Hands(g).length) box.appendChild(c4HandsBlock(g));   // hiring only once there is more than the betel stall (a player)
                                        // who sells here: the couple, or hired helpers (nguoiban.js)
  if (g !== 'trau' && !C4_GOODS[g].buy) c4ShopUpBlock(g);                   // a bought stall has no upgrades (yet)
  if (g === 'trau') {
    const nx = C4_LV[SAVE4.lv + 1];
    if (nx && !c4UpAllowed(nx)) { $('#c4upB').innerHTML = '<p class="hint">Mua nhà sẽ có sau.</p>'; $('#c4upGo').hidden = true; }
    else if (!nx) $('#c4upB').innerHTML = '<p>Gian hàng trầu khang trang nhất phiên chợ.</p>';
    else { $('#c4upB').innerHTML = `<h4>Nâng cấp</h4>${nx.house === 'own' ? c4HouseNote(nx.up) : ''}<p class="nx">Lên <b>${nx.name}</b>: chứa ${nx.cap} miếng · nhập ${nx.cost} đồng/miếng · khách ghé đông hơn, bán nhanh hơn${nx.daily ? ` · <b>tiền nhà ${nx.daily} đồng mỗi tối</b>` : ''}${nx.house === 'own' ? ' · <b>mua đứt, khỏi trả tiền nhà</b>' : ''}</p>`; $('#c4upGo').hidden = false; $('#c4upGo').disabled = !(SAVE4.money >= c4UpPrice(nx, nx.up) && !C4.build); $('#c4upGo').innerHTML = `${nx.house === 'own' ? 'Mua nhà' : nx.house ? 'Thuê nhà' : 'Nâng cấp'} · ${c4Money(c4UpPrice(nx, nx.up))}`; $('#c4upGo').onclick = c4DoUp; }
  }
  c4Sheets('c4up');
}
// what each ware is like, for the plot sheet
const c4Ware = g => ({ che: 'Bán chạy buổi sáng, trời rét hay mưa; nắng gắt thì ế. Mỗi ngày tốn củi đun. Tan chợ chè thừa phải đổ.', xoi: 'Chỉ bán buổi sáng. Đến 12:00 (giờ Ngọ) xôi thiu, thừa bao nhiêu đổ bấy nhiêu.', xen: 'Kim chỉ, lược, gương… để lâu không hỏng, nhưng lãi mỏng, bán chậm.', bun: 'Bán chạy quanh trưa. Vốn đắt, công người phụ cao; tan chợ bún thừa phải đổ.' }[g]);
function c4Rent(g) {
  const G = C4_GOODS[g], L = c4Landlord(g); if (SAVE4.money < L.price) return;
  SAVE4.money -= L.price; C4.today.spent += L.price;
  SAVE4.shops[g] = { own: true, stock: 0, rentK: L.k };
  C4.Q[g] = []; C4.SV[g] = [];
  c4Sheets(null); AU.stamp(); AU.pluck(88); persist4(); c4Hud();
  toast(`Đã thuê chỗ bán ${G.name.toLowerCase()}. Vợ chồng tự trông, đông thì thuê thêm người. Chạm vào để nhập hàng!`, 3.6);
}
function c4DoUp() {
  const nx = C4_LV[SAVE4.lv + 1]; if (!nx || !c4UpAllowed(nx) || SAVE4.money < c4UpPrice(nx, nx.up) || C4.build) return;
  if (nx.house) { const L = c4Landlord('trau'); if (!L.known) { toast('Không biết chủ căn nhà là ai mà hỏi thuê hay mua.', 3.4); return; } SAVE4.rentKTrau = L.k; }
  const price = c4UpPrice(nx, nx.up); SAVE4.money -= price; C4.today.spent += price; C4.build = { to: SAVE4.lv + 1, t: 0 };
  for (const w of [...C4.Q.trau]) c4Leave(w, false); C4.SV.trau = [];
  c4Sheets(null); persist4(); c4Hud(); AU.stamp();
}
const c4CanUp = () => { const nx = C4_LV[SAVE4.lv + 1]; return nx && c4UpAllowed(nx) && SAVE4.money >= c4UpPrice(nx, nx.up) && !C4.build; };

/* ---------- drawing ---------- */
// the stall's sign (owner): a board hung on two posts above the stall; tapping the board opens the stall, nothing else does
const C4_SIGN_Y = -205;
function c4SignDraw(g, x, y, s, name) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2;
  g.fillStyle = '#7a4a22'; g.fillRect(-52, C4_SIGN_Y + 12, 5, -C4_SIGN_Y - 12); g.fillRect(47, C4_SIGN_Y + 12, 5, -C4_SIGN_Y - 12);
  g.fillStyle = '#f2d27a'; g.beginPath(); g.rect(-62, C4_SIGN_Y - 14, 124, 28); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, C4_SIGN_Y + 1);
  g.restore();
}
const c4SignHit = (x, y, sx, sy, s) => Math.abs(x - sx) < 66 * s && y > sy + (C4_SIGN_Y - 18) * s && y < sy + (C4_SIGN_Y + 18) * s;
function renderC4() {
  // a sheet is open: the market behind it is drawn once and then kept still (the book lagged phones)
  if (C4.sheet && C4.sheet !== 'c4day' && C4.drawnSheet === C4.sheet) return;
  C4.drawnSheet = C4.sheet || null;
  const A = c4Art(), V = c4View(), Sc = V.s * DPR, vw = V.vw, cx = C4.camX, oy = V.oy;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS[C4.paperKey || 'yellow'].base; ctx.fillRect(0, 0, cv.width, cv.height);   // each day its own paper
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
  if (!rain && c4OmenOn('quang')) { const sx = 80 + dayK * (vw - 160), sy = -oy + 90 + Math.pow(dayK * 2 - 1, 2) * Math.max(110, C4_Y0 + oy - 170); g.strokeStyle = 'rgba(255,244,205,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(sx, sy, 50, 0, 6.283); g.stroke(); g.strokeStyle = 'rgba(255,244,205,.16)'; g.lineWidth = 12; g.beginPath(); g.arc(sx, sy, 62, 0, 6.283); g.stroke(); }
  g.fillStyle = rain || wx === 'ret' ? '#9d95b9' : c4Sunset() > .3 ? '#d4471c' : wx === 'gat' ? '#c73a1e' : '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(80 + dayK * (vw - 160), -oy + 90 + Math.pow(dayK * 2 - 1, 2) * Math.max(110, C4_Y0 + oy - 170), wx === 'gat' ? 40 : 32, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  c4Sky(g, V, cx, wx); c4OmenSky(g, V, cx);
  c4River(g, cx, vw);                                                     // the river is behind the houses: drawn before them (owner)
  g.save(); g.translate(cx * .55, 0); g.globalAlpha = .5;
  for (const [x, k, sc, hv] of (C4.scene ? C4.scene.far : [[-80, 'house', .45, 0], [260, 'bamboo', .5], [520, 'house', .42, 2], [880, 'tree', .45], [1180, 'house', .45, 4], [1500, 'bamboo', .45], [1720, 'house', .42, 1]]))
    if (x + 150 > cx * .45 - 40 && x - 150 < cx * .45 + vw + 40) dp(g, k === 'house' ? c4HouseArt(hv) : k === 'tree' ? WP.bigTree : PROPS.bamboo, x, C4_Y0 - 70, 0, sc, sc);
  g.globalAlpha = 1; g.restore();
  g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, C4_Y0 - 4, vw + 100, C4_D + 10);
  g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, C4_Y0 + C4_D + 6, vw + 100, V.vh);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, C4_Y0 - 4); g.lineTo(cx + vw + 50, C4_Y0 - 4); g.stroke();
  g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1.4; g.setLineDash([18, 14]);
  for (const z of [.45, .78]) { g.beginPath(); g.moveTo(cx - 50, c4Y(z)); g.lineTo(cx + vw + 50, c4Y(z)); g.stroke(); }
  g.setLineDash([]);
  g.strokeStyle = '#2f6a4c'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0, rr = mulberry(41); i < 110; i++) { const tx = -300 + rr() * (C4_W + 300), ty = C4_Y0 + C4_D + 14 + rr() * Math.max(20, V.vh - oy - C4_Y0 - C4_D - 30); if (!vis(tx, 20)) continue; g.beginPath(); for (const d of [-6, 0, 6]) { g.moveTo(tx + d, ty); g.lineTo(tx + d * 1.6, ty - 12 - Math.abs(d)); } g.stroke(); }
  for (const [x, k, s, hv] of (C4.scene ? C4.scene.near : [[960, 'tree', .9], [1360, 'house', .72, 1], [1760, 'house', .7, 3], [2050, 'bamboo', .8], [2260, 'bamboo', .85], [600, 'house', .62, 5], [210, 'bamboo', .7]]))
    if (vis(x, 260)) dp(g, k === 'tree' ? WP.bigTree : k === 'house' ? c4HouseArt(hv) : k === 'bamboo' ? PROPS.bamboo : PROPS.hay, x, C4_Y0, 0, s, s);
  if (vis(C4_GATE, 140)) dp(g, A.gate, C4_GATE, C4_Y0 + 6, 0, .88, .88);
  const items = [], bubbles = [];
  const head = (x, z, tall, e, pri = 1, chat = null) => { if (e && e.say) bubbles.push({ e, x, y: c4Y(z) - tall * c4S(z) - 8, s: c4S(z), pri, chat }); };
  for (const v of C4.vendors) if (vis(v.x, 140)) {
    const vz = v.z || .05, wz = v.z ? v.z + .01 : .1, mine = c4VendorMine(v), vg = C4_VENDOR_G[v.ware];   // a stall we bought: our sellers, faded when sold out
    if (!mine) items.push({ z: vz, f: () => c4Mouse(g, v.M, v.x - 40, 1, C4.t * 2 + v.x, false, v.say ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null, null, c4S(vz) * .95, c4Y(vz), v.x) });
    items.push({ z: wz, f: () => { g.globalAlpha = mine && c4Stock(vg) <= 0 ? .45 : 1; dp(g, A[v.ware], v.x + 50, c4Y(wz), 0, c4S(wz), c4S(wz)); g.globalAlpha = 1;
      if (mine && c4Stock(vg) <= 0 && C4.phase === 'open') { g.font = '900 14px "Playfair Display", serif'; g.textAlign = 'center'; g.fillStyle = '#a3332a'; g.fillText('Hết hàng', v.x + 50, c4Y(wz) - 90 * c4S(wz)); } } });
    if (mine) c4HandItems(items, vg, head); else head(v.x - 40, vz, 168 * .95, v, 0);
  }
  c4RivalItems(items, g, head, vis); c4TripItems(items, head, vis); c4NvItems(items, g, vis, head);                                      // the rival betel stall across the lane (muagan.js)
  // the couple's other plots: rented ones with their stall and helper, empty ones with a board
  for (const sh of C4_SHOPS) {
    const G = C4_GOODS[sh], sx = G.x, sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z); if (!vis(sx, 200)) continue;
    if (c4Own(sh)) {
      c4HandItems(items, sh, head);
      c4TableItems(items, g, vis, sh);
      items.push({ z: C4_STALL_Z, f: () => { c4DrawShopLv(g, sx + 20, sy, ss, c4SLvI(sh), sh); g.globalAlpha = c4Open(sh) && !(C4.shut > 0) ? 1 : .45; dp(g, A[G.art], sx + 20, sy, 0, ss, ss); g.globalAlpha = 1;
        c4SignDraw(g, sx + 20, sy, ss, G.name.toUpperCase());
        if (c4Stock(sh) <= 0 && C4.phase === 'open') { g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.fillStyle = '#a3332a'; g.fillText('Hết hàng', sx + 20, sy - 120 * ss); } } });
    } else {
      items.push({ z: C4_STALL_Z, f: () => { dp(g, A.lot, sx, sy, 0, ss, ss); g.save(); g.translate(sx, sy); g.scale(ss, ss); g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK;
        const L = c4Landlord(sh); g.fillText('Cho thuê', 0, -102); g.font = '700 13px "Playfair Display", serif'; g.fillText(c4Money(L.price), 0, -83); g.restore(); } });
    }
  }
  const lv = SAVE4.lv;
  if (C4.build) items.push({ z: C4_STALL_Z, f: () => { dp(g, A.scaffold, C4_STALL, c4Y(C4_STALL_Z), 0, c4S(C4_STALL_Z), c4S(C4_STALL_Z)); for (let i = 0; i < 3; i++) { const k = (C4.t * .8 + i / 3) % 1; g.globalAlpha = .5 * (1 - k); g.fillStyle = '#c3b596'; g.beginPath(); g.arc(C4_STALL - 60 + i * 60, c4Y(C4_STALL_Z) - 20 - k * 60, 14 + k * 20, 0, 6.283); g.fill(); g.globalAlpha = 1; } } });
  else {
    c4HandItems(items, 'trau', head);
    items.push({ z: C4_STALL_Z, f: () => { const sx = C4_STALL + (lv ? 10 : 30), sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z);
      if (lv >= 3) c4DrawShopLv(g, sx, sy, ss, lv, 'trau');                       // the house behind it
      g.globalAlpha = C4.shut > 0 ? .45 : 1; dp(g, c4StallArt(Math.min(2, lv)), sx, sy, 0, ss, ss); g.globalAlpha = 1;
      if (lv < 2) c4SignDraw(g, sx, sy, ss, 'TRẦU CAU');
      if (SAVE4.cauDoi) for (const d of [-1, 1]) { const px = sx + d * (lv ? 120 : 112) * ss, py = sy - (lv ? 150 : 80) * ss; g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(px - 7, py - 40 * ss, 14, 60 * ss); g.strokeRect(px - 7, py - 40 * ss, 14, 60 * ss); g.fillStyle = '#f2c640'; for (let k = 0; k < 3; k++) g.fillRect(px - 3, py - 32 * ss + k * 18 * ss, 6, 8 * ss); }
    } });
  }
  { const W = C4.wife, wx2 = W.x ?? c4SellX('trau', 0), walk = W.st === 'walk', serving = W.at ? c4ServingK(W.at, W) : 0;   // the wife, wherever she is selling
    if (vis(wx2, 80)) items.push({ z: C4_WIFE_Z, f: () => c4Mouse(g, MICE.wife, wx2, walk ? W.face : 1, walk ? W.ph : C4.t * 2, walk, walk ? null : -.2 - serving * 1.1, serving > .3 && W.at === 'trau' ? MP.ladong : null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), 2.1) });
    head(wx2, C4_WIFE_Z, 168, W, 2); }
  { const P = C4.porter, walk = P.st === 'out' || P.st === 'back' || P.st === 'walk', load = P.st === 'back', arm = load ? -1.35 : P.st === 'sell' ? -.2 - c4ServingK(P.at, P) * 1.1 : null;
    if (P.st !== 'away' && vis(P.x, 80)) items.push({ z: P.z, f: () => c4Mouse(g, MICE.groom, P.x, P.st === 'out' ? -1 : P.st === 'walk' ? P.face : 1, walk ? P.ph : C4.t * 2, walk, arm, load ? WP.basket : null, c4S(P.z), c4Y(P.z), 1.3) });
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
    [[MICE.c, ITEM.drum, -.4], [MICE.d, ITEM.ken, -1.05], [MICE.a, ITEM.parasol, -1.35], [MICE.groom, null, null], [MICE.wife, null, null], ...Array.from({ length: pd.extra || 0 }, (_, e) => [[MICE.a, MICE.c, MICE.d][e % 3], WP.basket, -1.35])].forEach(([M, it, arm], i) => {
      const x = pd.x - i * 70; if (!vis(x, 80)) return;
      items.push({ z: z + i * .001, f: () => c4Mouse(g, M, x, 1, pd.ph + i, true, arm, it, s, c4Y(z), i) });
    });
  }
  for (const w of C4.walkers) if (vis(w.x, 80) || (w.buf && vis(w.x - w.face * 205 * c4S(w.z), 160))) { items.push({ z: w.z, f: () => c4Critter(g, w, w.x, c4Y(w.z), c4S(w.z) * C4_CROWD) }); head(w.x, w.z, C4_TALL[w.kind] * C4_CROWD * (w.kind === 'mouse' ? .92 * (C4_MOUSE_SORTS[w.sort].role === 'child' ? .68 : 1) : 1), w, w.st === 'chat' || w.st === 'queue' ? 1.5 : .5, w.chat); }
  c4StreetItems(items, g, vis); c4FxItems(items, g, vis); c4FlyItems(items, g, vis); c4VisitItems(items, g, vis);
  items.sort((a, b) => a.z - b.z); for (const it of items) it.f();
  if (c4CanUp() && C4.phase === 'open' && !C4.build) { const b = Math.sin(C4.t * 4) * 6, ax = C4_STALL + 20, ay = c4Y(C4_STALL_Z) - [200, 270, 310][Math.min(2, lv)] * c4S(C4_STALL_Z) + b; g.fillStyle = '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ax, ay - 26); g.lineTo(ax + 20, ay); g.lineTo(ax + 8, ay); g.lineTo(ax + 8, ay + 18); g.lineTo(ax - 8, ay + 18); g.lineTo(ax - 8, ay); g.lineTo(ax - 20, ay); g.closePath(); g.fill(); g.stroke(); }
  for (const gq of Object.keys(C4.Q)) for (const w of C4.Q[gq]) { const k = Math.max(0, 1 - w.wait / (c4Lv().wait + C4.Q[gq].indexOf(w) * 2)), y = c4Y(w.z) - C4_TALL[w.kind] * c4S(w.z) - 14; if (w.say) continue; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 1.6; g.fillRect(w.x - 22, y, 44, 7); g.strokeRect(w.x - 22, y, 44, 7); g.fillStyle = k > .4 ? '#2f6a4c' : '#a3332a'; g.fillRect(w.x - 21, y + 1, 42 * k, 5); }
  for (const f of C4.fx) { const k = f.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = '900 26px "Playfair Display", serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = f.s[0] === '+' ? '#2f6a4c' : INK; g.strokeText(f.s, f.x, f.y - k * 40); g.fillText(f.s, f.x, f.y - k * 40); g.restore(); }
  // speech bubbles, each fixed over its speaker's head; once shown a bubble keeps its place; a whisper shows "…" and an ear
  const shown = b => b.e.say.shown ? 1 : 0;
  bubbles.sort((a, b) => shown(b) - shown(a) || b.pri - a.pri || a.e.say.t - b.e.say.t);
  const placed = []; C4.ears = [];
  for (const b of bubbles) {
    const sy = b.e.say, whisper = sy.whisper, B = c4Bubble(whisper ? '…' : sy.text, 0, 13, 150), a = Math.min(1, sy.t * 6, (sy.life - sy.t) * 4), sc = (.8 + .2 * b.s) * (.9 + .1 * Math.min(1, sy.t * 6));
    const x = b.x, y = b.y - (B.bh + 30) * sc, hh = (B.bh + 6) * sc, bw = (B.w / 2 - 8) * sc;
    if (!sy.shown && placed.some(p => Math.abs(p.x - x) < p.w + bw && Math.abs(p.y - y) < p.h + hh)) continue;
    sy.shown = true; placed.push({ x, y, w: bw, h: hh });
    g.globalAlpha = Math.max(0, a); dp(g, B, x, y, 0, sc, sc);
    if (whisper) { c4Ear(g, x + B.w / 2 * sc, y - B.bh * sc - 4, sc * 1.6, C4.t); if (b.chat) C4.ears.push({ x0: x - B.w / 2 * sc - 12, x1: x + B.w / 2 * sc + 30, y0: y - B.bh * sc - 34, y1: y + 14, chat: b.chat }); }
    g.globalAlpha = 1;
  }
  const m = C4.mins, dusk = C4.phase === 'night' ? .45 : Math.max(0, Math.min(.3, (m - (C4_CLOSE - 60)) / 60 * .3)) + Math.max(0, (C4_OPEN + 40 - m) / 40 * .18);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (rain) { ctx.strokeStyle = 'rgba(47,95,143,.35)'; ctx.lineWidth = 1.5 * DPR; ctx.beginPath(); for (let i = 0, rr = mulberry(7 + ((C4.t * 12) | 0)); i < 70; i++) { const x = rr() * cv.width, y = rr() * cv.height; ctx.moveTo(x, y); ctx.lineTo(x - 6 * DPR, y + 16 * DPR); } ctx.stroke(); ctx.fillStyle = 'rgba(80,90,110,.12)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (wx === 'ret') { ctx.fillStyle = 'rgba(120,140,170,.14)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  { const k = c4Sunset(); if (k > 0 && C4.phase !== 'story') { ctx.fillStyle = `rgba(232,110,36,${.2 * k})`; ctx.fillRect(0, 0, cv.width, cv.height); } }
  if (wx === 'gat') { ctx.fillStyle = 'rgba(255,170,60,.08)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (C4.fire > 0) { ctx.fillStyle = `rgba(200,60,20,${.12 + Math.sin(C4.t * 8) * .04})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (dusk > 0) { ctx.fillStyle = `rgba(40,30,60,${dusk})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
// sunset: from 15:00 the light warms to orange (0 … 1 at 18:30)
const c4Sunset = () => Math.max(0, Math.min(1, (C4.mins - 15 * 60) / 210));
function c4Sky(g, V, cx, wx) {
  const skyH = C4_Y0 + V.oy, rain = wx === 'mua', sun = c4Sunset();
  g.save(); g.translate(cx, -V.oy);                                        // screen space: (0,0) the top left corner
  if (sun > 0) { const gr = g.createLinearGradient(0, 0, 0, skyH); gr.addColorStop(0, `rgba(228,96,34,${.42 * sun * (c4OmenOn('hoang') ? 1.5 : 1)})`); gr.addColorStop(1, `rgba(240,150,60,${.12 * sun})`); g.fillStyle = gr; g.fillRect(-10, -10, V.vw + 20, skyH + 10); }
  // clouds: puffs, long streaks, the curled clouds of the prints; they drift slowly, a little behind the camera
  const n = rain ? 8 : wx === 'gat' ? 2 : 5, W = V.vw + 360;
  for (let i = 0; i < n; i++) {
    const r = mulberry(i * 31 + 5), base = r() * W, sp = 5 + r() * 9, type = i % 3, s = .7 + r() * .6;
    const x = ((base + C4.t * sp - cx * .08) % W + W) % W - 180, y = 26 + r() * skyH * .45;
    c4Cloud(g, x, y, s * (rain ? 1.3 : 1), type, rain ? '#cfc8cf' : sun > .3 ? '#f5d2a8' : '#f2ecde');
  }
  // birds: a flock now and then crosses the sky, wings beating
  if (!rain) for (let k = 0; k < 2; k++) {
    const per = c4OmenOn('chim') ? 8 + k * 4 : 16 + k * 7, cyc = (C4.t + k * 9) / per, fr = cyc % 1, r = mulberry(Math.floor(cyc) * 17 + k * 3 + 1);
    if (r() < (c4OmenOn('chim') ? .05 : .35)) continue;
    const dir = r() < .5 ? 1 : -1, y0 = 30 + r() * skyH * .4, cnt = 3 + ((r() * 4) | 0), x0 = dir > 0 ? -60 + fr * (V.vw + 160) : V.vw + 60 - fr * (V.vw + 160);
    g.strokeStyle = INK; g.lineWidth = 2; g.lineCap = 'round';
    for (let j = 0; j < cnt; j++) {
      const bx = x0 - dir * (j % 2 ? 1 : .5) * 22 * Math.ceil(j / 2), by = y0 + Math.ceil(j / 2) * (j % 2 ? 9 : -9) + Math.sin(C4.t * 2 + j) * 3, fl = Math.sin(C4.t * 11 + j * 1.7) * 5, w = 9;
      g.beginPath(); g.moveTo(bx - w, by - fl); g.quadraticCurveTo(bx - w * .4, by - 3 - fl * .3, bx, by); g.quadraticCurveTo(bx + w * .4, by - 3 - fl * .3, bx + w, by - fl); g.stroke();
    }
  }
  g.restore();
}
// the signs of rain in the scene (owner): one or two dragonflies skim low over the lane, ants run about the ground; never obvious
function c4OmenSky(g, V, cx) {
  const skyH = C4_Y0 + V.oy;
  g.save(); g.translate(0, -V.oy);
  if (c4OmenOn('chuon')) for (let i = 0; i < 2; i++) {
    const r = mulberry(i * 13 + 7), W = V.vw + 200, sp = (30 + r() * 20) * (i ? 1 : -1);
    const x = (((r() * W + C4.t * sp) % W) + W) % W - 100, y = skyH - 8 + Math.sin(C4.t * 3 + i * 2) * 5, fl = Math.sin(C4.t * 40 + i) * 2;
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.stroke();
    g.fillStyle = 'rgba(226,240,250,.85)'; g.beginPath(); g.ellipse(x - 2, y - 4 - fl, 7, 3, .2, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x + 3, y - 4 + fl, 7, 3, -.2, 0, 6.283); g.fill(); g.stroke();
  }
  if (c4OmenOn('kien')) for (let i = 0; i < 4; i++) {
    const r = mulberry(i * 29 + 3), x = r() * V.vw + Math.sin(C4.t * (1 + r()) + i) * 40, y = skyH + 14 + r() * 40 + Math.cos(C4.t * 2 + i) * 5;
    g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(x, y, 1.6, 0, 6.283); g.fill();
  }
  g.restore();
}
function c4Cloud(g, x, y, s, type, col) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const blobs = type === 1 ? [[-40, 4, 14], [-16, 0, 18], [12, 2, 16], [38, 5, 12], [0, 8, 14], [-26, 8, 12], [24, 8, 12]]
    : [[-28, 6, 18], [0, -6, 24], [26, 4, 19], [-10, 10, 18], [14, 12, 16]];
  g.lineWidth = 5; g.strokeStyle = INK;
  for (const [bx, by, r] of blobs) { g.beginPath(); g.arc(bx, by, r, 0, 6.283); g.stroke(); }
  g.fillStyle = col; for (const [bx, by, r] of blobs) { g.beginPath(); g.arc(bx, by, r, 0, 6.283); g.fill(); }
  if (type === 2) {                                                        // the curl of a Đông Hồ cloud
    g.strokeStyle = INK; g.lineWidth = 1.6;
    for (const [bx, by] of [[-14, 4], [16, 6]]) { g.beginPath(); for (let a = 0; a < 9; a += .3) { const rr = 2 + a * 1.3, px = bx + Math.cos(a) * rr, py = by + Math.sin(a) * rr * .8; a ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  } else { g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-30, 14); g.quadraticCurveTo(0, 20, 30, 14); g.stroke(); }
  g.restore();
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
  if (c4NvTap(x, y)) return;                                              // the strays, the lost child, the thief… (nhiemvu.js)
  if (c4VisitorTap(x, y)) return;                                         // someone waiting with a "!" (bienco.js)
  // the ear (and its … bubble) first: it may float in front of a stall
  for (const E of C4.ears || []) if (x > E.x0 && x < E.x1 && y > E.y0 && y < E.y1 && !E.chat.heard) { c4Listen(E.chat); return; }
  for (const w of C4.walkers) if (w.st === 'chat' && w.chat.news && !w.chat.heard) {
    const c = w.chat, mx = (c.a.x + c.b.x) / 2, s = c4S(c.a.z), top = c4Y(c.a.z) - 230 * s;
    if (Math.abs(x - mx) < 95 * s && y > top && y < c4Y(c.a.z) + 10) { c4Listen(c); return; }
  }
  const sy = c4Y(C4_STALL_Z), s = c4S(C4_STALL_Z);
  if (c4SignHit(x, y, C4_STALL + (SAVE4.lv ? 10 : 30), sy, s)) { AU.tap(); c4OpenUp('trau'); return; }
  // a rented stall: its counter; an empty plot: only its board
  for (const g of C4_SHOPS) { const gx = C4_GOODS[g].x, hit = c4Own(g) ? c4SignHit(x, y, gx + 20, sy, s) : Math.abs(x - gx) < 56 * s && y > sy - 115 * s && y < sy - 70 * s;
    if (hit) { AU.tap(); c4OpenUp(g); return; } }
  if (c4RivalTap(x, y)) return;
  for (const v of C4.vendors) { const vz = v.z || .05, s2 = c4S(vz), vy = c4Y(vz);
    if (x > v.x - 60 * s2 && x < v.x + 90 * s2 && y > vy - 130 * s2 && y < vy + 14) { AU.tap(); if (c4VendorMine(v)) c4OpenUp(C4_VENDOR_G[v.ware]); else c4BuyOpen(v); return; } }
}
function c4Key(e) {
  if (C4.phase === 'story' && ['Space', 'Enter', 'ArrowRight'].includes(e.code)) { e.preventDefault(); c4StoryNext(); return; }
  if (e.code === 'Escape') { if (!$('#c4up').hidden || !$('#c4note').hidden) c4Sheets(null); else showChapters(); }
}

/* ---------- HUD, sheets, registration ---------- */
{
  const hud = document.createElement('div'); hud.id = 'c4hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="c4Name">Vợ Chồng Khởi Nghiệp</button><div class="mid"><div class="tag" id="c4Time"></div></div><div class="right"><div class="tag" id="c4Money"></div><div class="tag" id="c4Stock"></div><div class="tag debt" id="c4Debt" hidden></div></div><div class="bar"><button class="tag ic" id="c4Note" title="Sổ tay" aria-label="Sổ tay"><i class="ic4 book"></i></button><button class="tag ic" id="c4Task" title="Việc hôm nay">Việc</button><button class="tag" id="c4Home" hidden>Nhà riêng</button><button class="tag ic up" id="c4Ups" title="Nâng cấp" aria-label="Nâng cấp"><i class="ic4 up"></i></button><button class="tag" id="c4Invite" hidden>Mời khách quen</button></div>';
  const sheet = (id, inner) => { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet'; d.hidden = true; d.innerHTML = `<div class="card4">${inner}</div>`; return d; };
  document.body.append(hud,
    sheet('c4am', '<h3 id="c4amT"></h3><div id="c4amB"></div><h4>Sáng nay nhập bao nhiêu hàng?</h4><p class="hint">Hàng tươi không để qua đêm được: tan chợ còn thừa là hỏng, mất vốn.</p><div id="c4amO"></div><button class="c4restart" data-restart="1">Khởi nghiệp lại từ đầu</button>'),
    sheet('c4up', '<h3 id="c4upT"></h3><div id="c4upO"></div><div id="c4upB"></div><div class="row"><button class="btn" id="c4upGo"></button><button class="btn alt" id="c4upX">Đóng</button></div>'),
    sheet('c4ev', '<h3 id="c4evT"></h3><p id="c4evB"></p><div class="row col" id="c4evO"></div>'),
    sheet('c4note', '<h3>Sổ tay</h3><div id="c4noteB"></div><div class="row"><button class="btn alt" id="c4noteX">Đóng</button></div>'),
    sheet('c4home', '<div id="c4homeB"></div><div class="row"><button class="btn" id="c4homeShop">Sắm đồ</button><button class="btn alt" id="c4homeX">Đóng</button></div>'),
    sheet('c4shop', '<div id="c4shopB"></div><div class="row"><button class="btn alt" id="c4shopX">Quay lại</button></div>'),
    sheet('c4day', '<h3 id="c4dayT"></h3><div class="nums" id="c4dayB"></div><p id="c4dayN"></p><div id="c4loanN"></div><div id="c4homeN"></div><button class="btn" id="c4dayGo">Sang ngày mới</button><button class="btn alt" id="c4daySleep">Đi ngủ, mai cố gắng tiếp</button><button class="c4restart" data-restart="1">Khởi nghiệp lại từ đầu</button>'));
  $('#c4Name').addEventListener('click', () => showChapters());
  $('#c4Invite').addEventListener('click', () => { if (c4CanInvite()) { AU.tap(); C4_PICK = { deal: 'half', sel: new Set() }; C4_WHO = null; c4OpenNotes('quen'); } });
  $('#c4Note').addEventListener('click', () => { if (C4.phase === 'open') { AU.tap(); C4_PICK = null; c4OpenNotes(); } });
  $('#c4Ups').addEventListener('click', () => { if (C4.phase === 'open') { AU.tap(); c4OpenUps(); } });
  $('#c4Home').addEventListener('click', () => { AU.tap(); $('#c4homeB').innerHTML = c4HomeHtml(); c4Sheets('c4home'); });
  $('#c4homeShop').addEventListener('click', () => { AU.tap(); $('#c4shopB').innerHTML = c4ShopHtml(); c4Sheets('c4shop'); });
  $('#c4shopB').addEventListener('click', e => { const b = e.target.closest('[data-buy]'); if (!b || b.disabled) return; c4BuyItem(b.dataset.buy); $('#c4shopB').innerHTML = c4ShopHtml(); });
  $('#c4homeX').addEventListener('click', () => c4Sheets(null));
  $('#c4shopX').addEventListener('click', () => { $('#c4homeB').innerHTML = c4HomeHtml(); c4Sheets('c4home'); });
  $('#c4Task').addEventListener('click', () => { AU.tap(); C4_WHO = null; C4_PICK = null; c4OpenNotes('viec'); });
  $('#c4dayGo').addEventListener('click', () => { c4Sheets(null); if (!SAVE4.goal && c4Net() >= C4_GOAL) c4GoalReached(); else c4NewDay(); });
  // owner: end the day and leave for the chapter list; coming back starts the next morning
  $('#c4daySleep').addEventListener('click', () => { c4Sheets(null); if (!SAVE4.goal && c4Net() >= C4_GOAL) { c4GoalReached(); return; } c4DayAdvance(); showChapters(); });
  document.querySelectorAll('[data-restart]').forEach(b => b.addEventListener('click', c4AskStartOver));
  $('#c4upX').addEventListener('click', () => c4Sheets(null));
  $('#c4noteX').addEventListener('click', () => { C4_WHO = null; C4_PICK = null; c4Sheets(null); });
  for (const id of ['c4up', 'c4note']) $('#' + id).addEventListener('click', e => { if (e.target.id === id) c4Sheets(null); });
}
registerChapter({
  id: 4, modes: ['c4play'], direct: startC4,   // no album: the card opens the market
  card: { num: lg('Chương IV', 'Chapter IV'), han: '創業', name: lg('Vợ Chồng Khởi Nghiệp', 'The Newlyweds\' Shop'), desc: lg('Vợ chồng chuột mới cưới bàn nhau làm ăn: không đi ăn trộm, mà ra chợ buôn bán, để dành đủ hai quan mới tính chuyện con cái.', 'The newlywed mice decide how to make a living: not by stealing, but by trading at the village market, saving up before they start a family.'), bg: '#efcfb8' },
  progress: () => SAVE4.goal ? lg('Đã đạt mục tiêu', 'Goal reached') : SAVE4.started ? `${lgf('Ngày {d}', 'Day {d}', { d: SAVE4.day })} · ${c4Money(SAVE4.money)}` : lg('Mới mở', 'New'),
  hasProgress: () => SAVE4.started,
  hide: c4Hide,
  update: updateC4, render: renderC4, key: c4Key,
  pointer: { down: c4Down, move: c4Move, up: c4Up },
  next() { startC4(); }, retry() { startC4(); },
});
// chương V (the brood's adventures) is not made yet: its card shows once chương IV's goal is reached
registerChapter({
  id: 5, modes: [], locked: () => true, hidden: () => !SAVE4.goal,
  card: { num: lg('Chương V', 'Chapter V'), han: '冒險', name: lg('Bầy Chuột Phiêu Lưu', 'The Little Mice\'s Adventures'), desc: lg('Bầy chuột con nhà trầu cau lớn lên, rủ nhau đi phiêu lưu khắp làng.', 'The betel sellers\' children grow up and set off on adventures all over the village.'), bg: '#cfcbd0' },
  lockText: lg('Đang khắc ván', 'Being carved'), progress: () => lg('Đang khắc ván', 'Being carved'),
});
