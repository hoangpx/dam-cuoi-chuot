/* Chương VIII: how far can the mouse fly in the REAL engine? (owner: "bay xa được 7 ô tính từ ô đang đứng đến ô tiếp đất": landing 7 cells away on the same level = a gap of 6.)
   Direct simulation: run up, jump at the edge (several takeoff offsets), keep walking; does it land on the far floor? node tools/c8-flight.js */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/ch8/engine.js'), 'utf8'), ctx);
if (process.env.C8AIR) vm.runInContext('C8_AIR = ' + process.env.C8AIR, ctx);
function level(gap, rise) {
  const W = gap + 14, H = 14, rows = Array.from({ length: H }, () => new Array(W).fill(' ')); for (let x = 0; x < W; x++) { rows[H - 1][x] = '#'; rows[0][x] = '#'; } for (let y = 0; y < H; y++) { rows[y][0] = '#'; rows[y][W - 1] = '#'; }
  const base = H - 5; for (let y = base + 1; y < H; y++) for (let x = 1; x <= 6; x++) rows[y][x] = '#';
  const far = base - rise; for (let y = far + 1; y < H; y++) for (let x = 7 + gap; x < W - 1; x++) rows[y][x] = '#';
  rows[base][2] = 'P'; rows[far][W - 3] = 'G'; return rows.map(r => r.join(''));
}
function fly(gap, rise) {
  const map = level(gap, rise);
  for (let off = 0; off < 50; off++) { const G = ctx.c8New({ map }), t = i => ctx.c8Tick(G, 1 / 60, i || {}); for (let k = 0; k < 40; k++) t();
    let jumped = false; for (let k = 0; k < 400 && G.state === 'play'; k++) { const jumpNow = !jumped && G.p.x > 7 - .05 - off * .02 && G.p.on; if (jumpNow) jumped = true; t({ r: true, l: false, jump: jumpNow }); if (G.state === 'win') return true; } }
  return false;
}
const out = []; for (const rise of [-2, -1, 0, 1, 2]) { let best = -1; for (let gap = 0; gap <= 11; gap++) if (fly(gap, rise)) best = gap; out.push('rise ' + rise + ': max gap ' + best + (best >= 0 ? ' -> landing ' + (best + 1) + ' cells away' : '')); }
console.log(out.join('\n'));
