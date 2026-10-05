/* Chương II solver: breadth-first search over moves (U D L R) from a state, used by tools/c2-solve.js to check
   every map can be won (not loaded by the game). c2Solve(st, cap) → { moves: 'RRUL…' | null, states }. */
const C2_DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
function c2Snap(st) { return { W: st.W, H: st.H, objs: st.objs.map(o => ({ ...o })), rules: st.rules, props: st.props, pm: st.pm, won: st.won, dead: st.dead, nid: st.nid, dirMatters: st.dirMatters }; }
function c2StKey(st) { let s = ''; for (const o of st.objs) s += o.id + (o.t === 'thing' ? o.k : '') + (st.dirMatters && o.dir ? o.dir : '') + String.fromCharCode(48 + o.x, 48 + o.y); return s; }
function c2Solve(st0, cap = 200000) {
  const seen = new Set([c2StKey(st0)]); let front = [{ st: c2Snap(st0), m: '' }], states = 1;
  while (front.length) {
    const next = [];
    for (const n of front) for (const d in C2_DIRS) {
      const st = c2Snap(n.st); if (!c2Step(st, C2_DIRS[d][0], C2_DIRS[d][1])) continue;
      if (st.won) return { moves: n.m + d, states };
      if (st.dead) continue;
      const k = c2StKey(st); if (seen.has(k)) continue; seen.add(k); states++;
      if (states > cap) return { moves: null, states, capped: true };
      next.push({ st, m: n.m + d });
    }
    front = next;
  }
  return { moves: null, states };
}
