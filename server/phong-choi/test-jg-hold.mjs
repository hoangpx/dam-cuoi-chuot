// node test-jg-hold.mjs ws://localhost:8788/jg?p=dg — the hold rule: a poke warns the carrier, 30 s later the group is put down, 90 s lock on that group
const URL_ = process.argv[2] || 'ws://localhost:8787/jg?p=dg';
const mk = (dev, name) => new Promise(res => {
  const ws = new WebSocket(URL_, { headers: { Origin: 'https://damcuoichuot.com' } }), c = { ws, log: [], dev };
  ws.onmessage = e => { const m = JSON.parse(e.data); c.log.push(m); if (m.t === 'welcome') { c.w = m; res(c); } };
  ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', dev, name }));
  ws.onerror = e => { console.log('ws error', e.message); process.exit(1); };
});
const sleep = ms => new Promise(r => setTimeout(r, ms)), send = (c, o) => c.ws.send(JSON.stringify(o)), has = (c, f) => c.log.some(f);
const a = await mk('jgtesthold0000001', 'An'), b = await mk('jgtesthold0000002', 'Binh');
send(a, { t: 'lift', g: 5 }); await sleep(300);
send(b, { t: 'poke', g: 5 }); await sleep(300);
console.log('A got nudge:', has(a, m => m.t === 'nudge' && m.g === 5 && m.sec === 30), '| B got poked:', has(b, m => m.t === 'poked'));
send(b, { t: 'lift', g: 5 }); await sleep(200);
console.log('B still denied (A holds):', has(b, m => m.t === 'deny' && !m.lock));
console.log('waiting 31 s…'); await sleep(31500);
console.log('A got timeup:', has(a, m => m.t === 'timeup'), '| everyone saw the drop:', has(b, m => m.t === 'drop' && m.g === 5));
send(a, { t: 'lift', g: 5 }); await sleep(300);
const d = a.log.filter(m => m.t === 'deny' && m.g === 5).pop();
console.log('A locked out of 5 for ~90 s:', d && d.lock >= 80 && d.lock <= 90, d && d.lock);
send(b, { t: 'lift', g: 5 }); await sleep(300);
console.log('B can pick 5 up now:', has(b, m => m.t === 'lift' && m.g === 5 && m.by === b.w.id));
send(a, { t: 'lift', g: 6 }); await sleep(300);
console.log('A can pick another piece:', has(a, m => m.t === 'lift' && m.g === 6));
// a voluntary drop after a nudge also locks
send(b, { t: 'drop', g: 5, x: 100, y: 100, a: 0 });
send(a, { t: 'poke', g: 6 }); await sleep(2000); send(b, { t: 'poke', g: 6 }); await sleep(300);
send(a, { t: 'drop', g: 6, x: 300, y: 300, a: 0 }); await sleep(300); send(a, { t: 'lift', g: 6 }); await sleep(300);
console.log('B poked A\'s 6 -> A dropped early -> still locked:', has(a, m => m.t === 'deny' && m.g === 6 && m.lock));
process.exit(0);
