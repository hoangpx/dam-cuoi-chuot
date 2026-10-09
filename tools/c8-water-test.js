// water: the checker's reach and the real engine on a tiny pool next to a ledge 5 cells above the floor
const fs = require('fs'), vm = require('vm'), path = require('path');
const { solve } = require('./c8-solve.js');
const map = ['############', '#          #', '#       G  #', '#     w ####', '#     w ####', '#     w ####', '#     w ####', '#P    w ####', '############'];
console.log('checker:', JSON.stringify((({ minMoves, cheat }) => ({ minMoves, cheat }))(solve({ map }, { maxDepth: 1 }))));
const ctx = { console, map }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
console.log('engine:', JSON.stringify(vm.runInContext(`(() => { const G = c8New({ map }); let t = 0, maxUp = 99; const log = [];
  while (t < 15 && G.state === 'play') { const p = G.p; const inW = c8Wet(G, Math.floor(p.x), Math.floor(p.y - .4));
    // walk right; once in the water hold jump (swim up) and keep pressing right at the top
    c8Tick(G, 1 / 60, { r: p.x < 5.4 || p.y < 4.2 || !inW, jump: inW || p.x > 5.3 }); t += 1 / 60; maxUp = Math.min(maxUp, p.y); if (Math.floor(t * 4) % 4 === 0 && log.length < 8) log.push([+p.x.toFixed(1), +p.y.toFixed(1)]); }
  return { state: G.state, x: +G.p.x.toFixed(2), y: +G.p.y.toFixed(2), t: +t.toFixed(1), highest: +maxUp.toFixed(1) }; })()`, ctx)));
