/* Chương XI · Trạm dừng chân (a player's idea passed on by the owner, 2026-11-10: "trạm dừng chân ... nếu năng lượng còn ít thì ghé
   các quán này để ăn ngay tại quán"). A place south of the village market (its new way out at (10,14)) with four food stalls kept by
   villagers of their own (they are NOT in C11_PPL, so the village's names and ids stay as they were) and low tables with stools.
   A dish bought here is eaten sitting at a table (more strength than carrying it away, a little health, a few seconds sat down) or
   wrapped to take away (the dish item goes into the bag). Travellers sit at the other tables now and then.
   Hooks: c11ActNew / c11CanNew / c11NewUpdate / c11NewDraw (wrapped), and in nongtrai.js C11.eat (no walking, no taps while eating),
   C11_ME_SIT (the player's legs folded) and c11EatDrawMe (draws the player sat on the stool). */
const C11_TRAM_TABLES = [[4, 9], [8, 9], [13, 9], [17, 9], [6, 12], [15, 12]];        // a low table; a stool on each side of it
const C11_TRAM_SEATS = C11_TRAM_TABLES.flatMap(([x, y]) => [{ x: x - 1, y, tx: x, face: 1 }, { x: x + 1, y, tx: x, face: -1 }]);
const C11_TRAM = (() => {
  const W = 22, H = 14, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? 't' : 'g'));
  for (const x0 of [2, 6, 13, 17]) { for (let y = 2; y <= 4; y++) for (let x = x0; x <= x0 + 2; x++) m[y][x] = 'S'; m[5][x0 + 1] = 'S'; }   // the stalls and their counters
  for (let x = 1; x < W - 1; x++) m[6][x] = m[7][x] = 'p';
  for (let y = 1; y < 6; y++) m[y][10] = m[y][11] = 'p';
  m[0][10] = 'E';
  for (const [x, y] of C11_TRAM_TABLES) m[y][x] = 'j';
  for (const [x, y] of [[10, 11], [11, 11], [1, 4], [20, 4]]) m[y][x] = 't';                     // shade trees among the tables
  return m;
})();
/* the four stalls: who keeps them, what they say, which dishes (items of the 'mon' category: their price and strength come from items.js) */
const C11_TRAM_SHOPS = {
  bun: { x0: 2, name: 'bà Lựu', sort: 1, say: ['Bún riêu cua đồng đây, ăn một bát là quên đường về!', 'Ngồi xuống đi, nước dùng vừa sôi.'], dishes: ['bun_rieu', 'bun_oc', 'banh_da_cua', 'oc_luoc'] },
  com: { x0: 6, name: 'chị Thơm', sort: 2, say: ['Cơm nóng canh ngọt, đi đường xa thì phải ăn cho chắc dạ.', 'Cá kho tộ hôm nay kho từ sáng sớm đấy.'], dishes: ['com', 'canh_cua', 'rau_muong_xao', 'ca_kho', 'thit_kho'] },
  chao: { x0: 13, name: 'bà cụ Tằm', sort: 0, old: 1, say: ['Bát cháo hành nóng, ăn vào toát mồ hôi là khoẻ.', 'Bánh cuốn tráng tay, mỏng như giấy đây.'], dishes: ['chao_hanh', 'chao_ga', 'banh_cuon', 'banh_duc', 'banh_giay'] },
  che: { x0: 17, name: 'cô Mơ', sort: 3, say: ['Chè mát đây, uống một cốc là hết mệt.', 'Nghỉ chân uống bát nước chè xanh đi anh.'], dishes: ['nuoc_che_xanh', 'che_do_den', 'che_troi_nuoc', 'che_hat_sen', 'banh_troi'] },
};
const C11_TRAM_OPEN = [6 * 60, 21 * 60];          // the stalls open at 6:00 and shut at 21:00
const C11_TRAM_SIT = 4.5;                          // seconds sat at the table
const c11TramEat = id => { const f = C11_ITEMS[id].food; return { en: Math.round(f * 1.3), hp: Math.round(f / 2 + 6) }; };   // eaten at the table: a third more strength than carried away, and some health

C11_AREAS.tram = { id: 'tram', name: 'Trạm dừng chân', map: C11_TRAM, treeAt: { '10,11': 'xoai', '11,11': 'phuong', '1,4': 'dao', '20,4': 'xoai' }, houses: [],
  stalls: Object.entries(C11_TRAM_SHOPS).map(([kind, s]) => ({ x0: s.x0, by: 5, kind })),
  exits: { '10,0': ['cho', 10.5, 13.3, '↑ Chợ làng'] },
  lane: [[[[10.5, -.5], [10.6, 3], [10.8, 6.6]], 1.4], [[[.5, 6.6], [6, 6.5], [11, 6.8], [16, 6.5], [21.5, 6.6]], 1.6]] };
C11_MARKET[14][10] = 'E'; C11_MARKET[13][10] = 'g';
C11_AREAS.cho.exits['10,14'] = ['tram', 10.5, 1.7, 'Trạm dừng chân ↓'];
C11_AREAS.cho.lane.push([[[9.5, 7], [9.4, 10.5], [10.5, 13], [10.5, 14.5]], .7]);
C11_BEASTS.tram = [['ga', 3.5, 12.5, '#c119a5a'], ['cho', 19.5, 12.4], ['meo', 12.5, 8.6]];

const c11TramOpen = () => { const m = SAVE11.mins % (24 * 60); return m >= C11_TRAM_OPEN[0] && m < C11_TRAM_OPEN[1]; };
const c11TramShopAt = (tx, ty) => Object.entries(C11_TRAM_SHOPS).find(([, s]) => tx >= s.x0 && tx <= s.x0 + 2 && ty >= 2 && ty <= 5);
const c11TramKeeper = kind => { const s = C11_TRAM_SHOPS[kind]; return s.p || (s.p = { id: 'tram_' + kind, name: s.name, sort: (s.old ? C4_OLD_SORTS2 : C4_ADULT_SORTS2)[s.sort % (s.old ? C4_OLD_SORTS2 : C4_ADULT_SORTS2).length], role: s.old ? 'o' : 'a' }); };
function c11TramSellers() {                       // the keepers stand at their counters while the stalls are open
  for (const [kind, s] of Object.entries(C11_TRAM_SHOPS)) {
    const on = C11.area === 'tram' && c11TramOpen();
    if (on && !C11.sellers[kind]) C11.sellers[kind] = { p: c11TramKeeper(kind), x: s.x0 + 1.5, y: 5.92, ph: 0 };
    else if (!on && C11.sellers[kind]) delete C11.sellers[kind];
  }
}

/* buying: a list of the stall's dishes, then "sit and eat here" or "wrap it to take away" */
function c11TramOpenShop(kind) {
  const s = C11_TRAM_SHOPS[kind], who = C11.sellers[kind];
  if (who) C11.say = { who, text: s.say[Math.floor(Math.random() * s.say.length)], t: 0 };
  C11.menu = { title: `Quán ${s.name}`, note: 'Ngồi ăn tại quán được nhiều sức hơn mang về', rows: s.dishes.filter(id => C11_ITEMS[id]).map(id => {
    const it = C11_ITEMS[id], e = c11TramEat(id);
    return { name: it.name, sub: `${it.desc} Ngồi ăn: +${e.en} sức, +${e.hp} máu · mang về: +${it.food} sức`, price: it.price, f: () => c11TramChoose(kind, id) };
  }) };
}
function c11TramChoose(kind, id) {
  const it = C11_ITEMS[id], e = c11TramEat(id);
  if (SAVE11.money < it.price) { C11.menu.note = 'Không đủ tiền'; return; }
  C11.menu = { title: it.name, note: 'Ví: ' + c4Money(SAVE11.money), rows: [
    { name: 'Ngồi ăn tại quán', sub: `Ngồi nghỉ chân một lát: +${e.en} sức, +${e.hp} máu`, price: it.price, f: () => c11TramSitDown(kind, id) },
    { name: 'Gói mang về', sub: `Cho vào túi, lúc nào đói thì ăn: +${it.food} sức`, price: it.price, f: () => {
      if (SAVE11.money < it.price) { C11.menu.note = 'Không đủ tiền'; return; }
      if (c11Add(id, 1)) { C11.menu.note = 'Túi đầy rồi, không mang thêm được'; return; }
      SAVE11.money -= it.price; persist11(); c11Sfx.tap(); C11.menu = null; c11Msg(`Đã gói ${it.name.toLowerCase()} cho vào túi`, '#2f6a4c');
    } },
    { name: 'Thôi', sub: 'Xem món khác', tag: ' ', ok: true, f: () => c11TramOpenShop(kind) },
  ] };
}
const c11TramTaken = () => new Set([...(C11.tramGuests || []).map(g => g.seat), ...(C11.eat ? [C11.eat.seat] : [])]);
function c11TramSitDown(kind, id) {
  const it = C11_ITEMS[id];
  if (SAVE11.money < it.price) { C11.menu.note = 'Không đủ tiền'; return; }
  if (SAVE11.stamina >= C11_EN && (SAVE11.hp ?? C11_HP) >= C11_HP) { C11.menu.note = 'Đang no căng rồi, gói mang về thì hơn'; return; }
  const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty))), taken = c11TramTaken();
  let best = null;
  C11_TRAM_SEATS.forEach((s, i) => { if (taken.has(i) || !d[s.y] || d[s.y][s.x] < 0) return; if (!best || d[s.y][s.x] < best.d) best = { i, d: d[s.y][s.x] }; });
  if (!best) { C11.menu.note = 'Hết chỗ ngồi rồi, gói mang về nhé'; return; }
  SAVE11.money -= it.price; persist11(); c11Sfx.tap(); C11.menu = null;
  const s = C11_TRAM_SEATS[best.i];
  C11.tramPend = { seat: best.i, id };
  C11.go = { path: c11Route(d, s.x, s.y), act: null };
  if (C11.sellers[kind]) C11.say = { who: C11.sellers[kind], text: 'Ra bàn ngồi đi, tôi bưng ra ngay!', t: 0 };
}
function c11TramStart() {                         // reached the stool: sit, the bowl comes
  const P = C11.tramPend; C11.tramPend = null; const s = C11_TRAM_SEATS[P.seat];
  C11.go = null; C11.px = s.x + .5; C11.py = s.y + .78; C11.face = s.face; C11.moving = false;
  C11.eat = { t: 0, seat: P.seat, id: P.id };
}
function c11EatUpdate(dt) {                        // called by updateC11 while sitting (nongtrai.js)
  const E = C11.eat, s = C11_TRAM_SEATS[E.seat]; C11.go = null; C11.px = s.x + .5; C11.py = s.y + .78; C11.face = s.face;
  E.t += dt;
  if (E.t >= C11_TRAM_SIT) {
    const e = c11TramEat(E.id);
    SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + e.en); SAVE11.hp = Math.min(C11_HP, (SAVE11.hp ?? C11_HP) + e.hp);
    c11Pop(s.x, s.y - 1, `+${e.en} sức`, '#2f6a4c'); c11Sfx.pluck && c11Sfx.pluck(); persist11();
    c11Msg(`Ăn xong ${C11_ITEMS[E.id].name.toLowerCase()}, no bụng lại có sức đi tiếp`, '#2f6a4c');
    C11.eat = null; C11.py = s.y + .9;
  }
}

/* travellers resting at the other tables: they come and go every little while */
const C11_TRAM_FOOD = ['bun_rieu', 'com', 'chao_hanh', 'che_do_den', 'banh_cuon', 'nuoc_che_xanh'];
function c11TramGuests(dt) {
  if (C11.area !== 'tram') { C11.tramGuests = null; return; }
  const G = C11.tramGuests || (C11.tramGuests = []);
  for (const g of G) g.t -= dt;
  for (let i = G.length - 1; i >= 0; i--) if (G[i].t <= 0) G.splice(i, 1);
  C11.tramNext = (C11.tramNext ?? 1) - dt;
  if (C11.tramNext <= 0) {
    C11.tramNext = 6 + Math.random() * 10;
    const want = c11TramOpen() ? 2 + Math.floor(Math.random() * 3) : 0;
    if (G.length < want) {
      const taken = c11TramTaken(), [ptx, pty] = c11Tile(), free = C11_TRAM_SEATS.map((s, i) => i).filter(i => !taken.has(i) && !(C11_TRAM_SEATS[i].x === ptx && C11_TRAM_SEATS[i].y === pty) && !(C11.tramPend && C11.tramPend.seat === i));
      if (free.length) {
        const i = free[Math.floor(Math.random() * free.length)], pool = C4_ADULT_SORTS2;
        G.push({ seat: i, t: 25 + Math.random() * 40, p: { sort: pool[Math.floor(Math.random() * pool.length)], id: 'khach' + i }, food: C11_TRAM_FOOD[Math.floor(Math.random() * C11_TRAM_FOOD.length)], ph: Math.random() * 6 });
      }
    }
  }
}

/* drawing: a low table with bowls, two stools, the sitters */
function c11TramStool(g, x, y, T) {
  const w = T * .36, h = T * .2, top = y - h;
  g.fillStyle = '#5a3a1c'; for (const dx of [-w * .38, w * .3]) g.fillRect(x + dx, top + T * .04, T * .05, h - T * .04);
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#d0a26a'); gr.addColorStop(1, '#7a5230');
  g.fillStyle = gr; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.roundRect(x - w / 2, top, w, T * .07, T * .025); g.fill(); g.stroke();
}
function c11TramBowl(g, x, y, T, id, t) {
  const r = T * .1;
  g.fillStyle = '#f2ecde'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - r, y - r * .5); g.lineTo(x + r, y - r * .5); g.quadraticCurveTo(x + r * .8, y + r * .5, x, y + r * .5); g.quadraticCurveTo(x - r * .8, y + r * .5, x - r, y - r * .5); g.fill(); g.stroke();
  g.fillStyle = (C11_ITEMS[id] && C11_ITEMS[id].col) || '#c8a040'; g.beginPath(); g.ellipse(x, y - r * .5, r * .82, r * .22, 0, 0, 6.283); g.fill();
  g.strokeStyle = '#3a6ea8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - r * .85, y - r * .2); g.lineTo(x + r * .85, y - r * .2); g.stroke();
  if (t !== undefined) for (let i = 0; i < 2; i++) {                       // steam
    const a = (t * .8 + i * .5) % 1; g.strokeStyle = `rgba(250,246,236,${.7 * (1 - a)})`; g.lineWidth = 2; g.beginPath();
    for (let k = 0; k <= 6; k++) { const yy = y - r - a * T * .35 - k * T * .03, xx = x + (i ? 1 : -1) * r * .3 + Math.sin(t * 3 + k + i * 2) * T * .03; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
}
function c11TramTable(g, x, y, T, bowls) {
  const w = T * .86, top = y - T * .36;
  g.fillStyle = 'rgba(29,25,21,.18)'; g.beginPath(); g.ellipse(x, y, w * .58, T * .1, 0, 0, 6.283); g.fill();
  g.fillStyle = '#5a3a1c'; for (const dx of [-w * .42, w * .36]) g.fillRect(x + dx, top + T * .1, T * .06, y - top - T * .1);
  const gr = g.createLinearGradient(0, top, 0, top + T * .14); gr.addColorStop(0, '#d8ac72'); gr.addColorStop(1, '#8a5c34');
  g.fillStyle = gr; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(x - w / 2, top, w, T * .13, T * .04); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(90,58,28,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w * .44, top + T * .045); g.lineTo(x + w * .44, top + T * .045); g.stroke();
  g.fillStyle = '#3a6ea8'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.roundRect(x - T * .045, top - T * .09, T * .09, T * .1, T * .02); g.fill(); g.stroke();   // a chopstick pot
  g.strokeStyle = '#c8a060'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - T * .02, top - T * .08); g.lineTo(x - T * .03, top - T * .2); g.moveTo(x + T * .02, top - T * .08); g.lineTo(x + T * .035, top - T * .19); g.stroke();
  for (const b of bowls) c11TramBowl(g, x + b.dx * T * .26, top + T * .02, T, b.id, b.t);
}
function c11TramSitter(g, p, X, Y, face, T, eating, t) {           // a mouse sat on the stool, legs folded, the arm going to the mouth now and then
  const s = T / 115 * (p.sc || 1), arm = eating ? (Math.sin(t * 3.2) > .2 ? -.75 : .1) : .15;
  C4_SIT = true; c11Mouse(g, p, X, Y - 8 * s, face, 0, false, s, arm); C4_SIT = false;
}
function c11EatDrawMe(g, sx, sy, T, V) {                            // the player sat at the table (nongtrai.js calls it instead of the usual drawing)
  const s = T / 115, slot = C11.slot; C11.slot = 99;                // no tool in the hand while eating
  C11_ME_SIT = true; c11Player(g, sx(C11.px), sy(C11.py) - 8 * s, s, C11.face, 0, false, Math.sin(C11.eat.t * 3.2) > .2 ? 1 : null); C11_ME_SIT = false;
  C11.slot = slot;
}

/* hooks into nongtrai.js */
const c11TramUpd0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  c11TramSellers(); c11TramGuests(dt);
  if (C11.tramPend) {
    const s = C11_TRAM_SEATS[C11.tramPend.seat];
    if (C11.area !== 'tram') C11.tramPend = null;
    else if (!C11.go) { const [ptx, pty] = c11Tile(); if (ptx === s.x && pty === s.y) c11TramStart(); else { C11.tramPend = null; c11Msg('Bát ăn để trên bàn, ra ngồi đi kẻo nguội', '#b0701a'); } }
  }
  return c11TramUpd0(dt);
};
const c11TramDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {
  c11TramDraw0(E, g, sx, sy, k, T);
  if (C11.area !== 'tram') return;
  const t = C11.t, guests = C11.tramGuests || [];
  C11_TRAM_SEATS.forEach((s, i) => E.push({ y: s.y + .7, d: () => c11TramStool(g, sx(s.x + .5), sy(s.y + .78), T) }));
  C11_TRAM_TABLES.forEach(([x, y]) => {
    const bowls = [];
    for (const gu of guests) { const s = C11_TRAM_SEATS[gu.seat]; if (s.tx === x && s.y === y) bowls.push({ dx: -s.face, id: gu.food, t: t + gu.ph }); }
    if (C11.eat) { const s = C11_TRAM_SEATS[C11.eat.seat]; if (s.tx === x && s.y === y) bowls.push({ dx: -s.face, id: C11.eat.id, t }); }
    E.push({ y: y + .8, d: () => c11TramTable(g, sx(x + .5), sy(y + .8), T, bowls) });
  });
  for (const gu of guests) { const s = C11_TRAM_SEATS[gu.seat]; E.push({ y: s.y + .78, d: () => c11TramSitter(g, gu.p, sx(s.x + .5), sy(s.y + .78), s.face, T, true, t + gu.ph) }); }
};
const c11TramAct0 = c11ActNew, c11TramCan0 = c11CanNew;
c11ActNew = function (tx, ty, tool, k, key) {
  if (C11.eat) return true;
  if (C11.area === 'tram') {
    const sh = c11TramShopAt(tx, ty);
    if (sh) { if (!c11TramOpen()) c11Msg('Quán dọn hàng rồi, sáng mai 6 giờ quay lại nhé', '#5b2f1f'); else c11TramOpenShop(sh[0]); return true; }
    if (k === 'j') { c11Msg('Mua một món ở quán rồi ra đây ngồi ăn', '#5b2f1f'); return true; }
  }
  return c11TramAct0(tx, ty, tool, k, key);
};
c11CanNew = function (tx, ty, tool, k, key) {
  if (C11.area === 'tram' && (c11TramShopAt(tx, ty) || k === 'j')) return true;
  return c11TramCan0(tx, ty, tool, k, key);
};
