// real-engine search from a position (no gathering): can the mouse win / how many scrolls can it take? node tools/c8-explore.js map.json
const fs = require('fs'), vm = require('vm'), path = require('path');
const map = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const ctx = { console, map }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
console.log(JSON.stringify(vm.runInContext(`(() => {
  const G0 = c8New({ map }); for (let k = 0; k < 90; k++) c8Tick(G0, 1 / 60, {});
  const clone = G => JSON.parse(JSON.stringify(G)), key = G => Math.round(G.p.x * 3) + ',' + Math.round(G.p.y * 3) + ',' + G.got, t = (G, i) => c8Tick(G, 1 / 60, i);
  const seen = new Set([key(G0)]); let frontier = [G0], won = false, maxGot = 0, winDepth = null;
  for (let d = 0; d < 60 && frontier.length; d++) { const next = [];
    for (const n of frontier) for (const dir of [1, -1]) for (let walk = 0; walk <= 36; walk += 3) for (const jump of [true, false]) {
      const H = clone(n), inp = { r: dir > 0, l: dir < 0, jump: false };
      for (let k = 0; k < walk && H.state === 'play'; k++) t(H, inp); if (!H.p.on && H.state === 'play') continue;
      if (jump) { inp.jump = true; t(H, inp); inp.jump = false; } for (let k = 0; k < 150 && H.state === 'play'; k++) { t(H, inp); if (H.p.on && k > 2) break; } for (let k = 0; k < 10 && H.state === 'play'; k++) t(H, {});
      maxGot = Math.max(maxGot, H.got); if (H.state === 'win') { if (!won) winDepth = d + 1; won = true; continue; } if (H.state !== 'play' || !H.p.on) continue; const kk = key(H); if (!seen.has(kk)) { seen.add(kk); next.push(H); } }
    frontier = next; if (seen.size > 20000) break; }
  return { won, winDepth, scrolls: maxGot + '/' + G0.nScroll, states: seen.size };
})()`, ctx)));
