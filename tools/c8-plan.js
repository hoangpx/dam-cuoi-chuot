/* Chương VIII: check a level in the REAL engine with a PLAN that interleaves the mouse and the gatherings (the owner's solutions often need the mouse standing in a place when it gathers, or rocks pushed first).
   const { runPlan } = require('./c8-plan.js'); runPlan(map, plan, opt) -> { won, step, log }
   plan = array of steps:  { swipe: [[x,y],..] }                  gather these cells (drag order, map coordinates)
                           { at: [x, y] }                         search for the mouse's way to stand in this cell (on the ground)
                           { until: [[x, y, 'r'], ..] }           search (the mouse walks / pushes / jumps) until every listed cell holds that thing
                           { wait: n }                            n frames
   after the last step the search continues until the chest is reached. The search is breadth-first over input macros; its states include the whole board (so pushed rocks differ). */
const fs = require('fs'), vm = require('vm'), path = require('path');
function runPlan(map, plan, opt = {}) {
  const ctx = { console, map, plan, opt }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
  return vm.runInContext(`(() => {
    let G = c8New({ map }); const w = G.W, tick = (G, inp) => c8Tick(G, 1 / 60, inp || {}), wait = n => { for (let k = 0; k < n; k++) tick(G); };
    const clone = G => JSON.parse(JSON.stringify(G)); wait(90); const log = []; const brd = () => G.cells.join('').match(new RegExp('.{' + w + '}', 'g')).map((r, y) => r + ' ' + (y === Math.floor(G.p.y - .1) ? 'mouse x=' + G.p.x.toFixed(1) : '')).join(' | ');
    const HOLDS = [0, 1, 3, 6, 12, 25, 45], LENS = [5, 9, 14, 22, 32, 45], macros = [];
    for (const dir of [-1, 0, 1]) for (const hold of HOLDS) for (const n of LENS) if (!(dir === 0 && hold === 0) && hold <= n + 10) macros.push([dir, hold, n]);
    const key = G => Math.round(G.p.x * 4) + ',' + Math.round(G.p.y * 4) + (G.p.on ? 'g' : 'a') + '|' + G.cells.join('');
    const search = (start, goal, cap, depth) => {
      if (goal(start)) return start; const seen = new Set([key(start)]); let frontier = [start];
      for (let d = 0; d < depth && frontier.length; d++) { const next = [];
        for (const n of frontier) for (const [dir, hold, len] of macros) {
          const H = clone(n); H.hist = (n.hist || []).concat([[dir, hold, len]]); for (let k = 0; k < len && H.state === 'play'; k++) { tick(H, { r: dir > 0, l: dir < 0, jump: k < hold }); if (k % 3 === 2 && H.state === 'play' && goal(H)) return H; }
          for (let k = 0; k < 20 && H.state === 'play' && !H.p.on; k++) tick(H, { r: dir > 0, l: dir < 0, jump: false });
          if (H.state === 'dead') continue; if (goal(H)) return H; if (H.state !== 'play') continue; const kk = key(H); if (!seen.has(kk)) { seen.add(kk); next.push(H); }
          if (seen.size > cap) return null; }
        frontier = next; }
      return null; };
    const cap = opt.cap || 60000, depth = opt.depth || 80;
    for (let si = 0; si < plan.length; si++) { const s = plan[si];
      if (s.swipe) { for (let k = 0; k < 900 && c8Moving(G); k++) tick(G); let ok = true; for (const [x, y] of s.swipe) { const r = c8Reach(G, y * w + x); if (r === null && !(G.sel.length && G.sel[G.sel.length - 1] === y * w + x)) ok = false; } const n = G.sel.length, r = c8Let(G); for (let k = 0; k < 900 && c8Moving(G); k++) tick(G); wait(30); log.push({ step: si, swipe: n, r, ok }); if (!ok || r !== 'gone') return { won: false, step: si, log, why: 'swipe', board: brd() }; }
      else if (s.wait) wait(s.wait);
      else { const goal = s.at ? (g => g.p.on && Math.abs(g.p.x - (s.at[0] + .5)) < .3 && Math.abs(g.p.y - (s.at[1] + 1)) < .2) : (g => s.until.every(([x, y, ch]) => g.cells[y * w + x] === ch)); const r = search(G, goal, cap, depth); if (!r) return { won: false, step: si, log, why: 'search', board: brd() }; G = r; log.push({ step: si, found: true, hist: r.hist }); } }
    const r = search(G, g => g.state === 'win', cap, depth); return { won: !!r, step: plan.length, log, why: r ? '' : 'final search' };
  })()`, ctx);
}
module.exports = { runPlan };
