/* Cloudflare Worker for Chương IV online: players visiting each other's markets (owner 2026-10-28). GET /ws → WebSocket into the one
   Durable Object "market" (a Hub, see hub.js). Deploy: cd worker-cho && npx wrangler deploy. All state lives in memory while players are
   connected (the object uses SQLite storage only because the free plan needs it declared). */
import { Hub } from './hub.js';
const ORIGINS = ['https://damcuoichuot.com', 'https://www.damcuoichuot.com', 'http://localhost', 'http://127.0.0.1'];
const JSON_HEAD = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };

export class Market {
  constructor(state, env) { this.hub = new Hub(); }
  async fetch(req) {
    if (new URL(req.url).pathname === '/names') return new Response(JSON.stringify({ names: [...this.hub.players.values()].slice(0, 400).map(q => q.name) }), { headers: JSON_HEAD });
    if (new URL(req.url).pathname === '/count') return new Response(JSON.stringify({ count: this.hub.players.size, hosts: this.hub.hostCount() }), { headers: JSON_HEAD });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Chợ chương IV online. Dùng WebSocket.', { status: 426 });
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
      return env.MARKET.get(env.MARKET.idFromName('cho2')).fetch(req);
    }
    if (url.pathname === '/count' || url.pathname === '/names') return env.MARKET.get(env.MARKET.idFromName('cho2')).fetch(req);
    return new Response('Chợ chương IV online', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
