// final check of one Muôn loài board (tools/c2-gen-ml/<file id>.json, e.g. chan-chu-2): shortest win with a big cap, every rule change on it tested for need, the hint chain.
// writes tools/c2-gen/verify/<id>.json
const G = require('../c2-gen.js'), fs = require('fs'), path = require('path');
const id = process.argv[2], cap = +(process.argv[3] || 1500000);
const g = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'c2-gen-ml', id + '.json'), 'utf8'));
const def = { map: g.map, fixed: g.fixed, dirs: g.dirs || [] };
const r = G.solve(def, cap * 2);
const out = { id, ok: !!r.moves, len: r.moves ? r.moves.length : 0, states: r.states, moves: r.moves };
if (r.moves) {
  out.ess = G.essential(def, r.moves, cap);
  out.chain = G.chainOf(def, r.moves, out.ess);
  out.unsure = out.ess.filter(e => e.op.includes('?')).map(e => e.op + G.rtxt(e.r));
}
fs.mkdirSync(path.join(__dirname, '..', 'c2-gen-ml', 'verify'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'c2-gen-ml', 'verify', id + '.json'), JSON.stringify(out));
console.log(id, out.ok ? out.len + ' moves ' + out.states + ' states | ' + out.chain + (out.unsure.length ? ' | unsure ' + out.unsure.join(', ') : '') : 'NO WIN');
