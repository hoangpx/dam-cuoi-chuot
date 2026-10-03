/* Chương III shell: start a game, logical-unit canvas, the reward print, album and registration. */
const C3 = { i: 0, game: null, view: 'play', printT: 0, W: 0, H: 0, time: 0, shown: -1, img: null, stat: '' };
{
  const hud = document.createElement('div'); hud.id = 'c3hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="c3Name" title="' + lg('Về album tranh', 'Back to the album') + '"></button><div class="tag" id="c3Time">0:00</div>';
  const end = document.createElement('div'); end.id = 'c3end'; end.hidden = true;
  end.innerHTML = '<p id="c3Praise"></p><p class="tag" id="c3Stat"></p><div class="row"><button class="btn" id="c3Again">' + lg('Chơi lại', 'Play again') + '</button><button class="btn alt" id="c3Album">' + lg('Về album', 'Back to album') + '</button></div>';
  document.body.append(hud, end);
}
// logical units: the short side is 540 (460 on portrait phones, so chicks are big enough for small fingers)
// a game may ask for a different short side (e.g. Hứng Dừa zooms out on wide screens so the palm stands tall)
function c3Size() { const W = cv.width / DPR, H = cv.height / DPR, p = H > W, g = C3.game, short = g && g.short ? g.short(p) : (p ? 460 : 540); return { W, H, u: Math.min(W, H) / short }; }
function c3Hide() { cv.style.cursor = ''; $('#c3hud').hidden = true; $('#c3end').hidden = true; $('#pad').hidden = true; $('#pad').classList.remove('split', 'pulse'); }
function startC3(i) {
  trackEnter(`chuong-3/tranh-${i + 1}`);
  AU.init(); AU.setSong(C3GAMES[i].song ?? 2); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 3; S.mode = 'c3play'; C3.i = i; C3.game = C3GAMES[i]; C3.view = 'play'; C3.printT = 0;
  PAPER = getPaper(C3.game.paper); document.documentElement.style.setProperty('--paper', PAPERS[C3.game.paper].css);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  $('#c3hud').hidden = false; $('#c3Name').textContent = `${lg('Tranh', 'Picture')} ${i + 1} · ${C3.game.name}`;
  cv.style.cursor = C3.game.handCursor && !isTouch ? 'none' : ''; C3.pressed = false;
  $('#c3Time').style.visibility = C3.game.ownClock ? 'hidden' : '';        // e.g. Hứng Dừa draws its clock in the scene
  $('#pad').hidden = !(C3.game.pad && isTouch);                            // games that walk get the ◀ ▶ buttons on phones
  const z = c3Size(); C3.W = z.W; C3.H = z.H; C3.game.resize(z.W / z.u, z.H / z.u);
  C3.game.start(); C3.game.onWin(c3Win); if (C3.game.onFail) C3.game.onFail(c3Fail);   // e.g. the kite crashing
  C3.time = 0; C3.shown = -1; $('#c3Time').textContent = c3Clock(C3.game.timeLimit || C3.game.clockDown || 0); $('#c3Time').classList.remove('hurry');
  if (!C3.game.print) C3.img = null;                                        // no print yet: the game draws its own (printRender)
  else if (!C3.img || C3.img.dataset.src !== C3.game.print) { C3.img = new Image(); C3.img.dataset.src = C3.game.print; C3.img.src = C3.game.print; }
  $('#lvHan').textContent = C3.game.han; $('#lvTitle').textContent = `${lg('Tranh', 'Picture')} ${i + 1} · ${C3.game.name}`;
  const c = $('#lvCard'); c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 2200);
  cv.focus();
}
function c3Win() {
  trackWin();
  if (C3.game.scoring === 'count') {                  // record = the most caught
    const n = C3.game.score(), most = SAVE3.most[C3.i] || 0, record = n > most;
    SAVE3.done[C3.i] = true; if (record) SAVE3.most[C3.i] = n; persist3();
    $('#c3Stat').textContent = lgf('Hứng được {n} quả', 'Caught {n}', { n }) + (record ? (most ? lg(' · Kỷ lục mới!', ' · New record!') : '') : lgf(' · Kỷ lục {m} quả', ' · Record {m}', { m: most }));
  } else {                                           // record = the fastest time
    const t = Math.round(C3.time * 10) / 10, best = SAVE3.best[C3.i], record = !best || t < best;
    SAVE3.done[C3.i] = true; if (record) SAVE3.best[C3.i] = t; persist3();
    $('#c3Stat').textContent = lgf('Thời gian {t}', 'Time {t}', { t: c3Clock(t) }) + (record ? (best ? lg(' · Kỷ lục mới!', ' · New record!') : '') : lg(' · Kỷ lục ', ' · Record ') + c3Clock(best));
  }
  $('#c3Praise').textContent = C3.game.praise ? C3.game.praise() : '';
  $('#pad').hidden = true;
  C3.view = 'print'; C3.printT = 0; AU.stamp(); cv.style.cursor = ''; setTimeout(() => AU.pluck(88), 160);
  setTimeout(() => { if (S.mode === 'c3play' && C3.view === 'print') $('#c3end').hidden = false; }, 500);
}
// a timed round ran out without enough: say so, offer another go
function c3Fail() {
  C3.view = 'over'; C3.printT = 0; AU.snort(); $('#pad').hidden = true;
  const n = C3.game.score ? C3.game.score() : 0, most = SAVE3.most[C3.i] || 0;
  $('#c3Praise').textContent = C3.game.failText ? C3.game.failText() : lg('Hết giờ!', 'Time\'s up!');
  $('#c3Stat').textContent = C3.game.scoring === 'count' ? lgf('Hứng được {n} quả', 'Caught {n}', { n }) + (most ? lgf(' · Kỷ lục {m} quả', ' · Record {m}', { m: most }) : '')
    : SAVE3.best[C3.i] ? lg('Kỷ lục ', 'Record ') + c3Clock(SAVE3.best[C3.i]) : '';
  setTimeout(() => { if (S.mode === 'c3play' && C3.view === 'over') $('#c3end').hidden = false; }, 500);
}
function updateC3(dt) {
  const z = c3Size();
  if (z.W !== C3.W || z.H !== C3.H) { C3.W = z.W; C3.H = z.H; C3.game.resize(z.W / z.u, z.H / z.u); }
  if (C3.view === 'play') C3.game.update(dt); else C3.printT += dt;   // (both 'print' and 'over' just animate)
  if (C3.view === 'play' && !C3.game.isWon()) C3.time += dt;           // the clock stops the moment the last chick is home
  // a game may show the ◀ ▶ buttons only at times (padOn), split to the two sides, on every screen
  if (C3.game.padOn) {
    const on = C3.view === 'play' && C3.game.padOn(), p = $('#pad');
    if (p.hidden === on) p.hidden = !on;
    p.classList.toggle('split', on); p.classList.toggle('pulse', on && !!C3.game.padPulse && C3.game.padPulse());
  }
  const L = C3.game.timeLimit;
  if (L && C3.view === 'play' && C3.time >= L) { C3.time = L; if (C3.game.passed()) c3Win(); else c3Fail(); }
  const D = L || C3.game.clockDown;                                    // clockDown: count down for show, the game ends it itself
  const sec = D ? Math.max(0, Math.ceil(D - C3.time)) : Math.floor(C3.time);   // timed rounds count down
  if (sec !== C3.shown) { C3.shown = sec; $('#c3Time').textContent = c3Clock(sec); $('#c3Time').classList.toggle('hurry', !!D && sec <= 10); if (D && sec <= 5 && sec > 0 && C3.view === 'play') AU.pluck(60 + sec); }
}
function renderC3() {
  const z = c3Size(), pal = PAPERS[C3.game.paper], LW = z.W / z.u, LH = z.H / z.u;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = pal.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR * z.u, 0, 0, DPR * z.u, 0, 0);
  const pw = PAPER.width; for (let x = 0; x < LW; x += pw) ctx.drawImage(PAPER, x, -20, pw, Math.max(LH + 40, PAPER.height));
  C3.game.render(ctx, z.u);
  c3DrawHand(ctx);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (C3.view === 'over') { ctx.globalAlpha = Math.min(.45, C3.printT * 3); ctx.fillStyle = INK; ctx.fillRect(0, 0, z.W, z.H); ctx.globalAlpha = 1; }
  if (C3.view === 'print') {
    ctx.globalAlpha = Math.min(.55, C3.printT * 4); ctx.fillStyle = INK; ctx.fillRect(0, 0, z.W, z.H); ctx.globalAlpha = 1;
    if (C3.img && C3.img.complete && C3.img.naturalWidth) c3DrawPrint(C3.img, z.W, z.H, C3.printT);
    else C3.game.printRender(ctx, z.W, z.H, C3.printT);
  }
  if (C3.view === 'play' && C3.game.overlay) C3.game.overlay(ctx, z.W, z.H);   // screen-space extras, e.g. a how-to
  const m = 10; ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.strokeRect(m, m, z.W - m * 2, z.H - m * 2);
  ctx.lineWidth = 1.2; ctx.strokeRect(m + 6, m + 6, z.W - m * 2 - 12, z.H - m * 2 - 12);
}
// the reward: the real print, framed like a sheet of dó paper, with the workshop seal stamped on
function c3DrawPrint(img, W, H, k) {
  const room = H - 230, s = Math.min((W - 48) / img.naturalWidth, room / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
  const pop = .92 + .08 * Math.min(1, k * 5), x = W / 2, y = 30 + room / 2 + 10;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.globalAlpha = Math.min(1, k * 6);
  ctx.fillStyle = '#f2ecde'; ctx.strokeStyle = INK; ctx.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24);
  ctx.lineWidth = 3; ctx.strokeRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.lineWidth = 1.2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.globalAlpha = 1;
  if (k > .3) { const kk = Math.min(1, (k - .3) / .25), sc = (1.8 - .8 * kk) * Math.max(.6, Math.min(1, w / 700)); ctx.globalAlpha = kk; dp(ctx, PROPS.seal, w / 2 - 34, h / 2 - 34, -.08, sc, sc); ctx.globalAlpha = 1; }
  ctx.restore();
}
// the hand pointer (game.handCursor, computers only): drawn in the game's own units at the pointer, fingertip on the spot
let C3HAND = null;
function c3HandArt() {
  if (C3HAND) return C3HAND;
  C3HAND = {
    point: part([-20, -3, 30, 48], a => {                            // index finger up, fingertip at (0, 0)
      a.fk('white', tube([[0, 22], [0, 10], [0, 2]], 10, 9), 2);
      a.fk('white', smooth([[-10, 18], [6, 16], [24, 20], [26, 34], [20, 42], [-6, 42], [-12, 32]]), 2.2);
      for (const x of [9, 15, 21]) a.key(smooth([[x - 3, 22], [x, 19], [x + 3, 23]], false), 1.3);
      a.fk('white', tube([[-9, 32], [-15, 24], [-15, 16]], 8, 7), 1.8);
      a.fk('red', smooth([[-8, 41], [22, 41], [21, 47], [-7, 47]]), 1.8);
    }),
    grab: part([-22, -18, 26, 30], a => {                            // a fist holding on, centred on (0, 0)
      a.fk('white', smooth([[-16, -6], [-10, -14], [14, -14], [20, -6], [20, 14], [12, 22], [-12, 22], [-18, 12]]), 2.2);
      for (const x of [-9, -1, 7, 14]) a.key(smooth([[x - 3, -12], [x, -4], [x + 3, -12]], false), 1.3);
      a.fk('white', tube([[-17, 4], [-6, 2], [4, 4]], 9, 7), 1.8);
      a.fk('red', smooth([[-10, 21], [14, 21], [13, 28], [-9, 28]]), 1.8);
    }),
  };
  return C3HAND;
}
function c3DrawHand(g) {
  if (!C3.ptr || !C3.game.handCursor || isTouch || C3.view !== 'play') return;
  const H = c3HandArt(), [x, y] = C3.ptr, s = .9;
  if (C3.pressed) dp(g, H.grab, x, y, -.15, s, s); else dp(g, H.point, x, y, -.28, s, s);
}
const c3Point = e => { const r = cv.getBoundingClientRect(), u = c3Size().u; return [(e.clientX - r.left) / u, (e.clientY - r.top) / u]; };
function c3Down(e) { C3.ptr = c3Point(e); if (C3.view !== 'play') return; if (C3.game.down(...C3.ptr)) { capturePointer(e); C3.pressed = true; } }
function c3Move(e) { C3.ptr = c3Point(e); if (C3.view === 'play') C3.game.move(...C3.ptr); }
function c3Up() { C3.pressed = false; if (C3.view === 'play') C3.game.up(); }
cv.addEventListener('pointerleave', () => { C3.ptr = null; });
function c3Key(e) {
  if (e.code === 'Escape') { showAlbum(3); return; }
  keys.add(e.code); if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
}
$('#c3Name').addEventListener('click', () => showAlbum(3));
$('#c3Again').addEventListener('click', () => startC3(C3.i));
$('#c3Album').addEventListener('click', () => showAlbum(3));
function buildAlbum3() {
  const box = $('#cards'); box.textContent = '';
  C3GAMES.forEach((gm, i) => {
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = PAPERS[gm.paper].css;
    b.innerHTML = `<div class="num">${lg('Tranh', 'Picture')} ${i + 1}</div><div class="ch">${gm.han}</div><b>${gm.name}</b><span class="st${SAVE3.done[i] ? ' done' : ''}">${SAVE3.done[i] ? lg('Đã có tranh', 'Print won') + (gm.scoring === 'count' ? (SAVE3.most[i] ? ' · ' + SAVE3.most[i] + lg(' quả', '') : '') : SAVE3.best[i] ? ' · ' + c3Clock(SAVE3.best[i]) : '') : lg('Chơi', 'Play')}</span>`;
    b.addEventListener('click', () => startC3(i));
    box.appendChild(b);
  });
  for (let k = 0; k < C3_SOON; k++) {
    const b = document.createElement('button'); b.className = 'card'; b.disabled = true; b.style.background = '#cfcbd0';
    b.innerHTML = `<div class="num">${lg('Tranh', 'Picture')} ${C3GAMES.length + k + 1}</div><div class="ch">？</div><b>${lg('Sắp có', 'Coming soon')}</b><span class="st">${lg('Đang khắc ván', 'Being carved')}</span>`;
    box.appendChild(b);
  }
}

registerChapter({
  id: 3, modes: ['c3play'],
  card: { num: lg('Chương III', 'Chapter III'), han: '眼疾手快', name: lg('Nhanh Tay Nhanh Mắt', 'Quick Hands, Quick Eyes'), desc: lg('Những trò nhanh tay nhanh mắt cho các bạn nhỏ, trong các bức tranh Đông Hồ quen thuộc. Chơi xong được tặng tranh.', 'Quick games for little ones, inside well-loved Đông Hồ prints. Win one and the print is yours.'), bg: '#c9d6b4' },
  progress: () => `${SAVE3.done.filter(Boolean).length}/${C3GAMES.length} ${lg('tranh', 'prints')}`,
  hasProgress: () => SAVE3.done.some(Boolean),
  album() { buildAlbum3(); $('#albumTitle').textContent = lg('Chương III · Nhanh Tay Nhanh Mắt', 'Chapter III · Quick Hands, Quick Eyes'); $('#albumDesc').textContent = lg('Mỗi trò chơi là một bức tranh Đông Hồ. Chơi xong được tặng tranh.', 'Each game is a Đông Hồ print. Win it and the print is yours.'); },
  hide: c3Hide,
  update: updateC3, render: renderC3, key: c3Key,
  pointer: { down: c3Down, move: c3Move, up: c3Up },
  next() { if (C3GAMES[C3.i + 1]) startC3(C3.i + 1); else showAlbum(3); },
  retry() { startC3(C3.i); },
});
