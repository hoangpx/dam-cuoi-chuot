/* Chương IV phần 2 · Phố Huyện: shared flower lanterns (owner, 2026-10-15: "lời chúc trong đèn sẽ được ghi lên server, mỗi lời chúc là
   một đèn trôi trên sông, người chơi khác nhìn thấy và đọc được khi click vào"). A wish set afloat goes to Supabase (the project of the
   cloud save; table dcc_hoadang, only through the rpc dcc_hoa_add / dcc_hoa_list / dcc_hoa_report, docs/supabase-hoa-dang.sql). In the
   town the latest P4_HOA_NET wishes of everyone come down and each drifts on the river as a lantern of its own at night; a tap reads it
   (signed with the sender's shop name) and can report it (3 reports hide it). Bad words are refused here and again on the server. */
const P4_HOA_NET = 250, P4_HOA_RELOAD = 900;                                // how many shared lanterns, how often to fetch them again (s; was 120, owner 2026-10-17: fewer requests)
let P4_HOA_AT = 0;                                                           // when they were last fetched (Date.now, kept across visits to the town)
const P4_RPC = 'https://mamafzllyhbmzyystivo.supabase.co/rest/v1/rpc/', P4_RPC_KEY = 'sb_publishable_aY82m4E4mmc0AN2_n0Gcdw_2Kl31gCd';   // the same public key as js/core/cloud.js
async function p4Rpc(fn, body) {
  const r = await fetch(P4_RPC + fn, { method: 'POST', headers: { apikey: P4_RPC_KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { let m = ''; try { m = (await r.json()).message || ''; } catch (e) {} throw new Error(m || 'rpc ' + r.status); }
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
// the same list as the server's dcc_hoa_bad (keep the two alike)
const p4HoaBad = s => { const t = (s || '').toLowerCase(); return /(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)/.test(t + ' ') || /(^|[^\p{L}])(đm|dm|đcm|dcm|đmm|dmm|vcl|vkl|vl|clm|cmm|cc|cl)(?=$|[^\p{L}])/u.test(t); };
const p4Device = () => { let d = ''; try { d = localStorage.getItem('dcc.dev') || ''; } catch (e) {} if (!/^[a-z0-9]{12,40}$/.test(d)) { d = Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[(Math.random() * 36) | 0]).join(''); try { localStorage.setItem('dcc.dev', d); } catch (e) {} } return d; };
const p4Reported = () => { try { return new Set(JSON.parse(localStorage.getItem('dcc.hoaRep') || '[]')); } catch (e) { return new Set(); } };
// send a wish when its lantern is set down
function p4HoaSend(h) {
  P4.sent = P4.sent || new Set();
  p4Rpc('dcc_hoa_add', { p_wish: h.wish, p_shop: p4HoaFrom(), p_device: p4Device() })
    .then(id => { if (id) { P4.sent.add(id); h.netId = id; } })
    .catch(e => { if (/bad words/.test(e.message)) toast('Lời chúc có chữ không đẹp nên không trôi tới người khác.', 3); });
}
// fetch everyone's latest wishes (now, and again every few minutes while in the town)
function p4HoaLoad() {
  P4.hoaLoadT = P4.t; P4_HOA_AT = Date.now();
  p4Rpc('dcc_hoa_list', { p_limit: P4_HOA_NET }).then(list => {
    if (!Array.isArray(list)) return;
    const rep = p4Reported();
    P4.shared = list.filter(w => w && w.wish && !rep.has(w.id)).map(w => ({ id: w.id, wish: w.wish, shop: w.shop || '', t: w.created_at }));
  }).catch(() => {});
}
// the real wishes to put on the river's lanterns (art.js p4HoaDang gives each a lantern by P4_HOA_RANK, the rest keep villagers'
// wishes); your own, still drifting where you set it down, is left out so it is not there twice
function p4HoaReal() {
  const L = P4.shared; if (!L || !L.length) return [];
  const sent = P4.sent; if (!sent || !sent.size) return L;
  const alive = new Set((P4.hoaMine || []).map(h => h.netId).filter(Boolean));
  return L.filter(w => !(sent.has(w.id) && alive.has(w.id)));
}
// reading a lantern's wish: a little letter of the lantern festival: warm paper in a red double frame, the lotus of that lantern
// glowing over its top, the words in a hand, who set it afloat and when; everyone's can be reported (a small link, not a button)
const P4_LOTUS_IMG = {};
const p4LotusImg = c => { if (P4_LOTUS_IMG[c]) return P4_LOTUS_IMG[c]; const [c1, c2] = P4_HOA_COLS[c % P4_HOA_COLS.length]; return (P4_LOTUS_IMG[c] = p4HoaSprite(c1, c2).toDataURL()); };
function p4WishCard(w) {
  const c = w.c ?? (w.id || 0) % P4_HOA_COLS.length;
  let when = '';
  if (w.t) { const days = Math.floor((Date.now() - new Date(w.t)) / 864e5); when = days <= 0 ? 'thả hôm nay' : days === 1 ? 'thả hôm qua' : 'thả ' + days + ' ngày trước'; }
  else if (w.mine) when = 'đèn của mình'; else if (w.village) when = 'người trong phố';
  $('#p4wishB').innerHTML = `<div class="lotus"><img src="${p4LotusImg(c)}" alt=""></div>
    <div class="kicker">Lời chúc trên đèn hoa đăng</div><div class="p4rule"><span></span><em>❀</em><span></span></div>
    <p class="wish">${p4Esc(w.wish)}</p>
    <p class="from">${p4Esc(w.shop || 'một hiệu trên phố')}</p><p class="when">${when}</p>`;
  const rep = $('#p4wishRep'); rep.hidden = !w.id;
  rep.onclick = () => {
    const R = p4Reported(); R.add(w.id); try { localStorage.setItem('dcc.hoaRep', JSON.stringify([...R].slice(-300))); } catch (e) {}
    p4Rpc('dcc_hoa_report', { p_id: w.id }).catch(() => {});
    P4.shared = (P4.shared || []).filter(x => x.id !== w.id); p4Sheets(null); toast('Đã báo. Cảm ơn bạn.', 2);
  };
  p4Sheets('p4wish');
}
{
  const d = document.createElement('div'); d.id = 'p4wish'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4 wishcard"><div id="p4wishB"></div><div class="foot"><button class="link" id="p4wishRep">Báo lời chúc xấu</button><button class="btn" id="p4wishX">Đóng</button></div></div>';
  document.body.appendChild(d);
  $('#p4wishX').addEventListener('click', () => p4Sheets(null));
  d.addEventListener('click', e => { if (e.target === d) p4Sheets(null); });   // a tap on the night around it closes it too
}
