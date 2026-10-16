/* Chương IV phần 2 · Phố Huyện: the couple talk it over before buying the house (owner, 2026-10-15: "khấm khá nên chơi lớn, có chí thì mới
   giàu được"). Pressing Mua nhà with 500 quan in the purse: the HUD goes, the view settles on the house for sale, the husband and the wife
   stand in front of it and talk (P4_BUY_TALK, all original), a tap / Space / Enter for the next line; after the last one the screen fades
   and the house is bought (p4DoBuy: the shop's name sheet comes next). The street goes on behind them. Part 2's own code. */
const P4_BUY_TALK = [
  ['w', 'Mình ơi, năm trăm quan rồi đấy! Cả đời em chưa thấy nhiều tiền thế bao giờ.'],
  ['h', 'Ừ, gánh trầu ngoài chợ quê nuôi nhà mình khấm khá lắm rồi.'],
  ['w', 'Hay là mình cứ để dành, mua mấy sào ruộng, sống cho yên?'],
  ['h', 'Để dành thì tiền nằm im. Buôn bán phải cho đồng tiền đẻ ra đồng tiền.'],
  ['h', 'Căn nhà mặt phố này đang bán. Mở hiệu trầu ở đây, khách thập phương qua lại.'],
  ['w', 'Phố huyện người đông của nhiều, nhưng cũng lắm kẻ tranh. Mình đứng có vững không?'],
  ['h', 'Có chí thì nên, mình ạ. Chẳng ai giàu lên nhờ ngồi yên một chỗ.'],
  ['w', 'Được! Đã chơi thì chơi lớn. Em lo bán, mình lo hàng.'],
  ['h', 'Thế là quyết nhé!'],
  ['w', 'Mua nhà! Rồi đặt cho hiệu một cái tên thật kêu.']];
const P4_TALK_X = [-62, 62], P4_TALK_Z = .55;   // where the husband and the wife stand, from the house's middle
function p4BuyTalkStart(end) {
  p4Sheets(null); $('#p4hud').hidden = true;
  P4.talk = { lines: P4_BUY_TALK, i: 0, t: 0, lineT: 0, fade: 0, end };
  P4.camX = P4_HOME - p4View().vw / 2;
}
function p4TalkUpdate(dt) {
  const T = P4.talk; if (!T) return;
  T.t += dt; T.lineT += dt;
  P4.camX += (P4_HOME - p4View().vw / 2 - P4.camX) * Math.min(1, dt * 4);   // the view stays on the house
  if (T.fade > 0 && (T.fade += dt) > .9) { P4.talk = null; $('#p4hud').hidden = false; T.end(); }
}
function p4TalkNext() {
  const T = P4.talk; if (!T || T.fade > 0 || T.lineT < .25) return;
  AU.tap();
  if (T.i < T.lines.length - 1) { T.i++; T.lineT = 0; } else T.fade = .001;
}
// the couple among the street's folk (sorted by depth with them)
function p4TalkItems(items, g) {
  const T = P4.talk, who = T.lines[T.i][0], s = p4S(P4_TALK_Z) * .95, y = p4Y(P4_TALK_Z);
  const one = (M, k, face, me, seed) => { const talk = who === me, bob = talk ? Math.abs(Math.sin(T.t * 9)) * 3 : 0;
    items.push({ z: P4_TALK_Z, f: () => p4Mouse(g, M, P4_HOME + P4_TALK_X[k], face, 0, false, talk ? -.3 - Math.abs(Math.sin(T.t * 4)) * .5 : null, null, s, y - bob, seed) }); };
  one(MICE.groom, 0, 1, 'h', 2); one(MICE.wife || MICE.b, 1, -1, 'w', 1);
}
// the line being said, large, over the speaker; drawn over the night's light so it stays readable
function p4TalkDraw(g) {
  const T = P4.talk, [who, text] = T.lines[T.i], V = p4View(), k = Math.min(1, T.lineT * 6), sc = (.85 + .15 * k) / Math.max(.6, Math.min(1.3, V.s));
  const B = c4Bubble(text, who === 'h' ? -1 : 1, 18, Math.min(300, V.vw - 60)), s = p4S(P4_TALK_Z) * .95;
  const half = B.w / 2 * sc, x = Math.max(P4.camX + half + 8, Math.min(P4.camX + V.vw - half - 8, P4_HOME + P4_TALK_X[who === 'h' ? 0 : 1]));
  const y = p4Y(P4_TALK_Z) - 168 * s - (B.bh + 34) * sc;
  g.globalAlpha = k; dp(g, B, x, y, 0, sc, sc); g.globalAlpha = 1;
  if (T.fade > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(242,236,222,${Math.min(1, T.fade / .9)})`; g.fillRect(0, 0, cv.width, cv.height); g.restore(); }
}
// the purchase itself, after the talk
function p4DoBuy() {
  if (p4Purse() < P4_HOUSE_PRICE || SAVE4B.house) { p4Hud(); return; }
  SAVE4.money -= P4_HOUSE_PRICE; persist4();
  SAVE4B = { house: true, day: 1, from: SAVE4.day, stock: 30, price: 8, sold: 0 }; p4Persist();
  p4Sheets(null); P4.day = 0; startP4(); toast('Vợ chồng chuột đã có nhà trên phố huyện!', 3); p4NameSheet(true);
}
