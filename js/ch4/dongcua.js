/* ---------- a shut stall says so where it stands (owner 2026-11-15: "những cửa hàng nào đóng rồi thì hiện ở khắp các chỗ là đã đóng cửa, ví dụ ở phố,
   ở chợ, trong list, danh sách, và ko hiện là còn bao nhiêu ở ngoài nữa"). The lists (motso.js, kinhdoanh.js, thue.js) say "Đã đóng cửa" instead of
   the stock or the day's sales, the HUD's ware list "… đã đóng" instead of the count (cho.js c4Hud, cuahang.js p4StockHud), the tallies "đã đóng
   cửa"; here a wooden board "ĐÃ ĐÓNG CỬA" hangs in front of every shut village stall (SAVE4.shut[g]), the town's betel house (SAVE4B.shut) and every
   shut town shop (shops[x].shut), drawn in the scene's own depth order. ---------- */
function c4ShutBoard(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.04);
  const w = 132, h = 34;
  g.strokeStyle = '#3b2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w * .32, -h / 2); g.lineTo(-w * .12, -h / 2 - 22); g.lineTo(w * .12, -h / 2 - 22); g.lineTo(w * .32, -h / 2); g.stroke();   // the string it hangs by
  g.fillStyle = '#5b3a22'; g.strokeStyle = '#1d1915'; g.lineWidth = 2.5; g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(242,236,222,.35)'; g.lineWidth = 1.2; g.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  g.fillStyle = '#f2ecde'; g.font = '900 16px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ĐÃ ĐÓNG CỬA', 0, 1);
  g.restore();
}
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) {
    fx0(items, g, vis);
    if (typeof c4LookCtx !== 'undefined' && c4LookCtx !== undefined) return;                       // (not in a friend's market, nor in the stall dresser)
    const z = C4_STALL_Z + .01;   // just in front of the counter
    for (const w of c4Owned()) if (c4Shut(w)) { const x = w === 'trau' ? C4_STALL : C4_GOODS[w].x; if (vis(x, 120)) items.push({ z, f: () => c4ShutBoard(g, x, c4Y(z) - 62 * c4S(z), c4S(z) * 1.25) }); }
  }; }
{ const br0 = p4TownBridgeItems;
  p4TownBridgeItems = function (items, g, vis) {
    br0(items, g, vis);
    const z = .1, put = x => { if (vis(x, 120)) items.push({ z, f: () => c4ShutBoard(g, x, p4Y(z) - 70 * p4S(z), p4S(z) * 1.25) }); };
    if (SAVE4B.house && SAVE4B.shut) put(P4_HOME);
    const S = p4Shops(); for (const k in S) if (S[k].shut) put(+k);
  }; }
