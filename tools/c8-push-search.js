/* Chương VIII: search for a level whose EVERY solution needs at least MINSW swipes and MINPU rock pushes (owner, 2026-10-11, about
   Vách Chum: "still not that hard, more than 5 swipes and 10 pushes"). Things (KINDS, r = rock, o = peg) are hill-climbed inside the zone
   ('.') of a frame; each board is solved twice by tools/c8-push-solve.js (fewest swipes first, then fewest pushes first) in the STRICT
   model, and a board that meets both counts is solved again in the generous ('loose') model, which must also need them (a good jumper
   must not get through cheaper).
   node tools/c8-push-search.js <frame> <seed> <minutes> [KINDS=adbor] [MINSW=5] [MINPU=10]     -> tools/c8-hard/push-<frame>-<seed>.jsonl */
const fs = require('fs'), { solve } = require('./c8-push-solve.js');
const FRAMES = {
  // Vách Chum widened: the jar pile against the cliff (chest six up) and room on the floor at the left where rocks can start
  cliff: ['####################', '#                  #', '#                  #', '#                G #', '#             ######', '#          ...######', '#          ...######', '#          ...######',
          '#  ....    ...######', '#P ....    ...######', '####################'],
  // the same with a pit three wide and two deep in the floor between the rocks and the pile
  pit: ['####################', '#                  #', '#                  #', '#                G #', '#             ######', '#          ...######', '#          ...######', '#          ...######',
        '#  ...     ...######', '#P ...     ...######', '######   ###########', '######   ###########', '####################'],
  // taller: the chest eight up, a pile zone four wide and seven high against the cliff, rocks at the left
  tall: ['#####################', '#                   #', '#                   #', '#                 G #', '#              ######', '#          ....######', '#          ....######', '#          ....######',
         '#          ....######', '#          ....######', '#  ...     ....######', '#P ...     ....######', '#####################'],
};
const name = process.argv[2] || 'cliff', seed0 = +(process.argv[3] || 1), minutes = +(process.argv[4] || 5), KINDS = process.argv[5] || 'adbor';
const MINSW = +(process.argv[6] || 5), MINPU = +(process.argv[7] || 10), frame = FRAMES[name]; if (!frame) throw new Error('frames: ' + Object.keys(FRAMES));
let seed = seed0 * 7919 + 13; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const zone = []; frame.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') zone.push(x + ',' + y); }));
const build = th => frame.map((r, y) => [...r].map((c, x) => c === '.' ? (th.get(x + ',' + y) || ' ') : c).join(''));
const settleMap = th => { const t = new Map(), cols = {}; for (const [k, v] of th) { const [x, y] = k.split(',').map(Number); (cols[x] = cols[x] || []).push([y, v]); }
  for (const x in cols) { const zs = zone.map(z => z.split(',').map(Number)).filter(([zx]) => zx === +x).map(([, y]) => y).sort((a, b) => b - a), items = cols[x].sort((a, b) => b[0] - a[0]);
    items.forEach(([, v], i) => { if (i < zs.length) t.set(x + ',' + zs[i], v); }); } return t; };
const CAP = 40000;
function score(th) {
  const map = build(th), things = [...th.values()].filter(v => v !== ' ').length;
  const a = solve(map, { by: 'swipes', cap: CAP }); if (a.capped) return { s: -150, map };
  if (!a.cost) return { s: -100, map };
  const b = solve(map, { by: 'pushes', cap: CAP }); if (b.capped || !b.cost) return { s: -150, map };
  const sw = a.cost.swipes, pu = b.cost.pushes;
  let s = Math.min(sw, MINSW + 1) * 25 + Math.min(pu, MINPU + 2) * 4 - Math.max(0, things - 26) * 3;   // swipes are the hard part to force
  let loose = null;
  if (sw >= MINSW && pu >= MINPU) {
    const la = solve(map, { by: 'swipes', cap: CAP, strict: 'loose' }), lb = solve(map, { by: 'pushes', cap: CAP, strict: 'loose' });
    loose = { sw: la.cost ? la.cost.swipes : null, pu: lb.cost ? lb.cost.pushes : null, capped: !!(la.capped || lb.capped) };
    if (!loose.capped && loose.sw >= MINSW && loose.pu >= MINPU) s += 40; else s -= 10;
  }
  return { s, map, sw, pu, things, loose, planSw: a.plan, planPu: b.plan, swCost: a.cost, puCost: b.cost };
}
function mutate(th) {
  const t = new Map(th), keys = [...t.keys()], r = rnd();
  if ((r < .2 && keys.length < 28) || keys.length < 8) { const z = pick(zone); if (!t.has(z)) t.set(z, pick(KINDS)); }
  else if (r < .3 && keys.length > 8) t.delete(pick(keys));
  else if (r < .55) t.set(pick(keys), pick(KINDS));
  else if (r < .7) { const a = pick(keys), b = pick(keys), ka = t.get(a); t.set(a, t.get(b)); t.set(b, ka); }
  else { const a = pick(keys), z = pick(zone); if (!t.has(z)) { t.set(z, t.get(a)); t.delete(a); } }
  return t;
}
fs.mkdirSync(__dirname + '/c8-hard', { recursive: true });
const out = __dirname + `/c8-hard/push-${name}-${seed0}.jsonl`, end = Date.now() + minutes * 60000;
let best = -Infinity;
while (Date.now() < end) {
  let th = new Map(); const n = 10 + Math.floor(rnd() * 8); while (th.size < n) th.set(pick(zone), pick(KINDS)); th = settleMap(th);
  if (process.env.FROM) {                                                  // FROM=<jsonl>: climb on from the best board of an earlier run (same frame)
    const ls = fs.readFileSync(process.env.FROM, 'utf8').trim().split('\n'), m = JSON.parse(ls[ls.length - 1]).map; th = new Map();
    for (const z of zone) { const [x, y] = z.split(',').map(Number); if (m[y][x] !== ' ') th.set(z, m[y][x]); } }
  let cur = score(th), stale = 0;
  while (stale < 150 && Date.now() < end) {
    const t2 = settleMap(mutate(th)), c2 = score(t2);
    if (c2.s >= cur.s) { if (c2.s > cur.s) stale = 0; th = t2; cur = c2; } else stale++;
    if (cur.s > best && cur.sw !== undefined) { best = cur.s; fs.appendFileSync(out, JSON.stringify(cur) + '\n');
      console.log(cur.s.toFixed(1), JSON.stringify({ sw: cur.sw, pu: cur.pu, things: cur.things, loose: cur.loose })); }
  }
}
