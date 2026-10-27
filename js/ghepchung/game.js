/* Chương X · Ghép Chung 共拼 (owner, 2026-10-20: "làm giống chương hội làng: ai cũng vào ghép được, nhiều người ghép cùng lúc"): ONE jigsaw of
   1000 pieces (the big print of chương IX) shared by everybody. The server (server/phong-choi/src/jigsaw.js, class Jigsaw) keeps every
   group of pieces for good and decides who holds what and what joins; this file draws it with chương IX's engine (js/ghep/manh.js, its
   G.net hooks) and shows the others: the group someone lifts rises on every screen with their name, a join is seen by all.
   Each piece you join is worth 10 đồng (paid into chương IV's purse when the server says so). Small list of the people at the bottom,
   emotes and chat like Hội Làng (hlChatOpen with HL_CHAT_NET), and a board of all time: who has joined how many pieces (at least one). */
let JG_SAVE = { pieces: 0 };
try { const s = JSON.parse(localStorage.getItem('dcc.jg') || 'null'); if (s && typeof s.pieces === 'number') JG_SAVE = Object.assign(JG_SAVE, s); } catch (e) {}
const jgPersist = () => { try { localStorage.setItem('dcc.jg', JSON.stringify(JG_SAVE)); } catch (e) {} };

const JG = { G: null, im: null, welcome: null, id: null, players: [], conn: 'connecting', chat: new Map(), emo: new Map(), tray: false, trayBtns: [], btns: [], ui: null, board: null, bscroll: 0, drag: null, t: 0, flash: null, st: 0, mvT: 0, mvKey: '', doneAt: 0, conf: [], bad: false, pos: new Map(), joinedN: 0, pz: null, L: null, list: {}, listAt: 0, listBusy: false, thumbs: {}, gscroll: 0 };
// the prints: the newest first. cols x rows is the cut (the server has the same numbers); the thumbnails are small copies for the list
const JG_PUZZLES = [
  { id: 'ly', after: 'lh', pic: { id: 'ly', src: 'img/ch10/ly-ngu-vong-nguyet.jpg', w: 2050, h: 3650, vi: 'Lý ngư vọng nguyệt', en: 'Carp Gazing at the Moon' }, thumb: 'img/ch10/thumb-ly.jpg', cols: 41, rows: 73 },   // tall print; appears in the list only once Lễ hội đầu xuân is finished (owner, 2026-10-25)
  { id: 'lh', hideMin: 10, pic: { id: 'lh', src: 'img/ch10/le-hoi-dau-xuan.jpg', w: 3650, h: 2050, vi: 'Lễ hội đầu xuân', en: 'Spring Festival' }, thumb: 'img/ch10/thumb-lh.jpg', cols: 73, rows: 41 },   // opened 2026-10-24 (owner: "sao tranh mới vẫn chưa thấy lên")
  { id: 'dg', pic: { id: 'dg', src: 'img/ch10/dan-ga-me-con-2.jpg', w: 3300, h: 2324, vi: 'Đàn gà mẹ con', en: 'Mother Hen and Chicks' }, thumb: 'img/ch10/thumb-dg2.jpg', cols: 65, rows: 46 },
  { id: 'vq', pic: { id: 'vq', src: 'img/ch10/vinh-quy-bai-to.jpg', w: 4047, h: 2493, vi: 'Vinh quy bái tổ', en: 'Returning in Glory' }, thumb: 'img/ch10/thumb-vq.jpg', cols: 57, rows: 35 },
  { id: 'dcm', pic: { id: 'dcm', src: 'img/ch10/dam-cuoi-chuot.jpg', w: 3200, h: 2204, vi: 'Đám cưới chuột', en: 'The Mice’s Wedding' }, thumb: 'img/ch10/thumb-dcm.jpg', cols: 40, rows: 25 },
];
for (let k = JG_PUZZLES.length - 1; k >= 0; k--) if (JG_PUZZLES[k].hidden) JG_PUZZLES.splice(k, 1);
const jgLevel = pz => ({ pic: pz.pic, tier: 3, cols: pz.cols, rows: pz.rows, big: true });
const JG_STRIP = 50, JG_COIN = 10;

// NO background music in the prints (owner, 2026-10-24: "bỏ nhạc đi, ko chạy nhạc nữa"): the track and its code are gone; the game's own songs stay off here (AU.setQuiet), sound effects stay
function startJG() {
  trackEnter('chuong-10'); AU.init(); AU.setQuiet(true);   // the game's own songs stay off in the prints (and no track of ours plays any more)
  hideChapterHuds();
  S.chapter = 10; S.mode = 'jgplay';
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  Object.assign(JG, { pz: null, L: null, G: null, welcome: null, id: null, players: [], conn: 'connecting', ui: null, board: null, tray: false, flash: null, conf: [], bad: false, gscroll: 0 });
  JG.chat.clear(); JG.emo.clear(); hlChatClose(); HL_CHAT_NET = null; JG_NET.close();
  for (const pz of JG_PUZZLES) if (!JG.thumbs[pz.id]) { const im = new Image(); im.onload = () => { JG.thumbs[pz.id] = im; }; im.src = pz.thumb; }
  jgListAsk(true);
}
// one print: its picture, then its own server object (?p=)
function jgOpen(pz) {
  const me = hsMine(), look = { role: me.role, age: me.age, body: me.body, fur: me.fur, robe: me.robe, skirt: me.skirt, pants: me.pants, top: me.top };
  Object.assign(JG, { pz, L: jgLevel(pz), G: null, im: null, welcome: null, id: null, players: [], conn: 'connecting', ui: null, board: null, tray: false, flash: null, conf: [], bad: false });
  JG.chat.clear(); JG.emo.clear(); hlChatClose(); HL_CHAT_NET = JG_NET;
  c9Img(pz.pic, im => { if (JG.pz === pz) { JG.im = im; jgBuild(); } });
  JG_NET.open({ t: 'hello', dev: p4Device(), name: hsName(me), look }, jgMsg, s => { JG.conn = s; }, pz.id);
}
// back to the list of prints
function jgBack() { hlChatClose(); HL_CHAT_NET = null; JG_NET.close(); Object.assign(JG, { pz: null, L: null, G: null, im: null, welcome: null, id: null, players: [], ui: null, board: null, tray: false, conf: [], bad: false }); JG.chat.clear(); JG.emo.clear(); jgListAsk(true); }
function jgLeave() { hlChatClose(); HL_CHAT_NET = null; JG_NET.close(); showChapters(); }
// "106 người · 15 giờ 4 phút": how many people put the print together and how long it took
function jgDur(ms) {
  const m = Math.max(1, Math.round(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mi = m % 60;
  return d ? `${d} ${lg('ngày', 'd')} ${h} ${lg('giờ', 'h')}` : h ? `${h} ${lg('giờ', 'h')} ${mi} ${lg('phút', 'min')}` : `${m} ${lg('phút', 'min')}`;
}
function jgStats(info, fin) {
  const a = []; if (info.players) a.push(`${info.players} ${lg('người ghép', 'players')}`); if (fin && info.took > 0) a.push(jgDur(info.took));
  return a.join(' · ');
}
// a print with `after` shows only once that print is finished (the list numbers say so)
const jgFin = info => !!(info && (info.done || info.archive || (info.left === 0 && info.joined > 0)));
const jgPeek = () => location.search.indexOf('xemly') >= 0;   // ?xemly: the owner's way to see a print that waits for another (any host)
// a print with `hideMin` disappears from the list that many minutes after it was finished (the list gives since + took = the finishing time)
const jgGone = pz => { const i = JG.list && JG.list[pz.id]; return !!(pz.hideMin && !jgPeek() && i && i.done && i.since && i.took > 0 && Date.now() - (i.since + i.took) > pz.hideMin * 60000); };
const jgShown = () => JG_PUZZLES.filter(pz => !jgGone(pz) && (!pz.after || jgPeek() || jgFin(JG.list && JG.list[pz.after])));
function jgListAsk(force) {
  if (JG.listBusy || (!force && Date.now() - JG.listAt < 15000)) return; JG.listBusy = true; JG.listAt = Date.now();
  fetch(JG_LIST_URL).then(r => r.json()).then(j => { if (j && j.puzzles) JG.list = j.puzzles; }).catch(() => {}).then(() => { JG.listBusy = false; });
}

// the engine's view of the network: what to tell the server, the name tags
const JG_API = {
  poke(grp) { if (JG.pokeAt && JG.t - JG.pokeAt < 2) return; JG.pokeAt = JG.t; JG_NET.send({ t: 'poke', g: grp.id }); },
  lift(grp) { JG_NET.send({ t: 'lift', g: grp.id }); JG.mvT = 0; JG.mvKey = ''; },
  drop(grp) { JG_NET.send({ t: 'drop', g: grp.id, x: c9R1(grp.x), y: c9R1(grp.y), a: Math.round(grp.a * 1000) / 1000 }); },
  tick(G, dt) {
    const h = G.held; if (!h) { JG.mvT = 0; return; }
    JG.mvT += dt; if (JG.mvT < .1) return;
    const key = c9R1(h.x) + ',' + c9R1(h.y) + ',' + Math.round(h.a * 1000);
    if (key !== JG.mvKey || JG.mvT > 3) { JG.mvKey = key; JG.mvT = 0; JG_NET.send({ t: 'move', g: h.id, x: c9R1(h.x), y: c9R1(h.y), a: Math.round(h.a * 1000) / 1000 }); } else JG.mvT = .1;
  },
  tag(g, id, x, y) {
    const p = JG.players.find(q => q.id === id); if (!p) return;
    const label = p.name; g.font = `700 10.5px ${hlSans}`; const w = Math.min(120, g.measureText(label).width + 12);
    g.globalAlpha = .92; hlPlate(g, x - w / 2, y - 9, w, 18, '#f2ecde', HL_INK, 7); g.globalAlpha = 1; hlText(g, label, x, y + 1, 10.5, { f: hlSans, w: 700, o: false });
  },
};

function jgBuild() {
  const w = JG.welcome; if (!JG.im || !w) return;
  const old = JG.G, W = cv.width / DPR, H = cv.height / DPR - JG.st, G = c9MakeGame(JG.L, JG.im, W, H, w.seed);
  G.net = JG_API; JG.bad = !c9NetRestore(G, w.groups, w.holds, w.done);
  if (old && old.seed === G.seed && !w.fresh) { G.cam.x = old.cam.x; G.cam.y = old.cam.y; G.cam.z = old.cam.z; c9ClampCam(G); }
  JG.G = G; JG.mvT = 0; JG.mvKey = '';
}

/* ---------- messages from the server ---------- */
function jgMsg(m) {
  const G = JG.G;
  if (m.t === 'welcome') { JG.id = m.id; JG.players = m.players; JG.welcome = m; JG.conn = 'up'; jgBuild(); }
  else if (m.t === 'players') JG.players = m.players;
  else if (!G) return;
  else if (m.t === 'lift') { if (m.by !== JG.id) c9NetLift(G, m.g, m.by); }
  else if (m.t === 'report') JG.note = { t0: JG.t, s: m.ok ? lg('Đã gửi báo cáo. Cảm ơn bạn!', 'Report sent. Thank you!') : ({ new: lg('Bạn cần ghép được ít nhất 3 mảnh mới báo cáo được', 'Join at least 3 pieces before you can report'), dup: lg('Bạn đã báo cáo người này rồi', 'You already reported this player'), limit: lg('Hôm nay bạn đã báo cáo đủ 5 người', 'You have reported 5 players today'), self: lg('Không báo cáo được người này', 'You can not report this player') }[m.err] || lg('Người này vừa rời đi', 'This player just left')) };
  else if (m.t === 'deny') { c9NetDeny(G, m.g); if (m.cool) JG.note = { t0: JG.t, s: lg(`Bức lớn nhất vừa được dời, ${m.cool} giây nữa mới dời lại được`, `The biggest picture was just moved: ${m.cool} s until it can be moved again`) }; if (m.fixed) JG.note = { t0: JG.t, s: lg('Bức lớn nhất đã đặt yên, không dời được cho tới khi ghép xong', 'The biggest picture stays where it is until the puzzle is finished') }; if (m.lock) JG.note = { t0: JG.t, s: lg(`Mảnh này bạn vừa giữ lâu, nghỉ ${m.lock} giây nữa mới nhấc lại được`, `You held this one too long: wait ${m.lock} s to pick it up again`) }; }
  else if (m.t === 'nudge') JG.nudge = { g: m.g, until: JG.t + (m.sec || 30) };
  else if (m.t === 'timeup') { JG.nudge = null; JG.note = { t0: JG.t, s: lg(`Hết giờ, mảnh đã được đặt xuống. ${m.sec || 90} giây nữa mới nhấc lại được`, `Time is up, the piece was put down. ${m.sec || 90} s before you can lift it again`) }; }
  else if (m.t === 'poked') JG.note = { t0: JG.t, s: lg('Đã nhắc bạn đó đặt mảnh xuống', 'Reminded them to put it down') };
  else if (m.t === 'poses') c9NetPoses(G, m.p);
  else if (m.t === 'drop') { const g = G.gm.get(m.g); if (!g || (m.n && g.pcs.length !== m.n)) { JG_NET.lost(); return; } c9NetDrop(G, m.g, m.x, m.y, m.a); }   // this screen joined differently from the server: reconnect and take the server's picture
  else if (m.t === 'join') {
    c9NetJoin(G, m);
    if (m.by === JG.id && m.paid) {
      SAVE4.money = Math.max(0, (SAVE4.money || 0) + JG_COIN); try { persist4(); } catch (e) {} JG_SAVE.pieces++; jgPersist();
      JG.flash = { n: (JG.flash && JG.t - JG.flash.t0 < 1.6 ? JG.flash.n : 0) + JG_COIN, t0: JG.t };
    }
  }
  else if (m.t === 'done') { G.done = true; G.win = 0; G.held = null; JG.doneAt = JG.t; AU.plop(); for (let k = 0; k < 70; k++) JG.conf.push({ x: Math.random() * G.lw, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 60, vy: 60 + Math.random() * 120, c: ['#a3332a', '#f2c640', '#2f6a4c', '#3f8a86', '#7b4aa8'][k % 5], r: 3 + Math.random() * 4, ph: Math.random() * 6 }); }
  else if (m.t === 'reset') { JG.welcome = Object.assign({}, m, { fresh: true }); JG.players = m.players || JG.players; jgBuild(); JG.conf = []; }
  else if (m.t === 'chat') { if (!HL.chatOff && typeof m.s === 'string') JG.chat.set(m.id, { s: m.s.slice(0, 40), t0: JG.t }); }
  else if (m.t === 'emote') { if (typeof m.k === 'number' && m.k >= 0 && m.k < 6) { JG.emo.set(m.id, { k: m.k, t0: JG.t }); if (m.id !== JG.id) AU.tap(); } }
  else if (m.t === 'board') JG.board = m;
}

/* ---------- update and drawing ---------- */
function updateJG(dt) {
  JG.t += dt; JG.st = safeTop();
  if (!JG.pz) jgListAsk(false);
  if (JG.G) { c9Tick(JG.G, dt); JG.joinedN = JG.G.done ? JG.G.pieces.length : JG.G.pieces.length - JG.G.groups.length; }
  for (const p of JG.conf) { p.x += (p.vx + Math.sin(S.t * 3 + p.ph) * 24) * dt; p.y += p.vy * dt; } JG.conf = JG.conf.filter(p => p.y < (JG.G ? JG.G.lh : 800) + 30);
}
function jgZoomBtns(G) { const r = 20, x = G.lw - 30, b = G.lh - JG_STRIP - 10; return [{ k: 'in', t: '+' }, { k: 'out', t: '−' }, { k: 'fit', t: '⤢' }].map((q, i) => ({ ...q, x, y: b - r - (2 - i) * 52, r })); }
// the people, small, along the bottom: me first; what does not fit is a "+N"
function jgStrip(g, W, hh) {
  const y0 = hh - JG_STRIP; g.fillStyle = 'rgba(242,236,222,.92)'; g.fillRect(0, y0, W, JG_STRIP); g.fillStyle = HL_INK; g.fillRect(0, y0, W, 2);
  const list = JG.players.slice().sort((a, b) => (b.id === JG.id) - (a.id === JG.id)), sw = 50, cap = Math.max(1, Math.floor((W - 8) / sw)), show = list.length > cap ? list.slice(0, cap - 1) : list;
  JG.pos.clear();
  show.forEach((p, i) => {
    const cx = 4 + sw * i + sw / 2, base = y0 + 33, held = JG.G && JG.G.groups.some(q => q.by === p.id) || (p.id === JG.id && JG.G && JG.G.held);
    if (p.id === JG.id) { g.fillStyle = 'rgba(242,198,64,.5)'; g.fillRect(cx - sw / 2 + 2, y0 + 4, sw - 4, JG_STRIP - 6); }
    const em = JG.emo.get(p.id), ea = em ? JG.t - em.t0 : 99, hop = em && ea < HL_EMO_SEC && (em.k === 2 || em.k === 3 || em.k === 4) ? -Math.abs(Math.sin(JG.t * 9)) * 4 : 0;
    hlDrawFig(g, p, cx, base + hop, .2, 1, !!held, JG.t);
    let ns = 9; const label = p.name; g.font = `700 ${ns}px ${hlSans}`; while (ns > 6.5 && g.measureText(label).width > sw - 4) { ns -= .5; g.font = `700 ${ns}px ${hlSans}`; }
    hlText(g, label, cx, y0 + JG_STRIP - 7, ns, { f: hlSans, w: p.id === JG.id ? 900 : 700, o: false });
    if (held) { g.fillStyle = '#2f6a4c'; g.beginPath(); g.arc(cx + sw / 2 - 8, y0 + 9, 3.2, 0, 6.283); g.fill(); }
    JG.pos.set(p.id, { cx, top: y0 + 4 });
  });
  if (show.length < list.length) hlText(g, `+${list.length - show.length}`, 4 + sw * show.length + sw / 2, y0 + 26, 14, { w: 900, o: false });
}
function jgBubbles(g, W, hh) {
  if (HL.chatOff) return;
  const live = []; for (const [id, c] of JG.chat) { const age = JG.t - c.t0; if (age > HL_CHAT_SEC) { JG.chat.delete(id); continue; } const pos = JG.pos.get(id); if (pos) live.push({ c, pos, age }); }
  const size = 12, maxW = Math.min(150, W - 16); g.font = `600 ${size}px ${hlSans}`;
  for (const o of live) { let lines = hlWrap(g, o.c.s, maxW - 14, size, 600); if (lines.length > 3) lines = lines.slice(0, 3); o.lines = lines; o.w = Math.min(maxW, Math.max(...lines.map(l => g.measureText(l).width)) + 14); o.h = lines.length * (size + 3) + 10; o.x = Math.max(6, Math.min(W - o.w - 6, o.pos.cx - o.w / 2)); o.y = o.pos.top - o.h - 6; }
  const placed = [];
  for (const o of live.slice().sort((p, q) => p.pos.cx - q.pos.cx)) { for (let k = 0; k < 8; k++) { const hit = placed.find(p => o.x < p.x + p.w + 3 && p.x < o.x + o.w + 3 && o.y < p.y + p.h + 3 && p.y < o.y + o.h + 3); if (!hit) break; o.y = hit.y - o.h - 4; } placed.push(o); }
  live.sort((p, q) => q.age - p.age);
  for (const o of live) { const { x, y, w, h, pos, age } = o, tx = Math.max(x + 9, Math.min(x + w - 9, pos.cx)); g.globalAlpha = Math.min(1, (HL_CHAT_SEC - age) * 2, age * 6 + .2); hlPlate(g, x, y, w, h, '#ffffff', HL_INK, 8); g.beginPath(); g.moveTo(tx - 5, y + h - 1); g.lineTo(tx, y + h + 6); g.lineTo(tx + 5, y + h - 1); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 2; g.strokeStyle = HL_INK; g.beginPath(); g.moveTo(tx - 5, y + h); g.lineTo(tx, y + h + 6); g.lineTo(tx + 5, y + h); g.stroke(); o.lines.forEach((l, i) => hlText(g, l, x + w / 2, y + 5 + size / 2 + i * (size + 3) + 1, size, { f: hlSans, w: 600, o: false })); g.globalAlpha = 1; }
  for (const [id, e] of JG.emo) {
    const age = JG.t - e.t0; if (age > HL_EMO_SEC) { JG.emo.delete(id); continue; } const pos = JG.pos.get(id); if (!pos) continue;
    const pop = Math.min(1, age * 8), r = 15 * (.6 + .4 * pop), cx = Math.max(20, Math.min(W - 20, pos.cx)), cy = pos.top - 18 - (JG.chat.has(id) ? 34 : 0);
    g.globalAlpha = Math.min(1, (HL_EMO_SEC - age) * 2); g.beginPath(); g.arc(cx, cy, r + 3, 0, 6.283); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = HL_INK; g.stroke(); hlEmoteFace(g, e.k, cx, cy, r - 1); g.globalAlpha = 1;
  }
}
function jgTray(g, W) {
  JG.trayBtns = []; if (!JG.tray) return;
  const n = 6, gap = 7, bs = Math.min(48, (W - 36 - gap * (n - 1)) / n), tw = bs * n + gap * (n - 1), x0 = (W - tw) / 2, y = 60, wait = performance.now() - HL.emoAt < 2200;
  hlPlate(g, x0 - 10, y - 4, tw + 20, bs + 30, '#f2ecde', HL_INK, 14);
  for (let k = 0; k < n; k++) {
    const x = x0 + k * (bs + gap); g.globalAlpha = wait ? .5 : 1; hlEmoteFace(g, k, x + bs / 2, y + bs / 2 - 2, bs / 2 - 3); g.globalAlpha = 1;
    hlText(g, HL_EMO_NAME[k], x + bs / 2, y + bs + 10, 10.5, { f: hlSans, w: 600, o: false });
    JG.trayBtns.push({ x: x - 2, y: y - 2, w: bs + 4, h: bs + 26, down: () => { if (performance.now() - HL.emoAt < 2200) return; HL.emoAt = performance.now(); JG_NET.send({ t: 'emote', k }); AU.pluck(88); } });
  }
}
function jgEye(g, cx, cy, on) {
  g.beginPath(); g.arc(cx, cy, 16, 0, 6.283); g.fillStyle = on ? '#f6e3a0' : '#f2ecde'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = HL_INK; g.stroke();
  g.beginPath(); g.ellipse(cx, cy, 9, 5.5, 0, 0, 6.283); g.stroke(); g.beginPath(); g.arc(cx, cy, 2.6, 0, 6.283); g.fillStyle = HL_INK; g.fill();
}
// RENAME (owner, 2026-10-24: "thêm tính năng đổi tên, đổi tên ở đây cũng đổi tên khắp nơi, kể cả chương 4"): it edits the one name of the game, the Hồ sơ name (dcc.hoso), exactly as the Hồ sơ tab saves it
// (clean, bad words refused, pushed to the server), so Hội Làng, the rich list of chương IV and every print use it; the open room is told ({t:'name'}) so the strip shows it at once.
let JG_REN_EL = null;
function jgRenameClose() { if (JG_REN_EL) { JG_REN_EL.remove(); JG_REN_EL = null; } }
function jgRenameOpen() {
  if (JG_REN_EL) { jgRenameClose(); return; }
  JG.ui = null;
  const el = document.createElement('div'), touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window), max = HS_NAME_MAX, cur = hsName(hsMine());
  el.style.cssText = 'position:fixed;left:0;right:0;' + (touch ? 'top:0;border-bottom:2px solid #1d1915;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;' : 'bottom:0;border-top:2px solid #1d1915;padding:8px 10px;') + 'z-index:60;background:#f2ecde;display:flex;gap:8px;align-items:center;font-family:inherit';
  el.innerHTML = '<input id="jgRenIn" type="text" maxlength="' + max + '" autocomplete="off" placeholder="' + lg('Tên mới (tối đa ' + max + ' chữ)', 'New name (up to ' + max + ' letters)') + '" style="flex:1;min-width:0;font-size:16px;padding:9px 11px;border:2px solid #1d1915;background:#fbf6ea;border-radius:6px"><button id="jgRenOk" style="font-size:15px;padding:9px 14px;border:2px solid #1d1915;background:#e9b9ae;border-radius:6px;font-weight:700">' + lg('Lưu', 'Save') + '</button><button id="jgRenNo" style="font-size:15px;padding:9px 12px;border:2px solid #1d1915;background:#f2ecde;border-radius:6px">' + lg('Thôi', 'Cancel') + '</button>';
  document.body.appendChild(el); JG_REN_EL = el;
  const inp = el.querySelector('#jgRenIn'); inp.value = cur; inp.focus(); inp.select();
  const save = () => {
    const v = inp.value.replace(/\s+/g, ' ').trim().slice(0, max);
    if (v.length < 2) { toast(lg('Tên phải có ít nhất 2 chữ.', 'A name needs at least 2 letters.'), 2.4); return; }
    if (p4HoaBad(v)) { toast(lg('Tên có chữ không đẹp, chọn tên khác nhé.', 'That name has a bad word, pick another.'), 2.8); return; }
    const old = hsGet('dcc.hoso', {}) || {}, d = hsClean({ ...hsMine(), name: v });
    hsSet('dcc.hoso', { ...d, id: old.id, shop: undefined, stats: undefined }); HS_FACE.clear();
    hsPush().catch(() => {}); JG_NET.send({ t: 'name', s: v }); try { if (typeof c4RankSend === 'function') c4RankSend(); } catch (e) {}
    jgRenameClose(); toast(lg('Đã đổi tên thành ' + v + ' ở mọi nơi', 'Renamed to ' + v + ' everywhere'), 2.8);
  };
  el.querySelector('#jgRenOk').addEventListener('click', save); el.querySelector('#jgRenNo').addEventListener('click', jgRenameClose);
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') save(); else if (e.key === 'Escape') jgRenameClose(); });
}
function jgFlag(g, cx, cy) {
  g.beginPath(); g.arc(cx, cy, 16, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = HL_INK; g.stroke();
  g.beginPath(); g.moveTo(cx - 5, cy + 9); g.lineTo(cx - 5, cy - 9); g.stroke();
  g.beginPath(); g.moveTo(cx - 5, cy - 9); g.lineTo(cx + 8, cy - 5); g.lineTo(cx - 5, cy); g.closePath(); g.fillStyle = '#a3332a'; g.fill(); g.stroke();
}
// report a player (owner, 2026-10-24): the people in the room, tap one, confirm; three different networks reporting kicks the player for good (the server counts)
function jgReport(g, W, hh) {
  const w = Math.min(W - 20, 460), x = (W - w) / 2, y = 56, h = hh - y - JG_STRIP - 10, rowH = 34, sub = { f: hlSans, w: 600, o: false };
  g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(0, 0, W, hh); hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 14);
  hlText(g, lg('Báo cáo người chơi', 'Report a player'), W / 2, y + 22, 17, { w: 900 });
  const close = () => { JG.ui = null; JG.repPick = null; };
  hlText(g, lg('‹ đóng', '‹ close'), x + w - 44, y + h - 14, 12, { f: hlSans, w: 700, o: false, c: '#a3332a' }); JG.btns.push({ x: x + w - 90, y: y + h - 30, w: 90, h: 30, down: close });
  const pk = JG.repPick;
  if (pk) {
    hlText(g, lg('Báo cáo "' + pk.name + '" vì gian lận?', 'Report "' + pk.name + '" for cheating?'), W / 2, y + 74, 14, { ...sub, w: 800 });
    hlText(g, lg('Nhiều người báo cáo thì người đó bị đuổi ra.', 'If enough players report someone, they are kicked out.'), W / 2, y + 108, 11, { ...sub, al: .85 });
    hlPlate(g, W / 2 - 112, y + 146, 104, 36, '#e9b9ae', HL_INK, 8); hlText(g, lg('Báo cáo', 'Report'), W / 2 - 60, y + 165, 14, { f: hlSans, w: 800, o: false, c: '#7d1f17' });
    JG.btns.push({ x: W / 2 - 112, y: y + 146, w: 104, h: 36, down: () => { JG_NET.send({ t: 'report', id: pk.id }); close(); } });
    hlPlate(g, W / 2 + 8, y + 146, 104, 36, '#f2ecde', HL_INK, 8); hlText(g, lg('Thôi', 'Cancel'), W / 2 + 60, y + 165, 14, { f: hlSans, w: 800, o: false });
    JG.btns.push({ x: W / 2 + 8, y: y + 146, w: 104, h: 36, down: () => { JG.repPick = null; } });
    return;
  }
  const others = JG.players.filter(p => p.id !== JG.id);
  hlText(g, others.length ? lg('Chạm vào tên người bạn nghi gian lận', 'Tap the name of the player you suspect') : lg('Chưa có ai khác trong phòng', 'Nobody else is in the room'), W / 2, y + 46, 12, { ...sub, al: .85 });
  const ly0 = y + 62, ly1 = y + h - 40, maxScroll = Math.max(0, others.length * rowH - (ly1 - ly0)); JG.bscroll = Math.max(0, Math.min(maxScroll, JG.bscroll)); JG.barea = { x, y: ly0, w, h: ly1 - ly0 };
  g.save(); g.beginPath(); g.rect(x + 2, ly0, w - 4, ly1 - ly0); g.clip();
  JG.repRows = [];
  others.forEach((p, i) => { const ry = ly0 + i * rowH - JG.bscroll; if (ry < ly0 - rowH || ry > ly1) return; hlPlate(g, x + 10, ry + 2, w - 20, rowH - 6, '#f6efdc', HL_INK, 7); hlText(g, p.name || '?', x + 24, ry + rowH / 2, 13, { ...sub, a: 'left', w: 700 }); hlText(g, '⚑', x + w - 28, ry + rowH / 2, 14, { ...sub, c: '#a3332a', w: 900 }); JG.repRows.push({ x: x + 10, y: Math.max(ry + 2, ly0), w: w - 20, h: Math.min(ry + rowH - 4, ly1) - Math.max(ry + 2, ly0), p }); });
  g.restore();
}
function jgBoard(g, W, hh) {
  const w = Math.min(W - 20, 560), x = (W - w) / 2, y = 56, h = hh - y - JG_STRIP - 10, rowH = 24;   // a tablet: the board stays a readable column in the middle, not the whole width (owner, 2026-10-20)
  g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(0, 0, W, hh); hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 14);
  hlText(g, lg('Bảng xếp hạng · mọi lúc', 'Leaderboard · all time'), W / 2, y + 22, 17, { w: 900 });
  hlText(g, '‹ đóng', x + w - 44, y + h - 14, 12, { f: hlSans, w: 700, o: false, c: '#a3332a' }); JG.btns.push({ x: x + w - 90, y: y + h - 30, w: 90, h: 30, down: () => { JG.ui = null; } });
  hlText(g, lg('✎ Đổi tên', '✎ Rename'), x + 50, y + h - 14, 12, { f: hlSans, w: 700, o: false, c: '#2f6a4c' }); JG.btns.push({ x: x + 8, y: y + h - 30, w: 100, h: 30, down: () => jgRenameOpen() });
  const sub = { f: hlSans, w: 600, o: false }, b = JG.board;
  if (!b) { hlText(g, 'Đang tải…', W / 2, y + 90, 14, sub); return; }
  const hy = y + 50; hlText(g, 'Hạng', x + 14, hy, 11, { ...sub, a: 'left', w: 800 }); hlText(g, 'Tên', x + 56, hy, 11, { ...sub, a: 'left', w: 800 }); hlText(g, 'Số mảnh đã ghép', x + w - 14, hy, 11, { ...sub, a: 'right', w: 800 });
  const ly0 = hy + 12, ly1 = y + h - 66, maxScroll = Math.max(0, b.top.length * rowH - (ly1 - ly0)); JG.bscroll = Math.max(0, Math.min(maxScroll, JG.bscroll)); JG.barea = { x, y: ly0, w, h: ly1 - ly0 };
  g.save(); g.beginPath(); g.rect(x + 2, ly0, w - 4, ly1 - ly0); g.clip();
  const row = (ry, pos, n, m, me) => { if (me) { g.fillStyle = 'rgba(242,198,64,.5)'; g.fillRect(x + 6, ry - 12, w - 12, rowH - 2); } hlText(g, String(pos), x + 14, ry, 12.5, { ...sub, a: 'left', w: 800 }); hlText(g, n || '?', x + 56, ry, 12.5, { ...sub, a: 'left', w: me ? 900 : 600 }); hlText(g, String(m), x + w - 14, ry, 12.5, { ...sub, a: 'right', w: 800, c: '#2f6a4c' }); };
  b.top.forEach((u, i) => { const ry = hy + 24 + i * rowH - JG.bscroll; if (ry < ly0 - 6 || ry > ly1 + 14) return; row(ry, i + 1, u.n, u.m, u.me); });
  g.restore();
  if (maxScroll > 0) { const th = Math.max(24, (ly1 - ly0) * (ly1 - ly0) / (b.top.length * rowH)), ty = ly0 + (ly1 - ly0 - th) * JG.bscroll / maxScroll; g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(x + w - 6, ty, 3, th); }
  const mi = b.top.findIndex(u => u.me), myRow = mi >= 0 ? hy + 24 + mi * rowH - JG.bscroll : null;
  if (b.me && b.me.m > 0 && (mi < 0 || myRow < ly0 || myRow > ly1)) row(ly1 + 14, b.me.pos || '–', 'Bạn', b.me.m, true);
  hlText(g, b.me && b.me.m > 0 ? `${b.total} người đã ghép được ít nhất 1 mảnh` : `Ghép được 1 mảnh là có tên trong bảng · ${b.total} người đã có`, W / 2, y + h - 56, 10.5, { ...sub, al: .75 });
  hlText(g, `Mỗi mảnh ghép thành công +${JG_COIN} đồng`, W / 2, y + h - 40, 10.5, { ...sub, al: .75 });
}

// the list of prints: the picture, its name, how many pieces, how far it is and who is joining now (a tap opens it)
function jgGallery(g, W, hh) {
  g.fillStyle = 'rgba(242,236,222,.55)'; g.fillRect(0, 0, W, 56);
  hlText(g, '‹', 28, 28, 34, { w: 900 }); hlText(g, lg('Ghép Tranh', 'Print Puzzles'), 56, 28, 18, { w: 900, a: 'left' });
  const w = Math.min(W - 24, 540), x = (W - w) / 2, cardH = 132, gap = 14, y0 = 72, endY = y0 + jgShown().length * (cardH + gap);
  JG.gscroll = Math.max(0, Math.min(Math.max(0, endY - hh + 8), JG.gscroll));
  g.save(); g.beginPath(); g.rect(0, 56, W, hh - 56); g.clip();
  jgShown().forEach((pz, i) => {
    const y = y0 + i * (cardH + gap) - JG.gscroll, info = JG.list[pz.id], total = pz.cols * pz.rows, fin = !!(info && (info.done || info.archive || (info.left === 0 && info.joined > 0)));
    if (y > hh || y + cardH < 56) return;
    hlPlate(g, x, y, w, cardH, '#f2ecde', HL_INK, 14);
    const im = JG.thumbs[pz.id], tw0 = Math.min(170, w * .42), th = Math.min(tw0 * pz.pic.h / pz.pic.w, cardH - 16), tw = th * pz.pic.w / pz.pic.h, tx = x + 12, ty = y + (cardH - th) / 2;
    if (im) g.drawImage(im, tx, ty, tw, th); else { g.fillStyle = 'rgba(29,25,21,.12)'; g.fillRect(tx, ty, tw, th); }
    g.lineWidth = 2; g.strokeStyle = HL_INK; g.strokeRect(tx, ty, tw, th);
    const lx = tx + tw + 14, lw = x + w - 14 - lx, sub = { f: hlSans, w: 700, o: false, a: 'left' };
    hlText(g, lg(pz.pic.vi, pz.pic.en), lx, y + 30, lw < 170 ? 15.5 : 17, { w: 900, a: 'left' });
    hlText(g, `${total} ${lg('mảnh', 'pieces')}`, lx, y + 54, 13, sub);
    if (!info) hlText(g, lg('Đang tải…', 'Loading…'), lx, y + 78, 12.5, { ...sub, al: .7 });
    else if (fin) {   // finished: who and how long, one line each (no "finished" text: it overflowed the card on a phone)
      if (info.players) hlText(g, `${info.players} ${lg('người ghép', 'players')}`, lx, y + 82, 14, { ...sub, c: '#2f6a4c' });
      if (info.took > 0) hlText(g, jgDur(info.took), lx, y + 106, 14, { ...sub, c: HL_INK });
      else if (!info.players) hlText(g, lg('Đã ghép xong', 'Finished'), lx, y + 82, 13, { ...sub, c: '#2f6a4c' });
    }
    else {
      hlText(g, `${info.n || 0} ${lg('người đang ghép', 'joining now')}`, lx, y + 78, 12.5, { ...sub, c: '#a3332a' });
      const bw = Math.max(40, lw), pct = Math.max(0, Math.min(1, (info.joined || 0) / total)); g.fillStyle = 'rgba(29,25,21,.15)'; g.fillRect(lx, y + 92, bw, 8); g.fillStyle = '#2f6a4c'; g.fillRect(lx, y + 92, bw * pct, 8); g.lineWidth = 1.5; g.strokeStyle = HL_INK; g.strokeRect(lx, y + 92, bw, 8);
      hlText(g, `${info.joined || 0}/${total}` + (info.players ? ` · ${info.players} ${lg('người đã ghép', 'have joined in')}` : ''), lx, y + 114, 11, { ...sub, al: .75 });
    }
    JG.btns.push({ x, y: Math.max(56, y), w, h: cardH, down: () => jgOpen(pz) });
  });
  g.restore();
}
// the reminder to a player who carries a group somebody wants, and short notes
function jgHoldNote(g, W, G) {
  let line = null, big = false;
  if (JG.nudge) { if (!G || !G.held || G.held.id !== JG.nudge.g) JG.nudge = null; else { const left = Math.max(0, Math.ceil(JG.nudge.until - JG.t)); line = lg(`Có người đang chờ mảnh này, đừng giữ lâu quá nhé! Đặt xuống trong ${left} giây.`, `Someone is waiting for this piece: do not hold it long! Put it down within ${left} s.`); big = true; } }
  if (!line && JG.note && JG.t - JG.note.t0 < 3.5) line = JG.note.s;
  if (!line) return;
  const w = Math.min(W - 24, 440), x = (W - w) / 2, y = 62, h = big ? 54 : 40;
  hlPlate(g, x, y, w, h, big ? '#fbe3d2' : '#f2ecde', big ? '#a3332a' : HL_INK, 12);
  const words = line.split(' '), lines = [''];
  for (const wd of words) { const t = (lines[lines.length - 1] + ' ' + wd).trim(); if (t.length > (W < 420 ? 34 : 50) && lines[lines.length - 1]) lines.push(wd); else lines[lines.length - 1] = t; }
  lines.slice(0, 2).forEach((s, k, a) => hlText(g, s, W / 2, y + h / 2 + (k - (a.length - 1) / 2) * 17, 13.5, { f: hlSans, w: 700, o: false, c: big ? '#a3332a' : HL_INK }));
}
function renderJG() {
  const W = cv.width / DPR, H = cv.height / DPR, st = JG.st = safeTop(), g = ctx, hh = H - st, G = JG.G;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPERS.yellow.base; g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) g.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  g.save(); g.translate(0, st); JG.btns = [];
  if (!JG.pz) { jgGallery(g, W, hh); g.restore(); return; }
  const L = JG.L, up = JG.conn === 'up';
  if (G) { c9Draw(G, g, W, hh); c9DrawTurnBtn(G, g); }
  // the top bar: back, the title and how far the print is, then four round buttons (sample, face, chat, cup)
  g.fillStyle = 'rgba(242,236,222,.55)'; g.fillRect(0, 0, W, 56);
  hlText(g, '‹', 28, 28, 34, { w: 900 }); hlText(g, lg(L.pic.vi, L.pic.en), 56, 20, 16, { w: 900, a: 'left' });
  hlText(g, G ? `${JG.joinedN}/${L.cols * L.rows} · ${JG.players.length} ${lg('người', 'people')}` : '', 56, 41, 11, { f: hlSans, w: 600, o: false, al: .8, a: 'left' });
  const cy = 28, X = [W - 20, W - 56, W - 92, W - 128, W - 164];
  if (G) { jgEye(g, X[4], cy, !!G.sv); JG.btns.push({ x: X[4] - 18, y: cy - 19, w: 36, h: 38, down: () => { c9SvToggle(G); } }); }
  if (up) { hlEmoteFace(g, 4, X[3], cy, 16); JG.btns.push({ x: X[3] - 18, y: cy - 19, w: 36, h: 38, down: () => { JG.tray = !JG.tray; } }); hlChatIcon(g, X[2], cy, HL.chatOff); JG.btns.push({ x: X[2] - 18, y: cy - 19, w: 36, h: 38, down: () => hlChatOpen() }); jgFlag(g, X[1], cy); JG.btns.push({ x: X[1] - 18, y: cy - 19, w: 36, h: 38, down: () => { JG.ui = 'report'; JG.repPick = null; JG.bscroll = 0; } }); }
  hlTrophy(g, X[0], cy); JG.btns.push({ x: X[0] - 18, y: cy - 19, w: 36, h: 38, down: () => { JG.ui = 'board'; JG.bscroll = 0; JG_NET.send({ t: 'board' }); } });
  if (!G) {
    hlText(g, JG.bad ? 'Bức tranh bị lỗi, hãy tải lại trang' : JG.conn === 'blocked' ? lg('Máy bạn tạm bị chặn vì bấm quá nhanh. Đợi ít phút rồi vào lại nhé.', 'Your device is blocked for a while for tapping too fast. Come back in a few minutes.') : JG.conn === 'reported' ? lg('Bạn đã bị nhiều người chơi báo cáo nên không vào lại được nữa.', 'Several players reported you, so you can not come back.') : JG.conn === 'crowded' ? lg('Có quá nhiều máy cùng mạng với bạn đang mở bức tranh. Đóng bớt rồi vào lại nhé.', 'Too many devices on your network have the print open. Close some and come back.') : JG.conn === 'replaced' ? lg('Bức tranh đang mở ở một cửa sổ khác của bạn. Đóng bên kia rồi vào lại.', 'The print is open in another window of yours. Close it and come back.') : JG.conn === 'down' ? lg('Mất kết nối, đang nối lại…', 'Connection lost, reconnecting…') : lg('Đang mở bức tranh chung…', 'Opening the shared print…'), W / 2, hh / 2, 18);
  } else {
    if (!G.sv) for (const b of jgZoomBtns(G)) { g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.stroke(); hlText(g, b.t, b.x, b.y + 1, b.k === 'fit' ? 15 : 22, { f: "'Inter', system-ui, sans-serif", w: 800, o: false }); }
    if (G.done) {
      const w = Math.min(340, W - 28), x = (W - w) / 2, h = 96, y = hh - JG_STRIP - h - 10, a = Math.min(1, G.win * 2);
      g.globalAlpha = a; hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 16);
      hlText(g, lg('Cả làng ghép xong rồi!', 'Everyone finished it!'), W / 2, y + 30, 21, { w: 900, c: '#a3332a', o: false });
      hlText(g, lg('Bức tranh này đã hoàn thành', 'This print is finished'), W / 2, y + 62, 13, { f: hlSans, w: 600, o: false });
      g.globalAlpha = 1;
      for (const p of JG.conf) { g.fillStyle = p.c; g.fillRect(p.x, p.y, p.r, p.r * 1.6); }
    }
  }
  if (up) jgStrip(g, W, hh);
  jgBubbles(g, W, hh);
  jgHoldNote(g, W, G);
  if (JG.flash && JG.t - JG.flash.t0 < 1.6) { const k = (JG.t - JG.flash.t0) / 1.6; g.globalAlpha = Math.min(1, (1 - k) * 2); hlText(g, `+${JG.flash.n} đồng`, W / 2, hh - JG_STRIP - 18 - k * 40, 22, { w: 900, c: '#2f6a4c' }); g.globalAlpha = 1; }
  jgTray(g, W);
  if (JG.ui === 'board') jgBoard(g, W, hh);
  else if (JG.ui === 'report') jgReport(g, W, hh);
  g.restore();
}

/* ---------- input ---------- */
function jgPos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top - JG.st]; }
const jgIn = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
function jgDown(e) {
  if (S.mode !== 'jgplay') return; JG.touch = e.pointerType !== 'mouse'; const [x, y] = jgPos(e), G = JG.G;
  if (x < 52 && y < 56) { if (JG.ui) JG.ui = null; else if (JG.pz) jgBack(); else jgLeave(); return; }
  if (JG.tray) { const tb = JG.trayBtns.find(b => jgIn(b, x, y)); JG.tray = false; if (tb) tb.down(e); return; }
  for (const b of JG.btns) if (jgIn(b, x, y)) { b.down(e); return; }
  if (!JG.pz) { JG.drag = { y, s: JG.gscroll, gal: true }; return; }
  if (JG.ui === 'board' || JG.ui === 'report') { if (JG.barea && jgIn(JG.barea, x, y)) JG.drag = { y, x, s: JG.bscroll, rep: JG.ui === 'report', moved: false }; else { JG.ui = null; JG.repPick = null; } return; }
  if (!G) return;
  if (G.sv) { capturePointer(e); c9SvDown(G, x, y, e); return; }   // the sample print is open: it takes the pointer
  if (y > G.lh - JG_STRIP) return;
  for (const b of jgZoomBtns(G)) if (Math.hypot(x - b.x, y - b.y) < b.r + 6) { if (b.k === 'in') c9Zoom(G, 1.5, G.lw / 2, (G.lh + G.top) / 2); else if (b.k === 'out') c9Zoom(G, 1 / 1.5, G.lw / 2, (G.lh + G.top) / 2); else { G.cam.z = G.zmin; c9ClampCam(G); } return; }
  if (y < 56) return;
  capturePointer(e); c9Down(G, x, y, e, () => {});
}
function jgMove(e) {
  if (S.mode !== 'jgplay') return; const [x, y] = jgPos(e);
  if (JG.drag) { if (Math.abs(y - JG.drag.y) > 6) JG.drag.moved = true; if (JG.drag.gal) JG.gscroll = JG.drag.s - (y - JG.drag.y); else JG.bscroll = JG.drag.s - (y - JG.drag.y); return; }
  if (JG.G && JG.G.sv && !JG.ui) { c9SvMove(JG.G, x, y, e); return; }
  if (!JG.G || JG.ui) return; c9Move(JG.G, x, y, e); cv.style.cursor = JG.G.held ? 'grabbing' : JG.G.hover ? 'grab' : '';
}
function jgUp(e) { if (S.mode !== 'jgplay') return; if (JG.drag) { const d = JG.drag; JG.drag = null; if (d.rep && !d.moved && JG.ui === 'report') { const r = (JG.repRows || []).find(r => jgIn(r, d.x, d.y)); if (r) JG.repPick = { id: r.p.id, name: r.p.name || '?' }; } return; } if (!JG.G || JG.ui) return; const [x, y] = jgPos(e); if (JG.G.sv) { c9SvUp(JG.G, x, y, e); return; } c9PtrUp(JG.G, x, y, e, () => {}); }
cv.addEventListener('contextmenu', e => { if (S.mode === 'jgplay') e.preventDefault(); });
cv.addEventListener('touchstart', e => { if (S.mode === 'jgplay') { e.preventDefault(); const ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) ae.blur(); } }, { passive: false });   // no iPhone magnifier on a long press
cv.addEventListener('wheel', e => {
  if (S.mode !== 'jgplay') return; const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  if (!JG.pz) { JG.gscroll += d; e.preventDefault(); return; }
  if (JG.ui === 'board' || JG.ui === 'report') { JG.bscroll += d; e.preventDefault(); return; }
  if (JG.G && JG.G.sv) { const [sx, sy] = jgPos(e); c9SvWheel(JG.G, d, sx, sy); e.preventDefault(); return; }
  if (!JG.G) return; const [x, y] = jgPos(e); c9Wheel(JG.G, d, x, y, e.ctrlKey); e.preventDefault();
}, { passive: false });
function jgKey(e) {
  if (S.mode !== 'jgplay') return;
  if (e.code === 'Escape') { if (JG.G && JG.G.sv) JG.G.sv = null; else if (JG.ui) JG.ui = null; else if (JG.pz) jgBack(); else jgLeave(); return; }
  const G = JG.G; if (!G) return;
  if (e.code === 'Equal' || e.code === 'NumpadAdd') { c9Zoom(G, 1.25, G.lw / 2, (G.lh + G.top) / 2); return; } if (e.code === 'Minus' || e.code === 'NumpadSubtract') { c9Zoom(G, .8, G.lw / 2, (G.lh + G.top) / 2); return; }
  const grp = G.held; if (!grp) return;
  if (e.code === 'KeyR' || e.code === 'ArrowDown' || e.code === 'ArrowUp') { e.preventDefault(); c9TurnSmooth(G, grp, (e.shiftKey || e.code === 'ArrowUp' ? -1 : 1) * C9_STEP, null, null); }
}

registerChapter({
  id: 10, modes: ['jgplay'],
  card: { num: lg('Chương X', 'Chapter X'), han: '共拼', name: lg('Ghép Tranh', 'Print Puzzles'), desc: lg('Cả làng cùng ghép những bức tranh Đông Hồ. Mỗi mảnh ghép thành công được 10 đồng.', 'The whole village puts Đông Hồ prints together. Every piece you join earns 10 đồng.'), bg: '#e0d6bd' },
  progress: () => '',
  hasProgress: () => JG_SAVE.pieces > 0,
  direct: startJG,
  album() {},
  hide() { jgRenameClose(); if (JG_NET.wantOn) JG_NET.close(); cv.style.cursor = ''; },
  update: updateJG, render: renderJG, key: jgKey,
  pointer: { down: jgDown, move: jgMove, up: jgUp },
  next() { showChapters(); }, retry() { startJG(); },
});
