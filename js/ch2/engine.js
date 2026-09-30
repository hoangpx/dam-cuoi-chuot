/* Pure rules engine (no drawing): parse a map, read the rules, settle transforms/sinking/heat, step YOU. */
function c2Parse(def) {
  const objs = []; let id = 0;
  def.map.forEach((row, y) => [...row].forEach((ch, x) => {
    let o = null;
    if (C2THING[ch]) o = { t: 'thing', k: C2THING[ch] };
    else if (C2NOUN[ch]) o = { t: 'noun', k: C2NOUN[ch] };
    else if (ch === '=') o = { t: 'is' };
    else if (C2PROP[ch]) o = { t: 'prop', p: C2PROP[ch] };
    if (o) { o.id = id++; o.x = x; o.y = y; objs.push(o); }
  }));
  for (const [x, y] of def.fixed || []) for (const o of objs) if (o.x === x && o.y === y && o.t !== 'thing') o.fix = true;
  return { W: def.map[0].length, H: def.map.length, objs, rules: [], props: {}, won: false, dead: false };
}
const c2Has = (st, k, p) => { const s = st.props && st.props[k]; return !!(s && s.has(p)); };
function c2ParseRules(st) {
  const txt = new Map();
  for (const o of st.objs) if (o.t !== 'thing') txt.set(o.x + ',' + o.y, o);
  const rules = [];
  const scan = (x, y, dx, dy) => {
    const a = txt.get(x + ',' + y), b = txt.get((x + dx) + ',' + (y + dy)), c = txt.get((x + 2 * dx) + ',' + (y + 2 * dy));
    if (a && b && c && a.t === 'noun' && b.t === 'is' && (c.t === 'prop' || c.t === 'noun')) rules.push({ a: a.k, prop: c.t === 'prop' ? c.p : null, to: c.t === 'noun' ? c.k : null, cells: [a, b, c] });
  };
  for (let y = 0; y < st.H; y++) for (let x = 0; x < st.W; x++) { scan(x, y, 1, 0); scan(x, y, 0, 1); }
  return rules;
}
function c2Settle(st) {
  for (let guard = 0; guard < 10; guard++) {
    st.rules = c2ParseRules(st);
    st.props = {}; for (const k in C2K) st.props[k] = new Set();
    for (const r of st.rules) if (r.prop) st.props[r.a].add(r.prop);
    let changed = false;
    for (const r of st.rules) if (r.to && r.to !== r.a) for (const o of st.objs) if (o.t === 'thing' && o.k === r.a) { o.k = r.to; changed = true; }
    if (changed) continue;
    const cells = new Map();
    for (const o of st.objs) { const key = o.x + ',' + o.y; let l = cells.get(key); if (!l) cells.set(key, l = []); l.push(o); }
    const dead = new Set();
    for (const l of cells.values()) {
      if (l.length > 1 && l.some(o => o.t === 'thing' && c2Has(st, o.k, 'sink'))) l.forEach(o => dead.add(o));
      if (l.some(o => o.t === 'thing' && c2Has(st, o.k, 'hot'))) l.forEach(o => { if (o.t === 'thing' && c2Has(st, o.k, 'you')) dead.add(o); });
    }
    if (dead.size) { st.objs = st.objs.filter(o => !dead.has(o)); continue; }
    st.won = [...cells.values()].some(l => l.some(o => o.t === 'thing' && c2Has(st, o.k, 'you')) && l.some(o => o.t === 'thing' && c2Has(st, o.k, 'win')));
    st.dead = !st.objs.some(o => o.t === 'thing' && c2Has(st, o.k, 'you'));
    return;
  }
}
const c2IsPush = (st, o) => o.t === 'thing' ? c2Has(st, o.k, 'push') : !o.fix;
const c2IsStop = (st, o) => o.t === 'thing' && c2Has(st, o.k, 'stop');
function c2CanPush(st, o, dx, dy, list) {
  const nx = o.x + dx, ny = o.y + dy;
  if (nx < 0 || ny < 0 || nx >= st.W || ny >= st.H) return false;
  for (const t of st.objs) if (t !== o && t.x === nx && t.y === ny) {
    if (t.fix) return false;
    if (c2IsPush(st, t)) { if (!c2CanPush(st, t, dx, dy, list)) return false; }
    else if (c2IsStop(st, t)) return false;
  }
  if (!list.includes(o)) list.push(o);
  return true;
}
const c2Sk = st => st.objs.map(o => o.id + ':' + o.x + ',' + o.y + ':' + (o.k || o.p || o.t)).join('|');
function c2Step(st, dx, dy) {
  const before = c2Sk(st);
  const you = st.objs.filter(o => o.t === 'thing' && c2Has(st, o.k, 'you'));
  you.sort((a, b) => (b.x - a.x) * dx + (b.y - a.y) * dy);
  for (const m of you) {
    if (!st.objs.includes(m)) continue;
    const list = [];
    if (c2CanPush(st, m, dx, dy, list)) for (const o of list) { o.x += dx; o.y += dy; }
  }
  c2Settle(st);
  return c2Sk(st) !== before;
}
