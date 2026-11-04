/* Chương II level search (not loaded by the game). A spec (tools/c2-specs.js) names the board size, pinned rule lines,
   the loose words and things to scatter, and walls; the search scatters them, solves with the game's engine (BFS),
   and hill-climbs (move a piece, add or take away a wall) for a long shortest road with many rule changes on it.
   Then it checks which rule changes are ESSENTIAL: a BFS that never lets rule R stand (or never lets a starting rule
   go) must find no win.
   Usage: node --max-old-space-size=6000 tools/c2-gen.js <spec id> [--iters N] [--seed S] [--cap N]
   Writes the best board to tools/c2-gen/<id>.json. */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const src = ['js/ch2/levels.js', 'js/ch2/engine.js', 'js/ch2/solver.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const tmp = path.join(require('os').tmpdir(), 'c2g-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.js');
fs.writeFileSync(tmp, src + '\nmodule.exports = { C2K, C2P, C2OPS, C2THING, C2NOUN, C2PROP, C2OP, c2Parse, c2Settle, c2Step, c2Snap, c2StKey, C2_DIRS };');
const E = require(tmp); fs.unlinkSync(tmp);

const rk = r => r.a + ':' + r.verb + (r.neg ? '!' : '') + ':' + (r.prop || r.to);
const rtxt = k => { const [a, v, b] = k.split(':'), n = v.endsWith('!'), w = n ? v.slice(0, -1) : v; return `${E.C2K[a].vi} ${w === 'has' ? 'CÓ' : w === 'is' ? (n ? 'KHÔNG' : 'LÀ') : (n ? 'KHÔNG ' : '') + E.C2OPS[w].vi} ${E.C2P[b] ? E.C2P[b].vi : E.C2K[b].vi}`; };
const rset = st => new Set(st.rules.map(rk));

// BFS; ok(st) false prunes a state; returns { moves, states, capped, path: [rule sets along the road] }
function solve(def, cap, ok) {
  const st0 = E.c2Parse(def); E.c2Settle(st0);
  if (st0.won) return { moves: '', states: 1, trivial: true };
  if (ok && !ok(st0)) return { moves: null, states: 1 };
  const seen = new Map([[E.c2StKey(st0), null]]); let front = [{ st: E.c2Snap(st0), k: E.c2StKey(st0) }], states = 1;
  const par = new Map();
  while (front.length) {
    const next = [];
    for (const n of front) for (const d in E.C2_DIRS) {
      const st = E.c2Snap(n.st); if (!E.c2Step(st, E.C2_DIRS[d][0], E.C2_DIRS[d][1])) continue;
      if (ok && !ok(st)) continue;
      if (st.won) {
        let m = d, k = n.k; while (par.has(k)) { const p = par.get(k); m = p.d + m; k = p.k; }
        return { moves: m, states };
      }
      if (st.dead) continue;
      const k = E.c2StKey(st); if (seen.has(k)) continue; seen.set(k, 1); par.set(k, { k: n.k, d }); states++;
      if (states > cap) return { moves: null, states, capped: true };
      next.push({ st, k });
    }
    front = next;
  }
  return { moves: null, states };
}
// replay a road: the rule sets after every move
function replay(def, moves) {
  const st = E.c2Parse(def); E.c2Settle(st); const out = [rset(st)];
  for (const d of moves) { E.c2Step(st, ...E.C2_DIRS[d]); out.push(rset(st)); }
  return out;
}
// rule changes along a road: [{ op '+'|'-', r, at }]
function events(sets) {
  const ev = [];
  for (let i = 1; i < sets.length; i++) {
    for (const r of sets[i]) if (!sets[i - 1].has(r)) ev.push({ op: '+', r, at: i });
    for (const r of sets[i - 1]) if (!sets[i].has(r)) ev.push({ op: '-', r, at: i });
  }
  return ev;
}
// which changes the win cannot do without
function essential(def, sol, cap) {
  const sets = replay(def, sol), start = sets[0], seenR = new Set(); sets.forEach(s => s.forEach(r => seenR.add(r)));
  const out = [];
  for (const r of seenR) {
    if (start.has(r)) {
      if (!sets.some(s => !s.has(r))) continue;
      const res = solve(def, cap, st => st.rules.some(x => rk(x) === r));
      if (!res.moves && !res.capped) out.push({ op: '-', r });
      else if (res.capped) out.push({ op: '-?', r });
    } else {
      const res = solve(def, cap, st => !st.rules.some(x => rk(x) === r));
      if (!res.moves && !res.capped) out.push({ op: '+', r });
      else if (res.capped) out.push({ op: '+?', r });
    }
  }
  return out;
}
// the hint chain from a road: essential changes in the order they last happen on it
function chainOf(def, sol, ess) {
  const sets = replay(def, sol), ev = events(sets), last = sets[sets.length - 1];
  const want = new Set(ess.filter(e => e.op === '+' || e.op === '-').map(e => e.op + e.r));
  // a needed rule that is gone at the win was made and then broken: the chain names both
  for (const e of ess) if (e.op === '+' && !last.has(e.r)) want.add('-' + e.r);
  const order = [], seen = new Set();
  for (const e of ev) {
    const key = e.op + e.r; if (!want.has(key)) continue;
    if (e.op === '-' && ess.some(x => x.op === '+' && x.r === e.r)) { const i = order.findIndex(o => o.op === '-' && o.r === e.r); if (i >= 0) order.splice(i, 1); order.push(e); continue; }
    if (seen.has(key)) continue; seen.add(key); order.push(e);
  }
  return order.map(e => (e.op === '+' ? 'Ghép ' : 'Phá ') + rtxt(e.r)).join(' → ');
}

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// build a board from a spec. spec.base = rows: '.' free (loose pieces and walls may go there), ':' empty and left alone,
// any other char stays where it is (words there are pinned unless spec.loosePins). Without base: pins + area.
function build(spec, rnd) {
  let W = spec.W, H = spec.H, g, lock = new Set(), fix = new Set();
  if (spec.base) {
    H = spec.H = spec.base.length; W = spec.W = spec.base[0].length;
    g = spec.base.map((r, y) => [...r].map((ch, x) => { if (ch !== '.') lock.add(x + ',' + y); if (ch !== '.' && ch !== ':' && !/[a-z~]/.test(ch) && !spec.loosePins) fix.add(x + ',' + y); return ch === ':' ? '.' : ch; }));
  } else {
    g = Array.from({ length: H }, () => Array(W).fill('.'));
    for (const [s, x, y, dir] of spec.pins || []) [...s].forEach((ch, i) => { const cx = dir === 'v' ? x : x + i, cy = dir === 'v' ? y + i : y; g[cy][cx] = ch; lock.add(cx + ',' + cy); if (!/[a-z~]/.test(ch)) fix.add(cx + ',' + cy); });
  }
  for (const [x, y, ch] of spec.place || []) { g[y][x] = ch; lock.add(x + ',' + y); }
  const free = () => { const c = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.' && !lock.has(x + ',' + y) && inArea(spec, x, y)) c.push([x, y]); return c; };
  for (const ch of [...(spec.loose || '')]) { const f = free(); if (!f.length) break; const [x, y] = f[(rnd() * f.length) | 0]; g[y][x] = ch; }
  for (let i = 0; i < (spec.walls || 0); i++) { const f = free(); if (!f.length) break; const [x, y] = f[(rnd() * f.length) | 0]; g[y][x] = spec.wallCh || 'w'; }
  return settleGrid(spec, { g, pin: lock, fix });
}
// a board where something falls at the start is stored as it lands (one piece per cell, else unchanged)
function settleGrid(spec, b) {
  const def = toDef(spec, b), st = E.c2Parse(def); E.c2Settle(st);
  const W = b.g[0].length, H = b.g.length, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const inv = (m, v) => Object.keys(m).find(k => m[k] === v);
  for (const o of st.objs) {
    if (g[o.y][o.x] !== '.') return b;
    g[o.y][o.x] = o.t === 'thing' ? inv(E.C2THING, o.k) : o.t === 'noun' ? inv(E.C2NOUN, o.k) : o.t === 'prop' ? inv(E.C2PROP, o.p) : inv(E.C2OP, o.t);
  }
  if (g.some(r => r.includes(undefined))) return b;
  return { g, pin: b.pin, fix: b.fix };
}
const inArea = (spec, x, y) => !spec.area || (x >= spec.area[0] && y >= spec.area[1] && x <= spec.area[2] && y <= spec.area[3]);
const toDef = (spec, b) => ({ map: b.g.map(r => r.join('')), fixed: [...b.fix].map(k => k.split(',').map(Number)), dirs: spec.dirs || [] });
function mutate(spec, b, rnd) {
  const g = b.g.map(r => r.slice()), W = spec.W, H = spec.H, nb = { g, pin: b.pin, fix: b.fix };
  const cells = [], empty = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (b.pin.has(x + ',' + y) || !inArea(spec, x, y)) continue; if (g[y][x] === '.') empty.push([x, y]); else cells.push([x, y]); }
  const r = rnd(), wc = spec.wallCh || 'w';
  if (r < .55 && cells.length && empty.length) {                       // move a piece
    const [x, y] = cells[(rnd() * cells.length) | 0], near = rnd() < .6;
    const cand = near ? empty.filter(([a, c]) => Math.abs(a - x) + Math.abs(c - y) <= 2) : empty;
    if (!cand.length) return nb; const [nx, ny] = cand[(rnd() * cand.length) | 0];
    g[ny][nx] = g[y][x]; g[y][x] = '.';
  } else if (r < .75 && cells.length > 1) {                              // swap two pieces
    const [x, y] = cells[(rnd() * cells.length) | 0], [a, c] = cells[(rnd() * cells.length) | 0];
    const t = g[y][x]; g[y][x] = g[c][a]; g[c][a] = t;
  } else if (spec.wallMut !== false) {                                    // a wall more or less
    const walls = cells.filter(([x, y]) => g[y][x] === wc);
    if ((rnd() < .5 || !walls.length) && empty.length && walls.length < (spec.maxWalls ?? 30)) { const [x, y] = empty[(rnd() * empty.length) | 0]; g[y][x] = wc; }
    else if (walls.length > (spec.minWalls ?? 0)) { const [x, y] = walls[(rnd() * walls.length) | 0]; g[y][x] = '.'; }
  }
  return settleGrid(spec, nb);
}
// 'C=%' → 'cat:is:swap', 'J+G' → 'jar:has:gate', 'F-5' → 'fire:is!:hot'
// 'C)S' → 'cat:eat:fish', 'C-)S' → 'cat:eat!:fish' (KHÔNG ĂN)
const needKey = t => { const a = E.C2NOUN[t[0]]; let i = 1, n = '';
  if (E.C2OP[t[1]] === 'not' && /^(eat|fear|follow)$/.test(E.C2OP[t[2]])) { i = 2; n = '!'; }
  const op = E.C2OP[t[i]], b = E.C2PROP[t[i + 1]] || E.C2NOUN[t[i + 1]];
  return a + ':' + (op === 'has' ? 'has' : op === 'not' ? 'is!' : op === 'is' ? 'is' : op + n) + ':' + b; };
// is rule r (a key; '-key' = a starting rule that must go) needed for every win? true / false / null (search capped)
function needed(def, r, cap) {
  const neg = r[0] === '-', k = neg ? r.slice(1) : r;
  const res = solve(def, cap, neg ? st => st.rules.some(x => rk(x) === k) : st => !st.rules.some(x => rk(x) === k));
  return res.moves ? false : res.capped ? null : true;
}
function score(spec, def, cap) {
  const r = solve(def, cap);
  if (!r.moves || r.trivial) return { s: -1, r };
  { const st0 = E.c2Parse(def), pos0 = st0.objs.map(o => o.x + ',' + o.y).join(' '); E.c2Settle(st0);
    if (st0.objs.map(o => o.x + ',' + o.y).join(' ') !== pos0) return { s: -1, r };              // nothing may fall or break at the start
    const at0 = new Set(st0.rules.map(rk));      // a needed rule must not stand at the start
    if ((spec.need || []).some(t => t[0] !== '-' && at0.has(needKey(t)))) return { s: -1, r }; }
  const ev = events(replay(def, r.moves)), nr = new Set(ev.map(e => e.op + e.r)).size;
  const need = (spec.need || []).map(t => t[0] === '-' ? '-' + needKey(t.slice(1)) : needKey(t));
  const onRoad = need.every(k => ev.some(e => k[0] === '-' ? e.op === '-' && e.r === k.slice(1) : e.op === '+' && e.r === k));
  const s = Math.min(r.moves.length, spec.maxLen || 90) + (spec.evW ?? 6) * Math.min(nr, 8) + 3 * Math.log10(r.states);
  return { s: onRoad ? s : .1 * s, r, nr, need, onRoad };
}

if (require.main === module) {
  const args = process.argv.slice(2), opt = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
  const SPECS = require(process.env.SPECS || './c2-specs.js'), spec = SPECS.find(s => s.id === args[0]);   // SPECS=./c2-specs-ml.js for Muôn loài
  if (!spec) { console.log('no spec', args[0]); process.exit(1); }
  const iters = +(opt('iters') || spec.iters || 1500), cap = +(opt('cap') || spec.cap || 120000), seed = +(opt('seed') || 1);
  const rnd = mulberry(seed * 7919 + spec.id.length);
  let best = null, bestS = -1, bestR = null, t0 = Date.now();
  for (let tries = 0; tries < 3000 && bestS < 0; tries++) { const b = build(spec, rnd); const sc = score(spec, toDef(spec, b), cap); if (sc.s > bestS) { best = b; bestS = sc.s; bestR = sc; } }
  if (bestS < 0) { console.log(spec.id, 'no solvable start'); process.exit(2); }
  let cur = best, curS = bestS;
  for (let it = 0; it < iters; it++) {
    const nb = mutate(spec, cur, rnd); const sc = score(spec, toDef(spec, nb), cap);
    const T = 2 * (1 - it / iters);
    if (sc.s >= curS || (sc.s > 0 && rnd() < Math.exp((sc.s - curS) / Math.max(.05, T)))) { cur = nb; curS = sc.s; }
    if (sc.s > bestS && sc.onRoad && sc.need.length) {            // a new best must really need its rules
      const ok = sc.need.map(k => needed(toDef(spec, nb), k, cap * 3));
      if (ok.includes(false)) { if (process.env.V) console.log(it, 'not needed', sc.s.toFixed(1)); sc.s = .1 * sc.s; if (cur === nb) curS = sc.s; }
    }
    if (sc.s > bestS) { best = nb; bestS = sc.s; bestR = sc; if (process.env.V) console.log(it, bestS.toFixed(1), sc.r.moves.length, sc.r.states, sc.nr); }
    if ((Date.now() - t0) > (+process.env.SECS || spec.secs || 600) * 1000) break;
    if (it % 200 === 199 && curS < bestS - 15) { cur = best; curS = bestS; }   // wandered off: back to the best
  }
  const def = toDef(spec, best), ess = essential(def, bestR.r.moves, cap * 2), chain = chainOf(def, bestR.r.moves, ess);
  const out = { id: spec.id, score: bestS, moves: bestR.r.moves, len: bestR.r.moves.length, states: bestR.r.states, map: def.map, fixed: def.fixed, dirs: def.dirs, ess, chain };
  const OUT = process.env.OUT || 'c2-gen';
  fs.mkdirSync(path.join(__dirname, OUT), { recursive: true });
  const f = path.join(__dirname, OUT, spec.id + (opt('seed') ? '-' + seed : '') + '.json');
  let prev = null; try { prev = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
  if (!prev || prev.score < out.score) fs.writeFileSync(f, JSON.stringify(out, null, 1));
  console.log(spec.id, 'score', bestS.toFixed(1), 'len', out.len, 'states', out.states, 'ess', ess.map(e => e.op + rtxt(e.r)).join(', '));
  console.log(def.map.join('\n')); console.log(chain);
}
module.exports = { E, solve, replay, events, essential, chainOf, needed, needKey, rk, rtxt };
