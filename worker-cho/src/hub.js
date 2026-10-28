/* The hub of Chương IV's online markets: pure logic, no Cloudflare API in here, so node can test it with fake sockets (worker-cho/test.js).
   A socket is anything with send(string) and close(). The server trusts the client (owner's choice) and only relays. A player who is
   playing chương IV may OPEN a market (host: place 'lang' or 'pho' with a snapshot of the stalls); another player may VISIT it only while the
   host is online and has it open ("khi cả hai cùng online"). A market is a room '<hostId>:<place>' holding the host and the visitors;
   positions (x along the lane, z its depth), chat, emoji and the buying messages (buy → the host, sold → the visitor) go to the room. */
export const LIMITS = { name: 18, chat: 90, snap: 30000, perRoom: 30, players: 400, emoji: 8 };
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const num = (v, lo, hi) => { v = +v; return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
const PLACES = ['lang', 'pho'];

export class Hub {
  constructor() { this.players = new Map(); this.bySock = new Map(); }
  send(p, msg) { try { p.sock.send(JSON.stringify(msg)); } catch (e) { /* a dead socket is dropped by its close event */ } }
  hostCount() { let n = 0; for (const p of this.players.values()) if (p.host) n++; return n; }
  roomOf(room) { const r = []; for (const p of this.players.values()) if (p.room === room) r.push(p); return r; }
  pub(p) { return { id: p.id, name: p.name, sort: p.sort, prof: p.prof, x: p.x, z: p.z, face: p.face, mv: p.mv }; }
  add(sock) { this.bySock.set(sock, null); }
  close(sock) {
    const p = this.bySock.get(sock); this.bySock.delete(sock); if (!p) return;
    if (this.players.get(p.id) === p) { this.players.delete(p.id); this.leaveRoom(p); if (p.host) this.shut(p); }
  }
  shut(h) {                                                          // a host is gone or closed: the visitors are sent home
    const room = h.id + ':' + h.host.place;
    for (const q of this.roomOf(room)) if (q !== h) { q.room = null; this.send(q, { t: 'closed', host: h.id, name: h.name }); }
    h.host = null; if (h.room && h.room.startsWith(h.id + ':')) h.room = null;
  }
  leaveRoom(p) { if (!p.room) return; const room = p.room; p.room = null; for (const q of this.roomOf(room)) this.send(q, { t: 'gone', id: p.id }); }
  message(sock, raw) {
    if (typeof raw !== 'string' || raw.length > LIMITS.snap + 2000) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    let p = this.bySock.get(sock);
    if (m.t === 'hello') {
      const id = clean(m.id, 24); if (!/^[A-Za-z0-9]{8,24}$/.test(id)) return;
      if (!p && this.players.size >= LIMITS.players) { this.send({ sock }, { t: 'full' }); return; }
      const old = this.players.get(id);
      if (old && old.sock !== sock) { this.send(old, { t: 'bye', why: 'Bạn đã vào từ chỗ khác' }); this.bySock.delete(old.sock); try { old.sock.close(); } catch (e) {} this.leaveRoom(old); if (old.host) this.shut(old); }
      const prof = m.prof && typeof m.prof === 'object' && JSON.stringify(m.prof).length < 1800 ? m.prof : null;
      p = { id, sock, name: clean(m.name, LIMITS.name) || 'Chuột lạ', sort: num(m.sort, 0, 60) | 0, prof, room: null, host: null, x: 0, z: .7, face: 1, mv: 0, last: 0 };
      this.bySock.set(sock, p); this.players.set(id, p);
      this.send(p, { t: 'welcome', id, count: this.players.size }); return;
    }
    if (!p) return;
    const now = Date.now();
    switch (m.t) {
      case 'host': {                                                  // open (or update) my market, or close it (place null)
        const place = PLACES.includes(m.place) ? m.place : null;
        if (p.host && (!place || place !== p.host.place)) this.shut(p);
        if (!place) { this.send(p, { t: 'hosting', place: null }); break; }
        const s = JSON.stringify(m.snap || null); if (s.length > LIMITS.snap) return;
        const first = !p.host; p.host = { place, snap: m.snap || null };
        if (first) { this.leaveRoom(p); p.room = p.id + ':' + place; p.x = 0; p.z = .5; }
        else for (const q of this.roomOf(p.room)) if (q !== p) this.send(q, { t: 'snap', host: p.id, snap: p.host.snap });
        this.send(p, { t: 'hosting', place, peers: this.roomOf(p.room).filter(q => q !== p).map(q => this.pub(q)) });
        break;
      }
      case 'hosts': {                                                 // the markets open now (for the list of friends' markets)
        const list = []; for (const q of this.players.values()) if (q.host && q.id !== p.id && list.length < 60) list.push({ id: q.id, name: q.name, place: q.host.place, n: this.roomOf(q.id + ':' + q.host.place).length - 1 });
        this.send(p, { t: 'hosts', list, count: this.players.size }); break;
      }
      case 'ison': {                                                  // is that player's market open now? (from a transaction line)
        const q = this.players.get(clean(m.id, 24));
        this.send(p, { t: 'ison', id: clean(m.id, 24), on: !!q, place: q && q.host ? q.host.place : null, name: q ? q.name : '' }); break;
      }
      case 'visit': {
        const h = this.players.get(clean(m.host, 24)), place = PLACES.includes(m.place) ? m.place : null;
        if (!h || !h.host || !place || h.host.place !== place || h === p) { this.send(p, { t: 'nobody', host: clean(m.host, 24) }); return; }
        const room = h.id + ':' + place;
        if (this.roomOf(room).length >= LIMITS.perRoom) { this.send(p, { t: 'crowd' }); return; }
        if (p.host) this.shut(p);
        this.leaveRoom(p);
        p.room = room; p.x = num(m.x, 0, 12000); p.z = num(m.z, 0, 1.2);
        this.send(p, { t: 'room', host: h.id, hostName: h.name, place, snap: h.host.snap, peers: this.roomOf(room).filter(q => q !== p).map(q => this.pub(q)) });
        for (const q of this.roomOf(room)) if (q !== p) this.send(q, { t: 'came', p: this.pub(p) });
        break;
      }
      case 'leave': this.leaveRoom(p); this.send(p, { t: 'left' }); break;
      case 'move': {
        if (!p.room) return; p.x = num(m.x, 0, 12000); p.z = num(m.z, 0, 1.2); p.face = m.face < 0 ? -1 : 1; p.mv = m.mv ? 1 : 0;
        for (const q of this.roomOf(p.room)) if (q !== p) this.send(q, { t: 'move', id: p.id, x: p.x, z: p.z, face: p.face, mv: p.mv });
        break;
      }
      case 'chat': {
        if (!p.room || now - p.last < 700) return; p.last = now; const text = clean(m.text, LIMITS.chat); if (!text) return;
        for (const q of this.roomOf(p.room)) this.send(q, { t: 'chat', id: p.id, name: p.name, text });
        break;
      }
      case 'emo': {
        if (!p.room || now - p.last < 400) return; p.last = now; const e = clean(m.e, LIMITS.emoji); if (!e) return;
        for (const q of this.roomOf(p.room)) this.send(q, { t: 'emo', id: p.id, e });
        break;
      }
      // a purchase: the visitor asks the host (buy), the host answers (sold); each goes to that one player only, and only inside the room
      case 'buy': case 'sold': {
        const q = this.players.get(clean(m.to, 24));
        if (!q || !p.room || q.room !== p.room) { if (m.t === 'buy') this.send(p, { t: 'sold', from: clean(m.to, 24), id: clean(m.id, 20), ok: false, why: 'Chủ chợ vừa rời đi' }); return; }
        const out = { t: m.t, from: p.id, name: p.name, id: clean(m.id, 20), g: clean(m.g, 16), n: num(m.n, 0, 999) | 0 };
        if (m.t === 'sold') { out.ok = !!m.ok; out.price = num(m.price, 0, 1e6); out.why = clean(m.why, 80); }
        this.send(q, out); break;
      }
      case 'ping': this.send(p, { t: 'pong' }); break;
    }
  }
}
