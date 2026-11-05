/* Chương II · Thiên biến: writes tools/c2-tb.json from the boards on the owner's bar (tools/c2-gen-tb/strict.txt, one line per
   board from its .ver). At most 6 per frame (the longest), ordered by road length (shortest first) with no two of one frame side by
   side; the road and chain come from tools/c2-gen-tb/verify/<id>.json (tools/c2-gen/verify-tb.js). Then run tools/c2-tb-build.js. */
const fs = require('fs'), path = require('path'), D = path.join(__dirname, 'c2-gen-tb');
const names = require('./c2-tb-names.js');
const all = fs.readFileSync(path.join(D, 'strict.txt'), 'utf8').trim().split('\n').map(l => l.split(' ')[0])
  .map(id => ({ id, frame: id.replace(/-\d+$/, ''), ...JSON.parse(fs.readFileSync(path.join(D, 'verify', id + '.json'), 'utf8')) }))
  .sort((a, b) => b.len - a.len);
const per = {}, pick = all.filter(b => (per[b.frame] = (per[b.frame] || 0) + 1) <= 6).sort((a, b) => a.len - b.len);
for (let i = 1; i < pick.length; i++) if (pick[i].frame === pick[i - 1].frame) {   // swap in the next board of another frame
  const j = pick.findIndex((b, k) => k > i && b.frame !== pick[i - 1].frame); if (j > 0) pick.splice(i, 0, pick.splice(j, 1)[0]);
}
const miss = pick.filter(b => !names[b.id]); if (miss.length) throw new Error('no name: ' + miss.map(b => b.id).join(' '));
fs.writeFileSync(path.join(__dirname, 'c2-tb.json'), JSON.stringify(pick.map(b => ({ id: b.id, han: names[b.id][0], name: names[b.id][1], chain: (names.chains || {})[b.id] || b.chain, len: b.len })), null, 1));
fs.writeFileSync(path.join(D, 'pick-moves.json'), JSON.stringify(pick.map(b => b.moves)));
console.log(pick.length, 'boards:', pick.map(b => b.id + ' ' + b.len).join(', '));
