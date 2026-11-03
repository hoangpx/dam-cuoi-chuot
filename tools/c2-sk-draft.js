/* Chương II: hand-drawn drafts for tools/c2-check.js: [{ id, map, pinRows: [0] (rows whose words are pinned), fix: [[x, y]], need }]. */
const D = [];
D.def = d => {
  const fixed = [...(d.fix || [])];
  d.map.forEach((r, y) => { if ((d.pinRows || [0]).includes(y)) [...r].forEach((c, x) => { if (!/[.:a-z~]/.test(c)) fixed.push([x, y]); }); });
  return { map: d.map, fixed, dirs: d.dirs || [] };
};
module.exports = D;
