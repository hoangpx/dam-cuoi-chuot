/* Cloudflare Worker for Chương IX online. GET /ws → WebSocket into the one Durable Object "village" (a Hub, see hub.js).
   Deploy: cd worker && npx wrangler deploy (needs the owner's Cloudflare login). Free plan: the Durable Object uses SQLite storage
   (declared in wrangler.toml) although this game keeps nothing in it: all state lives in memory while players are connected. */
import { Hub } from './hub.js';
const ORIGINS = ['https://damcuoichuot.com', 'https://www.damcuoichuot.com', 'http://localhost', 'http://127.0.0.1'];

// Góc Tĩnh Tâm keeps its incense in the object's storage: today's (inc:<day> = { n, ids }, one stick a player a Vietnam day) and, for the
// owner's records only (never shown in the game; GET /tt/stats), how many sticks were ever lit (incAll) and by how many people (incPeople,
// p:<id> marks each). The urn shows today's sticks burning and the older ones as stubs. Its wishes are Chương IV's lanterns (Supabase).
const vnDay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const cleanText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export class Village {
  constructor(state, env) { this.state = state; this.hub = new Hub(); this.hub.custom = (p, m) => this.custom(p, m).catch(e => console.error("tt custom", e && e.stack || e)); }
  async custom(p, m) {
    const S = this.state.storage, day = vnDay(), hub = this.hub, all = msg => { for (const q of hub.roomOf(p.room)) hub.send(q, typeof msg === 'function' ? msg(q) : msg); };
    if (m.t === 'ttinfo') {
      const inc = (await S.get('inc:' + day)) || { n: 0, ids: [] };
      hub.send(p, { t: 'ttinfo', incense: inc.n, lit: inc.ids.includes(p.id), all: (await S.get('incAll')) || 0, ts: (inc.ts || []).slice(-40), pos: (inc.pos || []).slice(-40) });
    } else if (m.t === 'incense') {
      const k = 'inc:' + day, inc = (await S.get(k)) || { n: 0, ids: [] };
      if (inc.ids.includes(p.id)) { hub.send(p, { t: 'incense', n: inc.n, me: true, again: true }); return; }
      const ts = Date.now(), n = (v, a) => { v = +v; return Number.isFinite(v) ? Math.max(-a, Math.min(a, v)) : 0; }, pos = [n(m.x, 44), n(m.lean, .3)];   // where the player planted it
      inc.n++; inc.ids.push(p.id); (inc.ts = inc.ts || []).push(ts); (inc.pos = inc.pos || []).push(pos); while (inc.pos.length < inc.ts.length) inc.pos.unshift(null); await S.put(k, inc);
      const total = ((await S.get('incAll')) || 0) + 1; await S.put('incAll', total);
      if (!(await S.get('p:' + p.id))) { await S.put('p:' + p.id, day); await S.put('incPeople', ((await S.get('incPeople')) || 0) + 1); }
      all(q => ({ t: 'incense', n: inc.n, all: total, ts, pos, me: q === p }));
    }
  }
  async fetch(req) {
    if (/\/stats$/.test(new URL(req.url).pathname)) { const S = this.state.storage; return new Response(JSON.stringify({ sticks: (await S.get('incAll')) || 0, people: (await S.get('incPeople')) || 0, today: ((await S.get('inc:' + vnDay())) || { n: 0 }).n }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }   // the owner's record of the incense
    if (/\/count$/.test(new URL(req.url).pathname)) return new Response(JSON.stringify({ count: this.hub.players.size }), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' } });   // how many are in the village now (the chapter list shows it)
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Làng Vũ Đại online. Dùng WebSocket.', { status: 426 });
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    server.accept(); this.hub.add(server);
    server.addEventListener('message', e => this.hub.message(server, e.data));
    const end = () => this.hub.close(server);
    server.addEventListener('close', end); server.addEventListener('error', end);
    return new Response(null, { status: 101, webSocket: client });
  }
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    if (url.pathname === '/ws') {
      if (origin && !ORIGINS.some(o => origin === o || origin.startsWith(o + ':'))) return new Response('forbidden', { status: 403 });
      return env.VILLAGE.get(env.VILLAGE.idFromName('lang')).fetch(req);
    }
    if (url.pathname === '/count') return env.VILLAGE.get(env.VILLAGE.idFromName('lang')).fetch(req);
    // Góc Tĩnh Tâm: its own object (the same Hub code), so its count and its players are apart from the village's. A running object keeps
    // its old code while anyone is connected: after changing the code, rename it (tinhtam → … → tinhtam4 → …) as for the village
    if (url.pathname === '/tt/ws') {
      if (origin && !ORIGINS.some(o => origin === o || origin.startsWith(o + ':'))) return new Response('forbidden', { status: 403 });
      return env.VILLAGE.get(env.VILLAGE.idFromName('tinhtam6')).fetch(req);
    }
    if (url.pathname === '/tt/count' || url.pathname === '/tt/stats') return env.VILLAGE.get(env.VILLAGE.idFromName('tinhtam6')).fetch(req);
    return new Response('Làng Vũ Đại online', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
