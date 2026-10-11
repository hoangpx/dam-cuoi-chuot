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
];
