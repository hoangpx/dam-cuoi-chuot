/* Chương IV · thưởng cho người làm (owner 2026-11-12: "làm thêm thưởng cho nhân viên, thưởng càng nhiều càng thường xuyên thì sẽ được nhân viên
   quý, giảm bớt đòi tăng lương, đỡ bỏ trốn, đỡ ăn cắp tiền hơn, và ngược lại nếu không thưởng"). Village and town alike: every worker
   (a village stall's hand, a town shop's keeper and helpers, the betel house's hands) has a "Thưởng" row under its pay: any sum the player types (a day's
   pay to start with; owner: "thưởng bao nhiêu tùy người chơi"), once a day each, out of the shared purse (the day's spending: "Thưởng người làm").
   HIDDEN (never told to the player; only a word for how the worker seems to feel shows):
   - Goodwill q.gw on the worker's wage state (h.wq / R.wq, so a new keeper starts afresh), −.4 … 1, starting 0. A bonus of k days' pay (k = sum / pay, at most 10) adds
     .2 × k^.6 × (1 − .5 × goodwill above 0) (half a day .13, a day .2, three days .39); every evening worked it falls .03 (floor −.4), so
     a worker never rewarded slides below where they started within about two weeks. The Tết bonus (tamly.js) adds .4 once a year.
   - Effects: the chance to run off with the takings (and a town helper's skimming, which uses the same chance) × (1 − .7 g) when g ≥ 0,
     × (1 + 1.5 |g|) below 0; the pay they think fair × (1 − .25 g) (fewer and later asks; more when sour); a new ask comes up to 5 days later
     at full goodwill; a village hand's "quan hệ" rises with each bonus. */
const C4_GW_MIN = -.4, C4_GW_FALL = .03;
const c4Gw = q => (q && q.gw) || 0;
const c4GwWord = g => g >= .6 ? 'rất quý chủ' : g >= .25 ? 'quý chủ' : g > -.15 ? 'bình thường' : g > -.3 ? 'hơi phật ý' : 'chán chủ';
const c4GwRunK = g => g >= 0 ? Math.max(.1, 1 - .7 * g) : 1 + 1.5 * -g;
const c4GwFairK = g => 1 - .25 * g;
const C4_BONUS_SAY = {
  it: ['Dạ, em cảm ơn.', 'Vâng, em nhận ạ.', 'Chút quà nhỏ, em cũng mừng.'],
  .5: ['Dạ, em cảm ơn ông bà!', 'Ông bà chu đáo quá.', 'Được đồng quà, mai em làm hăng hơn.'],
  1: ['Ôi, ông bà thương em quá!', 'Em cảm ơn, nhà em đang cần tiền.', 'Làm cho ông bà thật là sướng.'],
  3: ['Trời ơi, ông bà hậu quá, em nhớ ơn mãi!', 'Em xin làm cho ông bà đến già!', 'Có chủ như ông bà là phúc nhà em.']
};
// one worker's row: how they seem, a box for the amount (any sum the player likes; a day's pay to start with) and "Thưởng", or "đã thưởng hôm nay"
// (owner 2026-11-12: "thưởng bao nhiêu tùy người chơi chứ"); id says who it is (see c4BonusWho)
function c4BonusRow(q, wage, id) {
  q = q || {};
  const done = q.bd === SAVE4.day, w = Math.max(1, Math.round(wage));
  const btns = done ? '<span class="sm">Đã thưởng hôm nay.</span>'
    : `<label class="bonusAmt">Thưởng <input type="number" inputmode="numeric" min="1" step="1" value="${w}" data-bonusin="${id}"> đồng</label><button class="btn alt" data-bonus="${id}">Thưởng</button>`;
  return `<div class="row bonusRow" data-bonusrow="${id}"><span class="sm bmood">Tỏ ra: ${c4GwWord(c4Gw(q))}</span>${btns}</div>`;
}
// id → { q, wage, name, h? }: v|g|i (a village hand), k|key (a town keeper), p|key|i (a town helper), t|i (a betel house hand)
function c4BonusWho(id) {
  const [t, a, b] = id.split('|');
  if (t === 'v') { const h = c4Hands(a)[+b]; return h && { q: h.wq || (h.wq = {}), wage: c4Wage(a, h), name: h.name, h }; }
  if (typeof p4Shops !== 'function') return null;
  if (t === 'k') { const R = p4Shops()[a]; return R && { q: R.wq || (R.wq = {}), wage: p4KeeperWage(R), name: p4Keeper(R) }; }
  if (t === 'p') { const R = p4Shops()[a], h = R && p4ShopHands(R)[+b]; return h && { q: h.wq || (h.wq = {}), wage: p4HelpWage(R, h), name: h.name }; }
  if (t === 't') { const h = p4Hands()[+a]; return h && { q: h.wq || (h.wq = {}), wage: h.wage, name: h.name }; }
  return null;
}
function c4BonusGive(id, amt) {
  const W = c4BonusWho(id); if (!W || W.q.bd === SAVE4.day) return;
  amt = Math.floor(+amt || 0); if (amt < 1) { toast('Nhập số tiền thưởng đã.', 2); return; }
  if (SAVE4.money < amt) { toast('Trong túi không đủ tiền thưởng.', 2); return; }
  const k = Math.min(10, amt / Math.max(1, W.wage));
  const q = W.q, g = c4Gw(q);
  q.gw = Math.min(1, g + .2 * Math.pow(k, .6) * (1 - .5 * Math.max(0, g))); q.bd = SAVE4.day; q.bl = SAVE4.day;
  if (W.h && W.h.rel !== undefined && typeof c4HandRel === 'function') c4HandRel(W.h, Math.round(10 * Math.pow(k, .6)));
  if (S.mode === 'c4bplay' && typeof p4Spend === 'function') p4Spend(amt);
  else { SAVE4.money -= amt; if (typeof C4 !== 'undefined' && C4.today) { C4.today.spent = (C4.today.spent || 0) + amt; if (typeof c4SpNote === 'function') c4SpNote('Thưởng người làm', amt); } }
  persist4(); if (typeof p4Persist === 'function' && SAVE4B && SAVE4B.house) p4Persist(); AU.pluck(88);
  const say = C4_BONUS_SAY[k < .3 ? 'it' : k < .8 ? .5 : k < 2 ? 1 : 3];
  toast(`${c4Cap1(W.name)} nhận ${c4Money(amt)}: “${say[(Math.random() * say.length) | 0]}”`, 3);
  for (const el of document.querySelectorAll(`[data-bonusrow="${id}"]`)) el.outerHTML = c4BonusRow(q, W.wage, id);
  try { if (S.mode === 'c4bplay') p4Hud(); else c4Hud(); } catch (e) {}
}
addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-bonus]'); if (!b || b.disabled) return;
  e.stopPropagation(); const inp = document.querySelector(`[data-bonusin="${b.dataset.bonus}"]`); c4BonusGive(b.dataset.bonus, inp ? inp.value : 0);
}, true);

// ---------- the effects ----------
{ const run0 = c4RunChance; c4RunChance = function (wage, fair, ho, rel, mad, q) { return Math.min(.35, run0.apply(this, arguments) * c4GwRunK(c4Gw(q))); }; }
{ const fair0 = c4HandFairOf; c4HandFairOf = function (h, g) { const f = fair0(h, g); return f ? Math.max(5, Math.round(f * c4GwFairK(c4Gw(h.wq)) / 5) * 5) : f; }; }
{ const ev0 = p4WageEvening; p4WageEvening = function (q, who, take, wage, fair, onRun) { return ev0.call(this, q, who, take, wage, fair ? Math.max(5, Math.round(fair * c4GwFairK(c4Gw(q)) / 5) * 5) : fair, onRun); }; }
// the evening: goodwill fades a little, the Tết bonus counts once a year, and a fond worker waits longer before the next ask
function c4GwEvening(qs, before) {
  const y = typeof c4Lunar === 'function' ? c4Lunar().y : null, tet = y !== null && SAVE4.tetY === y;
  qs.forEach((q, i) => {
    if (!q) return;
    let g = c4Gw(q);
    if (tet && q.tetY !== y) { q.tetY = y; g = Math.min(1, g + .4); }
    g = Math.max(C4_GW_MIN, g - C4_GW_FALL); q.gw = Math.round(g * 1000) / 1000;
    if (q.ask && q.ask !== before[i] && g > 0) q.ask += Math.round(5 * g);
  });
}
{ const pay0 = c4PayHands;
  c4PayHands = function (d, quits) {
    const qs = []; for (const g of c4Owned()) for (const h of c4Hands(g)) qs.push(h.wq || (h.wq = {}));
    const before = qs.map(q => q.ask), r = pay0.apply(this, arguments);
    c4GwEvening(qs, before); return r;
  }; }
{ const pay0 = p4PayHands;
  p4PayHands = function () {
    const qs = [], S = p4Shops();
    for (const key in S) { const R = S[key]; qs.push(R.wq || (R.wq = {})); for (const h of (R.hands || [])) qs.push(h.wq || (h.wq = {})); }
    for (const h of p4Hands()) qs.push(h.wq || (h.wq = {}));
    const before = qs.map(q => q.ask), r = pay0.apply(this, arguments);
    c4GwEvening(qs.filter(q => q), before); return r;
  }; }
