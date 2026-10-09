// ASCII pictures of Broken Ladder after each gathering (real engine); the cells about to be eaten are drawn as *
const fs = require('fs'), vm = require('vm'), { execSync } = require('child_process');
const out = execSync('node tools/c8-ladder.js 3', { env: Object.assign({}, process.env, { C8LEN: '8', FIXEDQ: '1' }), maxBuffer: 1e8 }).toString().split('\n'), map = out.slice(0, 15);
const steps = out.filter(l => /^\d stand/.test(l)).map(l => JSON.parse(l.split('gather (k, f) ')[1]));
const ctx = { console, map, steps }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/ch8/engine.js', 'utf8'), ctx);
vm.runInContext(`(() => { const G = c8New({ map }), w = G.W, NL = String.fromCharCode(10), lines = [];
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  const order = cells => { for (const s of cells) { const used = new Set([s.join()]), path = [s]; const dfs = () => { if (path.length === cells.length) return true; for (const c of cells) if (!used.has(c.join()) && near(path[path.length - 1], c)) { used.add(c.join()); path.push(c); if (dfs()) return true; path.pop(); used.delete(c.join()); } return false; }; if (dfs()) return path; } return cells; };
  const sym = { i: 'I', d: 'D', '#': '#', ' ': '.', o: 'o', a: 'a', b: 'b', c: 'c' };
  const show = (t, mark) => { lines.push(t); for (let f = 8; f >= 0; f--) { let row = ('f' + f).padEnd(3) + ' '; for (let k = -6; k <= 6; k++) { const i = (13 - f) * w + k + 7; let ch = f === 0 ? '=' : (G.cells[i] === ' ' ? (G.water[i] ? '~' : '.') : sym[G.cells[i]] || G.cells[i]); if (mark && mark.has(k + ',' + f)) ch = '*'; if (f === 1 && k === 5 && G.p.x > 11.5) ch = G.cells[i] === ' ' ? 'P' : ch; if (f === 5 && k === -3 && G.cells[i] === ' ') ch = 'G'; row += ch + ' '; } lines.push(row); } lines.push(''); };
  for (let t = 0; t < 60; t++) c8Tick(G, 1 / 60, {});
  show('Ban dau', null);
  steps.forEach((s, n) => { show('Buoc ' + (n + 1) + ': an cac o *', new Set(s.map(([k, f]) => k + ',' + f))); for (const [k, f] of order(s)) c8Reach(G, (13 - f) * w + k + 7); c8Let(G); for (let t = 0; t < 5; t++) c8Tick(G, 1 / 60, {}); let m = 0; while (c8Moving(G) && m < 900) { c8Tick(G, 1 / 60, {}); m++; } for (let t = 0; t < 40; t++) c8Tick(G, 1 / 60, {}); });
  show('Sau 3 lan an', null);
  console.log(lines.join(NL)); })()`, ctx);
