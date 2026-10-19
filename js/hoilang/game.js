/* Chương V · Hội Làng 會村 (owner; it took the place of the unmade "Bầy Chuột Phiêu Lưu", 2026-10-19)(owner, 2026-10-19): one shared room that runs all day; whoever opens the chapter sits in one grid with
   everyone else, sees them play live, plays the round in progress or waits for the next. The server (server/phong-choi, a Cloudflare
   Durable Object) keeps the clock, the schedule, the bots, the stakes, the results and the board; this file draws the grid, the
   controls and the board, and tro.js holds the 11 games (HL_G). Animations run from the server clock (HL_NET.now()) and the
   round's t0 and settings, so only the actions of the players travel over the network.
   MONEY: each person in a round stakes HL.stake (10 đồng) from chương IV's purse (SAVE4.money); one winner takes the whole pot
   (stake × everyone in the round, bots included), the others lose their stake, no winner moves nothing; the server sends each
   person's net result and this file applies it once. Under the stake you cannot be seated (go back and trade). Looks and names are
   the chương IV profile's (hsMine, hsRig, hsHeadOn). Never real money. */

let HL_SAVE = { r: 0, w: 0, net: 0 };
try { const s = JSON.parse(localStorage.getItem('dcc.hl2') || 'null'); if (s && typeof s.r === 'number') HL_SAVE = Object.assign(HL_SAVE, s); } catch (e) {}
const hlPersist = () => { try { localStorage.setItem('dcc.hl2', JSON.stringify(HL_SAVE)); } catch (e) {} };

const HL = { id: null, players: [], round: null, wait: false, conn: 'connecting', stake: 10, stat: null, board: null, ui: null, tab: 'top', per: 'd', idle: false, fig: new Map(), t: 0, win: null, fw: [], btns: [], held: null, tapAcc: 0, tapSent: 0, myTaps: 0, paid: 0, okSent: null, flash: null, myPick: 0, myHole: null, drumFlash: null };
const HL_INK = '#1d1915';
const hlSans = "'Be Vietnam Pro', system-ui, sans-serif";

function startHL() {
  trackEnter('chuong-5'); AU.init(); AU.setSong(10); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 5; S.mode = 'hlplay';
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  PAPER = getPaper('sage'); document.documentElement.style.setProperty('--paper', PAPERS.sage.css);
  const me = hsMine();
  Object.assign(HL, { id: null, players: [], round: null, wait: false, conn: 'connecting', stat: null, board: null, ui: null, idle: true, joined: false, bscroll: 0, drag: null, win: null, fw: [], held: null, tapAcc: 0, paid: 0, okSent: null, flash: null });
  HL.fig.clear();
  const look = { role: me.role, age: me.age, body: me.body, fur: me.fur, robe: me.robe, skirt: me.skirt, pants: me.pants, top: me.top };
  HL_NET.open({ t: 'hello', dev: p4Device(), name: hsName(me), look, ok: hlOk() }, hlMsg, s => { HL.conn = s; });
}
function hlLeave() { HL_NET.close(); showChapters(); }
const hlOk = () => SAVE4.money >= HL.stake;
// the room is told when the purse crosses the stake; the ending of each round moves the money
setInterval(() => { if (S.mode === 'hlplay' && HL_NET.up) { const ok = hlOk(); if (ok !== HL.okSent) { HL.okSent = ok; HL_NET.send({ t: 'bal', ok }); } } }, 700);

/* ---------- messages from the room ---------- */
function hlMsg(m) {
  const r = HL.round;
  if (m.t === 'welcome') { HL.id = m.id; HL.stake = m.stake || 10; HL.players = m.players; HL.stat = m.stat; HL.okSent = hlOk(); HL.round = m.round ? hlRound(m.round) : null; hlMeFlags(); if (HL.joined) HL_NET.send({ t: 'join' }); }
  else if (m.t === 'players') { HL.players = m.players; hlMeFlags(); }
  else if (m.t === 'round') {
    if (m.wait) { HL.wait = true; HL.round = null; }
    else { HL.wait = false; HL.round = hlRound(m); HL.win = null; HL.fw = []; HL.held = null; HL.tapAcc = 0; HL.myTaps = 0; HL.flash = null; HL.myPick = 0; HL.myHole = null; HL.drumFlash = null; AU.pluck(84); }
  }
  else if (m.t === 'in') { if (r && r.n === m.n) hlIn(r, m, false); }
  else if (m.t === 'prog') { if (r && r.n === m.n) r.prog = m.p; }
  else if (m.t === 'go') { if (r && r.n === m.n) { r.go = true; AU.pluck(98); } }
  else if (m.t === 'hole') { if (r && r.n === m.n) { r.holes.push(m); AU.thump(); } }
  else if (m.t === 'result') hlResult(m);
  else if (m.t === 'stat') { HL.stat = m.stat; HL_SAVE.r = m.stat.r; HL_SAVE.w = m.stat.w; HL_SAVE.net = m.stat.won - m.stat.lost; hlPersist(); }
  else if (m.t === 'idle') HL.idle = true;
  else if (m.t === 'board') HL.board = m;
}
function hlMeFlags() { const me = HL.players.find(p => p.id === HL.id); if (me) HL.idle = !!me.idle; }
function hlRound(m) {
  const r = { solo: !!m.solo, n: m.n, game: m.game, announce: m.announce, t0: m.t0, state: m.state, cfg: m.cfg || {}, seated: new Set(m.seated), inp: new Map(), ev: new Map(), bal: new Map(), picked: new Set(), hp: new Map(), prog: null, nho: new Map(), holes: m.holes || [], go: !!m.go, result: null, bots: m.bots || [] };
  for (const e of m.live || []) hlIn(r, e, true);
  if (m.result) { r.state = 'result'; r.result = m.result; r.rank = new Map(m.result.rows.map(x => [x.id, x])); r.next = Date.now(); r.extra = {}; }
  return r;
}
// what other players did (and, replayed on joining, what everyone did)
function hlIn(r, e, replay) {
  const g = r.game, id = e.id, me = id === HL.id;
  if (g === 'ten' || g === 'trong') { if (!r.inp.has(id)) r.inp.set(id, {}); }
  else if (g === 'pomelo') { if (!me) r.inp.set(id, { p: e.p, hit: e.hit }); }
  else if (g === 'giua') { if (!me) r.inp.set(id, { p: e.p }); }
  else if (g === 'lantern') { if (!me || !r.inp.has(id)) r.inp.set(id, { fs: e.fs }); else r.inp.get(id).fs = e.fs; }
  else if (g === 'tuong') { if (!me || replay) { const a = r.ev.get(id) || []; r.ev.set(id, a); a.push([e.p, e.k]); } }
  else if (g === 'balloon') { const b = r.bal.get(id) || {}; r.bal.set(id, b); if (e.k === 'd') b.d = e.p; else if (e.k === 'u') b.u = e.p; else if (e.k === 'pop') { b.pop = e.p; if (me) AU.thump(); } }
  else if (g === 'minnum') r.picked.add(id);
  else if (g === 'hang') { const s = r.hp.get(e.i) || new Set(); r.hp.set(e.i, s); s.add(id); }
  else if (g === 'nho') r.nho.set(id, { c: e.c, bad: e.bad });
  if (!replay && !me && (g === 'pomelo' || g === 'giua' || g === 'ten' || g === 'trong' || g === 'lantern')) AU.tap();
}
function hlResult(m) {
  const r = HL.round; if (!r || r.n !== m.n) return;
  r.state = 'result'; r.result = m; r.next = m.next; r.rank = new Map(m.rows.map(x => [x.id, x])); r.extra = m.extra || {};
  const net = m.net ? m.net[HL.id] : undefined;
  if (net !== undefined && HL.paid !== m.n) {
    HL.paid = m.n; SAVE4.money = Math.max(0, SAVE4.money + net); try { persist4(); } catch (e) {}
    HL.flash = { net, t0: HL.t };
    if (net > 0) { AU.drumHit(); trackWin(); } else if (net < 0) AU.thump();
  } else if (m.winner) AU.plop();
  HL.held = null; hlWinStart(m, r);
}

/* ---------- player looks: the chương IV profile ---------- */
function hlFig(p) {
  let w = HL.fig.get(p.id); const key = p.bot ? 'b' + p.sort : JSON.stringify(p.look);
  if (w && w.key === key) return w;
  if (p.bot) { const sort = C4_ADULT_SORTS2[((p.sort % C4_ADULT_SORTS2.length) + C4_ADULT_SORTS2.length) % C4_ADULT_SORTS2.length]; w = { key, kind: 'mouse', sort, M: c4MouseRig(sort), seed: p.sort, ph: 0, st: 'idle', face: 1, look: {} }; }
  else { const d = hsClean({ ...HS_DEF, ...(p.look || {}), name: p.name }); w = { key, kind: 'mouse', sort: hsSort(d), M: hsRig(d), seed: 3, ph: 0, st: 'idle', face: 1, look: hsLook(d), ...hsShape(d) }; }
  HL.fig.set(p.id, w); return w;
}
function hlDrawFig(g, p, x, base, s, face, run, t, alpha = 1) {
  const w = hlFig(p); w.face = face; w.st = run ? 'walk' : 'idle'; w.ph = run ? t * 14 + w.seed : 0;
  const a0 = g.globalAlpha; g.globalAlpha = a0 * alpha; c4Critter(g, w, x, base, s / .92); g.globalAlpha = a0;
}

/* ---------- the round's phase from the server clock ---------- */
function hlSync(r) {
  if (!r || r.state === 'result') return r;
  const now = HL_NET.now(); r.state = now >= r.t0 ? 'run' : 'announce';
  if (r.game === 'hang' && r.state === 'run') { const c = r.cfg, e = now - r.t0; r.sub = Math.min(c.rounds - 1, Math.floor(e / c.slot)); r.subE = e - r.sub * c.slot; r.picking = r.subE < c.pick && r.sub >= r.holes.length; }
  return r;
}
const hlSeatedMe = r => !!(r && HL.id && r.seated.has(HL.id));
const hlCanAct = r => !!(r && hlSeatedMe(r) && r.state === 'run' && HL_NET.now() >= r.t0);
const hlEnd = r => r.state === 'result' ? 1e9 : Math.max(0, HL_NET.now() - r.t0);

/* ---------- actions ---------- */
const hlSend = (r, o) => HL_NET.send({ t: 'act', n: r.n, at: HL_NET.now(), ...o });
const hlTs = ts => (ts && ts > 1 ? ts : performance.now()) + HL_NET.off;
function hlPressAct(ts) {   // one press: ten, trong, pomelo, giua, lantern
  const r = hlSync(HL.round); if (!hlCanAct(r) || r.inp.has(HL.id)) return;
  const at = hlTs(ts), p = Math.round(at - r.t0); if (p < 0) return;
  const x = { p }; if (r.game === 'pomelo') x.hit = p >= r.cfg.tf[HL.id]; if (r.game === 'lantern') x.fs = !r.go;
  r.inp.set(HL.id, x); HL_NET.send({ t: 'act', n: r.n, k: 'p', at });
  if (x.hit || x.fs) AU.thump(); else AU.pluck(96);
}
function hlHold(down, ts) {   // tuong, balloon: hold and release
  const r = hlSync(HL.round); if (!hlCanAct(r)) return; const at = hlTs(ts), p = Math.round(at - r.t0); if (p < 0) return;
  if (r.game === 'tuong') {
    const ev = r.ev.get(HL.id) || []; r.ev.set(HL.id, ev);
    const holding = ev.length > 0 && ev[ev.length - 1][1] === 'd', s = tuongSim(r.cfg, ev, p);
    if (s.caught !== null || s.fin !== null || down === holding) return;
    ev.push([p, down ? 'd' : 'u']); HL_NET.send({ t: 'act', n: r.n, k: down ? 'd' : 'u', at });
  } else if (r.game === 'balloon') {
    const b = r.bal.get(HL.id) || {}; r.bal.set(HL.id, b);
    if (down && b.d === undefined) { b.d = p; HL_NET.send({ t: 'act', n: r.n, k: 'd', at }); }
    else if (!down && b.d !== undefined && b.u === undefined && b.pop === undefined) { b.u = p; HL_NET.send({ t: 'act', n: r.n, k: 'u', at }); AU.pluck(94); }
  }
}
function hlTap() { const r = hlSync(HL.round); if (!hlCanAct(r) || r.game !== 'boat') return; HL.tapAcc++; HL.myTaps++; AU.tap(); }
function hlPick(v) { const r = hlSync(HL.round); if (!hlCanAct(r) || r.game !== 'minnum') return; HL.myPick = v; r.picked.add(HL.id); hlSend(r, { k: 'v', v }); AU.pluck(90); }
function hlHole(v) {
  const r = hlSync(HL.round); if (!hlCanAct(r) || r.game !== 'hang' || !r.picking || !hlAlive(r, HL.id)) return;
  HL.myHole = { i: r.sub, v }; const s = r.hp.get(r.sub) || new Set(); r.hp.set(r.sub, s); s.add(HL.id); hlSend(r, { k: 'h', v, i: r.sub }); AU.pluck(90);
}
function hlDrum(v) { const r = hlSync(HL.round); if (!hlCanAct(r) || r.game !== 'nho' || hlEnd(r) < r.cfg.showEnd - 100) return; HL.drumFlash = { v, t: HL.t }; hlSend(r, { k: 'm', v }); AU.pluck(76 + v * 5); }
// still in the game: not caught in an earlier hole
const hlAlive = (r, id) => !r.holes.some(h => h.out.includes(id));

/* ---------- input: buttons drawn each frame, the screen itself for single presses ---------- */
function hlDown(e) {
  if (S.mode !== 'hlplay') return;
  const rc = cv.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top, b0 = hlBack();
  if (x > b0.x && x < b0.x + b0.w && y > b0.y && y < b0.y + b0.h) { if (HL.ui) HL.ui = null; else hlLeave(); return; }
  for (const b of HL.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && !b.off) { if (b.down) b.down(e); if (b.up) HL.held = b; return; }
  if (HL.ui === 'board' && HL.tab === 'top' && HL.barea && x >= HL.barea.x && x <= HL.barea.x + HL.barea.w && y >= HL.barea.y && y <= HL.barea.y + HL.barea.h) { HL.drag = { y, s: HL.bscroll }; return; }   // a drag over the list scrolls it
  if (HL.ui) { HL.ui = null; return; }
  const r = HL.round; if (r && r.game && HL_G[r.game].ctl === 'press') hlPressAct(e.timeStamp);
}
function hlMove(e) { if (!HL.drag) return; const rc = cv.getBoundingClientRect(); HL.bscroll = HL.drag.s - ((e.clientY - rc.top) - HL.drag.y); }
cv.addEventListener('wheel', e => { if (S.mode !== 'hlplay' || HL.ui !== 'board') return; e.preventDefault(); HL.bscroll += e.deltaY; }, { passive: false });
function hlUp() { HL.drag = null; const b = HL.held; HL.held = null; if (b && b.up) b.up(); }
function hlKey(e) {
  if (S.mode !== 'hlplay') return;
  if (e.code === 'Escape') { if (HL.ui) HL.ui = null; else hlLeave(); return; }
  const k = e.code === 'Space' || e.code === 'Enter' ? ' ' : /^Digit[1-9]$/.test(e.code) ? e.code.slice(5) : '';
  if (!k) return; e.preventDefault();
  if (e.repeat) return;
  const b = HL.btns.find(b => b.key === k && !b.off);
  if (b) { if (b.down) b.down(e); if (b.up) HL.held = b; return; }
  const r = HL.round; if (k === ' ' && r && r.game && HL_G[r.game].ctl === 'press') hlPressAct(e.timeStamp);
}
function hlKeyUp(e) { if (S.mode === 'hlplay' && (e.code === 'Space' || e.code === 'Enter') && HL.held) hlUp(); }
addEventListener('keyup', hlKeyUp); addEventListener('pointerup', hlUp); addEventListener('pointercancel', hlUp);
const hlBack = () => ({ x: 10, y: 8 + safeTop(), w: 44, h: 40 });

/* ---------- drawing: helpers ---------- */
function hlText(g, s, x, y, size, o = {}) {
  g.font = `${o.w || 700} ${size}px ${o.f || "'Playfair Display', Georgia, serif"}`; g.textAlign = o.a || 'center'; g.textBaseline = 'middle'; g.globalAlpha = o.al ?? 1;
  if (o.o !== false) { g.lineJoin = 'round'; g.lineWidth = Math.max(2, size * .18); g.strokeStyle = o.os || 'rgba(242,236,222,.9)'; g.strokeText(s, x, y); }
  g.fillStyle = o.c || HL_INK; g.fillText(s, x, y); g.globalAlpha = 1;
}
const hlPlate = (g, x, y, w, h, fill = '#f2ecde', ink = HL_INK, r = 10) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); g.lineWidth = 2.4; g.strokeStyle = ink; g.stroke(); };
function hlWrap(g, s, maxW, size, w = 600) {
  g.font = `${w} ${size}px ${hlSans}`; const out = []; let cur = '';
  for (const word of s.split(' ')) { const t = cur ? cur + ' ' + word : word; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = word; } else cur = t; }
  if (cur) out.push(cur); return out;
}
const hlTime = ms => `${(ms / 1000).toFixed(3)} giây`;
const hlMm = v => `${(v * 400).toFixed(1)} mm`;
const hlMoney = d => String(c4Money(d)).replace(/<[^>]+>/g, '');
function hlGrid(n, x, y, w, h) {   // the best number of columns for n cells in the area
  let best = null;
  for (let c = 1; c <= Math.min(n, 12); c++) { const rows = Math.ceil(n / c), cw = Math.min(w / c, 190), ch = h / rows, u = Math.min(cw, ch / 1.2); if (!best || u > best.u) best = { c, rows, cw: w / c, ch, u }; }
  return { ...best, x, y };
}
const hlSeated = (r, p) => r.seated.has(p.id) || p.bot;
// everyone, those seated in this round first (in the room's order), the others waiting for the next
function hlOrder(r) { const s = [], w = []; for (const p of HL.players) (hlSeated(r, p) ? s : w).push(p); return [...s, ...w]; }

/* ---------- drawing: the screen ---------- */
function renderHL() {
  const W = cv.width / DPR, H = cv.height / DPR, st = safeTop(), g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPERS.sage.base; g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) g.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  HL.btns = [];
  const r = hlSync(HL.round), now = HL_NET.now(), t = S.t;
  hlHeader(g, W, st);
  if (HL.conn !== 'up' || !HL.id) { hlText(g, HL.conn === 'down' ? 'Mất kết nối, đang nối lại…' : 'Đang vào phòng…', W / 2, H / 2, 20); return; }
  if (!r) { hlText(g, HL.wait ? 'Đang chờ thêm người chơi cùng…' : 'Đang chờ ván đầu…', W / 2, H / 2, 20); hlFoot(g, W, H); if (HL.ui) hlOverlay(g, W, H); return; }
  const seatedMe = hlSeatedMe(r), gm = HL_G[r.game], ctl = hlControls(r, W, H, seatedMe);
  const ipH = Math.max(96, Math.min(150, H * .19)), top = 62 + st, footH = ctl.h;
  hlInfo(g, r, gm, now, W, top, ipH, seatedMe);
  const gy = top + ipH + 6, gh = H - gy - footH - 6, list = hlOrder(r), G = hlGrid(Math.max(1, list.length), 6, gy, W - 12, gh);
  list.forEach((p, i) => hlCell(g, r, gm, p, i, G, now, t));
  hlButtons(g, ctl, W, H);
  hlWinDraw(g, W, H);
  if (HL.flash && HL.t - HL.flash.t0 < 3.5) hlFlashDraw(g, W, H);
  if (HL.ui) hlOverlay(g, W, H);
}
function hlHeader(g, W, st) {
  const b = hlBack(); hlText(g, '‹', b.x + 20, b.y + 20, 34, { w: 900 });
  hlText(g, 'Hội Làng', 46, 22 + st, 21, { w: 900, a: 'left' });
  hlText(g, HL.round && HL.round.solo ? 'Chơi thử · không cược' : `${HL.players.filter(p => !p.bot).length} người · cược ${HL.stake} đ`, 46, 44 + st, 11.5, { f: hlSans, w: 600, o: false, al: .75, a: 'left' });
  hlText(g, hlMoney(SAVE4.money), W - 12, 22 + st, 13, { a: 'right', f: hlSans, w: 700 });
  if (!HL.idle && HL.conn === 'up') { HL.btns.push({ id: 'rest', x: W - 186, y: 36 + st, w: 86, h: 22, down: () => { HL.idle = true; HL_NET.send({ t: 'rest' }); } }); hlPlate(g, W - 186, 38 + st, 82, 18, '#e6dec9', HL_INK, 6); hlText(g, 'Tạm nghỉ', W - 145, 47 + st, 11.5, { a: 'center', f: hlSans, w: 700, o: false }); }
  HL.btns.push({ id: 'board', x: W - 92, y: 36 + st, w: 84, h: 22, down: () => { HL.ui = 'board'; HL.tab = 'top'; HL_NET.send({ t: 'board', per: HL.per }); } });
  hlText(g, 'Xếp hạng ›', W - 12, 47 + st, 12, { a: 'right', f: hlSans, w: 700, o: false, c: '#a3332a' });
}
// the panel above the grid: the game's title, its rule and countdown before, its live picture during, the winner after
function hlInfo(g, r, gm, now, W, y, h, mine) {
  const x = 10, w = W - 20; hlPlate(g, x, y, w, h);
  hlText(g, `Ván ${r.n} · ${gm.name}`, W / 2, y + 18, 16, { w: 900 });
  const sub = { f: hlSans, w: 600, o: false }, N = r.seated.size + r.bots.length;
  if (r.state === 'announce') {
    const s = Math.max(0, Math.ceil((r.t0 - now) / 1000)), lines = hlWrap(g, gm.rule, w - 24, 13);
    lines.slice(0, 3).forEach((l, i) => hlText(g, l, W / 2, y + 40 + i * 16, 13, sub));
    hlText(g, mine ? `Bắt đầu sau ${s}` : hlWhyNot(), W / 2, y + h - 30, mine ? 24 : 13, mine ? { w: 900 } : sub);
    hlText(g, r.solo ? 'Chưa có ai khác trong phòng, chơi thử cho vui' : `Hũ ${HL.stake * N} đồng, một người ăn hết`, W / 2, y + h - 10, 12, sub);
  } else if (r.state === 'run') gm.info(g, r, now, { x, y: y + 28, w, h: h - 28, W }, mine);
  else {
    const res = r.result, win = res.winner && HL.players.find(p => p.id === res.winner), wr = win && res.rows.find(x => x.id === res.winner), s = Math.max(0, Math.ceil((r.next - now) / 1000));
    hlText(g, win ? `${win.name}${win.bot ? ' (máy)' : ''} thắng!` : r.solo ? 'Chơi thử xong rồi!' : 'Không ai thắng, không ai mất tiền', W / 2, y + 44, win ? 22 : 15, { w: 900, c: '#a3332a' });
    if (win && wr) hlText(g, gm.win(r, wr), W / 2, y + 64, 13, sub);
    const row = res.rows.find(x => x.id === HL.id), net = res.net ? res.net[HL.id] : undefined;
    if (row) hlText(g, gm.mine ? gm.mine(r, row) : `Bạn hạng ${row.rank || '–'}/${res.rows.length}`, W / 2, y + 84, 13, sub);
    if (net !== undefined) hlText(g, net > 0 ? `Bạn ăn hũ: +${net} đồng` : net < 0 ? `Bạn mất ${-net} đồng` : '', W / 2, y + h - 28, 17, { w: 900, c: net > 0 ? '#2f6a4c' : '#a3332a' });
    else hlText(g, hlWhyNot(), W / 2, y + h - 28, 12, sub);
    hlText(g, `Ván tiếp theo sau ${s} giây`, W / 2, y + h - 9, 12, sub);
  }
}
function hlWhyNot() { const me = HL.players.find(p => p.id === HL.id); return !hlOk() ? 'Bạn hết tiền cược, về buôn bán nhé' : HL.idle ? (HL.joined ? 'Bạn đang nghỉ, bấm "Chơi tiếp"' : 'Bạn đang ngồi xem, bấm "Tham gia chơi" để vào ván sau') : me && me.seat ? '' : 'Bạn đang xem, ván sau sẽ có chỗ cho bạn'; }

function hlCell(g, r, gm, p, i, G, now, t) {
  const col = i % G.c, row = (i / G.c) | 0, x = G.x + col * G.cw, y = G.y + row * G.ch, w = G.cw, h = G.ch, cx = x + w / 2;
  const seated = hlSeated(r, p), me = p.id === HL.id, res = r.state === 'result' && r.rank ? r.rank.get(p.id) : null, win = r.state === 'result' && r.result.winner === p.id;
  const nameH = Math.max(11, Math.min(15, h * .11)), base = y + h - nameH * 2.1, s = Math.min(h * .0034, w * .0042), headTop = base - 132 * s;
  const C = { x, y, w, h, cx, base, s, headTop, nameH, t, now };
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, w - 4, h - 4); g.clip();
  g.globalAlpha = seated ? 1 : .45;
  g.fillStyle = win ? 'rgba(242,198,64,.55)' : me ? 'rgba(242,236,222,.55)' : 'rgba(242,236,222,.28)'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.lineWidth = me || win ? 3 : 1.4; g.strokeStyle = win ? '#b57a22' : HL_INK; g.globalAlpha *= me || win ? 1 : .5; g.strokeRect(x + 3, y + 3, w - 6, h - 6); g.globalAlpha = seated ? 1 : .45;
  const pose = seated && gm.pose ? gm.pose(r, p, now) : null, face = col < G.c / 2 ? 1 : -1;
  hlDrawFig(g, p, cx, base, s, face, pose && pose.run, t, pose && pose.dim ? .4 : 1);
  if (seated) gm.cell(g, r, p, C, res, win);
  if (res && res.rank) { g.globalAlpha = 1; hlText(g, win ? '♛ 1' : String(res.rank), x + 14, y + 16, win ? 18 : 14, { w: 900, c: win ? '#a3332a' : HL_INK }); }
  g.globalAlpha = seated ? 1 : .6;
  { const label = p.name + (p.bot ? ' (máy)' : ''); let ns = nameH; g.font = `700 ${ns}px ${hlSans}`; while (ns > 8 && g.measureText(label).width > w - 8) { ns -= .5; g.font = `700 ${ns}px ${hlSans}`; }   // a long name shrinks to fit its cell
    hlText(g, label, cx, y + h - nameH * .9, ns, { w: me ? 900 : 700, f: hlSans }); }
  if (!seated) { const msg = !p.ok ? 'hết tiền' : p.idle ? 'đang xem' : 'chờ ván sau'; let fs = 11; g.font = `600 ${fs}px ${hlSans}`; while (fs > 7 && g.measureText(msg).width > w - 10) { fs -= .5; g.font = `600 ${fs}px ${hlSans}`; } hlText(g, msg, cx, y + 13, fs, { w: 600, f: hlSans, al: .9 }); }
  g.restore(); g.globalAlpha = 1;
}
// the controls under the grid: a list of buttons and the height they take
function hlControls(r, W, H, seated) {
  const btns = [], gm = HL_G[r.game];
  if (!hlOk() && !seated) { btns.push({ id: 'trade', label: 'Về chợ buôn bán', x: (W - 240) / 2, y: H - 54, w: 240, h: 44, fill: '#a3332a', ink: '#f2ecde', down: hlLeave }); return { btns, h: 62 }; }
  if (HL.idle) { btns.push({ id: 'again', label: HL.joined ? 'Chơi tiếp' : 'Tham gia chơi', sub: HL.joined ? '' : 'không bấm thì chỉ ngồi xem', x: (W - 240) / 2, y: H - 58, w: 240, h: 48, fill: '#2f6a4c', ink: '#f2ecde', down: () => { HL.idle = false; HL.joined = true; HL_NET.send({ t: 'join' }); } }); return { btns, h: 62 }; }
  if (!seated || r.state !== 'run') return { btns, h: 30, note: seated && r.state === 'announce' ? 'Chuẩn bị…' : '' };
  return gm.controls(r, W, H, btns);
}
function hlButtons(g, ctl, W, H) {
  for (const b of ctl.btns) {
    HL.btns.push(b); const down = HL.held === b;
    g.globalAlpha = b.off ? .5 : 1; hlPlate(g, b.x, b.y, b.w, b.h, down ? b.fillDown || b.fill : b.fill || '#bdb7a6', HL_INK, 12);
    hlText(g, b.label, b.x + b.w / 2, b.y + b.h / 2 + (b.sub ? -6 : 1), b.size || Math.min(24, b.h * .5), { w: 900, c: b.ink || HL_INK, os: b.os || 'rgba(0,0,0,.25)' });
    if (b.sub) hlText(g, b.sub, b.x + b.w / 2, b.y + b.h / 2 + 12, 11, { w: 600, f: hlSans, o: false, c: b.ink || HL_INK });
    g.globalAlpha = 1;
  }
  if (ctl.note) hlText(g, ctl.note, W / 2, H - 16, 12, { f: hlSans, w: 600, o: false, al: .6 });
}
function hlFoot(g, W, H) { if (!hlOk()) hlButtons(g, { btns: [{ id: 'trade', label: 'Về chợ buôn bán', x: (W - 240) / 2, y: H - 54, w: 240, h: 44, fill: '#a3332a', ink: '#f2ecde', down: hlLeave }], h: 62 }, W, H); }

/* ---------- the winner's fireworks (owner, 2026-10-19) and the purse flash ---------- */
const HL_FW_COL = ['#a3332a', '#f2c640', '#2f6a4c', '#f2ecde', '#d98a7c', '#3f8a86'];
const HL_FW_SHOW = 5.2;
function hlWinStart(m, r) {
  const win = HL.players.find(p => p.id === m.winner), row = m.rows.find(x => x.id === m.winner);
  if (!win || !row) { HL.win = null; return; }
  const mine = m.winner === HL.id;
  HL.win = { t0: HL.t, name: win.name + (win.bot ? ' (máy)' : ''), mine, bot: win.bot, text: HL_G[r.game].win(r, row), pot: m.pot, got: !win.bot, net: m.pot - HL.stake, bursts: mine ? [0, .25, .6, 1, 1.4, 1.9, 2.5, 3.2] : [0, .5, 1.1, 1.8, 2.6], next: 0 };
  HL.fw = [];
}
function hlFireworks(dt) {
  const w = HL.win; if (!w) return;
  const e = HL.t - w.t0;
  while (w.next < w.bursts.length && e >= w.bursts[w.next]) {
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
  const fade = Math.min(1, e * 4, (HL_FW_SHOW - e) * 2.5), bw = Math.min(380, W - 28), bh = w.mine ? 150 : 132, bx = (W - bw) / 2, by = 62 + safeTop() + Math.max(96, Math.min(150, H * .19)) + 8 + (1 - fade) * 20;   // just under the info panel, over the grid
  g.globalAlpha = fade; hlPlate(g, bx, by, bw, bh, w.mine ? '#f6e3a0' : '#f2ecde', w.mine ? '#a3332a' : HL_INK, 16);
  g.strokeStyle = w.mine ? '#b57a22' : HL_INK; g.lineWidth = 1.2; g.strokeRect(bx + 7, by + 7, bw - 14, bh - 14);
  const sub = { f: hlSans, w: 700, o: false };
  hlText(g, w.mine ? 'BẠN THẮNG!' : 'NGƯỜI THẮNG', W / 2, by + 24, 13, { ...sub, c: '#a3332a' });
  hlText(g, w.name, W / 2, by + 56, Math.min(34, bw / Math.max(5, w.name.length) * 1.5), { w: 900, o: false });
  { let ts = 17; g.font = `700 ${ts}px ${hlSans}`; while (ts > 10 && g.measureText(w.text).width > bw - 28) { ts -= .5; g.font = `700 ${ts}px ${hlSans}`; }   // a long result line shrinks to fit the banner
    hlText(g, w.text, W / 2, by + 88, ts, { ...sub, c: HL_INK }); }
  hlText(g, w.got ? `ăn hũ ${w.pot} đồng (lời ${w.net})` : `Hũ ${w.pot} đồng, người máy ăn`, W / 2, by + bh - 24, w.got ? 20 : 14, { w: 900, o: false, c: w.got ? '#2f6a4c' : HL_INK });
  g.globalAlpha = 1;
}
function hlFlashDraw(g, W, H) {   // "+50" / "−10" rising from the purse
  const f = HL.flash, e = HL.t - f.t0; if (!f.net) return;
  g.globalAlpha = Math.max(0, 1 - e / 3.5); hlText(g, `${f.net > 0 ? '+' : '−'}${Math.abs(f.net)}`, W - 112, 46 + safeTop(), 20, { w: 900, c: f.net > 0 ? '#2f6a4c' : '#a3332a' }); g.globalAlpha = 1;
}

/* ---------- the board and my own numbers ---------- */
function hlOverlay(g, W, H) {
  const x = 10, y = 60 + safeTop(), w = W - 20, h = H - y - 14;
  g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(0, 0, W, H); hlPlate(g, x, y, w, h, '#f2ecde', HL_INK, 14);
  const tabs = [['top', 'Xếp hạng'], ['me', 'Của tôi']], tw = (w - 24) / 2;
  tabs.forEach(([k, l], i) => { const tx = x + 12 + i * tw; hlPlate(g, tx, y + 10, tw - 4, 30, HL.tab === k ? '#a3332a' : '#e6dec9', HL_INK, 8); hlText(g, l, tx + tw / 2 - 2, y + 26, 14, { w: 800, c: HL.tab === k ? '#f2ecde' : HL_INK, o: false }); HL.btns.push({ id: 'tab' + k, x: tx, y: y + 10, w: tw - 4, h: 30, down: () => { HL.tab = k; if (k === 'top') HL_NET.send({ t: 'board', per: HL.per }); } }); });
  hlText(g, '‹ đóng', x + w - 44, y + h - 14, 12, { f: hlSans, w: 700, o: false, c: '#a3332a' }); HL.btns.push({ id: 'close', x: x + w - 90, y: y + h - 30, w: 90, h: 30, down: () => { HL.ui = null; } });
  const rowH = 22, sub = { f: hlSans, w: 600, o: false };
  if (HL.tab === 'top') {
    const pers = [['d', 'Ngày'], ['w', 'Tuần'], ['m', 'Tháng'], ['a', 'Mọi lúc']], pw = (w - 24) / 4;
    pers.forEach(([k, l], i) => { const px = x + 12 + i * pw; hlPlate(g, px, y + 46, pw - 4, 24, HL.per === k ? '#2f6a4c' : '#e6dec9', HL_INK, 7); hlText(g, l, px + pw / 2 - 2, y + 59, 12, { f: hlSans, w: 800, c: HL.per === k ? '#f2ecde' : HL_INK, o: false }); HL.btns.push({ id: 'per' + k, x: px, y: y + 46, w: pw - 4, h: 24, down: () => { HL.per = k; HL_NET.send({ t: 'board', per: k }); } }); });
    const b = HL.board && HL.board.per === HL.per ? HL.board : null; if (!b) { hlText(g, 'Đang tải…', W / 2, y + 110, 14, sub); return; }
    const hy = y + 90; hlText(g, 'Hạng', x + 14, hy, 11, { ...sub, a: 'left', w: 800 }); hlText(g, 'Tên', x + 52, hy, 11, { ...sub, a: 'left', w: 800 }); hlText(g, 'Ván', x + w - 170, hy, 11, { ...sub, a: 'right', w: 800 }); hlText(g, 'Thắng', x + w - 118, hy, 11, { ...sub, a: 'right', w: 800 }); hlText(g, 'Lời ròng', x + w - 14, hy, 11, { ...sub, a: 'right', w: 800 });
    const ly0 = hy + 12, ly1 = y + h - 58, maxScroll = Math.max(0, b.top.length * rowH - (ly1 - ly0)); HL.bscroll = Math.max(0, Math.min(maxScroll, HL.bscroll)); HL.bmax = maxScroll; HL.barea = { x, y: ly0, w, h: ly1 - ly0 };
    g.save(); g.beginPath(); g.rect(x + 2, ly0, w - 4, ly1 - ly0); g.clip();
    b.top.forEach((u, i) => { const ry = hy + 20 + i * rowH - HL.bscroll; if (ry < ly0 - 4 || ry > ly1 + 14) return; if (u.me) { g.fillStyle = 'rgba(242,198,64,.5)'; g.fillRect(x + 6, ry - 11, w - 12, rowH - 2); } hlBoardRow(g, x, w, ry, i + 1, u, sub); });
    g.restore();
    if (maxScroll > 0) { const th = Math.max(24, (ly1 - ly0) * (ly1 - ly0) / (b.top.length * rowH)), ty = ly0 + (ly1 - ly0 - th) * HL.bscroll / maxScroll; g.fillStyle = 'rgba(29,25,21,.35)'; g.fillRect(x + w - 6, ty, 3, th); }
    const mi = b.top.findIndex(u => u.me), myRow = mi >= 0 ? hy + 20 + mi * rowH - HL.bscroll : null, hidden = mi >= 0 ? (myRow < ly0 || myRow > ly1) : !!b.me;
    if (hidden && b.me) { const ry = ly1 + 14; g.fillStyle = 'rgba(242,198,64,.5)'; g.fillRect(x + 6, ry - 11, w - 12, rowH - 2); hlBoardRow(g, x, w, ry, b.me.pos || '–', { n: 'Bạn', r: b.me.r, w: b.me.w, net: b.me.net }, sub); }
    hlText(g, `${b.total} người ${b.per === 'a' ? 'đã chơi' : b.per === 'd' ? 'chơi hôm nay' : b.per === 'w' ? 'chơi tuần này' : 'chơi tháng này'} · xếp theo lời ròng (ăn − mất)`, W / 2, y + h - 48, 11, { ...sub, al: .7 });
  } else {
    const s = HL.stat; if (!s) { hlText(g, 'Chưa có số liệu', W / 2, y + 90, 14, sub); return; }
    const hy = y + 58; hlText(g, `Tổng: ${s.r} ván · thắng ${s.w} · ăn ${s.won} đ · mất ${s.lost} đ · lời ròng ${s.won - s.lost >= 0 ? '+' : '−'}${Math.abs(s.won - s.lost)} đ`, W / 2, hy, 12, { f: hlSans, w: 700, o: false });
    const gy = hy + 22; hlText(g, 'Trò', x + 14, gy, 11, { ...sub, a: 'left', w: 800 }); hlText(g, 'Ván', x + w - 150, gy, 11, { ...sub, a: 'right', w: 800 }); hlText(g, 'Thắng', x + w - 104, gy, 11, { ...sub, a: 'right', w: 800 }); hlText(g, 'Ăn', x + w - 58, gy, 11, { ...sub, a: 'right', w: 800 }); hlText(g, 'Mất', x + w - 14, gy, 11, { ...sub, a: 'right', w: 800 });
    HL_GAMES.forEach((k, i) => { const a = s.g[k] || [0, 0, 0, 0], ry = gy + 22 + i * rowH; hlText(g, HL_G[k].name, x + 14, ry, 12, { ...sub, a: 'left' }); hlText(g, String(a[0]), x + w - 150, ry, 12, { ...sub, a: 'right' }); hlText(g, String(a[1]), x + w - 104, ry, 12, { ...sub, a: 'right' }); hlText(g, String(a[2]), x + w - 58, ry, 12, { ...sub, a: 'right', c: '#2f6a4c' }); hlText(g, String(a[3]), x + w - 14, ry, 12, { ...sub, a: 'right', c: '#a3332a' }); });
  }
}
function hlBoardRow(g, x, w, ry, pos, u, sub) {
  hlText(g, String(pos), x + 14, ry, 12, { ...sub, a: 'left', w: 800 }); hlText(g, u.n || '?', x + 52, ry, 12, { ...sub, a: 'left', w: u.me ? 900 : 600 });
  hlText(g, String(u.r), x + w - 170, ry, 12, { ...sub, a: 'right' }); hlText(g, String(u.w), x + w - 118, ry, 12, { ...sub, a: 'right' });
  hlText(g, `${u.net >= 0 ? '+' : '−'}${Math.abs(u.net)}`, x + w - 14, ry, 12, { ...sub, a: 'right', w: 800, c: u.net >= 0 ? '#2f6a4c' : '#a3332a' });
}

function updateHL(dt) {
  HL.t += dt; hlSync(HL.round); hlFireworks(dt);
  const r = HL.round;   // the boat's taps travel a few at a time
  if (r && r.game === 'boat' && r.state === 'run' && HL.tapAcc > 0 && (HL.tapSent += dt) > .3) { HL.tapSent = 0; const c = Math.min(8, HL.tapAcc); HL.tapAcc -= c; hlSend(r, { k: 't', c }); }
}
const HL_GAMES = ['ten', 'pomelo', 'tuong', 'balloon', 'minnum', 'lantern', 'boat', 'hang', 'giua', 'trong', 'nho'];

// how many people are in the room, shown on the chapter card (asked at most every 20 s while the list is up)
const HLON = { n: null, at: 0, busy: false };
function hlOnlineText() { return HLON.n === null ? lg('Đang xem phòng…', 'Checking the room…') : HLON.n === 0 ? lg('Chưa có ai trong phòng', 'Nobody in the room yet') : lgf('{n} người đang chơi', '{n} playing now', { n: HLON.n }); }
function hlOnlineAsk() {
  if (HLON.busy || Date.now() - HLON.at < 20000) return; HLON.busy = true; HLON.at = Date.now();
  fetch(HL_ONLINE_URL).then(r => r.json()).then(j => {
    HLON.n = Math.max(0, +j.n || 0);
    const card = [...document.querySelectorAll('#chapCards .card')].find(b => (b.querySelector('.ch') || {}).textContent === '會村'), st = card && card.querySelector('.st');
    if (st) st.textContent = hlOnlineText();
  }).catch(() => {}).then(() => { HLON.busy = false; });
}
registerChapter({
  id: 5, modes: ['hlplay'],
  card: { num: lg('Chương V', 'Chapter V'), han: '會村', name: lg('Hội Làng', 'Village Fair'), desc: lg('Ngày hội chung của làng: cùng vào chơi cho vui, thắng sẽ có phần thưởng.', 'The village fair: join in for fun, and winners get a prize.'), bg: '#cdd9b4' },
  progress: () => { hlOnlineAsk(); return hlOnlineText(); },
  hasProgress: () => HL_SAVE.r > 0,
  direct: startHL,
  album() {},
  hide() { if (HL_NET.wantOn) HL_NET.close(); },
  update: updateHL, render: renderHL, key: hlKey,
  pointer: { down: hlDown, move: hlMove, up: hlUp },
  next() { showChapters(); }, retry() { startHL(); },
});
