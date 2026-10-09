/* Chương VIII checker: node tools/c8-solve.js [level index…] [--show]
   For every level: can the mouse reach the chest by gathering things (shortest number of gatherings), can it pick up
   every scroll, and is there a cheap way round (reaching the chest with no gathering under a generous jump model)?
   The mouse is reduced to cells: walk, fall, step up 1 or 2, jump a 1-cell gap (the generous model also allows 2-cell
   gaps and a 2-cell hop up across a gap). Gathering may be done from anywhere. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..'), ctx = { console }; vm.createContext(ctx);
for (const f of ['js/ch8/levels.js', 'js/ch8/engine.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, f);
const LEVELS = vm.runInContext('C8_LEVELS', ctx), parse = vm.runInContext('c8Parse', ctx), settle = vm.runInContext('c8Settle', ctx);

const UP = +process.env.C8UP || 2;
const MAXLEN = +process.env.C8LEN || 14;                  // longest chain the checker tries (a smaller number is much quicker on big piles)
const GAP_MAX = +process.env.C8GAP || 3;                  // widest gap the mouse is sure to fly over (owner: it flies 4–5 cells across)                       // how many cells the mouse jumps up (owner: 2)
const SOFT = process.env.C8SOFT === undefined ? 'abco' : process.env.C8SOFT;            // kinds the mouse walks through (engine.js C8_SOFT)
const OBJ = new Set('abcdio'.split('').filter(k => !SOFT.includes(k)).concat(['#']));
function level(L, generous) {
  const P = parse(L), { W, H } = P; const wet = (x, y) => x >= 0 && x < W && y >= 0 && y < H && !!P.water[y * W + x];
  const solid = (c, x, y) => x < 0 || x >= W || y < 0 || y >= H || OBJ.has(c[y * W + x]);
  const free = (c, x, y) => !solid(c, x, y) && c[y * W + x] !== 'x';
  const ice = (c, x, y) => x >= 0 && x < W && y >= 0 && y < H && c[y * W + x] === 'i';                 // ice is deadly to touch: never stand on it, never press against it
  const stand = (c, x, y) => { while (free(c, x, y) && !solid(c, x, y + 1)) { if (wet(x, y)) return [x, y]; y++; } return free(c, x, y) && y < H && !ice(c, x, y + 1) ? [x, y] : null; };   // fall until something holds; null = thorns / out
  // The mouse jumps up 2 cells at most but flies far (owner: "4–5 cells across"): a jump over a gap of up to GAP cells (conservative 3,
  // generous 4) lands at the same height, up to 2 higher, or lower. Arc headroom: the two rows above the take-off row must be free in
  // the columns it crosses. A wall in the way is climbed (1 or 2 cells).
  function reach(c, sx, sy) {
    const seen = new Set(), q = [[sx, sy]]; seen.add(sy * W + sx);
    const add = (p) => { if (p && !seen.has(p[1] * W + p[0])) { seen.add(p[1] * W + p[0]); q.push(p); } };
    const GAP = generous ? GAP_MAX + 1 : GAP_MAX;
    while (q.length) {
      const [x, y] = q.pop();
      if (wet(x, y)) {                                                                  // swimming: anywhere in the water, and out onto a ledge up to 2 above
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (wet(x + dx, y + dy) && free(c, x + dx, y + dy)) add([x + dx, y + dy]);
        for (let dx = -1; dx <= 1; dx++) for (let ty = y - 2; ty <= y; ty++) if (free(c, x + dx, ty) && solid(c, x + dx, ty + 1) && !ice(c, x + dx, ty + 1)) add([x + dx, ty]);
        for (const dx of [-1, 1]) if (free(c, x + dx, y) && !wet(x + dx, y)) add(stand(c, x + dx, y));
      }
      for (const d of [-1, 1]) {
        const nx = x + d;
        if (free(c, nx, y)) {
          add(stand(c, nx, y)); if (wet(nx, y)) add([nx, y]);
          if (!solid(c, nx, y + 1) || ice(c, nx, y + 1)) {                                // a gap (or an ice floor): fly over it
            for (let dist = 2; dist <= GAP + 1; dist++) {
              const tx = x + d * dist; let clear = free(c, x, y - 1);
              for (let j = 1; j < dist && clear; j++) if (!free(c, x + d * j, y - 1) || !free(c, x + d * j, y - 2)) clear = false;
              if (!clear) break;
              for (let ty = y - UP; ty <= y + 6; ty++) {
                if (!free(c, tx, ty) || !solid(c, tx, ty + 1) || ice(c, tx, ty + 1)) continue;
                let ok = true; for (let r = Math.min(ty, y - 1); r <= ty; r++) if (!free(c, tx, r)) ok = false;
                if (ok) add([tx, ty]);
              }
            }
          }
        } else {                                                                          // a wall: climb 1 or 2 cells
          for (let h = 1; h <= UP; h++) {
            let ok = free(c, nx, y - h) && solid(c, nx, y - h + 1) && !ice(c, nx, y - h + 1);
            for (let r = 1; r <= h; r++) if (!free(c, x, y - r)) ok = false;
            if (ok) { add([nx, y - h]); break; }
          }
        }
      }
    }
    return seen;
  }
  return { P, W, H, solid, free, stand, reach };
}
function chains(c, W, H) {                                     // vertex sets of simple paths of 3+ same-kind neighbours
  const out = new Map(), nb = i => { const x = i % W, y = (i / W) | 0, r = []; if (x > 0) r.push(i - 1); if (x < W - 1) r.push(i + 1); if (y > 0) r.push(i - W); if (y < H - 1) r.push(i + W); return r; };
  for (let s = 0; s < c.length; s++) {
    const k = c[s]; if (!'abcdi'.includes(k) || k === ' ') continue;
    const path = [s], dfs = () => {
      if (path.length >= 3) { const key = path.slice().sort((a, b) => a - b).join(','); if (!out.has(key)) out.set(key, path.slice().sort((a, b) => a - b)); }
      if (path.length >= MAXLEN) return;
      for (const n of nb(path[path.length - 1])) if ((c[n] === k || (process.env.C8ANY && 'abcdi'.includes(c[n])) || (process.env.C8MIX && ((k === 'i' && c[n] === 'a') || (k === 'a' && c[n] === 'i')))) && !path.includes(n)) { path.push(n); dfs(); path.pop(); }
    };
    dfs();
  }
  return [...out.values()];
}
// everything falls ONE CELL AT A TIME, the mouse too (bottom row first): the mouse falls whenever the cell below it is free for it (so it rides down
// on what it stands on, as in the owner's Elevator), and a SOLID thing (clod, ice) that falls into the mouse's cell CRUSHES it (owner: "đất rơi xuống
// đầu là đè chết luôn"). null = the mouse died (crushed, or fell onto thorns / ice).
function settleMouse(c, W, H, q) {
  let [qx, qy] = q; const soft = k => SOFT.includes(k), isObj = k => 'abcdio'.includes(k) && k !== ' ';
  for (let guard = 0; guard < 400; guard++) {
    let moved = false;
    for (let y = H - 2; y >= 0; y--) for (let x = 0; x < W; x++) {
      if (x === qx && y === qy) {                                                       // the mouse's turn
        const below = c[(y + 1) * W + x];
        if (below === 'x' || below === 'i') return null;
        if (!OBJ.has(below)) { qy++; moved = true; }
      }
      const i = y * W + x, ch = c[i]; if (!isObj(ch)) continue;
      if (c[i + W] === ' ') {
        if (x === qx && y + 1 === qy && !soft(ch)) return null;                         // a clod or ice falls onto the mouse
        c[i + W] = ch; c[i] = ' '; moved = true;
      }
    }
    if (!moved) break;
  }
  const below = qy + 1 < H ? c[(qy + 1) * W + qx] : '#';
  return below === 'x' || below === 'i' || c[qy * W + qx] === 'x' ? null : [qx, qy];
}
const FREEZE = +process.env.C8FREEZE || 0, FROZEN = process.env.C8FROZEN || 'a';                           // the kind that freezes (the owner's "lá": flames?)
function freezeCells(c, W, H) {
  if (!FREEZE) return;
  for (let guard = 0; guard < 60; guard++) {
    const turn = [];
    for (let i = 0; i < c.length; i++) if (FROZEN.includes(c[i]) && c[i] !== ' ') { const x = i % W, y = (i / W) | 0; if ((x > 0 && c[i - 1] === 'i') || (x < W - 1 && c[i + 1] === 'i') || (y > 0 && c[i - W] === 'i') || (y < H - 1 && c[i + W] === 'i')) turn.push(i); }
    if (!turn.length) return; for (const i of turn) c[i] = 'i'; if (FREEZE === 2) return;
  }
}
function solve(L, opts = {}) {
  const env = level(L, false), { P, W, H } = env, c0 = P.cells.slice(); settle(c0, W, H);
  const goal = P.goal.y * W + P.goal.x, scr = P.scrolls.map(s => s.y * W + s.x);
  const s0 = env.stand(c0, P.start.x, P.start.y); if (!s0) return { error: 'the start falls into thorns' };
  const gen = level(L, true);
  const gr = gen.reach(c0, s0[0], s0[1]);
  const res = { cheat: gr.has(goal), minMoves: null, allScrolls: null, path: null, states: 0, noMatchReach: env.reach(c0, s0[0], s0[1]).has(goal) };
  const maskOf = R => { let m = 0; scr.forEach((s, k) => { if (R.has(s)) m |= 1 << k; }); return m; };
  const full = (1 << scr.length) - 1;
  const key = (c, q, m) => c.join('') + '|' + q + '|' + m;
  let layer = [{ c: c0, q: s0, m: 0, path: [] }], seen = new Set(), depth = 0;
  { const R = env.reach(c0, s0[0], s0[1]); layer[0].R = R; layer[0].m = maskOf(R); }
  seen.add(key(c0, s0[1] * W + s0[0], layer[0].m));
  let bestScroll = layer[0].m === full && R0win(layer[0]);
  function R0win(n) { return n.R.has(goal); }
  if (R0win(layer[0])) { res.minMoves = 0; res.path = []; }
  while (layer.length && depth < (opts.maxDepth ?? 7)) {
    depth++; const next = [];
    for (const n of layer) {
      const sets = chains(n.c, W, H);
      for (const idx of (opts.fixedQ ? [s0[1] * W + s0[0]] : n.R)) {                                           // where the mouse stands when it gathers
        const qx = idx % W, qy = (idx / W) | 0;
        for (const S of sets) {
          const c2 = n.c.slice(); for (const i of S) c2[i] = ' ';
          let q2 = settleMouse(c2, W, H, [qx, qy]); if (!q2) continue;
          if (FREEZE) { freezeCells(c2, W, H); if (c2[q2[1] * W + q2[0]] === 'i') continue; q2 = settleMouse(c2, W, H, q2); if (!q2) continue; }
          let m = n.m; const k2 = key(c2, q2[1] * W + q2[0], 0);
          const R = env.reach(c2, q2[0], q2[1]); m |= maskOf(R);
          const kk = key(c2, q2[1] * W + q2[0], m); if (seen.has(kk)) continue; seen.add(kk); res.states++;
          const node = { c: c2, q: q2, m, R, path: n.path.concat([{ from: [qx, qy], cells: S.map(i => [i % W, (i / W) | 0]) }]) };
          if (R.has(goal)) { if (res.minMoves === null) { res.minMoves = depth; res.path = node.path; } if (m === full) res.allScrolls = res.allScrolls === null ? depth : Math.min(res.allScrolls, depth); }
          if (res.states > (opts.cap || 400000)) { res.capped = true; return res; }
          next.push(node);
        }
      }
    }
    layer = next;
  }
  if (scr.length === 0) res.allScrolls = res.minMoves;
  return res;
}
module.exports = { solve, LEVELS, level, chains, settle, settleMouse, parse };
if (require.main === module) {
  const args = process.argv.slice(2), show = args.includes('--show'), idx = args.filter(a => /^\d+$/.test(a)).map(Number);
  LEVELS.forEach((L, i) => {
    if (idx.length && !idx.includes(i + 1)) return;
    const t = Date.now(), r = solve(L);
    const flag = r.error ? 'ERROR ' + r.error : r.minMoves === null ? 'UNSOLVABLE' : 'ok';
    console.log(`${String(i + 1).padStart(2)} ${L.name.padEnd(22)} ${flag}  moves=${r.minMoves}  scrolls=${r.allScrolls === null ? 'not all' : 'all in ' + r.allScrolls}  cheat=${r.cheat}  states=${r.states}${r.capped ? ' (capped)' : ''}  ${Date.now() - t}ms`);
    if (show && r.path) r.path.forEach((p, k) => console.log(`     ${k + 1}. gather ${JSON.stringify(p.cells)} while standing at ${JSON.stringify(p.from)}`));
  });
}
