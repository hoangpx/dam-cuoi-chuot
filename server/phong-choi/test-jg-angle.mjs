// node test-jg-angle.mjs ws://localhost:8787/jg — the join is measured at the contact: a single piece dropped next to a big group with the
// angle a few degrees off (but its contact piece in place) joins, one 40 degrees off does not. Works on whatever state the local server holds:
// it takes the biggest group, picks a loose single piece next to it and drops that piece with a chosen angle error about the contact.
// LOCAL SERVERS ONLY (a join stays in the puzzle). Use device ids with a TESTDEV prefix (jgtest…): never paid, never stored.
const URL_ = process.argv[2] || 'ws://localhost:8787/jg';
const COLS = 40, ROWS = 25, CW = 44, ASP = 3200 / 2204, CH = CW / (ASP * ROWS / COLS);
const rot = (a, x, y) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ws = new WebSocket(URL_, { headers: { Origin: 'https://damcuoichuot.com' } }), log = [];
const w = await new Promise(res => { ws.onmessage = e => { const m = JSON.parse(e.data); log.push(m); if (m.t === 'welcome') res(m); }; ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', dev: 'jgtestangleaaaa1', name: 'Gx' })); ws.onerror = e => { console.log('ws error', e.message); process.exit(1); }; });
const send = o => ws.send(JSON.stringify(o));
const groups = w.groups.map(r => ({ id: r[0], x: r[1], y: r[2], a: r[3], ids: String(r[4]).split(',').map(Number) }));
// setup: if no group is big yet, join a row of 8 pieces by dropping each exactly on the first one's pose (a start whose pose is well inside the table)
let byPiece = new Map(); groups.forEach(g => g.ids.forEach(i => byPiece.set(i, g)));
const centre = (g, id) => { const o = rot(g.a, (id % COLS + .5) * CW, (Math.floor(id / COLS) + .5) * CH); return [g.x + o[0], g.y + o[1]]; };
let big = groups.slice().sort((a, b) => b.ids.length - a.ids.length)[0];
if (big.ids.length < 8) {
  const start = [...Array(500).keys()].map(k => 400 + (k * 7) % 500).find(id => id % COLS < 25 && (g => g.ids.length === 1 && (c => c[0] > 500 && c[0] < 1900 && c[1] > 500 && c[1] < 1200)(centre(g, id)))(byPiece.get(id)));
  const row = byPiece.get(start); for (let k = 1; k < 8; k++) { const g = byPiece.get(start + k); send({ t: 'lift', g: g.id }); await sleep(120); send({ t: 'drop', g: g.id, x: row.x, y: row.y, a: row.a }); await sleep(150); }
  await sleep(300); big = row; big.ids = [...Array(8).keys()].map(k => start + k); groups.forEach(g => { if (big.ids.includes(g.ids[0]) && g !== big) g.ids = []; }); byPiece = new Map(); groups.forEach(g => g.ids.forEach(i => byPiece.set(i, g))); big.ids.forEach(i => byPiece.set(i, big));
}
console.log('groups', groups.length, 'biggest', big.ids.length);
const looseNext = skip => { for (const a of big.ids) for (const d of [1, -1]) { const j = a % COLS + d; if (j < 0 || j >= COLS) continue; const b = Math.floor(a / COLS) * COLS + j, g = byPiece.get(b); if (g && g !== big && g.ids.length === 1 && !skip.includes(g)) { const c = centre(big, a); if (c[0] > 350 && c[0] < 2300 && c[1] > 350 && c[1] < 1350) return { a, b, g }; } } return null; };
// (the drop is clamped into the table: a contact near its edge would be pushed and the test would measure the clamp, not the join)
const trial = async (deg, g, a) => {
  send({ t: 'lift', g: g.id }); await sleep(150);
  const da = deg * Math.PI / 180, pa = big.a + da, c = centre(big, a), o = rot(pa, (a % COLS + .5) * CW, (Math.floor(a / COLS) + .5) * CH);
  const before = log.filter(m => m.t === 'join').length;
  send({ t: 'drop', g: g.id, x: c[0] - o[0], y: c[1] - o[1], a: pa }); await sleep(250);
  return log.filter(m => m.t === 'join').length > before;
};
const p1 = looseNext([]); if (!p1) { console.log('no loose neighbour: use a fresh state'); process.exit(0); }
console.log('single piece dropped 40° off joins:', await trial(40, p1.g, p1.a), '(want false)');
const p2 = looseNext([]);   // the same piece again (it stayed loose)
console.log('same piece dropped 9° off, contact in place, joins:', await trial(9, p2.g, p2.a), '(want true)');
ws.close(); await sleep(200);
