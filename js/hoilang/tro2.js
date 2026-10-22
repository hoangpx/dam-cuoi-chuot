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
// mouse silhouettes drawn in code (black or white), running or standing, facing right (face = -1 mirrors).
// The sprite is about 210 units long (tail to whiskers); s is its drawn length in pixels.
function demMouse(g, x, y, k, ph, col, eye, still, edge) {
  const c = still ? 0 : Math.cos(ph), sn = Math.sin(ph);
  const air = still ? 0 : Math.max(0, -c) * 9, ext = still ? .5 : (1 - c) / 2;
  const tail = still ? Math.sin(ph) * 6 : Math.sin(ph + 1.2) * 12;
  g.save(); g.translate(x, y - air * k * .1); g.scale(k, k);
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  const tl = () => { g.beginPath(); g.moveTo(-50, -34); g.bezierCurveTo(-78, -30 + sn * 8, -92, -58 - sn * 10, -122, -46 + tail); g.stroke(); };   // a long thin tail that swings
  if (edge) { g.strokeStyle = edge; g.lineWidth = 6.2; tl(); g.strokeStyle = col; }
  g.lineWidth = 3.2; tl();
  const arch = 5 - ext * 6;   // humped back, pointed snout, no legs
  g.beginPath(); g.moveTo(74, -29 + ext * 2);
  g.bezierCurveTo(70, -38, 60, -46, 46, -48); g.bezierCurveTo(28, -56 - arch, -6, -62 - arch, -34, -52);
  g.bezierCurveTo(-56, -46, -62, -28, -52, -17); g.bezierCurveTo(-34, -8 + ext * 2, 4, -10, 34, -14);
  g.bezierCurveTo(52, -16, 60, -20, 66, -22); g.bezierCurveTo(72, -23, 76, -26, 74, -29); g.closePath(); g.fill(); if (edge) { g.strokeStyle = edge; g.lineWidth = 4; g.stroke(); }
  g.beginPath(); g.ellipse(34, -57, 11, 14, -.35, 0, 6.283); g.fill(); if (edge) g.stroke();   // big round ears
  g.beginPath(); g.ellipse(20, -58, 9, 12, -.7, 0, 6.283); g.fill(); if (edge) g.stroke();
  g.strokeStyle = edge || col; g.lineWidth = 1.2; for (const d of [-7, 0, 7]) { g.beginPath(); g.moveTo(66, -30); g.lineTo(88, -31 + d + sn * 1.5); g.stroke(); }
  g.fillStyle = eye; g.beginPath(); g.arc(55, -40, 2.3, 0, 6.283); g.fill();
  g.restore();
}
// ph: phase of the run (radians); run = false stands still with a slow tail sway
function demDrawSil(g, x, y, s, face, white, ph, run) {
  const k = s / 210;
  g.save(); g.translate(x, y); g.scale(face, 1);
  demMouse(g, 18 * k, 37 * k, k, ph, white ? '#fbf8ef' : '#1d1915', white ? '#1d1915' : '#f2ecde', !run, white ? '#1d1915' : null);   // a white mouse needs a dark edge, the paper is white too
  g.restore();
}
// a cat that runs across now and then in the last two turns (not a mouse: it is not counted), black like the mice, facing right
function demDrawCat(g, x, y, s, face, ph) {
  const k = s / 200, INK = '#1d1915', OC = INK;
  g.save(); g.translate(x, y); g.scale(face * k, k); g.translate(0, 62 - Math.abs(Math.sin(ph)) * 8);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 3.2; g.strokeStyle = INK; g.fillStyle = OC;
  const sw = Math.sin(ph) * 8;
  g.lineWidth = 13; g.beginPath(); g.moveTo(-58, -52); g.bezierCurveTo(-95, -62 + sw, -102, -108, -80, -124 - sw); g.stroke();   // a long tail up in the air
  g.strokeStyle = OC; g.lineWidth = 8.5; g.beginPath(); g.moveTo(-58, -52); g.bezierCurveTo(-95, -62 + sw, -102, -108, -80, -124 - sw); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 3.2;
  g.beginPath(); g.ellipse(0, -45, 64, 27, -.06, 0, 6.283); g.fill(); g.stroke();   // body
  g.beginPath(); g.moveTo(54, -80); g.lineTo(58, -104); g.lineTo(73, -82); g.closePath(); g.fill(); g.stroke();   // ears
  g.beginPath(); g.moveTo(68, -80); g.lineTo(80, -103); g.lineTo(88, -76); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.arc(70, -62, 21, 0, 6.283); g.fill(); g.stroke();   // head
  g.beginPath(); g.ellipse(88, -56, 8, 6, 0, 0, 6.283); g.fill(); g.stroke();   // muzzle
  g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(77, -68, 2.6, 0, 6.283); g.fill();   // an eye in paper colour, like the mice
  g.restore();
}
// a mouse standing and walking on two legs: narrow, so more of them fit side by side. Feet at (x, y), about 112 units tall.
function demDrawUp(g, x, y, s, face, ph, run) {
  const k = s / 112, sn = Math.sin(ph), INK = '#1d1915', sw = run ? 1 : .15;
  g.save(); g.translate(x, y); g.scale(face * k, k); g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 3; g.beginPath(); g.moveTo(-12, -32); g.bezierCurveTo(-34, -24 + sn * 6 * sw, -40, -44, -52, -34 + sn * 10 * sw); g.stroke();   // tail
  for (const o of [0, Math.PI]) {   // two legs, a step each
    const a = ph + o, fx = Math.sin(a) * 11 * (run ? 1 : 0), fy = -Math.max(0, Math.cos(a)) * 7 * (run ? 1 : 0), hx = o ? 6 : -4;
    g.lineWidth = 7; g.beginPath(); g.moveTo(hx, -24); g.quadraticCurveTo(hx + fx * .4, -12, hx + fx, fy - 2); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(hx + fx, fy - 2); g.lineTo(hx + fx + 7, fy - 2); g.stroke();
  }
  g.beginPath(); g.ellipse(0, -46, 17, 27, 0, 0, 6.283); g.fill();   // body
  g.lineWidth = 5; for (const o of [0, Math.PI]) { const a = ph + o + Math.PI; g.beginPath(); g.moveTo(4, -60); g.lineTo(10 + Math.sin(a) * 8 * (run ? 1 : .3), -46); g.stroke(); }   // arms swinging
  g.beginPath(); g.arc(4, -84, 15, 0, 6.283); g.fill();   // head
  g.beginPath(); g.moveTo(14, -92); g.lineTo(32, -80); g.lineTo(14, -72); g.closePath(); g.fill();   // snout
  g.beginPath(); g.arc(-4, -100, 9, 0, 6.283); g.fill(); g.beginPath(); g.arc(11, -102, 9, 0, 6.283); g.fill();   // round ears
  g.fillStyle = '#f2ecde'; g.beginPath(); g.arc(11, -86, 2.4, 0, 6.283); g.fill();   // an eye in paper colour
  g.restore();
}
// count the mice: which turn are we in? (server time, cumulative slots)
const demTurn = r => {
  const e = hlEnd(r);
  for (let i = 0; i < r.cfg.turns.length; i++) if (e < r.cfg.turns[i].end) return i;
  return r.cfg.turns.length - 1;
};
const demBase = (m, t) => { let s = 0; const d = m.demDone || []; for (let i = 0; i < t; i++) s += d[i] || 0; return s; };   // what was counted in the turns before
const demFloor = m => (m.demDone || []).reduce((a, b) => a + (b || 0), 0);   // all that was sent so far
const demVal = m => Math.max(demFloor(m), m.v ?? 0);   // the dial is a running total: it keeps going up from turn to turn
const demPE = (r, t) => hlEnd(r) - r.cfg.turns[t].start;   // time into this turn
HL_G.dem = {
  name: 'Đếm chuột', rule: 'Đếm tổng số chuột.', ctl: 'step', ipH: hlTall(.34),
  controls(r, W, H, b) {
    const m = hlMy(), t = demTurn(r), turn = r.cfg.turns[t], pe = demPE(r, t);
    const done = m.demDone || [], inputPhase = pe >= turn.show - 50, sent = done[t] !== undefined;
    const off = false, gap = 8, bw = (W - 20 - gap * 2) / 3, y = H - 62;
    const mk = (i, st) => hlBtn({ id: 'dm' + st, label: (st > 0 ? '+' : '−') + Math.abs(st), size: 22, plain: true, x: 10 + i * (bw + gap), y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, off, down: () => { m.v = Math.max(demFloor(m), Math.min(40, demVal(m) + st)); } });
    b.push(mk(0, -1)); b.push(hlBtn({ id: 'dmv', label: String(demVal(m)), plain: true, size: 28, x: 10 + (bw + gap), y, w: bw, h: 46, fill: '#f2ecde', ink: HL_INK, off: true })); b.push(mk(2, 1));
    return { btns: b, h: 74 };
  },
  tick(r) {   // no button: the number on the dial is sent by itself as the turn's time runs out
    const t = demTurn(r), turn = r.cfg.turns[t], pe = demPE(r, t), m = hlMy(), done = m.demDone || [];
    if (done[t] !== undefined || pe < turn.show + turn.input - 450) return;
    const v = demVal(m), add = v - demBase(m, t);   // the server wants this turn's count; the dial keeps the total
    if (hlAct2({ k: 'v', tn: t, v: add })) { done[t] = add; m.demDone = done; m.v = v; AU.pluck(90); }
  },
  info(g, r, now, b) {
    const t = demTurn(r), turn = r.cfg.turns[t], e = demPE(r, t), showing = e < turn.show;
    const m = hlMy(), done = m.demDone || [];
    hlText(g, `Lượt ${t + 1}/5`, b.W / 2, b.y + 16, 14, { w: 800, c: HL_INK, o: false });
    if (showing) {
      const s = turn.kind === 'run' ? Math.min(60, b.w * .16) : Math.min(85, b.w * .22);
      for (let i = 0; i < turn.mice.length; i++) {
        const mc = turn.mice[i]; let px = mc.x, py = mc.y;
        if (turn.kind === 'chaos') {   // dashing all over the screen, each on its own crossing curves
          const w1 = 1.9 + Math.abs(mc.vx) * 1.5, w2 = 1.5 + Math.abs(mc.vy) * 1.5, q = e / 1000, a1 = q * w1 + mc.ph * 6.283, a2 = q * w2 + mc.ph * 17;
          px = .5 + .43 * Math.sin(a1); py = .5 + .4 * Math.sin(a2); mc.fc = Math.cos(a1) >= 0 ? 1 : -1;
        } else if (turn.kind === 'run') {   // the whole herd runs across the screen, staggered
          const sp = 1.7 + mc.vx * .15;
          px = (mc.x0 ?? -.18) + (mc.dr || 1) * (e / turn.show) * sp; py = mc.y + Math.sin(e / 90 + mc.ph * 9) * .02;
        }
        const face = turn.kind === 'chaos' ? (mc.fc || 1) : turn.kind === 'run' ? (mc.dr || 1) : 1;
        const run = turn.kind === 'run' || turn.kind === 'chaos', ph = HL.t * (run ? 14 : 2.2) + mc.ph * 6.283;
        // run turn uses full height for y so lanes don't compress
        const yy = turn.kind === 'run' ? b.y + 20 + py * (b.h - 40) : b.y + 34 + py * (b.h - 78);
        demDrawSil(g, b.x + 14 + px * (b.w - 28), yy, s, face, !!mc.w, ph, run);
      }
      if (turn.cat) {   // the cat moves like the mice of this turn: loops all over the screen, or crosses it once; a little bigger than a mouse
        const ct = turn.cat, cs = s * 1.2, f = Math.min(1, e / turn.show);
        let cx, cy, cface = 1;
        if (turn.kind === 'chaos') {
          const q = e / 1000, a1 = q * (1.9 + Math.abs(ct.vx) * 1.5) + ct.ph * 6.283, a2 = q * (1.5 + Math.abs(ct.vy) * 1.5) + ct.ph * 17;
          cx = .5 + .43 * Math.sin(a1); cy = .5 + .4 * Math.sin(a2); cface = Math.cos(a1) >= 0 ? 1 : -1;
        } else { cface = ct.dr || 1; cx = cface > 0 ? -.25 + 1.5 * f : 1.25 - 1.5 * f; cy = ct.y; }
        demDrawCat(g, b.x + 14 + cx * (b.w - 28), turn.kind === 'run' ? b.y + 20 + cy * (b.h - 40) : b.y + 34 + cy * (b.h - 78), cs, cface, HL.t * 14);
      }
      hlText(g, 'Đếm nhanh lên!', b.W / 2, b.y + b.h - 8, 13, hlSub);
    } else {
      g.fillStyle = '#14110e'; g.fillRect(b.x, b.y, b.w, b.h);   // between the turns: a black screen, no countdown
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

/* ---------- count the mice left in the burrow ---------- */
HL_G.dhang = {
  name: 'Đếm chuột trong hang', rule: 'Đếm số chuột còn lại trong hang.', ctl: 'step', ipH: hlTall(.4),
  controls(r, W, H, b) {
    const m = hlMy(), gap = 8, bw = (W - 20 - gap * 2) / 3, y = H - 62;
    const mk = (i, st) => hlBtn({ id: 'dh' + st, label: (st > 0 ? '+' : '−') + Math.abs(st), size: 22, plain: true, x: 10 + i * (bw + gap), y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, down: () => { m.v = Math.max(0, Math.min(60, (m.v ?? 0) + st)); } });
    b.push(mk(0, -1)); b.push(hlBtn({ id: 'dhv', label: String(m.v ?? 0), plain: true, size: 28, x: 10 + (bw + gap), y, w: bw, h: 46, fill: '#f2ecde', ink: HL_INK, off: true })); b.push(mk(2, 1));
    return { btns: b, h: 74 };
  },
  tick(r) {   // no button: the number is sent by itself as the time runs out
    const m = hlMy(); if (m.dhSent || hlEnd(r) < r.cfg.len - 450) return;
    if (hlAct2({ k: 'v', v: m.v ?? 0 })) { m.dhSent = true; AU.pluck(90); }
  },
  info(g, r, now, b) {
    const c = r.cfg, e = hlEnd(r), gy = b.y + b.h * .8, sh = Math.min(54, b.w * .15, b.h * .27), cx = b.x + b.w / 2;   // sh = height of an upright mouse
    const X = f => b.x + 10 + f * (b.w - 20);
    g.save(); g.beginPath(); g.rect(b.x, b.y, b.w, b.h); g.clip();
    g.strokeStyle = HL_INK; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x, gy + 2); g.lineTo(b.x + b.w, gy + 2); g.stroke();
    const run = (x, y, sc, w) => demDrawUp(g, x, y, sh * sc, 1, HL.t * 12 + w, true);
    // the three mice stand close together until the burrow lands on them
    if (e < c.land - 60) for (let i = 0; i < 3; i++) demDrawUp(g, cx + (i - 1) * sh * .62, gy, sh, i === 1 ? -1 : 1, HL.t * 2 + i, false);
    // mice going in (left to right, hidden by the mound), out to the right, and out down toward the viewer
    for (const ev of c.evs) for (let j = 0; j < ev.n; j++) {
      const p = (e - (ev.t + j * c.gap)) / c.dur; if (p < 0 || p > 1) continue;
      if (ev.k === 'in') run(X(-.06 + .56 * p), gy, 1, j);
      else if (ev.k === 'outR') run(X(.5 + .6 * p), gy, 1, j);
      else { const q = Math.min(1, p * 1.25), sc = 1 + .8 * q; run(cx + (j % 3 - 1) * sh * .45, gy + q * (b.y + b.h + sh * 2 - gy), sc, j); }
    }
    // the burrow: drops from above at c.drop, lands at c.land with a little bounce
    const bwid = Math.max(b.w * .22, sh * 2.7), bh = Math.max(b.h * .5, sh * 1.9), fall = Math.max(0, Math.min(1, (e - c.drop) / (c.land - c.drop)));
    let off = -(b.h + bh) * (1 - fall * fall); if (fall >= 1) off = -Math.max(0, Math.sin((e - c.land) / 90)) * 5 * Math.max(0, 1 - (e - c.land) / 500);
    if (e >= c.drop - 400) {
      g.save(); g.translate(0, off);
      g.beginPath(); g.moveTo(cx - bwid / 2, gy + 2); g.bezierCurveTo(cx - bwid / 2, gy - bh * 1.3, cx + bwid / 2, gy - bh * 1.3, cx + bwid / 2, gy + 2); g.closePath();
      g.fillStyle = '#7a5230'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = HL_INK; g.stroke();
      g.strokeStyle = 'rgba(29,25,21,.35)'; g.lineWidth = 1.6;   // a few clods on the dome
      for (let i = 0; i < 6; i++) { const a = cx - bwid * .32 + (i % 3) * bwid * .3, y = gy - bh * (.25 + .22 * Math.floor(i / 3)); g.beginPath(); g.moveTo(a, y); g.lineTo(a + bwid * .12, y - 3); g.stroke(); }
      g.fillStyle = '#14110e'; g.beginPath(); g.ellipse(cx, gy + 2, bwid * .16, bh * .26, 0, Math.PI, 0); g.fill();   // the doorway
      g.restore();
    }
    // a cat may run by to distract (a little bigger than a mouse)
    for (const ct of c.cats || []) { const p = (e - ct.t) / ct.dur; if (p < 0 || p > 1) continue;
      const cs = sh * 2; demDrawCat(g, X(ct.dr > 0 ? -.2 + 1.4 * p : 1.2 - 1.4 * p), gy + 6 + ct.y * b.h * .1 - 62 * (cs / 200), cs, ct.dr, HL.t * 14); }
    g.restore();
    if (e > c.anim) hlText(g, `Còn bao nhiêu chuột trong hang? · còn ${Math.max(0, Math.ceil((c.len - e) / 1000))} giây`, b.W / 2, b.y + b.h - 8, 12, hlSub);
  },
  cell(g, r, p, C, res, win) { if (res) { if (res.v !== null) hlResText(g, C, String(res.v), win); else hlResText(g, C, 'không đoán', false, '#777'); } else if (r.picked.has(p.id)) hlTick(g, C); },
  val: (r, row) => `đếm ${row.v}`, win: (r, row) => `đếm đúng ${row.v} con`,
  mine: (r, row) => row.v === null ? 'Bạn không đoán' : `Bạn đếm ${row.v} · đúng là ${r.extra.final} con`,
};

/* ---------- remember the print of the turn before ---------- */
// the twelve Đông Hồ prints: chương III's five, the mice's wedding of chương X and six more (wrestlers, the frogs' school, the pigs, the carp, Thái Bình, the child with the cock)
const HL_NT_PICS = ['img/ch3/dan-ga-me-con.jpg', 'img/ch3/hung-dua.png', 'img/ch3/chan-trau.png', 'img/ch3/tha-dieu.jpg', 'img/ch3/danh-du.jpg', 'img/ch10/thumb-dcm.jpg', 'img/hoilang/tranh-dau-vat.png', 'img/hoilang/tranh-ech-hoc.png', 'img/hoilang/tranh-dan-lon.png', 'img/hoilang/tranh-ca-chep.png', 'img/hoilang/tranh-thai-binh.png', 'img/hoilang/tranh-be-om-ga.png'];
const ntImgs = [];
const ntImg = i => { if (!ntImgs[i]) { const im = new Image(); im.src = HL_NT_PICS[i]; ntImgs[i] = im; } return ntImgs[i]; };
function ntDraw(g, i, x, y, w, h) {   // a print fitted into its frame, on paper
  g.fillStyle = '#f2ecde'; g.fillRect(x, y, w, h);
  const im = ntImg(i);
  if (im.complete && im.naturalWidth) { const sc = Math.min(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * sc, dh = im.naturalHeight * sc; g.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); }
  g.lineWidth = 2; g.strokeStyle = HL_INK; g.strokeRect(x, y, w, h);
}
HL_G.nhotranh = {
  name: 'Nhớ tranh Đông Hồ', rule: 'Chọn lại bức tranh của lượt trước.', ctl: 'tiles', ipH: hlTall(.62, 300),
  controls(r, W, H, b) {
    const m = hlMy(); for (let i = 0; i < HL_NT_PICS.length; i++) ntImg(i);
    if (!m.nTurn) b.push(hlWide(W, H, { id: 'ntgo', key: ' ', label: 'Bắt đầu', size: 20, plain: true, fill: '#2f6a4c', fillDown: '#1f4a34', ink: '#f2ecde', down: e => ntStart(r, e.timeStamp) }));
    return { btns: b, h: 62 };
  },
  tick(r) { const m = hlMy(); if (!m.nTurn && hlEnd(r) >= r.cfg.auto) ntStart(r); },   // nobody is kept waiting: it starts by itself
  info(g, r, now, b) {
    const m = hlMy(), c = r.cfg, N = c.tops.length, e = hlEnd(r), tt = m.nTurn || 0, started = !!m.nTurn;   // tt: the turn on screen, 0 (the first print) to 5
    const left = started ? c.limit - (e - m.nSt) : c.limit, over = started && !m.nDone && left <= 0;
    for (let i = 0; i < HL_NT_PICS.length; i++) ntImg(i);
    hlText(g, 'Chọn tranh lượt trước', b.W / 2, b.y + 14, 15, { w: 800, f: hlSans, o: false });
    if (started) {
      hlText(g, `Lượt ${Math.min(tt + 1, N)}/${N}`, b.x + 40, b.y + 14, 12, { w: 700, f: hlSans, o: false, c: HL_INK });
      hlText(g, String(Math.max(0, Math.ceil(left / 1000))), b.x + b.w - 24, b.y + 14, 17, { w: 800, f: hlSans, o: false, c: left < 8000 ? '#a3332a' : HL_INK });
    }
    if (m.nDone || over) { hlText(g, m.nDone ? 'Đã nộp ✓ chờ mọi người' : 'Hết giờ', b.W / 2, b.y + b.h / 2, 20, { w: 800, f: hlSans, o: false }); return; }
    const top = c.tops[tt], topY = b.y + 30;
    if (tt === 0) { const w = Math.min(b.w - 20, (b.h - 44) * 1.4); ntDraw(g, top, b.W / 2 - w / 2, topY, w, b.h - 44); return; }
    const topH = b.h * .32, topW = Math.min(b.w * .6, topH * 1.6);
    ntDraw(g, top, b.W / 2 - topW / 2, topY, topW, topH);
    const opts = c.opts[tt], n = opts.length, cols = n === 6 ? 3 : 2, rows = Math.ceil(n / cols), gap = 8, y0 = topY + topH + 12, ah = b.y + b.h - 6 - y0;
    const cw = (b.w - 20 - gap * (cols - 1)) / cols, ch = (ah - gap * (rows - 1)) / rows;
    for (let i = 0; i < n; i++) {
      const x = b.x + 10 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap);
      ntDraw(g, opts[i], x, y, cw, ch);
      HL.btns.push({ id: 'nt' + i, x, y, w: cw, h: ch, down: ev => ntPick(r, tt, i, ev.timeStamp) });
    }
  },
  cell(g, r, p, C, res, win) {
    const st = r.nho.get(p.id), c = p.id === HL.id ? Math.max(0, (hlMy().nTurn || 1) - 1) : st ? st.c : 0;
    if (res) { if (res.v !== null) hlResText(g, C, hlTime(res.v), win); else hlResText(g, C, `${res.c || 0}/${r.cfg.tops.length - 1}`, false, '#777'); }
    else hlBar(g, C.x + C.w * .1, C.y + C.h * .2, C.w * .8, 7, c / (r.cfg.tops.length - 1), '#2f6a4c');
  },
  val: (r, row) => hlTime(row.v), win: (r, row) => `đúng cả ${r.cfg.tops.length - 1} lần trong ${hlTime(row.v)}`,
  mine: (r, row) => row.v === null ? `Bạn đúng ${row.c || 0}/${r.cfg.tops.length - 1} lần, chưa đủ` : `Bạn đúng cả ${r.cfg.tops.length - 1} lần · hạng ${row.rank}/${r.result.rows.length} · ${hlTime(row.v)}`,
};
function ntStart(r, ts) {   // Start: from here the 30 seconds run, for this player only
  const m = hlMy(); if (m.nTurn) return;
  if (hlAct2({ k: 's' }, ts)) { m.nTurn = 1; m.nSt = Math.max(0, hlEnd(r)); AU.pluck(90); }
}
function ntPick(r, tn, i, ts) {   // a pick sends itself and goes straight to the next turn
  const m = hlMy(); if (!m.nTurn || m.nDone || m.nTurn !== tn || r.cfg.limit - (hlEnd(r) - m.nSt) <= 0) return;
  if (hlAct2({ k: 'c', tn, v: i }, ts)) { m.nTurn++; if (tn === r.cfg.tops.length - 1) m.nDone = true; AU.pluck(70 + tn * 4); }
}

/* ---------- pick the cat's ear ---------- */
const NG_CAT = '#f1d98a', NG_FRAME = '#f3e7c1', NG_PATCH = '#cf9a3c', NG_PINK = '#e9a3a0';
function ngPoop(g, x, y, r) {   // a cute pellet: three soft lumps, two eyes, a smile and rosy cheeks
  g.save(); g.translate(x, y); g.lineWidth = Math.max(1.2, r * .13); g.strokeStyle = HL_INK; g.fillStyle = '#8a5a34'; g.lineJoin = 'round';
  for (const [dy, rx, ry] of [[r * .45, r, r * .55], [0, r * .78, r * .5], [-r * .45, r * .52, r * .42]]) { g.beginPath(); g.ellipse(0, dy, rx, ry, 0, 0, 6.283); g.fill(); g.stroke(); }
  g.fillStyle = '#fbf6e8'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * r * .27, -r * .02, r * .15, 0, 6.283); g.fill(); }
  g.fillStyle = HL_INK; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * r * .27, 0, r * .07, 0, 6.283); g.fill(); }
  g.strokeStyle = HL_INK; g.lineWidth = Math.max(1, r * .1); g.beginPath(); g.arc(0, r * .12, r * .13, .2, Math.PI - .2); g.stroke();
  g.fillStyle = 'rgba(220,100,110,.55)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * r * .52, r * .1, r * .13, r * .08, 0, 0, 6.283); g.fill(); }
  g.restore();
}
// where everything is: the face is zoomed in so that only its right half shows; the ear is on the right with its opening at O,
// the canal runs left from there (the deepest part, the eardrum, at E) and the stick always lies beside the ear, pointing into it
function ngGeo(b) {
  const R = Math.min(b.w * .6, b.h * .55), cx = b.x + b.w * .14, cy = b.y + b.h * .64, O = { x: cx + R * .78, y: cy - R * .42 }, E = { x: b.x + 16, y: cy - R * .4 }, L = O.x - E.x;
  return { R, cx, cy, O, E, L, th: Math.min(b.h * .17, 44), Ls: L * 1.4 };
}
function ngHead(g, G, mood, face) {   // face = false: only the outline (the frame stays while the inside of the ear is shown)
  const { R, cx, cy, O } = G, fill = face ? NG_CAT : NG_FRAME;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 3.2; g.strokeStyle = HL_INK;
  g.beginPath(); g.ellipse(cx, cy, R, R * .88, 0, 0, 6.283); g.fillStyle = fill; g.fill(); g.stroke();   // head
  g.beginPath(); g.moveTo(cx + R * .98, cy - R * .1); g.lineTo(cx + R * .95, cy - R * .98); g.lineTo(cx + R * .4, cy - R * .78); g.closePath(); g.fillStyle = fill; g.fill();   // the ear, set low on the head
  g.beginPath(); g.moveTo(cx + R * .98, cy - R * .1); g.lineTo(cx + R * .95, cy - R * .98); g.lineTo(cx + R * .4, cy - R * .78); g.stroke();
  if (!face) { g.restore(); return; }
  g.beginPath(); g.moveTo(cx + R * .9, cy - R * .2); g.lineTo(cx + R * .87, cy - R * .84); g.lineTo(cx + R * .52, cy - R * .69); g.closePath(); g.fillStyle = NG_PINK; g.fill();
  g.beginPath(); g.ellipse(O.x, O.y, R * .075, R * .12, -.5, 0, 6.283); g.fillStyle = '#3a2218'; g.fill();   // the ear's opening
  g.strokeStyle = NG_PATCH; g.lineWidth = Math.max(3, R * .06); for (const o of [-1, 0, 1]) { g.beginPath(); g.moveTo(cx + o * R * .22 + R * .15, cy - R * .8); g.lineTo(cx + o * R * .17 + R * .15, cy - R * .56); g.stroke(); }
  g.strokeStyle = HL_INK; g.lineWidth = 2.6;
  const ex = cx + R * .42, ey = cy - R * .06;   // the right eye
  if (mood === 'scream') { g.lineWidth = 3.6; g.beginPath(); g.moveTo(ex + R * .14, ey - R * .14); g.lineTo(ex - R * .1, ey); g.lineTo(ex + R * .14, ey + R * .14); g.stroke(); g.lineWidth = 2.6; }
  else if (mood === 'happy') { g.lineWidth = 3.4; g.beginPath(); g.arc(ex, ey + R * .06, R * .15, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.lineWidth = 2.6; }
  else {
    const w = mood === 'worried' ? 1.35 : 1;
    g.beginPath(); g.ellipse(ex, ey, R * .14 * w, R * .18 * w, 0, 0, 6.283); g.fillStyle = '#fbf6e8'; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(ex - R * .02, ey, R * .06, R * (mood === 'worried' ? .08 : .13), 0, 0, 6.283); g.fillStyle = HL_INK; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - R * .0, ey - R * .06, R * .035, 0, 6.283); g.fill();
    if (mood === 'worried') { g.beginPath(); g.moveTo(ex - R * .2, ey - R * .3); g.lineTo(ex + R * .18, ey - R * .22); g.stroke(); }   // a raised brow
  }
  g.fillStyle = 'rgba(224,110,120,.5)'; g.beginPath(); g.ellipse(cx + R * .66, cy + R * .2, R * .15, R * .09, 0, 0, 6.283); g.fill();   // rosy cheek
  g.beginPath(); g.moveTo(cx - R * .1, cy + R * .1); g.lineTo(cx + R * .1, cy + R * .1); g.lineTo(cx, cy + R * .2); g.closePath(); g.fillStyle = '#d9707a'; g.fill(); g.stroke();   // nose
  if (mood === 'scream') { g.beginPath(); g.ellipse(cx, cy + R * .5, R * .27, R * .3, 0, 0, 6.283); g.fillStyle = '#a3332a'; g.fill(); g.stroke(); g.beginPath(); g.ellipse(cx, cy + R * .62, R * .15, R * .13, 0, 0, 6.283); g.fillStyle = '#e8838a'; g.fill(); }
  else if (mood === 'worried') { g.beginPath(); g.moveTo(cx, cy + R * .2); g.lineTo(cx, cy + R * .3); g.stroke(); g.beginPath(); g.moveTo(cx - R * .3, cy + R * .4); g.quadraticCurveTo(cx - R * .15, cy + R * .3, cx, cy + R * .4); g.quadraticCurveTo(cx + R * .15, cy + R * .5, cx + R * .3, cy + R * .4); g.stroke(); g.fillStyle = '#7fc2e8'; g.beginPath(); g.moveTo(cx + R * .78, cy - R * .5); g.quadraticCurveTo(cx + R * .86, cy - R * .36, cx + R * .78, cy - R * .3); g.quadraticCurveTo(cx + R * .7, cy - R * .36, cx + R * .78, cy - R * .5); g.fill(); g.stroke(); }
  else { g.beginPath(); g.moveTo(cx, cy + R * .2); g.lineTo(cx, cy + R * .3); g.stroke(); g.beginPath(); g.arc(cx + R * .1, cy + R * .3, R * .1, Math.PI * .1, mood === 'happy' ? Math.PI * 1.0 : Math.PI); g.stroke(); if (mood === 'happy') { g.beginPath(); g.ellipse(cx + R * .08, cy + R * .42, R * .13, R * .09, 0, 0, Math.PI); g.fillStyle = '#d9707a'; g.fill(); } }
  g.lineWidth = 1.8; for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(cx + R * .6, cy + R * (.28 + k * .04)); g.lineTo(cx + R * 1.2, cy + R * (.24 + k * .14)); g.stroke(); }   // whiskers
  g.restore();
}
function ngCanal(g, G, c, taken) {   // the inside of the ear: the opening on the right, the eardrum at the far left, the pellets in a row between
  const { O, E, L, th } = G, y = O.y;
  g.save(); g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = HL_INK;
  g.beginPath(); g.ellipse(O.x, y, th * .5, th * .85, 0, 0, 6.283); g.fillStyle = NG_PINK; g.fill(); g.stroke();   // the opening
  g.beginPath(); g.roundRect(E.x - 2, y - th / 2, L + 2, th, th * .35); g.fillStyle = NG_PINK; g.fill(); g.stroke();   // the canal
  g.strokeStyle = 'rgba(160,70,70,.45)'; g.lineWidth = 2; for (let i = 1; i < 13; i++) { const x = E.x + L * i / 13; g.beginPath(); g.moveTo(x, y - th / 2 + 3); g.lineTo(x - 3, y - th / 2 + th * .16); g.moveTo(x, y + th / 2 - 3); g.lineTo(x - 3, y + th / 2 - th * .16); g.stroke(); }
  g.beginPath(); g.ellipse(E.x, y, th * .09, th * .5, 0, 0, 6.283); g.fillStyle = '#f6d9c8'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = HL_INK; g.stroke();   // the eardrum
  g.beginPath(); g.ellipse(E.x, y, th * .045, th * .28, 0, 0, 6.283); g.strokeStyle = 'rgba(160,90,80,.6)'; g.lineWidth = 1.6; g.stroke();
  const pr = Math.min(th * .3, L * .034), last = c.ps.length - 1;
  c.ps.forEach((d, i) => { if (!taken(d)) ngPoop(g, O.x - d * L, y + (i === last ? pr * .2 : th * .04), i === last ? pr * .62 : pr); });   // the last one is smaller and right beside the eardrum
  g.restore();
}
function ngStick(g, G, depth, carried, outsideOnly, b) {   // the stick: it always lies beside the ear; inside the ear it shows only when the inside is shown
  const { O, L, th, Ls } = G, tip = O.x - depth * L, lw = Math.max(5, th * .16);
  g.save(); if (outsideOnly) { g.beginPath(); g.rect(O.x, b.y, b.x + b.w - O.x, b.h); g.clip(); }
  g.lineCap = 'round'; g.strokeStyle = HL_INK; g.lineWidth = lw + 3; g.beginPath(); g.moveTo(tip, O.y); g.lineTo(tip + Ls, O.y); g.stroke();
  g.strokeStyle = '#c99a5a'; g.lineWidth = lw; g.beginPath(); g.moveTo(tip, O.y); g.lineTo(tip + Ls, O.y); g.stroke();
  g.beginPath(); g.ellipse(tip + 2, O.y, lw * 1.3, lw * .85, 0, 0, 6.283); g.fillStyle = '#d4d8da'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = HL_INK; g.stroke();   // the little scoop
  const pr = Math.min(th * .22, L * .028);
  for (let i = 0; i < carried; i++) ngPoop(g, tip + lw * 2.4 + (i % 4) * pr * 2.1, O.y - lw * .9 - pr * .7 - Math.floor(i / 4) * pr * 1.9, pr);   // what it has caught
  g.restore();
}
HL_G.ngoay = {
  name: 'Ngoáy tai mèo', rule: 'Giữ nút để ngoáy sâu vào, thả ra để rút que.', ctl: 'hold', ipH: hlTall(.62, 300),
  controls(r, W, H, b) {
    if (typeof MEOW_B64 !== 'undefined') AU.sampleB64('meovo', MEOW_B64);   // the cat's cry from chương I, tranh 6
    const s = (r.ng && r.ng.get(HL.id)) || {}, e = hlEnd(r), late = s.d === undefined && e > r.cfg.t2 + r.cfg.limit, off = e < r.cfg.t2 - 150 || late || s.u !== undefined || s.pierce !== undefined;
    b.push(hlWide(W, H, { id: 'main', key: ' ', label: e < r.cfg.t2 - 150 ? 'Nhìn kỹ nhé…' : late ? 'Hết giờ' : s.u !== undefined || s.pierce !== undefined ? 'Xong rồi' : s.d !== undefined ? 'ĐANG NGOÁY…' : 'GIỮ ĐỂ NGOÁY', size: 20, plain: true, fill: '#2f6a4c', fillDown: '#1f4a34', ink: '#f2ecde', off, down: ev => hlHold(true, ev.timeStamp), up: () => hlHold(false) }));
    return { btns: b, h: 74 };
  },
  tick(r) {   // the stick reaches the eardrum while the button is still down: through it goes, the cat cries out
    const s = r.ng && r.ng.get(HL.id); if (!s || s.d === undefined || s.u !== undefined || s.pierce !== undefined || hlEnd(r) - s.d < 1000 / r.cfg.speed) return;
    s.pierce = s.d + 1000 / r.cfg.speed; HL_NET.send({ t: 'act', n: r.n, k: 'u', at: hlTs() });
    if (AU.hasSample('meovo')) AU.play('meovo', 1); else AU.meow();
  },
  info(g, r, now, b) {
    const c = r.cfg, e = hlEnd(r), s = (r.ng && r.ng.get(HL.id)) || {}, G = ngGeo(b), none = () => false;
    g.save(); g.beginPath(); g.rect(b.x, b.y, b.w, b.h); g.clip();
    if (e < c.t1) { ngHead(g, G, 'smile', true); ngStick(g, G, 0, 0, true, b); g.restore(); return; }   // the face first
    if (e < c.t2) { ngHead(g, G, 'smile', false); ngCanal(g, G, c, none); ngStick(g, G, 0, 0, false, b); g.restore(); return; }   // then the inside of the ear: memorise it
    let depth = 0, cover = 0, mood = 'smile', carried = 0, taken = none, shown = -1;
    if (s.d !== undefined) {
      if (s.pierce !== undefined) { depth = 1; cover = 1; mood = 'scream'; }
      else if (s.u !== undefined) {   // let go: the inside shows again and the stick is drawn out slowly with what it caught
        if (s.rel === undefined) { s.rel = Math.min(.999, c.speed * (s.u - s.d) / 1000); s.got = c.ps.filter(x => x <= s.rel).length; s.uE = hlEnd(r); }
        const q = Math.min(1, (e - s.uE) / 1800), k = q * q * (3 - 2 * q); depth = s.rel * (1 - k); carried = s.got; taken = d => d <= s.rel; cover = Math.max(0, 1 - (e - s.uE) / 200); mood = 'happy'; shown = Math.round(s.got * k);
      } else {
        depth = Math.min(1, c.speed * (e - s.d) / 1000); carried = c.ps.filter(x => x <= depth).length; taken = d => d <= depth; mood = depth < .45 ? 'happy' : 'worried';
        if (depth >= c.ps[0]) { if (s.cE === undefined) s.cE = e; cover = Math.min(1, (e - s.cE) / 250); }   // once the stick is past the first pellet the face covers the ear again
      }
    }
    ngHead(g, G, 'smile', false); ngCanal(g, G, c, taken); ngStick(g, G, depth, carried, false, b);
    if (s.d === undefined) { const left = Math.max(0, Math.ceil((c.t2 + c.limit - e) / 1000)); hlText(g, String(left), b.x + b.w - 22, b.y + 22, 20, { w: 800, f: hlSans, o: false, c: left <= 5 ? '#a3332a' : HL_INK }); }   // 15 seconds to start
    if (cover > 0) { g.globalAlpha = cover; ngHead(g, G, mood, true); g.globalAlpha = 1; ngStick(g, G, depth, 0, true, b); }
    if (shown >= 0 && s.uE !== undefined) hlText(g, `Lấy được: ${shown} cục`, b.x + b.w * .5, b.y + b.h - 16, 18, { w: 800, f: hlSans, o: false, c: HL_INK });
    g.restore();
  },
  cell(g, r, p, C, res, win) {
    if (res) { if (res.v > 0) hlResText(g, C, `${res.v} cục`, win); else hlResText(g, C, res.pierce ? 'thủng tai!' : 'không lấy được', false, '#a3332a'); }
    else if (r.picked.has(p.id)) hlTick(g, C);
  },
  val: (r, row) => `${row.v} cục`, win: (r, row) => row.v === r.cfg.n ? `lấy hết ${row.v} cục` : `lấy được ${row.v}/${r.cfg.n} cục`,
  mine: (r, row) => row.pierce ? 'Bạn chọc thủng màng nhĩ mèo!' : row.v === 0 ? 'Bạn không lấy được cục nào' : `Bạn lấy ${row.v}/${r.cfg.n} cục · hạng ${row.rank}/${r.result.rows.length}`,
};
function hlNgoay(r, down, at, p) {   // press: the stick starts in (from the cut-away on); release: it is pulled out
  const m = r.ng || (r.ng = new Map()), s = m.get(HL.id) || {}; m.set(HL.id, s);
  if (down) { if (s.d === undefined && p >= r.cfg.t2 - 150 && p <= r.cfg.t2 + r.cfg.limit) { s.d = p; HL_NET.send({ t: 'act', n: r.n, k: 'd', at }); } return; }
  if (s.d === undefined || s.u !== undefined || s.pierce !== undefined) return;
  if (r.cfg.speed * (p - s.d) / 1000 >= 1) { s.pierce = s.d + 1000 / r.cfg.speed; if (AU.hasSample('meovo')) AU.play('meovo', 1); else AU.meow(); } else s.u = p;
  HL_NET.send({ t: 'act', n: r.n, k: 'u', at });
}

/* ---------- the maze ---------- */
const MZ_VIEW = 9;   // every screen, phone or computer, shows the same 9 x 9 cells around the mouse
const mzKey = (x, y) => (y + 3) * 100 + x + 3;
function mzSync(r, m) {   // fold what the server last told us (the cells around us, and our own place) into what we know
  const v = r.mzv; if (!v || v === m.vSeen) return; m.vSeen = v; m.walls = m.walls || new Map();
  const R = r.cfg.R, s = 2 * R + 1;
  for (let k = 0; k < s * s; k++) { const ch = v.w[k]; if (ch !== 'g') m.walls.set(mzKey(v.x + k % s - R, v.y + Math.floor(k / s) - R), parseInt(ch, 16)); }
  if (m.mx === undefined) { m.mx = v.x; m.my = v.y; m.rx = v.x; m.ry = v.y; }
  if (v.q === (m.q || 0)) { m.mx = v.x; m.my = v.y; }   // everything we sent has been dealt with: take the server's word for where we are
  if (v.f) m.fin = true;
}
function mzStep(r, d) {   // one cell, if the wall allows it (at most about nine steps a second)
  const m = hlMy(); if (m.fin || !m.walls || !hlCanAct(r)) return;
  const t = performance.now(); if (t - (m.lastMove || 0) < 100) return;
  const mask = m.walls.get(mzKey(m.mx, m.my)); if (mask === undefined || !(mask & (1 << d))) return;
  m.lastMove = t; m.q = (m.q || 0) + 1; hlAct2({ k: 'm', d, q: m.q });
  const dx = [0, 1, 0, -1][d], dy = [-1, 0, 1, 0][d]; m.mx += dx; m.my += dy; if (dx) m.face = dx;
  if (m.mx < 0 || m.my < 0 || m.mx >= r.cfg.N || m.my >= r.cfg.N) m.fin = true;   // out through the gap
}
HL_G.mecung = {
  name: 'Mê cung', rule: 'Tìm lối ra khỏi mê cung trong 60 giây. Ai ra trước thắng.', ctl: 'tiles', ipH: hlTall(.7, 330),
  controls(r, W, H, b) {
    const m = hlMy(), bw = Math.min(110, (W - 36) / 3), gap = 8, x0 = W / 2 - (3 * bw + 2 * gap) / 2, y1 = H - 118, y2 = H - 62;
    const mk = (d, label, x, y, key) => hlBtn({ id: 'mz' + d, label, size: 24, plain: true, key, x, y, w: bw, h: 46, fill: '#c9a062', ink: HL_INK, down: () => { m.dir = d; mzStep(r, d); }, up: () => { if (m.dir === d) m.dir = -1; } });
    b.push(mk(0, '↑', x0 + bw + gap, y1, 'ArrowUp'), mk(3, '←', x0, y2, 'ArrowLeft'), mk(2, '↓', x0 + bw + gap, y2, 'ArrowDown'), mk(1, '→', x0 + 2 * (bw + gap), y2, 'ArrowRight'));
    return { btns: b, h: 126 };
  },
  tick(r) { const m = hlMy(); mzSync(r, m); if (m.dir >= 0) mzStep(r, m.dir); },   // a button held down keeps walking
  info(g, r, now, b) {
    const m = hlMy(), c = r.cfg, e = hlEnd(r); mzSync(r, m);
    const S = Math.min(b.w, b.h) - 8, cs = S / MZ_VIEW, ox = b.x + b.w / 2 - S / 2, oy = b.y + b.h / 2 - S / 2;
    g.save(); g.beginPath(); g.roundRect(ox, oy, S, S, 10); g.clip(); g.fillStyle = '#2a2420'; g.fillRect(ox, oy, S, S);
    if (m.mx === undefined || !m.walls) { hlText(g, 'Chuẩn bị…', b.W / 2, b.y + b.h / 2, 18, { w: 800, f: hlSans, o: false, c: '#f2ecde' }); g.restore(); return; }
    const dt = Math.min(.1, HL.t - (m.rt || HL.t)); m.rt = HL.t; const kk = 1 - Math.exp(-dt * 16);
    m.rx += (m.mx - m.rx) * kk; m.ry += (m.my - m.ry) * kk;
    const sx = x => ox + S / 2 + (x - m.rx - .5) * cs, sy = y => oy + S / 2 + (y - m.ry - .5) * cs, rad = Math.ceil(MZ_VIEW / 2) + 1;
    const x0 = Math.floor(m.rx) - rad, y0 = Math.floor(m.ry) - rad;
    g.fillStyle = '#f2ecde'; for (let y = y0; y <= y0 + 2 * rad; y++) for (let x = x0; x <= x0 + 2 * rad; x++) if (m.walls.get(mzKey(x, y)) !== undefined && x >= 0 && y >= 0 && x < c.N && y < c.N) g.fillRect(sx(x), sy(y), cs + .5, cs + .5);
    g.strokeStyle = HL_INK; g.lineWidth = Math.max(3, cs * .12); g.lineCap = 'round';
    for (let y = y0; y <= y0 + 2 * rad; y++) for (let x = x0; x <= x0 + 2 * rad; x++) {
      const k = m.walls.get(mzKey(x, y)); if (k === undefined || x < 0 || y < 0 || x >= c.N || y >= c.N) continue;
      const X = sx(x), Y = sy(y); g.beginPath();
      if (!(k & 1)) { g.moveTo(X, Y); g.lineTo(X + cs, Y); } if (!(k & 2)) { g.moveTo(X + cs, Y); g.lineTo(X + cs, Y + cs); }
      if (!(k & 4)) { g.moveTo(X, Y + cs); g.lineTo(X + cs, Y + cs); } if (!(k & 8)) { g.moveTo(X, Y); g.lineTo(X, Y + cs); }
      g.stroke();
    }
    // the mice: the others (if they are in view), then me with a gold ring
    const sm = r.mzs || (r.mzs = new Map()), mouse = (x, y, face, me) => {
      const px = sx(x) + cs / 2, py = sy(y) + cs * .86;
      if (me) { g.beginPath(); g.ellipse(px, py + 1, cs * .36, cs * .13, 0, 0, 6.283); g.fillStyle = 'rgba(240,190,60,.75)'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#a77a12'; g.stroke(); }
      demDrawUp(g, px, py, cs * .72, face, HL.t * 10 + x * 3, true);
    };
    for (const [id, p] of Object.entries(r.mzp || {})) {
      if (id === HL.id) continue; const q = sm.get(id) || { x: p[0], y: p[1] }; sm.set(id, q); q.x += (p[0] - q.x) * kk; q.y += (p[1] - q.y) * kk;
      if (Math.abs(q.x - m.rx) < MZ_VIEW / 2 + 1 && Math.abs(q.y - m.ry) < MZ_VIEW / 2 + 1) mouse(q.x, q.y, p[0] >= q.x ? 1 : -1, false);
    }
    mouse(m.rx, m.ry, m.face || 1, true);
    g.restore();
    g.lineWidth = 3; g.strokeStyle = HL_INK; g.beginPath(); g.roundRect(ox, oy, S, S, 10); g.stroke();
    const left = Math.max(0, Math.ceil((c.len - e) / 1000)), pw = m.fin ? 170 : 54; g.beginPath(); g.roundRect(ox + S / 2 - pw / 2, oy + 5, pw, 26, 13); g.fillStyle = 'rgba(42,36,32,.88)'; g.fill();   // a dark pill so the number reads over the maze
    hlText(g, m.fin ? 'Ra rồi! Chờ kết quả…' : String(left), ox + S / 2, oy + 18, m.fin ? 14 : 20, { w: 800, f: hlSans, o: false, c: m.fin ? '#2f6a4c' : left <= 10 ? '#ffb4a8' : '#f2ecde' });
  },
  cell(g, r, p, C, res, win) {
    if (res) { if (res.v !== null) hlResText(g, C, hlTime(res.v), win); else hlResText(g, C, 'chưa ra', false, '#777'); }
    else if (r.mzp && r.mzp[p.id] && r.mzp[p.id][2]) hlTick(g, C);
  },
  val: (r, row) => hlTime(row.v), win: (r, row) => `ra khỏi mê cung sau ${hlTime(row.v)}`,
  mine: (r, row) => row.v === null ? 'Bạn chưa ra khỏi mê cung' : `Bạn ra sau ${hlTime(row.v)} · hạng ${row.rank}/${r.result.rows.length}`,
};

/* ---------- slice the onion ---------- */
const thOuch = () => { AU.thump(); AU.meow(); setTimeout(() => AU.meow(), 140); };   // the yelp when the knife goes into the hand
function thTap(r, ts) {   // a tap is one slice; once the onion is gone the next tap goes into the hand
  const m = hlMy(); if (m.cut || !hlCanAct(r)) return;
  const t = performance.now(); if (t - (m.last || 0) < 60) return; m.last = t; m.q = (m.q || 0) + 1; m.kt = HL.t;
  hlAct2({ k: 't', q: m.q }, ts);
  if (m.fin) { m.cut = true; m.cutT = HL.t; thOuch(); return; }
  m.c = (m.c || 0) + 1; (m.sl = m.sl || []).push({ t: HL.t, k: m.c }); if (m.sl.length > 14) m.sl.shift(); AU.pluck(60 + (m.c % 5) * 4);
  if (m.c >= r.cfg.n) m.fin = true;
}
function thSync(r, m) {   // the server's own count wins once everything we sent has been dealt with
  const v = r.onv; if (!v || v === m.vSeen) return; m.vSeen = v;
  if (v.q === (m.q || 0)) { m.c = v.c; m.fin = !!v.f; if (v.x && !m.cut) { m.cut = true; m.cutT = HL.t; thOuch(); } else if (!v.x && m.cut) m.cut = false; }
}
function thPaw(g, x, y, r, rot) {   // a mouse's hand: a round paw with little fingers
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.lineWidth = Math.max(1.6, r * .14); g.strokeStyle = HL_INK; g.fillStyle = '#d8cfc0';
  for (const a of [-.55, 0, .55]) { g.beginPath(); g.ellipse(Math.sin(a) * r * .8, -Math.cos(a) * r * .8, r * .3, r * .38, a, 0, 6.283); g.fill(); g.stroke(); }
  g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill(); g.stroke(); g.restore();
}
HL_G.thaihanh = {
  name: 'Thái hành tây', rule: 'Bấm nhanh để thái hết củ hành. Thái quá là cắt vào tay!', ctl: 'tap', ipH: hlTall(.62, 300),
  controls(r, W, H, b) {
    const m = hlMy(), off = hlEnd(r) < 0 || m.cut;
    b.push(hlWide(W, H, { id: 'main', key: ' ', label: m.cut ? 'Á đau!' : 'THÁI!', size: 24, plain: true, fill: '#7a2d6a', fillDown: '#561f4a', ink: '#f2ecde', off, down: ev => thTap(r, ev.timeStamp) }));
    return { btns: b, h: 74 };
  },
  tick(r) { thSync(r, hlMy()); },
  info(g, r, now, b) {
    const m = hlMy(), n = r.cfg.n, e = hlEnd(r), c = Math.min(m.c || 0, n), prog = c / n; thSync(r, m);
    const base = b.y + b.h * .8, ow = b.w * .34, oh = b.h * .38, ox0 = b.x + b.w * .42, xe = ox0 + prog * ow, cxo = ox0 + ow / 2;
    g.save(); g.beginPath(); g.rect(b.x, b.y, b.w, b.h); g.clip();
    const left = Math.max(0, Math.ceil((r.cfg.len - e) / 1000)); hlText(g, String(left), b.x + b.w - 22, b.y + 20, 20, { w: 800, f: hlSans, o: false, c: left <= 5 ? '#a3332a' : HL_INK });   // 30 seconds at most
    g.beginPath(); g.roundRect(b.x + b.w * .18, base, b.w * .74, b.h * .1, 8); g.fillStyle = '#b98b5a'; g.fill(); g.lineWidth = 3; g.strokeStyle = HL_INK; g.stroke();   // the board
    // the onion: the part not yet sliced off
    if (c < n) {
      g.save(); g.beginPath(); g.rect(xe, b.y, b.x + b.w - xe, b.h); g.clip();
      g.beginPath(); g.moveTo(cxo - ow * .06, base - oh * 1.12); g.bezierCurveTo(cxo - ow * .1, base - oh * .98, cxo - ow * .5, base - oh * .86, cxo - ow * .5, base - oh * .4);
      g.bezierCurveTo(cxo - ow * .5, base - oh * .02, cxo + ow * .5, base - oh * .02, cxo + ow * .5, base - oh * .4); g.bezierCurveTo(cxo + ow * .5, base - oh * .86, cxo + ow * .1, base - oh * .98, cxo + ow * .06, base - oh * 1.12); g.closePath();
      g.fillStyle = '#e8b6d6'; g.fill(); g.lineWidth = 3; g.strokeStyle = HL_INK; g.stroke();
      g.lineWidth = 2; g.strokeStyle = 'rgba(150,60,120,.55)'; for (const k of [-.3, -.12, .06, .24, .4]) { g.beginPath(); g.moveTo(cxo + ow * k * .2, base - oh * 1.0); g.quadraticCurveTo(cxo + ow * k * 1.7, base - oh * .5, cxo + ow * k * 1.1, base - oh * .03); g.stroke(); }
      g.fillStyle = '#9ccf6a'; g.beginPath(); g.moveTo(cxo - 3, base - oh * 1.1); g.lineTo(cxo + 2, base - oh * 1.28); g.lineTo(cxo + 6, base - oh * 1.1); g.closePath(); g.fill(); g.stroke();   // the sprout
      g.restore();
    } else {   // nothing left but the slices
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#e8b6d6' : '#d98cb8'; g.fillRect(ox0 + ow * .15 + i * ow * .06, base - 6 - (i % 3) * 3, ow * .05, 6 + (i % 3) * 3); }
    }
    // the slices that fall off
    const sl = m.sl || []; g.fillStyle = '#e8b6d6'; g.lineWidth = 1.5; g.strokeStyle = HL_INK;
    for (const s of sl) { const a = HL.t - s.t; if (a > .7) continue; const x = ox0 + (s.k - 1) / n * ow - 8 - a * 30, y = base - oh * .5 + a * a * b.h * 1.3; g.save(); g.translate(x, y); g.rotate(a * 5); g.fillRect(-2.5, -oh * .22, 5, oh * .44); g.strokeRect(-2.5, -oh * .22, 5, oh * .44); g.restore(); }
    // the paw that holds the onion, and the knife with its paw
    thPaw(g, ox0 + ow + 6, base - oh * .25, Math.min(14, b.w * .035), .3);
    const ph = Math.max(0, Math.min(1, (HL.t - (m.kt || -9)) / .13)), lift = b.h * .12 * (1 - Math.sin(Math.PI * ph)), kx = xe - 10, ky = base - oh * .95 - lift;
    g.save(); g.translate(kx, ky); g.rotate(-.12);
    g.lineJoin = 'round'; g.fillStyle = '#cdd3d7'; g.lineWidth = 3; g.strokeStyle = HL_INK; g.beginPath(); g.moveTo(-5, 0); g.lineTo(8, 0); g.lineTo(8, oh * 1.0); g.lineTo(-5, oh * .96); g.closePath(); g.fill(); g.stroke();   // the blade
    g.fillStyle = '#7a4a22'; g.fillRect(-4, -oh * .42, 11, oh * .42); g.strokeRect(-4, -oh * .42, 11, oh * .42);   // the handle
    thPaw(g, 1.5, -oh * .48, Math.min(15, b.w * .037), 0); g.restore();
    // the face: calm until the first slice, then crying harder and harder; after a cut it wails and stays that way
    const crying = c > 0 || m.cut, I = m.cut ? 1.4 : crying ? Math.min(1, .15 + prog * 1.05) : 0, fx = b.x + b.w * .17, fy = b.y + b.h * .3, fr = Math.min(b.w, b.h) * .13;
    g.lineWidth = 3; g.strokeStyle = HL_INK; g.fillStyle = '#d8cfc0';
    for (const sx of [-1, 1]) { g.beginPath(); g.arc(fx + sx * fr * .78, fy - fr * .85, fr * .4, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = NG_PINK; g.beginPath(); g.arc(fx + sx * fr * .78, fy - fr * .85, fr * .22, 0, 6.283); g.fill(); g.fillStyle = '#d8cfc0'; }
    g.beginPath(); g.ellipse(fx, fy, fr, fr * .9, 0, 0, 6.283); g.fill(); g.stroke();
    for (const sx of [-1, 1]) {
      const ex = fx + sx * fr * .4, ey = fy - fr * .1;
      if (crying) { g.lineWidth = 3.2; g.beginPath(); g.moveTo(ex - sx * fr * .22, ey - fr * .16); g.lineTo(ex + sx * fr * .1, ey); g.lineTo(ex - sx * fr * .22, ey + fr * .16); g.stroke(); }   // eyes squeezed shut
      else { g.lineWidth = 2.4; g.beginPath(); g.ellipse(ex, ey, fr * .15, fr * .19, 0, 0, 6.283); g.fillStyle = '#fbf6e8'; g.fill(); g.stroke(); g.beginPath(); g.ellipse(ex, ey + fr * .02, fr * .07, fr * .12, 0, 0, 6.283); g.fillStyle = HL_INK; g.fill(); g.fillStyle = '#d8cfc0'; }
    }
    g.fillStyle = '#d9707a'; g.beginPath(); g.arc(fx, fy + fr * .2, fr * .1, 0, 6.283); g.fill();
    if (m.cut) { g.beginPath(); g.ellipse(fx, fy + fr * .52, fr * .3, fr * .26, 0, 0, 6.283); g.fillStyle = '#a3332a'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = HL_INK; g.stroke(); g.beginPath(); g.ellipse(fx, fy + fr * .62, fr * .16, fr * .1, 0, 0, 6.283); g.fillStyle = '#e8838a'; g.fill(); }   // wailing
    else { g.strokeStyle = '#d9707a'; g.lineWidth = 2.4; g.beginPath(); if (crying) { g.moveTo(fx - fr * .25, fy + fr * .5); g.quadraticCurveTo(fx, fy + fr * .35, fx + fr * .25, fy + fr * .5); } else { g.moveTo(fx - fr * .25, fy + fr * .4); g.quadraticCurveTo(fx, fy + fr * .55, fx + fr * .25, fy + fr * .4); } g.stroke(); }
    if (I > 0) { g.fillStyle = 'rgba(110,190,240,.9)'; for (const sx of [-1, 1]) { const ex = fx + sx * fr * .4, ey = fy - fr * .02; for (let i = 0; i < 3 + Math.round(I * 6); i++) { const t = ((HL.t * (1.3 + I) + i / 7 + (sx > 0 ? .3 : 0)) % 1), x = ex + sx * (t * fr * (.2 + I * .9)) + (i % 2 ? -1 : 1) * t * 3, y = ey + t * t * fr * 3 + t * fr * .5; g.beginPath(); g.arc(x, y, 2.4 + I * 1.8, 0, 6.283); g.fill(); } } }   // tears, flying out and dropping
    if (m.cut) { g.fillStyle = '#c0261c'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(xe + 4 + Math.cos(i * 2.1) * 46, base - oh * .3 - Math.abs(Math.sin(i * 1.3)) * 60 + 30, 2.6, 0, 6.283); g.fill(); }   // the cut stays as it is until the result
      const a = HL.t - (m.cutT || HL.t), sz = 22 + Math.min(1, a / 1.6) * (Math.min(60, b.w * .125) - 22), sh = Math.min(1, a / .3) * 4;   // the cry grows and shakes
      hlText(g, 'Đứt tay rồi!', b.x + b.w * .5 + Math.sin(HL.t * 70) * sh, b.y + b.h * .5 + Math.cos(HL.t * 83) * sh, sz, { w: 900, f: hlSans, o: true, c: '#d11a10' }); }
    g.restore();
  },
  cell(g, r, p, C, res, win) {
    const pv = r.prog && r.prog[p.id], own = p.id === HL.id, n = r.cfg.n, c = own ? Math.min(hlMy().c || 0, n) : pv < 0 ? -1 - pv : pv || 0, cut = own ? !!hlMy().cut : pv < 0;
    if (res) { if (res.v !== null) hlResText(g, C, hlTime(res.v), win); else hlResText(g, C, res.cut ? 'cắt vào tay!' : `${res.c}/${n}`, false, res.cut ? '#a3332a' : '#777'); }
  },
  val: (r, row) => hlTime(row.v), win: (r, row) => `thái xong hành sau ${hlTime(row.v)}`,
  mine: (r, row) => row.v === null ? (row.cut ? 'Bạn thái quá, cắt vào tay!' : `Bạn mới thái ${row.c}/${r.cfg.n} lát`) : `Bạn thái xong sau ${hlTime(row.v)} · hạng ${row.rank}/${r.result.rows.length}`,
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
      return { btns: b, h: 74, note: side === -1 ? '' : 'Đã chọn phe, chờ giờ kéo…' };
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
