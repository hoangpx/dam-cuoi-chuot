/* Chương VIII: our OWN levels (not from the reference game), appended after the reference levels by tools/c8-ref-levels.js.
   Same shape as there: { name, en, map, plan } (plan = the one solution, swipes in drag order, map cells x,y), plus trap = a tempting
   first swipe that must lead nowhere. Checked by node tools/c8-two-way.js. The owner has not reviewed these yet. */
module.exports = [
  // Lửa Hai Ngả / Two-Way Fire, version 2 (2026-10-11). Version 1 (a shaft with flames under an ice cap) was "too easy, cleared on the
  // first try" (owner, PR #3): three of its four swipes were forced clean-up that could be done in any order. This one keeps the frame
  // (a low tunnel under a roof, the chest at the top of a 1-wide shaft at x 11) and has fewer things (17: 3 flames, 2 water, 10 ice,
  // 2 jars), but every swipe is a narrow choice (tools/c8-hardness.js: 1 good of 16 first moves, then 1 of 15, 1 of 20, 1 of 8; one order
  // only) and the moves that open the way at once all fail. Found by tools/c8-hard-search.js (frame "shaft", seed 41; tools/c8-hard/two-way-fire-v2.jsonl), checked in the
  // real engine, also with a clumsy player (no frame-exact taps, bigger ice). The answer:
  //   1. burn the three flames dragged down -> up -> RIGHT: the last step points at the ice beside them, which melts. The same three
  //      flames dragged in any other order melt nothing (the "two ways" of the fire);
  //   2. that melted ice is the THIRD water: with the two waters already there it can be gathered (two alone cannot); the ice drops;
  //   3. the row of three ice on the floor, then 4. the L of three ice under the jar: what is left is a jar on the floor as a step and
  //      the jar in the shaft sitting on two ice, two cells up; the mouse hops the one ice cube left on the floor and climbs jar, jar, chest.
  { name: 'Lửa Hai Ngả', en: 'Two-Way Fire', map: [
    '##############',
    '###########  #',
    '###########  #',
    '########### G#',
    '########### ##',
    '#           ##',
    '#    i i i d##',
    '#    aai dii##',
    '#P   avviiii##',
    '##############' ],
    plan: [{ swipe: [[5, 8], [5, 7], [6, 7]] }, { swipe: [[6, 8], [7, 8], [7, 7]] }, { swipe: [[7, 8], [8, 8], [9, 8]] }, { swipe: [[10, 8], [10, 7], [9, 7]] }],
    trap: [[6, 7], [5, 7], [5, 8]] },   // the same three flames, dragged so the last step points down: nothing melts, an ice cube drops in front of the start, no way on
  // Vách Chum / Jar Cliff, VERSION 2 (2026-10-11; owner on v1: "still not that hard, more than 5 swipes and 10 pushes"). v1 was 14 things,
  // 2 swipes (an L of flames, then a five-jar snake; map ['###############', '#             #', '#          G  #', '#        ######', '#      d d#####',
  // '#      daa#####', '#      dda#####', '#      ddd#####', '#P     odd#####', '###############']). v2: 20 × 11, 23 things (6 rocks, 7 jars,
  // 3 flames, 6 spirals, 1 peg): the jar pile against the cliff (chest six up) and a heap of spirals and rocks on the floor at the left.
  // EVERY solution needs at least 5 swipes and 14 pushes (strict model; the generous model: 5 and 12). Found by tools/c8-push-search.js
  // (frame "cliff", climbed from seed 11 to seed 21; tools/c8-hard/push-cliff-21.jsonl); `moves` = the road with the fewest swipes
  // (5 swipes, 14 pushes), checked in the real engine by node tools/c8-own-check.js "Jar Cliff" (tools/c8-push-solve.js planOf + c8-plan.js).
  { name: 'Vách Chum', en: 'Jar Cliff', map: [
    '####################',
    '#                  #',
    '#                  #',
    '#                G #',
    '#             ######',
    '#          dad######',
    '#          rdd######',
    '#          orb######',
    '#  bbrb    raa######',
    '#P brbb    drd######',
    '####################' ],
    moves: [{ swipe: [[3, 9], [3, 8], [4, 8]], at: [1, 9] }, { push: [4, 9], dir: -1, at: [5, 9] }, { swipe: [[5, 9], [6, 9], [6, 8]], at: [4, 9] },
      { push: [5, 9], dir: 1, at: [4, 9] }, { push: [6, 9], dir: 1, at: [5, 9] }, { push: [7, 9], dir: 1, at: [6, 9] }, { push: [8, 9], dir: 1, at: [7, 9] },
      { push: [9, 9], dir: 1, at: [8, 9] }, { push: [11, 8], dir: 1, at: [10, 8] }, { swipe: [[12, 9], [12, 8], [12, 7]], at: [11, 8] },
      { swipe: [[11, 9], [12, 9], [13, 9]], at: [7, 9] }, { push: [10, 9], dir: 1, at: [9, 9] }, { push: [11, 9], dir: 1, at: [10, 9] },
      { push: [3, 9], dir: 1, at: [2, 9] }, { push: [12, 9], dir: 1, at: [11, 9] }, { push: [4, 9], dir: 1, at: [3, 9] },
      { swipe: [[10, 9], [11, 9], [12, 9]], at: [4, 9] }, { push: [5, 9], dir: 1, at: [4, 9] }, { push: [6, 9], dir: 1, at: [5, 9] }],
    expect: { minSwipes: 5, minPushes: 12, things: [15, 26] },
    // the guide printed by tools/c8-level-pdf.js (Vietnamese, for the owner; never shown in the game)
    guide: {
      idea: 'Đống chum dựa vào vách đá (rương ở trên đỉnh, cao sáu ô) và một đống xoáy vàng lẫn đá nằm trên sàn bên trái. Mọi cách thắng đều phải gom ít nhất năm lần và đẩy đá ít nhất mười hai lần: phải gỡ đống bên trái để lôi đá ra, lăn đá dọc sàn sang tận đống chum, rồi gom cả hàng ba viên đá ở chân vách.',
      route: 'Viên đá cuối cùng được đẩy ra giữa sàn làm bậc thấp (cao 1); từ đó chuột nhảy lên cột chum trái (cao 3), sang cột chum phải (cao 4), rồi lên đỉnh vách (cao 6) tới rương.',
    } },
];
