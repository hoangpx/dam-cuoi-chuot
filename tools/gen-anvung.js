/* Makes the cases of chương VII · Ai Ăn Vụng? → js/ch7/cases.js. Run: node tools/gen-anvung.js
   A case (after the owner's reference, Enigmic / "Murdoku"): an N×N house cut into named rooms, some cells holding things
   (chum, cối… block the cell; chõng, phản… can be sat on), N−1 villagers and the stolen dish. Everyone (and the dish)
   stands in a different row and column; nobody stands on a blocking thing. Exactly one villager shares a room with the
   dish: the one who ate it. Each villager (and the dish) has a statement; statements are added until only one way of
   placing everybody is left (counted by a backtracking solver). "Beside" = up, down, left or right, inside the same room. */
const fs = require('fs');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ROOMS_IN = ['Gian bếp', 'Nhà ngang', 'Gian thờ', 'Nhà kho', 'Chái bếp'], ROOMS_OUT = ['Sân gạch', 'Vườn cau', 'Bờ ao', 'Chuồng gà', 'Ngõ trúc'];
const BLOCK = { in: ['chum', 'coi'], out: ['cau', 'rom', 'gieng'] }, SEAT = { in: ['phan', 'chieu', 'ghe', 'chong'], out: ['chong', 'ghe', 'chieu'] };
const THING = { chum: 'chum nước', coi: 'cối giã gạo', cau: 'cây cau', rom: 'đống rơm', gieng: 'giếng nước', chong: 'giường tre', phan: 'ghế băng', chieu: 'chiếu hoa', ghe: 'ghế đẩu' };
const FOLK = [
  ['bà Ba', 'f', 9], ['ông Tư', 'm', 8], ['chú Năm', 'm', 1], ['cô Út', 'f', 5], ['anh Cả', 'm', 0], ['chị Hai', 'f', 3], ['thằng Tí', 'm', 11],
  ['cái Hến', 'f', 12], ['cụ Đồ', 'm', 10], ['thím Mận', 'f', 4], ['bác Sáu', 'm', 7], ['cô Tấm', 'f', 2], ['anh Bờm', 'm', 6], ['cái Mít', 'f', 13],
];
// the other villagers (owner: many kinds, so nobody is mistaken for another)
const BEASTS = [['bác Gà Trống', 'm', 'rooster'], ['chị Gà Mái', 'f', 'hen'], ['cậu Mèo Mướp', 'm', 'cat'], ['chú Chó Vện', 'm', 'dog'], ['bác Trâu', 'm', 'buffalo'], ['cô Bò Vàng', 'f', 'cow'], ['ông Lợn Ỉn', 'm', 'pig'], ['cô Vịt Bầu', 'f', 'duck']];
const DISHES = ['mâm xôi', 'nồi chè', 'đĩa bánh chưng', 'buồng chuối', 'đĩa cá kho', 'hũ mật ong', 'rổ trứng', 'đĩa xôi gấc', 'nải chuối cúng', 'quả dưa hấu', 'hộp mứt Tết', 'chõ bánh giầy', 'nồi cơm nếp', 'đĩa bánh giầy'];
const TITLES = [d => `${cap(d)} biến mất`, d => `Ai ăn vụng ${d}?`, d => `${cap(d)} không cánh mà bay`, d => `Chuyện ${d} đêm rằm`, d => `Đêm qua, ${d} đâu rồi?`, d => `Dấu vết bên ${d}`, d => `${cap(d)} chỉ còn cái vỏ`];
const cap = s => s[0].toUpperCase() + s.slice(1);

function layout(N, R, rnd) {
  // rooms: grown from R seeds, each in one piece
  for (let tries = 0; tries < 500; tries++) {
    const room = new Array(N * N).fill(-1), fr = [];
    const seeds = new Set(); while (seeds.size < R) seeds.add((rnd() * N * N) | 0);
    [...seeds].forEach((s, k) => { room[s] = k; fr.push(s); });
    let left = N * N - R;
    while (left > 0) {
      const i = fr[(rnd() * fr.length) | 0], r = (i / N) | 0, c = i % N;
      const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && room[a * N + b] < 0);
      if (!nb.length) { fr.splice(fr.indexOf(i), 1); continue; }
      const [a, b] = nb[(rnd() * nb.length) | 0]; room[a * N + b] = room[i]; fr.push(a * N + b); left--;
    }
    const sizes = new Array(R).fill(0); for (const v of room) sizes[v]++;
    if (sizes.some(s => s < 3)) continue;
    return room;
  }
  return null;
}
function corner(N, room, i) {
  const r = (i / N) | 0, c = i % N, out = (a, b) => a < 0 || b < 0 || a >= N || b >= N || room[a * N + b] !== room[i];
  return (out(r - 1, c) && out(r, c - 1)) || (out(r - 1, c) && out(r, c + 1)) || (out(r + 1, c) && out(r, c - 1)) || (out(r + 1, c) && out(r, c + 1));
}
function besideCells(N, room, i) { const r = (i / N) | 0, c = i % N; return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && room[a * N + b] === room[i]).map(([a, b]) => a * N + b); }

// the facts that hold for entity e in a placement; unary ones narrow e's cells, the rest are checked on a whole placement
function facts(C, pos, e) {
  const { N, room, obj, ents, R } = C, i = pos[e], out = [];
  out.push({ t: 'in', a: room[i] });
  for (let k = 0; k < R; k++) if (k !== room[i]) out.push({ t: 'notin', a: k });
  if (obj[i]) out.push({ t: 'on', a: obj[i] });
  const near = new Set(besideCells(N, room, i).map(j => obj[j]).filter(Boolean)); for (const o of near) out.push({ t: 'beside', a: o });
  out.push({ t: corner(N, room, i) ? 'corner' : 'notcorner' });
  if (e < ents.length - 1) {                                                // villagers only: who else is in the room
    const mates = ents.slice(0, -1).map((_, k) => k).filter(k => k !== e && room[pos[k]] === room[i]);
    if (!mates.length) out.push({ t: 'alone' });
    for (const g of ['m', 'f']) if (mates.some(k => ents[k].g === g)) out.push({ t: 'with', a: g });
  }
  return out;
}
// the dish's own words must leave at least two rooms open, or reading "X ở trong gian bếp" twice gives the culprit away (owner)
function dishRooms(C, clues) { const e = C.ents.length - 1, rs = new Set(); for (let i = 0; i < C.N * C.N; i++) if (!C.block[i] && clues[e].every(f => unaryOk(C, e, f, i))) rs.add(C.room[i]); return rs.size; }
// f says nothing new about e: every cell e's other statements allow already fits it ("không ở gian thờ" next to "ở trong sân gạch")
function implied(C, e, list, f) { if (!['in', 'notin', 'on', 'beside', 'corner', 'notcorner'].includes(f.t)) return false; for (let i = 0; i < C.N * C.N; i++) if (!C.block[i] && list.every(g => unaryOk(C, e, g, i)) && !unaryOk(C, e, f, i)) return false; return true; }
const STRENGTH = { on: 5, in: 4, beside: 3, corner: 3, alone: 2, with: 1, notin: 1, notcorner: 1 };
function unaryOk(C, e, f, i) {
  const { N, room, obj } = C;
  switch (f.t) {
    case 'in': return room[i] === f.a; case 'notin': return room[i] !== f.a; case 'on': return obj[i] === f.a;
    case 'beside': return besideCells(N, room, i).some(j => obj[j] === f.a);
    case 'corner': return corner(N, room, i); case 'notcorner': return !corner(N, room, i);
    default: return true;
  }
}
function globalOk(C, pos, clues) {
  const { room, ents } = C, M = ents.length - 1, dishRoom = room[pos[M]];
  if (ents.slice(0, M).filter((_, k) => room[pos[k]] === dishRoom).length !== 1) return false;   // exactly one ate it
  for (let e = 0; e < M; e++) for (const f of clues[e]) {
    if (f.t !== 'alone' && f.t !== 'with') continue;
    const mates = [...Array(M).keys()].filter(k => k !== e && room[pos[k]] === room[pos[e]]);
    if (f.t === 'alone' && mates.length) return false;
    if (f.t === 'with' && !mates.some(k => ents[k].g === f.a)) return false;
  }
  return true;
}
// a part-placement that can no longer work: two villagers by the dish, or someone 'alone' with company
function partialOk(C, pos, done, clues) {
  const { room, ents } = C, M = ents.length - 1;
  if (done[M]) { let k = 0; for (let e = 0; e < M; e++) if (done[e] && room[pos[e]] === room[pos[M]]) k++; if (k > 1) return false; }
  for (let e = 0; e < M; e++) if (done[e] && clues[e].some(f => f.t === 'alone')) for (let q = 0; q < M; q++) if (q !== e && done[q] && room[pos[q]] === room[pos[e]]) return false;
  return true;
}
// how many cells are left to each entity by its own statements (a cheap measure while many placements remain)
function candSum(C, clues) { let n = 0; for (let e = 0; e < C.ents.length; e++) for (let i = 0; i < C.N * C.N; i++) if (!C.block[i] && clues[e].every(f => unaryOk(C, e, f, i))) n++; return n; }
// how many placements fit the statements (up to cap); nodes = search effort, a measure of difficulty
function solve(C, clues, cap = 2) {
  const { N, obj, ents } = C, E = ents.length;
  const cand = ents.map((_, e) => { const out = []; for (let i = 0; i < N * N; i++) if (!C.block[i] && clues[e].every(f => unaryOk(C, e, f, i))) out.push(i); return out; });
  const order = [...Array(E).keys()].sort((a, b) => cand[a].length - cand[b].length);
  const pos = new Array(E), done = new Array(E).fill(false), ur = new Array(N).fill(false), uc = new Array(N).fill(false);
  let n = 0, nodes = 0, first = null;
  (function rec(k) {
    if (n >= cap) return;
    if (k === E) { if (globalOk(C, pos, clues)) { n++; if (!first) first = pos.slice(); } return; }
    const e = order[k];
    for (const i of cand[e]) { const r = (i / N) | 0, c = i % N; if (ur[r] || uc[c]) continue; nodes++; ur[r] = uc[c] = true; pos[e] = i; done[e] = true; if (partialOk(C, pos, done, clues)) rec(k + 1); done[e] = false; ur[r] = uc[c] = false; }
  })(0);
  return { n, nodes, first };
}
function makeCase(N, level, rnd) {
  const R = N - 1;
  for (let tries = 0; tries < 300; tries++) {
    const room = layout(N, R, rnd); if (!room) continue;
    const names = [...ROOMS_IN].sort(() => rnd() - .5).slice(0, Math.ceil(R / 2)).concat([...ROOMS_OUT].sort(() => rnd() - .5).slice(0, Math.floor(R / 2)));
    const outdoor = names.map(n => ROOMS_OUT.includes(n));
    const obj = new Array(N * N).fill(''), block = new Array(N * N).fill(false);
    const free = () => { for (let k = 0; k < 50; k++) { const i = (rnd() * N * N) | 0; if (!obj[i]) return i; } return -1; };
    for (let k = 0; k < N - 1; k++) { const i = free(); if (i < 0) continue; const kind = outdoor[room[i]] ? 'out' : 'in'; obj[i] = BLOCK[kind][(rnd() * BLOCK[kind].length) | 0]; block[i] = true; }
    for (let k = 0; k < N - 1; k++) { const i = free(); if (i < 0) continue; const kind = outdoor[room[i]] ? 'out' : 'in'; obj[i] = SEAT[kind][(rnd() * SEAT[kind].length) | 0]; }
    // about half mice, half other beasts
    const nb = Math.min(BEASTS.length, Math.floor((N - 1) / 2) + ((rnd() * 2) | 0));
    const folk = [...[...BEASTS].sort(() => rnd() - .5).slice(0, nb).map(([name, g, kind]) => ({ name, g, kind })), ...[...FOLK].sort(() => rnd() - .5).slice(0, N - 1 - nb).map(([name, g, sort]) => ({ name, g, sort }))].sort(() => rnd() - .5);
    const dish = DISHES[(rnd() * DISHES.length) | 0];
    const ents = [...folk, { name: dish, g: '', dish: true }];
    const C = { N, R, room, obj, block, ents, names };
    // a placement: everyone in their own row and column, never on a blocking thing; exactly one villager by the dish
    let pos = null;
    for (let k = 0; k < 400 && !pos; k++) {
      const cols = [...Array(N).keys()].sort(() => rnd() - .5), rows = [...Array(N).keys()].sort(() => rnd() - .5);
      const p = ents.map((_, e) => rows[e] * N + cols[e]);
      if (p.some(i => block[i])) continue;
      const dr = room[p[N - 1]]; if (folk.filter((_, e) => room[p[e]] === dr).length !== 1) continue;
      pos = p;
    }
    if (!pos) continue;
    // statements: one each to start, then the most telling ones until one answer is left
    const pool = ents.map((_, e) => facts(C, pos, e));
    const hard = level >= 2, pick = list => { const w = list.map(f => hard ? 1 / STRENGTH[f.t] : STRENGTH[f.t]); let s = w.reduce((a, b) => a + b, 0), x = rnd() * s; for (let k = 0; k < list.length; k++) if ((x -= w[k]) <= 0) return list[k]; return list[0]; };
        const D = ents.length - 1; pool[D] = pool[D].filter(f => dishRooms(C, ents.map((_, e) => e === D ? [f] : [])) >= 2); if (!pool[D].length) continue;
    const clues = ents.map((_, e) => { const f = pick(pool[e]); pool[e] = pool[e].filter(g => g !== f); return [f]; });
    let res = solve(C, clues, 20), guard = 0;
    while (res.n > 1 && guard++ < 30) {
      let best = null;
      const tries = []; for (let e = 0; e < ents.length; e++) if (clues[e].length < 3) for (const f of pool[e]) tries.push([e, f]);
      tries.sort(() => rnd() - .5);
      for (const [e, f] of tries.slice(0, 18)) {
        if (implied(C, e, clues[e], f)) continue; clues[e].push(f); if (e === D && dishRooms(C, clues) < 2) { clues[e].pop(); continue; } const r = res.n >= 20 ? { n: res.n, cs: candSum(C, clues) } : solve(C, clues, 20); clues[e].pop();
        if (res.n >= 20) { const cs0 = candSum(C, clues); if (r.cs >= cs0) continue; const score = r.cs * 10 + (hard ? STRENGTH[f.t] : -STRENGTH[f.t]); if (!best || score < best.score) best = { e, f, score }; continue; }
        if (r.n >= res.n) continue;
        const score = r.n * 10 + (hard ? STRENGTH[f.t] : -STRENGTH[f.t]);   // the most telling; on hard cases the vaguer of two equals
        if (!best || score < best.score) best = { e, f, score };
      }
      if (!best) break;
      clues[best.e].push(best.f); pool[best.e] = pool[best.e].filter(g => g !== best.f); res = solve(C, clues, 20);
    }
    if (res.n !== 1) continue;
    const order = []; clues.forEach((l, e) => l.forEach(f => order.push([e, f]))); order.sort((a, b) => STRENGTH[a[1].t] - STRENGTH[b[1].t]);
    for (const [e, f] of order) { if (clues[e].length < 2) continue; const k = clues[e].indexOf(f); clues[e].splice(k, 1); if (solve(C, clues, 2).n !== 1) clues[e].splice(k, 0, f); }
    const check = solve(C, clues, 2); if (check.n !== 1 || check.first.join() !== pos.join()) continue;
    const culprit = folk.findIndex((_, e) => room[pos[e]] === room[pos[N - 1]]);
    return { C, pos, clues, culprit, nodes: solve(C, clues, 2).nodes, dish };
  }
  return null;
}
// the words of a statement
// "góc nhà hay góc vườn": the kinds of place this case really has (every indoor one is nhà), so the words fit the map (owner)
const HEAD = { 'Sân gạch': 'sân', 'Vườn cau': 'vườn', 'Bờ ao': 'bờ ao', 'Chuồng gà': 'chuồng', 'Ngõ trúc': 'ngõ' };
function corners(C) { const h = [...new Set(C.names.map(n => ROOMS_IN.includes(n) ? 'nhà' : HEAD[n]))].map(w => 'góc ' + w); return h.length > 1 ? h.slice(0, -1).join(', ') + ' hay ' + h[h.length - 1] : h[0]; }
function sayAll(C, e, list) {
  const inF = list.find(f => f.t === 'in'), cF = list.find(f => f.t === 'corner' || f.t === 'notcorner');
  if (inF && cF) list = list.filter(f => f !== cF).map(f => f === inF ? { t: cF.t === 'corner' ? 'incorner' : 'innotcorner', a: inF.a } : f);
  return list.map(f => say(C, e, f));
}
function say(C, e, f) {
  const ent = C.ents[e], who = cap(ent.name), dish = ent.dish, room = k => C.names[k];
  switch (f.t) {
    case 'in': return dish ? `${who} để ở ${room(f.a).toLowerCase()}.` : `${who} ở trong ${room(f.a).toLowerCase()}.`;
    case 'notin': return dish ? `${who} không để ở ${room(f.a).toLowerCase()}.` : `${who} không ở ${room(f.a).toLowerCase()}.`;
    case 'on': return dish ? `${who} đặt trên ${THING[f.a]}.` : `${who} ngồi trên ${THING[f.a]}.`;
    case 'beside': return dish ? `${who} để cạnh ${THING[f.a]}.` : `${who} đứng cạnh ${THING[f.a]}.`;
    case 'corner': return dish ? `${who} để ở một ${corners(C)}.` : `${who} đứng ở một ${corners(C)}.`;
    case 'notcorner': return dish ? `${who} không để ở góc nào cả.` : `${who} không đứng ở góc nào cả.`;
    case 'incorner': return dish ? `${who} để ở một góc ${room(f.a).toLowerCase()}.` : `${who} đứng ở một góc ${room(f.a).toLowerCase()}.`;
    case 'innotcorner': return `${who} ở trong ${room(f.a).toLowerCase()}, nhưng không đứng ở góc nào.`;
    case 'alone': return `${who} ở một mình một khu.`;
    case 'with': return `${who} ở cùng khu với một người ${f.a === 'm' ? 'đàn ông' : 'đàn bà'}${ent.g === f.a ? ' khác' : ''}.`;
  }
}
if (require.main === module) {
  const PLAN = [[5, 0, 10], [6, 1, 10], [7, 2, 10], [8, 3, 10]], out = [];
  for (const [N, level, want] of PLAN) {
    const pool = [], t0 = Date.now();
    for (let s = 1; pool.length < want * 2 && s < 3000; s++) { const k = makeCase(N, level, mulberry(N * 7919 + s)); if (k) pool.push(k); if (Date.now() - t0 > 240000) break; }
    pool.sort((a, b) => a.nodes - b.nodes);
    const pickd = []; for (let k = 0; k < want && pool.length; k++) pickd.push(pool[Math.min(pool.length - 1, Math.round(k * (pool.length - 1) / Math.max(1, want - 1)))]);
    console.error(N, 'pool', pool.length, 's', ((Date.now() - t0) / 1000) | 0, 'nodes', pickd.map(k => k.nodes).join(' '));
    pickd.forEach((k, j) => {
      const { C } = k, titleF = TITLES[(out.length * 3 + j) % TITLES.length];
      out.push({ N, lv: level, title: titleF(k.dish, C.names[C.room[k.pos[N - 1]]]), room: C.room.map(v => v.toString(36)).join(''), names: C.names, obj: C.obj,
        ents: C.ents.map(e => e.dish ? { name: e.name, dish: 1 } : e.kind ? { name: e.name, g: e.g, kind: e.kind } : { name: e.name, g: e.g, sort: e.sort }), pos: k.pos, culprit: k.culprit,
        clues: C.ents.map((_, e) => sayAll(C, e, k.clues[e])) });
    });
  }
  const head = '/* Chương VII · Ai Ăn Vụng?: the cases, made by tools/gen-anvung.js (do not edit by hand). room: each cell\'s room, row by row\n   (base 36) with names; obj: the thing in each cell (chum, coi, cau, rom, gieng block; chong, phan, chieu, ghe can be sat on);\n   ents: the villagers then the dish (last); pos: the answer (a cell for each); culprit: who ate it; clues: what each says. */\n';
  fs.writeFileSync(__dirname + '/../js/ch7/cases.js', head + 'const C7_CASES = ' + JSON.stringify(out).replace(/\},\{"N"/g, '},\n{"N"') + ';\n');
  console.error('cases', out.length);
}
module.exports = { makeCase, solve, mulberry };
