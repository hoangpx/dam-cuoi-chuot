/* Chương IV · khu đối diện chợ (owner, 2026-10-28: "cái khu đối diện chợ chỗ trẻ con chơi ý ... cho thêm option để xây sân chơi, hồ nước, công viên,
   bàn ghế ... để thu hút thêm người ra chợ"). The grass strip in front of the lane has six plots. The player may build on each: a playground,
   a pond, a little park, benches under a shelter, a game ground (ô ăn quan) or a string of lanterns; each costs money, one at a time per
   plot, and can be cleared or changed. They draw more people to the market (a hidden bonus on the customer flow, never shown as a number).
   SAVE4.doi = { [plot index]: kind }. The things are the same parts as the stall's things (trangtri.js lkDecoPart), drawn bigger.
   The children's games on the grass (canhpho.js) are no longer fixed all day: they run in sessions, from about 8:00, a random game each. */
const C4_DOI_X = [700, 1300, 1900, 2500, 3100, 3700];
const C4_DOI_KINDS = [
  ['sanchoi', 'Sân chơi trẻ em', 1800, 'Xích đu, cầu trượt, bập bênh. Trẻ con kéo nhau ra chơi, cha mẹ theo sau.', .06],
  ['ho', 'Hồ nước thả cá', 1200, 'Hồ cá chép nhỏ giữa chợ. Ai đi qua cũng dừng lại ngắm.', .05],
  ['congvien', 'Công viên cây xanh', 1500, 'Cây quất, chậu cảnh, hoa sen. Mát mắt, người ta ra chợ cho vui.', .05],
  ['banghe', 'Bàn ghế nghỉ chân', 900, 'Mái che với bàn ghế. Khách ngồi nghỉ, ngồi lâu rồi mua thêm.', .04],
  ['quan', 'Sân ô ăn quan', 600, 'Chỗ cho người lớn chơi cờ dân gian, hàng xóm kéo nhau tới.', .03],
  ['den', 'Dãy đèn lồng', 500, 'Đèn đỏ đèn vàng giăng khắp khu, chiều tối nhìn ấm cả chợ.', .04],
];
const c4DoiOf = () => SAVE4.doi || {};
const c4DoiBonus = () => Math.min(.3, Object.values(c4DoiOf()).reduce((s, k) => { const e = C4_DOI_KINDS.find(q => q[0] === k); return s + (e ? e[4] : 0); }, 0));
const c4DoiBase = () => c4Y(1) + 88, c4DoiScale = () => c4S(1) * .78;

// the plot's picture; kids and grown-ups come and go with the hour (C4.mins; a visitor's scene has no clock, so only the things)
function c4DoiDrawAt(g, x, y, s, kind, mins) {
  const P = (k, dx, sc, dy = 0) => dp(g, lkDecoPart(k), x + dx * s, y + dy * s, 0, sc * s, sc * s), t = performance.now() / 1000;
  const kid = (dx, i, ph) => c4Mouse(g, c4MouseRig(11 + (i % 3)), x + dx * s, 1, t * 4 + ph, false, -.5 + Math.sin(t * 3 + ph) * .4, null, s * .62, y - Math.abs(Math.sin(t * 3 + ph)) * 10 * s, 40 + i);
  const day = mins !== undefined && mins >= 540 && mins < 1080;                      // children play from 9:00 to 18:00
  if (kind === 'sanchoi') { P('xich', -80, 1.05); P('truot', 80, .95); if (day) { kid(-120, 0, 0); kid(10, 1, 2); kid(120, 2, 4); } }
  else if (kind === 'ho') { P('ca', 0, 1.4); }
  else if (kind === 'congvien') { P('quat', -90, 1.1); P('bonsai', 10, 1.05); P('sen', 105, .9); }
  else if (kind === 'banghe') { P('mai', 0, 1.15); }
  else if (kind === 'quan') { P('quan', 0, 1.15); if (mins !== undefined && mins >= 720 && mins < 1050) { c4Mouse(g, c4MouseRig(2), x - 86 * s, 1, 0, false, -.3, null, s * .8, y, 50); c4Mouse(g, c4MouseRig(4), x + 86 * s, -1, 0, false, -.3, null, s * .8, y, 51); } }
  else if (kind === 'den') { P('day', 0, 1.15, -150); }
}
function c4DoiItems(items, g, vis) {
  const doi = c4DoiOf(), y = c4DoiBase(), s = c4DoiScale();
  C4_DOI_X.forEach((x, i) => { if (!vis(x, 220)) return;
    items.push({ z: 2.05, f: () => {
      if (doi[i]) c4DoiDrawAt(g, x, y, s, doi[i], C4.mins);
      else { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 2; g.fillStyle = '#7a4a22'; g.fillRect(-3, -46, 6, 46); g.strokeRect(-3, -46, 6, 46); g.fillStyle = '#f2d27a'; g.fillRect(-34, -70, 68, 26); g.strokeRect(-34, -70, 68, 26); g.fillStyle = INK; g.font = '900 13px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Đất trống', 0, -57); g.restore(); } } });
  });
}
const c4DoiTap = (x, y) => {
  const base = c4DoiBase(), s = c4DoiScale(); if (y < base - 200 * s || y > base + 30 * s) return false;
  for (let i = 0; i < C4_DOI_X.length; i++) if (Math.abs(x - C4_DOI_X[i]) < 120 * s) { AU.tap(); c4DoiOpen(i); return true; }
  return false;
};
{ const fx0 = c4FxItems; c4FxItems = function (items, g, vis) { fx0(items, g, vis); if (c4LookCtx === undefined) c4DoiItems(items, g, vis); }; }
// (the customer flow, cho.js c4Flow, multiplies by 1 + c4DoiBonus(): it is a const there)

/* ---------- the sheet ---------- */
const c4DoiSheet = cnSheet('c4doi', '<h3 id="dsT">Khu đối diện chợ</h3><p class="sm" id="dsN"></p><div id="dsB"></div><p class="sm" id="dsM"></p><div class="row"><button class="btn alt" id="dsX">Đóng</button></div>');
let DS = null;
function c4DoiRefresh() {
  const i = DS, cur = c4DoiOf()[i], B = $('#dsB');
  $('#dsT').textContent = `Khu đất số ${i + 1} đối diện chợ`;
  $('#dsN').textContent = cur ? 'Đang có: ' + C4_DOI_KINDS.find(q => q[0] === cur)[1] + '. Làm chỗ vui chơi, nghỉ ngơi thì người ra chợ đông hơn.' : 'Đất đang trống. Dựng chỗ vui chơi, nghỉ ngơi thì người ra chợ đông hơn.';
  B.innerHTML = C4_DOI_KINDS.map(([k, nm, p, d]) => `<div class="doi"><div><b>${nm}</b><small>${d}</small></div><button class="btn${cur === k ? ' alt' : ''}" data-k="${k}"${cur === k || SAVE4.money < p ? ' disabled' : ''}>${cur === k ? 'Đang có' : c4Money(p)}</button></div>`).join('')
    + (cur ? '<div class="row"><button class="btn alt" id="dsClear">Dọn đi (không hoàn tiền)</button></div>' : '');
  B.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { AU.tap(); const k = b.dataset.k, e = C4_DOI_KINDS.find(q => q[0] === k); if (SAVE4.money < e[2]) return;
    SAVE4.money -= e[2]; C4.today.spent += e[2]; (SAVE4.doi || (SAVE4.doi = {}))[i] = k; persist4(); AU.pluck(84); AU.stamp(); if (typeof c4Hud === 'function') c4Hud(); toast(`Đã dựng ${e[1].toLowerCase()}, tốn ${c4Money(e[2])}.`, 2.6); cnHide(c4DoiSheet); DS = null; }));
  const cl = $('#dsClear'); if (cl) cl.addEventListener('click', () => { AU.tap(); delete SAVE4.doi[i]; persist4(); cnHide(c4DoiSheet); DS = null; });
  $('#dsM').textContent = 'Trong túi: ' + c4Money(Math.round(SAVE4.money)).replace(/<[^>]*>/g, '');
}
function c4DoiOpen(i) { DS = i; cnShow(c4DoiSheet); c4DoiRefresh(); }
$('#dsX').addEventListener('click', () => { AU.tap(); cnHide(c4DoiSheet); DS = null; });
