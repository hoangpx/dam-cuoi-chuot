/* Chương VIII: a joint search in the REAL engine for the mouse and the gatherings together (for levels whose solution needs the mouse to stand in a place while it gathers).
   node tools/c8-joint.js <level index> [maxSwipes]   (env CELLS = x0,x1 limit of the standing cells considered, PATH = longest chain (default 3), CAP = states per layer)
   Layer k = the boards after k gatherings. From each board the mouse's reachable standing cells are found (breadth-first over input macros, one representative per standing cell); from each of those every gathering the model lists is tried. Prints the first sequence that leads to the chest as a plan for tools/c8-plan.js. */
process.env.NOMIRROR = '1'; process.env.NOCARVE = process.env.NOCARVE || '1';
const fs = require('fs'), vm = require('vm'), path = require('path'), L = require('./c8-ref-levels.js'), { parseMap, makeModel } = require('./c8-model.js');
const lv = L[+process.argv[2] - 1], maxSw = +(process.argv[3] || 4), PATH = +(process.env.PATH_LEN || 3), CAP = +(process.env.CAP || 4000);
const ctx = { console, map: lv.map }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
vm.runInContext(`
  var G0 = c8New({ map }); for (let k = 0; k < 90; k++) c8Tick(G0, 1 / 60, {});
  var clone = G => JSON.parse(JSON.stringify(G)), tick = (G, inp) => c8Tick(G, 1 / 60, inp || {});
  var macros = []; for (const dir of [-1, 0, 1]) for (const hold of [0, 8, 30]) for (const n of [10, 24, 45]) if (!(dir === 0 && hold === 0) && hold <= n + 10) macros.push([dir, hold, n]);
  var stand = G => Math.floor(G.p.x) + ',' + Math.floor(G.p.y - .05) + (G.p.on ? '' : 'a');
  var ckey = G => G.cells.join('');
  // every standing cell the mouse can reach from G: one representative board each (and a flag when the chest was reached)
  var reach = (G, cap) => { const reps = new Map(), seen = new Set(), q = [G]; seen.add(Math.round(G.p.x * 4) + ',' + Math.round(G.p.y * 4)); reps.set(stand(G), G); let won = null;
    while (q.length && reps.size < cap) { const n = q.shift(); for (const [dir, hold, len] of macros) { const H = clone(n); for (let k = 0; k < len && H.state === 'play'; k++) tick(H, { r: dir > 0, l: dir < 0, jump: k < hold }); for (let k = 0; k < 20 && H.state === 'play' && !H.p.on; k++) tick(H, { r: dir > 0, l: dir < 0, jump: false });
      if (H.state === 'win') { won = H; return { reps, won }; } if (H.state !== 'play') continue; const kk = Math.round(H.p.x * 4) + ',' + Math.round(H.p.y * 4) + (H.p.on ? 'g' : 'a'); if (seen.has(kk)) continue; seen.add(kk); const sk = stand(H); if (H.p.on && !reps.has(sk)) reps.set(sk, H); q.push(H); } }
    return { reps, won }; };
  var swipe = (G, cells) => { const H = clone(G), w = H.W; for (const [x, y] of cells) c8Reach(H, y * w + x); const r = c8Let(H); if (r !== 'gone') return null; for (let k = 0; k < 900 && c8Moving(H); k++) tick(H); for (let k = 0; k < 20; k++) tick(H); return H.state === 'play' ? H : null; };
`, ctx);
const chainsOf = cells => { const rows = []; const W = ctx.G0.W, H = ctx.G0.H; const g = Array.from({ length: H }, () => new Array(W).fill(' ')); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = cells[y * W + x]; g[H - 1 - y][x] = 'aibvcdor#'.includes(c) ? c : ' '; }
  const M = makeModel(W, H, PATH); return M.chains(g).filter(p => 'aibvcdr'.includes(g[p[0][1]][p[0][0]])).map(p => p.map(([x, r]) => [x, H - 1 - r])); };
let layer = [{ G: ctx.G0, path: [] }]; const seenAll = new Set();
for (let d = 0; d <= maxSw; d++) {
  const next = []; let t0 = Date.now();
  for (const { G, path: pth } of layer) {
    ctx.cur = G; const R = vm.runInContext('(() => { const r = reach(cur, 40); return { won: !!r.won, reps: [...r.reps.entries()].map(([k, v]) => [k, v]) }; })()', ctx);
    if (R.won) { console.log('FOUND with', d, 'gatherings:'); console.log(JSON.stringify(pth.map(s => ({ at: s.at, swipe: s.cells })))); process.exit(0); }
    if (d === maxSw) continue;
    for (const [sk, rep] of R.reps) { const [sx, sy] = sk.replace('a', '').split(',').map(Number); if (process.env.CELLS) { const [a, b] = process.env.CELLS.split(',').map(Number); if (sx < a || sx > b) continue; }
      for (const cells of chainsOf(rep.cells)) { ctx.cur = rep; ctx.cl = cells; const H = vm.runInContext('swipe(cur, cl)', ctx); if (!H) continue; const key = H.cells.join('') + '|' + Math.floor(H.p.x) + ',' + Math.floor(H.p.y); if (seenAll.has(key)) continue; seenAll.add(key); next.push({ G: H, path: pth.concat([{ at: [sx, sy], cells }]) }); } }
    if (next.length > CAP * 4) break;
  }
  console.log('layer', d, '->', next.length, 'boards', Math.round((Date.now() - t0) / 1000) + 's'); layer = next.slice(0, CAP);
}
console.log('no solution found within', maxSw, 'gatherings');
