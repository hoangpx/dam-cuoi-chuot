/* Replays a checker solution in the REAL engine: the mouse walks to the column it stood in, gathers, waits for everything to settle, and after
   the last gathering a small search (walk / jump timing) looks for a way to the chest. node tools/c8-replay.js <file with a map array> or used as a module. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const { solve } = require('./c8-solve.js');
// the checker returns a SET of cells; a finger needs them in the order of a path (neighbour to neighbour)
function pathOrder(cells) {
  const key = c => c[0] + ',' + c[1], near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  for (const start of cells) { const used = new Set([key(start)]), path = [start];
    const dfs = () => { if (path.length === cells.length) return true; for (const c of cells) if (!used.has(key(c)) && near(path[path.length - 1], c)) { used.add(key(c)); path.push(c); if (dfs()) return true; path.pop(); used.delete(key(c)); } return false; };
    if (dfs()) return path; }
  return cells;
}
module.exports = function replay(map) {
  const r = solve({ map }, { maxDepth: 5, cap: 200000 }); if (r.minMoves === null) return { solved: false };
  const ctx = { console, map, steps: r.path.map(p => ({ from: p.from, cells: pathOrder(p.cells) })) }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
  const out = vm.runInContext(`(() => {
    const G = c8New({ map }), w = G.W, tick = inp => c8Tick(G, 1 / 60, inp || {}), wait = n => { for (let k = 0; k < n; k++) tick(); };
    wait(60);
    const walkTo = tx => { for (let k = 0; k < 600; k++) { const p = G.p, dx = tx - p.x; if (Math.abs(dx) < .12 && p.on) return true; const row = Math.floor(p.y - .1), dir = dx > 0 ? 1 : -1, wall = c8Solid(G, Math.floor(p.x + dir * .4), row) || c8Solid(G, Math.floor(p.x + dir * .4), row - 1); tick({ r: dx > 0, l: dx < 0, jump: p.on && wall }); } return false; };
    const log = [];
    for (const s of steps) {
      const ok = walkTo(s.from[0] + .5); wait(30);
      for (const [x, y] of s.cells) c8Reach(G, y * w + x); const n = G.sel.length; c8Let(G); wait(3); for (let k = 0; k < 900 && c8Moving(G); k++) tick(); wait(40);
      log.push({ at: [+(G.p.x - .5).toFixed(2), +(G.p.y - 1).toFixed(2)], wanted: s.from, arrived: ok, gathered: n });
    }
    const clone = G => JSON.parse(JSON.stringify(G)), key = G => Math.round(G.p.x * 3) + ',' + Math.round(G.p.y * 3), t = (G, i) => c8Tick(G, 1 / 60, i);
    const seen = new Set([key(G)]); let frontier = [G], won = false;
    for (let d = 0; d < 40 && frontier.length && !won; d++) { const next = [];
      for (const n of frontier) for (const dir of [1, -1]) for (let walk = 0; walk <= 36; walk += 3) for (const jump of [true, false]) {
        const H = clone(n), inp = { r: dir > 0, l: dir < 0, jump: false };
        for (let k = 0; k < walk && H.state === 'play'; k++) t(H, inp); if (!H.p.on) continue;
        if (jump) { inp.jump = true; t(H, inp); inp.jump = false; } for (let k = 0; k < 150 && H.state === 'play'; k++) { t(H, inp); if (H.p.on && k > 2) break; } for (let k = 0; k < 10 && H.state === 'play'; k++) t(H, {});
        if (H.state === 'win') { won = true; break; } if (H.state !== 'play' || !H.p.on) continue; const kk = key(H); if (!seen.has(kk)) { seen.add(kk); next.push(H); } }
      frontier = next; if (seen.size > 6000) break; }
    return { log, won };
  })()`, ctx);
  return { solved: true, moves: r.minMoves, ...out };
};
if (require.main === module) {
  const maps = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  maps.forEach((m, i) => console.log(i + 1, JSON.stringify(module.exports(m))));
}
