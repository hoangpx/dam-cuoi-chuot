/* every level: wins with no swipes? (must not) ; wins with the stored solution where one is known */
const fs = require('fs'), vm = require('vm'), { run } = require('./c8-engine-test.js');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/ch8/levels.js', 'utf8') + ';this.L=C8_LEVELS;', ctx);
const sol = {}; for (const h of [...require('./c8-hard-levels.js')]) sol[h.en] = h.steps; for (const r of require('./c8-regen-levels.js')) sol[r.en] = r.solution.map(s => s.split(':')[1].split(' ').map(c => c.split(',').map(Number)));
ctx.L.forEach((L, i) => { const none = run(L.map, [], { cap: 30000, depth: 150, fine: true }); const full = sol[L.en] ? run(L.map, sol[L.en], { cap: 40000, depth: 150 }).won : '-'; console.log(i + 1, L.en, 'no-swipe win:', none.won, '| stored solution wins:', full); });
