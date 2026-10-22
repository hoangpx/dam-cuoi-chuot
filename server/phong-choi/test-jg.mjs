// node test-jg.mjs ws://localhost:8787/jg  — two fake players on the shared jigsaw: lift is seen, a join is seen, the state survives
const URL_ = process.argv[2] || 'ws://localhost:8787/jg';
const mk = (dev, name) => new Promise(res => {
  const ws = new WebSocket(URL_, { headers: { Origin: 'https://damcuoichuot.com' } }), c = { ws, log: [], dev };
  ws.onmessage = e => { const m = JSON.parse(e.data); c.log.push(m); if (m.t === 'welcome') { c.w = m; res(c); } };
  ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', dev, name }));
  ws.onerror = e => { console.log('ws error', e.message); process.exit(1); };
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (c, o) => c.ws.send(JSON.stringify(o));
const a = await mk('jgtestaaaaaaaaaa1', 'An'), b = await mk('jgtestbbbbbbbbbb2', 'Binh');
console.log('welcome groups', a.w.groups.length, 'seed', a.w.seed, 'n', a.w.n);
const g = new Map(a.w.groups.map(r => [r[0], r]));
// find two adjacent single pieces: ids 0 and 1
const g0 = g.get(0), g1 = g.get(1);
send(b, { t: 'lift', g: 1 }); await sleep(200);
console.log('A saw lift:', a.log.some(m => m.t === 'lift' && m.g === 1));
send(a, { t: 'lift', g: 1 }); await sleep(200);
console.log('A denied while B holds:', a.log.some(m => m.t === 'deny'));
send(b, { t: 'move', g: 1, x: g0[1] + 5, y: g0[2], a: g0[3] }); await sleep(300);
console.log('A saw poses:', a.log.some(m => m.t === 'poses'));
send(b, { t: 'drop', g: 1, x: g0[1], y: g0[2], a: g0[3] }); await sleep(300);
const j = a.log.find(m => m.t === 'join');
console.log('A saw join:', j, 'paid', j && j.paid);
send(b, { t: 'board' }); await sleep(400);
console.log('board:', JSON.stringify(b.log.filter(m => m.t === 'board').pop()));
send(b, { t: 'chat', s: 'xin chao' }); await sleep(200);
console.log('chat seen by A:', a.log.some(m => m.t === 'chat'));
a.ws.close(); b.ws.close();
await sleep(300);
const c = await mk('jgtestcccccccccc3', 'Cuc');
console.log('after reconnect groups', c.w.groups.length, '(expect 999)');
c.ws.close();
process.exit(0);
