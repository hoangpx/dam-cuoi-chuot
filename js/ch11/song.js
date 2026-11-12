/* Chương XI · Làng Vũ Đại — the water (owner 2026-11-10/11, batch B of "map lớn hơn... bơi lội, đi thuyền"):
   BƠI: skill 'boi' taught by the fisher. Knowing it, water tiles ('w') can be walked into with the keys or the joystick, or by
   tapping (a tap while in the water, or on water close by, swims straight there: C11.swimTo). Swimming is slow (C11_SWIM.k), costs
   strength every second (C11_SWIM.cost) and no tool works; out of strength the mouse is washed back to the last bank it stood on and
   loses some health. Things float on the bến river and the forest stream each morning; the stream's far bank (reached only by
   swimming) has the forest's best finds.
   THUYỀN: the fisher sells a thuyền nan (C11_BOAT_PRICE). It lies on the water where it was left (SAVE11.boat { a, x, y }); stepping
   into the water beside it boards it (C11.boating): fast, no strength spent, the rod works from it; stepping onto land leaves it there.
   ĐÒ: tap the ferry boat at the bến (or on the cồn) to be taken across for C11_FERRY đồng.
   CỒN GIỮA SÔNG (area 'con', 26×16): an island east of the bến's river (swim or row off the river's east edge, or take the ferry):
   shells and clams on the shore each morning, sand to dig with a pearl now and then, the river's best fish. */

const C11_SWIM = { k: .6, cost: 1.2, boat: 1.3, hp: 20 }, C11_BOAT_PRICE = 600, C11_FERRY = 5;
C11_SKILLS.boi = { name: 'Bơi lội', who: 'trade:chài lưới', hearts: 2, fee: 60, desc: 'Bơi qua ao, suối, sông. Bơi tốn sức, hết sức thì dạt vào bờ.', say: ['Thả lỏng người, đạp chân đều, đừng vùng vẫy là nổi.', 'Sông rộng thì bơi chéo theo dòng, đừng bơi ngược nước.'] };

/* ---------- the island ---------- */
const C11_CON_MAP = (() => {
  const W = 26, H = 16, m = c11Grid(W, H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) m[y][x] = 'w';
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const e = ((x - 14) / 8.3) ** 2 + ((y - 7.6) / (4.4 + Math.sin(x * .9) * .5)) ** 2; if (e <= 1) m[y][x] = 'g'; }
  for (const [x, y] of [[9, 6], [12, 4], [16, 5], [19, 7], [18, 10], [13, 10], [10, 9], [21, 8], [15, 8]]) m[y][x] = 't';
  m[8][4] = 'b'; m[8][5] = 'b';                                        // the landing stage on the west shore
  for (const y of [7, 8, 9]) m[y][0] = 'E';                           // the whole gap in the west edge leads back to the bến
  return m;
})();
C11_AREAS.con = { id: 'con', name: 'Cồn giữa sông', map: C11_CON_MAP, houses: [], stalls: [], wild: 1, lane: [],
  treeAt: { '9,6': 'dua', '12,4': 'banana', '16,5': 'dua', '19,7': 'bamboo', '18,10': 'dua', '13,10': 'banana', '10,9': 'cau', '21,8': 'dua', '15,8': 'xoai' },
  exits: { '0,7': ['ben', 21.8, 10.6, ''], '0,8': ['ben', 21.8, 11.6, '← Bến sông'], '0,9': ['ben', 21.8, 12.6, ''] } };
for (const y of [9, 10, 11, 12, 13]) { C11_BEN[y][23] = 'E'; C11_AREAS.ben.exits['23,' + y] = ['con', 1.9, y < 11 ? 7.6 : y > 11 ? 9.6 : 8.6, y === 11 ? 'Cồn giữa sông →' : '']; }   // the river's whole east edge (a sign on one tile only)
C11_BEASTS.con = [];
if (typeof C11_FISH2 !== 'undefined') C11_FISH2.con = [['ca_chep', 2.4], ['tom_dong', 1.6], ['ca_tram', 2, 0, 1], ['ca_qua', 1.2, 0, 1], ['ca_nheo', 1, 1, 1], ['ca_lang', 1.1, 1, 2], ['ca_chien', .5, 2, 2], ['ca_anh_vu', .16, 2, 3]].filter(r => C11_ITEMS[r[0]]);
if (typeof C11_DIG !== 'undefined') C11_DIG.con = [['cat', 5], ['vo_oc', 3], ['tien_bao_dai', .8], ['ngoc_trai', .5], ['bat_men_lam', .2], ['hat_da_quy', .08]].filter(r => C11_ITEMS[r[0]]);

/* ---------- what the water brings each morning ---------- */
const C11_FLOAT = [['hoa_sen', 2], ['hat_sen', 2], ['ngo_sen', 1.5], ['la_sen', 1.5], ['vo_oc', 1.5], ['cui_kho', 2], ['trai', 1]].filter(r => C11_ITEMS[r[0]]);
const C11_SHORE = [['hen', 3], ['trai', 2.5], ['oc_nhoi', 2], ['oc_buou', 2], ['vo_oc', 2], ['cua_dong', 1.5], ['ngoc_trai', .12]].filter(r => C11_ITEMS[r[0]]);
const C11_FARBANK = [['mat_ong_rung', 2], ['nam_huong', 2], ['cu_mai', 2], ['tram', 1.5], ['moc_nhi', 1.5]].filter(r => C11_ITEMS[r[0]]);
const c11WPick = L => { let q = Math.random() * L.reduce((s, r) => s + r[1], 0); for (const r of L) { q -= r[1]; if (q <= 0) return r[0]; } return L[0][0]; };
function c11WaterSpawn(a) {
  const D = SAVE11.songDay || (SAVE11.songDay = {}); if (D[a] === SAVE11.day) return; D[a] = SAVE11.day;
  const M = C11_AREAS[a].map, H = M.length, W = M[0].length, water = [], shore = [], far = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const k = M[y][x], nearW = C11_D4.some(([dx, dy]) => M[y + dy][x + dx] === 'w');
    if (k === 'w' && C11_D4.every(([dx, dy]) => 'wE'.includes(M[y + dy][x + dx]))) water.push([x, y]);
    if (k === 'g' && nearW) shore.push([x, y]);
    if (a === 'rungram' && k === 'g' && x < 8) far.push([x, y]);
  }
  SAVE11.drops = SAVE11.drops.filter(d => !(d.a === a && d.w));
  const put = (cells, L, n) => { for (let i = 0; i < n && cells.length; i++) { const [x, y] = cells.splice((Math.random() * cells.length) | 0, 1)[0]; SAVE11.drops.push({ k: c11WPick(L), a, w: 1, x: x + .5, y: y + .7, x0: x + .5, y0: y + .7, t: .01, dur: .01, h: 0 }); } };
  if (a === 'ben') put(water, C11_FLOAT, 6);
  if (a === 'rungram') { put(water, C11_FLOAT, 3); put(far, C11_FARBANK, 5); }
  if (a === 'con') { put(shore, C11_SHORE, 11); put(water, C11_FLOAT, 3); }
  persist11();
}

/* ---------- swimming and the boat ---------- */
const c11InWater = () => { const [x, y] = c11Tile(); return c11Kind(x, y) === 'w'; };
const c11BoatHere = () => SAVE11.boat && SAVE11.boat.a === C11.area ? SAVE11.boat : null;
/* may this point of water be entered? (asked by c11Solid in nongtrai.js) */
function c11SwimOk(px, py) {
  if (C11.boating || c11Know('boi')) return true;
  const b = c11BoatHere(); return !!b && Math.hypot(px - b.x, py - b.y) < 1.7;
}
const c11SwimK = () => !C11.inW ? 1 : C11.boating ? C11_SWIM.boat : C11_SWIM.k;
function c11NearLand(x0, y0) {                                          // the nearest tile to stand on
  let best = null;
  for (let y = 1; y < C11_H - 1; y++) for (let x = 1; x < C11_W - 1; x++) { if (c11Blocked(x, y) || c11Kind(x, y) === 'E') continue; const d = Math.hypot(x + .5 - x0, y + .6 - y0); if (!best || d < best.d) best = { x: x + .5, y: y + .6, d }; }
  return best;
}
function c11Ferry(to) {
  const there = to === 'con';
  C11.go = null; C11.menu = { title: there ? 'Đò ra cồn' : 'Đò về bến', note: `Tiền đò ${c4Money(C11_FERRY)}`, cols: 1, rows: [{ name: there ? 'Sang Cồn giữa sông' : 'Về Bến sông', sub: there ? 'Bãi cát giữa sông: hến, trai, ốc mỗi sáng, cá sông lớn' : 'Ông lái đò chở về bến', tag: `Đi đò · ${c4Money(C11_FERRY)}`, ok: SAVE11.money >= C11_FERRY, f: () => {
    if (SAVE11.money < C11_FERRY) { C11.menu.note = 'Không đủ tiền đò'; return; }
    SAVE11.money -= C11_FERRY; C11.menu = null; C11.boating = false; persist11(); if (there) c11GoArea('con', 5.5, 8.6); else c11GoArea('ben', 12.5, 8.6);
  } }] };
}
const C11_FERRY_AT = { ben: [14.6, 10.95, 12, 10, 'con'], con: [3.3, 9.5, 4, 8, 'ben'] };   // the ferry boat's place, the plank to stand on, where it goes

(() => {
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) {
    const rowing = C11.boating && SAVE11.boat;
    oldEnter(id, x, y, quiet);
    C11.swimTo = null; C11.land = null;
    if (rowing && C11_AREAS[id].map[Math.floor(y - .01)] && C11_AREAS[id].map[Math.floor(y - .01)][Math.floor(x)] === 'w') { SAVE11.boat.a = id; SAVE11.boat.x = x; SAVE11.boat.y = y; } else C11.boating = false;
    if (id === 'ben' || id === 'rungram' || id === 'con') c11WaterSpawn(id);
  };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    const G = C11; if (G.fade || G.sleep) return;
    const inW = c11InWater(), b = c11BoatHere();
    if (inW && !G.inW) {                                               // just went in
      if (b && Math.hypot(G.px - b.x, G.py - b.y) < 1.9) { G.boating = true; c11Msg('Xuống thuyền, chèo đi thôi', '#2f6a4c'); }
      else { c11Dots(Math.floor(G.px), Math.floor(G.py), '#bfe0ea', 12, 1.6); if (!G.swimTold) { G.swimTold = 1; c11Msg('Bơi tốn sức, nhớ để dành sức vào bờ', '#b0701a'); } }
    }
    if (!inW && G.inW && G.boating) { G.boating = false; }
    G.inW = inW;
    if (!inW) { G.land = { a: G.area, x: G.px, y: G.py }; G.swimTo = null; }
    else if (G.boating && b) { b.x = G.px; b.y = G.py; }
    else {
      G.swimT = (G.swimT || 0) + dt; if (G.swimT >= 1) { G.swimT -= 1; c11Spend(C11_SWIM.cost); }
      if (SAVE11.stamina <= 0) {                                       // spent: washed ashore
        const L = G.land && G.land.a === G.area ? G.land : c11NearLand(G.px, G.py);
        if (L) { G.px = L.x; G.py = L.y; } G.inW = false; G.swimTo = null; G.go = null;
        SAVE11.hp = Math.max(1, (SAVE11.hp ?? C11_HP) - C11_SWIM.hp); G.hurt = .6; c11Msg('Đuối sức! Sóng đánh dạt vào bờ', '#a3332a'); persist11();
      }
    }
    /* a tap while in the water: go straight there */
    if (G.swimTo) {
      const K = G.keys, key = K.ArrowRight || K.KeyD || K.ArrowLeft || K.KeyA || K.ArrowDown || K.KeyS || K.ArrowUp || K.KeyW || G.joy && (G.joy.x || G.joy.y);
      const ex = G.swimTo.x - G.px, ey = G.swimTo.y - G.py, d = Math.hypot(ex, ey);
      if (key || d < .12) G.swimTo = null;
      else {
        const st = Math.min(d, (SAVE11.stamina <= 0 ? 1.5 : 2.8) * c11SwimK() * dt), nx = G.px + ex / d * st, ny = G.py + ey / d * st; let moved = false;
        if (c11Free(nx, G.py)) { G.px = nx; moved = true; } if (c11Free(G.px, ny)) { G.py = ny; moved = true; }
        if (!moved) G.swimTo = null; else { G.moving = true; G.ph += dt * 6; if (Math.abs(ex) > .05) G.face = ex > 0 ? 1 : -1; }
      }
    }
    /* someone who cannot swim pushing at the water: say who teaches it (once a place) */
    if (!inW && !c11Know('boi') && !b && G.moving && G.kbd && G.swimHint !== G.area) {
      const fx = Math.floor(G.px + (G.fx0 || 0) * .6), fy = Math.floor(G.py - .05 + (G.fy0 || 0) * .6);
      if (c11Kind(fx, fy) === 'w') { G.swimHint = G.area; c11Msg('Chưa biết bơi. Người chài lưới ở bến sông dạy bơi', '#5b2f1f'); }
    }
  };
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    const G = C11; if (G.sleep || G.eat || G.menu) return oldTap(tx, ty, wx, wy);
    const F = C11_FERRY_AT[G.area];
    if (F && Math.abs(wx - F[0]) < 1.6 && wy > F[1] - 1.2 && wy < F[1] + .5) {   // the ferry boat
      if (Math.hypot(G.px - (F[2] + .5), G.py - (F[3] + .6)) < 2.2) { c11Ferry(F[4]); return; }
      const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty)));
      if (d[F[3]][F[2]] >= 0) { G.go = { path: c11Route(d, F[2], F[3]), act: null }; G.ferryGo = F[4]; return; }
    }
    const k = c11Kind(tx, ty), tool = c11HandTool(), inW = c11InWater();
    if (inW && !G.boating) { G.go = null; G.swimTo = { x: wx, y: wy }; return; }             // swimming: no tool works, a tap swims there
    if (inW && G.boating && !(tool === 'rod' && k === 'w')) { G.go = null; G.swimTo = { x: wx, y: wy }; return; }
    if (!inW && k === 'w' && tool !== 'can' && tool !== 'rod' && Math.hypot(wx - G.px, wy - G.py) < 2.6 && c11SwimOk(wx, wy)) { G.go = null; G.swimTo = { x: wx, y: wy }; return; }
    oldTap(tx, ty, wx, wy);
  };
  /* arriving at the ferry plank after a far tap */
  const oldUpd2 = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd2(dt);
    const G = C11, F = C11_FERRY_AT[G.area];
    if (G.ferryGo && F) { if (!G.go) { if (Math.hypot(G.px - (F[2] + .5), G.py - (F[3] + .6)) < 1.2 && !G.menu) c11Ferry(F[4]); G.ferryGo = null; } } else G.ferryGo = null;
  };
  /* the small boat, the ferry on the island, floating finds */
  const hull = (g, X, Y, T, a) => {
    const w = T * .78, h = T * .26;
    g.fillStyle = 'rgba(20,50,70,.25)'; g.beginPath(); g.ellipse(X, Y + h * .5, w * 1.02, h * .5, 0, 0, 6.283); g.fill();
    g.fillStyle = a ? '#8a5a34' : '#a87648'; g.strokeStyle = '#3a2416'; g.lineWidth = 2; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(X - w, Y - h * .55); g.quadraticCurveTo(X - w * .7, Y + h * .75, X, Y + h * .8); g.quadraticCurveTo(X + w * .7, Y + h * .75, X + w, Y - h * .55);
    if (a) { g.quadraticCurveTo(X, Y + h * .1, X - w, Y - h * .55); } else { g.quadraticCurveTo(X, Y - h * 1.1, X - w, Y - h * .55); }
    g.closePath(); g.fill(); g.stroke();
    if (!a) { g.strokeStyle = 'rgba(58,36,22,.5)'; g.lineWidth = 1.2; for (const q of [-.5, 0, .5]) { g.beginPath(); g.moveTo(X + q * w, Y - h * .7); g.lineTo(X + q * w * .9, Y + h * .6); g.stroke(); } }
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    const G = C11, b = c11BoatHere();
    if (b && !(G.boating && G.inW)) E.push({ y: b.y - .02, d: () => { const bob = Math.sin(G.t * 1.5) * 1.5; hull(g, sx(b.x), sy(b.y) + bob, T, 0); } });
    if (G.area === 'con') { const A2 = c11Art2(); E.push({ y: 9.5, d: () => c11Spr(g, A2.thuyen, sx(3.3), sy(9.5) + Math.sin(G.t * 1.3) * 2 * k, k * .9) }); }
    for (const d of SAVE11.drops) if (d.w && d.a === G.area && c11Kind(Math.floor(d.x), Math.floor(d.y)) === 'w') E.push({ y: d.y - .3, d: () => {   // a ring round what floats
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(sx(d.x), sy(d.y) - T * .02, T * (.22 + Math.sin(G.t * 2 + d.x) * .03), T * .08, 0, 0, 6.283); g.stroke(); } });
  };
  /* the mouse in the water: only the top half shows, with rings; in the boat it sits in the hull */
  window.c11SwimDrawMe = function (g, sx, sy, T, V, arm) {
    const G = C11, X = sx(G.px), Y = sy(G.py), me = { sort: 0, id: 99, groom: true };
    if (G.boating) {
      const bob = Math.sin(G.t * 1.5) * 1.5;
      hull(g, X, Y + bob, T, 0);
      g.save(); g.beginPath(); g.rect(X - T, Y - T * 2, T * 2, T * 2 - T * .02 + bob); g.clip(); c11Folk1(g, me, X, Y + T * .16 + bob, G.face, 0, false, T, arm, V); g.restore();
      hull(g, X, Y + bob, T, 1);
      const sw = Math.sin(G.ph * .9) * .5 * (G.moving ? 1 : .15);                                  // the oar
      g.strokeStyle = '#5b3a1e'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(X + G.face * T * .05, Y - T * .5 + bob); g.lineTo(X + G.face * T * (.55 + sw * .3), Y + T * (.2 + sw * .1)); g.stroke();
      return;
    }
    const dip = T * .46, bob = Math.sin(G.t * 3) * 1.5;
    g.save(); g.beginPath(); g.rect(X - T, Y - T * 2, T * 2, T * 2 - T * .06); g.clip(); c11Folk1(g, me, X, Y + dip + bob, G.face, G.ph, false, T, G.moving ? -1 : arm, V); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2;
    for (let i = 0; i < 2; i++) { const p = (G.t * .7 + i * .5) % 1; g.globalAlpha = 1 - p; g.beginPath(); g.ellipse(X, Y - T * .05, T * (.2 + p * .32), T * (.07 + p * .1), 0, 0, 6.283); g.stroke(); }
    g.globalAlpha = 1;
  };
  /* the fisher sells the boat */
  if (typeof c11ToolRows === 'function') {
    const oldRows = c11ToolRows;
    c11ToolRows = function (shop) {
      const rows = oldRows(shop);
      if (shop.who === 'trade:chài lưới') rows.push({ name: 'Thuyền nan', sub: SAVE11.boat ? 'Đã có · thuyền nằm ở chỗ bạn rời nó' : 'Tự chèo trên sông không tốn sức, câu được từ trên thuyền', price: C11_BOAT_PRICE, ok: !SAVE11.boat && SAVE11.money >= C11_BOAT_PRICE, f: () => {
        if (SAVE11.boat) { C11.menu.note = 'Bạn đã có thuyền rồi'; return; } if (!c11Money2(C11_BOAT_PRICE)) { C11.menu.note = 'Chưa đủ tiền'; return; }
        SAVE11.boat = { a: 'ben', x: 13.5, y: 10.4 }; persist11(); C11.menu.note = 'Đã mua thuyền nan. Thuyền buộc cạnh cầu ván ở bến sông'; } });
      return rows;
    };
  }
})();
