/* Chương X · Ghép Tranh Chung — the shared 1000-piece jigsaw. ONE puzzle for everybody, kept on the server for good: every group of
   pieces (its pose and its piece ids) is written to this Durable Object's storage, so a restart, a deploy or an empty room never
   loses it. The room name is fixed ('main'; never rename it).
   The server decides everything that matters: who holds which group (one holder at a time), where a dropped group lands, and
   whether it JOINS a neighbour (same rule as the single-player jigsaw: a piece of one next to a piece of the other in the print,
   the angle within 14° and the lattice origins within .38 of the smaller cell side). Each successful join is one "piece" for the
   player who dropped it: 10 đồng (paid by the client, which owns the purse) and one point on the all-time board.
   Messages:  client → server  hello{dev,name} · lift{g} · move{g,x,y,a} · drop{g,x,y,a} · chat{s} · emote{k} · board
              server → client  welcome{id,n,seed,groups,players,me} · players · lift{g,by} · deny{g} · poses{p} · drop{g,x,y,a} ·
                               join{keep,gone,x,y,a,pair,by,m} · done{n} · reset{…} · chat{id,s} · emote{id,k} · board{…}
   A group row is [gid, x, y, a, "id,id,…"]; the gid of a joined group is the bigger one's. The cut (the edges of every piece) comes
   from the seed, drawn by the page with the same code as the single-player jigsaw. */
import { DurableObject } from 'cloudflare:workers';
import { cleanChat, CHAT_GAP } from './chat.js';

const COLS = 40, ROWS = 25, N = COLS * ROWS, PW = 1431, PH = 933, CW = 44;
const ASP = PW / PH, CH = CW / (ASP * ROWS / COLS), BW = CW * COLS, BH = CH * ROWS, WW = BW * 1.5, WH = BH * 1.5;
const ANG_TOL = 14 * Math.PI / 180, POS_TOL = .38 * Math.min(CW, CH), NEXT_AFTER = 120000, HOLD_IDLE = 40000;
const ORIGIN_OK = /^https?:\/\/(damcuoichuot\.com|www\.damcuoichuot\.com|[a-z0-9-]+\.github\.io|localhost(:\d+)?|127\.0\.0\.1(:\d+)?|(10|192\.168)\.\d+\.\d+(:\d+)?|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?)$/i;
const TESTDEV = /^(testdev|boardreader|dbgdev|realp|realq|realz|realsolo|viewer|prodck|qqq|zzz|jgtest)/;
const LOOK = ['role', 'age', 'body', 'fur', 'robe', 'skirt', 'pants', 'top'];   // a look is only forwarded; every browser cleans it again
const cleanLook = l => { if (!l || typeof l !== 'object') return null; const o = {}; for (const k of LOOK) { const v = String(l[k] ?? '').slice(0, 16); if (v) o[k] = v; } return o; };
const rot = (a, x, y) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const wrap = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
const r1 = v => Math.round(v * 10) / 10, r3 = v => Math.round(v * 1000) / 1000;
const rng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

export class Jigsaw extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.conns = new Map(); this.nextId = 1; this.groups = new Map(); this.pieceG = new Int32Array(N); this.n = 1; this.seed = 1; this.done = false; this.doneAt = 0;
    this.users = new Map(); this.dirty = new Set(); this.dirtyUsers = new Set(); this.saveT = null; this.tick = null; this.board = null; this.boardAt = 0; this.total = 0;
    ctx.blockConcurrencyWhile(async () => {
      const st = await ctx.storage.get('pz');
      if (st && Array.isArray(st.g) && st.g.length) this.load(st); else this.fresh(1);
      this.total = (await ctx.storage.get('total')) || 0;
      if (this.done && Date.now() - this.doneAt >= NEXT_AFTER) this.fresh(this.n + 1);
      else if (this.done) this.scheduleNext();
    });
  }

  /* ---- the puzzle ---- */
  load(st) {
    this.n = st.n || 1; this.seed = st.seed || 1; this.done = !!st.done; this.doneAt = st.doneAt || 0; this.groups = new Map();
    for (const row of st.g) { const ids = String(row[4]).split(',').map(Number); const g = { id: row[0], x: row[1], y: row[2], a: row[3], ids, by: null, heldAt: 0 }; this.groups.set(g.id, g); for (const id of ids) this.pieceG[id] = g.id; }
  }
  fresh(n) {
    this.n = n; this.seed = (Math.floor(Math.random() * 2e9) + n) >>> 0; this.done = false; this.doneAt = 0; this.groups = new Map();
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
  rows() { const out = []; for (const g of this.groups.values()) out.push([g.id, g.x, g.y, g.a, g.ids.join(',')]); return out; }
  full(c) { return { n: this.n, seed: this.seed, cols: COLS, rows: ROWS, groups: this.rows(), holds: [...this.groups.values()].filter(g => g.by).map(g => [g.id, g.by]), done: this.done, players: this.playerList() }; }
  save(now) {
    if (now) { clearTimeout(this.saveT); this.saveT = null; this.flush(); return; }
    if (!this.saveT) this.saveT = setTimeout(() => { this.saveT = null; this.flush(); }, 1500);
  }
  flush() {
    const put = { pz: { n: this.n, seed: this.seed, done: this.done, doneAt: this.doneAt, g: this.rows() }, total: this.total };
    for (const dev of this.dirtyUsers) { const u = this.users.get(dev); if (u) put['u:' + dev] = u; } this.dirtyUsers.clear();
    try { this.ctx.storage.put(put); } catch (e) {}
  }
  scheduleNext() { clearTimeout(this.nextT); this.nextT = setTimeout(() => { if (this.done) { this.fresh(this.n + 1); this.all({ t: 'reset', ...this.full() }); } }, Math.max(1000, NEXT_AFTER - (Date.now() - this.doneAt))); }

  /* ---- connections ---- */
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === '/count') return new Response(JSON.stringify({ n: [...this.conns.values()].filter(c => c.joined && !TESTDEV.test(c.dev)).length, joined: N - this.groups.size, left: this.groups.size - 1, puzzle: this.n, total: this.total }));
    const pair = new WebSocketPair(), [client, server] = Object.values(pair); server.accept();
    const c = { ws: server, id: 'j' + (this.nextId++), dev: '', name: '', look: null, joined: false, holding: null, win: 0, cnt: 0, chatAt: 0, emoAt: 0, awards: [] };
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
      const u = await this.user(c.dev); u.n = c.name; c.joined = true;
      this.send(c, { t: 'welcome', id: c.id, ...this.full(c), me: { m: u.m } });
      this.all({ t: 'players', players: this.playerList() }, c);
      return;
    }
    if (!c.joined) return;
    if (m.t === 'lift') this.lift(c, m.g | 0);
    else if (m.t === 'move') this.move(c, m);
    else if (m.t === 'drop') this.drop(c, m, now);
    else if (m.t === 'chat') { if (now - c.chatAt < CHAT_GAP) return; const s = cleanChat(m.s); if (!s) return; c.chatAt = now; this.all({ t: 'chat', id: c.id, s }); }
    else if (m.t === 'emote') { const k = m.k | 0; if (now - c.emoAt < 2000 || k < 0 || k > 5) return; c.emoAt = now; this.all({ t: 'emote', id: c.id, k }); }
    else if (m.t === 'board') this.sendBoard(c);
  }

  /* ---- holding and moving ---- */
  lift(c, gid) {
    const g = this.groups.get(gid); if (!g || this.done || (g.by && g.by !== c.id)) { this.send(c, { t: 'deny', g: gid }); return; }
    if (c.holding && c.holding !== gid) this.release(c.holding);
    g.by = c.id; g.heldAt = Date.now(); c.holding = gid; this.all({ t: 'lift', g: gid, by: c.id });
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
    const g = this.groups.get(gid); if (!g) return; const holder = this.conns.get(g.by); if (holder) holder.holding = null; g.by = null; this.clamp(g);
    this.all({ t: 'drop', g: gid, x: r1(g.x), y: r1(g.y), a: r3(g.a) }); this.save();
  }
  drop(c, m, now) {
    const g = this.groups.get(m.g | 0); if (!g || g.by !== c.id) return;
    const x = +m.x, y = +m.y, a = +m.a; if (isFinite(x) && isFinite(y) && isFinite(a)) { g.x = x; g.y = y; g.a = a; }
    g.by = null; c.holding = null; this.clamp(g); this.dirty.delete(g.id);
    const joins = this.tryJoin(g);
    if (!joins.length) { this.all({ t: 'drop', g: g.id, x: r1(g.x), y: r1(g.y), a: r3(g.a) }); this.save(); return; }
    const u = this.users.get(c.dev); const paid = TESTDEV.test(c.dev) ? 0 : this.award(c, joins.length, now);
    if (u && paid) { u.m += paid; this.dirtyUsers.add(c.dev); this.board = null; }
    this.total += joins.length;
    joins.forEach((j, k) => this.all({ t: 'join', ...j, by: c.id, paid: k < paid ? 1 : 0, m: u ? u.m : 0 }));
    if (this.groups.size === 1) { this.done = true; this.doneAt = Date.now(); this.all({ t: 'done', n: this.n }); this.save(true); this.scheduleNext(); } else this.save();
  }
  // at most 10 paid joins in any 10 seconds for one player (the economy is the client's purse)
  award(c, k, now) { c.awards = c.awards.filter(t => now - t < 10000); const room = Math.max(0, 10 - c.awards.length), paid = Math.min(k, room); for (let i = 0; i < paid; i++) c.awards.push(now); return paid; }
  // the dropped group joins every neighbour it fits: the bigger group keeps its pose, the smaller moves onto it
  tryJoin(grp) {
    const out = [];
    for (let guard = 0; guard < 60; guard++) {
      let hit = null;
      for (const o of this.groups.values()) {
        if (o === grp || o.by) continue;
        if (Math.abs(o.x - grp.x) > POS_TOL || Math.abs(o.y - grp.y) > POS_TOL || Math.abs(wrap(grp.a - o.a)) > ANG_TOL || Math.hypot(o.x - grp.x, o.y - grp.y) > POS_TOL) continue;
        let pair = null;
        for (const a of grp.ids) { const ai = Math.floor(a / COLS), aj = a % COLS; for (const b of o.ids) if (Math.abs(ai - Math.floor(b / COLS)) + Math.abs(aj - b % COLS) === 1) { pair = [a, b]; break; } if (pair) break; }
        if (pair) { hit = { o, pair }; break; }
      }
      if (!hit) break;
      const big = hit.o.ids.length >= grp.ids.length ? hit.o : grp, small = big === grp ? hit.o : grp;
      for (const id of small.ids) { this.pieceG[id] = big.id; big.ids.push(id); }
      this.groups.delete(small.id); this.dirty.delete(small.id);
      out.push({ keep: big.id, gone: small.id, x: r1(big.x), y: r1(big.y), a: r3(big.a), pair: hit.pair }); grp = big;
    }
    return out;
  }
  // every 100 ms: the poses of the groups people are carrying; and release holds nobody has touched for a while
  step() {
    if (this.dirty.size) { const p = []; for (const gid of this.dirty) { const g = this.groups.get(gid); if (g) p.push([gid, r1(g.x), r1(g.y), r3(g.a)]); } this.dirty.clear(); this.all({ t: 'poses', p }); }
    const now = Date.now(); for (const g of this.groups.values()) if (g.by && now - g.heldAt > HOLD_IDLE) this.release(g.id);
  }

  /* ---- the board: all time only, and only people with at least one piece ---- */
  async sendBoard(c) {
    const now = Date.now();
    if (!this.board || now - this.boardAt > 15000) {
      const all = await this.ctx.storage.list({ prefix: 'u:', limit: 3000 }), rows = [];
      for (const [k, v] of all) { const u = this.users.get(k.slice(2)) || v; if (u && u.m > 0 && !TESTDEV.test(k.slice(2))) rows.push({ dev: k.slice(2), n: u.n, m: u.m }); }
      rows.sort((a, b) => b.m - a.m || a.dev.localeCompare(b.dev)); this.board = rows; this.boardAt = now;
    }
    const me = this.board.findIndex(x => x.dev === c.dev), u = this.users.get(c.dev);
    this.send(c, { t: 'board', total: this.board.length, top: this.board.slice(0, 100).map(x => ({ n: x.n, m: x.m, me: x.dev === c.dev })), me: me >= 0 ? { pos: me + 1, m: this.board[me].m } : { pos: null, m: u ? u.m : 0 } });
  }
}
