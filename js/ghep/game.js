/* Chương IX · Ghép Tranh 拼圖 — jigsaw puzzles cut from the real Đông Hồ prints of chương III (owner's idea). This file is the
   shell: the album (three tiers of difficulty, five pictures each, each level opened by finishing the one before), loading the
   picture, the top bar (back, name, clock, a peek at the whole picture), the finished picture, saves SAVE9 in localStorage
   'dcc.c9'. The pieces and the pointer rules are in manh.js. */
let SAVE9 = { done: {}, best: {} };
try { const s = JSON.parse(localStorage.getItem('dcc.c9') || 'null'); if (s && typeof s.done === 'object') SAVE9 = Object.assign(SAVE9, s); } catch (e) {}
const persist9 = () => { try { localStorage.setItem('dcc.c9', JSON.stringify(SAVE9)); } catch (e) {} };

const C9_PICS = [
  { id: 'ga',   src: 'img/ch3/dan-ga-me-con.jpg', w: 1431, h: 933, vi: 'Đàn gà mẹ con', en: 'Hen and chicks' },
  { id: 'dua',  src: 'img/ch3/hung-dua.png',      w: 456,  h: 602, vi: 'Hứng dừa',      en: 'Catching coconuts' },
  { id: 'trau', src: 'img/ch3/chan-trau.png',     w: 347,  h: 487, vi: 'Chăn trâu',     en: 'Herding the buffalo' },
  { id: 'dieu', src: 'img/ch3/tha-dieu.jpg',      w: 648,  h: 926, vi: 'Thả diều',      en: 'Flying the kite' },
  { id: 'du',   src: 'img/ch3/danh-du.jpg',       w: 529,  h: 378, vi: 'Đánh đu',       en: 'On the swing' },
];
// three tiers: about 12 pieces all upright, about 24 pieces turned at random, about 40 pieces turned at random
const C9_TIERS = [{ n: 12, rot: false, vi: 'Dễ', en: 'Easy' }, { n: 24, rot: true, vi: 'Vừa', en: 'Medium' }, { n: 40, rot: true, vi: 'Khó', en: 'Hard' }];
function c9Grid(w, h, n) {   // columns × rows near n pieces with cells close to square
  let best = null;
  for (let c = 2; c <= 14; c++) for (let r = 2; r <= 14; r++) { const sc = Math.abs(c * r - n) / n + Math.abs(Math.log((w / c) / (h / r))) * 1.2; if (!best || sc < best.sc) best = { c, r, sc }; }
  return best;
}
const C9_LEVELS = [];
C9_TIERS.forEach((t, ti) => C9_PICS.forEach(p => { const g = c9Grid(p.w, p.h, t.n); C9_LEVELS.push({ pic: p, tier: ti, cols: g.c, rows: g.r, rot: t.rot }); }));

const C9 = { i: 0, G: null, imgs: {}, loading: false, ptr: null, st: 0, conf: [] };
function c9Img(pic, cb) {
  let im = C9.imgs[pic.id];
  if (im && im.complete && im.naturalWidth) { cb(im); return; }
  if (!im) { im = new Image(); im.src = pic.src; C9.imgs[pic.id] = im; }
  im.addEventListener('load', () => cb(im), { once: true });
}
const c9Time = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function buildAlbum9() {
  const box = $('#cards'); box.textContent = '';
  let tier = -1;
  C9_LEVELS.forEach((L, i) => {
    if (L.tier !== tier) { tier = L.tier; const h = document.createElement('div'); h.className = 'sec'; h.textContent = `${lg(C9_TIERS[tier].vi, C9_TIERS[tier].en)} · ${lg('khoảng', 'about')} ${C9_TIERS[tier].n} ${lg('mảnh', 'pieces')}`; box.appendChild(h); }
    const open = i === 0 || SAVE9.done[i - 1] || SAVE9.done[i];
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = ['#ecdcbf', '#d9e6c9', '#e6d3c9'][L.tier]; b.disabled = !open;
    b.innerHTML = `<div class="num">${lg('Màn', 'Level')} ${i + 1}</div><div style="width:100%;height:78px;margin:4px 0;background:#f2ecde url('${L.pic.src}') center/cover;border:2px solid #1d1915;border-radius:6px;${open ? '' : 'filter:grayscale(1) brightness(.8);'}"></div><b>${lg(L.pic.vi, L.pic.en)}</b><span class="st${SAVE9.done[i] ? ' done' : ''}">${SAVE9.done[i] ? `${lg('Xong', 'Done')} · ${c9Time(SAVE9.best[i] || 0)}` : `${L.cols}×${L.rows} ${lg('mảnh', 'pieces')}`}</span>`;
    b.addEventListener('click', () => { if (open) startC9(i); });
    box.appendChild(b);
  });
}
function startC9(i) {
  trackEnter(`chuong-9/man-${i + 1}`);
  AU.init(); AU.setSong(5); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 9; S.mode = 'c9play'; C9.i = i; C9.G = null; C9.loading = true; C9.conf = [];
  PAPER = getPaper('yellow'); document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  c9Img(C9_LEVELS[i].pic, im => { if (C9.i !== i || S.mode !== 'c9play') return; const W = cv.width / DPR, H = cv.height / DPR - C9.st; C9.G = c9MakeGame(C9_LEVELS[i], im, W, H, i + 1 + Math.floor(Math.random() * 1e6)); C9.loading = false; });
}
function c9Done() {
  const i = C9.i, G = C9.G; trackWin();
  SAVE9.done[i] = true; if (!SAVE9.best[i] || G.t < SAVE9.best[i]) SAVE9.best[i] = Math.round(G.t); persist9();
  AU.plop();
  for (let k = 0; k < 70; k++) C9.conf.push({ x: Math.random() * G.lw, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 60, vy: 60 + Math.random() * 120, c: ['#a3332a', '#f2c640', '#2f6a4c', '#3f8a86', '#7b4aa8'][k % 5], r: 3 + Math.random() * 4, ph: Math.random() * 6 });
}

function updateC9(dt) { C9.st = safeTop(); if (C9.G) { c9Tick(C9.G, dt); for (const p of C9.conf) { p.x += (p.vx + Math.sin(S.t * 3 + p.ph) * 24) * dt; p.y += p.vy * dt; } C9.conf = C9.conf.filter(p => p.y < (C9.G ? C9.G.lh : 800) + 30); } }
function c9Btn(g, x, y, w, h, label, fill, ink) { g.beginPath(); g.roundRect(x, y, w, h, 12); g.fillStyle = fill; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1d1915'; g.stroke(); g.fillStyle = ink || '#f2ecde'; g.font = `800 ${Math.min(20, h * .42)}px 'Playfair Display', Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x + w / 2, y + h / 2 + 1); }
function c9WinBox(G) { const w = Math.min(340, G.lw - 28), x = (G.lw - w) / 2, h = 150, y = G.lh - h - 10; return { x, y, w, h, bw: (w - 36) / 2, by: y + h - 54 }; }

function renderC9() {
  const W = cv.width / DPR, H = cv.height / DPR, st = C9.st = safeTop(), g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPERS.yellow.base; g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) g.drawImage(PAPER, px, 0, PAPER.width, Math.max(H, PAPER.height));
  g.save(); g.translate(0, st);
  const L = C9_LEVELS[C9.i], hh = H - st;
  // the top bar
  g.fillStyle = '#1d1915'; g.font = "800 34px 'Playfair Display', Georgia, serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('‹', 28, 28);
  g.font = "800 17px 'Playfair Display', Georgia, serif"; g.fillText(lg(L.pic.vi, L.pic.en), W / 2, 20);
  g.font = "600 12px 'Inter', system-ui, sans-serif"; g.globalAlpha = .75; g.fillText(`${lg('Màn', 'Level')} ${C9.i + 1} · ${L.cols * L.rows} ${lg('mảnh', 'pieces')}${C9.touch ? lg(' · chạm nhấc · vuốt lên xuống để xoay', ' · tap to lift · flick up or down to turn') : lg(' · click nhấc · cuộn chuột để xoay', ' · click to lift · wheel to turn')}`, W / 2, 40); g.globalAlpha = 1;
  if (C9.G) {
    const G = C9.G; g.font = "700 15px 'Inter', system-ui, sans-serif"; g.textAlign = 'right'; g.fillText(c9Time(G.t), W - 56, 28);
    g.beginPath(); g.arc(W - 28, 28, 16, 0, 6.283); g.fillStyle = G.peek > 0 ? '#f6e3a0' : '#f2ecde'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#1d1915'; g.stroke();   // the eye: a peek at the whole picture
    g.beginPath(); g.ellipse(W - 28, 28, 9, 5.5, 0, 0, 6.283); g.stroke(); g.beginPath(); g.arc(W - 28, 28, 2.6, 0, 6.283); g.fillStyle = '#1d1915'; g.fill();
    c9Draw(G, g, W, hh);
    c9DrawTurnBtn(G, g);
    if (G.done) {
      const b = c9WinBox(G), a = Math.min(1, G.win * 2);
      g.globalAlpha = a; g.fillStyle = '#f2ecde'; g.strokeStyle = '#1d1915'; g.lineWidth = 3; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 16); g.fill(); g.stroke();
      g.fillStyle = '#a3332a'; g.font = "800 24px 'Playfair Display', Georgia, serif"; g.textAlign = 'center'; g.fillText(lg('Xong rồi!', 'Done!'), W / 2, b.y + 28);
      g.fillStyle = '#1d1915'; g.font = "600 14px 'Inter', system-ui, sans-serif"; g.fillText(`${lg(L.pic.vi, L.pic.en)} · ${c9Time(G.t)}${SAVE9.best[C9.i] === Math.round(G.t) ? lg(' · kỷ lục', ' · best') : ''}`, W / 2, b.y + 56);
      c9Btn(g, b.x + 12, b.by, b.bw, 40, lg('Về album', 'Album'), '#e6dec9', '#1d1915');
      c9Btn(g, b.x + 24 + b.bw, b.by, b.bw, 40, C9.i + 1 < C9_LEVELS.length ? lg('Tranh tiếp', 'Next') : lg('Xong hết', 'All done'), '#2f6a4c');
      g.globalAlpha = 1;
      for (const p of C9.conf) { g.fillStyle = p.c; g.fillRect(p.x, p.y, p.r, p.r * 1.6); }
    }
  } else { g.fillStyle = '#1d1915'; g.font = "700 18px 'Playfair Display', Georgia, serif"; g.textAlign = 'center'; g.fillText(lg('Đang mở tranh…', 'Opening the print…'), W / 2, hh / 2); }
  g.restore();
}
function c9Pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top - C9.st]; }
function c9PDown(e) {
  if (S.mode !== 'c9play') return; C9.touch = e.pointerType !== 'mouse'; const [x, y] = c9Pos(e), G = C9.G;
  if (x < 56 && y < 56) { showAlbum(9); return; }
  if (!G) return;
  if (x > G.lw - 52 && y < 52 && !G.done) { G.peek = G.peek > 0 ? 0 : 4; return; }
  if (G.done) { const b = c9WinBox(G); if (y >= b.by && y <= b.by + 40) { if (x < b.x + 12 + b.bw + 6) showAlbum(9); else if (C9.i + 1 < C9_LEVELS.length) startC9(C9.i + 1); else showAlbum(9); } return; }
  capturePointer(e); C9.ptr = e.pointerId; c9Down(G, x, y, e, c9Done);
}
function c9PMove(e) { if (S.mode !== 'c9play' || !C9.G) return; const [x, y] = c9Pos(e); c9Move(C9.G, x, y, e); cv.style.cursor = C9.G.held ? 'grabbing' : C9.G.hover ? 'grab' : ''; }
function c9PUp(e) { if (S.mode !== 'c9play' || !C9.G || C9.ptr !== e.pointerId) return; C9.ptr = null; const [x, y] = c9Pos(e); c9PtrUp(C9.G, x, y, e, c9Done); }
cv.addEventListener('contextmenu', e => { if (S.mode === 'c9play') e.preventDefault(); });
cv.addEventListener('wheel', e => {
  if (S.mode !== 'c9play' || !C9.G || C9.G.done) return;
  const G = C9.G, [x, y] = c9Pos(e), d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  if (!G.held) { const h = c9Hit(G, x, y); G.hover = h ? h.grp : null; }
  if (c9Wheel(G, d, x, y)) e.preventDefault();
}, { passive: false });
function c9Key(e) {
  if (S.mode !== 'c9play') return;
  if (e.code === 'Escape') { showAlbum(9); return; }
  const G = C9.G; if (!G || G.done) return; const grp = G.held || G.hover; if (!grp) return;
  if (e.code === 'KeyR' || e.code === 'ArrowDown' || e.code === 'ArrowUp') { e.preventDefault(); const c = c9Centroid(G, grp); c9Turn(G, grp, (e.shiftKey || e.code === 'ArrowUp' ? -1 : 1) * C9_STEP, G.px === undefined ? c[0] : G.px, G.py === undefined ? c[1] : G.py); }
}

registerChapter({
  id: 9, modes: ['c9play'],
  card: { num: lg('Chương IX', 'Chapter IX'), han: '拼圖', name: lg('Ghép Tranh', 'Print Puzzles'), desc: lg('Ghép lại những bức tranh Đông Hồ thật, từng mảnh một. Mảnh nằm lẫn lộn, xoay đủ mọi góc, ghép ở đâu cũng được. Chạm để nhấc mảnh, cuộn chuột hoặc vuốt lên xuống để xoay.', 'Put the real Đông Hồ prints back together, piece by piece. The pieces lie any way up and you can join them anywhere. Tap to lift one; wheel or flick up and down to turn it.'), bg: '#e8d9c0' },
  progress: () => `${Object.values(SAVE9.done).filter(Boolean).length}/${C9_LEVELS.length} ${lg('tranh', 'prints')}`,
  hasProgress: () => Object.values(SAVE9.done).some(Boolean),
  album() { buildAlbum9(); $('#albumTitle').textContent = lg('Chương IX · Ghép Tranh', 'Chapter IX · Print Puzzles'); $('#albumDesc').textContent = lg('Những bức tranh Đông Hồ bị xáo thành từng mảnh nằm lẫn lộn mọi góc. Chạm vào mảnh để nhấc lên, cuộn chuột (hoặc vuốt lên xuống) để xoay, ghép hai mảnh sát nhau đúng góc là chúng dính lại; ghép ở chỗ nào cũng được và cả mảng tranh dời, xoay được như một mảnh. Nút con mắt cho xem tranh mẫu.', 'The Đông Hồ prints lie broken in pieces, every which way up. Lift a piece, turn it with the wheel (or by flicking up and down) and bring two neighbours together at the right angle: they stick. Join them anywhere; a joined part moves and turns like one piece. The eye shows the sample.'); },
  hide() { cv.style.cursor = ''; },
  update: updateC9, render: renderC9, key: c9Key,
  pointer: { down: c9PDown, move: c9PMove, up: c9PUp },
  next() { showAlbum(9); }, retry() { startC9(C9.i); },
});
