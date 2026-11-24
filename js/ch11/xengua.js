/* Chương XI · Làng Vũ Đại — TRẠM XE NGỰA (owner 2026-11-23: "nghĩ cách người chơi teleport cho hợp lý, nhưng những chỗ xa thì mới có",
   then "như kiểu trạm xe ngựa và đi thì mất tiền").
   A coach stop stands in the middle of the 13 far places that matter: the first place of each region and the nine far villages.
   Nothing in the old village has one. A stop is opened (SAVE11.cart[id] = 1) the first time the player reaches it on foot and taps it;
   from any stop the cart goes to Xóm làng Vũ Đại (always) or to any stop already opened, and the fare grows with the distance
   (C11_CART_BASE + C11_CART_HOP per place passed; places off a region's tree count through the village).
   Tap the stop (a far tap walks there first) -> a list of regions -> a list of stops -> pay, fade, arrive beside the other stop. */
const C11_CART_BASE = 10, C11_CART_HOP = 8, C11_CART_AT = [16.2, 8.8], C11_CART_STAND = [15, 9];
const C11_CART_STOPS = C11_FAR.filter(r => r[2] === 'village' || r[5] === '@').map(r => r[0]);
const c11CartDepth = id => { let n = 0; for (let P = C11_FAR_BY[id]; P; P = P.par === '@' ? null : C11_FAR_BY[P.par]) n++; return n; };   // 1 for a region's first place
const c11CartChain = id => { const L = []; for (let P = C11_FAR_BY[id]; P; P = P.par === '@' ? null : C11_FAR_BY[P.par]) L.push(P.id); return L; };
function c11CartHops(a, b) {                                               // places passed between two stops (home = 'lang', 2 more than a region's first place)
  if (a === b) return 0;
  const hv = id => id === 'lang' ? 0 : c11CartDepth(id) + 2;
  if (a === 'lang' || b === 'lang' || C11_FAR_BY[a].reg !== C11_FAR_BY[b].reg) return hv(a) + hv(b);
  const A = c11CartChain(a), B = c11CartChain(b), common = A.find(x => B.includes(x));
  return common ? A.indexOf(common) + B.indexOf(common) : hv(a) + hv(b);
}
const c11CartFare = (a, b) => C11_CART_BASE + C11_CART_HOP * c11CartHops(a, b);

/* the stop's tiles are grass whatever the generator put there, so it can always be reached */
for (const id of C11_CART_STOPS) {
  const A = C11_AREAS[id]; if (!A) continue;
  for (let y = 7; y <= 9; y++) for (let x = 15; x <= 17; x++) if (A.map[y] && !'pE'.includes(A.map[y][x])) A.map[y][x] = 'g';
  for (const k of Object.keys(A.treeAt || {})) { const [x, y] = k.split(',').map(Number); if (x >= 15 && x <= 17 && y >= 7 && y <= 9) delete A.treeAt[k]; }
}
const c11CartHere = () => C11_CART_STOPS.includes(C11.area);

function c11CartHome() {                                                    // a path tile of the village hub near its middle
  const M = C11_AREAS.lang.map; let best = [15, 10], bd = 1e9;
  for (let y = 0; y < M.length; y++) for (let x = 0; x < M[0].length; x++) if (M[y][x] === 'p') { const d = Math.hypot(x - 15, y - 10); if (d < bd) { bd = d; best = [x, y]; } }
  return [best[0] + .5, best[1] + .6];
}
function c11CartGo(to, fare) {
  if (SAVE11.money < fare) { C11.menu.note = 'Không đủ tiền xe'; return; }
  SAVE11.money -= fare; C11.menu = null; C11.boating = false; persist11();
  if (to === 'lang') { const [x, y] = c11CartHome(); c11GoArea('lang', x, y); }
  else c11GoArea(to, C11_CART_STAND[0] + .5, C11_CART_STAND[1] + .6);
}
function c11CartOpen() {
  const G = C11, here = G.area; G.go = null; SAVE11.cart = SAVE11.cart || {};
  if (!SAVE11.cart[here]) { SAVE11.cart[here] = 1; persist11(); c11Msg('Đã nhớ trạm xe ngựa ' + C11_FAR_BY[here].name, '#2f6a4c'); }
  const regs = Object.keys(C11_REGIONS), open = id => id !== here && SAVE11.cart[id];
  const rows = [{ name: 'Về Xóm làng Vũ Đại', sub: 'Xe chạy về trung tâm làng', tag: c4Money(c11CartFare(here, 'lang')), ok: SAVE11.money >= c11CartFare(here, 'lang'), f: () => c11CartGo('lang', c11CartFare(here, 'lang')) }];
  for (const r of regs) {
    const L = C11_CART_STOPS.filter(id => C11_FAR_BY[id].reg === r && open(id)); if (!L.length) continue;
    rows.push({ name: C11_REGIONS[r].name, sub: `${L.length} trạm đã đến`, tag: ' ', f: () => c11CartPick(r) });
  }
  G.menu = { title: 'Trạm xe ngựa', note: rows.length > 1 ? 'Tiền xe tính theo quãng đường' : 'Đi bộ tới trạm khác trước thì mới đi xe tới đó được', cols: 1, rows };
}
function c11CartPick(r) {
  const here = C11.area, L = C11_CART_STOPS.filter(id => C11_FAR_BY[id].reg === r && id !== here && SAVE11.cart[id]);
  C11.menu = { title: C11_REGIONS[r].name, note: 'Tiền xe tính theo quãng đường', cols: L.length > 4 ? 2 : 1, rows: L.map(id => {
    const fare = c11CartFare(here, id);
    return { name: C11_FAR_BY[id].name, sub: C11_FAR_BY[id].kind === 'village' ? 'Làng' : 'Chỗ đầu vùng', tag: c4Money(fare), ok: SAVE11.money >= fare, f: () => c11CartGo(id, fare) };
  }).concat([{ name: '← Chọn vùng khác', sub: ' ', tag: ' ', f: () => c11CartOpen() }]) };
}

(() => {
  const near = () => Math.hypot(C11.px - (C11_CART_STAND[0] + .5), C11.py - (C11_CART_STAND[1] + .6)) < 1.6;
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    const G = C11;
    if (c11CartHere() && !G.sleep && !G.eat && !G.menu && !G.inW && Math.abs(wx - C11_CART_AT[0]) < 1.5 && wy > C11_CART_AT[1] - 1.8 && wy < C11_CART_AT[1] + .5) {
      if (near()) { c11CartOpen(); return; }
      const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty)));
      if (d[C11_CART_STAND[1]] && d[C11_CART_STAND[1]][C11_CART_STAND[0]] >= 0) { G.go = { path: c11Route(d, C11_CART_STAND[0], C11_CART_STAND[1]), act: null }; G.cartGo = 1; return; }
    }
    oldTap(tx, ty, wx, wy);
  };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    const G = C11;
    if (G.cartGo) { if (!c11CartHere()) G.cartGo = 0; else if (!G.go) { G.cartGo = 0; if (!G.menu && near()) c11CartOpen(); } }
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    if (!c11CartHere()) return;
    const G = C11, ax = C11_CART_AT[0], ay = C11_CART_AT[1];
    E.push({ y: ay, d: () => {
      const X = sx(ax), Y = sy(ay), s = T / 64;
      g.save(); g.translate(X, Y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#3a2416'; g.lineWidth = 2.4;
      g.fillStyle = 'rgba(22,46,34,.22)'; g.beginPath(); g.ellipse(2, 2, 52, 9, 0, 0, 6.283); g.fill();
      g.fillStyle = '#a87648';                                                                                      // two posts
      for (const px of [-40, 40]) { g.beginPath(); g.roundRect(px - 4, -78, 8, 78, 2); g.fill(); g.stroke(); }
      g.fillStyle = '#b9923c'; g.beginPath(); g.moveTo(-56, -72); g.lineTo(0, -102); g.lineTo(56, -72); g.lineTo(48, -66); g.lineTo(-48, -66); g.closePath(); g.fill(); g.stroke();   // thatched roof
      g.strokeStyle = 'rgba(58,36,22,.45)'; g.lineWidth = 1.4; for (let i = -40; i <= 40; i += 10) { g.beginPath(); g.moveTo(i * .55, -96 + Math.abs(i) * .12); g.lineTo(i, -69); g.stroke(); }
      g.strokeStyle = '#3a2416'; g.lineWidth = 2.4; g.fillStyle = '#c8402f';
      const sw = Math.sin(G.t * 1.6) * 2; g.beginPath(); g.moveTo(0, -66); g.lineTo(sw * .3, -58); g.stroke(); g.beginPath(); g.ellipse(sw * .3, -52, 7, 9, 0, 0, 6.283); g.fill(); g.stroke();   // lantern
      g.fillStyle = '#f4e6c0'; g.beginPath(); g.roundRect(-30, -44, 60, 16, 3); g.fill(); g.stroke();                // sign
      g.fillStyle = '#3a2416'; g.font = '900 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('XE NGỰA', 0, -35.5);
      g.fillStyle = '#8a5a34'; g.beginPath(); g.roundRect(-34, -12, 68, 6, 2); g.fill(); g.stroke();                  // bench
      g.beginPath(); g.moveTo(-26, -6); g.lineTo(-26, 0); g.moveTo(26, -6); g.lineTo(26, 0); g.stroke();
      g.fillStyle = '#c89a5e'; g.beginPath(); g.arc(62, -12, 12, 0, 6.283); g.fill(); g.stroke();                     // a cart wheel leaning on the post
      g.lineWidth = 1.6; for (let i = 0; i < 4; i++) { const a = i * .7854; g.beginPath(); g.moveTo(62 + Math.cos(a) * 12, -12 + Math.sin(a) * 12); g.lineTo(62 - Math.cos(a) * 12, -12 - Math.sin(a) * 12); g.stroke(); }
      g.restore();
    } });
  };
})();
