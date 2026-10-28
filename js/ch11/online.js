/* Chương XI · Làng Vũ Đại online (owner 2026-10-27: "vào làng, thấy nhau đi lại, chat, kết bạn, sang nhà nhau"). Loaded after nghe.js.
   The server is a Cloudflare Worker + one Durable Object (worker/, hub.js): it only relays. Everything a player owns stays in
   their own SAVE11 and the server trusts the client (owner's choice). What is shared:
   - areas are rooms; players in the same area see each other walk (positions ~10 times a second, smoothed) and read each other's
     chat (a speech bubble and a line in the log). The villagers (NPCs) are NOT shared: each player's own clock runs them.
   - friends: tap a player → "Kết bạn"; the other side accepts in the Online menu. Friends are kept in SAVE11.friends {id: {name}}.
   - home: a farm is the room 'ruong:<ownerId>'. A friend who is online can be visited ("Sang nhà bạn"): the host's client sends a
     snapshot of the farm (tiles, trees, animals, pens), the guest's SAVE11 farm fields are swapped for it while there (nothing is
     saved meanwhile, persist11 is off) and put back on leaving. A guest can only water (the host's crops get wet).
   Server address: C11_SERVER below, or ?c11srv=wss://host/ws in the URL. Empty = the Online button says there is no server yet. */
const C11_SERVER = 'wss://dcc-lang.dcc-phong-choi.workers.dev/ws';                                                 // the Cloudflare Worker in worker/ (deployed 2026-10-27)
const C11O = { ws: null, on: false, peers: new Map(), room: null, reqs: [], who: [], onlineF: new Set(), visit: null, pending: null, lines: [], mine: null, sendT: 0, last: '', tries: 0, closing: false, ui: null };
const C11O_FARM = ['tiles', 'clear', 'cut', 'gone', 'hits', 'herd', 'pens', 'drops'];   // what a guest sees of the host's home
const c11OUrl = () => { if (!/[?&]c11online(&|=|$)/.test(location.search)) return ''; const q = /[?&]c11srv=([^&]+)/.exec(location.search); return q ? decodeURIComponent(q[1]) : C11_SERVER; };   // closed for now (owner: merged, not playable): online only with ?c11online
SAVE11.oid = SAVE11.oid || (() => { let s = ''; const a = 'abcdefghijkmnpqrstuvwxyz23456789'; for (let i = 0; i < 14; i++) s += a[(Math.random() * a.length) | 0]; return s; })();
SAVE11.oname = SAVE11.oname || 'Chuột ' + (100 + ((Math.random() * 900) | 0));
SAVE11.friends = SAVE11.friends || {};
const c11OFriendIds = () => Object.keys(SAVE11.friends);
const c11OHue = id => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; };
const c11ORoomKey = () => C11.area === 'ruong' ? 'ruong:' + (C11O.visit ? C11O.visit.id : SAVE11.oid) : C11.area;
function c11OSend(m) { if (C11O.ws && C11O.ws.readyState === 1) C11O.ws.send(JSON.stringify(m)); }

/* ---------- connection ---------- */
function c11OConnect() {
  const url = c11OUrl();
  if (!url) { c11Msg('Chưa có máy chủ online. Chờ bản sau nhé.', '#a3332a'); return; }
  if (C11O.ws) return;
  C11O.closing = false; let ws; try { ws = new WebSocket(url); } catch (e) { c11Msg('Không nối được máy chủ', '#a3332a'); return; }
  C11O.ws = ws; c11Msg('Đang vào làng online…', '#2f6a4c');
  ws.onopen = () => { C11O.tries = 0; c11OSend({ t: 'hello', id: SAVE11.oid, name: SAVE11.oname, friends: c11OFriendIds() }); };
  ws.onmessage = e => { try { c11OGot(JSON.parse(e.data)); } catch (err) { /* a bad message is ignored */ } };
  ws.onclose = () => {
    const wasOn = C11O.on; C11O.ws = null; C11O.on = false; C11O.peers.clear(); C11O.room = null; c11OUiShow();
    if (C11O.visit) c11OEndVisit();
    if (!C11O.closing && SAVE11.online && C11.ready) { if (wasOn || C11O.tries < 3) { C11O.tries++; setTimeout(() => { if (!C11O.ws && SAVE11.online && !C11O.closing) c11OConnect(); }, 2000 + C11O.tries * 2000); } c11Msg('Mất kết nối, đang nối lại…', '#a3332a'); }
  };
  ws.onerror = () => {};
}
function c11OLeave(quiet) {
  C11O.closing = true; if (C11O.visit) c11OEndVisit(); const ws = C11O.ws; C11O.ws = null; C11O.on = false; C11O.peers.clear(); C11O.room = null; C11O.pending = null;
  if (ws) try { ws.close(); } catch (e) {}
  c11OUiShow(); if (!quiet) c11Msg('Đã ra khỏi làng online', '#2f6a4c');
}
function c11OEnterRoom() {
  if (!C11O.on) return; const room = c11ORoomKey(); C11O.room = room; C11O.peers.clear(); C11O.last = '';
  c11OSend({ t: 'room', room, x: +C11.px.toFixed(2), y: +C11.py.toFixed(2) });
}
function c11OGot(m) {
  const G = C11;
  switch (m.t) {
    case 'welcome': C11O.on = true; SAVE11.online = true; persist11(); c11Msg(`Đã vào làng online · ${m.count} người`, '#2f6a4c'); c11OEnterRoom(); c11OUiShow(); C11O.onlineF = new Set(m.online || []); break;
    case 'room': if (m.room !== C11O.room) break; C11O.peers.clear(); for (const p of m.peers || []) c11OAddPeer(p); break;
    case 'came': c11OAddPeer(m.p); break;
    case 'gone': C11O.peers.delete(m.id); break;
    case 'move': { const p = C11O.peers.get(m.id); if (p) { p.tx = m.x; p.ty = m.y; p.face = m.face; p.moving = !!m.mv; } break; }
    case 'chat': {
      C11O.lines.push({ name: m.name, text: m.text, t: 0, me: m.id === SAVE11.oid }); if (C11O.lines.length > 40) C11O.lines.shift();
      if (m.id === SAVE11.oid) C11O.mine = { text: m.text, t: 0 }; else { const p = C11O.peers.get(m.id); if (p) p.say = { text: m.text, t: 0 }; }
      c11OLogDraw(); break;
    }
    case 'who': C11O.who = m.list || []; if (C11O.whoOpen) { C11O.whoOpen = false; c11OWhoMenu(); } break;
    case 'on': C11O.onlineF.add(m.id); { const f = SAVE11.friends[m.id]; if (f) c11Msg(`${f.name} vừa vào làng`, '#2f6a4c'); } break;
    case 'off': C11O.onlineF.delete(m.id); break;
    case 'online': C11O.onlineF = new Set(m.online || []); break;
    case 'fr': c11OFriendMsg(m); break;
    case 'snapreq': if (SAVE11.friends[m.from]) c11OSend({ t: 'snap', to: m.from, data: c11OSnapshot() }); break;
    case 'snap': if (C11O.pending && C11O.pending.id === m.from) c11OStartVisit(m.from, m.name, m.data); break;
    case 'help': c11OHelped(m); break;
    case 'nobody': if (m.for === 'snapreq') { C11O.pending = null; c11Msg('Bạn ấy đang không ở trong làng', '#a3332a'); } else c11Msg('Người đó đã ra khỏi làng', '#a3332a'); break;
    case 'bye': C11O.closing = true; c11Msg(m.why || 'Bạn đã ra khỏi làng', '#a3332a'); break;
  }
}
function c11OAddPeer(p) { if (!p || p.id === SAVE11.oid) return; C11O.peers.set(p.id, { id: p.id, name: p.name, x: p.x, y: p.y, tx: p.x, ty: p.y, face: p.face || 1, moving: !!p.mv, ph: 0, say: null }); }

/* ---------- friends ---------- */
function c11OFriendMsg(m) {
  if (m.op === 'ask') {
    if (SAVE11.friends[m.from]) { c11OSend({ t: 'fr', to: m.from, op: 'ok' }); return; }
    if (!C11O.reqs.some(r => r.id === m.from)) C11O.reqs.push({ id: m.from, name: m.name }); c11Msg(`${m.name} muốn kết bạn với bạn (menu Online)`, '#2f6a4c');
  } else if (m.op === 'ok') { SAVE11.friends[m.from] = { name: m.name, day: SAVE11.day }; persist11(); c11OSend({ t: 'friends', list: c11OFriendIds() }); c11Msg(`${m.name} đã là bạn của bạn!`, '#2f6a4c'); }
  else c11Msg(`${m.name} chưa muốn kết bạn`, '#a3332a');
}
function c11OAccept(r, yes) {
  C11O.reqs = C11O.reqs.filter(q => q.id !== r.id);
  if (yes) { SAVE11.friends[r.id] = { name: r.name, day: SAVE11.day }; persist11(); c11OSend({ t: 'friends', list: c11OFriendIds() }); c11Msg(`${r.name} đã là bạn của bạn!`, '#2f6a4c'); }
  c11OSend({ t: 'fr', to: r.id, op: yes ? 'ok' : 'no' });
}

/* ---------- visiting a friend's home ---------- */
function c11OSnapshot() { const o = {}; for (const k of C11O_FARM) if (k !== 'drops') o[k] = SAVE11[k]; return o; }
function c11OVisit(id) {
  if (!C11O.on) { c11Msg('Vào làng online trước đã', '#a3332a'); return; }
  const f = SAVE11.friends[id]; if (!f) return;
  C11O.pending = { id, name: f.name }; c11OSend({ t: 'snapreq', to: id }); c11Msg(`Đang xin sang nhà ${f.name}…`, '#2f6a4c');
  setTimeout(() => { if (C11O.pending && C11O.pending.id === id) { C11O.pending = null; c11Msg(`${f.name} chưa trả lời`, '#a3332a'); } }, 6000);
}
function c11OStartVisit(id, name, data) {
  C11O.pending = null; if (!data || C11O.visit) return;
  const stash = {}; for (const k of C11O_FARM) { stash[k] = SAVE11[k]; SAVE11[k] = k === 'drops' ? [] : (data[k] || (k === 'herd' || k === 'pens' ? [] : {})); }
  C11O.visit = { id, name, stash }; c11GoArea('ruong', 18.5, 6.5);
}
function c11OEndVisit() {
  const v = C11O.visit; if (!v) return; for (const k of C11O_FARM) SAVE11[k] = v.stash[k]; C11O.visit = null; C11O.peers.clear();
}
function c11OHelped(m) {                                              // a friend waters one of my crops while visiting
  const f = SAVE11.friends[m.from]; if (!f || m.what !== 'water') return;
  const s = C11O.visit ? null : SAVE11.tiles[m.key]; if (!s || !s.crop || s.wet) return;
  s.wet = 1; f.help = (f.help || 0) + 1; persist11(); c11Msg(`${m.name} tưới giúp bạn một luống`, '#2f6a4c');
}
function c11OGuestAct(tx, ty, tool, k, key) {                          // on someone else's farm: only watering (and filling the can at the pond)
  if (k === 'w' || k === 'K') return false;                            // the pond: the normal code refills the can
  const s = SAVE11.tiles[key];
  if (tool === 'can' && s && s.crop && !s.wet && !s.dead) {
    if (SAVE11.water <= 0) { c11Pop(tx, ty - 1, 'Hết nước, ra ao múc', '#2f5f8f'); return true; }
    s.wet = 1; SAVE11.water--; c11Spend(C11_COST.can); c11Dots(tx, ty, '#7fb0c4', 9, .6); c11Pop(tx, ty - 1, 'Tưới giúp bạn', '#2f6a4c');
    c11OSend({ t: 'help', to: C11O.visit.id, what: 'water', key }); return true;
  }
  c11Pop(tx, ty - 1, 'Nhà bạn: chỉ tưới giúp thôi', '#5b2f1f'); return true;
}

/* ---------- hooks into nongtrai.js / nghe.js (wrapped by reassigning, as nghe.js does) ---------- */
const c11OEnter0 = c11Enter;
c11Enter = function (id, x, y, quiet) {
  if (C11O.visit && id !== 'ruong') c11OEndVisit();                      // leaving the friend's farm puts my own back before the area is built
  c11OEnter0(id, x, y, quiet);
  if (C11O.visit && id === 'ruong') c11Msg(`Nhà bạn ${C11O.visit.name} · chỉ tưới giúp được`, '#2f6a4c');
  if (SAVE11.online && !C11O.ws && !C11O.on && !C11O.closing) c11OConnect();
  c11OEnterRoom();
};
const c11ONewDay0 = c11NewDay;
c11NewDay = function () { if (C11O.visit) c11OEndVisit(); return c11ONewDay0.apply(this, arguments); };
const c11OActNew0 = c11ActNew;
c11ActNew = function (tx, ty, tool, k, key) { if (C11O.visit && C11.area === 'ruong') { const r = c11OGuestAct(tx, ty, tool, k, key); if (r) return true; } return c11OActNew0(tx, ty, tool, k, key); };
const c11OCanNew0 = c11CanNew;
c11CanNew = function (tx, ty, tool, k, key) {
  if (C11O.visit && C11.area === 'ruong') {
    if (k === 'w' || k === 'K') return tool === 'can' && SAVE11.water < 10;
    const s = SAVE11.tiles[key || tx + ',' + ty]; return tool === 'can' && !!s && !!s.crop && !s.wet && !s.dead;
  }
  return c11OCanNew0(tx, ty, tool, k, key);
};
const c11ONewUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  c11ONewUpdate0(dt);
  for (const p of C11O.peers.values()) {
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    if (d > 6) { p.x = p.tx; p.y = p.ty; } else { const k = Math.min(1, dt * 9); p.x += dx * k; p.y += dy * k; }
    p.moving = p.moving || d > .08; if (p.moving) p.ph += dt * 9; if (p.say && (p.say.t += dt) > 5) p.say = null;
  }
  if (C11O.mine && (C11O.mine.t += dt) > 5) C11O.mine = null;
  for (const l of C11O.lines) l.t += dt;
  if (C11O.on && C11O.room) {
    C11O.sendT -= dt; const sig = C11.px.toFixed(2) + ',' + C11.py.toFixed(2) + ',' + C11.face + ',' + (C11.moving ? 1 : 0);
    if (C11O.sendT <= 0 && (sig !== C11O.last || C11O.sendT < -2)) { C11O.sendT = .1; C11O.last = sig; c11OSend({ t: 'move', x: +C11.px.toFixed(2), y: +C11.py.toFixed(2), face: C11.face, mv: C11.moving ? 1 : 0 }); }
  }
  c11OUiShow();
};
const c11ONewDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {
  c11ONewDraw0(E, g, sx, sy, k, T);
  const V = C11.v, me = { sort: 0, id: 99, groom: true };
  for (const p of C11O.peers.values()) E.push({ y: p.y, d: () => {
    const x = sx(p.x), y = sy(p.y), hue = c11OHue(p.id);
    g.strokeStyle = `hsl(${hue} 62% 42%)`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, T * .36, T * .13, 0, 0, 6.283); g.stroke();
    c11Folk1(g, me, x, y, p.face, p.ph, p.moving, T, null, V);
    g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ny = y - T * 1.42; g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText(p.name, x, ny); g.fillStyle = `hsl(${hue} 70% 30%)`; g.fillText(p.name, x, ny);
  } });
};
const c11OChatDraw0 = c11ChatDraw;
c11ChatDraw = function (g, sx, sy, T) {
  c11OChatDraw0(g, sx, sy, T);
  for (const p of C11O.peers.values()) if (p.say) c11Bubble(g, sx(p.x), sy(p.y) - T * 1.62, p.say.text, null);
  if (C11O.mine && !C11.say) c11Bubble(g, sx(C11.px), sy(C11.py) - T * 1.62, C11O.mine.text, null);
};
const c11OHide0 = chapterById(11).hide;
chapterById(11).hide = function () { c11OLeave(true); c11OHide0(); };
function c11OTap(wx, wy) {                                             // a tap on another player opens their card
  for (const p of C11O.peers.values()) if (Math.abs(wx - p.x) < .6 && wy > p.y - 1.5 && wy < p.y + .25) { c11OPeerMenu(p); return true; }
  return false;
}

/* ---------- menus ---------- */
const c11OM = (title, note, rows) => { C11.menu = { title, note, cols: 1, rows: rows.map(r => ({ tag: ' ', ...r })) }; };   // tag ' ' = no price on the row (an empty tag would show the price, NaN)
function c11OPeerMenu(p) {
  const fr = SAVE11.friends[p.id], rows = [];
  if (fr) rows.push({ name: 'Bạn bè', sub: 'đã kết bạn với nhau', ok: false, f() {} });
  else rows.push({ name: 'Kết bạn', sub: 'gửi lời mời, bạn ấy đồng ý là thành bạn', ok: true, f: () => { c11OSend({ t: 'fr', to: p.id, op: 'ask' }); C11.menu = null; c11Msg(`Đã gửi lời mời cho ${p.name}`, '#2f6a4c'); } });
  if (fr) rows.push({ name: 'Sang nhà bạn', sub: 'xem nhà, tưới giúp cây', ok: true, f: () => { C11.menu = null; c11OVisit(p.id); } });
  c11OM(p.name, '', rows);
}
function c11OWhoMenu() {
  const rows = C11O.who.slice(0, 7).map(w => ({ name: w.name, sub: (SAVE11.friends[w.id] ? 'bạn bè · ' : '') + (C11_AREAS[w.room] ? C11_AREAS[w.room].name : w.room && w.room.startsWith('ruong:') ? 'đang ở nhà' : '…'), ok: true, f: () => c11OPeerMenu({ id: w.id, name: w.name }) }));
  if (!rows.length) rows.push({ name: 'Chưa có ai khác', sub: 'rủ bạn bè vào làng cùng nhé', ok: false, f() {} });
  c11OM('Người trong làng', '', rows);
}
function c11OFriendsMenu() {
  const ids = c11OFriendIds(), rows = ids.slice(0, 7).map(id => { const f = SAVE11.friends[id], on = C11O.onlineF.has(id); return { name: f.name, sub: on ? 'đang trong làng · chạm để sang nhà' : 'đang không ở làng', ok: on, f: () => { C11.menu = null; c11OVisit(id); } }; });
  if (!rows.length) rows.push({ name: 'Chưa có bạn bè', sub: 'chạm vào người chơi khác để kết bạn', ok: false, f() {} });
  c11OM('Bạn bè', '', rows);
}
function c11OReqMenu() {
  const rows = []; for (const r of C11O.reqs.slice(0, 3)) { rows.push({ name: `Nhận ${r.name}`, sub: 'đồng ý làm bạn', ok: true, f: () => { c11OAccept(r, true); c11OReqMenu(); } }); rows.push({ name: `Từ chối ${r.name}`, sub: '', ok: true, f: () => { c11OAccept(r, false); c11OReqMenu(); } }); }
  if (!rows.length) { C11.menu = null; return; }
  c11OM('Lời mời kết bạn', '', rows);
}
function c11OMainMenu() {
  const rows = [];
  if (!C11O.on) rows.push({ name: 'Vào làng online', sub: c11OUrl() ? 'gặp người chơi khác, chat, kết bạn' : 'chưa có máy chủ', ok: !!c11OUrl(), f: () => { C11.menu = null; SAVE11.online = true; c11OConnect(); } });
  else {
    rows.push({ name: `Người trong làng`, sub: 'xem ai đang online, kết bạn', ok: true, f: () => { C11O.whoOpen = true; c11OSend({ t: 'who' }); } });
    rows.push({ name: `Bạn bè (${c11OFriendIds().length})`, sub: 'sang nhà bạn', ok: true, f: c11OFriendsMenu });
    if (C11O.reqs.length) rows.push({ name: `Lời mời (${C11O.reqs.length})`, sub: 'có người muốn kết bạn', ok: true, f: c11OReqMenu });
    if (C11O.visit) rows.push({ name: 'Về nhà mình', sub: 'rời nhà ' + C11O.visit.name, ok: true, f: () => { C11.menu = null; c11GoArea('lang', 1.7, 9.6); } });
    rows.push({ name: 'Đổi tên', sub: 'bây giờ: ' + SAVE11.oname, ok: true, f: () => { C11.menu = null; const n = (prompt('Tên của bạn trong làng:', SAVE11.oname) || '').trim().slice(0, 18); if (n) { SAVE11.oname = n; persist11(); c11OSend({ t: 'hello', id: SAVE11.oid, name: n, friends: c11OFriendIds() }); } } });
    rows.push({ name: 'Ra khỏi làng online', sub: 'chơi một mình', ok: true, f: () => { C11.menu = null; SAVE11.online = false; persist11(); c11OLeave(); } });
  }
  c11OM('Làng online', C11O.on ? `Bạn là ${SAVE11.oname}` : '', rows);
}
function c11OHud(g, st) {
  if (!c11OUrl()) return;                                              // no Online button while it is closed                                              // the Online button under the farm name; a banner on a friend's farm
  const n = C11O.on ? C11O.peers.size : 0, lab = C11O.on ? `Online · ${n + 1}` : 'Online', t = c11Tag(g, 10, 108, lab, { size: 12, h: 28, pad: 18, fill: C11O.on ? '#bfe3a8' : '#f4ead0' });
  C11.hud.push({ r: [t[0], t[1] + st, t[2], t[3]], f: c11OMainMenu });
  if (C11O.reqs.length) { g.fillStyle = '#e5391a'; g.beginPath(); g.arc(t[0] + t[2] - 2, t[1] + 2, 7, 0, 6.283); g.fill(); }
  if (C11O.visit) c11TagC(g, (cv.width / DPR) / 2, 10, `Nhà bạn ${C11O.visit.name}`, { size: 12, h: 28, pad: 22, fill: '#d9e6c0' });
}

/* ---------- chat box (DOM, so phones get their keyboard) ---------- */
function c11OUi() {
  if (C11O.ui) return C11O.ui;
  const box = document.createElement('div'), log = document.createElement('div'), row = document.createElement('div'), inp = document.createElement('input'), btn = document.createElement('button');
  box.style.cssText = 'position:fixed;right:10px;top:calc(92px + env(safe-area-inset-top,0px));width:min(230px,50vw);z-index:30;display:none;font:600 12px "Be Vietnam Pro",sans-serif';
  log.style.cssText = 'margin-top:4px;text-align:right;pointer-events:none;color:#1d1915;text-shadow:0 0 3px #fbf4dc,0 0 3px #fbf4dc,0 0 5px #fbf4dc';
  row.style.cssText = 'display:flex;gap:4px';
  inp.maxLength = 90; inp.placeholder = 'Nói gì đó…'; inp.enterKeyHint = 'send'; inp.autocomplete = 'off';
  inp.style.cssText = 'flex:1;min-width:0;padding:5px 8px;border:2.4px solid #1d1915;border-radius:9px;background:#f4ead0;font:600 12px "Be Vietnam Pro",sans-serif';
  btn.textContent = 'Gửi'; btn.style.cssText = 'padding:5px 9px;border:2.4px solid #1d1915;border-radius:9px;background:#f7e3a4;font:800 12px "Be Vietnam Pro",sans-serif';
  const send = () => { const t = inp.value.trim(); if (t) c11OSend({ t: 'chat', text: t }); inp.value = ''; inp.blur(); cv.focus(); };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); send(); } else if (e.key === 'Escape') { inp.blur(); cv.focus(); } });
  inp.addEventListener('keyup', e => e.stopPropagation());
  btn.addEventListener('click', send);
  row.append(inp, btn); box.append(row, log); document.body.appendChild(box);
  return (C11O.ui = { box, log, inp });
}
function c11OUiShow() {
  const ui = c11OUi(), vis = C11O.on && S.mode === 'c11play' && !C11.menu; if (ui.box.style.display !== (vis ? 'block' : 'none')) ui.box.style.display = vis ? 'block' : 'none';
  if (vis) c11OLogDraw();
}
function c11OLogDraw() {
  const ui = C11O.ui; if (!ui) return; const L = C11O.lines.filter(l => l.t < 14).slice(-5), key = L.map(l => l.name + l.text).join('|');
  if (ui.logKey === key) return; ui.logKey = key; ui.log.textContent = '';
  for (const l of L) { const d = document.createElement('div'); const b = document.createElement('b'); b.textContent = l.name + ': '; b.style.color = l.me ? '#2f6a4c' : '#a3332a'; d.append(b, document.createTextNode(l.text)); ui.log.appendChild(d); }
}
