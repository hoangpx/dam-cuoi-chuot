// prints the rule changes along a map's stored road: node tools/c2-gen-tb/trace.js <index>
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '../..');
const src = ['js/ch2/levels.js', 'js/ch2/engine.js', 'js/ch2/solver.js', 'js/ch2/solutions.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const E = new Function(src + '\nreturn {C2LEVELS,C2_SOL,C2_CHAIN,c2Parse,c2Settle,c2Step,C2_DIRS,C2K,C2P,C2OPS,c2VerbTxt}')();
const i = +process.argv[2], st = E.c2Parse(E.C2LEVELS[i]); E.c2Settle(st);
const txt = r => E.C2K[r.a].vi + (r.cond ? ' ' + E.C2OPS[r.cond.c].vi + ' ' + E.C2K[r.cond.k].vi : '') + ' ' + E.c2VerbTxt(r) + ' ' + (r.prop ? E.C2P[r.prop].vi : E.C2K[r.to].vi);
let prev = new Set(st.rules.map(txt)); console.log(E.C2LEVELS[i].name, '|', E.C2_CHAIN[i]); console.log('start', [...prev].join(', '));
E.C2_SOL[i].split('').forEach((d, n) => { E.c2Step(st, ...E.C2_DIRS[d]); const now = new Set(st.rules.map(txt));
  for (const r of now) if (!prev.has(r)) console.log(n + 1, '+', r); for (const r of prev) if (!now.has(r)) console.log(n + 1, '-', r); prev = now; });
console.log('won', st.won);
