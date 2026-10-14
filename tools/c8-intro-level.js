/* Chương VIII: the first level, a walk through the rules (owner, 2026-10-12: "thêm 1 màn giới thiệu ... hướng dẫn: match 3 trở lên là ăn, xoáy trắng thì không ăn được, chạm vào băng là chết,
   đá đẩy và đổi chỗ với lửa được, nước đi xuyên qua và đứng lên được, lửa làm băng tan chảy"). One trail, left to right, six little stations, each can be done only in the way it teaches:
   1. a wall of three jars (x 6): drag over them (3 or more of a kind are eaten);   2. three white spirals (x 13): they cannot be eaten and let the mouse through;
   3. ice on the ground (x 18-19): touching it is death, jump over it;   4. a pool of water against a high wall (x 26-27): the mouse swims in water and climbs out of it onto the wall;
   5. a rock plugging a low tunnel with a flame behind it (x 32-33): push it, it trades places with the flame, then drops off the end;   6. three flames and one ice cube in a low tunnel (x 43-46): drag the flames toward the ice and it melts.
   `tips` = where the how-to finger drags (only over things that CAN be eaten) when the player stands still near a station (k = the kind it must still be). Checked by node tools/c8-intro-level.js (the plan in the real engine). */
class Grid { constructor(W, H) { this.W = W; this.H = H; this.g = Array.from({ length: H }, () => new Array(W).fill('#')); }
  set(x, y, ch) { this.g[y][x] = ch; return this; } rect(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, ch); return this; } map() { return this.g.map(r => r.join('')); } }
const g = new Grid(52, 18);
g.rect(1, 1, 50, 12, ' ');                                          // the sky and the standing row (y 12); the ground is y 13-16
g.rect(6, 10, 6, 12, 'd');                                           // 1. three jars (close to the start so a phone screen shows them with the finger)
g.rect(13, 10, 13, 12, 'o');                                         // 2. three white spirals
g.set(18, 13, 'i'); g.set(19, 13, 'i');                              // 3. ice laid in the ground
g.rect(26, 13, 27, 15, 'v'); g.rect(26, 12, 27, 12, 'v');            // 4. a pool 3 deep and 1 above the ground ...
g.rect(28, 10, 36, 12, '#');                                         // ... against a wall 3 high: its top (y 9) is the next stretch
g.rect(31, 6, 37, 8, '#');                                           // 5. a low tunnel on the wall top (y 9) under a roof 3 thick (too high to climb), ending in a drop to the ground at x 37
g.rect(37, 9, 37, 12, ' ');
g.set(32, 9, 'r'); g.set(33, 9, 'a');                                //    the rock and the flame behind it
g.rect(41, 6, 48, 11, '#');                                          // 6. a low tunnel under a roof 6 thick (the mouse must not get on top of it)
g.rect(43, 12, 45, 12, 'a'); g.set(46, 12, 'i');                     //    three flames, then one ice cube
g.set(2, 12, 'P'); g.set(49, 12, 'G');
const map = g.map();
const plan = [{ swipe: [[6, 10], [6, 11], [6, 12]] }, { at: [24, 12] }, { at: [28, 9] }, { until: [[37, 12, 'r']] }, { at: [40, 12] }, { swipe: [[43, 12], [44, 12], [45, 12]] }];
const tips = [{ k: 'd', cells: [[6, 10], [6, 11], [6, 12]] }, { k: 'a', cells: [[43, 12], [44, 12], [45, 12]] }];   // no finger on the white spirals: they cannot be matched (owner), so showing a swipe over them would teach the wrong thing
module.exports = { name: 'Làm Quen', en: 'First Steps', map, plan, tips };
if (require.main === module) {
  const { runPlan } = require('./c8-plan.js'); const { run } = require('./c8-engine-test.js');
  console.log(map.map((r, y) => String(y).padStart(2) + ' ' + r).join('\n'));
  const r = runPlan(map, plan, { cap: +(process.env.CAP || 60000), depth: 80 }); console.log('plan:', r.won ? 'WIN' : 'fail at step ' + r.step + ' (' + r.why + ')'); if (!r.won && r.board) console.log(r.board.split(' | ').join('\n'));
  console.log('no swipes wins:', run(map, [], { cap: 40000, depth: 120, fine: true }).won);
}
