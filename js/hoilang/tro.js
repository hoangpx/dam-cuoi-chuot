/* Chương IX · Hội Làng — the 11 games (HL_G). Each game says how to draw its live picture in the info panel (info), what to add in
   every player's cell (cell, pose), which controls it needs (controls), how to word a result (val, win, mine) and its name and
   rule. The server (server/phong-choi/src/index.js) holds the real rules; this only draws what it is told from the server clock:
     ten / trong   press at 10,000 s / on the 9th beat      pomelo   stop the falling pomelo      giua   stop the slider in the middle
     tuong         hold to run while the cat sleeps         balloon  hold to blow, release to keep
     minnum        smallest number nobody else picked       lantern  press when the lantern changes
     boat          tap for 10 s                             hang     pick one of 3 holes, the cat pounces on one
     nho           repeat the drums in order. */

const HL_DRUM = ['#a3332a', '#f2c640', '#2f6a4c', '#3f8a86'];
// the same race simulation as the server's (steps of 20 ms from hold / release events), so every runner can be drawn live
function tuongSim(cfg, ev, end) {
  let pos = 0, hold = false, k = 0, ph = 0, caught = null, fin = null;
  for (let t = 0; t <= end; t += 20) {
    while (k < ev.length && ev[k][0] <= t) hold = ev[k++][1] === 'd';
    while (ph + 1 < cfg.ph.length && cfg.ph[ph + 1][0] <= t) ph++;
    if (hold && cfg.ph[ph][1] === 1 && t >= cfg.ph[ph][0] + cfg.grace) { caught = t; break; }
    if (hold) { pos += cfg.v * .02; if (pos >= cfg.D) { fin = t; pos = cfg.D; break; } }
  }
  return { pos, caught, fin, hold };
}
function hlTuongOf(r, id) {   // cached for the frame (the pose and the cell both ask)
  const e = Math.min(hlEnd(r), r.cfg.len), key = Math.floor(e / 20); r.tc = r.tc || new Map(); const c = r.tc.get(id);
  if (c && c.key === key) return c.s;
  const s = tuongSim(r.cfg, r.ev.get(id) || [], e); r.tc.set(id, { key, s }); return s;
}
const hlMyInp = r => r.inp.get(HL.id);
const hlBtn = (o) => ({ x: 10, y: 0, w: 0, h: 52, fill: '#a3332a', ink: '#f2ecde', ...o });
// one wide button
function hlWide(W, H, o) { const w = Math.min(320, W - 40); return hlBtn({ x: (W - w) / 2, y: H - 66, w, ...o }); }
// the line of values in a result cell
function hlResText(g, C, text, win, col) { hlText(g, text, C.cx, C.y + C.h * .27, Math.max(10, Math.min(16, C.w * .12)), { w: 800, c: col || (win ? '#a3332a' : HL_INK), o: false }); }
const hlTick = (g, C, ok = true) => hlText(g, ok ? '✓' : '✗', C.cx, C.y + C.h * .3, Math.min(34, C.w * .3), { w: 900, c: ok ? '#2f6a4c' : '#a3332a' });
const hlBar = (g, x, y, w, h, frac, col) => { g.fillStyle = 'rgba(29,25,21,.18)'; g.fillRect(x, y, w, h); g.fillStyle = col; g.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h); g.strokeStyle = HL_INK; g.lineWidth = 1.2; g.strokeRect(x, y, w, h); };
const hlSub = { f: hlSans, w: 600, o: false };

function hlPressCtl(r, W, H, btns, label) {
  const mp = hlMyInp(r), done = !!mp;
  btns.push(hlWide(W, H, { id: 'main', key: ' ', label: done ? 'Đã bấm ✓' : label, fill: done ? '#bdb7a6' : '#a3332a', ink: done ? HL_INK : '#f2ecde', off: done, down: e => hlPressAct(e.timeStamp) }));
  return { btns, h: 74 };
}
function hlHoldCtl(r, W, H, btns, label) {
  btns.push(hlWide(W, H, { id: 'main', key: ' ', label, size: 20, fill: '#2f6a4c', fillDown: '#1f4a34', down: e => hlHold(true, e.timeStamp), up: () => hlHold(false) }));
  return { btns, h: 74 };
}

const HL_G = {};

HL_G.ten = {
  name: 'Đếm đúng 10 giây', rule: 'Đồng hồ chạy 3 giây rồi bị che. Tự đếm và bấm đúng 10,000 giây!', ctl: 'press',
  controls: (r, W, H, b) => hlPressCtl(r, W, H, b, 'BẤM!'),
  info(g, r, now, b) {
    const mp = hlMyInp(r), e = now - r.t0, shown = e < r.cfg.show, done = mp && mp.p !== undefined;
    hlText(g, done ? (mp.p / 1000).toFixed(3) : shown ? (Math.max(0, e) / 1000).toFixed(2) : '?.??', b.W / 2, b.y + b.h / 2 + 2, Math.min(52, b.h * .5), { w: 900, c: done ? '#2f6a4c' : shown ? HL_INK : '#a3332a' });
    hlText(g, done ? 'Bạn bấm lúc này · chờ mọi người' : shown ? 'Nhìn kỹ nhịp đếm…' : 'Đồng hồ đã bị che, tự đếm tiếp!', b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell(g, r, p, C, res, win) { if (res) { if (res.v !== null) hlResText(g, C, hlTime(r.cfg.target + res.v), win); else hlResText(g, C, 'không bấm', false, '#777'); } else if (r.inp.has(p.id)) hlTick(g, C); },
  val: (r, row) => hlTime(r.cfg.target + row.v), win: (r, row) => 'bấm lúc ' + hlTime(r.cfg.target + row.v),
  mine: (r, row) => row.v === null ? 'Bạn không bấm kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · bấm lúc ${hlTime(r.cfg.target + row.v)}`,
};

HL_G.trong = {
  name: 'Giữ nhịp trống', rule: 'Nghe và nhìn 4 nhịp trống, rồi trống tắt. Tự giữ nhịp và bấm đúng vào nhịp thứ 9!', ctl: 'press',
  controls: (r, W, H, b) => hlPressCtl(r, W, H, b, 'BẤM!'),
  info(g, r, now, b) {
    const mp = hlMyInp(r), e = now - r.t0, bt = r.cfg.b, done = mp && mp.p !== undefined; r.beat = r.beat || {};
    for (let k = 0; k < r.cfg.beats; k++) {
      const lit = e >= k * bt && e < k * bt + 220, x = b.W / 2 + (k - 1.5) * 54, y = b.y + b.h / 2 - 8;
      if (e >= k * bt && !r.beat[k]) { r.beat[k] = true; AU.knock(1); }
      g.beginPath(); g.ellipse(x, y, lit ? 24 : 20, lit ? 17 : 14, 0, 0, 6.283); g.fillStyle = lit ? '#f2c640' : '#c9a062'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.stroke();
      g.beginPath(); g.ellipse(x, y, lit ? 14 : 11, lit ? 9 : 7, 0, 0, 6.283); g.lineWidth = 1.4; g.stroke();
    }
    hlText(g, done ? `Bạn bấm lúc ${(mp.p / 1000).toFixed(3)} giây` : e < r.cfg.beats * bt ? 'Đếm nhịp…' : 'Trống tắt rồi: bấm đúng nhịp thứ 9!', b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell: (g, r, p, C, res, win) => HL_G.ten.cell(g, r, p, C, res, win),
  val: (r, row) => hlTime(r.cfg.target + row.v), win: (r, row) => 'bấm lúc ' + hlTime(r.cfg.target + row.v) + ` (mốc ${hlTime(r.cfg.target)})`,
  mine: (r, row) => row.v === null ? 'Bạn không bấm kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · lệch ${(Math.abs(row.v) / 1000).toFixed(3)} giây`,
};

// a pomelo on a rope above the head: falls as (time / fall time)², stops where its owner pressed, hits the head if too late
function hlPomelo(g, r, p, C) {
  const tf = r.cfg.tf[p.id]; if (!tf) return;
  const pr = r.inp.get(p.id), e = Math.max(0, hlEnd(r)), pp = pr && pr.p !== undefined ? pr.p : e, fr = Math.min(1, Math.max(0, pp / tf)) ** 2;
  const rad = Math.max(8, Math.min(22, C.w * .1)), ropeTop = C.y + 8, y0 = ropeTop + rad, y1 = C.headTop - rad * .9, py = y0 + (y1 - y0) * fr;
  g.strokeStyle = HL_INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(C.cx, ropeTop); g.lineTo(C.cx, py - rad * .8); g.stroke(); g.fillStyle = HL_INK; g.fillRect(C.cx - 5, ropeTop - 2, 10, 3);
  const k = rad * 2.1 / 36; dp(g, WP.fruit, C.cx, py + rad * .5, 0, k, k);
  const hit = fr >= 1 && (!pr || pr.hit);
  if (hit) for (let i = 0; i < 3; i++) { const a = C.t * 6 + i * 2.1; hlText(g, '★', C.cx + Math.cos(a) * rad * 1.4, C.headTop - rad * 1.1 + Math.sin(a) * rad * .5, 12, { c: '#d98a2a', o: false }); }
  else if (pr && pr.p !== undefined && r.state === 'run') hlText(g, 'dừng!', C.cx + rad * 1.5, py, 11, { w: 800, c: '#2f6a4c' });
  if (pr && pr.p !== undefined) { const gp = hit ? null : 1 - fr; const msg = gp === null ? 'trúng đầu!' : hlMm(gp), fs = Math.max(9, Math.min(14, C.w * .105)), ty = C.y + C.h - C.nameH * 2.9; g.font = `800 ${fs}px ${hlSans}`; const tw = g.measureText(msg).width + 6; g.fillStyle = 'rgba(242,236,222,.92)'; g.fillRect(C.cx - tw / 2, ty - fs * .7, tw, fs * 1.4);   // a paper chip so the number reads over the figure
    hlText(g, msg, C.cx, ty, fs, { w: 800, f: hlSans, o: false, c: gp === null ? '#a3332a' : '#2f6a4c' }); }
}
function hlPomGap(r, id) { const pr = r.inp.get(id), tf = r.cfg.tf[id]; if (!pr || pr.p === undefined || pr.hit || !tf) return null; const f = pr.p / tf; return f >= 1 ? null : 1 - f * f; }
HL_G.pomelo = {
  name: 'Quả bưởi rơi', rule: 'Quả bưởi treo dây rơi xuống đầu bạn, càng lúc càng nhanh. Bấm dừng thật gần đầu, đừng để trúng!', ctl: 'press',
  controls: (r, W, H, b) => hlPressCtl(r, W, H, b, 'DỪNG!'),
  info(g, r, now, b, mine) {
    const mp = hlMyInp(r), gp = mp ? hlPomGap(r, HL.id) : null;
    hlText(g, mp ? (gp === null ? 'Trúng đầu rồi!' : `Cách đầu ${hlMm(gp)}`) : mine ? 'Bưởi đang rơi, bấm dừng!' : 'Bạn đang xem', b.W / 2, b.y + b.h / 2, mp ? 26 : 20, { w: 900, c: mp ? (gp === null ? '#a3332a' : '#2f6a4c') : HL_INK });
    hlText(g, mp ? 'Chờ mọi người dừng' : 'Rơi càng lúc càng nhanh, bấm trễ là trúng đầu', b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell: (g, r, p, C, res) => hlPomelo(g, r, p, C),
  val: (r, row) => hlMm(row.v), win: (r, row) => `cách đầu ${hlMm(row.v)}`,
  mine: (r, row) => row.v === null ? 'Quả bưởi trúng đầu bạn!' : `Bạn hạng ${row.rank}/${r.result.rows.length} · cách đầu ${hlMm(row.v)}`,
};

// the slider: x(p) = a triangle wave of the time with its own period and phase for each player
const hlGiuaX = (r, id, p) => { const u = ((p / r.cfg.T[id] + r.cfg.phi[id]) % 2 + 2) % 2; return u < 1 ? u : 2 - u; };
HL_G.giua = {
  name: 'Dừng đúng giữa', rule: 'Chấm đỏ chạy qua lại trên thanh. Bấm dừng khi nó đúng vạch giữa, ai sát nhất thắng!', ctl: 'press',
  controls: (r, W, H, b) => hlPressCtl(r, W, H, b, 'DỪNG!'),
  info(g, r, now, b) {
    const mp = hlMyInp(r), x0 = b.x + 24, w = b.w - 48, y = b.y + b.h / 2 - 4, p = mp && mp.p !== undefined ? mp.p : Math.max(0, now - r.t0), pos = hlGiuaX(r, HL.id, p);
    hlBar(g, x0, y - 7, w, 14, 0, '#a3332a'); g.fillStyle = '#2f6a4c'; g.fillRect(x0 + w * .5 - 3, y - 12, 6, 24); g.strokeStyle = HL_INK; g.lineWidth = 1.4; g.strokeRect(x0 + w * .5 - 3, y - 12, 6, 24);
    g.beginPath(); g.arc(x0 + w * pos, y, 10, 0, 6.283); g.fillStyle = '#a3332a'; g.fill(); g.stroke();
    hlText(g, mp ? `Bạn lệch ${(Math.abs(pos - .5) * 200).toFixed(1)} mm` : 'Bấm khi chấm đỏ qua vạch xanh giữa', b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const pr = r.inp.get(p.id), x0 = C.x + C.w * .1, w = C.w * .8, y = C.y + C.h * .2, pp = pr && pr.p !== undefined ? pr.p : (r.state === 'result' ? 8000 : hlEnd(r)), pos = hlGiuaX(r, p.id, pp);
    hlBar(g, x0, y - 3, w, 6, 0, '#a3332a'); g.fillStyle = '#2f6a4c'; g.fillRect(x0 + w * .5 - 1.5, y - 7, 3, 14);
    g.beginPath(); g.arc(x0 + w * pos, y, Math.max(3.5, C.w * .035), 0, 6.283); g.fillStyle = pr ? '#2f6a4c' : '#a3332a'; g.fill(); g.lineWidth = 1; g.strokeStyle = HL_INK; g.stroke();
    if (res) { if (res.v !== null) hlText(g, `lệch ${(res.v * 200).toFixed(1)} mm`, C.cx, C.y + C.h * .36, Math.max(10, Math.min(14, C.w * .11)), { w: 800, c: win ? '#a3332a' : HL_INK, o: false }); else hlText(g, 'không bấm', C.cx, C.y + C.h * .36, 11, { w: 600, o: false, al: .7 }); }
  },
  val: (r, row) => `lệch ${(row.v * 200).toFixed(1)} mm`, win: (r, row) => `lệch vạch giữa ${(row.v * 200).toFixed(1)} mm`,
  mine: (r, row) => row.v === null ? 'Bạn không bấm kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · lệch ${(row.v * 200).toFixed(1)} mm`,
};

HL_G.tuong = {
  name: 'Tượng gỗ', rule: 'Giữ nút để chạy khi mèo ngủ gật. Mèo mở mắt thì thả ra, đứng im như tượng! Ai chạy tới đích trước thắng, ai nhúc nhích bị bắt.', ctl: 'hold',
  controls: (r, W, H, b) => hlHoldCtl(r, W, H, b, 'GIỮ ĐỂ CHẠY'),
  pose(r, p) { const s = hlTuongOf(r, p.id); return { run: s.hold && s.caught === null && s.fin === null && r.state === 'run', dim: s.caught !== null }; },
  info(g, r, now, b) {
    const e = now - r.t0, ph = r.cfg.ph; let i = 0; while (i + 1 < ph.length && ph[i + 1][0] <= e) i++;
    const face = ph[i][1] === 1, tell = !face && ph[i + 1] && ph[i + 1][0] - e < 350, st = face ? 'watch' : tell ? 'warn' : 'sleep';
    g.save(); g.translate(b.W / 2 - 70, b.y + b.h - 8); drawCatAt(g, 0, 0, .3, st); g.restore();
    const s = hlTuongOf(r, HL.id);
    hlText(g, s.caught !== null ? 'Bạn bị bắt rồi!' : s.fin !== null ? 'Bạn về đích!' : face ? 'Mèo nhìn: ĐỨNG IM!' : tell ? 'Mèo sắp tỉnh!' : 'Mèo ngủ: chạy đi!', b.W / 2 + 40, b.y + b.h / 2 - 8, 17, { w: 900, c: face || s.caught !== null ? '#a3332a' : tell ? '#b57a22' : '#2f6a4c', o: false });
    hlText(g, `Bạn chạy ${Math.round(s.pos)}/${r.cfg.D}`, b.W / 2 + 40, b.y + b.h / 2 + 14, 13, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const s = hlTuongOf(r, p.id), x0 = C.x + C.w * .08, w = C.w * .84, y = C.y + C.h * .17;
    hlBar(g, x0, y, w, 7, s.pos / r.cfg.D, s.caught !== null ? '#a3332a' : '#2f6a4c');
    g.fillStyle = HL_INK; g.fillRect(x0 + w - 2, y - 4, 2, 15);
    if (s.caught !== null) hlText(g, '✗', C.cx, C.y + C.h * .36, Math.min(24, C.w * .22), { w: 900, c: '#a3332a' }); else if (s.fin !== null) hlText(g, '✓', C.cx, C.y + C.h * .36, Math.min(24, C.w * .22), { w: 900, c: '#2f6a4c' });
    if (res && res.fin) hlText(g, `${(res.v / 1000).toFixed(2)} giây`, C.cx, C.y + C.h * .5, Math.max(10, Math.min(14, C.w * .11)), { w: 800, c: win ? '#a3332a' : HL_INK, o: false });
  },
  val: (r, row) => row.fin ? `${(row.v / 1000).toFixed(2)} giây` : `${Math.round(row.pos || 0)}/${r.cfg.D}`,
  win: (r, row) => row.fin ? `về đích sau ${(row.v / 1000).toFixed(2)} giây` : `chạy xa nhất: ${Math.round(row.pos)}/${r.cfg.D}`,
  mine: (r, row) => row.caught ? 'Bạn bị mèo bắt' : row.fin ? `Bạn hạng ${row.rank} · về đích sau ${(row.v / 1000).toFixed(2)} giây` : `Bạn hạng ${row.rank} · chạy ${Math.round(row.pos)}/${r.cfg.D}`,
};

const hlBalCm = ms => (5 + ms / 1000 * 4).toFixed(1) + ' cm';
HL_G.balloon = {
  name: 'Thổi bóng', rule: 'Giữ nút để thổi bóng, thả ra để chốt. Cả phòng chung một mốc nổ bí mật: ai chốt to nhất mà chưa nổ thì thắng.', ctl: 'hold',
  controls: (r, W, H, b) => hlHoldCtl(r, W, H, b, 'GIỮ ĐỂ THỔI'),
  info(g, r, now, b) {
    const bl = r.bal.get(HL.id), e = now - r.t0, held = bl && bl.d !== undefined ? (bl.pop !== undefined ? bl.pop - bl.d : (bl.u !== undefined ? bl.u : e) - bl.d) : 0;
    hlText(g, bl && bl.pop !== undefined ? 'BÙM! Bóng nổ rồi' : bl && bl.u !== undefined ? `Bạn chốt: ${hlBalCm(held)}` : bl && bl.d !== undefined ? `Đang thổi: ${hlBalCm(Math.max(0, held))}` : 'Giữ nút để bắt đầu thổi', b.W / 2, b.y + b.h / 2, 22, { w: 900, c: bl && bl.pop !== undefined ? '#a3332a' : HL_INK });
    hlText(g, 'Mốc nổ là bí mật nhưng chung cho cả phòng', b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const bl = r.bal.get(p.id), e = hlEnd(r); let held = 0, pop = false;
    if (bl && bl.d !== undefined) { pop = bl.pop !== undefined; held = pop ? bl.pop - bl.d : Math.max(0, (bl.u !== undefined ? bl.u : Math.min(e, r.cfg.len)) - bl.d); }
    if (bl && bl.d !== undefined) {
      const rad = Math.max(5, Math.min(C.h * .26, 5 + held / 5500 * C.h * .26)), by = Math.max(C.y + rad + 6, C.headTop - rad - 8);
      if (pop) { const st = new Path2D(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, rr = i % 2 ? rad * .6 : rad * 1.3; st.lineTo(C.cx + Math.cos(a) * rr, by + Math.sin(a) * rr); } st.closePath(); g.fillStyle = '#f2c640'; g.fill(st); g.strokeStyle = HL_INK; g.lineWidth = 1.4; g.stroke(st); hlText(g, 'bùm!', C.cx, by, 10, { w: 900, c: '#a3332a', o: false }); }
      else { g.strokeStyle = HL_INK; g.lineWidth = 1; g.beginPath(); g.moveTo(C.cx, by + rad); g.lineTo(C.cx + 2, C.headTop + 4); g.stroke(); g.beginPath(); g.ellipse(C.cx, by, rad * .88, rad, 0, 0, 6.283); g.fillStyle = HL_DRUM[(p.id.charCodeAt(1) || 0) % 4]; g.fill(); g.lineWidth = 1.8; g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(C.cx - rad * .3, by - rad * .3, rad * .2, rad * .3, -.5, 0, 6.283); g.fill(); }
    }
    if (res) { if (res.v !== null) hlResText(g, C, hlBalCm(res.v), win); else hlResText(g, C, res.pop ? 'nổ!' : 'không chốt', false, '#a3332a'); }
  },
  val: (r, row) => hlBalCm(row.v), win: (r, row) => `quả bóng to ${hlBalCm(row.v)}`,
  mine: (r, row) => row.v === null ? (row.pop ? 'Bóng của bạn nổ rồi!' : 'Bạn không chốt kịp') : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${hlBalCm(row.v)}`,
};

HL_G.minnum = {
  name: 'Số bé nhất không trùng', rule: 'Chọn một số. Ai chọn trùng số nhau đều bị gạch. Số nhỏ nhất không ai trùng sẽ thắng. Đổi ý được đến hết giờ.', ctl: 'pick',
  controls(r, W, H, btns) {
    const n = r.cfg.max, per = Math.min(8, n), rows = Math.ceil(n / per), gap = 6, bw = (W - 20 - gap * (per - 1)) / per, bh = 42;
    for (let v = 1; v <= n; v++) { const i = v - 1, row = (i / per) | 0, col = i % per, sel = HL.myPick === v; btns.push(hlBtn({ id: 'n' + v, key: v <= 9 ? String(v) : undefined, label: String(v), size: 20, x: 10 + col * (bw + gap), y: H - 12 - (rows - row) * (bh + gap) + gap, w: bw, h: bh, fill: sel ? '#f2c640' : '#e6dec9', ink: HL_INK, down: () => hlPick(v) })); }
    return { btns, h: rows * (bh + gap) + 14 };
  },
  info(g, r, now, b) {
    const left = Math.max(0, r.cfg.len - (now - r.t0));
    hlText(g, HL.myPick ? `Bạn chọn: ${HL.myPick}` : `Chọn một số từ 1 đến ${r.cfg.max}`, b.W / 2, b.y + b.h / 2, 24, { w: 900 });
    hlBar(g, b.x + 24, b.y + b.h - 22, b.w - 48, 8, left / r.cfg.len, '#a3332a'); hlText(g, `${Math.ceil(left / 1000)} giây`, b.W / 2, b.y + b.h - 8, 12, hlSub);
  },
  cell(g, r, p, C, res, win) {
    if (res) {
      const dup = res.dup, col = res.rank === 1 ? '#2f6a4c' : dup ? '#a3332a' : HL_INK;
      if (res.v !== null) { hlPlate(g, C.cx - C.w * .18, C.y + C.h * .12, C.w * .36, C.h * .2, '#f2ecde', col, 6); hlText(g, String(res.v), C.cx, C.y + C.h * .22, Math.min(22, C.w * .2), { w: 900, c: col, o: false }); if (dup) { g.strokeStyle = '#a3332a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(C.cx - C.w * .2, C.y + C.h * .1); g.lineTo(C.cx + C.w * .2, C.y + C.h * .34); g.stroke(); } }
      else hlResText(g, C, 'không chọn', false, '#777');
    } else if (r.picked.has(p.id)) hlTick(g, C);
  },
  val: (r, row) => row.v === null ? 'không chọn' : `số ${row.v}${row.dup ? ' (trùng)' : ''}`, win: (r, row) => `số ${row.v}, không ai trùng`,
  mine: (r, row) => row.v === null ? 'Bạn không chọn' : row.dup ? `Bạn chọn ${row.v}: bị trùng, bị gạch` : `Bạn chọn ${row.v}: không trùng · hạng ${row.rank}`,
};

function hlLantern(g, cx, cy, rr, go) {
  const col = go ? '#2f9a5c' : '#a3332a';
  if (go) { g.fillStyle = 'rgba(80,220,120,.3)'; g.beginPath(); g.arc(cx, cy, rr * 1.7, 0, 6.283); g.fill(); }
  g.strokeStyle = HL_INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy - rr * 1.3); g.lineTo(cx, cy - rr * .9); g.stroke();
  g.beginPath(); g.ellipse(cx, cy, rr * .9, rr, 0, 0, 6.283); g.fillStyle = col; g.fill(); g.lineWidth = 2.4; g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, cy, rr * .45, rr, 0, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(cx - rr * .9, cy); g.lineTo(cx + rr * .9, cy); g.stroke();
  g.fillStyle = '#f2c640'; g.fillRect(cx - rr * .3, cy + rr * .95, rr * .6, rr * .3); g.strokeRect(cx - rr * .3, cy + rr * .95, rr * .6, rr * .3);
}
HL_G.lantern = {
  name: 'Đèn lồng đổi màu', rule: 'Đèn lồng đỏ sẽ bất ngờ chuyển xanh. Thấy xanh là bấm ngay! Ai bấm nhanh nhất thắng, bấm sớm thì bị loại.', ctl: 'press',
  controls: (r, W, H, b) => { const mp = hlMyInp(r), done = !!mp; b.push(hlWide(W, H, { id: 'main', key: ' ', label: done ? (mp.fs ? 'Bấm sớm ✗' : 'Đã bấm ✓') : 'BẤM!', fill: done ? '#bdb7a6' : '#a3332a', ink: done ? HL_INK : '#f2ecde', off: done, down: e => hlPressAct(e.timeStamp) })); return { btns: b, h: 74 }; },
  info(g, r, now, b) {
    const mp = hlMyInp(r); hlLantern(g, b.W / 2, b.y + b.h / 2 - 4, Math.min(22, b.h * .28), r.go);
    hlText(g, mp ? (mp.fs ? 'Bấm sớm quá, bạn bị loại' : 'Bạn đã bấm, chờ mọi người') : r.go ? 'XANH RỒI, BẤM!' : 'Chờ đèn chuyển xanh…', b.W / 2, b.y + b.h - 10, 15, { w: 900, c: !mp && r.go ? '#2f6a4c' : mp && mp.fs ? '#a3332a' : HL_INK, o: false });
  },
  cell(g, r, p, C, res, win) { const x = r.inp.get(p.id); if (res) { if (res.v !== null) hlResText(g, C, `${res.v} ms`, win); else if (res.fs) hlResText(g, C, 'bấm sớm', false, '#a3332a'); else hlResText(g, C, 'không bấm', false, '#777'); } else if (x) hlTick(g, C, !x.fs); },
  val: (r, row) => `${row.v} ms`, win: (r, row) => `phản xạ ${row.v} mili giây`,
  mine: (r, row) => row.fs ? 'Bạn bấm sớm, bị loại' : row.v === null ? 'Bạn không bấm kịp' : `Bạn hạng ${row.rank}/${r.result.rows.length} · ${row.v} ms`,
};

const hlBoatN = (r, id) => id === HL.id ? Math.max(HL.myTaps, (r.prog && r.prog[id]) || 0) : ((r.prog && r.prog[id]) || 0);
HL_G.boat = {
  name: 'Đua thuyền', rule: 'Bấm thật nhanh, thật nhiều trong 10 giây để chèo thuyền. Ai nhiều lượt nhất thắng!', ctl: 'tap',
  controls(r, W, H, b) { b.push(hlWide(W, H, { id: 'main', key: ' ', label: 'BẤM LIÊN TỤC!', size: 20, fill: '#3f8a86', fillDown: '#2a6a66', down: () => hlTap() })); return { btns: b, h: 74 }; },
  pose: (r, p) => ({ run: r.state === 'run' && hlBoatN(r, p.id) > 0 && hlEnd(r) < r.cfg.len }),
  info(g, r, now, b) {
    const left = Math.max(0, r.cfg.len - (now - r.t0));
    hlText(g, `${hlBoatN(r, HL.id)} lượt`, b.W / 2, b.y + b.h / 2 - 2, 34, { w: 900 });
    hlBar(g, b.x + 24, b.y + b.h - 22, b.w - 48, 8, left / r.cfg.len, '#3f8a86'); hlText(g, `${(left / 1000).toFixed(1)} giây`, b.W / 2, b.y + b.h - 8, 12, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const n = res ? res.v : hlBoatN(r, p.id), x0 = C.x + C.w * .08, w = C.w * .84, y = C.y + C.h * .17;
    hlBar(g, x0, y, w, 8, n / 100, '#3f8a86'); hlText(g, String(n), C.cx, C.y + C.h * .33, Math.max(10, Math.min(16, C.w * .13)), { w: 800, c: win ? '#a3332a' : HL_INK, o: false });
  },
  val: (r, row) => `${row.v} lượt`, win: (r, row) => `${row.v} lượt chèo`, mine: (r, row) => `Bạn hạng ${row.rank}/${r.result.rows.length} · ${row.v} lượt`,
};

HL_G.hang = {
  name: 'Chọn hang', rule: 'Mỗi vòng chọn 1 trong 3 hang để trốn. Mèo vồ một hang, hay vồ hang đông nhất! Ai ở hang bị vồ thì bị loại. 5 vòng, những người sống sót chia nhau hũ.', ctl: 'holes',
  controls(r, W, H, btns) {
    const alive = hlAlive(r, HL.id), gap = 8, bw = (W - 20 - gap * 2) / 3;
    for (let v = 0; v < 3; v++) { const sel = HL.myHole && HL.myHole.i === r.sub && HL.myHole.v === v; btns.push(hlBtn({ id: 'h' + v, key: String(v + 1), label: `Hang ${v + 1}`, size: 18, x: 10 + v * (bw + gap), y: H - 66, w: bw, h: 52, fill: sel ? '#f2c640' : '#c9a062', ink: HL_INK, off: !r.picking || !alive, down: () => hlHole(v) })); }
    return { btns, h: 74, note: !alive ? 'Bạn đã bị loại, xem tiếp nhé' : '' };
  },
  pose: (r, p) => ({ dim: !hlAlive(r, p.id) }),
  info(g, r, now, b) {
    const hs = r.holes, last = hs[hs.length - 1], reveal = !r.picking && last && last.i === r.sub - (r.picking ? 0 : 0) || (!r.picking && last), cat = reveal && last ? last.cat : -1, cnt = [0, 0, 0];
    if (reveal && last) for (const id in last.picks) if (last.picks[id] >= 0) cnt[last.picks[id]]++;
    for (let v = 0; v < 3; v++) {
      const x = b.W / 2 + (v - 1) * 90, y = b.y + b.h / 2 - 2;
      g.beginPath(); g.ellipse(x, y, 32, 18, 0, 0, 6.283); g.fillStyle = '#5b2f1f'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.stroke(); g.beginPath(); g.ellipse(x, y + 2, 22, 11, 0, 0, 6.283); g.fillStyle = HL_INK; g.fill();
      hlText(g, String(v + 1), x, y - 24, 13, { w: 900, o: false });
      if (reveal && last) { hlText(g, `${cnt[v]} chuột`, x, y + 28, 11, hlSub); if (v === cat) { g.fillStyle = '#f2c640'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x - 12 + i * 8, y - 4 - (i % 2) * 5, 4, 0, 6.283); g.fill(); g.stroke(); } hlText(g, 'MÈO VỒ!', x, y - 38, 12, { w: 900, c: '#a3332a', o: false }); } }
    }
    const alive = r.seated.size + r.bots.length - hs.reduce((a, h) => a + h.out.length, 0);
    hlText(g, `Vòng ${Math.min(r.cfg.rounds, r.sub + 1)}/${r.cfg.rounds} · còn ${alive} chuột · ${r.picking ? `chọn hang (${Math.ceil((r.cfg.pick - r.subE) / 1000)}s)` : 'mèo đang vồ…'}`, b.W / 2, b.y + b.h - 6, 12, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const alive = hlAlive(r, p.id), picked = r.hp.get(r.sub) && r.hp.get(r.sub).has(p.id), lastH = r.holes[r.holes.length - 1];
    if (r.state === 'run') { if (!alive) hlText(g, '✗', C.cx, C.y + C.h * .3, Math.min(30, C.w * .28), { w: 900, c: '#a3332a' }); else if (r.picking && picked) hlTick(g, C); else if (lastH && !r.picking && lastH.picks[p.id] >= 0) hlText(g, `hang ${lastH.picks[p.id] + 1}`, C.cx, C.y + C.h * .3, Math.max(10, Math.min(15, C.w * .12)), { w: 800, o: false }); }
    if (res) hlResText(g, C, res.alive ? 'sống sót' : `sống ${res.v} vòng`, win, res.alive ? '#2f6a4c' : '#777');
  },
  val: (r, row) => row.alive ? 'sống sót' : `sống ${row.v} vòng`, win: (r, row) => `sống sót qua ${r.cfg.rounds} vòng`,
  mine: (r, row) => row.alive ? 'Bạn sống sót, chia hũ cùng những người sống sót!' : `Bạn bị loại sau ${row.v} vòng`,
};

let HL_NHO_LIT = -1;
HL_G.nho = {
  name: 'Nhớ trống', rule: 'Các trống sáng lên lần lượt, hãy nhớ thứ tự. Khi trống tắt, bấm lại đúng thứ tự. Ai đúng nhiều nhất thắng, đúng bằng nhau thì chia hũ; bấm sai là dừng.', ctl: 'drums',
  controls(r, W, H, btns) {
    const gap = 8, bw = (W - 20 - gap * 3) / 4, showing = hlEnd(r) < r.cfg.showEnd - 100;
    for (let v = 0; v < 4; v++) btns.push(hlBtn({ id: 'd' + v, key: String(v + 1), label: String(v + 1), size: 22, x: 10 + v * (bw + gap), y: H - 66, w: bw, h: 52, fill: HL.drumFlash && HL.drumFlash.v === v && HL.t - HL.drumFlash.t < .2 ? '#fff' : HL_DRUM[v], ink: '#f2ecde', off: showing, down: () => hlDrum(v) }));
    return { btns, h: 74 };
  },
  info(g, r, now, b) {
    const e = now - r.t0, st = r.cfg.step, lit = e >= 0 && e < r.cfg.seq.length * st ? (e % st < st * .68 ? Math.floor(e / st) : -1) : -1, which = lit >= 0 ? r.cfg.seq[lit] : -1;
    if (lit !== HL_NHO_LIT) { HL_NHO_LIT = lit; if (which >= 0) AU.pluck(76 + which * 5); }
    for (let v = 0; v < 4; v++) { const x = b.W / 2 + (v - 1.5) * 56, y = b.y + b.h / 2 - 6, on = which === v; g.beginPath(); g.ellipse(x, y, on ? 25 : 21, on ? 18 : 15, 0, 0, 6.283); g.fillStyle = on ? '#fff3c0' : HL_DRUM[v]; g.fill(); g.lineWidth = 2.4; g.strokeStyle = HL_INK; g.stroke(); }
    const p = r.nho.get(HL.id), c = p ? p.c : 0, showing = e < r.cfg.showEnd - 100;
    hlText(g, showing ? `Nhớ thứ tự… (${r.cfg.seq.length} trống)` : p && p.bad ? `Bạn sai ở trống thứ ${c + 1}` : `Bấm lại! Bạn đúng ${c}/${r.cfg.seq.length}`, b.W / 2, b.y + b.h - 10, 13, hlSub);
  },
  cell(g, r, p, C, res, win) {
    const n = r.cfg.seq.length, st = r.nho.get(p.id), c = st ? st.c : 0, rad = Math.max(1.8, Math.min(5, (C.w - 14) / (n * 2.6))), x0 = C.cx - (n - 1) * rad * 1.3;
    for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x0 + i * rad * 2.6, C.y + C.h * .2, rad, 0, 6.283); g.fillStyle = i < c ? '#2f6a4c' : (st && st.bad && i === c ? '#a3332a' : 'rgba(29,25,21,.12)'); g.fill(); g.lineWidth = 1; g.strokeStyle = HL_INK; g.stroke(); }
    if (res) hlResText(g, C, `đúng ${res.v}/${n}`, win);
  },
  val: (r, row) => `đúng ${row.v}/${r.cfg.seq.length}`, win: (r, row) => `đúng ${row.v}/${r.cfg.seq.length} trống`,
  mine: (r, row) => `Bạn đúng ${row.v}/${r.cfg.seq.length} · hạng ${row.rank}/${r.result.rows.length}`,
};
