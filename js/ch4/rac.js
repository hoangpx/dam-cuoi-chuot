/* Chương IV · nhặt rác (owner 2026-10-27: "rác cho chương 4 vợ chồng khởi nghiệp"; asked first for chương IX, then moved here: pick up
   rubbish, +1 đồng each, goodwill from some people that nothing mentions anywhere, now and then a job to pick up 10 in a day, 11–15
   bits of rubbish spawned a day). Loaded after the town's files; it hooks in by wrapping c4FxItems (drawing the village), c4NvTap
   (taps in the village) and p4TownBridgeItems / p4TownHouseTap (drawing and taps in the town), so no core file changes.
   SAVE4.rac = { day, v: [village bits], t: [town bits], n: picked today }; a bit = { x, z, k, i }: x along the lane, z its depth,
   k one of 5 kinds. A day's bits are made once the market (or the street) is open and are gone with the day. A tap on one picks it
   up. A few residents like a tidy village (c4RacFan: about one in five, by id); those walking by within 450 units gain a little
   liking (3 a bit, at most 12 a day each, never shown). The task "rac" (Việc hôm nay) asks for 10 in a day (C4.today.rac). */

const C4_RAC_KINDS = 5, C4_RAC_HIT = 46;
const c4RacFan = id => ((id * 2654435761) >>> 0) % 100 < 20;
function c4RacEnsure() {
  let R0 = SAVE4.rac;
  if (R0 && R0.day === SAVE4.day) return R0;
  const N = 11 + ((R() * 5) | 0), nv = Math.round(N * .6), mk = (n, x0, x1, z0, z1) => Array.from({ length: n }, (_, i) => ({ x: Math.round(x0 + R() * (x1 - x0)), z: z0 + R() * (z1 - z0), k: (R() * C4_RAC_KINDS) | 0, i }));
  R0 = SAVE4.rac = { day: SAVE4.day, v: mk(nv, 260, C4_W - 300, .42, .95), t: mk(N - nv, 220, P4_W - 220, .28, .86), n: 0 };
  persist4(); return R0;
}
// one picked up: +1 đồng, a floating "+1", the liking of those who saw, the task
function c4RacPick(list, i, town) {
  const R0 = SAVE4.rac, b = list.splice(i, 1)[0]; R0.n++;
  SAVE4.money += 1; if (C4.today) C4.today.got = (C4.today.got || 0) + 1; SAVE4.racAll = (SAVE4.racAll || 0) + 1;
  if (C4.today) C4.today.rac = (C4.today.rac || 0) + 1;
  AU.pluck(80);
  if (town) { P4.fx.push({ x: b.x, y: p4Y(b.z) - 60, s: '+1', t: 0 }); for (const w of P4.walkers) if (w.pid !== undefined && Math.abs(w.x - b.x) < 450 && c4RacFan(w.pid)) { const f = p4F(w.pid), d = (f.rd && f.rd.d === SAVE4.day) ? f.rd : (f.rd = { d: SAVE4.day, n: 0 }); if (d.n < 12) { d.n += 3; f.a = Math.min(100, f.a + 3); } } }
  else { C4.fx.push({ x: b.x, y: c4Y(b.z) - 70, t: 0, s: '+1' }); for (const w of C4.walkers) if (w.pid !== undefined && w.st !== 'leave' && Math.abs(w.x - b.x) < 450 && c4RacFan(w.pid)) { const f = c4F(w.pid), d = (f.rd && f.rd.d === SAVE4.day) ? f.rd : (f.rd = { d: SAVE4.day, n: 0 }); if (d.n < 12) { d.n += 3; c4Bump(w.pid, 3); } } }
  if (typeof c4Tasks === 'function' && C4.phase === 'open') c4Tasks();                    // a task may be done now
  persist4(); if (typeof c4Hud === 'function') c4Hud();
}
// a tap on a bit in the village (x, y in the lane's world coordinates)
const c4NvTap0 = c4NvTap;
c4NvTap = function (x, y) {
  if (C4.phase === 'open' && S.mode === 'c4play') {
    const R0 = c4RacEnsure();
    for (let i = R0.v.length - 1; i >= 0; i--) { const b = R0.v[i], s = c4S(b.z); if (Math.abs(x - b.x) < C4_RAC_HIT * s && Math.abs(y - (c4Y(b.z) - 8 * s)) < C4_RAC_HIT * s) { c4RacPick(R0.v, i, false); return true; } }
  }
  return c4NvTap0(x, y);
};
// the town: a tap on a bit in the street
const p4TownHouseTap0 = p4TownHouseTap;
p4TownHouseTap = function (x, y) {
  if (P4.phase === 'open') {
    const R0 = c4RacEnsure();
    for (let i = R0.t.length - 1; i >= 0; i--) { const b = R0.t[i], s = p4S(b.z); if (Math.abs(x - b.x) < C4_RAC_HIT * s && Math.abs(y - (p4Y(b.z) - 8 * s)) < C4_RAC_HIT * s) { c4RacPick(R0.t, i, true); return true; } }
  }
  return p4TownHouseTap0(x, y);
};
/* the sprites: a crumpled paper, a banana peel, a pottery sherd, a wad of dry straw, an old rag */
function c4RacDraw(g, k, X, Y, T) {
  const u = T * .01, ink = 'rgba(40,28,18,.85)', lg = (x0, y0, x1, y1, a, b) => { const q = g.createLinearGradient(x0 * u, y0 * u, x1 * u, y1 * u); q.addColorStop(0, a); q.addColorStop(1, b); return q; };
  g.save(); g.translate(X, Y); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = Math.max(1, u * 2.2); g.strokeStyle = ink;
  const poly = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * u, y * u) : g.moveTo(x * u, y * u)); g.closePath(); g.fillStyle = fill; g.fill(); g.stroke(); };
  if (k === 0) {
    poly([[-11, -2], [-8, -11], [0, -14], [9, -11], [13, -3], [9, 5], [-1, 7], [-9, 4]], '#ece3cf');
    poly([[-8, -11], [0, -14], [2, -6], [-6, -3]], '#fbf7ea'); poly([[2, -6], [9, -11], [13, -3], [6, -1]], '#e2d8bf'); poly([[-9, 4], [-1, 7], [3, -1], [-6, -3]], '#cfc3a6'); poly([[3, -1], [6, -1], [13, -3], [9, 5], [-1, 7]], '#d9cdb0');
    g.strokeStyle = 'rgba(90,70,50,.55)'; g.lineWidth = Math.max(.8, u * 1.1); g.beginPath(); g.moveTo(-6 * u, -8 * u); g.lineTo(-2 * u, -6 * u); g.moveTo(4 * u, -4 * u); g.lineTo(8 * u, -7 * u); g.stroke();
  } else if (k === 1) {
    g.fillStyle = lg(-14, -10, 14, 8, '#f5df6a', '#d8b73a'); g.beginPath(); g.moveTo(-14 * u, 4 * u); g.quadraticCurveTo(-10 * u, -12 * u, 2 * u, -9 * u); g.quadraticCurveTo(12 * u, -7 * u, 15 * u, -1 * u); g.quadraticCurveTo(5 * u, -2 * u, -1 * u, 1 * u); g.quadraticCurveTo(-7 * u, 5 * u, -14 * u, 4 * u); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#e7c93f'; g.beginPath(); g.moveTo(-2 * u, 1 * u); g.quadraticCurveTo(2 * u, 9 * u, 11 * u, 8 * u); g.quadraticCurveTo(8 * u, 2 * u, 3 * u, -1 * u); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#6f5226'; g.beginPath(); g.arc(15 * u, -1 * u, 2.4 * u, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(110,80,30,.55)'; for (const [x, y] of [[-7, -3], [-2, -6], [4, -5], [6, 4]]) { g.beginPath(); g.arc(x * u, y * u, 1.1 * u, 0, 6.283); g.fill(); }
  } else if (k === 2) {
    g.fillStyle = lg(-12, -10, 12, 8, '#fbfaf4', '#cfd6dc'); g.beginPath(); g.moveTo(-12 * u, 3 * u); g.quadraticCurveTo(-9 * u, -10 * u, 2 * u, -11 * u); g.lineTo(13 * u, -3 * u); g.quadraticCurveTo(8 * u, 6 * u, -3 * u, 7 * u); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#3f6aa4'; g.lineWidth = Math.max(1, u * 1.8); g.beginPath(); g.moveTo(-8 * u, 0); g.quadraticCurveTo(-3 * u, -6 * u, 3 * u, -6 * u); g.moveTo(-4 * u, 3 * u); g.quadraticCurveTo(2 * u, -1 * u, 9 * u, -2 * u); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = Math.max(.8, u); g.beginPath(); g.moveTo(-8 * u, -3 * u); g.lineTo(-3 * u, -8 * u); g.stroke();
  } else if (k === 3) {
    for (const [x0, y0, x1, y1, c] of [[-12, 4, 6, -9, '#c9a64e'], [-10, 6, 12, -3, '#b88e3a'], [-6, 7, 13, 3, '#d8b95e'], [-13, 0, 3, -6, '#a97f33'], [-4, 5, 9, -7, '#e0c36a']]) { g.strokeStyle = ink; g.lineWidth = Math.max(2.6, u * 4); g.beginPath(); g.moveTo(x0 * u, y0 * u); g.quadraticCurveTo((x0 + x1) / 2 * u, (y0 + y1) / 2 * u - 4 * u, x1 * u, y1 * u); g.stroke(); g.strokeStyle = c; g.lineWidth = Math.max(1.4, u * 2.4); g.stroke(); }
    g.fillStyle = '#8a5a2a'; g.strokeStyle = ink; g.lineWidth = Math.max(1, u * 1.6); g.beginPath(); g.ellipse(2 * u, 2 * u, 5 * u, 3 * u, -.5, 0, 6.283); g.fill(); g.stroke();
  } else {
    g.fillStyle = lg(-13, -9, 13, 8, '#a8b6bd', '#7f9099'); g.beginPath(); g.moveTo(-13 * u, 2 * u); g.quadraticCurveTo(-10 * u, -9 * u, 1 * u, -8 * u); g.quadraticCurveTo(12 * u, -10 * u, 14 * u, -1 * u); g.lineTo(11 * u, 3 * u); g.lineTo(8 * u, 1 * u); g.lineTo(5 * u, 6 * u); g.lineTo(1 * u, 3 * u); g.lineTo(-3 * u, 7 * u); g.lineTo(-7 * u, 3 * u); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(230,236,238,.85)'; g.lineWidth = Math.max(1, u * 1.8); g.beginPath(); g.moveTo(-9 * u, -2 * u); g.quadraticCurveTo(0, -6 * u, 10 * u, -3 * u); g.stroke(); g.strokeStyle = 'rgba(60,76,86,.6)'; g.lineWidth = Math.max(.8, u); g.beginPath(); g.moveTo(-6 * u, 1 * u); g.lineTo(0, -1 * u); g.lineTo(6 * u, 1 * u); g.stroke();
  }
  g.restore();
}
const c4RacItems = (items, g, vis, list, YF, SF) => { for (const b of list) { if (!vis(b.x, 60)) continue; const s = SF(b.z), y = YF(b.z);
  items.push({ z: b.z - .01, f: () => { g.fillStyle = 'rgba(29,25,21,.22)'; g.beginPath(); g.ellipse(b.x, y + 2 * s, 17 * s, 5 * s, 0, 0, 6.283); g.fill(); c4RacDraw(g, b.k, b.x, y - 4 * s, 170 * s); } }); } };
const c4FxItems0 = c4FxItems;
c4FxItems = function (items, g, vis) { c4FxItems0(items, g, vis); if (C4.phase === 'open') c4RacItems(items, g, vis, c4RacEnsure().v, c4Y, c4S); };
const p4TownBridgeItems0 = p4TownBridgeItems;
p4TownBridgeItems = function (items, g, vis) { p4TownBridgeItems0(items, g, vis); if (P4.phase === 'open') c4RacItems(items, g, vis, c4RacEnsure().t, p4Y, p4S); };
// the job: 10 in a day (Việc hôm nay)
C4_TASKS.push({ k: 'rac', from: () => SAVE4.day >= 2, make: () => ({ n: 10, text: 'Nhặt 10 món rác trong chợ làng và phố huyện (chạm vào rác nằm dưới đường)', prize: 30 }), done: (t, d) => (d.rac || 0) >= t.n });
