const { map, steps } = require('./c8-hard-level.js'), { run } = require('./c8-engine-test.js');
const t0 = Date.now(), res = [];
for (let k = 0; k <= steps.length; k += (k === 0 ? 1 : 1)) { if (k !== 0 && k !== steps.length - 1 && k !== 3 && k !== 7) continue; const r = run(map, steps.slice(0, k), { cap: 25000, depth: 90 }); res.push('prefix ' + k + ': ' + r.won + ' (' + r.seen + ')'); }
for (let drop = 0; drop < steps.length; drop++) { const s2 = steps.filter((_, i) => i !== drop), r = run(map, s2, { cap: 25000, depth: 90 }); res.push('without ' + (drop + 1) + ': ' + r.won + ' (' + r.seen + ')'); }
console.log(res.join('\n'), Math.round((Date.now() - t0) / 1000) + 's');
