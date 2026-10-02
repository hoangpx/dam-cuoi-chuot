/* Ủng hộ trẻ em vùng cao (owner): a small red seal under the chapter cards opens a sheet with the owner's VietQR code and
   account; the whole sum goes to children in the highlands. No pop-ups: it only opens when tapped. Counted in
   GoatCounter as ung-ho/mo and ung-ho/chep-stk. */
const DONATE = { stk: '00008863001', note: 'Dam Cuoi Chuot ung ho tre em vung cao' };
$('#bDonate').addEventListener('click', () => { trackSend('ung-ho/mo'); $('#donate').hidden = false; AU.tap && AU.tap(); });
$('#bDonateClose').addEventListener('click', () => { $('#donate').hidden = true; });
$('#donate').addEventListener('click', e => { if (e.target.id === 'donate') $('#donate').hidden = true; });   // a tap outside the sheet closes it
for (const [id, text, done] of [['bCopyStk', DONATE.stk, 'Đã chép số tài khoản'], ['bCopyNote', DONATE.note, 'Đã chép nội dung']]) {
  $('#' + id).addEventListener('click', async e => {
    const b = e.currentTarget, was = b.textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = done; } catch (er) { b.textContent = text; }
    if (id === 'bCopyStk') trackSend('ung-ho/chep-stk');
    setTimeout(() => { b.textContent = was; }, 1800);
  });
}
