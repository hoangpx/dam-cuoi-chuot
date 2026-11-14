/* Chương IV · the "Quán" button (owner 2026-11-14: "trong chỗ nâng cấp mũi tên màu xanh đổi thành quán, đổi cả icon đi, khi ấn vào thì hiện ra
   2 tab: 1 là các hàng giống như hiện tại, tab 2 là nhân viên: liệt kê tất cả các nhân viên, trong list thì ghi tên quán, ở chợ quê hay phố huyện,
   tên nhân viên, các chỉ số của nhân viên đó, khi ấn vào thì ra chi tiết nhân viên giống như trong quán"). Village and town alike: the bottom
   button reads "Quán" with a stall icon; its sheet (c4OpenUps / p4OpenUps) gets two tabs, "Các hàng" (the old list) and "Nhân viên": every hired
   worker of both places (village hands, town keepers, helpers, the betel house's hands) with place, shop, pay, mood and the four bars; a tap
   opens the worker sheet of nguoilam-ct.js (c4WkOpen), whose Quay lại comes back to this list. */
const C4NV = { tab: 'hang', keep: false, id: null };
// going between the list and a worker: no slide-up of the sheet. The card's animation is switched off inline and switched back on only once
// that sheet is hidden again (taking a class off later would restart the animation on the open sheet: the jump the owner saw on going back)
const C4NV_SHEETS = ['c4ev', 'p4ups', 'c4wk', 'c4up', 'p4shop', 'p4home'];
function c4NvSwap() { for (const id of C4NV_SHEETS) { const c = document.querySelector('#' + id + ' .card4'); if (c) c.style.animation = 'none'; } }
{ const mo = new MutationObserver(ms => { for (const m of ms) if (m.target.hidden) { const c = m.target.querySelector('.card4'); if (c) c.style.animation = ''; } });
  setTimeout(() => { for (const id of C4NV_SHEETS) { const el = document.getElementById(id); if (el) mo.observe(el, { attributes: true, attributeFilter: ['hidden'] }); } }, 0); }
// every worker as [place, id, shop, role], in the order shown: the village's stalls, then the town's betel house and shops
function c4NvIds() {
  const out = [];
  for (const g of c4Owned()) c4Hands(g).forEach((h, i) => out.push(['lang', `v|${g}|${i}`, 'Hàng ' + C4_GOODS[g].name.toLowerCase(), 'người bán']));
  if (typeof p4Shops === 'function' && SAVE4B && SAVE4B.house) {
    const home = SAVE4B.name ? p4Cap1(String(SAVE4B.name).toLowerCase()) : 'Hiệu trầu';
    p4Hands().forEach((h, i) => out.push(['pho', `t|${i}`, home, 'người bán trầu']));
    const S = p4Shops();
    for (const k of Object.keys(S).sort((a, b) => a - b)) {
      const R = S[k], nm = p4Cap1(String(R.name || '').toLowerCase());
      out.push(['pho', `k|${k}`, nm, 'đứng quán']);
      p4ShopHands(R).forEach((h, i) => out.push(['pho', `p|${k}|${i}`, nm, 'phụ quán']));
    }
  }
  return out;
}
function c4NvCard([place, id, shop, role]) {
  const W = c4WkWho(id); if (!W) return '';
  const b = c4WkBadges(W), bar = (l, v) => c4TraitBar(l, v === undefined ? .5 : v);
  return `<button class="nvCard" data-nv="${id}"><img src="${c4WkFace(W)}" alt=""><span class="nvT"><b>${c4Esc4(c4Cap1(W.name))} <i>${role}</i></b>`
    + `<small>công ${c4Money(W.wage)}/ngày · ${c4GwWord(c4Gw(W.q))}</small>${b.length ? `<small class="bad">${b.join(' · ')}</small>` : ''}</span>`
    + `<span class="tbars">${bar('Nhanh nhẹn', W.tr.sp)}${bar('Nhiệt tình', W.tr.wm)}${bar('Trung thực', W.tr.ho)}${bar('Quan hệ', c4WkRel(W) / 100)}</span></button>`;
}
function c4NvHtml() {
  const L = c4NvIds();
  if (!L.length) return '<p class="sm">Chưa thuê người làm nào. Thuê người ở từng hàng, từng quán.</p>';
  // grouped (owner 2026-11-14: "gom theo section của từng quán và của chợ quê hay phố huyện"): Chợ quê / Phố Huyện, then a heading per shop
  let h = '';
  for (const [place, title] of [['lang', 'Chợ quê'], ['pho', 'Phố Huyện']]) {
    const P = L.filter(x => x[0] === place); if (!P.length) continue;
    h += `<h4 class="nvPlace ${place}">${title} <small>${P.length} người</small></h4>`;
    for (const shop of [...new Set(P.map(x => x[2]))]) {
      const Sh = P.filter(x => x[2] === shop);
      h += `<div class="nvShop"><h5>${c4Esc4(shop)} <small>${Sh.length} người</small></h5><div class="nvList">${Sh.map(c4NvCard).join('')}</div></div>`;
    }
  }
  return h;
}
// two tabs over a list box (#c4evB in the village, #p4upsB in the town)
function c4NvTabs(box) {
  if (!box || box.querySelector('.nvTabs')) return;
  const shops = document.createElement('div'); shops.className = 'nvShops'; while (box.firstChild) shops.appendChild(box.firstChild);
  const staff = document.createElement('div'); staff.className = 'nvStaff';
  const n = c4NvIds().length, bar = document.createElement('div'); bar.className = 'uptabs nvTabs';
  bar.innerHTML = `<button type="button" data-nvt="hang">Các hàng</button><button type="button" data-nvt="nv">Nhân viên${n ? ' (' + n + ')' : ''}</button>`;
  box.append(bar, shops, staff);
  const set = t => {
    C4NV.tab = t; shops.hidden = t !== 'hang'; staff.hidden = t !== 'nv';
    if (t === 'nv') staff.innerHTML = c4NvHtml();
    bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.nvt === t));
  };
  bar.addEventListener('click', e => { const x = e.target.closest('[data-nvt]'); if (!x) return; e.stopPropagation(); AU.tap(); set(x.dataset.nvt); });
  staff.addEventListener('click', e => {
    const x = e.target.closest('[data-nv]'); if (!x) return; e.stopPropagation(); AU.tap();
    C4NV.id = x.dataset.nv; c4NvSwap(); c4WkOpen(x.dataset.nv);
  });
  set(C4NV.keep ? C4NV.tab : 'hang'); C4NV.keep = false;
}
{ const o0 = c4OpenUps; c4OpenUps = function () { const r = o0.apply(this, arguments); $('#c4evT').textContent = 'Quán của nhà mình'; c4NvTabs($('#c4evB')); return r; }; }
{ const o0 = p4OpenUps; p4OpenUps = function () { const r = o0.apply(this, arguments); const t = $('#p4ups h3'); if (t) t.textContent = 'Quán của nhà mình'; c4NvTabs($('#p4upsB')); return r; }; }
// a worker opened from this list goes back to it; one opened from a stall's own sheet (a [data-wk] card) goes back there as before
addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-wk]')) C4NV.id = null; }, true);
{ const w0 = c4WkWho; c4WkWho = function (id) {
    const W = w0.apply(this, arguments);
    if (W && C4NV.id === id) W.back = () => { c4NvSwap(); C4NV.id = null; C4NV.keep = true; C4NV.tab = 'nv'; if (S.mode === 'c4bplay') p4OpenUps(); else c4OpenUps(); };
    return W;
  }; }
// the bottom button: "Quán" with a stall icon (village and town)
for (const id of ['c4Ups', 'p4Ups']) { const b = document.getElementById(id); if (b) { b.title = 'Quán'; b.setAttribute('aria-label', 'Quán'); b.innerHTML = '<i class="ic4 quan"></i><span>Quán</span>'; } }
// opened from the staff list: a button at the top back to it (owner 2026-11-14: "khi ấn vào 1 nhân viên thì phải có nút quay lại danh sách nhân viên")
{ const o0 = c4WkOpen; c4WkOpen = function (id) {
    const r = o0.apply(this, arguments), box = $('#c4wkB');
    if (box && C4NV.id === id && C4WK.id === id && !box.querySelector('.nvBack')) {
      const b = document.createElement('button'); b.className = 'btn alt upback nvBack'; b.textContent = '‹ Danh sách nhân viên'; b.dataset.wkback = '1'; box.prepend(b);
    }
    return r;
  }; }
// firing asks first, in words (owner 2026-11-14: "khi đuổi thì phải có confirm chữ"): the Đuổi việc / Cho nghỉ button turns into a line asking
// whether to really let this person go, with the button that does it (data-sure, which the worker sheet's own handler then runs) and Thôi
addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#c4wkB [data-wkfire]:not([data-sure]),#c4wkB [data-nvno]'); if (!t) return;
  e.stopPropagation(); e.preventDefault(); AU.tap();
  if (t.dataset.nvno) { c4WkOpen(C4WK.id, true); return; }
  const W = C4WK.id && c4WkWho(C4WK.id); if (!W) return;
  const nm = c4Esc4(c4Cap1(W.name)), lang = W.place === 'lang';
  const pay = lang && C4.phase === 'open' && C4.today && W.h && !W.h.nowage ? ` Hôm nay vẫn phải trả công ${c4Money(c4Wage(W.g, W.h))}.` : '';
  const row = t.closest('.row'), box = document.createElement('div'); box.className = 'nvSure';
  box.innerHTML = `<p>${lang ? `Đuổi việc <b>${nm}</b> thật không?` : `Cho <b>${nm}</b> nghỉ việc thật không?`}${pay}</p>`
    + `<div class="row"><button class="btn red" data-wkfire="1" data-sure="1">${lang ? 'Đuổi việc' : 'Cho nghỉ'}</button><button class="btn alt" data-nvno="1">Thôi</button></div>`;
  row.replaceWith(box); box.scrollIntoView({ block: 'nearest' });
}, true);
// once let go, back to the staff list when the worker was opened from it (the person is gone, so the sheet's own way back closes everything)
addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#c4wkB [data-wkfire][data-sure]'); if (!t || !C4NV.id || C4NV.id !== C4WK.id) return;
  setTimeout(() => { if (C4WK.id || !$('#c4wk').hidden) return; C4NV.id = null; c4NvSwap(); C4NV.keep = true; C4NV.tab = 'nv'; if (S.mode === 'c4bplay') p4OpenUps(); else c4OpenUps(); }, 0);
}, true);
// the same between the shop list and a shop's own sheet (owner 2026-11-14: "từ danh sách cửa hàng ấn vào từng quán cũng đang bị giật lên giật xuống"):
// a card of the list and the sheet's "‹ Danh sách cửa hàng" switch sheets without the slide (the sheets keep one height too, css)
addEventListener('click', e => { if (e.target.closest && e.target.closest('#c4evB .nvShops [data-up],#p4upsB .nvShops [data-k],.upback')) c4NvSwap(); }, true);
// the notebook's tab row (village c4OpenNotes, town hsOpen) is drawn anew on every tab, and was then centred on the open tab: the whole row slid
// sideways at each tap (owner 2026-11-14: "ấn chuyển các tab trong sổ tay vẫn ko mượt"). Now the row keeps where it was and moves only as far as
// needed to show the open tab whole.
function c4TabsKeep(sel, fn) {
  return function () {
    const old = document.querySelector(sel + ' .c4tabs'), sl = old ? old.scrollLeft : null;
    const r = fn.apply(this, arguments);
    const bar = document.querySelector(sel + ' .c4tabs'), on = bar && bar.querySelector('.on');
    if (bar) { const n = bar.children.length; if (n > 4 && !bar.querySelector('.brk')) { bar.classList.add('two'); const k = document.createElement('i'); k.className = 'brk'; bar.children[Math.ceil(n / 2) - 1].after(k); } }   // two rows (owner 2026-11-14)
    if (bar && sl !== null && !bar.classList.contains('two')) {
      let x = sl; if (on) { const l = on.offsetLeft - bar.offsetLeft, rr = l + on.offsetWidth; if (l < x + 6) x = l - 6; else if (rr > x + bar.clientWidth - 6) x = rr - bar.clientWidth + 6; }
      bar.scrollLeft = Math.max(0, x);
    }
    return r;
  };
}
c4OpenNotes = c4TabsKeep('#c4note', c4OpenNotes);
if (typeof hsOpen === 'function') hsOpen = c4TabsKeep('#hs', hsOpen);
