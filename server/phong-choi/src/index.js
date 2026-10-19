/* Phòng chơi chung của Đám Cưới Chuột (chương IX · Hội Làng), chạy trên Cloudflare Durable Objects.
   MỘT phòng cho tất cả (idFromName('v7'); đổi tên khi đổi giao thức để phòng cũ còn người ở lại chạy nốt mã cũ). Máy chủ giữ giờ chung, lịch các ván, người máy, kết quả, tiền cược và bảng xếp hạng;
   trình duyệt chỉ vẽ và gửi "tôi làm việc này lúc này".

   TIỀN (owner, 2026-10-19): mỗi người chơi trong ván bỏ STAKE đồng từ túi chương IV (người máy bỏ "ảo"), một người thắng ăn cả hũ
   = STAKE × số người trong ván; người thua mất STAKE; không ai thắng thì không ai mất gì. Trình duyệt tự cộng/trừ vào SAVE4.money
   theo kết quả (net) và báo `ok` (đủ tiền chơi) cho máy chủ; hết tiền thì không được xếp chỗ. Ai bỏ qua 2 ván liền thì nghỉ cho tới khi bấm "chơi tiếp".

   Vòng chơi (lặp mãi khi còn người trong phòng): thông báo (4 s, chốt danh sách) → chơi → kết quả (9 s) → ván sau, 11 trò xoay vòng:
     ten      đồng hồ chạy 0..3 s rồi bị che; bấm gần mốc 10,000 s nhất thắng.
     pomelo   quả bưởi treo dây rơi nhanh dần xuống đầu; bấm dừng gần đầu nhất mà chưa trúng thì thắng.
     tuong    "tượng gỗ": giữ để chạy khi mèo quay lưng, mèo quay lại thì thả ra; ai tới đích trước (không bị bắt) thắng.
     balloon  giữ để thổi bóng, thả ra để chốt; quả nào to nhất mà chưa nổ (cả phòng chung một ngưỡng nổ bí mật) thắng.
     minnum   mỗi người chọn một số, số trùng bị gạch, số nhỏ nhất không trùng thắng.
     lantern  đèn lồng đổi màu lúc bất ngờ; bấm nhanh nhất thắng, bấm sớm thì loại.
     boat     đua thuyền: bấm liên tục 10 s, nhiều lượt nhất thắng.
     hang     chọn 1 trong 3 hang, mèo vồ một hang (hay vồ hang đông); 5 vòng, người sống sót (bốc thăm nếu nhiều) thắng.
     giua     thanh trượt chạy qua lại, bấm dừng đúng vạch giữa.
     trong    nghe 4 nhịp trống rồi tự giữ nhịp, bấm đúng nhịp thứ 9.
     nho      nhớ chuỗi trống sáng lên rồi bấm lại đúng thứ tự; đúng nhiều nhất, nhanh nhất thắng.
   Người vào giữa ván chỉ xem. Cần ít nhất MINP (2) người thật đủ tiền cược, không có người máy; chưa đủ thì phòng chờ.

   Giao thức JSON qua WebSocket. client → server: hello {dev, name, look, ok}, bal {ok}, join, sync {c}, pong {s}, act {n, k, …}, board.
   server → client: welcome, players, round, in, prog, go, hole, result, stat, idle, board, sync, ping. */
import { DurableObject } from 'cloudflare:workers';

const ORIGIN_OK = /^(https:\/\/(www\.)?damcuoichuot\.com|http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?|null)$/;
const BAD = /(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)/i;
const BOT_NAMES = ['Tí', 'Tèo', 'Mít', 'Bơ', 'Nhím', 'Sóc', 'Cốm', 'Bống', 'Tũn', 'Xíu', 'Na', 'Bin', 'Đậu', 'Lạc', 'Gạo', 'Nếp', 'Ngô', 'Khoai', 'Sen', 'Cải'];
const GAMES = ['ten', 'pomelo', 'tuong', 'balloon', 'minnum', 'lantern', 'boat', 'hang', 'giua', 'trong', 'nho'];
const LOOK = { role: ['chong', 'vo'], age: ['tre', 'trung', 'gia'], body: ['vua', 'beo', 'gay', 'cao'], fur: 16, robe: 16, skirt: 16, pants: 16, top: 16 };   // looks are only forwarded, the browser cleans them again

const TESTDEV = /^(testdev|boardreader|dbgdev|realp|realq|realz|realsolo|viewer)/;   // devices used by test.mjs: never written to the board
const T = {
  MINP: 2, MAXP: 30, STAKE: 10,
  ANNOUNCE: 4000, RESULT: 9000, FIRST: 3000, WAIT: 2500,
  MAXMSG: 40,
  TEN_TARGET: 10000, TEN_SHOW: 3000, TEN_GRACE: 3200,
  POM_MIN: 2000, POM_SPAN: 1500, POM_GRACE: 700,
  TUONG_LEN: 18000, TUONG_D: 100, TUONG_V: 24, TUONG_GRACE: 250,
  BAL_LEN: 9000, BAL_MIN: 1800, BAL_SPAN: 3400,
  MIN_LEN: 12000,
  LAN_MIN: 2500, LAN_SPAN: 5000, LAN_WAIT: 2500, LAN_FS: 90,
  BOAT_LEN: 10000, BOAT_CPS: 11,
  HANG_HOLES: 3, HANG_ROUNDS: 5, HANG_PICK: 4000, HANG_REVEAL: 1800,
  GIUA_LEN: 8000,
  TRONG_BEATS: 4, TRONG_N: 8, TRONG_GRACE: 2500,
  NHO_STEP: 700, NHO_WAIT: 11000,
};
// board periods (Vietnam time, UTC+7): d day, w week (Monday first), m month, a all time
const pkey = (per, t = Date.now()) => { const v = new Date(t + 7 * 36e5), day = Math.floor((t + 7 * 36e5) / 864e5); return per === 'd' ? day : per === 'w' ? Math.floor((day + 3) / 7) : v.getUTCFullYear() * 12 + v.getUTCMonth(); };
const PERS = ['d', 'w', 'm'];
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const pick = a => a[(Math.random() * a.length) | 0];

/* the 'tuong' race, simulated in steps of 20 ms from a player's hold / release events (the browser runs the same code, so
   everyone's runner can be drawn live from the events alone) */
function tuongSim(cfg, ev, end) {
  let pos = 0, hold = false, k = 0, ph = 0, caught = null, fin = null;
  for (let t = 0; t <= end; t += 20) {
    while (k < ev.length && ev[k][0] <= t) hold = ev[k++][1] === 'd';
    while (ph + 1 < cfg.ph.length && cfg.ph[ph + 1][0] <= t) ph++;
    if (hold && cfg.ph[ph][1] === 1 && t >= cfg.ph[ph][0] + cfg.grace) { caught = t; break; }
    if (hold) { pos += cfg.v * .02; if (pos >= cfg.D) { fin = t; pos = cfg.D; break; } }
  }
  return { pos, caught, fin };
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/ws') {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
      const o = req.headers.get('Origin') || 'null';
      if (!ORIGIN_OK.test(o)) return new Response('forbidden', { status: 403 });
      return env.ROOM.get(env.ROOM.idFromName('v7')).fetch(req);
    }
    if (u.pathname === '/online') {   // how many people are in the room now (shown on the chapter card)
      const o = req.headers.get('Origin') || '', h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
      if (ORIGIN_OK.test(o)) h['access-control-allow-origin'] = o;
      const r = await env.ROOM.get(env.ROOM.idFromName('v7')).fetch(new Request(req.url.replace('/online', '/count')));
      return new Response(await r.text(), { headers: h });
    }
    if (u.pathname === '/stats') {   // the owner's daily numbers: Authorization: Bearer <ADMIN secret>
      if (!env.ADMIN || req.headers.get('Authorization') !== 'Bearer ' + env.ADMIN) return new Response('forbidden', { status: 403 });
      return env.ROOM.get(env.ROOM.idFromName('v7')).fetch(new Request(req.url.replace('/stats', '/days')));
    }
    return new Response('Đám Cưới Chuột · phòng chơi chung', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.conns = new Map(); this.round = null; this.n = 0; this.recent = []; this.timer = null; this.nextId = 1;
    this.stats = new Map();    // dev → { n, r, w, won, lost, g: { game: [rounds, wins] } }, loaded when a player says hello, saved after every result
    this.top = null; this.topAt = 0; this.dirty = new Set();
  }

  async fetch(req) {
    if (req && new URL(req.url).pathname === '/count') return new Response(JSON.stringify({ n: this.humans().filter(c => !TESTDEV.test(c.dev)).length }));
    if (req && new URL(req.url).pathname === '/days') {
      const all = await this.ctx.storage.list({ prefix: 'd:', reverse: true, limit: 90 }), out = [];
      for (const [k, v] of all) out.push({ day: k.slice(2), players: v.players, peak: v.peak, peakAt: v.peakAt, rounds: v.rounds, maxSeat: v.maxSeat });
      return new Response(JSON.stringify(out, null, 1), { headers: { 'content-type': 'application/json' } });
    }
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    server.accept();
    const c = { ws: server, id: 'p' + (this.nextId++), dev: '', name: '', look: null, joined: false, ok: false, idle: false, miss: 0, rtt: 150, seen: Date.now(), win: 0, cnt: 0 };
    this.conns.set(c.id, c);
    server.addEventListener('message', e => this.onMsg(c, e.data));
    server.addEventListener('close', () => this.onClose(c));
    server.addEventListener('error', () => this.onClose(c));
    return new Response(null, { status: 101, webSocket: client });
  }

  send(c, o) { try { c.ws.send(JSON.stringify(o)); } catch (e) {} }
  all(o) { const s = JSON.stringify(o); for (const c of this.conns.values()) if (c.joined) { try { c.ws.send(s); } catch (e) {} } }
  humans() { return [...this.conns.values()].filter(c => c.joined); }

  async onMsg(c, raw) {
    const now = Date.now();
    if (now - c.win > 1000) { c.win = now; c.cnt = 0; } if (++c.cnt > T.MAXMSG) return;
    c.seen = now;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    if (m.t === 'hello' && !c.joined) {
      let name = String(m.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
      if (!name || BAD.test(name)) name = 'Chuột ' + c.id.slice(1);
      c.name = name; c.dev = /^[a-z0-9]{12,40}$/.test(m.dev || '') ? m.dev : 'x' + c.id + Math.random().toString(36).slice(2, 10); c.look = this.cleanLook(m.look); c.ok = !!m.ok;
      const st = await this.getStats(c.dev); st.n = name;
      c.joined = true; this.noteJoin(c);
      this.send(c, { t: 'welcome', id: c.id, now: Date.now(), stake: T.STAKE, round: this.pubRound(), players: this.playerList(), stat: this.pubStat(st) });
      this.all({ t: 'players', players: this.playerList() });
      this.wake();
    } else if (m.t === 'sync') this.send(c, { t: 'sync', c: m.c, s: Date.now() });
    else if (m.t === 'pong') { const r = Date.now() - (+m.s || 0); if (r >= 0 && r < 5000) c.rtt = c.rtt * .6 + r * .4; }
    else if (!c.joined) return;
    else if (m.t === 'bal') { const ok = !!m.ok; if (ok !== c.ok) { c.ok = ok; this.all({ t: 'players', players: this.playerList() }); } }
    else if (m.t === 'join') { if (c.idle) { c.idle = false; c.miss = 0; this.all({ t: 'players', players: this.playerList() }); } }
    else if (m.t === 'act') this.onAct(c, m);
    else if (m.t === 'board') this.sendBoard(c, m.per);
  }
  cleanLook(l) {
    if (!l || typeof l !== 'object') return null;
    const o = {}; for (const k of Object.keys(LOOK)) { const v = String(l[k] ?? '').slice(0, 16); if (v) o[k] = v; } return o;
  }
  onClose(c) {
    if (!this.conns.delete(c.id)) return;
    if (c.joined) this.all({ t: 'players', players: this.playerList() });
    if (!this.humans().length) this.stop();
  }
  playerList() {
    const r = this.round, seated = r ? r.seated : null;
    return [...this.humans().map(c => ({ id: c.id, name: c.name, look: c.look, bot: false, seat: !!(seated && seated.has(c.id)), ok: c.ok, idle: c.idle })),
      ...(r ? [...r.bots.values()].map(b => ({ id: b.id, name: b.name, sort: b.sort, bot: true, seat: true, ok: true, idle: false })) : [])];
  }
  pubRound() {
    const r = this.round; if (!r || r.state === 'wait') return null;
    return { solo: !!r.solo, n: r.n, game: r.game, announce: r.announce, t0: r.t0, state: r.state, seated: [...r.seated.keys()], cfg: r.cfg, live: r.live, holes: r.holes, go: !!r.sent, result: r.state === 'result' ? r.result : undefined };
  }

  /* ---- the day's numbers for the owner: different players, most online at once, rounds, the fullest round (Vietnam date) ---- */
  async dayDoc() {
    const k = 'd:' + new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
    if (!this.day || this.day.k !== k) this.day = { k, v: (await this.ctx.storage.get(k)) || { players: 0, peak: 0, peakAt: 0, rounds: 0, maxSeat: 0, devs: {} } };
    return this.day;
  }
  async noteDay(fn) {
    const d = await this.dayDoc(); if (fn(d.v) !== false) { try { await this.ctx.storage.put(d.k, d.v); } catch (e) {} }
  }
  noteJoin(c) {
    if (TESTDEV.test(c.dev)) return;
    const online = this.humans().filter(x => !TESTDEV.test(x.dev)).length;
    this.noteDay(v => {
      let ch = false;
      if (!v.devs[c.dev.slice(0, 12)]) { v.devs[c.dev.slice(0, 12)] = 1; v.players = Object.keys(v.devs).length; ch = true; }
      if (online > v.peak) { v.peak = online; v.peakAt = Date.now(); ch = true; }
      return ch;
    });
  }
  noteRound(r) {
    if (r.solo) return;
    const n = [...r.seated.values()].filter(c => !TESTDEV.test(c.dev)).length; if (!n) return;
    this.noteDay(v => { v.rounds++; if (n > v.maxSeat) v.maxSeat = n; });
  }

  /* ---- stats and the board ---- */
  async getStats(dev) {
    let s = this.stats.get(dev);
    if (!s) { s = (await this.ctx.storage.get('u:' + dev)) || { n: '', r: 0, w: 0, won: 0, lost: 0, g: {} }; this.stats.set(dev, s); }
    return s;
  }
  pubStat(s) { return { r: s.r, w: s.w, won: s.won, lost: s.lost, g: s.g }; }
  async sendBoard(c, per) {
    per = per === 'd' || per === 'w' || per === 'm' ? per : 'a';
    const now = Date.now(); this.tops = this.tops || {};
    let cur = this.tops[per];
    if (!cur || now - cur.at > 30000) {
      const all = await this.ctx.storage.list({ prefix: 'u:', limit: 3000 }), rows = [];
      const junk = []; for (const [k, v] of all) { if (TESTDEV.test(k.slice(2))) { junk.push(k); continue; } const x = per === 'a' ? v : (v.p && v.p[per] && v.p[per].k === pkey(per) ? v.p[per] : null); if (x && x.r > 0) rows.push({ dev: k.slice(2), n: v.n, r: x.r, w: x.w, won: x.won, lost: x.lost, net: x.won - x.lost }); }
      if (junk.length) try { await this.ctx.storage.delete(junk); } catch (e) {}   // the test clients (test.mjs) are not players
      rows.sort((a, b) => b.net - a.net || b.w - a.w || a.dev.localeCompare(b.dev));
      cur = this.tops[per] = { rows, at: now };
    }
    const top = cur.rows, me = top.findIndex(x => x.dev === c.dev);
    this.send(c, { t: 'board', per, total: top.length, top: top.slice(0, 30).map(x => ({ n: x.n, r: x.r, w: x.w, won: x.won, lost: x.lost, net: x.net, me: x.dev === c.dev })), me: me >= 0 ? { pos: me + 1, ...top[me], dev: undefined } : null });
  }

  /* ---- the schedule ---- */
  wake() { if (!this.timer) { this.timer = setInterval(() => this.tick(), 100); if (!this.round) this.startRound(Date.now() + T.FIRST); } }
  stop() { clearInterval(this.timer); this.timer = null; this.round = null; }
  eligible() { return this.humans().filter(c => c.ok && !c.idle); }
  tick() {
    const now = Date.now();
    for (const c of [...this.conns.values()]) if (now - c.seen > 20000) { try { c.ws.close(1001, 'idle'); } catch (e) {} this.onClose(c); }
    if (!this.timer) return;
    if (now - (this.pingAt || 0) > 4000) { this.pingAt = now; for (const c of this.conns.values()) this.send(c, { t: 'ping', s: now }); }
    const r = this.round; if (!r) return;
    if (r.state === 'wait') { if (now >= r.next) this.startRound(now + 200); return; }
    if (r.state === 'announce' && now >= r.t0) r.state = 'run';
    if (r.state === 'run') {
      for (const a of r.plan) if (!a.done && now >= r.t0 + a.p) { a.done = true; this.act(r, a.id, a.a, a.p, now, true); }
      this.gameTick(r, now);
      if (r.state === 'run' && (now >= r.deadline || this.allDone(r))) this.finish(r);
    } else if (r.state === 'result' && now >= r.next) this.startRound(now + 200);
  }
  startRound(at) {
    const hs0 = this.eligible(); if (!this.humans().length) { this.stop(); return; }
    // one person alone: a practice round, no stake, nothing on the board
    const lone = this.humans().filter(c => !c.idle), solo = hs0.length < T.MINP && lone.length === 1, hs = solo ? lone : hs0;
    if (!solo && hs.length < T.MINP) { this.round = { state: 'wait', next: Date.now() + T.WAIT, n: this.n, seated: new Map(), bots: new Map(), plan: [] }; this.all({ t: 'round', n: this.n, wait: true }); this.all({ t: 'players', players: this.playerList() }); return; }
    // a shuffled bag: every game once in random order, then a new shuffle (the first of a new bag is never the last played)
    if (!this.bag || !this.bag.length) { const b = [...GAMES]; for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } if (b[0] === this.lastGame) b.push(b.shift()); this.bag = b; }
    const game = this.bag.shift(); this.lastGame = game;
    // more people than seats: those who sat out the most recent rounds go first
    const order = hs.map((c, i) => [c, i]).sort((a, b) => ((a[0].last || 0) - (b[0].last || 0)) || a[1] - b[1]).map(x => x[0]);
    const seated = new Map(); for (const c of order.slice(0, T.MAXP)) { seated.set(c.id, c); c.last = this.n + 1; }
    const bots = new Map();   // no bots any more: a lone player just practises { const id = 'b' + (k + 1); bots.set(id, { id, name: BOT_NAMES[(this.n * 3 + k * 7) % BOT_NAMES.length], sort: (this.n + k * 7) % 27, skill: rnd(0, 1) }); }
    const r = { solo, n: ++this.n, game, announce: at, t0: at + T.ANNOUNCE, state: 'announce', seated, bots, cfg: {}, live: [], plan: [], inp: new Map(), ev: new Map(), sub: 0 };
    this.setup(r);
    this.round = r;
    for (const c of seated.values()) c.inRound = false;
    this.all({ t: 'players', players: this.playerList() });
    this.all({ t: 'round', ...this.pubRound(), bots: [...bots.values()].map(b => ({ id: b.id, name: b.name, sort: b.sort })) });
  }
  ids(r) { return [...r.seated.keys(), ...r.bots.keys()]; }
  push(r, id, p, a) { r.plan.push({ id, p: Math.max(1, Math.round(p)), a, done: false }); }

  /* ---- per game: set up (including what the bots will do) ---- */
  setup(r) {
    const g = r.game, ids = this.ids(r), t0 = r.t0, cfg = r.cfg, bots = [...r.bots.values()];
    if (g === 'ten') {
      cfg.target = T.TEN_TARGET; cfg.show = T.TEN_SHOW; r.deadline = t0 + cfg.target + T.TEN_GRACE;
      for (const b of bots) this.push(r, b.id, cfg.target + gauss() * (70 + b.skill * 230), { k: 'p' });
    } else if (g === 'trong') {
      const b0 = ri(520, 760); cfg.b = b0; cfg.beats = T.TRONG_BEATS; cfg.target = b0 * T.TRONG_N; r.deadline = t0 + cfg.target + T.TRONG_GRACE;
      for (const b of bots) this.push(r, b.id, cfg.target + gauss() * (30 + b.skill * 160), { k: 'p' });
    } else if (g === 'pomelo') {
      cfg.tf = {}; for (const id of ids) cfg.tf[id] = ri(T.POM_MIN, T.POM_MIN + T.POM_SPAN);
      r.deadline = t0 + Math.max(...Object.values(cfg.tf)) + T.POM_GRACE;
      for (const b of bots) { const tf = cfg.tf[b.id], risky = Math.random() < .12, aim = rnd(.02, .3); this.push(r, b.id, risky ? tf + 50 : tf * Math.sqrt(1 - aim), { k: 'p' }); }
    } else if (g === 'giua') {
      cfg.T = {}; cfg.phi = {}; for (const id of ids) { cfg.T[id] = ri(1100, 1900); cfg.phi[id] = +Math.random().toFixed(3); }
      r.deadline = t0 + T.GIUA_LEN;
      for (const b of bots) {   // the first time after a random moment that the slider is near the middle, to the bot's skill
        const want = .5 + (Math.random() < .5 ? -1 : 1) * Math.abs(gauss()) * (.015 + (1 - b.skill) * .1); let p = rnd(1500, 5500);
        for (let k = 0; k < 600; k++, p += 10) if (Math.abs(this.giuaX(cfg, b.id, p) - want) < .012) break;
        this.push(r, b.id, p, { k: 'p' });
      }
    } else if (g === 'tuong') {
      const ph = []; let t = 0, dir = 0; while (t < T.TUONG_LEN) { ph.push([Math.round(t), dir]); t += dir === 0 ? rnd(2200, 3600) : rnd(1000, 1900); dir ^= 1; }
      cfg.ph = ph; cfg.D = T.TUONG_D; cfg.v = T.TUONG_V; cfg.grace = T.TUONG_GRACE; cfg.len = T.TUONG_LEN; r.deadline = t0 + T.TUONG_LEN + 300;
      for (const b of bots) {
        const slow = .4 + b.skill * .6;   // a skilled bot reacts quickly and stops just before the cat turns
        for (let i = 0; i < ph.length; i += 2) {
          const start = ph[i][0], face = ph[i + 1] ? ph[i + 1][0] : T.TUONG_LEN;
          const down = start + rnd(220, 520) * (2 - slow), mistake = Math.random() < .1 + (1 - b.skill) * .1;
          const up = mistake ? face + rnd(300, 700) : face - rnd(40, 260) * (2 - slow);
          if (up > down + 120) { this.push(r, b.id, down, { k: 'd' }); this.push(r, b.id, up, { k: 'u' }); }
        }
      }
    } else if (g === 'balloon') {
      cfg.len = T.BAL_LEN; r.deadline = t0 + T.BAL_LEN; r.thr = {}; const th = ri(T.BAL_MIN, T.BAL_MIN + T.BAL_SPAN); for (const id of ids) r.thr[id] = th;   // one mark for the whole room
      for (const b of bots) { const d = rnd(300, 1800), hold = r.thr[b.id] * (.45 + b.skill * .6 + gauss() * .08); this.push(r, b.id, d, { k: 'd' }); this.push(r, b.id, d + hold, { k: 'u' }); }
    } else if (g === 'minnum') {
      cfg.max = Math.max(5, Math.min(15, Math.ceil(ids.length / 2) + 1)); r.deadline = t0 + T.MIN_LEN; cfg.len = T.MIN_LEN;
      for (const b of bots) { let w = [], s = 0; for (let v = 1; v <= cfg.max; v++) { const x = 1 / v ** 1.1 + Math.random() * .1; w.push(x); s += x; } let q = Math.random() * s, v = 1; while (v < cfg.max && (q -= w[v - 1]) > 0) v++; this.push(r, b.id, rnd(2000, 9500), { k: 'v', v }); }
    } else if (g === 'lantern') {
      r.s = t0 + T.LAN_MIN + Math.random() * T.LAN_SPAN; cfg.min = T.LAN_MIN; cfg.max = T.LAN_MIN + T.LAN_SPAN; r.deadline = r.s + T.LAN_WAIT; r.sent = false;
      for (const b of bots) { const early = Math.random() < .08; this.push(r, b.id, (r.s - t0) + (early ? -rnd(50, 800) : Math.max(150, 270 + gauss() * (50 + (1 - b.skill) * 60) - b.skill * 40)), { k: 'p', bot: true }); }
    } else if (g === 'boat') {
      cfg.len = T.BOAT_LEN; r.deadline = t0 + T.BOAT_LEN + 200; r.tap = new Map(); r.progAt = 0;
      for (const b of bots) { const cps = 5.2 + b.skill * 3.6; for (let k = 1; k <= 20; k++) this.push(r, b.id, k * 500 + rnd(-40, 40), { k: 't', c: Math.max(0, Math.round(cps * .5 + gauss())) }); }
    } else if (g === 'hang') {
      cfg.holes = T.HANG_HOLES; cfg.rounds = T.HANG_ROUNDS; cfg.pick = T.HANG_PICK; cfg.slot = T.HANG_PICK + T.HANG_REVEAL; r.deadline = t0 + cfg.rounds * cfg.slot + 200;
      r.alive = new Set(ids); r.sub = 0; r.picks = new Map(); r.survived = new Map(ids.map(id => [id, 0])); r.holes = [];
      for (const b of bots) for (let i = 0; i < cfg.rounds; i++) this.push(r, b.id, i * cfg.slot + rnd(900, 3400), { k: 'h', v: ri(0, cfg.holes - 1), i });
    } else if (g === 'nho') {
      const len = ri(6, 8); cfg.seq = Array.from({ length: len }, () => ri(0, 3)); cfg.step = T.NHO_STEP; cfg.showEnd = len * T.NHO_STEP + 500; r.deadline = t0 + cfg.showEnd + T.NHO_WAIT;
      r.prog = new Map(ids.map(id => [id, { c: 0, bad: false, at: 0 }]));
      for (const b of bots) { const good = .84 + b.skill * .15; let p = cfg.showEnd + rnd(500, 1500); for (let i = 0; i < len; i++) { p += rnd(380, 900); const ok = Math.random() < good; this.push(r, b.id, p, { k: 'm', v: ok ? cfg.seq[i] : (cfg.seq[i] + 1 + ri(0, 2)) % 4 }); if (!ok) break; } }
    }
  }
  giuaX(cfg, id, p) { const u = ((p / cfg.T[id] + cfg.phi[id]) % 2 + 2) % 2; return u < 1 ? u : 2 - u; }

  /* ---- input ---- */
  onAct(c, m) {
    const r = this.round, now = Date.now();
    if (!r || r.state !== 'run' || m.n !== r.n || !r.seated.has(c.id)) return;
    c.inRound = true;
    const lat = Math.max(0, Math.min(1500, c.rtt / 2));
    let at = +m.at;   // the browser's estimate of the server clock at the moment of the action; trusted only within what the measured latency allows
    if (!isFinite(at) || at > now + 30 || now - at > lat + 150) at = now - lat;
    this.act(r, c.id, m, Math.round(at - r.t0), now, false, lat);
  }
  live(r, o) { r.live.push(o); this.all({ t: 'in', n: r.n, ...o }); }
  // one action by a person (validated above) or a bot, p = ms after t0
  act(r, id, a, p, now, bot, lat = 0) {
    const g = r.game, cfg = r.cfg, inp = r.inp; if (p < 0 && g !== 'minnum' && g !== 'boat' && g !== 'hang' && g !== 'nho') return;
    if (g === 'ten' || g === 'trong') {
      if (a.k !== 'p' || inp.has(id)) return; inp.set(id, { p }); this.live(r, { id, k: 'p' });
    } else if (g === 'pomelo') {
      if (a.k !== 'p' || inp.has(id)) return; const hit = p >= cfg.tf[id]; inp.set(id, { p, hit }); this.live(r, { id, k: 'p', p, hit });
    } else if (g === 'giua') {
      if (a.k !== 'p' || inp.has(id)) return; inp.set(id, { p }); this.live(r, { id, k: 'p', p });
    } else if (g === 'tuong') {
      if (a.k !== 'd' && a.k !== 'u') return;
      const ev = r.ev.get(id) || []; r.ev.set(id, ev); const holding = ev.length && ev[ev.length - 1][1] === 'd';
      if ((a.k === 'd') === !!holding || (ev.length && p < ev[ev.length - 1][0])) return;
      { const s = tuongSim(cfg, ev, Math.max(0, p)); if (s.caught !== null || s.fin !== null) return; }   // already caught or home at the moment of this action
      ev.push([p, a.k]); this.live(r, { id, k: a.k, p });
    } else if (g === 'balloon') {
      const s = inp.get(id) || {}; inp.set(id, s);
      if (a.k === 'd' && s.d === undefined) { s.d = p; this.live(r, { id, k: 'd', p }); }
      else if (a.k === 'u' && s.d !== undefined && s.u === undefined && !s.pop) {
        if (p - s.d >= r.thr[id]) { s.pop = s.d + r.thr[id]; this.live(r, { id, k: 'pop', p: s.pop }); }
        else { s.u = p; this.live(r, { id, k: 'u', p }); }
      }
    } else if (g === 'minnum') {
      const first = !inp.has(id), v = a.v | 0; if (v < 1 || v > cfg.max) return; inp.set(id, { v }); if (first) this.live(r, { id, k: 'v' });
    } else if (g === 'lantern') {
      if (a.k !== 'p' || inp.has(id)) return;
      const adj = bot ? p - (r.s - r.t0) : p - (r.s - r.t0) - lat, fs = adj < T.LAN_FS;
      inp.set(id, { rt: Math.round(adj), fs }); this.live(r, { id, k: 'p', fs });
    } else if (g === 'boat') {
      if (a.k !== 't' || p > T.BOAT_LEN + 100) return; const cur = inp.get(id) || { c: 0 }; inp.set(id, cur);
      const cap = Math.floor(T.BOAT_CPS * Math.max(0, p) / 1000) + 3; cur.c = Math.min(cap, cur.c + Math.max(0, Math.min(8, a.c | 0)));
    } else if (g === 'hang') {
      if (a.k !== 'h' || (a.i | 0) !== r.sub || !r.alive.has(id)) return; const phase = p - r.sub * cfg.slot; if (phase < 0 || phase > cfg.pick) return;
      const first = !r.picks.has(id); r.picks.set(id, a.v | 0); if (first) this.live(r, { id, k: 'h', i: r.sub });
    } else if (g === 'nho') {
      if (a.k !== 'm' || p < cfg.showEnd - 150) return; const pr = r.prog.get(id); if (!pr || pr.bad || pr.c >= cfg.seq.length) return;
      if ((a.v | 0) === cfg.seq[pr.c]) { pr.c++; pr.at = p; } else pr.bad = true;
      this.live(r, { id, k: 'm', c: pr.c, bad: pr.bad });
    }
  }
  gameTick(r, now) {
    const g = r.game, p = now - r.t0;
    if (g === 'balloon') {
      for (const [id, s] of r.inp) if (s.d !== undefined && s.u === undefined && !s.pop && p >= s.d + r.thr[id] + (this.conns.get(id) ? Math.min(600, this.conns.get(id).rtt / 2) + 150 : 120)) { s.pop = s.d + r.thr[id]; this.live(r, { id, k: 'pop', p: s.pop }); }
    } else if (g === 'lantern') {
      if (!r.sent && now >= r.s) { r.sent = true; this.all({ t: 'go', n: r.n }); }
    } else if (g === 'boat') {
      if (now - r.progAt >= 500 && p > 0) { r.progAt = now; const o = {}; for (const [id, s] of r.inp) o[id] = s.c; this.all({ t: 'prog', n: r.n, p: o }); }
    } else if (g === 'hang') this.hangTick(r, p);
  }
  hangTick(r, p) {
    const cfg = r.cfg;
    while (r.sub < cfg.rounds && r.alive.size > 1 && p >= r.sub * cfg.slot + cfg.pick) {
      const i = r.sub, alive = [...r.alive], cnt = new Array(cfg.holes).fill(0);
      for (const id of alive) { const v = r.picks.get(id); if (v !== undefined && v >= 0 && v < cfg.holes) cnt[v]++; }
      let cat; if (Math.random() < .6) { const mx = Math.max(...cnt), c2 = cnt.map((n, v) => n === mx ? v : -1).filter(v => v >= 0); cat = pick(c2); } else cat = ri(0, cfg.holes - 1);
      let out = alive.filter(id => r.picks.get(id) === cat || r.picks.get(id) === undefined);
      if (out.length === alive.length) out = [];   // the cat finds nobody if it would find everybody
      for (const id of out) r.alive.delete(id); for (const id of r.alive) r.survived.set(id, i + 1);
      const picks = {}; for (const id of alive) picks[id] = r.picks.get(id) ?? -1;
      r.holes.push({ i, cat, picks, out });
      this.all({ t: 'hole', n: r.n, i, cat, picks, out });
      r.picks = new Map(); r.sub++;
    }
    // one mouse left: end after the last reveal instead of waiting for the remaining rounds
    if (r.sub > 0 && r.alive.size <= 1) r.deadline = Math.min(r.deadline, r.t0 + r.sub * cfg.slot + 100);
  }

  /* ---- ending a round ---- */
  allDone(r) {
    const g = r.game, ids = this.ids(r);
    if (g === 'ten' || g === 'trong' || g === 'pomelo' || g === 'giua') return ids.every(id => r.inp.has(id));
    if (g === 'balloon') return ids.every(id => { const s = r.inp.get(id); return s && (s.u !== undefined || s.pop); });
    if (g === 'lantern') return r.sent && ids.every(id => r.inp.has(id));
    if (g === 'tuong') { const e = Math.min(T.TUONG_LEN, Date.now() - r.t0); return ids.every(id => { const s = tuongSim(r.cfg, r.ev.get(id) || [], e); return s.caught !== null || s.fin !== null; }); }
    if (g === 'nho') return ids.every(id => { const p = r.prog.get(id); return p.bad || p.c >= r.cfg.seq.length; });
    if (g === 'hang') return false;   // ends at its deadline (after the last reveal)
    return false;
  }
  rows(r) {
    const g = r.game, ids = this.ids(r), cfg = r.cfg, rows = [];
    const rank = (list, better) => { list.sort(better); list.forEach((x, i) => { x.rank = i + 1; }); return list; };
    if (g === 'ten' || g === 'trong') {
      const ok = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); (s ? ok : no).push(s ? { id, v: s.p - cfg.target } : { id, v: null }); }
      return [...rank(ok, (a, b) => Math.abs(a.v) - Math.abs(b.v)), ...no];
    }
    if (g === 'pomelo') {
      const ok = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); if (s && !s.hit) ok.push({ id, v: 1 - (s.p / cfg.tf[id]) ** 2, p: s.p }); else no.push({ id, v: null, hit: true }); }
      return [...rank(ok, (a, b) => a.v - b.v), ...no];
    }
    if (g === 'giua') {
      const ok = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); if (s) ok.push({ id, v: Math.abs(this.giuaX(cfg, id, s.p) - .5), p: s.p }); else no.push({ id, v: null }); }
      return [...rank(ok, (a, b) => a.v - b.v), ...no];
    }
    if (g === 'tuong') {
      const fin = [], alive = [], caught = [];
      for (const id of ids) { const s = tuongSim(cfg, r.ev.get(id) || [], T.TUONG_LEN); if (s.fin !== null) fin.push({ id, v: s.fin, fin: true }); else if (s.caught !== null) caught.push({ id, v: null, pos: s.pos, caught: true }); else alive.push({ id, v: null, pos: s.pos }); }
      rank(fin, (a, b) => a.v - b.v); const al = rank(alive.filter(x => x.pos > 0), (a, b) => b.pos - a.pos); al.forEach(x => { x.rank += fin.length; });
      return [...fin, ...al, ...alive.filter(x => !(x.pos > 0)), ...caught];
    }
    if (g === 'balloon') {
      const ok = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); if (s && s.u !== undefined) ok.push({ id, v: s.u - s.d }); else no.push({ id, v: null, pop: !!(s && s.pop), thr: r.thr[id] }); }
      return [...rank(ok, (a, b) => b.v - a.v), ...no];
    }
    if (g === 'minnum') {
      const cnt = new Map(); for (const id of ids) { const s = r.inp.get(id); if (s) cnt.set(s.v, (cnt.get(s.v) || 0) + 1); }
      const uni = [], dup = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); if (!s) no.push({ id, v: null }); else if (cnt.get(s.v) === 1) uni.push({ id, v: s.v }); else dup.push({ id, v: s.v, dup: true }); }
      return [...rank(uni, (a, b) => a.v - b.v), ...dup, ...no];
    }
    if (g === 'lantern') {
      const ok = [], fs = [], no = [];
      for (const id of ids) { const s = r.inp.get(id); if (!s) no.push({ id, v: null }); else if (s.fs) fs.push({ id, v: null, fs: true, rt: s.rt }); else ok.push({ id, v: s.rt }); }
      return [...rank(ok, (a, b) => a.v - b.v), ...fs, ...no];
    }
    if (g === 'boat') {
      const l = ids.map(id => ({ id, v: (r.inp.get(id) || { c: 0 }).c })); return rank(l, (a, b) => b.v - a.v);
    }
    if (g === 'hang') {
      const l = ids.map(id => ({ id, v: r.survived.get(id), alive: r.alive.has(id) })); return rank(l, (a, b) => (b.alive - a.alive) || (b.v - a.v));
    }
    if (g === 'nho') {
      const l = ids.map(id => { const p = r.prog.get(id); return { id, v: p.c, bad: p.bad, at: p.at }; }); rank(l, (a, b) => (b.v - a.v) || (a.at - b.at)); return l;
    }
    return rows;
  }
  finish(r) {
    const rows = this.rows(r), N = r.seated.size + r.bots.size, pot = r.solo ? 0 : T.STAKE * N, g = r.game;
    let winner = null;
    if (g === 'hang') { const al = rows.filter(x => x.alive); winner = al.length ? pick(al).id : null; if (winner) { const w = rows.splice(rows.findIndex(x => x.id === winner), 1)[0]; rows.unshift(w); rows.forEach((x, i) => { x.rank = i + 1; }); } }
    else if (g === 'minnum') { const w = rows.find(x => x.rank === 1 && !x.dup && x.v !== null); winner = w ? w.id : null; }
    else if (g === 'lantern' || g === 'ten' || g === 'trong' || g === 'pomelo' || g === 'giua' || g === 'balloon') { const w = rows.find(x => x.rank === 1); winner = w ? w.id : null; }
    else if (g === 'tuong') { const w = rows.find(x => x.rank === 1); winner = w ? w.id : null; }
    else if (g === 'boat') { const w = rows.find(x => x.rank === 1 && x.v > 0); winner = w ? w.id : null; }
    else if (g === 'nho') { const w = rows.find(x => x.rank === 1 && x.v > 0); winner = w ? w.id : null; }
    if (r.solo) winner = null;
    const net = {}, stat = [];
    for (const c of r.seated.values()) {
      if (winner) net[c.id] = c.id === winner ? pot - T.STAKE : -T.STAKE;
      // idle people are rested after two empty rounds, so nobody keeps paying a stake for sitting still
      if (c.inRound) c.miss = 0; else if (++c.miss >= 2) { c.idle = true; this.send(c, { t: 'idle' }); }
      stat.push(c);
    }
    this.noteRound(r);
    r.state = 'result'; r.next = Date.now() + T.RESULT;
    r.result = { rows, winner, pot, N, net };
    this.all({ t: 'result', n: r.n, game: g, rows, winner, pot, N, net, next: r.next, extra: g === 'hang' ? { holes: r.holes } : g === 'balloon' ? { thr: r.thr } : g === 'lantern' ? { s: r.s - r.t0 } : undefined });
    if (!r.solo) this.record(r, stat, winner, net);
    this.all({ t: 'players', players: this.playerList() });
  }
  async record(r, cs, winner, net) {
    const keys = {};
    for (const c of cs) {
      const s = await this.getStats(c.dev); s.n = c.name; s.r++;
      const pb = {}; s.p = s.p || {}; for (const per of PERS) { const k = pkey(per); if (!s.p[per] || s.p[per].k !== k) s.p[per] = { k, r: 0, w: 0, won: 0, lost: 0 }; pb[per] = s.p[per]; pb[per].r++; }
      const gg = s.g[r.game] || (s.g[r.game] = [0, 0, 0, 0]);   // rounds, wins, won, lost in this game
      gg[0]++;
      if (winner) { if (c.id === winner) { s.w++; gg[1]++; s.won += net[c.id]; gg[2] += net[c.id]; for (const per of PERS) { pb[per].w++; pb[per].won += net[c.id]; } } else { s.lost += T.STAKE; gg[3] += T.STAKE; for (const per of PERS) pb[per].lost += T.STAKE; } }
      keys['u:' + c.dev] = s; this.send(c, { t: 'stat', stat: this.pubStat(s) });
    }
    for (const k of Object.keys(keys)) if (TESTDEV.test(k.slice(2))) delete keys[k];
    try { if (Object.keys(keys).length) await this.ctx.storage.put(keys); } catch (e) {}
    this.tops = null;
  }
}
