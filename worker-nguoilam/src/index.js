// dcc-nguoilam: the hired hands' chat of chương IV (js/ch4b/nguoilam-ct.js). POST /chat { dev, persona, history, msg } → { reply, tone, left }.
// The API key is the Worker secret ANTHROPIC_API_KEY (npx wrangler secret put ANTHROPIC_API_KEY); quotas are kept by one Durable Object.
import Anthropic from '@anthropic-ai/sdk';
import { cleanPersona, cleanHistory, buildRequest, readAnswer, vnDay, MAX_MSG, PER_DEVICE, PER_IP, PER_DAY } from './chat.js';

const ORIGINS = [/^https:\/\/(www\.)?damcuoichuot\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, /^http:\/\/(192\.168|10)\.\d+\.\d+\.\d+(:\d+)?$/, /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/];
const okOrigin = o => !!o && ORIGINS.some(r => r.test(o));
const cors = o => ({ 'access-control-allow-origin': okOrigin(o) ? o : 'https://damcuoichuot.com', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'vary': 'origin' });
const json = (o, status, origin) => new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors(origin) } });

export class Quota {
  constructor(state) { this.state = state; }
  // { dev, ip } → takes one message if every limit allows it; { ok, left } or { ok: false, why }
  async fetch(req) {
    const { dev, ip } = await req.json(), S = this.state.storage, d = vnDay();
    const kD = `d:${d}:${dev}`, kI = `i:${d}:${ip}`, kG = `g:${d}`;
    const [nD, nI, nG] = await Promise.all([S.get(kD), S.get(kI), S.get(kG)]);
    if ((nG || 0) >= PER_DAY) return Response.json({ ok: false, why: 'day' });
    if ((nD || 0) >= PER_DEVICE || (nI || 0) >= PER_IP) return Response.json({ ok: false, why: 'you' });
    await S.put({ [kD]: (nD || 0) + 1, [kI]: (nI || 0) + 1, [kG]: (nG || 0) + 1 });
    if (!(await S.get('swept')) || (await S.get('swept')) !== d) {   // once a day: forget earlier days
      const old = await S.list({ limit: 1000 }); const del = [...old.keys()].filter(k => /^[dig]:/.test(k) && !k.includes(':' + d)); if (del.length) await S.delete(del.slice(0, 128)); await S.put('swept', d);
    }
    return Response.json({ ok: true, left: PER_DEVICE - (nD || 0) - 1 });
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === '/health') return json({ ok: true, key: !!env.ANTHROPIC_API_KEY }, 200, origin);
    if (url.pathname !== '/chat' || req.method !== 'POST') return json({ error: 'not found' }, 404, origin);
    if (!okOrigin(origin)) return json({ error: 'origin' }, 403, origin);
    if (!env.ANTHROPIC_API_KEY) return json({ error: 'nokey' }, 503, origin);
    let b; try { b = await req.json(); } catch (e) { return json({ error: 'bad' }, 400, origin); }
    const msg = String(b && b.msg || '').trim().slice(0, MAX_MSG), dev = String(b && b.dev || '').slice(0, 64);
    if (!msg || !dev) return json({ error: 'bad' }, 400, origin);
    const ip = req.headers.get('cf-connecting-ip') || 'x';
    const q = await (await env.QUOTA.get(env.QUOTA.idFromName('q')).fetch('https://q/', { method: 'POST', body: JSON.stringify({ dev, ip }) })).json();
    if (!q.ok) return json({ error: q.why === 'day' ? 'busy' : 'limit' }, 429, origin);
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 20000 });
    try {
      const res = await client.messages.create(buildRequest(cleanPersona(b.persona), cleanHistory(b.history), msg));
      return json({ ...readAnswer(res), left: q.left }, 200, origin);
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429, origin);
      if (e instanceof Anthropic.APIError) return json({ error: 'api', status: e.status }, 502, origin);
      return json({ error: 'net' }, 502, origin);
    }
  }
};
