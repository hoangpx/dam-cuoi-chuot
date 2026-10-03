/* Chương VII · Ai Ăn Vụng? 食 — the chapter shell: the case list (an album grouped Dễ 5×5 … Rất khó 8×8, each case opened by
   solving the one before), six "Cách chơi" pages (after the reference: rebuild the scene, rooms matter, beside is not
   diagonal, the things, one exact answer, the tools) shown before the first case and from the ? button, and the saves:
   SAVE7 { done[], best[] (seconds), how } in localStorage 'dcc.c7'. vu.js plays and draws a case. */
let SAVE7 = { done: [], best: [], how: false };
try { const s = JSON.parse(localStorage.getItem('dcc.c7') || 'null'); if (s && Array.isArray(s.done)) SAVE7 = Object.assign(SAVE7, s); } catch (e) {}
const persist7 = () => { try { localStorage.setItem('dcc.c7', JSON.stringify(SAVE7)); } catch (e) {} };
const C7_LEVEL = ['Dễ', 'Vừa', 'Khó', 'Rất khó'];
const C7 = { i: 0, G: null, geo: null, drag: false, page: -1 };

function buildAlbum7() {
  const box = $('#cards'); box.textContent = ''; let lv = -1;
  C7_CASES.forEach((K, i) => {
    if (K.lv !== lv) { lv = K.lv; const h = document.createElement('div'); h.className = 'sec'; h.textContent = `${C7_LEVEL[lv]} · ${K.N} × ${K.N}`; box.appendChild(h); }
    const open = i === 0 || SAVE7.done[i - 1] || SAVE7.done[i];
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = ['#e9dcc0', '#e6d3c9', '#d3dbe6', '#e4d6ea'][K.lv]; b.disabled = !open;
    b.innerHTML = `<div class="num">Vụ ${i + 1}</div><div class="ch">${K.N}×${K.N}</div><b>${K.title}</b><span class="st${SAVE7.done[i] ? ' done' : ''}">${SAVE7.done[i] ? 'Đã phá án · ' + c7Clock(SAVE7.best[i] || 0) : open ? 'Phá án' : 'Chưa mở'}</span>`;
    b.addEventListener('click', () => { if (open) startC7(i); });
    box.appendChild(b);
  });
}
function startC7(i) {
  trackEnter(`chuong-7/vu-${i + 1}`);
  AU.init(); AU.setSong(9); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 7; S.mode = 'c7play'; C7.i = i;
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  C7.G = c7NewGame(i); C7.page = SAVE7.how ? -1 : 0;
}
C7.close = () => showAlbum(7);
C7.howto = () => { C7.page = 0; };
C7.next = () => { if (C7.i + 1 < C7_CASES.length) startC7(C7.i + 1); else showAlbum(7); };
C7.result = G => { trackWin(); SAVE7.done[C7.i] = true; if (!SAVE7.best[C7.i] || G.time < SAVE7.best[C7.i]) SAVE7.best[C7.i] = Math.round(G.time); persist7(); };

/* ---------- the "Cách chơi" pages ---------- */
const C7_PAGES = [
  { title: 'Dựng lại cảnh', text: 'Lần theo lời khai, tìm chỗ từng người đứng lúc món ăn bị ăn vụng. Mỗi hàng, mỗi cột chỉ có đúng một người (hoặc món ăn). Rồi chỉ ra kẻ ăn vụng.', show: 'part' },
  { title: 'Mỗi khu một vách', text: 'Nhà và vườn chia thành từng khu, viền vách đậm. “Đứng cạnh chum” chỉ tính ô trong cùng khu với cái chum. “Góc khu” là ô ở góc của khu đó.', show: 'rooms' },
  { title: '“Cạnh” không tính chéo', text: 'Cạnh là ô ngay trên, dưới, bên trái hoặc bên phải. Ô chéo không tính.', show: 'beside' },
  { title: 'Đồ đạc trong nhà', text: 'Giường, ghế, chiếu thì ngồi được. Chum, cối, cây cau, đống rơm, giếng thì không ai đứng vào được (ô có gạch chéo mờ), nhưng lời khai vẫn có thể nhắc tới.', show: 'things' },
  { title: 'Chỉ một cách xếp', text: 'Khi mọi lời khai đều khớp thì chỉ còn đúng một cách xếp. Kẻ ăn vụng là người duy nhất ở cùng khu với món ăn.', show: 'full' },
  { title: 'Đồ nghề phá án', text: '', show: 'tools' },
];
function c7HowGeo(W, H) { const colW = Math.min(W - 24, 470), x0 = (W - colW) / 2; return { colW, x0, back: [x0 + 24, 40], skip: [x0 + colW - 30, 40], go: [x0, H - 70, colW, 50] }; }
function c7HowTap(x, y) {
  const Gm = c7HowGeo(cv.width / DPR, cv.height / DPR), [gx, gy, gw, gh] = Gm.go;
  if (Math.hypot(x - Gm.back[0], y - Gm.back[1]) < 26) { AU.tap(); if (C7.page > 0) C7.page--; else if (!SAVE7.how) showAlbum(7); else C7.page = -1; return; }
  if (Math.abs(x - Gm.skip[0]) < 40 && Math.abs(y - Gm.skip[1]) < 20 || (x > gx && x < gx + gw && y > gy && y < gy + gh)) {
    AU.tap(); const skip = Math.abs(x - Gm.skip[0]) < 40 && y < 70;
    if (skip || C7.page >= C7_PAGES.length - 1) { C7.page = -1; SAVE7.how = true; persist7(); } else C7.page++;
  }
}
function c7DrawHow(g, W, H) {
  const Gm = c7HowGeo(W, H), P = C7_PAGES[C7.page], demo = c7NewGame(0), K = demo.K;
  g.fillStyle = '#fbf7ee'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(...Gm.back, 20, 0, 6.283); g.fill(); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(Gm.back[0] + 4, 32); g.lineTo(Gm.back[0] - 4, 40); g.lineTo(Gm.back[0] + 4, 48); g.stroke();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 18px "Be Vietnam Pro", sans-serif'; g.fillText('Cách chơi', W / 2, 30);
  g.font = '600 13px "Be Vietnam Pro", sans-serif'; g.fillText(`${C7.page + 1}/${C7_PAGES.length}`, W / 2, 52);
  if (C7.page < C7_PAGES.length - 1) { g.fillStyle = '#c0563a'; g.font = '800 15px "Be Vietnam Pro", sans-serif'; g.fillText('Bỏ qua', ...Gm.skip); }
  g.fillStyle = 'rgba(29,25,21,.15)'; g.fillRect(0, 70, W, 4); g.fillStyle = '#a3332a'; g.fillRect(0, 70, W * (C7.page + 1) / C7_PAGES.length, 4);
  g.fillStyle = INK; g.font = '900 28px "Playfair Display", serif'; g.fillText(P.title, W / 2, 112);
  // the picture
  const pw = Gm.colW, ph = Math.min(pw * .92, H - 400), px = Gm.x0, py = 140;
  c7Round(g, px, py, pw, ph, 18); g.fillStyle = '#fbf7ee'; g.fill(); g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 2; g.stroke();
  const bs = Math.min(pw - 40, ph - 30), bx = W / 2 - bs / 2, byy = py + (ph - bs) / 2;
  if (P.show === 'part' || P.show === 'full' || P.show === 'rooms') {
    if (P.show === 'part') { demo.placed[0] = demo.sol[0]; demo.placed[1] = demo.sol[1]; for (let c = 0; c < demo.N; c++) { const a = ((demo.sol[0] / demo.N) | 0) * demo.N + c; if (a !== demo.sol[0] && !C7_BLOCK.has(demo.obj[a])) demo.cross.add(a); } }
    if (P.show === 'full') demo.placed = demo.sol.slice();
    demo.sel = -1;
    c7Board(g, demo, bx, byy, bs, { ring: e => P.show === 'full' && (e === K.culprit || demo.ents[e].dish) ? '#a3332a' : null });
  } else if (P.show === 'beside') {
    const s = Math.min(bs, 240), q = s / 3, x0 = W / 2 - s / 2, y0 = py + (ph - s) / 2;
    for (let k = 0; k < 9; k++) { const x = x0 + (k % 3) * q, y = y0 + ((k / 3) | 0) * q, diag = k % 2 === 0 && k !== 4, ok = k === 7;
      g.fillStyle = ok ? '#2f6a4c' : diag ? '#e6dccb' : '#f2e8d6'; g.fillRect(x, y, q, q); g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1; g.strokeRect(x, y, q, q);
      if (diag) { g.strokeStyle = '#7a6a5a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x + q * .38, y + q * .38); g.lineTo(x + q * .62, y + q * .62); g.moveTo(x + q * .62, y + q * .38); g.lineTo(x + q * .38, y + q * .62); g.stroke(); }
      if (ok) { g.strokeStyle = '#fbf7ee'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x + q * .34, y + q * .52); g.lineTo(x + q * .46, y + q * .64); g.lineTo(x + q * .68, y + q * .38); g.stroke(); } }
    c7Thing(g, 'chum', x0 + q * 1.5, y0 + q * 1.5, q * .9); g.strokeStyle = INK; g.lineWidth = 3.4; g.strokeRect(x0, y0, s, s);
  } else if (P.show === 'things') {
    const groups = [['Ngồi được', ['chong', 'phan', 'chieu', 'ghe'], '#2f6a4c'], ['Không đứng được', ['chum', 'coi', 'cau', 'rom', 'gieng'], '#a3332a']];
    let y = py + 22; const cw = (pw - 40) / 4;
    for (const [label, list, col] of groups) {
      g.fillStyle = col; g.beginPath(); g.arc(px + 26, y, 6, 0, 6.283); g.fill(); g.fillStyle = INK; g.font = '800 14px "Be Vietnam Pro", sans-serif'; g.textAlign = 'left'; g.fillText(label, px + 40, y); y += 16;
      list.forEach((t, k) => { const cx = px + 20 + (k % 4) * cw, cy = y + ((k / 4) | 0) * (cw * .72 + 8); c7Round(g, cx + 3, cy, cw - 6, cw * .72, 12); g.fillStyle = '#f2e8d6'; g.fill(); g.strokeStyle = 'rgba(29,25,21,.25)'; g.lineWidth = 1.4; g.stroke();
        c7Thing(g, t, cx + cw / 2, cy + cw * .28, cw * .45); g.fillStyle = INK; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText(C7_THING[t], cx + cw / 2, cy + cw * .6); });
      y += Math.ceil(list.length / 4) * (cw * .72 + 8) + 16;
    }
  } else if (P.show === 'tools') {
    const rows = [['notes', 'Ghi chú', 'Ghim ảnh nhỏ của người đang chọn vào ô có thể là chỗ của họ.'], ['cross', 'Gạch', 'Gạch bỏ ô chắc chắn không có ai. Di tay để gạch nhiều ô.'], ['place', 'Đặt', 'Đặt người đang chọn vào ô bạn tin chắc.'], ['erase', 'Xoá', 'Xoá hết trong ô: ghi chú, gạch và người.'], ['hint', 'Gợi ý', 'Xem một phút quảng cáo để được đặt đúng chỗ một người.']];
    const rh = Math.min(70, (ph - 20) / 5);
    rows.forEach(([t, name, txt], k) => { const y = py + 10 + k * rh; g.fillStyle = '#fbf7ee'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.arc(px + 36, y + rh / 2, 20, 0, 6.283); g.fill(); g.stroke(); c7Icon(g, t, px + 36, y + rh / 2, false);
      g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 15px "Be Vietnam Pro", sans-serif'; g.fillText(name, px + 66, y + rh / 2 - 11); g.font = '500 13px "Be Vietnam Pro", sans-serif';
      c7Wrap(g, txt, pw - 84).slice(0, 2).forEach((l, j) => g.fillText(l, px + 66, y + rh / 2 + 8 + j * 16)); });
  }
  // the words, the button
  g.fillStyle = INK; g.textAlign = 'center'; g.font = '500 16px "Be Vietnam Pro", sans-serif';
  c7Wrap(g, P.text, Gm.colW - 10).forEach((l, k) => g.fillText(l, W / 2, py + ph + 30 + k * 24));
  const [gx, gy, gw, gh] = Gm.go; c7Wood(g, gx, gy, gw - 4, gh - 4, C7.page >= C7_PAGES.length - 1 ? 'Bắt đầu' : 'Tiếp');
  g.textBaseline = 'alphabetic';
}

function updateC7(dt) { if (C7.G && C7.page < 0) c7Tick(C7, dt); }
function renderC7() {
  const W = cv.width / DPR, H = cv.height / DPR;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.yellow.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) ctx.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  if (C7.page >= 0) c7DrawHow(ctx, W, H); else if (C7.G) c7Draw(C7, ctx, W, H);
}
function c7Pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function c7PDown(e) { if (S.mode !== 'c7play') return; const [x, y] = c7Pos(e); if (C7.page >= 0) { c7HowTap(x, y); return; } c7Down(C7, x, y); C7.drag = true; capturePointer(e); }
function c7PMove(e) { if (!C7.drag || C7.page >= 0) return; const [x, y] = c7Pos(e); c7Move(C7, x, y); }
function c7PUp(e) { if (!C7.drag) return; C7.drag = false; if (C7.page < 0) c7Up(C7); }
function c7Key(e) { if (e.code === 'Escape') { if (C7.page >= 0 && SAVE7.how) C7.page = -1; else showAlbum(7); } if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && C7.G) c7Undo(C7.G); }

registerChapter({
  id: 7, modes: ['c7play'],
  card: { num: 'Chương VII', han: '食', name: 'Ai Ăn Vụng?', desc: 'Mâm xôi, nồi chè, đĩa cá kho… bỗng biến mất. Nghe lời khai của cả làng, dựng lại cảnh và tìm ra kẻ ăn vụng.', bg: '#dccfe4' },
  progress: () => `${SAVE7.done.filter(Boolean).length}/${C7_CASES.length} vụ`,
  hasProgress: () => SAVE7.done.some(Boolean),
  album() { buildAlbum7(); $('#albumTitle').textContent = 'Chương VII · Ai Ăn Vụng?'; $('#albumDesc').textContent = 'Mỗi vụ là một món ăn bị ăn vụng. Phá xong vụ này mới mở vụ sau.'; },
  hide() {},
  update: updateC7, render: renderC7, key: c7Key,
  pointer: { down: c7PDown, move: c7PMove, up: c7PUp },
  next() { showAlbum(7); }, retry() { startC7(C7.i); },
});
