/* Pure rules engine (no drawing): parse a map, read the rules, settle, step. After Baba Is You (owner): besides
   NOUN LÀ PROP / NOUN LÀ NOUN there are VÀ (and: CHUỘT VÀ MÈO LÀ ĐI, TƯỜNG LÀ CHẶN VÀ ĐẨY), KHÔNG (not: MÈO LÀ KHÔNG NÓNG),
   CÓ (has: CHUM CÓ CHÌA, what is left when it is destroyed), the noun CHỮ (the word tiles themselves) and NOUN LÀ NOUN for
   itself (CHUỘT LÀ CHUỘT: nothing can turn it into anything else).
   Properties: ĐI you · ĐẨY push · CHẶN stop · CHÌM sink (it and whatever shares its cell go) · NÓNG hot (burns what is ĐI)
   · THẮNG win · MỞ open / KHOÁ shut (a shut thing blocks all but what is open; the two meeting destroy each other)
   · BAY float (floaters only meet floaters: sink, heat, win, open/shut, weak) · KÉO pull (follows whatever walks away from it;
   it blocks like CHẶN) · CHẠY move (steps on its own after each move, turning back at a wall) · YẾU weak (breaks when
   anything shares its cell).
   A grid index (cells by y*W+x) keeps steps quick for the solver (solver.js). */
function c2Parse(def) {
  const objs = []; let id = 0;
  def.map.forEach((row, y) => [...row].forEach((ch, x) => {
    let o = null;
    if (C2THING[ch]) o = { t: 'thing', k: C2THING[ch], dir: 'R' };
    else if (C2NOUN[ch]) o = { t: 'noun', k: C2NOUN[ch] };
    else if (C2OP[ch]) o = { t: C2OP[ch] };
    else if (C2PROP[ch]) o = { t: 'prop', p: C2PROP[ch] };
    if (o) { o.id = id++; o.x = x; o.y = y; objs.push(o); }
  }));
  for (const [x, y] of def.fixed || []) for (const o of objs) if (o.x === x && o.y === y && o.t !== 'thing') o.fix = true;
  for (const [x, y, d] of def.dirs || []) for (const o of objs) if (o.x === x && o.y === y && o.t === 'thing') o.dir = d;
  const dirMatters = objs.some(o => o.t === 'prop' && (o.p === 'move' || o.p === 'pull'));
  return { W: def.map[0].length, H: def.map.length, objs, rules: [], props: {}, won: false, dead: false, nid: id, dirMatters };
}
const C2_DXY = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] }, C2_BACK = { R: 'L', L: 'R', U: 'D', D: 'U' };
const c2DirOf = (dx, dy) => dx > 0 ? 'R' : dx < 0 ? 'L' : dy < 0 ? 'U' : 'D';
const c2Pk = o => o.t === 'thing' ? o.k : 'text';                          // whose properties an object takes
// properties as bit masks per kind (st.pm), quick for the solver; st.props keeps Sets for reading
const C2PB = {}; Object.keys(C2P).forEach((p, i) => { C2PB[p] = 1 << i; });
const c2Has = (st, k, p) => ((st.pm && st.pm[k]) & C2PB[p]) !== 0;
const c2OHas = (st, o, p) => ((st.pm && st.pm[o.t === 'thing' ? o.k : 'text']) & C2PB[p]) !== 0;
function c2ParseRules(st) {
  const W = st.W, H = st.H, txt = new Array(W * H);
  for (const o of st.objs) if (o.t !== 'thing') txt[o.y * W + o.x] = o;
  const rules = [], at = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? txt[y * W + x] : undefined;
  // NOUN (VÀ NOUN)* (LÀ|CÓ) [KHÔNG] (PROP|NOUN) (VÀ [KHÔNG] (PROP|NOUN))*
  const scan = (x, y, dx, dy) => {
    const pv = at(x - dx, y - dy); if (pv && (pv.t === 'and' || pv.t === 'noun')) { const pp = at(x - 2 * dx, y - 2 * dy); if (pv.t === 'and' && pp && pp.t === 'noun') return; }
    let cx = x, cy = y; const subj = [], cells = [];
    for (;;) {
      const n = at(cx, cy); if (!n || n.t !== 'noun') return;
      subj.push(n); cells.push(n); cx += dx; cy += dy;
      const a = at(cx, cy); if (a && a.t === 'and') { const nx = at(cx + dx, cy + dy); if (nx && nx.t === 'noun') { cells.push(a); cx += dx; cy += dy; continue; } }
      break;
    }
    const v = at(cx, cy); if (!v || (v.t !== 'is' && v.t !== 'has')) return;
    cells.push(v); cx += dx; cy += dy;
    const objsR = [];
    for (;;) {
      let neg = false, o = at(cx, cy), used = [];
      if (o && o.t === 'not' && v.t === 'is') { neg = true; used.push(o); cx += dx; cy += dy; o = at(cx, cy); }
      if (!o || !(o.t === 'noun' || (o.t === 'prop' && v.t === 'is'))) break;
      used.push(o); objsR.push({ o, neg, used }); cx += dx; cy += dy;
      const a = at(cx, cy), nx = at(cx + dx, cy + dy);
      if (a && a.t === 'and' && nx && (nx.t === 'noun' || nx.t === 'prop' || nx.t === 'not')) { objsR[objsR.length - 1].and = a; cx += dx; cy += dy; continue; }
      break;
    }
    if (!objsR.length) return;
    const all = [...cells]; for (const r of objsR) { all.push(...r.used); if (r.and) all.push(r.and); }
    for (const s of subj) for (const r of objsR) rules.push({ a: s.k, verb: v.t, neg: r.neg, prop: r.o.t === 'prop' ? r.o.p : null, to: r.o.t === 'noun' ? r.o.k : null, cells: all });
  };
  for (let i = 0; i < W * H; i++) if (txt[i] && txt[i].t === 'noun') { const x = i % W, y = (i / W) | 0; scan(x, y, 1, 0); scan(x, y, 0, 1); }
  return rules;
}
function c2Props(st) {
  st.props = {}; for (const k in C2K) st.props[k] = new Set();
  for (const r of st.rules) if (r.verb === 'is' && r.prop && !r.neg) st.props[r.a].add(r.prop);
  for (const r of st.rules) if (r.verb === 'is' && r.prop && r.neg) st.props[r.a].delete(r.prop);
  st.pm = {}; for (const k in st.props) { let m = 0; for (const p of st.props[k]) m |= C2PB[p]; st.pm[k] = m; }
}
function c2Settle(st, keep) {
  for (let guard = 0; guard < 12; guard++) {
    if (!keep || guard) { st.rules = c2ParseRules(st); c2Props(st); }
    // NOUN LÀ NOUN: things turn into another kind, unless they are themselves (CHUỘT LÀ CHUỘT) or told not to
    let changed = false;
    const self = new Set(st.rules.filter(r => r.verb === 'is' && r.to === r.a && !r.neg).map(r => r.a));
    const nope = new Set(st.rules.filter(r => r.verb === 'is' && r.to && r.neg).map(r => r.a + '>' + r.to));
    const into = {}; for (const r of st.rules) if (r.verb === 'is' && r.to && !r.neg && r.to !== r.a && r.to !== 'text' && r.a !== 'text' && !self.has(r.a) && !nope.has(r.a + '>' + r.to) && !into[r.a]) into[r.a] = r.to;
    for (const o of st.objs) if (o.t === 'thing' && into[o.k]) { o.k = into[o.k]; changed = true; }
    if (changed) continue;
    const cells = c2Grid(st), P = st.props;
    const dead = new Set(), fl = o => c2OHas(st, o, 'float');
    let anyHot = false; for (const k in st.pm) if (st.pm[k] & C2PB.hot) anyHot = true;
    for (const l of cells) {
      if (!l || (l.length < 2 && !(anyHot && c2OHas(st, l[0], 'hot')))) continue;
      for (const f of [false, true]) {
        const g = l.filter(o => fl(o) === f); if (!g.length) continue;
        if (g.length > 1 && g.some(o => c2OHas(st, o, 'sink'))) g.forEach(o => dead.add(o));
        if (g.some(o => c2OHas(st, o, 'hot'))) g.forEach(o => { if (c2OHas(st, o, 'you')) dead.add(o); });
        const op = g.filter(o => c2OHas(st, o, 'open')), sh = g.filter(o => c2OHas(st, o, 'shut'));
        for (let i = 0; i < Math.min(op.length, sh.length); i++) { if (op[i] === sh[i]) continue; dead.add(op[i]); dead.add(sh[i]); }
        if (g.length > 1) g.forEach(o => { if (c2OHas(st, o, 'weak')) dead.add(o); });
      }
    }
    if (dead.size) {
      st.objs = st.objs.filter(o => !dead.has(o));
      // CÓ: what is left behind
      for (const o of dead) for (const r of st.rules) if (r.verb === 'has' && r.a === c2Pk(o) && r.to && r.to !== 'text') st.objs.push({ t: 'thing', k: r.to, id: st.nid++, x: o.x, y: o.y, dir: o.dir || 'R', rx: o.rx, ry: o.ry });
      continue;
    }
    st.won = false;
    for (const l of cells) if (l && l.some(o => c2OHas(st, o, 'you') && l.some(w => c2OHas(st, w, 'win') && fl(w) === fl(o)))) { st.won = true; break; }
    st.dead = !st.objs.some(o => c2OHas(st, o, 'you'));
    return;
  }
}
const c2IsPush = (st, o) => c2OHas(st, o, 'push') || (o.t !== 'thing' && !o.fix);
const c2IsStop = (st, o) => o.t === 'thing' ? c2Has(st, o.k, 'stop') : c2Has(st, 'text', 'stop');
// can o move one cell (dx, dy)? pushes are gathered in list; the grid g maps cells to objects
function c2CanMove(st, g, o, dx, dy, list, depth = 0) {
  const nx = o.x + dx, ny = o.y + dy;
  if (nx < 0 || ny < 0 || nx >= st.W || ny >= st.H || depth > 60) return false;
  const here = g[ny * st.W + nx];
  if (here) for (const t of here) {
    if (t === o || list.includes(t)) continue;
    if (t.fix) return false;
    if (c2IsPush(st, t)) { if (!c2CanMove(st, g, t, dx, dy, list, depth + 1)) return false; continue; }
    if (c2IsStop(st, t) || c2OHas(st, t, 'pull')) return false;
    if (c2OHas(st, t, 'shut') && !c2OHas(st, o, 'open')) return false;
  }
  if (!list.includes(o)) list.push(o);
  return true;
}
function c2Grid(st) { const g = new Array(st.W * st.H); for (const o of st.objs) { const k = o.y * st.W + o.x; (g[k] || (g[k] = [])).push(o); } return g; }
function c2Shift(st, g, o, dx, dy) {
  const a = g[o.y * st.W + o.x]; if (a) { const i = a.indexOf(o); if (i >= 0) a.splice(i, 1); }
  o.x += dx; o.y += dy; const k = o.y * st.W + o.x; (g[k] || (g[k] = [])).push(o); if (o.t !== 'thing') st.tdirty = true;
}
// move these movers one cell (front first), with what they push and what they pull behind them
function c2MoveGroup(st, g, movers, dx, dy) {
  let moved = false;
  movers.sort((a, b) => (b.x - a.x) * dx + (b.y - a.y) * dy);
  for (const m of movers) {
    if (!st.objs.includes(m)) continue;
    const list = [];
    if (!c2CanMove(st, g, m, dx, dy, list)) continue;
    const pulls = [];
    let bx = m.x - dx, by = m.y - dy, guard = 0;
    while (bx >= 0 && by >= 0 && bx < st.W && by < st.H && guard++ < 40) {               // a chain of KÉO behind it follows
      const p = (g[by * st.W + bx] || []).filter(t => c2OHas(st, t, 'pull') && !t.fix && !list.includes(t) && !pulls.includes(t));
      if (!p.length) break; pulls.push(...p); bx -= dx; by -= dy;
    }
    for (const o of list) c2Shift(st, g, o, dx, dy);
    for (const o of pulls) c2Shift(st, g, o, dx, dy);
    moved = true;
  }
  return moved;
}
const c2Sk = st => st.objs.map(o => o.id + ':' + o.x + ',' + o.y + ':' + (o.k || o.p || o.t)).join('|');
function c2Step(st, dx, dy) {
  const g = c2Grid(st), d = c2DirOf(dx, dy); st.tdirty = false;
  const you = st.objs.filter(o => !o.fix && c2OHas(st, o, 'you'));   // pinned words never move, even when CHỮ LÀ ĐI
  let changed = false;
  for (const o of you) if (o.t === 'thing' && o.dir !== d) { o.dir = d; if (st.dirMatters) changed = true; }
  if (c2MoveGroup(st, g, you, dx, dy)) changed = true;
  // CHẠY: each mover steps its way; blocked, it turns back and tries once more
  const run = st.objs.filter(o => o.t === 'thing' && c2OHas(st, o, 'move'));
  for (const dirKey of ['R', 'L', 'U', 'D']) {
    const grp = run.filter(o => o.dir === dirKey); if (!grp.length) continue;
    const [mx, my] = C2_DXY[dirKey];
    for (const o of grp) {
      if (!st.objs.includes(o)) continue;
      if (c2MoveGroup(st, g, [o], mx, my)) { changed = true; continue; }
      o.dir = C2_BACK[o.dir]; changed = true; const [bx, by] = C2_DXY[o.dir]; c2MoveGroup(st, g, [o], bx, by);
    }
  }
  if (!changed) return false;
  c2Settle(st, !st.tdirty);
  return true;
}
