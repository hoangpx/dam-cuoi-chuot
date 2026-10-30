/* Cloudflare Worker for Chương IX online. GET /ws → WebSocket into the one Durable Object "village" (a Hub, see hub.js).
   Deploy: cd worker && npx wrangler deploy (needs the owner's Cloudflare login). Free plan: the Durable Object uses SQLite storage
   (declared in wrangler.toml) although this game keeps nothing in it: all state lives in memory while players are connected. */
import { Hub } from './hub.js';
const ORIGINS = ['https://damcuoichuot.com', 'https://www.damcuoichuot.com', 'http://localhost', 'http://127.0.0.1'];

// Góc Tĩnh Tâm keeps its incense in the object's storage: today's (inc:<day> = { n, ids }, one stick a player a Vietnam day) and, for the
// owner's records (GET /tt/stats; since 2026-10-29 the game shows visitors and sticks in the corner's top right), how many sticks were ever lit (incAll) and by how many people (incPeople,
// p:<id> marks each). The urn shows today's sticks burning and the older ones as stubs. Its wishes are Chương IV's lanterns (Supabase).
const TT_NOW = 'tinhtam7', TT_PREV = 'tinhtam6';                          // the corner's object now and the one before it (migrate)
const vnDay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const cleanText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export class Village {
  constructor(state, env) { this.state = state; this.env = env; this.hub = new Hub(); this.hub.custom = (p, m) => this.custom(p, m).catch(e => console.error("tt custom", e && e.stack || e)); }
  // a new object of the corner takes over the counts of the one before it (TT_PREV) the first time it is used: the totals from its /tt/stats,
  // today's sticks with their light times and places from a ttinfo over a WebSocket (the old object keeps running its old code)
  migrate() {
    if (this.migP) return this.migP;
    return this.migP = (async () => {
      const S = this.state.storage; if (await S.get('mig')) return;
      const old = this.env.VILLAGE.get(this.env.VILLAGE.idFromName(TT_PREV));
      const st = await (await old.fetch('https://dcc/tt/stats')).json();
      let info = null;
      try {
        const r = await old.fetch('https://dcc/tt/ws', { headers: { Upgrade: 'websocket' } }), ws = r.webSocket;
        if (ws) {
          ws.accept();
          info = await new Promise(res => {
            const to = setTimeout(() => res(null), 4000);
            ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.t === 'welcome') ws.send(JSON.stringify({ t: 'ttinfo' })); else if (m.t === 'ttinfo') { clearTimeout(to); res(m); } } catch (x) {} });
            ws.send(JSON.stringify({ t: 'hello', id: 'chuyennha' + TT_PREV.replace(/\W/g, ''), name: 'chuyển nhà' }));
          });
          try { ws.close(); } catch (e) {}
        }
      } catch (e) { console.error('tt migrate ws', e && e.stack || e); }
      const day = vnDay(), k = 'inc:' + day, cur = (await S.get(k)) || { n: 0, ids: [] };
      await S.put('incAll', ((await S.get('incAll')) || 0) + (st.sticks || 0));
      await S.put('incPeople', ((await S.get('incPeople')) || 0) + (st.people || 0));
      if (st.visitors) await S.put('visAll', ((await S.get('visAll')) || 0) + st.visitors);
      cur.n += info ? info.incense || 0 : st.today || 0;
      if (info && Array.isArray(info.ts)) { const pos = Array.isArray(info.pos) ? info.pos : []; while (pos.length < info.ts.length) pos.unshift(null); cur.ts = [...info.ts, ...(cur.ts || [])]; cur.pos = [...pos, ...(cur.pos || [])]; }
      await S.put(k, cur); await S.put('mig', day);
    })().catch(e => { console.error('tt migrate', e && e.stack || e); this.migP = null; });
  }
  async custom(p, m) {
    await this.migrate();
    const S = this.state.storage, day = vnDay(), hub = this.hub, all = msg => { for (const q of hub.roomOf(p.room)) hub.send(q, typeof msg === 'function' ? msg(q) : msg); };
    if (m.t === 'ttinfo') {                                                 // sent once on entering: a visit (each player counted once: v:<id>)
      const inc = (await S.get('inc:' + day)) || { n: 0, ids: [] };
      let vis = await S.get('visAll');
      if (vis == null) vis = 0;
      if (!(await S.get('v:' + p.id)) && !(await S.get('p:' + p.id))) vis++;
      await S.put('v:' + p.id, day); await S.put('visAll', vis);
      hub.send(p, { t: 'ttinfo', visitors: Math.max(vis, (await S.get('incPeople')) || 0), incense: inc.n, lit: inc.ids.includes(p.id), all: (await S.get('incAll')) || 0, ts: (inc.ts || []).slice(-40), pos: (inc.pos || []).slice(-40) });
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
    if (/^\/tt\//.test(new URL(req.url).pathname) && !/chuyennha/.test(req.url)) await this.migrate();
    if (/\/stats$/.test(new URL(req.url).pathname)) { const S = this.state.storage; return new Response(JSON.stringify({ visitors: Math.max((await S.get('visAll')) || 0, (await S.get('incPeople')) || 0), sticks: (await S.get('incAll')) || 0, people: (await S.get('incPeople')) || 0, today: ((await S.get('inc:' + vnDay())) || { n: 0 }).n }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }   // the owner's record of the incense
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
      return env.VILLAGE.get(env.VILLAGE.idFromName(TT_NOW)).fetch(req);
    }
    if (url.pathname === '/tt/count' || url.pathname === '/tt/stats') return env.VILLAGE.get(env.VILLAGE.idFromName(TT_NOW)).fetch(req);
    return new Response('Làng Vũ Đại online', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
