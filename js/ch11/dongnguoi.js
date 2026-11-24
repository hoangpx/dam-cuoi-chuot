/* Chương XI · Làng Vũ Đại — NPC không dồn thành một cục (a player report through the owner, 2026-11-24: "npc đứng dồn thành 1 cục,
   bấm vô ko nói chuyện được với người cần gặp").
   Many villagers share one work station or one door, c11Fix gives the same free tile to all of them and the tap took the FIRST one in
   the list under the finger, so the person a job needed could be hidden behind others for good.
   (1) Villagers standing at their work push gently apart (C11_SEP_D tiles between neighbours, never more than C11_SEP_MAX tiles from
       their own spot, only onto tiles one can stand on), so a crowd opens out into a loose group.
   (2) A tap on several overlapping villagers picks the one with something for the player ("?" a step to hand in, "!" a request),
       else the nearest to the finger (c11TapPick). */
const C11_SEP_D = .62, C11_SEP_MAX = 1.6;
const c11VillHit = (v, wx, wy) => Math.abs(wx - v.x) < .6 && wy > v.y - 1.5 && wy < v.y + .25;
function c11TapPick(wx, wy) {
  const hits = (C11.vill || []).filter(v => c11VillHit(v, wx, wy)); if (hits.length < 2) return;
  const score = v => { const m = typeof c11Mark === 'function' ? c11Mark(v.p) : null; return Math.hypot(wx - v.x, (wy - (v.y - .55)) * .7) - (m === '?' ? .9 : m === '!' ? .6 : 0); };
  let best = hits[0]; for (const v of hits) if (score(v) < score(best)) best = v;
  const i = C11.vill.indexOf(best); if (i > 0) { C11.vill.splice(i, 1); C11.vill.unshift(best); }   // the tap loop takes the first one that is hit
}
function c11SpreadFolk(dt) {
  const L = (C11.vill || []).filter(v => !v.leaving && !v.moving && !(v.path && v.path.length) && !v.glide && v.goal && !C11_MOVER[v.plan ? v.plan.act : 'dao']);
  if (L.length < 2) return;
  for (let i = 0; i < L.length; i++) {
    const a = L[i]; let px = 0, py = 0;
    for (let j = 0; j < L.length; j++) {
      if (i === j) continue; const b = L[j], dx = a.x - b.x, dy = (a.y - b.y) * 1.4, d = Math.hypot(dx, dy);
      if (d >= C11_SEP_D) continue;
      if (d < .02) { const s = (a.p.n * 7 + b.p.n * 3) % 6.283; px += Math.cos(s); py += Math.sin(s); } else { px += dx / d * (C11_SEP_D - d) / C11_SEP_D; py += dy / d * (C11_SEP_D - d) / C11_SEP_D; }
    }
    const m = Math.hypot(px, py); if (m < .01) continue;
    const st = Math.min(1.1 * dt, 0.5) , nx = a.x + px / m * st, ny = a.y + py / m * st / 1.4;
    if (Math.hypot(nx - a.goal.x, ny - a.goal.y) > C11_SEP_MAX) continue;
    if (!c11WalkTile(Math.floor(nx), Math.floor(ny - .01))) continue;
    a.x = nx; a.y = ny;
  }
}
(() => {
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) { if (!C11.sleep && !C11.eat && !C11.menu) c11TapPick(wx, wy); oldTap(tx, ty, wx, wy); };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) { oldUpd(dt); if (!C11.menu && !C11.fade) c11SpreadFolk(dt); };
})();
