/* Chương VII · Ai Ăn Vụng?, the "kẻ nói dối" cases (owner 2026-11-04: "siêu siêu khó, có thể sáng tạo thêm luật"): the
   new rule is that THE ONE WHO ATE THE DISH LIES: every statement of the culprit is false, every other villager's statements
   and the dish's own are true. Nobody is told who lies; finding the liar is finding the culprit.
   A culprit's false statements are taken from what is true of some other free cell (so none is false at a glance), and
   every statement is said on its own (never "ở trong X, nhưng không đứng ở góc nào": a lie about two things at once would
   be unclear). The solver tries each villager as the liar and keeps placements where that villager is the one by the dish.
   node tools/gen-anvung-noidoi.js N first count [secs] → tools/anvung-cache/nd-N-first.json
   node tools/gen-anvung-noidoi.js --write [quota] → js/ch7/cases.js keeps lv 0–4 and gets the hardest as lv 5 (liar: 1); quota
   defaults to {"6":50} (7×7 liar cases come too seldom: 4 in 20 minutes on 8 cores). The cache nd-all.json keeps the
   300 hardest 6×6 of the 2026-11-04 runs. */
const fs = require('fs');
const A = require('./gen-anvung.js');
const { mulberry, layout, facts, unaryOk, besideCells, corner, STRENGTH, BLOCK, SEAT, FOLK, BEASTS, DISHES, ROOMS_IN, ROOMS_OUT, say, TITLES } = A;
const UN = ['in', 'notin', 'on', 'beside', 'corner', 'notcorner'];
const ok1 = (C, e, f, i) => !UN.includes(f.t) ? true : f.neg ? !unaryOk(C, e, f, i) : unaryOk(C, e, f, i);
// a whole placement: exactly one villager by the dish, it is the liar L, and the room statements hold (or fail, for L)
function globalOkL(C, pos, clues, L) {
  const { room, ents } = C, M = ents.length - 1, dr = room[pos[M]];
  const by = []; for (let e = 0; e < M; e++) if (room[pos[e]] === dr) by.push(e);
  if (by.length !== 1 || by[0] !== L) return false;
  for (let e = 0; e < M; e++) for (const f of clues[e]) {
    if (f.t !== 'alone' && f.t !== 'with') continue;
    const mates = []; for (let k = 0; k < M; k++) if (k !== e && room[pos[k]] === room[pos[e]]) mates.push(k);
    const v = f.t === 'alone' ? !mates.length : mates.some(k => ents[k].g === f.a);
    if (v === !!f.neg) return false;
  }
  return true;
}
function partialOkL(C, pos, done, L) {
  const { room, ents } = C, M = ents.length - 1;
  if (done[M]) { for (let e = 0; e < M; e++) if (done[e] && room[pos[e]] === room[pos[M]] && e !== L) return false; if (done[L] && room[pos[L]] !== room[pos[M]]) return false; }
  return true;
}
// how many placements fit, trying every villager as the liar (the liar's statements turned false)
function solveL(C, clues, cap = 2) {
  const { N, ents } = C, E = ents.length, M = E - 1;
  let n = 0, nodes = 0, first = null, firstL = -1;
  for (let L = 0; L < M && n < cap; L++) {
    const cl = clues.map((l, e) => e === L ? l.map(f => ({ ...f, neg: !f.neg })) : l);
    const cand = ents.map((_, e) => { const out = []; for (let i = 0; i < N * N; i++) if (!C.block[i] && cl[e].every(f => ok1(C, e, f, i))) out.push(i); return out; });
    if (cand.some(c => !c.length)) continue;
    const order = [...Array(E).keys()].sort((a, b) => cand[a].length - cand[b].length);
    const pos = new Array(E), done = new Array(E).fill(false), ur = new Array(N).fill(false), uc = new Array(N).fill(false);
    (function rec(k) {
      if (n >= cap) return;
      if (k === E) { if (globalOkL(C, pos, cl, L)) { n++; if (!first) { first = pos.slice(); firstL = L; } } return; }
      const e = order[k];
      for (const i of cand[e]) { const r = (i / N) | 0, c = i % N; if (ur[r] || uc[c]) continue; nodes++; ur[r] = uc[c] = true; pos[e] = i; done[e] = true; if (partialOkL(C, pos, done, L)) rec(k + 1); done[e] = false; ur[r] = uc[c] = false; }
    })(0);
  }
  return { n, nodes, first, liar: firstL };
}
// the dish's own words leave at least two rooms open
function dishRoomsL(C, clues) { const e = C.ents.length - 1, rs = new Set(); for (let i = 0; i < C.N * C.N; i++) if (!C.block[i] && clues[e].every(f => ok1(C, e, f, i))) rs.add(C.room[i]); return rs.size; }
const keyOf = f => f.t + ':' + (f.a ?? '');
function makeLiar(N, rnd) {
  const R = N - 1;
  for (let tries = 0; tries < 200; tries++) {
    const room = layout(N, R, rnd); if (!room) continue;
    const names = [...ROOMS_IN].sort(() => rnd() - .5).slice(0, Math.ceil(R / 2)).concat([...ROOMS_OUT].sort(() => rnd() - .5).slice(0, Math.floor(R / 2)));
    const outdoor = names.map(n => ROOMS_OUT.includes(n));
    const obj = new Array(N * N).fill(''), block = new Array(N * N).fill(false);
    const free = () => { for (let k = 0; k < 50; k++) { const i = (rnd() * N * N) | 0; if (!obj[i]) return i; } return -1; };
    for (let k = 0; k < N - 1; k++) { const i = free(); if (i < 0) continue; const kind = outdoor[room[i]] ? 'out' : 'in'; obj[i] = BLOCK[kind][(rnd() * BLOCK[kind].length) | 0]; block[i] = true; }
    for (let k = 0; k < N - 1; k++) { const i = free(); if (i < 0) continue; const kind = outdoor[room[i]] ? 'out' : 'in'; obj[i] = SEAT[kind][(rnd() * SEAT[kind].length) | 0]; }
    const nb = Math.min(BEASTS.length, Math.floor((N - 1) / 2) + ((rnd() * 2) | 0));
    const folk = [...[...BEASTS].sort(() => rnd() - .5).slice(0, nb).map(([name, g, kind]) => ({ name, g, kind })), ...[...FOLK].sort(() => rnd() - .5).slice(0, N - 1 - nb).map(([name, g, sort]) => ({ name, g, sort }))].sort(() => rnd() - .5);
    const dish = DISHES[(rnd() * DISHES.length) | 0];
    const ents = [...folk, { name: dish, g: '', dish: true }];
    const C = { N, R, room, obj, block, ents, names }, M = N - 1;
    let pos = null;
    for (let k = 0; k < 400 && !pos; k++) {
      const cols = [...Array(N).keys()].sort(() => rnd() - .5), rows = [...Array(N).keys()].sort(() => rnd() - .5);
      const p = ents.map((_, e) => rows[e] * N + cols[e]);
      if (p.some(i => block[i])) continue;
      const dr = room[p[M]]; if (folk.filter((_, e) => room[p[e]] === dr).length !== 1) continue;
      pos = p;
    }
    if (!pos) continue;
    const L = folk.findIndex((_, e) => room[pos[e]] === room[pos[M]]);
    // statements: true ones for everyone but the culprit; the culprit's are true of another free cell, false of its own
    const pool = ents.map((_, e) => facts(C, pos, e));
    {
      const truth = new Set(pool[L].map(keyOf)), lies = new Map();
      for (let j = 0; j < N * N; j++) if (!block[j] && j !== pos[L]) { const q = pos.slice(); q[L] = j; for (const f of facts(C, q, L)) if (!truth.has(keyOf(f))) lies.set(keyOf(f), f); }
      // the room words about company: false of the culprit as placed
      pool[L] = [...lies.values()];
      if (!pool[L].length) continue;
    }
    const pick = list => { const w = list.map(f => 1 / STRENGTH[f.t]); let s = w.reduce((a, b) => a + b, 0), x = rnd() * s; for (let k = 0; k < list.length; k++) if ((x -= w[k]) <= 0) return list[k]; return list[0]; };
    pool[M] = pool[M].filter(f => dishRoomsL(C, ents.map((_, e) => e === M ? [f] : [])) >= 2); if (!pool[M].length) continue;
    const clues = ents.map((_, e) => { const f = pick(pool[e]); pool[e] = pool[e].filter(g => g !== f); return [f]; });
    // what the solver sees: the culprit's statements are written as said (no neg); solveL tries every liar
    let res = solveL(C, clues, 20), guard = 0;
    while (res.n !== 1 && guard++ < 40) {
      if (res.n === 0) break;
      let best = null;
      const tries = []; for (let e = 0; e < ents.length; e++) if (clues[e].length < 3) for (const f of pool[e]) tries.push([e, f]);
      tries.sort(() => rnd() - .5);
      for (const [e, f] of tries.slice(0, 16)) {
        if (e !== L && A.implied(C, e, clues[e], f)) continue;
        clues[e].push(f);
        if (e === M && dishRoomsL(C, clues) < 2) { clues[e].pop(); continue; }
        const r = solveL(C, clues, 20); clues[e].pop();
        if (r.n === 0 || r.n >= res.n) continue;
        const score = r.n * 10 + STRENGTH[f.t];
        if (!best || score < best.score) best = { e, f, score };
      }
      if (!best) break;
      clues[best.e].push(best.f); pool[best.e] = pool[best.e].filter(g => g !== best.f); res = solveL(C, clues, 20);
    }
    if (res.n !== 1) continue;
    // drop every statement the answer does not need (each keeps at least one)
    const order = []; clues.forEach((l, e) => l.forEach(f => order.push([e, f]))); order.sort((a, b) => STRENGTH[a[1].t] - STRENGTH[b[1].t]);
    for (const [e, f] of order) { if (clues[e].length < 2) continue; const k = clues[e].indexOf(f); clues[e].splice(k, 1); if (solveL(C, clues, 2).n !== 1) clues[e].splice(k, 0, f); }
    const check = solveL(C, clues, 2); if (check.n !== 1 || check.first.join() !== pos.join() || check.liar !== L) continue;
    return { C, pos, clues, culprit: L, nodes: check.nodes, dish };
  }
  return null;
}
module.exports = { makeLiar, solveL };
const dir = __dirname + '/anvung-cache', out = __dirname + '/../js/ch7/cases.js';
if (require.main === module) {
  if (process.argv[2] !== '--write') {
    const [N, first, count, secs] = process.argv.slice(2).map(Number), found = [], t0 = Date.now();
    for (let s = first; s < first + count; s++) {
      if (secs && Date.now() - t0 > secs * 1000) break;
      const k = makeLiar(N, mulberry(N * 15485863 + s)); if (!k) continue;
      const { C } = k;
      found.push({ N, seed: s, nodes: k.nodes, dish: k.dish, room: C.room.map(v => v.toString(36)).join(''), names: C.names, obj: C.obj,
        ents: C.ents.map(e => e.dish ? { name: e.name, dish: 1 } : e.kind ? { name: e.name, g: e.g, kind: e.kind } : { name: e.name, g: e.g, sort: e.sort }), pos: k.pos, culprit: k.culprit,
        clues: C.ents.map((_, e) => k.clues[e].map(f => say(C, e, f))) });
      if (found.length % 10 === 0) fs.writeFileSync(dir + '/nd-' + N + '-' + first + '.json', JSON.stringify(found));
    }
    fs.writeFileSync(dir + '/nd-' + N + '-' + first + '.json', JSON.stringify(found));
    console.error(N, first, 'found', found.length, 'nodes', found.map(f => f.nodes).sort((a, b) => b - a).slice(0, 8).join(' '), ((Date.now() - t0) / 1000 | 0) + 's');
  } else {
    const src = fs.readFileSync(out, 'utf8'), head = src.slice(0, src.indexOf('const C7_CASES'));
    const old = JSON.parse(src.slice(src.indexOf('[')).replace(/;\s*$/, '')).filter(K => K.lv < 5);
    let all = []; for (const f of fs.readdirSync(dir)) if (/^nd-/.test(f)) all.push(...JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')));
    const seen = new Set(); all = all.filter(k => { const key = k.room + k.obj.join(); if (seen.has(key)) return false; seen.add(key); return true; });
    all.sort((a, b) => b.nodes - a.nodes);
    const QUOTA = JSON.parse(process.argv[3] || '{"6":50}'), pick = Object.keys(QUOTA).flatMap(N => all.filter(k => k.N === +N).slice(0, QUOTA[N])).sort((a, b) => a.N - b.N || a.nodes - b.nodes);
    const add = pick.map((k, j) => ({ N: k.N, lv: 5, liar: 1, title: TITLES[(old.length + j) * 3 % TITLES.length](k.dish), room: k.room, names: k.names, obj: k.obj, ents: k.ents, pos: k.pos, culprit: k.culprit, clues: k.clues }));
    console.error('kept', old.length, 'added', add.length, 'nodes', pick.map(k => k.N + ':' + k.nodes).join(' '));
    fs.writeFileSync(out, head + 'const C7_CASES = ' + JSON.stringify(old.concat(add)).replace(/\},\{"N"/g, '},\n{"N"') + ';\n');
  }
}
