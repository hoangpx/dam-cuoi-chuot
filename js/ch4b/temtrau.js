/* Chương IV phần 2 · Phố Huyện: têm trầu by hand (owner, 2026-10-15: like the hot cooking games — Tiệm Xôi, Tiệm Bún, Cooking Fever).
   From the house sheet, "Têm trầu" turns the view round: from inside the shop, out over the counter to the Thu Bồn river. Customers queue
   at the counter (up to 4), each asking for a kind of quid (a bubble of little pictures) with a patience bar. The player taps the
   ingredients to build a quid on one of two trays (a betel leaf first, then lime, areca fresh or dried, red bark, and for the phoenix
   wing the fold), then taps the finished tray and the customer. Right: paid, with a tip for speed (up to +50 %). Wrong: "Không phải thế!"
   and patience lost. A customer whose patience runs out walks off. A shift lasts P4_TEM_SHIFT seconds, customers come faster; each quid
   uses one betel from the shop's stock. The street waits meanwhile. Drawn on the canvas in CSS pixels (its own layout for portrait). */
const P4_TEM_SHIFT = 100;
const P4_TEM_ING = [
  { k: 'la', name: 'Lá trầu' }, { k: 'voi', name: 'Vôi' }, { k: 'cau', name: 'Cau tươi' }, { k: 'caukho', name: 'Cau khô' },
  { k: 'chay', name: 'Vỏ chay' }, { k: 'gap', name: 'Gấp phượng' }, { k: 'bo', name: 'Bỏ' }];
const P4_TEM_RECIPES = [
  { id: 'thuong', name: 'Trầu thường', need: ['la', 'voi', 'cau'], fold: false, price: 8, w: 4 },
  { id: 'chay', name: 'Trầu vỏ chay', need: ['la', 'voi', 'cau', 'chay'], fold: false, price: 10, w: 3 },
  { id: 'kho', name: 'Trầu cau khô', need: ['la', 'voi', 'caukho'], fold: false, price: 10, w: 2 },
  { id: 'phuong', name: 'Trầu cánh phượng', need: ['la', 'voi', 'cau'], fold: true, price: 14, w: 2 }];
const P4T = { on: false };
// running out mid-shift (owner, 2026-10-15): with no betel left and both trays bare the shop offers to fetch more (P4_TEM_MORE.n at
// P4_TEM_MORE.each đồng, dearer than the morning's 3) which arrives P4_TEM_MORE.wait s later; no new customers while out. Left
// P4_TEM_MORE.decide s unanswered (or no money), the shift closes early: those waiting are sent off kindly, not counted as walkouts.
const P4_TEM_MORE = { n: 20, each: 4, wait: 30, decide: 10 };
const p4TemOrderY = L => L.counterY - 118 * L.custS - (13 * L.u + 4) - 10;   // the order bubble's middle: above the head and a hat
function p4TemStart() {
  if (!SAVE4B.house) return;
  if (SAVE4B.stock <= 0) { toast('Hết trầu trong nhà. Nhập trầu trước đã.', 2.6); return; }
  p4Sheets(null); $('#p4hud').hidden = true; $('#p4temHud').hidden = false;
  Object.assign(P4T, { on: true, out: 0, fetch: 0, early: false, t: 0, cust: [], boards: [{ items: [], fold: false }, { items: [], fold: false }], sel: 0, next: 1.2, served: 0, wrong: 0, missed: 0, earned: 0, fx: [], shake: null });
}
function p4TemStop() {
  if (P4T.fetch > 0) { SAVE4B.stock += P4_TEM_MORE.n; P4T.fetch = 0; }   // already paid for: it reaches the house anyway
  P4T.on = false; $('#p4temHud').hidden = true; $('#p4hud').hidden = false; p4Persist(); p4Hud();
  $('#p4temEndB').innerHTML = (P4T.early ? '<p class="bad"><b>Hết trầu, đóng ca sớm.</b></p>' : '') + `<p>Đưa đúng <b>${P4T.served}</b> miếng trầu · thu <b>${c4Money(P4T.earned)}</b></p>`
    + (P4T.wrong ? `<p>Đưa nhầm ${P4T.wrong} lần</p>` : '') + (P4T.missed ? `<p class="bad">${P4T.missed} khách chờ lâu bỏ đi</p>` : '') + `<p>Trầu còn: ${SAVE4B.stock} miếng</p>`;
  $('#p4temAgain').hidden = SAVE4B.stock <= 0; p4Sheets('p4temEnd');
}
// the layout, in CSS pixels, from the canvas size
function p4TemLay() {
  const W = cv.width / DPR, H = cv.height / DPR, port = H > W;
  const counterY = H * (port ? .48 : .55), u = Math.min(W, H) / 600, n = P4_TEM_ING.length;
  // a phone held upright: three customers, the ingredients in two rows; a wide screen: four customers, one row
  const rows = port ? [P4_TEM_ING.slice(0, 4), P4_TEM_ING.slice(4)] : [P4_TEM_ING];
  const ingW = port ? W / 4.3 : Math.min(W / (n + .5), 132 * u), ing = [];
  rows.forEach((row, ri) => row.forEach((g, i) => ing.push([W / 2 + (i - (row.length - 1) / 2) * ingW, H * (port ? .78 + ri * .13 : .86)])));
  const slots = port ? [.19, .5, .81].map(k => W * k) : [0, 1, 2, 3].map(i => W * (.14 + i * .24));
  return { W, H, port, u, counterY, skyY: H * .1, bankY: H * .2, waterY: H * (port ? .26 : .28), slots,
    custS: (port ? W * .3 : Math.min(W * .26, H * .42)) / 170,   // big enough that the upper half shows over the counter
    boards: [[W * (port ? .27 : .3), H * (port ? .61 : .69)], [W * (port ? .73 : .7), H * (port ? .61 : .69)]], boardR: Math.min(W * (port ? .17 : .14), H * .1),
    ing, ingR: ingW * (port ? .38 : .42) };
}
function p4TemUpdate(dt) {
  if (!P4T.on) return;
  P4T.t += dt;
  if (P4T.t >= P4_TEM_SHIFT && !P4T.cust.some(c => !c.leaving)) { p4TemStop(); return; }
  if (P4T.fetch > 0 && (P4T.fetch -= dt) <= 0) { P4T.fetch = 0; SAVE4B.stock += P4_TEM_MORE.n; p4Persist(); toast(`Trầu về rồi! Thêm ${P4_TEM_MORE.n} miếng.`, 2.2); AU.coin && AU.coin(); }
  const bare = SAVE4B.stock <= 0 && !P4T.fetch && !P4T.boards.some(b => b.items.length);
  if (bare && P4T.t < P4_TEM_SHIFT) { if (!P4T.out) P4T.out = P4_TEM_MORE.decide; else if ((P4T.out -= dt) <= 0) { p4TemCloseEarly(); return; } }
  else P4T.out = 0;
  p4TemMoreBtn();
  // customers come, faster as the shift goes on (not in the last seconds)
  if (P4T.t < P4_TEM_SHIFT - 6 && !P4T.out && (P4T.next -= dt) <= 0) {
    const free = p4TemLay().slots.map((_, i) => i).filter(i => !P4T.cust.some(c => c.slot === i && !c.gone));
    if (free.length) {
      const tot = P4_TEM_RECIPES.reduce((a, r) => a + r.w, 0); let k = Math.random() * tot, rec = P4_TEM_RECIPES[0];
      for (const r of P4_TEM_RECIPES) if ((k -= r.w) <= 0) { rec = r; break; }
      const sort = p4Pick(C4_ADULT_SORTS2), seed = Math.random() * 6, pat = 24 - 9 * P4T.t / P4_TEM_SHIFT;
      P4T.cust.push({ slot: p4Pick(free), sort, M: c4MouseRig(sort), seed, look: p4TownLook({ skirt: Math.random() < .5, hat: Math.random() < .2 ? 'quai' : null }, seed), umb: false,
        order: rec, pat, patMax: pat, in: 0, leaving: 0, gone: false, say: null, face: 1, ph: 0, st: 'stand' });
    }
    P4T.next = 4.6 - 2.2 * P4T.t / P4_TEM_SHIFT + Math.random() * 1.5;
  }
  for (const c of P4T.cust) {
    c.in = Math.min(1, c.in + dt * 2.5);
    if (c.say) { c.say.t += dt; if (c.say.t > c.say.life) c.say = null; }
    if (c.leaving) { c.leaving += dt; if (c.leaving > .8) c.gone = true; continue; }
    c.pat -= dt; if (c.pat <= 0) { c.leaving = .01; P4T.missed++; c.say = { text: 'Chậm quá, thôi!', t: 0, life: 1.4 }; }
  }
  P4T.cust = P4T.cust.filter(c => !c.gone);
  for (const f of P4T.fx) f.t += dt; P4T.fx = P4T.fx.filter(f => f.t < 1.2);
  if (P4T.shake) { P4T.shake.t += dt; if (P4T.shake.t > .35) P4T.shake = null; }
}
// a tap: an ingredient onto the chosen tray, a tray to choose it, a customer to hand them the chosen tray
function p4TemTap(px, py) {
  const L = p4TemLay();
  for (let i = 0; i < P4_TEM_ING.length; i++) {
    const [x, y] = L.ing[i]; if (Math.hypot(px - x, py - y) > L.ingR * 1.1) continue;
    p4TemAdd(P4_TEM_ING[i].k); return;
  }
  for (let i = 0; i < 2; i++) { const [x, y] = L.boards[i]; if (Math.hypot(px - x, py - y) < L.boardR * 1.15) { P4T.sel = i; return; } }
  for (const c of P4T.cust) {
    if (c.leaving) continue;
    const x = L.slots[c.slot], top = p4TemOrderY(L) - 30; if (Math.abs(px - x) > 70 * L.custS + 20 || py < top || py > L.counterY + 10) continue;
    p4TemGive(c); return;
  }
}
// the HUD button while out of betel / the betel on its way
function p4TemMoreBtn() {
  const B = $('#p4temMore'), cost = P4_TEM_MORE.n * P4_TEM_MORE.each;
  if (P4T.fetch > 0) { B.hidden = false; B.disabled = true; B.textContent = `Trầu đang về · ${Math.ceil(P4T.fetch)} giây`; return; }
  if (!P4T.out) { B.hidden = true; return; }
  const can = p4Purse() >= cost; B.hidden = false; B.disabled = !can;
  B.textContent = can ? `Hết trầu! Lấy thêm ${P4_TEM_MORE.n} miếng · ${c4Money(cost)} (đóng ca sau ${Math.ceil(P4T.out)} giây)` : `Hết trầu, không đủ tiền lấy thêm · đóng ca sau ${Math.ceil(P4T.out)} giây`;
}
function p4TemFetch() {
  const cost = P4_TEM_MORE.n * P4_TEM_MORE.each;
  if (!P4T.out || P4T.fetch || p4Purse() < cost) return;
  p4Spend(cost); P4T.out = 0; P4T.fetch = P4_TEM_MORE.wait; p4Persist();
  toast(`Người nhà chạy đi lấy trầu, ${P4_TEM_MORE.wait} giây nữa về.`, 2.4); p4TemMoreBtn();
}
function p4TemCloseEarly() {
  P4T.early = true; P4T.out = 0;
  for (const c of P4T.cust) if (!c.leaving) { c.leaving = .01; c.say = { text: 'Hết trầu rồi à? Mai ghé vậy.', t: 0, life: 1.4 }; }
  p4TemStop();
}
function p4TemAdd(k) {
  const b = P4T.boards[P4T.sel], has = b.items.includes('la'), bad = () => { P4T.shake = { i: P4T.sel, t: 0 }; };
  if (k === 'bo') { b.items = []; b.fold = false; return; }
  if (k === 'la') { if (b.items.length) return bad(); if (SAVE4B.stock <= 0) { toast(P4T.fetch ? `Trầu đang về, còn ${Math.ceil(P4T.fetch)} giây.` : 'Hết trầu trong nhà!', 2); return bad(); } SAVE4B.stock--; b.items.push('la'); return; }
  if (!has || b.fold) return bad();                                         // a leaf first; a folded quid is finished
  if (k === 'gap') { if (!b.items.includes('voi')) return bad(); b.fold = true; return; }
  if (b.items.includes(k) || (k === 'cau' && b.items.includes('caukho')) || (k === 'caukho' && b.items.includes('cau'))) return bad();
  b.items.push(k);
}
const p4TemMatch = (b, r) => b.fold === r.fold && b.items.length === r.need.length && r.need.every(k => b.items.includes(k));
function p4TemGive(c) {
  const b = P4T.boards[P4T.sel]; if (!b.items.includes('la') || !b.items.includes('voi')) { P4T.shake = { i: P4T.sel, t: 0 }; return; }
  const L = p4TemLay(), x = L.slots[c.slot], y = p4TemOrderY(L);
  if (p4TemMatch(b, c.order)) {
    const tip = Math.round(c.order.price * .5 * Math.max(0, c.pat / c.patMax)), got = c.order.price + tip;
    p4Earn(got); P4T.earned += got; P4T.served++; SAVE4B.sold = (SAVE4B.sold || 0) + 1; P4.today.sold++;
    P4T.fx.push({ x, y, s: '+' + got, t: 0, ok: true }); c.say = { text: tip > c.order.price * .3 ? 'Nhanh quá, thưởng thêm!' : 'Đúng rồi, cảm ơn!', t: 0, life: 1.2 }; c.leaving = .01;
  } else {
    P4T.wrong++; c.pat = Math.max(.5, c.pat - c.patMax * .3); c.say = { text: 'Không phải thế!', t: 0, life: 1.2 }; P4T.fx.push({ x, y, s: '✗', t: 0, ok: false });
  }
  b.items = []; b.fold = false;
}
// ---------- drawing ----------
function p4TemRender() {
  const L = p4TemLay(), g = ctx, { W, H, u } = L;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  // the view out: the sky, the far bank of the Thu Bồn with its houses and trees, the river with boats going by
  let gr = g.createLinearGradient(0, 0, 0, L.bankY); gr.addColorStop(0, '#cfe0dc'); gr.addColorStop(1, '#efe6cf'); g.fillStyle = gr; g.fillRect(0, 0, W, L.bankY + 2);
  g.fillStyle = '#9fb59a'; for (let i = 0; i < 9; i++) { const x = ((i * 157 + 40) % (W + 120)) - 60, r = 30 * u + (i % 3) * 10 * u; g.beginPath(); g.arc(x, L.bankY - r * .3, r, Math.PI, 0); g.fill(); }
  for (let i = 0; i < 7; i++) { const x = ((i * 211 + 90) % (W + 100)) - 50, w = 46 * u, h = 26 * u; g.fillStyle = i % 2 ? '#e8d39a' : '#d9b46a'; g.fillRect(x, L.bankY - h, w, h); g.fillStyle = '#7a3a24'; g.beginPath(); g.moveTo(x - 6 * u, L.bankY - h); g.lineTo(x + w / 2, L.bankY - h - 16 * u); g.lineTo(x + w + 6 * u, L.bankY - h); g.fill(); }
  g.fillStyle = '#6f9a8c'; g.fillRect(0, L.bankY, W, L.counterY - L.bankY);
  g.strokeStyle = 'rgba(242,236,222,.55)'; g.lineWidth = 1.5 * u; g.beginPath();
  for (let r = 0; r < 6; r++) { const y = L.waterY + r * (L.counterY - L.waterY) / 6, off = (P4.t * (8 + r * 4)) % 70; for (let x = -70 + off; x < W; x += 70) { g.moveTo(x, y); g.quadraticCurveTo(x + 10 * u, y - 3 * u, x + 20 * u, y); } } g.stroke();
  for (let i = 0; i < 2; i++) { const bx = ((P4.t * (14 + i * 9) + i * 400) % (W + 300)) - 150, by = L.waterY + (i ? 30 : 8) * u; g.fillStyle = i ? '#a3332a' : '#2f6a4c'; g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.moveTo(bx - 60 * u, by); g.quadraticCurveTo(bx, by + 18 * u, bx + 60 * u, by); g.lineTo(bx + 50 * u, by + 6 * u); g.quadraticCurveTo(bx, by + 20 * u, bx - 50 * u, by + 6 * u); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#c9a45a'; g.beginPath(); g.ellipse(bx, by - 2 * u, 24 * u, 12 * u, 0, Math.PI, 0); g.fill(); g.stroke(); }
  // the customers outside the counter (only their upper half shows over it), their orders and patience
  for (const c of P4T.cust) {
    const x = L.slots[c.slot] + (1 - c.in) * 60 + (c.leaving ? c.leaving * 120 : 0), a = c.leaving ? Math.max(0, 1 - c.leaving * 1.25) : c.in;
    g.save(); g.globalAlpha = a; p4Folk(g, c, x, L.counterY + 50 * L.custS, L.custS); g.restore();
    if (!c.leaving) p4TemOrder(g, L, c, x);
    if (c.say) { const B = c4Bubble(c.say.text, 0, 13, 150), sc = 1.25 * Math.max(.8, L.u); g.save(); g.globalAlpha = Math.min(1, (c.say.life - c.say.t) * 4); const bx = Math.max(B.w / 2 * sc + 6, Math.min(L.W - B.w / 2 * sc - 6, x)); dp(g, B, bx, p4TemOrderY(L) - (13 * L.u + 4) - 14, 0, sc, sc); g.restore(); }   // what they say, over their order, kept inside the screen
  }
  // the window's wooden frame and lanterns: we are inside the shop
  g.fillStyle = '#5b2f1f'; g.fillRect(0, 0, W, 16 * u); g.fillRect(0, 0, 14 * u, L.counterY); g.fillRect(W - 14 * u, 0, 14 * u, L.counterY);
  for (const lx of [W * .2, W * .5, W * .8]) { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(lx, 16 * u); g.lineTo(lx, 26 * u); g.stroke(); g.fillStyle = '#c4473a'; g.beginPath(); g.ellipse(lx, 38 * u, 11 * u, 13 * u, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#2a221d'; g.fillRect(lx - 5 * u, 24 * u, 10 * u, 3 * u); g.fillRect(lx - 5 * u, 50 * u, 10 * u, 3 * u); }
  // the counter, the two trays, the ingredients
  gr = g.createLinearGradient(0, L.counterY, 0, H); gr.addColorStop(0, '#8a5a2a'); gr.addColorStop(.08, '#6b3f1f'); gr.addColorStop(1, '#4a2a16'); g.fillStyle = gr; g.fillRect(0, L.counterY, W, H - L.counterY);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, L.counterY); g.lineTo(W, L.counterY); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.beginPath(); for (let y = L.counterY + 30 * u; y < H; y += 26 * u) { g.moveTo(0, y); g.lineTo(W, y); } g.stroke();
  P4T.boards.forEach((b, i) => p4TemBoard(g, L, b, i));
  P4_TEM_ING.forEach((ing, i) => p4TemIng(g, L, ing, i));
  for (const f of P4T.fx) { const k = f.t / 1.2; g.save(); g.globalAlpha = 1 - k * k; g.font = `900 ${26 * u}px "Playfair Display", serif`; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#f2ecde'; g.fillStyle = f.ok ? '#2f6a4c' : '#a3332a'; g.strokeText(f.s, f.x, f.y - k * 40); g.fillText(f.s, f.x, f.y - k * 40); g.restore(); }
  // the shift's clock and takings
  const left = Math.max(0, Math.ceil(P4_TEM_SHIFT - P4T.t));
  $('#p4temTime').textContent = `Còn ${left} giây`; $('#p4temMoney').textContent = `Thu ${c4Money(P4T.earned)} · trầu ${SAVE4B.stock}`;
}
// the ingredients drawn after the real things: a heart-shaped betel leaf with its veins, a Bát Tràng lime pot with its spatula,
// slices of fresh areca (green rind, marbled flesh) and of dried areca, a curl of red chay bark, the folded phoenix wing pinned
// with a sliver of bamboo, a bamboo basket for throwing a quid away. mode: 'pile' on the counter's dishes, 'on' on the tray.
function p4TemLeaf(g, r, rot, dark) {
  g.save(); g.rotate(rot || 0);
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, dark ? '#4f9a48' : '#6cb85c'); gr.addColorStop(.55, dark ? '#2c6e34' : '#3a8a40'); gr.addColorStop(1, '#1d5428');
  g.fillStyle = gr; g.strokeStyle = '#15361b'; g.lineWidth = Math.max(1, r * .06);
  g.beginPath(); g.moveTo(0, -r * .68);
  g.bezierCurveTo(r * .38, -r * 1.06, r * 1.02, -r * .86, r * .92, -r * .2); g.bezierCurveTo(r * .82, r * .38, r * .32, r * .72, 0, r);
  g.bezierCurveTo(-r * .32, r * .72, -r * .82, r * .38, -r * .92, -r * .2); g.bezierCurveTo(-r * 1.02, -r * .86, -r * .38, -r * 1.06, 0, -r * .68);
  g.fill(); g.stroke();
  g.strokeStyle = 'rgba(190,230,150,.75)'; g.lineWidth = Math.max(.8, r * .045); g.beginPath(); g.moveTo(0, -r * .66); g.lineTo(0, r * .9);
  for (const k of [-1, 1]) { g.moveTo(0, -r * .6); g.quadraticCurveTo(k * r * .55, -r * .2, k * r * .42, r * .5); g.moveTo(0, -r * .62); g.quadraticCurveTo(k * r * .72, -r * .55, k * r * .8, -r * .05); g.moveTo(0, -r * .1); g.quadraticCurveTo(k * r * .3, r * .1, k * r * .26, r * .62); }
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-r * .38, -r * .42, r * .26, r * .12, -.6, 0, 6.283); g.fill();
  g.strokeStyle = '#4d6a2a'; g.lineWidth = Math.max(1.2, r * .08); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * .7); g.quadraticCurveTo(r * .04, -r * .95, r * .18, -r * 1.08); g.stroke();
  g.restore();
}
function p4TemSlice(g, r, rot) {   // a slice of fresh areca: green rind, cream flesh marbled red-brown
  g.save(); g.rotate(rot || 0); g.lineWidth = Math.max(1, r * .07); g.strokeStyle = INK;
  let gr = g.createLinearGradient(0, -r * .6, 0, r * .6); gr.addColorStop(0, '#a6cc58'); gr.addColorStop(1, '#5d8a28');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * .82, r * .6, 0, 0, 6.283); g.fill(); g.stroke();
  gr = g.createRadialGradient(0, 0, r * .05, 0, 0, r * .62); gr.addColorStop(0, '#d9a07a'); gr.addColorStop(.35, '#f3e4c4'); gr.addColorStop(1, '#e9d3a0');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * .62, r * .43, 0, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(150,80,45,.75)'; g.lineWidth = Math.max(.7, r * .04); g.beginPath();
  for (let i = 0; i < 9; i++) { const t = i / 9 * 6.283, c = Math.cos(t), sn = Math.sin(t); g.moveTo(c * r * .12, sn * r * .08); g.quadraticCurveTo(c * r * .36 + sn * r * .08, sn * r * .26, c * r * .55, sn * r * .38); }
  g.stroke(); g.restore();
}
function p4TemDry(g, r, rot) {   // a slice of dried areca: brown, puckered, a net of pale grain
  g.save(); g.rotate(rot || 0); g.lineWidth = Math.max(1, r * .07); g.strokeStyle = INK;
  const gr = g.createRadialGradient(-r * .2, -r * .2, r * .1, 0, 0, r * .8); gr.addColorStop(0, '#b88048'); gr.addColorStop(1, '#6e3f1c');
  g.fillStyle = gr; g.beginPath();
  for (let i = 0; i <= 14; i++) { const t = i / 14 * 6.283, rr = r * (.66 + (i % 2 ? .05 : -.03)); i ? g.lineTo(Math.cos(t) * rr, Math.sin(t) * rr * .82) : g.moveTo(Math.cos(t) * rr, Math.sin(t) * rr * .82); }
  g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(230,195,140,.7)'; g.lineWidth = Math.max(.7, r * .04); g.beginPath();
  for (let i = 0; i < 6; i++) { const t = i / 6 * 6.283 + .3; g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(t + .4) * r * .3, Math.sin(t + .4) * r * .25, Math.cos(t) * r * .55, Math.sin(t) * r * .45); }
  g.stroke(); g.fillStyle = '#4a2610'; g.beginPath(); g.arc(0, 0, r * .09, 0, 6.283); g.fill(); g.restore();
}
function p4TemBark(g, r, rot) {   // a curl of red chay bark, rough at the edges, fibres along it
  g.save(); g.rotate(rot || 0); g.lineWidth = Math.max(1, r * .07); g.strokeStyle = INK;
  const gr = g.createLinearGradient(0, -r * .2, 0, r * .2); gr.addColorStop(0, '#c4503c'); gr.addColorStop(1, '#7a2016');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r * .9, -r * .1);
  for (let i = 1; i <= 8; i++) g.lineTo(-r * .9 + i * r * .22, -r * .16 + (i % 2 ? -1 : 1) * r * .04);
  g.quadraticCurveTo(r * 1.05, 0, r * .86, r * .16);
  for (let i = 8; i >= 0; i--) g.lineTo(-r * .9 + i * r * .2, r * .17 + (i % 2 ? 1 : -1) * r * .035);
  g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(240,170,140,.55)'; g.lineWidth = Math.max(.6, r * .035); g.beginPath();
  for (const yy of [-.07, .03, .1]) { g.moveTo(-r * .8, yy * r); g.lineTo(r * .7, yy * r + r * .02); } g.stroke();
  g.fillStyle = '#5a140e'; g.beginPath(); g.ellipse(r * .84, r * .02, r * .1, r * .15, 0, 0, 6.283); g.fill(); g.restore();
}
function p4TemPot(g, r) {   // the Bát Tràng lime pot: a round glazed belly with blue bands, the white lime at its mouth, the spatula
  g.lineWidth = Math.max(1, r * .07); g.strokeStyle = INK;
  g.strokeStyle = '#6b4220'; g.lineCap = 'round'; g.lineWidth = Math.max(1.4, r * .09); g.beginPath(); g.moveTo(r * .05, -r * .35); g.lineTo(r * .55, -r * 1.02); g.stroke();
  g.strokeStyle = INK; g.lineWidth = Math.max(1, r * .07);
  let gr = g.createRadialGradient(-r * .25, 0, r * .1, 0, r * .25, r * .8); gr.addColorStop(0, '#fbf7ec'); gr.addColorStop(1, '#c9bf9f');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, r * .28, r * .74, r * .6, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = '#2f5a9a'; g.lineWidth = Math.max(.8, r * .05); g.beginPath(); g.ellipse(0, r * .28, r * .74, r * .14, 0, 0, 3.1416); g.stroke();
  g.beginPath(); for (let i = -2; i <= 2; i++) { const x = i * r * .26; g.moveTo(x - r * .08, r * .52); g.quadraticCurveTo(x, r * .4, x + r * .08, r * .52); } g.stroke();
  g.strokeStyle = INK; g.lineWidth = Math.max(1, r * .07);
  g.fillStyle = '#d8ccae'; g.fillRect(-r * .24, -r * .38, r * .48, r * .2); g.strokeRect(-r * .24, -r * .38, r * .48, r * .2);
  gr = g.createRadialGradient(-r * .05, -r * .5, r * .02, 0, -r * .42, r * .36); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e2ddd2');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r * .3, -r * .36); g.quadraticCurveTo(-r * .32, -r * .62, -r * .1, -r * .6); g.quadraticCurveTo(0, -r * .74, r * .14, -r * .6); g.quadraticCurveTo(r * .34, -r * .6, r * .3, -r * .36); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-r * .38, r * .12, r * .12, r * .22, -.3, 0, 6.283); g.fill();
}
function p4TemSmear(g, r) {   // a dab of lime spread on the leaf
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(r * .04, r * .06, r * .5, r * .3, -.2, 0, 6.283); g.fill();
  g.fillStyle = '#f7f4ec'; g.strokeStyle = 'rgba(40,30,20,.45)'; g.lineWidth = Math.max(.8, r * .05); g.beginPath();
  for (let i = 0; i <= 12; i++) { const t = i / 12 * 6.283, rr = r * (.42 + (i % 3 ? .06 : -.04)); i ? g.lineTo(Math.cos(t) * rr * 1.15, Math.sin(t) * rr * .7) : g.moveTo(Math.cos(t) * rr * 1.15, Math.sin(t) * rr * .7); }
  g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(200,195,185,.8)'; g.beginPath(); g.moveTo(-r * .3, 0); g.quadraticCurveTo(0, -r * .1, r * .3, r * .02); g.stroke();
}
function p4TemWing(g, r) {   // the phoenix wing: the leaf folded into fanned feathers, pinned with a sliver of bamboo
  const lobes = [[-1.25, .82], [-.9, .98], [-.55, 1.08], [-.2, 1], [.15, .82]];
  for (const [a, k] of lobes) {
    g.save(); g.translate(-r * .45, r * .55); g.rotate(a);
    const L = r * 1.25 * k, gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, '#2d7436'); gr.addColorStop(1, '#6cb85c');
    g.fillStyle = gr; g.strokeStyle = '#15361b'; g.lineWidth = Math.max(1, r * .06);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .4, -r * .5, L, -r * .06); g.quadraticCurveTo(L * .6, r * .3, 0, 0); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(190,230,150,.7)'; g.lineWidth = Math.max(.7, r * .04); g.beginPath(); g.moveTo(r * .1, -r * .02); g.quadraticCurveTo(L * .5, -r * .14, L * .92, -r * .06); g.stroke();
    g.restore();
  }
  g.fillStyle = '#c4503c'; g.strokeStyle = INK; g.lineWidth = Math.max(1, r * .06); g.beginPath(); g.ellipse(-r * .4, r * .5, r * .22, r * .16, -.5, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = '#d9b26a'; g.lineCap = 'round'; g.lineWidth = Math.max(1.3, r * .08); g.beginPath(); g.moveTo(-r * .78, r * .82); g.lineTo(-r * .05, r * .18); g.stroke();
}
function p4TemBasket(g, r) {   // a bamboo basket to throw a quid away
  g.lineWidth = Math.max(1, r * .07); g.strokeStyle = INK;
  const gr = g.createLinearGradient(0, -r * .5, 0, r * .7); gr.addColorStop(0, '#d8b678'); gr.addColorStop(1, '#9a7238');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r * .72, -r * .45); g.lineTo(r * .72, -r * .45); g.lineTo(r * .5, r * .72); g.lineTo(-r * .5, r * .72); g.closePath(); g.fill(); g.stroke();
  g.save(); g.clip(); g.strokeStyle = 'rgba(90,60,25,.6)'; g.lineWidth = Math.max(.7, r * .05); g.beginPath();
  for (let y = -r * .3; y < r * .72; y += r * .2) { g.moveTo(-r, y); g.lineTo(r, y); }
  for (let x = -r * .6; x <= r * .6; x += r * .24) { g.moveTo(x, -r * .45); g.lineTo(x * .72, r * .72); }
  g.stroke(); g.restore();
  g.fillStyle = '#b8935a'; g.beginPath(); g.ellipse(0, -r * .45, r * .78, r * .14, 0, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#4a2f16'; g.beginPath(); g.ellipse(0, -r * .45, r * .62, r * .08, 0, 0, 6.283); g.fill();
}
function p4TemIcon(g, k, x, y, r, mode) {
  g.save(); g.translate(x, y); g.lineJoin = 'round';
  const pile = mode === 'pile';
  if (k === 'la') { if (pile) { p4TemLeaf(g, r * .95, -.45, true); g.translate(r * .12, r * .05); } p4TemLeaf(g, r, pile ? .2 : 0); }
  else if (k === 'voi') { if (mode === 'on') p4TemSmear(g, r); else p4TemPot(g, r); }
  else if (k === 'cau') { if (pile) { p4TemSlice(g, r * .8, -.5); g.translate(r * .3, r * .3); p4TemSlice(g, r * .8, .3); g.translate(-r * .55, r * .05); p4TemSlice(g, r * .8, .1); } else p4TemSlice(g, r, -.2); }
  else if (k === 'caukho') { if (pile) { g.translate(-r * .25, -r * .15); p4TemDry(g, r * .8, .2); g.translate(r * .5, r * .1); p4TemDry(g, r * .8, 1.1); g.translate(-r * .25, r * .35); p4TemDry(g, r * .8, 2); } else p4TemDry(g, r, 0); }
  else if (k === 'chay') { if (pile) { g.translate(0, -r * .25); p4TemBark(g, r, -.35); g.translate(0, r * .5); p4TemBark(g, r * .9, -.1); } else p4TemBark(g, r, -.45); }
  else if (k === 'gap') p4TemWing(g, r);
  else if (k === 'bo') p4TemBasket(g, r);
  g.restore();
}
function p4TemIng(g, L, ing, i) {   // each ingredient in a glazed dish on the counter (the fold and the basket on their own mats)
  const [x, y] = L.ing[i], r = L.ingR;
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x + 3, y + 5, r, r * .96, 0, 0, 6.283); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2;
  if (ing.k === 'gap' || ing.k === 'bo') { g.fillStyle = ing.k === 'gap' ? '#e2b43c' : '#b9b0a4'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = 'rgba(42,34,29,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r * .84, 0, 6.283); g.stroke(); }
  else {
    let gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, '#fbf8ef'); gr.addColorStop(1, '#d7cfbd');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#2f5a9a'; g.lineWidth = Math.max(1.2, r * .05); g.beginPath(); g.arc(x, y, r * .86, 0, 6.283); g.stroke();
    g.fillStyle = '#2f5a9a'; for (let j = 0; j < 12; j++) { const t = j / 12 * 6.283; g.beginPath(); g.arc(x + Math.cos(t) * r * .93, y + Math.sin(t) * r * .93, r * .035, 0, 6.283); g.fill(); }
    gr = g.createRadialGradient(x, y + r * .1, r * .1, x, y, r * .78); gr.addColorStop(0, '#efe8d8'); gr.addColorStop(1, '#ddd3bd');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * .78, 0, 6.283); g.fill();
  }
  p4TemIcon(g, ing.k, x, y - r * .04, r * .6, 'pile');
  g.font = `700 ${Math.max(12, r * .34)}px 'Be Vietnam Pro', sans-serif`; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(42,26,14,.8)'; g.strokeText(ing.name, x, y + r + 13 * L.u); g.fillStyle = '#f2ecde'; g.fillText(ing.name, x, y + r + 13 * L.u);
}
function p4TemBoard(g, L, b, i) {   // a red lacquered betel tray with a gold rim; the quid built on it
  const [x0, y] = L.boards[i], sh = P4T.shake && P4T.shake.i === i ? Math.sin(P4T.shake.t * 60) * 5 : 0, x = x0 + sh, r = L.boardR, sel = P4T.sel === i;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 4, y + 8, r, r * .55, 0, 0, 6.283); g.fill();
  g.fillStyle = '#5a1410'; g.beginPath(); g.ellipse(x, y + r * .07, r, r * .55, 0, 0, 6.283); g.fill();
  let gr = g.createLinearGradient(x, y - r * .55, x, y + r * .55); gr.addColorStop(0, '#c23b2e'); gr.addColorStop(1, '#7e1c16');
  g.fillStyle = gr; g.strokeStyle = sel ? '#f7d548' : INK; g.lineWidth = sel ? 4 : 2; g.beginPath(); g.ellipse(x, y, r, r * .55, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = '#e0b04a'; g.lineWidth = Math.max(1.5, r * .03); g.beginPath(); g.ellipse(x, y, r * .9, r * .49, 0, 0, 6.283); g.stroke();
  gr = g.createRadialGradient(x - r * .2, y - r * .15, r * .05, x, y, r * .8); gr.addColorStop(0, '#9e2a20'); gr.addColorStop(1, '#6a1611');
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + r * .02, r * .8, r * .42, 0, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(224,176,74,.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + r * .02, r * .72, r * .36, 0, 0, 6.283); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(x - r * .45, y - r * .3, r * .3, r * .06, -.15, 0, 6.283); g.fill();
  if (!b.items.length) return;
  if (b.fold) { p4TemIcon(g, 'gap', x + r * .05, y - r * .1, r * .62); return; }
  g.save(); g.translate(x, y - r * .02); g.scale(1, .8); p4TemLeaf(g, r * .66, 1.35); g.restore();
  const at = { voi: [-.12, -.08, .38], cau: [.26, .0, .34], caukho: [.26, .0, .34], chay: [-.1, .14, .4] };
  for (const k of ['voi', 'cau', 'caukho', 'chay']) if (b.items.includes(k)) { const [dx, dy, s] = at[k]; p4TemIcon(g, k, x + dx * r, y + dy * r, s * r, 'on'); }
}
// the order bubble over a customer: the pictures of what they want, and their patience
function p4TemOrder(g, L, c, x) {
  const need = c.order.fold ? [...c.order.need, 'gap'] : c.order.need, r = 13 * L.u + 4, w = need.length * r * 2.1 + 12, y = p4TemOrderY(L);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - r - 6, w, r * 2 + 12, 10) : g.rect(x - w / 2, y - r - 6, w, r * 2 + 12); g.fill(); g.stroke();
  need.forEach((k, j) => p4TemIcon(g, k, x - w / 2 + 6 + r * 1.05 + j * r * 2.1, y, r * .85));
  const k = Math.max(0, c.pat / c.patMax); g.fillStyle = '#e6dccb'; g.fillRect(x - w / 2, y + r + 9, w, 6); g.fillStyle = k > .5 ? '#4f9a4a' : k > .25 ? '#e0b43a' : '#b8412e'; g.fillRect(x - w / 2, y + r + 9, w * k, 6); g.strokeRect(x - w / 2, y + r + 9, w, 6);
}
{
  const hud = document.createElement('div'); hud.id = 'p4temHud'; hud.hidden = true;
  hud.innerHTML = '<div class="tag" id="p4temTime"></div><div class="tag" id="p4temMoney"></div><button class="tag" id="p4temQuit">Thôi, ra phố</button><button class="tag more" id="p4temMore" hidden></button>';
  const end = document.createElement('div'); end.id = 'p4temEnd'; end.className = 'c4sheet p4sheet'; end.hidden = true;
  end.innerHTML = '<div class="card4"><h3>Hết ca têm trầu</h3><div id="p4temEndB"></div><div class="row"><button class="btn" id="p4temAgain">Têm tiếp</button><button class="btn alt" id="p4temOut">Ra phố</button></div></div>';
  document.body.append(hud, end);
  $('#p4temQuit').addEventListener('click', () => { AU.tap(); p4TemStop(); });
  $('#p4temMore').addEventListener('click', () => { AU.tap(); p4TemFetch(); });
  $('#p4temAgain').addEventListener('click', () => { AU.tap(); p4Sheets(null); p4TemStart(); });
  $('#p4temOut').addEventListener('click', () => { AU.tap(); p4Sheets(null); });
}
