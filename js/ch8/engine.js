/* Chương VIII · Gom Ba Mở Lối 三 — the rules, with no drawing and no DOM (tools/c8-solve.js loads this file in node).
   A level is a grid of characters (levels.js):  # earth (never moves)   a b c d  things that can be gathered (d is a clod of
   earth: it is gathered with other clods like the rest)   o  a peg: falls like the rest, things rest on it, the mouse walks through it, it cannot be gathered (the owner's dim dashed circle)   S  a picture
   scroll to pick up   x  thorny water (touching it starts the level again; things rest on it)   G  the chest (exit)
   v  a water thing (owner: Freezing Tip etc.): the mouse swims in it, it falls like the rest, holds things up, is gathered with other water (3 or more); ice melts into one when a chain of flames ends right behind it (the swipe's last step points at the ice)
   r  a ROCK (owner, 2026-10-09, from the reference): solid like a clod, falls, is gathered with 3 or more rocks, and the mouse PUSHES it one cell sideways (walking into it for a moment) when the cell beyond is empty, or swaps it with a flame (a) or a dashed spiral (o) there; two rocks side by side cannot be pushed
   w  water (the mouse swims: hold jump to go up, it sinks slowly otherwise, ← → slower; a things falls through it)
   P  where the mouse starts.
   Rules: drag a finger over 3 or more neighbouring (up/down/left/right) things of the same kind and let go: they vanish
   and whatever is above falls. Only clods (d) block the mouse like earth; everything else (C8_SOFT) it walks through, but those still hold up what lies on them. The mouse walks, jumps two cells up (not three) and over
   a one-cell gap (not two). Gathering works from anywhere on the screen. */

// body in cells. The mouse jumps up 2 cells (apex 2.2) and flies over a gap of 3 cells (4–5 across) (owner: it only jumps 2 cells high but flies 4–5 cells across)
const C8_PW = .5, C8_PH = .78, C8_GRAV = 20, C8_JV = 9.4, C8_SPEED = 4.4, C8_FALL = 26, C8_HOP = 11.2;
let C8_AIR = 6.8;   // C8_AIR (below): sideways speed in the air (owner: it flies 7 cells, from the cell it stands on to the cell it lands on, on the same level)   // C8_HOP: the hop out of water (the feet start .4-.9 below the surface, so it climbs 2 cells above it, not 3)
const C8_KINDS = 'abcdivr';                                                          // i = ice (owner, Frigid Well): solid like a clod, falls, gathered like the rest, and DEADLY TO TOUCH ("băng ko thể chạm vào")
let C8_SOFT = 'abcov';                                                                // kinds the mouse walks THROUGH (owner: flames and spirals and pegs let it through, only clods stop it); they still hold up what lies on them
const c8Obj = ch => ch === 'r' || ch === 'a' || ch === 'b' || ch === 'c' || ch === 'd' || ch === 'i' || ch === 'o' || ch === 'v';   // falls (o, the peg, too: it cannot be gathered)

function c8Parse(L) {
  const rows = L.map, H = rows.length, W = Math.max(...rows.map(r => r.length));
  const cells = new Array(W * H).fill(' ');
  let start = { x: 1, y: 1 }, goal = { x: W - 2, y: H - 2 }, scrolls = []; const water = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let ch = rows[y][x] || ' ';
    if (ch === 'P') { start = { x, y }; ch = ' '; }
    else if (ch === 'G') goal = { x, y };
    else if (ch === 'S') scrolls.push({ x, y });
    else if (ch === 'w') { water[y * W + x] = 1; ch = ' '; }                                     // w: water (the owner: the mouse swims up in it)
    cells[y * W + x] = ch;
  }
  return { W, H, cells, start, goal, scrolls, water };
}
// every thing falls until something holds it (a G, S, o, # or another thing)
function c8Settle(cells, W, H) {
  for (let moved = true; moved;) {
    moved = false;
    for (let y = H - 2; y >= 0; y--) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (c8Obj(cells[i]) && cells[i + W] === ' ') { cells[i + W] = cells[i]; cells[i] = ' '; moved = true; }
    }
  }
}

function c8New(L) {
  const P = c8Parse(L), G = {
    L, W: P.W, H: P.H, cells: P.cells, vis: new Array(P.W * P.H).fill(null), goal: P.goal, start: P.start, scrolls: P.scrolls, water: P.water,
    safe: { x: P.start.x + .5, y: P.start.y + 1 }, stand: 0, deaths: 0, pushT: 0,
    got: 0, nScroll: P.scrolls.length, time: 0, state: 'play', sel: [], moves: 0, events: [], shake: 0, winT: 0,
    p: { x: P.start.x + .5, y: P.start.y + 1, vx: 0, vy: 0, on: true, face: 1, coy: 0, buf: 0, t: 0 },
  };
  c8Settle(G.cells, G.W, G.H);
  return G;
}

/* ---------- the mouse ---------- */
function c8Solid(G, x, y) {
  if (x < 0 || x >= G.W || y < 0 || y >= G.H) return true;
  const c = G.cells[y * G.W + x]; return c === '#' || (c8Obj(c) && !C8_SOFT.includes(c));
}
function c8Hit(G, px, py) {
  const x0 = Math.floor(px - C8_PW / 2), x1 = Math.floor(px + C8_PW / 2 - 1e-6), y0 = Math.floor(py - C8_PH), y1 = Math.floor(py - 1e-6);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (c8Solid(G, x, y)) return true;
  return false;
}
const c8Over = (p, x, y) => p.x - C8_PW / 2 < x + 1 && p.x + C8_PW / 2 > x && p.y - C8_PH < y + 1 && p.y > y;
function c8Slide(G, p, axis, d) {                         // move as far as free along one axis, returns the distance moved
  const t = (a) => axis === 'x' ? c8Hit(G, p.x + a, p.y) : c8Hit(G, p.x, p.y + a);
  if (!t(d)) { p[axis] += d; return d; }
  let lo = 0, hi = d; for (let k = 0; k < 9; k++) { const m = (lo + hi) / 2; if (t(m)) hi = m; else lo = m; }
  p[axis] += lo; return lo;
}
const c8Wet = (G, x, y) => x >= 0 && x < G.W && y >= 0 && y < G.H && (!!G.water[y * G.W + x] || G.cells[y * G.W + x] === 'v');   // the water layer (w) or a water thing (v)
// pushing a rock: the mouse stands on something and walks into a rock at its feet; after a moment the rock moves one cell (into an empty cell, or swapping places with a flame or a dashed spiral)
const C8_PUSH_T = .3;                                                       // seconds one pushed cell takes: the rock slides and the mouse walks along
function c8Push(G, dir, dt) {
  const p = G.p, rx = Math.floor(p.x + dir * (C8_PW / 2 + .05)), ry = Math.floor(p.y - .1), ri = ry * G.W + rx;
  if (rx < 0 || rx >= G.W || ry < 0 || ry >= G.H || G.cells[ri] !== 'r' || (G.vis[ri] && G.vis[ri].oy < 0)) { G.pushT = 0; return; }
  G.pushT = (G.pushT || 0) + dt; if (G.pushT < .1) return; G.pushT = 0;
  const tx = rx + dir; if (tx < 0 || tx >= G.W) return; const ti = ry * G.W + tx, t = G.cells[ti];
  if (t === ' ' || t === 'o' || t === 'a') {
    G.cells[ti] = 'r'; G.cells[ri] = t === ' ' ? ' ' : t; G.vis[ri] = null; G.vis[ti] = { oy: 0, v: 0, ox: -dir };                  // the rock slides one cell (vis.ox runs back to 0) and the mouse walks along with it
    if (c8Solid(G, rx, ry + 1)) G.pa = { dir, t: 0 };   // the mouse walks along only where there is ground under the cell the rock leaves (it is never dragged into a pit)
    G.events.push({ push: ti, from: ri });
  }
}
function c8Walk(G, dt, inp) {
  if (G.pa) { G.pa.t += dt; if (G.pa.t >= C8_PUSH_T) { G.pa = null; G.pushT = .1; } else inp = { r: G.pa.dir > 0, l: G.pa.dir < 0, jump: false }; }
  const p = G.p, dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0), swim = c8Wet(G, Math.floor(p.x), Math.floor(p.y - C8_PH / 2));
  p.vx = dir * (G.pa ? 1 / C8_PUSH_T : swim ? C8_SPEED * .75 : p.on ? C8_SPEED : C8_AIR); if (dir) p.face = dir;
  const wantX = p.vx * dt, gotX = c8Slide(G, p, 'x', wantX);
  if (dir && p.on && !swim && Math.abs(gotX) < Math.abs(wantX) - 1e-6) c8Push(G, dir, dt); else G.pushT = 0;
  if (swim) {                                                          // in water: hold jump to swim up (a hop out at the surface), sink slowly otherwise
    const surface = !c8Wet(G, Math.floor(p.x), Math.floor(p.y - C8_PH - .15));
    if (inp.jump) p.vy = surface ? -C8_HOP : Math.max(p.vy - 40 * dt, -4.5); else p.vy = Math.min(p.vy + 8 * dt, 2.2);
    const want = p.vy * dt, got = c8Slide(G, p, 'y', want); p.on = false;
    if (got !== want) { if (p.vy > 0) p.on = true; p.vy = 0; }
    if (p.on) p.coy = .05; p.t += dt * (dir ? 1 : 0); return;
  }
  if (inp.jump) p.buf = .12;
  p.buf = Math.max(0, p.buf - dt); p.coy = Math.max(0, p.coy - dt);
  if (p.buf > 0 && p.coy > 0) { p.vy = -C8_JV; p.buf = 0; p.coy = 0; p.on = false; G.events.push('jump'); }
  p.vy = Math.min(C8_FALL, p.vy + C8_GRAV * dt);
  const want = p.vy * dt, got = c8Slide(G, p, 'y', want);
  const was = p.on; p.on = false;
  if (got !== want) { if (p.vy > 0) { p.on = true; if (!was && p.vy > 7) G.events.push('land'); } p.vy = 0; }
  if (p.on) p.coy = .05;
  p.t += dt * (dir && p.on ? 1 : 0);
}

/* ---------- things falling ---------- */
function c8Fall(G, dt) {
  const { W, H, cells, vis } = G;
  for (let y = H - 1; y >= 0; y--) for (let x = 0; x < W; x++) {
    const i = y * W + x, ch = cells[i]; if (!c8Obj(ch)) continue;
    let v = vis[i], over = 0;
    if (v && v.ox) { v.ox -= Math.sign(v.ox) * dt / C8_PUSH_T; if (Math.abs(v.ox) < dt / C8_PUSH_T * .6 || v.ox * Math.sign(v.ox) <= 0) { v.ox = 0; if (!(v.oy < 0)) vis[i] = null; } if (vis[i]) continue; }
    if (v && v.oy < 0) { v.v += 38 * dt; v.oy += v.v * dt; if (v.oy < 0) continue; over = v.oy; v.oy = 0; }
    if (y + 1 < H && cells[i + W] === ' ' && (C8_SOFT.includes(ch) || !c8Over(G.p, x, y + 1))) {
      const nv = v || { oy: 0, v: 0 }; cells[i + W] = ch; cells[i] = ' '; vis[i] = null; nv.oy = -1 + over; vis[i + W] = nv;
    } else if (v) { if (v.v > 3) G.events.push('thud'); vis[i] = null; }
  }
}
const c8Moving = G => G.vis.some(v => v && (v.oy < 0 || v.ox));

/* ---------- gathering ---------- */
const c8Pick = (G, i) => i >= 0 && i < G.cells.length && C8_KINDS.includes(G.cells[i]) && !(G.vis[i] && (G.vis[i].oy < 0 || G.vis[i].ox));
const c8Near = (W, i, j) => Math.abs((i % W) - (j % W)) + Math.abs(((i / W) | 0) - ((j / W) | 0)) === 1;
// the finger reaches cell i: start, extend, or step back along the chain; returns what happened
function c8Reach(G, i) {
  const s = G.sel;
  if (!s.length) { if (c8Pick(G, i)) { s.push(i); return 'start'; } return null; }
  const last = s[s.length - 1];
  if (i === last) return null;
  if (s.length >= 2 && i === s[s.length - 2]) { s.pop(); return 'back'; }
  if (c8Near(G.W, last, i) && c8Pick(G, i) && G.cells[i] === G.cells[s[0]] && !s.includes(i)) { s.push(i); return 'add'; }
  return null;
}
function c8Let(G) {                                         // finger lifted: 3 or more vanish
  const s = G.sel; G.sel = [];
  if (s.length < 3) return s.length ? 'few' : null;
  const kind = G.cells[s[0]];
  for (const i of s) { G.events.push({ gone: i, ch: G.cells[i] }); G.cells[i] = ' '; G.vis[i] = null; }
  if (kind === 'a') {                                       // heat: the ice just AHEAD of the finger's last step melts into a water thing (owner, Dim Tunnel / Overflowing Sewer)
    const e = s[s.length - 1], p = s[s.length - 2], W = G.W, ex = e % W, ey = (e / W) | 0, px = p % W, py = (p / W) | 0, ax = ex + (ex - px), ay = ey + (ey - py);
    if (ax >= 0 && ax < W && ay >= 0 && ay < G.H && G.cells[ay * W + ax] === 'i') { G.cells[ay * W + ax] = 'v'; G.vis[ay * W + ax] = null; G.events.push({ melt: ay * W + ax }); }
  }
  G.moves++; return 'gone';
}

/* ---------- one frame ---------- */
function c8Ice(G) {                                         // touching ice (even only standing on it) is deadly
  const p = G.p, m = .04, x0 = Math.floor(p.x - C8_PW / 2 - m), x1 = Math.floor(p.x + C8_PW / 2 + m), y0 = Math.floor(p.y - C8_PH - m), y1 = Math.floor(p.y + m - 1e-6);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < G.W && y >= 0 && y < G.H && G.cells[y * G.W + x] === 'i') return true;
  return false;
}
function c8Tick(G, dt, inp) {
  if (G.state !== 'play') { G.winT += dt; c8Fall(G, dt); return; }
  G.time += dt;
  for (let k = 0; k < 2; k++) { c8Walk(G, dt / 2, inp); if (c8Ice(G)) { G.state = 'dead'; G.winT = 0; G.events.push('dead'); return; } }   // checked after EVERY half step: a jump on the very next half step must not save the mouse from the ice it landed on
  c8Fall(G, dt);
  const p = G.p;
  for (let k = 0; k < G.scrolls.length; k++) { const s = G.scrolls[k], i = s.y * G.W + s.x; if (G.cells[i] === 'S' && c8Over(p, s.x, s.y)) { G.cells[i] = ' '; G.got++; G.events.push({ scroll: i }); } }
  if (c8Ice(G)) { G.state = 'dead'; G.winT = 0; G.events.push('dead'); return; }
  if (c8Over(p, G.goal.x, G.goal.y)) { G.state = 'win'; G.winT = 0; G.events.push('win'); return; }
  const x0 = Math.floor(p.x - C8_PW / 2 + .1), x1 = Math.floor(p.x + C8_PW / 2 - .1), y0 = Math.floor(p.y - C8_PH + .1), y1 = Math.floor(p.y - .05);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < G.W && y >= 0 && y < G.H && G.cells[y * G.W + x] === 'x') { G.state = 'dead'; G.winT = 0; G.events.push('dead'); return; }
  G.stand = p.on ? G.stand + dt : 0;                                   // a place it has stood on for a moment, with no ice or thorns next to it, is where it comes back after dying (owner)
  if (G.stand > .25 && c8Safe(G)) G.safe = { x: p.x, y: p.y };
}
function c8Safe(G) {
  const p = G.p, x0 = Math.floor(p.x - C8_PW / 2) - 1, x1 = Math.floor(p.x + C8_PW / 2) + 1, y0 = Math.floor(p.y - C8_PH) - 1, y1 = Math.floor(p.y) + 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < G.W && y >= 0 && y < G.H) { const c = G.cells[y * G.W + x]; if (c === 'i' || c === 'x') return false; }
  return !c8Hit(G, p.x, p.y);
}
// after dying the mouse appears again at the last safe place (the level stays as it is); if something solid has fallen there, the nearest free place, else the start
function c8Respawn(G) {
  const home = { x: G.start.x + .5, y: G.start.y + 1 }, tries = [];
  for (const d of [0, 1, -1, 2, -2, 3, -3]) for (const up of [0, 1, 2, 3]) tries.push({ x: G.safe.x + d, y: G.safe.y - up });
  tries.push(home);
  for (const t of tries) {
    const p = { x: t.x, y: t.y, vx: 0, vy: 0, on: false, face: G.p.face, coy: 0, buf: 0, t: 0 }; G.p = p;
    if (t.x < 0 || t.x >= G.W || c8Hit(G, p.x, p.y) || c8Ice(G)) continue;
    break;
  }
  G.p.vx = G.p.vy = 0; G.state = 'play'; G.winT = 0; G.stand = 0; G.sel = []; G.deaths = (G.deaths || 0) + 1; G.events.push('respawn');
}
