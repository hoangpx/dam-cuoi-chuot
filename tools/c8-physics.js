/* Chương VIII: does the real engine agree with the cell model of c8-solve.js? Scripts a run: walk right, jump at the best
   moment (tried at many distances from the edge) and see whether the mouse ever lands on the far side. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console }; vm.createContext(ctx);
for (const f of ['js/ch8/engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, f);
const run = s => vm.runInContext(s, ctx);
function trial(map, jumpAt, goalX, goalY, maxT = 6) {
  ctx.map = map; ctx.jumpAt = jumpAt;
  return run(`(() => { const G = c8New({ map }); let t = 0, jumped = false; const dt = 1 / 60;
    while (t < ${maxT}) { const inp = { r: true, l: false, jump: false };
      if (!jumped && G.p.x >= jumpAt) { inp.jump = true; jumped = true; }
      c8Tick(G, dt, inp); t += dt; if (G.p.on && G.p.x > ${goalX} && G.p.y <= ${goalY} + .01) return true; }
    return false; })()`);
}
function can(map, goalX, goalY, from, to) { for (let x = from; x <= to; x += .02) if (trial(map, x, goalX, goalY)) return true; return false; }
const T = (name, map, gx, gy, from, to, want) => { const got = can(map, gx, gy, from, to); console.log((got === want ? 'ok  ' : 'FAIL') + ' ' + name + ' -> ' + got + ' (want ' + want + ')'); };
// P starts at x 1.5; a success = standing beyond goalX with the feet no lower than goalY. deep(): a pit 5 cells deep
const deep = (top, gapCols, w) => { const rows = top.slice(); for (let r = 0; r < 5; r++) rows.push(Array.from({ length: w }, (_, c) => gapCols.includes(c) ? ' ' : '#').join('').replace(/^ /, '#').replace(/ $/, '#')); rows.push('#'.repeat(w)); return rows; };
const room = (w, rows) => rows.map(r => r.padEnd(w, ' ').slice(0, w - 1) + '#');
T('step up 2', ['##########', '#        #', '#   #    #', '#P  #    #', '##########'], 4.2, 4, 2, 3.5, true);
T('step up 3', ['##########', '#   #    #', '#   #    #', '#P  #    #', '##########'], 4.2, 4, 2, 3.5, false);
T('gap 3, same level', deep(['##########', '#        #', '#        #', '#P       #'], [4, 5, 6], 10), 7.4, 4.01, 2, 5.5, true);
T('gap 4, same level', deep(['###########', '#         #', '#         #', '#P        #'], [4, 5, 6, 7], 11), 8.4, 4.01, 2, 5.5, true);
T('gap 6, same level', deep(['#############', '#           #', '#           #', '#P          #'], [4, 5, 6, 7, 8, 9], 13), 10.4, 4.01, 2, 5.5, false);
T('gap 3, up 2 (the Crumbly Overhang jump)', ['#########', '#       #', '#    ####', '#P   ####', '##   ####', '##   ####', '##   ####', '##   ####', '#########'], 5.4, 2.01, 1.0, 3.5, true);
T('gap 5, up 2', ['###########', '#         #', '#      ####', '#P     ####', '##     ####', '##     ####', '##     ####', '##     ####', '###########'], 7.4, 2.01, 1.0, 3.5, false);
