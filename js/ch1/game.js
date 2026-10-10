/* Chương I engine: saves, loading a tranh, HUD, album, abilities, input, update, drawing, and its registration. */
let SAVE = { done: [], secret: [], gold: [] };
try { const s = JSON.parse(localStorage.getItem('dcc.v1') || 'null'); if (s && Array.isArray(s.done)) SAVE = Object.assign(SAVE, s); } catch (e) {}
for (const k of ['done', 'secret', 'gold']) { if (!Array.isArray(SAVE[k])) SAVE[k] = []; while (SAVE[k].length < LEVELS.length) SAVE[k].push(false); }
function persist() { try { localStorage.setItem('dcc.v1', JSON.stringify(SAVE)); } catch (e) {} }

function loadLevel(i) {
  S.lv = i; L = LEVELS[i]; PAPER = getPaper(L.paper); setZoom(L.zoom || 1, L.zoomWide || 1);
  document.documentElement.style.setProperty('--paper', PAPERS[L.paper].css);
  followers[0].item = 'parasol';
  followers[1].gap = L.kenFront ? 290 : 196; followers[2].gap = L.kenFront ? 196 : 290;   // tranh 5: the trumpeter walks ahead of the drummer                                         // tranh 5 lends the parasol to Tấm; every tranh starts with it
  S.ents = L.build(); S.gaps = S.ents.filter(e => e.gap).map(e => e.gap);
  S.tufts = [];
  const tr = mulberry(100 + i);
  for (let x = 40; x < L.width; x += 70 + tr() * 100) if (!S.gaps.some(([a, b]) => x > a - 30 && x < b + 30)) S.tufts.push({ x, k: (tr() * 3) | 0, s: .7 + tr() * .45, front: tr() < .45 });
  S.inv = []; S.parasol = false; S.hold = false; S.plate = null; S.pads = {}; S.caught = 0; S.catcher = null; S.fx = []; S.told = {}; S.cp = L.cps[0];
  S.lastHint = -99; S.wallT = 0; S.lockMove = false; S.waitMove = false; S.catches = 0; S.gotSecret = false; S.reset = false;
  placeParty(S.cp);
  camX = 0; AU.setKey(L.key); AU.muteDrums(false); S.drag = null; S.manualDrum = false;
  $('#lvName').textContent = `Tranh ${i + 1} · ${L.name}`;
  $('#bDrum').hidden = true; $('#bKen').hidden = true; $('#bPara').hidden = true;
  const pl = L.abil.includes('plates'); for (const c in PBTN) $(PBTN[c]).hidden = !pl;
  $('#bHold').hidden = !L.abil.includes('hold');
  hudKey = ''; updateHud();
}
function placeParty(x) {
  x = Math.max(x, 340);                      // the whole party (~330 px) stands inside the tranh
  groom.x = x; groom.vx = 0; groom.face = 1;
  followers.forEach(f => { f.x = x - f.gap; f.face = 1; f.ph = R() * 6; f.moving = false; });
}


/* ---------- UI ---------- */
const WATCH_TX = {
  cat: { sleep: 'Mèo đang ngủ', warn: 'Mèo sắp mở mắt!', watch: 'MÈO ĐANG NHÌN · đứng im!', block: 'Mèo chắn đường', fed: 'Mèo đang ăn cá' },
  roof: { sleep: 'Mèo trên mái đang ngủ', warn: 'Mèo trên mái sắp mở mắt!', watch: 'MÈO NHÌN XUỐNG · che lọng!' },
  hawk: { sleep: 'Diều hâu lượn xa', warn: 'Diều hâu kêu!', watch: 'DIỀU HÂU SÀ XUỐNG · che lọng!' },
};
function stdHud(w) { const st = S.catcher === w ? 'watch' : w.fed ? 'fed' : w.st; return { text: (WATCH_TX[w.kind] || {})[st] || '', cls: st === 'watch' || st === 'block' ? 'on' : st === 'warn' ? 'warn' : '' }; }
function activeWatcher() {
  let best = null, bd = 1e9;
  for (const e of S.ents) if (e.watcher && groom.x > e.z0 - 320 && groom.x < e.z1 + 160) { const d = Math.abs(groom.x - (e.x ?? 0)); if (d < bd) { bd = d; best = e; } }
  return best;
}
function currentOffer() { return S.ents.find(e => e.offer && !e.spent && e.offer.near()); }
let hudKey = '';
function updateHud() {
  const w = activeWatcher(), h = w ? (w.hud ? w.hud() : stdHud(w)) : null, off = currentOffer();
  const showOff = off && (off.offer.always || hasAll(off.offer.wants));
  const key = [h && h.text, h && h.cls, S.inv.join(), S.parasol, S.hold, S.plate, showOff && off.offer.label].join('|');
  if (key === hudKey) return; hudKey = key;
  const el = $('#watch'); el.hidden = !h || w.kind !== 'dog'; if (h) { el.textContent = h.text; el.className = h.cls || ''; }
  const gift = $('#gift'); gift.hidden = true; gift.textContent = 'Mang theo: ' + S.inv.map(i => ITEMS[i].name).join(', ');
  $('#holdTag').hidden = !S.hold;
  $('#bPara').classList.toggle('on', S.parasol); $('#bPara').lastChild.textContent = S.parasol ? 'Lọng ' + Math.max(0, S.paraT).toFixed(1) + 's' : 'Lọng'; $('#bHold').classList.toggle('on', S.hold);
  for (const c in PBTN) $(PBTN[c]).classList.toggle('on', S.plate === c);
  const b = $('#bOffer'); b.hidden = true; if (showOff) b.lastChild.textContent = off.offer.label;
}
function showCard() {
  $('#lvHan').textContent = L.han; $('#lvTitle').textContent = `Tranh ${S.lv + 1} · ${L.name}`;
  const c = $('#lvCard'); c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 2600);
}
// chương I: tranh 1–4 are finished, each opened by finishing the one before; later ones are still being carved and open only after 5 taps
const C1_READY = 5;
// a tranh still being made can be opened for trying: set C1_TRY to its index (it then opens without the one before)
const C1_TRY = -1;
function buildAlbum() {
  const box = $('#cards'); box.textContent = '';
  LEVELS.forEach((lv, i) => {
    if (i >= C1_READY && i !== C1_TRY) {
      const b = document.createElement('button'); let taps = 0;
      b.className = 'card'; b.style.background = PAPERS[lv.paper].css; b.style.opacity = '.5';
      b.innerHTML = `<div class="num">Tranh ${i + 1}</div><div class="ch">？</div><b>Sắp có</b><span class="st">Đang khắc ván</span>`;
      b.addEventListener('click', () => { AU.init(); if (++taps >= 5) { loadLevel(i); startPlay(); } else AU.pluck(56 + taps * 2); });
      box.appendChild(b); return;
    }
    const open = i === 0 || SAVE.done[i - 1] || i === C1_TRY;
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = PAPERS[lv.paper].css; b.disabled = !open;
    const marks = (SAVE.gold[i] ? ' ★' : '') + (SAVE.secret[i] && i > 0 ? ' ✦' : '');
    b.innerHTML = `<div class="num">Tranh ${i + 1}</div><div class="ch">${lv.han}</div><b>${lv.name}</b><span class="st${SAVE.done[i] ? ' done' : ''}">${SAVE.done[i] ? 'Đã đóng triện' + marks : open ? 'Chơi' : 'Chưa mở'}</span>`;
    b.addEventListener('click', () => { if (open) { loadLevel(i); startPlay(); } });
    box.appendChild(b);
  });
}
function startPlay() {
  trackEnter(`chuong-1/tranh-${S.lv + 1}`);
  AU.init(); AU.setSong(L.song ?? 0); AU.musicLevel(.75); AU.setQuiet(false); hideChapterHuds(); S.chapter = 1;   // a tranh may have its own song (tranh 5) $('#chapters').hidden = true;
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true;
  S.mode = 'play'; $('#hud').hidden = false; $('#pad').hidden = !isTouch;
  hudKey = ''; updateHud(); $('#abil').hidden = !L.abil.length && $('#bOffer').hidden; cv.focus(); showCard();

}
function finishLevel() {
  S.mode = 'end'; S.endT = 0; AU.stamp(); AU.setQuiet(true);
  SAVE.done[S.lv] = true; if (S.catches === 0) SAVE.gold[S.lv] = true; persist(); trackWin();
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  $('#endHan').textContent = L.han; $('#endTitle').textContent = L.endTitle; $('#endText').textContent = L.endText;
  const last = S.lv === LEVELS.length - 1, n = SAVE.done.filter(Boolean).length;
  const stats = `Bị bắt ${S.catches} lần${S.catches === 0 ? ' · Triện vàng ★' : ''}${S.lv > 0 ? (SAVE.secret[S.lv] ? ' · Có mảnh triện ✦' : ' · Chưa tìm ra mảnh triện ẩn') : ''}`;
  const tot = S.lv < C1_READY ? C1_READY : LEVELS.length;
  $('#endNote').textContent = `${S.lv + 1 === tot ? `Đã đóng triện ${SAVE.done.slice(0, tot).filter(Boolean).length}/${tot} tranh. ` : `Tranh ${S.lv + 1}/${tot} đã vào album. `}${stats}`;
  $('#bNext').hidden = last || (S.lv + 1 >= C1_READY && S.lv + 1 !== C1_TRY);
}
$('#lvName').addEventListener('click', () => showAlbum(1));

/* ---------- abilities ---------- */
const PARA_TIME = 3, PARA_CD = 1.2;
function toggleHold() {
  if (!L.abil.includes('hold')) return;
  S.hold = !S.hold; AU.click();
  if (S.hold) toast('Đoàn đứng chờ.', 1.6);
  else toast('Đoàn lại theo chú rể.', 2);
  updateHud();
}
function setPlate(p) {
  if (!L.abil.includes('plates')) return;
  const busy = S.plate && S.ents.find(e => e.plate === S.plate && e.occupied && e.occupied());
  if (busy && p !== S.plate) { toast('Còn người đứng trên cầu, chưa rút bản màu được!', 2.6); AU.pluck(60); return; }
  if (busy && p === S.plate) { toast('Còn người đứng trên cầu, chưa rút bản màu được!', 2.6); AU.pluck(60); return; }
  S.plate = S.plate === p ? null : p; AU.swoosh(); S.fx.push({ kind: 'wash', pl: p, t: 0 });
  if (S.plate && !S.told.plate) { S.told.plate = true;  }
  updateHud();
}
function useAbility(k) {
  if (S.mode !== 'play' || S.caught) return;
  if (k === 'offer') return tryOffer();
  if (k === 'hold') return toggleHold();
  if (k.startsWith('plate:')) return setPlate(k.slice(6));
  if (!L.abil.includes(k)) return;
  if (k === 'parasol') {
    if (followers[0].item !== 'parasol') return;                           // lent to Tấm (tranh 5)
    if (S.parasol) { S.parasol = false; S.paraTired = null; S.paraCD = PARA_CD; AU.pluck(74); updateHud(); return; }
    if ((S.paraCD || 0) > 0) { toast('Lọng vừa rũ xuống, chưa giương lại kịp!', 1.6); AU.pluck(60); return; }
    S.parasol = true; S.paraT = PARA_TIME; S.paraTired = null; AU.pluck(79);
    if (!S.told.para) { S.told.para = true;  }
    updateHud(); return;
  }
  const f = followers[k === 'drum' ? 1 : 2], origin = f.x;
  const buf = S.ents.find(q => q.songActive && q.songActive());
  if (buf) {
    if (k === 'drum') { S.drumT = .35; S.fx.push({ kind: 'tung', x: f.x + 20, y: GROUND - 150, t: 0 }); }
    else { S.kenT = .5; S.fx.push({ kind: 'note', x: f.x + 50, y: GROUND - 100, t: 0, vx: 40 + R() * 40, vy: -50 - R() * 30 }); }
    buf.note(k === 'drum' ? 'T' : 'K'); return;
  }
  if (k === 'drum') { S.drumT = .8; AU.drumHit(); S.fx.push({ kind: 'tung', x: f.x + 20, y: GROUND - 150, t: 0 }); }
  else { S.kenT = 1.4; AU.kenCall(); for (let i = 0; i < 6; i++) S.fx.push({ kind: 'note', x: f.x + 50, y: GROUND - 100, t: -i * .18, vx: 40 + R() * 40, vy: -50 - R() * 30 }); }
  for (const e of S.ents) {
    const h = k === 'drum' ? e.onDrum : e.onKen;
    if (h && Math.abs((e.ax ?? e.x ?? 0) - origin) < (e.range || 380)) h.call(e, origin);
  }
}
// every gift rides in the groom's hand; the newest one is on top and is the one you drag
const leadItem = () => S.inv.length ? S.inv[S.inv.length - 1] : null;
function handPos(f = groom) { return [f.x + 16 * f.face, GROUND - 50]; }
function dropOn(wx, wy, item) {
  for (const e of S.ents) {
    if (!e.offer || e.spent || e.opened || e.fed) continue;
    const ex = e.ax ?? e.x ?? e.gateX; if (ex == null || Math.abs(wx - ex) > 150 || wy < GROUND - 300 || wy > GROUND + 20) continue;
    if (!e.offer.wants.includes(item)) { AU.pluck(60); return false; }
    e.got = e.got || [];
    if (!e.got.includes(item)) { e.got.push(item); takeItems([item]); AU.pluck(84); }
    if (e.offer.wants.every(w => e.got.includes(w))) e.give();
    updateHud(); return true;
  }
  return false;
}
function tryOffer() {
  const e = currentOffer();
  if (!e) return;
  if (!hasAll(e.offer.wants)) { toast(e.offer.missing); return; }
  takeItems(e.offer.wants); e.give(); updateHud();
}


/* ---------- input ---------- */
const keys = new Set(), touchDir = { L: false, R: false };
function ch1Key(e) {
  if (S.mode !== 'play') return;
  howtoInput();
  keys.add(e.code);
  if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (e.code === 'Digit4' || e.code === 'Numpad4') useAbility('plate:red');
  if (e.code === 'Digit5' || e.code === 'Numpad5') useAbility('plate:green');
  if (e.code === 'Digit6' || e.code === 'Numpad6') useAbility('plate:yellow');
  if (e.code === 'KeyG') useAbility('hold');
}
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); touchDir.L = touchDir.R = false; });
const hold = (el, k) => {
  el.addEventListener('pointerdown', e => { e.preventDefault(); touchDir[k] = true; capturePointer(e, el); });
  const up = () => { touchDir[k] = false; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
};
hold($('#bL'), 'L'); hold($('#bR'), 'R');
document.querySelectorAll('#abil button').forEach(b => b.addEventListener('click', () => { useAbility(b.dataset.a); cv.focus(); }));

/* ---------- update ---------- */
function caught(w) {
  S.caught = .001; S.catcher = w; w.from0 = groom.x; S.catches++;
  if (L.catchToStart) S.cp = L.cps[0];
  if (w.sound === 'bark') AU.bark(); else AU.meow();
  AU.thump(); toast(w.catchMsg(), 3);
}
function safeFrom(w, x) { return w.mode === 'above' ? S.parasol : S.ents.some(e => e.cover && x > e.cover[0] && x < e.cover[1]); }
function update(dt) {
  S.drumT = Math.max(0, S.drumT - dt); S.kenT = Math.max(0, S.kenT - dt);
  howtoUpdate(dt);
  {
    const w = S.mode === 'play' ? activeWatcher() : null, eyed = w && w.kind !== 'dog' && !w.fed;
    const st = eyed ? (S.catcher === w ? 'watch' : w.st) : 'sleep';
    const tgt = st === 'watch' || st === 'block' ? 1 : st === 'warn' ? .34 : 0;
    S.eyeOpen = (S.eyeOpen || 0) + (tgt - (S.eyeOpen || 0)) * Math.min(1, dt * (tgt > (S.eyeOpen || 0) ? 9 : 7));
    S.eyeShow = (S.eyeShow || 0) + ((eyed ? 1 : 0) - (S.eyeShow || 0)) * Math.min(1, dt * 5);
    S.eyeKind = eyed ? w.kind : S.eyeKind; S.eyeWatch = st === 'watch';
  }
  if (S.mode === 'play') {
    const frozen = S.caught > 0;
    S.pads = {};
    for (const e of S.ents) if (e.padX !== undefined) {
      const p = members().some(m => Math.abs(m.x - e.padX) < 36);
      if (p !== e.pressed) { e.pressed = p; AU.click(); }
      if (p) S.pads[e.id] = true;
    }
    for (const e of S.ents) e.update && e.update(dt);
    const walls = [];
    for (const e of S.ents) { const w = e.wall && e.wall(); if (w != null) walls.push([w, e]); }
    let dir = 0;
    if (!frozen && !S.lockMove && !S.waitMove) {                         // waitMove: hold still while a scene plays out (tranh 5)                                         // lockMove: the party is busy (tranh 4: pushing the cart)
      if (keys.has('ArrowLeft') || keys.has('KeyA') || touchDir.L) dir -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD') || touchDir.R) dir += 1;
    }
    const speed = S.parasol ? 80 : 150;
    groom.vx += (dir * speed - groom.vx) * Math.min(1, dt * 12);
    let nx = groom.x + groom.vx * dt, blockedBy = null;
    for (const [w, e] of walls) if (groom.x <= w + .5 && nx > w) { nx = w; blockedBy = e; }
    groom.x = Math.max(60, Math.min(L.width - 60, nx));
    groom.moving = Math.abs(groom.vx) > 8;
    if (groom.moving) { groom.ph += dt * (S.parasol ? 6 : 9); groom.face = groom.vx < 0 ? -1 : 1; }
    if (blockedBy && dir > 0) {
      S.wallT += dt;
      
    } else S.wallT = 0;
    if (!S.caught) for (const c of L.cps) if (groom.x > c + 30 && c > S.cp) S.cp = c;
    // parasol timer
    if (S.parasol) {
      S.paraT -= dt;
      if (S.paraT <= 0 && S.paraTired == null) { S.paraTired = 1.1; AU.snort && AU.snort(); }                       // the holder says it is tiring…
      if (S.paraTired != null) { S.paraTired -= dt; if (S.paraTired <= 0) { S.paraTired = null; S.parasol = false; S.paraCD = PARA_CD; AU.pluck(70); updateHud(); } }   // …and then lets it down
    }
    else if ((S.paraCD || 0) > 0) S.paraCD -= dt;
    // watchers: a ground cat sees whoever moves in the open; eyes in the sky see everyone not under the parasol, moving or not
    if (!frozen) for (const w of S.ents) {
      if (!w.watcher || w.mode === 'dog' || w.st !== 'watch') continue;
      if (w.mode === 'above') {
        if (!S.parasol && S.t - (w.w0 || 0) > .35 && members().some(m => m.x > w.z0 && m.x < w.z1)) { caught(w); break; }
        continue;
      }
      if (groom.x < w.z0 || groom.x > w.z1) continue;
      if (groom.moving && !safeFrom(w, groom.x)) { caught(w); break; }
    }
    if (S.caught) {
      S.caught += dt;
      if (S.caught > .45 && !S.reset) { S.reset = true; placeParty(S.cp); S.parasol = false; S.hold = false; }
      if (S.caught > 1.1) { const w = S.catcher; S.caught = 0; S.catcher = null; S.reset = false; if (w && w.st !== undefined && w.mode !== 'dog') { w.st = 'sleep'; w.t = 2.8; } if (w && w.mode === 'dog') w.alert = 0; }
    }
    const watching = S.ents.filter(w => w.watcher && w.st === 'watch' && !w.fed);
    const gapK = (S.parasol || S.lockMove ? .42 : 1) * (L.gapK || 1);  // close up under the parasol, or all pushing together; some tranh walk closer
    followers.forEach(f => {
      const d = groom.x - f.gap * gapK - f.x;
      const exposed = watching.some(w => f.x > w.z0 && f.x < w.z1 && !safeFrom(w, f.x));
      const v = !frozen && !S.hold && (!exposed || Math.abs(d) < 4) ? Math.max(-190, Math.min(190, d * 4)) : 0;
      let fx = f.x + v * dt;
      for (const [w] of walls) if (f.x <= w + .5 && fx > w) fx = w;
      f.moving = Math.abs(fx - f.x) > 10 * dt;
      if (f.moving) { f.ph += dt * 9; f.face = fx < f.x ? -1 : 1; }
      f.x = fx;
    });
    AU.setQuiet(S.eyeWatch || watching.some(w => groom.x > w.z0 - 100 && groom.x < w.z1) || S.caught > 0);
    const g = S.ents.find(e => e.gateX);
    if (g && g.opened && groom.x > g.gateX - 40) finishLevel();
    updateHud();
    if (S.parasol) $('#bPara').lastChild.textContent = 'Lọng ' + Math.max(0, S.paraT).toFixed(1) + 's';
    $('#abil').hidden = !L.abil.length && $('#bOffer').hidden;
    { const ph = !isTouch || !!S.waitMove; if ($('#pad').hidden !== ph) $('#pad').hidden = ph; }   // no walk buttons while the party must wait (tranh 5)
  } else if (S.mode === 'end') {
    S.endT += dt;
    if (S.endT > 1.6 && $('#end').hidden) { $('#end').hidden = false; ($('#bNext').hidden ? $('#bAlbum') : $('#bNext')).focus(); }
  } else {
    followers.forEach(f => { f.moving = false; });
    for (const e of S.ents) if (e.kind === 'hawk') e.update(dt);
  }
  const viewW = cv.width / DPR / scale;
  const lead = L.zoom ? viewW * .4 : innerWidth < innerHeight ? Math.min(360, viewW * .62) : viewW * .42;   // portrait: keep the last mouse on screen (a closer tranh needs not)
  const want = Math.max(0, Math.min(L.width - viewW, groom.x - lead));
  if (Number.isFinite(want)) camX += (want - camX) * Math.min(1, dt * 4);
  if (!Number.isFinite(camX)) camX = 0;
}


/* ---------- draw ---------- */
function drawMouse(g, M, x, face, ph, moving, item, seed) {
  const sw = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.sin(ph)) * 3.5 : Math.sin(S.pose * 2 + seed) * .8;
  g.save(); g.translate(x, GROUND); g.scale(face, 1);
  const hy = -45 + bob;
  dp(g, M.tail, -18, hy + 2, Math.sin(S.pose * 3 + seed) * .15);
  dp(g, M.leg, 6, hy, sw * .55);
  let armN = sw * .4;
  const bigPara = item === 'parasol' && S.parasol;
  if (item === 'parasol') armN = bigPara ? -2.2 : -1.35 + Math.sin(S.pose * 2 + seed) * .04;
  if (item === 'ken') armN = -1.05;
  if (item === 'drum') armN = S.drumT > 0 ? -.4 - Math.abs(Math.sin(S.t * 22)) * .9 : S.manualDrum || S.eyeWatch ? -.4 : -.4 + Math.abs(Math.sin(S.pose * 7)) * -.6;
  if (item === 'lead') armN = -.25;
  if (S.lockMove) armN = -1.3;                                             // pushing the cart (tranh 4): every arm reaches forward
  dp(g, M.arm, 2, hy - 50, -sw * .4);
  dp(g, M.body, 0, hy, .04);
  if (item === 'drum') dp(g, ITEM.drum, 26, hy - 18);
  dp(g, M.leg, -2, hy, -sw * .55);
  dp(g, M.head, 6, hy - 60, Math.sin(ph * 2) * .04 + (item === 'ken' ? -.1 - (S.kenT > 0 ? .12 : 0) : 0));
  const ax = 10, ay = hy - 52, hx = ax + 16 * Math.cos(armN) - 31 * Math.sin(armN), hyy = ay + 16 * Math.sin(armN) + 31 * Math.cos(armN);
  if (item === 'parasol' && !bigPara) dp(g, ITEM.parasol, hx, hyy + 26, Math.sin(S.pose * 1.5 + seed) * .05);
  if (item === 'ken') dp(g, ITEM.ken, hx - 4, hyy, -.25 - (S.kenT > 0 ? Math.sin(S.t * 10) * .05 : 0));
  if (item === 'drum') dp(g, ITEM.stick, hx - 2, hyy, .5 + armN);
  const carry = item === 'lead' ? leadItem() : null;
  if (carry && !(S.drag && S.drag.item === carry)) { const it = carry, w = it === 'fish';
    drawItem(g, it, hx + 5, hyy + 14 - (w ? Math.abs(Math.sin(S.t * 9)) * 9 : 0), w ? 1.1 : .9, w ? 1.3 + Math.sin(S.t * 17) * .5 : .1); }
  dp(g, M.arm, ax, ay, armN);
  g.restore();
}
function drawEyes(g, cx, top, open, alpha, kind, watching) {
  const W = 236, H = 78, y = top + H / 2, hawkEye = kind === 'hawk';
  g.save(); g.globalAlpha = alpha;
  // dark woodblock cartouche so the eyes read on every paper colour
  const r = 18; g.beginPath();
  g.moveTo(cx - W / 2 + r, top); g.lineTo(cx + W / 2 - r, top); g.quadraticCurveTo(cx + W / 2, top, cx + W / 2, top + r); g.lineTo(cx + W / 2, top + H - r); g.quadraticCurveTo(cx + W / 2, top + H, cx + W / 2 - r, top + H);
  g.lineTo(cx - W / 2 + r, top + H); g.quadraticCurveTo(cx - W / 2, top + H, cx - W / 2, top + H - r); g.lineTo(cx - W / 2, top + r); g.quadraticCurveTo(cx - W / 2, top, cx - W / 2 + r, top); g.closePath();
  g.fillStyle = 'rgba(29,25,21,.9)'; g.fill();
  g.lineWidth = watching ? 4 + Math.sin(S.t * 14) * 1.2 : 2.4; g.strokeStyle = watching ? '#c8392d' : '#f2ecde'; g.stroke();
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 56, hw = 40, up = 30 * open, dn = 22 * open;
    if (open < .06) {
      // closed: a sleepy lid curve with lashes
      g.strokeStyle = '#f2ecde'; g.lineWidth = 3.4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ex - hw, y - 2); g.quadraticCurveTo(ex, y + 12, ex + hw, y - 2); g.stroke();
      g.lineWidth = 2; for (let i = -2; i <= 2; i++) { const px = ex + i * 13, py = y + 5 - Math.abs(i) * 2.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + i * 2, py + 8); g.stroke(); }
      continue;
    }
    const lid = new Path2D();
    lid.moveTo(ex - hw, y); lid.quadraticCurveTo(ex, y - up * 2, ex + hw, y); lid.quadraticCurveTo(ex, y + dn * 2, ex - hw, y); lid.closePath();
    g.save(); g.clip(lid);
    g.fillStyle = hawkEye ? '#f0a53a' : '#e8c34a'; g.fillRect(ex - hw, y - 40, hw * 2, 80);
    g.fillStyle = hawkEye ? '#c7702a' : '#8fb04a'; g.beginPath(); g.ellipse(ex, y, 26, 26, 0, 0, 6.283); g.fill();
    const pw = watching ? 3.5 : 6 + (1 - open) * 8;
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex, y, hawkEye ? pw + 4 : pw, 30, 0, 0, 6.283); g.fill();
    g.fillStyle = '#fffbe8'; g.beginPath(); g.ellipse(ex - 9, y - 9 * open, 4, 3, 0, 0, 6.283); g.fill();
    g.restore();
    g.strokeStyle = '#f2ecde'; g.lineWidth = 3; g.stroke(lid);
    if (open < .6) { g.strokeStyle = 'rgba(242,236,222,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(ex - hw, y); g.quadraticCurveTo(ex, y - up * 2 - 5, ex + hw, y); g.stroke(); }
  }
  g.restore();
}
function drawCatAt(g, x, y, s, st) {
  const P = CAT;
  g.save(); g.translate(x, y); g.scale(s, s);
  const lash = st === 'watch' || st === 'block' ? Math.sin(S.pose * 6) * .12 : Math.sin(S.pose * 1.2) * .05;
  dp(g, P.tail, 58, -8, lash);
  dp(g, P.body, 0, 0);
  const headRot = st === 'sleep' ? .16 + Math.sin(S.pose * 1.3) * .015 : st === 'warn' ? .06 + Math.sin(S.pose * 18) * .02 : st === 'fed' ? -.05 : -.04;
  g.save(); g.translate(-24, -96); g.rotate(headRot);
  dp(g, P.head, 0, 0);
  dp(g, st === 'sleep' ? P.eyes.closed : st === 'warn' ? P.eyes.half : st === 'fed' ? P.eyes.happy : P.eyes.open, 0, 0);
  if (st === 'fed') dp(g, ITEM.fish, -58, -10, -.35, .9, .9);
  g.restore();
  if (st === 'sleep') for (let i = 0; i < 3; i++) { const k = (S.pose * .5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI); dp(g, PROPS.zz, -40 - k * 30 + i * 4, -170 - k * 50, 0, .7 + k * .5, .7 + k * .5); g.globalAlpha = 1; }
  g.restore();
}
function render() {
  const Sc = scale * DPR, vw = cv.width / Sc, pal = PAPERS[L.paper];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = pal.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(Sc, 0, 0, Sc, -camX * Sc, offY * Sc);
  const pw = PAPER.width;
  for (let px = Math.floor(camX / pw) * pw; px < camX + vw; px += pw) ctx.drawImage(PAPER, px, -offY - 20, pw, Math.max(viewH + 40, PAPER.height));
  ctx.fillStyle = pal.spark;
  const sr = mulberry(9);
  for (let i = 0; i < 420; i++) {
    const sx = sr() * L.width, sy = sr() * 540 - 60, p = sr() * 6.28, ss = .6 + sr();
    if (sx < camX - 5 || sx > camX + vw + 5) continue;
    const a = Math.pow(Math.max(0, Math.sin(S.t * 1.6 + p)), 10) * .75; if (a < .02) continue;
    ctx.globalAlpha = a; ctx.fillRect(sx, sy, ss * 1.6, ss * .8);
  }
  ctx.globalAlpha = 1;
  const layer = n => { for (const e of S.ents) if (e.layer === n) e.draw(ctx); };
  layer('bg');
  for (const t of S.tufts) if (!t.front) dp(ctx, PROPS.tufts[t.k], t.x, GROUND - 6, 0, t.s * .8, t.s * .8);
  for (const e of S.ents) if (e.drawMid) e.drawMid(ctx);
  layer('mid');
  if (S.parasol) { const f = followers[0]; dp(ctx, ITEM.parasol, f.x + 14 * f.face, GROUND + 18, Math.sin(S.pose * 1.5) * .02, 2.2, 2.2); if (S.paraTired != null) t5Say(ctx, f.x + 14 * f.face, GROUND - 292, 'Mỏi tay quá!'); }
  for (const i of L.kenFront ? [0, 2, 1] : [2, 1, 0]) { const f = followers[i]; drawMouse(ctx, f.m, f.x, f.face, f.ph, f.moving, f.item, i * 1.7 + 1); }   // tranh 5: the trumpet over the parasol mouse, the drum over the trumpet (owner)
  drawMouse(ctx, MICE.groom, groom.x, groom.face, groom.ph, groom.moving, leadItem() ? 'lead' : null, 0);
  ctx.save(); ctx.beginPath();
  let gx = -40; for (const [a, b] of [...S.gaps].sort((p, q) => p[0] - q[0])) { ctx.rect(gx, GROUND - 30, a - gx, 90); gx = b; }
  ctx.rect(gx, GROUND - 30, L.width + 40 - gx, 90); ctx.clip();
  for (let x = Math.floor((camX - 40) / 580) * 580 - 20; x < camX + vw + 20; x += 580) dp(ctx, PROPS.ground, x, GROUND + 6);
  ctx.restore();
  layer('fg');
  for (const e of S.ents) if (e.drawFg) e.drawFg(ctx);
  for (const t of S.tufts) if (t.front) dp(ctx, PROPS.tufts[t.k], t.x, GROUND + 14, 0, t.s, t.s);
  layer('top');
  if (S.drag) { if (S.drag.draw) S.drag.draw(ctx); else drawItem(ctx, S.drag.item, S.drag.x, S.drag.y, 1.3, Math.sin(S.t * 17) * .4); }
  for (const f of S.fx) {
    if (f.t < 0 || f.kind === 'wash') continue;
    if (f.kind === 'crowCh') { if (f.t > 0) { const k = f.t / 2.2; ctx.globalAlpha = Math.max(0, 1 - k * k); dp(ctx, crowTiles()[f.ch], f.x + f.t * 120, f.y - f.t * 14 + Math.sin(f.t * 5) * 8, Math.sin(f.t * 3) * .2, 1 + f.t * .35, 1 + f.t * .35); } }
    if (f.kind === 'tung') { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2); dp(ctx, WP.tung, f.x, f.y - f.t * 30, -.08, 1 + f.t * .3, 1 + f.t * .3); }
    else { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.3); dp(ctx, WP.note, f.x + f.vx * f.t, f.y + f.vy * f.t + Math.sin(f.t * 8) * 6, Math.sin(f.t * 5) * .3); }
    ctx.globalAlpha = 1;
  }
  ctx.setTransform(Sc, 0, 0, Sc, 0, 0);
  for (const f of S.fx) if (f.kind === 'wash') { ctx.globalAlpha = Math.max(0, .2 * (1 - f.t / .7)); ctx.fillStyle = PCOL[f.pl]; ctx.fillRect(0, 0, vw, viewH); ctx.globalAlpha = 1; }
  for (const en of S.ents) if (en.drawHud) en.drawHud(ctx, vw);
  if ((S.eyeShow || 0) > .02) drawEyes(ctx, vw / 2, 30 + Math.max(0, offY) * .3, S.eyeOpen || 0, S.eyeShow, S.eyeKind, S.eyeWatch);
  const m = 10;
  ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.strokeRect(m, m, vw - m * 2, viewH - m * 2);
  ctx.lineWidth = 1.2; ctx.strokeRect(m + 6, m + 6, vw - m * 2 - 12, viewH - m * 2 - 12);
  if (S.plate) { ctx.fillStyle = PCOL[S.plate]; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m + 26, m + 26 + 34, 10, 0, 6.283); ctx.fill(); ctx.stroke(); }
  if (S.mode === 'end') { const k = Math.min(1, S.endT / .35), sc = 1.8 - .8 * k; ctx.globalAlpha = k; dp(ctx, PROPS.seal, vw - 70, viewH - 76, -.06, sc, sc); ctx.globalAlpha = 1; }
  howtoDraw();
}


/* ---------- pointer: tap things, drag carried items and loose pieces ---------- */
function ch1PointerDown(e) {
  if (S.mode !== 'play' || S.caught) return;
  howtoInput();
  if (ch1PointerHit(e)) howtoTapped();
}
function ch1PointerHit(e) {
  const r = cv.getBoundingClientRect(), wx = (e.clientX - r.left) / scale + camX, wy = (e.clientY - r.top) / scale - offY;
  for (const en of S.ents) if (en.grab) { const d = en.grab(wx, wy); if (d) { S.drag = d; capturePointer(e); return true; } }
  { const it = leadItem(), [hx, hy] = handPos(groom); if (it && Math.hypot(wx - hx, wy - hy) < 42) { S.drag = { item: it, x: wx, y: wy }; capturePointer(e); return true; } }
  for (const en of S.ents) if (en.onClick && en.onClick(wx, wy)) return true;
  { const f = followers[0]; if (L.abil.includes('parasol') && f.item === 'parasol' && Math.abs(wx - (f.x + 14 * f.face)) < (S.parasol ? 110 : 62) && wy > GROUND - (S.parasol ? 330 : 250) && wy < GROUND + 8) { useAbility('parasol'); return true; } }
  for (const [i, k] of [[1, 'drum'], [2, 'ken']]) { const f = followers[i]; if (L.abil.includes(k) && Math.abs(wx - f.x) < 40 && wy > GROUND - 150 && wy < GROUND + 8) { useAbility(k); return true; } }
  return false;
}
function ch1PointerMove(e) {
  if (!S.drag) return;
  const r = cv.getBoundingClientRect(); S.drag.x = (e.clientX - r.left) / scale + camX; S.drag.y = (e.clientY - r.top) / scale - offY;
}
function ch1PointerUp(e) {
  if (S.drag) { const d = S.drag; S.drag = null; if (S.mode === 'play') { if (d.ent) d.ent.drop(d); else dropOn(d.x, d.y, d.item); } }
}

/* ---------- registration ---------- */
registerChapter({
  id: 1, cover: true, modes: ['play', 'end'],
  card: { num: lg('Chương I', 'Chapter I'), han: '𡌽𡠣𤝞', name: lg('Đám Cưới Chuột', 'The Mouse Wedding'), desc: lg('Dẫn đoàn rước dâu qua làng: dâng cá cho mèo, gọi gà trống gáy, qua bờ ao đón dâu, qua làng tranh ra chợ, giúp cô Tấm trên đường. Các bức sau đang khắc ván.', 'Lead the wedding procession through the village: a fish for the cat, a crow from the rooster, the bride by the pond, the painters\' village and the market, and a hand for Tấm on the way. More prints are being carved.'), bg: '#ecd593' },
  progress: () => `${SAVE.done.slice(0, C1_READY).filter(Boolean).length}/${C1_READY} ${lg('tranh', 'prints')}`,
  hasProgress: () => SAVE.done.some(Boolean) || SAVE.secret.some(Boolean),
  boot() { loadLevel(0); },
  playFirst() { loadLevel(0); startPlay(); },
  album() { buildAlbum(); $('#albumTitle').textContent = 'Chương I · Đám Cưới Chuột'; $('#albumDesc').textContent = 'Mỗi bức là một chặng rước dâu. Qua chặng này mới mở được chặng sau.'; },
  update, render, key: ch1Key,
  pointer: { down: ch1PointerDown, move: ch1PointerMove, up: ch1PointerUp },
  next() { loadLevel(S.lv + 1); startPlay(); },
  retry() { loadLevel(S.lv); startPlay(); },
});
