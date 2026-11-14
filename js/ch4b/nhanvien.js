/* Chương IV · the "Quán" button (owner 2026-11-14: "trong chỗ nâng cấp mũi tên màu xanh đổi thành quán, đổi cả icon đi, khi ấn vào thì hiện ra
   2 tab: 1 là các hàng giống như hiện tại, tab 2 là nhân viên: liệt kê tất cả các nhân viên, trong list thì ghi tên quán, ở chợ quê hay phố huyện,
   tên nhân viên, các chỉ số của nhân viên đó, khi ấn vào thì ra chi tiết nhân viên giống như trong quán"). Village and town alike: the bottom
   button reads "Quán" with a stall icon; its sheet (c4OpenUps / p4OpenUps) gets two tabs, "Các hàng" (the old list) and "Nhân viên": every hired
   worker of both places (village hands, town keepers, helpers, the betel house's hands) with place, shop, pay, mood and the four bars; a tap
   opens the worker sheet of nguoilam-ct.js (c4WkOpen), whose Quay lại comes back to this list. */
const C4NV = { tab: 'hang', keep: false, id: null };
function c4NvIds() {
  const out = [];
  for (const g of c4Owned()) c4Hands(g).forEach((h, i) => out.push(['lang', `v|${g}|${i}`, 'hàng ' + C4_GOODS[g].name.toLowerCase()]));
  if (typeof p4Shops === 'function' && SAVE4B && SAVE4B.house) {
    p4Hands().forEach((h, i) => out.push(['pho', `t|${i}`, 'hiệu trầu']));
    const S = p4Shops();
    for (const k of Object.keys(S).sort((a, b) => a - b)) {
      const R = S[k], nm = p4Cap1(String(R.name || '').toLowerCase());
      out.push(['pho', `k|${k}`, 'đứng quán ' + nm]);
      p4ShopHands(R).forEach((h, i) => out.push(['pho', `p|${k}|${i}`, 'phụ quán ' + nm]));
    }
  }
  return out;
}
function c4NvCard([place, id, where]) {
  const W = c4WkWho(id); if (!W) return '';
  const b = c4WkBadges(W), bar = (l, v) => c4TraitBar(l, v === undefined ? .5 : v);
  return `<button class="nvCard" data-nv="${id}"><img src="${c4WkFace(W)}" alt=""><span class="nvT"><b>${c4Esc4(c4Cap1(W.name))}</b>`
    + `<small><em class="nvP ${place}">${place === 'lang' ? 'Chợ quê' : 'Phố Huyện'}</em> ${c4Esc4(where)}</small>`
    + `<small>công ${c4Money(W.wage)}/ngày · ${c4GwWord(c4Gw(W.q))}</small>${b.length ? `<small class="bad">${b.join(' · ')}</small>` : ''}</span>`
    + `<span class="tbars">${bar('Nhanh nhẹn', W.tr.sp)}${bar('Nhiệt tình', W.tr.wm)}${bar('Trung thực', W.tr.ho)}${bar('Quan hệ', c4WkRel(W) / 100)}</span></button>`;
}
function c4NvHtml() {
  const L = c4NvIds();
  if (!L.length) return '<p class="sm">Chưa thuê người làm nào. Thuê người ở từng hàng, từng quán.</p>';
  return `<div class="nvList">${L.map(c4NvCard).join('')}</div>`;
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
    C4NV.id = x.dataset.nv; c4WkOpen(x.dataset.nv);
  });
  set(C4NV.keep ? C4NV.tab : 'hang'); C4NV.keep = false;
}
{ const o0 = c4OpenUps; c4OpenUps = function () { const r = o0.apply(this, arguments); $('#c4evT').textContent = 'Quán của nhà mình'; c4NvTabs($('#c4evB')); return r; }; }
{ const o0 = p4OpenUps; p4OpenUps = function () { const r = o0.apply(this, arguments); const t = $('#p4ups h3'); if (t) t.textContent = 'Quán của nhà mình'; c4NvTabs($('#p4upsB')); return r; }; }
// a worker opened from this list goes back to it; one opened from a stall's own sheet (a [data-wk] card) goes back there as before
addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-wk]')) C4NV.id = null; }, true);
{ const w0 = c4WkWho; c4WkWho = function (id) {
    const W = w0.apply(this, arguments);
    if (W && C4NV.id === id) W.back = () => { C4NV.id = null; C4NV.keep = true; C4NV.tab = 'nv'; if (S.mode === 'c4bplay') p4OpenUps(); else c4OpenUps(); };
    return W;
  }; }
// the bottom button: "Quán" with a stall icon (village and town)
for (const id of ['c4Ups', 'p4Ups']) { const b = document.getElementById(id); if (b) { b.title = 'Quán'; b.setAttribute('aria-label', 'Quán'); b.innerHTML = '<i class="ic4 quan"></i><span>Quán</span>'; } }
