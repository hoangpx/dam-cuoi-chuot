/* Chương II: check hand-drawn drafts (tools/c2-sk-draft.js). For each: the shortest win (BFS with the game's engine), the
   rule changes on that road, and for every rule in `need` whether a win is possible without it ('-X' = a starting rule
   that has to be broken). Usage: node --max-old-space-size=8000 tools/c2-check.js [id ...] [--cap N] [--show] */
const G = require('./c2-gen.js'), E = G.E;
const D = require('./c2-sk-draft.js');
const args = process.argv.slice(2), capI = args.indexOf('--cap'), cap = capI >= 0 ? +args[capI + 1] : 2e6;
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--cap');
const needKey = t => { const a = E.C2NOUN[t[0]], op = E.C2OP[t[1]], b = E.C2PROP[t[2]] || E.C2NOUN[t[2]]; return a + ':' + (op === 'has' ? 'has' : op === 'not' ? 'is!' : 'is') + ':' + b; };
let bad = 0;
for (const d of D) {
  if (ids.length && !ids.includes(d.id)) continue;
  const def = D.def(d), t0 = Date.now();
  const r = G.solve(def, cap);
  if (!r.moves) { console.log(`${d.id}: NO WIN${r.capped ? ' (cap)' : ''} · ${r.states} states`); bad++; continue; }
  const ev = G.events(G.replay(def, r.moves)).map(e => e.op + G.rtxt(e.r));
  const need = (d.need || []).map(t => {
    const neg = t[0] === '-', k = needKey(neg ? t.slice(1) : t);
    const res = G.solve(def, cap, neg ? st => st.rules.some(x => G.rk(x) === k) : st => !st.rules.some(x => G.rk(x) === k));
    return `${t}:${res.moves ? 'NO(' + res.moves.length + ')' : res.capped ? '?' : 'yes'}`;
  });
  if (need.some(n => /NO|\?/.test(n))) bad++;
  console.log(`${d.id}: ${r.moves.length} moves · ${r.states} states · ${((Date.now() - t0) / 1000).toFixed(1)} s · need ${need.join(' ') || '-'}\n   ${ev.join(' , ')}${args.includes('--show') ? '\n   ' + r.moves : ''}`);
}
process.exitCode = bad ? 1 : 0;
