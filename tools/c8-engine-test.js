/* Chương VIII: run gatherings and a search for the mouse's way in the REAL engine (js/ch8/engine.js).
   const { run } = require('./c8-engine-test.js'); run(map, steps) with steps = [[[x,y],[x,y],..], ..] (swipes in map coordinates), returns { won, frames, log } */
const fs = require('fs'), vm = require('vm'), path = require('path');
function run(map, steps, opt = {}) {
  const ctx = { console, map, steps, opt }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
  return vm.runInContext(`(() => {
    const G = c8New({ map }), w = G.W, tick = (G, inp) => c8Tick(G, 1 / 60, inp || {}), wait = n => { for (let k = 0; k < n; k++) tick(G); };
    wait(90); const log = [];
    for (const s of steps) {
      let ok = true; for (const [x, y] of s) { const r = c8Reach(G, y * w + x); if (r === null && !(G.sel.length && G.sel[G.sel.length - 1] === y * w + x)) ok = false; }
      const n = G.sel.length, r = c8Let(G); for (let k = 0; k < 900 && c8Moving(G); k++) tick(G); wait(30); log.push({ n, r, ok });
    }
    const clone = G => JSON.parse(JSON.stringify(G)), key = G => Math.round(G.p.x * 4) + ',' + Math.round(G.p.y * 4) + (G.p.on ? 'g' : 'a');
    const macros = []; const HOLDS = opt.fine ? [0, 1, 3, 6, 12, 25, 45] : [0, 2, 10, 40], LENS = opt.fine ? [5, 9, 14, 22, 32, 45] : [8, 20, 40]; for (const dir of [-1, 0, 1]) for (const hold of HOLDS) for (const n of LENS) if (!(dir === 0 && hold === 0) && hold <= n + 10) macros.push([dir, hold, n]);
    G.trail = [[+G.p.x.toFixed(2), +G.p.y.toFixed(2)]]; G.hist = []; const seen = new Set([key(G)]); let frontier = [G], won = false, wonLog = null, steps2 = 0, trail = null, ctxHist = null;
    for (let d = 0; d < (opt.depth || 60) && frontier.length && !won; d++) { const next = [];
      for (const n of frontier) for (const [dir, hold, len] of macros) {
        const H = clone(n); H.hist.push([dir, hold, len]); for (let k = 0; k < len && H.state === 'play'; k++) { tick(H, { r: dir > 0, l: dir < 0, jump: k < hold }); if (k % 6 === 5) H.trail.push([+H.p.x.toFixed(1), +H.p.y.toFixed(1)]); }
        for (let k = 0; k < 20 && H.state === 'play' && !H.p.on; k++) tick(H, { r: dir > 0, l: dir < 0, jump: false });
        if (H.state === 'win') { won = true; wonLog = d + 1; trail = H.trail; ctxHist = H.hist; break; } if (H.state !== 'play') continue; const kk = key(H); if (!seen.has(kk)) { seen.add(kk); next.push(H); } }
      frontier = next; steps2 = d + 1; if (seen.size > (opt.cap || 40000)) break; }
    return { won, depth: wonLog, seen: seen.size, log, finalCells: G.cells.join(''), trail, macros: ctxHist };
  })()`, ctx);
}
module.exports = { run };
