// Thử máy chủ phòng chơi: node test.mjs [số người] [số ván] [wss://…/ws]
// Mỗi người chơi giả làm đúng việc của từng trò (bấm, giữ, chọn…), in tóm tắt từng ván. Không dùng trong game.
const N = +process.argv[2] || 8, ROUNDS = +process.argv[3] || 12, URL = process.argv[4] || 'wss://dcc-phong-choi.dcc-phong-choi.workers.dev/ws';
const rnd = (a, b) => a + Math.random() * (b - a);
const seen = new Set(), errs = [], summary = [];
function mk(i) {
  const c = { i, name: 'T' + i, ws: new WebSocket(URL), id: null, off: 0, rtt: 1e9, round: null, hold: false };
  const send = o => { try { c.ws.send(JSON.stringify(o)); } catch (e) {} };
  const srv = () => Date.now() + c.off;
  const at = (ms, f) => setTimeout(f, Math.max(0, ms));
  const act = (r, o) => send({ t: 'act', n: r.n, at: srv(), ...o });
  c.ws.onopen = () => {
    send({ t: 'hello', dev: (process.env.DEVPFX || 'testdev') + String(i).padStart(3, '0') + 'abcdefgh', cap: +(process.env.CAP || 2), name: c.name, look: { role: i % 2 ? 'vo' : 'chong', fur: 'brown', robe: 'red' }, ok: true });
    send({ t: 'join' }); for (let k = 0; k < 5; k++) setTimeout(() => send({ t: 'sync', c: performance.now() }), k * 200);
  };
  c.ws.onerror = e => errs.push('ws error ' + i);
  c.ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.t === 'welcome') { c.id = m.id; send({ t: 'join' }); }
    else if (m.t === 'ping') send({ t: 'pong', s: m.s });
    else if (m.t === 'sync') { const t = performance.now(), rtt = t - m.c, off = m.s + rtt / 2 - Date.now(); if (rtt < c.rtt) { c.rtt = rtt; c.off = off; } }
    else if (m.t === 'idle') send({ t: 'join' });
    else if (m.t === 'round' && !m.wait) { c.round = m; if (m.seated.includes(c.id)) c.play(m); }
    else if (m.t === 'result') { if (i === 0) { const w = m.rows.find(x => x.id === m.winner); summary.push(`ván ${m.n} ${m.game}: người=${m.rows.length} thắng=${m.winner} hũ=${m.pot} net_tôi=${m.net[c.id] ?? '-'} hàng1=${JSON.stringify(m.rows[0])}`); console.log(summary[summary.length - 1]); seen.add(m.game); } }
    else if (m.t === 'hole' && i === 0) console.log('   hang vòng', m.i, 'mèo=', m.cat, 'loại=', m.out.length);
  };
  c.play = r => {
    const t0 = r.t0, rel = ms => t0 + ms - srv(), cfg = r.cfg, g = r.game;
    if (g === 'ten') at(rel(cfg.target + rnd(-250, 250)), () => act(r, { k: 'p' }));
    else if (g === 'trong') at(rel(cfg.target + rnd(-150, 150)), () => act(r, { k: 'p' }));
    else if (g === 'pomelo') at(rel(cfg.tf[c.id] * rnd(.7, 1.02)), () => act(r, { k: 'p' }));
    else if (g === 'giua') at(rel(rnd(1500, 6000)), () => act(r, { k: 'p' }));
    else if (g === 'tuong') { for (let k = 0; k < cfg.ph.length; k += 2) { const s = cfg.ph[k][0], f = cfg.ph[k + 1] ? cfg.ph[k + 1][0] : cfg.len; at(rel(s + rnd(250, 600)), () => act(r, { k: 'd' })); at(rel(f - rnd(60, 300)), () => act(r, { k: 'u' })); } }
    else if (g === 'balloon') { at(rel(rnd(300, 900)), () => act(r, { k: 'd' })); at(rel(rnd(1500, 4500)), () => act(r, { k: 'u' })); }
    else if (g === 'minnum') at(rel(rnd(1500, 8000)), () => act(r, { k: 'v', v: 1 + ((Math.random() * cfg.max) | 0) }));
    else if (g === 'lantern') c.waitGo = r;
    else if (g === 'boat') { for (let k = 1; k <= 19; k++) at(rel(k * 500), () => act(r, { k: 't', c: 3 + ((Math.random() * 3) | 0) })); }
    else if (g === 'keoco') { at(rel(rnd(500, cfg.pick - 500)), () => act(r, { k: 'side', v: Math.random() < .5 ? 0 : 1 })); for (let k = 1; k <= 23; k++) at(rel(cfg.pick + k * 500), () => act(r, { k: 't', c: 3 + ((Math.random() * 3) | 0) })); }
    else if (g === 'hang') { for (let k = 0; k < cfg.rounds; k++) at(rel(k * cfg.slot + rnd(900, 3300)), () => act(r, { k: 'h', v: (Math.random() * 3) | 0, i: k })); }
    else if (g === 'chuot') c.waitGo = r;
    else if (g === 'hpb') at(rel(rnd(1500, 6000)), () => act(r, { k: 'v', v: Math.round(rnd(10, 60)) }));
    else if (g === 'khac') { if (Math.random() < .3) at(rel(rnd(300, 900)), () => act(r, { k: 'p', v: 0 })); at(rel(rnd(1500, 5000)), () => act(r, { k: 'p', v: cfg.odd })); }
    else if (g === 'dem') at(rel(cfg.show + rnd(1500, 6000)), () => act(r, { k: 'v', v: Math.max(0, cfg.items.length + Math.round(rnd(-3, 3))) }));
    else if (g === 'xep') { let p = rnd(500, 1500); for (let v = 1; v <= 9; v++) { p += rnd(250, 700); at(rel(p), () => act(r, { k: 't', v })); } }
    else if (g === 'mau') { let p = rnd(500, 1200); cfg.rounds.forEach((q, i) => { p += rnd(600, 1500); at(rel(p), () => act(r, { k: 'a', i, v: Math.random() < .85 ? q.c : (q.c + 1) % 4 })); }); }
    else if (g === 'tinh') { const ans = eval(cfg.expr.replace(/×/g, '*').replace(/−/g, '-')); at(rel(rnd(900, 5000)), () => act(r, { k: 'p', v: cfg.opts.indexOf(ans) })); }
    else if (g === 'lat') { let p = rnd(500, 1200); const order = [...Array(12).keys()].sort(() => Math.random() - .5); for (const i of order) { p += rnd(500, 900); at(rel(p), () => act(r, { k: 'f', i })); } }
    else if (g === 'chen') at(rel(cfg.end + rnd(300, 3500)), () => act(r, { k: 'p', v: Math.floor(Math.random() * 3) }));
    else if (g === 'nho') { let p = cfg.showEnd + rnd(600, 1500); cfg.seq.forEach((v, k) => { p += rnd(450, 800); at(rel(p), () => act(r, { k: 'm', v: Math.random() < .93 ? v : (v + 1) % 4 })); }); }
  };
  const prev = c.ws.onmessage;
  c.ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.t === 'go' && c.waitGo && c.waitGo.n === m.n) { const r = c.waitGo; c.waitGo = null; at(rnd(220, 420), () => act(r, { k: 'p', v: r.cfg.hole })); } });
  return c;
}
const cs = Array.from({ length: N }, (_, i) => mk(i));
const t0 = Date.now();
await new Promise(res => { const iv = setInterval(() => { if (summary.length >= ROUNDS || Date.now() - t0 > 40000 * ROUNDS + 20000) { clearInterval(iv); res(); } }, 1000); });
console.log('--- trò đã thấy:', [...seen].join(','), '| lỗi:', errs.length);
// bảng xếp hạng
const b = new WebSocket(URL); b.onopen = () => { b.send(JSON.stringify({ t: 'hello', dev: 'boardreader0000000', name: 'Xem', ok: true })); setTimeout(() => b.send(JSON.stringify({ t: 'board', per: process.env.PER || 'a' })), 600); };
b.onmessage = e => { const m = JSON.parse(e.data); if (m.t === 'board') { console.log('bảng', m.per, ':', m.total, 'người; top3', JSON.stringify(m.top.slice(0, 3))); process.exit(0); } };
setTimeout(() => process.exit(0), 6000);
