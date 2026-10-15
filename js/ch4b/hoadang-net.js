/* Chương IV phần 2 · Phố Huyện: shared flower lanterns (owner, 2026-10-15: "lời chúc trong đèn sẽ được ghi lên server, mỗi lời chúc là
   một đèn trôi trên sông, người chơi khác nhìn thấy và đọc được khi click vào"). A wish set afloat goes to Supabase (the project of the
   cloud save; table dcc_hoadang, only through the rpc dcc_hoa_add / dcc_hoa_list / dcc_hoa_report, docs/supabase-hoa-dang.sql). In the
   town the latest P4_HOA_NET wishes of everyone come down and each drifts on the river as a lantern of its own at night; a tap reads it
   (signed with the sender's shop name) and can report it (3 reports hide it). Bad words are refused here and again on the server. */
const P4_HOA_NET = 60, P4_HOA_RELOAD = 120;                                // how many shared lanterns, how often to fetch them again (s)
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
  p4Rpc('dcc_hoa_add', { p_wish: h.wish, p_shop: SAVE4B.name || 'TRẦU CAU', p_device: p4Device() })
    .then(id => { if (id) { P4.sent.add(id); h.netId = id; } })
    .catch(e => { if (/bad words/.test(e.message)) toast('Lời chúc có chữ không đẹp nên không trôi tới người khác.', 3); });
}
// fetch everyone's latest wishes (now, and again every few minutes while in the town)
function p4HoaLoad() {
  P4.hoaLoadT = P4.t;
  p4Rpc('dcc_hoa_list', { p_limit: P4_HOA_NET }).then(list => {
    if (!Array.isArray(list)) return;
    const rep = p4Reported();
    P4.shared = list.filter(w => w && w.wish && !rep.has(w.id)).map(w => ({ id: w.id, wish: w.wish, shop: w.shop || '', t: w.created_at }));
  }).catch(() => {});
}
// each shared wish its own lantern: spread along the river by its id, drifting with the current, round and round the town's length
function p4HoaShared(g, k, x0, x1, yw) {
  const L = P4.shared; if (!L || !L.length) return;
  const span = P4_W + 800, sent = P4.sent || new Set(), alive = new Set((P4.hoaMine || []).map(h => h.netId).filter(Boolean));
  for (const w of L) {
    if (sent.has(w.id) && alive.has(w.id)) continue;                      // your own, still drifting as you set it down
    const r = mulberry(w.id * 7919 + 13), x = ((r() * span + P4.t * (5 + r() * 4)) % span) - 400, y = yw + 36 + r() * 120 + Math.sin(P4.t * 1.5 + w.id) * 1.6;
    if (x < x0 - 60 || x > x1 + 60) continue;
    const s = .75 + (y - yw) / 400, [c1, c2] = P4_HOA_COLS[w.id % P4_HOA_COLS.length];
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = k;
    g.drawImage(p4HoaSprite(c1, c2), -20, -22, 40, 30);
    P4.hoaHits.push({ x, y: y - 6 * s, r: 18 * s, shared: w });
    if (P4.glows) { const T = g.getTransform(), P = new DOMPoint(0, -8).matrixTransform(T), Q = new DOMPoint(0, 6).matrixTransform(T), sc = Math.hypot(T.a, T.b) * k;
      P4.glows.push([P.x, P.y, 30 * sc, '#ffcf7a']); P4.glows.push([Q.x, Q.y, 20 * sc, '#ffcf7a', 1]); }
    g.restore();
  }
}
// reading a shared wish: a card with the words, the sender's shop, the day; it can be reported
function p4WishCard(w) {
  const d = new Date(w.t), days = Math.floor((Date.now() - d) / 864e5);
  $('#p4wishB').innerHTML = `<p class="wish">“${p4Esc(w.wish)}”</p><p class="from">— ${p4Esc(w.shop || 'một hiệu trên phố')}, ${days <= 0 ? 'hôm nay' : days === 1 ? 'hôm qua' : days + ' ngày trước'}</p>`;
  $('#p4wishRep').hidden = false; $('#p4wishRep').onclick = () => {
    const rep = p4Reported(); rep.add(w.id); try { localStorage.setItem('dcc.hoaRep', JSON.stringify([...rep].slice(-300))); } catch (e) {}
    p4Rpc('dcc_hoa_report', { p_id: w.id }).catch(() => {});
    P4.shared = (P4.shared || []).filter(x => x.id !== w.id); p4Sheets(null); toast('Đã báo. Cảm ơn bạn.', 2);
  };
  p4Sheets('p4wish');
}
{
  const d = document.createElement('div'); d.id = 'p4wish'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><h3>Lời chúc trên đèn hoa đăng</h3><div id="p4wishB"></div><div class="row"><button class="btn alt" id="p4wishRep">Báo lời chúc xấu</button><button class="btn" id="p4wishX">Đóng</button></div></div>';
  document.body.appendChild(d);
  $('#p4wishX').addEventListener('click', () => p4Sheets(null));
}
