/* Cloudflare Worker for Chương IV online: players visiting each other's markets (owner 2026-10-28). GET /ws → WebSocket into the one
   Durable Object "market" (a Hub, see hub.js). Deploy: cd worker-cho && npx wrangler deploy. All state lives in memory while players are
   connected (the object uses SQLite storage only because the free plan needs it declared). */
import { Hub } from './hub.js';
const ORIGINS = ['https://damcuoichuot.com', 'https://www.damcuoichuot.com', 'http://localhost', 'http://127.0.0.1'];
const JSON_HEAD = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };

export class Market {
  // WebSocket Hibernation (2026-11-20, the Cloudflare bill): sockets are accepted with state.acceptWebSocket, so the object sleeps while
  // nobody sends anything and is billed only while it handles a message. Waking runs this constructor again: the players are rebuilt from
  // their sockets' attachments and storage (pf:<id> the look, sn:<id> the market snapshot) before the first message is handled.
  constructor(state, env) {
    this.state = state; this.hub = new Hub();
    state.blockConcurrencyWhile(async () => {
      for (const ws of state.getWebSockets()) {
        this.hub.add(ws); let a = null; try { a = ws.deserializeAttachment(); } catch (e) {}
        if (a && a.id) this.hub.restore(ws, a, await state.storage.get('pf:' + a.id), a.hp ? await state.storage.get('sn:' + a.id) : null);
      }
    });
  }
  flush() {
    const hub = this.hub, S = this.state.storage;
    for (const p of hub.dirty) if (hub.bySock.get(p.sock) === p) { try { p.sock.serializeAttachment(hub.att(p)); } catch (e) { console.error('att', e && e.message); } }
    for (const p of hub.big) if (hub.bySock.get(p.sock) === p) {
      S.put('pf:' + p.id, p.prof || null).catch(() => {});
      if (p.host) S.put('sn:' + p.id, p.host.snap || null).catch(() => {}); else S.delete('sn:' + p.id).catch(() => {});
    }
    hub.dirty.clear(); hub.big.clear();
  }
  async webSocketMessage(ws, data) { this.hub.message(ws, typeof data === 'string' ? data : new TextDecoder().decode(data)); this.flush(); }
  async webSocketClose(ws, code) { this.end(ws); try { ws.close(1000, 'bye'); } catch (e) {} }
  async webSocketError(ws) { this.end(ws); }
  end(ws) {
    const p = this.hub.bySock.get(ws); this.hub.close(ws); this.flush();
    if (p && !this.hub.players.has(p.id)) this.state.storage.delete(['pf:' + p.id, 'sn:' + p.id]).catch(() => {});
  }
  async fetch(req) {
    if (new URL(req.url).pathname === '/names') return new Response(JSON.stringify({ names: [...this.hub.players.values()].slice(0, 400).map(q => q.name) }), { headers: JSON_HEAD });
    if (new URL(req.url).pathname === '/count') return new Response(JSON.stringify({ count: this.hub.players.size, hosts: this.hub.hostCount() }), { headers: JSON_HEAD });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Chợ chương IV online. Dùng WebSocket.', { status: 426 });
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server); this.hub.add(server);
    return new Response(null, { status: 101, webSocket: client });
  }
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    if (url.pathname === '/ws') {
      if (origin && !ORIGINS.some(o => origin === o || origin.startsWith(o + ':'))) return new Response('forbidden', { status: 403 });
      return env.MARKET.get(env.MARKET.idFromName('cho3')).fetch(req);
    }
    if (url.pathname === '/count' || url.pathname === '/names') return env.MARKET.get(env.MARKET.idFromName('cho3')).fetch(req);
    return new Response('Chợ chương IV online', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
