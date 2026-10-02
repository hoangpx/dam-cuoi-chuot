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
