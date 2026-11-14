/* Chương IV · closing a sheet by hand (owner 2026-11-14: "bỏ chữ đóng ở sổ tay và quán đi, để dấu x hình tròn ở góc trên bên phải của sổ tay,
   ấn x hoặc vuốt xuống hoặc ấn ở ngoài thì tụt xuống giống khi vuốt xuống"). The notebook (village #c4note, town #hs) and the Quán list (village
   #c4ev while it holds the list, town #p4ups) lose their Đóng row; a round × sits at the card's top right (sticky, so it stays while the page
   scrolls). The ×, a tap on the dim backdrop, or a downward swipe started while the page is at its top, slide the card down and then press the
   sheet's own (hidden) Đóng button, so whatever it did before (clearing a pick, going back) still happens. A short swipe springs back. */
const C4X = {
  c4note: () => $('#c4noteX'),
  hs: () => $('#hsX'),
  p4ups: () => $('#p4upsX'),
  c4ev: () => $('#c4ev .card4').querySelector('.nvTabs') ? [...$('#c4evO').querySelectorAll('button')].find(b => /Đóng/.test(b.textContent)) : null,
  // a worker's sheet (owner 2026-11-14: "ấn vào detail của một nhân viên xong đóng lại thì nó lại quay lại cái phần trước chứ nó không đóng"): the ×,
  // a swipe or a tap outside close it for good; going back to the list or the stall is the sheet's own buttons (‹ Danh sách nhân viên, Quay lại)
  // a stall's and a shop's own sheet (owner 2026-11-14: "sao chữ nâng cấp và đóng nó lơ lửng ở giữa thế này? bỏ chữ đóng đi, cho chữ nâng cấp
  // dính vào bảng và để lên đầu"): no Đóng either; the village stall's upgrade button is moved up under the title (below)
  c4up: () => $('#c4upX'),
  p4shop: () => $('#p4shopB [data-shopx]'),
  p4home: () => $('#p4homeX'),
  c4wk: () => typeof C4WK !== 'undefined' && C4WK.id ? { click: () => { C4WK.id = null; if (typeof C4NV !== 'undefined') C4NV.id = null; $('#c4wk').hidden = true; (S.mode === 'c4bplay' ? p4Sheets : c4Sheets)(null); } } : null
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
  // (owner 2026-11-14: "pull xuống xong nó lại hiện lên xong nó lại ẩn đi"): the phone started its own scroll / rubber band on the first few
  // pixels (they were not held back), pulled the page down with my drag and sprang it back on release before the card slid away. Now, with the
  // page at its top, every downward move is mine from the first pixel (preventDefault), the card cannot rubber-band (css overscroll none), and
  // the click the phone may send after the lift is swallowed.
  card.addEventListener('touchmove', e => {
    if (y0 === null) return;
    const d = e.touches[0].clientY - y0;
    if (!drag) {
      if (card.scrollTop > 0 || d < 0) { y0 = null; return; }   // scrolling the page: the phone's own
      if (e.cancelable) e.preventDefault(); else { y0 = null; return; }
      if (d <= 6) return;
      drag = true;
    }
    if (!e.cancelable) { y0 = null; drag = false; card.style.transition = 'transform .18s ease-out'; card.style.transform = ''; return; }
    e.preventDefault(); dy = Math.max(0, d);
    card.style.transition = 'none'; card.style.transform = `translateY(${dy}px)`;
  }, { passive: false });
  const end = () => {
    if (y0 === null) return; y0 = null; if (!drag) return; drag = false;
    const eat = ev => { if (!ev.isTrusted) return; ev.stopPropagation(); ev.preventDefault(); };   // the tap the phone may make of the lift
    addEventListener('click', eat, true); setTimeout(() => removeEventListener('click', eat, true), 450);
    const fast = dy / Math.max(1, performance.now() - t0) > .6;
    if (dy > 90 || (dy > 30 && fast)) c4SlideClose(sheet);
    else { card.style.transition = 'transform .18s ease-out'; card.style.transform = ''; setTimeout(() => { if (!sheet.dataset.closing) card.style.transition = ''; }, 200); }
  };
  card.addEventListener('touchend', end); card.addEventListener('touchcancel', end);
}
// the stall sheet's upgrade button: out of the bottom row (which floated mid-sheet on an iPhone) and up under the title
{ const go = $('#c4upGo'), t = $('#c4upT'); if (go && t) { const top = document.createElement('div'); top.className = 'upTop'; top.appendChild(go); t.after(top); } }
