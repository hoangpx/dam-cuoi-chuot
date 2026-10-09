// prints Frozen Hut's board in the real engine after each of the checker's gatherings (debug / to compare with the owner's picture)
const fs = require('fs'), vm = require('vm'), { execSync } = require('child_process');
const out = execSync('node tools/c8-hut.js 4', { env: process.env, maxBuffer: 1e8 }).toString().split('\n'), map = out.slice(0, 14);
const steps = out.filter(l => /^\d stand/.test(l)).map(l => JSON.parse(l.split('gather (k, f) ')[1]));   // [[k, f] ...] sets
const ctx = { console, map, steps }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/ch8/engine.js', 'utf8'), ctx);
vm.runInContext(`(() => { const G = c8New({ map }), w = G.W, NL = String.fromCharCode(10), lines = [];
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  const order = cells => { for (const s of cells) { const used = new Set([s.join()]), path = [s]; const dfs = () => { if (path.length === cells.length) return true; for (const c of cells) if (!used.has(c.join()) && near(path[path.length - 1], c)) { used.add(c.join()); path.push(c); if (dfs()) return true; path.pop(); used.delete(c.join()); } return false; }; if (dfs()) return path; } return cells; };
  const show = t => { lines.push(t); for (let f = 7; f >= 1; f--) { let row = 'f' + f + ' '; for (let k = 0; k <= 3; k++) row += G.cells[(12 - f) * w + k + 7] || '.'; lines.push(row.replace(/ /g, '.')); } };
  for (let k = 0; k < 60; k++) c8Tick(G, 1 / 60, {}); show('start');
  steps.forEach((s, n) => { for (const [k, f] of order(s)) c8Reach(G, (12 - f) * w + k + 7); const got = G.sel.length; c8Let(G); for (let t = 0; t < 5; t++) c8Tick(G, 1 / 60, {}); let m = 0; while (c8Moving(G) && m < 900) { c8Tick(G, 1 / 60, {}); m++; } for (let t = 0; t < 40; t++) c8Tick(G, 1 / 60, {}); show('after step ' + (n + 1) + ' (' + got + ' gathered)'); });
  console.log(lines.join(NL)); })()`, ctx);
