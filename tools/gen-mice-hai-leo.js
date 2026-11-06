/* Chương VI · Tìm Chuột, the harder "hai con" fields (owner 2026-11-05: "làm thêm 50 bài siêu siêu khó"): the same rule as
   tools/gen-mice-hai.js (two mice a row, column and plot, none touching), but each field is then CLIMBED: a cell on a plot
   border (never a mouse) is handed to the plot next to it, and the change is kept when the field still has exactly one
   answer, the logic solver still finishes it, and its hardness (u3 + 2·u4 + 4·u5, as in gen-mice-hai.js) does not drop
   much (annealing; the best field seen is what is kept).
   node tools/gen-mice-hai-leo.js N first count secsPerField → tools/mice-cache/hai2-N-first.json.
   tools/gen-mice-levels.js appends the 50 hardest of all hai2-*.json after the hai con set. */
const fs = require('fs');
const { mulberry } = require('./gen-mice-levels.js');
const H = require('./gen-mice-hai.js');
const hardOf = L => L.u[3] + 2 * L.u[4] + 4 * L.u[5];

function climb(N, f, rnd, secs) {
  const reg = f.reg.slice(), isMouse = i => f.rows[(i / N) | 0].includes(i % N);
  const conn = g => { const cells = reg.map((v, i) => v === g ? i : -1).filter(i => i >= 0); if (!cells.length) return false; const seen = new Set([cells[0]]), st = [cells[0]]; while (st.length) { const i = st.pop(), r = (i / N) | 0, c = i % N; for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (a >= 0 && b >= 0 && a < N && b < N && reg[a * N + b] === g && !seen.has(a * N + b)) { seen.add(a * N + b); st.push(a * N + b); } } return seen.size === cells.length; };
  let L = H.logic(N, reg), cur = hardOf(L), best = { reg: reg.slice(), L, hard: cur };
  const t0 = Date.now();
  for (let step = 0; Date.now() - t0 < secs * 1000; step++) {
    const T = 6 * (1 - (Date.now() - t0) / (secs * 1000)) + .5;
    const i = (rnd() * N * N) | 0; if (isMouse(i)) continue;
    const r = (i / N) | 0, c = i % N, nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N).map(([a, b]) => reg[a * N + b]).filter(g => g !== reg[i]);
    if (!nb.length) continue;
    const old = reg[i]; reg[i] = nb[(rnd() * nb.length) | 0];
    if (!conn(old) || H.count(N, reg, 2) !== 1) { reg[i] = old; continue; }
    const L2 = H.logic(N, reg); if (!L2.solved) { reg[i] = old; continue; }
    const h2 = hardOf(L2);
    if (h2 >= cur || rnd() < Math.exp((h2 - cur) / T)) { cur = h2; if (h2 > best.hard) best = { reg: reg.slice(), L: L2, hard: h2 }; }
    else reg[i] = old;
  }
  return best;
}
module.exports = { climb, hardOf };
if (require.main === module) {
  const [N, first, cnt, secs] = process.argv.slice(2).map(Number), out = [], file = __dirname + '/mice-cache/hai2-' + N + '-' + first + '.json';
  for (let s = first; s < first + cnt; s++) {
    const rnd = mulberry(N * 7171717 + s), f = H.make(N, rnd); if (!f) continue;
    const b = climb(N, f, rnd, secs);
    out.push({ N, k: 2, reg: b.reg.map(v => v.toString(36)).join(''), sol: f.rows.map(p => p.map(c => c.toString(36)).join('')).join(''), u: b.L.u, score: b.L.score, hard: b.hard, from: hardOf(f) });
    fs.writeFileSync(file, JSON.stringify(out));
    console.error(N, s, 'hard', hardOf(f), '→', b.hard);
  }
}
