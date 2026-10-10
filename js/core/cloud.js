/* Lưu tiến trình trên mạng (owner): a short save code, no account. Everything the game keeps in localStorage under
   'dcc.' goes up to Supabase (table dcc_saves, only through the rpc dcc_save / dcc_load, see
   docs/supabase-luu-tien-trinh.sql) a few seconds after each change, once the player has made a code. On another device
   the player types the code in: that progress replaces this device's and the page reloads, and both devices then keep
   saving to the same code. Counted in GoatCounter as luu/mo, luu/tao, luu/tai.
   Syncing two devices (a player's report: each kept its own checkpoint under one code, and the one saved last was
   overwritten by the stale one): every key records when it last changed on this device (dcc.mt). On opening the game, on
   coming back to the tab, before the first save of a session and on the "Cập nhật" button, the cloud copy is read and
   merged key by key: whatever is newer wins (cloudDiff), so progress made on either device survives. Newer cloud keys are
   applied and the page reloads; mid-play the player is asked first. A stale device never overwrites the cloud blindly. */
const CLOUD = { url: 'https://mamafzllyhbmzyystivo.supabase.co/rest/v1/rpc/', key: 'sb_publishable_aY82m4E4mmc0AN2_n0Gcdw_2Kl31gCd',
  abc: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', skip: ['dcc.cloud', 'dcc.cloudT', 'dcc.instLater', 'dcc.lang'], timer: 0, busy: false, checked: false, lastCheck: 0 };
const CLOUD_MT = 'dcc.mt';
const cloudMtGet = () => { try { return JSON.parse(cloudGet(CLOUD_MT) || '{}') || {}; } catch (e) { return {}; } };
const cloudRaw = Storage.prototype.setItem;   // writes that must not count as a change made on this device
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
// what differs between the cloud copy and this device, key by key: 'newer' = the cloud's version is newer (take it),
// 'older' = ours is newer or only here (keep it, it goes up). A key with no recorded time counts as changed when the
// copy holding it was last synced (cloud: its server time; here: dcc.cloudT).
function cloudDiff(got) {
  const cd = got.data || {}, local = cloudSnapshot(), lm = cloudMtGet(), tc = Date.parse(got.t) || 0, ts = +cloudGet('dcc.cloudT') || 0;
  let cm = {}; try { cm = JSON.parse(cd[CLOUD_MT] || '{}') || {}; } catch (e) {}
  const newer = [], older = [];
  for (const k of new Set([...Object.keys(cd), ...Object.keys(local)])) {
    if (k === CLOUD_MT || CLOUD.skip.includes(k) || !k.startsWith('dcc.')) continue;
    const inC = typeof cd[k] === 'string', inL = k in local;
    if (inC && inL && cd[k] === local[k]) continue;
    const c = inC ? (cm[k] ?? tc) : -1, l = inL ? (lm[k] ?? ts) : -1;
    (c > l ? newer : older).push(k);
  }
  return { newer, older, cd, cm };
}
function cloudApply(d) {
  const lm = cloudMtGet();
  for (const k of d.newer) { if (typeof d.cd[k] === 'string') { cloudRaw.call(localStorage, k, d.cd[k]); lm[k] = d.cm[k] ?? Date.now(); } }
  cloudRaw.call(localStorage, CLOUD_MT, JSON.stringify(lm)); cloudRaw.call(localStorage, 'dcc.cloudT', String(Date.now()));
}
// read the cloud copy and bring this device level with it. mode: 'load' (page just opened: reload quietly), 'manual',
// 'focus' / 'push' (maybe mid-play: ask first). Returns 'none' | 'reloading' | 'kept' | 'ahead' | 'same' | 'offline'.
async function cloudSync(mode) {
  const code = cloudCode(); if (!code) return 'none';
  let got; try { got = await cloudRpc('dcc_load', { p_code: code }); } catch (e) { return 'offline'; }
  CLOUD.checked = true; CLOUD.lastCheck = Date.now();
  if (!got || !got.data) return 'ahead';
  const d = cloudDiff(got);
  if (!d.newer.length) return d.older.length ? 'ahead' : 'same';
  const quiet = mode === 'load' || mode === 'manual' || ['chapters', 'album', 'title'].includes(S.mode);
  if (!quiet && !confirm(lg('Máy khác vừa lưu tiến trình mới hơn. Bấm OK để lấy tiến trình đó về máy này (trang sẽ tải lại). Bấm Huỷ để giữ tiến trình của máy này và ghi đè lên mạng.', 'Another device has saved newer progress. OK takes that progress onto this device (the page reloads). Cancel keeps this device\'s progress and overwrites the online copy.'))) { CLOUD.checked = true; return 'kept'; }
  cloudApply(d);
  clearTimeout(CLOUD.timer); CLOUD.timer = 0;
  try { await cloudRpc('dcc_save', { p_code: code, p_data: cloudSnapshot() }); } catch (e) {}   // the merged result (our newer keys too)
  try { sessionStorage.setItem('dcc.synced', '1'); } catch (e) {}
  location.reload(); return 'reloading';
}
async function cloudPush(keepalive) {
  const code = cloudCode(); if (!code) return false;
  clearTimeout(CLOUD.timer); CLOUD.timer = 0;
  if (!CLOUD.checked && !keepalive) { const r = await cloudSync('push'); if (r === 'reloading') return false; }   // never put a stale copy over a newer one
  try { await cloudRpc('dcc_save', { p_code: code, p_data: cloudSnapshot() }, keepalive); localStorage.setItem('dcc.cloudT', String(Date.now())); cloudStatus(); return true; }
  catch (e) { cloudStatus(lg('Chưa lưu được lên mạng (mất kết nối?). Game sẽ thử lại lần sau.', 'Could not save online (no connection?). The game will try again later.')); return false; }
}
// every save the game makes on this device goes up a few seconds later (a whole run of saves makes one trip)
{
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    let was;
    const tracked = this === window.localStorage && typeof k === 'string' && k.startsWith('dcc.') && k !== CLOUD_MT && !CLOUD.skip.includes(k);
    if (tracked) { try { was = this.getItem(k); } catch (e) {} }
    set.call(this, k, v);
    if (tracked && was !== String(v)) { const m = cloudMtGet(); m[k] = Date.now(); set.call(this, CLOUD_MT, JSON.stringify(m)); }   // when this key last changed here
    if (this === window.localStorage && typeof k === 'string' && k.startsWith('dcc.') && !CLOUD.skip.includes(k) && cloudCode()) { clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(() => cloudPush(), 4000); }
  };
  addEventListener('visibilitychange', () => {
    if (document.hidden) { if (CLOUD.timer) cloudPush(true); return; }                                          // leaving with a save still waiting
    if (cloudCode() && Date.now() - CLOUD.lastCheck > 30000) cloudSync('focus');                                // back again: has the other device moved on?
  });
}
function cloudStatus(msg) {
  const st = $('#cloudSt'); if (!st) return;
  if (msg) { st.textContent = msg; return; }
  const t = +cloudGet('dcc.cloudT') || 0;
  st.textContent = t ? lg('Đã lưu lên mạng lúc ', 'Saved online at ') + new Date(t).toLocaleTimeString(LANG_LOCALE, { hour: '2-digit', minute: '2-digit' }) + lg(' ngày ', ', ') + new Date(t).toLocaleDateString(LANG_LOCALE) + '.' : '';
}
$('#bCloudSync') && $('#bCloudSync').addEventListener('click', async e => {
  const b = e.currentTarget, msg = $('#cloudMsg'); b.disabled = true; msg.textContent = lg('Đang so với bản trên mạng…', 'Comparing with the online copy…');
  const r = await cloudSync('manual'); b.disabled = false;
  if (r === 'offline') msg.textContent = lg('Không kết nối được, bạn thử lại sau nhé.', 'Could not connect. Please try again later.');
  else if (r === 'ahead') { await cloudPush(); msg.textContent = lg('Tiến trình máy này mới hơn hoặc bằng bản trên mạng, đã lưu lên mạng.', 'This device is at least as far on as the online copy; it has been saved online.'); }
  else if (r === 'same') msg.textContent = lg('Hai bên đã giống nhau.', 'Both are already the same.');
});
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
  else { try { localStorage.removeItem('dcc.cloud'); } catch (er) {} $('#cloudMsg').textContent = lg('Không kết nối được, bạn thử lại sau nhé.', 'Could not connect. Please try again later.'); }
  b.disabled = false;
});
$('#bCloudCopy').addEventListener('click', async e => {
  const b = e.currentTarget, was = b.textContent;
  try { await navigator.clipboard.writeText(cloudShow(cloudCode())); b.textContent = lg('Đã chép mã', 'Code copied'); } catch (er) { b.textContent = cloudShow(cloudCode()); }
  setTimeout(() => { b.textContent = was; }, 1800);
});
$('#bCloudLoad').addEventListener('click', async e => {
  const msg = $('#cloudMsg'), code = cloudParse($('#cloudIn').value);
  if (!code) { msg.textContent = lg('Mã chưa đúng: mã có dạng CHUOT-XXXX-XXXX.', 'That code does not look right: it reads CHUOT-XXXX-XXXX.'); return; }
  if (code === cloudCode()) { msg.textContent = lg('Đây là mã của máy này rồi: bấm "Cập nhật từ mạng" ở trên để lấy tiến trình mới nhất.', 'That is this device\'s own code: use "Update from online" above to get the latest progress.'); return; }
  const b = e.currentTarget; b.disabled = true; msg.textContent = lg('Đang tìm…', 'Looking…');
  let got = null;
  try { got = await cloudRpc('dcc_load', { p_code: code }); } catch (er) { msg.textContent = lg('Không kết nối được, bạn thử lại sau nhé.', 'Could not connect. Please try again later.'); b.disabled = false; return; }
  b.disabled = false;
  if (!got || !got.data) { msg.textContent = lg('Không tìm thấy mã này. Bạn xem lại từng chữ nhé.', 'No such code. Please check each letter.'); return; }
  if (!confirm(lg('Tiến trình trên máy này sẽ được thay bằng tiến trình của mã ', 'The progress on this device will be replaced by the progress saved under ') + cloudShow(code) + lg('. Tiếp tục?', '. Go on?'))) { msg.textContent = ''; return; }
  try {
    for (const k of Object.keys(cloudSnapshot())) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(got.data)) if (k.startsWith('dcc.') && !CLOUD.skip.includes(k) && typeof v === 'string') localStorage.setItem(k, v);
    localStorage.setItem('dcc.cloud', code); localStorage.setItem('dcc.cloudT', String(Date.parse(got.t) || Date.now()));
  } catch (er) { msg.textContent = lg('Máy này không cho lưu dữ liệu (chế độ ẩn danh?).', 'This browser will not keep data (private mode?).'); return; }
  clearTimeout(CLOUD.timer); CLOUD.timer = 0;
  trackSend('luu/tai'); location.reload();
});
// opening the game with a code: level up with the cloud copy before anything is played; after a reload say so
try { if (sessionStorage.getItem('dcc.synced')) { sessionStorage.removeItem('dcc.synced'); setTimeout(() => toast(lg('Đã cập nhật tiến trình từ máy khác.', 'Progress updated from your other device.'), 3.4), 1500); } } catch (e) {}
if (cloudCode()) setTimeout(() => cloudSync('load'), 1000);
