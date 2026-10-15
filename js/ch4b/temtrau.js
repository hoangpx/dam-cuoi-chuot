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
const p4TemOrderY = L => L.counterY - 118 * L.custS - (13 * L.u + 4) - 10;   // the order bubble's middle: above the head and a hat
function p4TemStart() {
  if (!SAVE4B.house) return;
  if (SAVE4B.stock <= 0) { toast('Hết trầu trong nhà. Nhập trầu trước đã.', 2.6); return; }
  p4Sheets(null); $('#p4hud').hidden = true; $('#p4temHud').hidden = false;
  Object.assign(P4T, { on: true, t: 0, cust: [], boards: [{ items: [], fold: false }, { items: [], fold: false }], sel: 0, next: 1.2, served: 0, wrong: 0, missed: 0, earned: 0, fx: [], shake: null });
}
function p4TemStop() {
  P4T.on = false; $('#p4temHud').hidden = true; $('#p4hud').hidden = false; p4Persist(); p4Hud();
  $('#p4temEndB').innerHTML = `<p>Đưa đúng <b>${P4T.served}</b> miếng trầu · thu <b>${c4Money(P4T.earned)}</b></p>`
    + (P4T.wrong ? `<p>Đưa nhầm ${P4T.wrong} lần</p>` : '') + (P4T.missed ? `<p class="bad">${P4T.missed} khách chờ lâu bỏ đi</p>` : '') + `<p>Trầu còn: ${SAVE4B.stock} miếng</p>`;
  p4Sheets('p4temEnd');
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
  // customers come, faster as the shift goes on (not in the last seconds)
  if (P4T.t < P4_TEM_SHIFT - 6 && (P4T.next -= dt) <= 0) {
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
function p4TemAdd(k) {
  const b = P4T.boards[P4T.sel], has = b.items.includes('la'), bad = () => { P4T.shake = { i: P4T.sel, t: 0 }; };
  if (k === 'bo') { b.items = []; b.fold = false; return; }
  if (k === 'la') { if (b.items.length) return bad(); if (SAVE4B.stock <= 0) { toast('Hết trầu trong nhà!', 2); return bad(); } SAVE4B.stock--; b.items.push('la'); return; }
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
    if (c.say) { const B = c4Bubble(c.say.text, 0, 13, 150), sc = 1.25 * Math.max(.8, L.u); g.save(); g.globalAlpha = Math.min(1, (c.say.life - c.say.t) * 4); dp(g, B, x, p4TemOrderY(L) - (13 * L.u + 4) - 14, 0, sc, sc); g.restore(); }   // what they say, over their order
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
// a little picture for each ingredient (used on the counter, on the trays and in the orders)
function p4TemIcon(g, k, x, y, r) {
  g.save(); g.translate(x, y); g.strokeStyle = INK; g.lineWidth = Math.max(1.2, r * .08); g.lineJoin = 'round';
  if (k === 'la') { g.fillStyle = '#3f8a4a'; g.beginPath(); g.moveTo(0, -r); g.bezierCurveTo(r * 1.1, -r * .6, r * .8, r * .7, 0, r); g.bezierCurveTo(-r * .8, r * .7, -r * 1.1, -r * .6, 0, -r); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0, -r * .8); g.lineTo(0, r * .8); g.stroke(); }
  else if (k === 'voi') { g.fillStyle = '#efe8da'; g.beginPath(); g.ellipse(0, r * .2, r * .8, r * .5, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-r * .2, 0, r * .25, 0, 6.283); g.fill(); }
  else if (k === 'cau') { g.fillStyle = '#d8d26a'; g.beginPath(); g.ellipse(0, 0, r * .75, r * .55, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#e8c890'; g.beginPath(); g.ellipse(0, 0, r * .45, r * .3, 0, 0, 6.283); g.fill(); }
  else if (k === 'caukho') { g.fillStyle = '#8a5a2a'; g.beginPath(); g.ellipse(0, 0, r * .7, r * .5, 0, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = '#c9a070'; g.lineWidth = 1; g.beginPath(); g.moveTo(-r * .4, 0); g.lineTo(r * .4, 0); g.moveTo(0, -r * .3); g.lineTo(0, r * .3); g.stroke(); }
  else if (k === 'chay') { g.fillStyle = '#a3332a'; g.rotate(-.5); g.fillRect(-r * .8, -r * .14, r * 1.6, r * .28); g.strokeRect(-r * .8, -r * .14, r * 1.6, r * .28); }
  else if (k === 'gap') { g.fillStyle = '#3f8a4a'; g.beginPath(); g.moveTo(-r * .8, r * .6); g.quadraticCurveTo(-r * .1, -r * .2, r * .2, -r * .9); g.quadraticCurveTo(r * .4, -r * .1, r * .85, r * .1); g.quadraticCurveTo(r * .2, r * .2, -r * .8, r * .6); g.fill(); g.stroke(); g.fillStyle = '#a3332a'; g.beginPath(); g.arc(r * .2, -r * .8, r * .14, 0, 6.283); g.fill(); }
  else if (k === 'bo') { g.fillStyle = '#7a4a22'; g.fillRect(-r * .6, -r * .5, r * 1.2, r * 1.2); g.strokeRect(-r * .6, -r * .5, r * 1.2, r * 1.2); g.beginPath(); g.moveTo(-r * .75, -r * .6); g.lineTo(r * .75, -r * .6); g.stroke(); }
  g.restore();
}
function p4TemIng(g, L, ing, i) {
  const [x, y] = L.ing[i], r = L.ingR;
  g.fillStyle = ing.k === 'gap' ? '#e2b43c' : ing.k === 'bo' ? '#b9b0a4' : '#efe2c0'; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke();
  p4TemIcon(g, ing.k, x, y - r * .1, r * .55);
  g.fillStyle = '#f2ecde'; g.font = `700 ${Math.max(12, r * .34)}px 'Be Vietnam Pro', sans-serif`; g.textAlign = 'center'; g.fillText(ing.name, x, y + r + 13 * L.u);
}
function p4TemBoard(g, L, b, i) {
  const [x0, y] = L.boards[i], sh = P4T.shake && P4T.shake.i === i ? Math.sin(P4T.shake.t * 60) * 5 : 0, x = x0 + sh, r = L.boardR;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 4, y + 6, r, r * .55, 0, 0, 6.283); g.fill();
  g.fillStyle = '#c9a45a'; g.strokeStyle = P4T.sel === i ? '#f2c640' : INK; g.lineWidth = P4T.sel === i ? 4 : 2; g.beginPath(); g.ellipse(x, y, r, r * .55, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r * .8, r * .42, 0, 0, 6.283); g.stroke();
  if (!b.items.length) return;
  if (b.fold) { p4TemIcon(g, 'gap', x, y - r * .1, r * .55); }
  else {
    p4TemIcon(g, 'la', x, y - r * .05, r * .5);
    b.items.filter(k => k !== 'la').forEach((k, j) => p4TemIcon(g, k, x + (j - 1) * r * .28, y - r * .05 + (j % 2) * r * .1, r * .28));
  }
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
  hud.innerHTML = '<div class="tag" id="p4temTime"></div><div class="tag" id="p4temMoney"></div><button class="tag" id="p4temQuit">Thôi, ra phố</button>';
  const end = document.createElement('div'); end.id = 'p4temEnd'; end.className = 'c4sheet p4sheet'; end.hidden = true;
  end.innerHTML = '<div class="card4"><h3>Hết ca têm trầu</h3><div id="p4temEndB"></div><div class="row"><button class="btn" id="p4temAgain">Têm tiếp</button><button class="btn alt" id="p4temOut">Ra phố</button></div></div>';
  document.body.append(hud, end);
  $('#p4temQuit').addEventListener('click', () => { AU.tap(); p4TemStop(); });
  $('#p4temAgain').addEventListener('click', () => { AU.tap(); p4Sheets(null); p4TemStart(); });
  $('#p4temOut').addEventListener('click', () => { AU.tap(); p4Sheets(null); });
}
