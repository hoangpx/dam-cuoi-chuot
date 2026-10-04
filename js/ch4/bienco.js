/* ---------- how the day's happenings reach the player (owner) ----------
   · Visitors (alms, cụ Đồ, minding a child, the betel trader, the fortune-teller, a loan, credit, an order…): the person
     walks up near the betel stall and waits with a red "!" over the head; only tapping them opens the sheet. Ignored,
     they leave after a while — nothing lost.
   · Everything else (cụ Lý's tax, the cat, the soldiers, a fire, a gale…) opens by itself with 30 s to choose; if the time
     runs out the refusing / deferring answer (E.def, else the last one) is taken, with its consequences. So a player who
     does nothing still gets through the day.
   · Every answer says what came of it (its own toast, or a line with the money it cost or brought).
   · A happening that does not fit today is replaced by another one, at most twice a day. */
const C4_VISIT = new Set(['xin', 'do', 'trong', 'cau', 'boi', 'vay', 'ho', 'chiu', 'cuoi', 'khachla', 'cotiec']);
const C4_VISIT_SAY = { xin: 'Cô ơi, làm phúc cho bà…', do: 'Cụ Đồ ghé chơi đây!', trong: 'Cô ơi, nhờ cô chút việc!', cau: 'Cau non giá hời đây!', boi: 'Xem một quẻ không cô?',
  vay: 'Cô ơi, cho hỏi chút chuyện…', ho: 'Góp họ không cô ơi?', chiu: 'Cô ơi, bán chịu được không?', cuoi: 'Nhà tôi sắp có cưới đây!', khachla: 'Hàng này bán buôn không?', cotiec: 'Nhà tôi sắp làm cỗ!' };
const C4_VISIT_OLD = new Set(['xin', 'do', 'boi']);                           // these come as old folk
// which answer counts as helping someone (for the day's tasks)
const C4_HELP = { xin: 0, trong: 0, vay: 0, chiu: 0, omdau: 0, lua: 0, caicau: 2 };
const C4_EV_TIME = 30;

function c4Dispatch(kind) {
  if (C4_VISIT.has(kind)) { if (!c4VisitorSpawn(kind)) c4EvReplace(); return; }
  C4.ev = null; c4Event(kind);
  const shown = C4.sheet === 'c4ev' && C4.ev && C4.ev.kind === kind;
  if (shown) { C4.ev.timed = true; C4.ev.left = C4_EV_TIME; c4EvTimer(); }
  else if (kind !== 'meo' && kind !== 'hao') c4EvReplace();                 // (the cat first shows itself on the roof; Hảo cảm only writes the book)
}
// another happening later today in place of one that did not fit
function c4EvReplace() {
  if ((C4.evRepl || 0) >= 2 || C4.mins > 16 * 60) return;
  C4.evRepl = (C4.evRepl || 0) + 1;
  const own = c4Owned(), pool = ['vay', 'chiu', 'boi', 'trom', 'ho', 'cau', 'tuan', 'xin', 'trong', 'linh', 'gio', ...c4ExtraPool(own)];
  if (!SAVE4.cauDoi) pool.push('do');
  C4.events.push({ at: C4.mins + 20 + R() * 50, kind: c4Pick(pool) }); C4.events.sort((a, b) => a.at - b.at);
}
// the 30 s bar under a happening's answers
function c4EvTimer() {
  const box = $('#c4evO'); let bar = box.querySelector('.evtime');
  if (!bar) { bar = document.createElement('div'); bar.className = 'evtime'; bar.innerHTML = '<i></i><span></span>'; box.appendChild(bar); }
  const E = C4.ev; bar.firstChild.style.width = Math.max(0, E.left / C4_EV_TIME * 100) + '%';
  bar.lastChild.textContent = `${Math.ceil(E.left)} giây · hết giờ thì: ${c4Plain(E.opts[c4EvDefault(E)][0])}`;
}
const c4Plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
const c4EvDefault = E => { let i = E.def ?? E.opts.length - 1; if (E.opts[i] && E.opts[i][2] === false) i = E.opts.map((o, k) => k).reverse().find(k => E.opts[k][2] !== false) ?? i; return i; };
// called every frame while a sheet is open (the market itself waits)
function c4EvTick(dt) {
  const E = C4.ev; if (!E || !E.timed || C4.sheet !== 'c4ev') return;
  E.left -= dt; c4EvTimer();
  if (E.left <= 0) c4EvPick(c4EvDefault(E), true);
}
// an answer: do it, count help, say what came of it, let a visitor go
function c4EvPick(i, auto = false) {
  const E = C4.ev; if (!E) return;
  const [label, act] = E.opts[i], m0 = SAVE4.money, n0 = toast.n || 0;
  C4.ev = null; c4Sheets(null);
  act();
  if (C4_HELP[E.kind] === i && C4.today) C4.today.help = (C4.today.help || 0) + 1;
  const said = (toast.n || 0) !== n0 ? $('#toastTx').innerHTML : '', d = SAVE4.money - m0;
  const money = d ? ` (${d < 0 ? 'mất' : 'được'} ${c4Money(Math.abs(d))}, còn ${c4Money(SAVE4.money)})` : '';
  if (auto) toast(`Hết giờ, đành: ${c4Plain(label)}.${said ? ' ' + said : ''}${money}`, 4.4);
  else if (!said) toast(`${c4Plain(label)}.${money}`, 3);
  else if (money) toast(said + money, 3.6);
  if (E.visitor) { const v = E.visitor; v.visit = null; v.st = 'leave'; v.face = v.x < C4_STALL ? -1 : 1; v.sp = 60; }
  c4Hud(); persist4();
}

/* ---------- visitors ---------- */
function c4VisitorSpawn(kind) {
  for (let k = 0; k < 10; k++) {
    const n = C4.walkers.length; c4Spawn(); if (C4.walkers.length === n) continue;
    const w = C4.walkers[C4.walkers.length - 1], S = C4_MOUSE_SORTS[w.sort];
    if (w.kind !== 'mouse' || !S || S.role === 'child' || w.buf || w.hoa || (C4_VISIT_OLD.has(kind) !== (S.role === 'old'))) continue;
    const vx = C4_STALL - 150 - R() * 30 - 55 * C4.walkers.filter(o => o.visit).length;                                  // just left of the betel stall, in view
    Object.assign(w, { visit: kind, buy: false, shop: null, guest: false, drunk: false, smokeX: undefined, cd: 1e9, sp: 55, visitX: vx, visitT: 45, face: w.x < vx ? 1 : -1 });
    return true;
  }
  return false;
}
function c4VisitorsUpdate(dt) {
  for (const v of C4.walkers) {
    if (!v.visit) continue;
    if (v.st === 'leave') { v.visit = null; continue; }                      // the market closed, a fire…
    if (v.st === 'walk' && (v.x - v.visitX) * v.face >= 0) { v.st = 'visit'; v.face = 1; c4Say(v, C4_VISIT_SAY[v.visit] || 'Cô ơi!'); }
    if (v.st === 'visit') {
      v.z += (.44 - v.z) * Math.min(1, dt * 2);
      if (!v.say && R() < dt / 7) c4Say(v, C4_VISIT_SAY[v.visit] || 'Cô ơi!');
      if ((v.visitT -= dt) <= 0) { v.visit = null; v.st = 'leave'; v.face = -1; }
    }
  }
}
// a red "!" over a waiting visitor's head
function c4VisitItems(items, g, vis) {
  for (const v of C4.walkers) {
    if (!v.visit || !vis(v.x, 60)) continue;
    const s = c4S(v.z) * C4_CROWD, y = c4Y(v.z) - C4_TALL.mouse * s - 30 - Math.abs(Math.sin(C4.t * 3)) * 6;
    items.push({ z: v.z + .001, f: () => { g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(v.x, y, 13, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = '#f2ecde'; g.font = '900 18px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', v.x, y + 1); } });
  }
}
// tapped: open their sheet (no timer: the player chose to listen)
function c4VisitorTap(x, y) {
  for (const v of C4.walkers) {
    if (!v.visit) continue;
    const s = c4S(v.z) * C4_CROWD, top = c4Y(v.z) - C4_TALL.mouse * s - 46;
    if (Math.abs(x - v.x) < 60 * s + 10 && y > top && y < c4Y(v.z) + 14) {
      AU.tap(); C4.evWho = v.name; C4.ev = null; c4Event(v.visit); C4.evWho = null;
      if (C4.today) C4.today.visit = (C4.today.visit || 0) + 1;
      if (C4.sheet === 'c4ev' && C4.ev) C4.ev.visitor = v;
      else { toast(`${c4Cap1(v.name || 'Người ấy')} chào rồi đi.`, 2.4); v.visit = null; v.st = 'leave'; v.face = -1; }
      return true;
    }
  }
  return false;
}
