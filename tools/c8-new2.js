// the two levels of the owner's pictures of 2026-10-09 (analysis): Explorer's Trail and an untitled one (called Hollowed Pillars for now)
class Grid { constructor(W, H) { this.W = W; this.H = H; this.g = Array.from({ length: H }, () => new Array(W).fill('#')); }
  set(x, y, ch) { this.g[y][x] = ch; return this; } rect(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, ch); return this; } map() { return this.g.map(r => r.join('')); } }
const out = {};
{ // Explorer's Trail: x = col + 8, y = 11 - r (picture rows r0 = the bottom floor row)
  const g = new Grid(24, 13), X = c => c + 8, Y = r => 11 - r;
  g.rect(X(-7), Y(7), X(14), Y(7), ' ');                          // r7 free all along
  g.rect(X(-7), Y(6), X(-2), Y(6), ' ');                          // the left passage (r6, r7)
  g.rect(X(0), Y(8), X(0), Y(5), ' '); g.rect(X(1), Y(9), X(1), Y(5), ' ');      // the chamber
  g.rect(X(2), Y(8), X(3), Y(8), ' '); g.set(X(2), Y(9), ' ');   // the notch above the rock
  g.rect(X(4), Y(6), X(8), Y(3), ' ');                            // the floor and the plateau, standing row r3
  g.rect(X(9), Y(6), X(14), Y(1), ' ');                           // the lower floor, standing row r1
  g.set(X(0), Y(8), 'd'); g.set(X(1), Y(7), 'd'); g.set(X(0), Y(7), 'a'); g.set(X(0), Y(6), 'a'); g.set(X(1), Y(6), 'a'); g.set(X(0), Y(5), 'o'); g.set(X(1), Y(5), 'o');
  for (const c of [4, 5, 6]) { g.set(X(c), Y(3), 'o'); g.set(X(c), Y(4), 'b'); } g.set(X(5), Y(5), 'd'); g.set(X(6), Y(5), 'd');
  g.set(X(11), Y(1), 'P'); g.set(X(-7), Y(6), 'G');
  g.set(11, 1, ' '); g.set(11, 2, ' ');                            // no pillar hanging over the notch
  out.trail = { map: g.map(), plan: [{ swipe: [[X(4), Y(4)], [X(5), Y(4)], [X(6), Y(4)]] }, { swipe: [[X(0), Y(7)], [X(0), Y(6)], [X(1), Y(6)]] }] };
}
{ // the untitled level: x = 1 + (px - 66) / 92, y = 9 - q (q0 = the row of the floor)
  const g = new Grid(21, 12);
  g.rect(1, 2, 6, 2, ' ');                                        // the mass top
  g.rect(7, 2, 12, 9, ' '); g.rect(9, 9, 10, 9, '#');             // the pits and the middle pillar (2 wide, top at y8 standing)
  g.rect(13, 2, 15, 7, ' ');                                      // above the plateau
  g.rect(16, 2, 19, 9, ' ');                                      // right of the plateau (no wall hanging over the start: owner, 2026-10-09)
  g.set(7, 9, 'i'); g.set(8, 9, 'i'); g.set(9, 8, 'i'); g.set(10, 8, 'i'); g.set(11, 9, 'i'); g.set(12, 9, 'i');
  for (let y = 5; y <= 8; y++) g.set(8, y, 'b'); g.set(8, 4, 'd'); g.set(8, 3, 'd');
  for (let y = 4; y <= 7; y++) g.set(10, y, 'b'); if (!process.env.NOGHOST) { g.set(10, 3, 'd'); g.set(10, 2, 'd'); }
  g.set(12, 8, 'd'); g.set(18, 9, 'P'); g.set(2, 2, 'G');
  out.pillars = { map: g.map() };
}
{ // Floating Earth: x = k + 11 (k = columns from the spiral column), y = 10 - u (u0 = the standing row of the low floor)
  const g = new Grid(23, 13);
  g.rect(1, 1, 4, 4, ' '); g.rect(4, 3, 8, 5, ' ');                    // over the left mass (higher block at the far left)
  g.rect(9, 3, 10, 10, ' '); g.rect(11, 3, 12, 11, ' '); g.rect(13, 3, 14, 10, ' ');   // the ledge, the pit, the low floor
  g.rect(15, 3, 16, 9, ' '); g.rect(17, 3, 21, 8, ' ');                // the steps up to the start
  g.set(9, 10, 'i'); g.set(10, 10, 'i'); g.set(11, 11, 'i'); g.set(12, 11, 'i');
  g.set(11, 5, 'd'); for (let y = 6; y <= 10; y++) g.set(11, y, 'b');
  g.set(19, 8, 'P'); g.set(5, 5, 'G');
  out.floating = { map: g.map(), plan: [{ swipe: [[11, 10], [11, 9], [11, 8]] }] };
}
module.exports = out;
if (require.main === module) { for (const [k, v] of Object.entries(out)) { console.log('==', k); console.log(v.map.map((r, y) => String(y).padStart(2) + ' ' + r).join('\n')); } }
