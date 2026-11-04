/* Checks the "hai con" fields of js/ch6/levels.js (k: 2) with a solver of its own (cell by cell, not the generator's
   row-pair search): exactly one way to put two mice in every row, column and plot with none touching, and it is sol. */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../js/ch6/levels.js', 'utf8');
const L = eval(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
let bad = 0, n2 = 0;
L.forEach((l, idx) => {
  if (l.k !== 2) return; n2++;
  const N = l.N, reg = [...l.reg].map(c => parseInt(c, 36)), sol = [...l.sol].map(c => parseInt(c, 36));
  const has = new Uint8Array(N * N), row = new Array(N).fill(0), col = new Array(N).fill(0), rg = new Array(N).fill(0);
  const size = new Array(N).fill(0); for (const g of reg) size[g]++;
  const seenRg = new Array(N).fill(0);                       // cells of each plot already passed
  let count = 0, found = null;
  (function rec(i) {
    if (count > 1) return;
    if (i === N * N) { count++; found = [...has.keys()].filter(j => has[j]); return; }
    const r = (i / N) | 0, c = i % N, g = reg[i];
    // at the start of a row the row before must have its two; the plot must still be able to get its two
    if (c === 0 && r > 0 && row[r - 1] !== 2) return;
    for (const v of [1, 0]) {
      if (v) {
        if (row[r] >= 2 || col[c] >= 2 || rg[g] >= 2) continue;
        if ((c && has[i - 1]) || (r && (has[i - N] || (c && has[i - N - 1]) || (c < N - 1 && has[i - N + 1])))) continue;
      } else {
        if (2 - rg[g] > size[g] - seenRg[g] - 1) continue;   // too few cells of the plot left
        if (2 - row[r] > N - c - 1) continue;
        if (2 - col[c] > N - r - 1) continue;
      }
      has[i] = v; if (v) { row[r]++; col[c]++; rg[g]++; } seenRg[g]++;
      rec(i + 1);
      has[i] = 0; if (v) { row[r]--; col[c]--; rg[g]--; } seenRg[g]--;
    }
  })(0);
  const want = sol.map((c, j) => ((j / 2) | 0) * N + c).sort((a, b) => a - b).join();
  if (count !== 1 || found.join() !== want) { bad++; console.log('level', idx + 2, 'answers', count); }
});
console.log(bad ? bad + ' bad' : 'all ' + n2 + ' hai con fields have exactly one answer, the stored one');
