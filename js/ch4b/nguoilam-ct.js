/* Chương IV · hồ sơ người làm (owner 2026-11-12: "quá nhiều chữ cho 1 bảng, làm 1 bảng riêng cho người làm, vẫn đặt ở trong quán nhưng khi ấn vào
   thì ra detail: ảnh, tên tuổi, các thông số, tiền lương, thưởng, lịch sử trả công, lịch sử đòi tăng lương, xin nghỉ ốm…; có cách nào trò chuyện
   với người làm không?"). Village and town alike. In a stall's or shop's sheet each worker is one small card (portrait, name, pay, how they seem,
   a badge when something waits); a tap opens #c4wk: portrait, age, home, family, traits, pay (Bớt / Thêm công in the town, as before), the
   bonus box (thuong.js), "Trò chuyện" (five topics, written lines, no AI), the history (q.log: pay each evening, bonuses, asks and answers,
   sick days, pay changes) and Cho nghỉ. Ids as in thuong.js c4BonusWho: v|g|i village hand, k|key town keeper, p|key|i town helper,
   t|i betel house hand. What a worker says is never a number from the hidden rules; a rumour about the times is true 72 % of the time. */
const c4Hs = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const C4WK_QUE = ['làng Đông', 'xóm Bến', 'làng Gốm bên sông', 'thôn Hạ', 'làng Trúc', 'xóm Chùa', 'làng Vạn Chài', 'thôn Thượng'];
const C4WK_NHA_M = ['còn mẹ già ở quê', 'có hai đứa con nhỏ', 'vừa mới cưới vợ', 'mồ côi từ bé', 'nhà đông anh em, là con cả', 'vợ đang có mang', 'bố ốm nằm một chỗ'];
const C4WK_NHA_F = ['còn mẹ già ở quê', 'có hai đứa con nhỏ', 'vừa mới lấy chồng', 'mồ côi từ bé', 'nhà đông anh em, là chị cả', 'chồng đi phu xa', 'đang để dành tiền cưới'];
const C4WK_THICH = ['hát chèo', 'câu cá', 'nuôi gà chọi', 'ăn xôi gấc', 'nghe kể chuyện cổ tích', 'chơi ô ăn quan', 'thả diều', 'thêu thùa'];
const c4WkFemale = name => /^(chị|cô|thím|bà|con|mợ)\b/i.test(String(name).trim());
// who it is: the worker's data and the sheet to go back to
function c4WkWho(id) {
  const W = c4BonusWho(id); if (!W) return null;
  const [t, a, b] = id.split('|');
  if (t === 'v') { const h = W.h; return { ...W, place: 'lang', where: 'hàng ' + C4_GOODS[a].name.toLowerCase(), tr: { sp: h.sp, wm: h.wm, ho: h.ho }, rel: h.rel, sort: h.sort, g: a, back: () => c4OpenUp(a) }; }
  if (t === 'k') { const R = p4Shops()[a]; return { ...W, place: 'pho', where: p4Cap1(p4Kind(R).keeper) + ' quán ' + R.name, tr: { sp: R.ksp, wm: R.kwm, ho: R.kho }, R, key: a, back: () => { P4.shopSel = { key: a, name: R.name }; p4ShopSheet(); } }; }
  if (t === 'p') { const R = p4Shops()[a], h = p4ShopHands(R)[+b]; return { ...W, place: 'pho', where: 'Người phụ quán ' + R.name, tr: { sp: h.sp, wm: h.wm, ho: h.ho }, R, key: a, h, i: +b, back: () => { P4.shopSel = { key: a, name: R.name }; p4ShopSheet(); } }; }
  if (t === 't') { const h = p4Hands()[+a]; return { ...W, place: 'pho', where: 'Người làm hiệu trầu', tr: { sp: h.sp, wm: h.wm, ho: h.ho }, h, i: +a, sort: h.sort, back: () => p4HomeOpen() }; }
  return null;
}
// age, home, family and a liking, fixed once per worker (kept on its wage state q, so a new keeper is a new person)
function c4WkBio(W) {
  const q = W.q;
  if (!q.bio) {
    const r0 = c4Hs(W.name + ':' + (q.fid || (q.fid = (Math.random() * 1e9) | 0))), r = k => ((r0 >>> k) & 1023) / 1024, f = c4WkFemale(W.name), t = String(W.name).split(' ')[0].toLowerCase();
    const [lo, hi] = { anh: [19, 32], chị: [19, 32], cô: [17, 28], cậu: [15, 20], chú: [34, 52], thím: [34, 52] }[t] || [20, 40];
    q.bio = { age: lo + Math.floor(r(1) * (hi - lo + 1)), que: C4WK_QUE[Math.floor(r(3) * C4WK_QUE.length)], nha: (f ? C4WK_NHA_F : C4WK_NHA_M)[Math.floor(r(5) * 7)], thich: C4WK_THICH[Math.floor(r(7) * C4WK_THICH.length)], f };
  }
  if (!q.bio.kieu) q.bio.kieu = C4WK_KIEUS[c4Hs('k' + W.name + ':' + q.fid) % C4WK_KIEUS.length][0];   // a way of talking of their own (owner)
  return q.bio;
}
// the ways of talking (the chat Worker reads the key: worker-nguoilam/src/chat.js KIEU)
const C4WK_KIEUS = [['it_noi', 'ít nói'], ['nhieu', 'nói nhiều'], ['kho_chiu', 'hay cáu'], ['kho_tinh', 'khó tính'], ['hom_hinh', 'vui tính'], ['hien', 'hiền lành']];
const c4WkKieuWord = k => (C4WK_KIEUS.find(x => x[0] === k) || C4WK_KIEUS[4])[1];
function c4WkFace(W) {
  const b = c4WkBio(W), id = 900000 + (c4Hs(W.name + ':' + W.q.fid) % 90000);
  const sort = W.sort !== undefined ? W.sort : C4_HELPERS[id % C4_HELPERS.length];
  try { return c4Face({ id, kind: 'mouse', sort, role: b.age >= 48 ? 'old' : 'adult', g: b.f ? 'f' : 'm', look: {} }); } catch (e) { return ''; }
}
const c4WkLog = (q, t) => { if (!q) return; const L = q.log || (q.log = []); L.push({ d: SAVE4.day, t }); if (L.length > 40) L.splice(0, L.length - 40); };
function c4WkBadges(W) {
  const q = W.q, out = [];
  if (W.h && W.h.sick) out.push('ốm, nghỉ');
  if (q.pend && !q.pend.no) out.push('đang xin tăng công');
  if (W.h && W.h.quit) out.push('đã xin nghỉ');
  if (W.h && W.h.unpaid) out.push('nợ công');
  return out;
}
// the small card in a sheet
function c4WkCard(id) {
  const W = c4WkWho(id); if (!W) return '';
  const b = c4WkBadges(W);
  return `<button class="wkCard" data-wk="${id}"><img src="${c4WkFace(W)}" alt=""><span><b>${c4Esc4(c4Cap1(W.name))}</b><small>công ${c4Money(W.wage)}/ngày · ${c4GwWord(c4Gw(W.q))}</small>${b.length ? `<em>${b.join(' · ')}</em>` : ''}</span><i>›</i></button>`;
}
const c4Esc4 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- the detail sheet ---------- */
const C4WK = { id: null, chat: [] };
function c4WkOpen(id, keepChat) {
  const W = c4WkWho(id); if (!W) { C4WK.id = null; return; }
  if (C4WK.id !== id) C4WK.chat = (c4WkWho(id).q.chat || []).map(x => [x.me ? 1 : 0, x.t]);   // the last words with this person are kept
  C4WK.id = id;
  const q = W.q, b = c4WkBio(W), m = c4Money, bad = c4WkBadges(W);
  const bar = (l, v) => c4TraitBar(l, v === undefined ? .5 : v);
  const wageBtns = W.place === 'pho' ? `<div class="row">${p4WageBtns(`data-wkw="${id}"`, p4WageCan(W.wage, W.R && !W.h ? p4KeeperBase(W.R) : W.R ? p4HelpBase(W.R) : (W.h.w0 || W.h.wage)))}</div>` : '';
  const chat = C4WK.chat.map(([who, t]) => `<p class="${who ? 'me' : 'them'}"><b>${who ? 'Bạn' : c4Esc4(c4Cap1(W.name))}:</b> ${c4Esc4(t)}</p>`).join('');
  const log = (q.log || []).slice().reverse().map(e => `<li><span>Ngày ${e.d}</span> ${c4Esc4(e.t)}</li>`).join('') || '<li>Chưa có gì.</li>';
  $('#c4wkB').innerHTML = `<div class="wkHead"><img src="${c4WkFace(W)}" alt=""><div><h3>${c4Esc4(c4Cap1(W.name))}</h3><p>${b.age} tuổi · quê ${b.que}</p><p>${c4Esc4(W.where)}</p><p>Tính: ${c4WkKieuWord(b.kieu)}</p></div></div>`
    + `<p class="wkMood">Tỏ ra: <b>${c4GwWord(c4Gw(q))}</b>${bad.length ? ` · <span class="bad">${bad.join(' · ')}</span>` : ''}</p>`
    + `<div class="tbars">${bar('nhanh nhẹn', W.tr.sp)}${bar('nhiệt tình', W.tr.wm)}${bar('trung thực', W.tr.ho)}${W.rel !== undefined ? bar('quan hệ', W.rel / 100) : ''}</div>`
    + `<h4>Tiền công</h4><p>Công <b>${m(W.wage)}</b> một ngày, trả mỗi tối.</p>${wageBtns}${c4BonusRow(q, W.wage, id)}`
    + `<h4>Trò chuyện</h4><div class="wkChat">${chat || '<p class="sm">Hỏi han người làm vài câu.</p>'}</div><div class="row wkSay"><input type="text" maxlength="120" placeholder="Nói gì với ${c4Esc4(c4Cap1(W.name))}…" data-wkin="1"${C4WK.busy ? ' disabled' : ''}><button class="btn" data-wksend="1"${C4WK.busy ? ' disabled' : ''}>${C4WK.busy ? '…' : 'Nói'}</button></div><p class="sm wkHint">Hỏi nhanh:</p><div class="row wkTopics">${C4WK_TOPICS.map(([k, t]) => `<button class="btn alt" data-wkt="${k}">${t}</button>`).join('')}</div>`
    + `<details class="wkLog"><summary>Lịch sử</summary><ul>${log}</ul></details>`
    + `<div class="row">${W.R && !W.h ? '' : `<button class="btn alt" data-wkfire="1">${W.place === 'lang' ? 'Đuổi việc' : 'Cho nghỉ'}</button>`}<button class="btn" data-wkback="1">Quay lại</button></div>`;
  const sc = $('#c4wk .card4'); const top = sc ? sc.scrollTop : 0;
  if (S.mode === 'c4bplay') p4Sheets('c4wk'); else c4Sheets('c4wk');
  if (sc && keepChat) sc.scrollTop = top;
  const ch = $('#c4wkB .wkChat'); if (ch) ch.scrollTop = ch.scrollHeight;
}
function c4WkBack() { const W = C4WK.id && c4WkWho(C4WK.id); C4WK.id = null; $('#c4wk').hidden = true; if (W) W.back(); else if (S.mode === 'c4bplay') p4Sheets(null); else c4Sheets(null); }
function c4WkFire(W) {
  if (W.place === 'lang') {
    const H = c4Hands(W.g), h = W.h; if (!h) return;
    for (const k in C4.SV) { const a = C4.SV[k]; if (a) for (const sv of [...a]) if (sv.by === h) a.splice(a.indexOf(sv), 1); }
    let paid = '';
    if (C4.phase === 'open' && !h.nowage) { const w = Math.min(Math.max(0, SAVE4.money), c4Wage(W.g, h)); SAVE4.money -= w; C4.today.wages += w; paid = `, trả công hôm nay ${c4Money(w)}`; }
    H.splice(H.indexOf(h), 1); toast(`${c4Cap1(h.name)} bị đuổi việc${paid}.`); persist4(); c4Hud();
  } else if (W.id0 === 'k') { toast('Người đứng quán không cho nghỉ được, chỉ đổi người khác (nút “Đổi người đứng quán” trong quán).', 3); return false; }
  else if (W.R) { const H = p4ShopHands(W.R); H.splice(H.indexOf(W.h), 1); toast(`Đã cho ${W.h.name} nghỉ.`, 2.2); p4Persist(); }
  else p4HandsClick({ dataset: { fire: String(W.i) } });
  return true;
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-wk],[data-wkback],[data-wkfire],[data-wkt],[data-wkw],[data-wksend]'); if (!t || t.disabled) return;
  if (t.dataset.wksend) { e.stopPropagation(); c4WkSend(); return; }
  e.stopPropagation(); AU.tap();
  if (t.dataset.wk) { c4WkOpen(t.dataset.wk); return; }
  if (t.dataset.wkback) { c4WkBack(); return; }
  const W = C4WK.id && c4WkWho(C4WK.id); if (!W) { c4WkBack(); return; }
  if (t.dataset.wkw) {
    const d = +t.dataset.d || 0, before = W.wage, [k, , i] = C4WK.id.split('|');
    const to = k === 'k' ? p4ShopWage(W.R, 'k', d) : k === 'p' ? p4ShopWage(W.R, i, d) : p4HandWage(W.h, d);
    if (to !== before) c4WkLog(W.q, `${to > before ? 'Chủ tăng công lên' : 'Chủ bớt công còn'} ${c4Money(to)} một ngày.`); p4Persist();
    c4WkOpen(C4WK.id, true); return;
  }
  if (t.dataset.wkfire) { if (c4WkFire({ ...W, id0: C4WK.id.split('|')[0] }) !== false) c4WkBack(); return; }
  if (t.dataset.wkt) { c4WkTalk(W, t.dataset.wkt); c4WkOpen(C4WK.id, true); }
}, true);
addEventListener('keydown', e => {
  if (e.target && e.target.dataset && e.target.dataset.wkin) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); c4WkSend(); } return; }   // typing: no game keys
  if (e.code === 'Escape' && !$('#c4wk').hidden) { e.stopPropagation(); e.preventDefault(); c4WkBack(); } }, true);
{
  const d = document.createElement('div'); d.id = 'c4wk'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 wk"><div id="c4wkB"></div></div>';
  document.body.appendChild(d);
}
{ const sh0 = c4Sheets; c4Sheets = function (id) { const el = $('#c4wk'); if (el) el.hidden = id !== 'c4wk'; sh0(id === 'c4wk' ? null : id); if (id === 'c4wk') { C4.sheet = id; C4.paused = true; C4.sheetT = performance.now(); } }; }
{ const sh0 = p4Sheets; p4Sheets = function (id) { const el = $('#c4wk'); if (el) el.hidden = id !== 'c4wk'; sh0(id === 'c4wk' ? null : id); if (id === 'c4wk') { P4.sheet = id; P4.paused = true; P4.sheetT = performance.now(); } }; }

/* ---------- talking ---------- */
const C4WK_TOPICS = [['gd', 'Hỏi thăm gia đình'], ['bb', 'Hỏi chuyện buôn bán'], ['khen', 'Khen'], ['nhac', 'Nhắc nhở'], ['muon', 'Có muốn nói gì không?']];
const C4WK_ASK = { gd: 'Nhà cửa dạo này thế nào?', bb: 'Hôm nay buôn bán ra sao?', khen: 'Hôm nay làm khéo lắm!', nhac: 'Làm cẩn thận hơn nhé, đừng để khách chờ.', muon: 'Có điều gì muốn nói với tôi không?' };
const c4P = a => a[(Math.random() * a.length) | 0];
// the mood band: 2 fond, 1 plain, 0 sour
const c4WkBand = q => { const g = c4Gw(q); return g >= .25 ? 2 : g > -.15 ? 1 : 0; };
function c4WkTalk(W, k) {
  const q = W.q, b = c4WkBio(W), band = c4WkBand(q), once = (q.talk || (q.talk = {}))[k] !== SAVE4.day; q.talk[k] = SAVE4.day;
  const add = d => { if (once) q.gw = Math.max(C4_GW_MIN, Math.min(1, c4Gw(q) + d)); };
  let say;
  if (k === 'gd') {
    say = band === 2 ? `Dạ, em ${b.nha}. Được ông bà hỏi han em mừng lắm. Rảnh em lại về ${b.que} thăm nhà.`
      : band === 1 ? `Em ${b.nha}, quê ở ${b.que}. Cũng tạm ổn ạ.` : `Em ${b.nha}… thôi, chuyện nhà em, ông bà hỏi làm gì.`;
    if (Math.random() < .35) say += ` Lúc rảnh em thích ${b.thich}.`;
    add(.02);
  } else if (k === 'bb') {
    say = c4WkBiz(W);
    const mood = W.place === 'pho' ? c4TownMood() : c4GiaMood(), truth = Math.random() < .72, flush = truth ? mood >= 1.04 : mood < 1.04;
    if (Math.random() < .6) say += ' ' + (mood > .96 && mood < 1.04 && truth ? 'Thiên hạ dạo này cũng như mọi khi.' : flush ? c4P(['Nghe đâu dạo này ai cũng rủng rỉnh.', 'Người ta bảo dạo này làm ăn khá lắm.']) : c4P(['Nghe đâu dạo này nhà nào cũng túng.', 'Người ta kêu dạo này khó kiếm tiền lắm.']));
  } else if (k === 'khen') {
    say = band === 2 ? c4P(['Dạ, em cảm ơn ông bà, em sẽ cố hơn nữa!', 'Ông bà khen em vui cả ngày.']) : band === 1 ? c4P(['Dạ, em cảm ơn.', 'Vâng, em làm hết sức thôi ạ.']) : c4P(['Khen thì khen vậy thôi…', 'Khen suông thì no được ai.']);
    add(.04);
  } else if (k === 'nhac') {
    const ho = W.tr.ho === undefined ? .5 : W.tr.ho;
    say = band === 0 ? c4P(['Công thì ít mà đòi lắm thế!', 'Em làm đến thế còn chê.']) : ho < .35 ? c4P(['Vâng vâng, biết rồi ạ.', 'Dạ… em có làm gì đâu.']) : c4P(['Dạ, em xin lỗi, em sẽ để ý hơn.', 'Vâng, em nhớ rồi ạ.']);
    add(-.06);
  } else {
    say = c4WkWish(W, band);
  }
  c4WkSay(W, 1, C4WK_ASK[k]); c4WkSay(W, 0, say);
  persist4(); if (W.place === 'pho') p4Persist();
}
// how today went where they work, in words
function c4WkBiz(W) {
  if (W.place === 'lang') {
    const by = C4.today && C4.today.by && C4.today.by[W.g], n = by ? by.n || 0 : 0, H = W.h.tk || [], avg = H.length ? H.reduce((a, c) => a + c, 0) / H.length : 0, take = by ? by.take || 0 : 0;
    if (C4.phase === 'morning') return 'Chợ chưa họp ạ, lát nữa mới biết.';
    if (!n) return 'Hôm nay chưa bán được gì ạ.';
    return avg && take > avg * 1.2 ? `Hôm nay đắt hàng ạ, bán được ${n} ${C4_GOODS[W.g].unit} rồi.` : avg && take < avg * .7 ? `Hôm nay vắng quá, mới được ${n} ${C4_GOODS[W.g].unit}.` : `Hôm nay cũng được, ${n} ${C4_GOODS[W.g].unit} rồi ạ.`;
  }
  if (W.R) {
    const T = (P4.shopDay || {})[W.key] || { n: 0, take: 0 }, H = W.R.tk || [], avg = H.length ? H.reduce((a, c) => a + c, 0) / H.length : 0;
    let s = !T.n ? 'Hôm nay chưa bán được gì ạ.' : avg && T.take > avg * 1.2 ? `Hôm nay khách đông, bán được ${T.n} rồi.` : avg && T.take < avg * .7 ? `Hôm nay vắng, mới bán được ${T.n}.` : `Hôm nay bán được ${T.n}, cũng như mọi hôm.`;
    if (typeof p4Tired === 'function' && p4Tired(W.R)) s += ' Mấy hôm nay quầy đông quá, chạy không xuể.';
    return s;
  }
  return 'Hiệu trầu hôm nay cũng có khách ra vào ạ.';
}
// what is on their mind: an ask waiting, pay they find low (no number), tiredness, else contentment
function c4WkWish(W, band) {
  const q = W.q;
  if (q.pend && !q.pend.no) return `Dạ, em vẫn đang chờ ông bà trả lời chuyện tăng công lên ${c4Money(q.pend.to)}.`;
  let fair = 0;
  try { fair = W.place === 'lang' ? c4HandFairOf(W.h, W.g) : W.R && !W.h ? p4ShopFair(W.R) * (1 - .25 * c4Gw(q)) : W.R ? p4HelpFair(W.R) * (1 - .25 * c4Gw(q)) : p4HandFair(W.h) * (1 - .25 * c4Gw(q)); } catch (e) {}
  if (fair && W.wage < fair - 4) return band === 0 ? 'Làm vất vả mà công chẳng bõ, em cũng đang tính đây.' : 'Dạ… nói ra ông bà đừng giận, em thấy công hơi ít so với việc.';
  if (W.R && typeof p4Tired === 'function' && p4Tired(W.R)) return 'Quầy đông quá, giá có thêm người phụ thì đỡ cho em.';
  if (W.h && W.h.quit) return 'Em đã thưa với ông bà rồi, mấy hôm nữa em xin nghỉ.';
  return band === 2 ? 'Em làm ở đây vui lắm, ông bà cứ yên tâm.' : band === 1 ? 'Dạ không ạ, em làm bình thường.' : 'Dạ… thôi, không có gì đâu ạ.';
}

/* ---------- the history: pay each evening, sick days, asks; answers; bonuses ---------- */
{ const g0 = c4BonusGive; c4BonusGive = function (id, amt) { const W = c4BonusWho(id), bd = W && W.q.bd, m0 = SAVE4.money; g0.apply(this, arguments); if (W && W.q.bd === SAVE4.day && bd !== SAVE4.day) { c4WkLog(W.q, `Được thưởng ${c4Money(Math.round(m0 - SAVE4.money))}.`); persist4(); if (typeof p4Persist === 'function' && SAVE4B && SAVE4B.house) p4Persist(); } if (C4WK.id === id && !$('#c4wk').hidden) c4WkOpen(id, true); }; }
{ const a0 = c4WageAnswer; c4WageAnswer = function (yes) { const a = C4_WAGE_CUR, p = a && a.h.wq && a.h.wq.pend; if (p) c4WkLog(a.h.wq, yes ? `Xin tăng công, chủ đồng ý lên ${c4Money(p.to)}.` : 'Xin tăng công, chủ không đồng ý.'); return a0.apply(this, arguments); }; }
{ const a0 = p4WageAnswer; p4WageAnswer = function (yes) { const a = P4_WAGE_CUR, q = a && (a.kind === 'shop' ? a.R.wq : a.h.wq), p = q && q.pend; if (p) c4WkLog(q, yes ? `Xin tăng công, chủ đồng ý lên ${c4Money(p.to)}.` : 'Xin tăng công, chủ không đồng ý.'); return a0.apply(this, arguments); }; }
{ const pay0 = c4PayHands;
  c4PayHands = function (d, quits) {
    const before = [];
    for (const g of c4Owned()) for (const h of c4Hands(g)) { const q = h.wq || (h.wq = {}); before.push({ g, h, q, sick: h.sick, nowage: h.nowage, pend: q.pend, wage: c4Wage(g, h) }); }
    const r = pay0.apply(this, arguments);
    for (const x of before) {
      const { g, h, q } = x, here = c4Hands(g).includes(h);
      if (x.sick) c4WkLog(q, x.nowage ? 'Ốm, nghỉ, bị trừ công.' : 'Ốm, nghỉ, vẫn được trả công.');
      if (here && !x.nowage && !h.unpaid) c4WkLog(q, `Nhận công ${c4Money(x.wage)}.`);
      else if (here && h.unpaid) c4WkLog(q, 'Chưa được trả công.');
      if (here && q.pend && q.pend !== x.pend && !q.pend.no) c4WkLog(q, `Xin tăng công từ ${c4Money(q.pend.from)} lên ${c4Money(q.pend.to)}.`);
    }
    return r;
  }; }
{ const pay0 = p4PayHands;
  p4PayHands = function () {
    const before = [], S = p4Shops();
    for (const key in S) { const R = S[key]; const q = R.wq || (R.wq = {}); before.push({ q, pend: q.pend, wage: p4KeeperWage(R), R }); for (const h of (R.hands || [])) { const hq = h.wq || (h.wq = {}); before.push({ q: hq, pend: hq.pend, wage: p4HelpWage(R, h), R, h }); } }
    for (const h of p4Hands()) { const q = h.wq || (h.wq = {}); before.push({ q, pend: q.pend, wage: h.wage, h, betel: true }); }
    const r = pay0.apply(this, arguments);
    for (const x of before) {
      const here = x.betel ? p4Hands().includes(x.h) : x.h ? p4ShopHands(x.R).includes(x.h) : x.R.wq === x.q;
      if (!here) continue;
      if (x.betel && x.h.unpaid) c4WkLog(x.q, 'Chưa được trả công.'); else c4WkLog(x.q, `Nhận công ${c4Money(x.wage)}.`);
      if (x.q.pend && x.q.pend !== x.pend && !x.q.pend.no) c4WkLog(x.q, `Xin tăng công từ ${c4Money(x.q.pend.from)} lên ${c4Money(x.q.pend.to)}.`);
    }
    return r;
  }; }

/* ---------- free talk through the chat Worker (worker-nguoilam, Claude Haiku 5.5; owner 2026-11-12: "trò chuyện là tự người chơi trò chuyện, kiểu AI
   thông minh"; only daily work, the worker's life and the owners' life; witty; each person their own way of talking). The worker is told only words
   (how they seem, what they think), never the hidden numbers. What the player says moves goodwill a little: kind +.02 (at most +.06 a day from
   talk), rude −.05, off the subject nothing. 15 messages a device a day (the Worker counts). ---------- */
const C4WK_URL = (() => { try { const u = new URLSearchParams(location.search).get('wkchat'); if (u) return u.replace(/\/$/, '') + '/chat'; } catch (e) {} return 'https://dcc-nguoilam.dcc-phong-choi.workers.dev/chat'; })();
function c4WkSay(W, me, t) {
  C4WK.chat.push([me ? 1 : 0, t]); if (C4WK.chat.length > 10) C4WK.chat.splice(0, C4WK.chat.length - 10);
  W.q.chat = C4WK.chat.slice(-8).map(([m, x]) => ({ me: !!m, t: x }));
}
function c4WkDev() {
  try { let d = localStorage.getItem('dcc_wkdev'); if (!d) { d = (SAVE4.oid || '') + Math.random().toString(36).slice(2, 10); localStorage.setItem('dcc_wkdev', d); } return d; } catch (e) { return 'x' + (SAVE4.oid || ''); }
}
// what the worker knows of themself and of today, in words
function c4WkPersona(W) {
  const b = c4WkBio(W), q = W.q, word = v => v === undefined ? 'vừa' : v >= .66 ? 'cao' : v >= .33 ? 'vừa' : 'thấp';
  const mood = W.place === 'pho' ? c4TownMood() : c4GiaMood(), truth = Math.random() < .72, flush = truth ? mood >= 1.04 : mood < 1.04;
  return { name: c4Cap1(W.name), age: b.age, female: b.f, que: b.que, nha: b.nha, thich: b.thich, where: W.where, place: W.place, wage: W.wage, kieu: b.kieu,
    mood: c4GwWord(c4Gw(q)), traits: `nhanh nhẹn ${word(W.tr.sp)}, nhiệt tình ${word(W.tr.wm)}, thật thà ${word(W.tr.ho)}`,
    biz: c4WkBiz(W), news: mood > .96 && mood < 1.04 && truth ? 'dạo này thiên hạ làm ăn cũng như mọi khi' : flush ? 'dạo này thiên hạ rủng rỉnh, làm ăn khá' : 'dạo này nhà nào cũng túng, khó kiếm tiền',
    wish: c4WkWish(W, c4WkBand(q)) };
}
async function c4WkSend() {
  const inp = $('#c4wkB [data-wkin]'), msg = inp ? inp.value.trim().slice(0, 120) : '';
  const id = C4WK.id, W = id && c4WkWho(id); if (!msg || !W || C4WK.busy) return;
  const history = C4WK.chat.slice(-4).map(([m, t]) => ({ me: !!m, t }));
  c4WkSay(W, 1, msg); C4WK.busy = true; c4WkOpen(id, true);
  let out = null, err = null;
  try {
    const r = await fetch(C4WK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: c4WkDev(), persona: c4WkPersona(W), history, msg }) });
    const j = await r.json().catch(() => ({})); if (r.ok && j.reply) out = j; else err = j.error || 'net';
  } catch (e) { err = 'net'; }
  C4WK.busy = false;
  const W2 = c4WkWho(id); if (!W2) return;
  if (out) {
    c4WkSay(W2, 0, out.reply);
    const q = W2.q, day = SAVE4.day; if (q.chatD !== day) { q.chatD = day; q.chatG = 0; }
    if (out.tone === 'lich_su' && q.chatG < .06) { q.chatG += .02; q.gw = Math.min(1, c4Gw(q) + .02); }
    else if (out.tone === 'ho') q.gw = Math.max(C4_GW_MIN, c4Gw(q) - .05);
    C4WK.left = out.left;
  } else {
    W2.q.chat = (W2.q.chat || []).slice(0, -1);                              // the unanswered line is not sent again as history
    C4WK.chat.push([0, err === 'limit' ? 'Thôi ông bà ơi, hôm nay nói thế đủ rồi, để em còn làm. Mai chuyện tiếp ạ.' : err === 'busy' ? 'Dạ… em đang dở tay, lát nữa ông bà hỏi lại nhé.' : 'Dạ…? (ồn quá, người làm không nghe rõ)']);
    if (err !== 'limit') toast('Chưa nói chuyện được lúc này, thử lại sau nhé.', 2.4);
  }
  persist4(); if (W2.place === 'pho') p4Persist();
  if (C4WK.id === id && !$('#c4wk').hidden) { c4WkOpen(id, true); const i2 = $('#c4wkB [data-wkin]'); if (i2) i2.focus(); }
}
