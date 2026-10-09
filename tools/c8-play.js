// plays a scripted solution with the REAL engine (physics included): node tools/c8-play.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
const W = 14, H = 11, g = Array.from({ length: H }, () => new Array(W).fill(' '));
for (let x = 0; x < W; x++) g[10][x] = '#'; for (let y = 5; y <= 10; y++) g[y][0] = '#';
for (let y = 2; y <= 6; y++) for (let x = 4; x <= 8; x++) g[y][x] = '#'; for (let y = 3; y <= 6; y++) g[y][9] = '#';
for (let y = 4; y <= 6; y++) for (let x = 10; x < W; x++) g[y][x] = '#'; for (let x = 10; x < W; x++) g[0][x] = '#'; for (let x = 11; x < W; x++) g[1][x] = '#';
for (let x = 0; x <= 2; x++) { g[3][x] = 'd'; g[4][x] = 'd'; } for (let y = 5; y <= 9; y++) { g[y][1] = 'a'; g[y][2] = 'a'; }
g[9][6] = 'P';
const map = ['#'.repeat(W + 2), ...g.map(r => '#' + r.join('') + '#'), '#'.repeat(W + 2)];
ctx.map = map; ctx.steps = JSON.parse(process.argv[2] || '[]');
const out = vm.runInContext(`(() => {
  const G = c8New({ map }); const w = G.W; const log = [];
  const settleWait = () => { for (let k = 0; k < 400 && c8Moving(G); k++) c8Tick(G, 1 / 60, {}); for (let k = 0; k < 60; k++) c8Tick(G, 1 / 60, {}); };
  const gather = cells => { for (const [x, y] of cells) c8Reach(G, (y + 1) * w + x + 1); const n = G.sel.length, r = c8Let(G); settleWait(); log.push('gather ' + n + ' -> ' + r); };
  // the mouse walks left: jumps whenever a wall is ahead (or a gap), until it is in the notch (col 0 of the picture = col 1 here)
  const walk = () => { let t = 0, best = 99; while (t < 40) { const p = G.p, ax = Math.floor(p.x - .45), row = Math.floor(p.y - .1);
      const wall = c8Solid(G, ax, row) || c8Solid(G, ax, row - 1); c8Tick(G, 1 / 60, { l: true, r: false, jump: p.on && wall }); t += 1 / 60; best = Math.min(best, p.y);
      if (p.x < 1.9 && p.y <= 5.01) return { reached: true, t, x: p.x, y: p.y }; } return { reached: false, x: G.p.x, y: G.p.y, best }; };
  settleWait(); for (const s of steps) gather(s); const r1 = walk(); for (let k = 0; k < 40; k++) c8Tick(G, 1 / 60, {}); r1.settled = { x: +G.p.x.toFixed(2), y: +G.p.y.toFixed(2), on: G.p.on };
  let fly = null; for (let jx = 1.4; jx <= 2.4 && !fly; jx += .02) { const C = JSON.parse(JSON.stringify(G)); C.sel = []; let t = 0, jumped = false;
    while (t < 3) { const inp = { r: true, l: false, jump: false }; if (!jumped && C.p.x >= jx) { inp.jump = true; jumped = true; } c8Tick(C, 1 / 60, inp); t += 1 / 60; if (C.p.on && C.p.x > 5.3 && C.p.y <= 3.02) { fly = { jumpedAt: +jx.toFixed(2), x: C.p.x, y: C.p.y }; break; } } }
  return { log, stairs: r1, plateau: fly };
})()`, ctx);
console.log(JSON.stringify(out));
