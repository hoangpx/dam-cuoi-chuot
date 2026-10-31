// Test of the biggest-group rule (owner, 2026-10-31) against a LOCAL server: `npx wrangler dev --port 8787 --local`, then `node test-big.mjs`.
// The biggest group can be lifted, is not put down while it lies on another piece ('nodrop'), is taken from the carrier after 10 s, and the carrier cannot lift it again for a minute.
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
// 2. putting it down on a piece is refused and it stays in the hand
let n = a.msgs.length; a.send({ t: 'drop', g: big[0], x: onTop[0], y: onTop[1], a: onTop[2] }); await sleep(500);
ok(a.since('nodrop', n).length === 1, 'dropped on top of a piece: refused (nodrop)');
ok(a.since('drop', n).length === 0, 'no drop was broadcast');
// 3. still held: another player cannot lift it
n = b2.msgs.length; b2.send({ t: 'lift', g: big[0] }); await sleep(400);
ok(b2.since('deny', n).length === 1, 'still in the first hand: the other player is denied');
// 4. move it to a clear place and put it down
const clear = (() => {   // the spot whose two pieces are farthest from every loose piece (the server's limit is .8 of the smaller cell)
  let best = null;
  for (let t = 0; t < 20000; t++) {
    const x = 20 + ((t * 7919) % 9973) / 9973 * (cols * CW * 1.5 - 120), y = 20 + ((t * 6007) % 9967) / 9967 * (rows * CH * 1.5 - 100);
    const pcs = [[x + c0[0], y + c0[1]], [x + cell(1)[0], y + cell(1)[1]]]; let d = 1e9;
    for (const l of loose) { const lc = rot(l[3], cell(+l[4])[0], cell(+l[4])[1]), p = [l[1] + lc[0], l[2] + lc[1]]; for (const q of pcs) d = Math.min(d, Math.hypot(q[0] - p[0], q[1] - p[1])); }
    if (!best || d > best.d) best = { d, p: [x, y, 0] };
  }
  return best.d > Math.min(CW, CH) * 1.1 ? best.p : null;
})();
ok(clear, 'found a clear place on the table');
n = a.msgs.length; a.send({ t: 'drop', g: big[0], x: clear[0], y: clear[1], a: clear[2] }); await sleep(500);
const dr = a.since('drop', n); ok(dr.length === 1 && !dr[0].back && Math.abs(dr[0].x - clear[0]) < 25, 'dropped on a clear place: accepted ' + JSON.stringify(dr[0]));
// 5. the carrier cannot lift it again for a minute, another player can
n = a.msgs.length; a.send({ t: 'lift', g: big[0] }); await sleep(400);
const dn = a.since('deny', n); ok(dn.length === 1 && dn[0].lock > 50 && dn[0].lock <= 60, 'the carrier is locked out for about a minute: ' + JSON.stringify(dn[0]));
n = b2.msgs.length; b2.send({ t: 'lift', g: big[0] }); await sleep(400);
ok(b2.since('deny', n).length === 0 && b2.msgs.slice(n).some(m => m.t === 'lift'), 'another player can lift it');
// 6. held for 10 s: taken, and back where it was lifted because it lies on a piece
n = b2.msgs.length; b2.send({ t: 'move', g: big[0], x: onTop[0], y: onTop[1], a: onTop[2] });
await sleep(11500);
const tu = b2.since('timeup', n), dd = b2.since('drop', n);
ok(tu.length === 1 && tu[0].sec === 60, 'after 10 s the carrier is told time is up');
ok(dd.length === 1 && dd[0].back === 1 && Math.abs(dd[0].x - clear[0]) < 25, 'it went back to where it was lifted: ' + JSON.stringify(dd[0]));
a.ws.close(); b.ws.close(); b2.ws.close();
console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0);
