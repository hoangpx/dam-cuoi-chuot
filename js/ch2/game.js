/* Chương II game: saves, play/undo/reset, end screen, input, drawing, album and registration. */
/* ---------- chapter II game ---------- */
const C2 = { i: 0, def: null, st: null, hist: [], moves: 0, over: false, endT: 0, last: 0, deadToast: false, t: 0 };
let SAVE2 = { done: [], best: [] };
try { const s = JSON.parse(localStorage.getItem('dcc.c2') || 'null'); if (s && Array.isArray(s.done)) SAVE2 = Object.assign(SAVE2, s); } catch (e) {}
for (const k of ['done', 'best', 'paid']) { if (!Array.isArray(SAVE2[k])) SAVE2[k] = []; while (SAVE2[k].length < C2LEVELS.length) SAVE2[k].push(k === 'best' ? 0 : false); }
const persist2 = () => { try { localStorage.setItem('dcc.c2', JSON.stringify(SAVE2)); } catch (e) {} };
const c2Sig = r => r.a + ':' + r.verb + (r.neg ? '!' : '') + ':' + (r.prop || r.to) + ':' + r.cells.map(o => o.id).join(',');
const c2Clone = objs => objs.map(o => ({ ...o }));
/* ---------- the rules sheet: how the game works. Gợi ý is bought once per map (js/core/goiy.js, SAVE2.paid), then free to reread: the chain of rules (C2_CHAIN) ---------- */
{
  const el = document.createElement('div'); el.id = 'c2help'; el.hidden = true;
  const w = t => `<b class="w">${t}</b>`;
  el.innerHTML = `<div class="card2"><div id="c2law"><h3>Luật chơi</h3><ul>
    <li>Chữ là luật: xếp ${w('VẬT')} ${w('LÀ')} ${w('TÍNH CHẤT')} thành một hàng ngang (trái sang phải) hoặc hàng dọc (trên xuống dưới) thì câu đó thành luật. Tách một chữ ra là luật mất.</li>
    <li>${w('ĐI')} vật bạn điều khiển · ${w('THẮNG')} chạm vào là qua tranh · ${w('CHẶN')} không đi qua được · ${w('ĐẨY')} đẩy được · ${w('NÓNG')} chạm vào là cháy · ${w('CHÌM')} vật nào rơi vào thì cả hai cùng mất.</li>
    <li id="c2more">Chữ mới: ${w('MỞ')} gặp ${w('KHOÁ')} thì cả hai cùng mất (thứ KHOÁ chặn mọi thứ trừ thứ MỞ) · ${w('BAY')} chỉ chạm được thứ cũng BAY · ${w('KÉO')} đi theo sau thứ rời khỏi nó · ${w('CHẠY')} tự đi mỗi bước, gặp vật chặn thì quay đầu · ${w('YẾU')} có gì chung ô là vỡ.<br>${w('VÀ')} nối nhiều vật hay nhiều tính chất · ${w('KHÔNG')} xoá một tính chất · ${w('CÓ')}: vật mất đi để lại thứ nó có · ${w('CHỮ')} là chính các ô chữ.</li>
    <li>${w('VẬT')} ${w('LÀ')} ${w('VẬT')}, ví dụ ${w('MÈO')} ${w('LÀ')} ${w('CÁ')}: mọi con mèo hóa thành cá.</li>
    <li>Đi vào chữ là đẩy chữ. Chữ có đinh ghim ở góc thì không đẩy được; chữ đã vào góc hay sát mép thì không kéo ra được nữa.</li>
    <li id="c2ctl"></li></ul></div>
    <div id="c2tip"><h3>Gợi ý</h3><p></p></div>
    <button class="btn" id="c2Go">Chơi</button></div>`;
  document.body.appendChild(el);
  $('#c2ctl').textContent = isTouch ? 'Vuốt trên tranh hoặc bấm các nút mũi tên để đi · ↶ hoàn tác · ⟲ chơi lại.' : '← ↑ → ↓ để đi · Z hoàn tác · R chơi lại.';
  el.addEventListener('click', e => { if (e.target === el || e.target.id === 'c2Go') c2HelpClose(); });
}
function c2HelpOpen(which) {
  $('#c2law').hidden = which !== 'law'; $('#c2tip').hidden = which !== 'tip'; $('#c2more').hidden = !C2.def.bh;
  if (which === 'tip') $('#c2tip p').textContent = C2_CHAIN[C2.i] || '';
  $('#c2help').hidden = false; C2.help = which;
}
function c2HelpClose() { $('#c2help').hidden = true; cv.focus(); }
function c2Hide() { document.body.classList.remove('c2'); $('#c2hud').hidden = true; $('#c2rules').hidden = true; $('#c2pad').hidden = true; $('#c2help').hidden = true; }
function c2Load() {
  C2.st = c2Parse(C2.def); c2Settle(C2.st);
  C2.hist = []; C2.moves = 0; C2.over = false; C2.deadToast = false;
  c2ShowRules();
}
function startC2(i) {
  trackEnter(`chuong-2/man-${i + 1}`);
  AU.init(); AU.setSong(1); AU.setQuiet(false);
  S.chapter = 2; S.mode = 'c2play'; C2.i = i; C2.def = C2LEVELS[i]; document.body.classList.add('c2');
  PAPER = getPaper(C2.def.paper); document.documentElement.style.setProperty('--paper', PAPERS[C2.def.paper].css);
  AU.setKey(C2.def.key || 0);
  $('#album').hidden = true; $('#end').hidden = true; $('#title').hidden = true; $('#chapters').hidden = true;
  $('#hud').hidden = true; $('#abil').hidden = true; $('#pad').hidden = true;
  $('#c2hud').hidden = false; $('#c2rules').hidden = false; $('#c2pad').hidden = !isTouch;
  $('#c2Name').textContent = `Tranh ${i + 1} · ${C2.def.name}`;
  c2Load(); cv.focus();
  $('#lvHan').textContent = C2.def.han; $('#lvTitle').textContent = `Tranh ${i + 1} · ${C2.def.name}`;
  const c = $('#lvCard'); c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 2200);
  C2.hinted = false;
  $('#c2help').hidden = true; $('#c2Tip').hidden = false;
}
function c2ShowRules() {
  const seen = new Set(), chips = [];
  for (const r of C2.st.rules) { const t = `${C2K[r.a].vi} ${r.verb === 'has' ? 'CÓ' : 'LÀ'} ${r.neg ? 'KHÔNG ' : ''}${r.prop ? C2P[r.prop].vi : C2K[r.to].vi}`; if (!seen.has(t)) { seen.add(t); chips.push(t); } }
  $('#c2rules').innerHTML = chips.length ? chips.map(t => `<span class="rule">${t}</span>`).join('') : '<span class="rule">Chưa có luật nào</span>';
}
function c2Move(dx, dy) {
  if (!$('#c2help').hidden) { c2HelpClose(); return; }
  if (S.mode !== 'c2play' || C2.over) return;
  const st = C2.st, snap = c2Clone(st.objs), old = new Set(st.rules.map(c2Sig));
  for (const o of st.objs) if (o.t === 'thing' && dx && c2Has(st, o.k, 'you')) o.face = dx;
  if (!c2Step(st, dx, dy)) return;
  C2.hist.push(snap); if (C2.hist.length > 800) C2.hist.shift();
  C2.moves++;
  const now = new Set(st.rules.map(c2Sig));
  let formed = false, broken = false;
  for (const s of now) if (!old.has(s)) formed = true;
  for (const s of old) if (!now.has(s)) broken = true;
  if (formed) { AU.pluck(84); for (const r of st.rules) if (!old.has(c2Sig(r))) r.cells.forEach(o => { o.pop = .4; }); }
  else if (broken) AU.pluck(60); else AU.tap();
  c2ShowRules();
  if (st.won) c2Win();
  else if (st.dead && !C2.deadToast) { C2.deadToast = true; AU.thump(); toast('Chuột không còn nữa! Bấm Z (hoặc nút Hoàn tác) để lùi một bước.', 4); }
  if (!st.dead) C2.deadToast = false;
}
function c2Undo() {
  if (S.mode !== 'c2play' || !C2.hist.length) return;
  const st = C2.st, prev = C2.hist.pop(), cur = new Map(st.objs.map(o => [o.id, o]));
  st.objs = prev.map(o => { const c = cur.get(o.id); return { ...o, rx: c ? c.rx : o.x, ry: c ? c.ry : o.y }; });
  c2Settle(st); C2.moves = C2.hist.length; C2.over = false; C2.deadToast = false;
  $('#end').hidden = true; AU.tap(); c2ShowRules();
}
function c2Reset() { if (S.mode !== 'c2play') return; $('#end').hidden = true; c2Load(); AU.click(); }
function c2Win() {
  C2.over = true; C2.endT = 0; AU.stamp(); setTimeout(() => AU.pluck(88), 160); setTimeout(() => AU.pluck(93), 320);
  const i = C2.i; SAVE2.done[i] = true; SAVE2.best[i] = SAVE2.best[i] ? Math.min(SAVE2.best[i], C2.moves) : C2.moves; persist2(); trackWin();
}
function c2ShowEnd() {
  const i = C2.i, last = i === C2LEVELS.length - 1, n = SAVE2.done.filter(Boolean).length;
  $('#endHan').textContent = C2.def.han; $('#endTitle').textContent = C2.def.name;
  $('#endText').textContent = last ? `Đủ ${C2LEVELS.length} tranh chữ khắc gỗ, kể cả các tranh Cao thủ. Chương II hoàn thành.` : i === C2_FIRST_HARD - 1 ? 'Xong phần Nhập môn. Phần Cao thủ và phần Biến hoá đã mở.' : C2.def.bh ? 'Chữ mới, luật mới, vẫn tìm ra lối. Giỏi!' : C2.def.hard ? 'Tự nghĩ ra được. Cao thủ thật!' : 'Luật đã nằm trong tay người chơi. Tranh tiếp theo khó hơn một chút.';
  $('#endNote').textContent = `Số bước: ${C2.moves} · Kỷ lục: ${SAVE2.best[i]} · Đã đóng triện ${n}/${C2LEVELS.length} tranh`;
  $('#bNext').hidden = last; $('#end').hidden = false; ($('#bNext').hidden ? $('#bAlbum') : $('#bNext')).focus();
}
function updateC2(dt) {
  C2.t += dt;
  const st = C2.st, k = Math.min(1, dt * 16);
  for (const o of st.objs) {
    if (o.rx === undefined) { o.rx = o.x; o.ry = o.y; }
    o.rx += (o.x - o.rx) * k; o.ry += (o.y - o.ry) * k;
    if (o.pop) o.pop = Math.max(0, o.pop - dt * 1.8);
  }
  if (C2.over) { C2.endT += dt; if (C2.endT > 1.5 && $('#end').hidden) c2ShowEnd(); }
}
function c2Key(e) {
  const m = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] }[e.code];
  if (m) { e.preventDefault(); const now = performance.now(); if (e.repeat && now - C2.last < 120) return; C2.last = now; c2Move(m[0], m[1]); return; }
  if (e.code === 'KeyZ' || e.code === 'KeyU' || e.code === 'Backspace') { e.preventDefault(); c2Undo(); }
  else if (e.code === 'KeyR') c2Reset();

  else if (e.code === 'Escape') showAlbum(2);
}
$('#c2Undo').addEventListener('click', () => { c2Undo(); cv.focus(); });
$('#c2Reset').addEventListener('click', () => { c2Reset(); cv.focus(); });
for (const [id, which] of [['#c2Help', 'law'], ['#c2Tip', 'tip']]) $(id).addEventListener('click', () => { if (which === 'tip') { c2HintAsk(); return; } if ($('#c2help').hidden || C2.help !== which) c2HelpOpen(which); else c2HelpClose(); });
// a bought hint: paid once for this map, then free to read again (owner)
function c2HintAsk() {
  if (S.mode !== 'c2play') return;
  if (!$('#c2help').hidden && C2.help === 'tip') { c2HelpClose(); return; }
  if (SAVE2.paid[C2.i]) { c2HelpOpen('tip'); return; }
  hintBuy('Xem chuỗi luật cần ghép ở tranh này. Mua một lần, xem lại bao nhiêu lần cũng được.', () => { SAVE2.paid[C2.i] = true; persist2(); C2.hinted = true; c2HelpOpen('tip'); });
}

$('#c2Name').addEventListener('click', () => showAlbum(2));
document.querySelectorAll('#c2pad button').forEach(b => {
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[b.dataset.d]; let iv = null;
  const stop = () => { if (iv) { clearInterval(iv); iv = null; } };
  b.addEventListener('pointerdown', e => { e.preventDefault(); c2Move(d[0], d[1]); stop(); iv = setInterval(() => c2Move(d[0], d[1]), 170); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, stop));
});
function renderC2() {
  const w = cv.width / DPR, h = cv.height / DPR, pal = PAPERS[C2.def.paper], st = C2.st;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = pal.base; ctx.fillRect(0, 0, w, h);
  const img = getPaper(C2.def.paper);
  for (let py = 0; py < h; py += img.height) for (let px = 0; px < w; px += img.width) ctx.drawImage(img, px, py);
  ctx.fillStyle = pal.spark;
  const sr = mulberry(9);
  for (let n = 0; n < 160; n++) {
    const sx = sr() * w, sy = sr() * h, p = sr() * 6.28, ss = .6 + sr(), a = Math.pow(Math.max(0, Math.sin(C2.t * 1.6 + p)), 10) * .75;
    if (a > .02) { ctx.globalAlpha = a; ctx.fillRect(sx, sy, ss * 1.6, ss * .8); }
  }
  ctx.globalAlpha = 1;
  const topPad = 64, botPad = isTouch ? 250 : 92;
  let ts = Math.floor(Math.min((w - 32) / st.W, (h - topPad - botPad) / st.H));
  ts = Math.max(28, Math.min(92, ts));
  const bw = ts * st.W, bh = ts * st.H, ox = Math.floor((w - bw) / 2), oy = Math.floor(topPad + Math.max(0, (h - topPad - botPad - bh) / 2));
  ctx.fillStyle = 'rgba(255,250,235,.26)'; ctx.fillRect(ox, oy, bw, bh);
  ctx.strokeStyle = 'rgba(29,25,21,.16)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 1; x < st.W; x++) { ctx.moveTo(ox + x * ts, oy); ctx.lineTo(ox + x * ts, oy + bh); }
  for (let y = 1; y < st.H; y++) { ctx.moveTo(ox, oy + y * ts); ctx.lineTo(ox + bw, oy + y * ts); }
  ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.strokeRect(ox - 6, oy - 6, bw + 12, bh + 12);
  ctx.lineWidth = 1.2; ctx.strokeRect(ox - 11, oy - 11, bw + 22, bh + 22);
  const active = new Set(); for (const r of st.rules) r.cells.forEach(o => active.add(o.id));
  const z = o => o.t === 'thing' ? (c2Has(st, o.k, 'you') ? 1 : 0) : 2;
  const order = st.objs.slice().sort((a, b) => z(a) - z(b));
  const bob = Math.sin(C2.t * 3) * 1.2;
  for (const o of order) {
    const cx = ox + ((o.rx ?? o.x) + .5) * ts, cy = oy + ((o.ry ?? o.y) + .5) * ts, pop = 1 + (o.pop || 0) * .6;
    if (o.t === 'thing') {
      const you = c2Has(st, o.k, 'you'), fly = c2Has(st, o.k, 'float'), sc = ts / 84 * (o.k === 'fish' ? 1.4 : 1) * pop * (fly ? .9 : 1);
      if (fly) { ctx.fillStyle = 'rgba(29,25,21,.16)'; ctx.beginPath(); ctx.ellipse(cx, cy + ts * .34, ts * .3, ts * .08, 0, 0, 6.283); ctx.fill(); }   // floaters hover over their shadow
      dp(ctx, C2T[o.k], cx, cy + (you ? bob : 0) - (fly ? ts * .14 + Math.sin(C2.t * 2.2 + o.id) * ts * .04 : 0), 0, sc * (o.k === 'mouse' && o.face < 0 ? -1 : 1), sc);
    } else {
      const key = o.t === 'noun' ? 'n:' + o.k : o.t === 'prop' ? 'p:' + o.p : o.t, sc = ts / 84 * pop;
      if (active.has(o.id)) { ctx.fillStyle = 'rgba(242,198,64,.6)'; ctx.fillRect(cx - ts * .5 + 1, cy - ts * .5 + 1, ts - 2, ts - 2); }
      dp(ctx, C2T.tiles[key + (o.fix ? ':f' : '')], cx, cy, 0, sc, sc);
    }
  }
  const m = 10;
  ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.strokeRect(m, m, w - m * 2, h - m * 2);
  ctx.lineWidth = 1.2; ctx.strokeRect(m + 6, m + 6, w - m * 2 - 12, h - m * 2 - 12);
  if (C2.over) { const kk = Math.min(1, C2.endT / .35), sc = 1.8 - .8 * kk; ctx.globalAlpha = kk; dp(ctx, PROPS.seal, w - 70, h - 76, -.06, sc, sc); ctx.globalAlpha = 1; }
}

function buildAlbum2() {
  const box = $('#cards'); box.textContent = '';
  C2LEVELS.forEach((lv, i) => {
    if (i === 0 || i === C2_FIRST_HARD || i === C2_FIRST_BH) { const h = document.createElement('div'); h.className = 'sec'; h.textContent = i === 0 ? 'Nhập môn' : i === C2_FIRST_HARD ? 'Cao thủ · mở sau tranh 4' : `Biến hoá · chữ mới · mở sau tranh ${C2_FIRST_HARD}`; box.appendChild(h); }
    const open = i === 0 || SAVE2.done[i - 1] || (i === C2_FIRST_HARD && SAVE2.done[3]) || (i === C2_FIRST_BH && SAVE2.done[C2_FIRST_HARD - 1]);
    const b = document.createElement('button');
    b.className = 'card'; b.style.background = PAPERS[lv.paper].css; b.disabled = !open;
    b.innerHTML = `<div class="num">Tranh ${i + 1}</div><div class="ch">${lv.han}</div><b>${lv.name}</b><span class="st${SAVE2.done[i] ? ' done' : ''}">${SAVE2.done[i] ? 'Đã đóng triện · ' + SAVE2.best[i] + ' bước' : open ? 'Chơi' : 'Chưa mở'}</span>`;
    b.addEventListener('click', () => { if (open) startC2(i); });
    box.appendChild(b);
  });
}

/* ---------- swipe on the canvas ---------- */
let c2Swipe = null;
function c2PointerDown(e) { c2Swipe = { x: e.clientX, y: e.clientY }; }
function c2PointerUp(e) {
  if (S.drag) { S.drag = null; return; }
  if (!c2Swipe) return;
  const dx = e.clientX - c2Swipe.x, dy = e.clientY - c2Swipe.y; c2Swipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
  if (Math.abs(dx) > Math.abs(dy)) c2Move(dx > 0 ? 1 : -1, 0); else c2Move(0, dy > 0 ? 1 : -1);
}

/* ---------- registration ---------- */
registerChapter({
  id: 2, modes: ['c2play'],
  card: { num: lg('Chương II', 'Chapter II'), han: '字即法', name: lg('Chữ Là Luật', 'Words Are the Law'), desc: lg('Chữ khắc gỗ chính là luật chơi. Đẩy chữ để ghép, phá hay đổi luật rồi đưa chuột tới cổng. Có phần Nhập môn và phần Cao thủ.', 'The carved words are the rules. Push them to make, break or change a rule, then get the mouse to the gate. For beginners and masters.'), bg: '#ebe3cd' },
  progress: () => `${SAVE2.done.filter(Boolean).length}/${C2LEVELS.length} ${lg('tranh', 'prints')}`,
  hasProgress: () => SAVE2.done.some(Boolean),
  album() { buildAlbum2(); $('#albumTitle').textContent = 'Chương II · Chữ Là Luật'; $('#albumDesc').textContent = 'Chữ khắc gỗ là luật chơi. Đẩy chữ để ghép, phá hay đổi luật, rồi đưa chuột tới cổng. Qua tranh này mới mở tranh sau.'; },
  hide: c2Hide,
  update: updateC2, render: renderC2, key: c2Key,
  pointer: { down: c2PointerDown, up: c2PointerUp },
  next() { startC2(C2.i + 1); },
  retry() { $('#end').hidden = true; c2Load(); cv.focus(); },
});
