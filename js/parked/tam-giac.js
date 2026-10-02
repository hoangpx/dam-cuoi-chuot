/* PARKED (owner, 2026-10-03): the board-game chapter Cờ Đất was replaced by Tìm Chuột; this file is kept but not loaded. */
/* Chương VI · Cờ Đất, ván 1: Kẻ Tam Giác (a pebble game scratched on the ground, after the owner's paper game).
   About a dozen pebbles lie at random (never three in a line; the owner is fine with fewer than 15). Players take turns: roll the die, draw that many straight lines
   between pebbles — a line may not cross another or repeat one. Closing an EMPTY triangle (no pebble inside) wins it;
   one line can close two. No bonus lines. A roll larger than the lines still left to draw loses the turn (so the very
   last line needs a 1). Whatever the order, the finished board always has 3n − 3 − h lines (h = pebbles on the hull)
   and 2n − 2 − h triangles, so "lines left" is exact. Most triangles wins.
   The bot plans its whole roll: a beam search over its own lines (taking triangles, setting up ones it can close later in
   the same roll) scored at the end by what the opponent can expect to take next turn over the six faces of the die
   (a greedy opponent, honouring the "roll larger than what is left" rule). */

// ---------- the board: pebbles, possible lines, crossings, empty triangles ----------
function triBoard(bw, bh, seed) {
  const rnd = mulberry(seed), n = 15 + ((rnd() * 6) | 0), P = [], md = Math.sqrt(bw * bh / n) * .62;   // spacing: room for n
  const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy); if (t <= 0 || t >= 1) return 1e9; return Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]); };
  for (let tries = 0; P.length < n && tries < 40000; tries++) {
    const q = [20 + rnd() * (bw - 40), 20 + rnd() * (bh - 40)];
    if (P.some(p => Math.hypot(p[0] - q[0], p[1] - q[1]) < md)) continue;
    let bad = false;                                                         // never (nearly) three in a line
    for (let i = 0; i < P.length && !bad; i++) for (let j = i + 1; j < P.length && !bad; j++)
      if (segDist(q, P[i], P[j]) < 9 || segDist(P[i], q, P[j]) < 9 || segDist(P[j], q, P[i]) < 9) bad = true;
    if (!bad) P.push(q);
  }
  const N = P.length, E = [], eid = {};
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { eid[i * 64 + j] = E.length; E.push([i, j]); }
  const id = (a, b) => a < b ? eid[a * 64 + b] : eid[b * 64 + a];
  const orient = (a, b, c) => (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0]);
  const cross = E.map(() => []);
  for (let x = 0; x < E.length; x++) for (let y = x + 1; y < E.length; y++) {
    const [a, b] = E[x], [c, d] = E[y]; if (a === c || a === d || b === c || b === d) continue;
    if (Math.sign(orient(a, b, c)) !== Math.sign(orient(a, b, d)) && Math.sign(orient(c, d, a)) !== Math.sign(orient(c, d, b))) { cross[x].push(y); cross[y].push(x); }
  }
  const inside = (p, a, b, c) => { const s1 = orient(a, b, p), s2 = orient(b, c, p), s3 = orient(c, a, p); return (s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0); };
  const tris = [], triOf = E.map(() => []);
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) for (let c = b + 1; c < N; c++) {
    let empty = true; for (let p = 0; p < N && empty; p++) if (p !== a && p !== b && p !== c && inside(p, a, b, c)) empty = false;
    if (!empty) continue;
    const t = { v: [a, b, c], e: [id(a, b), id(b, c), id(a, c)] }, k = tris.length; tris.push(t);
    for (const e of t.e) triOf[e].push(k);
  }
  // the convex hull, for the number of lines a finished board has
  const idx = [...P.keys()].sort((i, j) => P[i][0] - P[j][0] || P[i][1] - P[j][1]), lo = [], hi = [];
  for (const i of idx) { while (lo.length > 1 && orient(lo[lo.length - 2], lo[lo.length - 1], i) <= 0) lo.pop(); lo.push(i); }
  for (const i of [...idx].reverse()) { while (hi.length > 1 && orient(hi[hi.length - 2], hi[hi.length - 1], i) <= 0) hi.pop(); hi.push(i); }
  const h = lo.length + hi.length - 2;
  return { P, E, id, cross, tris, triOf, total: 3 * N - 3 - h, nTris: 2 * N - 2 - h };
}
// a game state: which lines are drawn, how many drawn lines cross each line, who owns each triangle
function triState(B) { return { drawn: new Uint8Array(B.E.length), blocked: new Uint16Array(B.E.length), owner: new Int8Array(B.tris.length).fill(-1), n: 0, score: [0, 0] }; }
const triCopy = s => ({ drawn: s.drawn.slice(), blocked: s.blocked.slice(), owner: s.owner.slice(), n: s.n, score: s.score.slice() });
const triValid = (s, e) => !s.drawn[e] && !s.blocked[e];
function triGain(B, s, e) { let g = 0; for (const k of B.triOf[e]) { const t = B.tris[k]; if (t.e.every(f => f === e || s.drawn[f])) g++; } return g; }
// draw line e for player who: returns the triangles it closed
function triPlay(B, s, e, who) {
  s.drawn[e] = 1; s.n++; for (const f of B.cross[e]) s.blocked[f]++;
  const won = [];
  for (const k of B.triOf[e]) if (s.owner[k] < 0 && B.tris[k].e.every(f => s.drawn[f])) { s.owner[k] = who; s.score[who]++; won.push(k); }
  return won;
}
const triLeft = (B, s) => B.total - s.n;
function triMoves(B, s) { const m = []; for (let e = 0; e < B.E.length; e++) if (triValid(s, e)) m.push(e); return m; }
// triangles one line short (their third side still drawable): what the next player can grab
function triOpen(B, s) { let o = 0; for (const t of B.tris) { let d = 0, miss = -1; for (const f of t.e) if (s.drawn[f]) d++; else miss = f; if (d === 2 && triValid(s, miss)) o++; } return o; }
// how many new "one line short" triangles drawing e would leave
function triSetups(B, s, e) { let o = 0; for (const k of B.triOf[e]) { const t = B.tris[k], others = t.e.filter(f => f !== e); const d = others.filter(f => s.drawn[f]).length; if (d === 1) { const miss = others.find(f => !s.drawn[f]); if (triValid(s, miss) && !B.cross[e].includes(miss)) o++; } } return o; }
// a decent greedy player for `moves` lines: take a triangle if it can, set one up if it still has a line to close it, else play safe
function triGreedy(B, s, moves, who) {
  let got = 0;
  for (let m = 0; m < moves; m++) {
    const all = triMoves(B, s); if (!all.length) break;
    let best = -1, bv = -1e9;
    for (const e of all) {
      const g = triGain(B, s, e), su = triSetups(B, s, e), last = m === moves - 1;
      const v = g * 100 + (last ? -su * 10 : su * 3) + Math.random() * .5;
      if (v > bv) { bv = v; best = e; }
    }
    got += triPlay(B, s, best, who).length;
  }
  return got;
}
// what the opponent may expect next turn, over the six faces
function triExpectOpp(B, s, opp) {
  const left = triLeft(B, s); if (left <= 0) return 0;
  let sum = 0;
  for (let d = 1; d <= 6; d++) if (d <= left) sum += triGreedy(B, triCopy(s), d, opp);
  return sum / 6;
}
// the bot's plan for a roll of d: a beam search over sequences of its own lines
function triPlan(B, s, d, me) {
  const opp = 1 - me, W = 9, PER = 7;
  let beam = [{ s: triCopy(s), seq: [], got: 0 }];
  for (let step = 0; step < d; step++) {
    const left = d - step - 1, next = [];
    for (const b of beam) {
      const all = triMoves(B, b.s); if (!all.length) { next.push(b); continue; }
      const scored = all.map(e => { const g = triGain(B, b.s, e), su = triSetups(B, b.s, e); return { e, h: g * 100 + (left > 0 ? su * 6 : -su * 12) + Math.random() }; }).sort((x, y) => y.h - x.h).slice(0, PER);
      for (const { e } of scored) { const ns = triCopy(b.s), g = triPlay(B, ns, e, me).length; next.push({ s: ns, seq: [...b.seq, e], got: b.got + g, part: b.got + g + (left > 0 ? Math.min(triOpen(B, ns), left) * .45 : -triOpen(B, ns) * .8) }); }
    }
    next.sort((x, y) => y.part - x.part); beam = next.slice(0, W);
  }
  let best = beam[0], bv = -1e9;
  for (const b of beam) { const v = b.got - triExpectOpp(B, b.s, opp); if (v > bv) { bv = v; best = b; } }
  return best.seq;
}

const T4_PEB = ['#d9cdb2', '#a3332a', '#2f5f8f', '#2f6a4c', '#c98a1c', '#7a4aa0', '#5a5a5a'];
function triNewGame(seed, first, vw, vh) {
  const tall = vh > vw * 1.1, bw = tall ? 300 : 420, bh = tall ? 420 : 300;
  const B = triBoard(bw, bh, seed * 7919 + 13);
  return { B, s: triState(B), bw, bh, turn: first, phase: 'roll', die: 0, rollT: 0, movesLeft: 0, wait: .6, plan: null, sel: -1, flash: [], anim: [], over: false, passT: 0, shake: 0 };
}
// layout of the game view (in view units, vw × vh)
function triGeo(G, vw, vh) {
  const top = 120, bottom = 150, m = 44, rw = vw - m * 2, rh = vh - top - bottom - m;
  const k = Math.min(rw / G.bw, rh / G.bh), w = G.bw * k, h = G.bh * k;
  const ox = (vw - w) / 2, oy = top + (rh - h) / 2;
  return { k, ox, oy, w, h, die: [vw - 82, vh - 80], close: [vw - 46, 46] };
}
const triPt = (G, Gm, i) => [Gm.ox + G.B.P[i][0] * Gm.k, Gm.oy + G.B.P[i][1] * Gm.k];
function triNearest(en, vx, vy) {
  const G = en.G, Gm = en.geo; if (!Gm) return -1;
  let best = -1, bd = 40; G.B.P.forEach((_, i) => { const [x, y] = triPt(G, Gm, i), d = Math.hypot(vx - x, vy - y); if (d < bd) { bd = d; best = i; } });
  return best;
}
function triTap(en, vx, vy) {
  const G = en.G, Gm = en.geo; if (!Gm) return;
  if (Math.hypot(vx - Gm.close[0], vy - Gm.close[1]) < 30) { en.close(); return; }
  if (G.over) { en.after(G.result); return; }
  if (G.turn !== 0) return;
  if (G.phase === 'roll' && Math.hypot(vx - Gm.die[0], vy - Gm.die[1]) < 60) { triRoll(G); return; }
  if (G.phase === 'draw') { const p = triNearest(en, vx, vy); G.sel = p; G.drag = p >= 0 ? [vx, vy] : null; }
}
function triRelease(en, vx, vy) {
  const G = en.G; if (!G || G.phase !== 'draw' || G.turn !== 0 || G.sel < 0) return;
  const q = triNearest(en, vx, vy);
  if (q >= 0 && q !== G.sel) {
    const e = G.B.id(G.sel, q);
    if (triValid(G.s, e)) { triDo(G, e, 0); G.sel = -1; }
    else { G.shake = .35; AU.pluck(56); G.sel = q; }                       // crossing or already drawn
  } else if (q === G.sel) {}                                               // a tap on a pebble: keep it selected, tap another
  G.drag = null;
}
function triRoll(G) {
  G.phase = 'rolling'; G.rollT = .8; AU.click();
}
function triDo(G, e, who) {
  const won = triPlay(G.B, G.s, e, who);
  G.anim.push({ e, t: 0 }); AU.pluck(won.length ? 86 : 64 + (who ? 0 : 4));
  for (const k of won) G.flash.push({ k, t: 0 });
  if (won.length) setTimeout(() => AU.pluck(92), 120);
  G.movesLeft--;
  if (triLeft(G.B, G.s) <= 0) triEnd(G);
  else if (G.movesLeft <= 0) { G.turn = 1 - G.turn; G.phase = 'roll'; G.wait = .7; }
}
function triEnd(G) { G.over = true; G.phase = 'over'; const [a, b] = G.s.score; G.result = a > b ? 'win' : a < b ? 'lose' : 'draw'; if (G.result === 'win') { AU.kenCall(); setTimeout(() => AU.drumHit(), 300); } else AU.snort(); }
function triTick(en, dt) {
  const G = en.G; if (!G) return;
  for (const a of G.anim) a.t += dt; G.anim = G.anim.filter(a => a.t < .5);
  for (const f of G.flash) f.t += dt; G.flash = G.flash.filter(f => f.t < 1);
  G.shake = Math.max(0, G.shake - dt);
  if (G.over) { if (!G.told) { G.told = true; en.result && en.result(G.result); } return; }
  if (G.phase === 'rolling') {
    G.rollT -= dt; G.face = 1 + ((Math.random() * 6) | 0);
    if (G.rollT <= 0) {
      G.die = 1 + ((Math.random() * 6) | 0); G.face = G.die; AU.thump();
      if (G.die > triLeft(G.B, G.s)) { G.phase = 'pass'; G.passT = 1.3; AU.pluck(58); }          // more than the lines left: the turn is lost
      else { G.phase = 'draw'; G.movesLeft = G.die; if (G.turn === 1) { G.plan = triPlan(G.B, G.s, G.die, 1); G.wait = .6; } }
    }
    return;
  }
  if (G.phase === 'pass') { G.passT -= dt; if (G.passT <= 0) { G.turn = 1 - G.turn; G.phase = 'roll'; G.wait = .7; } return; }
  if (G.turn === 1) {                                                       // the bot rolls and draws by itself, with pauses
    G.wait -= dt; if (G.wait > 0) return;
    if (G.phase === 'roll') { triRoll(G); return; }
    if (G.phase === 'draw') {
      let e = G.plan && G.plan.shift();
      if (e === undefined || !triValid(G.s, e)) { const m = triMoves(G.B, G.s); e = m.length ? m[0] : undefined; }
      if (e === undefined) { triEnd(G); return; }
      triDo(G, e, 1); G.wait = .55;
    }
  }
}
// ---------- drawing the game on the ground ----------
function triDie(g, x, y, s, face, rot, glow) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = glow ? '#f2c640' : '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.roundRect ? g.roundRect(-s, -s, s * 2, s * 2, s * .3) : g.rect(-s, -s, s * 2, s * 2); g.fill(); g.stroke();
  const pip = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[face] || [];
  g.fillStyle = face === 1 ? '#a3332a' : INK; for (const [a, b] of pip) { g.beginPath(); g.arc(a * s * .5, b * s * .5, s * .17, 0, 6.283); g.fill(); }
  g.restore();
}
function triTwig(g, x, y, len, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-len / 2, 0); g.lineTo(len / 2, 0); g.stroke(); g.strokeStyle = '#8a5a2a'; g.lineWidth = 3.4; g.stroke(); g.restore(); }
function triDraw(en, g, vw, vh) {
  const G = en.G; if (!G) return;
  const Gm = en.geo = triGeo(G, vw, vh), B = G.B, s = G.s;
  // the patch of earth
  g.fillStyle = '#9b7a52'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.roundRect ? g.roundRect(Gm.ox - 26, Gm.oy - 26, Gm.w + 52, Gm.h + 52, 30) : g.rect(Gm.ox - 26, Gm.oy - 26, Gm.w + 52, Gm.h + 52); g.fill(); g.stroke();
  const rr = mulberry(5); g.fillStyle = 'rgba(60,40,24,.25)'; for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(Gm.ox - 20 + rr() * (Gm.w + 40), Gm.oy - 20 + rr() * (Gm.h + 40), 1 + rr() * 2.2, 0, 6.283); g.fill(); }
  // claimed triangles
  B.tris.forEach((t, k) => {
    const o = s.owner[k]; if (o < 0) return;
    const pts = t.v.map(i => triPt(G, Gm, i)), f = G.flash.find(q => q.k === k), a = f ? .55 + .35 * Math.sin(f.t * 20) : .42;
    g.fillStyle = o === 0 ? `rgba(163,51,42,${a})` : `rgba(47,106,76,${a})`;
    g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.closePath(); g.fill();
    const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    if (o === 0) { g.fillStyle = '#f2c640'; for (let p = 0; p < 5; p++) { const an = p * 1.2566; g.beginPath(); g.arc(cx + Math.cos(an) * 5, cy + Math.sin(an) * 5, 3.6, 0, 6.283); g.fill(); } g.fillStyle = '#a3332a'; g.beginPath(); g.arc(cx, cy, 2.6, 0, 6.283); g.fill(); }
    else { g.fillStyle = '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, cy, 8, 4, -.6, 0, 6.283); g.fill(); g.stroke(); }
  });
  // lines scratched with a twig
  for (let e2 = 0; e2 < B.E.length; e2++) if (s.drawn[e2]) {
    const [a, b] = B.E[e2], A = triPt(G, Gm, a), Bp = triPt(G, Gm, b), an = G.anim.find(q => q.e === e2), k = an ? Math.min(1, an.t / .3) : 1;
    const ex = A[0] + (Bp[0] - A[0]) * k, ey = A[1] + (Bp[1] - A[1]) * k;
    g.strokeStyle = '#3a2618'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(...A); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(A[0] + 1.5, A[1] + 1.5); g.lineTo(ex + 1.5, ey + 1.5); g.stroke();
  }
  // the line being drawn
  if (G.sel >= 0) {
    const A = triPt(G, Gm, G.sel); g.strokeStyle = G.shake > 0 ? '#a3332a' : 'rgba(58,38,24,.6)'; g.lineWidth = 3; g.setLineDash([6, 6]);
    if (G.drag) { g.beginPath(); g.moveTo(...A); g.lineTo(...G.drag); g.stroke(); }
    g.setLineDash([]); g.strokeStyle = '#f2c640'; g.lineWidth = 3; g.beginPath(); g.arc(A[0], A[1], 15, 0, 6.283); g.stroke();
  }
  // pebbles
  B.P.forEach((p, i) => { const [x, y] = triPt(G, Gm, i); g.fillStyle = T4_PEB[i % T4_PEB.length]; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, y, 11, 9, i, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(x - 3, y - 3, 2.2, 0, 6.283); g.fill(); });
  // the opponent (top) and the groom (bottom), their triangles counted
  const myTurn = G.turn === 0 && !G.over;
  c4Mouse(g, c4MouseRig(en.oppSort ?? 8), 70, 1, S.pose * 2, false, G.turn === 1 && G.phase === 'draw' ? -.6 - Math.abs(Math.sin(S.t * 6)) * .3 : null, null, .55, 104, 2);
  c4Mouse(g, MICE.groom, 70, 1, S.pose * 2, false, myTurn && G.phase === 'draw' ? -.6 : null, null, .55, vh - 20, 1);
  g.font = '900 34px "Playfair Display", serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillStyle = '#2f6a4c'; g.fillText(String(s.score[1]), 118, 70);
  g.fillStyle = '#a3332a'; g.fillText(String(s.score[0]), 118, vh - 60);
  // whose turn: a ring round that player
  g.strokeStyle = '#f2c640'; g.lineWidth = 4; g.beginPath(); g.arc(70, G.turn === 0 ? vh - 66 : 58, 46, 0, 6.283); g.stroke();
  // lines left on the board: a bundle of twigs and its number
  const left = triLeft(B, s);
  triTwig(g, vw / 2 - 18, 62, 34, -.3); triTwig(g, vw / 2 - 14, 66, 34, .25);
  g.fillStyle = INK; g.textAlign = 'left'; g.fillText(String(left), vw / 2 + 10, 64);
  // the die, and the lines still to draw this roll
  const glow = myTurn && G.phase === 'roll' && Math.sin(S.t * 6) > 0;
  const rot = G.phase === 'rolling' ? Math.sin(G.rollT * 30) * .6 : G.phase === 'pass' ? Math.sin(G.passT * 40) * .15 : 0;
  triDie(g, Gm.die[0], Gm.die[1] - (G.phase === 'rolling' ? Math.abs(Math.sin(G.rollT * 18)) * 20 : 0), 30, G.phase === 'rolling' ? G.face : (G.die || 6), rot, glow);
  if (G.phase === 'pass') { g.strokeStyle = '#a3332a'; g.lineWidth = 6; g.beginPath(); g.moveTo(Gm.die[0] - 36, Gm.die[1] - 36); g.lineTo(Gm.die[0] + 36, Gm.die[1] + 36); g.stroke(); }
  if (G.phase === 'draw') for (let i = 0; i < G.movesLeft; i++) triTwig(g, Gm.die[0] - 70 - i * 22, Gm.die[1], 30, 1.35);
  // close
  const [cx, cy] = Gm.close; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.arc(cx, cy, 18, 0, 6.283); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(cx - 7, cy - 7); g.lineTo(cx + 7, cy + 7); g.moveTo(cx + 7, cy - 7); g.lineTo(cx - 7, cy + 7); g.stroke();
  // the end: a seal for a win; for a loss or a draw the die invites another game
  if (G.over) {
    g.textAlign = 'center'; g.font = '900 60px "Playfair Display", serif';
    const txt = G.result === 'win' ? 'THẮNG' : G.result === 'lose' ? 'THUA' : 'HOÀ';
    g.save(); g.translate(vw / 2, vh / 2); g.rotate(-.12); g.lineWidth = 6; g.strokeStyle = '#f2ecde'; g.strokeText(txt, 0, 0); g.fillStyle = G.result === 'win' ? '#a3332a' : INK; g.fillText(txt, 0, 0); g.restore();
  }
  g.textBaseline = 'alphabetic';
}
