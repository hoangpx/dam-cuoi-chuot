// Overflowing Sewer, second model: goal = the mouse can walk from the right end (col 7, corridor) to col 0, hopping through the cave (rows 1-2) when the corridor is blocked.
const fs = require('fs'); let src = fs.readFileSync(__dirname + '/c8-sewer.js', 'utf8');
src = src.replace("const done = g => !g[0].includes('i');", `const done = g => { const free = (x, y) => x >= 0 && x < W && y >= 0 && y < H && g[y][x] !== '#' && g[y][x] !== 'i';
  const seenC = new Set(['7,0']), q = [[7, 0]]; while (q.length) { const [x, y] = q.pop(); if (x === 0 && y === 0) return true;
    const nx = [[x + 1, y], [x - 1, y]]; for (let d = 1; d <= 2; d++) nx.push([x, y + d]); for (let d = 1; d <= 2; d++) nx.push([x, y - d]);
    for (const [a, b] of nx) { if (!free(a, b) || seenC.has(a + ',' + b)) continue;
      if (b > y) { let ok = true; for (let t = y + 1; t <= b; t++) if (!free(x, t)) ok = false; if (!ok) continue; }                           // up: the shaft above must be free
      if (a !== x && b !== y) continue;
      seenC.add(a + ',' + b); q.push([a, b]); } }
  return false; };`);
src = src.replace('let frontier', 'let frontier');
fs.writeFileSync(__dirname + '/_sewer2tmp.js', src);
