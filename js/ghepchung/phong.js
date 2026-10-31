/* Chương X · Phòng ghép tranh riêng (owner, 2026-10-30): the sheets of the private rooms — make a room (name, password, picture from the device, 100 / 200 / 500 / 1000 pieces),
   ask the password at the door, and the owner's panel (password on or off, throw somebody out, start the picture again, a new picture). They are DOM sheets over the canvas (a file
   chooser and text fields need the real thing), in the paper style of the rename bar. The server side is server/phong-choi/src/jigsawroom.js; the list and the open room are drawn in game.js.
   A person makes ONE room at a time: once it is finished the list offers a new one and the old room stays as it is. */
const JGR_PIECES = [100, 200, 500, 1000], JGR_IMG_KB = 1700;
let JGR_EL = null, JGR_T = 0;
const jgrOpenNow = () => !!JGR_EL;
function jgrClose() { if (JGR_EL) { JGR_EL.remove(); JGR_EL = null; } clearInterval(JGR_T); JGR_T = 0; const c = document.getElementById('jgrConfirm'); if (c) c.remove(); }
const jgrEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const JGR_INK = '#1d1915', JGR_BTN = 'font:inherit;font-size:15px;padding:9px 14px;border:2px solid ' + JGR_INK + ';border-radius:8px;background:#f2ecde;color:' + JGR_INK + ';cursor:pointer;font-weight:700';
const JGR_INP = 'width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:9px 11px;border:2px solid ' + JGR_INK + ';border-radius:6px;background:#fbf6ea;color:' + JGR_INK;
const JGR_RED = 'background:#e9b9ae', JGR_GREEN = 'background:#cfe0b8';
function jgrSheet(html, wire, wide) {
  jgrClose();
  const bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(29,25,21,.5);display:flex;overflow:auto;padding:calc(12px + env(safe-area-inset-top)) 12px 28px;font-family:inherit;-webkit-overflow-scrolling:touch';
  bg.innerHTML = '<div style="margin:auto;width:100%;max-width:' + (wide || 440) + 'px;box-sizing:border-box;background:#f2ecde;border:2px solid ' + JGR_INK + ';border-radius:14px;padding:16px 16px 14px;color:' + JGR_INK + ';box-shadow:0 6px 0 rgba(29,25,21,.35)">' + html + '</div>';
  document.body.appendChild(bg); JGR_EL = bg;
  bg.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') jgrClose(); });
  bg.addEventListener('pointerdown', e => { if (e.target === bg) jgrClose(); });
  wire(bg.firstChild); return bg.firstChild;
}
function jgrConfirm(text, okLabel, fn) {
  const old = document.getElementById('jgrConfirm'); if (old) old.remove();
  const el = document.createElement('div'); el.id = 'jgrConfirm';
  el.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:70;background:rgba(29,25,21,.55);display:flex;padding:16px;font-family:inherit';
  el.innerHTML = '<div style="margin:auto;max-width:360px;width:100%;box-sizing:border-box;background:#f2ecde;border:2px solid ' + JGR_INK + ';border-radius:14px;padding:18px;color:' + JGR_INK + '"><div style="font-size:16px;font-weight:700;line-height:1.4;margin-bottom:14px">' + jgrEsc(text) + '</div><div style="display:flex;gap:10px;justify-content:flex-end"><button id="jgrNo" style="' + JGR_BTN + '">' + lg('Thôi', 'Cancel') + '</button><button id="jgrYes" style="' + JGR_BTN + ';' + JGR_RED + '">' + jgrEsc(okLabel) + '</button></div></div>';
  document.body.appendChild(el);
  el.addEventListener('keydown', e => e.stopPropagation());
  el.querySelector('#jgrNo').addEventListener('click', () => el.remove());
  el.querySelector('#jgrYes').addEventListener('click', () => { el.remove(); fn(); });
}
function jgrGear(g, cx, cy) {   // the owner's button
  g.beginPath(); g.arc(cx, cy, 16, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = HL_INK; g.stroke();
  g.save(); g.translate(cx, cy); g.fillStyle = HL_INK;
  for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.fillRect(-2.2, -10.5, 4.4, 5); }
  g.beginPath(); g.arc(0, 0, 6.8, 0, 6.283); g.fill(); g.beginPath(); g.arc(0, 0, 2.8, 0, 6.283); g.fillStyle = '#f2ecde'; g.fill(); g.restore();
}
const jgGear = jgrGear;

/* ---- the password at the door ---- */
function jgrAskPass(r) {
  jgrSheet('<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + jgrEsc(r.name) + '</div><div style="font-size:13px;opacity:.8;margin-bottom:12px">' + lg('Phòng này có mật khẩu. Hỏi chủ phòng nhé.', 'This room has a password. Ask the owner.') + '</div>' +
    '<input id="jgrPw" type="text" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + lg('Mật khẩu', 'Password') + '" style="' + JGR_INP + '">' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button id="jgrNo" style="' + JGR_BTN + '">' + lg('Thôi', 'Cancel') + '</button><button id="jgrGo" style="' + JGR_BTN + ';' + JGR_GREEN + '">' + lg('Vào phòng', 'Enter') + '</button></div>', p => {
    const inp = p.querySelector('#jgrPw'), go = () => { const v = inp.value.trim(); if (!v) { inp.focus(); return; } jgrClose(); jgOpenRoom(r, v); };
    p.querySelector('#jgrNo').addEventListener('click', jgrClose); p.querySelector('#jgrGo').addEventListener('click', go);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); setTimeout(() => inp.focus(), 50);
  });
}

/* ---- the picture: shrunk here (the server keeps at most 1.9 MB), a small icon for the list ---- */
const jgrCut = (w, h, target) => {   // the same rule as the server (cutFor in jigsawroom.js): the number of pieces shown is the number cut
  const asp = w / h; let best = null;
  for (let cols = 4; cols <= 90; cols++) { const rows = Math.max(2, Math.round(cols / asp)), n = cols * rows; if (n > target) continue; const err = Math.abs(n - target) / target + Math.abs((w / cols) / (h / rows) - 1) * .8; if (!best || err < best.err) best = { cols, rows, err }; }
  return best;
};
const jgrB64 = blob => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).replace(/^data:[^,]*,/, '')); fr.onerror = no; fr.readAsDataURL(blob); });
const jgrJpeg = (cv, q) => new Promise(r => cv.toBlob(r, 'image/jpeg', q));
async function jgrPrep(file) {
  let src, sw, sh;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); sw = src.width; sh = src.height; }
  catch (e) { src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); }); sw = src.naturalWidth; sh = src.naturalHeight; }
  if (Math.min(sw, sh) < 400) throw 'small'; if (Math.max(sw / sh, sh / sw) > 3.2) throw 'ratio';
  let k = Math.min(1, 2400 / Math.max(sw, sh)), blob, W, H;
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  const draw = () => { W = Math.round(sw * k); H = Math.round(sh * k); cv.width = W; cv.height = H; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.drawImage(src, 0, 0, W, H); };
  draw();
  for (let q = .88; ;) { blob = await jgrJpeg(cv, q); if (!blob) throw 'fail'; if (blob.size <= JGR_IMG_KB * 1000) break; if (q > .52) q -= .08; else if (Math.min(W, H) * .85 >= 420) { k *= .85; draw(); q = .8; } else throw 'big'; }
  const tk = 220 / Math.max(W, H), tc = document.createElement('canvas'); tc.width = Math.max(40, Math.round(W * tk)); tc.height = Math.max(40, Math.round(H * tk)); tc.getContext('2d').drawImage(cv, 0, 0, tc.width, tc.height);
  const tb = await jgrJpeg(tc, .72);
  return { w: W, h: H, kb: Math.round(blob.size / 1000), img: await jgrB64(blob), thumb: await jgrB64(tb), prev: tc };
}
const JGR_ERR = () => ({ one: lg('Bạn đang có một phòng chưa ghép xong', 'You have a room that is not finished'), big: lg('Tranh nặng quá, chọn tranh khác nhé', 'That picture is too big, pick another'), size: lg('Tranh quá nhỏ hoặc quá dài, chọn tranh khác', 'The picture is too small or too long, pick another'), pic: lg('Không đọc được tranh này', 'Can not read this picture'), name: lg('Tên phòng cần ít nhất 2 chữ', 'The room needs a name of 2 letters at least'), full: lg('Hiện đã đủ số phòng, thử lại sau nhé', 'There are too many rooms right now, try later'), pieces: lg('Chọn số mảnh', 'Pick the number of pieces') });

/* ---- make a room, or put a new picture into one (mode 'newpic') ---- */
function jgrCreateOpen(mode) {
  const nw = mode === 'newpic', err = JGR_ERR(); let pic = null, pieces = 200, busy = false;
  const html = '<div style="font-size:19px;font-weight:900;margin-bottom:10px">' + (nw ? lg('Đổi sang tranh mới', 'Put in a new picture') : lg('Tạo phòng ghép tranh', 'Make a puzzle room')) + '</div>' +
    (nw ? '' : '<label style="font-size:13px;font-weight:700">' + lg('Tên phòng', 'Room name') + '</label><input id="jgrName" type="text" maxlength="30" autocomplete="off" placeholder="' + lg('Ví dụ: Tranh của nhà mình', 'For example: Our family picture') + '" style="' + JGR_INP + ';margin:4px 0 10px">' +
      '<label style="font-size:13px;font-weight:700">' + lg('Mật khẩu (để trống nếu cho ai cũng vào)', 'Password (leave empty to let anyone in)') + '</label><input id="jgrPw" type="text" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" style="' + JGR_INP + ';margin:4px 0 10px">') +
    '<div style="font-size:13px;font-weight:700;margin-bottom:4px">' + lg('Tranh', 'Picture') + '</div>' +
    '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><button id="jgrFile" style="' + JGR_BTN + '">' + lg('Chọn tranh từ máy', 'Choose a picture') + '</button><span id="jgrInfo" style="font-size:12px;opacity:.8;flex:1"></span></div><input id="jgrFi" type="file" accept="image/*" style="display:none"><div id="jgrPrev" style="margin-bottom:10px"></div>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:6px">' + lg('Số mảnh ghép', 'Number of pieces') + '</div><div id="jgrN" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px"></div><div id="jgrCut" style="font-size:12px;opacity:.8;min-height:16px;margin-bottom:10px"></div>' +
    '<div id="jgrErr" style="color:#a3332a;font-size:13px;font-weight:700;min-height:18px;margin-bottom:6px"></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end"><button id="jgrNo" style="' + JGR_BTN + '">' + lg('Thôi', 'Cancel') + '</button><button id="jgrOk" style="' + JGR_BTN + ';' + JGR_GREEN + '">' + (nw ? lg('Đổi tranh', 'Change picture') : lg('Tạo phòng', 'Make the room')) + '</button></div>';
  jgrSheet(html, p => {
    const $q = s => p.querySelector(s), show = s => { $q('#jgrErr').textContent = s || ''; };
    const paintN = () => {
      $q('#jgrN').innerHTML = JGR_PIECES.map(n => '<button data-n="' + n + '" style="' + JGR_BTN + ';padding:7px 12px;' + (n === pieces ? JGR_GREEN + ';box-shadow:inset 0 0 0 2px ' + JGR_INK : '') + '">' + n + '</button>').join('');
      const c = pic && jgrCut(pic.w, pic.h, pieces); $q('#jgrCut').textContent = c ? lg('Sẽ cắt ' + c.cols + ' × ' + c.rows + ' = ' + c.cols * c.rows + ' mảnh', 'Will be cut ' + c.cols + ' × ' + c.rows + ' = ' + c.cols * c.rows + ' pieces') : '';
    };
    $q('#jgrN').addEventListener('click', e => { const n = +(e.target.dataset && e.target.dataset.n); if (n) { pieces = n; paintN(); } });
    paintN();
    $q('#jgrFile').addEventListener('click', () => $q('#jgrFi').click());
    $q('#jgrFi').addEventListener('change', async () => {
      const f = $q('#jgrFi').files[0]; if (!f) return; show(''); pic = null; $q('#jgrInfo').textContent = lg('Đang xử lý tranh…', 'Preparing the picture…'); $q('#jgrPrev').textContent = '';
      try { pic = await jgrPrep(f); } catch (e) { $q('#jgrInfo').textContent = ''; show(e === 'small' ? lg('Tranh nhỏ quá (cần ít nhất 400 điểm ảnh mỗi cạnh)', 'Too small (at least 400 pixels each side)') : e === 'ratio' ? lg('Tranh dài quá, chọn tranh gần vuông hơn', 'Too long and thin, pick a squarer picture') : lg('Không đọc được tranh này', 'Can not read this picture')); return; }
      $q('#jgrInfo').textContent = pic.w + ' × ' + pic.h + ' · ' + pic.kb + ' KB'; pic.prev.style.cssText = 'max-width:100%;max-height:150px;border:2px solid ' + JGR_INK; $q('#jgrPrev').appendChild(pic.prev); paintN();
    });
    $q('#jgrNo').addEventListener('click', jgrClose);
    const go = async () => {
      if (busy) return; show('');
      const name = nw ? '' : $q('#jgrName').value.replace(/\s+/g, ' ').trim();
      if (!nw && name.length < 2) { show(err.name); return; }
      if (!nw && typeof p4HoaBad === 'function' && p4HoaBad(name)) { show(lg('Tên có chữ không đẹp, chọn tên khác nhé', 'That name has a bad word, pick another')); return; }
      if (!pic) { show(lg('Hãy chọn một tranh', 'Choose a picture first')); return; }
      const send = async () => {
        busy = true; $q('#jgrOk').disabled = true; show(lg('Đang gửi tranh lên…', 'Uploading…'));
        const body = nw ? { dev: p4Device(), act: 'newpic', img: pic.img, thumb: pic.thumb, pieces } : { dev: p4Device(), ownerName: hsName(hsMine()), name, pw: $q('#jgrPw').value.trim(), img: pic.img, thumb: pic.thumb, pieces };
        let r, j = {}; try { r = await fetch(JG_BASE + (nw ? '/jgr/admin?r=' + encodeURIComponent(JG.room.id) : '/jgr/create'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); j = await r.json().catch(() => ({})); } catch (e) { busy = false; $q('#jgrOk').disabled = false; show(lg('Không kết nối được máy chủ', 'Can not reach the server')); return; }
        if (!r.ok || j.error) { busy = false; $q('#jgrOk').disabled = false; show(err[j.error] || lg('Chưa được, thử lại nhé', 'It did not work, try again')); return; }
        jgrClose();
        if (nw) { toast(lg('Đã đổi tranh. Cả phòng sẽ mở lại tranh mới.', 'Picture changed. Everyone will reopen the new one.'), 3); return; }
        toast(lg('Đã tạo phòng!', 'Room made!'), 2.4);
        try { const l = await (await fetch(JG_BASE + '/jgr/list?dev=' + encodeURIComponent(p4Device()))).json(); JG.rooms = l.rooms; JG.roomsMeta = { canCreate: !!l.canCreate, total: l.total }; jgrThumbs(); const room = (l.rooms || []).find(x => x.id === j.id); if (room) jgOpenRoom(room); } catch (e) {}
      };
      if (nw) jgrConfirm(lg('Đổi tranh mới thì tranh đang ghép bị bỏ và mọi người ghép lại từ đầu. Chắc chưa?', 'A new picture drops the one being put together and everybody starts again. Sure?'), lg('Đổi tranh', 'Change'), send); else send();
    };
    $q('#jgrOk').addEventListener('click', go);
    const first = $q('#jgrName'); if (first) setTimeout(() => first.focus(), 50);
  });
}

/* ---- report the picture (three different networks hide it until the admin looks) ---- */
function jgrReportPic() {
  const R = JG.room; if (!R || R.own) return;
  jgrConfirm(lg('Báo cáo tranh này là không phù hợp? Khi có 3 người ở 3 mạng khác nhau báo cáo, tranh sẽ tạm ẩn chờ admin xem.', 'Report this picture as inappropriate? When 3 people on 3 different networks report it, it is hidden until the admin looks.'), lg('Báo cáo', 'Report'), async () => {
    let j = {}; try { const r = await fetch(JG_BASE + '/jgr/report?r=' + encodeURIComponent(R.id), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: p4Device() }) }); j = await r.json().catch(() => ({})); } catch (e) { j = { error: 'net' }; }
    toast(j.ok ? lg('Đã gửi báo cáo. Cảm ơn bạn!', 'Report sent. Thank you!') : j.error === 'dup' ? lg('Bạn (hoặc mạng của bạn) đã báo cáo tranh này rồi', 'You (or your network) already reported this picture') : lg('Chưa gửi được báo cáo', 'Could not send the report'), 2.8);
  });
}

/* ---- the owner's panel ---- */
async function jgrAdmin(act, extra) {
  const r = JG.room; if (!r) return null;
  try { const res = await fetch(JG_BASE + '/jgr/admin?r=' + encodeURIComponent(r.id), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: p4Device(), act, ...extra }) }); const j = await res.json().catch(() => ({})); return res.ok ? j : { error: j.error || 'x' }; }
  catch (e) { return { error: 'net' }; }
}
function jgrManageOpen() {
  const R = JG.room; if (!R || !R.own) return;
  jgrSheet('<div style="font-size:19px;font-weight:900;margin-bottom:2px">' + jgrEsc(R.name) + '</div><div style="font-size:12px;opacity:.75;margin-bottom:12px">' + lg('Bạn là chủ phòng này', 'You own this room') + '</div>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:4px">' + lg('Mật khẩu', 'Password') + '</div><div id="jgrLock" style="font-size:12.5px;margin-bottom:6px"></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px"><input id="jgrPw" type="text" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + lg('Mật khẩu mới', 'New password') + '" style="' + JGR_INP + ';flex:1;min-width:0"><button id="jgrSet" style="' + JGR_BTN + ';' + JGR_GREEN + '">' + lg('Đặt', 'Set') + '</button><button id="jgrDrop" style="' + JGR_BTN + '">' + lg('Bỏ', 'Remove') + '</button></div>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:4px">' + lg('Người trong phòng', 'People in the room') + '</div><div id="jgrPpl" style="margin-bottom:6px"></div><button id="jgrUnk" style="' + JGR_BTN + ';font-size:12.5px;padding:6px 10px;margin-bottom:14px">' + lg('Cho người đã bị mời ra vào lại', 'Let everyone you removed back in') + '</button>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:6px">' + lg('Bức tranh', 'The picture') + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button id="jgrReset" style="' + JGR_BTN + ';' + JGR_RED + '">' + lg('Ghép lại từ đầu', 'Start over') + '</button><button id="jgrNew" style="' + JGR_BTN + '">' + lg('Đổi tranh mới', 'New picture') + '</button><button id="jgrDel" style="' + JGR_BTN + ';' + JGR_RED + '">' + lg('Xóa phòng', 'Delete room') + '</button></div>' +
    '<div style="display:flex;justify-content:flex-end"><button id="jgrNo" style="' + JGR_BTN + '">' + lg('Đóng', 'Close') + '</button></div>', p => {
    const $q = s => p.querySelector(s);
    const lock = () => { $q('#jgrLock').textContent = JG.room && JG.room.locked ? lg('Phòng đang có mật khẩu (bạn vào không cần nhập).', 'The room has a password (you do not need it).') : lg('Phòng đang mở: ai cũng vào được.', 'The room is open: anyone can come in.'); $q('#jgrDrop').style.display = JG.room && JG.room.locked ? '' : 'none'; };
    const ppl = () => {
      const box = $q('#jgrPpl'); if (!box) return; const others = JG.players.filter(q => q.id !== JG.id);
      box.innerHTML = others.length ? others.map(q => '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(29,25,21,.15)"><span style="flex:1;font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + jgrEsc(q.name || '?') + '</span><button data-k="' + jgrEsc(q.id) + '" style="' + JGR_BTN + ';font-size:12.5px;padding:4px 10px;' + JGR_RED + '">' + lg('Mời ra', 'Remove') + '</button></div>').join('') : '<div style="font-size:12.5px;opacity:.7">' + lg('Chưa có ai khác trong phòng.', 'Nobody else is here.') + '</div>';
    };
    lock(); ppl(); JGR_T = setInterval(() => { ppl(); lock(); }, 1500);
    $q('#jgrPpl').addEventListener('click', e => {
      const id = e.target.dataset && e.target.dataset.k; if (!id) return; const who = JG.players.find(q => q.id === id); if (!who) return;
      jgrConfirm(lg('Mời "' + (who.name || '?') + '" ra khỏi phòng? Bạn đó sẽ không vào lại được.', 'Remove "' + (who.name || '?') + '" from the room? They will not be able to come back.'), lg('Mời ra', 'Remove'), async () => { const j = await jgrAdmin('kick', { id }); toast(j && !j.error ? lg('Đã mời ra', 'Removed') : lg('Bạn đó vừa rời đi', 'They just left'), 2); ppl(); });
    });
    $q('#jgrUnk').addEventListener('click', async () => { const j = await jgrAdmin('unkick'); toast(j && !j.error ? lg('Những người bị mời ra vào lại được rồi', 'Everyone removed can come back') : lg('Chưa được', 'It did not work'), 2.4); });
    $q('#jgrSet').addEventListener('click', async () => { const v = $q('#jgrPw').value.trim(); if (!v) { $q('#jgrPw').focus(); return; } const j = await jgrAdmin('pass', { pw: v }); if (j && !j.error) { JG.room.locked = true; $q('#jgrPw').value = ''; lock(); toast(lg('Đã đặt mật khẩu', 'Password set'), 2); } else toast(lg('Chưa được', 'It did not work'), 2.2); });
    $q('#jgrDrop').addEventListener('click', async () => { const j = await jgrAdmin('pass', { pw: '' }); if (j && !j.error) { JG.room.locked = false; lock(); toast(lg('Đã bỏ mật khẩu: ai cũng vào được', 'Password removed: anyone can come in'), 2.4); } else toast(lg('Chưa được', 'It did not work'), 2.2); });
    $q('#jgrReset').addEventListener('click', () => jgrConfirm(lg('Ghép lại từ đầu: các mảnh đã ghép bị xáo lại hết. Chắc chưa?', 'Start over: every piece put together is shuffled again. Sure?'), lg('Ghép lại', 'Start over'), async () => { const j = await jgrAdmin('reset'); if (j && !j.error) { jgrClose(); toast(lg('Đã xáo lại tranh', 'The picture was shuffled again'), 2.4); } else toast(lg('Chưa được', 'It did not work'), 2.2); }));
    $q('#jgrNew').addEventListener('click', () => jgrCreateOpen('newpic'));
    $q('#jgrDel').addEventListener('click', () => jgrConfirm(lg('Xóa phòng "' + R.name + '"? Tranh và các mảnh đã ghép mất hẳn, không lấy lại được.', 'Delete the room "' + R.name + '"? The picture and every piece put together are gone for good.'), lg('Xóa phòng', 'Delete'), async () => { const j = await jgrAdmin('delete'); if (!(j && !j.error)) toast(lg('Chưa xóa được', 'Could not delete'), 2.2); }));
    $q('#jgrNo').addEventListener('click', jgrClose);
  });
}
