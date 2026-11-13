/* ---------- a master who fires people gets a name for it (owner 2026-11-13: "chủ mà đuổi người làm nhiều thì người ứng tuyển phẩm chất
   sẽ càng thấp hơn"; a hidden rule, never said to the player). Every dismissal by the player, village or town, is written in SAVE4.fireLog
   (the game days): a village hand sent away from its profile (c4WkFire), a town helper let go (shop sheet or profile), a betel-house hand
   let go, a keeper replaced through "Đổi người đứng quán". People who come asking for work afterwards are worse: each of their three traits
   (nhanh nhẹn, nhiệt tình, trung thực) is scaled by c4FireK() = 1 − .1 per dismissal in the last C4_FIRE_DAYS days (at most −.6), and the pay
   they ask follows their worth as before, so a bad name brings cheaper but poorer people. The word goes round for a month, then is forgotten.
   Letting go a hand who asked to leave, or handing a thief to the law, does not count. ---------- */
const C4_FIRE_DAYS = 30;
const c4FireN = () => (SAVE4.fireLog || []).filter(d => SAVE4.day - d < C4_FIRE_DAYS).length;
const c4FireK = () => 1 - Math.min(.6, .1 * c4FireN());
function c4FireNote() { const L = (SAVE4.fireLog || (SAVE4.fireLog = [])).filter(d => SAVE4.day - d < C4_FIRE_DAYS); L.push(SAVE4.day); SAVE4.fireLog = L; persist4(); }
// worse people for a bad name: traits scaled, the asked pay moved with them (field `ask` in the village, `wage` in the town)
function c4FireWorse(list) {
  const k = c4FireK(); if (k >= 1) return list;
  for (const x of list) {
    const s0 = (x.sp || 0) + (x.wm || 0) + (x.ho || 0); x.sp *= k; x.wm *= k; x.ho *= k;
    const f = (.6 + (x.sp + x.wm + x.ho) * .33) / (.6 + s0 * .33);
    if (x.ask !== undefined) x.ask = Math.max(20, Math.round(x.ask * f));
    if (x.wage !== undefined) x.wage = Math.max(20, typeof p4R5 === 'function' ? p4R5(x.wage * f) : Math.round(x.wage * f));
  }
  return list;
}
{ const a0 = c4Applicants; c4Applicants = function () { return c4FireWorse(a0.apply(this, arguments)); }; }
{ const a0 = p4Applicants; p4Applicants = function () { return c4FireWorse(a0.apply(this, arguments)); }; }
{ const a0 = p4ShopApplicants; p4ShopApplicants = function () { return c4FireWorse(a0.apply(this, arguments)); }; }
// the dismissals
{ const f0 = c4WkFire; c4WkFire = function (W) { const town = W && W.place !== 'lang' && !W.R && W.id0 !== 'k'; const r = f0.apply(this, arguments); if (r && !town) c4FireNote(); return r; }; }   // (a betel hand goes through p4HandsClick, counted there)
{ const f0 = p4HandsClick; p4HandsClick = function (b) { const h = b && b.dataset && b.dataset.fire !== undefined && p4Hands()[+b.dataset.fire]; const r = f0.apply(this, arguments); if (h && !p4Hands().includes(h)) c4FireNote(); return r; }; }
{ const f0 = p4ShopClick; p4ShopClick = function (b) {
    const sel = typeof P4 !== 'undefined' && P4.shopSel, R = sel && p4Shops()[sel.key], x = R && b && b.dataset && b.dataset.fire !== undefined && p4ShopHands(R)[+b.dataset.fire];
    const r = f0.apply(this, arguments); if (x && !p4ShopHands(R).includes(x)) c4FireNote(); return r; }; }
{ const f0 = p4ApplyClick; p4ApplyClick = function (R, key, b) {
    const A = P4.sapply, k = b && b.dataset && b.dataset.spick !== undefined && A && A.key === key && A.role === 'k' && A.list[+b.dataset.spick], kn0 = R.kn;
    const r = f0.apply(this, arguments); if (k && R.kn !== kn0) c4FireNote(); return r; }; }
