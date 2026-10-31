/* Chương XI · animals raid the crops, fences keep them out (owner 2026-10-31: "trâu, bò, gà có thể vào ăn rau, nên người chơi phải đứng canh;
   ấn vào con trâu mà đứng gần thì nó chạy đi một đoạn ra xa; muốn bảo vệ rau thì phải học đóng hàng rào và tốn gỗ").
   - RAIDERS: the wild hens, cocks, cows and buffalo on the home farm (not the ones kept in pens). Every 30-70 s an idle one picks the nearest
     crop within 9 tiles, walks to it, grazes 2.5 s and the plant is gone (the soil stays). Harvesting it, shooing the animal or a fence in
     the way stops the raid.
   - SHOOING: tap a wild cow or buffalo with the player within 2.8 tiles and it bolts about 4.5 tiles away from the player (a hen is
     picked up and thrown instead, bong.js).
   - FENCES: the skill "Làm hàng rào" (the carpenter, 2 hearts) and the Búa đục: in its build list "Hàng rào tre" switches to fence mode,
     then each tap on any free ground tile (grass, lane, hoed earth) near the player puts up a piece for RAO_WOOD logs, a tap on a piece takes it down (nothing back);
     changing tool ends the mode. A fence blocks the animals only: the player steps over it. SAVE11.fences { 'x,y': 1 }, home farm only. */
const RAO_WOOD = 2, RAO_RAID = ['ga', 'trong', 'bo', 'trau'], RAO_SHOO = ['bo', 'trau'];
SAVE11.fences = SAVE11.fences || {};
C11_SKILLS.rao = { name: 'Làm hàng rào', who: 'trade:thợ mộc', alt: 'tho', hearts: 2, fee: 50, desc: 'Đóng hàng rào tre quanh ruộng cho trâu bò gà không vào ăn rau.', say: ['Rào phải cắm cọc sát nhau, buộc lạt hai tầng, trâu húc cũng không đổ.', 'Rào kín quanh ruộng thì ngủ yên, anh ạ, khỏi phải ngồi canh.'] };
const raoOn = (x, y) => !!SAVE11.fences[x + ',' + y];
const raoRaider = b => !b.herd && !b.fly && b !== C11.carry && RAO_RAID.includes(b.kind);
function raoTarget(b) {                                                                    // the nearest planted tile within 9 tiles
  let best = null, bd = 81;
  for (const key of Object.keys(SAVE11.tiles)) { const t = SAVE11.tiles[key]; if (!t || !t.crop || key.includes(':')) continue; const [x, y] = key.split(',').map(Number), d = (x + .5 - b.x) ** 2 + (y + .6 - b.y) ** 2; if (d < bd) { bd = d; best = [x, y]; } }
  return best;
}
const raoCancel = b => { b.raid = null; b.rc = 20 + Math.random() * 45; };
const raoHome = (b, dt) => {                                                                // ---- one raider per frame
  const r = b.raid;
  if (b.flee) { const f = b.flee; f.t -= dt; const nx = b.x + f.dx * 3.4 * dt, ny = b.y + f.dy * 3.4 * dt;
    if (f.t <= 0 || !c11Free(nx, ny) || raoOn(Math.floor(nx), Math.floor(ny))) b.flee = null; else { b.x = nx; b.y = ny; b.face = f.dx >= 0 ? 1 : -1; b.moving = true; b.ph += dt * 12; b.wait = Math.max(b.wait, .3); b.to = null; }
    return; }
  if (!r) { b.rc = (b.rc === undefined ? 25 + Math.random() * 40 : b.rc) - dt;
    if (b.rc <= 0) { const t = raoTarget(b); if (t) { b.raid = { tx: t[0], ty: t[1], st: 'go', bump: 0 }; b.wait = 0; b.to = t; } else b.rc = 15 + Math.random() * 20; }
    return; }
  const tile = SAVE11.tiles[r.tx + ',' + r.ty];
  if (!tile || !tile.crop) { raoCancel(b); return; }                                       // harvested meanwhile
  if (r.st === 'go') {
    if (Math.hypot(r.tx + .5 - b.x, r.ty + .6 - b.y) < .45) { r.st = 'eat'; r.t = 2.5; b.to = null; b.wait = 2.6; return; }
    if (!b.to && b.wait <= 0) { b.to = [r.tx, r.ty]; }
    if (b.blocked) { b.blocked = 0; if (++r.bump >= 3) raoCancel(b); }
  } else {
    r.t -= dt; b.wait = Math.max(b.wait, .3);
    if (r.t <= 0) { const id = tile.crop, nm = C11_CROPS[id] ? C11_CROPS[id].name.toLowerCase() : 'rau';
      tile.crop = null; tile.age = 0; tile.wet = 0; c11Dots(r.tx, r.ty - .2, '#6fa54c', 8); c11Msg(`${b.kind === 'ga' || b.kind === 'trong' ? 'Gà' : b.kind === 'bo' ? 'Bò' : 'Trâu'} ăn mất ${nm}!`, '#a3332a'); persist11(); raoCancel(b); }
  }
};
const raoNewUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  const G = C11;
  if (G.area === 'ruong') for (const b of G.beasts || []) {
    if (b.herd || b.fly || b === G.carry) { b.lx = b.x; b.ly = b.y; continue; }
    if (raoOn(Math.floor(b.x), Math.floor(b.y)) && b.lx !== undefined) {                    // walked into a fence: back off
      b.x = b.lx; b.y = b.ly; b.to = null; b.wait = Math.max(b.wait, 1.2); b.blocked = 1; b.moving = false; }
    else { b.lx = b.x; b.ly = b.y; }
    if (raoRaider(b) && !G.sleep && SAVE11.day >= 1) raoHome(b, dt);
  }
  if (G.fence && c11HandTool() !== 'dan') G.fence = false;                                   // another tool ends fence mode
  return raoNewUpdate0(dt);
};
const raoTap0 = c11Tap;
c11Tap = function (tx, ty, wx, wy) {
  if (C11.sleep || C11.menu) return raoTap0(tx, ty, wx, wy);
  if (C11.fence && C11.area === 'ruong' && c11HandTool() === 'dan') {                         // fence mode: a tap builds or takes down a piece
    if (Math.hypot(tx + .5 - C11.px, ty + .5 - C11.py) > 4.5) { c11Msg('Đứng gần hơn một chút', '#5b2f1f'); return; }
    const key = tx + ',' + ty;
    if (raoOn(tx, ty)) { delete SAVE11.fences[key]; c11Dots(tx, ty, '#c89a5e', 6); persist11(); return; }
    if (tx < 1 || ty < 1 || tx >= C11_W - 1 || ty >= C11_H - 1 || c11Blocked(tx, ty) || 'tE'.includes(c11Kind(tx, ty)) || (SAVE11.tiles[key] && (SAVE11.tiles[key].dan || SAVE11.tiles[key].crop)) || c11PenAt(tx, ty)) { c11Msg('Chỗ này đóng rào không được', '#5b2f1f'); return; }   // anywhere walkable, hoed earth too (not on a trellis or a crop)
    if (!c11Take('go', RAO_WOOD)) { c11Msg(`Cần ${RAO_WOOD} gỗ trong túi cho mỗi đoạn rào`, '#a3332a'); return; }
    c11Spend(C11_COST.dan * .5); SAVE11.fences[key] = 1; c11Dots(tx, ty, '#c89a5e', 8); c11Chips && c11Chips(tx, ty - .3, C11.face * -1, 6); persist11(); return;
  }
  for (const b of C11.beasts || []) if (!b.herd && RAO_SHOO.includes(b.kind) && Math.abs(wx - b.x) < .8 && wy > b.y - 1.2 && wy < b.y + .35) {
    const dx = b.x - C11.px, dy = b.y - C11.py, L = Math.hypot(dx, dy) || 1;
    if (L < 2.8) { b.flee = { dx: dx / L, dy: dy / L * .6, t: 1.3 }; const n = Math.hypot(b.flee.dx, b.flee.dy); b.flee.dx /= n; b.flee.dy /= n; b.raid = null; b.rc = 25 + Math.random() * 40; b.to = null;
      c11Pop(Math.floor(b.x), Math.floor(b.y) - 1, b.kind === 'bo' ? 'Ò ò!' : 'Ụm ò!', '#5b2f1f'); return; }
    break;
  }
  return raoTap0(tx, ty, wx, wy);
};
const raoBuild0 = c11BuildMenu;
c11BuildMenu = function (tx, ty) {
  raoBuild0(tx, ty); if (C11.area !== 'ruong' || !C11.menu || !C11.menu.rows) return;
  const ok = c11Know('rao');
  C11.menu.rows.push({ name: 'Hàng rào tre', sub: ok ? `${RAO_WOOD} gỗ một đoạn · trâu bò gà không bước qua được` : 'Phải học "Làm hàng rào" trước', price: 0, tag: `${RAO_WOOD} gỗ / đoạn`, ok, f: () => {
    if (!c11Know('rao')) { C11.menu.note = 'Phải học "Làm hàng rào" trước'; return; }
    C11.menu = null; C11.fence = true; c11Msg('Bấm từng ô để đóng rào, bấm vào đoạn rào để dỡ. Đổi dụng cụ thì thôi.', '#2f6a4c'); } });
};
const raoDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {                                         // the same green bamboo fence as round the village houses (dinhba.js, tile 'R')
  raoDraw0(E, g, sx, sy, k, T);
  if (C11.area !== 'ruong') return;
  const pole = (x0, y0, x1, y1, w) => { g.strokeStyle = '#5e7a34'; g.lineWidth = (w + 1.4) * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#c4cc7a'; g.lineWidth = w * .45 * k; g.beginPath(); g.moveTo(x0 - .8 * k, y0 - .8 * k); g.lineTo(x1 - .8 * k, y1 - .8 * k); g.stroke(); };
  const post = (px, py) => { pole(px, py, px, py - 30 * k, 2.6); g.fillStyle = '#e4dca0'; g.beginPath(); g.ellipse(px, py - 30 * k, 2 * k, 1 * k, 0, 0, 6.283); g.fill(); };
  for (const key of Object.keys(SAVE11.fences)) {
    const [x, y] = key.split(',').map(Number), R = (dx, dy) => raoOn(x + dx, y + dy), X = sx(x + .5), Y = sy(y + .7);
    if (R(1, 0)) E.push({ y: y + .7, d: () => { const X2 = sx(x + 1.5); for (const h of [8, 18, 26]) pole(X, Y - h * k, X2, Y - h * k, 1.5); for (let i = 1; i < 6; i++) { const xx = X + (X2 - X) * i / 6; g.strokeStyle = 'rgba(120,140,60,.8)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(xx, Y - 2 * k); g.lineTo(xx, Y - 28 * k); g.stroke(); } post(X, Y); post(X2, Y); } });
    if (R(0, 1)) E.push({ y: y + 1.68, d: () => { const Y2 = sy(y + 1.7); for (const h of [8, 18, 26]) pole(X, Y - h * k, X, Y2 - h * k, 1.5); post(X, Y); post(X, Y2); } });
    if (!R(1, 0) && !R(0, 1) && !R(-1, 0) && !R(0, -1)) E.push({ y: y + .7, d: () => post(X, Y) });
  }
};
const raoEnter0 = c11Enter;
c11Enter = function () { C11.fence = false; return raoEnter0.apply(this, arguments); };
