/* ---------- who sells (owner): the couple can mind every stall themselves, running from one to the next; the husband also
   fetches the goods, so with many stalls buyers wait long. Each stall can hire helpers (several when it is busy), each paid
   a wage every evening: profit and loss are the player's to weigh. ----------
   SAVE4.hands[g] = [{ name, sort, unpaid, wageUp, sick, nowage, quit }]. C4.SV[g] = the sales going on at a stall,
   [{ who, t, by }] with by = C4.wife, C4.porter or a helper. */
const C4_HANDS_MAX = 3, C4_COUPLE_SP = 120;
C4_GOODS.trau.wage = 6;
// a hired hand's name (a player hit an error): the old list had 11 names (one of them cụ Lý, the headman) for up to
// 3 helpers a stall, so the 12th hire got no name and the stall sheet broke. Young folk's names, never a villager's or
// another hand's; a numbered one if every name is taken
const C4_HAND_TITLES = ['anh', 'chị', 'cô', 'chú', 'cậu', 'thím'];
const C4_HAND_NAMES = ['Tèo', 'Tí', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Mùi', 'Dậu', 'Tuất', 'Hợi', 'Mít', 'Na', 'Bưởi', 'Cốm', 'Sen', 'Đào', 'Lựu', 'Ngô', 'Khoai', 'Bống', 'Cò', 'Tép', 'Hến', 'Thóc', 'Gạo', 'Vừng', 'Lạc', 'Nhãn'];
function c4HandName() {
  const taken = new Set(Object.values(SAVE4.hands || {}).flat().map(h => h && h.name));
  try { for (const p of c4People().list) taken.add(p.name); } catch (e) {}
  const free = [];
  for (const t of C4_HAND_TITLES) for (const n of C4_HAND_NAMES) if (!taken.has(t + ' ' + n)) free.push(t + ' ' + n);
  if (free.length) return c4Pick(free);
  for (let i = 1; ; i++) if (!taken.has('người làm thứ ' + i)) return 'người làm thứ ' + i;
}
// each hand is a person (owner): three traits 0..1 (speed sp: faster making and serving; warmth wm: customers like the
// stall more; honesty ho: less skimming) and a relationship rel 0..100 (60 at the start; refused raises and neglect lower it)
const c4TraitWord = v => v >= .66 ? 'cao' : v >= .33 ? 'vừa' : 'thấp';
// a bar like a health bar: red when low, yellow in the middle, green when high (owner)
const c4TraitBar = (lab, v) => { const c = v >= .66 ? '#4f9a4a' : v >= .33 ? '#e0b43a' : '#b8412e'; return `<div class="tbar"><span>${lab}</span><i><b style="width:${Math.round(Math.max(0, Math.min(1, v)) * 100)}%;background:${c}"></b></i></div>`; };
const c4NewHand = (g, name) => ({ name: name || c4HandName(), sort: c4Pick(C4_HELPERS), unpaid: 0, sp: R(), wm: R(), ho: R(), rel: 60, askDay: SAVE4.day });
const c4FixHand = h => { if (h.sp === undefined) h.sp = R(); if (h.wm === undefined) h.wm = R(); if (h.ho === undefined) h.ho = R(); if (h.rel === undefined) h.rel = 60; if (h.askDay === undefined) h.askDay = -9; return h; };
const c4Clamp01 = v => Math.max(0, Math.min(1, v));
const c4Drift = h => { h.sp = c4Clamp01(h.sp + .02); h.wm = c4Clamp01(h.wm + (R() - .5) * .06); h.ho = c4Clamp01(h.ho + (R() - .5) * .04); };
const c4HandRel = (h, d) => { h.rel = Math.max(0, Math.min(100, Math.round(h.rel + d))); };
function c4Hands(g) {
  const H = SAVE4.hands || (SAVE4.hands = {});
  if (!H[g]) H[g] = [];
  for (let i = H[g].length - 1; i >= 0; i--) if (!H[g][i]) H[g].splice(i, 1); else if (!H[g][i].name) H[g][i].name = c4HandName();   // saves hit by the old bug
  const s = g !== 'trau' && SAVE4.shops && SAVE4.shops[g];
  if (s && s.staff) { H[g].push({ name: s.staff, sort: s.sort || 1, unpaid: s.unpaid || 0, wageUp: s.wageUp || 0 }); delete s.staff; }   // old saves: one helper per stall
  H[g].forEach(c4FixHand);
  return H[g];
}
// how long a sale takes: a quick hand serves sooner (sp 0 → ×1.3, 1 → ×.7)
const c4ServeDur = (g, m) => (g === 'trau' ? c4Lv().serve : C4_GOODS[g].serve * c4SLv(g).serve) * (m && m.sp !== undefined ? 1.3 - .6 * m.sp : 1);
const c4HandsOn = g => c4Own(g) || g === 'trau' ? c4Hands(g).filter(h => !h.sick && !h.trip) : [];   // (one out fetching goods is not at the stall)
const c4WageAt = (g, i) => Math.max(20, Math.round(C4_GOODS[g].wage * 2.5)) * Math.pow(2, i);   // a player: the first hand a few tens of đồng a day; each next one costs twice the one before (owner)
const c4Wage = (g, h) => c4WageAt(g, Math.max(0, c4Hands(g).indexOf(h))) + (h.wageUp || 0);
const c4NextWage = g => c4WageAt(g, c4Hands(g).length);   // what the next hand would cost
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
      if (sv.t < c4ServeDur(g, sv.by) + .6) continue;
      const w = sv.who, n = Math.min(w.n, c4Stock(g)), pay = c4Pay(w, n * c4Price(g)); SAVE4.sold = (SAVE4.sold || 0) + n;
      c4SetStock(g, c4Stock(g) - n); SAVE4.money += pay; C4.today.sold += n; C4.today.take += pay; C4.today.cogs += n * c4Unit(g); C4.today.served++;
      { const B = (C4.today.by = C4.today.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.take += pay; b.cogs += n * c4Unit(g); b.n += n; }
      C4.fx.push({ x: C4_GOODS[g].x + 40, y: c4Y(C4_STALL_Z) - 210, t: 0, s: '+' + pay }); AU.pluck(84 + (pay % 5));
      if (w.kind === 'mouse' && g === 'trau') w.carry = MP.ladong;
      A.splice(A.indexOf(sv), 1);
      c4Say(sv.by, c4Pick(g === 'trau' ? C4_SELL : C4_THANKS)); c4Served(w);
      if (!w.guest && (w.wait || 0) < 5) C4.today.quick = (C4.today.quick || 0) + 1;     // served without a long wait (task 'hai')
      { const pp = w.pid !== undefined && c4People().list[w.pid]; if (pp && sv.by.wm !== undefined && R() < sv.by.wm * .5) c4Bump(pp.id, 1); }   // a warm hand wins a little liking (owner)
      c4Leave(w, true); if (!w.guest) c4SitDown(w, g); c4Hud();
    }
  }
}
// how far a seller's arm is in a sale (0..1..0), for the drawing
const c4ServingK = (g, m) => { const sv = c4SaleBy(m); if (!sv) return 0; return Math.sin(Math.min(1, sv.t / (c4ServeDur(g, m) + .6)) * Math.PI); };
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
      if (H.indexOf(h) < 0) continue;
      c4Drift(h);                                                             // worked today (owner)
      // owner: a hand only takes from the day's sales of the stall they work at (C4.today.by[g].take), never the whole purse.
      // at 20% relationship they often run off with that day's takings; otherwise a little theft, more from the dishonest and the aggrieved
      const tk = Math.min(SAVE4.money, (C4.today.by && C4.today.by[g] && C4.today.by[g].take) || 0);
      if (tk > 0 && h.rel <= 20 && R() < .5) { SAVE4.money -= tk; d.theft = (d.theft || 0) + tk; quits.push(`${c4Cap1(h.name)} ôm theo ${c4Money(tk)} tiền bán hàng hôm nay ở ${C4_GOODS[g].name.toLowerCase()} rồi biến mất.`); H.splice(H.indexOf(h), 1); continue; }
      if (tk > 0 && R() < .03 + (1 - h.ho) * .1 * (h.rel < 40 ? 2 : 1)) { const take = Math.min(tk, Math.max(10, Math.round(tk * (.2 + R() * .3)))); SAVE4.money -= take; d.theft = (d.theft || 0) + take; quits.push(`${c4Cap1(h.name)} lén lấy ${c4Money(take)} tiền bán hàng, bị đuổi.`); H.splice(H.indexOf(h), 1); }
    }
  }
}
// the "who sells" block on a stall's sheet
function c4HandsBlock(g) {
  const G = C4_GOODS[g], H = c4Hands(g), el = document.createElement('div'); el.className = 'hands';
  let apply = null;                                                       // the applicants for the hire, while the list is open
  const draw = () => {
    el.innerHTML = `<h4>Người bán</h4><p class="hint">Vợ tự bán được, nhưng phải chạy qua chạy lại giữa các hàng, nên khách phải chờ lâu. Thuê người phụ thì bán nhanh, người đầu công ${c4Money(c4WageAt(g, 0))} một ngày, người thứ hai gấp đôi, người thứ ba gấp đôi người thứ hai, và khi chồng vắng thì người làm thuê đi lấy hàng thay.</p>`
      + (H.length ? H.map((h, i) => `<div class="hand"><span><b>${c4Cap1(h.name)}</b>${h.sick ? ' · ốm, nghỉ' : ''} · công ${c4Money(c4Wage(g, h))}/ngày<div class="tbars">${c4TraitBar('nhanh nhẹn', h.sp)}${c4TraitBar('nhiệt tình', h.wm)}${c4TraitBar('trung thực', h.ho)}${c4TraitBar('quan hệ', h.rel / 100)}</div></span><button class="btn alt" data-off="${i}">Đuổi việc</button></div>`).join('') : '<p>Chưa thuê ai: vợ tự trông.</p>')
      + (apply ? c4ApplyHtml(g, apply) : H.length < C4_HANDS_MAX ? `<button class="btn" data-hire="1">Thuê thêm một người · ${c4Money(c4NextWage(g))}/ngày${H.length ? ` (đang thuê ${H.length})` : ''}</button>` : '');
    el.querySelector('[data-hire]')?.addEventListener('click', () => {
      if (H.length >= C4_HANDS_MAX || Date.now() - (c4HandsBlock.last || 0) < 800) { draw(); return; }   // (a double tap could hire past the limit; a lagging tap hired twice)
      c4HandsBlock.last = Date.now();
      apply = c4Applicants(g); draw();
    });
    el.querySelector('[data-apply-no]')?.addEventListener('click', () => { apply = null; draw(); });
    el.querySelectorAll('[data-app]').forEach(btn => btn.addEventListener('click', () => {
      const x = apply && apply[+btn.dataset.app];
      if (!x || H.length >= C4_HANDS_MAX) { apply = null; draw(); return; }
      const { ask, ...hand } = x;
      c4Khe({ title: 'Thuê người làm', a: ['Người làm', c4Cap1(hand.name)], what: 'Bán ' + G.name.toLowerCase() + ' thuê, công trả mỗi tối', money: ask, per: 'mỗi ngày', k: .6 }, () => {
        if (H.length >= C4_HANDS_MAX) { apply = null; draw(); return; }
        H.push({ ...hand, wageUp: ask - c4WageAt(g, H.length) }); apply = null;
        toast(`${c4Cap1(hand.name)} nhận bán ${G.name.toLowerCase()}, đòi công ${c4Money(ask)}/ngày.`); persist4(); draw();
      }); return;
    }));
    el.querySelectorAll('[data-off]').forEach(b => b.addEventListener('click', () => {
      const h = H[+b.dataset.off]; if (!h) return;
      for (const k in C4.SV) { const a = C4.SV[k]; if (a) for (const sv of [...a]) if (sv.by === h) a.splice(a.indexOf(sv), 1); }
      let paid = '';
      if (C4.phase === 'open' && !h.nowage) { const w = Math.min(Math.max(0, SAVE4.money), c4Wage(g, h)); SAVE4.money -= w; C4.today.wages += w; paid = `, trả công hôm nay ${c4Money(w)}`; }
      H.splice(H.indexOf(h), 1); toast(`${c4Cap1(h.name)} bị đuổi việc${paid}.`); persist4(); c4Hud(); draw();
    }));
  };
  draw(); return el;
}

// the people who come asking for work (owner): 3 to 7, more for a bigger stall; each has its own traits and asks a wage
// a little above or below the next one (a good hand asks more)
function c4Applicants(g) {
  const lv = g === 'trau' ? (SAVE4.lv || 0) : c4SLvI(g), n = Math.min(7, 3 + lv + (R() < .5 ? 1 : 0)), next = c4NextWage(g), out = [];
  for (let i = 0; i < n; i++) {
    let hand = c4NewHand(g); for (let t = 0; t < 5 && out.some(o => o.name === hand.name); t++) hand = c4NewHand(g);
    out.push({ ...hand, ask: Math.max(20, Math.round(next * (.6 + (hand.sp + hand.wm + hand.ho) * .33))) });
  }
  return out;
}
function c4ApplyHtml(g, L) {
  return `<h4>Người xin việc</h4><p class="hint">${L.length} người đến xin làm ${C4_GOODS[g].name.toLowerCase()}. Chọn một người, hoặc thôi.</p>`
    + L.map((x, i) => `<div class="hand app"><span><b>${c4Cap1(x.name)}</b> · đòi công ${c4Money(x.ask)}/ngày<div class="tbars">${c4TraitBar('nhanh nhẹn', x.sp)}${c4TraitBar('nhiệt tình', x.wm)}${c4TraitBar('trung thực', x.ho)}</div></span><button class="btn" data-app="${i}">Thuê</button></div>`).join('')
    + '<button class="btn alt" data-apply-no="1">Thôi</button>';
}
// the hands' moods for today (owner): a hand on a low wage asks for a raise more often; a refused ask lowers the relationship;
// at 30 or less they may give notice
function c4HandPlan(ev) {
  const hp = SAVE4.handPlan && SAVE4.handPlan.day === SAVE4.day ? SAVE4.handPlan : (SAVE4.handPlan = { day: SAVE4.day, item: undefined });
  if (hp.item === undefined) {                                             // rolled once a day, and at most one ask a day (owner: several came at once)
    const cands = [];
    for (const g of c4Owned()) for (const h of c4Hands(g)) {
      if (h.sick || h.trip) continue;
      const w = c4Wage(g, h), low = Math.max(0, Math.min(1, 1 - w / (c4WageAt(g, 0) * 4)));
      if (h.rel <= 30 && R() < .35) cands.push({ kind: 'hanghi', g, name: h.name });
      else if (SAVE4.day - h.askDay >= 5 && SAVE4.day - (SAVE4.lastHandAsk ?? -99) >= 2 && R() < .08 + .3 * low) cands.push({ kind: 'tangluong', g, name: h.name });
    }
    hp.item = cands.length ? { ...c4Pick(cands), at: C4_OPEN + 60 + R() * (C4_CLOSE - C4_OPEN - 120) } : null;
  }
  const it = hp.item; if (!it) return;
  const h = c4Hands(it.g).find(x => x.name === it.name); if (h) ev.push({ at: it.at, kind: it.kind, hand: { g: it.g, h } });
}

/* ---------- the husband between errands (a player): he strolls about in front of the stalls calling people in,
   and now and then talks a passer-by into buying at one of our stalls that has goods ---------- */
const C4_HUSB_INVITE = ['Mời cô bác ghé gánh nhà tôi!', 'Ghé xem một tí, không mua cũng được!', 'Bà con ơi, hàng nhà tôi tươi nhất chợ!', 'Mời bác ghé, vợ tôi bán vui lắm!', 'Ai đi qua cũng ghé một tí nào!'];
// one line per ware, said only when we sell it
const C4_HUSB_WARE = { trau: 'Trầu têm cánh phượng, cau non đây, mời vào!', che: 'Chè xanh nóng hổi đây, mời bác bát chè!', xoi: 'Xôi nóng dẻo thơm đây, ăn sáng cho chắc dạ!', xen: 'Kim chỉ, gương lược, đủ cả, mời chị em xem!', bun: 'Bún riêu cua đồng nóng đây, thơm phức!', thit: 'Thịt lợn mới mổ đây!', gao: 'Gạo tám thơm đây, mời cô bác!', rau: 'Rau tươi mới hái đây!', trung: 'Trứng gà ta đây, còn ấm!', ga: 'Gà ta béo ngậy đây!', qua: 'Hoa quả ngọt lịm đây!', non: 'Nón lá mới đây, đội vào là xinh!', ca: 'Cá đồng tươi rói đây!', vai: 'Vải đẹp may áo đây!', banh: 'Bánh đa giòn rụm đây!' };
const c4HusbLine = () => c4Pick([...C4_HUSB_INVITE, ...c4Owned().filter(g => c4Stock(g) > 0 && C4_HUSB_WARE[g]).map(g => C4_HUSB_WARE[g]), ...c4Owned().filter(g => c4Stock(g) > 0 && C4_HUSB_WARE[g]).map(g => C4_HUSB_WARE[g])]);
function c4HusbTout(dt) {
  const P = C4.porter; if (C4.phase !== 'open' || !(P.st === 'idle' || P.st === 'walk')) return;
  if (P.st === 'walk' && P.strollX == null) P.st = 'idle';
  if (P.strollX == null && (P.strollT = (P.strollT ?? 2) - dt) <= 0) { P.strollX = c4HusbX() - 60 + R() * 200; P.strollT = 4 + R() * 6; }
  if (P.strollX != null) {
    const dx = P.strollX - P.x;
    if (Math.abs(dx) > 3) { P.st = 'walk'; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 55 * dt); P.face = Math.sign(dx); P.ph = (P.ph || 0) + dt * 8; P.z += (.18 - P.z) * Math.min(1, dt * 2); }
    else { P.st = 'idle'; P.strollX = null; P.face = 1; }
  }
  if ((P.toutT = (P.toutT ?? 3) - dt) > 0) return;
  P.toutT = 5 + R() * 5;
  if (!P.say) c4Say(P, c4HusbLine());
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
      if (p.x >= hx) { c4Receive(p.good, p.qty, p.cost, 'giua'); p.h.trip = false; C4.trips.splice(C4.trips.indexOf(p), 1); c4Say(p.h, c4Pick(['Hàng về rồi đây!', 'Đủ cả, bà chủ đếm đi!', 'Nặng mà vui!'])); c4Hud(); } }
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

/* ---------- fetching by itself (owner): from a stall's second level (Sạp tre; the betel stall: Sạp lều), its sheet sets
   when to send someone (stock down to 0/5/…/50), how much to bring (5…50) and until what hour (6:00 … 18:00, or till
   closing). SAVE4.auto[g] = { at, q, until } (at null = off; an old number = at, fill up, till closing). ---------- */
const C4_AUTO_AT = [0, 5, 10, 20, 30, 40, 50], C4_AUTO_Q = [5, 10, 20, 30, 40, 50], C4_AUTO_UNTIL = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const c4AutoOk = g => (g === 'trau' ? SAVE4.lv : c4SLvI(g)) >= 1;   // from the second level (owner: lvl 2), bought stalls too
const c4Fetching = g => (['out', 'away', 'back'].includes(C4.porter.st) && C4.porter.good === g) || (C4.trips || []).some(t => t.good === g);
function c4AutoGet(g) {
  const v = (SAVE4.auto || {})[g];
  if (typeof v === 'number') return v ? { at: v, q: 50, until: 0 } : { at: null, q: 20, until: 0 };
  return v || { at: null, q: 20, until: 0 };
}
function c4AutoUpdate(dt) {
  if (C4.phase !== 'open' || (C4.autoT = (C4.autoT || 0) - dt) > 0) return;
  C4.autoT = 1;
  for (const g of c4Owned()) {
    const A = c4AutoGet(g), st = c4Stock(g);
    if (A.at === null || !c4AutoOk(g) || st > A.at || c4Fetching(g)) continue;
    if (A.until && C4.mins >= A.until * 60) continue;                       // past the hour set: no more trips today
    const q = Math.min(A.q, Math.floor(c4Cap(g) - st)); if (q < 5) continue;
    const c = c4Carrier(g); if (!c) continue;
    if (c.hand) c4SendTrip(c, g, q, c4CostMid(g)); else Object.assign(C4.porter, { st: 'out', good: g, qty: q, cost: c4CostMid(g), to: null, at: null, strollX: null });
    toast(`Còn ${st} ${C4_GOODS[g].unit} ${C4_GOODS[g].name.toLowerCase()}: ${c.name} tự đi lấy thêm ${q}.`, 3);
  }
}
function c4AutoBlock(g) {
  const el = document.createElement('div'); el.className = 'hands autof';
  if (!c4AutoOk(g)) { el.innerHTML = `<p class="hint">Lên ${g === 'trau' ? C4_LV[1].name : C4_SHOP_LV[1].name} thì mở khoá: tự sai người đi lấy hàng khi sắp hết.</p>`; return el; }
  const A = c4AutoGet(g), u = C4_GOODS[g].unit, opt = (v, t, cur) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${t}</option>`;
  el.innerHTML = `<h4>Tự đi lấy hàng</h4><p class="hint">Chồng (hoặc người làm thuê nếu chồng vắng) tự đi lấy, giá giữa ngày.</p><div class="auto3">`
    + `<label>Khi còn <select data-k="at">${opt('', 'Tắt', A.at === null ? '' : null)}${C4_AUTO_AT.map(n => opt(n, n + ' ' + u, A.at)).join('')}</select></label>`
    + `<label>lấy thêm <select data-k="q">${C4_AUTO_Q.map(n => opt(n, n + ' ' + u, A.q)).join('')}</select></label>`
    + `<label>chỉ đi trước <select data-k="until">${C4_AUTO_UNTIL.map(h => opt(h, h + ':00', A.until)).join('')}${opt(0, 'tan chợ', A.until)}</select></label></div>`;
  el.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => {
    const cur = c4AutoGet(g), k = sel.dataset.k, v = sel.value === '' ? null : +sel.value;
    (SAVE4.auto = SAVE4.auto || {})[g] = { ...cur, [k]: v }; AU.tap(); persist4();
  }));
  return el;
}
