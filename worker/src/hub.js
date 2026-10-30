/* The village hub of Chương IX · Làng Vũ Đại online: pure logic, no Cloudflare API in here, so node can test it with fake sockets
   (worker/test.js). A socket is anything with send(string) and close(). One Hub = one village; the Durable Object in index.js owns one.
   The server trusts the client (owner's choice): it only relays positions, chat, friend requests and visits between players.
   Rooms: every area is a room by its id ('lang', 'cho', 'dinh'…); a home farm is the room 'ruong:<ownerId>'. Players see and
   hear only those in the same room. */
export const LIMITS = { name: 18, chat: 90, room: 40, snap: 60000, perRoom: 40, players: 300 };
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const num = (v, lo, hi) => { v = +v; return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };

export class Hub {
  constructor() { this.players = new Map(); this.bySock = new Map(); }
  send(p, msg) { try { p.sock.send(JSON.stringify(msg)); } catch (e) { /* a dead socket is dropped by its close event */ } }
  roomOf(room) { const r = []; for (const p of this.players.values()) if (p.room === room) r.push(p); return r; }
  pub(p) { return { id: p.id, name: p.name, x: p.x, y: p.y, face: p.face, mv: p.mv }; }
  add(sock) { this.bySock.set(sock, null); }
  close(sock) {
    const p = this.bySock.get(sock); this.bySock.delete(sock); if (!p) return;
    if (this.players.get(p.id) === p) { this.players.delete(p.id); this.leave(p, p.room); this.tell(p.id, 'off'); }
  }
  tell(id, t) { for (const q of this.players.values()) if (q.friends && q.friends.has(id)) this.send(q, { t, id }); }      // friends hear when someone comes or goes
  leave(p, room) { for (const q of this.roomOf(room)) if (q !== p) this.send(q, { t: 'gone', id: p.id }); }
  join(p, room) {
    p.room = room;
    const here = this.roomOf(room).filter(q => q !== p);
    this.send(p, { t: 'room', room, peers: here.slice(0, LIMITS.perRoom).map(q => this.pub(q)) });
    for (const q of here) this.send(q, { t: 'came', p: this.pub(p) });
  }
  message(sock, raw) {
    if (typeof raw !== 'string' || raw.length > LIMITS.snap + 2000) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    let p = this.bySock.get(sock);
    if (m.t === 'hello') {
      const id = clean(m.id, 24); if (!/^[A-Za-z0-9]{8,24}$/.test(id)) return;
      if (!p && this.players.size >= LIMITS.players) { this.send({ sock }, { t: 'full' }); return; }
      const old = this.players.get(id);
      if (old && old.sock !== sock) { this.send(old, { t: 'bye', why: 'Bạn đã vào làng từ chỗ khác' }); this.bySock.delete(old.sock); try { old.sock.close(); } catch (e) {} this.leave(old, old.room); }
      p = { id, sock, name: clean(m.name, LIMITS.name) || 'Chuột lạ', room: null, x: 0, y: 0, face: 1, mv: 0, last: 0, friends: new Set((Array.isArray(m.friends) ? m.friends : []).slice(0, 200).map(f => clean(f, 24))) };
      this.bySock.set(sock, p); this.players.set(id, p);
      this.send(p, { t: 'welcome', id, online: [...p.friends].filter(f => this.players.has(f)), count: this.players.size });
      this.tell(id, 'on'); return;
    }
    if (!p) return;
    if (this.custom && ['ttinfo', 'incense'].includes(m.t)) { this.custom(p, m); return; }   // Góc Tĩnh Tâm: incense, kept by the Durable Object (index.js)
    const now = Date.now();
    switch (m.t) {
      case 'room': {                                                    // enter an area (or a home farm)
        const room = clean(m.room, LIMITS.room); if (!room) return;
        if (p.room) this.leave(p, p.room);
        p.x = num(m.x, 0, 200); p.y = num(m.y, 0, 200); this.join(p, room); break;
      }
      case 'move': {
        if (!p.room) return; p.x = num(m.x, 0, 200); p.y = num(m.y, 0, 200); p.face = m.face < 0 ? -1 : 1; p.mv = Math.round(num(m.mv, 0, 3));   // 0 stand, 1 walk, 2 sit (Góc Tĩnh Tâm)
        for (const q of this.roomOf(p.room)) if (q !== p) this.send(q, { t: 'move', id: p.id, x: p.x, y: p.y, face: p.face, mv: p.mv });
        break;
      }
      case 'chat': {
        if (!p.room || now - p.last < 700) return; p.last = now; const text = clean(m.text, LIMITS.chat); if (!text) return;
        for (const q of this.roomOf(p.room)) this.send(q, { t: 'chat', id: p.id, name: p.name, text });
        break;
      }
      case 'who': {
        const list = []; for (const q of this.players.values()) { if (q.id !== p.id && list.length < 60) list.push({ id: q.id, name: q.name, room: q.room }); }
        this.send(p, { t: 'who', list, count: this.players.size }); break;
      }
      case 'friends': p.friends = new Set((Array.isArray(m.list) ? m.list : []).slice(0, 200).map(f => clean(f, 24))); this.send(p, { t: 'online', online: [...p.friends].filter(f => this.players.has(f)) }); break;
      // relayed to one player: friend requests (fr: ask / ok / no), asking a host for the farm (snapreq), the farm itself (snap),
      // helping on someone's farm (help), a private whisper (dm)
      case 'fr': case 'snapreq': case 'snap': case 'help': case 'dm': {
        const q = this.players.get(clean(m.to, 24));
        if (!q) { if (m.t === 'snapreq' || m.t === 'fr') this.send(p, { t: 'nobody', for: m.t, to: clean(m.to, 24) }); return; }
        const out = { t: m.t, from: p.id, name: p.name };
        if (m.t === 'fr') out.op = ['ask', 'ok', 'no'].includes(m.op) ? m.op : 'ask';
        else if (m.t === 'snap') { const s = JSON.stringify(m.data || null); if (s.length > LIMITS.snap) return; out.data = m.data; }
        else if (m.t === 'help') { out.what = clean(m.what, 12); out.key = clean(m.key, 12); }
        else if (m.t === 'dm') { out.text = clean(m.text, LIMITS.chat); if (!out.text) return; }
        this.send(q, out); break;
      }
      case 'ping': this.send(p, { t: 'pong' }); break;
    }
  }
}
