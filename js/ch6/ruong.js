/* Chương VI · Tìm Chuột: one field per level (Meowdoku with mice, the owner's choice). A field is cut into coloured plots;
   put one mouse in every row, every column and every plot, and no two mice may touch, not even corner to corner.
   One tap marks a cell with a white × ("no mouse here"; the mark waits out the double-tap time, so a double tap never
   flashes one), a drag marks many (starting on a mark wipes), a double tap puts a mouse there;
   a wrong mouse costs one of three hearts and leaves a red × on that cell for good. Level 1 is a guided 4×4 practice
   field (MD_TUT: only the lit cells answer, a slip above with the rule and one below with what to do, a finger showing
   it). Level 2 hatches ruled-out cells and shows the drag with a finger until the player has dragged once. Each field
   opens with "Tìm N con chuột"; the rules are three little cards over the field (owner's reference screen). Fields come from levels.js (C6_LEVELS). */
const MD_HEARTS = 3;
const MD_COLS = ['#e8c547', '#7fb069', '#d9705c', '#5b6fb5', '#b48ad6', '#e89a4a', '#9fd4e8', '#3f9e93', '#f0a8c0', '#a8a07a'];   // far apart, so plots never blur together
function mdNewGame(level) { const G = { level, hearts: MD_HEARTS, over: false, result: null, t: 0, shake: null, next: 0 }; if (level === 0) mdTutorial(G); else mdField(G); return G; }
// the practice field: plots 0 green, 1 red, 2 yellow, 3 blue; one mouse given; the steps below lead to the answer
const MD_TUT_REG = [1, 3, 0, 3, 1, 3, 3, 3, 1, 1, 2, 3, 1, 2, 2, 3];
const MD_TUT = [
  { kind: 'mark', cells: [0, 1, 3, 6, 10, 14], hand: 'tap', top: lg('Hai con chuột không được ở cùng hàng, cũng không được ở cùng cột.', 'No two mice in the same row, nor in the same column.'), bot: lg('Chạm vào các ô sáng để đánh dấu không có chuột.', 'Tap the lit squares to mark them: no mouse here.') },
  { kind: 'mouse', cells: [13], hand: 'dbl', top: lg('Thửa vàng chỉ còn đúng một ô.', 'The yellow plot has just one square left.'), bot: lg('Chạm hai lần liền để thả chuột.', 'Tap twice to put a mouse there.') },
  { kind: 'mark', cells: [8, 9, 12], hand: 'swipe', path: [12, 8, 9], top: lg('Hai con chuột không được đứng sát nhau, kể cả chéo.', 'No two mice may touch, not even corner to corner.'), bot: lg('Di tay qua các ô này để đánh dấu.', 'Slide across these squares to mark them.') },
  { kind: 'mouse', cells: [4], hand: 'dbl', top: lg('Thửa đỏ chỉ còn đúng một ô.', 'The red plot has just one square left.'), bot: lg('Chạm hai lần liền để thả chuột.', 'Tap twice to put a mouse there.') },
  { kind: 'mark', cells: [5, 7], hand: 'tap', top: lg('Hàng này đã có chuột rồi!', 'This row has its mouse already!'), bot: lg('Đánh dấu các ô còn lại.', 'Mark the other squares.') },
  { kind: 'free', top: lg('Tìm nốt con chuột cuối cùng!', 'Find the last mouse!'), bot: lg('Mỗi thửa đúng một con chuột.', 'One mouse in every plot.') },
];
function mdTutorial(G) {
  Object.assign(G, { N: 4, reg: MD_TUT_REG, sol: [2, 0, 3, 1], mice: new Set([2]), dots: new Set(), wrong: new Set(), next: 0, intro: 0, tut: { step: 0, wait: 0 },
    cols: ['#7fb069', '#d9705c', '#e8c547', '#6f9bd1'] });
}
// in the practice field only the lit cells answer
function mdAllowed(G, i, act) {
  if (!G.tut) return true;
  const st = MD_TUT[G.tut.step]; if (!st || G.tut.wait > 0) return false;
  if (st.kind === 'free') return true;
  return st.cells.includes(i) && (act === 'dot' ? st.kind === 'mark' : st.kind === 'mouse');
}
function mdField(G) {
  const L = C6_LEVELS[G.level - 1], N = L.N, reg = [...L.reg].map(ch => parseInt(ch, 36)), sol = [...L.sol].map(ch => parseInt(ch, 36));
  Object.assign(G, { N, reg, sol, mice: new Set(), dots: new Set(), wrong: new Set(), next: 0, intro: 1.8, tut: null });
  // the plots get colours in a shuffled order
  const rr = mulberry(G.level * 31 + 7); G.cols = MD_COLS.slice().sort(() => rr() - .5);
}
// the screen (owner's reference): a back button and "Màn N" on top, the hearts, three little rule cards, a strip of mouse
// heads (one per plot colour, filled in as that plot's mouse is found), then the field in a rounded panel
function mdGeo(G, W, H) {
  const colW = Math.min(W - 24, 470), x0 = (W - colW) / 2, tut = G.tut && !G.over;
  const top = 250, size = Math.max(160, Math.min(colW - 20, H - top - (tut ? 100 : 40))), cell = size / G.N;
  return { size, cell, ox: (W - size) / 2, oy: top, colW, x0, back: [x0 + 30, 44] };
}
function mdCell(en, x, y) { const G = en.G, Gm = en.geo; if (!Gm) return -1; const c = Math.floor((x - Gm.ox) / Gm.cell), r = Math.floor((y - Gm.oy) / Gm.cell); return r >= 0 && c >= 0 && r < G.N && c < G.N ? r * G.N + c : -1; }
// a cell is ruled out once a mouse sits in its row, column, plot, or next to it
function mdBlocked(G, i) {
  const N = G.N, r = (i / N) | 0, c = i % N;
  for (const m of G.mice) { const mr = (m / N) | 0, mc = m % N; if (m !== i && (mr === r || mc === c || G.reg[m] === G.reg[i] || (Math.abs(mr - r) <= 1 && Math.abs(mc - c) <= 1))) return true; }
  return false;
}
function mdDown(en, x, y) {
  const G = en.G, Gm = en.geo; if (!Gm) return;
  if (Math.hypot(x - Gm.back[0], y - Gm.back[1]) < 30) { en.close(); return; }
  if (G.over) { en.after(G.result); return; }
  if (G.next) return;
  if (G.intro > 0) { G.intro = 0; return; }                                 // a tap skips the 'Tìm N con chuột' card
  const i = mdCell(en, x, y); G.press = i >= 0 ? { i, moved: false, wipe: G.dots.has(i) } : null;
}
function mdMove(en, x, y) {
  const G = en.G, p = G.press; if (!p) return;
  const i = mdCell(en, x, y); if (i < 0 || (i === p.i && !p.moved)) return;
  if (!p.moved) { p.moved = true; G.pending = null; mdDot(G, p.i, p.wipe); if (!SAVE6.dotted) { SAVE6.dotted = true; persist6(); } }
  mdDot(G, i, p.wipe);
}
function mdDot(G, i, wipe) { if (G.mice.has(i) || G.wrong.has(i) || !mdAllowed(G, i, 'dot')) return; if (wipe) G.dots.delete(i); else if (!G.dots.has(i)) { G.dots.add(i); AU.tap(); } }
function mdToggle(G, i) { if (!mdAllowed(G, i, 'dot')) return; if (G.dots.has(i)) G.dots.delete(i); else G.dots.add(i); AU.tap(); }
const MD_DBL = 300;                                                         // ms for a double tap
function mdUp(en) {
  const G = en.G, p = G.press; G.press = null; if (!p || p.moved || G.over || G.next || G.intro > 0) return;
  const i = p.i;
  if (G.mice.has(i) || G.wrong.has(i)) return;
  const st = G.tut && MD_TUT[G.tut.step];
  if (st && st.kind === 'mark') { mdToggle(G, i); return; }                 // practice marking steps: a tap marks at once
  // one tap marks (×) once the double-tap time has passed with no second tap; a double tap puts a mouse, with no mark
  // flashing in between (owner)
  const now = performance.now();
  if (G.pending && G.pending.i === i && now - G.pending.t < MD_DBL) { G.pending = null; mdPlace(G, i); return; }
  if (G.pending) mdToggle(G, G.pending.i);                                  // a quick tap elsewhere: the first one was a single
  G.pending = { i, t: now };
}
function mdPlace(G, i) {
  const N = G.N;
  if (G.tut && !mdAllowed(G, i, 'mouse')) return;
  G.dots.delete(i);
  if (G.sol[(i / N) | 0] === i % N) {
    G.mice.add(i); AU.pluck(80 + G.mice.size);
    if (G.mice.size === N) { G.next = 1.4; AU.kenCall(); }
  } else {
    if (!G.tut) G.hearts--; G.shake = { i, t: .7 }; G.wrong.add(i); AU.snort();   // the red × stays, to be remembered
    if (G.hearts <= 0) { G.over = true; G.result = 'lose'; }
  }
}
function mdTick(en, dt) {
  const G = en.G; G.t += dt; if (G.intro > 0) G.intro -= dt;
  if (G.pending && performance.now() - G.pending.t >= MD_DBL) { const i = G.pending.i; G.pending = null; if (!G.mice.has(i) && !G.wrong.has(i)) mdToggle(G, i); }
  if (G.shake && (G.shake.t -= dt) <= 0) G.shake = null;
  if (G.tut && !G.next) {                                                   // practice: on to the next step once this one is done
    const st = MD_TUT[G.tut.step];
    if (G.tut.wait > 0) { if ((G.tut.wait -= dt) <= 0) G.tut.step++; }
    else if (st.kind === 'mark' ? st.cells.every(c => G.dots.has(c)) : st.kind === 'mouse' ? G.mice.has(st.cells[0]) : false) { G.tut.wait = .5; AU.pluck(88); }
  }
  if (G.next) { G.next -= dt; if (G.next <= 0) { G.next = 0; if (G.tut) { SAVE6.tut = true; persist6(); } G.over = true; G.result = 'win'; AU.drumHit(); } }
  if (G.over && !G.told) { G.told = true; en.result && en.result(G.result); }
}

/* ---------- drawing ---------- */
function mdRound(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function mdX(g, x, y, s, col, lw) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); }
// a little mouse head: the strip over the field and the rule cards
function mdHead(g, x, y, s, col, found) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.globalAlpha = found ? 1 : .38; g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = found ? 1.6 : 1;
  for (const d of [-1, 1]) { g.beginPath(); g.arc(d * 7, -8, 5.5, 0, 6.283); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(0, 0, 9, 8, 0, 0, 6.283); g.fill(); g.stroke();
  if (found) {
    for (const d of [-1, 1]) { g.fillStyle = '#e2a597'; g.beginPath(); g.arc(d * 7, -8, 2.8, 0, 6.283); g.fill(); }
    g.fillStyle = INK; for (const d of [-1, 1]) { g.beginPath(); g.arc(d * 3.4, -1, 1.5, 0, 6.283); g.fill(); }
    g.fillStyle = '#a3332a'; g.beginPath(); g.arc(0, 3.5, 1.6, 0, 6.283); g.fill();
  }
  g.globalAlpha = 1; g.restore();
}
// the three rule cards: a tiny 3×3 field drawn the rule's way, and its words
function mdRules(g, Gm) {
  const n = 3, gap = 6, w = (Gm.colW - gap * (n - 1)) / n, h = 62, y = 128;
  mdRound(g, Gm.x0 - 6, y - 8, Gm.colW + 12, h + 16, 14); g.fillStyle = '#f2ecde'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  const cards = [
    { t: lg('Mỗi thửa một con chuột', 'One mouse a plot'), m: [1, 1, 1, 1, 'm', 0, 1, 0, 0], tint: [1, 1, 1, 1, 1, 0, 1, 0, 0] },
    { t: lg('Mỗi hàng, cột một con', 'One a row and column'), m: [1, 'm', 1, 0, 1, 0, 0, 1, 0] },
    { t: lg('Không đứng sát nhau', 'Never touching'), m: [1, 1, 1, 1, 'm', 1, 1, 1, 1] },
  ];
  cards.forEach((cd, k) => {
    const x = Gm.x0 + k * (w + gap);
    mdRound(g, x, y, w, h, 9); g.fillStyle = '#e9dcc0'; g.fill();
    const q = Math.min(11, (h - 16) / 3), gx = x + 7, gy = y + (h - q * 3) / 2;
    cd.m.forEach((v, j) => {
      const cx = gx + (j % 3) * q, cy = gy + ((j / 3) | 0) * q;
      g.fillStyle = cd.tint && cd.tint[j] ? '#c98a5a' : '#d7c3a3'; g.fillRect(cx + .8, cy + .8, q - 1.6, q - 1.6);
      if (v === 1) mdX(g, cx + q / 2, cy + q / 2, q * .26, '#f6f0e2', 2);
      if (v === 'm') mdHead(g, cx + q / 2, cy + q / 2 + 1, q / 22, '#9a97b5', true);
    });
    g.fillStyle = INK; g.font = '700 ' + (w < 130 ? 11 : 12.5) + 'px "Be Vietnam Pro", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
    const tx = gx + q * 3 + 6, lines = mdWrap(g, cd.t, x + w - tx - 4);
    lines.forEach((l, i) => g.fillText(l, tx, y + h / 2 + (i - (lines.length - 1) / 2) * 13));
  });
  g.textBaseline = 'alphabetic';
}
function mdHowto(g, G, Gm) {
  const N = G.N, cs = Gm.cell, row = N - 1, from = 0, to = Math.min(N - 1, 3), T = 2.6, k = (G.t % T) / T, sweep = Math.min(1, Math.max(0, (k - .15) / .6));
  const x = Gm.ox + (from + .5 + (to - from) * sweep) * cs, y = Gm.oy + (row + .5) * cs;
  for (let c = from; c <= from + (to - from) * sweep + .01; c++) mdX(g, Gm.ox + (c + .5) * cs, y, cs * .2, 'rgba(246,240,226,.7)', Math.max(3, cs * .1));
  const fade = k > .85 ? 1 - (k - .85) / .15 : 1, A = howtoArt();
  g.globalAlpha = fade;
  if (isTouch) dp(g, A.finger, x + 5, y - 2, -.15, 1.05, 1.05); else { dp(g, A.mouse, x + 10, y + 16, 0, .7, .7); if (sweep > 0 && sweep < 1) dp(g, A.click, x + 10, y + 16, 0, .7, .7); }
  g.globalAlpha = 1;
}
function mdBack(g, Gm) {
  const [cx, cy] = Gm.back; g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.arc(cx, cy, 22, 0, 6.283); g.fill(); g.stroke();
  g.lineWidth = 3.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx + 9, cy); g.lineTo(cx - 9, cy); g.moveTo(cx - 2, cy - 7); g.lineTo(cx - 9, cy); g.lineTo(cx - 2, cy + 7); g.stroke();
}
// a paper slip with a line or two of words: its bottom edge at y (up) or its top edge at y (down)
function mdSlip(g, W, y, text, big, up) {
  g.font = (big ? '800 19px' : '600 16px') + ' "Be Vietnam Pro", sans-serif';
  const bw = Math.min(W - 40, 360), lines = mdWrap(g, text, bw - 36), h = 26 + lines.length * (big ? 26 : 22), bx = (W - bw) / 2, by = up ? y - h : y;
  mdRound(g, bx, by, bw, h, 12); g.fillStyle = '#f2ecde'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke();
  g.fillStyle = big ? '#a3332a' : INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, k) => g.fillText(l, W / 2, by + 13 + (k + .5) * (big ? 26 : 22)));
  g.textBaseline = 'alphabetic';
}
// the practice field's guidance: dim all but the lit cells, the rule above, what to do below, a finger showing it
function mdTutDraw(g, G, Gm, W) {
  const st = MD_TUT[Math.min(G.tut.step, MD_TUT.length - 1)], N = G.N, cs = Gm.cell, done = !!G.next;
  if (st.kind !== 'free' && !done) for (let i = 0; i < N * N; i++) if (!st.cells.includes(i) && !G.mice.has(i)) { g.fillStyle = 'rgba(29,25,21,.55)'; mdRound(g, Gm.ox + (i % N) * cs + 2, Gm.oy + ((i / N) | 0) * cs + 2, cs - 4, cs - 4, 7); g.fill(); }
  mdSlip(g, W, Gm.oy - 14, done ? lg('Giỏi lắm! Mẹ đã gọi đủ các con về.', 'Well done! Mother has all her children home.') : st.top, true, true);
  if (!done) mdSlip(g, W, Gm.oy + Gm.size + 16, st.bot, false, false);
  if (done || G.tut.wait > 0 || st.kind === 'free') return;
  const ctr = i => [Gm.ox + (i % N + .5) * cs, Gm.oy + (((i / N) | 0) + .5) * cs], A = howtoArt(), T = G.t;
  let p, press = false;
  if (st.hand === 'swipe') {
    const path = st.path.map(ctr), k = (T % 2.4) / 2.4, u = Math.min(1, Math.max(0, (k - .1) / .7)) * (path.length - 1), a = Math.min(path.length - 2, Math.floor(u)), f = u - a;
    p = [path[a][0] + (path[a + 1][0] - path[a][0]) * f, path[a][1] + (path[a + 1][1] - path[a][1]) * f]; press = k > .1 && k < .8;
  } else {
    const target = st.cells.find(c => !G.dots.has(c) && !G.mice.has(c)) ?? st.cells[0], k = T % 1.4;
    p = ctr(target); press = st.hand === 'dbl' ? (k < .12 || (k > .24 && k < .36)) : k < .15;
  }
  if (press) { g.strokeStyle = INK; g.lineWidth = 2; g.globalAlpha = .7; g.beginPath(); g.arc(p[0], p[1], cs * .28, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  if (isTouch) dp(g, A.finger, p[0] + 6, p[1] + (press ? 0 : -6), -.15, 1.15, 1.15);
  else { dp(g, A.mouse, p[0] + 14, p[1] + 22, 0, .8, .8); if (press) dp(g, A.click, p[0] + 14, p[1] + 22, 0, .8, .8); }
}
// split a sentence into lines that fit
// words wrap at spaces; Chinese and Japanese (no spaces) may break between any two characters
function mdWrap(g, text, w) { const cjk = /[　-鿿＀-￯]/, toks = text.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+/g) || [], out = []; let line = ''; for (const word of toks) { const t = !line ? word : cjk.test(word) || cjk.test(line.slice(-1)) ? line + word : line + ' ' + word; if (g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; }
function mdHeart(g, x, y, s, full) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -8, -12, 0, -6); g.bezierCurveTo(8, -12, 12, -2, 0, 6); g.closePath();
  g.fillStyle = full ? '#a3332a' : '#d9cdb2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke(); g.restore();
}
function mdDraw(en, g, W, H) {
  const G = en.G, Gm = en.geo = mdGeo(G, W, H), N = G.N, cs = Gm.cell, tut = G.tut && !G.over;
  // top: back, the level, the hearts
  mdBack(g, Gm);
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 15px "Be Vietnam Pro", sans-serif'; g.fillText(lg('Màn', 'Level'), W / 2, 26);
  g.font = '900 30px "Playfair Display", serif'; g.fillText(String(G.level + 1), W / 2, 54);
  mdRound(g, W / 2 - 58, 76, 116, 34, 17); g.fillStyle = '#f2ecde'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < MD_HEARTS; k++) mdHeart(g, W / 2 - 32 + k * 32, 94, 1.25, k < G.hearts);
  g.textBaseline = 'alphabetic';
  if (!tut) {
    mdRules(g, Gm);
    // the strip of heads, one per plot: filled in once its mouse is found
    const found = new Set([...G.mice].map(i => G.reg[i])), hs = Math.min(1.3, (Gm.size - 30) / (N * 30)), sw = N * 30 * hs + 20;
    mdRound(g, W / 2 - sw / 2, Gm.oy - 40, sw, 48, 14); g.fillStyle = '#f2ecde'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    for (let k = 0; k < N; k++) mdHead(g, W / 2 - (N - 1) * 15 * hs + k * 30 * hs, Gm.oy - 18, hs, G.cols[k % G.cols.length], found.has(k));
    // mẹ chuột beside the strip, a hand to her mouth calling the children home; she claps once they are all back
    const all = found.size === N, mx = W / 2 - sw / 2 - 26;
    if (mx > 12) c4Mouse(g, c4MouseRig(0), mx, 1, S.pose * 2, false, all ? -1.6 + Math.abs(Math.sin(G.t * 8)) * .4 : -1.25 + Math.sin(G.t * 3) * .12, null, .42, Gm.oy - 2 - (all ? Math.abs(Math.sin(G.t * 7)) * 4 : 0), 5);
  }
  // the field: a rounded panel, rounded cells with gaps
  mdRound(g, Gm.ox - 8, Gm.oy - 8, Gm.size + 16, Gm.size + 16, 16); g.fillStyle = '#f2ecde'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke();
  const gp = Math.max(2, cs * .05), rad = Math.min(8, cs * .14);
  for (let i = 0; i < N * N; i++) {
    const r = (i / N) | 0, c = i % N, x = Gm.ox + c * cs + gp / 2, y = Gm.oy + r * cs + gp / 2, w = cs - gp;
    mdRound(g, x, y, w, w, rad); g.fillStyle = G.cols[G.reg[i] % G.cols.length]; g.fill();
    if (G.level === 1 && G.mice.size && !G.mice.has(i) && mdBlocked(G, i)) {          // level 2 only: ruled-out cells hatched
      g.save(); mdRound(g, x, y, w, w, rad); g.clip(); g.strokeStyle = 'rgba(29,25,21,.22)'; g.lineWidth = 1.5; g.beginPath();
      for (let d = -w; d < w; d += w / 5) { g.moveTo(x + d, y + w); g.lineTo(x + d + w, y); } g.stroke(); g.restore();
    }
  }
  // white × marks, red × for wrong guesses (they stay)
  for (const i of G.dots) mdX(g, Gm.ox + (i % N + .5) * cs, Gm.oy + (((i / N) | 0) + .5) * cs, cs * .2, '#fbf7ee', Math.max(3, cs * .1));
  for (const i of G.wrong) { const sh = G.shake && G.shake.i === i ? Math.sin(G.shake.t * 50) * 5 : 0; const x = Gm.ox + (i % N + .5) * cs + sh, y = Gm.oy + (((i / N) | 0) + .5) * cs; mdX(g, x, y, cs * .22, '#fbf7ee', Math.max(6, cs * .17)); mdX(g, x, y, cs * .22, '#a3332a', Math.max(3.5, cs * .1)); }   // white edge: seen on a red plot too
  if (G.level === 1 && !SAVE6.dotted && !(G.intro > 0) && !G.over && !G.next) mdHowto(g, G, Gm);
  for (const i of G.mice) {
    const r = (i / N) | 0, c = i % N, s = cs * .82 / 168, hop = G.next ? Math.abs(Math.sin(G.t * 9 + c)) * cs * .08 : 0;
    c4Mouse(g, c4MouseRig([11, 12, 13][(r + c) % 3]), Gm.ox + c * cs + cs * .45, 1, S.pose * 2 + i, false, G.next ? -1.4 : null, null, s, Gm.oy + (r + 1) * cs - cs * .06 - hop, i);
  }
  if (tut) { mdTutDraw(g, G, Gm, W); return; }
  if (G.intro > 0 && !G.over) {
    const k = Math.min(1, G.intro * 3, (1.8 - G.intro) * 6); g.globalAlpha = k;
    const bw = Math.min(W - 60, 300), bx = (W - bw) / 2, by = Gm.oy + Gm.size / 2 - 50;
    mdRound(g, bx, by, bw, 100, 14); g.fillStyle = 'rgba(242,236,222,.95)'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 32px "Playfair Display", serif'; g.fillText(lgf('Gọi {n} con về', 'Call {n} little mice home', { n: N }), W / 2, by + 40); g.font = '600 15px "Be Vietnam Pro", sans-serif'; g.fillText(lg('Lũ chuột con trốn chơi khắp ruộng', 'They are hiding all over the field'), W / 2, by + 74);
    g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
  }
  if (G.over) {
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 60px "Playfair Display", serif';
    const txt = G.result === 'win' ? lg('ĐỦ CẢ!', 'ALL HOME!') : lg('THUA', 'LOST');
    g.save(); g.translate(W / 2, Gm.oy + Gm.size / 2); g.rotate(-.12); g.lineWidth = 6; g.strokeStyle = '#f2ecde'; g.strokeText(txt, 0, 0); g.fillStyle = G.result === 'win' ? '#a3332a' : INK; g.fillText(txt, 0, 0); g.restore();
    g.textBaseline = 'alphabetic';
  }
}
