// print the board of a reference level after some swipes: node tools/c8-peek.js <level index> '<json swipes>'   (the mouse stays at the start)
const L = require('./c8-ref-levels.js'), { runPlan } = require('./c8-plan.js'); const i = +process.argv[2] - 1, sw = JSON.parse(process.argv[3] || '[]');
const r = runPlan(L[i].map, sw.map(s => ({ swipe: s })).concat([{ until: [[0, 0, 'Z']] }]), { cap: 1, depth: 1 });
console.log(L[i].en); console.log((r.board || '').split(' | ').map((l, y) => String(y).padStart(2) + ' ' + l).join('\n')); console.log(JSON.stringify(r.log));
