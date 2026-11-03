/* Chương VI · Tìm Chuột, the "Siêu khó" set: node tools/gen-mice-sieukho.js N first count [secs] → tools/mice-cache/sk-N-first.json
   (every field found from seeds first … first+count-1 that the logic solver finishes only with rule 4 and leans on the
   what-if rules many times). tools/gen-mice-levels.js then picks the hardest 50 of all sk-*.json files into levels.js. */
const fs = require('fs');
const { make, mulberry } = require('./gen-mice-levels.js');
const [N, first, count, secs] = process.argv.slice(2).map(Number), out = [], t0 = Date.now();
for (let s = first; s < first + count; s++) {
  if (secs && Date.now() - t0 > secs * 1000) break;
  const f = make(N, mulberry(N * 7777777 + s));
  if (!f || f.maxRule < 4) continue;
  const hard = f.u[3] + 2 * f.u[4];
  if (hard < 4) continue;
  out.push({ N, reg: f.reg.map(v => v.toString(36)).join(''), sol: f.sol.map(v => v.toString(36)).join(''), d: 4, u: f.u, score: f.score, hard });
}
fs.writeFileSync(__dirname + '/mice-cache/sk-' + N + '-' + first + '.json', JSON.stringify(out));
console.error(N, first, 'kept', out.length, ((Date.now() - t0) / 1000 | 0) + 's');
