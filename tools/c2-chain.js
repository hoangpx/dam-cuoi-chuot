/* Chương II: check each map's hint chain (C2_CHAIN) is a real road (owner: the hint must name every rule to make or break).
   "Ghép X" = rule X must appear, "Phá X" = rule X must go, in that order; other steps are free words. A BFS (state + how far
   along the chain) looks for a win that follows the chain and wins with the chain's last rule standing.
   Usage: node --max-old-space-size=8000 tools/c2-chain.js [index ...] [--cap N] */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const src = ['js/ch2/levels.js', 'js/ch2/engine.js', 'js/ch2/solver.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const tmp = path.join(require('os').tmpdir(), 'c2c-' + process.pid + '.js');
fs.writeFileSync(tmp, src + '\nmodule.exports = { C2LEVELS, C2_CHAIN, c2Parse, c2Settle, c2Step, c2Snap, c2StKey, C2_DIRS, C2K, C2P };'); const E = require(tmp); fs.unlinkSync(tmp);
const args = process.argv.slice(2), capI = args.indexOf('--cap'), cap = capI >= 0 ? +args[capI + 1] : 2e6;
const which = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--cap').map(Number);
const txt = r => `${E.C2K[r.a].vi} ${r.verb === 'has' ? 'CÓ' : 'LÀ'} ${r.neg ? 'KHÔNG ' : ''}${r.prop ? E.C2P[r.prop].vi : E.C2K[r.to].vi}`;
const rs = st => new Set(st.rules.map(txt));
let bad = 0;
E.C2LEVELS.forEach((L, i) => {
  if (which.length && !which.includes(i)) return;
  // "A VÀ B LÀ X" stands for A LÀ X and B LÀ X, made by one push
  const steps = E.C2_CHAIN[i].split('→').map(s => s.trim()).flatMap(s => {
    const m = s.match(/^(ghép|phá)\s+(.+)$/i); if (!m) return [];
    const op = m[1].toLowerCase() === 'phá' ? '-' : '+', r = m[2].replace(/\s*\(.*\)$/, '').trim(), v = r.match(/^(.+?) (LÀ|CÓ) (.+)$/);
    return v ? v[1].split(' VÀ ').map(n => ({ op, r: n + ' ' + v[2] + ' ' + v[3] })) : [{ op, r }];
  });
  // at the win, every rule the chain names stands or not as its last step left it
  const finalOk = after => { const lastOp = {}; for (const s of steps) lastOp[s.r] = s.op; return Object.entries(lastOp).every(([r, op]) => (op === '+') === after.has(r)); };
  const adv = (k, before, after) => { while (k < steps.length) { const s = steps[k]; const ok = s.op === '+' ? after.has(s.r) : before.has(s.r) && !after.has(s.r); if (ok) k++; else break; } return k; };
  const st0 = E.c2Parse(L); E.c2Settle(st0); let k0 = 0; { const r0 = rs(st0); while (k0 < steps.length && steps[k0].op === '+' && r0.has(steps[k0].r)) k0++; }
  const seen = new Set([E.c2StKey(st0) + '#' + k0]); let front = [{ st: E.c2Snap(st0), k: k0, m: '' }], n = 0, found = null;
  while (front.length && !found && n < cap) {
    const next = [];
    for (const f of front) { if (found) break; for (const d in E.C2_DIRS) {
      const before = rs(f.st), st = E.c2Snap(f.st); if (!E.c2Step(st, ...E.C2_DIRS[d])) continue;
      const after = rs(st), k = adv(f.k, before, after);
      if (st.won) { if (k === steps.length && finalOk(after)) { found = f.m + d; break; } continue; }
      if (st.dead) continue;
      const key = E.c2StKey(st) + '#' + k; if (seen.has(key)) continue; seen.add(key); n++;
      next.push({ st, k, m: f.m + d });
    } }
    front = next;
  }
  console.log(`${i + 1}. ${L.name}: ${found ? 'OK ' + found.length + ' bước' : 'KHÔNG ĐI ĐƯỢC THEO CHUỖI' + (n >= cap ? ' (hết cap)' : '')} · ${E.C2_CHAIN[i]}`);
  if (!found) bad++;
});
process.exitCode = bad ? 1 : 0;
