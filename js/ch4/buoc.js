/* Chương IV: feet that hold the ground (art.js c4Gait). The new walk is switched on only while chương IV draws its village,
   its town and a friend's market, so the other chapters that borrow c4Mouse keep their old swing. Hooked through chapterById:
   the loop calls the chapter object's render, not the global function. */
for (const id of [4, '4b', '4v']) {
  const C = chapterById(id); if (!C) continue;
  const r = C.render;
  C.render = function () { C4_GAIT = true; try { return r.apply(this, arguments); } finally { C4_GAIT = false; } };
}
