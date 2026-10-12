/* Chương VIII: search for a level that is hard the way level 4 Crumbly Overhang is hard (owner, 2026-10-11: "very hard but not by lots of
   moves or lots of objects, clever and creative, like game 4"). Crumbly: 2 swipes, 16 things, 1 good opener of 41, 98 % of the openers dead,
   the obvious opener fails; its answer is one long chain whose SHAPE decides which things are left as stairs.
   Scored with tools/c8-hardness.js (strict model, swipes up to MP cells):
   - 2 or 3 swipes, few things (≤ 15), every swipe a narrow choice, one or two roads,
   - most openers dead (no win at all afterwards), the openers that at once open new ground fail, the right opener shows no progress,
   - the answer uses a long chain (5+ cells, shape matters) and more than one kind of thing.
   Hill-climbs things (kinds KINDS, 'o' = pegs) inside the zone ('.') of a frame.
   node tools/c8-clever-search.js <frame> <seed> <minutes> [KINDS=adbo] [MP=8]     best candidates -> tools/c8-hard/clever-<frame>-<seed>.jsonl */
const fs = require('fs'), { hardness } = require('./c8-hardness.js');
const FRAMES = {
  // a cliff: the chest on top, six cells above the floor; the pile stands against the cliff
  cliff: ['###############', '#             #', '#          G  #', '#        ######', '#      ...#####', '#      ...#####', '#      ...#####', '#      ...#####', '#P     ...#####', '###############'],
  // a pit three wide in front of a ledge four up: the things in the pit become the bridge and the step
  pit: ['###############', '#             #', '#           G #', '#         #####', '#   .... ######', '#P  .... ######', '####....#######', '####....#######', '####....#######', '###############'],
  // an overhang: the chest on a shelf that juts out over the pile, so the last step must be right under its lip
  lip: ['###############', '#             #', '#             #', '#    G        #', '#  #####      #', '#        .... #', '#        .... #', '#        .... #', '#        .... #', '#P       .... #', '###############'],
};
const name = process.argv[2] || 'cliff', seed0 = +(process.argv[3] || 1), minutes = +(process.argv[4] || 5), KINDS = process.argv[5] || 'adbo', MP = +(process.argv[6] || 8);
const frame = FRAMES[name]; if (!frame) throw new Error('frames: ' + Object.keys(FRAMES));
let seed = seed0 * 7919 + 13; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const zone = []; frame.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') zone.push(x + ',' + y); }));
const build = th => frame.map((r, y) => [...r].map((c, x) => c === '.' ? (th.get(x + ',' + y) || ' ') : c).join(''));
function score(th) {
  const map = build(th); let h; try { h = hardness(map, { mp: MP, maxDepth: 4, cap: 60000, strict: true }); } catch (e) { return { s: -200, h: null, map }; }
  if (!h || h.capped || !h.shortest) return { s: -100 + (h && h.capped ? -50 : 0), h, map };
  let s = h.shortest === 2 ? 10 : h.shortest === 3 ? 14 : h.shortest === 4 ? 8 : 0;
  let bits = 0; for (const st of h.steps.split(' ')) { const [g, o] = st.split('/').map(Number); bits += Math.log2(o / g); }
  s += Math.min(bits, 14) * 1.5;
  s -= Math.max(0, Math.log2(h.roads) - 1) * 5;
  s += h.deadFirst * 12;
  if (!h.hidden) s -= 10; if (h.greedyGood) s -= 12; if (h.greedy) s += 3;
  if (Math.max(...h.sol.map(x => x.cells.length)) >= 5) s += 6;                  // a long chain whose shape matters
  if (new Set(h.sol.map(x => x.kind)).size >= 2) s += 4;                          // more than one kind takes part
  if (h.sol.some(x => x.melt)) s += 3;
  if (h.things > 15) s -= (h.things - 15) * 3;
  return { s, h, map };
}
function mutate(th) {
  const t = new Map(th), keys = [...t.keys()], r = rnd();
  if ((r < .15 && keys.length < 16) || keys.length < 6) { const z = pick(zone); if (!t.has(z)) t.set(z, pick(KINDS)); }
  else if (r < .27 && keys.length > 6) t.delete(pick(keys));
  else if (r < .5) t.set(pick(keys), pick(KINDS));
  else if (r < .65) { const a = pick(keys), b = pick(keys), ka = t.get(a); t.set(a, t.get(b)); t.set(b, ka); }
  else { const a = pick(keys), z = pick(zone); if (!t.has(z)) { t.set(z, t.get(a)); t.delete(a); } }
  return t;
}
// things are kept settled: nothing floats in the stored map (the frame's zone runs down to the floor or to earth)
const settleMap = th => { const t = new Map(); const cols = {}; for (const [k, v] of th) { const [x, y] = k.split(',').map(Number); (cols[x] = cols[x] || []).push([y, v]); }
  for (const x in cols) { const zs = zone.map(z => z.split(',').map(Number)).filter(([zx]) => zx === +x).map(([, y]) => y).sort((a, b) => b - a), items = cols[x].sort((a, b) => b[0] - a[0]);
    items.forEach(([, v], i) => { if (i < zs.length) t.set(x + ',' + zs[i], v); }); } return t; };
fs.mkdirSync(__dirname + '/c8-hard', { recursive: true });
const out = __dirname + `/c8-hard/clever-${name}-${seed0}.jsonl`, end = Date.now() + minutes * 60000;
let best = -Infinity;
while (Date.now() < end) {
  let th = new Map(); const n = 8 + Math.floor(rnd() * 6); while (th.size < n) th.set(pick(zone), pick(KINDS)); th = settleMap(th);
  let cur = score(th), stale = 0;
  while (stale < 300 && Date.now() < end) {
    const t2 = settleMap(mutate(th)), c2 = score(t2);
    if (c2.s >= cur.s) { if (c2.s > cur.s) stale = 0; th = t2; cur = c2; } else stale++;
    if (cur.s > best && cur.h && cur.h.shortest) { best = cur.s; const { sol, ...rest } = cur.h; fs.appendFileSync(out, JSON.stringify({ score: +cur.s.toFixed(2), ...rest, map: cur.map, sol }) + '\n');
      console.log(cur.s.toFixed(1), JSON.stringify(rest)); }
  }
}
