/* Chương IV phần 2 · Phố Huyện: hired hands (owner: "thêm thuê người như phần 1"). As in part 1: a few people come asking for the
   job, each with three traits (nhanh nhẹn: serves and runs faster; nhiệt tình: more passers-by stop to buy; trung thực: less money
   goes missing) and the wage they ask; wages are paid each evening, two evenings unpaid and they leave; a hand can be let go. Each
   next hand asks about twice the one before. In the town a hand does what the wife does: serves at the counter, or runs a boat's
   order down to the quay, whoever is free first (so one can mind the counter while the other runs). Part 2's own code: it reads only
   part 1's name lists and the trait bar (C4_HAND_TITLES, C4_HAND_NAMES, C4_HELPERS, c4TraitBar). */
const P4_HANDS_MAX = 1, P4_WAGE0 = 40;                                      // one hand only (owner, like part 1), asking about 40 đồng a day
const p4Cap1 = s => s[0].toUpperCase() + s.slice(1);
const p4Hands = () => SAVE4B.hands || (SAVE4B.hands = []);
const p4NextWage = () => P4_WAGE0 * Math.pow(2, p4Hands().length);
function p4HandName() {
  const taken = new Set(p4Hands().map(h => h.name)), free = [];
  for (const t of C4_HAND_TITLES) for (const n of C4_HAND_NAMES) if (!taken.has(t + ' ' + n)) free.push(t + ' ' + n);
  return free.length ? p4Pick(free) : 'người làm thứ ' + (taken.size + 1);
}
function p4Applicants() {
  const out = [], next = p4NextWage();
  for (let i = 0, n = 3 + ((Math.random() * 3) | 0); i < n; i++) {
    let name = p4HandName(); for (let t = 0; t < 5 && out.some(o => o.name === name); t++) name = p4HandName();
    const h = { name, sort: p4Pick(C4_HELPERS), sp: Math.random(), wm: Math.random(), ho: Math.random(), unpaid: 0 };
    out.push({ ...h, wage: Math.max(20, Math.round(next * (.6 + (h.sp + h.wm + h.ho) * .33))) });
  }
  return out;
}
// the sellers of the day: the wife, then the hands; each has a place behind the counter
const p4SlotX = k => [P4_HOME - 6, P4_HOME + 52, P4_HOME - 62][k] ?? P4_HOME;
function p4MakeSellers() {
  const one = (o, k) => ({ ...o, slot: k, x: p4SlotX(k), z: .07, st: 'counter', job: null, serving: null, t: 0, say: null, take: 0, face: 1, ph: 0 });
  return [one({ who: 'wife', M: MICE.b, sp: .55 }, 0), ...p4Hands().map((h, i) => one({ who: 'hand', h, M: c4MouseRig(h.sort), sp: h.sp }, i + 1))];
}
const p4Warmth = () => 1 + .25 * p4Hands().reduce((a, h) => a + h.wm, 0);   // warm hands bring more passers-by in
// each seller free at the counter takes the next job: a boat's order or the next buyer in the queue, whichever came first
function p4SellersUpdate(dt) {
  const Q = P4.Q;
  for (const m of P4.sellers) {
    if (m.say) { m.say.t += dt; if (m.say.t > m.say.life) m.say = null; }
    if (m.st === 'counter' && !m.serving) {
      const boat = p4NextBoat(), q = Q.find(w => w.st === 'queue' && w.asked && !w.servedBy);
      if (boat && (!q || boat.order.t0 < q.askT)) { boat.order.taken = true; m.st = 'out'; m.job = boat; p4Say(m, p4Pick(['Có ngay, có ngay!', 'Chờ chút nhé!', 'Mang ra đây!'])); }
      else if (q) { m.serving = q; q.servedBy = m; m.t = 2.2 * (1.3 - .6 * m.sp); }
    }
    if (m.serving && (m.t -= dt) <= 0) {
      const w = m.serving, n = Math.min(w.n, SAVE4B.stock);
      if (n > 0) { p4Sale(m, n, m.x, p4Y(.12) - 120); p4Say(m, p4Pick(['Trầu đây, mời bác!', 'Của bác đây ạ!', 'Ăn ngon lại ghé nhé!'])); }
      else { p4Say(m, 'Hết trầu mất rồi!'); P4.today.lost++; }
      const i = Q.indexOf(w); if (i >= 0) Q.splice(i, 1); w.st = 'leave'; w.dir = Math.random() < .5 ? -1 : 1; m.serving = null; p4Persist(); p4Hud();
    }
    p4Run(m, dt);
  }
}
function p4Sale(m, n, fx, fy) {
  const got = n * SAVE4B.price;
  SAVE4B.stock -= n; SAVE4B.sold = (SAVE4B.sold || 0) + n; P4.today.sold += n; p4Earn(got); m.take += got;
  P4.fx.push({ x: fx, y: fy, s: '+' + got, t: 0 });
}
// running a boat's order: from the counter down to the quay at the boat, hand it over, back to their place
function p4Run(m, dt) {
  if (m.st === 'counter') return;
  const b = m.job, sp = 150 * (.8 + .4 * m.sp);
  const go = (tx, tz) => { const dx = tx - m.x, dz = (tz - m.z) * 300, d = Math.hypot(dx, dz); m.moving = d > 3; if (!m.moving) return true; const st = Math.min(d, sp * dt); m.x += dx / d * st; m.z += dz / d * st / 300; m.ph += dt * 12; m.face = dx >= 0 ? 1 : -1; return false; };
  if (m.st === 'out') {
    if (!b || !b.order) { m.st = 'back'; m.job = null; return; }
    if (go(b.x - 30, P4_DOCK_Z)) {
      const n = Math.min(b.order.n, SAVE4B.stock);
      if (n > 0) { p4Sale(m, n, b.x, P4_Y0 + P4_D - 30); p4Say(m, 'Trầu đây ạ!'); p4BoatLeave(b, p4Pick(['Cảm ơn nhé!', 'Trầu thơm quá!', 'Mai lại ghé!']), false); }
      else { p4Say(m, 'Hết trầu mất rồi!'); p4BoatLeave(b, 'Tiếc quá!', true); }
      p4Persist(); p4Hud(); m.st = 'back'; m.job = null;
    }
  } else if (m.st === 'back' && go(p4SlotX(m.slot), .07)) { m.st = 'counter'; m.face = 1; m.moving = false; }
}
// the evening: wages, and now and then money short where a hand is not honest
function p4PayHands() {
  const H = p4Hands(), out = [], quit = [];
  let short = 0;
  for (const s of P4.sellers) if (s.who === 'hand' && s.take > 0 && Math.random() < (1 - s.h.ho) * .45) short += Math.round(s.take * (.05 + .12 * (1 - s.h.ho)));
  if (short > 0) { SAVE4.money -= Math.min(short, Math.max(0, SAVE4.money)); persist4(); }
  for (const h of H) {
    if (p4Purse() >= h.wage) { p4Spend(h.wage); h.unpaid = 0; out.push(`${p4Cap1(h.name)}: ${c4Money(h.wage)}`); }
    else { h.unpaid = (h.unpaid || 0) + 1; out.push(`<span class="bad">${p4Cap1(h.name)}: chưa trả được công</span>`); if (h.unpaid >= 2) quit.push(h); }
  }
  for (const h of quit) H.splice(H.indexOf(h), 1);
  p4Persist();
  return (out.length ? `<p>Trả công: ${out.join(' · ')}</p>` : '') + (short > 0 ? `<p class="bad">Tối kiểm tiền thấy thiếu ${c4Money(short)}, không rõ ai lấy.</p>` : '')
    + quit.map(h => `<p class="bad">${p4Cap1(h.name)} hai hôm không được trả công, bỏ đi rồi.</p>`).join('');
}
// the hands' block on the house sheet: the hands, the applicants while the list is open
function p4HandsHtml() {
  const H = p4Hands();
  let s = '<div class="hands"><h4>Người làm</h4><p class="hint">Người làm đứng quầy bán cùng vợ, hoặc chạy ra bến giao trầu cho thuyền, ai rảnh thì làm. Chỉ thuê được một người. Công trả mỗi tối; hai tối không trả là bỏ đi.</p>';
  s += H.map((h, i) => `<div class="hand"><span><b>${p4Cap1(h.name)}</b> · công ${c4Money(h.wage)}/ngày${h.unpaid ? ' · <span class="bad">nợ công</span>' : ''}<div class="tbars">${c4TraitBar('nhanh nhẹn', h.sp)}${c4TraitBar('nhiệt tình', h.wm)}${c4TraitBar('trung thực', h.ho)}</div></span><button class="btn alt" data-fire="${i}">Cho nghỉ</button></div>`).join('');
  if (P4.apply) s += `<h4>Người xin việc</h4>` + P4.apply.map((x, i) => `<div class="hand app"><span><b>${p4Cap1(x.name)}</b> · đòi công ${c4Money(x.wage)}/ngày<div class="tbars">${c4TraitBar('nhanh nhẹn', x.sp)}${c4TraitBar('nhiệt tình', x.wm)}${c4TraitBar('trung thực', x.ho)}</div></span><button class="btn" data-app="${i}">Thuê</button></div>`).join('') + '<button class="btn alt" data-appno="1">Thôi</button>';
  else if (H.length < P4_HANDS_MAX) s += `<button class="btn" data-hire="1">Thuê một người · khoảng ${c4Money(p4NextWage())}/ngày</button>`;
  return s + '</div>';
}
function p4HandsClick(b) {
  if (b.dataset.hire) { P4.apply = p4Applicants(); return true; }
  if (b.dataset.appno) { P4.apply = null; return true; }
  if (b.dataset.app) {
    const x = P4.apply && P4.apply[+b.dataset.app]; P4.apply = null;
    if (!x || p4Hands().length >= P4_HANDS_MAX) return true;
    p4Hands().push(x); p4Persist(); toast(`${p4Cap1(x.name)} nhận làm cho hiệu trầu, công ${c4Money(x.wage)}/ngày.`, 3);
    P4.sellers.push({ ...p4MakeSellers()[p4Hands().length], x: p4SlotX(p4Hands().length), z: .07 });   // starts at once
    return true;
  }
  if (b.dataset.fire) {
    const H = p4Hands(), h = H[+b.dataset.fire]; if (!h) return true;
    H.splice(H.indexOf(h), 1); p4Persist(); toast(`${p4Cap1(h.name)} nghỉ việc.`, 2.4);
    const s = P4.sellers.find(m => m.h === h); if (s) { if (s.serving) s.serving.servedBy = null; if (s.job && s.job.order) s.job.order.taken = false; P4.sellers.splice(P4.sellers.indexOf(s), 1); }
    P4.sellers.forEach((m, k) => { m.slot = k; });
    return true;
  }
  return false;
}
