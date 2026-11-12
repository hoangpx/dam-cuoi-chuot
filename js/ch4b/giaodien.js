/* Chương IV · a friendlier look (owner 2026-11-12, branch ch4-giao-dien: "làm thử hết": sheets from the bottom on a phone, one main button a sheet,
   the stall sheet in folding sections, little celebrations, portraits, the town's sheets at night; "khi có khách mua thì có tiếng tiền xu rơi xuống,
   hiệu ứng tiền xu bay từ khách vào rổ tiền ở góc trên bên phải"). Village and town alike. Nothing in play changes. */
const C4UI = { coinT: 0, last: { c4: null, p4: null }, open: {} };

/* ---------- 1. a coin flies from the buyer into the purse basket (top right), with the sound of a coin falling ---------- */
function c4CoinFrom(sx, sy, toEl) {
  if (!toEl || toEl.offsetParent === null || !isFinite(sx) || !isFinite(sy)) return;
  const r = toEl.getBoundingClientRect(), tx = r.left + 16, ty = r.top + r.height / 2;
  const n = 1 + (Math.random() < .35 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'coinFly'; document.body.appendChild(c);
    const x0 = sx + (i ? 10 : 0), y0 = sy;   // straight to the basket, slowing down as it nears it (owner 2026-11-12: "bay thẳng vào giỏ tiền, đến gần thì chậm lại")
    const a = c.animate([{ transform: `translate(${x0}px,${y0}px) scale(1) rotate(0deg)`, opacity: 0 }, { transform: `translate(${x0 + (tx - x0) * .04}px,${y0 + (ty - y0) * .04}px) scale(1) rotate(30deg)`, opacity: 1, offset: .08 },
      { transform: `translate(${tx}px,${ty}px) scale(.6) rotate(360deg)`, opacity: .95 }],
      { duration: 1300 + i * 160, easing: 'cubic-bezier(.2,.6,.25,1)', delay: i * 160 });   // (owner: slower)
    a.onfinish = () => c.remove(); setTimeout(() => c.remove(), 1300 + i * 160 + i * 160 + 400);   // (also gone if the animation never ends, a hidden tab)
  }
  const now = performance.now(); if (now - C4UI.coinT > 110) { C4UI.coinT = now; setTimeout(() => { try { AU.coin(); } catch (e) {} }, 1250); }
}
// where a walker stands on the screen (head height)
// the coin rises from the stall's counter (owner: "bay từ quầy lên giỏ tiền ở góc"), not from the buyer
function c4CounterScreen(w) { const V = c4View(), g = w && w.shop, x = g === 'trau' || !g ? C4_STALL : (C4_GOODS[g] && C4_GOODS[g].x) || w.x; return [(x - C4.camX) * V.s, (c4Y(.04) + V.oy - 70) * V.s]; }
function p4CounterScreen(w, kind) { const V = p4View(), x = kind === 'trau' || isNaN(+kind) ? (typeof P4_HOME !== 'undefined' ? P4_HOME : w.x) : +kind; return [(x - P4.camX) * V.s, (p4Y(.12) + V.oy - 95) * V.s]; }
{ const s0 = c4Served; c4Served = function (w) { const r = s0.apply(this, arguments); try { if (S.mode === 'c4play' && w && w.x !== undefined) { const [x, y] = c4CounterScreen(w); c4CoinFrom(x, y, $('#c4Money')); } } catch (e) {} return r; }; }
{ const s0 = p4Served; p4Served = function (w, kind) { const r = s0.apply(this, arguments); try { if (S.mode === 'c4bplay' && w && w.x !== undefined) { const [x, y] = p4CounterScreen(w, kind); c4CoinFrom(x, y, $('#p4Money')); } } catch (e) {} return r; }; }
// the purse shows a basket, and every change of money floats beside it (+5 green, −20 red)
function c4PurseTick(el, key, val) {
  if (!el) return;
  C4UI.last[key] = val; return;   // (owner 2026-11-12: the +x đồng under the basket is gone: small sums kept popping up all the time)
  const last = val;
  if (last === null || val === last || el.offsetParent === null) return;
  const d = Math.round(val - last); if (!d) return;
  const t = document.createElement('span'); t.className = 'purseDelta ' + (d > 0 ? 'up' : 'dn'); t.textContent = (d > 0 ? '+' : '−') + c4Money(Math.abs(d)).replace(/^−/, '');
  const r = el.getBoundingClientRect(); t.style.left = Math.round(r.left + r.width / 2) + 'px'; t.style.top = Math.round(r.bottom + 2) + 'px';
  document.body.appendChild(t); setTimeout(() => t.remove(), 1500);
}
{ const h0 = c4Hud; c4Hud = function () { const r = h0.apply(this, arguments); try { c4PurseTick($('#c4Money'), 'c4', SAVE4.money); } catch (e) {} return r; }; }
{ const h0 = p4Hud; p4Hud = function () { const r = h0.apply(this, arguments); try { c4PurseTick($('#p4Money'), 'p4', p4Purse()); } catch (e) {} return r; }; }
// the HUD is not redrawn on every sale: look at the purse a few times a second while a market is open
setInterval(() => { try { if (S.mode === 'c4play' && $('#c4Money')) { if (C4UI.last.c4 !== Math.round(SAVE4.money)) { $('#c4Money').innerHTML = c4Money(SAVE4.money); c4PurseTick($('#c4Money'), 'c4', Math.round(SAVE4.money)); } }
  else if (S.mode === 'c4bplay' && $('#p4Money')) { const v = Math.round(p4Purse()); if (C4UI.last.p4 !== v) { $('#p4Money').innerHTML = c4Money(v); c4PurseTick($('#p4Money'), 'p4', v); } } } catch (e) {} }, 250);

/* ---------- 2. the stall sheet in folding sections, each with a small woodblock icon and a word of what is set ---------- */
const C4_SEC_ICON = {
  gia: '<svg viewBox="0 0 24 24"><path d="M12 3v17M5 20h14M6 7h12M6 7l-3 6h6zM18 7l-3 6h6z" fill="none" stroke="#1d1915" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  trang: '<svg viewBox="0 0 24 24"><path d="M12 2v3" stroke="#1d1915" stroke-width="1.8"/><ellipse cx="12" cy="12" rx="6" ry="7" fill="#c8402f" stroke="#1d1915" stroke-width="1.6"/><path d="M8 6h8M8 18h8M12 19v3" stroke="#1d1915" stroke-width="1.6"/></svg>',
  tu: '<svg viewBox="0 0 24 24"><path d="M2 8h20" stroke="#1d1915" stroke-width="2"/><path d="M4 8l-1 4h6l-1-4M16 8l-1 4h6l-1-4" fill="#e0b43a" stroke="#1d1915" stroke-width="1.4"/><path d="M3 12q3 6 6 0M15 12q3 6 6 0" fill="#e0b43a" stroke="#1d1915" stroke-width="1.4"/></svg>',
  giam: '<svg viewBox="0 0 24 24"><path d="M3 12l9-9h8v8l-9 9z" fill="#e9dfc9" stroke="#1d1915" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="8" r="1.6" fill="#1d1915"/></svg>',
  ban: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="5" fill="#b9b0a0" stroke="#1d1915" stroke-width="1.6"/><circle cx="7" cy="5.5" r="2.4" fill="#e7c3c0" stroke="#1d1915" stroke-width="1.4"/><circle cx="17" cy="5.5" r="2.4" fill="#e7c3c0" stroke="#1d1915" stroke-width="1.4"/><path d="M5 22q7-8 14 0" fill="#3b5a85" stroke="#1d1915" stroke-width="1.6"/></svg>',
  nhap: '<svg viewBox="0 0 24 24"><path d="M3 9h18l-2 11H5z" fill="#c9922b" stroke="#1d1915" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 9q5-7 10 0" fill="none" stroke="#1d1915" stroke-width="1.6"/><path d="M5 13h14M6 17h12" stroke="#1d1915" stroke-width="1"/></svg>',
  khac: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#e9dfc9" stroke="#1d1915" stroke-width="1.6"/><path d="M8 12h8M12 8v8" stroke="#1d1915" stroke-width="1.6"/></svg>'
};
function c4SecKind(t) { t = t.toLowerCase(); return /giá bán/.test(t) ? 'gia' : /trang trí/.test(t) ? 'trang' : /tự đi|tự lấy/.test(t) ? 'tu' : /giảm giá/.test(t) ? 'giam' : /người bán|người làm|thuê người/.test(t) ? 'ban' : /nhập|lấy thêm/.test(t) ? 'nhap' : 'khac'; }
function c4SecHint(kind, el) {
  if (kind === 'gia') { const pv = el.querySelector('.pv'); return pv ? pv.textContent.replace(/ một .*/, '') : ''; }
  if (kind === 'ban') { const n = el.querySelectorAll('.wkCard').length; return n ? n + ' người' : 'chưa thuê'; }
  if (kind === 'giam') { const p = el.querySelector('p.sm'); return p && /Không giảm/.test(p.textContent) ? 'không' : 'đang giảm'; }
  if (kind === 'tu') { const s = el.querySelector('select'); return s && /Tắt/.test(s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '') ? 'tắt' : 'bật'; }
  return '';
}
function c4Sections(root, key) {
  if (!root) return;
  for (const blk of [...root.children]) {
    if (blk.classList.contains('secW') || blk.tagName === 'DETAILS') continue;
    const h = blk.querySelector(':scope > h4'); if (!h) continue;
    const title = h.textContent.trim(), kind = c4SecKind(title), id = key + ':' + title, d = document.createElement('details');
    d.className = 'sec'; d.open = C4UI.open[id] !== undefined ? C4UI.open[id] : kind === 'nhap';
    d.innerHTML = `<summary><span class="si">${C4_SEC_ICON[kind]}</span><b>${title}</b><em>${c4SecHint(kind, blk)}</em></summary>`;
    blk.replaceWith(d); d.appendChild(blk); blk.classList.add('secB');
    d.addEventListener('toggle', () => { C4UI.open[id] = d.open; });
  }
}
{ const o0 = c4OpenUp; c4OpenUp = function (g) { const r = o0.apply(this, arguments); try { c4Sections($('#c4upO'), 'up:' + (g || 'trau')); } catch (e) {} return r; }; }

/* ---------- 3. sheets from the bottom on a phone: a handle, and a swipe down closes them when they have a close button ---------- */
{
  let st = null;
  const closeBtn = card => [...card.querySelectorAll('button')].reverse().find(b => b.offsetParent && /^(Đóng|Quay lại|Thôi|‹?\s*Đóng sổ)$/.test(b.textContent.trim()));
  document.addEventListener('touchstart', e => { const card = e.target.closest && e.target.closest('.c4sheet .card4'); if (!card || card.scrollTop > 2) { st = null; return; } st = { card, y: e.touches[0].clientY, dy: 0 }; }, { passive: true });
  document.addEventListener('touchmove', e => { if (!st) return; st.dy = e.touches[0].clientY - st.y; if (st.dy > 0 && st.card.scrollTop <= 0) st.card.style.transform = `translateY(${Math.min(st.dy, 260) * .8}px)`; }, { passive: true });
  document.addEventListener('touchend', () => { if (!st) return; const { card, dy } = st; st = null; const b = dy > 110 && closeBtn(card);
    card.style.transition = 'transform .18s ease-out'; card.style.transform = b ? 'translateY(100%)' : ''; setTimeout(() => { card.style.transition = ''; card.style.transform = ''; if (b) b.click(); }, b ? 170 : 190); }, { passive: true });
}

/* ---------- 4. the evening: the profit counts up and a red seal is stamped ---------- */
function c4CountUp(root) {
  const res = root && root.querySelector('.dhRes'); if (!res || res.dataset.done) return; res.dataset.done = 1;
  const b = res.querySelector('b'), txt = b.textContent, gain = res.classList.contains('gain');
  const val = (() => { const q = /(\d+) quan/.exec(txt), d = /(\d+) đồng/.exec(txt); return (q ? +q[1] * 600 : 0) + (d ? +d[1] : 0); })();
  const t0 = performance.now(), dur = Math.min(1100, 400 + val * 2);
  const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = c4Money(Math.round(val * e)); if (k < 1) setTimeout(() => step(performance.now()), 16); else { b.textContent = txt; res.insertAdjacentHTML('beforeend', `<i class="seal ${gain ? '' : 'loss'}">${gain ? 'LÃI' : 'LỖ'}</i>`); try { gain ? AU.coin(1.2) : AU.thump(); } catch (e2) {} } };
  setTimeout(() => step(performance.now()), 16);   // (a timer, not requestAnimationFrame: it also runs in a frame that does not paint)
}
{ const sh0 = c4Sheets; c4Sheets = function (id) { const r = sh0.apply(this, arguments); if (id === 'c4day') setTimeout(() => c4CountUp($('#c4dayN')), 150); return r; }; }
{ const sh0 = p4Sheets; p4Sheets = function (id) { const r = sh0.apply(this, arguments); if (id === 'p4day') setTimeout(() => c4CountUp($('#p4dayB')), 150); return r; }; }

/* ---------- 5. portraits on the wage asks ---------- */
function c4AskFace(box, id) { try { const W = c4WkWho(id); if (!box || !W || box.querySelector('.askFace')) return; box.insertAdjacentHTML('afterbegin', `<img class="askFace" src="${c4WkFace(W)}" alt="">`); } catch (e) {} }
{ const o0 = c4WageOpen; c4WageOpen = function () { const r = o0.apply(this, arguments); if (r && C4_WAGE_CUR) { const a = C4_WAGE_CUR, i = c4Hands(a.g).indexOf(a.h); c4AskFace($('#c4wageB'), `v|${a.g}|${i}`); } return r; }; }
{ const o0 = p4WageOpen; p4WageOpen = function () { const r = o0.apply(this, arguments); if (r && P4_WAGE_CUR) { const a = P4_WAGE_CUR; c4AskFace($('#p4wageB'), a.kind === 'shop' ? `k|${a.key}` : a.kind === 'help' ? `p|${a.key}|${p4ShopHands(a.R).indexOf(a.h)}` : `t|${p4Hands().indexOf(a.h)}`); } return r; }; }

/* ---------- 6. the town's sheets by night: candle-lit paper ---------- */
{ const ch = chapterById('4b'), up0 = ch.update; ch.update = function (dt) { up0.call(this, dt); try { document.body.classList.toggle('p4night', S.mode === 'c4bplay' && typeof p4NightK === 'function' && p4NightK() > .45); } catch (e) {} }; }
{ const h0 = hideChapterHuds; hideChapterHuds = function () { document.body.classList.remove('p4night'); return h0.apply(this, arguments); }; }

/* ---------- 7. the bottom bar: four tiles of one style, the chat button among them (owner 2026-11-12: "icon chat để cùng chỗ Phố Huyện, bỏ chữ Lên,
   làm 4 nút dưới cùng phong cách giống nhau"). The chat button (sangcho.js #cnChatB) moves into the market's bar while I am in my own market, and
   back to its floating place (#cnTools) when I visit a friend's market. ---------- */
setInterval(() => {
  try {
    const b = $('#cnChatB'); if (!b) return;
    const bar = S.mode === 'c4play' ? $('#c4hud .bar') : S.mode === 'c4bplay' ? $('#p4hud .bar') : null;
    if (bar) {
      if (b.parentElement !== bar) { bar.appendChild(b); b.classList.add('tag', 'ic', 'tl'); if (!b.querySelector('span')) b.insertAdjacentHTML('beforeend', '<span>Trò chuyện</span>'); }
      b.hidden = !cnTools || cnTools.hidden;
    } else if (cnTools && b.parentElement !== cnTools) { cnTools.appendChild(b); b.classList.remove('tag', 'ic', 'tl'); const s = b.querySelector('span'); if (s) s.remove(); b.hidden = false; }
  } catch (e) {}
}, 300);
