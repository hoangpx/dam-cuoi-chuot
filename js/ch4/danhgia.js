/* ---------- Đánh giá: reviews of every shop, village and town (owner 2026-11-13: "thêm 1 phần review cho mỗi quán thêm 1 tab cạnh Hàng quán và
   Mời khách: mỗi lần nhân viên bỏ việc hoặc đuổi việc thì để lại comment cho chủ, nói xấu chủ các kiểu, rồi khuyên người sau cẩn thận; khách hài lòng
   thì nhận xét tốt, bị bỏ nhiều thì nhận xét xấu, nói xấu quán; dùng Haiku mà gen ra cho đa dạng, hóm hỉnh, hài hước, kiểu xì tin bây giờ, đừng nói dài
   dòng quê mùa; đánh giá sao tương đương với nhận xét; quán mà nhiều sao 5 sao thì đông khách hơn và ngược lại").
   A shop is 'lang:<ware>' (a village stall) or 'pho:trau' / 'pho:<x>' (the town's betel house / a shop). SAVE4.rv[sid] = newest first, at most
   C4_RV_KEEP of { d: game day, k: 'kh' customer | 'nv' former worker, s: stars 1–5, who, why, t: the words }.
   WHAT WRITES ONE (the game picks the stars, so they always fit the words):
   - a worker leaving (c4RvStaff): fired (tieng.js: 1★), quit (1–2★), left unpaid (1★), ran off after scolding (1★); always written.
   - a customer served (c4Served / p4Served): about 1 in 18; quick 4–5★, slower 3–4★.
   - a customer giving up (c4Snubbed, p4Walkout, the betel queue): about 1 in 3; 1–2★ (sold out: "het").
   SPARSE (owner 2026-11-13: "thi thoảng 1, 2 ngày mới có 1 đánh giá thôi, đôi khi đánh giá 1* hoặc 5* mà ko rõ lý do"): one customer review a shop, then
   none for the next 1–2 game days (SAVE4.rvn[sid] = the first day another may come); about one in six is a whim, 1★ or 5★ for no reason (why 'vu_vo').
   THE WORDS: queued in SAVE4.rvq and sent six at a time to the chat Worker's /review (worker-nguoilam/src/review.js, Claude Haiku 5.5, young and witty
   Vietnamese, ≤ 25 words, matching the stars); when it cannot answer (no network, the day's limit), the game writes one of its own lines (C4_RV_LOCAL).
   THE STARS BRING PEOPLE (hidden): the average of the last 20 customer reviews of a shop (at least 3) moves its buyers by ×(1 + .06·(avg − 3)): ×1.12 at
   5★, ×.88 at 1★ (village c4Want, town p4ShopRate, the betel house's buy chance live and in the background). Workers' reviews are shown with their
   stars but do not count for customers. ---------- */
const C4_RV_KEEP = 40, C4_RV_N = 20, C4_RV_WHIM = 1 / 6;
const C4_RV_URL = (() => { try { const u = new URLSearchParams(location.search).get('wkchat'); if (u) return u.replace(/\/$/, '') + '/review'; } catch (e) {} return 'https://dcc-nguoilam.dcc-phong-choi.workers.dev/review'; })();
const C4RV = { busy: false, off: '' };
const c4RvList = sid => ((SAVE4.rv || {})[sid] || []);
function c4RvAvg(sid) { const L = c4RvList(sid).filter(r => r.k === 'kh').slice(0, C4_RV_N); return L.length ? L.reduce((a, r) => a + r.s, 0) / L.length : null; }
function c4RvK(sid) { const L = c4RvList(sid).filter(r => r.k === 'kh').slice(0, C4_RV_N); if (L.length < 3) return 1; return 1 + .06 * (L.reduce((a, r) => a + r.s, 0) / L.length - 3); }
const c4RvShopName = sid => { const [p, k] = sid.split(':'); if (p === 'lang') return k === 'trau' ? 'Quán trầu' : (C4_GOODS[k] ? C4_GOODS[k].name : 'Quán'); if (k === 'trau') return 'Hiệu trầu'; const R = typeof p4Shops === 'function' && p4Shops()[k]; return R ? p4Cap1(String(R.name).toLowerCase()) : 'Quán'; };
const c4RvPick = a => a[(Math.random() * a.length) | 0];
// one event → the queue (stars already chosen)
function c4RvAdd(sid, k, s, who, why, ware) {
  if (!sid || !SAVE4) return;
  if (k === 'kh') {   // one a shop, then 1–2 game days of nothing; now and then a whim
    const N = SAVE4.rvn || (SAVE4.rvn = {}); if (SAVE4.day < (N[sid] || 0)) return; N[sid] = SAVE4.day + 1 + (Math.random() < .5 ? 1 : 0);
    if (Math.random() < C4_RV_WHIM) { s = Math.random() < .5 ? 1 : 5; why = 'vu_vo'; }
  }
  (SAVE4.rvq || (SAVE4.rvq = [])).push({ sid, k, s, who: String(who || '').slice(0, 30), why, ware: ware || '', d: SAVE4.day });
  if (SAVE4.rvq.length > 30) SAVE4.rvq.splice(0, SAVE4.rvq.length - 30);
  persist4();
}
function c4RvStaff(sid, who, why) { c4RvAdd(sid, 'nv', why === 'bo' ? (Math.random() < .5 ? 1 : 2) : 1, who, why); }
function c4RvCustomer(sid, who, wait, ware) {
  if (Math.random() > 1 / 18) return;
  const s = wait < 6 ? (Math.random() < .65 ? 5 : 4) : wait < 15 ? (Math.random() < .5 ? 4 : 3) : 3;
  c4RvAdd(sid, 'kh', s, who, s >= 5 ? c4RvPick(['nhanh', 'ngon', 're']) : 'ngon', ware);
}
function c4RvGiveUp(sid, who, empty, ware) { if (Math.random() > 1 / 3) return; c4RvAdd(sid, 'kh', Math.random() < .6 ? 1 : 2, who, empty ? 'het' : 'cham', ware); }
// the game's own words when the Worker cannot write (a few of each, never the hidden numbers)
const C4_RV_LOCAL = {
  5: ['Đỉnh nóc kịch trần, ăn xong muốn quay lại ngay 😋', 'Phục vụ nhanh như chớp, 10 điểm không có nhưng!', 'Chill phết, giá hạt dẻ, chủ dễ thương xỉu.', 'Quán ruột từ nay nha, ai chưa thử là thiệt thòi.'],
  4: ['Ổn áp đấy, mỗi tội hơi đông chờ xíu.', 'Ngon nha, lần sau quay lại chấm 5 sao.', 'Được của ló, chủ vui tính, chỉ thiếu chỗ ngồi.'],
  3: ['Cũng tạm, không có gì để chê mà cũng chẳng để mê.', 'Bình thường thôi, đi ngang thì ghé.', 'Không tệ, nhưng chờ hơi lâu nha chủ ơi.'],
  2: ['Chờ mỏi cả râu, thôi đi quán khác cho lành.', 'Hơi xu, mong quán cố gắng hơn.', 'Đến nơi thì hết hàng, toang thật sự.'],
  1: ['Đợi mòn mỏi không ai ngó, một sao là còn nể lắm đó.', 'Ét o ét, đi quán này là xác định nhịn đói về.', 'U là trời, vừa chậm vừa hết hàng, bye bye.'],
  nv: ['Chủ khó như giải đố, ai sắp vào làm thì nhớ mang theo tinh thần thép.', 'Làm quần quật mà mặt chủ lúc nào cũng hãm, anh em cẩn thận nha.', 'Công thì bé tí mà việc thì to đùng, né gấp còn kịp.', 'Bị chửi suốt, chủ keo kiệt bủn xỉn, người sau tự lo thân nhé.', 'Chủ nói một đằng làm một nẻo, vào làm nhớ ghi âm… à nhầm, ghi sổ cẩn thận.']
};
const c4RvLocal = x => c4RvPick(x.k === 'nv' ? C4_RV_LOCAL.nv : (C4_RV_LOCAL[x.s] || C4_RV_LOCAL[3]));
function c4RvPut(x, t) {
  const R = SAVE4.rv || (SAVE4.rv = {}), L = R[x.sid] || (R[x.sid] = []);
  L.unshift({ d: x.d, k: x.k, s: x.s, who: x.who, why: x.why, t: t || c4RvLocal(x) }); if (L.length > C4_RV_KEEP) L.length = C4_RV_KEEP;
}
const c4RvDev = () => { try { let d = localStorage.getItem('dcc_wkdev'); if (!d) { d = (SAVE4.oid || '') + Math.random().toString(36).slice(2, 10); localStorage.setItem('dcc_wkdev', d); } return d; } catch (e) { return 'x' + (SAVE4.oid || ''); } };
// send up to six waiting reviews; anything the Worker cannot write gets the game's own line
async function c4RvFlush() {
  const Q = SAVE4 && SAVE4.rvq; if (C4RV.busy || !Q || !Q.length) return;
  const batch = Q.slice(0, 6);
  let texts = null;
  if (C4RV.off !== String(SAVE4.day)) {
    C4RV.busy = true;
    try {
      const r = await fetch(C4_RV_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: c4RvDev(), items: batch.map(x => ({ k: x.k, s: x.s, shop: c4RvShopName(x.sid), ware: x.ware, who: x.who, why: x.why })) }) });
      const j = await r.json().catch(() => ({})); if (r.ok && Array.isArray(j.texts)) texts = j.texts; else if (j.error === 'limit' || j.error === 'busy' || j.error === 'nokey') C4RV.off = String(SAVE4.day);
    } catch (e) {}
    C4RV.busy = false;
  }
  SAVE4.rvq = (SAVE4.rvq || []).filter(x => !batch.includes(x));
  batch.forEach((x, i) => c4RvPut(x, texts && texts[i]));
  persist4(); c4RvRefresh();
}
// in chương IV (village or town) the queue is sent every few seconds
setInterval(() => { if (typeof S !== 'undefined' && /^c4b?play$/.test(S.mode) && SAVE4 && SAVE4.rvq && SAVE4.rvq.length) c4RvFlush(); }, 6000);

/* ---------- the tab ---------- */
const c4RvStars = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
const c4RvEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function c4RvHtml(sid) {
  const L = c4RvList(sid), avg = c4RvAvg(sid), nk = L.filter(r => r.k === 'kh').length, wait = (SAVE4.rvq || []).filter(x => x.sid === sid).length;
  let h = `<div class="rvhead">${avg === null ? '<b>Chưa có sao</b>' : `<span class="rvst">${c4RvStars(Math.round(avg))}</span> <b>${avg.toFixed(1).replace('.', ',')}</b>`} <small>· ${nk} khách chấm${L.length - nk ? ` · ${L.length - nk} người làm cũ` : ''}</small></div>`;
  if (wait) h += `<p class="sm rvwait">Có ${wait} nhận xét đang được viết…</p>`;
  if (!L.length) return h + '<p class="sm">Chưa ai nhận xét quán này.</p>';
  return h + '<div class="rvl">' + L.map(r => `<div class="rvi${r.k === 'nv' ? ' nv' : ''}"><div class="rvt"><span class="rvst">${c4RvStars(r.s)}</span> <b>${c4RvEsc(r.who)}</b> <small>${r.k === 'nv' ? 'người làm cũ' : 'khách'} · ngày ${r.d}</small></div><p>${c4RvEsc(r.t)}</p></div>`).join('') + '</div>';
}
function c4RvBlock(sid) { const d = document.createElement('div'); d.className = 'rvw'; d.dataset.sid = sid; d.innerHTML = c4RvHtml(sid); return d; }
function c4RvRefresh() { document.querySelectorAll('.rvw').forEach(d => { d.innerHTML = c4RvHtml(d.dataset.sid); }); document.querySelectorAll('.uptabs [data-ut="r"]').forEach(b => { b.textContent = c4RvTabName(b.dataset.sid); }); }
const c4RvTabName = sid => { const a = c4RvAvg(sid); return a === null ? 'Đánh giá' : `Đánh giá ★${a.toFixed(1).replace('.', ',')}`; };
// the tab bar: Hàng quán | Mời khách (when there is anyone to invite) | Đánh giá
function c4RvBar(body, sid, label, treat, sheetEl, store, onSet) {
  const n = treat ? treat.querySelectorAll('.tr').length : 0, bar = document.createElement('div'); bar.className = 'uptabs';
  bar.innerHTML = `<button type="button" data-ut="q">${label}</button>` + (treat && treat.children.length ? `<button type="button" data-ut="m">Mời khách${n ? ' (' + n + ')' : ''}</button>` : '') + `<button type="button" data-ut="r" data-sid="${sid}">${c4RvTabName(sid)}</button>`;
  body.prepend(bar);
  { const blk = c4RvBlock(sid), last = body.lastElementChild; if (last && last.classList.contains('row') && last !== bar) body.insertBefore(blk, last); else body.appendChild(blk); }   // before the sheet's closing row (it must stay last)
  if (treat) { const h = treat.querySelector('.trh'), b = treat.querySelector('.trb'); if (h) h.hidden = true; if (b) b.hidden = false; }
  const set = t => { if (t === 'm' && !(treat && treat.children.length)) t = 'q'; store.upTab = t; sheetEl.classList.toggle('tab-moi', t === 'm'); sheetEl.classList.toggle('tab-rv', t === 'r'); bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.ut === t)); if (onSet) onSet(t); };
  bar.querySelectorAll('button').forEach(x => x.addEventListener('click', e => { e.stopPropagation(); AU.tap(); set(x.dataset.ut); }));
  return set;
}
// the village stall sheet (replaces cho.js c4UpTabs)
c4UpTabs = function () {
  const box = $('#c4upO'), g = C4.upG || 'trau'; if (!box) return;
  const set = c4RvBar(box, 'lang:' + g, 'Hàng quán', box.querySelector('.treat'), $('#c4up'), C4);
  set(C4.keepTab ? C4.upTab || 'q' : 'q'); C4.keepTab = false;
};
// the town's betel house and shops (replaces khachquen.js p4Tabs)
p4Tabs = function (sheetId, body, treat, label) {
  const sid = sheetId === 'p4home' ? 'pho:trau' : 'pho:' + ((P4.shopSel && P4.shopSel.key) || '');
  const set = c4RvBar(body, sid, label, treat, $('#' + sheetId), P4);
  set(P4.keepTab || P4.sheet === sheetId ? P4.upTab || 'q' : 'q'); P4.keepTab = false;
};
{ const cs0 = c4Sheets; c4Sheets = function (id) { const up = $('#c4up'); if (up) up.classList.remove('tab-rv'); return cs0.apply(this, arguments); }; }

/* ---------- what happens → reviews ---------- */
{ const s0 = c4Served; c4Served = function (w) { const r = s0.apply(this, arguments); try { if (w && w.shop && !w.treat && w.net === undefined && w.pid !== undefined) c4RvCustomer('lang:' + w.shop, w.name, w.wait || 0, C4_GOODS[w.shop] && C4_GOODS[w.shop].name); } catch (e) {} return r; }; }
{ const s0 = c4Snubbed; c4Snubbed = function (w, empty) { const r = s0.apply(this, arguments); try { if (w && w.shop) c4RvGiveUp('lang:' + w.shop, w.name, empty, C4_GOODS[w.shop] && C4_GOODS[w.shop].name); } catch (e) {} return r; }; }
{ const s0 = p4Served; p4Served = function (w, kind) { const r = s0.apply(this, arguments); try { if (w && !w.treat && w.net === undefined) c4RvCustomer(kind === 'trau' || kind === 'home' ? 'pho:trau' : 'pho:' + kind, w.name, w.wait || 0, ''); } catch (e) {} return r; }; }
{ const s0 = p4Walkout; p4Walkout = function (w) { const r = s0.apply(this, arguments); try { if (w && w.food !== undefined) c4RvGiveUp('pho:' + w.food, w.name, false, ''); } catch (e) {} return r; }; }
// the evening: who left, and why (from the tally's own lines)
const c4RvWhy = (txt, name) => { const i = txt.indexOf(name), s = i < 0 ? '' : txt.slice(i, i + 160); return /ôm|biến mất/.test(s) ? 'om' : /không được trả|hai hôm/.test(s) ? 'no' : 'bo'; };
{ const p0 = c4PayHands; c4PayHands = function (d, quits) {
    const before = {}; for (const g of c4Owned()) before[g] = c4Hands(g).slice();
    const r = p0.apply(this, arguments);
    try { const txt = (quits || []).join(' · '); for (const g in before) for (const h of before[g]) if (!c4Hands(g).includes(h)) c4RvStaff('lang:' + g, h.name, c4RvWhy(txt, h.name)); } catch (e) {}
    return r; }; }
{ const p0 = p4PayHands; p4PayHands = function () {
    const S = p4Shops(), snap = [];
    for (const key in S) for (const h of p4ShopHands(S[key])) snap.push({ sid: 'pho:' + key, name: h.name, h });
    for (const h of p4Hands()) snap.push({ sid: 'pho:trau', name: h.name, h, betel: true });
    const kn = {}; for (const key in S) kn[key] = S[key].kn;
    const r = p0.apply(this, arguments);
    try {
      const txt = String(r || '');
      for (const key in kn) if (S[key] && S[key].kn !== kn[key] && kn[key]) c4RvStaff('pho:' + key, kn[key], c4RvWhy(txt, kn[key]));
      for (const x of snap) if (x.h && !(x.betel ? p4Hands() : (S[x.sid.slice(4)] ? p4ShopHands(S[x.sid.slice(4)]) : [])).includes(x.h)) c4RvStaff(x.sid, x.name, c4RvWhy(txt, x.name));
    } catch (e) {}
    return r; }; }

/* ---------- the stars bring people (hidden) ---------- */
{ const w0 = c4Want; c4Want = function (g) { return w0.apply(this, arguments) * c4RvK('lang:' + g); }; }
{ const r0 = p4ShopRate; p4ShopRate = function (R, key) { return r0.apply(this, arguments) * c4RvK('pho:' + key); }; }
// a sheet drawn without the tab bar (the shop's other tabs) must not keep a tab's hiding class
{ const s0 = p4ShopSheet; p4ShopSheet = function () { const e = $('#p4shop'); if (e) e.classList.remove('tab-rv', 'tab-moi'); return s0.apply(this, arguments); }; }
{ const s0 = p4HomeDraw; p4HomeDraw = function () { const e = $('#p4home'); if (e) e.classList.remove('tab-rv', 'tab-moi'); return s0.apply(this, arguments); }; }
