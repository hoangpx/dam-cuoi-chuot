/* Chương IV phần 2 · Phố Huyện: choosing the shop's people (owner, 2026-11-09: "sao không làm giống như ở chợ quê, tự tuyển người chọn người?").
   As in the village (and the betel house's hand, nguoilam.js): "Thuê một người phụ" or "Đổi người đứng quán" brings 3–5 people asking for the job,
   each with three traits (c4TraitBar: nhanh nhẹn, nhiệt tình, trung thực) and the pay they ask (about the plain pay × .6 … 1.6, better people ask
   more); the player picks one, or none. Traits: nhanh nhẹn serves faster (the keeper ×.85…1.15, a helper adds .6 / .3 × .6…1.4 of a counter),
   nhiệt tình draws a few more buyers (×.95…1.05 by the crew's average), trung thực runs off and takes less (R.kho / h.ho, doicong.js). The pay can
   still be moved afterwards (Bớt công / Thêm công). People of old saves count as middling (.5). The keeper who replaces one who ran off still
   comes by himself, with random traits, at the same pay. */
const p4Tr = v => (v === undefined || v === null ? .5 : v);
// how fast the counter serves (replaces the count-only rule; tiredness as before)
function p4CrewSpeed(R) {
  const H = p4ShopHands(R); let k = 1;
  H.slice(0, 2).forEach((h, i) => { k += [.6, .3][i] * (.6 + .8 * p4Tr(h.sp)); });
  return (.85 + .3 * p4Tr(R.ksp)) * k;
}
function p4CrewWarm(R) { const v = [p4Tr(R.kwm), ...p4ShopHands(R).map(h => p4Tr(h.wm))]; return .95 + .1 * v.reduce((a, b) => a + b, 0) / v.length; }
function p4ShopApplicants(R, role) {
  const base = role === 'k' ? p4KeeperBase(R) : p4HelpBase(R), out = [], taken = new Set([p4Keeper(R), ...p4ShopHands(R).map(h => h.name)]);
  for (let i = 0, n = 3 + ((Math.random() * 3) | 0); i < n; i++) {
    let name = p4KeeperName(); for (let t = 0; t < 8 && (taken.has(name) || out.some(o => o.name === name)); t++) name = p4KeeperName();
    const sp = Math.random(), wm = Math.random(), ho = Math.random();
    out.push({ name, sp, wm, ho, wage: p4R5(base * (.6 + (sp + wm + ho) * .33)) });
  }
  return out;
}
const p4Bars = x => `<div class="tbars">${c4TraitBar('nhanh nhẹn', p4Tr(x.sp))}${c4TraitBar('nhiệt tình', p4Tr(x.wm))}${c4TraitBar('trung thực', p4Tr(x.ho))}</div>`;
// the applicants' block on the shop sheet (P4.sapply = { key, role, list })
function p4ApplyHtml(key) {
  const A = P4.sapply; if (!A || A.key !== key) return '';
  return `<h4>${A.role === 'k' ? 'Người xin đứng quán' : 'Người xin làm phụ'}</h4>` + A.list.map((x, i) => `<div class="hand app"><span><b>${p4Esc(p4Cap1(x.name))}</b> · đòi công ${c4Money(x.wage)}/ngày${p4Bars(x)}</span><button class="btn" data-spick="${i}">Thuê</button></div>`).join('')
    + '<div class="row"><button class="btn alt" data-sappno="1">Thôi</button></div>';
}
function p4ApplyClick(R, key, b) {
  if (b.dataset.sapp) { P4.sapply = { key, role: b.dataset.sapp, list: p4ShopApplicants(R, b.dataset.sapp) }; return true; }
  if (b.dataset.sappno) { P4.sapply = null; return true; }
  if (b.dataset.spick) {
    const A = P4.sapply, x = A && A.key === key && A.list[+b.dataset.spick]; P4.sapply = null; if (!x) return true;
    if (A.role === 'k') {
      const old = p4Keeper(R); R.kn = p4Cap1(x.name); R.ksp = x.sp; R.kwm = x.wm; R.kho = x.ho; R.raise = x.wage - p4KeeperBase(R); R.wq = {};
      toast(`${R.kn} đến đứng quán thay ${old}, công ${c4Money(x.wage)}/ngày.`, 3);
    } else {
      const H = p4ShopHands(R); if (H.length >= 2) return true;
      H.push({ name: x.name, sp: x.sp, wm: x.wm, ho: x.ho, raise: x.wage - p4HelpBase(R) });
      toast(`${p4Cap1(x.name)} đến phụ quán, công ${c4Money(x.wage)}/ngày.`, 2.6);
    }
    return true;
  }
  return false;
}
