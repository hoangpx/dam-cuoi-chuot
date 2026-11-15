/* Chương IV · one notebook and one Quán for the village and the town (owner 2026-11-14: "Sổ tay và quán phải giống y hệt nhau ở phố huyện và
   chợ nhé. Hai cái là một.").
   QUÁN: the village's sheet (c4OpenUps, #c4ev) and the town's (p4OpenUps, #p4ups) both show the same list, built here by c4QuanFill: a band
   "Chợ quê" with every village stall (as the village list was) and a band "Phố Huyện" with the betel house and every shop (as the town list was),
   then the Nhân viên tab (nhanvien.js). A stall of the place I am in opens its sheet as before; one of the other place takes me there first and
   opens it on arrival.
   SỔ TAY: the town's notebook button opens the village's notebook (c4OpenNotes, #c4note: all its tabs) instead of the town's three-tab one (#hs);
   its Khách quen tab gains the town's buyers under a heading of their own. #c4note is shown in the town through p4Sheets (like #c4wk). */

// ---------- Quán ----------
function c4QuanVillageCards() {
  const all = ['trau', ...C4_SHOPS, ...C4_BUYS.filter(c4Own)];
  return all.map(g => {
    const G = C4_GOODS[g], own = c4Own(g), lvI = g === 'trau' ? SAVE4.lv : c4SLvI(g), lvN = g === 'trau' ? C4_LV.length : G.buy ? C4_BUY_TOP + 1 : C4_SHOP_LV.length;
    const name = g === 'trau' ? c4Lv().name : own ? c4SLv(g).name : 'Đất trống', L = !own && c4Landlord(g);
    return `<button class="upc ${own ? '' : 'empty'}" data-up="${g}"><b>${G.name}</b><span class="lv">${name}</span>`
      + (own ? `<i class="bar"><i style="width:${(lvI + 1) / lvN * 100}%"></i></i>${c4Shut(g) ? '<span><span class="bad">Đã đóng cửa</span></span>' : `<span>còn ${c4Stock(g)}/${c4Cap(g)} ${G.unit}</span>`}` : `<span>thuê ${c4Money(L.price)}</span>`) + '</button>';
  }).join('');
}
function c4QuanTownCards() {
  const S = p4Shops(), keys = Object.keys(S).sort((a, b) => a - b), day = (typeof P4 !== 'undefined' && P4.shopDay) || {};
  return [`<button class="upc" data-k="home"><b>${p4Esc(SAVE4B.name || 'TRẦU CAU')}</b><span class="lv">Hiệu trầu</span><span>${SAVE4B.shut ? '<span class="bad">Đã đóng cửa</span>' : 'còn ' + SAVE4B.stock + ' miếng trầu'}</span></button>`,
    ...keys.map(k => { const R = S[k], T = day[k] || { n: 0 }; return `<button class="upc" data-k="${k}"><b>${p4Esc(R.name)}</b><span class="lv">${R.own === 'buy' ? 'Quán của mình' : 'Quán thuê'}</span><span>${R.shut ? '<span class="bad">Đã đóng cửa</span>' : 'hôm nay ' + T.n + ' bát/đĩa'}</span></button>`; })].join('')
    + (keys.length ? '' : '<p class="sm">Chưa thuê quán ăn nào: chạm vào một quán ăn trên phố để thuê.</p>');
}
function c4QuanFill(box) {
  if (!box) return;
  const town = typeof SAVE4B !== 'undefined' && SAVE4B.house;
  box.innerHTML = `<h4 class="nvPlace lang">Chợ quê</h4><div class="ups">${c4QuanVillageCards()}</div>`
    + (town ? `<h4 class="nvPlace pho">Phố Huyện</h4><div class="ups">${c4QuanTownCards()}</div>` : '');
}
// a tap on a card: same place → its sheet; the other place → go there, then its sheet
addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#c4evB .nvShops [data-up],#p4upsB .nvShops [data-up],#c4evB .nvShops [data-k]'); if (!b) return;
  e.stopPropagation(); AU.tap(); c4NvSwap();
  if (b.dataset.up) {
    const g = b.dataset.up;
    if (S.mode === 'c4bplay') { p4Sheets(null); p4Hide(); startC4(); setTimeout(() => { if (S.mode === 'c4play' && !C4.sheet) { C4.upListNext = true; c4OpenUp(g); } }, 60); }
    else { C4.upListNext = true; c4OpenUp(g); }
    return;
  }
  const k = b.dataset.k;   // a town card seen from the village
  c4Sheets(null); p4Enter();
  setTimeout(() => {
    if (S.mode !== 'c4bplay') return;
    if (k === 'home') { P4.fromList = true; p4HomeOpen(); return; }
    const R = p4Shops()[k]; if (!R) return; P4.shopSel = { key: k, name: R.name }; P4.fromList = true; p4ShopSheet();
  }, 60);
}, true);

// ---------- Sổ tay ----------
// #c4note shown in the town like the worker sheet: the town's sheet system knows it, and the village's calls about it are passed on while in the town
{ const sh0 = p4Sheets; p4Sheets = function (id) { const el = $('#c4note'); if (el) el.hidden = id !== 'c4note'; const r = sh0(id === 'c4note' ? null : id); if (id === 'c4note') { P4.sheet = id; P4.paused = true; P4.sheetT = performance.now(); } return r; }; }
{ const sh0 = c4Sheets; c4Sheets = function (id) { if (S.mode === 'c4bplay' && (id === 'c4note' || (id == null && P4.sheet === 'c4note'))) return p4Sheets(id); return sh0.apply(this, arguments); }; }
// the town's notebook button: the one notebook
{ const b = $('#p4Note'); if (b) { const nb = b.cloneNode(true); b.replaceWith(nb); nb.addEventListener('click', () => { if (!SAVE4B.house) return; AU.tap(); C4_PICK = null; c4OpenNotes(); }); } }
// Khách quen: the town's buyers too
function c4TownFolkHtml() {
  if (typeof SAVE4B === 'undefined' || !SAVE4B.house || !SAVE4B.folk) return '';
  const F = id => SAVE4B.folk[id], seen = p4People().filter(p => p4Seen(p.id)), known = seen.filter(p => p4Known(p.id)).sort((a, b) => (F(b.id).a || 0) - (F(a.id).a || 0)), face = seen.filter(p => !p4Known(p.id));
  return `<h4 class="nvPlace pho">Phố Huyện <small>${seen.length} khách</small></h4>`
    + (seen.length ? `<div class="folk">${known.map(p => `<div class="fk"><img src="${p4Face(p)}" alt=""><b>${p.name}</b>${c4Bar(F(p.id).a || 0)}<span>ghé ${F(p.id).v || 0} lần</span></div>`).join('')}${face.map(p => `<div class="fk unk2"><img src="${p4Face(p)}" alt=""><b>${p.name}</b><span>ghé ${F(p.id).v || 1} lần</span></div>`).join('')}</div>` : '<p>Chưa có khách nào trên phố.</p>');
}
{ const o0 = c4OpenNotes; c4OpenNotes = function () {
    const r = o0.apply(this, arguments);
    if (C4_TAB === 'quen' && !C4_PICK && C4_WHO === null) {
      const B = $('#c4noteB'), folk = B.querySelector(':scope > .folk'), empty = !folk && [...B.querySelectorAll(':scope > p')].find(p => /Chưa có khách/.test(p.textContent));
      const head = document.createElement('h4'); head.className = 'nvPlace lang'; head.textContent = 'Chợ quê';
      const at = folk || empty; if (at) at.before(head);
      const town = c4TownFolkHtml(); if (town && at) at.insertAdjacentHTML('afterend', town);
      // the count at the top: both places (the village's own count stands under its band)
      const cnt = B.querySelector(':scope > .cnt'), vill = folk ? folk.children.length : 0, tn = town ? p4People().filter(p => p4Seen(p.id)).length : 0;
      if (cnt) cnt.textContent = `${vill + tn} khách`;
      head.innerHTML = `Chợ quê <small>${vill} khách</small>`;
    }
    return r;
  }; }
