// generic: prints the real engine's board after each gathering of a level script's solution. node tools/c8-draw.js <script> <map rows> <row offset> [k0 k1 f1 f2]   (map row = offset - f, map col = k + 7)
const fs = require('fs'), vm = require('vm'), { execSync } = require('child_process');
const [script, nRows, off, k0 = -4, k1 = 4, fLo = 1, fHi = 8] = process.argv.slice(2);
const out = execSync('node tools/' + script + ' 5', { env: process.env, maxBuffer: 1e8 }).toString().split('\n'), map = out.slice(0, +nRows);
const steps = out.filter(l => /^\d stand/.test(l)).map(l => JSON.parse(l.split('gather (k, f) ')[1]));
const ctx = { console, map, steps, OFF: +off, K0: +k0, K1: +k1, F0: +fLo, F1: +fHi }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/ch8/engine.js', 'utf8'), ctx);
vm.runInContext(`(() => { const G = c8New({ map }), w = G.W, NL = String.fromCharCode(10), lines = [];
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  const order = cells => { for (const s of cells) { const used = new Set([s.join()]), path = [s]; const dfs = () => { if (path.length === cells.length) return true; for (const c of cells) if (!used.has(c.join()) && near(path[path.length - 1], c)) { used.add(c.join()); path.push(c); if (dfs()) return true; path.pop(); used.delete(c.join()); } return false; }; if (dfs()) return path; } return cells; };
  const show = (t, mark) => { lines.push(t); for (let f = F1; f >= F0; f--) { let row = ('f' + f).padEnd(3) + ' '; for (let k = K0; k <= K1; k++) { const i = (OFF - f) * w + k + 7, ch = G.cells[i]; let s = ch === ' ' ? (G.water[i] ? '~' : '.') : ch === '#' ? '#' : ch.toUpperCase(); if (mark && mark.has(k + ',' + f)) s = '*'; row += s + ' '; } lines.push(row); } lines.push(''); };
  for (let t = 0; t < 60; t++) c8Tick(G, 1 / 60, {}); show('start', null);
  steps.forEach((s, n) => { show('step ' + (n + 1) + ': gather the *', new Set(s.map(([k, f]) => k + ',' + f))); for (const [k, f] of order(s)) c8Reach(G, (OFF - f) * w + k + 7); const got = G.sel.length; c8Let(G); for (let t = 0; t < 5; t++) c8Tick(G, 1 / 60, {}); let m = 0; while (c8Moving(G) && m < 900) { c8Tick(G, 1 / 60, {}); m++; } for (let t = 0; t < 40; t++) c8Tick(G, 1 / 60, {}); lines.push('(' + got + ' gathered)'); });
  show('after', null); console.log(lines.join(NL)); })()`, ctx);
