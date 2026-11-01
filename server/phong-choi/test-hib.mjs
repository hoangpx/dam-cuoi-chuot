// Hibernation of a private room (owner, 2026-11-01). LOCAL server: `npx wrangler dev --port 8787 --local`, then `node test-hib.mjs`.
// Two players join, everybody stays quiet long enough for the object to sleep, then they must still be able to play and see each other.
const BASE = process.env.BASE || 'http://127.0.0.1:8787', WS = BASE.replace(/^http/, 'ws'), O = { Origin: 'http://localhost:8000' };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const jpeg = (w, h, n) => { const b = new Uint8Array(n); b[0] = 0xff; b[1] = 0xd8; b.set([0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1], 2); b[n - 2] = 0xff; b[n - 1] = 0xd9; return Buffer.from(b).toString('base64'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const run = Date.now().toString(36), A = 'hiba' + run + 'devaaaa', B = 'hibb' + run + 'devbbbb';
const mk = (id, d, n) => { const c = { msgs: [], code: null }; c.ws = new WebSocket(WS + '/jgr/ws?r=' + id, { headers: O }); c.ws.onopen = () => c.ws.send(JSON.stringify({ t: 'hello', dev: d, name: n })); c.ws.onmessage = e => c.msgs.push(JSON.parse(e.data)); c.ws.onclose = e => { c.code = e.code; }; c.send = o => c.ws.send(JSON.stringify(o)); c.has = (t, f) => c.msgs.some(m => m.t === t && (!f || f(m))); return c; };
const r = await (await fetch(BASE + '/jgr/create', { method: 'POST', headers: { 'content-type': 'application/json', ...O }, body: JSON.stringify({ dev: A, ownerName: 'A', name: 'Ngủ đông', pieces: 100, img: jpeg(1600, 1000, 5000), thumb: jpeg(220, 138, 2500) }) })).json();
const a = mk(r.id, A, 'An'), b = mk(r.id, B, 'Bình'); await sleep(1500);
const w = a.msgs.find(m => m.t === 'welcome'); ok(w && w.players.length >= 1, 'joined');
await sleep(20000);   // quiet: the object goes to sleep
ok(a.code === null && b.code === null, 'both sockets are still open after a quiet spell');
// a lift and a drop after the sleep, seen by the other player
const g0 = w.groups.find(x => x[4] === '0'), g1 = w.groups.find(x => x[4] === '1');
a.send({ t: 'lift', g: g0[0] }); await sleep(2500);   // the first message after a sleep also waits for the object to start
ok(a.msgs.some(m => m.t === 'lift' && m.g === g0[0]) && b.has('lift', m => m.g === g0[0]), 'a lift after waking is seen by both');
a.send({ t: 'drop', g: g0[0], x: g1[1], y: g1[2], a: g1[3] }); await sleep(800);
ok(b.has('join'), 'the join after waking reaches the other player');
b.send({ t: 'chat', s: 'chào' }); await sleep(400); ok(a.has('chat', m => m.s === 'chào'), 'chat works after waking');
// sleep again, then a close wakes it and the others hear about it
await sleep(20000); b.ws.close(); await sleep(800);
ok(a.msgs.filter(m => m.t === 'players').pop().players.length === 1, 'a close after a second sleep is announced');
a.ws.close();
console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0);
