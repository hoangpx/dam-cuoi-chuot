// Elevator with the owner's solution in the REAL engine: 3 spirals, walk into the shaft, 3 spirals, 3 clods (C8_SOFT = 'bo')
const fs = require('fs'), vm = require('vm'), path = require('path');
const W = 16, H = 12, g = Array.from({ length: H }, () => new Array(W).fill(' '));
const S = (k, r) => g[r + 1][k + 6] = '#', rows = (k, r0, r1) => { for (let r = r0; r <= r1; r++) S(k, r); };
for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; } for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
for (let k = -5; k <= -1; k++) rows(k, 5, 9); rows(-1, 0, 2); rows(0, 9, 9);
rows(1, 0, 7); rows(2, 0, 7); rows(1, 9, 9); rows(2, 9, 9); rows(3, 0, 2); rows(3, 9, 9); rows(4, 0, 2); rows(4, 7, 9);
for (let k = 5; k <= 9; k++) { rows(k, 0, 2); rows(k, 5, 9); }
const put = (k, rs, ch) => rs.forEach(r => { g[r + 1][k + 6] = ch; });
put(0, [0, 2], 'd'); put(0, [1], 'o'); put(0, [3, 4, 5, 6, 7, 8], 'b'); put(1, [8], 'd'); put(2, [8], 'd');
g[5][3] = 'P'; g[5][12] = 'G';
const ctx = { console, map: g.map(r => r.join('')) }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8') + '\nC8_SOFT = "bo";', ctx);
console.log(JSON.stringify(vm.runInContext(`(() => {
  const G = c8New({ map }), w = G.W, log = [];
  const tick = inp => c8Tick(G, 1 / 60, inp || {}), wait = n => { for (let k = 0; k < n; k++) tick(); };
  const calm = () => { wait(3); for (let k = 0; k < 900 && c8Moving(G); k++) tick(); wait(40); };
  const gather = cells => { for (const [k, r] of cells) c8Reach(G, (r + 1) * w + k + 6); const n = G.sel.length; c8Let(G); calm(); log.push('gathered ' + n); };
  const where = () => ({ x: +(G.p.x - 6).toFixed(2), y: +(G.p.y - 1).toFixed(2) });
  wait(60);
  gather([[0, 3], [0, 4], [0, 5]]);
  for (let k = 0; k < 120 && G.p.x < 6.55; k++) tick({ r: true });                    // walk right into the shaft
  wait(60); log.push('in shaft ' + JSON.stringify(where()));
  gather([[0, 6], [0, 7], [0, 8]]); log.push('after 2nd ' + JSON.stringify(where()));
  gather([[0, 8], [1, 8], [2, 8]]); log.push('after 3rd ' + JSON.stringify(where()));
  let t = 0; const dirs = []; while (t < 20 && G.state === 'play') { const p = G.p, row = Math.floor(p.y - .1), wall = c8Solid(G, Math.floor(p.x + .4), row) || c8Solid(G, Math.floor(p.x + .4), row - 1), ahead = Math.floor(p.x + .5), edge = p.on && !c8Solid(G, ahead, row + 1) && !c8Solid(G, Math.floor(p.x), row + 1); tick({ r: true, jump: p.on && (wall || edge) }); t += 1 / 60; }
  return { log, state: G.state, end: where(), t: +t.toFixed(1) };
})()`, ctx)));
