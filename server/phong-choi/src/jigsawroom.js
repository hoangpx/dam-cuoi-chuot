/* Chương X · Phòng ghép tranh riêng (owner, 2026-10-30): a player makes ONE room with his own picture, a password (or none) and 100 / 200 / 500 / 1000 pieces.
   Two kinds of Durable Object:
   - JigsawReg (name 'main'): the list of rooms (what the outside shows: a small icon, the name, who is joining, how many pieces are in, how long) and the rule
     "one unfinished room a person".
   - JigsawRoom (one object a room, name = the room id): the puzzle itself. It wraps the very same engine as the shared prints (makeJigsaw in jigsaw.js, with the
     same guards, join rule and holds), built at run time from the room's saved size, and adds the room's own rules: password at the door (the owner's device
     does not need it), the owner can drop the password, throw somebody out, start the picture again or put a new picture in. Pieces joined in a room are counted
     on the room's board but never paid (a private room would be a money farm).
   The picture is a JPEG kept in the room's storage (≤ 1.9 MB, the page shrinks it first); only people who pass the door can fetch it, the list shows a 192 px icon.
   Close codes the page understands: 4012 the picture is hidden, waiting for the admin · 4009 the room was deleted · 4007 thrown out · 4008 the picture was replaced (come back) · 4010 wrong password · 4011 too many wrong passwords. */
import { DurableObject } from 'cloudflare:workers';
import { makeJigsaw } from './jigsaw.js';
import { cleanChat } from './chat.js';

const REPORT_NEED = 3;   // reports from this many DIFFERENT networks hide a picture until the admin looks at it
const ipKey = ip => { ip = String(ip || ''); return ip.includes(':') ? ip.split(':').slice(0, 4).join(':') : ip; };
export const IDLE_MS = 7 * 86400000, SWEEP_EVERY = 6 * 3600000;   // a room nobody has joined a piece of for 7 days goes (owner, 2026-10-31)
export const ROOM_PIECES = [100, 200, 500, 1000], IMG_MAX = 1900000, THUMB_MAX = 60000, ROOM_MAX = 400, DEV_RE = /^[a-z0-9]{12,40}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const rand = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join(''); };
const unb64 = s => { const bin = atob(String(s).replace(/^data:[^,]*,/, '')); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; };

// the size of a JPEG, read from its start-of-frame marker (never trust the page for it: the cut depends on it)
export function jpegSize(b) {
  if (!b || b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m === 0xd8 || m === 0x01 || m === 0xff || (m >= 0xd0 && m <= 0xd7)) { i += (m === 0xff ? 1 : 2); continue; }
    const len = (b[i + 2] << 8) | b[i + 3];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    i += 2 + len;
  }
  return null;
}
// cols x rows near the wanted number of pieces, never above it (1000 is the most), pieces as square as the picture allows
export function cutFor(w, h, target) {
  const asp = w / h; let best = null;
  for (let cols = 4; cols <= 90; cols++) {
    const rows = Math.max(2, Math.round(cols / asp)), n = cols * rows; if (n > target) continue;
    const err = Math.abs(n - target) / target + Math.abs((w / cols) / (h / rows) - 1) * .8;
    if (!best || err < best.err) best = { cols, rows, err };
  }
  return best && { cols: best.cols, rows: best.rows };
}
// checks what the page sent for a new picture (the room's first one or a replacement): { img: base64 JPEG, thumb: base64 JPEG, pieces }
export function prepPic(b) {
  if (!b || typeof b.img !== 'string' || typeof b.thumb !== 'string') return { err: 'pic' };
  if (!ROOM_PIECES.includes(b.pieces | 0)) return { err: 'pieces' };
  let img, thumb; try { img = unb64(b.img); thumb = unb64(b.thumb); } catch (e) { return { err: 'pic' }; }
  if (img.length > IMG_MAX || img.length < 2000) return { err: 'big' };
  if (thumb.length > THUMB_MAX || !jpegSize(thumb)) return { err: 'pic' };
  const sz = jpegSize(img); if (!sz || sz.w < 400 || sz.h < 400 || sz.w > 5000 || sz.h > 5000 || Math.max(sz.w / sz.h, sz.h / sz.w) > 3.2) return { err: 'size' };
  const cut = cutFor(sz.w, sz.h, b.pieces | 0); if (!cut) return { err: 'size' };
  return { img, thumb, w: sz.w, h: sz.h, cols: cut.cols, rows: cut.rows };
}
const cleanName = (s, max) => { let n = String(s || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max); return (cleanChat(n) || n).slice(0, max); };

/* ---------------------------------- one room ---------------------------------- */
export class JigsawRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.meta = null; this.inner = null; this.fails = new Map(); this.statAt = 0; this.statT = null;
    ctx.blockConcurrencyWhile(async () => { this.meta = (await ctx.storage.get('meta')) || null; });
  }
  build() {
    const M = this.meta, room = this;
    const cfg = {
      pic: M.pic, cols: M.cols, rows: M.rows, pw: M.w, ph: M.h, freeze: false, noPay: true, noBig: true, startAt: M.created,
      gate: (dev, m, ip) => room.gate(dev, m, ip),
      info: c => ({ id: M.id, name: M.name, ownerName: M.ownerName, own: !!(c && c.dev === M.owner), locked: !!M.hash, w: M.w, h: M.h, ver: M.ver, cols: M.cols, rows: M.rows }),
      isOwner: dev => dev === M.owner,
      touch: (inner, now) => room.touch(now),
    };
    const Cls = makeJigsaw(cfg); this.inner = new Cls(this.ctx, this.env);
  }
  async gate(dev, m, ip) {
    const M = this.meta; if (M.kicked && M.kicked[dev]) return 4007;
    if (dev === M.owner) return 0;
    if (M.hidden) return 4012;
    if (!M.hash) return 0;
    const now = Date.now(), k = ip || 'x', recent = (this.fails.get(k) || []).filter(t => now - t < 600000);
    if (recent.length >= 8) return 4011;
    if (await sha(M.salt + String(m.pw || '').slice(0, 40)) === M.hash) return 0;
    recent.push(now); this.fails.set(k, recent); return 4010;
  }
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === '/init') return this.init(req);
    if (!this.meta) return json({ error: 'nope' }, 404);
    if (!this.inner) this.build();
    if (u.pathname === '/admin') return this.admin(req);
    if (u.pathname === '/report') return this.report(req);
    if (u.pathname === '/sudo') return this.sudo(req);
    if (u.pathname === '/img') return this.img(req);
    if (u.pathname === '/count') return json({ ...this.inner.stat(), name: this.meta.name });
    return this.inner.fetch(req);   // everything else is the socket
  }
  async init(req) {
    if (this.meta) return json({ error: 'exists' }, 409);
    const b = await req.json().catch(() => null); if (!b || !b.meta || typeof b.img !== 'string') return json({ error: 'bad' }, 400);
    const m = b.meta, img = unb64(b.img);
    this.meta = { ...m, pic: 'r' + Date.now().toString(36), ver: 1, created: Date.now(), kicked: {} };
    await this.ctx.storage.put({ meta: this.meta, img });
    return json({ ok: 1 });
  }
  async img(req) {
    const dev = req.headers.get('x-dev') || '', code = await this.gate(dev, { pw: req.headers.get('x-pw') || '' }, req.headers.get('CF-Connecting-IP') || '');
    if (code) return json({ error: 'door', code }, 403);
    const img = await this.ctx.storage.get('img'); if (!img) return json({ error: 'nope' }, 404);
    return new Response(img, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=86400', 'access-control-allow-origin': '*' } });
  }
  // the registry learns of the numbers a little after they change (and at once when the last player leaves or the picture is finished)
  touch(now) {
    if (now) { clearTimeout(this.statT); this.statT = null; this.pushStat(); return; }
    if (this.statT) return;
    this.statT = setTimeout(() => { this.statT = null; this.pushStat(); }, Math.max(1500, 10000 - (Date.now() - this.statAt)));
  }
  pushStat() {
    this.statAt = Date.now(); if (!this.inner || !this.meta) return;
    const reg = this.env.JIGSAW_REG.get(this.env.JIGSAW_REG.idFromName('main'));
    reg.fetch('https://reg/stat', { method: 'POST', body: JSON.stringify({ id: this.meta.id, locked: !!this.meta.hash, ...this.inner.stat() }) }).catch(() => {});
  }
  // the room goes for good: everybody out (4009), the storage emptied, the list told
  async destroy() {
    if (!this.inner) this.build();
    const inner = this.inner, M = this.meta;
    await inner.flush(); inner.dead = true;
    for (const c of [...inner.conns.values()]) { try { c.ws.close(4009, 'deleted'); } catch (e) {} }
    clearTimeout(this.statT); this.statT = null;
    const reg = this.env.JIGSAW_REG.get(this.env.JIGSAW_REG.idFromName('main'));
    await reg.fetch('https://reg/remove', { method: 'POST', body: JSON.stringify({ id: M.id }) }).catch(() => {});
    await this.ctx.storage.deleteAll(); this.meta = null; this.inner = null;
  }
  // REPORT (owner, 2026-10-30: "report tranh không phù hợp, 3 người 3 ip khác nhau thì tạm ẩn chờ admin"): only somebody in the room can report, once a device and once an address;
  // the third network hides the picture from everybody but its owner (the door answers 4012, the list drops it, the thumb stops) until the admin restores or deletes it
  async report(req) {
    const b = await req.json().catch(() => null), M = this.meta, inner = this.inner;
    if (!b || !DEV_RE.test(String(b.dev || ''))) return json({ error: 'dev' }, 400);
    if (b.dev === M.owner) return json({ error: 'self' }, 400);
    const c = [...inner.conns.values()].find(x => x.joined && x.dev === b.dev);   // somebody in the room, or not: a locked room can not be entered, so the list outside reports too (owner, 2026-10-31)
    let ip = req.headers.get('CF-Connecting-IP') || ''; if (!ip || ip === '127.0.0.1' || ip === '::1') ip = req.headers.get('x-test-ip') || ip;   // the test header counts only on a local server
    const key = ipKey(ip) || 'local:' + b.dev;
    M.reports = M.reports || [];
    if (M.reports.some(r => r[0] === key || r[1] === b.dev)) return json({ error: 'dup' }, 409);
    M.reports.push([key, b.dev, Date.now(), c ? c.name : 'ngoài phòng']);
    if (!M.hidden && new Set(M.reports.map(r => r[0])).size >= REPORT_NEED) {
      M.hidden = Date.now();
      for (const x of [...inner.conns.values()]) if (x.dev !== M.owner) { try { x.ws.close(4012, 'hidden'); } catch (e) {} }
      await this.ctx.storage.put('meta', M); await this.pushHidden();
      return json({ ok: 1, hidden: 1 });
    }
    await this.ctx.storage.put('meta', M); return json({ ok: 1 });
  }
  async pushHidden() {
    const M = this.meta, reg = this.env.JIGSAW_REG.get(this.env.JIGSAW_REG.idFromName('main'));
    await reg.fetch('https://reg/hide', { method: 'POST', body: JSON.stringify({ id: M.id, hidden: M.hidden || 0, reports: (M.reports || []).map(r => ({ by: r[3], at: new Date(r[2]).toISOString() })) }) }).catch(() => {});
  }
  // the admin's two answers (reached only through the Worker's Bearer-protected /jgr-admin): restore (reports cleared) or delete
  async sudo(req) {
    const b = await req.json().catch(() => null), M = this.meta;
    if (b && b.act === 'restore') { delete M.hidden; M.reports = []; await this.ctx.storage.put('meta', M); await this.pushHidden(); return json({ ok: 'restored' }); }
    if (b && b.act === 'delete') { await this.destroy(); return json({ ok: 'deleted' }); }
    if (b && b.act === 'unlock') { delete M.salt; delete M.hash; await this.ctx.storage.put('meta', M); this.inner.all({ t: 'room', locked: false }); this.touch(true); return json({ ok: 'unlocked' }); }   // the admin takes a password off
    return json({ error: 'act' }, 400);
  }
  async admin(req) {
    const b = await req.json().catch(() => null), M = this.meta;
    if (!b || b.dev !== M.owner) return json({ error: 'owner' }, 403);
    const inner = this.inner;
    if (b.act === 'pass') {   // a new password, or none: the door opens for everybody
      const pw = String(b.pw || '').trim().slice(0, 40);
      if (pw) { M.salt = rand(12); M.hash = await sha(M.salt + pw); } else { delete M.salt; delete M.hash; }
      await this.ctx.storage.put('meta', M); inner.all({ t: 'room', locked: !!M.hash }); this.touch(true); return json({ ok: 1, locked: !!M.hash });
    }
    if (b.act === 'kick') {
      const c = inner.conns.get(String(b.id || '')); if (!c || !c.joined || c.dev === M.owner) return json({ error: 'who' }, 404);
      M.kicked = M.kicked || {}; const keys = Object.keys(M.kicked); if (keys.length >= 200) delete M.kicked[keys[0]];
      M.kicked[c.dev] = Date.now(); await this.ctx.storage.put('meta', M);
      try { c.ws.close(4007, 'kicked'); } catch (e) {} inner.onClose(c); return json({ ok: 1 });
    }
    if (b.act === 'unkick') { M.kicked = {}; await this.ctx.storage.put('meta', M); return json({ ok: 1 }); }
    if (b.act === 'delete') { await this.destroy(); return json({ ok: 1 }); }
    if (b.act === 'reset') { await inner.resetNow(); this.touch(true); return json({ ok: 1 }); }
    if (b.act === 'newpic') {
      const p = prepPic(b); if (p.err) return json({ error: p.err }, 400);
      await inner.flush(); inner.dead = true;   // the old puzzle is written for the last time, then never again
      for (const c of [...inner.conns.values()]) { try { c.ws.close(4008, 'newpic'); } catch (e) {} }
      M.pic = 'r' + Date.now().toString(36); M.ver = (M.ver || 1) + 1; M.cols = p.cols; M.rows = p.rows; M.w = p.w; M.h = p.h; M.created = Date.now();
      await this.ctx.storage.put({ meta: M, img: p.img });
      const old = [...(await this.ctx.storage.list({ prefix: 'u:', limit: 5000 })).keys()]; for (let i = 0; i < old.length; i += 128) await this.ctx.storage.delete(old.slice(i, i + 128));
      await this.ctx.storage.delete(['pz', 'bak', 'total']);
      this.inner = null; this.build();
      const reg = this.env.JIGSAW_REG.get(this.env.JIGSAW_REG.idFromName('main'));
      await reg.fetch('https://reg/meta', { method: 'POST', body: JSON.stringify({ id: M.id, cols: M.cols, rows: M.rows, w: M.w, h: M.h, ver: M.ver, thumb: [...p.thumb] }) }).catch(() => {});
      return json({ ok: 1, cols: M.cols, rows: M.rows });
    }
    return json({ error: 'act' }, 400);
  }
}

/* ---------------------------------- the list of rooms ---------------------------------- */
export class JigsawReg extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.rooms = {}; this.pT = null;
    ctx.blockConcurrencyWhile(async () => { this.rooms = (await ctx.storage.get('rooms')) || {}; if (!(await ctx.storage.getAlarm())) await ctx.storage.setAlarm(Date.now() + SWEEP_EVERY); });
  }
  async alarm() { await this.sweep(IDLE_MS).catch(e => console.log('sweep failed', String(e))); await this.ctx.storage.setAlarm(Date.now() + SWEEP_EVERY); }
  // delete every room without a join for `age` ms (a room that has no time yet starts counting now); returns the ids
  async sweep(age) {
    const now = Date.now(), gone = [];
    for (const r of Object.values(this.rooms)) {
      if (!r.act) { r.act = now; continue; }
      if (now - r.act <= age) continue;
      await this.env.JIGSAW_ROOM.get(this.env.JIGSAW_ROOM.idFromName(r.id)).fetch('https://room/sudo', { method: 'POST', body: JSON.stringify({ act: 'delete' }) }).catch(() => {});
      if (this.rooms[r.id]) { delete this.rooms[r.id]; await this.ctx.storage.delete('th:' + r.id); }
      gone.push(r.id);
    }
    await this.persist(true); return gone;
  }
  persist(now) {
    if (now) { clearTimeout(this.pT); this.pT = null; return this.ctx.storage.put('rooms', this.rooms); }
    if (!this.pT) this.pT = setTimeout(() => { this.pT = null; this.ctx.storage.put('rooms', this.rooms).catch(() => {}); }, 15000);
  }
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === '/list') return this.list(u.searchParams.get('dev') || '');
    if (u.pathname === '/create') return this.create(req);
    if (u.pathname === '/sweep') { const age = Math.max(0, +u.searchParams.get('age') || IDLE_MS); return json({ gone: await this.sweep(age) }); }
    if (u.pathname === '/stat') { const b = await req.json().catch(() => null), r = b && this.rooms[b.id]; if (r) { if ('joined' in b && b.joined !== r.joined) r.act = Date.now(); for (const k of ['n', 'players', 'joined', 'done', 'since', 'took', 'locked']) if (k in b) r[k] = b[k]; this.persist(); } return json({ ok: 1 }); }
    if (u.pathname === '/hide') { const b = await req.json().catch(() => null), r = b && this.rooms[b.id]; if (r) { if (b.hidden) { r.hidden = b.hidden; r.reports = b.reports || []; } else { delete r.hidden; delete r.reports; } await this.persist(true); } return json({ ok: 1 }); }
    if (u.pathname === '/hidden') return json({ rooms: Object.values(this.rooms).filter(r => r.hidden).map(r => ({ id: r.id, name: r.name, ownerName: r.ownerName, hiddenAt: new Date(r.hidden).toISOString(), reports: r.reports || [], pieces: r.cols * r.rows })) });
    if (u.pathname === '/remove') { const b = await req.json().catch(() => null); if (b && this.rooms[b.id]) { delete this.rooms[b.id]; await this.ctx.storage.delete('th:' + b.id); await this.persist(true); } return json({ ok: 1 }); }
    if (u.pathname === '/meta') {
      const b = await req.json().catch(() => null), r = b && this.rooms[b.id]; if (!r) return json({ error: 'nope' }, 404);
      Object.assign(r, { act: Date.now(), cols: b.cols, rows: b.rows, w: b.w, h: b.h, ver: b.ver, n: 0, players: 0, joined: 0, done: false, took: 0, since: Date.now() });
      await this.ctx.storage.put({ ['th:' + b.id]: Uint8Array.from(b.thumb), rooms: this.rooms }); return json({ ok: 1 });
    }
    if (u.pathname === '/thumb') {
      const id = u.searchParams.get('r') || '', t = this.rooms[id] && !this.rooms[id].hidden && await this.ctx.storage.get('th:' + id); if (!t) return new Response('', { status: 404 });
      return new Response(t, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' } });
    }
    return json({ error: 'nope' }, 404);
  }
  // mine first, then the busy ones, then the newest; the owner's device is never shown
  list(dev) {
    const all = Object.values(this.rooms).filter(r => !r.hidden || r.owner === dev), mine = all.filter(r => r.owner === dev);
    const rooms = all.sort((a, b) => (b.owner === dev) - (a.owner === dev) || (b.n > 0) - (a.n > 0) || (a.done - b.done) || b.created - a.created).slice(0, 80)
      .map(r => ({ id: r.id, name: r.name, ownerName: r.ownerName, mine: r.owner === dev, locked: !!r.locked, cols: r.cols, rows: r.rows, w: r.w, h: r.h, ver: r.ver, created: r.created, n: r.n || 0, players: r.players || 0, joined: r.joined || 0, done: !!r.done, since: r.since || r.created, took: r.took || 0, ...(r.hidden ? { hidden: 1 } : {}) }));
    return json({ rooms, canCreate: DEV_RE.test(dev) && mine.every(r => r.done), total: all.length });
  }
  async create(req) {
    const b = await req.json().catch(() => null); if (!b) return json({ error: 'bad' }, 400);
    const dev = String(b.dev || ''); if (!DEV_RE.test(dev)) return json({ error: 'dev' }, 400);
    if (Object.keys(this.rooms).length >= ROOM_MAX) return json({ error: 'full' }, 409);
    if (Object.values(this.rooms).some(r => r.owner === dev && !r.done)) return json({ error: 'one' }, 409);
    const ownerName = cleanName(b.ownerName, 12) || 'Chuột', name = cleanName(b.name, 30);
    if (name.length < 2) return json({ error: 'name' }, 400);
    const p = prepPic(b); if (p.err) return json({ error: p.err }, 400);
    const pw = String(b.pw || '').trim().slice(0, 40); let id; do id = rand(8); while (this.rooms[id]);
    const meta = { id, owner: dev, ownerName, name, cols: p.cols, rows: p.rows, w: p.w, h: p.h };
    if (pw) { meta.salt = rand(12); meta.hash = await sha(meta.salt + pw); }
    const room = this.env.JIGSAW_ROOM.get(this.env.JIGSAW_ROOM.idFromName(id));
    const r = await room.fetch('https://room/init', { method: 'POST', body: JSON.stringify({ meta, img: b.img }) });
    if (!r.ok) return json({ error: 'room' }, 500);
    this.rooms[id] = { id, owner: dev, ownerName, name, locked: !!pw, cols: p.cols, rows: p.rows, w: p.w, h: p.h, ver: 1, created: Date.now(), act: Date.now(), n: 0, players: 0, joined: 0, done: false, since: Date.now(), took: 0 };
    await this.ctx.storage.put({ ['th:' + id]: p.thumb, rooms: this.rooms });
    return json({ ok: 1, id });
  }
}
