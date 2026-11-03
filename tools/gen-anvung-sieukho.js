/* Chương VII · Ai Ăn Vụng?, the "Siêu khó" level (lv 4): bigger houses and the vaguer statements of the hard levels,
   kept for the search effort they cost (solve(): nodes).
   node tools/gen-anvung-sieukho.js N first count [secs] → tools/anvung-cache/sk-N-first.json (every case found)
   (the 50 kept: 46 hardest 8×8 + 4 hardest 9×9 of all files in tools/anvung-cache; sk-all.json keeps the 180 hardest 8×8 and every 9×9 of the 2026-11-02 runs)
   node tools/gen-anvung-sieukho.js --write → js/ch7/cases.js keeps its lv 0-3 cases and gets the 50 hardest found as lv 4. */
const fs = require('fs');
const { makeCase, solve, mulberry, sayAll, TITLES } = require('./gen-anvung.js');
const dir = __dirname + '/anvung-cache', out = __dirname + '/../js/ch7/cases.js';
if (process.argv[2] !== '--write') {
  const [N, first, count, secs] = process.argv.slice(2).map(Number), found = [], t0 = Date.now();
  for (let s = first; s < first + count; s++) {
    if (secs && Date.now() - t0 > secs * 1000) break;
    const k = makeCase(N, 3, mulberry(N * 104729 + s)); if (!k) continue;
    const { C } = k;
    found.push({ N, seed: s, nodes: k.nodes, dish: k.dish, room: C.room.map(v => v.toString(36)).join(''), names: C.names, obj: C.obj,
      ents: C.ents.map(e => e.dish ? { name: e.name, dish: 1 } : e.kind ? { name: e.name, g: e.g, kind: e.kind } : { name: e.name, g: e.g, sort: e.sort }), pos: k.pos, culprit: k.culprit,
      dishRoom: C.names[C.room[k.pos[N - 1]]], clues: C.ents.map((_, e) => sayAll(C, e, k.clues[e])) });
  }
  fs.writeFileSync(dir + '/sk-' + N + '-' + first + '.json', JSON.stringify(found));
  console.error(N, first, 'found', found.length, 'nodes', found.map(f => f.nodes).sort((a, b) => b - a).slice(0, 8).join(' '), ((Date.now() - t0) / 1000 | 0) + 's');
} else {
  const src = fs.readFileSync(out, 'utf8'), head = src.slice(0, src.indexOf('const C7_CASES'));
  const old = JSON.parse(src.slice(src.indexOf('[')).replace(/;\s*$/, '')).filter(K => K.lv < 4);
  let all = []; for (const f of fs.readdirSync(dir)) if (/^sk-/.test(f)) all.push(...JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')));
  // no twins: one case per layout
  const seen = new Set(); all = all.filter(k => { const key = k.room + k.obj.join(); if (seen.has(key)) return false; seen.add(key); return true; });
  all.sort((a, b) => b.nodes - a.nodes);
  // 46 of the hardest 8×8 houses, then the 4 hardest 9×9 (they come seldom and slowly) as the last cases
  const QUOTA = { 8: 46, 9: 4 }, pick = Object.keys(QUOTA).flatMap(N => all.filter(k => k.N === +N).slice(0, QUOTA[N])).sort((a, b) => a.N - b.N || a.nodes - b.nodes);
  const add = pick.map((k, j) => ({ N: k.N, lv: 4, title: TITLES[(old.length + j) * 3 % TITLES.length](k.dish, k.dishRoom), room: k.room, names: k.names, obj: k.obj, ents: k.ents, pos: k.pos, culprit: k.culprit, clues: k.clues }));
  console.error('kept', old.length, 'added', add.length, 'nodes', pick.map(k => k.N + ':' + k.nodes).join(' '));
  fs.writeFileSync(out, head + 'const C7_CASES = ' + JSON.stringify(old.concat(add)).replace(/\},\{"N"/g, '},\n{"N"') + ';\n');
}
