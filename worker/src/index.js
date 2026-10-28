/* Cloudflare Worker for Chương IX online. GET /ws → WebSocket into the one Durable Object "village" (a Hub, see hub.js).
   Deploy: cd worker && npx wrangler deploy (needs the owner's Cloudflare login). Free plan: the Durable Object uses SQLite storage
   (declared in wrangler.toml) although this game keeps nothing in it: all state lives in memory while players are connected. */
import { Hub } from './hub.js';
const ORIGINS = ['https://damcuoichuot.com', 'https://www.damcuoichuot.com', 'http://localhost', 'http://127.0.0.1'];

export class Village {
  constructor(state, env) { this.hub = new Hub(); }
  async fetch(req) {
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
    return new Response('Làng Vũ Đại online', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
