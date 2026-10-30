/* Góc Tĩnh Tâm (owner 2026-10-29: a place to practise and sit quietly, not a chapter). One shared clearing among mountains and
   forest: a huge gilded Buddha (Phật Như Lai) on a lotus throne at the far end of a stone platform, cushions on the grass, and
   every player a mouse with their name over its head. You walk (arrow keys / WASD, or tap the ground) and sit (the button, Space,
   or a tap on yourself); after 10 s of sitting the mouse bows with joined hands, and again every 10 s. A chant ("Nam mô A Di Đà
   Phật") on a wooden fish plays the whole time (AU.zenStart in audio.js). The same Worker as the village hosts the room
   (/tt/ws; worker/src/index.js gives it an object of its own), so everyone sees everyone and the card in the picker says how many
   are there. Nothing is said or written: no chat, no hints, as the owner asked for quiet.
   World: x across (0 = the middle), z away from the camera, y up. The camera hangs TT_HC above the ground looking down the clearing
   (the monkey bridge's way of 2.5D: woodblock sprites standing on a perspective ground, the far scenery fading into mist). */
const TT_URN = { z: 10.6 };                                                 // the incense urn, on the near bank of the stream (owner)
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
  TT.me = { id, name: TT_SAVE.name, look: ttLook(), x: 0, z: 6.6, face: 1, mv: 0, ph: 0, sitT: 0, tx: null, tz: null, sort: ttSortOf(id), bowK: 0 };
  Object.assign(TT, { ready: true, t: 0, peers: new Map(), keys: new Set(), closing: false, tries: 0, cam: 0, camD: 0, chirp: 3 });
  AU.zenStart(); ttConnect(); ttHoaLoad(); cv.focus();
}
function ttHide() { ttHoaClose(); AU.zenStop(); AU.ambient({}); ttLeave(); TT.keys.clear(); }
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
      TT.incAll = m.all || 0; TT.inc = m.incense || 0; TT.incTs = Array.isArray(m.ts) ? m.ts : []; TT.incPos = Array.isArray(m.pos) ? m.pos : TT.incTs.map(() => null); TT.lit = !!m.lit || TT_SAVE.litDay === ttDay(); break;
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
  if (bk < 1) { g.save(); g.translate(sx, sy); g.globalAlpha = 1 - bk; C4_KNEEL = ke; c4Mouse(g, M, 0, o.face, o.ph, o.mv === 1 && kn === 0, null, null, k, 18 * k * ke, o.sort); C4_KNEEL = 0; g.restore(); }
  if (bk > 0) ttDrawBack(g, o, sx, sy, k, bow, bk);
  const fs = Math.max(11, Math.min(16, s * .26)), ny = sy - (168 - 38 * bk) * k;      // the name over the head
  g.font = `700 ${fs}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(251,244,220,.95)'; g.strokeText(o.name, sx, ny);
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
  // the wide view on a phone was slow (owner: "nhìn toàn cảnh lag quá"): there the camera stands still, so the far layer (sky, clouds,
  // ground, stream, everything from z TT_FAR back: bamboo, rocks, the Buddha, the mist) is painted into TT.far a few times a second and
  // only copied in between; the near things (mice, lanterns, grass, cushions, urn, petals) are drawn every frame
  const FC = TT.far || (TT.far = { c: document.createElement('canvas'), key: '', at: -9 }), useFar = (TT.zk || 0) > .99;
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
  for (const q of S.shafts) {
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
  const w = Math.ceil(g.measureText(text).width) + (o.pad || 22), h = o.h || size + 16, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2), r = Math.min(12, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.save(); g.translate(2, 3); g.fill(); g.restore();
  g.fillStyle = o.fill || '#f4ead0'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke();
  g.fillStyle = o.ink || INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + w / 2, y + h / 2 + 1);
  return [x, y, w, h];
}
function ttHud(g, W, H) {
  const st = safeTop(), hud = TT.hud = [], m = TT.me, sit = m.mv === 2;
  const back = ttTag(g, 34, st + 28, '←', { size: 20, pad: 14, h: 40 }); hud.push({ r: back, f: () => showChapters() });
  const n = ttCount(), label = '● ' + lgf('{n} người đang tĩnh tâm', '{n} sitting quietly', { n });
  const cnt = ttTag(g, W / 2, st + 28, label, { size: 13, fill: '#e3efd4' });
  if (H > W * 1.15) { const z = ttTag(g, W - 34, st + 28, TT_SAVE.wide ? '+' : '−', { size: 22, pad: 14, h: 40 }); hud.push({ r: z, f: () => { TT_SAVE.wide = !TT_SAVE.wide; ttPersist(); } }); }   // zoom: − the whole clearing, + close again
  const by = H - 46 - (W > 640 ? 8 : 0);
  const btn = ttTag(g, W / 2, by, sit ? lg('Đứng dậy', 'Stand up') : lg('Ngồi thiền', 'Sit'), { size: 17, h: 48, pad: 52, fill: sit ? '#f7e3a4' : '#d9e6c0' }); hud.push({ r: btn, f: () => ttSit(!sit) });
  if (sit) { const s = Math.floor(m.sitT), tx = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); ttTag(g, W / 2, by - 44, tx, { size: 12, h: 26, pad: 18, fill: 'rgba(244,234,208,.85)' }); }
}
function ttRename() {                                                   // a small box in the page (prompt() does not work everywhere, e.g. inside the Claude viewer)
  if (document.getElementById('ttName')) return;
  const box = document.createElement('div'), inp = document.createElement('input'), ok = document.createElement('button');
  box.id = 'ttName'; box.style.cssText = 'position:fixed;left:50%;top:calc(70px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:40;display:flex;gap:6px;padding:8px;background:#f4ead0;border:2.4px solid #1d1915;border-radius:12px;font:700 14px "Be Vietnam Pro",sans-serif';
  inp.maxLength = HS_NAME_MAX; inp.value = TT.me.name; inp.style.cssText = 'width:min(200px,50vw);padding:6px 8px;border:2px solid #1d1915;border-radius:8px;background:#fff;font:700 14px "Be Vietnam Pro",sans-serif';
  ok.textContent = lg('Lưu', 'Save'); ok.style.cssText = 'padding:6px 12px;border:2.4px solid #1d1915;border-radius:8px;background:#d9e6c0;font:800 14px "Be Vietnam Pro",sans-serif';
  const done = save => { const n = inp.value.trim().slice(0, HS_NAME_MAX); box.remove(); cv.focus(); if (!save || n.length < 2) return; hsSet('dcc.hoso', hsClean({ ...hsMine(), name: n })); TT.me.name = TT_SAVE.name = n; ttPersist(); ttSend({ t: 'hello', id: TT.me.id, name: n, look: TT.me.look, friends: [] }); TT.last = ''; };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') done(true); else if (e.key === 'Escape') done(false); }); inp.addEventListener('keyup', e => e.stopPropagation());
  ok.addEventListener('click', () => done(true)); box.append(inp, ok); document.body.appendChild(box); inp.focus(); inp.select();
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
