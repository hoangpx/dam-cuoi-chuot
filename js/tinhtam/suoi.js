/* Góc Tĩnh Tâm · the stream and its flower lanterns (owner 2026-10-29: "một dòng suối xung quanh phật chảy từ phải sang trái, từ xa vào
   gần, trên dòng suối có những bông hoa đăng, mỗi bông là một lời chúc tâm niệm của người chơi, lấy từ hoa đăng của chương 4 — những lời
   thật; có biển thả hoa đăng; lần đầu miễn phí, bông thứ hai 5 quan; đọc được của người khác").
   The stream comes down from the far right behind the bamboo, passes in front of the Buddha's platform and runs out at the near left.
   The wishes are the shared ones of Chương IV · Phố Huyện (Supabase table dcc_hoadang, rpc dcc_hoa_list / dcc_hoa_add / dcc_hoa_report,
   docs/supabase-hoa-dang.sql on that branch): only real players' wishes, never made-up ones. Each lantern on the water carries one; a tap
   reads it (and can report it, three reports hide it). The sign by the stream sets one afloat: the first is free, each one after costs
   5 quan from Chương IV's purse (SAVE4.money). */
const TT_RPC = 'https://mamafzllyhbmzyystivo.supabase.co/rest/v1/rpc/', TT_RPC_KEY = 'sb_publishable_aY82m4E4mmc0AN2_n0Gcdw_2Kl31gCd';   // the same public key as js/core/cloud.js
const TT_HOA_PRICE = 3000, TT_HOA_FLOAT = 28, TT_HOA_SPEED = .17;     // 5 quan (600 đồng a quan); how many lanterns at once; units a second
const TT_SIGN = { x: 7.4, z: 10.2 };
// the flower lantern drawn exactly as Phố Huyện draws it (js/ch4b/art.js p4HoaSprite, P4_HOA_COLS): a leaf raft, five petals, a flame
const TT_HOA_COLS = [['#e86a8a', '#f7b9c8'], ['#e2b43c', '#f6dc8a'], ['#c4473a', '#f09a7a'], ['#f2ece0', '#ffffff']];
function ttHoaSprite(c1, c2) {
  const S = ttHoaSprite.S || (ttHoaSprite.S = {}), key = c1 + c2; if (S[key]) return S[key];
  const c = document.createElement('canvas'); c.width = 320; c.height = 240; const g = c.getContext('2d');
  g.scale(8, 8); g.translate(20, 22); g.strokeStyle = 'rgba(29,25,21,.55)'; g.lineWidth = .35; g.lineJoin = 'round';   // a fine, soft line (owner)
  const halo = g.createRadialGradient(0, -8, 1, 0, -8, 16); halo.addColorStop(0, 'rgba(255,214,130,.55)'); halo.addColorStop(1, 'rgba(255,214,130,0)'); g.fillStyle = halo; g.fillRect(-20, -24, 40, 30);
  g.fillStyle = 'rgba(255,200,110,.3)'; g.beginPath(); g.ellipse(0, 3, 16, 3.5, 0, 0, 6.283); g.fill();
  const leaf = g.createLinearGradient(0, -2, 0, 4); leaf.addColorStop(0, '#7f9a5c'); leaf.addColorStop(1, '#4e6a3e'); g.fillStyle = leaf; g.beginPath(); g.ellipse(0, 1, 14, 3.4, 0, 0, 6.283); g.fill(); g.stroke();
  for (const [an, len, col] of [[-1.15, 13, c1], [1.15, 13, c1], [-.55, 15, c2], [.55, 15, c2], [0, 16, c2]]) {
    g.save(); g.rotate(an);
    const pg = g.createLinearGradient(0, 0, 0, -len); pg.addColorStop(0, col); pg.addColorStop(.55, col); pg.addColorStop(1, '#fff6ee');
    g.fillStyle = pg; g.beginPath(); g.moveTo(-4.6, 0); g.bezierCurveTo(-6.2, -len * .45, -3, -len * .85, 0, -len); g.bezierCurveTo(3, -len * .85, 6.2, -len * .45, 4.6, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(.4, -len * .5, 0, -len * .85); g.stroke(); g.strokeStyle = 'rgba(29,25,21,.55)';
    g.restore();
  }
  const fl = g.createRadialGradient(0, -10, .2, 0, -10, 4); fl.addColorStop(0, '#fffbe6'); fl.addColorStop(.5, '#ffe08a'); fl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = fl; g.beginPath(); g.ellipse(0, -10, 3, 4.6, 0, 0, 6.283); g.fill();
  return S[key] = c;
}
// the stream's middle line, far right → near left (world x, z), and its half width
const TT_STREAM_PTS = [[18, 34], [14.5, 26], [11.8, 20], [10.4, 15.8], [8.6, 13.2], [4, 12.65], [0, 12.55], [-4, 12.65], [-8.6, 12.95], [-10.8, 11.2], [-12.1, 8.6], [-13.1, 5.8], [-14.1, 3]];
const TT_STREAM = (() => {
  const P = TT_STREAM_PTS, out = [];
  for (let i = 0; i < P.length - 1; i++) {                                  // Catmull-Rom through the points, a sample every quarter unit or so
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / .25);
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t, f = j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); out.push([f(0), f(1)]); }
  }
  out.push(P[P.length - 1]);
  let len = 0; const S = out.map((p, i) => { if (i) len += Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1]); return { x: p[0], z: p[1], d: len }; });
  for (let i = 0; i < S.length; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], l = Math.hypot(b.x - a.x, b.z - a.z) || 1; S[i].tx = (b.x - a.x) / l; S[i].tz = (b.z - a.z) / l; S[i].w = 1.45 + .55 * (i / S.length); }
  return { S, len };
})();
function ttStreamAt(u) {                                                   // the point u (0 far … 1 near) along the stream, with its direction and half width
  const S = TT_STREAM.S, d = Math.max(0, Math.min(1, u)) * TT_STREAM.len;
  let i = 1; while (i < S.length - 1 && S[i].d < d) i++;
  const a = S[i - 1], b = S[i], k = (d - a.d) / ((b.d - a.d) || 1);
  const tx = a.tx + (b.tx - a.tx) * k, tz = a.tz + (b.tz - a.tz) * k, n = Math.hypot(tx, tz) || 1;   // heading and width interpolated (owner: lanterns jittered near the end)
  return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, tx: tx / n, tz: tz / n, w: a.w + (b.w - a.w) * k };
}
const ttStreamNear = (x, z) => { let best = 0, bd = 1e9; for (const s of TT_STREAM.S) { const d = Math.hypot(s.x - x, s.z - z); if (d < bd) { bd = d; best = s.d; } } return best / TT_STREAM.len; };

/* ---------- drawing the water (on the ground, before anything stands on it) ---------- */
function ttStream(g, L) {
  const S = TT_STREAM.S, t = TT.t, ok = s => s.z - TT.camD > 1.3, side = sd => S.filter(ok).map(s => L.P(s.x - s.tz * s.w * sd, 0, s.z + s.tx * s.w * sd));
  const left = side(1), right = side(-1); if (left.length < 2) return;
  g.beginPath(); left.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]); g.closePath();
  const gr = g.createLinearGradient(0, L.hor, 0, L.H); gr.addColorStop(0, '#a9c9cf'); gr.addColorStop(.35, '#6f9fb0'); gr.addColorStop(1, '#4f8299'); g.fillStyle = gr; g.fill();
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const edge of [left, right]) {                                     // wet dark banks, a pale lip of mud
    g.strokeStyle = 'rgba(52,70,48,.75)'; g.lineWidth = 3; g.beginPath(); edge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.strokeStyle = 'rgba(214,196,150,.55)'; g.lineWidth = 1.4; g.beginPath(); edge.forEach(([x, y], i) => i ? g.lineTo(x, y + 2.5) : g.moveTo(x, y + 2.5)); g.stroke();
  }
  // ripples running downstream: short pale strokes along the water, moving with it
  g.strokeStyle = 'rgba(240,248,250,.45)';
  for (let j = 0; j < 90; j++) {
    const h = Math.sin(j * 12.9898) * 43758.5453, r = h - Math.floor(h), u = (j / 90 + t * .012 + r * .01) % 1, p = ttStreamAt(u), lat = (r - .5) * 1.3 * p.w;
    const x = p.x - p.tz * lat, z = p.z + p.tx * lat; if (z - TT.camD < 1.3) continue;
    const [x1, y1, s1] = L.P(x, 0, z), [x2, y2] = L.P(x + p.tx * .35, 0, z + p.tz * .35); g.lineWidth = Math.max(1, s1 * .02); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  // the sun on the water near the Buddha
  const [sx, sy, ss] = L.P(0, 0, 14); const sg = g.createRadialGradient(sx, sy, 2, sx, sy, ss * 2.6); sg.addColorStop(0, 'rgba(255,240,190,.35)'); sg.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = sg; g.fillRect(sx - ss * 2.6, sy - ss * .8, ss * 5.2, ss * 1.6);
}

/* ---------- the wishes (Supabase) ---------- */
async function ttRpc(fn, body) {
  const r = await fetch(TT_RPC + fn, { method: 'POST', headers: { apikey: TT_RPC_KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { let m = ''; try { m = (await r.json()).message || ''; } catch (e) {} throw new Error(m || 'rpc ' + r.status); }
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
const ttHoaBad = s => { const t = (s || '').toLowerCase(); return /(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)/.test(t + ' ') || /(^|[^\p{L}])(đm|dm|đcm|dcm|đmm|dmm|vcl|vkl|vl|clm|cmm|cc|cl)($|[^\p{L}])/u.test(t); };   // the server's dcc_hoa_bad, kept alike
const ttReported = () => { try { return new Set(JSON.parse(localStorage.getItem('dcc.hoaRep') || '[]')); } catch (e) { return new Set(); } };   // shared with Phố Huyện
function ttHoaLoad() {
  TT.hoaLoadT = TT.t;
  const take = list => { if (!Array.isArray(list)) return; const rep = ttReported(); TT.hoa = list.filter(w => w && w.wish && !rep.has(w.id)).map(w => ({ id: w.id, wish: w.wish, shop: w.shop || '', t: w.created_at })); };
  // where the server cannot be reached (the claude.ai preview blocks it) a snapshot of the same real wishes, published beside the page, if any
  ttRpc('dcc_hoa_list', { p_limit: 120 }).then(take).catch(() => fetch('js/tinhtam/hoa-snapshot.json').then(r => r.json()).then(l => { if (!(TT.hoa || []).length) take(l); }).catch(() => {}));
}
function ttHoaUpdate(dt) {
  if (TT.t - (TT.hoaLoadT ?? -999) > 120) ttHoaLoad();
  TT.hoaMine = (TT.hoaMine || []).filter(h => (h.u += TT_HOA_SPEED * dt / TT_STREAM.len) < 1.02);
}

/* ---------- the lanterns on the water ---------- */
function ttHoaItems(items, g, L) {
  const list = TT.hoa || [], A = ttArt(), t = TT.t; TT.hoaHit = [];
  const K = Math.min(TT_HOA_FLOAT, list.length), go = t * TT_HOA_SPEED / TT_STREAM.len;
  const one = (u, w, ph) => {
    const p = ttStreamAt(u), lat = (Math.sin(ph * 3.1) * .45 + Math.sin(t * .23 + ph * 2) * .25) * p.w, x = p.x - p.tz * lat, z = p.z + p.tx * lat;   // drifting slowly from side to side
    if (z - TT.camD < 1.4) return;
    items.push({ z, live: true, d: () => {                              // live: never painted into the far layer (it moves, and it is tapped)
      const fade = Math.min(1, u / .04, (1 - u) / .06); if (fade <= 0) return;
      const [sx, sy, s] = L.P(x, .04 + Math.sin(t * .9 + ph) * .015, z), sc = s * .95 / 70, wpx = s * 1.15, img = ttHoaSprite(...TT_HOA_COLS[Math.abs(w.id || Math.round(ph * 7)) % TT_HOA_COLS.length]);
      g.save(); g.globalAlpha = fade;
      const gl = g.createRadialGradient(sx, sy - 22 * sc, 1, sx, sy - 22 * sc, 70 * sc); gl.addColorStop(0, 'rgba(255,214,120,.55)'); gl.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gl; g.fillRect(sx - 70 * sc, sy - 92 * sc, 140 * sc, 140 * sc);
      g.fillStyle = 'rgba(255,220,140,.25)'; g.beginPath(); g.ellipse(sx, sy + 4 * sc, 30 * sc, 7 * sc, 0, 0, 6.283); g.fill();   // its light on the water
      g.translate(sx, sy); g.rotate(Math.sin(t * .35 + ph) * .04); g.drawImage(img, -wpx / 2, -wpx * .55, wpx, wpx * .75); g.restore();   // rocking slowly   // drawn as it is (owner: squeezing it to fake a turn looked bent), only rocking a little
      TT.hoaHit.push({ x: sx, y: sy - 18 * sc, r: Math.max(18, 34 * sc), w });
    } });
  };
  for (let i = 0; i < K; i++) { const v = go + i / K, lap = Math.floor(v), u = v - lap, idx = (i + lap * K) % list.length; one(u, list[idx], i * 1.37 + .3); }
  for (const h of TT.hoaMine || []) one(h.u, h.w, h.ph);
}

/* ---------- reading one, setting one afloat (DOM sheets, so phones get their keyboard) ---------- */
const ttEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function ttSheet(html) {
  ttHoaClose(); const box = document.createElement('div'); box.id = 'ttSheet';
  box.style.cssText = 'position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(20,30,24,.45);padding:16px';
  box.innerHTML = `<div style="width:min(420px,100%);max-height:90vh;overflow:auto;display:flex;flex-direction:column;gap:10px;background:#f6ecd2;border:3px double #a3332a;border-radius:14px;padding:18px;font:500 14px 'Be Vietnam Pro',sans-serif;color:#1d1915;box-shadow:0 6px 0 rgba(0,0,0,.2)">${html}</div>`;
  box.addEventListener('pointerdown', e => { if (e.target === box) ttHoaClose(); });
  for (const ev of ['keydown', 'keyup']) box.addEventListener(ev, e => e.stopPropagation());
  document.body.appendChild(box); return box;
}
function ttHoaClose() { const b = document.getElementById('ttSheet'); if (b) { b.remove(); cv.focus(); } }
const TT_BTN = "border:2.4px solid #1d1915;border-radius:10px;font:800 15px 'Be Vietnam Pro',sans-serif;padding:8px 14px;color:#1d1915";   // the ink colour set, or a dark-mode browser prints the label white
function ttHoaRead(w) {
  let when = ''; if (w.t) { const days = Math.floor((Date.now() - new Date(w.t)) / 864e5); when = days <= 0 ? lg('thả hôm nay', 'set afloat today') : days === 1 ? lg('thả hôm qua', 'set afloat yesterday') : lgf('thả {n} ngày trước', 'set afloat {n} days ago', { n: days }); }
  const box = ttSheet(`<div style="text-align:center;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a3332a;font-weight:800">${lg('Lời chúc trên đèn hoa đăng', 'A wish on a flower lantern')}</div>
    <p style="margin:6px 0;font:600 20px 'Playfair Display',serif;text-align:center;line-height:1.4;overflow-wrap:anywhere">${ttEsc(w.wish)}</p>
    <p style="margin:0;text-align:center;font-weight:800;color:#7a2a20">${ttEsc(w.shop || lg('một người trong làng', 'someone in the village'))}</p>
    <p style="margin:0;text-align:center;font-size:12px;opacity:.7">${when}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">${w.id ? `<a href="#" id="ttRep" style="font-size:12px;color:#7a2a20">${lg('Báo lời không đẹp', 'Report')}</a>` : '<span></span>'}<button id="ttX" style="${TT_BTN};background:#f7e3a4">${lg('Đóng', 'Close')}</button></div>`);
  box.querySelector('#ttX').addEventListener('click', ttHoaClose);
  const rep = box.querySelector('#ttRep'); if (rep) rep.addEventListener('click', e => {
    e.preventDefault(); const R = ttReported(); R.add(w.id); try { localStorage.setItem('dcc.hoaRep', JSON.stringify([...R].slice(-300))); } catch (er) {}
    ttRpc('dcc_hoa_report', { p_id: w.id }).catch(() => {}); TT.hoa = (TT.hoa || []).filter(x => x.id !== w.id); ttHoaClose(); toast(lg('Đã báo. Cảm ơn bạn.', 'Reported. Thank you.'), 2);
  });
}
// setting a lantern afloat, the way Phố Huyện of chương IV does it (owner: "chỗ ghi lời ước cũng làm giống bên chương 4"): its sheet (.c4sheet / .card4,
// "Mua một đèn" then "Viết điều ước lên đèn:"), then two hands hold the lantern (p4HandsSvg; they follow the mouse on a computer, wait low
// on a phone) until a tap on the stream sets it down there. The first one is free, then 5 quan from chương IV's purse, paid when it floats.
function ttHoaOpen() {
  if (TT.hold) { toast(lg('Chạm vào dòng suối để thả đèn.', 'Tap the stream to set it afloat.'), 2.4); return; }
  const n = TT_SAVE.hoaN || 0, free = !n, money = typeof SAVE4 !== 'undefined' ? SAVE4.money : 0, fmt = v => typeof c4Money === 'function' ? c4Money(v) : v + ' đồng', ok = free || money >= TT_HOA_PRICE;
  ttHoaClose(); const d = document.createElement('div'); d.id = 'ttSheet'; d.className = 'c4sheet'; d.style.zIndex = 40;
  d.innerHTML = '<div class="card4"><h3>' + lg('Thả đèn hoa đăng', 'Set a lantern afloat') + '</h3><div id="ttHoaB"></div></div>';
  d.addEventListener('pointerdown', e => { if (e.target === d) ttHoaClose(); });
  for (const ev of ['keydown', 'keyup']) d.addEventListener(ev, e => e.stopPropagation());
  document.body.appendChild(d);
  const B = d.querySelector('#ttHoaB');
  B.innerHTML = '<p>' + (free ? lg('Chiếc đèn hoa sen giấy đầu tiên được tặng.', 'Your first paper lotus lantern is a gift.') : lgf('Một chiếc đèn hoa sen giấy giá {p}.', 'A paper lotus lantern costs {p}.', { p: '<b>' + fmt(TT_HOA_PRICE) + '</b>' }))
    + ' ' + lg('Viết điều ước lên đèn rồi thả xuống suối trước tượng Phật, ai ở đây cũng đọc được.', 'Write a wish on it and set it on the stream before the Buddha; everyone here can read it.') + '</p>'
    + (free ? '' : '<p>' + lg('Trong túi: ', 'In your purse: ') + fmt(Math.round(money)) + '</p>') + (ok ? '' : '<p class="bad">' + lg('Chưa đủ tiền mua đèn.', 'Not enough money for a lantern.') + '</p>')
    + '<div class="row">' + (ok ? '<button class="btn" id="ttHoaBuy">' + (free ? lg('Nhận một đèn', 'Take a lantern') : lg('Mua một đèn', 'Buy a lantern')) + '</button>' : '') + '<button class="btn alt" id="ttX">' + lg('Thôi', 'Cancel') + '</button></div>';
  B.querySelector('#ttX').onclick = ttHoaClose;
  if (ok) B.querySelector('#ttHoaBuy').onclick = () => {
    if (AU.tap) AU.tap();
    B.innerHTML = '<p>' + lg('Viết điều ước lên đèn:', 'Write your wish on the lantern:') + '</p><textarea id="ttHoaW" maxlength="90" rows="3" placeholder="' + lg('Cầu cho…', 'May…') + '" style="width:100%;box-sizing:border-box;font:16px var(--body);padding:8px 10px;border:2.5px solid var(--ink);background:#fff8e6;resize:none"></textarea><div class="row"><button class="btn" id="ttHoaOk">' + lg('Viết xong', 'Done') + '</button></div>';
    const ta = B.querySelector('#ttHoaW'); setTimeout(() => ta.focus(), 50);
    B.querySelector('#ttHoaOk').onclick = () => {
      const w = ta.value.trim().replace(/\s+/g, ' ') || lg('Cầu bình an.', 'Peace to all.');
      if (ttHoaBad(w)) { toast(lg('Lời chúc có chữ không đẹp, viết lại nhé.', 'Please write it without rude words.'), 2.6); return; }
      ttHoaClose(); ttHoaHold({ wish: w, c: (TT_SAVE.hoaN || 0) % TT_HOA_COLS.length });
    };
  };
}
// two hands cupping the lantern (chương IV's picture); null puts them away
function ttHoaHold(h) {
  TT.hold = h; let el = document.getElementById('ttHands');
  if (!el) {
    if (!h) return;
    el = document.createElement('div'); el.id = 'ttHands'; document.body.appendChild(el);
    addEventListener('pointermove', e => { if (TT.hold && e.pointerType === 'mouse') { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; } }, true);
  }
  if (!h) { el.hidden = true; cv.style.cursor = ''; return; }
  const touch = !matchMedia('(pointer: fine)').matches, [c1, c2] = TT_HOA_COLS[h.c];
  el.style.cssText = 'position:fixed;z-index:5;pointer-events:none;aspect-ratio:1;filter:drop-shadow(0 0 10px rgba(255,200,110,.6));' + (touch ? 'left:50%;bottom:16%;width:118px;transform:translateX(-50%);animation:p4bob 2.4s ease-in-out infinite' : 'width:clamp(130px,11vw,200px);transform:translate(-50%,-70%);left:50%;top:75%');
  el.innerHTML = typeof p4HandsSvg === 'function' ? p4HandsSvg(c1, c2) : '';
  el.hidden = false; if (!touch) cv.style.cursor = 'none';
}
// a tap while holding: on the stream the lantern floats from there; anywhere else nothing happens
function ttHoaDrop(L, x, y) {
  const h = TT.hold, at = ttInv(L, x, y); if (!h || !at) return false;
  const u = ttStreamNear(at[0], at[1]), p = ttStreamAt(u); if (Math.hypot(p.x - at[0], p.z - at[1]) > p.w * .7 + .35) return false;
  ttHoaHold(null);
  const n = TT_SAVE.hoaN || 0, free = !n;
  if (!free && (typeof SAVE4 === 'undefined' || SAVE4.money < TT_HOA_PRICE)) { toast(lg('Không đủ 5 quan. Sang chương Vợ Chồng Khởi Nghiệp buôn bán kiếm thêm tiền nhé.', 'Not enough money (5 quan). Earn more in Chapter IV.'), 3.6); return true; }
  ttRpc('dcc_hoa_add', { p_wish: h.wish, p_shop: (TT.me.name || '').slice(0, 16), p_device: TT_SAVE.id }).then(id => {
    if (!free) { SAVE4.money -= TT_HOA_PRICE; persist4(); }
    TT_SAVE.hoaN = n + 1; ttPersist();
    const w = { id, wish: h.wish, shop: (TT.me.name || '').slice(0, 16), t: new Date().toISOString() };
    TT.hoa = [w, ...(TT.hoa || []).filter(q => q.id !== id)];
    (TT.hoaMine = TT.hoaMine || []).push({ u, w, ph: Math.random() * 6 });
    AU.zenBell(.6); toast(lg('Đèn hoa đăng của bạn đã trôi trên suối.', 'Your lantern is drifting on the stream.'), 3);
  }).catch(e => {
    ttHoaHold(h);                                                           // still in hand: try again
    toast(/too soon/.test(e.message) ? lg('Chờ một chút rồi thả tiếp nhé.', 'Wait a moment, then try again.') : /bad words/.test(e.message) ? lg('Lời chúc có chữ không đẹp, bạn viết lại nhé.', 'Please write it without rude words.') : lg('Chưa thả được, thử lại sau nhé.', 'Could not set it afloat, try again later.'), 3);
  });
  return true;
}
