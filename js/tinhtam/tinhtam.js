/* Góc Tĩnh Tâm (owner 2026-10-29: a place to practise and sit quietly, not a chapter). One shared clearing among mountains and
   forest: a huge gilded Buddha (Phật Như Lai) on a lotus throne at the far end of a stone platform, cushions on the grass, and
   every player a mouse with their name over its head. You walk (arrow keys / WASD, or tap the ground) and sit (the button, Space,
   or a tap on yourself); after 10 s of sitting the mouse bows with joined hands, and again every 10 s. A chant ("Nam mô A Di Đà
   Phật") on a wooden fish plays the whole time (AU.zenStart in audio.js). The same Worker as the village hosts the room
   (/tt/ws; worker/src/index.js gives it an object of its own), so everyone sees everyone and the card in the picker says how many
   are there. Nothing is said or written: no chat, no hints, as the owner asked for quiet.
   World: x across (0 = the middle), z away from the camera, y up. The camera hangs TT_HC above the ground looking down the clearing
   (the monkey bridge's way of 2.5D: woodblock sprites standing on a perspective ground, the far scenery fading into mist). */
const TT_URN = { z: 10.6 };
// evening (owner: "thử làm buổi tối", then "buổi tối chỉ bật lúc 8h tối ở việt nam"): from 20:00 to 6:00 Vietnam time; ?dem forces it for testing
const TT_NIGHT_FORCE = /[?&]dem\b/.test(location.search), ttVnHour = () => (new Date(Date.now() + 7 * 3600e3)).getUTCHours();
let TT_NIGHT = TT_NIGHT_FORCE || ttVnHour() >= 20 || ttVnHour() < 6;
                                                 // the incense urn, on the near bank of the stream (owner)
const TT_FAR = 16, TT_HC = 2.4, TT_XMAX = 8.2, TT_ZMIN = 5.6, TT_ZMAX = 9.8, TT_SPEED = 3.1;
const TT_BOW_EVERY = 10, TT_BOW_LEN = 2.8;                              // after 10 s of sitting, and every 10 s after, a bow of 2.8 s
const TT_SZ = 17.5, TT_SY = 2.2, TT_SH = 8.8;                           // TT_SY: the top of the rock he sits on                          // the Buddha: where he sits (z, height of his base) and how tall he is, in units
const TT_VIET = 'wss://dcc-lang.dcc-phong-choi.workers.dev/tt/ws';
const TT = { inc: 0, lit: false, hoa: [], hoaMine: [], hoaHit: [], litT: 9, ready: false, t: 0, me: null, peers: new Map(), ws: null, on: false, count: 1, keys: new Set(), hud: [], sendT: 0, last: '', tries: 0, closing: false, cam: 0, camD: 0, chirp: 4, S: null, tex: null };
const TT_SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem('dcc.tt') || 'null'); } catch (e) {}
  if (!s || !s.id) {
    let name = ''; try { name = (JSON.parse(localStorage.getItem('dcc.c11') || 'null') || {}).oname || ''; } catch (e) {}       // the village name, when there is one
    const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let id = ''; for (let i = 0; i < 14; i++) id += a[(Math.random() * a.length) | 0];
    s = { id, name: name || 'Chuột ' + (100 + ((Math.random() * 900) | 0)) };
  }
  try { const shared = localStorage.getItem('dcc.name'); if (shared) s.name = shared; } catch (e) {}   // 'dcc.name' is the one name for every place that shows it (here and chương IX online)
  return s;
})();
const ttDay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);   // a Vietnam day, as the Worker counts it
const ttPersist = () => { try { localStorage.setItem('dcc.tt', JSON.stringify(TT_SAVE)); localStorage.setItem('dcc.name', TT_SAVE.name); } catch (e) {} };
// the player's own mouse and name are the Hồ sơ of chương IV (hsMine), as in Ghép Tranh and Hội Làng; others send theirs in hello (look)
const ttLook = () => { const d = hsMine(); return { role: d.role, age: d.age, body: d.body, fur: d.fur, robe: d.robe, skirt: d.skirt, pants: d.pants, top: d.top }; };
const ttProf = o => o._d && o._dn === o.name ? o._d : (o._dn = o.name, o._d = hsClean({ ...HS_DEF, ...o.look, name: o.name }));
const ttRigOf = o => o.look ? hsRig(ttProf(o)) : c4MouseRig(o.sort);
const ttLookOv = o => { const d = ttProf(o); return { key: 'hs|' + [d.fur, d.robe, d.top].join('|'), o: { robe: d.robe, trim: HS_TRIM[d.robe] || 'yellow', head: d.fur } }; };
const ttHash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const ttHue = id => ttHash(id) % 360;
const TT_ADULTS = () => C4_MOUSE_SORTS.map((s, i) => s.role === 'adult' ? i : -1).filter(i => i >= 0);
const ttSortOf = id => { const A = TT_ADULTS(); return A[ttHash(id + 'x') % A.length]; };
const ttServer = () => { const q = /[?&]ttsrv=([^&]+)/.exec(location.search); return q ? decodeURIComponent(q[1]) : TT_VIET; };

/* ---------- the fixed scenery, from a seed ---------- */
function ttBuild() {
  const r = mulberry(2026), S = { trees: [], rocks: [], tufts: [], cush: [], blades: [], fly: [], petals: [], shafts: [] };
  for (let i = 0; i < 190; i++) {                                           // bamboo forest all round, thick behind the platform, none inside the clearing
    const z = 4 + Math.pow(r(), 1.3) * 56, side = r() < .5 ? -1 : 1;
    let x = side * (10.5 + r() * (6 + z * .55));
    if (z > 23 && r() < .55) x = (r() - .5) * 20;                           // behind the Buddha: only far, small trees, so he stands out in front of them
    if (z > 18.5 && z < 23 && Math.abs(x) < 9.5) continue;
    if (z < 13 && Math.abs(x) < 10.5) continue;
    const truc = r() < .45;
    S.trees.push({ x, z, k: truc ? 1 : 0, v: (r() * 3) | 0, f: r() < .5 ? 1 : -1, h: 9 + r() * 5, ph: r() * 6.283 });
  }
  for (let i = 0; i < 22; i++) { const side = r() < .5 ? -1 : 1; S.rocks.push({ x: side * (9.2 + r() * 10), z: 6 + r() * 26, v: (r() * 2) | 0, f: r() < .5 ? 1 : -1, h: .9 + r() * 1.6 }); }
  // the cushions in three arcs round the Buddha (centre far behind them), the middle kept open for the path
  for (const [R, n] of [[5.6, 6], [7.2, 8], [8.8, 8]]) for (let i = 0; i < n; i++) { const th = (i - (n - 1) / 2) * (R < 6 ? .26 : .22), x = Math.sin(th) * R * 1.6, z = 15.4 - Math.cos(th) * R; if (Math.abs(x) < 1.1) continue; S.cush.push({ x, z }); }
  // the yard's small things on the grass
  // grass in layers (owner: "cỏ 2d nhiều lớp"): rows across the yard, near ones tall and dense, each row its own shade and wave
  S.rows = []; for (let z = 2.9; z < 14.2; z += .1 + (z - 2.9) * .02) S.rows.push({ z, sh: r(), ph: r() * 6.283, seed: (r() * 1e6) | 0 });
  for (let i = 0; i < 90; i++) S.petals.push({ x: (r() - .5) * 24, z: 4 + r() * 15, ph: r(), sp: .6 + r() * .5, rot: r() * 6.283, col: ['#e8b83a', '#f2c640', '#d99a2a', '#f0a830', '#c9871f'][i % 5] });
  for (let i = 0; i < 4; i++) S.shafts.push({ x: .12 + i * .24 + (r() - .5) * .1, w: .05 + r() * .06, ph: r() * 6.283 });
  return S;
}

/* ---------- the music: our own chant (owner: "để nhạc của b"; the voices kept low, mõ and bell louder): AU.zenStart in audio.js, a low "Nam mô A Di Đà Phật" over a wooden fish and a bell ---------- */

/* ---------- entering and leaving ---------- */
function startTT() {
  trackEnter('goc-tinh-tam'); ttPersist();
  AU.init(); hideChapterHuds(); AU.setQuiet(true);
  S.chapter = 12; S.mode = 'ttplay';
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  document.documentElement.style.setProperty('--paper', '#cfdccb');
  if (!TT.S) TT.S = ttBuild();
  const id = TT_SAVE.id; TT_SAVE.name = hsName(hsMine()); ttPersist();
  // a newcomer comes in at the front left corner (owner: "cho người mới vào thì đứng ở 1 góc"), not in the middle of those sitting
  TT.me = { id, name: TT_SAVE.name, look: ttLook(), x: -5, z: TT_ZMIN + .2, face: 1, mv: 0, ph: 0, sitT: 0, tx: null, tz: null, sort: ttSortOf(id), bowK: 0 };
  Object.assign(TT, { ready: true, t: 0, peers: new Map(), keys: new Set(), closing: false, tries: 0, cam: 0, camD: 0, chirp: 3 });
  AU.zenStart(); ttConnect(); ttHoaLoad(); cv.focus();
}
function ttHide() { TT.selfKnock = false; if (AU.zenSelf) AU.zenSelf(false); ttHoaClose(); ttHoaHold(null); ttRenameClose(); AU.zenStop(); AU.ambient({}); ttLeave(); TT.keys.clear(); }
function ttLeave() { TT.closing = true; clearInterval(TT.pollT); const ws = TT.ws; TT.ws = null; TT.on = false; TT.peers.clear(); if (ws) try { ws.close(); } catch (e) {} }

/* ---------- the room (the Worker only relays) ---------- */
const ttSend = m => { if (TT.ws && TT.ws.readyState === 1) TT.ws.send(JSON.stringify(m)); };
function ttConnect() {
  if (TT.ws) return; TT.closing = false; let ws; try { ws = new WebSocket(ttServer()); } catch (e) { return; }
  TT.ws = ws;
  ws.onopen = () => { TT.tries = 0; ttSend({ t: 'hello', id: TT.me.id, name: TT.me.name, look: TT.me.look, friends: [] }); };
  ws.onmessage = e => { try { ttGot(JSON.parse(e.data)); } catch (err) {} };
  ws.onclose = () => {
    clearInterval(TT.pollT); const was = TT.on; TT.ws = null; TT.on = false; TT.peers.clear();
    if (!TT.closing && S.mode === 'ttplay' && (was || TT.tries < 3)) { TT.tries++; setTimeout(() => { if (!TT.ws && !TT.closing && S.mode === 'ttplay') ttConnect(); }, 2000 + TT.tries * 2000); }
  };
  ws.onerror = () => {};
}
function ttRoom() { const m = TT.me; ttSend({ t: 'room', room: 'tinhtam', x: +(m.x + 50).toFixed(2), y: +m.z.toFixed(2) }); }   // x is shifted by 50 because the Worker keeps 0…200
function ttGot(m) {
  switch (m.t) {
    case 'welcome': TT.on = true; TT.count = m.count || 1; clearInterval(TT.pollT); TT.pollT = setInterval(() => ttSend({ t: 'who' }), 10000); TT.last = ''; ttRoom(); ttSend({ t: 'ttinfo' }); break;
    case 'room': TT.peers.clear(); for (const p of m.peers || []) ttAddPeer(p); break;
    case 'came': ttAddPeer(m.p); break;
    case 'gone': TT.peers.delete(m.id); break;
    case 'move': { const p = TT.peers.get(m.id); if (p) { p.tx = m.x - 50; p.tz = m.y; p.face = m.face; ttSetMv(p, m.mv); } break; }
    case 'who': TT.count = m.count || TT.count; break;
    case 'ttinfo': if (TT_INCENSE_TEST) break;   // testing: the urn keeps this device's own sticks
      TT.incAll = m.all || 0; if (m.visitors) TT.visitors = m.visitors; TT.inc = m.incense || 0; TT.incTs = Array.isArray(m.ts) ? m.ts : []; TT.incPos = Array.isArray(m.pos) ? m.pos : TT.incTs.map(() => null); TT.lit = !!m.lit || TT_SAVE.litDay === ttDay(); break;
    case 'incense':
      TT.inc = m.n; if (m.all) TT.incAll = m.all; if (!m.me && m.ts) { (TT.incTs = TT.incTs || []).push(m.ts); (TT.incPos = TT.incPos || []).push(m.pos || null); }   // mine was added when I planted it
      if (m.me) { if (m.again) toast(lg('Hôm nay bạn đã thắp nhang rồi. Mai quay lại nhé.', 'You have lit incense today already. Come back tomorrow.'), 3); TT.lit = true; TT_SAVE.litDay = ttDay(); ttPersist(); }
      break;
    case 'bye': TT.closing = true; break;
  }
}
function ttSetMv(p, mv) { if (mv === 2 && p.mv !== 2) p.sitT = 0; p.mv = mv; }
function ttAddPeer(p) { if (!p || p.id === TT.me.id) return; const o = { id: p.id, name: p.name, x: p.x - 50, z: p.y, tx: p.x - 50, tz: p.y, face: p.face || 1, mv: 0, ph: Math.random() * 6, sitT: 0, sort: ttSortOf(p.id), look: p.look && typeof p.look === 'object' ? p.look : null }; ttSetMv(o, p.mv || 0); TT.peers.set(p.id, o); }
const ttCount = () => TT.on ? Math.max(TT.count, TT.peers.size + 1) : 1;

/* ---------- the view ---------- */
function ttLay(W, H) {
  // the wide view on a phone (owner: "trên điện thoại không xem được toàn cảnh"): the lens set by the width so the whole clearing fits, the camera raised (hc) so the ground fills the tall screen
  // a + / − button on a tall screen (owner: "có 1 nút zoom out/zoom in"): close (the old view, light to draw) or wide; TT.zk eases between them
  const tall = H > W * 1.15, k = tall ? (TT.zk || 0) : 0, mix = (p, q) => p + (q - p) * k, hor = Math.round(H * mix(.43, .47)), f = mix(Math.min(H * .78, W * 1.15), W * .62), hc = mix(TT_HC, 4.6), hv = (W / 2) / (f / 9), lim = Math.max(0, TT_XMAX - hv);
  const cx = Math.max(-lim, Math.min(lim, TT.me.x));
  return { W, H, hor, f, hc, hv, cx, P: (x, y, z) => { const s = f / Math.max(z - TT.camD, .8); return [W / 2 + (x - TT.cam) * s, hor + (hc - y) * s, s]; } };   // camD: the camera walks forward after the mouse
}
const ttInv = (L, sx, sy) => { if (sy <= L.hor + 6) return null; const z = L.hc * L.f / (sy - L.hor) + TT.camD; return [TT.cam + (sx - L.W / 2) * z / L.f, z]; };

/* ---------- moving, sitting, bowing ---------- */
function ttSit(on) {
  const m = TT.me; if (on === (m.mv === 2)) return;
  if (!on) { m.mv = 0; m.sitT = 0; return; }
  m.tx = m.tz = null;
  let best = null, bd = 1.3; for (const c of TT.S.cush) { const d = Math.hypot(c.x - m.x, c.z - m.z); if (d < bd && ![...TT.peers.values()].some(p => p.mv === 2 && Math.hypot(p.x - c.x, p.z - c.z) < .6)) { bd = d; best = c; } }
  if (best) { m.x = best.x; m.z = best.z; }
  m.mv = 2; m.sitT = 0; m.bowK = 0; m.face = m.x > .3 ? -1 : m.x < -.3 ? 1 : m.face;
}
function ttBow(sitT) {                                                  // 0…1: how far bent. down .9 s, still .8 s, up 1.1 s, then rest until the next 10 s
  if (sitT < TT_BOW_EVERY) return 0;
  const ph = (sitT - TT_BOW_EVERY) % TT_BOW_EVERY; if (ph > TT_BOW_LEN) return 0;
  const u = ph / TT_BOW_LEN, e = k => k * k * (3 - 2 * k);
  return u < .32 ? e(u / .32) : u < .6 ? 1 : 1 - e((u - .6) / .4);
}
function updateTT(dt) {
  if (!TT.ready) return; dt = Math.min(dt, .05); TT.t += dt;
  AU.ambient({ wind: .4 }); TT.chirp -= dt; if (TT.chirp <= 0) { TT.chirp = 5 + Math.random() * 9; AU.chirp(); }
  ttBfUpdate(dt); ttHoaUpdate(dt); ttLightUpdate(dt); TT.litT += dt;
  if (TT.light) { TT.keys.clear(); TT.me.tx = TT.me.tz = null; }          // standing still while the incense is lit
  const m = TT.me, K = TT.keys;
  const kneelStep = o => { const tg = o.mv === 2 ? 1 : 0, d = dt / 2.2; o.kn = Math.max(0, Math.min(1, (o.kn || 0) + (tg > (o.kn || 0) ? d : -d))); };   // sitting down and rising take about two seconds
  kneelStep(m);
  const kx = (K.has('ArrowRight') || K.has('KeyD') ? 1 : 0) - (K.has('ArrowLeft') || K.has('KeyA') ? 1 : 0), kz = (K.has('ArrowUp') || K.has('KeyW') ? 1 : 0) - (K.has('ArrowDown') || K.has('KeyS') ? 1 : 0);
  let dx = 0, dz = 0;
  if (kx || kz) { m.tx = m.tz = null; dx = kx; dz = kz; }
  else if (m.tx != null) { const ex = m.tx - m.x, ez = m.tz - m.z, d = Math.hypot(ex, ez); if (d < .1) m.tx = m.tz = null; else { dx = ex / d; dz = ez / d; } }
  if ((dx || dz) && m.mv === 2) { m.mv = 0; m.sitT = 0; }
  if (m.kn > 0 && m.mv !== 2) { dx = dz = 0; }                      // first rise, then walk
  if (dx || dz) {
    if (m.mv === 2) { m.mv = 0; m.sitT = 0; }
    const n = Math.hypot(dx, dz); m.x = Math.max(-TT_XMAX, Math.min(TT_XMAX, m.x + dx / n * TT_SPEED * dt)); m.z = Math.max(TT_ZMIN, Math.min(TT_ZMAX, m.z + dz / n * TT_SPEED * dt));
    if (dx) m.face = dx > 0 ? 1 : -1; m.mv = 1; m.ph += dt * 9;
  } else if (m.mv === 1) m.mv = 0;
  if (m.mv === 2) {
    m.sitT += dt;
    const k = m.sitT >= TT_BOW_EVERY ? Math.floor((m.sitT - TT_BOW_EVERY) / TT_BOW_EVERY) + 1 : 0;
    if (k > m.bowK) { m.bowK = k; AU.zenBell(.55); }
  }
  for (const p of TT.peers.values()) {
    const ex = p.tx - p.x, ez = p.tz - p.z, d = Math.hypot(ex, ez);
    if (d > 6) { p.x = p.tx; p.z = p.tz; } else { const k = Math.min(1, dt * 8); p.x += ex * k; p.z += ez * k; }
    kneelStep(p); if ((p.mv === 1 || d > .12) && !p.kn) p.ph += dt * 9; if (p.mv === 2) p.sitT += dt;
  }
  TT.cam += (ttCurCam() - TT.cam) * Math.min(1, dt * 3);
  if (TT.selfKnock && TT.t - (TT.strikeT ?? -99) > 10) { TT.selfKnock = false; if (AU.zenSelf) AU.zenSelf(false); }   // 10 s without a strike: the chant's own mõ and bell come back (owner)
  if ((TT.nightT = (TT.nightT || 0) + dt) > 5) { TT.nightT = 0; const h = ttVnHour(); TT_NIGHT = TT_NIGHT_FORCE || h >= 20 || h < 6; }   // the clock checked every few seconds
  TT.zk = (TT.zk || 0) + ((TT_SAVE.wide ? 1 : 0) - (TT.zk || 0)) * Math.min(1, dt * 4);
  TT.camD += (Math.max(0, Math.min(4.4, (m.z - 7.2) * .75)) - TT.camD) * Math.min(1, dt * 2.2);   // near the Buddha the camera follows, so he and the mouse grow in the view
  if (TT.on) {                                                          // my place goes out about ten times a second, and now and then even when still
    TT.sendT -= dt; const sig = m.x.toFixed(2) + ',' + m.z.toFixed(2) + ',' + m.face + ',' + m.mv;
    if (TT.sendT <= 0 && (sig !== TT.last || TT.sendT < -2)) { TT.sendT = .1; TT.last = sig; ttSend({ t: 'move', x: +(m.x + 50).toFixed(2), y: +m.z.toFixed(2), face: m.face, mv: m.mv }); }
  }
}
/* one butterfly now and then (owner: the fixed loop of six looked repeated and ugly): it appears at a random edge of the clearing, wanders
   on a path of its own (turning by two slow random waves), stays 15 to 25 seconds, fades away; the next comes 15 to 45 seconds later */
function ttBfUpdate(dt) {
  const T = TT;
  if (!T.bf) { T.bfWait = (T.bfWait ?? 4) - dt; if (T.bfWait > 0) return;
    const r = Math.random, side = r() < .5 ? -1 : 1;
    T.bf = { x: side * (9 + r() * 2), z: 6 + r() * 9, y: .7 + r() * 1.4, hd: side < 0 ? 0 : Math.PI, t: 0, life: 15 + r() * 10, sp: .9 + r() * .6, ph: r() * 6.283, a1: .35 + r() * .4, a2: .8 + r() * .6, p1: r() * 6.283, p2: r() * 6.283, col: [['#f6f1e4', '#e8b83a'], ['#f2c640', '#c9871f'], ['#e58aa0', '#f6f1e4'], ['#8fb6e0', '#f6f1e4']][(r() * 4) | 0], sx: 0, sy: 0 };
    return; }
  const b = T.bf; b.t += dt;
  b.hd += (Math.sin(b.t * b.a1 + b.p1) * 1.3 + Math.sin(b.t * b.a2 + b.p2) * .9) * dt;
  if (Math.abs(b.x) > 10.5 || b.z < 5 || b.z > 17) { const want = Math.atan2(11 - b.z, -b.x * .7); let d = want - b.hd; d = Math.atan2(Math.sin(d), Math.cos(d)); b.hd += d * Math.min(1, dt * 1.5); }   // steered back when it strays
  const v = b.sp * (.75 + .25 * Math.sin(b.t * 1.7 + b.ph)); b.x += Math.cos(b.hd) * v * dt; b.z += Math.sin(b.hd) * v * dt; b.y = Math.max(.5, Math.min(2.8, b.y + Math.sin(b.t * .9 + b.ph) * .35 * dt));
  if (b.t > b.life) { T.bf = null; T.bfWait = 15 + Math.random() * 30; }
}
function ttButterfly(g, L, b) {
  const [x, y, s] = L.P(b.x, b.y + Math.sin(b.t * 5) * .03, b.z), bs = s * .75, fl = Math.abs(Math.sin(b.t * 11 + b.ph)) * .8 + .2, nx = x + Math.cos(b.hd) * bs * .1, ny = y + Math.sin(b.hd) * bs * .05;
  const ang = Math.atan2(y - (b.sy || y), x - (b.sx || x)); b.sx = x; b.sy = y; b.ang = (b.ang ?? ang) + Math.atan2(Math.sin(ang - (b.ang ?? ang)), Math.cos(ang - (b.ang ?? ang))) * .15;
  const a = Math.min(1, b.t / 1.5, (b.life - b.t) / 1.5);
  g.save(); g.globalAlpha = Math.max(0, a); g.translate(x, y); g.rotate(b.ang || 0);
  g.lineWidth = Math.max(1, bs * .035); g.strokeStyle = 'rgba(29,25,21,.85)'; g.lineJoin = 'round';
  for (const sd of [-1, 1]) {                                            // each side: a big fore wing and a smaller hind wing, flapping across the body
    g.save(); g.scale(1, sd);
    g.fillStyle = b.col[0]; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(bs * .14, -bs * .22 * fl, bs * .34, -bs * .3 * fl, bs * .3, -bs * .06 * fl); g.bezierCurveTo(bs * .24, bs * .02, bs * .1, bs * .02, 0, 0); g.fill(); g.stroke();
    g.fillStyle = b.col[1]; g.beginPath(); g.moveTo(-bs * .02, 0); g.bezierCurveTo(-bs * .06, -bs * .12 * fl, -bs * .22, -bs * .2 * fl, -bs * .2, -bs * .04 * fl); g.bezierCurveTo(-bs * .16, bs * .02, -bs * .06, bs * .02, -bs * .02, 0); g.fill(); g.stroke();
    g.fillStyle = 'rgba(29,25,21,.6)'; g.beginPath(); g.arc(bs * .2, -bs * .1 * fl, bs * .022, 0, 6.283); g.fill();
    g.restore();
  }
  g.fillStyle = '#2a221d'; g.beginPath(); g.ellipse(0, 0, bs * .15, bs * .026, 0, 0, 6.283); g.fill();
  g.beginPath(); g.arc(bs * .16, 0, bs * .03, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(bs * .17, 0); g.lineTo(bs * .27, -bs * .05); g.moveTo(bs * .17, 0); g.lineTo(bs * .27, bs * .05); g.stroke();
  g.restore();
}
function ttCurCam() { const W = cv.width / DPR, H = cv.height / DPR; return ttLay(W, H).cx; }

/* ---------- drawing ---------- */
function ttQuad(g, L, pts, fill, line) {
  g.beginPath(); pts.forEach(([x, y, z], i) => { const [sx, sy] = L.P(x, y, z); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath();
  g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = 1.5; g.stroke(); }
}
function ttFog(g, L, a) {
  // only round the horizon, where the far things stand: lower down the screen is the near ground (and the stream), which stays clear
  const y0 = L.hor - L.H * .5, y1 = L.hor + L.H * .06, gr = g.createLinearGradient(0, y0, 0, y1), k = (L.hor - y0) / (y1 - y0);
  gr.addColorStop(0, 'rgba(236,236,214,0)'); gr.addColorStop(k * .7, `rgba(236,236,214,${a * .8})`); gr.addColorStop(k, `rgba(236,236,214,${a})`); gr.addColorStop(1, 'rgba(236,236,214,0)');
  g.fillStyle = gr; g.fillRect(0, y0, L.W, y1 - y0);
}
// the lawn laid on the ground in perspective: the ground below the horizon is filled band by band with the lawn tile, each band scaled to
// its depth (128 tile px = 1 unit), so the grass is fine far away and fuller near; then a soft haze toward the horizon
let TT_LAWN_PAT = null;
function ttLawn(g, L) {
  const { W, H, hor, f } = L, tile = ttLawnTile(); if (!TT_LAWN_PAT) TT_LAWN_PAT = g.createPattern(tile, 'repeat');
  const pat = TT_LAWN_PAT, U = 128;
  g.fillStyle = '#5f8f48'; g.fillRect(0, hor, W, H - hor);
  for (let y = Math.ceil(hor) + 1; y < H; ) {
    const z = L.hc * f / (y - hor) + TT.camD, sc = f / Math.max(z - TT.camD, .8), bh = Math.max(1, Math.min(6, Math.round((y - hor) / 40)));
    const a = sc / U, m = new DOMMatrix([a, 0, 0, a * .35, W / 2 - TT.cam * sc, y - z * U * a * .35]);
    pat.setTransform(m); g.fillStyle = pat; g.fillRect(0, y, W, bh); y += bh;
  }
  const hz = g.createLinearGradient(0, hor, 0, hor + (H - hor) * .45); hz.addColorStop(0, 'rgba(220,226,196,.75)'); hz.addColorStop(1, 'rgba(220,226,196,0)'); g.fillStyle = hz; g.fillRect(0, hor, W, (H - hor) * .45);
}
// one row of grass: a strip of pointed blades standing on the ground at depth row.z across the whole view, dark at the foot and light at
// the tips, each tip leaning on the wind; no outline (owner)
// Each row is printed ONCE into its own canvas (owner: the grass lagged when every blade was drawn every frame), at the scale it has with
// the camera at rest, over the widest x it can ever show; each frame the strip is pasted at its depth's scale and leaned a little by the
// wind (a shear about its foot). Rebuilt only when the screen size changes.
let TT_ROWS = null;
function ttRowArt(L, row) {
  const s0 = L.f / row.z, q = isTouch ? 1 : 1.5, h0 = .08 + Math.min(.05, (14 - row.z) * .005), xmin = -(L.W / 2) / s0 - TT_XMAX - 1, xmax = -xmin;
  const W = Math.ceil((xmax - xmin) * s0 * q), top = h0 * 1.6 * s0 * q, H = Math.ceil(top + .1 * s0 * q + 2), c = mk(W, H), g = c.getContext('2d'), base = top, k = row.sh;
  for (let layer = 0; layer < 2; layer++) {
    const gap = Math.max(.05 + layer * .012, 3.5 / (s0 * q) / q), dk = layer ? 1 : .86;
    const gr = g.createLinearGradient(0, H, 0, 0);
    gr.addColorStop(0, `rgb(${(66 + k * 16) * dk | 0},${(112 + k * 22) * dk | 0},${(54 + k * 10) * dk | 0})`); gr.addColorStop(.55, `rgb(${(96 + k * 20) * dk | 0},${(146 + k * 20) * dk | 0},${(70 + k * 12) * dk | 0})`); gr.addColorStop(1, `rgb(${(146 + k * 34) * dk | 0},${(186 + k * 22) * dk | 0},${(98 + k * 18) * dk | 0})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, H);
    let x = xmin + layer * gap * .5;
    while (x < xmax) {
      const hh = Math.sin(x * 12.9898 + row.seed + layer * 7.7) * 43758.5453, u = hh - Math.floor(hh), w = gap * (.6 + u * .8), bh = h0 * (.4 + u * u * 1.1), lean = (u - .5) * .04;
      const bx = (x - xmin) * s0 * q;
      const tx = bx + (w * .5 + lean) * s0 * q, ty = base - bh * s0 * q, ww = w * s0 * q, r = ww * .08;   // a soft leaf: bulging sides, a rounded tip
      g.lineTo(bx, base + 1); g.quadraticCurveTo(bx + ww * .12, ty + (base - ty) * .4, tx - r, ty + r * .6); g.quadraticCurveTo(tx, ty - r * .4, tx + r, ty + r * .6); g.quadraticCurveTo(bx + ww * .88, ty + (base - ty) * .4, bx + ww, base + 1);
      x += w;
    }
    g.lineTo(W, H); g.closePath(); g.fill();
  }
  return { c, xmin, s0, q, base, H };
}
function ttGrassRow(g, L, row) {
  const { W, hor, P } = L, [, y, s] = P(0, 0, row.z); if (y < hor + 2) return;
  const key = L.W + 'x' + L.H; if (!TT_ROWS || TT_ROWS.key !== key) TT_ROWS = { key, m: new Map() };
  let A = TT_ROWS.m.get(row); if (!A) { A = ttRowArt(L, row); TT_ROWS.m.set(row, A); }
  const k = s / (A.s0 * A.q), x = W / 2 + (A.xmin - TT.cam) * s, sway = Math.sin(TT.t * 1.1 + row.ph) * .06;
  if (!row.gaps) {                                                         // where the water runs at this depth, overlapping spans merged (the clip is even-odd)
    const wet = x => TT_STREAM.S.some(p => Math.abs(p.z - row.z) < p.w * 1.1 + .05 && Math.hypot(p.x - x, p.z - row.z) < p.w * 1.06 + .05);   // a point of this row in the water
    row.gaps = []; let open = null;
    for (let x = -32; x <= 32; x += .08) { const w = wet(x); if (w && open === null) open = x - .04; if (!w && open !== null) { row.gaps.push([open, x]); open = null; } }
    if (open !== null) row.gaps.push([open, 32]);
  }
  g.save();
  if (row.gaps.length) { g.beginPath(); g.rect(0, y - A.H * k * 1.5, W, A.H * k * 2.5); for (const [a, b] of row.gaps) g.rect(W / 2 + (a - TT.cam) * s, y - A.H * k * 1.5, (b - a) * s, A.H * k * 2.5); g.clip('evenodd'); }
  g.translate(0, y); g.transform(1, 0, sway, 1, 0, 0); g.drawImage(A.c, x, -A.base * k, A.c.width * k, A.H * k); g.restore();
}
function ttBgGround(g, L) {
  const { W, H, hor, P } = L, S = TT.S;
  ttLawn(g, L);
  const t = TT.t;


  ttStream(g, L);
  // (no platform: the Buddha sits on a pile of rocks, drawn with him: ttSeat)
}
function ttSmoke(g, L, x, y, z) {                                       // a thread of incense smoke from the urn, rising and drifting
  const t = TT.t;
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = `rgba(245,242,230,${.3 - k * .06})`; g.lineWidth = Math.max(1, L.f / z * .035); g.beginPath();
    for (let i = 0; i <= 16; i++) { const u = i / 16, [sx, sy] = L.P(x + (k - 1) * .12 + Math.sin(t * .9 + u * 5 + k * 2) * .16 * u, y + u * 3.4, z); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
    g.stroke();
  }
}
function ttDrawMouse(g, L, o, me) {
  // kneeling: lifted onto the cushion's top
  const [sx, sy0, s] = L.P(o.x, 0, o.z), sy = sy0 - s * .07 * Math.min(1, (o.kn || 0) * 2), k = s * 1.05 / 150, sit = o.mv === 2, bow = sit ? ttBow(o.sitT) : 0, hue = ttHue(o.id);
  if (sx < -80 || sx > L.W + 80) return;
  g.fillStyle = 'rgba(20,34,20,.28)'; g.beginPath(); g.ellipse(sx, sy, s * .34, s * .1, 0, 0, 6.283); g.fill();
  g.strokeStyle = me ? 'rgba(255,214,90,.95)' : `hsl(${hue} 62% 46%)`; g.lineWidth = Math.max(1.6, s * .03); g.beginPath(); g.ellipse(sx, sy, s * .4, s * .13, 0, 0, 6.283); g.stroke();
  const M = ttRigOf(o), kn = o.kn || 0, ke = kn * kn * (3 - 2 * kn);
  const bk = Math.max(0, Math.min(1, (ke - .3) / .4));                       // kneeling turns it to face the Buddha: the side view fades into the view from behind
  const arm = TT_NIGHT ? -1 : null;
  if (bk < 1) { g.save(); g.translate(sx, sy); g.globalAlpha = 1 - bk; C4_KNEEL = ke; c4Mouse(g, M, 0, o.face, o.ph, o.mv === 1 && kn === 0, arm, null, k, 18 * k * ke, o.sort); C4_KNEEL = 0; g.restore(); }
  if (bk > 0) ttDrawBack(g, o, sx, sy, k, bow, bk);
  if (TT_NIGHT) {                                                           // a candle: in the raised hand standing, on the ground beside the cushion kneeling
    const ks = k * (C4_RIG_SZ.get(M) || 1), hx = 10 + 16 * Math.cos(arm) - 31 * Math.sin(arm), hy = -97 + 16 * Math.sin(arm) + 31 * Math.cos(arm);
    const cx = bk < .5 ? sx + o.face * ks * (hx + 4) : sx + s * .3, cy = bk < .5 ? sy + 18 * k * ke + ks * hy : sy - s * .02, ck = bk < .5 ? ks : k * .9;
    ttCandle(g, cx, cy, ck, o.ph + o.id.length);
    TT.lights.push({ k: 'nen', x: cx, y: cy - 30 * ck, r: Math.min(120 * ck, 70), ph: o.ph });
  }
  const ph = L.W < 640, fs = ph ? Math.max(8, Math.min(11, s * .19)) : Math.max(11, Math.min(16, s * .26)), ny = sy - (168 - 38 * bk) * k;      // the name over the head
  if (TT_NIGHT) { TT.lights.push({ k: 'name', x: sx, y: ny, fs, ph, txt: o.name, col: me ? '#6b4a0a' : `hsl(${hue} 70% 28%)` }); return; }   // at night the names go on after the dusk
  g.font = `700 ${fs}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = ph ? 3 : 4; g.strokeStyle = 'rgba(251,244,220,.95)'; g.strokeText(o.name, sx, ny);   // on a phone the names are smaller (owner)
  g.fillStyle = me ? '#6b4a0a' : `hsl(${hue} 70% 28%)`; g.fillText(o.name, sx, ny);
}
/* clouds far away, drifting very slowly (owner: they looked cut off; now soft, real-looking): each cumulus is a dome of round puffs, every puff
   a radial gradient that fades to nothing at its edge (no hard rim anywhere), lit white on top and shaded blue-grey toward a flat base;
   a few thin wisps higher up. Each is painted once into its own canvas with room to spare on every side. */
function ttCloudArt(r, wisp) {
  const w = wisp ? 260 + r() * 200 : 170 + r() * 190, h = wisp ? 26 + r() * 14 : 60 + r() * 45, pad = 70, W = Math.ceil(w + pad * 2), H = Math.ceil(h + pad * 2), c = mk(W, H), q = c.getContext('2d'), base = pad + h;
  const puff = (x, y, rad, a) => { const gr = q.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(.55, `rgba(255,255,255,${a * .75})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gr; q.beginPath(); q.arc(x, y, rad, 0, 6.283); q.fill(); };
  if (wisp) {
    for (let i = 0; i < 16; i++) { const u = r(), x = pad + u * w, y = pad + h * .5 + Math.sin(u * 5 + r()) * h * .25; q.save(); q.translate(x, y); q.scale(1, .28); puff(0, 0, 30 + r() * 34, .32 + r() * .2); q.restore(); }
    return { c, w: W, h: H, off: pad };
  }
  for (let i = 0; i < 30; i++) {                                           // the dome: big puffs in the middle, small ones at the ends, none below the base
    const u = r() * 2 - 1, x = pad + w / 2 + u * w / 2 * .9, top = h * (1 - u * u) * (.65 + r() * .35), rad = 22 + (1 - Math.abs(u)) * 34 + r() * 12, y = Math.min(base - rad * .55, base - top * .55);
    puff(x, y, rad, .8 + r() * .2);
  }
  q.globalCompositeOperation = 'source-atop';                               // light from above, a soft blue-grey belly
  const sh = q.createLinearGradient(0, pad, 0, base + 10); sh.addColorStop(0, 'rgba(255,253,246,.0)'); sh.addColorStop(.55, 'rgba(214,222,232,.35)'); sh.addColorStop(1, 'rgba(160,176,196,.6)');
  q.fillStyle = sh; q.fillRect(0, 0, W, H);
  q.globalCompositeOperation = 'destination-in';                            // the base fades out instead of ending on a line
  const fb = q.createLinearGradient(0, 0, 0, H); fb.addColorStop(0, '#000'); fb.addColorStop(Math.max(0, (base - 30) / H), '#000'); fb.addColorStop(Math.min(1, (base + 14) / H), 'rgba(0,0,0,0)'); q.fillStyle = fb; q.fillRect(0, 0, W, H);   // one mask: a second destination-in fill would wipe the first
  return { c, w: W, h: H, off: pad };
}
function ttClouds(g, L) {
  if (!TT.clouds) { const r = mulberry(31); TT.clouds = Array.from({ length: 9 }, (_, i) => { const wisp = i >= 6, art = ttCloudArt(r, wisp); return { ...art, v: (wisp ? 1.5 : 2.5) + r() * 3, x0: r() * 2400, y: wisp ? .04 + r() * .14 : .14 + r() * .32, a: wisp ? .7 : .75 + r() * .25, sc: .7 + r() * .5 }; }); }
  const span = L.W + 1000;
  for (const q of TT.clouds) { const w = q.w * q.sc, x = ((q.x0 + TT.t * q.v) % span) - 500, y = L.hor * q.y - q.off * q.sc; g.globalAlpha = q.a; g.drawImage(q.c, x, y, w, q.h * q.sc); }
  g.globalAlpha = 1;
}
// a lotus pot with its leaves and flowers on stems that sway, each on its own slow beat (stems: [x on the water, length, what, phase])
const TT_STEMS = [[-30, 52, 'leaf', 0], [24, 40, 'leaf', 1.7], [-10, 112, 'flower', .6], [16, 92, 'flower', 2.4], [36, 70, 'bud', 4.1], [-38, 82, 'bud', 3.2], [4, 60, 'leaf', 5]];
function ttLotusPot(g, A, x, y, sc, sd) {
  const t = TT.t;
  g.save(); g.translate(x, y); g.scale(sc * sd, sc);
  dp(g, A.pot, 0, 0);
  for (const [bx, len, kind, ph] of TT_STEMS) {
    const an = Math.sin(t * .55 + ph) * .07 + Math.sin(t * .23 + ph * 2) * .04, tx = bx + Math.sin(an) * len, ty = -60 - Math.cos(an) * len;
    g.strokeStyle = '#2e5e44'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, -60); g.quadraticCurveTo(bx + Math.sin(an) * len * .3, -60 - len * .55, tx, ty); g.stroke();
    dp(g, kind === 'leaf' ? A.lotusLeaf : kind === 'bud' ? A.lotusBud : A.lotusFlower, tx, ty, an * (kind === 'leaf' ? .5 : 1));
  }
  g.restore();
}
/* the rock under the Buddha and the mist round it: 'back' = the rock and the mist behind it (drawn before him), 'front' = mist drifting low
   across the rock's foot and the lowest petals (after him). The mist is slow soft puffs, never still */
function ttSeat(g, L, part) {
  const A = ttArt(), t = TT.t, [x, y, s] = L.P(0, 0, TT_SZ), sc = s / 100 * (TT_SY / 1.6);
  const puff = (wx, wy, wz, r, a) => { const [px, py, ps] = L.P(wx, wy, wz), R = r * ps; const gr = g.createRadialGradient(px, py, 0, px, py, R); gr.addColorStop(0, `rgba(246,246,238,${a})`); gr.addColorStop(1, 'rgba(246,246,238,0)'); g.fillStyle = gr; g.fillRect(px - R, py - R, R * 2, R * 2); };
  if (part === 'back') {
    for (let i = 0; i < 9; i++) { const u = i / 8, dx = Math.sin(t * .05 + i * 2.1) * 1.2; puff(-9 + u * 18 + dx, .9 + Math.sin(t * .2 + i) * .3, TT_SZ + 1.2, 3.2 + (i % 3) * .8, .32); }
    for (const pt of A.seat) dp(g, pt, x, y, 0, sc, sc);
  } else {
    for (let i = 0; i < 12; i++) { const u = ((i / 12) + t * .006 * (i % 2 ? 1 : -1) + 1) % 1, wx = -10 + u * 20, wy = .25 + (i % 3) * .3 + Math.sin(t * .3 + i) * .12; puff(wx, wy, TT_SZ - 1.4 + (i % 4) * .4, 1.6 + (i % 3) * .7, .14 + (i % 2) * .06); }
  }
}
function renderTT() {
  const W = cv.width / DPR, Hf = cv.height / DPR; let g = ctx; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (!TT.ready) { g.fillStyle = '#b9c9b0'; g.fillRect(0, 0, W, Hf); return; }
  const L = ttLay(W, Hf), { hor, P } = L, A = ttArt(), S = TT.S, t = TT.t;
  TT.lights = [];
  // the wide view on a phone was slow (owner: "nhìn toàn cảnh lag quá"): there the camera stands still, so the far layer (sky, clouds,
  // ground, stream, everything from z TT_FAR back: bamboo, rocks, the Buddha, the mist) is painted into TT.far a few times a second and
  // only copied in between; the near things (mice, lanterns, grass, cushions, urn, petals) are drawn every frame
  const FC = TT.far || (TT.far = { c: document.createElement('canvas'), key: '', at: -9 }), useFar = (TT.zk || 0) > .99 && !TT_NIGHT;
  const key = [cv.width, cv.height, TT.cam.toFixed(2), TT.camD.toFixed(2)].join(), fresh = useFar && FC.key === key && t - FC.at < .2;
  const back = () => { g.drawImage(ttBack(Math.round(W), Math.round(hor + 4), hor), 0, 0, W, hor + 4); ttClouds(g, L); ttBgGround(g, L); };
  if (useFar && !fresh) { if (FC.c.width !== cv.width || FC.c.height !== cv.height) { FC.c.width = cv.width; FC.c.height = cv.height; } g = FC.c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); FC.key = key; FC.at = t; }
  if (!fresh) back();
  // everything standing, far to near
  const items = [];
  for (const q of S.trees) items.push({ z: q.z, d: () => { const [x, y, s] = P(q.x, 0, q.z), part = (q.k ? A.bamboo.truc : A.bamboo.tre)[q.v], sc = s * q.h / 480; if (x < -260 * sc || x > W + 260 * sc) return;
    g.fillStyle = 'rgba(20,40,24,.22)'; g.beginPath(); g.ellipse(x, y, sc * 90, sc * 18, 0, 0, 6.283); g.fill(); dp(g, part, x, y, Math.sin(t * .3 + q.ph) * .016 + Math.sin(t * .13 + q.ph * 2) * .008, sc * q.f, sc); } });
  for (const q of S.rocks) items.push({ z: q.z, d: () => { const [x, y, s] = P(q.x, 0, q.z), sc = s * q.h / 70; if (x < -90 * sc || x > W + 90 * sc) return; dp(g, A.rock[q.v], x, y, 0, sc * q.f, sc); } });
  items.push({ z: TT_SZ + .3, d: () => ttSeat(g, L, 'back') });
  items.push({ z: TT_SZ - .9, d: () => ttSeat(g, L, 'front') });
  items.push({ z: TT_SZ, d: () => { const [x, y, s] = P(0, TT_SY, TT_SZ), sc = s * TT_SH / 440;                  // the Buddha, a soft glow behind him
    const gl = g.createRadialGradient(x, y - sc * 250, 10, x, y - sc * 250, sc * 330); gl.addColorStop(0, 'rgba(255,240,180,.5)'); gl.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = gl; g.fillRect(x - sc * 340, y - sc * 590, sc * 680, sc * 680);
    const cx0 = x, cy0 = y - sc * 300, R0 = Math.max(L.W, L.H) * 1.1;                                             // faint rays spreading from him, hardly more than a hint
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const an = -Math.PI * 1.02 + i / 15 * Math.PI * 1.04 + Math.sin(t * .05 + i) * .03, w0 = .035 + (i % 3) * .018, a0 = (.04 + .03 * Math.sin(t * .35 + i * 1.7)) * (i % 2 ? .8 : 1);
      const gr = g.createRadialGradient(cx0, cy0, sc * 60, cx0, cy0, R0); gr.addColorStop(0, `rgba(255,236,170,${a0})`); gr.addColorStop(1, 'rgba(255,236,170,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx0, cy0); g.lineTo(cx0 + Math.cos(an - w0) * R0, cy0 + Math.sin(an - w0) * R0); g.lineTo(cx0 + Math.cos(an + w0) * R0, cy0 + Math.sin(an + w0) * R0); g.closePath(); g.fill();
    }
    g.restore();
    for (const pt of A.buddha) dp(g, pt, x, y, 0, sc, sc); } });
  for (const sd of [-1, 1]) {
    items.push({ z: 15.25, d: () => { const [x, y, s] = P(sd * 5.9, 0, 15.25); ttLotusPot(g, A, x, y, s * 1.7 / 150, sd); } });
  }
  items.push({ z: TT_URN.z, d: () => { const [x, y, s] = P(0, 0, TT_URN.z), sc = s * 2.5 / 180; dp(g, A.urn, x, y, 0, sc, sc); ttSticks(g, x, y, sc); } });
  items.push({ z: TT_SIGN.z - .5, d: () => { const [x, y, s] = P(TT_SIGN.x, 0, TT_SIGN.z), sc = s * 2.2 / 190; dp(g, A.board, x, y, 0, sc, sc); } });
  ttHoaItems(items, ctx, L);
  for (const row of S.rows) if (row.z - TT.camD > 1.3) items.push({ z: row.z, d: () => ttGrassRow(g, L, row) });
  const all = [TT.me, ...TT.peers.values()];
  for (const o of all) items.push({ z: o.z + .001 - ((o.kn || 0) > .15 ? .14 : 0), d: () => ttDrawMouse(g, L, o, o === TT.me) });   // kneeling: drawn after its cushion, so it sits on it
  if (TT.bf) items.push({ z: TT.bf.z, d: () => ttButterfly(g, L, TT.bf) });
  // cushions go on the ground first (under the players); then the sorted things, with mist between the far layers
  // a cushion rests on the grass: drawn a little above the ground, over the blades just in front of it
  for (const c of S.cush) items.push({ z: c.z - .12, d: () => { const [x, y, s] = P(c.x, .05, c.z), sc = s * .95 / 76; g.fillStyle = 'rgba(30,40,24,.25)'; g.beginPath(); g.ellipse(x + 2, y + 3, s * .45, s * .12, 0, 0, 6.283); g.fill(); dp(g, A.cushion, x, y, 0, sc, sc); } });
  items.sort((a, b) => b.z - a.z);
  const fogs = [[38, .6], [29, .38], [22, .22]], late = []; let fi = 0, far = useFar;
  const endFar = () => {                                                    // the far layer is done: finish its mist, copy it, draw the lanterns that floated in it, go on live
    far = false; if (!fresh) while (fi < fogs.length) { ttFog(g, L, fogs[fi][1]); fi++; } fi = fogs.length;
    g = ctx; ctx.drawImage(FC.c, 0, 0, W, Hf); for (const it of late) it.d();
  };
  for (const it of items) {
    if (it.z - TT.camD < 1.3) continue;
    if (far && it.z < TT_FAR) endFar();
    if (far && it.live) { late.push(it); continue; }
    if (far && fresh) continue;
    while (fi < fogs.length && it.z < fogs[fi][0]) { ttFog(g, L, fogs[fi][1]); fi++; } it.d();
  }
  if (far) endFar();
  // light through the trees, falling petals, a vignette
  if (TT_NIGHT) ttNight(g, L);
  for (const q of TT_NIGHT ? [] : S.shafts) {
    const x0 = L.W * q.x, a = .05 + .035 * Math.sin(t * .4 + q.ph), gr = g.createLinearGradient(x0, 0, x0 - L.W * .12, hor + L.H * .3); gr.addColorStop(0, `rgba(255,246,206,${a * 2})`); gr.addColorStop(1, 'rgba(255,246,206,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + L.W * q.w, 0); g.lineTo(x0 + L.W * q.w - L.W * .22, hor + L.H * .3); g.lineTo(x0 - L.W * .12, hor + L.H * .3); g.closePath(); g.fill();
  }
  for (const q of S.petals) {                                                                                // golden leaves drifting down, tumbling as they come
    const u = ((t * .03 * q.sp + q.ph) % 1), wy = 10.5 - u * 11, wx = q.x + Math.sin(t * .8 * q.sp + q.ph * 20) * 1.1 + u * 1.8, [x, y, s] = P(wx, wy, q.z);
    if (x < -30 || x > W + 30 || y > Hf + 20) continue;
    const L2 = s * .06, fl = Math.abs(Math.cos(t * 2.2 * q.sp + q.rot)) * .8 + .2;
    g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.6 * q.sp + q.rot) * 1.1 + q.rot * .1); g.scale(1, fl); g.globalAlpha = .34 * (u > .93 ? (1 - u) / .07 : u < .06 ? u / .06 : 1);
    g.fillStyle = q.col; g.strokeStyle = 'rgba(110,64,10,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-L2, 0); g.quadraticCurveTo(0, -L2 * .62, L2, 0); g.quadraticCurveTo(0, L2 * .62, -L2, 0); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-L2, 0); g.lineTo(L2 * .8, 0); g.stroke(); g.restore();
  }
  const vg = g.createRadialGradient(W / 2, Hf * .5, Math.min(W, Hf) * .35, W / 2, Hf * .5, Math.max(W, Hf) * .75); vg.addColorStop(0, 'rgba(20,40,30,0)'); vg.addColorStop(1, 'rgba(20,40,30,.3)'); g.fillStyle = vg; g.fillRect(0, 0, W, Hf);
  if (TT.light) { ttLightDraw(g, W, Hf); return; }
  ttHud(g, W, Hf);
}

/* ---------- the buttons (canvas, like the other places) ---------- */
function ttTag(g, cx, cy, text, o = {}) {
  const size = o.size || 14; g.font = `${o.weight || 700} ${size}px "Be Vietnam Pro", sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + (o.pad || 22), h = o.h || size + 16, x = Math.round(o.left ? cx : cx - w / 2), y = Math.round(cy - h / 2), r = Math.min(12, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.save(); g.translate(2, 3); g.fill(); g.restore();
  g.fillStyle = o.fill || '#f4ead0'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke();
  g.fillStyle = o.ink || INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + w / 2, y + h / 2 + 1);
  return [x, y, w, h];
}
// the numbers in the top right (owner 2026-10-29: "đã có xx người ghé thăm, xx que nhang được thắp, xx hoa đăng được thả"): visitors and sticks
// from the Worker (ttinfo: visitors, all), lanterns = the newest lantern's id in Supabase (ids count every lantern ever set afloat, here and in Phố Huyện)
const TT_VIS_ADD = 100;                                                    // added to the visitors shown (owner 2026-10-29: "+ 100 cho số người ghé thăm"); the Worker's own count is unchanged
function ttStats(g, W, y0) {
  const f = v => v == null ? '…' : Math.round(v).toLocaleString('vi-VN'), hoa = Math.max(0, ...(TT.hoa || []).map(w => +w.id || 0)) || null;
  const lines = [lgf('Đã có {n} người ghé thăm', '{n} have visited', { n: f(TT.visitors == null ? null : TT.visitors + TT_VIS_ADD) }), lgf('{n} que nhang được thắp', '{n} incense sticks lit', { n: f(TT.incAll || null) }), lgf('{n} hoa đăng được thả', '{n} lanterns set afloat', { n: f(hoa) })];
  const fs = W < 640 ? 11 : 12, lh = fs + 5; g.font = `700 ${fs}px "Be Vietnam Pro", sans-serif`;
  const w = Math.ceil(Math.max(...lines.map(l => g.measureText(l).width))) + 20, h = lines.length * lh + 10, x = W - 10 - w;
  g.fillStyle = 'rgba(244,234,208,.82)'; g.strokeStyle = 'rgba(29,25,21,.55)'; g.lineWidth = 1.4; g.beginPath(); g.roundRect ? g.roundRect(x, y0, w, h, 9) : g.rect(x, y0, w, h); g.fill(); g.stroke();
  g.fillStyle = '#3a2a1a'; g.textAlign = 'right'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, W - 20, y0 + 5 + lh * (i + .5)));
}
// the mõ and the chuông gia trì (owner 2026-10-29: "làm thêm cái mõ và cái chuông gia trì, khi người chơi chạm vào thì tiếng mõ và tiếng chuông
// tắt đi để người chơi tự gõ"): the first touch stops the chant's own knocks and bell (AU.zenSelf) for as long as the player stays; each touch
// then strikes it (AU.zenKnock / AU.zenBell): the fish nods, the bell sends out rings
function ttCushionAt(g, x, y, k) {
  g.fillStyle = 'rgba(30,40,24,.28)'; g.beginPath(); g.ellipse(x + 2 * k, y + 3 * k, 46 * k, 11 * k, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(0, y - 16 * k, 0, y + 4 * k); gr.addColorStop(0, '#c8432f'); gr.addColorStop(1, '#7c1f16');
  g.fillStyle = gr; g.strokeStyle = '#2a1712'; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(x, y - 6 * k, 42 * k, 12 * k, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(232,184,58,.85)'; g.lineWidth = 1.4 * k; g.beginPath(); g.ellipse(x, y - 8 * k, 32 * k, 7 * k, 0, 0, 6.283); g.stroke();
}
function ttDrawMo(g, x, y, k) {
  const hit = TT.t - (TT.moT ?? -9), nod = hit < .35 ? Math.sin(hit / .35 * Math.PI) * .08 : 0;
  ttCushionAt(g, x, y, k);
  g.save(); g.translate(x, y - 14 * k); g.rotate(-nod);
  const gr = g.createRadialGradient(-12 * k, -34 * k, 4 * k, 0, -22 * k, 44 * k); gr.addColorStop(0, '#c0542f'); gr.addColorStop(.6, '#8a2a18'); gr.addColorStop(1, '#4e140c');
  g.fillStyle = gr; g.strokeStyle = '#1d1915'; g.lineWidth = 2 * k;
  g.beginPath(); g.ellipse(0, -22 * k, 36 * k, 25 * k, 0, 0, 6.283); g.fill(); g.stroke();       // the round body
  g.fillStyle = '#1d1915'; g.beginPath(); g.ellipse(4 * k, -14 * k, 22 * k, 3.2 * k, -.05, 0, 6.283); g.fill();   // the slit mouth
  g.strokeStyle = 'rgba(232,184,58,.9)'; g.lineWidth = 1.5 * k;                                   // gold carving: scales and an eye
  for (const [a, r] of [[-2.5, 18], [-2.1, 24], [-1.7, 28]]) { g.beginPath(); g.arc(-6 * k, -18 * k, r * k, a, a + .9); g.stroke(); }
  g.beginPath(); g.arc(20 * k, -30 * k, 4 * k, 0, 6.283); g.stroke();
  g.fillStyle = 'rgba(255,230,190,.35)'; g.beginPath(); g.ellipse(-12 * k, -36 * k, 12 * k, 5 * k, -.4, 0, 6.283); g.fill();
  g.restore();
  g.save(); g.translate(x + 30 * k, y - 8 * k); g.rotate(-.9 + (hit < .25 ? -.5 * (1 - hit / .25) : 0));   // the mallet
  g.fillStyle = '#6b4520'; g.strokeStyle = '#1d1915'; g.lineWidth = 1.4 * k; g.fillRect(-2 * k, -40 * k, 4 * k, 40 * k); g.strokeRect(-2 * k, -40 * k, 4 * k, 40 * k);
  g.beginPath(); g.ellipse(0, -44 * k, 7 * k, 6 * k, 0, 0, 6.283); g.fillStyle = '#c99a52'; g.fill(); g.stroke(); g.restore();
}
function ttDrawChuong(g, x, y, k) {
  const hit = TT.t - (TT.bellT ?? -9);
  ttCushionAt(g, x, y, k);
  const by = y - 14 * k, gr = g.createLinearGradient(x - 34 * k, 0, x + 34 * k, 0); gr.addColorStop(0, '#7a5418'); gr.addColorStop(.35, '#e8c25e'); gr.addColorStop(.6, '#b8862e'); gr.addColorStop(1, '#5e3f10');
  g.fillStyle = gr; g.strokeStyle = '#1d1915'; g.lineWidth = 2 * k;
  g.beginPath(); g.moveTo(x - 34 * k, by - 40 * k); g.bezierCurveTo(x - 34 * k, by + 2 * k, x + 34 * k, by + 2 * k, x + 34 * k, by - 40 * k); g.closePath(); g.fill(); g.stroke();   // the bowl
  g.fillStyle = '#3a2808'; g.beginPath(); g.ellipse(x, by - 40 * k, 34 * k, 7 * k, 0, 0, 6.283); g.fill(); g.stroke();             // the dark inside
  g.strokeStyle = '#f6dc8a'; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(x, by - 40 * k, 31 * k, 5.5 * k, 0, Math.PI * .05, Math.PI * .95); g.stroke();   // the rim's light
  g.strokeStyle = 'rgba(90,60,10,.7)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(x - 30 * k, by - 28 * k); g.quadraticCurveTo(x, by - 22 * k, x + 30 * k, by - 28 * k); g.stroke();
  g.save(); g.translate(x - 40 * k, y - 6 * k); g.rotate(.5); g.fillStyle = '#6b4520'; g.strokeStyle = '#1d1915'; g.lineWidth = 1.4 * k; g.fillRect(-3 * k, -36 * k, 6 * k, 36 * k); g.strokeRect(-3 * k, -36 * k, 6 * k, 36 * k); g.restore();   // the striker
  if (hit < 2.4) for (let i = 0; i < 3; i++) {                                                   // rings going out from the bowl while it sings
    const u = hit / 2.4 - i * .12; if (u <= 0 || u >= 1) continue;
    g.strokeStyle = `rgba(255,226,140,${(1 - u) * .7})`; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(x, by - 30 * k, (40 + u * 90) * k, (14 + u * 30) * k, 0, 0, 6.283); g.stroke();
  }
}
function ttStrike(which) {
  TT.strikeT = TT.t;
  if (!TT.selfKnock) { TT.selfKnock = true; if (AU.zenSelf) AU.zenSelf(true); if (!TT.toldSelf) { TT.toldSelf = true; toast(lg('Tiếng mõ, tiếng chuông giờ là của bạn. Chạm để gõ.', 'The fish and the bell are yours now. Tap to strike them.'), 3); } }
  if (which === 'mo') { TT.moT = TT.t; if (AU.zenKnock) AU.zenKnock(); /* louder than the chant's own knock (owner) */ } else { TT.bellT = TT.t; AU.zenBell(1); }
}
// ---------- the evening (on trial) ----------
// a candle in the woodblock style: a cream stick with a drip, a small flame that flickers
function ttCandle(g, x, y, k, ph) {
  const t = TT.t, fl = 1 + Math.sin(t * 13 + ph * 7) * .08 + Math.sin(t * 7.3 + ph) * .06;
  g.fillStyle = '#f3e6c4'; g.strokeStyle = '#1d1915'; g.lineWidth = 1.2 * k; g.beginPath(); g.rect(x - 4 * k, y - 26 * k, 8 * k, 26 * k); g.fill(); g.stroke();
  g.fillStyle = '#e9d6a6'; g.beginPath(); g.ellipse(x, y - 26 * k, 4 * k, 1.6 * k, 0, 0, 6.283); g.fill();
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(x, y - 26 * k); g.lineTo(x, y - 29 * k); g.stroke();
  const fy = y - 30 * k, fh = 12 * k * fl, gr = g.createLinearGradient(0, fy, 0, fy - fh); gr.addColorStop(0, '#ff9a2a'); gr.addColorStop(.5, '#ffd25a'); gr.addColorStop(1, '#fff6d0');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - 3.2 * k, fy); g.quadraticCurveTo(x - 3.6 * k, fy - fh * .6, x + Math.sin(t * 5 + ph) * k, fy - fh); g.quadraticCurveTo(x + 3.6 * k, fy - fh * .6, x + 3.2 * k, fy); g.closePath(); g.fill();
}
function ttGlow(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.35, `rgba(${col},${a * .35})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function ttNight(g, L) {
  const { W, H, hor, P } = L, t = TT.t;
  // dusk blue over everything, deeper in the sky
  // the dusk is a tint laid over the scene (multiply), with soft holes where light falls: the Buddha himself (he shines, owner: "phật cũng
  // phải sáng lên"), the urn, every candle and lantern, so what stands near them is lit too
  const TC = TT.tint || (TT.tint = document.createElement('canvas')); if (TC.width !== cv.width || TC.height !== cv.height) { TC.width = cv.width; TC.height = cv.height; }
  const q = TC.getContext('2d'); q.setTransform(DPR, 0, 0, DPR, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, W, H);
  const sky = q.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1d2a52'); sky.addColorStop(Math.min(.95, hor / H + .02), '#33406a'); sky.addColorStop(1, '#2c3a5c');
  q.fillStyle = sky; q.fillRect(0, 0, W, H);
  q.globalCompositeOperation = 'destination-out';
  const hole = (x, y, rx, ry, a) => { q.save(); q.translate(x, y); q.scale(1, ry / rx); const gr = q.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(.55, `rgba(0,0,0,${a * .75})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(-rx, -rx, rx * 2, rx * 2); q.restore(); };
  const [bx, by, bs] = P(0, TT_SY, TT_SZ), bsc = bs * TT_SH / 440, breath = 1 + .03 * Math.sin(t * .6);
  hole(bx, by - bsc * 200, bsc * 300 * breath, bsc * 380 * breath, .97);                // the Buddha, halo to throne
  { const [x, y, s] = P(0, 0, TT_URN.z), sc = s * 2.5 / 180; hole(x, y - 90 * sc, 120 * sc, 90 * sc, .45); }
  for (const l of TT.lights) {
    if (l.k === 'nen') hole(l.x, l.y + 10, l.r * 1.1, l.r * .9, .5 * (.9 + .1 * Math.sin(t * 9 + l.ph * 5)));
    else if (l.k === 'hoa') hole(l.x, l.y, l.w * 1.2, l.w * .7, .45 * l.a);
  }
  g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(TC, 0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  // stars and a thin moon in the sky
  const S = TT.stars || (TT.stars = Array.from({ length: 90 }, (_, i) => ({ x: (Math.sin(i * 91.7) * .5 + .5), y: (Math.sin(i * 37.3) * .5 + .5), r: .6 + (i % 5) * .25, ph: i })));
  for (const q of S) { const y = q.y * hor * .8; g.fillStyle = `rgba(255,250,225,${.35 + .3 * Math.sin(t * 1.3 + q.ph)})`; g.beginPath(); g.arc(q.x * W, y, q.r, 0, 6.283); g.fill(); }
  { const mx = W * .72, my = hor * .36, mr = Math.min(W, H) * .028; ttGlow(g, mx, my, mr * 6, '255,240,200', .2); const R = Math.ceil(mr) + 2, mc = TT.moon && TT.moon.width === R * 2 ? TT.moon : (TT.moon = (() => { const c = document.createElement('canvas'); c.width = c.height = R * 2; const q = c.getContext('2d'); q.fillStyle = 'rgba(255,246,214,.95)'; q.beginPath(); q.arc(R, R, mr, 0, 6.283); q.fill(); q.globalCompositeOperation = 'destination-out'; q.beginPath(); q.arc(R + mr * .5, R - mr * .22, mr * .9, 0, 6.283); q.fill(); return c; })());
    g.drawImage(mc, mx - R, my - R); }   // a crescent
  // the Buddha's halo stays softly lit
  { const sc = bsc, cx = bx, cy = by - sc * 300;                                 // the aura: a golden glow round the halo and slow turning rays
    ttGlow(g, cx, cy, sc * 380 * breath, '255,214,120', .42); ttGlow(g, cx, cy, sc * 210, '255,236,170', .3); ttGlow(g, bx, by - sc * 120, sc * 300, '255,200,110', .16);
    g.strokeStyle = `rgba(255,226,140,${.35 + .1 * Math.sin(t * .8)})`; g.lineWidth = Math.max(1.5, sc * 5); g.beginPath(); g.arc(cx, cy, sc * 175, 0, 6.283); g.stroke();
    const R0 = sc * 520;
    for (let i = 0; i < 18; i++) {
      const an = i / 18 * 6.283 + t * .03, w0 = .05 + (i % 3) * .02, a0 = .1 + .06 * Math.sin(t * .5 + i * 1.7);
      const gr = g.createRadialGradient(cx, cy, sc * 150, cx, cy, R0); gr.addColorStop(0, `rgba(255,230,160,${a0})`); gr.addColorStop(1, 'rgba(255,230,160,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an - w0) * R0, cy + Math.sin(an - w0) * R0); g.lineTo(cx + Math.cos(an + w0) * R0, cy + Math.sin(an + w0) * R0); g.closePath(); g.fill();
    } }
  // the urn's sticks
  { const [x, y, s] = P(0, 0, TT_URN.z), sc = s * 2.5 / 180; ttGlow(g, x, y - 120 * sc, 90 * sc, '255,150,70', .35); }
  // candles and lanterns
  for (const l of TT.lights) {
    if (l.k === 'nen') { const f = .85 + .15 * Math.sin(t * 9 + l.ph * 5); ttGlow(g, l.x, l.y, l.r * f, '255,190,90', .7); ttGlow(g, l.x, l.y, l.r * .25 * f, '255,236,170', .8); }
    else if (l.k === 'hoa') { const f = .8 + .2 * Math.sin(t * 2.2 + l.ph * 3) + .08 * Math.sin(t * 9 + l.ph); ttGlow(g, l.x, l.y - l.w * .2, l.w * 1.3 * f, '255,196,110', .55 * l.a); ttGlow(g, l.x, l.y + l.w * .05, l.w * .9, '255,170,90', .22 * l.a); }
  }
  g.restore();
  // the lanterns themselves drawn again over the dusk, so they glow (lung linh)
  for (const l of TT.lights) if (l.k === 'hoa') {
    g.save(); g.globalAlpha = l.a * (.85 + .15 * Math.sin(t * 2.2 + l.ph * 3)); g.translate(l.x, l.y); g.rotate(l.rot); g.drawImage(l.img, -l.w / 2, -l.w * .55, l.w, l.w * .75); g.restore();
  }
  for (const l of TT.lights) if (l.k === 'name') {
    g.font = `700 ${l.fs}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = l.ph ? 3 : 4;
    g.strokeStyle = 'rgba(251,244,220,.85)'; g.strokeText(l.txt, l.x, l.y); g.fillStyle = l.col; g.fillText(l.txt, l.x, l.y);
  }
  // fireflies: wandering little lights over the grass and among the bamboo, blinking slowly
  const F = TT.ff || (TT.ff = Array.from({ length: 46 }, (_, i) => ({ x: (Math.random() - .5) * 22, y: .3 + Math.random() * 2.4, z: 3.6 + Math.random() * 14, vx: 0, vy: 0, vz: 0, ph: Math.random() * 6.283, sp: .5 + Math.random() * .6 })));
  const dt = Math.min(.05, t - (TT.ffT ?? t)); TT.ffT = t;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of F) {
    f.vx += (Math.sin(t * .7 * f.sp + f.ph) * .6 - f.vx) * dt; f.vy += (Math.cos(t * .9 * f.sp + f.ph * 2) * .25 - f.vy) * dt; f.vz += (Math.sin(t * .5 * f.sp + f.ph * 3) * .4 - f.vz) * dt;
    f.x += f.vx * dt; f.y = Math.max(.15, Math.min(3.2, f.y + f.vy * dt)); f.z = Math.max(3.4, Math.min(18, f.z + f.vz * dt)); if (Math.abs(f.x) > 12) f.x *= -.95;
    if (f.z - TT.camD < 1.3) continue;
    const [x, y, s] = P(f.x, f.y, f.z), b = Math.max(0, Math.sin(t * 1.4 * f.sp + f.ph)) ** 2; if (b < .02 || x < -20 || x > W + 20) continue;
    const r = Math.max(2.5, s * .05); ttGlow(g, x, y, r * 6, '200,255,120', .5 * b); g.fillStyle = `rgba(240,255,190,${.9 * b})`; g.beginPath(); g.arc(x, y, r * .55, 0, 6.283); g.fill();
  }
  g.restore();
}
function ttHud(g, W, H) {
  const st = safeTop(), hud = TT.hud = [], m = TT.me, sit = m.mv === 2;
  const back = ttTag(g, 34, st + 28, '←', { size: 20, pad: 14, h: 40 }); hud.push({ r: back, f: () => showChapters() });
  const n = ttCount(), label = '● ' + lgf('{n} người đang thiền định', '{n} meditating', { n });
  const cnt = ttTag(g, W / 2, st + 28, label, { size: 13, fill: '#e3efd4' });
  const ren = ttTag(g, 14, st + 72, lg('✎ Đổi tên', '✎ Rename'), { size: 12, h: 28, pad: 14, fill: '#f2ecde', left: true }); hud.push({ r: ren, f: ttRename });   // as in Ghép Tranh
  if (H > W * 1.15) { const z = ttTag(g, 34, st + 116, TT_SAVE.wide ? '+' : '−', { size: 22, pad: 14, h: 40 }); hud.push({ r: z, f: () => { TT_SAVE.wide = !TT_SAVE.wide; ttPersist(); } }); }   // zoom: − the whole clearing, + close again
  ttStats(g, W, W < 640 ? st + 54 : st + 8);
  const by = H - 46 - (W > 640 ? 8 : 0);
  // the mõ and the chuông gia trì right in front of the player, above the Ngồi thiền button (owner): a tap strikes them
  { const k = W < 640 ? 1.5 : 1.875, oy = by - 38, dx = W < 640 ? 108 : 150;   // ×1.5 (owner)
    ttDrawMo(g, W / 2 - dx, oy, k); hud.push({ r: [W / 2 - dx - 48 * k, oy - 70 * k, 96 * k, 82 * k], f: () => ttStrike('mo') });
    ttDrawChuong(g, W / 2 + dx, oy, k); hud.push({ r: [W / 2 + dx - 48 * k, oy - 70 * k, 96 * k, 82 * k], f: () => ttStrike('chuong') }); }
  const btn = ttTag(g, W / 2, by, sit ? lg('Đứng dậy', 'Stand up') : lg('Ngồi thiền', 'Sit'), { size: 17, h: 48, pad: 52, fill: sit ? '#f7e3a4' : '#d9e6c0' }); hud.push({ r: btn, f: () => ttSit(!sit) });
  if (sit) { const s = Math.floor(m.sitT), tx = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); ttTag(g, W / 2, by - 40, tx, { size: 12, h: 26, pad: 18, fill: 'rgba(244,234,208,.85)' }); }
}
// rename, the same bar as Ghép Tranh's (owner: "cho nút đổi tên giống bên ghép tranh"): a strip across the top on a phone (the keyboard comes up
// under it), across the bottom on a computer; it edits the one name of the game (Hồ sơ, dcc.hoso), bad words refused, pushed to the server
let TT_REN_EL = null;
function ttRenameClose() { if (TT_REN_EL) { TT_REN_EL.remove(); TT_REN_EL = null; cv.focus(); } }
function ttRename() {
  if (TT_REN_EL) { ttRenameClose(); return; }
  const el = document.createElement('div'), touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window), max = HS_NAME_MAX, cur = TT.me.name;
  el.style.cssText = 'position:fixed;left:0;right:0;' + (touch ? 'top:0;border-bottom:2px solid #1d1915;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;' : 'bottom:0;border-top:2px solid #1d1915;padding:8px 10px;') + 'z-index:60;background:#f2ecde;display:flex;gap:8px;align-items:center;font-family:inherit';
  el.innerHTML = '<input id="ttRenIn" type="text" maxlength="' + max + '" autocomplete="off" placeholder="' + lg('Tên mới (tối đa ' + max + ' chữ)', 'New name (up to ' + max + ' letters)') + '" style="flex:1;min-width:0;font-size:16px;padding:9px 11px;border:2px solid #1d1915;background:#fbf6ea;border-radius:6px"><button id="ttRenOk" style="font-size:15px;padding:9px 14px;border:2px solid #1d1915;background:#e9b9ae;border-radius:6px;font-weight:700">' + lg('Lưu', 'Save') + '</button><button id="ttRenNo" style="font-size:15px;padding:9px 12px;border:2px solid #1d1915;background:#f2ecde;border-radius:6px">' + lg('Thôi', 'Cancel') + '</button>';
  document.body.appendChild(el); TT_REN_EL = el;
  const inp = el.querySelector('#ttRenIn'); inp.value = cur; inp.focus(); inp.select();
  const save = () => {
    const v = inp.value.replace(/\s+/g, ' ').trim().slice(0, max);
    if (v.length < 2) { toast(lg('Tên phải có ít nhất 2 chữ.', 'A name needs at least 2 letters.'), 2.4); return; }
    if (typeof p4HoaBad === 'function' && p4HoaBad(v)) { toast(lg('Tên có chữ không đẹp, chọn tên khác nhé.', 'That name has a bad word, pick another.'), 2.8); return; }
    const old = hsGet('dcc.hoso', {}) || {}, d = hsClean({ ...hsMine(), name: v });
    hsSet('dcc.hoso', { ...d, id: old.id, shop: undefined, stats: undefined }); if (typeof HS_FACE !== 'undefined') HS_FACE.clear();
    try { hsPush().catch(() => {}); } catch (e) {} try { if (typeof c4RankSend === 'function') c4RankSend(); } catch (e) {}
    TT.me.name = TT_SAVE.name = v; ttPersist(); ttSend({ t: 'hello', id: TT.me.id, name: v, look: TT.me.look, friends: [] }); TT.last = '';
    ttRenameClose(); toast(lg('Đã đổi tên thành ' + v + ' ở mọi nơi', 'Renamed to ' + v + ' everywhere'), 2.8);
  };
  el.querySelector('#ttRenOk').addEventListener('click', save); el.querySelector('#ttRenNo').addEventListener('click', ttRenameClose);
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') save(); else if (e.key === 'Escape') ttRenameClose(); }); inp.addEventListener('keyup', e => e.stopPropagation());
}

/* ---------- input ---------- */
function ttKey(e) {
  if (!TT.ready) return;
  if (e.code === 'Escape') { if (TT.light) { TT.light = null; return; } showChapters(); return; }
  if (TT.light) return;
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) ttSit(TT.me.mv !== 2); return; }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) { e.preventDefault(); TT.keys.add(e.code); }
}
addEventListener('keyup', e => TT.keys.delete(e.code)); addEventListener('blur', () => TT.keys.clear());
function ttDown(e) {
  if (!TT.ready) return;
  if (TT.light) {                                                           // the close view: ← leaves, anything else takes hold of the stick
    const r0 = cv.getBoundingClientRect(), x0 = e.clientX - r0.left, y0 = e.clientY - r0.top, b = TT.light.back;
    if (b && x0 >= b[0] && x0 <= b[0] + b[2] && y0 >= b[1] && y0 <= b[1] + b[3]) { TT.light = null; return; }
    capturePointer(e); ttLightGrab(x0, y0); return;
  }
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  for (const h of TT.hud) if (x >= h.r[0] && x <= h.r[0] + h.r[2] && y >= h.r[1] && y <= h.r[1] + h.r[3]) { h.f(); return; }
  const W = cv.width / DPR, H = cv.height / DPR, L = ttLay(W, H), m = TT.me, [sx, sy, s] = L.P(m.x, 0, m.z);
  if (Math.abs(x - sx) < s * .5 && y > sy - s * 1.15 && y < sy + s * .2) { ttSit(m.mv !== 2); return; }            // tap yourself: sit or stand
  { const [ux, uy, us] = L.P(0, 0, TT_URN.z), sc = us * 2.5 / 180; if (Math.abs(x - ux) < 70 * sc && y < uy + 8 && y > uy - 175 * sc) { ttIncense(); return; } }   // the urn: light incense
  if (TT.hold && ttHoaDrop(L, x, y)) return;                              // holding a lantern: a tap on the stream sets it down
  { const [bx, by, bs] = L.P(TT_SIGN.x, 0, TT_SIGN.z), sc = bs * 2.2 / 190; if (Math.abs(x - bx) < 74 * sc && y < by + 6 && y > by - 186 * sc) { ttHoaOpen(); return; } }   // the sign: set one afloat
  for (const h of TT.hoaHit || []) if (Math.hypot(x - h.x, y - h.y) < h.r) { ttHoaRead(h.w); return; }   // a lantern: read its wish
  const q = ttInv(L, x, y); if (!q) return;
  m.tx = Math.max(-TT_XMAX, Math.min(TT_XMAX, q[0])); m.tz = Math.max(TT_ZMIN, Math.min(TT_ZMAX, q[1]));
}

registerChapter({
  id: 12, modes: ['ttplay'], direct: startTT, card: TT_CARD,
  progress: () => ttOnlineText() || lg('Yên tĩnh', 'Peaceful'),
  hasProgress: () => false,
  hide: ttHide, update: updateTT, render: renderTT, key: ttKey,
  pointer: { down: ttDown, move(e) { if (!TT.light) return; const r = cv.getBoundingClientRect(); ttLightMove(e.clientX - r.left, e.clientY - r.top); }, up() { if (TT.light) ttLightDrop(); } },
  next: startTT, retry: startTT,
});
