/* Chương IV · sang chợ của nhau, part 2: the visitor's side (mode c4visit, chapter '4v'). The visitor walks about in the host's market
   (the lane of the village, or the street of the town, drawn with the visitor's own art and the host's stalls from the snapshot),
   sees the host's price and stock, buys, chats and drops emoji. sangcho.js has the net, the host's side and the lists. */

const cnvHud = (() => { const d = document.createElement('div'); d.id = 'cnvHud'; d.hidden = true;
  d.innerHTML = '<div class="cnvTop"><button class="tag" id="cnvChap">← Chọn chương</button><button class="tag" id="cnvBack">Về chợ mình</button><div class="tag" id="cnvMoney"></div></div><div class="cnvSub tag" id="cnvTitle"></div>';
  document.body.appendChild(d); $('#cnvBack').addEventListener('click', () => { AU.tap(); cnvLeave(''); }); $('#cnvChap').addEventListener('click', () => { AU.tap(); cnvLeave('', true); }); return d; })();
const cnvW = () => (CN.visit && CN.visit.place === 'pho' ? P4_W : C4_W);
const cnvView = () => (CN.visit.place === 'pho' ? p4View() : c4View());
function cnvEnter(m) {
  CN.visitWait = false; cnHide(cnList); cnHide(cnWho);
  const prev = S.mode; CN.from = prev === 'c4bplay' ? 'pho' : 'lang';
  if (prev === 'c4play') c4Hide(); else if (prev === 'c4bplay') p4Hide();
  hideChapterHuds(); CN.guests.clear(); CN.hosting = null;
  const place = m.place, x0 = place === 'lang' ? C4_GATE + 80 : P4_GATE + 80;
  CN.visit = { host: m.host, hostName: m.hostName || 'Chủ chợ', place, snap: m.snap || {}, from: CN.from, peers: new Map(), camX: 0, sent: 0, hostSay: null, hostEmo: null,
    me: { id: cnId(), name: hsName(hsMine()), prof: cnProf(hsMine()), x: x0, z: .72, tx: x0, tz: .72, face: 1, mv: 0, ph: 0, say: null, emo: null, moving: false } };
  for (const q of m.peers || []) cnGuestIn(q);
  S.chapter = 4; S.mode = 'c4visit'; document.body.classList.add('c4');
  const key = place === 'lang' ? 'yellow' : P4_PAPER; PAPER = getPaper(key); document.documentElement.style.setProperty('--paper', PAPERS[key].css);
  for (const id of ['#album', '#end', '#chapters', '#hud', '#abil', '#pad']) { const el = $(id); if (el) el.hidden = true; }
  if (place === 'pho' && !P4.scene) P4.scene = p4TownScene(mulberry(7));
  AU.init(); AU.setSong(place === 'lang' ? 6 : 12); AU.setQuiet(false);
  cnvHud.hidden = false; $('#cnvTitle').textContent = `Chợ ${place === 'lang' ? 'làng' : 'phố huyện'} của ${CN.visit.hostName}`; cnvMoneyShow(); cv.focus();
  if (typeof trackEnter === 'function') trackEnter('chuong-4/sang-cho');
}
const cnvMoneyShow = () => { const e = $('#cnMoneyV') || $('#cnvMoney'); if (e) e.innerHTML = c4Money(Math.round(SAVE4.money)); };
function cnvLeave(msg, toChapters) {
  const v = CN.visit; if (!v) return; v.closing = true; cnSend({ t: 'leave' }); CN.visit = null; CN.pend = {};
  cnvHud.hidden = true; cnHide(cnBuySh); hlChatClose(); const tt = $('#cnTray'); if (tt) tt.hidden = true;
  if (msg) toast(msg, 3);
  if (toChapters) { showChapters(); return; }
  (v.from === 'pho' ? startP4 : startC4)();
}
function cnvHide() { cnvHud.hidden = true; hlChatClose(); if (CN.visit && S.mode !== 'c4visit') { cnSend({ t: 'leave' }); CN.visit = null; } }

/* ---------- walking ---------- */
function cnvUpdate(dt) {
  const v = CN.visit; if (!v) return; const me = v.me, W = cnvW(), spd = 190;
  const dx = me.tx - me.x, dz = (me.tz - me.z) * 300, d = Math.hypot(dx, dz);
  me.moving = d > 4;
  if (me.moving) { const st = Math.min(d, spd * dt); me.x += dx / d * st; me.z += dz / d * st / 300; if (Math.abs(dx) > 2) me.face = dx > 0 ? 1 : -1; me.ph += dt * 9; }
  me.x = Math.max(120, Math.min(W - 120, me.x)); me.z = Math.max(.3, Math.min(1.02, me.z));
  if (me.say && (me.say.t += dt) > me.say.life) me.say = null; if (me.emo && (me.emo.t += dt) > 2.8) me.emo = null;
  if (v.hostSay && (v.hostSay.t += dt) > v.hostSay.life) v.hostSay = null; if (v.hostEmo && (v.hostEmo.t += dt) > 2.8) v.hostEmo = null;
  v.sent += dt; if (v.sent > .12 && (me.moving || v.wasMoving)) { v.sent = 0; cnSend({ t: 'move', x: Math.round(me.x), z: +me.z.toFixed(2), face: me.face, mv: me.moving ? 1 : 0 }); }
  v.wasMoving = me.moving;
  const V = cnvView(); v.camX += (Math.max(-100, Math.min(W - V.vw + 100, me.x - V.vw / 2)) - v.camX) * Math.min(1, dt * 5);
  if (!(v.mt = (v.mt || 0) + dt) || v.mt > 1) { v.mt = 0; cnvMoneyShow(); }
}
function cnvKey(e) {
  const v = CN.visit; if (!v) return; const me = v.me;
  if (e.code === 'Escape') { cnvLeave(''); return; }
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') me.tx = me.x - 160; if (e.code === 'ArrowRight' || e.code === 'KeyD') me.tx = me.x + 160;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') me.tz = Math.max(.3, me.z - .2); if (e.code === 'ArrowDown' || e.code === 'KeyS') me.tz = Math.min(1, me.z + .2);
}
function cnvWorld(e) { const r = cv.getBoundingClientRect(), V = cnvView(); return [(e.clientX - r.left) / V.s + CN.visit.camX, (e.clientY - r.top) / V.s - V.oy]; }
let cnvDrag = null;
function cnvDown(e) { cnvDrag = { x: e.clientX, y: e.clientY }; capturePointer(e); }
function cnvMove() {}
function cnvUp(e) {
  const v = CN.visit, d = cnvDrag; cnvDrag = null; if (!v || !d || !cnBuySh.hidden) return;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;
  const [x, y] = cnvWorld(e), g = cnStallAt(x, y);
  if (g) { AU.tap(); v.me.tx = Math.max(120, x - 40); v.me.tz = .62; cnBuyOpen(g); return; }
  v.me.tx = x; v.me.tz = v.place === 'lang' ? (y - C4_Y0) / C4_D : (y - P4_Y0) / P4_D;
}
// which of the host's stalls is under the tap
function cnStallAt(x, y) {
  const v = CN.visit, sn = v.snap || {};
  if (v.place === 'lang') {
    const sy = c4Y(C4_STALL_Z), s = c4S(C4_STALL_Z);
    for (const st of sn.stalls || []) { const sx = st.g === 'trau' ? C4_STALL + (st.lv ? 10 : 30) : C4_GOODS[st.g].x + 20; if (c4SignHit(x, y, sx, sy, s) || (Math.abs(x - sx) < 70 * s && y > sy - 110 * s && y < sy + 30 * s)) return st.g; }
    return null;
  }
  for (const n of P4.scene.near) {
    if (n[1] !== 'shop') continue; const s = n[2], w = P4_TOWN_V[((n[3] | 0) % P4_TOWN_V.length + P4_TOWN_V.length) % P4_TOWN_V.length].w * s;
    if (Math.abs(x - n[0]) > w + 6 || y < P4_Y0 - 200 * s || y > p4Y(.22)) continue;
    if (n[4] === 'home') return sn.house ? 'trau' : null;
    const k = p4ShopKey(n[0]); return (sn.shops || []).some(q => q.key === k) ? k : null;
  }
  return null;
}

/* ---------- buying ---------- */
const cnBuySh = cnSheet('cnBuy', '<h3 id="cnBuyT"></h3><div id="cnBuyB"></div><div class="row"><button class="btn" id="cnBuyGo">Mua</button><button class="btn alt" id="cnBuyX">Thôi</button></div>');
function cnStallInfo(g) {
  const v = CN.visit, sn = v.snap || {};
  if (v.place === 'lang') { const s = (sn.stalls || []).find(q => q.g === g); return s && { nm: s.nm, price: s.price, avail: s.stock, open: s.open, unit: g === 'trau' ? 'miếng' : C4_GOODS[g].unit }; }
  if (g === 'trau') return sn.house && { nm: 'Hiệu trầu ' + sn.house.name, price: sn.house.price, avail: sn.house.stock, open: sn.house.open, unit: 'miếng' };
  const s = (sn.shops || []).find(q => q.key === g); return s && { nm: s.nm, price: s.price, avail: s.left, open: s.open, unit: 'suất' };
}
const cnCanSell = g => (CN.visit.place === 'lang' ? c4Own(g) && !C4_BUYS.includes(g) : g === 'trau' ? !!SAVE4B.house : !!p4Shops()[g]);
function cnBuyOpen(g) { CN.buy = { g, n: 1 }; cnBuyRefresh(true); cnBuySh.hidden = false; }
function cnBuyRefresh(open) {
  const b = CN.buy; if (!b || cnBuySh.hidden && !open || !CN.visit) return;
  const info = cnStallInfo(b.g); if (!info) { cnBuySh.hidden = true; return; }
  const can = cnCanSell(b.g), max = Math.max(0, Math.min(info.avail, 40, Math.floor(SAVE4.money / Math.max(1, info.price))));
  b.n = Math.max(max ? 1 : 0, Math.min(b.n, max));
  $('#cnBuyT').textContent = info.nm;
  if (!$('#cnN')) $('#cnBuyB').innerHTML = '<div id="cnBI"></div><div class="row cnStep"><button class="btn alt" data-d="-1">−</button><b id="cnN"></b><button class="btn alt" data-d="1">+</button></div><div id="cnBT"></div>';   // the stepper stays put so a held press keeps going
  $('#cnBI').innerHTML = `<p>Giá <b>${c4Money(info.price)}</b> một ${info.unit} · còn <b>${info.avail}</b></p>`
    + (can ? '' : '<p class="bad">Nhà bạn chưa có quầy bán món này, mua về cũng không bán được.</p>')
    + (!info.open ? '<p class="bad">Quầy đang đóng cửa.</p>' : '');
  $('#cnN').textContent = b.n;
  $('#cnBT').innerHTML = `<p>Tiền: <b>${c4Money(b.n * info.price)}</b> · trong túi ${c4Money(Math.round(SAVE4.money))}</p><p class="sm" id="cnBuyMsg">${b.msg || 'Hàng mang về để được hôm nay và cả ngày mai.'}</p>`;
  $('#cnBuyGo').disabled = !can || !info.open || b.n < 1 || !!b.wait;
}
// ± 1 a press; held down it repeats, faster and faster (owner 2026-10-28)
{ let timer = 0; const stop = () => { clearTimeout(timer); timer = 0; };
  $('#cnBuyB').addEventListener('pointerdown', e => {
    const x = e.target.closest('[data-d]'); if (!x || !CN.buy) return; e.preventDefault(); stop(); AU.tap();
    const d = +x.dataset.d; let wait = 380, k = 0;
    const step = () => { const b = CN.buy; if (!b) return stop(); b.n += d * (k > 14 ? 3 : k > 7 ? 2 : 1); b.msg = ''; k++; cnBuyRefresh(); wait = Math.max(35, wait * .86); timer = setTimeout(step, wait); };
    b0step(); function b0step() { const b = CN.buy; b.n += d; b.msg = ''; cnBuyRefresh(); timer = setTimeout(step, wait); }
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) $('#cnBuyB').addEventListener(ev, stop);
  window.addEventListener('pointerup', stop); }
$('#cnBuyX').addEventListener('click', () => { AU.tap(); cnBuySh.hidden = true; CN.buy = null; });
$('#cnBuyGo').addEventListener('click', () => {
  const b = CN.buy; if (!b || b.wait || b.n < 1) return; b.wait = true; b.msg = 'Đang hỏi chủ chợ…'; cnBuyRefresh();
  cnBuyAsk(b.g, b.n, (ok, why, r) => {
    b.wait = false; if (!CN.buy) return;
    if (!ok) { b.msg = why; cnBuyRefresh(); return; }
    const info = cnStallInfo(b.g); if (info) info.avail = Math.max(0, info.avail - r.n);
    toast(`Mua ${r.n} ${info ? info.unit : ''} ${cnWareName(b.g, CN.visit.place)}: ${c4Money(r.total)}`, 2.6); AU.pluck(84); b.msg = `Đã mua ${r.n}. Còn ${c4Money(Math.round(SAVE4.money))} trong túi.`; b.n = 1; cnvMoneyShow(); cnBuyRefresh();
  });
});

/* ---------- drawing ---------- */
function cnvTag(g, x, y, s, l1, l2) {
  g.save(); g.translate(x, y); g.scale(s, s); g.font = '800 13px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.max(g.measureText(l1).width, l2 ? g.measureText(l2).width : 0) + 18, h = l2 ? 38 : 24;
  g.fillStyle = '#fbf4dc'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(-w / 2, 0, w, h, 5); g.fill(); g.stroke();
  g.fillStyle = INK; g.fillText(l1, 0, l2 ? 12 : 12); if (l2) { g.fillStyle = l2.startsWith('Hết') ? '#a3332a' : '#5b2f1f'; g.fillText(l2, 0, 28); } g.restore();
}
function cnvRender() {
  const v = CN.visit; if (!v) return; const town = v.place === 'pho', V = cnvView(), A = town ? null : c4Art(), Sc = V.s * DPR, vw = V.vw, cx = v.camX, oy = V.oy, g = ctx, sn = v.snap || {};
  const vis = (x, w) => x + w > cx - 40 && x - w < cx + vw + 40, Y = town ? p4Y : c4Y, SS = town ? p4S : c4S, crowd = town ? P4_CROWD : C4_CROWD;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS[town ? P4_PAPER : 'yellow'].base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(Sc, 0, 0, Sc, -cx * Sc, oy * Sc);
  const PP = town ? (P4.paper || (P4.paper = getPaper(P4_PAPER))) : PAPER, pw = PP.width; for (let px = Math.floor(cx / pw) * pw; px < cx + vw; px += pw) g.drawImage(PP, px, -oy - 20, pw, Math.max(V.vh + 40, PP.height));
  const items = [], now = performance.now() / 1000;
  if (!town) {
    g.save(); g.translate(cx * .85, 0); g.fillStyle = '#a3332a'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(120, -oy + 90, 32, 0, 6.283); g.fill(); g.stroke(); g.restore();
    c4Sky(g, V, cx, 'dep'); c4River(g, cx, vw);
    g.save(); g.translate(cx * .55, 0); g.globalAlpha = .5;
    for (const [x, k, sc, hv] of (C4.scene ? C4.scene.far : [[-80, 'house', .45, 0], [260, 'bamboo', .5], [520, 'house', .42, 2], [880, 'tree', .45], [1180, 'house', .45, 4], [1500, 'bamboo', .45], [1720, 'house', .42, 1]])) if (x + 150 > cx * .45 - 40 && x - 150 < cx * .45 + vw + 40) dp(g, k === 'house' ? c4HouseArt(hv) : k === 'tree' ? WP.bigTree : PROPS.bamboo, x, C4_Y0 - 70, 0, sc, sc);
    g.globalAlpha = 1; g.restore();
    g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, C4_Y0 - 4, vw + 100, C4_D + 10); g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, C4_Y0 + C4_D + 6, vw + 100, V.vh);
    g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, C4_Y0 - 4); g.lineTo(cx + vw + 50, C4_Y0 - 4); g.stroke();
    for (const [x, k, s, hv] of (C4.scene ? C4.scene.near : [[960, 'tree', .9], [1360, 'house', .72, 1], [1760, 'house', .7, 3], [2050, 'bamboo', .8], [2260, 'bamboo', .85], [600, 'house', .62, 5], [210, 'bamboo', .7]])) if (vis(x, 260)) dp(g, k === 'tree' ? WP.bigTree : k === 'house' ? c4HouseArt(hv) : k === 'bamboo' ? PROPS.bamboo : PROPS.hay, x, C4_Y0, 0, s, s);
    if (vis(C4_GATE, 140)) dp(g, A.gate, C4_GATE, C4_Y0 + 6, 0, .88, .88);
    const sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z);
    for (const st of sn.stalls || []) {
      const sx = st.g === 'trau' ? C4_STALL + (st.lv ? 10 : 30) : C4_GOODS[st.g].x + 20; if (!vis(sx, 200)) continue;
      items.push({ z: C4_STALL_Z, f: () => {
        g.globalAlpha = st.open ? 1 : .45;
        if (st.g === 'trau') { if (st.lv >= 3) c4DrawShopLv(g, sx, sy, ss, st.lv, 'trau'); dp(g, c4StallArt(Math.min(2, st.lv)), sx, sy, 0, ss, ss); if (st.lv < 2) c4SignDraw(g, sx, sy, ss, 'TRẦU CAU'); }
        else { c4DrawShopLv(g, sx, sy, ss, st.lv, st.g); dp(g, A[C4_GOODS[st.g].art], sx, sy, 0, ss, ss); c4SignDraw(g, sx, sy, ss, st.nm); }
        g.globalAlpha = 1; cnvTag(g, sx, sy + 8 * ss, ss, c4Money(st.price), st.stock > 0 ? `còn ${st.stock}` : 'Hết hàng'); } });
    }
    items.push({ z: C4_WIFE_Z, f: () => c4Mouse(g, MICE.wife, C4_STALL - 40, 1, now * 2, false, -.2, null, c4S(C4_WIFE_Z), c4Y(C4_WIFE_Z), 2.1) });
  } else {
    g.save(); g.translate(cx * .3, 0); g.globalAlpha = .5; for (const [x, k, sc] of P4.scene.far) if (x + 150 > cx * .7 - 40 && x - 150 < cx * .7 + vw + 40) dp(g, p4TownPart(k), x, P4_Y0 - 70, 0, sc, sc); g.globalAlpha = 1; g.restore();
    g.fillStyle = 'rgba(91,47,31,.2)'; g.fillRect(cx - 50, P4_Y0 - 4, vw + 100, P4_D + 10); g.fillStyle = 'rgba(91,47,31,.09)'; g.fillRect(cx - 50, P4_Y0 + P4_D + 6, vw + 100, V.vh);
    g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 50, P4_Y0 - 4); g.lineTo(cx + vw + 50, P4_Y0 - 4); g.stroke();
    p4TownPaving(g, cx, vw); p4TownCreek(g, cx, vw); p4TownRiver(g, cx, vw, V);
    for (const [x, k, s, hv, lab] of P4.scene.near) if (vis(x, 260)) { dp(g, k === 'shop' ? p4TownArt(hv) : p4TownNear(k), x, P4_Y0, 0, s, s); if (k === 'shop') p4TownFront(g, x, P4_Y0, s, hv, lab); }
    if (vis(P4_GATE + 60, 160)) dp(g, p4TownGate(), P4_GATE + 60, P4_Y0 + 6, 0, .88, .88);
    if (sn.house && vis(P4_HOME, 160)) items.push({ z: .09, f: () => { p4TownCounter(g, P4_HOME + 10, 'trau'); cnvTag(g, P4_HOME + 10, p4Y(.1) + 4, p4S(.1), c4Money(sn.house.price), sn.house.stock > 0 ? `còn ${sn.house.stock}` : 'Hết hàng'); } });
    for (const sh of sn.shops || []) { const x = +sh.key; if (!vis(x, 200)) continue; items.push({ z: .1, f: () => cnvTag(g, x, p4Y(.1) + 4, p4S(.1), c4Money(sh.price), sh.left > 0 ? `${sh.left} suất` : 'Hết suất') }); }
  }
  // the host's own words and emoji, over his stall; the people (me, the other visitors)
  const hx = town ? P4_HOME : C4_STALL, hy = Y(town ? .1 : C4_WIFE_Z) - (town ? 150 : 150) * SS(town ? .1 : C4_WIFE_Z);
  items.push({ z: 1.7, f: () => cnBubbles(g, { say: v.hostSay, emo: v.hostEmo }, hx, hy, SS(.1)) });
  const people = [v.me, ...v.peers.values()];
  for (const p of people) if (p !== v.me) { /* their steps */ }
  cnDrawPeople(items, g, vis, people.filter(p => p !== v.me), Y, SS, town ? p4TownLift : () => 0, crowd, (town ? P4_TALL : C4_TALL.mouse) * crowd * .92);
  { const me = v.me; me.say = me.say; const w = cnWalker(me); Object.assign(w, { face: me.face, ph: me.ph, st: me.moving ? 'walk' : 'idle' }); const s = SS(me.z) * crowd, tall = (town ? P4_TALL : C4_TALL.mouse) * crowd * .92;
    items.push({ z: me.z, f: () => { const y = Y(me.z) - (town ? p4TownLift(me.x) : 0); c4NoWx(() => c4Critter(g, w, me.x, y, s)); g.save(); g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#f2ecde'; g.fillStyle = '#a3332a'; g.strokeText('Bạn', me.x, y - tall * s - 6); g.fillText('Bạn', me.x, y - tall * s - 6); g.restore(); } });
    items.push({ z: 1.6, f: () => cnBubbles(g, me, me.x, Y(me.z) - (town ? p4TownLift(me.x) : 0) - tall * s - 22, SS(me.z)) }); }
  items.sort((a, b) => a.z - b.z); for (const it of items) it.f();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
registerChapter({
  id: '4v', modes: ['c4visit'], hidden: () => true,
  card: { num: '', han: '', name: 'Sang chợ bạn', desc: '', bg: '#efcfb8' }, progress: () => '', hasProgress: () => false,
  hide: cnvHide, update: cnvUpdate, render: cnvRender, key: cnvKey,
  pointer: { down: cnvDown, move: cnvMove, up: cnvUp },
  next() { cnvLeave(''); }, retry() { cnvLeave(''); },
});
