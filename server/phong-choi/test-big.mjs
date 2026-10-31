// Test that a PRIVATE room has no biggest-group rule (owner, 2026-10-31; the shared prints keep it) against a LOCAL server: `npx wrangler dev --port 8787 --local`, then `node test-big.mjs`.
// The biggest group can be lifted, put down on other pieces, held longer than 10 s and lifted again by the same player.
const BASE = process.env.BASE || 'http://127.0.0.1:8787', WS = BASE.replace(/^http/, 'ws');
const O = { Origin: 'http://localhost:8000' };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const jpeg = (w, h, n) => { const b = new Uint8Array(n); b[0] = 0xff; b[1] = 0xd8; b.set([0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1], 2); b[n - 2] = 0xff; b[n - 1] = 0xd9; return Buffer.from(b).toString('base64'); };
const post = async (path, body) => { const r = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json', ...O }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function client(room, dev, name) {
  const c = { msgs: [], dev };
  c.ws = new WebSocket(WS + '/jgr/ws?r=' + room, { headers: O });
  c.ws.onopen = () => c.ws.send(JSON.stringify({ t: 'hello', dev, name }));
  c.ws.onmessage = e => c.msgs.push(JSON.parse(e.data));
  c.last = t => c.msgs.filter(m => m.t === t).pop();
  c.since = (t, n) => c.msgs.slice(n).filter(m => m.t === t);
  c.send = o => c.ws.send(JSON.stringify(o));
  return c;
}
const run = Date.now().toString(36), A = 'bigdeva' + run + 'aa01', B = 'bigdevb' + run + 'bb02';
let r = await post('/jgr/create', { dev: A, ownerName: 'A', name: 'Thử nhóm lớn', pieces: 100, img: jpeg(1600, 1000, 5000), thumb: jpeg(220, 138, 2500) });
ok(r.s === 200, 'room made'); const id = r.j.id;
const a = client(id, A, 'A'), b = client(id, B, 'B'); await sleep(1200);
const w = a.last('welcome'), cols = w.cols, rows = w.rows, asp = 1600 / 1000, CW = 44, CH = CW / (asp * rows / cols);
const grp = (arr, ids) => arr.find(x => x[4] === ids);
// join pieces 0 and 1 into the biggest group
{
  const g0 = grp(w.groups, '0'), g1 = grp(w.groups, '1');
  a.send({ t: 'lift', g: g0[0] }); await sleep(300); a.send({ t: 'drop', g: g0[0], x: g1[1], y: g1[2], a: g1[3] }); await sleep(700);
}
const j = a.last('join'); ok(j, 'two pieces joined: the biggest group exists');
await a.send({ t: 'who' }); await sleep(200);
b.send({ t: 'hello', dev: B, name: 'B' });   // a second hello is ignored; ask the state again with a fresh client
const b2 = client(id, B + 'x', 'B2'); await sleep(1000);
const w2 = b2.last('welcome'); const big = w2.groups.find(x => x[4].split(',').length === 2); ok(big, 'the group of two is there: ' + (big && big[4]));
const loose = w2.groups.filter(x => x[4].split(',').length === 1);
const cell = k => [(k % cols + .5) * CW, (Math.floor(k / cols) + .5) * CH];
const rot = (an, x, y) => [x * Math.cos(an) - y * Math.sin(an), x * Math.sin(an) + y * Math.cos(an)];
// the pose that puts big's piece 0 on the centre of a loose piece k
const k = cols * 2 + 3, lk = loose.find(x => +x[4] === k), c0 = cell(0), ck = cell(k);
const onTop = (() => { const lc = rot(lk[3], ck[0], ck[1]), o = rot(lk[3], c0[0], c0[1]); return [lk[1] + lc[0] - o[0], lk[2] + lc[1] - o[1], lk[3]]; })();

// 1. any player can lift it
a.send({ t: 'lift', g: big[0] }); await sleep(400);
ok(a.last('lift') || a.msgs.some(m => m.t === 'lift' && m.g === big[0]) , 'the biggest group can be lifted');
// 2. private rooms have no biggest-group rule (owner, 2026-10-31): it can be put down on top of a piece, nothing is refused
let n = a.msgs.length; a.send({ t: 'drop', g: big[0], x: onTop[0], y: onTop[1], a: onTop[2] }); await sleep(500);
ok(a.since('nodrop', n).length === 0, 'dropped on top of a piece: no nodrop in a private room');
ok(a.since('drop', n).length === 1 && !a.since('drop', n)[0].back, 'the drop was accepted where it was put');
// 3. no lock for the carrier, and no 10 s limit
n = a.msgs.length; a.send({ t: 'lift', g: big[0] }); await sleep(400);
ok(a.since('deny', n).length === 0, 'the carrier can lift it again at once');
n = a.msgs.length; await sleep(11500);
ok(a.since('timeup', n).length === 0 && a.since('drop', n).length === 0, 'held for 11 s: nothing takes it from the hand');
a.ws.close(); b.ws.close(); b2.ws.close();
console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0);
