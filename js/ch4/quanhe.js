/* Chương IV · the book's "Quan hệ" (owner): the village as a web of bubbles on elastic strings. Each person is a bubble
   with their portrait, bigger the more they matter (c4Imp); each tie a string coloured by its kind. Drag a bubble, drag
   the paper to look around, pinch or wheel to zoom. Tap someone: their bubble swells to the middle, their strings go
   bold and pull the people they know close, everyone else fades; the card under the web tells who they are, their
   habits (the hour they come to market, the ware they like — both real in the game), their temper, what they matter
   for, what is known about them, and what to do (invite, offer tea, ask about the family, ask for an introduction).
   People not met yet hang on as grey "?" bubbles beside whoever is tied to them. "Gia phả": tap a household for its
   family tree. Per person, SAVE4.folk[id] adds: heard (named by someone), tea (day offered tea), ask (day asked about
   the family), intro (day asked to introduce someone), facts [] (what they told). */
const C4_STAR = a => '★'.repeat(Math.max(1, Math.round(a / 20))) + '☆'.repeat(5 - Math.max(1, Math.round(a / 20)));
const C4_FAV_WORD = { trau: 'trầu cau', che: 'bát chè xanh', xoi: 'gói xôi', xen: 'hàng xén', bun: 'bát bún riêu' };
// how much someone matters to the stall: how many they know, how readily they talk, standing in the family
function c4Imp(p) {
  const T = C4_TRAITS[p.trait];
  return p.links.length + T.refer * 2 + (T.gossip ? 2 : 0) + (p.role === 'old' ? 1 : 0) + (p.as === 'chủ nhà' ? 1 : 0);
}
function c4Badges(p) {
  const T = C4_TRAITS[p.trait], b = [];
  if (c4Ruot(p.id)) b.push(['♥ Mối ruột', '#c0567a']);
  for (const [g, id] of Object.entries(c4People().landlord || {})) if (id === p.id) b.push([g === 'trau' ? 'Chủ nhà mặt chợ (trầu)' : 'Chủ đất hàng ' + C4_GOODS[g].name.toLowerCase(), '#8a5a2a']);
  if (T.meet) b.push(['Khó gần', '#5a4a32']);
  if (p.links.length >= 6) b.push(['Quen nhiều người', '#2f6a4c']);
  if (T.refer >= 1.5) b.push(['Hay giới thiệu khách', '#2f6a4c']);
  if (T.gossip) b.push(['Khen chê lan khắp làng', '#c98a1c']);
  if (p.role === 'old' && p.as === 'chủ nhà') b.push(['Bề trên trong họ', '#2f5f8f']);
  if (T.half > 1) b.push(['Mê giảm giá', '#8a5a2a']);
  if (T.free > 1) b.push(['Thích được biếu', '#8a5a2a']);
  if (T.loss > 1.5) b.push(['Hết hàng là giận', '#a3332a']);
  if (p.links.some(l => l.rel === 'ghet')) b.push(['Có người không ưa', '#a3332a']);
  return b;
}
const c4Heard = id => c4Known(id) || !!(SAVE4.folk[id] && (SAVE4.folk[id].seen || SAVE4.folk[id].heard));
const c4Shown = id => c4Known(id) ? id : null;
// who is on the web: everyone met or seen, and those tied to them as "?" (named once someone told of them)
function c4WebNodes() {
  const P = c4People(), on = new Map();
  for (const p of P.list) { const f = SAVE4.folk[p.id]; if (f && (f.k || f.seen)) on.set(p.id, f.k ? 'k' : 'seen'); }
  for (const id of [...on.keys()]) if (on.get(id) === 'k') for (const l of P.list[id].links) if (!on.has(l.to)) on.set(l.to, c4Heard(l.to) ? 'heard' : 'q');
  return on;
}

/* ---------- the web ---------- */
const QH = { pos: new Map(), cam: { x: 0, y: 0, s: 1 }, focus: null, raf: 0, img: new Map(), drag: null, ptrs: new Map(), seed: -1 };
function c4FaceImg(p) {
  const url = c4Face(p); let im = QH.img.get(url);
  if (!im) { im = new Image(); im.src = url; QH.img.set(url, im); }
  return im;
}
function qhRadius(p, st) { return st === 'k' ? Math.min(34, 15 + c4Imp(p) * 1.5) : st === 'seen' ? 14 : 11; }
function qhBuild() {
  const P = c4People(), on = c4WebNodes();
  if (QH.seed !== SAVE4.seed) { QH.pos.clear(); QH.seed = SAVE4.seed; QH.focus = null; }
  const nodes = [], byId = new Map();
  const n = on.size; let i = 0;
  for (const [id, st] of on) {
    const p = P.list[id];
    let o = QH.pos.get(id);
    if (!o) {                                                              // households start side by side round a circle, then settle
      const an = (p.house / P.houses.length) * 6.283 + (i++ % 3) * .12, rr = 120 + Math.sqrt(n) * 22 + (st === 'k' ? 0 : 60);
      o = { x: Math.cos(an) * rr + (R() - .5) * 30, y: Math.sin(an) * rr + (R() - .5) * 30, vx: 0, vy: 0, k: 1, kv: 0 };
      QH.pos.set(id, o);
    }
    const nd = { id, p, st, r: qhRadius(p, st), o }; nodes.push(nd); byId.set(id, nd);
  }
  const edges = [], seen = new Set();
  for (const nd of nodes) for (const l of nd.p.links) {
    const b = byId.get(l.to); if (!b) continue;
    const key = Math.min(nd.id, l.to) + '-' + Math.max(nd.id, l.to); if (seen.has(key)) continue; seen.add(key);
    if (nd.st !== 'k' && b.st !== 'k') continue;                           // a tie is only known through someone met
    edges.push({ a: nd, b, rel: l.rel, kin: nd.p.house === b.p.house });
  }
  return { nodes, edges, byId };
}
let QHG = null;
function qhStep(dt) {
  const G = QHG; if (!G) return;
  const F = QH.focus !== null ? G.byId.get(QH.focus) : null, near = new Set();
  if (F) for (const e of G.edges) { if (e.a === F) near.add(e.b.id); if (e.b === F) near.add(e.a.id); }
  const N = G.nodes;
  for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {    // bubbles push each other apart
    const a = N[i].o, b = N[j].o; let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
    if (d2 < 1) { dx = R() - .5; dy = R() - .5; d2 = 1; }
    const d = Math.sqrt(d2), min = N[i].r * a.k + N[j].r * b.k + 14;
    let f = 2600 / d2; if (d < min) f += (min - d) * .6;
    a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f;
  }
  for (const e of G.edges) {                                               // the strings
    const a = e.a.o, b = e.b.o, dx = b.x - a.x, dy = b.y - a.y, d = Math.max(1, Math.hypot(dx, dy));
    const hot = F && (e.a === F || e.b === F);
    const rest = hot ? 105 + e.a.r * e.a.o.k + e.b.r : e.kin ? 60 : 120, k = hot ? .09 : e.kin ? .05 : .02;
    const f = (d - rest) * k; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
  }
  for (const nd of N) {
    const o = nd.o, focus = F === nd;
    const g = focus ? .12 : F && !near.has(nd.id) ? .002 : .006;               // the one tapped is drawn to the middle
    o.vx -= o.x * g; o.vy -= o.y * g;
    if (QH.drag && QH.drag.node === nd) { o.vx = o.vy = 0; continue; }
    o.vx *= .82; o.vy *= .82; o.x += o.vx * dt * 30; o.y += o.vy * dt * 30;
    if (focus) { const k = Math.min(1, dt * 5); o.x -= o.x * k; o.y -= o.y * k; }   // glides to the middle
    const want = focus ? 1.7 : F && near.has(nd.id) ? 1.12 : 1;               // and swells, springy
    o.kv += (want - o.k) * 18 * dt; o.kv *= Math.pow(.0008, dt); o.k += o.kv * dt * 6;   // springy, but only a little
  }
}
function qhDraw() {
  const cv2 = $('#qhCv'); if (!cv2 || !QHG) return;
  const d = devicePixelRatio || 1, cw = Math.round(cv2.clientWidth * d), ch = Math.round(cv2.clientHeight * d);
  if (cw && (cv2.width !== cw || cv2.height !== ch)) { cv2.width = cw; cv2.height = ch; }   // follows the sheet's size (it may have been hidden or narrow when made)
  const g = cv2.getContext('2d'), W = cv2.width, H = cv2.height, C = QH.cam;
  const F = QH.focus !== null ? QHG.byId.get(QH.focus) : null, near = new Set();
  if (F) for (const e of QHG.edges) { if (e.a === F) near.add(e.b.id); if (e.b === F) near.add(e.a.id); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fbf7ee'; g.fillRect(0, 0, W, H);
  g.setTransform(d * C.s, 0, 0, d * C.s, W / 2 + C.x * d, H / 2 + C.y * d);
  // strings: dashed and soft; the tapped one's bold, solid, with what the tie is
  for (const e of QHG.edges) {
    const hot = F && (e.a === F || e.b === F), fade = F && !hot;
    g.globalAlpha = fade ? .12 : hot ? 1 : .55; g.strokeStyle = C4_RELS[e.rel].col; g.lineWidth = (hot ? 3.4 : e.kin ? 2 : 1.4) / Math.sqrt(C.s);
    g.setLineDash(hot ? [] : [5, 4]); g.beginPath(); g.moveTo(e.a.o.x, e.a.o.y); g.lineTo(e.b.o.x, e.b.o.y); g.stroke();
  }
  g.setLineDash([]); g.globalAlpha = 1;
  // bubbles: the faded ones first, the tapped one last (on top)
  const order = [...QHG.nodes].sort((a, b) => (a === F) - (b === F) || near.has(a.id) - near.has(b.id));
  for (const nd of order) {
    const o = nd.o, r = nd.r * o.k, fade = F && nd !== F && !near.has(nd.id), f = SAVE4.folk[nd.id];
    g.globalAlpha = fade ? .16 : 1;
    if (nd === F) { g.fillStyle = 'rgba(201,138,28,.25)'; g.beginPath(); g.arc(o.x, o.y, r + 10, 0, 6.283); g.fill(); }
    if (nd.st === 'k' || nd.st === 'seen') {
      const im = c4FaceImg(nd.p);
      g.save(); g.beginPath(); g.arc(o.x, o.y, r, 0, 6.283); g.clip(); g.fillStyle = '#f6f0e2'; g.fill();
      if (im.complete && im.naturalWidth) g.drawImage(im, o.x - r, o.y - r, r * 2, r * 2); g.restore();
      g.lineWidth = nd.st === 'k' ? 3 : 2; g.setLineDash(nd.st === 'k' ? [] : [4, 3]);
      g.strokeStyle = nd.st === 'k' ? (f.a >= C4_RUOT ? '#c0567a' : f.a >= 60 ? '#2f6a4c' : f.a >= 35 ? '#c98a1c' : '#a3332a') : '#8a7a5a';
      g.beginPath(); g.arc(o.x, o.y, r, 0, 6.283); g.stroke(); g.setLineDash([]);
    } else {
      g.fillStyle = '#d9cdb2'; g.strokeStyle = '#8a7a5a'; g.lineWidth = 1.6; g.setLineDash([3, 3]);
      g.beginPath(); g.arc(o.x, o.y, r, 0, 6.283); g.fill(); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#5a4a32'; g.font = `900 ${Math.round(r)}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', o.x, o.y + 1);
    }
    // the name under the bubble (strangers only once someone has named them)
    const name = nd.st === 'q' ? '' : nd.p.name;
    if (name && !fade && (C.s > .55 || nd === F || near.has(nd.id) || nd.st === 'k' && nd.r > 24)) {
      const fs = nd === F ? 15 : 11; g.font = `${nd.st === 'k' ? 700 : 400} ${fs}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'top';
      g.lineWidth = 3; g.strokeStyle = '#fbf7ee'; g.strokeText(name, o.x, o.y + r + 3); g.fillStyle = nd.st === 'k' ? '#1d1915' : '#6a5a3a'; g.fillText(name, o.x, o.y + r + 3);
    }
  }
  g.globalAlpha = 1;
  // what each of the tapped one's ties is, on top of everything
  if (F) for (const e of QHG.edges) if (e.a === F || e.b === F) {
    const mx = (e.a.o.x + e.b.o.x) / 2, my = (e.a.o.y + e.b.o.y) / 2, t = C4_RELS[e.rel].name;
    g.font = '700 11px "Be Vietnam Pro", sans-serif'; const w = g.measureText(t).width + 10;
    g.fillStyle = '#fbf7ee'; g.fillRect(mx - w / 2, my - 8, w, 16); g.fillStyle = C4_RELS[e.rel].col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, mx, my + 1);
  }
}
function qhLoop(t) {
  if (!$('#qhCv') || $('#c4note').hidden) { QH.raf = 0; return; }
  const dt = Math.min(.05, (t - (QH.last || t)) / 1000) || .016; QH.last = t;
  qhStep(dt); qhDraw();
  QH.raf = requestAnimationFrame(qhLoop);
}
function qhFit() {                                                          // zoom to show every bubble
  if (!QHG || !QHG.nodes.length) return;
  const cv2 = $('#qhCv'); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const nd of QHG.nodes) { x0 = Math.min(x0, nd.o.x - nd.r); x1 = Math.max(x1, nd.o.x + nd.r); y0 = Math.min(y0, nd.o.y - nd.r); y1 = Math.max(y1, nd.o.y + nd.r + 14); }
  const w = cv2.clientWidth, h = cv2.clientHeight, s = Math.min(1.6, Math.max(.25, Math.min(w / (x1 - x0 + 40), h / (y1 - y0 + 40))));
  Object.assign(QH.cam, { s, x: -(x0 + x1) / 2 * s, y: -(y0 + y1) / 2 * s });
}
function qhHit(px, py) {                                                    // which bubble is under this point (canvas px)
  const cv2 = $('#qhCv'), C = QH.cam, x = (px - cv2.clientWidth / 2 - C.x) / C.s, y = (py - cv2.clientHeight / 2 - C.y) / C.s;
  let best = null, bd = 1e9;
  for (const nd of QHG.nodes) { const d = Math.hypot(nd.o.x - x, nd.o.y - y); if (d < nd.r * nd.o.k + 6 && d < bd) { bd = d; best = nd; } }
  return { node: best, x, y };
}
function qhWire() {
  const cv2 = $('#qhCv'); if (!cv2) return;
  const d = devicePixelRatio || 1; cv2.width = cv2.clientWidth * d; cv2.height = cv2.clientHeight * d;
  const pt = e => { const r = cv2.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv2.addEventListener('pointerdown', e => {
    cv2.setPointerCapture(e.pointerId); const [x, y] = pt(e); QH.ptrs.set(e.pointerId, [x, y]);
    if (QH.ptrs.size === 2) { const [a, b] = [...QH.ptrs.values()]; QH.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: QH.cam.s }; QH.drag = null; return; }
    const h = qhHit(x, y); QH.drag = { node: h.node, x, y, cx: QH.cam.x, cy: QH.cam.y, moved: false };
  });
  cv2.addEventListener('pointermove', e => {
    if (!QH.ptrs.has(e.pointerId)) return; const [x, y] = pt(e); QH.ptrs.set(e.pointerId, [x, y]);
    if (QH.pinch && QH.ptrs.size === 2) { const [a, b] = [...QH.ptrs.values()]; QH.cam.s = Math.max(.25, Math.min(2.5, QH.pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / QH.pinch.d)); return; }
    const D = QH.drag; if (!D) return;
    if (Math.hypot(x - D.x, y - D.y) > 6) D.moved = true;
    if (!D.moved) return;
    if (D.node) { const h = qhHit(x, y); D.node.o.x = h.x; D.node.o.y = h.y; }
    else { QH.cam.x = D.cx + x - D.x; QH.cam.y = D.cy + y - D.y; }
  });
  const up = e => {
    QH.ptrs.delete(e.pointerId); if (QH.ptrs.size < 2) QH.pinch = null;
    const D = QH.drag; QH.drag = null; if (!D || D.moved) return;
    AU.tap(); qhFocus(D.node ? D.node.id : null);
  };
  cv2.addEventListener('pointerup', up); cv2.addEventListener('pointercancel', up);
  cv2.addEventListener('wheel', e => { e.preventDefault(); QH.cam.s = Math.max(.25, Math.min(2.5, QH.cam.s * (e.deltaY < 0 ? 1.12 : .89))); }, { passive: false });
  $('#c4noteB').querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => { AU.tap(); const z = b.dataset.zoom; if (z === 'fit') qhFit(); else QH.cam.s = Math.max(.25, Math.min(2.5, QH.cam.s * (z === '+' ? 1.25 : .8))); }));
  if (!QH.raf) { QH.last = 0; QH.raf = requestAnimationFrame(qhLoop); }
}
function qhFocus(id) {
  QH.focus = id;
  if (id !== null) { const nd = QHG.byId.get(id); if (nd) { nd.o.kv += .8; Object.assign(QH.cam, { x: 0, y: 0, s: Math.max(QH.cam.s, .9) }); } }
  const c = $('#qhCard'); if (c) { c.innerHTML = qhCardHtml(id); qhCardWire(); }
}
// the web tab's html: the canvas, its zoom buttons, the legend of strings, and the card of whoever is tapped
function c4WebTab() {
  QHG = qhBuild();
  if (!QHG.nodes.length) return '<p>Chưa quen ai. Khách ghé mua lần thứ hai mới thành quen.</p>';
  const rels = [...new Set(QHG.edges.map(e => e.rel))];
  return `<p class="qhhint">Chạm vào một người để xem kỹ · kéo để xem chỗ khác · hai ngón để phóng to</p>
    <div class="qhwrap"><canvas id="qhCv"></canvas><div class="qhz"><button data-zoom="+">+</button><button data-zoom="-">−</button><button data-zoom="fit" title="Xem cả làng">⤢</button></div></div>
    <div class="legend">${rels.map(r => `<span><i style="background:${C4_RELS[r].col}"></i>${C4_RELS[r].name}</span>`).join('')}<span><i class="q"></i>chưa quen</span></div>
    <div id="qhCard">${qhCardHtml(QH.focus)}</div>`;
}
function c4WebOpened(first) { qhWire(); if (first) qhFit(); qhCardWire(); }

/* ---------- the card ---------- */
function qhCardHtml(id) {
  const P = c4People();
  if (id === null || id === undefined) {                                     // nothing tapped: who matters most, who is still a stranger
    const known = P.list.filter(p => c4Known(p.id)).sort((a, b) => c4Imp(b) - c4Imp(a)).slice(0, 4);
    const strangers = QHG ? QHG.nodes.filter(n => n.st === 'q' || n.st === 'heard').length : 0;
    return `<div class="qhc"><h4>Nên lấy lòng ai?</h4><div class="qhtop">${known.map(p => `<button data-qf="${p.id}"><img src="${c4Face(p)}" alt=""><b>${p.name}</b><span>${c4Badges(p)[0] ? c4Badges(p)[0][0] : C4_TRAITS[p.trait].name}</span></button>`).join('')}</div>
      <p class="sm">Bong bóng càng to là người càng có tiếng nói trong làng. ${strangers ? `Còn <b>${strangers}</b> người (dấu ?) có họ hàng, bạn bè với khách quen mà mình chưa quen: chạm vào họ để biết cách làm quen.` : ''}</p></div>`;
  }
  const p = P.list[id], f = SAVE4.folk[id] || {}, hs = P.houses[p.house], T = C4_TRAITS[p.trait], day = SAVE4.day;
  const addr = `${hs.xom} · ${p.as === 'chủ nhà' ? 'chủ ' + hs.name : p.as + ' ' + hs.name}`;
  const tie = (l, q) => { const k = c4Known(q.id), h = c4Heard(q.id);
    return `<li><i style="background:${C4_RELS[l.rel].col}"></i>${C4_RELS[l.rel].name}: ${k ? `<button class="lk" data-qf="${q.id}">${q.name}</button> <small>${C4_STAR(SAVE4.folk[q.id].a)}</small>` : h ? `<button class="lk unk" data-qf="${q.id}">${q.name}</button> <small>chưa quen</small>` : '<span class="unk">??? chưa biết là ai</span>'}</li>`; };
  if (c4Known(id)) {
    const facts = [...(f.facts || []), ...SAVE4.notes.filter(n => n.text.includes(p.name)).map(n => n.text)];
    const buy = SAVE4.day >= C4_BOOK_DAY && C4.phase === 'open', unknownTies = p.links.filter(l => !c4Heard(l.to)).length;
    return `<div class="qhc"><div class="who"><img src="${c4Face(p)}" alt=""><div><h4>${p.name}</h4><p class="st">${C4_STAR(f.a)} <b>${c4LikeWord(f.a)}</b></p><p>${addr}<br>nghề ${p.job} · ghé quán ${f.v || 0} lần</p></div></div>
      <div class="badges">${c4Badges(p).map(([t, c]) => `<span style="border-color:${c};color:${c}">${t}</span>`).join('')}</div>
      <h5>Thói quen</h5><ul class="hab"><li>⏰ Hay ra chợ <b>${c4Span(p.hour)}</b></li><li>♥ Thích <b>${C4_FAV_WORD[p.fav]}</b></li><li>🪙 Tiền nong: <b>${p.purse}</b></li></ul>
      <h5>Tính nết</h5><p><b>${T.name}:</b> ${T.desc}</p>
      <h5>Quan hệ (${p.links.length})</h5><ul class="ties">${p.links.map(l => tie(l, P.list[l.to])).join('') || '<li>Chẳng quen biết ai.</li>'}</ul>
      ${facts.length ? `<h5>Điều đã biết (${facts.length})</h5><ul class="facts">${facts.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      ${f.deal ? `<p class="back">Lần tới ghé: ${f.deal === 'free' ? 'mời miễn phí' : 'giảm nửa giá'}.</p>` : ''}
      <div class="acts">
        <button class="act g" data-act="moi" ${!buy || f.inv === day || c4Invited() >= C4_INVITES ? 'disabled' : ''}><b>Mời ghé</b><span>${f.inv === day ? 'đã mời' : `còn ${C4_INVITES - c4Invited()} lượt hôm nay`}</span></button>
        <button class="act o" data-act="tea" ${f.tea === day || SAVE4.money < 3 ? 'disabled' : ''}><b>Mời nước</b><span>${f.tea === day ? 'đã mời hôm nay' : '3<i class=\"ic4 coin\"></i> · thêm thân'}</span></button>
        <button class="act b" data-act="ask" ${f.ask === day || !unknownTies || f.a < 35 ? 'disabled' : ''}><b>Hỏi chuyện nhà</b><span>${!unknownTies ? 'đã biết hết' : f.a < 35 ? 'chưa đủ thân' : f.ask === day ? 'mai hỏi tiếp' : `còn ${unknownTies} người chưa biết`}</span></button>
      </div>
      <div class="row col"><button class="btn alt" data-act="half" ${!buy || f.deal ? 'disabled' : ''}>Lần tới giảm nửa giá</button><button class="btn alt" data-act="free" ${!buy || f.deal ? 'disabled' : ''}>Lần tới mời miễn phí</button><button class="btn alt" data-house="${p.house}">Xem gia phả ${hs.name}</button></div></div>`;
  }
  // not met yet: how they are tied to the folk you know, and who could bring them along
  const via = p.links.filter(l => c4Known(l.to)).map(l => [l, P.list[l.to]]);
  const named = c4Heard(id), introBy = via.filter(([l, q]) => l.rel !== 'ghet' && SAVE4.folk[q.id].a >= 50);
  const seen = f.seen && !f.k;
  return `<div class="qhc"><div class="who">${named ? `<img src="${c4Face(p)}" alt="">` : '<i class="qq">?</i>'}<div><h4>${named ? p.name : 'Chưa biết là ai'}</h4><p>${seen ? (C4_TRAITS[p.trait].meet ? `người khó gần: đã ghé ${f.v}/${C4_TRAITS[p.trait].meet} lần mới chịu bắt chuyện` : 'mới ghé quán 1 lần: ghé thêm lần nữa là quen') : 'chưa quen'}${named ? `<br>${addr}` : ''}</p></div></div>
    <h5>Quen ai trong sổ</h5><ul class="ties">${via.map(([l, q]) => `<li><i style="background:${C4_RELS[l.rel].col}"></i>${C4_RELS[l.rel].name} của <button class="lk" data-qf="${q.id}">${q.name}</button> <small>${C4_STAR(SAVE4.folk[q.id].a)}</small></li>`).join('') || '<li>—</li>'}</ul>
    ${named ? (introBy.length
      ? `<div class="acts"><button class="act g" data-intro="${introBy[0][1].id}" ${f.intro === day || C4.phase !== 'open' ? 'disabled' : ''}><b>Nhờ ${introBy[0][1].name} giới thiệu</b><span>${f.intro === day ? 'đã nhờ hôm nay' : C4.phase !== 'open' ? 'chỉ nhờ được lúc chợ họp' : 'họ sẽ rủ người này ra chợ'}</span></button></div>`
      : `<p class="sm">Muốn được giới thiệu, hãy lấy lòng ${via.map(([, q]) => q.name).join(', ')} (thân từ 3 sao trở lên).</p>`)
      : `<p class="sm">Thân với ${via.map(([, q]) => q.name).join(', ')} rồi <b>Hỏi chuyện nhà</b> để biết người này là ai.</p>`}</div>`;
}
function qhCardWire() {
  const box = $('#qhCard'); if (!box) return;
  box.querySelectorAll('[data-qf]').forEach(b => b.addEventListener('click', () => { AU.tap(); qhFocus(+b.dataset.qf); $('#qhCv').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }));
  box.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => c4Act(QH.focus, b.dataset.act)));
  box.querySelectorAll('[data-house]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_HOUSE = +b.dataset.house; c4OpenNotes('nha'); }));
  box.querySelectorAll('[data-intro]').forEach(b => b.addEventListener('click', () => {
    const P = c4People(), q = P.list[QH.focus], by = P.list[+b.dataset.intro], f = c4F(q.id);
    f.intro = SAVE4.day; f.ref = true; (C4.expect = C4.expect || []).push(q.id);
    toast(`${c4Cap1(by.name)} hứa sẽ rủ ${q.name} ra chợ ghé quán.`, 3); AU.pluck(84); persist4(); qhFocus(q.id);
  }));
}
const C4_ACT_DONE = {
  tea: (p, f) => { C4.today.tea = (C4.today.tea || 0) + 1; SAVE4.money -= 3; f.tea = SAVE4.day; c4Bump(p.id, 6 * C4_TRAITS[p.trait].gain); toast(`Mời ${p.name} chén nước chè, chuyện trò vui vẻ.`, 2.6); },
  ask: (p, f) => {
    const P = c4People(), cand = p.links.filter(l => !c4Heard(l.to)); if (!cand.length) return;
    const l = c4Pick(cand), q = P.list[l.to]; c4F(q.id).heard = SAVE4.day; f.ask = SAVE4.day; C4.today.ask = (C4.today.ask || 0) + 1;
    const line = `${c4Cap1(p.name)} kể: ${q.name} (${P.houses[q.house].xom}) là ${C4_RELS[l.rel].name} với mình, hay ra chợ ${c4Span(q.hour)}.`;
    (f.facts = f.facts || []).push(line); toast(line, 4);
  },
};

/* ---------- Gia phả: households, and one household's family tree ---------- */
let C4_HOUSE = null;
function c4HousesTab() {
  const P = c4People();
  if (C4_HOUSE !== null) return c4TreeHtml(P.houses[C4_HOUSE]);
  const hs = P.houses.filter(h => h.members.some(c4Heard));
  return hs.length ? `<p class="qhhint">Chạm vào một nhà để xem cây gia phả</p><div class="houses">${hs.map(h => { const n = h.members.filter(c4Known).length;
    return `<button class="hz" data-house="${h.id}"><b>${h.name}</b><span>${h.xom} · ${n}/${h.members.length} đã quen</span><div>${h.members.map(id => c4Known(id) ? `<img src="${c4Face(P.list[id])}" alt="">` : '<i>?</i>').join('')}</div></button>`; }).join('')}</div>`
    : '<p>Chưa quen ai.</p>';
}
function c4TreeHtml(h) {
  const P = c4People(), ms = h.members.map(id => P.list[id]), rel = (a, b) => (a.links.find(l => l.to === b.id) || {}).rel;
  // the older generation: the elders, or (with none) the couple whose children live with them
  const parentNoOld = p => !ms.some(q => q.role === 'old') && (p.as === 'chủ nhà' || p.as === 'vợ') && ms.some(q => q.id !== p.id && rel(p, q) === 'cc');
  const old = ms.filter(p => p.role === 'old' || parentNoOld(p)), young = ms.filter(p => !old.includes(p));
  // rows: the elders (a couple side by side), then the younger ones, each with their spouse beside them
  const row2 = []; const done = new Set();
  for (const p of young) { if (done.has(p.id)) continue; done.add(p.id); row2.push(p); const sp = young.find(q => !done.has(q.id) && rel(p, q) === 'vc'); if (sp) { done.add(sp.id); row2.push(sp); } }
  const rows = old.length ? [old, row2] : [row2];
  const W = 340, R = 26, gapY = 120, pos = new Map();
  rows.forEach((row, i) => { const n = row.length, step = Math.min(110, (W - 40) / Math.max(1, n)); row.forEach((p, j) => pos.set(p.id, [W / 2 + (j - (n - 1) / 2) * step, 50 + i * gapY])); });
  const Hh = 50 + (rows.length - 1) * gapY + 70;
  let lines = '';
  for (const a of ms) for (const l of a.links) {
    const b = P.list[l.to]; if (b.house !== h.id || a.id > b.id) continue;
    const [x1, y1] = pos.get(a.id), [x2, y2] = pos.get(b.id), col = C4_RELS[l.rel].col;
    if (l.rel === 'cc' && Math.abs(y1 - y2) > 10) {                     // a child hangs from the middle of the couple above
      const [up, dn] = y1 < y2 ? [a, b] : [b, a], [ux, uy] = pos.get(up.id), [dx, dy] = pos.get(dn.id);
      const mate = ms.find(q => q.id !== up.id && rel(up, q) === 'vc' && pos.get(q.id)[1] === uy && rel(q, dn) === 'cc');
      if (mate && mate.id < up.id) continue;                               // drawn once, from the couple
      const sx = mate ? (ux + pos.get(mate.id)[0]) / 2 : ux, ym = (uy + dy) / 2;
      lines += `<path d="M${sx} ${mate ? uy : uy + R} V${ym} H${dx} V${dy - R}" fill="none" stroke="${col}" stroke-width="2.5"/>`;
    }
    else if (l.rel === 'dau') continue;
    else lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${l.rel === 'vc' ? 4 : 2.5}" ${l.rel === 'ae' ? 'stroke-dasharray="5 4"' : ''}/>`;
  }
  let nodes = '';
  for (const p of ms) {
    const [x, y] = pos.get(p.id), k = c4Known(p.id), hd = c4Heard(p.id), f = SAVE4.folk[p.id];
    nodes += `<g class="tn" data-qf="${p.id}">` + (k || hd ? `<clipPath id="tc${p.id}"><circle cx="${x}" cy="${y}" r="${R}"/></clipPath><image href="${c4Face(p)}" x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" clip-path="url(#tc${p.id})" opacity="${k ? 1 : .55}"/>` : `<circle cx="${x}" cy="${y}" r="${R}" fill="#d9cdb2"/><text x="${x}" y="${y + 7}" text-anchor="middle" class="qm">?</text>`)
      + `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${k ? (f.a >= 60 ? '#2f6a4c' : f.a >= 35 ? '#c98a1c' : '#a3332a') : '#8a7a5a'}" stroke-width="3" ${k ? '' : 'stroke-dasharray="4 3"'}/>`
      + `<text x="${x}" y="${y + R + 15}" text-anchor="middle" class="nm">${k || hd ? p.name : '???'}</text><text x="${x}" y="${y + R + 29}" text-anchor="middle" class="as">${p.as}${k ? ' · ' + C4_STAR(f.a) : ''}</text></g>`;
  }
  return `<button class="btn alt bk" data-houses>← Các nhà</button><h4 class="tt">${h.name} · ${h.xom}</h4>
    <svg class="tree" viewBox="0 0 ${W} ${Hh}">${lines}${nodes}</svg><p class="qhhint">Chạm vào ai để xem kỹ người đó</p>`;
}
function c4HousesWire() {
  const B = $('#c4noteB');
  B.querySelectorAll('[data-house]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_HOUSE = +b.dataset.house; c4OpenNotes('nha'); }));
  B.querySelectorAll('[data-houses]').forEach(b => b.addEventListener('click', () => { AU.tap(); C4_HOUSE = null; c4OpenNotes('nha'); }));
  B.querySelectorAll('.tn[data-qf]').forEach(b => b.addEventListener('click', () => { AU.tap(); c4OpenWho(+b.dataset.qf); }));
}
// open the web on one person (from Khách quen, Gia phả, …)
function c4OpenWho(id) { QH.focus = id; c4OpenNotes('web'); const nd = QHG && QHG.byId.get(id); if (nd) { nd.o.kv += .8; Object.assign(QH.cam, { x: 0, y: 0, s: 1 }); } }
