/* Chương X · Ghép Tranh Chung — the shared 1000-piece jigsaw. ONE puzzle for everybody, kept on the server for good: every group of
   pieces (its pose and its piece ids) is written to this Durable Object's storage, so a restart, a deploy or an empty room never
   loses it. The room name is fixed ('main'; never rename it).
   The server decides everything that matters: who holds which group (one holder at a time), where a dropped group lands, and
   whether it JOINS a neighbour (same rule as the single-player jigsaw: a piece of one next to a piece of the other in the print,
   the angle within 22° and the two touching pieces within .6 of the smaller cell side of where the other group's pose puts them). Each successful join is one "piece" for the
   player who dropped it: 10 đồng (paid by the client, which owns the purse) and one point on the all-time board.
   Messages:  client → server  hello{dev,name} · lift{g} · move{g,x,y,a} · drop{g,x,y,a} · chat{s} · emote{k} · board
              server → client  welcome{id,n,seed,groups,players,me} · players · lift{g,by} · deny{g} · poses{p} · drop{g,x,y,a} ·
                               join{keep,gone,x,y,a,pair,by,m} · done{n} · reset{…} · chat{id,s} · emote{id,k} · board{…}
   A group row is [gid, x, y, a, "id,id,…"]; the gid of a joined group is the bigger one's. The cut (the edges of every piece) comes
   from the seed, drawn by the page with the same code as the single-player jigsaw. */
import { DurableObject } from 'cloudflare:workers';
import { cleanChat, CHAT_GAP } from './chat.js';

// one class a picture: cfg = { pic: the name kept in the saved state, cols, rows, pw, ph: the print's size in pixels, freeze }
export function makeJigsaw(cfg) {
const COLS = cfg.cols, ROWS = cfg.rows, N = COLS * ROWS, PW = cfg.pw, PH = cfg.ph, PIC = cfg.pic, CW = 44;
const ASP = PW / PH, CH = CW / (ASP * ROWS / COLS), BW = CW * COLS, BH = CH * ROWS, WW = BW * 1.5, WH = BH * 1.5;
const SAVE_EVERY = 30000;   // seconds between saves of plain drops (joins save at once)
// KEEP_DONE (owner, 2026-10-20): a finished picture is not replaced by a new shuffle of the same picture; set false when a new picture is ready
const MAX_SOCK_IP = 20, MIN_HOLD = 180, JOIN_WIN = 20000, JOIN_DEV = 16, JOIN_IP = 30, STRIKE_WIN = 60000, STRIKES_BAN = 30, PAID_MIN = 40, BAN_DEV = 30 * 60000, BAN_IP = 10 * 60000, VER = '2026-10-23-log';
// HOLD RULE (owner, 2026-10-22): when someone clicks a group another player is carrying, the carrier is reminded not to hold it long and must put it down within
// NUDGE_MS; once it is down (by themselves or by the server) they cannot pick up that group again for LOCK_MS
const NUDGE_MS = 30000, LOCK_MS = 90000;
const FREEZE = !!cfg.freeze;   // a frozen picture is put together at once and nobody can lift anything (the first print, kept to be looked at)
const ANG_TOL = 22 * Math.PI / 180, POS_TOL = .6 * Math.min(CW, CH), NEXT_AFTER = 120000, KEEP_DONE = true, HOLD_IDLE = 40000;
const ORIGIN_OK = /^https?:\/\/(damcuoichuot\.com|www\.damcuoichuot\.com|[a-z0-9-]+\.github\.io|localhost(:\d+)?|127\.0\.0\.1(:\d+)?|(10|192\.168)\.\d+\.\d+(:\d+)?|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?)$/i;
// devices of the test scripts: never paid or stored, but ONLY on a local server (no CF-Connecting-IP, or loopback). On the real server this prefix was a free pass: joins nobody counts or lists (2026-10-23)
const TESTDEV = /^(testdev|boardreader|dbgdev|realp|realq|realz|realsolo|viewer|prodck|qqq|zzz|jgtest)/;
const isTest = (dev, ip) => TESTDEV.test(dev) && (!ip || ip === '127.0.0.1' || ip === '::1');
const LOOK = ['role', 'age', 'body', 'fur', 'robe', 'skirt', 'pants', 'top'];   // a look is only forwarded; every browser cleans it again
const cleanLook = l => { if (!l || typeof l !== 'object') return null; const o = {}; for (const k of LOOK) { const v = String(l[k] ?? '').slice(0, 16); if (v) o[k] = v; } return o; };
const NB = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const rot = (a, x, y) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const wrap = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
const r1 = v => Math.round(v * 10) / 10, r3 = v => Math.round(v * 1000) / 1000;
const rng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

class Jigsaw extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.conns = new Map(); this.nextId = 1; this.groups = new Map(); this.pieceG = new Int32Array(N); this.n = 1; this.seed = 1; this.done = false; this.doneAt = 0; this.startAt = 0; this.ppl = new Set();
    this.users = new Map(); this.dirty = new Set(); this.dirtyUsers = new Set(); this.saveT = null; this.tick = null; this.board = null; this.boardAt = 0; this.total = 0; this.bans = new Map(); this.ipJ = new Map(); this.locks = new Map(); this.jl = [];
    ctx.blockConcurrencyWhile(async () => {
      // The picture must never be lost: the saved state is checked piece by piece, a damaged one falls back to the backup copy, and nothing is ever
      // thrown away without being kept under another key first (a different picture = a fresh puzzle, the old one stays as 'old:<pic>').
      const st = await ctx.storage.get('pz'), bak = await ctx.storage.get('bak');
      if (this.valid(st)) this.load(st);
      else if (this.valid(bak)) { this.load(bak); console.log('jigsaw: restored from the backup copy'); }
      else {
        if (st && st.g && st.g.length) await ctx.storage.put((st.pic === PIC ? 'corrupt:' + Date.now() : 'old:' + (st.pic || 'x')), st);
        this.fresh(1);
      }
      this.total = (await ctx.storage.get('total')) || 0;
      for (const [k, v] of await ctx.storage.list({ prefix: 'u:', limit: 5000 })) if (v && v.m >= 1) this.ppl.add(k);   // who has joined at least one piece (shown on the card)
      if (cfg.resetTag && (await ctx.storage.get('resetTag')) !== cfg.resetTag) { await ctx.storage.put('resetTag', cfg.resetTag); await this.resetNow(); }   // once, on the first start of this code
      if (!this.startAt) this.startAt = cfg.startAt || Date.now();
      const bn = await ctx.storage.get('bans'); if (bn) for (const [k, t] of Object.entries(bn)) if (t > Date.now()) this.bans.set(k, t);
      if (FREEZE && !(this.done && this.groups.size === 1)) {   // the run in progress is kept, then the whole print is put together in the middle of the table
        await ctx.storage.put('prev:' + Date.now(), { pic: PIC, n: this.n, seed: this.seed, done: this.done, doneAt: this.doneAt, g: this.rows() });
        this.finishAll(); await this.flush();
      }
      if (KEEP_DONE) { /* the finished picture stays as it is */ }
      else if (this.done && Date.now() - this.doneAt >= NEXT_AFTER) this.fresh(this.n + 1);
      else if (this.done) this.scheduleNext();
    });
  }

  /* ---- the puzzle ---- */
  // a saved state is usable when it is of this picture and every piece is in exactly one group
  valid(st) {
    if (!st || st.pic !== PIC || !Array.isArray(st.g) || !st.g.length) return false;
    const seen = new Uint8Array(N); let k = 0;
    for (const r of st.g) { if (!Array.isArray(r) || r.length < 5) return false; for (const id of String(r[4]).split(',').map(Number)) { if (!(id >= 0 && id < N) || seen[id]) return false; seen[id] = 1; k++; } if (![r[1], r[2], r[3]].every(Number.isFinite)) return false; }
    return k === N;
  }
  load(st) {
    this.n = st.n || 1; this.seed = st.seed || 1; this.done = !!st.done; this.doneAt = st.doneAt || 0; this.startAt = st.startAt || cfg.startAt || 0; this.groups = new Map();
    for (const row of st.g) { const ids = String(row[4]).split(',').map(Number); const g = { id: row[0], x: row[1], y: row[2], a: row[3], ids, by: null, heldAt: 0 }; this.groups.set(g.id, g); for (const id of ids) this.pieceG[id] = g.id; }
  }
  fresh(n) {
    this.n = n; this.seed = (Math.floor(Math.random() * 2e9) + n) >>> 0; this.done = false; this.doneAt = 0; this.startAt = Date.now(); this.groups = new Map();
    const R = rng(this.seed ^ 0x9e3779b9), nx = Math.max(1, Math.round(Math.sqrt(N * WW / WH))), ny = Math.ceil(N / nx), slots = [];
    for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) slots.push([a, b]);
    for (let k = slots.length - 1; k > 0; k--) { const m = Math.floor(R() * (k + 1)); [slots[k], slots[m]] = [slots[m], slots[k]]; }
    for (let id = 0; id < N; id++) {
      const i = Math.floor(id / COLS), j = id % COLS, a = R() * 2 * Math.PI, [sa, sb] = slots[id];
      const ux = Math.max(0, Math.min(1, (nx > 1 ? sa / (nx - 1) : .5) + (R() - .5) * .6 / nx)), uy = Math.max(0, Math.min(1, (ny > 1 ? sb / (ny - 1) : .5) + (R() - .5) * .6 / ny));
      const cx = CW * .5 + ux * (WW - CW), cy = CH * .5 + uy * (WH - CH), o = rot(a, (j + .5) * CW, (i + .5) * CH);
      this.groups.set(id, { id, x: r1(cx - o[0]), y: r1(cy - o[1]), a: r3(a), ids: [id], by: null, heldAt: 0 }); this.pieceG[id] = id;
    }
    for (const c of this.conns.values()) c.holding = null;
    this.save(true);
  }
  finishAll() {
    this.groups = new Map(); this.pieceG = new Int32Array(N);
    this.groups.set(0, { id: 0, x: (WW - BW) / 2, y: (WH - BH) / 2, a: 0, ids: [...Array(N).keys()], by: null, heldAt: 0 }); this.done = true; this.doneAt = Date.now();
  }
  rows() { const out = []; for (const g of this.groups.values()) out.push([g.id, g.x, g.y, g.a, g.ids.join(',')]); return out; }
  full(c) { return { n: this.n, seed: this.seed, cols: COLS, rows: ROWS, groups: this.rows(), holds: [...this.groups.values()].filter(g => g.by).map(g => [g.id, g.by]), done: this.done, freeze: FREEZE, players: this.playerList() }; }
  save(now) {
    if (now) { clearTimeout(this.saveT); this.saveT = null; this.flush(); return; }
    if (!this.saveT) this.saveT = setTimeout(() => { this.saveT = null; this.flush(true); }, SAVE_EVERY);   // poses only (a drop): rare, and a lost drop costs nothing but a position
  }
  // every write is retried until it sticks; a Durable Object holds its replies until the write is stored, so a join the players see is a join that is saved
  flush(soft) {
    const pz = { pic: PIC, n: this.n, seed: this.seed, done: this.done, doneAt: this.doneAt, startAt: this.startAt, g: this.rows() }, put = { pz, total: this.total };
    if (Date.now() - (this.bakAt || 0) > 300000 || this.done) { put.bak = pz; this.bakAt = Date.now(); }
    const jl = this.jl; this.jl = []; for (const [k, v] of jl) put[k] = v;
    const users = [...this.dirtyUsers]; for (const dev of users) { const u = this.users.get(dev); if (u) put['u:' + dev] = u; } this.dirtyUsers.clear();
    return this.ctx.storage.put(put, soft ? { allowUnconfirmed: true } : undefined).catch(err => { console.log('jigsaw: save failed, retrying', String(err)); for (const d of users) this.dirtyUsers.add(d); this.jl.unshift(...jl); clearTimeout(this.saveT); this.saveT = setTimeout(() => { this.saveT = null; this.flush(); }, 5000); });
  }
  scheduleNext() { if (KEEP_DONE) return; clearTimeout(this.nextT); this.nextT = setTimeout(() => { if (this.done) { this.fresh(this.n + 1); this.all({ t: 'reset', ...this.full() }); } }, Math.max(1000, NEXT_AFTER - (Date.now() - this.doneAt))); }

  /* ---- connections ---- */
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === '/sus') return this.sus();
    if (u.pathname === '/log') return this.logReq();
    if (u.pathname === '/who') return this.whoReq(u);
    if (u.pathname === '/purge') return this.purgeReq(u);
    if (u.pathname === '/reset') return this.resetReq(u);
    if (u.pathname === '/ban') return this.banReq(u);
    const ip = req.headers.get('CF-Connecting-IP') || '';
    if (ip && (this.banned(ip) || [...this.conns.values()].filter(x => x.ip === ip).length >= MAX_SOCK_IP)) {   // accepted and closed with a code, so the page can say why (a plain 429 is only 'connection lost' to it)
      const pair = new WebSocketPair(), [cl, sv] = Object.values(pair); sv.accept(); sv.close(this.banned(ip) ? 4003 : 4005, 'busy'); return new Response(null, { status: 101, webSocket: cl });
    }
    if (u.pathname === '/count') return new Response(JSON.stringify({ ver: VER, freeze: FREEZE, done: this.done, n: [...this.conns.values()].filter(c => c.joined && !c.test).length, players: this.ppl.size, since: this.startAt, took: this.done && this.doneAt && this.startAt ? this.doneAt - this.startAt : 0, joined: N - this.groups.size, left: this.groups.size - 1, puzzle: this.n, total: this.total }));
    const pair = new WebSocketPair(), [client, server] = Object.values(pair); server.accept();
    const c = { ws: server, id: 'j' + (this.nextId++), dev: '', name: '', look: null, joined: false, holding: null, win: 0, cnt: 0, chatAt: 0, emoAt: 0, awards: [], ip, at: Date.now(), liftAt: 0, joinT: [], jn: 0, strikes: 0 };
    this.conns.set(c.id, c);
    server.addEventListener('message', e => this.onMsg(c, e.data));
    server.addEventListener('close', () => this.onClose(c)); server.addEventListener('error', () => this.onClose(c));
    if (!this.tick) this.tick = setInterval(() => this.step(), 100);
    return new Response(null, { status: 101, webSocket: client });
  }
  send(c, o) { try { c.ws.send(JSON.stringify(o)); } catch (e) {} }
  all(o, except) { const s = JSON.stringify(o); for (const c of this.conns.values()) if (c.joined && c !== except) try { c.ws.send(s); } catch (e) {} }
  playerList() { return [...this.conns.values()].filter(c => c.joined).map(c => ({ id: c.id, name: c.name, look: c.look, hold: !!c.holding })); }
  onClose(c) {
    if (!this.conns.delete(c.id)) return;
    if (c.holding) this.release(c.holding);
    this.all({ t: 'players', players: this.playerList() });
    if (!this.conns.size) { clearInterval(this.tick); this.tick = null; this.save(true); }
  }
  async user(dev) { let u = this.users.get(dev); if (!u) { u = (await this.ctx.storage.get('u:' + dev)) || { n: '', m: 0 }; this.users.set(dev, u); } return u; }

  async onMsg(c, raw) {
    const now = Date.now(); if (now - c.win > 1000) { c.win = now; c.cnt = 0; } if (++c.cnt > 60) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; } if (!m || typeof m.t !== 'string') return;
    if (m.t === 'hello' && !c.joined) {
      let name = String(m.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12); if (!name) name = 'Chuột ' + c.id.slice(1);
      c.name = cleanChat(name) || name; c.look = cleanLook(m.look); c.dev = /^[a-z0-9]{12,40}$/.test(m.dev || '') ? m.dev : 'x' + c.id + Math.random().toString(36).slice(2, 10);
      // the player's record is read from storage, but the welcome never waits for it longer than 1.5 s (a slow or stuck read once left new players on "opening the picture" for good): without it they get 0 pieces now and the record catches up
      const known = this.users.get(c.dev); let u = known || { n: '', m: 0 }, late = false;
      if (!known) { const got = await Promise.race([this.user(c.dev), new Promise(r => setTimeout(() => r(null), 1500))]); if (got) u = got; else late = true; }
      if (this.banned(c.dev) || (c.ip && this.banned(c.ip))) { try { c.ws.close(4003, 'busy'); } catch (e) {} return; }
      for (const o of [...this.conns.values()]) if (o !== c && o.dev === c.dev) { try { o.ws.close(4001, 'replaced'); } catch (e) {} this.onClose(o); }   // one socket a device: the older one is dead or another window
      u.n = c.name; c.joined = true; c.test = isTest(c.dev, c.ip);
      this.send(c, { t: 'welcome', id: c.id, ...this.full(c), me: { m: u.m } });
      if (late) this.user(c.dev).then(r => { r.n = c.name; }).catch(() => {});
      this.all({ t: 'players', players: this.playerList() }, c);
      return;
    }
    if (!c.joined) return;
    if (m.t === 'lift') this.lift(c, m.g | 0);
    else if (m.t === 'poke') this.poke(c, m.g | 0, now);
    else if (m.t === 'move') this.move(c, m);
    else if (m.t === 'drop') this.drop(c, m, now);
    else if (m.t === 'chat') { if (now - c.chatAt < CHAT_GAP) return; const s = cleanChat(m.s); if (!s) return; c.chatAt = now; this.all({ t: 'chat', id: c.id, s }); }
    else if (m.t === 'emote') { const k = m.k | 0; if (now - c.emoAt < 2000 || k < 0 || k > 5) return; c.emoAt = now; this.all({ t: 'emote', id: c.id, k }); }
    else if (m.t === 'board') this.sendBoard(c);
  }

  /* ---- holding and moving ---- */
  // another player clicked a group this one carries: remind the carrier (once a hold), who then has NUDGE_MS to put it down
  poke(c, gid, now) {
    const g = this.groups.get(gid); if (!g || this.done || !g.by || g.by === c.id || now - (c.pokeAt || 0) < 1000) return; c.pokeAt = now;
    if (g.nudgeAt) return; const h = this.conns.get(g.by); if (!h) return;
    g.nudgeAt = now + NUDGE_MS; this.send(h, { t: 'nudge', g: gid, sec: NUDGE_MS / 1000, by: c.name || '' }); this.send(c, { t: 'poked', g: gid });
  }
  lockPieces(dev, ids) { if (!dev) return; let m = this.locks.get(dev); const now = Date.now(); if (!m) { m = new Map(); this.locks.set(dev, m); } for (const [k, t] of m) if (t < now) m.delete(k); for (const id of ids) m.set(id, now + LOCK_MS); }
  lockLeft(dev, g) { const m = this.locks.get(dev); if (!m || !m.size) return 0; const now = Date.now(); let best = 0; for (const id of g.ids) { const t = m.get(id); if (t && t - now > best) best = t - now; } return best; }
  lift(c, gid) {
    const g = this.groups.get(gid); if (!g || this.done || (g.by && g.by !== c.id)) { this.send(c, { t: 'deny', g: gid }); return; }
    const lk = this.lockLeft(c.dev, g); if (lk > 0) { this.send(c, { t: 'deny', g: gid, lock: Math.ceil(lk / 1000) }); return; }
    g.nudgeAt = 0;
    if (c.holding && c.holding !== gid) this.release(c.holding);
    g.by = c.id; g.heldAt = c.liftAt = Date.now(); c.holding = gid; this.all({ t: 'lift', g: gid, by: c.id });
  }
  move(c, m) {
    const g = this.groups.get(m.g | 0); if (!g || g.by !== c.id) return; const x = +m.x, y = +m.y, a = +m.a; if (!isFinite(x) || !isFinite(y) || !isFinite(a)) return;
    g.x = Math.max(-WW, Math.min(2 * WW, x)); g.y = Math.max(-WH, Math.min(2 * WH, y)); g.a = a; g.heldAt = Date.now(); this.dirty.add(g.id);
  }
  centroid(g) { let sx = 0, sy = 0; for (const id of g.ids) { const o = rot(g.a, (id % COLS + .5) * CW, (Math.floor(id / COLS) + .5) * CH); sx += g.x + o[0]; sy += g.y + o[1]; } return [sx / g.ids.length, sy / g.ids.length]; }
  clamp(g) {
    const c = this.centroid(g), m = Math.min(CW, CH) * .3; let dx = 0, dy = 0;
    if (c[0] < m) dx = m - c[0]; if (c[0] > WW - m) dx = WW - m - c[0]; if (c[1] < m) dy = m - c[1]; if (c[1] > WH - m) dy = WH - m - c[1];
    g.x += dx; g.y += dy;
  }
  release(gid) {
    const g = this.groups.get(gid); if (!g) return; const holder = this.conns.get(g.by); if (holder) holder.holding = null;
    if (g.nudgeAt && holder) this.lockPieces(holder.dev, g.ids); g.nudgeAt = 0; g.by = null; this.clamp(g);
    this.all({ t: 'drop', g: gid, x: r1(g.x), y: r1(g.y), a: r3(g.a), n: g.ids.length }); this.save();
  }
  drop(c, m, now) {
    const g = this.groups.get(m.g | 0); if (!g || g.by !== c.id) return;
    if (g.nudgeAt) { this.lockPieces(c.dev, g.ids); g.nudgeAt = 0; }   // it was asked for: this player cannot pick it up again for LOCK_MS
    const quick = now - c.liftAt < MIN_HOLD;   // lifted and dropped within 180 ms (a double click, or a program): dropped, but it does not join
    const x = +m.x, y = +m.y, a = +m.a; if (isFinite(x) && isFinite(y) && isFinite(a)) { g.x = x; g.y = y; g.a = a; }
    g.by = null; c.holding = null; this.clamp(g); this.dirty.delete(g.id);
    const ipw = c.ip ? (this.ipJ.get(c.ip) || []).filter(t => now - t < JOIN_WIN) : [];
    c.joinT = c.joinT.filter(t => now - t < 60000);
    const hot = c.joinT.filter(t => now - t < JOIN_WIN).length >= JOIN_DEV || ipw.length >= JOIN_IP;   // more joining drops than a person makes: this one just does not join
    if (hot) this.strike(c);
    const joins = hot || quick ? [] : this.tryJoin(g);
    if (joins.length) { c.joinT.push(now); c.jn += joins.length; if (c.ip) { ipw.push(now); this.ipJ.set(c.ip, ipw); } }
    if (!joins.length) { this.all({ t: 'drop', g: g.id, x: r1(g.x), y: r1(g.y), a: r3(g.a), n: g.ids.length }); this.save(); return; }
    const u = this.users.get(c.dev); const paid = c.test ? 0 : this.award(c, joins.length, now);
    if (u && paid) { u.m += paid; this.ppl.add('u:' + c.dev); this.dirtyUsers.add(c.dev); this.board = null; }
    this.total += joins.length;
    this.jl.push(['j:' + String(now).padStart(14, '0') + ':' + c.id, { t: now, dev: c.dev, ip: c.ip, name: c.name, n: joins.length, hold: now - c.liftAt, test: !!c.test }]);
    const finished = this.groups.size === 1; if (finished) { this.done = true; this.doneAt = Date.now(); }
    // stored first, then told: nobody ever sees a join that is not kept. The write does not hold the output gate (allowUnconfirmed) and we wait for it
    // ourselves, so a refused write (a storage limit) cannot break the whole object: the join is then told anyway and the write is retried
    clearTimeout(this.saveT); this.saveT = null;
    const told = () => { joins.forEach((j, k) => this.all({ t: 'join', ...j, by: c.id, paid: k < paid ? 1 : 0, m: u ? u.m : 0 })); if (finished) { this.all({ t: 'done', n: this.n }); this.scheduleNext(); } };
    this.flush(true).then(told, told);
  }
  // at most 10 paid joins in any 10 seconds for one player (the economy is the client's purse)
  award(c, k, now) { c.awards = c.awards.filter(t => now - t < 60000); const r10 = c.awards.filter(t => now - t < 10000).length, room = Math.max(0, Math.min(10 - r10, PAID_MIN - c.awards.length)), paid = Math.min(k, room); for (let i = 0; i < paid; i++) c.awards.push(now); return paid; }
  // the dropped group joins every neighbour it fits: the bigger group keeps its pose, the smaller moves onto it
  tryJoin(grp) {
    const out = [];
    for (let guard = 0; guard < 60; guard++) {
      // the neighbour that fits best, measured AT THE CONTACT (same rule as js/ghep/manh.js c9Contact): the angle within ANG_TOL and the two
      // touching pieces, each placed under the other group's pose, within POS_TOL (the corner of the print would need a fraction of a degree)
      let hit = null;
      for (const a of grp.ids) {
        const ai = Math.floor(a / COLS), aj = a % COLS;
        for (const [di, dj] of NB) {
          const i = ai + di, j = aj + dj; if (i < 0 || j < 0 || i >= ROWS || j >= COLS) continue;
          const b = i * COLS + j, o = this.groups.get(this.pieceG[b]); if (!o || o === grp || o.by) continue;
          if (Math.abs(wrap(grp.a - o.a)) > ANG_TOL) continue;
          const at = (g, id) => { const p = rot(g.a, (id % COLS + .5) * CW, (Math.floor(id / COLS) + .5) * CH); return [g.x + p[0], g.y + p[1]]; };
          const pb = at(grp, b), qb = at(o, b), pa = at(grp, a), qa = at(o, a);
          const err = Math.max(Math.hypot(pb[0] - qb[0], pb[1] - qb[1]), Math.hypot(pa[0] - qa[0], pa[1] - qa[1]));
          if (err <= POS_TOL && (!hit || err < hit.err)) hit = { o, pair: [a, b], err };
        }
      }
      if (!hit) break;
      const big = hit.o.ids.length >= grp.ids.length ? hit.o : grp, small = big === grp ? hit.o : grp;
      for (const id of small.ids) { this.pieceG[id] = big.id; big.ids.push(id); }
      this.groups.delete(small.id); this.dirty.delete(small.id);
      out.push({ keep: big.id, gone: small.id, x: r1(big.x), y: r1(big.y), a: r3(big.a), pair: hit.pair }); grp = big;
    }
    return out;
  }
  /* ---- against programs (see the note at the top of the guard constants) ---- */
  banned(key) { const t = this.bans.get(key); if (!t) return false; if (t < Date.now()) { this.bans.delete(key); return false; } return true; }
  ban(key, ms) { if (!key) return; this.bans.set(key, Date.now() + ms); for (const c of [...this.conns.values()]) if (c.dev === key || c.ip === key) { try { c.ws.close(4003, 'busy'); } catch (e) {} } this.saveBans(); }
  saveBans() { const o = {}, now = Date.now(); for (const [k, t] of this.bans) if (t > now) o[k] = t; this.ctx.storage.put('bans', o).catch(() => {}); }
  strike(c) { const now = Date.now(); c.strikeT = (c.strikeT || []).filter(t => now - t < STRIKE_WIN); c.strikeT.push(now); c.strikes = c.strikeT.length; if (c.strikes >= STRIKES_BAN) { this.ban(c.dev, BAN_DEV); this.ban(c.ip, BAN_IP); } }
  json(o) { return new Response(JSON.stringify(o), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }
  sus() {
    const now = Date.now(), live = [...this.conns.values()].filter(c => c.joined).map(c => ({ id: c.id, name: c.name, dev: c.dev, ip: c.ip, joins: c.jn, last60: c.joinT.filter(t => now - t < 60000).length, strikes: c.strikes, secs: Math.round((now - c.at) / 1000) })).sort((a, b) => b.last60 - a.last60 || b.joins - a.joins);
    return this.json({ ver: VER, puzzle: this.n, left: this.groups.size - 1, live: live.slice(0, 40), bans: [...this.bans].filter(([, t]) => t > now).map(([k, t]) => [k, Math.round((t - now) / 60000) + ' min']) });
  }
  // who joined how much, from the per-join records (key j:<time>:<socket>): by device, with addresses, names, first and last time, the busiest minute and the quickest hold
  async logReq() {
    const by = new Map(); let rows = 0;
    for (const [k, v] of await this.ctx.storage.list({ prefix: 'j:', limit: 20000 })) {
      rows++; let d = by.get(v.dev); if (!d) by.set(v.dev, d = { dev: v.dev, names: new Set(), ips: new Set(), drops: 0, joins: 0, first: v.t, last: v.t, min: {}, fast: 1e9, test: v.test });
      d.names.add(v.name); d.ips.add(v.ip); d.drops++; d.joins += v.n; d.last = v.t; d.min[Math.floor(v.t / 60000)] = (d.min[Math.floor(v.t / 60000)] || 0) + v.n; if (v.hold < d.fast) d.fast = v.hold;
    }
    const out = [...by.values()].map(d => ({ dev: d.dev, names: [...d.names].join(','), ips: [...d.ips].join(','), drops: d.drops, joins: d.joins, first: new Date(d.first).toISOString(), last: new Date(d.last).toISOString(), peakPerMin: Math.max(0, ...Object.values(d.min)), fastHoldMs: d.fast, test: d.test })).sort((a, b) => b.joins - a.joins);
    return this.json({ ver: VER, rows, devices: out.length, joins: out.reduce((s, d) => s + d.joins, 0), list: out.slice(0, 80) });
  }
  // which devices carry a name (the records u:<dev> hold {n name, m pieces}); the owner then bans or purges one
  async whoReq(u) {
    const q = (u.searchParams.get('name') || '').toLowerCase(); if (!q) return this.json({ error: 'name' });
    const out = [];
    for (const [k, v] of await this.ctx.storage.list({ prefix: 'u:', limit: 20000 })) { const r = this.users.get(k.slice(2)) || v; if (r && String(r.n || '').toLowerCase().includes(q)) out.push({ dev: k.slice(2), n: r.n, m: r.m }); }
    return this.json({ ver: VER, found: out });
  }
  // off the board for good: pieces back to 0 (the board lists players with at least one piece) and the device banned for a year
  async purgeReq(u) {
    const dev = u.searchParams.get('dev'); if (!dev) return this.json({ error: 'dev' });
    const old = this.users.get(dev) || await this.ctx.storage.get('u:' + dev); if (!old) return this.json({ error: 'unknown device' });
    const rec = { n: old.n, m: 0 }; this.users.set(dev, rec); this.dirtyUsers.delete(dev); await this.ctx.storage.put('u:' + dev, rec); this.ppl.delete('u:' + dev); this.board = null;
    this.ban(dev, 365 * 86400000);
    return this.json({ ok: 'purged', dev, name: old.n, was: old.m });
  }
  // start the same picture again (everybody's records and the board stay): the finished picture is kept as old:<pic>:<time>
  async resetNow() {
    await this.ctx.storage.put('old:' + PIC + ':' + Date.now(), { pic: PIC, n: this.n, seed: this.seed, done: this.done, doneAt: this.doneAt, startAt: this.startAt, g: this.rows() });
    this.total = 0; this.bakAt = 0; clearTimeout(this.nextT); this.fresh(this.n + 1); await this.flush();
    this.all({ t: 'reset', ...this.full() });
  }
  async resetReq(u) { if (u.searchParams.get('ok') !== PIC) return this.json({ error: 'add ?ok=' + PIC }); await this.resetNow(); return this.json({ ok: 'reset', n: this.n }); }
  banReq(u) {   // /ban?dev=…|ip=…[&mins=N][&un=1]
    const key = u.searchParams.get('dev') || u.searchParams.get('ip'); if (!key) return this.json({ error: 'dev or ip' });
    if (u.searchParams.get('un')) { this.bans.delete(key); this.saveBans(); return this.json({ ok: 'freed', key }); }
    const mins = +u.searchParams.get('mins') || (u.searchParams.get('ip') ? BAN_IP / 60000 : BAN_DEV / 60000); this.ban(key, mins * 60000); return this.json({ ok: 'banned', key, mins });
  }
  // every 100 ms: the poses of the groups people are carrying; and release holds nobody has touched for a while
  step() {
    if (this.dirty.size) { const p = []; for (const gid of this.dirty) { const g = this.groups.get(gid); if (g) p.push([gid, r1(g.x), r1(g.y), r3(g.a)]); } this.dirty.clear(); this.all({ t: 'poses', p }); }
    const now = Date.now(); for (const g of this.groups.values()) if (g.by && (now - g.heldAt > HOLD_IDLE || (g.nudgeAt && now > g.nudgeAt))) { if (g.nudgeAt && now > g.nudgeAt) { const h = this.conns.get(g.by); if (h) this.send(h, { t: 'timeup', g: g.id, sec: LOCK_MS / 1000 }); } this.release(g.id); }
  }

  /* ---- the board: all time only, and only people with at least one piece ---- */
  async sendBoard(c) {
    const now = Date.now();
    if (!this.board || now - this.boardAt > 15000) {
      const all = await this.ctx.storage.list({ prefix: 'u:', limit: 3000 }), rows = [];
      for (const [k, v] of all) { const u = this.users.get(k.slice(2)) || v; if (u && u.m > 0) rows.push({ dev: k.slice(2), n: u.n, m: u.m }); }
      rows.sort((a, b) => b.m - a.m || a.dev.localeCompare(b.dev)); this.board = rows; this.boardAt = now;
    }
    const me = this.board.findIndex(x => x.dev === c.dev), u = this.users.get(c.dev);
    this.send(c, { t: 'board', total: this.board.length, top: this.board.slice(0, 100).map(x => ({ n: x.n, m: x.m, me: x.dev === c.dev })), me: me >= 0 ? { pos: me + 1, m: this.board[me].m } : { pos: null, m: u ? u.m : 0 } });
  }
}
return Jigsaw;
}

// the first print: finished and kept (the Worker serves it, src/frozen.js); its object keeps the saved state
export class JigsawV2 extends makeJigsaw({ pic: 'dcm1', cols: 40, rows: 25, pw: 3200, ph: 2204, freeze: true, startAt: Date.UTC(2026, 9, 19, 23, 43) }) {}
// the second print: Vinh quy bai to, img/ch10/vinh-quy-bai-to.jpg 4047 x 2493, 57 x 35 = 1995 pieces
export class JigsawVQ extends makeJigsaw({ pic: 'vq1', cols: 57, rows: 35, pw: 4047, ph: 2493, freeze: false, startAt: Date.UTC(2026, 9, 20, 16, 15) }) {}
// the third print: Đàn gà mẹ con, img/ch10/dan-ga-me-con.jpg 4400 x 2456, 100 x 56 = 5600 pieces
export class JigsawDG extends makeJigsaw({ pic: 'dg1', cols: 100, rows: 56, pw: 4400, ph: 2456, freeze: false }) {}   // dropped (too heavy), kept only because its migration exists
// the same print cropped and cut in 65 x 46 = 2990 pieces (owner, 2026-10-22: less lag), img/ch10/dan-ga-me-con.jpg 3300 x 2324
export class JigsawDG3 extends makeJigsaw({ pic: 'dg2', cols: 65, rows: 46, pw: 3300, ph: 2324, freeze: false, resetTag: 'r1' }) {}
