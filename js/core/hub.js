/* Title → chapter picker → album, the end-screen buttons, and input that is routed to the active chapter. */

function showChapters() {
  trackLeave(); S.mode = 'chapters'; hideChapterHuds();
  $('#title').hidden = true; $('#end').hidden = true; $('#album').hidden = true; $('#chapters').hidden = false;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  document.documentElement.style.setProperty('--paper', PAPERS.yellow.css);
  AU.setQuiet(true);
  const box = $('#chapCards'); box.textContent = '';
  // a chapter can be held back (locked()), e.g. still being made: shown greyed and closed
  const cards = CHAPTERS.filter(c => !(c.hidden && c.hidden())).map(c => { const lk = !!(c.locked && c.locked()); return { ...c.card, ch: c.id, prog: lk ? (c.lockText || lg('Sắp mở', 'Coming soon')) : c.progress(), locked: lk }; });   // hidden(): not shown at all yet
  cards.forEach(c => {
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = c.bg; b.disabled = !!c.locked;
    b.innerHTML = `<div class="num">${c.num}</div><div class="ch">${c.han}</div><b>${c.name}</b><p class="cd">${c.desc}</p><span class="st">${c.prog}</span>`;
    b.addEventListener('click', () => { if (c.locked) return; if (IS_EN && !LANG_READY.has(c.ch)) toast(tr('This chapter is still in Vietnamese. A translation is coming soon!'), 3.6); const ch = chapterById(c.ch); if (ch.direct) { trackSend('mo/chuong-' + c.ch); ch.direct(); } else showAlbum(c.ch); });   // direct(): a chapter with no album starts straight away
    box.appendChild(b);
  });
  setTimeout(() => { const f = $('#chapCards .card:not([disabled])'); f && f.focus(); }, 30);
  setTimeout(() => { if (S.mode === 'chapters' && typeof instPeek === 'function') instPeek(); }, 1500);   // the mouse asks about the home screen
}
function showAlbum(id) {
  const c = chapterById(id) || coverChapter();
  trackLeave(); if (S.mode === 'chapters') trackSend('mo/chuong-' + c.id);   // picked from the chapter list
  S.chapter = c.id; S.mode = 'album'; hideChapterHuds();
  c.album();
  $('#title').hidden = true; $('#end').hidden = true; $('#chapters').hidden = true; $('#album').hidden = false;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  AU.setQuiet(true);
  setTimeout(() => { const f = $('#cards .card:not([disabled])'); f && f.focus(); }, 30);
  setTimeout(() => { if (S.mode === 'album' && typeof instPeek === 'function') instPeek(); }, 1500);
}
$('#bChap').addEventListener('click', showChapters);
$('#bChapTop').addEventListener('click', showChapters);
$('#bStart').addEventListener('click', () => { AU.init(); showChapters(); });
$('#bNext').addEventListener('click', () => chapterById(S.chapter).next());
$('#bAlbum').addEventListener('click', () => showAlbum(S.chapter));
$('#bRetry').addEventListener('click', () => chapterById(S.chapter).retry());
$('#howTx').textContent = isTouch ? lg('Giữ ◀ ▶ để đi · chạm vào tranh, giữ ngón tay để kéo', 'Hold ◀ ▶ to walk · tap the picture, hold to drag') : lg('← → để đi · bấm chuột để chạm, giữ chuột để kéo', '← → to walk · click to touch, hold to drag');

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
