/* Lưu tiến trình trên mạng (owner): a short save code, no account. Everything the game keeps in localStorage under
   'dcc.' goes up to Supabase (table dcc_saves, only through the rpc dcc_save / dcc_load, see
   docs/supabase-luu-tien-trinh.sql) a few seconds after each change, once the player has made a code. On another device
   the player types the code in: that progress replaces this device's and the page reloads, and both devices then keep
   saving to the same code. Counted in GoatCounter as luu/mo, luu/tao, luu/tai. */
const CLOUD = { url: 'https://mamafzllyhbmzyystivo.supabase.co/rest/v1/rpc/', key: 'sb_publishable_aY82m4E4mmc0AN2_n0Gcdw_2Kl31gCd',
  abc: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', skip: ['dcc.cloud', 'dcc.cloudT', 'dcc.instLater'], timer: 0, busy: false };
const cloudGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const cloudCode = () => cloudGet('dcc.cloud');
const cloudShow = c => 'CHUOT-' + c.slice(0, 4) + '-' + c.slice(4);
// what the player typed → the 8 characters (any case, with or without CHUOT- and dashes; codes never use I, L, O, 0, 1)
const cloudParse = s => { s = String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^CHUOT/, ''); return /^[A-Z2-9]{8}$/.test(s) ? s : null; };
function cloudSnapshot() {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('dcc.') && !CLOUD.skip.includes(k)) out[k] = localStorage.getItem(k); } } catch (e) {}
  return out;
}
async function cloudRpc(fn, body, keepalive) {
  const r = await fetch(CLOUD.url + fn, { method: 'POST', keepalive: !!keepalive, headers: { apikey: CLOUD.key, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('rpc ' + r.status);
  return r.json();
}
async function cloudPush(keepalive) {
  const code = cloudCode(); if (!code) return false;
  clearTimeout(CLOUD.timer); CLOUD.timer = 0;
  try { await cloudRpc('dcc_save', { p_code: code, p_data: cloudSnapshot() }, keepalive); localStorage.setItem('dcc.cloudT', String(Date.now())); cloudStatus(); return true; }
  catch (e) { cloudStatus('Chưa lưu được lên mạng (mất kết nối?). Game sẽ thử lại lần sau.'); return false; }
}
// every save the game makes on this device goes up a few seconds later (a whole run of saves makes one trip)
{
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    set.call(this, k, v);
    if (this === window.localStorage && typeof k === 'string' && k.startsWith('dcc.') && !CLOUD.skip.includes(k) && cloudCode()) { clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(() => cloudPush(), 4000); }
  };
  addEventListener('visibilitychange', () => { if (document.hidden && CLOUD.timer) cloudPush(true); });   // leaving with a save still waiting
}
function cloudStatus(msg) {
  const st = $('#cloudSt'); if (!st) return;
  if (msg) { st.textContent = msg; return; }
  const t = +cloudGet('dcc.cloudT') || 0;
  st.textContent = t ? 'Đã lưu lên mạng lúc ' + new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ngày ' + new Date(t).toLocaleDateString('vi-VN') + '.' : '';
}
function cloudRender() {
  const code = cloudCode();
  $('#cloudHave').hidden = !code; $('#bCloudMake').hidden = !!code; $('#cloudIntro').hidden = !!code;
  if (code) $('#cloudCode').textContent = cloudShow(code);
  cloudStatus(); $('#cloudMsg').textContent = '';
}
$('#bCloud').addEventListener('click', () => { trackSend('luu/mo'); cloudRender(); $('#cloud').hidden = false; });
$('#bCloudClose').addEventListener('click', () => { $('#cloud').hidden = true; });
$('#cloud').addEventListener('click', e => { if (e.target.id === 'cloud') $('#cloud').hidden = true; });
$('#bCloudMake').addEventListener('click', async e => {
  const b = e.currentTarget; b.disabled = true;
  const a = new Uint32Array(8); crypto.getRandomValues(a);
  const code = Array.from(a, v => CLOUD.abc[v % CLOUD.abc.length]).join('');
  try { localStorage.setItem('dcc.cloud', code); } catch (er) {}
  if (await cloudPush()) { trackSend('luu/tao'); cloudRender(); }
  else { try { localStorage.removeItem('dcc.cloud'); } catch (er) {} $('#cloudMsg').textContent = 'Không kết nối được, bạn thử lại sau nhé.'; }
  b.disabled = false;
});
$('#bCloudCopy').addEventListener('click', async e => {
  const b = e.currentTarget, was = b.textContent;
  try { await navigator.clipboard.writeText(cloudShow(cloudCode())); b.textContent = 'Đã chép mã'; } catch (er) { b.textContent = cloudShow(cloudCode()); }
  setTimeout(() => { b.textContent = was; }, 1800);
});
$('#bCloudLoad').addEventListener('click', async e => {
  const msg = $('#cloudMsg'), code = cloudParse($('#cloudIn').value);
  if (!code) { msg.textContent = 'Mã chưa đúng: mã có dạng CHUOT-XXXX-XXXX.'; return; }
  if (code === cloudCode()) { msg.textContent = 'Đây là mã của chính máy này rồi.'; return; }
  const b = e.currentTarget; b.disabled = true; msg.textContent = 'Đang tìm…';
  let got = null;
  try { got = await cloudRpc('dcc_load', { p_code: code }); } catch (er) { msg.textContent = 'Không kết nối được, bạn thử lại sau nhé.'; b.disabled = false; return; }
  b.disabled = false;
  if (!got || !got.data) { msg.textContent = 'Không tìm thấy mã này. Bạn xem lại từng chữ nhé.'; return; }
  if (!confirm('Tiến trình trên máy này sẽ được thay bằng tiến trình của mã ' + cloudShow(code) + '. Tiếp tục?')) { msg.textContent = ''; return; }
  try {
    for (const k of Object.keys(cloudSnapshot())) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(got.data)) if (k.startsWith('dcc.') && !CLOUD.skip.includes(k) && typeof v === 'string') localStorage.setItem(k, v);
    localStorage.setItem('dcc.cloud', code); localStorage.setItem('dcc.cloudT', String(Date.parse(got.t) || Date.now()));
  } catch (er) { msg.textContent = 'Máy này không cho lưu dữ liệu (chế độ ẩn danh?).'; return; }
  clearTimeout(CLOUD.timer); CLOUD.timer = 0;
  trackSend('luu/tai'); location.reload();
});
