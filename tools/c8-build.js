/* Chương VIII: assemble js/ch8/levels.js from the hand-made levels (tools/c8-hand.js) and chosen generated ones in
   tools/c8-out/*.txt (made by c8-gen.js): node tools/c8-build.js */
const fs = require('fs'), path = require('path');
const hand = require('./c8-hand.js');
const NAMES = [['Rặng Tre', 'Bamboo Row'], ['Ao Sen', 'Lotus Pond'], ['Gò Đống', 'The Mound'], ['Cầu Khỉ', 'Monkey Bridge'], ['Hang Dơi', 'Bat Cave'], ['Đồi Chè', 'Tea Hill'], ['Bãi Gai', 'Thorn Flat'], ['Đình Làng', 'The Communal House'], ['Suối Cạn', 'Dry Stream'], ['Cổng Đá', 'Stone Gate'], ['Lũy Tre', 'Bamboo Rampart'], ['Đường Về', 'The Way Home'], ['Nhà Rông', 'The Long House'], ['Cây Đa', 'The Banyan'], ['Bến Nước', 'The Landing']];
function load(f) { const t = fs.readFileSync(path.join(__dirname, 'c8-out', f), 'utf8'), out = []; const re = /\/\/ moves (\d+), states (\d+)\n\s*(\[[\s\S]*?\])(?=\n\/\/|\s*$)/g; let m; while ((m = re.exec(t))) out.push({ moves: +m[1], states: +m[2], map: eval(m[3]) }); return out; }
function loadShaft() { const out = []; for (const l of fs.readFileSync(path.join(__dirname, 'c8-out', 'shaft.txt'), 'utf8').split(String.fromCharCode(10))) if (l.startsWith('[')) out.push({ map: JSON.parse(l.replace(/'/g, '"')) }); return out; }
const take = (a, n) => { a = a.slice().sort((x, y) => x.moves - y.moves || x.states - y.states); const out = []; for (let i = 0; i < n; i++) out.push(a[Math.min(a.length - 1, Math.round((i + 1) * (a.length - 1) / n))]); return [...new Set(out)]; };
const gen = [...take(load('wall.txt'), 4), ...take(load('climb.txt'), 5), ...take(load('pit.txt'), 4)].sort((a, b) => a.moves - b.moves || Math.log(a.states) - Math.log(b.states));
const { solve } = require('./c8-solve.js');
// a scroll in the cell that costs the most extra effort (the chest must still be reachable with every scroll, within 2 more gatherings)
function addScroll(map) {
  const base = solve({ map }, { maxDepth: 6 }); if (base.minMoves === null) return map;
  const H = map.length; let best = null, bestScore = -1;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < map[y].length - 1; x++) {
    if (map[y][x] !== ' ') continue; const below = map[y + 1][x]; if (!'#abcdo'.includes(below) || below === 'o') continue;
    let clear = true; for (let k = y - 1; k >= 0 && map[k][x] !== '#'; k--) if ('abcd'.includes(map[k][x])) clear = false; if (!clear) continue;
    const m2 = map.map((r, j) => j === y ? r.slice(0, x) + 'S' + r.slice(x + 1) : r), r = solve({ map: m2 }, { maxDepth: 6 });
    if (r.allScrolls === null || r.minMoves === null || r.allScrolls > base.minMoves + 2) continue;
    const sc = (r.allScrolls - base.minMoves) * 10 + Math.abs(x - 6) * .1 + (r.cheat ? -50 : 0); if (sc > bestScore) { bestScore = sc; best = m2; }
  }
  return best || map;
}
const levels = hand.concat(gen.map((g, i) => ({ name: NAMES[i % NAMES.length][0], en: NAMES[i % NAMES.length][1], map: addScroll(g.map) })));

// two well levels (the mouse must stand in the shaft while it gathers; tools/c8-gen-shaft.js) go in the middle of the list
const wells = loadShaft().filter((w, i, a) => a.findIndex(x => x.map.length === w.map.length && x.map[0].length === w.map[0].length) === i).slice(0, 2).map((w, i) => ({ name: ['Giếng Cổ', 'Giếng Thơi'][i], en: ['The Old Well', 'The Dug Well'][i], map: w.map }));
levels.splice(6, 0, wells[0]); if (wells[1]) levels.splice(12, 0, wells[1]);
for (const r of require('./c8-regen-levels.js')) { const L = levels.find(l => l.en === r.en); if (L) L.map = r.map; }   // eight early levels that needed no swipe in the real engine
for (const h of require('./c8-hard-levels.js')) levels.push({ name: h.name, en: h.en, map: h.map });   // the two hard levels of the new rules (found by search, tools/c8-hard-levels.js)
const src = levels.map(L => `  { name: ${JSON.stringify(L.name)}, en: ${JSON.stringify(L.en)}, map: [\n${L.map.map(r => '    ' + JSON.stringify(r).replace(/"/g, "'")).join(',\n')} ] }`).join(',\n');
const head = fs.readFileSync(path.join(__dirname, '..', 'js/ch8/levels.js'), 'utf8').split('const C8_LEVELS')[0];
fs.writeFileSync(path.join(__dirname, '..', 'js/ch8/levels.js'), head + 'const C8_LEVELS = [\n' + src + ',\n];\n');
console.log(levels.length + ' levels');
