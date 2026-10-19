// Chạy thử máy chủ phòng chơi: node test.mjs [wss://…/ws] — vài người chơi giả, in ra các tin chính (không dùng trong game)
const URL = process.argv[2] || 'wss://dcc-phong-choi.dcc-phong-choi.workers.dev/ws';
const mk = (name, press) => new Promise(res => {
  const ws = new WebSocket(URL), o = { name, ws, id: null, log: [], off: 0, round: null };
  ws.onopen = () => { ws.send(JSON.stringify({ t: 'hello', name, sort: 3 })); for (let i = 0; i < 5; i++) setTimeout(() => ws.send(JSON.stringify({ t: 'sync', c: performance.now() })), i * 200); res(o); };
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.t === 'welcome') o.id = m.id;
    if (m.t === 'ping') ws.send(JSON.stringify({ t: 'pong', s: m.s }));
    if (m.t === 'sync') { const rtt = performance.now() - m.c, off = m.s + rtt / 2 - Date.now(); o.off = o.rtt === undefined || rtt < o.rtt ? off : o.off; o.rtt = Math.min(o.rtt ?? 1e9, rtt); }
    if (m.t === 'round') {
      o.round = m; o.log.push(`round ${m.n} ${m.game} seated=${m.seated.length} bots=${(m.bots || []).length}`);
      const wait = m.t0 + (m.game === 'ten' ? press.ten : press.pom) - (Date.now() + o.off);
      setTimeout(() => ws.send(JSON.stringify({ t: 'press', n: m.n, at: Date.now() + o.off })), Math.max(0, wait));
    }
    if (m.t === 'result') o.log.push(`result ${m.n} ${m.game} winner=${m.winner} prize=${m.prize} top=${m.rows.slice(0, 3).map(r => r.id + ':' + (r.v === null ? 'x' : r.v.toFixed ? r.v.toFixed(3) : r.v)).join(',')}`);
  };
});
const a = await mk('An', { ten: 10020, pom: 2000 }), b = await mk('Bình', { ten: 9900, pom: 2500 });
await new Promise(r => setTimeout(r, 38000));
for (const o of [a, b]) { console.log('---', o.name, o.id, 'rtt', Math.round(o.rtt)); console.log(o.log.join('\n')); }
a.ws.close(); b.ws.close();
