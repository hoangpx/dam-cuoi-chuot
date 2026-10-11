/* Chương VIII: search for a level that is hard to FIND (owner, 2026-10-11, PR #3 "too easy"): few things, few swipes, but
   - every swipe is a narrow choice (good/options small at each step, one or two roads, so no filler swipes done in any order),
   - the obvious opener (a swipe that at once lets the mouse reach new ground) fails, and the right opener shows no progress,
   - a flame swipe that melts ice is part of the answer (its drag direction matters).
   Hill-climbs things (kinds KINDS) inside the zone ('.') of a hand-made frame, scored with tools/c8-hardness.js (model, swipes up to MP).
   node tools/c8-hard-search.js <frame name> <seed> <minutes> [KINDS=adiv] [MP=6]     best candidates -> tools/c8-hard/<frame>-<seed>.jsonl */
const fs = require('fs'), { hardness } = require('./c8-hardness.js');
const FRAMES = {
  // the frame of level 23 v1: a tunnel under a roof, the chest up a 1-wide shaft at the right
  shaft: ['##############', '###########  #', '###########  #', '########### G#', '###########.##', '#     ......##', '#    .......##', '#    .......##', '#P   .......##', '##############'],
  // an open hall: the chest on a ledge four cells up, a pit in front of it
  hall: ['###############', '#             #', '#             #', '#          G  #', '#    .... #####', '#    .... #####', '#    .... #####', '#    ....  ####', '#P   ....  ####', '######....#####', '###############'],
  // a hall with a pit before a high ledge: the chest four cells up on the far side
  pit: ['###############', '#             #', '#             #', '#           G #', '#          ####', '#     ....  ###', '#     ....  ###', '#     ....  ###', '#P    ....  ###', '#####......####', '#####......####', '###############'],
};
const name = process.argv[2] || 'shaft', seed0 = +(process.argv[3] || 1), minutes = +(process.argv[4] || 5), KINDS = process.argv[5] || 'adiv', MP = +(process.argv[6] || 6);
const frame = FRAMES[name]; if (!frame) throw new Error('frames: ' + Object.keys(FRAMES));
let seed = seed0 * 7919 + 13; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const zone = []; frame.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') zone.push(x + ',' + y); }));
const build = th => frame.map((r, y) => [...r].map((c, x) => c === '.' ? (th.get(x + ',' + y) || ' ') : c).join(''));
const melts = (map, sol) => sol.some(s => s.melt);
function score(th) {
  const map = build(th); let h; try { h = hardness(map, { mp: MP, maxDepth: 5, cap: 60000, strict: true }); } catch (e) { return { s: -200, h: null, map }; }
  if (!h || h.capped || !h.shortest) return { s: -100 + (h && h.capped ? -50 : 0), h, map };
  let s = Math.min(h.shortest, 5) * 6 - Math.max(0, h.shortest - 5) * 10;
  let bits = 0; for (const st of h.steps.split(' ')) { const [g, o] = st.split('/').map(Number); bits += Math.log2(o / g); }
  s += Math.min(bits, 30);
  s -= Math.max(0, Math.log2(h.roads) - 1) * 4;
  if (!h.hidden) s -= 12; if (h.greedyGood) s -= 12; if (h.greedy) s += 3;
  if (!h.sol.some(x => x.melt)) s -= 60;   // fire must matter: the answer melts ice (owner chose 'keep searching with fire', 2026-10-11)
  if (h.things > 16) s -= (h.things - 16) * 3; if (h.shortest < 3) s -= (3 - h.shortest) * 10;
  return { s, h, map };
}
function mutate(th) {
  const t = new Map(th), keys = [...t.keys()], r = rnd();
  if ((r < .15 && keys.length < 18) || keys.length < 6) { const z = pick(zone); if (!t.has(z)) t.set(z, pick(KINDS)); }
  else if (r < .27 && keys.length > 6) t.delete(pick(keys));
  else if (r < .5) t.set(pick(keys), pick(KINDS));
  else if (r < .65) { const a = pick(keys), b = pick(keys), ka = t.get(a); t.set(a, t.get(b)); t.set(b, ka); }
  else { const a = pick(keys), z = pick(zone); if (!t.has(z)) { t.set(z, t.get(a)); t.delete(a); } }
  return t;
}
fs.mkdirSync(__dirname + '/c8-hard', { recursive: true });
const out = __dirname + `/c8-hard/${name}-${seed0}.jsonl`, end = Date.now() + minutes * 60000;
let best = -Infinity;
while (Date.now() < end) {
  let th = new Map(); const n = 9 + Math.floor(rnd() * 7); while (th.size < n) th.set(pick(zone), pick(KINDS));
  let cur = score(th), stale = 0;
  while (stale < 400 && Date.now() < end) {
    const t2 = mutate(th), c2 = score(t2);
    if (c2.s >= cur.s) { if (c2.s > cur.s) stale = 0; th = t2; cur = c2; } else stale++;
    if (cur.s > best && cur.h && cur.h.shortest) { best = cur.s; const { sol, ...rest } = cur.h; fs.appendFileSync(out, JSON.stringify({ score: +cur.s.toFixed(2), ...rest, map: cur.map, sol }) + '\n');
      console.log(cur.s.toFixed(1), JSON.stringify(rest)); }
  }
}
