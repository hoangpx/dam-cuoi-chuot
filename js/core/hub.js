/* Title → chapter picker → album, the end-screen buttons, and input that is routed to the active chapter. */

function showChapters() {
  S.mode = 'chapters'; hideChapterHuds();
  $('#title').hidden = true; $('#end').hidden = true; $('#album').hidden = true; $('#chapters').hidden = false;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  AU.setQuiet(true);
  const box = $('#chapCards'); box.textContent = '';
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const cards = CHAPTERS.map(c => ({ ...c.card, ch: c.id, prog: c.progress() }));
  // the next chapter is always shown as coming soon
  cards.push({ ch: 0, num: 'Chương ' + ROMAN[CHAPTERS.length], han: '？', name: 'Sắp có', desc: 'Một lối chơi hoàn toàn khác đang được khắc ván.', prog: 'Chưa mở', bg: '#cfcbd0', locked: true });
  cards.forEach(c => {
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = c.bg; b.disabled = !!c.locked;
    b.innerHTML = `<div class="num">${c.num}</div><div class="ch">${c.han}</div><b>${c.name}</b><p class="cd">${c.desc}</p><span class="st">${c.prog}</span>`;
    b.addEventListener('click', () => { if (!c.locked) showAlbum(c.ch); });
    box.appendChild(b);
  });
  setTimeout(() => { const f = $('#chapCards .card:not([disabled])'); f && f.focus(); }, 30);
}
function showAlbum(id) {
  const c = chapterById(id) || coverChapter();
  S.chapter = c.id; S.mode = 'album'; hideChapterHuds();
  c.album();
  $('#title').hidden = true; $('#end').hidden = true; $('#chapters').hidden = true; $('#album').hidden = false;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  AU.setQuiet(true);
  setTimeout(() => { const f = $('#cards .card:not([disabled])'); f && f.focus(); }, 30);
}
$('#bChap').addEventListener('click', showChapters);
$('#bStart').addEventListener('click', () => { AU.init(); showChapters(); });
$('#bNext').addEventListener('click', () => chapterById(S.chapter).next());
$('#bAlbum').addEventListener('click', () => showAlbum(S.chapter));
$('#bRetry').addEventListener('click', () => chapterById(S.chapter).retry());
$('#howTx').textContent = isTouch ? 'Giữ ◀ ▶ để đi · chạm vào tranh, giữ ngón tay để kéo' : '← → để đi · bấm chuột để chạm, giữ chuột để kéo';

/* ---------- input routing ---------- */
for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) addEventListener(ev, () => AU.init(), true);   // any of these may unlock audio (iOS wants touchend)
addEventListener('keydown', e => {
  if (S.mode === 'title' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); AU.init(); showChapters(); return; }
  const c = activeChapter(); if (c.key) c.key(e);
});
for (const [ev, k] of [['pointerdown', 'down'], ['pointermove', 'move'], ['pointerup', 'up']])
  cv.addEventListener(ev, e => { const p = activeChapter().pointer; if (p && p[k]) p[k](e); });

{
  let lastTouch = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouch < 350) { e.preventDefault(); const b = e.target.closest && e.target.closest('button'); if (b && !b.disabled) b.click(); }
    lastTouch = now;
  }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
}
