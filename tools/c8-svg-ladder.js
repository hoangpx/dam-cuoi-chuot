// Broken Ladder as a picture (SVG) from the real engine's boards: node tools/c8-svg-ladder.js > out.svg
const fs = require('fs'), vm = require('vm'), { execSync } = require('child_process');
const out = execSync('node tools/c8-ladder.js 3', { env: Object.assign({}, process.env, { C8LEN: '8', FIXEDQ: '1' }), maxBuffer: 1e8 }).toString().split('\n'), map = out.slice(0, 15);
const steps = out.filter(l => /^\d stand/.test(l)).map(l => JSON.parse(l.split('gather (k, f) ')[1]));
const ctx = { console, map, steps }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/ch8/engine.js', 'utf8'), ctx);
const boards = JSON.parse(vm.runInContext(`(() => { const G = c8New({ map }), w = G.W, res = [];
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  const order = cells => { for (const s of cells) { const used = new Set([s.join()]), path = [s]; const dfs = () => { if (path.length === cells.length) return true; for (const c of cells) if (!used.has(c.join()) && near(path[path.length - 1], c)) { used.add(c.join()); path.push(c); if (dfs()) return true; path.pop(); used.delete(c.join()); } return false; }; if (dfs()) return path; } return cells; };
  const snap = chain => { const rows = []; for (let f = 8; f >= 1; f--) { let row = ''; for (let k = -6; k <= 5; k++) { const i = (13 - f) * w + k + 7, ch = G.cells[i]; row += ch === ' ' ? (G.water[i] ? '~' : '.') : ch; } rows.push(row); } res.push({ rows, chain }); };
  for (let t = 0; t < 60; t++) c8Tick(G, 1 / 60, {}); snap(null);
  steps.forEach(s => { const p = order(s); snap(p); for (const [k, f] of p) c8Reach(G, (13 - f) * w + k + 7); c8Let(G); for (let t = 0; t < 5; t++) c8Tick(G, 1 / 60, {}); let m = 0; while (c8Moving(G) && m < 900) { c8Tick(G, 1 / 60, {}); m++; } for (let t = 0; t < 40; t++) c8Tick(G, 1 / 60, {}); });
  snap(null); return JSON.stringify(res); })()`, ctx));
const s = 22, cols = 12, rowsN = 8, panels = [
  { t: 'Ban đầu', x: 20, y: 44 }, { t: 'Bước 1: ăn 6 băng một nét', x: 350, y: 44 },
  { t: 'Bước 2: ăn 8 băng một nét', x: 20, y: 290 }, { t: 'Bước 3: ăn 3 đất', x: 350, y: 290 },
  { t: 'Kết quả và đường đi của chuột', x: 20, y: 536 }];
const cx = (p, k) => panels[p].x + (k + 6) * s + s / 2, cy = (p, f) => panels[p].y + (8 - f) * s + s / 2;
let o = `<svg width="100%" viewBox="0 0 680 800" role="img"><title>Cách giải màn Broken Ladder</title><desc>Ba lần ăn băng và đất, rồi chuột leo lên viên đất và bay sang bệ đá.</desc><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>\n`;
const idx = [0, 1, 2, 3, 4];
idx.forEach(p => {
  const B = boards[p === 4 ? 4 : p], P = panels[p]; o += `<text class="th" x="${P.x}" y="${P.y - 14}">${P.t}</text>`;
  o += `<rect class="c-gray" x="${P.x}" y="${P.y}" width="${s}" height="${8 * s}"/><rect class="c-gray" x="${P.x + s}" y="${P.y + 4 * s}" width="${4 * s}" height="${4 * s}"/>`;
  // floor
  o += `<rect class="c-gray" x="${P.x}" y="${P.y + 8 * s}" width="${cols * s}" height="8"/>`;
  B.rows.forEach((row, r) => { for (let c = 0; c < cols; c++) { const ch = row[c], x = P.x + c * s, y = P.y + r * s;
    if (ch === '~') o += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#85B7EB" opacity="0.45"/>`;
    else if (ch === '#') { }
    else if (ch === 'i') o += `<rect class="c-blue" x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}" rx="3"/>`;
    else if (ch === 'd') o += `<rect class="c-amber" x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}" rx="3"/>`; } });
  // the grey box G on the ledge (picture col -3, row f4 is rock, the box sits in the top row of the ledge)
  o += `<rect class="c-teal" x="${P.x + 3 * s + 3}" y="${P.y + 4 * s + 3}" width="${s - 6}" height="${s - 6}" rx="2"/>`;
  o += `<circle cx="${cx(p, 5)}" cy="${cy(p, 1)}" r="${p === 4 ? 4 : 6}" class="c-purple"/>`;
  if (B.chain) { o += `<polyline points="${B.chain.map(([k, f]) => cx(p, k) + ',' + cy(p, f)).join(' ')}" fill="none" stroke="#1D9E75" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/><circle cx="${cx(p, B.chain[0][0])}" cy="${cy(p, B.chain[0][1])}" r="5" fill="#1D9E75"/>`; }
});
// route on the last panel
const p5 = 4, mk = (x, y, n) => `<circle cx="${x}" cy="${y}" r="8" class="c-purple"/><text class="ts" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${n}</text>`;
o += `<path d="M${cx(p5, 5) - 8} ${cy(p5, 1)} L${cx(p5, 2)} ${cy(p5, 1)}" fill="none" stroke="#7F77DD" stroke-width="2" marker-end="url(#ar)"/>`;
o += `<path d="M${cx(p5, 2)} ${cy(p5, 1) - 4} Q${cx(p5, 2) - 2} ${cy(p5, 3) - 8} ${cx(p5, 1)} ${cy(p5, 3) - 4}" fill="none" stroke="#7F77DD" stroke-width="2" marker-end="url(#ar)"/>`;
o += mk(cx(p5, 1), cy(p5, 3) - 4, 1);
o += `<path d="M${cx(p5, 1) - 6} ${cy(p5, 3) - 10} Q${cx(p5, -1)} ${cy(p5, 6) - 6} ${cx(p5, -2)} ${cy(p5, 5) - 6}" fill="none" stroke="#7F77DD" stroke-width="2" marker-end="url(#ar)"/>`;
o += mk(cx(p5, -2), cy(p5, 5) - 8, 2);
o += `<path d="M${cx(p5, -2) - 10} ${cy(p5, 5)} L${cx(p5, -3) + 8} ${cy(p5, 5)}" fill="none" stroke="#7F77DD" stroke-width="2" marker-end="url(#ar)"/>`;
// legend (right of the last panel)
const L = [['c-gray', 'Đá'], ['c-amber', 'Đất'], ['c-blue', 'Băng, chạm là chết'], ['c-teal', 'Hộp xám (đích)'], ['c-purple', 'Chuột']];
L.forEach(([c, t], i) => { o += `<rect class="${c}" x="350" y="${560 + i * 26}" width="16" height="16" rx="3"/><text class="ts" x="374" y="${568 + i * 26}" dominant-baseline="central">${t}</text>`; });
o += `<rect x="350" y="${560 + 5 * 26}" width="16" height="16" fill="#85B7EB" opacity="0.45"/><text class="ts" x="374" y="${568 + 5 * 26}" dominant-baseline="central">Nước</text>`;
o += `<line x1="350" y1="${560 + 6 * 26 + 8}" x2="366" y2="${560 + 6 * 26 + 8}" stroke="#1D9E75" stroke-width="5" stroke-linecap="round"/><text class="ts" x="374" y="${560 + 6 * 26 + 8}" dominant-baseline="central">Nét kéo để ăn (chấm = bắt đầu)</text>`;
o += `</svg>`;
fs.writeFileSync((process.env.TEMP || '.') + '/ladder.svg', o); console.log(o.length);
