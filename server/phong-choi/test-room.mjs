// Test of the private jigsaw rooms against a LOCAL server: `npx wrangler dev --port 8787 --local`, then `node test-room.mjs`.
// Never point it at production (it makes rooms). Uses fake JPEGs (only the start-of-frame size matters to the server).
const BASE = process.env.BASE || 'http://127.0.0.1:8787', WS = BASE.replace(/^http/, 'ws');
const O = { Origin: 'http://localhost:8000' };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const jpeg = (w, h, n) => { const b = new Uint8Array(n); b[0] = 0xff; b[1] = 0xd8; b.set([0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1], 2); b[n - 2] = 0xff; b[n - 1] = 0xd9; return Buffer.from(b).toString('base64'); };
const post = async (path, body) => { const r = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json', ...O }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const get = async (path, h) => { const r = await fetch(BASE + path, { headers: { ...O, ...h } }); return r; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function client(room, dev, name, pw) {
  const c = { msgs: [], closed: null, dev };
  c.ws = new WebSocket(WS + '/jgr/ws?r=' + room, { headers: O });
  c.ws.onopen = () => c.ws.send(JSON.stringify({ t: 'hello', dev, name, pw }));
  c.ws.onmessage = e => c.msgs.push(JSON.parse(e.data));
  c.ws.onclose = e => { c.closed = e.code; };
  c.last = t => c.msgs.filter(m => m.t === t).pop();
  return c;
}
const owner = 'ownerdev0000000001', guest = 'guestdev00000000002', guest2 = 'guestdev00000000003';
const img = jpeg(1600, 1000, 5000), thumb = jpeg(220, 138, 2500);

let r = await post('/jgr/create', { dev: owner, ownerName: 'Chủ', name: 'Tranh nhà mình', pw: 'abc123', pieces: 200, img, thumb });
ok(r.s === 200 && r.j.id, 'create a room ' + JSON.stringify(r.j)); const id = r.j.id;
r = await post('/jgr/create', { dev: owner, ownerName: 'Chủ', name: 'Hai', pieces: 100, img, thumb });
ok(r.s === 409 && r.j.error === 'one', 'a second unfinished room is refused');
r = await post('/jgr/create', { dev: guest, ownerName: 'Khách', name: 'x', pieces: 100, img, thumb }); ok(r.j.error === 'name', 'short name refused');
r = await post('/jgr/create', { dev: guest, ownerName: 'Khách', name: 'Tranh nhỏ', pieces: 150, img, thumb }); ok(r.j.error === 'pieces', 'odd piece count refused');
r = await post('/jgr/create', { dev: guest, ownerName: 'Khách', name: 'Tranh nhỏ', pieces: 100, img: jpeg(300, 300, 5000), thumb }); ok(r.j.error === 'size', 'tiny picture refused');
r = await post('/jgr/create', { dev: guest, ownerName: 'Khách', name: 'Tranh nhỏ', pieces: 100, img: Buffer.from('hello').toString('base64').repeat(500), thumb }); ok(r.j.error === 'size' || r.j.error === 'pic', 'not a jpeg refused');

let l = await (await get('/jgr/list?dev=' + owner)).json();
const row = l.rooms.find(x => x.id === id);
ok(row && row.mine && row.locked && row.cols * row.rows <= 200 && row.cols * row.rows > 150, 'list shows my locked room, ' + (row && row.cols + 'x' + row.rows) + ', no owner secret: ' + !JSON.stringify(l).includes(owner));
ok(l.canCreate === false, 'owner may not create another');
l = await (await get('/jgr/list?dev=' + guest)).json(); ok(l.canCreate === true && !l.rooms[0].mine, 'guest sees it as not mine and may create');
let t = await get('/jgr/thumb?r=' + id); ok(t.status === 200 && t.headers.get('content-type') === 'image/jpeg', 'thumb served');

let im = await get('/jgr/img?r=' + id, { 'x-dev': guest, 'x-pw': 'wrong' }); ok(im.status === 403, 'image refused without the password');
im = await get('/jgr/img?r=' + id, { 'x-dev': guest, 'x-pw': 'abc123' }); ok(im.status === 200 && (await im.arrayBuffer()).byteLength === Buffer.from(img, 'base64').length, 'image served with the password');
im = await get('/jgr/img?r=' + id, { 'x-dev': owner }); ok(im.status === 200, 'image served to the owner without the password');

let g = client(id, guest, 'Khách', 'wrong'); await sleep(900); ok(g.closed === 4010, 'wrong password closes 4010 (' + g.closed + ')');
g = client(id, guest, 'Khách', 'abc123'); const o = client(id, owner, 'Chủ', ''); await sleep(1200);
const w = g.last('welcome'), wo = o.last('welcome');
ok(w && wo && w.room.name === 'Tranh nhà mình' && w.room.own === false && wo.room.own === true && w.room.locked === true, 'welcome carries the room (owner flag only for the owner)');
ok(w && w.groups.length === row.cols * row.rows, 'every piece is its own group: ' + (w && w.groups.length));
ok(wo.players.some(p => p.own === 1) && wo.players.length === 2, 'players list marks the owner');
// a guest cannot use admin
r = await post('/jgr/admin?r=' + id, { dev: guest, act: 'reset' }); ok(r.s === 403, 'a guest cannot reset');
// owner drops the password, a newcomer walks in
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'pass', pw: '' }); ok(r.j.ok && r.j.locked === false, 'owner removes the password');
await sleep(300); ok(g.last('room') && g.last('room').locked === false, 'players are told the door is open');
const g2 = client(id, guest2, 'Khách 2', ''); await sleep(900); ok(g2.last('welcome'), 'a newcomer enters with no password');
// lift and drop something to count a join: take piece 0 and 1 to the same pose (server decides)
const grp = Object.fromEntries(w.groups.map(x => [x[4], x]));
// kick
const sid = o.last('players').players.find(p => p.name === 'Khách 2').id;
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'kick', id: sid }); await sleep(500); ok(r.j.ok && g2.closed === 4007, 'owner kicks a player (closed ' + g2.closed + ')');
const g3 = client(id, guest2, 'Khách 2', ''); await sleep(900); ok(g3.closed === 4007, 'a kicked device cannot come back');
im = await get('/jgr/img?r=' + id, { 'x-dev': guest2 }); ok(im.status === 403, 'nor fetch the picture');
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'unkick' }); ok(r.j.ok, 'owner lets them back');
const g4 = client(id, guest2, 'Khách 2', ''); await sleep(900); ok(g4.last('welcome'), 'the unkicked device is in');
// a join: lift and drop group of piece 0 onto a perfect pose next to piece 1 (the lattice pose of piece 1's group, same angle)
{
  const a = w.groups.find(x => x[4] === '0'), b = w.groups.find(x => x[4] === '1');
  g.ws.send(JSON.stringify({ t: 'lift', g: a[0] })); await sleep(300);
  // put piece 0's group where piece 1's lattice origin says it belongs (same x,y,a as group 1's origin)
  g.ws.send(JSON.stringify({ t: 'drop', g: a[0], x: b[1], y: b[2], a: b[3] })); await sleep(600);
  const j = g.last('join'); ok(j && j.paid === 0, 'a join in a private room is counted but not paid: ' + JSON.stringify(j && { paid: j.paid, m: j.m }));
}
await sleep(500);
// board counts the piece
g.ws.send(JSON.stringify({ t: 'board' })); await sleep(400); const bd = g.last('board'); ok(bd && bd.total >= 1, 'board counts the joiner');
// stat reaches the list
await sleep(11000);
l = await (await get('/jgr/list?dev=' + guest)).json(); const r2 = l.rooms.find(x => x.id === id); ok(r2 && r2.n >= 2 && r2.joined >= 1, 'list shows people and joined pieces: ' + JSON.stringify(r2 && { n: r2.n, joined: r2.joined, locked: r2.locked }));
// reset
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'reset' }); await sleep(600); const rs = g.last('reset'); ok(r.j.ok && rs && rs.groups.length === row.cols * row.rows, 'reset reshuffles everything and tells the room');
// new picture: everybody is sent out with 4008, the list changes
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'newpic', pieces: 100, img: jpeg(1000, 1500, 5000), thumb }); await sleep(700);
ok(r.j.ok && r.j.cols * r.j.rows <= 100 && r.j.cols < r.j.rows * 1, 'new picture cut ' + r.j.cols + 'x' + r.j.rows);
ok(g.closed === 4008 && o.closed === 4008, 'everybody is sent out with 4008');
l = await (await get('/jgr/list?dev=' + owner)).json(); const r3 = l.rooms.find(x => x.id === id); ok(r3 && r3.ver === 2 && r3.joined === 0 && r3.cols === r.j.cols, 'list updated: ver 2');
const o2 = client(id, owner, 'Chủ', ''); await sleep(1000); const w2 = o2.last('welcome'); ok(w2 && w2.groups.length === r3.cols * r3.rows && w2.room.ver === 2, 'reopened on the new picture, all loose again');
{
  let nip = 0; const rep = async (dev, ip) => { const r = await fetch(BASE + '/jgr/report?r=' + id, { method: 'POST', headers: { 'content-type': 'application/json', ...O, 'x-test-ip': ip || '10.0.0.' + (++nip) }, body: JSON.stringify({ dev }) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
  const ra = client(id, guest, 'Khách', ''), rb = client(id, guest2, 'Khách 2', ''), rc = client(id, 'guestdev00000000004', 'Khách 3', ''); await sleep(1000);
  r = await rep('x'); ok(r.s === 400, 'a report without a valid device is refused');
  r = await rep(owner); ok(r.s === 400, 'the owner cannot report their own picture');
  r = await rep(guest); ok(r.j.ok && !r.j.hidden, 'first report counted');
  r = await rep(guest); ok(r.s === 409, 'the same device cannot report twice');
  r = await rep(guest2, '10.0.0.3'); ok(r.s === 409, 'a second report from the same network is refused');
  r = await rep(guest2); ok(r.j.ok && !r.j.hidden, 'second report counted ' + JSON.stringify(r));
  l = await (await get('/jgr/list?dev=' + guest)).json(); ok(l.rooms.some(x => x.id === id), 'still listed after two reports');
  r = await rep('guestdev00000000004'); ok(r.j.ok && r.j.hidden, 'third network hides the picture');
  await sleep(500); ok(ra.closed === 4012 && rb.closed === 4012 && rc.closed === 4012, 'everybody but the owner is sent out with 4012');
  l = await (await get('/jgr/list?dev=' + guest)).json(); ok(!l.rooms.some(x => x.id === id), 'hidden from the list for others');
  l = await (await get('/jgr/list?dev=' + owner)).json(); ok(l.rooms.find(x => x.id === id)?.hidden === 1, 'the owner still sees it, marked hidden');
  ok((await get('/jgr/thumb?r=' + id)).status === 404, 'thumb stops');
  im = await get('/jgr/img?r=' + id, { 'x-dev': guest }); ok(im.status === 403, 'picture refused to others');
  im = await get('/jgr/img?r=' + id, { 'x-dev': owner }); ok(im.status === 200, 'picture still served to the owner');
  const A = { Authorization: 'Bearer testadmin' };
  ok((await fetch(BASE + '/jgr-admin/hidden')).status === 403, 'admin list needs the secret');
  const hl = await (await fetch(BASE + '/jgr-admin/hidden', { headers: A })).json(); ok(hl.rooms.length === 1 && hl.rooms[0].id === id && hl.rooms[0].reports.length === 3, 'admin sees the hidden room with 3 reports');
  r = await (await fetch(BASE + '/jgr-admin/restore?r=' + id, { headers: A })).json(); ok(r.ok === 'restored', 'admin restores it');
  l = await (await get('/jgr/list?dev=' + guest)).json(); ok(l.rooms.some(x => x.id === id && !x.hidden), 'listed again');
  im = await get('/jgr/img?r=' + id, { 'x-dev': guest }); ok(im.status === 200, 'picture served again');
}
// a report from the list outside, by somebody who never entered (a locked room can not be entered)
{
  const od = 'reptestowner0000001', mk = await post('/jgr/create', { dev: od, ownerName: 'Chủ 2', name: 'Phòng khóa', pw: 'khoa123', pieces: 100, img, thumb });
  const rr = await fetch(BASE + '/jgr/report?r=' + mk.j.id, { method: 'POST', headers: { 'content-type': 'application/json', ...O, 'x-test-ip': '10.9.9.1' }, body: JSON.stringify({ dev: 'outsider000000000001' }) });
  ok(rr.status === 200 && (await rr.json()).ok, 'somebody outside a locked room can report its picture');
  const r2 = await fetch(BASE + '/jgr/report?r=' + mk.j.id, { method: 'POST', headers: { 'content-type': 'application/json', ...O, 'x-test-ip': '10.9.9.2' }, body: JSON.stringify({ dev: 'outsider000000000001' }) }); ok(r2.status === 409, 'the same device reports once');
  await post('/jgr/admin?r=' + mk.j.id, { dev: od, act: 'delete' });
}
r = await post('/jgr/admin?r=' + id, { dev: guest, act: 'delete' }); ok(r.s === 403, 'a guest cannot delete');
r = await post('/jgr/admin?r=' + id, { dev: owner, act: 'delete' }); await sleep(600); ok(r.j.ok && o2.closed === 4009, 'owner deletes the room, everybody out with 4009 (' + o2.closed + ')');
l = await (await get('/jgr/list?dev=' + owner)).json(); ok(!l.rooms.some(x => x.id === id) && l.canCreate === true, 'gone from the list and the owner may make a new room');
ok((await get('/jgr/thumb?r=' + id)).status === 404 && (await get('/jgr/img?r=' + id, { 'x-dev': owner })).status === 404, 'thumb and picture gone');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
