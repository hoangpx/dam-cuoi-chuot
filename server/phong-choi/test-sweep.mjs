// Test of the 7-day clean-up of private rooms against a LOCAL server started with `npx wrangler dev --port 8787 --local --var ADMIN:testadmin`, then `node test-sweep.mjs`.
// The sweep is the same one the daily alarm runs; the admin route lets the test choose the age.
const BASE = process.env.BASE || 'http://127.0.0.1:8787', WS = BASE.replace(/^http/, 'ws');
const O = { Origin: 'http://localhost:8000' }, ADM = { Authorization: 'Bearer testadmin' };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const jpeg = (w, h, n) => { const b = new Uint8Array(n); b[0] = 0xff; b[1] = 0xd8; b.set([0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1], 2); b[n - 2] = 0xff; b[n - 1] = 0xd9; return Buffer.from(b).toString('base64'); };
const post = async (path, body) => { const r = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json', ...O }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const list = async dev => (await (await fetch(BASE + '/jgr/list?dev=' + dev, { headers: O })).json()).rooms;
const run = Date.now().toString(36), A = 'swepa' + run + 'aaaa', B = 'swepb' + run + 'bbbb';
const make = async (dev, name) => (await post('/jgr/create', { dev, ownerName: name, name, pieces: 100, img: jpeg(1600, 1000, 5000), thumb: jpeg(220, 138, 2500) })).j.id;
const idA = await make(A, 'Phòng yên'), idB = await make(B, 'Phòng có người ghép');
ok(idA && idB, 'two rooms made');
// a join in room B
const c = new WebSocket(WS + '/jgr/ws?r=' + idB, { headers: O }), msgs = [];
c.onopen = () => c.send(JSON.stringify({ t: 'hello', dev: B, name: 'B' })); c.onmessage = e => msgs.push(JSON.parse(e.data));
await sleep(1200);
const w = msgs.find(m => m.t === 'welcome'), g0 = w.groups.find(x => x[4] === '0'), g1 = w.groups.find(x => x[4] === '1');
c.send(JSON.stringify({ t: 'lift', g: g0[0] })); await sleep(300); c.send(JSON.stringify({ t: 'drop', g: g0[0], x: g1[1], y: g1[2], a: g1[3] })); await sleep(700);
ok(msgs.some(m => m.t === 'join'), 'a piece was joined in room B');
await sleep(11500);   // the room tells the list about it (debounced up to 10 s)
let rows = await list(A); ok(rows.find(r => r.id === idB).joined >= 1, 'the list shows the join');
// the sweep: nothing idle for a day
let r = await (await fetch(BASE + '/jgr-admin/sweep?age=86400000', { headers: ADM })).json(); ok(Array.isArray(r.gone) && !r.gone.includes(idA) && !r.gone.includes(idB), 'a fresh room is not swept');
r = await fetch(BASE + '/jgr-admin/sweep?age=1000'); ok(r.status === 403, 'the sweep needs the admin key');
// room A has been idle since it was made (~17 s), room B only for the ~5 s since its join: an age of 10 s takes A and leaves B
await sleep(500);
r = await (await fetch(BASE + '/jgr-admin/sweep?age=10000', { headers: ADM })).json();
ok(r.gone.includes(idA) && !r.gone.includes(idB), 'the room nobody joined is swept, the one with a join stays: ' + JSON.stringify(r.gone));
rows = await list(B); ok(!rows.find(x => x.id === idA) && rows.find(x => x.id === idB), 'A is gone from the list, B is still there');
const th = await fetch(BASE + '/jgr/thumb?r=' + idA, { headers: O }); ok(th.status === 404, 'its picture is gone');
const again = await post('/jgr/create', { dev: A, ownerName: 'A', name: 'Phòng mới', pieces: 100, img: jpeg(1600, 1000, 5000), thumb: jpeg(220, 138, 2500) }); ok(again.s === 200, 'its owner can make a new one');
// room B was idle too (the second join was only a try), so a sweep with age 0 takes everything: just check the endpoint answers
r = await (await fetch(BASE + '/jgr-admin/sweep?age=0', { headers: ADM })).json(); ok(Array.isArray(r.gone), 'age 0 sweeps the rest: ' + r.gone.length);
c.close();
console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0);
