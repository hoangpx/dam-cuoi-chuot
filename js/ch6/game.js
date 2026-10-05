/* Chương VI · Tìm Chuột 鼠 — the chapter shell (it replaced the board-game chapter Cờ Đất; Kẻ Tam Giác is parked in
   js/parked/). Levels like chương II: an album of cards grouped by field size, each opened by finishing the one before;
   level 1 is the guided practice field, the rest come from levels.js (easiest first within each size, sizes 5×5 → 10×10).
   A level fills the screen in CSS pixels (ruong.js draws it); the back button or Esc returns to the album; after a level a
   tap: a win goes on to the next level, a loss tries the same field again. Saves: SAVE6 in localStorage 'dcc.c6'. */
let SAVE6 = { done: [], tut: false, dotted: false };
try { const s = JSON.parse(localStorage.getItem('dcc.c6') || 'null'); if (s && Array.isArray(s.done)) SAVE6 = Object.assign(SAVE6, s); } catch (e) {}
const persist6 = () => { try { localStorage.setItem('dcc.c6', JSON.stringify(SAVE6)); } catch (e) {} };
const C6_COUNT = () => 1 + C6_LEVELS.length;
const C6_WORD = ['', lg('Dễ', 'Easy'), lg('Vừa', 'Medium'), lg('Khó', 'Hard'), lg('Rất khó', 'Very hard')];
const C6 = { i: 0, G: null, geo: null, drag: false };

function buildAlbum6() {
  const box = $('#cards'); box.textContent = '';
  let size = -1;
  for (let i = 0; i < C6_COUNT(); i++) {
    const L = i ? C6_LEVELS[i - 1] : null, N = L ? L.N : 4;
    if (N !== size) { size = N; const h = document.createElement('div'); h.className = 'sec'; h.textContent = i ? `${lg('Ruộng', 'Field')} ${N} × ${N}` : lg('Tập chơi', 'Practice'); box.appendChild(h); }
    const open = i === 0 || SAVE6.done[i - 1] || SAVE6.done[i];
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = ['#e9dcc0', '#d9e6c9', '#e6d3c9', '#d3dbe6', '#e4d6ea', '#e9e2c4'][Math.max(0, N - 4) % 6]; b.disabled = !open;
    b.innerHTML = `<div class="num">${lg('Màn', 'Level')} ${i + 1}</div><div class="ch">${N}×${N}</div><b>${i ? C6_WORD[L.d] : lg('Tập chơi', 'Practice')}</b><span class="st${SAVE6.done[i] ? ' done' : ''}">${SAVE6.done[i] ? lg('Đã gọi đủ con', 'All home') : open ? lg('Chơi', 'Play') : lg('Chưa mở', 'Locked')}</span>`;
    b.addEventListener('click', () => { if (open) startC6(i); });
    box.appendChild(b);
  }
}
function startC6(i) {
  trackEnter(`chuong-6/man-${i + 1}`);
  AU.init(); AU.setSong(7); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 6; S.mode = 'c6play'; C6.i = i;
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  C6.G = mdNewGame(i); C6.oppSort = 9;
}
C6.close = () => showAlbum(6);
C6.after = r => { if (r === 'win') { if (C6.i + 1 < C6_COUNT()) startC6(C6.i + 1); else showAlbum(6); } else startC6(C6.i); };
C6.result = r => { if (r === 'win') trackWin(); if (r === 'win' && !SAVE6.done[C6.i]) { SAVE6.done[C6.i] = true; persist6(); } };

function updateC6(dt) { if (C6.G) mdTick(C6, dt); }
function renderC6() {
  const W = cv.width / DPR, H = cv.height / DPR;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.yellow.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) ctx.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  if (C6.G) { const st = safeTop(); ctx.translate(0, st); mdDraw(C6, ctx, W, H - st); }
}
function c6Pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top - safeTop()]; }
function c6Down(e) { if (S.mode !== 'c6play' || !C6.G) return; const [x, y] = c6Pos(e); mdDown(C6, x, y); C6.drag = true; capturePointer(e); }
function c6Move(e) { if (!C6.drag || !C6.G) return; const [x, y] = c6Pos(e); mdMove(C6, x, y); }
function c6Up(e) { if (!C6.drag) return; C6.drag = false; if (C6.G) mdUp(C6); }
function c6Key(e) { if (e.code === 'Escape') showAlbum(6); }

registerChapter({
  id: 6, modes: ['c6play'],
  card: { num: lg('Chương VI', 'Chapter VI'), han: '鼠', name: lg('Tìm Chuột', 'Find the Mice'), desc: lg('Chiều rồi, chuột mẹ ra đồng gọi lũ con mải chơi về. Mỗi hàng, mỗi cột, mỗi thửa ruộng có đúng một chú chuột con, không chú nào đứng sát chú nào. Càng lên càng khó.', 'Evening: mother mouse calls her playful children home from the fields. One little mouse in every row, every column and every plot, and no two side by side. It gets harder as you go.'), bg: '#c8d8dc' },
  progress: () => `${SAVE6.done.filter(Boolean).length}/${C6_COUNT()} ${lg('màn', 'levels')}`,
  hasProgress: () => SAVE6.done.some(Boolean),
  album() { buildAlbum6(); $('#albumTitle').textContent = lg('Chương VI · Tìm Chuột', 'Chapter VI · Find the Mice'); $('#albumDesc').textContent = lg('Lũ chuột con mải chơi trốn khắp ruộng. Giúp chuột mẹ tìm đủ từng đứa; xong ruộng này mới sang ruộng sau, ruộng càng rộng càng khó.', 'The little mice are hiding all over the fields. Help their mother find every one; finish a field to open the next, and the bigger the field the harder.'); },
  hide() {},
  update: updateC6, render: renderC6, key: c6Key,
  pointer: { down: c6Down, move: c6Move, up: c6Up },
  next() { showAlbum(6); }, retry() { startC6(C6.i); },
});
