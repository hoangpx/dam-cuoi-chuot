/* Chương VIII: "Desolate Boulder" (analysis only, owner's picture 2026-10-18, not solved by him yet): my reading of the picture, exit guessed at the end of the 1-high corridor on the right.
   Cells ~94 px: c0..c17 -> map x 1..18, rows A..J -> map y 1..10. node tools/c8-boulder.js */
const map = [
  '####################',
  '####      ##vv######',
  '#### r r  ##vv######',
  '#######a  ##vv######',
  '#     #a    vv######',
  '#      aa   ########',
  '#    P aa r rr  ####',
  '###############r  G#',
  '####################',
  '####################',
  '####################',
  '####################'];
module.exports = { map };
if (require.main === module) {
  const { solve } = require('./c8-push-solve.js');
  for (const by of ['swipes', 'pushes']) { const r = solve(map, { by, cap: 250000 }); console.log(by, r && r.cost, r && r.acts ? JSON.stringify(r.acts) : r && r.plan ? JSON.stringify(r.plan) : '', r && r.states); }
}
