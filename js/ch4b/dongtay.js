/* Chương IV · closing a sheet by hand (owner 2026-11-14: "bỏ chữ đóng ở sổ tay và quán đi, để dấu x hình tròn ở góc trên bên phải của sổ tay,
   ấn x hoặc vuốt xuống hoặc ấn ở ngoài thì tụt xuống giống khi vuốt xuống"). The notebook (village #c4note, town #hs) and the Quán list (village
   #c4ev while it holds the list, town #p4ups) lose their Đóng row; a round × sits at the card's top right (sticky, so it stays while the page
   scrolls). The ×, a tap on the dim backdrop, or a downward swipe started while the page is at its top, slide the card down and then press the
   sheet's own (hidden) Đóng button, so whatever it did before (clearing a pick, going back) still happens. A short swipe springs back. */
const C4X = {
  c4note: () => $('#c4noteX'),
  hs: () => $('#hsX'),
  p4ups: () => $('#p4upsX'),
  c4ev: () => $('#c4ev .card4').querySelector('.nvTabs') ? [...$('#c4evO').querySelectorAll('button')].find(b => /Đóng/.test(b.textContent)) : null
};
const c4XCan = id => { const f = C4X[id]; return !!(f && f()); };
function c4SlideClose(sheet) {
  const btn = C4X[sheet.id] && C4X[sheet.id](); if (!btn || sheet.dataset.closing) return;
  sheet.dataset.closing = '1';
  const card = sheet.querySelector('.card4');
  card.style.transition = 'transform .2s ease-in'; card.style.transform = 'translateY(100%)';
  sheet.style.transition = 'background-color .2s'; sheet.style.backgroundColor = 'rgba(0,0,0,0)';
  setTimeout(() => {
    AU.tap(); btn.click();
    card.style.transition = card.style.transform = ''; sheet.style.transition = sheet.style.backgroundColor = ''; delete sheet.dataset.closing;
  }, 200);
}
for (const id of Object.keys(C4X)) {
  const sheet = document.getElementById(id), card = sheet && sheet.querySelector('.card4'); if (!card) continue;
  sheet.classList.add('xs');
  const bar = document.createElement('div'); bar.className = 'xbar';
  bar.innerHTML = '<button type="button" class="xbtn" aria-label="Đóng" title="Đóng">×</button>';
  card.prepend(bar);
  bar.firstChild.addEventListener('click', e => { e.stopPropagation(); c4SlideClose(sheet); });
  // a tap on the backdrop (outside the card)
  sheet.addEventListener('click', e => { if (e.target === sheet && c4XCan(id)) { e.stopPropagation(); c4SlideClose(sheet); } });
  // a swipe down from the top of the page
  let y0 = null, dy = 0, t0 = 0, drag = false;
  card.addEventListener('touchstart', e => { if (!c4XCan(id) || e.touches.length !== 1 || e.target.closest('input,textarea,select')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; t0 = performance.now(); drag = false; }, { passive: true });
  card.addEventListener('touchmove', e => {
    if (y0 === null) return;
    const d = e.touches[0].clientY - y0;
    if (!drag) { if (d > 6 && card.scrollTop <= 0) drag = true; else if (d < -6 || card.scrollTop > 0) { y0 = null; return; } else return; }
    dy = Math.max(0, d); e.preventDefault();
    card.style.transition = 'none'; card.style.transform = `translateY(${dy}px)`;
  }, { passive: false });
  const end = () => {
    if (y0 === null) return; y0 = null; if (!drag) return; drag = false;
    const fast = dy / Math.max(1, performance.now() - t0) > .6;
    if (dy > 90 || (dy > 30 && fast)) c4SlideClose(sheet);
    else { card.style.transition = 'transform .18s ease-out'; card.style.transform = ''; setTimeout(() => { if (!sheet.dataset.closing) card.style.transition = ''; }, 200); }
  };
  card.addEventListener('touchend', end); card.addEventListener('touchcancel', end);
}
