/* Chương VIII: search for levels with FEW things that are hard to FIND (owner, 2026-10-12: "20 more, hard or harder than the last 19, more
   creative and clever, not always ice or rock, mixed, interesting to play and hard to find, less than 10 objects, more moves"). With at most
   MAXT things there are at most MAXT/3 swipes, so the moves come from rock pushes and the difficulty from finding them: the score is
   tools/c8-find.js bits (luck needed along the road), plus the fewest swipes and pushes every solution needs (strict and generous model).
   Simulated annealing inside a frame's zone ('.'); every board that qualifies is played in the real engine (tools/c8-plan.js) before it goes
   to tools/c8-hard/few-<frame>-<seed>-found.jsonl; then the run starts again from a fresh board.
   node tools/c8-few-search.js <frame> <seed> <minutes> <kinds>    env: MAXT=9 BITS=10 MOVES=14 (swipes + pushes) MINSW=2;
   MODE=swipe: no pushes needed, qualify on MINSW (default 3) and BITS (default 12) alone (levels without rocks) */
const fs = require('fs'), { solve, planOf } = require('./c8-push-solve.js'), { findBits } = require('./c8-find.js'), { runPlan } = require('./c8-plan.js');
const FRAMES = {
  // a floor with two 1-wide pits on the way to a ledge three high: rocks pushed along fall into the pits and fill them
  twopits: ['##################', '#                #', '#                #', '#                #', '#                #', '#             G  #', '#            ####',
            '#  ....      ####', '#P ....      ####', '######## ## ######', '##################'].map(r => r.padEnd(18, '#')),
  // a small room, the chest three up on a ledge
  ledge3: ['##############', '#            #', '#            #', '#            #', '#          G #', '#        #####', '#  ......#####', '#P ......#####', '##############'],
  // the low gate of the last batch, a smaller zone
  gate: ['####################', '#          #       #', '#          #       #', '#          #       #', '#          #       #', '#          #       #', '#          #       #',
         '#         .#.      #', '#  ...   .....     #', '#P ...   .....   G #', '####################'],
  // two hanging walls with low gaps
  gate2: ['####################', '#      #     #     #', '#      #     #     #', '#      #     #     #', '#      #     #     #', '#      #     #     #', '#      #     #     #',
          '#     .#.   .#.    #', '#  .. ...   ...    #', '#P .. ...   ...  G #', '####################'],
  // a gate, then a ledge four high with the chest on it (as tools/c8-push-search.js)
  gateledge: ['####################', '#        #         #', '#        #         #', '#        #         #', '#        #         #', '#        #       G #', '#        #  ...#####',
              '#      ..#.....#####', '#  ..  ........#####', '#P ..  ........#####', '####################'],
  // a 3-high tunnel under a roof, the chest past its end (as tools/c8-push-search.js)
  tunnel3: ['####################', '#     ##########   #', '#     ##########   #', '#     ##########   #', '#     ##########   #', '#     ##########   #', '#  ...##########   #',
            '#  ... ......      #', '#  ... ......      #', '#P ... ......   G  #', '####################'],
  // a cliff, the chest four up
  cliff: ['##################', '#                #', '#                #', '#              G #', '#            #####', '#         ...#####', '#  ...    ...#####', '#P ...    ...#####', '##################'],
  // a pit two wide and two deep before a ledge two up
  pit: ['##################', '#                #', '#                #', '#             G  #', '#           ######', '#  ...      ######', '#P ...      ######', '#######..#########', '#######..#########', '##################'],
};
for (const k in FRAMES) if (FRAMES[k].some(r => r.length !== FRAMES[k][0].length)) throw new Error('frame ' + k + ': rows of different lengths');
const name = process.argv[2] || 'twopits', seed0 = +(process.argv[3] || 1), minutes = +(process.argv[4] || 5), KINDS = process.argv[5] || 'adbrrr', frame = FRAMES[name];
if (!frame) throw new Error('frames: ' + Object.keys(FRAMES));
const SWIPE = process.env.MODE === 'swipe', MAXT = +(process.env.MAXT || 9), BITS = +(process.env.BITS || (SWIPE ? 12 : 10)), MOVES = +(process.env.MOVES || 14), MINSW = +(process.env.MINSW || (SWIPE ? 3 : 2));
let seed = seed0 * 7919 + 13; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const zone = []; frame.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') zone.push(x + ',' + y); }));
const build = th => frame.map((r, y) => [...r].map((c, x) => c === '.' ? (th.get(x + ',' + y) || ' ') : c).join(''));
const settleMap = th => { const t = new Map(), cols = {}; for (const [k, v] of th) { const [x, y] = k.split(',').map(Number); (cols[x] = cols[x] || []).push([y, v]); }
  for (const x in cols) { const zs = zone.map(z => z.split(',').map(Number)).filter(([zx]) => zx === +x).map(([, y]) => y).sort((a, b) => b - a), items = cols[x].sort((a, b) => b[0] - a[0]);
    items.forEach(([, v], i) => { if (i < zs.length) t.set(x + ',' + zs[i], v); }); } return t; };
const CAP = 20000;
function score(th) {
  const map = build(th), things = th.size;
  if (things > MAXT) return { s: -200, map };
  const a = solve(map, { by: 'swipes', cap: CAP }); if (a.capped) return { s: -150, map }; if (!a.cost) return { s: -100, map };
  const b = solve(map, { by: 'pushes', cap: CAP }); if (b.capped || !b.cost) return { s: -150, map };
  const f = findBits(map, { cap: 30000 }); if (f.capped || f.unsolvable) return { s: -120, map };
  const sw = a.cost.swipes, pu = b.cost.pushes, moves = sw + pu;
  let s = Math.min(f.bits, 30) * 6 + Math.min(sw, MINSW + 1) * 12 - Math.max(0, MINSW - sw) * 40 + (SWIPE ? 0 : Math.min(moves, MOVES + 4) * 3) + f.dead * 10;   // a missing swipe costs a lot: with few things one swipe and many pushes is the easy optimum
  let loose = null, ok = false;
  if (f.bits >= BITS && sw >= MINSW && (SWIPE || moves >= MOVES)) {
    const la = solve(map, { by: 'swipes', cap: CAP, strict: 'loose' }), lb = solve(map, { by: 'pushes', cap: CAP, strict: 'loose' }), lf = findBits(map, { strict: 'loose', cap: 30000 });
    loose = { sw: la.cost ? la.cost.swipes : null, pu: lb.cost ? lb.cost.pushes : null, bits: lf.bits, capped: !!(la.capped || lb.capped || lf.capped) };
    ok = !loose.capped && loose.sw >= MINSW && (SWIPE || loose.sw + loose.pu >= MOVES) && loose.bits >= BITS * .7;
    s += ok ? 40 : -10;
  }
  return { s, map, sw, pu, moves, things, bits: f.bits, steps: f.steps, dead: f.dead, loose, ok };
}
function mutate(th) {
  const t = new Map(th), keys = [...t.keys()], r = rnd();
  if ((r < .2 && keys.length < MAXT) || keys.length < 4) { const z = pick(zone); if (!t.has(z)) t.set(z, pick(KINDS)); }
  else if (r < .3 && keys.length > 4) t.delete(pick(keys));
  else if (r < .55) t.set(pick(keys), pick(KINDS));
  else if (r < .7) { const a = pick(keys), b = pick(keys), ka = t.get(a); t.set(a, t.get(b)); t.set(b, ka); }
  else { const a = pick(keys), z = pick(zone); if (!t.has(z)) { t.set(z, t.get(a)); t.delete(a); } }
  return t;
}
fs.mkdirSync(__dirname + '/c8-hard', { recursive: true });
const found = __dirname + `/c8-hard/few-${name}-${seed0}-found.jsonl`, end = Date.now() + minutes * 60000;
let best = -Infinity;
while (Date.now() < end) {
  let th = new Map(); const n = 5 + Math.floor(rnd() * (MAXT - 4)); while (th.size < n) th.set(pick(zone), pick(KINDS)); th = settleMap(th);
  let cur = score(th), top = cur.s, stale = 0, T = 12;
  while (stale < 800 && Date.now() < end) {
    let t2 = th; for (let k = 1 + Math.floor(rnd() * 3); k > 0; k--) t2 = mutate(t2); t2 = settleMap(t2);
    const c2 = score(t2);
    if (c2.s >= cur.s || rnd() < Math.exp((c2.s - cur.s) / T)) { th = t2; cur = c2; }
    if (cur.s > top) { top = cur.s; stale = 0; } else stale++;
    T = Math.max(1, T * .997);
    if (cur.s > best && cur.sw !== undefined) { best = cur.s; console.log('best', cur.s.toFixed(1), JSON.stringify({ sw: cur.sw, pu: cur.pu, things: cur.things, bits: cur.bits, loose: cur.loose })); }
    if (cur.ok) {                                                          // the real engine must play the road too
      const r = runPlan(cur.map, planOf(cur.map, solve(cur.map, { by: 'swipes', cap: CAP }).moves), { cap: 60000, depth: 80 });
      if (r.won) { fs.appendFileSync(found, JSON.stringify(cur) + '\n'); console.log('FOUND', JSON.stringify({ sw: cur.sw, pu: cur.pu, things: cur.things, bits: cur.bits, loose: cur.loose })); break; }
      console.log('engine refused (step ' + r.step + ', ' + r.why + ')'); cur = Object.assign({}, cur, { s: cur.s - 60, ok: false });
    }
  }
}
