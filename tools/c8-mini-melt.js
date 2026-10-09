/* which verified candidates need a MELT (a flame swipe turning ice into water) in their solution: adds "melt" to each line of verified.jsonl -> verified2.jsonl */
const fs = require('fs'), { parseMap, makeModel } = require('./c8-model.js');
const a = fs.readFileSync('tools/c8-mini/verified.jsonl', 'utf8').split('\n').filter(Boolean).map(JSON.parse), out = [];
for (const e of a) { const { g, W, H } = parseMap(e.map), M = makeModel(W, H, 6), cnt = (g, k) => g.reduce((s, r) => s + r.filter(c => c === k).length, 0);
  let cur = g.map(r => r.slice()); M.settle(cur); let melts = 0;
  for (const st of e.steps) { const path = st.map(([x, y]) => [x, H - 1 - y]), kind = cur[path[0][1]][path[0][0]], before = cnt(cur, 'i'); cur = M.apply(cur, path); if (kind === 'a' && cnt(cur, 'i') < before) melts++; }
  e.melts = melts; out.push(e); }
fs.writeFileSync('tools/c8-mini/verified2.jsonl', out.map(e => JSON.stringify(e)).join('\n') + '\n');
const by = {}; out.forEach(e => { const k = 'd' + e.depth + ' melts' + e.melts; by[k] = (by[k] || 0) + 1; }); console.log(JSON.stringify(by));
