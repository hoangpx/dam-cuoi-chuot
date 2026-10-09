/* Chương VIII · Gom Ba Mở Lối 三 — the chapter shell and the picture of a level. The rules are in engine.js, the levels in
   levels.js, the prints in art.js. Everything is drawn on the main canvas (CSS pixels, below the notch); the mouse is walked
   with ← → / A D and Space / ↑ / W (on phones with the three buttons #c8pad), things are gathered by dragging a finger or the
   mouse over 3 or more neighbouring ones of a kind. Saves: SAVE8 { done[], scrolls[], best[] seconds } in 'dcc.c8'. */
let SAVE8 = { done: [], scrolls: [], best: [] };
try { const s = JSON.parse(localStorage.getItem('dcc.c8') || 'null'); if (s && Array.isArray(s.done)) SAVE8 = Object.assign(SAVE8, s); } catch (e) {}
const persist8 = () => { try { localStorage.setItem('dcc.c8', JSON.stringify(SAVE8)); } catch (e) {} };
const C8 = { hist: [], i: 0, G: null, view: null, cam: { x: 0, y: 0 }, fx: [], drag: false, ptr: null, keys: new Set(), pad: { l: false, r: false, jump: false }, t: 0, idle: 0, moved: false, jumped: false, gathered: false, ui: null, over: null };
const c8Clock = t => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(Math.floor(t % 60)).padStart(2, '0');
const c8Name = L => lg(L.name, L.en);

function buildAlbum8() {
  const box = $('#cards'); box.textContent = '';
  const h = document.createElement('div'); h.className = 'sec'; h.textContent = lg('Lối mòn qua làng', 'The trail through the village'); box.appendChild(h);
  C8_LEVELS.forEach((L, i) => {
    const open = i === 0 || SAVE8.done[i - 1] || SAVE8.done[i] || /[?&]c8all/.test(location.search);
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = ['#e9dcc0', '#d9e6c9', '#e6d3c9', '#d3dbe6', '#e4d6ea'][i % 5]; b.disabled = !open;
    const n = (L.map.join('').match(/S/g) || []).length;
    b.innerHTML = `<div class="num">${lg('Màn', 'Level')} ${i + 1}</div><div class="ch">三</div><b>${c8Name(L)}</b><span class="st${SAVE8.done[i] ? ' done' : ''}">${SAVE8.done[i] ? lg('Đã qua', 'Done') + ' · ' + c8Clock(SAVE8.best[i] || 0) + (n ? ` · ${SAVE8.scrolls[i] || 0}/${n}` : '') : open ? lg('Chơi', 'Play') : lg('Chưa mở', 'Locked')}</span>`;
    b.addEventListener('click', () => { if (open) startC8(i); });
    box.appendChild(b);
  });
}
function startC8(i) {
  trackEnter(`chuong-8/man-${i + 1}`);
  AU.init(); AU.setSong(11); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 8; S.mode = 'c8play'; C8.i = i;
  PAPER = getPaper('white'); document.documentElement.style.setProperty('--paper', PAPERS.white.css);
  for (const id of ['#album', '#end', '#title', '#chapters', '#hud', '#abil', '#pad']) $(id).hidden = true;
  $('#c8pad').hidden = !isTouch;
  c8Art(); c8Reset();
}
function c8Reset() {
  C8.hist = []; C8.G = c8New(C8_LEVELS[C8.i]); C8.fx = []; C8.drag = false; C8.ptr = null; C8.over = null; C8.t = 0; C8.idle = 0; C8.shake = 0; C8.flash = 0; C8.view = null;
  C8.moved = C8.moved && C8.i > 0; C8.jumped = C8.jumped && C8.i > 0; C8.gathered = C8.gathered && C8.i > 0;
  C8.keys.clear(); C8.pad.l = C8.pad.r = C8.pad.jump = false;
}
// undo (the reference has Z): a copy of the whole level before every gathering
const c8Snap = G => { const s = structuredClone(G); s.sel = []; s.events = []; return s; };
function c8Undo() { if (!C8.hist.length || C8.over) return; C8.G = C8.hist.pop(); C8.G.state = 'play'; C8.G.winT = 0; C8.drag = false; C8.ptr = null; C8.keys.clear(); AU.tap(); }
function c8Close() { C8.G = null; $('#c8pad').hidden = true; showAlbum(8); }
function c8Next() { if (C8.i + 1 < C8_LEVELS.length) startC8(C8.i + 1); else c8Close(); }

/* ---------- layout: where the level sits on the screen ---------- */
function c8Layout() {
  const G = C8.G, W = cv.width / DPR, H = cv.height / DPR - safeTop();
  const top = 56, bot = isTouch ? 104 : 14, availW = W - 16, availH = H - top - bot;
  let cs = Math.min(availW / G.W, availH / G.H); cs = Math.max(isTouch ? 38 : 44, Math.min(cs, 84));
  const lw = G.W * cs, lh = G.H * cs;
  C8.view = { W, H, top, bot, cs, lw, lh, scrollX: lw > availW + 1, scrollY: lh > availH + 1, availW, availH };
  return C8.view;
}
function c8Cam(dt) {
  const G = C8.G, v = C8.view, c = C8.cam, px = G.p.x * v.cs, py = (G.p.y - .4) * v.cs;
  const tx = v.scrollX ? Math.max(0, Math.min(v.lw - v.W, px - v.W / 2)) : -(v.W - v.lw) / 2;
  const ty = v.scrollY ? Math.max(0, Math.min(v.lh - v.availH, py - v.availH / 2)) - v.top : -(v.top + (v.availH - v.lh) / 2);
  if (!C8.camInit || C8.camLevel !== C8.i) { c.x = tx; c.y = ty; C8.camInit = true; C8.camLevel = C8.i; } else { const k = Math.min(1, dt * 6); c.x += (tx - c.x) * k; c.y += (ty - c.y) * k; }
}
const c8Pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top - safeTop()]; };
const c8Cell = (x, y) => { const v = C8.view, G = C8.G; return [Math.floor((x + C8.cam.x) / v.cs), Math.floor((y + C8.cam.y) / v.cs)]; };

/* ---------- input ---------- */
function c8Hud() {                                       // the buttons on the top bar
  const W = cv.width / DPR, r = 21;
  return { back: [28, 28, r], redo: [W - 28, 28, r], undo: [W - 78, 28, r] };
}
const c8In = (b, x, y) => Math.hypot(x - b[0], y - b[1]) <= b[2] + 6;
function c8Down(e) {
  if (S.mode !== 'c8play' || !C8.G || !C8.view) return;
  const [x, y] = c8Pos(e), h = c8Hud(); capturePointer(e);
  if (C8.over) { c8OverTap(x, y); return; }
  if (c8In(h.back, x, y)) { AU.tap(); c8Close(); return; }
  if (c8In(h.redo, x, y)) { AU.tap(); c8Reset(); return; }
  if (c8In(h.undo, x, y)) { c8Undo(); return; }
  if (C8.G.state !== 'play') return;
  C8.drag = true; C8.ptr = [x, y]; c8Touch(x, y, true);
}
function c8Move(e) { if (!C8.drag || !C8.G) return; const [x, y] = c8Pos(e), a = C8.ptr; C8.ptr = [x, y]; const n = Math.max(1, Math.ceil(Math.hypot(x - a[0], y - a[1]) / (C8.view.cs * .3))); for (let k = 1; k <= n; k++) c8Touch(a[0] + (x - a[0]) * k / n, a[1] + (y - a[1]) * k / n, false); }
function c8Up() { if (!C8.drag || !C8.G) return; C8.drag = false; const G = C8.G, n = G.sel.length, snap = n >= 3 ? c8Snap(G) : null, r = c8Let(G); if (r === 'gone' && snap) { C8.hist.push(snap); if (C8.hist.length > 60) C8.hist.shift(); } if (r === 'gone') { C8.gathered = true; AU.stamp(); c8Evt(); } else if (r === 'few') { AU.tap(); C8.shake = .25; } C8.ptr = null; }
function c8Touch(x, y) {
  const G = C8.G, [cx, cy] = c8Cell(x, y); if (cx < 0 || cy < 0 || cx >= G.W || cy >= G.H) return;
  // only count the middle of a cell so a finger crossing a corner does not grab the next one
  const v = C8.view, fx = (x + C8.cam.x) / v.cs - cx - .5, fy = (y + C8.cam.y) / v.cs - cy - .5; if (Math.hypot(fx, fy) > .62) return;
  const r = c8Reach(G, cy * G.W + cx);
  if (r === 'start' || r === 'add') AU.pluck(72 + Math.min(12, G.sel.length) * 2); else if (r === 'back') AU.tap();
}
function c8Key(e) {
  if (S.mode !== 'c8play') return;
  if (e.code === 'Escape') { c8Close(); return; }
  if (e.code === 'KeyR') { c8Reset(); return; }
  if (e.code === 'KeyZ') { c8Undo(); return; }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(e.code)) e.preventDefault();
  if (C8.over && (e.code === 'Enter' || e.code === 'Space')) { c8OverTap(-1, -1, true); return; }
  C8.keys.add(e.code);
}
addEventListener('keyup', e => C8.keys.delete(e.code));
addEventListener('blur', () => { C8.keys.clear(); C8.pad.l = C8.pad.r = C8.pad.jump = false; });
for (const [id, k] of [['bL8', 'l'], ['bR8', 'r'], ['bJ8', 'jump']]) {
  const el = document.getElementById(id); if (!el) continue;
  el.addEventListener('pointerdown', e => { e.preventDefault(); C8.pad[k] = true; capturePointer(e, el); });
  const up = () => { C8.pad[k] = false; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
function c8Input() {
  const K = C8.keys, P = C8.pad;
  return { l: K.has('ArrowLeft') || K.has('KeyA') || P.l, r: K.has('ArrowRight') || K.has('KeyD') || P.r, jump: K.has('ArrowUp') || K.has('Space') || K.has('KeyW') || P.jump };
}

/* ---------- the frame ---------- */
function updateC8(dt) {
  const G = C8.G; if (!G) return; C8.t += dt;
  const inp = c8Input(); if (inp.l || inp.r) C8.moved = true; if (inp.jump) C8.jumped = true;
  if (G.state === 'play') C8.idle = (inp.l || inp.r || inp.jump || G.sel.length) ? 0 : C8.idle + dt; else C8.idle = 0;
  c8Tick(G, dt, inp); c8Evt(); c8Heat(G, dt); c8Fx(dt);
  C8.shake = Math.max(0, (C8.shake || 0) - dt);
  if (G.state === 'dead' && G.winT > .4) { c8Respawn(G); C8.keys.clear(); C8.pad.l = C8.pad.r = C8.pad.jump = false; for (let k = 0; k < 10; k++) C8.fx.push({ x: G.p.x, y: G.p.y - .4, vx: (Math.random() - .5) * 4, vy: -1 - Math.random() * 3, t: 0, life: .6, c: ['#f2c640', '#f2ecde'][k % 2], s: .08 }); return; }
  if (G.state === 'win' && !C8.over && G.winT > .9) c8Won();
  if (C8.view) c8Cam(dt);
}
function c8Evt() {
  const G = C8.G, v = C8.view; if (!v) { G.events.length = 0; return; }
  for (const e of G.events.splice(0)) {
    if (e === 'jump') AU.tap();
    else if (e === 'thud') AU.click();
    else if (e === 'win') { AU.kenCall(); for (let k = 0; k < 24; k++) C8.fx.push({ x: G.goal.x + .5, y: G.goal.y + .5, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 4, t: 0, life: 1.1 + Math.random() * .6, c: ['#f2c640', '#a3332a', '#2f6a4c', '#f2ecde'][k % 4], s: .09 + Math.random() * .08 }); }
    else if (e === 'dead') { AU.snort(); C8.flash = .6; }
    else if (e.gone !== undefined) { const x = e.gone % G.W + .5, y = ((e.gone / G.W) | 0) + .5, col = { a: '#a3332a', b: '#f2c640', c: '#2f6a4c', d: '#5b2f1f', i: '#4aa8d8', v: '#6fb3e8' }[e.ch]; for (let k = 0; k < 9; k++) C8.fx.push({ x, y, vx: (Math.random() - .5) * 5, vy: -1 - Math.random() * 4, t: 0, life: .7 + Math.random() * .4, c: k % 3 === 0 ? '#e8923a' : col, s: .06 + Math.random() * .07 }); }
    else if (e.melt !== undefined) { AU.pluck(66); AU.pluck(79); const x = e.melt % G.W + .5, y = ((e.melt / G.W) | 0) + .5; for (let k = 0; k < 14; k++) C8.fx.push({ x, y, vx: (Math.random() - .5) * 5, vy: -1 - Math.random() * 3, t: 0, life: .7 + Math.random() * .4, c: ['#d97b2a', '#f2c640', '#6fb3e8'][k % 3], s: .07 + Math.random() * .05 }); }
    else if (e.scroll !== undefined) { AU.pluck(88); AU.pluck(95); const x = e.scroll % G.W + .5, y = ((e.scroll / G.W) | 0) + .5; for (let k = 0; k < 10; k++) C8.fx.push({ x, y, vx: (Math.random() - .5) * 4, vy: -1 - Math.random() * 3, t: 0, life: .8, c: '#f2c640', s: .07 }); }
  }
}
// while a swipe of 3 or more flames is held, the ice right ahead of its last step is what will melt (engine c8Let): the flames lean and blaze towards it, the ice drips (owner)
function c8MeltAim(G) {
  const s = G.sel; if (s.length < 3 || G.cells[s[0]] !== 'a') return null;
  const e = s[s.length - 1], p = s[s.length - 2], W = G.W, ex = e % W, ey = (e / W) | 0, dx = ex - (p % W), dy = ey - ((p / W) | 0), ax = ex + dx, ay = ey + dy;
  if (ax < 0 || ax >= W || ay < 0 || ay >= G.H) return null; const i = ay * W + ax; if (G.cells[i] !== 'i') return null;
  return { i, dx, dy, ang: Math.atan2(dx, -dy) };
}
function c8Heat(G, dt) {                                      // sparks of fire flying at the ice, drops falling off it
  const mt = c8MeltAim(G); if (!mt || G.state !== 'play') { C8.heat = 0; return; }
  C8.heat = (C8.heat || 0) + dt; const e = G.sel[G.sel.length - 1], ex = e % G.W + .5, ey = ((e / G.W) | 0) + .5;
  while (C8.heat > .03) { C8.heat -= .03; C8.fx.push({ x: ex + mt.dx * .3 + (Math.random() - .5) * .3, y: ey + mt.dy * .3 + (Math.random() - .5) * .3, vx: mt.dx * (2.4 + Math.random() * 2.2) + (Math.random() - .5) * 1.4, vy: mt.dy * (2.4 + Math.random() * 2.2) + (Math.random() - .5) * 1.4 - .4, t: 0, life: .26 + Math.random() * .22, c: ['#d97b2a', '#f2c640', '#a3332a'][(Math.random() * 3) | 0], s: .1 + Math.random() * .09, grav: -2 }); }
  if (Math.random() < dt * 14) C8.fx.push({ x: mt.i % G.W + .5 + (Math.random() - .5) * .6, y: ((mt.i / G.W) | 0) + .88, vx: (Math.random() - .5) * .3, vy: .4, t: 0, life: .55, c: '#6fb3e8', s: .06, grav: 20 });
}
function c8Fx(dt) { for (const f of C8.fx) { f.t += dt; f.vy += (f.grav === undefined ? 14 : f.grav) * dt; f.x += f.vx * dt; f.y += f.vy * dt; } C8.fx = C8.fx.filter(f => f.t < f.life); }
function c8Won() {
  const G = C8.G, i = C8.i; trackWin(); const first = !SAVE8.done[i];
  SAVE8.done[i] = true; if (!SAVE8.best[i] || G.time < SAVE8.best[i]) SAVE8.best[i] = Math.round(G.time);
  if (G.got > (SAVE8.scrolls[i] || 0)) SAVE8.scrolls[i] = G.got; persist8();
  C8.over = { t: 0, first };
}
function c8OverGeo() { const v = C8.view, W = v.W, H = v.H, pw = Math.min(W - 32, 360), ph = 230, x = (W - pw) / 2, y = Math.max(70, (H - ph) / 2 - 10); const bw = (pw - 48) / 2; return { x, y, pw, ph, next: [x + 16, y + ph - 64, bw, 46], again: [x + 32 + bw, y + ph - 64, bw, 46] }; }
function c8OverTap(x, y, key) {
  const o = c8OverGeo(), hit = b => x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3];
  if (key || hit(o.next)) { AU.tap(); c8Next(); } else if (hit(o.again)) { AU.tap(); c8Reset(); }
}

/* ---------- drawing ---------- */
function renderC8() {
  const W = cv.width / DPR, Hh = cv.height / DPR;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPERS.white.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (let px = 0; px < W; px += PAPER.width) ctx.drawImage(PAPER, px, 0, PAPER.width, Math.max(Hh, PAPER.height));
  const G = C8.G; if (!G) return;
  const st = safeTop(); ctx.save(); ctx.translate(0, st);
  const v = c8Layout(); if (!C8.camInit || C8.camLevel !== C8.i) c8Cam(0);
  c8Bamboo(ctx, v);
  c8DrawWorld(ctx, G, v);
  c8DrawHud(ctx, G, v);
  c8Howto(ctx, G, v);
  if (C8.flash > 0) { ctx.fillStyle = `rgba(163,51,42,${Math.min(.45, C8.flash)})`; ctx.fillRect(0, 0, v.W, v.H); C8.flash -= .016; }
  if (C8.over) c8DrawOver(ctx, G, v);
  ctx.restore();
}
function c8DrawWorld(g, G, v) {
  const A = c8Art(), cs = v.cs, k = cs / 64, cx = C8.cam.x, cy = C8.cam.y, W = G.W, H = G.H;
  const sx = (C8.shake > 0 ? Math.sin(C8.t * 90) * 3 * C8.shake : 0);
  g.save(); g.translate(-cx + sx, -cy);
  const at = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? '#' : G.cells[y * W + x];
  // earth
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G.cells[y * W + x] === '#') {
    g.drawImage(A.earth[(x * 7 + y * 3) % 3].c, x * cs, y * cs, cs + .5, cs + .5);
    if (at(x, y - 1) !== '#') g.drawImage(A.grass.c, x * cs - 2 * k, y * cs - 5 * k, 68 * k, 18 * k);
    g.strokeStyle = INK; g.lineWidth = Math.max(2, cs * .05); g.lineCap = 'round'; g.beginPath();
    if (at(x, y - 1) !== '#') { g.moveTo(x * cs, y * cs); g.lineTo((x + 1) * cs, y * cs); }
    if (at(x, y + 1) !== '#') { g.moveTo(x * cs, (y + 1) * cs); g.lineTo((x + 1) * cs, (y + 1) * cs); }
    if (at(x - 1, y) !== '#') { g.moveTo(x * cs, y * cs); g.lineTo(x * cs, (y + 1) * cs); }
    if (at(x + 1, y) !== '#') { g.moveTo((x + 1) * cs, y * cs); g.lineTo((x + 1) * cs, (y + 1) * cs); }
    g.stroke();
  }
  // water: a pale blue veil with a lighter surface
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G.water[y * W + x]) { g.fillStyle = 'rgba(120,180,235,.42)'; g.fillRect(x * cs, y * cs, cs + .5, cs + .5); if (!G.water[(y - 1) * W + x]) { g.fillStyle = 'rgba(235,248,255,.7)'; g.fillRect(x * cs, y * cs, cs + .5, Math.max(2, cs * .06)); } }
  // start gate and chest
  const sp = C8_LEVELS[C8.i] && c8StartCell(); if (sp) g.drawImage(A.start.c, sp.x * cs, sp.y * cs, cs, cs);
  const gl = .55 + .25 * Math.sin(C8.t * 3), gx = (G.goal.x + .5) * cs, gy = (G.goal.y + .5) * cs;
  const gr = g.createRadialGradient(gx, gy, cs * .2, gx, gy, cs * 1.5); gr.addColorStop(0, `rgba(242,198,64,${gl})`); gr.addColorStop(1, 'rgba(242,198,64,0)'); g.fillStyle = gr; g.fillRect(gx - cs * 1.6, gy - cs * 1.6, cs * 3.2, cs * 3.2);
  g.drawImage(A.goal.c, G.goal.x * cs, G.goal.y * cs, cs, cs);
  // pegs, thorns, scrolls
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = G.cells[y * W + x], X = x * cs, Y = y * cs;
    if (ch === 'o') { const vs = G.vis[y * W + x]; c8Peg(g, X + cs / 2, Y + cs / 2 + (vs ? vs.oy : 0) * cs, cs); }
    else if (ch === 'x') c8Thorn(g, X, Y, cs, at(x, y - 1) !== 'x', x, y);
    else if (ch === 'S') { const b = Math.sin(C8.t * 3 + x) * cs * .05; g.drawImage(A.scroll.c, X + cs * .15, Y + cs * .12 + b, cs * .7, cs * .7); }
  }
  // things (a falling one is drawn between its cells)
  const sel = new Set(G.sel), mt = c8MeltAim(G);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, ch = G.cells[i]; if (!C8_KINDS.includes(ch)) continue;
    const vs = G.vis[i], oy = vs ? vs.oy : 0, on = sel.has(i), pulse = on ? 1 + .05 * Math.sin(C8.t * 14) : 1, aimed = mt && i === mt.i, blaze = mt && on && ch === 'a';
    g.save(); g.translate((x + .5) * cs, (y + .5 + oy) * cs);
    if (blaze) { const fl = 1 + .1 * Math.sin(C8.t * 31 + i * 1.7) + .06 * Math.sin(C8.t * 47 + i); g.rotate(mt.ang * .9 + Math.sin(C8.t * 22 + i) * .09); g.scale(pulse * 1.06 * fl, pulse * 1.22 * fl); g.shadowColor = 'rgba(255,140,40,.95)'; g.shadowBlur = cs * .6; }
    else { g.scale(pulse, pulse); if (on) { g.shadowColor = 'rgba(255,250,220,.95)'; g.shadowBlur = cs * .35; } }
    if (aimed) { g.translate(Math.sin(C8.t * 34) * cs * .012, 0); g.scale(1, 1 - .05 * (.5 + .5 * Math.sin(C8.t * 9))); }
    if (C8_SOFT.includes(ch)) g.globalAlpha = .88; g.drawImage(A[ch].c, -cs / 2, -cs / 2, cs, cs);
    if (aimed) {                                                // the ice starts to melt: a wet sheen and drops sliding off it
      const k = .5 + .5 * Math.sin(C8.t * 9); g.shadowBlur = 0; g.globalAlpha = .16 + .2 * k; g.fillStyle = '#8ccbe8'; g.beginPath(); g.arc(0, 0, cs * .38, 0, 6.283); g.fill(); g.globalAlpha = 1;
      for (let d = 0; d < 3; d++) { const ph = (C8.t * 1.4 + d * .37) % 1; g.fillStyle = '#3d86c6'; g.beginPath(); g.ellipse((d - 1) * cs * .22, cs * .34 + ph * cs * .28, cs * .04, cs * .065 * (1 + ph * .5), 0, 0, 6.283); g.fill(); }
    }
    g.restore();
  }
  // the chain being drawn
  if (G.sel.length) {
    const pts = G.sel.map(i => [(i % W + .5) * cs, (((i / W) | 0) + .5) * cs]);
    g.lineCap = g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = cs * .2; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.stroke();
    g.strokeStyle = G.sel.length >= 3 ? '#f2c640' : '#f2ecde'; g.lineWidth = cs * .12; g.stroke();
    const e = pts[pts.length - 1], r = cs * .27; g.fillStyle = INK; g.beginPath(); g.arc(e[0], e[1] - cs * .62, r + 2, 0, 6.283); g.fill();
    g.fillStyle = G.sel.length >= 3 ? '#f2c640' : '#f2ecde'; g.beginPath(); g.arc(e[0], e[1] - cs * .62, r, 0, 6.283); g.fill();
    g.fillStyle = INK; g.font = `900 ${r * 1.3}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(G.sel.length, e[0], e[1] - cs * .62 + 1);
  }
  c8Mouse(g, G, cs);
  for (const f of C8.fx) { g.globalAlpha = Math.max(0, 1 - f.t / f.life); g.fillStyle = f.c; g.fillRect((f.x - f.s / 2) * cs, (f.y - f.s / 2) * cs, f.s * cs, f.s * cs); }
  g.globalAlpha = 1; g.restore();
}
function c8Bamboo(g, v) {                                  // far bamboo, pale, drifting slower than the level
  const A = c8Art(), s = v.H / 250; g.globalAlpha = .17;
  for (let n = 0; n < 9; n++) { const span = v.W + 240, x = (((n * 197 + 60 - C8.cam.x * (.25 + (n % 3) * .08)) % span) + span) % span - 120; dp(g, A.bamboo, x, v.H + 10, 0, s * (.8 + (n % 3) * .2), s * (.8 + (n % 3) * .2)); }
  g.globalAlpha = 1;
}
function c8StartCell() { const L = C8_LEVELS[C8.i]; for (let y = 0; y < L.map.length; y++) { const x = L.map[y].indexOf('P'); if (x >= 0) return { x, y }; } return null; }
function c8Peg(g, x, y, cs) {
  g.save(); g.globalAlpha = .45; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, cs * .03); g.setLineDash([cs * .07, cs * .06]);
  g.beginPath(); g.arc(x, y, cs * .17, 0, 6.283); g.stroke(); g.setLineDash([]);
  g.beginPath(); for (let a = 0; a < 12; a += .25) { const r = cs * .015 * a; g.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3); } g.stroke(); g.restore();
}
function c8Thorn(g, X, Y, cs, top, cx, cy) {
  g.fillStyle = '#4aa8d8'; g.fillRect(X, Y + (top ? cs * .2 : 0), cs, cs * (top ? .8 : 1));
  if (top) { g.beginPath(); g.moveTo(X, Y + cs * .25); const n = 5; for (let k = 0; k < n; k++) { g.lineTo(X + (k + .5) * cs / n, Y + cs * .02 + Math.sin(C8.t * 4 + cx + k) * cs * .02); g.lineTo(X + (k + 1) * cs / n, Y + cs * .25); } g.lineTo(X + cs, Y + cs * .4); g.lineTo(X, Y + cs * .4); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = Math.max(1.6, cs * .03); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 2; k++) { const t = (C8.t * .6 + k * .5 + cx * .3) % 1; g.beginPath(); g.arc(X + cs * (.3 + .4 * k), Y + cs * (.95 - t * .6), cs * .05, 0, 6.283); g.fill(); }
}
function c8Mouse(g, G, cs) {
  const A = c8Art(), p = G.p, k = cs / 64 * 1.18, dead = G.state === 'dead';
  let pose = 'idle'; if (!p.on) pose = p.vy < -1 ? 'jump' : 'fall'; else if (Math.abs(p.vx) > .1) pose = Math.floor(p.t * 7) % 2 ? 'walk0' : 'walk1';
  const sp = A.m[pose]; g.save(); g.translate(p.x * cs, p.y * cs + 1); if (dead) g.rotate(Math.min(1.4, G.winT * 4)); if (G.state === 'win') g.translate(0, -Math.abs(Math.sin(G.winT * 9)) * cs * .25);
  g.scale(p.face < 0 ? -k : k, k); g.drawImage(sp.c, sp.x0 - 24, sp.y0 - 46, sp.w, sp.h); g.restore();
}
function c8DrawHud(g, G, v) {
  const h = c8Hud(), W = v.W; g.textBaseline = 'middle';
  const btn = (b, draw) => { g.fillStyle = '#fbf7ee'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = INK; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round'; draw(b[0], b[1]); };
  btn(h.back, (x, y) => { g.beginPath(); g.moveTo(x + 4, y - 8); g.lineTo(x - 4, y); g.lineTo(x + 4, y + 8); g.stroke(); });
  btn(h.redo, (x, y) => { g.beginPath(); g.arc(x, y, 8, -2.6, 2.6); g.stroke(); g.beginPath(); g.moveTo(x - 9, y - 9); g.lineTo(x - 7, y - 3); g.lineTo(x - 13, y - 5); g.closePath(); g.fillStyle = INK; g.fill(); });
  g.globalAlpha = C8.hist.length ? 1 : .35;
  btn(h.undo, (x, y) => { g.beginPath(); g.moveTo(x + 7, y + 6); g.quadraticCurveTo(x + 8, y - 6, x - 3, y - 6); g.lineTo(x - 3, y - 11); g.lineTo(x - 11, y - 5); g.lineTo(x - 3, y + 1); g.lineTo(x - 3, y - 4); g.stroke(); });
  g.globalAlpha = 1;
  g.fillStyle = INK; g.textAlign = 'center'; g.font = '900 17px "Playfair Display", serif'; g.fillText(`${lg('Màn', 'Level')} ${C8.i + 1} · ${c8Name(C8_LEVELS[C8.i])}`, W / 2, 22);
  g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.7)'; g.fillText(c8Clock(G.time), W / 2, 42);
  if (G.nScroll) { const A = c8Art(); g.drawImage(A.scroll.c, W - 168, 12, 30, 30); g.fillStyle = INK; g.textAlign = 'left'; g.font = '900 16px "Playfair Display", serif'; g.fillText(`${G.got}/${G.nScroll}`, W - 136, 28); }
}
function c8Howto(g, G, v) {                                // no words: a finger dragging over the first three things, and the keys
  if (C8.over || G.state !== 'play') return; const A = howtoArt(), cs = v.cs;
  if (C8.i === 0 && !C8.gathered && G.sel.length === 0 && C8.idle > 1.2) {
    const L = C8_LEVELS[0], cells = []; for (let i = 0; i < G.cells.length; i++) if (G.cells[i] === 'a') cells.push(i); cells.sort((a, b) => a - b);
    const T = 2.4, kk = (C8.t % T) / T, sw = Math.min(1, Math.max(0, (kk - .15) / .6)), n = cells.length - 1, f = sw * n, a = Math.min(n - 1, Math.floor(f)), w = f - a;
    const pt = i => [(i % G.W + .5) * cs - C8.cam.x, (((i / G.W) | 0) + .5) * cs - C8.cam.y];
    const p0 = pt(cells[a]), p1 = pt(cells[a + 1]), x = p0[0] + (p1[0] - p0[0]) * w, y = p0[1] + (p1[1] - p0[1]) * w;
    g.globalAlpha = kk > .85 ? 1 - (kk - .85) / .15 : 1;
    if (isTouch) dp(g, A.finger, x + 5, y - 2, -.15, 1.05, 1.05); else { dp(g, A.mouse, x + 10, y + 16, 0, .7, .7); if (sw > 0 && sw < 1) dp(g, A.click, x + 10, y + 16, 0, .7, .7); }
    g.globalAlpha = 1;
  }
  if (C8.i === 0 && !isTouch && (!C8.moved || !C8.jumped) && G.time > 1) {          // keys, bottom left
    const x0 = 56, y0 = v.H - 52, pulse = .8 + .2 * Math.sin(C8.t * 5);
    g.globalAlpha = pulse; dp(g, A.keyL, x0, y0, 0, .8, .8); dp(g, A.keyR, x0 + 40, y0, 0, .8, .8); dp(g, A.keyL, x0 + 20, y0 - 38, Math.PI / 2, .8, .8); g.globalAlpha = 1;
  }
}
function c8DrawOver(g, G, v) {
  const o = C8.over; o.t += .016; const O = c8OverGeo(), e = Math.min(1, o.t * 4);
  g.fillStyle = `rgba(29,25,21,${.35 * e})`; g.fillRect(0, 0, v.W, v.H);
  g.save(); g.translate(0, (1 - e) * 30); g.globalAlpha = e;
  c7Round(g, O.x, O.y, O.pw, O.ph, 16); g.fillStyle = '#fbf7ee'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#a3332a'; g.font = '900 28px "Playfair Display", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lg('Qua ải!', 'Cleared!'), O.x + O.pw / 2, O.y + 40);
  g.fillStyle = INK; g.font = '700 16px "Playfair Display", serif'; g.fillText(`${c8Clock(G.time)} · ${G.moves} ${lg('lần gom', G.moves === 1 ? 'gathering' : 'gatherings')}`, O.x + O.pw / 2, O.y + 80);
  if (G.nScroll) { g.fillText(`${lg('Cuộn tranh', 'Scrolls')} ${G.got}/${G.nScroll}`, O.x + O.pw / 2, O.y + 110); }
  const last = C8.i + 1 >= C8_LEVELS.length;
  c7Wood(g, ...O.next, last ? lg('Về danh sách', 'Back to list') : lg('Màn tiếp', 'Next'), 'son'); c7Wood(g, ...O.again, lg('Chơi lại', 'Retry'), 'paper');
  g.restore();
}

registerChapter({
  id: 8, modes: ['c8play'],
  card: { num: lg('Chương VIII', 'Chapter VIII'), han: '三', name: lg('Gom Ba Mở Lối', 'Gather Three, Clear the Way'), desc: lg('Con chuột nhỏ đi qua lối mòn trong làng, nhưng đường bị lửa, bưởi, lá, đất, băng và nước chắn kín. Kéo ngón tay nối từ ba món giống nhau trở lên thì chúng biến mất, đồ bên trên rơi xuống, mở đường cho chuột đi, nhảy, leo tới chiếc rương.', 'A little mouse walks the village trail, but fire, pomelos, leaves, clods of earth, ice and water block the way. Drag over three or more of a kind and they vanish, whatever is above falls, and the mouse can walk, jump and climb on to the chest.'), bg: '#e8c9c9' },
  progress: () => `${SAVE8.done.filter(Boolean).length}/${C8_LEVELS.length} ${lg('màn', 'levels')}`,
  hasProgress: () => SAVE8.done.some(Boolean),
  album() { buildAlbum8(); $('#albumTitle').textContent = lg('Chương VIII · Gom Ba Mở Lối', 'Chapter VIII · Gather Three, Clear the Way'); $('#albumDesc').textContent = lg('Nối ba món giống nhau để mở đường, chọn ăn món nào, chừa món nào để đồ rơi thành cầu, thành bậc thang. Xong màn này mới mở màn sau.', 'Join three of a kind to clear the way. Choose what to take and what to leave so that the rest falls into bridges and steps. Finish a level to open the next.'); },
  hide() { const p = document.getElementById('c8pad'); if (p) p.hidden = true; },
  update: updateC8, render: renderC8, key: c8Key,
  pointer: { down: c8Down, move: c8Move, up: c8Up },
  next() { c8Next(); }, retry() { c8Reset(); },
});
