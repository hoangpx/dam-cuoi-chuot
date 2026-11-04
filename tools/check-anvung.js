/* Checks js/ch7/cases.js from its words: node tools/check-anvung.js [from]. Each statement is read back into a rule (by
   matching it against every rule's own words), then: exactly one placement fits, it is the stored answer and culprit,
   (a liar case, liar: 1: the culprit's statements are all false, solved with tools/gen-anvung-noidoi.js solveL), every statement of someone who says more than one is needed, the dish's statements leave at least two rooms open, and no title names a room. */
const fs = require('fs');
const { solve: solve1, sayAll } = require('./gen-anvung.js');
const { solveL } = require('./gen-anvung-noidoi.js');
const src = fs.readFileSync(__dirname + '/../js/ch7/cases.js', 'utf8'), CASES = JSON.parse(src.slice(src.indexOf('[')).replace(/;\s*$/, ''));
const BLOCKS = ['chum', 'coi', 'cau', 'rom', 'gieng'], from = +(process.argv[2] || 0);
let bad = 0;
CASES.forEach((K, n) => {
  if (n < from) return;
  const N = K.N, room = [...K.room].map(c => parseInt(c, 36)), R = K.names.length;
  const C = { N, R, room, obj: K.obj.map(o => o || ''), block: K.obj.map(o => BLOCKS.includes(o)), names: K.names, ents: K.ents.map(e => e.dish ? { name: e.name, g: '', dish: true } : e) };
  const opts = [{ t: 'corner' }, { t: 'notcorner' }, { t: 'alone' }, { t: 'with', a: 'm' }, { t: 'with', a: 'f' }];
  for (let k = 0; k < R; k++) opts.push({ t: 'in', a: k }, { t: 'notin', a: k });
  for (const o of new Set(C.obj.filter(Boolean))) opts.push({ t: 'on', a: o }, { t: 'beside', a: o });
  const errs = [], solve = (C, cl, cap) => K.liar ? solveL(C, cl, cap) : solve1(C, cl, cap);
  const groups = K.clues.map((list, e) => list.map(text => {
    const m = [];
    for (const f of opts) if (sayAll(C, e, [f])[0] === text) m.push([f]);
    for (let k = 0; k < R; k++) for (const t of ['corner', 'notcorner']) if (sayAll(C, e, [{ t: 'in', a: k }, { t }])[0] === text) m.push([{ t: 'in', a: k }, { t }]);
    if (m.length !== 1) errs.push(`${e} cannot read "${text}" (${m.length})`);
    return m[0] || [];
  }));
  const clues = groups.map(l => l.flat());
  const res = solve(C, clues, 2);
  if (res.n !== 1) errs.push('answers ' + res.n);
  else if (res.first.join() !== K.pos.join()) errs.push('answer differs');
  else if (K.liar && res.liar !== K.culprit) errs.push('liar is not the culprit');
  if (K.liar && K.clues[K.culprit].some(t => / nhưng không /.test(t))) errs.push('a two-part lie');
  const M = N - 1, cul = K.ents.slice(0, M).map((_, e) => e).filter(e => room[K.pos[e]] === room[K.pos[M]]);
  if (cul.length !== 1 || cul[0] !== K.culprit) errs.push('culprit');
  // every statement needed (owner: no idle words); everyone keeps at least one, so a lone statement is not tested
  groups.forEach((list, e) => { if (list.length < 2) return; list.forEach((_, j) => {
    const less = groups.map((l, q) => (q === e ? l.filter((_, i) => i !== j) : l).flat());
    if (solve(C, less, 2).n === 1) errs.push(`statement not needed: ${K.clues[e][j]}`);
  }); });
  const rs = new Set(); for (let i = 0; i < N * N; i++) if (!C.block[i] && clues[M].every(f => ({ in: room[i] === f.a, notin: room[i] !== f.a }[f.t] ?? true))) rs.add(room[i]);
  if (clues[M].every(f => f.t === 'in' || f.t === 'notin') && rs.size < 2) errs.push('dish room given away');
  for (const nm of K.names) if (K.title.toLowerCase().includes(nm.toLowerCase())) errs.push('title names a room');
  if (errs.length) { bad++; console.log('case', n + 1, errs.join('; ')); }
});
console.log(bad ? bad + ' bad' : 'all ' + (CASES.length - from) + ' cases ok');
