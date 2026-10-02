/* "Thêm vào màn hình chính" (owner): a button under the chapter cards opens a sheet with the steps for this phone —
   iPhone/iPad (Safari, or Chrome/other browsers there), Android (Chrome's own install prompt when it offers one, else
   the menu steps). Hidden when the game already runs from the home screen and on computers. */
const INST = { prompt: window.__bip || null };
addEventListener('beforeinstallprompt', e => { e.preventDefault(); INST.prompt = e; instButton(); });   // Android Chrome: install in one tap
addEventListener('appinstalled', () => { INST.prompt = null; $('#install').hidden = true; instButton(); });
const instStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function instKind() {
  const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) return /CriOS|FxiOS|EdgiOS|GSA\//.test(ua) ? 'ios-other' : 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
}
function instButton() { const b = $('#bInstall'); if (b) b.hidden = instStandalone() || (!instKind() && !INST.prompt); }

// little pictures of the buttons to look for, drawn like the game's ink
const INST_ICON = {
  share: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1d1915" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10H5v11h14V10h-2"/><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1d1915" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  dots: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#1d1915"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  app: '<img src="img/icon-180.png?v=2" width="26" height="26" alt="" style="border-radius:6px;vertical-align:middle">',
};
function instSteps(kind) {
  const step = (n, icon, html) => `<li><span class="n">${n}</span><span class="ic">${icon || ''}</span><span>${html}</span></li>`;
  if (kind === 'ios') return [
    step(1, INST_ICON.share, 'Chạm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên) ở thanh dưới cùng của Safari.'),
    step(2, INST_ICON.plus, 'Kéo danh sách lên, chọn <b>Thêm vào MH chính</b>.'),
    step(3, INST_ICON.app, 'Chạm <b>Thêm</b> ở góc trên. Biểu tượng Đám Cưới Chuột hiện trên màn hình chính, mở ra là chơi toàn màn hình.'),
  ];
  if (kind === 'ios-other') return [
    step(1, INST_ICON.share, 'Chạm nút <b>Chia sẻ</b> trên thanh địa chỉ (góc trên bên phải).'),
    step(2, INST_ICON.plus, 'Chọn <b>Thêm vào MH chính</b>. Nếu không thấy, mở <b>damcuoichuot.com</b> bằng <b>Safari</b> rồi làm như trên.'),
    step(3, INST_ICON.app, 'Chạm <b>Thêm</b>. Biểu tượng Đám Cưới Chuột hiện trên màn hình chính.'),
  ];
  return [
    step(1, INST_ICON.dots, 'Trong Chrome, chạm nút <b>⋮</b> ở góc trên bên phải.'),
    step(2, INST_ICON.plus, 'Chọn <b>Thêm vào màn hình chính</b> (có máy ghi <b>Cài đặt ứng dụng</b>).'),
    step(3, INST_ICON.app, 'Chạm <b>Thêm</b> hoặc <b>Cài đặt</b>. Biểu tượng Đám Cưới Chuột hiện trên màn hình chính.'),
  ];
}
function showInstall() {
  const kind = instKind() || 'android', box = $('#install');
  $('#instTitle').textContent = kind === 'android' ? 'Thêm vào màn hình chính (Android)' : 'Thêm vào màn hình chính (iPhone)';
  $('#instSteps').innerHTML = instSteps(kind).join('');
  $('#bInstNow').hidden = !INST.prompt;
  box.hidden = false; AU.tap && AU.tap();
}
$('#bInstall').addEventListener('click', showInstall);
$('#bInstClose').addEventListener('click', () => { $('#install').hidden = true; });
$('#bInstNow').addEventListener('click', async () => { const p = INST.prompt; if (!p) return; p.prompt(); try { await p.userChoice; } catch (e) {} INST.prompt = null; $('#install').hidden = true; instButton(); });
instButton();

/* ---------- the peeking mouse (owner): a mouse looks up from the bottom corner of the chapter list or the album and
   asks in a bubble whether to put the game on the home screen; on yes it shows where to tap with a bouncing arrow at
   that very spot of the phone (Safari's Share button, or Chrome's ⋮). "Để sau" keeps it away for three days. ---------- */
const INST_LATER = 3 * 864e5;
function instArrowSpot(kind) {
  const ua = navigator.userAgent, ipad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), v = +((ua.match(/Version\/(\d+)/) || [])[1] || 0);
  if (kind === 'android') return { css: 'top:6px;right:8px', dir: 'up', say: 'Chạm nút <b>⋮</b> ở góc trên này, rồi chọn <b>Thêm vào màn hình chính</b> (hoặc <b>Cài đặt ứng dụng</b>).' };
  if (ipad || kind === 'ios-other') return { css: 'top:6px;right:64px', dir: 'up', say: 'Chạm nút <b>Chia sẻ</b> trên thanh địa chỉ, rồi chọn <b>Thêm vào MH chính</b>.' };
  if (v >= 26) return { css: 'bottom:calc(6px + env(safe-area-inset-bottom));right:14px', dir: 'down', say: 'Chạm nút <b>•••</b> ở góc dưới này, chọn <b>Chia sẻ</b>, rồi <b>Thêm vào MH chính</b>.' };
  return { css: 'bottom:calc(6px + env(safe-area-inset-bottom));left:calc(50% - 22px)', dir: 'down', say: 'Chạm nút <b>Chia sẻ</b> ở thanh dưới này, rồi chọn <b>Thêm vào MH chính</b>.' };
}
function instPeek() {
  if (document.getElementById('instPeek') || instStandalone() || !instKind() && !INST.prompt) return;
  let later = 0; try { later = +localStorage.getItem('dcc.instLater') || 0; } catch (e) {}
  if (Date.now() - later < INST_LATER || INST.peeked) return;
  INST.peeked = true;
  const box = document.createElement('div'); box.id = 'instPeek';
  box.innerHTML = '<canvas width="240" height="240"></canvas><div class="bub"><p>Cài mình lên màn hình chính, mở ra chơi như ứng dụng nhé?</p><div class="bt"><button class="btn" data-a="yes">Cài đặt</button><button class="btn alt" data-a="no">Để sau</button></div></div>';
  document.body.appendChild(box);
  const cvs = box.querySelector('canvas'), g = cvs.getContext('2d'), t0 = performance.now(), rig = c4MouseRig(0);
  (function draw() {
    if (!box.isConnected) return;
    if (S.mode !== 'chapters' && S.mode !== 'album') { instUnpeek(); return; }
    const t = (performance.now() - t0) / 1000, up = Math.min(1, t / .6), ct = C4.t; C4.t = t;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 240, 240); g.setTransform(2, 0, 0, 2, 0, 0);
    c4Mouse(g, rig, 50, 1, 0, false, -1.5 + Math.sin(t * 6) * .35, null, 1.15, 168 + 70 * (1 - up) * (1 - up) + Math.sin(t * 2) * 1.5, 1);   // rising out of the corner, waving
    C4.t = ct; requestAnimationFrame(draw);
  })();
  box.addEventListener('click', async e => {
    const a = e.target.closest('button')?.dataset.a; if (!a) return;
    AU.tap && AU.tap();
    if (a === 'no' || a === 'done') { try { localStorage.setItem('dcc.instLater', String(Date.now())); } catch (er) {} instUnpeek(); return; }
    if (INST.prompt) { const p = INST.prompt; p.prompt(); try { await p.userChoice; } catch (er) {} INST.prompt = null; instUnpeek(); instButton(); return; }
    const spot = instArrowSpot(instKind() || 'android');
    box.querySelector('.bub').innerHTML = `<p>${spot.say}</p><div class="bt"><button class="btn alt" data-a="done">Xong</button></div>`;
    const ar = document.createElement('div'); ar.id = 'instArrow'; ar.className = spot.dir; ar.style.cssText = spot.css;
    ar.innerHTML = '<svg viewBox="0 0 44 60" width="44" height="60"><path d="M22 4v40" stroke="#1d1915" stroke-width="9" stroke-linecap="round"/><path d="M22 4v40" stroke="#a3332a" stroke-width="5" stroke-linecap="round"/><path d="M6 36l16 20 16-20z" fill="#a3332a" stroke="#1d1915" stroke-width="3" stroke-linejoin="round"/></svg>';
    document.body.appendChild(ar);
  });
}
function instUnpeek() { for (const id of ['instPeek', 'instArrow']) { const el = document.getElementById(id); if (el) el.remove(); } }
