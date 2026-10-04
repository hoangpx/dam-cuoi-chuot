/* ---------- buying out a neighbour's stall (owner) ----------
   Every neighbour along the row (meat, rice, greens, eggs, chickens, fruit, hats, fish, cloth, rice crackers) belongs to
   someone in the village (c4VendorOwner). Tap their stall: if you know the owner you can ask to buy it; the price goes by
   how much they like you (like a landlord), and a few won't sell unless you are close. Bought, it becomes one of your
   wares (C4_BUYS, in C4_GOODS with buy: true): stocked each morning, sold by the couple or hired helpers, in the tally.
   And the rival betel seller (event rival) stands as a real stall across the lane, calling out cheap betel and pulling
   buyers away while you keep your price; you can buy them out too. ---------- */
const C4_BUY_WARES = {
  hangThit: { g: 'thit', name: 'Thịt lợn', unit: 'lạng', price: 12, cost: 8, keep: 'day', cap: 40, serve: 1.4, wage: 10, buy: 700,
    hours: { 'Mão': 1.6, 'Thìn': 1.4, 'Tỵ': 1, 'Ngọ': .5, 'Mùi': .4, 'Thân': .5, 'Dậu': .4 }, wx: { gat: .7, mua: .9, ret: 1.1, dep: 1 } },
  hangGao: { g: 'gao', name: 'Gạo', unit: 'đấu', price: 10, cost: 7, keep: 'ever', cap: 60, serve: 1.2, wage: 8, buy: 600,
    hours: { 'Mão': 1, 'Thìn': 1.1, 'Tỵ': .9, 'Ngọ': .6, 'Mùi': .6, 'Thân': .8, 'Dậu': .7 }, wx: { gat: 1, mua: .8, ret: 1, dep: 1 } },
  hangRau: { g: 'rau', name: 'Rau', unit: 'bó', price: 3, cost: 1, keep: 'day', cap: 80, serve: .8, wage: 6, buy: 300,
    hours: { 'Mão': 1.6, 'Thìn': 1.3, 'Tỵ': .9, 'Ngọ': .5, 'Mùi': .5, 'Thân': .8, 'Dậu': .9 }, wx: { gat: .7, mua: .9, ret: 1, dep: 1 } },
  hangTrung: { g: 'trung', name: 'Trứng', unit: 'chục', price: 15, cost: 10, keep: 'ever', cap: 30, serve: 1, wage: 8, buy: 500,
    hours: { 'Mão': 1.2, 'Thìn': 1.1, 'Tỵ': .9, 'Ngọ': .6, 'Mùi': .6, 'Thân': .8, 'Dậu': .7 }, wx: { gat: .9, mua: .9, ret: 1, dep: 1 } },
  hangGa: { g: 'ga', name: 'Gà', unit: 'con', price: 30, cost: 22, keep: 'ever', cap: 16, serve: 2, wage: 10, buy: 800,
    hours: { 'Mão': 1.2, 'Thìn': 1.1, 'Tỵ': .8, 'Ngọ': .4, 'Mùi': .4, 'Thân': .6, 'Dậu': .5 }, wx: { gat: .8, mua: .8, ret: 1.1, dep: 1 } },
  hangQua: { g: 'qua', name: 'Hoa quả', unit: 'nải', price: 8, cost: 5, keep: 'ever', cap: 50, serve: 1, wage: 8, buy: 500,
    hours: { 'Mão': .8, 'Thìn': 1, 'Tỵ': 1.1, 'Ngọ': .9, 'Mùi': .9, 'Thân': 1, 'Dậu': .8 }, wx: { gat: 1.2, mua: .8, ret: .8, dep: 1 } },
  hangNon: { g: 'non', name: 'Nón lá', unit: 'chiếc', price: 20, cost: 14, keep: 'ever', cap: 30, serve: 1.6, wage: 8, buy: 600,
    hours: { 'Mão': .6, 'Thìn': .9, 'Tỵ': 1.1, 'Ngọ': 1.2, 'Mùi': 1, 'Thân': .8, 'Dậu': .6 }, wx: { gat: 1.6, mua: 1.4, ret: .7, dep: 1 } },
  hangCa: { g: 'ca', name: 'Cá', unit: 'con', price: 10, cost: 6, keep: 'day', cap: 50, serve: 1.2, wage: 8, buy: 600,
    hours: { 'Mão': 1.6, 'Thìn': 1.3, 'Tỵ': .9, 'Ngọ': .5, 'Mùi': .4, 'Thân': .6, 'Dậu': .5 }, wx: { gat: .7, mua: 1, ret: 1, dep: 1 } },
  hangVai: { g: 'vai', name: 'Vải', unit: 'thước', price: 15, cost: 11, keep: 'ever', cap: 40, serve: 1.8, wage: 8, buy: 700,
    hours: { 'Mão': .5, 'Thìn': .9, 'Tỵ': 1.1, 'Ngọ': 1, 'Mùi': 1, 'Thân': .9, 'Dậu': .6 }, wx: { gat: .9, mua: .7, ret: 1.2, dep: 1 } },
  hangBanh: { g: 'banh', name: 'Bánh đa', unit: 'chiếc', price: 4, cost: 2, keep: 'day', cap: 60, serve: .8, wage: 6, buy: 400,
    hours: { 'Mão': .8, 'Thìn': 1, 'Tỵ': 1, 'Ngọ': .9, 'Mùi': 1, 'Thân': 1.2, 'Dậu': 1 }, wx: { gat: .9, mua: 1, ret: 1.1, dep: 1 } },
};
const C4_BUYS = [], C4_VENDOR_G = {};
for (const v of [...C4_VENDORS, ...C4_VENDORS_FRONT]) {
  const W = C4_BUY_WARES[v.ware]; if (!W) continue;
  C4_GOODS[W.g] = { ...W, x: v.x, art: v.ware, rent: W.buy / 4 };
  C4_BUYS.push(W.g); C4_VENDOR_G[v.ware] = W.g;
}
// who owns a neighbour's stall: a grown-up of the village, the same one every day; some won't sell unless you are close
function c4VendorOwner(ware) {
  const P = c4People(), lords = new Set(Object.values(P.landlord || {})), L = P.list.filter(p => p.kind === 'mouse' && p.role !== 'child' && !lords.has(p.id));
  let h = SAVE4.seed || 1; for (const c of ware) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const p = L[h % L.length], stubborn = (h >>> 8) % 4 === 0, known = c4Known(p.id), a = c4Like(p.id);
  const k = a >= 80 ? .6 : a >= 60 ? .8 : a >= 35 ? 1 : 1.4;
  return { p, known, stubborn: stubborn && a < 70, k, price: Math.round(C4_GOODS[C4_VENDOR_G[ware]].buy * k), word: a >= 80 ? ' (thân thiết, để giá hời)' : a >= 60 ? ' (quý nhà mình, bớt cho một ít)' : a >= 35 ? '' : ' (chưa ưa nhà mình, nói thách)' };
}
const c4VendorMine = v => { const g = C4_VENDOR_G[v.ware]; return !!g && c4Own(g); };
function c4BuyOpen(v) {
  const g = C4_VENDOR_G[v.ware], G = C4_GOODS[g], O = c4VendorOwner(v.ware), box = $('#c4upO');
  $('#c4upT').textContent = c4Cap1(v.name); $('#c4upB').innerHTML = ''; $('#c4upGo').hidden = true;
  if (!O.known) box.innerHTML = `<p>Gánh ${G.name.toLowerCase()} của một nhà trong làng.</p><p class="bad">Không biết chủ gánh là ai mà hỏi mua. Quen thêm người trong làng thì sẽ biết.</p>`;
  else if (O.stubborn) box.innerHTML = `<p>Chủ gánh: <b>${O.p.name}</b>.</p><p class="bad">${c4Cap1(O.p.name)} nhất quyết không bán: "Gánh này của mẹ tôi để lại!" Phải thật thân mới mong.</p>`;
  else {
    box.innerHTML = `<p>Chủ gánh: <b>${O.p.name}</b>. ${c4Cap1(O.p.name)} bằng lòng nhượng lại gánh ${G.name.toLowerCase()} giá <b>${c4Money(O.price)}</b>${O.word}.</p>`
      + `<p class="hint">Bán ${G.name.toLowerCase()}: nhập ${c4Money(G.cost)} một ${G.unit}, bán ${c4Money(G.price)}${G.keep === 'ever' ? ', để lâu không hỏng' : ', tan chợ còn thừa phải bỏ'}. Vợ chồng tự bán hoặc thuê người, mỗi người công ${c4Money(G.wage)} một ngày.</p>`;
    $('#c4upGo').hidden = false; $('#c4upGo').disabled = SAVE4.money < O.price; $('#c4upGo').innerHTML = `Mua lại · ${c4Money(O.price)}`;
    $('#c4upGo').onclick = () => {
      if (SAVE4.money < O.price) return;
      SAVE4.money -= O.price; if (C4.today) C4.today.spent += O.price;
      SAVE4.shops[g] = { own: true, stock: 0, buy: true }; C4.Q[g] = []; C4.SV[g] = [];
      c4Bump(O.p.id, 6); c4Sheets(null); AU.stamp(); AU.pluck(88); persist4(); c4Hud();
      toast(`Đã mua lại gánh ${G.name.toLowerCase()} của ${O.p.name}. Chạm vào gánh để nhập hàng!`, 3.6);
    };
  }
  c4Sheets('c4up');
}

/* ---------- the rival betel seller across the lane ---------- */
const C4_RIVAL_X = C4_STALL + 60, C4_RIVAL_Z = .96;
const C4_RIVAL_CALL = ['Trầu rẻ đây! Năm đồng một miếng thôi!', 'Trầu nhà tôi cay hơn, rẻ hơn!', 'Ai mua trầu rẻ thì sang bên này!', 'Cau non, lá tươi, giá mềm đây!'];
const c4RivalOn = () => SAVE4.rival > 0 && C4.phase === 'open';
function c4RivalUpdate(dt) {
  if (!c4RivalOn()) return;
  const R0 = C4.rivalM || (C4.rivalM = { say: null, callT: 2, M: c4MouseRig(20) });
  if ((R0.callT -= dt) <= 0) { R0.callT = 7 + R() * 7; c4Say(R0, c4Pick(C4_RIVAL_CALL)); }
  // while we keep our price, some passers-by turn off to the cheaper stall
  if (SAVE4.cheap > 0 || R() > dt * .5) return;
  const w = C4.walkers.find(w => w.st === 'walk' && !w.buy && !w.visit && w.kind === 'mouse' && !w.buf && Math.abs(w.x - C4_RIVAL_X) < 260 && !w.rival);
  if (w) { w.rival = true; w.st = 'torival'; w.cd = 1e9; }
}
function c4RivalWalk(dt) {
  for (const w of C4.walkers) {
    if (w.st !== 'torival') continue;
    const tx = C4_RIVAL_X + 70 + (w.seed % 1) * 40, dx = tx - w.x, dz = (C4_RIVAL_Z - .1) - w.z, d = Math.hypot(dx, dz * 300);
    if (d > 4) { const k = Math.min(1, 80 * dt / d); w.x += dx * k; w.z += dz * k; w.ph += dt * 9; w.face = dx < 0 ? -1 : 1; }
    else { w.face = -1; w.rivalT = (w.rivalT || 0) + dt; if (w.rivalT > 2.5) { w.st = 'leave'; w.face = R() < .5 ? 1 : -1; w.carry = MP.ladong; c4Say(w, c4Pick(['Rẻ hơn hẳn!', 'Bên này rẻ, mua bên này.', 'Được hời một đồng!'])); } }
  }
}
function c4RivalItems(items, g, head, vis) {
  if (!c4RivalOn() || !vis(C4_RIVAL_X, 160)) return;
  const R0 = C4.rivalM || (C4.rivalM = { say: null, callT: 2, M: c4MouseRig(20) }), A = c4Art(), z = C4_RIVAL_Z, s = c4S(z) * .9;
  items.push({ z, f: () => { dp(g, A.ganh, C4_RIVAL_X + 20, c4Y(z), 0, s, s); c4Mouse(g, R0.M, C4_RIVAL_X - 70, 1, C4.t * 2, false, R0.say ? -.3 - Math.abs(Math.sin(C4.t * 5)) * .4 : null, null, s, c4Y(z), 3.3);
    const bx = C4_RIVAL_X + 20, by = c4Y(z) - 128 * s;                      // a red board so it reads as the rival
    g.fillStyle = INK; g.fillRect(bx - 2, by, 4, 40 * s); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(bx - 44, by - 26, 88, 26); g.strokeRect(bx - 44, by - 26, 88, 26);
    g.fillStyle = '#f2ecde'; g.font = '900 15px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TRẦU RẺ', bx, by - 12); g.textBaseline = 'alphabetic'; } });
  head(C4_RIVAL_X - 70, z, 168 * .9, R0, 1);
}
function c4RivalTap(x, y) {
  if (!c4RivalOn()) return false;
  const z = C4_RIVAL_Z, s = c4S(z), sy = c4Y(z);
  if (x < C4_RIVAL_X - 120 * s || x > C4_RIVAL_X + 130 * s || y < sy - 190 * s || y > sy + 20) return false;
  AU.tap();
  const who = SAVE4.rivalWho || 'một nhà trong làng', price = 250 + 60 * SAVE4.rival, box = $('#c4upO');
  $('#c4upT').textContent = 'Gánh trầu đối diện'; $('#c4upB').innerHTML = '';
  box.innerHTML = `<p>Gánh trầu của ${who} bán rẻ một đồng, ${SAVE4.cheap > 0 ? 'nhà mình đã hạ giá giữ khách.' : 'đang kéo khách của nhà mình.'} Còn ${SAVE4.rival} ngày nữa họ mới dẹp.</p><p class="hint">Mua đứt gánh ấy thì hết người tranh khách, trầu nhà mình lại bán đủ giá.</p>`;
  $('#c4upGo').hidden = false; $('#c4upGo').disabled = SAVE4.money < price; $('#c4upGo').innerHTML = `Mua đứt gánh ấy · ${c4Money(price)}`;
  $('#c4upGo').onclick = () => { if (SAVE4.money < price) return; SAVE4.money -= price; if (C4.today) C4.today.spent += price; SAVE4.rival = 0; SAVE4.cheap = 0; c4Sheets(null); AU.stamp(); persist4(); c4Hud(); toast(`Đã mua đứt gánh trầu của ${who}. Hết người tranh khách!`, 3.4); };
  c4Sheets('c4up'); return true;
}
// what buyers say at a bought stall ({n} = how many)
Object.assign(C4_WANT, {
  thit: ['Cân cho tôi {n} lạng thịt ba chỉ!', 'Lấy {n} lạng nạc vai nhé!', 'Thịt hôm nay tươi không? Cho {n} lạng!'],
  gao: ['Đong cho tôi {n} đấu gạo!', 'Gạo tám thơm, {n} đấu nhé!', 'Lấy {n} đấu nếp cái!'],
  rau: ['Cho {n} bó rau muống!', 'Lấy {n} bó rau ngót nấu canh!', 'Rau đay {n} bó nhé!'],
  trung: ['Lấy {n} chục trứng gà!', 'Trứng vịt {n} chục nhé!', 'Cho {n} chục trứng, chọn quả to!'],
  ga: ['Bắt cho tôi {n} con gà mái!', 'Lấy {n} con gà về cúng rằm!', 'Gà trống thiến, {n} con!'],
  qua: ['Lấy {n} nải chuối tiêu!', 'Cho {n} nải chuối thắp hương!', 'Cam sành ngọt không? Lấy {n} nải!'],
  non: ['Cho tôi {n} chiếc nón lá!', 'Nón quai thao {n} chiếc nhé!', 'Lấy {n} chiếc nón, chọn cái đẹp!'],
  ca: ['Lấy {n} con cá rô!', 'Cá chép {n} con nhé!', 'Cho {n} con cá về kho!'],
  vai: ['Cắt cho tôi {n} thước vải!', 'Lụa này {n} thước nhé!', 'Lấy {n} thước vải may áo!'],
  banh: ['Cho {n} chiếc bánh đa!', 'Bánh đa vừng, {n} chiếc!', 'Nướng cho tôi {n} chiếc nhé!'],
});
