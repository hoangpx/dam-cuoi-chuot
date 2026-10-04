/* ---------- who sells (owner): the couple can mind every stall themselves, running from one to the next; the husband also
   fetches the goods, so with many stalls buyers wait long. Each stall can hire helpers (several when it is busy), each paid
   a wage every evening: profit and loss are the player's to weigh. ----------
   SAVE4.hands[g] = [{ name, sort, unpaid, wageUp, sick, nowage, quit }]. C4.SV[g] = the sales going on at a stall,
   [{ who, t, by }] with by = C4.wife, C4.porter or a helper. */
const C4_HANDS_MAX = 3, C4_COUPLE_SP = 120;
C4_GOODS.trau.wage = 6;
function c4Hands(g) {
  const H = SAVE4.hands || (SAVE4.hands = {});
  if (!H[g]) H[g] = [];
  const s = g !== 'trau' && SAVE4.shops && SAVE4.shops[g];
  if (s && s.staff) { H[g].push({ name: s.staff, sort: s.sort || 1, unpaid: s.unpaid || 0, wageUp: s.wageUp || 0 }); delete s.staff; }   // old saves: one helper per stall
  return H[g];
}
const c4HandsOn = g => c4Own(g) || g === 'trau' ? c4Hands(g).filter(h => !h.sick && !h.trip) : [];   // (one out fetching goods is not at the stall)
const c4Wage = (g, h) => Math.max(20, Math.round(C4_GOODS[g].wage * 2.5)) + (h.wageUp || 0);   // a player: a few tens of đồng a day (they also fetch goods)
const c4AllHands = () => c4Owned().flatMap(g => c4Hands(g).map(h => ({ g, h })));
// where the k-th seller stands behind a stall
const c4SellX = (g, k) => (g === 'trau' ? C4_STALL - (SAVE4.lv ? 70 : 130) : C4_GOODS[g].x - 80) - k * 46;
const c4HusbFree = () => ['idle', 'walk', 'sell'].includes(C4.porter.st);
const c4SaleBy = m => { for (const g in C4.SV) { const a = C4.SV[g]; if (a) for (const sv of a) if (sv.by === m) return sv; } return null; };
// places behind a stall: the helpers first, then the wife and the husband heading there (fixed, so nobody shuffles)
const c4Places = g => [...c4HandsOn(g), ...[C4.wife, C4.porter].filter(m => m.to === g && (m === C4.wife || c4HusbFree()))];
const c4SlotOf = (g, m) => { const L = c4Places(g), i = L.indexOf(m); return i < 0 ? L.length : i; };
// who can sell there right now: the helpers, and whichever of the couple has arrived
const c4Sellers = g => [...c4HandsOn(g), ...[C4.wife, C4.porter].filter(m => m.at === g && m.st !== 'walk' && (m === C4.wife || C4.porter.st === 'sell'))];

function c4SellersUpdate(dt) {
  const W = C4.wife, P = C4.porter;
  if (W.x == null) Object.assign(W, { x: c4SellX('trau', 0), at: 'trau', st: 'stand', face: 1, ph: 0 });
  for (const g of Object.keys(C4_GOODS)) if (!Array.isArray(C4.SV[g])) C4.SV[g] = [];
  const open = C4.phase === 'open';
  const want = g => (C4.Q[g] || []).filter(w => !C4.SV[g].some(s => s.who === w)).length;   // buyers not being served yet
  const members = [W];                                                      // the husband never sells: he fetches the goods and calls people in (c4HusbTout)
  for (const m of members) {
    if (c4SaleBy(m)) continue;
    let to = null;
    if (open) {
      // what each stall still needs once its helpers and the other partner are counted
      const need = g => { if (!c4Stock(g) || !c4Open(g)) return 0; const free = c4HandsOn(g).filter(h => !c4SaleBy(h)).length + members.filter(o => o !== m && o.to === g && !c4SaleBy(o)).length; return want(g) - free; };
      const here = m.to && need(m.to) > 0 && !(m === P && m.to === 'trau') ? m.to : null;   // the husband never sells betel: she does (a player found two at it far too easy)
      if (here) to = here;
      else { let best = -1e9; for (const g of c4Owned()) { if (m === P && g === 'trau') continue; const n = need(g); if (n <= 0) continue; const q = C4.Q[g][0], sc = n * 40 + (q ? q.wait : 0) * 6 - Math.abs(c4SellX(g, 0) - m.x) / 30; if (sc > best) { best = sc; to = g; } } }
    }
    if (m === W) to = to || 'trau';
    m.to = to;
    const tx = to ? c4SellX(to, c4SlotOf(to, m)) : c4HusbX(), dx = tx - m.x;
    if (Math.abs(dx) > 4) { m.st = 'walk'; m.at = null; m.x += Math.sign(dx) * Math.min(Math.abs(dx), C4_COUPLE_SP * dt); m.face = Math.sign(dx); m.ph = (m.ph || 0) + dt * 10; if (m === P) P.z += (C4_WIFE_Z - P.z) * Math.min(1, dt * 4); }
    else { m.x = tx; m.at = to; m.face = 1; m.st = m === W ? 'stand' : to ? 'sell' : 'idle'; if (m === P) P.z = to ? C4_WIFE_Z : .04; }
  }
}
// each stall: every seller there takes the next buyer who has reached the queue
function c4ServeUpdate(dt) {
  for (const g of c4Owned()) {
    const q = C4.Q[g], A = C4.SV[g]; if (!q || !A) continue;
    if (c4Stock(g) > 0 && c4Open(g) && !(C4.shut > 0)) for (const m of c4Sellers(g)) {
      if (c4SaleBy(m)) continue;
      const w = q.find(w => !w.moving && !A.some(s => s.who === w)); if (!w) break;
      A.push({ who: w, t: 0, by: m }); c4Say(w, g === 'trau' ? c4Pick(C4_BUY).replace('{n}', w.n) : c4Pick(C4_WANT[g]).replace('{n}', w.n));
    }
    for (const sv of [...A]) {
      if (q.indexOf(sv.who) < 0 || (sv.by.st === 'walk') || (sv.by === C4.porter && !c4HusbFree())) { A.splice(A.indexOf(sv), 1); continue; }   // the buyer left, or the seller was called away
      sv.t += dt;
      if (sv.t < (g === 'trau' ? c4Lv().serve : C4_GOODS[g].serve * c4SLv(g).serve) + .6) continue;
      const w = sv.who, n = Math.min(w.n, c4Stock(g)), pay = c4Pay(w, n * c4Price(g)); SAVE4.sold = (SAVE4.sold || 0) + n;
      c4SetStock(g, c4Stock(g) - n); SAVE4.money += pay; C4.today.sold += n; C4.today.take += pay; C4.today.cogs += n * c4Unit(g); C4.today.served++;
      { const B = (C4.today.by = C4.today.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.take += pay; b.cogs += n * c4Unit(g); b.n += n; }
      C4.fx.push({ x: C4_GOODS[g].x + 40, y: c4Y(C4_STALL_Z) - 210, t: 0, s: '+' + pay }); AU.pluck(84 + (pay % 5));
      if (w.kind === 'mouse' && g === 'trau') w.carry = MP.ladong;
      A.splice(A.indexOf(sv), 1);
      c4Say(sv.by, c4Pick(g === 'trau' ? C4_SELL : C4_THANKS)); c4Served(w); c4Leave(w, true); if (!w.guest) c4SitDown(w, g); c4Hud();
    }
  }
}
// how far a seller's arm is in a sale (0..1..0), for the drawing
const c4ServingK = (g, m) => { const sv = c4SaleBy(m); if (!sv) return 0; return Math.sin(Math.min(1, sv.t / ((g === 'trau' ? c4Lv().serve : C4_GOODS[g].serve * c4SLv(g).serve) + .6)) * Math.PI); };
function c4HandItems(items, g, head) {
  c4HandsOn(g).forEach(h => {
    const x = c4SellX(g, c4SlotOf(g, h));
    items.push({ z: C4_WIFE_Z, f: () => c4Mouse(ctx, c4MouseRig(h.sort || 1), x, 1, C4.t * 2 + x, false, -.2 - c4ServingK(g, h) * 1.1, null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), x) });
    head(x, C4_WIFE_Z, 168, h, 2);
  });
}
// the evening: every helper is paid; owed two evenings running, or lured away, they leave
function c4PayHands(d, quits) {
  for (const g of c4Owned()) {
    const H = c4Hands(g);
    for (const h of [...H]) {
      const wage = h.nowage ? 0 : c4Wage(g, h); h.nowage = false; h.sick = false; h.trip = false;
      if (h.quit) { quits.push(`${c4Cap1(h.name)} (${C4_GOODS[g].name.toLowerCase()}) bỏ việc.`); H.splice(H.indexOf(h), 1); continue; }
      if (SAVE4.money >= wage) { SAVE4.money -= wage; d.wages += wage; h.unpaid = 0; const B = (d.by = d.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.wage = (b.wage || 0) + wage; }
      else if (++h.unpaid >= 2) { quits.push(`${c4Cap1(h.name)} hai hôm không được trả công, bỏ việc.`); H.splice(H.indexOf(h), 1); }
    }
  }
}
// the "who sells" block on a stall's sheet
function c4HandsBlock(g) {
  const G = C4_GOODS[g], H = c4Hands(g), el = document.createElement('div'); el.className = 'hands';
  const draw = () => {
    el.innerHTML = `<h4>Người bán</h4><p class="hint">Vợ tự bán được, nhưng phải chạy qua chạy lại giữa các hàng, nên khách phải chờ lâu. Thuê người phụ thì bán nhanh, mỗi người công ${c4Money(c4Wage(g, {}))} một ngày, và khi chồng vắng thì người làm thuê đi lấy hàng thay.</p>`
      + (H.length ? H.map((h, i) => `<div class="hand"><span>${c4Cap1(h.name)}${h.sick ? ' · ốm, nghỉ' : ''} · công ${c4Money(c4Wage(g, h))}/ngày</span><button class="btn alt" data-off="${i}">Cho nghỉ</button></div>`).join('') : '<p>Chưa thuê ai: vợ tự trông.</p>')
      + (H.length < C4_HANDS_MAX ? `<button class="btn" data-hire="1">Thuê thêm một người · ${c4Money(c4Wage(g, {}))}/ngày</button>` : '');
    el.querySelector('[data-hire]')?.addEventListener('click', () => {
      H.push({ name: c4Pick(C4_NAMES.mouse.filter(n => !c4AllHands().some(o => o.h.name === n))), sort: c4Pick(C4_HELPERS), unpaid: 0 });
      AU.stamp(); toast(`${c4Cap1(H[H.length - 1].name)} nhận bán ${G.name.toLowerCase()}.`); persist4(); draw();
    });
    el.querySelectorAll('[data-off]').forEach(b => b.addEventListener('click', () => {
      const h = H[+b.dataset.off]; if (!h) return;
      for (const k in C4.SV) { const a = C4.SV[k]; if (a) for (const sv of [...a]) if (sv.by === h) a.splice(a.indexOf(sv), 1); }
      let paid = '';
      if (C4.phase === 'open' && !h.nowage) { const w = Math.min(Math.max(0, SAVE4.money), c4Wage(g, h)); SAVE4.money -= w; C4.today.wages += w; paid = `, trả công hôm nay ${c4Money(w)}`; }
      H.splice(H.indexOf(h), 1); toast(`${c4Cap1(h.name)} nghỉ việc${paid}.`); persist4(); c4Hud(); draw();
    }));
  };
  draw(); return el;
}

/* ---------- the husband between errands (a player): he strolls about in front of the stalls calling people in,
   and now and then talks a passer-by into buying at one of our stalls that has goods ---------- */
const C4_HUSB_INVITE = ['Mời cô bác ghé gánh nhà tôi!', 'Trầu ngon, chè nóng đây, mời vào!', 'Ghé xem một tí, không mua cũng được!', 'Bà con ơi, hàng nhà tôi tươi nhất chợ!', 'Mời bác ghé, vợ tôi bán vui lắm!', 'Ai đi qua cũng ghé một tí nào!'];
function c4HusbTout(dt) {
  const P = C4.porter; if (C4.phase !== 'open' || !(P.st === 'idle' || P.st === 'walk')) return;
  if (P.st === 'walk' && P.strollX == null) P.st = 'idle';
  if (P.strollX == null && (P.strollT = (P.strollT ?? 2) - dt) <= 0) { P.strollX = c4HusbX() - 80 + R() * 380; P.strollT = 4 + R() * 6; }
  if (P.strollX != null) {
    const dx = P.strollX - P.x;
    if (Math.abs(dx) > 3) { P.st = 'walk'; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 55 * dt); P.face = Math.sign(dx); P.ph = (P.ph || 0) + dt * 8; P.z += (.3 - P.z) * Math.min(1, dt * 2); }
    else { P.st = 'idle'; P.strollX = null; P.face = 1; }
  }
  if ((P.toutT = (P.toutT ?? 3) - dt) > 0) return;
  P.toutT = 5 + R() * 5;
  if (!P.say) c4Say(P, c4Pick(C4_HUSB_INVITE));
  const goods = c4Owned().filter(g => c4Stock(g) > 0 && c4Open(g)); if (!goods.length || R() > .4) return;
  const w = C4.walkers.find(w => w.st === 'walk' && !w.buy && !w.visit && !w.rival && w.kind === 'mouse' && !w.buf && !w.drunk && w.pid !== undefined && Math.abs(w.x - P.x) < 320);
  if (!w) return;
  const g = c4Pick(goods); Object.assign(w, { buy: true, shop: g, face: C4_GOODS[g].x + c4QX(g) > w.x ? 1 : -1 });
  setTimeout(() => c4Say(w, c4Pick(['Ừ thì ghé một tí!', 'Anh mời khéo thế, ghé xem!', 'Thôi được, mua ít!'])), 600);
}

/* ---------- a hired seller can fetch goods too (a player): when the husband is out, a restock order goes with a hired
   hand who is not mid-sale (one from that stall first); they leave their stall, walk off for the goods and come back to
   it. C4.trips = [{ h, home, x, z, st out|away|back, ph, say, good, qty, cost }]. ---------- */
const c4Tripping = h => !!h.trip;
// whoever can fetch now: the husband first, else a free hired hand (that stall's first)
function c4Carrier(g) {
  if (c4HusbFree()) return { who: C4.porter, name: 'chồng' };
  const free = gg => c4HandsOn(gg).filter(h => !c4SaleBy(h));
  const own = free(g)[0]; if (own) return { hand: own, home: g, name: own.name };
  for (const gg of c4Owned()) { const h = free(gg)[0]; if (h) return { hand: h, home: gg, name: h.name }; }
  return null;
}
function c4SendTrip(c, g, q, cost) {
  const h = c.hand; h.trip = true;
  (C4.trips = C4.trips || []).push({ h, home: c.home, x: c4SellX(c.home, 0), z: C4_WIFE_Z, st: 'out', ph: 0, say: null, t: 0, good: g, qty: q, cost });
}
function c4TripsUpdate(dt) {
  for (const p of [...(C4.trips || [])]) {
    if (p.st === 'out') { p.x -= 150 * dt; p.z = Math.min(.3, p.z + dt * .2); p.ph += dt * 10; if (p.x <= Math.min(C4_OFF, C4.camX - 110)) { p.st = 'away'; p.t = 2.4; } }
    else if (p.st === 'away') { if ((p.t -= dt) <= 0) p.st = 'back'; }
    else if (p.st === 'back') { const hx = c4SellX(p.home, 0); p.x += 140 * dt; p.ph += dt * 10; p.z += (C4_WIFE_Z - p.z) * Math.min(1, dt * 2);
      if (p.x >= hx) { c4Receive(p.good, p.qty, p.cost); p.h.trip = false; C4.trips.splice(C4.trips.indexOf(p), 1); c4Say(p.h, c4Pick(['Hàng về rồi đây!', 'Đủ cả, bà chủ đếm đi!', 'Nặng mà vui!'])); c4Hud(); } }
  }
}
function c4TripItems(items, head, vis) {
  for (const p of C4.trips || []) {
    if (p.st === 'away' || !vis(p.x, 80)) continue;
    const load = p.st === 'back', rig = c4MouseRig(p.h.sort || 5);
    items.push({ z: p.z, f: () => c4Mouse(ctx, rig, p.x, p.st === 'out' ? -1 : 1, p.ph, true, load ? -1.35 : null, load ? WP.basket : null, c4S(p.z), c4Y(p.z), 5.5) });
    head(p.x, p.z, 168, p, 2);
  }
}
