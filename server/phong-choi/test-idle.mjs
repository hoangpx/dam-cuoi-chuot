// A tab that does nothing is sent away; one that moves stays. LOCAL server: `npx wrangler dev --port 8787 --local --var IDLE_MS:4000`, then `node test-idle.mjs`.
const BASE = process.env.BASE || 'http://127.0.0.1:8787', WS = BASE.replace(/^http/, 'ws'), O = { Origin: 'http://localhost:8000' };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const jpeg = (w, h, n) => { const b = new Uint8Array(n); b[0] = 0xff; b[1] = 0xd8; b.set([0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1], 2); b[n - 2] = 0xff; b[n - 1] = 0xd9; return Buffer.from(b).toString('base64'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dev = 'idle' + Date.now().toString(36) + 'devaaaa';
const r = await (await fetch(BASE + '/jgr/create', { method: 'POST', headers: { 'content-type': 'application/json', ...O }, body: JSON.stringify({ dev, ownerName: 'A', name: 'Nghỉ', pieces: 100, img: jpeg(1600, 1000, 5000), thumb: jpeg(220, 138, 2500) }) })).json();
const mk = (d, n) => { const c = { msgs: [], code: null }; c.ws = new WebSocket(WS + '/jgr/ws?r=' + r.id, { headers: O }); c.ws.onopen = () => c.ws.send(JSON.stringify({ t: 'hello', dev: d, name: n })); c.ws.onmessage = e => c.msgs.push(JSON.parse(e.data)); c.ws.onclose = e => { c.code = e.code; }; return c; };
const a = mk(dev, 'Rảnh'), b = mk(dev + 'b', 'Bận'); await sleep(1200);
const w = b.msgs.find(m => m.t === 'welcome'), g = w.groups[0];
for (let i = 0; i < 6; i++) { b.ws.send(JSON.stringify({ t: 'poke', g: g[0] })); await sleep(1000); }   // the busy one keeps sending
ok(a.code === 4013 && a.msgs.some(m => m.t === 'idle'), 'the idle tab was sent away with code 4013');
ok(b.code === null, 'the busy tab is still connected');
await sleep(9000); ok(b.code === 4013, 'and when it stops too, it goes as well');
console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0);
