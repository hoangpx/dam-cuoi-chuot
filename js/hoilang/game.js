/* Chương IX · Hội Làng 會村 (owner, 2026-10-19): one shared room that runs all day; whoever opens the chapter sits in the
   grid with everyone else and plays the round in progress or waits for the next. The server (server/phong-choi, Cloudflare
   Durable Object) keeps the clock, the schedule, the bots and the results; this file draws the grid and the two games:
     'ten'    a clock counts 0..3 s then is hidden; press when you think 10,000 s is up; nearest wins 10 đồng × players.
     'pomelo' every player has a pomelo on a rope falling on their head, faster and faster; press to stop it; the nearest
              to the head without being hit wins. Everyone sees everyone's pomelo fall and stop live.
   Prizes go into chương IV's purse (SAVE4.money), never real money. Animations are drawn from the server clock
   (HL_NET.now()) and the round's t0 / fall times, so only the presses travel over the network. */

let HL_SAVE = { sort: -1, rounds: 0, wins: 0, earned: 0 };
try { const s = JSON.parse(localStorage.getItem('dcc.hl') || 'null'); if (s && typeof s.rounds === 'number') HL_SAVE = Object.assign(HL_SAVE, s); } catch (e) {}
const hlPersist = () => { try { localStorage.setItem('dcc.hl', JSON.stringify(HL_SAVE)); } catch (e) {} };

const HL = { win: null, fw: [], id: null, players: [], round: null, conn: 'connecting', paid: 0, flash: null, press: null, t: 0, hit: [] };

function startHL() {
  trackEnter('chuong-9'); AU.init(); AU.setSong(10); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 9; S.mode = 'hlplay';
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  PAPER = getPaper('sage'); document.documentElement.style.setProperty('--paper', PAPERS.sage.css);
  if (HL_SAVE.sort < 0) { HL_SAVE.sort = (Math.random() * 27) | 0; hlPersist(); }
  let name = ''; try { name = hsMine().name || ''; } catch (e) {}
  if (!name) name = 'Chuột ' + ((Math.random() * 90 + 10) | 0);
  HL.id = null; HL.players = []; HL.round = null; HL.paid = 0; HL.press = null; HL.flash = null; HL.conn = 'connecting';
  HL_NET.open({ t: 'hello', name, sort: HL_SAVE.sort }, hlMsg, s => { HL.conn = s; });
}
function hlLeave() { HL_NET.close(); showChapters(); }

/* ---------- messages from the room ---------- */
function hlMsg(m) {
  if (m.t === 'welcome') { HL.id = m.id; HL.players = m.players; HL.round = m.round ? hlRound(m.round) : null; }
  else if (m.t === 'players') HL.players = m.players;
  else if (m.t === 'round') { HL.round = hlRound(m); HL.press = null; HL.flash = null; HL.win = null; HL.fw = []; AU.pluck(84); }
  else if (m.t === 'press') { const r = HL.round; if (r && r.n === m.n) { r.press.set(m.id, { p: m.p, hit: !!m.hit }); if (m.id !== HL.id) AU.tap(); } }
  else if (m.t === 'result') hlResult(m);
}
// the server's seated list holds people only; the bots (flagged in the players list) always play
const hlSeated = (r, p) => r.seated.has(p.id) || p.bot;
function hlRound(m) {
  const r = { n: m.n, game: m.game, announce: m.announce, t0: m.t0, state: m.state, seated: new Set(m.seated), tf: m.tf || {}, press: new Map(), result: null };
  for (const p of m.presses || []) r.press.set(p.id, { p: p.p, hit: !!p.hit });
  if (m.result) r.result = m.result;
  return r;
}
function hlResult(m) {
  const r = HL.round; if (!r || r.n !== m.n) return;
  r.state = 'result'; r.result = m; r.next = m.next; r.rank = new Map(m.rows.map(x => [x.id, x]));
  const mine = r.seated.has(HL.id);
  if (mine) { HL_SAVE.rounds++; if (m.winner === HL.id) { HL_SAVE.wins++; HL_SAVE.earned += m.prize; } hlPersist(); }
  if (m.winner === HL.id && m.prize > 0 && HL.paid !== m.n) {
    HL.paid = m.n; SAVE4.money += m.prize; try { persist4(); } catch (e) {}
    toast(`Bạn thắng ván này! +${m.prize} đồng vào túi`, 3.2); AU.drumHit(); trackWin();
  } else if (m.winner) AU.plop();
  HL.hit = []; hlWinStart(m, r);
}

/* ---------- the winner's fireworks (owner, 2026-10-19): bursts over the grid and a banner with the name, the result and the prize ---------- */
const HL_FW_COL = ['#a3332a', '#f2c640', '#2f6a4c', '#f2ecde', '#d98a7c', '#3f8a86'];
const HL_FW_SHOW = 5.2;   // seconds the banner stays
function hlWinStart(m, r) {
  const win = HL.players.find(p => p.id === m.winner), row = m.rows.find(x => x.id === m.winner);
  if (!win || !row) { HL.win = null; return; }
  const ten = r.game === 'ten', mine = m.winner === HL.id;
  HL.win = { t0: HL.t, name: win.name + (win.bot ? ' (máy)' : ''), mine, bot: win.bot, text: ten ? `bấm lúc ${hlTime(T_TARGET + row.v)}` : `cách đầu ${hlMm(row.v)}`, prize: 10 * m.N, got: m.prize > 0, bursts: mine ? [0, .25, .6, 1, 1.4, 1.9, 2.5, 3.2] : [0, .5, 1.1, 1.8, 2.6], next: 0 };
  HL.fw = [];
}
function hlFireworks(dt) {
  const w = HL.win; if (!w) return;
  const e = HL.t - w.t0;
  while (w.next < w.bursts.length && e >= w.bursts[w.next]) {   // a rocket goes off
    w.next++; const W = innerWidth, H = innerHeight, x = W * (.15 + Math.random() * .7), y = H * (.18 + Math.random() * .3), col = HL_FW_COL[(Math.random() * HL_FW_COL.length) | 0], col2 = HL_FW_COL[(Math.random() * HL_FW_COL.length) | 0], n = 34;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + Math.random() * .2, sp = 90 + Math.random() * 130; HL.fw.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.1 + Math.random() * .7, t: 0, c: i % 3 ? col : col2, r: 3 + Math.random() * 2.4 }); }
    AU.tap(); if (w.next % 2) AU.pluck(88 + w.next * 2);
  }
  for (const p of HL.fw) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.vx *= .985; }
  HL.fw = HL.fw.filter(p => p.t < p.life);
  if (e > HL_FW_SHOW && !HL.fw.length) HL.win = null;
}
function hlWinDraw(g, W, H) {
  const w = HL.win; if (!w) return;
  const e = HL.t - w.t0;
  for (const p of HL.fw) { const a = 1 - p.t / p.life; g.globalAlpha = Math.min(1, a * 1.8); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r * (.6 + a * .6), 0, 6.283); g.fill(); g.globalAlpha = Math.min(1, a * 1.8) * .8; g.strokeStyle = HL_INK; g.lineWidth = .8; g.stroke(); }
  g.globalAlpha = 1;
  if (e > HL_FW_SHOW) return;
  const fade = Math.min(1, e * 4, (HL_FW_SHOW - e) * 2.5), bw = Math.min(380, W - 28), bh = w.mine ? 150 : 132, bx = (W - bw) / 2, by = H * .31 - bh / 2 + (1 - fade) * 20;
  g.globalAlpha = fade; hlPlate(g, bx, by, bw, bh, w.mine ? '#f6e3a0' : '#f2ecde', w.mine ? '#a3332a' : HL_INK, 16);
  g.strokeStyle = w.mine ? '#b57a22' : HL_INK; g.lineWidth = 1.2; g.strokeRect(bx + 7, by + 7, bw - 14, bh - 14);
  const sub = { f: "'Be Vietnam Pro', system-ui, sans-serif", w: 700, o: false };
  hlText(g, w.mine ? 'BẠN THẮNG!' : 'NGƯỜI THẮNG', W / 2, by + 24, 13, { ...sub, c: '#a3332a' });
  hlText(g, w.name, W / 2, by + 56, Math.min(34, bw / Math.max(5, w.name.length) * 1.5), { w: 900, o: false });
  hlText(g, w.text, W / 2, by + 88, 17, { ...sub, c: HL_INK });
  hlText(g, w.got ? `+${w.prize} đồng` : `Thưởng ${w.prize} đồng, người máy giữ`, W / 2, by + bh - 24, w.got ? 26 : 14, { w: 900, o: false, c: w.got ? '#2f6a4c' : HL_INK });
  g.globalAlpha = 1;
}

/* ---------- input ---------- */
const hlMe = () => HL.players.find(p => p.id === HL.id);
// the round's phase from the server clock: it announces, runs from t0, and ends only when the server says so (result)
function hlSync(r) { if (r && r.state !== 'result') r.state = HL_NET.now() >= r.t0 ? 'run' : 'announce'; return r; }
function hlCanPress() { const r = hlSync(HL.round); return r && HL.id && r.state === 'run' && r.seated.has(HL.id) && !r.press.has(HL.id) && !HL.press && HL_NET.now() >= r.t0; }
function hlPress(ts) {
  const r = HL.round; if (!hlCanPress()) return;
  const at = (ts && ts > 1 ? ts : performance.now()) + HL_NET.off, p = Math.round(at - r.t0);
  HL.press = { p, at }; r.press.set(HL.id, { p, hit: r.game === 'pomelo' && p >= r.tf[HL.id] });
  HL_NET.send({ t: 'press', n: r.n, at });
  if (r.game === 'pomelo' && p >= r.tf[HL.id]) AU.thump(); else AU.pluck(96);
}
const hlBack = () => ({ x: 10, y: 8 + safeTop(), w: 44, h: 40 });
function hlDown(e) {
  if (S.mode !== 'hlplay') return;
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, b = hlBack();
  if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { hlLeave(); return; }
  hlPress(e.timeStamp);
}
function hlKey(e) {
  if (S.mode !== 'hlplay') return;
  if (e.code === 'Escape') { hlLeave(); return; }
  if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); hlPress(e.timeStamp); }
}

/* ---------- drawing ---------- */
const HL_INK = '#1d1915';
const hlSort = n => C4_ADULT_SORTS2[((n % C4_ADULT_SORTS2.length) + C4_ADULT_SORTS2.length) % C4_ADULT_SORTS2.length];
function hlText(g, s, x, y, size, o = {}) {
  g.font = `${o.w || 700} ${size}px ${o.f || "'Playfair Display', Georgia, serif"}`; g.textAlign = o.a || 'center'; g.textBaseline = 'middle'; g.globalAlpha = o.al ?? 1;
  if (o.o !== false) { g.lineJoin = 'round'; g.lineWidth = Math.max(2, size * .18); g.strokeStyle = o.os || 'rgba(242,236,222,.9)'; g.strokeText(s, x, y); }
  g.fillStyle = o.c || HL_INK; g.fillText(s, x, y); g.globalAlpha = 1;
}
const hlPlate = (g, x, y, w, h, fill = '#f2ecde', ink = HL_INK, r = 10) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); g.lineWidth = 2.4; g.strokeStyle = ink; g.stroke(); };
function hlGrid(n, x, y, w, h) {   // the best number of columns for n cells in the area
  let best = null;
  for (let c = 1; c <= Math.min(n, 12); c++) { const rows = Math.ceil(n / c), cw = Math.min(w / c, 190), ch = h / rows, u = Math.min(cw, ch / 1.2); if (!best || u > best.u) best = { c, rows, cw: w / c, ch, u }; }
  return { ...best, x, y };
}
function renderHL() {
  const W = cv.width / DPR, H = cv.height / DPR, st = safeTop(), g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPERS.sage.base; g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) g.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  const r = hlSync(HL.round), now = HL_NET.now(), t = S.t, me = HL.id, mine = r && r.seated.has(me);
  // header
  const b = hlBack(); hlText(g, '‹', b.x + 20, b.y + 20, 34, { w: 900 });
  hlText(g, 'Hội Làng', W / 2, 24 + st, 22, { w: 900 });
  hlText(g, `${HL.players.filter(p => !p.bot).length} người trong phòng`, W / 2, 46 + st, 12, { f: "'Be Vietnam Pro', system-ui, sans-serif", w: 600, o: false, al: .75 });
  hlText(g, c4MoneyPlain(SAVE4.money), W - 12, 24 + st, 15, { a: 'right', f: "'Be Vietnam Pro', system-ui, sans-serif", w: 700 });
  hlText(g, `${HL_SAVE.wins} thắng`, W - 12, 44 + st, 12, { a: 'right', f: "'Be Vietnam Pro', system-ui, sans-serif", w: 600, o: false, al: .75 });
  if (HL.conn !== 'up' || !HL.id) { hlText(g, HL.conn === 'down' ? 'Mất kết nối, đang nối lại…' : 'Đang vào phòng…', W / 2, H / 2, 20); return; }
  if (!r) { hlText(g, 'Đang chờ ván đầu…', W / 2, H / 2, 20); return; }
  // the info panel above the grid, the grid, the press button
  const ipH = Math.max(96, Math.min(150, H * .2)), top = 62 + st, footH = (r.state === 'run' && mine) ? 74 : 38;
  hlInfo(g, r, now, W, top, ipH, mine);
  const gy = top + ipH + 6, gh = H - gy - footH - 6, list = hlOrder(r), G = hlGrid(Math.max(1, list.length), 6, gy, W - 12, gh);
  list.forEach((p, i) => hlCell(g, r, p, i, G, now, t));
  hlFoot(g, r, now, W, H, mine); hlWinDraw(g, W, H);
}
const c4MoneyPlain = d => String(c4Money(d)).replace(/<[^>]+>/g, '');
// everyone, those seated in this round first (in the room's order), the others waiting for the next
function hlOrder(r) { const s = [], w = []; for (const p of HL.players) (hlSeated(r, p) ? s : w).push(p); return [...s, ...w]; }
function hlInfo(g, r, now, W, y, h, mine) {
  const x = 10, w = W - 20; hlPlate(g, x, y, w, h);
  const ten = r.game === 'ten', title = ten ? `Ván ${r.n} · Đếm đúng 10 giây` : `Ván ${r.n} · Quả bưởi rơi`, N = r.seated.size + HL.players.filter(p => p.bot).length;
  hlText(g, title, W / 2, y + 20, 17, { w: 900 });
  const sub = { f: "'Be Vietnam Pro', system-ui, sans-serif", w: 600, o: false };
  if (r.state === 'announce') {
    const s = Math.max(0, Math.ceil((r.t0 - now) / 1000));
    hlText(g, ten ? 'Đồng hồ chạy 3 giây rồi bị che. Tự đếm, bấm đúng 10,000 giây!' : 'Bấm dừng quả bưởi thật gần đầu, đừng để nó rơi trúng!', W / 2, y + 46, 13, sub);
    hlText(g, mine ? `Bắt đầu sau ${s}` : 'Bạn đang xem, ván sau sẽ có chỗ cho bạn', W / 2, y + h - 30, mine ? 26 : 14, mine ? { w: 900 } : sub);
    hlText(g, `Thưởng người thắng: ${10 * N} đồng`, W / 2, y + h - 10, 12, sub);
  } else if (r.state === 'run' && ten) {
    const e = now - r.t0, shown = e < 3000;
    const mp = HL.press || r.press.get(HL.id), done = !!mp;
    hlText(g, done ? (mp.p / 1000).toFixed(3) : shown ? (Math.max(0, e) / 1000).toFixed(2) : '?.??', W / 2, y + h / 2 + 6, Math.min(56, h * .42), { w: 900, c: done ? '#2f6a4c' : shown ? HL_INK : '#a3332a' });
    hlText(g, done ? 'Bạn bấm lúc này · chờ mọi người' : shown ? 'Nhìn kỹ nhịp đếm…' : 'Đồng hồ đã bị che, tự đếm tiếp!', W / 2, y + h - 12, 13, sub);
  } else if (r.state === 'run') {
    const mp = HL.press || r.press.get(HL.id), gp = mp ? hlPomGap(r, HL.id) : null;
    hlText(g, mp ? (gp === null ? 'Trúng đầu rồi!' : `Cách đầu ${hlMm(gp)}`) : mine ? 'Bưởi đang rơi, bấm dừng!' : 'Bạn đang xem', W / 2, y + h / 2 + 4, mp ? 26 : 20, { w: 900, c: mp ? (gp === null ? '#a3332a' : '#2f6a4c') : HL_INK });
    hlText(g, mp ? 'Chờ mọi người dừng' : 'Rơi càng lúc càng nhanh, bấm trễ là trúng đầu', W / 2, y + h - 14, 13, sub);
  } else {
    const res = r.result, win = res.winner && HL.players.find(p => p.id === res.winner), s = Math.max(0, Math.ceil((r.next - now) / 1000));
    const wrow = win && res.rows.find(x => x.id === res.winner), wv = wrow ? (ten ? hlTime(T_TARGET + wrow.v) : hlMm(wrow.v)) : '';
    hlText(g, win ? `${win.name}${win.bot ? ' (máy)' : ''} thắng!` : 'Không ai thắng', W / 2, y + 44, 22, { w: 900, c: '#a3332a' });
    if (win) hlText(g, ten ? `bấm lúc ${wv}` : `cách đầu ${wv}`, W / 2, y + 64, 14, sub);
    const row = res.rows.find(x => x.id === HL.id);
    let mine2 = '';
    if (row) mine2 = row.v === null ? (ten ? 'Bạn không bấm kịp' : 'Quả bưởi trúng đầu bạn!') : `Bạn hạng ${row.rank}/${res.rows.length} · ${ten ? 'bấm lúc ' + hlTime(T_TARGET + row.v) : 'cách đầu ' + hlMm(row.v)}`;
    else mine2 = 'Bạn đang xem';
    hlText(g, mine2, W / 2, y + 86, 14, sub);
    if (res.winner === HL.id) hlText(g, `+${res.prize} đồng`, W / 2, y + h - 30, 18, { w: 900, c: '#2f6a4c' });
    hlText(g, `Ván sau sau ${s} giây`, W / 2, y + h - 10, 12, sub);
  }
}
const T_TARGET = 10000;   // the 'ten' game's mark, in ms from its start
const hlTime = ms => `${(ms / 1000).toFixed(3)} giây`;   // the time a player pressed at, e.g. 10.123 giây
const hlMm = v => `${(v * 400).toFixed(1)} mm`;       // the pomelo falls 400 mm to the head
// how far from the head a pressed pomelo stopped (0..1 of the fall), null if it was a hit or not pressed
function hlPomGap(r, id) { const pr = r.press.get(id), tf = r.tf[id]; if (!pr || pr.hit || !tf) return null; const f = pr.p / tf; return f >= 1 ? null : 1 - f * f; }
function hlCell(g, r, p, i, G, now, t) {
  const col = i % G.c, row = (i / G.c) | 0, x = G.x + col * G.cw, y = G.y + row * G.ch, w = G.cw, h = G.ch, cx = x + w / 2;
  const seated = hlSeated(r, p), me = p.id === HL.id, pr = r.press.get(p.id), res = r.state === 'result' && r.rank ? r.rank.get(p.id) : null, win = r.state === 'result' && r.result.winner === p.id;
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, w - 4, h - 4); g.clip();
  g.globalAlpha = seated ? 1 : .45;
  // the cell
  g.fillStyle = win ? 'rgba(242,198,64,.55)' : me ? 'rgba(242,236,222,.55)' : 'rgba(242,236,222,.28)'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.lineWidth = me || win ? 3 : 1.4; g.strokeStyle = win ? '#b57a22' : HL_INK; g.globalAlpha *= me || win ? 1 : .5; g.strokeRect(x + 3, y + 3, w - 6, h - 6); g.globalAlpha = seated ? 1 : .45;
  const nameH = Math.max(11, Math.min(15, h * .11)), base = y + h - nameH * 2.1, s = Math.min(h * .0034, w * .0042), headTop = base - 132 * s;
  // the mouse
  const M = c4MouseRig(hlSort(p.sort)), face = col < G.c / 2 ? 1 : -1, hitP = r.game === 'pomelo' && seated && pr && pr.hit;
  const sway = hitP ? Math.sin(t * 20) * 2 : 0;
  c4Mouse(g, M, cx + sway, face, 0, false, null, null, s, base, p.sort);
  // the game's thing in the cell
  if (seated && r.game === 'pomelo') hlPomelo(g, r, p, x, y, w, cx, headTop, s, now, t);
  if (seated && r.game === 'ten') {
    if (r.state === 'run' && pr) { hlText(g, '✓', cx, y + h * .3, Math.min(34, w * .3), { w: 900, c: '#2f6a4c' }); }
    if (res && res.v !== null) hlText(g, hlTime(T_TARGET + res.v), cx, y + h * .26, Math.max(10, Math.min(16, w * .12)), { w: 800, c: win ? '#a3332a' : HL_INK });
    else if (res) hlText(g, 'không bấm', cx, y + h * .26, 12, { w: 600, al: .7 });
  }
  if (res && res.rank) { g.globalAlpha = 1; hlText(g, win ? '♛ 1' : String(res.rank), x + 14, y + 16, win ? 18 : 14, { w: 900, c: win ? '#a3332a' : HL_INK }); }
  // the name
  g.globalAlpha = seated ? 1 : .6;
  hlText(g, p.name + (p.bot ? ' (máy)' : ''), cx, y + h - nameH * .9, nameH, { w: me ? 900 : 700, f: "'Be Vietnam Pro', system-ui, sans-serif" });
  if (seated && r.game === 'pomelo' && pr) { const gp = hlPomGap(r, p.id); hlText(g, gp === null ? 'trúng đầu!' : hlMm(gp), cx, y + h - nameH * 3.1, Math.max(10, Math.min(15, w * .12)), { w: 800, c: gp === null ? '#a3332a' : '#2f6a4c' }); }   // live: how far from the head it stopped
  if (!seated) hlText(g, 'chờ ván sau', cx, y + h * .3, 11, { w: 600, f: "'Be Vietnam Pro', system-ui, sans-serif", al: .9 });
  g.restore(); g.globalAlpha = 1;
}
// a pomelo on a rope above the head: falls as (time / fall time)², stops where its owner pressed, hits the head if too late
function hlPomelo(g, r, p, x, y, w, cx, headTop, s, now, t) {
  const tf = r.tf[p.id]; if (!tf) return;
  const pr = r.press.get(p.id), e = Math.max(0, now - r.t0), pp = pr ? pr.p : (r.state === 'run' || r.state === 'result' ? e : 0);
  const fr = Math.min(1, Math.max(0, pp / tf)) ** 2, rad = Math.max(8, Math.min(22, w * .1)), ropeTop = y + 8, y0 = ropeTop + rad, y1 = headTop - rad * .9, py = y0 + (y1 - y0) * fr;
  g.strokeStyle = HL_INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, ropeTop); g.lineTo(cx, py - rad * .8); g.stroke();
  g.fillStyle = HL_INK; g.fillRect(cx - 5, ropeTop - 2, 10, 3);
  const k = rad * 2.1 / 36; dp(g, WP.fruit, cx, py + rad * .5, 0, k, k);
  const hit = fr >= 1 && (!pr || pr.hit);
  if (hit) { for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; hlText(g, '★', cx + Math.cos(a) * rad * 1.4, headTop - rad * 1.1 + Math.sin(a) * rad * .5, 12, { c: '#d98a2a', o: false }); } }
  else if (pr && r.state === 'run') hlText(g, 'dừng!', cx + rad * 1.5, py, 11, { w: 800, c: '#2f6a4c' });
}
function hlFoot(g, r, now, W, H, mine) {
  if (r.state === 'run' && mine) {
    const can = hlCanPress(), w = Math.min(300, W - 40), x = (W - w) / 2, y = H - 66;
    hlPlate(g, x, y, w, 52, can ? '#a3332a' : '#bdb7a6', HL_INK, 14);
    hlText(g, can ? (r.game === 'ten' ? 'BẤM!' : 'DỪNG!') : 'Đã bấm ✓', W / 2, y + 27, 26, { w: 900, c: can ? '#f2ecde' : HL_INK, os: can ? '#5a1a14' : 'rgba(242,236,222,.7)' });
  } else hlText(g, 'Space / chạm màn hình để bấm', W / 2, H - 22, 12, { f: "'Be Vietnam Pro', system-ui, sans-serif", w: 600, o: false, al: .6 });
}
function updateHL(dt) { HL.t += dt; hlSync(HL.round); hlFireworks(dt); }

registerChapter({
  id: 9, modes: ['hlplay'],
  card: { num: lg('Chương IX', 'Chapter IX'), han: '會村', name: lg('Hội Làng', 'Village Fair'), desc: lg('Phòng chơi chung mở cả ngày: ai vào cũng ngồi cùng một hàng, thấy nhau chơi trực tiếp. Đếm đúng 10 giây, né quả bưởi rơi trên đầu; ai khéo nhất thì được thưởng, càng đông càng nhiều.', 'A shared room open all day: everyone sits in the same row and watches each other play live. Count exactly 10 seconds, stop the falling pomelo; the sharpest wins, the bigger the crowd the bigger the prize.'), bg: '#cdd9b4' },
  progress: () => HL_SAVE.rounds ? lgf('{w} thắng / {r} ván', '{w} wins / {r} rounds', { w: HL_SAVE.wins, r: HL_SAVE.rounds }) : lg('Chưa chơi', 'Not played'),
  hasProgress: () => HL_SAVE.rounds > 0,
  direct: startHL,
  album() {},
  hide() { if (HL_NET.wantOn) HL_NET.close(); },
  update: updateHL, render: renderHL, key: hlKey,
  pointer: { down: hlDown, move() {}, up() {} },
  next() { showChapters(); }, retry() { startHL(); },
});
