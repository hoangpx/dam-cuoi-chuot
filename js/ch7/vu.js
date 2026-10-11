/* Chương VII · Ai Ăn Vụng? — one case (after the owner's reference, Enigmic). An N×N house cut into named rooms; things in
   some cells (chum, cối, cây cau, đống rơm, giếng block the cell; giường tre, ghế băng, chiếu hoa, ghế đẩu can be sat on). N−1 villagers
   and the stolen dish each stand in their own row and column. Each one's statement shows when they are picked in the
   strip of portraits. Tools: Ghi chú (a little portrait of the picked one), Gạch (×, drag for many), Đặt (put the picked one
   there), Xoá (clear a cell), Gợi ý (bought for 1 quan of chương IV's money, js/core/goiy.js: puts the picked one, or the first one still wrong, where they belong).
   Undo; a clock. With everyone placed, Nộp lời giải: right → the culprit, the one villager in the dish's room, is named;
   wrong → "Chưa đúng rồi" (owner: no telling which). Cases come from cases.js (tools/gen-anvung.js). */
const C7_FLOOR = {
  'Gian bếp': '#d8b08a', 'Nhà ngang': '#ead3ad', 'Gian thờ': '#efc6d2', 'Nhà kho': '#cdb796', 'Chái bếp': '#c9a98a',
  'Sân gạch': '#c98a6a', 'Vườn cau': '#a9cf8f', 'Bờ ao': '#a3d0e0', 'Chuồng gà': '#e8d692', 'Ngõ trúc': '#bcd8a6',
};
const C7_TOK = ['#a3332a', '#2f5f8f', '#2f6a4c', '#c98a1c', '#7a4aa0', '#c0567a', '#8a5a2a', '#3f9e93'];
const C7_BLOCK = new Set(['chum', 'coi', 'cau', 'rom', 'gieng']);
const C7_THING = { chum: 'Chum nước', coi: 'Cối giã gạo', cau: 'Cây cau', rom: 'Đống rơm', gieng: 'Giếng nước', chong: 'Giường tre', phan: 'Ghế băng', chieu: 'Chiếu hoa', ghe: 'Ghế đẩu' };
const C7_TOOLS = [['notes', 'Ghi chú'], ['cross', 'Gạch'], ['place', 'Đặt'], ['erase', 'Xoá'], ['hint', 'Gợi ý']];
const c7Cap = s => s[0].toUpperCase() + s.slice(1);
// the stolen food (owner: draw the real thing and name it, not a covered dish called "Món ăn"): its picture and a short label
const C7_FOOD = { 'quả dưa hấu': ['dua', 'Dưa hấu'], 'buồng chuối': ['chuoi', 'Buồng chuối'], 'nải chuối cúng': ['naichuoi', 'Nải chuối'], 'hộp mứt Tết': ['mut', 'Mứt Tết'],
  'rổ trứng': ['trung', 'Rổ trứng'], 'đĩa bánh giầy': ['banhday', 'Bánh giầy'], 'mâm xôi': ['xoi', 'Mâm xôi'], 'đĩa bánh chưng': ['banhchung', 'Bánh chưng'], 'đĩa xôi gấc': ['xoigac', 'Xôi gấc'],
  'chõ bánh giầy': ['chobanh', 'Chõ bánh'], 'nồi cơm nếp': ['comnep', 'Cơm nếp'], 'hũ mật ong': ['matong', 'Mật ong'], 'đĩa cá kho': ['cakho', 'Cá kho'] };
const c7Food = e => C7_FOOD[e.name] || ['dish', c7Cap(e.name)];

function c7NewGame(i) {
  const K = C7_CASES[i], N = K.N;
  return { i, K, N, room: [...K.room].map(ch => parseInt(ch, 36)), obj: K.obj, ents: K.ents, sol: K.pos,
    placed: K.ents.map(() => -1), notes: {}, cross: new Set(), tool: 'place', sel: 0, hinted: new Set(),
    time: 0, undo: [], over: false, sheet: null, shake: null, t: 0 };
}
// portraits: chương IV's round mouse faces, kept as images
const C7_IMG = {};
// portraits, all one size: mice of every sort (children too), and the other villagers from the earlier chapters' blocks
const C7_FACE = {
  rooster: g => dp(g, WP.rHead, 68, 88, 0, 1.6, 1.6),
  hen: g => { const H = c3Art().hen; dp(g, H.head, 26, 46, 0, 1, 1); },
  duck: g => dp(g, WP.duck, 60, 72, 0, 1.15, 1.15),
  cat: g => { dp(g, CAT.head, 46, 72, 0, .82, .82); dp(g, CAT.eyes.open, 46, 72, 0, .82, .82); },
  dog: g => dp(g, MP.dogHead, 36, 58, 0, 1.05, 1.05),
  buffalo: g => dp(g, ctArt().headFront, 48, 44, 0, .9, .9),
  cow: g => { g.filter = 'sepia(1) saturate(2.6) brightness(1.7) hue-rotate(-12deg)'; dp(g, ctArt().headFront, 48, 44, 0, .9, .9); g.filter = 'none'; },
  pig: g => dp(g, MP.pig, 78, 92, 0, .58, .58),
};
function c7Face(e) {
  const kind = e.kind || 'mouse', k = kind + (e.sort ?? ''); if (C7_IMG[k]) return C7_IMG[k];
  const c = mk(96, 96), g = c.getContext('2d'), t = C4.t; C4.t = 0;
  g.fillStyle = '#f6f0e2'; g.fillRect(0, 0, 96, 96);
  if (C7_FACE[kind]) C7_FACE[kind](g);
  else { c4Mouse(g, c4MouseRig(e.sort), 40, 1, 0, false, null, null, 1.08, 158, 0); if (C4_MOUSE_SORTS[e.sort].non) { g.save(); g.translate(40, 158); g.scale(1.08, 1.08); c4Non(g); g.restore(); } }
  C4.t = t; C7_IMG[k] = c; c.complete = true; return c;
}
const c7Snap = G => ({ placed: G.placed.slice(), notes: JSON.parse(JSON.stringify(G.notes)), cross: [...G.cross] });
function c7Push(G) { G.undo.push(c7Snap(G)); if (G.undo.length > 80) G.undo.shift(); }
function c7Undo(G) { const s = G.undo.pop(); if (!s) return; G.placed = s.placed; G.notes = s.notes; G.cross = new Set(s.cross); AU.tap(); }
const c7Who = (G, cell) => G.placed.indexOf(cell);

/* ---------- layout (CSS px) ---------- */
function c7Geo(G, W, H) {
  const colW = Math.min(W - 24, 470), x0 = (W - colW) / 2, top = 84;
  // (a player: on another phone only two lines of the statements showed) the statement panel is as tall as the longest set of statements needs, wrapped at THIS screen's width
  let clueH = 84; { const m = typeof ctx !== 'undefined' ? ctx : null; if (m) { m.save(); m.font = '500 14px "Be Vietnam Pro", sans-serif'; for (const list of G.K.clues) { let n = 0; for (const c of list) { const t = Object.keys(C7_THING).find(k => c.includes(C7_THING[k].toLowerCase())); n += c7Wrap(m, c, colW - 28 - (t ? 26 : 0)).length; } clueH = Math.max(clueH, 32 + n * 18 + 12); } m.restore(); } }
  const size = Math.max(200, Math.min(colW, H - top - 300 - (clueH - 84))), cs = size / G.N, ox = (W - size) / 2, by = top + size;
  const toolY = by + 12, stripY = toolY + 64, clueY = stripY + 80, subY = Math.min(H - 56, clueY + clueH + 8);
  return { colW, x0, top, size, cs, ox, toolY, stripY, clueY, clueH, subY, back: [x0 + 24, 38], help: [x0 + 74, 38], undoB: [x0 + colW - 24, 38], legB: [x0 + colW - 74, 38] };
}
function c7CellAt(G, Gm, x, y) { const c = Math.floor((x - Gm.ox) / Gm.cs), r = Math.floor((y - Gm.top) / Gm.cs); return r >= 0 && c >= 0 && r < G.N && c < G.N ? r * G.N + c : -1; }

/* ---------- input ---------- */
function c7Down(en, x, y) {
  const G = en.G, Gm = en.geo; if (!Gm) return;
  if (G.sheet) { c7SheetTap(en, x, y); return; }
  if (Math.hypot(x - Gm.back[0], y - Gm.back[1]) < 26) { en.close(); return; }
  if (Math.hypot(x - Gm.help[0], y - Gm.help[1]) < 26) { en.howto(); return; }
  if (Math.hypot(x - Gm.undoB[0], y - Gm.undoB[1]) < 26) { c7Undo(G); return; }
  if (Math.hypot(x - Gm.legB[0], y - Gm.legB[1]) < 26) { AU.tap(); G.sheet = 'legend'; return; }
  // tools
  if (y > Gm.toolY && y < Gm.toolY + 52) {
    const w = Gm.colW / 5, k = Math.floor((x - Gm.x0) / w); if (k < 0 || k > 4) return;
    const t = C7_TOOLS[k][0]; AU.tap();
    if (t === 'hint') { if (!G.over && G.placed.some((p, k) => p !== G.sol[k])) hintBuy('Đặt đúng chỗ một người: người đang chọn, hoặc người đầu tiên còn sai.', () => c7Hint(G)); } else G.tool = t;
    return;
  }
  // the portraits
  if (y > Gm.stripY && y < Gm.stripY + 72) { const w = Gm.colW / G.ents.length, k = Math.floor((x - Gm.x0) / w); if (k >= 0 && k < G.ents.length) { G.sel = k; AU.tap(); } return; }
  // submit
  if (y > Gm.subY && y < Gm.subY + 48 && G.placed.every(p => p >= 0)) { c7Submit(en); return; }
  const cell = c7CellAt(G, Gm, x, y); if (cell < 0) return;
  G.press = { cell, moved: false };
  if (G.tool === 'cross') { c7Push(G); G.press.mode = G.cross.has(cell) ? 'del' : 'add'; c7Cross(G, cell, G.press.mode); }
}
function c7Move(en, x, y) {
  const G = en.G, p = G.press; if (!p || G.tool !== 'cross') return;
  const cell = c7CellAt(G, en.geo, x, y); if (cell < 0 || cell === p.cell) return;
  p.moved = true; p.cell = cell; c7Cross(G, cell, p.mode);
}
function c7Cross(G, cell, mode) { if (c7Who(G, cell) >= 0 || C7_BLOCK.has(G.obj[cell])) return; if (mode === 'del') G.cross.delete(cell); else if (!G.cross.has(cell)) { G.cross.add(cell); AU.tap(); } }
function c7Up(en) {
  const G = en.G, p = G.press; G.press = null; if (!p || G.over || G.tool === 'cross') return;
  const cell = p.cell, blocked = C7_BLOCK.has(G.obj[cell]);
  if (G.tool === 'place') {
    if (blocked) { G.shake = { cell, t: .4 }; AU.pluck(56); return; }
    c7Push(G);
    const other = c7Who(G, cell); if (other >= 0) G.placed[other] = -1;
    G.placed[G.sel] = cell; G.cross.delete(cell); AU.pluck(78);
    const next = G.placed.findIndex(q => q < 0); if (next >= 0) G.sel = next;    // on to the next one still to place
  } else if (G.tool === 'notes') {
    if (blocked) return; c7Push(G);
    const n = G.notes[cell] = G.notes[cell] || []; const k = n.indexOf(G.sel); if (k >= 0) n.splice(k, 1); else n.push(G.sel); AU.tap();
  } else if (G.tool === 'erase') {
    c7Push(G); const w = c7Who(G, cell); if (w >= 0) G.placed[w] = -1; delete G.notes[cell]; G.cross.delete(cell); AU.tap();
  }
}
function c7Hint(G) {
  if (G.over) return;
  let e = G.placed[G.sel] !== G.sol[G.sel] ? G.sel : G.placed.findIndex((p, k) => p !== G.sol[k]);
  if (e < 0) return;
  c7Push(G); const cell = G.sol[e], other = c7Who(G, cell); if (other >= 0) G.placed[other] = -1;
  G.placed[e] = cell; G.cross.delete(cell); G.hinted.add(e); G.sel = e; AU.pluck(90);
}
function c7Submit(en) {
  const G = en.G;
  if (G.placed.every((p, k) => p === G.sol[k])) { G.over = true; G.sheet = 'win'; AU.kenCall(); setTimeout(() => AU.drumHit(), 300); en.result(G); }
  else { G.sheet = 'wrong'; AU.snort(); }
}
function c7SheetTap(en, x, y) {
  const G = en.G, b = en.sheetBtns || [];
  for (const [bx, by, bw, bh, act] of b) if (x > bx && x < bx + bw && y > by && y < by + bh) { AU.tap(); act(); return; }
  if (G.sheet === 'legend') { AU.tap(); G.sheet = null; }   // the key closes on any tap
}
function c7Tick(en, dt) { const G = en.G; G.t += dt; if (!G.over && !G.sheet) G.time += dt; if (G.shake && (G.shake.t -= dt) <= 0) G.shake = null; }

/* ---------- drawing ---------- */
function c7Round(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function c7Clock(t) { const s = Math.floor(t); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function c7Wrap(g, text, w) { const out = []; let line = ''; for (const word of text.split(' ')) { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; }
// the things, drawn in a cell of size s centred at x, y
function c7Thing(g, type, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s / 60, s / 60); g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round'; g.lineCap = 'round';
  const shape = (col, pts) => { g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fillStyle = col; g.fill(); g.stroke(); };
  const line = (w, col, ...pts) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke(); };
  if (type === 'chum') {                        // a big brown water jar with a wooden lid
    g.fillStyle = '#8a5a2a'; g.beginPath(); g.moveTo(-10, -14); g.bezierCurveTo(-30, -6, -26, 22, -10, 24); g.lineTo(10, 24); g.bezierCurveTo(26, 22, 30, -6, 10, -14); g.closePath(); g.fill(); g.stroke();
    line(2, '#c98a5a', [-18, 2], [-6, 6], [6, 6], [18, 2]);
    g.fillStyle = '#c9a26a'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, -15, 13, 4.5, 0, 0, 6.283); g.fill(); g.stroke();
    line(3, INK, [-3, -19], [3, -19]);
  } else if (type === 'coi') {                  // a wooden rice mortar, rice in it, the pestle standing in
    shape('#a8743a', [[-17, -6], [17, -6], [11, 20], [-11, 20]]);
    line(1.6, '#6a3f1f', [-14, 4], [14, 4]);
    g.fillStyle = '#f6f0e2'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, -6, 17, 5, 0, 0, 6.283); g.fill(); g.stroke();
    line(5, INK, [4, -6], [16, -27]); line(3, '#c9a26a', [4, -6], [16, -27]);
  } else if (type === 'cau') {
    line(5, '#7a4a22', [0, 24], [2, -14]); g.strokeStyle = INK; g.lineWidth = 1.6;
    for (const a of [-2.6, -2, -1.2, -.5, .2]) { g.fillStyle = '#2f6a4c'; g.beginPath(); g.ellipse(2 + Math.cos(a) * 12, -14 + Math.sin(a) * 9, 13, 4, a, 0, 6.283); g.fill(); g.stroke(); }
  } else if (type === 'rom') {
    shape('#e2b43c', [[-22, 20], [-18, -4], [-6, -18], [8, -16], [20, -2], [22, 20]]); g.strokeStyle = '#b57a22'; g.lineWidth = 1.4; g.beginPath(); for (let k = -16; k <= 16; k += 6) { g.moveTo(k, 18); g.lineTo(k * .7, -6); } g.stroke();
  } else if (type === 'gieng') {                // a brick well: red ring, dark water, a wooden bar with the bucket rope
    g.fillStyle = '#b5583a'; g.beginPath(); g.arc(0, 2, 21, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#2f5f7f'; g.beginPath(); g.arc(0, 2, 13, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(29,25,21,.55)'; g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * .785; g.moveTo(Math.cos(a) * 13, 2 + Math.sin(a) * 13); g.lineTo(Math.cos(a) * 21, 2 + Math.sin(a) * 21); } g.stroke();
    line(5, INK, [-25, -12], [25, -12]); line(3, '#a8743a', [-25, -12], [25, -12]); line(1.4, INK, [0, -12], [0, 0]);
    shape('#a8743a', [[-4, 0], [4, 0], [3, 6], [-3, 6]]);
  } else if (type === 'ghe') { g.scale(1.35, 1.35);   // a little square stool, legs splayed
    line(3.4, INK, [-9, 0], [-14, 18]); line(3.4, INK, [9, 0], [14, 18]); line(3, INK, [-4, 2], [-6, 14]); line(3, INK, [4, 2], [6, 14]);
    g.strokeStyle = INK; g.lineWidth = 2.4; shape('#c98a4a', [[-15, -8], [15, -8], [12, 0], [-12, 0]]);
  } else if (type === 'phan') {                 // a long wooden bench with a back
    shape('#8a5a2a', [[-24, -20], [24, -20], [24, -12], [-24, -12]]);
    line(3, INK, [-18, -12], [-18, -2]); line(3, INK, [0, -12], [0, -2]); line(3, INK, [18, -12], [18, -2]);
    shape('#a8743a', [[-26, -2], [26, -2], [26, 5], [-26, 5]]);
    line(3.4, INK, [-21, 5], [-23, 20]); line(3.4, INK, [21, 5], [23, 20]);
  } else if (type === 'chong') {                // a bamboo bed: slats with knots, four legs
    line(3.4, INK, [-22, 8], [-22, 22]); line(3.4, INK, [22, 8], [22, 22]);
    shape('#d9c06a', [[-26, -16], [26, -16], [26, 8], [-26, 8]]);
    g.strokeStyle = '#7a8a2a'; g.lineWidth = 1.4; g.beginPath(); for (let k = -10; k <= 2; k += 6) { g.moveTo(-26, k); g.lineTo(26, k); } g.stroke();
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); for (const k of [-12, 8]) { g.moveTo(k, -16); g.lineTo(k, 8); } g.stroke();
  } else if (type === 'chieu') {                // a flowered sedge mat: red border, a flower in the middle
    shape('#efd88a', [[-24, -18], [24, -18], [24, 18], [-24, 18]]);
    g.strokeStyle = '#a3332a'; g.lineWidth = 3; g.strokeRect(-19, -13, 38, 26);
    g.fillStyle = '#a3332a'; for (let k = 0; k < 4; k++) { const a = k * 1.571; g.beginPath(); g.ellipse(Math.cos(a) * 5, Math.sin(a) * 5, 4, 2.4, a, 0, 6.283); g.fill(); }
    g.fillStyle = '#2f6a4c'; g.beginPath(); g.arc(0, 0, 2.4, 0, 6.283); g.fill();

  } else if (type === 'dua') {                  // a whole watermelon, dark stripes, a cut slice in front
    g.fillStyle = '#3f7a3a'; g.beginPath(); g.ellipse(-3, -2, 22, 18, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#1f4a2a'; g.lineWidth = 2.6; for (const k of [-14, -6, 2, 10]) { g.beginPath(); g.moveTo(k - 2, -18); g.quadraticCurveTo(k + 4, -2, k - 2, 15); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 2.2; g.fillStyle = '#d9473a'; g.beginPath(); g.moveTo(3, 16); g.lineTo(23, 16); g.arc(13, 16, 10, 0, Math.PI, false); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#3f7a3a'; g.lineWidth = 2.4; g.beginPath(); g.arc(13, 16, 10, 0, Math.PI, false); g.stroke();
    g.fillStyle = INK; for (const [a, b] of [[9, 19], [13, 22], [17, 19]]) { g.beginPath(); g.ellipse(a, b, 1.2, 2, 0, 0, 6.283); g.fill(); }
  } else if (type === 'chuoi') {                // a whole bunch of bananas on its stalk, tier on tier
    line(5, '#6a4a22', [0, -26], [0, 24]);
    g.strokeStyle = INK; g.lineWidth = 1.6;
    for (const [ty, n] of [[-14, 4], [-2, 5], [10, 5], [21, 4]]) for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * 8; g.fillStyle = k % 2 ? '#e8c547' : '#f0d35a'; g.beginPath(); g.ellipse(x, ty, 3.6, 8, x * .04, 0, 6.283); g.fill(); g.stroke(); }
    g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(0, -24, 4, 3, 0, 0, 6.283); g.fill();
  } else if (type === 'naichuoi') {             // one hand of bananas on the altar plate
    g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 14, 24, 8, 0, 0, 6.283); g.fill(); g.stroke();
    for (let k = 0; k < 5; k++) { const a = -1.1 + k * .55; g.save(); g.translate(0, 10); g.rotate(a); g.fillStyle = k % 2 ? '#e8c547' : '#f0d35a'; g.beginPath(); g.ellipse(0, -14, 4.5, 13, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = '#6a4a22'; g.beginPath(); g.arc(0, 11, 4, 0, 6.283); g.fill(); g.stroke();
  } else if (type === 'mut') {                  // a red Tết jam box: round lid, gold rim, a gold flower
    g.fillStyle = '#a3332a'; g.beginPath(); g.ellipse(0, 12, 24, 9, 0, 0, 6.283); g.fill(); g.stroke(); g.fillRect(-24, -4, 48, 16); g.beginPath(); g.moveTo(-24, -4); g.lineTo(-24, 12); g.moveTo(24, -4); g.lineTo(24, 12); g.stroke();
    g.fillStyle = '#c0453a'; g.beginPath(); g.ellipse(0, -4, 24, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#e8c547'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, -4, 18, 6, 0, 0, 6.283); g.stroke();
    g.fillStyle = '#e8c547'; for (let k = 0; k < 5; k++) { const a = k * 1.257; g.beginPath(); g.ellipse(Math.cos(a) * 4, -4 + Math.sin(a) * 1.6, 3, 1.6, a, 0, 6.283); g.fill(); }
  } else if (type === 'trung') {                // a bamboo basket heaped with eggs
    g.fillStyle = '#f6efd8'; for (const [a, b] of [[-12, -4], [0, -8], [12, -4], [-6, -14], [6, -14]]) { g.beginPath(); g.ellipse(a, b, 7, 9, 0, 0, 6.283); g.fill(); g.stroke(); }
    g.fillStyle = '#b57a3a'; g.beginPath(); g.moveTo(-24, -2); g.lineTo(24, -2); g.quadraticCurveTo(22, 24, 0, 24); g.quadraticCurveTo(-22, 24, -24, -2); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#7a4a22'; g.lineWidth = 1.4; g.beginPath(); for (let k = -16; k <= 16; k += 8) { g.moveTo(k, 0); g.lineTo(k * .8, 20); } g.moveTo(-22, 8); g.lineTo(22, 8); g.stroke();
  } else if (type === 'banhday') {             // round white rice cakes on a banana leaf on a plate
    g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 12, 24, 8, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#4f8a4a'; g.beginPath(); g.ellipse(0, 6, 20, 7, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#fbf7ee'; for (const [a, b] of [[-9, 2], [9, 2], [0, -6]]) { g.beginPath(); g.ellipse(a, b, 9, 5.5, 0, 0, 6.283); g.fill(); g.stroke(); }
  } else if (type === 'xoi' || type === 'xoigac') {   // a heaped mound of sticky rice (white, or red with gấc) on a tray
    g.fillStyle = type === 'xoi' ? '#8a5a2a' : '#f2ecde'; g.beginPath(); g.ellipse(0, 12, 25, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = type === 'xoi' ? '#f6efd8' : '#d9473a'; g.beginPath(); g.moveTo(-19, 10); g.quadraticCurveTo(-18, -18, 0, -18); g.quadraticCurveTo(18, -18, 19, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = type === 'xoi' ? '#e2b43c' : '#f0a090'; for (const [a, b] of [[-8, -6], [4, -10], [9, 0], [-2, 3], [-12, 4]]) { g.beginPath(); g.arc(a, b, 1.8, 0, 6.283); g.fill(); }
  } else if (type === 'banhchung') {           // a square green bánh chưng tied with bamboo strings, on a plate
    g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 14, 24, 8, 0, 0, 6.283); g.fill(); g.stroke();
    shape('#3f7a3a', [[-15, -16], [15, -16], [15, 12], [-15, 12]]); shape('#5a9a4a', [[-15, -16], [-9, -21], [21, -21], [15, -16]]);
    line(2.6, '#e8d8a8', [-5, -19], [-5, 12]); line(2.6, '#e8d8a8', [6, -19], [6, 12]); line(2.6, '#e8d8a8', [-15, -6], [15, -6]); line(2.6, '#e8d8a8', [-15, 3], [15, 3]);
  } else if (type === 'chobanh') {             // a wooden steamer with round bánh giầy on top
    shape('#a0703a', [[-22, -4], [22, -4], [19, 22], [-19, 22]]); g.strokeStyle = '#6a4a22'; g.lineWidth = 2; g.beginPath(); g.moveTo(-21, 6); g.lineTo(21, 6); g.moveTo(-20, 14); g.lineTo(20, 14); g.stroke(); g.strokeStyle = INK; g.lineWidth = 2.4;
    g.fillStyle = '#fbf7ee'; for (const [a, b] of [[-11, -8], [0, -10], [11, -8], [-5, -16], [6, -16]]) { g.beginPath(); g.ellipse(a, b, 7, 4.5, 0, 0, 6.283); g.fill(); g.stroke(); }
  } else if (type === 'comnep') {              // a clay rice pot, lid ajar, steam rising
    g.fillStyle = '#5b3a24'; g.beginPath(); g.moveTo(-20, -6); g.bezierCurveTo(-26, 18, -16, 24, 0, 24); g.bezierCurveTo(16, 24, 26, 18, 20, -6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#f6efd8'; g.beginPath(); g.ellipse(0, -6, 20, 5, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(6, -11, 17, 4.5, -.25, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.arc(7, -16, 3, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(29,25,21,.45)'; g.lineWidth = 1.6; for (const k of [-10, -3]) { g.beginPath(); g.moveTo(k, -14); g.quadraticCurveTo(k - 4, -19, k, -24); g.quadraticCurveTo(k + 4, -28, k, -32); g.stroke(); }
  } else if (type === 'matong') {              // an amber honey jar, cloth lid tied with string, a drip
    g.fillStyle = '#e2a23c'; g.beginPath(); g.moveTo(-12, -12); g.bezierCurveTo(-26, -4, -24, 22, -8, 24); g.lineTo(8, 24); g.bezierCurveTo(24, 22, 26, -4, 12, -12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#c0453a'; g.beginPath(); g.moveTo(-15, -12); g.lineTo(15, -12); g.lineTo(11, -20); g.lineTo(-11, -20); g.closePath(); g.fill(); g.stroke(); line(2, '#e8d8a8', [-13, -14], [13, -14]); g.strokeStyle = INK; g.lineWidth = 2.4;
    g.fillStyle = '#f6efd8'; g.beginPath(); g.ellipse(0, 6, 9, 7, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#b57a22'; g.font = '700 9px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('蜜', 0, 6.5);
    g.fillStyle = '#e2a23c'; g.beginPath(); g.moveTo(-14, -10); g.quadraticCurveTo(-17, -2, -15, 2); g.quadraticCurveTo(-12, -2, -12, -8); g.fill();
  } else if (type === 'cakho') {               // a clay pot of braised fish, a tail sticking out
    g.fillStyle = '#7a4a2a'; g.beginPath(); g.moveTo(-22, -4); g.bezierCurveTo(-26, 18, -14, 22, 0, 22); g.bezierCurveTo(14, 22, 26, 18, 22, -4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#9a5a2a'; g.beginPath(); g.ellipse(0, -4, 22, 6, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#b5703a'; g.beginPath(); g.ellipse(-3, -6, 13, 4.5, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(9, -6); g.lineTo(20, -14); g.lineTo(19, -1); g.closePath(); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(-11, -7, 1.3, 0, 6.283); g.fill();
  } else if (type === 'dish') { g.fillStyle = '#f2ecde'; g.beginPath(); g.ellipse(0, 8, 22, 8, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#e8e2d0'; g.beginPath(); g.ellipse(0, -2, 16, 13, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#a3332a'; g.beginPath(); g.arc(0, -14, 3, 0, 6.283); g.fill(); }
  g.restore();
}
function c7Token(g, G, e, x, y, r, ring, lw = 3) {
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fillStyle = C7_TOK[e % C7_TOK.length]; g.fill();
  if (G.ents[e].dish) { g.restore(); g.fillStyle = '#f6f0e2'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); c7Thing(g, c7Food(G.ents[e])[0], x, y + r * .1, r * 1.8); g.strokeStyle = '#a3332a'; g.lineWidth = lw; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); return; }
  g.clip(); const im = c7Face(G.ents[e]); if (im.complete) g.drawImage(im, x - r * 1.08, y - r * 1.08, r * 2.16, r * 2.16); g.restore();
  g.strokeStyle = ring || C7_TOK[e % C7_TOK.length]; g.lineWidth = lw; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
}
// a woodblock button like the game's .btn: son red (or paper) slab, ink edge, a thin inner frame, the ink shadow under it
function c7Wood(g, x, y, w, h, label, kind = 'son') {
  const off = kind === 'off', son = kind === 'son';
  g.fillStyle = off ? 'rgba(29,25,21,.25)' : INK; g.fillRect(x + 4, y + 4, w, h);
  g.fillStyle = son ? '#a3332a' : off ? '#e6dccb' : '#f2ecde'; g.fillRect(x, y, w, h);
  g.strokeStyle = off ? 'rgba(29,25,21,.45)' : INK; g.lineWidth = 2.5; g.strokeRect(x, y, w, h);
  g.strokeStyle = son ? 'rgba(242,236,222,.55)' : 'rgba(29,25,21,.3)'; g.lineWidth = 1.2; g.strokeRect(x + 5, y + 5, w - 10, h - 10);
  g.fillStyle = son ? '#f2ecde' : off ? 'rgba(29,25,21,.45)' : INK; g.font = '700 ' + Math.min(20, h * .42) + 'px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, x + w / 2, y + h / 2 + 1);
}
function c7Board(g, G, x0, y0, size, opts = {}) {
  const N = G.N, cs = size / N;
  for (let i = 0; i < N * N; i++) { const r = (i / N) | 0, c = i % N; g.fillStyle = C7_FLOOR[G.K.names[G.room[i]]] || '#e6d3b0'; g.fillRect(x0 + c * cs, y0 + r * cs, cs, cs); }
  g.strokeStyle = 'rgba(29,25,21,.18)'; g.lineWidth = 1; g.beginPath();
  for (let k = 1; k < N; k++) { g.moveTo(x0 + k * cs, y0); g.lineTo(x0 + k * cs, y0 + size); g.moveTo(x0, y0 + k * cs); g.lineTo(x0 + size, y0 + k * cs); } g.stroke();
  g.strokeStyle = INK; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const i = r * N + c, x = x0 + c * cs, y = y0 + r * cs;
    if (c < N - 1 && G.room[i] !== G.room[i + 1]) { g.moveTo(x + cs, y); g.lineTo(x + cs, y + cs); }
    if (r < N - 1 && G.room[i] !== G.room[i + N]) { g.moveTo(x, y + cs); g.lineTo(x + cs, y + cs); } }
  g.stroke(); g.lineWidth = 4.5; g.strokeRect(x0, y0, size, size);
  for (let i = 0; i < N * N; i++) if (C7_BLOCK.has(G.obj[i])) { const x = x0 + (i % N) * cs, y = y0 + ((i / N) | 0) * cs; g.save(); g.beginPath(); g.rect(x, y, cs, cs); g.clip(); g.strokeStyle = 'rgba(29,25,21,.16)'; g.lineWidth = 1.6; g.beginPath(); for (let k = -cs; k < cs; k += cs / 5) { g.moveTo(x + k, y + cs); g.lineTo(x + k + cs, y); } g.stroke(); g.restore(); }   // no standing here
  for (let i = 0; i < N * N; i++) if (G.obj[i]) c7Thing(g, G.obj[i], x0 + (i % N + .5) * cs, y0 + (((i / N) | 0) + .5) * cs, cs * .9);
  // room names, on the lowest row of each room
  g.font = '700 ' + Math.max(9, Math.min(12, cs * .2)) + 'px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  G.K.names.forEach((name, k) => {
    const cells = G.room.map((v, i) => v === k ? i : -1).filter(i => i >= 0), low = Math.max(...cells.map(i => (i / N) | 0)), row = cells.filter(i => ((i / N) | 0) === low);
    const mid = row[Math.floor((row.length - 1) / 2)], x = x0 + (mid % N + .5 + (row.length % 2 ? 0 : .5)) * cs, y = y0 + (low + .86) * cs, w = g.measureText(name).width + 10;
    c7Round(g, x - w / 2, y - 8, w, 16, 6); g.fillStyle = 'rgba(246,240,226,.92)'; g.fill(); g.fillStyle = INK; g.fillText(name, x, y);
  });
  g.textBaseline = 'alphabetic';
  if (opts.marks === false) return;
  // crosses, notes, people
  for (const i of G.cross) { const x = x0 + (i % N + .5) * cs, y = y0 + (((i / N) | 0) + .5) * cs, s = cs * .22; g.strokeStyle = '#fbf7ee'; g.lineWidth = Math.max(6, cs * .16); g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); g.strokeStyle = '#a3332a'; g.lineWidth = Math.max(3, cs * .08); g.stroke(); }
  for (const [cell, list] of Object.entries(G.notes)) { const i = +cell, n = list.length > 4 ? 3 : 2, q = cs / n;   // notes: little portraits of the ones who might be here
    list.forEach((e, k) => c7Token(g, G, e, x0 + (i % N) * cs + (k % n + .5) * q, y0 + ((i / N) | 0) * cs + (((k / n) | 0) + .5) * q, q * .42, null, Math.max(1.4, q * .08))); }
  G.placed.forEach((cell, e) => { if (cell < 0) return; const sh = G.shake && G.shake.cell === cell ? Math.sin(G.shake.t * 50) * 4 : 0; c7Token(g, G, e, x0 + (cell % N + .5) * cs + sh, y0 + (((cell / N) | 0) + .5) * cs, cs * .36, e === G.sel ? '#f2c640' : (opts.ring && opts.ring(e))); });
}
function c7Icon(g, t, x, y, on) {
  g.strokeStyle = on ? '#f6f0e2' : INK; g.lineWidth = 2.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
  if (t === 'notes') { g.moveTo(x - 7, y + 8); g.lineTo(x + 7, y - 6); g.lineTo(x + 9, y - 4); g.lineTo(x - 5, y + 10); g.closePath(); }
  else if (t === 'cross') { g.moveTo(x - 7, y - 7); g.lineTo(x + 7, y + 7); g.moveTo(x + 7, y - 7); g.lineTo(x - 7, y + 7); }
  else if (t === 'place') { g.moveTo(x - 8, y); g.lineTo(x - 2, y + 6); g.lineTo(x + 9, y - 7); }
  else if (t === 'erase') { g.moveTo(x - 8, y + 4); g.lineTo(x, y - 6); g.lineTo(x + 8, y + 1); g.lineTo(x + 2, y + 9); g.lineTo(x - 4, y + 9); g.closePath(); }
  else { g.arc(x, y - 3, 6, Math.PI * .8, Math.PI * 2.2); g.moveTo(x - 3, y + 6); g.lineTo(x + 3, y + 6); }
  g.stroke();
}
function c7Draw(en, g, W, H) {
  const G = en.G, Gm = en.geo = c7Geo(G, W, H), N = G.N;
  // header: back, help, the case name, the clock, undo
  const btn = (x, y, draw) => { g.fillStyle = '#fbf7ee'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(x, y, 20, 0, 6.283); g.fill(); g.stroke(); draw(x, y); };
  btn(...Gm.back, (x, y) => { g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, y - 8); g.lineTo(x - 4, y); g.lineTo(x + 4, y + 8); g.stroke(); });
  btn(...Gm.help, (x, y) => { g.fillStyle = INK; g.font = '900 20px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x, y + 1); });
  btn(...Gm.undoB, (x, y) => { g.lineWidth = 2.6; g.beginPath(); g.arc(x + 1, y + 2, 7, Math.PI * 1.1, Math.PI * 2.4); g.stroke(); g.beginPath(); g.moveTo(x - 9, y - 5); g.lineTo(x - 6, y + 2); g.lineTo(x, y - 2); g.stroke(); });
  btn(...Gm.legB, (x, y) => { c7Thing(g, 'chum', x - 6, y + 1, 17); g.strokeStyle = INK; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 3, y - 3); g.lineTo(x + 10, y - 3); g.moveTo(x + 3, y + 4); g.lineTo(x + 10, y + 4); g.stroke(); });
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 15px "Be Vietnam Pro", sans-serif';   // the case's name: one line if it fits between the buttons, else two smaller ones
  if (g.measureText(G.K.title).width <= Gm.colW - 204) g.fillText(G.K.title, W / 2, 22);
  else { g.font = '800 13px "Be Vietnam Pro", sans-serif'; c7Wrap(g, G.K.title, Gm.colW - 204).slice(0, 2).forEach((l, k) => g.fillText(l, W / 2, 13 + k * 15)); }
  c7Round(g, W / 2 - 40, 40, 80, 26, 13); g.fillStyle = INK; g.fill(); g.fillStyle = '#f6f0e2'; g.font = '700 14px "Be Vietnam Pro", sans-serif'; g.fillText(c7Clock(G.time), W / 2 + 6, 54);
  g.fillStyle = '#e8743a'; g.beginPath(); g.arc(W / 2 - 24, 53, 4, 0, 6.283); g.fill();
  // the house
  c7Board(g, G, Gm.ox, Gm.top, Gm.size);
  // tools
  const tw = Gm.colW / 5;
  C7_TOOLS.forEach(([t, name], k) => {
    const x = Gm.x0 + k * tw + 3, on = G.tool === t; c7Round(g, x, Gm.toolY, tw - 6, 52, 12);
    g.fillStyle = on ? INK : '#fbf7ee'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
    c7Icon(g, t, x + (tw - 6) / 2, Gm.toolY + 18, on);
    g.fillStyle = on ? '#f6f0e2' : INK; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText(name, x + (tw - 6) / 2, Gm.toolY + 41);
  });
  // portraits and names
  const pw = Gm.colW / G.ents.length, pr = Math.min(22, pw * .38);
  G.ents.forEach((e, k) => {
    const x = Gm.x0 + (k + .5) * pw, y = Gm.stripY + pr + 2;
    if (k === G.sel) { c7Round(g, x - pw / 2 + 2, Gm.stripY - 2, pw - 4, 74, 10); g.fillStyle = 'rgba(232,116,58,.18)'; g.fill(); g.strokeStyle = '#e8743a'; g.lineWidth = 2.4; g.stroke(); }
    c7Token(g, G, k, x, y, pr);
    if (G.placed[k] >= 0) { g.fillStyle = '#2f6a4c'; g.beginPath(); g.arc(x + pr * .8, y - pr * .8, 6, 0, 6.283); g.fill(); g.strokeStyle = '#fbf7ee'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + pr * .8 - 3, y - pr * .8); g.lineTo(x + pr * .8 - 1, y - pr * .8 + 2.5); g.lineTo(x + pr * .8 + 3, y - pr * .8 - 2.5); g.stroke(); }
    // the name without the title (bà, chú, cô…), shrunk to fit its slot
    const nm = e.dish ? c7Food(e)[1] : c7Cap(e.name.split(' ').slice(1).join(' ') || e.name); let fz = 11.5;
    do { g.font = '700 ' + fz + 'px "Be Vietnam Pro", sans-serif'; } while (g.measureText(nm).width > pw - 4 && --fz > 7.5);
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nm, x, Gm.stripY + pr * 2 + 14);
  });
  // what the picked one says
  c7Round(g, Gm.x0, Gm.clueY, Gm.colW, Gm.clueH, 12); g.fillStyle = '#f6f0e2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
  const e = G.ents[G.sel]; g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillStyle = C7_TOK[G.sel % C7_TOK.length]; g.font = '800 15px "Be Vietnam Pro", sans-serif'; g.fillText(c7Cap(e.name), Gm.x0 + 14, Gm.clueY + 10);
  g.fillStyle = INK; g.font = '500 14px "Be Vietnam Pro", sans-serif';
  let ly = Gm.clueY + 32; for (const c of G.K.clues[G.sel]) {   // a statement naming a thing shows that thing beside it
    const t = Object.keys(C7_THING).find(k => c.includes(C7_THING[k].toLowerCase())), ind = t ? 26 : 0;
    if (t && ly < Gm.clueY + Gm.clueH - 4) c7Thing(g, t, Gm.x0 + 24, ly + 8, 22);
    for (const l of c7Wrap(g, c, Gm.colW - 28 - ind)) { if (ly < Gm.clueY + Gm.clueH - 4) g.fillText(l, Gm.x0 + 14 + ind, ly); ly += 18; } }
  g.textBaseline = 'alphabetic';
  // submit
  const ready = G.placed.every(p => p >= 0);
  c7Wood(g, Gm.x0, Gm.subY, Gm.colW - 4, 44, 'Nộp lời giải', ready ? 'son' : 'off'); g.textBaseline = 'alphabetic';
  if (G.sheet) c7DrawSheet(en, g, W, H);
}
function c7DrawLegend(en, g, W, H) {
  const G = en.G, have = Object.keys(C7_THING).filter(t => G.obj.includes(t)), groups = [['Ngồi được', have.filter(t => !C7_BLOCK.has(t)), '#2f6a4c'], ['Không đứng được', have.filter(t => C7_BLOCK.has(t)), '#a3332a']].filter(gr => gr[1].length);
  const rh = 46, bw = Math.min(W - 40, 380), bh = 70 + groups.reduce((a, gr) => a + 30 + gr[1].length * rh, 0) + 40 + 66, bx = (W - bw) / 2, by = Math.max(20, (H - bh) / 2);
  g.fillStyle = 'rgba(29,25,21,.55)'; g.fillRect(0, 0, W, H);
  c7Round(g, bx, by, bw, bh, 18); g.fillStyle = '#fbf7ee'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = '900 26px "Playfair Display", serif'; g.fillText('Chú thích', W / 2, by + 36);
  let y = by + 70;
  for (const [label, list, col] of groups) {
    g.fillStyle = col; g.beginPath(); g.arc(bx + 26, y + 10, 6, 0, 6.283); g.fill(); g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 15px "Be Vietnam Pro", sans-serif'; g.fillText(label, bx + 40, y + 10); y += 30;
    for (const t of list) {
      const cx = bx + 44; c7Round(g, cx - 20, y + 2, 40, 40, 8); g.fillStyle = C7_BLOCK.has(t) ? '#e6dccb' : '#f2e8d6'; g.fill(); g.strokeStyle = 'rgba(29,25,21,.3)'; g.lineWidth = 1.2; g.stroke();
      c7Thing(g, t, cx, y + 22, 34);
      g.fillStyle = INK; g.textAlign = 'left'; g.font = '700 15px "Be Vietnam Pro", sans-serif'; g.fillText(C7_THING[t], bx + 78, y + 15);
      g.font = '500 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.7)'; g.fillText(C7_BLOCK.has(t) ? 'Không ai đứng vào ô này' : 'Có thể ngồi lên', bx + 78, y + 32);
      y += rh;
    }
  }
  // the hatch means no standing
  const hx = bx + 24, hy = y + 6; g.fillStyle = '#e6dccb'; g.fillRect(hx, hy, 40, 26); g.save(); g.beginPath(); g.rect(hx, hy, 40, 26); g.clip(); g.strokeStyle = 'rgba(29,25,21,.3)'; g.lineWidth = 1.6; g.beginPath(); for (let k = -26; k < 40; k += 8) { g.moveTo(hx + k, hy + 26); g.lineTo(hx + k + 26, hy); } g.stroke(); g.restore();
  g.fillStyle = INK; g.textAlign = 'left'; g.font = '500 13px "Be Vietnam Pro", sans-serif'; g.fillText('Ô gạch chéo mờ: không đứng được', bx + 78, hy + 13);
  const btns = en.sheetBtns = [], b = [bx + 20, by + bh - 62, bw - 44, 44];
  c7Wood(g, ...b, 'Đóng', 'paper'); btns.push([b[0], b[1], b[2] + 4, 48, () => { G.sheet = null; }]);
  g.textBaseline = 'alphabetic';
}
function c7DrawSheet(en, g, W, H) {
  if (en.G.sheet === 'legend') return c7DrawLegend(en, g, W, H);
  const G = en.G, win = G.sheet === 'win';
  g.fillStyle = 'rgba(29,25,21,.55)'; g.fillRect(0, 0, W, H);
  const bw = Math.min(W - 40, 380), bh = win ? 330 : 270, bx = (W - bw) / 2, by = (H - bh) / 2;
  c7Round(g, bx, by, bw, bh, 18); g.fillStyle = win ? '#fbf7ee' : '#fbeee8'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const btns = en.sheetBtns = [];
  const button = (label, y, main, act) => { const x = bx + 20, w = bw - 44; c7Wood(g, x, y, w, 44, label, main ? 'son' : 'paper'); btns.push([x, y, w + 4, 48, act]); };
  if (win) {
    const c = G.K.culprit, dish = G.ents[G.ents.length - 1].name;
    g.fillStyle = '#a3332a'; g.font = '900 30px "Playfair Display", serif'; g.fillText('Phá được án!', W / 2, by + 38);
    c7Token(g, G, c, W / 2, by + 104, 36, '#a3332a');
    g.fillStyle = INK; g.font = '600 15px "Be Vietnam Pro", sans-serif';
    c7Wrap(g, `Kẻ ăn vụng ${dish} là ${G.ents[c].name}: người duy nhất ở cùng khu với ${dish}.`, bw - 40).forEach((l, k) => g.fillText(l, W / 2, by + 160 + k * 20));
    g.font = '700 14px "Be Vietnam Pro", sans-serif'; g.fillText('Thời gian ' + c7Clock(G.time) + (G.hinted.size ? ' · có dùng gợi ý' : ''), W / 2, by + 218);
    button('Vụ tiếp theo', by + bh - 66, true, () => en.next());
  } else {
    g.fillStyle = '#c0563a'; g.font = '900 30px "Playfair Display", serif'; g.fillText('Chưa đúng rồi', W / 2, by + 44);
    g.fillStyle = INK; g.font = '600 15px "Be Vietnam Pro", sans-serif'; g.fillText('Đọc lại lời khai xem nào.', W / 2, by + 84);
    button('Xem lại', by + bh - 128, true, () => { G.sheet = null; });
    button('Về danh sách vụ', by + bh - 70, false, () => en.close());
  }
  g.textBaseline = 'alphabetic';
}
