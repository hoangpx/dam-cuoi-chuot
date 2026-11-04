/* Chương VI · Tìm Chuột, the "hai con" fields (owner 2026-11-04: "siêu siêu khó, có thể sáng tạo thêm luật"): every row,
   every column and every plot holds TWO mice, and still no two mice touch, not even corner to corner (Star Battle with two
   stars). node tools/gen-mice-hai.js N first count secs → tools/mice-cache/hai-N-first.json: every field found from the
   seeds first … first+count-1 that has exactly one answer and that the logic solver below finishes without guessing.
   tools/gen-mice-levels.js picks the 50 hardest of all hai-*.json into js/ch6/levels.js (k: 2). */
const fs = require('fs');
const { mulberry } = require('./gen-mice-levels.js');
const K = 2;
const near = (N, a, b) => Math.abs(((a / N) | 0) - ((b / N) | 0)) <= 1 && Math.abs(a % N - b % N) <= 1;

// a placement: two columns a row, two mice a column, none touching
function place(N, rnd) {
  const cols = new Array(N).fill(0), rows = [];
  let steps = 0;
  const rec = r => {
    if (++steps > 20000) return false;
    if (r === N) return true;
    const prev = r ? rows[r - 1] : [];
    const pairs = [];
    for (let a = 0; a < N; a++) for (let b = a + 2; b < N; b++) {
      if (cols[a] >= K || cols[b] >= K) continue;
      if (prev.some(p => Math.abs(p - a) <= 1 || Math.abs(p - b) <= 1)) continue;
      pairs.push([a, b]);
    }
    pairs.sort(() => rnd() - .5);
    // the columns still short of two must still fit in the rows left
    for (const [a, b] of pairs) {
      cols[a]++; cols[b]++; rows.push([a, b]);
      const short = cols.reduce((s, c) => s + (K - c), 0);
      if (short <= K * (N - r - 1) && rec(r + 1)) return true;
      cols[a]--; cols[b]--; rows.pop();
    }
    return false;
  };
  return rec(0) ? rows : null;
}
// plots: pair the mice, join each pair by a path, then grow the plots into the rest
function plots(N, rows, rnd) {
  const mice = []; rows.forEach((pr, r) => pr.forEach(c => mice.push(r * N + c)));
  for (let t = 0; t < 60; t++) {
    const reg = new Array(N * N).fill(-1), left = mice.slice().sort(() => rnd() - .5);
    let g = 0, ok = true;
    while (left.length) {
      const a = left.shift();
      // the nearest unpaired mouse (with some randomness) that a free path reaches
      const opts = left.map(b => [b, Math.abs(((a / N) | 0) - ((b / N) | 0)) + Math.abs(a % N - b % N) + rnd() * 2.5]).sort((x, y) => x[1] - y[1]);
      let done = false;
      for (const [b] of opts) {
        const prev = new Map([[a, -1]]), q = [a];
        while (q.length && !prev.has(b)) {
          const i = q.shift(), r = (i / N) | 0, c = i % N;
          const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].sort(() => rnd() - .5);
          for (const [y, x] of nb) { if (y < 0 || x < 0 || y >= N || x >= N) continue; const j = y * N + x; if (prev.has(j) || reg[j] >= 0) continue; if (j !== b && mice.includes(j)) continue; prev.set(j, i); q.push(j); }
        }
        if (!prev.has(b)) continue;
        for (let j = b; j !== -1; j = prev.get(j)) reg[j] = g;
        left.splice(left.indexOf(b), 1); done = true; break;
      }
      if (!done) { ok = false; break; }
      g++;
    }
    if (!ok) continue;
    let free = reg.filter(v => v < 0).length, guard = 0;
    while (free > 0 && guard++ < 100000) {
      const i = (rnd() * N * N) | 0; if (reg[i] >= 0) continue;
      const r = (i / N) | 0, c = i % N, nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && x >= 0 && y < N && x < N && reg[y * N + x] >= 0);
      if (!nb.length) continue; const [y, x] = nb[(rnd() * nb.length) | 0]; reg[i] = reg[y * N + x]; free--;
    }
    if (free) continue;
    return reg;
  }
  return null;
}
// how many answers (up to cap): row by row, a pair of columns each
function count(N, reg, cap = 2) {
  const col = new Array(N).fill(0), rg = new Array(N).fill(0), pick = [];
  // cells of each plot in each row and below, for a quick "can this plot still get its two" test
  const below = Array.from({ length: N + 1 }, () => new Array(N).fill(0));
  for (let r = N - 1; r >= 0; r--) { for (let g = 0; g < N; g++) below[r][g] = below[r + 1][g]; for (let c = 0; c < N; c++) below[r][reg[r * N + c]]++; }
  let n = 0;
  (function rec(r) {
    if (n >= cap) return;
    if (r === N) { n++; return; }
    for (let g = 0; g < N; g++) if (rg[g] < K && below[r][g] === 0) return;
    const prev = r ? pick[r - 1] : [];
    for (let a = 0; a < N; a++) {
      if (col[a] >= K || prev.some(p => Math.abs(p - a) <= 1)) continue;
      const ga = reg[r * N + a]; if (rg[ga] >= K) continue;
      for (let b = a + 2; b < N; b++) {
        if (col[b] >= K || prev.some(p => Math.abs(p - b) <= 1)) continue;
        const gb = reg[r * N + b]; if (rg[gb] >= K || (ga === gb && rg[ga] >= K - 1)) continue;
        col[a]++; col[b]++; rg[ga]++; rg[gb]++; pick.push([a, b]);
        let ok = true; for (let c = 0; c < N && ok; c++) if (K - col[c] > K * (N - r - 1)) ok = false;
        if (ok) rec(r + 1);
        col[a]--; col[b]--; rg[ga]--; rg[gb]--; pick.pop();
        if (n >= cap) return;
      }
    }
  })(0);
  return n;
}
// the logic solver (no guessing): rules
//  1 a group (row, column, plot) whose open cells are exactly what it still needs: mice in all of them
//  2 a group whose open cells all lie inside another group that needs as many: the rest of that other group is empty
//  3 what-if: a mouse in this cell at once leaves some group unable to get its two → empty
//  5 (last) a deeper what-if: a mouse in this cell, then up to six rounds of rule 1, ends in a contradiction → empty
//  4 m plots whose open cells lie inside m rows (or columns) needing as many in all: the rest of those rows is empty,
//    and the same with rows inside plots (m = 2, 3, 4)
function logic(N, reg) {
  const NN = N * N, R = i => (i / N) | 0, C = i => i % N;
  const groups = []; for (let r = 0; r < N; r++) groups.push([...Array(N).keys()].map(c => r * N + c)); for (let c = 0; c < N; c++) groups.push([...Array(N).keys()].map(r => r * N + c));
  for (let g = 0; g < N; g++) groups.push([...Array(NN).keys()].filter(i => reg[i] === g));
  const gOf = i => [R(i), N + C(i), 2 * N + reg[i]];
  const u = [0, 0, 0, 0, 0, 0]; let maxRule = 0, score = 0;
  const use = (k, w) => { u[k]++; score += w; if (k > maxRule) maxRule = k; };
  // state: cand 1 open, 0 empty, 2 mouse
  const put = (cand, i) => {
    cand[i] = 2;
    for (let j = 0; j < NN; j++) if (cand[j] === 1 && j !== i && near(N, i, j)) cand[j] = 0;
    for (const g of gOf(i)) if (groups[g].filter(j => cand[j] === 2).length >= K) for (const j of groups[g]) if (cand[j] === 1) cand[j] = 0;
  };
  const need = (cand, g) => K - groups[g].filter(j => cand[j] === 2).length;
  const open = (cand, g) => groups[g].filter(j => cand[j] === 1);
  // the most mice a group can still take: a line exactly (pick leftmost), a plot at most its open cells
  const room = (cand, g) => { const o = open(cand, g); if (g >= 2 * N) return o.length; let n = 0, last = -9; for (const j of o) { const p = g < N ? C(j) : R(j); if (p - last >= 2) { n++; last = p; } } return n; };
  const dead = cand => groups.some((_, g) => need(cand, g) > room(cand, g));
  // rule 1 forced moves (returns false on a contradiction)
  const force = (cand, limit) => {
    for (let s = 0; s < limit; s++) {
      if (dead(cand)) return false;
      let moved = false;
      for (let g = 0; g < groups.length && !moved; g++) { const nd = need(cand, g); if (nd <= 0) continue; const o = open(cand, g); if (o.length === nd) { for (const j of o) { if (cand[j] !== 1) return false; put(cand, j); } moved = true; } }
      if (!moved) return true;
    }
    return !dead(cand);
  };
  const cand = new Uint8Array(NN).fill(1);
  const combos = (arr, k) => { const out = []; (function pick(s, acc) { if (acc.length === k) { out.push(acc.slice()); return; } for (let j = s; j < arr.length; j++) { acc.push(arr[j]); pick(j + 1, acc); acc.pop(); } })(0, []); return out; };
  for (let guard = 0; guard < 400; guard++) {
    if (cand.filter(v => v === 2).length === K * N) return { solved: true, maxRule, score, u };
    if (dead(cand)) return { solved: false };
    let moved = false;
    // 1
    for (let g = 0; g < groups.length && !moved; g++) { const nd = need(cand, g); if (nd <= 0) continue; const o = open(cand, g); if (o.length === nd) { for (const j of o) put(cand, j); use(1, 1); moved = true; } }
    if (moved) continue;
    // 2
    for (let a = 0; a < groups.length && !moved; a++) {
      const na = need(cand, a); if (na <= 0) continue; const oa = open(cand, a), sa = new Set(oa);
      for (let b = 0; b < groups.length && !moved; b++) {
        if (b === a || need(cand, b) !== na) continue; const ob = open(cand, b);
        if (!oa.every(j => groups[b].includes(j))) continue;
        const kill = ob.filter(j => !sa.has(j)); if (kill.length) { for (const j of kill) cand[j] = 0; use(2, 2); moved = true; }
      }
    }
    if (moved) continue;
    // 3, shallow: the mouse alone already leaves a group short
    for (let i = 0; i < NN && !moved; i++) {
      if (cand[i] !== 1) continue;
      const c2 = cand.slice(); put(c2, i);
      if (dead(c2)) { cand[i] = 0; use(3, 4); moved = true; }
    }
    if (moved) continue;
    // 4
    const live = g => need(cand, g) > 0;
    const regs = groups.map((_, g) => g).filter(g => g >= 2 * N && live(g));
    for (const [lo, hi] of [[0, N], [N, 2 * N]]) {
      if (moved) break;
      const lines = groups.map((_, g) => g).filter(g => g >= lo && g < hi && live(g));
      const lineOf = j => lo === 0 ? R(j) : N + C(j);
      for (const m of [2, 3, 4]) {
        if (moved) break;
        // plots inside lines
        for (const cb of combos(regs, m)) {
          const ls = new Set(); for (const g of cb) for (const j of open(cand, g)) ls.add(lineOf(j));
          if (ls.size !== m) continue;
          const nIn = cb.reduce((s, g) => s + need(cand, g), 0), nL = [...ls].reduce((s, g) => s + need(cand, g), 0);
          if (nIn !== nL) continue;
          const inside = new Set(cb.flatMap(g => groups[g])), kill = [];
          for (const l of ls) for (const j of open(cand, l)) if (!inside.has(j)) kill.push(j);
          if (kill.length) { for (const j of kill) cand[j] = 0; use(4, 6 + m); moved = true; break; }
        }
        if (moved) break;
        // lines inside plots
        for (const cb of combos(lines, m)) {
          const gs = new Set(); for (const l of cb) for (const j of open(cand, l)) gs.add(2 * N + reg[j]);
          if (gs.size !== m) continue;
          const nIn = cb.reduce((s, g) => s + need(cand, g), 0), nG = [...gs].reduce((s, g) => s + need(cand, g), 0);
          if (nIn !== nG) continue;
          const inside = new Set(cb.flatMap(g => groups[g])), kill = [];
          for (const g of gs) for (const j of open(cand, g)) if (!inside.has(j)) kill.push(j);
          if (kill.length) { for (const j of kill) cand[j] = 0; use(4, 6 + m); moved = true; break; }
        }
      }
    }
    if (moved) continue;
    // 5 (tried last): a deeper what-if, a mouse here and then up to six rounds of rule 1 end in a contradiction
    for (let i = 0; i < NN && !moved; i++) {
      if (cand[i] !== 1) continue;
      const c2 = cand.slice(); put(c2, i);
      if (!force(c2, 6)) { cand[i] = 0; use(5, 12); moved = true; }
    }
    if (!moved) return { solved: false };
  }
  return { solved: false };
}
function make(N, rnd) {
  for (let tries = 0; tries < 40; tries++) {
    const rows = place(N, rnd); if (!rows) continue;
    const reg = plots(N, rows, rnd); if (!reg) continue;
    const isMouse = i => rows[(i / N) | 0].includes(i % N);
    const conn = g => { const cells = reg.map((v, i) => v === g ? i : -1).filter(i => i >= 0); const seen = new Set([cells[0]]), st = [cells[0]]; while (st.length) { const i = st.pop(), r = (i / N) | 0, c = i % N; for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (a >= 0 && b >= 0 && a < N && b < N && reg[a * N + b] === g && !seen.has(a * N + b)) { seen.add(a * N + b); st.push(a * N + b); } } return seen.size === cells.length; };
    let n = count(N, reg);
    for (let k = 0; k < 4000 && n > 1; k++) {
      const i = (rnd() * N * N) | 0; if (isMouse(i)) continue;
      const r = (i / N) | 0, c = i % N, nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N).map(([a, b]) => reg[a * N + b]).filter(g => g !== reg[i]);
      if (!nb.length) continue; const old = reg[i], g = nb[(rnd() * nb.length) | 0]; reg[i] = g;
      if (!conn(old)) { reg[i] = old; continue; }
      const n2 = count(N, reg); if (n2 === 0) { reg[i] = old; continue; } n = n2;
    }
    if (n !== 1) continue;
    const L = logic(N, reg); if (!L.solved) continue;
    return { reg, rows, ...L };
  }
  return null;
}
module.exports = { make, logic, count, K };
if (require.main === module) {
  const [N, first, cnt, secs] = process.argv.slice(2).map(Number), out = [], t0 = Date.now();
  for (let s = first; s < first + cnt; s++) {
    if (secs && Date.now() - t0 > secs * 1000) break;
    const f = make(N, mulberry(N * 9191919 + s)); if (!f) continue;
    out.push({ N, k: K, reg: f.reg.map(v => v.toString(36)).join(''), sol: f.rows.map(p => p.map(c => c.toString(36)).join('')).join(''), u: f.u, score: f.score, hard: f.u[3] + 2 * f.u[4] + 4 * f.u[5], maxRule: f.maxRule });
    if (out.length % 5 === 0) fs.writeFileSync(__dirname + '/mice-cache/hai-' + N + '-' + first + '.json', JSON.stringify(out));
  }
  fs.writeFileSync(__dirname + '/mice-cache/hai-' + N + '-' + first + '.json', JSON.stringify(out));
  console.error(N, first, 'kept', out.length, 'hard', out.map(f => f.hard).sort((a, b) => b - a).slice(0, 10).join(' '), ((Date.now() - t0) / 1000 | 0) + 's');
}
