/* ---------- Khế ước (owner): a contract paper unrolls in the middle of the screen when the couple signs for something —
   renting a plot or a house, buying a neighbour's stall, a rent raised, hiring a hand. It names the two sides, what is agreed
   and the sum, two thumbprints (điểm chỉ) press on, then a red seal (triện) comes down with a thump. The deed is done after
   the seal (done()); the game waits meanwhile. Tap once the writing is in to hurry it on.
   c4Khe({ title, a: [role, name], b: [role, name], what, money, per, k }, done)   (k < 1 = a shorter ceremony) ---------- */
const C4_KHE_US = 'Vợ chồng nhà trầu cau';
{
  const el = document.createElement('div'); el.id = 'c4khe'; el.hidden = true; document.body.appendChild(el);
}
// a thumbprint: nested arcs, a little different each time
function c4KheFinger(seed) {
  let h = ''; const r = mulberry(seed);
  for (let i = 0; i < 7; i++) { const rx = 4 + i * 2.6, ry = 6 + i * 3.1, a0 = 3.4 + r() * .5, a1 = 6.0 + r() * .5; const x1 = 20 + Math.cos(a0) * rx, y1 = 27 + Math.sin(a0) * ry, x2 = 20 + Math.cos(a1) * rx, y2 = 27 + Math.sin(a1) * ry; h += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rx} ${ry} 0 1 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#8a2a20" stroke-width="1.5" stroke-linecap="round" opacity="${(.55 + r() * .35).toFixed(2)}"/>`; }
  return `<svg viewBox="0 0 40 54" width="38" height="52" aria-hidden="true">${h}</svg>`;
}
function c4Khe(o, done) {
  const el = $('#c4khe'); if (!el || C4.kheOn) { if (done) done(); return; }
  C4.kheOn = true; C4.paused = true;
  const k = o.k || 1, seed = ((o.money || 7) * 31 + (o.what || '').length * 17) | 0, side = ([role, name]) => `<p class="ln"><span>${role}</span><b>${name}</b></p>`;
  el.style.setProperty('--k', k);
  el.innerHTML = `<div class="paper"><div class="rim"></div>
    <h3 class="ln">KHẾ ƯỚC</h3><p class="sub ln">${o.title || ''}</p>
    ${side(o.a)}${side(o.b || ['Bên kia', C4_KHE_US])}
    <p class="ln"><span>Thoả thuận</span><b>${o.what}</b></p>
    <p class="ln sum"><span>Số tiền</span><b>${o.money ? c4Money(o.money) + (o.per ? ' ' + o.per : '') : 'không mất tiền'}</b></p>
    <div class="sign"><div class="fp f1">${c4KheFinger(seed)}<small>điểm chỉ</small></div><div class="fp f2">${c4KheFinger(seed + 5)}<small>điểm chỉ</small></div></div>
    <div class="seal"><i>CHỢ</i><i>LÀNG</i></div><p class="hurry">chạm để bỏ qua</p></div>`;
  el.hidden = false;
  const T = [setTimeout(() => AU.pluck(72), 80 * k), setTimeout(() => AU.pluck(79), 2300 * k), setTimeout(() => { AU.thump(); AU.stamp(); }, 3350 * k)];
  let end = false;
  const finish = () => { if (end) return; end = true; T.forEach(clearTimeout); el.hidden = true; el.innerHTML = ''; C4.kheOn = false; C4.paused = !!C4.sheet && C4.sheet !== 'c4day'; if (done) done(); };
  const t0 = performance.now();
  el.onclick = () => { if (performance.now() - t0 < 1100) return; el.classList.add('fast'); setTimeout(finish, 450); };
  T.push(setTimeout(finish, 4700 * k));
}
