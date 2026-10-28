/* Chương IV · sang chợ của nhau (owner 2026-10-28). Two players who are both online can visit each other's market and buy there.
   - Online (worker-cho/, Cloudflare Worker "dcc-cho"; this file talks to it over a WebSocket, only while chương IV is open): a player who is in
     the village (mode c4play) or the town (c4bplay) has his market OPEN to visitors: he sends a snapshot of his stalls (price, stock,
     level) and the server relays. The server only relays and trusts the client (the owner's choice, as in chương IX).
   - A visitor (mode c4visit, chapter '4v') walks about in the host's market (the host sees him, his name and chat bubbles and emoji),
     taps a stall and buys; the host's client sells (stock out, money in, today's takings) and answers. What is bought goes onto the
     visitor's own stall of that ware (he must have it) and does not spoil today or tomorrow (SAVE4.keep[g]: c4EndDay wilts only the rest).
   - Every player has ONE ware of the village and one of the town whose goods he gets at HALF the cost (SAVE4.spec, from his id), but only
     once he has opened every plot (all of C4_SHOPS in the village, every eating house in the town). NOTHING says so anywhere: the point
     is that the others come and buy it from him to sell at home.
   - SAVE4.txn lists the last 80 sales and purchases (the notebook's Giao dịch tab, and a block on each stall's sheet); a line opens the other
     player: his house (from what he last sent) and, if he is online and open, a way into his market. */

const CN_URL = (() => { const q = new URLSearchParams(location.search).get('cnws') || ''; return /^ws:\/\/localhost:\d+\/ws$/.test(q) ? q : 'wss://dcc-cho.dcc-phong-choi.workers.dev/ws'; })();
const CN = { ws: null, up: false, want: false, hosting: null, lastSnap: '', lastSend: 0, retry: 0, guests: new Map(), visit: null, pend: {}, hosts: [], count: 0, ison: {}, t0: performance.now(), walkers: new Map(), listCb: null };
const cnOn = () => !SAVE4.cnOff;
const cnEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function cnId() {
  if (!SAVE4.oid || !/^[A-Za-z0-9]{8,24}$/.test(SAVE4.oid)) { SAVE4.oid = Array.from({ length: 12 }, () => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Math.random() * 56) | 0]).join(''); persist4(); }
  return SAVE4.oid;
}
const cnHash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const cnHome = () => (SAVE4.home && SAVE4.home.items) || [];
const cnProf = d => ({ ...d, home: cnHome() });
function cnSend(m) { try { if (CN.ws && CN.ws.readyState === 1) CN.ws.send(JSON.stringify(m)); } catch (e) {} }

/* ---------- the connection ---------- */
function cnConnect() {
  if (CN.ws && (CN.ws.readyState === 0 || CN.ws.readyState === 1)) return;
  let ws; try { ws = new WebSocket(CN_URL); } catch (e) { return; }
  CN.ws = ws;
  ws.onopen = () => { CN.up = true; CN.retry = 0; const d = hsMine(); cnSend({ t: 'hello', id: cnId(), name: hsName(d), sort: 0, prof: cnProf(d) }); CN.hosting = null; CN.lastSnap = ''; };
  ws.onmessage = e => { try { cnMsg(JSON.parse(e.data)); } catch (err) { console.warn('cn', err); } };
  ws.onclose = () => { CN.up = false; CN.hosting = null; if (CN.visit && !CN.visit.closing) cnvLeave('Mất kết nối, về chợ mình'); if (CN.want) setTimeout(cnConnect, Math.min(20000, 1500 * (++CN.retry))); };
  ws.onerror = () => {};
}
function cnMsg(m) {
  switch (m.t) {
    case 'welcome': CN.count = m.count || 0; break;
    case 'hosting': if (m.t && m.place) for (const q of m.peers || []) cnGuestIn(q); break;
    case 'came': cnGuestIn(m.p, true); break;
    case 'gone': CN.guests.delete(m.id); if (CN.visit) CN.visit.peers.delete(m.id); break;
    case 'move': { const p = CN.guests.get(m.id) || (CN.visit && CN.visit.peers.get(m.id)); if (p) { p.tx = m.x; p.tz = m.z; p.face = m.face; p.mv = m.mv; } break; }
    case 'chat': { if (typeof HL !== 'undefined' && HL.chatOff) break; const p = cnPlayerObj(m.id); if (!p && m.id === cnId() && !CN.visit) CN.mySay = { text: m.text, t: 0, life: 2.6 + m.text.length * .05 }; else if (p) p.say = { text: m.text, t: 0, life: 2.6 + m.text.length * .05 }; else if (CN.visit && m.id === CN.visit.host) CN.visit.hostSay = { text: m.text, t: 0, life: 2.6 + m.text.length * .05 }; break; }
    case 'emo': { const p = cnPlayerObj(m.id); if (!p && m.id === cnId() && !CN.visit) CN.myEmo = { e: m.e, t: 0 }; else if (p) p.emo = { e: m.e, t: 0 }; else if (CN.visit && m.id === CN.visit.host) CN.visit.hostEmo = { e: m.e, t: 0 }; break; }
    case 'buy': cnHandleBuy(m); break;
    case 'sold': cnSold(m); break;
    case 'room': cnvEnter(m); break;
    case 'snap': if (CN.visit && m.host === CN.visit.host) { CN.visit.snap = m.snap; cnBuyRefresh(); } break;
    case 'closed': if (CN.visit) cnvLeave(`${m.name || 'Chủ chợ'} đã đóng chợ`); break;
    case 'nobody': CN.visitWait = false; toast('Chợ ấy vừa đóng cửa hoặc chủ chợ đã rời đi.', 3); cnListRefresh(); break;
    case 'crowd': CN.visitWait = false; toast('Chợ ấy đông quá, chờ chút nhé.', 3); break;
    case 'hosts': CN.hosts = m.list || []; CN.count = m.count || CN.count; cnListRefresh(); if (CN.hostsCb) CN.hostsCb(); break;
    case 'ison': CN.ison[m.id] = { on: m.on, place: m.place, t: Date.now() }; if (CN.whoId === m.id) cnWhoRefresh(); break;
    case 'bye': CN.want = false; toast(m.why || 'Bạn đã vào từ chỗ khác', 3); try { CN.ws.close(); } catch (e) {} break;
  }
}
const cnPlayerObj = id => CN.guests.get(id) || (CN.visit && CN.visit.peers.get(id)) || (CN.visit && CN.visit.me && CN.visit.me.id === id ? CN.visit.me : null);
function cnGuestIn(q, announce) {
  const o = { id: q.id, name: q.name, prof: q.prof, x: q.x, z: q.z, tx: q.x, tz: q.z, face: q.face || 1, mv: 0, ph: 0, say: null, emo: null, born: performance.now() };
  if (CN.visit) CN.visit.peers.set(q.id, o); else CN.guests.set(q.id, o);
  if (announce && !CN.visit) toast(`${q.name} ghé chợ nhà mình!`, 2.4);
}

/* ---------- hosting: the market is open to visitors while chương IV is open ---------- */
const cnPlace = () => (S.mode === 'c4play' ? 'lang' : S.mode === 'c4bplay' ? 'pho' : null);
function cnSnapLang() {
  const stalls = [];
  for (const g of c4Owned()) { if (C4_BUYS.includes(g)) continue;
    stalls.push({ g, nm: g === 'trau' ? 'TRẦU CAU' : C4_GOODS[g].name.toUpperCase(), price: c4Price(g), stock: c4Stock(g), lv: g === 'trau' ? (SAVE4.lv || 0) : c4SLvI(g), open: !c4Shut(g) }); }
  return { v: 1, day: SAVE4.day, name: hsName(hsMine()), home: cnHome(), stalls };
}
const cnPortionCap = 20;
const cnPortionsLeft = R0 => cnPortionCap - (R0.cnDay === SAVE4.day ? (R0.cnN || 0) : 0);
function cnSnapPho() {
  const house = SAVE4B.house ? { price: SAVE4B.price, stock: SAVE4B.stock, open: !SAVE4B.shut, name: SAVE4B.name || 'TRẦU CAU' } : null;
  const shops = Object.entries(p4Shops()).map(([key, R0]) => ({ key, nm: R0.name, food: R0.food, price: p4FoodPrice(R0), left: cnPortionsLeft(R0), open: !R0.shut }));
  return { v: 1, day: SAVE4.day, name: hsName(hsMine()), home: cnHome(), house, shops };
}
function cnHostTick() {
  const place = cnPlace();
  if (place && SAVE4.intro && cnOn()) {
    CN.want = true; cnConnect(); if (!CN.up || CN.visit) return;
    const snap = JSON.stringify(place === 'lang' ? cnSnapLang() : cnSnapPho()), now = Date.now();
    if (CN.hosting !== place || snap !== CN.lastSnap || now - CN.lastSend > 20000) { if (CN.hosting && CN.hosting !== place) CN.guests.clear(); cnSend({ t: 'host', place, snap: JSON.parse(snap) }); CN.hosting = place; CN.lastSnap = snap; CN.lastSend = now; }
    if (now - (CN.hostsAt || 0) > 15000 && CN.listOpen) { CN.hostsAt = now; cnSend({ t: 'hosts' }); }
  } else if (S.mode !== 'c4visit') {
    if (CN.hosting) { cnSend({ t: 'host', place: null }); CN.hosting = null; CN.guests.clear(); }
    if (CN.up && !CN.idleAt) CN.idleAt = Date.now(); if (CN.idleAt && Date.now() - CN.idleAt > 45000) { CN.want = false; try { CN.ws.close(); } catch (e) {} CN.idleAt = 0; }
  }
  if (place) CN.idleAt = 0;
}
setInterval(cnHostTick, 1000);
// someone asks to buy from my market (a visitor in the room): sell it, or say why not
function cnHandleBuy(m) {
  const reply = (ok, why, extra) => cnSend({ t: 'sold', to: m.from, id: m.id, g: m.g, n: (extra && extra.n) || 0, ok, why, price: (extra && extra.price) || 0 });
  if (!cnOn() || !CN.hosting) return reply(false, 'Chợ đã đóng');
  const g = m.g, want = Math.max(1, Math.min(40, m.n | 0));
  if (CN.hosting === 'lang') {
    if (!c4Own(g) || C4_BUYS.includes(g)) return reply(false, 'Chợ này không bán món ấy');
    if (c4Shut(g)) return reply(false, 'Quầy đang đóng cửa');
    const st = c4Stock(g); if (st < 1) return reply(false, 'Quầy hết hàng');
    const k = Math.min(want, st), price = c4Price(g), pay = price * k;
    c4SetStock(g, st - k); SAVE4.money += pay; SAVE4.sold = (SAVE4.sold || 0) + k;
    if (C4.today) { const d = C4.today; d.sold += k; d.take += pay; d.cogs += k * c4Unit(g); const B = (d.by = d.by || {}), b = B[g] || (B[g] = { take: 0, cogs: 0, n: 0 }); b.take += pay; b.cogs += k * c4Unit(g); b.n += k; }
    cnTxn({ dir: 'sold', id: m.from, name: m.name, g, n: k, p: price, pl: 'lang' }); persist4(); try { c4Hud(); } catch (e) {} reply(true, '', { n: k, price });
  } else {
    if (m.g === 'trau') {
      if (!SAVE4B.house || SAVE4B.shut) return reply(false, 'Hiệu trầu đang đóng');
      const st = SAVE4B.stock; if (st < 1) return reply(false, 'Hết trầu'); const k = Math.min(want, st), price = SAVE4B.price, pay = price * k;
      SAVE4B.stock -= k; SAVE4B.sold = (SAVE4B.sold || 0) + k; p4Earn(pay); P4.today.sold += k; p4Persist();
      cnTxn({ dir: 'sold', id: m.from, name: m.name, g: 'trau', n: k, p: price, pl: 'pho' }); reply(true, '', { n: k, price });
    } else {
      const R0 = p4Shops()[m.g]; if (!R0) return reply(false, 'Quán không bán món ấy'); if (R0.shut) return reply(false, 'Quán đang đóng cửa');
      const left = cnPortionsLeft(R0); if (left < 1) return reply(false, 'Hôm nay hết suất'); const k = Math.min(want, left), price = p4FoodPrice(R0), cost = k * p4FoodCost(m.g), pay = price * k;
      if (SAVE4.money < cost) return reply(false, 'Quán chưa đủ nguyên liệu');
      R0.cnDay = SAVE4.day; R0.cnN = (R0.cnDay === SAVE4.day ? (R0.cnN || 0) : 0) + k; SAVE4.money += pay - cost; P4.today.take += pay; P4.today.spent += cost; persist4(); p4Persist();
      cnTxn({ dir: 'sold', id: m.from, name: m.name, g: m.g, n: k, p: price, pl: 'pho' }); reply(true, '', { n: k, price });
    }
  }
}

/* ---------- my buying in someone's market ---------- */
function cnBuyAsk(g, n, cb) {
  const id = Math.random().toString(36).slice(2, 10), v = CN.visit; if (!v) return cb(false, 'Chưa ở trong chợ nào');
  CN.pend[id] = { cb, g, n, t: Date.now() }; cnSend({ t: 'buy', to: v.host, id, g, n });
  setTimeout(() => { const p = CN.pend[id]; if (p) { delete CN.pend[id]; p.cb(false, 'Chủ chợ không trả lời'); } }, 7000);
}
function cnSold(m) {
  const p = CN.pend[m.id]; if (!p) return; delete CN.pend[m.id];
  if (!m.ok) return p.cb(false, m.why || 'Không mua được');
  const v = CN.visit, k = m.n, total = m.price * k, g = m.g, place = v ? v.place : 'lang';
  SAVE4.money -= total;
  if (place === 'lang') { c4SetStock(g, c4Stock(g) + k); cnKeepAdd(SAVE4, g, k); }
  else if (g === 'trau') { SAVE4B.stock += k; cnKeepAdd(SAVE4B, 'trau', k); p4Persist(); }
  else { const R0 = p4Shops()[g]; if (R0) { R0.pre = (cnPreLive(R0) ? R0.pre : 0) + k; R0.preUntil = SAVE4.day + 1; } p4Persist(); }
  cnTxn({ dir: 'bought', id: v ? v.host : '', name: v ? v.hostName : '', g, n: k, p: m.price, pl: place, home: v && v.snap ? v.snap.home : null });
  persist4(); p.cb(true, '', { n: k, price: m.price, total });
}
// goods carried home keep today and tomorrow
function cnKeepAdd(S0, g, k) { const K = S0.keep || (S0.keep = {}), e = K[g]; K[g] = { n: (e && e.until >= SAVE4.day ? e.n : 0) + k, until: SAVE4.day + 1 }; }
const cnKeepN = g => { const e = SAVE4.keep && SAVE4.keep[g]; return e && SAVE4.day < e.until ? e.n : 0; };           // protected at the closing of the day they were bought (the next day they are sold, and then they go)
const cnKeepNPho = g => { const e = SAVE4B.keep && SAVE4B.keep[g]; return e && SAVE4.day < e.until ? e.n : 0; };
const cnPreLive = R0 => !!(R0 && R0.pre > 0 && SAVE4.day <= (R0.preUntil || 0));

/* ---------- the specialty ware (half cost once every plot is open); never named ---------- */
function cnTownKeys() {
  if (!P4.scene) { try { P4.scene = p4TownScene(mulberry(7)); } catch (e) { return []; } }
  return P4.scene.near.filter(n => n[1] === 'shop' && n[4] !== 'home' && p4IsFood(n[4])).map(n => p4ShopKey(n[0]));
}
const cnVillageUnlocked = () => C4_SHOPS.every(c4Own);
const cnTownUnlocked = () => { if (!SAVE4B.house) return false; const ks = cnTownKeys(); return !!ks.length && ks.every(k => p4Shops()[k]); };
function cnSpec() {
  const sp = SAVE4.spec || (SAVE4.spec = {}), h = cnHash(cnId());
  if (!sp.lang && cnVillageUnlocked()) { sp.lang = C4_SHOPS[h % C4_SHOPS.length]; persist4(); }
  if (!sp.pho && cnTownUnlocked()) { const ks = cnTownKeys(); sp.pho = ks[(h >> 3) % ks.length]; persist4(); }
  return sp;
}
const c4SpecK = g => { const sp = SAVE4.spec; return sp && sp.lang === g && cnVillageUnlocked() ? .5 : 1; };
const p4FoodCost = key => P4_FOOD.cost * (SAVE4.spec && SAVE4.spec.pho === key && cnTownUnlocked() ? .5 : 1);
setInterval(() => { try { if (SAVE4.intro && cnPlace()) cnSpec(); } catch (e) {} }, 5000);

/* ---------- the list of transactions ---------- */
function cnTxn(e) {
  const T = SAVE4.txn || (SAVE4.txn = []);
  T.unshift({ day: SAVE4.day, dir: e.dir, id: e.id, name: e.name, g: e.g, n: e.n, p: e.p, pl: e.pl });
  if (T.length > 80) T.length = 80;
  if (e.id) {
    const P = SAVE4.cnPeople || (SAVE4.cnPeople = {}), q = P[e.id] || (P[e.id] = {}), g0 = CN.guests.get(e.id);
    q.name = e.name || q.name; q.t = Date.now();
    if (g0 && g0.prof) { q.prof = { ...g0.prof }; delete q.prof.home; if (Array.isArray(g0.prof.home)) q.home = g0.prof.home; }
    if (e.home) q.home = e.home;
    const ids = Object.keys(P); if (ids.length > 60) { ids.sort((a, b) => P[a].t - P[b].t); delete P[ids[0]]; }
  }
}
const cnWareName = (g, pl) => g === 'trau' ? (pl === 'pho' ? 'trầu cau phố' : 'trầu cau') : pl === 'pho' ? ((p4Shops()[g] && p4Shops()[g].food) || g).toLowerCase() : (C4_GOODS[g] ? C4_GOODS[g].name.toLowerCase() : g);
const cnLine = t => `${t.dir === 'sold' ? 'Bán' : 'Mua'} ${t.n} ${cnWareName(t.g, t.pl)} · ${t.dir === 'sold' ? 'cho' : 'của'} ${cnEsc(t.name || 'một người')} · ${c4Money(t.n * t.p)}`;
function cnTxnHtml(list, empty) {
  if (!list.length) return `<p class="sm">${empty}</p>`;
  return '<div class="cnTx">' + list.map(t => `<button class="cnTl" data-txn="${(SAVE4.txn || []).indexOf(t)}"><span class="dy">Ngày ${t.day}</span> ${cnLine(t)}</button>`).join('') + '</div>';
}
const cnTxnTab = () => '<h4>Giao dịch với bạn bè</h4>' + cnSwitchHtml() + cnTxnHtml((SAVE4.txn || []).slice(0, 40), 'Chưa có ai mua bán với nhà mình.') + '<p class="sm">Bấm vào một dòng để xem người đó.</p>';
function cnTxnWire(root) { cnSwitchWire(root); root.querySelectorAll('[data-txn]').forEach(b => b.addEventListener('click', () => { AU.tap(); const t = (SAVE4.txn || [])[+b.dataset.txn]; if (t) cnWhoOpen(t.id, t.name); })); }
function cnTxnBlock(g) {
  const d = document.createElement('div'); d.className = 'hands autof cnTxB';
  const list = (SAVE4.txn || []).filter(t => t.g === g && t.dir === 'sold').slice(0, 5);
  if (!list.length) return d;
  d.innerHTML = '<h4>Bạn bè đã mua</h4>' + cnTxnHtml(list, ''); cnTxnWire(d); return d;
}

/* ---------- sheets: the list of open markets, a person ---------- */
function cnSheet(id, inner) { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet cnsheet'; d.hidden = true; d.innerHTML = `<div class="card4">${inner}</div>`; document.body.appendChild(d); return d; }
const cnHold = on => { if (S.mode === 'c4play') c4Sheets(on ? 'cnx' : null); else if (S.mode === 'c4bplay') p4Sheets(on ? 'cnx' : null); };
const cnShow = el => { el.hidden = false; cnHold(true); };
const cnHide = el => { el.hidden = true; cnHold(false); };
const cnList = cnSheet('cnList', '<h3>Chợ bạn bè</h3><div id="cnListB"></div><div class="row"><button class="btn alt" id="cnListT"></button><button class="btn alt" id="cnListX">Đóng</button></div>');
const cnWho = cnSheet('cnWho', '<div id="cnWhoB"></div><div class="row"><button class="btn alt" id="cnWhoX">Đóng</button></div>');
function cnListOpen() { CN.listOpen = true; CN.hostsAt = 0; CN.want = true; cnConnect(); cnShow(cnList); cnListRefresh(); setTimeout(() => cnSend({ t: 'hosts' }), 500); }
function cnListRefresh() {
  if (cnList.hidden) return;
  const B = $('#cnListB'), place = cnPlace();
  const rows = CN.hosts.filter(h => cnOn() ? true : true);
  $('#cnListT').textContent = cnOn() ? 'Đóng chợ nhà mình cho khách' : 'Mở chợ nhà mình cho khách';
  B.innerHTML = (!CN.up ? '<p class="sm">Đang kết nối…</p>' : '') + (rows.length ? rows.map(h => `<div class="cnHr"><span><b>${cnEsc(h.name)}</b><small>${h.place === 'lang' ? 'Chợ làng' : 'Phố huyện'}${h.n ? ' · ' + h.n + ' khách' : ''}</small></span><button class="btn" data-visit="${h.id}" data-place="${h.place}">Vào chợ</button></div>`).join('')
    : `<p class="sm">${CN.up ? 'Chưa có chợ nào đang mở. Bạn bè cũng phải đang chơi chương này thì mới sang được.' : ''}</p>`)
    + (cnOn() ? '' : '<p class="sm">Chợ nhà mình đang đóng với khách.</p>');
  B.querySelectorAll('[data-visit]').forEach(b => b.addEventListener('click', () => { AU.tap(); cnVisit(b.dataset.visit, b.dataset.place); }));
}
$('#cnListX').addEventListener('click', () => { AU.tap(); CN.listOpen = false; cnHide(cnList); });
$('#cnListT').addEventListener('click', () => { AU.tap(); SAVE4.cnOff = cnOn() ? 1 : 0; if (!SAVE4.cnOff) delete SAVE4.cnOff; persist4(); if (!cnOn() && CN.hosting) { cnSend({ t: 'host', place: null }); CN.hosting = null; } cnListRefresh(); });
function cnWhoOpen(id, name) {
  CN.whoId = id; CN.whoName = name; CN.ison[id] = null; cnSend({ t: 'ison', id }); if (!CN.ws || CN.ws.readyState !== 1) { CN.want = true; cnConnect(); }
  cnShow(cnWho); cnWhoRefresh();
}
function cnWhoRefresh() {
  if (cnWho.hidden) return;
  const id = CN.whoId, q = (SAVE4.cnPeople || {})[id] || {}, on = CN.ison[id], cur = on && on.on && on.place && cnOn();
  const mine = (SAVE4.txn || []).filter(t => t.id === id);
  $('#cnWhoB').innerHTML = `<h3>${cnEsc(CN.whoName || q.name || 'Một người bạn')}</h3>`
    + (q.home && q.home.length ? `<div class="roomBox">${c4NhaSvg(q.home)}</div><p class="sm">Gian nhà của bạn ấy lần gần nhất mình thấy.</p>` : '<p class="sm">Chưa biết nhà bạn ấy có gì.</p>')
    + `<p class="sm">${on === null ? 'Đang xem bạn ấy có trực tuyến không…' : on && on.on ? (on.place ? `Đang mở ${on.place === 'lang' ? 'chợ làng' : 'phố huyện'}.` : 'Đang trực tuyến, chưa mở chợ.') : 'Hiện không trực tuyến.'}</p>`
    + (cur ? `<div class="row"><button class="btn" id="cnWhoGo">Vào chợ ${on.place === 'lang' ? 'làng' : 'phố huyện'} của bạn ấy</button></div>` : '')
    + (mine.length ? '<h4>Với bạn ấy</h4>' + cnTxnHtml(mine.slice(0, 8), '') : '');
  const go = $('#cnWhoGo'); if (go) go.addEventListener('click', () => { AU.tap(); cnHide(cnWho); cnVisit(id, on.place); });
  cnTxnWire($('#cnWhoB'));
}
$('#cnWhoX').addEventListener('click', () => { AU.tap(); cnHide(cnWho); CN.whoId = null; });
// a way in
function cnVisit(hostId, place) {
  if (CN.visitWait) return; CN.visitWait = true; setTimeout(() => { CN.visitWait = false; }, 4000);
  CN.from = S.mode === 'c4bplay' ? 'pho' : 'lang'; cnSend({ t: 'visit', host: hostId, place, x: place === 'lang' ? C4_GATE + 60 : P4_GATE + 60, z: .7 });
}

/* ---------- the host sees his visitors ---------- */
function cnWalker(p) {
  let w = CN.walkers.get(p.id);
  if (!w) { const d = hsClean({ ...HS_DEF, ...(p.prof || {}), role: (p.prof && p.prof.role) || 'chong' }); delete d.home; w = { kind: 'mouse', sort: hsSort(d), M: hsRig(d), seed: (cnHash(p.id) % 600) / 100, ph: 0, st: 'idle', face: 1, look: { ...hsLook(d), silk: hsCol(d.robe) }, ...hsShape(d) }; CN.walkers.set(p.id, w); }
  return w;
}
function cnStep(p, dt) {
  const dx = p.tx - p.x, dz = p.tz - p.z; p.x += dx * Math.min(1, dt * 9); p.z += dz * Math.min(1, dt * 9); if (Math.abs(dx) > .5) p.face = dx > 0 ? 1 : -1;
  const moving = p.mv || Math.abs(dx) > 3; p.ph += moving ? dt * 9 : 0; p.moving = moving;
  if (p.say && (p.say.t += dt) > p.say.life) p.say = null; if (p.emo && (p.emo.t += dt) > 2.8) p.emo = null;
}
let cnLast = performance.now();
function cnDrawPeople(items, g, vis, list, YF, SF, lift, crowd, tall) {
  const now = performance.now(), dt = Math.min(.1, (now - cnLast) / 1000); cnLast = now;
  for (const p of list) {
    cnStep(p, dt); if (!vis(p.x, 120)) continue;
    const w = cnWalker(p); Object.assign(w, { face: p.face, ph: p.ph, st: p.moving ? 'walk' : 'idle' });
    const s = SF(p.z) * crowd;
    items.push({ z: p.z, f: () => { const y = YF(p.z) - lift(p.x); c4NoWx(() => c4Critter(g, w, p.x, y, s));
      g.save(); g.font = '700 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#f2ecde'; g.fillStyle = '#5b2f1f'; const ty = y - tall * s - 6; g.strokeText(p.name, p.x, ty); g.fillText(p.name, p.x, ty); g.restore(); } });
    items.push({ z: 1.6, f: () => cnBubbles(g, p, p.x, YF(p.z) - lift(p.x) - tall * s - 22, SF(p.z)) });
  }
}
function cnBubbles(g, p, x, y, s) {
  // "Tắt chat" in the chat bar: no words are drawn, whoever's they are
  if (p.say && !(typeof HL !== 'undefined' && HL.chatOff)) { const B = c4Bubble(p.say.text, 0, 13, 150), a = Math.min(1, p.say.t * 6, (p.say.life - p.say.t) * 4), sc = .8 + .2 * s; g.globalAlpha = Math.max(0, a); dp(g, B, x, y - (B.bh + 14) * sc, 0, sc, sc); g.globalAlpha = 1; }
  if (p.emo && /^[0-5]$/.test(p.emo.e)) { const sc = .8 + .2 * s, pop = Math.min(1, p.emo.t * 8), r = 17 * (.6 + .4 * pop) * sc, ex = x + 24 * sc, ey = y - 30 * sc; g.save(); g.globalAlpha = Math.max(0, Math.min(1, (2.8 - p.emo.t) * 2)); hlEmoteFace(g, +p.emo.e, ex, ey, r); g.restore(); }
  else if (p.emo) { const q = p.emo.t / 2.8; g.save(); g.globalAlpha = Math.max(0, Math.min(1, (1 - q) * 3, q * 8)); g.font = `${Math.round(30 * (.8 + .2 * s))}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.emo.e, x + Math.sin(q * 6) * 6, y - 40 - q * 50); g.restore(); }
}
{ const fx0 = c4FxItems;
  c4FxItems = function (items, g, vis) { fx0(items, g, vis); if (CN.hosting === 'lang') { if (CN.guests.size) cnDrawPeople(items, g, vis, [...CN.guests.values()], c4Y, c4S, () => 0, C4_CROWD, C4_TALL.mouse * C4_CROWD * .92); cnOwnItems(items, g, C4_STALL - 40, c4Y(C4_WIFE_Z) - 150 * c4S(C4_WIFE_Z), c4S(C4_WIFE_Z)); } }; }
{ const br0 = p4TownBridgeItems;
  p4TownBridgeItems = function (items, g, vis) { br0(items, g, vis); if (CN.hosting === 'pho') { if (CN.guests.size) cnDrawPeople(items, g, vis, [...CN.guests.values()], p4Y, p4S, p4TownLift, P4_CROWD, P4_TALL * P4_CROWD * .92); cnOwnItems(items, g, P4_HOME, p4Y(.1) - 150 * p4S(.1), p4S(.1)); } }; }
/* ---------- chat and the six faces (owner 2026-10-28: "như chương X ghép tranh; chú ý bàn phím không che") ----------
   Two round buttons at the top left under the HUD, in my own market (while a visitor is in it) and in a visit. The chat is Hội Làng's own
   bar (hlChatOpen: on a phone it sits at the TOP, where the keyboard cannot cover it); the faces are Hội Làng's six woodblock faces
   (hlEmoteFace), sent at once and shown over my head (in my own market, over my wife at the stall). Built on first use because
   hoilang/game.js loads after this file. */
const CN_CHAT = { send: m => cnSend({ t: 'chat', text: m.s }) };
let cnTools = null;
function cnToolsInit() {
  if (cnTools) return cnTools;
  const d = document.createElement('div'); d.id = 'cnTools'; d.hidden = true;
  const icon = draw => { const c = document.createElement('canvas'); c.width = c.height = 84; c.style.width = c.style.height = '42px'; const g = c.getContext('2d'); g.scale(2, 2); draw(g, 21); return c; };
  const bChat = document.createElement('button'); bChat.id = 'cnChatB'; bChat.title = 'Nói chuyện'; bChat.append(icon((g, h) => hlChatIcon(g, h, h, false)));
  const bEmo = document.createElement('button'); bEmo.id = 'cnEmoB'; bEmo.title = 'Biểu cảm'; bEmo.append(icon((g, h) => hlEmoteFace(g, 4, h, h, 17)));
  const tray = document.createElement('div'); tray.id = 'cnTray'; tray.hidden = true;
  for (let k = 0; k < 6; k++) { const b = document.createElement('button'); b.title = HL_EMO_NAME[k]; b.append(icon((g, h) => hlEmoteFace(g, k, h, h, 17))); b.addEventListener('click', () => cnEmote(k)); tray.append(b); }
  d.append(bChat, bEmo, tray); document.body.appendChild(d);
  bChat.addEventListener('click', () => { AU.tap(); tray.hidden = true; HL_CHAT_NET = CN_CHAT; hlChatOpen();
    const off = HL_CHAT_EL && HL_CHAT_EL.querySelector('#hlChatOff'); if (off) off.addEventListener('click', () => { if (HL.chatOff) hlChatClose(); });   // "Tắt chat" shuts the bar too
  });
  bEmo.addEventListener('click', () => { AU.tap(); hlChatClose(); tray.hidden = !tray.hidden; });
  return (cnTools = d);
}
function cnEmote(k) {
  if (performance.now() - (CN.emoAt || 0) < 700) return; CN.emoAt = performance.now(); AU.tap(); $('#cnTray').hidden = true;
  cnSend({ t: 'emo', e: String(k) }); if (CN.visit) CN.visit.me.emo = { e: String(k), t: 0 }; else CN.myEmo = { e: String(k), t: 0 };
}
setInterval(() => {
  const sheet = S.mode === 'c4play' ? C4.sheet : S.mode === 'c4bplay' ? P4.sheet : null;
  const market = (S.mode === 'c4play' || S.mode === 'c4bplay') && cnOn() && CN.up && CN.hosting && !sheet;
  const on = S.mode === 'c4visit' || market; if (on) cnToolsInit();
  if (cnTools) { cnTools.hidden = !on; if (!on) { $('#cnTray').hidden = true; if (HL_CHAT_EL) hlChatClose(); } }
}, 300);
// my own words and faces in my own market hang over the wife at the stall (I have no mouse of my own there)
function cnOwnItems(items, g, x, y, s) {
  const now = performance.now(), dt = Math.min(.1, (now - (CN.ownLast || now)) / 1000); CN.ownLast = now;
  if (CN.mySay && (CN.mySay.t += dt) > CN.mySay.life) CN.mySay = null; if (CN.myEmo && (CN.myEmo.t += dt) > 2.8) CN.myEmo = null;
  if (CN.mySay || CN.myEmo) items.push({ z: 1.7, f: () => cnBubbles(g, { say: CN.mySay, emo: CN.myEmo }, x, y, s) });
}
const cnMeObj = () => (CN.visit ? CN.visit.me : null);
// the owner's own switch for visitors, on the Giao dịch tab
const cnSwitchHtml = () => `<div class="row"><button class="btn alt" id="cnSw">${cnOn() ? 'Đóng chợ nhà mình với khách' : 'Mở chợ nhà mình cho khách'}</button></div><p class="sm">${cnOn() ? 'Bạn bè đang online có thể sang chợ nhà mình mua hàng.' : 'Chợ nhà mình đang đóng với khách.'}</p>`;
function cnSwitchWire(root) {
  const b = root.querySelector('#cnSw'); if (!b) return;
  b.addEventListener('click', () => { AU.tap(); SAVE4.cnOff = cnOn() ? 1 : 0; if (!SAVE4.cnOff) delete SAVE4.cnOff; persist4(); if (!cnOn() && CN.hosting) { cnSend({ t: 'host', place: null }); CN.hosting = null; CN.guests.clear(); } c4OpenNotes('gd'); });
}
// the house of someone on the board: a way into his market when he is online with it open (matched by his one name)
function cnMarketBtn(B, r) {
  if (r.mine) return;
  const row = document.createElement('div'); row.className = 'row cnMk'; const anchor = B.querySelector('.roomBox'); if (anchor) anchor.after(row); else B.prepend(row);
  CN.want = true; cnConnect();
  CN.hostsCb = () => {
    const hs = CN.hosts.filter(h => String(h.name).toLowerCase() === String(r.name).toLowerCase());
    row.innerHTML = cnOn() ? hs.map(h => `<button class="btn" data-id="${h.id}" data-pl="${h.place}">Vào chợ ${h.place === 'lang' ? 'làng' : 'phố huyện'} của bạn ấy</button>`).join('') : '';
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { AU.tap(); c4RankShow(null); cnVisit(b.dataset.id, b.dataset.pl); }));
  };
  for (const t of [300, 1500, 4000]) setTimeout(() => cnSend({ t: 'hosts' }), t);
}
