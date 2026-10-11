/* Chương VIII: our OWN levels (not from the reference game), appended after the reference levels by tools/c8-ref-levels.js.
   Same shape as there: { name, en, map, plan } (plan = the one solution, swipes in drag order, map cells x,y), plus trap = a tempting
   first swipe that must lead nowhere. Checked by node tools/c8-two-way.js. The owner has not reviewed these yet. */
module.exports = [
  // Lửa Hai Ngả / Two-Way Fire (2026-10-10; working name): a low tunnel under a roof, the chest reached only up a 1-wide shaft (x 11) that
  // holds flames under an ice cap. Burning flames that end under the cap melts it, and WHICH flames burn decides how high the water lands:
  // only water standing on two flames (top at the 3rd row) lets the mouse swim up and hop onto the chest's ledge. The jars and ice in the
  // tunnel must be gathered first to open the way to the shaft. Pieces placed by hand around the shaft, then tuned with tools/c8-model.js
  // inside that frame (the hand-only rounds kept giving 2-swipe solutions); the user accepted 4 swipes instead of the 5-6 first aimed for.
  // A lone ice cell on the floor at x 6 was removed after the phone test: it changed nothing in the puzzle (same depth, same one solution)
  // but on a phone, where the camera shows ~3 cells each side, it forced a blind hop into a 1-cell gap before the ice of x 8.
  { name: 'Lửa Hai Ngả', en: 'Two-Way Fire', map: [
    '##############',
    '###########  #',
    '###########  #',
    '########### G#',
    '###########i##',
    '#          a##',
    '#    d di aa##',
    '#    d diava##',
    '#P   d diaaa##',
    '##############' ],
    plan: [{ swipe: [[5, 8], [5, 7], [5, 6]] }, { swipe: [[7, 8], [7, 7], [7, 6]] }, { swipe: [[8, 8], [8, 7], [8, 6]] }, { swipe: [[10, 6], [11, 6], [11, 5]] }],
    trap: [[11, 7], [11, 6], [11, 5]] },   // straight up the shaft at the cap: it melts, but the water lands one row too low
];
