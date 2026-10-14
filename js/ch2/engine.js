/* Pure rules engine (no drawing): parse a map, read the rules, settle, step. After Baba Is You (owner): besides
   NOUN LÀ PROP / NOUN LÀ NOUN there are VÀ (and: CHUỘT VÀ MÈO LÀ ĐI, TƯỜNG LÀ CHẶN VÀ ĐẨY), KHÔNG in place of LÀ (not: MÈO KHÔNG NÓNG, TƯỜNG KHÔNG CHẶN — owner: "là không" is not Vietnamese),
   CÓ (has: CHUM CÓ CHÌA, what is left when it is destroyed), the noun CHỮ (the word tiles
   themselves) and NOUN LÀ NOUN for itself (CHUỘT LÀ CHUỘT: nothing can turn it into anything else).
   Properties: ĐI you · ĐẨY push · CHẶN stop · CHÌM sink (it and whatever shares its cell go) · NÓNG hot (burns what is ĐI)
   · THẮNG win · MỞ open / KHOÁ shut (a shut thing blocks all but what is open; the two meeting destroy each other)
   · BAY float (floaters only meet floaters: sink, heat, win, open/shut, weak) · KÉO pull (follows whatever walks away from it;
   it blocks like CHẶN) · CHẠY move (steps on its own after each move, turning back at a wall) · YẾU weak (breaks when
   anything shares its cell).
   Thần thông (after the Baba Is You wiki): CHUYỂN tele (a thing arriving on one pad jumps to the next pad of the same kind,
   by id; it arrives when it or the pad moved this turn, or the rule is new) · TRÔI shift (carries what stands on it one cell
   its way and turns it so) · ĐỔI swap (trades places instead of blocking or being pushed) · TAN melt (goes when it meets
   something NÓNG) · BỀN safe (never destroyed) · RƠI fall (drops down until something solid). Conditions between the noun
   and the verb: TRÊN (on: shares the cell with one) and GẦN (near: on it or in one of the 8 cells around):
   CHUỘT TRÊN RƠM LÀ ĐI, ĐÁ GẦN NƯỚC LÀ CHÌA. Turn: ĐI → CHẠY → TRÔI moves → transforms, destruction, RƠI → CHUYỂN.
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
  const dirMatters = objs.some(o => o.t === 'prop' && (o.p === 'move' || o.p === 'pull' || o.p === 'shift'));
  return { W: def.map[0].length, H: def.map.length, objs, rules: [], props: {}, won: false, dead: false, nid: id, dirMatters };
}
const C2_DXY = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] }, C2_BACK = { R: 'L', L: 'R', U: 'D', D: 'U' };
const c2DirOf = (dx, dy) => dx > 0 ? 'R' : dx < 0 ? 'L' : dy < 0 ? 'U' : 'D';
const c2Pk = o => o.t === 'thing' ? o.k : 'text';                          // whose properties an object takes
// properties as bit masks per kind (st.pm), quick for the solver; st.props keeps Sets for reading.
// Conditional rules (TRÊN / GẦN) sit in st.cr and are checked per object only for the kinds and properties they name (st.cm).
const C2PB = {}; Object.keys(C2P).forEach((p, i) => { C2PB[p] = 1 << i; });
const c2Has = (st, k, p) => ((st.pm && st.pm[k]) & C2PB[p]) !== 0;
function c2Cond(st, o, c) {
  for (const t of st.objs) {
    if (t === o || c2Pk(t) !== c.k) continue;
    if (c.c === 'on' ? t.x === o.x && t.y === o.y : Math.abs(t.x - o.x) <= 1 && Math.abs(t.y - o.y) <= 1) return true;
  }
  return false;
}
function c2OHas(st, o, p) {
  const k = o.t === 'thing' ? o.k : 'text', b = C2PB[p];
  let m = st.pm ? st.pm[k] : 0;
  if (st.cm && (st.cm[k] & b)) {
    let pos = false, neg = false;
    for (const r of st.cr) if (r.a === k && r.prop === p && c2Cond(st, o, r.cond)) { if (r.neg) neg = true; else pos = true; }
    if (pos && !(st.nm[k] & b)) m |= b;
    if (neg) m &= ~b;
  }
  return (m & b) !== 0;
}
function c2AnyProp(st, p) {
  const b = C2PB[p];
  for (const k in st.pm) if (st.pm[k] & b) return true;
  if (st.cm) for (const k in st.cm) if (st.cm[k] & b) return true;
  return false;
}
function c2ParseRules(st) {
  const W = st.W, H = st.H, txt = new Array(W * H);
  for (const o of st.objs) if (o.t !== 'thing') txt[o.y * W + o.x] = o;
  const rules = [], at = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? txt[y * W + x] : undefined;
  // NOUN (VÀ NOUN)* [TRÊN|GẦN NOUN] (LÀ (PROP|NOUN) | CÓ NOUN | KHÔNG PROP) (VÀ …)*
  const scan = (x, y, dx, dy) => {
    // a noun inside a longer sentence (after VÀ, or the one after TRÊN/GẦN) does not start a sentence of its own
    const pv = at(x - dx, y - dy); if (pv && (pv.t === 'and' || pv.t === 'on' || pv.t === 'near')) { const pp = at(x - 2 * dx, y - 2 * dy); if (pp && pp.t === 'noun') return; }
    let cx = x, cy = y; const subj = [], cells = [];
    for (;;) {
      const n = at(cx, cy); if (!n || n.t !== 'noun') return;
      subj.push(n); cells.push(n); cx += dx; cy += dy;
      const a = at(cx, cy); if (a && a.t === 'and') { const nx = at(cx + dx, cy + dy); if (nx && nx.t === 'noun') { cells.push(a); cx += dx; cy += dy; continue; } }
      break;
    }
    let cond = null;
    const c = at(cx, cy);
    if (c && (c.t === 'on' || c.t === 'near')) {
      const cn = at(cx + dx, cy + dy); if (!cn || cn.t !== 'noun') return;
      cond = { c: c.t, k: cn.k }; cells.push(c, cn); cx += 2 * dx; cy += 2 * dy;
    }
    const v = at(cx, cy); if (!v || (v.t !== 'is' && v.t !== 'has' && v.t !== 'not')) return;
    cells.push(v); cx += dx; cy += dy;
    const objsR = [];
    for (;;) {
      const neg = v.t === 'not', o = at(cx, cy), used = [];
      if (!o || !(v.t === 'not' ? o.t === 'prop' : o.t === 'noun' || (o.t === 'prop' && v.t === 'is'))) break;
      used.push(o); objsR.push({ o, neg, used }); cx += dx; cy += dy;
      const a = at(cx, cy), nx = at(cx + dx, cy + dy);
      if (a && a.t === 'and' && nx && (nx.t === 'noun' || nx.t === 'prop')) { objsR[objsR.length - 1].and = a; cx += dx; cy += dy; continue; }
      break;
    }
    if (!objsR.length) return;
    const all = [...cells]; for (const r of objsR) { all.push(...r.used); if (r.and) all.push(r.and); }
    for (const s of subj) for (const r of objsR) rules.push({ a: s.k, verb: v.t === 'has' ? 'has' : 'is', neg: r.neg, prop: r.o.t === 'prop' ? r.o.p : null, to: r.o.t === 'noun' ? r.o.k : null, cond, cells: all });
  };
  for (let i = 0; i < W * H; i++) if (txt[i] && txt[i].t === 'noun') { const x = i % W, y = (i / W) | 0; scan(x, y, 1, 0); scan(x, y, 0, 1); }
  return rules;
}
function c2Props(st) {
  st.props = {}; for (const k in C2K) st.props[k] = new Set();
  for (const r of st.rules) if (r.verb === 'is' && r.prop && !r.neg && !r.cond) st.props[r.a].add(r.prop);
  for (const r of st.rules) if (r.verb === 'is' && r.prop && r.neg && !r.cond) st.props[r.a].delete(r.prop);
  st.pm = {}; for (const k in st.props) { let m = 0; for (const p of st.props[k]) m |= C2PB[p]; st.pm[k] = m; }
  st.cr = st.rules.filter(r => r.cond && r.verb === 'is' && r.prop); st.cm = null;
  if (st.cr.length) {
    st.cm = {}; st.nm = {};
    for (const r of st.cr) st.cm[r.a] = (st.cm[r.a] || 0) | C2PB[r.prop];
    for (const r of st.rules) if (r.verb === 'is' && r.prop && r.neg && !r.cond) st.nm[r.a] = (st.nm[r.a] || 0) | C2PB[r.prop];
  }
}
function c2Settle(st, keep) {
  for (let guard = 0; guard < 12; guard++) {
    if (!keep || guard) { st.rules = c2ParseRules(st); c2Props(st); }
    // NOUN LÀ NOUN: things turn into another kind, unless they are themselves (CHUỘT LÀ CHUỘT) or told not to
    let changed = false;
    const self = new Set(st.rules.filter(r => r.verb === 'is' && r.to === r.a && !r.neg && !r.cond).map(r => r.a));
    const nope = new Set(st.rules.filter(r => r.verb === 'is' && r.to && r.neg).map(r => r.a + '>' + r.to));
    const into = {}; for (const r of st.rules) if (r.verb === 'is' && r.to && !r.neg && !r.cond && r.to !== r.a && r.to !== 'text' && r.a !== 'text' && !self.has(r.a) && !nope.has(r.a + '>' + r.to) && !into[r.a]) into[r.a] = r.to;
    const turn = [];
    for (const r of st.rules) if (r.cond && r.verb === 'is' && r.to && !r.neg && r.to !== r.a && r.to !== 'text' && r.a !== 'text' && !self.has(r.a) && !nope.has(r.a + '>' + r.to))
      for (const o of st.objs) if (o.t === 'thing' && o.k === r.a && !into[o.k] && !turn.some(q => q[0] === o) && c2Cond(st, o, r.cond)) turn.push([o, r.to]);
    for (const o of st.objs) if (o.t === 'thing' && into[o.k]) { o.k = into[o.k]; changed = true; }
    for (const [o, to] of turn) { o.k = to; changed = true; }
    if (changed) continue;
    const cells = c2Grid(st);
    const dead = new Set(), fl = o => c2OHas(st, o, 'float');
    let anyHot = false; for (const k in st.pm) if (st.pm[k] & C2PB.hot) anyHot = true; if (st.cm) for (const k in st.cm) if (st.cm[k] & C2PB.hot) anyHot = true;
    for (const l of cells) {
      if (!l || (l.length < 2 && !(anyHot && c2OHas(st, l[0], 'hot')))) continue;
      for (const f of [false, true]) {
        const g = l.filter(o => fl(o) === f); if (!g.length) continue;
        if (g.length > 1 && g.some(o => c2OHas(st, o, 'sink'))) g.forEach(o => dead.add(o));
        if (g.some(o => c2OHas(st, o, 'hot'))) g.forEach(o => { if (c2OHas(st, o, 'you') || c2OHas(st, o, 'melt')) dead.add(o); });
        const op = g.filter(o => c2OHas(st, o, 'open')), sh = g.filter(o => c2OHas(st, o, 'shut'));
        for (let i = 0; i < Math.min(op.length, sh.length); i++) { if (op[i] === sh[i]) continue; dead.add(op[i]); dead.add(sh[i]); }
        if (g.length > 1) g.forEach(o => { if (c2OHas(st, o, 'weak')) dead.add(o); });
      }
    }
    for (const o of dead) if (c2OHas(st, o, 'safe')) dead.delete(o);                 // BỀN: nothing destroys it
    if (dead.size) {
      // CÓ: what is left behind
      const left = [];
      for (const o of dead) for (const r of st.rules) if (r.verb === 'has' && r.a === c2Pk(o) && r.to && r.to !== 'text' && (!r.cond || c2Cond(st, o, r.cond))) left.push({ t: 'thing', k: r.to, id: st.nid++, x: o.x, y: o.y, dir: o.dir || 'R', rx: o.rx, ry: o.ry });
      st.objs = st.objs.filter(o => !dead.has(o)); st.objs.push(...left);
      continue;
    }
    if (c2Fall(st)) continue;
    st.won = false;
    for (const l of cells) if (l && l.some(o => c2OHas(st, o, 'you') && l.some(w => c2OHas(st, w, 'win') && fl(w) === fl(o)))) { st.won = true; break; }
    st.dead = !st.objs.some(o => c2OHas(st, o, 'you'));
    return;
  }
}
const c2IsPush = (st, o) => c2OHas(st, o, 'push') || (o.t !== 'thing' && !o.fix);
const c2IsStop = (st, o) => c2OHas(st, o, 'stop');
// what a falling o lands on
const c2Solid = (st, t, o) => t.fix || c2IsPush(st, t) || c2IsStop(st, t) || c2OHas(st, t, 'pull') || (c2OHas(st, t, 'shut') && !c2OHas(st, o, 'open'));
// RƠI: everything that falls drops (lowest first) until the edge or something solid
function c2Fall(st) {
  if (!c2AnyProp(st, 'fall')) return false;
  const fs = st.objs.filter(o => !o.fix && c2OHas(st, o, 'fall')).sort((a, b) => b.y - a.y);
  if (!fs.length) return false;
  const g = c2Grid(st); let any = false;
  for (const o of fs) while (o.y + 1 < st.H && !(g[(o.y + 1) * st.W + o.x] || []).some(t => t !== o && c2Solid(st, t, o))) { c2Shift(st, g, o, 0, 1); any = true; }
  return any;
}
// can o move one cell (dx, dy)? pushes are gathered in list, things it trades places with (ĐỔI) in swaps; the grid g maps cells to objects
function c2CanMove(st, g, o, dx, dy, list, swaps, depth = 0) {
  const nx = o.x + dx, ny = o.y + dy;
  if (nx < 0 || ny < 0 || nx >= st.W || ny >= st.H || depth > 60) return false;
  const here = g[ny * st.W + nx];
  if (here) {
    const oSwap = c2OHas(st, o, 'swap');
    for (const t of here) {
      if (t === o || list.includes(t) || swaps.includes(t)) continue;
      if (t.fix) return false;
      if (oSwap || c2OHas(st, t, 'swap')) { swaps.push(t); continue; }
      if (c2IsPush(st, t)) { if (!c2CanMove(st, g, t, dx, dy, list, swaps, depth + 1)) return false; continue; }
      if (c2IsStop(st, t) || c2OHas(st, t, 'pull')) return false;
      if (c2OHas(st, t, 'shut') && !c2OHas(st, o, 'open')) return false;
    }
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
    const list = [], swaps = [];
    if (!c2CanMove(st, g, m, dx, dy, list, swaps)) continue;
    const pulls = [];
    let bx = m.x - dx, by = m.y - dy, guard = 0;
    while (bx >= 0 && by >= 0 && bx < st.W && by < st.H && guard++ < 40) {               // a chain of KÉO behind it follows
      const p = (g[by * st.W + bx] || []).filter(t => c2OHas(st, t, 'pull') && !t.fix && !list.includes(t) && !pulls.includes(t));
      if (!p.length) break; pulls.push(...p); bx -= dx; by -= dy;
    }
    for (const o of list) c2Shift(st, g, o, dx, dy);
    for (const o of pulls) c2Shift(st, g, o, dx, dy);
    for (const o of swaps) c2Shift(st, g, o, -dx, -dy);
    moved = true;
  }
  return moved;
}
// CHUYỂN: a thing that has just come onto a pad (it moved, the pad moved, or the rule is new) goes to the next pad of that kind
function c2Tele(st, before, wasTele) {
  if (!c2AnyProp(st, 'tele')) return false;
  const byK = {};
  for (const o of st.objs) if (o.t === 'thing' && c2OHas(st, o, 'tele')) (byK[o.k] || (byK[o.k] = [])).push(o);
  const g = c2Grid(st), done = new Set(), moved = o => { const b = before.get(o.id); return b === undefined || b !== o.x * 1000 + o.y; };
  let any = false;
  for (const k in byK) {
    const ps = byK[k].sort((a, b) => a.id - b.id); if (ps.length < 2) continue;
    ps.forEach((p, i) => {
      const fresh = !wasTele.has(k) || moved(p), q = ps[(i + 1) % ps.length];
      for (const t of (g[p.y * st.W + p.x] || []).slice()) {
        if (t === p || done.has(t) || t.fix || ps.includes(t)) continue;            // stacked pads do not send each other
        if (c2OHas(st, t, 'float') !== c2OHas(st, p, 'float')) continue;
        if (!fresh && !moved(t)) continue;
        c2Shift(st, g, t, q.x - t.x, q.y - t.y); done.add(t); any = true;
      }
    });
  }
  return any;
}
const c2Sk = st => st.objs.map(o => o.id + ':' + o.x + ',' + o.y + ':' + (o.k || o.p || o.t)).join('|');
function c2Step(st, dx, dy) {
  const g = c2Grid(st), d = c2DirOf(dx, dy); st.tdirty = false;
  const teleOn = c2AnyProp(st, 'tele'), before = teleOn ? new Map(st.objs.map(o => [o.id, o.x * 1000 + o.y])) : null;
  const wasTele = new Set(); if (teleOn) for (const k in st.pm) if (st.pm[k] & C2PB.tele) wasTele.add(k);
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
  // TRÔI: what stands on a shifter (and floats as it does) is carried one cell its way and turned to face it
  const sh = st.objs.filter(o => o.t === 'thing' && c2OHas(st, o, 'shift'));
  if (sh.length) {
    const jobs = [];
    for (const s of sh) for (const t of (g[s.y * st.W + s.x] || [])) if (t !== s && !t.fix && c2OHas(st, t, 'float') === c2OHas(st, s, 'float')) jobs.push([t, s.dir]);
    for (const [t, sd] of jobs) {
      if (!st.objs.includes(t)) continue;
      const [mx, my] = C2_DXY[sd];
      if (c2MoveGroup(st, g, [t], mx, my)) changed = true;
      if (t.t === 'thing' && t.dir !== sd) { t.dir = sd; changed = true; }
    }
  }
  if (!changed) return false;
  c2Settle(st, !st.tdirty);
  if (teleOn || c2AnyProp(st, 'tele')) { if (c2Tele(st, before || new Map(), wasTele)) c2Settle(st, false); }
  return true;
}
