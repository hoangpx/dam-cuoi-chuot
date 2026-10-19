/* Chương V · Hội Làng — the nine newer games (HL_G, same shape as in tro.js). Rules live on the server (server/phong-choi/src/index.js);
   this only draws what it is told and sends the player's taps.
     chuot  tap the hole the mole comes out of      hpb   guess the number nearest 2/3 of the average
     khac   find the tile of a different shade      dem   count the shapes that flash and hide
     xep    tap 1..9 in order                        mau   tap the INK colour, not the word
     tinh   tap the right answer of a sum            lat   flip cards and find the pairs
     chen   follow the ball under the cups.
   Games with something to tap on make the info panel taller while they run (gm.ipH); their tiles are buttons pushed from info(). */

const hlMy = () => HL.my || (HL.my = {});
// one action with the press time from the event (so reaction games are timed from the tap)
function hlAct2(o, ts) { const r = hlSync(HL.round); if (!hlCanAct(r)) return false; HL_NET.send({ t: 'act', n: r.n, at: hlTs(ts), ...o }); return true; }
// a tap tile inside the info panel: registers the button and draws its plate
function hlTileBtn(g, id, x, y, w, h, fill, down, off, r = 8) {
  HL.btns.push({ id, x, y, w, h, down, off });
  g.globalAlpha = off ? .55 : 1; hlPlate(g, x, y, w, h, fill, HL_INK, r); g.globalAlpha = 1;
}
const hlLocked = (r, now) => { const m = hlMy(); return !!(m.lock && now - r.t0 < m.lock); };
const hlTall = (frac, minH) => (W, H) => Math.max(minH || 150, Math.min(W - 20, H * frac));

/* ---------- 1. mole ---------- */
function hlMole(g, x, y, s, on) {
  g.beginPath(); g.ellipse(x, y, s * 1.1, s * .55, 0, 0, 6.283); g.fillStyle = '#4a2a1a'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = HL_INK; g.stroke();
  if (!on) return;
  g.beginPath(); g.arc(x, y - s * .35, s * .8, Math.PI, 0); g.lineTo(x + s * .8, y); g.lineTo(x - s * .8, y); g.closePath(); g.fillStyle = '#9b6b3e'; g.fill(); g.stroke();
  g.fillStyle = HL_INK; g.beginPath(); g.arc(x - s * .3, y - s * .45, s * .1, 0, 6.283); g.arc(x + s * .3, y - s * .45, s * .1, 0, 6.283); g.fill();
  g.fillStyle = '#e8a9a0'; g.beginPath(); g.ellipse(x, y - s * .2, s * .16, s * .11, 0, 0, 6.283); g.fill();
}
HL_G.chuot = {
  name: 'Đập chuột chũi', rule: 'Chín cái hang, chuột chũi bất ngờ chui lên ở một hang. Chạm đúng hang đó trước mọi người! Chạm nhầm bị khóa 1 giây.', ctl: 'tiles', ipH: hlTall(.4),
  controls: (r, W, H, b) => ({ btns: b, h: 30 }),
  info(g, r, now, b) {
    const m = hlMy(), s = Math.max(30, Math.min((b.w - 16) / 3, (b.h - 28) / 3)), x0 = b.W / 2 - s * 1.5, y0 = b.y + 2, lock = hlLocked(r, now), off = !!m.done || lock;
    for (let i = 0; i < 9; i++) {
      const cx = x0 + (i % 3) * s + s / 2, cy = y0 + ((i / 3) | 0) * s + s / 2;
      HL.btns.push({ id: 'mh' + i, x: cx - s / 2, y: cy - s / 2, w: s, h: s, down: e => { if (!off) hlAct2({ k: 'p', v: i }, e.timeStamp); }, off });
      hlMole(g, cx, cy + s * .08, s * .34, r.go && r.cfg.hole === i);
    }
    hlText(g, m.done ? 'Bạn đã chạm trúng ✓' : lock ? 'Chạm nhầm, bị khóa 1 giây…' : r.go ? 'CHẠM VÀO HANG CÓ CHUỘT!' : 'Chờ chuột chũi chui lên…', b.W / 2, b.y + b.h - 8, 14, { w: 900, c: m.done ? '#2f6a4c' : lock ? '#a3332a' : r.go ? '#a3332a' : HL_INK, o: false });
  },
  cell(g, r, p, C, res, win) { const x = r.inp.get(p.id); if (res) { if (res.v !== null) hlResText(g, C, `${res.v} ms`, win); else hlResText(g, C, 'không chạm', false, '#777'); } else if (x && x.done) hlTick(g, C); else if (x && x.wrong) hlTick(g, C, false); },
  val: (r, row) => `${row.v} ms`, win: (r, row) => `chạm sau ${row.v} mili giây`,
  mine: (r, row) => row.v === null ? 'Bạn không chạm kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${row.v} ms`,
};

/* ---------- 2. two thirds of the average ---------- */
HL_G.hpb = {
  name: 'Hai phần ba', rule: 'Chọn một số từ 0 đến 100. Số nào gần nhất 2/3 trung bình các số của cả phòng thì thắng. Nhiều người cùng gần như nhau thì chia hũ.', ctl: 'step',
  controls(r, W, H, b) {
    const m = hlMy();   // two minus buttons, the value, two plus buttons
    const gap = 6, bw = (W - 20 - gap * 4) / 5, y = H - 126;
    const mk = (i, st) => hlBtn({ id: 'hs' + st, label: (st > 0 ? '+' : '−') + Math.abs(st), size: 18, x: 10 + i * (bw + gap), y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, down: () => { m.v = Math.max(0, Math.min(100, (m.v ?? 33) + st)); } });
    b.push(mk(0, -10), mk(1, -1)); b.push(hlBtn({ id: 'hsv', label: String(m.v ?? 33), size: 24, x: 10 + 2 * (bw + gap), y, w: bw, h: 46, fill: '#f2ecde', ink: HL_INK, off: true })); b.push(mk(3, 1), mk(4, 10));
    b.push(hlWide(W, H, { id: 'hsok', key: ' ', label: m.sent ? `Đã chốt ${m.sent} · đổi thì bấm lại` : 'CHỐT SỐ', size: 18, fill: '#2f6a4c', fillDown: '#1f4a34', down: e => { m.sent = m.v ?? 33; hlAct2({ k: 'v', v: m.sent }, e.timeStamp); AU.pluck(90); r.picked.add(HL.id); } }));
    return { btns: b, h: 134 };
  },
  info(g, r, now, b) {
    const m = hlMy();
    hlText(g, String(m.v ?? 33), b.W / 2, b.y + b.h / 2 - 6, Math.min(54, b.h * .5), { w: 900, c: m.sent ? '#2f6a4c' : HL_INK });
    hlText(g, `${r.picked.size}/${r.seated.size} người đã chốt · còn ${Math.max(0, Math.ceil((r.cfg.len - (now - r.t0)) / 1000))} giây`, b.W / 2, b.y + b.h - 8, 12, hlSub);
  },
  cell(g, r, p, C, res, win) { if (res) { if (res.v !== null) hlResText(g, C, String(res.v), win); else hlResText(g, C, 'không chọn', false, '#777'); } else if (r.picked.has(p.id)) hlTick(g, C); },
  val: (r, row) => `chọn ${row.v}`, win: (r, row) => `chọn ${row.v}, gần ${r.extra.target} (2/3 của ${r.extra.avg})`,
  mine: (r, row) => row.v === null ? 'Bạn không chọn số' : `Bạn chọn ${row.v} · mốc ${r.extra.target} · hạng ${row.rank}/${r.result.rows.length}`,
};

/* ---------- 3. the tile of a different shade ---------- */
HL_G.khac = {
  name: 'Tìm ô khác màu', rule: 'Một lưới ô cùng màu, chỉ có một ô đậm nhạt khác một chút. Chạm đúng ô đó nhanh nhất! Chạm nhầm bị khóa 2 giây.', ctl: 'tiles', ipH: hlTall(.46),
  controls: (r, W, H, b) => ({ btns: b, h: 30 }),
  info(g, r, now, b) {
    const m = hlMy(), n = r.cfg.n, s = Math.max(20, Math.min((b.w - 16) / n, (b.h - 26) / n)), x0 = b.W / 2 - s * n / 2, y0 = b.y + 2, lock = hlLocked(r, now), off = !!m.done || lock;
    const base = `hsl(${r.cfg.hue},55%,48%)`, odd = `hsl(${r.cfg.hue},55%,${48 + r.cfg.dl}%)`;
    for (let i = 0; i < n * n; i++) {
      const x = x0 + (i % n) * s, y = y0 + ((i / n) | 0) * s; g.fillStyle = i === r.cfg.odd ? odd : base; g.fillRect(x + 1, y + 1, s - 2, s - 2);
      HL.btns.push({ id: 'kt' + i, x, y, w: s, h: s, down: e => { if (!off) hlAct2({ k: 'p', v: i }, e.timeStamp); }, off });
    }
    if (lock) { g.fillStyle = 'rgba(242,236,222,.6)'; g.fillRect(x0, y0, s * n, s * n); }
    hlText(g, m.done ? 'Bạn đã tìm ra ✓' : lock ? 'Chạm nhầm, bị khóa 2 giây…' : 'Tìm ô khác màu!', b.W / 2, b.y + b.h - 8, 14, { w: 900, c: m.done ? '#2f6a4c' : lock ? '#a3332a' : HL_INK, o: false });
  },
  cell: (g, r, p, C, res, win) => HL_G.chuot.cell(g, r, p, C, res, win),
  val: (r, row) => hlTime(row.v), win: (r, row) => `tìm ra sau ${hlTime(row.v)}`,
  mine: (r, row) => row.v === null ? 'Bạn không tìm ra kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${hlTime(row.v)}`,
};

/* ---------- 4. count the shapes ---------- */
function hlShape(g, t, x, y, s) {
  g.lineWidth = 1.8; g.strokeStyle = HL_INK;
  if (t === 0) { g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fillStyle = '#a3332a'; }
  else if (t === 1) { g.beginPath(); g.rect(x - s, y - s, s * 2, s * 2); g.fillStyle = '#2f6a4c'; }
  else { g.beginPath(); g.moveTo(x, y - s * 1.1); g.lineTo(x + s * 1.1, y + s * .9); g.lineTo(x - s * 1.1, y + s * .9); g.closePath(); g.fillStyle = '#f2c640'; }
  g.fill(); g.stroke();
}
HL_G.dem = {
  name: 'Đếm nhanh', rule: 'Một đàn hình hiện ra trong 2 giây rồi biến mất. Đếm tất cả rồi đoán số lượng. Ai đoán gần đúng nhất thắng, cùng gần như nhau thì chia hũ.', ctl: 'step', ipH: hlTall(.34),
  controls(r, W, H, b) {
    const m = hlMy(), showing = hlEnd(r) < r.cfg.show - 50, gap = 6, bw = (W - 20 - gap * 4) / 5, y = H - 126, off = showing || !!m.sent;
    const mk = (i, st) => hlBtn({ id: 'ds' + st, label: (st > 0 ? '+' : '−') + Math.abs(st), size: 18, x: 10 + i * (bw + gap), y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, off, down: () => { m.v = Math.max(0, Math.min(99, (m.v ?? 15) + st)); } });
    b.push(mk(0, -5), mk(1, -1)); b.push(hlBtn({ id: 'dsv', label: String(m.v ?? 15), size: 24, x: 10 + 2 * (bw + gap), y, w: bw, h: 46, fill: '#f2ecde', ink: HL_INK, off: true })); b.push(mk(3, 1), mk(4, 5));
    b.push(hlWide(W, H, { id: 'dsok', key: ' ', label: m.sent !== undefined ? `Đã chốt ${m.sent} ✓` : 'CHỐT', size: 20, fill: m.sent !== undefined ? '#bdb7a6' : '#2f6a4c', fillDown: '#1f4a34', ink: m.sent !== undefined ? HL_INK : '#f2ecde', off, down: e => { m.sent = m.v ?? 15; if (hlAct2({ k: 'v', v: m.sent }, e.timeStamp)) { r.picked.add(HL.id); AU.pluck(90); } } }));
    return { btns: b, h: 134 };
  },
  info(g, r, now, b) {
    const e = now - r.t0, showing = e < r.cfg.show;
    if (showing) { const s = Math.min(9, b.h * .05); for (const it of r.cfg.items) hlShape(g, it[2], b.x + 14 + it[0] * (b.w - 28), b.y + 8 + it[1] * (b.h - 44), s); }
    else hlText(g, '?', b.W / 2, b.y + b.h / 2 - 8, Math.min(60, b.h * .5), { w: 900, c: '#a3332a' });
    hlText(g, showing ? 'Đếm thật nhanh tất cả các hình!' : (hlMy().sent !== undefined ? `Bạn đoán ${hlMy().sent} · chờ mọi người` : 'Có bao nhiêu hình? Chọn số rồi chốt'), b.W / 2, b.y + b.h - 8, 13, hlSub);
  },
  cell(g, r, p, C, res, win) { if (res) { if (res.v !== null) hlResText(g, C, String(res.v), win); else hlResText(g, C, 'không đoán', false, '#777'); } else if (r.picked.has(p.id)) hlTick(g, C); },
  val: (r, row) => `đoán ${row.v}`, win: (r, row) => `đoán ${row.v}, đúng là ${r.extra.n}`,
  mine: (r, row) => row.v === null ? 'Bạn không đoán' : `Bạn đoán ${row.v} · đúng là ${r.extra.n} · hạng ${row.rank}/${r.result.rows.length}`,
};

/* ---------- 5. 1 to 9 in order ---------- */
HL_G.xep = {
  name: 'Xếp số 1 đến 9', rule: 'Chín ô số xáo trộn. Chạm lần lượt từ 1 đến 9 thật nhanh. Chạm sai bị phạt thêm 1 giây. Ai xong sớm nhất thắng.', ctl: 'tiles', ipH: hlTall(.34),
  controls: (r, W, H, b) => ({ btns: b, h: 30 }),
  info(g, r, now, b) {
    const m = hlMy(); m.c = m.c || 0; m.pen = m.pen || 0; const s = Math.max(28, Math.min((b.w - 16) / 3, (b.h - 28) / 3)), x0 = b.W / 2 - s * 1.5, y0 = b.y + 2, done = m.c >= 9;
    for (let i = 0; i < 9; i++) {
      const v = r.cfg.perm[i], x = x0 + (i % 3) * s, y = y0 + ((i / 3) | 0) * s, got = v <= m.c;
      hlTileBtn(g, 'xt' + i, x + 2, y + 2, s - 4, s - 4, got ? '#bdd7b8' : '#f2ecde', e => { if (done || got || !hlCanAct(r)) return; if (v === m.c + 1) { m.c++; AU.pluck(80 + m.c * 3); } else { m.pen++; m.flash = HL.t; AU.thump(); } hlAct2({ k: 't', v }, e.timeStamp); }, got);
      hlText(g, String(v), x + s / 2, y + s / 2, s * .45, { w: 900, c: got ? '#6a8a66' : HL_INK, o: false });
    }
    hlText(g, done ? 'Xong rồi! Chờ mọi người' : `Tiếp theo: ${m.c + 1}${m.pen ? ` · phạt ${m.pen} giây` : ''}`, b.W / 2, b.y + b.h - 8, 14, { w: 900, c: m.flash && HL.t - m.flash < .6 ? '#a3332a' : HL_INK, o: false });
  },
  cell(g, r, p, C, res, win) {
    const st = r.nho.get(p.id), c = p.id === HL.id ? (hlMy().c || 0) : st ? st.c : 0;
    if (res) { if (res.v !== null) hlResText(g, C, `${(res.v / 1000).toFixed(1)}s`, win); else hlResText(g, C, `${res.c || 0}/9`, false, '#777'); }
    else hlBar(g, C.x + C.w * .1, C.y + C.h * .2, C.w * .8, 7, c / 9, '#2f6a4c');
  },
  val: (r, row) => hlTime(row.v), win: (r, row) => `xong sau ${hlTime(row.v)}${row.pen ? ` (gồm phạt ${row.pen} giây)` : ''}`,
  mine: (r, row) => row.v === null ? `Bạn mới được ${row.c || 0}/9` : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${hlTime(row.v)}`,
};

/* ---------- 6. the ink, not the word ---------- */
const HL_MAU = [['ĐỎ', '#c0392b'], ['XANH', '#2f7ac0'], ['VÀNG', '#e0a81c'], ['TÍM', '#7b4aa8']];
HL_G.mau = {
  name: 'Chữ và màu', rule: 'Hiện một chữ chỉ màu nhưng viết bằng mực màu khác. Chạm đúng nút MÀU CỦA MỰC chứ không phải chữ! 5 lượt, đúng nhiều và nhanh nhất thắng.', ctl: 'colors',
  controls(r, W, H, btns) {
    const m = hlMy(); m.i = m.i || 0; const gap = 8, bw = (W - 20 - gap * 3) / 4, done = m.i >= r.cfg.rounds.length;
    for (let v = 0; v < 4; v++) btns.push(hlBtn({ id: 'mc' + v, key: String(v + 1), label: '', x: 10 + v * (bw + gap), y: H - 66, w: bw, h: 52, fill: HL_MAU[v][1], ink: '#f2ecde', off: done, down: e => { if (done) return; if (hlAct2({ k: 'a', i: m.i, v }, e.timeStamp)) { m.i++; AU.pluck(70 + v * 5); } } }));
    return { btns, h: 74 };
  },
  info(g, r, now, b) {
    const m = hlMy(); m.i = m.i || 0; const done = m.i >= r.cfg.rounds.length, cur = r.cfg.rounds[Math.min(m.i, r.cfg.rounds.length - 1)];
    if (!done) hlText(g, HL_MAU[cur.w][0], b.W / 2, b.y + b.h / 2 - 6, Math.min(62, b.h * .52), { w: 900, c: HL_MAU[cur.c][1], os: 'rgba(29,25,21,.85)' });
    else hlText(g, 'Xong rồi!', b.W / 2, b.y + b.h / 2 - 6, 30, { w: 900, c: '#2f6a4c' });
    hlText(g, done ? 'Chờ mọi người' : `Lượt ${m.i + 1}/${r.cfg.rounds.length} · chạm màu của MỰC`, b.W / 2, b.y + b.h - 8, 13, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const n = r.cfg.rounds.length, st = r.nho.get(p.id), c = p.id === HL.id ? (hlMy().i || 0) : st ? st.c : 0, rad = Math.max(1.8, Math.min(5, (C.w - 14) / (n * 2.6))), x0 = C.cx - (n - 1) * rad * 1.3;
    for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x0 + i * rad * 2.6, C.y + C.h * .2, rad, 0, 6.283); g.fillStyle = i < c ? '#2f6a4c' : 'rgba(29,25,21,.12)'; g.fill(); g.lineWidth = 1; g.strokeStyle = HL_INK; g.stroke(); }
    if (res) hlResText(g, C, `đúng ${res.v}/${n}`, win);
  },
  val: (r, row) => `đúng ${row.v}/${r.cfg.rounds.length}`, win: (r, row) => `đúng ${row.v}/${r.cfg.rounds.length} trong ${hlTime(row.at)}`,
  mine: (r, row) => `Bạn đúng ${row.v}/${r.cfg.rounds.length} · hạng ${row.rank}/${r.result.rows.length}`,
};

/* ---------- 7. a quick sum ---------- */
HL_G.tinh = {
  name: 'Tính nhẩm nhanh', rule: 'Hiện một phép tính, chạm đúng đáp án nhanh nhất. Chạm sai bị khóa 2 giây.', ctl: 'choices',
  controls(r, W, H, btns) {
    const m = hlMy(), now = HL_NET.now(), off = !!m.done || hlLocked(r, now), gap = 8, bw = (W - 20 - gap * 2) / 3;
    r.cfg.opts.forEach((v, i) => btns.push(hlBtn({ id: 'to' + i, key: String(i + 1), label: String(v), size: 22, x: 10 + (i % 3) * (bw + gap), y: H - 126 + ((i / 3) | 0) * 58, w: bw, h: 50, fill: '#c9a062', ink: HL_INK, off, down: e => { if (!off) hlAct2({ k: 'p', v: i }, e.timeStamp); } })));
    return { btns, h: 134 };
  },
  info(g, r, now, b) {
    const m = hlMy(), lock = hlLocked(r, now);
    hlText(g, r.cfg.expr + ' = ?', b.W / 2, b.y + b.h / 2 - 4, Math.min(44, b.w / (r.cfg.expr.length + 4) * 1.9), { w: 900 });
    hlText(g, m.done ? 'Bạn trả lời đúng ✓' : lock ? 'Sai rồi, bị khóa 2 giây…' : 'Chạm đáp án đúng ở dưới', b.W / 2, b.y + b.h - 8, 13, { w: 800, c: m.done ? '#2f6a4c' : lock ? '#a3332a' : HL_INK, o: false });
  },
  cell: (g, r, p, C, res, win) => HL_G.chuot.cell(g, r, p, C, res, win),
  val: (r, row) => hlTime(row.v), win: (r, row) => `trả lời đúng sau ${hlTime(row.v)}`,
  mine: (r, row) => row.v === null ? 'Bạn không trả lời kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${hlTime(row.v)}`,
};

/* ---------- 8. find the pairs ---------- */
const HL_FACE = [['●', '#a3332a'], ['■', '#2f7ac0'], ['▲', '#e0a81c'], ['◆', '#2f6a4c'], ['★', '#7b4aa8'], ['♥', '#d0607a']];
HL_G.lat = {
  name: 'Lật bài tìm cặp', rule: 'Mười hai lá bài úp, sáu cặp giống nhau. Lật hai lá giống nhau để ăn cặp. Ai được nhiều cặp nhất, nhanh nhất thắng.', ctl: 'tiles', ipH: hlTall(.4),
  controls: (r, W, H, b) => ({ btns: b, h: 30 }),
  info(g, r, now, b) {
    const m = hlMy(); m.face = m.face || {}; m.done = m.done || new Set(); if (m.hideAt && HL.t >= m.hideAt) { for (const i of m.hidePair) delete m.face[i]; m.hideAt = 0; }
    const cols = 4, rows = 3, s = Math.max(28, Math.min((b.w - 16) / cols, (b.h - 28) / rows)), x0 = b.W / 2 - s * cols / 2, y0 = b.y + 2, wait = m.hideAt > 0;
    for (let i = 0; i < 12; i++) {
      const x = x0 + (i % cols) * s, y = y0 + ((i / cols) | 0) * s, f = m.face[i], mt = m.done.has(i);
      hlTileBtn(g, 'lt' + i, x + 2, y + 2, s - 4, s - 4, mt ? '#bdd7b8' : f !== undefined ? '#f2ecde' : '#7f6a4a', e => { if (wait || mt || f !== undefined) return; hlAct2({ k: 'f', i }, e.timeStamp); AU.pluck(82); }, mt || wait && f === undefined);
      if (f !== undefined) hlText(g, HL_FACE[f][0], x + s / 2, y + s / 2, s * .5, { w: 900, c: HL_FACE[f][1], o: false });
      else if (!mt) hlText(g, '?', x + s / 2, y + s / 2, s * .4, { w: 900, c: '#c9b48a', o: false });
    }
    hlText(g, `Bạn được ${m.done.size / 2}/6 cặp`, b.W / 2, b.y + b.h - 8, 14, { w: 900, o: false });
  },
  cell(g, r, p, C, res, win) {
    const st = r.nho.get(p.id), c = p.id === HL.id ? (hlMy().done ? hlMy().done.size / 2 : 0) : st ? st.c : 0, rad = Math.max(1.8, Math.min(5, (C.w - 14) / (6 * 2.6))), x0 = C.cx - 5 * rad * 1.3;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x0 + i * rad * 2.6, C.y + C.h * .2, rad, 0, 6.283); g.fillStyle = i < c ? '#2f6a4c' : 'rgba(29,25,21,.12)'; g.fill(); g.lineWidth = 1; g.strokeStyle = HL_INK; g.stroke(); }
    if (res) hlResText(g, C, `${res.v}/6 cặp`, win);
  },
  val: (r, row) => `${row.v}/6 cặp`, win: (r, row) => `${row.v}/6 cặp${row.v >= 6 ? ' trong ' + hlTime(row.at) : ''}`,
  mine: (r, row) => `Bạn được ${row.v}/6 cặp · hạng ${row.rank}/${r.result.rows.length}`,
};

/* ---------- 9. follow the ball ---------- */
// where each cup is (as a position 0..2, fractional while it moves) at ms e after the start
function hlCupPos(cfg, e) {
  const pos = [0, 1, 2], t = e - cfg.show; if (t <= 0) return { pos, lift: e < cfg.show - 200 };
  const n = Math.min(cfg.swaps.length, Math.floor(t / cfg.swap)), cur = [0, 1, 2];   // cur[cup] = position
  for (let k = 0; k < n; k++) { const [a, b] = cfg.swaps[k]; for (let c = 0; c < 3; c++) { if (cur[c] === a) cur[c] = b; else if (cur[c] === b) cur[c] = a; } }
  const out = cur.slice();
  if (n < cfg.swaps.length) { const f = (t - n * cfg.swap) / cfg.swap, [a, b] = cfg.swaps[n], u = f * f * (3 - 2 * f); for (let c = 0; c < 3; c++) { if (cur[c] === a) out[c] = a + (b - a) * u; else if (cur[c] === b) out[c] = b + (a - b) * u; } }
  return { pos: out, lift: false };
}
HL_G.chen = {
  name: 'Đoán chén có hạt', rule: 'Hạt đậu nằm dưới một chén, rồi các chén đổi chỗ nhau. Theo dõi thật kỹ rồi chọn chén có hạt. Ai chọn đúng thì chia nhau hũ.', ctl: 'cups',
  controls(r, W, H, btns) {
    const m = hlMy(), e = hlEnd(r), ready = e >= r.cfg.end - 100, gap = 8, bw = (W - 20 - gap * 2) / 3;
    for (let v = 0; v < 3; v++) btns.push(hlBtn({ id: 'cp' + v, key: String(v + 1), label: `Chén ${v + 1}`, size: 18, x: 10 + v * (bw + gap), y: H - 66, w: bw, h: 52, fill: m.pick === v ? '#f2c640' : '#c9a062', ink: HL_INK, off: !ready || m.pick !== undefined, down: e => { if (hlAct2({ k: 'p', v }, e.timeStamp)) { m.pick = v; r.picked.add(HL.id); AU.pluck(90); } } }));
    return { btns, h: 74 };
  },
  info(g, r, now, b) {
    const cfg = r.cfg, e = now - r.t0, st = hlCupPos(cfg, e), done = r.state === 'result', cy = b.y + b.h / 2 + 8, X = p => b.W / 2 + (p - 1) * Math.min(96, b.w / 3.4);
    for (let c = 0; c < 3; c++) {
      const x = X(st.pos[c]), fin = done && r.extra && r.extra.final !== undefined && Math.round(st.pos[c]) === r.extra.final, lift = (st.lift && c === cfg.ball) || fin ? 26 : 0;
      if ((c === cfg.ball && e < cfg.show - 150) || fin) { g.beginPath(); g.arc(x, cy + 16, 8, 0, 6.283); g.fillStyle = '#e8c840'; g.fill(); g.lineWidth = 2; g.strokeStyle = HL_INK; g.stroke(); }
      g.beginPath(); g.moveTo(x - 28, cy + 22 - lift); g.lineTo(x - 20, cy - 24 - lift); g.lineTo(x + 20, cy - 24 - lift); g.lineTo(x + 28, cy + 22 - lift); g.closePath(); g.fillStyle = '#b5764a'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.stroke();
    }
    hlText(g, e < cfg.show ? 'Nhớ hạt nằm dưới chén nào…' : e < cfg.end - 100 ? 'Theo dõi chén có hạt!' : hlMy().pick !== undefined ? `Bạn chọn chén ${hlMy().pick + 1} · chờ mọi người` : 'Chọn chén có hạt!', b.W / 2, b.y + b.h - 8, 13, hlSub);
  },
  cell(g, r, p, C, res, win) { if (res) { if (res.v === null) hlResText(g, C, 'không chọn', false, '#777'); else hlTick(g, C, !!res.right); } else if (r.picked.has(p.id)) hlTick(g, C); },
  val: (r, row) => row.right ? 'chọn đúng' : 'chọn sai', win: (r, row) => 'chọn đúng chén có hạt',
  mine: (r, row) => row.v === null ? 'Bạn không chọn kịp' : row.right ? `Bạn chọn đúng chén ${row.v + 1}!` : `Bạn chọn sai (hạt ở chén ${r.extra.final + 1})`,
};
