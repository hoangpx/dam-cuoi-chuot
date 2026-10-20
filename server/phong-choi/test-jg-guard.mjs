// node test-jg-guard.mjs ws://localhost:8787/jg — the guards against programs (src/jigsaw.js, MIN_HOLD / JOIN_DEV / STRIKES_BAN):
//   A  lifts and drops at once (run last: it bans the local address for 20 min; free it with /jg-ban?ip=…&un=1) → no join, then closed
//   B  paced at 200 ms, exact poses        → the first JOIN_DEV joining drops join, then no more (the drops just do not join)
//   C  a person: 400 ms hold, 1.2 s apart  → every drop joins
// LOCAL SERVERS ONLY (every join stays in the puzzle). Device ids start with jgtest: never paid, never stored.
const URL_ = process.argv[2] || 'ws://localhost:8787/jg';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function conn(dev) {
  const ws = new WebSocket(URL_, { headers: { Origin: 'https://damcuoichuot.com' } }), log = []; let closed = false;
  ws.onclose = () => { closed = true; };
  const w = await new Promise((res, rej) => { ws.onmessage = e => { const m = JSON.parse(e.data); log.push(m); if (m.t === 'welcome') res(m); }; ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', dev, name: 'Gx' })); ws.onerror = e => rej(e); setTimeout(() => rej(new Error('no welcome')), 8000); });
  const groups = w.groups.map(r => ({ id: r[0], x: r[1], y: r[2], a: r[3], ids: String(r[4]).split(',').map(Number) })), by = new Map(); groups.forEach(g => g.ids.forEach(i => by.set(i, g)));
  return { ws, log, by, send: o => { try { ws.send(JSON.stringify(o)); } catch (e) {} }, isClosed: () => closed, joins: () => log.filter(m => m.t === 'join').length };
}
// pieces start+1 … start+k dropped on the pose of piece start's group: each joins the row
async function row(c, start, k, hold, gap) {
  const base = c.by.get(start);
  for (let j = 1; j <= k; j++) {
    const g = c.by.get(start + j); if (!g) continue;
    c.send({ t: 'lift', g: g.id }); if (hold) await sleep(hold);
    c.send({ t: 'drop', g: g.id, x: base.x, y: base.y, a: base.a }); if (gap) await sleep(gap);
    if (c.isClosed()) return j;
  }
  return k;
}
const B = await conn('jgtestguardb00001');
await row(B, 200, 23, 200, 0); await sleep(500);
console.log('B paced bot: joins', B.joins(), '(want about 16 of 23)', 'closed', B.isClosed());
const C = await conn('jgtestguardc00001');
await row(C, 280, 10, 400, 1200); await sleep(500);
console.log('C person: joins', C.joins(), '(want 10 of 10)', 'closed', C.isClosed());
const A = await conn('jgtestguarda00001');
const doneA = await row(A, 120, 23, 0, 30); await sleep(300);
console.log('A fast bot: joins', A.joins(), 'socket closed', A.isClosed(), 'after', doneA, 'pairs (want 0 joins, closed; local ip 127.0.0.1 is banned for 20 min afterwards)');
const sus = await fetch(URL_.replace('ws', 'http').replace('/jg', '/jg-sus'), { headers: { Authorization: 'Bearer ' + (process.env.ADMIN || 'test') } }).then(r => r.status);
console.log('/jg-sus status', sus, '(403 without the secret, 200 with it)');
for (const c of [A, B, C]) try { c.ws.close(); } catch (e) {}
await sleep(200); process.exit(0);
