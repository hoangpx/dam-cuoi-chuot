/* Chương V · Hội Làng — the nine newer games (HL_G, same shape as in tro.js). Rules live on the server (server/phong-choi/src/index.js);
   this only draws what it is told and sends the player's taps.
     chuot  tap the hole the mole comes out of      hpb   guess the number nearest 2/3 of the average
     khac   find the tile of a different shade      dem   count the mice over 5 turns, closest total wins
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
  name: 'Hai phần ba', rule: 'Chọn một số từ 0 đến 100. Số nào gần nhất 2/3 trung bình các số của cả phòng thì thắng. Ai cùng sát mốc bằng nhau thì chia hũ.', ctl: 'step',
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
// mouse silhouettes: stand (chuot-bong) and run (chuot-chay) poses, black and white, all face left
const demSilImgs = {};
function demSilImg(white, run) {
  const k = (white ? 'w' : 'b') + (run ? 'r' : 's');
  if (!demSilImgs[k]) {
    const im = new Image();
    im.src = white ? (run ? 'img/chuot-chay-trang.png' : 'img/chuot-trang.png')
                   : (run ? 'img/chuot-chay.png' : 'img/chuot-bong.png');
    demSilImgs[k] = im;
  }
  return demSilImgs[k];
}
function demDrawSil(g, x, y, s, face, white, runFrame) {
  const im = demSilImg(white, runFrame);
  if (!im.complete || !im.naturalWidth) return;
  const w = s, h = s * im.naturalHeight / im.naturalWidth;
  g.save(); g.translate(x, y); g.scale(-face, 1);   // images face left; flip so face=1 looks right
  g.drawImage(im, -w / 2, -h / 2, w, h);
  g.restore();
}
// count the mice: which turn are we in? (server time, cumulative slots)
const demTurn = r => {
  const e = hlEnd(r);
  for (let i = 0; i < r.cfg.turns.length; i++) if (e < r.cfg.turns[i].end) return i;
  return r.cfg.turns.length - 1;
};
const demPE = (r, t) => hlEnd(r) - r.cfg.turns[t].start;   // time into this turn
HL_G.dem = {
  name: 'Đếm chuột', rule: '5 lượt đếm chuột, cộng dồn tổng. Mỗi lượt chuột hiện vài giây rồi biến mất, bạn có 3 giây để chốt số đếm được. Lượt 3 có chuột trắng. Tổng ai gần đúng nhất thắng, bằng nhau chia hũ.', ctl: 'step', ipH: hlTall(.34),
  controls(r, W, H, b) {
    const m = hlMy(), t = demTurn(r), turn = r.cfg.turns[t], pe = demPE(r, t);
    const done = m.demDone || [], inputPhase = pe >= turn.show - 50, sent = done[t] !== undefined;
    const off = !inputPhase || sent, gap = 8, bw = (W - 20 - gap * 2) / 3, y = H - 126;
    const mk = (i, st) => hlBtn({ id: 'dm' + st, label: (st > 0 ? '+' : '−') + Math.abs(st), size: 20, x: 10 + i * (bw + gap), y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, off, down: () => { m.v = Math.max(0, Math.min(30, (m.v ?? 5) + st)); } });
    b.push(mk(0, -1)); b.push(hlBtn({ id: 'dmv', label: String(m.v ?? 5), size: 26, x: 10 + (bw + gap), y, w: bw, h: 46, fill: '#f2ecde', ink: HL_INK, off: true })); b.push(mk(2, 1));
    b.push(hlWide(W, H, { id: 'dmok', key: ' ', label: sent ? `Đã chốt ${done[t]} ✓` : 'CHỐT', size: 20, fill: sent ? '#bdb7a6' : '#2f6a4c', fillDown: '#1f4a34', ink: sent ? HL_INK : '#f2ecde', off, down: e => {
      if (sent) return; const v = m.v ?? 5;
      if (hlAct2({ k: 'v', t, v }, e.timeStamp)) { done[t] = v; m.demDone = done; m.v = 5; AU.pluck(90); }
    }}));
    return { btns: b, h: 134 };
  },
  info(g, r, now, b) {
    const t = demTurn(r), turn = r.cfg.turns[t], e = demPE(r, t), showing = e < turn.show;
    const m = hlMy(), done = m.demDone || [];
    hlText(g, `Lượt ${t + 1}/5`, b.W / 2, b.y + 16, 14, { w: 800, c: HL_INK, o: false });
    if (showing) {
      const s = turn.kind === 'run' ? Math.min(60, b.w * .16) : Math.min(85, b.w * .22);
      for (let i = 0; i < turn.mice.length; i++) {
        const mc = turn.mice[i]; let px = mc.x, py = mc.y;
        if (turn.kind === 'chaos') {   // slight vibration only, so they never touch
          px = mc.x + Math.sin(e / 280 + mc.ph * 9) * .02;
          py = mc.y + Math.cos(e / 340 + mc.ph * 7) * .02;
          px = Math.max(.08, Math.min(.92, px)); py = Math.max(.12, Math.min(.88, py));
        } else if (turn.kind === 'run') {   // the whole herd runs across the screen, staggered
          const sp = 1.35 + mc.vx * .2;
          px = (mc.x0 || -.18) + (e / turn.show) * sp; py = mc.y + Math.sin(e / 90 + mc.ph * 9) * .02;
        }
        const face = 1;
        // 2-frame run cycle: alternate stand/run poses ~8x per second
        const runFrame = (turn.kind === 'run' || turn.kind === 'chaos') ? (Math.floor(HL.t / 120 + mc.ph * 5) % 2 === 1) : false;
        // run turn uses full height for y so lanes don't compress
        const yy = turn.kind === 'run' ? b.y + 20 + py * (b.h - 40) : b.y + 34 + py * (b.h - 78);
        demDrawSil(g, b.x + 14 + px * (b.w - 28), yy, s, face, !!mc.w, runFrame);
      }
      hlText(g, 'Đếm nhanh lên!', b.W / 2, b.y + b.h - 8, 13, hlSub);
    } else {
      const left = Math.max(0, turn.show + turn.input - e), cd = Math.ceil(left / 1000);
      hlText(g, String(cd), b.W / 2, b.y + b.h / 2 - 8, Math.min(60, b.h * .5), { w: 900, c: '#a3332a' });
      hlText(g, done[t] !== undefined ? `Lượt này bạn chốt ${done[t]} · chờ lượt sau` : 'Được bao nhiêu con? Chọn số rồi chốt', b.W / 2, b.y + b.h - 8, 13, hlSub);
    }
  },
  cell(g, r, p, C, res, win) {
    if (res) { if (res.v !== null) hlResText(g, C, String(res.v), win); else hlResText(g, C, 'không đoán', false, '#777'); }
    else {
      const t = demTurn(r), n = r.cfg.turns.length, rad = Math.max(2, Math.min(6, (C.w - 14) / (n * 2.6))), x0 = C.cx - (n - 1) * rad * 1.3;
      const done = p.id === HL.id ? (hlMy().demDone || []) : (r.demProg && r.demProg.get(p.id)) || [];
      for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x0 + i * rad * 2.6, C.y + C.h * .2, rad, 0, 6.283); g.fillStyle = done[i] !== undefined ? '#2f6a4c' : 'rgba(29,25,21,.12)'; g.fill(); g.lineWidth = 1; g.strokeStyle = HL_INK; g.stroke(); }
    }
  },
  val: (r, row) => `tổng ${row.v}`,
  win: (r, row) => `tổng ${row.v}, đúng là ${r.extra.total}`,
  mine: (r, row) => row.v === null ? 'Bạn không đoán lượt nào' : `Bạn tổng ${row.v} · đúng là ${r.extra.total} · hạng ${row.rank}/${r.result.rows.length}`,
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
    const m = hlMy(); m.face = m.face || {}; m.done = m.done || new Set(); m.hideQ = m.hideQ || []; while (m.hideQ.length && HL.t >= m.hideQ[0].at) for (const i of m.hideQ.shift().pair) delete m.face[i];
    const cols = 4, rows = 3, s = Math.max(28, Math.min((b.w - 16) / cols, (b.h - 28) / rows)), x0 = b.W / 2 - s * cols / 2, y0 = b.y + 2, wait = m.hideQ.length > 0;
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
  name: 'Đoán chén có hạt', rule: 'Hạt đậu nằm dưới một chén, rồi các chén đổi chỗ nhau. Theo dõi thật kỹ rồi chọn chén có hạt. Ai chọn đúng và nhanh nhất thắng.', ctl: 'cups',
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
  val: (r, row) => row.right ? 'chọn đúng' : 'chọn sai', win: (r, row) => `chọn đúng chén có hạt lúc ${hlTime(row.p)}`,
  mine: (r, row) => row.v === null ? 'Bạn không chọn kịp' : row.right ? `Bạn chọn đúng chén ${row.v + 1} · hạng ${row.rank}/${r.result.rows.length}` : `Bạn chọn sai (hạt ở chén ${r.extra.final + 1})`,
};

/* ---------- 10. the folk-lore quiz (now and then) ---------- */
const HL_QCOL = { 'Tranh dân gian': '#a3332a', 'Làng nghề miền Bắc': '#2f6a4c', 'Làng nghề miền Nam': '#3f8a86', 'Chuyện dân gian': '#7b4aa8' };
HL_G.dodan = {
  name: 'Đố vui dân gian', rule: 'Một câu hỏi về tranh dân gian, làng nghề hay chuyện cổ tích, 5 đáp án. Chạm đáp án đúng nhanh nhất thắng! Chạm sai bị khóa 2 giây.', ctl: 'choices', ipH: (W, H) => Math.max(300, Math.min(H * .54, 360)),
  controls: (r, W, H, b) => ({ btns: b, h: 30 }),
  info(g, r, now, b) {
    const m = hlMy(), lock = hlLocked(r, now), off = !!m.done || lock, cfg = r.cfg, col = HL_QCOL[cfg.cat] || HL_INK;
    // the group badge, then the question, then five answers
    g.font = `700 11px ${hlSans}`; const bw = g.measureText(cfg.cat || '').width + 16; hlPlate(g, b.W / 2 - bw / 2, b.y, bw, 18, col, HL_INK, 8); hlText(g, cfg.cat || '', b.W / 2, b.y + 9, 11, { f: hlSans, w: 700, o: false, c: '#f2ecde' });
    const qs = hlWrap(g, cfg.q, b.w - 24, 16, 700).slice(0, 3); qs.forEach((l, i) => hlText(g, l, b.W / 2, b.y + 32 + i * 20, 16, { f: hlSans, w: 700, o: false }));
    const top = b.y + 32 + qs.length * 20 + 6, free = b.y + b.h - 20 - top, th = Math.max(30, Math.min(46, (free - 4 * 6) / 5));
    cfg.opts.forEach((t, i) => {
      const y = top + i * (th + 6), x = b.x + 8, w = b.w - 16; HL.btns.push({ id: 'qo' + i, x, y, w, h: th, down: e => { if (!off) hlAct2({ k: 'p', v: i }, e.timeStamp); }, off });
      g.globalAlpha = off ? .55 : 1; hlPlate(g, x, y, w, th, '#f6e9c6', HL_INK, 9); g.globalAlpha = 1;
      let fs = 15; g.font = `700 ${fs}px ${hlSans}`; while (fs > 10 && g.measureText(t).width > w - 40) { fs -= .5; g.font = `700 ${fs}px ${hlSans}`; }
      hlText(g, String.fromCharCode(65 + i), x + 16, y + th / 2, 13, { f: hlSans, w: 800, o: false, c: col });
      hlText(g, t, x + 30, y + th / 2 + 1, fs, { f: hlSans, w: 700, o: false, a: 'left' });
    });
    hlText(g, m.done ? 'Bạn trả lời đúng ✓' : lock ? 'Sai rồi, bị khóa 2 giây…' : 'Chạm đáp án đúng!', b.W / 2, b.y + b.h - 8, 13, { w: 800, c: m.done ? '#2f6a4c' : lock ? '#a3332a' : HL_INK, o: false, f: hlSans });
  },
  cell: (g, r, p, C, res, win) => HL_G.chuot.cell(g, r, p, C, res, win),
  val: (r, row) => hlTime(row.v), win: (r, row) => `đúng sau ${hlTime(row.v)} · đáp án: ${r.cfg.opts[r.extra.a]}`,
  mine: (r, row) => row.v === null ? `Bạn không trả lời kịp · đáp án: ${r.cfg.opts[r.extra.a]}` : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${hlTime(row.v)}`,
};

/* ---------- 11. tug of war ---------- */
// team tap counts from the server's prog broadcast, teams from the side picks
const hlKeocoN = (r, id) => id === HL.id ? Math.max(HL.myTaps, (r.prog && r.prog[id]) || 0) : ((r.prog && r.prog[id]) || 0);
const hlKeocoTeams = r => {
  let L = 0, R = 0; const kt = r.kteam || new Map(), seen = new Set();
  const add = id => { if (seen.has(id)) return; seen.add(id); const s = kt.get(id); if (s === 0) L += hlKeocoN(r, id); else if (s === 1) R += hlKeocoN(r, id); };
  for (const id in (r.prog || {})) add(id);
  add(HL.id);
  return [L, R];
};
const HL_KEOCO_COL = ['#3f8a86', '#a3332a'];   // TRÁI teal, PHẢI red
const hlKeocoMembers = (r, side) => { const kt = r.kteam || new Map(), out = []; for (const p of HL.players) if (kt.get(p.id) === side) out.push(p); return out; };
HL_G.keoco = {
  name: 'Kéo co', rule: 'Chọn phe TRÁI hoặc PHẢI trong 3 giây (không chọn sẽ tự xếp vào phe ít người hơn), rồi bấm liên tục để kéo! Phe nào tổng lực mạnh hơn sẽ thắng và chia đều tiền cược của phe thua.',
  ctl: 'tap',
  ipH: (W, H) => Math.max(200, Math.min(250, H * .3)),
  controls(r, W, H, b) {
    const picking = hlEnd(r) < r.cfg.pick, side = hlMySide(r);
    if (picking) {
      const gap = 8, bw = (W - 20 - gap) / 2;
      const mk = (v, x) => hlBtn({ id: 'k' + v, key: v ? '2' : '1', label: v ? 'PHE PHẢI' : 'PHE TRÁI', size: 18, x, y: H - 66, w: bw, h: 52, fill: side === v ? '#f2c640' : HL_KEOCO_COL[v], ink: side === v ? HL_INK : '#f2ecde', off: side !== -1, down: () => hlKeocoSide(v) });
      b.push(mk(0, 10)); b.push(mk(1, 10 + bw + gap));
      return { btns: b, h: 74, note: side === -1 ? 'Bấm chọn phe của bạn!' : 'Đã chọn phe, chờ giờ kéo…' };
    }
    b.push(hlWide(W, H, { id: 'main', key: ' ', label: side === -1 ? 'Bạn chưa chọn phe!' : 'KÉO!', size: 22, fill: side === -1 ? '#bdb7a6' : HL_KEOCO_COL[side], fillDown: '#1d1915', ink: side === -1 ? HL_INK : '#f2ecde', off: side === -1, down: () => hlTap() }));
    return { btns: b, h: 74 };
  },
  info(g, r, now, b) {
    const e = hlEnd(r), picking = e < r.cfg.pick;
    if (picking) {
      hlText(g, 'Chọn phe kéo co!', b.W / 2, b.y + b.h / 2 - 6, 24, { w: 900 });
      hlText(g, `còn ${Math.ceil((r.cfg.pick - e) / 1000)} giây · bấm chọn phe, không bấm sẽ tự xếp`, b.W / 2, b.y + b.h - 8, 13, hlSub);
      return;
    }
    const teams = hlKeocoTeams(r), L = teams[0], R = teams[1], tot = Math.max(1, L + R), off = (R - L) / tot;   // the knot slides toward the stronger side
    const cx = b.W / 2, left = Math.max(0, r.cfg.pick + r.cfg.len - e);
    // --- scoreboard: each side's total taps, facing each other ---
    const sbY = b.y + 12;
    hlText(g, 'TRÁI', cx - 64, sbY, 12, { w: 800, c: '#3f8a86', o: false, a: 'center' });
    hlText(g, 'PHẢI', cx + 64, sbY, 12, { w: 800, c: '#a3332a', o: false, a: 'center' });
    hlText(g, String(L), cx - 64, sbY + 30, 30, { w: 900, c: '#3f8a86', o: false, a: 'center' });
    hlText(g, String(R), cx + 64, sbY + 30, 30, { w: 900, c: '#a3332a', o: false, a: 'center' });
    hlText(g, '–', cx, sbY + 28, 22, { w: 900, o: false, a: 'center' });
    // --- tug of war: the real players' mice in a single tight file, hands gripping the rope (up to 10 a side) ---
    const shift = off * 16, x0 = b.x + 26, x1 = b.x + b.w - 26, halfW = (x1 - x0) / 2;
    const perRow = Math.max(5, Math.min(10, Math.floor(halfW / 15))), maxShow = perRow;
    const ms = Math.min(.30, halfW / perRow * .012), spacing = ms * 78;   // close together but distinct: slight touch, no heavy overlap
    const memL = hlKeocoMembers(r, 0), memR = hlKeocoMembers(r, 1);
    const baseY = sbY + 128, ropeY = baseY - 55 * ms;
    const teamCX = side => side === 0 ? (x0 + cx) / 2 : (cx + x1) / 2;   // center of each half
    const drawTeam = (mem, side) => {
      const n = Math.min(maxShow, mem.length), startX = teamCX(side) - (n - 1) * spacing / 2;
      for (let k = 0; k < n; k++) {
        const x = startX + k * spacing + shift;
        hlDrawFig(g, mem[k], x, baseY, ms, side === 0 ? 1 : -1, false, HL.t);   // feet and heads perfectly aligned, no bobbing
      }
      if (mem.length > n) hlText(g, `+${mem.length - n}`, side === 0 ? x1 - 60 + shift : x0 + 60 + shift, baseY - 44, 12, hlSub);
    };
    drawTeam(memL, 0); drawTeam(memR, 1);
    g.strokeStyle = '#8a6b45'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + shift, ropeY); g.lineTo(x1 + shift, ropeY); g.stroke();
    const kx = cx + shift + off * ((x1 - x0) / 2 - 24);
    g.fillStyle = '#a3332a'; g.beginPath(); g.arc(kx, ropeY, 9, 0, 6.283); g.fill(); g.lineWidth = 2; g.strokeStyle = HL_INK; g.stroke();
    g.beginPath(); g.moveTo(kx - 6, ropeY + 9); g.lineTo(kx + 6, ropeY + 9); g.lineTo(kx, ropeY + 22); g.closePath(); g.fill(); g.stroke();
    hlBar(g, b.x + 24, b.y + b.h - 20, b.w - 48, 7, left / r.cfg.len, '#8a6b45');
    hlText(g, `${(left / 1000).toFixed(1)} giây`, b.W / 2, b.y + b.h - 6, 12, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const kt = r.kteam || new Map(), s = kt.has(p.id) ? kt.get(p.id) : -1, n = res ? res.v : hlKeocoN(r, p.id);
    if (s === 0 || s === 1) {
      g.font = `800 10px ${hlSans}`; const label = s ? 'PHẢI' : 'TRÁI', tw = g.measureText(label).width + 12;
      g.fillStyle = HL_KEOCO_COL[s]; g.fillRect(C.cx - tw / 2, C.y + 4, tw, 15);
      g.lineWidth = 1.2; g.strokeStyle = HL_INK; g.strokeRect(C.cx - tw / 2, C.y + 4, tw, 15);
      hlText(g, label, C.cx, C.y + 11.5, 10, { w: 800, c: '#f2ecde', o: false });
    }
    hlText(g, String(n), C.cx, C.y + C.h * .38, Math.max(10, Math.min(16, C.w * .13)), { w: 800, c: win ? '#a3332a' : HL_INK, o: false });
  },
  val: (r, row) => `${row.v} lượt`,
  win: (r, row) => `phe ${row.team === 0 ? 'TRÁI' : 'PHẢI'} thắng!`,
  mine: (r, row) => {
    if (row.team === -1) return 'Bạn không chọn phe nên mất cược';
    const t = (r.extra && r.extra.teams) || [0, 0];
    if (t[0] === t[1]) return `Hòa! Bạn kéo ${row.v} lượt, không mất gì`;
    const won = row.team === (t[0] > t[1] ? 0 : 1), net = r.result.net ? r.result.net[HL.id] : 0;
    return won ? `Phe bạn thắng! +${net} đồng · bạn kéo ${row.v} lượt` : `Phe bạn thua, mất 10 đồng · bạn kéo ${row.v} lượt`;
  },
};
