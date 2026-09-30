/* Chương III shell: start a game, logical-unit canvas, the reward print, album and registration. */
const C3 = { i: 0, game: null, view: 'play', printT: 0, W: 0, H: 0, time: 0, shown: -1, img: null, stat: '' };
{
  const hud = document.createElement('div'); hud.id = 'c3hud'; hud.hidden = true;
  hud.innerHTML = '<button class="tag" id="c3Name" title="Về album tranh"></button><div class="tag" id="c3Time">0:00</div>';
  const end = document.createElement('div'); end.id = 'c3end'; end.hidden = true;
  end.innerHTML = '<p id="c3Praise"></p><p class="tag" id="c3Stat"></p><div class="row"><button class="btn" id="c3Again">Chơi lại</button><button class="btn alt" id="c3Album">Về album</button></div>';
  document.body.append(hud, end);
}
// logical units: the short side is 540 (460 on portrait phones, so chicks are big enough for small fingers)
// a game may ask for a different short side (e.g. Hứng Dừa zooms out on wide screens so the palm stands tall)
function c3Size() { const W = cv.width / DPR, H = cv.height / DPR, p = H > W, g = C3.game, short = g && g.short ? g.short(p) : (p ? 460 : 540); return { W, H, u: Math.min(W, H) / short }; }
function c3Hide() { $('#c3hud').hidden = true; $('#c3end').hidden = true; }
function startC3(i) {
  AU.init(); AU.setSong(2); AU.setQuiet(false); hideChapterHuds();
  S.chapter = 3; S.mode = 'c3play'; C3.i = i; C3.game = C3GAMES[i]; C3.view = 'play'; C3.printT = 0;
  PAPER = getPaper(C3.game.paper); document.documentElement.style.setProperty('--paper', PAPERS[C3.game.paper].css);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  $('#c3hud').hidden = false; $('#c3Name').textContent = `Tranh ${i + 1} · ${C3.game.name}`;
  const z = c3Size(); C3.W = z.W; C3.H = z.H; C3.game.resize(z.W / z.u, z.H / z.u);
  C3.game.start(); C3.game.onWin(c3Win);
  C3.time = 0; C3.shown = -1; $('#c3Time').textContent = '0:00';
  if (C3.game.print && (!C3.img || C3.img.dataset.src !== C3.game.print)) { C3.img = new Image(); C3.img.dataset.src = C3.game.print; C3.img.src = C3.game.print; }
  $('#lvHan').textContent = C3.game.han; $('#lvTitle').textContent = `Tranh ${i + 1} · ${C3.game.name}`;
  const c = $('#lvCard'); c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 2200);
  cv.focus();
}
function c3Win() {
  const t = Math.round(C3.time * 10) / 10, best = SAVE3.best[C3.i], record = !best || t < best;
  SAVE3.done[C3.i] = true; if (record) SAVE3.best[C3.i] = t; persist3();
  $('#c3Praise').textContent = C3.game.praise ? C3.game.praise() : '';
  $('#c3Stat').textContent = `Thời gian ${c3Clock(t)}${record ? (best ? ' · Kỷ lục mới!' : '') : ' · Kỷ lục ' + c3Clock(best)}`;
  C3.view = 'print'; C3.printT = 0; AU.stamp(); setTimeout(() => AU.pluck(88), 160);
  setTimeout(() => { if (S.mode === 'c3play' && C3.view === 'print') $('#c3end').hidden = false; }, 500);
}
function updateC3(dt) {
  const z = c3Size();
  if (z.W !== C3.W || z.H !== C3.H) { C3.W = z.W; C3.H = z.H; C3.game.resize(z.W / z.u, z.H / z.u); }
  if (C3.view === 'play') C3.game.update(dt); else C3.printT += dt;
  if (C3.view === 'play' && !C3.game.isWon()) C3.time += dt;           // the clock stops the moment the last chick is home
  const sec = Math.floor(C3.time); if (sec !== C3.shown) { C3.shown = sec; $('#c3Time').textContent = c3Clock(sec); }
}
function renderC3() {
  const z = c3Size(), pal = PAPERS[C3.game.paper], LW = z.W / z.u, LH = z.H / z.u;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = pal.base; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(DPR * z.u, 0, 0, DPR * z.u, 0, 0);
  const pw = PAPER.width; for (let x = 0; x < LW; x += pw) ctx.drawImage(PAPER, x, -20, pw, Math.max(LH + 40, PAPER.height));
  C3.game.render(ctx, z.u);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (C3.view === 'print') {
    ctx.globalAlpha = Math.min(.55, C3.printT * 4); ctx.fillStyle = INK; ctx.fillRect(0, 0, z.W, z.H); ctx.globalAlpha = 1;
    if (C3.img && C3.img.complete && C3.img.naturalWidth) c3DrawPrint(C3.img, z.W, z.H, C3.printT);
    else C3.game.printRender(ctx, z.W, z.H, C3.printT);
  }
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
const c3Point = e => { const r = cv.getBoundingClientRect(), u = c3Size().u; return [(e.clientX - r.left) / u, (e.clientY - r.top) / u]; };
function c3Down(e) { if (C3.view !== 'play') return; if (C3.game.down(...c3Point(e))) capturePointer(e); }
function c3Move(e) { if (C3.view === 'play') C3.game.move(...c3Point(e)); }
function c3Up() { if (C3.view === 'play') C3.game.up(); }
function c3Key(e) { if (e.code === 'Escape') showAlbum(3); }
$('#c3Name').addEventListener('click', () => showAlbum(3));
$('#c3Again').addEventListener('click', () => startC3(C3.i));
$('#c3Album').addEventListener('click', () => showAlbum(3));
function buildAlbum3() {
  const box = $('#cards'); box.textContent = '';
  C3GAMES.forEach((gm, i) => {
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = PAPERS[gm.paper].css;
    b.innerHTML = `<div class="num">Tranh ${i + 1}</div><div class="ch">${gm.han}</div><b>${gm.name}</b><span class="st${SAVE3.done[i] ? ' done' : ''}">${SAVE3.done[i] ? 'Đã có tranh' + (SAVE3.best[i] ? ' · ' + c3Clock(SAVE3.best[i]) : '') : 'Chơi'}</span>`;
    b.addEventListener('click', () => startC3(i));
    box.appendChild(b);
  });
  for (let k = 0; k < C3_SOON; k++) {
    const b = document.createElement('button'); b.className = 'card'; b.disabled = true; b.style.background = '#cfcbd0';
    b.innerHTML = `<div class="num">Tranh ${C3GAMES.length + k + 1}</div><div class="ch">？</div><b>Sắp có</b><span class="st">Đang khắc ván</span>`;
    box.appendChild(b);
  }
}

registerChapter({
  id: 3, modes: ['c3play'],
  card: { num: 'Chương III', han: '眼疾手快', name: 'Nhanh Tay Nhanh Mắt', desc: 'Những trò nhanh tay nhanh mắt cho các bạn nhỏ, trong các bức tranh Đông Hồ quen thuộc. Chơi xong được tặng tranh.', bg: PAPERS.sage.css },
  progress: () => `${SAVE3.done.filter(Boolean).length}/${C3GAMES.length} tranh`,
  hasProgress: () => SAVE3.done.some(Boolean),
  album() { buildAlbum3(); $('#albumTitle').textContent = 'Chương III · Nhanh Tay Nhanh Mắt'; $('#albumDesc').textContent = 'Mỗi trò chơi là một bức tranh Đông Hồ. Chơi xong được tặng tranh.'; },
  hide: c3Hide,
  update: updateC3, render: renderC3, key: c3Key,
  pointer: { down: c3Down, move: c3Move, up: c3Up },
  next() { if (C3GAMES[C3.i + 1]) startC3(C3.i + 1); else showAlbum(3); },
  retry() { startC3(C3.i); },
});
