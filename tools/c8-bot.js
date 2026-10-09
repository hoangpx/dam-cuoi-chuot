// searches for a way to the chest in the REAL engine after some gatherings (jump timing included): node tools/c8-bot.js
const fs = require('fs'), vm = require('vm'), path = require('path');
module.exports = function play(map, steps) {
  const ctx = { console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
  if (process.env.C8SOFT !== undefined) vm.runInContext('C8_SOFT = ' + JSON.stringify(process.env.C8SOFT), ctx);
  ctx.map = map; ctx.steps = steps;
  return vm.runInContext(`(() => {
    const G0 = c8New({ map }), w = G0.W, tick = (G, inp) => c8Tick(G, 1 / 60, inp), wait = (G, n) => { for (let k = 0; k < n; k++) tick(G, {}); };
    wait(G0, 60);
    for (const s of steps) { for (const [x, y] of s) c8Reach(G0, y * w + x); c8Let(G0); wait(G0, 3); for (let k = 0; k < 600 && c8Moving(G0); k++) tick(G0, {}); wait(G0, 20); }
    const clone = G => JSON.parse(JSON.stringify(G)), key = G => Math.round(G.p.x * 3) + ',' + Math.round(G.p.y * 3);
    const seen = new Set([key(G0)]); let frontier = [{ G: G0, acts: [] }], best = null;
    for (let depth = 0; depth < 40 && frontier.length; depth++) {
      const next = [];
      for (const n of frontier) for (const dir of [1, -1]) for (let walk = 0; walk <= 36; walk += 3) for (const jump of [true, false]) {
        const G = clone(n.G); const inp = { r: dir > 0, l: dir < 0, jump: false };
        for (let k = 0; k < walk && G.state === 'play'; k++) tick(G, inp);
        if (!G.p.on) continue;
        if (jump) { inp.jump = true; tick(G, inp); inp.jump = false; }
        for (let k = 0; k < 150 && G.state === 'play'; k++) { tick(G, inp); if (G.p.on && k > 2) break; }
        for (let k = 0; k < 10 && G.state === 'play'; k++) tick(G, { r: false, l: false });
        if (G.state === 'win') return { won: true, depth: depth + 1 };
        if (G.state !== 'play' || !G.p.on) continue;
        const kk = key(G); if (seen.has(kk)) continue; seen.add(kk); next.push({ G, acts: n.acts.concat([[dir, walk, jump]]) });
        if (!best || G.p.x > best.x) best = { x: +G.p.x.toFixed(2), y: +G.p.y.toFixed(2) };
      }
      frontier = next; if (seen.size > 6000) break;
    }
    return { won: false, best, seen: seen.size };
  })()`, ctx);
};
