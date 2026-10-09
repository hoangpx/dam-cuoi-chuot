/* list verified candidates (tools/c8-mini/verified.jsonl): node tools/c8-mini-list.js <depth> <minThings> <maxThings> [top] [kindsFilter] */
const fs = require('fs'); const a = fs.readFileSync('tools/c8-mini/verified.jsonl', 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const seen = new Set(), u = a.filter(e => { const k = e.map.join('/'); if (seen.has(k)) return false; seen.add(k); return true; });
const kinds = e => [...new Set(e.map.join('').replace(/[^aibvcdo]/g, '').split(''))].sort().join('');
const trim = m => { let y0 = m.findIndex(r => /[^#]/.test(r.slice(1, -1))), y1 = m.length - 1 - [...m].reverse().findIndex(r => /[^#]/.test(r.slice(1, -1))); return m.slice(Math.max(0, y0 - 1), y1 + 2); };
const d = +process.argv[2], lo = +process.argv[3], hi = +process.argv[4], top = +(process.argv[5] || 6), kf = process.argv[6];
const sel = u.filter(e => e.depth === d && e.things >= lo && e.things <= hi && (!kf || kinds(e).includes(kf))).sort((x, y) => y.states - x.states).slice(0, top);
sel.forEach((e, i) => { console.log(`#${i} depth ${e.depth} things ${e.things} states ${e.states} kinds ${kinds(e)}  id ${u.indexOf(e)}`); console.log(trim(e.map).join('\n')); console.log(e.solText.join(' | ')); console.log(); });
