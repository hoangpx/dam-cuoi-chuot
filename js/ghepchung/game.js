/* Chương X · Ghép Chung 共拼 (owner, 2026-10-20: "làm giống chương hội làng: ai cũng vào ghép được, nhiều người ghép cùng lúc"): ONE jigsaw of
   1000 pieces (the big print of chương IX) shared by everybody. The server (server/phong-choi/src/jigsaw.js, class Jigsaw) keeps every
   group of pieces for good and decides who holds what and what joins; this file draws it with chương IX's engine (js/ghep/manh.js, its
   G.net hooks) and shows the others: the group someone lifts rises on every screen with their name, a join is seen by all.
   Each piece you join is worth 10 đồng (paid into chương IV's purse when the server says so). Small list of the people at the bottom,
   emotes and chat like Hội Làng (hlChatOpen with HL_CHAT_NET), and a board of all time: who has joined how many pieces (at least one). */
let JG_SAVE = { pieces: 0 };
try { const s = JSON.parse(localStorage.getItem('dcc.jg') || 'null'); if (s && typeof s.pieces === 'number') JG_SAVE = Object.assign(JG_SAVE, s); } catch (e) {}
const jgPersist = () => { try { localStorage.setItem('dcc.jg', JSON.stringify(JG_SAVE)); } catch (e) {} };

const JG = { G: null, im: null, welcome: null, id: null, players: [], conn: 'connecting', chat: new Map(), emo: new Map(), tray: false, trayBtns: [], btns: [], ui: null, board: null, bscroll: 0, drag: null, t: 0, flash: null, st: 0, mvT: 0, mvKey: '', doneAt: 0, conf: [], bad: false, pos: new Map(), joinedN: 0 };
const JG_LEVEL = { pic: { id: 'dcm', src: 'img/ch10/dam-cuoi-chuot.jpg', w: 3200, h: 2204, vi: 'Đám cưới chuột', en: 'The Mice’s Wedding' }, tier: 3, cols: 40, rows: 25, big: true };
const JG_STRIP = 50, JG_COIN = 10;

function startJG() {
  trackEnter('chuong-10'); AU.init(); AU.setSong(5); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 10; S.mode = 'jgplay';
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  const me = hsMine(), look = { role: me.role, age: me.age, body: me.body, fur: me.fur, robe: me.robe, skirt: me.skirt, pants: me.pants, top: me.top };
  Object.assign(JG, { G: null, welcome: null, id: null, players: [], conn: 'connecting', ui: null, board: null, tray: false, flash: null, conf: [], bad: false });
  JG.chat.clear(); JG.emo.clear(); hlChatClose(); HL_CHAT_NET = JG_NET;
  c9Img(JG_LEVEL.pic, im => { JG.im = im; jgBuild(); });
  JG_NET.open({ t: 'hello', dev: p4Device(), name: hsName(me), look }, jgMsg, s => { JG.conn = s; });
}
function jgLeave() { hlChatClose(); HL_CHAT_NET = null; JG_NET.close(); showChapters(); }

// the engine's view of the network: what to tell the server, the name tags
const JG_API = {
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
  const old = JG.G, W = cv.width / DPR, H = cv.height / DPR - JG.st, G = c9MakeGame(JG_LEVEL, JG.im, W, H, w.seed);
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
  else if (m.t === 'deny') c9NetDeny(G, m.g);
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
  if (JG.G) { c9Tick(JG.G, dt); JG.joinedN = JG.G.pieces.length - JG.G.groups.length; }
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
function jgBoard(g, W, hh) {
  const w = Math.min(W - 20, 560), x = (W - w) / 2, y = 56, h = hh - y - JG_STRIP - 10, rowH = 24;   // a tablet: the board stays a readable column in the middle, not the whole width (owner, 2026-10-20)
  g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(0, 0, W, hh); hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 14);
  hlText(g, lg('Bảng xếp hạng · mọi lúc', 'Leaderboard · all time'), W / 2, y + 22, 17, { w: 900 });
  hlText(g, '‹ đóng', x + w - 44, y + h - 14, 12, { f: hlSans, w: 700, o: false, c: '#a3332a' }); JG.btns.push({ x: x + w - 90, y: y + h - 30, w: 90, h: 30, down: () => { JG.ui = null; } });
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

function renderJG() {
  const W = cv.width / DPR, H = cv.height / DPR, st = JG.st = safeTop(), g = ctx, hh = H - st, G = JG.G;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPERS.yellow.base; g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) g.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  g.save(); g.translate(0, st); JG.btns = [];
  const L = JG_LEVEL, up = JG.conn === 'up';
  if (G) { c9Draw(G, g, W, hh); c9DrawTurnBtn(G, g); }
  // the top bar: back, the title and how far the print is, then four round buttons (sample, face, chat, cup)
  g.fillStyle = 'rgba(242,236,222,.55)'; g.fillRect(0, 0, W, 56);
  hlText(g, '‹', 28, 28, 34, { w: 900 }); hlText(g, lg('Ghép Tranh', 'Print Puzzle'), 56, 20, 16, { w: 900, a: 'left' });
  hlText(g, G ? `${JG.joinedN}/${L.cols * L.rows} ${lg('mảnh', 'pieces')} · ${JG.players.length} ${lg('người', 'people')}` : '', 56, 41, 11, { f: hlSans, w: 600, o: false, al: .8, a: 'left' });
  const cy = 28, X = [W - 22, W - 60, W - 98, W - 136];
  if (G) { jgEye(g, X[3], cy, G.peek > 0); JG.btns.push({ x: X[3] - 19, y: cy - 19, w: 38, h: 38, down: () => { G.peek = G.peek > 0 ? 0 : 4; } }); }
  if (up) { hlEmoteFace(g, 4, X[2], cy, 16); JG.btns.push({ x: X[2] - 19, y: cy - 19, w: 38, h: 38, down: () => { JG.tray = !JG.tray; } }); hlChatIcon(g, X[1], cy, HL.chatOff); JG.btns.push({ x: X[1] - 19, y: cy - 19, w: 38, h: 38, down: () => hlChatOpen() }); }
  hlTrophy(g, X[0], cy); JG.btns.push({ x: X[0] - 19, y: cy - 19, w: 38, h: 38, down: () => { JG.ui = 'board'; JG.bscroll = 0; JG_NET.send({ t: 'board' }); } });
  if (!G) {
    hlText(g, JG.bad ? 'Bức tranh bị lỗi, hãy tải lại trang' : JG.conn === 'down' ? lg('Mất kết nối, đang nối lại…', 'Connection lost, reconnecting…') : lg('Đang mở bức tranh chung…', 'Opening the shared print…'), W / 2, hh / 2, 18);
  } else {
    if (!G.done) for (const b of jgZoomBtns(G)) { g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.stroke(); hlText(g, b.t, b.x, b.y + 1, b.k === 'fit' ? 15 : 22, { f: "'Inter', system-ui, sans-serif", w: 800, o: false }); }
    if (G.done) {
      const frz = JG.welcome && JG.welcome.freeze, w = Math.min(340, W - 28), x = (W - w) / 2, h = frz ? 118 : 96, y = hh - JG_STRIP - h - 10, a = Math.min(1, G.win * 2), left = Math.max(0, Math.ceil(120 - (JG.t - JG.doneAt)));
      g.globalAlpha = a; hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 16);
      hlText(g, lg('Cả làng ghép xong rồi!', 'Everyone finished it!'), W / 2, y + 30, 21, { w: 900, c: '#a3332a', o: false }); if (frz) { hlText(g, lg('Đang làm tranh mới 10.000 mảnh', 'A new print of 10,000 pieces is being made'), W / 2, y + 62, 13, { f: hlSans, w: 700, o: false }); hlText(g, lg('Hẹn bạn sớm nhé!', 'See you soon!'), W / 2, y + 86, 13, { f: hlSans, w: 600, o: false }); }
      else hlText(g, `${lg('Bức tranh mới sau', 'A new print in')} ${left} ${lg('giây', 's')}`, W / 2, y + 62, 13, { f: hlSans, w: 600, o: false });
      g.globalAlpha = 1;
      for (const p of JG.conf) { g.fillStyle = p.c; g.fillRect(p.x, p.y, p.r, p.r * 1.6); }
    }
  }
  if (up) jgStrip(g, W, hh);
  jgBubbles(g, W, hh);
  if (JG.flash && JG.t - JG.flash.t0 < 1.6) { const k = (JG.t - JG.flash.t0) / 1.6; g.globalAlpha = Math.min(1, (1 - k) * 2); hlText(g, `+${JG.flash.n} đồng`, W / 2, hh - JG_STRIP - 18 - k * 40, 22, { w: 900, c: '#2f6a4c' }); g.globalAlpha = 1; }
  jgTray(g, W);
  if (JG.ui === 'board') jgBoard(g, W, hh);
  g.restore();
}

/* ---------- input ---------- */
function jgPos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top - JG.st]; }
const jgIn = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
function jgDown(e) {
  if (S.mode !== 'jgplay') return; JG.touch = e.pointerType !== 'mouse'; const [x, y] = jgPos(e), G = JG.G;
  if (x < 52 && y < 56) { if (JG.ui) JG.ui = null; else jgLeave(); return; }
  if (JG.tray) { const tb = JG.trayBtns.find(b => jgIn(b, x, y)); JG.tray = false; if (tb) tb.down(e); return; }
  for (const b of JG.btns) if (jgIn(b, x, y)) { b.down(e); return; }
  if (JG.ui === 'board') { if (JG.barea && jgIn(JG.barea, x, y)) JG.drag = { y, s: JG.bscroll }; else JG.ui = null; return; }
  if (!G || G.done) return;
  if (y > G.lh - JG_STRIP) return;
  for (const b of jgZoomBtns(G)) if (Math.hypot(x - b.x, y - b.y) < b.r + 6) { if (b.k === 'in') c9Zoom(G, 1.5, G.lw / 2, (G.lh + G.top) / 2); else if (b.k === 'out') c9Zoom(G, 1 / 1.5, G.lw / 2, (G.lh + G.top) / 2); else { G.cam.z = G.zmin; c9ClampCam(G); } return; }
  if (y < 56) return;
  capturePointer(e); c9Down(G, x, y, e, () => {});
}
function jgMove(e) {
  if (S.mode !== 'jgplay') return; const [x, y] = jgPos(e);
  if (JG.drag) { JG.bscroll = JG.drag.s - (y - JG.drag.y); return; }
  if (!JG.G || JG.ui) return; c9Move(JG.G, x, y, e); cv.style.cursor = JG.G.held ? 'grabbing' : JG.G.hover ? 'grab' : '';
}
function jgUp(e) { if (S.mode !== 'jgplay') return; if (JG.drag) { JG.drag = null; return; } if (!JG.G || JG.ui) return; const [x, y] = jgPos(e); c9PtrUp(JG.G, x, y, e, () => {}); }
cv.addEventListener('contextmenu', e => { if (S.mode === 'jgplay') e.preventDefault(); });
cv.addEventListener('wheel', e => {
  if (S.mode !== 'jgplay') return; const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  if (JG.ui === 'board') { JG.bscroll += d; e.preventDefault(); return; }
  if (!JG.G || JG.G.done) return; const [x, y] = jgPos(e); c9Wheel(JG.G, d, x, y, e.ctrlKey); e.preventDefault();
}, { passive: false });
function jgKey(e) {
  if (S.mode !== 'jgplay') return;
  if (e.code === 'Escape') { if (JG.ui) JG.ui = null; else jgLeave(); return; }
  const G = JG.G; if (!G || G.done) return;
  if (e.code === 'Equal' || e.code === 'NumpadAdd') { c9Zoom(G, 1.25, G.lw / 2, (G.lh + G.top) / 2); return; } if (e.code === 'Minus' || e.code === 'NumpadSubtract') { c9Zoom(G, .8, G.lw / 2, (G.lh + G.top) / 2); return; }
  const grp = G.held; if (!grp) return;
  if (e.code === 'KeyR' || e.code === 'ArrowDown' || e.code === 'ArrowUp') { e.preventDefault(); const c = c9Centroid(G, grp); c9Turn(G, grp, (e.shiftKey || e.code === 'ArrowUp' ? -1 : 1) * C9_STEP, G.px === undefined ? c[0] : G.px, G.py === undefined ? c[1] : G.py); }
}

// the chapter card shows how far the shared print is and who is in it (asked at most every 20 s while the list is up)
const JGON = { n: null, joined: 0, at: 0, busy: false, freeze: false };
function jgOnlineText() { if (JGON.freeze) return lg('Ghép tranh chung · đang làm tranh mới 10.000 mảnh', 'Shared puzzle · a new 10,000-piece print is on its way'); return JGON.n === null ? lg('Đang xem bức tranh…', 'Checking the print…') : lgf('Ghép tranh chung · {n} người đang ghép', 'Shared puzzle · {n} joining now', { n: JGON.n }); }
function jgOnlineAsk() {
  if (JGON.busy || Date.now() - JGON.at < 20000) return; JGON.busy = true; JGON.at = Date.now();
  fetch(JG_ONLINE_URL).then(r => r.json()).then(j => {
    JGON.freeze = !!j.freeze; JGON.n = Math.max(0, +j.n || 0); JGON.joined = Math.max(0, +j.joined || 0);
    const card = [...document.querySelectorAll('#chapCards .card')].find(b => (b.querySelector('.ch') || {}).textContent === '共拼'), st = card && card.querySelector('.st');
    if (st) st.textContent = jgOnlineText();
  }).catch(() => {}).then(() => { JGON.busy = false; });
}
registerChapter({
  id: 10, modes: ['jgplay'],
  card: { num: lg('Chương X', 'Chapter X'), han: '共拼', name: lg('Ghép Tranh', 'Print Puzzle'), desc: lg('Cả làng cùng ghép bức tranh Đám cưới chuột một nghìn mảnh. Mỗi mảnh ghép thành công được 10 đồng.', 'The whole village puts one thousand-piece print together. Every piece you join earns 10 đồng.'), bg: '#e0d6bd' },
  progress: () => { jgOnlineAsk(); return jgOnlineText(); },
  hasProgress: () => JG_SAVE.pieces > 0,
  direct: startJG,
  album() {},
  hide() { if (JG_NET.wantOn) JG_NET.close(); cv.style.cursor = ''; },
  update: updateJG, render: renderJG, key: jgKey,
  pointer: { down: jgDown, move: jgMove, up: jgUp },
  next() { showChapters(); }, retry() { startJG(); },
});
